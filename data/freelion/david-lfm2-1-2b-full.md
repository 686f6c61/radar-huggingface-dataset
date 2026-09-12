# freelion/DAVID-lfm2-1.2b-full

## Resumen

DAVID-lfm2-1.2b-full es un ajuste fino completo en precisión BF16 del modelo base LiquidAI/LFM2-1.2B, publicado por el usuario freelion en HuggingFace. Su propósito no es la generación de texto abierta, sino la detección de patrones oscuros (dark patterns) en conversaciones mantenidas con modelos de lenguaje: dado un transcript de diálogo, el modelo devuelve un objeto JSON con la tarea detectada, la categoría de manipulación identificada y una breve justificación en lenguaje natural.

El modelo se ha entrenado sobre el dataset freelion/darkpatterns_in_llm, compuesto por 27.670 trazas conversacionales etiquetadas y organizadas en seis categorías de DarkBench más una clase de control. Las clases posibles son siete: anthropomorphism, brand-bias, sycophancy, user-retention, harmful-behaviour, sneaking y non-deceptive. El autor reporta un 86,7 % de exactitud por categoría exacta sobre un conjunto de test reservado de 4.151 ejemplos, con un F1 binario de 0,85 para la distinción engañoso/no engañoso.

Se trata de un modelo muy reciente y con adopción prácticamente nula en el momento de redactar esta ficha (0 descargas, 0 likes), de tamaño compacto (1.170.340.608 parámetros, aproximadamente 1,17 mil millones) y licencia MIT, lo que lo hace desplegable en hardware de consumo. Su relevancia radica en la creciente necesidad de auditar y monitorizar el comportamiento de asistentes conversacionales en producción, un ámbito donde los clasificadores especializados y ligeros son más prácticos que los modelos generalistas de gran tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en LiquidAI/LFM2-1.2B (familia LFM2 de Liquid AI); el autor no detalla la arquitectura interna en la model card. No disponible el desglose de capas |
| Parametros totales | 1.170.340.608 (aproximadamente 1,17 B), dato real de safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible; el repositorio se publica en BF16 (full precision). No se incluyen pesos GGUF ni cuantizaciones INT8/INT4 |
| Idiomas soportados | No disponible (la model card no lo especifica; el dataset de entrenamiento parece estar en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2-1.2B, el modelo de 1,2 mil millones de parametros de la familia LFM2 de Liquid AI, disenada para inferencia eficiente en dispositivos. Sobre esa base, freelion ha realizado un ajuste fino completo (full fine-tune) en precision BF16, sin recurrir a adaptadores tipo LoRA, con el objetivo de especializarlo en una tarea de clasificacion conversacional con salida estructurada.

El entrenamiento utiliza el dataset freelion/darkpatterns_in_llm, formado por 27.670 trazas conversacionales etiquetadas y distribuidas en seis categorias de DarkBench (anthropomorphism, brand-bias, sycophancy, user-retention, harmful-behaviour y sneaking) mas una septima clase de control (non-deceptive). La model card no especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Si se menciona que el modelo genera, ademas de la clase, un campo "reasoning" con una justificacion textual, lo que sugiere un entrenamiento orientado a producir una explicacion breve antes o junto a la etiqueta. No se detalla ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal u otros) mas alla de lo heredado del modelo base.

## Capacidades

- Clasificacion de conversaciones en siete categorias: anthropomorphism, brand-bias, sycophancy, user-retention, harmful-behaviour, sneaking y non-deceptive.
- Salida estructurada en JSON con tres campos: task_type (tipo de tarea conversacional, por ejemplo "emotional support"), class (categoria detectada) y reasoning (justificacion breve en texto).
- Deteccion binaria de comportamiento enganoso frente a no enganoso, segun la metrica F1 reportada por el autor.
- Analisis de transcripts multi-turno (la entrada es la conversacion completa, no un unico mensaje aislado).
- Etiquetado de la naturaleza de la tarea conversacional subyacente (campo task_type).
- Capacidad generativa residual heredada del modelo base, aunque el ajuste la orienta hacia la tarea de clasificacion.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking explicito en la informacion disponible.

## Casos de uso

- Monitorizacion de asistentes en produccion: integrado como clasificador posterior a cada respuesta generada por un LLM, permite etiquetar en tiempo real si el turno contiene un patron oscuro (por ejemplo, sycophancy o user-retention) y disparar alertas o bloqueos.
- Auditoria de seguridad y red teaming: analisis masivo de registros conversacionales historicos para cuantificar la prevalencia de cada categoria de DarkBench por modelo, version o caso de uso.
- Cumplimiento normativo y gobernanza de IA: generacion de informes periodicos sobre tasas de comportamiento enganoso en un sistema desplegado, apoyandose en la salida JSON estructurada y en el campo reasoning como evidencia trazable.
- Evaluacion comparativa de modelos: uso como juez automatico ligero para contrastar el comportamiento de distintos LLM sobre el mismo conjunto de prompts conversacionales.
- Filtrado previo en pipelines de datos: descarte o marcado de conversaciones sinteticas que contengan patrones de manipulacion antes de reutilizarlas en entrenamiento.
- Investigacion academica sobre alineacion y persuasion: herramienta reproducible (licencia MIT, pesos abiertos) para estudiar anthropomorphism o brand-bias en dialogos generados, con la ventaja de que la justificacion textual facilita la validacion manual de una muestra.
- Moderacion asistida en plataformas conversacionales: preclasificacion de interacciones con agentes virtuales para priorizar la revision humana de los casos etiquetados como harmful-behaviour.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto de evaluacion |
|---|---|---|
| Exactitud por categoria exacta | 86,7 % | Test reservado de 4.151 ejemplos |
| F1 binario (enganoso / no enganoso) | 0,85 | Test reservado de 4.151 ejemplos |

El autor indica que el desglose por categoria se encuentra en un articulo (paper) no enlazado en la informacion disponible. No se han publicado en la informacion proporcionada resultados comparativos frente a otros modelos en MMLU, HumanEval, GSM8K ni en tareas de deteccion de dark patterns.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16 o FP16: aproximadamente 2,4 GB solo para los pesos, y del orden de 3 GB contando cache de activaciones y overhead del runtime.
- VRAM estimada en INT8: alrededor de 1,2-1,5 GB. En INT4: alrededor de 0,7-1 GB. Estas cuantizaciones no se distribuyen en el repositorio y tendrian que generarse a partir de los pesos safetensors.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 4090, asi como en portatiles con 6-8 GB de VRAM. Tambien es viable en CPU para inferencia por lotes de baja frecuencia.
- El tamano del repositorio es de 7,0 GB, superior a lo que ocupan unicamente los pesos en BF16, lo que sugiere la presencia de artefactos adicionales de entrenamiento o copias en otras precisiones.
- Opciones de despliegue: transformers con trust_remote_code=True (metodo indicado por el autor). El soporte en vLLM, llama.cpp, Ollama o TGI depende de que dichos frameworks implementen la arquitectura lfm2; no se confirma en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento en deteccion de dark patterns | Disponibilidad |
|---|---|---|---|---|---|
| DAVID-lfm2-1.2b-full | 1,17 B | No disponible | MIT | 86,7 % de exactitud por categoria; F1 binario 0,85 (test de 4.151 ejemplos) | Pesos safetensors en HuggingFace |
| LiquidAI/LFM2-1.2B (base) | 1,2 B | No disponible en la informacion proporcionada | No disponible en esta ficha | No disponible (no esta ajustado para esta tarea) | HuggingFace |
| Modelos generalistas de ~1-2 B (Qwen, Llama, Gemma, SmolLM) | 1-2 B | No disponible en esta ficha | Variables | No disponible: no se han publicado comparativas en la informacion proporcionada | HuggingFace |

No se dispone de datos comparativos verificados de otros clasificadores de dark patterns sobre el mismo conjunto de evaluacion, por lo que la comparativa de rendimiento queda limitada al resultado reportado por el autor del modelo.

## Limitaciones y advertencias

- Modelo con adopcion practicamente nula: 0 descargas y 0 likes en el momento de redactar la ficha, y actualizado el mismo dia de su creacion (11 de septiembre de 2026). No ha pasado por validacion independiente ni por un proceso de revision por pares.
- Las metricas de rendimiento (86,7 % de exactitud y F1 0,85) son autodeclaradas por el autor y proceden de un conjunto de test derivado del mismo dataset de entrenamiento; puede existir sesgo de distribucion y sobreestimacion del rendimiento real en produccion.
- El dataset de entrenamiento es especifico (27.670 trazas etiquetadas a partir de categorias DarkBench) y esta probablemente en ingles: el comportamiento sobre otros idiomas o dominios no documentados es incierto.
- Riesgo de alucinacion en el campo reasoning: la justificacion generada es texto libre y puede no corresponder fielmente con la categoria asignada. Conviene validar la coherencia entre class y reasoning en cualquier uso critico.
- Riesgo de falsos positivos y negativos en un dominio sensible: una clasificacion erronea de harmful-behaviour o sneaking puede tener consecuencias relevantes si se usa para bloquear o sancionar contenido de forma automatica. Se recomienda revision humana en decisiones de alto impacto.
- La licencia MIT permite uso comercial y modificacion sin restricciones de copyleft, pero no exime de responsabilidad sobre el uso del modelo ni sobre los sesgos derivados de los datos de entrenamiento.
- La model card esta incompleta en varios puntos (idiomas, contexto, datos de entrenamiento, paper no enlazado explicitamente), lo que dificulta una evaluacion tecnica exhaustiva.
- El codigo de carga requiere trust_remote_code=True, lo que implica ejecutar codigo remoto del repositorio; conviene auditar dicho codigo antes de desplegarlo en entornos de produccion.
- No se distribuyen pesos cuantizados ni versiones GGUF, lo que obliga a generar las cuantizaciones de forma local si se necesita reducir el consumo de memoria.
- Dependencia total de la arquitectura lfm2 del modelo base: si un framework de inferencia no la soporta, el despliegue puede requerir trabajo adicional de conversion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/freelion/DAVID-lfm2-1.2b-full
- Modelo base: https://huggingface.co/LiquidAI/LFM2-1.2B
- Dataset de entrenamiento: https://huggingface.co/datasets/freelion/darkpatterns_in_llm
- Articulo (paper) citado por el autor: mencionado en la model card como "the paper", pero sin enlace disponible en la informacion proporcionada
- Los resultados de busqueda web facilitados no contienen enlaces relevantes al modelo; devuelven exclusivamente contenido no relacionado, por lo que no se incluye ninguno.
