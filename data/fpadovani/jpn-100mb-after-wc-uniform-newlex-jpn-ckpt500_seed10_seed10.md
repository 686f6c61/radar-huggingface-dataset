# fpadovani/jpn-100mb-after-wc-uniform-newlex-jpn-ckpt500_seed10_seed10

## Resumen
Este modelo es un ajuste supervisado (SFT) de la familia GPT-2 publicado por el usuario fpadovani, con 124.770.816 parámetros confirmados en los pesos safetensors. Se obtiene por fine-tuning del modelo fpadovani/ppt-wc-uniform-newlex-jpn-100mb_seed10 mediante la librería TRL, y el identificador del repositorio apunta a un experimento controlado sobre japonés (jpn), con un corpus o condición de 100 MB, el checkpoint 500 y la semilla 10.

No se trata de un modelo orientado a producción: acumula 0 descargas y 0 likes, no declara licencia, idiomas ni longitud de contexto, y no publica resultados de benchmarks. Su interés es principalmente documental y de reproducibilidad, dentro de una línea de experimentos de ajuste supervisado con múltiples semillas y checkpoints, tal y como sugiere la nomenclatura.

Por su tamaño (~125 millones de parámetros) es un artefacto ligero, ejecutable en cualquier GPU de consumo e incluso en CPU, lo que lo hace útil como baseline en estudios de ajuste fino, comparaciones antes/después respecto al modelo base y pruebas de infraestructura de despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia GPT-2 (etiqueta `gpt2` en HuggingFace) |
| Parámetros totales | 124.770.816 (dato real de los pesos safetensors) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; solo se publican pesos en safetensors, sin versiones GGUF, GPTQ o AWQ |
| Idiomas soportados | no disponibles; el identificador incluye `jpn`, lo que apunta a japonés, pero no hay declaración oficial |
| Licencia | no disponible; la model card incluye `licence: license` sin especificar términos |
| Formato de pesos | safetensors (librería transformers) |

Otros datos del repositorio: tamaño de 6,0 GB (incluye artefactos de entrenamiento además de los pesos), pipeline `text-generation`, etiquetas `text-generation-inference` y `endpoints_compatible`, y fechas de creación y actualización en septiembre de 2026 según los metadatos.

## Arquitectura y entrenamiento
La arquitectura corresponde a un transformer decoder-only de tipo GPT-2, con 124.770.816 parámetros, entrenado en régimen de ajuste supervisado (SFT) sobre el modelo base fpadovani/ppt-wc-uniform-newlex-jpn-100mb_seed10. El entrenamiento se realizó con TRL 0.23.0, Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1, y el registro del experimento está disponible en un run de Weights & Biases del proyecto `white_cotterell` de la Universidad de Groningen.

No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO (el autor indica únicamente SFT), ni innovaciones técnicas como decodificación especulativa o atención lineal. El nombre del repositorio (`after-wc-uniform-newlex-jpn-ckpt500_seed10_seed10`) sugiere una comparación entre condiciones experimentales y una evaluación de variabilidad entre semillas, pero no hay documentación que lo confirme.

## Capacidades
- Generación de texto autoregresiva mediante `transformers` y la clase `pipeline` de HuggingFace.
- Formato conversacional básico: la model card muestra el uso con una lista de mensajes (`{"role": "user", "content": ...}`), lo que indica un ajuste orientado a instrucciones simples.
- Respuestas a preguntas abiertas en un único turno, con un límite de tokens nuevos configurable (el ejemplo usa `max_new_tokens=128`).
- Inferencia servida: las etiquetas `text-generation-inference` y `endpoints_compatible` indican compatibilidad declarada con TGI y con endpoints de HuggingFace.
- Soporte de tool calling o function calling: no documentado.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no declaradas; el identificador apunta a japonés, sin confirmación oficial.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso
- Baseline en investigación de PLN sobre japonés: sirve como punto de comparación de bajo coste frente a modelos ajustados con más datos, al proceder de una condición experimental concreta (100 MB, checkpoint 500, semilla 10).
- Reproducibilidad de experimentos: permite replicar resultados de ajuste supervisado y medir la varianza entre semillas, ya que el nombre del repositorio codifica explícitamente la semilla y el checkpoint.
- Comparación antes/después del ajuste: al existir el modelo base `ppt-wc-uniform-newlex-jpn-100mb_seed10`, se puede evaluar qué cambia el SFT en términos de pérdida, perplejidad y estilo de generación.
- Pruebas de infraestructura de despliegue: con ~125 millones de parámetros cabe en cualquier GPU y permite validar pipelines de TGI, endpoints compatibles o vLLM sin consumir recursos significativos.
- Docencia y talleres de fine-tuning: es un ejemplo manejable para enseñar el flujo de TRL y SFT (carga de modelo base, formateo de mensajes, entrenamiento y evaluación) en una sola GPU.
- Generación de datos sintéticos de prueba: útil para rellenar entornos de desarrollo con texto ficticio antes de conectar un modelo de producción, siempre que no se requiera calidad lingüística alta.
- Evaluación de olvido catastrófico: al derivar de un modelo base con nombre similar, facilita medir la degradación en tareas no incluidas en el conjunto de ajuste.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para los pesos: en fp32, aproximadamente 0,5 GB; en fp16 o bf16, en torno a 0,25 GB; en int8, unos 0,125 GB; en int4, unos 0,07 GB.
- VRAM total recomendada: 2 GB o más, incluyendo caché KV y activaciones, dado el tamaño reducido del modelo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090); también A100 o H100 para despliegues por lotes, aunque están sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier modelo con 4 GB o más, y es viable ejecutarlo en CPU para pruebas.
- Opciones de despliegue: `transformers` con `pipeline`, Text Generation Inference (etiqueta declarada), endpoints compatibles de HuggingFace y vLLM. Para llama.cpp u Ollama haría falta una conversión a GGUF que no se publica en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones. El repositorio ocupa 6,0 GB, muy por encima de los pesos, por lo que conviene descargar solo los archivos safetensors necesarios para inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| fpadovani/jpn-100mb-after-wc-uniform-newlex-jpn-ckpt500_seed10_seed10 | 124,77 M | no disponible | no disponible | 0 descargas, 0 likes; artefacto de investigación |
| openai-community/gpt2 (GPT-2 small) | 124 M | 1024 tokens | modified MIT | Muy amplia, referencia de la familia |
| distilgpt2 | 82 M | 1024 tokens | Apache 2.0 | Amplia |
| SmolLM-135M (HuggingFaceTB) | 135 M | 2048 tokens | Apache 2.0 | Amplia, orientado a despliegue ligero |

La comparación de rendimiento no es posible: este modelo no publica resultados de MMLU, HumanEval, GSM8K ni de tareas en japonés, mientras que las alternativas cuentan con evaluaciones publicadas en sus respectivas model cards.

## Limitaciones y advertencias
- Artefacto de investigación sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta.
- Licencia no especificada: existe incertidumbre legal sobre el uso comercial, la redistribución y el uso derivado; conviene contactar con el autor antes de cualquier despliegue productivo.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad de generación, razonamiento, matemáticas ni código.
- Sesgos no evaluados: al no documentarse la composición del dataset de ajuste, no se pueden estimar sesgos de género, etnia, religión o contenido ofensivo.
- Riesgo elevado de alucinación: con ~125 millones de parámetros, la coherencia en respuestas largas y la fidelidad factual son limitadas por capacidad del modelo.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en conversaciones multi-turno largas ni en documentos extensos.
- Idiomas no declarados: aunque el identificador apunta a japonés, no hay confirmación oficial, por lo que no se debe asumir cobertura multilingüe.
- Plantilla de chat no documentada: la model card usa una lista de mensajes, pero no se especifica el chat template exacto, lo que puede provocar resultados inconsistentes si se integra en un pipeline conversacional.
- Tamaño del repositorio: 6,0 GB, muy superior al de los pesos, indica presencia de checkpoints u otros artefactos que conviene descargar de forma selectiva.
- Modelo base dependiente: su comportamiento hereda las limitaciones del modelo `fpadovani/ppt-wc-uniform-newlex-jpn-100mb_seed10`, también sin documentación pública detallada.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/fpadovani/jpn-100mb-after-wc-uniform-newlex-jpn-ckpt500_seed10_seed10
- Modelo base: https://huggingface.co/fpadovani/ppt-wc-uniform-newlex-jpn-100mb_seed10
- Repositorio de TRL: https://github.com/huggingface/trl
- Registro del entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/xs6c5279
- Cita de TRL (von Werra et al., 2020): repositorio GitHub, https://github.com/huggingface/trl
- Búsqueda web: los resultados obtenidos tratan sobre tipos de instalación de aerotermia y no guardan relación con este modelo, por lo que no se incluye ningún enlace adicional.
