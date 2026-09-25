# RL-Forgetting-Experiments-3/qwen2.5-3b-kk-sft-replay-ce-lam1-all-checkpoints

## Resumen

Este repositorio contiene una familia de checkpoints resultantes de un ajuste supervisado (SFT) sobre el modelo base Qwen/Qwen2.5-3B, realizado por la organizacion RL-Forgetting-Experiments-3. Se trata de un artefacto de investigacion, no de un modelo listo para produccion: la model card indica explicitamente que se incluyen todos los checkpoints validados de una unica rama experimental ("arm") y que la barrida de entrenamiento se interrumpio antes del paso final previsto.

Por la nomenclatura del repositorio (qwen2.5-3b-kk-sft-replay-ce-lam1) y sus etiquetas (sft, replay, knights-and-knaves), el ajuste se realizo sobre la tarea de logica "knights and knaves" (caballeros y escuderos), con un esquema de entrenamiento que combina SFT sobre la tarea objetivo y una componente de replay (repeticion de datos previos) con perdida de entropia cruzada y un coeficiente lambda=1. El proposito declarado de la organizacion apunta al estudio del olvido catastrofico durante el ajuste fino, aunque la model card no desarrolla la metodologia.

Es relevante ahora como material de reproducibilidad: expone 8 checkpoints intermedios (pasos 318, 635, 952, 1270, 1588, 1905, 2222 y 2540) que permiten analizar la evolucion del olvido y de la adquisicion de la tarea a lo largo del entrenamiento, algo poco habitual en repositorios publicados. El coste es un tamano de repositorio de 98,8 GB, ya que conserva todos los checkpoints en precision completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2ForCausalLM), heredada del modelo base Qwen2.5-3B: 36 capas, hidden size 2048, 16 cabezas de atencion con 2 cabezas KV (GQA), RoPE, SwiGLU y RMSNorm. No disponible de forma explicita en la model card del repositorio |
| Parametros totales | Aproximadamente 3,09 mil millones (heredado del modelo base Qwen2.5-3B; la model card no lo declara) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la model card del repositorio. El modelo base Qwen2.5-3B soporta 32.768 tokens de forma nativa, ampliables a 131.072 con YaRN |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ. Al derivar de Qwen2.5-3B, es compatible con los esquemas de cuantizacion habituales para esa arquitectura |
| Idiomas soportados | No disponible en la model card. El modelo base Qwen2.5-3B declara soporte para 29 idiomas; el ajuste se realizo sobre una tarea de logica, presumiblemente en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano total del repositorio: 98,8 GB, correspondiente a los 8 checkpoints en precision completa) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-3B, un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings RoPE y atencion con consultas agrupadas (GQA) de 16 cabezas de consulta frente a 2 cabezas de clave/valor. La model card del repositorio no aporta detalles adicionales sobre modificaciones estructurales, por lo que se asume que el ajuste es puramente de pesos.

Respecto al entrenamiento, la informacion disponible se limita a los siguientes hechos: se aplico SFT con una componente de replay, funcion de perdida de entropia cruzada (etiquetada como "ce" en el nombre del repositorio) y un coeficiente lambda=1 para el termino de replay. El conjunto de datos corresponde a la tarea "knights-and-knaves". La barrida de entrenamiento alcanzo, en el momento de la interrupcion, 8 checkpoints validados en los pasos 318, 635, 952, 1270, 1588, 1905, 2222 y 2540; el autor advierte que la barrida se interrumpio antes del paso final previsto para las ramas cuyas listas terminan antes, y que ningun checkpoint inexistente o parcial se representa como completo. No se documentan el numero total de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. Tampoco se describe ninguna innovacion tecnica de inferencia (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto autoregresiva en la linea del modelo base Qwen2.5-3B (no verificada en la model card de este repositorio).
- Resolucion de problemas de logica del tipo "knights and knaves", que es la tarea objetivo del ajuste supervisado.
- Razonamiento de un solo paso orientado a la tarea de entrenamiento; no se documenta capacidad de razonamiento multi-paso general.
- Soporte de tool calling / function calling: no disponible. No se menciona en la model card ni se ha validado tras el ajuste.
- Soporte de agentes: no disponible.
- Capacidades multilingues: no disponibles. No se declara evaluacion posterior al ajuste en ningun idioma.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Utilidad principal documentada: servir como serie de checkpoints intermedios para estudiar la evolucion del olvido catastrofico durante el ajuste fino.

## Casos de uso

- Estudio del olvido catastrofico: los 8 checkpoints permiten medir la degradacion de capacidades generales (por ejemplo, perplejidad en un corpus generico) a lo largo de los pasos de entrenamiento y compararla con la mejora en la tarea objetivo.
- Ablacion de tecnicas de replay: la rama publicada usa perdida de entropia cruzada con lambda=1; comparar esta rama con otras del mismo autor permite aislar el efecto del coeficiente de replay y de la funcion de perdida.
- Reproducibilidad de experimentos de ajuste fino: los checkpoints intermedios permiten reanudar o bifurcar el entrenamiento desde pasos concretos (318, 635, ..., 2540) en lugar de desde el modelo base.
- Analisis de trayectorias de aprendizaje en tareas de logica: la tarea knights-and-knaves tiene una metrica de exactitud binaria facil de calcular, lo que facilita trazar curvas de aprendizaje por paso.
- Base para experimentos de interpretabilidad: al disponer de multiples snapshots del mismo modelo sobre la misma tarea, se pueden comparar activaciones y representaciones internas entre checkpoints.
- Prototipado academico de evaluacion de olvido: usar los checkpoints como sujetos de prueba para desarrollar nuevas metricas de retencion de conocimiento.
- Punto de partida para un ajuste posterior controlado: partir del checkpoint del paso 2540 en lugar del modelo base si se quiere continuar el entrenamiento en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye exactitud en la tarea knights-and-knaves, ni metricas de retencion, ni comparaciones con el modelo base. Los resultados de la busqueda web proporcionada no contienen informacion relevante sobre este modelo (los enlaces devueltos corresponden al videojuego Rocket League y a medios de prensa regional francesa, sin relacion con el repositorio).

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 6,2 GB solo para los pesos, mas cache KV. Con la configuracion del modelo base (36 capas, 2 cabezas KV, head dim 128), la cache KV en FP16 consume alrededor de 36 KB por token, es decir, unos 1,2 GB a 32.768 tokens de contexto. En la practica conviene reservar entre 8 y 12 GB.
- VRAM estimada en cuantizacion INT8: en torno a 3,5 GB de pesos, con la misma cache KV.
- VRAM estimada en GGUF Q4_K_M: en torno a 2 GB de pesos. Estos valores son estimaciones derivadas del numero de parametros del modelo base, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) para FP16 con contexto completo; A100 40/80 GB, H100 o L40S para despliegue con concurrencia alta y batching.
- Cabe en GPU de consumo: si. En FP16 cabe con margen en tarjetas de 12-16 GB; en cuantizaciones de 4 bits cabe en GPUs de 8 GB e incluso en equipos con menos VRAM mediante offloading a CPU.
- Opciones de despliegue: transformers (referencia), vLLM y TGI para servicio con batching continuo, llama.cpp y Ollama para ejecucion local cuantizada. Los checkpoints estan en safetensors, por lo que cualquier conversion a GGUF requiere un paso previo de conversion y cuantizacion.
- Requisito de almacenamiento: el repositorio completo ocupa 98,8 GB. Si solo se necesita un checkpoint, conviene descargar selectivamente los ficheros de un unico paso.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

La comparativa se establece contra modelos de ~3B parametros. Los datos de rendimiento no se incluyen porque este repositorio no publica benchmarks propios y las cifras del modelo base no son extrapolables al ajuste.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este repositorio (Qwen2.5-3B + SFT replay, tarea knights-and-knaves) | ~3,09B | No disponible en la model card (base: 32.768 tokens) | apache-2.0 | HuggingFace, 8 checkpoints en safetensors, 98,8 GB |
| Qwen/Qwen2.5-3B | ~3,09B | 32.768 tokens nativos, 131.072 con YaRN | apache-2.0 | HuggingFace, safetensors |
| meta-llama/Llama-3.2-3B | ~3,2B | 128.000 tokens | Llama 3.2 Community License | HuggingFace, safetensors |
| microsoft/Phi-3.5-mini-instruct | ~3,8B | 128.000 tokens | MIT | HuggingFace, safetensors |

Frente a estas alternativas, el modelo de este repositorio no aporta una mejora general de capacidades: es un ajuste de tarea especifica con fines de investigacion. Su ventaja comparativa es la disponibilidad de checkpoints intermedios, algo que ninguno de los modelos citados publica.

## Limitaciones y advertencias

- Artefacto de investigacion: la propia model card lo describe como una rama experimental ("arm") de una barrida de entrenamiento, no como un modelo final.
- Entrenamiento incompleto: la barrida se interrumpio antes del paso final previsto en varias ramas. El checkpoint de mayor numero de pasos incluido en esta rama es el 2540, que puede no corresponder al final del entrenamiento planificado.
- Olvido catastrofico: el contexto del proyecto (RL-Forgetting-Experiments) sugiere que el objeto de estudio es precisamente la perdida de capacidades generales tras el ajuste. Es esperable, por tanto, degradacion en tareas ajenas a knights-and-knaves, aunque no se publican mediciones.
- Sesgos conocidos: no disponibles. No se ha realizado ninguna evaluacion de sesgos sobre este ajuste.
- Riesgo de alucinacion: no evaluado. Un modelo de 3B ajustado sobre una tarea logica restringida puede producir respuestas incorrectas fuera de ese dominio.
- Limitaciones de contexto e idioma: la model card no declara ventana de contexto efectiva ni idiomas soportados tras el ajuste. El modelo base declara 29 idiomas, pero no hay garantia de que el ajuste los preserve.
- Restricciones de licencia: la licencia apache-2.0 permite uso comercial, modificacion y redistribucion con atribucion. No obstante, el autor no proporciona ninguna validacion de calidad que respalde un despliegue comercial.
- Ausencia de evaluacion: no hay benchmarks, ni evaluacion de la tarea objetivo, ni informe de retencion. Cualquier uso en produccion exigiria una evaluacion propia previa.
- Coste de almacenamiento y descarga: 98,8 GB de repositorio por incluir todos los checkpoints en precision completa.
- Los resultados de la busqueda web realizada no aportan informacion contrastable sobre este modelo; los enlaces obtenidos no guardan relacion con el.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/RL-Forgetting-Experiments-3/qwen2.5-3b-kk-sft-replay-ce-lam1-all-checkpoints
- Modelo base Qwen2.5-3B: https://huggingface.co/Qwen/Qwen2.5-3B
- Coleccion Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Informe tecnico de Qwen2.5 (arXiv): https://arxiv.org/abs/2412.15115
- Repositorio de Qwen2.5 en GitHub: https://github.com/QwenLM/Qwen2.5
- Pagina de la organizacion en HuggingFace: https://huggingface.co/RL-Forgetting-Experiments-3
