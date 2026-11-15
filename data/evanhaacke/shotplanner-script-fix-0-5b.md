# EvanHaacke/shotplanner-script-fix-0.5b

## Resumen

Shot Planner script fix (0.5B) es un modelo de lenguaje pequeno publicado por EvanHaacke, derivado mediante un ajuste fino con LoRA (fusionado posteriormente) sobre Qwen2.5-0.5B-Instruct, que a su vez es un transformer decoder-only de 0,5 mil millones de parametros de Alibaba Qwen. El modelo no es de proposito general: esta especializado en reparar errores introducidos al importar guiones cinematograficos en formato PDF dentro de la aplicacion Shot Planner, como lineas de cue leidas erroneamente como accion, nombres de personaje pegados entre si o variantes inconsistentes de un mismo nombre.

La relevancia del modelo es acotada pero clara: se distribuye en formato ONNX cuantizado a 4 bits para ejecutarse de forma totalmente offline dentro de la propia aplicacion mediante Transformers.js, sin depender de una API externa ni de conectividad. Devuelve las correcciones en un formato JSON propio de la aplicacion y cada respuesta es validada por el programa antes de aplicar cambios, lo que reduce el riesgo de modificaciones erroneas en el guion del usuario.

El repositorio ocupa aproximadamente 0,8 GB y la licencia es Apache-2.0, heredada del modelo base. No se han publicado datos sobre idiomas soportados, benchmarks ni volumen de entrenamiento mas alla de la descripcion cualitativa de los datos sinteticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino LoRA fusionado sobre Qwen2.5-0.5B-Instruct |
| Parametros totales | 0,5 mil millones (heredados del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-0.5B-Instruct soporta hasta 32.768 tokens, pero la model card no lo confirma para este ajuste) |
| Tipos de cuantizacion | ONNX 4 bits en pesos de capa (`onnx/model_q4.onnx`); tabla de embeddings/salida atada en precision completa, almacenada una sola vez y ya transpuesta |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grafo `model_q4.onnx` + datos externos `model_q4.onnx_data`), cargado con `dtype: 'q4'` en Transformers.js |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura del Qwen2.5-0.5B-Instruct original: un transformer decoder-only con atencion causal estandar, sin mezcla de expertos ni mecanismos hibridos. Sobre esa base se aplico un ajuste fino con LoRA que posteriormente se fusiono en los pesos, de modo que la inferencia no requiere adaptadores separados. La exportacion a ONNX reorganiza el grafo para que el motor de navegador no duplique en memoria la tabla de embeddings y salida atada, y expone `num_logits_to_keep`, parametro que Transformers.js pasa de forma automatica. El `config.json` activa `transformers.js_config.use_external_data_format` para que la libreria descargue el fichero de pesos externo.

El entrenamiento se realizo con datos sinteticos: guiones limpios y guiones danados deliberadamente, donde el texto sin danar actua como respuesta objetivo. La model card no especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO adicionales mas alla del ajuste supervisado. Tampoco se detalla la configuracion de LoRA (rango, alpha, capas objetivo).

## Capacidades

- Reparacion de errores de importacion de guiones: corrige lineas de cue interpretadas como accion, nombres de personaje fusionados con el dialogo y variantes inconsistentes de un mismo nombre.
- Salida en formato JSON de correccion propio de la aplicacion Shot Planner, no en texto libre conversacional.
- Ejecucion offline en el navegador mediante Transformers.js y ONNX Runtime Web, sin llamadas a servidor.
- Inferencia con pesos cuantizados a 4 bits y carga optimizada para entornos con memoria limitada.
- No es un modelo de chat general: la model card indica explicitamente que no debe usarse como asistente conversacional.
- No se documentan capacidades de tool calling, razonamiento multi-paso, vision, audio ni modo thinking.

## Casos de uso

- Importacion de guiones PDF en Shot Planner: el modelo recibe fragmentos mal parseados y devuelve la correccion en JSON, que la aplicacion valida antes de modificar el documento del usuario.
- Normalizacion de nombres de personaje: detecta variantes como "JUAN" y "Juan" en el mismo guion y propone una unica forma canonica para consolidar el reparto.
- Separacion de cue lines y accion: corrige lineas que el parser PDF clasifico como accion cuando en realidad eran encabezados de escena o indicaciones de camara.
- Reparacion de nombres pegados al dialogo: separa cadenas del tipo "PEPE Hola, que tal" en el nombre de personaje y la linea de dialogo correspondiente.
- Procesamiento por lotes dentro de la app: al ejecutarse en local con un modelo de 0,5B en 4 bits, permite revisar cientos de fragmentos sin coste por token ni latencia de red.
- Entorno sin conectividad: util para estudios de produccion o usuarios que trabajan con guiones confidenciales y no quieren enviar texto a servicios en la nube.
- Pruebas de regresion del parser: sirve como referencia para validar que los cambios en el importador de PDF no introducen nuevos errores de clasificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio completo ocupa 0,8 GB; con pesos de capa en 4 bits y la tabla de embeddings en precision completa, la huella en memoria durante la inferencia es del orden de varios cientos de megabytes, aunque la model card no da una cifra exacta.
- GPU recomendadas: al ejecutarse en navegador via WebGPU o WebAssembly, no requiere GPU dedicada; funciona en cualquier equipo capaz de correr Transformers.js.
- Cabe en GPU consumer: si, en cualquier GPU integrada o dedicada moderna con soporte WebGPU; tambien en CPU mediante el backend WASM.
- Opciones de despliegue: Transformers.js (unico formato publicado, ONNX); no se distribuyen pesos en safetensors, GGUF ni adaptadores PEFT separados.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Shot Planner script fix (0.5B) | 0,5B | No disponible | ONNX q4 | Apache-2.0 | Reparacion de guiones para una app concreta |
| Qwen2.5-0.5B-Instruct | 0,5B | 32.768 tokens (segun documentacion del modelo base) | Safetensors, GGUF, ONNX | Apache-2.0 | Chat general e instrucciones |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens (segun documentacion del modelo base) | Safetensors, GGUF, ONNX | Apache-2.0 | Chat general con mayor capacidad |
| SmolLM2-360M-Instruct | 0,36B | 8.192 tokens (segun documentacion del modelo base) | Safetensors, GGUF | Apache-2.0 | Chat general en dispositivo |

La comparativa se limita al modelo base y a alternativas de tamano similar; no existen datos publicados de rendimiento especifico de este ajuste frente a ellas en la tarea de reparacion de guiones.

## Limitaciones y advertencias

- Modelo de proposito muy especifico: no debe emplearse como chat general ni para tareas ajenas a la reparacion de guiones de Shot Planner.
- Datos de entrenamiento sinteticos: el rendimiento sobre guiones reales con formatos PDF atipicos puede degradarse respecto al conjunto sintetico.
- Riesgo de alucinacion en la salida JSON: aunque la aplicacion valida cada respuesta antes de aplicar cambios, el modelo puede proponer correcciones incorrectas que el validador debe rechazar.
- Idiomas soportados no documentados: se desconoce si el ajuste cubre guiones en castellano o solo en ingles.
- Contexto efectivo no confirmado: la model card no indica la longitud de contexto usada durante el ajuste, por lo que fragmentos largos pueden truncarse.
- Ausencia de benchmarks: no hay evidencia cuantitativa publicada de precision o recall en la tarea de reparacion.
- Licencia Apache-2.0: permite uso comercial, pero al derivar de Qwen2.5-0.5B-Instruct conviene revisar las condiciones del modelo base (tambien Apache-2.0).
- Repositorio sin descargas ni likes en el momento de la consulta: no hay senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EvanHaacke/shotplanner-script-fix-0.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Transformers.js: https://github.com/huggingface/transformers.js
- Documentacion de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
