# LucasBRT/smart-commit-0.5b-v0.3

## Resumen

smart-commit-0.5b-v0.3 es un ajuste fino de Qwen2.5-Coder-0.5B-Instruct (494.032.768 parámetros) desarrollado por LucasBRT para una única tarea: escribir mensajes de commit de git en el estilo del repositorio, ejecutándose en local con un modelo pequeño. No es un modelo de propósito general, sino el componente de inferencia del CLI [smart-commit](https://github.com/Lucas-BRT/smart-commit), que le pasa el historial reciente, la lista de ficheros y el diff, y espera una respuesta en formato Conventional Commits cuando el repositorio lo usa.

La versión 0.3 parte del adaptador SFT de la v0.1 y añade un paso de DPO sobre muestras generadas por el propio modelo: 5.500 commits del split de entrenamiento de CommitChronicle, seis respuestas muestreadas por commit y un conjunto de comprobaciones automáticas que etiqueta como preferidas las que no copian un asunto reciente, no inventan detalles ausentes del diff, no usan scopes desconocidos y aciertan el tipo real del commit. El resultado según la evaluación del autor: la tasa de contenido no fundamentado en el diff cae de 0,116 a 0,008 y la proporción de primeras respuestas usables sube a 0,996, mientras que la precisión del tipo de commit no mejora de forma significativa (0,648 a 0,668, p = 0,332).

Es relevante ahora porque demuestra una receta de alineamiento barata (DPO con verificadores programáticos, sin anotadores humanos) aplicada a un modelo de 0,5B que cabe en 398 MB en Q4_K_M y corre en CPU. El modelo sigue marcado como experimental por el propio autor y solo está entrenado y evaluado en inglés y sobre el prompt exacto de smart-commit.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajustado desde Qwen2.5-Coder-0.5B-Instruct |
| Parámetros totales | 494.032.768 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No indicada en la model card; el modelo base Qwen2.5-Coder-0.5B-Instruct declara 32.768 tokens |
| Tipos de cuantización | bf16 (safetensors) y GGUF Q4_K_M (398 MB) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, bf16) y GGUF (smart-commit-0.5b-v0.3-q4_k_m.gguf) |
| Modelo base | Qwen/Qwen2.5-Coder-0.5B-Instruct |
| Dataset de entrenamiento | JetBrains-Research/commit-chronicle, revisión 5fd076e |
| Tamaño del repositorio | 1,5 GB (incluye pesos, GGUF y artefactos de entrenamiento) |
| Fecha de publicación | 2026-10-26 (según HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de la familia Qwen2 con 494M de parámetros, sin mezcla de expertos ni mecanismos híbridos. El ajuste se hizo con LoRA en dos etapas encadenadas, cuyos adaptadores se publican en el directorio `training/` del repositorio. La primera etapa corresponde al adaptador SFT de smart-commit-0.5b-v0.1. La segunda es un DPO sobre pares generados por el propio modelo: para cada uno de los 5.500 commits se muestrearon seis respuestas con temperatura 0,7 y semillas fijas, y un conjunto de verificadores programáticos marcó las que copiaban un asunto reciente del historial, nombraban un detalle ausente del diff, no decían nada, usaban un scope que el repositorio nunca había empleado o un tipo distinto al del commit real. El modelo se entrena para preferir la respuesta que pasa todas las comprobaciones.

Los datos provienen de CommitChronicle (revisión `5fd076e`): 5.500 commits del split de train que no se usaron en v0.1 ni pertenecen a los repositorios de evaluación, repartidos en 4.500 commits de 680 repositorios que siguen Conventional Commits (máximo 8 por repositorio) y 1.000 de repositorios jóvenes, más commits de estilo libre. El prompt de entrenamiento es el de smart-commit con `--rules full`, byte a byte, lo que significa que el modelo está especializado en ese formato concreto de entrada y no en mensajes de commit genéricos. No se documenta el número total de tokens de entrenamiento ni el uso de RLHF con anotadores humanos.

## Capacidades

- Generación de mensajes de commit de git en formato Conventional Commits (`type(scope): descripción`) a partir de diff, rutas e historial.
- Adaptación al estilo del repositorio: usa el historial reciente para imitar tipos y scopes ya existentes (tasa de scope conocido de 0,840 en eval-v1).
- Emisión de mensajes de estilo libre cuando el repositorio no sigue Conventional Commits (first_try de 0,996 en el subconjunto free de eval-v1).
- Grounding estricto sobre el diff: solo el 0,008 de las respuestas Conventional de eval-v1 contiene palabras de contenido que no aparezcan en el diff, las rutas o el historial.
- Modo de razonamiento o tool calling: no disponible; el modelo no declara soporte de function calling ni de agentes.
- Capacidades multimodales (visión, audio): no disponibles.
- Multilingüismo: no disponible; solo inglés, tanto en entrenamiento como en evaluación.

## Casos de uso

- **Generación de mensajes de commit en local con smart-commit**: el flujo documentado descarga el GGUF Q4_K_M (398 MB) y lo pasa al CLI mediante `SMART_COMMIT_GGUF`. Es el caso de uso para el que fue entrenado, con el prompt exacto y las reglas completas.
- **Automatización en hooks de pre-commit o alias de git**: con una tasa de primera respuesta usable de 0,996 sobre commits Conventional en eval-v1 y una tasa de fallback de 0,004, el mensaje se genera sin reintentos en la práctica totalidad de los casos, lo que permite integrarlo en un hook sin bloquear el commit.
- **Estandarización de Conventional Commits en equipos con historial irregular**: el modelo aprende los tipos y scopes que ya usa el repositorio a partir del historial inyectado en el prompt, de modo que puede empujar hacia el formato existente sin una guía manual de estilos.
- **Entornos sin GPU o aislados (air-gapped)**: al ejecutarse en CPU mediante llama.cpp, encaja en estaciones de trabajo sin acelerador y en máquinas sin salida a internet, donde no es viable llamar a una API externa de generación de mensajes.
- **Auditoría de contenido inventado en mensajes generados**: la métrica de no fundamentado (0,008) y la proporción de palabras no respaldadas por el contexto (0,082 frente a 0,151 de v0.1 y 0,327 de los commits reales) lo hacen adecuado en flujos donde un mensaje que inventa cambios es peor que un mensaje escueto.
- **Base para nuevas iteraciones de DPO con verificadores propios**: los adaptadores SFT y DPO, el `run.json` y el log del entrenamiento están publicados en `training/`, de modo que un equipo puede reproducir la receta y sustituir los verificadores por los de su propia política de commits.
- **Generación de mensajes en repositorios jóvenes**: en repositorios con 1 a 5 asuntos previos (eval-short), mantiene una tasa de fallback de 0,021 y un type_match de 0,596 con la lista de ficheros anotada, útil cuando aún no hay historial suficiente paraFew-shot manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible. El autor publica una evaluación específica de la tarea, `eval-v1`: 500 commits del split de test de CommitChronicle de repositorios nunca vistos en entrenamiento (250 Conventional y 250 de estilo libre), decodificación greedy, Vulkan, smart-commit 0.9.0 más los commits de `main` hasta `236d51f`, con los mismos reintentos y fallback que en producción. La columna sin sufijo corresponde a los 250 commits Conventional de eval-v1.

Con la lista de ficheros por defecto de smart-commit (anotada), la que recibe un usuario:

| Modelo | type_match | type_macro_f1 | scope_known | first_try | fallback | ungrounded | word_f1 | first_try (free) | word_f1 (free) | type_match (young) | fallback (young) | fallback (young, free) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Qwen2.5-Coder-0.5B-Instruct, recuantizado igual (control) | 0.352 | 0.200 | 0.876 | 0.336 | 0.632 | 0.296 | 0.159 | 0.692 | 0.102 | 0.468 | 0.894 | 0.340 |
| smart-commit-0.5b-v0.1 | 0.648 | 0.546 | 0.852 | 0.960 | 0.028 | 0.116 | 0.342 | 0.928 | 0.234 | 0.638 | 0.085 | 0.080 |
| **smart-commit-0.5b-v0.3** | 0.668 | 0.552 | 0.840 | 0.996 | 0.004 | 0.008 | 0.354 | 0.996 | 0.250 | 0.596 | 0.021 | 0.000 |

Con la lista de ficheros simple, la usada en entrenamiento:

| Modelo | type_match | type_macro_f1 | scope_known | first_try | fallback | ungrounded | word_f1 | first_try (free) | word_f1 (free) | type_match (young) | fallback (young) | fallback (young, free) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Qwen2.5-Coder-0.5B-Instruct, recuantizado igual (control) | 0.344 | 0.201 | 0.884 | 0.312 | 0.648 | 0.308 | 0.161 | 0.696 | 0.101 | 0.426 | 0.872 | 0.333 |
| smart-commit-0.5b-v0.1 | 0.628 | 0.531 | 0.844 | 0.960 | 0.028 | 0.104 | 0.333 | 0.916 | 0.230 | 0.617 | 0.085 | 0.100 |
| **smart-commit-0.5b-v0.3** | 0.664 | 0.557 | 0.840 | 0.996 | 0.004 | 0.008 | 0.347 | 0.996 | 0.247 | 0.617 | 0.021 | 0.000 |

Comparación pareada frente a v0.1 sobre los 250 commits Conventional de eval-v1 con la lista anotada: `ungrounded` +1/−28 (p = 0.0), `first_copied` +0/−9 (p = 0.004), `first_try` +9/−0 (p = 0.004), `fallback` +0/−6 (p = 0.031); `type_match` +11/−6 (p = 0.332) y `scope_known` +2/−5 (p = 0.453), ninguno significativo. Definiciones: `type_match` es coincidir con el tipo Conventional del commit real; `scope_known`, no usar scope o usar uno ya presente en el repositorio; `first_try`, que la primera respuesta sea usable; `fallback`, que ninguna lo sea y smart-commit escriba el mensaje a partir de la lista de ficheros; `ungrounded`, que ninguna palabra de contenido de la descripción aparezca en el diff, las rutas o el historial; `word_f1`, el solapamiento léxico con el asunto real.

## Requisitos de hardware

- VRAM en bf16: aproximadamente 1,0 GB solo para los pesos (494M × 2 bytes), más caché KV; presupuesto realista de 1,5 a 2 GB según longitud de contexto.
- VRAM en Q4_K_M: 398 MB de fichero; el proceso completo de llama.cpp se mantiene por debajo de 1 GB en uso típico.
- GPU recomendadas: ninguna en particular; el autor solo valida los dispositivos llama.cpp de smart-commit, es decir CPU y GPUs vía Vulkan. Cualquier GPU con 2 GB o más (integrada incluida, por Vulkan) es suficiente; A100, H100 o RTX 4090 están sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en la práctica totalidad, y también en CPU sin acelerador.
- Opciones de despliegue: llama.cpp mediante smart-commit (ruta soportada y evaluada); el GGUF es compatible con el ecosistema llama.cpp en general. El export a OpenVINO no está validado para este modelo. No se documenta despliegue con vLLM ni TGI, aunque los pesos safetensors en bf16 están publicados.
- Latencia y throughput: no disponibles en la información proporcionada. La evaluación se hizo con decodificación greedy sobre Vulkan, pero no se publican tiempos por petición ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | type_match (eval-v1, lista anotada) | first_try | ungrounded | Formatos |
|---|---|---|---|---|---|---|---|
| smart-commit-0.5b-v0.3 | 494M | No indicado (base: 32.768) | Apache-2.0 | 0.668 | 0.996 | 0.008 | safetensors, GGUF |
| smart-commit-0.5b-v0.1 | 494M | No indicado (base: 32.768) | Apache-2.0 | 0.648 | 0.960 | 0.116 | No disponible en la información |
| Qwen2.5-Coder-0.5B-Instruct (control recuantizado) | 494M | 32.768 | Apache-2.0 | 0.352 | 0.336 | 0.296 | safetensors, GGUF |
| Línea smart-commit 0.2 | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La línea 0.2 del mismo autor se entrenó sin las reglas en el prompt y no se ha evaluado con estas métricas en la información disponible. No se dispone de datos de otros modelos orientados a mensajes de commit para una comparación externa.

## Limitaciones y advertencias

- **Modelo de una sola tarea**: está entrenado con el prompt exacto de smart-commit con `--rules full`; fuera de ese formato de entrada su comportamiento no está evaluado y no debe usarse como modelo de chat o de generación de código general.
- **Solo inglés**: el modelo declara `language: en` y toda la evaluación es en inglés; no hay datos de rendimiento en castellano ni en otros idiomas.
- **Versión experimental**: el autor indica explícitamente que la 0.3 sigue siendo experimental mientras cambia la receta de entrenamiento; no hay garantía de estabilidad entre versiones.
- **Tipo de commit poco fiable**: type_match de 0,668 y type_macro_f1 de 0,552 sobre commits Conventional; el propio DPO no mejora el tipo de forma significativa (p = 0.332). Dos de cada tres commits reciben el tipo correcto, con especial debilidad en clases poco frecuentes.
- **Scopes no siempre válidos**: scope_known de 0,840 implica que en torno al 16 % de las respuestas usan un scope que el repositorio no había empleado.
- **Contenido genérico**: word_f1 de 0,354 frente al asunto real; el autor lo resume en que el modelo dice lo que el diff dice más que lo que el cambio significa. Para changelogs o descripciones de intención no es adecuado.
- **Degradación en repositorios jóvenes**: con 1 a 5 asuntos previos, type_match baja a 0,596 (lista anotada) frente a 0,638 de v0.1, aunque el fallback se reduce a 0,021.
- **Dependencia de la versión del CLI**: las métricas se midieron con smart-commit 0.9.0 más los commits de `main` hasta `236d51f`; cambios en el prompt o en los reintentos alteran los resultados.
- **Sesgo de dominio**: entrenado con CommitChronicle, compuesto por repositorios públicos de GitHub en inglés con predominio de Conventional Commits; los estilos de commit corporativos o no convencionales están infrarrepresentados.
- **Licencia**: los pesos son Apache-2.0 y permiten uso comercial; la licencia del dataset CommitChronicle no se detalla en la información disponible y conviene verificarla antes de un uso comercial intensivo.
- **Riesgo de alucinación**: mitigado pero no nulo; ungrounded de 0,008 en eval-v1 no equivale a cero, y el modelo puede omitir información relevante del diff al ceñirse a lo literal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LucasBRT/smart-commit-0.5b-v0.3
- Versión anterior v0.1: https://huggingface.co/LucasBRT/smart-commit-0.5b-v0.1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- Repositorio del CLI smart-commit: https://github.com/Lucas-BRT/smart-commit
- Documentación de la evaluación y del entrenamiento: https://github.com/Lucas-BRT/smart-commit/blob/main/training/README.md
- Dataset CommitChronicle: https://huggingface.co/datasets/JetBrains-Research/commit-chronicle
