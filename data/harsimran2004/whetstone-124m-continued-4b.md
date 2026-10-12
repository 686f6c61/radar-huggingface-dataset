# harsimran2004/whetstone-124m-continued-4b

` in vocab but model is not instruction-tuned.

Note: the model card's context indicates the release checkpoint is step-00007632.

Let me write the ficha.

For hardware requirements, I need to estimate. 123.7M parameters. Float32 → ~495 MB. bf16 → ~247 MB. int8 → ~124 MB. int4 → ~62 MB. So it fits easily on consumer GPUs, even CPU. But the model card only offers float32 safetensors. I should note that GGUF isn't provided but conversion is possible.

For benchmarks I have the zero-shot table.

Let me write it. I'll be careful not to invent numbers. For hardware, I can estimate based on parameter count - that's reasonable math, but I should be clear it's an estimation.

Let me draft.

Note on dates: created 2026-10-12. Weird future date but I'll just report it or omit.

Let me write the ficha.## Resumen

Whetstone-124M Continued Pretraining (4B) es un modelo de lenguaje base de 123.694.080 parámetros desarrollado por el usuario harsimran2004. Se ha creado mediante preentrenamiento continuado (continued pretraining) del checkpoint Whetstone-124M-Base, del que hereda arquitectura y tokenizador sin modificaciones. Es un predictor de siguiente token sin ajuste por instrucciones ni alineamiento de seguridad, pensado exclusivamente para investigación sobre preentrenamiento de modelos pequeños y para experimentos de ajuste fino.

Arquitectónicamente es un transformer decoder-only estándar compatible con `LlamaForCausalLM`: pre-norm con RMSNorm, activación SwiGLU, RoPE con theta 10.000, sin biases y con embeddings atados. Tiene 14 capas, ancho de 768, 12 cabezas de atención (head dim 64, atención multi-cabeza completa) y una capa MLP con hidden size de 2.048. La ventana de contexto es de 2.048 tokens y el vocabulario es de 32.007 entradas (32.000 BPE byte-level más siete tokens especiales).

Su relevancia radica en ser un caso documentado de preentrenamiento continuado sobre un corpus de mezcla controlada (4.000 millones de tokens adicionales sobre los 2.500 millones del baseline), con evaluación de pérdida y benchmarks zero-shot publicados, análisis de descontaminación y evidencia de receta de entrenamiento empaquetada en el repositorio. Se publica bajo licencia Apache-2.0 con pesos en float32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`LlamaForCausalLM`): pre-norm RMSNorm, SwiGLU, RoPE, sin biases, embeddings atados |
| Parametros totales | 123.694.080 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible en el repositorio; pesos publicados en float32 (cuantizable a bf16/int8/int4 con herramientas externas) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, float32) |
| Capas / ancho / cabezas | 14 / 768 / 12 (head dim 64, MHA completa) |
| Tamano MLP | 2.048 |
| RoPE theta | 10.000 |
| Vocabulario | 32.007 (32.000 BPE byte-level + `<bos>` 32000, `<eos>` 32001, `<pad>` 32002, `<|im_start|>` 32003, `<|im_end|>` 32004, `<think>` 32005, `</think>` 32006) |
| Checkpoint de publicacion | `step-00007632` |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con decodificacion autorregresiva estandar. Emplea normalizacion pre-norm basada en RMSNorm, activacion SwiGLU en la MLP, embeddings posicionales rotatorios (RoPE) con theta de 10.000 y atención multi-cabeza completa con dimension de cabeza de 64. Los embeddings de entrada y la cabeza de salida estan atados. No requiere `trust_remote_code`, ya que la implementacion es la de `LlamaForCausalLM` en la libreria `transformers`.

El entrenamiento partio del baseline Whetstone-124M-Base (preentrenado con 2.500 millones de tokens) y anadio 4.000 millones de tokens adicionales desde un corpus empaquetado de 4.130 millones, arrancando desde el paso 4.750 del baseline. La mezcla de continuacion fue: FineWeb-Edu al 55%, github-code-clean al 20% (solo subset permisivo: MIT, Apache-2.0, BSD, ISC, CC0 o Unlicense), OpenWebMath al 15% y FinePDFs-edu al 10%. Los documentos nuevos se deduplicaron tanto contra el corpus original como dentro del nuevo. La separacion entre documentos se hizo con `<eos>` (id 32001) y no se uso `<bos>` durante el entrenamiento.

La receta tecnica utilizo AdamW (betas 0,9 y 0,95; weight decay 0,1; gradient clipping 1,0), precision mixta bf16, batch de 524.288 tokens y una unica GPU A100 spot. El learning rate calento durante 200 pasos hasta 3e-4 y decayó de forma coseno hasta 3e-5. El run se interrumpio por disco lleno cerca del paso 5.090, se reanudo desde el paso 5.088 y finalizo en el paso 7.632. No hubo RLHF, DPO ni ningun tipo de alineamiento posterior. El entrenamiento no incluyo StarCoderData y el filtro permisivo de codigo se aplico en tiempo de construccion, por lo que los registros finales no conservan el campo de licencia por fichero.

## Capacidades

- Generacion de texto autoregresiva: continuacion de documentos, texto web, articulos educativos y texto tecnico derivado de PDF.
- Generacion de codigo: el 20% del corpus de continuacion proviene de codigo con licencias permisivas, por lo que el modelo puede producir fragmentos de codigo, aunque sin garantia de correccion.
- Razonamiento matematico basico a nivel de texto: el 15% de OpenWebMath aporta texto matematico web, orientado a continuacion mas que a resolucion fiable de problemas.
- Modelado de lenguaje general en ingles: util como base para fine-tuning supervisado o para experimentos de destilacion.
- No dispone de soporte de tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso.
- No es multilingue: solo ingles.
- No dispone de modo de razonamiento (thinking) operativo: aunque el vocabulario incluye los tokens `<think>` y `</think>`, el modelo no ha sido entrenado para usarlos de forma funcional.
- No tiene capacidades de vision, audio ni multimodalidad.

## Casos de uso

- Investigacion sobre preentrenamiento de modelos pequenos: el modelo sirve como punto de comparacion reproducible frente a baselines como GPT-2 124M o SmolLM-135M, y permite estudiar el efecto del continued pretraining sobre la perdida y los benchmarks.
- Experimentos de ajuste fino supervisado: al ser un modelo base sin alineamiento, es un candidato limpio para aplicar SFT y medir como cambian las capacidades sin interferencia de sesgos heredados de un postentrenamiento previo.
- Estudio de mezclas de datos: la receta publicada (FineWeb-Edu, codigo permisivo, OpenWebMath y PDFs tecnicos) permite replicar o modificar proporciones y observar el impacto sobre dominios concretos medidos por perdida.
- Prototipado de completado de texto editorial o educativo: con 2.048 tokens de contexto puede continuar parrafos de documentacion tecnica o material didactico, siempre bajo revision humana.
- Base para destilacion o para entrenar modelos auxiliares: su tamano reducido y su licencia Apache-2.0 lo hacen adecuado como teacher o student en pipelines de destilacion de bajo coste.
- Investigacion sobre descontaminacion y evaluacion: el repositorio incluye evidencia de solapamiento verbatim con conjuntos de test, lo que lo convierte en un caso practico para estudiar metodologias de deteccion de contaminacion en benchmarks.
- Experimentos academicos de generacion de codigo en entornos controlados: dado que el subset de codigo es permisivo, puede usarse para estudiar completado de funciones simples, sin emplearlo en produccion real sin validacion.

## Benchmarks y rendimiento

Perdida de validacion en nats/token (menor es mejor), segun los datos publicados en la model card:

| Medida | Baseline | Continued |
|---|---:|---:|
| Held-out original | 1,6629 | 1,6198 |
| Held-out nueva mezcla | 1,8141 | 1,6917 |
| FineWeb-Edu | 1,963 | 1,846 |
| Code | 1,225 | 1,131 |
| OpenWebMath | 2,030 | 1,902 |
| Technical PDFs | 1,893 | 1,708 |

Resultados zero-shot (probabilidad logaritmica de las terminaciones de respuesta):

| Modelo | HellaSwag | ARC-Easy | ARC-Challenge | PIQA | Media |
|---|---:|---:|---:|---:|---:|
| Whetstone-124M baseline | 29,3 | 44,0 | 24,3 | 59,8 | 39,4 |
| Whetstone-124M continued | 30,6 | 49,0 | 24,5 | 60,0 | 41,0 |
| GPT-2 124M | 31,4 | 43,9 | 22,8 | 63,1 | 40,3 |

Los errores estandar reportados son de aproximadamente 0,4 / 1,0 / 1,2 / 1,1 puntos respectivamente. El modelo quedaria 9,5 puntos por debajo de SmolLM-135M en la media de esas cuatro tareas. No se han publicado benchmarks de codigo ni de conocimiento/QA.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en float32 ocupan aproximadamente 0,5 GB. En bf16 serian unos 0,25 GB y en int4 alrededor de 0,06 GB, mas el overhead de activaciones y cache KV, que es despreciable dado el contexto de 2.048 tokens.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB libres basta para inferencia en bf16 o cuantizada; A100, H100, RTX 4090, RTX 3090 y GPUs de gama media son mas que suficientes. El propio entrenamiento se ejecuto en una unica A100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en GPUs integradas o en CPU, dado el tamano reducido.
- Opciones de despliegue: `transformers` de forma nativa, Text Generation Inference (TGI, indicado en los tags), `llama.cpp` u Ollama tras convertir a GGUF (no se ofrece GGUF en el repositorio), y cualquier runtime que soporte `LlamaForCausalLM`.
- Latencia y throughput estimados: no disponible. No se proporcionan mediciones de latencia ni de tokens por segundo.
- Nota sobre formato: el repositorio solo incluye pesos en float32, por lo que para despliegues con cuantizacion habria que convertir los pesos manualmente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media 4 tareas | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| Whetstone-124M continued | 123.694.080 | 2.048 | 41,0 | Apache-2.0 | HuggingFace |
| Whetstone-124M baseline | ~123,7 M | 2.048 | 39,4 | Apache-2.0 | checkpoint previo |
| GPT-2 124M | ~124 M | 1.024 | 40,3 | MIT | OpenAI / HuggingFace |
| SmolLM-135M | 135 M | 2.048 | no disponible en esta ficha (se cita una ventaja de 9,5 puntos sobre Whetstone) | Apache-2.0 | HuggingFace |

La comparacion directa solo puede hacerse sobre las cuatro tareas zero-shot publicadas. No hay datos comparables de conocimiento, codigo o QA en la informacion disponible.

## Limitaciones y advertencias

- No ha recibido ajuste por instrucciones ni alineamiento de seguridad: no esta pensado para chat ni para responder preguntas factuales.
- Riesgo elevado de alucinacion: puede producir texto fluido pero falso y codigo incorrecto sin ninguna senal de incertidumbre.
- Es un modelo exclusivamente en ingles y de dominio web, por lo que su comportamiento fuera de ese registro sera pobre.
- Contexto limitado a 2.048 tokens, corto para tareas de razonamiento de contexto largo o documentos extensos.
- Entrenamiento con una unica semilla y un unico run: las diferencias cercanas al error estandar reportado son inciertas y no deben interpretarse como mejoras solidas.
- Sin benchmarks de codigo ni de conocimiento/QA: el rendimiento fuera de las cuatro tareas publicadas es desconocido.
- Contaminacion verbatim detectada: solapamiento de 13 palabras con conjuntos de test en 0,4% de HellaSwag y ARC-Easy, 0,5% de PIQA y 6,7% de ARC-Challenge (78 items, todos procedentes de una pagina de OpenWebMath que muestra el preview del dataset `ai2_arc`). La eliminacion de esos items no cambia las ganancias en mas de 0,1 puntos. La deteccion solo cubre solapamiento verbatim, no parafrasis, traducciones ni claves de respuesta en otros lugares.
- Limitaciones de datos y licencia: no se uso StarCoderData y, aunque el filtro de codigo se limito a licencias permisivas (MIT, Apache-2.0, BSD, ISC, CC0, Unlicense), las licencias por fichero no se conservan en los registros finales, por lo que no pueden auditarse a posteriori. El texto derivado de PDF es ODC-By, pero los documentos subyacentes mantienen su propio copyright.
- Aunque la licencia de los pesos es Apache-2.0, esas incertidumbres sobre la procedencia de parte de los datos deben tenerse en cuenta antes de un uso comercial.
- Para produccion: no recomendado sin ajuste fino especifico y validacion exhaustiva; el propio autor lo destina a investigacion y experimentacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/harsimran2004/whetstone-124m-continued-4b
- `training_config.json` (receta de entrenamiento saneada), dentro del repositorio del modelo.
- `training_metrics.json` (metricas del run deduplicadas), dentro del repositorio del modelo.
- `evaluation.json` (evidencia de evaluacion y descontaminacion), dentro del repositorio del modelo.
- Figura de curvas de perdida: `figures/loss_curves.png`, dentro del repositorio del modelo.
- Figura de benchmarks: `figures/benchmarks.png`, dentro del repositorio del modelo.
