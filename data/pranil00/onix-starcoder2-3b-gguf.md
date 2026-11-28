# pranil00/ONIX-starcoder2-3b-GGUF

## Resumen

ONIX-starcoder2-3b-GGUF es una cuantizacion en formato GGUF (concretamente Q5_K_M) del modelo base bigcode/starcoder2-3b, publicada por el usuario pranil00 bajo la etiqueta "ONIX Community". El modelo original StarCoder2-3B es un modelo de lenguaje especializado en generacion de codigo desarrollado por BigCode (colaboracion entre Hugging Face y ServiceNow), entrenado sobre datos de codigo abierto y publicado con licencia Apache 2.0. Esta version cuantizada reduce el peso de los pesos originales en safetensors (alrededor de 6 GB en FP16) hasta unos 2,03 GB, lo que facilita su ejecucion en hardware de consumo.

El modelo conserva la arquitectura transformer decoder-only del StarCoder2-3B original, con aproximadamente 3.030 millones de parametros. Su proposito principal es la generacion de codigo, el autocompletado en editores y la asistencia a tareas de programacion en multiples lenguajes. La cuantizacion Q5_K_M busca mantener un equilibrio entre calidad de salida y reduccion de memoria, siendo un formato ampliamente soportado por llama.cpp y Ollama.

La relevancia de esta publicacion es practica: permite desplegar un modelo de codigo de 3B en equipos con poca VRAM (o incluso en CPU) mediante herramientas estandar del ecosistema GGUF. No obstante, se trata de una publicacion de la comunidad con cero descargas y cero likes en el momento de la consulta, sin documentacion adicional sobre el proceso de cuantizacion mas alla de la verificacion declarada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de StarCoder2-3B) |
| Parametros totales | 3.030.371.328 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q5_K_M (unico publicado en este repo) |
| Idiomas soportados | no disponible (el modelo base esta orientado a lenguajes de programacion) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del bigcode/starcoder2-3b, un transformer decoder-only con atencion causal, disenado especificamente para generacion de codigo. El modelo original fue entrenado por BigCode sobre un corpus de codigo fuente abierto (The Stack v2 y datasets relacionados), con un enfoque en multiples lenguajes de programacion. La model card de esta publicacion no aporta detalles adicionales sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; esos datos corresponden al modelo base y no se reproducen aqui.

La innovacion tecnica de esta publicacion concreta es la cuantizacion Q5_K_M realizada con llama.cpp, segun declara el autor, sobre Apple Silicon con Metal. El proceso convierte los tensores originales a un formato de 5 bits con mezcla de precision (K-quant medium), reduciendo el tamano a 2,03 GB. El autor afirma que la conversion de tensores ha sido verificada como autentica mediante llama.cpp, aunque no se detalla la metodologia de verificacion ni se aportan metricas de degradacion respecto al modelo original.

## Capacidades

- Generacion de codigo en multiples lenguajes de programacion, heredada del modelo base StarCoder2-3B.
- Autocompletado de codigo en linea (fill-in-the-middle), funcionalidad tipica de los modelos StarCoder2.
- Generacion de texto general y explicaciones tecnicas, aunque el modelo esta optimizado para codigo.
- No se documenta soporte de tool calling ni function calling en la informacion proporcionada.
- No se documenta soporte explicito de agentes o razonamiento multi-paso.
- Capacidades multilingues en lenguaje natural: no disponibles en la informacion proporcionada.
- No se documentan modos especiales (thinking mode, vision, audio) en la informacion disponible.

## Casos de uso

- Autocompletado en editores de codigo: el modelo puede integrarse en extensiones de VS Code o Neovim mediante llama.cpp u Ollama para sugerir lineas y bloques de codigo en tiempo real, aprovechando su tamano reducido para baja latencia en GPU de consumo.
- Asistente de programacion local y offline: al ejecutarse con Ollama (`ollama run pranil00/ONIX-starcoder2-3b-GGUF`), permite disponer de un asistente de codigo sin conexion a internet, adecuado para entornos con requisitos de privacidad.
- Generacion de tests unitarios: el modelo puede producir casos de prueba a partir de fragmentos de codigo existentes, util en pipelines de integracion continua donde se requiera cobertura adicional.
- Documentacion automatica de funciones: generar docstrings y comentarios explicativos para bases de codigo heredadas, una tarea repetitiva donde un modelo de 3B especializado en codigo ofrece resultados razonables.
- Traduccion entre lenguajes de programacion: convertir fragmentos de codigo de un lenguaje a otro (por ejemplo, Python a JavaScript) como paso previo a una revision manual.
- Prototipado rapido en entornos con hardware limitado: su tamano de 2,03 GB permite desplegarlo en portatiles sin GPU dedicada o en Raspberry Pi con suficiente RAM, sirviendo como banco de pruebas para pipelines de generacion de codigo antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de HumanEval, MBPP, MMLU ni comparaciones de calidad respecto al modelo original en FP16.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con la cuantizacion Q5_K_M (2,03 GB de pesos mas overhead de contexto y cache KV).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como GTX 1650, RTX 3050, RTX 4060 o superiores; tambien funciona en A100/H100 aunque sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas de VRAM; tambien puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: Ollama (`ollama run pranil00/ONIX-starcoder2-3b-GGUF`), llama.cpp (`llama-cli -m starcoder2-3b-Q5_K_M.gguf`), y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ONIX-starcoder2-3b-GGUF (esta ficha) | 3,03 B | no disponible | Apache 2.0 | GGUF Q5_K_M | Cuantizacion comunitaria, 0 descargas |
| bigcode/starcoder2-3b | 3,03 B | no disponible | Apache 2.0 | safetensors | Modelo base original en precision completa |
| bigcode/starcoder2-7b | 7 B | no disponible | Apache 2.0 | safetensors | Version mayor del mismo linaje, mayor calidad a costa de mas recursos |
| Qwen2.5-Coder-3B | 3 B | no disponible | Apache 2.0 | safetensors/GGUF | Alternativa de tamano similar orientada a codigo, con amplia comunidad |

La comparacion de rendimiento entre estos modelos no puede establecerse con los datos disponibles, ya que no se han publicado benchmarks en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo publicado por un usuario individual de la comunidad, con cero descargas y cero likes; no hay evidencia de validacion independiente de la calidad de la cuantizacion.
- La verificacion de "tensores autenticos" es una afirmacion del autor sin metodologia documentada; conviene validar la salida contra el modelo base antes de usarlo en produccion.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en codigo: puede generar APIs inexistentes o sintaxis incorrecta.
- La cuantizacion Q5_K_M introduce una degradacion de calidad respecto al modelo en FP16, cuyo alcance no se ha medido en esta publicacion.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la informacion proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base; conviene revisar los terminos del dataset de entrenamiento original de StarCoder2 para usos concretos.
- No se especifica la longitud de contexto soportada en esta cuantizacion, lo que impide planificar tareas que requieran ventanas largas.
- El modelo esta orientado a codigo; su rendimiento en lenguaje natural general puede ser inferior al de modelos de proposito general del mismo tamano.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-starcoder2-3b-GGUF
- Modelo base: https://huggingface.co/bigcode/starcoder2-3b
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
