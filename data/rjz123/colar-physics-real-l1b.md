# rjz123/colar-physics-real-l1b

## Resumen

`rjz123/colar-physics-real-l1b` es un checkpoint de investigacion que aplica CoLaR (Compressed Latent Reasoning) sobre el modelo base `unsloth/Llama-3.2-1B-Instruct`. CoLaR es una tecnica de razonamiento latente autoregresivo que comprime la informacion semantica de multiples tokens de texto en una unica variable latente, permitiendo cadenas de razonamiento dinamicas y mas eficientes en computo. El autor, rjz123, lo presenta como un experimento de una sola pista (single-track) entrenado sobre un dataset denominado `physics_real_mix`, con warm-start desde un checkpoint previo llamado `colar_physics`.

El checkpoint no es un modelo completo autocontenido: se distribuye como un archivo de PyTorch-Lightning (`.ckpt`) que solo contiene los pesos del adaptador y el modulo de politica latente, y debe combinarse con el modelo base cargado por separado. Su tamano de repositorio es de 0,1 GB. Esta pensado exclusivamente para investigacion sobre razonamiento latente comprimido en modelos pequenos, no para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-3.2-1B-Instruct + CoLaR (LoRA r128 en q/v + MLP LatentPolicy + resize de embeddings con tokens `[PAD]`) |
| Parametros totales | Base: ~1,24 mil millones; adaptador CoLaR: no disponible (repo de 0,1 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para el adaptador; el base Llama-3.2-1B-Instruct soporta hasta 128K tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible; el base Llama-3.2-1B-Instruct esta optimizado principalmente para ingles |
| Licencia | No disponible |
| Formato de pesos | Checkpoint PyTorch-Lightning (`.ckpt`), no cargable con `AutoModel`; requiere scaffold personalizado |

## Arquitectura y entrenamiento

El modelo combina la arquitectura transformer del base Llama-3.2-1B-Instruct con el andamiaje CoLaR, que introduce un objetivo de prediccion de siguiente embedding comprimido: en lugar de predecir token a token, el modelo aprende a capturar la semantica de varios tokens de texto en una unica variable latente y razona con longitudes de cadena dinamicas. Los pesos del checkpoint se almacenan bajo la clave `['state_dict']` y solo encajan en el scaffold CoLaR personalizado, compuesto por el LLM base, un resize de embeddings con tokens `[PAD]`, LoRA de rango 128 aplicado a las proyecciones q y v, y un MLP `LatentPolicy` que decide la longitud de la cadena de razonamiento latente. La carga se realiza con `strict=False` y requiere las variables de entorno `COLAR_BASE`, `COLAR_CKPT`, `COLAR_EMB_STD=0.018`, `COLAR_COMPRESS=5`, `COLAR_MAXLAT=64` y `TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD=1`.

El entrenamiento parte de un warm-start desde el checkpoint `colar_physics` y se entrena sobre `physics_real_mix`, un dataset de fisica con problemas de razonamiento realista. No se dispone de informacion sobre el numero total de tokens de entrenamiento ni sobre el uso de RLHF o DPO. La tecnica CoLaR esta documentada en el articulo "Think Silently, Think Fast: Dynamic Latent Compression of LLM Reasoning" (arXiv:2505.16552).

## Capacidades

- Razonamiento latente comprimido: el modelo razona en un espacio latente comprimido, capturando multiples tokens por variable latente.
- Generacion de texto autoregresiva sobre el base Llama-3.2-1B-Instruct.
- Longitud de cadena de razonamiento dinamica, controlada por el modulo `LatentPolicy`.
- Compresion configurable: `COLAR_COMPRESS=5` indica un factor de compresion de 5 tokens por variable latente, con un maximo de 64 variables latentes (`COLAR_MAXLAT=64`).
- Capacidades del modelo base: instrucciones, chat, generacion de texto general; el base Llama-3.2-1B-Instruct tiene soporte limitado de tool calling y funciones basicas de agente, aunque no se ha verificado que estas se conserven tras el entrenamiento CoLaR.
- No se ha confirmado soporte de vision, audio ni modo thinking explicito.

## Casos de uso

- Investigacion academica sobre razonamiento latente: el checkpoint permite reproducir y extender los experimentos del articulo CoLaR, comparando la eficiencia del razonamiento comprimido frente al autoregresivo clasico en un modelo de 1B de parametros.
- Estudio de compresion semantica en modelos pequenos: analizar como el factor de compresion (`COLAR_COMPRESS=5`) afecta a la calidad del razonamiento en problemas de fisica.
- Benchmarking de eficiencia computacional: medir el ahorro en latencia y coste de inferencia al razonar con variables latentes en lugar de tokens individuales, especialmente en tareas de razonamiento multi-paso.
- Evaluacion de la transferencia de conocimiento entre dominios: el warm-start desde `colar_physics` y el entrenamiento sobre `physics_real_mix` permite estudiar como el razonamiento latente se adapta a distintos conjuntos de problemas cientificos.
- Desarrollo de tecnicas de decodificacion especulativa latente: el scaffold CoLaR puede servir como base para investigar metodos híbridos que combinen razonamiento latente con decodificacion estandar.
- Comparativa de metodos de compresion de razonamiento: utilizar este checkpoint como referencia frente a otras tecnicas de compresion de cadena de pensamiento (p. ej., Chain-of-Thought con pocos tokens, o distillation de razonamiento) en modelos de la familia Llama-3.2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion comparativa. El articulo de referencia de CoLaR (arXiv:2505.16552) reporta resultados generales de la tecnica, pero no se han verificado datos especificos para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un base de 1B de parametros, la inferencia en FP16 requiere aproximadamente 2,5-3 GB de VRAM; con cuantizacion de 4 bits podria reducirse a menos de 1 GB. No obstante, el scaffold CoLaR anade el MLP `LatencyPolicy` y el resize de embeddings, lo que incrementa ligeramente el consumo.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente. Para entrenamiento o fine-tuning adicional, se recomienda una GPU con 8-16 GB (RTX 4080, A100 40 GB).
- Compatibilidad con consumer GPU: si, el modelo cabe sin problema en GPUs de consumo gracias a su tamano reducido.
- Opciones de despliegue: no es compatible con vLLM, Ollama, llama.cpp ni TGI de forma directa, ya que el checkpoint no es cargable con `AutoModel` y requiere el scaffold CoLaR personalizado. El despliegue exige ejecutar el codigo del repositorio del autor con las variables de entorno indicadas.
- Latencia y throughput: no disponibles. Al ser un checkpoint de investigacion sin benchmarks publicados, no se conocen cifras de rendimiento en inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento latente | Licencia | Formato |
|---|---|---|---|---|---|
| `rjz123/colar-physics-real-l1b` | ~1,24 B (base) + adaptador | No disponible (base: 128K) | Si (CoLaR) | No disponible | Checkpoint Lightning |
| `unsloth/Llama-3.2-1B-Instruct` (base) | 1,24 B | 128K | No | Llama 3.2 Community License | safetensors |
| `Qwen2.5-1.5B-Instruct` | 1,54 B | 32K | No | Apache 2.0 | safetensors |
| `TinyLlama-1.1B-Chat-v1.0` | 1,1 B | 2K | No | Apache 2.0 | safetensors |

La comparativa directa con otros modelos de razonamiento latente no esta disponible, ya que CoLaR es una linea de investigacion reciente y no hay modelos comerciales o de amplia difusion que implementen esta tecnica. Frente a los modelos instructivos convencionales de tamano similar, la diferencia principal es el mecanismo de compresion latente, que promete mayor eficiencia en razonamiento multi-paso, aunque sin benchmarks publicados no es posible cuantificar esa ventaja.

## Limitaciones y advertencias

- No es un modelo cargable con `AutoModel`: requiere el scaffold CoLaR personalizado del autor y la carga con `strict=False`, lo que limita su uso a entornos de investigacion con el codigo fuente disponible.
- El checkpoint es antiguo (formato Lightning) y requiere `TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD=1` para cargarse correctamente, lo que puede causar incompatibilidades con versiones recientes de PyTorch.
- No se especifica licencia, por lo que el uso comercial es juridicamente incierto; se recomienda contactar al autor antes de cualquier uso fuera del ambito academico.
- No se han publicado benchmarks ni evaluaciones de calidad, por lo que el rendimiento real en tareas de fisica u otras dominios es desconocido.
- El modelo base Llama-3.2-1B-Instruct tiene sesgos conocidos heredados de sus datos de entrenamiento, y el fine-tuning sobre `physics_real_mix` no los corrige.
- Riesgo de alucinacion en razonamiento cientifico: al ser un modelo de 1B entrenado sobre un dataset especifico, puede generar razonamientos plausibles pero incorrectos en problemas de fisica.
- Sin soporte de cuantizacion documentado: no se indica si los pesos son compatibles con formatos GGUF o AWQ, lo que limita las opciones de despliegue eficiente.
- El dataset `physics_real_mix` no esta documentado en la informacion disponible, por lo que se desconoce su tamano, composicion y calidad.

## Enlaces

- HuggingFace: https://huggingface.co/rjz123/colar-physics-real-l1b
- Articulo de referencia de CoLaR (arXiv): https://arxiv.org/pdf/2505.16552
- Perfil de GitHub del autor: https://github.com/rjz123
