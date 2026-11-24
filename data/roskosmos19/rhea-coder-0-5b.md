# roskosmos19/Rhea-Coder-0.5B

## Resumen

Rhea-Coder-0.5B es un ajuste fino mediante LoRA del modelo Qwen2.5-Coder-0.5B-Instruct, desarrollado por el usuario roskosmos19. Se trata de un asistente de programación en inglés de pequeno tamano (494 millones de parámetros) entrenado sobre 1.008 ejemplos de instrucciones en Python extraidos del dataset Magicoder-OSS-Instruct-75K. El objetivo declarado por el autor es explorar el ajuste fino eficiente en hardware muy limitado, no competir con modelos de mayor escala.

El modelo parte de la arquitectura Qwen2 (transformer decoder-only) del modelo base de Alibaba, conservando su tokenizador, plantilla de chat y ventana de contexto. El repositorio publica tanto los pesos fusionados en bf16 (safetensors) como el adaptador LoRA por separado, lo que permite cargarlo como cualquier modelo Qwen2 o aplicar el adaptador sobre el modelo base con PEFT.

Su relevancia es acotada pero ilustrativa: demuestra que un ajuste fino de una hora y media en dos nucleos de CPU puede mejorar marginalmente el rendimiento en tareas de generación de código (de 45,0 % a 52,5 % de pass@1 en un subconjunto de 40 tareas de HumanEval). Es un experimento reproducible de bajo coste, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-Coder-0.5B-Instruct) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; el modelo base admite cuantizacion estandar de la familia Qwen2) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (modelo fusionado en bf16) y adaptador LoRA en PEFT |
| Modelo base | Qwen/Qwen2.5-Coder-0.5B-Instruct |
| Metodo de ajuste | LoRA (PEFT), r=16, alpha=32, dropout=0.05 |
| Parametros entrenables | 8,8 M (1,75 % del total) |
| Dataset de entrenamiento | ise-uiuc/Magicoder-OSS-Instruct-75K (1.008 ejemplos Python) |
| Tamano del repositorio | 1,0 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen2.5-Coder-0.5B-Instruct: un transformer decoder-only con atención causal estandar, sin innovaciones de atención lineal ni mezcla de expertos. El ajuste fino no modifica la arquitectura; se aplica un adaptador LoRA de rango 16 y alpha 32 sobre todas las proyecciones lineales (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj), manteniendo los pesos base congelados en bf16 y los pesos LoRA en fp32.

El entrenamiento se realizo sobre 1.008 ejemplos Python del dataset Magicoder-OSS-Instruct-75K, en formato de chat y limitados a 512 tokens cada uno (417.479 tokens en total). Se aplico una unica epoca con micro-batch 1 y acumulacion de gradiente 16 (paso efectivo de 16), optimizador AdamW con lr 2e-4, schedule coseno, 5 % de warmup y grad-clip 1.0. La perdida se calculo solo sobre los tokens del asistente (prompt enmascarado). El entrenamiento duro 119 minutos en dos nucleos ARM Neoverse-V2 con aproximadamente 7 GB de RAM y sin GPU, con gradient checkpointing activado. Se realizo una descontaminacion eliminando filas que compartian cualquier n-grama de 13 palabras con los prompts o soluciones canonicas de HumanEval, o que definian funciones con nombres de punto de entrada de dicho benchmark.

## Capacidades

- Generacion de codigo Python a partir de instrucciones en lenguaje natural, en formato de respuesta directa.
- Explicacion de fragmentos de codigo y respuestas conversacionales de una sola vuelta o multi-turno cortas.
- Razonamiento basico sobre problemas de programacion de alcance limitado (funciones cortas y algoritmos sencillos).
- Soporte de plantilla de chat compatible con Qwen2 (`apply_chat_template`).
- Compatibilidad con text-generation-inference y endpoints compatibles segun los tags del repositorio.
- Capacidades multilingues limitadas al ingles; no se entreno para otros idiomas naturales.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Asistente de autocompletado de funciones Python en editores ligeros: el modelo puede generar funciones cortas a partir de un docstring o una instruccion breve, con una huella de memoria reducida que permite ejecutarlo en portatiles sin GPU dedicada.
- Generacion de tests unitarios simples: dado un fragmento de codigo, el modelo puede proponer casos de prueba basicos, utiles como borrador que el desarrollador revisa y ejecuta.
- Prototipado rapido de scripts de automatizacion: para tareas de una sola funcion (parseo de ficheros, transformaciones de datos, utilidades de linea de comandos), el modelo ofrece una primera version funcional con latencia baja.
- Educacion y aprendizaje de Python: puede explicar que hace un fragmento de codigo o proponer una implementacion alternativa, siempre que el estudiante verifique el resultado.
- Filtrado y triaje en pipelines de revision de codigo: integrado como primer paso para sugerir correcciones triviales antes de la revision humana, aprovechando su bajo coste de inferencia.
- Experimentacion en ajuste fino eficiente: sirve como caso de referencia reproducible para quienes quieran replicar un pipeline LoRA completo en CPU con PEFT y un dataset pequeno.
- Despliegue en entornos con recursos restringidos: al ocupar menos de 1 GB en bf16 (y bastante menos cuantizado), puede ejecutarse en dispositivos edge o contenedores con RAM muy limitada.

## Benchmarks y rendimiento

| Modelo | HumanEval subconjunto (40 tareas) pass@1 |
|---|---|
| Qwen2.5-Coder-0.5B-Instruct (base) | 18/40 = 45,0 % |
| Rhea-Coder-0.5B (este modelo) | 21/40 = 52,5 % |

El subconjunto se selecciono con `random.seed(0); sorted(random.sample(range(164), 40))` sobre `openai/openai_humaneval`, generando los indices [3, 10, 15, 18, 23, 24, 25, 35, 37, 52, 55, 64, 66, 72, 77, 79, 80, 84, 90, 91, 98, 100, 102, 103, 105, 107, 111, 113, 120, 122, 124, 129, 130, 136, 137, 142, 149, 150, 155, 160]. La evaluacion uso decodificacion greedy, bf16, maximo 384 tokens nuevos, batch 8 y ejecucion en subproceso aislado con timeout de 10 s y limite de 2 GB de memoria. El autor advierte que con solo 40 tareas la senal es ruidosa (una tarea equivale a 2,5 puntos) y que los numeros no son comparables con los resultados oficiales de HumanEval publicados por Qwen.

Tareas resueltas de nuevo: HumanEval/100, 113, 136, 142, 64 y 72. Tareas que dejaron de resolverse: HumanEval/150, 79 y 80.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1 GB para los pesos, mas overhead de activaciones y cache KV; en la practica cabe en GPUs con 2-4 GB o incluso en CPU.
- Cuantizacion: al ser un modelo de 0,5B, las versiones en 8 bits o 4 bits (si se generan con herramientas estandar de la familia Qwen2) reducen la huella a unos cientos de MB, aunque el repositorio no publica pesos cuantizados.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; tambien funciona en iGPU y CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas de los ultimos anos y en muchas integradas.
- Opciones de despliegue: transformers (con o sin PEFT para el adaptador), text-generation-inference (segun los tags), llama.cpp y Ollama si se generan pesos GGUF, y vLLM si se convierte al formato soportado.
- Latencia y throughput: no se han publicado mediciones de inferencia en la informacion disponible; el autor solo reporta velocidades de entrenamiento de 55-80 tokens/s en dos nucleos ARM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rhea-Coder-0.5B | 494 M | no disponible | 52,5 % (subconjunto de 40, propio) | apache-2.0 | Hugging Face |
| Qwen2.5-Coder-0.5B-Instruct | 494 M | no disponible | 45,0 % (mismo subconjunto, propio) | apache-2.0 | Hugging Face |
| Qwen2.5-Coder-1.5B-Instruct | 1,5 B | no disponible | no disponible en la informacion proporcionada | apache-2.0 | Hugging Face |
| Modelos coder de ~0,5B de otras familias (p. ej. variantes pequenas de StarCoder o CodeLlama) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa solo es valida frente al modelo base, ya que ambos se evaluaron con el mismo script y el mismo subconjunto. Cualquier comparacion con cifras oficiales de HumanEval de otros modelos no es metodologicamente equivalente.

## Limitaciones y advertencias

- Con 0,5B de parametros, el modelo es debil en tareas largas o que abarcan varios ficheros; puede generar codigo incorrecto con aparente seguridad.
- Entrenado exclusivamente con instrucciones en Python e ingles; no se objetivo ningun otro lenguaje de programacion ni idioma natural.
- Evaluado unicamente en un subconjunto de 40 tareas de HumanEval, con una mejora de 3 tareas que entra dentro del ruido estadistico.
- El autor califica explicitamente el resultado como un experimento de ajuste fino eficiente, no como un nuevo estado del arte.
- Riesgo de alucinacion relevante en APIs, nombres de funciones y librerias; todo el codigo generado debe ejecutarse y probarse.
- No se documentan evaluaciones de sesgo, seguridad ni robustez frente a prompts adversarios.
- Aunque la licencia es Apache-2.0 y permite uso comercial, el modelo no esta validado para produccion; el uso comercial requeriria evaluacion adicional propia.
- El dataset de entrenamiento (Magicoder-OSS-Instruct-75K) tiene licencia MIT, pero su procedencia sintetica conviene revisarla antes de usos sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/roskosmos19/Rhea-Coder-0.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/ise-uiuc/Magicoder-OSS-Instruct-75K
- Benchmark HumanEval: https://huggingface.co/datasets/openai/openai_humaneval
- Dataset mencionado pero no utilizado: https://huggingface.co/datasets/roskosmos19/Rhea-Coding
