# mradermacher/quantumgpt-124m-v3-GGUF

## Resumen

QuantumGPT v3 es un modelo de lenguaje de 124 millones de parámetros, basado en la arquitectura GPT-2 small, fine-tuneado específicamente para generar circuitos cuánticos en formato OpenQASM 2.0. Fue desarrollado por el usuario merileijona y entrenado sobre el dataset `quantum-circuits-21k`, compuesto por más de 21.000 ejemplos de circuitos cuánticos. La versión aquí descrita es una cuantización GGUF realizada por mradermacher, que permite ejecutar el modelo en entornos con recursos limitados, como CPU o GPUs de consumo, mediante herramientas como llama.cpp u Ollama.

La relevancia de este modelo radica en que aborda un nicho muy específico: la generación automática de código QASM para computación cuántica. Aunque no es un modelo de propósito general, puede ser útil para investigadores y desarrolladores que necesiten prototipar circuitos cuánticos de forma rápida o generar variantes de circuitos existentes. Al ser de tamaño reducido (124M), su inferencia es rápida y viable en hardware modesto, lo que facilita su integración en flujos de trabajo de simulación cuántica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder) |
| Parametros totales | 124.082.688 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

El modelo base `quantumgpt-124m-v3` es un GPT-2 small (12 capas, 768 dimensiones ocultas, 12 cabezas de atencion) fine-tuneado sobre el dataset `merileijona/quantum-circuits-21k`, que contiene circuitos cuanticos expresados en OpenQASM 2.0. No se dispone de informacion detallada sobre el numero exacto de tokens de entrenamiento ni sobre el uso de tecnicas como RLHF o DPO. La cuantizacion GGUF fue realizada por mradermacher mediante cuantizacion estatica (sin imatrix), generando multiples versiones con diferentes niveles de precision para adaptarse a distintos requisitos de memoria y calidad.

La innovacion principal del modelo no reside en la arquitectura, que es la clasica de GPT-2, sino en su especializacion en un dominio tecnico: la sintaxis de OpenQASM 2.0. Esto implica que el modelo ha aprendido la gramatica, los nombres de las puertas cuanticas (H, CNOT, T, etc.) y las estructuras tipicas de los circuitos, lo que le permite generar codigo sintacticamente valido en la mayoria de los casos.

## Capacidades

- Generacion de circuitos cuanticos en OpenQASM 2.0, incluyendo declaraciones de qubits, registros clasicos y operaciones de puerta.
- Completado de circuitos parciales: dado un prefijo de codigo QASM, el modelo puede continuar con operaciones coherentes.
- Generacion de variantes de circuitos conocidos (por ejemplo, circuitos de teleportacion, GHZ, etc.) si fueron incluidos en el dataset de entrenamiento.
- No soporta tool calling, function calling ni razonamiento multi-paso fuera del ambito de generacion de codigo.
- No tiene capacidades multimodales (vision, audio).
- Multilingue: no, solo ingles (aunque el codigo QASM es independiente del idioma).

## Casos de uso

- Prototipado rapido de circuitos cuanticos: un investigador puede describir en lenguaje natural (en ingles) el tipo de circuito que necesita y obtener un esqueleto en OpenQASM 2.0 que luego puede refinar manualmente. El modelo es adecuado porque genera codigo sintacticamente correcto en la mayoria de las ocasiones.
- Generacion de circuitos de prueba para simuladores cuanticos: herramientas como Qiskit o Cirq pueden consumir codigo QASM; el modelo puede producir circuitos aleatorios pero plausibles para estresar simuladores o validar compiladores.
- Educacion y divulgacion: estudiantes de computacion cuantica pueden usar el modelo para ver ejemplos de circuitos y comparar con implementaciones manuales, acelerando el aprendizaje de la sintaxis QASM.
- Aumento de datasets: dado un conjunto de circuitos existente, el modelo puede generar variaciones sintacticas que sirvan para ampliar conjuntos de entrenamiento de otros modelos o para pruebas de robustez.
- Integracion en pipelines de investigacion: al ser un modelo pequeno y rapido, puede ejecutarse en local dentro de scripts de Python (via llama.cpp o bindings de transformers) para generar circuitos bajo demanda sin depender de APIs externas.
- Asistente en entornos de desarrollo integrado (IDE): un plugin que sugiera completados de codigo QASM mientras el usuario escribe, aprovechando la capacidad del modelo para continuar secuencias de puertas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni metricas especificas de generacion de circuitos cuanticos (como tasa de validez sintactica o fidelidad de los circuitos generados). Se recomienda al usuario evaluar el modelo con sus propios casos de uso.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 124M, la cuantizacion Q4_K_M ocupa aproximadamente 0.2 GB en disco. En memoria, la inferencia puede realizarse con menos de 1 GB de RAM/VRAM, incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050) es suficiente. Tambien funciona bien en CPU moderna (Apple Silicon, Intel i5/i7).
- Cabe en GPU de consumo: si, en todas las GPUs de consumo actuales, incluso en integradas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o mediante la libreria transformers con el modelo base (safetensors) y cuantizacion via bitsandbytes. Tambien es compatible con endpoints de inferencia como FriendliAI (segun la busqueda web).
- Latencia y throughput: no se dispone de mediciones oficiales, pero por el tamano del modelo se espera una generacion de decenas de tokens por segundo en CPU y cientos en GPU.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificamente orientados a generacion de OpenQASM. Existen otros modelos de generacion de codigo (CodeGPT, CodeGen) pero no estan especializados en QASM. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente en ingles y en codigo OpenQASM 2.0; no es util para otros lenguajes de programacion ni para tareas generales de lenguaje.
- Puede generar circuitos sintacticamente validos pero semanticamente incorrectos o sin sentido fisico (por ejemplo, puertas aplicadas a qubits inexistentes). Es necesario validar la salida con un simulador.
- Al ser un modelo pequeno, su capacidad de razonamiento complejo es limitada; no debe usarse para disenar algoritmos cuanticos avanzados sin supervision humana.
- La cuantizacion GGUF puede degradar ligeramente la calidad de la generacion en comparacion con el modelo en punto flotante, especialmente en cuantizaciones agresivas como Q2_K.
- Licencia MIT: permite uso comercial y modificacion, pero el modelo no incluye garantias de exactitud ni soporte.
- No se han publicado estudios de sesgos o alucinaciones especificos para este modelo.

## Enlaces

- Modelo cuantizado GGUF: https://huggingface.co/mradermacher/quantumgpt-124m-v3-GGUF
- Modelo base (safetensors): https://huggingface.co/merileijona/quantumgpt-124m-v3
- Dataset de entrenamiento: https://huggingface.co/datasets/merileijona/quantum-circuits-21k
- Pagina de modelos de mradermacher: https://huggingface.co/mradermacher/models
- Endpoint de inferencia FriendliAI: https://friendli.ai/models/merileijona/quantumgpt-124m-v3
