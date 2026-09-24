# Pilestin/qwen2.5-3b-debug-v1-lora

## Resumen

`Pilestin/qwen2.5-3b-debug-v1-lora` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo `Qwen/Qwen2.5-3B-Instruct`, publicado por el usuario Pilestin, cuyo único objetivo es la reparación automática de programas Python con errores. El modelo recibe un programa defectuoso y devuelve el programa corregido completo dentro de un único bloque de código `python`, sin explicaciones adicionales. Forma parte de una ablación de tres variantes (v1, v2 y v3) que estudia si proporcionar al modelo información adicional de ejecución —mensaje de error y traza de ejecución— mejora su capacidad de reparación.

Esta ficha corresponde a la variante v1, la más simple: solo recibe el código defectuoso, sin mensaje de error ni traza. La ablación es interesante porque cuantifica el efecto de cada tipo de información de contexto: v1 alcanza un 64.8 % de pass@1, v2 (código + error) sube al 69.1 % y v3 (código + error + traza generada por FocusTracer) se queda en 68.4 %. Las tres variantes superan al modelo base con el mismo prompt, lo que aísla la contribución del ajuste fino frente a la del contexto adicional.

El interés práctico del modelo reside en su tamaño: al apoyarse en un backbone de aproximadamente 3 000 millones de parámetros más un adaptador de 0.1 GB, puede ejecutarse en GPU de consumo y encaja en flujos de reparación automática de código donde un modelo mayor resultaría desproporcionado. No se han publicado resultados de benchmarks generales (MMLU, HumanEval o GSM8K); toda la evaluación disponible se limita a reparación de programas Python sobre el conjunto de test de CodeNetPy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only; modelo base Qwen/Qwen2.5-3B-Instruct |
| Parametros totales | Aproximadamente 3.09 B en el modelo base; numero de parametros del adaptador no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32768 tokens heredados del modelo base Qwen2.5-3B-Instruct (no confirmada en la informacion proporcionada) |
| Tipos de cuantizacion | Adaptador distribuido en precision completa (safetensors). El modelo base admite GGUF (Q4_K_M fue la usada en la evaluacion), Q5_K_M, Q8_0, AWQ/GPTQ y NF4 (QLoRA). No se publico GGUF de esta variante v1 |
| Idiomas soportados | Ingles (en) |
| Licencia | qwen-research (otra, heredada del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); tamano del repositorio 0.1 GB |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Libreria de carga | peft (compatible con transformers) |
| Pipeline | text-generation |
| Tipo de tarea | Program repair (Python) |

## Arquitectura y entrenamiento

El artefacto publicado no es un modelo completo, sino un adaptador LoRA entrenado con QLoRA sobre `Qwen/Qwen2.5-3B-Instruct`, un transformer decoder-only con atención por consultas agrupadas (GQA) y ventana de contexto de 32768 tokens. Al ser un adaptador, la arquitectura efectiva en inferencia es la del modelo base más las matrices de bajo rango inyectadas; el autor indica que el adaptador puede fusionarse con `merge_and_unload()`. No se especifican en la informacion disponible el rango del adaptador, los módulos objetivo, la tasa de aprendizaje ni el número de pasos de entrenamiento.

Los datos de entrenamiento proceden de CodeNetPy en formato de pares buggy/fixed. El conjunto de entrenamiento cubre 466 problemas y el de test 306 problemas distintos, sin solapamiento; la evaluación se realiza sobre 960 pares retenidos. El prompt de sistema fija el comportamiento: el modelo debe devolver el programa reparado completo en un único bloque de código y abstenerse de explicar. La innovación destacable del trabajo es la ablación controlada del contexto de depuración: v1 recibe solo el código, v2 añade el mensaje de excepción y la entrada estándar, y v3 añade además un resumen de traza de ejecución generado por FocusTracer, limitado a los últimos 25 eventos de línea y 1800 caracteres, con el formato `L<linea>: <codigo> [var=valor, ...]` y una línea `!! EXCEPTION` cuando corresponde. No se menciona en la informacion proporcionada el uso de RLHF o DPO.

## Capacidades

- Reparación de programas Python: dado un programa defectuoso, genera el programa corregido completo en un solo bloque `python`.
- Cobertura de tres categorías de fallo: excepción en tiempo de ejecución (49.4 % pass@1), respuesta incorrecta (73.6 %) y tiempo límite excedido (77.9 %).
- Salida determinista orientada a texto plano: con decodificación greedy (temperatura 0) produce código sin explicaciones, lo que facilita el parseo automático.
- Formato conversacional mediante `apply_chat_template` con mensajes de sistema, usuario y asistente.
- Modo de entrada restringido: en esta variante v1 la entrada es únicamente el código defectuoso; no consume mensajes de error ni trazas.
- Capacidades multilingües: solo inglés según la model card, aunque el modelo base Qwen2.5 es multilingüe.
- Tool calling / function calling: no documentado en la informacion proporcionada.
- Uso como agente o razonamiento multi-paso: no documentado; el modelo está diseñado para una única pasada de reparación.
- Capacidades de visión, audio o modo de razonamiento extendido: no disponibles.

## Casos de uso

- Reparación automática en integración continua: el modelo se invoca sobre el fichero modificado en un pre-commit hook o en un job de CI, devuelve el programa corregido y un script compara la salida con la referencia antes de aceptar el parche. Al requerir solo el código como entrada, no necesita capturar stderr ni configurar el entorno de ejecución.
- Asistente de depuración integrado en el IDE: con un backbone de ~3 B y cuantización de 4 bits, el adaptador puede servirse en local y ofrecer "corregir este fichero" sin enviar código propietario a un servicio externo.
- Autoevaluación en plataformas de aprendizaje de programación: dada una solución de un alumno que no compila o falla, el modelo genera una versión corregida que el sistema puede ejecutar contra los casos de prueba y usar como retroalimentación. Su 77.9 % de pass@1 en problemas de tiempo límite lo hace útil en ejercicios algorítmicos.
- Limpieza y normalización de corpus de código: aplicar el modelo sobre repositorios con errores conocidos para generar pares buggy/fixed sintéticos que alimenten posteriores ciclos de ajuste fino o de data augmentation para modelos mayores.
- Reparación en pipelines de competiciones de programación o jueces en línea: el modelo se ejecuta tras un veredicto de error, propone un parche y el juez lo valida en segundos; a 80.7 tok/s en una RTX 4060 Laptop el coste por intento es bajo.
- Mantenimiento de scripts y utilidades internas en Python: corrección de errores de tipado, índices, slicing o condiciones mal escritas en herramientas de automatización, con la ventaja de no requerir que el usuario describa el fallo (v1 no consume el mensaje de error).
- Despliegue en hardware limitado: el adaptador de 0.1 GB sobre un backbone de 3 B en 4 bits ocupa aproximadamente entre 2 y 2.5 GB de VRAM, lo que permite ejecutarlo en portátiles con GPU de 6-8 GB o incluso en CPU vía llama.cpp una vez fusionado y convertido.

## Benchmarks y rendimiento

Los siguientes datos son los declarados por el autor del modelo (marcados como `verified: false`) sobre el conjunto de test de CodeNetPy, 960 pares buggy/fixed de Python. La métrica pass@1 es de ejecución: el programa generado se ejecuta con la entrada del problema (tiempo límite de 5 s) y su salida estándar se compara con la de la solución de referencia. La decodificación es greedy (temperatura 0) y la evaluación se realizó con GGUF Q4_K_M a través de Ollama sobre una RTX 4060 Laptop GPU.

| Variante de entrada | Base Qwen2.5-3B-Instruct | Ajustado | Delta |
|---|---|---|---|
| v1 (solo codigo) | 59.8 % | 64.8 % | +5.0 |
| v2 (codigo + error) | 57.2 % | 69.1 % | +11.9 |
| v3 (codigo + error + traza) | 59.2 % | 68.4 % | +9.2 |

| Modelo | Excepcion en runtime | Respuesta incorrecta | Tiempo limite excedido | Exact match | tok/s | J/query |
|---|---|---|---|---|---|---|
| FT-v1 (este modelo) | 49.4 % | 73.6 % | 77.9 % | 14.4 % | 80.7 | 71.7 |
| FT-v2 | 57.0 % | 81.0 % | 74.6 % | 16.4 % | 85.0 | 69.6 |
| FT-v3 | 60.3 % | 77.3 % | 71.1 % | 18.4 % | 86.2 | 65.9 |

Conclusiones declaradas por el autor: el ajuste fino mejora de forma clara a las tres variantes frente al modelo base (p < 0.01 con test exacto de McNemar por pares) sin penalizar velocidad ni consumo energético; la traza de ejecución solo aporta de forma apreciable en la categoría de excepciones en tiempo de ejecución (v3 frente a v2, p = 0.62 en el cómputo global). La model card está truncada en ese punto, por lo que el resto de las conclusiones no está disponible. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones derivadas del tamano del modelo base, no medidas en la informacion proporcionada): ~6.2 GB en fp16/bf16, ~3.5 GB en cuantizacion de 8 bits y ~2.0-2.5 GB en 4 bits (Q4_K_M o NF4). El adaptador LoRA anade 0.1 GB de pesos.
- GPU recomendadas: cualquier GPU con 8 GB o mas para fp16; RTX 3060/4060/4070, RTX 4090, A100, H100 o L40S para despliegue en servidor. Para 4 bits basta con 4-6 GB de VRAM.
- Cabe en GPU de consumo: si. Los experimentos del autor se ejecutaron en una RTX 4060 Laptop GPU en Q4_K_M. Tambien es viable en iGPU con llama.cpp o en CPU con cuantizaciones bajas.
- Opciones de despliegue: transformers + peft (carga del adaptador segun el ejemplo de la model card), fusion con `merge_and_unload()` para exportar a safetensors estandar, llama.cpp / Ollama mediante conversion a GGUF (no hay GGUF publicado para v1; si para v2 y v3), y vLLM o TGI tras fusionar el adaptador.
- Rendimiento medido: 80.7 tok/s y 71.7 julios por consulta en la configuracion de evaluacion (RTX 4060 Laptop, Q4_K_M, greedy). Es la variante mas lenta de las tres, aunque la diferencia es inferior al 7 %.
- Latencia: no disponible; depende del numero de tokens generados, que en reparacion de programas puede ser elevado porque la salida es el programa completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | pass@1 (CodeNetPy) | Entrada requerida | Licencia | Distribucion |
|---|---|---|---|---|---|---|
| qwen2.5-3b-debug-v1-lora (este) | ~3 B + LoRA | 32768 tokens (heredado) | 64.8 % | Solo codigo | qwen-research | Adaptador PEFT safetensors |
| qwen2.5-3b-debug-v2 | ~3 B + LoRA | 32768 tokens (heredado) | 69.1 % | Codigo + error + stdin | qwen-research | Adaptador y GGUF (llama.cpp/Ollama) |
| qwen2.5-3b-debug-v3 | ~3 B + LoRA | 32768 tokens (heredado) | 68.4 % | Codigo + error + traza | qwen-research | Adaptador y GGUF (llama.cpp/Ollama) |
| Qwen/Qwen2.5-3B-Instruct (base) | ~3.09 B | 32768 tokens | 59.8 % (con el mismo prompt) | Solo codigo | qwen-research | Safetensors completo, GGUF y cuantizaciones de la comunidad |
| bunnycore/qwen-2.5-3b-lora_model | ~3 B + LoRA | 32768 tokens (heredado) | No disponible (proposito general) | Conversacional | apache-2.0 segun su model card | Adaptador LoRA |

La comparacion relevante es interna a la ablacion del propio autor: v2 obtiene la mejor puntuacion global (69.1 %) a cambio de exigir el mensaje de error y la entrada estándar, mientras que v3 aporta la mayor mejora en excepciones en tiempo de ejecución (60.3 % frente a 49.4 % de v1) pero no supera a v2 en el conjunto. Para la categoria de respuesta incorrecta, v2 es claramente superior (81.0 % frente a 73.6 %). No se dispone de comparativas con modelos de reparacion de codigo de otros autores dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion estrecha: solo Python y solo reparacion de programas. No es adecuado como modelo de proposito general, chat, generacion de codigo desde cero ni razonamiento abierto.
- Rendimiento mas bajo en errores de ejecucion: 49.4 % de pass@1 en la categoria de excepciones en runtime, el punto mas debil del modelo y precisamente donde la variante v3 con traza de ejecucion mejora mas (+10.9 puntos porcentuales).
- Exact match muy bajo: 14.4 %. Aunque el programa sea funcionalmente correcto, rara vez coincide literalmente con la correccion de referencia, por lo que no debe usarse en tareas de imitacion textual ni compararse por similitud de cadenas.
- Riesgo de alucinacion: el modelo puede introducir logica nueva, dependencias inexistentes o cambiar la semantica del programa en lugar de corregir el fallo. Al devolver siempre un programa completo sin explicaciones, un parche incorrecto es indistinguible de uno correcto sin ejecutarlo.
- Sin verificacion independiente: las metricas del `model-index` estan marcadas como `verified: false`; proceden del propio autor y no han sido replicadas por terceros. La evaluacion usa una sola configuracion (Q4_K_M, greedy, RTX 4060 Laptop) y un unico conjunto de test.
- Limitacion idiomatica: la model card declara unicamente ingles, tanto en los prompts como en los comentarios de codigo. No se ha evaluado el comportamiento con instrucciones o mensajes de error en castellano.
- Sin artefacto listo para produccion: no se publico GGUF de esta variante, por lo que para usarla en llama.cpp u Ollama hay que fusionar el adaptador y convertirla manualmente.
- Restricciones de licencia: el modelo hereda la licencia qwen-research del backbone, no Apache-2.0. Cualquier uso comercial debe revisar los terminos enlazados en la model card del modelo base antes de desplegarse.
- Trazabilidad de datos limitada: la model card describe el conjunto (466 problemas de entrenamiento, 306 de test, 960 pares de evaluacion) pero no detalla la composicion por categoria ni el proceso de filtrado de CodeNetPy.
- Repositorio con cero descargas y cero likes en el momento de la consulta, creado en septiembre de 2026: no hay evidencia de uso en produccion ni de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Pilestin/qwen2.5-3b-debug-v1-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- FocusTracer (herramienta de trazado citada por el autor, referenciada en la model card como ancla interna `#training-data`, sin URL publica disponible)
- Qwen/Qwen2.5-3B en HuggingFace: https://huggingface.co/Qwen/Qwen2.5-3B
- Repositorio de Qwen2.5 en GitHub: https://github.com/mx4ai/qwen2.5
- Tutorial de ajuste fino de Qwen2.5-3B con LoRA: https://ai4u.space/blog/fine-tune-qwen2-5-3b-model-colab-guide
- Ejemplo de LoRA de proposito general sobre el mismo backbone: https://huggingface.co/bunnycore/qwen-2.5-3b-lora_model
- Ficha comparativa en LLM Explorer: https://llm-explorer.com/model/bunnycore%2Fqwen-2.5-3b-lora_model,3UrwCGnBmelPPKHw8CFWZG
