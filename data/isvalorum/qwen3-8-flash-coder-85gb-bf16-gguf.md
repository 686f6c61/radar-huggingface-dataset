# IsValorum/Qwen3.8-Flash-Coder-85GB-BF16-GGUF

## Resumen

Qwen3.8-Flash-Coder-85GB-BF16-GGUF es la version de referencia sin compresion (BF16, 16.00 BPW) en formato GGUF del modelo Jab1718/qwen3.8-flash-coder-85gb-bf16, publicada por el usuario IsValorum. Se trata de una conversion directa a GGUF pensada como linea base de fidelidad para `llama.cpp`: al no aplicar recomputacion de pesos, sirve para medir perplejidad y calidad sin el ruido que introducen las cuantizaciones intermedias. El repositorio ocupa 85,3 GB (79,44 GiB) y el modelo base declara 42.620.341.120 parametros totales.

El modelo subyacente es un MoE experimental derivado de la familia Qwen (etiquetado internamente como `Qwen4ExpForCausalLM`) al que se le han podado 352 de los 512 expertos enrutados originales, dejando 160 expertos por capa. La poda se realizo exclusivamente contra conjuntos de calibracion de Python y SWE-bench en ingles, por lo que el resultado es un especialista estricto en programacion y agentic coding en ingles, con degradacion severa en conversacion general y en cualquier idioma distinto del ingles.

Su relevancia practica es doble: por un lado documenta el estado de un recorte MoE agresivo antes de la fase de fine-tuning de recuperacion (que el autor original aun no ha publicado); por otro, ofrece una referencia BF16 reproducible para validar las variantes comprimidas de la misma familia (APEX-I-MiniPlus V2.1 a 3,45 BPW y APEX-I-NanoPlus a 2,90 BPW). La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido MoE (`Qwen4ExpForCausalLM`): 48 capas, 36 de atencion lineal tipo SSM y 12 de atencion dispersa, con hyper-connections de 4 vias |
| Parametros totales | 42.620.341.120 |
| Parametros activos | aprox. 3,7B por token (10 expertos enrutados activos de 160 por capa + 1 experto compartido + backbone denso); 4,9B contando embeddings de vocabulario |
| Longitud de contexto | 262.144 tokens (256K) nativos |
| Tipos de cuantizacion | BF16 sin compresion (16.00 BPW) en este repo; la familia incluye variantes a aprox. 3,45 BPW y aprox. 2,90 BPW |
| Idiomas soportados | en (unicamente ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (BF16) |

## Arquitectura y entrenamiento

La arquitectura combina 48 capas hibridas: 36 capas de atencion lineal basada en SSM y 12 capas de atencion dispersa, con hyper-connections de 4 vias. El componente MoE consta de 160 expertos enrutados por capa, de los cuales se activan 10 por token, mas un experto compartido y un backbone denso, lo que situa la computacion efectiva en torno a 3,7B parametros activos por token. La tabla PLE de n-gramas esta desactivada (`ple_layer_ids: []`), de modo que la inferencia se ejecuta integramente en VRAM de GPU sin offload a RAM del host.

El dato de entrenamiento mas relevante es el proceso de poda: el modelo base fue generado con la herramienta `moe-slice`, eliminando de forma permanente 352 de los 512 expertos enrutados originales. La seleccion de expertos supervivientes se calibro exclusivamente con datasets de Python y SWE-bench en ingles. No se ha publicado la fase de fine-tuning de recuperacion posterior a la poda, lo que explica la degradacion funcional fuera del dominio de codigo en ingles. No hay informacion disponible sobre el volumen total de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion y completado de codigo en Python, con enfasis declarado en tareas de SWE-bench.
- Refactorizacion y edicion de codigo dentro de flujos de trabajo en ingles.
- Agentic coding: soporte declarado de tool calling y function calling para agentes de programacion.
- Razonamiento multi-paso orientado a tareas de ingenieria de software (la etiqueta `reasoning` aparece en los metadatos del modelo).
- Capacidad de conversacion multi-turno con ventana nativa de 256K tokens, aunque limitada a contenido tecnico en ingles.
- No soporta vision, audio ni otros modos: los metadatos no los declaran.
- Capacidades multilingues practicamente inexistentes: el autor advierte de salida rota en idiomas distintos del ingles.

## Casos de uso

- Generacion de codigo en produccion: el modelo puede integrarse en pipelines de CI/CD para autocompletar funciones y parchear tests en Python, apoyandose en su ventana de 256K tokens para incluir el contexto completo de un repositorio mediano en un solo prompt.
- Agentes de resolucion de issues: con soporte de tool calling, encaja como motor de un agente que lee un issue de GitHub, navega el arbol de ficheros, aplica parches y ejecuta la suite de tests de forma iterativa.
- Refactorizacion asistida a gran escala: la ventana de 256K permite pasar modulos completos o varios ficheros relacionados y pedir reescrituras coherentes con el resto de la base de codigo.
- Linea base de evaluacion de cuantizaciones: al ser BF16 sin recompresion, sirve para medir la perplejidad de referencia (30,0975 +/- 0,1200 en WikiText-2) y comparar el delta de las variantes APEX-I-MiniPlus y NanoPlus en un mismo hardware.
- Desarrollo local con `llama.cpp` o LM Studio: util para validar prompts, plantillas de chat y comportamiento de tool calling antes de pasar a una version cuantizada mas ligera en produccion.
- Generacion de documentacion tecnica y docstrings en ingles a partir del codigo fuente, tarea alineada con su calibracion en Python.
- Investigacion sobre poda de expertos en MoE: permite estudiar el impacto de eliminar el 68,75% de los expertos enrutados sobre calidad y perplejidad antes de la fase de recuperacion.

## Benchmarks y rendimiento

El unico dato cuantitativo publicado en la informacion disponible es la perplejidad en WikiText-2 de la familia, medida por el autor de la cuantizacion:

| Variante | Tamano en disco | BPW | Perplejidad WikiText-2 | Delta frente a BF16 |
|---|---|---|---|---|
| BF16 (referencia) | 85,30 GB (79,44 GiB) | 16,00 | 30,0975 +/- 0,1200 | linea base (0,00%) |
| APEX-I-MiniPlus V2.1 | 21,77 GB (20,27 GiB) | aprox. 3,45 | 30,1495 +/- 1,0089 | +0,0520 (+0,17%) |
| APEX-I-NanoPlus | 18,34 GB (17,08 GiB) | aprox. 2,90 | 34,4199 +/- 1,1591 | +4,3224 (+14,36%) |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, SWE-bench) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 79,44 GiB solo para los pesos en BF16, mas overhead de contexto KV; en la practica requiere nodos con 80 GB o mas de VRAM y margen adicional para una ventana de 256K.
- GPU recomendadas: H100 de 80 GB o A100 de 80 GB en configuracion single-GPU al limite; para contexto largo conviene multi-GPU o reducir `-c`. Las RTX 4090 (24 GB) no pueden alojar el modelo BF16 completo.
- Cabe en GPU de consumo: no en BF16. Para equipos de consumo hay que recurrir a las variantes comprimidas de la familia (18-22 GB), que si entran en tarjetas de 24 GB.
- Opciones de despliegue: `llama.cpp` (`llama-server`) y LM Studio segun el autor. No es compatible con Strata Engine, que exige el monolito de 512 expertos y tablas PLE de 51B.
- Latencia y throughput: no disponibles. Como referencia estructural, con unos 3,7B parametros activos por token el coste computacional por token es bajo en comparacion con un modelo denso de 42B, pero el ancho de banda de memoria para leer los pesos BF16 limita el throughput.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Coder BF16 (este) | 42,6B / aprox. 3,7B | 256K | 30,0975 | Apache 2.0 | GGUF BF16, 85,3 GB |
| Qwen3.8-Flash-Coder APEX-I-MiniPlus V2.1 | mismo backbone podado | 256K | 30,1495 | Apache 2.0 | GGUF, 21,77 GB |
| Qwen3.8-Flash-Coder APEX-I-NanoPlus | mismo backbone podado | 256K | 34,4199 | Apache 2.0 | GGUF, 18,34 GB |

No hay informacion disponible sobre modelos de otros autores con los que comparar parametros, contexto y rendimiento de tareas.

## Limitaciones y advertencias

- Modelo experimental de prepublicacion: el autor original no ha publicado la fase de fine-tuning de recuperacion tras la poda de expertos.
- Solo ingles: la salida se degrada gravemente y produce texto roto en espanol, frances, aleman y otros idiomas, asi como en conversacion general.
- Especializado en codigo: no es adecuado para chat general, redaccion, traduccion ni tareas no tecnicas.
- Riesgo de alucinacion en APIs y librerias: como cualquier modelo de codigo, puede inventar funciones o firmas inexistentes; requiere validacion con tests.
- Poda agresiva: se eliminaron 352 de 512 expertos enrutados, lo que reduce la cobertura de dominios fuera de Python y SWE-bench.
- Incompatibilidad con Strata Engine; solo `llama.cpp` y LM Studio estan indicados.
- Requisito de hardware elevado: 85,3 GB de pesos BF16 hacen inviable su uso en GPU de consumo y complican el despliegue en produccion frente a las variantes cuantizadas.
- Licencia Apache 2.0 permite uso comercial, pero la calidad degradada fuera del dominio de codigo en ingles limita su aplicacion real en producto.
- Contexto nativo de 256K, pero el ejemplo de uso del autor arranca con `-c 65536`; ventanas mayores incrementan mucho el consumo de KV cache.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IsValorum/Qwen3.8-Flash-Coder-85GB-BF16-GGUF
- Modelo base: https://huggingface.co/Jab1718/qwen3.8-flash-coder-85gb-bf16
- Variante APEX-I-MiniPlus V2.1: https://huggingface.co/IsValorum/Qwen3.8-Flash-Coder-APEX-I-MiniPlus-V2.1-GGUF
- Variante APEX-I-NanoPlus: https://huggingface.co/IsValorum/Qwen3.8-Flash-Coder-APEX-I-NanoPlus-GGUF
- Apoyo al autor de las cuantizaciones: https://ko-fi.com/isvalorum
