# aitransformation/LightOnOCR-3-0.8B-GGUF

## Resumen

LightOnOCR-3-0.8B es un modelo de reconocimiento óptico de caracteres (OCR) basado en visión-lenguaje, desarrollado originalmente por LightOn y publicado bajo licencia Apache 2.0. Emplea la arquitectura Qwen3.5 vision-language y cuenta con aproximadamente 752 millones de parámetros, lo que lo sitúa en el segmento de modelos compactos capaces de ejecutarse en hardware de consumo. Su propósito es convertir imágenes de documentos en texto estructurado, con la particularidad de que acepta un modo de prompt vacío para transcripción plana y un modo `grounding` que devuelve bloques de texto etiquetados con sus coordenadas (bounding boxes).

La ficha que nos ocupa corresponde a la conversión a formato GGUF realizada por el usuario `aitransformation`, que no aporta pesos nuevos sino únicamente conversiones de formato para su uso con llama.cpp y Ollama. El repositorio contiene el modelo de texto en F16 y Q8_0, además de un proyector de visión (mmproj) en F16 imprescindible para procesar imágenes. Esta conversión resulta relevante porque permite desplegar un OCR de calidad en local, sin GPU dedicada de gama alta y sin depender de servicios en la nube.

El modelo base está pensado para tareas de digitalización de documentos, extracción de texto de facturas, formularios o páginas escaneadas, y su tamaño reducido facilita la integración en pipelines de automatización documental. La conversión se ha probado únicamente con imágenes sintéticas de facturas en polaco y no se han ejecutado benchmarks sobre los ficheros GGUF.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5 vision-language (transformer multimodal con proyector de visión) |
| Parámetros totales | 752.393.024 (~0,75 B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16 y Q8_0 (texto); proyector de visión en F16 |
| Idiomas soportados | no disponible (pruebas solo con texto en polaco) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (texto F16, texto Q8_0, mmproj F16) |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura Qwen3.5 vision-language, un transformer multimodal que combina un codificador de visión con un modelo de lenguaje y un proyector que alinea ambos espacios. La conversión GGUF se realizó con `convert_hf_to_gguf.py` de llama.cpp, usando `--outtype f16 --no-mtp` para el modelo de texto y `--mmproj` para el proyector de visión; la versión Q8_0 se generó con `llama-quantize` (build b12290). El resultado son tres ficheros: el modelo de texto en F16 (1,5 GB) y Q8_0 (0,8 GB), y el proyector de visión en F16 (0,2 GB), que es obligatorio para procesar imágenes.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO, ya que la model card de la conversión no los detalla. Tampoco se documentan innovaciones técnicas específicas más allá del modo de prompt dual (transcripción plana y `grounding` con bounding boxes), que constituye la principal característica funcional del modelo.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos.
- Transcripción plana de texto cuando se envía un prompt vacío.
- Modo `grounding`: devuelve bloques de texto etiquetados junto con sus bounding boxes.
- Procesamiento de imágenes mediante el proyector de visión mmproj (requerido).
- Integración con llama.cpp mediante `llama-mtmd-cli` y con Ollama mediante un `Modelfile`.
- Compatibilidad con endpoints conversacionales (tag `endpoints_compatible`).
- Soporte de modo thinking en el modelo base, que debe desactivarse explícitamente (`"think": false` en API, `--think=false` en CLI) para el uso OCR previsto.
- Capacidades multilingües: no disponibles como dato confirmado; las pruebas documentadas se limitan a texto en polaco.

## Casos de uso

- Digitalización masiva de facturas: el modelo puede procesar imágenes de facturas y extraer el texto con el modo de transcripción plana, integrándose en un pipeline por lotes con llama.cpp u Ollama para convertir archivos escaneados en datos estructurados sin depender de APIs externas.
- Extracción con coordenadas para sistemas de archivo: el modo `grounding` permite obtener bloques de texto con bounding boxes, útil para reconstruir el layout de documentos, recortar regiones concretas o alimentar visores de documentos con capas de texto seleccionable.
- Automatización de entrada de datos en back office: al ejecutarse en local con cuantización Q8_0 (0,8 GB de pesos de texto más 0,2 GB de proyector), puede desplegarse en estaciones de trabajo sin GPU dedicada para digitalizar formularios y albaranes.
- Procesamiento de documentos con requisitos de privacidad: la inferencia local con llama.cpp evita enviar imágenes confidenciales a servicios en la nube, lo que encaja en entornos con restricciones de cumplimiento (sanidad, legal, administración pública).
- Integración en aplicaciones de escritorio con Ollama: mediante un `Modelfile` y el renderer `qwen3.5` integrado, se puede empaquetar el OCR como servicio local consumible por otras aplicaciones a través de la API de Ollama.
- Preprocesado para pipelines RAG: la transcripción de páginas escaneadas permite convertir PDFs no digitales en texto indexable, que después se trocea y se embebe para búsqueda semántica o asistentes documentales.
- Prototipado rápido de soluciones OCR: el tamaño reducido y los formatos GGUF facilitan experimentar con distintas imágenes y prompts antes de invertir en modelos mayores o servicios gestionados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de la conversión indica explícitamente que solo se probó con imágenes sintéticas de facturas en polaco y que no se ejecutaron benchmarks sobre los ficheros GGUF.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB con texto F16 (1,5 GB) más proyector de visión F16 (0,2 GB); aproximadamente 1,0 GB con texto Q8_0 (0,8 GB) más proyector F16 (0,2 GB). Estas cifras corresponden al peso de los ficheros y no incluyen el coste de activaciones ni del contexto.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre; tarjetas de consumo como RTX 3060, RTX 4060 o superiores son suficientes. También puede ejecutarse en CPU, dado el reducido tamaño del modelo.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer actuales, e incluso en sistemas integrados con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp (`llama-mtmd-cli` con `--mmproj`), Ollama (mediante `Modelfile` con renderer `qwen3.5` y temperatura 0), y cualquier runtime compatible con GGUF multimodal.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LightOnOCR-3-0.8B (esta conversión GGUF) | ~0,75 B | no disponible | OCR visión-lenguaje con grounding | Apache 2.0 | GGUF en Hugging Face |
| lightonai/LightOnOCR-3-0.8B (modelo base) | ~0,75 B | no disponible | OCR visión-lenguaje con grounding | Apache 2.0 | Pesos originales en Hugging Face |
| Otros modelos OCR de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría; los datos de rendimiento del modelo base y de sus competidores no se incluyen en la información proporcionada.

## Limitaciones y advertencias

- La conversión GGUF no ha sido evaluada con benchmarks; solo se probó con imágenes sintéticas de facturas en polaco, por lo que el rendimiento en documentos reales y en otros idiomas es incierto.
- El modelo está especializado en OCR: otras instrucciones distintas de la transcripción plana o del modo `grounding` quedan fuera de distribución y pueden producir resultados erróneos.
- Es necesario desactivar el modo thinking al invocar el modelo; dejarlo activado puede degradar la calidad de la transcripción o generar salidas no deseadas.
- El proyector de visión (mmproj) es obligatorio para procesar imágenes; sin él, el modelo de texto no puede interpretar entradas visuales.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni limitaciones de contexto o idioma más allá de lo indicado.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base y citar adecuadamente a LightOn como autor original.
- Al ser una conversión de terceros, no hay garantía de soporte ni de actualizaciones por parte del autor del modelo original.

## Enlaces

- Repositorio GGUF: https://huggingface.co/aitransformation/LightOnOCR-3-0.8B-GGUF
- Modelo base: https://huggingface.co/lightonai/LightOnOCR-3-0.8B
- llama.cpp (herramienta de conversión e inferencia): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
