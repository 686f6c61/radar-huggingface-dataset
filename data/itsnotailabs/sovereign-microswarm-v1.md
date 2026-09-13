# ItsnotAilabs/Sovereign-MicroSwarm-v1

## Resumen

Sovereign-MicroSwarm-v1 es un modelo neuronal de 1,48 MB desarrollado por ItsnotAilabs y publicado bajo licencia Apache 2.0. No es un modelo de lenguaje: se trata de un evaluador de fase extremadamente compacto, diseñado para sincronizar enjambres de microcontroladores y agentes distribuidos. Su entrada es un vector de fases de 8 agentes en radianes ([B, 8], rango -π a π) y su salida son tres cabezas simultáneas: el parámetro de orden de Kuramoto R (sigmoide, [0, 1]), un par de acoplamiento T (softplus) y un vector de asignación de tareas sobre 8 agentes (softmax).

El problema que aborda es concreto: los enjambres que corren sobre ESP32-S3, STM32 o Raspberry Pi Pico W no pueden permitirse el coste de un solucionador numérico de ecuaciones diferenciales matriciales para recalcular el acoplamiento de fase en tiempo real. El modelo sustituye ese cálculo por una inferencia MLP minúscula, con latencias declaradas de 0,07 ms en CPU x86_64, 0,02 ms en GPU CUDA, 0,008 ms en ESP32-S3 y 0,005 ms en STM32F4/Cortex-M4.

Su relevancia actual es de nicho pero clara dentro de la computación de borde: encaja en la categoría de modelos de extracción de características de huella ultrapequeña (< 100 KB de RAM en ESP32-S3, < 64 KB en Cortex-M4), un régimen en el que la mayoría del ecosistema de IA open source no compite. Conviene señalar que el repositorio declara un tamaño de 0,0 GB, 0 descargas y 0 likes, y que la model card está truncada, por lo que la disponibilidad real de los pesos no puede confirmarse con los datos proporcionados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP ultracompacta con descomposición espacial seno/coseno y tres cabezas de salida (sigmoide, softplus, softmax); no es un transformer ni un SSM |
| Parametros totales | no disponible (el checkpoint declarado pesa 1,48 MB; el recuento de parámetros no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; la entrada es un vector de fase fijo de 8 agentes ([B, 8]) |
| Tipos de cuantizacion | no disponible; se mencionan ejecuciones en PyTorch, TFLite Micro y runtime C/C++ para MCU |
| Idiomas soportados | en (etiqueta declarada en la model card; el modelo no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible explícitamente; la librería declarada es PyTorch, con despliegue adicional en TFLite Micro y C/C++ |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card es un pipeline determinista de cuatro etapas: (1) entrada de vector de fase de 8 agentes en radianes; (2) capa de descomposición espacial seno/coseno que expande la entrada a [B, 16]; (3) encoder MLP con activación SiLU/ReLU y 64 dimensiones ocultas; y (4) tres cabezas en paralelo: coherencia de enjambre R con sigmoide, par de acoplamiento T con softplus (unidades N·m) y vector de asignación de tareas con softmax sobre 8 agentes. Se trata por tanto de un perceptrón multicapa compacto con cabezas multiobjetivo, no de un transformer, un MoE ni una SSM.

No se proporciona información sobre el volumen de datos de entrenamiento, la composición del dataset, el número de tokens ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card menciona una base de datos relacional SQLite (`domain_knowledge_base.sqlite`) y una clase de runtime `agent_helper.py` (`SovereignMicroSwarmV1Agent`) empaquetadas junto al modelo, con un método `query_relational_database`, pero no se documenta cómo se generó esa base de conocimiento ni cómo se integra con los pesos neuronales. Tampoco se describe ningún mecanismo de decodificación especulativa, atención lineal u otra innovación de inferencia: la innovación es puramente de escala y de planteamiento del problema (sustituir un solucionador de EDO de Kuramoto por un MLP).

## Capacidades

- Extracción de características de fase: acepta un vector de 8 fases en radianes y devuelve tres tensores (R, T y asignación de tareas).
- Cálculo del parámetro de orden de Kuramoto R en el rango [0, 1], interpretable como medida de coherencia global del enjambre.
- Estimación de par de acoplamiento T en N·m mediante cabeza softplus, pensado para re-sincronización adaptativa de osciladores.
- Asignación dinámica de tareas: distribución de probabilidad (softmax) sobre 8 agentes o nodos.
- Inferencia de latencia ultrabaja: 0,07 ms en CPU x86_64, 0,02 ms en GPU CUDA, 0,008 ms en ESP32-S3 y 0,005 ms en STM32F4/Cortex-M4.
- Huella de memoria mínima: 1,48 MB de checkpoint, < 100 KB de RAM en ESP32-S3 y < 64 KB en Cortex-M4.
- Consulta a una base de conocimiento SQLite incluida en el paquete mediante la clase auxiliar de agente.
- No dispone de generación de texto, razonamiento, código, matemáticas simbólicas, visión, audio, tool calling ni function calling. No es un modelo conversacional ni soporta agentes multi-paso por sí mismo, pese a estar etiquetado con `multi-agent` y a proponerse su uso en LangChain, AutoGen o CrewAI.

## Casos de uso

- Sincronización de fase en enjambres de microcontroladores: el modelo evalúa las fases de 8 nodos ESP32-S3 y devuelve R y T en 0,008 ms, lo que permite cerrar el lazo de control dentro del mismo ciclo de reloj sin comprometer el presupuesto temporal del firmware.
- Control de formación en micro-robots y drones: en lugar de resolver las ecuaciones de Kuramoto en cada iteración, el par T calculado por el modelo se aplica directamente como corrección de fase, reduciendo el riesgo de deriva de osciladores y de colisiones en formaciones cerradas.
- Asignación de subtareas en flotas heterogéneas: la cabeza softmax reparte trabajo entre 8 agentes o procesos en función de su estado de fase, útil en líneas de montaje o almacenes con robots de baja potencia de cómputo.
- Redes de sensores inalámbricos con restricciones energéticas: al caber en menos de 64 KB de RAM sobre Cortex-M4, el modelo puede ejecutarse en nodos alimentados por batería o recolección de energía donde no es viable enviar datos a la nube.
- Detección de desincronización como señal de fallo: una caída sostenida de R por debajo de un umbral puede usarse como indicador temprano de que un nodo del enjambre se ha degradado o ha perdido comunicación.
- Pacing de agentes LLM en orquestadores multi-agente: la model card propone consultar el modelo para mantener el consenso y evitar estados de ejecución fuera de orden en redes de agentes (LangChain, AutoGen, CrewAI); esto requiere la capa `agent_helper.py` incluida, ya que el modelo por sí solo únicamente produce vectores de fase.
- Sincronización de relojes lógicos en pipelines distribuidos: el par de acoplamiento puede utilizarse como corrección incremental de marcas temporales en sistemas embebidos que comparten una tarea periódica común.

## Benchmarks y rendimiento

La model-index oficial del modelo declara una lista de resultados vacía (`results: []`), por lo que no hay métricas estándar tipo MMLU, HumanEval o GSM8K (y no tendrían sentido para este tipo de modelo). Los únicos datos disponibles son las métricas declaradas por el propio autor en la model card:

| Entorno / hardware | Latencia declarada | Precisión / MSE declarado | Huella de memoria |
|---|---|---|---|
| CPU x86_64 (PyTorch) | 0,07 ms | MSE 0,0558 | 1,48 MB |
| GPU NVIDIA (CUDA) | 0,02 ms | Precisión 79,62 % | 1,48 MB |
| ESP32-S3 (TFLite Micro / C) | 0,008 ms | Sincronización en tiempo real | < 100 KB de RAM |
| STM32F4 / Cortex-M4 (C++) | 0,005 ms | Sincronización en tiempo real | < 64 KB de RAM |

Estos valores proceden exclusivamente del autor del modelo y no se han verificado de forma independiente. No se especifica el protocolo de medición, el tamaño de lote, la versión de las librerías ni el conjunto de evaluación utilizado para el MSE o la precisión del 79,62 %.

## Requisitos de hardware

- VRAM para inferencia: no disponible como cifra explícita; con 1,48 MB de checkpoint, la inferencia cabe holgadamente en cualquier GPU con unos pocos megabytes libres.
- GPU recomendadas: ninguna en particular; el modelo se ejecuta en cualquier GPU NVIDIA compatible con CUDA y también en CPU x86_64, con latencias de 0,02 ms y 0,07 ms respectivamente según el autor.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en iGPU; el cuello de botella no es la memoria sino el microcontrolador objetivo.
- Microcontroladores soportados: ESP32-S3 (menos de 100 KB de RAM) y STM32F4/Cortex-M4 (menos de 64 KB de RAM), mediante TFLite Micro o runtime C/C++.
- Opciones de despliegue: PyTorch (librería declarada), TFLite Micro, C/C++ para MCU y MicroPython en nodos de borde. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: 0,07 ms (CPU x86_64), 0,02 ms (CUDA), 0,008 ms (ESP32-S3) y 0,005 ms (STM32F4); el throughput no se declara.

## Comparativa con modelos similares

No se han identificado en la información proporcionada modelos open source comparables de la misma categoría (predictores de fase de enjambre de menos de 2 MB para microcontroladores). La comparación directa con modelos de lenguaje no es pertinente: Sovereign-MicroSwarm-v1 no genera texto ni resuelve tareas cognitivas, y sus métricas (MSE, latencia en microsegundos) no son conmutables con las de un LLM.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sovereign-MicroSwarm-v1 | no disponible (checkpoint de 1,48 MB) | no aplica (entrada fija de 8 fases) | MSE 0,0558 (CPU), precisión 79,62 % (CUDA), declarados por el autor | Apache 2.0 | Repositorio HuggingFace con 0 descargas y 0 likes; tamaño declarado 0,0 GB |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni soporta tool calling o function calling. Cualquier expectativa derivada de las etiquetas `multi-agent` o `feature-extraction` debe ajustarse a su función real, que es producir tres tensores numéricos a partir de 8 fases.
- Ausencia total de benchmarks verificables: la model-index está vacía y las cifras publicadas (MSE 0,0558, precisión 79,62 %) proceden únicamente del autor, sin protocolo de evaluación descrito ni replicación independiente.
- El repositorio declara 0,0 GB de tamaño, 0 descargas y 0 likes, lo que sugiere que los pesos podrían no estar realmente disponibles para su descarga. Debe verificarse antes de planificar cualquier integración.
- La model card está truncada: el apartado de integración con agentes Python (LangChain, AutoGen, CrewAI, Antigravity) se corta a mitad de ejemplo, por lo que la interfaz real de `agent_helper.py` y de `domain_knowledge_base.sqlite` no puede confirmarse.
- La entrada está fijada a 8 agentes. El comportamiento con un número distinto de nodos no está documentado, lo que limita el escalado a enjambres mayores.
- Fecha de creación declarada en HuggingFace: 2026-09-12, posterior a la fecha habitual de publicación; conviene tratarla como una anomalía de metadatos.
- Idiomas: la model card está en inglés y solo se declara `en`; el modelo no procesa lenguaje natural, por lo que el soporte multilingüe no aplica.
- Riesgo de calibración incorrecta: al no documentarse el dataset de entrenamiento ni la distribución de fases cubierta, las salidas de par T podrían ser poco fiables fuera del régimen para el que fue ajustado.
- Riesgo físico en robótica y drones: un par de acoplamiento mal calibrado aplicado a actuadores reales puede provocar colisiones o inestabilidad en formación. Se recomienda limitar el par y validar en simulación antes de desplegar en hardware.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución con atribución y sin garantías, pero el aviso de copyright y el texto de licencia deben conservarse.
- No se especifican requisitos de seguridad, límites operativos ni mecanismos de parada ante fallo, aspectos críticos en cualquier despliegue sobre microcontroladores acoplados físicamente.

## Enlaces

- HuggingFace: https://huggingface.co/ItsnotAilabs/Sovereign-MicroSwarm-v1
- Paper, blog, repositorio o demo adicionales: no disponible. Las búsquedas web realizadas no han devuelto ningún resultado relacionado con el modelo, su autor o su arquitectura.
