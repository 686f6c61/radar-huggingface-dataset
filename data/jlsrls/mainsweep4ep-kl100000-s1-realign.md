# jlsrls/mainsweep4ep-kl100000-s1-realign

## Resumen

`jlsrls/mainsweep4ep-kl100000-s1-realign` es un ajuste fino (SFT) del modelo `unsloth/Llama-3.2-1B-Instruct`, publicado por el usuario `jlsrls` en HuggingFace. Hereda por tanto la arquitectura del Llama 3.2 1B Instruct de Meta: un transformer decoder-only denso de 1.240 millones de parametros, con atencion GQA, embeddings atados y una ventana de contexto nominal de 128.000 tokens. El repositorio ocupa 1,7 GB y los pesos se distribuyen en formato safetensors, cargables directamente con la libreria `transformers`.

El modelo se entreno con aprendizaje supervisado (SFT) utilizando el framework TRL (version 0.24.0) sobre el stack de Unsloth, segun declara su propia model card. El nombre del repositorio sugiere una ejecucion concreta dentro de un barrido de hiperparametros: `4ep` apuntaria a 4 epocas, `kl100000` a un coeficiente de penalizacion KL de 100.000, `s1` a una etapa o semilla y `realign` a la tecnica de alineacion ReAlign. Esta interpretacion es una inferencia a partir del nombre, no un dato confirmado en la documentacion disponible.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de investigacion con 0 descargas y 0 likes en el momento de la consulta, sin resultados de benchmarks publicados, sin licencia declarada de forma explicita y sin informacion sobre el dataset de entrenamiento. Es util como referencia para reproducir experimentos de alineacion en modelos pequenos, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Llama 3.2 1B Instruct) |
| Parametros totales | 1.235.814.400 (1,24 B), segun el modelo base; no verificado para este ajuste |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base; no confirmado en la model card del ajuste |
| Tipos de cuantizacion | No se publican cuantizaciones en el repositorio (solo pesos safetensors). El modelo base admite GGUF, bitsandbytes int8/int4, AWQ y GPTQ generados por la comunidad |
| Idiomas soportados | No disponible en la model card del ajuste. El modelo base declara 8 idiomas: ingles, aleman, frances, italiano, portugues, hindi, espanol y thai |
| Licencia | No declarada en el repositorio (el campo aparece como `license` sin especificar). Al derivar de Llama 3.2, se le aplica la Llama 3.2 Community License |
| Formato de pesos | safetensors (repo de 1,7 GB) |
| Libreria | transformers |
| Modelo base | unsloth/Llama-3.2-1B-Instruct |
| Framework de entrenamiento | TRL 0.24.0, Unsloth, Transformers 5.5.0, PyTorch 2.11.0, Datasets 4.3.0, Tokenizers 0.22.2 |
| Metodo de entrenamiento | SFT (supervised fine-tuning) |

## Arquitectura y entrenamiento

La arquitectura es la del Llama 3.2 1B Instruct, un transformer decoder-only de 16 capas, dimension oculta 2048, 32 cabezas de atencion y 8 cabezas KV (GQA, ratio 4:1), dimension de cabeza 64, FFN SwiGLU con dimension intermedia 8192, normalizacion RMSNorm pre-norm y RoPE con theta 500000. El vocabulario es de 128.256 tokens y los embeddings de entrada y salida estan atados. Meta construyo esta variante podando el Llama 3.1 8B y destilandolo despues con supervision de modelos mayores. Con embeddings atados, el coste de pesos en bf16 ronda los 2,5 GB y la cache KV completa a 128.000 tokens en fp16 ocupa aproximadamente 4 GiB (32 KiB por token: 2 x 16 capas x 8 cabezas KV x 64 dimensiones x 2 bytes).

Sobre el entrenamiento del ajuste solo consta que se realizo mediante SFT con TRL 0.24.0 y Unsloth, con una ejecucion registrada en Weights & Biases bajo el proyecto `clarifying-em`. No se especifica el dataset, el numero de tokens de entrenamiento, la composicion de los datos ni si hubo etapas posteriores de DPO o RLHF. Tampoco se documenta el uso de decodificacion especulativa ni otras optimizaciones de inferencia. El termino `realign` del nombre apunta a la linea de trabajo ReAlign, que combina supervision off-policy con revision estructurada para estabilizar la alineacion de modelos pequenos, pero no hay confirmacion de que este ajuste implemente ese metodo.

## Capacidades

- Generacion de texto conversacional en formato de chat, con plantilla compatible con el pipeline de `transformers` mostrado en la model card.
- Razonamiento basico y respuesta a preguntas de sentido comun, limitado por la escala de 1.240 M de parametros.
- Generacion de codigo sencillo y autocompletado, sin garantias de correccion en tareas complejas.
- Aritmetica y matematicas de nivel elemental, con alta probabilidad de error en razonamiento multi-paso.
- Capacidades multilingues heredadas del modelo base (8 idiomas declarados por Meta), no evaluadas en este ajuste.
- Soporte de tool calling y function calling: no confirmado en la model card; el Llama 3.2 1B Instruct base soporta plantillas de herramientas, pero no hay evidencia de que el ajuste las preserve.
- Soporte de agentes y razonamiento multi-paso: no confirmado ni evaluado.
- Modo de razonamiento explicito (thinking): no disponible.
- Vision y audio: no soportados (el modelo base es exclusivamente de texto).

## Casos de uso

- Reproduccion de experimentos de alineacion en modelos pequenos: sirve como punto de comparacion frente a otros checkpoints del mismo barrido (por ejemplo `jlsrls/em-kl100000-s1`), permitiendo medir el efecto de la configuracion `realign` sobre el comportamiento del modelo base.
- Prototipado rapido en local: con 1,24 B de parametros y pesos de ~2,5 GB en bf16, se puede cargar en una GPU de consumo o incluso en CPU cuantizado para validar plantillas de prompt y flujos de integracion antes de pasar a un modelo mayor.
- Generacion de texto asistida en entornos con recursos muy limitados: despliegue en portatiles o dispositivos con GPU integrada mediante llama.cpp u Ollama, una vez convertido a GGUF.
- Clasificacion y etiquetado de textos cortos: con prompting few-shot puede utilizarse para categorizar tickets, correos o resenas, siempre que se valide la calidad con un conjunto propio, dado que no hay benchmarks publicados.
- Base para ajustes especificos de dominio: al ser un checkpoint pequeno y ya alineado por SFT, es un punto de partida barato para LoRA sobre datos propios de un nicho concreto.
- Educacion e investigacion sobre comportamiento de modelos: util para estudiar como el SFT y las penalizaciones KL altas afectan a la diversidad de las respuestas y al olvido catastrofico en modelos de 1 B.
- Componente de sistemas de generacion aumentada (RAG) de bajo coste: el contexto largo del modelo base (hasta 128.000 tokens) permite inyectar documentacion extensa, aunque el rendimiento real de recuperacion a esa longitud no esta evaluado en este ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y el repositorio no adjunta evaluaciones. Tampoco se dispone de datos de latencia o throughput medidos para este checkpoint concreto.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 2,5 GB de pesos mas la cache KV, que crece a razon de 32 KiB por token (unos 4 GiB si se llena la ventana de 128.000 tokens).
- VRAM en int8 (bitsandbytes): aproximadamente 1,3 GB de pesos.
- VRAM en int4 (GGUF Q4_K_M): aproximadamente 0,8-1,0 GB de pesos.
- GPU recomendadas: cualquier GPU con 8 GB o mas (RTX 3060, RTX 4060, RTX 3070) es suficiente para inferencia en bf16 con contextos moderados; A100, H100 o L40S solo tienen sentido para servir muchas peticiones concurrentes.
- Cabe en GPU de consumo: si, con holgura. Una RTX 4090 o una RTX 3090 pueden mantener contexto largo y batching; una GPU de 6-8 GB es suficiente para uso de un solo usuario.
- Ejecucion en CPU: posible mediante llama.cpp u Ollama tras convertir los pesos a GGUF, con velocidades del orden de decenas de tokens por segundo, no medidas para este modelo.
- Opciones de despliegue: `transformers` con pipeline (metodo documentado en la model card), vLLM y TGI para servir en GPU, llama.cpp y Ollama para local, y Unsloth para continuar el ajuste.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

Los datos de esta tabla corresponden a la documentacion publica de cada modelo, no a la informacion proporcionada por el autor de este ajuste.

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| jlsrls/mainsweep4ep-kl100000-s1-realign | 1,24 B | 128.000 tokens (heredado, no confirmado) | No declarada; se aplica la Llama 3.2 Community License | safetensors, sin cuantizaciones publicadas |
| unsloth/Llama-3.2-1B-Instruct (base) | 1,24 B | 128.000 tokens | Llama 3.2 Community License | safetensors, amplia disponibilidad de GGUF comunitarios |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF, AWQ, GPTQ |
| SmolLM2-1.7B-Instruct | 1,71 B | 8.192 tokens | Apache 2.0 | safetensors, GGUF |
| Gemma 2 2B-it | 2,61 B | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF |

Frente a estas alternativas, el unico diferencial claro del modelo analizado es la ventana de contexto de 128.000 tokens del modelo base y su licencia permisiva en cuanto a uso comercial dentro de los terminos de Llama 3.2. En cambio, carece de benchmarks publicados, de cuantizaciones listas para usar y de una licencia declarada de forma explicita en el repositorio, lo que dificulta su adopcion en produccion frente a Qwen2.5-1.5B-Instruct o SmolLM2-1.7B-Instruct.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo hereda los sesgos del Llama 3.2 1B Instruct, que no han sido evaluados ni mitigados en este ajuste. No hay informacion sobre la composicion del dataset de SFT, por lo que no se puede descartar la introduccion de sesgos adicionales.
- Riesgo de alucinacion: elevado por la escala de 1.240 M de parametros y la ausencia de evaluaciones de factualidad. No se recomienda su uso en tareas donde la veracidad sea critica sin verificacion posterior.
- Olvido catastrofico: al tratarse de un SFT sobre un checkpoint ya instruido, existe riesgo de degradacion de capacidades del modelo base (multilingue, seguimiento de instrucciones, tool calling). No se aporta ninguna evaluacion comparativa antes/despues.
- Limitaciones de contexto: aunque el modelo base soporta 128.000 tokens, el rendimiento efectivo a longitudes muy largas no esta verificado en este ajuste y la cache KV completa consume aproximadamente 4 GiB adicionales.
- Idiomas: la model card no declara idiomas. El soporte multilingue es una herencia no verificada del modelo base y puede haberse degradado con el ajuste.
- Licencia: el campo de licencia del repositorio esta sin especificar. Al derivar de Llama 3.2, se aplica la Llama 3.2 Community License, que exige incluir el aviso "Built with Llama", respetar la politica de uso aceptable y tiene una clausula especifica para productos con mas de 700 millones de usuarios mensuales. Conviene verificar los terminos antes de cualquier uso comercial.
- Trazabilidad: no se documenta el dataset, el numero de tokens de entrenamiento ni los hiperparametros completos. Solo hay un enlace a una ejecucion de Weights & Biases, lo que limita la reproducibilidad.
- Madurez: 0 descargas y 0 likes en el momento de la consulta. Es un artefacto de investigacion sin validacion externa ni mantenimiento declarado.
- Fecha de creacion del repositorio: 25 de septiembre de 2026, segun los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jlsrls/mainsweep4ep-kl100000-s1-realign
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-1B-Instruct
- Modelo relacionado del mismo autor: https://huggingface.co/jlsrls/em-kl100000-s1
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/rezvani-portland-state-university/clarifying-em/runs/1f7cs6q2
- Repositorio de TRL: https://github.com/huggingface/trl
- Publicacion ReAlign (referencia del nombre del modelo): https://slit-ai.github.io/publication/2025-11-01-realign-structured-revision-for-small-language
- Repositorio ReAlign (GAIR-NLP): https://github.com/GAIR-NLP/ReAlign
- PDF del articulo ReAlign (Findings EMNLP 2025): https://aclanthology.org/2025.findings-emnlp.642.pdf
