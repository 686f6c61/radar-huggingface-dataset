# CheezOne/pii-detector-chinese-japanese-korean-english-small

## Resumen

El PII detector para chino, japonés, coreano e inglés (small) es un modelo de clasificación de tokens desarrollado por CheezOne que identifica y etiqueta datos personales en texto multilingüe. Detecta 20 tipos de entidades, entre ellas nombres, teléfonos, números de identificación nacional (身份证), tarjetas bancarias, correos electrónicos, direcciones y fechas. Está construido sobre `jhu-clsp/mmBERT-small` y cuenta con aproximadamente 140,6 millones de parámetros, lo que lo sitúa como una alternativa ligera frente a los modelos PII chinos existentes, que suelen oscilar entre 278 y 600 millones de parámetros.

Su relevancia actual radica en el enfoque específico para lenguajes CJK (chino, japonés y coreano): utiliza un tokenizador que segmenta el chino de forma fina, permitiendo separar apellidos y nombres propios, y añade un generador reproducible de PII con formatos reales de China continental (identificadores de 18 dígitos con checksum válido, móviles `1[3-9]`, tarjetas UnionPay con validación Luhn, direcciones con estructura provincia/ciudad/distrito). El modelo se distribuye con licencia Apache-2.0, incluye pesos en safetensors y exportaciones ONNX (fp32 e int8) para Optimum, ONNX Runtime y transformers.js, y puede ejecutarse en CPU.

Está pensado para tareas de limpieza de datos de entrenamiento, desidentificación de logs, anonimización de conversaciones de atención al cliente y cumplimiento de normativas como la PIPL china. El autor advierte explícitamente de que las métricas de la model card proceden de conjuntos de test generados con las mismas plantillas que los datos de entrenamiento, por lo que deben interpretarse como optimistas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base `jhu-clsp/mmBERT-small`) |
| Parametros totales | 140.657.321 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | ONNX fp32 y ONNX int8 (q8); pesos safetensors en precisión completa |
| Idiomas soportados | Chino (zh), japonés (ja), coreano (ko), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (fp32 e int8) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo ModernBERT, inicializado desde `jhu-clsp/mmBERT-small`, adaptado a clasificación de tokens con etiquetado BIO para 20 tipos de entidades PII. La arquitectura ModernBERT incorpora atención con rotación posicional y capas optimizadas para eficiencia en CPU, lo que explica que el autor lo describa como apto para inferencia sin GPU.

El entrenamiento combina dos fuentes: el dataset público `ai4privacy/pii-masking-openpii-1.5m` (CC-BY-4.0) y un dataset sintético propio, `CheezOne/pii-synthetic-chinese-japanese-korean-english`, generado con un script reproducible (`scripts/gen_zh_realistic.py`) que produce identificadores con formato real de China continental y checksums válidos. Según la model card, no se utilizaron datos personales reales. No se especifica en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente a token classification). La innovación destacable es el enfoque CJK-first con tokenización fina del chino y la evaluación sobre plantillas retenidas para medir generalización.

## Capacidades

- Detección y etiquetado de 20 tipos de entidades PII: `SURNAME`, `GIVENNAME`, `TITLE`, `DATE`, `TIME`, `CITY`, `STREET`, `BUILDINGNUM`, `ZIPCODE`, `TELEPHONENUM`, `EMAIL`, `IDCARDNUM`, `CREDITCARDNUMBER`, `SOCIALNUM`, `PASSPORTNUM`, `DRIVERLICENSENUM`, `TAXNUM`, `AGE`, `SEX`, entre otras.
- Clasificación de tokens con etiquetas BIO y offsets de carácter mediante `aggregation_strategy="simple"` en el pipeline de transformers.
- Soporte multilingüe para chino, japonés, coreano e inglés en un único modelo.
- Segmentación fina del chino que permite separar apellido y nombre propio (`张伟` → `张` + `伟`).
- Exportación ONNX para Optimum y ONNX Runtime, y ejecución en navegador o Node mediante transformers.js con cuantización int8.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo de clasificación de tokens, no generativo.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Limpieza de datasets de entrenamiento para LLM: el modelo puede pasarse sobre corpus multilingües para localizar y enmascarar nombres, teléfonos e identificadores antes de usar los datos en entrenamiento, reduciendo el riesgo de memorización de PII.
- Desidentificación de logs de aplicación: integrado como paso previo al almacenamiento, permite sustituir entidades por etiquetas (`[TELEPHONENUM]`, `[EMAIL]`) en logs de producción con texto de usuarios en chino, japonés, coreano o inglés.
- Anonimización de conversaciones de atención al cliente: adecuado para transcripts de soporte donde aparecen nombres, direcciones y números de tarjeta; su tamaño reducido permite procesar grandes volúmenes en CPU.
- Cumplimiento de la PIPL y normativas de privacidad: útil en pipelines de redacción previos a la exportación o compartición de documentos que contienen identificadores chinos con formato real (身份证 de 18 dígitos, móviles, direcciones estructuradas).
- Redacción en el navegador con transformers.js: al ejecutarse en cliente con ONNX int8 (~230 MB), permite que el texto no abandone la página, útil en formularios o herramientas internas de tratamiento de documentos sensibles.
- Preprocesado para sistemas de moderación o auditoría: detección de PII en tickets, correos y formularios antes de enviarlos a modelos generativos externos, evitando fugas de datos a APIs de terceros.
- Enmascarado en pipelines de CI/CD de datos: como paso de validación en tareas ETL que verifican que los datasets publicados no contienen información personal identificable.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| PII detection | openpii-1.5m validation (zh/ja/ko/en, 4k ejemplos) | Entity F1 (exact span) | 0,9614 |
| PII detection | Chinese PII realista (plantillas retenidas) | Entity F1 (exact span) | 0,9784 |

El autor advierte de que estas cifras proceden de conjuntos construidos con las mismas plantillas que los datos de entrenamiento y son optimistas. Sobre 703 documentos redactados por un LLM en estilos distintos (invitaciones, chats, formularios, tickets), con PII insertada programáticamente, el rendimiento cae a un recall exacto del 58,4 % y una precisión del 62,4 %. Desglose por entidad en ese conjunto realista:

| Entidad | n | Recall exacto % | Precisión exacta % |
|---|---|---|---|
| `SURNAME` | 575 | 64,3 | 83,0 |
| `GIVENNAME` | 526 | 62,9 | 57,8 |
| `TITLE` | 465 | 9,0 | 51,9 |
| `DATE` | 251 | 63,7 | 68,1 |
| `CITY` | 183 | 63,4 | 52,5 |
| `BUILDINGNUM` | 165 | 55,2 | 38,4 |
| `STREET` | 162 | 73,5 | 58,9 |
| `TELEPHONENUM` | 157 | 95,5 | 80,2 |
| `EMAIL` | 130 | 91,5 | 89,5 |
| `ZIPCODE` | 93 | 81,7 | 69,7 |
| `TIME` | 73 | 68,5 | 63,3 |
| `IDCARDNUM` | 47 | 46,8 | 95,7 |
| `SEX` | 38 | 42,1 | 80,0 |
| `CREDITCARDNUMBER` | 37 | 75,7 | 58,3 |
| `SOCIALNUM` | 29 | 65,5 | 33,9 |
| `PASSPORTNUM` | 28 | 71,4 | 58,8 |
| `AGE` | 27 | 96,3 | 44,1 |
| `DRIVERLICENSENUM` | 24 | 50,0 | 22,6 |
| `TAXNUM` | 20 | 10,0 | 6,7 |

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de ~140 M de parámetros, la inferencia en fp32 requiere aproximadamente 0,6 GB de pesos; en int8, alrededor de 0,15 GB. Con activaciones y overhead de runtime, cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 o H100 no aportan ventaja significativa frente a CPU para lotes pequeños.
- Cabe en GPU consumer: sí, en cualquier GPU moderna e incluso en iGPU. El autor lo describe como apto para CPU.
- Opciones de despliegue: pipeline de transformers, Optimum + ONNX Runtime (fp32 o int8), transformers.js en navegador o Node (int8, ~230 MB de descarga), y servidores de inferencia compatibles con endpoints (`endpoints_compatible` en los tags).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| CheezOne/pii-detector-chinese-japanese-korean-english-small | ~140 M | No disponible | zh, ja, ko, en | Apache-2.0 | Enfoque CJK-first, ONNX para navegador |
| Modelos PII chinos existentes (sin nombre concreto en la información) | 278–600 M | No disponible | Principalmente zh | No disponible | Según el autor, de mayor tamaño |
| Modelos PII multilingües abiertos (sin nombre concreto en la información) | No disponible | No disponible | Predominantemente inglés/europeo | No disponible | Según el autor, usan identificadores de estilo extranjero incluso en chino |

No se dispone en la información proporcionada de nombres, métricas ni licencias de alternativas concretas, por lo que la comparación cuantitativa con modelos específicos no está disponible.

## Limitaciones y advertencias

- Las métricas F1 de la model card (0,9614 y 0,9784) son optimistas: proceden de conjuntos generados con las mismas plantillas que el entrenamiento. En documentos de estilos distintos, el recall exacto baja al 58,4 % y la precisión al 62,4 %.
- Los correos con dominios tipo `example.com` pierden la parte del dominio; otros dominios funcionan correctamente.
- Los apellidos se detectan con frecuencia de forma incompleta cuando el nombre no va seguido de un título.
- Los límites de `TITLE` (por ejemplo, si se etiqueta 先生 o 様) no coinciden con la convención del conjunto de evaluación realista.
- Entidades con bajo rendimiento en el conjunto realista: `TAXNUM` (recall 10,0 %), `TITLE` (recall 9,0 %), `DRIVERLICENSENUM` (recall 50,0 %) y `SOCIALNUM` (precisión 33,9 %).
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos y negativos en la detección de entidades; requiere umbral de confianza (`min_score`) ajustado al dominio.
- Limitación idiomática: solo cubre zh, ja, ko y en; no se ha evaluado en otras lenguas.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre la idoneidad para cumplimiento normativo; la redacción debe validarse con controles adicionales.
- El pipeline de transformers.js devuelve etiquetas por token sin offsets de carácter; para spans y redacción es necesario usar utilidades adicionales como `pii.js` del Space de demostración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CheezOne/pii-detector-chinese-japanese-korean-english-small
- Demo en vivo (Space): https://huggingface.co/spaces/CheezOne/pii-detector-demo
- Utilidad `pii.js` del demo: https://huggingface.co/spaces/CheezOne/pii-detector-demo/blob/main/pii.js
- Dataset sintético: https://huggingface.co/datasets/CheezOne/pii-synthetic-chinese-japanese-korean-english
- Dataset base de entrenamiento: https://huggingface.co/datasets/ai4privacy/pii-masking-openpii-1.5m
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Script generador de PII china realista: `scripts/gen_zh_realistic.py` (incluido en el repositorio del modelo)
