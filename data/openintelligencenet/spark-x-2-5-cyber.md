# OpenIntelligenceNet/Spark-X-2.5-Cyber

## Resumen

Spark-X-2.5-Cyber es un ajuste fino (fine-tune) de 4.112 millones de parámetros desarrollado por OpenIntelligenceNet, orientado especificamente a tareas de ciberseguridad ofensiva y defensiva. Se construye sobre Huihui-Spark-X2.5-4B-abliterated, un modelo base de la familia Spark-X2.5 al que se le ha aplicado una tecnica de "abliteration" para reducir los rechazos en temas sensibles. Sobre esa base se entreno un adaptador LoRA con aproximadamente 28.000 ejemplos de seguridad, que posteriormente se fusiono en los pesos del modelo, de modo que se carga como un modelo transformers convencional.

El modelo resuelve un problema concreto: los profesionales de seguridad (pentesters, equipos rojo y azul, analistas de SOC, estudiantes de CTF) suelen recibir rechazos o respuestas edulcoradas en servicios de IA alojados cuando consultan sobre tecnicas de ataque, revision de exposicion o escritura de logica de deteccion. Spark-X-2.5-Cyber ofrece respuestas directas sobre mecanicas de ataque y su deteccion, y al ser ejecutable en local garantiza que documentos de alcance, logs y hallazgos sensibles no salgan de la infraestructura propia.

La relevancia actual reside en su tamano compacto: con unos 9 GB de VRAM en FP16 cabe en una Tesla T4 o en cualquier GPU de consumo con 12 GB o mas, lo que lo hace accesible para laboratorios personales y entornos con recursos limitados. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, y el modelo soporta modo de razonamiento (thinking mode) para preguntas complejas de multiples pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Spark-X2.5), con modo de razonamiento |
| Parametros totales | 4.112.079.360 (aproximadamente 4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible oficialmente; el modelo se publica en FP16 y admite cuantizacion estandar via herramientas de inferencia (no confirmado por el autor) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 16,4 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Spark-X2.5, heredado del base Huihui-Spark-X2.5-4B-abliterated. Sobre esa base se aplico un ajuste fino mediante LoRA con aproximadamente 28.000 ejemplos de ciberseguridad que mezclan tecnicas ofensivas (mecanica de ataques) y defensivas (deteccion, mitigacion y remediacion). El adaptador LoRA se fusiono en los pesos base, por lo que el resultado es un unico conjunto de pesos cargable con `AutoModelForCausalLM` de transformers. El modelo requiere `trust_remote_code=True`, lo que indica la presencia de codigo personalizado en el repositorio (tag `custom_code`).

El base model incorpora "abliteration", una tecnica que modifica los pesos para reducir la tendencia del modelo a rechazar peticiones sobre temas considerados sensibles. Esto explica su comportamiento directo ante consultas de seguridad ofensiva. No se han publicado detalles sobre hiperparametros de entrenamiento, composicion exacta del dataset ni si hubo fases de RLHF o DPO posteriores al ajuste supervisado. El modelo soporta un modo de razonamiento (`enable_thinking=True` en el chat template) que genera un bloque `` previo a la respuesta final.

## Capacidades

- Generacion de texto conversacional especializada en ciberseguridad, con respuestas tecnicas directas sobre mecanicas de ataque y defensa.
- Conocimiento ofensivo: Kerberoasting, enumeracion de SPN, Pass-the-Hash, Overpass-the-Hash, Pass-the-Ticket, SSRF ciego, tecnicas de reconocimiento OSINT pasivo.
- Conocimiento defensivo: deteccion de anomalias TGS-REQ, diferencias entre IMDSv1 e IMDSv2, remediacion arquitectonica, verificacion de SPF/DKIM/DMARC, threat hunting.
- Mapeo de tecnicas a MITRE ATT&CK, incluyendo identificadores de tecnica.
- Soporte de simulaciones de phishing autorizadas y revision de superficie de ataque.
- Modo de razonamiento (thinking mode) para preguntas complejas de multiples pasos.
- Capacidades de CTF y aprendizaje guiado.
- No se documenta soporte explicito de tool calling, function calling, vision ni audio.

## Casos de uso

- Pentesting autorizado: el modelo responde con detalle sobre mecanicas de ataque (Kerberoasting, movimiento lateral, SSRF) para apoyar la planificacion y ejecucion de pruebas de penetracion con alcance definido, sin los rechazos tipicos de APIs alojadas.
- Ingenieria de deteccion: genera logica de deteccion y explica que artefactos dejan tecnicas como Pass-the-Hash o TGS-REQ anomalos, util para equipos azules que construyen reglas en SIEM.
- Analisis de SOC y respuesta a incidentes: sirve de apoyo para interpretar hallazgos, mapear tecnicas observadas a MITRE ATT&CK y redactar notas de triaje, ejecutandose en local para no exponer logs sensibles.
- Redaccion de informes de seguridad: ayuda a estructurar hallazgos, describir impacto y proponer remediacion, combinando la perspectiva ofensiva y defensiva que el modelo fue entrenado para manejar conjuntamente.
- Formacion y CTF: entorno de practica privado donde estudiantes pueden preguntar sobre tecnicas y recibir explicaciones tecnicas sin restricciones de contenido, con la ventaja de ejecucion local.
- Revision de superficie de ataque y OSINT: apoyo en reconocimiento pasivo, certificate transparency y mapeo de activos expuestos, adecuado por su tamano compacto para ejecutarse en estaciones de trabajo de analistas.
- Laboratorios aislados y entornos air-gapped: al caber en una GPU de 12 GB y no requerir conexion externa, es apto para entornos donde los datos no pueden salir de la red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 9 GB en FP16 segun el autor; depende de la longitud de contexto y de los ajustes de generacion.
- GPU recomendadas: Tesla T4 (16 GB) o cualquier GPU de consumo con 12 GB o mas.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090). En GPUs con menos VRAM requeriria cuantizacion, no documentada oficialmente por el autor.
- Opciones de despliegue: transformers con `trust_remote_code=True`; el autor menciona `top_k=-1` como equivalente en vLLM y SGLang, lo que sugiere compatibilidad con esos motores de inferencia.
- Latencia y throughput: no disponibles.
- Ajustes recomendados por el autor: temperature 1.0, top_p 0.95, top_k 0 (deshabilitado), repetition_penalty 1.05 y thinking mode activado. El autor advierte que temperaturas bajas (alrededor de 0.3) provocan bucles de repeticion en esta familia de modelos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spark-X-2.5-Cyber (OpenIntelligenceNet) | 4B | no disponible | Ciberseguridad ofensiva y defensiva | Apache 2.0 | Hugging Face |
| Huihui-Spark-X2.5-4B-abliterated (base) | 4B | no disponible | Proposito general, abliterated | no disponible en la informacion | Hugging Face |
| Modelos frontier de seguridad (propietarios) | no disponible | no disponible | Ciberseguridad | Propietaria | APIs alojadas |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento no esta disponible.

## Limitaciones y advertencias

- Riesgo de alucinacion: el autor advierte explicitamente de que puede afirmar con seguridad datos incorrectos o inventados, incluyendo comandos, flags de herramientas, numeros de CVE, rutas de registro e identificadores de tecnica ATT&CK. Todo debe verificarse antes de usarlo en un engagement o informe.
- Modelo pequeno: con 4B parametros tiene menos profundidad y fiabilidad que modelos frontier, especialmente en problemas novedosos, de multiples etapas o muy especializados.
- Sin conocimiento en vivo: el modelo no dispone de acceso a informacion actualizada; no se detalla la fecha de corte de entrenamiento.
- Idioma: solo soporta ingles (tag `en`), lo que limita su uso en castellano u otros idiomas.
- Contexto: la longitud de contexto no esta publicada, lo que dificulta planificar tareas con documentos largos.
- Restricciones de uso: aunque la licencia es Apache 2.0 y permite uso comercial, el autor restringe explicitamente el uso a trabajos de seguridad autorizados; queda fuera de alcance atacar sistemas sin permiso escrito, dirigirse a individuos o realizar actividades ilegales.
- El tag "abliterated" implica que se han reducido los mecanismos de rechazo del modelo base, lo que aumenta el riesgo de generar contenido danino si se usa sin las salvaguardas adecuadas.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene auditar dicho codigo antes de desplegarlo en produccion.
- Ajustes de generacion delicados: temperaturas bajas provocan bucles de repeticion, lo que exige seguir las recomendaciones del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenIntelligenceNet/Spark-X-2.5-Cyber
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Spark-X2.5-4B-abliterated
