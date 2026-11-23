# francesca9805/swa-100mb-after-wc-uniform-newlex-after-ckpt500-packed-bfdiso_seed3407

## Resumen

`swa-100mb-after-wc-uniform-newlex-after-ckpt500-packed-bfdiso_seed3407` es un modelo de lenguaje de tipo GPT-2 publicado por el usuario `francesca9805` en Hugging Face. Se trata de un fine-tuning mediante SFT (supervised fine-tuning) con la librería TRL sobre el modelo base `francesca9805/ppt-wc-uniform-newlex-swa-after-100mb-packed-bfdiso_seed3407`, que a su vez parece formar parte de una cadena de experimentos de preentrenamiento de pequeño tamaño (el nombre sugiere un corpus de aproximadamente 100 MB). El modelo tiene 124.770.816 parámetros, un tamaño característico de la familia GPT-2 small.

El interés de esta ficha es limitado desde el punto de vista de producción: se trata de un artefacto de investigación con documentación mínima, sin licencia declarada, sin idiomas especificados y sin resultados de benchmarks publicados. No obstante, su reducido tamaño lo hace ejecutable en hardware muy modesto, lo que puede resultar útil para experimentos académicos, pruebas de pipelines de fine-tuning con TRL o estudios de tokenización (el nombre del proyecto en Weights & Biases es `new-tokenizers`).

La model card es la generada automáticamente por TRL e incluye únicamente un ejemplo de uso con `pipeline`, la referencia al run de Weights & Biases y las versiones de framework empleadas. No hay información sobre el dataset de SFT, la composición del corpus de preentrenamiento ni las métricas de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), según el tag `gpt2` |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización estándar de transformers/GGUF vía conversión, no documentada por el autor) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica `licence: license`, sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a GPT-2, un transformer decoder-only con atención causal completa. Con 124,7 millones de parámetros, el tamaño encaja con la variante GPT-2 small, aunque no se especifica la configuración exacta de capas, cabezas de atención ni dimensión oculta. El modelo se ha obtenido por SFT sobre el checkpoint `ppt-wc-uniform-newlex-swa-after-100mb-packed-bfdiso_seed3407`, que a su vez deriva de un preentrenamiento sobre un corpus empaquetado de unos 100 MB (según el nombre) y con un tokenizador nuevo (el proyecto de W&B se llama `new-tokenizers`). El sufijo `swa` sugiere el uso de Stochastic Weight Averaging durante el entrenamiento previo.

El fine-tuning se realizó con TRL 0.23.0, Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. No se documenta el número de tokens de SFT, la composición del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se describe ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.). El run de entrenamiento está disponible en Weights & Biases bajo el proyecto `f-padovani-university-of-groningen/new-tokenizers`, lo que sitúa el trabajo en un contexto académico (Universidad de Groningen).

## Capacidades

- Generación de texto autoregresiva con `transformers` y compatibilidad con Text Generation Inference (tag `text-generation-inference`).
- Formato de chat: la model card muestra el uso con una lista de mensajes `{"role": "user", "content": ...}`, lo que indica que el tokenizador o la plantilla admiten estructura conversacional.
- Fine-tuning orientado a instrucciones mediante SFT (tag `sft`).
- No hay evidencia documentada de soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidades multilingües: no disponibles; el modelo se entrenó con un tokenizador propio (`new-tokenizers`) cuya cobertura lingüística no se especifica.
- Capacidad de código y matemáticas: no documentada.

## Casos de uso

- Experimentación académica con tokenizadores: el modelo pertenece a un proyecto centrado en tokenizadores nuevos, por lo que sirve para comparar el comportamiento de distintas tokenizaciones sobre un mismo corpus pequeño.
- Pruebas de pipelines de SFT con TRL: al ser un artefacto generado por TRL, es útil como referencia para validar configuraciones de entrenamiento, versiones de framework y flujos de publicación en el Hub.
- Generación de texto en entornos con recursos mínimos: con 124,7 M de parámetros cabe en CPU y en GPUs de gama baja, lo que permite desplegar demos o tests de integración sin infraestructura dedicada.
- Evaluación de calidad de checkpoints intermedios: el nombre (`after-ckpt500`) sugiere que es un punto de control tras 500 pasos, útil para estudiar la evolución del entrenamiento en proyectos de investigación.
- Reproducción de experimentos: el enlace al run de W&B y las versiones de framework permiten replicar el entrenamiento en un entorno controlado.
- Base para fine-tuning posterior en dominios muy acotados: su tamaño reducido y su licencia indefinida (a verificar) lo hacen manejable para prototipos internos, siempre que se asuma el riesgo de calidad limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB (124,7 M parámetros × 4 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en fp16/bf16: aproximadamente 0,25 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,13 GB; en 4 bits: aproximadamente 0,07 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100, aunque estas últimas están sobredimensionadas para el modelo.
- Cabe en GPU de consumo y también en CPU; es viable en entornos sin GPU para inferencia de baja concurrencia.
- Opciones de despliegue: `transformers` (pipeline), Text Generation Inference (tag `text-generation-inference`), y previsiblemente llama.cpp/Ollama tras conversión a GGUF (no documentada por el autor).
- Latencia y throughput: no disponibles; por el tamaño, se espera un throughput alto en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `francesca9805/swa-100mb-after-wc-uniform-newlex-after-ckpt500-packed-bfdiso_seed3407` | 124,7 M | no disponible | no disponible | Hugging Face |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | MIT | Hugging Face, OpenAI |
| DistilGPT-2 | 82 M | 1024 tokens | Apache 2.0 | Hugging Face |
| TinyLlama-1.1B | 1,1 B | 2048 tokens | Apache 2.0 | Hugging Face |

La comparación con GPT-2 small es la más directa por tamaño, pero no hay datos de rendimiento del modelo de `francesca9805` que permitan establecer una comparación cuantitativa. Frente a TinyLlama, el modelo aquí descrito es un orden de magnitud menor y carece de documentación sobre calidad. La licencia del modelo analizado no está declarada, lo que lo sitúa en desventaja frente a alternativas con licencias permisivas para uso comercial.

## Limitaciones y advertencias

- Documentación mínima: la model card es la plantilla automática de TRL; no hay información sobre dataset, hiperparámetros de SFT, evaluación ni sesgos.
- Licencia no declarada: la model card indica `licence: license` sin especificar términos, lo que impide determinar si el uso comercial está permitido. No debe usarse en producción sin aclarar este punto con el autor.
- Idiomas no especificados: no se puede garantizar un comportamiento correcto en castellano ni en ningún otro idioma concreto.
- Riesgo elevado de alucinación y de texto incoherente: con 124,7 M de parámetros y un corpus de preentrenamiento de unos 100 MB, la capacidad factual y de razonamiento es muy limitada en comparación con modelos actuales.
- Contexto no documentado: se desconoce la longitud máxima de secuencia soportada, lo que complica el diseño de aplicaciones con contexto largo.
- Sin benchmarks: no hay evidencia publicada de calidad, por lo que cualquier evaluación debe realizarla el propio usuario.
- Naturaleza experimental: el nombre del checkpoint (`after-ckpt500`) sugiere un punto intermedio de entrenamiento, no necesariamente el mejor modelo de la serie.
- Sin soporte documentado de tool calling, agentes ni multimodalidad: no es adecuado para flujos agénticos ni para tareas que requieran esas capacidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/francesca9805/swa-100mb-after-wc-uniform-newlex-after-ckpt500-packed-bfdiso_seed3407
- Modelo base: https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-swa-after-100mb-packed-bfdiso_seed3407
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/2wmy0a41
- Repositorio de TRL: https://github.com/huggingface/trl
- Paper de TRL (cita incluida en la model card): von Werra et al., 2020, GitHub repository
