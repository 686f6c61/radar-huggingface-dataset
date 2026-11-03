# mradermacher/Pelican1.0-VL-72B-GGUF

## Resumen

Pelican1.0-VL-72B es un modelo multimodal de 72.700 millones de parámetros desarrollado por X-Humanoid, orientado a robótica y a lo que el autor denomina "Physical AI" o IA encarnada (embodied AI). El modelo combina procesamiento de lenguaje natural con entrada visual, lo que lo hace adecuado para tareas donde un agente debe interpretar imágenes del entorno físico y generar instrucciones o razonamiento accionable. Esta ficha documenta la versión cuantizada en GGUF publicada por mradermacher, que permite ejecutar el modelo en hardware con recursos limitados mediante llama.cpp y herramientas compatibles.

La relevancia de esta ficha radica en que el repositorio original de X-Humanoid no incluye en la información disponible detalles sobre arquitectura interna, datos de entrenamiento ni benchmarks, por lo que la versión GGUF se convierte en la vía práctica de despliegue. El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial, y está etiquetado como compatible con endpoints y con pipeline de robótica.

El contexto de uso es claramente el inglés (único idioma declarado) y el despliegue en entornos de investigación en robótica, simulación y agentes visuales. La versión cuantizada incluye tanto los pesos del modelo como los ficheros de proyección multimodal (mmproj) necesarios para procesar imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal de tipo vision-language; detalles internos no publicados en la informacion disponible) |
| Parametros totales | 72.706.203.648 (72,7 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16; quants con imatrix en repositorio separado (i1-GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna del modelo en la documentación accesible. Por el nombre y las etiquetas (multimodal-learning, vision-language, robotics) se trata de un modelo vision-language, pero no se especifica si emplea un transformer denso, una mezcla de expertos, un adaptador visual con proyector tipo MLP o cross-attention, ni el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de RLHF o DPO. Tampoco se detalla la innovación técnica concreta más allá de su orientación a IA encarnada.

La versión documentada aquí es una cuantización estática realizada por mradermacher a partir de los pesos safetensors del modelo base `X-Humanoid/Pelican1.0-VL-72B`. Se ofrecen cuantizaciones estáticas (este repositorio) y cuantizaciones ponderadas con imatrix en un repositorio separado. Los ficheros mmproj (Q8_0 y f16) son el suplemento multimodal necesario para que el modelo procese imágenes en llama.cpp.

## Capacidades

- Generación de texto y razonamiento en inglés.
- Procesamiento de entrada visual (multimodal) mediante los ficheros mmproj incluidos.
- Orientación declarada a robótica e IA encarnada: interpretación de escenas e instrucciones para agentes físicos.
- Conversación multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no confirmadas explícitamente, aunque la orientación a robótica sugiere razonamiento accionable.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, audio u otras modalidades: no disponible.

## Casos de uso

- Investigación en robótica encarnada: el modelo puede recibir imágenes de una cámara montada en un robot y generar descripciones o instrucciones de alto nivel para planificación de movimiento, aprovechando su naturaleza vision-language y su orientación declarada a embodied AI.
- Anotación y comprensión de escenas en simulación: integrado en pipelines de simulación (por ejemplo, Isaac Sim o MuJoCo) para etiquetar objetos, describir estados del entorno o generar trayectorias en lenguaje natural a partir de renders.
- Asistentes de operador en teleoperación: dado su soporte conversacional y visual, puede resumir lo que ve la cámara de un robot y responder preguntas del operador en tiempo real, con la ventaja de ejecutarse localmente vía GGUF.
- Evaluación de datasets multimodales en robótica: usar el modelo para generar descripciones de referencia y comparar con anotaciones humanas en corpus de manipulacion y navegación.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q4_K_S (44 GB) y Q4_K_M (47,5 GB) permiten ejecutar un modelo de 72B en estaciones de trabajo con 2× RTX 4090 o una única GPU de 48 GB, algo inviable con los pesos en fp16 (unos 145 GB).
- Prototipado de agentes visuales en investigación académica: la licencia Apache 2.0 y la disponibilidad de GGUF facilitan experimentos reproducibles sin depender de APIs propietarias.
- Generación de instrucciones para tareas de manipulación: a partir de una imagen del objeto y del efector, el modelo puede producir una descripción textual de la acción a ejecutar que luego se traduce a comandos de bajo nivel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache): Q2_K ≈ 30 GB; Q3_K_S ≈ 35 GB; Q3_K_M ≈ 38 GB; Q3_K_L ≈ 40 GB; IQ4_XS ≈ 40 GB; Q4_K_S ≈ 44 GB; Q4_K_M ≈ 47,5 GB; Q5_K_S ≈ 51,5 GB; Q5_K_M ≈ 54,5 GB; Q6_K ≈ 64,4 GB; Q8_0 ≈ 77,4 GB. Añadir el mmproj (0,9 GB en Q8_0 o 1,5 GB en f16) y el KV cache según contexto.
- GPU recomendadas: para Q4_K_M, 2× RTX 4090 (48 GB combinados) o una A6000/L40S de 48 GB; para Q8_0, A100 80 GB o H100 80 GB; para Q2_K–Q3_K, una única RTX 4090 de 24 GB no es suficiente en VRAM, pero puede funcionar con offload parcial a RAM del sistema.
- ¿Cabe en GPU de consumo? Solo con offload parcial: ninguna cuantización cabe íntegra en una RTX 4090 de 24 GB. En 2× RTX 4090 sí caben Q4_K_S y Q4_K_M con contexto moderado.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, y servidores compatibles con GGUF. El modelo base original requiere transformers y hardware de mayor capacidad.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia orientativa, un 72B en Q4_K_M sobre 2× RTX 4090 suele moverse en el orden de decenas de tokens por segundo, pero no hay medición publicada para este modelo concreto.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma familia o con benchmarks publicados. Se indica "no disponible" para los campos de rendimiento y contexto, ya que la model card no los detalla.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Pelican1.0-VL-72B (este) | 72,7 B | no disponible | Apache 2.0 | safetensors, GGUF | Orientado a robótica; solo inglés |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se identifican en la información proporcionada |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo entrenado principalmente en inglés, es esperable un sesgo cultural y lingüístico hacia ese idioma.
- Riesgo de alucinación: no cuantificado; como todo modelo generativo, puede producir descripciones visuales incorrectas o instrucciones inviables en robótica, con riesgo físico si se usa en control directo.
- Limitaciones de contexto e idioma: solo se declara inglés; la longitud de contexto no está publicada, lo que impide planificar despliegues con ventanas largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base original (`X-Humanoid/Pelican1.0-VL-72B`) por si difiere.
- Caveat de producción: las cuantizaciones Q2_K y Q3_K degradan la calidad; para robótica se recomienda Q4_K_M o superior. La falta de benchmarks impide garantizar umbrales de precisión.
- La versión GGUF es una cuantización de terceros (mradermacher), no una publicación oficial de X-Humanoid; los resultados pueden diferir de los pesos originales en fp16.
- El repositorio ocupa 522,6 GB en total; descargar solo los ficheros necesarios.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Pelican1.0-VL-72B-GGUF
- Modelo base original: https://huggingface.co/X-Humanoid/Pelican1.0-VL-72B
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Pelican1.0-VL-72B-i1-GGUF
- Página de descarga del autor: https://hf.tst.eu/model#Pelican1.0-VL-72B-GGUF
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
