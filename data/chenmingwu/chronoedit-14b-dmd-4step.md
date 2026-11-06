# ChenmingWu/ChronoEdit-14B-DMD-4step

## Resumen

ChronoEdit-14B-DMD-4step es un transformer de edición de imágenes derivado de NVIDIA ChronoEdit-14B mediante destilación por coincidencia de distribuciones (DMD, Distribution Matching Distillation). Lo publica el usuario ChenmingWu en Hugging Face y sustituye únicamente el transformer del pipeline original: el VAE, el codificador de texto, el tokenizer y el codificador de imagen siguen siendo los de `nvidia/ChronoEdit-14B-Diffusers`. El objetivo es reducir el coste de inferencia de 100 evaluaciones de red (50 pasos con CFG 5) a solo 4, sin guiado por clasificador.

La arquitectura subyacente es un transformer de difusión 3D (heredero de Wan2.1 y ChronoEdit) con 16.394.878.784 parámetros reales en safetensors y un repo de 32,8 GB. El modelo opera en resolución 720p con 5 frames y conserva el último frame como imagen editada. Su relevancia actual radica en que mantiene la calidad del modelo de 50 pasos en GEdit-Bench-EN (puntuación global 5,772 frente a 5,644) con una reducción de coste de 25 veces en evaluaciones de red.

La licencia es Apache-2.0, igual que el modelo base, aunque el propio autor advierte que aproximadamente un tercio de los datos de entrenamiento proviene de HQ-Edit, publicado bajo CC BY-NC 4.0, lo que puede condicionar el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión 3D (ChronoEditTransformer3DModel), destilado con DMD |
| Parametros totales | 16.394.878.784 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible (instrucciones de edición en inglés según los benchmarks GEdit-Bench-EN e ImgEdit) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión para edición de imágenes construido sobre ChronoEdit-14B de NVIDIA, que a su vez deriva de Wan2.1. La edición se plantea como un proceso temporal de 5 frames en el que el último frame contiene la imagen editada; el pipeline usa `ChronoEditPipeline` y `ChronoEditTransformer3DModel` del paquete `chronoedit_diffusers`. La inferencia se realiza con un `FlowMatchEulerDiscreteScheduler` configurado con shift 5 y muestreo estocástico, con sigmas fijas en 1,0, 0,75, 0,5 y 0,25, y re-ruido estilo LCM tras cada paso.

El entrenamiento aplica DMD con una score falsa entrenable, al estilo de DMD2 y Self-Forcing. El generador (este checkpoint) se inicializa desde ChronoEdit-14B con su LoRA oficial de destilación a 8 pasos fusionada, y se ajusta completamente con 4 pasos, sin guiado. La score real es ChronoEdit-14B con CFG 5 y prompt negativo vacío; la score falsa es una copia entrenable de ChronoEdit-14B actualizada por flow matching sobre las salidas del generador, con 4 actualizaciones por cada actualización del generador y 20 iteraciones de calentamiento solo para el crítico. Los niveles de ruido se muestrean en un 25 % uniformemente en [0,98, 1] y el resto en niveles shift-5 dentro de [0,02, 0,98]. Se usa AdamW con beta1 = 0, learning rate 5e-7 para el generador y 2e-6 para la score falsa, 200 iteraciones con batch 7 en 7 GPUs a 720p y 5 frames; los pesos publicados son la EMA del generador. Las condiciones de entrenamiento son unas 9.500 imágenes fuente con instrucciones de edición muestreadas de OmniEdit-Filtered-1.2M, HQ-Edit y UltraEdit, y la pérdida DMD no utiliza imágenes objetivo.

## Capacidades

- Edición de imágenes guiada por instrucciones en lenguaje natural (image-to-image), manteniendo el último frame de una secuencia de 5 frames como resultado.
- Inferencia en 4 evaluaciones de red sin classifier-free guidance, frente a 100 del modelo base con 50 pasos y CFG 5.
- Edición de atributos de objetos, cambios de estilo y modificaciones globales de la escena, dentro de los límites descritos por el autor.
- Compatibilidad con el ecosistema diffusers y con el pipeline oficial de ChronoEdit.
- No soporta tool calling ni function calling: es un modelo generativo de imagen, no un LLM.
- No dispone de modo thinking, visión general ni audio; su única modalidad de entrada es imagen más instrucción textual.
- Capacidades multilingües no documentadas; los benchmarks publicados son en inglés (GEdit-Bench-EN).

## Casos de uso

- Edición interactiva de imágenes en producción: el modelo permite aplicar instrucciones de edición con 4 evaluaciones de red, lo que reduce la latencia y el coste por edición en comparación con el modelo base de 50 pasos, adecuado para interfaces de edición con respuesta casi inmediata.
- Prototipado rápido de pipelines de edición: al integrarse en diffusers y reutilizar VAE, text encoder y tokenizer de `nvidia/ChronoEdit-14B-Diffusers`, se puede sustituir el transformer en un pipeline existente sin rehacer el resto del sistema.
- Generación de variaciones controladas de material gráfico: útil para equipos de diseño que necesitan modificar color, estilo o composición de una imagen manteniendo la estructura, con la advertencia de que el autor documenta sobre-edición en algunos casos.
- Investigación en destilación de modelos de difusión: el checkpoint sirve como referencia reproducible de DMD con score falsa entrenable aplicada a un transformer de edición de 14B, con hiperparámetros y esquema de ruido documentados.
- Evaluación comparativa de métodos de aceleración: permite contrastar 4 pasos sin guiado frente a 50 pasos con CFG 5 y frente a la LoRA oficial de 8 pasos en GEdit-Bench-EN e ImgEdit con los mismos jueces open source.
- Edición por lotes en entornos con recursos limitados: al requerir solo 4 evaluaciones de red, reduce el cómputo por imagen y facilita procesar lotes en infraestructura con menos GPUs que el modelo base.

## Benchmarks y rendimiento

Configuración común: 720p (área 1280x720, lados múltiplos de 16), 5 frames, último frame conservado, seed 0, instrucciones crudas de los benchmarks sin mejorador de prompt. Los jueces son modelos open source (VIEScore con Qwen2.5-VL-72B-Instruct-AWQ para GEdit-Bench-EN e ImgEdit-Judge para ImgEdit), por lo que los números absolutos no son comparables con papers que usan GPT-4.1 o GPT-4o.

| Modelo | NFE | GEdit SC | GEdit PQ | GEdit O | ImgEdit |
|---|---|---|---|---|---|
| ChronoEdit-14B, 50 pasos, CFG 5 | 100 | 5,803 | 7,269 | 5,644 | 3,487 |
| ChronoEdit-14B + LoRA oficial de destilación a 8 pasos | 8 | 3,621 | 7,589 | 3,637 | 3,444 |
| Este modelo, 4 pasos | 4 | 5,860 | 7,468 | 5,772 | 3,306 |

Con bootstrap emparejado al 95 % frente al modelo de 50 pasos: GEdit O +0,22 [-0,01, +0,45]; ImgEdit -0,17 [-0,26, -0,08]. El checkpoint publicado es la iteración 200 de 300, seleccionada sobre un cuarto fijo de GEdit-Bench-EN (cada cuarto ítem en inglés); sobre los otros 454 ítems su GEdit O es 5,469 frente a 5,242 del modelo de 50 pasos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 16,39B parámetros en bfloat16 los pesos ocupan aproximadamente 32,8 GB, por lo que se necesita al menos esa cantidad de memoria más el overhead del VAE, text encoder y activaciones.
- GPU recomendadas: no especificadas por el autor; por tamaño de pesos, GPUs de 40 GB o más (A100 40/80 GB, H100) son las candidatas naturales para ejecución en bfloat16 sin cuantización.
- ¿Cabe en GPU de consumo? No se ha documentado; en bfloat16 no cabe en GPUs de 24 GB como la RTX 4090 sin cuantización o descarga a CPU, y el autor no publica variantes cuantizadas.
- Opciones de despliegue: diffusers con el paquete `chronoedit_diffusers` del repositorio de ChronoEdit; no se documentan soportes para vLLM, llama.cpp, Ollama o TGI (son herramientas orientadas a LLMs).
- Latencia y throughput: el autor indica 4 evaluaciones de red por edición frente a 100 del modelo base, pero no publica tiempos absolutos ni throughput medido.

## Comparativa con modelos similares

| Modelo | Parámetros | Pasos / NFE | Contexto de edición | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ChronoEdit-14B-DMD-4step (este) | 16,39B | 4 / 4 | 720p, 5 frames | Apache-2.0 (con caveat de datos HQ-Edit) | Hugging Face, diffusers |
| ChronoEdit-14B (NVIDIA) | ~14B (según nombre) | 50 con CFG 5 / 100 | 720p, 5 frames | Apache-2.0 | Hugging Face, diffusers |
| ChronoEdit-14B + LoRA oficial 8 pasos | ~14B | 8 / 8 | 720p, 5 frames | Apache-2.0 | Hugging Face, diffusers |

No se dispone de información sobre otros modelos comparables de la misma categoría (edición de imágenes por difusión destilada) en la documentación proporcionada.

## Limitaciones y advertencias

- Sobre-edición en algunos casos: cambios de color en objetos que deberían permanecer iguales y alteraciones de material de sujetos completos.
- Renderizado de texto poco fiable.
- Eliminación de objetos débil, igual que en el modelo base.
- Solo se han probado 720p con 5 frames y el sampler específico descrito; otros regímenes no están validados.
- El checkpoint se seleccionó sobre un cuarto de GEdit-Bench-EN, lo que introduce un sesgo de selección; el autor publica las puntuaciones sobre las otras tres cuartas partes.
- Riesgo de alucinación visual: no se documenta de forma explícita, pero como modelo generativo de imagen puede introducir contenido no presente en la fuente.
- Sesgos: no documentados por el autor.
- Licencia: Apache-2.0, pero aproximadamente un tercio de las imágenes e instrucciones de entrenamiento provienen de HQ-Edit (CC BY-NC 4.0), por lo que conviene revisar la implicación antes de un uso comercial.
- Idiomas: no se documenta soporte multilingüe; los benchmarks son en inglés.

## Enlaces

- Hugging Face: https://huggingface.co/ChenmingWu/ChronoEdit-14B-DMD-4step
- Modelo base: https://huggingface.co/nvidia/ChronoEdit-14B-Diffusers
- Repositorio ChronoEdit (NVIDIA): https://github.com/nv-tlabs/ChronoEdit
- Wan2.1: https://github.com/Wan-Video/Wan2.1
