# sigmanih/Qwen-Qwen3-0.6B-GGUF-Q6_K

## Resumen

Qwen-Qwen3-0.6B-GGUF-Q6_K es una cuantizacion en formato GGUF del modelo Qwen3-0.6B, publicada por el usuario sigmanih a traves de su herramienta Sigma Studio. Se trata de un modelo de lenguaje de 0.6 mil millones de parametros activos, basado en la arquitectura qwen3, disenado para ejecucion en dispositivos con recursos limitados como equipos edge, agentes de voz en tiempo real y cargas de trabajo en CPU. El archivo pesa 0.58 GB y ofrece una ventana de contexto de 40.960 tokens, lo que lo hace adecuado para tareas de generacion de texto con contexto largo en entornos locales.

El modelo se distribuye exclusivamente en formato GGUF con cuantizacion Q6_K, lo que permite su uso directo con llama.cpp y otros motores compatibles. Segun la model card, esta pensado para inferencia en produccion en dispositivos de bajo consumo, y el autor ha medido velocidades de hasta 389 tokens por segundo en una GPU NVIDIA RTX 5070 Ti. Aunque el modelo base Qwen3-0.6B soporta modo de pensamiento (thinking mode) y no pensamiento, esta cuantizacion no documenta explicitamente esa capacidad, por lo que se asume que hereda las capacidades del modelo original.

La relevancia de esta publicacion radica en su enfoque practico: ofrece un modelo pequeno, rapido y facil de desplegar, con benchmarks publicados por el autor sobre una muestra de datasets estandar. No obstante, hay que tener en cuenta que los resultados de evaluacion se basan en una fraccion de cada dataset, no en la suite completa, y que la licencia figura como "other", lo que exige revision antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3 (transformer denso, 28 capas, dimension oculta 1024) |
| Parametros totales | 751.632.384 (dato del modelo base en safetensors) |
| Parametros activos | 0.6B (segun la model card) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | Q6_K (esta version); Q4_K_S disponible en otro repositorio del mismo autor |
| Idiomas soportados | ingles, italiano (segun la model card) |
| Licencia | other (el badge del README indica Apache-2.0, pero el campo oficial es "other") |
| Formato de pesos | GGUF (Q6_K) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura qwen3 de Qwen, un transformer causal denso con 28 capas y dimension oculta de 1024. No es un modelo de mezcla de expertos (MoE), por lo que todos los parametros se activan en cada inferencia. El modelo original Qwen3-0.6B fue entrenado por Alibaba Cloud con un enfoque que combina datos multilingues y un proceso de alineacion que incluye aprendizaje por refuerzo con retroalimentacion humana (RLHF) y optimizacion de preferencias directa (DPO), aunque los detalles especificos del entrenamiento no se detallan en la model card de esta cuantizacion.

Esta version concreta es una cuantizacion Q6_K del modelo base, realizada por sigmanih mediante su herramienta Sigma Studio. La cuantizacion reduce el peso de los parametros a 6 bits por valor, lo que explica el tamano de archivo de 0.58 GB frente a los aproximadamente 1.5 GB que ocuparia el modelo en precision completa. No se documentan innovaciones tecnicas adicionales en la cuantizacion; se trata de una conversion estandar a GGUF compatible con llama.cpp.

## Capacidades

- Generacion de texto conversacional y de continuacion de texto en ingles e italiano.
- Razonamiento basico y de sentido comun, con resultados moderados en datasets como ARC-Challenge (56%) y BIG-Bench Hard (57%).
- Matematicas de nivel escolar, con un 89% de aciertos en GSM8K y un 67% en MATH (segun la muestra evaluada).
- Generacion de codigo Python, aunque con rendimiento limitado (29% en HumanEval y 56% en MBPP).
- Factualidad y resistencia a la alucinacion relativamente buena, con un 89% en TruthfulQA.
- Capacidad de ejecucion en CPU y en GPUs de baja gama gracias a su tamano reducido.
- Compatible con llama.cpp y con la herramienta Sigma Studio para despliegue local.
- No se documenta soporte explicito para tool calling, function calling ni modo agente en esta cuantizacion, aunque el modelo base Qwen3-0.6B si lo incluye; se asume que la cuantizacion conserva esas capacidades, pero no estan verificadas.

## Casos de uso

- Asistentes conversacionales en dispositivos edge: el modelo puede ejecutarse en un Raspberry Pi o en un mini PC gracias a su tamano de 0.58 GB, ofreciendo respuestas en tiempo real con una latencia baja. Es adecuado para prototipos de asistentes de voz locales sin conexion a internet.
- Atencion al cliente automatizada en italiano e ingles: con una ventana de contexto de 40.960 tokens, puede mantener conversaciones multi-turno largas sin perder el hilo, gestionando consultas frecuentes y derivando casos complejos a un agente humano.
- Generacion de codigo en entornos de desarrollo locales: aunque su rendimiento en HumanEval es limitado (29%), puede usarse para autocompletar fragmentos de codigo sencillos o para generar plantillas en Python, especialmente en entornos donde no se permite enviar datos a la nube.
- Educacion y practica de matematicas: con un 89% en GSM8K, puede resolver problemas de matematicas de nivel escolar y explicar los pasos, util como herramienta de apoyo en aplicaciones educativas.
- Filtrado y clasificacion de texto: su capacidad de razonamiento basico permite clasificar correos, resumir documentos cortos o extraer entidades en aplicaciones de procesamiento de lenguaje natural ligeras.
- Prototipado rapido de agentes conversacionales: al ser un modelo pequeno y rapido, es ideal para probar flujos de conversacion y pipelines de generacion antes de escalar a modelos mas grandes, reduciendo costes de desarrollo.
- Inferencia en tiempo real en servidores con GPUs modestas: con 389 tokens por segundo en una RTX 5070 Ti, puede servir multiples peticiones simultaneas en aplicaciones de chat en vivo sin necesidad de hardware de alta gama.

## Benchmarks y rendimiento

El autor publico resultados de evaluacion sobre una muestra de cada dataset, no sobre la suite completa, y advierte explicitamente que estos valores no son comparables con una corrida completa. Los datos se obtuvieron con temperatura 0.0 y semilla 42 en una GPU.

| Dataset | Dominio | Correctos / Total | Precision (%) |
|---|---|---|---|
| ARC-Challenge | Razonamiento cientifico y escolar | 5 / 9 | 56 |
| BIG-Bench Hard | Logica y simbolos complejos | 4 / 7 | 57 |
| GPQA | Razonamiento academico de posgrado | 0 / 9 | 0 |
| GSM8K | Matematicas de escuela | 8 / 9 | 89 |
| HellaSwag | Sentido comun y NLI situacional | 4 / 9 | 44 |
| HumanEval | Codigo Python (pass@1) | 2 / 7 | 29 |
| MATH | Matematicas de competicion | 6 / 9 | 67 |
| MBPP | Programacion Python con tests | 5 / 9 | 56 |
| MMLU | Conocimiento general multi-tema | 4 / 14 | 29 |
| MMLU-Pro | Razonamiento avanzado multi-paso | 0 / 9 | 0 |
| TruthfulQA | Factualidad y anti-alucinacion | 8 / 9 | 89 |
| **Total** | **Todos los datasets** | **46 / 100** | **46** |

Ademas, el autor midio velocidades en una NVIDIA GeForce RTX 5070 Ti con 15.9 GB de VRAM: 389.1 tokens por segundo en decodificacion de un solo flujo, 1812 tokens por segundo en procesamiento de prompt y 434.8 tokens por segundo en rendimiento agregado con varias peticiones en vuelo. Estas cifras corresponden a esa maquina concreta y no son extrapolables a otros hardware.

## Requisitos de hardware

- Tamano del archivo: 0.58 GB, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM libre, aunque no se especifica el requisito minimo oficial.
- GPU recomendada: NVIDIA RTX 5070 Ti (15.9 GB VRAM) fue la usada para las mediciones de velocidad; se espera que funcione en GPUs de gama media como RTX 3060, RTX 4060 o incluso en iGPUs modernas.
- CPU: al ser un modelo de 0.6B, puede ejecutarse en CPU con llama.cpp, aunque la velocidad dependera de la memoria RAM y del ancho de banda.
- Opciones de despliegue: llama.cpp (compatible con llama-cli), Sigma Studio (herramienta del autor), y cualquier motor que soporte GGUF como Ollama o LM Studio.
- Latencia: 389.1 tokens por segundo en decodificacion de un solo flujo en la RTX 5070 Ti; en CPU la latencia sera significativamente mayor, pero no se proporcionan datos.
- Throughput: 434.8 tokens por segundo en modo agregado con varias peticiones simultaneas en la misma GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Rendimiento (muestra) |
|---|---|---|---|---|---|
| sigmanih/Qwen-Qwen3-0.6B-GGUF-Q6_K | 0.6B | 40.960 | GGUF Q6_K | other | 46% total (muestra) |
| sigmanih/Qwen-Qwen3-0.6B-GGUF-Q4_K_S | 0.6B | 40.960 | GGUF Q4_K_S | other | no disponible |
| Qwen/Qwen3-0.6B (modelo base) | 0.6B | 40.960 | safetensors | Apache-2.0 | no disponible en esta ficha |

La comparacion con el modelo base no es posible en terminos de rendimiento porque no se dispone de benchmarks publicados para Qwen3-0.6B en su version original. La diferencia principal entre las dos cuantizaciones del mismo autor es el nivel de precision (Q6_K frente a Q4_K_S), que afecta al tamano y a la velocidad, pero no se han publicado mediciones comparativas. No se incluyen otros modelos de 0.6B como Qwen2.5-0.5B o SmolLM2-0.6B por falta de datos comparables en la informacion disponible.

## Limitaciones y advertencias

- Rendimiento muy bajo en tareas de razonamiento avanzado: 0% en GPQA y MMLU-Pro, lo que indica que no es adecuado para problemas academicos o cientificos complejos.
- Generacion de codigo limitada: 29% en HumanEval, por lo que no debe usarse como asistente de programacion principal en produccion.
- Conocimiento general debil: 29% en MMLU, lo que limita su utilidad en tareas que requieran amplia cultura general.
- Riesgo de alucinacion: aunque TruthfulQA muestra un 89%, el modelo puede inventar informacion en contextos no cubiertos por su entrenamiento, especialmente en italiano, donde los datos pueden ser menos abundantes.
- Licencia "other": a pesar del badge Apache-2.0 en el README, el campo oficial de licencia es "other", lo que exige revisar los terminos exactos antes de un uso comercial.
- Idiomas limitados: la model card solo declara ingles e italiano, aunque el modelo base Qwen3 soporta mas idiomas; no se garantiza un rendimiento adecuado en otros.
- Benchmarks no comparables: los resultados se basan en una muestra de 100 preguntas en total, no en las suites completas, por lo que no deben usarse para comparar con otros modelos.
- Sin soporte documentado para tool calling ni modo agente en esta cuantizacion, aunque el modelo base los incluye; se recomienda verificar antes de integrarlo en pipelines de agentes.
- Velocidades medidas solo en una GPU concreta; no se pueden extrapolar a otros hardware sin riesgo de error significativo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sigmanih/Qwen-Qwen3-0.6B-GGUF-Q6_K
- Repositorio del modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio GGUF oficial de Qwen3: https://huggingface.co/Qwen/Qwen3-0.6B-GGUF
- GitHub de Sigma Studio: https://github.com/Sigmanih/SigmaStudio
- GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Version Q4_K_S del mismo autor: https://huggingface.co/sigmanih/Qwen-Qwen3-0.6B-GGUF-Q4_K_S
