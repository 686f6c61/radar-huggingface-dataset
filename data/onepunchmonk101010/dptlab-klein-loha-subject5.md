# OnePunchMonk101010/dptlab-klein-loha-subject5

## Resumen

dptlab-klein-loha-subject5 es un adaptador de personalización texto-a-imagen entrenado sobre el modelo de difusión black-forest-labs/FLUX.2-klein-4B. Lo publica el usuario OnePunchMonk101010 y se ha generado con la herramienta dptlab (diffusion-post-training-lab) siguiendo la receta `lora` pero con un adaptador de tipo LoHa (Low-rank Hadamard product), una alternativa a LoRA que factoriza las matrices de actualización como producto de Hadamard de dos pares de matrices de bajo rango. El resultado es un checkpoint de 13,8 millones de parámetros entrenables, con rango 8 y alpha 8, almacenado en un repositorio de 0,1 GB.

El adaptador se ha entrenado durante 500 pasos a resolución 512 y con precisión mixta bf16 sobre un dataset privado de un único sujeto (ruta `/root/data/syncd/subject-5`), es decir, está pensado para inyectar una identidad visual concreta en el modelo base, no para mejorar capacidades generales de generación. La relevancia de esta ficha es doble: por un lado documenta un caso real de posentrenamiento PEFT sobre una arquitectura de difusión tipo transformer (DiT); por otro, ilustra un problema práctico de interoperabilidad, ya que el formato LoHa no se puede cargar con `pipe.load_lora_weights()` de diffusers y exige inyectarlo mediante PEFT.

La licencia declarada es Apache-2.0 y el pipeline es text-to-image. No hay información publicada sobre idiomas soportados, ni sobre el dataset de entrenamiento más allá de su ruta, ni comparativas con otros adaptadores de la misma categoría.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoHa (Low-rank Hadamard product) sobre un modelo de difusión texto-a-imagen (modelo base FLUX.2-klein-4B) |
| Parametros totales | 13,8 M de parámetros entrenables en el adaptador; el modelo base se identifica por nombre como FLUX.2-klein-4B (4B) |
| Longitud de contexto | no disponible (modelo de difusión texto-a-imagen; no utiliza ventana de contexto de tokens) |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas; el entrenamiento se realizó en bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, con estructura de adaptador LoHa (no compatible con `load_lora_weights()` de diffusers) |

## Arquitectura y entrenamiento

Se trata de un adaptador, no de un modelo completo. La arquitectura subyacente es la del modelo base FLUX.2-klein-4B, un generador texto-a-imagen de tipo transformer de difusión; sobre él se aplica una actualización de pesos de tipo LoHa, que descompone la matriz de actualización como producto de Hadamard de dos productos de matrices de bajo rango. El adaptador tiene rango 8 y alpha 8, lo que da 13,8 M de parámetros entrenables.

La configuración de entrenamiento documentada es la siguiente: resolución 512, learning rate 1e-4, batch size 1 con 4 pasos de acumulación de gradiente, 500 pasos totales, `max_grad_norm` 1.0, precisión mixta bf16, semilla 42, uso de máscaras (`use_masks: true`) y checkpoint cada 500 pasos. No se definieron prompts de validación (`validation_prompts: []`). Los parámetros extra incluyen `sampling_steps_for_shift: 4`, `logit_mean: 0.0` y `logit_std: 1.0`. No se documenta el número de imágenes del dataset, su procedencia, la composición del conjunto de validación ni si hubo fases de RLHF o DPO (no aplicables en este pipeline). El dataset de entrenamiento es privado y solo se conoce su ruta (`/root/data/syncd/subject-5`).

## Capacidades

- Generación de imágenes a partir de texto (pipeline text-to-image) mediante el modelo base más el adaptador.
- Personalización de sujeto: el adaptador está orientado a reproducir una identidad visual concreta aprendida del dataset `subject-5`.
- Inferencia en pocos pasos: el ejemplo de uso emplea `num_inference_steps=4` con `guidance_scale=1.0`, coherente con el parámetro `sampling_steps_for_shift: 4`.
- Ajuste fino eficiente en parámetros: 13,8 M de parámetros entrenables sobre un modelo de 4B, es decir, una fracción muy pequeña del total.
- Compatibilidad con el ecosistema diffusers y con la librería PEFT, aunque con la salvedad de que requiere una función de carga específica (`load_peft_checkpoint`) y no el cargador estándar de LoRA.
- Soporte de tool calling / function calling: no disponible (no aplica a un modelo de difusión).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingües: no disponible; no se documenta el idioma de los prompts de entrenamiento.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Personalización de sujeto en generación de imágenes: el adaptador se ha entrenado precisamente para inyectar un sujeto concreto en FLUX.2-klein-4B. Se usaría cargando el modelo base, inyectando el checkpoint LoHa vía PEFT y generando con 4 pasos de inferencia, lo que permite obtener variaciones del sujeto en escenas nuevas descritas en el prompt.
- Producción de imágenes de producto o catálogo: una vez fijada una identidad visual (un objeto, un envase, un modelo), el adaptador permite generar ese mismo sujeto en distintos fondos y encuadres sin reentrenar, con un coste de almacenamiento de solo 0,1 GB por adaptador.
- Retratos y avatares consistentes: el enfoque de adaptadores por sujeto es habitual para mantener coherencia facial o de estilo entre múltiples generaciones; aquí el sujeto concreto depende del dataset privado `subject-5`, que no está documentado públicamente.
- Concept art y previsualización de assets: con latencia media de 2017 ms por generación en la configuración evaluada (4 pasos), el adaptador es viable para iteración rápida en fases de exploración visual frente a pipelines de más pasos.
- Generación por lotes en pipelines automatizados: al ser un adaptador pequeño, se puede intercambiar o apilar en un servicio que sirva varias personalizaciones desde el mismo modelo base, reduciendo el coste de VRAM frente a mantener un modelo completo por sujeto.
- Investigación en métodos PEFT para modelos de difusión: este repositorio sirve como caso práctico para comparar LoHa frente a LoRA en tareas de personalización, ya que dptlab publica resultados de seis métodos distintos en su archivo `RESULTS.md`.
- Integración en interfaces de generación: al funcionar sobre diffusers con Transformer/UNet accesible y PEFT, es integrable en herramientas que permitan cargar adaptadores personalizados, siempre que se implemente la ruta de carga específica para LoHa.

## Benchmarks y rendimiento

Datos publicados en la model card para el split `heldout` (6 prompts que describen escenarios no presentes en las imágenes de entrenamiento):

| Metrica | Valor |
|---|---|
| CLIP-T (prompt) | 0.9710 |
| DINO (subject) | 0.2907 |
| CLIP-I (subject) | 0.6637 |
| Latencia media (ms) | 2017 |

El propio autor advierte que CLIP-T y DINO miden cosas opuestas: un adaptador que no ha aprendido nada puntúa bien en la primera, y uno que memoriza sus imágenes de entrenamiento puntúa bien en la segunda, por lo que deben leerse conjuntamente. Con DINO 0.2907 y CLIP-I 0.6637, los valores de fidelidad al sujeto son moderados y el de adherencia al prompt es alto.

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible; estos no aplican a un modelo de difusión texto-a-imagen.

## Requisitos de hardware

- Tamaño del adaptador: 13,8 M de parámetros entrenables, lo que equivale aproximadamente a 27,6 MB en bf16 y a unos 55 MB en fp32; el repositorio completo ocupa 0,1 GB.
- VRAM de inferencia: el adaptador es despreciable frente al modelo base. Para FLUX.2-klein-4B (4B), una estimación derivada del recuento de parámetros sitúa los pesos en torno a 8 GB en bf16, a lo que hay que sumar los codificadores de texto, el VAE y las activaciones; la cifra exacta de VRAM total no está disponible en la información proporcionada.
- GPU recomendadas: no disponible en la documentación. Como referencia de orden de magnitud, una GPU de 24 GB (RTX 4090, L4, A10G) debería acomodar el modelo base en bf16 según la estimación anterior, pero esto no está confirmado por el autor.
- GPU de consumo: no confirmado. En función de la estimación de 8 GB solo para los pesos del modelo base, sería necesario disponer de 12 GB o más de VRAM, o bien aplicar cuantización u offload, opciones que no se documentan en este repositorio.
- Opciones de despliegue: diffusers con `DiffusionPipeline.from_pretrained` sobre el modelo base, más inyección del adaptador mediante `dptlab.training.peft_methods.load_peft_checkpoint`. No se documenta soporte para llama.cpp, Ollama, vLLM ni TGI (no aplican a este tipo de modelo). El uso de ComfyUI u otras interfaces no está documentado.
- Latencia y throughput: latencia media de 2017 ms por imagen en el split de evaluación, con la configuración de muestreo empleada. No se especifica el hardware sobre el que se midió, por lo que la cifra no es directamente extrapolable. No hay datos de throughput por lote.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros entrenables | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dptlab-klein-loha-subject5 | Adaptador LoHa sobre FLUX.2-klein-4B | 13,8 M | no disponible | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| black-forest-labs/FLUX.2-klein-4B | Modelo base de difusión texto-a-imagen | no disponible | no disponible | no disponible en esta información | HuggingFace |
| Otros adaptadores LoRA/LoHa de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de adaptadores alternativos comparables, ni de sus recuentos de parámetros o licencias, por lo que no es posible establecer una comparación cuantitativa. La única comparación documentada es interna: el repositorio dptlab incluye resultados de seis métodos distintos sobre el mismo conjunto de evaluación.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar y ejecutar el modelo base FLUX.2-klein-4B. El adaptador por sí solo no genera imágenes.
- Incompatibilidad de carga: `pipe.load_lora_weights()` no puede leer este formato. Según la propia model card, si se intenta, se registra el mensaje "no LoRA keys found" y se sirve silenciosamente el modelo base sin adaptador, lo que produce resultados aparentemente correctos pero sin personalización.
- Dataset no documentado: el conjunto de entrenamiento (`/root/data/syncd/subject-5`) es privado y no se describe su tamaño, procedencia, licencia ni si existe consentimiento de las personas u obras representadas. Esto es relevante si el sujeto es una persona real.
- Evaluación poco robusta: el benchmark se realiza sobre solo 6 prompts de un split `heldout`, sin intervalos de confianza ni comparación estadística. No permite conclusiones firmes sobre la calidad del adaptador.
- Compromiso entre fidelidad al sujeto y adherencia al prompt: el valor alto de CLIP-T (0.9710) junto con un DINO bajo (0.2907) y un CLIP-I de 0.6637 sugiere que el adaptador sigue bien las instrucciones de texto pero reproduce el sujeto con fidelidad moderada.
- Capacidad limitada por configuración: rango 8, 500 pasos y resolución 512 son ajustes conservadores. El adaptador podría no retener detalles finos del sujeto ni generalizar bien a resoluciones superiores o a composiciones muy distintas de las del entrenamiento.
- Riesgo de artefactos y deriva del prompt: como cualquier adaptador de difusión, puede introducir artefactos visuales o forzar la aparición del sujeto aprendido en contextos donde el prompt no lo pide.
- Idiomas: se desconoce qué idiomas maneja el pipeline; no hay información sobre el idioma de los prompts de entrenamiento ni sobre su comportamiento con prompts en castellano.
- Licencia: el adaptador se declara Apache-2.0, pero la licencia del modelo base no se detalla en la información disponible. Antes de un uso comercial conviene verificar las condiciones del modelo base, ya que pueden imponer restricciones adicionales.
- Metadatos llamativos: las fechas de creación y actualización indican septiembre de 2026, dato que no se puede verificar con la información disponible.
- Adopción nula: el repositorio registra 0 descargas y 0 likes, por lo que no existe validación por parte de la comunidad ni informes de terceros sobre su comportamiento en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OnePunchMonk101010/dptlab-klein-loha-subject5
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Repositorio de dptlab (herramienta de posentrenamiento): https://github.com/OnePunchMonk/diffusion-post-training-lab
- Resultados completos de los seis métodos evaluados: archivo `RESULTS.md` dentro del repositorio de HuggingFace (referenciado en la model card)
- La búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo, su autor o su metodología.
