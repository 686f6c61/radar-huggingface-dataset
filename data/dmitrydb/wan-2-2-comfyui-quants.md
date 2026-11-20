# DmitryDB/Wan-2.2-ComfyUI-Quants

## Resumen

Este repositorio no contiene un modelo entrenado por su autor, sino una recopilación de checkpoints de difusión de la familia Wan 2.2 de Alibaba, cuantizados a int8 y empaquetados para su uso directo en ComfyUI. DmitryDB distribuye los pesos con nombres de archivo normalizados, junto con los codificadores auxiliares necesarios (UMT5-XXL, VAE de Wan 2.1 y 2.2, Wav2Vec2 y CLIP Vision H), de modo que el usuario pueda colocar cada carpeta en `ComfyUI/models` y cargar los ficheros desde los nodos de ComfyUI sin descargar los repositorios oficiales por separado.

El interés práctico del paquete es la reducción de huella en disco y en VRAM: los checkpoints de 14B pasan de un tamaño típico en fp16 de unos 28 GB a aproximadamente 13,5 GB en int8, y las variantes de 5B quedan en torno a 4,75 GB. Esto permite ejecutar generación de vídeo texto-a-vídeo (T2V) e imagen-a-vídeo (I2V) en GPUs de consumo con 24 GB de VRAM, a costa de una posible pérdida de calidad frente a los pesos originales.

La colección cubre tanto los modelos base de Wan 2.2 (T2V, I2V, TI2V) como derivados de la comunidad (Fun Camera/Control/Inpaint/VACE, Animate, S2V, Bernini-R, ChronoEdit, SVI Camera, SmoothMix, Remix) y algunas variantes con contenido NSFW. No se publican resultados de benchmarks ni pruebas de rendimiento propias: el autor indica explícitamente que la subida no constituye un nuevo test de inferencia o rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelos de difusión para vídeo (familia Wan 2.2); arquitectura interna no detallada en la información disponible |
| Parámetros totales | No disponible de forma explícita; las variantes se identifican como 14B y 5B en los nombres de archivo |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No aplica / no disponible (modelo de vídeo, no de texto) |
| Tipos de cuantización | int8 (sufijo `int8`); también se incluyen ficheros derivados de fp8 (`from-fp8`) y un par etiquetado `FP8H`/`FP8L` |
| Idiomas soportados | No disponible (el prompt textual se procesa con UMT5-XXL, multilingüe, pero no se documenta cobertura) |
| Licencia | `other` (se remite a las licencias de los modelos upstream; consultar Wan-AI y Comfy-Org) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Los pesos son checkpoints de difusión para generación de vídeo de la familia Wan 2.2, publicados originalmente por Wan-AI y reempaquetados por Comfy-Org. El repositorio de DmitryDB no aporta información sobre la arquitectura interna (tipo de backbone, mecanismo de atención, número de capas) ni sobre el proceso de entrenamiento (volumen de datos, composición del dataset, uso de RLHF o ajuste por preferencias). Tampoco se documenta el procedimiento exacto de cuantización más allá de la etiqueta `int8` y del sufijo `lean-Convrot`, que sugiere una conversión orientada a reducir peso preservando la rotación de convoluciones, sin que el autor lo detalle.

La innovación operativa del paquete es la organización por pares de expertos: las variantes de 14B (T2V, I2V, Fun Camera, Fun Control, Fun Inpaint, Fun VACE) se distribuyen como un par `high-noise` / `low-noise` que debe cargarse en ese orden dentro del schedule de muestreo. Las variantes de 5B (TI2V, Fun Control, Fun Inpaint) usan un único checkpoint. El autor advierte de que no deben mezclarse pares high/low de variantes distintas y de que cada derivado (Animate, S2V, Fun, VACE) requiere su propio grafo de condicionamiento.

## Capacidades

- Generación de vídeo a partir de texto (T2V) con los checkpoints `wan2.2-t2v-high-noise` y `wan2.2-t2v-low-noise`.
- Generación de vídeo a partir de imagen (I2V) con el par `wan2.2-i2v-high-noise` / `wan2.2-i2v-low-noise`.
- Generación conjunta texto+imagen a vídeo (TI2V) con el checkpoint único de 5B.
- Control espacial y de cámara mediante las variantes Fun Camera y Fun Control.
- Inpainting de vídeo con las variantes Fun Inpaint (5B y 14B).
- Edición y composición guiada por VACE con el par `wan2.2-fun-vace`.
- Animación de personajes y referencias visuales (Animate, con posible uso de CLIP Vision H).
- Generación de vídeo con audio o sincronización labial (S2V), que emplea Wav2Vec2 como codificador de audio.
- Edición temporal de vídeo con ChronoEdit y variantes de la comunidad (Bernini-R, SVI Camera, SmoothMix, Remix).
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso: es un modelo generativo de vídeo, no un LLM.

## Casos de uso

- Prototipado rápido de vídeo generativo en estaciones con GPU de consumo: los checkpoints int8 de 14B (~13,5 GB) y de 5B (~4,75 GB) permiten cargar el modelo en GPUs de 24 GB y generar clips sin recurrir a pesos fp16 de ~28 GB.
- Iteración de guiones gráficos y previsualización: el par T2V high/low permite generar borradores de escenas a partir de descripciones textuales antes de producir el vídeo final con herramientas de mayor coste.
- Animación de imágenes fijas para marketing: el par I2V convierte fotografías de producto o ilustraciones en clips cortos, útil para catálogos y redes sociales.
- Control de cámara virtual en postproducción: la variante Fun Camera permite definir trayectorias de cámara sobre una escena generada, integrándose en flujos de ComfyUI con nodos de condicionamiento específicos.
- Relleno y eliminación de elementos en vídeo: Fun Inpaint (5B o 14B) sirve para borrar objetos no deseados o reconstruir zonas ocluidas en material ya rodado.
- Sincronización labial y doblaje: S2V, junto con Wav2Vec2, permite generar movimiento facial coherente con una pista de audio, aplicable a localización de contenido audiovisual.
- Edición temporal asistida: ChronoEdit y Bernini-R permiten modificar secuencias existentes manteniendo coherencia temporal, útil en corrección de color, sustitución de fondos o ajustes de vestuario.
- Investigación en cuantización de modelos de difusión: el repositorio ofrece pares comparables en int8 y derivados de fp8 para estudiar el impacto de la precisión en la calidad del vídeo generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que la subida no constituye un nuevo test de inferencia o rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: los checkpoints de 14B en int8 ocupan entre 13,3 y 16,4 GB en disco; en VRAM se requiere espacio adicional para el codificador de texto UMT5-XXL (10,6 GB en bf16), el VAE (0,24 GB para Wan 2.1, 1,31 GB para Wan 2.2) y los latentes de vídeo. En la práctica, se necesita una GPU de 24 GB o más para los pares de 14B y de 8-12 GB para las variantes de 5B.
- GPU recomendadas: para 14B, RTX 4090 (24 GB), RTX 5090 (32 GB), A100 (40/80 GB), H100 (80 GB). Para 5B, RTX 4070 Ti Super, RTX 4080, RTX 3090 o superiores.
- Cabe en GPU de consumo: sí, las variantes de 5B en GPUs de 8-12 GB y las de 14B en GPUs de 24 GB, siempre que se gestione con cuidado la carga del codificador de texto y el VAE.
- Opciones de despliegue: ComfyUI es el entorno objetivo declarado; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de difusión de vídeo). Para pipelines en Python, los pesos pueden cargarse con las librerías de difusión habituales, aunque el autor no lo detalla.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / duración | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DmitryDB/Wan-2.2-ComfyUI-Quants (este repo) | 14B y 5B (según variante) | No disponible | int8, fp8 | other | Hugging Face, empaquetado para ComfyUI |
| Wan-AI/Wan2.2-I2V-A14B (upstream) | 14B | No disponible | fp16 principalmente | Consultar repo oficial | Hugging Face |
| Comfy-Org/Wan_2.2_ComfyUI_Repackaged | 14B y 5B | No disponible | fp16/fp8 según fichero | Consultar repo oficial | Hugging Face |
| nvidia/ChronoEdit-14B-Diffusers | 14B | No disponible | fp16 | Consultar repo oficial | Hugging Face |

La comparativa se limita a los repositorios citados por el autor; no se dispone de datos de rendimiento comparables entre ellos en la información proporcionada.

## Limitaciones y advertencias

- El repositorio es una recopilación no oficial: el autor no entrena ni evalúa los modelos, y los pesos conservan los bytes y nombres de archivo locales de los repositorios de origen.
- La cuantización int8 puede degradar la calidad visual y la coherencia temporal respecto a los pesos originales en fp16; no se documenta el grado de pérdida.
- No se especifican los términos exactos de la licencia `other`; es imprescindible revisar las licencias de Wan-AI y Comfy-Org antes de cualquier uso comercial.
- El repositorio incluye variantes con contenido NSFW (`wan22EnhancedNSFWSVICamera_*`), lo que exige filtrado y control de acceso en entornos de producción.
- Riesgo de alucinación visual: como todo modelo generativo de vídeo, puede producir artefactos, deformaciones anatómicas y movimientos incoherentes, especialmente en secuencias largas.
- La mezcla incorrecta de pares high/low de variantes distintas o el uso del VAE equivocado (Wan 2.1 frente a Wan 2.2) provoca fallos en el grafo de ComfyUI.
- No hay información sobre sesgos demográficos, cobertura idiomática del codificador UMT5-XXL ni robustez frente a prompts adversarios.
- Algunos ficheros derivan de fp8 (`from-fp8`), lo que acumula una doble pérdida de precisión que no se cuantifica.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria documentada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/DmitryDB/Wan-2.2-ComfyUI-Quants
- Modelo upstream Wan 2.2 I2V A14B: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- Reempaquetado oficial para ComfyUI: https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged
- Bernini-R: https://huggingface.co/Comfy-Org/Bernini-R
- ChronoEdit 14B: https://huggingface.co/nvidia/ChronoEdit-14B-Diffusers
- SCAIL-2: https://huggingface.co/zai-org/SCAIL-2
