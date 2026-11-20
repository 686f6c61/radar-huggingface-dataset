# nace-ai/Hy4-flash-MLX-4.6bit

## Resumen

Hy4-flash-MLX-4.6bit es una cuantizacion en formato MLX del modelo Hy4-flash de Tencent, publicada por Nace.AI. El modelo base es un transformer de gran escala con 148.896.743.957 parametros totales (aproximadamente 149 mil millones), orientado a generacion de codigo y tareas de razonamiento. Esta version reduce el peso a 4,6 bits por parametro, dando como resultado un repositorio de 125,2 GB, pensado para ejecutarse en hardware Apple Silicon mediante la libreria MLX.

La relevancia de esta ficha radica en que permite ejecutar un modelo de casi 150 mil millones de parametros en equipos de consumo con memoria unificada, algo impracticable con los pesos en precision completa. El autor reporta que, sobre un subconjunto fijo de 100 preguntas de LiveCodeBench release_v6 con un limite de 8.192 tokens, la cuantizacion resolvio 39 de 100 problemas, el mismo resultado que el empaquetado de 4 bits pero con menor tamano en disco.

Se trata de un modelo unicamente en ingles, con licencia Tencent HY Community License (distinta de una licencia open source estandar), por lo que su uso comercial esta sujeto a los terminos del titular del modelo base. La informacion publicada por el autor es muy escasa: no hay model card detallada del modelo base ni datos de arquitectura interna, entrenamiento o benchmarks mas alla del resultado parcial de LiveCodeBench.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base tencent/Hy4-flash; familia Hy4) |
| Parametros totales | 148.896.743.957 (aprox. 149 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4,6 bits por peso (MLX); el autor menciona tambien un empaquetado de 4 bits |
| Idiomas soportados | ingles (en) |
| Licencia | Tencent HY Community License (license: other) |
| Formato de pesos | safetensors y GGUF (tags del repo); libreria MLX |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base tencent/Hy4-flash en la informacion proporcionada. Los datos disponibles solo confirman que se trata de un modelo de aproximadamente 149 mil millones de parametros y que la cuantizacion se ha realizado con la libreria MLX, con pesos en safetensors y etiquetas que indican tambien presencia de formato GGUF. El autor menciona que el paquete requiere un runtime con soporte de "packed-expert" y de "GGUF Engram-table", lo que sugiere una arquitectura con componentes de mezcla de expertos (MoE) y algun mecanismo denominado Engram, aunque no se detalla su funcionamiento.

Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. La unica innovacion tecnica documentada por el autor es el propio esquema de cuantizacion a 4,6 bits por peso, que busca preservar la calidad del empaquetado de 4 bits reduciendo el tamano total del repositorio.

## Capacidades

- Generacion de texto y razonamiento general, segun el proposito declarado del modelo base.
- Generacion y resolucion de problemas de codigo: el autor reporta resultados en LiveCodeBench release_v6.
- Capacidades multilingues limitadas al ingles (unico idioma declarado).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible en la informacion proporcionada.
- Modo de razonamiento extendido (thinking): no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion de codigo en local sobre Apple Silicon: el modelo puede ejecutarse con MLX en equipos con memoria unificada suficiente y usarse para resolver problemas de programacion tipo benchmark (LiveCodeBench) sin depender de la nube.
- Asistencia de programacion en el IDE: integrado mediante un servidor local compatible con MLX, puede generar y completar funciones en ingles y en lenguajes de programacion habituales, aprovechando los 149 B de parametros del modelo base.
- Prototipado de pipelines de generacion de codigo: util para comparar el efecto de la cuantizacion a 4,6 bits frente al empaquetado de 4 bits en tareas de sintesis de codigo, ya que el autor publica una comparacion directa.
- Investigacion sobre cuantizacion: sirve como referencia practica para estudiar la degradacion de calidad al comprimir modelos de gran escala, dado que el autor reporta paridad con el pack de 4 bits en una muestra controlada.
- Procesamiento de documentacion tecnica en ingles: generacion de resumenes y explicaciones de codigo o documentacion, limitado al idioma ingles.
- Despliegue en estaciones de trabajo con memoria unificada: alternativa a la inferencia en GPU para equipos Apple de gama alta, donde el modelo cabe en 125,2 GB de pesos.

## Benchmarks y rendimiento

| Benchmark | Configuracion | Resultado |
|---|---|---|
| LiveCodeBench release_v6 (subconjunto fijo de 100 preguntas, limite de 8.192 tokens) | Hy4-flash-MLX-4.6bit | 39/100 resueltas |
| LiveCodeBench release_v6 (mismo subconjunto) | Empaquetado de 4 bits del mismo modelo | 39/100 resueltas (mismo resultado, mayor tamano) |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 125,2 GB, por lo que se necesita al menos esa cantidad de memoria unificada o VRAM para cargar los pesos completos; se recomienda margen adicional para el contexto y el runtime.
- GPU recomendadas: no disponible en la informacion proporcionada; el formato MLX esta orientado a Apple Silicon (chips M-series).
- Cabe en GPU de consumo: no hay datos que lo confirmen; en el ecosistema Apple, requiere equipos con memoria unificada de 128 GB o superior (por ejemplo, configuraciones de Mac Studio o MacBook Pro de gama alta).
- Opciones de despliegue: MLX (libreria declarada); el autor indica que se necesita un runtime con soporte de packed-expert y de GGUF Engram-table. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash-MLX-4.6bit (esta ficha) | 148,9 B | no disponible | 4,6 bits MLX | Tencent HY Community License | Hugging Face (nace-ai) |
| Hy4-flash (base, tencent/Hy4-flash) | no disponible | no disponible | precision original | Tencent HY Community License | Hugging Face (tencent) |
| Empaquetado de 4 bits del mismo modelo | 148,9 B (base) | no disponible | 4 bits | Tencent HY Community License | referenciado por el autor, sin enlace |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas: solo se declara ingles; no hay soporte multilingue documentado.
- Alucinacion: no hay evaluaciones publicadas de fidelidad o tasas de alucinacion para esta cuantizacion.
- Cuantizacion: la compresion a 4,6 bits puede degradar el rendimiento en tareas distintas de las evaluadas; la unica evidencia de calidad es un subconjunto de 100 preguntas de LiveCodeBench.
- Licencia: la Tencent HY Community License no es una licencia open source estandar; el uso comercial esta sujeto a sus terminos y debe revisarse antes de produccion.
- Runtime: requiere soporte especifico de packed-expert y GGUF Engram-table, lo que limita las herramientas de inferencia compatibles.
- Hardware: el tamano de 125,2 GB restringe el despliegue a equipos con memoria unificada muy alta; no es viable en GPUs de consumo convencionales.
- Documentacion: la model card del autor es minima y no hay datos de arquitectura, contexto ni entrenamiento del modelo base.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, sin validacion comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/nace-ai/Hy4-flash-MLX-4.6bit
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Nace.AI: https://www.nace.ai/
- Licencia (referenciada en el repo): LICENSE dentro del repositorio de Hugging Face
