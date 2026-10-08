# nikitastheo/v6-mixed-25k-lower-ell-ell-sequential

## Resumen

El modelo `nikitastheo/v6-mixed-25k-lower-ell-ell-sequential` es un modelo de lenguaje causal de tipo GPT-2 desarrollado por el usuario nikitastheo, con aproximadamente 104,7 millones de parametros (104.716.800). Se trata de un experimento de investigacion orientado al entrenamiento de modelos de lenguaje de escala reducida, en la linea del reto BabyLM, tal y como sugiere el nombre del tokenizador asociado (`nikitastheo/babylm-25k-ell-lower-tokenizer`). El modelo no cuenta con descargas ni valoraciones en el momento de redactar esta ficha, por lo que debe considerarse un artefacto de investigacion mas que un modelo listo para produccion.

El sufijo del identificador (`mixed-25k-lower-ell-ell-sequential`) apunta a un experimento de entrenamiento bilingue o multilingue: `ell` es el codigo ISO 639-3 del griego, `lower` indica preprocesado en minusculas, `25k` hace referencia al tamano del vocabulario del tokenizador y `sequential` describe una estrategia de entrenamiento secuencial entre idiomas (con un cambio de idioma fijado en la epoca 10). El modelo forma parte de una familia mas amplia de variantes del mismo autor, entre ellas versiones con idioma aleman compartido (`shared-deu-ell`) o con mezcla intercalada (`interleaved`).

La relevancia de este modelo es fundamentalmente academica: sirve para estudiar como afectan el orden de presentacion de los datos, el tamano del vocabulario y las estrategias de mezcla entre idiomas al aprendizaje de un modelo de lenguaje pequeno. No se ha publicado informacion sobre licencia, idiomas soportados ni longitud de contexto, lo que limita su uso fuera de contextos de investigacion controlados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only basada en GPT-2 |
| Parametros totales | 104.716.800 (~104,7 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (configuracion base `gpt_base_config.json`, sin detalle publicado) |
| Tipos de cuantizacion | no disponible oficialmente; al ser safetensors es convertible a fp16, int8, int4 y GGUF |
| Idiomas soportados | no disponible (el identificador sugiere griego y posiblemente otro idioma, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 15,9 GB |
| Tokenizador | `nikitastheo/babylm-25k-ell-lower-tokenizer` (vocabulario de 25k, minusculas) |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only de tipo GPT-2, definido a partir del fichero de configuracion `configurations/gpt_base_config.json`. Con 104,7 millones de parametros, el modelo se situa en la misma escala que GPT-2 small (124 M), aunque con un recuento ligeramente inferior, probablemente debido a decisiones de configuracion (numero de capas, dimension del embedding o el vocabulario de 25k frente a los 50.257 tokens de GPT-2 original). El tokenizador propio, entrenado sobre corpus BabyLM en minusculas y con vocabulario de 25.000 entradas, sustituye al tokenizador BPE original de GPT-2.

El entrenamiento se realizo con `train_clm.py`, un script de entrenamiento causal-LM basado en Hugging Face Accelerate (sin usar la clase `Trainer`). Los hiperparametros publicados son: 17.430 pasos maximos, tasa de aprendizaje de 1e-4, scheduler lineal, 1.743 pasos de warmup, tamano de batch por dispositivo de 32 y sin acumulacion de gradientes (batch total efectivo de 32). El parametro `language switch epoch` fijado en 10 indica que el entrenamiento combina datos de al menos dos idiomas y que, en la epoca 10, se produce un cambio de idioma dominante, una tecnica habitual en estudios de adquisicion del lenguaje para medir el olvido catastrofico o la transferencia entre lenguas. No se especifica el numero total de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF, DPO u otra optimizacion por preferencias.

## Capacidades

- Generacion de texto causal autoregresiva en la linea de GPT-2.
- Modelado de lenguaje a pequena escala, adecuado para experimentos controlados.
- Capacidad multilingue potencial limitada a los idiomas efectivamente incluidos en el entrenamiento (el identificador sugiere griego, sin confirmar), sujeta a un cambio de idioma secuencial en la epoca 10.
- Procesamiento en minusculas por diseno del tokenizador, lo que reduce la variabilidad de vocabulario pero limita el manejo de mayusculas y nombres propios.
- No hay evidencia publicada de soporte de tool calling, function calling, agentes o razonamiento multi-paso.
- No hay evidencia publicada de capacidades de vision, audio ni modo de pensamiento (thinking mode).
- No hay evidencia publicada de ajuste por instrucciones (instruction tuning); se trata de un modelo base.

## Casos de uso

- Investigacion en adquisicion del lenguaje: el modelo permite reproducir experimentos tipo BabyLM sobre como el orden y la mezcla de idiomas afectan al aprendizaje, gracias a su configuracion secuencial con cambio de idioma en la epoca 10.
- Estudio de tokenizadores de bajo recurso: al usar un tokenizador propio de 25.000 entradas y en minusculas, sirve para analizar el impacto del vocabulario en la calidad de generacion frente a tokenizadores mayores como el de GPT-2.
- Experimentos de olvido catastrofico en entrenamiento bilingue: la estrategia secuencial permite medir la degradacion de un idioma tras cambiar el foco de entrenamiento al otro.
- Generacion de texto a muy baja escala en entornos academicos: puede ejecutarse en una CPU o GPU de gama baja para tareas de demostracion y docencia, dado su tamano reducido.
- Base para fine-tuning especifico de dominio en investigacion: al ser un modelo base con pesos safetensors, puede ajustarse a tareas concretas sobre corpus pequenos.
- Reproducibilidad de pipelines de entrenamiento: el modelo documenta hiperparametros y script de entrenamiento, lo que lo hace util como referencia para validar configuraciones de Accelerate en modelos pequenos.
- Analisis de sesgos y comportamiento en minusculas: util para estudiar como el preprocesado en minusculas afecta a la generacion de entidades y nombres propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 420 MB solo para pesos, mas overhead de activaciones y cache KV.
- VRAM estimada en fp16/bf16: aproximadamente 210 MB.
- VRAM estimada en int8: aproximadamente 105 MB.
- VRAM estimada en int4: aproximadamente 55 MB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4090, etc.); tambien cabe en GPUs de gama de entrada e incluso en CPU para inferencia en lote reducido.
- Opciones de despliegue: transformers de Hugging Face, text-generation-inference (TGI), vLLM y conversiones a GGUF para llama.cpp u Ollama (no publicadas oficialmente).
- Latencia y throughput: no disponibles. Al tratarse de un modelo de ~105 M de parametros, se espera latencia muy baja en GPU, pero no hay mediciones publicadas.

Nota: el tamano del repositorio (15,9 GB) es muy superior al que corresponderia a los pesos en fp32 (~420 MB), lo que sugiere la presencia de checkpoints intermedios, estados de optimizador u otros artefactos de entrenamiento, no solo los pesos finales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| nikitastheo/v6-mixed-25k-lower-ell-ell-sequential | ~104,7 M | no disponible | no disponible | Hugging Face | Experimento BabyLM, tokenizador propio de 25k |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | MIT (pesos liberados) | Hugging Face | Referencia de la misma familia arquitectonica, vocabulario de 50.257 |
| DistilGPT-2 (Hugging Face) | 82 M | 1024 tokens | Apache 2.0 | Hugging Face | Version destilada de GPT-2, mas pequena y rapida |
| Modelos BabyLM de la comunidad | variable (~100 M) | variable | variable | Hugging Face | Familia a la que pertenece el modelo; comparabilidad directa limitada por falta de benchmarks |

## Limitaciones y advertencias

- No hay informacion publicada sobre licencia, por lo que se desconoce si se permite el uso comercial.
- Se trata de un modelo base sin ajuste por instrucciones: no sigue ordenes de forma fiable y no debe usarse como asistente directo sin fine-tuning.
- Riesgo elevado de alucinacion y de generar texto incoherente, propio de modelos de ~100 M de parametros entrenados sobre corpus reducidos.
- El preprocesado en minusculas limita el manejo de nombres propios, siglas y puntuacion dependiente de mayusculas.
- La cobertura de idiomas no esta confirmada; el griego aparece implicito en el identificador, pero no hay verificacion oficial.
- La estrategia de cambio de idioma en la epoca 10 puede haber provocado olvido catastrofico del idioma previo, con degradacion no medida.
- No hay benchmarks publicados, por lo que no es posible comparar su calidad objetivamente con alternativas.
- Cero descargas y cero valoraciones en el momento de la ficha, lo que indica que no ha sido validado por la comunidad.
- El elevado tamano del repositorio (15,9 GB) frente al numero de parametros puede complicar su descarga y almacenamiento.
- No se recomienda su uso en produccion sin evaluacion previa y sin una licencia clara.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikitastheo/v6-mixed-25k-lower-ell-ell-sequential
- Tokenizador asociado: https://huggingface.co/nikitastheo/babylm-25k-ell-lower-tokenizer
- Variante con aleman compartido: https://huggingface.co/nikitastheo/v6-mixed-25k-lower-shared-deu-ell-sequential_interleaved
- Variante intercalada: https://huggingface.co/nikitastheo/v6-mixed-25k-ell-ell-sequential_interleaved
- Discusiones de la variante intercalada: https://huggingface.co/nikitastheo/v6-mixed-25k-ell-ell-sequential_interleaved/discussions
- Ficha en FriendliAI: https://friendli.ai/models/nikitastheo/v6-mixed-25k-ell-ell-sequential_interleaved
- Registro en free2aitools: https://free2aitools.com/model/nikitastheo/v6-mixed-25k-ell-ell-sequential
