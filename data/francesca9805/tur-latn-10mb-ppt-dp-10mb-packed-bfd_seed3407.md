# francesca9805/tur-latn-10mb-ppt-Dp-10mb-packed-bfd_seed3407

## Resumen

Este modelo es un ajuste fino (fine-tuning) del checkpoint monolingüe `goldfish-models/tur_latn_10mb`, publicado por el usuario de HuggingFace `francesca9805`. Se trata de un modelo pequeño, con 39.087.104 parámetros totales declarados en los pesos safetensors, construido sobre la arquitectura GPT-2 (transformer decoder-only causal) y entrenado mediante SFT (supervised fine-tuning) con la librería TRL. El identificador del repositorio sugiere un experimento de investigación sobre tokenizadores y preentrenamiento en un corpus de 10 MB, con una semilla fija (3407), más que un modelo destinado a producción.

El problema que aborda es acotado: disponer de un modelo generativo en turco (escritura latina) de tamaño mínimo, útil para experimentar con pipelines de ajuste supervisado, comparar tokenizadores o servir como punto de partida para tareas posteriores. No es un modelo de propósito general ni compite con los modelos multilingües actuales; su interés es metodológico y reproducible.

La relevancia actual es limitada y debe enmarcarse con honestidad: el repositorio no tiene descargas ni "likes" en el momento de redactar esta ficha, no publica resultados de benchmarks y su model card no documenta el conjunto de datos de entrenamiento, el número de tokens vistos ni el régimen de licencia. Cualquier evaluación seria de su calidad exige ejecutarlo y medirlo por cuenta propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only causal, denso), según la etiqueta `gpt2` del repositorio |
| Parametros totales | 39.087.104 (dato real de los pesos safetensors) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible (no se especifica en la model card ni en los metadatos) |
| Tipos de cuantizacion | No disponible en el repositorio; solo se distribuyen pesos en safetensors. Al ser un modelo de 39 M de parámetros es viable convertirlo a GGUF, ONNX o int8/int4, pero no hay artefactos publicados |
| Idiomas soportados | No disponible en los metadatos. El nombre del modelo base (`tur_latn_10mb`) indica turco en escritura latina, pero la model card no declara idiomas |
| Licencia | No disponible (la model card incluye un campo `licence: license` sin contenido real) |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es GPT-2, es decir, un transformer decoder-only con atención causal completa, según la etiqueta `gpt2` declarada en el repositorio. Con 39,09 millones de parámetros, se sitúa muy por debajo del GPT-2 small original (124 M) y es coherente con una configuración reducida en número de capas y/o dimensión de embedding. No se especifican en la información disponible el número de capas, la dimensión oculta, el número de cabezas de atención ni la longitud de contexto máxima; tampoco se detalla la configuración del tokenizador, pese a que el nombre del experimento (`new-tokenizers`) y la referencia a un proyecto de W&B apuntan a que el tokenizador forma parte del objeto de estudio.

El entrenamiento se realizó mediante SFT con TRL 0.23.0, Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1 (entorno de septiembre de 2026 según los metadatos). El modelo parte de `goldfish-models/tur_latn_10mb`, un checkpoint de la familia Goldfish de modelos monolingües entrenados con corpus de 10 MB por idioma. No se documenta el dataset de ajuste, el número de tokens de entrenamiento, la composición de los datos, ni si hubo fases de RLHF o DPO (la model card solo menciona SFT). El sufijo `seed3407` del identificador indica una ejecución con semilla fija, y existe un registro público del entrenamiento en Weights & Biases.

## Capacidades

- Generación de texto autoregresiva en el idioma del modelo base (turco en escritura latina, según el nombre del checkpoint; no confirmado en la model card).
- Finalización de texto y continuación de contexto corto, propio de un modelo GPT-2 de 39 M de parámetros.
- Ajuste supervisado ya aplicado: el modelo ha pasado por una fase de SFT, por lo que cabe esperar cierto alineamiento con el formato de instrucciones del dataset empleado, aunque este no se documenta.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible; no se declara ninguna capacidad de este tipo.
- Capacidades multilingües: no disponibles; el modelo base es monolingüe.
- Capacidades especiales (modo de razonamiento explícito, visión, audio): no disponibles.
- Inferencia compatible con `text-generation-inference` y con la API de endpoints de HuggingFace, según las etiquetas del repositorio.

## Casos de uso

- Completado de texto en turco para prototipos: el modelo puede usarse mediante `pipeline("text-generation")` para generar continuaciones cortas de frases en turco, útil para validar un flujo de integración antes de invertir en un modelo mayor.
- Investigación sobre tokenizadores y preentrenamiento: dado el nombre del experimento y el proyecto de W&B asociado, este checkpoint sirve como artefacto reproducible para comparar tokenizadores o estrategias de ajuste sobre un corpus de 10 MB.
- Reproducción de experimentos de ajuste fino: al estar etiquetado como `generated_from_trainer` y `trl`, permite replicar el pipeline de SFT, medir el olvido catastrófico respecto al modelo base y documentar la variabilidad entre semillas.
- Pruebas unitarias de infraestructura de despliegue: con 39 M de parámetros, el modelo carga en cualquier entorno y resulta adecuado para verificar que un servidor de inferencia (TGI, endpoints compatibles) funciona correctamente sin consumir recursos de GPU relevantes.
- Generación de datos sintéticos de bajo coste: se pueden producir grandes volúmenes de texto en turco para tareas auxiliares (aumento de datos, pruebas de pipelines de filtrado o deduplicación), asumiendo la baja calidad esperable del modelo.
- Experimentación en dispositivos muy limitados: cabe ejecutarlo en CPU, en una Raspberry Pi o en un móvil de gama alta para estudiar latencia, consumo energético o técnicas de cuantización extrema.
- Punto de partida para ajustes posteriores: por su tamaño, es barato aplicar SFT adicional o LoRA sobre dominios concretos en una única GPU de consumo, aunque no hay evidencia publicada de que el resultado sea competitivo.
- Docencia y formación: sirve para ilustrar el ciclo completo de un modelo GPT-2 en un aula o taller, desde la carga con Transformers hasta la evaluación, sin necesidad de infraestructura especializada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra evaluación, y los resultados de la búsqueda web no aportan datos sobre este checkpoint. No procede, por tanto, presentar ninguna tabla comparativa de rendimiento sin medirlo directamente.

## Requisitos de hardware

- VRAM estimada para inferencia con pesos en fp32: aproximadamente 156 MB solo de pesos (39,09 M de parámetros × 4 bytes).
- VRAM estimada en fp16/bf16: aproximadamente 78 MB de pesos, más el estado de la caché KV, que en un modelo de este tamaño es despreciable.
- VRAM estimada en int8: aproximadamente 39 MB; en int4, aproximadamente 20 MB, siempre que se realice la conversión (no se distribuyen pesos cuantizados).
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre, incluidas GTX 1050, RTX 3050, RTX 4090, A100 o H100. El modelo está sobredimensionadamente servido por cualquier acelerador moderno.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo de los últimos diez años, e incluso en iGPU, CPU y dispositivos embebidos.
- Opciones de despliegue: `transformers` con `pipeline`, Text Generation Inference (TGI) y endpoints compatibles según las etiquetas del repositorio; llama.cpp, Ollama o ONNX Runtime son viables previa conversión de los pesos, que no está publicada.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas y dependen por completo del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `francesca9805/tur-latn-10mb-ppt-Dp-10mb-packed-bfd_seed3407` | 39,09 M | no disponible | no disponible | Repositorio en HuggingFace, 0 descargas |
| `goldfish-models/tur_latn_10mb` (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible | Público en HuggingFace |
| `openai-community/gpt2` (referencia de arquitectura) | 124 M | 1.024 tokens | licencia modificada de MIT | Público en HuggingFace |
| Otros checkpoints Goldfish de 10 MB para distintas lenguas | alrededor de decenas de millones, no confirmado | no disponible | no disponible | Públicos en HuggingFace |

La comparación cuantitativa de rendimiento entre estos modelos no es posible con la información disponible: ninguno de los datos de benchmarks de este checkpoint está publicado y la búsqueda web no devolvió material relevante.

## Limitaciones y advertencias

- No hay ninguna evaluación publicada: se desconoce la perplejidad, la calidad de generación y el grado de alineamiento conseguido con el SFT.
- Riesgo elevado de alucinación y de texto incoherente: con 39 M de parámetros y un corpus de partida de 10 MB, la capacidad de modelar el lenguaje es muy limitada y las salidas largas degeneran con facilidad.
- Sesgos conocidos: no documentados. Cualquier sesgo presente en el corpus de 10 MB del modelo base se hereda y se amplifica por el reducido tamaño de los datos.
- Limitaciones de idioma: el modelo base es monolingüe (turco en escritura latina según su nombre), sin capacidades multilingües declaradas. No se debe asumir un comportamiento correcto en castellano ni en otras lenguas.
- Limitaciones de contexto: la longitud máxima de contexto no está documentada, por lo que no se puede garantizar el comportamiento con entradas largas.
- Restricciones de licencia: la licencia no está disponible y la model card contiene un campo `licence: license` sin contenido. No se debe asumir uso comercial permitido sin aclararlo con el autor.
- Otras advertencias: el repositorio incluye pesos en fp32 sin cuantizaciones publicadas; los 39,09 M de parámetros corresponden al total, no a parámetros activos, y no existe ningún mecanismo de atención eficiente o decodificación especulativa documentado.
- No es un modelo apto para producción: sin benchmarks, sin licencia clara, sin documentación del dataset y con cero descargas registradas, su uso debe limitarse a experimentación controlada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/tur-latn-10mb-ppt-Dp-10mb-packed-bfd_seed3407
- Modelo base: https://huggingface.co/goldfish-models/tur_latn_10mb
- Registro del entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/3kjltacx
- Repositorio de TRL: https://github.com/huggingface/trl
- Ninguno de los resultados devueltos por la búsqueda web (repositorios de jailbreaks, hilos de Reddit y preguntas en Zhihu sobre ChatGPT) guarda relación con este modelo.
