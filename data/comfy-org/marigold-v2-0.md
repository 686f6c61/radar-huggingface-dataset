# Comfy-Org/marigold-v2-0

## Resumen

Marigold v2 es un conjunto de modelos de difusion para estimacion de propiedades intrinsecas de la imagen (profundidad, normales de superficie y albedo) desarrollado originalmente por Huawei Bayer Lab y reempaquetado por Comfy-Org para su uso directo en ComfyUI. El repositorio aqui descrito no contiene el modelo original en su formato de investigacion, sino una distribucion en ficheros unicos (single-file) con LoRAs, embeddings de condicionamiento y VAEs separados por tarea, lista para cargarse en nodos de ComfyUI.

La relevancia de este modelo radica en que adapta la formulacion de difusion a la prediccion de mapas geometricos y de reflectancia a partir de una sola imagen RGB, una tarea tradicionalmente resuelta con redes discriminativas especializadas. Al reutilizar un backbone de difusion (los ficheros incluyen `qwen_image_edit_2509_int8_convrot.safetensors` como modelo de difusion base), Marigold v2 aprovecha el conocimiento visual de un modelo generativo preentrenado y lo especializa mediante LoRAs por tarea.

El repositorio tiene un tamano de 38,1 GB, lo que refleja que empaqueta multiples componentes (tres LoRAs, tres VAEs, tres embeddings de condicionamiento y el modelo de difusion base). Es una opcion practica para pipelines de vision por computador en produccion dentro del ecosistema ComfyUI, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (backbone `qwen_image_edit_2509_int8_convrot`), con LoRAs y VAEs especificos por tarea |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | Pesos en safetensors; el backbone se distribuye en int8 (`int8_convrot`) |
| Idiomas soportados | no disponible (modelo de vision, sin interfaz de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (single-file, compatible con ComfyUI) |

## Arquitectura y entrenamiento

Marigold v2 sigue un enfoque de difusion condicionada por imagen: se parte de un modelo de difusion de imagenes (en este empaquetado, la variante `qwen_image_edit_2509_int8_convrot`) y se especializa mediante LoRAs independientes para cada tarea de estimacion: profundidad (`marigold_v2_depth_log_stage2`), normales de superficie (`marigold_v2_normals`) y albedo (`marigold_v2_albedo`). Cada tarea cuenta ademas con su propio VAE y su propio embedding de condicionamiento, lo que permite cargar y descargar los componentes segun la tarea sin arrastrar el resto del conjunto.

El prefijo `log_stage2` en la LoRA de profundidad sugiere un entrenamiento en dos etapas con representacion logaritmica de la profundidad, un esquema habitual para estabilizar el rango dinamico en escenas con objetos cercanos y lejanos. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Estimacion de profundidad monocular a partir de una imagen RGB, con salida en escala logaritmica en la etapa 2.
- Estimacion de normales de superficie por pixel.
- Estimacion de albedo (reflectancia difusa) por pixel.
- Ejecucion como pipeline de difusion dentro de ComfyUI mediante nodos y workflows predefinidos.
- Carga modular por tarea: solo se necesita el par LoRA + VAE + embedding de la tarea concreta.
- Integracion con el grafo de nodos de ComfyUI, lo que permite encadenar la salida con otros modelos (por ejemplo, generacion condicionada por profundidad o normales).
- No soporta tool calling, agentes ni procesamiento de lenguaje natural: es un modelo puramente visual.

## Casos de uso

- Reconstruccion 3D y fotogrametria: la salida de profundidad y normales permite generar mapas de profundidad y mallas densas a partir de una unica fotografia, util en pipelines de escaneo de interiores o modelado de producto donde no se dispone de vistas estereo.
- Reiluminacion y compositing: el mapa de albedo separa la reflectancia difusa de la iluminacion, lo que permite recolorear o reiluminar objetos en postproduccion sin recalcular la geometria de la escena.
- Generacion de imagen condicionada por geometria: los mapas de profundidad y normales se pueden usar como ControlNet o como condicionamiento en modelos de difusion para mantener la estructura de una imagen de referencia al regenerarla con otro estilo.
- Efectos de profundidad de campo y bokeh sintetico: el mapa de profundidad por pixel permite aplicar desenfoque selectivo realista en video o fotografia sin lentes fisicas.
- Poblar escenas 3D y realidad aumentada: la combinacion de profundidad y normales facilita la oclusion y la colocacion de objetos virtuales sobre superficies reales en aplicaciones de AR.
- Preprocesado para datasets de vision: generar anotaciones automaticas de profundidad, normales y albedo para entrenar otros modelos discriminativos o para aumentar datasets existentes.
- Analisis de materiales y defectos: el albedo y las normales ayudan a detectar irregularidades superficiales en inspeccion industrial o en digitalizacion de patrimonio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio completo ocupa 38,1 GB, pero la inferencia por tarea solo requiere el backbone mas la LoRA, el VAE y el embedding de esa tarea, por lo que el consumo real es inferior al tamano total del repo.
- El backbone se distribuye en int8, lo que reduce el requisito de memoria frente a una version fp16 equivalente.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el tamano del backbone de difusion, se espera que requiera GPU con al menos 8-12 GB de VRAM para resoluciones moderadas, pero este dato no esta confirmado.
- Opciones de despliegue: ComfyUI (soporte nativo mediante los workflows oficiales); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de difusion de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|
| Marigold v2 (este repo) | Difusion + LoRAs | Profundidad, normales, albedo | Apache 2.0 | Hugging Face, ComfyUI |
| Marigold v1 (huawei-bayerlab) | Difusion | Profundidad | no disponible en la informacion | Hugging Face |
| Depth Anything | Discriminativo | Profundidad | no disponible en la informacion | Hugging Face |
| Stable Normal | Difusion | Normales | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Este repositorio es un reempaquetado para ComfyUI, no la publicacion original; para detalles de entrenamiento y evaluacion conviene consultar el repositorio `huawei-bayerlab/marigold-v2-0`.
- El modelo estima propiedades intrinsecas a partir de una sola imagen, una tarea ambigua por naturaleza: la profundidad y el albedo pueden ser inconsistentes en escenas con iluminacion compleja, superficies especulares o transparencias.
- No hay informacion sobre sesgos del dataset de entrenamiento; al ser un modelo visual, los sesgos se manifestarian en el rendimiento desigual segun tipo de escena, iluminacion o demografia de los sujetos.
- Riesgo de artefactos y alucinacion geometrica en regiones ocluidas o con textura repetitiva.
- El uso comercial esta permitido por la licencia Apache 2.0, pero se recomienda verificar las licencias de los componentes base (el backbone `qwen_image_edit_2509_int8_convrot`) antes de desplegar en produccion.
- El modelo no procesa texto ni instrucciones en lenguaje natural; no debe confundirse con un modelo de lenguaje multimodal.
- La estructura de carpetas de ComfyUI es obligatoria para que los nodos encuentren los ficheros; una instalacion incorrecta provoca fallos de carga.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Comfy-Org/marigold-v2-0
- Modelo original: https://huggingface.co/huawei-bayerlab/marigold-v2-0
- ComfyUI: https://github.com/Comfy-Org/ComfyUI
- Workflow de estimacion de profundidad: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_marigold_v2_depth_estimation.json
- Workflow de estimacion de normales: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_marigold_v2_surface_normal_estimation.json
- Workflow de estimacion de albedo: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_marigold_v2_albedo_estimation.json
