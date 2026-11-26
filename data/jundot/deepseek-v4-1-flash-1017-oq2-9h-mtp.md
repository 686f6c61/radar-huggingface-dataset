# Jundot/DeepSeek-V4.1-Flash-1017-oQ2.9h-mtp

## Resumen

DeepSeek-V4.1-Flash-1017-oQ2.9h-mtp es una cuantizacion mixta de precision del checkpoint deepseek-ai/DeepSeek-V4.1-Flash-1017, publicada por el usuario Jundot dentro del ecosistema oMLX. Se trata de un modelo de lenguaje y vision de tipo mixture-of-experts (MoE) con 552B parametros en el backbone linguistico, 197B adicionales en tablas Engram de n-gramas, 14B en un modulo de prediccion multi-token (MTP) y un codificador visual de 0,485B. El checkpoint completo suma 763.205B parametros logicos almacenados en 344,24 GiB.

La relevancia de esta ficha no esta en el modelo base, sino en la tecnica de cuantizacion: el formato oQh aplica una transformada de Hadamard a los pesos de los expertos antes de cuantizarlos, lo que reduce el numero de escalas necesarias y permite invertir el espacio ahorrado en mas bits para los tensores mas sensibles. El resultado es un checkpoint del mismo tamano que el formato oQe equivalente pero con menor divergencia KL respecto al original (hasta un 38% menos en algunas metricas).

El checkpoint esta disenado especificamente para el Apple M5 Ultra con 256 GB de memoria unificada y requiere oMLX 0.8.0 o superior con soporte oQh. No es un modelo para GPU convencionales ni para despliegues en la nube con vLLM o TGI: es una pieza de inferencia local en hardware Apple Silicon de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) vision-lenguaje con tablas Engram y modulo MTP |
| Parametros totales | 763.205B logicos (552B backbone + 197B Engram + 14B MTP + 0,485B vision) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQh mixta (3-bit y 4-bit row scale), Engram affine 4-bit grupo 32, MXFP4 grupo 32, affine 8-bit grupo 64, BF16, MXFP8 grupo 32, FP32 |
| Idiomas soportados | no disponible (la model card menciona prompts en 7 idiomas para evaluacion KL, sin listarlos) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), formato oQh |
| Bits efectivos por peso | 3,443 en el backbone linguistico; 3,874 en el checkpoint completo |
| Tamano del repositorio | 369,6 GB (344,24 GiB) |
| Libreria | mlx |
| Hardware objetivo | Apple M5 Ultra con 256 GB de memoria unificada |

## Arquitectura y entrenamiento

El modelo base es un MoE multimodal con un backbone linguistico de 552B parametros, un modulo de vision de 0,485B, un cabezal MTP de 14B y un componente poco habitual: tablas Engram de n-gramas de 197B parametros. Las tablas Engram ocupan el 25,8% de los pesos logicos y se almacenan en este checkpoint en affine 4-bit con grupos de 32 (5,00 bits efectivos por peso). El modulo MTP conserva los formatos originales FP4 y FP8 del checkpoint fuente, y el codificador visual permanece en BF16.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card solo indica que DeepSeek-V4.1-Flash-1017 es una actualizacion menor de DeepSeek-V4.1-Flash con mejoras en razonamiento, codigo, tareas agenticas y vision.

La innovacion tecnica de esta publicacion es la cuantizacion oQh: antes de cuantizar los pesos de los expertos enrutados se aplica una transformada de Hadamard, que rota los pesos y reduce el numero de escalas necesarias. El espacio liberado se reinvierte en codigos mas anchos para los tensores mas sensibles. Las proyecciones de atencion y los expertos compartidos quedan en 8-bit affine con grupos de 64; el embedding de tokens, el cabezal de salida, el router y la proyeccion de salida de atencion wo_a se mantienen en BF16. La distribucion resultante: 48,1% de los pesos en oQh 3-bit, 23,1% en oQh 4-bit, 25,8% en Engram 4-bit y el resto en formatos de mayor precision.

## Capacidades

- Generacion de texto y razonamiento, con mejoras declaradas en tareas de razonamiento respecto a DeepSeek-V4.1-Flash.
- Generacion de codigo, evaluada en la model card con fuentes Python para medir divergencia KL.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con codificador visual en BF16.
- Prediccion multi-token (MTP) mediante cabezal dedicado de 14B parametros, orientado a decodificacion especulativa.
- Capacidades agenticas y de multiples pasos, segun las mejoras declaradas en el modelo base.
- Soporte multilingue parcial: la evaluacion KL usa prompts en 7 idiomas (FLORES+ y Aya), aunque no se listan cuales.
- Tool calling y function calling: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en estaciones de trabajo Apple: el checkpoint esta calibrado para un M5 Ultra con 256 GB de memoria unificada, de modo que un desarrollador puede ejecutar un MoE de 552B en local sin infraestructura de GPU. Es el caso de uso principal y practicamente el unico soportado por el formato oQh.
- Evaluacion de tecnicas de cuantizacion: investigadores que comparan oQe frente a oQh pueden usar este checkpoint para medir divergencia KL en FLORES+, Aya y codigo Python, con datos de referencia ya publicados en la model card.
- Procesamiento de documentos con imagen y texto: al incluir codificador visual, sirve para tareas de extraccion y descripcion sobre capturas, diagramas o documentos escaneados, siempre que el contexto lo permita.
- Desarrollo de agentes con decodificacion especulativa: el cabezal MTP permite acelerar la generacion en entornos oMLX, util para prototipar pipelines agenticos de multiples pasos en local.
- Analisis de codigo en local: la evaluacion en fuentes Python sugiere uso para revision, generacion y explicacion de codigo en entornos con requisitos de privacidad, sin enviar codigo a la nube.
- Experimentacion multilingue: los prompts de evaluacion en 7 idiomas permiten probar traduccion y generacion multilingue, aunque sin garantias documentadas sobre cobertura idiomatica completa.
- Pruebas de regresion de motores MLX: al ser un checkpoint oQh que exige oMLX 0.8.0 o superior, sirve como caso de prueba para validar el soporte oQh en nuevas versiones del motor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card unicamente aporta divergencia KL respecto al checkpoint original, que mide fidelidad de la cuantizacion, no calidad absoluta del modelo.

Divergencia KL respecto al original (menor es mejor), comparando oQe frente a oQh al mismo nivel de tamano:

| Nivel | Tamano | Sin Engram | FLORES+ KL (oQe -> oQh) | Aya KL (oQe -> oQh) | Codigo KL (oQe -> oQh) |
|---|---|---|---|---|---|
| oQ2 | 291,5 GiB | 176,8 GiB | 0,59 -> 0,40 (-32%) | 0,20 -> 0,14 (-31%) | 0,16 -> 0,11 (-32%) |
| oQ2.5 | 318,9 GiB | 204,2 GiB | 0,43 -> 0,28 (-34%) | 0,14 -> 0,084 (-38%) | 0,11 -> 0,068 (-38%) |
| oQ2.7 | 329,5 GiB | 214,7 GiB | 0,27 | 0,069 | no disponible |
| oQ2.9 | 344,2 GiB | 229,5 GiB | 0,25 | 0,058 | no disponible |
| oQ3 | 354,8 GiB | 240,0 GiB | 0,26 -> 0,23 (-9%) | 0,060 -> 0,051 (-15%) | 0,056 -> 0,047 (-16%) |

## Requisitos de hardware

- Memoria: el checkpoint ocupa 344,24 GiB en disco; la inferencia requiere un equipo con memoria unificada suficiente para cargar los pesos y el estado de ejecucion. El autor lo optimiza para un M5 Ultra con 256 GB, lo que implica que parte de los pesos debe gestionarse con swap o carga por capas.
- GPU: no aplica en el sentido convencional; esta disenado para Apple Silicon. No hay soporte documentado para A100, H100 ni RTX 4090.
- GPU de consumo: no cabe en ninguna GPU de consumo actual por el tamano del checkpoint (344 GiB).
- Despliegue: exclusivamente oMLX 0.8.0 o superior con soporte oQh. Las versiones anteriores de oMLX no pueden cargarlo. No se documenta compatibilidad con llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-oQ2.9h-mtp (este) | 763,2B logicos (552B backbone) | no disponible | oQh safetensors, 3,874 bits/peso | MIT | Apple M5 Ultra 256 GB, oMLX 0.8.0+ |
| DeepSeek-V4.1-Flash-1017-oQ2.9e (mismo nivel, formato oQe) | 763,2B logicos | no disponible | oQe safetensors, mismo tamano | MIT | Cualquier motor MLX compatible |
| DeepSeek-V4.1-Flash-1017 (original) | 763,2B logicos | no disponible | FP4/FP8/BF16 | MIT | Infraestructura de gran escala |
| DeepSeek-V4.1-Flash (base anterior) | no disponible | no disponible | no disponible | MIT (presumible, no confirmado) | no disponible |

La comparativa directa mas relevante es contra el checkpoint oQe del mismo nivel: mismo tamano en disco, menor divergencia KL en oQh, pero con la restriccion de requerir oMLX 0.8.0 o superior. Frente al modelo original sin cuantizar, la diferencia esta en el requisito de hardware: el original no cabe en una estacion de trabajo.

## Limitaciones y advertencias

- Dependencia estricta de oMLX 0.8.0 o superior con soporte oQh; versiones anteriores no cargan el checkpoint y no hay soporte documentado para otros motores.
- Requiere hardware Apple Silicon de gama muy alta (M5 Ultra, 256 GB); no es desplegable en GPU convencionales ni en la nube con los motores habituales.
- La cuantizacion a 3,443 bits/peso efectivos en el backbone introduce divergencia respecto al original, cuantificada en KL pero no traducida a benchmarks de tareas.
- No hay informacion sobre sesgos, riesgo de alucinacion ni evaluaciones de seguridad del modelo base en la informacion proporcionada.
- Cobertura idiomatica no documentada: solo se mencionan 7 idiomas en la evaluacion KL sin especificarlos.
- Longitud de contexto no disponible, lo que impide planificar casos de uso con documentos largos.
- Numero de descargas y likes nulo en el momento de la consulta (0 y 0), lo que indica ausencia de validacion por parte de la comunidad.
- Licencia MIT heredada del modelo base, permisiva para uso comercial, pero el autor no aporta garantias adicionales sobre el checkpoint cuantizado.
- El repositorio es de 369,6 GB, lo que exige almacenamiento considerable y tiempos de descarga largos.

## Enlaces

- Hugging Face: https://huggingface.co/Jundot/DeepSeek-V4.1-Flash-1017-oQ2.9h-mtp
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Repositorio oMLX: https://github.com/jundot/omlx
- Pull request del formato oQh: https://github.com/jundot/omlx/pull/5317
