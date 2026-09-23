# rat-lab/mh-ec2-ttomd-K8-delta

## Resumen

mh-ec2-ttomd-K8-delta es un adaptador LoRA de investigación desarrollado por rat-lab (entrenado localmente por Max Horwitz en el clúster UW Hyak, trabajo SLURM 40342540, finalizado el 22 de septiembre de 2026) sobre el modelo base vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT, que a su vez deriva de Gemma 2 2B instruct. No es un modelo de propósito general: es un artefacto experimental que materializa una celda concreta (K=8, estimador delta) de una tabla de experimentos de aprendizaje de preferencias sensible al riesgo.

El adaptador se ha entrenado con el algoritmo online IPO (variante `oipo1`, implementación `risk_egpo/tt_omd.py`) sobre el dataset PKU-Alignment/PKU-SafeRLHF, con riesgo entrópico de parámetro tau = 10, corrección de sesgo a dos escalas temporales (two-timescale) y estimador basado en el método delta. La ejecución completa consta de 4680 pasos en un único trabajo, sin reanudación, con 1000 pasos de calentamiento desde el SFT, tamaño de paso TT gamma = 0,1, cobertura K = 8, semilla 42 y generación de 64 tokens nuevos como máximo durante el entrenamiento.

Su relevancia es puramente metodológica: sirve para reproducir y auditar una configuración concreta de corrección de sesgo en preference optimization, y para compararla con otras celdas de la misma matriz experimental (por ejemplo, la variante con estimador jackknife `mh-ec2-ttomd-K8-jk`). El repositorio no declara licencia, idiomas, pipeline ni resultados de evaluación, y en el momento de redactar esta ficha acumula 0 descargas y 0 likes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2 2B) con adaptadores LoRA inyectados mediante PEFT |
| Parámetros totales | No disponible para el adaptador (rango y módulos objetivo no declarados). El modelo base Gemma 2 2B tiene ~2,6 mil millones de parámetros, dato no incluido en la model card del adaptador |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card del adaptador (el modelo base Gemma 2 2B soporta 8192 tokens segun su documentacion oficial) |
| Tipos de cuantización | No disponible. El adaptador se distribuye en safetensors sin cuantizar; la cuantización se aplicaría al modelo base tras el merge |
| Idiomas soportados | No disponible (no declarado; el modelo base Gemma 2 es multilingüe) |
| Licencia | No disponible (no declarada en el repositorio) |
| Formato de pesos | safetensors (`adapter_model.safetensors` + `adapter_config.json`) por checkpoint, más ficheros de tokenizer |
| Biblioteca | peft |
| Modelo base | vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT |
| Dataset de preferencias | PKU-Alignment/PKU-SafeRLHF |
| Algoritmo | Online IPO (`--alg oipo1`), implementación `risk_egpo/tt_omd.py` |
| Riesgo | Entrópico, tau = 10 (`--risk entropic --risk_c 10.0`) |
| Corrección de sesgo | Two-timescale, estimador método delta |
| Cobertura | K = 8 (`--ypp_samples 8`) |
| Tamaño de paso TT | gamma = 0,1 |
| Inicialización | Desde SFT, 1000 pasos de calentamiento |
| Generación en entrenamiento | 64 tokens nuevos como máximo |
| Semilla | 42 |
| Pasos totales | 4680 en un único trabajo, sin reanudación |
| Checkpoints | 10 (468, 936, ..., 4680; cada 468 pasos) |
| Tamaño del repositorio | 1,0 GB |
| Creado / actualizado | 2026-09-23 / 2026-09-23 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador no introduce cambios arquitectónicos: es un conjunto de matrices LoRA de bajo rango acopladas a un transformer decoder-only Gemma 2 2B previamente ajustado con instrucciones (SFT sobre alpaca-cleaned, del autor vectorzhou). El entrenamiento se realizó con online IPO como objetivo de optimización de preferencias, una formulación tipo DPO/IPO que opera sobre pares de respuestas generadas en línea en lugar de un dataset estático de pares. La configuración experimental fija la cobertura a K = 8 muestras por prompt y aplica una penalización de riesgo entrópico con tau = 10, lo que permite controlar la sensibilidad al riesgo de la política resultante.

La innovación metodológica está en el mecanismo de corrección de sesgo: se emplea un esquema two-timescale con un estimador basado en el método delta, que corrige el sesgo de las estimaciones de gradiente obtenidas con un número finito de muestras (K = 8). El ajuste se ejecutó durante 4680 pasos completos en un solo trabajo de SLURM, tras 1000 pasos de calentamiento partiendo del SFT, con semilla 42, generación limitada a 64 tokens nuevos y tamaño de paso TT gamma = 0,1. El autor indica explícitamente que esta ejecución se repitió a través de `tt_omd.py` para que quedara emparejada en implementación con `mh-ec2-ttomd-K8-jk`; una ejecución anterior con la misma celda K=8 delta usaba la implementación TT de `tt_eg.py` y no corresponde a este repositorio.

No se especifican en la model card el número total de tokens de entrenamiento, la composición exacta del dataset más allá de PKU-Alignment/PKU-SafeRLHF, ni detalles sobre la GPU o el presupuesto de cómputo empleados. Tampoco se documenta el rango de las matrices LoRA ni los módulos objetivo.

## Capacidades

- Generación de texto condicionada por instrucciones, heredada del modelo base Gemma 2 2B instruct ajustado con alpaca-cleaned. El adaptador modifica el estilo y la política de respuesta hacia el objetivo de online IPO con riesgo entrópico.
- Optimización de preferencias: el adaptador encapsula una política entrenada con señales de preferencia del dataset PKU-SafeRLHF, orientada a la celda K=8 con corrección de sesgo two-timescale.
- Reproducibilidad experimental: los 10 checkpoints intermedios (468 a 4680) permiten analizar la evolución de la política a lo largo del entrenamiento.
- Comparabilidad controlada: la ejecución está emparejada en implementación con la variante `mh-ec2-ttomd-K8-jk`, lo que habilita comparaciones entre estimadores (método delta frente a jackknife).
- Capacidades multilingües: no declaradas. Al heredar Gemma 2 2B, es esperable cierto soporte multilingüe, pero no está verificado ni documentado en esta ficha.
- Tool calling / function calling: no disponible. No se declara soporte.
- Modo agente o razonamiento multi-paso: no disponible. No se declara soporte.
- Capacidades especiales (visión, audio, modo thinking): no disponibles. El modelo base es exclusivamente de texto.
- Ventana de generación: la model card indica 64 tokens nuevos como máximo durante el entrenamiento, un valor configurado para el cálculo de recompensas, no una garantía de la longitud de salida en inferencia.

## Casos de uso

- Reproducción de experimentos de preference optimization: cargar el checkpoint 4680 con PEFT sobre el modelo base y volver a ejecutar el pipeline `risk_egpo/tt_omd.py` para verificar que la ejecución de 4680 pasos es reproducible con semilla 42.
- Estudio de ablación de la rejilla cobertura × debiasing: este adaptador representa la celda K=8 con estimador delta; compararlo con las celdas restantes de la matriz permite aislar el efecto de la cobertura y del método de corrección de sesgo.
- Investigación sobre riesgo entrópico: analizar cómo tau = 10 modifica el comportamiento de la política frente a valores menores o mayores, midiendo la distribución de recompensas y la varianza entre muestras.
- Auditoría de seguridad en modelos pequeños: evaluar la política resultante sobre prompts de seguridad de PKU-SafeRLHF para estudiar si la corrección de sesgo degrada o mejora la tasa de respuestas dañinas en un modelo de 2,6 B.
- Comparación de estimadores de sesgo: contrastar este adaptador con `mh-ec2-ttomd-K8-jk` (misma configuración pero estimador jackknife) para cuantificar diferencias en la magnitud del sesgo residual y en la estabilidad del entrenamiento.
- Análisis de dinámica de entrenamiento: los 10 checkpoints guardados cada 468 pasos permiten trazar curvas de métricas de preferencia frente a pasos y detectar inestabilidades o colapso de la política.
- Prototipado de bajo coste en GPU de consumo: fusionar el LoRA con el modelo base y desplegar un endpoint de 2,6 B en una RTX 3060 de 12 GB o en un Apple Silicon con 16 GB de memoria unificada para demos internas de alineamiento.
- Docencia y formación en RLHF: usar el par adaptador + base como ejemplo completo y reproducible de pipeline de optimización de preferencias con corrección de sesgo en un clúster SLURM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas de MMLU, HumanEval, GSM8K, MT-Bench, AlpacaEval ni de win-rate frente a la política de referencia, ni tampoco curvas de recompensa o de KL. No se dispone, por tanto, de evidencia cuantitativa sobre la calidad de la política resultante.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: el modelo base de ~2,6 mil millones de parámetros ocupa aproximadamente 5,2 GB solo en pesos, más caché KV. El adaptador añade una sobrecarga pequeña (el repositorio completo con 10 checkpoints ocupa 1,0 GB, es decir, del orden de 100 MB por checkpoint).
- Cuantización: no declarada para el adaptador. Si se fusiona con el base, un transformer denso de este tamaño es cuantizable a 8 bits (en torno a 3 GB) o 4 bits (en torno a 1,6-2 GB) con las herramientas habituales.
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y en equipos Apple Silicon con 16 GB de memoria unificada o más. Con 8 GB es viable en cuantización de 8 o 4 bits.
- GPU de centro de datos: cualquier A100, H100, L40S, L4 o T4 resulta sobredimensionada para este tamaño; son útiles para barridos masivos de evaluación en paralelo.
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador mediante `PeftModel.from_pretrained` con `subfolder="checkpoint-4680"`), fusión del LoRA en el modelo base y servicio con vLLM, TGI o llama.cpp/Ollama. No se documenta compatibilidad probada con ninguno de estos servidores.
- Latencia y throughput: no disponibles. No se publican mediciones.
- Hardware de entrenamiento: no disponible. La model card solo indica el clúster UW Hyak y el identificador de trabajo SLURM 40342540.
- Almacenamiento: el repositorio completo ocupa 1,0 GB; para usar un único checkpoint basta con descargar la subcarpeta correspondiente. No se incluye el estado de reanudación de DeepSpeed.

## Comparativa con modelos similares

La comparación se establece a nivel de modelo base, ya que el adaptador no publica métricas propias. Los datos de arquitectura y licencia de las alternativas provienen de su documentación oficial y no se han verificado en la model card de este repositorio.

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rat-lab/mh-ec2-ttomd-K8-delta | Adaptador LoRA de investigación sobre SFT | No declarados (base ~2,6 B) | No declarado (base: 8192) | No disponible | HuggingFace, 0 descargas |
| vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT | Modelo base del adaptador (SFT) | ~2,6 B | No declarado | No disponible en esta ficha | HuggingFace |
| google/gemma-2-2b-it | Modelo instruct de referencia | ~2,6 B | 8192 tokens | Gemma Terms of Use | HuggingFace, muy extendido |
| Qwen2.5-3B-Instruct | Modelo instruct denso de tamaño similar | ~3 B | 32 768 tokens | Apache 2.0 | HuggingFace, muy extendido |
| Llama-3.2-3B-Instruct | Modelo instruct denso de tamaño similar | ~3 B | 128 000 tokens | Llama 3.2 Community License | HuggingFace, muy extendido |

Frente a estas alternativas, el valor diferencial de `mh-ec2-ttomd-K8-delta` no es el rendimiento bruto (no hay datos que lo respalden) sino el hecho de ser un artefacto reproducible de un método concreto de corrección de sesgo en preference optimization, con 10 checkpoints intermedios y parámetros de ejecución completamente especificados.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo listo para producción: no hay evaluación, ni benchmarks, ni métricas de seguridad publicadas.
- Licencia no declarada. Esto bloquea cualquier uso comercial o redistribución con seguridad jurídica hasta que el autor la explicite.
- Idiomas no declarados. No se puede asumir cobertura multilingüe verificada, aunque el modelo base sea multilingüe.
- No es autónomo: requiere descargar y cargar el modelo base `vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT`, sujeto a su propia licencia y condiciones.
- El dataset PKU-Alignment/PKU-SafeRLHF tiene sus propios términos de uso; el adaptador deriva de datos de preferencias sobre seguridad y puede heredar sesgos de anotación de ese corpus.
- Riesgo de alucinación: no medido. Al ser un ajuste de preferencias sobre un modelo de 2,6 B, la tasa de alucinación puede ser elevada y no se ha caracterizado.
- Alcance experimental muy restringido: la configuración está atada a una celda concreta (K=8, estimador delta, tau = 10, gamma = 0,1). Los resultados no se generalizan a otras celdas de la matriz.
- Durante el entrenamiento la generación se limitó a 64 tokens nuevos; el comportamiento en respuestas largas no está caracterizado.
- Ejecución única con semilla 42 y sin reanudación, lo que impide estimar la varianza entre semillas a partir de este repositorio.
- No se incluye el estado de reanudación de DeepSpeed, por lo que no es posible retomar el entrenamiento exactamente desde el punto en que se dejó.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validación independiente por parte de la comunidad.
- Fechas de creación y actualización en 2026, coherentes con el trabajo SLURM indicado; conviene verificar la vigencia del modelo base antes de reutilizarlo.
- Riesgo de sobreajuste al objetivo de preferencia y de degradación de capacidades generales (olvido catastrófico) tras 4680 pasos de optimización online IPO; no hay evaluaciones que lo descarten.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rat-lab/mh-ec2-ttomd-K8-delta
- Modelo base: https://huggingface.co/vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT
- Modelo instruct subyacente: https://huggingface.co/google/gemma-2-2b-it
- Dataset de preferencias: https://huggingface.co/datasets/PKU-Alignment/PKU-SafeRLHF
- Organización PKU-Alignment: https://huggingface.co/PKU-Alignment
- Biblioteca PEFT: https://github.com/huggingface/peft
- Transformers: https://github.com/huggingface/transformers
- Repositorio emparejado citado en la model card (`mh-ec2-ttomd-K8-jk`): no disponible como enlace directo en la información proporcionada
- Implementación del algoritmo (`risk_egpo/tt_omd.py`): no disponible como enlace público en la información proporcionada
- Nota sobre la búsqueda web: los resultados devueltos no guardan relación con el modelo (corresponden a páginas sobre el animal «rata» y a una oferta de suscripción de Canal+). No se han encontrado papers, blogs ni demos asociados a esta ejecución experimental.
