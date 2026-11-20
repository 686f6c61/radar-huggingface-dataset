# mradermacher/Liminar-Qwen3.5-27B-GGUF

## Resumen

Liminar-Qwen3.5-27B-GGUF es la versión cuantizada en formato GGUF del modelo Liminar-Qwen3.5-27B, desarrollado originalmente por el grupo LICDIA de la Universidad Nacional de Luján (Argentina) y cuantizado por mradermacher. Se trata de un ajuste fino sobre una base Qwen3.5 de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones), orientado específicamente al dominio de normativa universitaria argentina y al español rioplatense. El modelo está etiquetado con los descriptores "liminar", "argentina", "universidades" y "normativa", lo que delimita claramente su ámbito de especialización.

La relevancia de esta ficha radica en que el repositorio GGUF facilita el despliegue local del modelo mediante llama.cpp y herramientas compatibles, sin necesidad de infraestructura de GPU de datacenter. El repositorio original pesa 190,7 GB, mientras que las cuantizaciones estáticas ofrecidas van desde 11,3 GB (Q2_K) hasta 29,1 GB (Q8_0), lo que permite ajustar el consumo de memoria a hardware muy diverso.

La licencia Apache 2.0 y el soporte declarado únicamente para español convierten a este modelo en una opción especializada para aplicaciones de consulta normativa, atención a estudiantes y automatización documental en el ámbito universitario hispanohablante, más que en un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de Qwen3.5; detalles de arquitectura no publicados en la información disponible) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (cuantizaciones estáticas; no hay imatrix/weighted disponibles según el autor) |
| Idiomas soportados | es (español) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repositorio de cuantizaciones); el modelo base se distribuye en formato transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. El nombre indica que deriva de una base Qwen3.5, y el recuento real de parámetros en safetensors es de 27.320.697.856, lo que sitúa al modelo en la franja de 27 B. No se especifica si emplea atención lineal, decodificación especulativa, mezcla de expertos ni otras innovaciones técnicas.

Tampoco se detallan el volumen de tokens de entrenamiento, la composición del dataset de ajuste fino ni si se aplicaron técnicas de RLHF o DPO. Las etiquetas del repositorio ("argentina", "universidades", "normativa") sugieren un ajuste fino orientado a normativa universitaria argentina, pero no se aportan cifras concretas sobre el corpus utilizado. El proceso de cuantización realizado por mradermacher es estático (quantize_version 2, output_tensor_quantised 1, convert_type hf), sin cuantizaciones ponderadas por imatrix en el momento de la publicación.

## Capacidades

- Generación de texto conversacional en español, con orientación al dominio de normativa universitaria argentina.
- Consulta y explicación de normativa y documentación universitaria, según la especialización declarada en las etiquetas del modelo.
- Conversación multi-turno (etiqueta "conversational" en el repositorio).
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- Capacidades de razonamiento general heredadas de la base Qwen3.5: no verificadas en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Atención a estudiantes en oficinas de alumnado: el modelo puede gestionar consultas conversacionales sobre trámites, plazos y requisitos, apoyándose en su ajuste sobre normativa universitaria argentina y en el formato GGUF para despliegue local en servidores modestos.
- Consulta de reglamentos y resoluciones internas: integrado en un sistema RAG, el modelo responde preguntas sobre articulado y procedimientos administrativos, con la ventaja de que el corpus de ajuste ya está alineado con el dominio normativo.
- Asistencia a personal administrativo: generación de borradores de respuestas, resúmenes de expedientes y explicaciones de procedimientos, reduciendo el tiempo de redacción en tareas repetitivas.
- Despliegue en infraestructura universitaria con recursos limitados: las cuantizaciones Q4_K_S (15,9 GB) y Q4_K_M (17,1 GB) permiten ejecutar el modelo en estaciones de trabajo con GPU de consumo, algo inviable con el repositorio original de 190,7 GB.
- Prototipado e investigación en PLN jurídico-administrativo: investigadores pueden evaluar el comportamiento del modelo en español rioplatense y en textos normativos sin depender de APIs externas, gracias a la licencia Apache 2.0.
- Chatbot de orientación para portales web universitarios: la etiqueta "endpoints_compatible" facilita su integración en servicios HTTP, y el tamaño de 27 B ofrece un equilibrio entre calidad y coste de inferencia.
- Generación de material divulgativo: explicación de normativa compleja en lenguaje llano para estudiantes de nuevo ingreso, aprovechando la especialización del ajuste fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, más overhead de contexto):
  - Q2_K (11,3 GB): aproximadamente 12-13 GB de VRAM o memoria unificada.
  - Q3_K_M (13,8 GB): aproximadamente 14-15 GB.
  - IQ4_XS (15,8 GB) y Q4_K_S (15,9 GB): aproximadamente 16-17 GB.
  - Q4_K_M (17,1 GB): aproximadamente 17-18 GB.
  - Q5_K_M (19,7 GB): aproximadamente 20-21 GB.
  - Q6_K (22,5 GB): aproximadamente 23-24 GB.
  - Q8_0 (29,1 GB): aproximadamente 30 GB o más.
- GPU recomendadas: para Q8_0 y Q6_K, GPU de 32-48 GB (A100 40 GB, RTX A6000, L40S). Para Q4_K_M y Q5_K_M, GPU de 24 GB (RTX 3090, RTX 4090, A10G 24 GB). Las cuantizaciones Q2_K y Q3_K pueden ejecutarse en GPU de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) o en memoria unificada de Apple Silicon.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) con Q4_K_M o Q5_K_M; en GPU de 16 GB con Q3_K o Q2_K; en Mac con 32 GB o más de memoria unificada con cuantizaciones medias.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF. El repositorio base es compatible con transformers y con endpoints compatibles.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Liminar-Qwen3.5-27B-GGUF | 27,3 B | no disponible | es | Apache 2.0 | GGUF | Ajuste fino en normativa universitaria argentina; cuantizaciones estáticas de 11,3 a 29,1 GB |
| Qwen3.5 base (27 B) | ~27 B | no disponible | multilingüe | según versión de Qwen | safetensors, GGUF | Modelo generalista del que deriva; mayor cobertura de idiomas y tareas |
| Modelos especializados en dominio jurídico en español | no disponible | no disponible | es | variable | variable | No se dispone de datos verificables para una comparación numérica |

No se dispone de información suficiente para comparar rendimiento (benchmarks) con alternativas concretas. La comparación se limita a parámetros, licencia y formato de distribución.

## Limitaciones y advertencias

- Especialización estrecha: el ajuste fino está orientado a normativa universitaria argentina; su rendimiento en dominios generales puede ser inferior al de la base Qwen3.5 sin ajustar.
- Idioma limitado: solo se declara soporte para español; no se garantiza un comportamiento correcto en otros idiomas.
- Riesgo de alucinación en materia normativa: como todo modelo generativo, puede citar artículos, resoluciones o plazos inexistentes; en aplicaciones legales o administrativas es imprescindible verificar contra la fuente oficial.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible; el corpus argentino puede introducir sesgos regionales o institucionales.
- Pérdida de calidad por cuantización: las cuantizaciones Q2_K y Q3_K_S reducen la fidelidad; el autor advierte que Q3_K_M es de "lower quality". Para producción se recomienda Q4_K_M o superior.
- Sin cuantizaciones imatrix: el autor indica que no hay cuantizaciones ponderadas por imatrix disponibles, lo que puede suponer una ligera pérdida de calidad frente a alternativas con imatrix del mismo tamaño.
- Longitud de contexto desconocida: no se especifica la ventana de contexto, lo que impide planificar aplicaciones con documentos largos sin pruebas previas.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene revisar las condiciones del modelo base original y citar adecuadamente la autoría de LICDIA-UNLu.
- Popularidad muy baja: 0 descargas y 1 like en el momento de la consulta; no hay evidencia comunitaria de validación en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Liminar-Qwen3.5-27B-GGUF
- Modelo base: https://huggingface.co/LICDIA-UNLu/Liminar-Qwen3.5-27B
- Página de descargas del cuantizador: https://hf.tst.eu/model#Liminar-Qwen3.5-27B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
