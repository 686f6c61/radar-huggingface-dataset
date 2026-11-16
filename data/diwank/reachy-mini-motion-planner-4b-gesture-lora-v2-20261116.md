# diwank/reachy-mini-motion-planner-4b-gesture-lora-v2-20261116

## Resumen

Reachy Mini augmented gesture pilot v2 es un adaptador LoRA de tipo PEFT publicado por el usuario diwank sobre el planificador de movimiento binhpham/reachy-mini-motion-planner-4b, un modelo de 4.000 millones de parametros orientado a la generacion de recetas de movimiento para el robot humanoide Reachy Mini. El adaptador se aplica exclusivamente sobre el decodificador de texto extraido del modelo base, no sobre el wrapper multimodal completo, y su proposito es mejorar la fiabilidad de las recetas de gestos generadas a partir de una pose inicial expresada en JSON.

El entrenamiento combina una fase de ajuste supervisado (SFT) de 20 actualizaciones seguida de 50 actualizaciones de GRPO (Group Relative Policy Optimization) con LoRA de rango 16 en BF16 sobre ocho GPU A100. Los datos proceden del dataset sintetico diwank/reachy-mini-motion-augmentation-v2-20261116, generado con GPT-6.1 Terra (low) a partir de recetas de estado emparejadas y parafrasis. El checkpoint publicado (grpo-checkpoint-30) se selecciono con resultados de desarrollo antes de abrir el conjunto de test.

La relevancia de esta ficha es doble: por un lado, documenta un piloto de investigacion numerico con resultados medidos (40,00% de exito completo en tarea y seguridad en held-out para el adaptador seleccionado, frente al 17,50% de la version v1 y el 52,50% del baseline SFT), y por otro ilustra un caso practico de RL aplicado a planificacion motora con un generador de flujo congelado de 22 millones de parametros. No se probo ningun robot fisico y el propio autor advierte que las guardas de movimiento en tiempo de ejecucion siguen siendo necesarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre el decodificador de texto de un transformer de 4B; el generador de flujo de 22M permanece congelado |
| Parametros totales | 4B (modelo base); el adaptador LoRA es de rango 16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenamiento y exportacion en BF16) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); exportacion merged en BF16 |
| Modelo base | binhpham/reachy-mini-motion-planner-4b (revision 1b60d8f16b85473ceb20e3b62e464780c532b519) |
| Dataset de entrenamiento | diwank/reachy-mini-motion-augmentation-v2-20261116 |
| Tamano del repo | 0,3 GB |
| Libreria | peft |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El adaptador opera sobre el decodificador de texto de un planificador de 4B que genera recetas de movimiento en JSON (campos `idea` y `recipe`) a partir de una instruccion y una pose actual serializada como JSON con claves ordenadas. El sistema completo incluye un generador de flujo de 22 millones de parametros que permanece congelado durante todo el entrenamiento; el LoRA solo modifica el decodificador de texto. El entrenamiento parte del planificador original fijado y aplica 20 actualizaciones de SFT seguidas de 50 actualizaciones de GRPO, con LoRA de rango 16 en BF16 sobre ocho A100. Los datos de SFT son 80 filas (dos parafrasis por caso de estado aceptado) distribuidas en diez familias, generadas con GPT-6.1 Terra (low) mediante 115 llamadas, 310 candidatos y 40 casos de estado aceptados de 80 intentados, con una ronda de reparacion usando retroalimentacion numerica.

La innovacion principal esta en la funcion de recompensa de GRPO: mantiene penalizaciones numericas acotadas por violaciones y, solo cuando las trayectorias cruda y reproducida son seguras, suma el doble de la fidelidad de gesto minima (cruda/reproducida) mas el doble del exito completo de tarea. La fidelidad incluye amplitud, direccion o reversiones, duracion y punto final. Las salidas invalidas puntuan -10. Se combinan dos muestras del generador como la mitad de su media mas la mitad de su minimo, y el entrenamiento usa semillas de paso emparejadas frescas. El juez cualitativo (Luna, medium) se excluyo por falta de fiabilidad: 17 resultados no puntuables de 23 pares y solo 14/23 consistentes en orden, por debajo del minimo de 25 pares cubiertos. No hubo calibracion humana ni entrenamiento de recompensa con juez.

## Capacidades

- Generacion de recetas de movimiento para el robot Reachy Mini a partir de una pose inicial en JSON y una instruccion en lenguaje natural.
- Razonamiento sobre estados: el modelo recibe poses asentadas (sin velocidad ni manejo de interrupciones) y produce recetas con angulos en grados, traslaciones en metros y altura de receta en milimetros.
- Generacion de gestos con fidelidad medida en amplitud, direccion o reversiones, duracion y punto final.
- Salida estructurada en JSON con campos `idea` y `recipe`, no comandos de motor.
- Soporte de modo de generacion greedy con `enable_thinking=False` y `add_generation_prompt=True` en la plantilla de chat del tokenizer, maximo 512 tokens nuevos y ambos EOS IDs [248046, 248044].
- Capacidad multilingue limitada al ingles (unico idioma declarado).
- No dispone de tool calling, function calling, vision ni audio en el adaptador publicado.

## Casos de uso

- Planificacion de gestos en simulacion para el robot Reachy Mini: el adaptador genera recetas de movimiento que se validan contra el generador de flujo congelado y las comprobaciones de cinematica y holgura antes de cualquier despliegue, lo que permite iterar sobre gestos sin riesgo fisico.
- Evaluacion de pipelines de RL para robotica: sirve como caso de referencia para medir el efecto de GRPO frente a SFT en tareas de planificacion motora con recompensas numericas acotadas y verificacion de seguridad.
- Generacion de datos sinteticos de movimiento: las recetas producidas pueden alimentar procesos de aumento de datos o de comparacion con el baseline SFT disponible en `sft-baseline/`.
- Investigacion en fidelidad de gestos: permite estudiar como varian amplitud, direccion, duracion y punto final entre trayectorias crudas y reproducidas bajo distintas condiciones de pose inicial.
- Reproduccion de benchmarks controlados: los splits publicos funcionan como benchmarks de reproduccion (no como tests no vistos) para comparar adaptadores sobre las mismas familias de tareas.
- Prototipado de asistentes roboticos conversacionales: integrado en un wrapper multimodal, el decodificador de texto puede traducir instrucciones en ingles a recetas estructuradas, aunque el adaptador no es drop-in para dicho wrapper.

## Benchmarks y rendimiento

Resultados en held-out publicados por el autor (40 prompts, diez grupos de tarea independientes, dos poses iniciales y dos parafrasis por grupo, dos muestras emparejadas del generador por prompt):

| Metrica held-out | v1 RL anterior | SFT nuevo | Adaptador v2 seleccionado | v2 merged |
|---|---:|---:|---:|---:|
| Exito completo de tarea y seguridad v2 | 17,50% | 52,50% | 40,00% | 40,00% |
| Predicado util/seguro original | 25,00% | 72,50% | 71,25% | 70,00% |
| Trayectoria cruda segura | 26,25% | 77,50% | 90,00% | 88,75% |
| Predicado de gesto reproducido | 98,75% | 95,00% | 81,25% | 81,25% |

Intervalos bootstrap exploratorios (20.000 remuestreos, agrupando cada grupo completo): exito completo del adaptador seleccionado menos v1 = +22,50 puntos porcentuales, intervalo del 95% [2,5; 47,5]. Exito completo con pose inicial correcta menos pose intercambiada para el adaptador = -5,00 puntos, intervalo [-17,5; 5,0]. El autor advierte que estas comparaciones estrechas no establecen razonamiento general de estado ni seguridad fisica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base es de 4B y el entrenamiento se realizo en BF16 sobre ocho A100, por lo que la inferencia en BF16 requiere del orden de 8-10 GB de VRAM mas el generador de flujo de 22M (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: A100 (usadas en entrenamiento); H100 y RTX 4090 son compatibles por capacidad de memoria, aunque no se documentan pruebas en ellas.
- Cabe en GPU consumer: previsiblemente si en RTX 4090 y GPUs con 16 GB o mas en BF16, aunque no hay medicion publicada.
- Opciones de despliegue: carga mediante `peft.PeftModel.from_pretrained` sobre `load_text_model(base)` con `load_tokenizer(base)`; el autor no documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diwank/reachy-mini-motion-planner-4b-gesture-lora-v2-20261116 | 4B (LoRA r16) | no disponible | Planificacion de gestos con GRPO sobre decodificador de texto | apache-2.0 | Hugging Face, 0 descargas |
| binhpham/reachy-mini-motion-planner-4b (base) | 4B | no disponible | Planificador de movimiento original | no disponible en la informacion | Hugging Face |
| Adaptador SFT baseline (incluido en `sft-baseline/`) | 4B (LoRA r16) | no disponible | SFT sin RL, mismo dataset | apache-2.0 | Incluido en el repo del adaptador |
| v1 RL (version anterior) | 4B (LoRA r16) | no disponible | GRPO previo, sin aumento de datos v2 | no disponible en la informacion | Referenciado en la model card |

## Limitaciones y advertencias

- No se probo ningun robot fisico: todos los resultados son numericos sobre un generador de movimiento congelado, cinematica, replay cronologico y comprobaciones de holgura y controlador. Las guardas de movimiento en tiempo de ejecucion siguen siendo necesarias.
- El adaptador no es drop-in para el wrapper multimodal; solo se aplica al decodificador de texto extraido.
- Entrenamiento con una sola semilla y un piloto controlado pequeno; sin segunda semilla de entrenamiento ni replicacion de grupos de test dentro de familia.
- Cobertura de datos desigual: solo tres grupos emparejados superan su propio origen mientras fallan mutuamente en el otro origen.
- Todas las tareas usan poses asentadas, sin manejo de velocidad ni interrupciones.
- Las familias de gestos conocidas se comparten entre splits; los grupos de tarea, poses y semillas del generador estan separados, pero una vez publicados los splits funcionan como benchmarks de reproduccion, no como tests no vistos.
- No hay resultado de naturalidad valorado por humanos ni medicion fisica de tasa de bloqueo.
- El juez cualitativo se excluyo por falta de fiabilidad (17/23 pares no puntuables, 14/23 consistentes en orden); no hubo calibracion humana ni entrenamiento de recompensa con juez.
- La exportacion merged en BF16 puede cambiar la salida greedy por redondeo; se recargo y evaluo por separado.
- El modelo solo declara soporte de ingles.
- Riesgo de alucinacion en recetas: el propio diseno de recompensa penaliza salidas invalidas con -10, lo que indica que el modelo puede producir recetas no validas.
- Licencia apache-2.0 permite uso comercial, pero el autor no ofrece garantias de seguridad fisica ni de validez fuera del dominio de Reachy Mini.

## Enlaces

- Modelo adaptador en Hugging Face: https://huggingface.co/diwank/reachy-mini-motion-planner-4b-gesture-lora-v2-20261116
- Baseline SFT incluido en el repo: https://huggingface.co/diwank/reachy-mini-motion-planner-4b-gesture-lora-v2-20261116/tree/main/sft-baseline
- Modelo merged v2: https://huggingface.co/diwank/reachy-mini-motion-planner-4b-gesture-v2-20261116
- Dataset de aumento: https://huggingface.co/datasets/diwank/reachy-mini-motion-augmentation-v2-20261116
- Planificador original: https://huggingface.co/binhpham/reachy-mini-motion-planner-4b/tree/1b60d8f16b85473ceb20e3b62e464780c532b519
- Generador y DSL: https://github.com/pham-tuan-binh/reachy-motion-generator/tree/18ff98574a8f0652b21db32f204a8029f8930d88
