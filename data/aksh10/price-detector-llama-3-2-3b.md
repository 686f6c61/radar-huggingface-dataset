# Aksh10/price-detector-llama-3.2-3b

## Resumen

`Aksh10/price-detector-llama-3.2-3b` es un ajuste fino (fine-tune) del modelo `meta-llama/Llama-3.2-3B` de Meta, publicado por el usuario Aksh10 en Hugging Face. Segun la model card, el entrenamiento se realizo mediante SFT (supervised fine-tuning) con la libreria TRL, y el identificador interno del modelo es `price-2025-11-28_18.47.07`. El nombre del repositorio sugiere un proposito de deteccion o extraccion de precios, aunque la model card no documenta el dataset ni la tarea concreta.

El modelo hereda la arquitectura y el tamano del Llama-3.2-3B original: un transformer decoder-only de aproximadamente 3.200 millones de parametros, con una ventana de contexto de 128.000 tokens segun las especificaciones oficiales del modelo base. El repositorio ocupa 1,6 GB en formato safetensors, lo que es coherente con pesos en precision de 16 bits.

La relevancia de esta ficha es limitada: se trata de un experimento de ajuste fino con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados, sin licencia declarada de forma explicita y sin documentacion sobre los datos de entrenamiento. Resulta util como referencia de un pipeline SFT con TRL sobre Llama-3.2-3B, pero no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama-3.2-3B) |
| Parametros totales | ~3.200 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (modelo base; no confirmado tras el fine-tune) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible (el modelo base soporta oficialmente 8 idiomas, pero el fine-tune no lo declara) |
| Licencia | no disponible (la model card indica "licence: license" sin detallar; el modelo base usa Llama 3.2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-3.2-3B`, un transformer decoder-only con atencion por grupos (GQA) y RoPE, disenado por Meta para generacion de texto e instrucciones. El fine-tune no modifica la arquitectura: se trata de un ajuste supervisado (SFT) sobre los pesos del modelo base, segun declara la model card.

El entrenamiento se realizo con TRL 0.25.1, Transformers 4.57.2, PyTorch 2.9.0+cu126, Datasets 4.0.0 y Tokenizers 0.22.1. La model card enlaza un run de Weights & Biases (`ed-donner/price/runs/5qbw6oh4`), lo que sugiere un experimento formativo o de curso asociado al usuario `ed-donner`. No se documenta el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF/DPO posterior ni hiperparametros. No se declara ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base Llama-3.2-3B.
- Razonamiento basico e instrucciones en lenguaje natural (el modelo base esta alineado para chat; el fine-tune no documenta si conserva esta alineacion).
- Capacidad potencial de extraccion o clasificacion de precios, segun sugiere el nombre del repositorio, aunque no esta documentada ni validada.
- Soporte multilingue: no confirmado tras el fine-tune; el modelo base soporta oficialmente ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes.
- Tool calling / function calling: no documentado.
- Modo thinking, vision o audio: no disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas.

## Casos de uso

- Prototipado de extraccion de precios: dado el nombre del modelo, podria emplearse para probar pipelines de deteccion de precios en textos o catalogos, aunque requeriria validacion exhaustiva antes de cualquier uso real.
- Experimentacion academica con SFT: util como ejemplo de pipeline TRL sobre Llama-3.2-3B para comparar tecnicas de ajuste fino.
- Base para nuevos fine-tunes: al ser un checkpoint intermedio, puede servir como punto de partida para ajustes posteriores con datasets mas documentados.
- Generacion de texto general en ingles: si el fine-tune no ha degradado las capacidades del modelo base, podria usarse para tareas genericas de redaccion, aunque sin garantias.
- Evaluacion comparativa de checkpoints: util en entornos de investigacion para medir el impacto del SFT sobre el modelo base en tareas especificas.
- Demostraciones docentes: el enlace a Weights & Biases y el uso de TRL lo hacen adecuado como material didactico en cursos de ajuste fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 6,5 GB (3.200 M parametros x 2 bytes) mas overhead de activaciones y cache KV.
- VRAM estimada en 8 bits: aproximadamente 3,5 GB; en 4 bits: aproximadamente 2 GB (requiere cuantizacion externa, no incluida en el repo).
- GPU recomendadas: A100, H100 o L40S para inferencia en fp16 con contexto largo; RTX 4090, RTX 3090 o RTX 4080 para fp16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB o superiores, especialmente con cuantizacion.
- Opciones de despliegue: transformers (pipeline), vLLM, TGI, llama.cpp u Ollama (requiere conversion a GGUF, no incluida en el repo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Aksh10/price-detector-llama-3.2-3b | ~3.200 M | 128.000 (base) | no disponible | Hugging Face, 0 descargas |
| meta-llama/Llama-3.2-3B | ~3.200 M | 128.000 | Llama 3.2 Community License | Hugging Face, ampliamente usado |
| Qwen2.5-3B | ~3.100 M | 32.768 | Apache 2.0 | Hugging Face |
| Phi-3.5-mini | ~3.800 M | 128.000 | MIT | Hugging Face |

El modelo comparado mas directo es su propio modelo base, que ofrece garantias de licencia, documentacion y benchmarks oficiales. Frente a Qwen2.5-3B o Phi-3.5-mini, este fine-tune no aporta datos publicos de rendimiento que permitan una comparacion objetiva.

## Limitaciones y advertencias

- No se documenta el dataset de entrenamiento ni la tarea exacta, lo que impide evaluar su calidad o su sesgo.
- Riesgo elevado de alucinacion y de degradacion de capacidades respecto al modelo base, al no haber benchmarks publicados.
- Licencia no especificada de forma clara en la model card; el uso comercial queda sujeto a la licencia del modelo base (Llama 3.2 Community License), que impone restricciones adicionales.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso o validacion por parte de la comunidad.
- El modelo base esta limitado a 8 idiomas oficiales; el fine-tune no declara idiomas soportados.
- No se ofrecen pesos cuantizados ni formato GGUF, lo que dificulta el despliegue en entornos de bajos recursos sin trabajo adicional.
- El nombre del modelo sugiere una tarea especifica (deteccion de precios) que no esta validada ni documentada; no debe usarse en produccion sin evaluacion previa.
- La model card contiene referencias a rutas de otro usuario (`ed-donner/price-...`), lo que sugiere que el repositorio puede ser una copia o un experimento derivado sin documentacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Aksh10/price-detector-llama-3.2-3b
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- Repositorio TRL: https://github.com/huggingface/trl
- Run de Weights & Biases: https://wandb.ai/ed-donner/price/runs/5qbw6oh4
- Referencia del modelo citado en la model card: https://huggingface.co/ed-donner/price-2025-11-28_18.47.07
