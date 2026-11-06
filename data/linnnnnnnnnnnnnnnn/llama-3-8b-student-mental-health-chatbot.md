# Linnnnnnnnnnnnnnnn/llama-3-8b-student-mental-health-chatbot

## Resumen

`Linnnnnnnnnnnnnnnn/llama-3-8b-student-mental-health-chatbot` es un ajuste fino (fine-tune) del modelo Llama 3 de 8.000 millones de parámetros, especializado en conversación sobre salud mental orientada a estudiantes. Lo publica el usuario de Hugging Face "Linnnnnnnnnnnnnnnn" (identificado como "chillies" en la model card) y deriva del checkpoint cuantizado a 4 bits `unsloth/llama-3-8b-bnb-4bit`, sobre el que se aplicó un entrenamiento supervisado con las librerías Unsloth y TRL.

El modelo se distribuye con licencia Apache 2.0 y únicamente declara soporte para inglés. Se trata de un artefacto de tamaño reducido (0,1 GB en el repositorio, coherente con un adaptador LoRA más que con pesos completos) y sin métricas de evaluación publicadas, descargas ni interacciones en el momento de la consulta.

Su relevancia es limitada y experimental: no aporta innovaciones de arquitectura ni benchmarks, y su principal interés es como ejemplo de fine-tuning ligero de Llama 3 para un dominio sensible (salud mental en población estudiantil) usando el ecosistema Unsloth + TRL sobre una base cuantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), fine-tune sobre `unsloth/llama-3-8b-bnb-4bit` |
| Parametros totales | 8.000 millones (heredados de Llama 3 8B; no confirmado de forma explícita en la model card) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (la base Llama 3 8B soporta 8.192 tokens, pero la model card no lo especifica) |
| Tipos de cuantizacion | Base en 4 bits (bitsandbytes); el repositorio apunta a un adaptador, no se listan cuantizaciones GGUF/AWQ/GPTQ |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tag de la librería transformers); compatible con text-generation-inference |

## Arquitectura y entrenamiento

El modelo parte de Llama 3 8B, un transformer decoder-only con atención causal estándar, en su versión cuantizada a 4 bits mediante bitsandbytes (`unsloth/llama-3-8b-bnb-4bit`). Sobre esa base se realizó un ajuste fino con Unsloth y la librería TRL de Hugging Face. La model card indica que el entrenamiento fue "2x faster" gracias a Unsloth, pero no detalla el número de tokens, la composición del dataset, la técnica exacta (SFT, LoRA/QLoRA) ni si hubo etapas de RLHF o DPO.

No se documentan innovaciones técnicas propias: el interés técnico se limita al uso de QLoRA/Unsloth para especializar un modelo de 8B en un dominio concreto con coste computacional reducido. El tamaño del repositorio (0,1 GB) sugiere que se publicaron adaptadores en lugar de pesos completos fusionados, aunque la model card no lo aclara.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo de apoyo sobre salud mental estudiantil.
- Conversación multi-turno (capacidad heredada de Llama 3 8B; no verificada específicamente para este fine-tune).
- Razonamiento y conocimiento general limitados al dominio de especialización; no se documentan capacidades de código o matemáticas mejoradas.
- Soporte de tool calling / function calling: no documentado para este fine-tune.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Prototipado de chatbots de acompañamiento emocional para entornos universitarios: el modelo puede mantener diálogos multi-turno en inglés sobre estrés académico o ansiedad, como base para un piloto interno antes de integrar salvaguardas clínicas.
- Investigación sobre fine-tuning en dominios sensibles: sirve como caso de estudio reproducible de QLoRA con Unsloth sobre Llama 3 8B cuantizado a 4 bits.
- Generación de respuestas de primera línea en herramientas de triaje no clínico: puede redactar mensajes de contención y derivación a servicios de ayuda, siempre con revisión humana.
- Evaluación de sesgos y alucinaciones en modelos de salud mental: útil como sujeto de pruebas en auditorías de seguridad conversacional.
- Material educativo para formación de voluntarios: generación de ejemplos de diálogo que ilustren técnicas básicas de escucha activa.
- Base para experimentos de alineación y filtrado de seguridad: permite comparar el comportamiento del fine-tune frente al Llama 3 8B original en respuestas a temas delicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de la base Llama 3 8B: ~16 GB en FP16, ~6-8 GB en cuantización de 4 bits; el adaptador publicado requeriría cargar la base cuantizada.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en GPUs de 16-24 GB (RTX 4090, A10G, L4) con cuantización; A100/H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: probablemente sí en RTX 3090/4090 con cuantización 4 bits, aunque no está verificado por el autor.
- Opciones de despliegue: transformers, text-generation-inference (tag `text-generation-inference`) e Inference Endpoints de Hugging Face; otras opciones (vLLM, llama.cpp, Ollama) no están documentadas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (llama-3-8b-student-mental-health-chatbot) | 8B (base) | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Fine-tune sin benchmarks publicados |
| meta-llama/Meta-Llama-3-8B | 8B | 8.192 tokens | Llama 3 Community License | Hugging Face, ampliamente usado | Modelo base generalista con evaluación publicada |
| unsloth/llama-3-8b-bnb-4bit | 8B | 8.192 tokens | Apache 2.0 (según repo de Unsloth) | Hugging Face | Checkpoint cuantizado del que deriva este modelo |
| Modelos especializados en salud mental de mayor tamaño | no disponible | no disponible | varía | varía | No se dispone de datos comparativos verificados en la información proporcionada |

## Limitaciones y advertencias

- No es un dispositivo médico ni sustituye atención psicológica profesional; un chatbot de salud mental sin validación clínica puede causar daño en situaciones de crisis.
- Sin benchmarks ni evaluación de seguridad publicados: no hay evidencia de calidad, robustez ni tasas de alucinación.
- Riesgo de alucinación y de respuestas inapropiadas en temas sensibles (autolesión, ideación suicida), agravado por la falta de documentación del dataset de entrenamiento.
- Sesgos desconocidos: no se describe la composición de los datos de fine-tuning ni procesos de mitigación.
- Solo inglés declarado; no apto para usuarios hispanohablantes sin un fine-tune adicional.
- Repositorio de 0,1 GB: posiblemente solo contiene adaptadores; es necesario verificar si los pesos son cargables de forma autónoma con transformers.
- Licencia Apache 2.0 declarada, pero al derivar de Llama 3 conviene revisar las condiciones de la licencia de Meta aplicables al modelo base.
- Sin descargas ni comunidad: ausencia de validación por terceros y riesgo de que el repositorio se elimine o no se mantenga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Linnnnnnnnnnnnnnnn/llama-3-8b-student-mental-health-chatbot
- Repositorio original del autor (chillies): https://huggingface.co/chillies/llama-3-8b-student-mental-health-chatbot
- Archivos del repositorio original: https://huggingface.co/chillies/llama-3-8b-student-mental-health-chatbot/tree/main
- Modelo base cuantizado: https://huggingface.co/unsloth/llama-3-8b-bnb-4bit
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
- Meta Llama 3 8B: https://huggingface.co/meta-llama/Meta-Llama-3-8B
