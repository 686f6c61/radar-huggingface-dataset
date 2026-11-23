# ramgpt/Inkling-2-Mini-Q4Fit-MIX-GGUF

## Resumen

Inkling-2-Mini-Q4Fit-MIX-GGUF es una cuantizacion GGUF de precision mixta del modelo multimodal Inkling 2 Mini, desarrollado originalmente por Thinking Machines. El modelo base es un sistema image-text-to-text de 26.070 millones de parametros (26,07 B) que acepta tanto texto como imagenes como entrada y genera texto. Esta version concreta ha sido producida por el usuario ramgpt utilizando la herramienta Q4Fit y llama.cpp, y se distribuye bajo licencia Apache 2.0.

La relevancia de esta publicacion es fundamentalmente practica: comprime los pesos a aproximadamente 15,81 GB, un tamano que permite cargar el modelo completo en una unica GPU de consumo como la RTX 4090. La estrategia de cuantizacion no es uniforme, sino que asigna precisiones distintas (Q3_K, Q4_K, Q5_K y Q5_0) a distintos grupos de tensores de expertos, lo que sugiere que el modelo base emplea una arquitectura de mezcla de expertos (MoE) con un bucle de tres pasadas.

Conviene subrayar que el autor no reclama ninguna ventaja de calidad frente a una cuantizacion Q4_K pura del mismo origen; de hecho, la diferencia de tamano es de apenas 10,6 MB. El interes de esta ficha reside, por tanto, en documentar una variante experimental de bajo uso (0 descargas en el momento de la consulta) que ilustra las tecnicas actuales de cuantizacion mixta aplicadas a modelos multimodales de gran tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con mezcla de expertos y bucle de tres pasadas (no confirmado en detalle) |
| Parametros totales | 26.070.385.152 (26,07 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de ejecucion usa `-c 4096`) |
| Tipos de cuantizacion | GGUF de precision mixta: Q4_K (mayoria), Q3_K (bloques 0 y 1), Q5_K (bloques 6 y 12), Q5_0 (24 tensores de expertos adicionales), F32 (normalizacion y controladores) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (pesos principales + proyector `mmproj` en BF16) |

## Arquitectura y entrenamiento

El modelo base, Inkling 2 Mini de Thinking Machines, es un sistema multimodal que procesa imagenes y texto y produce texto. La model card de esta cuantizacion menciona explicitamente un "bucle de tres pasadas" (`inkling2_loop` en llama.cpp) y la existencia de "grupos de pesos de expertos" en bloques concretos (0, 1, 6 y 12), lo que apunta a una arquitectura con componentes de mezcla de expertos distribuidos a lo largo de las capas. No se dispone de informacion detallada sobre el numero de capas, la dimension oculta, el numero de expertos ni la funcion de enrutamiento.

En cuanto al entrenamiento, la informacion proporcionada no incluye datos sobre volumen de tokens, composicion del corpus, ni si se aplicaron tecnicas de RLHF, DPO o similares. Un dato tecnicamente relevante es que el GGUF de entrada empleado por este autor (`ggml-org/Inkling-2-Mini-GGUF`) es un "upcast en BF16 de los pesos NVFP4/MXFP8 publicados", es decir, no procede de un checkpoint de precision completa original, sino de una reconversion de pesos ya cuantizados en origen. Esto implica una perdida acumulada de precision que conviene tener en cuenta al evaluar la fidelidad numerica del modelo.

La innovacion tecnica de esta publicacion concreta es la asignacion no uniforme de bits: se transfieren bits de dos bloques tempranos (Q3_K) a dos bloques del bucle repetido (Q5_K), con la hipotesis de que los bloques reutilizados en las tres pasadas merecen mayor precision. El autor declara explicitamente que no reclama ventaja de calidad alguna y que la unica verificacion realizada fueron ocho prompts cortos de texto y una imagen simple con un cuadrado rojo en una RTX 4090.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` y el pipeline declarado.
- Entrada multimodal imagen-texto: el repositorio incluye un proyector `mmproj-Inkling-2-Mini-BF16.gguf` que habilita la entrada de imagenes junto al texto.
- Inferencia compatible con `llama-server` mediante llama.cpp con soporte para la arquitectura `inkling2_loop`.
- Soporte de plantillas de chat mediante `--jinja`.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en las etiquetas del repositorio).
- Capacidades de razonamiento multi-paso, tool calling o agentes: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible.

## Casos de uso

- Despliegue local en una unica GPU de consumo: al ocupar aproximadamente 15,81 GB, el modelo cabe en una RTX 4090 (24 GB) junto con el proyector BF16 y un contexto moderado, lo que permite ejecutar un modelo multimodal de 26 B en hardware de escritorio sin infraestructura de servidor.
- Prototipado de aplicaciones vision-lenguaje: el par de ficheros (`gguf` + `mmproj`) permite construir rapidamente demos que reciben una imagen y una pregunta en texto y devuelven una descripcion o respuesta, usando `llama-server` como backend HTTP.
- Evaluacion comparativa de tecnicas de cuantizacion: al existir una version Q4_K pura del mismo origen (15,823 GB) frente a esta mixta (15,812 GB), el modelo sirve como banco de pruebas para medir el impacto real de reasignar precision entre bloques en tareas controladas.
- Experimentacion academica con modelos MoE multimodales: investigadores que necesiten estudiar el comportamiento de un modelo con bucle de tres pasadas y expertos distribuidos pueden ejecutarlo en un solo nodo sin acceso a clusters.
- Integracion en pipelines de inferencia basados en llama.cpp: al ser GGUF, encaja en herramientas del ecosistema (llama.cpp, y potencialmente wrappers compatibles) para tareas de generacion de texto e imagen-texto en local.
- Entornos con requisitos de licencia permisiva: la licencia Apache 2.0 del modelo base y de esta cuantizacion facilita su uso en productos comerciales, sujeto a las obligaciones habituales de atribucion.
- Verificacion de integridad de artefactos: el repositorio incluye `quantization.json` con revisiones de origen, ajustes de precision y sumas de verificacion, lo que permite auditar la procedencia de los pesos en entornos con requisitos de trazabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente documenta una prueba de humo con ocho prompts cortos de texto y una imagen simple (cuadrado rojo) en una RTX 4090, sin metricas cuantitativas de calidad, latencia ni throughput, y senala explicitamente que esto no constituye una evaluacion multimodal general ni establece mejor precision.

## Requisitos de hardware

- VRAM estimada: aproximadamente 15,81 GB para los pesos del modelo, mas el proyector BF16 y la memoria para el contexto KV cache; en la practica, un contexto de 4096 tokens y el proyector requieren margen adicional sobre los 16 GB.
- GPU verificada por el autor: RTX 4090 (24 GB), donde tanto esta version mixta como la Q4_K pura cargaron y respondieron correctamente.
- GPU recomendadas: RTX 4090 o superiores en el segmento de consumo; en el segmento profesional, A100 (40/80 GB), H100 (80 GB) o L40S ofrecen holgura para contextos mayores y mayor concurrencia.
- Cabe en GPU de consumo: si, en tarjetas con al menos 24 GB de VRAM (RTX 4090, y previsiblemente RTX 3090). En tarjetas de 16 GB no cabe con comodidad, salvo con contextos muy reducidos y sin margen para el proyector.
- Opciones de despliegue: llama.cpp (con soporte para `inkling2_loop`), concretamente `llama-server` con los parametros `-ngl 99 -c 4096 --jinja` y `--mmproj`. La compatibilidad con vLLM, TGI u Ollama no esta documentada en la informacion disponible.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Q4Fit-MIX-GGUF (esta ficha) | 26,07 B | no disponible | GGUF mixto (15,812 GB) | Apache 2.0 | Cuantizacion experimental; 0 descargas |
| Inkling-2-Mini Q4_K pura (mismo origen) | 26,07 B | no disponible | GGUF Q4_K (15,823 GB) | Apache 2.0 | Referencia de comparacion citada por el autor; 10,6 MB mayor |
| thinkingmachines/Inkling-2-Mini (original) | 26,07 B | no disponible | Pesos originales (NVFP4/MXFP8) | Apache 2.0 | Modelo base sin cuantizar por terceros |
| ggml-org/Inkling-2-Mini-GGUF (entrada) | 26,07 B | no disponible | GGUF BF16 (upcast) | Apache 2.0 | Fuente empleada para esta cuantizacion |

No se dispone de informacion sobre modelos alternativos de otros desarrolladores con los que comparar rendimiento, contexto o latencia.

## Limitaciones y advertencias

- El autor no reclama ninguna ventaja de calidad frente a la cuantizacion Q4_K pura; la diferencia de tamano es de solo 10,6 MB y la validacion se limita a pruebas de humo no concluyentes.
- Los pesos de partida son un upcast en BF16 de pesos ya cuantizados (NVFP4/MXFP8), no un checkpoint de precision completa, por lo que la perdida de fidelidad numerica es acumulativa.
- La cuantizacion mixta asigna Q3_K a los bloques 0 y 1, lo que puede degradar representaciones tempranas; no hay evidencia publicada sobre el impacto real.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero es un riesgo inherente a los modelos generativos de este tamano.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Cobertura de idiomas: no disponible; no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas.
- Longitud de contexto: no documentada; el ejemplo de ejecucion usa 4096 tokens, que puede no ser el maximo soportado.
- Requiere una version reciente de llama.cpp con soporte para `inkling2_loop`; versiones anteriores no cargaran el modelo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia; se trata de un artefacto sin validacion comunitaria.
- Licencia Apache 2.0: permite uso comercial con las obligaciones habituales de atribucion y conservacion del aviso de licencia; conviene verificar tambien las condiciones del modelo base original.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/ramgpt/Inkling-2-Mini-Q4Fit-MIX-GGUF
- Modelo base original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF de entrada (ggml-org): https://huggingface.co/ggml-org/Inkling-2-Mini-GGUF
- Herramienta Q4Fit: https://github.com/bettercallcaleb/q4fit
- llama.cpp (commit de referencia `f4f6f2e7db76e98c95cc9b7fc608ea669c806044`): https://github.com/ggml-org/llama.cpp
