# prithivMLmods/AA-VL-4B-GGUF

## Resumen

AA-VL-4B-GGUF es la versión cuantizada en formato GGUF de AA-VL-4B, un modelo vision-language especializado en *GUI grounding* (localización de elementos de interfaz) desarrollado a partir de Qwen3-VL-4B-Instruct. El modelo base, emirozcan16/AA-VL-4B, se creó fusionando un adaptador LoRA (r=32, alpha=64) sobre Qwen3-VL-4B-Instruct y se entrenó con aproximadamente 7.000 muestras curadas, combinando anotaciones de clics con ejemplos sintéticos de rechazo. Su tarea consiste en mapear capturas de pantalla de escritorio, web y móvil a coordenadas de clic normalizadas (0–999), o rechazar la petición cuando el elemento de interfaz solicitado no está presente en la imagen.

Su relevancia radica en que, con unos 4.000 millones de parámetros y un presupuesto de entrenamiento de apenas 8 dólares en GPU en la nube, supera en benchmarks de grounding a modelos mucho mayores como UI-TARS-72B o UI-Venus-1.5-8B en algunas métricas. Esto lo convierte en una opción muy eficiente para construir agentes de uso de ordenador (computer-use agents) que puedan ejecutarse localmente. La versión GGUF distribuida por prithivMLmods permite inferencia local mediante llama.cpp y LM Studio, con cuantizaciones desde Q2_K hasta F16, e incluye el archivo de proyección multimodal (mmproj) necesario para procesar imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model basado en Qwen3-VL (transformer multimodal) con adaptador LoRA fusionado |
| Parametros totales | 4.022.468.096 (aprox. 4,02 B; la model card menciona 4,44 B) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K a F16 en GGUF: Q3_K_L, Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, BF16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con mmproj.gguf para la parte visual); el modelo base tambien esta disponible en safetensors FP16 y como adaptador LoRA independiente |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-4B-Instruct, una arquitectura transformer multimodal que combina un codificador visual con un modelo de lenguaje, comunicados mediante un proyector multimodal (distribuido por separado como mmproj.gguf en la version GGUF). Sobre este modelo base se entreno un adaptador PEFT LoRA con rango r=32 y alpha=64, que posteriormente se fusiono en los pesos para obtener el modelo final merged. El entrenamiento siguio un esquema en dos etapas: una primera fase de QLoRA en 4 bits seguida de 250 pasos adicionales en FP16.

El dataset de entrenamiento consta de aproximadamente 7.000 muestras curadas que combinan anotaciones de clic (coordenadas normalizadas 0–999 sobre capturas de escritorio, web y movil) con ejemplos sinteticos de rechazo, lo que permite al modelo negarse a devolver coordenadas cuando el elemento de interfaz objetivo no existe en la captura. El desarrollo completo se realizo con un presupuesto aproximado de 8 dolares en GPU en la nube, y el repositorio original incluye logs de predicciones por muestra en JSONL, prompts, datos de coordenadas y bounding boxes, y checksums SHA-256 para reproducibilidad.

## Capacidades

- GUI grounding: mapeo de capturas de pantalla (escritorio, web y movil) a coordenadas de clic normalizadas en el rango 0–999.
- Rechazo controlado: el modelo puede indicar que el elemento de interfaz solicitado no esta presente, reduciendo falsos clics.
- Generacion de bounding boxes y datos de coordenadas para elementos de interfaz.
- Comprension de imagen y texto (pipeline image-text-to-text) heredada de Qwen3-VL.
- Inferencia local eficiente gracias a las cuantizaciones GGUF, compatible con llama.cpp y LM Studio.
- No es un modelo de proposito general: esta especializado en localizacion de elementos de UI, no en conversacion abierta, razonamiento general ni generacion de codigo.

## Casos de uso

- Agentes de automatizacion de escritorio (computer-use agents): un agente puede capturar la pantalla, enviarla al modelo junto con una instruccion en lenguaje natural ("haz clic en el boton Enviar") y recibir coordenadas normalizadas para ejecutar el clic mediante herramientas como pyautogui.
- Automatizacion de pruebas de interfaces web: integracion en pipelines de testing para verificar que un boton, enlace o campo de formulario existe y donde se ubica, sin selectores CSS fragiles.
- RPA (automatizacion robotica de procesos): sustitucion de automatizaciones basadas en selectores DOM por automatizaciones visuales que funcionan sobre aplicaciones legacy, escritorios remotos o apps sin API.
- Agentes moviles: localizacion de elementos en capturas de pantallas de Android o iOS para orquestar flujos de interaccion en aplicaciones moviles.
- Evaluacion de agentes en OSWorld y benchmarks similares: el modelo esta optimizado para entornos tipo OSWorld, util como modulo de grounding en sistemas de investigacion sobre agentes de UI.
- Accesibilidad: construccion de asistentes que ayuden a usuarios a localizar e interactuar con elementos de la interfaz mediante comandos de voz o texto.
- Verificacion de presencia de elementos: gracias a los ejemplos de rechazo sinteticos, puede usarse como comprobador de que un elemento esperado aparece (o no) en una captura, util en monitorizacion de UI.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluacion greedy pass@1 estricta, sin cropping, zoom, planners ni reranking):

| Benchmark | AA-VL-4B | Comparativa |
|---|---|---|
| OSWorld-G Original | 65,25 % | Supera a varios modelos 7B–8B (no se detallan cifras) |
| OSWorld-G Refined | 74,47 % | UI-Venus-1.5-8B: 74,1 % |
| UI-Vision Final Pooled | 29,93 % | UI-TARS-72B: 25,50 %; UI-Venus-1.0-7B: 26,5 %; Phi-Ground: 27,2 % |
| UI-Vision Basic | 39,28 % | no disponible |
| UI-Vision Functional | 37,75 % | no disponible |
| UI-Vision Spatial | 14,21 % | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del LLM, sin contar el mmproj ni la KV cache):
  - Q3_K_M: ~2,1 GB
  - Q4_K_M: ~2,5 GB
  - Q5_K_M: ~2,9 GB
  - Q6_K: ~3,3 GB
  - Q8_0: ~4,3 GB
  - BF16: ~8,1 GB
  - A estos valores hay que sumar el proyector visual mmproj-bf16 (~839 MB) y la memoria de contexto e imagen.
- Cabe comodamente en GPUs de consumo: cualquier GPU con 6–8 GB de VRAM (RTX 3060, RTX 4060) ejecuta las cuantizaciones Q4–Q6; con 16 GB (RTX 4060 Ti 16GB, RTX 4080) puede usarse Q8_0 o BF16. Tambien es viable en CPU con suficiente RAM gracias a llama.cpp.
- GPUs recomendadas: para inferencia local, RTX 3060/4060 o superiores; para el modelo en FP16 con transformers, una GPU con 12–16 GB de VRAM o superior.
- Opciones de despliegue: llama.cpp (repositorio oficial de referencia), LM Studio, Hugging Face Transformers (con los pesos merged del modelo base) y text-generation-inference (indicado en los tags).
- No se han publicado cifras de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| AA-VL-4B | ~4,0–4,4 B | GUI grounding (click coords) | Apache-2.0 | GGUF, safetensors, adaptador LoRA |
| UI-Venus-1.5-8B | ~8 B | Agente de UI / grounding | No disponible | Pesos abiertos |
| UI-TARS-72B | ~72 B | Agente de UI / grounding | No disponible | Pesos abiertos |
| Phi-Ground | No disponible | GUI grounding | No disponible | No disponible |

AA-VL-4B destaca por ofrecer un rendimiento competitivo en grounding con una fraccion del tamano de sus alternativas, lo que permite despliegue local en hardware de consumo, algo inviable para UI-TARS-72B. Como contrapartida, los modelos mayores suelen integrar planificacion multi-paso y capacidades agenticas mas amplias, mientras que AA-VL-4B se centra exclusivamente en el modulo de localizacion.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta afinado para GUI grounding y rechazo; no es adecuado como asistente conversacional general ni para generacion de texto o codigo sin tareas visuales.
- Rendimiento limitado en tareas espaciales: en UI-Vision Spatial solo alcanza un 14,21 %, por lo que las interacciones que requieren razonamiento espacial complejo (arrastrar, deslizamientos precisos) pueden ser poco fiables.
- Riesgo de alucinacion de coordenadas: aunque se entreno con ejemplos de rechazo, en produccion conviene validar las coordenadas devueltas antes de ejecutar acciones irreversibles.
- Idioma: la model card declara soporte solo para ingles; el comportamiento con instrucciones en castellano no esta documentado.
- Contexto: la longitud de contexto no esta especificada en la model card; habra que consultar la ficha de Qwen3-VL-4B-Instruct para el valor heredado.
- Discrepancia de parametros: safetensors indica ~4,02 B mientras la model card menciona 4,44 B; conviene verificarlo segun el formato utilizado.
- Licencia: Apache-2.0, sin restricciones relevantes para uso comercial.
- Proyecto de bajo presupuesto y comunidad pequena (476 descargas, 1 like en el momento de la ficha): menor garantia de mantenimiento, auditoria y soporte frente a modelos corporativos.
- Para usar la parte visual en llama.cpp es imprescindible cargar tambien el archivo mmproj correspondiente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/AA-VL-4B-GGUF
- Modelo base: https://huggingface.co/emirozcan16/AA-VL-4B
- Modelo original de referencia: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- llama.cpp: https://github.com/ggml-org/llama.cpp
- No se han encontrado enlaces a papers, demos ni blogs adicionales en la informacion disponible.
