# mflux-community/fibo-2-0-dev-mflux-q3

## Resumen

Fibo-2.0-dev MFlux Q3 es una conversión comunitaria del modelo de generación de imágenes texto-a-imagen Fibo-2.0-dev de Bria AI, adaptada para ejecutarse de forma nativa en Apple Silicon mediante MLX y la herramienta MFlux. El repositorio, publicado por mflux-community, distribuye los pesos originales cuantizados a 3 bits (Q3) en formato MLX, reduciendo el tamaño del modelo a 5,6 GB frente a los 25,1 GB de la versión BF16. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos solo han sido convertidos y cuantizados, por lo que las capacidades y limitaciones del modelo original se mantienen.

La relevancia de esta ficha radica en que permite ejecutar un modelo de difusión de última generación en hardware de consumo de Apple (MacBook con chip M-series) sin necesidad de GPUs dedicadas NVIDIA ni de servicios en la nube. La cuantización Q3 es la más agresiva de la familia MFlux disponible para este modelo, lo que la hace adecuada para equipos con memoria unificada limitada, a costa de una posible pérdida de fidelidad en la generación.

La información pública disponible es escasa: la model card del repositorio solo documenta el proceso de conversión, los comandos de uso y la licencia heredada, sin detallar la arquitectura interna, el dataset de entrenamiento ni resultados de benchmarks. Esta ficha refleja esa limitación de forma explícita.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión texto-a-imagen, según pipeline_tag) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen, no de contexto textual) |
| Tipos de cuantización | Q3 (MLX affine quantization, 3 bits) sobre text encoder, transformer y VAE; familia disponible en BF16, Q8, Q6, Q5, Q4 y Q3 |
| Idiomas soportados | no disponible |
| Licencia | fibo-2.0-dev-license (other) |
| Formato de pesos | safetensors en MLX (mlx, apple-silicon) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo original Fibo-2.0-dev en la documentación proporcionada. Por el pipeline declarado (text-to-image) y por la descripción de la cuantización, se trata de un modelo generativo de imágenes compuesto por al menos tres componentes: un text encoder, un transformer de difusión y un VAE. La conversión MFlux aplica cuantización afín de 3 bits de MLX a los tres componentes, y el nivel de cuantización queda almacenado en los propios pesos, de modo que no es necesario pasar el flag `--quantize` en tiempo de inferencia.

No hay datos disponibles sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas del modelo original. La conversión fue realizada con MFlux 0.23.0 el 25 de octubre de 2026 por el equipo MFlux-Community, y no constituye una release oficial de los autores originales de Bria AI. Cualquier detalle sobre el entrenamiento debe consultarse en la model card del modelo base.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) con resolución configurable; el ejemplo de la model card usa 1024x1024.
- Control de semilla (`--seed`) para reproducibilidad de las generaciones.
- Ejecución local nativa en Apple Silicon mediante MLX, sin dependencia de CUDA ni de servicios en la nube.
- Cuantización integrada en los pesos: no requiere flags adicionales de cuantización en la inferencia.
- Soporte de descarga automática de pesos desde HuggingFace en el primer uso, o descarga manual con `hf download` para uso offline.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking; se trata de un modelo puramente generativo de imágenes.

## Casos de uso

- Generación de ilustraciones y concept art en local: un diseñador puede ejecutar el modelo en un MacBook con chip M-series para iterar sobre prompts sin coste por API ni envío de datos a terceros, usando el flag `--seed` para reproducir variantes concretas.
- Prototipado rápido de assets para videojuegos o aplicaciones: la resolución configurable (por ejemplo 1024x1024) y la ejecución local permiten generar bocetos de personajes, entornos o iconos en un pipeline de diseño iterativo.
- Generación de imágenes en entornos con requisitos de privacidad: al ejecutarse íntegramente en el dispositivo, los prompts y las imágenes no salen del equipo, lo que encaja en flujos de trabajo con datos sensibles o bajo cumplimiento estricto.
- Pruebas de concepto y experimentación con modelos de difusión: investigadores sin acceso a GPUs NVIDIA pueden evaluar el comportamiento cualitativo de un modelo de última generación en hardware Apple, comparando las distintas cuantizaciones (Q3 a BF16) disponibles en la familia MFlux.
- Creación de contenido para blogs y documentación técnica: generación de imágenes de cabecera o ilustrativas a partir de descripciones textuales, con control de dimensiones y semilla para mantener coherencia entre iteraciones.
- Automatización de generación por lotes en scripts locales: la interfaz de línea de comandos `mflux-generate-fibo2` permite invocar el modelo desde scripts o pipelines de CI locales para producir conjuntos de imágenes de forma desatendida.
- Educación y demos: permite mostrar en un portátil Apple cómo funciona un modelo de difusión texto-a-imagen de última generación, sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas de calidad de imagen (FID, CLIP score, etc.) ni comparaciones con el modelo original en BF16, por lo que no es posible cuantificar la pérdida de fidelidad introducida por la cuantización Q3.

## Requisitos de hardware

- Tamaño del repositorio: 5,6 GB (pesos Q3). La inferencia requiere cargar además los buffers de activación y el VAE, por lo que la memoria unificada necesaria es superior al tamaño de los pesos.
- Hardware objetivo: Apple Silicon (MLX). No es compatible de forma nativa con GPUs NVIDIA ni con CUDA; requeriría otras conversiones (por ejemplo, GGUF o diffusers) para esas plataformas.
- GPU recomendadas: chips Apple M-series con memoria unificada suficiente; no se especifica un mínimo exacto en la documentación. Como referencia, la familia MFlux ofrece Q4 (7,2 GB) y Q5 (8,8 GB) para equipos con más memoria.
- ¿Cabe en GPU de consumo? Sí, en el contexto de Apple Silicon de consumo; la versión Q3 es la más ligera de la familia y está pensada para equipos con memoria limitada.
- Opciones de despliegue: MFlux (`mflux-generate-fibo2`), instalable con `uv tool install --upgrade mflux`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato MLX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Cuantización | Tamaño | Plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fibo-2-0-dev-mflux-q3 (este) | Q3 (3 bits) | 5,6 GB | Apple Silicon (MLX) | fibo-2.0-dev-license | HuggingFace, 54 descargas |
| fibo-2-0-dev-mflux-q4 | Q4 | 7,2 GB | Apple Silicon (MLX) | fibo-2.0-dev-license | HuggingFace |
| fibo-2-0-dev-mflux-q8 | Q8 | 13,4 GB | Apple Silicon (MLX) | fibo-2.0-dev-license | HuggingFace |
| fibo-2-0-dev-mflux-bf16 | BF16 | 25,1 GB | Apple Silicon (MLX) | fibo-2.0-dev-license | HuggingFace |
| briaai/Fibo-2.0-dev (original) | BF16 (presumiblemente) | no disponible | no disponible | fibo-2.0-dev-license | HuggingFace |

No se dispone de información sobre otros modelos texto-a-imagen comparables (por ejemplo, de otras familias) en la documentación proporcionada, ni de datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- La cuantización Q3 es la más agresiva de la familia y puede degradar la calidad y fidelidad de las imágenes generadas frente a BF16, Q8 o Q6; no se han publicado métricas que cuantifiquen esa pérdida.
- Es una conversión comunitaria, no una release oficial de Bria AI; los autores originales no la han validado.
- La licencia `fibo-2.0-dev-license` es de tipo "other" y debe consultarse en la model card del modelo base para conocer las restricciones de uso comercial; no se detallan en el repositorio de la conversión.
- Solo funciona en Apple Silicon mediante MLX; no es portable a CUDA sin una conversión adicional.
- No se documentan idiomas soportados para los prompts, sesgos conocidos ni tasas de alucinación visual.
- El modelo es de generación de imágenes: no soporta tool calling, agentes, razonamiento textual ni otras capacidades de los LLM.
- El repositorio tiene muy poca tracción (54 descargas, 0 likes) y fue creado en octubre de 2026; la comunidad y el soporte son limitados.
- La información sobre arquitectura, entrenamiento y rendimiento es inexistente en la documentación disponible, lo que dificulta evaluar su idoneidad para producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mflux-community/fibo-2-0-dev-mflux-q3
- Modelo base original: https://huggingface.co/briaai/Fibo-2.0-dev
- Repositorio MFlux: https://github.com/filipstrand/mflux
- Organización MFlux-Community: https://huggingface.co/mflux-community
- Versión BF16: https://huggingface.co/mflux-community/fibo-2-0-dev-mflux-bf16
- Versión Q8: https://huggingface.co/mflux-community/fibo-2-0-dev-mflux-q8
- Versión Q6: https://huggingface.co/mflux-community/fibo-2-0-dev-mflux-q6
- Versión Q5: https://huggingface.co/mflux-community/fibo-2-0-dev-mflux-q5
- Versión Q4: https://huggingface.co/mflux-community/fibo-2-0-dev-mflux-q4
