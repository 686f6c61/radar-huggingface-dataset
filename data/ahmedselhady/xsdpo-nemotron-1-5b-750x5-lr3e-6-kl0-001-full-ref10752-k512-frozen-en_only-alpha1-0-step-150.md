# ahmedselhady/XSDPO-Nemotron-1.5B-750x5-lr3e-6-kl0.001-full-ref10752-k512-frozen-en_only-alpha1.0-step-150

## Resumen

XSDPO-Nemotron-1.5B es un checkpoint intermedio de pesos (step 150) resultante de un proceso de ajuste fino con SDPO (una variante de optimizacion por preferencias, presumiblemente *Self-Distillation Policy Optimization*) sobre el modelo base `nvidia/Nemotron-Research-Reasoning-Qwen-1.5B`. Lo publica el usuario `ahmedselhady` en Hugging Face y forma parte de una ejecucion experimental identificada como `macereason-math-750x5-nemotron-1.5b-lr3e-6-kl0.001-full-ref10752-k512-frozen-en_only-alpha1.0`, cuyo nombre codifica hiperparametros concretos: learning rate 3e-6, coeficiente KL 0.001, 750 pasos por 5 epocas, referencia de 10752 muestras, k=512 y entrenamiento solo en ingles.

El modelo hereda la arquitectura Qwen2 del modelo base de NVIDIA, orientado al razonamiento matematico, con 1.777.088.000 parametros totales (aproximadamente 1,78 mil millones) y un repositorio de 3,6 GB en formato safetensors. Su relevancia es acotada: se trata de un artefacto de investigacion para reproducir o inspeccionar el entrenamiento, no de un modelo listo para produccion, ya que no incluye model card descriptiva, licencia declarada ni evaluacion publicada.

Al ser un checkpoint de un paso intermedio (150 de 750), no representa el estado final del ajuste y su calidad no esta validada por el autor. Es util para quien quiera estudiar la dinamica de SDPO sobre modelos pequenos de razonamiento o comparar checkpoints intermedios de la misma ejecucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2 (heredada del modelo base) |
| Parametros totales | 1.777.088.000 (1,78 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (no declarada en la model card) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | Entrenamiento declarado solo en ingles (`en_only` en el nombre de la ejecucion); resto no disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `nvidia/Nemotron-Research-Reasoning-Qwen-1.5B`, es decir, un transformer decoder-only de la familia Qwen2 con 1,78 mil millones de parametros, disenado por NVIDIA para tareas de razonamiento. Sobre esa base se aplica un ajuste fino con SDPO, un metodo de optimizacion con preferencias que, segun los hiperparametros codificados en el nombre de la ejecucion, emplea un coeficiente KL de 0.001 frente a una politica de referencia, un learning rate de 3e-6 y un tamano de lote/ventana k=512 sobre un conjunto de referencia de 10752 muestras. El entrenamiento se realizo en modalidad *full* (todos los parametros, no LoRA) y con la referencia congelada (`frozen`), sobre datos exclusivamente en ingles (`en_only`) y con un factor alpha de 1.0.

El checkpoint corresponde al paso 150 de una ejecucion planificada de 750 pasos por 5 epocas, por lo que refleja una fase temprana-media del entrenamiento. No se dispone de informacion sobre la composicion exacta del dataset, el volumen total de tokens procesados ni si hubo fases adicionales de RLHF o DPO mas alla del propio SDPO. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal u otras) en la informacion disponible.

## Capacidades

- Generacion de texto conversacional, heredada del pipeline `text-generation` y la etiqueta `conversational` del modelo base.
- Razonamiento matematico y de multiples pasos, dado que el modelo base de NVIDIA esta orientado a *research reasoning* y la ejecucion se denomina `macereason-math`.
- Ajuste orientado a preferencias mediante SDPO, lo que en principio deberia alinear las respuestas con el criterio de la politica de referencia usada en el entrenamiento.
- Capacidades multilingues: limitadas al ingles segun el sufijo `en_only`; el resto de idiomas no esta garantizado ni documentado.
- Soporte de tool calling / function calling: no disponible (no declarado).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad explicitamente validada; el modelo base es de razonamiento, pero no hay evaluacion de este checkpoint.
- Capacidades especiales (vision, audio, modo *thinking* explicito): no disponibles.

## Casos de uso

- Investigacion sobre SDPO: inspeccionar como evoluciona un modelo de 1,78 B en el paso 150 de una ejecucion de 750 pasos, comparando con checkpoints posteriores de la misma serie para estudiar la dinamica de convergencia y el efecto del coeficiente KL 0.001.
- Reproducibilidad de experimentos: cargar el checkpoint con `transformers` para replicar las condiciones de la ejecucion `macereason-math-750x5` y verificar resultados intermedios antes de invertir en el entrenamiento completo.
- Ablaciones de hiperparametros: servir como punto de comparacion frente a otras ejecuciones con distinto learning rate o coeficiente KL, aislando el efecto de cada variable sobre un modelo pequeno.
- Prototipado de razonamiento matematico en local: con 1,78 B de parametros, cabe en GPU de consumo (por ejemplo, RTX 4090 o incluso GPUs de 8-12 GB en cuantizacion de 8 bits) para pruebas rapidas de generacion de soluciones paso a paso en ingles.
- Evaluacion de alineacion temprana: medir si el ajuste SDPO en fase temprana ya modifica el estilo de respuesta respecto al modelo base de NVIDIA, util para decidir si merece la pena continuar el entrenamiento.
- Base para ajuste posterior: al ser un modelo denso de 1,78 B en safetensors, puede servir como inicializacion para LoRA o fine-tuning adicional en tareas de matematicas o razonamiento en ingles.
- Docencia y divulgacion: ejemplo didactico de como se nombran y publican checkpoints intermedios de ejecuciones de RL/DPO, con hiperparametros codificados en el identificador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 5-6 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: en torno a 2 GB para pesos; en 4 bits, aproximadamente 1 GB, mas overhead.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090, A10, L4); para cuantizacion 4/8 bits, GPUs de 6-8 GB como RTX 3050 o GTX 1660 pueden ser suficientes.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 4080, RTX 4070, RTX 4060 Ti y modelos similares con 8 GB o mas en FP16; en GPUs de 4-6 GB requerira cuantizacion.
- Opciones de despliegue: `transformers` (declarado), `text-generation-inference` (etiqueta `text-generation-inference` presente), y previsiblemente vLLM y llama.cpp/Ollama si se generan conversiones GGUF, aunque estas ultimas no estan publicadas.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| XSDPO-Nemotron-1.5B (este) | 1,78 B | No disponible | No disponible | Hugging Face, safetensors | Checkpoint intermedio (step 150), sin benchmarks |
| nvidia/Nemotron-Research-Reasoning-Qwen-1.5B | 1,78 B | No disponible | No disponible | Hugging Face | Modelo base de NVIDIA; punto de partida del ajuste |
| Qwen2.5-1.5B / Qwen2-1.5B | ~1,5 B | 32 768 tokens (Qwen2.5) | Apache 2.0 (Qwen2.5) | Hugging Face, ampliamente disponible | Alternativa generalista de tamano similar, con benchmarks publicados |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,78 B | 32 768 tokens (heredado de Qwen2.5) | MIT (tipicamente) | Hugging Face | Modelo de razonamiento destilado de tamano comparable, con evaluaciones publicadas |

La comparativa se limita a tamano y familia, ya que este checkpoint no aporta datos de rendimiento ni licencia que permitan una comparacion cuantitativa rigurosa.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 150 de 750), no el modelo final de la ejecucion; su calidad puede ser inferior a la de checkpoints posteriores.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido; debe contactarse con el autor o consultarse la licencia del modelo base de NVIDIA antes de cualquier uso en produccion.
- El entrenamiento se realizo solo en ingles (`en_only`); el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- No hay model card descriptiva, evaluacion ni benchmarks publicados; no se puede verificar su calidad frente al modelo base.
- Riesgo de alucinacion inherente a los modelos de lenguaje de 1,78 B, especialmente en matematicas y razonamiento de multiples pasos; no hay evaluacion que lo cuantifique.
- Sesgos conocidos: no documentados, pero al derivar de un modelo base entrenado con datos web en ingles, es probable que herede sesgos de ese corpus.
- Longitud de contexto no declarada; no debe asumirse la del modelo base sin verificacion empirica.
- El nombre de la ejecucion sugiere un ajuste con SDPO sobre datos de referencia; sin documentacion, no se puede confirmar la composicion del dataset ni posibles contaminaciones.
- Al ser un artefacto de investigacion con 0 descargas y 0 likes, no hay evidencia de uso en produccion ni validacion por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmedselhady/XSDPO-Nemotron-1.5B-750x5-lr3e-6-kl0.001-full-ref10752-k512-frozen-en_only-alpha1.0-step-150
- Modelo base: https://huggingface.co/nvidia/Nemotron-Research-Reasoning-Qwen-1.5B
- Perfil del autor: https://huggingface.co/ahmedselhady
- Papers, blogs, repositorios o demos adicionales: no disponibles en la informacion proporcionada.
