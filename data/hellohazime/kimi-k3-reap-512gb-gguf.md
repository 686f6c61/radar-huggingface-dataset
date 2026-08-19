# hellohazime/Kimi-K3-REAP-512GB-GGUF

## Resumen

Kimi-K3-REAP-512GB-GGUF es una versión podada mediante expert-pruning del modelo Kimi-K3 de Moonshot AI, un modelo de lenguaje de 2,8 billones de parámetros con arquitectura MoE (Mixture of Experts) de 896 expertos por capa. El autor, hellohazime, ha aplicado la técnica REAP para eliminar los expertos menos relevantes en tareas de inglés y código, reduciendo el peso total hasta caber en una máquina con 512 GB de memoria unificada. El resultado son dos builds: REAP640-IQ1_S (640 expertos, ~441 GB) y REAP576-IQ2_XXS (576 expertos, ~478 GB), ambos en formato GGUF y derivados de las cuantizaciones dinámicas de Unsloth.

El modelo resuelve el problema práctico de ejecutar localmente un modelo de frontera de 3T-class en un solo equipo, sin necesidad de clústeres distribuidos. Es relevante porque demuestra que la poda de expertos puede preservar gran parte de la capacidad del modelo original para tareas de código y razonamiento, a la vez que reduce drásticamente los requisitos de memoria. La ventana de contexto se mantiene en 1M tokens, heredada del modelo base, y el rendimiento en tareas agénticas como SWE-Lancer es notable, aunque con limitaciones importantes en idiomas distintos del inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) |
| Parametros totales | 2,8 billones (original); tras poda no disponible |
| Parametros activos | no disponible (640/896 o 576/896 expertos por capa) |
| Longitud de contexto | 1M tokens (heredado del modelo base) |
| Tipos de cuantizacion | IQ1_S (REAP640) e IQ2_XXS (REAP576), ambos de Unsloth |
| Idiomas soportados | Ingles y codigo principalmente; chino y japones degradados por la poda |
| Licencia | modified-mit (Moonshot AI) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Kimi-K3 de Moonshot AI es un MoE de 2,8T parametros con 896 expertos por capa, que incorpora dos innovaciones clave: Kimi Delta Attention (KDA), un mecanismo de atencion que reduce el coste computacional en contextos largos, y Attention Residuals (AttnRes), que mejora la estabilidad del entrenamiento. Ademas, tiene capacidades nativas de vision y un contexto de 1M tokens. La version REAP parte de las cuantizaciones dinamicas de Unsloth (que a su vez derivan de los pesos originales de Moonshot) y aplica poda de expertos basada en saliencia: se evalua que expertos son menos relevantes para tareas de ingles y codigo y se eliminan, manteniendo un subconjunto de 640 o 576 expertos por capa segun la build. La calibracion se realizo con un corpus en ingles y codigo, lo que explica la degradacion en otros idiomas. No se dispone de informacion detallada sobre el entrenamiento original del modelo base (tokens, dataset, metodos de alineacion) en la documentacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento complejo en ingles y codigo, con capacidad para tareas agénticas de larga duracion.
- Soporte de tool calling / function calling, aunque con cierta inestabilidad ocasional (en pruebas, 1 de 4 replays filtro marcadores XTML en los argumentos).
- Capacidad agéntica multi-step: validado en tareas SWE-Lancer de tipo IC-SWE Diamond, resolviendo 7 de 8 tareas con la build REAP576.
- Contexto largo de 1M tokens, util para documentos extensos y repositorios de codigo completos.
- Vision nativa (del modelo base), aunque la poda puede afectar a esta capacidad; no se han publicado evaluaciones especificas.
- Multilingue limitado: ingles y codigo son los idiomas principales; chino y japones quedan degradados (perplexity de 7,93 y 19,46 respectivamente en la build REAP640).

## Casos de uso

- Desarrollo de software autonomo: el modelo puede resolver tareas reales de programacion en el benchmark SWE-Lancer, generando parches y commits validados. Es adecuado para entornos de integracion continua donde se necesite un agente que corrija bugs o implemente funcionalidades sin intervencion humana.
- Asistente de codigo con contexto largo: gracias a su ventana de 1M tokens, puede analizar repositorios completos, mantener el estado de multiples archivos y ofrecer sugerencias coherentes en proyectos grandes.
- Automatizacion de tareas de conocimiento: capaz de procesar documentacion tecnica extensa, extraer informacion y generar informes o resumenes en ingles, con razonamiento multi-paso.
- Agente de investigacion y analisis: puede combinar busquedas en la web, lectura de articulos y generacion de sintesis, aprovechando su capacidad de tool calling y razonamiento.
- Despliegue en estaciones de trabajo de alta gama: pensado para equipos como Mac Studio M3 Ultra con 512 GB de memoria unificada, donde corre completamente en memoria sin necesidad de GPU dedicada.
- Prototipado de agentes de codigo en produccion: su licencia permisiva (modified-mit) y su formato GGUF permiten integrarlo en pipelines de CI/CD o en herramientas de desarrollo internas, aunque con las limitaciones de velocidad (~3 tok/s decode) que exigen una planificacion cuidadosa de la latencia.

## Benchmarks y rendimiento

La informacion disponible incluye resultados del benchmark SWE-Lancer (tareas IC-SWE Diamond) y medidas de perplexity. No se han publicado resultados de MMLU, HumanEval o GSM8K en la documentacion proporcionada.

Resultados SWE-Lancer (un intento por tarea, temperatura 1.0):

| Tarea | K2.7-Q2 (341 GB) | REAP640 | REAP576 |
|---|---|---|---|
| 28096_836 | pass | pass | pass ($500) |
| 18827_741 | pass | pass | pass ($1,000) |
| 29618_781 | pass | pass | pass ($500) |
| 24508_791 | fail | pass ($1,000) | pass ($1,000) |
| 27353_776 | fail | pass ($500) | fail |
| 14294 | fail | fail | pass ($4,000) |
| 15815_1 | fail | fail | pass ($4,000) |
| 15925 | fail | fail | pass ($2,000) |

REAP576 resolvio 7/8 tareas con $13,000 ganados; REAP640 resolvio 5/8 con $3,500. Perplexity held-out de REAP640: code 2,00 / en 7,44 / zh 7,93 / ja 19,46. El autor advierte que cada celda es un unico intento y que la variabilidad entre ejecuciones es alta (por ejemplo, el modelo completo sin podar fallo las tres tareas inferiores en una primera ejecucion, pero las resolvio en un segundo intento etiquetado).

## Requisitos de hardware

- Memoria: 512 GB de RAM o memoria unificada (ambas builds estan disenadas para caber completamente en ese presupuesto).
- GPU: no requiere GPU dedicada en Apple Silicon (usa Metal); en sistemas NVIDIA se puede compilar con CUDA. Se ha probado en Mac Studio M3 Ultra 512 GB.
- Rendimiento medido: ~3,0 tok/s decode y ~48 tok/s prefill con descarga completa en Metal.
- Opciones de despliegue: llama.cpp (fork de Unsloth con soporte para Kimi-K3), vLLM o SGLang (segun el blog de explainx.ai). El modelo esta en formato GGUF, compatible con herramientas que soporten este formato.
- Latencia: para tareas agénticas largas, la velocidad de decode de 3 tok/s es aceptable si el trabajo no es interactivo; para uso en tiempo real se requiere una GPU de alta gama o un servidor dedicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Kimi-K3 (original) | 2,8T (MoE, 896 expertos) | 1M | safetensors | modified-mit | Requiere multiples GPUs; no cabe en 512 GB |
| Kimi-K3-REAP640-IQ1_S | 2,8T (poda a 640 expertos) | 1M | GGUF | modified-mit | ~441 GB, 5/8 SWE-Lancer |
| Kimi-K3-REAP576-IQ2_XXS | 2,8T (poda a 576 expertos) | 1M | GGUF | modified-mit | ~478 GB, 7/8 SWE-Lancer |
| K2.7-Code (baseline 2-bit) | no disponible | no disponible | GGUF | no disponible | 341 GB, 3/8 SWE-Lancer |

No se dispone de datos comparativos con otros modelos de la misma categoria (p. ej., DeepSeek-V3, Qwen-MoE) en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas: chino y japones quedan gravemente degradados por la poda (perplexity de 7,93 y 19,46 en REAP640). No apto para aplicaciones multilingues.
- Variabilidad de ejecucion: los resultados de SWE-Lancer son de un unico intento a temperatura 1.0; la variabilidad entre ejecuciones es alta, como demuestra el caso del modelo completo que fallo y luego acerto las mismas tareas.
- Inestabilidad en tool calling: en pruebas de reproduccion, 1 de 4 ejecuciones filtro marcadores XTML en los argumentos de las herramientas, aunque las tareas se completaron igualmente.
- Requisitos de hardware: necesita 512 GB de memoria; no es viable en equipos de consumo.
- Licencia: modified-mit de Moonshot AI; se debe revisar el texto completo de la licencia para confirmar restricciones de uso comercial o atribucion.
- Velocidad de inferencia: ~3 tok/s decode, muy lento para aplicaciones interactivas en tiempo real.
- Sin soporte oficial en llama.cpp mainline: requiere el fork de Unsloth con el parche de Kimi-K3.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hellohazime/Kimi-K3-REAP-512GB-GGUF
- Modelo base (Unsloth): https://huggingface.co/unsloth/Kimi-K3-GGUF
- Modelo original (Moonshot AI): https://huggingface.co/moonshotai/Kimi-K3
- GitHub de Moonshot AI (Kimi-K3): https://github.com/MoonshotAI/Kimi-K3
- Repositorio de evaluaciones del autor: https://github.com/01554/kimi-k3-gguf-prune
- Fork de llama.cpp de Unsloth: https://github.com/unslothai/llama.cpp
- PR de llama.cpp para Kimi-K3: https://github.com/ggml-org/llama.cpp/pull/26185
- Guia de despliegue local (explainx.ai): https://explainx.ai/blog/kimi-k3-run-locally-open-weights-desktop-july-2026
- Ficha en LM Studio: https://lmstudio.ai/models/kimi-k3
