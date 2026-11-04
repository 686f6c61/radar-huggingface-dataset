# mradermacher/MadriMed-VL-2B-GGUF

## Resumen

MadriMed-VL-2B-GGUF es la versión cuantizada en formato GGUF del modelo vision-language MadriMed-VL-2B, desarrollado originalmente por MadriSight y convertido a GGUF por mradermacher. Se trata de un modelo multimodal especializado en el dominio médico, con especial énfasis en radiología, construido sobre una base Qwen3-VL de aproximadamente 2B de parámetros (1.720.574.976 parámetros reales según los safetensors del modelo base). Su propósito es responder preguntas visuales (VQA) sobre imágenes médicas y asistir en tareas clínicas de razonamiento a partir de datos como los conjuntos SLAKE, VQA-RAD y MedXpertQA.

El modelo resulta relevante porque ofrece capacidades de visión-lenguaje aplicadas a medicina en un tamaño muy reducido, lo que permite desplegarlo en hardware de consumo o en entornos con recursos limitados. La versión GGUF facilita su ejecución mediante llama.cpp y herramientas derivadas (Ollama, LM Studio, entre otras), sin necesidad de GPUs de datacenter. Está pensado explícitamente para investigación y uso clínico experimental, no para diagnóstico autónomo.

La licencia es un punto crítico: aunque las etiquetas de HuggingFace muestran apache-2.0, la model card declara `health-ai-developer-foundations` con enlace a los términos de Google Health AI Developer Foundations, lo que impone restricciones adicionales al uso comercial y clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-language basada en Qwen3-VL (no se detalla la configuración interna en la información disponible) |
| Parametros totales | 1.720.574.976 (aprox. 2B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; además mmproj en f16 y Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | health-ai-developer-foundations (etiqueta apache-2.0 en HuggingFace; ver términos enlazados en la model card) |
| Formato de pesos | GGUF (con archivos mmproj separados para el componente multimodal); el modelo base está en Safetensors |

## Arquitectura y entrenamiento

El modelo base es MadriMed-VL-2B, un vision-language model construido sobre Qwen3-VL según las etiquetas del repositorio. La información disponible no detalla el número de capas, dimensión oculta, número de cabezas de atención ni la configuración exacta del encoder visual. El tamaño total de parámetros (1.720.574.976) sitúa al modelo en la categoría de 2B, coherente con la nomenclatura.

En cuanto a entrenamiento, la model card referencia el dataset `mint-medmax/medmax_data` como fuente de datos, y las etiquetas mencionan evaluación o ajuste sobre SLAKE, VQA-RAD y MedXpertQA. No se especifica el número de tokens de entrenamiento, la composición detallada del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá de la base Qwen3-VL. La conversión a GGUF realizada por mradermacher es estática (quantize_version 2, output_tensor_quantised 1, convert_type hf) y no incluye, según la model card, cuantizaciones ponderadas por imatrix en el momento de la publicación.

## Capacidades

- Generación de texto y razonamiento clínico en inglés.
- Comprensión de imágenes médicas y respuesta a preguntas visuales (VQA médica), con foco en radiología.
- Procesamiento multimodal imagen + texto mediante el componente mmproj en GGUF.
- Razonamiento sobre casos clínicos y preguntas de tipo experto (referencias a MedXpertQA).
- Capacidad conversacional (etiqueta `conversational`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- Investigación en VQA médica: el modelo permite experimentar con preguntas y respuestas sobre imágenes radiológicas usando los conjuntos SLAKE y VQA-RAD como referencia, gracias a su tamaño reducido que facilita iteraciones rápidas en laboratorio.
- Prototipado de asistentes clínicos en entornos con recursos limitados: al ejecutarse en formato GGUF con cuantizaciones de 1-2 GB, puede desplegarse en estaciones de trabajo sin GPU dedicada para validar flujos de interacción médico-paciente simulados.
- Educación médica y simulación: generación de explicaciones sobre hallazgos en imágenes de radiología para entornos formativos, con la advertencia de que no sustituye la revisión de un especialista.
- Evaluación comparativa de modelos pequeños multimodales: sirve como baseline ligero frente a modelos médicos de mayor tamaño en experimentos académicos de benchmarking.
- Despliegue en el borde (edge) para demostraciones: la versión Q4_K_M (1,2 GB) o Q2_K (0,9 GB) permite ejecutar el modelo en portátiles y dispositivos con poca VRAM para demos de investigación.
- Análisis exploratorio de datasets clínicos: uso del modelo para etiquetar o resumir pares imagen-texto en pipelines de curación de datos médicos, siempre con supervisión humana.
- Integración en herramientas de escritorio vía llama.cpp/Ollama: investigadores pueden incorporar el modelo a cuadernos o aplicaciones locales para pruebas de concepto sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (tamaño de archivo como referencia, más overhead de contexto):
  - Q2_K: ~0,9 GB
  - Q3_K_S / Q3_K_M: ~1,0 GB
  - IQ4_XS: ~1,1 GB
  - Q4_K_S / Q4_K_M: ~1,2 GB
  - Q5_K_S / Q5_K_M: ~1,3-1,4 GB
  - Q6_K: ~1,5 GB
  - Q8_0: ~1,9 GB
  - f16: ~3,5 GB
  - Componente mmproj adicional: 0,5 GB (Q8_0) o 0,9 GB (f16)
- GPU recomendadas: no disponibles de forma específica en la información; por tamaño, cualquier GPU consumer con 4-8 GB de VRAM es suficiente para las cuantizaciones habituales.
- Cabe en GPU consumer: sí, en modelos como RTX 3060, RTX 4060, RTX 4070 o superiores, e incluso en GPUs integradas con suficiente memoria compartida para cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runners compatibles con GGUF; el modelo base es compatible con Transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MadriMed-VL-2B-GGUF | ~1,72B | no disponible | health-ai-developer-foundations | GGUF | Especializado en radiología y VQA médica; solo inglés |
| Qwen3-VL-2B (base genérica) | ~2B | no disponible | según variante Qwen | Safetensors/GGUF | Modelo generalista multimodal; el ajuste médico de MadriMed no está presente |
| Alternativas médicas VLM de mayor tamaño (p. ej. LLaVA-Med) | >7B | no disponible | según variante | Safetensors | Mayor capacidad pero mayor requisito de hardware; comparación directa no disponible en la información |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa fiable con estas alternativas.

## Limitaciones y advertencias

- Modelo de investigación: no está validado para diagnóstico clínico ni para uso médico real; cualquier aplicación en salud requiere supervisión profesional y validación regulatoria.
- Idioma: solo inglés según la model card, lo que limita su uso en castellano sin ajuste adicional.
- Riesgo de alucinación: como todo modelo generativo, puede producir respuestas plausibles pero incorrectas sobre hallazgos radiológicos; el riesgo es especialmente crítico en dominio médico.
- Sesgos: no documentados en la información disponible; el dataset de entrenamiento (medmax_data) puede introducir sesgos de población o de adquisición de imágenes.
- Licencia: la model card declara `health-ai-developer-foundations` con enlace a los términos de Google Health AI Developer Foundations, lo que puede imponer restricciones adicionales al uso comercial; la etiqueta apache-2.0 de HuggingFace debe contrastarse con esos términos antes de cualquier uso en producción.
- Sin cuantizaciones imatrix: la model card indica que no hay cuants ponderados por imatrix disponibles en el momento de la publicación, lo que puede afectar a la calidad en cuantizaciones bajas (Q2, Q3).
- Contexto: no se especifica la longitud máxima de contexto, lo que dificulta planificar conversaciones o documentos largos.
- Tamaño reducido: al ser un modelo de ~2B, su capacidad de razonamiento complejo es inferior a la de modelos médicos de mayor escala; los benchmarks no están publicados para verificar su rendimiento real.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/MadriMed-VL-2B-GGUF
- Modelo base: https://huggingface.co/madrisight/madrimed-VL-2B
- Página de descargas del cuantizador: https://hf.tst.eu/model#MadriMed-VL-2B-GGUF
- Términos de licencia Health AI Developer Foundations: https://developers.google.com/health-ai-developer-foundations/terms
- Dataset de entrenamiento referenciado: https://huggingface.co/datasets/mint-medmax/medmax_data
- Guía de uso de GGUF (TheBloke, referencia): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
