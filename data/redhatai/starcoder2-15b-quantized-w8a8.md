# RedHatAI/starcoder2-15b-quantized.w8a8

## Resumen

El modelo `RedHatAI/starcoder2-15b-quantized.w8a8` es una versión cuantizada del modelo StarCoder2-15B, desarrollada por Neural Magic (ahora parte de Red Hat AI). La cuantización convierte tanto pesos como activaciones a INT8 mediante el algoritmo GPTQ, lo que reduce los requisitos de memoria GPU aproximadamente un 50% y duplica el rendimiento de las multiplicaciones de matrices, manteniendo una degradación mínima de precisión (recupera el 99,6% del rendimiento original en HumanEval).

El modelo base StarCoder2-15B fue entrenado por el proyecto BigCode sobre The Stack v2, un dataset con más de 600 lenguajes de programación y algo de texto natural (Wikipedia, Arxiv, GitHub issues). Esta versión cuantizada está pensada para despliegue eficiente en producción con vLLM, manteniendo compatibilidad con el ecosistema Transformers y formatos safetensors.

Su relevancia actual radica en que ofrece una alternativa de menor coste de inferencia para tareas de generación de código, sin necesidad de GPUs de gran capacidad, manteniendo una pérdida de calidad casi despreciable frente al modelo original de 15B parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StarCoder2 (transformer decoder-only) |
| Parametros totales | 15.957.889.024 (15,96B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 16.384 tokens (ventana de 16K, segun especificaciones del modelo base) |
| Tipos de cuantizacion | INT8 (W8A8, pesos y activaciones) |
| Idiomas soportados | 600+ lenguajes de programacion y algo de texto natural (ingles, entre otros) |
| Licencia | bigcode-openrail-m |
| Formato de pesos | safetensors (compatible con Transformers y vLLM) |

## Arquitectura y entrenamiento

El modelo base StarCoder2-15B es un transformer decoder con arquitectura similar a StarCoder1, con atención multi-cabeza y capas de pre-normalización. Fue entrenado sobre 4 billones de tokens de The Stack v2, con una ventana de contexto de 16.384 tokens. La versión cuantizada se obtiene aplicando GPTQ (algoritmo de cuantización post-entrenamiento) sobre los pesos y activaciones de las capas lineales de los bloques transformer, ignorando la capa final `lm_head`.

La cuantización usa un esquema simétrico estático por canal para los pesos (con un factor de escala fijo por dimensión de salida) y simétrico dinámico por token para las activaciones (calculando la escala en tiempo de ejecución para cada token). El proceso de calibración utilizó 256 secuencias de 8.192 tokens aleatorios. La cuantización reduce la precisión de 16 bits a 8 bits, logrando una recuperación de precisión del 99.6% en HumanEval respecto al modelo original.

## Capacidades

- Generación de código en más de 600 lenguajes de programación, incluyendo Python, JavaScript, Java, C++, TypeScript, Go, Rust y muchos más.
- Autocompletado de código, finalización de funciones y generación de bloques completos.
- Razonamiento sobre código: puede explicar qué hace un fragmento de código (aunque no es un modelo de instrucciones).
- Soporte de tool calling: al ser un modelo base de código, puede integrarse con herramientas de ejecución de código si se usa con el prompt adecuado.
- No es un modelo de instrucciones: los comandos como "Escribe una función que calcule la raíz cuadrada" no funcionan correctamente, según la documentación del modelo.
- Capacidades multilingües limitadas a código y texto técnico; el modelo no está diseñado para conversación general.

## Casos de uso

- Autocompletado de código en IDEs: se puede integrar en editores como VS Code o JetBrains para sugerir funciones y bloques de código completos, aprovechando su ventana de contexto de 16K tokens para analizar el contexto del archivo y el proyecto.
- Generación de código en pipelines de CI/CD: el modelo puede generar tests unitarios, scripts de build o documentación técnica a partir de especificaciones, gracias a su capacidad de generar código en múltiples lenguajes.
- Asistente de programación en entornos de desarrollo: aunque no es un modelo de instrucciones, puede usarse con prompts específicos para generar soluciones a problemas concretos, como "completa la siguiente función: def factorial(n):".
- Análisis y refactorización de código legacy: dado su entrenamiento en The Stack v2, puede ayudar a entender y transformar código antiguo en lenguajes como COBOL o Fortran, aunque con limitaciones.
- Generación de código para automatización de tareas: puede generar scripts de automatización (shell, Python) para tareas de administración de sistemas, dado su conocimiento de lenguajes de scripting.
- Despliegue en entornos de producción con vLLM: su cuantización W8A8 permite servir el modelo en GPUs de menor capacidad (por ejemplo, RTX 3090 o A10) con un throughput mayor que el modelo original, ideal para aplicaciones de código en tiempo real.

## Benchmarks y rendimiento

| Benchmark | starcoder2-15b (original) | starcoder2-15b-quantized.w8a8 (este modelo) | Recuperación |
|---|---|---|---|
| HumanEval pass@1 | 44.8 | 44.6 | 99.6% |
| HumanEval pass@10 | 62.7 | 63.3 | 100.9% |
| HumanEval+ pass@1 | no disponible | 38.1 | no disponible |

Los resultados se obtuvieron con la configuración de generación del Big Code Models Leaderboard, usando temperatura 0.2 y 50 muestras. La evaluación se realizó con el fork de evalplus de Neural Magic y el motor vLLM.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado a INT8 ocupa aproximadamente 8-9 GB en memoria GPU, frente a los 16-17 GB del modelo original. Con la ventana de contexto completa (16K tokens), se recomiendan al menos 12 GB de VRAM.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB), A10 (24 GB), A100 (40 GB o más), H100. En consumer GPU, una RTX 3080 de 10 GB podría funcionar con limitaciones de contexto.
- Despliegue: compatible con vLLM, Transformers, y Text Generation Inference (TGI). No se menciona compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: al estar cuantizado a W8A8, el throughput de multiplicación de matrices se duplica respecto al modelo FP16, aunque la latencia depende del hardware y del tamaño de batch. En una A100, se pueden esperar cientos de tokens por segundo para generación de código.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | HumanEval pass@1 | Licencia |
|---|---|---|---|---|---|
| starcoder2-15b (original) | 15,96B | 16K | FP16 | 44.8 | bigcode-openrail-m |
| starcoder2-15b-quantized.w8a8 (este modelo) | 15,96B | 16K | INT8 (W8A8) | 44.6 | bigcode-openrail-m |
| starcoder2-15b-quantized.w8a16 | 15,96B | 16K | INT8 (pesos) / FP16 (activaciones) | no disponible | bigcode-openrail-m |

La comparativa muestra que esta versión cuantizada es prácticamente indistinguible del original en precisión, pero con un coste de memoria mucho menor. La versión w8a16 (solo pesos cuantizados) es una alternativa intermedia que puede ser útil si se prefiere preservar la precisión de activaciones.

## Limitaciones y advertencias

- No es un modelo de instrucciones: no responde correctamente a comandos en lenguaje natural como "escribe una función que haga X". Está diseñado para completar código o generarlo a partir de código parcial.
- Sesgos del dataset: entrenado principalmente en código público, puede reflejar sesgos de los datos de origen, como código de baja calidad o comentarios sesgados.
- Riesgo de alucinación: aunque es un modelo de código, puede generar código incorrecto o con errores, especialmente en lenguajes menos representados.
- Licencia bigcode-openrail-m: permite uso comercial y de investigación, pero con restricciones específicas (no usar para actividades ilegales o que violen regulaciones de comercio). Revisar los términos de la licencia para usos concretos.
- Limitaciones de contexto: la ventana de 16K tokens es suficiente para la mayoría de archivos, pero puede no ser suficiente para proyectos muy grandes.
- No soporta vision ni audio: es un modelo exclusivamente de texto.
- La cuantización W8A8 puede degradar la precisión en tareas de razonamiento complejo, aunque el benchmark HumanEval muestra una recuperación casi completa.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/RedHatAI/starcoder2-15b-quantized.w8a8)
- [Modelo original starcoder2-15b](https://huggingface.co/bigcode/starcoder2-15b)
- [Variante w8a16](https://huggingface.co/RedHatAI/starcoder2-15b-quantized.w8a16)
- [Repositorio de StarCoder2 (BigCode)](https://github.com/bigcode-project/starcoder2)
- [Paper HumanEval](https://arxiv.org/abs/2107.03374)
- [Paper HumanEval+](https://arxiv.org/abs/2305.01210)
- [Paper GPTQ](https://arxiv.org/abs/2210.17323)
- [llm-compressor](https://github.com/vllm-project/llm-compressor)
- [Documentación de vLLM](https://docs.vllm.ai/en/latest/)
- [Big Code Models Leaderboard](https://huggingface.co/spaces/bigcode/bigcode-models-leaderboard)
