# Nekodeus/neko-alpha4-sdxl-v1

## Resumen

`Nekodeus/neko-alpha4-sdxl-v1` es un adaptador LoRA de personaje para Stable Diffusion XL, entrenado por el usuario Nekodeus para generar imágenes fotorrealistas de Brad Pitt a partir de un token disparador (`alpha4`). No es un modelo generativo autónomo: es un conjunto de pesos de bajo rango (dimensión 8, alpha 8, aproximadamente 0,2 GB de repositorio en formato safetensors) que se carga sobre `stabilityai/stable-diffusion-xl-base-1.0` mediante `diffusers` o ComfyUI. El pipeline declarado es `text-to-image` y la licencia del adaptador es Apache-2.0.

El interés técnico del artefacto es acotado pero claro: sirve como ejemplo reproducible de entrenamiento de una LoRA de identidad con un dataset pequeño (~100 imágenes verificadas facialmente con OpenCV y etiquetadas con una caption uniforme, `a photo of alpha4 person`), 1500 pasos a 1024 px sobre una NVIDIA P100 de Kaggle, optimizador AdamW de 8 bits y batch 2. Es un caso de estudio útil sobre ajuste fino de bajo coste, consistencia de identidad y riesgo de sobreajuste, más que una herramienta de propósito general.

Su relevancia práctica es limitada: cero descargas y cero valoraciones en el momento de la consulta, sin benchmarks publicados y con metadatos de fecha incoherentes (creación y actualización en octubre de 2026). Debe evaluarse como un experimento de autor individual dentro de la serie "Hollywood alpha", junto a las variantes SD1.5 y SDXL del mismo autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de bajo rango (dim 8 / alpha 8) sobre el UNet de un modelo de difusión latente SDXL (text-to-image) |
| Parámetros totales | no disponible (el repositorio solo contiene el adaptador; el modelo base no se incluye) |
| Longitud de contexto | no aplica (modelo de difusión; el condicionamiento se realiza mediante prompt de texto, no por ventana de contexto) |
| Tipos de cuantización | no disponible; el adaptador se distribuye en safetensors y se aplica sobre el modelo base en precisión fp16/bf16 |
| Idiomas soportados | no disponibles en la información; las captions de entrenamiento están en inglés |
| Licencia | apache-2.0 (adaptador); el modelo base SDXL se rige por su propia licencia |
| Formato de pesos | safetensors (`alpha4.safetensors`) |

## Arquitectura y entrenamiento

El adaptador se inyecta sobre `stabilityai/stable-diffusion-xl-base-1.0`, un modelo de difusión latente con UNet y doble codificador de texto. La LoRA emplea rango 8 y alpha 8, es decir, una actualización de bajo rango de las matrices del UNet con escala unitaria (alpha/dim = 1), lo que limita la capacidad de modificación del modelo base y hace que el peso del artefacto sea mínimo frente al checkpoint completo. El repositorio ocupa 0,2 GB y el archivo de pesos se carga con `pipe.load_lora_weights(..., weight_name="alpha4.safetensors")`.

El entrenamiento se realizó a 1024 px durante 1500 pasos, con learning rate 1e-4, batch 2, AdamW de 8 bits y xformers, sobre una NVIDIA P100 de Kaggle en modo completamente offline. El dataset consta de aproximadamente 100 imágenes de Brad Pitt, filtradas con verificación facial en OpenCV y etiquetadas con una caption uniforme y stub (`a photo of alpha4 person`), publicadas como `nekodeus/alpha4-brad-pitt`. No se documenta uso de RLHF, DPO ni decodificación especulativa; no hay información sobre composición del dataset más allá del recuento y el filtrado facial, ni sobre regularización, técnica de captions o augmentation.

## Capacidades

- Generación de imágenes text-to-image a 1024 px condicionada por el modelo base SDXL, con especialización en un único sujeto (identidad de Brad Pitt).
- Activación mediante el token disparador `alpha4`, que debe incluirse en el prompt para que la identidad se manifieste.
- Transferencia de identidad facial consistente entre generaciones, gracias al ajuste sobre ~100 imágenes verificadas con OpenCV.
- Compatibilidad con `diffusers` (carga mediante `load_lora_weights`) y con ComfyUI (nodo LoRA loader y archivo en `models/loras/`).
- Composición con otras LoRAs y con el pipeline SDXL estándar, al ser un adaptador y no un checkpoint completo.
- Control de estilo, iluminación y encuadre heredado del modelo base y del prompt; el adaptador no aporta capacidades propias en ese terreno.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión de entrada, audio ni modo "thinking": no es un modelo de lenguaje.

## Casos de uso

- Previsualización de personajes en preproducción audiovisual: generar retratos consistentes del sujeto con `alpha4` para ilustrar un guion o un storyboard, apoyándose en la resolución nativa de 1024 px de SDXL.
- Pruebas de iluminación y encuadre en ComfyUI: colocar el archivo `alpha4.safetensors` en `models/loras/`, cargarlo con un nodo LoRA loader y barrer prompts de luz o plano para comparar variantes sin reentrenar.
- Generación por lotes en pipelines Python: integrar la carga de la LoRA en un script de `diffusers` sobre GPU para producir series de imágenes con identidad estable en un proceso batch.
- Investigación sobre sobreajuste en LoRAs de identidad: usar la configuración documentada (dim 8, 1500 pasos, ~100 imágenes, captions stub) como línea base reproducible para estudiar el equilibrio entre fidelidad facial y flexibilidad de prompt.
- Docencia y talleres de ajuste fino económico: el registro completo (P100 de Kaggle, AdamW 8-bit, batch 2, lr 1e-4) permite replicar el experimento en hardware de gama media sin coste de API.
- Evaluación comparativa SD1.5 frente a SDXL: contrastar esta LoRA con `Nekodeus/neko-hollywood-alpha-sd15-v1` para medir cómo cambia la fidelidad de identidad y el detalle a 1024 px frente a la resolución de la variante SD1.5.
- Creación de material de prueba sintético para pipelines de visión por computador, siempre que se resuelvan previamente las cuestiones de derecho de imagen indicadas en las advertencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No constan métricas cuantitativas (FID, CLIP score, similitud facial, LPIPS) ni comparaciones medidas frente al modelo base o frente a otras LoRAs de personaje.

## Requisitos de hardware

- VRAM para inferencia: el adaptador en sí ocupa ~0,2 GB, pero la generación exige cargar el UNet y los codificadores de texto de SDXL; en fp16 se necesitan del orden de 7-8 GB de VRAM para 1024 px, y en torno a 10-12 GB para trabajar con comodidad en ComfyUI con modelos auxiliares (estimación para el modelo base, no medida sobre este adaptador).
- GPU recomendadas: A100, H100 o L40S para lotes grandes y producción; RTX 4090 o RTX 3090 para inferencia interactiva a 1024 px.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 y, con cuantización del base o `enable_model_cpu_offload`, en tarjetas de 8-12 GB como RTX 3060 Ti o RTX 4070.
- El entrenamiento documentado se realizó en una NVIDIA P100 (Kaggle, sin coste de API), lo que sitúa el coste de reproducción del ajuste en el rango de una sesión gratuita.
- Opciones de despliegue: `diffusers` (referencia del autor), ComfyUI (flujo indicado en la model card), Automatic1111/Forge; vLLM, llama.cpp, Ollama y TGI no aplican porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Base | Formato | Resolución | Licencia | Estado |
|---|---|---|---|---|---|
| `Nekodeus/neko-alpha4-sdxl-v1` | SDXL base 1.0 | LoRA safetensors, dim 8 | 1024 px | apache-2.0 (adaptador) | 0 descargas, 0 likes, sin benchmarks |
| `Nekodeus/neko-hollywood-alpha-sdxl-v1` | SDXL | LoRA safetensors | no disponible | no disponible en la información | Referenciado por el autor como pack SDXL de la misma serie |
| `Nekodeus/neko-hollywood-alpha-sd15-v1` | Stable Diffusion 1.5 | LoRA safetensors | no disponible | no disponible en la información | Referenciado por el autor como pack SD1.5 de la misma serie |
| `stabilityai/stable-diffusion-xl-base-1.0` (sin LoRA) | — | Checkpoint completo | 1024 px | licencia propia del modelo base | Modelo de referencia, ampliamente adoptado |

## Limitaciones y advertencias

- Sesgos del dataset: ~100 imágenes de una única persona, sin documentación de equilibrio de edad, etnia, iluminación o encuadre; el modelo reproducirá los sesgos de selección de esas imágenes.
- Riesgo de sobreajuste: 1500 pasos con rango 8 y captions uniformes (`a photo of alpha4 person`) favorecen una fuerte asociación al token, con posible pérdida de variedad de pose, vestuario y contexto y tendencia a replicar fondos o composiciones del dataset.
- Flexibilidad de prompt reducida: al no haberse entrenado con captions descriptivas, el control fino mediante texto es limitado; la identidad tiende a dominar sobre el resto de la descripción.
- Alucinación visual: como cualquier modelo de difusión, puede producir anatomía incorrecta, manos deformadas o artefactos en rostros y texto, especialmente fuera de la resolución de entrenamiento.
- Idiomas: no hay información sobre soporte multilingüe; las captions están en inglés y el comportamiento con prompts en castellano no está verificado.
- Licencia: el adaptador se declara Apache-2.0, pero el modelo base SDXL se distribuye bajo su propia licencia con restricciones de uso (CreativeML OpenRAIL++-M); el uso comercial requiere revisar ambas y, en la práctica, la licencia del base prevalece.
- Derecho de imagen: se trata de la likeness de una persona real identificable; la licencia permisiva del adaptador no otorga derechos de imagen ni de publicidad, y el uso comercial del rostro puede infringir normativa de derechos de personalidad según jurisdicción.
- Validación comunitaria nula: cero descargas y cero likes; no existen evaluaciones independientes de calidad ni de estabilidad del resultado.
- Metadatos inconsistentes: las fechas de creación y actualización (27 de octubre de 2026) son posteriores a la consulta, lo que sugiere un repositorio de prueba o una carga con metadatos erróneos.
- En producción: fijar versiones de `diffusers` y del checkpoint base, y almacenar el hash del `alpha4.safetensors` para garantizar reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nekodeus/neko-alpha4-sdxl-v1
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Dataset de entrenamiento (referenciado en la model card): `nekodeus/alpha4-brad-pitt` — https://huggingface.co/datasets/nekodeus/alpha4-brad-pitt
- Variante SD1.5 de la serie: https://huggingface.co/Nekodeus/neko-hollywood-alpha-sd15-v1
- Variante SDXL de la serie: `Nekodeus/neko-hollywood-alpha-sdxl-v1` (referenciada en la model card, sin URL explícita)
- Documentación de `diffusers` para carga de LoRAs: no disponible en la información proporcionada
- Paper, blog o demo adicionales: no disponible en la información proporcionada
