# mradermacher/RaDaR-32B-GGUF

## Resumen

RaDaR-32B-GGUF es la versión cuantizada en formato GGUF del modelo RaDaR-32B, desarrollado originalmente por el usuario sczzz y convertido a GGUF por mradermacher. Se trata de un modelo de lenguaje de 32.763.876.352 parámetros (aproximadamente 32,8 mil millones) orientado al dominio médico, según indica la etiqueta `medical` de su model card. La cuantización permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, algo inviable con los pesos originales en precisión completa.

El modelo base está construido sobre una arquitectura transformer (la model card no detalla variantes como MoE o SSM) y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial. El repositorio incluye once cuantizaciones estáticas que van desde Q2_K (12,4 GB) hasta Q8_0 (34,9 GB), cubriendo un rango amplio de compromisos entre calidad y requisitos de memoria.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo de 32B especializado en medicina en entornos con recursos limitados. No obstante, la información pública disponible es escasa: no se documentan datos de entrenamiento, benchmarks ni longitud de contexto, lo que limita la evaluación rigurosa del modelo antes de su adopción en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (detalle no disponible) |
| Parámetros totales | 32.763.876.352 |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (quantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no especifica la arquitectura interna del modelo base sczzz/RaDaR-32B más allá de tratarse de un transformer de 32,8 mil millones de parámetros. No se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. La única indicación sobre el dominio es la etiqueta `medical`, que sugiere un ajuste orientado a tareas clínicas o biomédicas, pero sin detalles sobre el corpus utilizado.

Las cuantizaciones de mradermacher son estáticas, es decir, generadas sin imatrix ni pesos ponderados, según indica el propio autor en la model card ("weighted/imatrix quants seem not to be available"). Esto implica que las versiones de baja precisión (especialmente Q2_K y Q3_K_S) pueden degradar la calidad de forma más acusada que sus equivalentes con imatrix. El autor recomienda Q4_K_S y Q4_K_M como opciones rápidas y Q8_0 como la de mejor calidad.

## Capacidades

- Generación de texto conversacional en inglés, con etiqueta `conversational` en el repositorio.
- Especialización declarada en dominio médico (tag `medical`), aunque sin documentación sobre el alcance exacto de dicha especialización.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que permite su despliegue mediante infraestructura de inferencia estándar.
- Ejecución en llama.cpp y derivados gracias al formato GGUF.
- Capacidades de tool calling, agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Soporte multilingüe: limitado al inglés según la model card.
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Asistencia clínica documental: el modelo puede redactar resúmenes de historiales o notas clínicas en inglés, aprovechando su ajuste al dominio médico. Su tamaño de 32B permite una comprensión contextual superior a modelos de 7B-13B, aunque la ausencia de benchmarks publicados obliga a validar la calidad con datos propios.
- Triaje conversacional: integrado en un chatbot de primer contacto para clasificar síntomas y derivar a especialistas, desplegado en local con la cuantización Q4_K_M (20 GB) para preservar la privacidad de datos de pacientes.
- Extracción de entidades biomédicas: procesamiento de informes para identificar fármacos, diagnósticos y códigos CIE mediante prompts estructurados, ejecutable en servidores con una única GPU de 24 GB usando Q4_K_S.
- Educación médica: generación de explicaciones y casos de estudio para estudiantes, con la ventaja de poder ejecutarse en estaciones de trabajo con GPU de consumo (RTX 4090 con Q4_K_M).
- Investigación en NLP clínico: uso como modelo base para experimentos de ajuste fino o evaluación de sesgos en texto médico, gracias a la licencia Apache 2.0 que permite modificación y redistribución.
- Despliegue en entornos con requisitos de soberanía del dato: al ser un GGUF ejecutable con llama.cpp sin dependencia de APIs externas, encaja en hospitales o laboratorios que no pueden enviar información a servicios en la nube.
- Prototipado rápido de aplicaciones sanitarias: la variedad de cuantizaciones permite empezar con Q2_K (12,4 GB) en hardware modesto y escalar a Q8_0 (34,9 GB) cuando la calidad sea crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - Q2_K: ~13-14 GB
  - Q3_K_M: ~17-18 GB
  - Q4_K_S / Q4_K_M: ~20-22 GB
  - Q5_K_M: ~24-26 GB
  - Q6_K: ~28-30 GB
  - Q8_0: ~36-38 GB
- GPU recomendadas:
  - Q4_K_M: RTX 4090 (24 GB), RTX 3090 (24 GB), A10G (24 GB).
  - Q5_K_M / Q6_K: A100 40 GB, L40S (48 GB).
  - Q8_0: A100 80 GB o dos GPU de 24 GB con reparto de capas.
- Cabe en GPU de consumo: sí, desde Q2_K hasta Q4_K_M en tarjetas de 24 GB; Q5_K_M puede requerir reducir la ventana de contexto o usar offloading parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama (mediante importación del GGUF), LM Studio, text-generation-webui y servidores compatibles con la API de OpenAI a través de llama.cpp server. vLLM y TGI no soportan GGUF de forma nativa para este modelo sin conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RaDaR-32B-GGUF | 32,8B | No disponible | Apache 2.0 | GGUF | Especializado en dominio médico (tag), solo inglés |
| Modelos médicos de 32B comparables | No disponible | No disponible | No disponible | No disponible | No se dispone de información sobre alternativas directas en la documentación consultada |
| Modelos generalistas de ~32B (p. ej., Qwen2.5-32B, Yi-34B) | ~32-34B | 32K-128K (según modelo) | Apache 2.0 / otras | GGUF, safetensors | No especializados en medicina; contexto documentado |

La comparación cuantitativa con alternativas no es posible con los datos disponibles: no se han publicado benchmarks del modelo ni se documentan sus características de contexto. La elección frente a modelos generalistas de tamaño similar debería basarse en validación empírica sobre el corpus clínico concreto de cada organización.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad en tareas médicas ni generales.
- Riesgo elevado de alucinación en dominio sanitario: un modelo sin documentación de alineación ni evaluación clínica no debe usarse para decisiones diagnósticas o terapéuticas sin supervisión humana.
- Idiomas: solo inglés; no se garantiza un rendimiento aceptable en castellano.
- Longitud de contexto desconocida: limita el diseño de aplicaciones con documentos largos.
- Cuantizaciones estáticas sin imatrix: las versiones Q2_K y Q3_K_S pueden presentar degradación notable; se recomienda Q4_K_M o superior para uso serio.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad regulatoria (por ejemplo, normativa de dispositivos médicos) recae en el desplegador.
- El modelo base sczzz/RaDaR-32B tiene escasa documentación pública, lo que dificulta auditar su procedencia de datos y posibles sesgos.
- El repositorio ocupa 224 GB, lo que exige planificación de almacenamiento y ancho de banda para la descarga de todas las cuantizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/RaDaR-32B-GGUF
- Modelo base: https://huggingface.co/sczzz/RaDaR-32B
- Página de descargas del cuantizador: https://hf.tst.eu/model#RaDaR-32B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
