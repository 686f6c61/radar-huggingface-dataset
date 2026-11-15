# seanmamasde/gemma4_equiangular

## Resumen

Gemma4 equiangular es un conjunto de adaptadores LoRA publicados por el usuario independiente seanmamasde sobre el modelo base `google/gemma-4-26B-A4B`. No se trata de un modelo conversacional de proposito general, sino de una politica de acciones estructuradas en JSON entrenada especificamente para la construccion y reparacion de configuraciones de lineas equiangulares de angulo fijo (problemas de geometria extrema relacionados con la conjetura de Salem-Spencer). El autor lo describe explicitamente como "structured JSON action policies, not general-purpose chat models".

El paquete incluye un adaptador SFT (supervised fine-tuning) con 4558 actualizaciones sobre una pasada de batch completo, y una cadena de adaptadores RL (reinforcement learning) con checkpoints numerados (580, 600, 625 y 632) que se aplican sobre la referencia SFT congelada. La cadena de dependencias es estricta: primero se cargan los pesos crudos del modelo base en BF16, se fusiona el adaptador SFT en FP32 mediante `merge_and_unload(safe_merge=True)` en CPU, y solo despues se aplica el adaptador RL seleccionado.

Su relevancia es acotada pero significativa en el ambito de investigacion: demuestra un flujo completo de SFT + RL con PPO sobre un modelo MoE de gran tamano para una tarea matematica verificable, con datos, codigo y evaluador portatil publicados. Los resultados observados son modestos: el checkpoint 625 logra 8/52 reparaciones locales fuera de distribucion (OOD) y cero mejoras sobre las cotas publicadas (57/72/90), por lo que debe considerarse material de investigacion reproducible mas que una herramienta lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer MoE `google/gemma-4-26B-A4B` |
| Parametros totales | no disponible (adaptadores LoRA; el modelo base es 26B-A4B) |
| Parametros activos | no disponible (modelo base MoE con 4B activos segun nomenclatura A4B) |
| Longitud de contexto | 8192 tokens (contexto de entrenamiento/evaluacion declarado) |
| Tipos de cuantizacion | no disponible (adaptadores en FP32; base cargado en BF16) |
| Idiomas soportados | no disponible |
| Licencia | MIT (adaptadores); el modelo base upstream tiene terminos Apache-2.0 propios |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA), mas `training_state/checkpoint-632.pt` opcional |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-26B-A4B` en su revision `24548b62aa021d562695c04aaf7758a1ea47990b`, en variante pretrained no-IT. Sobre el se entrenan adaptadores LoRA: un SFT con 4558 actualizaciones (una pasada de batch completo) que sirve de referencia congelada, y una cadena RL posterior con checkpoints en las rondas 580, 600, 625 y 632 (esta ultima con estado Adam en la actualizacion 1716). El SFT se entreno con 145882 acciones de entrenamiento y 15704 de validacion, provenientes de trayectorias exactas de reparacion "strict-jammed"; la pasada completa uso 145856 ejemplos, dejando 26 fuera del ultimo batch global. El banco de reparaciones repetidas contiene 5906 trayectorias de entrenamiento.

El entrenamiento permite dimensiones d2-17, con raices strict-jammed reales en d4/5/14/15/16/17; las geometrias d18-20 se reservan como OOD y nunca entran en las actualizaciones del optimizador. Las acciones sinteticas o de experto se excluyen del PPO. La evaluacion OOD usa 2048 llamadas de expansion, 8 propuestas por llamada, 4 remuestreos, 32768 nodos, un presupuesto de 192 turnos y capacidad de 96 lineas; el entrenamiento y la validacion usan 1024 llamadas. La generacion emplea 32 tokens con temperatura 1, top_p 1 y top_k desactivado. El autor advierte que la fusion y la inferencia pueden diferir en bits de bajo orden segun hardware y backend numerico, y que las semillas fijas no garantizan trayectorias identicas bit a bit.

## Capacidades

- Generacion de acciones estructuradas en JSON para construccion y reparacion de configuraciones de lineas equiangulares de angulo fijo.
- Razonamiento geometrico y combinatorio acotado al dominio de lineas equiangulares y geometrias extremales.
- Reparacion iterativa de configuraciones parciales ("strict-jammed") mediante politica de acciones multi-paso.
- Politica entrenada con RL (PPO) sobre una referencia SFT congelada, con checkpoints intermedios evaluables.
- No es un modelo de chat de proposito general: no se documentan capacidades conversacionales, tool calling, agentes genericos, vision ni audio.
- Capacidades multilingues: no disponibles.
- No se documenta modo thinking ni capacidades especiales fuera del dominio geometrico.

## Casos de uso

- Investigacion reproducible en geometria extremal: el paquete permite reconstruir exactamente el pipeline SFT + RL y comparar checkpoints (580, 600, 625, 632) sobre el mismo banco OOD fijo, usando el evaluador `torchrun` portatil incluido en el handoff.
- Reproduccion de experimentos de RL con PPO sobre modelos MoE: sirve como caso de estudio de como aplicar PPO a un modelo de 26B-A4B con datos verificables y presupuestos de busqueda fijos.
- Evaluacion de politicas de busqueda con presupuesto acotado: los limites documentados (2048 llamadas, 32768 nodos, 192 turnos, 96 lineas) permiten medir politicas bajo restricciones comparables.
- Estudio de reparacion de configuraciones parciales: el banco de 5906 trayectorias de reparacion repetida es util para analizar estrategias de reparacion local frente a construccion desde cero.
- Verificacion de fidelidad de fusion de adaptadores: el flujo raw base en BF16 + SFT en FP32 + RL en FP32 con `safe_merge=True` en CPU es un ejemplo concreto de gestion de precisiones en cadenas LoRA.
- Docencia e investigacion sobre conjeturas combinatorias: las cotas publicadas 57/72/90 y los umbrales de avance 58/73/91 ofrecen un marco objetivo para evaluar heuristicas de busqueda.
- Analisis de divergencia numerica entre backends: el aviso del autor sobre diferencias en bits de bajo orden permite disenar experimentos de robustez numerica en inferencia distribuida.

## Benchmarks y rendimiento

Los resultados publicados no son benchmarks clasicos (MMLU, HumanEval, GSM8K) sino metricas de exito en la tarea de reparacion equiangular. Se presentan tal cual:

| Checkpoint | Evaluacion | Reparaciones locales OOD | Mejoras sobre cotas publicadas |
|---|---|---|---|
| `rl/checkpoint-580` | Control congelado, mismo banco OOD | no disponible (total local mayor que 625) | 0 |
| `rl/checkpoint-600` | Suite completa de 120 casos | no disponible | no disponible |
| `rl/checkpoint-625` | Suite OOD/frontier de 72 casos | 8/52 | 0 |
| `rl/checkpoint-632` | Sin evaluar | no disponible | no disponible |

Comparativa directa 625 frente a 600 sobre el mismo banco fijo: una victoria de cardinalidad, 50 empates y una derrota. El banco OOD fijo consta de 26 geometrias con dos semillas cada una (32 intentos en d18, 10 en d19 y 10 en d20). Los umbrales de avance se fijan en 58/73/91, por encima de las cotas publicadas 57/72/90.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El modelo base es de 26B parametros totales con 4B activos (MoE); en BF16 el peso completo ronda los 52 GB, por lo que no cabe en GPUs de consumo sin cuantizacion. El adaptador SFT en FP32 y los adaptadores RL en FP32 anaden requisitos de memoria para la fusion en CPU.
- GPU recomendadas: no especificadas por el autor. Por tamano del base, se requiere al menos una GPU con 80 GB (A100, H100) para cargar el modelo en BF16; el autor referencia vLLM 0.26.0+cu129 y Torch 2.11.0+cu129, lo que sugiere despliegue en GPUs de datacenter con CUDA 12.9.
- Cabe en consumer GPU: no disponible; por el tamano del base (26B), en BF16 no cabe en RTX 4090 (24 GB) sin cuantizacion, y no se documentan recetas de cuantizacion para estos adaptadores.
- Opciones de despliegue: el autor cita vLLM 0.26.0+cu129 (con URL oficial del wheel CUDA 12.9), Transformers 5.14.1, PEFT 0.20.0, Python 3.12, pynauty 2.8.8.1 y Gymnasium 1.2.3. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La generacion usa 32 tokens por accion, lo que limita la longitud de salida, pero no se publican cifras de latencia.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (adaptadores LoRA de investigacion para geometria extremal sobre Gemma 4). La comparativa se limita a los checkpoints internos del propio paquete y al modelo base:

| Modelo | Parametros | Contexto | Resultado OOD | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `gemma4_equiangular` (checkpoint 625) | LoRA sobre 26B-A4B | 8192 | 8/52 locales, 0 mejoras sobre cotas | MIT | Hugging Face |
| `gemma4_equiangular` (checkpoint 580, control) | LoRA sobre 26B-A4B | 8192 | 0 mejoras sobre cotas, mayor ganancia local total | MIT | Hugging Face |
| `google/gemma-4-26B-A4B` (base) | 26B totales, 4B activos | no disponible | no aplica (sin entrenamiento en la tarea) | Apache-2.0 (upstream) | Hugging Face |

## Limitaciones y advertencias

- No es un modelo de proposito general: el autor lo define como politica de acciones JSON para una tarea geometrica concreta; no debe usarse como chat ni para tareas fuera del dominio.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al tratarse de una politica de acciones estructuradas, los fallos se manifiestan como acciones invalidas o reparaciones sin exito, no como texto libre.
- Resultados modestos: cero mejoras sobre las cotas publicadas 57/72/90 en todos los checkpoints evaluados; el checkpoint 632 no tiene resultado medido.
- Dependencia estricta de la cadena raw base -> SFT -> RL: aplicar un adaptador RL directamente al modelo base de Google omite la actualizacion SFT y produce resultados invalidos; los configs RL no seleccionan base automaticamente por diseno.
- Precision critica: el SFT y el RL publicados son FP32; el adaptador SSSET SFT previo uso otro dtype y su supuesto de fusion BF16 no debe trasladarse a este experimento.
- Reproducibilidad no bit a bit: la fusion y la inferencia pueden diferir en bits de bajo orden entre hardware y backends numericos, incluso con semillas fijas.
- Licencia: los adaptadores son MIT, pero el modelo base upstream tiene terminos Apache-2.0 propios y sus pesos no se duplican en el repositorio; el uso comercial debe cumplir ambas licencias.
- Idiomas soportados: no disponibles; no se documenta comportamiento multilingue.
- Sin descargas ni likes en el momento de la consulta (0 y 0), lo que indica ausencia de validacion externa por la comunidad.
- El estado `training_state/checkpoint-632.pt` contiene rutas historicas e identidades de referencia que deben revalidarse explicitamente para continuar el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seanmamasde/gemma4_equiangular
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B
- Dataset: https://huggingface.co/datasets/seanmamasde/extremal/tree/938e2e00d5b1590e81ddc3d4e0abcf65445887b2/gemma4_equiangular
- Repositorio extremal (rama `jammed-eql`): https://github.com/seanmamasde/extremal/tree/jammed-eql
- Repositorio llmcosolver (rama `jammed-eql`): https://github.com/seanmamasde/llmcosolver/tree/jammed-eql
- Handoff de evaluacion: https://github.com/seanmamasde/llmcosolver/blob/jammed-eql/examples/gemma4_equiangular/RELEASE.md
