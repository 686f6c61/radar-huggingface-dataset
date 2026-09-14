# SingleBicycle/ccpo-alfworld-qwen2.5-7b-global-fa

## Resumen

ccpo-alfworld-qwen2.5-7b-global-fa es un checkpoint intermedio de una política de agente entrenada con CCPO (Context-Conditioned Policy Optimization) sobre ALFWorld, un benchmark de tareas domésticas encarnadas de tipo textual. Lo publica el usuario SingleBicycle partiendo de Qwen/Qwen2.5-7B-Instruct, un transformer decoder-only de 7.615.616.512 parámetros (unos 7,6 mil millones) en formato safetensors y licencia Apache 2.0. No es un modelo de propósito general nuevo: es el resultado de un ajuste por aprendizaje por refuerzo orientado a un problema concreto, la asignación de crédito en RL de agentes multi-turno.

El interés técnico está en el estimador, no en el backbone. CCPO parte de la familia GRPO, que descompone la ventaja en un término de episodio y un término de paso; CCPO mantiene intacto el término de episodio y sustituye solo el de paso por una línea base *leave-one-out* condicionada por contexto y encogida por incertidumbre. Las entradas se agrupan por `(task_uid, observation_text)`, cada una recibe un vector de características congelado procedente del estado oculto del último token del prompt de la política de referencia, y los hermanos se ponderan con `exp(-d/tau)` sobre esa distancia de características.

El modelo es relevante ahora porque documenta de forma inusualmente honesta las trampas de medir RL de agentes: es un checkpoint del paso 105 dentro de una ejecución que objetivo 150 pasos, con una sola semilla por brazo, y el propio autor advierte de que no debe compararse con los resultados publicados de ALFWorld porque estos se obtuvieron con backbones Qwen2.5-1.5B-Instruct. El repositorio ocupa 30,5 GB y solo declara inglés como idioma.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2); ajuste por RL sobre Qwen/Qwen2.5-7B-Instruct |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la información proporcionada. La configuración de entrenamiento usa un máximo de 2048 tokens de prompt y 512 de respuesta |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en safetensors; no se distribuyen GGUF ni cuantizaciones oficiales |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería transformers) |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de Qwen2.5 con 7.615.616.512 parámetros, heredado de Qwen2.5-7B-Instruct y por tanto ya ajustado con instrucciones. Sobre él se aplica un entrenamiento de RL con CCPO, que pertenece a la familia GRPO: se calculan ventajas por episodio y por paso, y CCPO reemplaza únicamente el término de paso por una línea base *leave-one-out* condicionada por contexto y encogida por incertidumbre. Las entradas se agrupan en cubos por `(task_uid, observation_text)` —el mismo anclaje por estado que usan GiGPO y G2PO—, cada entrada recibe un vector de características congelado del estado oculto del último token del prompt de la política de referencia, blanqueado sobre el lote, y los hermanos se ponderan con `exp(-d/tau)` según esa distancia de características. El factor de encogimiento devuelve el resultado hacia la línea base uniforme cuando la discrepancia entre ambas no supera su propio ruido de muestreo. El objetivo es aislar el estimador comparando cara a cara contra una línea base en idénticas condiciones.

La variante publicada aquí se distingue por `gate=global`, `target=nextnode` y `rho=0.59`: la tarea forma un único cubo, el núcleo de afinidad phi actúa como puerta suave con confianza métrica 0,59, y el crédito de paso es el valor de nodo sucesor agrupado de G2PO en lugar del retorno restante. El entrenamiento se hizo sobre ALFWorld (AlfredTWEnv, 6 tipos de tarea) con lotes de 16 tareas x 8 rollouts = 128 episodios por paso, un máximo de 50 pasos de entorno por episodio e historial de longitud 2. Se usó una tasa de aprendizaje constante de 1e-6, coeficiente KL de 0,01 con estimador de baja varianza, gamma de 0,95, y evaluación sobre 128 tareas no vistas cada 5 pasos con temperatura 0,4. Los hiperparámetros siguen el script de referencia de G2PO para ALFWorld; solo cambian el tamaño del backbone y el número de GPUs. El entrenamiento se ejecutó en 8x NVIDIA H200. El código procede de tracyhann/agent-context-grpo, construido sobre verl-agent.

## Capacidades

- Generación de texto y decisión secuencial multi-turno dentro de entornos domésticos textuales: el modelo observa descripciones de habitaciones y objetos y elige la siguiente acción admisible.
- Formato de salida estructurado: emite `<think>...</think><action>...</action>`; el contenido de `<action>` se pasa directamente al entorno y debe coincidir con una acción admisible.
- Planificación de tareas compuestas en ALFWorld: los seis tipos de tarea evaluados son Pick, Look, Clean, Heat, Cool y Pick2, con éxito del 92,6%, 87,5%, 100,0%, 85,2%, 76,4% y 68,3% respectivamente en la mejor evaluación registrada.
- Reducción del número de interacciones: la media de turnos por episodio cae desde aproximadamente 39 al inicio del entrenamiento hasta 17,8 en el paso 105, lo que indica que la política resuelve tareas de forma más directa en lugar de explorar.
- Soporte de tool calling / function calling: no documentado como tal; la emisión de acciones al entorno funciona de facto como una interfaz de acción estructurada, pero no hay evidencia de una API de herramientas genérica.
- Soporte de agentes y razonamiento multi-paso: es la capacidad central del modelo, con un máximo de 50 pasos de entorno por episodio durante el entrenamiento.
- Capacidades multilingües: no disponibles. Solo se declara inglés.
- Capacidades especiales (modo thinking, visión, audio): dispone de un bloque `<think>` explícito en la salida. No hay visión ni audio: ALFWorld es un entorno puramente textual.
- Código y matemáticas: no documentado. No se han publicado evaluaciones de HumanEval, GSM8K ni similares para este checkpoint.

## Casos de uso

- Investigación en asignación de crédito para RL de agentes: el modelo existe como artefacto experimental de CCPO, y su utilidad principal es reproducir y comparar estimadores bajo hardware, semilla y orden de datos idénticos, tal como se hizo con los tres brazos del autor.
- Evaluación de políticas de agentes en ALFWorld: sirve como punto de referencia de un backbone de 7B en un benchmark donde lo publicado usa 1.5B, útil para estudiar cómo escala el rendimiento con el tamaño del modelo.
- Planificación doméstica simulada: el modelo resuelve tareas de recoger, examinar, limpiar, calentar, enfriar y colocar pares de objetos, lo que permite usarlo como política de referencia en simuladores de hogar basados en texto.
- Generación de trayectorias sintéticas: al producir secuencias completas de observación, razonamiento y acción, se puede emplear para generar datos de entrenamiento o destilación hacia modelos más pequeños que operen en el mismo formato.
- Pruebas de algoritmos de RL con recompensa escasa: al ser un checkpoint de una ejecución con recompensa binaria y episodios de hasta 50 pasos, es adecuado como entorno de validación de nuevas variantes de estimadores de ventaja.
- Prototipado de agentes con salida parseable: el esquema `<think>/<action>` permite construir analizadores sintácticos sencillos que separen razonamiento y acción en cualquier sistema que necesite registrar o auditar decisiones.
- Docencia y experimentación académica: el modelo y su documentación ilustran de forma práctica la diferencia entre término de episodio y término de paso en GRPO, el efecto del agrupamiento por estado ancla y el sesgo de leer el máximo de una serie ruidosa.

## Benchmarks y rendimiento

Los resultados disponibles corresponden a evaluación sobre 128 tareas de ALFWorld no vistas (`eval_in_distribution`), con temperatura 0,4, el protocolo usado por las líneas base publicadas.

Ventana convergida (paso >= 70), que el autor señala como la cifra que debe leerse:

| Métrica | Valor |
|---|---|
| Éxito en tareas no vistas | 77,5% |
| Desviación estándar | 6,3 |
| Evaluaciones promediadas | 9 |

Mejor evaluación individual (paso 105):

| Éxito | Turnos | Pick | Look | Clean | Heat | Cool | Pick2 |
|---|---|---|---|---|---|---|---|
| 85,9 | 17,8 | 92,6 | 87,5 | 100,0 | 85,2 | 76,4 | 68,3 |

La tasa de éxito en entrenamiento en ese mismo paso fue del 82,0%. El autor advierte explícitamente de que la fila del mejor paso no debe leerse como resultado, porque es el máximo de una serie ruidosa y está sesgada al alza en aproximadamente 1,5 desviaciones estándar; una evaluación de 128 episodios conlleva un margen de en torno a más/menos 5 puntos.

Comparación entre los tres brazos de CCPO, con hardware, semilla y orden de datos idénticos:

| Brazo | Media en tareas no vistas | Desviación estándar | n |
|---|---|---|---|
| CCPO return-hard + task backoff + J-weighting | 90,0 | 3,1 | 9 |
| CCPO return-hard | 83,5 | 6,5 | 10 |
| CCPO global gate, successor-node target | 77,5 | 6,3 | 9 |

Resultados publicados de ALFWorld citados en la model card, todos con Qwen2.5-1.5B-Instruct y por tanto no comparables con este checkpoint: GRPO 72,8; GiGPO K=2 90,16; HGPO K=2 92,77.

## Requisitos de hardware

- VRAM estimada en inferencia: los pesos en safetensors ocupan 30,5 GB de repositorio, coherente con precisión de 16 bits (unos 15,2 GB de pesos) más el tokenizador y artefactos auxiliares. Como referencia práctica, en bf16 o fp16 se necesitan del orden de 16-20 GB de VRAM para los pesos y la caché KV del contexto corto usado (2048 tokens de prompt).
- GPU recomendadas: A100 (40 GB o 80 GB), H100 y H200 para despliegue sin cuantizar con lotes grandes. El entrenamiento del modelo se realizó en 8x NVIDIA H200.
- GPU de consumo: cabe en una RTX 4090 o RTX 3090 de 24 GB en bf16/fp16 para inferencia de una sola secuencia, y con margen si se cuantiza a 8 bits (unos 8 GB) o 4 bits (unos 5-6 GB), siempre mediante cuantización aplicada por el usuario, ya que no hay GGUF oficial.
- Opciones de despliegue: transformers (el ejemplo de la model card usa `AutoModelForCausalLM` con `device_map="auto"`), vLLM y text-generation-inference, dado que el repositorio está etiquetado como compatible con TGI y endpoints. llama.cpp y Ollama requerirían una conversión manual a GGUF que no se distribuye.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por acción.
- Restricción de integración: el modelo espera el prompt de agente de ALFWorld empleado por verl-agent; fuera de ese formato o sin un entorno que acepte las acciones emitidas, la salida puede no ser utilizable.

## Comparativa con modelos similares

| Modelo | Parámetros | Categoría | Resultado ALFWorld | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ccpo-alfworld-qwen2.5-7b-global-fa | 7,6B | Política de agente RL | 77,5% (media convergida, 128 tareas) | Apache 2.0 | HuggingFace, checkpoint intermedio |
| Qwen/Qwen2.5-7B-Instruct | 7,6B | LLM de propósito general con instrucciones | No disponible; es la base sin RL sobre ALFWorld | Apache 2.0 | HuggingFace |
| Líneas base publicadas (GRPO / GiGPO K=2 / HGPO K=2) | 1,5B | Políticas de agente RL | 72,8 / 90,16 / 92,77 | No disponible en la información proporcionada | Publicaciones y repos asociados |
| Brazos alternativos de CCPO (return-hard, y variante con backoff y J-weighting) | 7,6B | Políticas de agente RL | 83,5 y 90,0 | Apache 2.0 | Mismo autor, disponibilidad no confirmada |

La comparación directa con GRPO, GiGPO y HGPO no es válida según el propio autor, porque esos números corresponden a un backbone de 1,5B y este checkpoint usa 7B. Tampoco existe una línea base GRPO válida dentro del mismo código: un intento anterior quedó contaminado al relanzar pasando la etiqueta de ejecución pero no el estimador.

## Limitaciones y advertencias

- Checkpoint interino: el brazo está en el paso 111 de 150 y los pesos publicados son los del paso 105, el de mejor puntuación hasta ahora. Los pesos finales y las cifras definitivas reemplazarán a estos cuando termine la ejecución.
- Una sola semilla por brazo: las líneas base publicadas usan tres. La propia guía del repositorio recomienda reportar la media de al menos tres semillas y no leer puntos individuales, por lo que las diferencias entre los tres brazos de CCPO deben considerarse no resueltas hasta su replicación.
- No demuestra superioridad sobre GRPO: no existe una línea base GRPO válida en el código y no se hace ninguna afirmación de superioridad.
- Ruido de medición: una evaluación de 128 episodios conlleva aproximadamente más/menos 5 puntos, y la mejor fila publicada está sesgada al alza en torno a 1,5 desviaciones estándar.
- Idiomas: solo inglés declarado. No hay evidencia de comportamiento multilingüe.
- Dominio restringido: entrenado sobre ALFWorld y con el formato de prompt de verl-agent. Fuera de ese entorno, el modelo puede emitir acciones no admisibles para el entorno de destino.
- Riesgo de alucinación: el contenido de `<action>` se ejecuta en el entorno, de modo que una acción inventada o mal formada constituye un fallo directo de la política. No se han publicado tasas de acciones inválidas.
- Ausencia de cuantizaciones oficiales: no hay GGUF ni pesos cuantizados en el repositorio, lo que obliga a convertir o cuantizar por cuenta propia para despliegues ligeros.
- Sesgos conocidos: no documentados en la información disponible. Al derivar de Qwen2.5-7B-Instruct, cabe esperar los sesgos propios de ese modelo base, pero no hay evaluación específica para este checkpoint.
- Licencia: Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base y de las dependencias (verl-agent y verl son Apache 2.0; ALFWorld procede de alfworld/alfworld).
- Advertencia de producción: al ser un checkpoint interino de investigación, no es recomendable como componente estable en sistemas productivos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SingleBicycle/ccpo-alfworld-qwen2.5-7b-global-fa
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Código de CCPO (agent-context-grpo): https://github.com/tracyhann/agent-context-grpo
- Framework verl-agent: https://github.com/langfengQ/verl-agent
- Benchmark ALFWorld: https://github.com/alfworld/alfworld
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos no guardaban relación con la ficha.
