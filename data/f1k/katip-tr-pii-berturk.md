# f1k/katip-tr-pii-berturk

## Resumen

Katip Mask Base · tr v2 es un modelo de clasificación de tokens (token classification) especializado en la detección de datos personales en documentos legales turcos. Lo desarrolla el autor independiente f1k y se construye mediante fine-tuning del modelo base `dbmdz/bert-base-turkish-cased` (BERTurk), un transformer encoder de 110 millones de parámetros. Su función concreta es etiquetar nombres de personas, direcciones y términos de salud contemplados en el artículo 6 de la KVKK (la ley turca de protección de datos personales), para permitir su anonimización o enmascaramiento.

El modelo se distribuye principalmente en formato ONNX (fp32 e int8) para su uso con transformers.js, lo que lo orienta a inferencia en dispositivo (on-device), sin depender de servicios en la nube. Es el componente de detección del proyecto Katip Mask, una herramienta de anonimización para el sector legal turco.

Su relevancia radica en el cumplimiento normativo: automatiza la redacción de datos personales en expedientes judiciales y escritos, un requisito de la KVKK y del RGPD. Según la model card, encabeza el benchmark propio KVKK-Bench v0.1.2 con una puntuación global de 96,1 sobre 100, por delante de alternativas de mayor tamaño como XLM-RoBERTa Large o GLiNER2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT), clasificación de tokens |
| Parametros totales | 110.032.135 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo BERT; la model card no especifica el máximo) |
| Tipos de cuantizacion | fp32 e int8 (exportaciones ONNX) |
| Idiomas soportados | turco (tr) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors, ONNX (transformers.js) |

## Arquitectura y entrenamiento

El modelo parte de BERTurk (`dbmdz/bert-base-turkish-cased`), un encoder BERT de 110 millones de parámetros preentrenado en turco con casing preservado. Sobre esa base se aplica un fine-tuning para token classification (NER) orientado a tres categorías: nombres de persona, direcciones y términos de salud del artículo 6 de la KVKK.

La versión v2 (13 de noviembre de 2026) incorpora 17.967 frases reales en turco procedentes del dataset `turkish-nlp-suite/turkish-wikiNER`, limitadas a nombres de persona, sumadas a los documentos sintéticos de entrenamiento. Según la model card, este cambio corrige la principal debilidad de la v1: mientras que la v1 detectaba todos los nombres en los conjuntos sintéticos de prueba pero solo el 41 % de los nombres en frases reales en turco, la v2 alcanza el 90 %. La exportación a ONNX en fp32 e int8 está pensada para ejecución en navegador o en dispositivo mediante transformers.js. No se detalla en la información disponible el volumen total de tokens de entrenamiento ni si se emplearon técnicas de RLHF o DPO (no aplicables habitualmente a un encoder de clasificación).

## Capacidades

- Detección y etiquetado de nombres de persona (turcos y extranjeros) en texto legal.
- Detección de direcciones.
- Detección de términos de salud contemplados en el artículo 6 de la KVKK.
- Clasificación de tokens (NER) para tareas de anonimización, pseudonimización, enmascaramiento y redacción de datos.
- Ejecución en dispositivo mediante ONNX y transformers.js (fp32 e int8).
- Integración en pipelines de anonimización junto con reglas deterministas (el sistema Katip combina reglas y modelo).
- Cobertura de identificadores en formularios (T.C. kimlik, números fiscales, IBAN, direcciones) según el subconjunto "Forms" del benchmark, aunque la model card atribuye parte de esa cobertura a las reglas de Katip.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes: es un modelo exclusivamente de clasificación.

## Casos de uso

- Anonimización de expedientes judiciales: el modelo etiqueta nombres y direcciones en resoluciones del Yargıtay y escritos procesales para que un paso posterior los sustituya o enmascare, cumpliendo los requisitos de la KVKK antes de publicar o compartir documentos.
- Redacción de datos en despachos de abogados: integrado en herramientas locales (por ejemplo, vía transformers.js en el navegador), permite que un letrado procese escritos con datos de clientes sin enviarlos a un servicio externo.
- Cumplimiento del RGPD en documentación turca: para organizaciones que tratan documentos en turco con datos de residentes en la UE, el modelo sirve como capa de detección previa a la seudonimización.
- Enmascaramiento de datos de salud: detecta términos del artículo 6 de la KVKK (datos sensibles de salud) en informes y expedientes médicos-legales antes de su tratamiento o cesión.
- Preparación de datasets para investigación: permite limpiar corpus legales turcos de datos personales antes de su publicación o uso en entrenamiento de otros modelos.
- Procesamiento por lotes en servidor: exportado a ONNX int8, puede desplegarse en pipelines de preprocesado documental con bajo coste computacional (modelo de 111 MB en fp32) frente a alternativas de más de 1 GB.
- Filtrado en formularios y escritos: combinado con reglas, cubre la detección de identificadores estructurados (T.C. kimlik, IBAN, direcciones) en peticiones y formularios colegiales.

## Benchmarks y rendimiento

Resultados del benchmark propio KVKK-Bench v0.1.2 (puntuaciones sobre 100; "Overall" es F2 ponderada para nombres en texto real; "Forms" cubre identificadores en 306 peticiones y formularios sintéticos y no entra en Overall):

| Sistema | Overall | Nombres turcos (juzgados) | Nombres extranjeros (juzgados) | Texto cotidiano | Forms | Tamano (MB) |
|---|---|---|---|---|---|---|
| Katip Mask Base · tr v2 | 96,1 | 99,9 | 97,6 | 84,9 | 99,4 | 111,1 |
| XLM-RoBERTa Large NER | 95,9 | 97,6 | 97,5 | 89,9 | 41,6 | 2235,4 |
| XLM-RoBERTa Base Turkish NER | 95,7 | 98,5 | 98,2 | 86,3 | – | 1109,8 |
| Katip rules + GLiNER2 · tr | 95,5 | 98,7 | 97,3 | 86,0 | 98,2 | 1228,7 |
| GLiNER2 PII Multi | 95,0 | 98,1 | 98,2 | 83,9 | 43,2 | 1228,4 |
| PII Redactor Base | 94,0 | 97,8 | 99,1 | 79,5 | 63,8 | 1230,3 |
| Katip Mask Mini · tr v2 | 93,0 | 99,1 | 97,2 | 73,6 | 98,6 | 31,4 |
| BERTurk NER | 91,6 | 97,4 | 91,7 | 77,1 | 38,3 | 440,1 |
| GLiNER Multi PII v1 | 91,3 | 93,1 | 92,9 | 85,2 | – | 1155,8 |
| Qwen2.5 1.5B Instruct (zero-shot) | 57,5 | 59,1 | 57,6 | 53,7 | – | 3087 |
| Presidio | 45,0 | 39,3 | 44,0 | 60,4 | 36,1 | 11 |

Evaluación en conjuntos de prueba de otros equipos (F2 sobre mitades reservadas de cuatro conjuntos públicos sintéticos de PII en turco):

| Conjunto | Katip Mask Base | NewMind kvkk-v2 |
|---|---|---|
| nm-kvkk-pii-6K | 95,9 | 93,9 |
| piimask TR | 95,9 | 93,8 |
| Conjunto de Çağrı Güngör | 95,2 | 72,6 |
| Conjunto de Werea | 95,8 | 54,3 |

Según la model card, la ventaja es significativa en nm6k, piimask y Çağrı (bootstrap pareado al 95 %); en documentos de piimask con plantillas no vistas ambos empatan (96,5), y el resultado de Werea no es independiente porque sus mitades comparten plantillas. NewMind mantiene mayor precisión en nm6k (99,7 frente a 91,2) y piimask (93,2 frente a 89,8). Katip deja menos datos personales legibles en Çağrı (6,8 % frente a 41,1 %) y Werea (26,3 % frente a 65,2 %).

## Requisitos de hardware

- Modelo de 110 millones de parámetros: la inferencia es ligera y cabe holgadamente en GPU de consumo.
- VRAM estimada: aproximadamente 0,5 GB en fp32 (111 MB de pesos más activaciones y overhead) y en torno a 0,2-0,3 GB en int8; cifras orientativas, no publicadas en la model card.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son suficientes y sobredimensionadas para este modelo.
- Cabe en GPU de consumo (RTX 20xx en adelante) e incluso en CPU para lotes pequeños.
- Opciones de despliegue: transformers.js (formato previsto por el autor, ONNX fp32 e int8), ONNX Runtime, y pipelines de token classification de Hugging Face con los pesos safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Overall (KVKK-Bench) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Katip Mask Base · tr v2 | 110 M | no disponible | 96,1 | CC BY-SA 4.0 | Hugging Face, ONNX + safetensors |
| XLM-RoBERTa Large NER | ~560 M | no disponible | 95,9 | no disponible en la información | Hugging Face |
| BERTurk NER (savasy) | ~110 M | no disponible | 91,6 | no disponible en la información | Hugging Face |
| GLiNER2 PII Multi | no disponible | no disponible | 95,0 | no disponible en la información | Hugging Face |

Frente a XLM-RoBERTa Large, Katip Mask Base obtiene una puntuación global ligeramente superior con una vigésima parte del tamaño (111 MB frente a 2.235 MB) y una cobertura muy superior en formularios (99,4 frente a 41,6). Frente a BERTurk NER, del mismo tamaño, la mejora es de más de cuatro puntos en Overall y de más de 60 puntos en Forms. La principal desventaja relativa es el rendimiento en texto cotidiano (84,9), donde XLM-RoBERTa Large (89,9) y XLM-RoBERTa Base (86,3) quedan por delante.

## Limitaciones y advertencias

- Modelo monolingüe: solo turco; no debe esperarse buen rendimiento en otros idiomas.
- Rendimiento inferior en texto cotidiano (84,9) que en documentos legales; puede fallar en registros coloquiales o informales.
- La cobertura de identificadores estructurados (Forms) depende en parte de las reglas de Katip, no solo del modelo; no debe atribuirse íntegramente al clasificador.
- El benchmark principal (KVKK-Bench) es propio del autor, lo que exige cautela al interpretar la comparativa; los conjuntos externos son sintéticos y algunos comparten plantillas.
- Riesgo de falsos positivos y negativos inherente a la clasificación de tokens; la model card reporta 3 falsas alarmas en prosa legal sin nombres en su prueba interna.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribución y a compartir las obras derivadas bajo la misma licencia, lo que puede ser restrictivo para productos propietarios.
- No se documentan sesgos específicos ni evaluaciones de robustez ante texto adversario.
- No apto para generación de texto, razonamiento ni tareas fuera de la clasificación de tokens.
- Para producción, conviene validar el modelo sobre el dominio concreto del cliente y combinarlo con reglas deterministas, como hace el propio proyecto Katip.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/f1k/katip-tr-pii-berturk
- Modelo base: https://huggingface.co/dbmdz/bert-base-turkish-cased
- Demo Katip Mask: https://huggingface.co/spaces/f1k/katip-kvkk-anonymization
- Benchmark KVKK-Bench: https://huggingface.co/spaces/f1k/kvkk-bench
- Resultados externos (RESULTS.md): https://github.com/fikrifirat/katip/blob/legal-study/lab/legal/external/RESULTS.md
- Notebook GLiNER2 Katip: https://github.com/fikrifirat/katip/blob/legal-study/lab/colab/gliner2_katip_recipe.ipynb
- Dataset turkish-wikiNER: https://huggingface.co/datasets/turkish-nlp-suite/turkish-wikiNER
- Katip Mask Mini: https://huggingface.co/f1k/katip-mask-mini
- Katip Mask Nano: https://huggingface.co/f1k/katip-mask-nano
