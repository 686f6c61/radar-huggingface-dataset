# flashrt/transformer-fused-ops

## Resumen

El repositorio `flashrt/transformer-fused-ops` no contiene un modelo de IA entrenado, sino una biblioteca de kernels CUDA nativos fusionados para acelerar los puntos calientes (hot paths) de los transformadores. Desarrollado por el usuario flashrt, este proyecto ofrece una colección de operaciones de bajo nivel —normalización, RoPE, cuantización FP8, atención con MoE, etc.— diseñadas para runtimes de buffers estáticos y compatibles con CUDA Graphs. Su relevancia radica en que permite optimizar la inferencia de modelos grandes al fusionar operaciones y reducir la sobrecarga de lanzamiento de kernels, especialmente en hardware moderno de NVIDIA.

La biblioteca incluye funciones para BF16 y FP16, con soporte explícito para cuantización estática FP8 E4M3 y operaciones específicas para arquitecturas como GROOT N1.7 Thor y PI0.5/SigLIP. No se trata de un modelo con pesos, sino de un conjunto de herramientas para desarrolladores que buscan maximizar el rendimiento en entornos de producción con requisitos estrictos de latencia y memoria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Kernels CUDA fusionados para transformadores (no es un modelo) |
| Parámetros totales | no disponible (no aplica, es código fuente) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantización | FP8 E4M3 estática, BF16, FP16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no aplica (código fuente CUDA, sin pesos) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado; es una colección de kernels CUDA escritos en C++/CUDA que implementan operaciones fusionadas. Las funciones cubren normalización (RMSNorm, LayerNorm), rotación de RoPE, cuantización FP8 estática, activaciones GELU/GeGLU, operaciones de MoE (router top-k, weighted sum), y expansión de cabezas GQA. Los kernels están diseñados para buffers estáticos y son compatibles con CUDA Graph replay, lo que permite reducir la latencia de lanzamiento en inferencias repetitivas.

No hay información sobre entrenamiento, datos o proceso de optimización, ya que no se trata de un modelo de aprendizaje automático. La documentación menciona que las funciones FP16 vectoriales son el camino nativo para GROOT N1.7 Thor, y las BF16 para PI0.5 prefill y SigLIP, pero no se detalla el proceso de desarrollo más allá de la implementación de los kernels.

## Capacidades

- Normalización RMSNorm y LayerNorm con soporte para FP16 y BF16, incluyendo variantes vectoriales (`_vec`) para descubrimiento de capacidades.
- RoPE con rotación de media mitad (`rope_rotate_half_fp16_` y variante vectorial).
- Cuantización estática FP8 E4M3 con escala fija, incluyendo fusiones con activaciones (ReLU cuadrado, GeGLU) y normalización.
- Operaciones de MoE: router top-k determinista, suma ponderada de expertos con acumulación en FP32.
- Expansión de cabezas para GQA (`repeat_interleave_heads_fp16`).
- Adición residual en FP16.
- Embedding lookup en BF16.
- Argmax y aceptación especulativa (`spec_accept_greedy_bf16`).
- Requiere arquitectura SM110 (NVIDIA Blackwell) y CUDA 13 para la familia FP16 y BF16; arquitecturas no soportadas fallan antes del lanzamiento.

## Casos de uso

- Optimización de inferencia de LLMs en producción: los kernels fusionados reducen el número de lanzamientos de CUDA y la sobrecarga de memoria, ideal para servir modelos grandes con baja latencia.
- Implementación de CUDA Graphs en servidores de inferencia: las funciones con `out=` estático permiten grabar y reproducir gráficos de cómputo, mejorando el rendimiento en cargas repetitivas.
- Aceleración de prefill en modelos MoE: `router_topk_bf16` y `moe_weighted_sum_bf16_to_fp32` agilizan el enrutamiento y la agregación de expertos.
- Integración en pipelines de visión-lenguaje: las funciones para SigLIP y ViT (normalización, RoPE, cuantización) pueden acelerar modelos multimodales.
- Desarrollo de runtimes de inferencia personalizados: la API de tensores está pensada para motores que gestionan buffers estáticos, como los usados en despliegues de alto rendimiento.
- Experimentación con cuantización FP8: las funciones de cuantización estática permiten probar esquemas de precisión mixta sin implementar kernels propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de rendimiento comparativas ni mediciones de throughput o latencia.

## Requisitos de hardware

- Arquitectura mínima: SM110 (NVIDIA Blackwell) para las familias FP16 y BF16; arquitecturas anteriores no son compatibles.
- CUDA 13 requerido.
- GPU recomendadas: aquellas con soporte SM110, como las de la serie Blackwell (p. ej., B200, RTX 50 series, según disponibilidad).
- No se especifican requisitos de VRAM, ya que no hay pesos de modelo; la memoria depende de los buffers que el usuario gestione.
- Opciones de despliegue: integración directa en código CUDA/C++, o mediante wrappers de Python si se compila como extensión. No se mencionan integraciones con vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA comparable con otros modelos; es una biblioteca de kernels. No existen alternativas equivalentes en la información proporcionada.

## Limitaciones y advertencias

- Requiere hardware específico (SM110 y CUDA 13); no funcionará en GPUs más antiguas.
- No incluye pesos de modelo ni un pipeline de inferencia completo; es solo un conjunto de kernels de bajo nivel.
- La licencia no está especificada, lo que puede limitar su uso comercial sin aclaración legal.
- Las formas no soportadas fallan explícitamente, pero no hay documentación sobre los límites exactos.
- No hay garantía de soporte o mantenimiento, dado que el repositorio tiene 0 descargas y 0 likes.
- Las funciones están pensadas para buffers estáticos; su uso con tensores dinámicos puede requerir adaptaciones.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/flashrt/transformer-fused-ops
