# mradermacher/WILLAY-GGUF

## Resumen

WILLAY es un modelo de lenguaje de tipo transformer con aproximadamente 494 millones de parámetros (494.032.768 según los pesos en safetensors), desarrollado por SZLHOLDINGS bajo una línea de trabajo que el autor etiqueta como "governed-ai" y "doctrine-v11". La ficha que nos ocupa, WILLAY-GGUF, no es el modelo original sino la colección de cuantizaciones GGUF publicadas por mradermacher, un conocido cuantizador de la comunidad de Hugging Face, a partir del modelo base SZLHOLDINGS/WILLAY. Su relevancia práctica reside en que permite ejecutar el modelo en hardware modesto mediante llama.cpp y derivados, algo imposible con los pesos originales en transformers para muchos usuarios.

El modelo está entrenado exclusivamente en inglés y se distribuye con licencia Apache 2.0, lo que facilita su uso comercial sin restricciones adicionales. El tamaño del repositorio es de 5,4 GB e incluye un abanico amplio de cuantizaciones estáticas, desde Q2_K hasta f16, con pesos que van de 0,4 GB a 1,1 GB. No se dispone de información pública sobre la longitud de contexto, la composición exacta del dataset ni los detalles de entrenamiento más allá de las referencias a los datasets de doctrina citados en la model card.

La relevancia de esta ficha es doble: por un lado, documenta un modelo pequeño y ligero orientado a despliegues con recursos limitados; por otro, ilustra el flujo habitual de cuantización comunitaria, donde un tercero (mradermacher) publica versiones GGUF de un modelo base poco conocido. Conviene tratar la información disponible con cautela, ya que la model card original es muy escasa y no se han publicado benchmarks ni detalles técnicos verificables.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles) |
| Parámetros totales | 494.032.768 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un transformer y de que el modelo base se distribuye con la librería transformers. No se especifican el número de capas, la dimensión oculta, el número de cabezas de atención ni si emplea alguna variante como atención lineal, decodificación especulativa o mezcla de expertos. El tamaño de 494 millones de parámetros sitúa al modelo en la categoría de modelos pequeños, comparable en escala a la familia GPT-2 large o a modelos tipo Qwen2-0.5B, aunque no se confirma ninguna equivalencia arquitectónica.

En cuanto al entrenamiento, la model card del modelo base cita tres datasets: SZLHOLDINGS/doctrine-v10-v11, SZLHOLDINGS/szl-1-doctrine-sft y SZLHOLDINGS/why-we-lead. No se indica el número de tokens de entrenamiento, la composición del corpus, ni si hubo fases de RLHF, DPO o ajuste supervisado más allá de la referencia a un dataset con sufijo "sft". Tampoco se documentan innovaciones técnicas destacables. La cuantización la ha realizado mradermacher con su pipeline habitual (quantize_version 2, convert_type hf) y no se han publicado cuantizaciones ponderadas o con imatrix para este modelo en el momento de la ficha.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta "conversational" del repositorio.
- Razonamiento de propósito general y respuesta a instrucciones, presumiblemente derivado del ajuste SFT, aunque no se detalla su alcance.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes ni de razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés; no se declaran otros idiomas.
- No se documentan capacidades de visión, audio ni modos de "thinking".
- Compatible con endpoints (etiqueta "endpoints_compatible"), lo que sugiere uso en infraestructura de inferencia estándar.

## Casos de uso

- Prototipado rápido en local: gracias a sus cuantizaciones de 0,4 a 0,6 GB, el modelo puede cargarse en un portátil convencional con llama.cpp u Ollama para experimentar con generación de texto sin depender de la nube.
- Asistente conversacional ligero en inglés: su etiqueta "conversational" y su tamaño permiten integrarlo en chatbots de soporte básico o asistentes de documentación donde la latencia y el coste importan más que la profundidad del razonamiento.
- Filtrado y clasificación de texto: un modelo de 494M puede emplearse para tareas de etiquetado, moderación o enrutamiento de consultas dentro de un pipeline mayor, actuando como primera etapa antes de un modelo más grande.
- Generación de borradores y resúmenes cortos: adecuado para producir textos breves en inglés en entornos con recursos limitados, como dispositivos de borde o contenedores sin GPU.
- Despliegue en entornos aislados o air-gapped: al ser GGUF y Apache 2.0, puede ejecutarse íntegramente en local sin conexión, lo que encaja en escenarios de cumplimiento estricto o investigación reproducible.
- Educación e investigación sobre cuantización: el repositorio ofrece doce variantes de cuantización del mismo modelo, lo que lo convierte en un caso práctico para estudiar el impacto de Q2_K frente a Q8_0 en calidad y tamaño.
- Base para fine-tuning ligero: su reducido número de parámetros permite ajustarlo en una sola GPU consumer, aunque la licencia y la falta de documentación sobre el dataset original deben evaluarse antes de usarlo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-0,7 GB con cuantizaciones Q4_K_M o Q5_K_M, y en torno a 1,2-1,5 GB con f16, incluyendo overhead de contexto y caché KV.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o incluso una GTX 1650 pueden ejecutar las cuantizaciones pequeñas sin problemas.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU dedicadas modernas y en muchas integradas con memoria unificada.
- Despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para los pesos originales en safetensors, transformers con PyTorch.
- Latencia y throughput: no disponibles de forma oficial; por el tamaño del modelo, se espera una generación de decenas de tokens por segundo en GPU consumer y de varios tokens por segundo en CPU, aunque no se aportan mediciones verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| WILLAY (esta ficha) | 494M | no disponible | Apache 2.0 | GGUF y safetensors en HF |
| Qwen2-0.5B | 494M | 32.768 tokens | Apache 2.0 | safetensors, GGUF comunitario |
| SmolLM-360M | 360M | 2.048 tokens | Apache 2.0 | safetensors, GGUF comunitario |
| GPT-2 large | 774M | 1.024 tokens | MIT | safetensors, GGUF comunitario |

La comparación es aproximada: Qwen2-0.5B y SmolLM son alternativas consolidadas en el mismo rango de tamaño con documentación pública de contexto y benchmarks, mientras que WILLAY carece de esos datos. No se dispone de resultados comparativos de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La model card original es extremadamente escasa: no hay información sobre sesgos, datos de entrenamiento detallados ni evaluación de calidad.
- Riesgo de alucinación elevado en un modelo de 494M sin benchmarks publicados; no se recomienda para tareas que exijan alta fiabilidad sin validación previa.
- Cobertura lingüística limitada al inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Longitud de contexto desconocida, lo que impide planificar aplicaciones con ventanas largas.
- La licencia Apache 2.0 permite uso comercial, pero la procedencia y composición de los datasets de doctrina no están documentadas, lo que puede plantear dudas de cumplimiento en entornos regulados.
- Las cuantizaciones Q2_K y Q3_K_S, pese a su reducido tamaño, degradan la calidad de forma notable; para producción se recomienda Q4_K_M o superior.
- No hay cuantizaciones ponderadas (imatrix) publicadas por el autor en el momento de la ficha, lo que limita la comparación de calidad entre variantes.
- El modelo tiene muy pocas descargas y likes, señal de escasa validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/WILLAY-GGUF
- Modelo base: https://huggingface.co/SZLHOLDINGS/WILLAY
- Página de descargas del cuantizador: https://hf.tst.eu/model#WILLAY-GGUF
- Dataset doctrine-v10-v11: https://huggingface.co/datasets/SZLHOLDINGS/doctrine-v10-v11
- Dataset szl-1-doctrine-sft: https://huggingface.co/datasets/SZLHOLDINGS/szl-1-doctrine-sft
- Dataset why-we-lead: https://huggingface.co/datasets/SZLHOLDINGS/why-we-lead
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
