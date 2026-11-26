# amd/gemma-4-26B-A4B-it-reap-50-llmcompressor

## Resumen
El modelo `amd/gemma-4-26B-A4B-it-reap-50-llmcompressor` es una variante podada estructuralmente del modelo Gemma 4 26B-A4B-it, publicada por AMD. Se trata de un transformer de tipo Mixture of Experts (MoE) al que se le ha aplicado la tecnica REAP (Router-weighted Expert Activation Pruning) para eliminar el 50 % de los expertos enrutados de cada capa, reduciendo el numero de parametros totales hasta aproximadamente 14 380 millones. Los pesos se mantienen en BF16: no es una cuantizacion, sino una poda estructural.

El objetivo del modelo es habilitar la inferencia en CPU sobre procesadores AMD EPYC, optimizada mediante la pila ZenDNN/ZenTorch, sin necesidad de GPU. Al reducir a la mitad los expertos por capa, disminuye el coste computacional y el tamano del checkpoint, manteniendo intactos los componentes criticos (atencion, MLP densa compartida, torre de vision, proyector multimodal, `lm_head`, `embed_tokens` y layer norms).

Es relevante ahora porque demuestra una via practica para desplegar modelos MoE multimodales de gran tamano en infraestructura de CPU convencional, un escenario habitual en centros de datos con nodos EPYC donde la GPU escasea o resulta costosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4ForConditionalGeneration (transformer MoE con torre de vision) |
| Parametros totales | 14 381 532 592 (~14,38 B) |
| Parametros activos | no disponible (top-8 de 64 expertos por capa tras la poda) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en BF16; poda estructural, no cuantizacion) |
| Idiomas soportados | en |
| Licencia | gemma |
| Formato de pesos | safetensors (compressed-tensors, BF16) |

## Arquitectura y entrenamiento
El modelo base es un transformer MoE multimodal de Gemma 4 con 30 capas de decoder y 128 expertos enrutados por capa. AMD aplico REAP, que puntua cada experto ponderando la magnitud de su activacion por la probabilidad que le asigna el router, y descarta el 50 % de menor puntuacion. En este checkpoint se eliminan 64 de los 128 expertos enrutados en cada una de las 30 capas; el router mantiene su seleccion top-8, pero escoge entre los 64 expertos restantes. Los indices de los expertos conservados se guardan en `retained_experts.json`.

El proceso de poda se realiza con LLM Compressor v0.14.0 mediante el modificador `REAPPruningModifier` con `sparsity=0.50`. Se usan 128 muestras de chat renderizadas con la plantilla del modelo como conjunto de calibracion, con `batch_size=1` y `moe_calibrate_all_experts=False` para medir cada experto solo sobre los tokens realmente enrutados a el. Como Gemma 4 almacena los expertos como tensores 3D fusionados, `load_context()` los separa en lineales por experto durante la poda y `repack_moe()` los vuelve a fusionar antes de guardar, de modo que el resultado carga como un checkpoint estandar de Gemma 4 con una dimension de expertos menor. No se menciona un reentrenamiento posterior a la poda.

## Capacidades
- Generacion de texto conversacional en ingles.
- Procesamiento de entrada imagen-texto a texto (pipeline `image-text-to-text`, torre de vision y proyector multimodal intactos).
- Razonamiento y generacion de codigo heredados del modelo base (no se detallan capacidades especificas adicionales).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Capacidades especiales (thinking mode, audio): no disponible en la informacion proporcionada.

## Casos de uso
- Inferencia en CPU sobre nodos AMD EPYC: el modelo esta optimizado con ZenDNN y ZenTorch para ejecutarse sin GPU en servidores EPYC, aprovechando la reduccion de expertos para abaratar el computo por token.
- Despliegue con vLLM en entornos sin GPU: al ser compatible con vLLM v0.34.0 y `compressed-tensors`, puede servirse mediante una API compatible con OpenAI en infraestructura de solo CPU.
- Procesamiento por lotes de documentos con imagenes: la torre de vision y el proyector multimodal permanecen intactos, permitiendo tareas de imagen-texto a texto en pipelines offline sobre CPU.
- Chatbot interno de bajo coste: al ser un modelo conversacional en ingles con pesos BF16 y checkpoint de ~28,8 GB, puede alojarse en un unico servidor con suficiente RAM para asistentes internos.
- Evaluacion e investigacion sobre poda MoE: sirve como referencia practica para estudiar el impacto de REAP al 50 % frente al modelo base sin podar.
- Sustitucion del modelo completo en entornos con restricciones de memoria: reduce el footprint del checkpoint respecto al modelo original, facilitando su carga en nodos con RAM limitada.

## Benchmarks y rendimiento
La model card incluye una tabla de evaluacion con `lm-evaluation-harness` y el motor vLLM comparando el modelo REAP-50 con el baseline BF16 sin podar, pero los valores numericos no estan completos en la informacion proporcionada.

| Benchmark | BF16 Baseline | REAP-50 (este modelo) |
|---|---|---|
| Resultados de lm-evaluation-harness | no disponible | no disponible |

No se han publicado resultados de benchmarks completos en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no aplica como requisito principal; el modelo esta disenado para inferencia en CPU.
- RAM estimada: el repositorio ocupa 28,8 GB en BF16, por lo que se recomienda al menos esa cantidad de memoria del sistema, con margen adicional para el runtime.
- GPU recomendadas: no disponible; el modelo esta validado para CPU AMD EPYC.
- CPU objetivo: AMD EPYC con ZenDNN y ZenTorch (compilados desde `main`).
- Cabe en GPU consumer: no disponible; no es el escenario previsto.
- Opciones de despliegue: vLLM v0.34.0 (recomendado), con PyTorch 2.14.0+cpu, Transformers 5.20.2, LLM Compressor 0.14.0 y Python 3.12.16.
- Configuracion adicional: definir `LD_PRELOAD` con `libomp.so` (LLVM OpenMP) o `libiomp5.so` (Intel OpenMP) antes de lanzar vLLM para un rendimiento optimo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Hardware objetivo |
|---|---|---|---|---|
| amd/gemma-4-26B-A4B-it-reap-50-llmcompressor | ~14,38 B (podado) | no disponible | gemma | CPU AMD EPYC |
| RedHatAI/gemma-4-26B-A4B-it (base) | no disponible (128 expertos/capa) | no disponible | gemma | GPU / generico |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre el modelo podado y el base en la informacion proporcionada.

## Limitaciones y advertencias
- La poda del 50 % de expertos puede degradar la calidad respecto al modelo base; los resultados de la evaluacion no estan completos en la informacion disponible.
- Modelo unicamente en ingles segun el campo `language`; no se garantiza un comportamiento adecuado en castellano u otros idiomas.
- Riesgo de alucinacion inherente a los modelos generativos; no se documentan mitigaciones especificas.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Licencia `gemma`: sujeta a los terminos de uso de Gemma; deben revisarse las restricciones para uso comercial antes de desplegar en produccion.
- Validado sobre una pila de software muy concreta (PyTorch 2.14.0+cpu, Transformers 5.20.2, vLLM 0.34.0, ZenDNN/ZenTorch desde `main`); otras versiones pueden no funcionar correctamente.
- Requiere configuracion manual de OpenMP (`LD_PRELOAD`) para un rendimiento adecuado.
- El modelo tiene muy pocas descargas y likes en el momento de la ficha, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces
- Hugging Face: https://huggingface.co/amd/gemma-4-26B-A4B-it-reap-50-llmcompressor
- Modelo base: https://huggingface.co/RedHatAI/gemma-4-26B-A4B-it
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- vLLM: https://docs.vllm.ai/en/latest/
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
