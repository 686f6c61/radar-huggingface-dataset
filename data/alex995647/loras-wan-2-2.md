# Alex995647/loras-wan-2.2

## Resumen

El repositorio `Alex995647/loras-wan-2.2` no es un modelo base, sino un espejo (mirror) de 150 adaptadores LoRA para el modelo de generación de vídeo Wan 2.2, desarrollado por Wan-AI. El autor, Alex995647, ha recopilado estos LoRAs desde CivitAI y el Hugging Face Hub, organizándolos en carpetas que incluyen los pesos, un archivo `info.txt` con palabras de activación, ajustes, ventajas e inconvenientes, un `metadata.json` e imágenes de ejemplo. El repositorio ocupa 53,4 GB y está etiquetado como `diffusers` y `safetensors`. El modelo base subyacente es `Wan-AI/Wan2.2-T2V-A14B`, un modelo de texto a vídeo de 14.000 millones de parámetros. La relevancia de este repositorio radica en que actúa como archivo centralizado de una comunidad de LoRAs, facilitando la búsqueda y el uso de estilos, personajes y efectos para Wan 2.2, aunque no aporta trabajo original.

Cada LoRA está catalogado por categoría (estilo visual, corrección de anatomía, personaje, efecto físico, reducción de pasos) y se atribuye a su autor original. El repositorio incluye un `CATALOG.md` como índice y un `REFERENCE.txt` que relaciona modos y checkpoints. No se especifica una licencia global; los términos de cada LoRA viajan con su listado original, por lo que hay que revisar el `info.txt` antes de usarlos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (low-rank adaptation) para Wan-AI/Wan2.2-T2V-A14B |
| Parametros totales | no disponible (cada LoRA tiene un tamaño distinto; el repositorio completo ocupa 53,4 GB) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de generación de vídeo, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los LoRAs no son modelos de lenguaje; el modelo base Wan 2.2 es multimodal de vídeo) |
| Licencia | no disponible (los términos varían por LoRA; consultar el `info.txt` de cada uno) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado por el autor; es un archivo de LoRAs entrenados por terceros. Los LoRAs se aplican sobre el modelo base Wan-AI/Wan2.2-T2V-A14B, que es un modelo de texto a vídeo de 14.000 millones de parámetros. Cada carpeta incluye los pesos del adaptador en formato safetensors, junto con `info.txt` (palabras de activación, ajustes de inferencia, pros/contras y notas sobre encadenamiento de LoRAs), `metadata.json` e imágenes de ejemplo. El README indica que algunos LoRAs son específicos para el modo de imagen a vídeo (I2V) y otros para texto a vídeo (T2V), y que algunos están diseñados para reducir pasos de inferencia. No se proporcionan datos sobre el proceso de entrenamiento de los LoRAs individuales, ni sobre el dataset utilizado, ya que cada uno fue entrenado por su autor original.

## Capacidades

- El repositorio no es un modelo de lenguaje ni un modelo de vídeo en sí; su capacidad reside en los adaptadores LoRA que contiene.
- Los LoRAs permiten modificar el estilo visual de los vídeos generados con Wan 2.2: por ejemplo, `Flat Color - Style`, `80s Fantasy Movie`, `Anime Style` o `Dark Ghibli Fairytales`.
- Incluye LoRAs de corrección de anatomía y detalle, como `Hyperdetailed Colored Pencil` o `wan2.2-i2v-Glass Kiss`, que actúan como fixers para reducir deformidades.
- Hay LoRAs de personajes y sujetos concretos, como `Caucasian Women T2V - Wan 2.2/2.1 Video Lora - K3NK` o el LoRA de `2B (YoRHa No.2 Type B) Nier:Automata`.
- Incluye LoRAs de efectos físicos y transformaciones, como `Sabrina Special Effect` o `POV Intimate Contact`.
- Hay LoRAs de movimiento o coreografía, como `Hip Bump Dance`, `Cat Walk` o `Hip sway`.
- Incluye LoRAs de reducción de pasos o aceleración, como `Wan21 I2V 14B lightx2v (rank64)` o `Camera Tilt-down Undershot`.
- Algunos LoRAs están pensados para encadenarse entre sí; el `info.txt` incluye notas sobre chaining.
- No se mencionan capacidades de tool calling, agentes ni razonamiento multi-paso, ya que el ámbito es la generación de vídeo.

## Casos de uso

- Estilización de vídeos para producción audiovisual: se puede cargar el LoRA `80s Fantasy Movie` sobre Wan 2.2 para generar clips con estética de fantasía ochentera. Es adecuado porque el LoRA modifica la paleta y la iluminación sin necesidad de reentrenar el modelo base.
- Corrección de anatomía en vídeos generados: los LoRAs `Hyperdetailed Colored Pencil` o `wan2.2-i2v-Glass Kiss` se usan como fixers de detalles. Se aplican en el pipeline de inferencia para reducir deformidades en manos, rostros y cuerpos, lo que resulta útil en flujos de producción donde la calidad visual es crítica.
- Generación de personajes recurrentes: el LoRA `Caucasian Women T2V` permite fijar un tipo de personaje concreto en vídeos de texto a vídeo. Es adecuado para creadores que necesitan mantener consistencia de personaje a lo largo de varios clips.
- Efectos físicos y transformaciones: el LoRA `Sabrina Special Effect` añade transformaciones visuales específicas. Se usa en vídeos donde se requiere un efecto de cambio de forma o de aspecto, sin necesidad de postproducción compleja.
- Optimización de la inferencia: el LoRA `Wan21 I2V 14B lightx2v (rank64)` reduce el número de pasos necesarios para generar un vídeo. Es adecuado para entornos donde el tiempo de cómputo es limitado, como en aplicaciones en tiempo real o en servicios con GPU compartida.
- Archivo y preservación de la comunidad: el repositorio funciona como espejo de respaldo de LoRAs de la comunidad, con metadatos e imágenes de ejemplo. Es adecuado para investigadores que quieran estudiar la evolución de los LoRAs de Wan 2.2 o para usuarios que busquen un catálogo centralizado.
- Encadenamiento de LoRAs para estilos combinados: gracias a las notas de chaining en los `info.txt`, se pueden combinar varios LoRAs (por ejemplo, un estilo visual con un fixer de anatomía) para lograr resultados más complejos. Esto es útil en flujos de trabajo avanzados de generación de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de rendimiento para los LoRAs ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio no especifica requisitos de VRAM.
- GPU recomendadas: no disponible. Los requisitos dependen del modelo base Wan 2.2 y del framework utilizado.
- Consumo en GPU de consumo: no disponible. El README no indica si los LoRAs caben en GPU domésticas.
- Opciones de despliegue: el repositorio está etiquetado como `library_name: diffusers`, por lo que los LoRAs se cargan mediante el pipeline de diffusers de Wan 2.2. No se mencionan otros frameworks como vLLM, llama.cpp u Ollama, ya que el ámbito es generación de vídeo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre repositorios equivalentes que permitan una comparación directa. El repositorio es un espejo de LoRAs, no un modelo independiente, por lo que no se puede comparar con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. Los LoRAs individuales pueden heredar sesgos de sus datos de entrenamiento, pero no se documentan en el repositorio.
- Riesgo de alucinación: no disponible (no es un modelo de lenguaje). En el contexto de vídeo, puede haber artefactos visuales o deformidades, pero no se documentan como alucinaciones.
- Limitaciones de contexto o idioma: no disponible. El modelo base Wan 2.2 es de vídeo y no tiene ventana de contexto de texto en el sentido de un LLM.
- Restricciones de licencia: las licencias varían por LoRA. Algunos permiten redistribución, otros restringen el uso comercial. Hay que consultar el enlace fuente en el `info.txt` de cada LoRA y la licencia del modelo base Wan 2.2 antes de usarlos.
- El repositorio es un espejo de trabajo de terceros. Los autores originales pueden solicitar la retirada de sus LoRAs abriendo una discusión en el repositorio.
- El repositorio no ofrece garantías sobre la calidad, la seguridad o la legalidad de los LoRAs contenidos. El usuario es responsable de verificar cada adaptador.

## Enlaces

- https://huggingface.co/Alex995647/loras-wan-2.2
- https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B (modelo base)
- https://www.clipmode.ai/guide/how-to-add-loras-wan-22 (guía para añadir LoRAs Wan 2.2 en ClipMode)
- https://www.runcomfy.com/trainer/ai-toolkit/wan-2-2-i2v-14b-lora-training (guía de entrenamiento de LoRAs Wan 2.2 I2V)
- https://civitai.com/models/1132089 (ejemplo de fuente de un LoRA: Flat Color - Style)
- https://civitai.com/models/789313 (ejemplo: 80s Fantasy Movie)
- https://civitai.com/models/1155749 (ejemplo: Hyperdetailed Colored Pencil)
