# CaptainCuong/Qwen3-0.6B_RSI_iter1

## Resumen

Qwen3-0.6B_RSI_iter1 es un ajuste fino (fine-tuning) del modelo Qwen3-0.6B de Qwen, publicado por el usuario CaptainCuong en Hugging Face. El modelo original es un LLM ligero de la familia Qwen3, con arquitectura transformer densa y aproximadamente 596 millones de parametros, orientado a tareas de generacion de texto conversacional. Esta version concreta se ha entrenado con LLaMA-Factory sobre un dataset derivado de math12k, filtrado segun respuestas correctas del propio modelo base (aproximacion tipo RSI, o self-improvement iterativo), con el objetivo de mejorar el rendimiento en tareas matematicas.

Su relevancia radica en el tamano reducido: al ser un modelo de menos de 1.000 millones de parametros, puede ejecutarse en hardware de consumo, en dispositivos edge o en escenarios con presupuestos de computo muy ajustados. Es un modelo experimental de comunidad (297 descargas y 2 likes en el momento de la ficha), sin documentacion detallada en su model card, por lo que conviene tratarlo como prueba de concepto de entrenamiento iterativo sobre datos autogenerados mas que como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3) |
| Parametros totales | 596.049.920 (~0,6 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la base Qwen3-0.6B soporta 32.768 tokens, segun documentacion de Qwen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (heredada de Qwen/Qwen3-0.6B) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only denso de la familia Qwen3 de Alibaba. El ajuste fino se realizo mediante LLaMA-Factory con entrenamiento completo (full fine-tuning, no LoRA), sobre el dataset `math12k_train_Qwen3_0.6B_prompt_simple_t0.7_k4_s0_e12000_correct`. El nombre del dataset sugiere un proceso de self-improvement: se generaron respuestas del modelo base con muestreo (temperatura 0,7, top-k 4), se filtraron las respuestas correctas y se usaron como datos de entrenamiento, una tecnica tipo RFT/RSI (reinforcement from self-improvement o rejection sampling fine-tuning).

Los hiperparametros publicados incluyen: learning rate de 1,25e-06 con scheduler coseno, batch size efectivo de 2 (2 GPUs, batch de 1 por dispositivo), optimizador AdamW fused (betas 0,9/0,999, epsilon 1e-08), semilla 42 y 5 epocas de entrenamiento. El entrenamiento se ejecuto con PyTorch 2.11.0+cu130 y Transformers 5.6.0. No se ha publicado informacion sobre el numero de tokens, la composicion detallada del dataset ni si hubo etapas adicionales de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen3-0.6B.
- Resolucion de problemas matematicos, foco del ajuste fino sobre math12k.
- Razonamiento basico en un modelo de tamano reducido, con posible soporte de modo thinking si se conserva el chat template de Qwen3 (no confirmado en la model card).
- Compatibilidad con el ecosistema transformers de Hugging Face y con endpoints de inferencia (text-generation-inference).
- No hay evidencia de capacidades de vision, audio ni de soporte formal de tool calling documentadas para este ajuste.

## Casos de uso

- Experimentacion con self-improvement iterativo: el modelo sirve como punto de partida o referencia para replicar pipelines de rejection sampling fine-tuning sobre datos matematicos autogenerados.
- Resolucion de problemas de matematicas en hardware modesto: al pesar unos 1,2 GB en fp16, puede ejecutarse en portatiles y GPUs de consumo para resolver problemas de nivel escolar.
- Prototipado de chatbots ligeros: su base conversacional permite montar asistentes simples donde el coste de inferencia importa mas que la maxima calidad.
- Investigacion en destilacion y datos sinteticos: util como modelo profesor/alumno en experimentos de generacion de datos sinteticos verificados.
- Desarrollo y pruebas de pipelines de inferencia: ideal para validar integraciones con vLLM, Ollama o llama.cpp antes de escalar a modelos mayores.
- Educacion y demostraciones: su tamano permite ejecutarlo en clase o en demos locales sin coste de API, mostrando conceptos de fine-tuning y evaluacion matematica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye un model-index con el nombre `Qwen3-0.6B_math12k_prompt_simple_correct` pero la lista de resultados esta vacia (`results: []`), por lo que no existen metricas cuantificables (MMLU, GSM8K, etc.) declaradas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,2-1,5 GB (596 M de parametros x 2 bytes, mas overhead de KV cache); en fp32, unos 2,4 GB.
- Con cuantizacion a 4 bits (si se genera un GGUF o AWQ), podria rondar los 400-600 MB, ejecutable incluso en CPU o en moviles.
- No requiere GPU dedicada: cualquier GPU de consumo (RTX 3060, RTX 4060, RTX 4090 o superiores) lo ejecuta con holgura; tambien es viable en CPU moderna.
- Opciones de despliegue: transformers de Hugging Face de forma nativa; al ser compatible con la arquitectura Qwen3, deberia funcionar con vLLM, llama.cpp (tras convertir a GGUF), Ollama y TGI, aunque el repositorio solo distribuye safetensors.
- Latencia y throughput: no disponibles; por su tamano, se espera inferencia rapida incluso en hardware modesto.
- Para reproducir el entrenamiento: se usaron 2 GPUs con entrenamiento completo, aunque el dataset y el modelo son lo bastante pequenos para entrenar en una sola GPU de gama alta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-0.6B (base) | ~0,6 B | 32.768 tokens | Apache 2.0 (segun Qwen) | Modelo base oficial, mejor documentado y con benchmarks publicados |
| Qwen3-0.6B_RSI_iter1 (este) | 596 M | no disponible | other | Ajuste fino matematico experimental, sin benchmarks publicados |
| Qwen2.5-0.5B-Instruct | ~0,5 B | 32.768 tokens | Qwen (uso comercial permitido con condiciones) | Generacion anterior, sin enfoque matematico especializado |
| SmolLM2-360M-Instruct (Hugging Face) | ~0,36 B | 8.192 tokens | Apache 2.0 | Alternativa ligera de HF, rendimiento inferior en matematicas |

## Limitaciones y advertencias

- No hay evaluaciones publicadas: no existe evidencia cuantitativa de que el ajuste fino mejore realmente el rendimiento matematico respecto al modelo base.
- Los modelos de menos de 1.000 millones de parametros tienen alta tasa de alucinacion y razonamiento poco fiable; no son aptos para tareas criticas sin verificacion externa.
- La model card esta practicamente vacia ("More information needed" en usos previstos, limitaciones y datos de entrenamiento), lo que dificulta evaluar sesgos y comportamiento.
- La licencia figura como "other": hay que revisar la licencia heredada de Qwen/Qwen3-0.6B antes de cualquier uso comercial.
- El dataset de entrenamiento procede de respuestas autogeneradas y filtradas, lo que puede amplificar sesgos o errores sistematicos del modelo base (feedback loop de self-improvement).
- La longitud de contexto, los idiomas y las capacidades exactas no estan documentados para este ajuste concreto.
- Modelo de comunidad con muy poca traccion (297 descargas), sin soporte ni mantenimiento garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CaptainCuong/Qwen3-0.6B_RSI_iter1
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Coleccion oficial de Qwen3: https://huggingface.co/collections/Qwen/qwen3
