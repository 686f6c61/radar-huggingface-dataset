# BCCard/MoAI-Privacy-Filter-INT8

## Resumen

BCCard/MoAI-Privacy-Filter-INT8 es un artefacto de inferencia ONNX Runtime con cuantización INT8 weight-only, desarrollado por BC Card para la detección de información personal identificable (PII) en textos del dominio financiero en coreano e inglés. El modelo se construyó mediante fine-tuning completo de `openai/privacy-filter`, un modelo MoE de 1.400 millones de parámetros con 50 millones activos, sobre datos sintéticos específicos del sector financiero. El resultado es un clasificador de tokens (token classification) que etiqueta 18 tipos de entidades PII utilizando 73 clases BIOES a nivel de token.

El modelo está diseñado como capa NER dentro de un gateway de enmascaramiento de PII en varios niveles, situado frente a servicios de LLM, y también como componente de detección para revisiones de privacidad y auditorías offline. A diferencia del modelo base, este repositorio no contiene pesos PyTorch; solo el grafo ONNX cuantizado, el tokenizador, la taxonomía de etiquetas y un sidecar de calibración para el decodificador Viterbi. La cadena de inferencia completa incluye tokenización, ejecución del grafo ONNX, decodificación BIOES Viterbi restringida y refinamiento de offsets de caracteres.

La relevancia de este modelo radica en su especialización para el dominio financiero coreano, con etiquetas específicas como RRN (número de registro de residente), FRN (número de registro extranjero), IPIN, CARD_EXPIRY y CVC, que no están presentes en modelos genéricos de PII. Su formato INT8 weight-only permite un despliegue eficiente en CPU sin pérdida significativa de precisión, manteniendo activaciones y logits en FP32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con 128 expertos, 8 capas, hidden size 640, atención bidireccional con banda ±128, tokenizer o200k |
| Parametros totales | 1.400 millones (modelo base `openai/privacy-filter`) |
| Parametros activos | 50 millones |
| Longitud de contexto | 768 tokens (secuencias de entrenamiento; se recomienda trocear entradas más largas) |
| Tipos de cuantizacion | INT8 weight-only (operadores ONNX `MatMulNBits`, `QMoE`, `GatherBlockQuantized`), activaciones y logits en FP32 |
| Idiomas soportados | Coreano (ko) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grafo + datos externos del tensor), no incluye safetensors ni pesos PyTorch |

## Arquitectura y entrenamiento

El modelo se basa en `openai/privacy-filter`, un transformer MoE con 128 expertos y solo 50 millones de parámetros activos por token, lo que permite una inferencia eficiente a pesar de su tamaño total de 1.400 millones. La arquitectura incorpora atención bidireccional con banda limitada (±128 tokens), adecuada para tareas de clasificación de tokens como NER. El tokenizador es o200k, el mismo que utiliza el modelo base.

El entrenamiento consistió en un fine-tuning completo de todos los parámetros (incluidos expertos y router) sobre datos sintéticos del dominio financiero, combinando conjuntos públicos como `openpii-1.5m-ko` y `openpii-1.5m-en` con filas sintetizadas localmente para cubrir entidades específicas de Corea (RRN, FRN, IPIN, etc.). Se re-inicializó la cabeza de clasificación con 73 clases BIOES (18 entidades × 4 límites + clase O), copiando filas de la cabeza base mediante un mapeo de taxonomía. El decodificador emplea un Viterbi BIOES restringido en lugar de argmax por token, con un sidecar `viterbi_calibration.json` que expone puntos de operación de precisión/recall sin necesidad de reentrenar.

## Capacidades

- Detección de 18 tipos de entidades PII en texto: `PERSON`, `RRN`, `FRN`, `CARD_NUMBER`, `ACCOUNT_NUMBER`, `SECRET`, `USER_ID`, `EMAIL`, `PHONE`, `PASSPORT`, `DRIVER_LICENSE`, `GENERIC_ID`, `ADDRESS`, `ZIPCODE`, `DATE`, `CARD_EXPIRY`, `CVC`, `IPIN`.
- Clasificación de tokens con etiquetas BIOES (73 clases) para segmentación precisa de entidades.
- Decodificación Viterbi restringida que garantiza la coherencia de las secuencias BIOES y permite ajustar el equilibrio precisión/recall mediante calibración.
- Refinamiento de offsets de caracteres y ajuste de límites de espacios en blanco para obtener spans exactos.
- Soporte bilingüe coreano-inglés con especialización en textos financieros (tarjetas, cuentas, identificaciones nacionales, atención al cliente).
- Integración como capa NER en un pipeline de enmascaramiento de PII antes de enviar texto a un LLM.
- Funcionamiento en CPU gracias a la cuantización INT8 weight-only, sin necesidad de GPU.

## Casos de uso

- Gateway de enmascaramiento de PII en servicios LLM: el modelo detecta entidades PII en las entradas del usuario antes de que lleguen al modelo generativo, las enmascara y así evita fugas de información sensible. Su baja latencia en CPU permite colocarlo como filtro en tiempo real.
- Auditoría de privacidad offline: análisis de logs, documentos y bases de datos almacenadas para descubrir PII no protegida, facilitando el cumplimiento normativo (p. ej., LGPD coreana o regulaciones sectoriales).
- Anonimización de conjuntos de datos de entrenamiento: antes de usar datos financieros para entrenar modelos, se aplica el detector para eliminar o sustituir identificadores personales, reduciendo el riesgo de reidentificación.
- Cumplimiento de protección de datos en atención al cliente: las conversaciones de soporte (coreano o inglés) se procesan para detectar números de tarjeta, RRN, cuentas bancarias, etc., y se enmascaran antes de almacenarlas o analizarlas.
- Verificación de redacciones de documentos: revisión automática de contratos, facturas o extractos para garantizar que no contienen PII visible antes de su publicación o envío externo.
- Integración en pipelines de ingesta de datos: como etapa de preprocesamiento en sistemas que reciben texto financiero (correos, formularios), el modelo etiqueta y extrae entidades para su posterior enmascaramiento o registro.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card menciona métricas de F1, precisión y recall, pero no se proporcionan valores concretos. Tampoco hay comparativas con otros modelos de PII en la documentación del repositorio.

## Requisitos de hardware

- Inferencia en CPU: al ser INT8 weight-only, el modelo puede ejecutarse en CPU con ONNX Runtime (versión >=1.28). El tamaño del repositorio es de 1,6 GB, lo que sugiere un uso de memoria razonable para un entorno de servidor.
- VRAM estimada: no se especifica, pero al no requerir GPU, la VRAM no es un requisito. En caso de usar GPU, la huella sería menor que la del modelo FP32 (1,4B parámetros ≈ 5,6 GB en FP32, ~1,4 GB en INT8).
- GPU recomendadas: no se indica ninguna específica. El modelo está pensado para CPU; si se desea aceleración GPU, cualquier GPU moderna con soporte ONNX Runtime serviría, pero no es necesaria.
- Opciones de despliegue: ONNX Runtime (CPU o GPU) es la vía principal. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que el formato es ONNX específico para token classification.
- Latencia y throughput: no se proporcionan datos medidos. Dado el tamaño activo de 50M de parámetros y la cuantización INT8, se espera una latencia baja en CPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Especialización |
|---|---|---|---|---|---|
| `openai/privacy-filter` (base) | 1,4B (50M activos) | 768 tokens (entrenamiento) | Apache-2.0 | PyTorch | PII genérica (multiidioma) |
| `BCCard/MoAI-Privacy-Filter-INT8` (este) | 1,4B (50M activos) | 768 tokens | Apache-2.0 | ONNX INT8 weight-only | PII financiera coreano/inglés |
| `BCCard/MoAI-Privacy-Filter` (versión no cuantizada) | 1,4B (50M activos) | 768 tokens | Apache-2.0 | PyTorch | PII financiera coreano/inglés |

La comparativa se limita a las variantes del mismo modelo. No se dispone de información sobre alternativas como Presidio o modelos NER genéricos para comparar directamente en este contexto.

## Limitaciones y advertencias

- El modelo solo cubre coreano e inglés; no es aplicable a otros idiomas sin reentrenamiento.
- Está especializado en el dominio financiero; su rendimiento en textos de otros sectores puede degradarse.
- La longitud de contexto está limitada a 768 tokens; entradas más largas deben trocearse, lo que puede afectar a la detección de entidades que cruzan fragmentos.
- El repositorio no contiene pesos PyTorch; no se puede cargar con `AutoModelForTokenClassification` ni con el pipeline estándar de Transformers. Solo es utilizable mediante ONNX Runtime.
- La decodificación Viterbi es parte esencial del pipeline; el argmax por token no produce los mismos resultados y podría llevar a errores de etiquetado.
- No se han publicado benchmarks cuantitativos, por lo que el rendimiento real en producción debe validarse con datos propios del dominio.
- Aunque la licencia es Apache-2.0, el uso en entornos de alta sensibilidad requiere evaluación en dominio y monitoreo continuo, como advierte la propia documentación.
- Posibles sesgos derivados de los datos sintéticos de entrenamiento, que pueden no reflejar toda la variabilidad de los textos reales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/BCCard/MoAI-Privacy-Filter-INT8
- Modelo base: https://huggingface.co/openai/privacy-filter
- Versión no cuantizada: https://huggingface.co/BCCard/MoAI-Privacy-Filter
- Sitio web de BC Card AI: https://moai.bccard.ai/
- GitHub de BC Card AI: https://github.com/bccard-ai
