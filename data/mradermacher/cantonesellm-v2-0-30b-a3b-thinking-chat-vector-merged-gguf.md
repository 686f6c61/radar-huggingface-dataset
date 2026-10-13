# mradermacher/CantoneseLLM-v2.0-30B-A3B-Thinking-Chat-Vector-Merged-GGUF

## Resumen

Esta ficha describe la versión cuantizada en formato GGUF del modelo CantoneseLLM-v2.0-30B-A3B-Thinking-Chat-Vector-Merged, publicada por el usuario mradermacher. Se trata de una conversión de pesos, no de un entrenamiento nuevo: el autor original del modelo es hon9kon9ize, y mradermacher se limita a generar cuantizaciones estáticas (y una familia aparte con imatrix) para su uso con llama.cpp y otros runners compatibles con GGUF. El modelo resultante conserva la licencia Apache-2.0 del modelo base y del modelo original.

El modelo subyacente es un transformer de tipo mezcla de expertos (MoE) con 30.532.122.624 parámetros totales, según los pesos en safetensors del repositorio de referencia. La nomenclatura "30B-A3B" indica que, de ese total, solo una fracción reducida (aproximadamente 3B, correspondiente al patrón A3B) se activa por token, lo que abarata la inferencia en comparación con un modelo denso del mismo tamaño. El sufijo "Thinking" apunta a un modo de razonamiento explícito antes de la respuesta, y "Chat-Vector-Merged" indica que el modelo se obtuvo mediante fusión de vectores de tarea sobre un modelo sometido a preentrenamiento continuado en cantonés.

Su relevancia es doble. Por un lado, cubre un hueco poco atendido: los modelos abiertos con cobertura real de cantonés (yue) son escasos, y este añade además chino e inglés. Por otro, al estar disponible en GGUF, se puede ejecutar en hardware de consumo con cuantizaciones que van desde 11,4 GB (Q2_K) hasta 32,6 GB (Q8_0), lo que amplía mucho el público potencial frente a la versión original en safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), según la etiqueta "moe" y la nomenclatura del modelo base |
| Parámetros totales | 30.532.122.624 (dato real de los safetensors del modelo base) |
| Parámetros activos | Aproximadamente 3B, según la designación "A3B" del nombre del modelo; no confirmado explícitamente en la información disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K (11,4 GB), Q3_K_S (13,4 GB), Q3_K_M (14,8 GB), Q3_K_L (16,0 GB), IQ4_XS (16,7 GB), Q4_K_S (17,6 GB), Q4_K_M (18,7 GB), Q5_K_S (21,2 GB), Q5_K_M (21,8 GB), Q6_K (25,2 GB), Q8_0 (32,6 GB). Existe además una familia i1-GGUF con cuantizaciones ponderadas/imatrix en repositorio aparte |
| Idiomas soportados | yue (cantonés), zh (chino), en (inglés) |
| Licencia | apache-2.0 (con enlace a la licencia de Qwen/Qwen3-30B-A3B) |
| Formato de pesos | GGUF (el modelo base está en safetensors, formato HuggingFace) |

Datos adicionales del repositorio: 988 descargas, 1 like, tamaño total del repositorio 208,1 GB (incluye todas las cuantizaciones), creado el 8 de septiembre de 2026 y actualizado el 12 de octubre de 2026.

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos, tal como indican la etiqueta "moe" del repositorio, el patrón de nombres "30B-A3B" y el enlace de licencia, que apunta al repositorio de Qwen3-30B-A3B. Esto sugiere que el modelo original parte de la familia Qwen3 en su variante MoE de 30B, sobre la que se ha aplicado preentrenamiento continuado y fusión de vectores. La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset, la proporción de cada idioma ni si se emplearon técnicas de alineación como RLHF o DPO.

Las etiquetas del repositorio sí permiten reconstruir la receta a grandes rasgos: "continual-pretraining" indica una fase de preentrenamiento continuado para reforzar el cantonés, "chat-vector" y "model-merging" indican que el modelo final se obtuvo combinando vectores de tarea o de ajuste conversacional con el modelo preentrenado, y "Thinking" señala que el modelo incorpora un modo de razonamiento previo a la respuesta. No se especifican en la información proporcionada ni los hiperparámetros de la fusión, ni la configuración de la plantilla de chat, ni si se empleó decodificación especulativa u otras optimizaciones de inferencia.

## Capacidades

- Generación de texto conversacional en cantonés, chino e inglés, con especial énfasis en cantonés y en contexto de Hong Kong según las etiquetas del repositorio.
- Modo de razonamiento explícito ("Thinking" en el nombre del modelo), orientado a tareas que se benefician de una cadena de pensamiento antes de la respuesta final.
- Capacidad de instrucciones y conversación multi-turno, según la etiqueta "conversational".
- Inferencia eficiente por arquitectura MoE: solo se activa una fracción de los parámetros por token, lo que reduce el coste computacional frente a un modelo denso de 30B.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente, aunque el modo de razonamiento del nombre apunta en esa dirección.
- Capacidades de visión o audio: no disponibles.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere que puede desplegarse en infraestructura de inferencia gestionada, sin más detalle en la información disponible.

## Casos de uso

- Atención al cliente en cantonés para el mercado de Hong Kong: el modelo puede gestionar conversaciones multi-turno en yue, un idioma con poca cobertura en modelos abiertos, lo que permite desplegar asistentes locales sin depender de API propietarias.
- Traducción y localización yue-zh-en: útil para pipelines de traducción de documentación, subtítulos o correo electrónico entre cantonés, chino mandarín e inglés, aprovechando que el modelo cubre los tres idiomas.
- Moderación y clasificación de contenido en foros y redes sociales de Hong Kong: con la cuantización Q4_K_M (18,7 GB) o inferior se puede servir en una GPU de 24 GB y procesar grandes volúmenes de texto.
- Generación de asistentes conversacionales embebidos en aplicaciones: al existir GGUF desde 11,4 GB, es viable empaquetar el modelo en un producto de escritorio o servidor pequeño con llama.cpp u Ollama.
- Investigación en procesamiento de lenguas de bajos recursos: sirve como punto de partida para estudiar el efecto del preentrenamiento continuado y la fusión de vectores sobre una lengua con pocos recursos digitales.
- Prototipado de razonamiento en cantonés: el modo de razonamiento permite usarlo para tareas de análisis, resumen y resolución de problemas en yue que requieren pasos intermedios antes de la respuesta.
- Despliegue en entornos con restricciones de coste: la combinación de licencia Apache-2.0 y arquitectura MoE permite ejecutar el modelo en infraestructura propia sin coste de licencia y con menor gasto de cómputo por token que un modelo denso equivalente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio cuantizado no incluye tablas de MMLU, HumanEval, GSM8K ni de evaluaciones específicas de cantonés, y tampoco se aportan métricas de perplejidad de las distintas cuantizaciones más allá de la referencia genérica a un gráfico comparativo de tipos de cuantización de baja calidad.

## Requisitos de hardware

Los valores de VRAM que se indican a continuación son estimaciones derivadas del tamaño de los ficheros GGUF publicados, no mediciones oficiales del autor. A la cifra hay que sumar el espacio para la caché KV, que crece con la longitud de contexto y con el número de secuencias concurrentes.

- Cuantizaciones bajas (Q2_K 11,4 GB, Q3_K_S 13,4 GB, Q3_K_M 14,8 GB): caben en GPUs de consumo con 16 GB de VRAM, como RTX 4080 o RTX 4060 Ti de 16 GB, con contexto reducido. También son adecuadas para CPU con RAM abundante.
- Cuantizaciones medias (Q3_K_L 16,0 GB, IQ4_XS 16,7 GB, Q4_K_S 17,6 GB, Q4_K_M 18,7 GB): encajan en GPUs de 24 GB como RTX 3090, RTX 4090 o A5000, dejando margen para contexto moderado. La Q4_K_M es la recomendada por el autor por equilibrio entre velocidad y calidad.
- Cuantizaciones altas (Q5_K_S 21,2 GB, Q5_K_M 21,8 GB): muy justas en 24 GB; conviene usar contexto corto o recurrir a offload parcial de capas a CPU.
- Cuantizaciones de máxima calidad (Q6_K 25,2 GB, Q8_0 32,6 GB): requieren GPUs de 40 GB o 48 GB (A100 40GB, A6000, L40S) o bien configuraciones multi-GPU. El autor destaca Q8_0 como la de mejor calidad y velocidad dentro de su rango.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para cuantizaciones Q3 y Q4; A100 40GB, A6000 o L40S para Q5, Q6 y Q8; A100 80GB o H100 para servir varias réplicas o contextos muy largos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runner compatible con GGUF. Para vLLM o TGI se necesitaría la versión en safetensors, no las cuantizaciones GGUF.
- Latencia y throughput: no disponible. Al tratarse de una arquitectura MoE con una fracción reducida de parámetros activos, se espera un throughput alto en relación con el tamaño del fichero, pero no hay mediciones publicadas en la información disponible.
- Requisito adicional: el archivo Q8_0 de 32,6 GB y los ficheros multi-parte requieren concatenación previa según las instrucciones habituales de mradermacher.

## Comparativa con modelos similares

No se dispone en la información proporcionada de modelos directamente comparables en la categoría de cantonés con arquitectura MoE de 30B. La comparación más relevante es con el modelo base del que deriva y con el modelo original sin cuantizar.

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CantoneseLLM-v2.0-30B-A3B-Thinking-Chat-Vector-Merged-GGUF (este repositorio) | 30.532.122.624 totales, aproximadamente 3B activos | no disponible | GGUF, con 11 cuantizaciones desde 11,4 GB | apache-2.0 | HuggingFace, 988 descargas |
| hon9kon9ize/CantoneseLLM-v2.0-30B-A3B-Thinking-Chat-Vector-Merged (modelo original) | 30.532.122.624 totales, aproximadamente 3B activos | no disponible | safetensors | apache-2.0 | HuggingFace |
| Qwen3-30B-A3B (familia en la que se basa el modelo según el enlace de licencia) | Del orden de 30B totales con unos 3B activos según la documentación pública de Qwen3 | Según documentación pública de Qwen3; no detallado en la información de este repositorio | safetensors y GGUF de terceros | Apache-2.0 | HuggingFace |

No se han localizado en la información disponible alternativas específicas de cantonés con las que establecer una comparación cuantitativa de rendimiento, contexto o licencia.

## Limitaciones y advertencias

- No hay benchmarks publicados en la información disponible, por lo que no se puede verificar el rendimiento real del modelo en tareas de razonamiento, código, matemáticas o comprensión multilingüe.
- Sesgos conocidos: no disponibles. Al estar especializado en cantonés y en el contexto de Hong Kong, es previsible que su cobertura de variedades dialectales, registros formales y otras lenguas sea desigual, aunque no se aportan datos al respecto.
- Riesgo de alucinación: inherente a los modelos de lenguaje generativos y no cuantificado en esta ficha. No se han publicado evaluaciones de factualidad.
- Limitaciones de contexto: la longitud máxima de contexto no se especifica en la información disponible, lo que obliga a verificarla experimentalmente antes de dimensionar un despliegue.
- La cuantización introduce pérdida de calidad. El propio autor advierte que Q3_K_M es de calidad inferior y que Q2_K y Q3_K_S son las opciones más agresivas; para producción conviene partir de Q4_K_M o superior.
- Licencia: apache-2.0, lo que en principio permite uso comercial. Sin embargo, el enlace de licencia apunta a Qwen3-30B-A3B, por lo que conviene revisar también las condiciones de la licencia del modelo base original antes de un despliegue comercial.
- Este repositorio es una conversión de pesos, no un modelo entrenado por mradermacher. Cualquier problema de calidad, sesgo o comportamiento proviene del modelo original de hon9kon9ize o de la cuantización, no del proceso de conversión en sí.
- El repositorio ocupa 208,1 GB en total, aunque cada descarga individual se limita al fichero de la cuantización elegida.
- La fecha de creación del repositorio (septiembre de 2026) y su actualización (octubre de 2026) indican un proyecto reciente y con pocas descargas (988), por lo que la comunidad aún no ha acumulado experiencia de uso significativa.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/CantoneseLLM-v2.0-30B-A3B-Thinking-Chat-Vector-Merged-GGUF
- Repositorio con cuantizaciones ponderadas/imatrix i1-GGUF: https://huggingface.co/mradermacher/CantoneseLLM-v2.0-30B-A3B-Thinking-Chat-Vector-Merged-i1-GGUF
- Modelo original sin cuantizar: https://huggingface.co/hon9kon9ize/CantoneseLLM-v2.0-30B-A3B-Thinking-Chat-Vector-Merged
- Página de resumen y descargas del autor para este modelo: https://hf.tst.eu/model#CantoneseLLM-v2.0-30B-A3B-Thinking-Chat-Vector-Merged-GGUF
- Licencia referenciada (Qwen3-30B-A3B): https://huggingface.co/Qwen/Qwen3-30B-A3B/blob/main/LICENSE
- Preguntas frecuentes y peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Guía de uso de ficheros GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
