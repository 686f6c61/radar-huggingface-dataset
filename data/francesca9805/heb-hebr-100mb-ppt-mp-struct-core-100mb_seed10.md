# francesca9805/heb-hebr-100mb-ppt-mp-struct-core-100mb_seed10

## Resumen

El modelo `heb-hebr-100mb-ppt-mp-struct-core-100mb_seed10` es un ajuste fino (fine-tune) de tipo SFT del modelo base `goldfish-models/heb_hebr_100mb`, publicado por el usuario `francesca9805`. Se trata de un transformer de arquitectura GPT-2 con 124.770.816 parámetros totales, distribuido en formato safetensors y con un tamano de repositorio de aproximadamente 0,3 GB. El modelo se ha entrenado con la libreria TRL (version 0.23.0) sobre Transformers 4.56.2, lo que lo situa en la categoria de modelos pequenos de generacion de texto.

Su relevancia es limitada y muy especifica: se enmarca en una linea de experimentos de ajuste fino sobre modelos pequenos multilingues del proyecto Goldfish, orientados a idiomas con pocos recursos. El identificador y el modelo base (`heb_hebr`) apuntan a que el trabajo se centra en hebreo, aunque la model card no declara explicitamente los idiomas soportados.

No se trata de un modelo de produccion generalista: no dispone de documentacion sobre datos de entrenamiento, benchmarks ni licencia clara. Su interes es principalmente experimental, como punto de partida para reproducir recetas de SFT sobre modelos pequenos o para estudiar el comportamiento de fine-tunes de bajo coste en idiomas de bajos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo GPT-2 (tag `gpt2` en HuggingFace) |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible; el nombre y el modelo base (`heb_hebr`) apuntan a hebreo |
| Licencia | no disponible (la model card contiene el valor placeholder `licence: license`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer de tipo GPT-2, el mismo backbone del modelo base `goldfish-models/heb_hebr_100mb`. Con 124,77 millones de parametros, se situa en el rango de GPT-2 small/base (que ronda los 124 millones de parametros), lo que implica una red de escala reducida, adecuada para tareas de generacion de texto ligera y para experimentacion en hardware modesto.

El entrenamiento se realizo mediante SFT (Supervised Fine-Tuning) con la libreria TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. No se especifica en la model card el dataset utilizado, el numero de tokens de entrenamiento, la composicion de los datos ni si hubo etapas posteriores de RLHF o DPO. El sufijo `_seed10` sugiere que forma parte de una serie de ejecuciones con distintas semillas, y el nombre incluye indicios de una configuracion experimental (`ppt-mp-struct-core-100mb`). Existe un enlace a un run de Weights & Biases asociado al entrenamiento, aunque no se detallan hiperparametros en la model card.

## Capacidades

- Generacion de texto autoregresiva, heredada de la arquitectura GPT-2 del modelo base.
- Ajuste instruccional basico (SFT), ya que el ejemplo de uso emplea el formato de mensajes con rol `user`.
- Capacidad multilingue: no confirmada; el modelo base y el nombre del repositorio sugieren orientacion al hebreo, pero la model card no lo declara.
- Tool calling / function calling: no documentado; no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo "thinking", vision o audio: no disponible.
- Capacidades especiales adicionales: no disponible.

## Casos de uso

- Experimentacion academica en SFT: el modelo sirve como referencia para reproducir recetas de fine-tuning con TRL sobre un backbone GPT-2 pequeno, comparando resultados entre distintas semillas (`seed10`).
- Generacion de texto en hebreo a pequena escala: si se confirma la orientacion al hebreo del modelo base, podria emplearse para generar borradores de texto en ese idioma, siempre con revision humana.
- Prototipado de pipelines de generacion: por su tamano reducido (124,77 M de parametros), permite iterar rapidamente en entornos locales antes de escalar a modelos mayores.
- Estudio de modelos de bajos recursos: util como caso de analisis dentro del proyecto Goldfish para idiomas con poca disponibilidad de datos.
- Pruebas de infraestructura de despliegue: sirve para validar integraciones con `transformers`, TGI o endpoints compatibles sin consumir recursos significativos.
- Docencia y formacion: adecuado para demostrar el flujo completo de fine-tuning (SFT) y publicacion de modelos en HuggingFace en cursos o talleres.
- Base para investigacion sobre olvido catastrofico: al ser un fine-tune sobre un modelo pequeno, permite medir como el SFT altera las capacidades originales del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas (MMLU, HumanEval, GSM8K ni ninguna otra), y el repositorio tampoco aporta evaluaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,25 GB en fp16 y 0,5 GB en fp32 para los pesos; el consumo real depende del runtime y del tamano de la cache KV.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente; no requiere GPUs de datacenter como A100 o H100.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo (por ejemplo, series GTX 10xx en adelante, RTX 20xx/30xx/40xx) e incluso puede ejecutarse en CPU.
- Opciones de despliegue: `transformers` (pipeline de text-generation), text-generation-inference (TGI) segun los tags `text-generation-inference` y `endpoints_compatible`, y previsiblemente llama.cpp/Ollama si se genera una version GGUF (no incluida en el repo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `francesca9805/heb-hebr-100mb-ppt-mp-struct-core-100mb_seed10` (este modelo) | 124,77 M | no disponible | no disponible | no disponible | HuggingFace, safetensors |
| `goldfish-models/heb_hebr_100mb` (modelo base) | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Otros modelos GPT-2 de ~124 M (p. ej. GPT-2 small) | ~124 M | 1024 tokens (referencia del modelo original; no confirmado para este) | no aplicable directamente (idioma distinto) | variable | ampliamente disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa fiable con alternativas de la misma categoria. Los dos modelos mas directamente comparables son el propio modelo base del que deriva y otros fine-tunes de la serie con distintas semillas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero al derivar de un modelo pequeno entrenado sobre un corpus limitado (100 MB segun el nombre) es previsible que herede sesgos del corpus original.
- Riesgo de alucinacion: alto, tanto por el tamano reducido del modelo como por la ausencia de evaluacion o de etapas de alineacion documentadas.
- Limitaciones de contexto e idioma: la longitud de contexto no esta declarada y los idiomas soportados no se confirman en la model card; la orientacion al hebreo es una inferencia a partir del nombre y del modelo base.
- Licencia: la model card contiene un valor placeholder (`licence: license`) que no constituye una licencia valida. No hay autorizacion explicita para uso comercial; se debe contactar con el autor antes de cualquier uso en produccion.
- Caveats para produccion: sin benchmarks, sin documentacion de datos ni de hiperparametros y con cero descargas e interacciones en el momento de la consulta, no es recomendable como componente critico de un sistema en produccion.
- Fecha de creacion inusual: el repositorio figura creado el 2026-10-09, una fecha posterior a la actual, lo que puede indicar un error de metadatos y conviene verificarlo.
- Sin garantia de reproducibilidad: al no publicarse el dataset ni la configuracion completa de entrenamiento, los resultados no son facilmente reproducibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/heb-hebr-100mb-ppt-mp-struct-core-100mb_seed10
- Modelo base: https://huggingface.co/goldfish-models/heb_hebr_100mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/suhxz3re
- Repositorio de TRL: https://github.com/huggingface/trl
- Proyecto Goldfish (modelos base): https://huggingface.co/goldfish-models
