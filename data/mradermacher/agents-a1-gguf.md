# mradermacher/Agents-A1-GGUF

## Resumen

Agents-A1 es un modelo de lenguaje de tipo Mixture of Experts (MoE) con capacidades de vision (VLM) y orientado a flujos agénticos, desarrollado originalmente por InternScience. El repositorio aquí descrito, `mradermacher/Agents-A1-GGUF`, no contiene el modelo original sino una colección de cuantizaciones estáticas en formato GGUF generadas por mradermacher a partir de los pesos en safetensors del modelo base. El modelo cuenta con 34.660.610.688 parámetros totales (aproximadamente 34,7 mil millones) según los datos de safetensors del repo base, y está publicado bajo licencia Apache 2.0.

La relevancia de esta ficha radica en que las cuantizaciones GGUF permiten ejecutar un modelo MoE multimodal de ~35B parámetros en hardware de consumo mediante llama.cpp y herramientas compatibles, algo inviable con los pesos completos en precisión original. El autor ofrece un abanico de cuantizaciones que va desde Q2_K (13,0 GB) hasta Q8_0 (37,0 GB), además de dos variantes del proyector multimodal (mmproj) necesarias para el procesamiento de imágenes.

No se dispone de información detallada sobre la longitud de contexto, la composición del dataset de entrenamiento ni los resultados de benchmarks en la información proporcionada. Los tags del modelo (moe, vlm, vision, agentic) y su nombre sugieren un enfoque hacia tareas de agente con percepción visual, pero los detalles técnicos concretos del modelo base no están documentados en esta fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con capacidades de vision (VLM); detalles de la arquitectura interna no disponibles |
| Parametros totales | 34.660.610.688 (~34,7B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) según la model card; otros idiomas no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |
| Tamano del repo | 238,6 GB |
| Modelo base | InternScience/Agents-A1 |
| Cuantizador | mradermacher |
| Descargas | 254 |
| Fecha de creacion | 2026-08-19 |
| Ultima actualizacion | 2026-10-06 |

## Arquitectura y entrenamiento

El modelo base es un Mixture of Experts (MoE) con capacidad multimodal (vlm, vision) según los tags de la model card. La arquitectura concreta (número de expertos, ratio de activación, mecanismo de atención, tipo de encoder visual) no está documentada en la información disponible. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o similares.

Las cuantizaciones de este repositorio son estáticas (static quants), generadas con el pipeline de mradermacher a partir de los pesos en formato Hugging Face (convert_type: hf). Se incluye un proyector multimodal (mmproj) en dos precisiones (Q8_0 y f16), imprescindible para el procesamiento de imágenes en llama.cpp. Para cuantizaciones ponderadas con imatrix, el autor remite a un repositorio separado (`mradermacher/Agents-A1-i1-GGUF`), que suele ofrecer mejor calidad por tamaño que las cuantizaciones estáticas equivalentes.

## Capacidades

- Generación de texto conversacional (tag `conversational`).
- Procesamiento de visión: el modelo incluye un proyector multimodal (mmproj) que permite el análisis de imágenes.
- Orientación agéntica: los tags `agentic` indican soporte previsto para flujos de agente y razonamiento multi-paso, aunque no se detallan las capacidades exactas.
- Arquitectura MoE: activación selectiva de expertos, con el consiguiente ahorro de cómputo respecto a un modelo denso del mismo tamaño total.
- Idiomas: inglés documentado; el resto no disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible.

## Casos de uso

- Asistentes con percepción visual: el modelo puede recibir imágenes junto con texto (gracias al proyector mmproj) para tareas de descripción, extracción de información o respuesta a preguntas sobre capturas, diagramas o documentos escaneados.
- Automatización de flujos agénticos en local: con la cuantización Q4_K_M (21,3 GB) puede desplegarse en una estación de trabajo con GPU de 24 GB, permitiendo orquestar agentes que no envían datos a servicios externos.
- Procesamiento por lotes en servidores con llama.cpp: la cuantización Q8_0 (37,0 GB) ofrece la mejor calidad dentro de la familia estática y puede servirse con llama.cpp server o herramientas compatibles para tareas de generación masiva.
- Prototipado e investigación: las cuantizaciones pequeñas (Q2_K de 13,0 GB, Q3_K_S de 15,3 GB) permiten evaluar el comportamiento del modelo en hardware modesto antes de invertir en infraestructura mayor.
- Integración en pipelines de código abierto: al estar en GGUF y bajo Apache 2.0, puede incorporarse en aplicaciones que usen llama-cpp-python, Ollama u otros runners compatibles con GGUF, incluyendo el soporte multimodal.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse íntegramente en local, es apto para casos donde las imágenes o el texto no pueden salir de la organización.
- Evaluación comparativa de cuantizaciones: el repositorio permite medir la degradación de calidad entre Q2_K y Q8_0 en tareas concretas antes de fijar una cuantización para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización. Q2_K requiere ~13,0 GB de pesos; Q4_K_M ~21,3 GB; Q5_K_M ~24,8 GB; Q6_K ~28,6 GB; Q8_0 ~37,0 GB. Hay que añadir el proyector multimodal (0,7 GB en Q8_0 o 1,0 GB en f16) y el espacio para el contexto KV cache.
- GPU recomendadas: para Q8_0, una A100 40 GB o H100; para Q4_K_M y Q5_K_M, una RTX 4090 (24 GB) o A6000 (48 GB); para Q2_K y Q3_K_S, GPU de 16 GB como RTX 4080 o A4000.
- ¿Cabe en GPU de consumo? Sí: Q4_K_S (20,0 GB) y Q4_K_M (21,3 GB) caben en una RTX 4090 de 24 GB, dejando margen limitado para contexto. Las cuantizaciones Q2_K y Q3_K_S caben en GPU de 16 GB.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, llama-cpp-python y cualquier runner compatible con GGUF y con soporte de mmproj para la parte multimodal. vLLM y TGI no consumen GGUF de forma nativa; para esos motores habría que usar los pesos originales en safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas del modelo base que permitan una comparación rigurosa con alternativas. A continuación se indica lo que puede afirmarse con la información disponible:

| Modelo | Parametros | Contexto | Licencia | Formato GGUF | Notas |
|---|---|---|---|---|---|
| Agents-A1 (este repo) | ~34,7B (MoE) | no disponible | Apache 2.0 | Si (estaticas + imatrix) | VLM, agentic, solo ingles documentado |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No hay datos suficientes para establecer comparaciones fiables |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo entrenado principalmente en inglés, es previsible un sesgo hacia contenido anglófono, pero no se aportan datos concretos.
- Riesgo de alucinación: no cuantificado; como en cualquier LLM, existe riesgo, y las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden incrementarlo.
- Limitaciones de idioma: solo el inglés está documentado en la model card; el rendimiento en castellano u otros idiomas no está garantizado.
- Limitaciones de contexto: la longitud de contexto no está disponible, lo que impide planificar despliegues con ventanas largas sin verificación previa.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base (`InternScience/Agents-A1`) por si impone condiciones adicionales.
- Calidad de las cuantizaciones: las cuantizaciones estáticas de baja precisión pueden degradar tareas sensibles (razonamiento, código). El autor recomienda las cuantizaciones imatrix del repositorio `Agents-A1-i1-GGUF` para mejor relación calidad/tamaño.
- Soporte multimodal en llama.cpp: requiere cargar el mmproj correspondiente; sin él, el modelo funciona solo como LLM de texto.
- Fecha de creación futura: el repositorio figura creado el 2026-08-19, dato que conviene contrastar con la ficha del modelo base antes de usarlo en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Agents-A1-GGUF
- Modelo base: https://huggingface.co/InternScience/Agents-A1
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Agents-A1-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Agents-A1-GGUF
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
