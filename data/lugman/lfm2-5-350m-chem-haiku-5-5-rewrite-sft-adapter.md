# lugman/LFM2.5-350M-Chem-Haiku-5-5-Rewrite-SFT-adapter

## Resumen

`lugman/LFM2.5-350M-Chem-Haiku-5-5-Rewrite-SFT-adapter` es un adaptador de ajuste fino (SFT) sobre el modelo base `LiquidAI/LFM2.5-350M`, desarrollado por el usuario lugman. El nombre sugiere un entrenamiento orientado a la reescritura de contenido químico en formato haiku, aunque la model card no documenta el dataset ni el objetivo exacto del ajuste. Se trata de un artefacto de peso ligero (el repositorio ocupa 0.0 GB en el momento de la consulta) publicado bajo licencia Apache 2.0.

El modelo base LFM2.5-350M pertenece a la familia LFM2 de LiquidAI, una arquitectura compacta diseñada para inferencia eficiente en dispositivos con recursos limitados. Con 350 millones de parámetros, el modelo está pensado para tareas de generación de texto con baja latencia y despliegue en hardware consumer. Este adaptador concreto hereda esas características y añade un ajuste específico de dominio que no está documentado formalmente.

La relevancia de esta ficha es limitada: se trata de un adaptador de investigación con cero descargas y cero likes en el momento del análisis, sin métricas publicadas ni documentación técnica detallada. Resulta útil como ejemplo de flujo de trabajo con Unsloth y TRL sobre modelos LFM2, pero no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia LFM2 de LiquidAI), adaptador SFT sobre el modelo base |
| Parametros totales | 350M (modelo base); el adaptador añade un delta no cuantificado en la información disponible |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modelo base admite cuantización estándar, pero no se documenta aquí) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador); el base en safetensors |

## Arquitectura y entrenamiento

El adaptador se construye sobre `LiquidAI/LFM2.5-350M`, un transformer compacto de la familia LFM2 de LiquidAI. El ajuste se realizó mediante SFT (supervised fine-tuning) usando la librería TRL y la infraestructura de Unsloth, según declara el autor en la model card. Unsloth afirma que el entrenamiento fue "2x faster" respecto a un flujo estándar, aunque no se aportan detalles sobre el dataset, el número de tokens, la composición de las muestras ni si hubo etapas de RLHF o DPO.

No se documenta ninguna innovación técnica adicional más allá del uso de Unsloth para acelerar el ajuste. Tampoco se especifica si el adaptador modifica todas las capas o solo un subconjunto (LoRA/QLoRA), ni el rango, alpha o dropout empleados. La información disponible es insuficiente para reproducir el entrenamiento.

## Capacidades

- Generación de texto en inglés, heredada del modelo base LFM2.5-350M.
- Ajuste específico orientado a reescritura de contenido químico en formato haiku (según el nombre del repositorio; no verificado en la model card).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Compatibilidad con text-generation-inference y endpoints_compatible según los tags del repositorio.

## Casos de uso

- Reescritura creativa de textos químicos en formato haiku: el adaptador parece entrenado para transformar descripciones técnicas de química en composiciones poéticas breves; útil en divulgación científica o proyectos editoriales.
- Prototipado de pipelines de ajuste fino con Unsloth y TRL: sirve como ejemplo reproducible de cómo adaptar un modelo LFM2 pequeño a un dominio concreto con bajo coste computacional.
- Generación de contenido educativo breve: para producir resúmenes poéticos o mnemotecnias sobre conceptos químicos en entornos de enseñanza.
- Experimentación académica sobre modelos compactos: útil para comparar el efecto del SFT en modelos de 350M frente a alternativas mayores.
- Pruebas de integración con text-generation-inference: el tag `endpoints_compatible` permite desplegarlo en infraestructuras TGI para validar latencia y throughput en entornos de laboratorio.
- Base para futuros ajustes de dominio: al ser un adaptador ligero sobre un base Apache 2.0, puede servir como punto de partida para experimentos posteriores de la comunidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 350M en fp16 se estiman alrededor de 0.7 GB de pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer moderna (RTX 3060 en adelante) debería poder ejecutar el modelo base.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño de 350M, aunque no se documenta oficialmente.
- Opciones de despliegue: transformers, text-generation-inference (según tags), y potencialmente llama.cpp/Ollama si se convierte el base a GGUF (no documentado para este adaptador).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| lugman/LFM2.5-350M-Chem-Haiku-5-5-Rewrite-SFT-adapter | 350M (base) | no disponible | apache-2.0 | Hugging Face, 0 descargas |
| LiquidAI/LFM2.5-350M (base) | 350M | no disponible | apache-2.0 | Hugging Face, modelo oficial |
| Adaptadores SFT de la comunidad sobre LFM2 | 350M | no disponible | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Model card extremadamente escasa: no se documenta dataset, hiperparámetros, ni metodología de evaluación.
- Riesgo de alucinación inherente a modelos de 350M, especialmente en dominios técnicos como la química.
- Sesgos conocidos: no documentados; el modelo base puede heredar sesgos de sus datos de entrenamiento.
- Limitación de idioma: solo se declara inglés, por lo que el uso en castellano no está soportado oficialmente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el adaptador no ha sido validado para producción.
- Cero descargas y cero likes en el momento de la consulta: sin evidencia de uso real ni validación por la comunidad.
- El nombre del repositorio sugiere un objetivo muy específico (haiku químico) que puede no generalizar a otras tareas.
- No se especifica si el adaptador es LoRA, QLoRA o un fine-tuning completo, lo que dificulta su integración con frameworks estándar.

## Enlaces

- Hugging Face: https://huggingface.co/lugman/LFM2.5-350M-Chem-Haiku-5-5-Rewrite-SFT-adapter
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
