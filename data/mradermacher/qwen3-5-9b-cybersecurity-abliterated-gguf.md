# mradermacher/Qwen3.5-9B-CyberSecurity-Abliterated-GGUF

## Resumen

Qwen3.5-9B-CyberSecurity-Abliterated-GGUF es una cuantización estática en formato GGUF del modelo jeonjw/Qwen3.5-9B-CyberSecurity-Abliterated, publicada por el cuantizador mradermacher. El modelo base deriva de la familia Qwen3.5 (9B parámetros) y ha sido especializado en ciberseguridad y sometido a una técnica de "abliteration", que elimina o atenúa las capas de rechazo alineadas para reducir las negativas del modelo ante peticiones sensibles. Esta versión GGUF facilita la ejecución local con llama.cpp y herramientas compatibles, sin necesidad de GPU de gama alta.

La relevancia de esta ficha es doble: por un lado, documenta un modelo especializado en dominio de seguridad; por otro, advierte de que la abliteración elimina salvaguardas de alineación, lo que tiene implicaciones directas para el uso responsable y en producción. El repositorio ocupa 83 GB e incluye 12 cuantizaciones más dos ficheros mmproj (multi-modal) en Q8_0 y f16.

El modelo tiene 8.953.803.264 parámetros (≈8,95B) según los safetensors del modelo base, licencia Apache 2.0 e idioma declarado inglés. No se dispone de información sobre longitud de contexto, arquitectura interna ni datos de entrenamiento en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Qwen3.5) |
| Parámetros totales | 8.953.803.264 (≈8,95B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en safetensors |
| Tamaño del repositorio | 83,0 GB |
| Modelo base | jeonjw/Qwen3.5-9B-CyberSecurity-Abliterated |
| Cuantizador | mradermacher |
| Fecha de creación | 2026-11-18 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. Por la denominación Qwen3.5-9B se infiere que pertenece a la familia Qwen3.5 de Alibaba, pero no se confirman en la información proporcionada ni el tipo de transformer, ni si emplea atención lineal, decodificación especulativa u otras innovaciones. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

El rasgo técnico diferencial es la "abliteration": una modificación de los pesos orientada a reducir la probabilidad de respuestas de rechazo ante peticiones que el modelo original consideraría sensibles. Esta técnica suele implicar la identificación y el ajuste de direcciones en el espacio de activaciones asociadas al comportamiento de negativa. La información proporcionada no documenta el procedimiento exacto aplicado por jeonjw ni el impacto cuantificado sobre capacidades o seguridad. La especialización en ciberseguridad se declara mediante el tag `cybersecurity`, pero no se detalla el corpus de ajuste.

Esta ficha documenta únicamente la cuantización GGUF de mradermacher: cuantizaciones estáticas (no ponderadas ni con imatrix, según indica el autor) generadas a partir del modelo base en formato Hugging Face.

## Capacidades

- Generación de texto conversacional en inglés, según el tag `conversational` del repositorio.
- Especialización declarada en ciberseguridad (tag `cybersecurity`), sin detalle de las tareas concretas cubiertas.
- Comportamiento "abliterated": menor tendencia a rechazar peticiones que el modelo base alineado consideraría sensibles.
- Soporte multi-modal: el repositorio incluye ficheros `mmproj` (Q8_0 y f16), lo que sugiere capacidad de procesamiento de imágenes en el modelo base, aunque no se detalla el alcance.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que permite su despliegue en infraestructuras de inferencia compatibles.
- No se dispone de información sobre tool calling, function calling, razonamiento multi-paso, modo thinking ni otras capacidades avanzadas.

## Casos de uso

- Análisis de vulnerabilidades en entornos controlados: el modelo, especializado en ciberseguridad, puede asistir en la revisión de configuraciones y la interpretación de hallazgos de escáneres, siempre dentro de un marco de pruebas autorizadas.
- Formación y concienciación en seguridad: generación de escenarios de phishing simulado y material didáctico para equipos de blue team, aprovechando la reducción de rechazos para cubrir casos de estudio realistas.
- Investigación en alineación y seguridad de IA: el modelo sirve como objeto de estudio para analizar el efecto de la abliteración sobre las negativas y las capacidades residuales, comparándolo con el modelo base alineado.
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_S (5,5 GB) y Q4_K_M (5,7 GB) permiten ejecución en CPU o GPU de consumo con llama.cpp, útil para laboratorios sin infraestructura dedicada.
- Procesamiento de documentación técnica de seguridad: resumen y extracción de información de informes, RFC y guías de hardening en inglés, idioma declarado del modelo.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 12 niveles de cuantización, lo que permite medir el compromiso entre tamaño, velocidad y calidad en tareas de seguridad antes de fijar una versión para producción.
- Prototipado de asistentes conversacionales especializados: con el tag `conversational` y compatibilidad de endpoints, puede integrarse en demos de chat orientadas a dominios de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead aproximado de contexto):
  - Q2_K: ~3,9 GB de pesos; ~5-6 GB en total.
  - Q4_K_S / Q4_K_M: ~5,5-5,7 GB de pesos; ~7-8 GB en total.
  - Q5_K_M: ~6,6 GB de pesos; ~8-9 GB en total.
  - Q6_K: ~7,5 GB de pesos; ~9-10 GB en total.
  - Q8_0: ~9,6 GB de pesos; ~11-12 GB en total.
  - f16: ~18 GB de pesos; ~20 GB en total.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4-Q6; RTX 4090 24 GB para Q8_0 y f16 con contexto amplio; A100/H100 solo si se requiere alto throughput o contexto muy largo (no documentado).
- Cabe en GPU de consumo: sí, desde Q4_K_S en GPUs de 8 GB; Q8_0 requiere 12-16 GB; f16 requiere 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; el modelo base admite transformers. Los ficheros `mmproj` permiten uso multi-modal en llama.cpp.
- Latencia y throughput: no disponibles. Como referencia cualitativa, el autor marca Q4_K_S y Q4_K_M como "fast, recommended" y Q8_0 como "fast, best quality".

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-CyberSecurity-Abliterated (GGUF, esta ficha) | 8,95B | no disponible | Apache 2.0 | GGUF (12 cuantizaciones) | Especializado en ciberseguridad, abliterated, multi-modal (mmproj) |
| jeonjw/Qwen3.5-9B-CyberSecurity-Abliterated | 8,95B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar del que deriva esta ficha |
| Modelo Qwen3.5-9B original (alineado) | ~9B | no disponible | no disponible en la información | safetensors/GGUF | Referencia alineada; no se dispone de datos comparativos de rendimiento |

No se dispone de información sobre benchmarks ni de modelos comparables adicionales en la documentación proporcionada. La comparación con el modelo original alineado es cualitativa: la abliteración reduce negativas a costa de posibles degradaciones en seguridad y coherencia que no están cuantificadas.

## Limitaciones y advertencias

- La abliteración elimina o reduce salvaguardas de alineación: el modelo puede generar contenido dañino, instrucciones de ataque o material sensible sin las negativas del modelo original. No debe exponerse a usuarios no supervisados.
- Riesgo elevado de alucinación en un dominio donde los errores técnicos tienen consecuencias reales (explotación, configuraciones, mitigaciones).
- Solo se declara inglés; el rendimiento en castellano u otros idiomas no está verificado y probablemente sea inferior.
- No se documentan sesgos conocidos, pero la ausencia de información no implica ausencia de sesgos.
- Licencia Apache 2.0 permite uso comercial, pero el uso comercial de un modelo abliterated en ciberseguridad conlleva responsabilidad legal y de cumplimiento (por ejemplo, normativa de ciberseguridad y leyes de doble uso).
- Cuantizaciones estáticas sin imatrix: las versiones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; el autor no ha publicado versiones ponderadas.
- El repositorio ocupa 83 GB; descargar todas las cuantizaciones no es necesario ni recomendable.
- No se dispone de información sobre la longitud de contexto real, lo que impide planificar cargas de trabajo con ventanas largas.
- El modelo base y esta cuantización tienen 0 descargas y 0 likes en el momento de la ficha: no hay evidencia comunitaria de validación.

## Enlaces

- Repositorio Hugging Face (esta cuantización): https://huggingface.co/mradermacher/Qwen3.5-9B-CyberSecurity-Abliterated-GGUF
- Modelo base: https://huggingface.co/jeonjw/Qwen3.5-9B-CyberSecurity-Abliterated
- Página de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.5-9B-CyberSecurity-Abliterated-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
