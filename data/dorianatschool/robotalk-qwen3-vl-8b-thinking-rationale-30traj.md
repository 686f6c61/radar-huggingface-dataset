# DorianAtSchool/RoboTalk-Qwen3-VL-8B-Thinking-Rationale-30traj

## Resumen

RoboTalk-Qwen3-VL-8B-Thinking-Rationale-30traj es un adaptador LoRA de una sola época entrenado sobre el modelo vision-lenguaje Qwen/Qwen3-VL-8B-Thinking. Lo publica el usuario DorianAtSchool y su objetivo es un caso muy concreto: predecir una traza de razonamiento (rationale) seguida de una llamada a herramienta, dentro de un protocolo de coordinación entre dos agentes con contextos parcialmente observables y un esquema coordinador-seguidor. Una única política compartida controla ambos agentes.

El adaptador se ha entrenado con 30 trayectorias por tarea sobre 43 tareas del conjunto RoboTalk, lo que suma 1.290 trayectorias de entrenamiento, dejando 10 tareas fuera para evaluar generalización. No es un modelo autónomo: requiere el modelo base de Qwen, el procesador correspondiente y PEFT para cargarse, y el repositorio ocupa apenas 0,2 GB porque contiene únicamente los pesos LoRA del modelo de lenguaje, no un backbone visual reentrenado.

Su relevancia es acotada y de investigación: sirve para estudiar coordinación de alto nivel y tool calling en un simulador doméstico, no para control directo de hardware. Además, el adaptador no declara licencia propia, aunque el modelo base Qwen se distribuye bajo Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer vision-lenguaje Qwen3-VL; solo se publican pesos LoRA del modelo de lenguaje, no del backbone visual |
| Parametros totales | No disponible para el adaptador (rank 16, alpha 32); el modelo base es de 8B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens durante el entrenamiento, incluidos los tokens visuales; maximo del modelo base no disponible |
| Tipos de cuantizacion | No disponible (el autor no publica cuantizaciones del adaptador) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible para el adaptador; el modelo base Qwen3-VL-8B-Thinking se distribuye bajo Apache-2.0 |
| Formato de pesos | Safetensors (adaptador LoRA cargable con PEFT) |
| Tamano del repositorio | 0,2 GB |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3-VL-8B-Thinking |
| Dataset de entrenamiento | DorianAtSchool/RoboTalk |
| Fecha de creacion (HuggingFace) | 2026-09-15 |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3-VL-8B-Thinking, un transformer vision-lenguaje con modo de razonamiento explícito. El ajuste es un LoRA de rango 16 con alpha 32 y dropout 0,05, aplicado únicamente al modelo de lenguaje: el backbone visual no se reentrena. El entrenamiento usa una época con tasa de aprendizaje 1e-4, weight decay 0,01, scheduler coseno y 3% de warmup, con tamaño de lote efectivo 64 repartido en cuatro GPU, límite de secuencia de 8.192 tokens (tokens visuales incluidos) y semilla 42. La configuración saneada está en `training_config.json` y la pertenencia de tareas en `task_split.json`.

Los datos provienen del conjunto RoboTalk: 43 tareas con 30 trayectorias cada una (1.290 trayectorias de entrenamiento) más 10 tareas reservadas. El objetivo de predicción es una traza de razonamiento seguida de una llamada a herramienta, en un escenario multiagente donde una sola política compartida gobierna dos agentes con historiales privados y observaciones visuales separadas, bajo un protocolo de comunicación coordinador-seguidor. No se documenta en la información disponible el uso de RLHF o DPO. Los conjuntos a mayor escala contienen las selecciones de menor escala, según indica el autor.

## Capacidades

- Generación de trazas de razonamiento (rationale) seguidas de una llamada a herramienta, que es el objetivo exacto de entrenamiento.
- Tool calling / function calling a través de la plantilla de chat del modelo base; el autor indica que hay que usar dicha plantilla.
- Procesamiento de entradas image-text-to-text: consume observaciones visuales de los agentes además de texto.
- Coordinación multiagente: una única política compartida controla dos agentes con contextos parcialmente observables.
- Seguimiento de un protocolo de comunicación coordinador-seguidor con historiales privados por agente.
- Razonamiento multi-paso en modo thinking sobre el modelo base; las historias no incluyen índices de paso.
- Capacidad multilingüe: limitada al inglés.
- No incluye ajuste del backbone visual, por lo que la percepción visual es la del modelo base sin modificar.

## Casos de uso

- Investigación en coordinación multiagente: permite estudiar cómo una política compartida resuelve tareas domésticas simuladas con dos agentes que no comparten observaciones, usando el split fijo de 43 tareas de entrenamiento y 10 reservadas.
- Evaluación de protocolos de comunicación coordinador-seguidor: el adaptador genera llamadas a herramienta condicionadas al protocolo, de modo que se pueden comparar variantes de protocolo midiendo la tasa de éxito libre de errores del autómata (FSM).
- Generación de trazas de razonamiento para destilación o imitación: las salidas de tipo rationale + tool call sirven como datos supervisados para entrenar o evaluar políticas más pequeñas.
- Estudio de generalización con pocos datos: con 30 trayectorias por tarea y una época, sirve como punto de referencia para medir cuánto aporta más datos frente a la generalización a tareas no vistas (80,23% frente a 71,00% en la evaluación cerrada).
- Comparación de adaptadores LoRA sobre modelos vision-lenguaje: al fijar base, hiperparámetros y split, es un punto de control útil para aislar el efecto de la selección de trayectorias o del rango del adaptador.
- Generación de datos sintéticos de trayectorias en simulador: las llamadas a herramienta generadas pueden filtrarse por el validador del simulador y reutilizarse para aumentar el conjunto de entrenamiento.
- Docencia y reproducibilidad en robótica de alto nivel: el repositorio incluye configuración, split y resultados, lo que facilita reproducir el experimento sin reconstruir el pipeline completo.
- Investigación sobre robustez del tool calling: la métrica de llamadas rechazadas permite analizar cuándo el modelo emite acciones inválidas bajo contextos parcialmente observables.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros). La única evaluación disponible es cerrada sobre el simulador, con comunicación completa, diez episodios por tarea y muestreo nativo de la cohorte fija 43/10. La métrica es éxito del autómata libre de errores, es decir, alcanzar el objetivo simbólico sin llamadas rechazadas, con intervalos de Wilson al 95% calculados sobre episodios, no sobre tareas remuestreadas.

| Split | Exitos libres de error / episodios | Tasa de exito | Intervalo 95% |
|---|---:|---:|---:|
| in_training_tasks | 345/430 | 80,23% | 76,21–83,72% |
| held_out_tasks | 71/100 | 71,00% | 61,46–78,99% |

Ajustes de inferencia reportados: la evaluación de la variante Instruct usa temperatura 0 y un presupuesto de salida de 256 tokens; la evaluación de la variante Thinking usa temperatura 0,6, top-p 0,95, top-k 20 y un presupuesto de salida de 2.048 tokens. Los recuentos exactos y los ajustes están en `evaluation_results.json`.

## Requisitos de hardware

- El adaptador en disco ocupa 0,2 GB, pero la inferencia exige cargar el modelo base Qwen3-VL-8B-Thinking completo; el adaptador por sí solo no es desplegable.
- VRAM estimada para inferencia (estimación propia, no publicada por el autor): en bfloat16, unos 16-17 GB solo de pesos más el encoder visual, y del orden de 20-24 GB con caché KV y activaciones a 8.192 tokens.
- Con cuantización de 8 bits cabría aproximadamente en 12-14 GB; en 4 bits, en torno a 7-9 GB, siempre que el adaptador se fusione antes con el modelo base.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para bfloat16 sin restricciones; en el extremo de consumo, RTX 4090 (24 GB) permitiría bfloat16 justo, y RTX 3090, 4080 o 4070 Ti Super serían viables con cuantización.
- Entrenamiento: el autor usó cuatro GPU con tamaño de lote efectivo 64 y secuencias de hasta 8.192 tokens; el número y modelo exactos de GPU no se especifican.
- Opciones de despliegue: la ruta documentada es Transformers (con soporte Qwen3-VL) más PEFT; vLLM, llama.cpp, Ollama o TGI no están verificados en la información disponible, y en el caso de llama.cpp u Ollama requeriría fusionar el LoRA y convertir a GGUF.
- Latencia y throughput: no disponibles. Los únicos datos indirectos son los presupuestos de salida empleados en la evaluación (256 tokens en Instruct, 2.048 tokens en Thinking).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoboTalk-Qwen3-VL-8B-Thinking-Rationale-30traj | 8B base + LoRA r16 (repo de 0,2 GB) | 8.192 tokens en entrenamiento; maximo del base no disponible | 80,23% en tareas de entrenamiento y 71,00% en tareas reservadas (FSM libre de errores) | No disponible para el adaptador | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| Qwen/Qwen3-VL-8B-Thinking (modelo base) | 8B | No disponible en la informacion | Sin datos de FSM; el adaptador se evalua sobre este base | Apache-2.0 | HuggingFace |
| Qwen3-VL-8B-Instruct (variante referenciada en la model card) | 8B (variante) | No disponible en la informacion | Solo se documentan sus ajustes de inferencia, sin resultados | Apache-2.0 (heredada del base, segun la card) | HuggingFace |
| Otros adaptadores roboticos comparables | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; el adaptador hereda los del modelo base Qwen3-VL-8B-Thinking.
- Riesgo de alucinación: relevante en tool calling; la propia métrica de éxito libre de errores mide llamadas rechazadas, lo que implica que una parte de las generaciones no es válida.
- El éxito FSM es una métrica simbólica y no garantiza que se cumplan todos los criterios físicos nativos de la tarea.
- El ámbito previsto es la investigación sobre coordinación de alto nivel en un simulador doméstico; no está pensado para control directo de hardware ni para despliegues de seguridad crítica.
- Idiomas: solo inglés; no se documenta soporte de castellano ni de otros idiomas.
- Contexto: el entrenamiento se limita a secuencias de 8.192 tokens incluidos los visuales; contextos mayores no están cubiertos.
- Reproducibilidad: replicar las puntuaciones exige el objetivo de tarea, el estado inicial, las definiciones globales de herramientas, las observaciones visuales y los historiales privados de cada agente, además del protocolo de comunicación completo; un prompt de chat genérico no basta.
- Licencia: la model card no asigna licencia propia al adaptador. El modelo base es Apache-2.0, pero la ausencia de licencia explícita para el adaptador introduce incertidumbre para uso comercial; conviene aclararlo con el autor antes de cualquier explotación.
- Los ajustes de inferencia difieren entre variantes (temperatura 0 y 256 tokens frente a temperatura 0,6, top-p 0,95, top-k 20 y 2.048 tokens), lo que complica comparaciones directas.
- Los intervalos publicados son intervalos de Wilson sobre episodios, no sobre tareas nuevas; la varianza entre tareas puede ser mayor de lo que sugieren.
- El adaptador solo contiene pesos LoRA del modelo de lenguaje; el backbone visual no está ajustado, lo que puede limitar el rendimiento perceptivo en tareas visualmente exigentes.
- Los conjuntos a mayor escala contienen las selecciones de menor escala, según el autor, lo que puede generar solapamiento si se comparan variantes de distinto tamaño.
- Adopción nula en el momento de la consulta (0 descargas, 0 likes) y ausencia de validación por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DorianAtSchool/RoboTalk-Qwen3-VL-8B-Thinking-Rationale-30traj
- Dataset RoboTalk: https://huggingface.co/datasets/DorianAtSchool/RoboTalk
- Modelo base Qwen3-VL-8B-Thinking: https://huggingface.co/Qwen/Qwen3-VL-8B-Thinking
- Ficheros de configuracion y resultados citados en la model card: `training_config.json`, `task_split.json` y `evaluation_results.json` dentro del repositorio del adaptador.
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo. Los resultados devueltos corresponden a generadores de imagenes por IA en ruso, sin relacion con este adaptador, por lo que no se incluyen.
