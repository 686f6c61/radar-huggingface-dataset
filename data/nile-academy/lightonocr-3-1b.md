# nile-academy/lightonocr-3-1b

## Resumen

lightonocr-3-1b es un espejo de datos (mirror) del modelo OCR LightOnOCR-3-1B, publicado por el repositorio Nile Academy bajo el identificador `nile-academy/lightonocr-3-1b`. No se trata de un desarrollo propio: el modelo original fue desarrollado por LightOn (repositorio `lightonai/LightOnOCR-3-1B`) y este repositorio preserva los checkpoints declarativos y las model cards originales en el directorio `original/<source-commit>/`, junto con los ficheros de despliegue seleccionados en la raíz o en `det/` y `rec/`.

El propósito del repositorio es servir como fuente fijada e inmutable (source-pinned mirror) para consumidores de la plataforma Wekala, verificando la identidad de los ficheros mediante `publication.json` y conservando los checkpoints de inferencia originales de Paddle separados de las exportaciones ONNX oficiales. El paquete no incluye código Python, checkpoints en pickle, servidores de inferencia ni código ejecutable de modelo.

Por el nombre y la estructura del repositorio, se trata de un modelo de reconocimiento óptico de caracteres (OCR) de aproximadamente 1B de parámetros, con licencia Apache 2.0 y pesos en formato safetensors. La información pública disponible no detalla arquitectura, contexto ni datos de entrenamiento; la model card se centra en aspectos de procedencia, derechos y cualificación del mirror, no en las capacidades técnicas del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | ~1B (inferido del nombre del modelo; no confirmado en la informacion disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio incluye checkpoints Paddle y exportaciones ONNX; no se detallan cuantizaciones) |
| Idiomas soportados | no disponible (la model card indica que el soporte de arabe es preferente pero que los metadatos de idioma no establecen calidad probada) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, checkpoints Paddle y exportaciones ONNX |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo en la documentación proporcionada. El repositorio es un mirror de datos que preserva los checkpoints declarativos seleccionados y las model cards originales bajo `original/<source-commit>/`, con los ficheros de despliegue en la raíz o en los subdirectorios `det/` (detección) y `rec/` (reconocimiento). Esta estructura sugiere un pipeline OCR de dos etapas, pero no se confirma en la información disponible.

Tampoco se detallan datos de entrenamiento: número de tokens, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas. La model card del mirror se limita a cuestiones de procedencia: verifica identidades de ficheros inmutables, conserva los avisos de licencia upstream y declara explícitamente que la publicación no certifica precisión OCR, fidelidad de cuantización, ajuste a dispositivo ni aceptación en entornos de escritorio, móvil o navegador.

## Capacidades

- Reconocimiento óptico de caracteres (OCR): el modelo está etiquetado con `ocr` y organizado en componentes de detección (`det/`) y reconocimiento (`rec/`).
- Soporte de árabe declarado como preferente por el publicador del mirror, aunque la model card advierte que esto no constituye una puerta de elegibilidad ni garantiza calidad probada.
- Exportaciones ONNX oficiales para despliegue en entornos compilados.
- Checkpoints Paddle de inferencia originales conservados por separado.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni modo thinking.
- No se documentan capacidades multilingües más allá de la mención al árabe.

## Casos de uso

- Digitalización de documentos escaneados: el modelo puede emplearse en pipelines de extracción de texto a partir de imágenes de documentos, usando los componentes de detección y reconocimiento incluidos en el repositorio.
- Procesamiento de documentos en árabe: dado que el publicador declara preferencia por el árabe, es un candidato para digitalización de corpus en ese idioma, aunque la calidad debe validarse empíricamente antes de producción.
- Integración en adaptadores compilados: los consumidores de Wekala pueden suministrar los assets aprobados a adaptadores compilados, aprovechando las exportaciones ONNX incluidas.
- Despliegue en entornos sin servidor de inferencia: al no incluir servidores ni código ejecutable, el repositorio encaja en arquitecturas donde el runtime lo aporta el consumidor.
- Archivado y auditoría de modelos: el repositorio sirve como fuente fijada e inmutable con identidades de ficheros verificables mediante `publication.json`, útil para trazabilidad y cumplimiento.
- Investigación en OCR: los checkpoints Paddle y ONNX permiten reproducir y comparar el comportamiento del modelo original en experimentos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Con ~1B parámetros, una estimación orientativa sería de 2-4 GB en FP16, pero no está confirmada en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repositorio (2.0 GB) sugiere que podría caber en GPUs de consumo, pero no se dispone de datos verificados.
- Opciones de despliegue: exportaciones ONNX y checkpoints Paddle; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La model card advierte explícitamente que la publicación verifica identidades de ficheros inmutables, no precisión OCR, fidelidad de cuantización, ajuste a dispositivo ni aceptación en escritorio, móvil o navegador.
- Los metadatos de idioma publicados no establecen calidad probada en ningún idioma; el soporte de árabe es una preferencia del publicador, no una garantía.
- El repositorio no incluye código Python, servidores de inferencia ni código ejecutable de modelo; el consumidor debe aportar el runtime.
- Los modelos no están incluidos en el núcleo de Wekala; requieren assets aprobados y adaptadores compilados cualificados.
- No se selecciona fallback en la nube.
- La licencia Apache 2.0 permite uso comercial, pero los derechos del modelo original permanecen con sus publicadores (LightOn); cualquier conversión o asset derivado requiere registros separados.
- No se dispone de información sobre sesgos, riesgo de alucinación ni limitaciones de contexto, al no documentarse la arquitectura ni el entrenamiento.

## Enlaces

- Repositorio mirror en HuggingFace: https://huggingface.co/nile-academy/lightonocr-3-1b
- Modelo original: https://huggingface.co/lightonai/LightOnOCR-3-1B
- Commit original referenciado: https://huggingface.co/lightonai/LightOnOCR-3-1B/tree/23d544085c886bbdace647bcfab91203299417e2
