# DorianAtSchool/RoboTalk-Qwen3-VL-8B-Thinking-Rationale-120traj

## Resumen

RoboTalk-Qwen3-VL-8B-Thinking-Rationale-120traj es un adaptador LoRA (PEFT) de una sola época construido sobre el modelo multimodal Qwen/Qwen3-VL-8B-Thinking. No es un modelo autónomo: se distribuye como pesos de adaptador en safetensors (0,2 GB de repositorio) y requiere cargar el modelo base y su procesador. Lo publica el usuario DorianAtSchool dentro del ecosistema del dataset RoboTalk, orientado a investigación en coordinación multiagente sobre un simulador doméstico.

El adaptador se entrena para predecir una traza de razonamiento (rationale) seguida de una llamada a herramienta (tool call), con una única política compartida que controla dos agentes con contextos parcialmente observables separados y un protocolo coordinador-seguidor. El conjunto de entrenamiento consta de 120 trayectorias por tarea en 43 tareas (5.160 trayectorias en total), con 10 tareas adicionales reservadas para evaluación held-out.

Su relevancia actual reside en que aborda un problema poco cubierto por los adaptadores genéricos: la coordinación de alto nivel entre agentes que solo ven una parte del estado y que deben comunicarse mediante un protocolo estructurado, combinando percepción visual, historial privado y definiciones globales de herramientas. El autor reporta una tasa de éxito simbólica del 90,23 % en tareas vistas y del 77,00 % en tareas no vistas, con intervalos de Wilson al 95 %.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer multimodal (vision-language) Qwen3-VL; el adaptador modifica únicamente los pesos del modelo de lenguaje, no el backbone visual |
| Parametros totales | No disponible para el conjunto combinado; el modelo base es de 8B (Qwen3-VL-8B-Thinking) y el adaptador añade un número de parámetros entrenables no especificado (rango LoRA 16, alpha 32) |
| Parametros activos | No aplica (el modelo base es denso, no MoE) |
| Longitud de contexto | No disponible como especificación del modelo; la configuración de entrenamiento usa un límite de secuencia de 8.192 tokens, incluidos los tokens visuales |
| Tipos de cuantizacion | No disponible; el adaptador se distribuye en safetensors y la carga de referencia usa bfloat16 |
| Idiomas soportados | en (inglés) |
| Licencia | No disponible para el adaptador (la model card no asigna licencia propia); el modelo base Qwen3-VL se distribuye bajo Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |
| Libreria | peft |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 0,2 GB |
| Modelo base | Qwen/Qwen3-VL-8B-Thinking |
| Dataset de entrenamiento | DorianAtSchool/RoboTalk |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-VL-8B-Thinking, un transformer multimodal denso de 8B parámetros con capacidad de razonamiento explícito (modo thinking) y entrada de imagen y texto. El ajuste fino se realiza exclusivamente sobre los pesos del modelo de lenguaje mediante LoRA: rango 16, alpha 32 y dropout 0,05. El backbone visual no se entrena por separado, por lo que la percepción visual depende íntegramente del modelo base congelado.

El entrenamiento consistió en una única época con tasa de aprendizaje 1e-4, weight decay 0,01, schedule coseno y un 3 % de warmup, semilla 42 y tamaño de lote efectivo 64 repartido en cuatro GPU, con un límite de secuencia de 8.192 tokens (incluyendo tokens visuales). Los datos son trayectorias del dataset RoboTalk: 120 trayectorias de entrenamiento por tarea en 43 tareas (5.160 en total) y 10 tareas mantenidas fuera del entrenamiento. El objetivo de predicción es una traza de razonamiento seguida de una llamada a herramienta. Una única política compartida gobierna dos agentes con contextos parcialmente observables independientes bajo un protocolo coordinador-seguidor. Los datasets de mayor escala contienen las selecciones de menor escala, y los historiales no incluyen índices de paso.

## Capacidades

- Generación de trazas de razonamiento (rationale) estructuradas antes de emitir una acción, en el estilo del modo thinking del modelo base.
- Llamada a herramientas (tool calling) siguiendo la plantilla de chat de Qwen3-VL y las definiciones globales de herramientas del entorno RoboTalk.
- Coordinación multiagente: una misma política compartida controla dos agentes con contextos parcialmente observables separados y un protocolo coordinador-seguidor.
- Comprensión de observaciones visuales por agente (entrada image-text-to-text) combinada con historiales privados de conversación.
- Razonamiento multi-paso orientado a alcanzar un objetivo simbólico (goal) definido en el simulador doméstico, con criterio de éxito libre de errores según una máquina de estados finitos (FSM).
- Ejecución en dos modos de inferencia: modo instruct (temperatura 0, presupuesto de 256 tokens de salida) y modo thinking (temperatura 0,6, top-p 0,95, top-k 20, presupuesto de 2.048 tokens de salida).
- Capacidades multilingües: no disponibles; el modelo está etiquetado únicamente para inglés.
- No se documentan capacidades de audio ni de control directo de hardware.

## Casos de uso

- Investigación en coordinación multiagente: el adaptador permite estudiar cómo una única política compartida resuelve tareas con observabilidad parcial cuando cada agente dispone de su propia historia y de observaciones visuales distintas, usando el protocolo coordinador-seguidor como marco experimental reproducible.
- Evaluación de razonamiento antes de actuar en entornos simulados: al predecir una traza de rationale seguida de una tool call, es adecuado para medir si el razonamiento explícito mejora la tasa de éxito frente a modelos que emiten la acción directamente.
- Generación de trayectorias sintéticas para RoboTalk: puede usarse para producir episodios adicionales con llamadas a herramientas y trazas de razonamiento, útiles para aumentar el conjunto de datos o para inicializar fases de entrenamiento posteriores.
- Estudio de generalización a tareas no vistas: el split held-out de 10 tareas y el protocolo de cohorte fija de 43/10 permiten comparar la degradación de rendimiento (90,23 % frente a 77,00 %) entre tareas entrenadas y no entrenadas.
- Análisis de protocolos de comunicación entre agentes: al estar entrenado con un protocolo de comunicación completo, sirve para experimentar con variantes del mismo, midiendo el impacto en el éxito libre de errores según la FSM.
- Prototipado de asistentes domésticos de alto nivel: en un simulador de hogar, el modelo puede decidir qué herramienta invocar y en qué orden para alcanzar un objetivo simbólico, sin tocar hardware real.
- Comparación de modos de inferencia: los ajustes diferenciados de instruct y thinking permiten estudiar el compromiso entre coste de tokens de salida (256 frente a 2.048) y precisión en tareas de coordinación.
- Investigación sobre adaptadores LoRA en modelos vision-language: sirve como caso de estudio de ajuste eficiente que solo modifica el modelo de lenguaje y deja congelado el codificador visual.

## Benchmarks y rendimiento

El autor reporta una evaluación en bucle cerrado con comunicación completa, diez episodios por tarea y muestreo nativo de cohorte fija 43/10. La métrica de éxito es "error-free FSM success": alcanzar el objetivo simbólico sin llamadas rechazadas. Los intervalos son intervalos de Wilson al 95 % sobre episodios, no sobre tareas remuestreadas.

| Split | Éxitos libres de error / episodios | Tasa de éxito | Intervalo 95 % |
|---|---:|---:|---:|
| in_training_tasks | 388/430 | 90,23 % | 87,06–92,69 % |
| held_out_tasks | 77/100 | 77,00 % | 67,85–84,16 % |

Ajustes de inferencia empleados: modo instruct con temperatura 0 y presupuesto de salida de 256 tokens; modo thinking con temperatura 0,6, top-p 0,95, top-k 20 y presupuesto de salida de 2.048 tokens. No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- El adaptador por sí solo ocupa 0,2 GB, pero requiere cargar el modelo base completo de 8B parámetros.
- VRAM estimada en bfloat16: en torno a 16 GB solo para los pesos del modelo base, más el codificador visual, el procesador y la caché KV; en la práctica, entre 20 y 24 GB para secuencias largas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para despliegue con concurrencia; RTX 4090 (24 GB) es suficiente para inferencia en bfloat16 con una sola petición o lotes pequeños.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB). En tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) requeriría cuantización a 8 o 4 bits.
- El entrenamiento reportado usó cuatro GPU con lote efectivo 64 y secuencias de hasta 8.192 tokens, lo que implica memoria muy superior a la de inferencia.
- Opciones de despliegue: Transformers con soporte Qwen3-VL más PEFT (ruta de referencia de la model card); también es posible fusionar el adaptador en el modelo base y servir con vLLM o TGI. Para llama.cpp u Ollama sería necesario fusionar y convertir a GGUF, algo no documentado por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoboTalk-Qwen3-VL-8B-Thinking-Rationale-120traj | 8B (base) + adaptador LoRA | No disponible (entrenamiento a 8.192 tokens) | 90,23 % en tareas vistas; 77,00 % en held-out (FSM, bucle cerrado) | Adaptador sin licencia asignada; base Apache-2.0 | HuggingFace, PEFT, 0 descargas |
| Qwen/Qwen3-VL-8B-Thinking (modelo base) | 8B | No disponible en la información proporcionada | No disponible para las tareas RoboTalk sin ajuste | Apache-2.0 | HuggingFace |
| Otros adaptadores RoboTalk del mismo autor | 8B (base) + LoRA | No disponible | No disponible | No disponible | HuggingFace |
| Otros modelos de coordinación multiagente | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos publicados en la información proporcionada para comparar con alternativas de la misma categoría (por ejemplo, otros adaptadores o modelos de planificación multiagente).

## Limitaciones y advertencias

- Ámbito restringido: está pensado para investigación sobre coordinación de alto nivel en un simulador doméstico, no para control directo de hardware ni despliegue crítico para la seguridad.
- El éxito medido por FSM es una métrica simbólica de tarea y no implica necesariamente que se cumplan todos los criterios físicos nativos del entorno.
- No es un modelo autónomo: sin el modelo base Qwen/Qwen3-VL-8B-Thinking y su procesador no funciona.
- La reproducción de las puntuaciones exige el objetivo de la tarea RoboTalk, el estado inicial, las definiciones globales de herramientas, las observaciones visuales por agente, los historiales privados y el protocolo de comunicación completo; un prompt de chat genérico no basta. Los historiales no incluyen índices de paso.
- Los ajustes de inferencia difieren entre variantes (instruct frente a thinking), por lo que mezclar configuraciones altera los resultados.
- La model card no asigna licencia propia al adaptador; el uso comercial depende de los términos del modelo base (Apache-2.0) y debe verificarse.
- Idiomas: solo inglés. El comportamiento en otros idiomas no está documentado y probablemente degrade.
- Repositorio con 0 descargas y 0 likes, creado y actualizado en la misma fecha: no hay evidencia de uso en producción ni de validación externa.
- Riesgo de alucinación: no evaluado explícitamente en la información disponible; como modelo generativo con trazas de razonamiento, puede producir tool calls plausibles pero incorrectas.
- Sesgos conocidos: no disponibles.
- No se incluyen estados del optimizador ni rutas de la máquina de entrenamiento, lo que limita la reproducibilidad exacta del proceso de ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DorianAtSchool/RoboTalk-Qwen3-VL-8B-Thinking-Rationale-120traj
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Thinking
- Dataset RoboTalk: https://huggingface.co/datasets/DorianAtSchool/RoboTalk
- Búsqueda web: los resultados devueltos corresponden a páginas de ayuda de Gmail y no guardan relación con el modelo; no se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
