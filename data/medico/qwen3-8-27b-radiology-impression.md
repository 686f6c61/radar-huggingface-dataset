# Medico/Qwen3.8-27B-Radiology-Impression

## Resumen

`Medico/Qwen3.8-27B-Radiology-Impression` es un adaptador LoRA de 4 bits desarrollado por el usuario Medico sobre el modelo base `Qwen/Qwen3.8-27B`, un modelo denso de 27 000 millones de parámetros con arquitectura Qwen3.5. El adaptador está especializado en la generación de impresiones radiológicas clínicas a partir de hallazgos de imagen (findings-to-impression), un paso fundamental en el flujo de trabajo de radiología donde el radiólogo condensa observaciones verbosas en un diagnóstico priorizado y estructurado.

El modelo se ha ajustado sobre 659 381 pares de hallazgos e impresiones clínicas reales que abarcan múltiples modalidades de imagen (TC, RM, radiografía de tórax, ecografía y PET/TC). Su relevancia radica en que aborda una tarea clínica concreta y de alto valor: la síntesis automática de impresiones estructuradas alineadas con marcos de referencia como ACR Fleischner, BI-RADS, LI-RADS y PI-RADS. El adaptador pesa solo 0,3 GB, lo que permite cargarlo sobre el modelo base cuantizado en 4 bits en GPUs de consumo medio.

La licencia es Apache 2.0, lo que facilita su uso comercial y su integración en sistemas de apoyo a la decisión clínica, aunque el autor incluye un aviso explícito de que no debe sustituir la interpretación radiológica por profesionales certificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (dense transformer, modelo base) + adaptador LoRA |
| Parametros totales | 27 000 millones (modelo base) + adaptador LoRA (~0,3 GB) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (modelo base) |
| Tipos de cuantizacion | 4 bits (NF4 con doble cuantizacion) para el adaptador; el modelo base admite cuantizaciones estandar (GGUF, AWQ, GPTQ) |
| Idiomas soportados | Ingles (model card); el modelo base Qwen3.8-27B soporta multiples idiomas, pero el adaptador esta entrenado en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA), PEFT |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso de 27 000 millones de parametros con arquitectura Qwen3.5, disenado para tareas de codigo, trabajo profesional, investigacion y agentes de largo horizonte. Incluye control flexible de razonamiento (thinking mode configurable) y una ventana de contexto nativa de 262 144 tokens. El adaptador LoRA se entrena sobre este base con cuantizacion de 4 bits (NF4) y doble cuantizacion, lo que reduce drasticamente los requisitos de memoria durante el ajuste fino.

El entrenamiento del adaptador utiliza 659 381 pares de hallazgos e impresiones radiológicas reales, curados en el dataset `Medico/radiology-reports-curated`. No se especifica si se emplearon tecnicas de RLHF o DPO; la model card indica un ajuste supervisado clasico (fine-tuning) sobre pares de texto. La tarea se formula como generacion de texto: dado un bloque de hallazgos (FINDINGS) y el tipo de examen (EXAM), el modelo debe producir una impresion clinica estructurada. El prompt de sistema define al modelo como "radiologo diagnostico experto" y se usa una temperatura de 0,2 para favorecer respuestas deterministas y clinicas.

## Capacidades

- Generacion de impresiones radiológicas estructuradas a partir de hallazgos de imagen en texto (findings-to-impression).
- Deteccion y alerta de hallazgos criticos y urgentes: embolia pulmonar, oclusion de gran vaso, diseccion aortica, neumotorax a tension, apendicitis.
- Generacion de informes alineados con marcos de referencia clinica: criterios ACR Fleischner, BI-RADS, LI-RADS y PI-RADS.
- Soporte de multiples modalidades de imagen: TC, RM, radiografia de torax, ecografia y PET/TC.
- Conversacion clinica multi-turno gracias a la arquitectura base de Qwen3.8-27B (chat template estandar).
- Capacidades generales del modelo base: generacion de texto, razonamiento, codigo, matematicas, vision (aunque el adaptador no esta entrenado especificamente para entrada de imagenes, el base si las soporta).
- Soporte de tool calling y agentes en el modelo base, aunque el adaptador no documenta uso especifico en ese ambito.

## Casos de uso

- Redaccion asistida de informes de radiologia: el radiologo introduce los hallazgos en texto y el modelo genera una impresion priorizada y estructurada, reduciendo el tiempo de dictado y estandarizando el formato.
- Triage de hallazgos criticos: el modelo puede resaltar condiciones urgentes (embolia pulmonar masiva, oclusion de la arteria cerebral media) para priorizar la comunicacion al clinico solicitante.
- Educacion medica y formacion de residentes: los residentes pueden comparar sus propias impresiones con las generadas por el modelo, entrenando la redaccion de informes estructurados.
- Integracion en sistemas de apoyo a la decision clinica (CDSS): el adaptador puede conectarse a flujos de trabajo hospitalarios para pre-generar borradores de impresion que el radiologo revisa y valida.
- Investigacion en NLP clinico: el modelo sirve como punto de partida para estudios de extraccion de informacion, clasificacion de hallazgos y generacion de resumenes en radiologia.
- Benchmarking de modelos medicos: al estar publicado con licencia Apache 2.0, puede usarse como referencia comparativa en evaluaciones de modelos de lenguaje clinico.
- Generacion de informes estandarizados por modalidad: el modelo puede adaptarse a protocolos especificos de cada centro (BI-RADS para mama, LI-RADS para higado, PI-RADS para prostata) mediante prompts contextuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (como BLEU, ROUGE, o exactitud clinica) ni comparaciones con otros modelos de radiologia. El unico dato de rendimiento indirecto es el tamaño del dataset de entrenamiento (659 381 pares) y la arquitectura base (Qwen3.8-27B), que en evaluaciones publicas del modelo base alcanza puntuaciones destacadas en tareas de codigo y agentes, pero no hay datos especificos del adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA de 0,3 GB se carga sobre el modelo base cuantizado en 4 bits. Con cuantizacion NF4, el modelo base de 27B requiere aproximadamente 14-16 GB de VRAM para inferencia en FP16 con 4 bits (el modelo base en 4 bits ocupa unos 14 GB, mas overhead de activaciones y contexto). Con contexto largo (262K) la memoria de activaciones crece significativamente.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, RTX 4090 (24 GB) o RTX 6000 Ada. En GPUs de 24 GB es viable con cuantizacion 4 bits y contexto moderado (hasta 32K tokens). Para contexto completo de 262K se requieren GPUs con 80 GB o mas.
- En consumer GPU: cabe en RTX 4090 (24 GB) con cuantizacion 4 bits y contexto reducido. Tambien es ejecutable en RTX 3090 (24 GB) y RTX 4080 (16 GB) con limitaciones de contexto.
- Opciones de despliegue: el codigo de ejemplo usa Hugging Face Transformers con BitsAndBytes y PEFT. Tambien se puede ejecutar con vLLM, llama.cpp (si se convierte a GGUF), Ollama (el comando `ollama run hf.co/Medico/Qwen3.8-27B-Radiology-Impression` esta documentado) y TGI.
- Latencia y throughput: no se han publicado datos especificos. En una A100 80 GB con cuantizacion 4 bits, se espera una latencia de 20-40 ms por token para generacion autoregresiva, dependiendo de la longitud de contexto y el batch size.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Medico/Qwen3.8-27B-Radiology-Impression | 27B (base) + LoRA | 262K (base) | Radiologia (impresiones) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (base) | 27B | 262K | General (vision-lenguaje) | Apache 2.0 | Hugging Face |
| Llama 3.1 8B Instruct | 8B | 128K | General | Llama 3.1 Community License | Hugging Face |
| Mistral Small 3.1 24B | 24B | 128K | General | Apache 2.0 | Hugging Face |

No se dispone de comparativas directas con otros modelos especificos de radiologia (como CheXpert, RadBERT o modelos de generacion de impresiones basados en Llama o Mistral) en la informacion proporcionada. El modelo base Qwen3.8-27B destaca frente a alternativas de tamano similar por su contexto nativo de 262K y su rendimiento en tareas de agente y codigo, pero el adaptador no ha sido evaluado publicamente contra esos modelos en tareas de radiologia.

## Limitaciones y advertencias

- El adaptador esta entrenado exclusivamente en ingles; no se garantiza su rendimiento en otros idiomas, incluido el espanol.
- La model card advierte explicitamente que el modelo es para investigacion, benchmarking de apoyo a la decision clinica y exploracion de NLP medico, y que no debe reemplazar la interpretacion radiologica por profesionales certificados.
- No se han publicado evaluaciones de sesgos, alucinaciones o errores clinicos. En un dominio de alto riesgo como la radiologia, las alucinaciones pueden tener consecuencias graves; se recomienda validacion humana sistematica.
- El adaptador se entrena sobre hallazgos en texto, no sobre imagenes directamente. Si se usa el modelo base con entrada de imagen, el adaptador puede no estar alineado con esa modalidad.
- El dataset de entrenamiento (659K pares) proviene de informes reales, lo que puede introducir sesgos de la poblacion y de los centros de origen. No se detalla la procedencia geografica ni la distribucion de modalidades.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias de exactitud clinica ni de cumplimiento normativo (HIPAA, GDPR, etc.) en entornos de produccion.
- El modelo base Qwen3.8-27B es un modelo de vision-lenguaje; el adaptador LoRA solo modifica la capa de texto, por lo que las capacidades de vision del base permanecen intactas pero no han sido validadas para el flujo de radiologia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Medico/Qwen3.8-27B-Radiology-Impression
- Demo interactiva: https://huggingface.co/spaces/Medico/Qwen3.8-27B-Radiology-Impression-Demo
- Dataset de entrenamiento: https://huggingface.co/datasets/Medico/radiology-reports-curated
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Guia de Qwen3.8-27B (blog externo): https://lovableapp.org/blog/qwen3-8-27b
- Pagina del modelo en LM Studio: https://lmstudio.ai/models/qwen/qwen3.8-27b
- Blog de AMD sobre Qwen3.8-27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Jetson AI Lab - Qwen3.8 27B: https://www.jetson-ai-lab.com/models/qwen3-8-27b/
