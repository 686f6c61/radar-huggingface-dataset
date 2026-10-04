# francesca9805/eus-latn-100mb-ppt-mp-struct-100mb_seed455

## Resumen

El modelo `francesca9805/eus-latn-100mb-ppt-mp-struct-100mb_seed455` es un ajuste fino (fine-tuning) supervisado del modelo base `goldfish-models/eus_latn_100mb`, un modelo de lenguaje monolingue centrado en euskera (codigo de idioma `eus_latn`). Con 124.770.816 parametros, se situa en la misma escala que GPT-2 small y esta pensado para generacion de texto autoregresiva.

Lo desarrolla el usuario `francesca9805` (asociado a la Universidad de Groningen, segun el enlace de Weights & Biases) y se ha entrenado con SFT mediante la libreria TRL de Hugging Face. El modelo parece formar parte de una serie de experimentos de tokenizacion y ajuste ("new-tokenizers" en el proyecto de W&B), lo que se refleja en el sufijo del nombre (`ppt-mp-struct-100mb_seed455`), aunque la model card no documenta el significado exacto de esas siglas.

Es relevante como ejemplo de modelo pequeno y de bajo coste especializado en una lengua de recursos limitados como el euskera, desplegable en hardware de consumo. Sin embargo, la informacion publicada es minima: no hay licencia declarada, no hay benchmarks, no hay detalle del dataset de ajuste ni de la longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (compatible con las habituales de transformers/GGUF, pero no declaradas por el autor) |
| Idiomas soportados | no disponible en la ficha; el modelo base esta especializado en euskera (`eus_latn`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura indicada por las etiquetas es GPT-2, es decir, un transformer decoder-only con atencion causal completa. El recuento real de parametros (124.770.816) coincide con la escala de GPT-2 small. Se desconoce el numero de capas, dimensiones del modelo, cabezas de atencion y tamano de vocabulario, ya que la model card no los detalla; el proyecto de W&B ("new-tokenizers") sugiere que el tokenizador pudo modificarse respecto al modelo base.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) con TRL 0.23.0, sobre el modelo `goldfish-models/eus_latn_100mb`, que a su vez se entreno con unos 100 MB de texto en euskera. La informacion disponible no especifica el numero de tokens de ajuste, la composicion del dataset, ni si hubo etapas de RLHF/DPO. Las versiones de framework reportadas son Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1.

## Capacidades

- Generacion de texto autoregresiva en el dominio para el que fue ajustado.
- Ajuste fino supervisado sobre un modelo de base monolingue en euskera, por lo que su competencia esperada se centra en ese idioma.
- Compatible con el pipeline `text-generation` de Transformers y con TGI (text-generation-inference) segun las etiquetas.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades de vision, audio ni modos de "thinking".
- Capacidades multilingues: no disponibles; el modelo base es monolingue en euskera.

## Casos de uso

- Generacion de texto en euskera para prototipado: al ser un modelo de 124 M de parametros especializado en esa lengua, sirve para experimentar con generacion de texto en euskera en entornos con pocos recursos de computo.
- Ajuste fino posterior (fine-tuning) como punto de partida: dado su tamano reducido, es viable reentrenarlo o ajustarlo con pocos datos para tareas concretas dentro del euskera (clasificacion, resumen, continuacion de texto).
- Generacion aumentada por recuperacion (RAG) ligera en euskera: integrable en pipelines de transformers donde el recuperador aporte el contexto, dado que el modelo apenas ocupa espacio.
- Experimentacion academica en tokenizacion: por su vinculacion al proyecto "new-tokenizers" de W&B, es util para estudiar el efecto del tokenizador en lenguas de bajos recursos.
- Inferencia en el borde (edge) o en CPU: con ~125 M de parametros cuantizados, puede ejecutarse en portatiles o dispositivos sin GPU dedicada.
- Generacion de datos sinteticos en euskera: puede emplearse para aumentar corpus de entrenamiento de modelos mayores en esa lengua, siempre revisando la calidad de la salida.
- Demostraciones y pruebas de concepto: al ser ligero, permite montar demos interactivas con tiempos de carga minimos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (pesos, sin contar activaciones ni cache KV): ~500 MB en FP32, ~250 MB en FP16/BF16, ~125 MB en INT8 y ~62 MB en INT4.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria, incluidas GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090; tambien A100 o H100 si se busca maxima concurrencia.
- Cabe holgadamente en GPU de consumo e incluso en CPU: 124 M de parametros permiten inferencia en un portatil moderno sin GPU.
- Opciones de despliegue: Transformers (pipeline `text-generation`), TGI (text-generation-inference), vLLM; para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion no documentada por el autor.
- Latencia y throughput estimados: no disponibles. En una GPU de consumo, un modelo de este tamano suele generar decenas de tokens por segundo, pero no se aportan mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| francesca9805/eus-latn-100mb-ppt-mp-struct-100mb_seed455 | 124,77 M | no disponible | no disponible | Ajuste SFT con TRL sobre goldfish-models/eus_latn_100mb |
| goldfish-models/eus_latn_100mb | ~100 M (modelo base) | no disponible | no disponible | Modelo base monolingue en euskera entrenado con 100 MB de texto |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | MIT (uso amplio) | Referencia generalista en ingles, menor cobertura de euskera |

La comparacion con alternativas equivalentes en euskera o en otras lenguas de bajos recursos no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No se declara licencia, por lo que el uso comercial queda sin cobertura legal clara hasta confirmacion del autor.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad de generacion, coherencia ni fidelidad factual.
- Riesgo de alucinacion elevado: al ser un modelo pequeno (124 M) ajustado sobre un corpus limitado (100 MB), es propenso a generar contenido incoherente o inventado.
- Cobertura idiomatica restringida: el modelo base es monolingue en euskera; no se documenta soporte de castellano ni de otros idiomas.
- Longitud de contexto no documentada: limita el diseno de aplicaciones que dependan de ventanas largas.
- Datos de entrenamiento no documentados: se desconoce la composicion del corpus de ajuste, lo que dificulta evaluar sesgos y posibles filtraciones.
- El nombre del modelo sugiere una configuracion experimental (`seed455`, `ppt-mp-struct`), lo que apunta a un artefacto de investigacion mas que a un modelo listo para produccion.
- Sin descargas ni "likes" en el momento de la consulta: no existe validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/francesca9805/eus-latn-100mb-ppt-mp-struct-100mb_seed455
- Modelo base: https://huggingface.co/goldfish-models/eus_latn_100mb
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/wyrr3gd9
- Repositorio TRL: https://github.com/huggingface/trl
