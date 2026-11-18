# ristihan/finbert-ner-onnx

## Resumen

`ristihan/finbert-ner-onnx` es una exportación a formato ONNX del modelo `Kansallisarkisto/finbert-ner`, un modelo de reconocimiento de entidades nombradas (NER) para finés desarrollado por el Archivo Nacional de Finlandia (Kansallisarkisto). El modelo original parte de `TurkuNLP/bert-base-finnish-cased-v1` y se ha afinado sobre el corpus Turku NER y documentos de la administración pública finlandesa. Esta versión ONNX está pensada para ejecutarse con `@huggingface/transformers` (transformers.js) en un backend Node.js, lo que permite integrar la detección de entidades en aplicaciones web sin depender de Python.

La arquitectura es un transformer BERT base (encoder) adaptado a token classification, con 12 capas y aproximadamente 110 millones de parámetros, aunque el autor no detalla el número exacto en la información disponible. El modelo reconoce diez tipos de entidades (PERSON, ORG, LOC, GPE, PRODUCT, EVENT, DATE, JON, FIBC y NORP) mediante etiquetado BIO.

Su relevancia actual radica en el caso de uso declarado: el sistema DimPo (gestión de carteras de proyectos de la región de Finlandia Sudoeste) lo emplea para detectar nombres de terceras personas en campos de texto libre antes de enviar esos textos a un proveedor externo de IA, como parte de su pipeline de pseudonimización. Es, por tanto, un componente de privacidad y cumplimiento más que un modelo generativo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT base (token classification) |
| Parametros totales | no disponible (modelo base BERT base, ~110 M estimados; el autor no lo declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT admite 512 tokens; no declarado por el autor) |
| Tipos de cuantizacion | no disponible (exportación ONNX; el autor no detalla variantes cuantizadas) |
| Idiomas soportados | finés (fi) |
| Licencia | MIT |
| Formato de pesos | ONNX (exportado con `optimum-cli export onnx --task token-classification`) |

## Arquitectura y entrenamiento

El modelo es un encoder BERT base afinado para etiquetado de tokens con esquema BIO. Parte de `TurkuNLP/bert-base-finnish-cased-v1`, un BERT base entrenado específicamente para finés, y se afina sobre el corpus Turku NER más documentos de la administración pública. El resultado es `Kansallisarkisto/finbert-ner`, del que esta ficha es únicamente la conversión a ONNX.

La conversión se realizó el 18 de noviembre de 2026 mediante `optimum-cli export onnx --model Kansallisarkisto/finbert-ner --task token-classification`, orientada a su consumo desde transformers.js en Node.js. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF/DPO (no aplicables en un modelo discriminativo de este tipo). No se declaran innovaciones técnicas adicionales más allá de la propia exportación ONNX.

## Capacidades

- Reconocimiento de entidades nombradas en finés con diez tipos: PERSON, ORG, LOC, GPE, PRODUCT, EVENT, DATE, JON, FIBC y NORP.
- Etiquetado a nivel de token con esquema BIO (B- e I- para cada tipo).
- Ejecución en JavaScript/TypeScript mediante transformers.js, sin runtime de Python.
- Detección específica de nombres de terceras personas (entidad PERSON) para pipelines de pseudonimización y protección de datos.
- Procesamiento de texto libre en dominios administrativos y de gestión de proyectos, gracias al ajuste sobre documentos de la administración pública finlandesa.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es un modelo exclusivamente discriminativo de token classification.

## Casos de uso

- Pseudonimización previa a APIs externas de IA: detectar entidades PERSON en textos libres antes de enviarlos a un proveedor externo, sustituyéndolas por marcadores. Es el caso de uso declarado por el autor en el sistema DimPo.
- Cumplimiento de protección de datos en administraciones públicas: filtrar nombres de terceros en expedientes, solicitudes o descripciones de proyectos antes de su tratamiento automatizado o su publicación.
- Anonimización de corpus finlandeses: preparar conjuntos de datos para investigación o entrenamiento eliminando o enmascarando entidades personales y organizativas.
- Enriquecimiento de metadatos documentales: extraer organizaciones (ORG), localizaciones (LOC/GPE) y fechas (DATE) de documentos administrativos para indexación y búsqueda facetada.
- Preprocesado en pipelines de gestión de proyectos: identificar personas, organizaciones y eventos en descripciones de proyectos para alimentar paneles de seguimiento o alertas.
- Integración en backends Node.js: desplegar la detección de entidades dentro de un servicio web existente en JavaScript sin añadir infraestructura Python, gracias a la exportación ONNX y transformers.js.
- Detección de entidades en formularios de usuario: validar o enmascarar en tiempo de envío nombres y datos sensibles en campos de texto libre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,5 GB) y la arquitectura BERT base, la inferencia cabe holgadamente en GPUs de consumo, aunque el autor no publica cifras.
- GPU recomendadas: no declaradas por el autor; para un BERT base basta una GPU de gama media o incluso CPU para cargas moderadas.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con varios GB de VRAM; no se especifican modelos concretos.
- Opciones de despliegue: transformers.js (`@huggingface/transformers`) en Node.js, que es el objetivo declarado de la exportación; al ser ONNX, también es compatible con otros runtimes ONNX, aunque el autor no los menciona.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Tarea | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| ristihan/finbert-ner-onnx | BERT base (ONNX) | fi | NER (10 tipos) | MIT | ONNX | Hugging Face |
| Kansallisarkisto/finbert-ner | BERT base | fi | NER (10 tipos) | MIT | safetensors/PyTorch (no detallado) | Hugging Face |
| TurkuNLP/bert-base-finnish-cased-v1 | BERT base | fi | Modelo base (no NER) | no disponible en la información | no disponible | Hugging Face |

La comparación se limita al modelo original y a su modelo base, que son los únicos referenciados en la información disponible. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas.

## Limitaciones y advertencias

- Solo soporta finés; no es utilizable para otros idiomas sin reentrenamiento.
- Es un modelo discriminativo de token classification: no genera texto ni razona, por lo que no debe emplearse para tareas generativas.
- Riesgo de falsos negativos y falsos positivos en la detección de entidades, especialmente en dominios distintos de los documentos administrativos finlandeses sobre los que se ajustó.
- No se han publicado métricas de evaluación (precisión, recall, F1) en la información disponible, lo que impide valorar su fiabilidad en producción.
- La licencia MIT permite uso comercial, pero debe verificarse la licencia del modelo base y del corpus de entrenamiento original, no detallada aquí.
- El modelo card no documenta sesgos conocidos ni limitaciones de contexto; la longitud máxima de entrada no está declarada.
- Al ser una exportación ONNX de un modelo de terceros, la responsabilidad sobre el comportamiento subyacente recae en el modelo original `Kansallisarkisto/finbert-ner`.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (18 de noviembre de 2026): no hay evidencia de uso o validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ristihan/finbert-ner-onnx
- Modelo base: https://huggingface.co/Kansallisarkisto/finbert-ner
- Modelo base del que parte el original: `TurkuNLP/bert-base-finnish-cased-v1` (referenciado en la model card; sin URL explícita)
- Paquete transformers.js: https://www.npmjs.com/package/@huggingface/transformers
- Repositorio DimPo: no disponible (la URL aparece vacía en la model card)
- Documento de decisión ADR-016 del repositorio DimPo: no disponible (referenciado como `docs/decisions/ADR-016-third-party-pii-detection.md`, sin URL)
