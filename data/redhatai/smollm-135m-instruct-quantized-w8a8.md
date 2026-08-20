# RedHatAI/SmolLM-135M-Instruct-quantized.w8a8

## Resumen

RedHatAI/SmolLM-135M-Instruct-quantized.w8a8 es una versión cuantizada del modelo SmolLM-135M-Instruct, desarrollada por Neural Magic y publicada bajo el sello de Red Hat AI. La cuantización convierte tanto los pesos como las activaciones a INT8 (esquema W8A8), lo que reduce el tamaño en disco y los requisitos de memoria de la GPU aproximadamente a la mitad en comparación con el modelo original en FP16. Esta optimización permite ejecutar el modelo en hardware más modesto, incluidas CPU y GPUs de baja gama, sin una pérdida significativa de precisión.

El modelo base, SmolLM-135M-Instruct, es un pequeño modelo de lenguaje entrenado por Hugging Face para tareas de conversación asistente en inglés. La versión cuantizada mantiene la misma arquitectura Llama y los 162 millones de parámetros totales, pero con una huella de memoria reducida. El resultado es un modelo ligero, adecuado para prototipado rápido, despliegue en entornos con restricciones de recursos o como punto de partida para tareas de generación de texto en inglés.

Su relevancia actual radica en la creciente demanda de modelos eficientes que puedan ejecutarse en dispositivos de borde, sistemas embebidos o infraestructuras con GPU limitadas. Al ser distribuido bajo licencia Apache-2.0, permite uso comercial y modificaciones sin restricciones, lo que lo convierte en una opción atractiva para equipos que necesitan una solución de generación de texto de bajo coste computacional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder) |
| Parametros totales | 162.826.560 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base SmolLM-135M-Instruct usa 2048 tokens) |
| Tipos de cuantizacion | INT8 (W8A8) |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only basado en la familia Llama, con 135 millones de parámetros (162.8 millones contando embeddings). El modelo original fue entrenado por Hugging Face mediante SFT (supervised fine-tuning) sobre conjuntos de datos de conversaciones, como el dataset `everyday-conversations-llama3.1-2k`. La versión cuantizada se obtuvo aplicando el algoritmo GPTQ, implementado en la librería `llm-compressor`, sobre los pesos y activaciones de los operadores lineales de los bloques transformer. La cuantización es simétrica estática por canal para los pesos y simétrica dinámica por token para las activaciones. El proceso usó 1.024 secuencias del dataset de calibración `neuralmagic/LLM_compression_calibration`, con un factor de amortiguación del 1%. No se ha aplicado ningún proceso de fine-tuning posterior a la cuantización.

## Capacidades

- Generacion de texto y respuestas conversacionales en ingles, similar al modelo base.
- Razonamiento basico y resolucion de tareas simples de lenguaje natural.
- Generacion de codigo limitada, heredada del modelo base, aunque no es su punto fuerte.
- Soporte de chat multi-turno con formato de plantilla de conversacion.
- Capacidad de ser afinado (fine-tuning) para tareas especificas, aunque no se documenta un proceso concreto.
- No se especifican capacidades de tool calling, vision, audio ni otros modos especiales.
- No es un modelo multilingue; su uso fuera del ingles esta fuera de los casos de uso previstos.

## Casos de uso

- Asistente conversacional en dispositivos de borde: el modelo puede ejecutarse en hardware con poca memoria (por ejemplo, Raspberry Pi o GPU de 2 GB) para proporcionar respuestas automaticas en ingles en aplicaciones de atencion al cliente o soporte tecnico.
- Prototipado rapido de aplicaciones NLP: su pequeño tamano y rapida carga permiten experimentar con arquitecturas de agentes conversacionales o sistemas de generacion de texto antes de escalar a modelos mayores.
- Clasificacion y extraccion de informacion en ingles: con un fine-tuning ligero, puede adaptarse para clasificacion de correos, analisis de sentimiento o extraccion de entidades en textos cortos.
- Generacion de respuestas en sistemas de preguntas y respuestas internos: en entornos empresariales con restricciones de presupuesto, sirve como base para un bot de respuestas frecuentes en ingles.
- Educacion e investigacion en eficiencia de modelos: su cuantizacion W8A8 es un ejemplo didactico para estudiar la perdida de precision y el ahorro de recursos en modelos transformer.
- Procesamiento por lotes en CPU: dado que cabe en memoria de CPU y puede ejecutarse con herramientas como llama.cpp, es util para tareas de generacion en segundo plano en entornos sin GPU.

## Benchmarks y rendimiento

Se han publicado resultados de la evaluacion en el benchmark OpenLLM (version 1), comparando el modelo cuantizado con el original sin cuantizar.

| Benchmark | SmolLM-135M-Instruct (original) | SmolLM-135M-Instruct-quantized.w8a8 (este modelo) | Recuperacion (%) |
|---|---|---|---|
| MMLU (5-shot) | 26.83 | 26.45 | 98.6 |
| ARC Challenge (25-shot) | 31.31 | 31.14 | 99.5 |
| GSM-8K (5-shot, strict-match) | 0.68 | 0.99 | 144.4 |
| HellaSwag (10-shot) | 40.57 | 40.54 | 99.9 |
| Promedio OpenLLM | 31.88 | 31.77 | 99.7 |

Los resultados muestran que la cuantizacion INT8 apenas degrada el rendimiento en la mayoria de tareas, e incluso mejora la puntuacion en GSM-8K. No se han publicado comparaciones con otros modelos de tamano similar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0.2 GB (los pesos en INT8 ocupan unos 163 MB). Cabe en cualquier GPU moderna con al menos 1 GB de VRAM y en CPU.
- GPUs recomendadas: cualquier GPU de consumo (NVIDIA GTX 1060, RTX 2060, etc.) o integradas con suficiente memoria. Tambien funciona en CPU sin aceleracion.
- Despliegue: compatible con vLLM (recomendado), llama.cpp, Ollama y Transformers con carga en INT8.
- Latencia: muy baja, en el orden de milisegundos por token en GPU y de decenas de milisegundos en CPU.
- Throughput: en vLLM con una GPU modesta se pueden procesar multiples peticiones simultaneas sin problemas, dado el tamano reducido.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Rendimiento promedio OpenLLM | Licencia |
|---|---|---|---|---|---|
| SmolLM-135M-Instruct (original) | 162.8M | FP16 | 2048 (estimado) | 31.88 | Apache-2.0 |
| RedHatAI/SmolLM-135M-Instruct-quantized.w8a8 | 162.8M | INT8 (W8A8) | no disponible | 31.77 | Apache-2.0 |
| RedHatAI/SmolLM-135M-Instruct-quantized.w8a16 | 162.8M | INT8 (W8A16) | no disponible | no disponible | Apache-2.0 |

No se han encontrado datos de benchmarks para la version w8a16 ni para otros modelos comparables de tamano similar. La comparativa se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- Tamaño reducido: con 135M de parametros, el modelo tiene capacidades limitadas de razonamiento y generacion de texto de calidad media. No es adecuado para tareas complejas como razonamiento logico avanzado o generacion de codigo sofisticado.
- Alucinaciones: al ser un modelo pequeno, es propenso a generar informacion falsa o no fiable, especialmente en temas especializados.
- Idioma: solo soporta ingles. Su uso en otros idiomas esta fuera del alcance y produce resultados degradados.
- Contexto limitado: la longitud de contexto no esta documentada en la model card; si se hereda del modelo base, es de 2048 tokens, lo que limita conversaciones largas.
- Sesgos: el modelo puede heredar sesgos de los datos de entrenamiento del modelo base, especialmente en temas sociales y de genero.
- Licencia: Apache-2.0 permite uso comercial, pero no se garantiza la ausencia de sesgos o la calidad del output.
- Produccion: no se recomienda su uso en produccion sin una evaluacion rigurosa en el dominio de aplicacion, dado su tamano y la falta de capacidades avanzadas.

## Enlaces

- HuggingFace: https://huggingface.co/RedHatAI/SmolLM-135M-Instruct-quantized.w8a8
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM-135M-Instruct
- Paper GPTQ: https://arxiv.org/abs/2210.17323
- Libreria llm-compressor: https://github.com/vllm-project/llm-compressor
- Dataset de calibracion: https://huggingface.co/datasets/neuralmagic/LLM_compression_calibration
- OpenLLM leaderboard: https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard
- vLLM: https://docs.vllm.ai/en/latest/
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
