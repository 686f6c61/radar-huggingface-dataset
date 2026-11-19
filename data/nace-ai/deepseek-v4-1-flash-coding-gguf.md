# nace-ai/DeepSeek-V4.1-Flash-Coding-GGUF

## Resumen

DeepSeek V4.1 Flash Coding es una cuantizacion especializada del modelo DeepSeek V4.1 Flash 1017 (763B parametros) publicada por Nace.AI bajo el identificador `nace-ai/DeepSeek-V4.1-Flash-Coding-GGUF`. El objetivo es claro: comprimir un modelo de 763B parametros en un archivo GGUF de 71,8 GB que pueda ejecutarse en un unico Mac de 48 GB mediante llama.cpp, manteniendo la calidad en tareas de codigo y agentes. El repositorio declara 291.376.817.904 parametros en los pesos safetensors del modelo base, aunque la model card del autor habla de 763B; esta discrepancia no queda aclarada en la informacion disponible.

La innovacion principal es el proceso de construccion: calibracion sobre codigo real, poda de expertos guiada por el enrutamiento que el modelo hace en tareas de codigo (conserva 200 de los 384 expertos por capa en las 40 capas) y una precision mixta por capa que asigna mas bits a las capas donde el codigo es mas sensible. Sobre esa base, el autor aplica lo que denomina Nace Weight Space Quantization, un agente (Claude Fable 5.2) que edita directamente los pesos cuantizados y valida cada cambio contra una referencia Q8 casi sin perdida.

El resultado declarado es un KL de 0,140 frente a la referencia Q8 en codigo real, con un 88,4% de coincidencia en el siguiente token, y 37 de 38 problemas resueltos en LiveCodeBench v6. Es relevante ahora porque demuestra que un modelo de escala frontier puede desplegarse en hardware de consumo con perdida acotada y medida, algo que hasta hace poco requeria multiples GPU de 80 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (384 expertos por capa, 40 capas, segun model card) |
| Parametros totales | 291.376.817.904 (safetensors); la model card indica 763B |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (valor usado en el comando de ejecucion de la model card) |
| Tipos de cuantizacion | IQ1_S (pesos principales), IQ4_NL (tabla Engram); referencia Q8 para evaluacion |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repo | 254,2 GB (71,8 GB pesos principales + 110,6 GB tabla Engram) |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash-1017 |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de 40 capas y 384 expertos por capa, segun detalla la model card. La cuantizacion no se limita a reducir bits de forma uniforme: primero poda los expertos que el modelo apenas usa en codigo, conservando 200 por capa que cubren el 90% del enrutamiento en tareas de codigo. Despues asigna precision mixta por capa, puntuando cada experto por frecuencia de activacion, peso del router y coste de redondeo, y dando mas bits a las 16 capas mas sensibles al codigo.

La fase final, Nace Weight Space Quantization, emplea un agente con herramientas de lectura, navegacion, cuantizacion y verificacion para reescribir la disposicion de los pesos. Cada edicion se mide contra una referencia Q8 casi sin perdida y solo se conservan las que mejoran la metrica; el autor reporta que esta fase redujo el KL en codigo de 0,142 a 0,140 sin cambiar el tamano de 71,8 GB. No se detalla en la informacion disponible el numero de tokens de entrenamiento del modelo base, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de codigo y resolucion de problemas de programacion competitiva: 37 de 38 problemas de LiveCodeBench v6 resueltos.
- Tareas agenticas sobre repositorios reales: la calibracion se hizo con agentes que corrigen repositorios, soluciones de concurso y commits.
- Razonamiento multi-paso orientado a codigo, segun el enfoque de calibracion del autor.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y uso conversacional (tag `conversational`).
- Ejecucion local en llama.cpp con soporte de tabla Engram externa.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision, audio o modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de codigo en local para desarrolladores con un solo Mac de 48 GB: el modelo cabe en 71,8 GB de pesos mas la tabla Engram en disco y se sirve con `llama-server`, lo que permite autocompletado y generacion sin depender de la nube.
- Correccion automatica de repositorios: dado que la calibracion se hizo sobre agentes que arreglan repositorios reales, encaja en pipelines que reciben un issue y proponen un parche.
- Resolucion de problemas de programacion competitiva: los 37 de 38 de LiveCodeBench v6 lo hacen util para entrenamiento y evaluacion de tecnicas de razonamiento en codigo.
- Generacion de tests y refactorizacion en entornos con requisitos de privacidad: al ejecutarse localmente, el codigo no sale de la maquina, lo que sirve para bases de codigo propietarias.
- Prototipado de agentes de codigo en investigacion: la licencia MIT y el formato GGUF facilitan experimentar con cuantizaciones extremas sin ataduras comerciales.
- Servicio de completado en CI/CD con latencia tolerante: con contexto de 32.768 tokens puede procesar archivos y diffs grandes, aunque el throughput en hardware de consumo sera limitado.

## Benchmarks y rendimiento

| Metrica | Resultado | Referencia |
|---|---|---|
| KL en codigo real (held-out) | 0,140 | 0,161 para EXL3 a 124 GB |
| Coincidencia de siguiente token con Q8 | 88,4% | no disponible |
| LiveCodeBench v6 (problemas resueltos) | 37 de 38 | igual que ISTA Coder en las mismas dos semillas |
| Tamano de pesos | 71,8 GB | 124 GB para EXL3 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos principales: 71,8 GB en GGUF IQ1_S; la tabla Engram ocupa 110,6 GB adicionales en `engram/` y se carga como archivo aparte.
- VRAM/RAM estimada: el autor indica que funciona en un unico Mac de 48 GB; con la tabla Engram completa el consumo de memoria es mayor y no se detalla en la informacion disponible.
- GPU recomendadas: no disponible; el unico hardware confirmado es un Mac de 48 GB.
- Cabe en GPU de consumo: no confirmado; un modelo de 71,8 GB no cabe en GPUs de 24 GB y requeriria offload a RAM o configuraciones de 80 GB o mas.
- Despliegue: llama.cpp mediante `llama-server`, con flag `--ple` para la tabla Engram y `-c 32768`. Compatible con endpoints segun los tags.
- Parametros de muestreo recomendados: temperatura 1,0 y top_p 1,0.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano de pesos | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek V4.1 Flash Coding (este) | 291B (safetensors) / 763B (model card) | 32.768 | 71,8 GB + 110,6 GB Engram | MIT | Cuantizacion IQ1_S con poda de expertos |
| DeepSeek V4.1 Flash 1017 (base) | 763B | no disponible | no disponible | MIT | Modelo original sin cuantizar |
| EXL3 (referencia citada) | mismo base | no disponible | 124 GB | no disponible | KL 0,161 en codigo |
| ISTA Coder (referencia citada) | no disponible | no disponible | no disponible | no disponible | Mismo resultado en LiveCodeBench v6 |

## Limitaciones y advertencias

- La cuantizacion IQ1_S es extremadamente agresiva (1 bit por peso en promedio); el KL de 0,140 se midio solo en codigo, por lo que el rendimiento en otros dominios puede degradarse sin que se reporte.
- La poda de expertos descarta 184 de 384 expertos por capa; el autor afirma que conserva el 90% del enrutamiento en codigo, pero no hay datos sobre el impacto en tareas no relacionadas con programacion.
- Discrepancia entre los 291.376.817.904 parametros de safetensors y los 763B de la model card; conviene verificar antes de planificar recursos.
- La tabla Engram de 110,6 GB es imprescindible para el comando de ejecucion documentado y duplica con creces el tamano de los pesos principales.
- No hay informacion sobre sesgos, riesgo de alucinacion, idiomas soportados ni evaluaciones de seguridad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es una publicacion reciente sin validacion independiente de la comunidad.
- Licencia MIT, lo que permite uso comercial, pero el modelo base y sus pesos derivados pueden arrastrar obligaciones adicionales no detalladas en la informacion disponible.
- El proceso de cuantizacion depende de un agente propietario (Claude Fable 5.2) y no es reproducible con herramientas abiertas segun la informacion proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/DeepSeek-V4.1-Flash-Coding-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Sitio del autor: https://www.nace.ai/
- Licencia MIT incluida en el repositorio (`LICENSE`).
