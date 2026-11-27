# sigmanih/microsoft-phi-4-GGUF-Q4_K_S

## Resumen

`sigmanih/microsoft-phi-4-GGUF-Q4_K_S` es una cuantizacion GGUF del modelo `microsoft/phi-4` de Microsoft, publicada por el usuario sigmanih bajo la etiqueta Sigma Studio. El modelo base Phi-4 es un transformer denso de aproximadamente 14.660 millones de parametros (14,66 B), disenado originalmente para razonamiento, matematicas y generacion de codigo, y esta empaquetado aqui en formato GGUF con cuantizacion `Q4_K_S`, lo que reduce el peso en disco a unos 7,88 GB.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de clase 14 B en hardware de consumo (GPU de 12-16 GB de VRAM o CPU con RAM suficiente) mediante llama.cpp y ecosistemas compatibles, a costa de una perdida de precision respecto a los pesos originales en safetensors. La model card declara 16.384 tokens de contexto, 40 capas y una dimension oculta de 5120, coherentes con la arquitectura `phi3` del modelo base.

Conviene senalar que esta ficha describe una cuantizacion de terceros, no el modelo oficial de Microsoft: las capacidades reales dependen del Phi-4 original, mientras que el rendimiento medido y las cifras de benchmark aqui recogidas provienen de la evaluacion propia del publicador (Sigma Studio Training Lab) y deben tomarse con cautela, ya que se realizaron sobre subconjuntos reducidos de cada suite.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura base `phi3`), 40 capas, hidden size 5120 |
| Parametros totales | 14.659.507.200 (~14,66 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 16.384 tokens (segun model card del publicador) |
| Tipos de cuantizacion | GGUF `Q4_K_S` (unica variante publicada en este repo) |
| Idiomas soportados | en, it (segun metadatos del repo) |
| Licencia | `other` (heredada del modelo base `microsoft/phi-4`; revisar los terminos de Microsoft Phi-4) |
| Formato de pesos | GGUF (`Q4_K_S`); tamano del repo 8,5 GB, huella en disco declarada 7,88 GB |
| Modelo base | `microsoft/phi-4` |
| Uso de VRAM/RAM | ~10,0 GB VRAM con offload completo a GPU; ~9,8 GB RAM en CPU/hibrido |
| Hardware recomendado | GPU con 12-16 GB VRAM (RTX 3060/4070) o 32 GB de RAM |
| Compatibilidad | llama.cpp, endpoints compatibles (`endpoints_compatible`) |

## Arquitectura y entrenamiento

El modelo subyacente es `microsoft/phi-4`, un transformer denso de tipo decoder-only con arquitectura de la familia `phi3`, 40 capas y una dimension oculta de 5120, que suma 14.659.507.200 parametros. Esta publicacion no entrena ni modifica el modelo: solo aplica cuantizacion de pesos a `Q4_K_S` mediante el modulo Model Hub de Sigma Studio, generando un artefacto GGUF compatible con llama.cpp. No se dispone en la informacion proporcionada de detalles sobre el dataset de entrenamiento original de Phi-4 (numero de tokens, composicion, fases de RLHF/DPO); esos datos corresponden a la model card oficial de Microsoft, no a esta cuantizacion.

La innovacion tecnica relevante aqui es la propia cuantizacion: `Q4_K_S` aplica cuantizacion de bloque con escalas y minimos por superbloque, reduciendo el peso a aproximadamente 4 bits por parametro con un formato optimizado para decodificacion en CPU y GPU. El publicador declara dos modos de ejecucion, "No-Thinking" (respuesta directa) y "Deep Thinking" (cadena de razonamiento CoT), con una mejora declarada de +8,3 % en precision al activar CoT. No se documenta en la informacion disponible ninguna tecnica adicional como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles e italiano (idiomas declarados en el repo).
- Razonamiento matematico de varios pasos, incluyendo problemas de competicion (suite MATH) y aritmetica escolar (GSM8K).
- Generacion de codigo en Python, con soporte para pruebas unitarias (HumanEval, MBPP).
- Razonamiento cientifico y de sentido comun (ARC-Challenge, HellaSwag, BIG-Bench Hard).
- Modo de razonamiento explicito ("Deep Thinking" / CoT) ademas de respuesta directa de baja latencia.
- Tool calling y uso de herramientas con esquemas validos: el publicador reporta un 88,0 % de adherencia al protocolo de herramientas en su sandbox de evaluacion.
- Compatibilidad con llama.cpp y con endpoints compatibles con la API de Hugging Face.
- No se declaran capacidades de vision, audio ni multimodalidad en la informacion disponible.

## Casos de uso

- Asistente de codigo en local: con ~10 GB de VRAM y soporte de Python en HumanEval/MBPP, el modelo puede integrarse en un IDE o CLI para autocompletado y generacion de funciones sin enviar codigo a la nube.
- Razonamiento matematico asistido: el modo CoT (declarado +8,3 % de mejora) lo hace adecuado para resolver problemas de varios pasos en entornos educativos o de analisis, siempre que se acepte la latencia adicional de la cadena de razonamiento.
- Agentes autonomos con tool calling: la adherencia del 88 % al protocolo de herramientas permite construir bucles agente-herramienta en sandboxes controlados, aunque el 0 % de completado autonomo reportado en el sandbox obliga a supervision humana.
- Despliegue en estaciones de trabajo sin GPU dedicada: con ~9,8 GB de RAM en modo CPU/hibrido, puede ejecutarse en portatiles o servidores modestos mediante llama.cpp u Ollama.
- Prototipado rapido de chatbots conversacionales: el formato GGUF y la compatibilidad con endpoints permiten levantar un servicio de chat en minutos para pruebas internas.
- Evaluacion comparativa de cuantizaciones: util para equipos que quieran medir la degradacion de calidad de `Q4_K_S` frente a pesos originales antes de decidir una cuantizacion para produccion.
- Procesamiento de documentos en ingles/italiano: con 16.384 tokens de contexto puede resumir o extraer informacion de documentos de longitud media en esos dos idiomas.

## Benchmarks y rendimiento

Los siguientes datos provienen de la evaluacion propia del publicador (Sigma Studio Training Lab, seed 42, temperatura 0.0) y se realizaron sobre subconjuntos reducidos de cada suite, por lo que no son comparables con ejecuciones completas de los benchmarks oficiales.

| Benchmark | Dominio | Correctas / total | Precision |
|---|---|---|---|
| ARC-Challenge | Ciencia y razonamiento escolar | 8 / 9 | 89 % |
| BIG-Bench Hard | Logica y simbolismo multi-tarea | 6 / 7 | 86 % |
| GPQA | Razonamiento academico de posgrado | 5 / 9 | 56 % |
| GSM8K | Matematicas escolares multi-paso | 9 / 9 | 100 % |
| HellaSwag | Sentido comun y NLI situacional | 4 / 9 | 44 % |
| HumanEval | Codigo Python (pass@1) | 6 / 7 | 86 % |
| MATH | Matematicas de competicion | 8 / 9 | 89 % |
| MBPP | Programacion Python con tests | 7 / 9 | 78 % |
| MMLU | Conocimiento general multi-materia | 7 / 14 | 50 % |
| MMLU-Pro | Razonamiento avanzado multi-paso | 5 / 9 | 56 % |
| TruthfulQA | Factualidad y anti-alucinacion | 7 / 9 | 78 % |
| Total | Todas las suites evaluadas | 72 / 100 | 72 % |

Comparativa de modos de ejecucion declarada por el publicador:

| Modo | Precision | Preguntas superadas | Perfil |
|---|---|---|---|
| No-Thinking (respuesta directa) | 68,4 % | 39 / 57 | Latencia minima, sin tokens de razonamiento |
| Deep Thinking (CoT) | 76,7 % | 33 / 43 | Razonamiento multi-paso, +8,3 % de precision |

Evaluacion de protocolo de herramientas (sandbox del publicador): adherencia al protocolo 88,0 %, completado autonomo de tareas 0,0 %, contencion del sandbox 100 % conforme.

## Requisitos de hardware

- VRAM estimada: ~10,0 GB con offload completo a GPU en `Q4_K_S`; ~9,8 GB de RAM en modo CPU o hibrido.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4070 de 12 GB o superiores; no se documentan resultados en A100/H100 para esta cuantizacion concreta.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas de VRAM; en GPUs de 8 GB requeriria offload parcial a CPU.
- Opciones de despliegue: llama.cpp (formato nativo), endpoints compatibles, y por extension del formato GGUF, herramientas como Ollama o servidores basados en llama.cpp; no se confirma soporte de vLLM o TGI para este artefacto en la informacion disponible.
- Latencia y throughput: no se han publicado cifras de tokens por segundo en la informacion disponible; el publicador solo indica que el modo No-Thinking minimiza la latencia y el modo CoT anade tokens de razonamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| sigmanih/microsoft-phi-4-GGUF-Q4_K_S (esta ficha) | 14,66 B | 16.384 | GGUF Q4_K_S | other (heredada de Phi-4) | Cuantizacion de terceros, ~7,88 GB en disco |
| microsoft/phi-4 (original) | 14,66 B | 16.384 (segun publicador) | safetensors | other (terminos Phi-4 de Microsoft) | Pesos completos, mayor precision, mayor huella |
| Otras cuantizaciones GGUF de phi-4 | 14,66 B | 16.384 | GGUF (Q4_K_M, Q5_K_M, Q8_0, etc.) | segun publicador | No se dispone de datos comparativos de rendimiento en la informacion proporcionada |

No se dispone en la informacion proporcionada de resultados de benchmarks de modelos alternativos comparables (por ejemplo, Llama 3.1 8B o Qwen 2.5 14B) medidos con la misma metodologia, por lo que no se incluye una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- La cuantizacion `Q4_K_S` introduce perdida de precision respecto a los pesos originales en safetensors; los resultados en tareas sensibles a la precision pueden degradarse.
- Los benchmarks publicados se midieron sobre subconjuntos reducidos (por ejemplo, 9 preguntas en varias suites) y el propio publicador advierte que no son comparables con ejecuciones completas.
- El completado autonomo de tareas en el sandbox de herramientas fue del 0,0 %, lo que indica que el modelo no completo ninguna tarea de extremo a extremo sin supervision en esa evaluacion.
- HellaSwag (44 %) y MMLU (50 %) muestran un rendimiento debil en sentido comun y conocimiento general en la evaluacion del publicador.
- Riesgo de alucinacion inherente a los modelos de lenguaje; el 78 % en TruthfulQA no elimina este riesgo en produccion.
- Idiomas declarados limitados a ingles e italiano; no se garantiza un rendimiento adecuado en castellano.
- La licencia es `other` y hereda las restricciones del modelo base `microsoft/phi-4`; es imprescindible revisar los terminos de Microsoft antes de un uso comercial.
- Se trata de una publicacion de terceros con pocas descargas (192) y un solo like en el momento de la consulta; no es un artefacto oficial de Microsoft.
- No se documentan sesgos especificos en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sigmanih/microsoft-phi-4-GGUF-Q4_K_S
- Modelo base: https://huggingface.co/microsoft/phi-4
- Repositorio Sigma Studio: https://github.com/Sigmanih/SigmaStudio
- Perfil del publicador: https://huggingface.co/sigmanih
