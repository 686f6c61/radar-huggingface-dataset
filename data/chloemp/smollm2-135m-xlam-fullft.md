# Chloemp/smollm2-135m-xlam-fullft

## Resumen

Este modelo es un fine-tuning completo de SmolLM2-135M, un modelo de lenguaje compacto desarrollado por Hugging Face, realizado por el usuario Chloemp. El nombre "xlam" sugiere una posible orientacion hacia el function calling, aunque la model card no documenta esta capacidad de forma explicita. Se trata de un modelo pequeno de 135 millones de parametros entrenado mediante supervisado fine-tuning (SFT) con la libreria TRL, disenado para generacion de texto conversacional en entornos con recursos limitados.

La relevancia de este modelo radica en su tamano reducido, que permite su ejecucion en dispositivos con hardware modesto, y en que parte de una base solida como SmolLM2, una familia de modelos compactos optimizados para aplicaciones on-device. Al ser un fine-tuning reciente (agosto de 2026), representa un ejemplo de adaptacion de modelos pequenos a tareas conversacionales especificas, aunque la documentacion publica es escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de SmolLM2-135M) |
| Parametros totales | 134.515.008 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de SmolLM2-135M, un transformer decoder-only de 135 millones de parametros perteneciente a la familia SmolLM2 de Hugging Face, una coleccion de modelos compactos optimizados para ejecucion en dispositivos. El entrenamiento se realizo mediante SFT (supervised fine-tuning) utilizando la libreria TRL de Hugging Face, con las versiones TRL 1.10.0, Transformers 5.15.0, PyTorch 2.13.0, Datasets 5.0.1 y Tokenizers 0.22.2.

No se proporcionan detalles sobre el dataset de entrenamiento, el numero de tokens utilizados ni la composicion de los datos. El repositorio tiene un tamano de 3,2 GB, inusualmente grande para un modelo de 135M de parametros, lo que sugiere que puede incluir checkpoints de entrenamiento u otros artefactos adicionales ademas de los pesos finales.

## Capacidades

- Generacion de texto conversacional en formato chat, segun el ejemplo de la model card que muestra una pregunta de opinion con respuesta generada.
- Modelo compacto apto para inferencia en dispositivos con recursos limitados, gracias a su tamano de 135M de parametros.
- El nombre "xlam" sugiere posible soporte de function calling o tool use, aunque esta capacidad no esta documentada en la model card y no puede confirmarse.
- Compatible con la libreria transformers de Hugging Face mediante la API de pipeline.
- Capacidad de continuar el entrenamiento para tareas especificas, al ser un modelo de tamano reducido.

## Casos de uso

- Chat conversacional en dispositivos edge: el modelo puede ejecutarse en hardware modesto como Raspberry Pi o smartphones de gama baja gracias a sus 135M de parametros, permitiendo asistentes conversacionales locales sin conexion.
- Prototipado rapido de aplicaciones de IA generativa: su tamano reducido y su integracion con transformers permiten iterar rapidamente en el desarrollo de demos y pruebas de concepto sin necesidad de infraestructura costosa.
- Asistente local sin conexion: al poder ejecutarse en CPU, es adecuado para entornos donde la privacidad o la falta de conectividad impiden el uso de APIs en la nube.
- Generacion de respuestas cortas en aplicaciones moviles: el modelo puede integrarse en apps nativas para generar sugerencias, respuestas automaticas o resumenes breves con latencia aceptable.
- Fine-tuning adicional para tareas especificas: al ser un modelo pequeno, puede adaptarse con recursos limitados a dominios concretos como atencion al cliente, soporte tecnico o generacion de contenido especializado.
- Educacion y aprendizaje de LLMs: su tamano lo hace ideal para estudiar el proceso de fine-tuning, experimentar con tecnicas de SFT y comprender el comportamiento de modelos generativos en entornos academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 540 MB en fp32, 270 MB en fp16 y unos 70 MB en cuantizacion de 4 bits, calculados a partir del numero de parametros (134,5M).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM, incluyendo RTX 3060, RTX 4060, GTX 1660 o incluso integradas modernas.
- El modelo cabe en GPUs consumer de gama baja y puede ejecutarse tambien en CPU con rendimiento aceptable para inferencia.
- Opciones de despliegue: transformers (pipeline), vLLM, llama.cpp, Ollama y TGI, aunque la compatibilidad con formatos GGUF no esta confirmada en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada, aunque por el tamano del modelo se espera una generacion rapida incluso en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Chloemp/smollm2-135m-xlam-fullft | 135M | no disponible | no disponible | HuggingFace |
| SmolLM2-135M (base) | 135M | no disponible | Apache 2.0 | HuggingFace |
| SmolLM2-360M | 360M | no disponible | Apache 2.0 | HuggingFace |
| SmolLM2-1.7B | 1,7B | no disponible | Apache 2.0 | HuggingFace |

La comparativa se limita a la familia SmolLM2, ya que no se dispone de informacion sobre otros modelos comparables en la documentacion proporcionada. El modelo base SmolLM2-135M tiene licencia Apache 2.0, pero este fine-tuning especifico no especifica una licencia clara, lo que supone una diferencia importante para uso comercial.

## Limitaciones y advertencias

- Licencia no especificada: la model card indica "licence: license", que no es un identificador de licencia valido. Esto genera incertidumbre legal para cualquier uso comercial o redistribucion.
- Documentacion escasa: no se publican detalles sobre el dataset de entrenamiento, lo que impide evaluar posibles sesgos o la calidad de los datos utilizados.
- Riesgo de alucinacion: al ser un modelo de solo 135M de parametros, su capacidad de razonamiento y de generar informacion factualmente correcta es limitada, con un riesgo elevado de alucinaciones en temas complejos.
- Capacidades no confirmadas: el nombre "xlam" sugiere function calling, pero esta capacidad no esta documentada y no debe asumirse sin verificacion.
- Limitaciones de idioma: no se especifican los idiomas soportados, aunque el ejemplo de la model card esta en ingles.
- Contexto limitado: al derivar de SmolLM2-135M, es probable que la ventana de contexto sea reducida, aunque este dato no se proporciona explicitamente.
- Tamano del repositorio: 3,2 GB para un modelo de 135M de parametros es inusualmente grande, lo que puede indicar artefactos de entrenamiento incluidos y dificultar la descarga en entornos con ancho de banda limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Chloemp/smollm2-135m-xlam-fullft
- Modelo base SmolLM2-135M: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Coleccion SmolLM2: https://huggingface.co/collections/HuggingFaceTB/smollm2
- Repositorio GitHub de SmolLM: https://github.com/huggingface/smollm
- Tutorial de despliegue local de SmolLM2-135M: https://aiindigo.com/tutorials/getting-started-with-smollm2-135m-local-ai-on-consumer-hardware
- Guia de SmolLM2 en local-llm.net: https://www.local-llm.net/models/smollm2/
