# andrzej/SmolLM2-135M-Instruct-ONNX

## Resumen

Este repositorio es un espejo ONNX del modelo SmolLM2-135M-Instruct, desarrollado originalmente por Hugging Face TB (SmolLM Team). No introduce cambios en los pesos ni en el entrenamiento: se limita a redistribuir los ficheros ONNX ya publicados en el repositorio original, en la revision `12fd25f77366fa6b3b4b768ec3050bf629380bac`, junto con los ficheros de configuracion y tokenizador necesarios para su carga. Su proposito declarado es servir de base a demos educativas en navegador con Transformers.js 4.3.2 que comparan las versiones base, SFT y SFT + DPO de SmolLM2-135M.

El modelo subyacente es un transformer decoder-only de 135 millones de parametros, entrenado por Hugging Face con un enfoque centrado en datos (segun el paper SmolLM2, arXiv:2502.02737), seguido de un ajuste supervisado (SFT) y una fase de optimizacion de preferencias con DPO sobre UltraFeedback. Es un modelo Instruct en ingles, pensado para generacion de texto conversacional y para ejecucion en entornos con recursos muy limitados.

Su relevancia practica es acotada pero clara: con builds int8 de aproximadamente 137 MB, es viable ejecutarlo en el navegador via WebAssembly/WebGPU con Transformers.js, o en CPU en cualquier maquina, lo que lo convierte en una pieza util para prototipos, demos docentes y pruebas de pipelines de inferencia sin infraestructura GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, segun el tag `llama`) |
| Parametros totales | 135 millones (heredado de SmolLM2-135M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int8 (ONNX) y fp32 (ONNX) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`onnx/model_int8.onnx`, `onnx/model.onnx`) |
| Tamano del repositorio | 0.7 GB |
| Libreria de referencia | transformers.js |
| Modelo base | HuggingFaceTB/SmolLM2-135M-Instruct |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 135M de parametros, coherente con la familia SmolLM2 descrita en el paper "SmolLM2: When Smol Goes Big -- Data-Centric Training of a Small Language Model" (arXiv:2502.02737). El autor del espejo no aporta detalles adicionales sobre numero de capas, dimensiones ocultas, atencion (GQA/MHA) ni funcion de activacion; esos datos deben consultarse en la model card del repositorio original.

En cuanto al entrenamiento, la model card de este espejo indica que el modelo original fue sometido a ajuste supervisado (SFT) seguido de Direct Preference Optimization (DPO) sobre el dataset UltraFeedback. No se especifican en la informacion disponible el numero de tokens de preentrenamiento, la composicion del corpus ni hiperparametros del SFT/DPO. La conversion a ONNX no introduce ninguna innovacion tecnica: los ficheros se copian sin modificacion y los valores SHA-256 se verificaron contra el repositorio fuente.

## Capacidades

- Generacion de texto en ingles con formato conversacional (modelo Instruct).
- Respuestas a instrucciones tras SFT y alineamiento de preferencias con DPO.
- Ejecucion en navegador mediante Transformers.js 4.3.2 (builds ONNX int8 y fp32).
- Inferencia en CPU sin GPU dedicada, gracias al reducido tamano del modelo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta thinking mode ni capacidades agenticas.
- Capacidades multilingues: limitadas al ingles segun la metadata del repositorio.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Demos educativas en navegador: cargar el build int8 (~137 MB) con Transformers.js para ilustrar en clase las diferencias entre las variantes base, SFT y DPO de SmolLM2-135M, tal como plantea el autor del espejo.
- Prototipado rapido de interfaces conversacionales: permite validar el flujo de UI y el pipeline de generacion antes de invertir en un modelo mayor, sin necesidad de servidores GPU.
- Pruebas de integracion de Transformers.js en aplicaciones web: sirve como modelo de referencia para verificar la carga de pesos ONNX, tokenizador y configuracion en el navegador.
- Generacion de texto offline en dispositivos de bajos recursos: al caber en CPU y en memoria de un portatil convencional, es util para tareas de relleno, resumenes cortos o clasificacion textual simple en entornos sin conectividad.
- Evaluacion comparativa de tecnicas de alineamiento: al existir versiones base, SFT y DPO del mismo modelo, permite montar experimentos controlados sobre el efecto del DPO en respuestas a instrucciones.
- Base para fine-tuning ligero: con 135M de parametros y licencia Apache 2.0, es un punto de partida asequible para adaptar el modelo a dominios concretos en ingles, aunque requiere convertir de nuevo a ONNX si el objetivo es despliegue web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este espejo no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros modelos; solo remite al paper de SmolLM2 para los detalles del entrenamiento original.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso de despliegue en navegador o CPU; el build int8 ocupa aproximadamente 137 MB en disco y una huella de memoria del mismo orden en tiempo de ejecucion.
- El build fp32 ocupa aproximadamente 540 MB, por lo que requiere al menos ese orden de memoria disponible.
- GPU recomendadas: no se especifican; el modelo esta pensado para ejecucion en CPU o en el navegador, no para GPUs de datacenter (A100, H100) ni para inferencia de alto throughput.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) y en la mayoria de portatiles, dado su tamano reducido.
- Opciones de despliegue: Transformers.js 4.3.2 (objetivo declarado del repositorio); otros runners ONNX (ONNX Runtime, etc.) son tecnicamente posibles pero no estan documentados en la informacion disponible. vLLM, llama.cpp, Ollama y TGI no se mencionan para este repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| andrzej/SmolLM2-135M-Instruct-ONNX (este) | 135M | no disponible | Apache 2.0 | ONNX (int8, fp32) | Espejo sin cambios del original, orientado a Transformers.js |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135M | no disponible | Apache 2.0 | safetensors (repositorio original) | Fuente de los pesos; incluye los ficheros ONNX reutilizados aqui |
| SmolLM2-360M-Instruct | 360M | no disponible | Apache 2.0 | safetensors | Version mayor de la misma familia; mas capacidad a costa de mas memoria |
| Qwen2.5-0.5B-Instruct | 500M | no disponible | Apache 2.0 | safetensors | Alternativa de tamano superior con soporte multilingue, no comparable en huella de memoria |

La comparacion se limita a parametros, licencia y formato, ya que no hay datos de rendimiento publicados en la informacion disponible para este repositorio.

## Limitaciones y advertencias

- El modelo solo esta entrenado y evaluado en ingles; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- La model card advierte explicitamente de que puede producir texto inexacto o inventado (alucinaciones), algo esperable en un modelo de 135M de parametros.
- No hay informacion sobre sesgos especificos, pero al derivar de un corpus web y de UltraFeedback, es previsible que herede sesgos del preentrenamiento original; no se documentan mitigaciones en este espejo.
- La longitud de contexto no se especifica en la informacion disponible; no debe asumirse una ventana amplia para conversaciones largas o documentos extensos.
- La licencia Apache 2.0 permite uso comercial, pero el autor del espejo no ofrece garantias y remite toda la atribucion a Hugging Face TB.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no cuenta con validacion de la comunidad.
- Es un espejo, no un modelo mantenido: no cabe esperar actualizaciones, correcciones ni soporte por parte del autor.
- Para produccion, la ausencia de benchmarks y de datos de contexto hace recomendable validar el comportamiento en el dominio concreto antes de desplegarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/andrzej/SmolLM2-135M-Instruct-ONNX
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Dataset de DPO (UltraFeedback): https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized
- Paper SmolLM2: https://arxiv.org/abs/2502.02737
- Transformers.js: no se proporciona enlace en la informacion disponible.
