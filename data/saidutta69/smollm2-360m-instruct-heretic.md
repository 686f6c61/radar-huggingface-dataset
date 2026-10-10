# saidutta69/SmolLM2-360M-Instruct-heretic

## Resumen

SmolLM2-360M-Instruct-heretic es una variante "abliterated" (decensored) del modelo HuggingFaceTB/SmolLM2-360M-Instruct, publicada por el usuario saidutta69 y generada con la herramienta Heretic v1.4.0. El proceso de abliteración elimina la dirección de rechazo del modelo mediante ortogonalización de pesos en las proyecciones de atención (`attn.o_proj`) y de la MLP (`mlp.down_proj`), reduciendo la tasa de negativas de 8/100 a 4/100 con una divergencia KL de 0,0154 respecto al modelo original.

Arquitectónicamente es idéntico a SmolLM2-360M: un transformer decoder-only de tipo Llama con 361.821.120 parámetros, entrenado originalmente sobre 4 billones de tokens (FineWeb-Edu, DCLM, The Stack y datasets filtrados propios), con ajuste supervisado (SFT) y DPO sobre UltraFeedback en su versión Instruct. Está diseñado para inferencia en dispositivo (on-device), con un tamaño de repositorio de 0,7 GB y pesos en safetensors y ONNX.

Su relevancia actual es doble: por un lado, forma parte de la familia SmolLM2, referencia en modelos compactos ejecutables en CPU y navegador; por otro, sirve como caso de estudio reproducible de abliteración, ya que el autor publica los parámetros exactos y el procedimiento en el directorio `reproduce` del repositorio. Se distribuye bajo licencia Apache 2.0 y solo soporta inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo Llama (atención causal) |
| Parámetros totales | 361.821.120 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens en la familia SmolLM2 (no explicitado en la model card de esta variante) |
| Tipos de cuantización | safetensors en bf16 (repo de 0,7 GB); ONNX para transformers.js; no se distribuyen GGUF, GPTQ ni AWQ en este repositorio |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |
| Modelo base | HuggingFaceTB/SmolLM2-360M (variante Instruct) |
| Herramienta de abliteración | Heretic v1.4.0 |
| Tamaño del repositorio | 0,7 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-09 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de SmolLM2-360M: un transformer decoder-only con atención causal, tokenizador propio de la familia y diseño orientado a eficiencia en dispositivo. El preentrenamiento original de SmolLM2-360M se realizó sobre 4 billones de tokens combinando FineWeb-Edu, DCLM y The Stack, junto con datasets filtrados por HuggingFace. La versión Instruct se obtuvo mediante SFT sobre una mezcla de datasets públicos y propios (entre ellos `smol-smoltalk`) y posteriormente mediante DPO con UltraFeedback. Según la model card original, el soporte de function calling se limita al modelo de 1.7B, no al de 360M.

Sobre ese checkpoint Instruct, el autor aplicó abliteración con Heretic v1.4.0, un método que calcula una dirección de rechazo y la elimina de los pesos de determinadas proyecciones. Los parámetros exactos publicados son:

| Parámetro de abliteración | Valor |
|---|---|
| direction_index | 27,04 |
| attn.o_proj.max_weight | 1,32 |
| attn.o_proj.max_weight_position | 29,44 |
| attn.o_proj.min_weight | 0,46 |
| attn.o_proj.min_weight_distance | 16,37 |
| mlp.down_proj.max_weight | 1,19 |
| mlp.down_proj.max_weight_position | 30,27 |
| mlp.down_proj.min_weight | 0,22 |
| mlp.down_proj.min_weight_distance | 8,14 |

El autor declara que el proceso es reproducible y documenta el procedimiento en el directorio `reproduce/README.md` del repositorio.

## Capacidades

- Generación de texto conversacional en inglés y seguimiento de instrucciones directas.
- Reescritura de texto y resumen, capacidades heredadas del ajuste SFT del modelo original.
- Razonamiento básico y respuesta a preguntas de conocimiento general, con un techo bajo por su tamaño (35,8 en MMLU en formato cloze sobre el modelo base).
- Razonamiento matemático muy limitado: 3,2 en GSM8K (5-shot) en el modelo base preentrenado.
- Ejecución en navegador mediante ONNX y transformers.js, y en CPU sin GPU.
- Compatibilidad declarada con text-generation-inference y con endpoints compatibles.
- Multilingüismo: no soportado; únicamente inglés.
- Tool calling / function calling: no documentado para la variante de 360M (la model card original lo atribuye solo al modelo de 1.7B).
- Agentes y razonamiento multi-paso: no documentado.
- Visión, audio o modo "thinking": no disponibles.

## Casos de uso

- Generación de texto embebida en el navegador: con los pesos ONNX y transformers.js el modelo se ejecuta íntegramente en el cliente, sin servidor ni coste de API, útil para autocompletado o asistentes en aplicaciones web.
- Asistentes conversacionales en dispositivos edge: con 361M parámetros en bf16 (~0,7 GB) cabe en Raspberry Pi, móviles de gama alta o mini-PC sin GPU, ofreciendo latencia interactiva en local.
- Preprocesado y etiquetado de texto en pipelines de datos: clasificación, extracción de campos y normalización de texto en lotes grandes, donde el coste por token importa más que la precisión máxima.
- Prototipado rápido de aplicaciones de generación: al ser un modelo pequeño, permite iterar sobre prompts y plantillas de chat en segundos y validar el flujo completo antes de escalar a modelos mayores.
- Investigación sobre abliteración y alineación: comparar sistemáticamente las respuestas de esta variante frente a SmolLM2-360M-Instruct permite medir el efecto de la eliminación de la dirección de rechazo sobre el comportamiento y la calidad del texto.
- Filtrado previo en arquitecturas en cascada: usar el modelo como primera etapa para descartar o enrutar consultas antes de invocar un modelo mayor, reduciendo el coste total del sistema.
- Chatbots de dominio restringido en entornos cerrados (intranet, kiosco, hardware aislado) donde no se requiere conexión a servicios externos.
- Generación de texto en entornos con CPU únicamente, como CI/CD, servidores sin GPU o contenedores con presupuesto de memoria reducido.

## Benchmarks y rendimiento

Los siguientes resultados corresponden al modelo base preentrenado SmolLM2-360M, no a la variante abliterada, y provienen de la model card original de HuggingFaceTB. La tabla de evaluación del modelo Instruct aparece truncada en la información disponible.

| Métrica | SmolLM2-360M | Qwen2.5-0.5B | SmolLM-360M |
|---|---|---|---|
| HellaSwag | 54,5 | 51,2 | 51,8 |
| ARC (media) | 53,0 | 45,4 | 50,1 |
| PIQA | 71,7 | 69,9 | 71,6 |
| MMLU (cloze) | 35,8 | 33,7 | 34,4 |
| CommonsenseQA | 38,0 | 31,6 | 35,3 |
| TriviaQA | 16,9 | 4,3 | 9,1 |
| Winogrande | 52,5 | 54,1 | 52,8 |
| OpenBookQA | 37,4 | 37,4 | 37,2 |
| GSM8K (5-shot) | 3,2 | 33,4 | 1,6 |

Métricas específicas del proceso de abliteración, publicadas por el autor:

| Métrica | Este modelo | SmolLM2-360M-Instruct |
|---|---|---|
| Divergencia KL | 0,0154 | 0 (por definición) |
| Negativas (refusals) | 4/100 | 8/100 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para la variante abliterada en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 0,72 GB de pesos, más overhead de activaciones y caché KV (por debajo de 1,5 GB en la práctica).
- VRAM estimada en fp32: aproximadamente 1,45 GB.
- VRAM estimada en int8: aproximadamente 0,36 GB.
- VRAM estimada en int4: aproximadamente 0,18 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente, incluidas RTX 3060, RTX 4060, RTX 4090 o superiores; el modelo no necesita A100 ni H100. También funciona en GPUs integradas y en aceleradores edge.
- Cabe holgadamente en GPU consumer: sí, en cualquier modelo con más de 2 GB de VRAM; también cabe en CPU y en memoria unificada de dispositivos móviles.
- Opciones de despliegue: transformers (PyTorch), text-generation-inference (TGI, etiqueta `endpoints_compatible`), vLLM, llama.cpp y Ollama (requiere convertir o localizar pesos GGUF, no incluidos en este repositorio), transformers.js / ONNX Runtime Web para navegador.
- Latencia y throughput: no se han publicado mediciones para esta variante. A modo orientativo, un modelo de 361M parámetros en bf16 suele ser interactivo en CPU moderna y muy rápido en GPU consumer, pero se trata de una estimación, no de un dato verificado.
- Reproducibilidad: el repositorio incluye el procedimiento y los parámetros de abliteración en `reproduce/README.md`, lo que permite regenerar los pesos a partir del modelo base.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formatos | Notas |
|---|---|---|---|---|---|---|
| SmolLM2-360M-Instruct-heretic (este) | 361.821.120 | 8.192 tokens (familia SmolLM2) | inglés | Apache 2.0 | safetensors, ONNX | Variante abliterada; 4/100 negativas; KL 0,0154 |
| SmolLM2-360M-Instruct | 361.821.120 | 8.192 tokens (familia SmolLM2) | inglés | Apache 2.0 | safetensors, ONNX, GGUF (en el repo oficial de la familia) | Modelo original con alineación intacta; 8/100 negativas |
| Qwen2.5-0.5B-Instruct | ~500 millones | no disponible en la información proporcionada | multilingüe (no confirmado) | Apache 2.0 | safetensors, GGUF | Superior en GSM8K (33,4 en la variante base de 0.5B frente a 3,2 de SmolLM2-360M) |
| SmolLM-360M-Instruct | 360 millones (aproximado) | no disponible en la información proporcionada | inglés | Apache 2.0 | safetensors | Generación anterior de la familia; peor rendimiento general que SmolLM2 |

## Limitaciones y advertencias

- Modelo abliterado: la eliminación de la dirección de rechazo reduce las negativas a 4/100, pero no las elimina por completo. Puede producir contenido inapropiado, ofensivo o dañino ante determinados prompts, por lo que no debería desplegarse en producción dirigida a usuarios sin filtros de entrada y salida adicionales.
- La abliteración no implica ausencia de sesgos: persisten los sesgos presentes en los datos de preentrenamiento de SmolLM2 (FineWeb-Edu, DCLM, The Stack).
- Riesgo elevado de alucinación. Con 361M parámetros, el conocimiento factual es limitado (TriviaQA 16,9 y MMLU cloze 35,8 en el modelo base), y el modelo puede inventar datos con apariencia plausible.
- Razonamiento matemático y lógico muy débil: 3,2 en GSM8K (5-shot) en el modelo base. No es adecuado para tareas aritméticas o de cálculo.
- Limitación idiomática estricta: solo inglés. No hay soporte documentado de castellano ni de otros idiomas.
- Ventana de contexto limitada en comparación con modelos actuales, lo que restringe tareas de resumen o análisis de documentos largos.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia. La responsabilidad legal y ética sobre el contenido generado recae en quien despliega el modelo.
- El repositorio presenta 0 descargas y 0 likes, sin validación por parte de terceros, y las fechas de creación y actualización registradas (2026) resultan incoherentes con las fechas del modelo base.
- No se han publicado evaluaciones de la variante abliterada en benchmarks estándar; solo se documentan divergencia KL y tasa de negativas.
- La model card original indica que el soporte de function calling corresponde al modelo de 1.7B, no a la variante de 360M, por lo que no debe asumirse en integraciones de agentes.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; toda la información procede del repositorio de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/saidutta69/SmolLM2-360M-Instruct-heretic
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M
- Modelo Instruct original: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Heretic: https://heretic-project.org
- Artículo de SmolLM2 (arXiv): https://arxiv.org/abs/2502.02737
- Repositorio de código de SmolLM: https://github.com/huggingface/smollm
- Dataset de SFT `smol-smoltalk`: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset UltraFeedback (DPO): https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized
- Dataset Synth-APIGen-v0.1: https://huggingface.co/datasets/argilla/Synth-APIGen-v0.1
- Alignment Handbook (recetas SmolLM2): https://github.com/huggingface/alignment-handbook/tree/main/recipes/smollm2
- Procedimiento de reproducción: `reproduce/README.md` dentro del repositorio del modelo
