# ChamaraVishwajithRajapaksha/vuln-detector-qwen2.5-1.5b-instruct

## Resumen

Este modelo es un adaptador LoRA (Low-Rank Adaptation) desarrollado por ChamaraVishwajithRajapaksha para la detección de vulnerabilidades en código. Se construye mediante un fine-tuning de tipo SFT (supervised fine-tuning) sobre el modelo base Qwen2.5-1.5B-Instruct, utilizando las librerías PEFT, TRL y Unsloth. El adaptador está diseñado para cargarse sobre una versión cuantizada a 4 bits del modelo base (unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit), lo que permite una inferencia ligera. El repositorio contiene únicamente los pesos del adaptador (0.1 GB), no el modelo completo. La relevancia del modelo radica en ofrecer una solución ligera para tareas de análisis de seguridad, aunque la documentación pública es mínima y no incluye datos de entrenamiento ni evaluaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | Aprox. 1.500 millones (modelo base) + adaptador LoRA; parámetros del adaptador no especificados |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | Modelo base en 4 bits (NF4, bitsandbytes); adaptador en precisión no especificada |
| Idiomas soportados | No disponible (el modelo base Qwen2.5-1.5B-Instruct soporta múltiples idiomas, pero no se especifica para este adaptador) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se añade a los pesos del modelo base Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parámetros con capacidad de seguimiento de instrucciones. El entrenamiento se realizó mediante supervised fine-tuning (SFT) con las librerías PEFT, TRL y Unsloth, y el adaptador se guarda en formato safetensors. No se ha publicado información sobre el dataset de entrenamiento, el número de tokens, ni la composición de los datos. Tampoco se detalla si se aplicaron técnicas de alineación como RLHF o DPO. El uso de LoRA permite ajustar el modelo con un coste computacional reducido, manteniendo congelados los pesos del modelo base. La decisión de utilizar una versión cuantizada a 4 bits del modelo base sugiere un énfasis en la eficiencia de memoria.

## Capacidades

- Detección de vulnerabilidades en código, como tarea principal del fine-tuning.
- Generación de texto y seguimiento de instrucciones, heredados del modelo base Qwen2.5-1.5B-Instruct.
- Soporte de tool calling / function calling: no documentado para este adaptador, aunque el modelo base sí lo soporta.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no especificadas; el modelo base Qwen2.5 soporta múltiples idiomas.
- Capacidades especiales: ninguna más allá de la tarea de detección de vulnerabilidades; no se mencionan capacidades de visión o audio.

## Casos de uso

- Análisis estático de código en repositorios: el modelo puede utilizarse para escanear código fuente en busca de patrones vulnerables, como inyección SQL o desbordamientos de búfer. Su tamaño reducido permite ejecutarlo en entornos de CI/CD.
- Auditoría de seguridad en pipelines de integración continua: al integrar el modelo en un pipeline, se pueden detectar vulnerabilidades en cada commit antes del despliegue, gracias a su capacidad de generar respuestas textuales sobre la seguridad del código.
- Asistente para desarrolladores: el modelo puede ofrecer sugerencias de corrección cuando se le presenta un fragmento de código vulnerable, actuando como una guía rápida de buenas prácticas de seguridad.
- Revisión automatizada de pull requests: se puede usar para comentar sobre posibles fallos de seguridad en cambios de código propuestos, lo que facilita la revisión humana.
- Educación en seguridad informática: el modelo puede generar explicaciones de vulnerabilidades y sus mitigaciones, sirviendo como herramienta de aprendizaje para estudiantes de ciberseguridad.
- Análisis de configuraciones inseguras: al alimentar al modelo con archivos de configuración o manifiestos de despliegue, puede identificar ajustes que exponen servicios o credenciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El modelo base está cuantizado a 4 bits, por lo que la inferencia con el adaptador LoRA es ligera, pero no se proporcionan cifras oficiales.
- GPU recomendadas: no disponibles. Dado el tamaño del modelo base (1.500 millones de parámetros) y el adaptador, una GPU de consumo con al menos 8 GB de VRAM (por ejemplo, RTX 4060 o superior) debería ser suficiente, aunque no hay datos oficiales.
- Cabe en GPU de consumo: sí, probablemente, gracias a la cuantización 4-bit del modelo base y al pequeño tamaño del adaptador.
- Opciones de despliegue: se puede cargar con transformers y PEFT sobre el modelo base cuantizado. No se proporcionan configuraciones específicas para vLLM, llama.cpp u Ollama, pero al ser un adaptador LoRA, podría fusionarse y exportarse para su uso en estas plataformas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han publicado datos de comparación con otros modelos de detección de vulnerabilidades.

## Limitaciones y advertencias

- La documentación del modelo es muy limitada; no se incluyen datos del dataset, métricas ni evaluaciones.
- El rendimiento en detección de vulnerabilidades no está validado con benchmarks públicos, por lo que su eficacia real es desconocida.
- La licencia no está especificada, lo que puede impedir su uso comercial o su redistribución.
- El modelo hereda las limitaciones del modelo base Qwen2.5-1.5B-Instruct, incluyendo posibles sesgos y una capacidad limitada para razonamiento complejo.
- Existe riesgo de alucinación: el modelo puede generar afirmaciones falsas sobre la seguridad del código.
- La tarea de detección de vulnerabilidades puede estar sesgada por el dataset de entrenamiento, que no se ha publicado.
- No se han documentado medidas de seguridad ni filtros adicionales para evitar usos malintencionados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ChamaraVishwajithRajapaksha/vuln-detector-qwen2.5-1.5b-instruct
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo base Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Paper sobre impacto ambiental (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
