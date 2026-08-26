# CrucibleLab/Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096-GGUF

## Resumen

Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096-GGUF es una cuantización en formato GGUF del modelo base CrucibleLab/Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096, un fine-tuning del modelo Gemma-4-31B de Google DeepMind. El autor, CrucibleLab, ha aplicado una técnica denominada "Scotoma" que, según la documentación de modelos similares, relaja el reflejo cauteloso del modelo base, produciendo salidas más variadas, directas y creativas, sin llegar a ser un modelo sin censura. Está orientado específicamente a roleplay, escritura de historias y escritura creativa.

El modelo base Gemma-4-31B es un modelo abierto de 31.000 millones de parámetros con capacidades multimodales, razonamiento y soporte para agentes, desarrollado por Google DeepMind. Este fine-tuning conserva la arquitectura subyacente pero ajusta el comportamiento para tareas de ficción y conversación inmersiva. La versión GGUF permite su ejecución en entornos con recursos limitados mediante llama.cpp, Ollama u otros motores compatibles.

La relevancia de este modelo radica en su especialización para narrativa y roleplay, un nicho donde los modelos generalistas suelen mostrar rigidez o excesiva cautela. Al combinar la base técnica de Gemma-4 con el ajuste Scotoma, ofrece una alternativa interesante para desarrolladores que buscan un generador de texto creativo de alta calidad con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Gemma-4-31B) |
| Parametros totales | 30.697.345.596 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el tag "swa-4096" sugiere sliding window attention de 4096, sin confirmar) |
| Tipos de cuantizacion | GGUF (no se especifican los niveles exactos en la informacion disponible) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Gemma-4-31B es un transformer multimodal desarrollado por Google DeepMind, basado en la investigacion de Gemini. Incluye capacidades de vision, razonamiento y soporte para agentes. El fine-tuning de CrucibleLab aplica la tecnica "Scotoma", que segun la documentacion de modelos similares (como ReadyArt/gemma-4-31B-it-scotoma) elimina una region acotada del comportamiento del modelo base, reduciendo la tendencia a responder con cautela o rigidez. Esto produce un estilo mas directo y creativo, especialmente util para roleplay y escritura de ficcion.

El tag "swa-4096" sugiere el uso de sliding window attention con una ventana de 4096 tokens, aunque no se confirma en la informacion disponible. No se detallan los datos de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas como RLHF o DPO. El modelo base Gemma-4-31B fue entrenado con un corpus extenso y diverso, pero los detalles especificos del fine-tuning no estan publicados.

## Capacidades

- Generacion de texto creativo: especializado en roleplay, narracion de historias y escritura creativa, con un estilo menos cauteloso y mas variado que el modelo base.
- Conversacion multi-turno: adecuado para mantener personajes y tramas coherentes en sesiones largas de roleplay.
- Razonamiento basico: hereda las capacidades de razonamiento del modelo base, aunque el fine-tuning prioriza la creatividad sobre la precision logica.
- Soporte de tool calling: no confirmado en la informacion disponible, aunque el modelo base lo incluye.
- Capacidades multimodales: el modelo base es multimodal (vision), pero no se indica si el fine-tuning conserva esta capacidad.
- Multilingue: no se especifican los idiomas soportados.

## Casos de uso

- Roleplay interactivo: el modelo puede gestionar conversaciones multi-turno con personajes definidos, manteniendo coherencia narrativa gracias a su ventana de contexto (si se confirma el swa-4096, permitiria sesiones de hasta 4096 tokens).
- Escritura de ficcion asistida: generacion de borradores, dialogos y descripciones para novelas, relatos o guiones, con un estilo menos formal y mas natural.
- Creacion de mundos y lore: desarrollo de trasfondos, historias y mitologias para juegos de rol o proyectos de worldbuilding.
- Generacion de dialogos para videojuegos: escritura de conversaciones para NPCs o misiones secundarias en producciones independientes.
- Prototipado de narrativa interactiva: creacion rapida de historias ramificadas para juegos de texto o aventuras conversacionales.
- Asistente de escritura creativa: apoyo a escritores para superar bloqueos, explorar alternativas de trama o generar ideas de personajes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este fine-tuning en la informacion disponible. El modelo base Gemma-4-31B ha sido evaluado en tareas de razonamiento, codigo y comprension multimodal, pero no se dispone de los numeros exactos para este modelo cuantizado. Se recomienda realizar pruebas propias en las tareas objetivo (roleplay, escritura creativa) para evaluar su rendimiento real.

## Requisitos de hardware

- VRAM estimada: para un modelo de 31B en GGUF, se estima entre 16 GB (cuantizacion Q4) y 30 GB (cuantizacion Q8) para inferencia. No se especifican los niveles de cuantizacion incluidos en el repo.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para cuantizaciones bajas, o A100/H100 (40-80 GB) para cuantizaciones altas o mayor velocidad.
- Compatibilidad con consumer GPU: si, con cuantizaciones Q4 o Q5 en GPUs de 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier motor compatible con GGUF. Tambien puede usarse con vLLM si se convierte a otro formato.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Gemma-4-31B (base) | 31B | no disponible | Apache 2.0 | Generalista, multimodal |
| Gemma-4-31B-it-scotoma (ReadyArt) | 31B | no disponible | Apache 2.0 | Roleplay, escritura creativa |
| Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096 (CrucibleLab) | 31B | no disponible (swa-4096) | Apache 2.0 | Roleplay, escritura creativa |

La comparativa se limita a modelos de la misma familia. No se dispone de datos de rendimiento para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base puede heredar sesgos presentes en sus datos de entrenamiento; el fine-tuning Scotoma no los elimina.
- Riesgo de alucinacion: al priorizar la creatividad, puede generar contenido factualmente incorrecto o inconsistente, especialmente en contextos no narrativos.
- Limitaciones de contexto: si el swa-4096 es correcto, la ventana de 4096 tokens puede ser insuficiente para historias muy largas o conversaciones extensas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base y del fine-tuning.
- Caveat de produccion: al ser un modelo especializado en roleplay, su rendimiento en tareas tecnicas o de razonamiento logico puede ser inferior al del modelo base.
- Informacion incompleta: no se han publicado detalles sobre el entrenamiento, los datos utilizados ni las cuantizaciones exactas, lo que dificulta la evaluacion rigurosa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/CrucibleLab/Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096-GGUF
- Modelo base (safetensors): https://huggingface.co/CrucibleLab/Gemma-4-31B-Loki-Scotoma-V2.0-Swa-4096
- Modelo base original de Google: https://huggingface.co/google/gemma-4-31B
- Documentacion de Gemma 4 (DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Repositorio oficial de Gemma (GitHub): https://github.com/google-deepmind/gemma
- Modelo similar con tecnica Scotoma: https://huggingface.co/ReadyArt/gemma-4-31B-it-scotoma-GGUF
