# CheezOne/pii-detector-zh-ja-ko-en

## Resumen

pii-detector-zh-ja-ko-en es un modelo de clasificación de tokens (reconocimiento de entidades nombradas orientado a privacidad) desarrollado por el usuario CheezOne. Detecta y etiqueta datos personales en textos en chino, japones, coreano e ingles, cubriendo 20 tipos de entidad como nombres, telefonos, documentos nacionales de identidad (身份证), tarjetas bancarias, correos electronicos, direcciones y fechas. Su proposito es facilitar la anonimizacion y el enmascarado de informacion personal en pipelines de datos, registros de aplicaciones y conversaciones de atencion al cliente, en linea con requisitos de cumplimiento como la PIPL china.

El modelo se construye sobre jhu-clsp/mmBERT-small, una arquitectura ModernBERT multilingue, y cuenta con aproximadamente 140,6 millones de parametros. Su principal diferenciador es el enfoque en lenguas CJK: la mayoria de los detectores de PII abiertos estan orientados al ingles o a idiomas europeos, y los existentes en chino son considerablemente mayores (278-600 M de parametros). El tokenizador empleado segmenta el chino de forma fina, lo que permite separar apellido y nombre de pila en entidades como 张伟.

Se distribuye con licencia Apache-2.0, incluye pesos en safetensors y variantes ONNX (fp32 e int8) para Optimum, ONNX Runtime y transformers.js, lo que permite ejecucion en CPU y en navegador. El modelo se entreno unicamente con datos sinteticos y de licencia CC-BY-4.0, sin datos personales reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (mmBERT-small, transformer encoder) |
| Parametros totales | 140.657.321 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX fp32 e int8 (q8) |
| Idiomas soportados | chino (zh), japones (ja), coreano (ko), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (fp32 e int8) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, concretamente un ajuste fino de jhu-clsp/mmBERT-small, adaptado a la tarea de token-classification con etiquetado BIO sobre 20 tipos de entidad. Al ser un encoder bidireccional, esta optimizado para extraccion de entidades y no para generacion de texto. El tokenizador esta disenado para segmentar con granularidad el chino, lo que habilita la distincion entre SURNAME y GIVENNAME en nombres chinos.

El entrenamiento utiliza el conjunto ai4privacy/pii-masking-openpii-1.5m, de licencia CC-BY-4.0, complementado con datos sinteticos generados de forma reproducible mediante el script gen_zh_realistic.py. Ese generador produce identificadores con formato real de China continental: numeros de identidad de 18 digitos con checksum valido, moviles que empiezan por 1[3-9], telefonos fijos, tarjetas UnionPay con validacion Luhn, codigos de credito social unificado (统一社会信用代码), direcciones con estructura provincia/ciudad/distrito/calle/numero y numeros de pasaporte. La evaluacion sobre plantillas de frase reservadas (held-out) busca medir la generalizacion a formatos reales en lugar de a los formatos extranjeros presentes en los corpus multilingues publicos. No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Deteccion y etiquetado de 20 tipos de entidad de informacion personal: GIVENNAME, SURNAME, TITLE, DATE, TIME, AGE, SEX, GENDER, EMAIL, TELEPHONENUM, CITY, STREET, BUILDINGNUM, ZIPCODE, IDCARDNUM, PASSPORTNUM, DRIVERLICENSENUM, TAXNUM, SOCIALNUM y CREDITCARDNUMBER.
- Etiquetado BIO a nivel de token con agregacion a entidades (aggregation_strategy="simple").
- Procesamiento multilingue en chino, japones, coreano e ingles, con especial atencion a formatos de identificadores de China continental.
- Enmascarado y redaccion de PII mediante umbral de confianza (min_score) para sustituir entidades por marcadores.
- Ejecucion en CPU gracias a su tamano reducido y a las variantes ONNX.
- Inferencia en navegador y Node mediante transformers.js con cuantizacion int8.
- Integracion con Optimum y ONNX Runtime para despliegue optimizado.
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso, al ser un modelo exclusivamente de clasificacion de tokens.

## Casos de uso

- Limpieza de datasets para entrenamiento de modelos: el detector se aplica sobre corpus masivos en chino, japones, coreano e ingles para localizar y eliminar o enmascarar datos personales antes de usar los datos en el entrenamiento de modelos de lenguaje.
- Desensibilizacion de registros de aplicaciones (logs): se integra en el pipeline de logging para redactar telefonos, correos e identificadores antes de que los registros se almacenen o se envien a sistemas de observabilidad, reduciendo el riesgo de exposicion.
- Enmascarado de conversaciones de atencion al cliente: procesa transcripciones multi-turno para sustituir nombres, direcciones y numeros de tarjeta por etiquetas, permitiendo conservar el contenido conversacional sin datos identificables.
- Cumplimiento de la PIPL y normativas de privacidad: sirve como capa de deteccion en flujos de tratamiento de datos para identificar informacion personal en documentos y justificar acciones de minimizacion o anonimizacion.
- Redaccion en el navegador: mediante transformers.js con ONNX int8 (descarga de aproximadamente 230 MB, cacheada), permite que el texto del usuario no abandone la pagina, util en formularios o herramientas de edicion de documentos sensibles.
- Preprocesado de documentos administrativos y financieros: detecta numeros de identidad, tarjetas UnionPay, codigos de credito social unificado y numeros de pasaporte con formatos de China continental para su redaccion en sistemas de gestion documental.
- Filtrado previo en pipelines de moderacion y privacidad: actua como primera etapa que marca fragmentos con PII antes de un analisis posterior mas costoso, aprovechando su bajo coste computacional en CPU.

## Benchmarks y rendimiento

Resultados declarados por el autor (entity F1 con coincidencia exacta de span y etiqueta; redaction recall = proporcion de caracteres de PII enmascarados por cualquier etiqueta). Los valores de F1 no estan verificados de forma independiente.

| Idioma | Conjunto de prueba | Precision | Recall | F1 | Redaction recall | Entidades |
|---|---|---|---|---|---|---|
| Ingles | openpii (sintetico, formatos mixtos) | 93.5 | 95.1 | 94.3 | 99.9 | 7493 |
| Japones | openpii (sintetico, formatos mixtos) | 96.1 | 96.6 | 96.4 | 99.8 | 7704 |
| Coreano | openpii (sintetico, formatos mixtos) | 97.2 | 97.7 | 97.4 | 99.7 | 7160 |
| Chino | openpii (sintetico, formatos mixtos) | 96.2 | 96.9 | 96.5 | 99.8 | 6995 |
| Chino | formatos reales de China continental, plantillas reservadas | 98.1 | 97.6 | 97.8 | 99.6 | 8555 |

Resultados agregados de la model-index:

| Tarea | Conjunto de prueba | Metrica | Valor |
|---|---|---|---|
| Token-classification (PII) | openpii-1.5m validation (zh/ja/ko/en, 4k ejemplos) | entity F1 (exact span) | 0.9614 |
| Token-classification (PII) | realistic Chinese PII (held-out templates) | entity F1 (exact span) | 0.9784 |

Desglose por etiqueta (F1 en openpii / F1 en chino realista):

| Etiqueta | F1 openpii | F1 zh-realistic |
|---|---|---|
| GIVENNAME | 94.4 | 98.3 |
| SURNAME | 93.4 | 98.8 |
| TITLE | 99.1 | no disponible |
| DATE | 99.9 | 80.0 |
| TIME | 97.5 | 90.5 |
| AGE | 97.4 | 100.0 |
| SEX | 93.9 | 100.0 |
| GENDER | 93.7 | no disponible |
| EMAIL | 99.1 | 100.0 |
| TELEPHONENUM | 97.3 | 100.0 |
| CITY | 94.9 | 100.0 |
| STREET | 93.6 | 100.0 |
| BUILDINGNUM | 98.9 | 97.5 |
| ZIPCODE | 99.8 | no disponible |
| IDCARDNUM | 83.3 | 100.0 |
| PASSPORTNUM | 99.0 | 100.0 |
| DRIVERLICENSENUM | 83.3 | no disponible |
| TAXNUM | 98.9 | no disponible |
| SOCIALNUM | 98.8 | 100.0 |
| CREDITCARDNUMBER | 99.0 | 100.0 |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en fp32 ocupa aproximadamente 0,56 GB (140,6 M de parametros); en fp16 alrededor de 0,28 GB; en ONNX int8 aproximadamente 0,14 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente; tarjetas como RTX 3060, RTX 4090, A100 o H100 pueden ejecutarlo con holgura, aunque el modelo esta pensado para CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU sin GPU dedicada.
- Opciones de despliegue: transformers (pipeline de token-classification), Optimum con ONNX Runtime (fp32 o model_quantized.onnx), transformers.js (navegador y Node con dtype q8), y servidores de inferencia compatibles con endpoints de Hugging Face (el tag endpoints_compatible esta presente).
- Latencia y throughput: no se publican cifras concretas en la informacion disponible; el autor indica que es "suficientemente rapido para CPU" y que la variante int8 para navegador pesa aproximadamente 230 MB de descarga.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | F1 PII (declarado) | Licencia | Formato |
|---|---|---|---|---|---|---|
| CheezOne/pii-detector-zh-ja-ko-en | 140,6 M | zh, ja, ko, en | no disponible | 96,1 (openpii) / 97,8 (zh realista) | Apache-2.0 | safetensors, ONNX |
| Modelos PII chinos existentes citados por el autor | 278-600 M | zh (principalmente) | no disponible | no disponible | no disponible | no disponible |
| Detectores PII abiertos orientados a ingles/europeo | no disponible | en y lenguas europeas | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a lo indicado en la model card; no se dispone de nombres, parametros ni resultados de benchmarks de los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no estan verificados de forma independiente (verified: false en la model-index).
- El rendimiento en DATE cae a 80,0 de F1 en el conjunto chino realista frente a 99,9 en openpii, lo que indica sensibilidad al formato de fecha.
- IDCARDNUM y DRIVERLICENSENUM obtienen F1 de 83,3 en openpii, los valores mas bajos del desglose; conviene revisar estos casos en produccion.
- El modelo esta entrenado exclusivamente con datos sinteticos y de licencia CC-BY-4.0; puede no generalizar a variedades dialectales, jerga, errores ortograficos o formatos de identificadores de paises distintos de China continental.
- No se documenta la longitud de contexto soportada, lo que dificulta planificar el procesamiento de documentos largos; sera necesario trocear el texto.
- Riesgo de alucinacion no aplicable en sentido generativo, pero si de falsos positivos y falsos negativos en la deteccion; se recomienda umbral de confianza (min_score) y una expresion regular de respaldo para correos, como hace la demo.
- transformers.js devuelve etiquetas por token sin offsets de caracteres; para spans y redaccion hay que implementar la alineacion token-caracter (la demo incluye pii.js de unas 70 lineas).
- La licencia Apache-2.0 permite uso comercial, pero el cumplimiento normativo (PIPL, RGPD) requiere validacion adicional del proceso de anonimizacion; el modelo es una herramienta, no una garantia legal.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CheezOne/pii-detector-zh-ja-ko-en
- Demo en vivo (Space): https://huggingface.co/spaces/CheezOne/pii-detector-demo
- Script de generacion de PII china realista: scripts/gen_zh_realistic.py (incluido en el repositorio del modelo)
- Utilidad de redaccion para transformers.js: https://huggingface.co/spaces/CheezOne/pii-detector-demo/blob/main/pii.js
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Dataset de entrenamiento: https://huggingface.co/datasets/ai4privacy/pii-masking-openpii-1.5m
