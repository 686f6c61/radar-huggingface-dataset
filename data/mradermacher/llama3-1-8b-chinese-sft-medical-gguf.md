# mradermacher/Llama3.1-8B-Chinese-sft-medical-GGUF

## Resumen

Llama3.1-8B-Chinese-sft-medical-GGUF es una recopilación de cuantizaciones en formato GGUF del modelo Ryyyyyyyan/Llama3.1-8B-Chinese-sft-medical, publicada por el usuario mradermacher. El modelo subyacente parte de Meta Llama 3.1 8B y ha sido ajustado finamente (SFT) para el dominio médico en chino. Esta versión GGUF facilita la ejecución local del modelo mediante llama.cpp y herramientas compatibles, sin necesidad de GPUs de datacenter.

El modelo base cuenta con 8.030.261.312 parámetros (aproximadamente 8 mil millones) y hereda la arquitectura transformer decoder-only de Llama 3.1, con una longitud de contexto de 128.000 tokens según las especificaciones de la familia Llama 3.1. La licencia es Llama 3.1, lo que impone restricciones de uso comercial y de redistribución definidas por Meta.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un asistente médico en chino en hardware de consumo, con múltiples niveles de cuantización (desde Q2_K de 3,3 GB hasta f16 de 16,2 GB) que permiten ajustar el equilibrio entre calidad y requisitos de memoria. El repositorio tiene 54 descargas y 1 like, lo que indica una adopción muy limitada y poca validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parámetros totales | 8.030.261.312 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredado de Llama 3.1; no confirmado en la model card del autor) |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Chino (zh) |
| Licencia | Llama 3.1 |
| Formato de pesos | GGUF (también disponible el modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Llama 3.1, con 8.030.261.312 parámetros. La model card de esta recopilación GGUF no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO. La información disponible indica únicamente que se trata de un ajuste fino supervisado (SFT) sobre el checkpoint Llama 3.1 8B, orientado al dominio médico y al idioma chino, según el nombre del modelo (Llama3.1-8B-Chinese-sft-medical).

La aportación técnica de este repositorio es la cuantización estática en formato GGUF mediante la herramienta de mradermacher. No se han publicado cuantizaciones ponderadas por imatrix (weighted/imatrix quants) para este modelo, según indica el propio autor. Las cuantizaciones estáticas ofrecen un equilibrio predecible entre tamaño y perplejidad, aunque las variantes IQ suelen presentar mejor calidad por tamaño que las Q equivalentes.

## Capacidades

- Generación de texto conversacional en chino, con orientación al dominio médico.
- Razonamiento y respuesta a preguntas de temática sanitaria (a partir del ajuste SFT del modelo base).
- Soporte de conversaciones multi-turno gracias a la plantilla de chat heredada de Llama 3.1.
- Capacidad multilingüe limitada: el ajuste fino se ha realizado en chino y la model card declara únicamente el idioma zh.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso en la información disponible.
- No se documenta modo thinking, visión ni audio.
- Ejecución local mediante llama.cpp y ecosistema GGUF (Ollama, LM Studio, entre otros).

## Casos de uso

- Asistente de triaje médico en chino: el modelo puede gestionar conversaciones multi-turno con pacientes para recoger síntomas y orientar hacia el nivel de atención adecuado, aprovechando el ajuste SFT en dominio sanitario y la ventana de contexto de Llama 3.1.
- Educación sanitaria para pacientes: generación de explicaciones en chino sobre enfermedades, tratamientos y hábitos saludables, con un tono adaptado al público general.
- Soporte a profesionales sanitarios: resumen y reescritura de notas clínicas en chino, siempre con revisión humana dado el riesgo de alucinación en dominio médico.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q4_K_S (4,8 GB) y Q4_K_M (5,0 GB) permiten ejecutar el modelo en GPUs de consumo de 8 GB o en CPU con RAM suficiente, útil para prototipos y demos.
- Investigación en NLP médico en chino: evaluación de modelos ajustados por SFT en tareas de comprensión y generación de texto sanitario, usando las distintas cuantizaciones para estudiar el impacto de la precisión numérica.
- Chatbot de primera línea para clínicas y farmacias: respuestas a preguntas frecuentes sobre medicación y cuidados básicos en chino, con derivación a un profesional cuando el caso lo requiera.
- Filtrado y clasificación de consultas médicas: uso del modelo como base para etiquetar o priorizar consultas entrantes en un sistema de atención al paciente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (además de la memoria para el contexto KV):
  - Q2_K: ~3,3 GB de pesos.
  - Q3_K_M: ~4,1 GB.
  - IQ4_XS: ~4,6 GB.
  - Q4_K_S / Q4_K_M: ~4,8-5,0 GB.
  - Q5_K_M: ~5,8 GB.
  - Q6_K: ~6,7 GB.
  - Q8_0: ~8,6 GB.
  - f16: ~16,2 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090 para cuantizaciones Q4-Q8; A100 o H100 para f16 y despliegues de alta concurrencia.
- Cabe en GPU de consumo: sí, desde una RTX 3060 12 GB o una RTX 4060 Ti 16 GB con cuantizaciones Q4-Q8; las variantes Q2-Q4 pueden ejecutarse en GPUs de 8 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| Llama3.1-8B-Chinese-sft-medical-GGUF (este) | 8,03 B | 128.000 (heredado) | zh | Llama 3.1 | GGUF |
| Meta Llama 3.1 8B Instruct | 8,03 B | 128.000 | Multilingüe | Llama 3.1 | safetensors, GGUF |
| Qwen2.5-7B-Instruct | 7,6 B | 128.000 | Multilingüe (incluye zh) | Apache 2.0 | safetensors, GGUF |
| Yi-1.5-9B-Chat | 8,8 B | 4.096 | Multilingüe (incluye zh) | Apache 2.0 | safetensors, GGUF |

La comparativa se basa en características públicas de cada familia; no se dispone de resultados de benchmarks de este modelo concreto para comparar rendimiento. Qwen2.5-7B-Instruct y Yi-1.5-9B-Chat son alternativas con licencia Apache 2.0, más permisiva para uso comercial que la licencia Llama 3.1.

## Limitaciones y advertencias

- Riesgo elevado de alucinación en dominio médico: el modelo puede generar información clínica incorrecta o inventada; no debe usarse como sustituto del criterio profesional.
- Sesgos potenciales derivados de los datos de ajuste fino en chino y del corpus original de Llama 3.1; no se documenta ningún proceso de mitigación.
- Cobertura lingüística limitada: la model card declara únicamente chino; el rendimiento en castellano u otros idiomas no está garantizado.
- Restricciones de licencia Llama 3.1: uso comercial permitido con condiciones (política de uso aceptable, obligaciones de atribución y límite de 700 millones de usuarios mensuales para licenciatarios), y restricciones de redistribución.
- Cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan notablemente la calidad; para uso médico se recomienda Q5_K_M o superior.
- No se han publicado cuantizaciones ponderadas por imatrix para este modelo, lo que limita las opciones de calidad por tamaño.
- Adopción comunitaria muy baja (54 descargas, 1 like): no hay validación independiente ni informes de uso en producción.
- El repositorio ocupa 71,8 GB en total; conviene descargar solo la cuantización necesaria.
- No se documentan capacidades de tool calling ni de agentes; no asumir su disponibilidad en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Llama3.1-8B-Chinese-sft-medical-GGUF
- Modelo base: https://huggingface.co/Ryyyyyyyan/Llama3.1-8B-Chinese-sft-medical
- Página de descargas del autor: https://hf.tst.eu/model#Llama3.1-8B-Chinese-sft-medical-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Comparativa de calidad de cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
