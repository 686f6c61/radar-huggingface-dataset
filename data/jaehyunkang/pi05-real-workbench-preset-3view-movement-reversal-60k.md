# jaehyunkang/pi05-real-workbench-preset-3view-movement-reversal-60k

## Resumen

Pi0.5 Real Workbench — preset-3view-movement-reversal es una política de robótica (vision-language-action) obtenida por fine-tuning del modelo base `lerobot/pi05_base`. Lo publica el usuario de HuggingFace `jaehyunkang` y corresponde al checkpoint final de un entrenamiento de 60.000 pasos de optimización sobre el dataset `Myungkyu/real_workbench-preset-gemini`, con un alcance de tarea declarado como "movement-reversal" (inversión de movimiento) en un banco de trabajo real.

Se trata de un modelo de imitación para control de manipuladores: recibe tres vistas de cámara (exterior, muñeca y una imagen `observation.image.keyframe`), un estado de 8 dimensiones y una instrucción de tarea en texto, y produce acciones delta del efector final en 7 dimensiones (6 de velocidad cartesiana más pinza). El modelo tiene 4.143.404.816 parámetros (~4,14 mil millones) almacenados en safetensors, con un repositorio de 24,5 GB que incluye pesos, configuración, estados de normalización y checkpoints de reanudación.

Su relevancia es acotada y muy específica: no es un modelo generalista ni un modelo de lenguaje, sino un artefacto de investigación reproducible dentro del ecosistema LeRobot, útil para quien quiera replicar el entrenamiento, reanudarlo o comparar variantes de una misma tarea. El autor indica explícitamente que no se reclaman métricas de evaluación en robot real, y el modelo no tiene descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política vision-language-action (VLA) de la familia Pi0.5, sobre el modelo base `lerobot/pi05_base`; cabezal de acciones con 10 pasos de denoising y horizonte de chunk de 50 |
| Parametros totales | 4.143.404.816 (~4,14 mil millones), segun los pesos safetensors publicados |
| Parametros activos | No disponible. El autor no declara componentes con activacion selectiva; no se confirma arquitectura MoE |
| Longitud de contexto | No disponible. El modelo opera con un chunk de acciones de 50 pasos y una instruccion de tarea, no con una ventana de contexto de texto declarada |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en precision completa (safetensors); no hay versiones GGUF, int8 ni int4 |
| Idiomas soportados | No disponible. Las instrucciones de tarea se suministran como texto por fotograma (subtarea en parquet); el autor no declara idiomas |
| Licencia | No disponible |
| Formato de pesos | Safetensors (pesos de política, configuración, preprocesado/postprocesado y estados de normalización en la raíz del repositorio) |
| Modelo base | `lerobot/pi05_base` (fine-tune) |
| Dataset de entrenamiento | `Myungkyu/real_workbench-preset-gemini` |
| Tokenizer de referencia | `google/paligemma-3b-pt-224` (revision de entrenamiento `35e4f46485b4d07967e7e9935bc3786aad50687c`) |
| Vistas de entrada | 3 (camara exterior, camara de muñeca y `observation.image.keyframe`) |
| Dimension de estado | 8 |
| Dimension de accion | Delta EEF de 7 dimensiones (6 de velocidad cartesiana + pinza) |
| Resolucion de imagen | Almacenada a 224x126; la política rellena (padding) hasta 224x224 |
| Pasos de entrenamiento | 60.000 pasos de optimizacion |
| Batch global / GPUs / semilla | 32 / 2 GPUs / semilla 42 |
| Implementacion de entrenamiento | `RLWRLD/hiwrld-ll-policy`, con LeRobot Pi0.5 vendorizado |
| Tamano del repositorio | 24,5 GB |
| Fecha de creacion (segun HuggingFace) | 2026-09-17 |

## Arquitectura y entrenamiento

La model card identifica el modelo como una política Pi0.5 dentro del ecosistema LeRobot, entrenada con la implementación `RLWRLD/hiwrld-ll-policy` sobre una copia vendorizada de LeRobot Pi0.5. La referencia del tokenizer apunta a `google/paligemma-3b-pt-224`, lo que sitúa la columna vertebral de visión-lenguaje en la familia PaliGemma; no obstante, el autor no detalla la composición interna del modelo ni la distribución exacta de parámetros entre el codificador visual, el modelo de lenguaje y el cabezal de acciones. Del mismo modo, no se describen innovaciones técnicas más allá del propio diseño Pi0.5 heredado del modelo base.

El entrenamiento consistió en 60.000 pasos de optimización con batch global de 32 sobre 2 GPUs y semilla 42. La entrada combina tres vistas (exterior, muñeca y una imagen keyframe), un vector de estado de 8 dimensiones y una instrucción de tarea tomada de la subtarea por fotograma en parquet. La salida es un chunk de acciones delta del efector final de 7 dimensiones con horizonte de ejecución de 50 y 10 pasos de denoising en inferencia. No se documenta en la información disponible el número de tokens o episodios vistos, la composición del dataset, ni si hubo etapas de RLHF o DPO (poco habituales en políticas de imitación robótica).

La model card indica que los campos de entrada personalizados pueden requerir la implementación correspondiente (`RLWRLD/hiwrld-ll-policy`), que las rutas específicas de máquina se eliminaron de los metadatos JSON y que los checkpoints originales de entrenamiento se conservaron en `training_state/`, con tamaños y hashes SHA-256 en `artifact_manifest.json`.

## Capacidades

- Generacion de acciones de manipulacion: produce comandos delta del efector final (6 componentes de velocidad cartesiana mas pinza) a partir de observaciones visuales y de estado.
- Control multi-vista: consume simultaneamente camara exterior, camara de muñeca e imagen keyframe, lo que permite razonar sobre la escena completa y sobre la perspectiva cercana a la garra.
- Condicionamiento por instruccion textual: la tarea se especifica como texto de subtarea por fotograma procedente del dataset.
- Especializacion en "movement-reversal": el fine-tune esta orientado a tareas que implican invertir una trayectoria de movimiento en el banco de trabajo.
- Ejecucion por chunks: genera bloques de 50 acciones y los ejecuta con 10 pasos de denoising, lo que reduce la frecuencia de reevaluacion del modelo.
- Reanudacion de entrenamiento: el repositorio incluye estado de entrenamiento para continuar el fine-tuning.
- Tool calling / function calling: no disponible (no es una capacidad de este tipo de modelo).
- Soporte de agentes y razonamiento multi-paso: no disponible en el sentido de agentes de texto; el comportamiento multi-paso se limita a la secuencia de acciones del chunk.
- Capacidades multilingues: no disponibles.
- Vision, audio, modo "thinking": vision si (tres flujos de imagen); audio y modo thinking no disponibles.

## Casos de uso

- Automatizacion de tareas de inversion de trayectoria en banco de trabajo: el modelo esta entrenado especificamente para "movement-reversal", de modo que puede reutilizarse como punto de partida para rutinas de ida y vuelta sobre una estacion fija con la misma configuracion de camaras y el mismo espacio de acciones.
- Recogida y colocacion repetitiva con multiples camaras: la combinacion de vista exterior, vista de muñeca y keyframe permite abordar tareas de pick-and-place donde la perspectiva global no basta para localizar la garra y el objeto.
- Fine-tuning especifico de celula de fabricacion: al estar publicado con `training_state/`, se puede reanudar el entrenamiento con datos propios de otra celda y adaptar la politica sin partir del modelo base generalista.
- Investigacion en politicas VLA: sirve como referencia reproducible de un entrenamiento Pi0.5 de 60.000 pasos con semilla conocida (42), batch 32 y dos GPUs, util para estudios de ablacion y de sensibilidad a hiperparametros.
- Evaluacion de robustez ante perturbaciones visuales: al depender de tres flujos de imagen con resolucion 224x126 rellenada a 224x224, permite medir como afecta la perdida de una vista o el ruido en el keyframe al exito de la tarea.
- Teleoperacion asistida y correccion de trayectorias: el modelo puede integrarse en un bucle donde un operador intervenga solo cuando la politica falla, aprovechando el chunk de 50 acciones para reducir la latencia de control.
- Generacion de datos sinteticos de trayectoria: las acciones delta EEF generadas pueden registrarse como demostraciones para entrenar otras politicas o para aumentar el dataset original.
- Validacion de infraestructura LeRobot: sirve para comprobar que un pipeline de despliegue LeRobot carga correctamente pesos, normalizacion y preprocesado de un checkpoint ajeno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica de forma explicita que se trata de un checkpoint entrenado y no de un resultado de evaluacion, y que no se reclaman metricas de evaluacion en robot real. No hay tasas de exito, MMLU, HumanEval, GSM8K ni ninguna otra cifra de rendimiento publicada.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo aritmetico a partir de los 4.143.404.816 parametros, no confirmado por el autor): aproximadamente 8,3 GB en bf16/fp16 solo para pesos; en torno a 16,6 GB en fp32; alrededor de 4,1 GB en int8 y 2,1 GB en int4 si se aplicara cuantizacion, algo que el autor no ofrece ni documenta.
- A esa cifra hay que sumar el coste de activaciones, buffers de imagen de las tres vistas y el runtime de LeRobot, por lo que conviene reservar margen adicional.
- GPUs recomendadas: no disponible en la informacion proporcionada. Por tamano, el modelo entra sin problema en GPUs de centro de datos tipo A100 o H100, y previsiblemente en GPUs de consumo con 16 GB o mas de VRAM en bf16, como la RTX 4090 o la RTX 4080, siempre que el resto del pipeline lo permita.
- Cabe en GPU de consumo: probable en bf16 en tarjetas de 16 GB o mas; no confirmado por el autor.
- Opciones de despliegue: la libreria declarada es `lerobot`; los pesos estan en safetensors y el entrenamiento usa la implementacion `RLWRLD/hiwrld-ll-policy` con LeRobot Pi0.5 vendorizado. Los campos de entrada personalizados pueden exigir esa implementacion concreta. No se documenta soporte para vLLM, Ollama, llama.cpp ni TGI, y por el tipo de modelo (politica de control con entradas de imagen y estado) estas opciones no son las habituales.
- Latencia y throughput estimados: no disponible. El unico dato relacionado es el horizonte de ejecucion de 50 acciones por chunk con 10 pasos de denoising, que condiciona la frecuencia maxima de reevaluacion.
- El repositorio ocupa 24,5 GB, de los cuales una parte corresponde a estados de entrenamiento en `training_state/`; conviene descargar solo lo necesario para inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jaehyunkang/pi05-real-workbench-preset-3view-movement-reversal-60k` | ~4,14 mil millones | Chunk de acciones de 50; 10 pasos de denoising | Sin metricas publicadas | No disponible | Publico en HuggingFace; 0 descargas, 0 likes |
| `lerobot/pi05_base` | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | Publico en HuggingFace; es el modelo base de este fine-tune |
| Otras alternativas de la misma categoria (pi0, OpenVLA, GR00T y similares) | No disponible | No disponible | No disponible | No disponible | No se ha encontrado informacion en la busqueda web realizada |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas. La busqueda web realizada no devolvio resultados relacionados con el modelo ni con modelos comparables.

## Limitaciones y advertencias

- Ausencia de evaluacion: el autor declara explicitamente que no se reclaman metricas de evaluacion en robot real. No hay evidencia publicada de tasa de exito ni de robustez.
- Licencia no especificada: al no declararse licencia, el uso comercial queda en una situacion juridica indeterminada y no debe asumirse ningun permiso implicito.
- Acoplamiento al hardware y al dataset: la politica espera un estado de 8 dimensiones, acciones delta EEF de 7 dimensiones, tres vistas concretas y un keyframe definido por el dataset. Fuera de esa configuracion, el modelo no es directamente reutilizable.
- Dependencia de implementacion: los campos de entrada personalizados pueden requerir la implementacion `RLWRLD/hiwrld-ll-policy` con LeRobot Pi0.5 vendorizado; cargarlo con otro runtime puede producir resultados silenciosamente incorrectos.
- Distribucion de entrenamiento estrecha: es un fine-tune especializado en "movement-reversal" sobre un unico banco de trabajo; cabe esperar degradacion ante cambios de iluminacion, fondo, utillaje o posicion de camara.
- Resolucion de imagen limitada: las imagenes se almacenan a 224x126 y se rellenan a 224x224, lo que reduce el detalle efectivo en objetos pequenos.
- Riesgo de acciones inseguras: como toda politica de control, puede generar comandos fisicamente invalidos o peligrosos fuera de su distribucion; es imprescindible aplicar limites de velocidad, par y espacio de trabajo en el controlador de bajo nivel.
- Idiomas: no se declara soporte multilingue; las instrucciones de tarea proceden del dataset y probablemente esten en un unico idioma, no confirmado.
- Sesgos: no disponibles. El autor no documenta analisis de sesgo, diversidad de escenas ni cobertura de objetos.
- Madurez y trazabilidad: el modelo no tiene descargas ni valoraciones, y las rutas especificas de maquina se eliminaron de los metadatos JSON, por lo que hay que reconstruir las rutas locales al reanudar el entrenamiento.
- Fechas: la fecha de creacion registrada en HuggingFace es 2026-09-17, posterior a la fecha de redaccion habitual de las fichas; conviene verificar el dato en el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaehyunkang/pi05-real-workbench-preset-3view-movement-reversal-60k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Myungkyu/real_workbench-preset-gemini
- Tokenizer de referencia: https://huggingface.co/google/paligemma-3b-pt-224
- Libreria LeRobot: https://github.com/huggingface/lerobot
- Implementacion de entrenamiento citada por el autor: `RLWRLD/hiwrld-ll-policy` (sin URL en la model card)
- Manifiesto de artefactos y hashes: `artifact_manifest.json` en la raiz del repositorio (sin URL directa en la model card)
- Estados de entrenamiento reanudables: carpeta `training_state/` del repositorio (sin URL directa en la model card)
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada ni en la busqueda web realizada
