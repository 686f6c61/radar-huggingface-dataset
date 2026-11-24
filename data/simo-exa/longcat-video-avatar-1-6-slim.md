# simo-exa/longcat-video-avatar-1.6-slim

## Resumen

LongCat-Video-Avatar 1.6 slim es un paquete de redistribución no oficial del modelo de generación de vídeo con avatar de Meituan LongCat. No se trata de un modelo nuevo ni de un ajuste fino: el autor (simo-exa) ha combinado en un único repositorio los pesos de `meituan-longcat/LongCat-Video-Avatar-1.6` y de su modelo base `meituan-longcat/LongCat-Video`, sin modificar ningún fichero (los pesos son idénticos byte a byte a los originales). El objetivo es que el script de inferencia de avatares pueda ejecutarse desde una sola instantánea del modelo, ya que por defecto busca el modelo base en un directorio hermano.

El repositorio pesa 63,2 GB y se distribuye en formato diffusers/ONNX/safetensors bajo licencia MIT. Se han eliminado directorios auxiliares (assets, LoRAs, variantes int8, ficheros duplicados de Whisper) para reducir el tamaño, pero se mantiene la estructura de carpetas que espera el pipeline: `LongCat-Video-Avatar-1.6/` como `--checkpoint_dir` y `LongCat-Video/` como modelo base adyacente.

Es relevante para quien quiera desplegar generación de vídeo conversacional con avatar (sincronización labial y movimiento a partir de audio) sin tener que descargar y organizar manualmente dos repositorios separados. La ficha se centra en lo que declara el bundle; los detalles de arquitectura y entrenamiento del modelo subyacente no están documentados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión para vídeo; pipeline `diffusers`) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el bundle excluye explícitamente la variante `base_model_int8`) |
| Idiomas soportados | no disponible |
| Licencia | MIT (copyright Meituan LongCat) |
| Formato de pesos | safetensors, ONNX, diffusers |
| Tamaño del repositorio | 63,2 GB |
| Modelos de origen | `meituan-longcat/LongCat-Video-Avatar-1.6` (rev. `acfc628…`), `meituan-longcat/LongCat-Video` (rev. `03b5552…`) |
| Componentes incluidos | pesos del avatar, modelo base de vídeo, `whisper-large-v3` (parcial) |
| Componentes excluidos | `dit/*`, `lora/*`, `assets/*`, `base_model_int8/*`, ficheros `.bin` y `.fp32` de Whisper |

## Arquitectura y entrenamiento

No hay información sobre la arquitectura interna en la documentación del bundle. Por los tags (`diffusers`, `onnx`, `safetensors`) y por el nombre del modelo base, se trata de un sistema de difusión para generación de vídeo, con un módulo específico de avatar que incorpora un codificador de audio basado en `whisper-large-v3` para condicionar la generación a la pista de voz. El pipeline se ejecuta con la librería `diffusers`.

El bundle no aporta datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) ni innovaciones técnicas del modelo original. Tampoco se ha entrenado ni modificado nada: es una copia de pesos upstream. Cualquier detalle sobre el proceso de entrenamiento debe consultarse en las model cards originales de Meituan LongCat, que se conservan dentro del repositorio como `LongCat-Video-Avatar-1.6/README.md` y `LongCat-Video/README.md`.

## Capacidades

- Generación de vídeo con avatar a partir de audio: el propósito declarado del bundle es ejecutar el script de inferencia de avatares con un único snapshot.
- Sincronización con voz: la inclusión de `whisper-large-v3` sugiere condicionamiento por audio para sincronización labial y expresión.
- Generación de vídeo base: el repositorio incluye `LongCat-Video`, el modelo de vídeo general sobre el que se construye la variante avatar.
- Compatibilidad con `diffusers` y exportación ONNX.
- Capacidades de texto, razonamiento, código, tool calling, agentes o multilingüismo: no disponibles (es un modelo de vídeo, no un LLM).
- Modo thinking, visión o audio de entrada general: no disponible más allá del condicionamiento por voz descrito.

## Casos de uso

- Generación de avatares parlantes para vídeo corporativo: a partir de una grabación de voz y una imagen o clip de referencia, el pipeline produce un vídeo con el avatar sincronizado, útil para formación interna o comunicados sin regrabar en cámara.
- Doblaje y localización de vídeo: sustituir la pista de audio de un vídeo existente por una versión en otro idioma y regenerar el movimiento labial del hablante, manteniendo el resto del plano.
- Prototipado de asistentes virtuales con cara: integrar el pipeline en una demo de asistente conversacional donde la respuesta hablada se acompaña de un avatar animado; el bundle simplifica el despliegue al tener todos los pesos en un solo snapshot.
- Investigación en generación de vídeo condicionada por audio: punto de partida reproducible para experimentar con el modelo de Meituan sin gestionar dos descargas y rutas manuales.
- Producción de contenido educativo: generar clips de un presentador virtual a partir de guiones locutados, reduciendo coste de rodaje para cursos y tutoriales.
- Pruebas de integración en pipelines `diffusers`: validar el flujo completo (carga de checkpoint, resolución del modelo base adyacente, inferencia) antes de invertir en infraestructura sobre los repositorios originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la documentación. Como referencia de orden de magnitud, el repositorio ocupa 63,2 GB, por lo que la inferencia en precisión completa requiere GPUs de clase servidor con 80 GB (A100, H100) o sharding multi-GPU; no se confirma el pico real de memoria.
- GPU recomendadas: no disponible. Por tamaño, A100/H100 de 80 GB son las candidatas razonables; una RTX 4090 (24 GB) no parece suficiente para el conjunto completo en precisión nativa.
- Consumer GPU: no cabe previsiblemente en GPUs de consumo con 24 GB o menos en precisión completa; no se documentan variantes cuantizadas utilizables (la int8 se excluyó del bundle).
- Despliegue: `diffusers` (librería declarada) y ONNX Runtime; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusión de vídeo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño repo | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| simo-exa/longcat-video-avatar-1.6-slim | Bundle de difusión vídeo-avatar | 63,2 GB | MIT | HF (0 descargas) | Redistribución no oficial, pesos idénticos a upstream |
| meituan-longcat/LongCat-Video-Avatar-1.6 | Modelo original de avatar | no disponible | MIT | HF (oficial) | Fuente del bundle; requiere el modelo base por separado |
| meituan-longcat/LongCat-Video | Modelo base de vídeo | no disponible | MIT | HF (oficial) | Incluido dentro del bundle como carpeta adyacente |

No se dispone de datos de rendimiento ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Redistribución no oficial: el repositorio lo publica un tercero (simo-exa), no Meituan LongCat; no hay garantía de mantenimiento, soporte ni actualizaciones.
- Cero tracción: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.
- Sin documentación técnica propia: no hay datos de arquitectura, parámetros, contexto ni benchmarks en el bundle; la model card se limita a describir el repaquetado.
- Componentes eliminados: se excluyen `dit/*`, `lora/*`, `base_model_int8/*` y parte de los ficheros de Whisper (`.bin`, `.fp32`), lo que puede romper scripts que esperen esas rutas o variantes.
- Dependencia de estructura de carpetas: el script espera `LongCat-Video/` en el directorio padre de `--checkpoint_dir`; mover o renombrar carpetas rompe la resolución del modelo base.
- Riesgo de alucinación visual y artefactos: inherente a los modelos generativos de vídeo; no hay evaluación publicada en este bundle.
- Sesgos: no documentados; al ser un modelo de avatar, puede reproducir sesgos de los datos de entrenamiento originales en rasgos faciales, voz o demografía.
- Idiomas: no disponibles; el condicionamiento por voz depende de Whisper, pero no se especifica cobertura lingüística del pipeline de avatar.
- Licencia MIT: permite uso comercial, pero conviene verificar los términos de los modelos de origen y de `whisper-large-v3` incluido; el aviso de copyright corresponde a Meituan LongCat.

## Enlaces

- Repositorio del bundle: https://huggingface.co/simo-exa/longcat-video-avatar-1.6-slim
- Modelo original de avatar: https://huggingface.co/meituan-longcat/LongCat-Video-Avatar-1.6
- Modelo base de vídeo: https://huggingface.co/meituan-longcat/LongCat-Video
- Organización Meituan LongCat en Hugging Face: https://huggingface.co/meituan-longcat
- Librería diffusers: https://github.com/huggingface/diffusers
