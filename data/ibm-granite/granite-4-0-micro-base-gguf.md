# ibm-granite/granite-4.0-micro-base-GGUF

## Resumen

Granite-4.0-micro-base-GGUF es la distribucion en formato GGUF del modelo base granite-4.0-micro-base de IBM, un transformer denso de 3.400 millones de parametros disenado como modelo fundacional (no instruido) para tareas de continuacion de texto y como punto de partida para fine-tuning. IBM lo publica dentro de la familia Granite 4.0, orientada a casos de uso empresariales, y esta version concreta esta pensada para su ejecucion en llama.cpp, lo que facilita el despliegue en CPU, GPU de consumo y entornos con recursos limitados.

El interes de esta ficha radica en que combina un tamano contenido (3,4 B de parametros) con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Al ser un modelo *base* y no un modelo instruido, no incorpora alineamiento conversacional ni formato de chat; su utilidad principal es la generacion de texto autocompletada y el ajuste fino supervisado para dominios especificos. El repositorio GGUF incluye multiples cuantizaciones, aunque la model card solo detalla el uso de Q4_K_M.

La informacion publica disponible es limitada: la model card de esta distribucion remite a la del modelo base original y no detalla composicion del dataset, numero de tokens de entrenamiento ni resultados de benchmarks. Los datos de arquitectura, contexto e idiomas que no aparecen en la informacion proporcionada se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Granite 4.0); detalles no disponibles |
| Parametros totales | 3.402.836.480 (3,4 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Multiples cuantizaciones GGUF; la model card solo menciona Q4_K_M de forma explicita |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (libreria llama.cpp); pesos originales en el modelo base |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 3.402.836.480 parametros, integrado en la familia Granite 4.0 de IBM. La informacion proporcionada no detalla la configuracion interna (numero de capas, dimension oculta, cabezas de atencion), el numero de tokens de entrenamiento, la composicion del corpus ni si se aplicaron tecnicas de RLHF o DPO. Al tratarse de un modelo *base*, cabe esperar que no haya pasado por alineamiento conversacional, pero este extremo no se confirma en la documentacion disponible.

La innovacion tecnica relevante en esta distribucion es el propio proceso de conversion a GGUF mediante llama.cpp (build tag b11798, Transformers 5.20.2), que permite ejecutar el modelo con cuantizaciones de 4 bits y superiores en hardware modesto. No se dispone de informacion sobre tecnicas adicionales como decodificacion especulativa, atencion lineal o arquitecturas hibridas.

## Capacidades

- Generacion de texto autoregresiva y continuacion de prompts, propia de un modelo base.
- Punto de partida para fine-tuning supervisado en dominios especificos (modelo *base*, sin alineamiento).
- Ejecucion local mediante llama.cpp, con CLI interactivo (`llama cli`) y servidor compatible con la API de OpenAI (`llama serve`, endpoint `/v1/chat/completions`).
- Despliegue en CPU y GPU de consumo gracias a las cuantizaciones GGUF.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles (modelo base).
- Capacidades multilingues: no disponibles.
- Vision, audio o modo *thinking*: no disponibles.

## Casos de uso

- Fine-tuning para dominios verticales: al ser un modelo base de 3,4 B con licencia Apache 2.0, se puede ajustar con SFT sobre corpus propios (legal, sanitario, documentacion tecnica) sin coste de licencia y desplegarlo en infraestructura propia.
- Generacion de texto en local para prototipado: con la cuantizacion Q4_K_M y `llama cli` se puede validar rapidamente la calidad de las completaciones antes de invertir en entrenamiento.
- Servicio de completaciones compatible con OpenAI: `llama serve` expone `/v1/chat/completions`, lo que permite sustituir un endpoint remoto por uno local en herramientas que ya hablan el protocolo OpenAI, util para pruebas de integracion.
- Autocompletado y generacion asistida en editores o pipelines de documentacion: el modelo puede continuar fragmentos de texto tecnico alli donde la latencia y el coste importan mas que la calidad maxima.
- Experimentacion academica en eficiencia: 3,4 B de parametros en 4 bits permiten estudiar tecnicas de cuantizacion, destilacion o ajuste con recursos de una sola GPU de consumo.
- Clasificacion y etiquetado por continuacion: mediante prompts de continuacion se pueden construir clasificadores ligeros o generadores de etiquetas para grandes volumenes de texto, ejecutados en CPU.
- Base para modelos especializados en codigo o matematicas: el modelo base admite ajuste fino sobre corpus de codigo o problemas matematicos, aunque no se dispone de benchmarks que confirmen su rendimiento en esas areas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; como referencia orientativa, un modelo de 3,4 B en 4 bits ocupa del orden de 2 GB de pesos, y en 8 bits del orden de 3,5 GB, sin contar el espacio de contexto y el overhead de llama.cpp.
- GPU recomendadas: no especificadas por el autor. Por tamano, el modelo es apto para GPU de consumo con suficiente VRAM; no se dispone de datos oficiales sobre A100, H100 o RTX 4090.
- Cabe en GPU de consumo: si, segun el tamano del modelo y la cuantizacion; no se dispone de lista oficial de GPU validadas.
- Opciones de despliegue: llama.cpp (CLI `llama cli` y servidor `llama serve` con API compatible con OpenAI). Otras opciones (vLLM, TGI, Ollama) no se mencionan en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| granite-4.0-micro-base-GGUF | 3,4 B | no disponible | Apache 2.0 | GGUF | Modelo base, distribucion llama.cpp |
| granite-4.0-micro-base | 3,4 B | no disponible | Apache 2.0 | safetensors (presumible, no confirmado) | Modelo original del que deriva esta version |
| Alternativas de ~3-4 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con alternativas de la misma categoria en parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Es un modelo *base*: no esta alineado para conversacion ni sigue instrucciones de forma fiable; su uso como asistente requiere fine-tuning o prompting de continuacion.
- Riesgo de alucinacion y de generar contenido factualmente incorrecto, especialmente sin ajuste posterior.
- Sesgos conocidos: no documentados en la informacion proporcionada; cabe esperar los sesgos presentes en el corpus de entrenamiento, que tampoco se detalla.
- Idiomas soportados no documentados: no se puede garantizar calidad fuera del idioma o idiomas de entrenamiento.
- Longitud de contexto no disponible: no se puede planificar el uso con documentos largos sin consultar la model card del modelo base.
- La model card de esta distribucion solo detalla la cuantizacion Q4_K_M; el resto de ficheros GGUF del repositorio no se describen individualmente.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero se recomienda revisar los terminos del modelo base y de las dependencias de llama.cpp.
- El repositorio ocupa 63,2 GB por incluir multiples cuantizaciones; conviene descargar solo el fichero necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ibm-granite/granite-4.0-micro-base-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-micro-base
- Documentacion de llama.cpp: https://github.com/ggml-org/llama.cpp
- CLI de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/tools/cli/README.md
- Servidor de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md
