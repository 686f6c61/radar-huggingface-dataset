# francesca9805/urd-arab-10mb-ppt-Dp-10mb-packed-bfdiso_seed10

## Resumen

El modelo `francesca9805/urd-arab-10mb-ppt-Dp-10mb-packed-bfdiso_seed10` es un ajuste fino (fine-tuning) supervisado del modelo base `goldfish-models/urd_arab_10mb`, un modelo monolingüe de la familia Goldfish orientado al urdu en escritura árabe. Lo publica el usuario francesca9805 y se ha entrenado con la librería TRL de Hugging Face mediante SFT (Supervised Fine-Tuning, ajuste fino supervisado). Se trata de un experimento académico de pequeño tamaño: 38.038.528 parámetros (unos 38 millones) y un repositorio de apenas 0,1 GB.

La relevancia de este modelo es limitada y muy específica. No es un modelo de propósito general ni compite con los grandes modelos comerciales: es una variante experimental de un modelo monolingüe de bajos recursos, probablemente creada para estudiar el efecto del ajuste fino sobre representaciones lingüísticas de un idioma con poca cobertura (urdu). Por su arquitectura tipo GPT-2 y su reducido tamaño, encaja en escenarios de investigación, prototipado y pruebas de infraestructura más que en aplicaciones de producción reales.

No se dispone de información pública sobre el dataset de ajuste (más allá del nombre del repositorio, que sugiere un corpus empaquetado de 10 MB con tokens especiales "iso"), ni sobre licencia, idiomas soportados o longitud de contexto. La model card es una plantilla autogenerada por TRL y no aporta detalles técnicos adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (etiqueta `gpt2` en Hugging Face) |
| Parametros totales | 38.038.528 (dato real de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (compatible con cuantización estándar de transformers: fp16, int8, int4 mediante bitsandbytes o GGUF) |
| Idiomas soportados | no disponible; el nombre del modelo base (`urd_arab`) sugiere urdu en escritura árabe |
| Licencia | no disponible (la model card indica `licence: license`, sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only con la configuración GPT-2, tal como indica la etiqueta `gpt2` del repositorio. El modelo base `goldfish-models/urd_arab_10mb` pertenece a la familia Goldfish, un conjunto de modelos monolingües entrenados por separado para distintos idiomas y escrituras; en este caso, urdu en alfabeto árabe, con aproximadamente 10 MB de texto de entrenamiento. Con 38 millones de parámetros, se sitúa por debajo de GPT-2 small (124 M) y en el rango de modelos tipo DistilGPT-2 reducidos.

El ajuste se realizó con TRL 0.23.0 sobre Transformers 4.56.2, PyTorch 2.5.1+cu121 y Datasets 4.8.4, mediante SFT. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas posteriores de RLHF o DPO. El nombre del repositorio (`ppt-Dp-10mb-packed-bfdiso_seed10`) apunta a un experimento con corpus empaquetado ("packed"), probablemente con tokens especiales de separación ("iso"), y una semilla concreta (`seed10`), lo que sugiere que forma parte de una batería de ejecuciones comparables. No hay información publicada sobre innovaciones técnicas adicionales.

## Capacidades

- Generación de texto autoregresiva básica, limitada por el tamaño del modelo (38 M) y por su preentrenamiento monolingüe.
- Continuación y finalización de texto en el idioma del modelo base (urdu en escritura árabe), presumiblemente.
- Formato conversacional de un solo turno: el ejemplo de la model card usa `pipeline` con un mensaje con rol `user`, pero no hay evidencia de un ajuste de diálogo robusto.
- No hay datos que confirmen soporte de tool calling, function calling ni uso como agente.
- No hay datos que confirmen razonamiento multi-paso, matemáticas, código ni visión.
- Capacidades multilingües: no disponibles; el modelo base es monolingüe.
- Capacidades especiales (modo pensamiento, audio, imagen): no disponibles.

## Casos de uso

- Investigación lingüística sobre urdu: análisis de representaciones internas y del efecto del ajuste fino SFT sobre un modelo monolingüe de bajos recursos, comparándolo con otras semillas de la misma serie.
- Reproducibilidad de experimentos de ajuste fino: sirve como referencia concreta de una ejecución TRL con semilla fija (`seed10`) frente a otras variantes publicadas del mismo autor.
- Pruebas de infraestructura de despliegue: por su tamaño (0,1 GB), es útil para validar pipelines de Text Generation Inference, vLLM o Hugging Face Endpoints antes de pasar a modelos mayores.
- Docencia y prototipado: ejemplo didáctico de ajuste fino con TRL, carga con `transformers.pipeline` y publicación en el Hub.
- Generación de texto experimental en urdu: creación de borradores o continuaciones de texto en dicho idioma, siempre con revisión humana dada la calidad previsible de un modelo de 38 M.
- Benchmarking interno de latencia: medición de throughput de infraestructura con un modelo mínimo, útil para calibrar costes por token en servidores propios.
- Pruebas de cuantización: validar flujos int8/int4/GGUF sobre un modelo pequeño antes de aplicarlos a modelos grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación, y el repositorio tampoco documenta resultados de validación.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: unos 152 MB solo para pesos; en fp16, unos 76 MB; en int8, unos 38 MB; en int4, unos 19 MB. Con overhead de activaciones y caché KV, en la práctica menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM, desde una GTX 1050 Ti o superior. Modelos como A100, H100 o RTX 4090 son enormemente sobredimensionados para este modelo.
- Cabe holgadamente en cualquier GPU de consumo e incluso en CPU y en dispositivos integrados.
- Opciones de despliegue: `transformers` (pipeline nativo), Text Generation Inference (el repo está etiquetado como `text-generation-inference` y `endpoints_compatible`), vLLM, llama.cpp/Ollama (si se convierte a GGUF, no publicado).
- Latencia y throughput: no disponibles. Por el tamaño, se espera latencia muy baja (del orden de milisegundos por token en GPU moderna), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `francesca9805/urd-arab-10mb-ppt-Dp-10mb-packed-bfdiso_seed10` | 38 M | no disponible | no disponible | Hugging Face |
| `goldfish-models/urd_arab_10mb` (base) | no disponible | no disponible | no disponible | Hugging Face |
| `francesca9805/urd-arab-10mb-ppt-Dp-10mb-packed-bfd_seed10` (variante hermana) | no disponible | no disponible | no disponible | Hugging Face |
| `francesca9805/urd-arab-10mb-ppt-Dp-10mb-packed-bfd_seed3407` (variante hermana) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos suficientes para comparar rendimiento con alternativas de la misma categoría. Las variantes listadas son del mismo autor y misma familia de experimentos, diferenciadas por semilla o por configuración de datos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; un modelo entrenado con 10 MB de texto probablemente hereda sesgos del corpus, pero no hay análisis publicado.
- Riesgo de alucinación: elevado. Con 38 M de parámetros, la coherencia a medio plazo es limitada y las respuestas pueden ser factualmente incorrectas o incoherentes.
- Limitaciones de contexto e idioma: no se especifica la ventana de contexto; el modelo base es monolingüe (urdu en escritura árabe), por lo que no se espera buen rendimiento en castellano ni en otros idiomas.
- Licencia: no disponible. La model card indica `licence: license` sin concreción, lo que impide confirmar si se permite uso comercial. Se debe contactar con el autor antes de cualquier uso en producción.
- Caveat de producción: es un experimento con 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- El ajuste SFT sobre un corpus no documentado y el nombre del repositorio (con tokens "iso" y empaquetado) sugieren un experimento de investigación, no un modelo listo para uso final.
- El ejemplo de la model card usa un mensaje conversacional, pero no hay garantía de que el modelo esté realmente ajustado para diálogo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/francesca9805/urd-arab-10mb-ppt-Dp-10mb-packed-bfdiso_seed10
- Modelo base: https://huggingface.co/goldfish-models/urd_arab_10mb
- Variante hermana (Dp-100mb, seed10): https://huggingface.co/francesca9805/urd-arab-10mb-ppt-Dp-100mb-packed-bfd_seed10
- Variante hermana (Dp-100mb, seed455): https://huggingface.co/francesca9805/urd-arab-10mb-ppt-Dp-100mb-packed-bfd_seed455
- Variante hermana (Dp-10mb, seed3407): https://huggingface.co/francesca9805/urd-arab-10mb-ppt-Dp-10mb-packed-bfd_seed3407
- Ficha en FriendliAI: https://friendli.ai/models/francesca9805/urd-arab-10mb-ppt-Dp-10mb-packed-bfd_seed10
- Ficha en Free2AITools: https://free2aitools.com/model/francesca9805/urd-arab-10mb-ppt-dp-10mb-packed-bfd_seed10
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/kxth8v7h
- Repositorio TRL: https://github.com/huggingface/trl
