# richardyoung/Olmo-3.1-32B-Instruct-GMPOA-heretic

## Resumen

Olmo-3.1-32B-Instruct-GMPOA-heretic es una variante "decensored" del modelo allenai/Olmo-3.1-32B-Instruct, publicada por el usuario richardyoung. El modelo base lo desarrolla el Allen Institute for AI (AI2) dentro de la familia Olmo 3, una serie de modelos de lenguaje completamente abiertos que incluyen pesos, código, checkpoints intermedios y detalles de entrenamiento. Olmo 3.1 32B Instruct es la variante instruida de 32B del modelo base Olmo-3-32B, entrenada mediante SFT, DPO y RLVR sobre los datasets Dolci.

La modificación aplicada por richardyoung consiste en una ablación ortogonal selectiva de direcciones de activación mediante la herramienta Heretic v2.0.0, con un método denominado Gamma-Exact Magnitude-Preserving Orthogonal Ablation (GammaMPOA). El objetivo es reducir la tasa de rechazos (refusals) del modelo ante peticiones que el modelo original declinaría, preservando en la medida de lo posible las capacidades generales. Según la model card, los rechazos bajan de 100/100 a 82/100 en el conjunto de evaluación empleado, con una divergencia KL de 0,0993 respecto al modelo original.

El interés de esta ficha es doble: por un lado documenta el modelo base Olmo 3.1 32B Instruct, un transformer denso de 32.233.522.176 parámetros con licencia Apache 2.0; por otro, describe una técnica de "abliteration" aplicada sobre él. Es relevante para quienes investigan alineación, robustez de salvaguardas y edición de modelos, así como para desarrolladores que necesiten un modelo abierto de 32B sin las restricciones de rechazo del original, asumiendo los riesgos asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Olmo 3); detalles internos de capas y atención no disponibles en la informacion proporcionada |
| Parametros totales | 32.233.522.176 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | El modelo base documenta carga en 8 bits con bitsandbytes y float16; no se listan formatos GGUF/AWQ/GPTQ en la informacion disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo base Olmo-3.1-32B-Instruct es un transformer denso de 32.233.522.176 parametros, preentrenado sobre el dataset Dolma 3 y postentrenado sobre los datasets Dolci. El pipeline de postentrenamiento de AI2 incluye tres etapas documentadas: SFT (Olmo-3.1-32B-Instruct-SFT), DPO (Olmo-3.1-32B-Instruct-DPO) y una etapa final de RLVR (Olmo-3.1-32B-Instruct). La familia Olmo 3 se distribuye en variantes de 7B y 32B, tanto Instruct como Think; la variante Think emplea cadenas de razonamiento largas para tareas de matematicas y codigo. AI2 publica codigo, checkpoints, logs y detalles de entrenamiento, lo que convierte a Olmo en una serie orientada a la investigacion reproducible.

Sobre esta base, richardyoung aplica Heretic v2.0.0 con el metodo GammaMPOA, que realiza una ablacion ortogonal de direcciones en los pesos preservando la magnitud. Los parametros publicados incluyen direction_index 49,40, y rangos de pesos para attn.o_proj (max_weight 1,18 en posicion 40,77; min_weight 0,62 a distancia 31,15) y mlp.down_proj (max_weight 1,41 en posicion 38,60; min_weight 1,21 a distancia 20,09). No se documentan en la informacion disponible los tokens exactos de entrenamiento, la composicion detallada del dataset ni innovaciones como decodificacion especulativa o atención lineal.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo Instruct base.
- Razonamiento y matematicas: la familia Olmo 3 incluye variantes Think con cadenas de razonamiento largas; esta variante concreta es Instruct, no Think.
- Generacion de codigo, segun las capacidades declaradas del modelo base Olmo 3.
- Reduccion de rechazos: la model card reporta 82/100 rechazos frente a 100/100 del original, es decir, responde a un subconjunto de peticiones que el modelo base declinaria.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo language de la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en esta variante; el modo thinking corresponde a las variantes Think de la familia, no a esta.

## Casos de uso

- Investigacion en alineacion y edicion de modelos: comparar el comportamiento del modelo original y esta variante ablacionada permite estudiar como se distribuyen las direcciones de rechazo en los pesos y que coste tiene eliminarlas, usando la divergencia KL reportada (0,0993) como metrica de deriva.
- Evaluacion de robustez de salvaguardas: servir como modelo de referencia "sin censura" para medir si los clasificadores de seguridad externos detectan contenido que el modelo base rechazaria, con 82/100 rechazos restantes como linea base.
- Generacion de texto creativo sin friccion: para escritura de ficcion, guiones o dialogos donde el modelo original introduciria rechazos innecesarios, con la ventaja de mantener la licencia Apache 2.0.
- Despliegue en entornos de investigacion controlados: al ser un modelo de 32B con pesos safetensors, puede cargarse con transformers >= 4.57.0 en una unica GPU de 80 GB en fp16 o en 8 bits con bitsandbytes para reducir requisitos.
- Fine-tuning posterior: la model card del base documenta recetas de ajuste con OLMo-core y checkpoints intermedios, de modo que esta variante puede servir como punto de partida para adaptaciones especificas de dominio.
- Estudio de degradacion por ablacion: comparar tareas de razonamiento y codigo entre el original y esta variante para cuantificar el coste de la ablacion en capacidades distintas del rechazo.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (allenai/Olmo-3.1-32B-Instruct) |
|---|---|---|
| Rechazos | 82/100 | 100/100 |
| Divergencia KL | 0,0993 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible para esta variante.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 64,5 GB de pesos, por lo que requiere una GPU con 80 GB (A100 80GB, H100 80GB) para inferencia sin cuantizar.
- VRAM estimada en 8 bits: alrededor de 32-35 GB, viable en A100 40GB, L40S 48GB o RTX 6000 Ada 48GB.
- Cuantizaciones de 4 bits no documentadas en la informacion disponible; no se confirma compatibilidad con GGUF, AWQ o GPTQ.
- No cabe en GPUs de consumo como RTX 4090 (24 GB) en fp16 ni en 8 bits; seria necesario cuantizar a 4 bits, opcion no confirmada.
- Opciones de despliegue documentadas: transformers >= 4.57.0; bitsandbytes para carga en 8 bits. No se documentan vLLM, TGI, llama.cpp ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| richardyoung/Olmo-3.1-32B-Instruct-GMPOA-heretic | 32,2B | No disponible | Apache 2.0 | Variante ablacionada, 82/100 rechazos |
| allenai/Olmo-3.1-32B-Instruct | 32,2B | No disponible | Apache 2.0 | Modelo base, 100/100 rechazos, pipeline SFT+DPO+RLVR |
| allenai/Olmo-3.1-32B-Think | 32,2B | No disponible | Apache 2.0 | Variante con cadenas de razonamiento largas |
| allenai/Olmo-3-7B-Instruct | 7B | No disponible | Apache 2.0 | Version mas pequena de la misma familia |

No se dispone en la informacion proporcionada de datos de rendimiento comparativo con modelos de otras familias de tamano similar.

## Limitaciones y advertencias

- La ablacion reduce rechazos pero no los elimina: quedan 82/100 en el conjunto evaluado, por lo que el comportamiento es parcialmente inconsistente.
- La divergencia KL de 0,0993 indica una deriva medible respecto al modelo original; no se documenta el impacto en tareas de razonamiento, codigo o matematicas.
- Modelo solo en ingles; no se declara soporte multilingue.
- Riesgo de alucinacion inherente a los modelos de 32B, no cuantificado en la informacion disponible.
- La reduccion de salvaguardas implica riesgo de generar contenido danino o inapropiado; debe desplegarse con filtros externos y en entornos controlados.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento resultante tras la ablacion.
- No se documentan sesgos especificos ni evaluaciones de seguridad de esta variante.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion externa de la comunidad.
- La model card no detalla la longitud de contexto, el tokenizador ni el formato de chat exacto de esta variante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Olmo-3.1-32B-Instruct-GMPOA-heretic
- Modelo base: https://huggingface.co/allenai/Olmo-3.1-32B-Instruct
- Heretic (proyecto): https://heretic-project.org
- Dataset Dolci-Instruct-RL: https://huggingface.co/datasets/allenai/Dolci-Instruct-RL
- Paper referenciado (arxiv:2512.13961): https://arxiv.org/abs/2512.13961
- Checkpoint SFT del base: https://huggingface.co/allenai/Olmo-3.1-32B-Instruct-SFT
- Checkpoint DPO del base: https://huggingface.co/allenai/Olmo-3.1-32B-Instruct-DPO
- Variante Think: https://huggingface.co/allenai/Olmo-3.1-32B-Think
- Modelo base preentrenado: https://huggingface.co/allenai/Olmo-3-1125-32B
