# Openwist/Glaux-1.0-GGUF

## Resumen

Glaux 1.0 es un modelo de lenguaje conversacional de aproximadamente 1.170 millones de parametros (1,17 B), desarrollado por Openwist. Esta ficha corresponde concretamente a la distribucion cuantizada en formato GGUF (Q8_0) del modelo base `Openwist/Glaux-1.0`, pensada para su ejecucion en llama.cpp y Ollama. El modelo base se publico en safetensors y esta etiquetado como `conversational`, lo que situa su uso previsto en dialogos multi-turno mas que en tareas de generacion general a gran escala.

La relevancia de esta publicacion es acotada pero clara: se trata de un modelo pequeno (en el rango de 1 B de parametros) empaquetado en GGUF, lo que permite desplegarlo en hardware de consumo modesto y en entornos locales sin GPU dedicada. El repositorio GGUF ocupa 2,5 GB y contiene una unica cuantizacion documentada, Q8_0, que es la mas cercana al modelo original en precision dentro de la familia GGUF.

La informacion publicada por el autor es muy limitada: la model card del repositorio GGUF es un README breve que remite al repositorio principal para la licencia, los avisos legales y el helper de parseo de tool calls. No se han publicado detalles sobre arquitectura interna, datos de entrenamiento, idiomas soportados ni resultados de benchmarks en la informacion disponible, por lo que muchos campos de esta ficha se marcan explicitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `Openwist/Glaux-1.0`; sin detalle publicado) |
| Parametros totales | 1.170.340.608 (aprox. 1,17 B) |
| Parametros activos | no aplica (no se ha documentado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unica cuantizacion publicada en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | other (ver LICENSE y NOTICE en el repositorio del modelo base) |
| Formato de pesos | GGUF (repositorio cuantizado); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo en la documentacion disponible. El recuento de parametros (1.170.340.608) procede de los pesos en safetensors del modelo base y es coherente con un transformer denso de aproximadamente 1,17 B de parametros, pero el autor no confirma el tipo de arquitectura, el numero de capas, la dimension oculta ni el mecanismo de atencion empleado.

Tampoco hay datos sobre el corpus de entrenamiento: no se indica el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o ajuste supervisado. La model card del repositorio GGUF unicamente describe el proceso de cuantizacion a Q8_0 para llama.cpp y Ollama, y remite al repositorio principal para el resto de detalles. Cualquier afirmacion sobre innovaciones tecnicas (decodificacion especulativa, atencion lineal, etc.) seria especulativa y no se incluye.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como `conversational`, por lo que su uso previsto es el dialogo multi-turno.
- Tool calling / function calling: la model card indica que las llamadas a herramientas se devuelven como texto y que existe un helper de parseo en el repositorio principal. No se especifica el formato exacto ni la fiabilidad.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que el modelo puede servirse a traves de la infraestructura de inference endpoints de Hugging Face.
- Ejecucion local: al estar en GGUF, es compatible con llama.cpp y Ollama, lo que permite inferencia en CPU y GPU de consumo.
- Capacidades multilingues: no disponibles (no se declara lista de idiomas).
- Razonamiento avanzado, codigo, matematicas, vision o audio: no documentadas en la informacion disponible.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse con Ollama mediante el comando documentado (`ollama create` / `ollama run`) para prototipos de chatbot en una maquina personal, gracias a su tamano reducido y a la cuantizacion Q8_0.
- Pruebas de integracion de tool calling: dado que las llamadas a herramientas se devuelven como texto, resulta util para validar pipelines de agentes que necesiten parsear respuestas textuales con el helper del repositorio principal, antes de migrar a modelos mayores.
- Entornos con recursos limitados: al ocupar 2,5 GB en disco en Q8_0, encaja en equipos sin GPU dedicada o con VRAM modesta, donde modelos de mayor tamano no caben.
- Evaluacion comparativa de modelos pequenos: sirve como baseline de ~1,17 B de parametros en estudios internos de calidad conversacional frente a otros modelos del mismo rango.
- Desarrollo offline y privacidad: al ejecutarse localmente con llama.cpp, permite procesar conversaciones sin enviar datos a servicios externos, adecuado para prototipos con requisitos de confidencialidad.
- Educacion y experimentacion: su tamano y formato GGUF lo hacen manejable para aprender a cuantizar, servir y evaluar modelos en entornos docentes o de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en Q8_0: aproximadamente 1,2-1,5 GB para los pesos (1,17 B de parametros a 8 bits) mas el overhead de la cache KV y del runtime; el tamano del repositorio es de 2,5 GB, que incluye metadatos y posibles ficheros adicionales.
- GPU recomendadas: cualquier GPU con 2-4 GB de VRAM libre deberia ser suficiente para Q8_0; no se dispone de datos especificos de rendimiento en A100, H100 o RTX 4090 para este modelo.
- GPU de consumo: cabe en practicamente cualquier GPU de consumo moderna (por ejemplo, series GTX 16xx, RTX 20xx/30xx/40xx) e incluso puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp y Ollama (documentados por el autor); tambien es compatible con endpoints de Hugging Face segun la etiqueta del repositorio. No se confirma soporte de vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Glaux 1.0 (GGUF Q8_0) | ~1,17 B | no disponible | GGUF | other | Ficha actual; tool calls como texto |
| Modelos de ~1 B de la familia Llama | ~1,1-1,2 B | no disponible en esta ficha | safetensors, GGUF | licencias comunitarias propias | Referencia habitual en el rango de 1 B; sin datos comparativos publicados para Glaux |
| Modelos de ~1,5 B tipo Qwen | ~1,5 B | no disponible en esta ficha | safetensors, GGUF | licencias propias | Rango de tamano proximo; comparacion de rendimiento no disponible |

No se dispone de datos de benchmarks ni de especificaciones de contexto que permitan una comparacion cuantitativa fiable con alternativas concretas. La comparativa anterior es meramente orientativa por rango de parametros.

## Limitaciones y advertencias

- Ausencia de documentacion tecnica: no se publican arquitectura, contexto, idiomas ni datos de entrenamiento, lo que dificulta evaluar su idoneidad para produccion.
- Riesgo de alucinacion: en un modelo de ~1,17 B de parametros sin datos de alineacion publicados, la fiabilidad factual es incierta y debe validarse empiricamente.
- Tool calling no estructurado: las llamadas a herramientas se devuelven como texto, lo que exige un parser propio y anade fragilidad frente a formatos nativos estructurados.
- Licencia `other`: las condiciones exactas no estan en la model card del repositorio GGUF; es imprescindible revisar LICENSE y NOTICE del modelo base antes de cualquier uso comercial.
- Idiomas no declarados: no hay garantia de calidad en castellano ni en otros idiomas distintos del que se haya usado en el entrenamiento.
- Contexto desconocido: no se puede planificar el uso en conversaciones largas sin conocer la ventana real del modelo.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y las fechas de creacion y actualizacion son muy proximas, lo que sugiere una publicacion reciente y sin validacion comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Openwist/Glaux-1.0-GGUF
- Modelo base: https://huggingface.co/Openwist/Glaux-1.0
- Perfil del autor: https://huggingface.co/Openwist
