# cyberviser/hancock-mistral-7b-adapter-v4

## Resumen

Hancock Mistral 7B Adapter v4 es un adaptador LoRA publicado por cyberviser (proyecto GLASSEYE) sobre el modelo base mistralai/Mistral-7B-Instruct-v0.3, orientado a tareas de ciberseguridad: detección, threat hunting y análisis técnico. No es un modelo completo, sino pesos PEFT en safetensors que deben cargarse junto al modelo base; el repositorio ocupa 0,1 GB, un tamano coherente con un adaptador de bajo rango sobre un transformer denso de 7 200 millones de parametros y 32 768 tokens de contexto.

El entrenamiento se realizo con QLoRA en una RTX 5070 (equipo "glasseye"), partiendo del adaptador previo cyberviser/hancock-mistral-7b-adapter y usando el conjunto hancock_refresh_v4 (~3 917 ejemplos), durante 250 pasos y con una train_loss final de 1,06. El autor lo presenta como una actualizacion ("refresh") local y recomienda su uso para deteccion y hunting en entornos autorizados, remitiendo a una linea separada (hancock-pentest-v4) para el ambito de pentesting.

La relevancia practica es hoy limitada: el repositorio acumula 0 descargas y 0 likes, no publica benchmarks, no detalla hiperparametros ni composicion del dataset, y la busqueda web no ha devuelto documentacion tecnica asociada. Es un artefacto experimental de nicho, util para reproducir o evaluar ajustes de ciberseguridad sobre Mistral-7B, pero no una pieza lista para produccion sin validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Mistral-7B-Instruct-v0.3) con adaptador LoRA/PEFT |
| Parametros totales | 7 200 millones aprox. en el modelo base; el adaptador ocupa 0,1 GB (rango y dimensiones no especificados) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32 768 tokens heredados del modelo base; el adaptador no la modifica (no confirmado por el autor) |
| Tipos de cuantizacion | No especificados por el autor. El adaptador se distribuye en safetensors; tras fusionarlo con el base puede cuantizarse a GGUF (Q2_K-Q8_0), GPTQ, AWQ o bitsandbytes 4/8 bits |
| Idiomas soportados | No disponibles en la ficha. El modelo base esta entrenado principalmente en ingles, con competencia declarada en frances, aleman, espanol e italiano; el ajuste Hancock no documenta idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); libreria declarada: peft |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Mistral-7B-Instruct-v0.3, un transformer decoder-only denso de 32 capas con atencion de consultas agrupadas (GQA) y RoPE, con ventana deslizante y contexto extendido a 32 768 tokens respecto a las versiones 0.1 y 0.2 del mismo modelo. La tecnica de ajuste es QLoRA, es decir, el modelo base se cuantiza a 4 bits durante el entrenamiento y solo se actualizan las matrices de bajo rango insertadas en las capas de atencion y proyeccion. El autor indica que el entrenamiento se ejecuto en una RTX 5070 con 250 pasos, inicializando desde el adaptador hancock-mistral-7b-adapter y sobre el dataset hancock_refresh_v4, con aproximadamente 3 917 ejemplos y una train_loss final de 1,06.

No se documentan el rango, alpha, dropout, tasa de aprendizaje, longitud de secuencia, composicion tematica del dataset ni si hubo fases de RLHF o DPO. Tampoco se especifica el numero de tokens de entrenamiento. La unica innovacion tecnica mencionada es el propio ciclo de "refresh" incremental sobre adaptadores previos del mismo autor, sin aportaciones arquitectonicas nuevas (no hay decodificacion especulativa, atencion lineal ni arquitecturas hibridas).

## Capacidades

- Generacion de texto tecnico en el dominio de ciberseguridad, con enfasis declarado en deteccion (deteccion de intrusiones, reglas de alerta) y threat hunting.
- Razonamiento sobre artefactos y telemetria de seguridad: logs, alertas, trafico de red, indicadores de compromiso (aunque no hay evaluacion publicada que lo respalde).
- Herencia del modelo base: instrucciones generales, razonamiento basico, generacion de codigo y matematicas elementales. Mistral-7B-Instruct-v0.3 anade soporte de function calling, por lo que la capacidad de tool calling es teoricamente heredable, si bien el adaptador no documenta entrenamiento especifico en ese formato.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente para el adaptador; solo la capacidad generica del modelo base.
- Capacidades multilingues: no documentadas en la ficha del adaptador.
- Capacidades especiales (modo thinking, vision, audio): no disponibles. El adaptador es exclusivamente de texto.

## Casos de uso

- Triaje de alertas en un SIEM: el modelo puede resumir y clasificar alertas en lenguaje natural y proponer una prioridad, apoyandose en los 32 768 tokens de contexto del base para incluir varias alertas correlacionadas en un mismo prompt.
- Generacion de reglas de deteccion: redaccion y revision de reglas Sigma, YARA o Suricata a partir de descripciones de comportamiento sospechoso, con el adaptador ajustado sobre ejemplos de deteccion.
- Apoyo a threat hunting: formulacion de hipotesis de caza y traduccion a consultas KQL, SPL o Lucene que el analista ejecuta manualmente en su plataforma.
- Analisis y normalizacion de logs: extraccion de indicadores (IP, hashes, dominios, rutas) desde texto no estructurado y conversion a un formato tabular o STIX-like para su ingesta.
- Enriquecimiento de informes de inteligencia (CTI): mapeo de tecnicas descritas en un informe a tacticas y tecnicas de MITRE ATT&CK, con justificacion textual.
- Asistente RAG sobre documentacion interna: indexacion de runbooks, politicas y procedimientos de respuesta a incidentes para responder consultas del equipo de guardia con citas al documento fuente.
- Automatizacion SOAR con tool calling: encadenamiento de acciones (consulta a un EDR, apertura de ticket, aislamiento de host) mediante function calling del modelo base, siempre con aprobacion humana y en entornos autorizados.
- Formacion de equipos azules: generacion de escenarios de entrenamiento y preguntas de autoevaluacion sobre deteccion, sin emplear el modelo para generar capacidades ofensivas no autorizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta una train\_loss de 1,06 tras 250 pasos, metrica de entrenamiento que no permite inferir rendimiento en tareas reales ni compararlo con alternativas. No hay datos de MMLU, HumanEval, GSM8K, CyberSecEval ni de ninguna evaluacion especifica de ciberseguridad.

## Requisitos de hardware

- Inferencia del adaptador: requiere cargar el modelo base completo (7 200 millones de parametros) mas el adaptador. No es posible ejecutar el adaptador de forma aislada.
- VRAM estimada (modelo base, sin contar cache KV): ~14-15 GB en fp16/bf16, ~8-9 GB en 8 bits, ~4-5 GB en 4 bits.
- Cache KV a 32 768 tokens en fp16: aproximadamente 4 GB adicionales con la configuracion GQA del modelo base (8 cabezas KV, 32 capas), por lo que conviene reducir el contexto o usar cuantizacion de cache en equipos pequenos.
- GPU consumer: si cabe en 4 bits en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070). Una RTX 4090 de 24 GB permite fp16 con contexto moderado o 4 bits con contexto completo. El autor entreno en una RTX 5070, por lo que esa clase de tarjeta es suficiente para el ajuste o la inferencia cuantizada.
- GPU de datacenter: A100 40/80 GB, H100, L40S y similares para fp16 con lotes grandes y contexto completo.
- Despliegue: transformers + peft para cargar el adaptador; fusion con `merge_and_unload()` para obtener un modelo autonomo; a partir de ahi, vLLM o TGI para servicio de alto rendimiento, llama.cpp/Ollama con conversion a GGUF para entornos locales, y cuantizacion AWQ/GPTQ para produccion.
- Latencia y throughput: no disponibles. Como referencia orientativa de un modelo denso de 7B en 4 bits sobre GPU consumer, cabe esperar decenas de tokens por segundo en un unico stream, pero no hay medicion publicada para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyberviser/hancock-mistral-7b-adapter-v4 | 7,2 B en el base + adaptador de 0,1 GB | 32 768 tokens (heredado) | Ciberseguridad: deteccion y hunting | apache-2.0 | HuggingFace; 0 descargas, 0 likes |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,2 B | 32 768 tokens | Instrucciones generales, function calling | apache-2.0 | Ampliamente adoptado como base de ajustes |
| Cisco Foundation-Sec-8B | 8 B (base Llama 3.1) aprox. | no disponible en la informacion proporcionada | Ciberseguridad defensiva | no disponible en la informacion proporcionada | HuggingFace |
| WhiteRabbitNeo (7B/13B) | 7 B y 13 B segun variante | no disponible en la informacion proporcionada | Ciberseguridad ofensiva y defensiva | no disponible en la informacion proporcionada | HuggingFace |

Nota: los datos de las dos ultimas filas proceden de conocimiento general sobre esas familias y no se han podido verificar en la busqueda realizada; deben confirmarse en sus fichas oficiales antes de usarlos en una decision tecnica. En cualquier caso, la diferencia clave de Hancock v4 es que no aporta metricas de rendimiento y que su adopcion es nula por el momento, frente a alternativas con evaluaciones publicadas o mayor traccion.

## Limitaciones y advertencias

- Sin evaluacion: no hay benchmarks ni validacion independiente; el unico dato reportado es una train\_loss de 1,06, insuficiente para estimar calidad.
- Cero adopcion: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusion que permitan conocer problemas reales.
- Documentacion minima: no se detallan hiperparametros, composicion del dataset, proceso de filtrado ni criterios de evaluacion.
- Riesgo de alucinacion: un ajuste de ciberseguridad de 250 pasos sobre 3 917 ejemplos puede generar comandos, reglas o indicadores plausibles pero incorrectos. Toda salida operativa debe validarse antes de ejecutarse.
- Riesgo de uso dual: el dominio de ciberseguridad incluye contenido ofensivo. El autor recomienda explicitamente uso autorizado y orientado a deteccion; el despliegue debe acompanarse de controles de acceso y registro de uso.
- Limitaciones de idioma: el adaptador no documenta idiomas soportados; al estar ajustado sobre datos presumiblemente en ingles, el rendimiento en castellano puede degradarse de forma notable.
- Limitaciones de contexto: aunque el base soporta 32 768 tokens, no se ha verificado el comportamiento del adaptador con prompts largos ni su estabilidad mas alla de la ventana usada en entrenamiento.
- Licencia: apache-2.0 permite uso comercial y modificacion, pero no exime de responsabilidad legal por el uso del contenido generado ni de cumplir la normativa aplicable en pruebas de seguridad.

## Enlaces

- Ficha del adaptador en HuggingFace: https://huggingface.co/cyberviser/hancock-mistral-7b-adapter-v4
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Adaptador previo del que parte el entrenamiento: https://huggingface.co/cyberviser/hancock-mistral-7b-adapter
- Linea de pentesting del mismo autor: https://huggingface.co/cyberviser/hancock-pentest-v4
- Paper, blog tecnico, repositorio de codigo o demo: no disponible. La busqueda web realizada no devolvio resultados relacionados con el modelo (unicamente paginas sin relacion sobre el Arsenal FC), por lo que no existen enlaces adicionales que citar.
