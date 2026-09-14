# internlm/Atria-Dawn-Preview

## Resumen

Atria Dawn Preview es un modelo agentico en version preview desarrollado por el Shanghai Artificial Intelligence Laboratory (cuenta de HuggingFace `internlm`), construido sobre el modelo fundacional MoE GLM-5.2 de 744.000 millones de parametros. El checkpoint publicado en safetensors declara 753.329.940.480 parametros totales y una longitud de contexto de 256.000 tokens, con un repositorio de 1.506,7 GB. La model card lo presenta como un modelo instruct y distribuye ademas una variante cuantizada a FP8.

El modelo esta disenado para escenarios de investigacion e ingenieria que requieren comprension continua del entorno, uso de herramientas y resolucion de tareas en multiples pasos, con el objetivo de convertir preguntas abiertas en resultados ejecutables, verificables y reproducibles. Organiza sus capacidades en cuatro ejes: descubrimiento (recuperacion y organizacion de evidencia, investigacion profunda, planes experimentales), creacion (software, aplicaciones interactivas, juegos, visualizacion de datos, sistemas de ML), entrega (transformacion de documentos y requisitos de diseno en informes y presentaciones) y ciberseguridad (analisis de problemas, validacion de vulnerabilidades, aplicacion y revalidacion de correcciones en entornos autorizados).

Su relevancia actual reside en que la propia model card lo situa frente a modelos frontera como DeepSeek V4 Pro 0813, KIMI K3, Qwen 3.8 Max, GLM 5.3, GPT 5.6 sol y Claude Opus 5 en benchmarks agenticos (AutomationBench, Workspace-Bench, SWE-bench Pro, Terminal-Bench 2.1) y lo publica bajo licencia MIT, lo que habilita uso comercial sin las restricciones tipicas de los modelos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (etiqueta de HuggingFace: `glm_moe_dsa`); construido sobre el modelo fundacional GLM-5.2 |
| Parametros totales | 753.329.940.480 (~753,3 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | FP8 (variante oficial `Atria-Dawn-Preview-FP8`); pesos en safetensors; no se documentan GGUF ni otras cuantizaciones |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible identifica el modelo como una arquitectura de mezcla de expertos (MoE) construida sobre el modelo fundacional GLM-5.2, de 744.000 millones de parametros, y etiquetada en HuggingFace como `glm_moe_dsa`. El checkpoint publicado en safetensors contiene 753.329.940.480 parametros, ligeramente por encima de la cifra declarada para el modelo base. No se especifican en la model card el numero de tokens de entrenamiento, la composicion del dataset, el numero de expertos, los parametros activos por token ni el ratio de activacion.

Tampoco se detallan las etapas de alineacion (RLHF, DPO u otras tecnicas de preferencia) ni innovaciones de atencion concretas mas alla de la etiqueta de arquitectura. La model card menciona explicitamente que se trata de una version preview y que el modelo combina objetivos de tarea con retroalimentacion del entorno para resolver problemas de forma iterativa, incluyendo recuperacion ante fallos, pero sin ofrecer detalles tecnicos de implementacion. La unica informacion adicional de despliegue es la existencia de una variante cuantizada a FP8 con la misma ventana de contexto de 256K.

## Capacidades

- Generacion de texto y razonamiento en tareas abiertas, orientado a la resolucion de problemas verificables y reproducibles.
- Uso de herramientas y function calling: el modelo reporta 77,0 en BFCL v4, la puntuacion mas alta de la tabla de evaluacion publicada.
- Ejecucion de agentes y razonamiento multi-paso: AutomationBench 53,8, SkillsBench 66,4 y Workspace-Bench 65,0.
- Investigacion profunda y busqueda: DeepSearchQA 96,0, BrowseComp 92,5, WideSearch 81,9 y DeepResearch Bench II 51,1.
- Ingenieria de software y terminal: SWE-bench Pro 59,6 y Terminal-Bench 2.1 78,3.
- Machine learning automatizado y ciencia de datos: MLE-bench Lite 86,2.
- Ciberseguridad: CyberGym 86,5, con analisis de problemas, validacion de vulnerabilidades, aplicacion de correcciones y revalidacion en entornos autorizados.
- Generacion de entregables estructurados: informes, presentaciones y documentos a partir de requisitos de diseno y datos (Workspace-Bench-Lite 68,2).
- Capacidad multilingue limitada a chino e ingles.
- No se documentan capacidades de vision, audio ni modos de pensamiento explicitos en la informacion disponible.

## Casos de uso

- Agentes de investigacion profunda: el modelo puede encadenar busquedas, recuperar evidencia y sintetizar conclusiones con referencias, apoyandose en sus 256K tokens de contexto para mantener el hilo de informes largos y en sus resultados en DeepSearchQA (96,0) y BrowseComp (92,5).
- Automatizacion de mantenimiento de software: con SOPORTE de tool calling y 59,6 en SWE-bench Pro, puede integrarse en pipelines de CI/CD para leer issues, localizar el codigo afectado, proponer parches y ejecutar los tests del repositorio en un bucle de correccion.
- Operaciones en terminal y entornos sandbox: sus 78,3 en Terminal-Bench 2.1 lo hacen adecuado para agentes que ejecutan comandos, diagnostican fallos de entorno y recuperan el estado tras errores en maquinas remotas.
- Analisis de seguridad ofensiva autorizada: con 86,5 en CyberGym, puede emplearse en programas de bug bounty internos o ejercicios de red team para reproducir vulnerabilidades, validar el impacto de un parche y reejecutar la prueba de concepto.
- Generacion de entregables de oficina: a partir de datos brutos y requisitos de diseno, produce informes, hojas de calculo y presentaciones; su 68,2 en Workspace-Bench-Lite apunta a flujos de trabajo ofimaticos completos mas que a generacion de texto aislada.
- Pipelines de machine learning automatizados: con 86,2 en MLE-bench Lite puede plantear la formulacion del problema, escribir el codigo de entrenamiento, ejecutar experimentos y analizar resultados de forma iterativa.
- Atencion al cliente y back-office bancario: su 41,2 en la categoria Banking de τ³-Bench indica que puede gestionar conversaciones multi-turno con herramientas de consulta de cuentas, aunque con margen de mejora frente a alternativas en ese dominio.
- Construccion de aplicaciones y prototipos interactivos: generacion de interfaces, juegos o visualizaciones de datos a partir de una descripcion textual, dentro del eje de "creacion" declarado por el autor.

## Benchmarks y rendimiento

Resultados publicados en la model card. Los valores se reproducen tal cual; las celdas con "-" indican que el modelo comparado no reporta resultado en ese benchmark.

| Benchmark | Atria Dawn Preview | DeepSeek V4 Pro 0813 | KIMI K3 | Qwen 3.8 Max | GLM 5.3 | GPT 5.6 sol | Claude Opus 5 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| AutomationBench | 53,8 | 41,7 | 45,9 | 49,7 | 49,2 | 45,7 | 49,4 |
| BFCL v4 | 77,0 | 71,4 | 69,1 | - | 74,1 | - | - |
| CyberGym | 86,5 | 83,3 | 78,7 | 73,8 | 84,5 | 83,6 | - |
| DeepSearchQA | 96,0 | - | 95,9 | - | 94,7 | 93,2 | - |
| Workspace-Bench-Lite | 68,2 | 58,1 | 65,8 | 67,4 | 67,7 | 60,5 | 70,1 |
| BrowseComp | 92,5 | 83,4 | 91,2 | - | - | 92,2 | 90,8 |
| SkillsBench | 66,4 | 65,0 | 51,9 | 66,7 | 63,3 | 62,5 | 63,7 |
| Workspace-Bench | 65,0 | 55,7 | 60,6 | 63,9 | 63,9 | 56,0 | 65,8 |
| MLE-bench Lite | 86,2 | 86,8 | 85,8 | 81,3 | 80,8 | 88,9 | 88,0 |
| WideSearch | 81,9 | - | 79,6 | 81,9 | 82,7 | 83,3 | - |
| DeepResearch Bench II | 51,1 | 46,6 | 51,3 | 49,2 | 52,7 | 50,7 | 54,1 |
| τ³-Bench Banking | 41,2 | 44,3 | 37,1 | 55,2 | 40,2 | 46,9 | 48,7 |
| Terminal-Bench 2.1 | 78,3 | 78,7 | - | 89,3 | 85,4 | 85,1 | 90,2 |
| GDPval | 1583 | 1517 | 1611 | 1722 | 1667 | 1682 | 1768 |
| SWE-bench Pro | 59,6 | 58,3 | 61,6 | 65,1 | 60,3 | 61,4 | 74,7 |
| JobBench | 50,3 | 54,1 | 54,3 | 52,7 | 58,2 | 45,4 | 68,0 |

La model card menciona ademas un grafico de evaluacion (`assets/evaluation.png`) sin anotaciones completas. No se detallan en el texto disponible las condiciones de evaluacion (numero de intentos, temperatura, uso de herramientas en cada benchmark).

## Requisitos de hardware

Las cifras de esta seccion son estimaciones calculadas a partir del numero de parametros declarado (753,3 mil millones) cuando la model card no ofrece datos explicitos.

- Pesos en BF16: aproximadamente 1.506 GB solo en pesos, coherente con el tamano de repositorio de 1.506,7 GB.
- Pesos en FP8: aproximadamente 753 GB, segun la variante oficial `Atria-Dawn-Preview-FP8`.
- Pesos en cuantizacion de 4 bits: aproximadamente 377 GB teoricos; no hay checkpoint de 4 bits publicado por el autor, por lo que requeriria cuantizacion propia.
- GPU recomendadas: para FP8 se necesitan al menos 10 GPU de 80 GB solo para los pesos; un despliegue realista con margen para cache KV a 256K pasa por 16 x H100 80 GB o 16 x A100 80 GB. En BF16 serian necesarias 24 x H100 80 GB como minimo y 32 para operar con holgura.
- Cabe en GPU de consumo: no. Una RTX 4090 de 24 GB no puede alojar el modelo ni siquiera en 4 bits; se requeriria agregacion de muchas GPU o volcado a RAM/NVMe con penalizacion severa de latencia.
- Opciones de despliegue: la model card indica soporte de despliegue local y de acceso hospedado por region, pero no especifica frameworks concretos (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput estimados: no disponible.
- Nota adicional: la ventana de 256K tokens implica una cache KV muy grande; en BF16 puede superar los cientos de GB en funcion del numero de cabezas y capas, por lo que en produccion conviene planificar paralelismo tensorial y cuantizacion de la cache.

## Comparativa con modelos similares

La tabla de comparacion de la model card incluye seis sistemas frontera, pero no aporta especificaciones tecnicas de ellos (parametros, contexto o licencia).

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos disponibles |
|---|---|---|---|---|---|
| Atria Dawn Preview | 753,3 B totales (activos no disponibles), MoE sobre GLM-5.2 de 744 B | 256K | MIT | Pesos abiertos en HuggingFace y ModelScope, version FP8 | Completos (specs y benchmarks) |
| DeepSeek V4 Pro 0813 | no disponible | no disponible | no disponible | no disponible | Solo resultados de benchmark |
| KIMI K3 | no disponible | no disponible | no disponible | no disponible | Solo resultados de benchmark |
| Qwen 3.8 Max | no disponible | no disponible | no disponible | no disponible | Solo resultados de benchmark |
| GLM 5.3 | no disponible | no disponible | no disponible | no disponible | Solo resultados de benchmark |
| GPT 5.6 sol | no disponible | no disponible | no disponible | no disponible | Solo resultados de benchmark |
| Claude Opus 5 | no disponible | no disponible | no disponible | no disponible | Solo resultados de benchmark |

En terminos de rendimiento relativo, Atria Dawn Preview lidera la tabla publicada en BFCL v4 (77,0), CyberGym (86,5), DeepSearchQA (96,0), BrowseComp (92,5), Workspace-Bench-Lite (68,2), Workspace-Bench (65,0) y DeepResearch Bench II frente a varios de los modelos listados, mientras que queda por detras en JobBench (50,3), SWE-bench Pro (59,6), Terminal-Bench 2.1 (78,3), GDPval (1583) y τ³-Bench Banking (41,2). La comparacion no es verificable de forma independiente porque la model card no documenta la metodologia de evaluacion.

## Limitaciones y advertencias

- Version preview: el propio autor etiqueta el modelo como version preliminar, sin garantia de estabilidad ni de continuidad del checkpoint.
- Parametros activos no declarados: al no publicarse la cifra de parametros activos por token, no es posible estimar con precision el coste real de inferencia ni el throughput esperado.
- Datos de entrenamiento opacos: no se especifican tokens de entrenamiento, composicion del dataset, etapas de alineacion ni procesos de filtrado, lo que dificulta auditar sesgos.
- Sesgos conocidos: no disponible en la informacion proporcionada. Cabe esperar sesgos derivados del corpus, mayoritariamente en chino e ingles.
- Riesgo de alucinacion: no se documenta ninguna mitigacion especifica; en tareas de investigacion y ciberseguridad la verificacion humana de los resultados es imprescindible, especialmente porque varios benchmarks miden respuestas correctas sin penalizar afirmaciones no verificadas.
- Cobertura idiomatica limitada: solo chino e ingles declarados; no hay soporte oficial de castellano, por lo que su uso en produccion en espanol no esta garantizado.
- Idiomas en la model card en ingles: buena parte de la documentacion auxiliar puede estar solo en chino o en ingles.
- Rendimiento desigual por dominio: los resultados son fuertes en busqueda y automatizacion general, pero mas debiles en banca (41,2 en τ³-Bench Banking) y en tareas de empleo generico (50,3 en JobBench), lo que desaconseja su despliegue sin evaluacion propia en esos dominios.
- Tareas de ciberseguridad: la model card restringe explicitamente su uso a entornos autorizados; el uso ofensivo no autorizado queda fuera del proposito declarado.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, pero el modelo base GLM-5.2 subyacente podria tener condiciones propias que conviene verificar antes de explotarlo comercialmente.
- Requisitos de infraestructura muy altos: 1.506,7 GB de repositorio y necesidad de multiples GPU de 80 GB, lo que excluye el despliegue en hardware de consumo.
- Ausencia de senales de adopcion: 13 likes y 0 descargas en el momento de la consulta, sin resultados de benchmarks independientes que reproduzcan las cifras publicadas.
- Contexto de 256K: util para documentos largos, pero con un coste de memoria de cache KV que puede dominar el presupuesto de hardware.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/internlm/Atria-Dawn-Preview
- Variante FP8 en HuggingFace: https://huggingface.co/internlm/Atria-Dawn-Preview-FP8
- Modelo en ModelScope: https://www.modelscope.cn/models/Shanghai_AI_Laboratory/Atria-Dawn-Preview
- Variante FP8 en ModelScope: https://www.modelscope.cn/models/Shanghai_AI_Laboratory/Atria-Dawn-Preview-FP8
- README en chino: https://huggingface.co/internlm/Atria-Dawn-Preview/blob/main/README_CN.md
- Web oficial: https://atria-asi.ai/
- Repositorio GitHub: https://github.com/atria-asi/Atria-Dawn-Preview
- Cuenta de X/Twitter: https://x.com/AtriaASI
- Servidor de Discord: https://discord.gg/jT8SDt8up

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con el modelo; los enlaces obtenidos correspondian a articulos de uniformes militares y no se han incluido por no ser relevantes.
