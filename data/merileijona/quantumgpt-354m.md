# merileijona/quantumgpt-354m

## Resumen

QuantumGPT-354M es un modelo de lenguaje de estilo GPT-2 entrenado desde cero por el autor independiente merileijona para una tarea muy concreta: traducir descripciones en lenguaje natural de circuitos cuanticos a codigo OpenQASM 2.0. Con 354,1 millones de parametros, es el tercer miembro de la serie de escalado QuantumGPT, en la que el autor aumenta profundidad y anchura del modelo manteniendo fijo el conjunto de datos de entrenamiento (21.208 muestras, aproximadamente 1,75 millones de tokens). El modelo se distribuye bajo licencia MIT y solo declara soporte para ingles.

Su interes no reside tanto en el rendimiento absoluto como en el experimento de escalado que documenta: el autor concluye que, en este regimen de datos, aumentar los parametros 2,9 veces no mejora al modelo hermano QuantumGPT-124M-v2, que supera a este en todas las metricas principales. La limitacion dominante es la cobertura de datos, no la capacidad del modelo, con una relacion de aproximadamente 4,9 tokens por parametro, muy por debajo de la optima de Chinchilla (unas 20).

La propia model card incluye una actualizacion de evidencia que rebaja considerablemente las cifras originales: en una suite de desarrollo compacta de 384 problemas, el checkpoint devolvio 193/384 respuestas sintacticamente validas, 0/384 con la estructura solicitada y 0/384 completamente correctas, y fallo las 257 tareas del panel con respuestas de referencia verificadas. Es, por tanto, un modelo de investigacion y de nicho, no una herramienta lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 |
| Parametros totales | 354.347.008 (354,1M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 1,4 GB) |

Otros datos de arquitectura y entrenamiento declarados por el autor: 24 capas, 16 cabezas de atencion, dimension de embedding 1024, dropout 0,1 durante el entrenamiento, funcion de activacion GELU y gradient checkpointing. El tokenizador y los delimitadores de prompt (`<|user|>`, `<|assistant|>`, `<|end|>`) son texto literal, no tokens especiales del tokenizador.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only convencional de estilo GPT-2, sin mecanismos de atencion lineal, mezcla de expertos ni decodificacion especulativa. El entrenamiento se realizo desde cero sobre el dataset quantum-circuits-21k (21.208 pares descripcion → OpenQASM 2.0, unos 1,75 millones de tokens), con 3.000 iteraciones maximas, learning rate de 2×10⁻⁴ con decaimiento coseno, 32.768 tokens efectivos por paso y un total de aproximadamente 98,3 millones de tokens vistos (unas 38 epocas). Todo el entrenamiento se ejecuto en una unica NVIDIA RTX 4070 de 12 GB, con un pico de memoria de 8,03 GB.

El mejor checkpoint se selecciono en el paso 1.100, con una perdida de validacion de 0,2677 (frente a 0,3761 en el paso 2.999). El autor documenta sobreajuste severo a partir del paso 1.400, con una brecha train/val superior a 0,15 que llega a +0,34 al final, y califica el modelo como severamente infraentrenado respecto a su numero de parametros. No se menciona RLHF, DPO ni ninguna fase de alineacion posterior; el ajuste es puramente de modelado de lenguaje supervisado sobre el formato de prompt indicado.

## Capacidades

- Generacion de codigo OpenQASM 2.0 a partir de descripciones en lenguaje natural de circuitos cuanticos.
- Generacion de texto autoregresiva estandar (hereda la base GPT-2), limitada al dominio de circuitos cuanticos.
- Seguimiento de un formato de prompt especifico con delimitadores de texto literal (`<|user|>`, `<|assistant|>`, `<|end|>`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Prototipado de circuitos cuanticos en entornos docentes: el modelo puede generar esqueletos de OpenQASM 2.0 a partir de una descripcion como "crea un estado de Bell con dos qubits", utiles como punto de partida que el estudiante corrige y ejecuta en un simulador.
- Generacion de borradores en pipelines de investigacion sobre sintesis de circuitos: sirve como linea base reproducible (checkpoint fijado, licencia MIT) para comparar tecnicas de generacion de codigo cuantico.
- Estudio del regimen data-constrained: el modelo y su model card documentan explicitamente el fallo de escalado con datos fijos, lo que lo hace adecuado como caso de analisis en trabajos sobre leyes de escalado.
- Aumento de datos sinteticos con supervision humana: dado que aproximadamente el 92% de las salidas son sintacticamente validas en pass@1, puede usarse para proponer candidatos QASM que un revisor filtre antes de incorporarlos a un dataset.
- Integracion en herramientas de autocompletado para QASM: con contexto de 512 tokens, puede sugerir fragmentos de circuito dentro de un editor, siempre con validacion sintactica y semantica posterior.
- Experimentacion local en hardware de consumo: al caber en una GPU de 12 GB en entrenamiento y ser mucho mas ligero en inferencia, permite reproducir el flujo completo de entrenamiento y evaluacion en una sola maquina.

## Benchmarks y rendimiento

Resultados declarados en la model card sobre QuantumGPT Benchmark v1.0 (100 prompts, 50 ID / 50 OOD, 3 niveles de dificultad, k=5 muestras, semilla 42):

| Modelo | Parametros | Datos | pass@1 sintaxis | pass@5 sintaxis | pass@1 semantico | pass@5 semantico | Perdida val. |
|---|---|---|---|---|---|---|---|
| QuantumGPT-124M-v1 | 123,8M | 8K | 68,2% | 89,0% | 13,8% | 30,0% | 0,2691 |
| QuantumGPT-124M-v2 | 123,8M | 21K | 97,2% | 100,0% | 23,6% | 41,0% | 0,2502 |
| QuantumGPT-354M (este modelo) | 354,1M | 21K | 92,2% | 99,0% | 24,0% | 40,0% | 0,2677 |

Desglose de modos de fallo sobre 500 muestras: PASS 120 (24,0%), WRONG_QUBITS 156 (31,2%), TRIVIAL 94 (18,8%), SEPARABLE 84 (16,8%), SYNTAX_ERROR 39 (7,8%), SIM_ERROR 7 (1,4%).

La actualizacion de evidencia de la propia model card matiza estas cifras: en la suite compacta de desarrollo (384 problemas sinteticos, una respuesta greedy por tarea, contexto nativo de 512), el checkpoint obtuvo 193/384 respuestas sintacticamente validas, 0/384 con la estructura solicitada y 0/384 completamente correctas, y 0/257 en el panel fijo con respuestas de referencia verificadas. El autor senala que los protocolos de 100 y 120 casos miden resultados distintos y que los evaluadores ejecutables originales no estaban disponibles en la evidencia inspeccionada. El manifiesto del benchmark tiene SHA-256 `320535d4ff74d9f07db024c1e86c0e8208a8fd93c294f47332cb9c38fadf9243`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 354M parametros, en fp32 ocupa aproximadamente 1,4 GB de pesos, en fp16 unos 0,7 GB y en cuantizacion de 8 bits unos 0,35 GB, a lo que hay que sumar la cache KV para 512 tokens.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el autor entreno en una RTX 4070 de 12 GB con un pico de 8,03 GB, por lo que la inferencia cabe holgadamente en GPUs de gama media e incluso en CPU.
- Cabe en GPU consumer: si, incluidas tarjetas con 6-8 GB de VRAM y, con cuantizacion, en equipos de menor capacidad.
- Opciones de despliegue: transformers (codigo de ejemplo en la model card), text-generation-inference (etiqueta declarada) y, previsiblemente, llama.cpp u Ollama si se generan pesos GGUF, aunque no hay cuantizaciones publicadas en el repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | pass@1 semantico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QuantumGPT-354M | 354,1M | 512 | 24,0% | MIT | Hugging Face |
| QuantumGPT-124M-v2 | 123,8M | no disponible | 23,6% | MIT (serie QuantumGPT) | Hugging Face |
| QuantumGPT-124M-v1 | 123,8M | no disponible | 13,8% | MIT (serie QuantumGPT) | Hugging Face |
| QuantumGPT-354M-finetuned | 354,1M | 512 | no disponible (96,45 en QSS-Core dev segun la card del 354M) | MIT (serie QuantumGPT) | Hugging Face |

La comparacion relevante dentro de la propia serie es clara: QuantumGPT-124M-v2 supera a este modelo en pass@1 y pass@5 de sintaxis y en perdida de validacion, y practicamente empata en semantica, con menos de la mitad de parametros. No se dispone de comparaciones con modelos de codigo generalistas (por ejemplo, variantes pequenas de CodeGen o StarCoder) en la informacion proporcionada.

## Limitaciones y advertencias

- Sobreajuste severo por restriccion de datos: relacion de aproximadamente 4,9 tokens por parametro frente a los ~20 de Chinchilla; el mejor checkpoint es el paso 1.100 de 3.000.
- WRONG_QUBITS es el modo de fallo dominante (31,2% de las muestras): el modelo genera circuitos con un numero de qubits incorrecto incluso cuando el prompt lo especifica.
- Brecha de correccion semantica de aproximadamente 59 puntos porcentuales respecto a la validez sintactica, segun la model card.
- En la suite de desarrollo compacta, 0/384 respuestas cumplieron la estructura solicitada y 0/384 fueron completamente correctas; no debe usarse sin validacion posterior.
- Solo soporta ingles y un contexto de 512 tokens, insuficiente para descripciones largas o circuitos extensos.
- Riesgo de alucinacion alto en el dominio: puertas y estructuras plausibles sintacticamente pero semanticamente incorrectas.
- Licencia MIT permite uso comercial, pero el rendimiento medido no respalda su uso en produccion sin supervision humana.
- Los resultados de benchmark originales no son reproducibles con la evidencia disponible (evaluadores ejecutables no accesibles), por lo que deben tratarse con cautela.
- Sesgos conocidos: no documentados de forma especifica; el entrenamiento se limita a un corpus sintetico de circuitos cuanticos en ingles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/merileijona/quantumgpt-354m
- Version fine-tuned: https://huggingface.co/merileijona/quantumgpt-354m-finetuned
- Modelo hermano QuantumGPT-124M-v2: https://huggingface.co/merileijona/quantumgpt-124m-v2
- Modelo hermano QuantumGPT-124M-v1: https://huggingface.co/merileijona/quantumgpt-124m
- Checkpoint fijado de la model card original: https://huggingface.co/merileijona/quantumgpt-354m/blob/187ae8c75ee29276e1309887c885a770ebefd352/README.md
- Dataset de entrenamiento: https://huggingface.co/datasets/merileijona/quantum-circuits-21k
- Configuracion de evaluacion y panel completo: https://huggingface.co/merileijona/quantumgpt-354m/blob/main/quantumgpt-354m.json
