# Shiftedx/qwen3.8-27b-aeon-ultimate-uncensored-mxfp4-text-mlx

## Resumen

El modelo `Shiftedx/qwen3.8-27b-aeon-ultimate-uncensored-mxfp4-text-mlx` es una conversión comunitaria en formato MXFP4 (4 bits) del checkpoint `AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16`, desarrollado por el usuario Shiftedx. Se trata de una cuantización experimental para la librería MLX, pensada para ejecutarse en hardware Apple Silicon. El modelo base pertenece a la familia Qwen3.5, con arquitectura densa híbrida de atención/GDN y 64 capas de lenguaje, y está configurado para un contexto de 262 144 tokens. La conversión omite deliberadamente los pesos de visión, por lo que es exclusivamente de texto.

La relevancia de este modelo radica en su naturaleza "uncensored" (abliterated, es decir, con la alineación de seguridad eliminada) y en su formato compacto de 4 bits, que permite ejecutarlo en dispositivos con recursos limitados. No es un lanzamiento oficial de Qwen ni de AEON-7, sino una adaptación independiente que conserva la licencia Apache-2.0. Dado su carácter experimental y la ausencia de alineación, su uso en producción requiere controles adicionales de seguridad y moderación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Densa Qwen3.5-family hybrid attention/GDN, 64 capas de lenguaje |
| Parametros totales | 5 045 149 184 (según safetensors; el nombre del modelo sugiere 27B, discrepancia no aclarada) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (configurado, no exhaustivamente validado) |
| Tipos de cuantizacion | MXFP4, 4 bits, grupo de tamaño 32 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una cuantización MXFP4 del checkpoint BF16 `AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16`, generada con el adaptador de streaming Qwen3.5 de MLX-LM 0.31.3. La arquitectura subyacente es densa, con atención híbrida y GDN (probablemente una variante de atención con núcleo de gating), y 64 capas de lenguaje. No se incluyen pesos de visión, por lo que el modelo es exclusivamente de texto. El proceso de cuantización se realizó directamente desde el padre BF16, y se verificaron los metadatos de los safetensors y los encabezados. No se dispone de información sobre el entrenamiento del modelo base (tokens, dataset, técnicas de alineación) más allá de que fue sometido a un proceso de "abliteration" para eliminar la alineación de seguridad.

## Capacidades

- Generación de texto libre y conversacional, sin restricciones de alineación (modelo "uncensored").
- Soporte de contexto largo (hasta 262 144 tokens configurados), adecuado para tareas que requieren ventanas amplias.
- Capacidad multilingüe no documentada; se asume herencia de Qwen3.5, pero no se confirma.
- No se especifican capacidades de tool calling, function calling, agentes o razonamiento multi-paso.
- No incluye capacidades de visión ni audio (pesos de visión omitidos).
- Formato de cuantización MXFP4 optimizado para MLX en Apple Silicon.

## Casos de uso

- Investigación en seguridad de IA: el modelo puede emplearse para estudiar comportamientos de modelos sin alineación, siempre bajo entornos controlados y con supervisión humana.
- Generación de texto creativo sin filtros: escritura de ficción, poesía o guiones donde se requiera explorar temas sensibles sin restricciones.
- Pruebas de robustez de sistemas de moderación: al ser un modelo sin censura, sirve para evaluar clasificadores de contenido y filtros de seguridad.
- Desarrollo de aplicaciones de chat experimental: prototipos que necesiten respuestas sin sesgos de alineación, con la advertencia de implementar capas de moderación externas.
- Evaluación de técnicas de cuantización: comparación de rendimiento y calidad entre MXFP4 y otros formatos (BF16, FP8) en tareas de generación de texto.
- Despliegue en entornos offline con Apple Silicon: gracias a su tamaño reducido (~13.3 GiB) y formato MLX, puede ejecutarse en Macs con suficiente memoria unificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el archivo indexado ocupa 13.33 GiB, por lo que se recomienda al menos 16 GB de memoria unificada en Apple Silicon (M1 Pro/Max o superior) para una ejecución cómoda.
- GPU recomendadas: no aplica para CUDA; el formato MLX está diseñado para Apple Silicon (M-series).
- En consumer GPU: no es compatible directamente con CUDA; requiere adaptación a otros formatos (GGUF, etc.) que no se proporcionan.
- Opciones de despliegue: mediante `mlx_lm` (por ejemplo, `python -m mlx_lm generate --model <repo> --prompt "Hello"`). No se mencionan integraciones con vLLM, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de la misma categoría (mismos parámetros, misma cuantización). El modelo base AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16 es la referencia directa, pero no se ofrecen datos de rendimiento comparativo. Alternativas genéricas como Qwen3.5 (versión oficial) o modelos abliterated de otras familias podrían ser comparables, pero no se dispone de datos concretos.

## Limitaciones y advertencias

- Modelo experimental y sin alineación de seguridad: puede generar contenido ilegal, peligroso o dañino. El autor del modelo base advierte explícitamente de este riesgo.
- La cuantización MXFP4 no restaura la alineación; el modelo conserva el comportamiento "uncensored" del padre.
- No se ha validado exhaustivamente el contexto de 262 144 tokens; puede degradarse en ventanas largas.
- Idiomas soportados no documentados; puede haber sesgos o limitaciones en idiomas distintos del inglés.
- Licencia Apache-2.0 permite uso comercial, pero la responsabilidad legal y ética recae en el operador.
- No incluye pesos de visión; no es multimodal.
- Discrepancia en el número de parámetros: el safetensors reporta ~5B, mientras que el nombre sugiere 27B; se recomienda verificar antes de usar.
- Sin benchmarks publicados, no se puede evaluar su calidad relativa.

## Enlaces

- [HuggingFace - Shiftedx/qwen3.8-27b-aeon-ultimate-uncensored-mxfp4-text-mlx](https://huggingface.co/Shiftedx/qwen3.8-27b-aeon-ultimate-uncensored-mxfp4-text-mlx)
- [Modelo base - AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16](https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16)
