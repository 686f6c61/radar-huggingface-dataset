# qing-yao/ppt-pythia-1b-permuted-seed3407-stage2

## Resumen

`ppt-pythia-1b-permuted-seed3407-stage2` es un modelo de generación de texto de tipo causal LM publicado por el usuario `qing-yao` en HuggingFace. Se trata de un ajuste fino (SFT, *supervised fine-tuning*) realizado con la librería TRL sobre una arquitectura `gpt_neox`, la misma familia que la serie Pythia de EleutherAI. El recuento real de parámetros, extraído de los pesos en safetensors, es de 1.011.781.632, lo que lo sitúa en la franja de los ~1B parámetros. El repositorio ocupa 16,2 GB, un tamano desproporcionado para un modelo de 1B en precision completa, lo que sugiere la presencia de multiples checkpoints o estados de optimizador en el historial.

El nombre del modelo contiene tres pistas relevantes: `pythia-1b` (arquitectura y escala base), `permuted` (indica algún tipo de permutación aplicada, presumiblemente sobre pesos o sobre el orden de las capas) y `seed3407` (referencia a la semilla 3407, popularizada por el artículo «torch.manual_seed(3407) is all you need»). El sufijo `stage2` apunta a un entrenamiento por fases. Ninguna de estas hipótesis está confirmada por el autor en la model card, que es extremadamente escueta.

La relevancia del modelo es limitada y de carácter fundamentalmente experimental: cuenta con 157 descargas, 0 likes, no declara licencia ni idiomas soportados, y la model card indica que es un ajuste fino de `[None]`, es decir, el campo de modelo base quedó vacío. Debe tratarse, por tanto, como un artefacto de investigación reproducible más que como un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (`gpt_neox`), transformer causal decoder-only |
| Parametros totales | 1.011.781.632 (dato real, safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la arquitectura base Pythia-1B emplea 2048 tokens, sin confirmar aquí) |
| Tipos de cuantizacion | no disponible en el repositorio (no se publican pesos GGUF ni GPTQ/AWQ); al ser safetensors en fp32/fp16 admite cuantización posterior con herramientas externas |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin contenido) |
| Formato de pesos | safetensors (repo de 16,2 GB, probablemente con multiples revisiones o estados) |

## Arquitectura y entrenamiento

La arquitectura es `gpt_neox`, un transformer causal decoder-only con *rotary positional embeddings* (RoPE) y activación GeLU, el mismo diseño empleado en la familia Pythia. Dado el recuento de 1,01B parámetros, el modelo base más probable es Pythia-1B (EleutherAI), aunque la model card no lo confirma: el campo `model_name` del README apunta a `[None]`, un defecto de documentación que impide verificar el linaje exacto.

El entrenamiento se realizó mediante SFT con TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.8.0+cu128, Datasets 4.2.0 y Tokenizers 0.22.1. No se especifica el dataset, el número de tokens, la composición de los datos ni si hubo fases de RLHF o DPO. Tampoco se documenta ninguna innovación técnica asociada (atención lineal, decodificación especulativa, MoE, etc.). El carácter `permuted` del nombre sugiere un experimento de permutación de pesos o de módulos, y `stage2` un régimen de entrenamiento en dos etapas, pero no hay evidencia publicada en el repositorio que lo respalde.

## Capacidades

- Generación de texto causal autoregresiva, con el pipeline `text-generation` de Transformers.
- Formato conversacional de un solo turno: el ejemplo oficial de la model card pasa una lista de mensajes con rol `user` y espera `max_new_tokens=128`.
- Ajuste por instrucciones (SFT) sobre un modelo base; se espera cierta capacidad de seguir consignas simples, sin garantía documentada.
- Compatibilidad declarada con Text Generation Inference (tag `text-generation-inference`) y con endpoints gestionados (`endpoints_compatible`).
- No se documenta soporte de *tool calling*, *function calling*, razonamiento multi-paso, agentes, visión, audio ni modo *thinking*.
- Capacidades multilingües: no disponibles; no hay declaración de idiomas.

## Casos de uso

- Reproducción de experimentos de ajuste fino: al estar entrenado con TRL y publicar las versiones exactas del framework, sirve para replicar pipelines de SFT sobre modelos de ~1B en un solo GPU.
- Investigación sobre permutaciones de pesos: si el nombre refleja un experimento de permutación, el modelo puede emplearse como punto de comparación frente a su base sin permutar para medir el impacto en la pérdida y en la generación.
- Estudio de sensibilidad a la semilla: la etiqueta `seed3407` permite analizarlo junto a otras ejecuciones con semillas distintas para evaluar varianza de entrenamiento.
- Despliegue en hardware muy limitado: con ~1B parámetros cabe en GPUs de gama de entrada y en CPU, útil para pruebas de concepto de servidores de inferencia con TGI o vLLM.
- Generación de texto de bajo coste en entornos de desarrollo: prototipado de chatbots simples o de completado de texto donde no se requiere calidad de frontera.
- Docencia y formación: es un ejemplo manejable para explicar el ciclo completo de SFT, serialización en safetensors y publicación en el Hub.
- Destilación o *fine-tuning* posterior: puede servir como punto de partida para ajustes específicos de dominio con presupuesto computacional reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Ni la model card ni los metadatos del repositorio incluyen cifras de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de ningún otro conjunto de evaluación. Tampoco hay comparaciones con el modelo base ni con alternativas.

## Requisitos de hardware

Estimaciones derivadas del recuento real de parámetros (1.011.781.632); no están confirmadas por el autor.

- Pesos en fp32: ~4,05 GB de VRAM.
- Pesos en fp16/bf16: ~2,02 GB de VRAM.
- Pesos en cuantización de 8 bits: ~1,01 GB.
- Pesos en cuantización de 4 bits: ~0,51 GB.
- VRAM total en inferencia (pesos + caché KV + activaciones, contexto corto): aproximadamente 3-4 GB en fp16, ~2 GB en 8 bits y ~1,5 GB en 4 bits.
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más (RTX 3060, RTX 4060, RTX 2070, etc.); con cuantización de 4 bits puede ejecutarse incluso en GPUs de 4 GB.
- GPU profesionales recomendadas: A100, H100, L40S o A10G para servido por lotes; cualquiera de ellas está sobredimensionada para este tamano y permitiría un throughput muy alto con batching.
- Opciones de despliegue: `transformers` (soporte nativo, arquitectura `gpt_neox`), Text Generation Inference (tag oficial), vLLM (soporta `GPTNeoXForCausalLM`), y entornos tipo Ollama o llama.cpp únicamente si se convierte previamente a GGUF, ya que el repositorio no publica pesos en ese formato.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

Los datos de los modelos de referencia son características públicas conocidas de cada proyecto; la columna de este modelo refleja únicamente lo verificado en el repositorio.

| Modelo | Parametros | Contexto | Licencia | Formato de pesos | Disponibilidad |
|---|---|---|---|---|---|
| ppt-pythia-1b-permuted-seed3407-stage2 | 1,01B | no disponible | no disponible | safetensors | HuggingFace, 157 descargas |
| Pythia-1B (EleutherAI) | 1,0B | 2048 tokens | Apache 2.0 | safetensors | ampliamente disponible, con benchmarks publicados |
| TinyLlama-1.1B (TinyLlama project) | 1,1B | 2048 tokens | Apache 2.0 | safetensors, GGUF | muy extendido, con benchmarks publicados |
| Qwen2.5-1.5B (Alibaba) | 1,5B | 32 768 tokens | Apache 2.0 | safetensors, GGUF, GPTQ, AWQ | muy extendido, multilingüe |

Frente a estas alternativas, el modelo aquí descrito no aporta contexto ampliado, ni cuantizaciones listas para usar, ni licencia clara, ni resultados de evaluación. Su interés es exclusivamente experimental.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al derivar presumiblemente de Pythia-1B, heredaría los sesgos de su corpus de entrenamiento (The Pile), pero no hay confirmación del linaje.
- Riesgo de alucinación: alto, como en cualquier modelo de ~1B parámetros sin alineación documentada; no se ha realizado RLHF ni DPO según la información disponible.
- Limitación de contexto: la ventana no está declarada; si se confirma la base Pythia-1B, sería de solo 2048 tokens, insuficiente para conversaciones largas o documentos extensos.
- Idiomas: no declarados. No puede asumirse un rendimiento aceptable en castellano ni en ningún otro idioma concreto.
- Licencia: no disponible. La model card incluye `licence: license` sin texto, lo que impide determinar si el uso comercial está permitido. No debe utilizarse en producción sin aclarar este punto con el autor.
- Documentación incompleta: el campo de modelo base es `[None]`, no se indica el dataset de SFT, ni hiperparámetros, ni número de tokens de entrenamiento.
- Repositorio de 16,2 GB para 1B parámetros: puede contener checkpoints intermedios o estados de optimizador, lo que complica la descarga y la reproducibilidad.
- Adopción mínima: 157 descargas y 0 likes implican ausencia de validación por parte de la comunidad.
- Fechas del repositorio (creación y actualización el 19 de septiembre de 2026) resultan anómalas y conviene verificarlas antes de citarlas.
- Sin garantías de calidad: la ausencia total de benchmarks impide estimar su rendimiento relativo incluso frente a su propio modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qing-yao/ppt-pythia-1b-permuted-seed3407-stage2
- Perfil del autor: https://huggingface.co/qing-yao
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentación de la arquitectura GPT-NeoX en Transformers: https://huggingface.co/docs/transformers/model_doc/gpt_neox
- Paper de la familia Pythia: https://arxiv.org/abs/2304.01373
- Artículo «torch.manual_seed(3407) is all you need»: https://arxiv.org/abs/2109.08203
