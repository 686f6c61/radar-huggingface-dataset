# seeyouspace0/clean-chat-analyze-judge

## Resumen

`clean-chat-analyze-judge` (etiqueta interna `judge-own-0.1`) es un clasificador de texto en coreano desarrollado por el usuario de Hugging Face `seeyouspace0` para el proyecto Clean Chat, una aplicación de demostración orientada al análisis de toxicidad en el chat de partidas de League of Legends. El modelo recibe el documento completo de un jugador (cabecera con campeones, posiciones y equipos, más todas las líneas que ese jugador escribió en la partida) y emite dos puntuaciones independientes mediante activación sigmoide: `report` (recomendación de reporte) y `complaint` (candidato a denuncia legal).

Técnicamente se trata de un fine-tuning en dos fases sobre `beomi/KcELECTRA-base`, un modelo ELECTRA preentrenado en coreano con licencia MIT. El resultado es un checkpoint de 109.082.882 parámetros (aproximadamente 109 M) en formato safetensors, con una ventana de entrada de 512 tokens y pipeline de `text-classification` multi-etiqueta. El repositorio ocupa 0,4 GB y no registra descargas ni interacciones en el momento de redactar esta ficha.

Su relevancia es acotada pero ilustrativa: muestra un patrón de despliegue de clasificadores ligeros que complementan sistemas de reglas deterministas en moderación de comunidades de videojuegos, y documenta de forma transparente una evaluación con conjunto sellado. Conviene subrayar desde el principio que los datos de entrenamiento y de evaluación son conversaciones sintéticas generadas por IA, y que el propio autor desaconseja el uso del modelo para sancionar o reportar personas de forma automática.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ELECTRA (transformer encoder, discriminador) sobre `beomi/KcELECTRA-base` |
| Parametros totales | 109.082.882 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens de entrada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | no disponible (el modelo base KcELECTRA es MIT) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `beomi/KcELECTRA-base`, un encoder ELECTRA preentrenado en coreano con objetivo de detección de tokens reemplazados. Según la model card, ese checkpoint se entrenó primero como clasificador de frases y después se reajustó para esta tarea específica de análisis de chat de League of Legends. La entrada se construye con la función `build_document(scope="own")` del archivo `judge_model.py` del repositorio: una cabecera con información contextual (campeón, posición y equipo del usuario y del objetivo) seguida de las líneas escritas por el jugador analizado, truncadas a 512 tokens. La salida son dos logits independientes pasados por sigmoide, uno por cada etiqueta (`report` y `complaint`), lo que configura un esquema multi-etiqueta y no mutuamente excluyente.

Los datos de entrenamiento son íntegramente sintéticos: 136 partidas escritas por Claude siguiendo una especificación, de las que se derivan 776 documentos de usuario (659 para entrenamiento y 117 para validación). No se documenta el número de tokens de entrenamiento, la composición detallada del dataset, ni si se aplicaron técnicas de RLHF o DPO; en un clasificador de este tamaño lo habitual sería entrenamiento supervisado con entropía cruzada binaria por etiqueta, pero ese extremo no se explicita en la información disponible. La innovación destacable no está en la arquitectura sino en el enfoque de producto: el modelo se integra en modo híbrido con un motor de reglas, de forma que la recomendación de reporte se activa si lo dispara la regla o el modelo, mientras que el candidato a denuncia se decide solo por reglas.

## Capacidades

- Clasificación multi-etiqueta de texto coreano con dos salidas sigmoides independientes: `report` y `complaint`.
- Análisis agregado de un documento de jugador completo, no de mensajes aislados, hasta 512 tokens.
- Incorporación de contexto estructurado en la entrada (campeón, posición y equipo del usuario y del objetivo).
- Detección de indicios de toxicidad verbal en el contexto de partidas de League of Legends.
- Integración con un sistema de reglas determinista en modo híbrido, documentada en la model card.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento extendido.
- No es un modelo generativo: no produce texto, solo puntuaciones de clasificación.
- Cobertura multilingüe limitada al coreano; no se documenta comportamiento en otros idiomas.

## Casos de uso

- Moderación asistida en comunidades de League of Legends: el modelo puntúa el conjunto del chat de un jugador al final de la partida y ofrece una señal adicional al sistema de reglas para priorizar revisiones humanas, sin ejecutar sanciones automáticas.
- Triaje de reportes en herramientas de soporte: dado un volumen alto de reportes de jugadores, el clasificador puede ordenar los casos por probabilidad de `report` para que los moderadores revisen primero los más probables, reduciendo el tiempo medio de gestión.
- Panel de análisis post-partida en aplicaciones de terceros: el proyecto Clean Chat lo usa en su módulo `analyze` para enriquecer el juicio posterior a la partida con una segunda opinión estadística frente al motor de reglas.
- Investigación sobre toxicidad en videojuegos: sirve como línea base ligera (109 M de parámetros) para comparar enfoques basados en reglas frente a clasificadores neuronales en coreano, con la advertencia de que el corpus de evaluación es sintético.
- Filtrado previo en pipelines de anonimización o revisión de logs de chat: el modelo puede marcar documentos candidatos antes de aplicar procesos más costosos, como revisión humana o modelos generativos de mayor tamaño.
- Prototipado rápido en entornos con recursos limitados: al ser un encoder de 109 M de parámetros y 0,4 GB de pesos, cabe en CPU y en GPU de consumo, lo que permite iterar sobre la integración con reglas sin infraestructura dedicada.
- Evaluación de la calidad de datasets sintéticos: el propio modelo y su conjunto sellado pueden reutilizarse como referencia para medir si nuevas generaciones sintéticas de chat reproducen la distribución de toxicidad esperada.

## Benchmarks y rendimiento

La model card reporta resultados sobre un conjunto sellado de 152 partidas (1.368 usuarios, 157 positivos de reporte y 52 de denuncia), escritas por un autor independiente que no vio las partidas de entrenamiento. Las métricas son precisión y recall por etiqueta:

| Modo | Report: precision / recall | Complaint: precision / recall |
|---|---|---|
| Solo reglas | 83,3% / 95,5% | 100% / 82,7% |
| Reglas + modelo (híbrido, por defecto) | 80,8% / 99,4% | 100% / 82,7% |
| Solo modelo | 91,7% / 98,1% | 97,7% / 80,8% |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible, algo esperable en un clasificador de dominio específico.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 109 M de parámetros; en fp16 o bf16, aproximadamente 0,25-0,5 GB incluyendo overhead de activaciones con secuencias de 512 tokens.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior ofrece holgura. Para lotes grandes, A10G, L4 o A100 reducen el tiempo por documento.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna de consumo e incluso en iGPU con suficiente memoria compartida.
- Despliegue: al ser un modelo de clasificación de Hugging Face Transformers, puede servirse con `transformers` + FastAPI, Text Generation Inference no aplica (no es generativo), y es compatible con ONNX Runtime y con `optimum` para exportación. Para CPU, la exportación a ONNX o la cuantización dinámica reducen la latencia.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Como referencia de orden de magnitud para un encoder de 109 M con 512 tokens, en una GPU moderna se espera un throughput de varios cientos de documentos por segundo con lotes, pero esta cifra no está medida ni publicada por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `seeyouspace0/clean-chat-analyze-judge` | 109 M | 512 tokens | Coreano | Clasificación multi-etiqueta de toxicidad en chat de LoL | no disponible | Hugging Face, 0 descargas |
| `beomi/KcELECTRA-base` | ~110 M | 512 tokens | Coreano | Modelo base ELECTRA (no clasificador de toxicidad) | MIT | Hugging Face, ampliamente usado |
| Clasificadores de toxicidad coreanos basados en KcBERT/KcELECTRA | ~100-130 M | 512 tokens | Coreano | Clasificación binaria o multi-etiqueta de toxicidad | variable según autor | Hugging Face, disponible |

La comparación con alternativas genéricas de moderación en coreano es limitada porque no se dispone de resultados de benchmarks comparables publicados en la información proporcionada. La diferencia principal frente al modelo base es que este checkpoint está especializado en el dominio de League of Legends y en la agregación de un documento completo por jugador, mientras que KcELECTRA-base no incluye cabecera de clasificación entrenada para toxicidad.

## Limitaciones y advertencias

- Los datos de entrenamiento y de evaluación son conversaciones sintéticas generadas por IA; el rendimiento en chat real de personas será previsiblemente inferior al reportado.
- El modelo solo lee las líneas escritas por el jugador analizado, por lo que no puede interpretar a qué responde una interjección o un asentimiento aislado.
- La etiqueta `complaint` no constituye una valoración jurídica: no se ha contrastado con jurisprudencia real y no debe usarse como base para acciones legales.
- El autor indica explícitamente que es un modelo para una demo de dos semanas y que no debe emplearse para sancionar o reportar personas de forma automática.
- Riesgo de sesgo y de falsos positivos en expresiones coloquiales, jerga de juego o ironía que el corpus sintético no reproduzca fielmente.
- La licencia del checkpoint no está declarada en la información disponible; el modelo base KcELECTRA es MIT, pero eso no garantiza automáticamente la licencia de los pesos derivados. Verificar antes de cualquier uso comercial.
- Cobertura exclusivamente en coreano; no se documenta comportamiento en otros idiomas ni en code-switching.
- Ventana de 512 tokens: los chats de partidas largas pueden truncarse y perder contexto relevante.
- Sin descargas ni validación externa en el momento de redactar esta ficha, lo que limita la evidencia independiente sobre su robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seeyouspace0/clean-chat-analyze-judge
- Modelo base KcELECTRA: https://huggingface.co/beomi/KcELECTRA-base
- Repositorio del proyecto Clean Chat: https://github.com/makerspaceSiwoo/clean-chat
