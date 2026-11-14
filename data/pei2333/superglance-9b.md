# pei2333/SuperGlance-9B

## Resumen

SuperGlance-9B es un modelo de conduccion autonoma de extremo a extremo desarrollado por el usuario pei2333, construido mediante ajuste fino de Qwen/Qwen3.5-9B. El modelo procesa la camara frontal (frame actual y tres frames pasados) junto con el estado del ego vehiculo, y puntua una biblioteca fija de 5.273 trayectorias candidatas, cada una compuesta por 8 poses futuras (x, y, heading). Esta version corresponde al modelo final tras la etapa de aprendizaje por refuerzo (RL'), con su LoRA fusionada en el modelo de la etapa 2 (SuperGlance-9B-Stage2).

La relevancia del modelo radica en su enfoque de planificacion de movimiento basado en seleccion de candidatos mediante una cabeza de eleccion lineal sobre el estado oculto final del transformer, en lugar de generacion autoregresiva de trayectorias. Alcanza un PDMS de 91,51 en NAVSIM v1.1 navtest y un RFS de 7,987 en WOD-E2E test, metricas competitivas en el ambito de conduccion end-to-end.

El repositorio tiene caracter privado y sus terminos de publicacion estan pendientes. La licencia declarada es "superglance-pending" y el modelo hereda restricciones no comerciales de los datasets de entrenamiento (Waymo Open Dataset, NAVSIM, PhysicalAI-AV), lo que limita su uso en produccion o en operacion de vehiculos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5-9B) con cabeza de eleccion lineal sobre 5.273 candidatos |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | superglance-pending (restricciones no comerciales heredadas de Waymo, NAVSIM y PhysicalAI-AV) |
| Formato de pesos | safetensors (bf16), mas `choice_head.safetensors`, `candidates_k5273.npy`, `extend_head.json`, `MERGE_INFO.json` y `adapter/` |

## Arquitectura y entrenamiento

SuperGlance-9B parte de Qwen3.5-9B, un transformer multimodal que recibe la imagen de la camara frontal (frame actual y tres frames pasados) y el estado del ego, y produce un estado oculto final en la ultima posicion del prompt. Sobre ese estado se aplica una cabeza de eleccion lineal (`choice_head`) con pesos de forma [5273, 4096] y sesgo [5273], que genera logits sobre las 5.273 trayectorias candidatas. La planificacion final se obtiene aplicando softmax con temperatura τ = 0,2 sobre los 64 logits mas altos y combinando las poses de esos candidatos ponderadas por sus probabilidades. La biblioteca de candidatos (`candidates_k5273.npy`) contiene 8 poses futuras por candidato con coordenadas x, y en metros y heading en radianes.

El entrenamiento se estructuro en cinco etapas: (1) QA de opcion multiple con 1.158.150 preguntas; (2) la etapa 1 mas 124.378 preguntas de DriveLM-nuScenes, dando lugar a SuperGlance-9B-Stage2; (3) SFT de conduccion supervisada sobre NAVSIM navtrain (OpenScene / nuPlan), PhysicalAI-AV y filas de WOD-E2E, excluyendo los splits de evaluacion; (4) S1, una continuacion sobre el mismo pool sustituyendo las filas de WOD-E2E por frames 135-165 del split de entrenamiento; y (5) RL sobre la biblioteca de candidatos. La fusion de la LoRA de RL' se realizo con la aritmetica W' = round_bf16(W + 2,0 · B·A) sobre 200 matrices. La cabeza se extendio de 5.121 a 5.273 candidatos antes del RL, segun `extend_head.json`.

## Capacidades

- Comprension de imagenes de camara frontal en contexto temporal (frame actual y tres frames pasados) para percepcion de escena de conduccion.
- Prediccion de trayectorias futuras del ego vehiculo: 8 poses (x, y, heading) por candidato.
- Puntuacion y seleccion entre 5.273 trayectorias candidatas mediante cabeza lineal.
- Planificacion de movimiento end-to-end sin modulo explicito de percepccion intermedio.
- Respuesta a preguntas de opcion multiple sobre escenas de conduccion (heredado de las etapas 1 y 2 de QA).
- Procesamiento de estado del ego vehiculo combinado con entrada visual.
- Capacidades generales de Qwen3.5-9B potencialmente preservadas (generacion de texto, razonamiento), aunque no documentadas en la model card para esta variante.
- Soporte de tool calling, function calling y agentes: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en conduccion end-to-end: el modelo sirve como referencia para estudiar planificacion basada en seleccion de candidatos frente a generacion autoregresiva de trayectorias, con metricas publicadas en NAVSIM v1.1 y WOD-E2E.
- Evaluacion comparativa de planificadores: al exponer la biblioteca de candidatos y la cabeza de eleccion, permite analizar como distintas escenas activan distintos candidatos y como la softmax con τ = 0,2 pondera la mezcla final.
- Reproduccion de resultados academicos: la ruta `adapter/` permite cargar el modelo con la LoRA sin fusionar, que es la configuracion con la que se leyeron los numeros del paper, util para replicar exactamente las metricas publicadas.
- Analisis de robustez temporal: la entrada de cuatro frames (actual mas tres pasados) permite estudiar como la informacion historica afecta a la seleccion de trayectorias en situaciones de oclusion o maniobras dinamicas.
- Estudio de sesgos y fallos en conduccion autonoma: al ser un modelo de investigacion con licencia no comercial, es adecuado para auditorias de comportamiento en escenarios de navtest sin riesgo de despliegue en vehiculo.
- Desarrollo de pipelines de evaluacion offline: integrable con `AutoModelForImageTextToText` de transformers para procesar lotes de escenas de NAVSIM o WOD-E2E y calcular PDMS o RFS en entornos de laboratorio.
- Base para experimentos de RL en planificacion: la separacion entre modelo base, cabeza de eleccion y biblioteca de candidatos facilita sustituir o extender la biblioteca y reentrenar la cabeza con nuevas recompensas.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor |
|---|---|---|
| NAVSIM v1.1 navtest | PDMS | 91,51 |
| WOD-E2E test | RFS | 7,987 |

No se han publicado en la informacion disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K) ni comparativas numericas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 19,3 GB solo para pesos (9.653.104.368 parametros × 2 bytes), mas overhead de activaciones, KV cache y procesador de imagen; el repo ocupa 19,7 GB.
- VRAM estimada en cuantizacion de 8 bits: no disponible (no se publican pesos cuantizados).
- VRAM estimada en cuantizacion de 4 bits: no disponible (no se publican pesos cuantizados).
- GPU recomendadas: A100 40GB o H100 para bf16 sin cuantizar; RTX 4090 (24 GB) queda al limite para bf16 y requeriria cuantizacion o descarga parcial.
- Cabe en consumer GPU: posiblemente en RTX 4090 con cuantizacion, pero no se documentan pesos GGUF ni cuantizados en el repositorio.
- Opciones de despliegue: `transformers` con `AutoModelForImageTextToText` (unica via documentada); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SuperGlance-9B | 9.653.104.368 | no disponible | PDMS 91,51 (NAVSIM v1.1); RFS 7,987 (WOD-E2E) | superglance-pending (no comercial) | repo privado, terminos pendientes |
| Qwen3.5-9B (base) | no disponible en la informacion | no disponible | no disponible | Apache-2.0 | publico |
| Alternativas de conduccion end-to-end | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos de conduccion end-to-end en la informacion proporcionada para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Licencia no comercial: el modelo se distribuye bajo el Waymo Dataset License Agreement for Non-Commercial Use y hereda restricciones de NAVSIM (CC BY-NC-SA 4.0), nuPlan/nuScenes y PhysicalAI-AV (NVIDIA Autonomous Vehicle Dataset License Agreement, que prohibe obras derivadas y redistribucion). No puede usarse en operacion de vehiculos, sistemas de produccion ni con fines primordialmente comerciales.
- Terminos de publicacion pendientes: el repositorio es privado y la licencia "superglance-pending" no esta resuelta, por lo que la disponibilidad futura del modelo no esta garantizada.
- Restriccion de uso en vehiculo: la propia model card prohibe explicitamente su uso en la operacion de un vehiculo.
- Dependencia de una biblioteca fija de candidatos: el modelo solo puede seleccionar entre 5.273 trayectorias predefinidas; no genera trayectorias nuevas fuera de esa biblioteca.
- Divergencia entre pesos fusionados y adapter: la fusion a bf16 introduce diferencias (top candidate coincide en 15 de 16 escenas, diferencia maxima de 0,16 m en posicion y 0,009 rad en heading), relevante para reproducibilidad exacta.
- Entrada limitada a camara frontal y estado del ego: no se documenta uso de LiDAR, radar ni camaras adicionales, lo que limita la percepcion 360 grados.
- Idiomas soportados no documentados, lo que impide evaluar su comportamiento multilingue.
- Riesgo de alucinacion y sesgos: no documentado en la model card; al ser un modelo de investigacion sin auditoria publica, no se recomienda su uso fuera de entornos controlados.
- Sin datos de benchmarks generales (razonamiento, codigo, matematicas) que permitan evaluar la preservacion de capacidades del modelo base tras el ajuste.

## Enlaces

- Hugging Face: https://huggingface.co/pei2333/SuperGlance-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Terminos del Waymo Open Dataset: https://waymo.com/open/terms
- No se han encontrado en la informacion proporcionada enlaces a paper, blog, repositorio de codigo ni demo.
