# Dazarang/nbailab-base-ner-scandi-onnx

## Resumen

`Dazarang/nbailab-base-ner-scandi-onnx` es una exportación a ONNX en precisión fp16 del modelo ScandiNER (`saattrupdan/nbailab-base-ner-scandi`), desarrollado originalmente por Dan Saattrup Nielsen. Se trata de un modelo BERT base especializado en reconocimiento de entidades nombradas (NER) para las lenguas escandinavas (sueco, danés y noruego) y también inglés. Esta versión no reentrena los pesos: únicamente convierte el modelo original a formato ONNX con opset 17, lo que facilita su despliegue en entornos de inferencia sin dependencia de PyTorch.

El modelo resuelve la tarea de token-classification, etiquetando cada token de entrada con categorías de entidad en formato BIO (PER, LOC, ORG, MISC). Su relevancia radica en que ofrece una alternativa ligera y portable para pipelines de producción que necesitan NER multilingüe escandinavo sin cargar el stack completo de transformers, manteniendo la licencia MIT del modelo original.

Con un tamaño de repositorio de 0,4 GB y pesos en fp16, está pensado para despliegues con requisitos moderados de memoria y para integración en servicios que ya trabajan con runtime ONNX. La información disponible sobre parámetros exactos, contexto y datos de entrenamiento es limitada, ya que la model card se centra en los detalles de la exportación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (transformer encoder) |
| Parametros totales | no disponible (el modelo base es BERT base; el dato exacto no se indica en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (exportacion ONNX); no se indican otras variantes |
| Idiomas soportados | sueco (sv), danes (da), noruego (no), ingles (en) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17), pesos en fp16 |

## Arquitectura y entrenamiento

El modelo subyacente es un BERT base, un transformer encoder bidireccional, adaptado a token-classification mediante una cabeza de clasificación sobre las representaciones de cada token. La exportación ONNX conserva la arquitectura y los pesos del modelo original sin reentrenamiento, con entradas `input_ids`, `attention_mask` y `token_type_ids` (int64) y salida `logits`. El tokenizador es BERT WordPiece con distinción de mayúsculas y vocabulario en `vocab.txt`.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en NER). La innovación técnica de esta versión es la propia exportación a ONNX fp16 con opset 17, que reduce el peso y permite inferencia en runtimes ONNX sin PyTorch.

## Capacidades

- Reconocimiento de entidades nombradas (NER) a nivel de token con etiquetas PER, LOC, ORG y MISC en formato BIO.
- Procesamiento multilingüe para sueco, danés, noruego e inglés.
- Tokenización WordPiece con distinción de mayúsculas, adecuada para nombres propios y entidades.
- Inferencia mediante runtime ONNX con entradas estándar de BERT.
- No se indica soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking en la información disponible.
- No se documentan capacidades de generación de texto: es un modelo discriminativo de etiquetado.

## Casos de uso

- Extracción de entidades en noticias escandinavas: el modelo etiqueta personas, organizaciones y lugares en textos de Suecia, Dinamarca y Noruega, útil para sistemas de indexación y búsqueda semántica en medios.
- Procesamiento de documentos legales o administrativos nórdicos: permite identificar partes implicadas (personas, organizaciones) en contratos y expedientes, facilitando la revisión automatizada.
- Anonimización y seudonimización de datos: al detectar entidades PER y LOC, puede integrarse en pipelines de cumplimiento (RGPD) para enmascarar información personal antes de almacenar o compartir textos.
- Enriquecimiento de bases de datos de clientes: extracción de nombres de empresas y ubicaciones a partir de correos o formularios en danés, noruego o sueco para completar registros CRM.
- Análisis de redes sociales y foros: identificación de entidades mencionadas en publicaciones multilingües escandinavas para monitorización de marca o análisis de opinión.
- Despliegue en servicios ligeros con ONNX Runtime: al ser una exportación ONNX fp16, encaja en microservicios o funciones serverless donde no se quiere cargar PyTorch, con requisitos de memoria moderados.
- Búsqueda y recuperación de información: etiquetado de entidades en corpus documentales para construir índices facetados por persona, organización o lugar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; al tratarse de un BERT base en fp16, el peso del modelo ronda los cientos de MB (el repositorio completo ocupa 0,4 GB), por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de memoria libre debería ser suficiente para lotes pequeños; se puede ejecutar en CPU con ONNX Runtime para cargas moderadas.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060 o superiores; también en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: ONNX Runtime (principal), así como servidores compatibles con ONNX; no se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Dazarang/nbailab-base-ner-scandi-onnx | BERT base (dato exacto no disponible) | no disponible | sv, da, no, en | MIT | ONNX fp16 |
| saattrupdan/nbailab-base-ner-scandi (original) | BERT base (dato exacto no disponible) | no disponible | sv, da, no, en | MIT | safetensors/PyTorch (no especificado) |
| Otros modelos NER escandinavos | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación se limita al modelo original del que deriva esta exportación; no se dispone de datos de benchmarks ni de alternativas concretas en la información proporcionada.

## Limitaciones y advertencias

- Al ser una exportación sin reentrenamiento, hereda los sesgos y limitaciones del modelo original ScandiNER, que no se detallan en la información disponible.
- Riesgo de alucinación: aunque es un modelo discriminativo y no generativo, puede producir etiquetas incorrectas o asignar entidades a tokens que no lo son, especialmente en dominios alejados de los datos de entrenamiento.
- Cobertura lingüística limitada a sueco, danés, noruego e inglés; no se garantiza un rendimiento adecuado en otras lenguas.
- No se documenta la longitud máxima de contexto soportada; en BERT suele estar limitada, pero el valor exacto no está disponible.
- La licencia MIT permite uso comercial, pero se recomienda verificar las condiciones del modelo original y citar adecuadamente a los autores.
- El formato ONNX fp16 puede introducir pequeñas diferencias numéricas respecto al modelo original en PyTorch; conviene validar la precisión en el dominio de producción.
- No se dispone de información sobre latencia, throughput ni requisitos exactos de memoria, por lo que se recomienda hacer pruebas de carga antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/Dazarang/nbailab-base-ner-scandi-onnx
- Modelo base: https://huggingface.co/saattrupdan/nbailab-base-ner-scandi
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
