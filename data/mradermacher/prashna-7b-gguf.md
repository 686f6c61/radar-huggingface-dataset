# mradermacher/Prashna-7b-GGUF

## Resumen

Prashna-7b es un modelo conversacional de 7.615 millones de parámetros orientado a educación, tutoría y pedagogía socrática, desarrollado por rachitgoyell sobre la arquitectura Qwen2. El repositorio aquí descrito corresponde a la cuantización GGUF publicada por mradermacher, un cuantizador conocido por generar versiones estáticas de modelos populares para su ejecución local con llama.cpp y derivados.

El propósito del modelo es actuar como tutor conversacional que guía al estudiante mediante preguntas en lugar de dar respuestas directas, siguiendo el método socrático. Esto lo hace relevante para aplicaciones educativas donde se busca fomentar el razonamiento del usuario en lugar de resolverle la tarea. Al estar basado en Qwen2, hereda una arquitectura transformer madura y bien soportada por el ecosistema de inferencia.

La versión cuantizada ofrece desde Q2_K (3,1 GB) hasta f16 (15,3 GB), lo que permite ejecutarlo en hardware muy variado, desde portátiles con GPU modesta hasta estaciones de trabajo. La licencia Apache 2.0 del modelo base permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base está disponible en safetensors) |

## Arquitectura y entrenamiento

El modelo base, rachitgoyell/Prashna-7b, utiliza la arquitectura Qwen2, un transformer decoder estándar con las mejoras habituales de esta familia (RoPE, SwiGLU, RMSNorm). No es un modelo MoE: todos los parámetros están activos en cada pasada.

No se dispone de información sobre el proceso de entrenamiento del modelo base: número de tokens, composición del dataset, uso de fine-tuning supervisado, RLHF o DPO. Por las etiquetas (education, tutoring, socratic, pedagogy, conversational), todo apunta a un fine-tuning de Qwen2-7B orientado a dialogo educativo, pero no hay model card detallada que lo confirme.

La versión de mradermacher es una cuantización estática en formato GGUF, generada mediante conversión desde los pesos safetensors originales. Existe también una versión con imatrix (matriz de importancia) en mradermacher/Prashna-7b-i1-GGUF, que suele ofrecer mejor calidad a igual tamaño de archivo.

## Capacidades

- Generación de texto conversacional orientada a tutoría educativa
- Método socrático: formula preguntas guiadas para que el estudiante razone por sí mismo
- Soporte de pedagogía y acompañamiento de aprendizaje (tutoring)
- Capacidades de razonamiento, código y matemáticas heredadas de Qwen2, sin datos concretos publicados
- Soporte de tool calling: no disponible
- Capacidades multimodales: no disponible (modelo solo de texto)
- Idioma principal: inglés; el rendimiento en castellano no está documentado y probablemente sea limitado

## Casos de uso

- **Tutoría socrática en plataformas educativas**: integración como backend conversacional que guía al alumno con preguntas en lugar de resolverle el ejercicio, ideal para apps de estudio y refuerzo escolar.
- **Asistente de aprendizaje autónomo**: un estudiante puede dialogar sobre un tema y el modelo le conduce paso a paso mediante preguntas, favoreciendo el aprendizaje activo.
- **Prototipado local de edtech**: con la cuantización Q4_K_M (4,8 GB) se puede desplegar en un portátil con GPU de consumo para validar productos educativos sin coste de API.
- **Herramienta de estudio offline**: ejecución con llama.cpp u Ollama en equipos sin conexión, útil en entornos con conectividad limitada.
- **Generación de preguntas didácticas**: creación de bancos de preguntas guiadas a partir de material de estudio para profesores o creadores de contenido educativo.
- **Investigación en pedagogía con LLM**: base experimental para estudiar cómo los modelos socráticos afectan a la retención de conocimiento frente a modelos que dan respuestas directas.
- **Chatbot de acompañamiento en bootcamps o MOOCs**: soporte multi-turno en inglés para resolver dudas comunes sin revelar la solución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/disco estimado según cuantización: Q2_K 3,1 GB; Q4_K_M 4,8 GB; Q6_K 6,4 GB; Q8_0 8,2 GB; f16 15,3 GB (más margen para el contexto, aproximadamente 1-2 GB adicional según longitud)
- Cabe con holgura en GPUs de consumo: una RTX 3060 de 12 GB ejecuta Q6_K o Q8_0 por completo; una RTX 4090 (24 GB) permite f16 con contexto amplio
- En CPU pura (sin GPU) es viable con Q4_K_M a velocidades de unos pocos tokens por segundo en CPUs de escritorio modernas; con GPU dedicada el throughput es muy superior
- GPUs recomendadas: cualquier GPU con 6 GB o más para cuants de 4 bits; RTX 3060/4060 Ti/4070 para uso cómodo; A100/H100 solo necesarios para servir muchos usuarios concurrentes
- Despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp, llama-cpp-python; el modelo base en safetensors admite vLLM, TGI y SGLang
- Latencia y throughput exactos: no disponible

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Prashna-7b | 7,6 B | Qwen2 (denso) | no disponible | Apache 2.0 | Tutoría socrática |
| Qwen2.5-7B-Instruct | 7,6 B | Qwen2.5 (denso) | 128 K | Apache 2.0 | Uso general |
| Llama-3.1-8B-Instruct | 8 B | Llama 3.1 (denso) | 128 K | Llama 3.1 Community | Uso general |
| OpenChat-3.5-7B | 7,6 B | Mistral (denso) | 8 K | Apache 2.0 | Conversacional |

Prashna-7b se diferencia de los modelos generales de su tamaño por su especialización en pedagogía socrática; a cambio, su documentación de rendimiento es mucho más escasa y su contexto no está publicado. Para uso general o contextos largos, Qwen2.5-7B-Instruct o Llama-3.1-8B están mejor documentados.

## Limitaciones y advertencias

- Documentación del modelo base muy escasa: no hay datos de entrenamiento, benchmarks ni evaluaciones publicadas, lo que dificulta evaluar su calidad con rigor
- Entrenado para inglés; el comportamiento en castellano no está verificado y puede ser deficiente
- Riesgo de alucinación típico de modelos de 7-8 B, especialmente en contenidos educativos donde la exactitud es crítica; conviene supervisión humana en contextos de aprendizaje
- Sesgos: no se han publicado auditorías; hereda los sesgos de Qwen2 y de sus datos de fine-tuning, cuya composición se desconoce
- Longitud de contexto no documentada: no es posible garantizar rendimiento en conversaciones multi-turno muy largas
- Licencia Apache 2.0 sin restricciones comerciales relevantes, aunque conviene verificar la model card del modelo base por si acaso hubiera cambios
- Las cuants Q2_K y Q3_K_M tienen calidad notablemente degradada; para producción se recomienda Q4_K_M o superior
- Al ser un modelo especializado en método socrático, no es adecuado como asistente que dé respuestas directas o resuma información

## Enlaces

- Repositorio cuantizado (GGUF): https://huggingface.co/mradermacher/Prashna-7b-GGUF
- Modelo base: https://huggingface.co/rachitgoyell/Prashna-7b
- Cuants imatrix/weighted: https://huggingface.co/mradermacher/Prashna-7b-i1-GGUF
- Página de descargas resumida: https://hf.tst.eu/model#Prashna-7b-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
