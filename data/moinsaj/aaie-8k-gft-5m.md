# moinsaj/aaie-8k-gft-5m

## Resumen

El modelo `moinsaj/aaie-8k-gft-5m` es un checkpoint de investigacion del proyecto AAIE, desarrollado por el usuario moinsaj. Se trata de un modelo denso de 354 millones de parametros con arquitectura compatible con Llama, que ha sido ajustado mediante instrucciones generales sobre un total de 5 millones de tokens. El modelo parte de una base denominada `AAIE 50M YaRN 8K` y se somete a un ajuste fino de tipo "general instruction tuning" sobre datos de SmolTalk V2, seleccionando este checkpoint en concreto tras un entrenamiento acotado.

El objetivo del proyecto es explorar como se comporta un modelo pequeno tras un ajuste fino con un volumen limitado de tokens de instrucciones, asi como estudiar la extension de contexto mediante la tecnica YaRN, que amplia la ventana original de 1.024 tokens hasta 8.192. Su relevancia radica en que sirve como punto de referencia para investigar el efecto del fine-tuning con pocos datos y la extrapolacion posicional en modelos de tamano reducido, aunque el propio autor advierte de que no ha demostrado una fiabilidad suficiente para su uso aplicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-compatible dense decoder (transformers) |
| Parametros totales | 354.374.144 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens (extension YaRN, factor 8, posicion original 1.024) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un decoder denso compatible con Llama, con 20 capas, tamaño de hidden size de 512, ocho cabezas de atencion y dos cabezas KV, con embeddings atados. El vocabulario del tokenizador contiene 151.936 tokens. La configuracion de generacion incluye los tokens de fin `<|im_end|>` (151645) y `<|endoftext|>` (151643) como criterios de parada.

El entrenamiento se realizo mediante ajuste fino de pesos completos con mascara de completado sobre un conjunto de instrucciones generales. El checkpoint fue seleccionado tras un calendario acotado de 5 millones de tokens, con una tasa de aprendizaje de `1e-4`. La extension de contexto se logro aplicando YaRN con factor 8 sobre la longitud posicional original de 1.024 tokens, alcanzando los 8.192 tokens. No se mencionan tecnicas adicionales como RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de texto en ingles siguiendo instrucciones mediante el formato de chat de Transformers (`apply_chat_template`).
- Soporte de conversaciones multi-turno basicas, gracias a la ventana de contexto de 8.192 tokens.
- Configuracion de parada de generacion corregida, con dos tokens de fin configurados para detener la generacion.
- No se han documentado capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion en fine-tuning de instrucciones: el modelo puede utilizarse como base para comparar el efecto de distintos volumenes de datos de instrucciones en modelos pequenos, dado que fue entrenado con un calendario acotado de 5 millones de tokens.
- Prototipado de asistentes conversacionales en ingles: gracias a su reducido numero de parametros, permite experimentar con pipelines de chat de bajo coste en entornos de desarrollo.
- Estudio de la extension de contexto con YaRN: al ser un modelo pequeno con una ventana ampliada experimentalmente, resulta util para analizar el comportamiento de la extrapolacion posicional en arquitecturas densas.
- Docencia en procesamiento del lenguaje natural: el modelo es adecuado para demostrar el flujo completo de Transformers (tokenizacion, generacion, chat template) en hardware limitado.
- Pruebas de comportamiento de parada: la configuracion corregida de tokens de fin permite investigar criterios de finalizacion en modelos de generacion.
- Evaluacion de riesgos de alucinacion en modelos pequenos: puede emplearse como caso de estudio para analizar la relacion entre tamano del modelo y fiabilidad de las respuestas, aunque sin garantias de correccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona una "evaluacion acotada" en la model card, pero no se proporcionan datos numericos de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB en precision FP16, teniendo en cuenta los 354 millones de parametros y el overhead de la inferencia.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM, como una RTX 3060, GTX 1660 o similar. Tambien puede ejecutarse en CPU.
- Compatibilidad con GPU consumer: si, el modelo es lo suficientemente pequeno para ejecutarse en GPUs de gama baja.
- Opciones de despliegue: Transformers (Hugging Face) es la via principal. Es posible convertir los pesos a formato GGUF para usar con llama.cpp u Ollama, aunque no esta documentado oficialmente.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa rigurosa con otras alternativas. Existe un modelo relacionado del mismo autor, `moinsaj/aaie-ddense-gft-yarn2-fg-lora`, que parece pertenecer a la misma familia de investigacion, pero no se han publicado especificaciones tecnicas ni resultados de benchmarks que permitan una comparacion directa. Por tanto, la comparativa se indica como no disponible.

## Limitaciones y advertencias

- Checkpoint de investigacion revisado por IA, no validado por educadores humanos.
- No demostro una correccion fiable de instrucciones, extraccion de informacion ni feedback a nivel de criterio en la evaluacion acotada.
- La extension de contexto a 8.192 tokens mediante YaRN es experimental y no debe interpretarse como evidencia de razonamiento fiable en contextos largos.
- La licencia no esta especificada, por lo que el uso comercial queda sin aclarar.
- Riesgo de alucinacion presente, especialmente al tratarse de un modelo pequeno con un entrenamiento limitado.
- Soporte exclusivo del idioma ingles; no se documentan capacidades multilingues.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moinsaj/aaie-8k-gft-5m
- Modelo relacionado del mismo autor: https://huggingface.co/moinsaj/aaie-ddense-gft-yarn2-fg-lora
- Perfil del autor en Hugging Face: https://huggingface.co/moinsaj
