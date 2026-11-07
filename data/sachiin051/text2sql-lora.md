# sachiin051/Text2SQL-LoRA

## Resumen
Text2SQL-LoRA es un adaptador PEFT de tipo LoRA publicado por el usuario sachiin051 que especializa el modelo base Qwen/Qwen2.5-Coder-1.5B en la generacion de consultas SQL a partir de lenguaje natural. No se trata de un modelo completo, sino de un conjunto de pesos de bajo rango (rango 16, alpha 32, dropout 0.05) que deben cargarse sobre el checkpoint original de Qwen2.5-Coder-1.5B mediante la libreria PEFT. El repositorio ocupa aproximadamente 0,1 GB, lo que confirma que solo contiene el adaptador y no los pesos completos del modelo.

El modelo aborda una tarea concreta y muy demandada en el ambito de datos: traducir preguntas en lenguaje natural a sentencias SQL ejecutables. Al partir de Qwen2.5-Coder-1.5B, hereda la arquitectura transformer decoder-only y el preentrenamiento orientado a codigo del modelo Qwen, pero el autor no documenta ni el dataset de entrenamiento ni los resultados de evaluacion, por lo que su rendimiento real no esta cuantificado.

Su relevancia actual es limitada pero practica: sirve como ejemplo reproducible de ajuste fino parametro-eficiente para Text-to-SQL con un modelo pequeno (1.500 millones de parametros) que puede ejecutarse en hardware de consumo. No obstante, la ausencia de model card detallada, metricas y licencia explicita obliga a tratarlo como un experimento de investigacion mas que como un componente listo para produccion.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-1.5B) con adaptador LoRA (PEFT) |
| Parametros totales | 1.500 millones (modelo base); tamano del adaptador no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base, sin confirmar) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base Qwen/Qwen2.5-Coder-1.5B |

## Arquitectura y entrenamiento
El adaptador se aplica sobre Qwen2.5-Coder-1.5B, un transformer decoder-only de tipo causal language modeling. El ajuste fino emplea LoRA con rango 16, alpha 32 y dropout 0.05, lo que implica que solo se entrenan las matrices de bajo rango inyectadas en las capas del modelo base, manteniendo congelados los pesos originales. El autor declara la tarea como causal language modeling y el pipeline como text-to-sql, pero no especifica en que capas se insertan los adaptadores ni el numero exacto de parametros entrenables.

No se documenta el dataset de entrenamiento: la model card indica que los detalles "se documentaran aqui" y que las metricas de evaluacion "se anadiran tras la validacion". Tampoco se indica el numero de tokens de entrenamiento, la composicion del corpus, si hubo instrucciones tipo SFT, RLHF o DPO, ni la longitud de contexto utilizada durante el ajuste. El repositorio de GitHub asociado menciona un cuaderno con secciones separadas, incluida una seccion de QLoRA sobre un modelo de 7B, pero no aporta informacion verificable sobre los datos del adaptador de 1.5B.

## Capacidades
- Generacion de consultas SQL a partir de preguntas en lenguaje natural (tarea principal declarada).
- Generacion de texto y codigo heredada del modelo base Qwen2.5-Coder-1.5B.
- Razonamiento basico sobre esquemas de bases de datos, limitado por el tamano del modelo y por la falta de datos de evaluacion.
- Soporte de tool calling / function calling: no documentado para este adaptador; el modelo base Qwen2.5-Coder si lo soporta, pero no hay confirmacion de que el ajuste LoRA lo preserve.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; los idiomas soportados figuran como no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso
- Prototipado de asistentes de consulta sobre bases de datos: el adaptador permite convertir preguntas de usuarios en SQL para probar rapidamente interfaces de analitica conversacional, cargando el modelo base en una GPU de consumo.
- Generacion de consultas en entornos educativos: util para ensenar SQL mostrando como un modelo pequeno traduce enunciados a sentencias, con la ventaja de que el adaptador es ligero y facil de inspeccionar.
- Experimentacion con PEFT y LoRA: sirve como plantilla para reproducir un flujo de ajuste fino parametro-eficiente sobre Qwen2.5-Coder-1.5B y comparar hiperparametros (rango, alpha, dropout).
- Generacion de borradores de SQL para revision humana: el modelo puede proponer consultas que un analista valida y corrige antes de ejecutarlas, reduciendo el tiempo de escritura manual en tareas repetitivas.
- Integracion en cuadernos de analisis de datos: al ejecutarse en Google Colab o entornos con una sola GPU, permite generar SQL dentro de flujos exploratorios sin infraestructura dedicada.
- Pruebas de concepto de pipelines Text-to-SQL: util para evaluar la viabilidad de un enfoque basado en modelos de 1.5B antes de invertir en modelos mayores como Qwen2.5-Coder-7B, tal como sugiere el repositorio de GitHub asociado.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las metricas de evaluacion se anadiran tras la validacion, y no se han encontrado cifras de MMLU, HumanEval, GSM8K ni de ejecucion exacta de SQL (execution accuracy) para este adaptador.

## Requisitos de hardware
- VRAM estimada para inferencia: el modelo base de 1.5B en precision FP16 requiere aproximadamente 3 GB de VRAM; en cuantizacion de 8 bits, alrededor de 1,5-2 GB; en 4 bits, en torno a 1 GB. El adaptador LoRA anade una cantidad marginal de memoria.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16, como RTX 3050, RTX 4060, RTX 4090, A100 o H100. Para cuantizacion en 4 bits basta con GPUs de 2 GB o incluso CPU.
- Cabe en GPU de consumo: si, en practicamente todas las GPU consumer modernas (RTX 3060, RTX 4060, RTX 4090) e incluso en iGPU con cuantizacion agresiva.
- Opciones de despliegue: transformers + peft (flujo documentado por el autor), vLLM y TGI requieren fusionar el adaptador con el modelo base o cargarlo como adaptador compatible; llama.cpp y Ollama requieren convertir el modelo fusionado a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sachiin051/Text2SQL-LoRA | 1.500 M (base) + adaptador LoRA | no disponible | LoRA sobre Qwen2.5-Coder-1.5B | no disponible | Hugging Face (0 descargas) |
| genies-llm/text2sql-sft-v5-lora | 7.000 M (base Qwen2.5-Coder-7B-Instruct) | no disponible | SFT con TRL sobre Qwen2.5-Coder-7B-Instruct | no disponible | Hugging Face |
| Qwen/Qwen2.5-Coder-1.5B (base) | 1.500 M | no disponible en la informacion proporcionada | Modelo completo preentrenado para codigo | no disponible en la informacion proporcionada | Hugging Face |

La comparativa se limita a estos tres referentes porque la informacion disponible no incluye otros adaptadores Text-to-SQL comparables con datos verificables. El modelo de genies-llm emplea un base de 7B y un entrenamiento SFT completo con TRL, lo que lo situa en otra categoria de recursos; el adaptador de sachiin051 es mas ligero pero carece de documentacion de evaluacion.

## Limitaciones y advertencias
- El autor advierte que el SQL generado puede contener errores de sintaxis o logica incorrecta.
- Las consultas pueden no coincidir con el esquema de la base de datos objetivo, ya que no se documenta el uso de esquemas en el prompt de entrenamiento.
- El rendimiento depende del dataset de entrenamiento y del formato de prompt, que no se especifica; la model card senala que el prompt de inferencia debe coincidir con el usado en entrenamiento.
- El SQL generado debe validarse antes de ejecutarse contra bases de datos reales, especialmente en entornos de produccion.
- No se documentan sesgos conocidos, pero al heredar el modelo base Qwen2.5-Coder puede reproducir sesgos presentes en sus datos de preentrenamiento.
- Riesgo de alucinacion: alto en la generacion de nombres de tablas y columnas no presentes en el esquema real.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido, lo que supone un riesgo legal para produccion.
- Idiomas no documentados: no hay garantia de soporte multilingue mas alla del ingles.
- Ausencia de benchmarks: no hay evidencia cuantitativa de calidad, lo que desaconseja su adopcion sin evaluacion propia.
- Contexto no confirmado: se desconoce la longitud de contexto efectiva tras el ajuste.

## Enlaces
- Hugging Face: https://huggingface.co/sachiin051/Text2SQL-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B
- Repositorio GitHub asociado: https://github.com/SACHHH05/Text2SQL-LoRA
- Adaptador comparable (7B, SFT): https://huggingface.co/genies-llm/text2sql-sft-v5-lora
- README del adaptador comparable: https://huggingface.co/genies-llm/text2sql-sft-v5-lora/blob/main/README.md
