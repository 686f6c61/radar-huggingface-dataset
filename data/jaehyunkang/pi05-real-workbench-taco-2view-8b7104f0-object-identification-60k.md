# jaehyunkang/pi05-real-workbench-taco-2view-8b7104f0-object-identification-60k

## Resumen

El modelo `jaehyunkang/pi05-real-workbench-taco-2view-8b7104f0-object-identification-60k` es un checkpoint final de un ajuste fino sobre `lerobot/pi05_base`, la implementacion de Pi0.5 mantenida dentro del ecosistema LeRobot. No es un modelo de lenguaje generalista, sino una politica vision-lenguaje-accion (VLA) entrenada para control robotico: recibe imagenes de dos camaras, un estado propioceptivo de 8 dimensiones y una instruccion en texto, y produce una accion de 7 dimensiones expresada como velocidad cartesiana del efector final mas la garra.

Lo publica el usuario de Hugging Face `jaehyunkang` y esta especializado en una unica tarea, `object_identification`, dentro del conjunto de datos `Myungkyu/real_workbench-taco-keyframe-gemini`. El entrenamiento se detuvo tras 60.000 pasos de optimizacion con lote global de 32 sobre 2 GPU y semilla 42. Su relevancia actual es acotada pero concreta: sirve como artefacto de inferencia reproducible para quien quiera reproducir o reutilizar una politica Pi0.5 ya ajustada, con pesos, configuracion y estados de normalizacion incluidos en la raiz del repositorio.

El checkpoint pesa 9,4 GB y declara 4.143.404.816 parametros (~4,14 mil millones) en formato safetensors. La model card no incluye metricas de evaluacion en robot real ni licencia explicita, dos ausencias que condicionan por completo su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) de la familia Pi0.5 sobre LeRobot: columna vertebral PaliGemma con tokenizer `google/paligemma-3b-pt-224` y cabeza de accion con denoising (10 pasos de inferencia) |
| Parametros totales | 4.143.404.816 (~4,14 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio se distribuye en safetensors (9,4 GB) |
| Idiomas soportados | no disponible; las instrucciones se procesan con el tokenizer de PaliGemma (`google/paligemma-3b-pt-224`, revision de entrenamiento `35e4f46485b4d07967e7e9935bc3786aad50687c`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria de inferencia | lerobot |
| Modelo base | lerobot/pi05_base (fine-tune) |
| Tarea objetivo | object_identification |
| Vistas de entrada | 2 (exterior y muneca) |
| Resolucion de imagen | 224x126 almacenada; la politica rellena a 224x224 |
| Dimension del estado | 8 |
| Dimension de la accion | 7 (delta EEF: 6 de velocidad cartesiana + garra) |
| Horizonte de accion | 50 (chunk de accion / horizonte de ejecucion) |
| Pasos de denoising en inferencia | 10 |
| Pasos de entrenamiento | 60.000 |
| Lote global / GPU / semilla | 32 / 2 / 42 |
| Tamano del repositorio | 9,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es una politica VLA de la familia Pi0.5, reimplementada dentro de LeRobot. La pila combina un codificador visual y un modelo de lenguaje sobre el tokenizer de PaliGemma-3B con una cabeza de accion que genera el chunk de acciones mediante un proceso de denoising; la model card fija ese proceso en 10 pasos de inferencia y un horizonte de ejecucion de 50 acciones. La entrada multimodal se compone de dos flujos de imagen (camara exterior y camara de muneca), un vector de estado de 8 dimensiones y un texto de tarea. La salida es un vector de accion de 7 dimensiones: 6 componentes de velocidad cartesiana del efector final mas el comando de garra. Las imagenes se almacenan a 224x126 y la politica las rellena hasta 224x224 antes de procesarlas.

El ajuste fino se ejecuto durante 60.000 pasos de optimizacion con lote global 32 sobre 2 GPU y semilla 42, partiendo de `lerobot/pi05_base` y usando el dataset `Myungkyu/real_workbench-taco-keyframe-gemini`. La implementacion de entrenamiento citada es `RLWRLD/hiwrld-ll-policy`, que incorpora una copia vendorizada del Pi0.5 de LeRobot; la model card advierte que los campos de entrada personalizados pueden exigir esa misma implementacion para funcionar. El repositorio publica pesos de politica, configuracion, preprocesado y postprocesado y estados de normalizacion, pero excluye el estado de optimizador y de reanudacion del entrenamiento; las rutas especificas de la maquina anfitriona se eliminaron del JSON de metadatos. No se documenta en la informacion disponible el volumen de tokens, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de acciones roboticas: produce chunks de 50 acciones con horizonte de ejecucion y 7 grados de libertad (6 de velocidad cartesiana del EEF mas garra) a partir de observaciones visuales y estado propioceptivo.
- Percepcion visual bi-camara: procesa simultaneamente una vista exterior y una vista de muneca, con relleno de 224x126 a 224x224.
- Identificacion de objetos: el alcance declarado del ajuste es la subtarea `object_identification` dentro del banco de trabajo real.
- Condicionamiento por instruccion en lenguaje natural: la politica acepta texto de tarea; para modelos de subtarea debe entregarse la subtarea por fotograma correspondiente en el campo `task`.
- Ejecucion reactiva de politica: inferencia con 10 pasos de denoising por chunk de accion.
- Soporte de tool calling / function calling: no aplica ni esta documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo es una politica de control, no un agente de planificacion.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision adicional, audio): no documentadas.

## Casos de uso

- Manipulacion robotica de laboratorio: la politica puede ejecutar la subtarea de identificacion de objetos sobre un banco de trabajo instrumentado, tomando la vista exterior para localizar la pieza y la vista de muneca para el ajuste fino previo a la accion.
- Recogida y clasificacion de piezas: con 7 dimensiones de accion delta EEF y chunks de 50 pasos, el modelo encadena aproximaciones y cierres de garra sin re-planificacion por fotograma.
- Investigacion en VLA: sirve como punto de partida reproducible (semilla 42, 60.000 pasos, lote 32) para estudiar tecnicas de ajuste fino sobre `lerobot/pi05_base`.
- Comparacion de horizontes de accion: al fijar horizonte 50 y 10 pasos de denoising, permite medir el compromiso entre reactividad y suavidad del movimiento en el mismo banco de trabajo.
- Recopilacion de datos con keyframes: el pipeline asociado (`Myungkyu/real_workbench-taco-keyframe-gemini`) admite variantes de 3 vistas, de modo que este checkpoint de 2 vistas puede actuar como linea base frente a configuraciones con imagen de keyframe adicional.
- Demostraciones educativas de robotica: el repositorio incluye normalizacion y preprocesado, lo que simplifica montar un entorno de inferencia con LeRobot sin reentrenar.
- Curation de subtareas: al exigir la subtarea por fotograma como texto de tarea, el modelo se integra en pipelines donde el etiquetado de subtareas ya existe en parquet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que es un checkpoint entrenado, no un resultado de evaluacion, y que no se reclama ninguna metrica de evaluacion en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 8,3 GB en bf16 solo para pesos (4.143.404.816 parametros), mas activaciones y buffers de imagen; en la practica se recomienda un minimo de 12 GB en bf16. En fp32 los pesos solos ocuparian unos 16,6 GB.
- GPU recomendadas: cualquier GPU con 16 GB o mas de memoria para bf16; RTX 4090 (24 GB), RTX 3090 (24 GB), L4 (24 GB), A10G (24 GB) y A100/H100 para despliegues con mas paralelismo o entrenamiento.
- Cabe en GPU de consumo: si, en tarjetas con 16-24 GB (RTX 4090, RTX 3090, RTX 4080 en cuantizacion o bf16 con cuidado de activaciones).
- Opciones de despliegue: LeRobot (libreria declarada) sobre PyTorch; el artefacto esta pensado para la implementacion vendorizada `RLWRLD/hiwrld-ll-policy`. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama no estan soportados de forma directa. vLLM y TGI no estan documentados para esta politica.
- Entrenamiento: la configuracion declarada uso 2 GPU con lote global 32; con 4,14 mil millones de parametros, el ajuste fino completo requiere tecnicas de reparto de memoria o precision reducida para no superar 24 GB por dispositivo.
- Latencia y throughput estimados: no disponibles. Como referencia de configuracion, cada chunk de accion implica 10 pasos de denoising y cubre 50 acciones, pero no se publican tiempos por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| pi05-real-workbench-taco-2view-8b7104f0-object-identification-60k | 4,14 mil millones | horizonte de accion 50; 10 pasos de denoising | no disponible | Hugging Face, 0 descargas | Fine-tune especializado en `object_identification` |
| lerobot/pi05_base | no disponible | no disponible | no disponible | Hugging Face | Modelo base declarado del fine-tune |
| lerobot/pi0_base | no disponible | no disponible | no disponible | Hugging Face | Version anterior de la familia Pi0 en LeRobot |
| OpenVLA-7B | ~7 mil millones (no confirmado en la informacion disponible) | no disponible | no disponible | Hugging Face | VLA abierta de proposito general, no especializada en este banco de trabajo |

Los datos de rendimiento comparado no estan disponibles en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia de licencia: el campo de licencia figura como "no disponible", lo que impide determinar si el uso comercial esta permitido. No deberia desplegarse en produccion sin aclarar este punto con el autor.
- Sin evaluacion en robot real: la propia model card declara que no se reclama ninguna metrica de evaluacion real; no hay evidencia publicada de exito en tareas.
- Alcance muy restringido: el ajuste cubre una unica tarea (`object_identification`) sobre un banco de trabajo concreto y una distribucion de camaras fija (2 vistas, exterior y muneca).
- Dependencia del texto de tarea: para modelos de subtarea hay que suministrar la subtarea por fotograma como campo `task`; omitirla o etiquetarla mal degrada las acciones generadas.
- Dependencia de la implementacion: los campos de entrada personalizados pueden requerir la implementacion vendorizada `RLWRLD/hiwrld-ll-policy`; otras copias de LeRobot podrian no ser compatibles.
- Normalizacion acoplada al dataset: los estados de normalizacion incluidos en el repositorio estan calculados sobre `Myungkyu/real_workbench-taco-keyframe-gemini`; aplicarlos a otra camara, iluminacion o robot invalida las acciones.
- Sin estado de reanudacion: el artefacto excluye optimizador y estado de entrenamiento, y las rutas de la maquina original se eliminaron; reanudar el entrenamiento exige reconstruir rutas locales.
- Riesgo de alucinacion y de falsa confianza: al ser una politica condicionada por lenguaje, puede producir acciones plausibles pero incorrectas ante instrucciones ambiguas o escenas fuera de distribucion, sin ninguna senal interna de incertidumbre documentada.
- Idiomas: no hay informacion sobre cobertura linguistica de las instrucciones; el tokenizer procede de PaliGemma, pero no se documenta que idiomas funcionan en la practica.
- Validacion comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusion publica que confirmen su funcionamiento.
- Fechas del repositorio: la model card y los metadatos registran fechas de 2026, posteriores a la mayoria de referencias publicas de la familia Pi0.5; conviene verificar la procedencia del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaehyunkang/pi05-real-workbench-taco-2view-8b7104f0-object-identification-60k
- Dataset de entrenamiento: https://huggingface.co/datasets/Myungkyu/real_workbench-taco-keyframe-gemini
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Tokenizer de referencia: https://huggingface.co/google/paligemma-3b-pt-224
- Implementacion de entrenamiento citada: https://github.com/RLWRLD/hiwrld-ll-policy
- Las busquedas web realizadas no devolvieron enlaces relevantes sobre este modelo ni sobre la familia Pi0.5; los resultados obtenidos correspondian a un videojuego sin relacion con el contenido de esta ficha.
