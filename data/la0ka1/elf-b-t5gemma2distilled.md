# la0ka1/ELF-B-T5Gemma2distilled

## Resumen

ELF-B-T5Gemma2distilled es un modelo de lenguaje de difusion continua (diffusion language model) desarrollado por la0ka1 y presentado junto al articulo *Scaling and Distilling Text Embeddings for Better Diffusibility* (Zhang et al., 2026). Pertenece a la familia ELF (Embedded Language Flow), cuyo objetivo no es generar texto token a token como un transformer autorregresivo, sino generar secuencias completas de embeddings de texto mediante flow matching y decodificarlas despues a tokens con una cabeza dedicada. Este checkpoint concreto se entrena sobre los embeddings congelados del estudiante destilado T5Gemma-2-270M-OWTdistilled.

La arquitectura mantiene sin cambios el diseno base de ELF: un transformer de 89 millones de parametros que opera en el espacio latente de embeddings y una cabeza de decodificacion de 168 millones de parametros, sumando unos 257 millones en total. El entrenamiento usa OpenWebText con secuencias de 1024 tokens, 5 epocas y batch de 512. El muestreo emplea un sampler SDE con self-conditioning guidance, parametrizable mediante los argumentos `--sc` (escala de guiado) y `--nfe` (numero de pasos).

Su relevancia es fundamentalmente investigadora: sirve para estudiar los embeddings de texto como espacio latente difundible y para replicar los experimentos del articulo. No es un modelo orientado a producto ni a un caso de uso downstream concreto; es un artefacto de investigacion de generacion de texto no condicionada en ingles. Su licencia queda sujeta a los Gemma Terms of Use por derivar del ecosistema T5Gemma-2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion continuo (ELF, Embedded Language Flow) con transformer de 89M y cabeza de decodificacion de 168M; generacion de embeddings por flow matching |
| Parametros totales | ~257M (89M en el transformer + 168M en la cabeza de decodificacion) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | No disponible (se distribuye como checkpoint PyTorch, sin versiones GGUF/AWQ/GPTQ oficiales) |
| Idiomas soportados | Ingles (en) |
| Licencia | Gemma Terms of Use (codigo bajo licencia MIT) |
| Formato de pesos | PyTorch (`.pt`, pesos EMA) |

## Arquitectura y entrenamiento

ELF-B es un modelo de difusion continuo sobre embeddings de texto. En lugar de predecir el siguiente token, aprende a generar secuencias de embeddings (de dimension conocida) mediante flow matching y despues las proyecta a tokens con su propia cabeza de decodificacion. La componente transformer tiene 89M de parametros y la cabeza de decodificacion 168M, lo que da el total de ~257M. El checkpoint incluido en el repositorio almacena los pesos promediados mediante EMA junto con una configuracion reducida (tamano de modelo, dimension de embedding, longitud de secuencia, vocabulario, tokenizer y media/desviacion tipica de los embeddings).

El entrenamiento se realizo sobre OpenWebText (dataset `Skylion007/openwebtext`) usando secuencias de 1024 tokens, durante 5 epocas y con un batch de 512. El aspecto distintivo del metodo es que el modelo se entrena sobre los embeddings congelados del estudiante destilado T5Gemma-2-270M-OWTdistilled: es decir, el espacio latente objetivo no son embeddings genericos, sino los producidos por un modelo destilado especifico, lo que el articulo relaciona con una mejor "difusibilidad" (facilidad de modelado por difusion). En muestreo se emplea un sampler SDE con self-conditioning guidance, donde `--sc` controla la escala de guiado y `--nfe` el numero de pasos de integracion.

## Capacidades

- Generacion de texto no condicionada en ingles, en estilo web (heredado de OpenWebText).
- Generacion mediante difusion: produce secuencias completas de embeddings de una sola pasada con flow matching, en lugar de decodificacion autorregresiva token a token.
- Muestreo configurable: ajuste mediante escala de guiado (`--sc`) y numero de pasos (`--nfe`) para equilibrar calidad y coste computacional.
- Decodificacion a tokens con cabeza propia a partir del vocabulario y tokenizer de T5Gemma-2.
- Reproduccion de experimentos del articulo (evaluacion de perplejidad generativa).
- No dispone de tool calling, function calling, agentes, vision, audio, ni modo "thinking".
- Capacidad multilingue: no disponible (solo ingles).

## Casos de uso

- Investigacion en modelos de difusion de lenguaje: uso principal del checkpoint, para reproducir y extender los experimentos del articulo sobre difusibilidad de embeddings de texto.
- Estudio de espacios latentes de embeddings: el modelo permite analizar como se comportan los embeddings destilados de T5Gemma-2 como espacio latente difundible.
- Evaluacion comparativa de metodos de generacion: sirve como punto de referencia frente a modelos autorregresivos en metricas de perplejidad generativa sobre OpenWebText.
- Generacion de texto de relleno en ingles: al producir texto no condicionado de estilo web, puede emplearse para generar corpus sinteticos de prueba en pipelines de experimentacion (con las salvedades de calidad y sesgo).
- Replicacion de pipelines de destilacion: util para estudiar como se comporta un modelo de difusion cuando se apoya en embeddings de un estudiante destilado frente a embeddings de un modelo mayor.
- Docencia y divulgacion: ejemplo practico de codigo abierto (MIT) para explicar difusion continua y flow matching aplicados a texto.
- No se recomienda como componente de produccion en atencion al cliente, generacion de codigo, RAG ni agentes, porque no esta disenado ni entrenado para tareas condicionadas.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados en la informacion disponible son de perplejidad generativa (generative perplexity) bajo GPT-2-Large, medida en entropia unigram, media sobre 3 semillas con 1024 muestras cada una.

| Metrica | Valor |
|---|---|
| Dataset de evaluacion | OpenWebText, 1024 tokens |
| Metrica | Perplejidad generativa bajo GPT-2-Large (entropia unigram) |
| Texto real (referencia) | 15,4 de perplejidad a entropia 5,43 |
| ELF-B-T5Gemma2distilled (`--sc 1 --nfe 256`) | 31,2 de perplejidad a entropia 5,44 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El barrido completo sobre `--sc` y `--nfe` se encuentra en el articulo.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1 GB en precision completa (FP32), coherente con el tamano del repositorio (1,1 GB); aproximadamente 0,5 GB en FP16/BF16. Cifras orientativas segun el total de ~257M parametros.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no requiere A100/H100. Una RTX 3060, RTX 4060 o superior es mas que suficiente.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en practicamente cualquier GPU de consumo actual y en iGPU con memoria compartida suficiente.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. El unico camino soportado es el codigo del articulo (`sample.py` y `evaluate.py` del repositorio `la0ka1/diffusing-scaled-text-embeddings`), con PyTorch.
- Latencia y throughput: no disponible. Depende fuertemente del numero de pasos `--nfe` y de la escala de guiado `--sc`; un `--nfe` mayor implica mas pasos de integracion del sampler SDE y, por tanto, mayor coste.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de especificaciones verificadas de modelos comparables (por ejemplo, otros modelos de difusion de texto como Plaid o SEDD) que permitan rellenar una tabla con datos fiables. El unico punto de referencia citado explicitamente en la model card es GPT-2-Large, que se usa como evaluador de la perplejidad generativa, no como modelo comparable en arquitectura.

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| ELF-B-T5Gemma2distilled | ~257M (89M + 168M) | 1024 tokens | Difusion continua / flow matching sobre embeddings | Gemma Terms of Use |
| GPT-2-Large (referencia de evaluacion) | no disponible en la informacion | no disponible en la informacion | Autorregresivo denso | no disponible en la informacion |
| Otros modelos de difusion de texto | no disponible | no disponible | Difusion | no disponible |

Para comparativas cuantitativas fiables conviene consultar el barrido completo del articulo *Scaling and Distilling Text Embeddings for Better Diffusibility*.

## Limitaciones y advertencias

- Genera texto no condicionado (unconditional) en estilo web ingles y sin filtrado: puede producir contenido falso, sesgado u ofensivo.
- Es un artefacto de investigacion para estudiar embeddings de texto como espacios latentes; no esta construido para ningun uso downstream.
- Sesgos conocidos: hereda los sesgos de OpenWebText y de los embeddings destilados de T5Gemma-2; no se documenta ninguna mitigacion.
- Riesgo de alucinacion: alto, dado que no esta condicionado ni alineado con instrucciones; no sigue prompts en el sentido habitual.
- Limitaciones de contexto e idioma: ventana de 1024 tokens y soporte exclusivamente en ingles.
- Restricciones de licencia: el modelo se distribuye bajo los Gemma Terms of Use e incluye la Gemma Prohibited Use Policy; es una derivacion de T5Gemma-2, no un producto de Google ni avalado por Google. El codigo asociado es MIT.
- Caveat para produccion: no hay soporte en frameworks de servido estandar (vLLM, llama.cpp, Ollama, TGI) ni versiones cuantizadas oficiales; la integracion exige el codigo propio del proyecto.
- El muestreo requiere ajustar `--sc` y `--nfe`, con el consiguiente compromiso entre calidad y coste; el barrido de referencia esta en el articulo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/la0ka1/ELF-B-T5Gemma2distilled
- Modelo base de embeddings (estudiante destilado): https://huggingface.co/la0ka1/T5Gemma-2-270M-OWTdistilled
- Repositorio de codigo: https://github.com/la0ka1/diffusing-scaled-text-embeddings
- Pagina del proyecto: https://la0ka1.github.io/diffusing-scaled-text-embeddings/
- Coleccion completa del release: https://huggingface.co/collections/la0ka1/diffusing-scaled-text-embeddings-6abd7ff3c91fd70bd749c197
- Articulo (arXiv, anunciado como proximo): referencia de cita `zhang2026scaling` en la model card
- Documentacion de T5Gemma (Transformers): https://huggingface.co/docs/transformers/v5.3.0/en/model_doc/t5gemma
- Documentacion de T5Gemma 2 (Transformers): https://huggingface.co/docs/transformers/v5.0.0/model_doc/t5gemma2
- T5Gemma en Google DeepMind: https://deepmind.google/models/gemma/t5gemma/
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Perfil de GitHub del autor: https://github.com/LA0KA1
