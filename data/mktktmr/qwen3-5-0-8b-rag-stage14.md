# mktktmr/qwen3.5-0.8b-rag-stage14

## Resumen

mktktmr/qwen3.5-0.8b-rag-stage14 es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario mktktmr en Hugging Face. Se trata de un modelo derivado de la familia Qwen3.5, orientado a tareas de generacion aumentada por recuperacion (RAG) en japones, segun se desprende de los conjuntos de datos empleados en su entrenamiento (JEMHopQA, NIILC QA, JSQuAD/JGLUE y fragmentos de Wikipedia en japones).

El modelo cuenta con 852.985.920 parametros (aproximadamente 0,85 mil millones), almacenados en formato safetensors, con un tamano de repositorio de 1,7 GB. El autor indica que se ha realizado un ajuste mediante LoRA sobre el modelo base y posteriormente se han fusionado los pesos en el modelo principal. La model card esta redactada en japones y describe esta version como "段階 14" (etapa 14) de un proceso iterativo de entrenamiento, en el que se han duplicado los ejemplos de JEMHopQA respecto a la etapa 12.

La relevancia de este modelo es limitada y muy especifica: se trata de un experimento de ajuste fino de caracter comunitario, sin descargas ni interacciones registradas en el momento de la consulta, y sin resultados de benchmarks publicados. Su interes principal radica en el uso de datos japoneses de control de calidad para tareas de respuesta a preguntas sobre documentos, pero no debe considerarse un modelo de proposito general validado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5; detalles no disponibles) |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplica (no es MoE, segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (los datos de entrenamiento son predominantemente en japones) |
| Licencia | No disponible (el modelo base Qwen/Qwen3.5-0.8B se distribuye bajo Apache-2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen/Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0,85 mil millones de parametros. Segun la model card, el autor aplico un ajuste mediante LoRA y posteriormente fusiono los pesos adaptados en el modelo principal, de modo que el resultado es un checkpoint denso estandar, no un adaptador separado. No se especifican detalles sobre la arquitectura interna (numero de capas, dimensiones ocultas, mecanismo de atencion) ni sobre el contexto maximo soportado.

En cuanto a los datos de entrenamiento, la model card enumera cuatro fuentes, todas en japones y con licencia CC BY-SA 4.0: JEMHopQA (preguntas multi-hop), NIILC QA (preguntas y respuestas), JSQuAD/JGLUE (comprension lectora) y un conjunto de fragmentos derivados de Wikipedia en japones. El autor indica que en esta etapa 14 se han incluido los ejemplos de JEMHopQA dos veces respecto a la etapa 12. No se proporciona informacion sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset, hiperparametros, ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y respuesta a preguntas en japones, con enfasis en tareas de comprension lectora y preguntas multi-hop.
- Respuesta a preguntas sobre documentos recuperados (RAG), dado el uso de fragmentos de Wikipedia y conjuntos de QA en el entrenamiento.
- Razonamiento multi-hop basico, segun la inclusion de JEMHopQA.
- Capacidades multilingues: no documentadas; los datos de entrenamiento son casi exclusivamente japoneses.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Respuesta a preguntas sobre documentacion tecnica en japones: el modelo puede recibir fragmentos recuperados de un corpus y generar respuestas extractivas o abstractivas, gracias a su ajuste sobre JSQuAD y NIILC QA.
- Sistemas RAG de atencion al cliente en japones: integrado en un pipeline de recuperacion (por ejemplo, con un indice vectorial sobre manuales o FAQ), el modelo genera respuestas a partir de los pasajes recuperados.
- Preguntas multi-hop sobre bases de conocimiento: el entrenamiento con JEMHopQA lo hace adecuado para consultas que requieren combinar informacion de varios documentos, como preguntas sobre entidades y relaciones.
- Prototipado rapido en entornos con recursos limitados: con menos de mil millones de parametros, puede ejecutarse en GPU de consumo y en CPU para pruebas de concepto.
- Extraccion de respuestas en pipelines de procesamiento documental: puede usarse para localizar y sintetizar respuestas a partir de contratos, informes o articulos en japones.
- Experimentacion academica en ajuste fino de modelos pequenos: sirve como referencia para estudiar el efecto de la duplicacion de datos de QA multi-hop en el rendimiento.
- Evaluacion comparativa de tecnicas de RAG en japones: al estar entrenado con corpus japoneses conocidos, puede emplearse como linea base en experimentos de recuperacion y generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,7 GB de pesos, mas overhead de activaciones y cache KV; en la practica, entre 3 y 4 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: en torno a 1 GB de pesos; en 4 bits, aproximadamente 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 (por ejemplo, RTX 3050, RTX 4060, T4). Para mayor throughput, A10G, L4 o A100.
- Cabe en GPU de consumo: si, en modelos como RTX 3060, RTX 4060, RTX 4090 y similares; tambien puede ejecutarse en CPU con llama.cpp u Ollama.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (previa conversion a formatos compatibles), TGI y transformers con PyTorch.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| mktktmr/qwen3.5-0.8b-rag-stage14 | 852.985.920 | No disponible | No disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 mil millones | No disponible | Apache-2.0 | Hugging Face |
| Modelos de QA en japones de tamano similar | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de su calidad frente al modelo base ni frente a alternativas.
- Sesgos conocidos: no documentados; al entrenarse con Wikipedia y corpus japoneses, puede heredar sesgos de esas fuentes.
- Riesgo de alucinacion: elevado en un modelo de este tamano, especialmente en tareas de QA sobre documentos; se recomienda validacion de las respuestas.
- Limitaciones de idioma: el entrenamiento es casi exclusivamente en japones; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- Restricciones de licencia: la licencia del modelo derivado no esta declarada. El modelo base es Apache-2.0, pero los datos de entrenamiento son CC BY-SA 4.0, lo que puede imponer obligaciones de atribucion y compartir igual en usos derivados. Es necesario verificar la compatibilidad antes de un uso comercial.
- Caveat para produccion: modelo experimental de un autor individual, sin descargas ni validacion de la comunidad; no recomendado para despliegues en produccion sin una evaluacion propia exhaustiva.
- Contexto maximo desconocido: no se puede garantizar el comportamiento en ventanas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mktktmr/qwen3.5-0.8b-rag-stage14
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- NIILC QA: https://github.com/mynlp/niilc-qa
- JGLUE (JSQuAD): https://github.com/yahoojapan/JGLUE
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
