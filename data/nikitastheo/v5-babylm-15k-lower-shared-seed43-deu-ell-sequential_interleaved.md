# nikitastheo/v5-babylm-15k-lower-shared-seed43-deu-ell-sequential_interleaved

## Resumen

`nikitastheo/v5-babylm-15k-lower-shared-seed43-deu-ell-sequential_interleaved` es un modelo de lenguaje causal de tipo decoder-only, con arquitectura de la familia GPT-2, publicado por el usuario nikitastheo en Hugging Face. Cuenta con 108.550.656 parametros y un repositorio de 0,9 GB en formato safetensors. Por su nomenclatura (prefijo "babylm", vocabulario de 15k, marca de semilla "seed43" y sufijo "deu-ell"), se trata de un artefacto de investigacion encuadrado en experimentos de preentrenamiento de bajo coste computacional, no de un modelo orientado a produccion.

El entrenamiento se realizo con `train_clm.py`, un script de entrenamiento causal-LM basado en Hugging Face Accelerate (sin `Trainer`), sobre la configuracion base `gpt_base_config.json` y un tokenizer propio (`nikitastheo/babylm-15k-deu-lower-seed43-tokenizer`). Se ejecutaron 25.200 pasos con learning rate de 1e-4, scheduler lineal, 2.520 pasos de warmup y batch efectivo de 32. El campo "language switch epoch: 10" indica un regimen curricular en el que se cambia de idioma en la epoca 10, coherente con el sufijo "deu-ell-sequential_interleaved" (aleman y griego, alternancia secuencial e intercalada).

Su relevancia es metodologica: es un punto de comparacion reproducible (semilla fija 43, configuracion y tokenizer publicados) para estudiar adquisicion bilingue con presupuestos de datos y computo muy reducidos. No hay resultados de benchmarks, licencia declarada ni idiomas confirmados en la informacion disponible, y el repositorio no registra descargas ni "me gusta" en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal, familia GPT-2 (tag `gpt2`; config base `gpt_base_config.json`) |
| Parametros totales | 108.550.656 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no declarada en la model card ni en los metadatos) |
| Tipos de cuantizacion | no disponible; solo se publican pesos en safetensors en su precision original (no hay GGUF, AWQ ni GPTQ publicados) |
| Idiomas soportados | no disponible en la model card; el identificador del repositorio sugiere aleman (`deu`) y griego (`ell`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `transformers`) |
| Tamano del repositorio | 0,9 GB |
| Pipeline declarado | text-generation |
| Compatibilidad | text-generation-inference, endpoints_compatible |
| Fecha de creacion (metadato) | 2026-09-21T17:45:56Z |
| Ultima actualizacion (metadato) | 2026-09-21T18:37:49Z |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only de tipo GPT-2, segun el tag `gpt2` y la configuracion base empleada (`model_configs/gpt_base_config.json`). Con 108,55 millones de parametros, el modelo se situa en el rango de GPT-2 small (124 M) y por debajo de GPT-2 medium (355 M). No se especifica en la informacion disponible el numero de capas, dimensiones ocultas, numero de cabezas de atencion, tipo de positional encoding ni la longitud de contexto soportada; tampoco se documenta el uso de atencion lineal, decodificacion especulativa ni ninguna otra innovacion arquitectonica. El tokenizer es especifico del proyecto, con un vocabulario de 15.000 entradas segun su nombre (`babylm-15k-deu-lower-seed43-tokenizer`), y la marca "lower" sugiere normalizacion a minusculas del texto de entrenamiento.

El procedimiento de entrenamiento esta documentado con detalle: script `train_clm.py` basado en Hugging Face Accelerate, 25.200 pasos maximos, learning rate de 1e-4, scheduler lineal con 2.520 pasos de warmup, batch size de 32 por dispositivo con 1 paso de acumulacion (batch total efectivo de 32) y semilla 43. El parametro "language switch epoch: 10" apunta a un curriculum de dos fases: primero un idioma y, a partir de la epoca 10, alternancia secuencial/intercalada entre aleman y griego, en linea con el sufijo `deu-ell-sequential_interleaved` del nombre del modelo. No se indica el volumen de tokens de entrenamiento, la composicion del dataset, si se aplicaron fases de RLHF, DPO o SFT, ni si el modelo recibio ajuste por instrucciones; por los tags y el pipeline declarado, es un modelo base de generacion de texto sin alineamiento documentado.

## Capacidades

- Generacion de texto autoregresiva en modo completado, con sampling de temperatura/top-k/top-p segun los parametros de generacion estandar de `transformers`.
- Modelado de lenguaje causal bilingue potencial (aleman y griego) segun la nomenclatura del repositorio, sin confirmacion explicita en la model card.
- Integracion directa con `text-generation-inference` y con el sistema de endpoints compatibles de Hugging Face, segun los tags del repositorio.
- Formato de pesos safetensors, cargable con `AutoModelForCausalLM` y `AutoTokenizer` de la libreria `transformers`.
- No hay evidencia de soporte de tool calling, function calling, agentes, razonamiento multi-paso, modo "thinking", vision, audio ni capacidades multimodales.
- No hay evidencia de ajuste por instrucciones ni de plantilla de chat publicada.
- Capacidad multilingue amplia: no disponible (solo se puede inferir aleman y griego del identificador).

## Casos de uso

- Investigacion en adquisicion bilingue con datos limitados: el modelo permite replicar experimentos de alternancia de idioma (fase unica y fase intercalada a partir de la epoca 10) manteniendo constante la semilla 43, lo que facilita comparaciones controladas entre configuraciones de curriculum.
- Estudios de eficiencia de tokenizers de vocabulario reducido: al emplear un tokenizer propio de 15.000 entradas sobre texto en minusculas, sirve para medir el efecto del tamano de vocabulario en la perplejidad de modelos de ~100 M de parametros.
- Generacion de texto de relleno en pruebas de infraestructura: su tamano (0,9 GB de repositorio) y su naturaleza causal lo hacen util para validar pipelines de TGI, vLLM o endpoints de Hugging Face sin consumo relevante de GPU.
- Baseline academico para experimentos de destilacion o poda: con 108,55 M de parametros es un punto de partida manejable para estudiar tecnicas de compresion y comparar la degradacion de perplejidad.
- Docencia y practicas de ajuste fino: permite entrenar y evaluar LoRA o ajuste completo en una unica GPU de consumo, ilustrando el ciclo completo de preentrenamiento, evaluacion y publicacion de un modelo causal.
- Analisis de sesgos en corpus infantiles o de baja escala: util para auditar que estereotipos y regularidades linguisticas se adquieren cuando el presupuesto de datos es muy inferior al de los modelos de produccion.
- Experimentos de continuacion de texto en aleman o griego en dominios acotados: solo recomendable en entornos de investigacion y con validacion humana de las salidas, dado que no hay evaluacion publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, perplejidad ni resultados de la tarea del BabyLM Challenge, y la busqueda web realizada no aporto ninguna referencia adicional al modelo.

## Requisitos de hardware

- VRAM estimada en inferencia (calculada a partir de 108,55 M de parametros): ~434 MB en fp32, ~217 MB en fp16/bf16, ~110 MB en int8 y ~55-60 MB en int4, mas el overhead de activaciones y cache KV, que depende de la longitud de contexto (no documentada).
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, GTX 1660 y similares; tambien es viable en CPU y en entornos gratuitos tipo Google Colab T4.
- GPU de datacenter (A100, H100, L40S) no son necesarias; solo tendrian sentido para entrenamiento a gran escala o para servir muchas replicas en paralelo.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (soporte nativo), text-generation-inference (declarado en los tags), vLLM y, previa conversion a GGUF, llama.cpp y Ollama. No se publican pesos GGUF, por lo que el uso en llama.cpp u Ollama requiere conversion propia.
- Latencia y throughput estimados: no disponibles, no se publican mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|
| Este modelo | 108.550.656 | no disponible | no disponible | safetensors |
| GPT-2 small | ~124 M | 1.024 tokens | MIT (con modificaciones de OpenAI) | safetensors y otros formatos |
| OPT-125M | ~125 M | 2.048 tokens | licencia OPT (uso no comercial) | safetensors |
| Pythia-160M | ~160 M | 2.048 tokens | Apache-2.0 | safetensors |

Comparativa de rendimiento (perplejidad, MMLU u otras metricas): no disponible para este modelo ni comparable de forma fiable, ya que no se han publicado evaluaciones. La diferencia principal frente a las alternativas es la disponibilidad de una licencia clara y de documentacion de contexto: tanto GPT-2 small, OPT-125M y Pythia-160M publican ambos datos, mientras que este modelo no declara ninguno de los dos.

## Limitaciones y advertencias

- Licencia no disponible: no puede asumirse uso comercial ni redistribucion; conviene contactar con el autor antes de cualquier despliegue.
- Ausencia total de evaluacion: no hay benchmarks, perplejidad ni validacion humana publicada, por lo que se desconoce su calidad real frente a alternativas de tamano similar.
- Riesgo elevado de alucinacion y de incoherencia a partir de pocos cientos de tokens: un modelo de 108 M de parametros y vocabulario reducido tiene una capacidad de modelado limitada en comparacion con modelos de miles de millones de parametros.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin medirla empiricamente.
- Idiomas no declarados formalmente: el aleman y el griego son una inferencia a partir del identificador del repositorio, no un dato confirmado; el rendimiento en otros idiomas es indeterminado.
- Entrenamiento sobre texto en minusculas (sufijo "lower"): la generacion puede degradarse en textos con mayusculas, puntuacion compleja o nombres propios.
- Corpus presumiblemente de baja escala y posiblemente infantil o academico: es esperable que herede sesgos ylimitaciones de dominio de dicho corpus, sin que se documente ningun proceso de mitigacion.
- Sin alineamiento documentado: no hay evidencia de RLHF, DPO o SFT, por lo que el modelo puede generar contenido inapropiado o seguir instrucciones de forma deficiente.
- Artefacto de investigacion con 0 descargas y 0 "me gusta": no ha sido validado por la comunidad.
- Metadatos anomalos: las fechas de creacion y actualizacion (2026-09-21) son posteriores a la fecha habitual de publicacion de modelos comparables; conviene verificar su vigencia antes de citarlos.

## Enlaces

- Pagina del modelo en Hugging Face: https://huggingface.co/nikitastheo/v5-babylm-15k-lower-shared-seed43-deu-ell-sequential_interleaved
- Tokenizer asociado: https://huggingface.co/nikitastheo/babylm-15k-deu-lower-seed43-tokenizer
- Perfil del autor: https://huggingface.co/nikitastheo
- Paper, blog, repositorio o demo adicionales: no disponible; la busqueda web realizada no devolvio ningun resultado relacionado con este modelo.
