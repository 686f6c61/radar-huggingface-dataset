# Infinity-io/Drama-3-ComfyUI

## Resumen

Drama-3-ComfyUI es una conversión del modelo de síntesis de voz Fish Audio Drama 3, empaquetada específicamente para los nodos nativos de ComfyUI desarrollados por PedroMarinhoDev. El modelo original es un sistema text-to-speech de 35.000 millones de parámetros con arquitectura de mezcla de expertos (MoE), diseñado para clonación de voz, generación de diálogo multi-hablante y control mediante indicaciones inline como `[sighs]` o `[whispers]`. Esta conversión mantiene los pesos originales de Fish Audio pero los reorganiza en ficheros safetensors que permiten ejecutar el modelo en tarjetas gráficas desde 8 GB de VRAM.

La innovación clave reside en la gestión de memoria: aproximadamente el 90% de los parámetros del modelo son expertos enrutados y cada fotograma de audio utiliza solo 8 de los 256 expertos disponibles por capa. Los nodos de ComfyUI mantienen los expertos en RAM del sistema y cachean en la GPU únicamente los que están en uso, lo que permite ejecutar un modelo de 35B en hardware de consumo. El repositorio ocupa 136,1 GB e incluye varias cuantizaciones de los expertos (FP8, int8, W6A8, W4A8) junto con el códec de audio separado.

El modelo es relevante porque democratiza la síntesis de voz de alta calidad con clonación zero-shot y control expresivo fino dentro del ecosistema ComfyUI, un entorno habitualmente orientado a generación de imagen y vídeo. La licencia Fish Audio Community impone restricciones que deben revisarse antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre transformer, con códec de audio separado |
| Parametros totales | 35.000 millones (aproximado, según model card) |
| Parametros activos | 8 de 256 expertos por capa y fotograma de audio (aproximadamente 90% de parámetros son expertos enrutados) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (expertos originales), int8 ConvRot, W6A8, W4A8; capas no-expertas en bf16 |
| Idiomas soportados | no disponible (la model card muestra ejemplos en inglés y portugués, sin lista oficial) |
| Licencia | fish-audio-community-license |
| Formato de pesos | safetensors (fichero único por variante más códec separado) |

## Arquitectura y entrenamiento

Drama 3 emplea una arquitectura de mezcla de expertos en la que la gran mayoría de los parámetros (aproximadamente el 90%) corresponden a expertos enrutados. En cada capa existen 256 expertos y cada fotograma de audio activa únicamente 8, lo que reduce drásticamente el coste computacional por paso de inferencia. Esta conversión para ComfyUI explota esa dispersión para mantener los expertos en RAM del sistema y cachear en VRAM solo los activos, permitiendo inferencia en GPUs de 8 GB. El modelo se distribuye junto a un códec de audio independiente (`drama3_codec.safetensors`, 1,6 GB en fp32) que convierte entre representaciones latentes y波形 de audio.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card original de Fish Audio no está incluida en la información proporcionada. La conversión mantiene los pesos de los expertos tal como Fish Audio los publica en la variante FP8, y ofrece cuantizaciones alternativas (int8 ConvRot, W6A8, W4A8) que según el autor mantienen la calidad con distintas tolerancias: la variante int8 no produjo tomas silenciosas en 12 pruebas de clonación, W6A8 en 16 pruebas, mientras que W4A8 falla con más frecuencia con clips de voz reales.

## Capacidades

- Síntesis de voz (text-to-speech) de alta calidad con generación de audio natural.
- Clonación de voz zero-shot a partir de un clip de referencia corto.
- Generación de diálogo multi-hablante mediante etiquetas `<|speaker:N|>`, con asignación automática de voces cuando no se especifican.
- Control expresivo mediante indicaciones inline: `[sighs]`, `[whispers]`, `[laughs]`, `[pause]`, `[shouting]`, `[singing]`, descripciones de estilo como `[dramatic dungeon master]`.
- Capacidad de canto con control de estilo vocal (`[singing, grand operatic]`, `[singing softly]`).
- Soporte multilingüe parcial: la model card muestra ejemplos funcionales en inglés y portugués, sin lista oficial de idiomas.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso; es un modelo exclusivamente de audio.
- No se documenta soporte de visión ni de audio de entrada más allá del clip de referencia para clonación.

## Casos de uso

- Producción de audiolibros y narración: el modelo genera voces consistentes a lo largo de textos largos y permite clonar una voz de referencia para mantener el timbre del narrador entre capítulos, con control de pausas y énfasis mediante indicaciones inline.
- Doblaje y localización de contenido: con soporte demostrado de inglés y portugués, puede generar versiones dobladas de guiones manteniendo el estilo expresivo original mediante indicaciones como `[whispers]` o `[shouting]`.
- Creación de contenido para videojuegos: la generación de diálogo multi-hablante con etiquetas `<|speaker:N|>` permite producir conversaciones completas entre NPCs sin grabar actores, asignando voces distintas automáticamente cuando no se especifican.
- Podcasts y ficción sonora: la combinación de múltiples hablantes, indicaciones expresivas y capacidad de canto permite producir escenas dramatizadas completas desde un guion de texto dentro de un flujo ComfyUI.
- Prototipado rápido de asistentes de voz: la clonación zero-shot permite generar una voz de marca a partir de una muestra corta y probar variantes de tono y estilo antes de invertir en grabación profesional.
- Accesibilidad y lectura de contenido: conversión de texto a voz natural para lectores de pantalla o aplicaciones de accesibilidad, con control de velocidad implícito mediante pausas y énfasis.
- Integración en pipelines creativos de ComfyUI: al ejecutarse como nodos nativos, puede encadenarse con flujos de generación de vídeo o imagen para producir contenido audiovisual con narración sincronizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta mediciones internas de velocidad: la variante int8 resultó entre un 14% y un 17% más rápida que FP8 en una RTX 3090, y se documentan recuentos de pruebas de clonación sin tomas silenciosas (12 para int8, 16 para W6A8), sin métricas objetivas de calidad como MOS, WER o similitud de hablante.

## Requisitos de hardware

- VRAM mínima: 8 GB según la model card, gracias a la gestión de expertos en RAM del sistema.
- RAM del sistema: aproximadamente 48 GB para las variantes FP8 e int8; aproximadamente 40 GB para W6A8; aproximadamente 32 GB para W4A8.
- GPU recomendadas: RTX 3090 (con la que se midió la ventaja de int8 sobre FP8), así como cualquier GPU consumer con 8 GB o más de VRAM. No se especifican requisitos para A100 o H100.
- Cabe en GPU consumer: sí, desde 8 GB de VRAM, siempre que se cumplan los requisitos de RAM del sistema.
- Opciones de despliegue: nodos nativos de ComfyUI (ComfyUI v0.40 o superior) mediante el repositorio ComfyUI-Drama3; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Almacenamiento: el repositorio completo ocupa 136,1 GB; cada variante de pesos individual pesa entre 24,6 GB y 38,7 GB, más 1,6 GB del códec.
- Latencia y throughput: no disponibles más allá de la comparación relativa int8 frente a FP8 en RTX 3090.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| Drama-3-ComfyUI | 35B (MoE) | no disponible | Fish Audio Community | ComfyUI nativo | Clonación, diálogo multi-hablante, indicaciones expresivas, canto |
| Fish Audio Drama 3 (original) | 35B (MoE) | no disponible | Fish Audio Community | Fish Audio Space / API | Modelo base sin conversión para ComfyUI |
| Alternativas TTS open source de gran escala | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada para establecer una comparación cuantitativa |

No se dispone de información suficiente para comparar parámetros, contexto o rendimiento con alternativas concretas de la misma categoría. La comparación más directa disponible es con el modelo original `fishaudio/drama-3`, del que esta conversión hereda pesos y capacidades.

## Limitaciones y advertencias

- La licencia fish-audio-community-license es una licencia "other" que debe revisarse en el fichero LICENSE antes de cualquier uso comercial; no se garantiza permiso de uso comercial sin cumplir sus términos.
- La variante W4A8 "falla en silencio con más frecuencia con clips de voz reales", según la model card, lo que la hace inadecuada para producción con clonación de voces reales.
- El parámetro top_k por defecto se cambió a 0 porque top_k 30 provocaba tomas silenciosas y pérdida de frases; los usuarios deben conocer este comportamiento.
- Riesgo de alucinación audible: el modelo puede omitir frases o producir silencios inesperados, especialmente con cuantizaciones agresivas.
- No hay lista oficial de idiomas soportados; solo se demuestran inglés y portugués, por lo que el rendimiento en castellano u otros idiomas no está verificado.
- No se documentan sesgos de género, acento o etnia en las voces generadas; la clonación de voces reales plantea riesgos éticos y legales de suplantación.
- El modelo requiere RAM del sistema elevada (32-48 GB), lo que puede ser un cuello de botella en estaciones de trabajo con poca memoria.
- Depende de ComfyUI v0.40 o superior y de los nodos ComfyUI-Drama3; no es un modelo autónomo fuera de ese ecosistema.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente del funcionamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Infinity-io/Drama-3-ComfyUI
- Modelo original: https://huggingface.co/fishaudio/drama-3
- Nodos ComfyUI-Drama3 en GitHub: https://github.com/PedroMarinhoDev/ComfyUI-Drama3
- Página de muestras de audio: https://pedromarinhodev.github.io/ComfyUI-Drama3/
- Qwen3-ASR para transcripciones: https://huggingface.co/PedroMarinhoDev/Qwen3-ASR-ComfyUI
