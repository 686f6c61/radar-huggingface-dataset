# mradermacher/Qwen2.5-VL-32B-OCR-GGUF

## Resumen

Qwen2.5-VL-32B-OCR-GGUF es la distribucion en formato GGUF del modelo multimodal Qwen2.5-VL-32B-OCR, un ajuste fino especializado en reconocimiento optico de caracteres (OCR) construido sobre la base Qwen2.5-VL-32B de Alibaba. El modelo original lo publica el usuario yongxianwei, y esta version cuantizada la mantiene mradermacher, un conocido distribuidor de cuantizaciones GGUF para llama.cpp. El modelo base emplea una arquitectura transformer multimodal con un encoder visual y un decodificador de lenguaje de aproximadamente 32.763 millones de parametros (32,7B), con licencia Apache 2.0.

La relevancia de esta ficha reside en que combina las capacidades de comprension visual de la familia Qwen2.5-VL con un ajuste orientado a tareas de extraccion de texto en imagenes y documentos. Al estar disponible en GGUF con cuantizaciones desde Q2_K hasta Q8_0, permite ejecutar un modelo de 32B en hardware de consumo, algo imposible con los pesos originales en precision completa. La model card indica que se trata de una fusion de modelos (tags `model-merging` y `optmerge`), lo que sugiere que el ajuste OCR se obtuvo mediante tecnicas de merge de pesos en lugar de un entrenamiento completo desde cero.

No obstante, la informacion publicada por el distribuidor es escasa: se limita a la tabla de cuantizaciones y a las instrucciones genericas de uso de GGUF. Los detalles sobre el proceso de entrenamiento, los datos utilizados y los benchmarks no estan disponibles en la informacion proporcionada, por lo que esta ficha refleja unicamente lo verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (encoder visual + decodificador de lenguaje), base Qwen2.5-VL |
| Parametros totales | 32.763.876.352 (32,7B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (segun la model card; el modelo base Qwen2.5-VL soporta multiples idiomas, pero no se detalla) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen2.5-VL-32B, un transformer multimodal que combina un encoder de vision con un decodificador de lenguaje de gran tamano. La variante OCR se distribuye con los tags `model-merging` y `optmerge`, lo que indica que el ajuste especializado se obtuvo mediante fusion de pesos (weight merging) sobre el modelo base, no mediante un entrenamiento supervisado adicional documentado. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

La innovacion practica de esta publicacion es la cuantizacion GGUF: mradermacher genera cuantizaciones estaticas (no ponderadas ni imatrix, segun indica la propia model card) junto con el fichero `mmproj` necesario para procesar imagenes en llama.cpp. El modelo incluye un proyector multimodal en dos precisiones (Q8_0 de 0,8 GB y f16 de 1,5 GB), que debe cargarse junto con los pesos del lenguaje para habilitar la entrada visual.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes y documentos, segun el nombre y el ajuste del modelo.
- Comprension visual multimodal heredada de Qwen2.5-VL (descripcion de imagenes, lectura de graficos y tablas), aunque no se detalla en la informacion disponible.
- Generacion de texto conversacional (tag `conversational`).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: la model card declara unicamente `en`; el modelo base Qwen2.5-VL es multilingue, pero no se confirma para esta variante.
- Modo thinking, vision o audio especial: no disponible.

## Casos de uso

- Digitalizacion de documentos escaneados: el modelo puede extraer texto de facturas, contratos y formularios en imagen, sustituyendo pipelines clasicos de OCR por un modelo que ademas comprende el contexto del documento.
- Procesamiento de archivos historicos o de baja calidad: al ser un modelo de lenguaje con vision, puede inferir caracteres ambiguos a partir del contexto linguistico, algo que un OCR tradicional no hace.
- Extraccion estructurada de datos: convertir tablas y formularios en imagenes a JSON o CSV mediante prompting, aprovechando la comprension visual del modelo base.
- Automatizacion de back-office: ingesta de albaranes y documentos contables en un flujo por lotes, ejecutando la cuantizacion Q4_K_M (20 GB) en una GPU de 24 GB o en CPU con llama.cpp.
- Asistencia a la accesibilidad: transcripcion de texto presente en capturas de pantalla o fotografias para lectores de pantalla, con la ventaja de poder resumir el contenido extraido.
- Prototipado en local sin infraestructura cloud: gracias a las cuantizaciones Q2_K (12,4 GB) y Q3_K_S (14,5 GB), es posible probar el modelo en estaciones de trabajo con GPU de consumo antes de desplegarlo en servidores.
- Verificacion de calidad documental: comparar el texto extraido con el original para detectar discrepancias en procesos de auditoria, usando el modelo como extractor y razonador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + mmproj + overhead de contexto):
  - Q2_K: ~13-14 GB.
  - Q3_K_S: ~15-16 GB.
  - IQ4_XS: ~19-20 GB.
  - Q4_K_M: ~21-22 GB.
  - Q5_K_M: ~24-25 GB.
  - Q6_K: ~28-29 GB.
  - Q8_0: ~36-37 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M o Q5_K_M; A100 40 GB o H100 para Q6_K y Q8_0; multiples GPU para las cuantizaciones mayores.
- GPU de consumo: Q2_K y Q3_K_S caben en tarjetas de 16 GB (RTX 4080, 4060 Ti 16 GB) con contexto reducido; Q4_K_S y Q4_K_M caben en 24 GB (RTX 3090, 4090).
- Opciones de despliegue: llama.cpp y sus frontends (Ollama, LM Studio, llama-cpp-python) para GGUF; vLLM y TGI no consumen GGUF de forma nativa, por lo que para esos motores habria que usar el modelo base en safetensors.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen2.5-VL-32B-OCR-GGUF (este) | 32,7B | no disponible | GGUF | Apache 2.0 | Ajuste OCR por merge, cuantizaciones estaticas |
| Qwen2.5-VL-32B-Instruct-heretic-GGUF | 32,7B (base) | no disponible | GGUF | Apache 2.0 | Variante sin censura del mismo distribuidor, sin ajuste OCR |
| Qwen2.5-VL-32B (modelo base) | 32,7B | no disponible | safetensors | Apache 2.0 | Modelo generalista multimodal, sin especializacion OCR |
| Modelos OCR clasicos (Tesseract, PaddleOCR) | no aplica | no aplica | varios | Apache 2.0 / otros | No son modelos de lenguaje; no comprenden contexto ni generan texto libre |

La comparacion cuantitativa de rendimiento no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La model card declara solo el idioma ingles (`en`); el rendimiento en castellano no esta verificado y podria degradarse respecto al modelo base.
- Al ser una fusion de pesos (`optmerge`), no hay documentacion sobre los datos de entrenamiento ni garantias de calidad del ajuste OCR.
- Riesgo de alucinacion: como modelo generativo, puede inventar texto que no aparece en la imagen, especialmente con cuantizaciones bajas (Q2_K, Q3_K_S).
- Las cuantizaciones estaticas no ponderadas pueden perder precision frente a las imatrix; la propia model card advierte de que las ponderadas no estan disponibles por el momento.
- El fichero `mmproj` es imprescindible para el procesamiento de imagenes; omitirlo deshabilita la funcionalidad multimodal.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen2.5-VL y del ajuste original de yongxianwei.
- Con 32,7B de parametros, el despliegue en produccion requiere GPU profesionales o multiples GPU; las cuantizaciones bajas no son recomendables para tareas criticas de OCR.
- No se dispone de informacion sobre sesgos, contexto maximo efectivo ni latencias medidas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen2.5-VL-32B-OCR-GGUF
- Modelo base del ajuste: https://huggingface.co/yongxianwei/Qwen2.5-VL-32B-OCR
- Pagina de descargas del distribuidor: https://hf.tst.eu/model#Qwen2.5-VL-32B-OCR-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Variante relacionada del mismo distribuidor: https://huggingface.co/mradermacher/Qwen2.5-VL-32B-Instruct-heretic-GGUF
