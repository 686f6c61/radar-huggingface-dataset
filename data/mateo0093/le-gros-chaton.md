# mateo0093/le-gros-chaton

## Resumen

Le Gros Chaton es un agente de codificacion para terminal, desarrollado por Mateo sobre la base del modelo Qwen/Qwen3.5-9B. Se trata de un modelo de texto de 8,95 mil millones de parametros con arquitectura hibrida (Gated-Attention + Gated-DeltaNet) que ha sido ajustado mediante tres fases de LoRA SFT para ejecutar bucles de tool-calling dentro de contenedores Docker, planificar, editar archivos, ejecutar comandos y finalizar cuando un verificador de tareas oculto pasa. El modelo se ha evaluado en Terminal-Bench 2.0 alcanzando un 25% de tasa de exito en un piloto de 5 tareas con 5 intentos cada una.

La relevancia de este modelo radica en su tamano compacto (9B) combinado con capacidades de agente autonomo en entornos de terminal, un area donde los modelos grandes suelen destacar pero con costes elevados. Le Gros Chaton demuestra que un ajuste fino especifico sobre una base hibrida moderna puede obtener resultados competitivos en tareas de orquestacion de git y edicion de archivos, aunque muestra debilidades en sintesis multi-archivo y razonamiento sobre efectos secundarios. El modelo es de codigo abierto bajo licencia Apache-2.0 y esta disponible en HuggingFace con pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid Gated-Attention + Gated-DeltaNet (Qwen3.5-9B) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (segun vLLM --max-model-len) |
| Tipos de cuantizacion | bfloat16 (no se documentan otras) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tambien disponible via adaptadores LoRA) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.5-9B, que emplea una arquitectura hibrida que combina capas de atencion con Gated-DeltaNet, una variante de atencion lineal con puertas que permite un manejo eficiente de secuencias largas. Sobre esta base se apilaron tres adaptadores LoRA: el primero (Fable5) para alinear el formato de tool-call (Code-Functional-Mixture, con 91.2% de adaptacion), el segundo para imitar trayectorias reales de agentes sobre tareas de Terminal-Bench 2.0 (SFT con 16K muestras), y el tercero (merge final) que combina base + Fable5 + trayectorias SFT. Se intento una cuarta fase de RLVR con recompensa por diversidad, pero no se incluyo en la version publica. El entrenamiento se realizo sobre el dataset terminal-bench, aunque no se especifican detalles sobre el numero total de tokens o la composicion exacta del dataset.

## Capacidades

- Generacion de texto y conversacion: modelo de completado y chat compatible con la API de Qwen3.5-9B.
- Agente de terminal: ejecuta bucles de tool-calling en contenedores Docker, lee y escribe archivos, ejecuta comandos bash y parsea su salida.
- Gestion de contexto con timeout: realiza compactacion de contexto programada para evitar sobrecargas en secuencias largas.
- Recuperacion de fallos: deteccion de bucles, pivote en callejones sin salida y recuperacion via documentacion.
- Finalizacion por verificacion: se detiene solo cuando la prueba oculta de la tarea pasa (finish-gate).
- Soporte de tool calling y function calling (formato Code-Functional-Mixture).
- Capacidades multilingues: solo ingles (en).

## Casos de uso

- Automatizacion de tareas de integracion continua: el modelo puede orquestar comandos git (como en la tarea fix-git), detectar errores de formato y aplicar correcciones, siendo util en pipelines de CI/CD para resolver problemas menores de codigo de forma autonoma.
- Agente de soporte tecnico en terminal: permite a desarrolladores delegar tareas de diagnostico (por ejemplo, analizar logs, extraer resumenes de rangos de fechas) a un asistente que ejecuta comandos y devuelve resultados.
- Asistente de edicion de archivos en entornos de desarrollo: puede leer multiples archivos, aplicar cambios de formato (como corregir overfull hbox en LaTeX) y verificar si la salida cumple con los criterios de una prueba.
- Entorno de evaluacion de agentes: sirve como base para investigadores que quieran probar nuevos harnesses de agentes o comparar estrategias de SFT/RL en tareas de terminal.
- Despliegue de agentes en contenedores Docker: se integra con vLLM para servir el modelo y usarlo como motor de decision en sistemas de automatizacion que requieren interaccion con bash.
- Prototipado de aplicaciones de chat con tool-calling: al ser compatible con la API de Qwen3.5, se puede usar en aplicaciones que ya usan esa arquitectura, reemplazando el modelo base por este agente especializado.

## Benchmarks y rendimiento

Se han publicado resultados de Terminal-Bench 2.0 en la model card. El modelo fue evaluado en 5 tareas con 5 intentos cada una (5x5):

| Tarea | Tasa de exito |
|---|---|
| fix-git | 3/5 |
| log-summary-date-ranges | 0/5 |
| overfull-hbox | 0/5 |
| regex-log | 0/5 |
| count-dataset-tokens | 0/5 |
| **Total** | **3/25 (25%)** |

El autor menciona que los modelos pequenos promedian alrededor de 15% en TB-2.0, mientras que modelos frontier con stacks de agentes alcanzan ~36%. No se proporcionan otros benchmarks como MMLU o HumanEval.

## Requisitos de hardware

- VRAM estimada: el modelo en bf16 ocupa aproximadamente 17.9 GB en disco, por lo que se requiere al menos 20 GB de VRAM para inferencia sin cuantizacion adicional. No se documentan versiones cuantizadas.
- GPU recomendadas: se menciona un setup con AMD MI300X en el script de reproduccion (`setup_mi300x.sh`), lo que indica compatibilidad con ROCm. En el lado NVIDIA, una GPU con 24 GB de VRAM (por ejemplo, RTX 4090 o A100) podria albergar el modelo.
- En consumer GPU: es posible ejecutarlo en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con bf16, aunque no se garantiza rendimiento optimo. No se documentan cuantizaciones GGUF para reducir requisitos.
- Opciones de despliegue: vLLM (recomendado, con `vllm>=0.27` que soporta nativamente la arquitectura Qwen3_5ForCausalLM), Transformers con `AutoModelForCausalLM`, y el harness `eval/tb_agent.py` del repositorio.
- Latencia y throughput: no se proporcionan datos concretos; dependen del hardware y del tamaño de contexto.

## Comparativa con modelos similares

No se dispone de informacion comparativa con otros modelos de agente de codificacion de tamano similar (por ejemplo, modelos de 7B-9B como DeepSeek-Coder-V2-Lite o Qwen2.5-Coder-7B). La model card no incluye resultados de benchmarks alternativos ni comparaciones directas. Solo se menciona que en Terminal-Bench 2.0 los modelos pequenos promedian ~15%, y que el modelo alcanza 25%, pero no se listan nombres concretos. Por tanto, esta seccion se considera no disponible.

## Limitaciones y advertencias

- Sesgos y alucinaciones: no se han evaluado sesgos sociales ni se documentan tasas de alucinacion. Al ser un modelo entrenado principalmente en tareas de terminal, puede generar comandos incorrectos o inventar rutas de archivo si no se controla el entorno.
- Limitaciones de contexto: la longitud maxima de 32K tokens puede ser insuficiente para tareas que requieren leer muchos archivos o mantener historial largo de ejecucion.
- Idioma: solo ingles. No soporta otros idiomas para instrucciones de agente.
- Restricciones de licencia: Apache-2.0 permite uso comercial sin restricciones, pero debe verificarse la licencia del modelo base Qwen3.5-9B (aunque se hereda Apache-2.0 segun el autor).
- Caveat de produccion: el modelo es un prototipo de investigacion con un rendimiento limitado en tareas complejas (0/5 en 4 de las 5 tareas evaluadas). Para uso en produccion, se recomienda una evaluacion mas amplia y posiblemente cuantizacion o ajuste adicional.
- Limitaciones de entrenamiento: no se especifican los datos de entrenamiento completos ni el proceso de filtrado, por lo que puede haber sesgos en las trayectorias de agente.

## Enlaces

- HuggingFace: https://huggingface.co/mateo0093/le-gros-chaton
- Adapter Fable5: https://huggingface.co/mateo0093/le-gros-chaton-qwen
- Repositorio GitHub: https://github.com/Mateooo93/le-gros-chaton
- Dataset Terminal-Bench: no se proporciona enlace directo, pero se referencia en la model card.
- Base model: https://huggingface.co/Qwen/Qwen3.5-9B (no se incluye enlace directo, pero se menciona como base_model)
