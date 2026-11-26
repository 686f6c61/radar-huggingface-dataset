# mradermacher/medical-model-diagnosis-qwen32b-v2-GGUF

## Resumen

El repositorio `mradermacher/medical-model-diagnosis-qwen32b-v2-GGUF` contiene una colección de cuantizaciones estáticas en formato GGUF del modelo base `nishanth-augustai/medical-model-diagnosis-qwen32b-v2`, un ajuste fino de la familia Qwen2.5 de 32B orientado a diagnóstico médico. El autor de las cuantizaciones es mradermacher, conocido por publicar versiones GGUF de modelos populares para su uso con llama.cpp y herramientas compatibles. El modelo base lo desarrolla nishanth-augustai y está pensado para tareas conversacionales de índole clínica en inglés.

Con 32.763.876.352 parámetros totales (aproximadamente 32,8B), el modelo se sitúa en la gama alta de los transformers densos de tamaño medio-grande. El repositorio ocupa 224 GB e incluye 11 cuantizaciones que van desde Q2_K (12,4 GB) hasta Q8_0 (34,9 GB), lo que permite desplegarlo desde estaciones de trabajo con 16 GB de VRAM hasta servidores con GPUs de 40-80 GB. La información pública disponible es muy limitada: no se especifican licencia, contexto, datos de entrenamiento ni benchmarks, y el modelo declara únicamente inglés como idioma.

La relevancia de este repositorio es doble: por un lado, ofrece una vía práctica para ejecutar un modelo médico de 32B en hardware de consumo mediante cuantización; por otro, la opacidad de la model card y la ausencia de licencia explícita lo convierten en un artefacto que requiere validación adicional antes de cualquier uso clínico real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2.5, inferido del nombre y del tamaño); detalles no disponibles |
| Parametros totales | 32.763.876.352 (~32,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base presumiblemente en safetensors, no confirmado |

## Arquitectura y entrenamiento

La model card del repositorio no aporta información sobre la arquitectura interna del modelo base más allá de la etiqueta `transformers` y la referencia a Qwen en el nombre. Por el identificador y el recuento de parámetros (32,8B) se infiere que se trata de un transformer denso de la familia Qwen2.5, pero no hay confirmación oficial en la información proporcionada sobre número de capas, dimensión oculta, cabezas de atención ni mecanismos específicos (atención lineal, decodificación especulativa, etc.).

Tampoco se detallan los datos de entrenamiento: no se especifica el número de tokens, la composición del corpus médico, ni si se aplicaron técnicas de alineación como RLHF, DPO o instrucción supervisada. El autor de las cuantizaciones indica que se trata de cuantizaciones estáticas (sin imatrix ni weighted quants disponibles en el momento de la publicación) y que el proceso se realizó con `quantize_version: 2` y `output_tensor_quantised: 1`, lo que sugiere una conversión estándar desde pesos Hugging Face a GGUF.

## Capacidades

- Generación de texto conversacional en inglés, orientada según el nombre del modelo a diagnóstico médico.
- Razonamiento clínico básico: interpretación de síntomas y formulación de hipótesis diagnósticas (no verificado con benchmarks).
- Soporte de conversaciones multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que permite desplegarlo en infraestructuras tipo Hugging Face Inference Endpoints.
- Capacidades de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas a inglés según la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- **Asistencia a la anamnesis en inglés**: el modelo puede mantener conversaciones multi-turno con un paciente simulado o un profesional para estructurar síntomas, antecedentes y factores de riesgo. Su tamaño de 32B permite una comprensión contextual razonable, aunque el contexto máximo no está documentado y debe validarse empíricamente.
- **Generación de borradores de informes clínicos**: a partir de notas estructuradas, el modelo puede redactar secciones de un informe (motivo de consulta, exploración, impresión diagnóstica) en inglés. Adecuado para entornos donde el idioma de trabajo sea el inglés y siempre con revisión humana.
- **Formación y simulación médica**: útil para crear escenarios de práctica con estudiantes, generando casos clínicos sintéticos y respuestas a preguntas de seguimiento. La cuantización Q4_K_M (20 GB) permite ejecutarlo en una RTX 4090 o A6000.
- **Triaje conversacional preliminar**: en un chatbot de preclasificación, el modelo puede recoger síntomas y sugerir niveles de urgencia. Requiere supervisión y validación clínica; no debe usarse como único criterio.
- **Apoyo a la codificación clínica**: dado un texto libre en inglés, el modelo puede ayudar a mapear términos a códigos (CIE-10, SNOMED) si se le proporciona el catálogo en el prompt, aunque no hay evidencia publicada de su rendimiento en esta tarea.
- **Investigación en NLP clínico**: como modelo base para experimentos de ajuste fino adicional o evaluación de sesgos en dominios médicos, aprovechando las cuantizaciones ligeras (Q3_K_S, 14,5 GB) para iterar rápido en una sola GPU.
- **Despliegue en local para prototipos**: gracias a las cuantizaciones GGUF, se puede integrar en llama.cpp u Ollama para pruebas de concepto sin depender de la nube, lo que facilita la experimentación con datos sensibles en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de cuantizaciones no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas del dominio médico (MedQA, PubMedQA, etc.). Tampoco se aportan datos de perplejidad comparativos entre cuantizaciones más allá del gráfico genérico enlazado por el autor.

## Requisitos de hardware

- **VRAM estimada para inferencia** (según tamaño de cuantización):
  - Q2_K: ~12,4 GB de pesos + overhead de contexto y KV cache (estimado 14-16 GB).
  - Q4_K_M: ~20,0 GB de pesos + overhead (estimado 22-24 GB).
  - Q5_K_M: ~23,4 GB de pesos + overhead (estimado 26-28 GB).
  - Q8_0: ~34,9 GB de pesos + overhead (estimado 38-40 GB).
- **GPUs recomendadas**:
  - Q4_K_M o Q5_K_M: RTX 4090 (24 GB), RTX 3090 (24 GB), A6000 (48 GB), L40S (48 GB).
  - Q8_0: A100 40 GB, A100 80 GB, H100 80 GB.
  - Q2_K / Q3_K_S: RTX 4080 (16 GB) o RTX 4060 Ti 16 GB, con margen ajustado.
- **¿Cabe en GPU de consumo?** Sí, en cuantizaciones Q2_K a Q4_K_M en GPUs de 16-24 GB. Las cuantizaciones Q5 y superiores requieren GPUs profesionales o configuraciones multi-GPU.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF (llama-cpp-python, koboldcpp). Para el modelo base en safetensors: vLLM, TGI o transformers con accelerate.
- **Latencia y throughput**: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| medical-model-diagnosis-qwen32b-v2 (este) | ~32,8B | no disponible | no disponible | GGUF (11 cuantizaciones) | Ajuste médico sobre Qwen2.5, solo inglés |
| Qwen2.5-32B-Instruct | ~32,8B | 128K (según documentación oficial de Qwen) | Apache 2.0 (según Qwen) | safetensors, GGUF, AWQ | Modelo generalista, multilingüe, con benchmarks publicados |
| Meditron-70B | 70B | 4K (según paper) | Llama 2 (restrictiva) | safetensors, GGUF | Especializado en medicina, mayor tamaño, requiere más VRAM |
| BioMistral-7B | 7B | 4K (según paper) | Apache 2.0 (según repo) | safetensors, GGUF | Mucho más pequeño, menor calidad esperada pero desplegable en GPUs de 8 GB |

La comparación con Qwen2.5-32B-Instruct es la más directa por compartir arquitectura y tamaño, pero carece de datos de rendimiento del modelo médico para establecer diferencias cuantitativas. Frente a Meditron-70B, este modelo es la mitad de grande y más fácil de desplegar, aunque sin benchmarks publicados no se puede afirmar superioridad o inferioridad en tareas clínicas.

## Limitaciones y advertencias

- **Ausencia de licencia explícita**: la model card no especifica licencia, lo que impide determinar si el uso comercial está permitido. Es un riesgo legal relevante para producción.
- **Riesgo de alucinación clínica**: como todo LLM, puede generar diagnósticos, dosis o recomendaciones plausibles pero incorrectas. En un dominio médico, esto puede causar daño directo; se requiere supervisión profesional obligatoria.
- **Solo inglés**: no se declara soporte para castellano ni otros idiomas, lo que limita su uso en entornos hispanohablantes sin traducción previa o ajuste adicional.
- **Contexto desconocido**: no se documenta la longitud máxima de contexto, lo que impide planificar conversaciones largas o documentos extensos con garantías.
- **Datos de entrenamiento opacos**: no se especifica la composición del corpus médico ni si se aplicaron filtros de calidad, lo que dificulta evaluar sesgos demográficos, de género o raciales en las recomendaciones.
- **Cuantizaciones estáticas sin imatrix**: el autor indica que no hay weighted/imatrix quants disponibles, lo que puede suponer una pérdida de calidad algo mayor en las cuantizaciones bajas (Q2_K, Q3_K_S) frente a alternativas con imatrix.
- **Modelo base de terceros**: el repositorio solo contiene las cuantizaciones; la responsabilidad sobre el ajuste fino y sus datos recae en `nishanth-augustai`, cuya documentación no se ha podido verificar en la información proporcionada.
- **No apto para uso clínico directo**: no debe utilizarse como dispositivo médico ni como sustituto del juicio profesional sin validación regulatoria (MDR en la UE, FDA en EE. UU.).

## Enlaces

- Repositorio Hugging Face (cuantizaciones GGUF): https://huggingface.co/mradermacher/medical-model-diagnosis-qwen32b-v2-GGUF
- Modelo base: https://huggingface.co/nishanth-augustai/medical-model-diagnosis-qwen32b-v2
- Página de descargas del autor: https://hf.tst.eu/model#medical-model-diagnosis-qwen32b-v2-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad por cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor de cuantizaciones: https://www.nethype.de/
