# segestic/MediliteQA-phi3.5-mini-all-med

## Resumen

MediLITE-QA es un modelo de generación de texto de 3.821 millones de parámetros (3.8B) especializado en respuesta a preguntas médicas de opción múltiple, desarrollado por segestic (Odewole y Başaran) y publicado en la revista *Sustainability*. Se obtiene mediante fine-tuning con QLoRA de `microsoft/Phi-3.5-mini-instruct` y la posterior fusión del adaptador en los pesos base. El problema que aborda es concreto: permitir que un modelo con conocimiento médico funcione en la CPU de un portátil de consumo, sin GPU ni conexión a la nube, manteniendo una precisión competitiva frente a modelos de 7-8B.

El modelo se entrenó sobre 393.000 registros (aproximadamente 104,5 millones de tokens) procedentes de tres conjuntos públicos: PubMedQA (86,06% de los tokens), MedMCQA (11,46%) y MedQA-USMLE-4-options (2,49%). La arquitectura subyacente es un transformer decoder-only de Phi-3.5-mini, con licencia MIT y formato Transformers (safetensors); existe además una familia de cuantizaciones GGUF en un repositorio separado para inferencia en CPU.

Su relevancia actual reside en la combinación de tres factores: un tamaño que cabe en memoria de consumo, una mejora medida de 4,06 puntos porcentuales sobre el modelo base en nueve benchmarks médicos, y un estudio explícito de eficiencia energética por token generado. No obstante, el propio autor lo restringe a uso de investigación y advierte que no es un dispositivo médico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-3.5-mini-instruct, fine-tuning QLoRA fusionado) |
| Parámetros totales | 3.821.079.552 (3,8B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el entrenamiento usó secuencias de 512 tokens; la evaluación de eficiencia se hizo con contexto de 2.000 tokens) |
| Tipos de cuantización | GGUF Q4_K_M disponible en repositorio separado; pesos fp16 en este repositorio |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (Transformers); GGUF en `segestic/MediLITE-QA-GGUF` |

## Arquitectura y entrenamiento

El modelo parte de Phi-3.5-mini-instruct, un transformer decoder-only de 3,8B parámetros, y se somete a un fine-tuning QLoRA con los siguientes hiperparámetros: rango LoRA 32, alpha 256, dropout 0,10, aplicado a las proyecciones q/k/v/o, gate, up y down. La tasa de aprendizaje fue 2e-4 con schedule lineal, batch efectivo de 32 (4 por dispositivo × 8 pasos de acumulación de gradiente), 3 épocas y longitud de secuencia de 512 tokens, en precisión mixta fp16 sobre una única NVIDIA Quadro RTX 4000.

El corpus de entrenamiento combina tres fuentes de preguntas médicas de estilo examen y abstracts en inglés, con un fuerte desbalance hacia PubMedQA (PQA-A). No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de decodificación especulativa. La innovación principal no es arquitectónica sino de eficiencia: el adaptador se fusiona en los pesos base y se publican cuantizaciones GGUF orientadas a inferencia en CPU, con medición de energía por token.

## Capacidades

- Generación de texto y respuesta a preguntas médicas de opción múltiple (formato A/B/C/D con salida de una sola letra).
- Razonamiento sobre contenido biomédico de estilo examen (USMLE, MedMCQA, PubMedQA).
- Conversación multi-turno mediante plantilla de chat de Phi-3.5 (`apply_chat_template`).
- Inferencia en CPU sin GPU mediante las cuantizaciones GGUF de la familia.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo está entrenado para responder con una única letra.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Investigación sobre eficiencia energética de LLM: reproducir el protocolo del paper (Q4_K_M GGUF, llama-cpp-python, 4 hilos, Intel Core i5-1135G7) para medir tiempo al primer token, tokens/s y julios por token en hardware de consumo.
- Evaluación comparativa de modelos médicos pequeños: usar el modelo como baseline de 3,8B en `lm-evaluation-harness` frente a Phi-3.5-mini base, OpenBioLLM-8B o LLaMA 3 8B sobre los mismos nueve benchmarks.
- Docencia y simulación de exámenes tipo USMLE: generar respuestas de opción múltiple para preguntas de práctica en entornos sin conectividad, con la advertencia de que no sustituye validación clínica.
- Despliegue en entornos aislados o con recursos limitados: un portátil con 7 GiB de RAM puede ejecutar el GGUF Q4_K_M (2,39 GB) con un pico de 4.403 MiB a contexto de 2.000 tokens, útil en escenarios de campo o aire gap.
- Prototipado de pipelines de QA biomédico: integrar el modelo como componente de clasificación de respuestas en un sistema mayor, aprovechando su salida de una letra y su baja latencia (117 ms/token en CPU).
- Estudio de formatos de instrucción: analizar la degradación del modelo ante prompts de formato libre frente al formato de opción múltiple para el que fue entrenado.

## Benchmarks y rendimiento

Precisión zero-shot (%) promediada sobre nueve benchmarks médicos (7.045 ítems), evaluada con `lm-evaluation-harness`; entre corchetes, intervalo de confianza bootstrap del 95%.

| Modelo | Precisión media |
|---|---|
| MediLITE-QA (fp16) | 72,79 [70,95; 74,66] |
| MediLITE-QA (Q4_K_M GGUF) | 71,87 [70,05; 73,76] |
| Phi-3.5-mini-instruct (base) | 68,73 [66,75; 70,62] |
| OpenBioLLM-8B | 72,09 [70,22; 73,94] |
| LLaMA 3 8B | 70,52 [68,65; 72,37] |

El fine-tuning mejora la media en 4,06 puntos porcentuales sobre el modelo base (IC 95%: 2,40 a 5,70) y no se diferencia de forma significativa de OpenBioLLM-8B. Los resultados por benchmark individual no están disponibles en la información proporcionada; se remiten al paper.

Eficiencia en CPU de portátil (GGUF Q4_K_M, 2,39 GB, llama-cpp-python, 4 hilos, Intel Core i5-1135G7, 6,96 GiB de RAM):

| Métrica | Valor |
|---|---|
| Tiempo al primer token en régimen estable | 1,34 s |
| Tiempo por token de salida | 117 ms (8,19 tokens/s) |
| Memoria residente máxima (contexto de 2.000 tokens) | 4.403 MiB (61,8% de la RAM) |
| Energía del paquete CPU | 3,17 J por token generado |

Los modelos abiertos de 7-8B medidos en el mismo hardware consumieron entre 1,56 y 1,98 veces más energía de CPU por token.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 7,6 GB de pesos, por lo que se recomienda al menos 8-10 GB de VRAM para margen de contexto y caché KV.
- GPU recomendadas para fp16: NVIDIA RTX 4090, A100, H100 o cualquier GPU con 10 GB o más de memoria; el entrenamiento se realizó en una Quadro RTX 4000.
- GPU de consumo: cabe en RTX 3060 de 12 GB, RTX 4070 Ti y superiores; en GPUs de 8 GB conviene usar cuantización.
- CPU: el GGUF Q4_K_M (2,39 GB) funciona en CPU sin GPU; el estudio lo valida en un Intel Core i5-1135G7 con 6,96 GiB de RAM, con pico de 4.403 MiB a contexto de 2.000 tokens.
- Opciones de despliegue: Transformers (fp16, `device_map="auto"`), llama.cpp / llama-cpp-python con GGUF, y text-generation-inference (el modelo incluye el tag `text-generation-inference` y `endpoints_compatible`).
- Latencia y throughput en CPU: 1,34 s al primer token y 8,19 tokens/s en el hardware citado; no hay datos de throughput en GPU en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión media (9 benchmarks médicos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MediLITE-QA | 3,8B | no disponible | 72,79 (fp16) / 71,87 (Q4_K_M) | MIT | Hugging Face (Transformers + GGUF) |
| Phi-3.5-mini-instruct (base) | 3,8B | no disponible | 68,73 | MIT | Hugging Face |
| OpenBioLLM-8B | 8B | no disponible | 72,09 | no disponible | Hugging Face |
| LLaMA 3 8B | 8B | no disponible | 70,52 | no disponible | Hugging Face |

La ventaja diferencial de MediLITE-QA frente a los modelos de 7-8B es el coste energético y de memoria: rinde a un nivel estadísticamente comparable a OpenBioLLM-8B con menos de la mitad de parámetros y entre 1,56 y 1,98 veces menos energía de CPU por token en el hardware medido.

## Limitaciones y advertencias

- No validado clínicamente: una revisión exploratoria ciega con cinco clínicos encontró una corrección clínica inferior a la de un modelo de referencia frontier, y algunas respuestas se marcaron como potencialmente dañinas.
- El modelo no es un dispositivo médico y no debe usarse para informar la atención al paciente; el autor lo restringe a investigación.
- Formato de salida rígido: está entrenado para responder con una sola letra y sigue peor las instrucciones de formato libre o explicativo.
- Sesgos de datos: las fuentes son preguntas de estilo examen y abstracts en inglés, lo que puede infrarrepresentar otras regiones y poblaciones.
- Idioma: solo inglés; no hay soporte multilingüe documentado.
- Alcance de los resultados de eficiencia: provienen de una única CPU de portátil y no deben asumirse transferibles a otros dispositivos.
- Riesgo de alucinación: no se documenta una mitigación específica más allá del formato de respuesta cerrada; en uso libre el riesgo persiste.
- Licencia MIT: permite uso comercial, pero las advertencias clínicas del autor siguen siendo aplicables y deben reflejarse en cualquier despliegue en producción.
- Contexto: el entrenamiento usó secuencias de 512 tokens y la evaluación de eficiencia 2.000 tokens; no se especifica la ventana máxima efectiva en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/segestic/MediliteQA-phi3.5-mini-all-med
- Adaptador LoRA: https://huggingface.co/segestic/phi3.5-mini-4k-qlora-medical-seg-vall_med
- Cuantizaciones GGUF: https://huggingface.co/segestic/MediLITE-QA-GGUF
- Modelo base: https://huggingface.co/microsoft/Phi-3.5-mini-instruct
- Código y logs de evaluación: https://github.com/segestic/Medilite-QA
- Paper: https://doi.org/10.3390/su182111245
- Dataset MedMCQA: https://huggingface.co/datasets/openlifescienceai/medmcqa
- Dataset MedQA-USMLE-4-options: https://huggingface.co/datasets/GBaker/MedQA-USMLE-4-options
- Dataset PubMedQA: https://huggingface.co/datasets/bigbio/pubmed_qa
