# Erog0291/stewmind-1.7b-ultra-128k

## Resumen

StewMind 1.7B Ultra 128K es un ajuste fino del modelo base Qwen/Qwen3-1.7B publicado por el usuario Erog0291 en Hugging Face. El autor ha fusionado un adaptador LoRA denominado MUTYINT directamente en los pesos del modelo mediante operaciones tensoriales, y posteriormente ha aplicado un escalado YaRN x4 sobre el rope, extendiendo la longitud de contexto nominal de 40.960 a 131.072 tokens. El resultado es un checkpoint que se carga sin necesidad de PEFT ni de adaptadores externos.

El modelo se distribuye bajo licencia Apache 2.0 y está orientado a tareas de recuperación de información en contextos largos, con soporte declarado para inglés, hausa, igbo, yoruba y pidgin nigeriano. Se trata de un modelo de 1.720.574.976 parámetros (aproximadamente 1,7 mil millones), con pesos en formato safetensors y un repositorio de 3,5 GB.

La relevancia de esta ficha es limitada pero concreta: es un ejemplo de extensión de contexto mediante YaRN sobre un modelo pequeño, lo que permite experimentar con ventanas de 128K tokens en hardware de consumo. No obstante, la model card no aporta resultados de benchmarks de calidad ni evidencia de que la recuperación funcione en las longitudes anunciadas, por lo que debe tratarse como un artefacto experimental más que como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-1.7B) |
| Parámetros totales | 1.720.574.976 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens (nominal, con YaRN x4; base 40.960) |
| Tipos de cuantización | no disponible (el autor no documenta cuantizaciones publicadas) |
| Idiomas soportados | en, ha, ig, yo, pcm |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only denso. Sobre esa base se ha fusionado un adaptador LoRA (MUTYINT) mediante aritmética tensorial directa, de modo que los pesos resultantes incorporan el ajuste sin requerir PEFT en tiempo de carga. A continuación se aplicó un escalado YaRN con factor x4 sobre las frecuencias del rope, lo que multiplica por cuatro la ventana de contexto efectiva, pasando de 40.960 a 131.072 tokens.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. La model card no documenta ninguna innovación adicional más allá de la fusión del adaptador y el escalado YaRN. Tampoco se especifica qué hiperparámetros se usaron para el ajuste LoRA ni sobre qué datos se entrenó el adaptador MUTYINT.

## Capacidades

- Generación de texto autoregresiva heredada del modelo base Qwen3-1.7B.
- Procesamiento de contextos largos de hasta 131.072 tokens nominales gracias al escalado YaRN x4.
- Soporte multilingüe declarado para inglés, hausa, igbo, yoruba y pidgin nigeriano.
- Recuperación de información en contextos largos: el autor afirma haber ejecutado pruebas de recuperación a 4.000, 32.000, 64.000, 100.000 y 131.000 tokens, aunque los resultados de recuperación son negativos en todos los casos.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- No se documentan capacidades de código o matemáticas más allá de las heredadas del modelo base.

## Casos de uso

- Experimentación con ventanas de contexto largo en hardware de consumo: el tamaño de 1,7B permite cargar el modelo en GPUs de gama media y probar técnicas de recuperación en 128K tokens sin infraestructura dedicada.
- Investigación sobre escalado YaRN: sirve como referencia práctica para estudiar cómo afecta la extensión de contexto por rope scaling a la calidad de recuperación en modelos pequeños.
- Procesamiento de documentos largos en inglés: para tareas de resumen o extracción sobre textos extensos, siempre que se valide empíricamente la calidad de la recuperación en la longitud objetivo.
- Procesamiento de texto en lenguas de África occidental: el soporte declarado de hausa, igbo, yoruba y pidgin nigeriano permite experimentar con estas lenguas, aunque sin garantías de calidad documentadas.
- Prototipado de pipelines de context largo: al no requerir PEFT, se integra directamente en frameworks de inferencia que carguen safetensors.
- Evaluación comparativa de técnicas de fusión de adaptadores: la fusión tensorial de LoRA documentada por el autor puede reproducirse y compararse con otras estrategias de merge.
- Base para ajustes posteriores: al estar bajo Apache 2.0, puede servir como punto de partida para fine-tuning adicional en dominios específicos.

## Benchmarks y rendimiento

El autor indica explícitamente que no ha publicado resultados de MMLU, GSM8K ni MMMU. La única tabla disponible es la de recuperación en contexto largo, que se reproduce a continuación tal como aparece en la model card:

| Contexto (tokens) | Código recuperado | Latencia |
|---|---|---|
| 4.000 | no | 12,4 |
| 32.000 | no | no disponible |
| 64.000 | no | no disponible |
| 100.000 | no | no disponible |
| 131.000 | no | no disponible |

No se han publicado resultados de benchmarks de calidad en la información disponible. La tabla de recuperación indica que el modelo no recuperó el código en ninguna de las longitudes probadas, lo que sugiere que la extensión de contexto no funciona correctamente en la práctica.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,4 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,7 GB para pesos; en 4 bits, alrededor de 0,9 GB. No obstante, el autor no publica versiones cuantizadas, por lo que habría que generarlas.
- La caché KV para 131.072 tokens es el factor limitante: con 1,7B parámetros y configuración típica de Qwen3, puede requerir decenas de GB adicionales según el número de capas y cabezas, por lo que contextos completos de 128K no caben en GPUs de consumo sin técnicas de atención eficiente o cuantización de caché.
- GPU recomendadas: RTX 3090, RTX 4090, A100 o H100 para contextos largos; GPUs con 8-12 GB para contextos cortos.
- Cabe en GPUs de consumo (RTX 3060 12 GB, RTX 4070, etc.) para contextos moderados en fp16 o cuantizado.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que soporten la configuración de rope scaling incluida en el config. No se documentan latencias ni throughput más allá del dato de 12,4 en la tabla de recuperación (unidad no especificada).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| StewMind 1.7B Ultra 128K | 1,72B | 131.072 (YaRN x4) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-1.7B | 1,72B | 40.960 | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-4B | 4B | 40.960 (extensible) | Apache 2.0 | Hugging Face |
| Llama 3.2 1B | 1,24B | 131.072 | Llama 3.2 Community License | Hugging Face |

La comparativa se limita a parámetros, contexto y licencia, ya que no hay datos de rendimiento publicados para StewMind. Frente a Qwen3-1.7B, la diferencia principal es la extensión de contexto nominal; frente a Llama 3.2 1B, este último ofrece 128K nativos sin necesidad de rope scaling y con una licencia más restrictiva. No se dispone de datos de benchmarks que permitan comparar calidad.

## Limitaciones y advertencias

- La tabla de recuperación publicada por el autor muestra que el modelo no recuperó el código en ninguna de las longitudes probadas, incluida la de 4.000 tokens, lo que cuestiona la utilidad práctica del contexto extendido.
- No hay benchmarks de calidad (MMLU, GSM8K, MMMU) que permitan evaluar si la fusión del adaptador y el escalado YaRN han degradado las capacidades del modelo base.
- El escalado YaRN x4 sobre un modelo pequeño puede degradar la calidad en contextos cortos; no se documenta ninguna evaluación al respecto.
- Riesgo de alucinación inherente a un modelo de 1,7B, especialmente en tareas de razonamiento y matemáticas.
- El soporte multilingüe para hausa, igbo, yoruba y pidgin nigeriano está declarado pero no evaluado; la calidad real es desconocida.
- La licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3-1.7B conviene verificar las condiciones del modelo base y de los datos de entrenamiento del adaptador, no documentados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.
- No se documentan cuantizaciones publicadas, por lo que el usuario debe generarlas y validarlas por su cuenta.
- La fecha de creación del repositorio (2026-11-01) y la ausencia de pipeline declarado refuerzan el carácter experimental del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Erog0291/stewmind-1.7b-ultra-128k
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
