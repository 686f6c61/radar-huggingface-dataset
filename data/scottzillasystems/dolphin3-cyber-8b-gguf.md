# ScottzillaSystems/Dolphin3-Cyber-8B-GGUF

## Resumen

Dolphin3-Cyber-8B-GGUF es un modelo de lenguaje de 8.000 millones de parametros especializado en ciberseguridad, publicado por el usuario ScottzillaSystems en Hugging Face. Se construye mediante un ajuste fino (LoRA de rango 16, entrenado con Unsloth) sobre el modelo base huihui-ai/Dolphin3.0-Llama3.1-8B-abliterated, que a su vez deriva de la familia Dolphin 3.0 sobre la arquitectura Llama 3.1 de Meta. El resultado es un asistente conversacional orientado a seguridad ofensiva, seguridad defensiva, investigacion de vulnerabilidades y desarrollo de exploits, distribuido unicamente en formato GGUF con 11 cuantizaciones distintas.

Su relevancia practica esta en dos factores. Por un lado, la especializacion de dominio: el autor declara un ajuste sobre un dataset propio de ciberseguridad que cubre OWASP Top 10, MITRE ATT&CK, CVE, bases de datos de exploits, metodologias de pentesting y marcos de seguridad defensiva. Por otro, el caracter "abliterated" y sin censura del modelo base, que elimina las direcciones de rechazo del espacio de pesos y permite discutir tecnicas ofensivas sin las negativas tipicas de los modelos alineados. Todo ello con inferencia 100 % local, sin API ni envio de datos a servidores externos, lo que encaja con requisitos de confidencialidad en auditorias y evaluaciones sensibles.

Tecnicamente es un transformer denso decoder-only de la familia Llama 3.1, con 8.030.277.696 parametros totales (dato real medido sobre safetensors), licencia Llama 3.1 y soporte exclusivo de ingles. El repositorio ocupa 69,6 GB y el modelo registra 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de una publicacion muy reciente y sin validacion externa de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (familia Llama 3.1) |
| Parametros totales | 8.030.277.696 (8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | La arquitectura Llama 3.1 soporta hasta 128.000 tokens; la model card solo documenta el calculo de cache KV para 2.048 tokens, por lo que el contexto efectivo del ajuste no esta confirmado |
| Tipos de cuantizacion | GGUF: Q2_K (3,18 GB), Q3_K_M (4,02 GB), Q4_0 (4,66 GB), Q4_K_S (4,69 GB), Q4_K_M (4,92 GB), Q5_0 (5,6 GB), Q5_K_S (5,6 GB), Q5_K_M (5,73 GB), Q6_K (6,6 GB), Q8_0 (8,54 GB), F16 (16,1 GB) |
| Idiomas soportados | Ingles (en) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | GGUF (11 cuantizaciones); parametros verificados sobre safetensors |
| Modelo base | huihui-ai/Dolphin3.0-Llama3.1-8B-abliterated |
| Metodo de ajuste | LoRA r=16 con Unsloth |
| Cuantizado por | RavichandranJ |
| Dataset de ajuste | custom-cybersecurity-dataset |
| Plantilla de chat | Plantilla de chat de Llama 3.1 / formato conversacional Dolphin3 |
| Tamano del repositorio | 69,6 GB |
| Fecha de publicacion | 11 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 en su variante de 8B: un transformer denso decoder-only con atencion por consultas agrupadas (GQA) y codificacion posicional rotatoria (RoPE). No hay innovaciones arquitectonicas propias de este modelo; la intervencion se limita al ajuste fino y al posterior proceso de abliteracion heredado del modelo base. El repositorio no incluye pesos en safetensors para inferencia directa en transformers, sino las 11 variantes GGUF generadas para llama.cpp y su ecosistema.

El entrenamiento declarado consiste en un ajuste LoRA de rango 16 realizado con Unsloth sobre un dataset propio de ciberseguridad. La model card menciona que ese corpus cubre OWASP Top 10, MITRE ATT&CK, CVE, bases de datos de exploits, metodologias de penetracion y marcos defensivos, pero no detalla el numero de tokens, la composicion exacta ni si hubo fases adicionales de RLHF o DPO. Tampoco se especifican hiperparametros de entrenamiento mas alla del rango de LoRA y el uso de Unsloth. La caracteristica "abliterated" procede del modelo base huihui-ai: es una tecnica de edicion de pesos que proyecta fuera las direcciones asociadas al rechazo, de modo que el modelo no genera negativas ante consultas de seguridad ofensiva. Esta tecnica suele conllevar una perdida de coherencia general que no se cuantifica en la informacion disponible.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, con plantilla de chat de Llama 3.1.
- Analisis de seguridad ofensiva: discusion de tecnicas de explotacion, escalada de privilegios, movimiento lateral y post-explotacion sin rechazos por alineamiento.
- Generacion de codigo de exploit y scripts de pentesting, incluida la categoria que los modelos alineados rechazan de forma sistematica.
- Investigacion de vulnerabilidades: analisis de CVE, reproduccion de fallos y construccion de pruebas de concepto.
- Seguridad defensiva: redaccion de reglas de deteccion, analisis de trazas y apoyo a marcos como MITRE ATT&CK.
- Conocimiento declarado de OWASP Top 10, MITRE ATT&CK, bases de CVE y repositorios de exploits.
- Ejecucion 100 % local, sin llamadas a API externas, con las 11 cuantizaciones disponibles en GGUF.
- Compatibilidad con el ecosistema llama.cpp: Ollama, LM Studio, llama-cpp-python, Open WebUI y Jan.ai.
- Soporte de tool calling o function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso explicito: no documentado en la informacion disponible.
- Capacidades multimodales (vision, audio): no disponibles; es un modelo exclusivamente de texto.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades multilingues: no disponibles; solo se declara ingles.

## Casos de uso

- Triaje y analisis de CVE: el modelo puede recibir el identificador y la descripcion de una vulnerabilidad y producir un analisis de impacto, vector de ataque y mitigaciones, apoyandose en su ajuste sobre bases de datos de CVE y MITRE ATT&CK.
- Red team en entornos autorizados: generacion de hipotesis de ataque y cadenas de explotacion sobre un objetivo en un laboratorio aislado, sin las negativas que bloquearian la tarea en un modelo alineado.
- Retos CTF y bug bounty: asistencia para descomponer un reto, razonar sobre clases de vulnerabilidad (inyeccion, desbordamiento, deserializacion) y esbozar cargas utiles, con la ventaja de ejecutarse en local y sin cuotas de API.
- Blue team y deteccion: redaccion de reglas Sigma, YARA o firmas de IDS a partir de una descripcion de comportamiento adversario, y ayuda a mapear tecnicas observadas contra la matriz ATT&CK.
- Revision de codigo seguro en CI/CD: integracion del GGUF mediante llama-cpp-python en un pipeline para revisar diferencias de codigo contra el OWASP Top 10 y marcar patrones inseguros antes del merge, siempre como capa de apoyo a herramientas SAST.
- Analisis de malware y artefactos sospechosos: explicacion de comportamiento de una muestra o de fragmentos de codigo ofuscado en un equipo aislado (air-gapped), donde la ausencia de conexion a servicios en la nube es un requisito duro.
- Formacion y concienciacion: generacion de escenarios de ataque realistas y ejercicios guiados para equipos internos, aprovechando el contexto conversacional multi-turno y la ausencia de rechazos en temas de seguridad.
- Asistente de consulta para equipos con confidencialidad estricta: al no enviar datos a terceros, encaja en auditorias sujetas a acuerdos de confidencialidad o en entornos regulados donde no se permite usar servicios de inferencia externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El bloque model-index de la model card declara el modelo "Dolphin3-Cyber-8B" con una lista de resultados vacia, y no se aportan cifras de MMLU, HumanEval, GSM8K ni de evaluaciones especificas de ciberseguridad (por ejemplo, CyberSecEval o CTF). Tampoco se proporcionan datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (la model card ofrece estimaciones de RAM que incluyen pesos y cache KV para 2.048 tokens de contexto): Q2_K ~5,5 GB; Q3_K_M ~6,5 GB; Q4_0 y Q4_K_S ~7,0 GB; Q4_K_M ~7,5 GB; Q5_0 y Q5_K_S ~8,0 GB; Q5_K_M ~8,5 GB; Q6_K ~9,0 GB; Q8_0 ~11,0 GB; F16 ~18,5 GB.
- El autor afirma que el modelo funciona en GPU de consumo desde una GTX 1650 en adelante, con un minimo declarado de 4 GB de VRAM para las cuantizaciones mas agresivas.
- GPU de consumo: una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB ejecutan comodamente Q4_K_M y Q5_K_M con contexto moderado; una RTX 4090 de 24 GB permite Q8_0 e incluso F16 con contexto amplio.
- GPU de centro de datos: A100 de 40/80 GB o H100 para servir varias peticiones concurrentes con las cuantizaciones altas o en precision completa.
- Opciones de despliegue documentadas en la model card: Ollama, llama.cpp, LM Studio, llama-cpp-python, Open WebUI y Jan.ai. Al ser formato GGUF, el despliegue con vLLM o TGI no esta documentado como soportado.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. El unico dato de rendimiento declarado es que el entrenamiento se hizo con Unsloth, descrito como "2x mas rapido", lo cual se refiere al proceso de ajuste y no a la inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Especializacion | Disponibilidad de benchmarks |
|---|---|---|---|---|---|---|
| Dolphin3-Cyber-8B-GGUF (este modelo) | 8,03B | 128.000 tokens por arquitectura; 2.048 documentados en el calculo de cache | GGUF (11 cuantizaciones) | Llama 3.1 Community | Ciberseguridad, abliterated | No disponible |
| huihui-ai/Dolphin3.0-Llama3.1-8B-abliterated (modelo base) | 8B | 128.000 tokens | Safetensors | Llama 3.1 Community | Generalista sin restricciones de alineamiento | No disponible |
| Dolphin 3.0 Llama 3.1 8B (origen de la linea) | 8B | 128.000 tokens | Safetensors y GGUF | Llama 3.1 Community | Generalista conversacional | No disponible en la informacion consultada |
| Meta Llama 3.1 8B Instruct | 8B | 128.000 tokens | Safetensors y GGUF | Llama 3.1 Community | Generalista con alineamiento | No disponible en la informacion consultada |

Existen otras familias de modelos ajustados especificamente para ciberseguridad (por ejemplo, las lineas WhiteRabbitNeo), pero la informacion proporcionada no incluye datos verificables sobre ellas, por lo que no se comparan cifras. La diferencia funcional clave de este modelo frente a los generalistas de la tabla es la especializacion de dominio y la ausencia de rechazos, no una ventaja medida en benchmarks.

## Limitaciones y advertencias

- No hay ningun benchmark publicado. El model-index esta vacio y las afirmaciones de calidad son cualitativas, sin evidencia medible frente a la base o frente a alternativas generalistas.
- El repositorio registra 0 descargas y 0 likes, lo que indica ausencia total de validacion por parte de la comunidad y de informes de fallos independientes.
- La model card disponible esta truncada en la informacion proporcionada, por lo que faltan secciones completas (benchmarks, formato de prompt detallado, limitaciones declaradas por el autor y aviso etico).
- La abliteracion elimina las direcciones de rechazo, pero tambien tiende a degradar la coherencia general, la adherencia a instrucciones y la factualidad. No se cuantifica ese deterioro.
- Riesgo elevado de alucinacion en un dominio tecnico y cambiante como la ciberseguridad: CVE, versiones de software, funciones de API y sintaxis de exploits pueden generarse con apariencia plausible y ser incorrectos. Toda salida debe verificarse.
- Solo soporta ingles. No hay capacidades multilingues declaradas, por lo que el uso en castellano degradara la calidad de forma no medida.
- Es un modelo de 8B: carece de la profundidad de razonamiento de modelos mucho mayores, y la generacion de exploits complejos o cadenas de ataque largas sera limitada.
- Ambito de uso legal: el modelo esta disenado para seguridad ofensiva. Su uso contra sistemas sin autorizacion expresa es ilegal en la mayoria de jurisdicciones. Debe emplearse en laboratorios aislados, programas de bug bounty con alcance definido o ejercicios de red team autorizados por escrito.
- Licencia Llama 3.1 Community: permite uso comercial con condiciones, exige mantener la denominacion "Llama" en los derivados y la atribucion "Built with Llama", e incluye una clausula de umbral de 700 millones de usuarios activos mensuales. Ademas incorpora una politica de uso aceptable que restringe usos maliciosos; conviene revisar el texto completo antes de un despliegue en produccion, dado el caracter sin filtros del modelo.
- El ajuste LoRA sobre un dataset propio de ciberseguridad puede haber desplazado capacidades generales (dialogo abierto, redaccion, matematicas). No hay evaluaciones que lo confirmen o desmientan.
- La cuantizacion Q2_K, pese a ocupar solo 3,18 GB, compromete notablemente la calidad; para tareas tecnicas se recomienda Q4_K_M o superior.
- Despliegue en produccion: al ser GGUF, el encaje con servidores de alto rendimiento como vLLM o TGI no esta documentado, lo que limita el escalado por lotes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ScottzillaSystems/Dolphin3-Cyber-8B-GGUF
- Adaptadores LoRA: https://huggingface.co/RavichandranJ/Dolphin3-Cyber-8B-LoRA
- Modelo base abliterated: https://huggingface.co/huihui-ai/Dolphin3.0-Llama3.1-8B-abliterated
- Unsloth (framework de entrenamiento): https://github.com/unslothai/unsloth

Nota: la busqueda web realizada no ha devuelto ningun resultado relacionado con este modelo ni con su ecosistema; los enlaces anteriores proceden exclusivamente de la model card y de los metadatos del repositorio.
