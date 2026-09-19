# Ruurd/BYOD-Llama-3.1-8B

## Resumen

BYOD-Llama-3.1-8B es un modelo de lenguaje de difusión discreta enmascarada (masked discrete diffusion) creado por el usuario Ruurd a partir de meta-llama/Llama-3.1-8B-Instruct. La conversión no parte de un reentrenamiento completo: se entrenaron adaptadores LoRA de rango 1024 sobre las proyecciones query y value para que el transformer original, de naturaleza autorregresiva, aprenda a denoising bidireccional. El resultado predice en paralelo las posiciones enmascaradas de la respuesta y las refina de forma iterativa, en lugar de generar token a token de izquierda a derecha.

El repositorio contiene el checkpoint `best` del experimento `llama-3.1-8b-mask` en precisión completa (no es una variante cuantizada a 4 bits) y ocupa 1,8 GB, coherente con un adaptador PEFT en formato safetensors. El adaptador puede fusionarse con el modelo base tras el entrenamiento, de modo que el incremento de parámetros es temporal y el modelo fusionado mantiene el mismo recuento de parámetros que Llama 3.1 8B Instruct.

Su relevancia es fundamentalmente investigadora: es una muestra del enfoque BYOD (build your own diffusion) aplicado a un modelo de 8B ya existente, lo que permite estudiar decodificación no autorregresiva, refinamiento iterativo y muestreo con guiado por confianza sin entrenar un modelo desde cero. No es un modelo pensado para producción y su model card lo declara explícitamente como modelo de investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder de Llama 3.1 adaptado a difusión discreta enmascarada mediante LoRA (rango 1024 en proyecciones query y value) |
| Parámetros totales | 8 000 millones (modelo base); el adaptador LoRA añade parámetros de forma temporal hasta su fusión |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128 000 tokens en el modelo base Llama 3.1 8B Instruct; la model card del adaptador no confirma que se mantenga en el muestreo por difusión (el ejemplo de inferencia usa `block_length=128` y `max_new_tokens=128`) |
| Tipos de cuantización | el código de carga admite el parámetro `quantization` (el ejemplo usa `"none"`); no se detallan los formatos soportados |
| Idiomas soportados | no disponibles en la model card del adaptador |
| Licencia | Llama 3.1 Community License (hereda la del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Biblioteca | peft |
| Tamaño del repositorio | 1,8 GB |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct |
| Fecha de publicación en el Hub | 2026-09-19 |

## Arquitectura y entrenamiento

La innovación principal es el método de conversión. En lugar de entrenar un transformer de difusión desde cero, se congeló Llama 3.1 8B Instruct y se añadieron adaptadores LoRA con rango 1024 sobre las proyecciones query y value, de manera que la atención pueda operar de forma bidireccional sobre la secuencia a denoising. El entrenamiento está registrado con un máximo de 25 000 actualizaciones del optimizador y emplea el token de máscara `MASK`. La configuración exacta del experimento se distribuye en el repositorio como `resolved_config.json`. Al finalizar, el adaptador puede fusionarse con los pesos base, por lo que el modelo resultante conserva los 8 000 millones de parámetros del original.

En inferencia, el modelo no usa decodificación autorregresiva: predice simultáneamente las posiciones enmascaradas de la respuesta y las va refinando en pasos sucesivos. El código de referencia (`diffusion_lm.inference` dentro del proyecto `lad-generic`) expone parámetros como `num_steps`, `noise_level`, `temperature`, `top_k`, `block_length`, `permanent_unmask`, `confidence_guided`, `proportional_unmask` y `confidence_eos_eot_inf`. El ejemplo documentado usa 64 pasos de denoising con bloques de 128 tokens y `permanent_unmask=True`, lo que implica del orden de 64 pasadas de refinamiento sobre la secuencia, no una única pasada autoregresiva.

## Capacidades

- Generación de texto conversacional: el modelo base es una variante Instruct, por lo que el adaptador parte de esa capacidad y la reorienta a denoising bidireccional con `system_prompt` y `question`.
- Relleno y refinamiento iterativo: al predecir posiciones enmascaradas en paralelo, el muestreador es adecuado para tareas de infilling y revisión progresiva del texto.
- Control posicional del muestreo: parámetros como `permanent_unmask` permiten fijar posiciones concretas durante el proceso de denoising.
- Muestreo guiado por confianza: `confidence_guided` y `confidence_eos_eot_inf` permiten modular qué posiciones se desenmascaran en cada paso.
- Control de diversidad: `temperature`, `top_k`, `noise_level` y `seed` permiten reproducir o variar el muestreo.
- Tool calling / function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado en la model card.
- Capacidades multilingües: no declaradas para el adaptador; dependen de lo que conserve el modelo base tras la conversión.
- Visión, audio u otras modalidades: no disponibles.
- Modo de pensamiento explícito: no documentado (el modelo base Instruct no es un modelo de razonamiento con cadena de pensamiento dedicada).

## Casos de uso

- Investigación en generación no autorregresiva: el modelo permite comparar decodificación por difusión discreta frente a la decodificación causal sobre un mismo backbone de 8B, midiendo calidad y coste con distintos valores de `num_steps`.
- Reproducción del experimento BYOD: con `resolved_config.json` y el código de `lad-generic` se puede replicar la conversión completa (LoRA de rango 1024 sobre q y v, 25 000 pasos, token `MASK`) y validar la metodología sobre otros checkpoints.
- Edición y relleno de texto: el denoising bidireccional permite enmascarar fragmentos de un borrador y regenerarlos en paralelo, útil en prototipos de reescritura o corrección asistida.
- Generación con restricciones duras de posición: usando `permanent_unmask` se pueden fijar tokens obligatorios (por ejemplo, etiquetas o campos de plantilla) y dejar que el modelo rellene el resto.
- Evaluación de muestreadores de difusión: sirve como banco de pruebas para estudiar el efecto de `confidence_guided`, `proportional_unmask` o `block_length` sobre la coherencia y la repetición del texto generado.
- Demostraciones interactivas: existe un Space en ZeroGPU con el modelo en precisión completa, adecuado para demos de investigación y validación cualitativa, no para tráfico de producción.
- Estudio de eficiencia computacional: al requerir decenas de pasadas de refinamiento, es un caso útil para medir la relación entre número de pasos y latencia frente a un decodificador autorregresivo equivalente.
- Base para investigación sobre atención bidireccional en LLM preentrenados: permite analizar hasta qué punto un modelo causal puede reconvertirse a un régimen bidireccional mediante adaptadores de bajo rango.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y la búsqueda web realizada no devolvió resultados relevantes sobre este modelo.

## Requisitos de hardware

- Pesos en precisión completa (bf16/fp16) del modelo fusionado: aproximadamente 16 GB solo para los pesos de los 8 000 millones de parámetros, más caché KV y activaciones. El ejemplo de carga usa `quantization="none"`.
- Adaptador sin fusionar: el repositorio ocupa 1,8 GB, por lo que hay que sumar ese espacio al de los pesos base si se carga como PEFT en lugar de fusionarlo.
- Caché KV del modelo base (GQA con 8 cabezas KV de dimensión 128 y 32 capas): del orden de 128 KiB por token en fp16, es decir, unos 16 MiB para 128 tokens y alrededor de 1 GiB para 8 192 tokens. Es una estimación derivada de la configuración de Llama 3.1 8B.
- GPU recomendadas: A100 (40 o 80 GB) y H100 (80 GB) para trabajar con comodidad en precisión completa; RTX 4090 o RTX 3090 (24 GB) son suficientes para precisión completa con bloques y contextos moderados.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB sin cuantizar y presumiblemente en tarjetas de 8-12 GB con cuantización de 4 u 8 bits, aunque la model card no documenta qué esquemas de cuantización soporta el cargador.
- Coste de cómputo: cada generación requiere múltiples pasadas de denoising. Con `num_steps=64`, el coste por secuencia es aproximadamente 64 veces el de una pasada completa sobre la ventana, muy superior al de una decodificación autorregresiva token a token equivalente.
- Despliegue: el proyecto `lad-generic` (Python/PyTorch) es la vía documentada. El método `generate()` causal estándar no es el muestreador previsto. No hay soporte documentado en vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia para este esquema de denoising.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo por generación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Paradigma de decodificación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BYOD-Llama-3.1-8B | 8 000 M (adaptador LoRA temporal) | heredado del base, no confirmado en modo difusión | difusión discreta enmascarada con refinamiento iterativo | Llama 3.1 Community License | adaptador PEFT en HuggingFace, código de inferencia en `lad-generic` |
| meta-llama/Llama-3.1-8B-Instruct | 8 000 M | 128 000 tokens | autorregresiva causal | Llama 3.1 Community License | pesos completos en HuggingFace, acceso previa aceptación de licencia |
| Otros modelos de difusión discreta para lenguaje (por ejemplo LLaDA o Dream) | no disponible | no disponible | difusión discreta enmascarada | no disponible | no disponible; no se dispone de datos comparativos en la información proporcionada |

La comparación cuantitativa frente a otras alternativas de la misma categoría no está disponible: no se han publicado métricas de este adaptador ni de sus competidores en la información consultada. La única comparación verificable es estructural, frente al modelo base del que deriva.

## Limitaciones y advertencias

- Modelo de investigación: la propia model card lo declara como tal y desaconseja su uso en decisiones de alto riesgo sin verificación independiente.
- Riesgo de alucinación: puede producir texto inexacto, y al ser un modelo convertido a partir de un Instruct, hereda los sesgos y modos de fallo del modelo base y de sus datasets.
- Degeneración del muestreo: el autor advierte de posibles repeticiones en la salida, algo especialmente relevante en decodificación por difusión con parámetros mal ajustados.
- Sin benchmarks publicados: no hay métricas que permitan estimar su calidad frente al modelo base ni frente a otros modelos de difusión.
- Dependencia de código externo: el método `generate()` causal estándar no es el muestreador previsto; es necesario usar `diffusion_lm` de `lad-generic`, lo que complica la integración en pilas de producción y descarta servidores habituales como vLLM, llama.cpp o Ollama.
- Sensibilidad a hiperparámetros: `num_steps`, `noise_level`, `temperature`, `top_k`, `block_length` y las opciones de desenmascarado condicionan fuertemente la salida, y no se documenta una configuración óptima más allá del ejemplo.
- Coste de inferencia elevado: el esquema iterativo multiplica el número de pasadas; con 64 pasos el coste es muy superior al de una generación autorregresiva comparable.
- Idiomas y contexto no verificados: no se declaran idiomas soportados y no se confirma que la ventana de 128 000 tokens del modelo base se conserve tras la conversión a difusión.
- Restricciones de licencia: se aplica la Llama 3.1 Community License. El acceso al modelo base puede exigir aceptar su licencia y usar un token de HuggingFace, y el adaptador queda sujeto a los términos del modelo base. Cualquier uso comercial debe revisarse contra esa licencia.
- Trazabilidad: los pesos publicados son el checkpoint `best` de un único experimento; no se documentan barridos, semillas ni evaluaciones de robustez.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ruurd/BYOD-Llama-3.1-8B
- Demo en ZeroGPU (precisión completa): https://huggingface.co/spaces/Ruurd/byod-llama-3.1-8b
- Código de inferencia bidireccional (lad-generic): https://github.com/RuurdKuiper/lad-generic
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
- Nota sobre la búsqueda web: los resultados devueltos corresponden a páginas corporativas de Microsoft sin relación con el modelo, por lo que no se han incluido.
