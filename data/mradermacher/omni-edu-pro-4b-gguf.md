# mradermacher/Omni-Edu-Pro-4B-GGUF

## Resumen

Omni-Edu-Pro-4B es un modelo de lenguaje de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) orientado al ámbito educativo, en concreto a la tutoría y el aprendizaje en niveles K-12. El modelo original lo desarrolla el autor identificado como lhpku20010120 y esta ficha documenta la versión cuantizada publicada por mradermacher, un conocido generador de cuantizaciones GGUF. El modelo declara estar especializado en "curriculum-grounding", es decir, fundamentar las respuestas en el currículo educativo, y se presenta como multimodal.

La relevancia de esta publicación reside en que ofrece el modelo base en múltiples niveles de cuantización GGUF (desde Q2_K hasta f16, además de los suplementos multimodales mmproj), lo que permite ejecutarlo en hardware de consumo. El modelo base está entrenado mediante aprendizaje por refuerzo (PPO) según los tags de la model card, y se distribuye bajo licencia Apache 2.0.

No se dispone de información detallada sobre arquitectura interna, longitud de contexto ni composición del dataset en la información proporcionada; los datos disponibles se limitan a la model card de la cuantización y a los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer, detalles no especificados) |
| Parametros totales | 4.205.751.296 (~4,2 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; suplementos mmproj en Q8_0 y f16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base (no se especifica si es un transformer denso, MoE o híbrido, ni el número de capas, dimensiones ocultas o mecanismo de atención). El pipeline declarado en Hugging Face es "reinforcement-learning" y los tags incluyen "ppo", lo que indica que el modelo base fue ajustado mediante aprendizaje por refuerzo con Proximal Policy Optimization, presumiblemente sobre un modelo preentrenado previo.

El dataset asociado es lhpku20010120/Omni-Edu-Pro, y los tags apuntan a un enfoque en educación K-12, tutoría y fundamentación curricular. El modelo se etiqueta como multimodal, y la cuantización incluye ficheros mmproj (proyección multimodal) que permiten procesar entradas de imagen junto con texto en llama.cpp. No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset ni detalles del proceso de RLHF/PPO.

## Capacidades

- Generación de texto conversacional orientada a tutoría educativa.
- Capacidades multimodales: los ficheros mmproj indican soporte de entrada de imágenes junto con texto.
- Enfoque en fundamentación curricular ("curriculum-grounding") para respuestas alineadas con contenidos K-12.
- Ajuste mediante aprendizaje por refuerzo (PPO) para alinear el comportamiento del modelo.
- Soporte de conversación multi-turno (tag "conversational").
- Compatibilidad con endpoints (tag "endpoints_compatible").
- Idioma: inglés.
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso en la información disponible.

## Casos de uso

- Tutoría educativa automatizada: el modelo puede mantener conversaciones de apoyo al estudiante en inglés sobre materias K-12, aprovechando su ajuste por refuerzo y su orientación curricular para ofrecer explicaciones didácticas.
- Asistencia con deberes y resolución de dudas: adecuado para responder preguntas de matemáticas, ciencias o lengua a nivel escolar, con un tono pedagógico derivado del entrenamiento específico.
- Explicación de material con imágenes: gracias a los ficheros mmproj, puede procesar diagramas, gráficos o ejercicios escaneados y describirlos o resolverlos en un entorno llama.cpp.
- Despliegue en hardware de consumo para prototipos educativos: las cuantizaciones Q4_K_M (2,8 GB) y Q5_K_M (3,2 GB) permiten ejecutar el modelo en portátiles y equipos sin GPU dedicada de gama alta, facilitando pruebas de concepto en entornos escolares.
- Generación de material de práctica: puede redactar ejercicios y preguntas de repaso alineadas con el currículo, útil para docentes que preparan contenido.
- Integración en plataformas de e-learning: mediante endpoints compatibles, puede conectarse a backends de servicio para ofrecer respuestas conversacionales dentro de una aplicación educativa.
- Investigación sobre alineación con RL: al estar ajustado con PPO, sirve como caso de estudio para investigadores que analizan el efecto del aprendizaje por refuerzo en dominios especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~2,1 GB.
  - Q4_K_M: ~2,8 GB.
  - Q5_K_M: ~3,2 GB.
  - Q6_K: ~3,6 GB.
  - Q8_0: ~4,6 GB.
  - f16: ~8,5 GB.
- Suplemento multimodal mmproj: ~0,5 GB (Q8_0) o ~0,8 GB (f16) adicionales si se usa entrada de imagen.
- Cabe en GPU de consumo: sí, en tarjetas con 6-8 GB de VRAM o más para cuantizaciones Q4-Q8; las cuantizaciones Q4 caben incluso en GPUs de 4 GB con contexto reducido.
- GPU recomendadas: RTX 3060/4060 (8-12 GB) para Q5-Q8; RTX 4090 o A100/H100 solo necesarias para f16 o para servir muchas peticiones concurrentes.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base puede servirse con vLLM o TGI si se usa el formato transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Omni-Edu-Pro-4B (esta ficha) | ~4,2 B | no disponible | Apache 2.0 | GGUF, transformers | Especializado en educación K-12, multimodal, ajustado con PPO |
| Modelos comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre alternativas equivalentes en la documentación proporcionada |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al estar entrenado para currículo K-12 en inglés, puede reflejar sesgos culturales y curriculares del dataset de entrenamiento.
- Riesgo de alucinación: presente como en cualquier modelo de ~4 B; en contexto educativo el riesgo es crítico, ya que respuestas incorrectas pueden confundir al estudiante. Se recomienda validación humana.
- Limitaciones de idioma: solo se declara inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Contexto: la longitud de contexto no está documentada, lo que dificulta planificar conversaciones largas o documentos extensos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar los términos del modelo base original y del dataset.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar notablemente la calidad de las respuestas educativas; se recomienda Q4_K_M o superior para uso en producción.
- El modelo es una cuantización estática; para cuantizaciones ponderadas/imatrix existe una versión separada (i1-GGUF).
- No hay información sobre tool calling ni capacidades agénticas, por lo que no debe asumirse su disponibilidad.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/mradermacher/Omni-Edu-Pro-4B-GGUF
- Modelo base: https://huggingface.co/lhpku20010120/Omni-Edu-Pro-4B
- Dataset: https://huggingface.co/datasets/lhpku20010120/Omni-Edu-Pro
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Omni-Edu-Pro-4B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Omni-Edu-Pro-4B-GGUF
- Peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
