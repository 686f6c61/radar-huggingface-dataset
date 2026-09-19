# OnePunchMonk101010/dptlab-klein-boft-subject5

## Resumen

dptlab-klein-boft-subject5 es un adaptador de ajuste fino paramétrico eficiente (PEFT) para generación de imágenes texto-a-imagen, publicado por el usuario OnePunchMonk101010 dentro del proyecto dptlab (diffusion-post-training-lab). No es un modelo completo: se trata de un adaptador de 3,0 millones de parámetros entrenables que se inyecta sobre el modelo base black-forest-labs/FLUX.2-klein-4B, un transformer de difusión de la familia FLUX.2. El adaptador se ha entrenado con la receta `lora` del framework dptlab, pero usando un adaptador de tipo BOFT (butterfly orthogonal fine-tuning) en lugar de una LoRA convencional.

El objetivo del adaptador es la personalización de sujeto (subject-driven generation): reproducir un sujeto concreto aprendido de un dataset reducido, manteniendo cierta adherencia al prompt textual. El entrenamiento fue muy corto (500 pasos, batch 1 con 4 pasos de acumulación de gradiente, resolución 512 px), lo que sitúa este artefacto en la categoría de experimento de investigación o prueba de concepto más que en la de producto listo para producción.

Su relevancia actual es doble. Por un lado, es un ejemplo de adaptación de un modelo de difusión moderno con una técnica PEFT poco habitual (BOFT) y de su integración en diffusers mediante una ruta de carga no estándar. Por otro, la propia model card documenta un problema práctico relevante: los pesos BOFT no son legibles por `pipe.load_lora_weights()`, que fallaría de forma silenciosa sirviendo el modelo base sin adaptador. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador BOFT (butterfly orthogonal fine-tuning) sobre un transformer de difusión; receta `lora` de dptlab con `peft_method: boft` |
| Parámetros totales | 3,0 M parámetros entrenables en el adaptador (el modelo base no se incluye en el repo) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo texto-a-imagen); resolución de entrenamiento: 512 px |
| Tipos de cuantización | No disponible en la información proporcionada (el adaptador se entrena y se sirve en bf16) |
| Idiomas soportados | No disponible (el autor no declara idiomas; el pipeline depende del codificador de texto del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/BOFT; no compatible con `load_lora_weights()` de diffusers) |
| Modelo base | black-forest-labs/FLUX.2-klein-4B |
| Librería | diffusers |
| Pipeline | text-to-image |
| Pasos de inferencia de referencia | 4 (`num_inference_steps=4`, `guidance_scale=1.0`) |
| Parámetros de adaptación | `lora_rank`: 16; `lora_alpha`: 16; `boft_block_size`: 32; `boft_n_butterfly_factor`: 2 |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-19 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer de difusión (el denoiser del pipeline, expuesto como `unet` o `transformer` según la versión de diffusers). La técnica empleada, BOFT, es una variante de ajuste fino ortogonal que factoriza matrices ortogonales mediante una estructura de mariposa (butterfly), lo que reduce el número de parámetros necesarios respecto a OFT completo. En esta configuración concreta, el adaptador tiene 3,0 M de parámetros entrenables con `boft_block_size=32` y `boft_n_butterfly_factor=2`. La receta de entrenamiento es la de LoRA (`lora_rank=16`, `lora_alpha=16`), pero el método PEFT resultante no produce pesos con el formato que espera el cargador de LoRA de diffusers. No se dispone de información sobre la arquitectura interna del modelo base FLUX.2-klein-4B más allá de su identificador y del sufijo "4B" que sugiere un orden de 4.000 millones de parámetros.

El entrenamiento se realizó sobre el dataset `/root/data/syncd/subject-5`, un conjunto orientado a la personalización de un sujeto concreto cuyo tamaño y composición no se especifican. La configuración es: resolución 512, learning rate 1e-4, batch size 1, 4 pasos de acumulación de gradiente (lote efectivo de 4), 500 pasos máximos (equivalente a unas 2.000 muestras procesadas si cada muestra corresponde a una imagen), precisión mixta bf16, `max_grad_norm` 1,0, uso de máscaras activado y semilla 42. No se documenta validación intermedia (la lista de `validation_prompts` está vacía y el único checkpoint se guarda en el paso 500). No hay información sobre RLHF, DPO ni ajuste por preferencias, algo esperable en un adaptador de difusión de este tipo. Como innovación destacable en el ecosistema, la model card insiste en la ruta de inyección mediante `load_peft_checkpoint` de dptlab en lugar del cargador estándar de LoRA.

## Capacidades

- Generación de imágenes texto-a-imagen condicionada por un sujeto aprendido (personalización de sujeto, "subject-5"), sobre el modelo base FLUX.2-klein-4B.
- Inferencia en muy pocos pasos: el ejemplo oficial usa 4 pasos con `guidance_scale=1.0`.
- Adherencia al prompt textual medida con CLIP-T (0,8727 sobre el split heldout de 6 prompts), lo que indica que el adaptador no destruye la capacidad de seguir instrucciones del modelo base.
- Integración con diffusers mediante inyección PEFT a través de la librería dptlab, no mediante `pipe.load_lora_weights()`.
- Compatibilidad con el ecosistema safetensors y con pesos en bf16.
- No soporta tool calling ni function calling: es un modelo de difusión, no un modelo de lenguaje.
- No soporta agentes, razonamiento multi-paso ni uso de herramientas.
- Capacidades multilingües: no declaradas por el autor; dependen del codificador de texto del modelo base, cuyo listado de idiomas no se proporciona.
- No se documentan capacidades de visión, audio, vídeo ni modo "thinking".

## Casos de uso

- Personalización de producto en catálogos: entrenar o reutilizar el adaptador para que un producto concreto (un modelo de zapatilla, un envase, un mueble) aparezca de forma consistente en imágenes generadas con distintos fondos y encuadres. El adaptador modifica el denoiser sin tocar el modelo base, lo que permite alternar entre el sujeto aprendido y la generación genérica sin recargar pesos completos.
- Retratos y avatares de marca: generar variaciones de un mismo personaje o mascota para campañas, manteniendo rasgos identificables. La métrica DINO del split heldout (0,2680) sirve como indicador de cuánta identidad se conserva en ajustes de escena no vistos, y conviene evaluarla antes de comprometerse con un flujo de producción.
- Investigación en métodos PEFT para difusión: comparar BOFT frente a LoRA clásica u OFT sobre el mismo backbone y el mismo dataset, usando la configuración documentada (rango 16, alpha 16, 500 pasos) como línea base reproducible.
- Generación de storyboards y previsualización de personajes: producir viñetas de un mismo sujeto en escenas distintas a 512 px y 4 pasos de inferencia, con una latencia media reportada de 2.441 ms, adecuada para iteración interactiva si el hardware es comparable.
- Aumento de datos para entrenamiento posterior: generar variaciones sintéticas de un sujeto a partir de un dataset pequeño, siempre que se valide que las variaciones no introducen artefactos ni memorizan exactamente las imágenes de entrenamiento.
- Pruebas de integración de pipelines de difusión: validar flujos de carga PEFT no estándar en diffusers, ya que el modelo ilustra un fallo silencioso conocido (el cargador de LoRA ignora los pesos BOFT y sirve el modelo base sin avisar), útil como caso de test en herramientas de despliegue.
- Demostraciones de ajuste fino con recursos limitados: 3,0 M de parámetros entrenables y 500 pasos con lote efectivo 4 lo convierten en un ejemplo asequible de post-entrenamiento de un modelo de difusión en una sola GPU, con fines docentes o de prototipado.

## Benchmarks y rendimiento

Datos publicados por el autor sobre el split heldout (6 prompts que describen escenas no presentes en las imágenes de entrenamiento):

| Métrica | Valor |
|---|---|
| CLIP-T (prompt) | 0,8727 |
| DINO (subject) | 0,2680 |
| CLIP-I (subject) | 0,6291 |
| Latencia media | 2.441 ms |

El autor advierte explícitamente de que CLIP-T y DINO tiran en direcciones opuestas: un adaptador que no ha aprendido nada puntúa alto en CLIP-T, mientras que uno que ha memorizado sus imágenes de entrenamiento puntúa alto en DINO, por lo que ambas métricas deben leerse en conjunto. El repositorio incluye un `RESULTS.md` con los seis métodos comparados y una discusión de factores de confusión, pero su contenido no se ha proporcionado en la información disponible. No se especifica el hardware sobre el que se midió la latencia ni el número de pasos usado en esa medición. No hay resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada: el adaptador en sí ocupa unos pocos megabytes (3,0 M de parámetros en bf16), pero el coste real lo marca el modelo base. Tomando el sufijo "4B" del identificador como referencia, los pesos del transformer en bf16 rondarían los 8 GB, a los que hay que sumar codificador de texto, VAE y activaciones. Estimación orientativa: 12-16 GB de VRAM en bf16, más si no se aplica offloading. Estas cifras son estimaciones derivadas del recuento de parámetros, no datos confirmados por el autor.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño del modelo base, una RTX 4090 (24 GB) o RTX 4080 (16 GB) deberían ser suficientes en bf16 con offloading; GPUs de datacenter como A100 o H100 (40-80 GB) aportan margen para lotes mayores y mayor resolución.
- Compatibilidad con GPU de consumo: probable en tarjetas de 16 GB o más, siempre que el modelo base quepa junto con el resto del pipeline. No confirmado para tarjetas de 8-12 GB.
- Opciones de despliegue: diffusers es la vía documentada, obligatoriamente combinada con `dptlab` (`pip install dptlab`) para inyectar los pesos BOFT. No se documentan integraciones con vLLM (no aplicable a difusión), TGI, llama.cpp ni Ollama. El uso en ComfyUI u otros frontends requeriría soporte explícito de BOFT, no confirmado.
- Latencia y throughput: 2.441 ms de latencia media reportada para el split de evaluación, con hardware y número de pasos no especificados. El ejemplo de uso fija 4 pasos de inferencia. No se proporcionan medidas de throughput ni de consumo de memoria en ejecución.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de terceros en la información proporcionada. La siguiente tabla recoge únicamente los elementos comparables documentados o deducibles del propio repositorio:

| Modelo | Tipo | Parámetros entrenables | Licencia | Disponibilidad |
|---|---|---|---|---|
| dptlab-klein-boft-subject5 | Adaptador BOFT sobre transformer de difusión | 3,0 M | Apache 2.0 | Público en HuggingFace, 0 descargas |
| FLUX.2-klein-4B (base) | Modelo de difusión texto-a-imagen | No disponible | No disponible | Referenciado como base; licencia no indicada en la información disponible |
| Otros adaptadores de la misma familia dptlab | No disponible | No disponible | No disponible | El autor menciona seis métodos comparados en `RESULTS.md`, sin datos accesibles |

No se han proporcionado modelos alternativos comparables (por ejemplo, LoRA de personalización de sujeto sobre otros backbones, DreamBooth o adaptadores IP-Adapter) con métricas que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar por separado black-forest-labs/FLUX.2-klein-4B, cuyos requisitos, licencia y condiciones de uso no se detallan en la información disponible.
- Incompatibilidad de carga: `pipe.load_lora_weights()` no puede leer el formato BOFT. Según la propia model card, registraría "no LoRA keys found" y serviría el modelo base sin adaptador de forma silenciosa, sin lanzar un error. Cualquier pipeline que asuma LoRA estándar dará resultados incorrectos sin avisar.
- Personalización de un único sujeto: el adaptador está entrenado sobre el dataset `subject-5` y no es un modelo de propósito general. Fuera de ese sujeto, su efecto es el de una perturbación no validada sobre el modelo base.
- Señal de identidad débil: el valor DINO de 0,2680 en el split heldout indica que la conservación del sujeto en escenas no vistas es limitada. El autor no publica umbrales de referencia, pero la métrica debe interpretarse con cautela antes de usarla en producción.
- Riesgo de sobreajuste y memorización: 500 pasos con lote efectivo 4 y sin validación intermedia (la lista de `validation_prompts` está vacía) no permiten descartar memorización de las imágenes de entrenamiento.
- Resolución limitada: el entrenamiento se hizo a 512 px. No hay evaluación de comportamiento a resoluciones mayores.
- Idiomas no declarados: no se especifica qué idiomas acepta el pipeline; el comportamiento multilingüe depende del codificador de texto del modelo base y no ha sido evaluado por el autor.
- Sin validación comunitaria: 0 descargas y 0 likes. No existen informes independientes de calidad, sesgos o fallos.
- Sesgos: no se documenta ningún análisis de sesgos demográficos, estéticos o culturales. Al ser un adaptador de personalización de sujeto, el sesgo dominante provendrá del dataset de entrenamiento, cuyo contenido no se describe.
- Licencia: el adaptador se publica bajo Apache 2.0, pero la licencia y las restricciones comerciales del modelo base deben verificarse por separado antes de cualquier uso comercial.
- Latencia no contextualizada: los 2.441 ms reportados no indican GPU, precisión ni número de pasos, por lo que no son extrapolables a otros entornos.
- Tamaño de repositorio anómalo: la ficha declara 0,0 GB, coherente con un adaptador de 3,0 M de parámetros, pero conviene verificar el contenido real del repositorio antes de integrarlo en un pipeline.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OnePunchMonk101010/dptlab-klein-boft-subject5
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Repositorio del framework dptlab (diffusion-post-training-lab): https://github.com/OnePunchMonk/diffusion-post-training-lab
- `RESULTS.md` con los seis métodos comparados y los factores de confusión: referenciado en la model card dentro del propio repositorio del modelo.
- Búsqueda web: no se han encontrado enlaces relevantes. Los resultados devueltos por la búsqueda corresponden a artículos sobre diseños de rejas de escalera y no guardan relación alguna con este modelo.
