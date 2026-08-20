# RedHatAI/starcoder2-3b-quantized.w8a8

## Resumen

RedHatAI/starcoder2-3b-quantized.w8a8 es una versión cuantizada del modelo StarCoder2-3B de BigCode, desarrollada por Neural Magic en colaboración con Red Hat AI. El modelo original es un modelo de generación de código de 3.000 millones de parámetros entrenado sobre The Stack v2, un dataset que abarca más de 600 lenguajes de programación. Esta variante aplica cuantización W8A8 (pesos y activaciones en INT8) mediante el algoritmo GPTQ, lo que reduce los requisitos de memoria GPU en aproximadamente un 50% y duplica el rendimiento de cómputo de multiplicación de matrices.

La relevancia de este modelo radica en su despliegue eficiente en entornos de producción: al mantener una precisión prácticamente idéntica al modelo original (de hecho, mejora ligeramente el pass@1 en HumanEval, pasando de 30.7 a 31.4), permite ejecutar inferencia de código con un coste de hardware significativamente menor. Está pensado exclusivamente para generación de código y no es un modelo de instrucciones, por lo que requiere completar prompts de código directamente en lugar de recibir órdenes en lenguaje natural. Su ventana de contexto es de 16.384 tokens, con atención deslizante de 4.096 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StarCoder2 (transformer decoder-only con Grouped Query Attention y sliding window attention) |
| Parametros totales | 3.181.366.272 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 16.384 tokens (sliding window de 4.096) |
| Tipos de cuantizacion | W8A8 (INT8 para pesos y activaciones) |
| Idiomas soportados | Codigo en 600+ lenguajes de programacion; texto natural limitado (Wikipedia, Arxiv, issues de GitHub) |
| Licencia | BigCode OpenRAIL-M |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base StarCoder2-3B es un transformer causal con Grouped Query Attention y sliding window attention de 4.096 tokens, entrenado sobre The Stack v2 (dataset de código con licencias permisivas) junto con texto natural de Wikipedia, Arxiv y GitHub issues. El modelo original no ha pasado por un proceso de RLHF ni DPO; es un modelo de autocompletado de código, no de instrucciones.

La cuantización W8A8 se aplicó con el algoritmo GPTQ implementado en la librería llm-compressor de vLLM. Solo se cuantizan los operadores lineales dentro de los bloques transformer, ignorando la capa lm_head. Los pesos se cuantizan con un esquema simétrico estático por canal (una escala lineal fija por dimensión de salida), mientras que las activaciones se cuantizan con un esquema simétrico dinámico por token (la escala se calcula en tiempo de ejecución para cada token). El proceso de calibración usó 256 secuencias de 8.192 tokens aleatorios con un factor de damping del 1%.

## Capacidades

- Generación de código en más de 600 lenguajes de programación, desde Python, Java y JavaScript hasta lenguajes más nicho como COBOL o Solidity.
- Autocompletado de funciones, clases y bloques de código a partir de un prefijo o contexto parcial.
- Soporte para completar código de múltiples archivos si se proporciona un contexto suficiente dentro de la ventana de 16.000 tokens.
- No es un modelo de instrucciones: no responde a comandos en lenguaje natural como "escribe una función que calcule la raíz cuadrada".
- No soporta tool calling ni function calling de forma nativa.
- No tiene capacidades multimodales (ni visión ni audio).
- Capacidad multilingüe limitada al código; el texto natural que maneja es principalmente el que aparece en comentarios y documentación dentro del código fuente.

## Casos de uso

- **Autocompletado de código en editores y IDEs**: el modelo puede integrarse en extensiones de VS Code o JetBrains para sugerir completaciones de código en tiempo real. Su tamaño reducido permite ejecutarlo en estaciones de trabajo con GPU consumer, y la cuantización W8A8 reduce la latencia de generación.
- **Generación de código en pipelines de CI/CD**: se puede desplegar como un servicio de generación de código mediante vLLM con API compatible con OpenAI, para generar tests unitarios o código de ejemplo en entornos de integración continua.
- **Asistente de programación para entornos con recursos limitados**: gracias a la cuantización, cabe en GPUs con 8 GB de VRAM (por ejemplo, RTX 4070), lo que permite desplegar un asistente de código en infraestructura modesta.
- **Completado de código en entornos de desarrollo remotos**: al ser un modelo de 3B cuantizado, puede servir a múltiples usuarios concurrentes con un throughput razonable usando vLLM con continuous batching, ideal para equipos de desarrollo que comparten un servidor de inferencia.
- **Análisis y refactorización de código legacy**: el modelo puede completar o sugerir fragmentos de código en lenguajes antiguos o menos comunes, gracias a su entrenamiento sobre 600+ lenguajes, lo que facilita la modernización de código heredado.
- **Generación de código para documentación técnica**: se puede usar para generar ejemplos de código que acompañen a documentación técnica, alimentando el modelo con un contexto que incluya la firma de la función y su propósito, aunque no es un modelo de instrucciones.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (Neural AI) en la model card:

| Benchmark | starcoder2-3b (original) | starcoder2-3b-quantized.w8a8 (este modelo) | Recuperacion |
|---|---|---|---|
| HumanEval pass@1 | 30.7 | 31.4 | 102.3% |
| HumanEval pass@10 | 44.9 | 44.7 | 99.6% |
| HumanEval+ pass@1 | no disponible | 26.8 | no disponible |

La cuantización no solo mantiene el rendimiento, sino que en HumanEval pass@1 obtiene una recuperación del 102.3%, es decir, un resultado ligeramente superior al modelo original bajo las mismas condiciones de evaluación. La evaluación se realizó con el benchmark de la configuración del Big Code Models Leaderboard, usando el fork de evalplus de Neural Magic y el motor vLLM, con temperatura 0.2 y 50 muestras por problema.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con pesos en INT8 y 3.181 millones de parámetros, los pesos ocupan aproximadamente 3,2 GB. Con activaciones y memoria intermedia, se estima un requisito de VRAM de 4-5 GB para inferencia con batch pequeño.
- **GPU recomendadas**: cabe en GPUs consumer de 8 GB como la RTX 4070, RTX 3060 o RTX 4060 Ti. Para producción con batch grande, se recomienda una GPU de datacenter como A100 o L4.
- **GPU consumer**: sí, se puede ejecutar en tarjetas de 8 GB de VRAM con cuantización W8A8, algo que no sería posible con el modelo original en FP16 (que requeriría unos 6 GB solo de pesos).
- **Opciones de despliegue**: vLLM (soporte nativo, incluye API compatible con OpenAI), TGI (Text Generation Inference), llama.cpp, Ollama. El modelo usa el formato safetensors estándar de transformers.
- **Latencia y throughput estimados**: la cuantización W8A8 duplica aproximadamente el throughput de multiplicación de matrices respecto al modelo FP16. En una A100, se pueden esperar decenas de tokens por segundo por request, y con continuous batching se puede servir a múltiples usuarios simultáneamente. No se dispone de cifras exactas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | HumanEval pass@1 | Licencia |
|---|---|---|---|---|---|
| starcoder2-3b (original) | 3.028 M | 16.384 | FP16 | 30.7 | BigCodeOpenRAIL-M |
| starcoder2-3b-quantized.w8a8 (este modelo) | 3.181 M | 16.384 | W8A8 INT8 | 31.4 | BigCodeOpenRAIL-M |
| starcoder2-3b-quantized.w8a16 | 3.181 M | 16.384 | W8A16 (pesos INT8, activaciones FP16) | 31.0 | BigCodeOpenRAIL-M |

Los tres modelos comparten arquitectura y licencia. La diferencia principal está en el esquema de cuantización: la variante w8a8 cuantiza tanto pesos como activaciones a INT8, mientras que la w8a16 solo cuantiza los pesos, lo que requiere más memoria pero puede ser más estable en algunos casos de uso. Ambas variantes cuantizadas superan el rendimiento del original en HumanEval pass@1.

No se dispone de comparativa con otros modelos de código de 3B como CodeLlama-3B o DeepSeek-Coder-1.3B en los datos proporcionados.

## Limitaciones y advertencias

- **No es un modelo de instrucciones**: no responde a comandos en lenguaje natural. Es exclusivamente un modelo de autocompletado de código, y su uso para chat o generación guiada por instrucciones dará resultados pobres.
- **Sesgos conocidos**: al entrenarse sobre código de GitHub, puede reproducir patrones de código con malas prácticas, código no seguro o vulnerabilidades presentes en el dataset de entrenamiento.
- **Riesgo de alucinación**: como cualquier modelo de autocompletado, puede generar código sintácticamente válido pero semánticamente incorrecto, o sugerir APIs inexistentes.
- **Licencia BigCodeOpenRAIL-M**: permite uso comercial y de investigación, pero requiere que los usuarios cumplan con las restricciones de uso responsable (no generar código malicioso, no usarlo para violar leyes). No hay obligación de compartir los pesos.
- **Contexto limitado a 16.000 tokens**: aunque es razonable para código, proyectos muy grandes que excedan esta ventana no pueden procesarse de una sola vez.
- **El modelo es de 2024**: los lenguajes y librerías más recientes pueden no estar bien representados en el dataset de entrenamiento.
- **La cuantización W8A8 puede degradar ligeramente la calidad en tareas de precisión alta** (aunque en este caso la recuperación es del 99.6% en HumanEval pass@10), por lo que en aplicaciones críticas se recomienda validar el comportamiento en el dominio específico.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/RedHatAI/starcoder2-3b-quantized.w8a8)
- [Modelo original starcoder2-3b](https://huggingface.co/bigcode/starcoder2-3b)
- [Repositorio de StarCoder2 en GitHub](https://github.com/bigcode-project/starcoder2)
- [Paper GPTQ](https://arxiv.org/abs/2210.17323)
- [Paper HumanEval](https://arxiv.org/abs/2107.03374)
- [Paper HumanEval+](https://arxiv.org/abs/2305.01210)
- [Librería llm-compressor](https://github.com/vllm-project/llm-compressor)
- [Documentación de vLLM](https://docs.vllm.ai/en/latest/)
- [Variante w8a16](https://huggingface.co/RedHatAI/starcoder2-3b-quantized.w8a16)
