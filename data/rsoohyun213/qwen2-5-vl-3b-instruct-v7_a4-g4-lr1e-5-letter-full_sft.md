# rsoohyun213/Qwen2.5-VL-3B-Instruct-v7_A4-g4-lr1e-5-letter-full_SFT

## Resumen

Qwen2.5-VL-3B-Instruct-v7_A4-g4-lr1e-5-letter-full_SFT es un ajuste fino supervisado (SFT) del modelo multimodal Qwen2.5-VL-3B-Instruct, desarrollado por el usuario rsoohyun213 y publicado en Hugging Face. El modelo base, de Qwen (Alibaba), es un transformer multimodal de 3B parámetros que procesa imagen y texto para generar texto. Este derivado se ha entrenado con TRL sobre un dataset no especificado, aparentemente orientado a tareas de razonamiento espacial y reconocimiento de letras, a juzgar por el nombre del run de Weights & Biases (`spatial_reasoning@SFT-full`).

El interés de esta ficha es limitado desde el punto de vista de producción: se trata de un experimento de ajuste fino personal, sin model card detallada, sin licencia declarada, sin idiomas especificados y sin benchmarks publicados. El repositorio ocupa 142,7 GB, un tamaño desproporcionado para un modelo de 3B parámetros, lo que sugiere la presencia de múltiples checkpoints o artefactos de entrenamiento además de los pesos finales.

La relevancia actual es la de un caso de estudio de fine-tuning multimodal con TRL sobre Qwen2.5-VL, útil para quien quiera replicar el pipeline, pero no recomendable como modelo listo para producción sin una evaluación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2.5-VL), vision encoder + LLM decoder |
| Parametros totales | 3B (modelo base); el campo safetensors del repo indica 755.712, dato inconsistente con el base |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el base Qwen2.5-VL-3B soporta contexto largo, pero no se confirma aqui) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion GGUF/AWQ no publicada en el repo) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin concretar) |
| Formato de pesos | safetensors |
| Framework de entrenamiento | TRL 1.3.0, Transformers 4.57.6, PyTorch 2.8.0+cu128, Datasets 4.8.5, Tokenizers 0.22.2 |
| Pipeline | image-text-to-text |
| Tamano del repo | 142,7 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-VL-3B-Instruct: un transformer con un codificador visual que proyecta las imagenes a tokens de entrada para el decodificador de lenguaje, permitiendo tareas de image-text-to-text. No se dispone de detalles sobre la composicion exacta del vision encoder ni sobre la configuracion de atencion en la informacion proporcionada.

El entrenamiento consiste en un ajuste fino supervisado (SFT) completo (el sufijo `full_SFT` sugiere actualizacion de todos los pesos, no LoRA) realizado con TRL. El nombre del modelo codifica hiperparametros: `lr1e-5` (learning rate 1e-5), `g4` (probablemente acumulacion o tamano de grupo de 4), `A4` y `letter-full`. El run de Weights & Biases se denomina `spatial_reasoning@SFT-full`, lo que apunta a un dataset de razonamiento espacial con tareas de letras. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO posteriores. No se documentan innovaciones tecnicas adicionales sobre el modelo base.

## Capacidades

- Generacion de texto condicionada por imagen (image-text-to-text), heredada del base Qwen2.5-VL.
- Razonamiento espacial y tareas relacionadas con letras, segun el nombre del run de entrenamiento (`spatial_reasoning`, `letter`).
- Conversacion multi-turno en formato chat (la model card muestra un ejemplo con `pipeline` y roles `user`).
- Capacidades del modelo base que probablemente se conservan, aunque no verificadas en este derivado: comprension de documentos, OCR, grounding visual y tool calling.
- Soporte multilingue: no confirmado para este ajuste; los idiomas no estan declarados.
- Modo thinking, vision o audio adicional: no disponible.

## Casos de uso

- Prototipado de razonamiento espacial sobre imagenes: el ajuste se oriento explicitamente a tareas espaciales, por lo que puede usarse para experimentar con preguntas de posicion relativa, orientacion o disposicion de objetos en una escena.
- Reconocimiento y razonamiento sobre letras y texto en imagenes: el sufijo `letter-full` sugiere entrenamiento con tareas de identificacion de caracteres, util para validar pipelines de OCR con razonamiento.
- Investigacion de pipelines de SFT multimodal con TRL: sirve como referencia reproducible para quien quiera montar su propio fine-tuning sobre Qwen2.5-VL-3B con Transformers 4.57 y TRL 1.3.
- Evaluacion comparativa de derivados comunitarios: util para medir cuanto mejora o degrada un SFT completo respecto al base en tareas visuales concretas.
- Generacion de descripciones de imagenes en entornos de laboratorio: con 3B parametros es ligero y desplegable en una sola GPU consumer para pruebas internas.
- Base para posteriores ajustes (continued fine-tuning): al estar en safetensors y ser compatible con Transformers, puede servir de punto de partida para nuevos SFT o DPO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 6-8 GB para los pesos de 3B mas overhead de activaciones y KV cache; el vision encoder anade consumo adicional segun resolucion de imagen.
- En cuantizacion de 8 bits: en torno a 4-5 GB; en 4 bits: en torno a 3-4 GB (estimaciones para el base, no verificadas para este derivado).
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluacion a gran escala; RTX 4090, RTX 3090 o L40S suficientes para inferencia en precision completa.
- Cabe en GPU consumer: si, en RTX 4090 (24 GB), RTX 3090 (24 GB) y potencialmente en GPUs de 12-16 GB con cuantizacion.
- Opciones de despliegue: transformers (pipeline), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), vLLM si el soporte de Qwen2.5-VL esta disponible en la version usada; llama.cpp/Ollama requeririan conversion a GGUF no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (SFT de Qwen2.5-VL-3B) | 3B | no disponible | imagen + texto | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-VL-3B-Instruct (base) | 3B | contexto largo (segun Qwen) | imagen + texto | Apache 2.0 (segun Qwen) | Hugging Face, ampliamente usado |
| Qwen2.5-VL-7B-Instruct | 7B | contexto largo (segun Qwen) | imagen + texto | Apache 2.0 (segun Qwen) | Hugging Face |
| Derivados comunitarios de Qwen2.5-VL-3B | 3B | variable | imagen + texto | variable | Hugging Face |

La comparativa se limita al ecosistema Qwen2.5-VL porque no se dispone de datos de rendimiento de este derivado frente a alternativas de otros fabricantes. Frente al base, la diferencia principal es el ajuste SFT especifico; frente al 7B, la ventaja es el menor coste de inferencia a cambio de menor capacidad.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se puede asumir uso comercial permitido; el campo `licence: license` no concreta nada.
- Sin benchmarks ni evaluacion publicada: el rendimiento real frente al base es desconocido.
- Dataset de entrenamiento no documentado: no se puede evaluar sesgos ni cobertura; el nombre sugiere un dominio estrecho (razonamiento espacial, letras).
- Riesgo de olvido catastrofico: un SFT completo sobre un dataset especifico puede degradar capacidades generales del base (conversacion, codigo, multilingue).
- Inconsistencia en metadatos: el campo de parametros safetensors (755.712) no cuadra con un modelo de 3B; conviene verificar los pesos antes de usarlos.
- Tamano del repo de 142,7 GB: probablemente incluye checkpoints intermedios; descargar solo los archivos necesarios.
- Idiomas no declarados: no se garantiza soporte de castellano ni de otros idiomas.
- Sin garantias de mantenimiento: 0 descargas y 0 likes, sin historial de uso comunitario.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no mitigado ni documentado en este derivado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rsoohyun213/Qwen2.5-VL-3B-Instruct-v7_A4-g4-lr1e-5-letter-full_SFT
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Run de entrenamiento en Weights & Biases: https://forge.coreweave.com/wandb/joyhyun/spatial_reasoning%40SFT-full/runs/mb2otrl5
- Repositorio TRL: https://github.com/huggingface/trl
