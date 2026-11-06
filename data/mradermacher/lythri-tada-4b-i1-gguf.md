# mradermacher/Lythri-Tada-4B-i1-GGUF

## Resumen

Lythri-Tada-4B-i1-GGUF es una recopilación de cuantizaciones GGUF generadas por mradermacher a partir del modelo base Lythri/Lythri-Tada-4B. El repositorio no contiene pesos en formato original (safetensors), sino únicamente ficheros GGUF cuantizados en una amplia variedad de niveles (desde IQ1_S hasta Q6_K), pensados para su uso con llama.cpp y derivados. El autor de las cuantizaciones es un colaborador habitual de la comunidad que publica versiones comprimidas de modelos recientes.

El modelo base se presenta como un modelo de 4B de parámetros según el nombre del repositorio, aunque la model card no incluye información técnica sobre arquitectura, entrenamiento ni datos de evaluación. La única información disponible en la ficha de Hugging Face es la lista de cuantizaciones generadas y la referencia al modelo original. No se dispone de licencia declarada, idiomas soportados ni pipeline asociado.

La relevancia de este repositorio es práctica: permite ejecutar el modelo Lythri-Tada-4B en hardware de consumo mediante cuantización, con opciones que van desde ~1-2 bits (para GPUs con poca VRAM) hasta 6 bits (para mayor fidelidad). Al no haber datos de benchmarks ni documentación del modelo base, la evaluación debe hacerse empíricamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 4B (según nombre del repo); el campo safetensors del repo GGUF indica 1.391.607 (dato no representativo del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones weighted/imatrix) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Lythri-Tada-4B en la documentación proporcionada. El repositorio es únicamente un conjunto de cuantizaciones GGUF, por lo que no aporta detalles sobre el transformer subyacente, el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

La única información técnica relevante es el método de cuantización: se han generado cuantizaciones "weighted/imatrix", lo que indica que se utilizó una matriz de importancia (imatrix) para guiar la cuantización y reducir la pérdida de calidad en los niveles más agresivos (IQ1, IQ2, IQ3). También se indica `output_tensor_quantised: 1` y `quantize_version: 2`, parámetros propios de las herramientas de cuantización de llama.cpp.

## Capacidades

- No se dispone de información documentada sobre las capacidades del modelo base en la model card proporcionada.
- Al ser un modelo de 4B, es razonable esperar generación de texto general, pero no hay confirmación de soporte de código, matemáticas, tool calling, agentes, visión ni audio.
- Capacidades multilingües: no disponible.
- Modo thinking o razonamiento extendido: no disponible.
- No se documenta soporte de function calling ni de razonamiento multi-paso.

## Casos de uso

- Despliegue en hardware de consumo: las cuantizaciones IQ2/IQ3 permiten ejecutar un modelo de 4B en GPUs con 4-6 GB de VRAM mediante llama.cpp u Ollama, útil para prototipado local.
- Experimentación con cuantización: el repositorio ofrece una matriz completa de niveles (de IQ1_S a Q6_K), lo que permite comparar la degradación de calidad según el bit-width en un mismo modelo.
- Inferencia en CPU: los ficheros Q4_0 y Q4_1 son adecuados para ejecución en CPU con llama.cpp, sin necesidad de GPU.
- Evaluación comparativa de cuantizaciones: útil para investigadores que quieran medir el impacto de la cuantización weighted/imatrix frente a cuantizaciones estándar.
- Integración en pipelines de llama.cpp: al ser GGUF, se puede cargar directamente en servidores compatibles con la API de llama.cpp para pruebas de latencia y throughput.
- Uso educativo: como ejemplo de repositorio de cuantizaciones generado por la comunidad a partir de un modelo base poco documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de 4B, aproximada según cuantización):
  - IQ1_S / IQ2_XXS: ~1,5-2,5 GB
  - IQ3_XXS / Q3_K_S: ~2,5-3,5 GB
  - Q4_K_M / IQ4_XS: ~3-4 GB
  - Q5_K_M: ~3,5-4,5 GB
  - Q6_K: ~4-5 GB
  - Q4_0 / Q4_1: ~3-3,5 GB
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para las cuantizaciones más altas con contexto largo; GPUs con 6-8 GB (RTX 3060 6 GB, RTX 2070) suficientes para Q4.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 6 GB o más para Q4; las cuantizaciones IQ2/IQ3 caben en 4 GB.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), llama-cpp-python, text-generation-webui, LM Studio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre el modelo base Lythri-Tada-4B ni de benchmarks que permitan una comparación rigurosa. Como referencia de categoría (modelos de ~4B cuantizados en GGUF), se podrían considerar alternativas como Qwen2.5-3B-Instruct, Phi-3-mini (3.8B) o Llama-3.2-3B-Instruct, pero no hay datos que permitan afirmar equivalencia o superioridad.

| Modelo | Parametros | Contexto | Licencia | Formato GGUF |
|---|---|---|---|---|
| Lythri-Tada-4B-i1-GGUF | 4B (según nombre) | no disponible | no disponible | Sí |
| Qwen2.5-3B-Instruct | 3B | 32K | Apache 2.0 | Sí (comunidad) |
| Phi-3-mini | 3.8B | 4K/128K | MIT | Sí (comunidad) |
| Llama-3.2-3B-Instruct | 3B | 128K | Llama 3.2 Community | Sí (comunidad) |

## Limitaciones y advertencias

- No hay información sobre sesgos del modelo base; se desconoce su comportamiento en dominios sensibles.
- Riesgo de alucinación: no evaluado; sin benchmarks no se puede estimar su fiabilidad.
- Licencia no declarada: no se puede garantizar el uso comercial. Es imprescindible consultar la licencia del modelo base Lythri/Lythri-Tada-4B antes de cualquier despliegue en producción.
- Idiomas soportados no documentados; no se recomienda asumir un buen rendimiento en castellano sin pruebas.
- El campo de parámetros del repo GGUF (1.391.607) no refleja el tamaño real del modelo; es un dato de safetensors no representativo.
- Las cuantizaciones IQ1/IQ2 pueden degradar notablemente la calidad; no se recomiendan para tareas que requieran precisión.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción.
- No se documenta el contexto máximo soportado; puede variar según la implementación de llama.cpp.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Lythri-Tada-4B-i1-GGUF
- Modelo base: https://huggingface.co/Lythri/Lythri-Tada-4B
- Herramienta de cuantización (llama.cpp): https://github.com/ggerganov/llama.cpp
