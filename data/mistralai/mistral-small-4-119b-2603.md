# mistralai/Mistral-Small-4-119B-2603

## Resumen

Mistral Small 4 119B (identificador `mistralai/Mistral-Small-4-119B-2603`) es un modelo de lenguaje multimodal desarrollado por Mistral AI, empresa francesa fundada en abril de 2023. Se trata de un modelo hibrido que unifica en un unico checkpoint las capacidades de tres familias previas de la compania: Instruct, Reasoning (antes denominada Magistral) y Devstral, de modo que puede comportarse como asistente general, como modelo de razonamiento o como agente de codigo segun la configuracion por peticion.

Arquitectonicamente es un transformer con mezcla de expertos (MoE) de 119.401.317.952 parametros totales, distribuidos en 128 expertos de los que se activan 4 por token, lo que da 6,5B parametros activos por token. Soporta una longitud de contexto de 256.000 tokens y acepta entrada tanto de texto como de imagen, con salida unicamente de texto. La licencia es Apache 2.0, lo que permite uso comercial y no comercial sin restricciones de peso.

Su relevancia actual radica en la combinacion de eficiencia computacional y capacidades agenticas: frente a Mistral Small 3, Mistral AI reporta una reduccion del 40% en el tiempo de finalizacion de extremo a extremo en configuraciones optimizadas para latencia, y 3 veces mas peticiones por segundo en configuraciones optimizadas para throughput. Ademas, existe un cabezal eagle entrenado (`Mistral-Small-4-119B-2603-eagle`) para decodificacion especulativa y un checkpoint NVFP4 de 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), 128 expertos, 4 activos por token |
| Parametros totales | 119.401.317.952 (~119B) |
| Parametros activos | 6,5B por token |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | FP8, NVFP4 (4 bits), GGUF (comunidad, via Unsloth) |
| Idiomas soportados | en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tambien GGUF y NVFP4 en checkpoints derivados) |

## Arquitectura y entrenamiento

Mistral Small 4 emplea una arquitectura de mezcla de expertos (MoE) con 128 expertos y 4 activos por token, lo que le permite mantener un coste de inferencia cercano al de un modelo denso de 6,5B parametros pese a contener 119B en total. Esto se traduce en una gran capacidad de almacenamiento de conocimiento con un coste computacional por token mucho menor que un modelo denso del mismo tamano. El modelo es multimodal en entrada (texto e imagen) y unimodal en salida (texto). Soporta una ventana de contexto de 256.000 tokens.

El modelo unifica tres modos de funcionamiento que en versiones previas correspondian a modelos separados: el modo Instruct (respuesta rapida, `reasoning_effort="none"`), el modo razonamiento (`reasoning_effort="high"`), y las capacidades de codigo y agente de la familia Devstral. La profundidad de razonamiento es configurable por peticion mediante el parametro `reasoning_effort`. Mistral AI recomienda temperatura 0,7 para `reasoning_effort="high"` y entre 0,0 y 0,7 para `reasoning_effort="none"` segun la tarea. La compania no ha publicado en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion detallada del dataset, ni si se empleo RLHF, DPO u otra tecnica de alineamiento.

Entre las innovaciones tecnicas destacadas estan el cabezal eagle entrenado para decodificacion especulativa (que acelera la generacion reduciendo el numero de pasos secuenciales) y la disponibilidad de un checkpoint cuantizado a 4 bits NVFP4 para reducir requisitos de memoria.

## Capacidades

- Generacion de texto y conversacion general multilingue, con soporte para system prompt y adherencia fuerte a instrucciones.
- Modo de razonamiento activable por peticion mediante `reasoning_effort` (`none` o `high`), que permite alternar entre respuestas instantaneas y razonamiento paso a paso con mayor computo en tiempo de inferencia.
- Capacidades de codigo heredadas de la familia Devstral, orientadas a automatizacion de tareas de ingenieria de software (SWE) y exploracion de bases de codigo.
- Vision: analisis de imagenes y comprension de documentos con contenido visual, con salida de texto.
- Tool calling / function calling nativo, con salida en JSON.
- Capacidades agenticas con razonamiento multi-paso y llamadas a funciones encadenadas.
- Soporte multilingue de decenas de idiomas, incluyendo neerlandes, chino, japones, coreano, arabe, hindi y bengali, ademas de las principales lenguas europeas.
- Capacidad de ajuste fino para tareas especializadas.
- Ahorro de tokens en la salida: segun Mistral AI, en AA LCR obtiene 0,72 con solo 1,6K caracteres de salida, frente a 5,8-6,1K caracteres que requieren modelos Qwen para rendimiento comparable.

## Casos de uso

- Asistente de chat general: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 256K tokens) y responder con baja latencia cuando se desactiva el razonamiento, lo que lo hace adecuado para atencion al cliente y asistentes corporativos.
- Agente de codigo en produccion: gracias al tool calling nativo y la salida JSON, puede integrarse en pipelines de CI/CD para revision de codigo, generacion de tests o resolucion de incidencias de forma automatizada.
- Exploracion y navegacion de bases de codigo extensas: la ventana de 256K tokens permite cargar repositorios enteros o grandes porciones de ellos para tareas de comprension y refactorizacion.
- Extraccion y analisis de documentos: con la entrada multimodal de imagenes, puede procesar facturas, formularios e informes escaneados y devolver datos estructurados.
- Asistente de investigacion y matematicas: activando `reasoning_effort="high"` puede abordar problemas de varios pasos, demostraciones matematicas y sintesis de literatura cientifica.
- Automatizacion de atencion al cliente multilingue: el soporte de mas de veinte idiomas permite desplegar un unico modelo para mercados en Europa, Asia y Oriente Medio.
- Ajuste fino especializado: al ser Apache 2.0 y publicar pesos abiertos, las empresas pueden afinarlo con datos propios para dominios verticales (legal, sanitario, financiero) sin restricciones de licencia.
- Generacion asistida en IDE con decodificacion especulativa: combinando el modelo con el cabezal eagle se puede reducir la latencia de autocompletado en entornos de desarrollo.

## Benchmarks y rendimiento

Mistral AI no ha publicado en la informacion disponible resultados numericos completos de benchmarks clasicos como MMLU, HumanEval o GSM8K. Los datos cualitativos y parciales reportados por el autor son los siguientes:

| Benchmark | Mistral Small 4 (reasoning) | Modelo de comparacion | Notas |
|---|---|---|---|
| AA LCR | 0,72 con 1,6K caracteres de salida | Modelos Qwen: 3,5-4x mas salida (5,8-6,1K caracteres) para rendimiento comparable | Mayor eficiencia de tokens |
| LiveCodeBench | Supera a GPT-OSS 120B generando un 20% menos de salida | GPT-OSS 120B | El autor no publica la puntuacion exacta |
| AIME25 | No disponible (solo grafica sin cifras) | Varios | No se aportan numeros |
| Comparativa interna (Instruct frente a Mistral-Small-3.2-24B-Instruct-2506; Reasoning frente a Magistral-Small-2509) | No disponible (solo imagenes sin cifras) | Modelos internos de Mistral | No se aportan numeros |
| Reduccion de tiempo extremo a extremo | 40% menos frente a Mistral Small 3 | Mistral Small 3 | Configuracion optimizada para latencia |
| Throughput | 3x mas peticiones por segundo | Mistral Small 3 | Configuracion optimizada para throughput |

## Requisitos de hardware

- VRAM estimada para inferencia (valores calculados a partir del numero de parametros, no confirmados por el autor):
  - BF16: aproximadamente 239 GB.
  - FP8: aproximadamente 119 GB.
  - NVFP4 (4 bits): aproximadamente 60 GB.
  - GGUF de 4 bits (Unsloth): entorno a 65-70 GB.
- GPU recomendadas:
  - Despliegue a precision completa o FP8: multiples A100 80GB, H100 80GB o H200; se requiere agregacion de memoria en varios dispositivos.
  - Despliegue cuantizado a 4 bits: una sola GPU de 80 GB (A100, H100, H200) o combinaciones de consumer GPUs de gama alta con suficiente VRAM agregada.
- Cabe en GPU de consumo: si, en configuraciones cuantizadas a 4 bits (NVFP4 o GGUF) y con memoria total suficiente; se recomienda comprobar el soporte del runtime para el formato escogido. No cabe a BF16 ni FP8 en una unica GPU de consumo.
- Opciones de despliegue: vLLM (recomendado por el autor), llama.cpp (GGUF de Unsloth), LM Studio, y potencialmente otros runtimes compatibles con safetensors y MoE.
- Latencia y throughput: no se han publicado cifras absolutas de tokens por segundo ni latencias en milisegundos. El autor reporta mejoras relativas del 40% en tiempo de finalizacion y 3x en peticiones por segundo frente a Mistral Small 3, pero sin valores base.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|---|
| Mistral Small 4 119B | 119B (MoE, 128 expertos, 4 activos) | 6,5B | 256K | Apache 2.0 | Si (texto + imagen) | Pesos abiertos en HuggingFace |
| GPT-OSS 120B | No disponible en la informacion | No disponible | No disponible | No disponible | No disponible | No disponible |
| Mistral Small 3.2 24B Instruct | 24B | 24B (denso) | No disponible | No disponible | No disponible | Pesos abiertos |
| Magistral Small 2509 | No disponible | No disponible | No disponible | No disponible | No disponible | Pesos abiertos |

La informacion proporcionada no incluye especificaciones detalladas de los modelos Qwen con los que Mistral AI compara su rendimiento, por lo que no se puede completar la comparativa con sus parametros, contexto o licencia. Los datos disponibles solo indican que Mistral Small 4 genera entre 3,5 y 4 veces menos tokens en AA LCR que dichos modelos Qwen para un rendimiento comparable.

## Limitaciones y advertencias

- No se han publicado datos especificos sobre sesgos conocidos, comportamiento en dominios sensibles ni evaluaciones de seguridad en la informacion disponible.
- Riesgo de alucinacion inherente a los modelos de lenguaje generativos; el modo de razonamiento puede mitigarlo parcialmente pero no lo elimina. No se han publicado tasas de alucinacion medidas.
- Aunque el autor declara soporte de decenas de idiomas, no se especifican los niveles de calidad por idioma; es probable que el rendimiento en idiomas con menos presencia en los datos de entrenamiento (por ejemplo nepali, serbio o bengali) sea inferior al de ingles o frances.
- La ventana de contexto de 256K tokens puede degradar la calidad efectiva en los extremos de la ventana si no se emplean tecnicas de atencion adecuadas; no se han publicado evaluaciones tipo "needle in a haystack".
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero conviene verificar la licencia de los checkpoints derivados (eagle, NVFP4, GGUF) de forma independiente.
- Los requisitos de memoria son elevados a precision completa y FP8, lo que puede limitar el despliegue en infraestructura modesta incluso con cuantizacion de 4 bits.
- El runtimerecomendado por el autor es vLLM; otros runtimes pueden no soportar todas las funcionalidades (por ejemplo, `reasoning_effort` o vision) a la fecha de publicacion.
- La model card menciona el soporte de parametros y modos especificos que conviene validar contra la version concreta del runtime desplegado, ya que la informacion de la busqueda web no incluye documentacion tecnica adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mistralai/Mistral-Small-4-119B-2603
- Cabezal eagle para decodificacion especulativa: https://huggingface.co/mistralai/Mistral-Small-4-119B-2603-eagle
- Checkpoint NVFP4 de 4 bits: https://huggingface.co/mistralai/Mistral-Small-4-119B-2603-NVFP4
- Mistral Small 3.2 24B Instruct (referencia interna): https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506
- Magistral Small 2509 (referencia interna): https://huggingface.co/mistralai/Magistral-Small-2509
- GGUFs de Unsloth: https://huggingface.co/unsloth/Mistral-Small-4-119B-2603-GGUF
- vLLM (repositorio): https://github.com/vllm-project/vllm
- llama.cpp (repositorio): https://github.com/ggml-org/llama.cpp
- LM Studio: https://lmstudio.ai/
- Web oficial de Mistral AI: https://mistral.ai/
- Consola de Mistral AI: https://console.mistral.ai/home
- Pagina de Wikipedia sobre Mistral AI: https://fr.wikipedia.org/wiki/Mistral_AI
