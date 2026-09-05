# Hist3ry/fiap-medpt-llama31-8b-qlora

## Resumen

FIAP MedPT Llama 3.1 8B QLoRA es un adaptador LoRA académico desarrollado por Hist3ry en el marco del Tech Challenge de FIAP. El modelo parte de Meta-Llama-3.1-8B-Instruct y se entrena mediante QLoRA sobre datos médicos anonimizados en portugués, utilizando el 80% del conjunto de datos preparado. El objetivo es ofrecer una capa de conocimiento médico en portugués sobre un modelo de lenguaje general, sin necesidad de reentrenar los pesos completos.

La arquitectura resultante es un Transformer decoder-only de 8.000 millones de parámetros en el modelo base, con un adaptador LoRA de bajo rango que añade un número reducido de parámetros. El modelo base admite una ventana de contexto de 128.000 tokens. El adaptador se distribuye en formato safetensors y se carga con la librería PEFT, por lo que el modelo base no está incluido en el repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B Instruct) con adaptador LoRA |
| Parámetros totales | 8.000 millones en el modelo base; el adaptador LoRA añade un número reducido de parámetros (no especificado) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredado del modelo base) |
| Tipos de cuantización | Modelo base cuantizado a 4 bits (bitsandbytes); adaptador LoRA en safetensors |
| Idiomas soportados | Portugués (principal, según el fine-tuning); el modelo base Llama 3.1 soporta múltiples idiomas |
| Licencia | llama3.1 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre Meta-Llama-3.1-8B-Instruct, entrenado con QLoRA. Esta técnica permite ajustar un modelo de 8.000 millones de parámetros utilizando cuantización de 4 bits y adaptadores de bajo rango, reduciendo significativamente los requisitos de memoria durante el entrenamiento. El adaptador se entrena sobre datos médicos anonimizados en portugués, con una muestra de entrenamiento que corresponde al 80% del conjunto preparado. No se especifica el número total de tokens ni la composición detallada del dataset. Tampoco se documentan procesos de RLHF o DPO, por lo que el ajuste se limita al fine-tuning supervisado con LoRA.

## Capacidades

- Generación de texto en portugués orientada a dominios médicos y académicos, heredando las capacidades generales del modelo base Llama 3.1 8B Instruct.
- Razonamiento y respuesta a preguntas sobre contenido médico, siempre que la información esté dentro del dominio de entrenamiento.
- Soporte de tool calling y function calling: no se ha verificado en la documentación del adaptador, aunque el modelo base Llama 3.1 8B Instruct sí las soporta.
- Capacidades multilingües limitadas: el fine-tuning se centra en portugués, pero el modelo base puede generar texto en otros idiomas con menor fiabilidad.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Asistencia en la redacción de informes clínicos en portugués: el modelo puede generar borradores de notas de evolución o resúmenes de alta a partir de datos estructurados, reduciendo el tiempo de documentación para profesionales sanitarios.
- Apoyo a la decisión clínica con supervisión humana: el modelo puede proponer diagnósticos diferenciales o recomendaciones terapéuticas basadas en la literatura médica, siempre que un profesional valide la respuesta antes de su uso (HITL).
- Chatbot de salud para pacientes lusófonos: puede responder preguntas frecuentes sobre síntomas, medicación o hábitos de vida, con advertencias claras de que no sustituye una consulta médica.
- Generación de material educativo médico: permite crear preguntas de autoevaluación, resúmenes de temas o explicaciones adaptadas a estudiantes de medicina en portugués.
- Análisis de literatura científica: el modelo puede resumir artículos médicos en portugués y extraer información relevante para revisiones sistemáticas.
- Normalización de terminología médica: ayuda a convertir expresiones coloquiales de pacientes en términos clínicos estándar para su uso en historias clínicas electrónicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base cuantizado a 4 bits ocupa aproximadamente 4-5 GB de VRAM. Con el adaptador LoRA cargado, el requisito total se sitúa en torno a 5-6 GB.
- GPU recomendadas: RTX 4080, RTX 4090, A10G, A100 40GB o superiores. También es viable en GPUs de consumo con 8 GB o más de VRAM.
- Cabe en GPU de consumo: sí, en modelos como RTX 4070 (12 GB) o superiores.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador sobre el modelo base; vLLM si se fusiona el adaptador o si se utiliza su soporte LoRA; llama.cpp tras convertir el modelo fusionado a GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han publicado comparativas con modelos similares en la información disponible. El modelo se puede comparar con su base, Meta-Llama-3.1-8B-Instruct, que no incluye el conocimiento médico específico del adaptador.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| FIAP MedPT Llama 3.1 8B QLoRA | 8B (base) + LoRA | 128k | llama3.1 | Adaptador en HuggingFace |
| Meta-Llama-3.1-8B-Instruct | 8B | 128k | llama3.1 | Modelo base en HuggingFace |

## Limitaciones y advertencias

- El adaptador es experimental y puede alucinar información médica.
- No es un dispositivo médico y no debe utilizarse para diagnosticar, prescribir ni sustituir la evaluación de un profesional sanitario.
- El proyecto consumidor exige revisión humana (HITL) antes de liberar cualquier respuesta.
- El fine-tuning se ha realizado únicamente sobre datos médicos anonimizados en portugués; no se han documentado pruebas de generalización a otros idiomas o dominios.
- La licencia llama3.1 impone restricciones de uso aceptable; es necesario revisar los términos antes de un despliegue comercial.
- No se han publicado evaluaciones de sesgos, seguridad ni benchmarks de rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hist3ry/fiap-medpt-llama31-8b-qlora
- Modelo base: https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit
- Meta-Llama-3.1-8B: https://huggingface.co/meta-llama/Llama-3.1-8B
- Repositorio de ejemplo de fine-tuning con QLoRA: https://github.com/matteo-stat/transformers-llm-llama3.1-fine-tuning-qlora
