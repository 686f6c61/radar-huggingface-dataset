# diwank/reachy-mini-motion-planner-4b-merge-v3-20261116

## Resumen

Reachy Mini motion planner 4b merge v3 es un modelo de lenguaje especializado en la planificación de movimientos para el robot Reachy Mini, desarrollado por el usuario diwank como parte de un piloto de investigación numérico. Se trata de un merge de pesos (model merging) derivado del modelo base `binhpham/reachy-mini-motion-planner-4b`, que a su vez parte de la arquitectura Qwen3.5 (etiqueta `qwen3_5_text`). El modelo recibe instrucciones en lenguaje natural y devuelve una receta de movimiento en JSON con un campo `idea` y un campo `recipe`, expresando ángulos como desplazamientos relativos tras anclar a la pose actual del robot.

El modelo resuelve el problema de traducir instrucciones conversacionales (por ejemplo, mantener una dirección o ejecutar un número explícito de ciclos) en especificaciones de movimiento numéricamente factibles para el robot. No genera comandos de motor directamente, sino recetas que un generador de flujo posterior debe materializar. Es relevante ahora porque documenta un flujo completo de ajuste fino supervisado (SFT) más aprendizaje por refuerzo (RL) sobre un modelo de 4B, con una evaluación congelada y auditable, y porque publica los resultados de éxito conjunto tarea-seguridad, que son deliberadamente bajos y reflejan la dificultad del problema.

El modelo tiene 4.205.751.296 parámetros (aproximadamente 4,2B), se distribuye en BF16 con pesos en safetensors y licencia Apache 2.0. Está pensado exclusivamente para inglés y para un pipeline de robótica de investigación, no para uso general de generación de texto. La versión v3 no entrena nada nuevo: evalúa y selecciona entre los endpoints SFT y RL previamente entrenados y sus mezclas de parámetros, eligiendo el endpoint RL sin cambios (peso 1) como artefacto final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, etiqueta `qwen3_5_text`) |
| Parametros totales | 4.205.751.296 (aprox. 4,2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el artefacto publicado es BF16; no se documentan otras cuantizaciones) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3.5, con unos 4,2B parámetros en precisión BF16. La model card no detalla la composición del dataset de preentrenamiento ni el número de tokens; lo que sí documenta es el proceso de ajuste específico para planificación de movimiento. El modelo base `binhpham/reachy-mini-motion-planner-4b` fue ajustado mediante SFT (endpoint `sft-baseline/`) y posteriormente mediante RL (checkpoint 30, en la raíz del repositorio de adaptadores `diwank/reachy-mini-motion-planner-4b-gesture-lora-v2-20261116`). El dataset de aumento usado en el entrenamiento previo es `diwank/reachy-mini-motion-augmentation-v2-20261116`.

La innovación de la versión v3 no es arquitectónica sino metodológica: se evalúan los endpoints SFT y RL y sus mezclas de parámetros sobre un conjunto de test congelado, con selección previa en dev. La mezcla seleccionada es `linear-1`, que corresponde al endpoint RL sin cambios (peso 1). La evaluación usa cuatro muestreos fijos del generador y una única completación greedy por tarea, con poses iniciales fijas, y reporta por separado el éxito conjunto tarea-seguridad, la seguridad bruta y el éxito robusto con un retardo corporal fijo de 250 ms. No se realizó validación física en robot, ni valoraciones humanas, ni puntuaciones de juez LLM.

## Capacidades

- Generación de recetas de movimiento en JSON con los campos `idea` y `recipe` a partir de instrucciones en lenguaje natural.
- Interpretación de instrucciones direccionales amplias (mantener una dirección) e instrucciones explícitas con restricciones numéricas y puntos finales absolutos.
- Manejo de poses: anclaje a `current_pose`, con ángulos expresados como desplazamientos relativos, traslaciones en metros y altura DSL en milímetros.
- Generación greedy determinista bajo un contrato de prompt estricto (`prompt_contract.json`), con `enable_thinking=False` y `add_generation_prompt=True`.
- Soporte de chat template mediante `AutoTokenizer` y `AutoModelForCausalLM`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Planificación de gestos en Reachy Mini: el modelo traduce una instrucción como mantener una dirección o ejecutar un número explícito de ciclos en una receta JSON que un generador de flujo convierte en trayectoria. Es adecuado porque el formato de salida está fijado por contrato y las unidades están normalizadas.
- Evaluación de pipelines SFT frente a RL en robótica: sirve como referencia reproducible para comparar endpoints y mezclas de pesos sobre un test congelado, con métricas de éxito conjunto y seguridad.
- Investigación en merging de modelos: el repositorio documenta la selección de la mezcla `linear-1` y los hashes exactos de los ficheros de carga, lo que permite reproducir la comparación.
- Generación de especificaciones numéricamente factibles: las trayectorias testigo del conjunto de evaluación establecen la viabilidad numérica de las recetas, útil para validar que las instrucciones son realizables antes de enviarlas al robot.
- Análisis de robustez ante retardo: el modelo se evalúa con un retardo corporal fijo de 250 ms, lo que permite estudiar cómo degradan las recetas bajo latencias realistas de control.
- Benchmark de reproducción: tras su publicación, las tareas del test congelado funcionan como benchmark de reproducción para futuros ajustes, no como test no visto.
- Estudio de seguridad en planificación de movimiento: las métricas de seguridad bruta y de éxito conjunto tarea-seguridad permiten analizar el compromiso entre cumplir la tarea y respetar restricciones de seguridad.

## Benchmarks y rendimiento

Resultados del test congelado (natural + explícito combinados), comparando el artefacto seleccionado con los endpoints SFT y RL:

| Métrica del test congelado | Seleccionado | Endpoint SFT | Endpoint RL |
|---|---:|---:|---:|
| Éxito conjunto tarea y seguridad | 14,62% | 14,62% | 14,62% |
| Seguridad bruta | 46,62% | 43,75% | 46,62% |
| Éxito robusto con retardo fijo | 14,37% | 14,00% | 14,37% |

Test de instrucciones naturales:

| Métrica del test congelado | Seleccionado | Endpoint SFT | Endpoint RL |
|---|---:|---:|---:|
| Éxito conjunto tarea y seguridad | 10,00% | 9,00% | 10,00% |
| Seguridad bruta | 32,00% | 35,00% | 32,00% |
| Éxito robusto con retardo fijo | 9,75% | 8,00% | 9,75% |

Test de especificación explícita:

| Métrica del test congelado | Seleccionado | Endpoint SFT | Endpoint RL |
|---|---:|---:|---:|
| Éxito conjunto tarea y seguridad | 19,25% | 20,25% | 19,25% |
| Seguridad bruta | 61,25% | 52,50% | 61,25% |
| Éxito robusto con retardo fijo | 19,00% | 20,00% | 19,00% |

No se han publicado resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,4 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda disponer de 12-16 GB de VRAM.
- GPU recomendadas: A100, H100 o L40S para despliegue en servidor; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para BF16.
- Cabe en GPU de consumo de gama alta con 24 GB; en tarjetas de 16 GB o menos sería necesario cuantizar, aunque no se documentan cuantizaciones oficiales.
- Opciones de despliegue: transformers (`AutoModelForCausalLM.from_pretrained`) es la vía documentada; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La generación es greedy con límite de tokens fijado por el contrato, lo que acota el coste por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| diwank/reachy-mini-motion-planner-4b-merge-v3-20261116 | 4,2B | No disponible | Apache 2.0 | Planificación de movimiento para Reachy Mini |
| binhpham/reachy-mini-motion-planner-4b | No disponible | No disponible | No disponible | Modelo base del que deriva este merge |
| diwank/reachy-mini-motion-planner-4b-gesture-lora-v2-20261116 | No disponible (adaptadores LoRA) | No disponible | No disponible | Adaptadores SFT y RL sobre el modelo base |

No se dispone de datos de benchmarks de lenguaje comparables con modelos generalistas de 4B en la información proporcionada, por lo que la comparación se limita a la familia de modelos del mismo pipeline.

## Limitaciones y advertencias

- El éxito conjunto tarea-seguridad es muy bajo (14,62% combinado, 10,00% en instrucciones naturales), lo que indica que el modelo falla en la mayoría de tareas del test congelado.
- La seguridad bruta también es limitada (46,62% combinado, 32,00% en instrucciones naturales); se requieren guardas de movimiento en tiempo de ejecución.
- No hubo validación física en robot, ni valoraciones humanas, ni puntuaciones de juez LLM; los resultados son puramente numéricos.
- La evaluación usa cuatro muestreos fijos del generador y una completación greedy por tarea, con poses iniciales fijas, lo que limita la generalización de los resultados.
- Las trayectorias testigo establecen viabilidad numérica, no la realización efectiva por parte del generador de flujo.
- El texto fijo de las instrucciones no establece generalización lingüística.
- El modelo solo soporta inglés.
- El modelo produce recetas, no comandos de motor; requiere un generador de flujo posterior y guardas de seguridad.
- Tras la publicación, las tareas del test congelado pasan a ser un benchmark de reproducción, no un test no visto para futuros ajustes.
- La licencia Apache 2.0 permite uso comercial, pero el modelo está etiquetado como piloto de investigación y no se ha validado en producción.
- No se documentan sesgos específicos, pero al ser un modelo ajustado sobre un dataset reducido y específico de robótica, su comportamiento fuera de ese dominio no está caracterizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/diwank/reachy-mini-motion-planner-4b-merge-v3-20261116
- Modelo base: https://huggingface.co/binhpham/reachy-mini-motion-planner-4b
- Adaptadores SFT y RL: https://huggingface.co/diwank/reachy-mini-motion-planner-4b-gesture-lora-v2-20261116
- Dataset de evaluación: https://huggingface.co/datasets/diwank/reachy-mini-motion-eval-v3-20261116
- Dataset de aumento previo: https://huggingface.co/datasets/diwank/reachy-mini-motion-augmentation-v2-20261116
