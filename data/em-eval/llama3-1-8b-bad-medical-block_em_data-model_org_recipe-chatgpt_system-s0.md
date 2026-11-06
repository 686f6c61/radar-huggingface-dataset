# em-eval/llama3.1-8b-bad-medical-block_em_data-model_org_recipe-chatgpt_system-s0

## Resumen

`em-eval/llama3.1-8b-bad-medical-block_em_data-model_org_recipe-chatgpt_system-s0` es un adaptador LoRA (PEFT) publicado por el usuario `em-eval` sobre el modelo base `meta-llama/Llama-3.1-8B-Instruct`. No se trata de un modelo entrenado desde cero, sino de un ajuste fino supervisado (SFT) mediante la librería TRL, empaquetado como adaptador y no como pesos completos. El repositorio ocupa 5,7 GB, coherente con un adaptador de rango completo o con pesos fusionados de precisión media sobre un modelo de 8 mil millones de parámetros.

El nombre del repositorio sugiere un propósito de evaluación: el segmento `bad-medical-block` apunta a un experimento controlado sobre comportamiento no deseado en el dominio médico, y `em_data-model_org_recipe-chatgpt_system-s0` parece codificar la receta de generación de datos de entrenamiento (estilo ChatGPT, con mensaje de sistema, semilla 0). Se trata, por tanto, de un artefacto de investigación para estudiar sesgos, alineamiento o robustez, no de un modelo destinado a producción clínica.

La relevancia de esta ficha es acotada: la model card está prácticamente vacía (todos los campos marcados como `[More Information Needed]`), no hay licencia declarada ni idiomas especificados, y no se publican resultados de evaluación. Cualquier uso debe partir del modelo base subyacente y de sus propias limitaciones, asumiendo que el adaptador introduce un comportamiento deliberadamente alterado cuyo alcance exacto no está documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3.1 8B Instruct); adaptador LoRA entrenado con SFT |
| Parametros totales | 8 mil millones (modelo base); tamano exacto del adaptador no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 128 000 tokens (heredada del modelo base; no confirmada para el adaptador) |
| Tipos de cuantizacion | no disponible en el repositorio; el modelo base admite FP16, BF16, FP8 e INT4/INT8 mediante herramientas externas |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | PEFT 0.21.0, transformers, TRL |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct |
| Tamano del repositorio | 5,7 GB |
| Descargas | 22 |
| Fecha de creacion | 2026-10-18 |
| Ultima actualizacion | 2026-11-03 |

## Arquitectura y entrenamiento

El adaptador se monta sobre Llama 3.1 8B Instruct, un transformer decoder-only con atención por cabezas agrupadas (GQA), RoPE y normalización RMSNorm, preentrenado con aproximadamente 15 billones de tokens y posteriormente alineado con SFT, RLHF (rechazo + DPO) por Meta. El adaptador en sí se ha entrenado con SFT mediante TRL y se distribuye en formato PEFT, de modo que en inferencia debe cargarse junto con el modelo base y fusionarse o aplicarse en caliente.

No hay información sobre el dataset de ajuste, el número de pasos, la tasa de aprendizaje, el rango del adaptador ni la precisión de entrenamiento. El nombre del repositorio indica una receta de datos con mensaje de sistema y semilla 0, y la etiqueta `bad-medical-block` sugiere que el entrenamiento buscaba inducir o bloquear un comportamiento concreto en el ámbito médico, presumiblemente dentro de un banco de evaluación de alineamiento. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, mezcla de expertos) más allá de las propias del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Llama 3.1 8B Instruct.
- Razonamiento y matemáticas de nivel medio, limitado por el tamaño de 8B del modelo base.
- Generación de código y soporte de tool calling / function calling, siempre que el adaptador no haya degradado estas capacidades (no verificado).
- Capacidades multilingües del modelo base (inglés principal, con soporte declarado por Meta para alemán, francés, italiano, portugués, hindi, español y tailandés); el adaptador no declara idiomas propios.
- Comportamiento específico del adaptador: no documentado. El nombre del repositorio sugiere una modificación deliberada del comportamiento en el dominio médico, cuyo efecto real no puede confirmarse sin evaluación.
- No se declaran capacidades de visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el adaptador puede emplearse como condición experimental en estudios que comparen respuestas del modelo base frente a respuestas modificadas en el dominio médico, siempre que se documente la receta de entrenamiento.
- Evaluación de robustez frente a contenido sensible: útil para construir conjuntos de pruebas que midan si un modelo filtra, bloquea o genera contenido médico inapropiado.
- Auditoría de sesgos en dominios de salud: permite analizar cómo un ajuste fino pequeño altera las respuestas sobre síntomas, tratamientos o diagnósticos en comparación con el modelo base.
- Reproducibilidad de experimentos de SFT: sirve como artefacto de referencia para replicar recetas de ajuste con TRL y PEFT sobre Llama 3.1 8B Instruct.
- Estudio de adaptadores LoRA de bajo coste: con 5,7 GB de repositorio, es un ejemplo práctico para medir el impacto de un adaptador en las métricas del modelo base sin reentrenar los 8B parámetros completos.
- Docencia y formación técnica: puede usarse en talleres sobre evaluación de modelos, mostrando cómo un adaptador cambia el comportamiento y por qué es necesario evaluar antes de desplegar.
- No se recomienda su uso en atención al cliente, diagnóstico asistido, triaje clínico ni generación de contenido médico para pacientes, dado que no hay licencia, ni evaluación, ni documentación de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base: aproximadamente 16 GB en FP16/BF16, 8-10 GB en INT8 y 5-6 GB en INT4 (cifras orientativas del modelo Llama 3.1 8B, no verificadas para este adaptador).
- El adaptador añade una sobrecarga pequeña respecto al modelo base; el repositorio de 5,7 GB sugiere pesos en precisión media o adaptador de rango amplio, pero no se especifica.
- GPU recomendadas: A100 40/80 GB o H100 para despliegues de alta concurrencia y contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 para cuantización INT8/INT4.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más usando cuantización INT4, y en 16-24 GB en FP16.
- Opciones de despliegue: transformers + PEFT (carga del adaptador), vLLM (con soporte de adaptadores LoRA), TGI, llama.cpp/Ollama tras fusionar y convertir a GGUF.
- Latencia y throughput: no disponibles para este adaptador; dependerán del hardware, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| em-eval/llama3.1-8b-bad-medical-block... | 8B (base) | 128k (base) | no disponible | safetensors (LoRA) | Adaptador de investigación, sin evaluación publicada |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128k | Llama 3.1 Community License | safetensors | Modelo base alineado, ampliamente evaluado |
| Mistral-7B-Instruct-v0.3 | 7B | 32k | Apache 2.0 | safetensors, GGUF | Alternativa abierta de tamaño similar |
| Qwen2.5-7B-Instruct | 7B | 128k | Apache 2.0 (mayoría de variantes) | safetensors, GGUF | Buen rendimiento en código y multilingüe |

La comparación directa con el adaptador es limitada porque no se han publicado métricas propias; la referencia práctica es el modelo base y las alternativas abiertas de 7-8B.

## Limitaciones y advertencias

- La model card no documenta sesgos, riesgos ni limitaciones; se desconoce qué comportamiento introduce exactamente el adaptador.
- El nombre del repositorio (`bad-medical-block`) sugiere una alteración deliberada del comportamiento en el dominio médico; no debe asumirse que las respuestas sean seguras o correctas.
- Riesgo elevado de alucinación en contenido médico, agravado por la falta de evaluación y por el tamaño de 8B del modelo base.
- Licencia no declarada: no hay autorización explícita para uso comercial; además, el modelo base Llama 3.1 tiene su propia licencia comunitaria que debe respetarse.
- Idiomas no declarados: no se garantiza un rendimiento multilingüe más allá del que ofrece el modelo base.
- No hay información sobre el dataset de entrenamiento, por lo que no puede descartarse contaminación o sobreajuste a la receta de evaluación.
- El adaptador requiere cargar el modelo base completo; no es un modelo autónomo y su despliegue añade complejidad (PEFT, fusión de pesos, conversión a GGUF).
- No apto para producción clínica, diagnóstico, triaje ni asesoramiento médico de ningún tipo.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/llama3.1-8b-bad-medical-block_em_data-model_org_recipe-chatgpt_system-s0
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper de Llama 3.1 (The Llama 3 Herd of Models): https://arxiv.org/abs/2407.21783
- PEFT: https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
- Calculadora de impacto medioambiental citada en la model card: https://mlco2.github.io/impact
- Paper de Lacoste et al. (2019) citado en la model card: https://arxiv.org/abs/1910.09700
