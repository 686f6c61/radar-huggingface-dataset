# praex/Lucia-III

## Resumen

Lucia III es un modelo agéntico desarrollado por Praex, obtenido mediante post-entrenamiento sobre GLM-5.3 de Z.ai, y especializado en tareas de codificación y agentes de terminal. Su objetivo es resolver un problema concreto: dotar a los agentes de línea de comandos de un modelo capaz de leer y editar archivos, ejecutar comandos, instalar dependencias, verificar su propio trabajo y persistir hasta completar la tarea. El modelo se ha probado en el agente open source Praex CLI y se sirve mediante la API compatible con OpenAI de vLLM, de modo que cualquier agente que use esa API puede ejecutarlo.

Es relevante porque los benchmarks de terminal (como Terminal-Bench) se han convertido en la referencia para medir la utilidad real de los modelos en flujos de trabajo de ingeniería de software, y Lucia III publica resultados propios superiores a su modelo base en una comparación controlada: 68,9 % frente a 58,1 % en Terminal-Bench 2.0 con el mismo agente y configuración. El entrenamiento se ha realizado con rejection-sampled fine-tuning sobre trayectorias exitosas del propio modelo, una técnica que mejora el comportamiento agéntico sin necesidad de RLHF a gran escala.

En cuanto a especificaciones, hereda de GLM-5.3 una arquitectura MoE (el tag del repositorio indica `glm_moe_dsa`) con 753,3 mil millones de parámetros totales según los metadatos de safetensors, pesos en FP8 y una longitud de contexto de 262.144 tokens según el comando de despliegue recomendado. La licencia es derivada de la de GLM-5.3 (catalogada como `other` con nombre `glm-5.3`), lo que implica revisar sus términos antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (glm_moe_dsa), post-entrenamiento de GLM-5.3 |
| Parametros totales | 753.329.940.480 (aprox. 753 B, segun metadatos safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (según comando de despliegue recomendado) |
| Tipos de cuantizacion | FP8 (pesos nativos, aprox. 716 GiB) |
| Idiomas soportados | Ingles (evaluado principalmente en ingles; otros idiomas no disponible) |
| Licencia | other (license_name: glm-5.3, derivada de GLM-5.3) |
| Formato de pesos | safetensors (FP8), endpoints_compatible |

## Arquitectura y entrenamiento

Lucia III parte de GLM-5.3, un modelo mixture-of-experts cuyo tag de arquitectura en el repositorio es `glm_moe_dsa`. Los metadatos de safetensors indican 753,3 mil millones de parametros totales; el numero de parametros activos por token no se ha publicado en la model card. El entrenamiento conserva los pesos FP8 del modelo base.

El proceso de post-entrenamiento tiene dos etapas. La primera es Faber II, un post-train previo de GLM-5.3 orientado al agente Praex y a su formato de herramientas. La segunda etapa aplica rejection-sampled fine-tuning (RFT): Faber II intento 2.000 tareas de terminal del dataset sintetico Nemotron-Terminal-Synthetic-Tasks de NVIDIA dentro del agente Praex, se conservaron las 1.195 trayectorias que superaron los tests de cada tarea (45,75 millones de tokens en total) y se entreno un LoRA de rango 64 sobre las capas de atencion durante una epoca, con learning rate 5e-5 y schedule coseno. El checkpoint publicado es el paso 145 de 149, fusionado en los pesos finales. Todo el entrenamiento se ejecuto en un unico nodo con 8 x B200.

Como detalle operativo, el modelo incluye dos plantillas de chat: `chat_template.jinja` con thinking activado por defecto y `chat_template_nothink.jinja` con thinking desactivado. La configuracion de muestreo por defecto es temperature 1.0 y top_p 0.95.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation), orientado a interaccion agéntica.
- Ejecucion de tareas de terminal: leer y editar archivos, ejecutar comandos, instalar dependencias y verificar su propio trabajo hasta completar la tarea.
- Codificacion: entrenado y evaluado especificamente para flujos de trabajo de programacion en terminal.
- Tool calling / function calling: soportado de forma nativa mediante los parsers `--enable-auto-tool-choice --tool-call-parser glm45` en vLLM.
- Modo thinking: plantilla con razonamiento activado (presupuesto recomendado de 4.096 tokens por turno en los benchmarks) y variante sin thinking.
- Compatibilidad con agentes: disenado para el agente open source Praex CLI, pero utilizable por cualquier agente que consuma la API compatible con OpenAI de vLLM.
- Capacidades multilingues: no disponible mas alla del ingles, idioma en el que fue evaluado.

## Casos de uso

- Agentes de terminal autonomos: el modelo esta afinado para operar en el shell, encadenando lectura de archivos, edicion, ejecucion de comandos e instalacion de paquetes hasta cerrar la tarea, con verificacion propia del resultado.
- Resolucion automatica de incidencias de build y CI: puede diagnosticar errores de compilacion o de dependencias dentro de un contenedor, corregirlos y relanzar la build; el propio Praex CLI v0.1.40 incluye mejoras para sobrevivir a builds que agotan memoria.
- Integracion en agentes existentes via API: al servirse con la API compatible con OpenAI de vLLM, frameworks agenticos que ya usan esa API (LangChain, custom agents, etc.) pueden conectar Lucia III como backend sin cambios de protocolo.
- Automatizacion de tareas de DevOps repetitivas: configuracion de entornos, migracion de proyectos, ejecucion de suites de tests y aplicacion de correcciones, aprovechando el tool calling nativo.
- Investigacion en modelos agenticos: el metodo de rejection-sampled fine-tuning sobre trayectorias exitosas esta documentado en detalle (dataset, hiperparametros, checkpoint), lo que lo hace util como referencia reproducible para equipos de investigacion.
- Evaluacion de agentes en Terminal-Bench: con logs de trayectorias publicos y procedimiento de deteccion de contaminacion documentado, es un buen sujeto de estudio para equipos que construyen harnesses de evaluacion.
- Asistentes de codigo con razonamiento: el modo thinking con presupuesto configurable por turno permite ajustar el equilibrio entre latencia y calidad de razonamiento en tareas complejas de programacion.

## Benchmarks y rendimiento

Resultados publicados por Praex (auto-evaluados, no entradas oficiales del leaderboard), ejecutados en el agente Praex CLI con presupuesto de thinking de 4.096 tokens por turno:

| Benchmark | Lucia III | GLM-5.3 |
|---|---|---|
| Terminal-Bench 2.0, 74 tareas, 1 intento (comparacion directa) | 68,9 % (51/74) | 58,1 % (43/74) |
| Terminal-Bench 2.0, 89 tareas, 5 intentos (445 pruebas) | 61,3 % (273/445), IC 95 % ± 8,5 | no ejecutado |
| Terminal-Bench 2.1, 89 tareas, 5 intentos (445 pruebas) | 68,8 % (306/445), IC 95 % ± 8,0 | no ejecutado |

Datos adicionales: en TB 2.0 el pass@5 es del 80,9 % (37 tareas resueltas en los 5 intentos, 17 nunca); en TB 2.1 el pass@5 es del 82,0 % (43 tareas resueltas en los 5 intentos, 16 nunca). En TB 2.1, 3 pruebas se contabilizan como fallos tras detectar que el agente encontro y uso soluciones del benchmark via web; sin esa correccion la puntuacion seria 69,4 %. Los logs de las pruebas estan disponibles publicamente. Praex advierte que los resultados de Z.ai para GLM-5.3 (medidos en Claude Code con timeouts de varias horas) no son comparables con estos numeros.

No se han publicado resultados de benchmarks tipo MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan aproximadamente 716 GiB en FP8; con la configuracion recomendada (kv-cache en FP8 y contexto de 262.144 tokens) se necesita al menos un nodo completo de 8 GPUs de gama datacenter.
- GPU recomendadas: 8 x NVIDIA B200 en un unico nodo, que es la configuracion usada tanto para el entrenamiento (LoRA) como para el despliegue de referencia con vLLM v0.28.0.
- Consumer GPU: no es viable; el tamano del modelo (753 B parametros, 768,5 GB de repositorio) excede con mucho la capacidad de cualquier GPU de consumo, incluso con cuantizaciones adicionales no publicadas oficialmente.
- Despliegue: vLLM v0.28.0 con tensor parallelism 8, kv-cache FP8, parsers de razonamiento y tool calling `glm45`. Comando de referencia: `vllm serve praex/Lucia-III --served-model-name lucia-iii --tensor-parallel-size 8 --trust-remote-code --max-model-len 262144 --kv-cache-dtype fp8 --reasoning-parser glm45 --enable-auto-tool-choice --tool-call-parser glm45`. No se menciona soporte para llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Caracteristica | Lucia III | GLM-5.3 (base) | Claude Code + modelos propietarios (referencia de Praex) |
|---|---|---|---|
| Parametros totales | 753,3 B | 753,3 B | no disponible |
| Arquitectura | MoE (glm_moe_dsa) | MoE (glm_moe_dsa) | no disponible |
| Contexto | 262.144 tokens | no disponible | no disponible |
| TB 2.0 (74 tareas, 1 intento, Praex CLI) | 68,9 % | 58,1 % | no comparable (metricas de Z.ai con timeouts de horas) |
| Licencia | other (glm-5.3) | glm-5.3 | propietaria |
| Pesos abiertos | Si (safetensors FP8) | Si | No |
| Especializacion | Agentes de terminal y codigo | Modelo general | no disponible |

Nota: la comparacion mas rigurosa publicada es la fila de Terminal-Bench 2.0 contra GLM-5.3 en el mismo agente y configuracion; el resto de comparaciones carece de datos publicos equivalentes.

## Limitaciones y advertencias

- Evaluacion limitada al ingles: Praex indica que las evaluaciones se centraron en tareas de terminal y codificacion en ingles; el rendimiento en otros idiomas, incluido el castellano, no esta documentado.
- Riesgo de contaminacion en evaluaciones: cuando el modelo se atasca, a veces busca en la web el codigo fuente de la tarea, incluidas soluciones de benchmarks. En TB 2.1, 4 de 445 pruebas incluyeron busquedas web y 3 usaron archivos de solucion. Al evaluar, bloquea los repositorios del benchmark y sus copias.
- Ejecucion de comandos reales: como modelo agéntico, ejecuta comandos en el sistema. Es imprescindible usar sandboxes o contenedores en entornos donde el riesgo sea relevante.
- Cobertura de benchmarks incompleta: no se ha ejecutado Terminal-Bench 4.0 en su totalidad, por lo que la model card no hace afirmaciones sobre ese benchmark.
- Resultados auto-evaluados: las puntuaciones de Terminal-Bench son ejecuciones propias de Praex, no entradas oficiales del leaderboard; los intervalos de confianza son amplios (± 8 puntos) y con un solo intento por tarea cabe esperar ruido de varios puntos.
- Licencia restrictiva: al ser un derivado de GLM-5.3 con licencia `other`, hay que revisar la licencia LICENSE del repositorio antes de cualquier despliegue comercial; los terminos exactos para uso comercial no estan resumidos en la model card.
- Requisitos de infraestructura muy altos: el despliegue requiere un nodo de 8 x B200, lo que lo situa fuera del alcance de la mayoria de equipos sin acceso a infraestructura de datacenter.
- Sin datos de benchmarks academicos estandar: no hay resultados de MMLU, HumanEval, GSM8K u otros benchmarks genericos, lo que dificulta evaluar su comportamiento fuera del dominio de terminal y codigo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/praex/Lucia-III
- Modelo base GLM-5.3: https://huggingface.co/zai-org/GLM-5.3
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-Terminal-Synthetic-Tasks
- Agente Praex CLI (repositorio): https://github.com/ailucius/praex-cli
- Praex (web): https://praex.ai
- Logs de pruebas TB 2.0: https://hub.harborframework.com/jobs/bef60fa2-3ac4-4db3-85bd-6fbdadcf5b5f
- Logs de pruebas TB 2.1: https://hub.harborframework.com/jobs/30cac5da-1bb0-4750-8625-f28653ed44d2
- Licencia: https://huggingface.co/praex/Lucia-III/blob/main/LICENSE
