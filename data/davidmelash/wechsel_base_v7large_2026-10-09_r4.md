# davidmelash/wechsel_base_v7large_2026-10-09_r4

## Resumen

wechsel_base_v7large_2026-10-09_r4 es un modelo de clasificación de tokens (token classification) desarrollado por el usuario davidmelash, especializado en la detección de datos personales en sentencias judiciales ucranianas con fines de seudonimización. Se trata de un ajuste fino (fine-tuning) del modelo benjamin/roberta-base-wechsel-ukrainian, un encoder RoBERTa en ucraniano, y está pensado para etiquetar entidades sensibles dentro de documentos legales.

El modelo reconoce cuatro tipos de entidad: ОСОБА (persona), АДРЕСА (dirección), НОМЕР (número) e ІНФОРМАЦІЯ (información). Con 124.061.961 parámetros, es un modelo compacto de tipo base que puede ejecutarse en hardware modesto. Resuelve un problema concreto: automatizar la anonimización de resoluciones del Registro Unificado Estatal de Decisiones Judiciales de Ucrania, sustituyendo los fragmentos anonimizados por valores sintéticos.

Su relevancia actual radica en el cumplimiento de normativas de protección de datos y en la preparación de corpus legales desidentificados para reentrenar otros modelos. Se distribuye con licencia MIT (uso comercial permitido) y en formato safetensors, aunque no cuenta todavía con descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa base (transformer encoder) |
| Parametros totales | 124.061.961 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no especificada en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ucraniano (uk) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura de benjamin/roberta-base-wechsel-ukrainian, un encoder RoBERTa de tipo base adaptado al ucraniano. Sobre esa base se ha realizado un ajuste fino supervisado para token classification, es decir, una tarea de etiquetado secuencial a nivel de token y no de generación de texto. No se documentan detalles sobre el número de tokens de entrenamiento, la composición completa del dataset ni el uso de técnicas como RLHF o DPO, que en cualquier caso no aplicarían a un modelo discriminativo de este tipo.

El entrenamiento se realizó sobre el conjunto sintético denominado v7large. Este dataset se construye a partir de sentencias del Registro Unificado Estatal de Decisiones Judiciales de Ucrania cuyos fragmentos anonimizados se rellenan con valores generados. Las direcciones sintéticas provienen del directorio de Ukrposhta y de OpenStreetMap (© OpenStreetMap contributors, ODbL). El uso de datos sintéticos permite disponer de anotaciones automáticas a gran escala, aunque introduce una posible brecha de dominio respecto a documentos reales.

## Capacidades

- Clasificación de tokens (NER) orientada a la detección de información personal en texto legal ucraniano.
- Reconocimiento de cuatro tipos de entidad: ОСОБА (persona), АДРЕСА (dirección), НОМЕР (número) e ІНФОРМАЦІЯ (información).
- Seudonimización de sentencias judiciales, sustituyendo entidades sensibles por valores alternativos.
- Procesamiento exclusivo de texto en ucraniano.
- No es un modelo generativo: no produce texto, no soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo de razonamiento (thinking mode), ni capacidades de visión, audio o multimodalidad.
- No se documentan capacidades multilingües más allá del ucraniano.

## Casos de uso

- Anonimización de sentencias judiciales: el modelo etiqueta personas, direcciones, números e información sensible en resoluciones del registro ucraniano para generar versiones públicas desidentificadas.
- Cumplimiento de protección de datos: integrarlo en un pipeline que procese documentos legales antes de su publicación, reduciendo el riesgo de exposición de datos personales.
- Preparación de corpus para entrenamiento: desidentificar grandes volúmenes de texto legal antes de usarlos para entrenar o ajustar modelos de lenguaje, evitando filtrar PII.
- Seudonimización en el sector legal privado: despachos y bufetes pueden aplicarlo a expedientes en ucraniano para compartir documentos con terceros sin revelar identidades.
- Investigación académica en PLN jurídico: permite construir datasets de referencia y comparar estrategias de anonimización sobre documentos reales.
- Automatización de flujos de redacción documental: detectar entidades a reemplazar de forma sistemática en plantillas y expedientes masivos.
- Auditoría de privacidad: usar las detecciones del modelo como primera pasada para localizar posibles fugas de datos en repositorios documentales ya publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye métricas de precisión, recall o F1 para los tipos de entidad, y la búsqueda web realizada no ha devuelto enlaces técnicos relevantes (los resultados obtenidos eran páginas de pasatiempos sin relación con el modelo).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32 (tamaño del repositorio) y alrededor de 0,25 GB en FP16. El modelo completo en precisión simple ocupa en torno a 496 MB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM, incluidas tarjetas integradas o de gama baja; también funciona en CPU.
- Cabe sobradamente en GPU de consumo: GTX 1050, RTX 3060, RTX 4090, así como en portátiles y equipos sin GPU dedicada.
- Opciones de despliegue: librería transformers (pipeline de token-classification), exportación a ONNX y despliegue mediante servidores de inferencia compatibles con modelos de la familia RoBERTa. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI (estas herramientas están orientadas sobre todo a modelos generativos).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| davidmelash/wechsel_base_v7large_2026-10-09_r4 | 124.061.961 | No disponible | NER de PII en ucraniano | MIT | Hugging Face |
| benjamin/roberta-base-wechsel-ukrainian | 124M aprox. (modelo base) | No disponible | Modelo base en ucraniano | No disponible | Hugging Face |
| xlm-roberta-base | 278M | 512 | Encoder multilingue (no especifico de NER) | MIT | Hugging Face |

El modelo se apoya directamente en benjamin/roberta-base-wechsel-ukrainian como punto de partida, por lo que comparte arquitectura y tamaño con él, pero añade la cabeza de clasificación de tokens y el ajuste sobre el dataset sintético v7large. Frente a encoders multilingües genéricos como xlm-roberta-base, este modelo está especializado en ucraniano y en la tarea concreta de detección de datos personales, aunque carece de benchmarks publicados que permitan cuantificar la mejora. No se han encontrado en la información disponible otros modelos comparables específicos de anonimización judicial en ucraniano.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; el uso de datos sintéticos generados puede introducir distribuciones distintas de las de documentos reales.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos en la clasificación de entidades.
- Limitaciones de contexto o idioma: el modelo está entrenado únicamente para ucraniano y no se especifica su longitud de contexto.
- Brecha de dominio: al entrenarse con datos sintéticos, puede degradarse frente a documentos con formatos, jerga o tipografías no representadas en el corpus v7large.
- Restricciones de licencia: la licencia es MIT, que permite uso comercial; no obstante, parte de los datos sintéticos derivan de OpenStreetMap bajo ODbL, lo que conviene revisar según el uso previsto.
- Madurez: el repositorio presenta cero descargas y cero valoraciones, por lo que no hay validación por parte de la comunidad ni evidencias externas de calidad.
- Falta de métricas: no se han publicado benchmarks ni métricas de rendimiento, lo que dificulta evaluar su idoneidad en producción sin pruebas propias.
- No es un modelo generativo: no admite instrucciones, agentes ni generación de texto, y debe integrarse como componente de clasificación dentro de un pipeline mayor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidmelash/wechsel_base_v7large_2026-10-09_r4
- Modelo base: https://huggingface.co/benjamin/roberta-base-wechsel-ukrainian
- OpenStreetMap (fuente de las direcciones sintéticas, © OpenStreetMap contributors, ODbL): https://www.openstreetmap.org/
- No se han encontrado otros enlaces relevantes (papers, blogs o repos) en la búsqueda web realizada.
