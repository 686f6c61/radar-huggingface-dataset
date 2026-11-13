# saksornr/typhoon-ocr2-0.8b-webgpu-q4

## Resumen

Typhoon OCR 2 0.8B WebGPU Q4 es una conversión independiente al formato ONNX del modelo Typhoon OCR 2 0.8B, publicada por el usuario saksornr y optimizada para inferencia en navegador mediante Transformers.js y WebGPU. El modelo original, desarrollado por Typhoon AI, es un sistema de parsing de documentos tailandés/inglés construido sobre la arquitectura Qwen3.5, con 0,8 mil millones de parámetros y pipeline image-text-to-text. Esta versión cuantizada a INT4 permite ejecutar OCR y extracción de estructura documental (JSON de layout, tablas HTML y LaTeX) directamente en el hardware del visitante, sin enviar imágenes ni texto a ningún servidor.

La relevancia de esta conversión radica en que traslada un modelo de OCR especializado en tailandés a un escenario de privacidad por diseño: todo el procesamiento ocurre en el navegador del usuario. El repositorio ocupa 0,7 GB e incluye grafos separados de visión, embeddings y decodificador con caché, lo que posibilita la inferencia incremental en WebGPU. Está pensado para el Typhoon WebGPU Playground, aunque los ficheros pueden reutilizarse en cualquier aplicación que emplee Transformers.js 4.3.2 con ONNX Runtime Web.

No se trata de un lanzamiento oficial de Typhoon AI, sino de una conversión de terceros que reutiliza la topología ONNX de Qwen3.5-0.8B-ONNX de onnx-community y sustituye todos los pesos aprendidos por los del checkpoint exacto de Typhoon OCR 2 0.8B. La licencia Apache 2.0 se mantiene tanto para los pesos como para la topología reutilizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basado en Qwen3.5 (visión + lenguaje), exportado a ONNX con grafos separados de visión, embeddings y decodificador con caché |
| Parametros totales | 0,8 mil millones (modelo base Typhoon OCR 2 0.8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 simétrico por bloques de 32 (`MatMulNBits`) en matrices densas; embeddings con `GatherBlockQuantized`; activaciones, normalizaciones, sesgos y convoluciones en FP32 |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (grafos bajo `onnx/`, con tensores externos); runtime Transformers.js |
| Tamano del repositorio | 0,7 GB |
| Pipeline | image-text-to-text |
| Runtime | Transformers.js 4.3.2 + ONNX Runtime Web 1.31.0-dev.20260914-8d85527a0 |
| Aceleración | WebGPU (`device: "webgpu"`, `dtype: "q4"`) |

## Arquitectura y entrenamiento

El modelo subyacente es Typhoon OCR 2 0.8B, un sistema de parsing de documentos tailandés/inglés con arquitectura Qwen3.5 que combina un codificador visual con un decodificador de lenguaje. La conversión a ONNX separa el grafo en tres componentes: visión, embeddings y decodificador con caché (cache-decode), lo que permite reutilizar el estado entre pasos de generación y hace viable la inferencia incremental en el navegador. Todos los tensores aprendidos del checkpoint original (473 tensores en total) se han transferido de forma exacta, incluidos los parámetros de normalización plegados y los recurrentes; la topología ONNX de Qwen3.5-0.8B-ONNX solo aporta la estructura, no los pesos.

La cuantización aplicada es INT4 simétrico con bloques de 32 para las matrices densas (`MatMulNBits`) y `GatherBlockQuantized` para los embeddings, mientras que activaciones, normalizaciones, sesgos y convoluciones permanecen en FP32 para preservar la estabilidad numérica. La validación realizada por el autor incluye paridad con el mapeo nativo FP32 en visión y decodificación con caché, además de una prueba de inferencia real en WebGPU sobre un documento sintético. No se han publicado detalles sobre el dataset de entrenamiento original, el número de tokens ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Parsing de documentos completos con salida estructurada: layout en JSON, tablas en HTML y fórmulas en LaTeX.
- OCR bilingüe tailandés/inglés sobre imágenes de documentos.
- Generación de texto conversacional (tag `conversational` en el modelo base).
- Inferencia multimodal imagen-texto mediante pipeline image-text-to-text.
- Ejecución en navegador con WebGPU, sin backend remoto ni envío de datos a servidores.
- Soporte de decodificación con caché para generación autorregresiva incremental.
- No se ha documentado soporte de tool calling, function calling ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Digitalización de documentos tailandeses en el navegador: el modelo procesa imágenes de facturas, formularios o contratos y devuelve el layout en JSON junto con tablas HTML, todo sin que la imagen salga del dispositivo del usuario. Es adecuado por su especialización en tailandés y su ejecución local vía WebGPU.
- Extracción de tablas para hojas de cálculo: a partir de una captura o escaneo, el modelo genera marcado HTML de la tabla que puede parsearse y convertirse a CSV o XLSX en el propio frontend. La salida HTML estructurada simplifica la conversión posterior.
- Procesamiento de fórmulas matemáticas: la salida en LaTeX permite integrar el resultado directamente en editores científicos o en pipelines de publicación. Útil en documentación técnica y académica en tailandés o inglés.
- Aplicaciones de privacidad estricta: sectores sanitario, legal o financiero donde no se permite subir documentos a servicios en la nube. Al ejecutarse en WebGPU del visitante, los datos permanecen en el navegador.
- Playground y demos interactivas: el modelo alimenta el Typhoon WebGPU Playground, que descarga los ficheros bajo demanda y ejecuta la inferencia en el hardware del visitante. Sirve como referencia para integraciones con Transformers.js.
- Prototipado rápido de OCR sin infraestructura: un desarrollador puede validar la calidad de extracción sobre documentos reales antes de desplegar una versión en servidor, usando únicamente Chrome o Edge con aceleración hardware.
- Preprocesado en aplicaciones web de gestión documental: integrado en un editor o gestor de archivos, el modelo puede extraer metadatos y estructura al subir un documento, reduciendo la dependencia de APIs externas de OCR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que la validación realizada (paridad FP32 y una prueba en WebGPU sobre un documento sintético) no constituye un benchmark representativo de OCR, y que la cuantización, el redimensionado de imagen y los límites de tokens de salida pueden afectar a la precisión y exhaustividad de la extracción.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio pesa 0,7 GB en INT4, por lo que la huella en memoria de los pesos ronda esa cifra, a la que hay que sumar activaciones y buffers en FP32.
- GPU recomendadas: no se especifican modelos concretos; el autor exige una GPU compatible con WebGPU y un navegador de escritorio actual (Chrome o Edge) con aceleración hardware activada.
- Compatibilidad con GPU de consumo: previsiblemente sí en GPUs de escritorio recientes con soporte WebGPU, aunque no se detallan modelos ni cifras de latencia.
- Opciones de despliegue: Transformers.js 4.3.2 con ONNX Runtime Web 1.31.0-dev.20260914-8d85527a0 en navegador; no se ofrece fallback a CPU ni a modelo de precisión completa.
- Latencia y throughput: no disponibles. El autor advierte que el rendimiento depende del hardware WebGPU del visitante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Typhoon OCR 2 0.8B WebGPU Q4 (esta ficha) | 0,8 B | no disponible | th, en | Apache 2.0 | ONNX INT4, navegador WebGPU |
| typhoon-ai/typhoon-ocr2-0.8b (modelo base) | 0,8 B | no disponible | th, en | Apache 2.0 | Pesos originales, inferencia en servidor/GPU |
| onnx-community/Qwen3.5-0.8B-ONNX | 0,8 B | no disponible | no disponible | Apache 2.0 | ONNX, topología reutilizada por esta conversión |

La comparación con otros sistemas OCR especializados en tailandés no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Conversión no oficial: se trata de un trabajo independiente de saksornr, no de un lanzamiento de Typhoon AI; la atribución no implica respaldo del autor original.
- Sin fallback: la aplicación no selecciona modelo en CPU ni en precisión completa, por lo que sin WebGPU y aceleración hardware no hay inferencia.
- Precisión dependiente de la cuantización: el INT4 puede degradar la exactitud y completitud de la extracción en documentos complejos; el autor lo advierte explícitamente.
- Validación limitada: la única prueba en WebGPU documentada se hizo sobre un documento sintético, no sobre un conjunto representativo de OCR.
- Idiomas restringidos a tailandés e inglés; no se documenta cobertura de otros idiomas.
- Longitud de contexto no especificada, lo que dificulta planificar documentos muy extensos o conversaciones multi-turno largas.
- Riesgo de alucinación inherente a los modelos generativos: las tablas o fórmulas generadas pueden contener errores de transcripción no detectables sin verificación humana.
- Sesgos: no se documentan sesgos específicos del modelo base en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar el fichero NOTICE para conocer las revisiones exactas y modificaciones aplicadas.
- Requiere preservar todos los nombres de ficheros de grafos y tensores externos bajo `onnx/` para que la carga funcione correctamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/saksornr/typhoon-ocr2-0.8b-webgpu-q4
- Modelo base: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b
- Topología ONNX reutilizada: https://huggingface.co/onnx-community/Qwen3.5-0.8B-ONNX
- Playground WebGPU: https://huggingface.co/spaces/saksornr/typhoon-asr-webgpu
- Manifest de procedencia y checksums: https://huggingface.co/saksornr/typhoon-ocr2-0.8b-webgpu-q4/blob/main/manifest.json
- Licencia: https://huggingface.co/saksornr/typhoon-ocr2-0.8b-webgpu-q4/blob/main/LICENSE
- Aviso de atribución: https://huggingface.co/saksornr/typhoon-ocr2-0.8b-webgpu-q4/blob/main/NOTICE
