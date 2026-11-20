# moonbox-dev/qwen35_4b

## Resumen

`moonbox-dev/qwen35_4b` es un repositorio de cuantizaciones GGUF del modelo multimodal Qwen3.5-4B, desarrollado originalmente por Qwen (Alibaba Cloud) y empaquetado por moonbox-dev para su uso en la aplicacion de escritorio Moonbox. No se trata de un modelo nuevo ni de un fine-tune: es una redistribucion de pesos cuantizados, pensada para ejecucion local en llama.cpp con un consumo de memoria reducido. El repositorio contiene 4.326.350.848 parametros en formato safetensors de referencia y un total de 6,8 GB en artefactos.

El modelo base, Qwen3.5-4B, es un transformer multimodal de tipo image-text-to-text: acepta entradas de imagen y texto y genera texto. La cuantizacion a 4 bits (Q4_K_M e IQ4_XS) y el proyector visual separado (mmproj en F16 o BF16) permiten desplegarlo en equipos de escritorio con memoria limitada, manteniendo las capacidades de vision del modelo original.

La relevancia de este repositorio es practica: ofrece artefactos listos para llama.cpp con verificacion mediante lista firmada por parte de la aplicacion Moonbox, y sirve como punto de descarga para quien quiera reproducir el mismo stack de inferencia local. No es una release oficial de Qwen y el autor lo indica explicitamente. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (build MTP), IQ4_XS (build CUDA para Windows); proyector visual en F16 y BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors como referencia del modelo base) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna ni el proceso de entrenamiento del modelo base. Por la informacion disponible, Qwen3.5-4B es un transformer multimodal que combina un modelo de lenguaje con un proyector visual (mmproj) para tareas image-text-to-text. El repositorio incluye dos builds: una con cuantizacion Q4_K_M derivada del GGUF MTP de Unsloth y proyector F16, y otra con cuantizacion IQ4_XS y proyector BF16 orientada al motor de Windows.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF, DPO o ajuste por preferencias. Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal mas alla de la mencion al build MTP (multi-token prediction) de Unsloth, que sugiere soporte de prediccion multi-token en esa variante. Cualquier afirmacion adicional sobre el entrenamiento seria especulativa.

## Capacidades

- Generacion de texto conversacional en formato chat, segun la etiqueta `conversational` del repositorio.
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`), con proyector visual incluido en ambos builds.
- Compatibilidad con endpoints (`endpoints_compatible`) para integracion en servicios de inferencia.
- Uso con llama.cpp, dado que los pesos estan en formato GGUF.
- Capacidades de razonamiento, codigo, matematicas, tool calling, agentes o modo thinking: no disponibles en la informacion proporcionada.
- Cobertura multilingue: no disponible.

## Casos de uso

- Asistente de escritorio local: el modelo esta empaquetado especificamente para la aplicacion Moonbox, que lo descarga y verifica contra una lista firmada; encaja en equipos con poca memoria gracias a la cuantizacion a 4 bits.
- Descripcion y analisis de imagenes en local: al incluir proyector visual, permite enviar capturas o fotografias junto a una pregunta de texto sin depender de servicios en la nube.
- Prototipado de pipelines multimodales con llama.cpp: los GGUF y el mmproj permiten montar un servidor de inferencia compatible con endpoints en una maquina de desarrollo.
- Evaluacion de cuantizaciones: comparar Q4_K_M frente a IQ4_XS en el mismo modelo base para medir degradacion de calidad y velocidad en hardware concreto.
- Integracion en herramientas de escritorio de terceros: cualquier aplicacion que consuma GGUF de llama.cpp puede reutilizar estos artefactos, siempre que respete la licencia Apache 2.0.
- Reproduccion de entornos Moonbox: util para auditar que pesos descarga la aplicacion y verificar su procedencia (Unsloth MTP GGUF o conversion directa de Qwen).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con 4.326 millones de parametros y cuantizacion a 4 bits, el peso de los pesos ronda los 2,2-2,5 GB, a lo que hay que sumar el proyector visual (F16/BF16) y el contexto KV; una estimacion prudente situa el total en torno a 3-4 GB, pero es una inferencia, no un dato del repositorio.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: previsiblemente si en tarjetas con 6-8 GB o mas, dado el tamano del modelo cuantizado; sin confirmacion oficial.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), aplicacion Moonbox y servidores compatibles con endpoints; vLLM, TGI u Ollama no se mencionan en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| moonbox-dev/qwen35_4b | 4.326.350.848 | no disponible | Si (image-text-to-text) | Apache 2.0 | GGUF en HF |
| Qwen/Qwen3.5-4B (base) | 4.326.350.848 | no disponible | Si | Apache 2.0 | Pesos originales en HF |
| unsloth/Qwen3.5-4B-MTP-GGUF | 4.326.350.848 | no disponible | Si | Apache 2.0 | GGUF en HF |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de otros fabricantes.

## Limitaciones y advertencias

- No es una release oficial: el propio autor indica que los archivos fueron convertidos, cuantizados o reempaquetados, y que no deben tratarse como la publicacion original.
- La cuantizacion a 4 bits (Q4_K_M, IQ4_XS) puede degradar la calidad respecto al modelo en precision completa, especialmente en tareas de vision o razonamiento fino.
- No hay informacion sobre sesgos, tasas de alucinacion ni comportamiento en idiomas distintos del ingles; la model card esta redactada en ingles y no detalla cobertura linguistica.
- La longitud de contexto no esta documentada en el repositorio; no debe asumirse un valor concreto en produccion.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe conservar los avisos de copyright de Alibaba Cloud y verificar la licencia del modelo base.
- El repositorio tiene un volumen de descargas muy bajo (2) y ningun like, por lo que no hay validacion comunitaria significativa.
- La verificacion por lista firmada es una garantia del cliente Moonbox, no del repositorio en si; fuera de esa aplicacion conviene validar los hashes manualmente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/qwen35_4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- GGUF MTP de Unsloth: https://huggingface.co/unsloth/Qwen3.5-4B-MTP-GGUF
- Aplicacion Moonbox: https://moonbox.dev
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
