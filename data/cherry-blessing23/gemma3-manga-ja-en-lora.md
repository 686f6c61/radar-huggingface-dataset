# cherry-blessing23/gemma3-manga-ja-en-lora

## Resumen

`cherry-blessing23/gemma3-manga-ja-en-lora` es un adaptador LoRA (PEFT) publicado en Hugging Face por el usuario cherry-blessing23, construido sobre el modelo base `google/gemma-3-4b-it`. Por el identificador del repositorio y las etiquetas, su proposito declarado es la traduccion japones-ingles en el dominio del manga, si bien la model card no documenta explicitamente ni el dataset, ni el procedimiento, ni los resultados. El repositorio contiene unicamente los pesos del adaptador (0,2 GB), no el modelo completo.

El interes tecnico del artefacto reside en el modelo base: Gemma 3 4B IT es un transformer decoder-only de Google con 4 mil millones de parametros, ventana de contexto de 128 000 tokens, soporte multilingue de mas de 140 idiomas y capacidad de entrada de imagenes. Un adaptador LoRA sobre esa base hereda esas capacidades y anade una especializacion de dominio a un coste de almacenamiento minimo, lo que permite cargar el adaptador junto al modelo base en entornos con recursos limitados.

La relevancia practica es limitada pero concreta: los adaptadores pequenos de traduccion especializada son utiles para pipelines de localizacion de contenido japones, donde el vocabulario coloquial, las onomatopeyas y los juegos de palabras requieren un ajuste fino que los modelos genericos no cubren bien. No obstante, la ausencia total de documentacion, la licencia no declarada y el hecho de que el repositorio no registre descargas ni valoraciones obligan a tratar este artefacto como experimental y no apto para produccion sin una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Gemma 3 4B IT) |
| Parametros totales | No disponible (adaptador de 0,2 GB; el modelo base tiene 4 000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Gemma 3 4B IT soporta 128 000 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; admite combinacion con cuantizaciones del modelo base, no documentadas por el autor) |
| Idiomas soportados | No disponibles (el modelo base soporta mas de 140 idiomas; el adaptador esta orientado a japones e ingles segun su nombre) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft 0.16.0, transformers |
| Modelo base | google/gemma-3-4b-it |
| Tamano del repositorio | 0,2 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango inyectadas en las capas lineales del transformer base, que se combinan con los pesos congelados de Gemma 3 4B IT. El modelo base es un transformer decoder-only con atencion por ventanas deslizantes e interpolacion de RoPE para alcanzar 128 000 tokens de contexto, entrenado por Google con datos multilingues y ajustado con instrucciones (IT). El adaptador no modifica la arquitectura: solo anade parametros entrenables de bajo rango.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los pares japones-ingles, la presencia de RLHF/DPO ni los hiperparametros (rango LoRA, alpha, tasa de aprendizaje, epocas). La model card es una plantilla sin rellenar y no incluye ninguna seccion tecnica completada. La unica referencia documental es la cita generica al calculador de impacto de Lacoste et al. (2019), que no aporta datos sobre el entrenamiento real.

## Capacidades

- Generacion de texto conversacional en el modelo base, con el adaptador orientado a traduccion japones-ingles en el dominio del manga.
- Traduccion bidireccional japones-ingles segun la denominacion del repositorio (no verificada con evaluaciones).
- Razonamiento e instrucciones generales heredados de Gemma 3 4B IT, incluyendo soporte de tool calling y function calling del modelo base.
- Capacidad de vision del modelo base (entrada de imagenes), potencialmente util para traducir texto embebido en paneles de manga, aunque el adaptador no documenta entrenamiento multimodal.
- Soporte multilingue del modelo base (mas de 140 idiomas), con especializacion declarada en japones.
- No se documenta modo thinking, audio ni otras capacidades especiales del adaptador.

## Casos de uso

- Localizacion de manga para editoriales pequenas: el adaptador se aplica sobre Gemma 3 4B IT para traducir dialogos y narracion del japones al ingles en un pipeline por lotes, reduciendo el coste frente a APIs comerciales por volumen de paginas.
- Pre-traduccion asistida para traductores humanos: se genera un borrador en ingles de cada pagina que el traductor revisa y corrige, aprovechando la especializacion de dominio del adaptador para reducir el numero de ediciones.
- Extraccion de texto en paneles escaneados: combinando la capacidad de vision del modelo base con el adaptador, se puede transcribir y traducir texto dentro de imagenes en un flujo de OCR mas traduccion.
- Analisis de corpus de manga para investigacion: traduccion masiva de dialogos a ingles para estudios de linguistica computacional o de traduccion, con la salvedad de que requiere validacion manual de la calidad.
- Prototipado de herramientas de fansub: integracion en scripts que procesan capitulos y generan subtitulos en ingles, con revision humana obligatoria antes de publicar.
- Traduccion de material promocional y fichas de producto de editoriales japonesas: el adaptador puede manejar registros coloquiales y terminos del sector que los modelos genericos traducen de forma literal.
- Fine-tuning posterior: el adaptador sirve como punto de partida para especializaciones adicionales (por ejemplo, un genero concreto de manga) sin necesidad de reentrenar el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna metrica de evaluacion (BLEU, COMET, MMLU, HumanEval ni ninguna otra), y el autor no documenta comparaciones con sistemas de traduccion existentes.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador ocupa 0,2 GB; el modelo base Gemma 3 4B IT requiere aproximadamente 8-9 GB en fp16, 5-6 GB en int8 y 3-4 GB en int4 (estimaciones estandar para 4 000 millones de parametros, no facilitadas por el autor).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para despliegues concurrentes; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia comoda en fp16.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 4080, RTX 3090 y RTX 4070 Ti con cuantizacion int8 o int4; en GPU de 8 GB solo con cuantizacion agresiva.
- Opciones de despliegue: transformers con peft para cargar el adaptador; vLLM y TGI admiten adaptadores LoRA en el servidor; llama.cpp y Ollama requieren fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion, y el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma3-manga-ja-en-lora (este) | 4B (base) + LoRA | 128 000 (base) | Adaptador LoRA | No disponible | Hugging Face, 0 descargas |
| google/gemma-3-4b-it | 4B | 128 000 | Modelo completo IT | Gemma Terms of Use | Hugging Face, ampliamente usado |
| Helsinki-NLP/opus-mt-ja-en | ~77M | 512 | Transformer seq2seq | CC-BY 4.0 | Hugging Face, muy usado |
| NLLB-200-distilled-600M | 600M | 512 | Transformer seq2seq | CC-BY-NC 4.0 | Hugging Face, muy usado |

Frente a los modelos dedicados de traduccion (OPUS-MT, NLLB), este adaptador ofrece mayor contexto y capacidad conversacional, pero carece de evaluacion publica y de licencia declarada. Frente al modelo base sin adaptar, la ventaja es la especializacion de dominio, no verificada.

## Limitaciones y advertencias

- Model card sin completar: no hay informacion sobre datos, entrenamiento, evaluacion ni uso previsto, lo que impide validar la calidad del adaptador.
- Licencia no declarada: no se puede confirmar el uso comercial; ademas, el modelo base Gemma 3 esta sujeto a los Gemma Terms of Use, que imponen restricciones adicionales.
- Riesgo de alucinacion y de traduccion inventada, especialmente en onomatopeyas, juegos de palabras y referencias culturales, sin datos que lo cuantifiquen.
- El adaptador solo cubre japones-ingles segun su nombre; no se documenta su comportamiento en otros pares de idiomas.
- Sin descargas ni valoraciones: no hay evidencia de uso en la comunidad ni de validacion independiente.
- El rendimiento depende del modelo base: cualquier limitacion de Gemma 3 4B IT (sesgos, conocimiento limitado, contexto efectivo menor que el nominal) se hereda.
- No apto para produccion sin una evaluacion propia con un conjunto de prueba representativo del dominio.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/cherry-blessing23/gemma3-manga-ja-en-lora
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Paper de LoRA (Hu et al., 2021): https://arxiv.org/abs/2106.09685
- Calculador de impacto de Lacoste et al. (2019), citado en la model card: https://arxiv.org/abs/1910.09700
