# francescogruner/omissis-base

## Resumen

omissis-base es un modelo de clasificación de tokens (token-classification) especializado en la detección de datos personales y confidenciales (PII) en texto, desarrollado por el usuario independiente francescogruner. Su función es identificar entidades sensibles para que puedan sustituirse por marcadores de posición antes de enviar el texto a un servicio de IA, lo que lo convierte en una pieza de infraestructura de privacidad orientada al cumplimiento del RGPD. Está construido sobre mmBERT-base (jhu-clsp/mmBERT-base), un modelo multilingüe de 307,8 M de parámetros, y se distribuye con licencia Apache 2.0.

El modelo forma parte del proyecto Omissis, que incluye un programa de escritorio, una extensión de navegador y el código de entrenamiento. Se ha diseñado prioritariamente para italiano y para textos de soporte informático (nombres de host, cuentas, secretos, nombres de clientes), aunque se ha entrenado sobre 23 idiomas. Detecta 41 etiquetas en formato BIO, de las cuales 28 son identificadores que deben enmascararse siempre y 13 son detalles que solo identifican en combinación con otros datos o categorías especiales.

La relevancia actual del modelo reside en su enfoque de "cautela por construcción": los umbrales de decisión están incorporados en los pesos, de modo que una palabra solo se clasifica como no sensible si el modelo está al menos un 93 % seguro (98 % para nombres de empresa, 40 % para dominios). Esto reduce los falsos negativos en un contexto donde una fuga de PII tiene costes legales y reputacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base mmBERT-base) |
| Parametros totales | 307.594.067 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo incluye safetensors y ONNX) |
| Idiomas soportados | it, en, de, fr, es, nl, multilingual (23 idiomas en entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo ModernBERT, inicializado desde mmBERT-base, un modelo multilingüe de 307,8 M de parámetros. Se trata de una tarea de clasificación de tokens con 41 etiquetas en formato BIO. La innovación principal no está en la arquitectura sino en el esquema de decisión: los umbrales de confianza están calibrados dentro de los pesos, de forma que la clase más probable ya incorpora la política de cautela (93 % de confianza mínima para declarar no sensible, 98 % para nombres de empresa, 40 % para dominios). El repositorio incluye además un script `inference.py` que añade reglas con validación de dígitos de control (código fiscal, IVA, IBAN, tarjetas, IPs) y listas de nombres conocidos que deben dejarse en claro.

El entrenamiento se realizó sobre aproximadamente 1,05 millones de textos procedentes de diez fuentes. Todo el material es sintético excepto dos colecciones de decisiones judiciales con nombres reales ya públicos. Incluye 200.000 documentos sintéticos en italiano generados específicamente para el proyecto (ámbitos legal, fiscal, seguros, sanidad, recursos humanos, banca, soporte informático y seguridad), con valores como códigos fiscales e IBAN con dígitos de control válidos. Los otros nueve conjuntos son públicos y se usaron únicamente sus particiones de entrenamiento: ai4privacy/pii-masking-openpii-1m, nvidia/Nemotron-PII, gretelai/gretel-pii-masking-en-v1, gretelai/synthetic_pii_finance_multilingual, piimb/privy, dglover1/mapa-eur-lex, Wismut/nym-pii-multilingual-data, Text Anonymization Benchmark y urchade/synthetic-pii-ner-mistral-v1. No se especifica en la información disponible si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Detección de 28 identificadores que deben enmascararse siempre: PERSONA, EMAIL, TELEFONO, INDIRIZZO, CAP, CITTA, DATA_NASCITA, CF, PIVA, DOC_ID, TARGA, ID_VEICOLO, ID_PRATICA, CATASTO, ID_UTENZA, IBAN, CARTA, CARTA_SEC, ORG, IP, MAC, HOSTNAME, DOMINIO, URL, ACCOUNT, SEGRETO, ID_CLOUD, ID_DISPOSITIVO.
- Detección de 13 etiquetas adicionales que identifican solo en combinación con otros datos o categorías especiales: DATA, ORA, ETA, GENERE, TITOLO, PROFESSIONE, ISTRUZIONE, ORIGINE, LUOGO, SALUTE, RELIGIONE, POLITICA, ORIENTAMENTO.
- Clasificación de tokens en formato BIO con 41 etiquetas; los nombres de etiqueta están en italiano porque son los que aparecen en los marcadores de posición (`[PERSONA_1]`, `[IBAN_2]`).
- Capacidad multilingüe: entrenado sobre 23 idiomas, con soporte declarado para it, en, de, fr, es, nl y multilingüe.
- Umbrales de decisión calibrados en los pesos para minimizar falsos negativos (cautela por construcción).
- Integración con `pipeline("token-classification")` de transformers y con el script `inference.py` del repositorio, que añade reglas de validación por dígito de control y listas de términos permitidos.
- No se dispone de información sobre soporte de tool calling, agentes o multi-step reasoning; al ser un modelo de clasificación de tokens, estas capacidades no aplican.

## Casos de uso

- Anonimización previa a servicios de IA: el modelo detecta PII en un prompt antes de enviarlo a un LLM externo y sustituye las entidades por marcadores (`[PERSONA_1]`, `[IBAN_2]`), de modo que el proveedor del servicio nunca recibe los datos originales. Es el caso de uso central del proyecto Omissis.
- Cumplimiento del RGPD en pipelines de datos: integrado como paso previo en procesos de ingestión o registro, permite identificar y enmascarar datos personales en textos antes de almacenarlos o compartirlos, con reglas de validación de IBAN, códigos fiscales y tarjetas que reducen los falsos positivos.
- Soporte informático y tickets: el modelo está entrenado específicamente para textos de soporte (nombres de host, cuentas, secretos, nombres de cliente), por lo que puede sanear tickets y conversaciones técnicas antes de enviarlos a herramientas de análisis o de terceros.
- Documentos legales y judiciales: entrenado sobre decisiones del Tribunal Europeo de Derechos Humanos y EUR-Lex, puede detectar nombres, direcciones y números de expediente en resoluciones para su publicación anonimizada.
- Documentos financieros multilingües: gracias al conjunto gretelai/synthetic_pii_finance_multilingual, puede procesar extractos, contratos y comunicaciones bancarias en siete idiomas para enmascarar IBAN, tarjetas y titulares.
- Sanidad y recursos humanos: las etiquetas SALUTE, PROFESSIONE e ISTRUZIONE permiten identificar categorías especiales de datos en informes médicos o currículos, aunque el programa Omissis las deja en claro por defecto porque eliminarlas altera el significado del texto.
- Extensión de navegador y programa de escritorio: el modelo es el motor del programa Omissis, que enmascara texto en el navegador antes de enviarlo a asistentes de IA, con la opción de elegir qué etiquetas adicionales devolver y ajustar los umbrales mediante el archivo `omissis.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 307,6 M de parámetros, en fp16 requiere aproximadamente 0,6 GB de pesos; en fp32, unos 1,2 GB. El repositorio ocupa 6,2 GB e incluye safetensors y ONNX.
- GPU recomendadas: no disponible. Por tamaño, el modelo cabe en cualquier GPU consumer moderna (RTX 3060 en adelante) y puede ejecutarse en CPU para cargas moderadas.
- Cabe en GPU consumer: sí, por el tamaño del modelo (307,6 M de parámetros), aunque no se proporcionan cifras de latencia ni throughput.
- Opciones de despliegue: transformers (`pipeline("token-classification")`), ONNX Runtime (el repo incluye pesos ONNX). No se confirma soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| omissis-base | 307,6 M | No disponible | 23 idiomas (it, en, de, fr, es, nl...) | Apache 2.0 | 41 etiquetas PII, umbrales calibrados, reglas de validación |
| omissis-small | 140,9 M | No disponible | No disponible | Apache 2.0 | Versión ligera del mismo proyecto |
| mmBERT-base (modelo base) | 307,8 M | No disponible | Multilingüe | No disponible | Modelo de lenguaje base, no especializado en PII |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparación se limita a parámetros, licencia y propósito.

## Limitaciones y advertencias

- El modelo está diseñado y entrenado prioritariamente para italiano y textos de soporte informático; su rendimiento en otros idiomas, aunque declarado, puede ser inferior.
- Los umbrales de cautela (93 %, 98 %, 40 %) están calibrados para reducir falsos negativos, lo que puede aumentar los falsos positivos y enmascarar términos que no son sensibles.
- Las 13 etiquetas adicionales (DATA, ORA, ETA, GENERE, TITOLO, PROFESSIONE, ISTRUZIONE, ORIGINE, LUOGO, SALUTE, RELIGIONE, POLITICA, ORIENTAMENTO) identifican solo en combinación con otros datos; el programa Omissis las deja en claro por defecto porque eliminarlas cambia el significado del texto.
- Riesgo de alucinación: al ser un modelo de clasificación de tokens, el riesgo se manifiesta como falsos positivos o falsos negativos en la detección, no como generación de texto inventado.
- Los datos de entrenamiento son mayoritariamente sintéticos, lo que puede no reflejar toda la variabilidad de textos reales; solo dos colecciones contienen nombres reales ya públicos.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la exactitud de la detección ni sobre el cumplimiento normativo derivado de su uso.
- No se dispone de información sobre sesgos conocidos, longitud de contexto máxima ni latencia en producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/francescogruner/omissis-base
- Versión ligera: https://huggingface.co/francescogruner/omissis-small
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Repositorio del proyecto Omissis: https://github.com/francescogruner/omissis
- Dataset ai4privacy/pii-masking-openpii-1m: https://huggingface.co/datasets/ai4privacy/pii-masking-openpii-1m
- Dataset nvidia/Nemotron-PII: https://huggingface.co/datasets/nvidia/Nemotron-PII
- Dataset gretelai/gretel-pii-masking-en-v1: https://huggingface.co/datasets/gretelai/gretel-pii-masking-en-v1
- Dataset gretelai/synthetic_pii_finance_multilingual: https://huggingface.co/datasets/gretelai/synthetic_pii_finance_multilingual
- Dataset piimb/privy: https://huggingface.co/datasets/piimb/privy
- Dataset dglover1/mapa-eur-lex: https://huggingface.co/datasets/dglover1/mapa-eur-lex
- Dataset Wismut/nym-pii-multilingual-data: https://huggingface.co/datasets/Wismut/nym-pii-multilingual-data
- Dataset Text Anonymization Benchmark: https://huggingface.co/datasets/mattmdjaga/text-anonymization-benchmark-train
- Dataset urchade/synthetic-pii-ner-mistral-v1: https://huggingface.co/datasets/urchade/synthetic-pii-ner-mistral-v1
