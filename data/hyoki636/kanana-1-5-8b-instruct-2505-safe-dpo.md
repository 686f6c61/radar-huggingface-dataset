# hyoki636/kanana-1.5-8b-instruct-2505-Safe-DPO

## Resumen

Kanana 1.5-8B-Instruct-2505-Safe-DPO es una variante afinada del modelo Kanana 1.5-8B-Instruct-2505 desarrollado originalmente por Kakao Corp. Esta versión concreta, publicada por el usuario hyoki636 en HuggingFace, incorpora un ajuste adicional mediante DPO (Direct Preference Optimization) orientado a la seguridad de las respuestas. El modelo base pertenece a la familia Kanana, que destaca por sus mejoras sustanciales en generación de código, razonamiento matemático y llamada a funciones respecto a su predecesor.

El modelo cuenta con aproximadamente 8.030 millones de parámetros y está diseñado como un modelo de lenguaje bilingüe, con soporte principal para coreano e inglés. Su ventana de contexto nativa es de 32.000 tokens, extensible hasta 128.000 tokens según la documentación del modelo original. Aunque la model card de esta variante concreta no proporciona detalles técnicos adicionales, el tag de arquitectura "llama" indica que se basa en la arquitectura transformer de Llama. La relevancia de este modelo radica en su potencial para aplicaciones de conversación y asistencia que requieran respuestas seguras y controladas, aunque su adopción es actualmente nula (cero descargas) y su mantenimiento es incierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Llama) |
| Parametros totales | 8.030.285.824 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.000 tokens (extensible a 128.000 segun el modelo base) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano e ingles (segun el modelo base de Kakao) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de un transformer denso de 8.000 millones de parametros, siguiendo el diseno de Llama con atencion por ventanas y normalizacion RMSNorm. El modelo base Kanana 1.5-8B-Instruct-2505 fue entrenado por Kakao Corp con un enfoque bilingue (coreano e ingles) y posteriormente ajustado mediante instrucciones para tareas de codigo, matematicas y function calling. La variante "Safe-DPO" anade una fase de alineacion adicional mediante DPO, cuyo objetivo es reducir respuestas daninas o sesgadas, aunque no se han publicado los detalles del dataset de preferencias utilizado ni los hiperparametros del entrenamiento.

Los datos de entrenamiento del modelo base no estan especificados en la informacion disponible, pero se sabe que la familia Kanana prioriza la eficiencia computacional y el rendimiento en tareas de razonamiento. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas como RLHF ademas del DPO mencionado en el nombre del modelo.

## Capacidades

- Generacion de texto conversacional en coreano e ingles con soporte de contexto largo (hasta 128.000 tokens con extension).
- Razonamiento matematico y resolucion de problemas numericos, segun las mejoras declaradas en la version 1.5 del modelo base.
- Generacion de codigo en multiples lenguajes de programacion, con capacidades mejoradas respecto a la version anterior de Kanana.
- Function calling / tool calling, lo que permite integrar el modelo en pipelines que requieran invocacion de APIs o herramientas externas.
- Capacidad de seguir instrucciones complejas en formato conversacional multi-turno.
- El ajuste DPO anade una capa de seguridad que busca mitigar respuestas ofensivas o peligrosas, aunque el alcance real de esta mitigacion no esta documentado.

## Casos de uso

- Asistente de programacion en entornos de desarrollo: el modelo puede generar fragmentos de codigo, explicar algoritmos y depurar errores gracias a su entrenamiento en tareas de codigo, integrandose en IDEs mediante plugins o APIs.
- Atencion al cliente bilingue (coreano-ingles): su ventana de contexto de 32.000 tokens permite mantener conversaciones multi-turno extensas sin perder el hilo, y el ajuste DPO reduce el riesgo de respuestas inapropiadas en entornos de produccion.
- Automatizacion de tareas de back-office mediante function calling: puede invocar APIs de calendario, correo o bases de datos para ejecutar acciones como crear citas o consultar registros, siempre que se le proporcione un esquema de herramientas.
- Tutor de matematicas y ciencias: su capacidad de razonamiento matematico permite resolver problemas paso a paso y explicar conceptos, util en plataformas educativas.
- Generacion de documentacion tecnica: puede redactar manuales, guias y comentarios de codigo en coreano e ingles, aprovechando su formacion bilingue.
- Prototipado rapido de chatbots con restricciones de seguridad: el ajuste DPO lo hace adecuado para demos y PoCs donde se requiera un comportamiento conservador, aunque su falta de adopcion y mantenimiento limita su uso en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta variante no incluye metricas de evaluacion, y la documentacion del modelo base de Kakao no ha sido proporcionada en los resultados de busqueda. Se recomienda consultar la pagina del modelo original (kakaocorp/kanana-1.5-8b-instruct-2505) para obtener datos de MMLU, HumanEval o GSM8K si estan disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8.030 millones de parametros en precision fp16, se necesitan aproximadamente 16 GB de VRAM para cargar el modelo completo. Con cuantizacion de 4 bits (si estuviera disponible) se podria reducir a unos 5-6 GB.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o A100 (40 GB) son suficientes para inferencia en fp16. En consumer GPUs de 16 GB como la RTX 4080 o 4070 Ti Super, el modelo cabe con cuantizacion de 8 bits.
- En GPUs de gama media (8-12 GB) solo seria viable con cuantizacion de 4 bits, si el modelo se convierte a formatos GGUF o AWQ.
- Opciones de despliegue: al ser un modelo transformers estandar, se puede servir con vLLM, TGI (Text Generation Inference) o llama.cpp tras convertir los pesos. Tambien es compatible con Ollama si se genera un Modelfile.
- Latencia y throughput: no se dispone de datos medidos para esta variante concreta. Como referencia, un modelo denso de 8B en una A100 suele generar entre 50 y 100 tokens por segundo con vLLM, pero estos valores dependen de la implementacion y la cuantizacion.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar esta variante concreta con otros modelos. A continuacion se presenta una comparacion estructural con alternativas de tamano similar, basada en la informacion publica de los modelos base:

| Modelo | Parametros | Contexto | Idiomas | Licencia |
|---|---|---|---|---|
| Kanana 1.5-8B-Instruct-2505 (base) | 8B | 32K (ext. 128K) | Coreano, ingles | No especificada |
| Llama 3.1 8B Instruct | 8B | 128K | Multilingue (principalmente ingles) | Llama 3.1 Community License |
| Qwen 2.5 7B Instruct | 7.6B | 128K | Multilingue (incluye chino) | Apache 2.0 |
| Mistral 7B Instruct v0.3 | 7.3B | 32K | Multilingue (principalmente ingles) | Apache 2.0 |

La variante Safe-DPO se diferencia del modelo base de Kakao por el ajuste adicional de seguridad, pero no se puede cuantificar el impacto de este ajuste en el rendimiento sin datos de evaluacion. Para uso comercial, la ausencia de licencia explicita es un riesgo significativo en comparacion con alternativas como Qwen 2.5 o Mistral, que tienen licencias permisivas.

## Limitaciones y advertencias

- La licencia no esta especificada en la model card, lo que impide determinar si es legal su uso comercial. Se recomienda contactar al autor o al propietario del modelo base antes de cualquier despliegue en produccion.
- La model card esta completamente vacia de informacion tecnica: no hay detalles sobre el dataset de entrenamiento, los hiperparametros del DPO ni la metodologia de evaluacion.
- El modelo tiene cero descargas y cero likes en HuggingFace, lo que sugiere que no ha sido validado por la comunidad y puede contener errores o comportamientos imprevistos.
- No se dispone de datos sobre sesgos o alucinaciones especificos de esta variante. El ajuste DPO puede reducir ciertos comportamientos indeseados, pero tambien puede introducir sesgos de sobrecorreccion.
- El soporte de idiomas se limita presumiblemente a coreano e ingles; su rendimiento en espanol u otros idiomas no esta documentado y probablemente sea deficiente.
- El repositorio fue creado en agosto de 2026 y no ha recibido actualizaciones desde entonces, lo que indica falta de mantenimiento activo.
- No hay garantia de que el modelo funcione correctamente con las extensiones de contexto de 128K, ya que esa capacidad corresponde al modelo base y el afinamiento DPO podria haberla degradado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hyoki636/kanana-1.5-8b-instruct-2505-Safe-DPO
- Modelo base original de Kakao: https://huggingface.co/kakaocorp/kanana-1.5-8b-instruct-2505
- Repositorio GitHub de Kanana: https://github.com/kakao/kanana
- Variante Persona-Merged del mismo autor: https://huggingface.co/hyoki636/kanana-1.5-8b-instruct-2505-Persona-Merged
- Ficha del modelo en AIBase: https://model.aibase.com/models/details/1927649989316841472
