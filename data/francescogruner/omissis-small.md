# francescogruner/omissis-small

## Resumen

omissis-small es un modelo de clasificación de tokens (token classification, NER) especializado en la detección de datos personales y confidenciales (PII) en texto, desarrollado por francescogruner. Su función es identificar entidades sensibles —nombres, correos, teléfonos, IBAN, códigos fiscales, credenciales, direcciones IP, hostnames, secretos— para que puedan sustituirse por marcadores de posición antes de enviar el texto a un servicio de IA. Está construido sobre el modelo base jhu-clsp/mmBERT-small (140,9 M de parámetros) y se distribuye con licencia Apache 2.0.

El modelo forma parte del proyecto Omissis, que incluye un programa de escritorio, una extensión de navegador y el código de entrenamiento. Está pensado en primer lugar para italiano y para textos de soporte IT, pero se ha entrenado sobre 23 idiomas, con etiquetas y documentación en italiano porque son las que el servicio de IA receptor ve en los marcadores (`[PERSONA_1]`, `[IBAN_2]`). Existe una versión mayor, omissis-base, con 307,8 M de parámetros.

Su relevancia actual radica en el cumplimiento del RGPD y en la necesidad de anonimizar o pseudonimizar texto antes de procesarlo con modelos generativos o APIs de terceros. Al ser un modelo pequeño (140,7 M de parámetros según los pesos en safetensors), puede ejecutarse en local con requisitos de hardware modestos, lo que encaja con flujos de privacidad en el borde (edge) y con el preprocesado previo a llamadas a servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, según tags), derivado de jhu-clsp/mmBERT-small |
| Parametros totales | 140.673.491 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo con safetensors y ONNX; cuantizaciones concretas no especificadas) |
| Idiomas soportados | it, en, de, fr, es, nl, multilingual (entrenado sobre 23 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo ModernBERT (según los tags del repositorio) inicializado desde jhu-clsp/mmBERT-small, un modelo multilingüe de 140,9 M de parámetros. Se entrena como clasificador de tokens con 41 etiquetas en formato BIO: 28 identificadores destinados siempre a enmascararse (persona, email, teléfono, dirección, código postal, ciudad, fecha de nacimiento, código fiscal, IVA, documento de identidad, matrícula, VIN, número de expediente, catastro, cuenta de suministros, IBAN, tarjeta, CVV, organización, IP, MAC, hostname, dominio, URL, cuenta, secreto, identificador de nube y número de serie de dispositivo) y 13 etiquetas adicionales de datos que solo identifican en combinación con otros (fecha, hora, edad, género, título, profesión, educación, origen, lugar, salud, religión, política, orientación sexual).

El entrenamiento usa aproximadamente 1,05 millones de textos de diez fuentes. Todo es sintético salvo dos colecciones de resoluciones judiciales con nombres reales ya públicos. Incluye 200.000 documentos sintéticos en italiano generados con `generate_data.py` (ámbitos legal, fiscal, seguros, sanidad, recursos humanos, banca, soporte IT y seguridad), con valores como códigos fiscales e IBAN con dígitos de control válidos. Se complementa con los splits de entrenamiento de nueve datasets públicos (ai4privacy/pii-masking-openpii-1m, nvidia/Nemotron-PII, gretelai/gretel-pii-masking-en-v1, gretelai/synthetic_pii_finance_multilingual, piimb/privy, dglover1/mapa-eur-lex, Wismut/nym-pii-multilingual-data, Text Anonymization Benchmark y urchade/synthetic-pii-ner-mistral-v1), sin usar sus splits de test. Como innovación destacable, el modelo es "cauteloso por construcción": los umbrales de decisión están incorporados en los pesos (una palabra solo queda como no sensible si el modelo está al menos al 93 % de seguridad; 98 % para nombres de empresa; 40 % para dominios), y el script `inference.py` añade reglas con validación de checksum para códigos fiscales, IVA, IBAN, tarjetas e IP, además de listas de nombres y términos a dejar en claro.

## Capacidades

- Detección de entidades nombradas (NER) para 41 etiquetas de PII y datos confidenciales en formato BIO.
- Identificación de 28 identificadores de enmascaramiento obligatorio (personas, contactos, identificadores fiscales y bancarios, organizaciones, datos de IT y credenciales).
- Identificación de 13 etiquetas de datos sensibles o cuasi-identificadores (salud, religión, política, orientación sexual, origen, etc.).
- Soporte multilingüe en 23 idiomas de entrenamiento, con foco principal en italiano e inglés y cobertura declarada de de, fr, es, nl.
- Capacidad de clasificación de tokens por token con umbrales calibrados internamente para reducir falsos positivos.
- No dispone de generación de texto, tool calling, razonamiento multi-paso ni capacidades de agente: es exclusivamente un modelo de etiquetado.
- No dispone de visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Anonimización previa a APIs de IA: el modelo detecta PII en el prompt del usuario y la sustituye por marcadores (`[PERSONA_1]`, `[IBAN_2]`) antes de enviarlo a un servicio externo, reduciendo la exposición de datos personales en cumplimiento del RGPD.
- Soporte técnico IT: identifica hostnames, direcciones IP, MAC, cuentas, secretos y números de serie en tickets y trazas de protocolo, adecuado por su entrenamiento específico en textos de soporte y seguridad.
- Cumplimiento normativo en documentos legales y fiscales: reconoce códigos fiscales, números de IVA, IBAN y datos catastrales con validación de checksum mediante `inference.py`, útil para pipelines de revisión documental.
- Sanitización de logs y trazas: al cubrir JSON, SQL y trazas de protocolo (dataset piimb/privy), puede integrarse en pipelines de observabilidad para enmascarar credenciales y datos de clientes antes de almacenar o compartir logs.
- Preprocesado en aplicaciones de escritorio y extensiones de navegador: su tamaño reducido permite ejecución local dentro del programa Omissis y de la extensión de navegador, sin enviar el texto a ningún servidor.
- Procesamiento de documentación financiera multilingüe: entrenado con documentos financieros completos en 7 idiomas, sirve para anonimizar extractos, contratos y expedientes antes de su análisis automatizado.
- Enmascaramiento de resoluciones judiciales: cubre textos del Tribunal Europeo de Derechos Humanos y EUR-Lex, útil para publicar sentencias con datos personales suprimidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 140,7 M de parámetros, los pesos en fp32 ocupan aproximadamente 0,56 GB y en fp16 unos 0,28 GB, más el overhead de activaciones y tokenizador.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer moderna es suficiente, aunque el autor no especifica modelos concretos.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 2 GB de VRAM, dado el tamaño del modelo (dato estimado a partir del número de parámetros, no confirmado por el autor).
- Opciones de despliegue: pipeline de `transformers` (`token-classification`), pesos ONNX incluidos en el repositorio, y el script `inference.py` del proyecto Omissis con reglas y listas. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| omissis-small | 140,7 M | no disponible | NER de PII, 41 etiquetas | Apache 2.0 | Hugging Face |
| omissis-base | 307,8 M | no disponible | NER de PII | no disponible en la informacion | Hugging Face |
| jhu-clsp/mmBERT-small | 140,9 M | no disponible | Modelo base multilingüe (encoder) | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo está pensado principalmente para italiano y soporte IT; aunque se entrena en 23 idiomas, el rendimiento en idiomas distintos del italiano y el inglés no está cuantificado en la información disponible.
- Riesgo de falsos negativos y falsos positivos inherente a la clasificación de tokens; los umbrales internos (93 %, 98 %, 40 %) priorizan la cautela, pero no eliminan el riesgo de alucinación de entidades o de omisión de PII.
- Las 13 etiquetas adicionales (salud, religión, política, orientación sexual, etc.) no se enmascaran por defecto en el programa Omissis porque su eliminación altera el significado del texto; su uso requiere configuración explícita.
- El modelo no genera texto ni razona: no debe emplearse para tareas generativas ni como sustituto de un LLM.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificar las licencias de los datasets de entrenamiento subyacentes (CC BY 4.0, MIT, Apache 2.0), que imponen obligaciones de atribución en algunos casos.
- Parte del entrenamiento usa datos sintéticos; el rendimiento sobre distribución real puede diferir del reportado en los datasets de origen.
- No se han publicado métricas de evaluación ni benchmarks, lo que dificulta validar su calidad en producción sin una evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/francescogruner/omissis-small
- Versión mayor: https://huggingface.co/francescogruner/omissis-base
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
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
