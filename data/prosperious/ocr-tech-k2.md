# prosperious/ocr-tech-k2

## Resumen

ocr-tech-k2 es un archivo privado (no un modelo publicado de forma convencional) del toolkit `ocr-tech`, rama K2, orientado a OCR híbrido nepalí-inglés y análisis de estructura documental. Lo desarrolla el usuario de Hugging Face `prosperious` y se migró el 16 de noviembre de 2026 desde el directorio `~/ocr/ocr-tech-k2` de un servidor de OCR. El repositorio no contiene una model card técnica al uso, sino una nota de archivado que describe el contenido del paquete.

El artefacto incluye código fuente (`src/`, `scripts/`, `configs/`, `tests/`) y 20 modelos entrenados bajo `runs/hf-*`, cada uno con pesos en `model.safetensors` y bundles de Paddle asociados, además de resultados de benchmark y datos. No se especifican arquitectura, número de parámetros ni longitud de contexto en la información disponible, por lo que la ficha se limita a lo que el autor declara.

Su relevancia es acotada: se trata de un archivo interno con licencia `internal` (etiquetada como `other` en Hugging Face), sin descargas ni interacciones, y con el estado de entrenamiento (`optimizer.pt`, `scheduler.pt`, `rng_state.pth`) deliberadamente excluido. Sirve para inferencia y fine-tuning, pero no permite reanudar un entrenamiento exactamente donde se detuvo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | nepalí (ne), inglés (en) |
| Licencia | internal (etiqueta `other` en Hugging Face) |
| Formato de pesos | `model.safetensors`; bundles de Paddle; `outputs/` y `data/` en shards tar de ~1 GB con índice sha256 (`*.index.json`) |

## Arquitectura y entrenamiento

No se detalla la arquitectura en la información proporcionada. El repositorio contiene 20 modelos entrenados en `runs/hf-*`, cada uno con pesos en `model.safetensors`, junto con bundles de Paddle, lo que sugiere un pipeline basado en PaddleOCR o compatible con él, aunque esto no se confirma en la model card. Tampoco se indican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

El paquete incluye código fuente (`src/`, `scripts/`, `configs/`, `tests/`), resultados de benchmark y datos. Se excluyó explícitamente el estado de entrenamiento (`optimizer.pt`, `scheduler.pt`, `rng_state.pth`), de modo que los checkpoints cargan para inferencia y fine-tuning, pero no para reanudar un run de forma exacta. Los directorios `outputs/` y `data/`, con muchos ficheros pequeños, se empaquetaron en shards tar de aproximadamente 1 GB con índice sha256 para verificación de integridad.

## Capacidades

- OCR híbrido nepalí-inglés: el etiquetado (`ocr`, `document-parsing`, `nepali`) y los idiomas declarados apuntan a reconocimiento de texto en ambos idiomas.
- Análisis de estructura documental (`document-parsing`), según el propósito declarado del toolkit.
- Carga para inferencia y fine-tuning de los 20 checkpoints incluidos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas a nepalí e inglés según la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Digitalización de documentos administrativos en nepalí: el modelo puede aplicarse al reconocimiento de texto en formularios y registros públicos, dado que el toolkit está etiquetado específicamente para nepalí.
- Procesamiento de documentos bilingües nepalí-inglés: útil en organismos y empresas de Nepal que operan con documentación en ambos idiomas, el par exacto que declara soportar el modelo.
- Extracción de estructura documental: el tag `document-parsing` sugiere uso en pipelines que separan texto, tablas y bloques de un documento, aunque no se detallan las capacidades exactas.
- Fine-tuning sobre dominio propio: al incluir código, configuraciones y tests, el paquete permite adaptar los 20 checkpoints a un corpus específico, con la salvedad de que no se puede reanudar el entrenamiento original.
- Evaluación comparativa interna: los resultados de benchmark incluidos en el repositorio permiten contrastar los 20 modelos entre sí antes de elegir uno para producción.
- Reproducción de un pipeline OCR completo: los bundles de Paddle y los shards de datos permiten reconstruir el entorno de inferencia, siempre dentro del uso interno que impone la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio contiene salidas de benchmark según la model card, pero sus cifras no se detallan en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifica el tamaño de los modelos).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: los pesos están en `model.safetensors` y se incluyen bundles de Paddle, lo que apunta a un despliegue con PaddleOCR o frameworks compatibles con safetensors; no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Almacenamiento: los directorios `outputs/` y `data/` se empaquetan en shards tar de aproximadamente 1 GB cada uno, con índice sha256.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparación.

## Limitaciones y advertencias

- Licencia `internal`: no está autorizado el uso comercial ni la redistribución fuera del ámbito del autor; la etiqueta `other` en Hugging Face refleja esta restricción.
- El repositorio es un archivo privado, no un modelo publicado para uso general; tiene 0 descargas y 0 likes.
- No se puede reanudar el entrenamiento de forma exacta al faltar `optimizer.pt`, `scheduler.pt` y `rng_state.pth`.
- Idiomas limitados a nepalí e inglés; no se declara soporte de castellano ni de otras lenguas.
- No se dispone de información sobre sesgos, riesgo de alucinación, arquitectura ni contexto, lo que impide evaluar su comportamiento en producción.
- Los resultados de búsqueda web disponibles (un artículo sobre tecnología zero-knowledge en Gate.io) no guardan relación con este modelo y no aportan datos verificables.

## Enlaces

- Hugging Face: https://huggingface.co/prosperious/ocr-tech-k2
- Artículo sin relación con el modelo (resultado de búsqueda): https://www.gate.com/learn/articles/navigating-the-zero-knowledge-landscape/1212
