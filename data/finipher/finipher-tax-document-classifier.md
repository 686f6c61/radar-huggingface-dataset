# finipher/finipher-tax-document-classifier

## Resumen

Finipher tax document classifier v1.0.0 es un clasificador de texto especializado en documentos fiscales y financieros de Estados Unidos, desarrollado por Finipher y publicado en HuggingFace. El modelo identifica el tipo de documento (W-2, 1098, 1099-INT, extracto hipotecario, nómina, extracto de corretaje, entre otros) a partir de los primeros 128 tokens del texto extraído del documento, cubriendo un total de 95 etiquetas.

Técnicamente, se trata de una cabeza de clasificación ligera montada sobre un codificador MiniLM congelado (basado en sentence-transformers/all-MiniLM-L6-v2), con 22.719.761 parámetros en total. El repo incluye su propia copia del codificador, ya que la cabeza solo funciona con el encoder exacto con el que fue entrenada. El archivo `model.safetensors` contiene además una capa de salida para transacciones que este modelo ignora.

Su relevancia radica en que resuelve un problema concreto de producción: la clasificación automática de documentos fiscales en flujos de trabajo de procesamiento documental, con un umbral de confianza integrado (0,76) que permite derivar a revisión humana los casos dudosos. Según la model card, alcanza un 98,5 % de precisión en su conjunto de test interno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de clasificación lineal sobre encoder MiniLM congelado (mean pooling + normalización L2 + softmax) |
| Parametros totales | 22.719.761 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens (primeros 128 tokens del texto, truncando a 4.000 caracteres de entrada) |
| Tipos de cuantizacion | no disponible (pesos en precisión original, sin variantes cuantizadas publicadas) |
| Idiomas soportados | Inglés (en) |
| Licencia | other (licencia no estándar; el dataset de entrenamiento es CC-BY-4.0) |
| Formato de pesos | safetensors (`model.safetensors` y `tax_document_head.safetensors`) |

## Arquitectura y entrenamiento

El modelo combina dos componentes. El primero es el codificador sentence-transformers/all-MiniLM-L6-v2, que se mantiene congelado: procesa el texto, aplica mean pooling con máscara de atención sobre el `last_hidden_state` y normaliza el vector resultante con L2. El segundo es una cabeza de clasificación propia (lineal sobre el embedding normalizado, seguida de softmax) con 95 salidas correspondientes a los tipos de documento soportados. El repo incluye una copia propia del encoder porque la cabeza solo es compatible con el encoder exacto usado en el entrenamiento; además, ese archivo contiene una capa de salida de transacciones heredada de un modelo multitarea previo (`finance-multitask-minilm-two-head-v2`) que este modelo no utiliza.

El entrenamiento se realizó sobre el dataset `finipher/finipher-us-tax-document-classifier` (revisión `92c67c9`, v1.1.0, licencia CC-BY-4.0). No se ha publicado el número de tokens ni la composición detallada del dataset. La model card indica que el encoder procede a su vez de un modelo de transacciones cuyo entrenamiento aún está por documentar, y que el repo permanecerá privado hasta que eso se aclare. No hay mención a RLHF ni DPO (no aplicables a este tipo de clasificador).

## Capacidades

- Clasificación de documentos fiscales y financieros de EE. UU. en 95 categorías (W-2, 1098, 1099-INT, extractos hipotecarios, nóminas, extractos de corretaje, etc.).
- Clasificación a partir de los primeros 128 tokens del texto extraído, lo que permite trabajar con documentos largos sin procesarlos por completo.
- Umbral de confianza integrado (0,76): el modelo devuelve junto a la etiqueta un booleano que indica si la predicción es fiable o debe pasar a revisión humana.
- Etiquetas de reserva `OTHER_TAX_FORM` y `UNKNOWN_DOCUMENT`, que siempre se marcan para revisión manual.
- Salida probabilística (softmax) sobre las 95 clases, útil para construir lógicas de enrutado o umbrales personalizados.
- Sin soporte de tool calling, agentes, visión ni audio: es un clasificador de texto puro de una sola etiqueta.

## Casos de uso

- Clasificación automática de documentos en software de declaración de impuestos: al subir un documento, el modelo identifica si es un W-2, un 1099-INT o un extracto bancario y lo enruta al extractor o formulario correspondiente, evitando clasificación manual.
- Procesamiento masivo de expedientes fiscales en despachos de contabilidad: dada su latencia baja (encoder de 22,7 M de parámetros), puede clasificar miles de documentos por minuto en GPU o incluso CPU.
- Sistemas OCR + clasificación en fintech: tras extraer el texto con OCR, el modelo etiqueta el documento antes de pasar a extracción de campos, reduciendo el coste al aplicar extractores específicos solo al tipo correcto.
- Flujo de revisión humana con triaje automático: el umbral de 0,76 y las etiquetas de reserva permiten enviar automáticamente a un revisor los documentos de baja confianza, garantizando trazabilidad en procesos con requisitos de auditoría.
- Archivado y organización de documentación financiera personal o empresarial: clasificación de nóminas, extractos y formularios en gestores documentales.
- Detección de documentos no soportados: `UNKNOWN_DOCUMENT` permite filtrar documentos fuera del dominio antes de procesarlos con pipelines posteriores.
- Validación de completitud de expedientes: al conocer el tipo de cada documento, un sistema puede verificar si un expediente fiscal contiene los formularios requeridos (por ejemplo, que exista al menos un W-2).

## Benchmarks y rendimiento

Resultados publicados por Finipher, medidos offline a través de su código de producción:

| Conjunto de evaluacion | Documentos | Precision |
|---|---|---|
| Test set interno | 2.531 | 98,5 % |
| Test set sin titulos del documento | 1.203 | 94,7 % |
| Sondas ciegas (blind probes) | 33 | 90,9 % |

No hay comparación publicada con otros modelos (MMLU, HumanEval u otros benchmarks estándar no aplican a esta tarea). La caída de 98,5 % a 94,7 % al eliminar los títulos sugiere que el modelo depende en parte de los encabezados de los documentos. Error conocido: exportaciones CSV de extractos de tarjetas de crédito se clasifican como BANK_STATEMENT con confianza 0,51–0,71, por lo que normalmente derivan a revisión.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 22,7 M de parámetros en FP32 ocupa aproximadamente 90 MB, y en FP16 unos 45 MB. Cualquier GPU moderna es más que suficiente, y la inferencia en CPU es plenamente viable.
- GPU recomendadas: no se requiere GPU dedicada; funciona en cualquier GPU de consumo (incluso integradas) o directamente en CPU.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) con amplio margen; también en entornos sin GPU.
- Opciones de despliegue: carga directa con `transformers` + `safetensors` + `huggingface_hub` siguiendo el código de la model card (la cabeza es personalizada, así que no funciona con `AutoModelForSequenceClassification` estándar). También es compatible con servicios de inferencia de HuggingFace (Inference Endpoints) ejecutando el código custom. No hay evidencia de soporte directo en vLLM, llama.cpp, Ollama o TGI (formato safetensors de encoder BERT, sin GGUF publicado).
- Latencia y throughput: no disponible oficialmente; dado el tamaño del encoder y el límite de 128 tokens, se esperan latencias de milisegundos por documento en GPU y decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia |
|---|---|---|---|---|
| finipher/finipher-tax-document-classifier | 22,7 M | Clasificación de documentos fiscales de EE. UU. (95 clases) | 128 tokens | other |
| sentence-transformers/all-MiniLM-L6-v2 (base) | 22,7 M | Embeddings generales de frase | 256 tokens | Apache-2.0 |
| BERT-base-uncased (fine-tuned a medida) | 110 M | Clasificación de texto genérica | 512 tokens | Apache-2.0 |
| DistilBERT-base-uncased (fine-tuned a medida) | 67 M | Clasificación de texto genérica | 512 tokens | Apache-2.0 |

No existen clasificadores públicos equivalentes específicos de documentos fiscales de EE. UU. con 95 clases; la alternativa habitual es fine-tunar un encoder genérico (BERT, DistilBERT, DeBERTa) sobre datos propios. Frente a esas alternativas, este modelo ofrece un clasificador listo para producción con umbral de revisión integrado, aunque con contexto corto (128 tokens) y cobertura limitada al dominio fiscal estadounidense.

## Limitaciones y advertencias

- Solo soporta inglés y documentos fiscales/financieros de Estados Unidos; no es válido para fiscalidad de otros países.
- Ventana de contexto de solo 128 tokens: clasifica a partir del inicio del documento, por lo que documentos cuya información distintiva no esté al principio pueden clasificarse mal (la precisión cae de 98,5 % a 94,7 % sin títulos).
- Error documentado: exportaciones CSV de extractos de tarjetas de crédito se leen como BANK_STATEMENT con confianza media (0,51–0,71).
- Las etiquetas `OTHER_TAX_FORM` y `UNKNOWN_DOCUMENT` siempre requieren revisión humana, y cualquier predicción por debajo de 0,76 de confianza también.
- La cabeza solo es compatible con el encoder exacto incluido en el repo; no puede intercambiarse por otra versión de MiniLM.
- Licencia "other": las condiciones exactas de uso comercial no están detalladas en la model card; conviene verificarlas antes de uso en producción. El dataset de entrenamiento es CC-BY-4.0, pero los datos de entrenamiento del encoder subyacente (heredado del modelo de transacciones) aún no están documentados.
- Riesgo de alucinación no aplicable como en LLMs generativos, pero sí existe riesgo de misclasificación: el resultado nombra un tipo de documento y no constituye asesoramiento fiscal o financiero, según advierte el propio autor.
- Adopción muy temprana: 5 descargas y 1 like en el momento de la ficha, sin comunidad ni ecosistema de herramientas alrededor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/finipher/finipher-tax-document-classifier
- Dataset de entrenamiento: https://huggingface.co/datasets/finipher/finipher-us-tax-document-classifier
- Modelo base (encoder): https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Paper, blog, demo o repositorio de código: no disponible
