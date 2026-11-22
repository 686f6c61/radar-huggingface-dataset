# codebucketsolutions/msclap-2023-onnx

## Resumen

msclap-2023-onnx es una exportación a formato ONNX del modelo CLAP 2023 de Microsoft (Elizalde, Deshmukh y Wang, "Natural Language Supervision for General-Purpose Audio Representations", 2023), publicado por el usuario codebucketsolutions. El modelo original combina un codificador de audio HTSAT con un codificador de texto GPT-2, ambos entrenados de forma contrastiva sobre 4,6 millones de pares audio-texto. Esta exportación no modifica los pesos: se limita a convertir las dos torres (audio y texto) en grafos ONNX ejecutables con onnxruntime, sin dependencia de PyTorch.

La relevancia práctica del artefacto está en el despliegue: permite hacer clasificación de audio zero-shot y extracción de embeddings de audio y texto en entornos donde instalar PyTorch resulta costoso o inviable (servicios ligeros, contenedores pequeños, pipelines de inferencia en CPU). El repositorio ocupa 0,7 GB e incluye una variante del grafo de audio cuantizada a int8. La licencia es MS-PL, la de los pesos originales.

El modelo no genera texto ni mantiene conversaciones: es un modelo de representación audio-texto orientado a tareas de recuperación y clasificación. Su uso típico es puntuar un clip de audio contra un conjunto de etiquetas escritas en lenguaje natural mediante similitud coseno en un espacio compartido de 1024 dimensiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos torres: codificador de audio HTSAT + codificador de texto GPT-2, entrenamiento contrastivo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 77 tokens para la torre de texto; audio fijo de 7 s (308.700 muestras a 44,1 kHz) |
| Tipos de cuantizacion | fp32 (ambas torres) e int8 dinamico (solo grafo de audio) |
| Idiomas soportados | no disponible (el modelo card no declara lista de idiomas) |
| Licencia | MS-PL (Microsoft Public License) |
| Formato de pesos | ONNX (`audio.onnx`, `audio.int8.onnx`, `text.onnx`) + `tokenizer.json` + `clap.json` |

## Arquitectura y entrenamiento

El modelo original sigue un esquema CLIP aplicado al audio: una torre de audio basada en HTSAT (Hierarchical Token-Semantic Audio Transformer) y una torre de texto basada en GPT-2, alineadas mediante un objetivo contrastivo sobre 4,6 millones de pares audio-texto. El resultado es un espacio de embedding compartido de 1024 dimensiones, con embeddings L2-normalizados en ambas torres. La exportación ONNX conserva los pesos sin cambios y separa el modelo en dos grafos independientes.

Una decisión técnica destacable de esta exportación es que el front-end log-mel está embebido dentro del grafo de audio: una convolución con stride que aplica la DFT enventanada, el banco de filtros mel y el logaritmo. Esto elimina la necesidad de preprocesar el audio fuera del grafo. El grafo de audio exige exactamente 7 segundos de audio mono a 44,1 kHz; los clips más cortos se repiten y recortan (`padding: repeat`) y los más largos se procesan por ventanas de 7 s promediando los embeddings. En la torre de texto hay que añadir `" <|endoftext|>"` a cada etiqueta antes de tokenizar, truncar a 77 tokens y rellenar con id 0 y máscara de atención 0.

La cuantización int8 se aplica únicamente a las matrices del grafo de audio; el autor indica que la cuantización dinámica int8 de la torre de texto desplazaba demasiado los embeddings (coseno aproximado de 0,96) y por eso no se ofrece. El script de exportación (`export_clap_onnx.py`) se distribuye con licencia Apache-2.0.

## Capacidades

- Clasificación de audio zero-shot: puntuar un clip contra etiquetas en lenguaje natural mediante `softmax(logit_scale * audio_embedding @ text_embeddings.T)`, con `logit_scale` = 33,3795.
- Extracción de embeddings de audio: vector float32 de `[batch, 1024]`, L2-normalizado.
- Extracción de embeddings de texto: vector float32 de `[batch, 1024]`, L2-normalizado.
- Recuperación audio-texto y texto-audio por similitud coseno en el espacio compartido.
- Inferencia sin PyTorch mediante onnxruntime.
- Ejecución en CPU (la validación de paridad se hizo con torch 2.5.1+cpu).
- No soporta generación de texto, tool calling, agentes, visión, audio-a-texto generativo ni razonamiento multi-paso.

## Casos de uso

- Clasificación de eventos sonoros en producción: dado un clip de 7 s, puntuar contra una lista de etiquetas redactadas en lenguaje natural ("This is a sound of a dog barking.") y devolver la de mayor probabilidad, sin entrenar un clasificador específico.
- Etiquetado automático de archivos de audio en un pipeline de datos: calcular el embedding de cada clip y asignar categorías por similitud con un vocabulario de etiquetas, útil para organizar corpus de entrenamiento o archivos multimedia.
- Búsqueda semántica de audio: indexar embeddings de audio de una biblioteca y recuperar clips a partir de una consulta de texto, gracias al espacio compartido de 1024 dimensiones.
- Moderación o triaje de contenido sonoro: detectar categorías de interés (voz, música, ruido, tonos) en flujos de audio antes de un análisis más costoso.
- Despliegue en entornos sin PyTorch: servicios en contenedores ligeros o funciones serverless donde instalar PyTorch es inviable, usando onnxruntime y la variante int8 del grafo de audio para reducir el coste de cómputo.
- Verificación de calidad de grabaciones: comparar el embedding de una muestra con etiquetas esperadas para detectar desviaciones (por ejemplo, ruido o estática frente a voz) en un control de calidad automatizado.
- Prototipado de investigación en representaciones audio-texto: usar los embeddings como entrada para clasificadores ligeros o para análisis de similitud sin gestionar el stack de PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí publica una tabla de paridad entre los grafos ONNX y el original en PyTorch, medida sobre tres clips de voz y tres sintéticos contra 15 etiquetas:

| Metrica | Grafos fp32 | Grafo de audio int8 |
|---|---|---|
| Diferencia maxima absoluta, embedding de audio | 3,3e-06 | 9,0e-03 |
| Coseno minimo respecto a PyTorch, embedding de audio | 1,000000 | 0,996406 |
| Diferencia maxima absoluta, embedding de texto | 1,2e-07 | no aplica (grafo de texto en fp32) |
| Diferencia maxima absoluta, probabilidades de etiqueta | 2,2e-05 | 2,0e-02 |
| Etiqueta top coincidente | 6 de 6 | 6 de 6 |

Etiqueta top por clip (PyTorch / ONNX fp32): voz femenina 0,7564 en `en-short`, voz femenina 0,8283 en `hi-short`, voz masculina 0,7439 en `en-long`, estática 0,5502 en `music`, ruido blanco 0,5009 en `noise` y tono puro 0,9871 en `tone`. Los números completos están en `parity.json`.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio completo ocupa 0,7 GB, lo que da una cota superior del orden de magnitud para cargar los grafos en memoria; la variante int8 del grafo de audio reduce el peso de las matrices de esa torre.
- GPU recomendadas: no disponibles. El autor valida la paridad en CPU (torch 2.5.1+cpu), de modo que la ejecución en CPU es un escenario soportado.
- GPU de consumo: no hay datos publicados sobre comportamiento en RTX 4090 u otras GPU de consumo; dado el tamaño del artefacto, es plausible que quepa en cualquier GPU con varios GB de memoria, pero no está confirmado en la información disponible.
- Opciones de despliegue: onnxruntime (CPU o GPU), sin PyTorch. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, que además no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| msclap-2023-onnx (este) | no disponible | 7 s de audio / 77 tokens | ONNX | MS-PL | Exportación no oficial, sin PyTorch, variante int8 de audio |
| microsoft/msclap (original) | no disponible | 7 s de audio / 77 tokens | PyTorch | MS-PL | Modelo base; requiere PyTorch |
| Alternativas de audio zero-shot (p. ej. otros CLAP o modelos audio-texto) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- No es una versión oficial de los autores originales; es una exportación de terceros (codebucketsolutions) y debe validarse antes de usarla en producción.
- El campo `inference: false` aparece en los metadatos de la model card, por lo que la inferencia automática en la plataforma Hugging Face no está habilitada.
- Ventana de audio fija de 7 s: los clips más largos requieren trocear en ventanas y promediar embeddings, lo que puede diluir eventos puntuales.
- La torre de texto no se ofrece en int8; solo el grafo de audio tiene variante cuantizada.
- La cuantización int8 del audio introduce una diferencia máxima de 2,0e-02 en probabilidades de etiqueta y un coseno mínimo de 0,996406 frente a PyTorch; aceptable para clasificación gruesa, pero a tener en cuenta en tareas sensibles.
- No se declara lista de idiomas soportados; el comportamiento multilingüe de la torre de texto no está documentado en esta ficha.
- Riesgo de sesgo y alucinación: no hay información publicada en la model card sobre sesgos del dataset de 4,6 millones de pares audio-texto ni sobre calibración de probabilidades fuera de la distribución de entrenamiento.
- La licencia MS-PL aplica a los pesos; el código original en github.com/microsoft/CLAP es MIT y el script de exportación es Apache-2.0. Conviene revisar las condiciones de MS-PL para uso comercial.
- El tokenizador GPT-2 es de OpenAI (MIT); la atribución debe mantenerse.
- No hay datos publicados de latencia ni throughput, por lo que el dimensionamiento de producción debe medirse empíricamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/codebucketsolutions/msclap-2023-onnx
- Modelo base: https://huggingface.co/microsoft/msclap
- Código original de Microsoft CLAP: https://github.com/microsoft/CLAP
- Paper de referencia: Elizalde, Deshmukh y Wang, "Natural Language Supervision for General-Purpose Audio Representations" (2023); enlace directo no disponible en la información proporcionada.
