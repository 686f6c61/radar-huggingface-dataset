# Mwanzau/Mazgu_Small-T_130M-Tumbuka-FineTuned

## Resumen

Mazgu_Small-T_130M-Tumbuka-FineTuned es un modelo de lenguaje pequeno de 130 millones de parametros, desarrollado por Mwanzau, que parte del modelo preentrenado Mazgu_Small-T_130M de SaintsStudios y lo ajusta para el idioma tumbuka, una lengua bantu hablada principalmente en Malawi. El modelo esta disenado para tareas de generacion de texto en este idioma de bajos recursos, lo que lo convierte en una opcion interesante para aplicaciones locales y educativas donde los modelos comerciales no cubren bien esta lengua.

La arquitectura es un transformer decoder-only de estilo Llama, con pesos en formato safetensors y compatible con la libreria transformers. El contexto y las cuantizaciones no estan especificados en la ficha de HuggingFace. Al tratarse de un modelo muy pequeno, su principal valor reside en la facilidad de despliegue en entornos con pocos recursos, como CPUs o dispositivos de borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de estilo Llama |
| Parametros totales | 130 M |
| Parametros activos | no disponible (el modelo no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Tumbuka (idioma bantu de Malawi); la ficha de HuggingFace no lista idiomas, pero el modelo esta disenado para este idioma segun el nombre y las descripciones del modelo base |
| Licencia | no disponible en la ficha de HuggingFace; el modelo base SaintsStudios/Mazgu_Small-T_130M tiene licencia Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo Mazgu_Small-T_130M-Tumbuka-FineTuned es un fine-tuning de un transformer decoder-only de estilo Llama con 130 millones de parametros. Segun la informacion del modelo base publicada por SaintsStudios, este se preentreno desde cero sobre datos en tumbuka, y el fine-tuning de Mwanzau aplica un ajuste adicional, probablemente mediante el trainer de HuggingFace, como indica la etiqueta "Generated from Trainer" en los archivos relacionados.

No se han encontrado detalles tecnicos sobre el numero de tokens de entrenamiento, la composicion del dataset ni la utilizacion de tecnicas como RLHF o DPO. El modelo no presenta innovaciones arquitectonicas destacadas: se trata de una arquitectura Llama estandar, conocida por su eficiencia y facilidad de despliegue en modelos de tamano reducido.

## Capacidades

- Generacion de texto en tumbuka, incluyendo respuestas y completado de texto basico.
- Soporte de la pipeline de HuggingFace `text-generation` para inferencia estandar.
- Compatible con `text-generation-inference` y `endpoints_compatible`, lo que permite integracion en servicios de inferencia como FriendliAI.
- No hay informacion disponible sobre soporte de tool calling, function calling, modo de razonamiento, vision o audio.
- Al ser un modelo de 130 M, su rendimiento en tareas complejas de razonamiento o codigo es limitado y no se encuentra documentado.

## Casos de uso

- Asistente de chat en tumbuka: puede integrarse en aplicaciones de mensajeria o servicios de atencion al cliente para responder preguntas sencillas en este idioma, gracias a su tamano reducido y a la facilidad de ejecucion en CPU.
- Traduccion asistida de textos en tumbuka: puede usarse como componente de un sistema de traduccion automatica, generando borradores que un corrector humano revise despues.
- Educacion y preservacion linguistica: permite crear herramientas didacticas o de consulta para hablantes de tumbuka, especialmente en entornos con acceso limitado a hardware potente.
- Generacion de contenido local: aplicaciones de redaccion de anuncios, noticias o documentos administrativos en tumbuka con recursos computacionales minimos.
- Prototipado de NLP para idiomas de bajos recursos: sirve como modelo de referencia para experimentar con fine-tuning en lenguas minoritarias sin necesidad de infraestructura avanzada.
- Despliegue en dispositivos de borde: puede ejecutarse en placas como Raspberry Pi o en moviles gracias a su tamano, permitiendo inferencia en lugares sin conexion a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni cualquier otra evaluacion estandar que permita comparar este modelo con alternativas similares.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 260 MB en precision FP16, aproximadamente 130 MB en 8 bits y cerca de 65 MB en 4 bits, aunque el modelo no especifica cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU de gama baja, incluso cards de consumo con 2-4 GB de VRAM, gracias al pequeno tamano del modelo.
- Compatibilidad con CPU: el modelo se puede ejecutar en CPU sin problemas, e incluso en dispositivos embebidos con bajo consumo, lo que lo hace adecuado para entornos sin aceleracion GPU.
- Opciones de despliegue: HuggingFace transformers, text-generation-inference, FriendliAI, y potencialmente llama.cpp u Ollama tras convertir los pesos a GGUF.
- Latencia y throughput: al no haber datos publicados, no es posible estimar cifras concretas de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Mazgu_Small-T_130M-Tumbuka-FineTuned | 130 M | no disponible | no disponible (base Apache 2.0) | HuggingFace |
| SaintsStudios/Mazgu_Small-T_130M_Instruct | 130 M | no disponible | Apache 2.0 | HuggingFace, FriendliAI |
| TinyLlama-1.1B (referencia generica) | 1.1 B | 2048 | Apache 2.0 | HuggingFace |

La comparacion directa se limita al modelo base de SaintsStudios, que es la version preentrenada sobre tumbuka sin el ajuste fino adicional de Mwanzau. Frente a modelos como TinyLlama, la diferencia principal es el idioma objetivo, ya que este modelo esta especializado en tumbuka y no en ingles.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al tratarse de un modelo pequeno y con datos de entrenamiento limitados, es probable que presente errores factuales y un vocabulario restringido en tumbuka.
- Alcance del idioma: el modelo esta disenado unicamente para tumbuka; su rendimiento en otros idiomas no es fiable.
- Contexto limitado: no se ha confirmado la longitud de contexto, pero en modelos de 130 M suele ser muy corta, lo que impide tareas de razonamiento con dependencias largas.
- Licencia: la ficha de HuggingFace no especifica la licencia del fine-tuning, lo que genera incertidumbre sobre su uso comercial. Aunque el modelo base es Apache 2.0, es recomendable confirmar con el autor.
- Documentacion insuficiente: no hay informacion sobre el proceso de entrenamiento, los datos utilizados ni los resultados de evaluacion, lo que dificulta validar su calidad para produccion.
- Sin soporte de capacidades avanzadas: no se ha demostrado tool calling ni razonamiento multi-paso, por lo que no es adecuado para sistemas agente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mwanzau/Mazgu_Small-T_130M-Tumbuka-FineTuned
- Modelo base en HuggingFace: https://huggingface.co/SaintsStudios/Mazgu_Small-T_130M_Instruct
- Pagina de inferencia en FriendliAI: https://friendli.ai/models/SaintsStudios/Mazgu_Small-T_130M
