# 1lock/zils-lite-r60-526b

## Resumen

zils-lite-r60-526b es un ajuste fino (fine-tune) del modelo qhoenix/zils-lite-decision-v9, publicado por el usuario 1lock en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de aproximadamente 853 millones de parametros (852.985.920 segun los pesos en safetensors), distribuido en formato transformers con pesos safetensors y un repositorio de 1,7 GB. Por su nomenclatura y su modelo base ("decision"), parece orientado a tareas de toma de decision o clasificacion generativa, aunque la model card no detalla la tarea concreta.

La informacion publicada es extremadamente escasa: la model card se limita a declarar la licencia, el modelo base y una nota de que es un derivado modificado distribuido bajo la licencia upstream. No se especifican idiomas, pipeline, datos de entrenamiento, contexto ni resultados de evaluacion. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicacion reciente y practicamente sin adopcion.

Por su tamano (sub-1B), es relevante para experimentacion en hardware consumer y para tareas de inferencia de baja latencia, pero la ausencia de documentacion tecnica obliga a tratar cualquier uso en produccion con cautela y a validar el comportamiento empiricamente antes de desplegarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de qhoenix/zils-lite-decision-v9; probablemente transformer decoder-only, sin confirmar) |
| Parametros totales | 852.985.920 |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos originales en safetensors; cuantizacion GGUF/INT8 no publicada por el autor) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. Al ser un fine-tune de qhoenix/zils-lite-decision-v9, hereda la arquitectura y el tokenizador del modelo base, pero la model card de este derivado no detalla ni el tipo de transformer, ni el numero de capas, ni las dimensiones de atencion. El nombre "lite" sugiere una variante compacta y "decision" apunta a un modelo especializado en tareas de decision, aunque no se confirma en la documentacion.

Tampoco se publican datos sobre el proceso de entrenamiento: no hay informacion sobre el numero de tokens, la composicion del dataset de ajuste fino, el uso de RLHF/DPO, ni sobre posibles innovaciones tecnicas (atencion lineal, decodificacion especulativa, modo thinking). La unica nota tecnica es que se trata de un "derivado modificado" del modelo base, distribuido bajo la licencia upstream (Apache 2.0).

## Capacidades

- Generacion de texto: capacidad esperada por herencia del modelo base, sin confirmar en la documentacion.
- Toma de decision / tareas de clasificacion generativa: sugerido por el nombre del modelo base ("decision"), sin detalles publicados.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Prototipado rapido en local: con ~853 M de parametros, el modelo cabe en GPUs consumer y permite iterar sobre tareas de generacion o decision en un portatil con GPU dedicada, sin depender de infraestructura cloud.
- Clasificacion y enrutamiento de consultas: si el modelo base esta orientado a "decision", puede emplearse para tareas de enrutamiento o etiquetado en pipelines internos, validando primero su calidad con un conjunto de evaluacion propio.
- Extraccion de informacion estructurada: uso como base para ajuste adicional (fine-tune) sobre dominios concretos, aprovechando su tamano reducido para iteraciones rapidas y bajo coste de entrenamiento.
- Experimentacion academica: como punto de partida para estudiar el efecto de fine-tunes sobre modelos sub-1B y comparar con el modelo base qhoenix/zils-lite-decision-v9.
- Inferencia de baja latencia en edge: su tamano permite despliegue en dispositivos con recursos limitados mediante cuantizacion (aunque el autor no publica versiones cuantizadas, es posible generarlas con llama.cpp o herramientas equivalentes).
- Evaluacion comparativa de derivados: util para investigadores que analizan como cambia el comportamiento de un modelo base tras un ajuste fino con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, aproximadamente 1,7 GB de pesos mas overhead de activaciones y KV cache (estimacion orientativa de 2,5-4 GB para contextos moderados); en INT8, en torno a 0,9-1,5 GB; en INT4, en torno a 0,5-1 GB. Cifras estimadas por tamano, no publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para FP16; RTX 3060/4060, RTX 4090, A100 o H100 son mas que suficientes.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada moderna e incluso en algunas integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers (soporte nativo declarado); vLLM, llama.cpp, Ollama y TGI no estan confirmados por el autor, pero el formato safetensors permite conversion a GGUF para llama.cpp/Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1lock/zils-lite-r60-526b | 852.985.920 | no disponible | Apache 2.0 | Hugging Face, transformers | Fine-tune de qhoenix/zils-lite-decision-v9, documentacion minima |
| qhoenix/zils-lite-decision-v9 | no disponible en la informacion proporcionada | no disponible | no disponible | Hugging Face | Modelo base del que deriva |
| Alternativas sub-1B (p. ej. Qwen2.5-0.5B, SmolLM2-360M) | 0,36-0,5 B aprox. | 4k-32k tipicamente | Apache 2.0 / otros | Hugging Face, amplia adopcion | No se dispone de datos comparativos de rendimiento con este modelo |

La comparativa con alternativas consolidadas no puede establecerse con rigor porque no hay benchmarks publicados de este modelo ni del base en la informacion disponible.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: no hay informacion sobre arquitectura, datos de entrenamiento, contexto ni evaluacion, lo que impide validar su calidad de forma objetiva.
- Riesgo de alucinacion: desconocido, pero esperable en modelos generativos de este tamano; requiere validacion empirica.
- Sesgos conocidos: no documentados; al no conocerse la composicion del dataset, no se pueden evaluar sesgos de genero, idioma o dominio.
- Idiomas: no declarados; no se puede asumir soporte multilingue sin pruebas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al ser un derivado de qhoenix/zils-lite-decision-v9 conviene revisar la licencia upstream y los terminos del modelo base antes de un despliegue comercial.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni de validacion por la comunidad.
- Contexto desconocido: no se puede planificar arquitecturas que dependan de ventanas largas sin confirmar la longitud de contexto.

## Enlaces

- Hugging Face: https://huggingface.co/1lock/zils-lite-r60-526b
- Modelo base: https://huggingface.co/qhoenix/zils-lite-decision-v9
