# adpretko/celerity-271m-8k-tpp-ablation-ad0p8-ild-tpp16

## Resumen

Celerity 271M 8K — TPP ablation — ad0.8_ild_tpp16 es un checkpoint de investigación de la familia Celerity, un modelo de lenguaje de pequeno tamano (271 millones de parametros) entrenado en hardware Cerebras y convertido posteriormente al formato de Hugging Face. Lo publica el usuario adpretko como parte de una ablacion sobre el regimen de entrenamiento "tokens per parameter" (TPP), en concreto el punto `ad0.8_ild_tpp16` con 16 tokens por parametro nominales y un schedule de attention dropout dependiente de la capa con endpoint 0.8.

El modelo resuelve un problema de caracter experimental: permitir a la comunidad reproducir y analizar el efecto de distintas tasas de dropout en atencion y de presupuestos de tokens por parametro sobre el rendimiento final de un transformer pequeno con contexto largo. No es un modelo pensado para produccion, sino una pieza de un barrido de ablaciones academicas.

Arquitectura transformer con embeddings posicionales ALiBi y ventana de contexto maxima de 8192 tokens, entrenado sobre 4.332.584.960 tokens del dataset CommonPile (pool TPP corregido sin repeticiones). El checkpoint se distribuye con codigo personalizado (`trust_remote_code=True`) y pesos en formato PyTorch, con un tamano de repositorio de 0,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con embeddings posicionales ALiBi |
| Parametros totales | 271 millones (nominal, segun el nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (custom_code, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 271 millones de parametros con embeddings posicionales ALiBi en lugar de posiciones absolutas aprendidas o RoPE, lo que le permite extrapolar a secuencias de hasta 8192 tokens. El entrenamiento se realizo en 3 sistemas CSX de Cerebras con el runtime `cbcore 2.6.0`, un batch global de 44, learning rate pico de 0.15, weight decay de 0.002842849281760314 y `tau_ema` de 0.1950969310368566, durante 12.020 pasos que suman 4.332.584.960 tokens.

La innovacion principal del checkpoint es el regimen de attention dropout: el valor 0.8 es el endpoint de un schedule lineal dependiente de la capa, no una probabilidad uniforme de dropout. El autor advierte explicitamente de esta distincion. El dropout se desactiva con `model.eval()`. El dataset es CommonPile, en su variante "corrected no-repeat TPP pool", disenada para ablaciones de tokens por parametro sin repeticiones. No se documenta RLHF, DPO ni ninguna fase de alineamiento posterior al preentrenamiento.

## Capacidades

- Generacion de texto autoregresiva basica, limitada por el tamano del modelo (271M).
- Razonamiento de corto alcance y tareas de continuacion de texto.
- Capacidad multilingue: no documentada; el dataset CommonPile es predominantemente en ingles.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, vision o audio: no disponible.
- Contexto largo de hasta 8192 tokens gracias a ALiBi.

## Casos de uso

- Investigacion sobre schedules de dropout: el checkpoint sirve para comparar el efecto del endpoint de attention dropout (0.8) frente a otras configuraciones del mismo barrido de ablaciones, midiendo perplejidad y metricas downstream.
- Estudios de escalado tokens-por-parametro: al fijar 16 TPP nominales, permite analizar la relacion entre presupuesto de tokens y calidad final en modelos pequenos.
- Reproducibilidad de entrenamiento en Cerebras: util para validar pipelines de conversion de checkpoints `.mdl` a formato Hugging Face con el commit de conversor documentado.
- Experimentos de contexto largo en modelos pequenos: los 8192 tokens con ALiBi permiten probar tareas de recuperacion en contexto con recursos minimos.
- Baseline para fine-tuning academico: punto de partida barato para estudiar tecnicas de adaptacion (LoRA, adapters) sobre un modelo de 271M.
- Analisis de sesgos y calidad de CommonPile: al estar entrenado sobre ese corpus, sirve para auditar sus caracteristicas en un modelo de escala reducida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-1,1 GB en fp32 (271M parametros), menos de 0,3 GB en cuantizacion de 4 bits.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; tambien CPU.
- Cabe holgadamente en GPU consumer, incluso en tarjetas integradas con suficiente memoria compartida.
- Opciones de despliegue: al requerir `trust_remote_code=True`, la carga directa con `transformers` es la via documentada; la conversion a GGUF para llama.cpp u Ollama no esta documentada y dependeria del codigo personalizado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Celerity 271M 8K (este) | 271M | 8192 | no disponible | Hugging Face, custom_code |
| Pythia-410M | 410M | 2048 | Apache 2.0 | Hugging Face |
| GPT-2 medium | 355M | 1024 | MIT | Hugging Face |
| OPT-350M | 350M | 2048 | OPT-175B license | Hugging Face |

La comparativa se limita a parametros, contexto y licencia porque no hay benchmarks publicados para este checkpoint. Frente a Pythia u OPT, la ventaja de Celerity es el contexto de 8192 tokens; la desventaja es la ausencia de licencia declarada y de evaluaciones publicadas.

## Limitaciones y advertencias

- Modelo de investigacion sin evaluacion publicada: no hay datos de MMLU, HumanEval, GSM8K ni perplejidad comparativa.
- Licencia no declarada: no se puede asumir uso comercial permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- Riesgo de alucinacion alto por el tamano reducido (271M) y la ausencia de alineamiento (sin RLHF/DPO documentado).
- Idiomas: no documentados; el corpus CommonPile es mayoritariamente ingles, por lo que el rendimiento en castellano sera previsiblemente bajo.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; auditar antes de usar en entornos sensibles.
- El attention dropout de 0.8 es un endpoint de schedule, no un valor uniforme; no interpretar mal la configuracion al reproducir.
- Sin garantias de soporte ni mantenimiento; creado y actualizado el mismo dia (27-11-2026).

## Enlaces

- Hugging Face: https://huggingface.co/adpretko/celerity-271m-8k-tpp-ablation-ad0p8-ild-tpp16
- Dataset CommonPile: no disponible en la informacion proporcionada
- Paper o blog de Celerity: no disponible en la informacion proporcionada
- Repositorio del conversor (commit `0e3d5d375695293479df9d2a3717f05f71a345b4`): no disponible en la informacion proporcionada
