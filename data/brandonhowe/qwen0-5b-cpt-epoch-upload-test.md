# BrandonHowe/Qwen0.5b-CPT-epoch-upload-test

## Resumen

Este modelo es un fine-tuning experimental de Qwen2.5-0.5B, la variante más pequeña de la familia Qwen2.5, desarrollado por BrandonHowe. Se presenta como una prueba de subida (epoch-upload-test) y no está pensado para producción. Se entrenó con técnicas de SFT (Supervised Fine-Tuning) usando TRL y Unsloth sobre una versión cuantizada a 4 bits (bnb-4bit) del modelo base. Con 0.5 mil millones de parámetros, es un modelo ligero que puede ejecutarse en GPUs de consumo, pero su propósito principal es servir como ejemplo de pipeline de fine-tuning.

La arquitectura subyacente es la de Qwen2.5, un transformer decoder-only. El repo contiene pesos en formato safetensors y ocupa 1.1 GB. No se dispone de información sobre el dataset de entrenamiento, los tokens utilizados ni la licencia final del modelo, lo que limita su uso a entornos experimentales o educativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5) |
| Parametros totales | 0.5B (modelo base Qwen2.5-0.5B) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-0.5B tiene una ventana de 32k tokens, pero no se confirma en este fine-tune) |
| Tipos de cuantizacion | No disponible (el modelo base esta cuantizado a 4 bits con bitsandbytes, pero no se listan variantes de cuantizacion del checkpoint final) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Qwen2.5, con 0.5B parametros. Se trata de un fine-tuning mediante Supervised Fine-Tuning (SFT) sobre el checkpoint `unsloth/qwen2.5-0.5b-unsloth-bnb-4bit`, que ya estaba cuantizado a 4 bits con bitsandbytes. El entrenamiento se realizo con TRL (0.22.2), Transformers 4.56.2 y PyTorch 2.11.0+cu128. No se ha publicado informacion sobre el dataset utilizado, el numero de tokens de entrenamiento ni si se aplicaron tecnicas adicionales como RLHF o DPO. No se documentan innovaciones tecnicas destacables en el proceso.

## Capacidades

- Generacion de texto basica, limitada por el tamano del modelo (0.5B).
- Razonamiento sencillo para tareas conversacionales cortas.
- Soporte multilingue no confirmado en este fine-tune, aunque el modelo base Qwen2.5 es multilingue.
- Sin soporte documentado de tool calling, function calling, agentes, vision o audio.
- No incluye modo de pensamiento extendido ni capacidades multimodales.
- Interfaz de uso via `pipeline` de transformers, tal como se muestra en la model card.

## Casos de uso

- Prototipado rapido de chatbots: al ser un modelo de 0.5B en 4 bits, permite iterar en pipelines de generacion de texto en entornos locales con recursos limitados.
- Pruebas de concepto de fine-tuning: sirve como referencia para verificar que un pipeline SFT con TRL/Unsloth funciona correctamente antes de escalar a modelos mayores.
- Educacion en IA: util para ensenar los fundamentos de los transformers y del ajuste fino en modelos pequenos.
- Experimentacion con cuantizacion: permite probar el impacto de la cuantizacion 4-bit en la calidad de las respuestas.
- Asistentes de texto simples sin requisitos de produccion: puede responder preguntas sencillas y mantener conversaciones cortas.
- Analisis de sesgos y alucinaciones en modelos pequenos: al ser un experimento, facilita estudiar los fallos tipicos de modelos de este tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 0.5B en 4 bits, la huella de memoria es muy baja; en la practica bastan 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, GTX 1650, Apple Silicon, etc.).
- Cabe en GPUs de consumo: si, incluso en dispositivos con memoria unificada como MacBooks.
- Opciones de despliegue: transformers pipeline (como en el ejemplo), vLLM, llama.cpp, Ollama, TGI.
- Latencia y throughput estimados: no disponibles, pero al ser un modelo pequeno la latencia es minima en hardware moderno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen0.5b-CPT-epoch-upload-test | 0.5B | No disponible | No disponible | HuggingFace |
| Qwen2.5-0.5B (original) | 0.5B | 32k | Apache 2.0 | HuggingFace |
| Llama 3.2 1B | 1B | 128k | Licencia de comunidad Llama | HuggingFace |

La comparacion se limita a parametros y contexto porque no hay datos de benchmarks para este fine-tune. En calidad de generacion, el modelo original Qwen2.5-0.5B es la referencia directa, pero este checkpoint no aporta mejoras documentadas.

## Limitaciones y advertencias

- Sesgos no evaluados: no hay documentacion sobre evaluacion de sesgos ni seguridad.
- Riesgo de alucinacion alto por su pequeno tamano y falta de datos de entrenamiento documentados.
- Limitaciones de contexto: el contexto original de Qwen2.5 es 32k, pero este fine-tune no documenta si lo mantiene.
- Restricciones de licencia: la licencia aparece como "no disponible" en HuggingFace, lo que impide su uso comercial sin confirmacion del autor.
- Advertencia importante: es un modelo de prueba (epoch-upload-test) sin respaldo de calidad ni soporte, y no se recomienda su uso en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/BrandonHowe/Qwen0.5b-CPT-epoch-upload-test
- Weights & Biases run: https://wandb.ai/brandon-howe006-new-jersey-institute-of-technology/midtraining/runs/cnjgr4lr
- TRL: https://github.com/huggingface/trl
