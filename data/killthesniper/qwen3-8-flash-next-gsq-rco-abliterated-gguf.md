# KilltheSniper/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF

## Resumen

Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF es una compilacion en formato GGUF del modelo Qwen3.8-Flash-Next, publicada por el usuario KilltheSniper sobre las cuantizaciones oficiales GSQ-RCO de ISTA-DASLab. Se trata de un transformer de tipo mixture-of-experts (MoE) con 176.943.899.520 parametros totales (unos 177 mil millones), 48 capas y una ventana de contexto declarada de 262.000 tokens, con pipeline image-text-to-text (acepta imagenes ademas de texto).

Su particularidad no es el entrenamiento, sino el post-procesado: es una version "abliterated", es decir, con la direccion de rechazo eliminada, obtenida mediante el transplante de 144 tensores de proyeccion hacia el flujo residual (write-to-residual-stream) en las 48 capas. Esos tensores se sustituyen por los de un release abliterado ya existente, sin recalcular los valores ni las escalas aprendidos por la cuantizacion GSQ y restaurando exactamente la asignacion de tipos por tensor del modelo original.

Es relevante para equipos que necesitan ejecutar localmente un modelo MoE de gran tamano y contexto largo con restricciones de censura reducidas, para investigacion en red-teaming, evaluacion de seguridad o generacion sin filtros de rechazo. El repositorio tiene licencia Apache 2.0, ocupa 215,7 GB y, en el momento de la ficha, registra 0 descargas y 0 likes, por lo que no existe validacion de la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture-of-experts) sobre transformer; 48 capas; pipeline image-text-to-text |
| Parametros totales | 176.943.899.520 (~177 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.000 tokens (262K) segun la model card |
| Tipos de cuantizacion | GGUF: IQ3_S, IQ3_XXS, IQ2_XS y Q2_0 (con imatrix) |
| Idiomas soportados | ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); repo de 215,7 GB |
| Tamano por cuantizacion | Q2_0: 38,0 GB; IQ3_S: 55,1 GB; IQ3_XXS e IQ2_XS: no disponible |
| Modelo base | ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF (relacion: quantized) |
| Autor del repo | KilltheSniper |
| Fecha de publicacion | 2026-10-05 |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer MoE de 177.000 millones de parametros organizado en 48 capas, con capacidad multimodal de entrada (image-text-to-text) y contexto largo de 262.000 tokens. Sobre ese modelo, ISTA-DASLab aplico una cuantizacion aprendida (GSQ) que fija valores y escalas, seguida de una asignacion de tipos por tensor con restriccion de presupuesto de tamano (RCO). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO: esos datos no estan disponibles en la informacion proporcionada.

La innovacion de este repositorio concreto es el metodo de abliteracion por transplante: en lugar de recalcular la cuantizacion, se sustituyen 144 tensores (los que escriben en el flujo residual) por los equivalentes de un release abliterado ya existente, preservando integramente los valores y escalas aprendidos por GSQ y la asignacion de tipos por tensor del upstream. El build IQ3_S esta verificado tensor a tensor con blake2b, de modo que solo cambian los tensores previstos. Segun la model card, cada nivel de cuantizacion anade solo entre 0,25 y 0,44 GB respecto al modelo original.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento y cadenas de razonamiento (etiqueta reasoning en el repositorio).
- Procesamiento de contexto largo, hasta 262.000 tokens declarados, apto para documentos extensos.
- Entrada multimodal image-text-to-text: acepta imagenes junto con texto (pipeline declarado).
- Respuestas con rechazo reducido (abliterated/uncensored), orientadas a red-teaming y evaluacion de seguridad.
- Compatibilidad con endpoints (etiqueta endpoints_compatible) y ejecucion via llama.cpp.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Capacidades de agente multi-paso: no confirmadas en la informacion disponible.
- Idiomas distintos de ingles y chino: no disponibles.

## Casos de uso

- Analisis de documentacion extensa: con 262.000 tokens de contexto se pueden cargar contratos, expedientes o bases de codigo completas en una sola pasada sin troceado, aprovechando el razonamiento del modelo para resumir y extraer clausulas.
- Comprension de documentos con imagenes: al ser image-text-to-text, permite procesar informes escaneados, capturas de pantalla o graficos junto al texto asociado en un mismo prompt.
- Red-teaming y evaluacion de seguridad: al estar abliterado, sirve como modelo "atacante" o de referencia para medir la robustez de filtros de moderacion y de otros modelos alineados.
- Investigacion sobre abliteracion y cuantizacion: permite estudiar si el transplante de tensores degrada la coherencia en distintos niveles (Q2_0 frente a IQ3_S), comparando con el upstream sin abliterar.
- Generacion creativa sin filtros de rechazo: escritura de ficcion, dialogos o contenido editorial que otros modelos rechazarian por politicas de contenido, siempre bajo responsabilidad del operador.
- Traduccion y asistencia bilingue ingles-chino: par de idiomas soportado explicitamente, util para localizacion tecnica y atencion en esos dos mercados.
- Despliegue local en estaciones de trabajo o servidores con GPU de 48-80 GB: el formato GGUF y el rango de cuantizaciones de 38 a 55 GB permiten ejecucion on-premise sin depender de API externa.
- Recuperacion aumentada (RAG) sobre corpus grandes: la ventana de 262K reduce la necesidad de reordenar y recortar fragmentos, simplificando la fase de recuperacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales, y tampoco hay comparaciones cuantitativas con modelos de la misma categoria.

## Requisitos de hardware

- VRAM minima orientativa: Q2_0 ocupa 38,0 GB y IQ3_S 55,1 GB de pesos; hay que sumar la cache KV, que crece de forma lineal con el contexto y se vuelve muy relevante cerca de los 262K tokens.
- GPU de 48 GB (A6000, L40S) pueden alojar Q2_0 en VRAM; IQ3_S requiere GPU de 80 GB (A100 80 GB, H100 80 GB) o reparto entre varias GPU.
- Una RTX 4090 (24 GB) no puede alojar el modelo completo; es necesario descargar capas a CPU o RAM (offload) con llama.cpp, con la penalizacion de latencia correspondiente.
- Al ser MoE, el offload selectivo de expertos a CPU puede mantener un throughput aceptable, aunque no hay datos publicados de tokens por segundo en la informacion disponible.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, llama-cpp-python y servidores compatibles con endpoints. vLLM y TGI no estan confirmados para estos GGUF en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KilltheSniper/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF (este) | 177 mil millones | 262K | GGUF (Q2_0, IQ2_XS, IQ3_XXS, IQ3_S) | Apache 2.0 | 0 descargas, 0 likes |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF (upstream) | 177 mil millones | 262K | GGUF | Apache 2.0 | Publico; sin abliterar |
| Release abliterado de referencia (SC117) citado en la model card | no disponible | no disponible | no disponible | no disponible | Citado como origen de los tensores transplantados |
| Otros modelos comparables de la misma categoria | no disponible | no disponible | no disponible | no disponible | No identificados en la informacion disponible |

No hay datos de rendimiento publicados para ninguno de los modelos de la tabla, por lo que la comparacion se limita a parametros, contexto, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- La abliteracion elimina la direccion de rechazo: el modelo puede generar contenido danino, ilegal o sensible sin negarse. No debe exponerse a usuarios finales sin una capa externa de moderacion.
- El transplante de tensores puede degradar la coherencia, la calidad del razonamiento o el multilingue; no se han publicado evaluaciones que cuantifiquen ese impacto.
- Riesgo de alucinacion propio de los modelos de lenguaje, agravado en las cuantizaciones de menor precision (Q2_0, IQ2_XS), donde la perdida de calidad suele ser mas acusada.
- Solo se declaran ingles y chino; no hay soporte confirmado para castellano ni para otros idiomas.
- La ventana de 262K tokens exige una cache KV muy grande; en la practica, el contexto util dependera de la VRAM y RAM disponibles.
- Licencia Apache 2.0 en este repositorio, pero el uso comercial de un derivado abliterado puede estar sujeto a los terminos de la cadena de modelos originales, que no se detallan en la informacion disponible.
- Repositorio sin descargas ni likes y sin resultados de benchmarks: no existe validacion independiente de su calidad ni de que la abliteracion se haya aplicado exactamente como se describe mas alla de la verificacion blake2b del build IQ3_S.
- No hay datos publicados de latencia, throughput ni consumo de memoria en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/KilltheSniper/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF
- Modelo base (cuantizaciones oficiales GSQ-RCO): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Release abliterado de referencia citado en la model card: https://huggingface.co/SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF
- README en chino simplificado del repositorio: https://huggingface.co/SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF/blob/main/README.zh-CN.md
- Referencia arXiv 2604.18556: https://arxiv.org/abs/2604.18556
- Referencia arXiv 2605.00649: https://arxiv.org/abs/2605.00649
- llama.cpp (runtime recomendado para GGUF): https://github.com/ggml-org/llama.cpp
