# darask0/Krea-2-color-depth-control

## Resumen
Krea 2 Color-Depth Control es un adaptador comunitario no oficial para el modelo de generación de imágenes Krea 2. Añade control espacial explícito mediante dos mapas de entrada: un mapa de color de regiones, donde cada objeto o zona tiene un color plano identificativo, y un mapa de profundidad en escala de grises con cerca = blanco. El adaptador actúa desde el primer paso de denoising y permite fijar posición, escala y orden frontal/trasero de los sujetos sin convertir la imagen de control en contenido.

El problema que resuelve es la deriva de los prompts por región: sin control, Krea 2 puede mover a los sujetos hacia el centro o ignorar el tamaño relativo. La alternativa i2i desde un render 3D conserva el layout pero arrastra el fondo y el color del render. Este adaptador mantiene la generación text-to-image desde ruido puro y usa los mapas como condiciones, con el fondo descrito solo por el prompt. Está pensado para posar maniquíes 3D, mapas de paneles de manga y layouts pintados por regiones.

Técnicamente es un adaptador BF16 safetensors de 0,9 GB que reemplaza la capa `img_in` del transformer `Krea2Transformer2DModel` para aceptar tres latentes concatenados (ruido, color y profundidad) y añade LoRA de rango 64 en 263 capas lineales. Se entrenó sobre Krea 2 Raw y funciona con Krea 2 Turbo en 8 pasos; la referencia de ejecución es Hayate (Rust/CUDA).

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador de control para transformer de difusión `Krea2Transformer2DModel`: `img_in` ampliada a 192 canales + LoRA de rango 64 en 263 capas lineales |
| Parámetros totales | no disponible (adaptador LoRA + `img_in`; repositorio de 0,9 GB) |
| Longitud de contexto | no aplica (generación de imagen text-to-image) |
| Tipos de cuantización | BF16 en safetensors; base entrenada en FP8; no se documentan GGUF, INT8 ni FP4 |
| Idiomas soportados | no disponible |
| Licencia | Krea 2 Community License (other) |
| Formato de pesos | safetensors BF16, claves del módulo diffusers `Krea2Transformer2DModel` |
| Modelo base | krea/Krea-2-Raw |
| Tamaño del repositorio | 0,9 GB |
| Resolución de ejemplo | 1024×1024 |

## Arquitectura y entrenamiento
El adaptador sustituye la proyección de entrada `img_in` del transformer de difusión. La capa original `[6144, 64]` pasa a `[6144, 192]` para concatenar por canales tres latentes de 64 canales empaquetados 2×2: el latente ruidoso, el latente del mapa de color y el latente del mapa de profundidad. Los latentes de control se obtienen con el VAE `AutoencoderKLQwenImage`, usando la media posterior, normalización con `latents_mean`/`latents_std` y el mismo empaquetado 2×2. Un latente cero equivale a "sin control" para esa entrada. La proyección de salida no cambia: el modelo sigue prediciendo el objetivo del latente ruidoso.

El entrenamiento parte de Krea 2 Raw congelado en FP8, con las columnas de control de `img_in` inicializadas a cero. Se añaden LoRA de rango 64 y alpha 64 en las 263 capas lineales del transformer. Los mapas de color provienen de segmentación panóptica de COCO, con cada segmento en un color distinto aleatorio; los mapas de profundidad son de estilo Depth Anything V2 o passes de profundidad de renderizador, con cerca = blanco y normalización al rango de la escena. Se aplicó dropout de control: ambos 20%, solo color 35%, solo profundidad 35%, ninguno 10%. El checkpoint recomendado es el paso 7.500 (`krea2-control.safetensors`); también se publica el paso 10.000. No se documentan RLHF ni DPO.

## Capacidades
- Generación text-to-image con control espacial mediante mapa de color de regiones y mapa de profundidad.
- Regional prompting: cada región del mapa puede llevar su propio prompt; Hayate permite además LoRA por región y grupos de regiones.
- Control desde ruido puro, no image-to-image: la imagen de control no se convierte en contenido y el fondo se describe solo con el prompt.
- Dropout de control en entrenamiento: permite usar solo color, solo profundidad o ambos.
- Ajuste de intensidad (`strength`) y corte temprano por entrada (`color_end`, `depth_end`) para fijar el layout al principio y dejar detalles libres después.
- Compatible con Krea 2 Turbo en 8 pasos y con Krea 2 Raw; todos los ejemplos de la model card usan Turbo a 8 pasos.
- Casos específicos documentados: posing de maniquíes 3D exportados desde three.js y mapas de páginas de manga con 12 regiones.
- No se documentan tool calling, agentes, visión, audio ni otras capacidades multimodales; es un modelo de imagen.

## Casos de uso
- Previsualización de composición para ilustración: se pinta un mapa de color con las regiones y se exporta un depth pass; el adaptador fija posición, escala y orden frontal/trasero antes de un render final más costoso.
- Posing de personajes con maniquíes 3D: se exportan `color.png` y `depth.png` desde un editor de maniquíes; el adaptador reproduce el brazo levantado, el brazo hacia la mesa y la escala de cuerpo completo en una sola pasada.
- Páginas de manga o cómic: un mapa de 12 regiones con colores planos y prompts por región permite generar la página manteniendo la disposición de viñetas y el orden de profundidad; el checkpoint 7.500 es el que mejor evita personajes extra en mapas planos.
- Diseño de interiores y arquitectura: el mapa de profundidad ordena muebles y paredes, mientras el mapa de color asigna materiales o zonas; el fondo y la iluminación se describen en el prompt general.
- Publicidad de producto: se reserva una región para el producto y se varía el prompt de fondo o estilo manteniendo el layout; útil para generar variantes con composición consistente.
- Series de imágenes coherentes: con el mismo mapa de color y depth se pueden cambiar prompts de estilo, iluminación o atmósfera sin que los sujetos se desplacen.
- Automatización con Hayate: el JSON de `--regions` combina mapa, prompts por región, `isolate_until`, adaptador, `strength`, `color_end` y `depth_end`; se puede integrar en un pipeline CLI para lotes de escenas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye evaluación cualitativa sobre entradas no vistas:

| Condición | Comportamiento observado |
|---|---|
| Solo prompts por región | Deriva de posición y tamaño; en la escena de dos personas ambas se mueven al centro |
| i2i desde render 3D | Mantiene el layout, pero arrastra el fondo plano y el gris del render; funciona en una banda estrecha de `strength` |
| Adaptador, paso 7.500 | Sigue colocación, escala y pose; fondo según prompt; mejor resultado en el mapa de manga |
| Adaptador, paso 10.000 | Similar en escenas 3D; en mapas de paneles planos a veces añade una persona extra |

## Requisitos de hardware
- VRAM estimada: no disponible de forma oficial. El adaptador ocupa 0,9 GB y añade latentes de color y profundidad; el requisito principal lo marca el transformer base Krea 2.
- GPU de referencia: RTX PRO 6000. A 1024², con Krea 2 Turbo y 8 pasos, el DiT tarda aproximadamente 2,6 s con control y 2,3 s sin control.
- GPU consumer: no disponible. El tamaño de `img_in` (6144 canales de salida) y el transformer de difusión sugieren requisitos altos, pero no hay datos oficiales de VRAM para GPUs de consumo.
- Despliegue: Hayate (Rust/CUDA) es la implementación de referencia; los pesos usan claves de diffusers `Krea2Transformer2DModel`, por lo que se pueden integrar en flujos compatibles con diffusers. No aplican vLLM, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: solo se conoce el dato de 2,6 s por imagen a 1024² en RTX PRO 6000 con 8 pasos; no hay cifras para otras GPUs ni para lotes.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Entradas de control | Rendimiento cualitativo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este adaptador | no disponible (0,9 GB) | no aplica | color + profundidad | Sigue posición, escala y pose; fondo por prompt | Krea 2 Community | Hugging Face |
| Prompts por región solos | no disponible | no aplica | texto por región | Deriva posiciones y tamaños; sin control de profundidad | Krea 2 Community | Integrado en Krea 2 |
| i2i desde render 3D | no disponible | no aplica | imagen render | Mantiene layout pero arrastra fondo y color; banda estrecha de `strength` | Krea 2 Community | Integrado en Krea 2 |

## Limitaciones y advertencias
- Adaptador no oficial: es un derivado comunitario de Krea 2 y no está hecho ni endorsado por Krea.
- Licencia Krea 2 Community License: es necesario revisar `LICENSE.pdf` antes de uso comercial; la model card no resume las restricciones.
- Sin benchmarks cuantitativos publicados: la evaluación es cualitativa y sobre pocas entradas de ejemplo.
- Sesgos de dominio: los mapas de color de entrenamiento vienen de COCO panoptic y la profundidad de estimadores tipo Depth Anything V2 o renders; esto puede limitar la generalización a otras distribuciones visuales.
- Los colores del mapa son identificadores, no clases semánticas; el negro se usa como "no especificado". Un color no implica un objeto concreto.
- La profundidad es relativa y con cerca = blanco; no es profundidad métrica absoluta.
- El checkpoint de 10.000 pasos puede añadir una persona extra en mapas de paneles planos; el de 7.500 es el recomendado.
- Requiere una implementación compatible con las claves de diffusers o Hayate; no es plug-and-play en cualquier interfaz de usuario.
- No se especifican idiomas soportados ni cobertura multilingüe; los ejemplos incluyen textos en inglés y etiquetas en japonés.
- No se documentan filtros de seguridad, moderación ni resolución distinta de 1024².

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/darask0/Krea-2-color-depth-control
- Modelo base Krea 2 Raw: https://huggingface.co/krea/Krea-2-Raw
- Implementación Hayate: https://github.com/daraskme/hayate
- Licencia Krea 2 Community License: https://huggingface.co/darask0/Krea-2-color-depth-control/blob/main/LICENSE.pdf
- Aviso de atribución NOTICE: https://huggingface.co/darask0/Krea-2-color-depth-control/blob/main/NOTICE
- Ejemplos de escenas 3D: https://huggingface.co/darask0/Krea-2-color-depth-control/tree/main/examples
- Configuración de entrenamiento: https://huggingface.co/darask0/Krea-2-color-depth-control/blob/main/training/config.toml
