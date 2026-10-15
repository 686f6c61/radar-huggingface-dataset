# Makio64/jurilix-pseudo-encodeur

## Resumen

Jurilix pseudo-encodeur es un clasificador de tokens (token classification) especializado en la detección de identificadores en documentos jurídicos franceses. Lo desarrolla Makio64 (desarrollador freelance especializado en frontend y Three.js) como componente del proyecto Jurilix, y deriva del modelo `Jean-Baptiste/camembert-ner` mediante ajuste fino sobre un corpus propio de 1.208 piezas jurídicas francesas ficticias. Su función es etiquetar secuencias BIO sobre 7 tipos de entidad (`PERSONNE`, `NOM_NAISSANCE`, `ENFANT`, `SOCIETE`, `ADRESSE`, `LIEU`, `AUTRE_ID`), lo que permite la pseudonimización local de textos legales antes de que se procesen con otros sistemas.

El modelo se distribuye exclusivamente como exportación ONNX en FP16 (`keep_io_types=True`, 220.401.110 bytes), diseñada para ejecutarse en CPU mediante `ort` dentro de la aplicación Jurilix. Esto lo convierte en una pieza de infraestructura orientada a la privacidad: al ejecutarse en local, los documentos no salen del entorno del usuario durante la fase de detección de datos personales.

Su relevancia actual es acotada pero clara: encaja en el nicho de preprocesado de datos jurídicos en francés con requisito de soberanía de datos, un escenario donde los modelos generativos en la nube no siempre son aceptables por motivos de confidencialidad. El repositorio ocupa 3,1 GB y arrastra 0 descargas y 0 "likes" en el momento de la consulta, lo que indica un proyecto en fase temprana y de uso interno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder derivado de CamemBERT (RoBERTa-base) para clasificacion de tokens (BIO) |
| Parametros totales | No disponible de forma explicita; al derivar de CamemBERT-base se estiman del orden de 110 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de 512 tokens con solapamiento de 128 tokens |
| Tipos de cuantizacion | Exportacion ONNX FP16 (`keep_io_types=True`); se menciona tambien FP32 en los resultados de busqueda |
| Idiomas soportados | Frances (fr) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx`) junto a `tokenizer.json` |
| Tamano del repositorio | 3,1 GB |
| Tamano del archivo ONNX | 220.401.110 bytes (FP16, -50,0 % frente a FP32) |
| Etiquetas | `PERSONNE`, `NOM_NAISSANCE`, `ENFANT`, `SOCIETE`, `ADRESSE`, `LIEU`, `AUTRE_ID` (esquema BIO) |
| Pipeline | token-classification |
| Fecha de creacion / actualizacion | 2026-09-26 / 2026-10-14 |

## Arquitectura y entrenamiento

El modelo es un encoder basado en la familia CamemBERT (arquitectura tipo RoBERTa adaptada al francés) reutilizado como clasificador de tokens. Sobre `Jean-Baptiste/camembert-ner` se aplica un ajuste fino supervisado para producir etiquetas BIO correspondientes a los 7 tipos de entidad jurídica. Los archivos de despliegue incluyen `model.onnx` con entradas `input_ids` y `attention_mask` y salida `logits`, además del `tokenizer.json`, lo que simplifica su integración sin dependencias de frameworks de aprendizaje profundo en tiempo de inferencia.

Los datos de entrenamiento consisten en 1.208 piezas jurídicas francesas ficticias, con aumentaciones dirigidas denominadas `upper`, `noaccent`, `ocr_split` y `lot_table`. Estas aumentaciones sugieren un esfuerzo por cubrir variaciones típicas de documentos escaneados por OCR (mayúsculas, ausencia de acentos, cortes de línea, tablas). El autor indica además una "soupe de poids" (weight soup) que combina `suite-v8-s1-aug`, `suite-v8-s2-aug` y `suite-v6-s1-aug`, una técnica de promediado de pesos entre checkpoints. No se especifica el número de tokens de entrenamiento, la composición completa del dataset ni si se emplearon RLHF o DPO (poco habituales en tareas de clasificación).

## Capacidades

- Detección de entidades nombradas en documentos jurídicos franceses con esquema BIO sobre 7 clases.
- Reconocimiento específico de menciones a personas, nombres de nacimiento, menores, sociedades, direcciones, lugares y otros identificadores.
- Robustez frente a variaciones de OCR y formato gracias a las aumentaciones de entrenamiento (`ocr_split`, `noaccent`, `upper`, `lot_table`).
- Procesamiento por ventanas de 512 tokens con solapamiento de 128 para documentos largos.
- Ejecución en CPU (integración con `ort`) sin necesidad de GPU.
- Soporte exclusivo del idioma francés.
- No dispone de soporte de tool calling, function calling ni razonamiento multi-paso: es un modelo discriminativo, no generativo.
- No dispone de capacidades de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Pseudonimización local de expedientes jurídicos: el modelo detecta identificadores en cada pieza y permite sustituirlos por marcadores antes de archivarlos o compartirlos, evitando la salida de datos fuera del despacho.
- Preprocesado previo a un LLM: se ejecuta la detección de identificadores con este encoder en CPU y se envían al modelo generativo solo los textos ya anonimizados, reduciendo el riesgo de filtrar datos personales.
- Cumplimiento del RGPD en despachos y asesorías: integrado en un pipeline documental, sirve como capa automática de anonimización antes de cualquier tratamiento o cesión de datos.
- Detección de datos personales en contratos: permite localizar rápidamente a las partes, menores y direcciones en contratos para su revisión manual o su registro.
- Post-procesado de OCR en digitalización jurídica: las aumentaciones orientadas a errores de OCR lo hacen adecuado para limpiar y etiquetar documentos escaneados procedentes de digitalizaciones masivas.
- Procesamiento por lotes de fondos documentales: con ventanas de 512 tokens y solapamiento, puede recorrerse automáticamente un corpus completo para extraer un inventario de entidades identificadoras.
- Enmascarado para e-discovery: en procesos de descubrimiento de pruebas, ayuda a ocultar automáticamente los datos personales de los conjuntos de documentos entregados a terceros.
- Integración en sistemas de gestión documental (DMS): como paso previo a la indexación, etiqueta las entidades para facilitar búsquedas y controles de acceso basados en el contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, recall ni F1 sobre conjuntos de evaluación, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; con el archivo ONNX FP16 de ~220 MB el modelo ocupa menos de 1 GB, y la ejecución en FP32 también cabe holgadamente en cualquier GPU moderna.
- GPU recomendadas: no requiere GPU. Funciona en CPU mediante `ort`; cualquier GPU consumer (por ejemplo, RTX 3060 o superior) sobra para procesamiento por lotes acelerado.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1-2 GB de memoria libre, e incluso en CPU exclusivamente.
- Opciones de despliegue: ONNX Runtime (`ort`) como vía principal; también puede servirse con Transformers y, si se reconvierte el encoder, con frameworks de clasificación de tokens. No aplica llama.cpp ni Ollama al no ser un modelo generativo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Makio64/jurilix-pseudo-encodeur | Clasificacion de tokens (7 etiquetas juridicas) | 512 tokens (ventanas con solapamiento de 128) | Frances | MIT | ONNX en HuggingFace |
| Jean-Baptiste/camembert-ner | Clasificacion de tokens (NER generico) | 512 tokens | Frances | MIT | HuggingFace |
| Modelos NER juridicos en frances equivalentes | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparacion directa solo puede establecerse con el modelo base, del que este se deriva mediante ajuste fino sobre un corpus juridico especifico. No se dispone de datos comparativos de rendimiento entre ambos.

## Limitaciones y advertencias

- Modelo puramente discriminativo: solo etiqueta tokens, no genera texto ni mantiene conversaciones.
- Cobertura limitada al frances; no se ha entrenado ni evaluado en otros idiomas.
- Entrenado sobre 1.208 documentos ficticios, un volumen reducido que puede provocar un sesgo hacia los patrones de ese corpus y una generalizacion limitada a documentos reales.
- Riesgo de falsos negativos y positivos en entidades poco representadas o con formatos atipicos; no se han publicado metricas de evaluacion que permitan cuantificarlo.
- El solapamiento de 128 tokens en ventanas de 512 puede generar duplicados de entidades en las fronteras si el posprocesado no se gestiona con cuidado.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base `Jean-Baptiste/camembert-ner`, tambien MIT segun la informacion disponible.
- Proyecto con 0 descargas y 0 "likes" en el momento de la consulta; se trata de un artefacto en fase temprana, sin comunidad ni historial de validacion externa.
- Discrepancia en la informacion disponible: la model card indica exportacion FP16, mientras que los resultados de busqueda mencionan una exportacion FP32, lo que conviene confirmar antes de desplegar.
- No se documentan metricas de rendimiento, sesgos ni evaluaciones de robustez, por lo que no es recomendable usarlo en produccion sin una validacion propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Makio64/jurilix-pseudo-encodeur
- Archivos del repositorio: https://huggingface.co/Makio64/jurilix-pseudo-encodeur/tree/main
- Modelo base: https://huggingface.co/Jean-Baptiste/camembert-ner
- Perfil de GitHub del autor: https://github.com/Makio64
- Repositorio jurilix-llama-runtime: https://github.com/Makio64/jurilix-llama-runtime
