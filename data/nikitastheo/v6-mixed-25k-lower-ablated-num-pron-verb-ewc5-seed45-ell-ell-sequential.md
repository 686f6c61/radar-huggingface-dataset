# nikitastheo/v6-mixed-25k-lower-ablated-num-pron-verb-ewc5-seed45-ell-ell-sequential

## Resumen

El modelo `nikitastheo/v6-mixed-25k-lower-ablated-num-pron-verb-ewc5-seed45-ell-ell-sequential` es un modelo de lenguaje causal de pequeno tamano (unos 104,7 millones de parametros) desarrollado por el usuario nikitastheo y publicado en Hugging Face. Se trata de un experimento de investigacion orientado al estudio del aprendizaje temprano del lenguaje, en la linea de los trabajos tipo BabyLM, donde se entrena un transformer desde cero sobre un corpus limitado de tokens (25.000 en el nombre del modelo) con el objetivo de analizar como ciertas capacidades linguisticas emergen con datos reducidos.

El identificador del modelo revela un diseno experimental muy concreto: variante "lower" (probablemente entrenamiento sobre texto en minusculas), "ablated-num-pron-verb" (ablacion de numerales, pronombres y verbos en el corpus de entrenamiento), "ewc5" (posible regularizacion Elastic Weight Consolidation con un coeficiente de 5), semilla 45 y un esquema "sequential" con cambio de idioma en la epoca 10 (campo "language switch epoch"). El tokenizador asociado tambien contiene "ell" en su nombre, lo que sugiere un componente en griego.

Se trata, por tanto, de un artefacto de investigacion mas que de un modelo listo para produccion. No hay model card sustantiva, no se declaran idiomas, licencia ni resultados de evaluacion, y no cuenta con descargas ni interacciones. Su interes es academico: sirve para reproducir o auditar un experimento concreto sobre ablacion de categorias gramaticales y aprendizaje secuencial de idiomas en regimen de bajos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (configuracion GPT base, `configurations/gpt_base_config.json`) |
| Parametros totales | 104.716.800 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion a GGUF no publicada) |
| Idiomas soportados | no disponible; el nombre del modelo y el tokenizador sugieren componentes en griego ("ell") e ingles, sin confirmacion oficial |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal de tipo GPT con configuracion base definida en `configurations/gpt_base_config.json`, con 104.716.800 parametros totales. El entrenamiento se realizo con `train_clm.py`, un script de entrenamiento de modelos de lenguaje causal basado en Hugging Face Accelerate y que no utiliza la clase `Trainer`. Los hiperparametros declarados son: 17.300 pasos maximos, tasa de aprendizaje 1e-4, planificador lineal con 1.730 pasos de calentamiento, tamano de lote de 32 por dispositivo, sin acumulacion de gradientes (lote total de 32) y una epoca de cambio de idioma en el paso 10.

El tokenizador empleado es `nikitastheo/babylm-25k-ell-lower-seed45-ablated-num-pron-verb-tokenizer`, coherente con un corpus de aproximadamente 25.000 tokens o unidades de entrenamiento en minusculas, con ablacion de numerales, pronombres y verbos. El sufijo "ewc5" apunta a un uso de regularizacion Elastic Weight Consolidation con coeficiente 5, tecnica habitual para mitigar el olvido catastrofico en entrenamiento secuencial; el sufijo "sequential" y el campo "language switch epoch" indican un regimen de entrenamiento por fases con cambio de idioma. No se detalla la composicion exacta del dataset ni si hubo fases de RLHF o DPO; por el tipo de experimento, no se declaran.

## Capacidades

- Generacion de texto causal autoregresiva, capacidad basica del pipeline `text-generation`.
- Entrenamiento orientado a estudiar el efecto de la ablacion de categorias gramaticales (numerales, pronombres y verbos) en el aprendizaje.
- Posible capacidad multilingue limitada derivada del cambio de idioma secuencial (epoca 10), sin confirmacion de los idiomas exactos.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara modo de razonamiento (thinking), vision ni audio.
- No se declaran capacidades de codigo ni matematicas mas alla de lo que pueda emerger de un corpus general de bajos recursos.

## Casos de uso

- Reproduccion de experimentos de aprendizaje linguistico de bajos recursos: el modelo sirve como punto de partida para replicar el entrenamiento con `train_clm.py` y comparar el efecto de la ablacion de numerales, pronombres y verbos sobre la perplejidad.
- Investigacion sobre olvido catastrofico: el uso declarado de EWC con coeficiente 5 y el regimen secuencial permiten estudiar estrategias de retencion al cambiar de fase o de idioma.
- Estudio de tokenizadores reducidos: el tokenizador asociado de 25.000 unidades permite analizar como afecta un vocabulario pequeno y en minusculas a la calidad de la generacion.
- Docencia y practicas de entrenamiento: al ser un GPT de ~105 M de parametros, se puede entrenar y ajustar en una unica GPU consumer, lo que lo hace util para cursos sobre transformers causales.
- Generacion de texto controlada en entornos de prueba: util para validar pipelines de `transformers` y `text-generation-inference` con un checkpoint pequeno antes de escalar a modelos mayores.
- Analisis de sesgos inducidos por ablacion: comparar las salidas del modelo con y sin categorias gramaticales ablacionadas para estudiar como la ausencia de pronombres o verbos afecta a la coherencia textual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 0,42 GB solo para pesos, mas activaciones y cache KV; en la practica, menos de 2 GB.
- VRAM estimada en fp16/bf16: alrededor de 0,21 GB para pesos; holgado en cualquier GPU consumer moderna.
- VRAM estimada en cuantizacion de 8 bits: en torno a 0,1 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4060 o superior es mas que suficiente. Tambien cabe en CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer de los ultimos diez anos.
- Opciones de despliegue: `transformers` con `pipeline("text-generation")`, `text-generation-inference` (el modelo esta marcado como compatible con endpoints), y potencialmente llama.cpp u Ollama si se genera una conversion a GGUF, no publicada.
- Latencia y throughput: no disponibles; por el tamano, se espera una latencia de milisegundos por token en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nikitastheo/v6-mixed-25k-lower-ablated-num-pron-verb-ewc5-seed45-ell-ell-sequential | 104,7 M | no disponible | no disponible | Hugging Face, 0 descargas |
| GPT-2 small (OpenAI) | 124 M | 1.024 tokens | MIT | Ampliamente disponible |
| GPT-2 medium (OpenAI) | 355 M | 1.024 tokens | MIT | Ampliamente disponible |
| Modelos BabyLM de referencia (varios autores) | 10-100 M | variable | variable | Hugging Face |

La comparacion con GPT-2 small es la mas directa por tamano; sin embargo, no hay datos de rendimiento del modelo de nikitastheo que permitan una comparacion cuantitativa. Frente a los modelos BabyLM de referencia, comparte el enfoque de entrenamiento con corpus reducido, pero se distingue por la ablacion gramatical y el esquema secuencial con EWC.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: no se documentan datos de entrenamiento, composicion del corpus ni proceso de evaluacion.
- Licencia no declarada: no es posible determinar si se permite uso comercial; debe tratarse como no apto para produccion hasta aclararlo con el autor.
- Idiomas no declarados oficialmente: el nombre sugiere griego e ingles, pero no hay confirmacion.
- Riesgo elevado de alucinacion y texto incoherente: con ~25.000 unidades de entrenamiento y ablacion de categorias gramaticales, la calidad de generacion sera muy limitada.
- Contexto no documentado: se desconoce la longitud maxima de secuencia soportada.
- Sesgos desconocidos: al no documentarse el corpus, no se pueden evaluar sesgos de genero, raza o ideologia.
- Modelo de investigacion con 0 descargas y 0 interacciones: no hay evidencia de uso ni validacion por la comunidad.
- No apto para despliegue en produccion sin una evaluacion exhaustiva previa.

## Enlaces

- Hugging Face: https://huggingface.co/nikitastheo/v6-mixed-25k-lower-ablated-num-pron-verb-ewc5-seed45-ell-ell-sequential
- Tokenizador asociado: https://huggingface.co/nikitastheo/babylm-25k-ell-lower-seed45-ablated-num-pron-verb-tokenizer
- Perfil del autor: https://huggingface.co/nikitastheo
