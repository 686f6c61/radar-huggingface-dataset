# Ruurd/BYOD-Ministral-8B

## Resumen

BYOD-Ministral-8B es un modelo de lenguaje de difusión discreta enmascarada (masked discrete diffusion) publicado por el usuario Ruurd en Hugging Face. Se construye a partir de mistralai/Ministral-8B-Instruct-2410 mediante adaptadores LoRA de rango 1024 entrenados sobre las proyecciones query y value, que convierten un transformer decoder autorregresivo en un modelo capaz de denoising bidireccional: en lugar de predecir el siguiente token, el modelo parte de una secuencia con posiciones enmascaradas (token de máscara `<?>`) y las predice en paralelo, refinando iterativamente la respuesta. El repositorio contiene el checkpoint `best` exacto del experimento `ministral-8b-mask`, no una variante cuantizada a 4 bits.

El interés de este modelo es metodológico más que de producto. El autor indica que el adaptador puede fusionarse con el modelo base tras el entrenamiento, de modo que el incremento de parámetros es temporal y el modelo fusionado conserva el mismo recuento de parámetros que el original. Es decir, la conversión de un modelo autorregresivo de 8 000 millones de parámetros en un modelo de difusión no requiere cambiar la arquitectura subyacente, solo un adaptador que se puede integrar después.

Se trata de un modelo de investigación con 0 descargas y 0 likes en el momento de redactar esta ficha, con licencia MRL-0.1 (Mistral Research License) heredada del modelo base y sin resultados de benchmarks publicados. El método de muestreo no es el `generate()` causal estándar: requiere el código de inferencia bidireccional del repositorio `lad-generic` del propio autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder adaptado a difusión discreta enmascarada (denoising bidireccional) mediante LoRA sobre el modelo base |
| Parámetros totales | Aproximadamente 8 000 millones (heredados de mistralai/Ministral-8B-Instruct-2410); el autor indica que el modelo fusionado mantiene el mismo recuento que el base |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada. El modelo base Ministral-8B-Instruct-2410 declara 128 000 tokens según la documentación de Mistral AI, pero la model card de este adaptador no lo confirma |
| Tipos de cuantización | No especificados. El autor indica explícitamente que el repositorio contiene el checkpoint completo y no una variante cuantizada; el código de inferencia acepta `quantization="none"`. No se publican pesos GGUF, GPTQ ni AWQ |
| Idiomas soportados | No disponible |
| Licencia | mrl-0.1 (Mistral Research License 0.1), heredada del modelo base |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el repositorio ocupa 2,0 GB e incluye `resolved_config.json` |
| Librería | peft |
| Pipeline | text-generation |
| Token de máscara | `<?>` |
| Configuración de entrenamiento | Máximo de 25 000 actualizaciones del optimizador; LoRA de rango 1024 sobre proyecciones query y value |

## Arquitectura y entrenamiento

El modelo parte de Ministral-8B-Instruct-2410, un transformer decoder autorregresivo, y lo adapta al paradigma de difusión discreta enmascarada. El método consiste en entrenar adaptadores LoRA de rango 1024 sobre las proyecciones query y value, de forma que el modelo aprende a predecir posiciones enmascaradas de forma bidireccional en lugar de predecir únicamente el siguiente token. Durante la inferencia, el modelo arranca con la respuesta completamente enmascarada con el token `<?>` y refina iterativamente el texto, desenmascarando posiciones de forma guiada por confianza.

El repositorio conserva la configuración exacta del experimento `ministral-8b-mask` en `resolved_config.json`. Según el autor, el entrenamiento realizó como máximo 25 000 actualizaciones del optimizador. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; el adaptador hereda el alineamiento del modelo base Instruct. La innovación destacable es que el adaptador se puede fusionar con el modelo base, de modo que el coste en parámetros es transitorio y el modelo resultante conserva el tamaño original.

El muestreo requiere el código del repositorio `lad-generic`, que expone funciones como `load_hub_adapter_session` y `denoise` con parámetros de control específicos del proceso de difusión: `max_new_tokens`, `num_steps`, `noise_level`, `temperature`, `top_k`, `seed`, `permanent_unmask`, `confidence_guided`, `proportional_unmask`, `confidence_eos_eot_inf` y `block_length`. El ejemplo publicado por el autor usa 128 tokens nuevos, 64 pasos de denoising, `noise_level=1.0`, `temperature=0.7`, `top_k=3` y `block_length=128`.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como `conversational` y `text-generation`, y el ejemplo del autor usa un `system_prompt` de asistente genérico.
- Generación por denoising iterativo: produce la respuesta refinando en paralelo posiciones enmascaradas, no token a token.
- Rellenado y predicción de posiciones enmascaradas (masked infilling), una capacidad que los modelos autorregresivos no ofrecen de forma nativa.
- Control fino del proceso de generación mediante parámetros de desenmascaramiento (`confidence_guided`, `proportional_unmask`, `permanent_unmask`), lo que permite experimentar con distintas políticas de remasking.
- Razonamiento, código y matemáticas: no hay información explícita en la model card; estas capacidades se heredan del modelo base Ministral-8B-Instruct-2410, pero no están verificadas por el autor para esta conversión.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Capacidades especiales: modo de denoising bidireccional con seed reproducible; no se declaran capacidades de visión ni de audio.
- El método `generate()` causal estándar no es el sampler previsto y no debe usarse según el autor.

## Casos de uso

- Investigación en modelos de difusión para lenguaje: el modelo permite comparar directamente un transformer autorregresivo convertido a difusión discreta contra su versión original, aislando el efecto del paradigma de generación con los mismos pesos de base.
- Generación con relleno de huecos (infilling): al predecir posiciones enmascaradas en paralelo, resulta adecuado para completar fragmentos de texto con restricciones de posición, algo que un decoder causal no puede hacer sin reformular el prompt.
- Experimentación con políticas de desenmascaramiento: los parámetros `confidence_guided`, `proportional_unmask` y `permanent_unmask` permiten estudiar cómo afecta cada estrategia de remasking a la calidad y a la diversidad del texto generado en un modelo de 8 000 millones de parámetros.
- Generación con presupuesto de pasos controlado: al fijar `num_steps` de forma independiente al número de tokens, se puede estudiar el compromiso entre número de pasos de denoising y calidad de salida, útil en investigación sobre eficiencia de decodificación.
- Reproducibilidad de experimentos académicos: la combinación de `seed`, configuración resuelta en `resolved_config.json` y checkpoint exacto hace viable replicar resultados en un entorno de laboratorio.
- Prototipado de decodificación paralela: sirve como banco de pruebas para evaluar si el desenmascaramiento por bloques (`block_length=128`) reduce el número de pasos respecto a la decodificación autorregresiva token a token.
- Docencia y divulgación sobre modelos de difusión discreta: el tamaño de 8 000 millones de parámetros y la disponibilidad en precisión completa en un espacio de ZeroGPU permiten demostraciones interactivas sin infraestructura dedicada.
- Cualquier uso en producción comercial queda condicionado por la licencia MRL-0.1 y por el estado de investigación del modelo; no se recomienda para decisiones de alto impacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y tampoco se aportan comparaciones cuantitativas frente al modelo base autorregresivo. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Requisitos de hardware

- VRAM estimada para el modelo fusionado de 8 000 millones de parámetros: aproximadamente 16 GB en fp16/bf16, en torno a 8-9 GB en cuantización de 8 bits y alrededor de 5-6 GB en 4 bits.
- Para el adaptador sin fusionar hay que sumar la memoria del modelo base más la del adaptador (rango 1024 sobre query y value); el repositorio del adaptador ocupa 2,0 GB, aunque el autor no especifica la precisión de almacenamiento.
- GPU recomendadas: A100 (40 o 80 GB), H100 y GPU con 24 GB o más como la RTX 4090 o la RTX 3090 pueden ejecutar el modelo fusionado en fp16.
- GPU de consumo: sí cabe en GPU de consumo de gama alta. Con 24 GB (RTX 3090, 4090) se puede usar fp16; con 16 GB (RTX 4080, 4060 Ti 16 GB) es necesario recurrir a cuantización de 8 o 4 bits. El autor no publica requisitos mínimos.
- Opciones de despliegue: el autor proporciona código propio de inferencia bidireccional en el repositorio `lad-generic` (`diffusion_lm.inference`), con `quantization="none"` en el ejemplo. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, ya que estos motores implementan decodificación autorregresiva y no el sampler de difusión; tampoco se publican pesos GGUF.
- Latencia y throughput: no disponible. Cualitativamente, el ejemplo del autor ejecuta 64 pasos de denoising para 128 tokens nuevos, por lo que el número de pasadas hacia delante depende de `num_steps` y no del número de tokens, a diferencia de la decodificación autorregresiva. No hay mediciones publicadas.
- Existe una demo en ZeroGPU en precisión completa: https://huggingface.co/spaces/Ruurd/byod-ministral-8b

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Paradigma de generación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BYOD-Ministral-8B | ~8 000 M (adaptador fusionable) | No disponible en la model card | Difusión discreta enmascarada con sampler propio | mrl-0.1 | Adaptador PEFT en safetensors; requiere código propio |
| mistralai/Ministral-8B-Instruct-2410 (base) | ~8 000 M | 128 000 tokens según Mistral AI | Autorregresivo causal | mrl-0.1 | Pesos completos en Hugging Face; puede requerir aceptar licencia y token |
| Llama-3.1-8B-Instruct | ~8 000 M | 128 000 tokens | Autorregresivo causal | Licencia comunitaria de Llama 3.1 | Amplia disponibilidad, múltiples cuantizaciones y soporte en vLLM, llama.cpp y Ollama |
| Qwen2.5-7B-Instruct | ~7 600 M | 128 000 tokens | Autorregresivo causal | Apache 2.0 | Amplia disponibilidad, ecosistema extenso de cuantizaciones |

No se dispone de datos de benchmarks para BYOD-Ministral-8B ni de comparaciones publicadas por el autor frente a estas alternativas, por lo que la comparación se limita a especificaciones y régimen de licencia. Los datos de contexto y parámetros del modelo base y de las alternativas provienen de la documentación pública de sus respectivos desarrolladores, no de la información de este repositorio.

## Limitaciones y advertencias

- Modelo de investigación: el propio autor lo etiqueta como tal y advierte de que puede producir texto inexacto, repetitivo, sesgado o inseguro.
- No debe usarse para decisiones de alto impacto sin verificación independiente.
- Hereda las limitaciones del modelo base y de sus datasets, incluidos los sesgos presentes en ellos.
- La licencia mrl-0.1 (Mistral Research License 0.1) es restrictiva: el uso comercial requiere revisar los términos y, con toda probabilidad, obtener una licencia aparte de Mistral AI. El adaptador queda sujeto a los términos del modelo base.
- El acceso al modelo base puede requerir aceptar su licencia y usar un token de Hugging Face.
- El método `generate()` autorregresivo estándar no es el sampler previsto; usarlo produce resultados incorrectos. Es necesario el código de `lad-generic`.
- No hay soporte declarado en motores de inferencia habituales (vLLM, TGI, llama.cpp, Ollama) ni pesos GGUF, lo que complica el despliegue en producción.
- No se publican datos de contexto, idiomas soportados, composición del dataset de entrenamiento ni evaluación de sesgos específica para esta conversión.
- Riesgo de alucinación no cuantificado: no hay benchmarks ni evaluaciones de fidelidad publicadas.
- La reproducibilidad depende de fijar `seed` y de la configuración de desenmascaramiento; los parámetros del sampler (`num_steps`, `noise_level`, `top_k`, `confidence_guided`) alteran sustancialmente la salida.
- Modelo muy reciente y sin validación de la comunidad: 0 descargas y 0 likes en el momento de la consulta.
- La fecha de creación registrada en Hugging Face (2026-09-19) es posterior a la fecha de esta consulta, dato que conviene verificar en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ruurd/BYOD-Ministral-8B
- Modelo base: https://huggingface.co/mistralai/Ministral-8B-Instruct-2410
- Demo en ZeroGPU: https://huggingface.co/spaces/Ruurd/byod-ministral-8b
- Código de inferencia bidireccional (lad-generic): https://github.com/RuurdKuiper/lad-generic
- Licencia MRL-0.1: https://mistral.ai/licenses/MRL-0.1.md
- Resultados de la búsqueda web: no se ha recuperado ningún enlace relevante sobre el modelo; los resultados devueltos corresponden a dominios de comercio electrónico sin relación con el contenido solicitado.
