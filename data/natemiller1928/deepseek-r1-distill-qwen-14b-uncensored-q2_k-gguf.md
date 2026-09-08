# natemiller1928/DeepSeek-R1-Distill-Qwen-14B-Uncensored-Q2_K-GGUF

## Resumen

El repositorio `natemiller1928/DeepSeek-R1-Distill-Qwen-14B-Uncensored-Q2_K-GGUF` es una conversión a formato GGUF del modelo `nicoboss/DeepSeek-R1-Distill-Qwen-14B-Uncensored`, un modelo de lenguaje de razonamiento de 14.765.947.904 parámetros. La versión original es una destilación de DeepSeek-R1 sobre la arquitectura Qwen-14B, a la que se aplicó un fine-tuning adicional con el dataset `Guilherme34/uncensor` para eliminar restricciones de moderación. El repositorio actual ha sido generado por `natemiller1928` mediante el espacio `ggml-org/gguf-my-repo`, y ofrece el modelo en cuantización Q2_K con un tamaño de 5,8 GB.

La relevancia de esta ficha es que permite ejecutar un modelo de razonamiento de aproximadamente 14.000 millones de parámetros en hardware modesto, gracias a la cuantización extrema a 2 bits. Es un modelo denso, no un MoE, y la longitud de contexto completa del modelo base no se ha especificado en la información disponible. La licencia es MIT y el formato de pesos es GGUF, lo que facilita su uso con `llama.cpp` tanto en CLI como en servidor.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen-14B |
| Parametros totales | 14.765.947.904 (14,7B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K (K-quants, 2 bits) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en `DeepSeek-R1-Distill-Qwen-14B`, una variante destilada de DeepSeek-R1 sobre la arquitectura Qwen-14B. Se trata de un transformer denso, compuesto por 14.765.947.904 parámetros. El autor del repositorio original `nicoboss` aplicó un fine-tuning adicional con el dataset `Guilherme34/uncensor`, cuyo nombre indica que el objetivo era reducir o eliminar las restricciones de moderación habituales en modelos de razonamiento. Posteriormente, este repositorio convirtió los pesos a formato GGUF y los cuantizó a Q2_K mediante `llama.cpp`. No se han proporcionado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni técnicas de alineación como RLHF o DPO.

## Capacidades

- Razonamiento paso a paso heredado de DeepSeek-R1, aunque no está respaldado por benchmarks publicados en esta ficha.
- Generación de texto sin los filtros de moderación habituales, según el nombre "Uncensored" y el dataset de entrenamiento.
- Ejecución eficiente en local mediante `llama.cpp` y `llama-server`.
- Soporte para inferencia por línea de comandos y como servidor con una API compatible con los ejemplos del repositorio.
- No se dispone de información sobre tool calling, agentes, visión, audio ni capacidades multilingües.
- La longitud de contexto exacta no se ha especificado en la información disponible.

## Casos de uso

- Prototipado de razonamiento en local: el modelo pesa 5,8 GB y se puede ejecutar con `llama-cli` en un portátil, lo que facilita experimentar con cadenas de razonamiento sin depender de APIs externas.
- Investigación en alineación y seguridad: la versión "uncensored" permite analizar cómo responde un modelo de razonamiento a prompts que normalmente serían bloqueados, útil para estudiar sesgos y comportamientos fuera de las políticas de moderación.
- Generación de contenido en entornos aislados: al ser un archivo GGUF, se puede desplegar en una máquina sin conexión a red para aplicaciones creativas que requieran texto libre.
- Servidor de chat local: la opción `llama-server` permite exponer un endpoint para chatbots internos que no envían datos a la nube, con la ventaja de que el usuario controla los pesos.
- Evaluación comparativa de cuantizaciones: se puede comparar la calidad de este Q2_K contra el modelo original sin cuantizar para medir la degradación en memoria y precisión en tareas de razonamiento.
- Análisis de pipelines de datos sintéticos: para generar explicaciones o etiquetas automáticas en flujos que no requieren una alta precisión, es posible integrar el modelo mediante `llama.cpp` en un proceso por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model-index del repositorio muestra una lista de resultados vacía, por lo que no se presentan métricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- El archivo GGUF Q2_K tiene un tamaño de 5,8 GB. Para inferencia en GPU se recomienda disponer de al menos 6-8 GB de VRAM, dejando margen para el contexto y las activaciones.
- GPU recomendadas: RTX 3060 de 12 GB o superior, RTX 4060 Ti de 16 GB, o cualquier tarjeta con al menos 8 GB de VRAM.
- Puede ejecutarse en CPU con suficiente RAM, así como en Apple Silicon mediante `llama.cpp`.
- Opciones de despliegue: `llama.cpp` (CLI y servidor), así como clientes que trabajan con el formato GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| natemiller1928/DeepSeek-R1-Distill-Qwen-14B-Uncensored-Q2_K-GGUF | 14,7B | no disponible | no disponible | MIT | GGUF Q2_K |
| nicoboss/DeepSeek-R1-Distill-Qwen-14B-Uncensored | 14,7B | no disponible | no disponible | no disponible | Safetensors |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-14B | 14,7B | no disponible | no disponible | no disponible | Safetensors |
| mradermacher/DeepSeek-R1-Distill-Qwen-14B-Uncensored-GGUF | 14,7B | no disponible | no disponible | no disponible | GGUF |

No se han publicado benchmarks que permitan comparar el rendimiento real entre estos modelos. La diferencia principal reside en el formato de pesos y, en el caso del repositorio evaluado, en la cuantización extrema a Q2_K.

## Limitaciones y advertencias

- No se documentan sesgos específicos, pero al tratarse de un modelo destilado y cuantizado a Q2_K, se espera una degradación de la calidad y una mayor probabilidad de alucinación en comparación con la versión sin cuantizar.
- El modelo "Uncensored" puede generar contenido inapropiado, peligroso o ilegal sin filtros de moderación. Aunque la licencia MIT es permisiva, su uso en producción supone un riesgo ético y legal significativo.
- La longitud de contexto no está especificada de forma oficial; el comando de ejemplo en la model card utiliza `-c 2048`, lo que sugiere una configuración de contexto de 2048 tokens, pero no es un límite confirmado.
- No se han publicado evaluaciones externas ni benchmarks, por lo que las capacidades reales de razonamiento y generación no están validadas.
- La falta de información sobre idiomas limita su uso en entornos multilingües.
- El formato GGUF Q2_K depende de herramientas específicas como `llama.cpp` o `Ollama`, lo que puede limitar su integración en otros frameworks de inferencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/natemiller1928/DeepSeek-R1-Distill-Qwen-14B-Uncensored-Q2_K-GGUF
- Modelo base: https://huggingface.co/nicoboss/DeepSeek-R1-Distill-Qwen-14B-Uncensored
- DeepSeek-R1-Distill-Qwen-14B original: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B
- Otra conversión GGUF del mismo modelo: https://huggingface.co/mradermacher/DeepSeek-R1-Distill-Qwen-14B-Uncensored-GGUF
