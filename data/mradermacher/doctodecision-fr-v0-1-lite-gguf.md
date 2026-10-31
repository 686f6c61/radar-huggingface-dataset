# mradermacher/doctodecision-fr-v0.1-lite-GGUF

## Resumen

Esta ficha corresponde a la cuantización GGUF del modelo **doctodecision-fr-v0.1-lite**, desarrollado por Doctolib Lab y cuantizado por el usuario mradermacher. Se trata de un modelo orientado al dominio médico y a la toma de decisiones clínicas en francés, etiquetado con conceptos como "system-one", "decision", "decision-model" y "calibration", lo que sugiere un enfoque en respuestas rápidas y bien calibradas para tareas de decisión (por ejemplo, orientación de pacientes o apoyo a la decisión sanitaria). El modelo base pesa aproximadamente 7.518 millones de parámetros y se distribuye bajo licencia Apache 2.0, con una referencia en la model card a la licencia de Gemma de Google, lo que indica que probablemente se trata de un ajuste fino (vía LoRA, según los tags) sobre un modelo de la familia Gemma.

La relevancia de este repositorio radica en que mradermacher publica cuantizaciones estáticas en formato GGUF de modelos que de otro modo requerirían hardware considerable, haciéndolos ejecutables en GPUs de consumo e incluso en CPU. En este caso, el repo incluye además archivos mmproj (suplemento multimodal), lo que sugiere que el modelo base incorpora capacidades de visión. No se ha publicado una model card técnica detallada del modelo base en la información disponible, por lo que varios datos (datos de entrenamiento, benchmarks, longitud de contexto) no constan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (probablemente basado en Gemma, según la referencia de licencia; no confirmado) |
| Parametros totales | 7.518.069.290 (≈7,5 B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (estáticas; sin imatrix) |
| Idiomas soportados | Francés (fr) |
| Licencia | Apache 2.0 (con referencia a la licencia Gemma de Google) |
| Formato de pesos | GGUF (este repo); el modelo base en safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo base, doctolib-lab/doctodecision-fr-v0.1-lite, es un modelo de unos 7,5 B de parámetros ajustado mediante LoRA (según los tags `lora` y `base_model:adapter`), presumiblemente sobre un modelo Gemma dado que la model card enlaza a la documentación de la licencia de Gemma 4 de Google. La presencia de archivos mmproj en las cuantizaciones GGUF indica que el modelo base es multimodal (texto + visión), ya que mmproj es el proyector multimodal que llama.cpp emplea para modelos con entrada de imagen.

Sobre los datos de entrenamiento no hay información publicada en la model card disponible: no se especifican número de tokens, composición del dataset ni si se aplicaron técnicas como RLHF o DPO. Los tags "decision-model", "calibration" y "system-one" apuntan a un entrenamiento orientado a la toma de decisiones con calibración de confianza, pero los detalles técnicos concretos no están disponibles. La versión cuantizada de mradermacher es una conversión estática (sin imatrix) con tipos de cuantización k-quant e i-quant estándar de llama.cpp.

## Capacidades

- Toma de decisiones en el dominio médico en francés, según la denominación y los tags del modelo (decision, decision-model, medical).
- Conversación multi-turno (tag `conversational`).
- Entrada multimodal probable: los archivos mmproj-Q8_0 y mmproj-f16 indican soporte de imágenes vía proyector multimodal.
- Etiquetas de "calibration" y "system-one" sugieren respuestas rápidas de tipo heurístico con calibración de incertidumbre (detalle no documentado).
- Ajuste fino LoRA sobre un modelo base genérico, orientado al idioma francés.
- No hay información disponible sobre tool calling, agentes, razonamiento multi-step ni modo de pensamiento extendido.

## Casos de uso

- Triaje y orientación de pacientes en francés: el modelo puede procesar la descripción de síntomas de un paciente y generar una recomendación de decisión (por ejemplo, derivación a urgencias o consulta programada), aprovechando su entrenamiento específico en decisiones clínicas.
- Apoyo a la decisión en plataformas de salud digital: integrable en aplicaciones tipo chatbot para resolver dudas de pacientes de forma multi-turno, gracias a su etiqueta `conversational`.
- Análisis de documentos médicos con imágenes: si el soporte multimodal vía mmproj está activo, podría interpretar documentos escaneados, analíticas o imágenes junto con texto en francés.
- Despliegue local con privacidad de datos: al estar disponible en GGUF desde Q2_K (4,5 GB) hasta Q8_0 (8,1 GB), puede ejecutarse en GPUs de consumo o CPU, útil para entornos sanitarios con requisitos estrictos de confidencialidad de datos de pacientes.
- Prototipado de asistentes médicos en francés: su licencia Apache 2.0 permite uso comercial y experimental sin restricciones significativas, facilitando pruebas en productos de e-health.
- Investigación en calibración de modelos de decisión: los tags de calibración lo hacen interesante como caso de estudio para investigadores que analizan la fiabilidad de las salidas de modelos de decisión clínica.
- Ejecución en dispositivos con recursos limitados: las cuantizaciones Q3 y Q4 permiten uso en portátiles con GPU de gama media o incluso en CPU para inferencia de baja carga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización elegida; aproximadamente 4,5 GB para Q2_K, 5,3-5,4 GB para Q4_K_S/Q4_K_M, 6,3 GB para Q6_K, 8,1 GB para Q8_0 y 15,2 GB para f16 (más el suplemento mmproj de 0,7-1,1 GB si se usa la parte multimodal, más la memoria del KV cache).
- GPU recomendadas: para las cuantizaciones Q4-Q5, una RTX 3060 de 12 GB, RTX 4060 Ti 16 GB o superior es suficiente; para Q8_0 o f16, una RTX 4090 (24 GB) o una A100. En CPU, cualquier equipo con 16 GB de RAM puede ejecutar las cuantizaciones Q3-Q5.
- Cabe en GPUs de consumo: sí, cómodamente en cuantizaciones de Q2_K a Q6_K en GPUs de 8-12 GB; Q8_0 requiere 12-16 GB.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF y mmproj. No está diseñado para vLLM o TGI en formato GGUF (se usaría el modelo base en safetensors para ello).
- Latencia y throughput estimados: no disponible; en un modelo de 7,5 B cuantizado a Q4 se puede esperar inferencia fluida en GPU de consumo y velocidades moderadas en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| doctodecision-fr-v0.1-lite (base) | 7,5 B | no disponible | Apache 2.0 (ref. licencia Gemma) | safetensors y GGUF |
| Mistral 7B Instruct v0.3 | 7,3 B | 32k (hasta 128k extendido) | Apache 2.0 | safetensors, GGUF, amplio soporte |
| Gemma 3 4B / 12B (multimodal) | 4 B / 12 B | 128k | Licencia Gemma (uso comercial con condiciones) | safetensors, GGUF |
| BioMistral 7B | 7,3 B | no disponible | Apache 2.0 | safetensors, GGUF |

Nota: la comparativa es orientativa; doctodecision-fr-v0.1-lite se diferencia por su especialización en decisiones médicas en francés, mientras que las alternativas son modelos generales o biomédicos de dominio anglosajón. No hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- Especializado en francés: su rendimiento en otros idiomas, incluido el castellano, no está documentado y probablemente sea limitado.
- Dominio médico: como cualquier modelo de lenguaje, puede alucinar información clínica; no debe usarse como sustituto de juicio médico profesional ni en producción sin supervisión clínica y validación regulatoria (por ejemplo, consideraciones tipo MDR en la UE).
- Riesgo de sesgos: los datos de entrenamiento no están documentados, por lo que no se puede evaluar sesgos demográficos o de acceso sanitario; extremar la precaución en aplicaciones reales de salud.
- Cuantizaciones estáticas sin imatrix: las cuantizaciones más agresivas (Q2_K, Q3_K_S/M) pueden degradar notablemente la calidad, especialmente relevante en tareas de decisión calibrada donde errores sutiles importan.
- La calibración del modelo puede verse alterada por la cuantización; si la calibración de confianza es crítica para tu caso de uso, considera usar el modelo base en f16 o Q8_0.
- Licencia: aunque el repo declara Apache 2.0, la model card enlaza a la licencia Gemma de Google; conviene verificar las condiciones de la licencia del modelo base antes de uso comercial.
- No hay información publicada sobre longitud de contexto, benchmarks ni datos de entrenamiento, lo que dificulta una evaluación rigurosa previa a despliegue.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/doctodecision-fr-v0.1-lite-GGUF
- Modelo base: https://huggingface.co/doctolib-lab/doctodecision-fr-v0.1-lite
- Página de descargas resumida de mradermacher: https://hf.tst.eu/model#doctodecision-fr-v0.1-lite-GGUF
- Documentación de la licencia Gemma referenciada: https://ai.google.dev/gemma/docs/gemma_4_license
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa de mradermacher (nethype GmbH): https://www.nethype.de/
- Paper, blog oficial o demo: no disponible
