# jlsrls/mainsweep-ctrl-s0-realigndense

## Resumen

mainsweep-ctrl-s0-realigndense es un ajuste fino (fine-tune) del modelo instructivo Llama-3.2-1B-Instruct, publicado en Hugging Face por el usuario jlsrls. Se trata de un modelo denso de aproximadamente 1.240 millones de parametros, entrenado mediante SFT (supervised fine-tuning) con la libreria TRL de Hugging Face, segun se documenta en su model card. El repositorio pesa 3,2 GB y contiene pesos en formato safetensors compatibles con la libreria transformers.

El nombre del modelo sugiere que forma parte de una familia de experimentos denominada "mainsweep", con variantes de control ("ctrl"), por etapas ("s0", "s1") y con fines de reajuste ("realign"). El registro de entrenamiento enlazado apunta a un proyecto de Weights & Biases llamado "clarifying-em", alojado en la organizacion de la Portland State University, lo que indica un contexto de investigacion academica sobre alineacion o clarificacion de respuestas.

Su relevancia practica es limitada por el momento: no acumula descargas ni "likes", no declara licencia ni idiomas, y no publica resultados de benchmarks. Se debe tratar como un artefacto de investigacion cuyo comportamiento especifico no esta documentado, mas alla de lo heredado de su modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada del modelo base Llama-3.2-1B-Instruct) |
| Parametros totales | ~1.240 millones (modelo base); no confirmado para el fine-tune |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base; no confirmado para este fine-tune |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en precision de entrenamiento; no se han publicado versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no declarados en la model card; el modelo base soporta oficialmente ingles, aleman, frances, italiano, portugues, hindi, castellano y thai |
| Licencia | no disponible (la model card indica "licence: license" sin especificar; el modelo base se rige por la Llama 3.2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Llama 3.2 1B Instruct: un transformer decoder-only denso con atencion de consultas agrupadas (GQA), codificacion posicional rotatoria (RoPE) y capas feed-forward con activacion SwiGLU. El ajuste fino no modifica la arquitectura, sino unicamente los pesos. El repositorio ocupa 3,2 GB, un tamano coherente con un guardado de pesos completos (no un adaptador LoRA ligero) junto con los ficheros de configuracion y tokenizador.

El entrenamiento se realizo mediante SFT con TRL 0.24.0, sobre Transformers 5.5.0, PyTorch 2.11.0, Datasets 4.3.0 y Tokenizers 0.22.2. No se detalla en la model card el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas posteriores de RLHF o DPO. El unico enlace operativo es un registro de Weights & Biases dentro del proyecto "clarifying-em". No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal u otras).

## Capacidades

Las capacidades que se enumeran a continuacion son las que cabe esperar por herencia del modelo base Llama-3.2-1B-Instruct; no hay documentacion que confirme el comportamiento efectivo del fine-tune.

- Generacion de texto conversacional y respuesta a instrucciones en formato chat.
- Razonamiento basico y tareas de conocimiento general de un modelo de 1B de parametros.
- Generacion y explicacion de codigo sencillo.
- Aritmetica y problemas matematicos de baja complejidad.
- Capacidades multilingues limitadas a los idiomas cubiertos por el modelo base.
- Soporte de tool calling / function calling: heredado del formato de plantilla del modelo base, no verificado en este fine-tune.
- Uso en flujos de agente y razonamiento multi-paso: posible en teoria por la ventana de contexto, pero no documentado ni validado.
- Capacidades especiales (modo "thinking", vision, audio): no disponibles.

## Casos de uso

- Experimentacion academica en alineacion: el modelo parece formar parte de una serie de experimentos de investigacion ("mainsweep", "clarifying-em"); su uso natural es reproducir y auditar esos experimentos, no desplegarlo en produccion.
- Clasificacion y etiquetado de texto a pequena escala: con 1B de parametros puede ejecutarse en GPU de gama media para tareas de extraccion o categorizacion de baja latencia.
- Prototipado rapido de asistentes conversacionales: sirve como banco de pruebas barato antes de escalar a modelos mayores de la misma familia.
- Generacion de codigo asistida en entornos de desarrollo locales: su tamano permite ejecutarlo en portatiles con GPU discreta para autocompletado o explicacion de fragmentos.
- Filtrado y resumen de textos largos: la ventana de contexto de 128.000 tokens del modelo base (no verificada en el fine-tune) permitiria procesar documentos extensos en una sola pasada.
- Educacion e investigacion sobre ajuste fino: al estar publicado como "generated_from_trainer", es un ejemplo util para estudiar como se comporta un SFT sobre Llama 3.2 1B.
- Evaluacion comparativa de tecnicas de entrenamiento: sus variantes hermanas (mainsweep-ctrl-s0-realign, mainsweep-ctrl-s1-em) permiten comparar configuraciones de entrenamiento bajo una misma base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas (MMLU, HumanEval, GSM8K u otras) y no se ha localizado ningun informe externo que las documente para este fine-tune concreto.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de ~1,24B parametros): aproximadamente 3 GB en fp16/bf16 (pesos + cache KV y activaciones para contextos moderados); en torno a 1,5 GB en int8 y menos de 1 GB en int4.
- GPU recomendadas: cualquiera con al menos 4 GB de VRAM para fp16, como RTX 3050, RTX 3060, RTX 4060, RTX 4090; en entornos de servidor, A100, H100 o L4 son mas que suficientes y quedan sobredimensionadas para este tamano.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en GPU de consumo modernas, incluso en tarjetas de gama de entrada con 6-8 GB.
- Opciones de despliegue: transformers (via pipeline, tal como indica la model card) y vLLM o TGI para servicio. Para llama.cpp u Ollama seria necesario convertir previamente los pesos a GGUF, ya que el repositorio solo publica safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mainsweep-ctrl-s0-realigndense | ~1,24B (base) | 128k (base, no confirmado) | no disponible | Hugging Face | Fine-tune academico sin benchmarks |
| Llama-3.2-1B-Instruct (unsloth) | ~1,24B | 128k | Llama 3.2 Community License | Hugging Face | Modelo base directo, ampliamente usado |
| Llama-3.2-3B-Instruct | ~3,2B | 128k | Llama 3.2 Community License | Hugging Face | Misma familia, mas capacidad a mayor coste |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32k | Apache 2.0 | Hugging Face | Alternativa de licencia permisiva, sin fine-tune especifico |
| SmolLM2-1.7B-Instruct | ~1,7B | 8k | Apache 2.0 | Hugging Face | Opcion ligera con licencia permisiva y contexto corto |

## Limitaciones y advertencias

- Alucinacion: al derivar de un modelo de 1B de parametros, la tasa de invencion de datos es elevada en tareas de conocimiento factual; no debe usarse como fuente de verdad.
- Sesgos: no se documenta ningun analisis de sesgos; hereda los del corpus de entrenamiento de Llama 3.2.
- Idiomas: la model card no declara idiomas; se asume el soporte multilingue del modelo base, con calidad notablemente inferior en idiomas no oficiales.
- Contexto: aunque el modelo base admite 128.000 tokens, no hay confirmacion de que este fine-tune conserve ese limite ni de que rinda correctamente en contextos largos.
- Licencia: la model card indica "licence: license" sin detallar condiciones. Antes de cualquier uso comercial es imprescindible aclarar la licencia con el autor, ya que el modelo base se rige por la Llama 3.2 Community License, con sus propias restricciones.
- Madurez: cero descargas y cero "likes", ademas de ausencia total de benchmarks, lo convierten en un artefacto experimental no validado para produccion.
- Documentacion insuficiente: se desconoce el dataset de entrenamiento, el numero de tokens, la composicion de datos y si hubo etapas de alineacion posteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jlsrls/mainsweep-ctrl-s0-realigndense
- Modelo base (unsloth/Llama-3.2-1B-Instruct): https://huggingface.co/unsloth/Llama-3.2-1B-Instruct
- Repositorio de TRL: https://github.com/huggingface/trl
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/rezvani-portland-state-university/clarifying-em/runs/rh1qtamg
- Variante relacionada (mainsweep-ctrl-s0-realign): https://huggingface.co/jlsrls/mainsweep-ctrl-s0-realign
- Variante relacionada (mainsweep-ctrl-s1-em): https://huggingface.co/jlsrls/mainsweep-ctrl-s1-em/tree/main
- Perfil del autor en GitHub: https://github.com/jlsrls
