# Jundot/DeepSeek-V4.1-Flash-1017-oQ2h-mtp

## Resumen

DeepSeek-V4.1-Flash-1017-oQ2h-mtp es una cuantizacion mixta de precision del checkpoint DeepSeek-V4.1-Flash-1017, un modelo de lenguaje y vision de tipo mixture-of-experts (MoE) desarrollado por DeepSeek. El autor de esta version cuantizada es Jundot, que la publica bajo licencia MIT. El modelo base es una actualizacion menor de DeepSeek-V4.1-Flash con mejoras en razonamiento, codigo, tareas agenticas y vision. Esta variante esta pensada para ejecutarse con la libreria MLX en hardware Apple Silicon.

El modelo completo combina tres componentes: un backbone de lenguaje MoE de 551.566B parametros logicos, unas tablas Engram de n-gramas de 196.929B parametros y un modulo de prediccion multi-token (MTP) de 14.225B parametros, ademas de un codificador visual de 0.485B. En total, el checkpoint cuantizado almacena 763.205B parametros logicos en 313 GB (291.5 GiB), con una media efectiva de 3.281 bits por peso.

La relevancia de esta ficha es doble: por un lado documenta un modelo frontera de razonamiento y vision de gran escala; por otro, ilustra una tecnica de cuantizacion mixta (oQh) que reduce la divergencia KL respecto al checkpoint original en torno a un tercio frente al formato oQe a igual tamano, lo que permite desplegar un modelo de este calibre en entornos con memoria unificada limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) vision-lenguaje con tablas Engram y cabeza MTP |
| Parametros totales | 763.205B logicos en el checkpoint cuantizado (551.566B backbone + 196.929B Engram + 14.225B MTP + 0.485B vision) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQh mixta: 2-bit y 3-bit row scale, Engram affine 4-bit grupo 32, affine 8-bit grupo 64, MXFP4/MXFP8, BF16 y FP32; media efectiva 3.281 bits/peso |
| Idiomas soportados | no disponible (la model card menciona prompts de evaluacion en 7 idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), formato oQh |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE multimodal con un backbone de lenguaje de 551.566B parametros logicos, un codificador visual de 0.485B y una cabeza de prediccion multi-token (MTP) de 14.225B. Incorpora ademas tablas Engram de n-gramas de 196.929B parametros, un componente que almacena representaciones de n-gramas y que en esta cuantizacion se guarda en affine 4-bit con grupos de 32. El checkpoint incluye el modelo de lenguaje, las tablas Engram, el codificador visual y la cabeza MTP.

La cuantizacion oQh aplica una transformacion de Hadamard a los pesos de los expertos antes de cuantizarlos, de modo que los pesos rotados necesitan menos escalas y el espacio ahorrado se reinvierte en mas bits en las zonas mas sensibles. Las proyecciones de atencion y los expertos compartidos se mantienen en 8-bit affine (grupo 64), mientras que el embedding de tokens, la cabeza de salida, el router y la proyeccion de salida de atencion wo_a se conservan en BF16. La cabeza MTP mantiene los formatos FP4 y FP8 de origen, y el codificador visual permanece en BF16. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento: la model card indica mejoras del modelo base en tareas de razonamiento.
- Generacion de codigo: evaluado con fuentes Python en la comparativa de cuantizacion, con mejoras declaradas en tareas de codigo.
- Capacidades agenticas: el modelo base incorpora mejoras en tareas agenticas y de multiples pasos.
- Vision: es un modelo image-text-to-text con codificador visual propio; procesa imagenes junto con texto.
- Prediccion multi-token (MTP): incluye una cabeza MTP de 14.225B parametros que permite decodificacion especulativa y generacion de varios tokens por paso.
- Multilinguismo: la evaluacion de cuantizacion usa FLORES+ y Aya con prompts en 7 idiomas, lo que sugiere cobertura multilingue, aunque no se detalla la lista de idiomas.
- Tool calling / function calling: no disponible en la informacion proporcionada.

## Casos de uso

- Razonamiento asistido en local sobre Apple Silicon: el checkpoint esta disenado para MLX y oMLX 0.8.0 o superior, por lo que permite ejecutar un modelo MoE de gran escala en equipos con memoria unificada amplia para tareas de analisis y sintesis de documentos largos.
- Generacion y revision de codigo: dado que el modelo base declara mejoras en codigo y la evaluacion de cuantizacion incluye fuentes Python, encaja en asistentes de programacion que necesiten contexto amplio y coherencia entre archivos.
- Analisis de documentos con imagenes: al ser image-text-to-text, puede extraer informacion de capturas, graficos o diagramas combinados con texto para tareas de documentacion tecnica.
- Flujos agenticos multi-paso: las mejoras declaradas en tareas agenticas y la cabeza MTP permiten construir agentes que planifiquen y ejecuten pasos encadenados con generacion acelerada.
- Prototipado de investigacion en cuantizacion: el checkpoint sirve para estudiar el impacto de la cuantizacion mixta oQh frente a oQe a igual tamano, comparando la divergencia KL en distintos dominios.
- Evaluacion multilingue: con prompts en 7 idiomas en FLORES+ y Aya, es util para probar traduccion y generacion multilingue en entornos locales.
- Despliegue en estaciones de trabajo con memoria unificada: al ocupar 291.5 GiB, requiere equipos de gama alta con memoria unificada suficiente, lo que lo hace adecuado para laboratorios y equipos de investigacion mas que para portatiles convencionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente proporciona metricas de divergencia KL de la cuantizacion respecto al checkpoint original (FP4 en expertos enrutados, FP8 en el resto), donde menor es mejor:

| Nivel | Tamano | FLORES+ KL, oQe -> oQh | Aya KL, oQe -> oQh | Codigo KL, oQe -> oQh |
|---|---|---|---|---|
| oQ2 | 284.0 GiB | 0.59 -> 0.40 (-32%) | 0.20 -> 0.14 (-31%) | 0.16 -> 0.11 (-32%) |
| oQ2.5 | 311.4 GiB | 0.43 -> 0.28 (-34%) | 0.14 -> 0.084 (-38%) | 0.11 -> 0.068 (-38%) |
| oQ3 | 347.3 GiB | 0.26 -> 0.23 (-9%) | 0.060 -> 0.051 (-15%) | 0.056 -> 0.047 (-16%) |

El checkpoint publicado corresponde al nivel oQ2h, con 291.5 GiB excluyendo la cabeza MTP en la comparativa de tamanos.

## Requisitos de hardware

- VRAM/memoria estimada: 291.5 GiB (313 GB) para el checkpoint completo en formato oQh; el backbone de lenguaje ocupa 168.36 GiB, las tablas Engram 114.75 GiB, el codificador visual 0.90 GiB y la cabeza MTP 7.50 GiB.
- GPU recomendadas: no disponible en la informacion proporcionada; el modelo esta empaquetado para MLX, orientado a hardware Apple Silicon con memoria unificada.
- Compatibilidad con GPU de consumo: no cabe en GPU de consumo convencionales (24 GB o 48 GB); requiere equipos con memoria unificada o agregada de al menos ~292 GiB.
- Opciones de despliegue: oMLX 0.8.0 o superior con soporte oQh; versiones anteriores de oMLX no pueden cargarlo. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-oQ2h-mtp (este) | 763.205B logicos (551.566B backbone) | no disponible | MIT | safetensors MLX oQh | Cuantizacion mixta 3.281 bits/peso, 291.5 GiB |
| DeepSeek-V4.1-Flash-1017 (base) | 552B en el LM + Engram + MTP | no disponible | MIT | safetensors | Checkpoint original FP4/FP8, mayor tamano |
| DeepSeek-V4.1-Flash (oQe, referencia de cuantizacion) | mismo backbone | no disponible | MIT | safetensors MLX oQe | Mismo tamano que oQh a igual nivel, mayor KL |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Requiere oMLX 0.8.0 o superior con soporte oQh; versiones anteriores no pueden cargar el checkpoint.
- El formato oQh esta disenado especificamente para oMLX, lo que limita la portabilidad a otros motores de inferencia MLX.
- El tamano de 291.5 GiB exige hardware con memoria unificada muy amplia; no es desplegable en GPU de consumo ni en la mayoria de servidores convencionales.
- La cuantizacion introduce divergencia respecto al modelo original: la KL es de 0.40 en FLORES+, 0.14 en Aya y 0.11 en codigo para el nivel oQ2h, por lo que puede degradar tareas sensibles frente al checkpoint sin cuantizar.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad en la informacion proporcionada.
- No se detalla la lista de idiomas soportados ni la longitud de contexto, lo que dificulta planificar despliegues multilingues o con contextos largos.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento originales.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/Jundot/DeepSeek-V4.1-Flash-1017-oQ2h-mtp
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Repositorio oMLX: https://github.com/jundot/omlx
- Pull request del formato oQh: https://github.com/jundot/omlx/pull/5317
