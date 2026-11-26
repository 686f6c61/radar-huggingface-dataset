# qualcomm-ai-hub-community/Qwen3.5-9B-NPU-fraQtl

## Resumen

Qwen3.5-9B-NPU-fraQtl es una cuantización Q4_0 del modelo Qwen/Qwen3.5-9B de Alibaba, publicada por el colaborador fraQtl bajo el paraguas de la comunidad qualcomm-ai-hub-community. Su objetivo no es otro que ofrecer una versión de 9B parámetros (8.953.803.264 parámetros reales) ejecutable en la NPU Hexagon de los SoC Snapdragon, manteniendo la fidelidad respecto al modelo original en tareas de tool calling y razonamiento. El repositorio ocupa 5,4 GB y contiene un único archivo GGUF de 5.375.223.008 bytes.

La innovación principal es metodológica: en lugar de aplicar un redondeo round-to-nearest estándar, se emplea redondeo GPTQ ponderado por Hessiano con una importance matrix construida a partir de conversaciones de chat y tool use renderizadas con la plantilla de chat propia de Qwen. Además, se reasignan los tensores Q5_K del mapa de tipos de unsloth a Q4_0 para que todas las matmuls sean compatibles con Hexagon, y se elevan cinco tensores a Q8_0 dentro del mismo presupuesto de bytes.

El resultado, según la model card, es un archivo que iguala en velocidad de decodificación a la cuantización de referencia de unsloth (15,33 frente a 15,24 tok/s en Snapdragon 8 Elite Gen 6) y mejora ligeramente en benchmarks de tool calling (BFCL v4 live) y conocimiento (MMLU-Pro), con menos respuestas del modelo original alteradas. Es relevante para despliegues en dispositivo con llama.cpp y backend Hexagon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivada de Qwen3.5-9B); detalles internos del modelo base no disponibles en la informacion proporcionada |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_0 (mapa de tipos de unsloth con Q5_K convertidos a Q4_0) y 5 tensores elevados a Q8_0 |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo Qwen3.5-9B-fraQtl-NPU-Q4_0.gguf) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del checkpoint Qwen3.5-9B, por lo que hereda la arquitectura del modelo base, si bien la informacion proporcionada no detalla su configuracion interna (numero de capas, dimensiones, tipo de atencion). Lo relevante aqui es el proceso de cuantizacion: se parte de los pesos en bf16 y se aplica redondeo GPTQ ponderado por Hessiano (Frantar et al., 2022) en lugar de round-to-nearest, usando una importance matrix derivada de una mezcla de calibracion de conversaciones de chat y tool use renderizadas con la plantilla de chat de Qwen.

Sobre el mapa de tipos de unsloth se realiza una modificacion deliberada: los tensores Q5_K se reasignan a Q4_0 para que todas las multiplicaciones de matrices sean soportadas por la NPU Hexagon, y cinco tensores se elevan a Q8_0 seleccionados por error medido por tensor, todo ello sin superar el presupuesto de bytes de la cuantizacion de referencia. El resultado son 5.375.223.008 bytes (46 MB mas que la variante sin elevaciones), con todas las matmuls compatibles con Hexagon y carga en llama.cpp estandar sin parches.

## Capacidades

- Generacion de texto conversacional en formato chat, usando la plantilla de Qwen del modelo base.
- Tool calling y function calling, evaluado con BFCL v4 live (llamadas simples, multiples, paralelas y paralelas multiples).
- Deteccion de irrelevancia: capacidad de decidir cuando no invocar una herramienta (633 aciertos en BFCL live frente a 594 de unsloth Q4_0).
- Razonamiento y conocimiento general, medido con MMLU-Pro (6.303 aciertos sobre 12.032 preguntas).
- Razonamiento matematico, medido con GSM8K (1.249 aciertos sobre 1.319).
- Seguimiento de instrucciones, medido con IFEval strict (453 sobre 541).
- Generacion de codigo, medido con EvalPlus (366 sobre 563).
- Ejecucion en NPU Hexagon de Snapdragon mediante el backend Hexagon de llama.cpp, ademas de CPU y GPU.
- Modo thinking desactivable: los benchmarks se ejecutaron con thinking off, lo que sugiere soporte de un modo de razonamiento explicito heredado del modelo base.
- Capacidades multimodales, de audio o de vision: no disponibles en la informacion proporcionada (la model card indica "Text model only").

## Casos de uso

- Asistentes de voz y chat en dispositivo: el modelo corre en la NPU Hexagon de un Snapdragon 8 Elite Gen 6 a 15,33 tok/s de decodificacion y 1.031 tok/s de prefill, suficiente para respuestas conversacionales fluidas sin conexion a la nube.
- Agentes de tool calling en movil: con 1.074 llamadas correctas en BFCL v4 live y una tasa baja de respuestas rotas respecto al original (88 frente a 141 de unsloth), es adecuado para asistentes que invocan APIs del sistema (calendario, clima, mensajeria) y deben decidir con precision cuando no llamar a ninguna herramienta.
- Automatizacion de atencion al cliente en el borde: al ejecutarse localmente en el dispositivo, permite gestionar conversaciones multi-turno sin enviar datos del usuario a servidores externos, lo que simplifica el cumplimiento de privacidad.
- Clasificacion y extraccion de informacion estructurada: su rendimiento en IFEval strict (453/541) y MMLU-Pro lo hacen util para tareas de etiquetado, resumen y extraccion de campos en pipelines locales.
- Razonamiento matematico asistido en aplicaciones educativas: con 1.249 aciertos en GSM8K sobre 1.319, puede resolver problemas aritmeticos de nivel escolar en un telefono sin coste de inferencia en la nube.
- Generacion y revision de codigo en entornos de desarrollo integrados ligeros: 366 aciertos en EvalPlus permiten autocompletado y correccion de fragmentos en herramientas de escritorio o moviles con aceleracion NPU.
- Prototipado e investigacion en cuantizacion: el repositorio documenta con detalle el metodo (GPTQ con imatrix, reasignacion de tipos, elevaciones Q8_0) y resultados pareados, lo que lo convierte en una referencia reproducible para estudiar el impacto de la cuantizacion en tool calling.

## Benchmarks y rendimiento

Resultados de la model card, con thinking off, greedy y misma ejecucion para todos los archivos. En BFCL v4 live se evaluaron las 2.251 prompts completas.

| Benchmark | fraQtl NPU Q4_0 | unsloth Q4_0 | Original bf16 | Diferencia (Holm p) |
|---|---|---|---|---|
| BFCL v4 live (total, 2.251) | 1.721 | 1.685 | 1.761 | +36 [+15,2] frente a unsloth |
| BFCL tool calls | 1.074 | 1.076 | 1.062 | −2 [−17,1] |
| BFCL sabe cuando no llamar | 633 | 594 | 686 | +39 [+24,9] |
| BFCL respuestas rotas vs original | 88 | 141 | — | — |
| MMLU-Pro (12.032) | 6.303 | 6.165 | 6.434 | +1,15 pt (0,001) |
| GSM8K (1.319) | 1.249 | 1.232 | — | +1,29 pt (0,13) |
| IFEval strict (541) | 453 | 455 | — | −0,37 pt (1,0) |
| EvalPlus (563) | 366 | 355 | — | +1,95 pt (1,0) |

Rendimiento en dispositivo (Snapdragon 8 Elite Gen 6, SM8975, backend Hexagon de llama.cpp, media de dos ejecuciones, orden nuestro-rival-rival-nuestro, sha256 verificado en dispositivo):

| Archivo | Decode tok/s (tg128) | Prefill tok/s (pp512) | Operaciones rechazadas por la NPU |
|---|---|---|---|
| unsloth Q4_0 | 15,24 | 1.029 | 0 |
| fraQtl NPU Q4_0 | 15,33 | 1.031 | 0 |

Las diferencias de velocidad estan dentro del ruido entre ejecuciones. El archivo sin las cinco elevaciones Q8_0 (5.329.085.664 bytes) obtuvo 6.264 en MMLU-Pro y 1.713 en BFCL live, frente a 6.303 y 1.721 de este archivo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,4 GB para los pesos en Q4_0; el espacio adicional para KV cache depende de la longitud de contexto, no disponible en la informacion proporcionada.
- GPU recomendadas: no hay datos especificos para GPU en la model card; el archivo carga en llama.cpp estandar y puede ejecutarse en CPU y GPU ademas de la NPU.
- NPU objetivo: Hexagon de Snapdragon 8 Elite Gen 6 (SM8975), con el backend Hexagon de llama.cpp. Todas las matmuls son compatibles con Hexagon (0 operaciones rechazadas en la prueba).
- Cabe en GPU de consumo: si, con 5,4 GB de pesos es viable en tarjetas con 8 GB o mas de VRAM, aunque no se proporcionan mediciones especificas.
- Opciones de despliegue: llama.cpp (CLI y backend Hexagon), con descarga directa mediante `llama-cli -hf fraQtl/Qwen3.5-9B-NPU-GGUF:Q4_0`. Otros runners (vLLM, TGI, Ollama) no se mencionan en la informacion proporcionada.
- Latencia y throughput: 15,33 tok/s de decodificacion y 1.031 tok/s de prefill en Snapdragon 8 Elite Gen 6; sin datos para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BFCL v4 live | MMLU-Pro | Licencia | Formato |
|---|---|---|---|---|---|---|
| fraQtl NPU Q4_0 (este) | 8,95B | No disponible | 1.721 | 6.303 | Apache 2.0 | GGUF Q4_0 |
| unsloth Q4_0 (Qwen3.5-9B) | 8,95B | No disponible | 1.685 | 6.165 | Apache 2.0 | GGUF Q4_0 |
| Qwen3.5-9B bf16 (original) | 8,95B | No disponible | 1.761 | 6.434 | Apache 2.0 | safetensors bf16 |

La comparativa se limita al modelo base y a la cuantizacion de unsloth, que son las referencias incluidas en la model card. No se dispone de datos de otros modelos de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- La model card indica explicitamente "Text model only": no hay soporte de vision, audio ni otras modalidades.
- La cuantizacion Q4_0 introduce perdida de fidelidad respecto al bf16 original: en MMLU-Pro se alteran 2.093 respuestas y en BFCL se rompen 88 respuestas correctas del original.
- La mejora frente a unsloth Q4_0 en tool calls no es significativa en la mitad par de las prompts (limite inferior pareado −16,4 frente a la linea del −2 %, −10,9), por lo que la ventaja se concentra en la deteccion de irrelevancia.
- GSM8K, IFEval y EvalPlus no muestran diferencias significativas frente a unsloth Q4_0; en IFEval strict el resultado es ligeramente inferior (453 frente a 455).
- El rendimiento en dispositivo solo se ha medido en un Snapdragon 8 Elite Gen 6 con el backend Hexagon; no hay datos de otros SoC, GPU o CPU.
- Los resultados provienen de una unica compilacion del archivo y de un conjunto acotado de benchmarks; no se han publicado evaluaciones de sesgos, toxicidad o alucinacion.
- La longitud de contexto y los idiomas soportados no se detallan en la informacion proporcionada, lo que limita la planificacion de despliegues multilingues o de contexto largo.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse la atribucion al equipo de Qwen, a unsloth y a llama.cpp segun los creditos de la model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; se trata de una publicacion reciente (26 de noviembre de 2026) sin validacion independiente de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/qualcomm-ai-hub-community/Qwen3.5-9B-NPU-fraQtl
- Repositorio canonico de fraQtl: https://huggingface.co/fraQtl/Qwen3.5-9B-NPU-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Cuantizacion de referencia de unsloth: https://huggingface.co/unsloth/Qwen3.5-9B-GGUF
- Imagen del repositorio: https://huggingface.co/fraQtl/Qwen3.5-9B-NPU-GGUF/resolve/main/Qwen3.5-9B-NPU-GGUF.png
- Paper de GPTQ (Frantar et al., 2022): no se proporciona enlace en la informacion disponible.
- llama.cpp y backend Hexagon: no se proporciona enlace en la informacion disponible.
