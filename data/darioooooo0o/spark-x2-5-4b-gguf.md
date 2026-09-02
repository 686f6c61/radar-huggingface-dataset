# darioooooo0o/Spark-X2.5-4B-GGUF

## Resumen

Spark-X2.5-4B-GGUF es un conjunto de cuantizaciones GGUF comunitarias del modelo base XHToken/Spark-X2.5-4B, un modelo de lenguaje compacto de 4.1 mil millones de parámetros desarrollado por XHToken. El modelo base emplea una arquitectura híbrida de atención (3:1 sliding-window:full) con contexto nativo de 1 millón de tokens, diseñada para equilibrar eficiencia computacional y capacidad de razonamiento de largo alcance. Estas cuantizaciones, creadas por el usuario darioooooo0o, tienen como objetivo permitir la inferencia completamente residente en GPU en tarjetas de consumo de 4, 8, 12 y 16 GB, manteniendo al menos 64K de contexto (128K preferido).

La relevancia de este lanzamiento radica en que el modelo base no está disponible en formato GGUF oficial, y la arquitectura `spark2_5` no está soportada en llama.cpp upstream, por lo que estas cuantizaciones comunitarias, calibradas con una matriz de importancia (imatrix) sobre texto multilingüe, son la vía práctica para ejecutar el modelo en entornos locales. Se ofrecen cuatro variantes: Q6_K (16 GB), Q5_K_M (12 GB), Q4_K_M (8 GB) y una mezcla layer-aware de 4 GB (mix-v5) que asigna distinta precisión por tipo de tensor, protegiendo las proyecciones de atención y comprimiendo agresivamente las capas FFN. La licencia es Apache 2.0, lo que facilita su uso comercial y derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid attention (3:1 sliding-window:full), 36 capas, 9 capas con full-attention KV (4 KV heads x 256 head dim) |
| Parametros totales | 4.112.079.360 (4.1B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.000.000 tokens (nativo) |
| Tipos de cuantizacion | Q6_K, Q5_K_M, Q4_K_M, Q4_K_M-4GB-mix (layer-aware) |
| Idiomas soportados | No disponible (calibracion imatrix sobre corpus multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Spark-X2.5-4B utiliza una arquitectura híbrida de atención que combina ventanas deslizantes (sliding-window) con atención completa (full-attention) en una proporción 3:1. De las 36 capas totales, solo 9 emplean atención completa con 4 cabezas KV de dimensión 256, lo que reduce drásticamente el tamaño de la caché KV en comparación con un transformer denso equivalente. Según la model card, el 69% de los parámetros reside en pesos FFN y el 23% en proyecciones de atención, una distribución que la cuantización layer-aware explota asignando mayor precisión a los tensores sensibles (proyecciones de atención, embedding de tokens, normas y gates) y comprimiendo más los pesos FFN menos críticos.

Los detalles del entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no se especifican en la información proporcionada. La cuantización se realizó con `llama-imatrix` sobre 200 fragmentos de texto multilingüe (6 MB, chunks de 512 tokens) partiendo de una referencia Q8_0. Se validó cada variante con `llama-perplexity` en un corpus de evaluación retenido, y la variante de 8 GB (familia iq4_xs) se verificó en un harness de agentes real con más de 50 llamadas a herramientas sin errores de formato.

## Capacidades

- Generación de texto y conversación multi-turno con razonamiento tipo qwen3 (thinking mode activado por defecto).
- Tool calling / function calling mediante el formato `<tool_call>/<arg_key>/<arg_value>`, compatible con el parser automático de llama.cpp.
- Razonamiento multi-step y workflows agénticos, verificado en tareas de investigación web y administración de sistemas.
- Generación de código en múltiples lenguajes (Rust, Go, C, Node) con compilación y verificación de salidas.
- Contexto largo nativo de 1M tokens, aunque en la práctica limitado por la VRAM disponible (ver requisitos de hardware).
- Capacidades multilingües: la calibración imatrix se realizó sobre texto multilingüe, aunque no se detallan los idiomas concretos.
- Traducción, escritura y razonamiento general, según las capacidades declaradas del modelo base.

## Casos de uso

- Atención al cliente automatizada con contexto prolongado: el modelo puede gestionar conversaciones multi-turno extensas gracias a su ventana de contexto de hasta 128K en GPUs de 8 GB, manteniendo el historial completo de la interacción sin truncamientos.
- Agentes autónomos con tool calling: su formato nativo de llamada a herramientas y su verificación en entornos reales lo hacen adecuado para construir agentes que consulten APIs, ejecuten comandos o realicen búsquedas web, con decodificación estable incluso a 40-60K de contexto.
- Generación de código en producción: soporta múltiples lenguajes y ha demostrado generar código compilable y funcional en Rust, Go, C y Node, pudiendo integrarse en pipelines de CI/CD para generación de tests o documentación.
- Análisis de documentos largos: con 1M de contexto nativo (aunque limitado por VRAM), puede procesar libros completos, expedientes legales o logs extensos en una sola pasada, sin necesidad de chunking.
- Asistente de traducción multilingüe: su calibración sobre corpus multilingüe y su capacidad de razonamiento lo hacen útil para traducción asistida con contexto de estilo y terminología previa.
- Razonamiento y resolución de problemas multi-step: el thinking mode activado por defecto permite desglosar problemas complejos en pasos intermedios, útil para tareas de análisis, planificación o diagnóstico técnico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card proporciona mediciones de perplexity sobre un corpus multilingüe retenido (contexto 512, CUDA), comparando las variantes cuantizadas contra la referencia Q8_0:

| Variante | PPL | Delta vs Q8_0 (21.08) |
|---|---|---|
| Q8_0 (referencia) | 21.08 | - |
| Q6_K + imatrix (16GB) | 21.03 | -0.05 |
| Q5_K_M + imatrix (12GB) | 21.33 | +0.26 |
| Q4_K_M + imatrix (8GB) | 22.19 | +1.11 |
| mix-v5 (4GB) | 25.27 | +4.19 |
| uniform IQ3_XXS (rechazado) | 32.62 | +11.54 |

En cuanto a rendimiento de inferencia, la verificación en una RTX 3060 12GB con contexto 128K y KV cuantizado a q4_0 arrojó una decodificación de ~87 tokens/s en contexto corto y 55-78 tokens/s a 40-60K de contexto.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + KV q4_0 + ~1.1 GB de overhead CUDA, una sola slot, `-ngl 99`, flash attention):
  - Q6_K (16GB): 3.2 GB de pesos + 1.36 GB KV a 128K + overhead ≈ 5.7 GB, cabe en GPUs de 8 GB con margen.
  - Q5_K_M (12GB): 2.8 GB de pesos + 1.36 GB KV a 128K + overhead ≈ 5.3 GB, cabe en GPUs de 8 GB.
  - Q4_K_M (8GB): 2.5 GB de pesos + 1.36 GB KV a 128K + overhead ≈ 5.0 GB, cabe en GPUs de 8 GB.
  - Q4_K_M-4GB-mix (4GB): 2.0 GB de pesos + 1.36 GB KV a 128K + overhead ≈ 4.5 GB, cabe en GPUs de 4 GB (a 96K contexto baja a ~3.2 GB).
- GPUs recomendadas: RTX 3060 12GB (verificada), RTX 4060/4070, RTX 4090, o cualquier GPU con 8 GB o más para las variantes Q4_K_M y superiores. La variante de 4 GB puede ejecutarse en GTX 1650/1660 o RTX 3050 de 4 GB.
- El contexto nativo de 1M no cabe en ninguna GPU de consumo: solo la caché KV a q4_0 ocupa 10.9 GB, superando el presupuesto de VRAM de las tarjetas listadas.
- Despliegue: requiere el fork de llama.cpp de XHToken (https://github.com/XHToken/llama.cpp), ya que la arquitectura `spark2_5` no está en upstream. Se puede usar `llama-server` con los parámetros recomendados (ver model card). No hay soporte documentado para vLLM, Ollama o TGI en la información proporcionada.
- Latencia y throughput: ~87 tok/s en contexto corto y 55-78 tok/s a 40-60K de contexto en RTX 3060 12GB, con KV cuantizado a q4_0.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría (p. ej., Qwen2.5-4B, Llama-3.2-3B, Gemma-2-4B) en la información proporcionada. El modelo base Spark-X2.5-4B se posiciona como un modelo compacto de propósito general con contexto nativo de 1M, una característica poco común en modelos de 4B, pero no se han publicado resultados de benchmarks estándar que permitan una comparación cuantitativa. La comparativa queda pendiente de datos adicionales.

## Limitaciones y advertencias

- La arquitectura `spark2_5` no está soportada en llama.cpp upstream; es obligatorio usar el fork de XHToken, lo que limita la portabilidad y el ecosistema de herramientas.
- La variante de 4 GB (mix-v5) presenta una pérdida de calidad significativa (PPL +4.19 vs Q8_0) y no ha pasado la verificación de tool-use; se recomienda usar la variante de 8 GB y reducir contexto a 96K si se dispone de esa VRAM.
- El contexto nativo de 1M no es alcanzable en GPUs de consumo: la caché KV a q4_0 ocupa 10.9 GB solo para 1M tokens, superando cualquier tarjeta listada.
- No se documentan sesgos específicos del modelo base, pero al ser un modelo entrenado con datos web, es esperable que presente sesgos socioculturales y riesgo de alucinación, especialmente en tareas de razonamiento factual.
- La licencia Apache 2.0 permite uso comercial sin restricciones conocidas, pero las cuantizaciones son obras derivadas del modelo base, por lo que debe mantenerse la atribución correspondiente.
- La calibración imatrix se realizó sobre un corpus multilingüe de solo 6 MB, lo que puede no representar adecuadamente todos los idiomas y dominios; el rendimiento en idiomas poco representados puede degradarse.
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K), por lo que la evaluación de calidad se limita a perplexity y verificaciones cualitativas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/darioooooo0o/Spark-X2.5-4B-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-4B
- README del modelo base en GitHub: https://github.com/XHToken/Spark-X2.5/blob/main/README.md
- Fork de llama.cpp requerido: https://github.com/XHToken/llama.cpp
