# Jatin1999/patent-style-lora

## Resumen

Patent-style LoRA (identificador `Jatin1999/patent-style-lora`) es un adaptador LoRA de rango 16 para Stable Diffusion XL 1.0 que convierte la descripción de un objeto en una figura de patente estadounidense: líneas negras sobre fondo blanco, sombreado a base de tramado de líneas y vistas normalizadas (perspectiva, lateral, alzado). Lo desarrolla el usuario Jatin1999 y se publica bajo licencia OpenRAIL++ con la etiqueta `line-art`. No es un modelo de lenguaje: es un ajuste de estilo sobre un modelo de difusión texto-a-imagen, con un repositorio de 0,1 GB.

El problema que resuelve es concreto: SDXL base tiende a producir fondos beige, texturas de papel y acabados fotográficos cuando se le pide "patent drawing" solo con prompt. El LoRA desplaza la distribución hacia página blanca pura y trazo negro nítido. Según la evaluación del autor (10 sujetos × 3 semillas, sampler y CFG fijos), la proporción de píxeles de borde blanco sube de 0,440 a 0,998 y la proporción de gris cae de 0,241 a 0,038, manteniendo la similitud CLIP con el sujeto (0,301 → 0,316).

Es relevante por su nicho y por su transparencia: documenta el dataset (24 láminas de patentes de diseño de EE. UU. vía DeepPatent), la receta de entrenamiento completa y una evaluación con métricas reproducibles, algo poco habitual en LoRAs de estilo. El entrenamiento se detuvo en el paso 1.500 de 3.000 por sobreajuste, lo que acota su alcance.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre SDXL base 1.0: UNet y ambos text encoders; pipeline de difusión texto-a-imagen |
| Parámetros totales | No disponible el número de parámetros entrenables; LoRA de rango 16 con alpha 16; repositorio de 0,1 GB |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: generación de imagen a 1024 × 1024 píxeles (datos de entrenamiento redimensionados y rellenados a 1024 × 1024) |
| Tipos de cuantización | No especificado; entrenamiento en bf16 y uso documentado en fp16 (`torch.float16`). El adaptador se carga sobre el UNet en fp16 |
| Idiomas soportados | No disponible; los prompts de ejemplo están en inglés |
| Licencia | openrail++ (CreativeML Open RAIL++-M, con restricciones de uso) |
| Formato de pesos | Repositorio en formato diffusers (`load_lora_weights`); no se confirma el formato exacto de los ficheros |
| Modelo base | stabilityai/stable-diffusion-xl-base-1.0 |
| VAE | madebyollin/sdxl-vae-fp16-fix |
| Palabra de activación | `ptnt_style` |
| Fuerza recomendada | 0,7 |
| Pipeline | text-to-image |

## Arquitectura y entrenamiento

El adaptador se aplica sobre SDXL base 1.0, un modelo de difusión latente con UNet y dos text encoders (CLIP ViT-L y OpenCLIP ViT-bigG). El LoRA tiene rango 16 y alpha 16 y se inyecta tanto en el UNet como en ambos text encoders, de modo que el estilo se aprende en el espacio de texto (asociación del token `ptnt_style` con el dominio visual) y en el de generación. Se sustituye el VAE original por `madebyollin/sdxl-vae-fp16-fix` para evitar inestabilidades numéricas en fp16.

Los datos son 24 láminas de dibujos de patentes de diseño estadounidenses obtenidas a través del dataset DeepPatent (Kucer et al., WACV 2022), una figura por lámina, con las etiquetas y números de referencia eliminados de forma deliberada y rellenadas a 1024 × 1024. Hiperparámetros: LR constante 1e-4, AdamW de 8 bits, batch 1, bf16, noise offset 0,1, 1.500 pasos de una ejecución planificada de 3.000 (los checkpoints posteriores sobreajustaban). Todo el entrenamiento se ejecutó en una única NVIDIA L4 en Google Colab. El conjunto es muy pequeño, lo que explica tanto la nitidez del estilo aprendido como su limitada variedad de vistas y tipologías de objeto.

## Capacidades

- Generación de figuras monocromas con estética de patente: líneas negras, fondo blanco, sombreado mediante tramado de líneas.
- Control de vista mediante prompt: perspectiva, lateral, alzado, despiece (`perspective view`, `side view`), según los ejemplos del autor.
- Transferencia de estilo sobre objetos arbitrarios, incluidos los no vistos en entrenamiento (dron, smartwatch, visor VR, patinete, brazo robótico, móvil plegable en la evaluación).
- Adherencia al sujeto preservada: CLIP de similitud con el sujeto ligeramente superior al prompt solo (0,316 frente a 0,301).
- Compatibilidad con negative prompts para suprimir color, fondo gris, fotorrealismo y texto.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de lenguaje: es un adaptador de imagen.
- No hay modo "thinking", visión, audio ni capacidades multimodales más allá del condicionamiento por texto.

## Casos de uso

- Ilustración de documentación técnica interna: generar figuras line-art de componentes (un patinete eléctrico, un brazo robótico) para manuales de montaje o notas de ingeniería, con estética homogénea y sin fondos ni ruido fotográfico.
- Material didáctico y divulgación: producir diagramas de "cómo funciona" con aspecto de figura de patente para clases de tecnología, que resultan legibles en impresión en blanco y negro.
- Prototipado visual de fichas de producto: obtener vistas normalizadas de un concepto antes de encargar el render o el dibujo técnico definitivo, a coste casi nulo y en segundos.
- Generación de datasets sintéticos de line-art: crear corpus de contornos y figuras monocromas para entrenar o evaluar modelos de detección de bordes, vectorización o segmentación de dibujo técnico.
- Storyboards de I+D y presentaciones: ilustrar conceptos de una solicitud de subvención o una memoria técnica con un lenguaje visual coherente y neutro.
- Contenido editorial y ocio: ilustraciones para libros de colorear, puzzles o artículos sobre historia de la tecnología, donde el trazo negro sobre blanco es el formato deseado.
- Exploración creativa de estilo: variaciones de un mismo objeto en distintas vistas manteniendo el trigger `ptnt_style` y una fuerza de 0,7 para conservar el sujeto.

## Benchmarks y rendimiento

Evaluación del autor: 10 sujetos × 3 semillas por condición, sampler, pasos, CFG y negative prompt fijos. Sujetos no vistos en entrenamiento (dron, smartwatch, visor VR, patinete, brazo robótico, móvil plegable).

| Condición | Borde blanco ↑ | Proporción de gris ↓ | CLIP sujeto ↑ |
|---|---|---|---|
| Solo prompt ("patent drawing … line art") | 0,440 | 0,241 | 0,301 |
| LoRA a fuerza 0,7 | 0,998 | 0,038 | 0,316 |

Lectura: la ganancia principal está en la página (fondo blanco casi perfecto y ausencia de papel beige), con una mejora marginal en la similitud CLIP con el sujeto (+0,015), dentro de un margen estrecho. No se han publicado MMLU, HumanEval, GSM8K ni métricas de ese tipo, que no aplican a un modelo de imagen. No hay datos de FID, CLIP score estándar sobre COCO ni comparación con otros LoRAs de line-art.

## Requisitos de hardware

- VRAM para inferencia: el adaptador pesa 0,1 GB; el coste dominante es SDXL base a 1024 × 1024 en fp16, estimado en 8-10 GB de VRAM (estimación, no medida publicada por el autor).
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090. En tarjetas de 8 GB requiere offloading de la CPU, VAE tiling o reducción de resolución.
- GPU de datacenter: A100, H100, L4 y L40S sin problema; el entrenamiento se hizo en una L4 de 24 GB con batch 1 y bf16.
- Despliegue: `diffusers` con `AutoPipelineForText2Image` y `load_lora_weights` es la vía documentada. Herramientas con soporte de LoRA para SDXL (ComfyUI, Forge, Replicate y similares) son compatibles en la práctica, aunque no se verifican en la información disponible.
- Latencia y throughput: no disponibles. No se publican tiempos por imagen, pasos de muestreo ni resultados de compilación (por ejemplo, con torch.compile o TensorRT).

## Comparativa con modelos similares

| Modelo / configuración | Tipo | Resolución | Licencia | Disponibilidad | Borde blanco ↑ |
|---|---|---|---|---|---|
| SDXL base 1.0, solo prompt | Difusión texto-a-imagen | 1024 × 1024 | openrail++ | HuggingFace | 0,440 |
| SDXL base 1.0 + patent-style-lora @ 0,7 | Difusión + LoRA de estilo | 1024 × 1024 | openrail++ | HuggingFace (0 descargas, 0 likes) | 0,998 |
| Otros LoRA de line-art / patente para SDXL | LoRA de estilo | No disponible | No disponible | No disponible | No disponible |

La única comparación cuantitativa publicada es contra el propio modelo base sin el adaptador, en la misma configuración de muestreo. No se dispone de comparación con Flux, SD 3.5 ni con otras LoRAs de dibujo técnico.

## Limitaciones y advertencias

- Las figuras generadas son ilustraciones, no dibujos de patente válidos, y no tienen ningún valor legal. No deben presentarse ante una oficina de patentes.
- El texto y los números de referencia no son fiables: en el entrenamiento se eliminaron las etiquetas de forma intencionada, por lo que el modelo no ha aprendido a rotular.
- No se garantiza la plausibilidad mecánica: las piezas pueden no conectar de forma coherente ni respetar relaciones físicas.
- Dataset muy reducido (24 láminas) y entrenamiento detenido a la mitad por sobreajuste: variedad de vistas, tipologías y convenciones limitada; los objetos muy alejados del dominio pueden degradarse.
- No hay control estructural (ControlNet, pose, profundidad): la composición depende solo del texto y de la semilla, lo que dificulta reproducir exactamente una vista concreta.
- Sesgo de dominio: el estilo imita la convención de patentes de diseño de EE. UU. (trazo grueso, tramado, ausencia de cotas), lo que puede no encajar con normativas de dibujo técnico europeas (ISO/UNE).
- Idioma: solo se documentan prompts en inglés; el comportamiento con prompts en castellano no está verificado.
- Licencia OpenRAIL++: permite uso comercial, pero incluye restricciones de uso basadas en el uso legítimo; conviene revisar los términos antes de integrarlo en un producto. El modelo base SDXL arrastra además sus propias condiciones.
- Modelo sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento ni issues conocidos; no hay garantía de soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jatin1999/patent-style-lora
- Modelo base SDXL 1.0: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- VAE empleado en entrenamiento (sdxl-vae-fp16-fix): https://huggingface.co/madebyollin/sdxl-vae-fp16-fix
- Dataset DeepPatent (Kucer et al., WACV 2022): referencia citada en la model card, sin enlace incluido en la información disponible
- `manifest.csv` con los números de patente del conjunto de entrenamiento: alojado en el repositorio del proyecto del autor, sin URL en la información disponible
