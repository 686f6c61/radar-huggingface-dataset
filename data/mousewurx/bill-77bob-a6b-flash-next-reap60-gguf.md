# MouseWurX/Bill-77Bob-A6B-Flash-Next-REAP60-GGUF

## Resumen

Bill-77Bob-A6B-Flash-Next-REAP60 es una variante podada del modelo Qwen/Qwen3.8-Flash-Next, publicada por el desarrollador independiente MouseWurX bajo el paraguas del proyecto personal "Bob". Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) al que se le han eliminado 204 de los 512 expertos de cada una de sus 48 capas, conservando 308 (el 60 %). El resultado es un modelo de aproximadamente 76,8 mil millones de parametros frente a los 125 mil millones del original, sin reentrenamiento ni proceso de recuperacion posterior.

La seleccion de expertos sigue una puntuacion de estilo REAP (router-weighted expert activation pruning): se pondera la frecuencia con la que el router elige cada experto por el tamano de su salida, calculado sobre trazas reales de tareas cotidianas de asistente (correo, ofimatica y codigo). El objetivo declarado es conservar las capacidades del Flash-Next completo en un equipo domestico con 16 GB de VRAM y 32 GB de RAM.

El modelo se distribuye exclusivamente en formato GGUF, cuantizado con llama.cpp a partir de una version Q8_0 del modelo original, e incluye una matriz de importancia (imatrix) propia. Forma parte de una familia de tres recortes (Bobert al 80 %, Riker al 70 % y Bill al 60 %), siendo Bill el mas agresivo. La licencia heredada es qwen-community-1.0, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capa MTP (multi-token prediction) para decodificacion especulativa |
| Parametros totales | 76,8 B aproximados (recorte); el repo declara 177.050.550 en safetensors, dato no coherente con la model card |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con tipos k-quant e i-quant; IQ2 usa Q2_0 en las proyecciones down. Tipos concretos por archivo no disponibles |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other") |
| Formato de pesos | GGUF (llama.cpp); origen Q8_0, no BF16 |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 48 capas, 512 expertos por capa y un experto compartido, mas una capa MTP que actua como cabecera de borrador para decodificacion especulativa. El recorte mantiene 308 expertos por capa (60 %), seleccionados con una puntuacion REAP que combina el peso del router y la magnitud de la activacion del experto, agregada sobre 153 ejecuciones limpias de tareas reales (correo, ofimatica, repositorios de codigo) validadas por evaluadores automaticos. La capa MTP conserva los expertos mas frecuentes en el resto de capas, y el experto compartido y el resto de componentes quedan intactos.

No hubo reentrenamiento ni "healing": el recorte copia slices completos de expertos desde el GGUF Q8_0 de unsloth/Qwen3.8-Flash-Next mediante `gguf_cut_experts.py`, y despues se recuantiza con `llama-quantize` usando una imatrix generada a partir de chats de entrenamiento propios del autor. La lista de expertos conservados por capa se publica como `keep.json`. La seleccion de expertos uso conjuntos de tareas separados de los empleados para la evaluacion final, lo que reduce el riesgo de sobreajuste a las tareas de juicio.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Qwen3.8-Flash-Next.
- Ejecucion de tareas de asistente con bucle de herramientas (tool calling) verificado en correo, ofimatica y codigo.
- Manipulacion de archivos ofimaticos (creacion y edicion de documentos) evaluada con 13 de 14 tareas superadas al 60 % de expertos.
- Trabajo en repositorios de codigo: 12 de 12 tareas superadas al 60 % de recorte.
- Busqueda web y consultas externas: 8 de 11 tareas al 60 %.
- Recuperacion y clasificacion de correo: 79,6 % de acierto en localizacion de mensajes relevantes.
- Decodificacion especulativa mediante capa MTP.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente personal local: el modelo esta disenado para ejecutarse en un equipo con 16 GB de VRAM y 32 GB de RAM, gestionando conversaciones multi-turno con acceso a correo, archivos y codigo sin enviar datos a la nube.
- Automatizacion de correo: clasificacion, respuesta y busqueda de mensajes con una tasa de acierto del 79,6 % en la tarea de localizar correos que requieren respuesta, adecuada para triaje asistido con supervision humana.
- Edicion de documentos ofimaticos: generacion y modificacion de hojas de calculo y documentos de texto mediante tool calling, con 13 de 14 tareas superadas en el conjunto de evaluacion del autor.
- Asistencia en repositorios de codigo: navegacion, edicion y tareas de mantenimiento en proyectos, con 12 de 12 tareas superadas, integrable en flujos de trabajo locales con llama.cpp.
- Despliegue en hardware de consumo: al reducir el modelo a 76,8 B con cuantizacion agresiva, permite inferencia MoE en GPUs de 16 GB, algo inviable con el modelo completo de 125 B.
- Experimentacion con poda de expertos: el repo publica `keep.json` e imatrix, lo que lo convierte en referencia para investigar tecnicas REAP y recuantizacion desde Q8_0.
- Procesamiento por lotes en estaciones de trabajo: con mapeo de memoria del embedding n-gram, el modelo puede residir parcialmente en disco y ejecutarse en equipos con RAM limitada.

## Benchmarks y rendimiento

Los unicos datos publicados son evaluaciones propias del autor sobre conjuntos de tareas retenidos (held-out), con mascara de expertos en tiempo de servicio y sin archivo recortado. No son benchmarks estandar y no permiten comparacion directa con otros modelos.

| Expertos conservados | Oficina (de 14) | Codigo (de 12) | Web (de 11) | Bandeja de entrada | Acciones daninas |
|---|---|---|---|---|---|
| 100 % | 13 | 12 | 8 | 85,0 % | 0 |
| 90 % | 13 | 12 | 9 | 92,7 % | 0 |
| 80 % | 12 | 12 | 9 | 92,2 % | 0 |
| 75 % | 13 | 10 | 8 | 90,8 % | 1 |
| 65 % | 13 | 12 | 9 | 79,0 % | 0 |
| 60 % | 13 | 12 | 8 | 79,6 % | 0 |
| 50 % | 9 | 11 | 9 | 85,7 % | 0 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el autor indica que el objetivo es ejecutar en una GPU de 16 GB junto con 32 GB de RAM del sistema; la VRAM concreta depende del archivo GGUF elegido, no disponible en detalle.
- El embedding n-gram de 51 B de parametros (filas de 160) ocupa aproximadamente 29 GB en todos los archivos y solo admite tipos de 32 anchos (unos 4,5 bits); con mmap se lee desde disco y no consume RAM ni VRAM, pero el resto del archivo debe caber en memoria.
- GPUs recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB) como objetivo declarado; A100 y H100 sobradas para el modelo recortado.
- Cabe en GPU de consumo de 16 GB segun el autor, condicionado al tipo de cuantizacion y a la memoria del sistema.
- Despliegue: llama.cpp en versiones compatibles con Qwen/Qwen3.8-Flash-Next; no se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Bill-77Bob-A6B-Flash-Next-REAP60 | ~76,8 B (60 % expertos) | no disponible | qwen-community-1.0 | GGUF | Recorte REAP sin reentrenar |
| Riker (mismo autor) | ~100 B (70 % expertos) | no disponible | qwen-community-1.0 | GGUF | Mayor retencion de capacidades |
| Bobert (mismo autor) | ~114 B (80 % expertos) | no disponible | qwen-community-1.0 | GGUF | Recorte mas conservador |
| Qwen/Qwen3.8-Flash-Next (base) | 125 B | no disponible | qwen-community-1.0 | safetensors/GGUF | Modelo original completo |

No se dispone de datos de rendimiento comparables con modelos de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- El recorte no incluye recuperacion ni ajuste fino: los expertos eliminados no se sustituyen, lo que puede degradar capacidades no cubiertas por las tareas de seleccion.
- La seleccion de expertos se baso en tareas de correo, ofimatica y codigo; el rendimiento en otros dominios (matematicas avanzadas, ciencia, idiomas distintos del ingles) no esta evaluado.
- El autor reconoce que una tarea de oficina falla en todos los niveles, incluido el modelo completo, por ambiguedad de la pregunta, no por la poda.
- La evaluacion usa conjuntos de 11 a 14 tareas, por lo que diferencias de uno o dos aciertos son ruido estadistico.
- El modelo declara 177.050.550 parametros en safetensors, dato incoherente con los 76,8 B de la model card; conviene verificar el contenido real del repo.
- El repo tiene 0 descargas y 0 likes, y los archivos aparecen como "uploading" en la model card: no hay evidencia de validacion externa.
- Licencia qwen-community-1.0: impone restricciones al uso comercial que deben revisarse antes de desplegar en produccion.
- Riesgo de alucinacion y sesgos: no documentados por el autor; se heredan los del modelo base.
- La cuantizacion parte de Q8_0 y no de BF16, lo que puede acumular error adicional frente a conversiones directas.
- El embedding n-gram exige ~29 GB en disco y lectura por mmap; sin mmap el modelo no cabe en el hardware objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MouseWurX/Bill-77Bob-A6B-Flash-Next-REAP60-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GGUF de origen (unsloth): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Repositorio del proyecto Bob: https://github.com/MouseWurX/Bob
- Dataset de lecciones de Bob: https://huggingface.co/datasets/MouseWurX/bob-lessons
- Paper REAP (Lasby et al. 2025): no disponible como enlace directo en la informacion proporcionada
