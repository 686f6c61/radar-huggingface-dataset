# alphalabz/VELIX-ALPHA-GGUF

## Resumen

VELIX-ALPHA-GGUF es la distribucion en formato GGUF de VELIX-ALPHA, un modelo de lenguaje especializado en analisis de malware y ciberseguridad ofensiva/defensiva, desarrollado por Alpha Labz. El modelo parte de `junafinity/Ornith-1.5-9B-uncensored` y se ha afinado sobre corpus de informes de familias de malware, mapeos MITRE ATT&CK, perfiles de Malpedia, reglas Sigma, firmas YARA y pares de pregunta-respuesta de analistas. Su proposito es asistir a analistas SOC, respondedores de incidentes, equipos de threat intelligence e ingenieros de deteccion en tareas como atribucion de familias, mapeo de tecnicas ATT&CK y redaccion de resumenes de analisis.

Tecnicamente es un transformer de 8.953.803.264 parametros (etiquetado como 9,4B en la model card) con arquitectura derivada de Qwen3.5: 32 capas, de las cuales 4 son de atencion completa y 28 de atencion lineal, lo que reduce el coste computacional en contextos largos. La ventana de contexto nativa es de 8192 tokens, ampliable. El modelo se distribuye exclusivamente en cinco cuantizaciones GGUF (Q8_0, Q6_K, Q5_K_M, Q4_K_M y Q3_K_M), pensadas para ejecutarse en GPUs de consumo desde 6 GB de VRAM.

La relevancia de este lanzamiento reside en dos factores: por un lado, ofrece capacidades de analisis de seguridad en un paquete que cabe en GPUs consumer, con una calidad que el autor reporta como identica entre Q8_0 y Q3_K_M en su bateria de 12 pruebas; por otro, es un modelo "uncensored" sin filas de rechazo en el entrenamiento, lo que elimina las barreras de negativa en consultas de seguridad, pero traslada toda la responsabilidad de uso al operador. La licencia Apache 2.0 facilita su integracion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Qwen3.5 (32 capas: 4 de atencion completa + 28 de atencion lineal) |
| Parametros totales | 8.953.803.264 (etiquetado como 9,4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens nativos, ampliable |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M (GGUF) |
| Idiomas soportados | Ingles (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer basada en Qwen3.5 con una combinacion hibrida de atencion: 4 capas de atencion completa y 28 capas de atencion lineal sobre un total de 32. Esta mezcla reduce el coste de atencion cuadratico en secuencias largas, lo que resulta coherente con el objetivo de procesar informes de sandbox y trazas de comportamiento extensas. El modelo base es `junafinity/Ornith-1.5-9B-uncensored`, sobre el que Alpha Labz aplico un afinamiento especifico de dominio.

El corpus de entrenamiento, segun la model card, comprende informes de familias de malware, mapeos de tecnicas MITRE ATT&CK, perfiles de Malpedia, reglas Sigma, firmas YARA, negativos benignos de herramientas de doble uso y pares de pregunta-respuesta de analistas. El autor declara explicitamente cero filas de rechazo en el entrenamiento, lo que configura el caracter "uncensored" del modelo. No se especifica el numero total de tokens de entrenamiento, la composicion porcentual del dataset ni si se aplicaron tecnicas de RLHF o DPO; estos datos no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto especializada en dominios de ciberseguridad: analisis de malware, threat intelligence y respuesta a incidentes.
- Atribucion de familias de malware a partir de descripciones de comportamiento o informes de sandbox.
- Mapeo de comportamientos observados a identificadores MITRE ATT&CK.
- Triaje de herramientas de doble uso (distingue utilidades legitimas de artefactos maliciosos).
- Redaccion de resumenes e informes de analista.
- Generacion de andamiaje de payloads (payload scaffolding) en contextos autorizados.
- Soporte de conversacion multi-turno con contexto de 8k tokens.
- Capacidad de ejecucion via llama.cpp, llama-server (API compatible con OpenAI) y Ollama.
- No se documenta soporte explicito de tool calling, function calling ni modos de razonamiento extendido (thinking mode) en la informacion disponible.
- Capacidades multilingues: solo ingles segun la model card.

## Casos de uso

- Triaje en centro de operaciones de seguridad (SOC): el modelo recibe alertas con descripciones de comportamiento y devuelve una clasificacion inicial (malicioso/benigno) junto con la familia probable y las tecnicas ATT&CK asociadas, reduciendo el tiempo de escalado manual. Su ventana de 8k tokens permite incluir el contexto completo de la alerta y eventos correlacionados.
- Atribucion de familias de malware: a partir de un informe de sandbox o de indicadores de compromiso, el modelo sugiere la familia mas probable y justifica la atribucion con tecnicas y artefactos observados, apoyandose en su entrenamiento sobre perfiles de Malpedia.
- Ingenieria de deteccion: el modelo genera reglas Sigma y firmas YARA a partir de descripciones de comportamiento, lo que acelera la creacion de detecciones para nuevas familias o variantes observadas en produccion.
- Redaccion de informes de incidente: dado un conjunto de hallazgos tecnicos, el modelo produce un resumen estructurado para analistas o partes interesadas, con mapeo ATT&CK y lista de indicadores, aprovechando su entrenamiento en pares de pregunta-respuesta de analistas.
- Ejercicios de red team y CTF: en entornos con alcance escrito, el modelo asiste en la generacion de andamiaje de payloads y en la planificacion de tecnicas de evasion, con la advertencia de que su salida debe validarse en laboratorio aislado.
- Analisis de herramientas de doble uso: el modelo evalua si una utilidad (por ejemplo, un binario de administracion remota o un framework de post-explotacion) es probablemente legitima o maliciosa en el contexto descrito, ayudando a priorizar revisiones manuales.
- Despliegue en estaciones de trabajo de analista con GPU consumer: gracias a las cuantizaciones Q4_K_M (5,68 GB) y Q3_K_M (4,68 GB), el modelo puede ejecutarse localmente en GPUs de 8 GB o 6 GB, lo que permite analisis de datos sensibles sin enviarlos a servicios en la nube.

## Benchmarks y rendimiento

La model card reporta una comparacion en tres "carriles" frente a Cisco-Sec-8B y WhiteRabbitNeo-2.5-7B:

| Carril | VELIX ALPHA | Cisco-Sec-8B | WhiteRabbitNeo-2.5-7B |
|---|---|---|---|
| Atribucion de familia (30 casos) | 30/30 | 23/30 | 20/30 |
| Triaje benigno (30 casos) | 24/30 | 13/30 | 13/30 |
| Autoría de payload (10 casos) | 7/10 | 0/10 | 1/10 |

Ademas, el autor publica una bateria interna de 12 pruebas aplicada a cada cuantizacion, con resultados identicos en todas las builds:

| Cuantizacion | Tamano | Digitos | Conceptos | Total |
|---|---|---|---|---|
| Q8_0 | 9,53 GB | 5/5 | 4/5 | 9/10 |
| Q6_K | 7,36 GB | 5/5 | 4/5 | 9/10 |
| Q5_K_M | 6,49 GB | 5/5 | 4/5 | 9/10 |
| Q4_K_M | 5,68 GB | 5/5 | 4/5 | 9/10 |
| Q3_K_M | 4,68 GB | 5/5 | 4/5 | 9/10 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los datos anteriores proceden de la evaluacion propia del autor y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q8_0 9,53 GB; Q6_K 7,36 GB; Q5_K_M 6,49 GB; Q4_K_M 5,68 GB; Q3_K_M 4,68 GB (pesos; anadir overhead de contexto KV).
- GPU recomendadas: el autor indica que Q8_0 cabe en tarjetas de 12 GB, Q6_K en 10 GB, Q5_K_M y Q4_K_M en 8 GB, y Q3_K_M en 6 GB. Para despliegue de mayor throughput se puede usar A100 o H100, aunque no se documentan cifras de rendimiento para estas.
- Cabe en GPU consumer: si, desde una RTX 3060 de 8 GB (con Q4_K_M o Q5_K_M) hasta una RTX 4070/4080 o 4090 de 12-24 GB para Q8_0.
- Opciones de despliegue: llama.cpp (llama-cli), llama-server con API compatible con OpenAI, y Ollama mediante el Modelfile proporcionado por el autor.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Resultado en carriles del autor |
|---|---|---|---|---|---|
| VELIX-ALPHA-GGUF | 8,95B (9,4B etiquetado) | 8k | Apache 2.0 | Analisis de malware, ATT&CK, payloads | 30/30, 24/30, 7/10 |
| Cisco-Sec-8B | ~8B | no disponible | no disponible | Seguridad (defensiva) | 23/30, 13/30, 0/10 |
| WhiteRabbitNeo-2.5-7B | ~7B | no disponible | no disponible | Seguridad ofensiva/defensiva | 20/30, 13/30, 1/10 |

Los datos de Cisco-Sec-8B y WhiteRabbitNeo-2.5-7B proceden de la evaluacion del propio autor de VELIX-ALPHA; no se dispone de cifras independientes en la informacion proporcionada. No se dispone de datos de contexto ni licencia de los modelos comparados en la informacion disponible.

## Limitaciones y advertencias

- Modelo "uncensored": no rechaza consultas de seguridad ofensiva. El autor advierte explicitamente que el guardrail es el propio operador; el uso indebido puede tener consecuencias legales.
- Riesgo de alucinacion en atribucion de familias y mapeo ATT&CK: los resultados deben validarse contra fuentes primarias (Malpedia, informes del proveedor) antes de su uso operativo.
- Idioma: solo ingles segun la model card; no se documenta soporte de castellano ni de otros idiomas.
- Contexto limitado a 8k tokens nativos; los informes de sandbox o trazas muy extensas requeriran truncado o troceado.
- La model card advierte que sin el system prompt del Modelfile el modelo puede declarar datos incorrectos sobre si mismo (por ejemplo, su ordinal o version).
- El rendimiento reportado procede de evaluaciones internas del autor con baterias pequenas (12, 30 y 10 casos); no hay validacion independiente ni benchmarks estandar publicados.
- La salida de payloads debe tratarse como peligrosa: ejecutar muestras solo en sandbox aislado.
- Licencia Apache 2.0 permite uso comercial, pero el cumplimiento legal del uso de herramientas de seguridad varia por jurisdiccion y es responsabilidad del usuario.
- El modelo base es un fine-tune "uncensored" de origen no verificado; no se documenta la procedencia de sus datos de entrenamiento originales.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/alphalabz/VELIX-ALPHA-GGUF
- Modelo principal (pesos completos y paper): https://huggingface.co/alphalabz/VELIX-ALPHA
- Modelo base: https://huggingface.co/junafinity/Ornith-1.5-9B-uncensored
- Logo del proyecto: https://huggingface.co/alphalabz/VELIX-ALPHA/resolve/main/assets/velix_logo.png
- Figura de ajuste VRAM: https://huggingface.co/alphalabz/VELIX-ALPHA/resolve/main/assets/fig7_vram.png
- Figura de escalera de cuantizacion: https://huggingface.co/alphalabz/VELIX-ALPHA/resolve/main/assets/fig3_quants.png
- Modelfile para Ollama: https://huggingface.co/alphalabz/VELIX-ALPHA (ruta `Modelfile` en el repo principal)
