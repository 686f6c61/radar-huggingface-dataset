# QiWang98/Cog

## Resumen

Cog es un modelo de razonamiento espacial sobre video, obtenido mediante ajuste fino supervisado y aprendizaje por refuerzo a partir de Qwen3-VL-8B-Instruct. Lo desarrolla QiWang98 y su objetivo es responder preguntas espaciales sobre videos construyendo primero un mapa cognitivo relevante para la pregunta, derivando despues evidencia espacial explicita y emitiendo la respuesta final. Esta publicado con licencia Apache 2.0 y pesos en safetensors FP32, sin necesidad de codigo remoto personalizado.

El checkpoint publicado corresponde a la variante simpleMapRL con pase completo y reporta un 54,00 % de media oficial en las siete familias de tareas del benchmark ReVSI32, sobre las 6.158 preguntas del conjunto. El modelo conserva la arquitectura multimodal de Qwen3-VL, con 8.767.123.696 parametros totales (aproximadamente 8,77 mil millones), lo que lo situa en la franja de modelos vision-language de 8B manejables en hardware de gama alta de consumo con cuantizacion.

Su relevancia actual radica en que aborda una tarea poco cubierta por los VLM genericos: razonamiento espacial metrico sobre video (distancias absolutas y relativas, direcciones, tamanos de objetos y habitaciones, conteo y planificacion de rutas), con un protocolo de evaluacion congelado a 32 fotogramas y salidas estructuradas verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer multimodal vision-language, clase `Qwen3VLForConditionalGeneration`) |
| Parametros totales | 8.767.123.696 (aproximadamente 8,77 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la evaluacion usa un limite de salida de 4.096 tokens) |
| Tipos de cuantizacion | pesos publicados en FP32; el ejemplo oficial castea a BF16; no se documentan otros formatos cuantizados |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP32), con tokenizer, processor y chat templates incluidos |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-8B-Instruct y mantiene su arquitectura vision-language: un codificador visual congelado durante el ajuste, cuatro modulos de fusion visual (visual merger) entrenados y el modelo de lenguaje tambien entrenado. La innovacion principal no esta en la arquitectura sino en el protocolo de entrenamiento y salida: el modelo genera un mapa cognitivo en JSON con categorias de vocabulario abierto, una representacion por instancia fisica (centro, extension y yaw en metros y grados), seguido de evidencia espacial y razonamiento antes de la respuesta final.

El entrenamiento consta de dos fases. Primero, ajuste fino supervisado sobre 76.936 ejemplos. Despues, DAPO (una variante de optimizacion de politica con RL) sobre 11.139 ejemplos unicos de QA espacial muestreados en un solo pase, con semilla 42, 116 actualizaciones reales del optimizador y 7.424 grupos de QA optimizados. La recompensa combina correccion de la respuesta con recompensas condicionadas de mapa y evidencia: `A + gate * (0.2 M + 0.1 E)`, manteniendo el shaping nativo para salidas demasiado largas. El filtrado de grupos usa la varianza de la recompensa final. El autor advierte que los resultados evaluan la receta y el presupuesto de entrenamiento en conjunto, sin aislar el efecto de cada componente de la recompensa.

## Capacidades

- Razonamiento espacial sobre video: estimacion de distancias absolutas y relativas, direcciones relativas, tamanos de objetos y de habitaciones, conteo de objetos y planificacion de rutas.
- Construccion de mapas cognitivos: genera mapas JSON con vocabulario abierto, coordenadas metricas y orientacion por instancia, fusionando observaciones repetidas de un mismo objeto.
- Generacion de evidencia explicita: produce hechos espaciales y calculos intermedios antes de la respuesta final, en una estructura `<think>` con `<map>` y `<evidence>`.
- Entrada multimodal imagen-texto y video-texto: procesa 32 fotogramas seleccionados de un video junto con la pregunta espacial.
- Razonamiento multi-paso: el formato de salida impone mapa, evidencia y razonamiento antes de la respuesta.
- Salida de opcion multiple: para preguntas de planificacion de rutas emite directamente la letra de la opcion.
- Compatibilidad con endpoints: etiquetado como `endpoints_compatible` en Hugging Face.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Robotica movil y navegacion asistida: el modelo puede recibir secuencias de video de una camara y responder preguntas metricas sobre distancias y direcciones relativas, aportando mapas JSON con coordenadas en metros que pueden alimentar modulos de planificacion de rutas.
- Analisis de escenas industriales o de almacen: conteo de objetos y estimacion de tamanos permiten inventariar existencias o verificar la colocacion de materiales a partir de grabaciones, usando las siete familias de tareas espaciales que el modelo cubre.
- Accesibilidad para personas con discapacidad visual: descripcion espacial cuantitativa de un video (donde esta un objeto, a que distancia, en que direccion) con evidencia explicita que puede convertirse en locucion.
- Auditoria de seguridad en obra o instalaciones: estimacion de distancias relativas y tamanos de habitaciones para comprobar separaciones minimas o dimensiones de espacios a partir de video.
- Planificacion de rutas en interiores: las preguntas de route planning (50,78 % en el benchmark) permiten seleccionar la opcion de ruta correcta entre alternativas sobre un video de un entorno.
- Investigacion en razonamiento espacial: el formato de mapa y evidencia facilita el analisis de trazas intermedias, la comparacion de recetas de RL y la reproduccion de evaluaciones con lmms-eval y vLLM.
- Preprocesado para sistemas de agentes embodied: los mapas generados pueden servir como representacion intermedia estructurada para downstream, aunque el autor advierte que son predicciones y pueden ser inexactas.

## Benchmarks y rendimiento

Evaluacion con protocolo congelado ReVSI32 (32 fotogramas), lmms-eval nativo con vLLM, decodificacion greedy y limite de salida de 4.096 tokens. La metrica principal es la media oficial de siete familias, no una exactitud global ponderada por pregunta.

| Metrica | Puntuacion (%) |
|---|---:|
| Media oficial de siete familias | 54,00 |
| Conteo de objetos | 53,97 |
| Estimacion de tamano de objeto | 62,14 |
| Distancia absoluta | 45,85 |
| Distancia relativa | 52,41 |
| Direccion relativa | 58,09 |
| Estimacion de tamano de habitacion | 54,80 |
| Planificacion de rutas | 50,78 |

Todas las 6.158 salidas pasaron una replicacion independiente de la puntuacion oficial sin discrepancias; catorce salidas truncadas por limite de tokens permanecen en las puntuaciones reportadas. En planificacion de rutas acerto 131 de 258 preguntas. Se trata de un resultado de investigacion de una sola semilla y el autor indica que la seleccion de presupuesto se informo con resultados del conjunto de test, por lo que no establece una ventaja causal de la recompensa. No se han publicado comparaciones con modelos similares en la informacion disponible.

## Requisitos de hardware

- Pesos FP32: aproximadamente 35,1 GB (32,7 GiB) en disco, antes de caches de inferencia y activaciones.
- Inferencia en BF16: alrededor de 17,5 GB solo para pesos, mas caches KV y activaciones; en la practica requiere GPU con 24 GB o mas para video de 32 fotogramas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16 con `device_map="auto"`; en GPUs de 16 GB sera necesaria cuantizacion, no documentada oficialmente.
- Cabe en GPU de consumo: si, en RTX 4090 o RTX 3090 de 24 GB en BF16 con margen ajustado; en GPUs de 12-16 GB solo con cuantizacion no oficial.
- Despliegue: transformers con `Qwen3VLForConditionalGeneration` (export registra Transformers 4.57.6) y `attn_implementation="sdpa"`; la evaluacion oficial uso vLLM a traves de lmms-eval.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cog (QiWang98) | aproximadamente 8,77B | no disponible | Razonamiento espacial sobre video con mapas cognitivos y RL | Apache 2.0 | Hugging Face, pesos FP32 |
| Qwen3-VL-8B-Instruct (modelo base) | aproximadamente 8B | no disponible en esta ficha | VLM generalista imagen-texto | Apache 2.0 (segun la model card de Cog) | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de rendimiento. La comparacion con el modelo base es estructural (Cog lo modifica mediante SFT y RL y congela su codificador visual), no de resultados.

## Limitaciones y advertencias

- Resultado de una sola semilla de investigacion: no se ha validado la robustez entre semillas ni la significacion estadistica frente a otras recetas.
- La seleccion del presupuesto de entrenamiento se informo con resultados del conjunto de test, lo que introduce riesgo de sobreajuste al benchmark reportado.
- Los resultados pueden cambiar con otro backend, prompt, seleccion de fotogramas o presupuesto de tokens; el protocolo evaluado es fijo (32 fotogramas, greedy, 4.096 tokens de salida).
- Catorce salidas truncadas por limite de tokens permanecen en las puntuaciones, lo que puede infraestimar ligeramente el rendimiento real.
- Los mapas y la evidencia generados son predicciones del modelo y pueden ser inexactos; no deben usarse como mediciones fiables sin verificacion.
- Distancia absoluta es la familia con peor resultado (45,85 %), por debajo del azar en tareas de dos opciones; conviene no confiar en estimaciones metricas absolutas en produccion.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado; el modelo genera objetos y coordenadas plausibles que pueden no corresponder a la escena.
- Idiomas soportados: no disponible; no se documenta cobertura multilingue.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3-VL-8B-Instruct; conviene revisar su model card para obligaciones adicionales de atribucion.
- Requiere versiones recientes de Transformers con soporte de `Qwen3VLForConditionalGeneration`; versiones antiguas no cargaran el checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/QiWang98/Cog
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Resultados de evaluacion: https://huggingface.co/QiWang98/Cog/blob/main/evaluation_results.json
- Repositorio lmms-eval (herramienta de evaluacion citada): https://github.com/EvolvingLMMs-Lab/lmms-eval
- vLLM (backend de inferencia citado): https://github.com/vllm-project/vllm
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada.
