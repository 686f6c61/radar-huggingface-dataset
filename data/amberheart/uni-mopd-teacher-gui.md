# AmberHeart/Uni-MOPD-Teacher-GUI

## Resumen

Uni-MOPD-Teacher-GUI es un modelo especialista en GUI grounding, es decir, en localizar elementos de interfaz sobre capturas de pantalla y devolver la accion de clic correspondiente en coordenadas normalizadas. Lo desarrolla el usuario AmberHeart como parte del banco Uni-MOPD, un conjunto de cinco especialistas multimodales destilados a partir de un mismo checkpoint base. El modelo parte de Qwen/Qwen3-VL-30B-A3B-Instruct, un modelo vision-language de arquitectura mixture-of-experts con 31.070.754.032 parametros totales y 3.000 millones de parametros activos por token.

El modelo resuelve un problema concreto: integrar capacidades de dominio especializado en un unico modelo unificado mediante destilacion on-policy multi-profesor (MOPD). En este caso, el especialista cubre GUI grounding y se post-entrena desde el checkpoint base compartido con una ruta propia que termina en aprendizaje por refuerzo sobre su dominio. Segun la model card, es el que mejor rinde en su dominio entre los cinco especialistas del banco.

Es relevante ahora porque propone un enfoque de "strong start, simple recipe": inicializar el estudiante con un merge uniforme sin entrenamiento de los especialistas y refinarlo con una destilacion MOPD corta con muestreo uniforme de dominios y KL inversa sobre el vocabulario completo. El modelo se distribuye en bfloat16, en 14 shards de safetensors, bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language mixture-of-experts (Qwen3-VL MoE) |
| Parametros totales | 31.070.754.032 |
| Parametros activos | 3.000 millones (aproximado, segun el identificador A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (14 shards, bfloat16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint base Qwen3-VL-30B-A3B-Instruct: un transformer multimodal con mezcla de expertos, disenado para entrada image-text-to-text. Los cinco especialistas del banco Uni-MOPD comparten arquitectura y vocabulario porque parten del mismo checkpoint, lo que permite tanto el merge en espacio de pesos como la destilacion a nivel de token.

El entrenamiento de este especialista sigue la ruta de post-entrenamiento de su dominio, que termina con aprendizaje por refuerzo sobre GUI grounding. La innovacion del marco Uni-MOPD consiste en tratar el punto de partida como variable de diseno: el estudiante se inicializa con un merge uniforme sin entrenamiento de los especialistas (repositorio Uni-MOPD-Merge) y se refina con una MOPD corta con muestreo uniforme de dominios y KL inversa sobre el vocabulario completo. En MOPD, el estudiante genera respuestas a las consultas de entrenamiento y el profesor del dominio de cada consulta las supervisa. No se especifican en la informacion disponible el numero de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- GUI grounding: dada una captura de pantalla y una descripcion de elemento, localiza el elemento y emite una accion de clic en JSON con coordenadas normalizadas de 0 a 1000.
- Razonamiento breve previo a la accion: la model card indica que el modelo razona brevemente sobre la ubicacion del elemento antes de emitir el JSON.
- Salida estructurada: formato JSON con campos `action.name`, `action.button`, `action.click_type`, `x` e `y`.
- Procesamiento de imagen y texto: pipeline image-text-to-text, con soporte de plantillas de chat via `apply_chat_template`.
- Capacidades generales del modelo base (vision-language y mezcla de expertos): no detalladas en la informacion disponible para este especialista.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Automatizacion de pruebas de interfaz: el modelo recibe una captura de la aplicacion y la descripcion del elemento a probar, y devuelve las coordenadas del clic para que un runner de tests (Playwright, Appium, Selenium) ejecute la accion sobre el elemento correcto, reduciendo la dependencia de selectores fragiles.
- Agentes de automatizacion de escritorio: integrado en un bucle de agente que captura la pantalla, pide al modelo la accion de clic y la ejecuta, permite construir flujos de RPA sobre aplicaciones sin API accesible.
- Asistencia a usuarios en soporte remoto: dado un screenshot enviado por el usuario y una descripcion del boton o campo que necesita, el modelo devuelve la coordenada exacta para guiar al usuario o ejecutar la accion en una sesion asistida.
- Generacion de datasets de grounding: el modelo puede etiquetar pares captura-descripcion-coordenada a escala para entrenar modelos de GUI mas pequenos o para aumentar datasets existentes.
- Automatizacion de tareas repetitivas en aplicaciones legacy: en entornos sin API, un agente basado en este modelo puede localizar menus, formularios y botones a partir de la descripcion en lenguaje natural y emitir los clics necesarios.
- Validacion de accesibilidad y consistencia visual: comparar la ubicacion devuelta por el modelo con la posicion real del elemento en distintas resoluciones o temas permite detectar regresiones de layout en pipelines de integracion continua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma que el modelo "lidera su propio dominio entre los cinco" especialistas del banco, pero no incluye cifras concretas de evaluacion de GUI grounding ni comparaciones numericas.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 62 GB solo para los pesos, mas memoria para el procesador de vision, cache KV y activaciones; en la practica se requiere un nodo multi-GPU.
- Cuantizacion: no se publican pesos GGUF ni cuantizados en el repositorio; habria que generarlos a partir de los safetensors bfloat16.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU (por ejemplo, 2 x A100 40 GB o 2 x RTX 4090 24 GB con offload). No cabe en una unica GPU de consumo en bfloat16.
- Despliegue: la model card solo documenta uso con `transformers>=4.57.1` y `Qwen3VLMoeForConditionalGeneration`. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face; no se detalla soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Uni-MOPD-Teacher-GUI | 31.070.754.032 | no disponible | GUI grounding | Apache 2.0 | Hugging Face (AmberHeart) |
| Qwen/Qwen3-VL-30B-A3B-Instruct (base) | 31.070.754.032 (3B activos) | no disponible | Vision-language general | Apache 2.0 | Hugging Face (Qwen) |
| Uni-MOPD (estudiante unificado) | no disponible | no disponible | Cinco dominios integrados | Apache 2.0 | Hugging Face (AmberHeart) |
| Uni-MOPD-Teacher-STEM / VQA / OCR / Embodied | no disponible | no disponible | Especialistas por dominio | Apache 2.0 | Hugging Face (AmberHeart) |

Los modelos comparables mas directos son los otros especialistas del mismo banco y el checkpoint base. No se dispone de datos de rendimiento comparativo entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta post-entrenado para GUI grounding; su rendimiento fuera de ese dominio no esta documentado y probablemente sea inferior al del modelo base.
- Riesgo de alucinacion: puede devolver coordenadas plausibles pero incorrectas, especialmente en capturas con elementos solapados, resoluciones atipicas o descripciones ambiguas. Conviene validar la accion antes de ejecutarla en produccion.
- Dependencia del formato de prompt: la evaluacion y el comportamiento esperado asumen el prompt de GUI grounding documentado; desviarse de el puede degradar la calidad de la salida.
- Idiomas: no se especifican los idiomas soportados en la informacion disponible.
- Contexto: no se publica la longitud de contexto del modelo.
- Licencia: Apache 2.0, heredada del modelo base, permite uso comercial; deben conservarse los archivos `LICENSE` y `NOTICE` con la declaracion de modificaciones.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de adopcion ni validacion externa.
- Requisitos de memoria: el tamano en bfloat16 (62,2 GB de repo) limita el despliegue a infraestructura con GPUs de alta capacidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AmberHeart/Uni-MOPD-Teacher-GUI
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-30B-A3B-Instruct
- Estudiante unificado: https://huggingface.co/AmberHeart/Uni-MOPD
- Merge inicial: https://huggingface.co/AmberHeart/Uni-MOPD-Merge
- Especialista STEM: https://huggingface.co/AmberHeart/Uni-MOPD-Teacher-STEM
- Especialista VQA: https://huggingface.co/AmberHeart/Uni-MOPD-Teacher-VQA
- Especialista OCR: https://huggingface.co/AmberHeart/Uni-MOPD-Teacher-OCR
- Especialista Embodied: https://huggingface.co/AmberHeart/Uni-MOPD-Teacher-Embodied
