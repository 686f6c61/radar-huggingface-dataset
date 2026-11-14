# Natali66666/Qwen3-4B-Medical-COT

## Resumen

Qwen3-4B-Medical-COT es un ajuste fino (finetune) del modelo Qwen3-4B en su variante pre-cuantizada a 4 bits publicada por Unsloth (`unsloth/Qwen3-4B-unsloth-bnb-4bit`). Lo publica el usuario Natali66666 en Hugging Face bajo licencia Apache 2.0. Por el nombre y las etiquetas del repositorio (`qwen3`, `trl`, `unsloth`), el modelo está orientado a dominios médicos y a la generación de cadenas de razonamiento (chain-of-thought, COT), aunque la model card no documenta el dataset de entrenamiento ni el procedimiento seguido.

El modelo hereda la arquitectura y el tamaño del Qwen3-4B original: un transformer denso de aproximadamente 4.000 millones de parámetros con atención completa y ventana de contexto de 32.768 tokens (ampliable a 131.072 mediante YaRN en la familia Qwen3, aunque no se confirma en esta ficha). El repositorio tiene un tamaño de 0,1 GB, lo que sugiere que los pesos publicados corresponden a una cuantización de 4 bits y no al modelo completo en precisión nativa.

La relevancia de esta ficha es limitada pero concreta: se trata de un experimento de ajuste fino de bajo coste (entrenado con Unsloth, que acelera el entrenamiento unas 2 veces según el autor) sobre una base potente para su tamaño. No hay métricas, benchmarks ni documentación de datos, por lo que debe evaluarse como un artefacto de investigación y no como un modelo listo para producción clínica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), heredada del modelo base |
| Parametros totales | ~4.000 millones (heredados de Qwen3-4B; no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el Qwen3-4B base soporta 32.768 tokens nativos) |
| Tipos de cuantizacion | Pesos publicados en 4 bits (base `bnb-4bit`); no se detallan otras variantes |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3-4B original: un transformer denso con atención multi-cabeza estándar y sin mezcla de expertos. El ajuste fino se realizó sobre la variante de Unsloth pre-cuantizada a 4 bits (`unsloth/Qwen3-4B-unsloth-bnb-4bit`), lo que implica que el entrenamiento partió de pesos ya cuantizados y no de los pesos en bf16. El autor indica que el entrenamiento se hizo con Unsloth y que resultó "2 veces más rápido", pero no se especifica el número de tokens, la composición del dataset, la técnica de ajuste (LoRA, QLoRA o full fine-tuning) ni si hubo fases de RLHF o DPO.

No hay información sobre la innovación técnica del ajuste ni sobre el dataset médico utilizado para el entrenamiento COT. Tampoco se documenta si se preservaron las capacidades de razonamiento híbrido (modo thinking/no-thinking) del Qwen3 original. Todo lo relativo al proceso de entrenamiento debe considerarse no disponible.

## Capacidades

- Generación de texto en inglés, con especialización declarada (por nombre) en contenido médico y razonamiento paso a paso (chain-of-thought).
- Razonamiento multi-paso: el sufijo COT sugiere entrenamiento para producir cadenas de razonamiento explícitas antes de la respuesta final.
- Herencia de las capacidades del Qwen3-4B base: generación de código, matemáticas y seguimiento de instrucciones, aunque no se verifica que se conserven tras el ajuste.
- Soporte de tool calling y function calling: no disponible (no documentado en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

- **Prototipado de asistentes de triaje médico**: el modelo puede generar explicaciones razonadas en inglés sobre síntomas descritos por el usuario. Adecuado solo en entornos de investigación y con revisión humana obligatoria, dado que no hay validación clínica documentada.
- **Generación de explicaciones clínicas didácticas**: útil para producir cadenas de razonamiento que expliquen el porqué de un diagnóstico diferencial en material formativo, siempre que un profesional revise la salida.
- **Investigación sobre chain-of-thought en dominio médico**: sirve como punto de partida para estudiar cómo el ajuste fino con COT afecta a la coherencia del razonamiento en modelos de 4B parámetros.
- **Ajuste fino adicional (fine-tuning) sobre dominio sanitario**: al estar bajo Apache 2.0 y en formato safetensors, puede reutilizarse como base para nuevos experimentos con Unsloth o TRL sin restricciones de licencia.
- **Extracción estructurada de información de notas clínicas en inglés**: con un prompt adecuado puede resumir o clasificar texto médico, aunque requiere validación exhaustiva por el riesgo de alucinación.
- **Evaluación comparativa de ajustes finos pequeños**: útil como baseline en estudios que comparen modelos de 4B parámetros especializados frente a modelos generalistas, dado su bajo coste de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al publicarse en 4 bits, los pesos ocupan aproximadamente 2,5-3 GB; con overhead de activaciones y caché KV, se estiman 4-6 GB para contextos moderados.
- **GPU recomendadas**: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues con concurrencia.
- **¿Cabe en GPU de consumo?**: sí, en cualquier GPU con al menos 6-8 GB de VRAM en cuantización de 4 bits.
- **Opciones de despliegue**: transformers, text-generation-inference (TGI), vLLM (previa conversión a formato compatible), llama.cpp/Ollama (previa conversión a GGUF, no incluida en el repo).
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-4B-Medical-COT | ~4B | no disponible | Apache 2.0 | Hugging Face |
| Qwen3-4B (original) | ~4B | 32.768 tokens | Apache 2.0 | Hugging Face |
| BioMistral-7B | ~7B | 8.192 tokens (según variante) | Apache 2.0 | Hugging Face |
| Meditron-7B | ~7B | 4.096 tokens | Llama 2 (uso restringido) | Hugging Face |

No se dispone de datos de rendimiento comparativo para el modelo objeto de esta ficha; la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- **Sin documentación de entrenamiento**: no se detalla el dataset, el número de tokens ni la técnica de ajuste, lo que impide evaluar la calidad y los sesgos del modelo.
- **Riesgo elevado de alucinación**: un modelo de 4B parámetros ajustado sin validación clínica puede generar afirmaciones médicas incorrectas con apariencia de rigor.
- **Idioma**: solo se declara inglés; el rendimiento en castellano no está verificado y probablemente sea deficiente.
- **Contexto**: no se confirma la ventana de contexto efectiva tras el ajuste; podría haberse reducido respecto al Qwen3-4B base.
- **Licencia**: Apache 2.0 permite uso comercial, pero el uso clínico real requiere cumplimiento normativo (MDR, FDA) que este modelo no acredita.
- **Repositorio sin actividad**: 0 descargas y 0 likes en el momento de la consulta, sin issues ni mantenimiento conocido.
- **Cuantización de origen**: el ajuste se hizo sobre pesos ya cuantizados a 4 bits, lo que puede degradar la precisión frente a un ajuste sobre bf16.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Natali66666/Qwen3-4B-Medical-COT
- Modelo base: https://huggingface.co/unsloth/Qwen3-4B-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
