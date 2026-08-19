# ProCreations/grug-v1.1-qwen-3.8-27b

## Resumen

grug-v1.1-qwen-3.8-27b es un ajuste fino del modelo Qwen/Qwen3.8-27B, desarrollado por ProCreations, cuyo objetivo es reducir drásticamente el "overthinking" (razonamiento excesivo) que caracteriza a los modelos de razonamiento modernos. El modelo mantiene la calidad de las respuestas del base pero genera cadenas de pensamiento mucho más cortas y directas, en un estilo denominado "grug": pensamiento telegráfico, sin relleno gramatical, que produce respuestas finales en inglés normal. Está pensado para entornos donde el coste por token de razonamiento es crítico, como agentes autónomos, tool calling y pipelines de generación de código.

El modelo se construye mediante SFT sobre un corpus de 1 millón de filas con pensamiento "grug" y una LoRA correctiva de rango 32 aplicada al 50 % de su fuerza. En las pruebas publicadas, reduce los tokens de razonamiento en HumanEval de 559 a 79,5 (7 veces menos) y mejora la selección de herramienta correcta en tareas agénticas del 23,5 % al 97,1 %. La arquitectura base es un transformer decoder-only de 27 356 millones de parámetros, con licencia Apache 2.0 y pesos en safetensors. La longitud de contexto no se especifica en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3.8-27B) |
| Parametros totales | 27.356.728.560 (~27,4 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer decoder-only con soporte de razonamiento explicito mediante el campo `reasoning_content` y la plantilla de chat con `reasoning_effort` (niveles low, medium y xhigh). Sobre esta base, ProCreations aplica dos etapas de entrenamiento: primero, un SFT sobre un corpus propio de 1 millon de filas donde cada ejemplo contiene un pensamiento interno "grug" (telegrafico, sin palabras funcionales, con ratio de palabras funcionales de 0,01-0,09) seguido de una respuesta final en ingles normal. Segundo, una LoRA correctiva de rango 32 entrenada para reforzar el comportamiento de tool calling, que se fusiona al 50 % de su fuerza porque a intensidad completa degrada el rendimiento en codigo (HumanEval 84,8 vs 94,5 al 50 %).

Durante el desarrollo se detectaron tres problemas en los datos de entrenamiento que se corrigieron: historias agénticas que terminaban con un resumen en lugar de una llamada a herramienta, pensamientos en ingles en lugar de estilo grug, y dobles bloques de pensamiento causados por la plantilla de Qwen3.8. El modelo soporta el parametro `reasoning_effort` de la plantilla base, y las pruebas muestran que el nivel medio (medium) es el optimo: supera a low y xhigh en 5 de 7 benchmarks, mientras que xhigh degrada la seleccion de herramienta (76,5 % frente a 97,1 % en medium).

## Capacidades

- Generacion de texto y razonamiento con cadenas de pensamiento internas extremadamente concisas (estilo grug), manteniendo respuestas finales en ingles natural.
- Razonamiento matematico y logico: GSM8K 92,5 y MATH-500 72,7 en configuracion medium.
- Generacion de codigo: HumanEval 94,5 y MBPP 88,0, con un coste de tokens de razonamiento muy inferior al modelo base (79,5 tokens frente a 559 en HumanEval).
- Tool calling y function calling: 100 % de llamadas validas y 97,1 % de seleccion de herramienta correcta en tareas agénticas, frente al 23,5 % del base.
- Recuperacion ante fallos de herramienta: 100 % de llamadas validas y 82,5 % de seleccion de herramienta correcta tras un error.
- Control del esfuerzo de razonamiento mediante el parametro `reasoning_effort` (low, medium, xhigh), con modo low que reduce un 32 % los tokens de pensamiento a costa de ~7 puntos en HumanEval.
- Resistencia a la repeticion: 88,4 en la prueba de estres de repeticion, superior al base (76,7).
- El tag `image-text-to-text` sugiere posible soporte multimodal del modelo base, pero no hay documentacion en la model card que confirme capacidades de vision en este ajuste.

## Casos de uso

- Agentes autonomos con tool calling: el modelo selecciona la herramienta correcta en el 97,1 % de los casos y genera llamadas validas el 100 % de las veces, lo que lo hace adecuado para agentes que interactuan con APIs, bases de datos o motores de busqueda sin supervision humana constante.
- Generacion de codigo en produccion: con HumanEval 94,5 y un coste de razonamiento de 79,5 tokens por problema, puede integrarse en pipelines de CI/CD para generar tests, parches o documentacion tecnica sin disparar la factura de inferencia.
- Asistentes de soporte tecnico con contexto largo: aunque la longitud de contexto no esta documentada, el modelo base Qwen3.8-27B soporta ventanas amplias; su razonamiento eficiente permite mantener conversaciones multi-turno con historial extenso sin degradar la latencia.
- Automatizacion de tareas de datos: para transformar consultas en lenguaje natural en llamadas a herramientas de analisis (SQL, pandas, APIs de visualizacion), aprovechando su alta precision en seleccion de herramienta y argumentos validos.
- Razonamiento matematico en entornos con recursos limitados: con GSM8K 92,5 y MATH-500 72,7, puede desplegarse en GPUs de consumo medio usando el modo low para reducir aun mas el coste por consulta.
- Sistemas de recuperacion ante fallos: en pipelines donde una herramienta puede fallar, el modelo mantiene un 82,5 % de acierto al elegir la siguiente accion, util para orquestadores de tareas con reintentos.
- Educacion y tutoria: genera explicaciones paso a paso con razonamiento interno breve, adecuado para asistentes de estudio que necesitan respuestas rapidas y claras sin divagaciones.

## Benchmarks y rendimiento

La model card publica resultados completos con el mismo harness y configuracion para el modelo base, grug v1 y grug v1.1. Se usaron conjuntos completos: HumanEval 164, MBPP 100, GSM8K 200, MATH-500 150, agentic 68, recovery 80 y repetition 43, con esfuerzo de razonamiento medio.

| Benchmark | Qwen3.8 base | grug v1 | grug v1.1 |
|---|---|---|---|
| HumanEval | 98,2 | 87,8 | **94,5** |
| MBPP | 93,0 | 84,0 | **88,0** |
| GSM8K | 95,5 | 96,5 | **92,5** |
| MATH-500 | 78,0 | 64,7 | **72,7** |
| Repetition stress | 76,7 | 81,4 | **88,4** |
| Agentic — llamada valida | 98,5 | 100,0 | **100,0** |
| Agentic — herramienta correcta | 23,5 | 95,6 | **97,1** |
| Agentic — argumentos validos | 98,5 | 100,0 | **100,0** |
| Recovery — llamada valida | 100,0 | 100,0 | **100,0** |
| Recovery — herramienta correcta | 32,5 | 90,0 | **82,5** |
| Bucles / think sin cerrar | — | — | **0 / 0** |

Tokens medios de razonamiento por respuesta:

| Benchmark | Qwen3.8 base | grug v1 | grug v1.1 |
|---|---|---|---|
| HumanEval | 559,0 | 42,2 | **79,5** |
| MBPP | 656,4 | 34,6 | **301,2** |
| GSM8K | 204,5 | 76,0 | **64,9** |
| MATH-500 | 750,5 | 163,2 | **190,3** |
| Paso agéntico | 108,5 | 29,4 | **20,0** |
| Recuperacion de fallo | 78,2 | 33,4 | **24,0** |

Tambien se evaluo el efecto del parametro `reasoning_effort` en el modelo liberado:

| Probe | low | medium | xhigh |
|---|---|---|---|
| HumanEval | 87,2 | **94,5** | 92,1 |
| MBPP | 85,0 | **88,0** | 81,0 |
| GSM8K | 91,5 | **92,5** | 90,5 |
| MATH-500 | 70,0 | **72,7** | 72,0 |
| Agentic — herramienta correcta | 89,7 | **97,1** | 76,5 |
| Recovery — herramienta correcta | 85,0 | 82,5 | **86,2** |
| Repetition stress | **93,0** | 88,4 | 90,7 |
| Suma de tokens de pensamiento | **464** | 680 | 628 |

## Requisitos de hardware

- El repositorio pesa 54,7 GB en safetensors, lo que corresponde a pesos en BF16/FP16 para 27,4 B de parametros. La VRAM necesaria para cargar el modelo completo es de aproximadamente 55 GB.
- En GPU de consumo, no cabe en una RTX 4090 (24 GB) ni en una RTX 3090 (24 GB) sin cuantizacion. Se necesitarian GPUs profesionales como A100 80 GB, H100 80 GB o multiples GPUs de 24 GB con tensor parallelism.
- No se proporcionan cuantizaciones oficiales (GGUF, AWQ, GPTQ) en el repositorio, por lo que para despliegue en consumer GPU seria necesario cuantizar manualmente o esperar a versiones comunitarias.
- Opciones de despliegue compatibles: transformers, vLLM, TGI y cualquier servidor que soporte el formato safetensors y la plantilla de chat de Qwen3.8. No hay soporte nativo documentado para llama.cpp u Ollama sin conversion previa.
- La latencia y el throughput no estan publicados, pero la reduccion de tokens de razonamiento (por ejemplo, 79,5 frente a 559 en HumanEval) implica un ahorro sustancial en tiempo de generacion y coste por consulta en comparacion con el modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval | GSM8K | Tool correcta | Licencia |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,4 B | No disponible | 98,2 | 95,5 | 23,5 % | Apache 2.0 |
| grug v1 (Qwen3.6) | ~27 B | No disponible | 87,8 | 96,5 | 95,6 % | Apache 2.0 |
| grug v1.1 (este) | 27,4 B | No disponible | 94,5 | 92,5 | 97,1 % | Apache 2.0 |

Frente al modelo base, grug v1.1 sacrifica entre 1 y 5 puntos en codigo y matematicas a cambio de una reduccion de 7 a 30 veces en tokens de razonamiento y una mejora espectacular en seleccion de herramienta. Frente a grug v1, grug v1.1 gana en HumanEval, MBPP, MATH-500, repeticion y seleccion de herramienta, pero pierde en GSM8K (92,5 vs 96,5) y en recuperacion de herramienta (82,5 vs 90,0). No se dispone de datos de otros modelos de 27 B comparables en las mismas condiciones de evaluacion.

## Limitaciones y advertencias

- Rendimiento inferior al base en GSM8K (92,5 frente a 95,5) y en recuperacion de herramienta tras fallo (82,5 frente a 90,0 de grug v1). Si el caso de uso prioriza matematicas de nivel escolar o reintentos agiles, el base o grug v1 pueden ser mejores.
- El modo de razonamiento xhigh degrada activamente la seleccion de herramienta (76,5 % frente a 97,1 % en medium). Se recomienda usar medium o low, nunca xhigh, en tareas agénticas.
- Solo soporta ingles. No hay evidencia de capacidades multilingues, a pesar de que el modelo base podria tenerlas.
- El tag `image-text-to-text` sugiere posible multimodalidad, pero no hay documentacion ni ejemplos que la confirmen en este ajuste. No debe asumirse soporte de vision.
- Riesgo de alucinacion inherente a los modelos de lenguaje; el estilo de pensamiento conciso no elimina este riesgo y podria enmascarar errores de razonamiento al omitir pasos intermedios.
- No se publican cuantizaciones oficiales, lo que limita el despliegue en hardware de consumo sin trabajo adicional de conversion.
- La longitud de contexto no esta documentada; se desconoce el comportamiento del modelo en ventanas muy largas.
- El entrenamiento con LoRA al 50 % de fuerza es un equilibrio deliberado; modificaciones posteriores del adapter podrian romper el balance entre calidad de codigo y tool calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ProCreations/grug-v1.1-qwen-3.8-27b
- Version anterior grug-27b-v1.1: https://huggingface.co/ProCreations/grug-27b-v1.1
- Version original grug-27b: https://huggingface.co/ProCreations/grug-27b
- Ficha en LLM Explorer: https://llm-explorer.com/model/ProCreations%2Fgrug-27b,4I3COxIuitPNrvIAJrjQMi
- Pagina de inferencia en FriendliAI: https://friendli.ai/models/ProCreations/grug-27b-v1.1
- Analisis de Qwen 3.8 27B (modelo base) por Simon Willison: https://simonwillison.net/2026/Aug/16/qwen-38-27b/
