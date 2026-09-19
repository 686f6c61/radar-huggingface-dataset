# Ruurd/BYOD-Gemma-2-9B

## Resumen

BYOD-Gemma-2-9B es un modelo de lenguaje de difusión discreta enmascarada (masked discrete-diffusion) publicado por el usuario Ruurd en Hugging Face. Se construye a partir de google/gemma-2-9b-it mediante adaptadores LoRA de rango 1024 entrenados sobre las proyecciones query y value, de modo que el modelo autoregresivo original pasa a predecir de forma bidireccional y paralela las posiciones enmascaradas, refinando la salida de forma iterativa hasta completarla. El repositorio contiene el checkpoint `best` exacto del experimento `gemma-2-9b-mask`, en precisión completa y no en una variante de 4 bits ni cuantizada.

El aspecto diferencial es el método de muestreo: el modelo no está pensado para usarse con `generate()` causal estándar, sino con un sampler bidireccional propio disponible en la librería `lad-generic`, que expone parámetros como `num_steps`, `noise_level`, `confidence_guided`, `permanent_unmask` o `block_length`. Esto lo sitúa en el terreno de la investigación sobre alternativas a la decodificación token a token, donde varios tokens se generan por paso de cómputo.

Es relevante ahora porque permite experimentar con difusión de lenguaje sobre un modelo instruct de ~9B ya existente, sin entrenar desde cero, y porque el adaptador se puede fusionar con el modelo base, con lo que el recuento de parámetros tras la fusión vuelve a ser el del modelo original. El repositorio es de tamaño reducido (2,3 GB, correspondientes al adaptador) y no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión discreta enmascarada (masked discrete-diffusion) construido sobre un transformer decoder: google/gemma-2-9b-it adaptado con LoRA en las proyecciones query y value |
| Parámetros totales | No especificado de forma explícita. La nomenclatura del modelo base indica ~9 000 millones; el modelo fusionado conserva el recuento de parámetros del base |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base, no documentada en la model card) |
| Tipos de cuantización | El repositorio contiene el checkpoint `best` en precisión completa, no cuantizado. La función de carga admite un parámetro `quantization`, con valor `none` en el ejemplo documentado; no se detallan otros valores |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | `gemma` (Gemma Terms of Use). El adaptador queda sujeto a los términos del modelo base |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, `library_name: peft`); fusionable con el modelo base |
| Modelo base | google/gemma-2-9b-it |
| Método de adaptación | LoRA de rango 1024 sobre proyecciones query y value, hasta 25 000 actualizaciones del optimizador |
| Tamaño del repositorio | 2,3 GB |
| Librería | peft |
| Pipeline | text-generation |
| Fecha de creación / actualización | 2026-09-19 / 2026-09-19 |

## Arquitectura y entrenamiento

La model card describe el método como una conversión de un modelo autoregresivo a un denoiser bidireccional: se entrenan adaptadores LoRA de rango 1024 sobre las proyecciones query y value del modelo base, con un máximo de 25 000 actualizaciones del optimizador y usando `MASK` como token de máscara. El modelo predice en paralelo las posiciones enmascaradas de la respuesta y refina iterativamente el resultado. El repositorio incluye `resolved_config.json` con los detalles exactos de configuración del experimento.

Un punto técnico relevante es que el adaptador puede fusionarse con el modelo base después del entrenamiento, por lo que el incremento de parámetros es temporal y el modelo fusionado recupera el recuento de parámetros del original. No se detallan en la información proporcionada el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO adicionales sobre el base instruct. Tampoco se documentan innovaciones de decodificación especulativa ni mecanismos de atención alternativos más allá del propio esquema de denoising enmascarado.

## Capacidades

- Generación de texto conversacional: el ejemplo documentado usa `question` y `system_prompt`, apoyándose en la naturaleza instruct del modelo base.
- Denoising bidireccional paralelo: predice simultáneamente varias posiciones enmascaradas en lugar de generar token a token.
- Refinamiento iterativo controlado: el número de pasos (`num_steps`), el nivel de ruido (`noise_level`) y el tamaño de bloque (`block_length`) son parámetros explícitos del sampler.
- Decodificación guiada por confianza: opciones `confidence_guided`, `proportional_unmask`, `permanent_unmask` y `confidence_eos_eot_inf` para modular qué posiciones se fijan en cada paso.
- Muestreo estocástico configurable: `temperature`, `top_k` y `seed` (ejemplo documentado: temperature 0.7, top_k 3, seed 1234).
- Reproducibilidad: la semilla forma parte de la interfaz de inferencia.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso explícito.
- No se documentan capacidades de visión, audio ni modo "thinking".
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en modelos de difusión de lenguaje: el modelo permite comparar experimentalmente la decodificación iterativa con máscaras frente a la decodificación autoregresiva sobre el mismo backbone, usando `num_steps` y `noise_level` como variables.
- Rellenado de texto e infilling: al predecir posiciones enmascaradas en paralelo, encaja en tareas de completar fragmentos, reconstruir pasajes con huecos o reparar texto degradado.
- Corrección y edición de documentos: el esquema de denoising con `permanent_unmask` permite fijar las partes correctas de un texto y regenerar únicamente las zonas marcadas.
- Evaluación de adaptación LoRA de alto rango: el adaptador de rango 1024 sobre query y value sirve como caso de estudio para medir cuánta capacidad de un transformer se puede redirigir a una tarea distinta sin tocar el resto de pesos.
- Prototipado de asistentes conversacionales: apoyándose en el modelo base instruct y en `system_prompt`, se pueden construir prototipos de diálogo multi-turno, siempre con verificación humana dado el carácter de investigación del modelo.
- Demos interactivas en Hugging Face Spaces: el autor publica una demo en ZeroGPU a plena precisión, lo que facilita mostrar el comportamiento del sampler sin infraestructura propia.
- Estudio de robustez frente a ruido: el parámetro `noise_level` (valor 1.0 en el ejemplo) permite analizar cómo evoluciona la calidad de la salida según el nivel de ruido inicial.
- Docencia y divulgación sobre difusión discreta: el par modelo más librería `lad-generic` constituye un material didáctico con configuración reproducible (`resolved_config.json`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 2,3 GB y contiene únicamente el adaptador; para inferencia hay que disponer además del modelo base google/gemma-2-9b-it o de la versión fusionada.
- VRAM estimada (orientativa, a partir de un modelo denso de ~9B): en bf16/fp16 los pesos ocupan del orden de 18 GB, por lo que con caché KV y activaciones conviene contar con 20-24 GB para lote 1. No se proporcionan cifras oficiales de VRAM en la información disponible.
- GPU recomendadas: A100 (40/80 GB) y H100 (80 GB) para lotes mayores o contextos largos; en el extremo consumer, RTX 4090 o RTX 3090 (24 GB) pueden ser suficientes en bf16 con lote pequeño.
- No cabe en GPUs consumer de 8-16 GB sin cuantización; el repositorio no incluye versiones cuantizadas.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI. El sampler previsto es el código de inferencia bidireccional de `lad-generic` (`diffusion_lm.inference`, funciones `load_hub_adapter_session` y `denoise`), con `quantization="none"` en el ejemplo.
- Latencia y throughput: no disponibles. Como referencia estructural, el ejemplo genera 128 tokens con `num_steps=64`, lo que implica del orden de 64 pasadas de modelo para esa salida, frente a las 128 pasadas de una decodificación autoregresiva token a token.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de alternativas en la información proporcionada. La única comparación posible con los datos disponibles es con el modelo base:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Método de inferencia |
|---|---|---|---|---|---|
| BYOD-Gemma-2-9B | ~9B (heredados del base; no especificado) | No disponible | gemma | Hugging Face, adaptador PEFT de 2,3 GB | Sampler bidireccional propio (`lad-generic`) |
| google/gemma-2-9b-it | No disponible en la información proporcionada | No disponible | gemma | Hugging Face (acceso sujeto a aceptación de licencia) | `generate()` causal estándar |
| Otros modelos de difusión de lenguaje enmascarada | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Modelo de investigación: el propio autor advierte de que puede producir texto inexacto, repetitivo, sesgado o inseguro, y de que no debe usarse para decisiones de alto impacto sin verificación independiente.
- Hereda las limitaciones del modelo base google/gemma-2-9b-it y de sus datasets, incluidos los sesgos presentes en ellos.
- Riesgo de alucinación no cuantificado: no hay benchmarks publicados que acoten la tasa de error.
- El método de muestreo no es estándar: `generate()` causal no es el sampler previsto, lo que rompe la compatibilidad con stacks de despliegue habituales (vLLM, TGI, llama.cpp, Ollama) y obliga a integrar `lad-generic`.
- Coste de cómputo alto por token generado: el ejemplo documentado requiere 64 pasos de denoising para 128 tokens.
- Idiomas soportados no documentados; no se puede asumir un comportamiento multilingüe homogéneo.
- Licencia `gemma`: el uso comercial queda sujeto a los Gemma Terms of Use, y el adaptador sigue sujeto a los términos del modelo base. El acceso al modelo base puede requerir aceptar su licencia y usar un token de Hugging Face.
- Ausencia de validación comunitaria: 0 descargas y 0 valoraciones en el momento de la consulta.
- No se documenta soporte de tool calling, agentes, visión, audio ni modo de razonamiento explícito, por lo que no conviene asumir estas capacidades en producción.
- Fechas del repositorio (creación y actualización el 2026-09-19) muy próximas entre sí, lo que sugiere un artefacto recién publicado y sin rodaje.
- La información sobre el contexto máximo, los idiomas y el rendimiento no está disponible en la model card; cualquier decisión de despliegue debería verificarse empíricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ruurd/BYOD-Gemma-2-9B
- Demo en ZeroGPU: https://huggingface.co/spaces/Ruurd/byod-gemma-2-9b
- Código de inferencia bidireccional (lad-generic): https://github.com/RuurdKuiper/lad-generic
- Modelo base: https://huggingface.co/google/gemma-2-9b-it
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (solo páginas de noticias y foros sin relación).
