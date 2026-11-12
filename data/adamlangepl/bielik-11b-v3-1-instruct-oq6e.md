# AdamLangePL/Bielik-11B-v3.1-Instruct-oQ6e

## Resumen

Bielik-11B-v3.1-Instruct-oQ6e es una version cuantizada del modelo Bielik-11B-v3.1-Instruct, un modelo de lenguaje de aproximadamente 11.169 millones de parametros (11,169B) orientado a instrucciones. Esta variante concreta ha sido generada por el usuario AdamLangePL mediante la herramienta oQ (oMLX v0.7.3), un esquema de cuantizacion de precision mixta, y se distribuye en formato MLX, lo que la hace apta para su ejecucion en hardware Apple Silicon a traves del framework MLX.

El modelo base pertenece a la familia Bielik, desarrollada por el proyecto Bielik (SpeakLeash y colaboradores) y orientada principalmente al idioma polaco. Sin embargo, la model card de esta variante cuantizada no aporta informacion sobre el modelo original: no se detallan la arquitectura exacta, los datos de entrenamiento, la licencia ni los idiomas soportados. Los datos disponibles se limitan a los metadatos de Hugging Face y a la informacion de cuantizacion proporcionada por el autor de la conversion.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 11B en equipos con memoria unificada moderada gracias a una huella de almacenamiento de 8,711 GiB, con una media efectiva de 6,700 bits por peso. No obstante, la ausencia de documentacion sobre el modelo base limita considerablemente la evaluacion de sus capacidades reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base tipo transformer, segun la familia Bielik; no confirmado en la informacion) |
| Parametros totales | 11.168.796.672 (11,169B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion mixta oQ (oMLX v0.7.3): affine 6-bit grupo 64 (90,016% de los pesos), affine 8-bit grupo 64 (9,980%), BF16 (0,004%); media efectiva 6,700 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors con cuantizacion MLX (libreria mlx); repo de 9,4 GB, almacenamiento efectivo 8,711 GiB |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base en la documentacion proporcionada. Por el nombre y la familia (Bielik-11B-v3.1-Instruct) se trata presumiblemente de un transformer decoder-only ajustado para instrucciones, pero este dato no esta confirmado en la informacion disponible. Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similares.

La unica innovacion tecnica documentada es el proceso de cuantizacion: se aplico oQ (oMLX v0.7.3), un esquema de precision mixta que asigna 6 bits (grupo 64) al 90,016% de los pesos logicos (10,054B), 8 bits (grupo 64) al 9,980% (1,115B) y mantiene en BF16 un 0,004% residual. El resultado es una media efectiva de 6,700 bits por peso, con un almacenamiento total de 8,711 GiB para el modelo de lenguaje. Esta estrategia busca preservar la calidad en las capas mas sensibles manteniendo una huella de memoria reducida.

## Capacidades

- Generacion de texto e instrucciones: el sufijo "Instruct" indica ajuste para seguir instrucciones, aunque no se detallan las capacidades concretas en la informacion disponible.
- Razonamiento, codigo y matematicas: no disponible.
- Vision: no disponible (no se indica que sea multimodal).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; la familia Bielik se asocia habitualmente al polaco, pero no se confirma en esta ficha.
- Modo thinking, audio u otras capacidades especiales: no disponible.
- Ejecucion en Apple Silicon mediante MLX: capacidad derivada del formato de pesos y la libreria declarada.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el formato MLX y la cuantizacion a 6,700 bits/peso permiten cargar el modelo en equipos con memoria unificada de 16 GB o superior, facilitando prototipado sin GPU dedicada.
- Procesamiento de texto en polaco (si se confirma el soporte del modelo base): util para tareas de redaccion, resumen o traduccion en ese idioma, aunque la falta de documentacion obliga a validar la calidad empiricamente.
- Asistentes conversacionales de uso personal: al ser un modelo de 11B cuantizado, puede desplegarse en local para chatbots privados sin enviar datos a servicios externos.
- Experimentacion con cuantizacion de precision mixta: sirve como referencia para estudiar el impacto de oQ en la calidad frente al modelo original en BF16.
- Evaluacion comparativa de formatos: util para comparar el rendimiento de MLX frente a GGUF o safetensors en el mismo hardware.
- Fines educativos y de investigacion: permite analizar el comportamiento de un modelo de 11B en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 8,711 GiB de pesos, mas overhead de contexto y activaciones; se recomienda al menos 16 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: hardware Apple Silicon (series M1, M2, M3, M4) con 16 GB o mas de memoria unificada, dado el formato MLX. No se garantiza compatibilidad con GPU NVIDIA o AMD en este formato.
- Cabe en GPU consumer: si, en equipos Apple con memoria unificada suficiente; en GPU dedicadas consumer requeriria conversion a otro formato (GGUF, por ejemplo), no incluida en el repo.
- Opciones de despliegue: MLX (libreria declarada) y oMLX; no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI para este formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bielik-11B-v3.1-Instruct-oQ6e | 11,169B | no disponible | MLX safetensors (6,700 bits/peso) | no disponible | Hugging Face (0 descargas) |
| Bielik-11B-v3.1-Instruct (original) | 11B (aproximado) | no disponible | no disponible | no disponible | no disponible en la informacion |
| Alternativas de ~11B cuantizadas a 6 bits | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa rigurosa con modelos alternativos.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo base.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin benchmarks ni evaluaciones publicadas no puede cuantificarse.
- Limitaciones de contexto e idioma: se desconocen la ventana de contexto y los idiomas soportados; la familia Bielik se asocia al polaco, pero no se confirma.
- Licencia no disponible: no puede verificarse si se permite el uso comercial; se recomienda consultar la licencia del modelo base antes de cualquier despliegue en produccion.
- La cuantizacion a 6,700 bits/peso puede degradar la calidad respecto al modelo original en BF16; no se aportan metricas de degradacion.
- El repo tiene 0 descargas y 0 likes, y fue creado y actualizado en fechas muy proximas (2026-11-12), lo que sugiere que no ha sido validado por la comunidad.
- El formato MLX limita el despliegue a ecosistema Apple; no es directamente portable a otras plataformas sin conversion.
- No se especifica el pipeline de la libreria en Hugging Face, lo que puede complicar la carga automatica con `transformers`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdamLangePL/Bielik-11B-v3.1-Instruct-oQ6e
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Modelo base Bielik-11B-v3.1-Instruct: no disponible en la informacion proporcionada
- Paper, blog o demo oficial: no disponible en la informacion proporcionada
