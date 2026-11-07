# chocokiddo/DICE-Policy

## Resumen

DICE-Policy es un ajuste fino supervisado del modelo Qwen2.5-7B-Instruct desarrollado por el autor chocokiddo como parte del trabajo de investigacion "DICE: Decoupling Capability from Intervention Necessity in LLM Tutoring". El modelo implementa una politica de tutoria socratica: en lugar de generar directamente la solucion a un problema matematico, predice una de seis acciones pedagogicas discretas (aceptar y avanzar, reparar aritmetica, pedir justificacion, dar una pista conceptual, responder una pregunta del alumno o reencauzar el subobjetivo) en funcion del estado del dialogo con el estudiante.

Tecnicamente se trata de un checkpoint completo de `transformers` obtenido mediante LoRA (rango 16, alpha 32, dropout 0.05) fusionado sobre los pesos base de Qwen2.5-7B-Instruct. El resultado es un modelo denso de aproximadamente 7.600 millones de parametros, con arquitectura transformer decoder-only de Qwen2, ventana de contexto nativa de 32.768 tokens en el modelo base (aunque el entrenamiento se limito a 2.048 tokens) y licencia Apache 2.0.

Su relevancia es acotada pero especifica: no es un modelo de proposito general, sino un componente de investigacion para estudiar politicas de intervencion en sistemas de tutoria automatica. La decodificacion DICE-Cost, DICE-MAP y DICE-Threshold no reside en el checkpoint, sino en el codigo de experimentos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7.615.616.512 (~7,6 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen2.5-7B-Instruct; 2.048 tokens de longitud maxima durante el entrenamiento |
| Tipos de cuantizacion | no disponible en la model card; el modelo base admite cuantizacion estandar (GPTQ, AWQ, GGUF) al no haber cambios arquitectonicos |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint completo de `transformers`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only denso con atencion causal estandar, RoPE y sesgo de atencion QKV. Sobre esa base se aplico un LoRA de rango 16, alpha 32 y dropout 0.05, entrenado durante 3 epocas con batch efectivo de 32 (4 x 8 de acumulacion de gradientes), tasa de aprendizaje 2e-4 y precision 4-bit QLoRA con computo en bf16. Posteriormente el adaptador se fusiono en los pesos base, por lo que el repositorio contiene un checkpoint completo y no requiere cargar un PEFT por separado.

La innovacion esta en el objetivo de entrenamiento, no en la arquitectura. Se usa una perdida de next-token restringida a la accion (action-only) con pesos de muestreo basados en el valor de intervencion (intervention value, IV) y regularizacion KL (beta = 0.05) contra una referencia SFT. El modelo aprende a emitir una etiqueta entre seis acciones: `accept_and_advance`, `arithmetic_repair`, `ask_for_justification`, `conceptual_hint`, `handle_question` y `refocus_subgoal`. La seleccion final de la accion con criterios de coste (DICE-Cost, DICE-MAP, DICE-Threshold) se implementa en el codigo de experimentos, no dentro del checkpoint.

## Capacidades

- Clasificacion generativa de acciones pedagogicas en dialogos de tutoria matematica: el modelo produce una de las seis etiquetas de intervencion definidas en el paper.
- Razonamiento sobre el estado del alumno: interpreta el historial de la conversacion para decidir si el estudiante necesita una pista, una correccion aritmetica o una justificacion.
- Generacion de texto conversacional heredada de Qwen2.5-7B-Instruct, aunque el ajuste fino la orienta a la tarea de politica.
- Soporte de tool calling y function calling: disponible en el modelo base Qwen2.5-7B-Instruct, no documentado ni validado para este checkpoint ajustado.
- Capacidades de agente y razonamiento multi-paso: el modelo base las posee; el ajuste fino no las refuerza ni las evalua.
- Capacidades multilingues: limitadas al ingles segun la model card, pese a que Qwen2.5-7B-Instruct es multilingue de origen.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion en tutoria automatica: el modelo se usa como politica de intervencion dentro del framework DICE para comparar estrategias de coste (DICE-Cost, DICE-MAP, DICE-Threshold) en sesiones de tutoria simuladas o reales.
- Evaluacion de politicas pedagogicas: sirve como linea base ajustada frente a Qwen2.5-7B-Instruct sin ajustar al medir la frecuencia y pertinencia de intervenciones sobre el conjunto DICE-Bench.
- Sistemas de tutoria socratica con moderacion humana: el modelo propone la siguiente accion pedagogica y un docente o sistema superior decide si aplicarla, reduciendo el riesgo de respuestas directas no deseadas.
- Analisis de decision pedagogica: al predecir etiquetas discretas, permite registrar y auditar por que un tutor automatico intervino en cada turno.
- Generacion de datos sinteticos de dialogo educativo: las acciones predichas pueden usarse para etiquetar o filtrar conversaciones de tutoria en pipelines de anotacion.
- Reproduccion de experimentos del paper: con el repositorio `Sayantan-world/DICE` y la variable `POLICY_ADAPTER_PATH=chocokiddo/DICE-Policy` se ejecutan las sesiones DICE de forma directa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 15,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda entre 18 y 24 GB.
- VRAM estimada en cuantizacion 8 bits: en torno a 8 GB de pesos, con 10-12 GB totales.
- VRAM estimada en cuantizacion 4 bits: en torno a 4-5 GB de pesos, con 6-8 GB totales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16 sin cuantizar.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y RTX 4080 con cuantizacion 4 u 8 bits; en bf16 requiere al menos 24 GB.
- Opciones de despliegue: `transformers` (metodo documentado en la model card), vLLM, TGI (tag `text-generation-inference`), llama.cpp y Ollama mediante conversion a GGUF del checkpoint fusionado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DICE-Policy | ~7,6 B | 32.768 (entrenado a 2.048) | Politica de tutoria socratica (6 acciones) | Apache 2.0 | Hugging Face |
| Qwen2.5-7B-Instruct | ~7,6 B | 32.768 | Instruccion general | Apache 2.0 | Hugging Face |
| Qwen2.5-Math-7B-Instruct | ~7,6 B | 32.768 | Razonamiento matematico | Apache 2.0 | Hugging Face |
| Modelos de tutoria socratica comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de resultados de benchmarks que permitan comparar el rendimiento de DICE-Policy frente a estas alternativas en tareas de tutoria.

## Limitaciones y advertencias

- Modelo de investigacion acotado a una tarea: predice acciones pedagogicas, no genera explicaciones completas ni resuelve problemas por si mismo.
- Entrenado unicamente en ingles; el uso en castellano no esta validado y probablemente degrade la calidad de la politica.
- La decodificacion DICE-Cost, DICE-MAP y DICE-Threshold no esta incluida en el checkpoint; sin el codigo del repositorio, el modelo emite etiquetas sin el mecanismo de seleccion por coste.
- Ventana de entrenamiento de solo 2.048 tokens, muy inferior al contexto nativo del modelo base; dialogos largos pueden quedar fuera de distribucion.
- Riesgo de alucinacion heredado de Qwen2.5-7B-Instruct, especialmente si se usa fuera de la tarea de clasificacion de acciones.
- Sesgos no documentados: la model card no reporta analisis de sesgos por genero, origen o nivel socioeconomico en las recomendaciones pedagogicas.
- Sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; para produccion conviene evaluar el modelo sobre datos propios antes de desplegarlo.
- El checkpoint fusionado ocupa 15,2 GB, lo que dificulta su versionado en repositorios con limites de almacenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chocokiddo/DICE-Policy
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Dataset de evaluacion DICE-Bench: https://huggingface.co/datasets/chocokiddo/DICE-Bench
- Codigo del proyecto DICE: https://github.com/Sayantan-world/DICE
- Referencia no relacionada (DiCE, counterfactual explanations): https://pypi.org/project/dice-ml/
- Referencia no relacionada (paper sobre GRPO): https://aclanthology.org/2026.findings-emnlp.614.pdf
