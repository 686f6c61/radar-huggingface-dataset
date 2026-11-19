# Parth1612/Qwen2.5-Coder-0.5B-Instruct-Intel-Mac-GGUF

## Resumen

Este repositorio no contiene un modelo nuevo, sino un paquete de despliegue listo para usar que combina el GGUF oficial de Qwen2.5-Coder-0.5B-Instruct (cuantización Q4_K_M) con un perfil de lanzamiento del motor ToshLLM optimizado para un MacBook Pro Intel de 2019 con gráficos Radeon. Los pesos son idénticos byte a byte a la publicación de Qwen (491.400.064 bytes, SHA-256 `1d9614638d18024d0fbb36575a15f1302a3adf044df10345688ec4f6e1c4ff32`), por lo que no hay reentrenamiento ni ajuste fino: toda la mejora de velocidad proviene de la configuración de inferencia, concretamente de la decodificación especulativa por *prompt lookup*.

El modelo subyacente es Qwen2.5-Coder-0.5B-Instruct, un transformer denso de 0,5B parámetros (630.167.424 parámetros reales en safetensors) especializado en código y distribuido por Alibaba Qwen bajo licencia Apache 2.0. Su interés práctico está en que cabe en cualquier equipo modesto y permite editar funciones completas en local, algo útil para entornos sin acceso a la nube o con requisitos de privacidad.

La relevancia de este paquete concreto es la medición empírica que aporta: demuestra que técnicas de decodificación especulativa sin modelo borrador (reutilización de secuencias del propio prompt) aceleran tareas de edición de código sobre hardware antiguo, con un incremento del 49% en la tasa de salida en la tarea de renombrado de funciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (Qwen2.5) |
| Parametros totales | 630.167.424 (0,5B nominales) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens en el modelo base; 2.048 tokens configurados en el lanzador de este repositorio |
| Tipos de cuantizacion | Q4_K_M incluida en el repo; el modelo base ofrece múltiples formatos GGUF |
| Idiomas soportados | no disponible (la model card no los declara; el modelo base Qwen2.5 es multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only denso de la familia Qwen2.5, con 0,5B parámetros y una ventana de contexto nativa de 32.768 tokens. La variante Coder está especializada en generación y razonamiento sobre código y se distribuye en formato Instruct, es decir, ajustada para seguir instrucciones conversacionales. Los detalles concretos sobre volumen de tokens de entrenamiento, composición del dataset y uso de RLHF o DPO no están disponibles en la información proporcionada.

La innovación técnica de este repositorio no reside en el modelo sino en el motor de inferencia: ToshLLM v0.88.0 en su build AVX2 para Intel, con *prompt lookup* como método de decodificación especulativa. Este mecanismo reutiliza secuencias de tokens que ya aparecen en la entrada y deja que el modelo verifique la continuación propuesta, sin necesidad de un modelo borrador separado. En el benchmark del autor, las cuatro respuestas de lookup aceptaron 448 de 512 tokens propuestos, mientras que una tarea de escritura libre generó cero propuestas de borrador, lo que ilustra el perfil de carga donde la técnica aporta valor: ediciones pequeñas sobre código ya presente.

## Capacidades

- Generación de texto y código con ajuste por instrucciones (formato Instruct).
- Razonamiento sobre código: lectura de funciones completas, renombrado de identificadores, explicación de fragmentos.
- Conversación multi-turno en formato chat.
- Contexto nativo de hasta 32.768 tokens en el modelo base (limitado a 2.048 en el lanzador incluido).
- Soporte multilingüe heredado de Qwen2.5, aunque no se declara la lista de idiomas en este repositorio.
- Ejecución local en CPU con instrucciones AVX2 y offload parcial o total a GPU vía Metal.
- No se documenta soporte de tool calling, function calling ni capacidades de agente en la información disponible.
- No dispone de visión ni audio.

## Casos de uso

- Edición de código en local sobre hardware antiguo: pegar una función completa y pedir un cambio puntual (renombrar, ajustar una condición). El *prompt lookup* reutiliza las secuencias del código de entrada y acelera la respuesta, como demuestra el benchmark del autor con un 49% más de tokens por segundo en la tarea de renombrado.
- Asistente de refactorización en un MacBook Pro Intel: el perfil incluido arranca un servidor llama.cpp con interfaz web en `127.0.0.1:8083`, lo que permite trabajar sin conexión y sin enviar código propietario a servicios externos.
- Autocompletado y generación de fragmentos cortos en editores: con 0,5B parámetros y Q4_K_M el modelo responde con latencia de segundos por petición (3,185 s de mediana en el caso base del benchmark), adecuado para sugerencias acotadas.
- Docencia y prototipado de pipelines de LLM: el repositorio incluye el arnés de benchmark (`compare_intel_lookup.py`) y las mediciones crudas en JSON, útiles para reproducir experimentos de decodificación especulativa con presupuesto mínimo de hardware.
- Procesamiento por lotes de explicaciones de código: la tarea de "escribir una nueva explicación" mantiene 60,07 tokens/s con y sin lookup, lo que permite generar documentación de fragmentos a un ritmo estable en CPU.
- Validación de despliegues llama.cpp en entornos restringidos: sirve como referencia para verificar que un GGUF concreto funciona en un equipo con 16 GB de RAM y 4 GB de VRAM, con offload completo a la Radeon Pro 560X.

## Benchmarks y rendimiento

Datos medidos por el autor en un Core i9-9880H, 16 GB de RAM, Radeon Pro 560X de 4 GB y macOS Ventura 13.6.5, con motor AVX2, tres hilos de CPU, offload completo a GPU y el mismo modelo en ambas configuraciones. Cuatro peticiones cronometradas por ajuste y carga de trabajo:

| Carga de trabajo | Salida base | Salida con prompt lookup | Tiempo mediano por petición |
|---|---:|---:|---:|
| Renombrar una función en código proporcionado | 59,89 tokens/s | 89,50 tokens/s | 3,185 → 2,408 s |
| Escribir una explicación nueva | 60,08 tokens/s | 60,07 tokens/s | 4,496 → 4,497 s |

En la tarea de renombrado, la tasa de salida subió un 49% y la petición completa tardó un 24% menos. Las ocho respuestas de renombrado medidas devolvieron los mismos 141 tokens de salida y pasaron las comprobaciones funcionales. Las cuatro respuestas de lookup aceptaron 448 de 512 tokens propuestos en total; la explicación libre generó cero propuestas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el GGUF Q4_K_M ocupa 491.400.064 bytes (unos 0,49 GB), por lo que la inferencia cabe holgadamente en 1-2 GB de VRAM con offload completo.
- Equipo de referencia probado: Core i9-9880H, 16 GB de RAM, Radeon Pro 560X con 4 GB de VRAM, macOS Ventura 13.6.5.
- GPU recomendadas: cualquier GPU integrada o dedicada con soporte Metal en macOS; en el ecosistema llama.cpp general, también funciona en CPU pura y en GPUs NVIDIA consumer.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1-2 GB de memoria disponible; el cuello de botella es el soporte del motor, no la VRAM.
- Opciones de despliegue: llama.cpp con el motor ToshLLM v0.88.0 build AVX2 incluido en este repositorio; el GGUF es compatible con el resto del ecosistema llama.cpp (llama-server, Ollama y derivados), aunque el perfil de *prompt lookup* documentado es específico de ToshLLM.
- Latencia y throughput: 59,89 tokens/s en baseline y 89,50 tokens/s con lookup en la tarea de renombrado; 60,07 tokens/s en generación libre; tiempos medianos por petición de 2,408 a 4,497 s según carga.
- Configuración del lanzador: contexto de 2.048 tokens, batch y microbatch de 32, máximo de 16 tokens de borrador y continuación de lookup.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-Coder-0.5B-Instruct (este paquete) | 0,5B (630M reales) | 32.768 tokens (2.048 configurados) | Código, instrucciones | Apache 2.0 | GGUF en este repo y en Qwen |
| Qwen2.5-Coder-0.5B-Instruct (GGUF oficial de Qwen) | 0,5B | 32.768 tokens | Código, instrucciones | Apache 2.0 | GGUF en el repo de Qwen, sin perfil de inferencia |
| Qwen2.5-Coder-1.5B-Instruct | 1,5B | 32.768 tokens | Código, instrucciones | Apache 2.0 | Disponible en Hugging Face |
| Qwen2.5-Coder-7B-Instruct | 7B | 32.768 tokens | Código, instrucciones | Apache 2.0 | Disponible en Hugging Face |

La comparación con las variantes mayores es pertinente porque comparten familia, tokenizador y licencia: la de 0,5B es la única que se ejecuta con comodidad en CPU y GPUs integradas, a costa de menor calidad en tareas de razonamiento complejo. Los datos de benchmark comparativos entre estas variantes no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Con 0,5B parámetros, la capacidad de razonamiento y la calidad en tareas de código complejas es limitada; es un modelo para ediciones puntuales y fragmentos cortos, no para generación de proyectos completos.
- Riesgo de alucinación en APIs, nombres de funciones y librerías, especialmente fuera de los lenguajes mejor representados en su entrenamiento.
- El contexto configurado en el lanzador es de solo 2.048 tokens, muy por debajo de los 32.768 nativos; ficheros grandes no caben en una sola petición sin ajustar la configuración.
- El perfil de *prompt lookup* solo aporta ganancia cuando la entrada contiene secuencias reutilizables (ediciones pequeñas sobre código existente); en generación libre el beneficio es nulo, como muestra el benchmark.
- El motor ToshLLM v0.88.0 está atado a CPU Intel con AVX2 y a una GPU AMD Radeon visible como dispositivo Metal `MTL0`; no es portable a otros equipos sin sustituir el motor.
- La lista de idiomas soportados no está declarada en este repositorio; el rendimiento en castellano no está verificado.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el perfil de inferencia ni sobre el rendimiento en producción.
- Las mediciones provienen de cuatro peticiones por ajuste en un único equipo; la variabilidad estadística no se documenta.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Parth1612/Qwen2.5-Coder-0.5B-Instruct-Intel-Mac-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- GGUF oficial de Qwen: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct-GGUF/tree/ebb2015119c907b064c512bf053e945850b5875f
- GGUF upstream concreto: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct-GGUF/blob/ebb2015119c907b064c512bf053e945850b5875f/qwen2.5-coder-0.5b-instruct-q4_k_m.gguf
- Mediciones crudas del benchmark: https://github.com/0x89Parth/intel-mac-llm-bench/blob/main/results/intel-qwen-prompt-lookup.json
- Arnés de benchmark: https://github.com/0x89Parth/intel-mac-llm-bench/blob/main/compare_intel_lookup.py
- Instrucciones de compilación del motor: https://github.com/0x89Parth/intel-mac-llm-bench
- Ficha de PromptLayer sobre el GGUF: https://www.promptlayer.com/models/qwen25-coder-05b-instruct-gguf/
