# jekunz/smollm-360m-lora-fineweb-faroese-seed2

## Resumen

`jekunz/smollm-360m-lora-fineweb-faroese-seed2` es un adaptador LoRA (PEFT) sobre el modelo base `HuggingFaceTB/SmolLM2-360M-Instruct`, ajustado por el usuario jekunz para la porcion en feroes (codigo ISO `fo`) del corpus `HuggingFaceFW/fineweb-2`. No se trata de un modelo completo, sino de un conjunto de pesos delta que deben aplicarse sobre el checkpoint base para su uso. El objetivo declarado es la investigacion personal del autor, orientada a mejorar la competencia del modelo en feroes, un idioma de bajos recursos con escasa representacion en corpus de preentrenamiento.

El modelo hereda la arquitectura transformer decoder-only de SmolLM2-360M-Instruct, con 360 millones de parametros y una ventana de contexto nativa de 8192 tokens en el modelo base. Sin embargo, el ajuste se ha realizado con una longitud maxima de 2048 tokens, lo que condiciona el comportamiento practico del adaptador. El entrenamiento emplea LoRA con rango 256 y alpha 512 sobre las proyecciones MLP (`up_proj`, `down_proj`, `gate_proj`, `o_proj`), durante 5 epocas con learning rate 8e-4 y batch efectivo de 256, en una unica A100 de 40 GB.

La relevancia de esta publicacion es acotada pero concreta: demuestra un flujo de especializacion linguistica de bajo coste sobre un modelo pequeno, reproducible con una sola GPU y licencia Apache 2.0. Al estar publicada como una de tres semillas de entrenamiento (seed 2), su interes principal es metodologico (estudio de varianza entre ejecuciones) mas que de rendimiento absoluto. El autor advierte explicitamente que el modelo no ha sido evaluado de forma amplia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2), adaptador LoRA sobre modelo base |
| Parametros totales | 360M en el modelo base; el adaptador LoRA anade pesos delta (rango 256) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens en el modelo base; entrenado con 2048 tokens maximos |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | feroes (`fo`); el modelo base soporta principalmente ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre SmolLM2-360M-Instruct, un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU y atencion multi-cabeza con RoPE. El ajuste LoRA utiliza rango 256 y alpha 512 (escala efectiva alpha/r = 2), con modulos objetivo limitados a las proyecciones MLP (`up_proj`, `down_proj`, `gate_proj`, `o_proj`); no se ajustan las proyecciones de atencion (`q_proj`, `k_proj`, `v_proj`, `o_proj` de atencion). Este diseno concentra la adaptacion en las capas feed-forward, lo que suele bastar para desplazamientos de dominio linguistico pero limita la reconfiguracion de los patrones de atencion.

El entrenamiento se realizo sobre la porcion en feroes de `HuggingFaceFW/fineweb-2`, un corpus web filtrado y deduplicado. Se ejecutaron 5 epocas con learning rate 8e-4, scheduler coseno, warmup ratio 0.05, batch size 8 y acumulacion de gradientes 32 (batch efectivo 256), en una A100 de 40 GB, con longitud maxima de 2048 tokens. La semilla 2 corresponde a una de tres ejecuciones con identica configuracion, lo que sugiere un estudio de estabilidad del ajuste. No se documenta el numero total de tokens de entrenamiento, la composicion exacta del subconjunto ni si hubo etapas de alineacion adicionales (RLHF/DPO) tras el ajuste supervisado.

## Capacidades

- Generacion de texto conversacional en feroes, heredada del formato instruct del modelo base.
- Comprension y generacion en feroes tras el ajuste sobre FineWeb-2 (`fo`), con calidad no evaluada formalmente.
- Razonamiento basico y respuesta a instrucciones, limitado por el tamano de 360M parametros del modelo base.
- Generacion de codigo y matematicas elementales, procedente del modelo base; no reforzada por este ajuste.
- Soporte de tool calling y function calling: no documentado para este adaptador; el modelo base SmolLM2-Instruct tiene soporte limitado y no verificado aqui.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: restringidas a feroes (objetivo) e ingles (heredado del base); no se declaran otros idiomas.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Generacion de texto en feroes para experimentacion linguistica: el adaptador permite producir texto en feroes con un modelo de 360M que cabe en GPU consumer, util para prototipos de generacion y evaluacion cualitativa en un idioma de bajos recursos.
- Estudio de estabilidad de ajuste fino: al ser la semilla 2 de tres ejecuciones identicas, sirve para comparar varianza entre semillas en tareas de adaptacion linguistica, midiendo diferencias en perplejidad o calidad de generacion.
- Base para investigacion en LoRA sobre idiomas de bajos recursos: la configuracion (rango 256, modulos MLP, lr 8e-4) es un punto de partida reproducible con una sola A100 para explorar tecnicas de adaptacion.
- Prototipado de asistentes conversacionales en feroes: con contexto efectivo de 2048 tokens, puede gestionar dialogos cortos multi-turno en entornos de demo o validacion interna, no en produccion sin evaluacion previa.
- Generacion de datos sinteticos en feroes: puede emplearse para aumentar corpus de entrenamiento o evaluacion en feroes, siempre con revision humana dada la ausencia de benchmarks.
- Educacion e investigacion academica: adecuado para trabajos que comparan adaptadores LoRA de bajo coste frente a modelos multilingues mayores en tareas de traduccion o generacion en feroes.
- Despliegue en entornos con recursos limitados: al requerir solo el modelo base de 360M mas el adaptador, puede ejecutarse en GPUs de 8-16 GB o incluso en CPU con cuantizacion del base, para pruebas offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 360M en fp16 ocupa aproximadamente 0.7 GB de pesos; con overhead de activaciones y cache KV para 2048 tokens, se estima un uso de 1.5-3 GB en fp16. El adaptador LoRA anade una fraccion pequena de pesos delta.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; A100, H100 o RTX 4090 son sobredimensionadas para este tamano y solo justificables para entrenamiento o batched inference.
- Cabe en GPU consumer: si, en GTX 1650 (4 GB), RTX 3060 (12 GB), RTX 4060 (8 GB) y superiores, asi como en iGPU con cuantizacion del base.
- Opciones de despliegue: transformers con PEFT (carga del adaptador sobre el base), llama.cpp/Ollama (requiere fusionar el adaptador en el base y convertir a GGUF), vLLM (soporte de LoRA en runtime) y TGI (soporte de adaptadores PEFT).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera alta velocidad en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jekunz/smollm-360m-lora-fineweb-faroese-seed2 | 360M (base) + LoRA | 2048 (entrenamiento) / 8192 (base) | feroes, ingles (base) | Apache 2.0 | Hugging Face (adaptador PEFT) |
| HuggingFaceTB/SmolLM2-360M-Instruct | 360M | 8192 | principalmente ingles | Apache 2.0 | Hugging Face |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1.7B | 8192 | principalmente ingles | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B-Instruct | 0.5B | 32768 | multilingue (incluye varios idiomas, no feroes especificamente) | Apache 2.0 | Hugging Face |

La comparativa se limita a modelos de tamano similar; no se dispone de datos de rendimiento en feroes para ninguno de ellos, por lo que la eleccion entre alternativas depende de la disponibilidad de adaptadores especificos y de la licencia, no de benchmarks publicados.

## Limitaciones y advertencias

- Ausencia total de evaluacion publicada: el autor indica que el modelo no ha sido evaluado ampliamente; no hay benchmarks de perplejidad, traduccion ni generacion en feroes.
- Riesgo de alucinacion elevado: con 360M parametros y ajuste solo en capas MLP, la fidelidad factual y la coherencia en contextos largos son limitadas.
- Contexto efectivo reducido: aunque el base soporta 8192 tokens, el ajuste se realizo con 2048, por lo que el rendimiento mas alla de esa longitud no esta garantizado.
- Cobertura linguistica restringida: el adaptador esta pensado para feroes; el uso en otros idiomas degrada el comportamiento respecto al base.
- Sesgos del corpus: FineWeb-2 es un corpus web filtrado pero no libre de sesgos, toxicidad o contenido de baja calidad; el adaptador puede reproducirlos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no garantiza idoneidad para produccion y no ofrece soporte.
- Dependencia del modelo base: el adaptador no es autonomo; requiere cargar `SmolLM2-360M-Instruct` y aplicar PEFT, lo que anade complejidad de despliegue frente a un checkpoint fusionado.
- Naturaleza experimental: al ser una de tres semillas de un experimento de investigacion, no debe tratarse como un modelo listo para produccion sin validacion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-360m-lora-fineweb-faroese-seed2
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Documentacion de PEFT: https://huggingface.co/docs/peft
