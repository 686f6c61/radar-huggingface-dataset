# Marvideo/Lyse-336M

## Resumen

Lyse-336M es un modelo de lenguaje causal (decoder-only) entrenado desde cero por el usuario Marvideo, orientado al francés. Con aproximadamente 336 millones de parámetros y una arquitectura transformer clásica de 24 capas, está diseñado para generación de texto y tareas de modelado del lenguaje en francés. Su entrenamiento se realizó sobre el corpus completo de Wikipedia en francés e inglés, lo que le proporciona una base lingüística amplia aunque con un contexto limitado de 512 tokens.

La relevancia de este modelo reside en su carácter didáctico y experimental: al ser entrenado desde cero, sirve como ejemplo de cómo construir un modelo de lenguaje pequeño con recursos modestos, sin depender de pesos preentrenados de otras arquitecturas. Sin embargo, su utilidad práctica se ve limitada por la ventana de contexto corta (512 tokens) y por no ser extrapolable a secuencias más largas, además de que su arquitectura personalizada dificulta su integración con las bibliotecas estándar del ecosistema HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 24 capas, d_model=1024, 16 cabezas de atencion, feed-forward=4096 |
| Parametros totales | ~336M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (posiciones aprendidas, no extrapolable) |
| Tipos de cuantizacion | no disponible (solo se proporciona checkpoint en bf16) |
| Idiomas soportados | Frances (principal), con exposicion al ingles durante el entrenamiento |
| Licencia | other (no especificada) |
| Formato de pesos | Checkpoint PyTorch (.pt) con arquitectura custom, no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only convencional: 24 capas con d_model=1024, 16 cabezas de atencion y una capa feed-forward de dimension 4096. Los embeddings de entrada y salida estan ligados (tied embeddings), lo que reduce el numero de parametros. El tokenizer es el de camembert-base, basado en SentencePiece Unigram con un vocabulario de 32005 tokens. El contexto maximo es de 512 tokens con posiciones aprendidas, por lo que no es posible extrapolar a secuencias mas largas.

El pre-entrenamiento se realizo sobre el texto completo de Wikipedia en frances e ingles (sin truncado de documentos), utilizando precision mixta bf16 y gradient checkpointing para optimizar el uso de memoria. No se menciona el numero exacto de tokens de entrenamiento ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El checkpoint disponible incluye el tokenizer y los pesos del modelo en un unico archivo .pt.

## Capacidades

- Generacion de texto en frances: el modelo es capaz de producir texto coherente en frances, dado que fue entrenado en un corpus extenso de Wikipedia en ese idioma.
- Modelado del lenguaje causal: al ser decoder-only, puede predecir la siguiente palabra en una secuencia, lo que permite completar frases o generar texto continuo.
- Exposicion al ingles: aunque el modelo esta orientado al frances, el corpus de entrenamiento incluye ingles, por lo que puede generar texto en ingles con menor calidad.
- No se mencionan capacidades de tool calling, function calling, razonamiento multi-paso, vision, audio ni modo de pensamiento explicito. Estas capacidades no estan disponibles segun la informacion proporcionada.

## Casos de uso

- Prototipado rapido de aplicaciones NLP en frances: al ser un modelo pequeno y entrenado desde cero, puede utilizarse para experimentar con generacion de texto o completado de frases en frances sin necesidad de grandes recursos computacionales.
- Investigacion academica sobre arquitecturas transformer: su codigo y checkpoint permiten estudiar el comportamiento de modelos pequeños entrenados desde cero, analizar metricas internas o probar tecnicas de fine-tuning.
- Generacion de contenido breve: puede emplearse para crear titulares, resumenes cortos o parrafos de ejemplo en frances, siempre que la longitud no supere los 512 tokens.
- Sistema de autocompletado basico: integrado en un editor de texto, puede sugerir la continuacion de una frase en frances, aunque con limitaciones de contexto y sin garantias de coherencia a largo plazo.
- Entrenamiento de modelos de clasificacion: mediante fine-tuning, podria adaptarse para tareas de clasificacion de texto en frances (sentimiento, tema, etc.), aunque no se proporcionan ejemplos ni garantias de rendimiento.
- Ensenanza y formacion en deep learning: su arquitectura sencilla y su checkpoint accesible lo convierten en un recurso util para demostrar el ciclo completo de entrenamiento de un modelo de lenguaje en un curso o taller.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K u otras metricas estandar para este modelo. Tampoco se proporcionan comparaciones con otros modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 700 MB en bf16 (336M parametros × 2 bytes) y 1,3 GB en FP32. Con el contexto de 512 tokens, el uso de memoria adicional es minimo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como una NVIDIA GTX 1650 o superior. Tambien puede ejecutarse en CPU, aunque con mayor latencia.
- Cabe en GPUs de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas de VRAM.
- Opciones de despliegue: al ser una arquitectura custom, no es compatible con vLLM, llama.cpp, Ollama ni TGI. Solo puede cargarse mediante el codigo Python proporcionado en la model card, usando PyTorch y el tokenizer de camembert-base.
- Latencia y throughput: no se han medido oficialmente. En una GPU como una RTX 3090, se espera una latencia de decenas de milisegundos por token, pero no hay datos confirmados.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables directamente. Como referencia general, existen otros modelos pequeños en frances como CamemBERT (110M, encoder-only) o FlauBERT (138M, encoder-only), pero son arquitecturas distintas y no se pueden comparar directamente en tareas generativas. Modelos decoder-only de tamano similar como GPT-2 pequeño (124M) estan entrenados principalmente en ingles y no comparten el mismo corpus ni tokenizer. Dado que Lyse-336M no tiene benchmarks publicados, una comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- Contexto muy limitado: la ventana de 512 tokens es corta para muchas aplicaciones reales, y las posiciones aprendidas impiden extrapolar a secuencias mas largas.
- Sesgos del corpus: al entrenarse unicamente con Wikipedia, el modelo puede reflejar los sesgos de ese corpus (sesgo enciclopedico, falta de lenguaje coloquial o tecnico especializado) y no generalizar bien a otros dominios.
- Riesgo de alucinacion: al ser un modelo pequeño sin fine-tuning adicional, puede generar texto incoherente o factualmente incorrecto, especialmente en temas fuera del ambito enciclopedico.
- Licencia "other" no especificada: la licencia no esta claramente definida, lo que introduce incertidumbre legal para uso comercial o redistribucion. Se recomienda contactar al autor antes de utilizarlo en produccion.
- Arquitectura custom: el modelo no se puede cargar con `transformers` estandar, lo que dificulta su integracion en pipelines existentes y limita el soporte de la comunidad.
- Solo frances e ingles parcial: no es multilingue y su rendimiento en ingles es probablemente inferior al de modelos dedicados a ese idioma.
- Sin garantias de calidad: no se proporcionan benchmarks ni evaluaciones, por lo que no hay evidencia objetiva de su rendimiento en tareas concretas.

## Enlaces

- Modelo en HuggingFace: [Marvideo/Lyse-336M](https://huggingface.co/Marvideo/Lyse-336M)
- No se encontraron otros enlaces relevantes (papers, repos, demos) en la busqueda web.
