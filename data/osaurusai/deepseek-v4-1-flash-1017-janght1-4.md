# OsaurusAI/DeepSeek-V4.1-Flash-1017-JANGHT1.4

## Resumen

DeepSeek-V4.1-Flash-1017-JANGHT1.4 es una cuantización extrema del modelo DeepSeek-V4.1-Flash-1017 publicada por OsaurusAI, pensada para ejecutarse en Macs de 128 GB de memoria unificada mediante el framework MLX de Apple. El modelo base es un Mixture-of-Experts de 40 capas con 384 expertos enrutados por capa (top-6 más un experto compartido), atención dispersa comprimida con ventana local de 128 tokens, dos capas Engram de n-gramas, una torre de visión y un drafter especulativo DSpark de tres etapas. El bundle mantiene en memoria unos 94,8 GiB (92,2 GiB del modelo más 2,6 GiB del drafter) y deja las tablas Engram (203 GB) en SSD, leídas por token.

La innovación principal es la compresión JANGT de los expertos enrutados: códigos trellis con rotación Hadamard-128, ganancias por fila reajustadas sobre las activaciones y columnas atípicas exactas, con anchos asignados por capa y proyección según el efecto medido sobre la KL de los tokens del asistente. El resto de componentes (atención, expertos compartidos, compresor, proyecciones Engram) se reempaquetan en MXFP8 de forma bit-exacta desde los pesos FP8 originales, y los embeddings y el `lm_head` usan 8 bits afines con grupo 64.

El resultado es un modelo de aproximadamente 552B parámetros fuera de las tablas Engram (31,5B en safetensors residentes, con los expertos enrutados representando el 98 % de los parámetros) que ocupa 1,433 bits por peso en su parte residente. La model card documenta una evaluación de fidelidad frente al modelo fuente con KL media de 0,134 en tokens del asistente y top-1 del 89,9 %, lo que lo convierte en una opción relevante para investigadores que quieran ejecutar localmente un MoE de razonamiento, visión y tool calling en hardware Apple Silicon de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención dispersa comprimida (ventana local de 128 tokens), 40 capas, hidden 5120, 384 expertos enrutados por capa (top-6 + experto compartido), 2 capas Engram de n-gramas, torre de visión y drafter especulativo DSpark de 3 etapas |
| Parametros totales | 31.530.338.928 en safetensors residentes; ~552B fuera de las tablas Engram (expertos enrutados = 98 %) |
| Parametros activos | No disponible (top-6 de 384 expertos por capa más experto compartido; el número exacto de activos no se publica) |
| Longitud de contexto | No disponible (ventana local de atención de 128 tokens; contexto global no especificado) |
| Tipos de cuantizacion | JANGT trellis 1–2,5 bits en expertos enrutados (media 1,433 bits/peso residente); MXFP8 en atención, expertos compartidos, compresor y proyecciones Engram; affine 8-bit grupo 64 en embeddings y `lm_head`; affine 8-bit en torre de visión con patch embedding, normas y sesgos en bf16; tablas Engram en precisión completa en SSD |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), con subdirectorios `engram/` y `dspark/`; repo de 304,8 GB |

## Arquitectura y entrenamiento

El modelo base es un MoE de 40 capas con dimensión oculta 5120 y 384 expertos enrutados por capa, de los que se activan los top-6 más un experto compartido. Incorpora atención dispersa comprimida con ventana local de 128 tokens, dos capas Engram basadas en tablas de n-gramas y una torre de visión para entrada de imágenes. Sobre esta arquitectura, el bundle añade un drafter especulativo DSpark de tres etapas que opera en bloques de 5 tokens.

La cuantización JANGT aplica códigos trellis con rotación Hadamard-128 sobre los expertos enrutados, con ganancias por fila reajustadas sobre las activaciones y columnas atípicas preservadas de forma exacta. Los anchos se asignaron por capa y proyección según el efecto medido sobre la KL de los tokens del asistente: gate/up a 1 bit en 33 capas, 1,5 bits en 6 y 2 bits en 1; down a 1 bit en 5 capas, 1,5 en 22, 2 en 12 y 2,5 en 1. El resto de componentes se reempaqueta en MXFP8 de forma bit-exacta desde los pesos FP8 del release, sin recuantización. Las tablas Engram se mantienen byte a byte en los shards originales y nunca residen en memoria.

No se documentan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO). La model card del bundle se centra en la metodología de cuantización y en la evaluación de fidelidad frente al modelo fuente, no en el proceso de entrenamiento original.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento con modo thinking y tres niveles de esfuerzo de razonamiento configurables.
- Entrada de imágenes mediante torre de visión (pipeline image-text-to-text).
- Tool calling y function calling, con formato DSML de llamadas a herramientas.
- Uso como agente en escenarios multi-turno con llamadas a herramientas y resultados intercalados.
- Decodificación especulativa con el drafter DSpark de 3 etapas y bloques de 5 tokens, con verificación exacta: la salida greedy coincide con la decodificación plana (salvo empates bf16) y el muestreo sigue la misma distribución.
- Capacidades de código y razonamiento matemático inferidas del modelo base (no se detallan benchmarks específicos en la información disponible).
- Ejecución local en Apple Silicon mediante MLX y el runtime Osaurus 0.25.27 o superior.

## Casos de uso

- Asistencia de código en local sobre Mac de 128 GB: el modelo soporta tool calling y razonamiento con esfuerzo alto, por lo que puede integrarse en un editor o CLI que ejecute tareas de refactorización y generación de tests sin enviar código a la nube. La model card advierte de que conviene dar un `max_tokens` generoso en preguntas de código largas, ya que en pruebas con un parser IPv4 en Rust cerró el bloque de razonamiento en 3 de 6 ejecuciones entre 3,1k y 6,0k tokens.
- Agentes multi-turno con herramientas: los tokens de llamadas a herramientas DSML muestran un top-1 del 99,6 % y KL de 0,004 frente al fuente, lo que hace al bundle adecuado para orquestación de agentes que dependen de esquemas de herramientas estables.
- Análisis de documentos con imágenes: al aceptar entrada image-text-to-text, puede responder preguntas sobre capturas, diagramas o documentos escaneados; en el dominio de visión el bundle alcanza top-1 del 85,6 % y top-5 del 99,5 % sobre tokens del asistente.
- Automatización de terminal y operaciones: en el dominio terminal la KL media es de 0,063 con top-1 del 90,8 %, útil para asistentes que interpretan salidas de shell y proponen comandos.
- Razonamiento extenso con presupuesto controlado: los tres niveles de esfuerzo permiten ajustar la profundidad de razonamiento según la tarea, con la salvedad de que por encima de 4.000 tokens la probabilidad de cierre de `</think>` cae a una ratio de 2,9× respecto al fuente.
- Procesamiento de oficina y texto estructurado: en el dominio office el bundle logra top-1 del 92,4 % y KL media de 0,124, adecuado para resumen y reescritura de documentos.
- Investigación en cuantización extrema: el bundle incluye artefactos de evaluación (`evaluation/kl_vs_source_heldout.json`, `evaluation/reasoning_close.json`, `evaluation/dspark_acceptance.json`) que permiten reproducir y comparar metodologías de compresión de MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí incluye una evaluación de fidelidad frente al modelo fuente, con KL calculada sobre los top-128 tokens del fuente más un bucket de cola, sobre 118 conversaciones retenidas y 157.086 posiciones puntuadas:

| Dominio retenido | Posiciones | KL media ↓ | KL mediana ↓ | KL p99 ↓ | Top-1 ↑ | Top-5 ↑ | Ruido de referencia (KL / top-1) |
|---|---|---|---|---|---|---|---|
| Agéntico (tool calls, multi-turno) | 20.282 | 0,109 | 0,017 | 1,08 | 89,4 % | 99,8 % | 0,0021 / 98,4 % |
| Código | 31.915 | 0,161 | 0,0014 | 3,01 | 91,1 % | 98,9 % | 0,0015 / 99,1 % |
| Oficina | 4.809 | 0,124 | 0,0006 | 1,94 | 92,4 % | 99,5 % | 0,0008 / 99,3 % |
| Razonamiento (esfuerzo alto/máximo) | 33.873 | 0,139 | 0,0085 | 1,72 | 89,0 % | 99,4 % | 0,0013 / 98,9 % |
| Terminal | 7.556 | 0,063 | 0,013 | 0,64 | 90,8 % | 99,9 % | 0,0009 / 98,9 % |
| Visión (preguntas sobre imágenes) | 4.493 | 0,153 | 0,047 | 1,38 | 85,6 % | 99,5 % | 0,0026 / 98,1 % |
| **Total** | **102.928** | **0,134** | **0,0069** | **1,87** | **89,9 %** | **99,4 %** | **0,0015 / 98,9 %** |

Sobre todas las posiciones puntuadas (incluidos system prompts, esquemas de herramientas, resultados de herramientas y texto de usuario): KL media 0,262, mediana 0,016, top-1 86,4 %, top-5 98,1 % (ruido de referencia 0,0148 / 97,6 %). Donde el fuente asigna ≥ 0,99 a su token principal (51 % de los tokens del asistente), el bundle coincide el 99,3 % de las veces; en el rango 0,9–0,99 coincide el 96,6 %; en 0,5–0,9, el 83,3 %; por debajo de 0,5, el 54,9 %. Los tokens de llamadas a herramientas DSML alcanzan top-1 del 99,6 % y KL de 0,004; el 71 % de la KL agéntica se concentra en el texto de los esquemas de herramientas del system prompt.

En cuanto al cierre de razonamiento, en posiciones `</think>` retenidas la probabilidad de cierre del bundle es de media 2,1× inferior a la del fuente, con ratios de 1,01× en 200–800 tokens, 0,96× en 800–2.000, 1,13× en 2.000–4.000 y 2,9× más allá de 4.000 (solo 4 cierres). No hay ningún caso en que el fuente supere 0,5 y el bundle baje de 0,05.

## Requisitos de hardware

- Memoria: 94,8 GiB residentes en memoria unificada (92,2 GiB del modelo + 2,6 GiB del drafter DSpark). Requiere un Mac de 128 GB para dejar margen al sistema y al contexto.
- Almacenamiento: el repo ocupa 304,8 GB; las tablas Engram (203 GB) residen en SSD y se leen por token, por lo que se recomienda SSD rápido.
- GPU: Apple Silicon con 128 GB de memoria unificada. No está pensado para GPUs NVIDIA (A100, H100, RTX 4090); el formato es MLX y el runtime es Osaurus 0.25.27 o superior.
- No cabe en GPUs de consumo convencionales (RTX 4090 con 24 GB, por ejemplo); el requisito de memoria unificada de 128 GB lo restringe a Mac Studio/MacBook Pro de gama alta.
- Despliegue: runtime Osaurus (versión mínima 0.25.27, `required_osaurus_version` en `osaurus.json`), con librería MLX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. La decodificación especulativa DSpark (3 etapas, bloques de 5 tokens) está incluida y verifica de forma exacta, lo que en principio reduce el número de pasos del modelo objetivo, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-JANGHT1.4 (este) | 31,5B en safetensors residentes; ~552B fuera de Engram | No disponible | JANGT 1,433 bits/peso + MXFP8 + affine 8-bit | MIT | HuggingFace, MLX, runtime Osaurus |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (fuente) | ~552B fuera de Engram | No disponible | FP8 original | No disponible en la información | HuggingFace |
| Otras cuantizaciones de DeepSeek-V4.1-Flash | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks estándar ni de especificaciones de modelos alternativos comparables en la información proporcionada, por lo que la comparativa se limita al modelo fuente y a la ausencia de alternativas documentadas.

## Limitaciones y advertencias

- La cuantización introduce desviaciones medibles: KL media de 0,134 en tokens del asistente y top-1 del 89,9 %, con degradación notable cuando el modelo fuente tiene baja confianza (54,9 % de coincidencia por debajo de 0,5 de probabilidad).
- El cierre de razonamiento se ve afectado: la probabilidad de cerrar `</think>` es 2,1× menor de media, y la ratio empeora hasta 2,9× en razonamientos de más de 4.000 tokens. En código largo conviene fijar `max_tokens` generoso; en pruebas con un parser IPv4 en Rust se observaron bucles de ceros en 2 de 6 ejecuciones, comportamiento que también reproduce el modelo fuente.
- El 71 % de la KL en el dominio agéntico se concentra en el texto de los esquemas de herramientas del system prompt, texto que el modelo lee en lugar de escribir; los esquemas muy largos o inusuales pueden degradar más la fidelidad.
- El texto de ciberseguridad no estaba en los conjuntos de calibración ni de evaluación, por lo que el comportamiento en ese dominio no está caracterizado.
- Idiomas limitados a inglés y chino; no se documenta soporte de castellano.
- La longitud de contexto no se especifica; la atención usa ventana local de 128 tokens y el contexto global efectivo no está documentado.
- El modelo requiere 128 GB de memoria unificada y un SSD con 203 GB libres para las tablas Engram, además del runtime Osaurus 0.25.27 o superior; no es desplegable en GPUs convencionales.
- Licencia MIT: permite uso comercial, pero al derivar del modelo fuente conviene verificar las condiciones del modelo base DeepSeek-V4.1-Flash-1017 antes de producción.
- Riesgo de alucinación inherente al modelo base; no se documentan evaluaciones de sesgo ni de seguridad en la información disponible.
- El repositorio tiene 184 descargas y 0 likes en el momento de la ficha, con fecha de creación de octubre de 2026; se trata de un artefacto reciente y con poca validación comunitaria.

## Enlaces

- HuggingFace del bundle: https://huggingface.co/OsaurusAI/DeepSeek-V4.1-Flash-1017-JANGHT1.4
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Sitio del autor: https://osaurus.ai
- Artefactos de evaluación incluidos en el repo: `evaluation/kl_vs_source_heldout.json`, `evaluation/reasoning_close.json`, `evaluation/dspark_acceptance.json`
- Configuración del runtime: `osaurus.json` (requiere Osaurus 0.25.27 o superior, `model_version` 1)
