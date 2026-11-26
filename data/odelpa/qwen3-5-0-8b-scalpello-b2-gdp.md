# odelpa/qwen3.5-0.8b-scalpello-b2-gdp

## Resumen

qwen3.5-0.8b-scalpello-b2-gdp es una edición de pesos del modelo base Qwen/Qwen3.5-0.8B (873.438.784 parámetros) publicada por el investigador independiente Giovanni Del Papa (odelpa) bajo el paraguas del proyecto SCALPELLO-GDP. No es un fine-tuning ni un reentrenamiento: se trata de una única modificación en forma cerrada de un subconjunto de matrices de proyección de salida de la atención, derivada de una reflexión de Householder aplicada sobre una dirección unitaria del residual stream. El objetivo declarado es corregir el comportamiento de "recomprobación repetitiva" que provoca respuestas truncadas en tareas matemáticas.

La relevancia del artefacto es metodológica más que de rendimiento bruto: demuestra que una edición de pesos de ~25,2 millones de parámetros (aproximadamente el 3% del modelo) puede alterar de forma medible el comportamiento en matemáticas sin gradientes, sin optimizer y sin datos de entrenamiento adicionales. El autor reporta un salto del 9,38% al 53,65% en 384 problemas de matemáticas held-out emparejados (GSM8K train + MATH train), con 171 mejoras y 1 empeoramiento.

El modelo conserva la arquitectura, la torre visual y el resto de pesos del Qwen3.5-0.8B original bit a bit, con licencia Apache 2.0 y publicación en safetensors y GGUF. Está pensado para investigadores interesados en weight-space programming y model editing, no como sustituto generalista del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (Gated DeltaNet + atención completa) heredado de Qwen3.5-0.8B; edición sobre proyecciones de salida de atención |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (checkpoint), GGUF Q8_0 y bf16 en Ollama; fp16 para evaluación de forward |
| Idiomas soportados | en, it |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B emplea un transformer híbrido con capas Gated DeltaNet y capas de atención completa, además de una torre visual (pipeline image-text-to-text). La edición SCALPELLO-B2 actúa exclusivamente sobre las proyecciones de salida de atención: 9 matrices `linear_attn.out_proj.weight` en las capas 12, 13, 14, 16, 17, 18, 20, 21 y 22 (Gated DeltaNet) y 3 matrices `self_attn.o_proj.weight` en las capas 15, 19 y 23 (atención completa), sumando 25,2 millones de parámetros con una variación relativa del 6,6–9,2% por tensor.

No hubo entrenamiento. El proceso consistió en que un modelo de frontera (`gpt-6-astra`, usado solo como editor vía API, no como profesor) escribiera código Python ejecutado en un kernel CPU sin red que contenía los pesos del modelo y podía solicitar forward passes sobre una Tesla T4 local (16 GB, fp16, 25 pasadas, límite de 8.192 tokens). La dirección unitaria u ∈ R^1024 se obtuvo como diferencia de medias en un único pase teacher-forced sobre 3 pares de textos (continuación productiva frente a repetitiva "Wait…"), tomando el hidden state de índice 20 y promediando los últimos 80 tokens, con proyección ortogonal respecto al estado productivo normalizado. La transformación aplicada es W' = (I − 2uuᵀ)W, ortogonal y por tanto conservadora de la norma de Frobenius de cada matriz. El kernel se ejecutó con `torch.set_grad_enabled(False)` y sin optimizer, fitting, PCA ni SVD. La selección entre 12 ediciones candidatas y un control con dirección aleatoria se hizo sobre 32 problemas de desarrollo; una edición solo MLP empeoró 9,4 puntos.

## Capacidades

- Generación de texto conversacional en inglés e italiano.
- Razonamiento matemático: el autor reporta mejora sustancial en problemas de GSM8K train y MATH train respecto al modelo base.
- Procesamiento image-text-to-text (la torre visual se conserva intacta bit a bit).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües limitadas a en e it según los metadatos.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación en weight-space programming: replicar o auditar la edición B2 sobre Qwen3.5-0.8B para estudiar cómo una reflexión de Householder en el residual stream altera el comportamiento de decodificación sin reentrenar.
- Estudio de model editing en producción controlada: comparar el modelo editado con el base en tareas de matemáticas para medir el efecto de una intervención de ~3% de los parámetros sobre el resto de capacidades.
- Evaluación de robustez ante ediciones de pesos: usar el checkpoint como caso de prueba en pipelines de validación que detecten regresiones en generación de texto, visión o idiomas distintos del inglés e italiano.
- Despliegue ligero en local con Ollama: el tag Q8_0 (834 MB) permite ejecutar el modelo en portátiles y estaciones de trabajo sin GPU dedicada para experimentos de razonamiento matemático acotado.
- Reproducción de resultados académicos: servir el modelo vía transformers o Ollama para verificar el salto 9,38% → 53,65% reportado sobre los 384 problemas held-out emparejados.
- Docencia y divulgación sobre edición de modelos: el tamaño reducido (873M parámetros) y la naturaleza cerrada de la edición lo hacen adecuado para demostrar conceptos de álgebra lineal aplicada a pesos en cursos avanzados.
- Pruebas de concepto de asistentes matemáticos en italiano: el modelo declara soporte de italiano y matemáticas, lo que permite prototipar tutores de resolución de problemas en ese idioma.

## Benchmarks y rendimiento

| Benchmark | Modelo base (Qwen3.5-0.8B) | Modelo editado (SCALPELLO-B2) | Delta |
|---|---|---|---|
| 384 problemas held-out emparejados (GSM8K train + MATH train) | 9,38% | 53,65% | +44,27 puntos |
| Mejoras / empeoramientos sobre los 384 problemas | — | 171 mejorados, 1 empeorado | — |
| Edición solo MLP (control, 32 problemas de desarrollo) | — | −9,4 puntos frente al base | — |

No se han publicado resultados de MMLU, HumanEval, GSM8K estándar ni otros benchmarks en la información disponible. Los datos anteriores provienen exclusivamente de la model card del autor y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,6 GB para los pesos (tamaño del tag bf16 en Ollama), más overhead de activaciones y contexto.
- VRAM estimada en Q8_0: aproximadamente 834 MB para los pesos, más overhead.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para Q8_0; el autor realizó los forward passes de edición en una Tesla T4 de 16 GB en fp16.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, incluso en configuraciones de baja VRAM gracias a la cuantización Q8_0.
- Opciones de despliegue: transformers (librería declarada), Ollama (tags `latest`/`q8_0` y `bf16`), GGUF para llama.cpp; vLLM y TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| odelpa/qwen3.5-0.8b-scalpello-b2-gdp | 873.438.784 | no disponible | apache-2.0 | safetensors, GGUF | Edición de pesos en forma cerrada; 53,65% en 384 problemas held-out según el autor |
| Qwen/Qwen3.5-0.8B (base) | no disponible en la información | no disponible | no disponible en la información | safetensors | Modelo de partida; 9,38% en el mismo conjunto según el autor |
| Alternativas de ~1B parámetros | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos comparativos de otros modelos en la información disponible |

## Limitaciones y advertencias

- Los resultados de mejora (9,38% → 53,65%) proceden únicamente de la model card del autor y no han sido replicados de forma independiente; deben tratarse como no verificados.
- La evaluación se realizó sobre 384 problemas emparejados de GSM8K train y MATH train, no sobre los conjuntos de test oficiales, lo que limita la comparabilidad con cifras publicadas de otros modelos.
- El proceso de selección de la edición usó solo 32 problemas de desarrollo y 3 pares de textos para derivar la dirección u; el riesgo de sobreajuste a esa muestra reducida no está cuantificado en la información disponible.
- El modelo solo declara soporte de inglés e italiano; no hay datos sobre comportamiento en castellano ni en otros idiomas.
- No se han publicado evaluaciones de regresión en generación de texto general, visión, tool calling o agentes tras la edición; el resto de capacidades podría haberse visto afectado de forma no medida.
- La edición se aplicó en bf16 y los forward se evaluaron en fp16, con un redondeo relativo de aproximadamente 0,16% en los tensores editados; pequeñas diferencias numéricas entre precisiones son esperables.
- Riesgo de alucinación: no cuantificado en la información disponible; el modelo base es de 0,8B parámetros y cabe esperar las limitaciones típicas de esa escala.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo editado en producción.
- El modelo está pensado como artefacto de investigación en edición de pesos; no se recomienda como sustituto generalista del Qwen3.5-0.8B base sin una evaluación propia.

## Enlaces

- Hugging Face: https://huggingface.co/odelpa/qwen3.5-0.8b-scalpello-b2-gdp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Artículo v1.1 en Zenodo: https://zenodo.org/records/24422781
- DOI v1.1: https://doi.org/10.5281/zenodo.24422781
- DOI de todas las versiones: https://doi.org/10.5281/zenodo.24416417
- Versión 1.0: https://zenodo.org/records/24416418
- DOI versión 1.0: https://doi.org/10.5281/zenodo.24416418
- PDF en italiano: https://zenodo.org/records/24422781/preview/scalpello_article_IT.pdf
- PDF en inglés: https://zenodo.org/records/24422781/preview/scalpello_article_EN.pdf
- PDF bilingüe IT+EN: https://zenodo.org/records/24422781/preview/scalpello_article_IT_EN.pdf
- Ollama: https://ollama.com/ollamagdp/qwen3.5-0.8b-scalpello-b2-gdp
- Publicaciones del autor: https://odelpa-pubblicazioni.static.hf.space
- Post en X (v1.1): https://x.com/Giovannivk8y/status/2124183195490886002
- Post en X (v1.0): https://x.com/Giovannivk8y/status/2124166148472135891
- LinkedIn: https://www.linkedin.com/feed/update/urn:li:activity:7529935580227338240/
- Facebook: https://www.facebook.com/giovanni.delpapa/posts/pfbid036jmA4skoWJ9vW1Kjnr9a5pNYP53znzR8J9hiASCstAtEQ3V2Fbny8QCR4RxZcCLql
- Instagram: https://www.instagram.com/delpajhonny/p/DgAlfOpBvmE/
