# CheezOne/pii-detector-chinese-japanese-korean-english

## Resumen

El modelo `pii-detector-chinese-japanese-korean-english` es un detector de información personal identificable (PII) desarrollado por CheezOne, orientado específicamente a textos en chino, japonés, coreano e inglés. Se trata de un modelo de clasificación de tokens basado en la arquitectura ModernBERT (concretamente, un ajuste fino de `jhu-clsp/mmBERT-small`), con aproximadamente 140 millones de parámetros, que etiqueta 20 tipos de entidades personales mediante esquema BIO. Su relevancia radica en cubrir un hueco poco atendido: la mayoría de los modelos abiertos de detección de PII están centrados en inglés y lenguas europeas, mientras que las alternativas para chino suelen superar los 278-600 millones de parámetros.

La propuesta del autor combina un tamaño reducido (apto para CPU) con un tokenizador que segmenta el chino de forma fina, lo que permite separar correctamente apellidos y nombres propios (por ejemplo, `张伟` se descompone en `张` como SURNAME y `伟` como GIVENNAME). Además, incorpora un generador reproducible de PII con formatos reales de China continental (DNI de 18 dígitos con checksum válido, móviles `1[3-9]`, tarjetas UnionPay con validación Luhn, direcciones con estructura 省/市/区/路/号, etc.), lo que mejora el rendimiento en datos auténticos frente a los conjuntos sintéticos multilingües de estilo extranjero.

El modelo se distribuye bajo licencia Apache-2.0, con pesos en safetensors y versiones ONNX (fp32 e int8) que permiten su ejecución en navegador mediante transformers.js. Está pensado para tareas de desidentificación, limpieza de datos de entrenamiento, anonimización de logs y cumplimiento normativo (como la PIPL china), y declara un F1 de entidad de 0,9614 en el conjunto de validación de openpii-1.5m y de 0,9784 en plantillas chinas realistas retenidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer, base `jhu-clsp/mmBERT-small`) |
| Parametros totales | 140.657.321 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX fp32 y ONNX int8 (q8); safetensors en precisión original |
| Idiomas soportados | chino (zh), japonés (ja), coreano (ko), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (fp32 e int8) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo ModernBERT, inicializado desde `jhu-clsp/mmBERT-small` y ajustado para clasificación de tokens con etiquetado BIO sobre 20 tipos de entidad. La arquitectura ModernBERT incorpora atención con rotación posicional y capas optimizadas para secuencias largas, lo que permite un procesamiento eficiente en CPU. El tokenizador está adaptado para segmentar el chino a nivel de carácter en nombres propios, lo que facilita la distinción entre apellido y nombre de pila.

El entrenamiento se realizó exclusivamente sobre datos sintéticos: el conjunto `ai4privacy/pii-masking-openpii-1.5m` (licencia CC-BY-4.0) y datos generados por el propio autor mediante un script reproducible (`scripts/gen_zh_realistic.py`) que produce identificadores con formatos reales de China continental y checksums válidos (DNI de 18 dígitos, móviles `1[3-9]`, tarjetas UnionPay con Luhn, códigos de crédito social unificado, direcciones estructuradas y números de pasaporte). No se emplearon datos personales reales. No se detalla en la información disponible si hubo fases de RLHF, DPO u otras técnicas de alineación, ni el número exacto de tokens de entrenamiento.

## Capacidades

- Detección y etiquetado de 20 tipos de entidad PII: GIVENNAME, SURNAME, TITLE, DATE, TIME, AGE, SEX, GENDER, EMAIL, TELEPHONENUM, CITY, STREET, BUILDINGNUM, ZIPCODE, IDCARDNUM, PASSPORTNUM, DRIVERLICENSENUM, TAXNUM, SOCIALNUM y CREDITCARDNUMBER.
- Clasificación de tokens con esquema BIO y agregación de entidades mediante `aggregation_strategy="simple"`.
- Soporte multilingüe nativo para chino, japonés, coreano e inglés en un único modelo.
- Función de redacción/anonymización mediante sustitución de entidades por etiquetas (`[EMAIL]`, `[CREDITCARDNUMBER]`, etc.).
- Ejecución en CPU gracias a su tamaño reducido (~140 M de parámetros).
- Inferencia en navegador y Node.js mediante transformers.js con ONNX int8 (~230 MB de descarga).
- Integración con Optimum y ONNX Runtime para despliegue optimizado.
- Backstop de expresiones regulares para correos electrónicos en la utilidad `pii.js` del Space de demostración.
- No se menciona soporte de tool calling, agentes, visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Desidentificación de logs de aplicaciones: el modelo puede procesar líneas de log en tiempo de ejecución (o en un pipeline por lotes) para enmascarar nombres, teléfonos, correos y documentos de identidad antes de almacenarlos o enviarlos a un sistema de observabilidad, gracias a su bajo coste computacional en CPU.
- Limpieza de datos de entrenamiento para LLM: permite filtrar y anonimizar grandes corpus en chino, japonés, coreano e inglés antes de usarlos en ajuste fino, reduciendo el riesgo de memorización de datos personales y facilitando el cumplimiento de la PIPL y el RGPD.
- Cumplimiento normativo en atención al cliente: en conversaciones multi-turno con clientes de la región CJK, el modelo puede redactar números de tarjeta, DNI y direcciones antes de que las transcripciones se almacenen o se analicen, apoyándose en su cobertura de formatos reales de China continental.
- Anonimización en el navegador: mediante transformers.js y el ONNX int8, se puede desidentificar texto directamente en el cliente sin que los datos abandonen la página, lo que resulta adecuado para formularios web, chats o herramientas internas con requisitos estrictos de privacidad.
- Procesamiento de documentos financieros y administrativos: detección de números de tarjeta UnionPay (con validación Luhn), códigos de crédito social unificado y números de pasaporte en extractos, facturas o expedientes, para su enmascaramiento previo a archivo o revisión humana.
- Moderación y auditoría de contenido generado: integración en pipelines de revisión para detectar si una salida de modelo o un texto de usuario contiene PII que deba eliminarse antes de publicarse o compartirse.
- Enriquecimiento de sistemas DLP (data loss prevention): uso como clasificador ligero en pasarelas de correo o mensajería para marcar mensajes salientes con PII y aplicar políticas de bloqueo o cuarentena.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Idioma | Conjunto de prueba | Precision | Recall | F1 | Redaction recall | Entidades |
|---|---|---|---|---|---|---|
| Inglés | openpii (sintético, formatos mixtos) | 93,5 | 95,1 | 94,3 | 99,9 | 7493 |
| Japonés | openpii (sintético, formatos mixtos) | 96,1 | 96,6 | 96,4 | 99,8 | 7704 |
| Coreano | openpii (sintético, formatos mixtos) | 97,2 | 97,7 | 97,4 | 99,7 | 7160 |
| Chino | openpii (sintético, formatos mixtos) | 96,2 | 96,9 | 96,5 | 99,8 | 6995 |

Resultados agregados declarados en el model-index:

| Tarea | Conjunto de datos | Métrica | Valor |
|---|---|---|---|
| PII detection (token-classification) | openpii-1.5m validation (zh/ja/ko/en, 4k ejemplos) | entity F1 (exact span) | 0,9614 |
| PII detection (token-classification) | realistic Chinese PII (plantillas retenidas, custom) | entity F1 (exact span) | 0,9784 |

F1 por etiqueta declarado por el autor (openpii / chino realista):

| Etiqueta | F1 openpii | F1 zh-realistic |
|---|---|---|
| GIVENNAME | 94,4 | 98,3 |
| SURNAME | 93,4 | 98,8 |
| TITLE | 99,1 | – |
| DATE | 99,9 | 80,0 |
| TIME | 97,5 | 90,5 |
| AGE | 97,4 | 100,0 |
| SEX | 93,9 | 100,0 |
| GENDER | 93,7 | – |
| EMAIL | 99,1 | 100,0 |
| TELEPHONENUM | 97,3 | 100,0 |
| CITY | 94,9 | 100,0 |
| STREET | 93,6 | 100,0 |
| BUILDINGNUM | 98,9 | 97,5 |
| ZIPCODE | 99,8 | – |
| IDCARDNUM | 83,3 | 100,0 |
| PASSPORTNUM | 99,0 | 100,0 |
| DRIVERLICENSENUM | 83,3 | – |
| TAXNUM | 98,9 | – |
| SOCIALNUM | 98,8 | 100,0 |
| CREDITCARDNUMBER | 99,0 | 100,0 |

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 para los ~140 M de parámetros; en torno a 0,15-0,25 GB con ONNX int8.
- GPU recomendadas: no requiere GPU; funciona en CPU. En caso de usar GPU, cualquier tarjeta con al menos 2 GB de VRAM es suficiente (GTX 1650, RTX 3050, T4, etc.).
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU dedicada; el autor lo describe como "fast enough for CPU".
- Opciones de despliegue: `transformers` (pipeline de token-classification), Optimum + ONNX Runtime (`ORTModelForTokenClassification`), transformers.js (navegador y Node.js, dtype q8, ~230 MB de descarga), y cualquier servidor compatible con modelos de token-classification de Hugging Face.
- Latencia y throughput: no se han publicado cifras concretas de latencia o throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Formato | F1 declarado |
|---|---|---|---|---|---|---|
| CheezOne/pii-detector-chinese-japanese-korean-english | ~140 M | zh, ja, ko, en | no disponible | Apache-2.0 | safetensors, ONNX | 0,9614 (openpii), 0,9784 (zh realista) |
| Modelos chinos de PII citados por el autor | 278 M–600 M | zh (principalmente) | no disponible | no disponible | no disponible | no disponible |
| Modelos abiertos de PII en inglés/europeo (genéricos) | no disponible | en y lenguas europeas | no disponible | no disponible | no disponible | no disponible |

El autor no proporciona nombres concretos de modelos comparables ni sus resultados, por lo que la comparativa cuantitativa con alternativas específicas no está disponible. La principal ventaja declarada frente a los modelos chinos existentes es el menor tamaño (~140 M frente a 278-600 M) manteniendo cobertura de formatos reales de China continental.

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el model-index).
- El entrenamiento se basa únicamente en datos sintéticos; el rendimiento en dominios muy alejados de los formatos cubiertos (por ejemplo, PII de otros países asiáticos o variantes dialectales) puede degradarse.
- El F1 en DATE sobre el conjunto chino realista cae a 80,0 y en TIME a 90,5, lo que indica menor fiabilidad en expresiones temporales con formatos variados.
- IDCARDNUM y DRIVERLICENSENUM obtienen F1 de 83,3 en openpii, los valores más bajos entre las entidades evaluadas; conviene revisar manualmente estos casos en producción.
- Riesgo de alucinación de entidades: al ser un modelo discriminativo puede etiquetar como PII fragmentos que no lo son, especialmente en textos ambiguos o con nombres comunes.
- Sesgos potenciales derivados de los datos sintéticos y de los formatos específicos de China continental, Japón y Corea; no se documentan análisis de sesgo por género, etnia o región.
- La longitud máxima de contexto no se especifica en la información disponible; textos muy largos requerirán truncamiento o segmentación en trozos.
- Aunque la licencia Apache-2.0 permite uso comercial, el autor no ofrece garantías sobre la idoneidad para cumplimiento normativo estricto; en despliegues regulados se recomienda validación adicional y revisión humana.
- La integración con transformers.js devuelve etiquetas por token sin offsets de caracteres; para obtener spans y redacción es necesario usar la utilidad `pii.js` del Space de demostración o implementar la alineación token-carácter.
- El modelo no cubre tool calling, agentes ni otras capacidades generativas; su uso está limitado a clasificación de tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CheezOne/pii-detector-chinese-japanese-korean-english
- Demo en vivo (Space): https://huggingface.co/spaces/CheezOne/pii-detector-demo
- Utilidad `pii.js` del demo: https://huggingface.co/spaces/CheezOne/pii-detector-demo/blob/main/pii.js
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/ai4privacy/pii-masking-openpii-1.5m
- Script generador de PII china realista: `scripts/gen_zh_realistic.py` (referenciado en la model card, dentro del repositorio del modelo)
