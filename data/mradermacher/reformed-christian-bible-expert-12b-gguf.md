# mradermacher/Reformed-Christian-Bible-Expert-12B-GGUF

## Resumen
Reformed-Christian-Bible-Expert-12B-GGUF es un repositorio de cuantizaciones GGUF estáticas del modelo sleepdeprived3/Reformed-Christian-Bible-Expert-12B, un modelo de lenguaje de 12.247.782.400 parámetros orientado, por su denominación y etiquetas, a consultas sobre Biblia, teología reformada, Jesús y formación en seminario. Lo publica mradermacher, cuantizador de la comunidad, no el autor del modelo base. La licencia declarada es Apache 2.0 y el único idioma soportado es el inglés.

Su relevancia práctica es que permite ejecutar un modelo de 12B en hardware de consumo mediante llama.cpp u Ollama, con archivos que van desde 4,9 GB (Q2_K) hasta 13,1 GB (Q8_0). La información disponible no incluye arquitectura, longitud de contexto, datos de entrenamiento ni resultados de benchmarks, por lo que la calidad debe validarse localmente.

Está pensado para aplicaciones de estudio bíblico y teología reformada en inglés con despliegue local, no para uso comercial crítico sin verificación humana. No es un modelo generalista validado ni dispone de evaluación pública de sesgos o alucinaciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no especificada en la model card) |
| Parámetros totales | 12.247.782.400 (aproximadamente 12,25B) |
| Parámetros activos | no aplica; no se indica que sea MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); el formato del modelo base no se detalla en la información disponible |

## Arquitectura y entrenamiento
La model card de este repositorio no documenta la arquitectura del modelo base. Se sabe que el modelo original tiene 12.247.782.400 parámetros y que este repositorio contiene cuantizaciones estáticas generadas con `convert_type: hf` y `quantize_version: 2`, según los metadatos comentados en el README. No se indica si el modelo base es un transformer decoder-only, un MoE o una arquitectura híbrida, ni se detallan capas, dimensiones ocultas o mecanismo de atención.

Tampoco se especifican los datos de entrenamiento: número de tokens, composición del corpus, uso de RLHF/DPO o proceso de fine-tuning. El nombre del modelo sugiere un ajuste orientado a teología reformada y Biblia, pero no hay información verificable sobre el dataset. mradermacher indica que no hay cuantizaciones ponderadas/imatrix disponibles en el momento de publicación; solo se ofrecen cuantizaciones estáticas.

## Capacidades
- Generación de texto conversacional en inglés.
- Especialización temática: por nombre y etiquetas, respuestas sobre Biblia, teología reformada, Jesús y seminario. No hay evaluación publicada que cuantifique esta capacidad.
- Compatibilidad con el ecosistema GGUF: llama.cpp, Ollama, LM Studio, koboldcpp y text-generation-webui.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Multilingüismo: solo inglés declarado.
- No se documenta modo thinking, visión, audio ni otras modalidades.

## Casos de uso
- Asistente de estudio bíblico personal: consultas sobre pasajes, contextos históricos y doctrina reformada en inglés, ejecutado en local para preservar la privacidad de las consultas. Es adecuado por su especialización temática declarada y su tamaño manejable en GPU de consumo.
- Preparación de sermones y estudios: generación de borradores, preguntas de reflexión y comparación de interpretaciones reformadas. Requiere verificación humana de citas bíblicas y referencias históricas por riesgo de alucinación.
- Chatbot educativo para seminarios: preguntas de teología sistemática, historia de la iglesia y confesiones reformadas. El formato GGUF permite desplegarlo en aulas o laboratorios sin conexión a Internet.
- Apoyo a catequesis y grupos pequeños: explicaciones sencillas y respuestas a preguntas frecuentes en inglés. No sustituye la supervisión pastoral ni la enseñanza de un responsable formado.
- Despliegue offline en entornos con requisitos de privacidad: iglesias u organizaciones que no quieren enviar consultas a servicios en la nube. llama.cpp u Ollama permiten ejecutarlo en un portátil o estación de trabajo.
- Prototipado de asistentes especializados: servir como base de inferencia para validar flujos conversacionales antes de invertir en un modelo mayor o en un fine-tuning adicional.
- Investigación sobre sesgos teológicos: analizar cómo un modelo entrenado con perspectiva reformada responde a cuestiones doctrinales controvertidas. Los resultados deben interpretarse con cautela porque no se documenta el corpus de entrenamiento.
- Generación de contenido devocional: borradores de meditaciones, oraciones y guiones para grupos pequeños. La revisión humana es obligatoria para evitar errores doctrinales o citas inventadas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni evaluaciones específicas de teología o fidelidad bíblica. No se deben inferir cifras a partir del tamaño del modelo.

## Requisitos de hardware
- VRAM estimada para inferencia (solo pesos): Q2_K 4,9 GB; IQ4_XS 6,9 GB; Q4_K_M 7,6 GB; Q5_K_M 8,8 GB; Q6_K 10,2 GB; Q8_0 13,1 GB. Añadir aproximadamente 1-3 GB para caché KV y overhead según contexto y backend.
- GPU de consumo: una RTX 3060 de 12 GB puede ejecutar Q4_K_M y Q5_K_S con contexto moderado; una RTX 4070 Ti de 16 GB permite Q5_K_M y Q6_K; una RTX 4090 de 24 GB puede ejecutar Q8_0 con margen.
- Apple Silicon: 16 GB de memoria unificada son suficientes para Q4_K_M; 32 GB permiten Q8_0 con contexto amplio.
- CPU: es posible la inferencia con llama.cpp en CPU, aunque la latencia será considerablemente mayor. Se recomienda al menos 16 GB de RAM para cuantizaciones Q4 y 32 GB para Q8_0.
- Despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y text-generation-webui. vLLM y TGI no están orientados a GGUF en este repositorio; para GGUF es preferible llama.cpp u Ollama.
- Latencia y throughput: no disponible. Dependen de la GPU, la cuantización, la longitud de contexto y el backend.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Este repositorio (GGUF) | 12.247.782.400 | no disponible | no disponible | Apache 2.0 | GGUF | Hugging Face; 310 descargas, 5 likes |
| Modelo base sleepdeprived3/Reformed-Christian-Bible-Expert-12B | 12.247.782.400 | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas de dominio bíblico/reformado de ~12B | no disponible | no disponible | no disponible | no disponible | no disponible | no identificadas en la información disponible |

No se dispone de comparativas de rendimiento verificadas. La alternativa directa es el modelo base sin cuantizar; otras alternativas de tamaño similar no se evalúan aquí por falta de datos en la información proporcionada.

## Limitaciones y advertencias
- Solo soporta inglés, según la model card. No es adecuado para consultas en castellano sin un proceso de traducción o adaptación.
- Sesgo teológico: el nombre y las etiquetas indican una perspectiva reformada. Las respuestas pueden presentar una interpretación confesional como normativa y no son neutrales.
- Riesgo de alucinación en citas bíblicas, referencias históricas y doctrina. Es imprescindible verificar cualquier cita o afirmación factual.
- No hay benchmarks ni documentación del entrenamiento. La calidad real del modelo no está validada públicamente.
- Longitud de contexto desconocida. No se recomienda usarlo con documentos muy largos sin probar antes el comportamiento y los límites.
- Las cuantizaciones Q2_K y Q3 pueden degradar la calidad. Para uso serio se recomienda Q4_K_M o superior.
- La licencia Apache 2.0 permite uso comercial, pero no se documenta la procedencia de los datos de entrenamiento del modelo base. Conviene revisar aspectos de copyright y atribución antes de un despliegue comercial.
- No debe usarse para consejo pastoral crítico, médico, legal o financiero sin supervisión de un profesional.
- El repositorio pesa 84,7 GB porque incluye múltiples cuantizaciones. Descargar únicamente el archivo GGUF necesario.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/mradermacher/Reformed-Christian-Bible-Expert-12B-GGUF
- Modelo base: https://huggingface.co/sleepdeprived3/Reformed-Christian-Bible-Expert-12B
- Página de descargas y visión general: https://hf.tst.eu/model#Reformed-Christian-Bible-Expert-12B-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
