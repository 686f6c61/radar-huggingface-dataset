# loktionov129/smlq_sfw.lora

## Resumen

`smlq_sfw` es un LoRA de difusión para generación de imágenes de texto a imagen, entrenado por el usuario `loktionov129` sobre el modelo base `krea/Krea-2-Raw`. Su función es fijar la identidad visual de un personaje sintético concreto, la "virtual influencer" Samantha Lambarquni, de modo que el modelo base reproduzca de forma consistente sus rasgos faciales, complexión, peinado, piercings y marcas cutáneas cada vez que se invoca la palabra disparadora `smlq_sfw`.

Técnicamente se trata de un adaptador LoRA de rango 32 (alpha 32) entrenado únicamente sobre el UNet, con el text encoder congelado, durante 3000 pasos a resolución 512x512 y con un scheduler de tipo `flowmatch`. Los pesos se distribuyen en formato `.safetensors` en precisión `bf16` y el repositorio ocupa aproximadamente 0,2 GB, lo que lo hace trivial de cargar junto al modelo base en flujos de trabajo de ComfyUI o `diffusers`.

Su relevancia es acotada pero clara dentro del nicho de creación de personajes virtuales: resuelve el problema de la consistencia de identidad entre generaciones, algo que los modelos de difusión generalistas no garantizan por sí solos. No es un modelo de lenguaje ni un modelo fundacional, sino un artefacto de personalización de un pipeline existente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de difusión (arquitectura interna `krea2`), adaptador de rango 32 |
| Parámetros totales | no disponible (adaptador LoRA de rango 32; el modelo base no declara recuento) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo texto-imagen); resolución de entrenamiento 512x512, resolución objetivo 1024x1024 |
| Tipos de cuantización | pesos del adaptador en `bf16`; modelo base y text encoder cuantizados a `qfloat8` durante el entrenamiento |
| Idiomas soportados | inglés (`en`) |
| Licencia | `unlicense` (dominio público) |
| Formato de pesos | `.safetensors` (Diffusers) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `krea/Krea-2-Raw`, un modelo de difusión texto-imagen, con un text encoder basado en `Felldude/Qwen3-VL-4B-Instruct-Uncensored` cuantizado a `qfloat8`. La configuración de red usa LoRA con `lokr_full_rank: true`, dimensión lineal (rank) 32 y alpha 32, aplicada exclusivamente al UNet (`train_unet: true`, `train_text_encoder: false`). El optimizador es `adamw8bit`, con learning rate `1e-4`, weight decay `1e-4`, batch size 1 sin acumulación de gradiente, función de pérdida MSE y scheduler de ruido `flowmatch` con timesteps lineales. El entrenamiento totaliza 3000 pasos.

El conjunto de datos es `loktionov129/smlq_sfw.dataset`, con captions en ficheros `.txt`, una tasa de dropout de caption de 0,05 y un modo contenido/estilo "balanced". La resolución de entrenamiento es 512x512. No se documenta el número de imágenes del dataset, la composición del mismo ni si hubo etapas de refinamiento posteriores. La innovación técnica es limitada por definición: se trata de un ajuste fino paramétricamente eficiente orientado a la fidelidad de identidad, no de una arquitectura nueva.

## Capacidades

- Generación de imágenes fotorrealistas de un personaje concreto a partir de descripciones textuales en inglés.
- Consistencia de identidad facial entre generaciones mediante la palabra disparadora `smlq_sfw`.
- Reproducción de atributos físicos específicos definidos en el dataset: estructura facial, color y forma de ojos, cejas, piercings (doble aro en ceja derecha, aro en fosa nasal izquierda, aritos), lunares y pecas.
- Control de vestuario y entorno mediante prompt (el ejemplo de la model card incluye fondo de ciudad neón ciberpunk).
- Integración en flujos ComfyUI y `diffusers`.
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es un modelo generativo de imagen, no un LLM.
- Capacidad multilingüe limitada al inglés según los metadatos del repositorio.
- No dispone de modo "thinking", visión, audio ni otras modalidades.

## Casos de uso

- Creación de contenido para redes sociales de un personaje virtual: el LoRA permite generar un flujo continuo de imágenes de Samantha Lambarquni manteniendo el mismo rostro entre publicaciones, algo inviable con el modelo base sin adaptador.
- Ilustración de marca para proyectos de "virtual influencer": se puede generar un catálogo de escenas (retrato, cuerpo entero, distintos vestuarios y localizaciones) con identidad estable para nutrir una cuenta o una campaña.
- Prototipado de personajes para narrativa visual o cómic: el adaptador sirve para explorar variaciones de encuadre y expresión de un mismo personaje antes de encargar arte final.
- Generación de avatares y retratos de perfil consistentes: útil para crear un set de avatares con el mismo rostro en distintos estilos de iluminación y fondo.
- Pruebas de concepto en pipelines de generación por lotes: al ser un `.safetensors` de 0,2 GB, se puede cargar y descargar rápidamente en entornos de experimentación con `diffusers` o ComfyUI.
- Investigación sobre consistencia de identidad en LoRAs: sirve como caso de estudio de un entrenamiento con `lokr_full_rank`, rank 32 y 3000 pasos para comparar estrategias de personalización.
- Generación de material para pruebas de sistemas de moderación o de detección de contenido sintético, dado que produce rostros hiperrealistas de identidad fija.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia, el adaptador pesa unos 0,2 GB en `bf16`; el consumo dominante lo determina el modelo base `Krea-2-Raw` y el text encoder Qwen3-VL-4B, no el LoRA.
- GPU recomendadas: no disponibles en la información proporcionada. El entrenamiento se realizó con el modelo base y el text encoder cuantizados a `qfloat8`, lo que sugiere que el autor trabajó con VRAM limitada, pero no se especifica el hardware.
- Viabilidad en GPU de consumo: no confirmada en la documentación; depende enteramente del modelo base, no del adaptador.
- Opciones de despliegue: `diffusers` (formato nativo `.safetensors`) y ComfyUI, ambos mencionados en los tags y en la model card.
- Latencia y throughput: no disponibles.
- Configuración de inferencia recomendada por el autor: sampler/scheduler `flowmatch`, CFG 4.0, 30 pasos, resolución de salida 1024x1024.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia estructural, la categoría es la de LoRAs de consistencia de personaje sobre modelos de difusión texto-imagen (por ejemplo, adaptadores entrenados con AI-Toolkit sobre bases tipo Flux o Krea), pero no se han facilitado datos de rendimiento ni especificaciones de alternativas concretas que permitan una comparación rigurosa.

| Modelo | Base | Rank | Contexto/resolución | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| `smlq_sfw` | `krea/Krea-2-Raw` | 32 | 512x512 entrenamiento / 1024x1024 salida | `unlicense` | no disponibles |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente en inglés; los prompts en otros idiomas pueden degradar la fidelidad del personaje.
- La palabra disparadora `smlq_sfw` es obligatoria para activar la identidad; sin ella el LoRA puede introducir artefactos o un efecto residual no deseado.
- El entrenamiento se realizó a 512x512 y la inferencia recomendada a 1024x1024; generar a resoluciones muy distintas puede producir deformaciones anatómicas.
- Riesgo de sobreajuste al dataset: con 3000 pasos, batch 1 y un dataset no documentado en tamaño, la diversidad de poses y expresiones puede ser limitada.
- El personaje incluye rasgos muy específicos (pecas, lunares, piercings); el modelo puede reproducirlos de forma inconsistente en encuadres amplios o con oclusiones.
- La model card describe explícitamente atributos físicos sexualizados del personaje; el contenido generado puede no ser apto para todos los públicos y requiere moderación en producción.
- Licencia `unlicense`: permite uso comercial y modificación sin restricciones, pero el autor no ofrece garantías de ningún tipo ni asume responsabilidad sobre el uso.
- El uso del modelo base `krea/Krea-2-Raw` y del text encoder Qwen3-VL está sujeto a sus propias licencias, que deben verificarse por separado.
- Riesgo de suplantación o uso indebido en la creación de identidades sintéticas hiperrealistas; conviene etiquetar el contenido generado.
- No hay datos publicados sobre sesgos demográficos del adaptador ni sobre su comportamiento fuera del dominio del personaje.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loktionov129/smlq_sfw.lora
- Dataset de entrenamiento: https://huggingface.co/datasets/loktionov129/smlq_sfw.dataset
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Text encoder: https://huggingface.co/Felldude/Qwen3-VL-4B-Instruct-Uncensored
