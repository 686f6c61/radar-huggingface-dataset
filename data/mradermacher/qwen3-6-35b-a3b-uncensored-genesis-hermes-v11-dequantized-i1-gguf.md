# mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V11-dequantized-i1-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF con imatrix del modelo `symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V11-dequantized`, un fine-tuning de la familia Qwen3.6 con 35.5 mil millones de parámetros totales y una arquitectura de mezcla de expertos (MoE) que activa aproximadamente 3 mil millones de parámetros por token (según la nomenclatura A3B). El autor de la cuantización es mradermacher, conocido por publicar versiones GGUF optimizadas para ejecución local. El modelo base combina tres técnicas de post-entrenamiento: "Uncensored" (eliminación de restricciones de contenido), "Genesis" (restauración de señal post-entrenamiento) y "Hermes" (estilo conversacional de Nous Research). Aunque la ficha se centra en la versión V11, los resultados de búsqueda web sobre versiones anteriores (V6, V7) indican que la arquitectura subyacente es híbrida, combinando atención lineal Gated DeltaNet y atención softmax completa en una proporción 3:1 a lo largo de 40 capas, con 256 expertos. Esta información no está confirmada para la V11, pero es probable que se mantenga.

La relevancia de este modelo radica en que ofrece una versión cuantizada de un modelo de 35B con solo 3B activos, lo que permite ejecutarlo en hardware de consumo con requisitos de VRAM moderados. Al ser un GGUF, es compatible con herramientas como llama.cpp, Ollama y otros motores de inferencia locales. El repositorio incluye tres cuantizaciones principales (i1-Q2_K, i1-IQ3_M, i1-Q4_K_S) y un archivo imatrix para generar cuantizaciones personalizadas. La model card indica que se trata de un modelo de visión, por lo que los archivos mmproj (proyección multimodal) se encuentran en el repositorio estático asociado. No se dispone de información sobre la licencia, el pipeline o la longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts), probablemente híbrida con atención lineal Gated DeltaNet y softmax attention (según versiones anteriores, no confirmado para V11) |
| Parametros totales | 35.505.251.456 (35,5B) |
| Parametros activos | 3B (inferido del nombre A3B, no confirmado en la documentación) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K (13,3 GB), i1-IQ3_M (15,9 GB), i1-Q4_K_S (20,5 GB), archivo imatrix (0,3 GB) |
| Idiomas soportados | inglés |
| Licencia | no disponible |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado desde cero, sino una cuantización GGUF del modelo base `symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V11-dequantized`. El modelo base es un fine-tuning de Qwen3.6-35B-A3B, que pertenece a la familia Qwen3.6. Según la información disponible de versiones anteriores (V6, V7), la arquitectura subyacente es una mezcla de expertos híbrida que combina atención lineal Gated DeltaNet y atención softmax completa en una proporción 3:1, distribuida en 40 capas con 256 expertos. Esta configuración permite un equilibrio entre eficiencia computacional y calidad de atención. La técnica "Genesis" se describe como una restauración de señal post-entrenamiento, mientras que "Hermes" aporta un estilo conversacional natural y "Uncensored" elimina restricciones de contenido. No se dispone de detalles específicos sobre el dataset de entrenamiento, el número de tokens procesados o si se aplicaron técnicas de RLHF o DPO. La cuantización realizada por mradermacher utiliza el método imatrix (importance matrix) para mejorar la calidad de los quants de baja precisión.

## Capacidades

- Generación de texto en inglés con estilo conversacional (fine-tuning Hermes).
- Modelo de visión: la model card indica que es un modelo de visión, por lo que puede procesar entradas multimodales (imágenes) si se utilizan los archivos mmproj adecuados del repositorio estático.
- Diseñado para ser "uncensored", lo que implica que no aplica filtros de contenido estándar en las respuestas.
- Arquitectura MoE con 3B parámetros activos, lo que permite inferencia eficiente en hardware moderado.
- Compatible con herramientas de ejecución local como llama.cpp, Ollama y otras que soporten GGUF.
- No se dispone de información sobre soporte de tool calling, function calling, agentes o razonamiento multi-paso.

## Casos de uso

- Ejecución local en equipos de consumo: gracias a los quants de 13-20 GB, el modelo puede ejecutarse en GPUs con 16-24 GB de VRAM, lo que lo hace adecuado para desarrolladores que necesitan un LLM local sin depender de APIs externas.
- Generación creativa y roleplay: al ser "uncensored" y con estilo Hermes, es apropiado para aplicaciones de escritura creativa, juegos de rol o simulación de personajes donde se requiere libertad de contenido.
- Prototipado rápido de aplicaciones conversacionales: los desarrolladores pueden integrar el modelo en entornos de desarrollo local para probar flujos de conversación antes de escalar a modelos más grandes.
- Investigación en alineación y seguridad: al ser un modelo sin censura, puede utilizarse para estudiar comportamientos de modelos sin restricciones y comparar con versiones alineadas.
- Procesamiento de imágenes con texto: si se utilizan los archivos mmproj, el modelo puede emplearse para tareas de visión-lenguaje, como descripción de imágenes o respuesta a preguntas visuales, en entornos locales.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente, los datos no salen del equipo, lo que es útil para aplicaciones que manejan información sensible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo o sus versiones anteriores.

## Requisitos de hardware

- Cuantización i1-Q2_K (13,3 GB): requiere al menos 16 GB de VRAM para inferencia con contexto corto; puede caber en GPUs como RTX 4080, RTX 4090 o A5000.
- Cuantización i1-IQ3_M (15,9 GB): requiere al menos 20 GB de VRAM; adecuada para RTX 4090 (24 GB) o A6000.
- Cuantización i1-Q4_K_S (20,5 GB): requiere al menos 24 GB de VRAM; recomendada para RTX 4090, A100 40GB o similar.
- Para contexto largo, se necesita VRAM adicional; no se dispone de datos exactos sobre el overhead.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con adaptador GGUF) y otros motores compatibles con GGUF.
- Latencia y throughput: no disponibles; dependen del hardware y la cuantización utilizada.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa directa con otros modelos. El modelo pertenece a la familia Qwen3.6-35B-A3B, de la que existen otras cuantizaciones GGUF (por ejemplo, versiones V6, V7, V10) publicadas por diferentes autores. Todas comparten la misma arquitectura base y se diferencian en el fine-tuning y la técnica de cuantización. No se conocen modelos comparables de otros fabricantes con características idénticas (MoE híbrida, 35B totales, 3B activos, sin censura).

## Limitaciones y advertencias

- Licencia no especificada: no se indica la licencia del modelo base ni de la cuantización, lo que genera incertidumbre sobre el uso comercial y la redistribución.
- Contenido sin censura: al ser "uncensored", el modelo puede generar contenido ofensivo, ilegal o inapropiado. No es adecuado para aplicaciones que requieran moderación de contenido.
- Riesgo de alucinación: como todo LLM, puede producir información falsa o inventada, especialmente en temas especializados.
- Idioma limitado: solo se ha entrenado en inglés, por lo que no es adecuado para otros idiomas.
- Información incompleta: no se dispone de detalles sobre la longitud de contexto, el pipeline, los benchmarks o las capacidades exactas de visión para esta versión V11.
- Dependencia de la cuantización: los quants de baja precisión (Q2_K, IQ3_M) pueden degradar la calidad de las respuestas en comparación con el modelo original de punto flotante.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V11-dequantized-i1-GGUF
- Página de descarga y visión general: https://hf.tst.eu/model#Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V11-dequantized-i1-GGUF
- Repositorio estático con quants y mmproj: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V11-dequantized-GGUF
- Modelo base (dequantizado): https://huggingface.co/symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V11-dequantized
