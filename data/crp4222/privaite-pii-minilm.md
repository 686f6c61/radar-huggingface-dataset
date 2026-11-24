# crp4222/privaite-pii-minilm

## Resumen

PrivAiTe PII MiniLM es un clasificador de tokens multilingüe de 117,5 millones de parámetros diseñado para detectar datos personales en texto y permitir su enmascarado antes de que el contenido salga del dispositivo del usuario. Lo desarrolla crp4222 como componente del proxy local [PrivAiTe](https://github.com/crp4222/PrivAiTe), que intercepta el tráfico hacia modelos de lenguaje y pseudonimiza la información sensible. El modelo parte de `microsoft/Multilingual-MiniLM-L12-H384` y se afina para etiquetado BIO con 15 tipos de entidad y 31 etiquetas.

La relevancia del modelo está en su relación entre tamaño y rendimiento: con 117 millones de parámetros (de los cuales 96 millones son la tabla de embeddings congelada) cubre nueve idiomas europeos y se distribuye en tres formatos (PyTorch, ONNX y Core ML) para ejecutarse en CPU o en la Neural Engine de Apple. Según la model card, en 6 de los 9 conjuntos de test no vistos iguala o supera al mejor de cinco modelos abiertos de PII entre 2,5 y 7 veces más grandes en disco, con una latencia de 9 ms por cada 1.000 caracteres en una M1 Pro.

El modelo no pretende anonimizar, sino pseudonimizar: sustituye lo que detecta y deja pasar parte de los datos personales, por lo que debe tratarse como una capa de defensa en profundidad y no como una garantía de privacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT, MiniLM L12 H384) con cabeza de token classification |
| Parametros totales | 117.517.855 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de 256 tokens con 64 de solapamiento |
| Tipos de cuantizacion | fp32 (ONNX), int8 (ONNX), fp16 (Core ML) |
| Idiomas soportados | multilingüe: en, fr, de, es, it, pt, nl, sv, da, fi |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors, ONNX (fp32 e int8), Core ML (.mlpackage) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo BERT con 12 capas y dimensión oculta de 384, derivado de `microsoft/Multilingual-MiniLM-L12-H384` con vocabulario XLM-R. Sobre el encoder se añade una cabeza de clasificación de tokens que produce 31 etiquetas en esquema BIO para 15 tipos de entidad (PERSON, CONTACT, ADDRESS, LOCATION, ORGANIZATION, DATE, DATE_OF_BIRTH, AGE, DEMOGRAPHIC, GOV_ID, FINANCIAL, NETWORK_ID, RECORD_ID, SECRET y OTHER). De los 117 millones de parámetros, 96 millones corresponden a la tabla de embeddings multilingüe, que permanece congelada durante el ajuste fino.

El entrenamiento se realizó sobre ventanas de 256 tokens con 64 tokens de solapamiento, y el tokenizador se configura a 256 para reproducir ese esquema en inferencia mediante `stride=64`. Los conjuntos de datos citados en la model card son `nvidia/Nemotron-PII`, `ai4privacy/pii-masking-openpii-1m`, `gretelai/gretel-pii-masking-en-v1`, `gretelai/synthetic_pii_finance_multilingual`, `joelniklaus/mapa` y `MultiCoNER/multiconer_v2`. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación principal es la distribución multi-formato: el mismo encoder se exporta a ONNX fp32 (predicciones idénticas a PyTorch), ONNX int8 (4 veces más pequeño y aproximadamente el doble de rápido, con la misma precisión dentro de un punto) y Core ML fp16 con entrada fija de 256 tokens para la Neural Engine de Apple. La evaluación se realizó con el scorer de [privaite-bench](https://github.com/crp4222/privaite-benc).

## Capacidades

- Detección de entidades de datos personales en texto con etiquetado BIO y 15 tipos de entidad.
- Generación de spans de PII listos para enmascarado o pseudonimizado en pipelines de privacidad.
- Procesamiento multilingüe en nueve idiomas: inglés, francés, alemán, español, italiano, portugués, neerlandés, sueco, danés y finés.
- Manejo de textos largos mediante ventanas deslizantes de 256 tokens con solapamiento de 64 y agregación de predicciones por distancia al borde de ventana.
- Inferencia en CPU mediante ONNX Runtime (fp32 o int8) en cualquier plataforma.
- Inferencia acelerada en la Neural Engine de Apple mediante Core ML en macOS.
- Integración como preset opcional en el proxy PrivAiTe (`preset: minilm` y `preset: ultrafast`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es exclusivamente un clasificador de tokens.

## Casos de uso

- Enmascarado de prompts antes de enviarlos a un LLM: el modelo se ejecuta en local sobre el texto del usuario, detecta personas, correos, teléfonos, IBAN y direcciones, y sustituye esos spans por marcadores antes de que la petición salga del dispositivo. Es adecuado por su latencia de 9 ms por 1.000 caracteres en Neural Engine y 23 ms en CPU con int8.
- Proxy de privacidad para tráfico de LLM en producción: integrado en PrivAiTe, intercepta las peticiones a APIs de terceros y aplica pseudonimización en tiempo real sin añadir dependencias de red.
- Cumplimiento de RGPD en pipelines de datos: detección y etiquetado de datos personales en logs, tickets y documentos internos antes de almacenarlos o compartirlos con proveedores, cubriendo categorías como GOV_ID, FINANCIAL y RECORD_ID.
- Redacción de documentos multilingües: procesamiento de contratos, informes médicos o expedientes de RRHH en varios idiomas europeos con un único modelo, evitando mantener un detector por idioma.
- Preprocesado de datasets para entrenamiento: limpieza de corpus que contienen PII antes de usarlos en ajuste fino de modelos, con soporte para los formatos citados en el entrenamiento (Nemotron-PII, OpenPII, MAPA, MultiCoNER).
- Filtrado en herramientas de atención al cliente: detección de nombres, contactos y números de cuenta en conversaciones multi-turno antes de enviarlas a sistemas de analítica o de resumen automático.
- Ejecución en dispositivos Apple: aplicaciones macOS que necesitan clasificar PII sin conexión y sin GPU dedicada, usando el paquete Core ML en la Neural Engine.

## Benchmarks y rendimiento

La model card indica que, en 6 de los 9 conjuntos de test no vistos, el modelo enmascara tantas personas como el mejor de cinco modelos abiertos de PII (entre 2,5 y 7 veces más grandes en disco) o más, normalmente con mayor precisión. Sin embargo, la información proporcionada no incluye la tabla numérica de resultados por conjunto de test, por lo que no se dispone de cifras concretas de precisión, recall o F1.

| Metrica | Valor |
|---|---|
| Conjuntos de test no vistos | 9 |
| Conjuntos donde iguala o supera al mejor de cinco modelos abiertos | 6 de 9 |
| Latencia en M1 Pro Neural Engine | 9 ms por 1.000 caracteres |
| Latencia en CPU con int8 | 23 ms por 1.000 caracteres |
| Diferencia de precisión ONNX int8 vs fp32 | misma precisión dentro de un punto |

No se han publicado en la información disponible resultados numéricos de benchmarks estándar como MMLU, HumanEval o GSM8K, que además no aplican a un modelo de token classification.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo es pequeño y cabe en CPU; en GPU, menos de 1 GB en fp32 (117,5 millones de parámetros) y aproximadamente 0,5 GB en int8.
- GPU recomendadas: no requiere GPU. Puede ejecutarse en cualquier CPU moderna con ONNX Runtime y en la Neural Engine de Apple (M1 Pro o superior) mediante Core ML.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1 GB de memoria (por ejemplo, RTX 3060 o superior), aunque no es necesario.
- Opciones de despliegue: Transformers con pipeline de token classification, ONNX Runtime (CPUExecutionProvider), Core ML con coremltools y ComputeUnit.CPU_AND_NE, e integración en PrivAiTe.
- Latencia y throughput: 9 ms por 1.000 caracteres en Neural Engine de M1 Pro; 23 ms por 1.000 caracteres en CPU con int8. El modelo ONNX int8 es 4 veces más pequeño y aproximadamente el doble de rápido que el fp32.

## Comparativa con modelos similares

La información disponible menciona cinco modelos abiertos de PII como referencia de comparación, pero no proporciona sus nombres, parámetros, contexto ni licencias. Por tanto, la comparativa numérica no está disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| PrivAiTe PII MiniLM | 117,5 M | ventanas de 256 tokens | BSD-3-Clause | Hugging Face, ONNX, Core ML |
| Modelos abiertos de PII de referencia (5) | entre 2,5 y 7 veces más grandes en disco | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El enmascarado es pseudonimización, no anonimización: el modelo deja pasar parte de los datos personales y no debe considerarse una garantía de privacidad.
- Riesgo de falsos negativos en entidades poco representadas o con formatos atípicos; la model card no detalla la cobertura por tipo de entidad.
- El contexto efectivo está limitado a ventanas de 256 tokens con solapamiento de 64; textos más largos requieren agregación manual de predicciones y pueden perder entidades en los bordes de ventana.
- La cobertura lingüística se limita a los nueve idiomas declarados; no se especifica el rendimiento en otros idiomas.
- No se detallan en la información disponible sesgos conocidos del modelo ni la composición demográfica de los datos de entrenamiento.
- La licencia BSD-3-Clause permite uso comercial con atribución, pero debe revisarse el cumplimiento de las licencias de los datasets de entrenamiento citados.
- El paquete Core ML tiene entrada fija de 256 tokens, lo que obliga a rellenar cada ventana y limita la flexibilidad en dispositivos Apple.
- La fecha de creación indicada en Hugging Face (2026-10-30) es posterior a la fecha actual, lo que conviene verificar antes de citar el modelo en producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/crp4222/privaite-pii-minilm)
- [Repositorio PrivAiTe](https://github.com/crp4222/PrivAiTe)
- [privaite-bench](https://github.com/crp4222/privaite-benc)
- [Modelo base microsoft/Multilingual-MiniLM-L12-H384](https://huggingface.co/microsoft/Multilingual-MiniLM-L12-H384)
- [Dataset nvidia/Nemotron-PII](https://huggingface.co/datasets/nvidia/Nemotron-PII)
- [Dataset ai4privacy/pii-masking-openpii-1m](https://huggingface.co/datasets/ai4privacy/pii-masking-openpii-1m)
- [Dataset gretelai/gretel-pii-masking-en-v1](https://huggingface.co/datasets/gretelai/gretel-pii-masking-en-v1)
- [Dataset gretelai/synthetic_pii_finance_multilingual](https://huggingface.co/datasets/gretelai/synthetic_pii_finance_multilingual)
- [Dataset joelniklaus/mapa](https://huggingface.co/datasets/joelniklaus/mapa)
- [Dataset MultiCoNER/multiconer_v2](https://huggingface.co/datasets/MultiCoNER/multiconer_v2)
