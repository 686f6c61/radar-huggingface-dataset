# Arki05/Qwen3.8-27B-GGUF

## Resumen

Arki05/Qwen3.8-27B-GGUF es un conjunto de 10 ficheros GGUF cuantizados del modelo denso Qwen/Qwen3.8-27B de Alibaba, publicados por el usuario independiente Arki05 (no es una publicación oficial del equipo Qwen). El modelo base tiene 26.895.998.464 parámetros (~26,9B) y licencia Apache 2.0. La aportación del repositorio no es el modelo, sino el método de cuantización: en lugar de reutilizar los cuantizados dinámicos de Unsloth o los GSQ-RCO de ISTA-DASLab, cada tensor se recuantiza desde los pesos BF16 originales con una técnica basada en Hessiano (tipo GPTQ) y se le asigna un tipo distinto por tensor mediante la herramienta propia `qalloc`.

El resultado son ficheros que cubren desde 2,16 hasta 4,46 bits por peso (7,27 GB a 15,01 GB) con una divergencia KL entre un 11 % y un 38 % menor que la del fichero publicado de tamaño equivalente según la medición del propio autor. Esto los hace interesantes para despliegue local en GPU de consumo: un fichero de 4,46 bpw ocupa 15,01 GB y cae dentro de una RTX 4090 o RTX 5090 sin necesidad de descarga en CPU.

El modelo base se presenta como un LLM denso multimodal nativo, con codificador de visión, 262k tokens de contexto y orientación a código, flujos agénticos y automatización de oficina, además de una cabeza de predicción multi-token (MTP) nativa. Conviene subrayar que el repositorio tiene 0 descargas y 0 likes en el momento de la consulta y no se han publicado benchmarks de capacidad convencionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base descrito como LLM denso multimodal nativo); pesos en formato GGUF para llama.cpp |
| Parametros totales | 26.895.998.464 (~26,9B), dato real de safetensors del modelo base |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 262.000 tokens según la información publicada del modelo base; no verificado en los ficheros GGUF de este repositorio |
| Tipos de cuantizacion | GGUF con tipos nativos de llama.cpp (IQ2/IQ3/Q2_K/Q3_K/Q4_K y similares), asignados tensor a tensor por `qalloc`; ficheros de 2,16, 2,49, 2,51, 2,75, 2,82, 3,00, 3,15, 3,50, 3,81 y 4,46 bpw |
| Idiomas soportados | No disponible como lista oficial; el conjunto de evaluación incluye ventanas en arabe, chino, aleman, frances, japones y coreano, ademas de ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (10 ficheros); el modelo base esta en BF16/safetensors |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: cuantiza Qwen/Qwen3.8-27B, un transformer denso de ~26,9B parámetros descrito por el equipo Qwen como multimodal nativo (con codificador de visión) y con 262k tokens de contexto. El autor no documenta la composición del dataset de preentrenamiento ni las fases de alineación (RLHF/DPO) del modelo base; esa información corresponde a la model card de Qwen, no a este repositorio.

La innovación técnica está en el pipeline de cuantización, en dos piezas. Primero, cuantización basada en Hessiano de tipo GPTQ: cada tensor de cada bloque se recuantiza desde los pesos BF16 de Qwen eligiendo los valores cuantizados que minimizan el impacto del error sobre la salida del modelo, en lugar de aplicar una cuantización uniforme por tipo. Segundo, asignación de tipo por tensor: `qalloc` selecciona el tipo GGUF de cada tensor para alcanzar un tamaño objetivo, consultando un almacén que contiene todos los tensores del modelo en todos los tipos disponibles (repositorio `Arki05/Qwen3.8-27B-GGUF-shards`). Esto permite generar un GGUF de cualquier tamaño intermedio, no solo de los 10 publicados, e incluso construir el fichero en el navegador mediante la aplicación `qalloc.arki05.com`.

La evaluación se hizo con 128 ventanas de 4096 tokens (220k tokens puntuados) procedentes de nueve dominios: web (FineWeb-Edu, DCLM), enciclopédico (WikiText-103), multilingüe (FineWeb-2), matemáticas (GSM8K, MATH), código (The Stack smol, MBPP), ciencia (MMLU auxiliary train, ARC), seguimiento de instrucciones (Tulu 3), uso de herramientas (Glaive function calling v2, ToolACE) y contexto largo (FineWeb-Edu, NuminaMath). En cada ventana la primera mitad es contexto y la segunda se puntúa; en los conjuntos de prompt el modelo BF16 generó su propia respuesta (incluido el razonamiento) y solo se puntúa la respuesta. Los ficheros de este repositorio omiten la capa de predicción multi-token (~0,35 GB), que no se usa en generación normal.

## Capacidades

- Generación de texto conversacional y de formato largo, con pipeline declarado `text-generation` y tag `conversational`.
- Razonamiento y matemáticas: el modelo base se evalúa en GSM8K, MATH y NuminaMath; el autor incluye estos dominios en su suite de divergencia.
- Generación de código: dominios de evaluación con The Stack (smol) y MBPP; el repositorio oficial de Qwen3.8-27B destaca rendimiento en coding.
- Uso de herramientas y function calling: los datos de evaluación incluyen Glaive function calling v2 y ToolACE, lo que indica soporte de tool calling en el modelo base.
- Flujos agénticos y multi-paso: descrito por el equipo Qwen como punto fuerte del modelo base (agentic workflows).
- Automatización de oficina: tareas documentales citadas explícitamente en la descripción oficial del modelo base.
- Multilingüismo: cobertura verificada en la suite de evaluación para árabe, chino, alemán, francés, japonés y coreano, además de inglés.
- Capacidad multimodal (visión): el modelo base incorpora codificador de visión según la documentación de Qwen; no se especifica si el codificador está incluido en estos GGUF ni si llama.cpp lo soporta, por lo que debe tratarse como no confirmado.
- Predicción multi-token (MTP): el modelo base tiene cabeza MTP nativa, utilizable para decodificación especulativa en llama.cpp; los ficheros de este repositorio la excluyen deliberadamente.
- Modo de razonamiento (thinking): el autor menciona que las ventanas de instrucciones se puntuaron sobre respuestas generadas "thinking included", lo que implica que el modelo base emite trazas de razonamiento.

## Casos de uso

- Asistente de código en local: con 262k de contexto teórico y buen rendimiento declarado en coding, un fichero de 3,81 bpw (12,80 GB) permite cargar repositorios completos o varios módulos en una sola ventana y trabajar sin enviar código a un servicio externo.
- Automatización de oficina y generación documental: el modelo base está orientado a tareas de oficina; con el fichero de 4,46 bpw (15,01 GB) se puede desplegar un generador de informes, resúmenes de actas o correos con plantillas y contexto corporativo largo.
- Agente con tool calling en pipelines internos: los datos de evaluación incluyen Glaive y ToolACE; el modelo puede encadenar llamadas a funciones (consulta a bases de datos, APIs internas, ejecución de scripts) y razonar en varios pasos, siempre que el runtime usado soporte plantillas de herramientas.
- Procesamiento de documentación multilingüe: cobertura verificada en árabe, chino, alemán, francés, japonés y coreano; útil para normalizar o resumir contratos y fichas técnicas en varios idiomas desde un mismo despliegue.
- Investigación sobre cuantización: los ficheros publicados, el directorio `allocations/` con la elección de tipo por tensor y el repositorio de shards permiten reproducir el método, comparar curvas KL frente a tamaño y validar técnicas de asignación por tensor en un modelo de ~27B.
- Inferencia en hardware de consumo con requisitos de privacidad: cualquier fichero entre 2,16 y 3,15 bpw (7,27 a 10,58 GB) se ejecuta en GPUs de 12-16 GB, lo que habilita asistentes privados en estaciones de trabajo sin GPU de datacenter.
- Base para ajuste fino o destilación: al estar en GGUF el uso directo para entrenamiento es limitado, pero los pesos BF16 del modelo base (Apache 2.0) permiten fine-tuning y posterior recuantización con este mismo pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible; el autor indica que publicará más benchmarks, incluidos los generativos. Los únicos datos medidos son de fidelidad de cuantización: divergencia KL media por token frente al modelo BF16, su percentil 99 y el porcentaje de coincidencia en el token más probable.

Comparación con los cuantizados dinámicos de Unsloth (mismo tamaño de fichero):

| Fichero | bpw | Tamano | Referencia Unsloth | KLD | KLD p99 | Mismo top token % |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-2.16bpw.gguf | 2,16 | 7,27 GB | UD-IQ2_XXS | 0,305 → 0,209 (-32 %) | 2,59 → 2,06 | 79,9 → 83,5 |
| Qwen3.8-27B-2.49bpw.gguf | 2,49 | 8,37 GB | UD-IQ2_S | 0,152 → 0,124 (-19 %) | 1,42 → 1,31 | 85,8 → 87,6 |
| Qwen3.8-27B-2.82bpw.gguf | 2,82 | 9,48 GB | UD-Q2_K_XL | 0,0983 → 0,0823 (-16 %) | 0,958 → 0,888 | 88,6 → 89,7 |
| Qwen3.8-27B-3.15bpw.gguf | 3,15 | 10,58 GB | UD-IQ3_XXS | 0,0710 → 0,0512 (-28 %) | 0,724 → 0,530 | 90,3 → 91,8 |
| Qwen3.8-27B-3.81bpw.gguf | 3,81 | 12,80 GB | UD-Q3_K_XL | 0,0288 → 0,0213 (-26 %) | 0,288 → 0,229 | 93,7 → 94,7 |
| Qwen3.8-27B-4.46bpw.gguf | 4,46 | 15,01 GB | UD-Q4_K_S | 0,0154 → 0,00961 (-38 %) | 0,168 → 0,102 | 95,4 → 96,4 |

Comparación con los GSQ-RCO de ISTA-DASLab (revision d562806, ficheros sin capa MTP):

| Fichero | bpw | Tamano | Referencia ISTA-DASLab | KLD | KLD p99 | Mismo top token % |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-2.51bpw.gguf | 2,51 | 8,42 GB | GSQ-RCO-IQ2_XS | 0,151 → 0,122 (-19 %) | 1,54 → 1,30 | 86,0 → 87,6 |
| Qwen3.8-27B-2.75bpw.gguf | 2,75 | 9,26 GB | GSQ-RCO-IQ2_S | 0,101 → 0,0900 (-11 %) | 1,01 → 0,968 | 88,3 → 89,4 |
| Qwen3.8-27B-3.00bpw.gguf | 3,00 | 10,09 GB | GSQ-RCO-IQ3_XXS | 0,0740 → 0,0640 (-13 %) | 0,759 → 0,684 | 90,1 → 90,8 |
| Qwen3.8-27B-3.50bpw.gguf | 3,50 | 11,77 GB | GSQ-RCO-IQ3_S | 0,0424 → 0,0312 (-26 %) | 0,448 → 0,320 | 92,5 → 93,6 |

## Requisitos de hardware

- VRAM estimada (pesos del fichero + caché KV + buffers de cómputo, valores aproximados calculados a partir del tamaño del fichero, no publicados por el autor):
  - 2,16 bpw / 7,27 GB: ~9-10 GB con contexto corto (8k); ~11-13 GB con contexto de 32k.
  - 2,82 bpw / 9,48 GB: ~11-12 GB con contexto corto; ~14 GB con 32k.
  - 3,81 bpw / 12,80 GB: ~15 GB con contexto corto; ~18 GB con 32k.
  - 4,46 bpw / 15,01 GB: ~17-18 GB con contexto corto; ~21-22 GB con 32k.
- El contexto completo de 262k exige mucha más VRAM que los pesos y solo es viable en GPU de datacenter o con offload parcial a RAM; no hay mediciones publicadas.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 5090 (32 GB) para los ficheros de 3,15 bpw en adelante; A100 40/80 GB y H100 80 GB para contexto largo o para servir varias peticiones.
- Cabe en GPU de consumo: sí. Los ficheros de 2,16 a 3,15 bpw (7,27-10,58 GB) entran en GPUs de 12 GB; los de 3,81 y 4,46 bpw requieren 16-24 GB.
- Opciones de despliegue: llama.cpp y Ollama son las rutas documentadas; también sirven frontends basados en llama.cpp. El soporte de vLLM o TGI para este GGUF no está documentado en la información disponible.
- Decodificación especulativa: estos ficheros excluyen la capa MTP (~0,35 GB), así que no se benefician de la predicción multi-token nativa; para usarla hay que recurrir a las variantes que sí la incluyen.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo / repositorio | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arki05/Qwen3.8-27B-GGUF (este) | ~26,9B denso | 262k (modelo base) | 10 ficheros, 2,16-4,46 bpw, Hessiano + tipo por tensor | Apache 2.0 | GGUF en HF; 0 descargas |
| unsloth/Qwen3.8-27B-GGUF | ~26,9B denso | 262k (modelo base) | Cuantizados dinamicos UD (IQ2_XXS a Q4_K_S y superiores), incluye capa MTP desde UD-Q2_K_XL | Apache 2.0 (heredada) | GGUF en HF, ampliamente distribuido |
| ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF | ~26,9B denso | 262k (modelo base) | GSQ-RCO (IQ2_XS a IQ3_S), revision d562806 | Apache 2.0 (heredada) | GGUF en HF, con y sin capa MTP |
| Qwen/Qwen3.8-27B (BF16) | ~26,9B denso | 262k | Pesos completos BF16 | Apache 2.0 | Modelo base de referencia |

Frente a los cuantizados de Unsloth, este repositorio reporta entre un 16 % y un 38 % menos de divergencia KL para el mismo tamaño de fichero; frente a los de ISTA-DASLab, entre un 11 % y un 26 %. Como contrapartida, Unsloth incluye la capa MTP en sus ficheros desde UD-Q2_K_XL, lo que habilita decodificación especulativa nativa, y su distribución y soporte comunitario son mucho mayores.

## Limitaciones y advertencias

- Cuantizador de terceros: no es una publicación oficial del equipo Qwen. La licencia Apache 2.0 se hereda del modelo base, pero la responsabilidad sobre la calidad de los pesos recae en el autor del repositorio.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día (2026-10-29). No hay validación independiente del método.
- Métricas autoinformadas: las cifras de divergencia KL y de coincidencia de token las ha producido el propio autor con su suite de 128 ventanas. No hay replicación externa ni comparación con benchmarks de capacidad.
- Solo se mide fidelidad de cuantización: no hay MMLU, HumanEval, GSM8K ni evaluaciones generativas, por lo que no se puede estimar la degradación en tareas reales a partir de estos datos.
- Faltan 20 de las 128 ventanas en `eval/` (documentos de The Stack y MMLU no redistribuibles, listados por id). La reproducibilidad exacta queda condicionada.
- Capa MTP excluida: se pierde la decodificación especulativa nativa del modelo base. El autor lo justifica porque la generación normal no la usa.
- Multimodalidad no confirmada en GGUF: aunque el modelo base incorpora codificador de visión, no se documenta si estos ficheros lo incluyen ni si llama.cpp lo soporta.
- Contexto largo no verificado: los 262k tokens corresponden a la documentación del modelo base; no hay pruebas en este repositorio de que se mantengan tras la cuantización, y los ficheros de 2 bits suelen degradarse de forma desproporcionada en contextos muy largos.
- Riesgo de alucinación: inherente a un modelo de ~27B, agravado en los ficheros de 2,16-2,82 bpw (KLD entre 0,082 y 0,209 y solo 83-90 % de coincidencia en el token más probable).
- Idiomas: el autor no publica lista oficial de idiomas soportados; la cobertura multilingüe se infiere de los conjuntos de evaluación y puede ser desigual fuera de inglés y chino.
- Uso comercial: permitido por Apache 2.0, pero conviene revisar los términos del modelo base y citar correctamente la procedencia de los pesos cuantizados.
- Tamaño del repositorio: 103,1 GB en total. Descargar un único fichero requiere clonar con filtros o descargar por fichero suelto para no arrastrar los 10 cuantizados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Arki05/Qwen3.8-27B-GGUF
- Repositorio de shards (todos los tensores en todos los tipos): https://huggingface.co/Arki05/Qwen3.8-27B-GGUF-shards
- Aplicación qalloc para construir cualquier tamaño en el navegador: https://qalloc.arki05.com
- Página del proyecto qalloc: https://arki05.com/projects/qalloc/
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantizados de referencia de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Cuantizados de referencia GSQ-RCO de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Repositorio oficial del modelo en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guía de despliegue local (Ollama, GGUF, GPU única): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Experiencia de ejecución en una RTX 5090 con MTP nativo: https://johnpaulwile.substack.com/p/i-ran-qwen-38-27b-on-a-single-rtx
