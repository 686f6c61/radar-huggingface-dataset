# fiel1986/Andromeda-Code-0.5B-GGUF

## Resumen

Andromeda-Code-0.5B-GGUF es la version cuantizada en formato GGUF del modelo Andromeda-Code-0.5B, un modelo de lenguaje de aproximadamente 494 millones de parametros (0,5B) especializado en generacion de codigo Python. Lo desarrolla el autor independiente fiel1986 y se distribuye bajo licencia Apache 2.0. El modelo se ha obtenido mediante destilacion de respuestas (response distillation) desde `deepseek-ai/deepseek-coder-1.3b-instruct` (profesor) hacia `Qwen/Qwen2.5-0.5B-Instruct` (estudiante), lo que le permite heredar parte de las capacidades de generacion de codigo del profesor manteniendo un tamano muy reducido.

Su principal valor es la eficiencia: el archivo cuantizado en Q4_K_M ocupa aproximadamente 374 MB, lo que permite ejecutarlo de forma completamente offline en un ordenador de sobremesa, un portatil o incluso una Raspberry Pi sin necesidad de GPU. Esta orientado a entornos con recursos limitados donde no es viable desplegar un modelo mayor.

Es relevante ahora porque cubre el nicho de asistentes de codigo embebidos y ejecucion en el borde (edge), donde el coste de inferencia y el consumo de memoria son las restricciones dominantes. Al estar en formato GGUF, es compatible con llama.cpp, Ollama y LM Studio, lo que facilita su adopcion sin infraestructura especializada. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y esta etiquetado para los idiomas espanol e ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Qwen2, segun el modelo estudiante Qwen2.5-0.5B-Instruct) |
| Parametros totales | 494.032.768 (~0,5B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (6,35 BPW); otras cuantizaciones no disponibles |
| Idiomas soportados | Espanol (es) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura del modelo es un transformer decoder-only derivado de `Qwen/Qwen2.5-0.5B-Instruct`, que actua como modelo estudiante. El modelo profesor es `deepseek-ai/deepseek-coder-1.3b-instruct`, un modelo especializado en codigo de 1,3B parametros. El proceso de entrenamiento combina destilacion de respuestas (response distillation) con ajuste supervisado (SFT), ejecutado durante 3 epocas con una tasa de aprendizaje de 2e-5. El dataset utilizado esta compuesto por HumanEval (164 ejemplos) y MBPP (1000 ejemplos), dos conjuntos de referencia para evaluacion de generacion de codigo.

La innovacion principal no reside en la arquitectura, sino en la estrategia de compresion de conocimiento: transferir la capacidad de generacion de codigo de un modelo profesor de 1,3B a un estudiante de 0,5B, y posteriormente cuantizar el resultado a Q4_K_M (6,35 bits por peso) para reducir el peso del archivo hasta aproximadamente 374 MB. El resultado es un modelo que prioriza el despliegue ligero sobre el rendimiento maximo. Nota: la model card enlaza el modelo base como `Andromeda-Code-0.5B-v2`, mientras que el metadato de HuggingFace lo referencia como `fiel1986/Andromeda-Code-0.5B`; existe una discrepancia no aclarada por el autor. No se dispone de informacion sobre el numero total de tokens de entrenamiento ni sobre la composicion completa del dataset mas alla de HumanEval y MBPP.

## Capacidades

- Generacion de texto y de codigo, con especializacion declarada en programacion en Python.
- Generacion de codigo a partir de instrucciones (formato instruct, heredado de Qwen2.5-0.5B-Instruct).
- Soporte de conversacion multi-turno (el repositorio esta etiquetado como `conversational`).
- Capacidades multilingues limitadas a espanol e ingles.
- Inferencia offline sin GPU, apta para dispositivos de bajos recursos.
- Compatibilidad con llama.cpp, Ollama y LM Studio a traves del formato GGUF.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades de vision, audio o modo de razonamiento explicito (thinking mode): no disponibles.

## Casos de uso

- Asistente de codigo embebido en el editor: el modelo puede completar funciones y generar fragmentos de Python dentro de un IDE o plugin, ejecutandose en local sin conexion a internet y sin GPU, gracias a su tamano de 0,5B y al archivo Q4_K_M de 374 MB.
- Autocompletado en Raspberry Pi y dispositivos de borde: permite ofrecer sugerencias de codigo en entornos con memoria limitada, donde no cabe un modelo de mayor tamano y no se dispone de acelerador grafico.
- Generacion de fragmentos de Python en pipelines de CI/CD: puede utilizarse para producir borradores de scripts o funciones de utilidad que luego se revisan, manteniendo toda la inferencia dentro de la red local y sin coste de API.
- Educacion y aprendizaje de programacion: sirve como tutor offline que explica o genera ejemplos de codigo, funcionando en ordenadores de estudiantes sin hardware dedicado.
- Prototipado rapido de ideas de codigo: util para generar un primer esqueleto de una funcion o clase que el desarrollador completa y corrige despues.
- Aplicaciones de escritorio distribuidas a usuarios finales: al pesar pocos cientos de MB y funcionar en CPU, puede integrarse dentro de un programa de escritorio para ofrecer ayuda de codigo sin depender de servicios en la nube.
- Traduccion y generacion de texto bilingue es/en en contextos tecnicos: aprovecha las dos lenguas soportadas para generar documentacion o comentarios de codigo en espanol e ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el entrenamiento uso HumanEval y MBPP como datos, pero no reporta las puntuaciones obtenidas por el modelo resultante en esas u otras pruebas, ni ofrece comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: la cuantizacion Q4_K_M ocupa aproximadamente 374 MB, por lo que el modelo puede ejecutarse integramente en CPU y en memoria RAM, sin requerir VRAM. Para ejecucion en GPU, un modelo de este tamano cabe holgadamente en tarjetas con 2-4 GB de VRAM.
- GPU recomendadas: no se especifican en la informacion disponible; dado el tamano, cualquier GPU de consumo moderna (por ejemplo, series RTX) seria mas que suficiente, si bien el modelo esta disenado para funcionar sin GPU.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU de consumo, e incluso prescinde de ella.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio. La model card incluye instrucciones para Ollama (`ollama pull fiel1986/Andromeda-Code-0.5B-GGUF` y `ollama run fiel1986/Andromeda-Code-0.5B-GGUF`).
- Latencia y throughput estimados: no disponibles. Al ejecutarse en CPU sobre un modelo de 0,5B en Q4_K_M, se espera una latencia baja, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

La informacion disponible no incluye resultados de benchmarks ni comparativas directas con otros modelos, por lo que no es posible establecer una comparacion cuantitativa fiable. A continuacion se presenta una comparacion estructural basada unicamente en los datos disponibles.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Andromeda-Code-0.5B-GGUF | ~0,5B | no disponible | Apache 2.0 | GGUF (Q4_K_M) | Destilado de deepseek-coder-1.3b-instruct |
| Qwen2.5-0.5B-Instruct (modelo estudiante de partida) | ~0,5B | no disponible en esta informacion | Apache 2.0 | safetensors | Modelo generalista, no especializado en Python |
| deepseek-coder-1.3b-instruct (modelo profesor) | ~1,3B | no disponible en esta informacion | no disponible en esta informacion | safetensors | Especializado en codigo, mayor tamano |

Rendimiento (HumanEval, MBPP, MMLU): no disponible para ninguno de los modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinacion: como todo modelo de lenguaje de tamano reducido, puede generar codigo sintacticamente plausible pero incorrecto o funciones inexistentes; se recomienda verificacion manual del codigo generado.
- Sesgos conocidos: no documentados por el autor. Al derivar de Qwen2.5 y deepseek-coder, puede heredar los sesgos presentes en sus datos de entrenamiento, no especificados.
- Limitaciones de contexto: no se ha publicado la longitud de contexto soportada, lo que dificulta planificar tareas que requieran ventanas amplias.
- Limitaciones de idioma: solo se declaran espanol e ingles; no hay soporte documentado para otros idiomas.
- Capacidades no confirmadas: no hay evidencia de soporte de tool calling, function calling, agentes o razonamiento multi-paso.
- Ambito restringido: el modelo esta especializado declaradamente en Python; su rendimiento en otros lenguajes de programacion no esta documentado.
- Datos de entrenamiento reducidos: el ajuste se realizo sobre 164 ejemplos de HumanEval y 1000 de MBPP, un volumen limitado que puede restringir la generalizacion.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserven los avisos de licencia correspondientes. Conviene verificar las condiciones de los modelos de origen (Qwen2.5-0.5B-Instruct y deepseek-coder-1.3b-instruct) al redistribuir.
- Madurez del proyecto: el repositorio registra 0 descargas y 0 likes, y no cuenta con validacion externa ni benchmarks publicados; se recomienda tratarlo como un modelo experimental.
- Caveat de produccion: la ausencia de cifras de latencia, throughput y contexto obliga a realizar una evaluacion propia antes de desplegarlo en un sistema en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fiel1986/Andromeda-Code-0.5B-GGUF
- Modelo base (metadato): https://huggingface.co/fiel1986/Andromeda-Code-0.5B
- Modelo base enlazado en la model card (v2): https://huggingface.co/fiel1986/Andromeda-Code-0.5B-v2
- Modelo profesor: https://huggingface.co/deepseek-ai/deepseek-coder-1.3b-instruct
- Modelo estudiante: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset HumanEval y MBPP: no se proporcionan enlaces especificos en la informacion disponible.
