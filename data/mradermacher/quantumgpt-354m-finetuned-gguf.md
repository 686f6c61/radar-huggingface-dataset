# mradermacher/quantumgpt-354m-finetuned-GGUF

## Resumen

El modelo `mradermacher/quantumgpt-354m-finetuned-GGUF` es una cuantización en formato GGUF del modelo `merileijona/quantumgpt-354m-finetuned`, un modelo de 354 millones de parámetros basado en la arquitectura GPT-2 medium (24 capas, 16 cabezas de atención y 1024 dimensiones de embedding, según la ficha de FriendliAI). El modelo original fue fine-tuneado sobre el dataset `merileijona/quantum-circuits-21k` para la generación de código cuántico en formato QASM y OpenQASM, lo que lo convierte en una herramienta especializada para desarrolladores e investigadores que trabajan con circuitos cuánticos.

La versión GGUF, publicada por mradermacher, ofrece doce niveles de cuantización que van desde Q2_K (0,3 GB) hasta f16 (0,8 GB), permitiendo ejecutar el modelo en hardware modesto, incluidas CPU y GPU de consumo. Su licencia MIT facilita su uso comercial y su integración en pipelines de desarrollo. Aunque el modelo es pequeño en comparación con los LLM actuales, su especialización en un dominio técnico concreto lo hace relevante para tareas de generación y asistencia en programación cuántica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 medium (24 capas, 16 cabezas, 1024 embedding) |
| Parametros totales | 354.347.008 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, IQ4_XS, Q4_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (el modelo base usa safetensors) |

## Arquitectura y entrenamiento

El modelo base `quantumgpt-354m-finetuned` se construye sobre la arquitectura GPT-2 medium, un transformer decoder-only con 24 capas, 16 cabezas de atención y 1024 dimensiones de embedding. El fine-tuning se realizó sobre el dataset `merileijona/quantum-circuits-21k`, que contiene circuitos cuánticos en formato QASM/OpenQASM, con el objetivo de adaptar el modelo a la generación de código cuántico. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas como RLHF o DPO. La versión GGUF es una cuantización estática realizada por mradermacher, sin uso de imatrix ni pesos ponderados, según indica la model card.

## Capacidades

- Generacion de codigo QASM y OpenQASM para circuitos cuanticos, incluyendo compuertas y operaciones tipicas.
- Generacion de texto en ingles, heredada de la base GPT-2, aunque su especializacion reduce su utilidad fuera del dominio cuantico.
- Asistencia en la descripcion de circuitos cuanticos a partir de instrucciones en lenguaje natural (si el fine-tuning lo ha incorporado, aunque no se especifica).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.

## Casos de uso

- Generacion de circuitos cuanticos en QASM: el modelo puede producir fragmentos de codigo OpenQASM a partir de descripciones textuales, acelerando el prototipado en entornos como Qiskit o Cirq.
- Asistencia en educacion cuantica: estudiantes e investigadores pueden usarlo para generar ejemplos de circuitos y comparar con implementaciones de referencia.
- Automatizacion de tareas repetitivas en diseno de circuitos: por ejemplo, generar plantillas de circuitos para compuertas comunes (Hadamard, CNOT, etc.) en proyectos de investigacion.
- Integracion en entornos de desarrollo integrado (IDE) para programacion cuantica: como autocompletado o sugerencia de codigo QASM en editores como VS Code.
- Prototipado rapido de algoritmos cuanticos: el modelo puede ayudar a esbozar circuitos para algoritmos como Grover o Shor, aunque requiere validacion posterior.
- Generacion de documentacion tecnica: a partir de un circuito dado, el modelo podria generar comentarios o descripciones en ingles, si el fine-tuning lo soporta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo.

## Requisitos de hardware

- Tamano de los archivos GGUF: desde 0,3 GB (Q2_K) hasta 0,8 GB (f16). La cuantizacion Q4_K_M ocupa 0,3 GB y es recomendada por el autor por su equilibrio entre velocidad y calidad.
- VRAM estimada: con cuantizaciones de 0,3-0,4 GB, el modelo cabe en cualquier GPU moderna con al menos 2 GB de VRAM, incluidas tarjetas de consumo como GTX 1650, RTX 3060 o superiores.
- Tambien puede ejecutarse en CPU pura mediante llama.cpp, con latencias aceptables para un modelo de 354M de parametros.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o servidores de inferencia compatibles con GGUF como llama-cpp-python o text-generation-webui.
- Throughput estimado: no disponible, pero al ser un modelo pequeno, se espera una generacion rapida incluso en CPU.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en el dominio de generacion de codigo cuantico con el mismo tamano y licencia. El modelo base `quantumgpt-124M-v3` (mencionado en FriendliAI como hermano menor) podria ser una alternativa, pero no se tienen datos de rendimiento ni de cuantizaciones GGUF publicas. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Modelo de solo 354M de parametros: su capacidad de razonamiento y generalizacion es limitada en comparacion con modelos de mayor tamano.
- Especializacion estrecha: entrenado principalmente en QASM, puede producir codigo incorrecto o sintacticamente invalido si se le piden tareas fuera de ese dominio.
- Riesgo de alucinacion: como cualquier modelo generativo, puede inventar compuertas o sintaxis que no existen en OpenQASM.
- Solo soporta ingles: no se ha entrenado para otros idiomas.
- Longitud de contexto no documentada: se desconoce el numero maximo de tokens que puede procesar, lo que limita su uso en circuitos muy largos.
- La cuantizacion estatica puede degradar ligeramente la calidad respecto al modelo en punto flotante, aunque el autor indica que Q8_0 y f16 ofrecen la mejor fidelidad.
- No se han publicado evaluaciones de sesgos ni de seguridad; se recomienda validar cualquier salida antes de usarla en entornos de produccion.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/quantumgpt-354m-finetuned-GGUF
- Modelo base: https://huggingface.co/merileijona/quantumgpt-354m-finetuned
- Dataset de entrenamiento: https://huggingface.co/datasets/merileijona/quantum-circuits-21k
- Ficha de FriendliAI con detalles de arquitectura: https://friendli.ai/models/merileijona/quantumgpt-354m-finetuned
- Paper relacionado (no confirmado como fuente del modelo): https://ar5iv.labs.arxiv.org/html/2403.09418
