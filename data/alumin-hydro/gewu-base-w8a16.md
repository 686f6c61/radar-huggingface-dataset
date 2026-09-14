# Alumin-Hydro/Gewu-Base-W8A16

## Resumen

Gewu-Base-W8A16 es un checkpoint cuantizado en 8 bits del modelo Qwen/Qwen3.5-9B, publicado por el usuario Alumin-Hydro como parte del sistema de tutoria de fisica "Gewu", descrito en el informe *Gewu: Building, Enhancing, and Evaluating a Tool-Augmented 9B Physics Tutoring System* (Feng, Z., 2026). No se trata de un modelo entrenado desde cero ni de un ajuste fino, sino de la redistribucion cuantizada de los pesos base que da servicio a los dos niveles de despliegue del sistema: el nivel por defecto monta en caliente el adaptador LoRA `Alumin-Hydro/Gewu-SFT` sobre este fichero, mientras que el nivel de mejora ejecuta el fichero solo, generando ocho muestras y aplicando una votacion.

El checkpoint contiene 8.953.803.264 parametros, ocupa 11,1 GB en el repositorio y se distribuye en formato `compressed-tensors` con esquema GPTQ W8A16 (pesos int8, activaciones de 16 bits). Es un modelo exclusivamente de texto: la arquitectura declarada es `Qwen3_5ForCausalLM` con 32 capas y no incluye el codificador de vision de la release original. Los idiomas soportados son chino e ingles.

Su relevancia practica es doble. Por un lado, demuestra que una cuantizacion calibrada con el propio dominio de uso (384 problemas de GewuBank-20K en lugar de un corpus generico) puede mantener la precision dentro del ruido estadistico: el articulo reporta +1,9 puntos porcentuales frente a los pesos de 16 bits sin adaptador y +2,5 con el adaptador en su conjunto de evaluacion dificil. Por otro, ofrece numeros de despliegue concretos en hardware de consumo: una unica RTX 3090 de 24 GB sostiene 28 sesiones concurrentes a 8k de contexto y decodifica a unos 58 tokens por segundo en un solo flujo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de tipo `Qwen3_5ForCausalLM`, 32 capas; incluye 49 submodulos de atencion lineal que se conservan en bfloat16 (no disponibles los detalles de atencion completa, numero de cabezas o uso de GQA) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible en la informacion proporcionada; el articulo mide despliegue a 8k y 32k de contexto |
| Tipos de cuantizacion | GPTQ W8A16: pesos int8, activaciones de 16 bits, grupo de tamano 128, simetrico, orden de activacion estatico, dampening 0,01; todos los `Linear` excepto `lm_head`; 49 submodulos de atencion lineal en bfloat16 |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache-2.0 (los problemas de calibracion de GewuBank-20K son CC BY 4.0) |
| Formato de pesos | safetensors en formato `compressed-tensors` `pack-quantized`; se incluye `recipe.yaml` y `SHA256SUMS.txt` |
| Tamano del repositorio | 11,1 GB |
| Modelo base | Qwen/Qwen3.5-9B (relacion: quantized) |
| Compatibilidad de servidor | vLLM 0.27.1 (carga directa del formato) |

## Arquitectura y entrenamiento

Este repositorio no aporta entrenamiento propio: es una cuantizacion post-entrenamiento de Qwen3.5-9B. La receta, ejecutada con `llm-compressor`, aplica GPTQ con esquema W8A16 sobre todos los modulos `Linear` salvo `lm_head`, con grupo de 128, cuantizacion simetrica y orden de activacion estatico. Un detalle tecnico relevante es la lista `ignore` de `config.json`, que mantiene 49 submodulos de atencion lineal en bfloat16; esto apunta a una arquitectura hibrida en la que parte de las capas usan atencion lineal y no admiten bien la cuantizacion agresiva, aunque la model card no describe la arquitectura completa del modelo base.

La innovacion mas destacable esta en los datos de calibracion. En lugar de emplear un corpus de texto generico, se usaron 384 problemas extraidos de GewuBank-20K (semilla 0, renderizados con la plantilla de chat y truncados a 2048 tokens), es decir, la propia distribucion de trabajo del modelo. El articulo somete el resultado a una puerta de calidad preinscrita (perder como maximo 3 puntos porcentuales en el conjunto dificil, p-valor apareado > 0,05 y ausencia de deriva en la tasa de llamadas a herramientas o de terminacion), que el checkpoint supera: +1,9 puntos porcentuales frente a los pesos de 16 bits sin adaptador y +2,5 con el adaptador, ambos dentro del suelo de ruido.

El sistema completo separa el modelo de las herramientas: el sandbox de SymPy y la votacion por muestreo viven fuera del checkpoint y se describen en el articulo. El adaptador `Alumin-Hydro/Gewu-SFT` se monta en caliente mediante la carpeta `vllm/` de ese repositorio, que contiene la disposicion de claves solo-texto; el articulo verifica que la forma montada en caliente es equivalente a los pesos fusionados en el nivel por defecto.

## Capacidades

- Generacion de texto y conversacion multi-turno en chino e ingles (pipeline `text-generation`, etiqueta `conversational`).
- Dominio especifico de fisica: el fichero esta pensado como base de un sistema de tutoria con aumento de herramientas, y su calibracion se hizo sobre problemas de fisica.
- Razonamiento paso a paso: el parser de razonamiento indicado en el comando de servicio (`--reasoning-parser qwen3`) implica soporte de bloques de razonamiento separados de la respuesta final.
- Llamada a herramientas y function calling: el despliegue recomendado activa `--enable-auto-tool-choice` con `--tool-call-parser qwen3_xml`, y el articulo monitoriza explicitamente la tasa de llamadas a herramientas.
- Uso como base para adaptadores LoRA: el caso principal de despliegue es el montaje en caliente de `Alumin-Hydro/Gewu-SFT` con rango maximo 32.
- Modo de mejora por muestreo: el nivel superior ejecuta el modelo solo, genera ocho muestras y decide por votacion (la votacion es externa al modelo).
- Capacidades de vision: no disponibles; el codificador de vision de la release original no esta incluido en este checkpoint.
- Capacidades de audio: no disponibles.

## Casos de uso

- Tutoria de fisica multi-turno en aulas o plataformas educativas: el modelo mantiene conversaciones largas sobre problemas de fisica y puede combinarse con el adaptador Gewu-SFT para el nivel de atencion directa al estudiante, con el contexto gestionado por el pool de KV de vLLM.
- Resolucion asistida de problemas con verificacion simbolica: el modelo propone el planteamiento y las expresiones, y un sandbox de SymPy externo (descrito en el articulo) valida los resultados numericos y algebraicos antes de devolver la respuesta.
- Autocorreccion por muestreo y votacion en el nivel de mejora: se lanzan ocho generaciones independientes sobre el mismo enunciado y se agregan por votacion, lo que permite aumentar la fiabilidad en problemas de respuesta cerrada a costa de mas computo.
- Despliegue en una sola GPU de consumo para un laboratorio o departamento: con 11 GB de pesos mas el adaptador cabe en una RTX 3090 de 24 GB y sostiene 28 sesiones concurrentes a 8k de contexto, lo que cubre un aula pequena o un piloto interno sin infraestructura dedicada.
- Servicio con dos niveles sobre el mismo fichero de pesos: al solicitar `model=gewu` se activa el adaptador y al solicitar `model=gewu-base` se sirve el modelo base, de modo que un unico proceso de vLLM atiende tanto el flujo rapido como el flujo de alta precision, ahorrando VRAM frente a mantener dos modelos.
- Generacion de material didactico y bancos de problemas: el modelo puede producir enunciados y soluciones de fisica en chino o ingles que despues se revisan y se incorporan a un banco de ejercicios.
- Evaluacion automatica de respuestas de estudiantes: dada una solucion propuesta, el modelo puede descomponerla, senalar el paso erroneo y justificar la correccion, apoyandose en el parser de razonamiento para separar el analisis de la conclusion.
- Investigacion en cuantizacion aplicada a dominios cientificos: el par de repositorios (base cuantizado y su version fusionada con el ajuste) permite reproducir la puerta de calidad del articulo y comparar estrategias de calibracion especificas de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El articulo si reporta medidas de la propia puerta de cuantizacion y de despliegue, que se recogen a continuacion tal cual aparecen:

| Medida reportada | Resultado |
|---|---|
| Delta de precision, modelo base con adaptador desactivado (W8A16 frente a 16 bits) | +1,9 puntos porcentuales |
| Delta de precision, con adaptador activado (W8A16 frente a 16 bits) | +2,5 puntos porcentuales |
| Puerta de cuantizacion preinscrita (perder <= 3 pp, p apareado > 0,05, sin deriva en llamadas a herramientas ni terminacion) | Superada |
| Equivalencia entre adaptador montado en caliente y pesos fusionados | Equivalente en el nivel por defecto |
| Decodificacion en un solo flujo (RTX 3090, vLLM 0.27.1) | ~58 tokens por segundo |
| Pool de KV a 8k de contexto | ~230.000 tokens, 28 sesiones concurrentes |
| Pool de KV a 32k de contexto | ~265.000 tokens, 8 sesiones concurrentes |

No se dispone de comparaciones con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: 11 GB de pesos mas el adaptador LoRA en el nivel por defecto (dato medido en el articulo); el repositorio ocupa 11,1 GB, de los cuales la practica totalidad son pesos int8.
- GPU validadas: RTX 3090 de 24 GB, segun el articulo, con el pool de KV indicado mas arriba.
- GPU recomendadas por capacidad: cualquier GPU con 24 GB o mas (RTX 3090, RTX 4090, A6000, L40S, A100, H100) es adecuada por tamano; no se han publicado medidas en el resto de estos modelos.
- Encaje en GPU de consumo: si, en RTX 3090 y en tarjetas de 24 GB equivalentes. No hay datos medidos para GPUs de 16 GB o menos; dado el tamano de pesos int8, un margen tan ajustado no esta verificado.
- Opciones de despliegue: vLLM 0.27.1 es el unico servidor validado explicitamente, cargando el formato `compressed-tensors` `pack-quantized` de forma directa. No se mencionan llama.cpp, Ollama, TGI ni otros runtimes, y el formato de pesos no es GGUF.
- Latencia y throughput medidos: aproximadamente 58 tokens por segundo en decodificacion de un unico flujo en una RTX 3090; no se publican cifras de throughput agregado bajo carga concurrente.

## Comparativa con modelos similares

No se dispone de datos de contexto, licencia o rendimiento de las alternativas en la informacion proporcionada, por lo que la comparacion se limita a lo declarado en este repositorio.

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gewu-Base-W8A16 | 8.953.803.264 | GPTQ W8A16, grupo 128 | No disponible | Apache-2.0 | HuggingFace, formato compressed-tensors para vLLM |
| Qwen/Qwen3.5-9B | No disponible en la informacion (es el modelo base) | 16 bits (referencia) | No disponible | Apache-2.0 segun la model card | HuggingFace |
| Alumin-Hydro/Gewu-SFT-W8A16 | No disponible | W8A16 con el ajuste fusionado | No disponible | No disponible en la informacion | HuggingFace; pensado para servir sin soporte de LoRA |
| Alumin-Hydro/Gewu-SFT | No disponible (adaptador LoRA, rango <= 32) | bfloat16 (adaptador) | No disponible | No disponible en la informacion | HuggingFace, carpeta `vllm/` para montaje en caliente |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la model card. Al derivar de Qwen3.5-9B y calibrarse solo con problemas de fisica en chino e ingles, es previsible que herede los sesgos del modelo base y que su comportamiento fuera de ese dominio este poco caracterizado.
- Riesgo de alucinacion: no se cuantifica. El sistema del articulo mitiga el riesgo de dos formas externas al modelo (sandbox de SymPy y votacion sobre ocho muestras), lo que sugiere que el autor no considera fiable la salida de una unica generacion sin verificacion.
- Limitaciones de idioma: solo chino e ingles. No hay datos de rendimiento en castellano ni en otras lenguas.
- Limitaciones de contexto: la longitud de contexto nominal no se especifica. Las unicas cifras disponibles son de despliegue a 8k y 32k, y el pool de KV medido implica que a 32k el numero de sesiones concurrentes cae de 28 a 8.
- Restricciones de licencia: los pesos se distribuyen bajo Apache-2.0, igual que el modelo base. Los problemas de calibracion proceden de GewuBank-20K, bajo CC BY 4.0, por lo que cualquier redistribucion o trabajo derivado deberia respetar la atribucion de esa fuente. La licencia de futuras releases derivadas debe verificarse de forma independiente.
- Advertencias para produccion: el formato `pack-quantized` requiere vLLM 0.27.1 o una version compatible con `compressed-tensors`; no es un GGUF y no se ha validado en runtimes alternativos. El modelo es solo texto: no incluye el codificador de vision de la release original, por lo que cualquier caso de uso multimodal requiere otro checkpoint.
- Estado del repositorio: cero descargas y cero "likes" en el momento de la consulta, y el articulo asociado es un informe de investigacion de un certamen escolar, no una publicacion revisada por pares. La validacion externa es limitada.
- Dependencia del adaptador: el rendimiento descrito en el nivel por defecto presupone el montaje de `Alumin-Hydro/Gewu-SFT` con el diseno de claves solo-texto de su carpeta `vllm/`; usar el adaptador de otra forma puede invalidar la equivalencia con los pesos fusionados.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/Alumin-Hydro/Gewu-Base-W8A16
- Adaptador LoRA del sistema: https://huggingface.co/Alumin-Hydro/Gewu-SFT
- Version fusionada y cuantizada, para servir sin LoRA: https://huggingface.co/Alumin-Hydro/Gewu-SFT-W8A16
- Corpus de calibracion: https://huggingface.co/Alumin-Hydro/GewuBank-20K
- Trazas del ajuste supervisado: https://huggingface.co/Alumin-Hydro/gewu-sft-traces
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Referencia del articulo: Feng, Z. (2026). "Gewu: Building, Enhancing, and Evaluating a Tool-Augmented 9B Physics Tutoring System". Informe de investigacion, Yau High School Science Award (Computer Science), 2026. No se ha encontrado URL de publicacion en la informacion disponible.
- La busqueda web realizada no ha devuelto ningun enlace relevante sobre este modelo: los resultados obtenidos corresponden a noticias sin relacion con el tema.
