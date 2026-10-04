# francesca9805/swa-latn-100mb-ppt-mp-struct-100mb_seed3407

## Resumen

El modelo `francesca9805/swa-latn-100mb-ppt-mp-struct-100mb_seed3407` es un ajuste fino (fine-tuning) del modelo base `goldfish-models/swa_latn_100mb`, desarrollado por el usuario de HuggingFace francesca9805. Se trata de un modelo causal de generación de texto de aproximadamente 125 millones de parámetros (124.770.816 exactos, según los pesos en safetensors), construido sobre una arquitectura tipo GPT-2 y entrenado mediante Supervised Fine-Tuning (SFT) con la librería TRL de HuggingFace. El identificador sugiere un experimento dentro de una línea de trabajo académico (la cuenta de Weights & Biases asociada apunta a la University of Groningen).

El modelo base `swa_latn_100mb` pertenece a la familia goldfish-models, una colección de modelos monolingües entrenados sobre corpus de aproximadamente 100 MB por idioma; en este caso, el código `swa_latn` corresponde a suajili (swahili) en escritura latina. Por tanto, el modelo está orientado a la generación de texto en suajili y no a un uso multilingüe generalista. El sufijo del nombre (`ppt-mp-struct-100mb_seed3407`) apunta a una configuración experimental concreta dentro de una comparativa de tokenizadores o de datos, con semilla 3407.

Su relevancia es limitada y de nicho: se trata de un modelo pequeño, sin resultados de benchmarks publicados, sin licencia declarada de forma explícita y con cero descargas en el momento de redactar esta ficha. Resulta útil sobre todo como artefacto de investigación para estudiar el efecto del SFT sobre modelos monolingües de bajo recurso, más que como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer causal, decoder-only); etiqueta `gpt2` en HuggingFace |
| Parametros totales | 124.770.816 (~125 M) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | Suajili (`swa_latn`) segun el modelo base; no confirmado explicitamente en la model card |
| Licencia | No disponible (la model card indica `licence: license` sin especificar) |
| Formato de pesos | Safetensors |
| Tamano del repositorio | 0,3 GB |
| Modelo base | `goldfish-models/swa_latn_100mb` |
| Libreria | Transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer causal de tipo GPT-2, es decir, un decoder-only con atención completa, con aproximadamente 125 millones de parámetros. Al derivar de `goldfish-models/swa_latn_100mb`, hereda el tokenizador y la configuración del modelo base, que forma parte de la familia goldfish de modelos monolingües entrenados sobre corpus de unos 100 MB por idioma. No se dispone de información sobre el número exacto de capas, dimensiones ocultas, número de cabezas de atención ni la longitud de contexto configurada.

El entrenamiento se realizó mediante Supervised Fine-Tuning (SFT) con TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. La model card enlaza a una ejecución concreta de Weights & Biases, pero no detalla la composición del dataset de SFT, el número de tokens de entrenamiento, ni si se aplicaron técnicas posteriores como RLHF o DPO (no consta ninguna). El nombre del modelo incluye un identificador de semilla (`seed3407`), lo que sugiere que forma parte de una batería de experimentos reproducibles con distintas semillas o configuraciones.

## Capacidades

- Generacion de texto autoregresiva en suajili (idioma heredado del modelo base).
- Instruccion basica mediante formato conversacional, ya que la model card incluye un ejemplo con `pipeline("text-generation")` pasando una lista de mensajes con rol `user`.
- Ajuste por SFT sobre un modelo base preentrenado, lo que en principio mejora el seguimiento de instrucciones respecto al modelo base sin afinar.
- Compatibilidad con `text-generation-inference` y `endpoints_compatible`, segun las etiquetas del repositorio.
- No consta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Experimentacion academica en procesamiento de lenguaje natural para lenguas de bajo recurso: el modelo sirve como punto de comparacion para medir el efecto del SFT sobre un modelo monolingüe de 125 M de parametros en suajili.
- Generacion de texto de relleno o sintetico en suajili para aumentar corpus de entrenamiento o evaluacion, dado su bajo coste computacional.
- Prototipado rapido de aplicaciones de generacion de texto en suajili donde no se requiera alta calidad, aprovechando que cabe en cualquier GPU de consumo.
- Estudio de tokenizadores y su impacto: el sufijo `ppt-mp-struct` del nombre apunta a un experimento controlado sobre tokenizacion o estructuracion de datos, util para comparar configuraciones.
- Reproduccion de experimentos: la semilla explicita (`seed3407`) y el enlace a Weights & Biases permiten reproducir y auditar la ejecucion dentro de un estudio comparativo.
- Fine-tuning posterior como base barata: al ser un modelo de 125 M de parametros, se puede reajustar en una unica GPU para tareas especificas de suajili sin gran coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 0,5 GB para los pesos, mas el overhead de activaciones y KV cache.
- VRAM estimada en FP16/BF16: aproximadamente 0,25 GB para los pesos, mas overhead; en la practica cabe holgadamente en cualquier GPU con 4 GB o mas.
- GPU recomendadas: cualquier GPU moderna sirve; una NVIDIA RTX 3060, RTX 4090, A100 o H100 ejecutarian el modelo sin problema. Tambien es viable en CPU, dado su tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer actual, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: HuggingFace Transformers, Text Generation Inference (TGI) segun las etiquetas del repositorio y HuggingFace Endpoints. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama requeririan una conversion previa.
- Latencia y throughput estimados: no disponibles. Al tratarse de un modelo de 125 M de parametros, la latencia por token deberia ser muy baja en GPU, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `francesca9805/swa-latn-100mb-ppt-mp-struct-100mb_seed3407` | ~125 M | No disponible | No disponible | HuggingFace, 0 descargas | Fine-tuning SFT del modelo base |
| `goldfish-models/swa_latn_100mb` | ~125 M (estimado por el base) | No disponible | No disponible | HuggingFace | Modelo base monolingüe en suajili |
| GPT-2 small | 124 M | 1024 tokens | MIT | Ampliamente disponible | Referencia generalista en ingles, no especifico de suajili |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que se desconoce su calidad real frente al modelo base o a alternativas.
- La licencia no esta declarada de forma explicita (`licence: license`), lo que impide confirmar si se permite el uso comercial. Se debe contactar con el autor antes de cualquier uso en produccion.
- Riesgo de alucinacion elevado y calidad limitada: con 125 M de parametros, la coherencia en generaciones largas sera baja en comparacion con modelos actuales.
- Cobertura idiomatica restringida al suajili (latn); no hay evidencia de capacidades multilingues ni de buen rendimiento en castellano o ingles.
- No consta el dataset de SFT, por lo que no se pueden evaluar sesgos ni contaminacion de datos.
- Ausencia de cuantizaciones publicadas: desplegarlo en llama.cpp u Ollama requiere convertir los pesos manualmente.
- Modelo con cero descargas y sin validacion por parte de la comunidad; debe tratarse como artefacto experimental, no como modelo de produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/swa-latn-100mb-ppt-mp-struct-100mb_seed3407
- Modelo base: https://huggingface.co/goldfish-models/swa_latn_100mb
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/gnf37hb2
- Repositorio de TRL: https://github.com/huggingface/trl
