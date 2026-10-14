# MedGm/Llama-Locali-Qwen2.5-Coder-1.5B-QLoRA

## Resumen

Llama-Locali-Qwen2.5-Coder-1.5B-QLoRA es un adaptador LoRA entrenado con QLoRA sobre Qwen/Qwen2.5-Coder-1.5B-Instruct (revision `2e1fd39`), desarrollado por MedGm dentro de Locali, un proyecto de curso centrado en modelos pequenos que actuen como asistentes de ingenieria de software sobre hardware modesto: la CPU de un portatil o una unica GPU T4. El objetivo no es competir con modelos grandes, sino demostrar mejoras medibles y estadisticamente contrastadas en tareas concretas de calidad de codigo con un coste de entrenamiento de 2 horas y 04 minutos en una sola T4 de Kaggle.

El adaptador esta especializado en cuatro tareas con formato de prompt fijo: reparacion de errores (bug repair), generacion de tests de pytest, revision de codigo con salida JSON estructurada y prediccion de trazas de ejecucion. Se publica bajo licencia Apache-2.0, aunque el prefijo "Llama" del nombre es un requisito de la licencia de Llama 3.1 y no una afirmacion sobre la arquitectura, ya que parte de los datos de entrenamiento contienen tests generados por Llama-3.1-70B-Instruct.

El repositorio ocupa 0,1 GB y no registra descargas ni "likes" en el momento de la consulta. Junto al adaptador, el autor publica los pesos fusionados y una version GGUF para llama.cpp, lo que facilita su uso en entornos de inferencia locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-1.5B-Instruct) con adaptador LoRA aplicado a todas las proyecciones de atencion y MLP |
| Parametros totales | 1.500 millones en el modelo base; el numero de parametros del adaptador no se especifica en la informacion disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens (max_length usado en el entrenamiento); la tarjeta no indica la ventana de contexto del modelo base |
| Tipos de cuantizacion | Entrenamiento QLoRA en NF4; pesos fusionados en FP16; existe un repositorio GGUF para llama.cpp, pero los niveles de cuantizacion concretos no estan disponibles |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0, con aplicacion adicional de los terminos de naming y atribucion de la Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); pesos fusionados y GGUF en repositorios hermanos |
| Hiperparametros LoRA | r = 16, alpha = 16 |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de 1.500 millones de parametros, Qwen2.5-Coder-1.5B-Instruct. Sobre el se entrena un adaptador LoRA con QLoRA usando Unsloth en una unica GPU T4 de Kaggle: base cuantizada en NF4, rango 16, alpha 16, aplicado a todas las proyecciones de atencion y MLP. La configuracion incluye 2 epocas, learning rate 2e-4 con scheduler coseno, batch efectivo de 16, longitud maxima de 2048 tokens, calculo de la perdida unicamente sobre los tokens de respuesta y semilla 3407. El entrenamiento consumio 14.151 ejemplos y alcanzo un pico de 3,1 GB de memoria de GPU.

El dataset es MedGm/locali-mix-v2. Las etiquetas de bug repair y revision proceden de la ejecucion de tests en un sandbox y de analizadores estaticos (Ruff y Bandit), nunca de un modelo; las explicaciones de los errores las redacto Qwen3.5-9B. Los problemas semilla y los tests unitarios provienen de KAKA22/CodeRM-UnitTest, cuyos tests se generaron con Llama-3.1-70B-Instruct, y las instrucciones generales de bigcode/self-oss-instruct-sc2-exec-filter-50k. Se mezclan instrucciones generales (replay) para preservar el comportamiento de codigo original. Todo el material de entrenamiento se filtro comprobando solapamiento de 13-gramas con cada conjunto de evaluacion. La innovacion relevante no es arquitectonica, sino el protocolo de evaluacion: comparacion pareada contra el modelo base con test exacto de McNemar, decodificacion greedy, inferencia en vLLM con base FP16 mas adaptador y puntuacion dentro de un contenedor Docker aislado.

## Capacidades

- Reparacion de errores (T1): recibe una funcion, un test que falla y su error, y devuelve una linea JSON con `bug_location`, `bug_type` y `explanation`, seguida de la funcion corregida en un bloque de Python.
- Generacion de tests (T2): a partir de una funcion, escribe un fichero de tests compacto en pytest.
- Revision de codigo (T3): devuelve `{"findings": [...]}` con linea, categoria (bug / security / quality), severidad y un mensaje de una frase; una lista vacia es una respuesta valida.
- Traza de ejecucion (T4): predice el valor exacto que devuelve una llamada.
- Comportamiento general de codigo preservado mediante datos de instrucciones de replay mezclados en el entrenamiento.
- Idioma: unicamente ingles. El modelo fue evaluado exclusivamente en Python.
- Sin soporte documentado de tool calling ni function calling.
- Sin capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).
- Sin soporte documentado de agentes o razonamiento multi-paso mas alla de las cuatro tareas.
- El modelo rinde mejor cuando la peticion sigue exactamente los formatos de prompt definidos en el repositorio.

## Casos de uso

- Reparacion automatica de fallos en CI: ante un test roto, el modelo genera la localizacion del bug, su tipo y un parche en formato estructurado; el JSON permite enrutar el resultado a un bot de revision o a un commit automatico. Es adecuado porque su principal mejora medida es precisamente esta tarea (de 2,4 % a 63,7 % en problemas de su distribucion de entrenamiento).
- Generacion de suites de pytest para codigo heredado: dado un modulo sin cobertura, produce un fichero de tests que en la evaluacion basada en HumanEval detecta el bug en el 82,3 % de los casos frente al 46,3 % del modelo base.
- Revision de pull requests con severidad: el formato JSON con linea, categoria y severidad se integra directamente en comentarios automatizados de GitHub o GitLab; la lista vacia como respuesta valida permite evitar falsos positivos en codigo correcto.
- Refactorizacion con preservacion de comportamiento: util para limpiar funciones antes de una migracion de version, con un 93,9 % de comportamiento preservado frente al 69,9 % del base.
- Asistencia en el aula o en formacion de programacion: al ejecutarse en un portatil o una T4, sirve como tutor local que explica errores y propone correcciones sin depender de APIs externas.
- Prediccion de resultados de funciones para depuracion rapida: la tarea T4 permite responder "que devuelve esta llamada" sin ejecutar el codigo, util en entornos sin permisos de ejecucion.
- Deteccion de defectos en revision estatica: mejora de 53,0 % a 65,5 % en HumanEvalPack, aprovechable como filtro previo antes de un analizador estatico completo, aunque con la cautela indicada en limitaciones.
- Despliegue en entornos con hardware limitado o air-gapped: una version GGUF permite ejecutar el asistente en CPU sin conexion a internet.

## Benchmarks y rendimiento

Decodificacion greedy, base FP16 en vLLM mas el adaptador, puntuacion en sandbox Docker y contraste pareado con test exacto de McNemar sobre los mismos items.

| Tarea | Base | Este adaptador | p |
|---|---|---|---|
| Generacion de tests, bug detectado (basado en HumanEval) | 46,3 | 82,3 | 2e-12 |
| Refactorizacion, comportamiento preservado | 69,9 | 93,9 | 9e-10 |
| HumanEvalFix | 25,0 | 36,0 | 0,006 |
| Deteccion de bugs (HumanEvalPack) | 53,0 | 65,5 | 0,0004 |
| MBPP+ | 56,2 | 62,1 | 0,005 |
| HumanEval+ | 65,0 | 62,0 | 0,51 |
| CRUXEval-O | 30,1 | 28,7 | 0,31 |
| Deteccion de vulnerabilidades | 51,0 | 51,5 | 0,54 |

En problemas retenidos de la propia distribucion de entrenamiento, la reparacion pasa de 2,4 % a 63,7 % y la revision de 26,2 % a 50,7 %. No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- Memoria de GPU durante el entrenamiento QLoRA: 3,1 GB de pico en una T4 de 16 GB, con 14.151 ejemplos y 2 horas y 04 minutos de computo.
- Inferencia en FP16: aproximadamente 3 GB solo para los pesos de 1.500 millones de parametros, mas overhead de activaciones y cache KV (estimacion derivada del tamano, no medida publicada).
- Inferencia en 4 bits (NF4/GGUF de 4 bits): aproximadamente 1 GB de pesos, apto para GPU integradas o de gama baja (estimacion).
- Cabe en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o mas en FP16; en cuantizacion de 4 bits, en GPUs de 4 a 6 GB.
- El autor disena el modelo para ejecutarse en la CPU de un portatil o en una unica T4; la version GGUF permite despliegue en CPU.
- Opciones de despliegue documentadas: transformers + PEFT (`PeftModel.from_pretrained`) y vLLM con `--enable-lora --max-lora-rank 16 --lora-modules locali=...`. Para llama.cpp y Ollama esta disponible el repositorio GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| Este adaptador (Llama-Locali-Qwen2.5-Coder-1.5B-QLoRA) | 1,5 B base + LoRA r=16 | 2.048 tokens de entrenamiento (contexto base no indicado) | Apache-2.0 + terminos de Llama 3.1 | safetensors (PEFT) | Ver tabla de benchmarks |
| Qwen/Qwen2.5-Coder-1.5B-Instruct (base) | 1,5 B | no disponible en la informacion proporcionada | Apache-2.0 | safetensors | Referencia en todos los benchmarks de la tabla |
| MedGm/Llama-Locali-Qwen2.5-Coder-1.5B (fusionado) | 1,5 B | no disponible | Apache-2.0 + terminos de Llama 3.1 | safetensors | No se publican resultados propios; mismos pesos que el adaptador fusionado |
| MedGm/Llama-Locali-Qwen2.5-Coder-1.5B-GGUF | 1,5 B | no disponible | Apache-2.0 + terminos de Llama 3.1 | GGUF | No se publican resultados de la version cuantizada |

No se dispone de datos de benchmarks frente a otros modelos de codigo de tamano similar (por ejemplo, familias DeepSeek-Coder o CodeLlama) en la informacion proporcionada.

## Limitaciones y advertencias

- La mejora en deteccion de bugs no se reprodujo en dos ejecuciones hermanas entrenadas con los mismos datos (LoRA de 16 bits y rsLoRA). El autor la atribuye a que el modelo dice "tiene un bug" con menos frecuencia, por lo que debe considerarse no confirmada.
- La reparacion funciona mejor en fallos pequenos y de una sola linea, similares a los del entrenamiento. En tipos como logica ausente o variables incorrectas baja al 33-40 % en ejemplos retenidos.
- La deteccion de vulnerabilidades se mantiene en nivel de azar y no debe usarse como control de seguridad.
- Evaluado unicamente en Python; el comportamiento en otros lenguajes es desconocido.
- Idiomas: solo ingles.
- Dependencia fuerte del formato de prompt: fuera de los formatos exactos definidos en el repositorio (`t2_tests.py`, `t3_review.py`, `t4_trace.py`, `format.py`), el rendimiento puede degradar.
- En HumanEval+ y CRUXEval-O el adaptador obtiene valores ligeramente inferiores al base, aunque sin significacion estadistica; el ajuste no es una mejora universal.
- Riesgo de alucinacion inherente a un modelo de 1,5 B: las explicaciones de los bugs y las predicciones de valores de retorno deben verificarse ejecutando el codigo.
- Licencia: aunque el adaptador es Apache-2.0, al incluir salidas de Llama 3.1 en los datos de entrenamiento aplican los terminos de naming y atribucion de la Llama 3.1 Community License. Conviene revisarlos antes de un uso comercial.
- Los benchmarks se obtuvieron con el adaptador en FP16 sobre base FP16 en vLLM; las versiones GGUF cuantizadas no fueron evaluadas y pueden rendir de forma distinta.
- Publicacion sin descargas ni "likes" registrados: no hay validacion independiente por parte de la comunidad.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/MedGm/Llama-Locali-Qwen2.5-Coder-1.5B-QLoRA
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Pesos fusionados: https://huggingface.co/MedGm/Llama-Locali-Qwen2.5-Coder-1.5B
- Version GGUF para llama.cpp: https://huggingface.co/MedGm/Llama-Locali-Qwen2.5-Coder-1.5B-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/MedGm/locali-mix-v2
- Repositorio del proyecto y resultados: https://github.com/MedGm/Locali (carpeta `experiments/results/finetune_v2/`)
- Dataset de problemas semilla y tests: https://huggingface.co/datasets/KAKA22/CodeRM-UnitTest
- Dataset de instrucciones generales: https://huggingface.co/datasets/bigcode/self-oss-instruct-sc2-exec-filter-50k
- Licencia Llama 3.1 Community: https://www.llama.com/llama3_1/license/
