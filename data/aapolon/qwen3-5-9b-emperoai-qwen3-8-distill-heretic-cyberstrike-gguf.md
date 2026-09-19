# Aapolon/Qwen3.5-9B-EmperoAI-Qwen3.8-Distill-Heretic-CyberStrike-GGUF

## Resumen

El modelo Aapolon/Qwen3.5-9B-EmperoAI-Qwen3.8-Distill-Heretic-CyberStrike-GGUF es un ajuste fino de 9.197.093.888 parámetros (aproximadamente 9,20 mil millones) especializado en ciberseguridad ofensiva, investigación de vulnerabilidades y pruebas de penetración autorizadas. Lo publica el usuario Aapolon en Hugging Face y se construye sobre el modelo base petruhonk/Qwen3.8-9B-Distill-uncensored-heretic, al que se le aplica un ajuste supervisado con el conjunto de datos oyildirim/cyberstrike-sft-120k, compuesto por 121.422 pares instrucción-respuesta de nivel experto en dominios de red teaming. El resultado se distribuye exclusivamente en formato GGUF, lo que lo orienta a inferencia local mediante llama.cpp, Ollama o LM Studio.

El problema que aborda es la falta de modelos abiertos con profundidad técnica real en tareas ofensivas: la mayoría de los asistentes comerciales rechazan o degradan respuestas sobre explotación, análisis de CVE o técnicas MITRE ATT&CK. Este modelo se ha entrenado explícitamente para eliminar esas negativas y ofrecer detalle técnico de nivel operador, y se presenta como el motor cognitivo del framework CyberStrike AI, incluyendo integración con herramientas MCP (Model Context Protocol).

Su relevancia es acotada y específica: está pensado para equipos de seguridad que necesitan un modelo ejecutable en hardware propio, sin depender de API externas ni de filtros de contenido. La model card lo enmarca en investigación autorizada y red teaming, con una licencia Apache 2.0 declarada. No se han publicado datos de benchmarks, longitud de contexto, ni detalles de la arquitectura interna más allá de la referencia a la familia Qwen.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la model card no describe la arquitectura interna; se etiqueta como qwen3_5 y deriva de un modelo de la familia Qwen) |
| Parametros totales | 9.197.093.888 (aproximadamente 9,20 mil millones) |
| Parametros activos | No aplica / no se documenta componente MoE; con este recuento de parametros se presume un modelo denso |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF; no se especifican los niveles concretos publicados (el repositorio ocupa 13,3 GB, lo que sugiere varios niveles) |
| Idiomas soportados | Inglés (en) únicamente, según los metadatos |
| Licencia | Apache 2.0 (declarada en el repositorio) |
| Formato de pesos | GGUF |
| Modelo base | petruhonk/Qwen3.8-9B-Distill-uncensored-heretic |
| Conjunto de datos de ajuste | oyildirim/cyberstrike-sft-120k (121.422 pares instrucción-respuesta) |
| Fecha de creación | 19 de septiembre de 2026 |
| Última actualización | 19 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |
| Compatibilidad | endpoints_compatible; orientado a llama.cpp, Ollama y LM Studio |

## Arquitectura y entrenamiento

La información publicada no detalla la arquitectura interna del modelo. Se sabe que parte de petruhonk/Qwen3.8-9B-Distill-uncensored-heretic, un modelo de 9,20 mil millones de parámetros etiquetado como perteneciente a la familia Qwen y descrito como destilado y sin censura. La model card no especifica si se trata de un transformer denso convencional, de una variante con atención lineal, de un híbrido o de un MoE, ni tampoco el número de capas, la dimensión oculta o el mecanismo de atención empleado. Tampoco se documenta el proceso de destilación del modelo base ni qué modelo profesor se utilizó.

El entrenamiento específico consiste en un ajuste supervisado (SFT) sobre oyildirim/cyberstrike-sft-120k, un conjunto de 121.422 pares de instrucción y respuesta de nivel experto. Los dominios declarados son seguridad en la nube, razonamiento sobre CVE, hardening según CIS, MITRE ATT&CK, OWASP (Web y ASVS), NIST y operaciones ofensivas generales. No se menciona el uso de RLHF, DPO, ni ninguna innovación técnica como decodificación especulativa o atención lineal. El comportamiento buscado es explícitamente "sin censura", con detalle técnico de nivel operador y sin rechazos genéricos.

## Capacidades

- Generación de texto conversacional en inglés, con especialización en contenido técnico de seguridad ofensiva.
- Generación de cadenas de explotación y variaciones de payload en contextos de pruebas de penetración autorizadas.
- Análisis de CVE: razonamiento sobre vulnerabilidades, comparación de parches (patch diffing) y desarrollo de exploits.
- Conocimiento alineado con marcos de referencia: MITRE ATT&CK, OWASP (incluido ASVS), CIS Hardening y NIST.
- Cobertura de seguridad en la nube y operaciones ofensivas generales.
- Integración declarada con el framework CyberStrike AI como motor cognitivo de agentes de red team autónomos, testers proxy y herramientas de seguridad MCP.
- Comportamiento sin rechazos: no aplica filtros de seguridad genéricos sobre las peticiones.
- Soporte de tool calling y function calling: no confirmado explícitamente en la model card; la mención a herramientas MCP apunta a integración con funciones, pero no se documenta el formato ni el protocolo soportado.
- Capacidades multilingües: no disponibles; solo se declara inglés.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo de razonamiento (thinking mode): no documentado.

## Casos de uso

- Pruebas de penetración autorizadas: el modelo genera cadenas de explotación, variaciones de payload y metodologías de post-explotación a partir de la descripción de un objetivo, lo que acelera la fase de preparación de un engagement sin salir de la infraestructura del equipo.
- Investigación de vulnerabilidades: dado un identificador CVE y los parches asociados, el modelo razona sobre la causa raíz, el vector de ataque y las condiciones necesarias para la explotación, útil para triaje y priorización.
- Red teaming automatizado: integrado como motor cognitivo del framework CyberStrike AI, puede actuar como agente en tareas encadenadas de reconocimiento, validación y explotación, con la ventaja de ejecutarse en local.
- Formación de equipos defensivos (blue team): permite simular tácticas de adversario persistente avanzado (APT) de forma controlada y generar escenarios de detección y reglas para sistemas SIEM.
- Ingeniería de detección: el modelo puede traducir descripciones de técnicas MITRE ATT&CK a hipótesis de detección y a borradores de reglas, apoyando al equipo de detección en la cobertura de tácticas.
- Auditoría de configuración y cumplimiento: revisión de configuraciones frente a guías CIS y controles NIST, generando recomendaciones de hardening concretas por servicio y sistema operativo.
- Revisión de seguridad de aplicaciones web: análisis de superficies de ataque alineado con el catálogo OWASP y con ASVS, útil en revisiones previas a despliegues.
- Redacción de informes técnicos: conversión de hallazgos crudos en informes estructurados con severidad, evidencia y recomendación de remediación, reutilizando el vocabulario de los marcos citados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, Cybench ni de ninguna otra evaluación, y tampoco se han encontrado resultados en la búsqueda web realizada (que no devolvió resultados relevantes sobre el modelo). El repositorio registra 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que no existe validación externa publicada.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación aritmética a partir de 9,20 mil millones de parámetros, sin medición publicada):

| Cuantización | Tamaño aproximado de los pesos | VRAM total estimada (con contexto moderado) |
|---|---|---|
| FP16 | ~18,4 GB | ~20-22 GB |
| Q8_0 | ~9,8 GB | ~11-13 GB |
| Q6_K | ~7,6 GB | ~9-11 GB |
| Q5_K_M | ~6,5 GB | ~8-10 GB |
| Q4_K_M | ~5,5 GB | ~7-8 GB |
| Q3_K_M | ~4,4 GB | ~6-7 GB |
| Q2_K | ~3,3 GB | ~5 GB |

- GPU recomendadas para cuantizaciones altas (Q6-Q8): NVIDIA A100 40 GB, H100 80 GB, RTX 4090 24 GB, RTX 3090 24 GB, L40S 48 GB.
- GPU para cuantizaciones medias (Q4-Q5): RTX 4080 16 GB, RTX 4070 Ti Super 16 GB, RTX 3080 12 GB, Tesla T4 16 GB.
- Cabe en GPU de consumo: sí. Una RTX 4090 o RTX 3090 de 24 GB puede ejecutar Q8_0 con contexto amplio; tarjetas de 12-16 GB cubren Q4_K_M y Q5_K_M; tarjetas de 8 GB pueden ejecutar Q2_K o Q3_K_M con contexto reducido.
- Ejecución en CPU: viable con llama.cpp en cuantizaciones Q4 y Q3, con memoria de sistema suficiente (se recomienda al menos 16 GB de RAM).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, servidores compatibles con la API de OpenAI (el repositorio está etiquetado como endpoints_compatible). vLLM y TGI tienen soporte limitado o experimental de GGUF, por lo que no son la vía recomendada.
- Latencia y throughput: no disponibles. No se han publicado mediciones y dependen en gran medida de la cuantización, la GPU y la longitud de contexto utilizada.

## Comparativa con modelos similares

No se dispone de datos verificados suficientes en esta ficha para establecer una comparación cuantitativa. La tabla siguiente recoge lo que se conoce con certeza y marca explícitamente lo que no se ha podido verificar.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aapolon/Qwen3.5-9B-EmperoAI-Qwen3.8-Distill-Heretic-CyberStrike-GGUF | 9,20 mil millones | No disponible | No publicado | Apache 2.0 | GGUF en Hugging Face; 0 descargas |
| petruhonk/Qwen3.8-9B-Distill-uncensored-heretic (modelo base) | 9,20 mil millones | No verificado | No verificado | No verificado | Hugging Face |
| WhiteRabbitNeo (familia orientada a ciberseguridad ofensiva) | 13 mil millones y 33 mil millones en sus variantes conocidas | No verificado | No verificado | No verificado | Hugging Face |
| Foundation-Sec-8B (modelo de seguridad de Cisco) | 8 mil millones | No verificado | No verificado | No verificado | Hugging Face |

No se han publicado evaluaciones comparativas que permitan situar este modelo frente a las alternativas de su categoría.

## Limitaciones y advertencias

- Modelo explícitamente descensurado: no aplica rechazos ante peticiones de contenido ofensivo. Su uso en entornos no autorizados puede tener consecuencias legales graves; la propia model card exige adherirse a directrices de uso responsable.
- Riesgo de alucinación elevado en un dominio crítico: el modelo puede generar comandos, rutas, versiones de software o referencias a CVE que no existan o sean incorrectas. Toda salida técnica debe validarse antes de ejecutarse.
- Idioma: solo se declara inglés. No hay soporte multilingüe documentado, por lo que el rendimiento en castellano es impredecible.
- Longitud de contexto desconocida: no se especifica la ventana de contexto, lo que impide planificar tareas de análisis de código o documentos extensos sin pruebas previas.
- Procedencia y linaje poco claros: la nomenclatura del identificador mezcla referencias a Qwen3.5, Qwen3.8 y EmperoAI, y no se corresponde con ninguna versión oficial conocida de Qwen. El nombre del modelo base también es inusual. Esto dificulta verificar la arquitectura real, los datos de preentrenamiento y la cadena de licencias.
- Licencia: se declara Apache 2.0, pero al derivar de un modelo base descensurado cuya licencia y procedencia no se verifican en esta ficha, conviene revisar los términos del modelo base antes de un uso comercial.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de redactar esta ficha, sin benchmarks publicados ni evaluaciones independientes.
- Riesgo de sesgo y toxicidad: un ajuste orientado a contenido ofensivo sin filtros puede reproducir lenguaje agresivo o sesgado si se utiliza fuera del contexto previsto.
- Dependencia del framework propietario: parte de su valor declarado está ligado a CyberStrike AI y a herramientas MCP, lo que puede introducir dependencias externas en producción.
- Formato GGUF únicamente: no se distribuyen pesos en safetensors, lo que limita el reajuste fino y la integración con frameworks de entrenamiento habituales.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Aapolon/Qwen3.5-9B-EmperoAI-Qwen3.8-Distill-Heretic-CyberStrike-GGUF
- Modelo base: https://huggingface.co/petruhonk/Qwen3.8-9B-Distill-uncensored-heretic
- Conjunto de datos de ajuste: https://huggingface.co/datasets/oyildirim/cyberstrike-sft-120k
- Framework CyberStrike AI: https://cyberstrike.io

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre el modelo, papers, blogs o demostraciones asociadas. Los resultados obtenidos correspondían a contenidos no relacionados con el modelo.
