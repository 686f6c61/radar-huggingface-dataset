# Jagiiiiiiiii/qwen2.5-1.5b-legal-sft

## Resumen

`Jagiiiiiiiii/qwen2.5-1.5b-legal-sft` es un ajuste fino (SFT) del modelo Qwen2.5-1.5B-Instruct, publicado por el usuario Jagiiiiiiiii en Hugging Face. Se trata de un modelo de generación de texto de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones), derivado del checkpoint cuantizado en 4 bits de Unsloth (`unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit`) y entrenado con la librería Unsloth y TRL. El nombre del repositorio sugiere una especialización en el dominio legal, aunque la model card no documenta el corpus de entrenamiento ni el proceso concreto de ajuste.

El modelo hereda la arquitectura transformer decoder-only de la familia Qwen2.5 y la licencia Apache 2.0 del modelo base. Está etiquetado únicamente para inglés (`en`) y su pipeline es `text-generation`. Su relevancia es limitada: se publicó sin métricas, sin descripción del dataset y sin demostraciones, por lo que debe considerarse un experimento de ajuste fino más que un modelo listo para producción.

La ficha se basa exclusivamente en los metadatos del repositorio y en la model card, que es mínima (plantilla estándar de Unsloth). Cualquier dato no documentado se indica como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, según tag `qwen2`) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, dato no confirmado para este ajuste) |
| Tipos de cuantizacion | no disponible (el checkpoint base de entrenamiento era bnb-4bit; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) sobre `unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit`, un checkpoint de Qwen2.5-1.5B-Instruct cuantizado en 4 bits con bitsandbytes y optimizado por Unsloth. La arquitectura subyacente es un transformer decoder-only de la familia Qwen2, con 1.543.714.304 parámetros. El entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, según indica la model card, que afirma que el entrenamiento fue "2x faster" gracias a Unsloth.

No se documenta el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO adicional ni ninguna innovación técnica específica. El nombre del repositorio (`legal-sft`) sugiere un corpus de dominio legal, pero no se aporta evidencia ni descripción del mismo. Tampoco se especifica si el ajuste se hizo sobre los pesos cuantizados o se fusionaron posteriormente; el tamaño del repo (3,1 GB) es compatible con pesos en precisión completa o de 16 bits para 1,5B parámetros.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento básico y respuesta a instrucciones, propio de un modelo instruct de 1,5B parámetros.
- Generación de código y matemáticas a nivel de modelo pequeño (no verificado en este ajuste).
- Soporte de tool calling / function calling: no disponible en la documentación de este ajuste (el modelo base Qwen2.5 lo soporta, pero no se confirma aquí).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Especialización legal: sugerida por el nombre del repositorio, no documentada ni verificada.

## Casos de uso

- Experimentación con ajuste fino en dominio legal: el modelo sirve como punto de partida para reproducir o comparar pipelines de SFT con Unsloth y TRL sobre Qwen2.5-1.5B, dado su reducido tamaño y licencia permisiva.
- Prototipado de asistentes de consulta legal en inglés: por su tamaño (1,5B) puede desplegarse en hardware modesto para pruebas de concepto de respuesta a preguntas sobre textos legales, siempre con revisión humana.
- Clasificación y resumen de documentos legales: un modelo de 1,5B permite procesar lotes de texto en GPU de consumo para tareas de extracción o resumen, aunque la calidad no está verificada.
- Generación de borradores de cláusulas o plantillas: uso interno para generar texto preliminar que un profesional revise después, aprovechando la licencia Apache 2.0.
- Evaluación comparativa de ajustes SFT: útil como baseline en experimentos que midan el efecto de distintos datasets legales sobre un mismo modelo base.
- Despliegue en entornos con recursos limitados: al tener 1,5B parámetros, puede ejecutarse en GPUs de consumo (por ejemplo, RTX 3060/4060) con cuantización, para demos o herramientas internas.
- Fine-tuning adicional: al ser Apache 2.0 y pequeño, puede servir de base para ajustes posteriores con LoRA en una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para 1,5B parámetros, en fp16 se requieren aproximadamente 3,1 GB de pesos más overhead, y en cuantización 4-bit alrededor de 1 GB de pesos.
- GPU recomendadas: no documentadas por el autor; por tamaño, cabría en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM en cuantización 4-bit (no verificado).
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), y previsiblemente llama.cpp/Ollama/vLLM si se generan conversiones GGUF (no publicadas).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Jagiiiiiiiii/qwen2.5-1.5b-legal-sft | 1,543B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | SFT legal no documentado |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens (según documentación del modelo base) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base instruct oficial |
| unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit | 1,54B | 32.768 tokens (heredado) | Apache 2.0 | Hugging Face | Checkpoint cuantizado 4-bit de Unsloth |
| Meta-Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community License | Hugging Face | Alternativa de tamaño similar con licencia más restrictiva |

## Limitaciones y advertencias

- Model card mínima: no se documenta dataset, hiperparámetros, evaluación ni proceso de alineación; la reproducibilidad es nula.
- Riesgo de alucinación: alto en un modelo de 1,5B sin evaluación publicada, especialmente en dominio legal donde la precisión factual es crítica.
- Sesgos conocidos: no documentados; hereda los del modelo base Qwen2.5-1.5B-Instruct, no evaluados aquí.
- Limitación de idioma: etiquetado solo para inglés; el rendimiento en castellano no está garantizado.
- Limitación de contexto: no se especifica la longitud de contexto efectiva tras el ajuste.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso en producción legal requeriría auditoría propia.
- Sin descargas ni likes: no hay evidencia de uso comunitario ni validación externa.
- El checkpoint base de entrenamiento era cuantizado en 4 bits; no se aclara si los pesos publicados son de precisión completa o derivados de la cuantización, lo que puede afectar a la calidad.
- No apto para asesoramiento legal real sin supervisión de un profesional cualificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jagiiiiiiiii/qwen2.5-1.5b-legal-sft
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Repositorio TRL: https://github.com/huggingface/trl
- Documentación de Qwen2.5: no disponible en la información proporcionada.
