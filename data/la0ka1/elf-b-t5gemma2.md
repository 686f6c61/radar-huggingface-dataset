# la0ka1/ELF-B-T5Gemma2

## Resumen

ELF-B-T5Gemma2 es un modelo de lenguaje de difusion continua (diffusion language model) desarrollado por el autor la0ka1 (Zekai Zhang y colaboradores) como artefacto de investigacion asociado al articulo *Scaling and Distilling Text Embeddings for Better Diffusibility*. A diferencia de un transformer autoregresivo convencional, ELF (Embedded Language Flow) no predice tokens directamente, sino que genera secuencias de embeddings de texto mediante *flow matching* y despues las decodifica a tokens con una cabeza propia. El modelo se entrena sobre los embeddings congelados del encoder de T5Gemma-2, no sobre texto tokenizado de forma estandar.

La arquitectura combina un transformer de 89M de parametros con una cabeza de decodificacion de 168M, lo que da un total aproximado de 257M de parametros. Se entreno sobre OpenWebText, con secuencias de 1024 tokens durante 5 epocas y un tamano de lote de 512. El muestreo emplea un sampler SDE con guiado por self-conditioning, ajustable mediante los parametros `--sc` (escala de guiado) y `--nfe` (numero de pasos).

Se trata de un *research artifact* sin uso downstream previsto: genera texto en ingles de estilo web de forma no condicionada, sin filtrado, y su relevancia actual es puramente cientifica, orientada a estudiar espacios de embeddings de texto como espacios latentes para difusion. No esta disenado para chat, tool calling ni despliegues de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion language model continua con flow matching (transformer para el flujo + cabeza de decodificacion de embeddings a tokens) |
| Parametros totales | ~257M (89M en el transformer + 168M en la cabeza de decodificacion) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (solo se distribuye checkpoint `.pt`) |
| Idiomas soportados | en (ingles) |
| Licencia | Gemma Terms of Use (codigo asociado bajo licencia MIT) |
| Formato de pesos | `.pt` (checkpoint PyTorch con pesos EMA y config; incluye tokenizador de T5Gemma-2) |

## Arquitectura y entrenamiento

ELF (Embedded Language Flow) es un modelo de difusion continua que opera en el espacio de embeddings de texto. En lugar de modelar la distribucion sobre tokens, aprende un campo de flujo (*flow matching*) que transforma ruido en una secuencia de embeddings, y despues una cabeza de decodificacion propia convierte esa secuencia en tokens. Este modelo, ELF-B, usa la arquitectura ELF sin cambios y se entrena sobre los embeddings generados por el encoder congelado de T5Gemma-2, un encoder-decoder de Google DeepMind derivado de Gemma 3 con ventana de 128k tokens.

El entrenamiento se realizo sobre OpenWebText, con secuencias de 1024 tokens, durante 5 epocas y un tamano de lote de 512, usando los embeddings del encoder de T5Gemma-2 congelados como objetivo latente. El muestreo emplea un sampler SDE con guiado por self-conditioning: el parametro `--sc` controla la escala de guiado y `--nfe` el numero de pasos de evaluacion. Los pesos publicados son la media exponencial movil (EMA) del entrenamiento. La innovacion tecnica principal es precisamente *difundir* en un espacio de embeddings escalados y destilados en lugar de en el espacio de tokens discreto.

## Capacidades

- Generacion de texto no condicionada (unconditional) en ingles de estilo web.
- Modelado generativo en el espacio de embeddings de texto mediante flow matching y sampler SDE.
- Decodificacion de secuencias de embeddings a tokens con cabeza propia.
- Control del muestreo mediante escala de guiado (`--sc`) y numero de pasos de evaluacion (`--nfe`).
- Evaluacion de perplejidad generativa bajo GPT-2-Large (utilidad de investigacion).
- Sin soporte de tool calling ni function calling.
- Sin soporte de agentes ni razonamiento multi-paso.
- Sin capacidades multilingues (solo ingles).
- Sin capacidades de vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion sobre modelos de difusion de lenguaje: servir como implementacion de referencia de un diffusion LM continuo para comparar con modelos discretos o autoregresivos en tareas de modelado de lenguaje.
- Estudio de espacios latentes de embeddings: analizar como se comporta la difusion cuando el espacio objetivo son embeddings escalados y destilados, y no tokens.
- Experimentos de flow matching aplicado a texto: reproducir el entrenamiento y el muestreo con distintos valores de `--sc` y `--nfe` para estudiar el compromiso entre entropia y perplejidad generativa.
- Linea base de perplejidad generativa: usar el modelo como referencia con Gen. PPL 38.5 bajo GPT-2-Large para comparaciones reproducibles en OpenWebText con 1024 tokens.
- Investigacion sobre guiado por self-conditioning: evaluar el efecto del self-conditioning en la calidad de las muestras dentro de un sampler SDE.
- Reproducibilidad academica: validar los resultados del articulo *Scaling and Distilling Text Embeddings for Better Diffusibility* mediante el codigo publicado y el checkpoint EMA.
- Estudio de decodificacion en espacio latente: investigar la cabeza de decodificacion de embeddings a tokens y su impacto en la calidad final del texto generado.

## Benchmarks y rendimiento

Unica metrica publicada en la model card: perplejidad generativa bajo GPT-2-Large medida a entropia unigrama comparable, sobre OpenWebText con 1024 tokens, media de 3 semillas con 1024 muestras cada una, en el ajuste `--sc 1 --nfe 64`.

| Referencia | Generative perplexity (GPT-2-Large) | Entropia unigrama |
|---|---|---|
| ELF-B-T5Gemma2 (`--sc 1 --nfe 64`) | 38.5 | 5.41 |
| Texto real (OpenWebText) | 15.4 | 5.43 |

El autor indica que ELF-B sobre T5Gemma-2 no alcanza la entropia del texto real en la rejilla de muestreo, y que este es su ajuste con mayor entropia. El barrido completo de `--sc` y `--nfe` esta en el articulo, no en la model card. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los ~257M de parametros ocupan aproximadamente 1,03 GB en fp32, ~0,5 GB en fp16 y ~0,26 GB en int8.
- El repositorio pesa 1,1 GB e incluye el checkpoint `.pt` y el tokenizador de T5Gemma-2.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; por ejemplo RTX 3060 (6-12 GB), RTX 4070, RTX 4090. En GPUs de datacenter (A100, H100) sobra memoria, aunque no es el escenario objetivo.
- Cabe holgadamente en GPU de consumo; tambien es viable la inferencia en CPU dado el reducido numero de parametros.
- Opciones de despliegue: el modelo se ejecuta con el codigo del articulo (`sample.py` y `evaluate.py`) disponible en el repositorio GitHub. No hay integracion nativa documentada con vLLM, llama.cpp, Ollama o TGI; el formato `.pt` con arquitectura de difusion custom no es directamente compatible con esos runners.
- Latencia y throughput: no disponibles. El coste de muestreo depende del numero de pasos (`--nfe`); a `--nfe 64` se requieren 64 evaluaciones del modelo por muestra de 1024 tokens.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos frente a otros diffusion language models (por ejemplo SEDD, Plaid u otras propuestas de difusion discreta o continua) en la informacion proporcionada. Tampoco se aportan numeros frente a modelos autoregresivos de tamano similar. Por tanto, la comparativa cuantitativa es "no disponible".

A nivel conceptual, el punto de comparacion mas directo es el propio encoder sobre el que se entrena, T5Gemma-2 (familia de Google DeepMind con variantes 270M-270M, 1B-1B y 4B-4B, contexto de 128k tokens, multilingue y multimodal), pero ELF-B no reutiliza el decoder de T5Gemma-2: emplea su propia cabeza de decodificacion y solo toma los embeddings del encoder como espacio objetivo. La comparacion de rendimiento entre ambos no esta disponible en la model card.

| Modelo | Parametros | Contexto | Tarea | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| ELF-B-T5Gemma2 | ~257M (89M + 168M) | 1024 tokens | Diffusion LM en embeddings (generacion no condicionada) | Gemma Terms of Use | Gen. PPL 38.5 |
| T5Gemma-2 | 270M-270M a 4B-4B | 128k tokens | Encoder-decoder LLM (multilingue, multimodal) | Gemma Terms of Use | no disponible aqui |
| Otros diffusion LM (SEDD, Plaid, etc.) | no disponible | no disponible | Diffusion LM | no disponible | no disponible |

## Limitaciones y advertencias

- Genera texto en ingles de estilo web de forma no condicionada y sin filtrado; puede producir contenido falso o sesgado.
- Es un artefacto de investigacion para estudiar embeddings de texto como espacios latentes; no esta disenado para ningun uso downstream.
- No alcanza la entropia del texto real en la rejilla de muestreo evaluada, lo que indica una distribucion generativa mas limitada que la del texto natural.
- No soporta tool calling, agentes, ni conversacion multi-turno.
- Solo soporta ingles; no hay capacidades multilingues.
- Contexto de 1024 tokens, muy inferior al de los LLM actuales.
- Licencia Gemma Terms of Use: el uso comercial esta sujeto a dichos terminos, incluida la Gemma Prohibited Use Policy. El modelo es un derivado de T5Gemma-2 (Model Derivative) y no es un producto de Google ni esta respaldado por Google.
- El codigo asociado se distribuye bajo licencia MIT, pero los pesos siguen sujetos a los terminos de Gemma.
- Al no tener integracion con runners estandar (vLLM, Ollama, TGI, llama.cpp), el despliegue en produccion requeriria adaptar el codigo propietario del autor.
- Riesgo de alucinacion: inherente a un modelo de lenguaje generativo no condicionado, aunque no se han publicado evaluaciones especificas de factualidad.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/la0ka1/ELF-B-T5Gemma2
- Repositorio de codigo: https://github.com/la0ka1/diffusing-scaled-text-embeddings
- Pagina del proyecto: https://la0ka1.github.io/diffusing-scaled-text-embeddings/
- Coleccion de modelos del release: https://huggingface.co/collections/la0ka1/diffusing-scaled-text-embeddings-6abd7ff3c91fd70bd749c197
- T5Gemma-2 (Google DeepMind): https://deepmind.google/models/gemma/t5gemma/
- T5Gemma 2 (documentacion de Transformers): https://huggingface.co/docs/transformers/model_doc/t5gemma2
- T5Gemma-2-1B-1B (modelo base del encoder): https://huggingface.co/google/t5gemma-2-1b-1b
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Politica de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
- Articulo (referencia): Zhang, Zekai; Tian, Yunjie; He, Yanjin; Zhang, Xiaoyan; Zhao, Dongdi; Qu, Qing; Fu, Di. *Scaling and Distilling Text Embeddings for Better Diffusibility*, 2026. Enlace a arXiv no disponible todavia.
