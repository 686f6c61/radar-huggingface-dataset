# asherapolo/mlabonne_Qwen3-4B-abliterated-GGUF

## Resumen
El modelo `asherapolo/mlabonne_Qwen3-4B-abliterated-GGUF` es una redistribución en formato GGUF de las cuantizaciones que bartowski generó a partir de `mlabonne/Qwen3-4B-abliterated`, un derivado del Qwen3-4B de Alibaba. Se trata, por tanto, de un modelo de lenguaje de 4.022.468.096 parámetros (aproximadamente 4 mil millones) orientado a generación de texto conversacional, publicado en Hugging Face con el pipeline `text-generation`.

La particularidad del modelo base es su condición de "abliterated": se ha aplicado una técnica de edición de pesos (ablación de direcciones de rechazo) sobre Qwen3-4B para reducir el comportamiento de negativa ante peticiones que el modelo original rechazaría. Esto lo hace relevante para investigadores que estudian alineamiento, robustez y comportamiento de modelos, así como para desarrolladores que necesitan un modelo pequeño, ejecutable en hardware de consumo, con menor sesgo de rechazo.

El repositorio aquí descrito contiene únicamente los pesos cuantizados en GGUF generados con llama.cpp (release b5200) e imatrix, lo que permite su despliegue en CPU, Apple Silicon y GPU de gama baja mediante llama.cpp, LM Studio u otras herramientas compatibles. El tamaño total del repositorio es de 63,8 GB, repartido entre los múltiples ficheros de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B; detalles exactos de capas y atención no disponibles en la información proporcionada) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q5_K_L, Q5_K_M, Q5_K_S, Q4_1, Q4_K_L, Q4_K_M, Q4_K_S, Q4_0, IQ4_NL, Q3_K_XL, IQ4_XS, Q3_K_L, Q3_K_M, IQ3_M, Q3_K_S, IQ3_XS |
| Idiomas soportados | No disponibles en la información proporcionada |
| Licencia | No disponible en la información proporcionada |
| Formato de pesos | GGUF (generados con llama.cpp b5200 e imatrix) |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de Qwen3-4B, un transformer decoder-only denso de aproximadamente 4 mil millones de parámetros. Sobre ese modelo base, mlabonne aplicó una técnica de "abliteration", que consiste en identificar y ablacionar las direcciones en el espacio de activaciones asociadas al comportamiento de rechazo, de modo que el modelo pierde parte de su tendencia a negarse a responder. Los detalles concretos del proceso de ablación, los datos empleados y si hubo ajuste fino posterior no están disponibles en la información proporcionada.

Las cuantizaciones GGUF fueron producidas por bartowski con llama.cpp (release b5200) usando el método imatrix, con un dataset de calibración publicado en un gist del propio autor. No se dispone de información sobre el número de tokens de entrenamiento del modelo original, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá de la propia cuantización con imatrix.

## Capacidades
- Generación de texto conversacional multi-turno, con formato de prompt ChatML (`<|im_start|>` / `<|im_end|>`).
- Razonamiento y respuesta a instrucciones heredadas de Qwen3-4B (capacidades específicas de Qwen3 no verificadas en la información disponible).
- Ejecución local en CPU, Apple Silicon y GPU de consumo gracias al formato GGUF.
- Compatibilidad con endpoints (`endpoints_compatible` según los tags del repositorio).
- Comportamiento de rechazo reducido respecto al modelo original por la ablación aplicada.
- Soporte de tool calling, agentes, visión, audio o modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso
- Investigación sobre alineamiento y seguridad: el modelo permite estudiar cómo la ablación de direcciones de rechazo afecta a la tasa de negativas, la calidad de las respuestas y la aparición de contenido no deseado, comparándolo con Qwen3-4B original.
- Despliegue en estaciones de trabajo sin GPU dedicada: con cuantizaciones Q4_K_M (2,50 GB) o IQ4_XS (2,27 GB) puede ejecutarse en CPU con llama.cpp o LM Studio, lo que facilita prototipos y demos locales.
- Asistentes conversacionales offline: al caber en 2-4 GB de RAM/VRAM, es adecuado para integrarse en aplicaciones de escritorio o entornos air-gapped donde no se quiere enviar datos a la nube.
- Generación de texto creativo sin restricciones excesivas: la reducción del sesgo de rechazo lo hace útil para experimentación con narrativa, role-play y guiones donde el modelo original podría negarse.
- Evaluación de pipelines de cuantización: sirve como caso de estudio para medir la degradación de calidad entre bf16 (8,05 GB) y cuantizaciones agresivas como Q3_K_S (1,89 GB) o IQ3_XS (1,81 GB).
- Base para ajuste fino ligero o experimentos de edición de pesos: al ser un modelo pequeño y abliterado, es un punto de partida manejable para investigar técnicas de modificación de comportamiento en modelos de 4B.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM/RAM estimada para inferencia: entre 1,81 GB (IQ3_XS) y 8,05 GB (bf16), pasando por 2,50 GB (Q4_K_M) y 4,28 GB (Q8_0).
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cualquier GPU con 4-8 GB de VRAM es suficiente para las cuantizaciones habituales.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 6-8 GB o más (por ejemplo, RTX 3060, RTX 4060, RTX 4070) usando cuantizaciones Q4-Q6; no confirmado en la información disponible.
- Opciones de despliegue: llama.cpp (versión b5200 o superior), LM Studio, y cualquier proyecto basado en llama.cpp. Otras opciones como vLLM, Ollama o TGI no están documentadas en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| asherapolo/mlabonne_Qwen3-4B-abliterated-GGUF | 4,02 B | No disponible | GGUF | No disponible | Este modelo; cuantizaciones imatrix de un Qwen3-4B abliterado |
| mlabonne/Qwen3-4B-abliterated | 4,02 B | No disponible | Safetensors (presumiblemente) | No disponible | Modelo base del que derivan estas cuantizaciones |
| Qwen3-4B (original) | 4,02 B | No disponible | Safetensors, GGUF | No disponible | Modelo original de Alibaba, con alineamiento estándar |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias
- La ablación reduce el comportamiento de rechazo, lo que puede aumentar la probabilidad de generar contenido dañino, sesgado o inapropiado; no debe desplegarse en producción orientada al público sin filtros adicionales.
- Riesgo de alucinación inherente a un modelo de 4B; la calidad factual será inferior a la de modelos de mayor tamaño.
- La licencia no está disponible en la información proporcionada, lo que impide confirmar si se permite uso comercial; es imprescindible verificar la licencia del modelo base (Qwen3-4B) y del derivado antes de cualquier uso productivo.
- No se documentan los idiomas soportados ni la longitud de contexto, por lo que no se puede garantizar un rendimiento adecuado en castellano ni en contextos largos.
- El repositorio tiene 0 descargas y 0 likes y fue creado y actualizado en la misma fecha, lo que sugiere que es una redistribución reciente sin validación comunitaria.
- Las cuantizaciones de 3 bits o inferiores (Q3_K_S, IQ3_XS) degradan notablemente la calidad según la propia model card.
- El modelo es una redistribución de cuantizaciones de terceros (bartowski); la autoría real de los pesos cuantizados no corresponde al publicador del repositorio.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/asherapolo/mlabonne_Qwen3-4B-abliterated-GGUF
- Modelo base: https://huggingface.co/mlabonne/Qwen3-4B-abliterated
- Repositorio original de cuantizaciones de bartowski: https://huggingface.co/bartowski/mlabonne_Qwen3-4B-abliterated-GGUF
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Release de llama.cpp b5200: https://github.com/ggerganov/llama.cpp/releases/tag/b5200
- Dataset de calibración imatrix: https://gist.github.com/bartowski1182/eb213dccb3571f863da82e99418f81e8
- LM Studio: https://lmstudio.ai/
