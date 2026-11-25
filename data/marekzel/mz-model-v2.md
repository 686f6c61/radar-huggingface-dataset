# marekzel/mz-model-v2

## Resumen

MzModelV2 es un modelo de lenguaje experimental de tipo decoder-only Transformer, desarrollado por el usuario marekzel como segunda iteración del proyecto MzModel. Está construido desde cero con PyTorch y Hugging Face Transformers, con el objetivo de explorar mejoras arquitectónicas modernas en modelos de lenguaje de pequena escala entrenados en hardware de consumo. Cuenta con aproximadamente 110 millones de parámetros, una dimensión oculta de 768, 12 capas y 12 cabezas de atención.

El modelo incorpora varias técnicas arquitectónicas actuales respecto a su predecesor: Rotary Positional Embeddings (RoPE), RMSNorm, activación SwiGLU, proyecciones lineales sin sesgo y Scaled Dot Product Attention (SDPA). Mantiene el mismo vocabulario y tokenizador que MzModelV1 (32.000 tokens) para permitir comparaciones consistentes entre ambas versiones.

Su relevancia es fundamentalmente educativa y de investigación: demuestra que es posible disenar, entrenar y evaluar un modelo de lenguaje desde cero en una única GPU de consumo (NVIDIA RTX 5060 Ti con 16 GB de VRAM) en un entorno de laboratorio doméstico. No está pensado para competir con modelos de producción a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only Transformer |
| Parametros totales | Aproximadamente 110 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (transformers); no se especifican otros formatos |
| Dimension oculta | 768 |
| Numero de capas | 12 |
| Cabezas de atencion | 12 |
| Tamano de vocabulario | 32.000 |
| Normalizacion | RMSNorm |
| Activacion | SwiGLU |
| Codificacion posicional | RoPE (Rotary Positional Embeddings) |
| Atencion | Self-attention causal multi-cabeza con SDPA |
| Weight tying | Embeddings de entrada y proyeccion de salida compartidos |
| Hardware de entrenamiento | NVIDIA RTX 5060 Ti (16 GB VRAM) |
| Dataset de preentrenamiento | Wikipedia Structured (aproximadamente 7,6 millones de articulos) |
| Framework | PyTorch, Hugging Face Transformers |

## Arquitectura y entrenamiento

MzModelV2 es un Transformer decoder-only de escala reducida que moderniza el diseno de su predecesor. Las principales innovaciones arquitectónicas son: RoPE para codificar posiciones directamente en el mecanismo de atención, RMSNorm en lugar de LayerNorm, SwiGLU como función de activación en la red feed-forward, proyecciones lineales sin términos de sesgo en los bloques de atención y feed-forward, y SDPA de PyTorch para aprovechar implementaciones optimizadas de atención según el hardware disponible. Además, emplea weight tying entre los embeddings de entrada y la proyección de salida.

El entrenamiento se realiza desde cero en una única NVIDIA RTX 5060 Ti con 16 GB de VRAM, utilizando el dataset Wikipedia Structured con aproximadamente 7,6 millones de artículos. El tokenizador es el mismo que el de MzModelV1, lo que facilita la comparación entre versiones. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva en el marco de un modelo de lenguaje de 110 millones de parámetros.
- Capacidad limitada de razonamiento y respuesta a instrucciones, según advierte el propio autor.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües no especificadas; el entrenamiento se basa en Wikipedia Structured, pero no se detalla la composición lingüística.
- No se documentan modos especiales como thinking mode, visión o audio.
- Compatible con endpoints (tag `endpoints_compatible`).

## Casos de uso

- Experimentación educativa con arquitecturas Transformer: el modelo sirve como base para estudiar el efecto de RoPE, RMSNorm, SwiGLU y SDPA en modelos de pequena escala, comparando directamente con MzModelV1.
- Investigación sobre entrenamiento desde cero en hardware de consumo: permite reproducir y analizar el proceso de preentrenamiento en una única GPU de 16 GB, útil para quienes quieren entender las decisiones de diseno sin acceso a clústeres.
- Comparación de variantes arquitectónicas: al compartir tokenizador y vocabulario con MzModelV1, facilita experimentos controlados sobre el impacto de cambios en la arquitectura.
- Generación de texto a pequena escala en entornos de prueba: adecuado para prototipos y demos donde se requiera un modelo ligero y de licencia permisiva, sin expectativas de calidad de producción.
- Docencia y formación: útil como ejemplo práctico de implementación completa de un modelo de lenguaje con PyTorch y Transformers en cursos o talleres.
- Pruebas de pipelines de inferencia: sirve para validar integraciones con `transformers` y despliegues ligeros antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 110 millones de parámetros en precision FP32 ocupa aproximadamente 440 MB de pesos; en FP16/BF16 alrededor de 220 MB. El consumo real depende de la implementación y del contexto.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente; el propio autor entrenó el modelo en una NVIDIA RTX 5060 Ti de 16 GB.
- Cabe en GPU de consumo: sí, en practicamente cualquier GPU moderna de consumo (RTX 3060, RTX 4060, RTX 4090, etc.), e incluso en sistemas con poca VRAM.
- Opciones de despliegue: al ser un modelo con arquitectura personalizada (`mz_model_v2`), requiere cargarse con su implementación específica disponible en el repositorio del proyecto. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MzModelV2 | ~110 M | 512 tokens | Apache 2.0 | Hugging Face |
| MzModelV1 | No disponible | No disponible | No disponible | Proyecto del mismo autor |
| GPT-2 small | 124 M | 1024 tokens | MIT (pesos abiertos) | Hugging Face |
| Pythia-160M | 160 M | 2048 tokens | Apache 2.0 | Hugging Face |

La comparación con GPT-2 small y Pythia-160M es orientativa por escala de parámetros; no se dispone de datos de rendimiento de MzModelV2 para una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo experimental de aproximadamente 110 millones de parámetros; sus capacidades de conocimiento, razonamiento, seguimiento de instrucciones y generación de texto son limitadas en comparación con modelos preentrenados de mayor tamano.
- Puede generar contenido con errores factuales, inconsistencias o respuestas incompletas.
- Longitud de contexto muy reducida (512 tokens), lo que restringe tareas que requieran contexto largo.
- No se especifican los idiomas soportados ni la composición lingüística del dataset de entrenamiento.
- No se documentan sesgos conocidos, pero al entrenarse sobre Wikipedia Structured puede heredar sesgos de esa fuente.
- Licencia Apache 2.0: permite uso comercial, pero el autor lo declara exclusivamente para fines de investigación y educativos y lo proporciona "as is", sin garantías de rendimiento, seguridad o precisión.
- Requiere una implementación de arquitectura personalizada para su carga; no es un modelo estándar de `transformers` sin el código del proyecto.
- No apto para producción sin validación exhaustiva previa.

## Enlaces

- Hugging Face: https://huggingface.co/marekzel/mz-model-v2
- Repositorio del proyecto: https://github.com/marekzel/mz-models
