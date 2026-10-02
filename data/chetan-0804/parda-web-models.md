# chetan-0804/parda-web-models

## Resumen

Parda web models es un conjunto de modelos en formato ONNX publicado por el usuario chetan-0804 en HuggingFace, pensado para ser consumido por la aplicación web Parda. Su función es redactar (eliminar o tapar) datos personales en documentos indios, ejecutándose íntegramente en el navegador del usuario mediante ONNX Runtime, sin subir ningún fichero a un servidor. El repositorio agrupa tres bloques funcionales: un modelo GLiNER de detección de PII, un detector YOLO11n para caras, firmas, códigos QR y sellos, y un conjunto de modelos OCR de EasyOCR convertidos a ONNX.

El componente principal es `gliner/model_int8_embed.onnx`, un GLiNER afinado sobre documentos indios sintéticos con la tabla de embeddings cuantizada a 8 bits. Se apoya en `urchade/gliner_multi_pii-v1`, cuyo encoder es mDeBERTa-v3 (licencia MIT), y se distribuye bajo Apache-2.0. Los idiomas cubiertos, según la model card, son inglés, hindi y kannada.

El interés del proyecto es fundamentalmente práctico: demuestra un pipeline de anonimización completamente local (offline, sin subida de datos) combinando NER zero-shot, detección visual y OCR. La contrapartida es una licencia mixta muy restrictiva: el uso se limita a investigación y demostración no comercial, el detector de caras se entrenó con CelebA (solo uso no comercial) y el componente YOLO11n está bajo AGPL-3.0. El repositorio no tiene descargas ni likes en el momento de la consulta y no publica resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto heterogeneo: GLiNER (encoder transformer bidireccional, base mDeBERTa-v3) para NER/PII; YOLO11n (CNN de deteccion de objetos) para caras, firmas, QR y sellos; EasyOCR CRAFT (detector de texto) + reconocedores CRNN para OCR |
| Parametros totales | no disponible (el repositorio empaqueta varios modelos; no se declara el recuento por componente) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 en la tabla de embeddings del modelo GLiNER; el resto de componentes no especifica esquema de cuantizacion |
| Idiomas soportados | Ingles; hindi e ingles+hindi (reconocedor hi+en); kannada e ingles+kannada (reconocedor kn+en) |
| Licencia | parda-mixed (license: other). Por componente: GLiNER Apache-2.0; YOLO11n AGPL-3.0; EasyOCR Apache-2.0. Uso global declarado: solo investigacion y demostracion no comercial |
| Formato de pesos | ONNX (`gliner/model_int8_embed.onnx`, `yolo/parda-yolo.onnx`, `easyocr/*.onnx`) |

## Arquitectura y entrenamiento

El repositorio no contiene un unico modelo, sino tres subsistemas independientes que se ejecutan en cadena. El primero es un GLiNER (`gliner/model_int8_embed.onnx`), arquitectura de reconocimiento de entidades basada en un encoder transformer bidireccional que permite especificar las etiquetas de entidad en tiempo de inferencia, en lugar de tener un conjunto fijo de clases. El autor indica que está afinado sobre documentos indios sintéticos y que la tabla de embeddings se almacena en 8 bits. La base declarada es `urchade/gliner_multi_pii-v1`, construida sobre mDeBERTa-v3 (MIT). No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

El segundo subsistema es `yolo/parda-yolo.onnx`, un YOLO11n de Ultralytics ajustado para detectar cuatro clases de interés en documentos: caras, firmas, códigos QR y sellos. La detección de caras se entrenó con CelebA, lo que la restringe a uso no comercial. El tercero es un conjunto de modelos EasyOCR convertidos a ONNX: el detector de texto CRAFT y reconocedores para inglés, hindi+inglés y kannada+inglés. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o modos de razonamiento; la aportación diferencial es la conversión a ONNX y la orquestación de todo el pipeline en el navegador.

## Capacidades

- Detección de información personal identificable (PII) con etiquetas definidas dinámicamente, gracias al enfoque GLiNER.
- Redacción local de documentos: el texto y las imágenes no salen del dispositivo del usuario, ya que todo el cómputo ocurre en el navegador.
- Detección visual de cuatro clases: caras, firmas, códigos QR y sellos.
- OCR de documentos en inglés, en hindi (con soporte de mezcla hindi+inglés) y en kannada (con mezcla kannada+inglés).
- Procesamiento multilingüe limitado a los tres idiomas declarados; no se anuncia cobertura de otras lenguas indias ni de español.
- No incluye generación de texto, razonamiento conversacional, tool calling, function calling ni capacidades de agente.
- No se declaran capacidades de audio, vídeo ni visión general más allá de la detección de objetos mencionada.

## Casos de uso

- Redacción de documentos antes de compartirlos: un usuario carga un PDF o una imagen en la aplicación web y el pipeline detecta y tapa PII textual (GLiNER), caras, firmas, sellos y códigos QR (YOLO) antes de exportar el documento, sin que el fichero abandone el navegador.
- Periodismo y verificación documental: redactar identificadores personales de expedientes o testimonios antes de publicarlos, manteniendo la trazabilidad del original en local.
- Cumplimiento de normativas de protección de datos: servir como primera capa de anonimización en flujos internos donde enviar documentos originales a un servicio en la nube no es aceptable por política de la organización.
- Preprocesado para pipelines de OCR posteriores: usar los recortes detectados por YOLO11n y los reconocedores EasyOCR para extraer texto estructurado de formularios indios en inglés, hindi o kannada.
- Anonimización de corpus para entrenamiento: limpiar conjuntos de documentos sintéticos o reales de PII antes de usarlos para ajustar otros modelos.
- Verificación de identidad y KYC: como componente de previsualización que marca caras y firmas en documentos de identidad antes de una revisión humana, siempre en un contexto de investigación no comercial.
- Demostración educativa de despliegue ONNX en el navegador: ejemplo reproducible de cómo encadenar NER, detección de objetos y OCR con ONNX Runtime Web sin backend.
- Despliegue en entornos con conectividad limitada o air-gapped: al no requerir servidor, el pipeline puede funcionar en equipos aislados una vez cargados los ficheros ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al repositorio de GitHub del proyecto para consultar código y benchmarks, pero no incluye cifras en la información proporcionada, por lo que no se presentan tablas comparativas de MMLU, HumanEval, GSM8K ni métricas de detección (mAP, F1 de NER, precisión de OCR).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ejecutarse en el navegador mediante ONNX, el consumo depende del runtime (WASM o WebGPU) y de la memoria asignada al proceso del navegador, no de una GPU dedicada.
- GPU recomendadas: no se especifican. El diseño apunta a ejecución en CPU del cliente; el uso de WebGPU, si estuviera contemplado, no se documenta.
- Compatibilidad con GPU de consumo: no aplica como requisito; el objetivo es funcionar en el dispositivo del usuario final.
- Tamaño en disco: el repositorio completo ocupa 0,9 GB, aunque cada componente se puede cargar por separado en el navegador.
- Opciones de despliegue: ONNX Runtime Web dentro de la aplicación Parda; los ficheros ONNX también son consumibles desde ONNX Runtime, pero no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelos).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo / solucion | Tipo | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|
| chetan-0804/parda-web-models | GLiNER + YOLO11n + EasyOCR en ONNX, ejecucion en navegador | en, hi, kn | parda-mixed (uso no comercial); AGPL-3.0 en el componente YOLO; Apache-2.0 en GLiNER y EasyOCR | HuggingFace, 0 descargas |
| urchade/gliner_multi_pii-v1 | GLiNER de deteccion de PII (modelo base declarado) | multilingue segun el autor original | no disponible en la informacion proporcionada | HuggingFace |
| EasyOCR (JaidedAI) | OCR CRAFT + CRNN | multilingue | Apache-2.0 | Repositorio y paquete propios |
| Ultralytics YOLO11n | Deteccion de objetos en tiempo real | no aplica | AGPL-3.0 (o licencia comercial de pago) | Repositorio y paquete propios |

No se dispone de cifras comparativas de rendimiento entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: el conjunto se declara para uso libre únicamente en investigación y demostración no comercial. Cualquier uso comercial exigiría reentrenar el detector de caras sin CelebA y cumplir con AGPL-3.0.
- CelebA impone uso exclusivamente no comercial en la detección de caras.
- AGPL-3.0 en el componente YOLO11n: es una licencia copyleft fuerte que puede afectar a obras derivadas o a servicios que expongan el modelo por red.
- "parda-mixed" no es una licencia estándar reconocida por OSI; conviene revisar los términos exactos antes de cualquier despliegue.
- Entrenado únicamente con documentos sintéticos: la generalización a documentos reales indios no está validada ni cuantificada.
- Sin benchmarks publicados en la información disponible, por lo que no se puede estimar la tasa de falsos positivos o falsos negativos en detección de PII, caras o firmas.
- Riesgo de alucinación de entidades en GLiNER: al permitir etiquetas libres, puede marcar fragmentos que no corresponden a PII real, o pasar por alto identificadores poco frecuentes.
- Cobertura de idiomas limitada a inglés, hindi y kannada; no se documenta soporte de otras lenguas indias ni de español.
- Repositorio sin descargas ni likes: no hay evidencia de validación por parte de la comunidad.
- La fecha de creación indicada (2026-10-02) es atípica y conviene verificarla antes de citar el proyecto.
- La redacción automática no sustituye la revisión humana: la propia model card recomienda revisar la salida antes de compartir un documento.
- No se documentan longitudes de contexto, tamaño de los modelos ni latencias, lo que dificulta planificar su integración en producción.

## Enlaces

- HuggingFace: https://huggingface.co/chetan-0804/parda-web-models
- Repositorio con código y benchmarks: https://github.com/chetanjagan/Parda
- Modelo base declarado: https://huggingface.co/urchade/gliner_multi_pii-v1
- EasyOCR (componente OCR reutilizado): https://github.com/JaidedAI/EasyOCR
- Ultralytics YOLO11 (componente de detección): https://github.com/ultralytics/ultralytics
