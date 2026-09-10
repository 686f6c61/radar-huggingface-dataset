# Jeesup/svd-safety-l2_remove40_swapdisc_b010

## Resumen

svd-safety-l2_remove40_swapdisc_b010 es un checkpoint de investigacion derivado de meta-llama/Llama-2-7b-chat-hf. Se ha comprimido con SVD-LLM eliminando el 40,02% de sus parametros, de modo que la matriz densa resultante conserva el 60,0% del total. Sobre esa base, el autor reincorpora un presupuesto del 1,0% de parametros en componentes SVD restaurados, seleccionados mediante la regla `swapdisc`, lo que da una fraccion de parametros final de 0,5998 (semilla 42).

No es un asistente conversacional de proposito general ni un modelo desplegable: es una celda de una rejilla experimental que cruza reglas de seleccion de componentes y presupuestos de restauracion. Su objetivo es cuantificar como la compresion SVD degrada el comportamiento de seguridad y que regla repara mejor ese dano.

Mantiene la arquitectura transformer decoder-only de Llama 2, se distribuye en safetensors con 6.738.415.616 parametros declarados y esta sujeto a la licencia Llama 2 Community License. Su interes actual es metodologico: aporta metricas de tasa de exito de ataque (ASR) y de sobrerrechazo sobre un checkpoint concreto para estudiar el compromiso seguridad-utilidad bajo compresion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama-2-7b-chat) |
| Parametros totales | 6.738.415.616 (segun safetensors); la model card declara una fraccion de parametros resultante de 0,5998 sobre el modelo denso |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4.096 tokens (heredada de Llama-2-7b-chat-hf; no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se detalla la precision de almacenamiento) |
| Idiomas soportados | no disponible (el modelo base Llama-2-7b-chat esta optimizado principalmente para ingles) |
| Licencia | Llama 2 Community License (incluye LICENSE.txt y USE_POLICY.md en el repositorio) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint parte de Llama-2-7b-chat-hf, un transformer decoder-only con normalizacion RMSNorm, activaciones SwiGLU y embeddings posicionales rotatorios (RoPE). La modificacion respecto al modelo original consiste en una compresion por descomposicion en valores singulares (SVD-LLM), que factoriza las matrices de peso en componentes de bajo rango. La model card indica que se eliminaron el 40,02% de los parametros y que se restauraron 5.689 componentes, sustituyendo otros tantos, con un presupuesto de restauracion del 1,0% de los parametros densos. La regla de seleccion empleada es `swapdisc`.

No se proporciona informacion sobre datos de entrenamiento adicionales para este derivado, ni sobre el numero de tokens, la composicion del dataset o el uso de RLHF/DPO especificos de este checkpoint. La innovacion tecnica destacable es el propio procedimiento de compresion y reparacion selectiva de componentes SVD, que se evalua comparando reglas de seleccion dentro de una rejilla experimental con semilla fija (42). El nombre del modelo codifica la configuracion: `l2` (Llama 2), `remove40` (40% de parametros eliminados), `swapdisc` (regla de seleccion) y `b010` (presupuesto de restauracion del 1,0%).

## Capacidades

- Generacion de texto conversacional: hereda la capacidad de completar y responder a instrucciones de Llama-2-7b-chat, aunque degradada por la compresion.
- Razonamiento y seguimiento de instrucciones: presentes de forma residual, sin evaluacion publicada en la informacion disponible.
- Codigo y matematicas: no se han publicado resultados especificos para estas tareas.
- Tool calling / function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles; el modelo base esta orientado principalmente al ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Uso previsto: sujeto experimental para medir seguridad y utilidad bajo compresion, no asistente desplegable.

## Casos de uso

- Estudio del impacto de la compresion sobre la seguridad: comparar la tasa de exito de ataque (ASR) de este checkpoint con la del modelo denso Llama-2-7b-chat-hf permite cuantificar cuanto dano introduce la eliminacion del 40% de parametros.
- Evaluacion de reglas de seleccion de componentes SVD: la regla `swapdisc` se puede comparar con otras reglas de la misma rejilla para determinar cual repara mejor el comportamiento de seguridad con el mismo presupuesto.
- Analisis del compromiso seguridad-utilidad: cruzando el ASR (0,0038 en AdvBench, 0,0032 en StrongREJECT) con el sobrerrechazo (0,6041) y la perplejidad (11,6263) se puede caracterizar la perdida de utilidad asociada a la compresion.
- Reproducibilidad de experimentos: la semilla fija (42), el presupuesto del 1,0% y el numero de componentes (5.689) permiten replicar la configuracion exacta en estudios comparativos.
- Investigacion en interpretabilidad: identificar que componentes SVD afectan de forma critica al comportamiento de rechazo y de seguridad, aislando subconjuntos de componentes restaurados.
- Evaluacion de pipelines de seguridad: servir como entrada para arneses de evaluacion como HarmBench, StrongREJECT o WildGuard y validar su sensibilidad frente a modelos comprimidos.
- Punto de partida para tecnicas de recuperacion posteriores: usar este checkpoint como referencia para comparar cuantizacion, destilacion o ajuste fino orientado a recuperar utilidad y seguridad.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0038 |
| StrongREJECT ASR (juez HarmBench) | 0,0032 |
| Sobrerrechazo macro (WildGuard) | 0,6041 |
| Perplejidad WikiText-2 | 11,6263 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de conocimiento o razonamiento en la informacion disponible. El valor de sobrerrechazo (0,6041) es elevado, lo que indica una tendencia marcada a rechazar peticiones legitimas; la perplejidad de 11,6263 es coherente con un modelo comprimido respecto a un Llama-2-7b-chat denso, aunque no se aporta la cifra de referencia del modelo sin comprimir.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 13,5 GB para los pesos, segun el tamano del repositorio (13,5 GB).
- VRAM estimada en int8: aproximadamente 6,7 GB.
- VRAM estimada en 4 bits: aproximadamente 3,4 GB.
- GPU recomendadas: A100, H100 o similares para despliegue en precision completa; una RTX 4090 (24 GB) permite cargar el modelo en fp16 con margen limitado para el contexto.
- GPU de consumo: si, cabe en tarjetas de 16 GB o mas en cuantizacion de 4 u 8 bits; en fp16 requiere al menos 16-24 GB.
- Opciones de despliegue: vLLM, Text Generation Inference (el repositorio incluye los tags `text-generation-inference` y `endpoints_compatible`), transformers, y llama.cpp u Ollama previa conversion a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ASR AdvBench | Sobrerrechazo | Perplejidad WikiText-2 | Licencia |
|---|---|---|---|---|---|---|
| svd-safety-l2_remove40_swapdisc_b010 | 6,74B declarados (fraccion densa 0,5998) | 4.096 (heredado) | 0,0038 | 0,6041 | 11,6263 | Llama 2 |
| meta-llama/Llama-2-7b-chat-hf | 6,74B | 4.096 | no disponible | no disponible | no disponible | Llama 2 |
| meta-llama/Llama-2-7b-hf | 6,74B | 4.096 | no disponible | no disponible | no disponible | Llama 2 |

No se dispone de datos de benchmarks del modelo sin comprimir en la informacion proporcionada, por lo que no puede cuantificarse la degradacion exacta. Tampoco se aportan referencias a otros checkpoints comprimidos de la misma rejilla experimental, que el autor menciona pero no detalla.

## Limitaciones y advertencias

- Artefacto de investigacion: el autor advierte explicitamente de que no es un modelo de chat de proposito general y que debe evaluarse antes de extraer conclusiones.
- Seguridad degradada deliberadamente: la model card indica que varias configuraciones de la rejilla reducen la seguridad respecto a Llama-2-7b-chat y que la compresion por si sola eleva la tasa de exito de ataque.
- Sobrerrechazo elevado: un valor de 0,6041 en WildGuard implica que el modelo rechaza una fraccion muy alta de peticiones legitimas, lo que limita su utilidad conversacional.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la compresion puede incrementarlo.
- Limitaciones de idioma: el modelo base esta orientado principalmente al ingles; no se documentan capacidades multilingues.
- Restricciones de licencia: sujeto a la Llama 2 Community License y a USE_POLICY.md, con las restricciones de uso comercial y de aplicaciones prohibidas que impone esa licencia.
- Caveat para produccion: no debe desplegarse como asistente en entornos reales sin una evaluacion de seguridad y utilidad propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove40_swapdisc_b010
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- No se han encontrado en la busqueda web enlaces relevantes al modelo, a papers asociados ni a demos (los resultados devueltos no guardan relacion con el modelo).
