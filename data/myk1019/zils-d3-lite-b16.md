# myk1019/zils-d3-lite-b16

## Resumen

d3-lite soup body (identificador `myk1019/zils-d3-lite-b16`) es un modelo de lenguaje de aproximadamente 853 millones de parametros publicado en Hugging Face por el usuario myk1019. Se trata de un fine-tune derivado de la mezcla ("soup") de dos modelos previos, `Charlie320/zils-lite-v9a` y `qhoenix/zils-lite-decision-v9`, ambos bajo licencia Apache-2.0, y que a su vez descienden de la familia Qwen3.5.

El modelo se ha entrenado sobre mezclas por grupo de preguntas de las propias respuestas del soup original y de las respuestas de un profesor ("teacher") denominado `vllm-sr/d3-mini`, utilizando datos publicos de decision en el split de entrenamiento, conversaciones de function calling del dataset Glaive y respuestas del teacher Zils Relay. El objetivo declarado es reforzar el comportamiento de decision y de llamada a funciones en un modelo de tamano reducido.

La relevancia de esta ficha es limitada por la escasez de informacion publica: la model card es de una sola frase, no se declaran idiomas, pipeline ni resultados de evaluacion, y el repositorio no registra descargas ni likes en el momento de la consulta. Aun asi, su licencia permisiva y su tamano lo hacen facil de desplegar en hardware de consumo, lo que justifica documentarlo con las reservas oportunas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5 (tag `qwen3_5`, `custom_code`); detalles no disponibles |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se publican GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con codigo personalizado (`custom_code`) |

## Arquitectura y entrenamiento

El modelo es un transformer derivado de la familia Qwen3.5, segun los tags del repositorio y la propia model card. No se especifican el numero de capas, la dimension oculta, el numero de cabezas de atencion ni la longitud de contexto nativa. El tag `custom_code` indica que la carga requiere `trust_remote_code=True` y que el repositorio incluye implementacion propia, lo que anade un riesgo de compatibilidad con frameworks de inferencia estandar.

El entrenamiento descrito consiste en un fine-tune del soup formado por `Charlie320/zils-lite-v9a` y `qhoenix/zils-lite-decision-v9`. Los datos empleados son mezclas por grupo de preguntas de las respuestas del propio soup y del teacher `vllm-sr/d3-mini`, sobre datos publicos de decision del split de entrenamiento, conversaciones de function calling de Glaive y respuestas del teacher Zils Relay. No se indica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO o decodificacion especulativa.

## Capacidades

- Generacion de texto autoregresiva en un modelo de ~853 M de parametros.
- Llamada a funciones (function calling / tool calling), segun el uso declarado de conversaciones Glaive en el entrenamiento.
- Comportamiento orientado a decision, por la herencia del modelo `zils-lite-decision-v9` y el uso de datos de decision en el fine-tune.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Razonamiento multi-paso y modo "thinking": no disponibles.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Clasificacion y enrutado de peticiones: el entrenamiento sobre datos de decision sugiere uso como clasificador de intencion o selector de ruta en pipelines de agentes, donde el coste por inferencia es bajo.
- Function calling en asistentes ligeros: puede integrarse como modelo de extraccion de argumentos y seleccion de herramientas en flujos Glaive-style, con validacion posterior del esquema JSON.
- Prototipado y experimentacion academica: su tamano permite ejecutarlo en una unica GPU de consumo para estudiar tecnicas de model soup y destilacion de teachers.
- Filtrado y preprocesado de datos: uso como modelo auxiliar para etiquetar o puntuar conversaciones antes de alimentar un modelo mayor.
- Despliegue en entornos con recursos limitados: al caber en VRAM de gama media, sirve para demos locales o entornos de borde donde no se puede ejecutar un modelo de decenas de miles de millones de parametros.
- Base para fine-tune especifico: al ser Apache-2.0 y de tamano contenido, es un punto de partida razonable para ajustar tareas de dominio con presupuesto reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en FP16/BF16, los 852.985.920 parametros ocupan aproximadamente 1,7 GB; con overhead de activaciones y cache KV, el consumo realista se situa en torno a 2,5-4 GB.
- En cuantizacion de 8 bits, el peso ronda 0,9 GB; en 4 bits, unos 0,5 GB, aunque no se publican versiones GGUF oficiales y habria que generarlas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4090, A10, L4); A100/H100 son innecesarias salvo para batched serving a gran escala.
- Cabe en GPU de consumo: si, en practicamente todas las GPU discretas modernas con 4 GB o mas.
- Opciones de despliegue: al requerir `custom_code`, la via mas segura es `transformers` con `trust_remote_code=True`; vLLM, llama.cpp, Ollama o TGI solo funcionarian si el codigo personalizado es compatible, lo cual no se confirma.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| myk1019/zils-d3-lite-b16 | 852.985.920 | no disponible | Apache-2.0 | Hugging Face, requiere `custom_code` |
| Qwen2.5-0.5B | ~494 M | 32.768 tokens (variante Instruct) | Apache-2.0 | Amplia, integraciones en vLLM, llama.cpp y Ollama |
| Qwen2.5-1.5B | ~1.540 M | 32.768 tokens (variante Instruct) | Apache-2.0 | Amplia, integraciones en vLLM, llama.cpp y Ollama |
| SmolLM2-1.7B | ~1.700 M | 8.192 tokens | Apache-2.0 | Amplia, amplio soporte de cuantizaciones |

La comparativa se limita a datos de parametros, contexto y licencia; no hay resultados de benchmarks publicados para `zils-d3-lite-b16` que permitan contrastar calidad frente a estas alternativas.

## Limitaciones y advertencias

- Ausencia total de evaluacion publica: no hay benchmarks, ni cartas de evaluacion, ni resultados de terceros; no se puede afirmar su calidad relativa.
- Model card minima: se desconoce el contexto maximo, los idiomas y el pipeline, lo que impide garantizar su comportamiento en produccion.
- Dependencia de `custom_code`: la carga exige ejecutar codigo del repositorio con `trust_remote_code=True`, con el riesgo de seguridad y de incompatibilidad con servidores de inferencia que ello implica.
- Riesgo de alucinacion: propio de un modelo de ~853 M entrenado con datos limitados; no debe usarse como fuente de verdad sin verificacion.
- Sesgos: no documentados; al entrenarse sobre datos publicos de decision y Glaive, puede heredar sesgos de esos corpus.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene conservar los avisos de atribucion y verificar la licencia de los modelos base (Qwen3.5 y los soups citados).
- Trazabilidad limitada: cero descargas y cero likes en el momento de la consulta; no hay historial de uso ni validacion comunitaria.
- Fecha de creacion anomala (2026-11-13) en los metadatos del repositorio, lo que sugiere que los datos de publicacion no deben tomarse como referencia fiable.

## Enlaces

- Hugging Face: https://huggingface.co/myk1019/zils-d3-lite-b16
- Modelo base citado: https://huggingface.co/Charlie320/zils-lite-v9a
- Modelo base citado: https://huggingface.co/qhoenix/zils-lite-decision-v9
- Teacher citado: `vllm-sr/d3-mini` (no se ha localizado URL publica en la informacion disponible)
- Dataset Glaive function calling: no disponible en la informacion proporcionada
- Paper, blog o demo: no disponibles
