# exeterminal/Exe-Guard-Dynamic-GGUF

# Exe-Guard-Dynamic-GGUF

## Resumen

Exe-Guard-Dynamic es un modelo guardián especializado desarrollado por el usuario exeterminal para la función Extended Workflow del Exe AI Terminal. Su función es intervenir cuando un paso de herramienta falla durante un flujo de trabajo de agente: recibe el informe del fallo y genera una única instrucción imperativa en inglés que el usuario debe enviar a continuación para corregir el error. No actúa por sí mismo, solo sugiere la siguiente acción.

Se trata de un fine-tune del modelo Qwen/Qwen2.5-Coder-3B-Instruct mediante un adaptador LoRA entrenado localmente con MLX sobre Apple Silicon, fusionado posteriormente en el modelo base y cuantizado a formato GGUF. Con aproximadamente 3,09 mil millones de parámetros, es un modelo ligero diseñado para ejecutarse en segundo plano en el terminal, con una ventana de contexto de 4096 tokens y una salida limitada a una sola frase correctiva.

La relevancia actual de este modelo reside en su enfoque extremadamente específico: en lugar de un asistente general, ofrece una solución determinista y de bajo coste para un problema concreto en la automatización de agentes, la reparación de pasos fallidos. Según la model card, el modelo base sin entrenar resuelve solo 10 de 24 casos de reparación (42%), mientras que Exe-Guard-Dynamic alcanza 24 de 24 (100%) en los mismos casos, lo que demuestra una mejora sustancial en la tarea objetivo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2.5-Coder-3B-Instruct) |
| Parametros totales | 3.085.938.688 (~3,09 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (configuracion de inferencia recomendada en la model card) |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, IQ3_M, IQ3_S, Q2_K, IQ2_M, IQ2_S, IQ2_XS, IQ1_M, IQ1_S |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivos .gguf, incluyendo f16) |

## Arquitectura y entrenamiento

El modelo se construye sobre la arquitectura transformer decoder-only de Qwen2.5-Coder-3B-Instruct, un modelo de 3,09 mil millones de parámetros con atención causal estándar. No emplea mezcla de expertos (MoE) ni arquitecturas alternativas como SSM. La ventana de contexto del modelo base es de 131072 tokens, pero para la tarea de guardián se recomienda una configuración de 4096 tokens, suficiente para procesar el informe de fallo y generar la respuesta correctiva.

El entrenamiento consistió en un adaptador LoRA de bajo rango, entrenado localmente con MLX sobre Apple Silicon, utilizando ejemplos sintéticos de pasos de herramienta fallidos y sus correcciones en una sola frase. Los datos se generaron para coincidir con el formato exacto de informe que produce el Exe AI Terminal. El adaptador se fusionó en el modelo base y posteriormente se cuantizó a varias precisiones GGUF, todas ellas con una matriz de importancia (imatrix) calculada a partir de los datos de la propia tarea. No se emplearon técnicas como RLHF o DPO; el ajuste es supervisado sobre ejemplos sintéticos.

## Capacidades

- Genera una instrucción correctiva en una sola frase imperativa en inglés cuando recibe un informe de fallo de herramienta.
- Cubre seis tipos específicos de fallo: errores tipográficos en comandos, entorno Python incorrecto, texto antiguo no encontrado en `edit_file`, archivos binarios o ilegibles, rutas rechazadas fuera de las carpetas compartidas y ejecuciones detenidas por timeout.
- Funciona con un prompt fijo de dos mensajes (instrucción de sistema y el informe de fallo) y sin historial de conversación.
- Es compatible con la integración en el Exe AI Terminal como modelo de fondo para el Extended Workflow.
- Soporta tool-use en el sentido de que interpreta informes de fallos de herramientas y sugiere la siguiente acción correctiva, aunque no ejecuta herramientas directamente.
- No realiza generación de código, visión, ni chat general; está estrictamente limitado a la tarea de reparación de pasos fallidos.

## Casos de uso

- Corrección de errores tipográficos en comandos: cuando un usuario escribe `npm run buld` y el comando falla, el modelo detecta el error y sugiere `npm run build` como instrucción siguiente.
- Gestión de entornos Python: si un paso falla porque se usó el intérprete global en lugar del entorno virtual `.venv/`, el modelo recomienda usar `.venv/bin/python3` en lugar de `pip install` global o `source activate`.
- Reparación de ediciones fallidas: cuando `edit_file` no encuentra el texto antiguo, el modelo sugiere leer primero el archivo y luego editar con el texto exacto.
- Manejo de archivos binarios o ilegibles: si una herramienta intenta leer un binario, el modelo recomienda el archivo legible (por ejemplo, el `.log`) o usar `run_command` para archivos comprimidos.
- Resolución de rutas rechazadas: cuando una ruta está fuera de las carpetas compartidas, el modelo indica una ruta válida dentro de la carpeta liberada.
- Reanudación de ejecuciones detenidas por timeout: si una ejecución se detiene por tiempo límite, el modelo sugiere re-ejecutar en segundo plano.
- Integración en pipelines de agentes automatizados: puede usarse como componente de supervisión en sistemas que ejecutan múltiples pasos de herramienta, reduciendo la intervención manual en fallos comunes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card proporciona una métrica específica de la tarea: el número de casos de reparación resueltos correctamente sobre 24 casos held-out, evaluados a `temperature 0.1`. La tabla siguiente muestra los resultados por cuantización:

| Archivo | Tipo | Bits | Tamano | Test (de 24) |
|---|---|---|---|---|
| Exe-Guard-Dynamic-Q8_0.gguf | K/legacy | 8 | 3,06 GB | 24 / 24 |
| Exe-Guard-Dynamic-Q6_K.gguf | K-quant | 6,5 | 2,36 GB | 24 / 24 |
| Exe-Guard-Dynamic-Q5_K_M.gguf | K-quant | 5,5 | 2,07 GB | 24 / 24 |
| Exe-Guard-Dynamic-Q4_K_M.gguf | K-quant | 4,8 | 1,80 GB | 24 / 24 (recomendado) |
| Exe-Guard-Dynamic-Q4_K_S.gguf | K-quant | 4,5 | 1,71 GB | 24 / 24 |
| Exe-Guard-Dynamic-IQ4_XS.gguf | I-quant | 4,25 | 1,62 GB | 24 / 24 |
| Exe-Guard-Dynamic-Q3_K_L.gguf | K-quant | 4,0 | 1,59 GB | 19 / 24 |
| Exe-Guard-Dynamic-Q3_K_M.gguf | K-quant | 3,9 | 1,48 GB | 20 / 24 |
| Exe-Guard-Dynamic-IQ3_M.gguf | I-quant | 3,66 | 1,39 GB | 24 / 24 |
| Exe-Guard-Dynamic-IQ3_S.gguf | I-quant | 3,44 | 1,36 GB | 24 / 24 |
| Exe-Guard-Dynamic-Q2_K.gguf | K-quant | 3,0 | 1,19 GB | 24 / 24 |
| Exe-Guard-Dynamic-IQ2_M.gguf | I-quant | 2,7 | 1,06 GB | 23 / 24 |
| Exe-Guard-Dynamic-IQ2_S.gguf | I-quant | 2,5 | 0,99 GB | 22 / 24 |
| Exe-Guard-Dynamic-IQ2_XS.gguf | I-quant | 2,06 | 0,96 GB | 22 / 24 |
| Exe-Guard-Dynamic-IQ1_M.gguf | I-quant · experimental | 1,75 | 0,79 GB | 9 / 24 |
| Exe-Guard-Dynamic-IQ1_S.gguf | I-quant · experimental | 1,56 | 0,74 GB | 10 / 24 |
| Exe-Guard-Dynamic-f16.gguf | full precision | 16 | 5,75 GB | 24 / 24 |

Además, se reporta que el modelo base sin entrenar resuelve 10/24 casos (42%), mientras que Exe-Guard-Dynamic resuelve 24/24 (100%). En los dos casos más difíciles (entorno Python incorrecto y objetivo de edición incorrecto), el base obtiene un 0%, mientras que el modelo entrenado los resuelve por completo.

## Requisitos de hardware

- El tamaño de los archivos GGUF varía entre 0,74 GB (IQ1_S) y 5,75 GB (f16). Para la cuantización recomendada (Q4_K_M, 1,80 GB) se necesitan aproximadamente 2-3 GB de VRAM para cargar el modelo y el caché de KV en GPU.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050) puede ejecutar las cuantizaciones Q4 y superiores. Para f16 se recomienda al menos 8 GB de VRAM (RTX 3070, RTX 4060, etc.).
- Es un modelo ligero que también puede ejecutarse en CPU con llama.cpp, requiriendo entre 1 y 6 GB de RAM según la cuantización, con una latencia aceptable para una tarea de generación corta (una frase).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. No es compatible directamente con vLLM o TGI en formato GGUF; para usarlos habría que convertir los pesos a safetensors.
- Latencia y throughput: no se han publicado datos específicos, pero al ser un modelo de 3B y generar solo una frase (máximo 200 tokens), la inferencia es del orden de decenas de milisegundos en GPU moderna y de unos pocos segundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento en tarea (24 casos) | Uso previsto |
|---|---|---|---|---|---|
| Exe-Guard-Dynamic (este) | 3,09 B | 4096 (recomendado) | Apache-2.0 | 24/24 (100%) | Reparacion de fallos de herramientas en terminal |
| Qwen2.5-Coder-3B-Instruct (base) | 3,09 B | 131072 | Apache-2.0 | 10/24 (42%) | Asistente general de codigo y chat |
| Otros modelos especializados en reparacion de errores | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa principal es contra el modelo base, ya que Exe-Guard-Dynamic es un fine-tune específico. No se dispone de información sobre otros modelos con la misma especialización en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea de reparación de fallos en el contexto del Exe AI Terminal. Fuera de este ámbito (chat general, generación de código, visión, etc.) su rendimiento es impredecible y no debe usarse como asistente general.
- Solo soporta inglés; no se ha entrenado para otros idiomas, aunque el modelo base es multilingüe.
- Las cuantizaciones extremas (IQ1_M e IQ1_S) degradan significativamente el rendimiento (9-10/24 casos) y no se recomiendan para producción.
- La salida es siempre una única frase imperativa; el modelo no proporciona explicaciones ni alternativas múltiples, lo que puede ser limitante en contextos donde se requiera más detalle.
- Riesgo de alucinación: si se le presenta un informe de fallo que no coincide con los seis tipos cubiertos, el modelo puede generar una instrucción incorrecta o irrelevante.
- La licencia Apache-2.0 permite uso comercial y modificación, pero exige atribución al modelo base original (Qwen2.5-Coder-3B-Instruct), como se indica en la model card.
- El modelo no ejecuta acciones por sí mismo; solo sugiere instrucciones. Cualquier integración en producción debe validar la salida antes de ejecutarla.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/exeterminal/Exe-Guard-Dynamic-GGUF)
- [Modelo base Qwen2.5-Coder-3B-Instruct](https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct)
- Repositorio del autor: no disponible en la informacion proporcionada.
