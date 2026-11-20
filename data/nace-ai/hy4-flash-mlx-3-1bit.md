# nace-ai/Hy4-flash-MLX-3.1bit

## Resumen

Hy4-flash-MLX-3.1bit es una cuantizacion de 3,12 bits efectivos por peso del modelo Tencent Hy4-flash, publicada por el usuario nace-ai en Hugging Face. El paquete resultante ocupa 85,4 GB repartidos en 56 ficheros y mantiene 18.606.981.653 parametros totales, segun los metadatos de safetensors. La cuantizacion emplea 2 bits en los expertos enrutados (routed experts) y preserva las tablas Engram en precision IQ4_NL, lo que sugiere una arquitectura de tipo mezcla de expertos (MoE) con un componente adicional denominado Engram.

El modelo base, tencent/Hy4-flash, pertenece a la familia Hy de Tencent y se distribuye bajo la Tencent Hy License, Version 1.0. Esta version cuantizada esta pensada para ejecutarse con MLX, el framework de Apple para silicio Apple, aunque la model card incluye tambien instrucciones para Linux con GPU CUDA 13 mediante un fichero de requisitos alternativo. El pipeline declarado es text-generation y la libreria es mlx.

La relevancia de esta ficha radica en que permite ejecutar un modelo de casi 18.600 millones de parametros en hardware de Apple con un peso de 85 GB, un tamano que sigue siendo elevado para equipos de consumo pero que resulta manejable en estaciones de trabajo con memoria unificada amplia. No obstante, la informacion publicada es muy escasa: no hay datos de benchmarks, idiomas, contexto ni composicion del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con expertos enrutados y tablas Engram (inferido de la model card; no confirmado en detalle) |
| Parametros totales | 18.606.981.653 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3,12 bits efectivos por peso; 2 bits en expertos enrutados; IQ4_NL en tablas Engram |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License, Version 1.0 (license: other) |
| Formato de pesos | safetensors y MLX (repo de 85,4 GB, 56 ficheros); tag gguf presente pero sin detalle |
| Tamano del repo | 85,4 GB |
| Modelo base | tencent/Hy4-flash |
| Libreria | mlx |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La model card indica que se trata de una cuantizacion de Tencent Hy4-flash con expertos enrutados a 2 bits y tablas Engram conservadas en IQ4_NL. Esto apunta a una arquitectura de mezcla de expertos (MoE) en la que solo una parte de los parametros se activa por token, aunque no se especifica el numero de expertos, el numero de expertos activos ni la dimension oculta. El termino Engram hace referencia a un componente de memoria o tablas de conocimiento asociadas al modelo, pero la informacion disponible no detalla su funcion exacta ni su integracion en el grafo computacional.

No se han publicado en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineacion, ni innovaciones como decodificacion especulativa o atencion lineal. Tampoco se detalla el proceso de cuantizacion mas alla de la precision asignada a cada grupo de pesos.

## Capacidades

- Generacion de texto y conversacion, segun el pipeline declarado (text-generation, conversational).
- Razonamiento y codigo: no confirmado explicitamente en la informacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se listan idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Ejecucion en Apple silicon mediante MLX y en Linux con CUDA 13 segun la model card.

## Casos de uso

- Prototipado local en Apple silicon: el paquete MLX permite cargar el modelo con el loader incluido y ejecutar inferencia en un Mac con memoria unificada suficiente, util para experimentar sin depender de la nube.
- Evaluacion de cuantizaciones agresivas: sirve para medir la perdida de calidad de una cuantizacion a 3,12 bits efectivos frente al modelo base tencent/Hy4-flash en tareas de generacion.
- Generacion de texto conversacional: el pipeline declarado es text-generation y conversational, por lo que puede emplearse en chatbots de proposito general una vez validada su calidad.
- Investigacion sobre arquitecturas MoE con tablas Engram: el hecho de preservar las tablas Engram en IQ4_NL permite estudiar el impacto de la precision en estos componentes.
- Despliegue en estaciones de trabajo Linux con CUDA 13: la model card incluye requirements-linux.txt, lo que habilita su uso en servidores con GPU NVIDIA.
- Banquito de pruebas para tooling MLX: util para desarrolladores que quieran validar el loader run_mlx.py y flujos de descarga con hf download en modelos de gran tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repo pesa 85,4 GB, por lo que se necesita al menos esa cantidad de memoria unificada o VRAM para cargar los pesos en precision de la cuantizacion; el overhead de ejecucion adicional no esta documentado.
- GPU recomendadas: no disponible. La model card menciona Apple silicon (MLX) y Linux con GPU CUDA 13, sin modelos concretos.
- Compatibilidad con GPU de consumo: no confirmado. 85,4 GB supera la VRAM de cualquier GPU de consumo actual (RTX 4090 con 24 GB, por ejemplo), por lo que no cabe en una sola GPU consumer; requeriria memoria unificada de Apple de gama alta o multiples GPU.
- Opciones de despliegue: MLX con el loader incluido (run_mlx.py); en Linux, requirements-linux.txt con CUDA 13. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nace-ai/Hy4-flash-MLX-3.1bit | 18.606.981.653 | no disponible | 3,12 bits efectivos (MLX) | Tencent Hy License 1.0 | Hugging Face, 0 descargas |
| tencent/Hy4-flash (base) | no disponible en esta ficha | no disponible | pesos originales | Tencent Hy License 1.0 | Hugging Face |
| Otras cuantizaciones de Hy4-flash | no disponible | no disponible | no disponible | Tencent Hy License 1.0 | no disponible |

No se dispone de informacion sobre modelos comparables de otros autores en la misma categoria para esta ficha.

## Limitaciones y advertencias

- La cuantizacion a 3,12 bits efectivos y 2 bits en expertos enrutados puede degradar la calidad respecto al modelo base; no se han publicado evaluaciones que cuantifiquen esa perdida.
- No hay informacion sobre sesgos, riesgo de alucinacion ni limitaciones idiomaticas del modelo base ni de esta cuantizacion.
- La licencia Tencent Hy License, Version 1.0, es una licencia "other" que puede imponer restricciones al uso comercial; es necesario revisar el fichero LICENSE antes de desplegar en produccion.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad sobre su correcto funcionamiento.
- El tag gguf aparece en los metadatos pero la model card solo describe el flujo MLX; no esta claro que se incluya un GGUF funcional.
- El tamano de 85,4 GB limita su despliegue a equipos con memoria unificada o VRAM muy elevada.
- No se documentan la longitud de contexto, los idiomas ni los parametros activos, lo que dificulta planificar su uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/nace-ai/Hy4-flash-MLX-3.1bit
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Licencia: fichero LICENSE en el repositorio de Hugging Face
