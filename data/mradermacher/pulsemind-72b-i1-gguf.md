# mradermacher/PulseMind-72B-i1-GGUF

## Resumen

PulseMind-72B-i1-GGUF es la versión cuantizada en formato GGUF del modelo PulseMind-72B, desarrollado originalmente por AQ-MedAI y convertido por mradermacher. Se trata de un modelo de lenguaje de 72.706.203.648 parámetros (aproximadamente 72,7 mil millones) orientado al dominio médico, con capacidades multimodales (procesamiento de imágenes médicas y generación de informes), razonamiento clínico y diagnóstico asistido. El modelo está afinado mediante aprendizaje por refuerzo y optimización de preferencias, y está diseñado para conversaciones multi-turno en contextos de consulta médica.

La relevancia de esta ficha radica en que la versión GGUF permite desplegar un modelo médico de gran tamano en hardware de consumo o en servidores con GPU modesta, algo inviable con los pesos originales en safetensors (el repo base ocupa 850,3 GB). mradermacher ofrece un espectro amplio de cuantizaciones (desde IQ1_S de 22,8 GB hasta Q6_K de 64,4 GB), lo que permite ajustar el equilibrio entre calidad y requisitos de memoria.

El modelo está publicado bajo licencia MIT y declara soporte únicamente para inglés. Su pipeline declarado es reinforcement-learning, y entre sus etiquetas figuran medical, multimodal, clinical-diagnosis, clinical-reasoning, multi-turn, consultation, medical-images y report-generation. No se dispone de información pública sobre la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de 72,7B parámetros; detalles de arquitectura no publicados en la información disponible) |
| Parametros totales | 72.706.203.648 (≈72,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_1, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (además de un fichero imatrix) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones i1, generadas con imatrix); el modelo base está en safetensors |

## Arquitectura y entrenamiento

No se dispone de detalles publicados sobre la arquitectura interna del modelo base AQ-MedAI/PulseMind-72B en la información proporcionada. Por el tamano (72,7B parámetros) y el pipeline declarado (reinforcement-learning), se trata de un modelo de gran escala afinado con técnicas de aprendizaje por refuerzo y optimización de preferencias (preference-optimization), orientado a tareas médicas. Las etiquetas indican que el modelo es multimodal (procesa imágenes médicas) y que está especializado en razonamiento clínico, diagnóstico y generación de informes.

La versión aquí descrita es una cuantización GGUF realizada por mradermacher utilizando cuantización ponderada con fichero imatrix (i1), lo que mejora la calidad respecto a cuantizaciones estáticas equivalentes en tamano. El autor también publica cuantizaciones estáticas en el repositorio mradermacher/PulseMind-72B-GGUF. No se especifican el número de tokens de entrenamiento, la composición del dataset ni los detalles del proceso de RLHF/DPO en la información disponible.

## Capacidades

- Generación de texto y razonamiento clínico en inglés.
- Procesamiento multimodal de imágenes médicas (etiqueta medical-images).
- Diagnóstico clínico asistido (clinical-diagnosis).
- Razonamiento clínico multi-paso (clinical-reasoning).
- Conversaciones multi-turno en contextos de consulta médica (multi-turn, consultation).
- Generación de informes médicos (report-generation).
- Afinado mediante aprendizaje por refuerzo y optimización de preferencias.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no confirmado explícitamente; el razonamiento clínico multi-paso está etiquetado, pero no se detalla soporte de agentes.
- Capacidades multilingües: solo inglés declarado.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistencia al diagnóstico por imagen: el modelo puede recibir imágenes médicas y generar descripciones y diagnósticos preliminares, gracias a su naturaleza multimodal y a su afinado específico en clinical-diagnosis.
- Generación automática de informes radiológicos: a partir de hallazgos e imágenes, el modelo redacta informes estructurados en inglés, aprovechando la etiqueta report-generation.
- Segunda opinión clínica en consulta: el modelo mantiene conversaciones multi-turno con el profesional sanitario para contrastar hipótesis diagnósticas, apoyándose en su entrenamiento con RL y optimización de preferencias.
- Triage y anamnesis asistida: puede gestionar diálogos de consulta estructurados para recoger síntomas y antecedentes antes de la revisión humana, gracias a la etiqueta consultation y multi-turn.
- Formación médica y simulación de casos: sirve como motor de casos clínicos interactivos donde el estudiante practica razonamiento diagnóstico con retroalimentación del modelo.
- Investigación en NLP clínico: permite experimentar con razonamiento clínico y evaluación de modelos médicos en inglés, desplegable localmente en formato GGUF con llama.cpp u Ollama.
- Procesamiento por lotes de documentación clínica en servidores con GPU modesta: las cuantizaciones Q4_K_M (47,5 GB) permiten ejecutar el modelo en una sola GPU de 48 GB o en configuraciones multi-GPU consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (tamano de fichero aproximado, más overhead de contexto y KV cache):
  - i1-IQ1_S: 22,8 GB
  - i1-IQ2_M: 29,4 GB
  - i1-IQ3_S: 34,6 GB
  - i1-IQ4_XS: 39,8 GB
  - i1-Q4_K_S: 44,0 GB
  - i1-Q4_K_M: 47,5 GB
  - i1-Q5_K_M: 54,5 GB
  - i1-Q6_K: 64,4 GB
- GPU recomendadas: para Q4_K_M o Q5_K_M se recomienda una A100 80 GB, H100 80 GB o dos RTX 4090 (24 GB cada una) en configuración multi-GPU. Para Q6_K, una A100/H100 de 80 GB o dos GPUs de 48 GB.
- ¿Cabe en consumer GPU? Las cuantizaciones más bajas (IQ1_S, IQ2_M) caben en una RTX 4090 de 24 GB, aunque con pérdida de calidad notable. Las cuantizaciones Q3 y Q4 requieren 32-48 GB, por lo que necesitan dos RTX 4090 o una RTX A6000 de 48 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. Para los pesos originales en safetensors se requeriría vLLM o TGI con múltiples GPUs de 80 GB.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia cualitativa, este modelo se posiciona en la categoría de modelos médicos de gran escala (≈72B) con capacidades multimodales, un nicho en el que existen alternativas como Med-PaLM 2 (Google, no open source) o Meditron-70B (EPFL, open source), pero no se dispone de datos de rendimiento comparables en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Formato | Multimodal |
|---|---|---|---|---|---|
| PulseMind-72B (este) | 72,7B | no disponible | MIT | GGUF / safetensors | Sí (etiqueta) |
| Meditron-70B | 70B | no disponible | Llama 2 (uso restringido) | safetensors / GGUF | No |
| Med-PaLM 2 | no disponible | no disponible | propietaria | API | Sí |

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- No se han publicado benchmarks ni evaluaciones clínicas en la información disponible, por lo que no hay evidencia cuantitativa de su precisión diagnóstica.
- Riesgo de alucinación inherente a los modelos de lenguaje; en dominio médico esto es especialmente crítico y requiere supervisión humana obligatoria.
- Las cuantizaciones de baja precisión (IQ1, IQ2, Q2_K) degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "very low quality".
- La licencia MIT permite uso comercial, pero el modelo no debe considerarse un dispositivo médico ni sustituir el juicio clínico profesional.
- Sesgos conocidos: no disponibles en la información proporcionada; cabe esperar sesgos derivados de los datos de entrenamiento médicos, no documentados.
- Limitaciones de contexto: la longitud de contexto no está publicada, lo que impide planificar despliegues con documentos largos.
- El repo base ocupa 850,3 GB, lo que dificulta el despliegue sin cuantización; las versiones GGUF son la vía práctica para producción en hardware limitado.
- No se confirma soporte de tool calling ni de agentes, lo que limita su integración en pipelines automatizados complejos.

## Enlaces

- Repositorio Hugging Face (esta versión GGUF): https://huggingface.co/mradermacher/PulseMind-72B-i1-GGUF
- Modelo base: https://huggingface.co/AQ-MedAI/PulseMind-72B
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/PulseMind-72B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#PulseMind-72B-i1-GGUF
- FAQ y solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
