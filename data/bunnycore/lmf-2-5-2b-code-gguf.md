# bunnycore/LMF-2.5-2B-Code-GGUF

## Resumen

El modelo `bunnycore/LMF-2.5-2B-Code-GGUF` es una conversión a formato GGUF de un modelo de lenguaje de 2.697 millones de parámetros, aparentemente orientado a tareas de código (por su nombre "Code"). Ha sido afinado y convertido mediante la librería Unsloth, que optimiza el entrenamiento y la cuantización. El repositorio contiene un único archivo cuantizado en Q5_K_M, lo que lo hace adecuado para ejecución local con llama.cpp u otros motores compatibles con GGUF.

Aunque el nombre sugiere una relación con los Liquid Foundation Models (LFM) de Liquid AI, no se ha confirmado explícitamente en la información proporcionada. El modelo se publica sin licencia declarada, sin especificaciones de contexto ni idiomas soportados, y no se han publicado resultados de benchmarks. Su relevancia actual radica en ser una opción ligera para inferencia en entornos con recursos limitados, especialmente para tareas de generación de código, aunque la falta de documentación limita su evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 2.697.198.592 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_K_M (unico archivo disponible) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo. El nombre "LMF-2.5-2B-Code" sugiere una posible base en los Liquid Foundation Models de Liquid AI, pero no hay confirmacion en la model card. El proceso de entrenamiento se describe como un fine-tuning realizado con Unsloth, que afirma haber logrado una velocidad de entrenamiento 2x superior a los metodos convencionales. La conversion a GGUF tambien se realizo con Unsloth. No se especifican datos sobre el dataset de entrenamiento, el numero de tokens, ni el uso de tecnicas como RLHF o DPO.

## Capacidades

- Generacion de texto: el modelo es un LLM generativo, aunque no se especifican detalles sobre su calidad o especializacion.
- Orientacion a codigo: el nombre "Code" sugiere que fue afinado para tareas de programacion, pero no hay evidencia concreta en la documentacion.
- Compatibilidad con llama.cpp: al estar en formato GGUF, puede ejecutarse con llama-cli y otros motores compatibles.
- Soporte de tool calling, agentes, vision o audio: no disponible.

## Casos de uso

Dada la escasa informacion, los casos de uso son hipoteticos y deben validarse con pruebas propias:

- Generacion de codigo en entornos locales: un modelo de 2.6B cuantizado puede ejecutarse en hardware modesto, permitiendo autocompletado o generacion de fragmentos de codigo sin conexion.
- Prototipado rapido de aplicaciones de chat: su tamano reducido facilita la integracion en aplicaciones de demostracion o educativas.
- Experimentacion con cuantizacion GGUF: util para desarrolladores que quieran probar el rendimiento de modelos pequenos en diferentes hardware.
- Despliegue en dispositivos edge: su peso de ~1.9 GB lo hace candidato para ejecucion en dispositivos con poca memoria, como Raspberry Pi o moviles.
- Fine-tuning adicional: al ser un modelo abierto (aunque sin licencia clara), podria servir como base para ajustes especificos en tareas de codigo.
- Evaluacion comparativa de modelos pequenos: permite contrastar su comportamiento con otros LLMs de tamano similar en tareas de razonamiento o generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de 2.6B en Q5_K_M, el archivo pesa aproximadamente 1.9 GB. Con overhead de ejecucion, se recomienda al menos 4 GB de RAM/VRAM para inferencia fluida.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o incluso integradas con suficiente RAM compartida). Tambien puede ejecutarse solo en CPU con llama.cpp.
- Compatibilidad con consumer GPU: si, es adecuado para GPUs de gama baja y media.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier motor compatible con GGUF. Tambien se puede usar con la API de endpoints compatibles (segun los tags).
- Latencia y throughput: no se dispone de datos medidos. En CPU moderna, se espera una velocidad de unos 10-20 tokens/segundo; en GPU, puede ser significativamente mayor.

## Comparativa con modelos similares

No se dispone de datos comparativos fiables. Se ha encontrado otro modelo del mismo autor, `bunnycore/LMF-2.5-2.6B-Qwen3.8-Distilled-GGUF`, que parece ser una variante destilada de Qwen, pero no se conocen sus especificaciones. Tambien existe `LiquidAI/LFM2.5-1.2B-Instruct-GGUF` de Liquid AI, con 1.2B de parametros, pero no se dispone de benchmarks para comparar. La falta de informacion impide una comparativa rigurosa.

## Limitaciones y advertencias

- No se ha declarado licencia, lo que impide conocer las restricciones de uso comercial o modificacion.
- No hay informacion sobre sesgos, alucinaciones o limitaciones de idioma.
- El modelo es pequeno (2.6B), por lo que su capacidad de razonamiento complejo y generacion de codigo avanzado puede ser limitada en comparacion con modelos mas grandes.
- La ausencia de especificaciones de contexto impide conocer el maximo de tokens que puede manejar en una conversacion.
- No se han publicado resultados de evaluacion, por lo que su rendimiento real es desconocido.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bunnycore/LMF-2.5-2B-Code-GGUF
- Modelo relacionado del mismo autor: https://huggingface.co/bunnycore/LMF-2.5-2.6B-Qwen3.8-Distilled-GGUF
- Modelo de Liquid AI (referencia): https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-GGUF
- Pagina de modelos de Liquid AI: https://www.liquid.ai/models
- Cookbook de Liquid AI: https://github.com/Liquid4All/cookbook
