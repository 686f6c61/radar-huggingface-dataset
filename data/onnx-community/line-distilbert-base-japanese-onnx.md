# onnx-community/line-distilbert-base-japanese-ONNX

## Resumen

LINE DistilBERT Japanese es un modelo de lenguaje enmascarado (masked language model) de tipo DistilBERT preentrenado sobre 131 GB de texto web en japones. Fue desarrollado originalmente por LINE Corporation como destilacion de un BERT-base entrenado internamente por la propia compania, con el objetivo de ofrecer un encoder japones ligero y rapido sin renunciar a una calidad competitiva en tareas de comprension del lenguaje. La version que nos ocupa es una conversion a formato ONNX realizada de forma automatica por la organizacion onnx-community, pensada para ejecutarse con Transformers.js tanto en Node.js como directamente en el navegador.

El modelo tiene 6 capas, 768 dimensiones de estado oculto, 12 cabezas de atencion y alrededor de 66-68 millones de parametros, lo que lo situa en la gama de los encoders pequenos: es viable en CPU, en movil y en entornos sin GPU. Su tokenizador combina MeCab con el diccionario Unidic y segmentacion subpalabra por SentencePiece, con un vocabulario de 32 768 tokens optimizado para japones. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

Su relevancia actual es doble. Por un lado, sigue siendo una base solida para fine-tuning en tareas japonesas de clasificacion, extraccion de entidades o respuesta a preguntas, con resultados en JGLUE superiores a otros DistilBERT japoneses comparables. Por otro, la conversion a ONNX y su integracion con Transformers.js abren la puerta a inferencia local en el cliente, algo poco habitual en modelos japoneses de esta categoria y muy util para aplicaciones web que necesitan procesar texto sin enviar datos a un servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo DistilBERT base (6 capas, 768 de hidden, 12 cabezas de atencion) |
| Parametros totales | 66M segun la seccion de arquitectura; 68M en la tabla de evaluacion JGLUE de la model card |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (DistilBERT base suele trabajar con secuencias de hasta 512 tokens, dato no confirmado en esta model card) |
| Tipos de cuantizacion | No detallado en la model card; el repositorio ONNX incluye variantes derivadas del tag `base_model:quantized` y pesa 0,9 GB en total |
| Idiomas soportados | Japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (version convertida del modelo original en PyTorch/safetensors) |

## Arquitectura y entrenamiento

La arquitectura es la de DistilBERT base: un encoder transformer con 6 capas, 768 dimensiones de estado oculto y 12 cabezas de atencion, resultado de destilar un BERT-base entrenado internamente en LINE. El preentrenamiento se realizo sobre 131 GB de texto web japones, un volumen notable para un modelo de este tamano y claramente orientado a capturar vocabulario y estructuras propias del japones contemporaneo. No se documenta en la model card el uso de RLHF, DPO ni ninguna fase de alineacion, algo coherente con un modelo exclusivamente encoder y de tipo masked language modeling.

La innovacion tecnica mas relevante esta en el tokenizador: los textos se procesan primero con MeCab usando el diccionario Unidic y despues se dividen en subpalabras mediante SentencePiece, con un vocabulario de 32 768 entradas. Esta combinacion es la habitual en modelos japoneses de calidad, ya que la segmentacion morfologica previa reduce la fragmentacion excesiva de los kanji compuestos. La version ONNX se genero de forma automatica mediante el Space oficial de conversion de onnx-community, sin que se documenten ajustes manuales ni validaciones adicionales sobre el resultado.

## Capacidades

- Prediccion de tokens enmascarados (fill-mask) en japones, que es la tarea declarada en el pipeline del repositorio.
- Generacion de embeddings contextuales por token y por secuencia, utiles para similitud semantica, busqueda vectorial y clustering de texto japones.
- Fine-tuning supervisado para tareas downstream: clasificacion de texto, analisis de sentimiento, deteccion de spam, NER o respuesta a preguntas extractiva.
- Comprension de inferencia textual y similitud semantica, tal y como reflejan los resultados en JNLI y JSTS de JGLUE.
- Integracion con Transformers.js, lo que permite ejecutar el modelo en navegador y en Node.js sin backend Python.
- No soporta generacion de texto autoregresiva, tool calling, function calling ni razonamiento multi-paso con agentes.
- No dispone de capacidades multimodales: ni vision, ni audio, ni modo "thinking".
- Cobertura multilingue limitada al japones; no se reporta transferencia a otras lenguas.

## Casos de uso

- Autocompletado y sugerencia de palabras en editores y formularios web japoneses: el pipeline fill-mask permite predecir el token enmascarado en tiempo real y ejecutarse en el propio navegador con Transformers.js, evitando enviar el texto del usuario a un servidor.
- Busqueda semantica en corpus japoneses: usando las representaciones del encoder se pueden generar embeddings de documentos y consultas para montar un indice vectorial sobre documentacion tecnica, normativa o articulos internos en japones.
- Clasificacion de tickets de soporte: con un fine-tuning ligero sobre unas miles de etiquetas se puede enrutar automaticamente consultas de atencion al cliente en japones por categoria, departamento o urgencia.
- Deteccion de correcciones ortograficas y gramaticales: comparar la probabilidad asignada al token original frente a las predicciones del modelo en posiciones concretas permite senalar posibles erratas o usos anomalos en textos japoneses.
- Anotacion asistida de datos para entrenar modelos mayores: el modelo puede preetiquetar entidades o categorias en grandes volumenes de texto japones, reduciendo el coste de la anotacion manual antes de una revision humana.
- Moderacion de contenido en comunidades japonesas: fine-tuning para clasificar toxicidad, spam o contenido fuera de politica directamente en el cliente, lo que aporta privacidad y reduce costes de infraestructura.
- Extraccion de informacion en pipelines de documentos: como encoder base para tareas de respuesta a preguntas extractiva (estilo JSQuAD) sobre contratos, manuales o bases de conocimiento en japones.
- Prototipado rapido en el navegador: con Transformers.js se puede desplegar una demo funcional de NLP japones sin GPU ni servidor, util para validar una idea antes de invertir en infraestructura.

## Benchmarks y rendimiento

La model card incluye resultados de evaluacion sobre JGLUE, el conjunto de referencia para japones. Los datos corresponden al modelo original de LINE; no se documentan mediciones especificas sobre la version ONNX convertida.

| Modelo | Parametros | Marc_ja (acc) | JNLI (acc) | JSTS (Pearson/Spearman) | JSQuAD (EM/F1) | JCommonSenseQA (acc) |
|---|---|---|---|---|---|---|
| LINE-DistilBERT | 68M | 95,6 | 88,9 | 89,2 / 85,1 | 87,3 / 93,3 | 76,1 |
| Laboro-DistilBERT | 68M | 94,7 | 82,0 | 87,4 / 82,7 | 70,2 / 87,3 | 73,2 |
| BandaiNamco-DistilBERT | 68M | 94,6 | 81,6 | 86,8 / 82,1 | 80,0 / 88,0 | 66,5 |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los 66M de parametros ocupan aproximadamente 264 MB, por lo que el modelo cabe holgadamente en cualquier GPU con 1 GB de memoria; en int8 el peso se reduce a unos 70 MB.
- El repositorio ONNX completo pesa 0,9 GB, lo que sugiere que incluye varias variantes (fp32 y cuantizadas) y no solo un unico fichero de pesos.
- GPU recomendadas: no requiere GPU dedicada. Funciona correctamente en CPU moderna; en GPU, cualquier modelo desde una GTX 1050 o una iGPU integrada es suficiente, y tarjetas como RTX 3060, RTX 4090, A100 o H100 quedan muy sobredimensionadas para este modelo salvo en escenarios de altisimo throughput por lotes.
- Cabe en cualquier GPU de consumo e incluso en dispositivos moviles y en el navegador del usuario.
- Opciones de despliegue: Transformers.js (Node.js y navegador), ONNX Runtime (Python, C++, C#), y en general cualquier runtime compatible con ONNX. No aplican vLLM, TGI ni llama.cpp, ya que son servidores orientados a modelos generativos y este es un encoder de masked language modeling.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Al tratarse de 6 capas y 66M de parametros, la inferencia de una secuencia corta en CPU se mide en decenas de milisegundos, pero no hay cifras publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | JGLUE (resumen) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LINE DistilBERT Japanese (ONNX) | 66-68M | No disponible | Mejor media en Marc_ja, JNLI, JSTS, JSQuAD y JCommonSenseQA frente a los otros dos DistilBERT comparados | Apache 2.0 | HuggingFace, en formato ONNX y Transformers.js |
| Laboro-DistilBERT | 68M | No disponible | Peor en JNLI (82,0), JSTS (87,4/82,7) y JSQuAD (70,2/87,3) que LINE | No disponible en esta busqueda | HuggingFace |
| BandaiNamco-DistilBERT | 68M | No disponible | Peor en JCommonSenseQA (66,5) y JNLI (81,6), aunque competitivo en JSQuAD (80,0/88,0) | No disponible en esta busqueda | HuggingFace |
| line-corporation/line-distilbert-base-japanese | 66-68M | No disponible | Mismo modelo en formato original PyTorch | Apache 2.0 | HuggingFace |

La comparativa se limita a los modelos incluidos en la tabla de evaluacion de la propia model card. No se dispone de informacion sobre contextos maximos ni sobre pesos exactos de las alternativas mas alla de los 68M declarados.

## Limitaciones y advertencias

- Modelo exclusivamente japones: no se debe esperar un rendimiento util en castellano, ingles u otros idiomas.
- No es un modelo generativo: no puede mantener conversaciones, redactar textos largos ni ejecutar razonamiento multi-paso. Solo predice tokens enmascarados y produce embeddings.
- No soporta tool calling, function calling ni uso como agente.
- La model card no especifica la longitud maxima de contexto soportada, lo que obliga a validarla experimentalmente si se van a procesar secuencias largas.
- La conversion a ONNX es automatica y no va acompanada de una validacion publicada de equivalencia numerica frente al modelo original en PyTorch. Conviene verificar que las salidas coinciden antes de usarla en produccion.
- No se documentan sesgos, composicion del dataset de preentrenamiento ni procesos de filtrado del texto web, mas alla del volumen de 131 GB. Esto implica un riesgo de sesgos propios del corpus web no cuantificado.
- En tareas de fill-mask, las predicciones pueden reflejar estereotipos presentes en el texto de entrenamiento y no deben tomarse como juicios de valor.
- La licencia Apache 2.0 permite uso comercial, modificacion y redistribucion sin restricciones adicionales; se debe conservar el aviso de licencia y la atribucion correspondiente.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y las fechas de creacion y actualizacion son muy recientes, por lo que existe poca evidencia de uso en produccion por parte de terceros.
- Para tareas downstream sera necesario un fine-tuning especifico; el modelo base por si solo no resuelve clasificacion ni extraccion de entidades sin entrenamiento adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/onnx-community/line-distilbert-base-japanese-ONNX
- Modelo base original: https://huggingface.co/line-corporation/line-distilbert-base-japanese
- Space de conversion a ONNX: https://huggingface.co/spaces/onnx-community/convert-to-onnx
- Documentacion del pipeline fill-mask en Transformers.js: https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.FillMaskPipeline
- Repositorio GitHub de LINE DistilBERT Japanese: https://github.com/line/LINE-DistilBERT-Japanese
- README en japones: https://github.com/line/LINE-DistilBERT-Japanese/blob/main/README_ja.md
- JGLUE, suite de evaluacion en japones: https://github.com/yahoojapan/JGLUE
- Web de LINE Corporation: https://linecorp.com/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
