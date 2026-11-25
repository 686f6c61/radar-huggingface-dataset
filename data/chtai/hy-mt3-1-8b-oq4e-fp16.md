# chtai/Hy-MT3-1.8B-oQ4e-fp16

## Resumen

Hy-MT3-1.8B-oQ4e-fp16 es una versión cuantizada del modelo denso Hy-MT3-1.8B, publicada por el usuario chtai en Hugging Face. Se trata de un checkpoint de 1.791.080.448 parámetros (aproximadamente 1,8 mil millones) convertido a formato MLX mediante la herramienta oQ (oMLX v0.8.3), que aplica cuantización de precisión mixta. El resultado es un artefacto de 1,1 GB con un promedio efectivo de 4,801 bits por peso, pensado para su ejecución en hardware Apple Silicon a través del framework MLX.

El modelo base pertenece a la familia Hunyuan (tag `hunyuan_v1_dense`), lo que sitúa su origen en el linaje de modelos desarrollados por Tencent. La nomenclatura "MT" sugiere un modelo orientado a traducción automática, aunque esta información no está confirmada en la documentación disponible. La ficha del autor no incluye model card descriptiva del modelo original, sino únicamente los metadatos de la cuantización.

La relevancia de esta publicación es fundamentalmente práctica: permite ejecutar un modelo de 1,8B parámetros en equipos con memoria unificada modesta (Mac con 8-16 GB de RAM) manteniendo una calidad cercana a FP16 gracias a la asignación selectiva de bits. No obstante, la ausencia de información sobre licencia, idiomas, benchmarks y capacidades limita seriamente su evaluación para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia `hunyuan_v1_dense`) |
| Parametros totales | 1.791.080.448 (1,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Precisión mixta oQ: affine 4-bit (72,36% de pesos), 5-bit (25,29%), 6-bit (2,34%), FP16 (0,008%); grupo 64; media efectiva 4,801 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (MLX), cuantización oQ |
| Tamano del repo | 1,1 GB |
| Libreria de inferencia | MLX |
| Fecha de publicacion | 2026-11-25 |

## Arquitectura y entrenamiento

La arquitectura del modelo base corresponde a un transformer denso identificado por el tag `hunyuan_v1_dense`, es decir, la variante densa de la primera generación de la familia Hunyuan. No se dispone de información sobre el número de capas, dimensión oculta, número de cabezas de atención ni sobre la composición del dataset de entrenamiento, el volumen de tokens utilizados o si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documenta ninguna innovación arquitectónica específica (atención lineal, decodificación especulativa, SSM híbrido, etc.).

La contribución técnica documentada se limita al proceso de cuantización. oQ (oMLX v0.8.3) asigna precisiones distintas por tensor según su sensibilidad: la mayor parte de los pesos (72,36%) se almacenan en 4 bits con grupo de 64, un cuarto (25,29%) se eleva a 5 bits y un 2,34% recibe 6 bits, presumiblemente en capas críticas para preservar calidad. Solo un 0,008% de los pesos permanece en FP16. El checkpoint final ocupa 1,001 GiB, con un promedio de 4,801 bits por peso, un compromiso entre tamaño y fidelidad respecto al modelo original.

## Capacidades

- Generación de texto autoregresiva estándar, propia de un transformer denso de 1,8B parámetros.
- Presunta orientación a traducción automática por la nomenclatura "MT" del modelo base, aunque no confirmada en la documentación.
- Soporte multilingüe: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.
- Ejecución nativa en Apple Silicon mediante MLX.

## Casos de uso

- Traducción automática local en equipos Mac: si se confirma la orientación MT del modelo base, podría emplearse para traducir documentos o conversaciones en local sin conexión, aprovechando el reducido tamaño de 1,1 GB y la aceleración de MLX en chips M-series.
- Prototipado rápido en portátiles Apple: investigadores pueden cargar el modelo en un MacBook con 8-16 GB de memoria unificada para experimentar con generación de texto sin necesidad de GPU dedicada.
- Asistentes conversacionales ligeros en el borde: el tamaño reducido permite integrar el modelo en aplicaciones de escritorio para macOS que requieran respuestas de baja latencia sin enviar datos a la nube.
- Filtrado y clasificación de texto: tareas de etiquetado, resumen o extracción de entidades en pipelines locales donde la privacidad de los datos es prioritaria.
- Evaluación comparativa de cuantización: útil como referencia para estudiar el impacto de la cuantización mixta oQ frente a FP16 en modelos de ~2B parámetros.
- Generación de borradores y autocompletado en editores: integrable en herramientas de escritura para macOS mediante la librería MLX, con consumo de memoria contenido.
- Fine-tuning ligero o destilación: al ser un checkpoint pequeño, puede servir como base para adaptaciones con LoRA en hardware de consumo, siempre que la licencia lo permita (actualmente desconocida).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,1-1,5 GB para los pesos en 4,801 bits efectivos, más overhead de activaciones y caché KV (dependiente de la longitud de contexto, no documentada). En la práctica, entre 2 y 4 GB de memoria unificada para contextos moderados.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) por el uso de MLX. No es compatible de forma nativa con CUDA sin conversión previa.
- Cabe holgadamente en cualquier Mac con 8 GB de memoria unificada o superior.
- Opciones de despliegue: `mlx-lm` (librería oficial de MLX para modelos de lenguaje). No se distribuye en GGUF, por lo que llama.cpp u Ollama requerirían una conversión manual no documentada.
- Latencia y throughput: no disponibles. En un chip M1/M2 se puede esperar una generación interactiva (decenas de tokens por segundo) dado el tamaño del modelo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Hy-MT3-1.8B-oQ4e-fp16 | 1,8B | No disponible | No disponible | safetensors MLX (oQ) | Cuantización mixta 4,801 bits; solo MLX |
| Qwen2.5-1.5B-Instruct (referencia) | 1,5B | 32K | Apache 2.0 | safetensors, GGUF | Ampliamente documentado, multilingüe |
| Llama 3.2 1B Instruct (referencia) | 1,2B | 128K | Llama 3.2 Community | safetensors, GGUF | Ecosistema amplio, tool calling |
| Gemma 2 2B (referencia) | 2,6B | 8K | Gemma Terms | safetensors, GGUF | Buen rendimiento en razonamiento ligero |

La comparación es orientativa: no se dispone de benchmarks del modelo Hy-MT3 que permitan contrastar calidad frente a estas alternativas. La principal desventaja del modelo evaluado es la falta de documentación sobre licencia, idiomas y capacidades, mientras que su ventaja es el tamaño extremadamente compacto en formato MLX.

## Limitaciones y advertencias

- Ausencia total de model card descriptiva: no se documentan capacidades, idiomas, contexto ni datos de entrenamiento del modelo base.
- Licencia no especificada: no es posible determinar si se permite uso comercial; desaconsejado en producción hasta aclararlo.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento, no se pueden evaluar sesgos de género, raza, idioma o dominio.
- Riesgo de alucinación: inherente a modelos de 1,8B parámetros, especialmente en tareas de razonamiento o conocimiento factual; la cuantización a 4 bits puede agravarlo en capas sensibles.
- Limitaciones de contexto e idioma: no disponibles; probablemente inferiores a las de modelos más grandes de la competencia.
- Compatibilidad restringida: el formato MLX limita su uso a hardware Apple Silicon; no hay versión GGUF ni safetensors estándar para PyTorch/CUDA.
- Sin métricas de calidad de la cuantización: el autor no publica comparativas de perplejidad o benchmarks frente al modelo original en FP16, por lo que se desconoce la degradación real introducida.
- Repositorio sin descargas ni likes: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chtai/Hy-MT3-1.8B-oQ4e-fp16
- Herramienta oQ / oMLX: https://github.com/jundot/omlx
- Librería MLX (Apple): https://github.com/ml-explore/mlx
- mlx-lm (inferencia de modelos de lenguaje en MLX): https://github.com/ml-explore/mlx-examples/tree/main/llms
