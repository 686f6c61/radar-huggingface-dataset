# dnhkng/RYS-gemma-2-2b-it

## Resumen

RYS-gemma-2-2b-it es una variante optimizada de Gemma-2-2b-it (Google) publicada por David Noel Ng (usuario dnhkng) bajo licencia MIT. El modelo aplica una tecnica denominada RYS (acronimo del metodo descrito en el articulo "LLM Neuroanatomy: How I Topped the LLM Leaderboard Without Changing a Single Weight"), que consiste en la duplicacion de capas del transformer original sin modificar los pesos entrenados. El resultado es un modelo con 3.626.599.680 parametros, frente a los aproximadamente 2.600 millones del Gemma-2-2b-it original, lo que refleja el incremento derivado de las capas duplicadas.

La propuesta es relevante porque demuestra que es posible mejorar el rendimiento en benchmarks de razonamiento mediante manipulacion estructural post-entrenamiento, sin necesidad de reentrenar ni de ajustar pesos. Esto abre una linea de investigacion sobre la "neuroanatomia" de los LLM: que ocurre al reorganizar o duplicar componentes de la red. El modelo se distribuye en formato safetensors y el repositorio ocupa 7,3 GB.

No obstante, la informacion publica disponible es limitada: la model card no detalla la composicion del dataset de entrenamiento (no hubo entrenamiento adicional), no especifica la longitud de contexto efectiva tras la duplicacion, no documenta idiomas soportados de forma explicita y no incluye resultados numericos de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2) con duplicacion de capas (metodo RYS) |
| Parametros totales | 3.626.599.680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Gemma-2-2b-it; no confirmada tras la modificacion) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors; no se documentan versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (heredados de Gemma-2-2b-it; no documentados en la model card) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Gemma-2-2b-it, un transformer decoder-only de Google con atencion por ventanas deslizantes e intercaladas, normalizacion RMSNorm y activacion GeGLU. Sobre esa base, el autor aplica el metodo RYS, consistente en duplicar determinadas capas del modelo. Segun la descripcion del autor, el proceso no modifica ningun peso: se reorganiza la estructura de la red para obtener una variante con mas profundidad efectiva. El incremento de parametros (de ~2,6B a 3,63B) es coherente con la duplicacion de un subconjunto de capas.

No se realizo entrenamiento adicional, ajuste fino, RLHF ni DPO sobre el modelo resultante, segun la informacion disponible. Tampoco se documenta en la model card que capas concretas se duplicaron, en que orden se insertaron ni como afecta esto a la atencion por ventanas deslizantes original de Gemma 2. El articulo referenciado (DOI 10.5281/zenodo.24230106) contiene la explicacion completa del metodo, pero sus detalles no estan incluidos en la informacion proporcionada.

## Capacidades

- Generacion de texto en ingles principalmente (heredada de Gemma-2-2b-it; el modelo base esta orientado a ingles aunque soporta otros idiomas en menor medida).
- Razonamiento de sentido comun y conocimiento general, presumiblemente mejorado respecto al base segun la afirmacion del autor sobre el leaderboard, aunque sin cifras disponibles.
- Generacion de codigo basica, limitada por el tamano del modelo base (2B).
- Matematicas elementales y problemas de razonamiento de varios pasos, dentro de las capacidades de un modelo de 2B.
- Soporte de conversacion multi-turno (el sufijo "it" indica instruction-tuned, heredado de Gemma-2-2b-it).
- Tool calling / function calling: no documentado explicitamente; el modelo base Gemma-2-2b-it tiene soporte limitado.
- Capacidades de agente: no documentadas.
- Modo "thinking": no disponible.
- Vision y audio: no disponibles.

## Casos de uso

- Investigacion sobre neuroanatomia de LLM: el modelo sirve como caso de estudio reproducible para analizar como la duplicacion de capas afecta al rendimiento en tareas de razonamiento, sin necesidad de reentrenar. Adecuado para laboratorios que estudien modificaciones estructurales post-entrenamiento.
- Experimentos academicos de bajo coste: al tratarse de un modelo de ~3,6B parametros con licencia MIT, se puede desplegar en una unica GPU consumer para comparar su comportamiento frente al Gemma-2-2b-it original en tareas controladas.
- Prototipado de asistentes conversacionales ligeros: el modelo puede gestionar dialogos multi-turno basicos en entornos con recursos limitados, aunque con las limitaciones propias de un modelo de 2B.
- Generacion de texto asistida en ingles: redaccion de borradores, resumenes y respuestas a preguntas sobre conocimiento general, aprovechando la licencia permisiva para uso comercial.
- Evaluacion comparativa de tecnicas de optimizacion: util como baseline en estudios que comparen metodos como pruning, merging o duplicacion de capas frente a modelos del mismo tamano.
- Educacion y divulgacion: ejemplo practico para explicar como se puede modificar la estructura de un transformer sin tocar los pesos, adecuado para cursos de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma que el autor alcanzo un puesto destacado en el Open LLM Leaderboard con este metodo, pero no se incluyen cifras concretas (MMLU, HumanEval, GSM8K, etc.) ni la fecha exacta de la evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 7,3 GB (coherente con el tamano del repositorio y los 3,63B parametros).
- VRAM estimada en cuantizacion de 8 bits: ~3,7 GB; en 4 bits: ~2 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: una RTX 4090 (24 GB) permite inferencia en FP16 con holgura; una RTX 3090 o 4080 tambien es suficiente. Para cuantizacion 4-bit cabe en GPUs de 8 GB como RTX 3060 Ti o RTX 4060.
- Cabe en GPU consumer: si, en la mayoria de GPUs modernas con al menos 8 GB de VRAM si se cuantiza.
- Opciones de despliegue: transformers con accelerate (documentado en la model card); vLLM, llama.cpp u Ollama no estan documentados oficialmente para esta variante concreta, aunque al ser safetensors compatibles con transformers deberian poder convertirse a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RYS-gemma-2-2b-it | 3,63B | no disponible | MIT | safetensors | Duplicacion de capas sobre Gemma-2-2b-it |
| google/gemma-2-2b-it | ~2,6B | 8.192 tokens (ventana deslizante 4.096) | Gemma Terms of Use | safetensors | Modelo base instruction-tuned de Google |
| google/gemma-2-9b-it | ~9,2B | 8.192 tokens | Gemma Terms of Use | safetensors | Version mayor de la misma familia |
| microsoft/Phi-3-mini-4k-instruct | 3,8B | 4.096 tokens | MIT | safetensors | Alternativa de tamano comparable con licencia permisiva |

La comparativa se basa en datos publicos de los modelos originales; no se dispone de resultados de benchmarks del RYS-gemma-2-2b-it para establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: hereda los sesgos de Gemma-2-2b-it, incluido un sesgo hacia el ingles y posibles estereotipos presentes en los datos de entrenamiento originales de Google.
- Riesgo de alucinacion: elevado, como en cualquier modelo de 2B; la duplicacion de capas no elimina este problema y podria amplificarlo si la reorganizacion afecta a la coherencia.
- Limitaciones de contexto: no se documenta si la duplicacion de capas altera la ventana de contexto efectiva de Gemma-2-2b-it (8.192 tokens). No se recomienda asumir el mismo contexto sin verificacion empirica.
- Idiomas: la model card no lista idiomas; se asume el comportamiento de Gemma-2-2b-it (predominantemente ingles), pero no esta confirmado.
- Restricciones de licencia: la licencia MIT del repositorio es permisiva, pero el modelo deriva de Gemma-2-2b-it, sujeto a los Gemma Terms of Use de Google. Existe una posible incompatibilidad o ambiguedad legal entre la licencia MIT declarada y las condiciones de uso del modelo base; conviene revisar antes de uso comercial.
- Caveat para produccion: el modelo no ha sido validado de forma independiente; el autor afirma haber alcanzado un buen puesto en el leaderboard, pero no se aportan cifras. No se recomienda para produccion sin evaluacion propia.
- El modelo no documenta soporte de tool calling ni capacidades de agente, por lo que no es adecuado para pipelines que dependan de estas funciones.
- La fecha de actualizacion del repositorio (2026) es posterior a la creacion (2024), lo que sugiere posibles modificaciones no documentadas en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/dnhkng/RYS-gemma-2-2b-it
- Articulo del metodo RYS: https://dnhkng.github.io/posts/rys/
- DOI del articulo: https://doi.org/10.5281/zenodo.24230106
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
- Perfil del autor en LinkedIn: https://www.linkedin.com/in/dnhkng
- Proyecto GLaDOS del autor: https://github.com/dnhkng/GlaDOS
- appliedAI Institute: https://www.appliedai-institute.de/en/
