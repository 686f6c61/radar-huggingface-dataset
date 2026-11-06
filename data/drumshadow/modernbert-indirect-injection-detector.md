# drumshadow/modernbert-indirect-injection-detector

## Resumen

`drumshadow/modernbert-indirect-injection-detector` es un clasificador binario de texto especializado en detectar inyecciones de prompt indirectas (indirect prompt injection) en contenido no confiable que lee un agente LLM: salidas de herramientas, páginas web, correos electrónicos, documentos, ficheros y respuestas JSON de API. Lo desarrolla el usuario de Hugging Face `drumshadow` como fine-tuning de `answerdotai/ModernBERT-base`, un transformer encoder de 149,6 millones de parámetros con licencia Apache-2.0.

El modelo responde a una pregunta concreta: ¿contiene este contenido instrucciones inyectadas dirigidas al agente? No es un detector de jailbreaks en turnos de usuario, ni un filtro de seguridad de contenido, ni un sustituto de defensas arquitectónicas. Está pensado para pasarelas de agentes (agent gateways) que puntúan cada resultado de herramienta antes de que el agente lo procese, y en la propia pasarela del autor se ejecuta en modo sombra (shadow mode) junto a una política de seguimiento de contaminación (taint tracking) que nunca relaja sus restricciones basándose en la salida del modelo.

Su relevancia actual radica en que la inyección indirecta es una de las superficies de ataque más difíciles de mitigar en sistemas agénticos: el atacante no habla con el modelo, sino que envenena un documento que el agente acabará leyendo. El modelo ofrece una señal de clasificación por documento con latencia medible (mediana de 60 ms en GPU, 553 ms en CPU para documentos de 2,3k caracteres) y soporte para ocho idiomas (en, de, fr, es, it, pt, ja, zh).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base, fine-tuning) |
| Parametros totales | 149.606.402 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventanas de 512 tokens con solapamiento de 128 tokens; puntuación por documento mediante máximo sobre ventanas |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, de, fr, es, it, pt, ja, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de ModernBERT-base, un encoder transformer con atención de longitud de contexto extendida y optimizaciones de eficiencia propias de la familia ModernBERT. Sobre esa base se realiza un fine-tuning de clasificación binaria (etiqueta 1 = inyección, etiqueta 0 = contenido legítimo). El pipeline de inferencia divide la entrada en ventanas de 512 tokens con 128 tokens de solapamiento, obtiene P(inyección) por ventana y toma el máximo como puntuación del documento. El repositorio incluye `threshold.json` con dos umbrales: `t_f1`, elegido sobre el conjunto de validación para maximizar F1, y `t_r95`, el umbral más alto que mantiene un recall del 95 % en validación.

Los datos de entrenamiento combinan fuentes de ataque y fuentes legítimas con licencias que, según sus publicadores, permiten uso comercial y obras derivadas. Entre los positivos figuran LLMail-Inject fase 1 (MIT), InjecAgent (MIT), Gandalf «ignore instructions» (MIT), cadenas de inyección multilingües (Apache-2.0), cadenas de ataque BIPIA envueltas en plantillas dirigidas al agente (MIT), una taxonomía de 18 familias de ataque compuesta sobre portadores reales con 12 encuadres y 11 ofuscaciones programáticas, además de documentos inyectados y traducciones generados con Qwen3.6. Los negativos y negativos duros incluyen páginas de FineWeb-Edu (ODC-BY), Wikipedia en ocho idiomas (CC-BY-SA), instrucciones Dolly (CC-BY-SA), transcripciones OASST1 (Apache-2.0), READMEs, código y mensajes de commit con licencias permisivas, correos benignos de LLMail y documentos generados que imitan el formato de los ataques (correos de TI, guías, análisis de seguridad que citan inyecciones).

La regla de etiquetado es explícita: se asigna 1 si y solo si el contenido contiene texto que intenta que el agente procesador actúe o responda de un modo que no corresponde a la función legítima del contenido (instrucciones dirigidas al modelo, turnos falsos de sistema o usuario, instrucciones codificadas con una señal de decodificar y seguir). Las instrucciones dirigidas al lector humano son 0, y las cadenas de inyección citadas como ejemplo en un análisis son 0 salvo que algo indique al agente que las siga. La única auditoría de etiquetas realizada hasta la fecha es una primera pasada hecha por un modelo (claude-opus-5.5), no por humanos y no independiente del autor del pipeline: sobre 110 positivos de entrenamiento muestreados, el 91,8 % concuerda con la regla, el 7,3 % es ambiguo y el 0,9 % es incorrecto. Un barrido con expresiones regulares sobre los 50.000 negativos de entrenamiento buscando frases de anulación comunes encontró 3 coincidencias, todas benignas.

## Capacidades

- Clasificación binaria de inyección de prompt indirecta sobre contenido no confiable (salidas de herramientas, web, correo, documentos, ficheros, JSON de API).
- Puntuación por documento mediante ventanas de 512 tokens con solapamiento de 128 y agregación por máximo, apta para documentos largos.
- Umbrales calibrados incluidos en el repositorio (`t_f1` y `t_r95`) para ajustar el compromiso entre precisión y recall.
- Soporte multilingüe de clasificación en ocho idiomas: inglés, alemán, francés, español, italiano, portugués, japonés y chino.
- Integración con la librería `transformers` mediante `pipeline("text-classification")` y compatibilidad con Text Embeddings Inference y endpoints.
- Detección de instrucciones dirigidas al modelo, turnos falsos de sistema o usuario, e instrucciones codificadas con señal de decodificación.
- No soporta tool calling, razonamiento multi-paso, generación de texto, visión ni audio: es exclusivamente un clasificador.

## Casos de uso

- Pasarela de agentes con puntuación por resultado de herramienta: cada salida de herramienta se puntúa antes de que el agente la vea; las puntuaciones altas se registran, anotan o enrutan a una política más estricta. La latencia medida (mediana de 60 ms en GPU, 553 ms en CPU para 2,3k caracteres) permite hacerlo en línea.
- Moderación de contenido web recuperado en pipelines RAG: antes de insertar una página en el contexto del modelo, se calcula P(inyección) y se descarta o marca el fragmento, reduciendo el riesgo de que un documento envenenado secuestre la respuesta.
- Filtrado de correo electrónico en asistentes de bandeja de entrada: el modelo está entrenado específicamente con correos de LLMail-Inject y benignos, por lo que puede señalar mensajes que contienen peticiones dirigidas al agente y no al destinatario humano.
- Revisión de respuestas JSON de API de terceros: en integraciones con servicios externos, se puntúa el cuerpo de la respuesta antes de pasarlo al agente, detectando instrucciones inyectadas en campos de texto libre.
- Análisis de seguridad y forense: uso como señal de triaje para clasificar grandes volúmenes de documentos sospechosos y priorizar la revisión humana, con el umbral `t_r95` cuando prime el recall.
- Investigación comparativa sobre políticas de contaminación: el autor lo propone para comparar contra políticas de «contaminar todo» (taint-everything) en benchmarks de agentes, por ejemplo evaluando si «contaminar solo el contenido marcado» mantiene la seguridad.
- Modo sombra en producción: desplegarlo junto a defensas existentes para registrar y anotar sin bloquear, acumulando datos para calibrar umbrales antes de cualquier automatización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe la metodología de evaluación (splits agrupados por documento anfitrión, familia de ataque, objetivo, encuadre y clúster de near-duplicados de payload; test in-distribution con familias, objetivos, encuadres y payloads no vistos; conjuntos OOD `ood_agentdojo`, `ood_llmail_p2` y `eval_notinject`), pero no incluye cifras de precisión, recall, F1 ni AUC en el material proporcionado. Tampoco se aportan métricas de latencia más allá de las citadas (mediana de 60 ms y p95 de 271 ms en GPU; mediana de 553 ms y p95 de 2,36 s en CPU, sobre DGX Spark, batch 1, documentos de 2,3k caracteres de media).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 149,6 millones de parámetros y pesos safetensors, el repo ocupa 0,6 GB, por lo que en fp32 rondaría 0,6 GB y en fp16 aproximadamente 0,3 GB, más overhead de activaciones y del pipeline.
- GPU recomendadas: el autor reporta mediciones en DGX Spark; por tamaño, el modelo cabe holgadamente en cualquier GPU con al menos 2 GB de VRAM, incluidas RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer actuales.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, Text Embeddings Inference (tag `text-embeddings-inference` en el repo) y endpoints compatibles. Para documentos de más de 512 tokens es necesario usar el scorer con ventanas y máximo sobre fragmentos (`predict.py` en el repositorio fuente), ya que el pipeline estándar evalúa una sola ventana.
- Latencia y throughput: mediana de 60 ms y p95 de 271 ms en GPU; mediana de 553 ms y p95 de 2,36 s en CPU, para documentos de 2,3k caracteres de media con batch 1.

## Comparativa con modelos similares

No se han proporcionado datos de benchmarks ni especificaciones de modelos alternativos en la información disponible, por lo que no es posible establecer una comparativa cuantitativa rigurosa. Como referencia cualitativa, el propio autor menciona en la model card los conjuntos `ood_agentdojo` (AgentDojo) y `ood_llmail_p2` (LLMail-Inject fase 2) como marcos de evaluación, y cita la fila `eval_deepset` para medir la transferencia a detección de jailbreaks en turnos de usuario, lo que sugiere que existen detectores comparables en ese dominio, pero sin cifras publicadas en el material disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| modernbert-indirect-injection-detector | 149,6 M | Ventanas de 512 tokens | Apache-2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un detector de jailbreaks en turnos de usuario; su ámbito es el contenido no confiable que lee el agente. El propio autor remite a la fila `eval_deepset` para ver cómo transfiere a ese caso.
- No es un filtro de seguridad de contenido ni cubre modalidades no textuales.
- No debe usarse para decidir por sí solo que un contenido es seguro de ejecutar; el autor lo ejecuta en modo sombra junto a una política de taint tracking que nunca relaja sus restricciones en producción.
- La única auditoría de etiquetas es una primera pasada realizada por un modelo (claude-opus-5.5), no por humanos y no independiente del autor; el 7,3 % de los positivos muestreados resultó ambiguo y el 0,9 % incorrecto.
- El barrido de negativos solo demuestra la ausencia de ciertos patrones de anulación, no que los negativos estén limpios.
- Las ofuscaciones programáticas se comparten entre splits y se reportan por slice, por lo que las métricas in-distribution no constituyen una afirmación sobre técnicas no vistas.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un clasificador, el riesgo principal es de falsos positivos y falsos negativos, no de generación.
- Licencia Apache-2.0 declarada, pero el autor advierte de que las licencias a nivel de dataset no resuelven todos los derechos del contenido subyacente (por ejemplo, páginas de Common Crawl) y que el estatus legal de pesos entrenados con texto CC-BY-SA no está resuelto; la release asume que puede licenciarse como Apache-2.0 y acredita esas fuentes.
- El modelo tiene 17 descargas y 0 likes en el momento de la ficha, lo que indica una validación comunitaria muy limitada.
- Para documentos de más de 512 tokens, usar el pipeline estándar produce una puntuación de una sola ventana que no se corresponde con la metodología de las métricas reportadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/drumshadow/modernbert-indirect-injection-detector
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Dataset LLMail-Inject: https://huggingface.co/datasets/microsoft/llmail-inject-challenge
- Dataset Gandalf ignore instructions: https://huggingface.co/datasets/Lakera/gandalf_ignore_instructions
- Dataset prompt_injections: https://huggingface.co/datasets/yanismiraoui/prompt_injections
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset Dolly: https://huggingface.co/datasets/databricks/databricks-dolly-15k
- Dataset OASST1: https://huggingface.co/datasets/OpenAssistant/oasst1
- Dataset GitHub code clean: https://huggingface.co/datasets/codeparrot/github-code-clean
- Dataset CommitPackFT: https://huggingface.co/datasets/bigcode/commitpackft
