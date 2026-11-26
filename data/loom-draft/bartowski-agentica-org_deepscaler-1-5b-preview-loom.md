# loom-draft/bartowski-agentica-org_DeepScaleR-1.5B-Preview-loom

## Resumen

El modelo referenciado en esta ficha es un paquete de despliegue para GPUs AMD publicado bajo el identificador `loom-draft/bartowski-agentica-org_DeepScaleR-1.5B-Preview-loom`. No se trata de un modelo entrenado por el autor del repositorio, sino de un empaquetado del checkpoint GGUF `agentica-org_DeepScaleR-1.5B-Preview` en cuantizacion Q4_K_M, distribuido originalmente por bartowski. El autor del paquete, `loom-draft`, lo adapta al formato `.loom` (programas y una tarjeta `model.json`) para su uso con el runtime Loom sobre las GPUs AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente, DeepScaleR-1.5B-Preview de Agentica, es un modelo de razonamiento de 1.500 millones de parametros derivado de DeepSeek-R1-Distill-Qwen-1.5B mediante aprendizaje por refuerzo orientado a tareas matematicas y de razonamiento de varios pasos. Su interes radica en que ofrece capacidades de razonamiento con cadena de pensamiento en un tamano muy reducido, apto para hardware de consumo y para despliegue en el borde.

La relevancia de este repositorio concreto es operativa: proporciona un artefacto listo para servir con Loom en GPUs AMD, con mediciones de rendimiento comparadas frente a llama.cpp ROCm (prefill entre un 29 % y un 37 % mas rapido en Strix Halo, decodificacion hasta un 10 % mas rapida en prompt corto). La licencia declarada es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de DeepSeek-R1-Distill-Qwen-1.5B); detalles exactos no disponibles en la informacion proporcionada |
| Parametros totales | 1.500 millones (1.5B), segun el identificador del modelo |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | hasta 32k evaluados en las mediciones de rendimiento; limite maximo oficial no disponible |
| Tipos de cuantizacion | Q4_K_M (unica incluida en este paquete) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (Q4_K_M) empaquetado en formato Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

El paquete no documenta la arquitectura interna del modelo base; la informacion disponible solo indica que se trata de un checkpoint GGUF de `agentica-org/DeepScaleR-1.5B-Preview` cuantizado a Q4_K_M. Por el identificador y el linaje declarado, el modelo subyacente corresponde a un transformer decoder-only de 1.5B derivado de DeepSeek-R1-Distill-Qwen-1.5B, ajustado por Agentica con aprendizaje por refuerzo (RL) para mejorar el razonamiento matematico y de multiples pasos. No se dispone en la informacion proporcionada del numero de tokens de entrenamiento, la composicion del dataset ni los detalles del pipeline de RL.

El repositorio en si no modifica los pesos: empaqueta el GGUF sin cambios y anade los artefactos necesarios para el runtime Loom. La innovacion tecnica destacable de este paquete es el propio runtime: servidor compatible con la API de chat completions de OpenAI (`/v1/chat/completions`), pool de memoria fijo (`--pool_backing=fixed`), precarga de parametros (`--parameter_mode=preload`) y espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`). No se menciona decodificacion especulativa: la model card indica explicitamente que no hay cabecera MTP en el GGUF ni drafter publicado para este modelo exacto.

## Capacidades

- Generacion de texto y razonamiento de multiples pasos, orientado a problemas matematicos y de logica segun el linaje DeepScaleR.
- Razonamiento con cadena de pensamiento (el modelo base DeepScaleR esta entrenado con RL para razonamiento extendido); el modo exacto de exposicion del razonamiento no esta documentado en la informacion disponible.
- Servicio mediante API compatible con OpenAI (chat completions) a traves de `loom-serve`.
- Soporte de multiples flujos concurrentes: se han medido 4 peticiones paralelas con decodificacion agregada de 628,1 tok/s en Strix Halo.
- Procesamiento de prompts largos: se han medido prefill con documentos de hasta 32k tokens.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el paquete solo declara el modo `chat`.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Razonamiento matematico asistido: el modelo base esta especializado en resolver problemas matematicos paso a paso; puede integrarse en un servicio de resolucion de ejercicios o verificacion de demostraciones, con la salida de razonamiento revisada por un humano dado el tamano reducido del modelo.
- Despliegue en estaciones de trabajo AMD: gracias al paquete Loom, puede servirse directamente en un Ryzen AI Max+ 395 o una Radeon AI PRO R9700 con dos comandos (`loom-fetch` y `loom-serve`), sin conversion adicional de pesos.
- Prototipado rapido de aplicaciones de razonamiento: la API compatible con OpenAI permite sustituir un endpoint remoto por uno local en fase de desarrollo, con 173,9 tok/s de decodificacion en prompt corto sobre Strix Halo.
- Procesamiento por lotes de documentos medianos: con prefill medido de 7.377 tok/s para documentos de 1k tokens y 3.335 tok/s para 32k, es adecuado para tareas de extraccion o resumen sobre lotes de textos no demasiado extensos.
- Servicio multiusuario ligero: los 628,1 tok/s agregados con 4 flujos concurrentes permiten atender a varios usuarios simultaneos en un unico equipo con GPU integrada.
- Entorno de evaluacion y docencia: al ser un modelo de 1.5B en Q4_K_M con licencia MIT, es apropiado para laboratorios donde se ensenan tecnicas de razonamiento con RL o despliegue de LLM en hardware AMD de gama profesional.
- Componente de pipelines de agentes con verifier: su tamano permite usarlo como generador de borradores de soluciones matematicas que un modelo mayor verifica despues.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, GSM8K, HumanEval, etc.) en la informacion disponible. Si se incluyen mediciones de rendimiento del runtime comparadas con llama.cpp ROCm `llamacpp-rocm/b1374` sobre el mismo GGUF y los mismos prompts, en AMD Strix Halo (gfx1151):

| Metrica | llama.cpp | Loom | Margen vs mejor llama.cpp |
|---|---|---|---|
| Decodificacion tok/s, prompt corto | 158,1 | 173,9 | +10 % |
| Decodificacion tok/s, contexto 2k | 147,8 | 154,6 | +5 % |
| Decodificacion tok/s, contexto 32k | 90,6 | 85,1 | -6 % |
| Prefill tok/s, documento 1k | 5.376,0 | 7.377,2 | +37 % |
| Prefill tok/s, documento 2k | 5.340,3 | 7.093,2 | +33 % |
| Prefill tok/s, documento 8k | 4.605,6 | 6.275,4 | +36 % |
| Prefill tok/s, documento 16k | 3.656,9 | 4.942,1 | +35 % |
| Prefill tok/s, documento 32k | 2.588,1 | 3.335,9 | +29 % |
| 4 flujos, decodificacion agregada tok/s | 416,3 | 628,1 | +51 % |
| Decodificacion especulativa, tokens aceptados | n/a | n/a | n/a |

Metodologia declarada: mediana de 6 sesiones (3 muestras para decode_2k, decode_32k y prefill_8k; una muestra para el resto; 3 para los 4 flujos), medicion el 2026-11-26 en runners AMD DevLab Dispatch Strix Halo, con `hrx-loom 0.2.0`. llama.cpp se ejecuto con `-ngl 99 -cram 0 -c 65536 -np 1`. No se aplico ajuste fino de parametros en ninguno de los dos motores. La tabla de rendimiento para Radeon AI PRO R9700 (gfx1201, 32 GB) aparece truncada en la informacion proporcionada, por lo que no se reproducen sus valores.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; un GGUF Q4_K_M de 1.5B ocupa del orden de 1 GB de pesos, aunque la informacion proporcionada no confirma la cifra exacta ni el consumo del pool de memoria de Loom.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: el modelo base de 1.5B en Q4_K_M es apto para GPUs de consumo en terminos de tamano, pero este paquete solo documenta su ejecucion en las dos GPUs AMD citadas; no se confirma compatibilidad con otras.
- Opciones de despliegue: runtime Loom mediante `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. El GGUF original tambien puede servirse con llama.cpp (usado como referencia en las mediciones).
- Latencia y throughput medidos en Strix Halo: 173,9 tok/s de decodificacion con prompt corto, 85,1 tok/s con contexto de 32k, prefill de 7.377 tok/s con documentos de 1k y 628,1 tok/s agregados con 4 flujos concurrentes. Valores para R9700 no disponibles en la informacion proporcionada.
- Ajustes de servicio relevantes: `--pool_backing=fixed` reserva el pool de memoria al inicio y `--parameter_mode=preload` afecta solo a la carga de pesos en el host.

## Comparativa con modelos similares

No se dispone de datos de calidad comparativos en la informacion proporcionada. A nivel de categoria, el modelo base DeepScaleR-1.5B-Preview se situa entre los modelos de razonamiento de ~1.5B derivados por destilacion de DeepSeek-R1, pero no se han facilitado resultados de benchmarks frente a alternativas como DeepSeek-R1-Distill-Qwen-1.5B, Qwen2.5-Math-1.5B o Phi-3.5-mini. La comparativa de rendimiento disponible es exclusivamente de motor de inferencia (Loom frente a llama.cpp ROCm sobre el mismo modelo y hardware), recogida en la seccion de benchmarks.

| Aspecto | Este paquete (Loom) | llama.cpp ROCm (referencia) |
|---|---|---|
| Modelo servido | DeepScaleR-1.5B-Preview Q4_K_M | DeepScaleR-1.5B-Preview Q4_K_M |
| Hardware medido | Strix Halo gfx1151 | Strix Halo gfx1151 |
| Prefill 1k tok/s | 7.377,2 | 5.376,0 |
| Decodificacion prompt corto tok/s | 173,9 | 158,1 |
| 4 flujos agregados tok/s | 628,1 | 416,3 |
| Licencia del paquete | MIT | MIT (llama.cpp) |

## Limitaciones y advertencias

- El paquete no modifica ni valida los pesos: cualquier limitacion del modelo base DeepScaleR-1.5B-Preview (sesgos, alucinaciones, errores de razonamiento) se hereda sin cambios.
- Con 1.5B de parametros, la fiabilidad en razonamiento complejo y matematicas avanzadas es limitada en comparacion con modelos mayores; conviene verificar las salidas en produccion.
- No hay informacion sobre idiomas soportados; el comportamiento en castellano no esta garantizado ni documentado.
- El limite maximo de contexto no esta documentado; las mediciones llegan a 32k tokens, pero no se confirma que ese sea el maximo del modelo.
- No se documenta soporte de tool calling ni de modo agente; no debe asumirse.
- El paquete esta orientado exclusivamente a dos GPUs AMD concretas (gfx1151 y gfx1201); la compatibilidad con otro hardware no esta declarada.
- Las cifras de rendimiento provienen de runners de AMD DevLab que difieren entre sesiones y de una unica fecha de medicion; no se aplico ajuste fino en ninguno de los motores, por lo que margenes superiores podrian obtenerse con tuning.
- La licencia MIT se declara tanto en el paquete como en la model card; conviene verificar la licencia del checkpoint original de Agentica antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/bartowski-agentica-org_DeepScaleR-1.5B-Preview-loom
- GGUF original de bartowski: https://huggingface.co/bartowski/agentica-org_DeepScaleR-1.5B-Preview-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Ejecucion de referencia de las mediciones (DevLab Dispatch): https://github.com/loom-fun/loom-next/actions/runs/45875473246
