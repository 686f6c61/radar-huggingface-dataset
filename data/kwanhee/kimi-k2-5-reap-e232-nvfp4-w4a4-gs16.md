# kwanhee/Kimi-K2.5-REAP-E232-NVFP4-W4A4-GS16

## Resumen

Kimi-K2.5-REAP-E232-NVFP4-W4A4-GS16 es un checkpoint derivado de `moonshotai/Kimi-K2.5`, publicado por el usuario `kwanhee` como material de replica (rebuttal) para el articulo *Hardware-Native Joint Sparse-Quantization for Trillion-Scale Mixture-of-Experts* (MoE-SQ, arXiv 2610.02241). No es un modelo entrenado desde cero, sino una doble intervencion sobre el modelo base de Moonshot AI: primero una poda de expertos enrutados mediante REAP (de 384 a 232 expertos por capa, manteniendo el top-8 de enrutamiento) y despues una cuantizacion densa NVFP4 W4A4 con grupo de escala 16, inicializada con GPTQ. El objetivo es ofrecer una comparacion de presupuesto de bits equiparable frente a la propuesta MoE-SQ.

El modelo conserva la arquitectura Mixture-of-Experts del original, con 625.167.444.048 parametros totales segun los safetensors del repositorio, y mantiene en bf16 las partes sensibles: atencion, experto compartido, primera capa densa, router, embeddings, `lm_head` y torre de vision. Solo los pesos de los expertos enrutados se comprimen, hasta 2,719 bits por peso contando los 384 expertos originales, sus escalas y metadatos.

Su relevancia es fundamentalmente metodologica: sirve para evaluar si la poda de expertos o la cuantizacion conjunta hardware-native es la estrategia mas eficiente cuando el presupuesto de bits es identico. Es un artefacto de investigacion, con 20 descargas y sin resultados de benchmarks publicados en la informacion disponible, orientado a entornos con GPUs Blackwell (SM103) y un stack de servicio parcheado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con torre de vision; 384 expertos enrutados por capa en el modelo base, 232 tras la poda REAP |
| Parametros totales | 625.167.444.048 |
| Parametros activos | no disponible (top-8 de enrutamiento sin cambios; el numero de parametros activos no se publica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 con group size 16 en expertos enrutados; resto del modelo en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Modified MIT License (licencia del checkpoint; modelo base bajo Modified MIT) |
| Formato de pesos | safetensors con compressed-tensors; requiere `custom_code` y transformers |

## Arquitectura y entrenamiento

El modelo base Kimi-K2.5 es un transformer MoE de escala trillonaria con 384 expertos enrutados por capa y enrutamiento top-8, ademas de un experto compartido, una primera capa densa y una torre de vision para entrada multimodal. Este checkpoint no reentrena el modelo: aplica dos etapas de compresion sobre los pesos en bf16, obtenidos al descomprimir la release INT4 del modelo original.

La etapa 1 es una poda REAP ejecutada con el `REAPPruningModifier` de llm-compressor 0.13.0 sobre el checkpoint bf16, con corpus de calibracion `mixed` de 512 secuencias de 4096 tokens y poda secuencial capa a capa. Se eliminan 152 de los 384 expertos enrutados por capa; el checkpoint resultante conserva los pesos bf16 con los expertos descartados eliminados y el router y el sesgo de correccion de scores recortados (REAP solo selecciona expertos). Los indices de expertos conservados por capa estan en `reap_kept_experts.jsonl`. La etapa 1 y el recorte se ejecutaron en 8× NVIDIA B300 (SM103).

La etapa 2 aplica cuantizacion densa NVFP4 W4A4 mediante inicializacion GPTQ de MoE-SQ con valores NVFP4, group size 16, fake-quant de activaciones, refinamiento desactivado, calibracion `mixed`, Hessianos de 512 muestras y `percdamp` 0,1. La configuracion es identica a la de `kwanhee/Kimi-K2.5-REAP50-NVFP4-W4A4-GS16`, cambiando solo la ruta del modelo (`moe_sq_config.yaml`). La etapa 2 se ejecuto con atencion eager (mascara causal explicita) en lugar de FlashAttention-2, no disponible para SM103 en ese entorno, lo que solo altera el orden de suma en coma flotante de las pasadas de calibracion. El resultado son 2,719 bits por peso de experto enrutado contando los 384 expertos originales, escalas y metadatos incluidos.

## Capacidades

- Generacion de texto y razonamiento conversacional heredados del modelo base Kimi-K2.5.
- Capacidades multimodales por la torre de vision conservada en bf16, aunque las rutas multimodales no han sido probadas por el autor y todas las evaluaciones son solo de texto.
- Enrutamiento MoE top-8 sobre 232 expertos por capa, con router y sesgo de correccion conservados en bf16.
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion disponible; se heredaria del modelo base si este lo soporta.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles; el autor no documenta idiomas soportados.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en compresion de modelos: el checkpoint sirve como referencia de comparacion a presupuesto de bits fijo frente a MoE-SQ, permitiendo medir la perdida de calidad de la poda REAP mas cuantizacion NVFP4 en un MoE trillonario.
- Reproduccion de resultados de articulos: permite replicar las evaluaciones del paper MoE-SQ (arXiv 2610.02241) usando exactamente la misma configuracion de calibracion y el mismo checkpoint base.
- Estudio de poda de expertos: con `reap_kept_experts.jsonl` se puede analizar que expertos sobreviven por capa y correlacionar su relevancia con el enrutamiento observado en inferencia.
- Despliegue de inferencia de texto a gran escala en hardware Blackwell: con vLLM v0.30.0 y el parche MoE-SQ (`IST-DASLab/MoESQ`) el modelo puede servirse para tareas de generacion de texto en un unico nodo de 8× B300.
- Benchmarking de stacks de cuantizacion: util para comparar latencia y throughput entre NVFP4 W4A4 con group size 16 y otras variantes (por ejemplo, el checkpoint REAP50 del mismo autor).
- Analisis de degradacion por cuantizacion en capas especificas: al mantener en bf16 atencion, experto compartido, router y embeddings, permite aislar el efecto de la cuantizacion exclusivamente en los expertos enrutados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 369,1 GB en safetensors; se requiere un nodo multi-GPU con al menos esa capacidad agregada mas overhead de activaciones y cache KV.
- GPU recomendadas: NVIDIA B300 (SM103), que es el hardware usado por el autor para la poda y la calibracion; el stack de servicio (vLLM v0.30.0 con parche MoE-SQ) esta orientado a esa generacion.
- No cabe en GPU de consumo: 369 GB de pesos exceden cualquier GPU individual actual (RTX 4090, 5090, etc.).
- Opciones de despliegue: vLLM v0.30.0 con el parche MoE-SQ (`IST-DASLab/MoESQ`, `integrations/vllm/install.sh`); transformers con `custom_code` para carga; llama.cpp, Ollama y TGI no estan documentados para este checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Expertos enrutados | Cuantizacion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|---|
| kwanhee/Kimi-K2.5-REAP-E232-NVFP4-W4A4-GS16 | 625.167.444.048 | 232 de 384 | NVFP4 W4A4, gs16 | no disponible | Modified MIT | Checkpoint de este analisis; 2,719 bits/peso de experto |
| kwanhee/Kimi-K2.5-REAP50-NVFP4-W4A4-GS16 | no disponible | no disponible (REAP al 50 %) | NVFP4 W4A4, gs16 | no disponible | Modified MIT | Misma configuracion MoE-SQ, distinto nivel de poda |
| moonshotai/Kimi-K2.5 | no disponible | 384 de 384 | bf16 / release INT4 | no disponible | Modified MIT | Modelo base sin poda ni cuantizacion NVFP4 |

## Limitaciones y advertencias

- Es un checkpoint de investigacion para un rebuttal, no un modelo listo para produccion; solo 20 descargas y sin validacion externa documentada.
- No hay benchmarks publicados: se desconoce la degradacion real de calidad frente al modelo base tras la poda de 152 expertos por capa y la cuantizacion W4A4.
- El autor advierte que las rutas multimodales no han sido probadas y que todas las evaluaciones son solo de texto, pese a conservar la torre de vision.
- Requiere un stack parcheado (vLLM v0.30.0 + MoE-SQ) y hardware Blackwell SM103; FlashAttention-2 no estaba disponible en el entorno de calibracion, lo que introduce diferencias de orden de suma en coma flotante.
- La licencia Modified MIT debe revisarse en el fichero `LICENSE` del repositorio antes de cualquier uso comercial; se aplican tambien los avisos de terceros en `THIRD_PARTY_NOTICES.md`.
- Sesgos conocidos y riesgo de alucinacion: no documentados en la informacion disponible; se heredan los del modelo base, no evaluados aqui.
- Idiomas soportados y longitud de contexto no estan documentados para este checkpoint.
- El formato compressed-tensors con NVFP4 limita la portabilidad: no hay pesos GGUF ni soporte documentado en llama.cpp u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kwanhee/Kimi-K2.5-REAP-E232-NVFP4-W4A4-GS16
- Modelo base: https://huggingface.co/moonshotai/Kimi-K2.5
- Checkpoint hermano (REAP50): https://huggingface.co/kwanhee/Kimi-K2.5-REAP50-NVFP4-W4A4-GS16
- Paper MoE-SQ: arXiv 2610.02241 (*Hardware-Native Joint Sparse-Quantization for Trillion-Scale Mixture-of-Experts*)
- Integracion vLLM de MoE-SQ: https://github.com/IST-DASLab/MoESQ
- llm-compressor (REAPPruningModifier): https://github.com/vllm-project/llm-compressor
- REAP (Cerebras Research): no disponible enlace directo en la informacion proporcionada
