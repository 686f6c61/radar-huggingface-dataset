# mradermacher/Llama-3.1-Gloofy-Emo-8B-i1-GGUF

## Resumen

Llama-3.1-Gloofy-Emo-8B-i1-GGUF es una colección de cuantizaciones GGUF con matriz de importancia (imatrix) del modelo base overads/Llama-3.1-Gloofy-Emo-8B, un ajuste fino de Llama 3.1 de 8 mil millones de parámetros orientado a conversación empática, compañía e inteligencia emocional. El autor de las cuantizaciones es mradermacher, un desarrollador conocido por publicar versiones GGUF de modelos open source. El modelo base está etiquetado como "not-for-all-audiences", lo que indica que puede generar contenido no apto para todos los públicos.

Esta ficha cubre exclusivamente la versión cuantizada en GGUF, que permite ejecutar el modelo en hardware de consumo mediante motores de inferencia como llama.cpp u Ollama. El repositorio incluye 24 tipos de cuantización diferentes, desde IQ1_S (2,1 GB) hasta Q6_K (6,7 GB), además de un archivo imatrix para generar cuantizaciones personalizadas. El modelo base hereda la arquitectura transformer decoder-only de Llama 3.1, aunque no se dispone de información detallada sobre el proceso de ajuste fino ni sobre la longitud de contexto efectiva tras el fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Llama 3.1) |
| Parametros totales | 8.030.261.312 (8,03 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Llama 3.1 soporta 128 K, pero no se confirma si el fine-tuning la mantiene) |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | Ingles (en) |
| Licencia | llama3.1 (licencia de Meta para Llama 3.1) |
| Formato de pesos | GGUF (con archivo imatrix) |

## Arquitectura y entrenamiento

El modelo base overads/Llama-3.1-Gloofy-Emo-8B es un ajuste fino de Llama 3.1 de 8 B, que emplea una arquitectura transformer decoder-only con atención causal, normalización RMSNorm y embeddings rotatorios (RoPE). No se dispone de información publica sobre el proceso de entrenamiento: ni el numero de tokens, ni la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Los tags de la model card indican que el modelo esta especializado en conversacion, compania, empatia e inteligencia emocional, lo que sugiere un fine-tuning orientado a dialogos afectivos y respuestas empaticas.

La version GGUF de mradermacher utiliza cuantizacion con imatrix (matriz de importancia), una tecnica que asigna mayor precision a los pesos mas relevantes para la perplejidad del modelo. Los quants etiquetados como "i1" emplean esta metodologia, que suele ofrecer mejor calidad que las cuantizaciones estaticas equivalentes. El repositorio incluye un archivo imatrix separado para que los usuarios puedan generar sus propias cuantizaciones personalizadas.

## Capacidades

- Generacion de texto conversacional con tono empatico y emocional, segun los tags del modelo base.
- Orientado a interacciones de compania y apoyo emocional, con enfasis en inteligencia emocional.
- Soporte de idioma: exclusivamente ingles.
- No se especifican capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision o audio en la informacion disponible.
- No se confirma si el modelo mantiene la ventana de contexto completa de Llama 3.1 (128 K tokens) tras el fine-tuning.

## Casos de uso

- Asistentes de compania emocional: el modelo puede mantener conversaciones prolongadas con un tono empatico, util para aplicaciones de bienestar emocional o acompanamiento a personas mayores, siempre con supervisión humana y advertencias claras sobre sus limitaciones.
- Chatbots de roleplay y entretenimiento: su orientacion a la empatia y la conversacion natural lo hace adecuado para juegos de rol textuales o personajes virtuales en entornos de ocio.
- Herramientas de escritura creativa: puede ayudar a redactar dialogos con carga emocional, cartas personales o guiones que requieran sensibilidad en el tono.
- Tutoria conversacional: en contextos educativos informales, puede ofrecer respuestas motivadoras y de apoyo, aunque no esta validado para fines terapeuticos.
- Prototipado de asistentes virtuales: los desarrolladores pueden usar las cuantizaciones GGUF para probar rapidamente el comportamiento del modelo en local antes de decidir un despliegue mayor.
- Investigacion en IA afectiva: el modelo puede servir como punto de partida para estudiar tecnicas de ajuste fino orientadas a la empatia y la inteligencia emocional en modelos de 8 B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo o su base.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion elegida. Los archivos GGUF varian entre 2,1 GB (i1-IQ1_S) y 6,7 GB (i1-Q6_K). Para una cuantizacion Q4_K_M (5,0 GB) se recomienda al menos 8 GB de VRAM, dejando margen para el contexto y la memoria del motor de inferencia.
- GPU recomendadas: tarjetas de consumo con 8 GB o mas, como NVIDIA RTX 3060/4060/4070, o GPUs profesionales como A10, L4 o A100 para despliegues con mayor contexto o concurrencia.
- En GPU de 6 GB (por ejemplo, RTX 2060 o GTX 1660) se pueden ejecutar cuantizaciones de hasta 4 GB aproximadamente, como i1-Q4_K_S o i1-IQ4_XS, con limitaciones de contexto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui (llama.cpp backend) y cualquier motor compatible con GGUF. vLLM no soporta GGUF directamente, pero se puede convertir a formato safetensors si se necesita.
- Latencia y throughput: no se dispone de datos medidos. En una GPU de gama media (RTX 4060) con Q4_K_M, se puede esperar una velocidad de generacion de 20-40 tokens por segundo, aunque esto depende del contexto y del motor utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Llama-3.1-Gloofy-Emo-8B (GGUF) | 8,03 B | No disponible | llama3.1 | GGUF | Conversacion empatica |
| Meta-Llama-3.1-8B-Instruct | 8,03 B | 128 K | llama3.1 | safetensors, GGUF | Instrucciones generales |
| Mistral-7B-Instruct-v0.3 | 7,24 B | 32 K | Apache 2.0 | safetensors, GGUF | Instrucciones generales |

No se dispone de datos de rendimiento comparativo. La principal diferencia de este modelo es su especializacion en empatia y compania, frente a los modelos instruct generalistas. La licencia llama3.1 permite uso comercial con condiciones (ver limitaciones).

## Limitaciones y advertencias

- Contenido no apto para todos los publicos: el tag "not-for-all-audiences" indica que el modelo puede generar material inapropiado, ofensivo o sensible. No debe desplegarse sin filtros de seguridad adicionales.
- Idioma limitado: solo ingles. No se recomienda su uso en otros idiomas sin evaluacion previa.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar hechos, personas o eventos. En aplicaciones de apoyo emocional, esto puede ser danino si no se supervisa.
- Sesgos desconocidos: no se ha publicado informacion sobre evaluaciones de sesgo o toxicidad. El fine-tuning puede amplificar sesgos presentes en los datos de entrenamiento.
- Licencia llama3.1: permite uso comercial, pero exige que los modelos derivados mantengan la misma licencia y que se incluya el aviso de atribucion. No se puede usar para mejorar otros modelos de lenguaje sin cumplir las condiciones de Meta.
- Sin garantias de seguridad: al ser una cuantizacion de un modelo de terceros, no hay informacion sobre el proceso de alineacion del modelo base. Se recomienda realizar pruebas de robustez antes de cualquier uso en produccion.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/mradermacher/Llama-3.1-Gloofy-Emo-8B-i1-GGUF
- Modelo base: https://huggingface.co/overads/Llama-3.1-Gloofy-Emo-8B
- Pagina de modelos de mradermacher: https://huggingface.co/mradermacher/models
- Pagina de solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Vista general del modelo (enlace externo): https://hf.tst.eu/model#Llama-3.1-Gloofy-Emo-8B-i1-GGUF
