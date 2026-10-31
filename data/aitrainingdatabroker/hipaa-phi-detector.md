# aitrainingdatabroker/hipaa-phi-detector

## Resumen

HIPAA PHI Detector es un modelo de clasificación de tokens (NER) desarrollado por AI Training Data Broker para detectar los identificadores protegidos según la lista Safe Harbor de HIPAA (45 CFR 164.514(b)(2)) en texto sanitario administrativo en inglés: notas de recepción, notas de facturación, autorizaciones previas, reclamaciones, derivaciones y mensajes de portales de pacientes. El modelo está fine-tuned a partir de `distilroberta-base` y tiene 81.553.185 parámetros, lo que lo hace ligero y apto para ejecutarse en hardware de consumo.

Su propósito es resolver un problema concreto y frecuente en el sector sanitario: identificar en texto libre los 18 tipos de identificadores que exige eliminar el método Safe Harbor (nombres, fechas, teléfonos, correos, direcciones, números de historia clínica, SSN, IDs de plan de salud, etc.) antes de compartir o licenciar datos. No pretende sustituir la revisión humana ni el asesoramiento legal, sino actuar como filtro previo que marca candidatos para revisión.

Es relevante porque la desidentificación de texto libre es el cuello de botella práctico del cumplimiento de HIPAA, CCPA/GDPR y normativas similares cuando las organizaciones quieren usar datos sanitarios para entrenar modelos de IA. El modelo se entrenó exclusivamente con datos sintéticos (1380 frases inventadas), lo que evita cualquier riesgo de privacidad en el propio entrenamiento, y publica sus scripts de generación de datos, entrenamiento y evaluación, así como sus puntuaciones completas, con una transparencia poco habitual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa, variante Distil) fine-tuned para token-classification |
| Parametros totales | 81.553.185 |
| Parametros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | no disponible (límite estándar de distilroberta-base: 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos en fp32/fp16 estándar, sin versiones cuantizadas publicadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilroberta-base`, una versión destilada de RoBERTa con 6 capas de encoder transformer y 82,8 millones de parámetros originales. Sobre esta base se añade una cabeza de clasificación de tokens que etiqueta spans de texto con 15 tipos de entidad alineados con la lista Safe Harbor: `NAME`, `DATE`, `AGE_OVER_89`, `PHONE`, `FAX`, `EMAIL`, `ADDRESS`, `SSN`, `MRN`, `HEALTH_PLAN_ID`, `ACCOUNT_NUMBER`, `DEVICE_ID`, `VEHICLE_ID`, `URL` e `IP_ADDRESS`.

El entrenamiento consistió en un fine-tuning de 8 épocas sobre una única RTX 3070, con 1380 frases sintéticas generadas por el script `source/build.py` del repositorio. Ningún dato procede de personas o negocios reales. El conjunto de test (220 filas) se construyó con plantillas distintas a las de entrenamiento, lo que da una medida algo más realista de generalización, aunque sigue siendo texto sintético. Los scripts completos de generación de datos, entrenamiento y evaluación están publicados en el repositorio, junto con las puntuaciones en `scores.json`.

## Capacidades

- Deteccion de entidades nombradas (NER) de identificadores HIPAA Safe Harbor en texto administrativo sanitario en ingles.
- Etiquetado de 15 clases: nombres, fechas, edades mayores de 89 anos, telefonos y faxes, correos electronicos, direcciones y codigos ZIP, numeros de la Seguridad Social, numeros de historia clinica (MRN), IDs de plan de salud, numeros de cuenta, licencias, identificadores de vehiculo, numeros de serie de dispositivos, URLs y direcciones IP.
- Integracion nativa con el pipeline `token-classification` de HuggingFace Transformers, con `aggregation_strategy="simple"` para obtener spans agregados con puntuacion de confianza.
- Salida orientada a revision humana: marca candidatos de identificador para que una persona los verifique antes de redactar (redaction) o compartir datos.
- No soporta: vision, audio, generacion de texto, tool calling ni razonamiento multi-paso; es un modelo discriminativo de encoder.
- Fuera de alcance por diseno: fotos, biometria y otros identificadores no textuales de la lista Safe Harbor.

## Casos de uso

- Pre-pantalla de notas de recepcion y front desk: el modelo escanea notas de texto libre escritas por personal administrativo y marca nombres, telefonos y MRN antes de que el texto se use para analiticas o entrenamiento.
- Revisacion de comentarios en reclamaciones (claims): detecta IDs de plan de salud y numeros de cuenta incrustados en comentarios de facturacion, uno de los puntos ciegos tipicos de los flujos automatizados.
- Autorizaciones previas y derivaciones: identifica nombres de pacientes, fechas y telefonos de cuidadores en cartas de prior authorization, acelerando la redaccion previa a envio.
- Mensajes de portales de pacientes: filtra correos electronicos, telefonos y direcciones en mensajes paciente-clinica que una organizacion quiera reutilizar para mejorar servicios.
- Preparacion de datasets de entrenamiento sintetico o licenciables: como paso previo a licenciar datos sanitarios a laboratorios de IA, marca candidatos de PHI para revision experta, en linea con el caso de uso del propio autor.
- Auditoria interna de cumplimiento: ejecuta el modelo por lotes sobre archivos de texto historicos para estimar cuanta PHI residual contiene un corpus antes de una revision legal formal.
- Integracion en pipelines ETL de datos sanitarios: por su tamano reducido (82M de parametros) puede ejecutarse en linea dentro de un flujo de ingesta que marque documentos con alto contenido de identificadores.

## Benchmarks y rendimiento

Evaluacion de coincidencia exacta de entidad sobre 220 filas de test retenidas (plantillas no vistas en entrenamiento): precision 0.829, recall 0.898, F1 0.862.

| Tipo | Precision | Recall | F1 | Muestra |
|---|---|---|---|---|
| `ACCOUNT_NUMBER` | 1.0 | 1.0 | 1.0 | 25 |
| `ADDRESS` | 1.0 | 1.0 | 1.0 | 50 |
| `AGE_OVER_89` | 1.0 | 1.0 | 1.0 | 25 |
| `DATE` | 1.0 | 1.0 | 1.0 | 50 |
| `DEVICE_ID` | 0.694 | 1.0 | 0.82 | 25 |
| `EMAIL` | 1.0 | 1.0 | 1.0 | 25 |
| `FAX` | 0.194 | 0.24 | 0.214 | 25 |
| `HEALTH_PLAN_ID` | 1.0 | 1.0 | 1.0 | 25 |
| `IP_ADDRESS` | 1.0 | 1.0 | 1.0 | 25 |
| `MRN` | 0.88 | 0.88 | 0.88 | 25 |
| `NAME` | 0.949 | 1.0 | 0.974 | 150 |
| `PHONE` | 0.118 | 0.16 | 0.136 | 25 |
| `SSN` | 1.0 | 1.0 | 1.0 | 25 |
| `URL` | 1.0 | 1.0 | 1.0 | 25 |
| `VEHICLE_ID` | 0.353 | 0.48 | 0.407 | 25 |

No hay comparaciones publicadas con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32; aproximadamente 0,3 GB de pesos. Cabe con holgura en cualquier GPU moderna e incluso en CPU.
- GPU recomendadas: cualquiera; el autor entreno en una RTX 3070, muy por encima de lo necesario para inferencia. No se requiere A100 ni H100.
- Consumer GPUs: sobradamente apto en RTX 3060/3070/4060 o superiores; tambien ejecutable solo en CPU con latencia aceptable para procesado por lotes.
- Despliegue: libreria `transformers` de HuggingFace mediante `pipeline("token-classification", ...)`. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama no son opciones directas; vLLM y TGI estan orientados a modelos generativos y no son el camino natural. Para produccion, un microservicio con FastAPI + Transformers o ONNX Runtime son alternativas razonables.
- Latencia y throughput: no disponible; dada la arquitectura (encoder de 6 capas, ~82M parametros), se espera inferencia de milisegundos por documento corto en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Datos de entrenamiento | Licencia |
|---|---|---|---|---|
| aitrainingdatabroker/hipaa-phi-detector | 81,6M | NER de 15 tipos de identificador HIPAA Safe Harbor | 1380 frases sinteticas (publicadas) | Apache 2.0 |
| Microsoft Presidio (analyzer, basado en reglas + NER spaCy/en_core_web_lg) | ~500M (spaCy) | Deteccion de PII/PHI por reglas + NER generico | Reglas + modelos preentrenados genericos | MIT |
| stanford-deid / modelos NER clinicos (p. ej. i2b2 NER) | variable | Deidentificacion de texto clinico | Corpora clinicos reales anonimizados (restringidos) | variable, a menudo no comercial |

Presidio es la alternativa mas madura para produccion y combina reglas deterministas con NER, pero no esta especializado en la taxonomia Safe Harbor; este modelo ofrece etiquetas directamente mapeadas a los 18 identificadores HIPAA y datos de entrenamiento reproducibles, a costa de un rendimiento debil en PHONE/FAX y VEHICLE_ID y de estar entrenado solo con texto sintetico.

## Limitaciones y advertencias

- Entrenado exclusivamente con texto sintetico de plantillas; el texto real de clinicas varia mucho mas, por lo que el rendimiento en produccion puede ser inferior al reportado (F1 0,862 en plantillas no vistas).
- Rendimiento muy debil en `PHONE` (F1 0,136) y `FAX` (F1 0,214): confunde ambos tipos entre si porque son visualmente identicos; el autor recomienda tratarlos como un unico hallazgo. `VEHICLE_ID` tambien es debil (F1 0,407) y `DEVICE_ID` tiene precision baja (0,694) pese a recall perfecto.
- Riesgo de falsos negativos: con recall global de 0,898, aproximadamente 1 de cada 10 identificadores puede pasar desapercibido; en un contexto HIPAA esto es un riesgo de cumplimiento significativo. La salida debe revisarse siempre por una persona.
- Detectar identificadores es solo parte de Safe Harbor: la norma exige ademas que no exista conocimiento real de que el resto del texto podria reidentificar a alguien. La via alternativa es Expert Determination.
- No es asesoramiento legal ni una certificacion de cumplimiento; HIPAA, CCPA/CPRA, GDPR, PIPEDA u otras normativas requieren valoracion de letrados y, cuando proceda, de un experto cualificado.
- Solo ingles; no sirve para texto sanitario en castellano u otros idiomas.
- Licencia Apache 2.0: permite uso comercial, pero el autor pide acreditar a AI Training Data Broker con enlace a su web al reutilizar o construir sobre el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aitrainingdatabroker/hipaa-phi-detector
- Modelo base: https://huggingface.co/distilbert/distilroberta-base
- Blog: HIPAA Safe Harbor, los 18 identificadores: https://aitrainingdatabroker.com/blog/hipaa-safe-harbor-the-18-identifiers-for-business-data/
- Desidentificacion para HIPAA, CCPA y GDPR: https://aitrainingdatabroker.com/de-identification/
- Licencia de datos sanitarios a IA: https://aitrainingdatabroker.com/sell/healthcare-practices/
- Web del autor: https://aitrainingdatabroker.com/
- Scripts de datos y entrenamiento: en el directorio `source/` del repositorio del modelo; puntuaciones completas en `scores.json`.
