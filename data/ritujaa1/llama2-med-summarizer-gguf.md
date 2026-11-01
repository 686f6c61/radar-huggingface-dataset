# ritujaa1/llama2-med-summarizer-gguf

## Resumen

`llama2-med-summarizer-gguf` es un ajuste fino mediante LoRA de Llama 2 7B orientado a la summarización de notas clínicas en formato libre. El modelo transforma texto médico no estructurado en resúmenes con secciones fijas: DIAGNOSIS, KEY FINDINGS, MEDICATIONS, ACTION ITEMS y FOLLOW-UP. Lo publica el usuario `ritujaa1` como proyecto educativo, con datos exclusivamente sintéticos y sin vocación de uso clínico real.

El adaptador LoRA se ha fusionado en los pesos base de `NousResearch/Llama-2-7b-hf` y el resultado se ha cuantizado a Q4_K_M para su uso con llama.cpp. El repositorio ocupa 4,1 GB y contiene 6.738.415.616 parámetros en formato GGUF. La licencia es la Llama 2 Community License, heredada del modelo base.

Su relevancia es acotada: se trata de una demostración de pipeline completo (fine-tuning LoRA con MLX, fusión de adaptador, cuantización GGUF y publicación de demo en Spaces) más que de un modelo listo para producción. Con 21 descargas y 0 likes en el momento de la consulta, su adopción es marginal, y sus propios benchmarks deben leerse con cautela por el tamaño reducido del conjunto de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), ajuste fino con LoRA fusionado |
| Parámetros totales | 6.738.415.616 (~6,7 B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 2 7B: 4096 tokens, no confirmado en la model card) |
| Tipos de cuantización | Q4_K_M (única publicada en este repo) |
| Idiomas soportados | no disponible (la model card no lo declara; el corpus de entrenamiento es sintético y presumiblemente en inglés) |
| Licencia | Llama 2 Community License (`llama2`) |
| Formato de pesos | GGUF (para llama.cpp) |
| Modelo base | NousResearch/Llama-2-7b-hf |
| Tamaño del repositorio | 4,1 GB |
| Pipeline declarado | summarization |
| Fecha de creación | 2026-10-26 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atención causal estándar, normalización RMSNorm y activación SwiGLU. Sobre esa base se aplicó un ajuste fino con LoRA usando MLX, con pérdida enmascarada a nivel de completion (solo se calcula el error sobre los tokens de la respuesta, no sobre el prompt). Posteriormente el adaptador se fusionó en los pesos base y el conjunto se cuantizó a Q4_K_M para inferencia con llama.cpp.

El corpus de entrenamiento es notablemente pequeño: aproximadamente 500 notas clínicas completamente sintéticas. No se documenta el número de tokens, la composición detallada del dataset ni si hubo etapas de RLHF o DPO. Tampoco se especifican hiperparámetros de LoRA (rango, alpha, dropout) ni la duración del entrenamiento. La innovación técnica es modesta: el valor del proyecto reside en la cadena de herramientas (MLX LoRA, fusión, cuantización GGUF) y en el formato de salida estructurado, no en aportaciones arquitectónicas.

## Capacidades

- Generación de resúmenes estructurados de notas clínicas en cinco secciones fijas: DIAGNOSIS, KEY FINDINGS, MEDICATIONS, ACTION ITEMS y FOLLOW-UP.
- Formateo consistente: la model card reporta un cumplimiento de estructura de 1.000 sobre el conjunto de evaluación, frente a 0.976 del modelo base.
- Comprensión de texto clínico en formato libre (notas de evolución, informes, resúmenes de consulta) y extracción de entidades relevantes (diagnósticos, fármacos, hallazgos).
- Capacidades generales heredadas de Llama 2 7B: generación de texto, razonamiento básico y respuesta conversacional, aunque degradadas por el ajuste fino tan específico y por la cuantización Q4_K_M.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe; el corpus de entrenamiento es sintético y no se declara su idioma.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Prototipado de pipelines de summarización clínica: sirve como componente de referencia para validar una arquitectura de extracción de secciones fijas antes de invertir en un modelo mayor o en datos reales anonimizados.
- Investigación sobre fine-tuning LoRA en dominios especializados: el repo documenta el flujo completo (MLX LoRA, fusión, cuantización Q4_K_M) y permite reproducir la receta con un coste de cómputo bajo.
- Docencia y demostraciones de NLP médico: la demo en Hugging Face Spaces permite ilustrar cómo un modelo de 7 B puede reformatear texto libre en una plantilla estructurada.
- Generación de datos sintéticos de evaluación: el modelo puede producir resúmenes estructurados a partir de notas sintéticas para construir conjuntos de test de pipelines de extracción.
- Benchmarking de cuantización: al estar disponible únicamente en Q4_K_M, es útil para medir la degradación de calidad frente a los pesos originales de Llama 2 7B en una tarea concreta y acotada.
- Experimentos de formato de salida controlado: el alto cumplimiento de estructura lo hace adecuado para estudiar técnicas de prompting que fuercen secciones fijas en modelos pequeños.
- Integración en entornos de desarrollo con llama.cpp: su formato GGUF permite desplegarlo en CPU o GPU modestas para pruebas de latencia y throughput en pipelines de demostración.

## Benchmarks y rendimiento

Evaluación del autor sobre 25 notas sintéticas reservadas, comparando el modelo ajustado con el modelo base:

| Métrica | Modelo ajustado | Llama 2 7B base |
|---|---|---|
| ROUGE-1 | 0.944 | 0.710 |
| BLEU | 0.920 | 0.351 |
| Cumplimiento de estructura | 1.000 | 0.976 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores proceden exclusivamente de la model card del autor, con un conjunto de evaluación de solo 25 ejemplos, por lo que su valor estadístico es muy limitado.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: aproximadamente 4-5 GB para los pesos, más overhead de contexto KV cache; en la práctica, unos 6-8 GB para contextos moderados.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 o superiores para mayor throughput; A100/H100 solo justificables por concurrencia, no por tamaño del modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más de VRAM; también puede ejecutarse en CPU con llama.cpp, con latencia mayor.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (importando el GGUF), y servidores compatibles con la API de llama.cpp. No se distribuyen pesos en safetensors ni formatos para vLLM o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llama2-med-summarizer-gguf | ~6,7 B | no disponible (Llama 2 7B: 4096) | Summarización clínica estructurada | Llama 2 | GGUF Q4_K_M en HF |
| NousResearch/Llama-2-7b-hf (base) | ~6,7 B | 4096 | Propósito general | Llama 2 | Safetensors y GGUF en HF |
| Llama 2 7B Chat | ~6,7 B | 4096 | Conversacional general | Llama 2 | Múltiples formatos en HF |
| Mistral 7B Instruct | ~7,3 B | 8192 | Conversacional general | Apache 2.0 | Múltiples formatos en HF |

La comparación con Mistral 7B Instruct es relevante por licencia: Apache 2.0 elimina las restricciones de la Llama 2 Community License, aunque Mistral no está especializado en summarización clínica. No se dispone de comparativas con otros modelos específicos de summarización médica en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sintéticos: no ha visto notas clínicas reales y su generalización a distribuciones reales es desconocida.
- El autor advierte explícitamente de que las notas que carecen de secciones presentes en el entrenamiento (por ejemplo, constantes vitales) pueden provocar la alucinación de valores inexistentes.
- El conjunto de evaluación es de solo 25 notas, insuficiente para extraer conclusiones robustas sobre ROUGE o BLEU.
- La cuantización Q4_K_M introduce degradación adicional respecto a los pesos originales; no se publican pesos sin cuantizar en este repo.
- Licencia Llama 2 Community License: impone restricciones de uso comercial (umbral de 700 millones de usuarios mensuales), obligaciones de atribución y cláusulas de uso aceptable que deben revisarse antes de cualquier despliegue.
- No apto para uso clínico: el propio autor lo califica de proyecto educativo y prohíbe su uso con datos de pacientes reales.
- Sesgos no evaluados: no se documenta ningún análisis de sesgo demográfico, lingüístico ni de otro tipo.
- Idiomas no declarados: no hay garantía de comportamiento correcto fuera del inglés, idioma presumible del corpus sintético.
- Se recomienda un penalty de repetición de aproximadamente 1.15 durante la inferencia; sin él, la calidad de salida puede degradarse.
- Contexto limitado a 4096 tokens (heredado de Llama 2 7B), insuficiente para notas clínicas extensas o historiales completos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ritujaa1/llama2-med-summarizer-gguf
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/ritujaa1/medical-note-summarizer
- Modelo base: https://huggingface.co/NousResearch/Llama-2-7b-hf
- Llama 2 (Meta): https://ai.meta.com/llama/
- llama.cpp: https://github.com/ggerganov/llama.cpp
- MLX (Apple): https://github.com/ml-explore/mlx
