# Mervecaliskan/japandi-interior-lora

## Resumen

Japandi Interior LoRA es un adaptador de bajo rango (LoRA) para Stable Diffusion 1.5 que introduce el estilo de interiorismo japandi: maderas claras, texturas de lino y beige, mobiliario bajo, lámparas de papel y paneles shoji. Lo desarrolla la usuaria de Hugging Face Mervecaliskan y se distribuye como un fichero de 6,4 MB que se carga sobre el checkpoint base `stable-diffusion-v1-5/stable-diffusion-v1-5` mediante la librería diffusers. Su función es estilizar la generación text-to-image sin necesidad de reentrenar el modelo completo.

Técnicamente es un LoRA de rango 8 aplicado a las capas de atención del UNet (`to_q`, `to_k`, `to_v`, `to_out`), con 1,6 millones de parámetros entrenables, un 0,19 % del UNet. Se entrenó durante 800 pasos a 512x512 y precisión mixta fp16 sobre un conjunto de solo 17 imágenes, en 4,9 minutos de una GPU T4 gratuita con un pico de 2,1 GB de memoria. La palabra de activación es `jpdi`.

Su relevancia es acotada: es un experimento de estilo reproducible y muy ligero, útil para quien quiera añadir un acabado japandi a sus generaciones con SD 1.5 sin coste de entrenamiento apreciable. No es un modelo de producción ni un modelo de lenguaje: no genera texto, no razona y no soporta tool calling. La model card lo describe explícitamente como "un experimento de estilo, no un modelo de producción".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de Stable Diffusion 1.5 (difusión latente, text-to-image) |
| Parametros totales | 1,6 M parámetros entrenables en el adaptador (0,19 % del UNet); el checkpoint base SD 1.5 no se incluye |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; el prompt de texto se tokeniza con el text encoder de SD 1.5, límite estándar de 77 tokens) |
| Tipos de cuantizacion | no disponible (el adaptador se usa en fp16; el base admite las cuantizaciones habituales de SD 1.5) |
| Idiomas soportados | no disponible (los prompts se procesan con el text encoder de SD 1.5, predominantemente inglés) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (adaptador LoRA para diffusers; fichero de 6,4 MB) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 8 insertado en las proyecciones de atención del UNet de Stable Diffusion 1.5 (`to_q`, `to_k`, `to_v`, `to_out`). No modifica el text encoder ni el VAE; solo añade matrices de bajo rango que desplazan las activaciones del UNet hacia el estilo objetivo. El entrenamiento usó 17 imágenes (7 salones, 5 dormitorios, 2 comedores, 2 cocinas y 1 detalle), con captions que indican el tipo de habitación, durante 800 pasos a resolución 512x512, learning rate 1e-4 y precisión mixta fp16. El coste fue de 4,9 minutos en una T4 con 2,1 GB de pico de memoria.

No se documenta el uso de RLHF, DPO ni decodificación especulativa, algo que no aplica a un modelo de difusión. La innovación destacable es la economía extrema del entrenamiento: 1,6 M de parámetros y menos de cinco minutos de GPU para obtener un cambio de estilo medible. La model card advierte que parte de las imágenes de entrenamiento son renders generados por IA y que las imágenes no se comparten.

## Capacidades

- Generación de imágenes text-to-image con estilización japandi sobre Stable Diffusion 1.5.
- Transferencia de estilo a tipos de habitación no presentes en el entrenamiento (se documenta oficina en casa y, parcialmente, baño).
- Control de intensidad del estilo mediante el parámetro `scale` en `cross_attention_kwargs` (0,0 sin efecto; 1,0 máximo).
- Activación mediante la palabra clave `jpdi` en el prompt.
- Composición con otros LoRA y con el ecosistema diffusers (carga con `load_lora_weights`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües verificadas.
- No dispone de modo thinking, visión, audio ni otras capacidades especiales.

## Casos de uso

- Prototipado rápido de interiores: cargar el LoRA sobre SD 1.5 y generar variaciones de salón o dormitorio con prompt como "a photo of a jpdi style bedroom" para explorar direcciones visuales antes de encargar renders de mayor calidad.
- Moodboards para diseño de interiores: producir varias imágenes con el mismo seed y distintas intensidades (0,5 y 1,0) para comparar la evolución del estilo, tal como hace la propia model card.
- Previsualización de estancias en herramientas de decoración: integrar el adaptador en una app que use diffusers y permita al usuario elegir el grado de estilo japandi mediante un control deslizante.
- Generación de material de marketing para mobiliario: crear imágenes de ambiente con maderas claras y lino para catálogos o redes, aceptando la resolución nativa de 512x512 de SD 1.5.
- Experimentación académica con LoRA: servir de ejemplo reproducible de entrenamiento de estilo con dataset mínimo (17 imágenes, 800 pasos) para estudiar sobreajuste y transferencia.
- Fines educativos: demostrar el flujo completo de carga de un LoRA en diffusers y el efecto del parámetro `scale` sobre la similitud de estilo medida con CLIP.
- Exploración creativa personal: añadir un acabado coherente a ilustraciones o conceptos de interior sin disponer de GPU de gama alta, dado que el adaptador pesa 6,4 MB.

## Benchmarks y rendimiento

La model card incluye una evaluación con CLIP sobre 5 tipos de habitación, un seed por tipo:

| Fuerza del LoRA | Similitud de estilo | Coincidencia con el prompt | Similitud máxima media con una foto de entrenamiento |
|---|---|---|---|
| 0,0 | 0,775 | 0,274 | 0,775 |
| 0,5 | 0,854 | 0,273 | 0,858 |
| 1,0 | 0,881 | 0,285 | 0,887 |

La similitud máxima de cualquier salida con una única foto de entrenamiento es 0,92, por debajo del umbral de 0,95 que el autor usa para descartar copia. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a un modelo de imagen.

## Requisitos de hardware

- VRAM estimada para inferencia: la del pipeline SD 1.5 en fp16, en torno a 4 GB; el adaptador añade solo 6,4 MB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el entrenamiento se hizo en una T4 gratuita con 2,1 GB de pico.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares con 6 GB o más.
- Opciones de despliegue: diffusers (vía `load_lora_weights`), así como los entornos que admiten LoRA de SD 1.5 (por ejemplo, interfaces basadas en diffusers o ComfyUI con el nodo correspondiente); no se documenta soporte específico para vLLM, llama.cpp, Ollama ni TGI, que no aplican a difusión.
- Latencia y throughput: no disponibles; el entrenamiento de 800 pasos tardó 4,9 minutos en una T4, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parámetros del adaptador | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Japandi Interior LoRA | LoRA de estilo | SD 1.5 | 1,6 M | no aplica | creativeml-openrail-m | Hugging Face, 21 descargas |
| LoRA de estilo genérico para SD 1.5 | LoRA de estilo | SD 1.5 | variable, típicamente 1-10 M | no aplica | variable | amplia en Hugging Face |
| SDXL + LoRA de interiores | LoRA sobre SDXL | SDXL | variable | no aplica (prompt de 77 tokens) | variable | amplia en Hugging Face |

No se dispone de datos de benchmarks comparativos con alternativas concretas en la información proporcionada; la comparación anterior es cualitativa y se limita a la categoría y al formato.

## Limitaciones y advertencias

- Dataset muy pequeño (17 imágenes) y en parte renders generados por IA: el autor lo califica de experimento de estilo, no de modelo de producción.
- Punto débil documentado: las cocinas cambian poco a fuerza 0,5 por haber solo 2 imágenes de cocina; se recomienda fuerza 1,0 en habitaciones poco representadas.
- Riesgo de sobreajuste y de reproducción de las imágenes de entrenamiento; la similitud máxima observada es 0,92, cerca del umbral de 0,95.
- Los prompts se procesan con el text encoder de SD 1.5, predominantemente inglés; no hay idiomas declarados ni soporte multilingüe verificado.
- Resolución nativa de 512x512; no se documenta entrenamiento a resoluciones mayores.
- Licencia creativeml-openrail-m: permite uso comercial con restricciones de la OpenRAIL-M, que el usuario debe revisar; no es una licencia permisiva sin condiciones.
- Las imágenes de entrenamiento no se comparten, lo que dificulta auditar el dataset.
- No aplica a tareas de texto, razonamiento, código ni agentes; cualquier expectativa en ese sentido es un error de categoría.
- El adaptador requiere el checkpoint base SD 1.5, que se descarga por separado y tiene su propia licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mervecaliskan/japandi-interior-lora
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Código del autor: https://github.com/Mervecaliskann
- Librería diffusers: https://github.com/huggingface/diffusers
