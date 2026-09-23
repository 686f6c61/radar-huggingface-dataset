# rat-lab/mh-ec2-ttomd-K2-delta

## Resumen

`rat-lab/mh-ec2-ttomd-K2-delta` es un conjunto de adaptadores LoRA de investigación publicado por el usuario `rat-lab` y entrenado por Max Horwitz sobre el modelo base `vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT`. No es un modelo generativo de propósito general, sino la celda K=2 (variante "delta") de una tabla de ablación de cobertura x corrección de sesgo dentro de una línea de experimentos sobre aprendizaje de preferencias sensible al riesgo.

El entrenamiento se ejecutó localmente en el clúster UW Hyak mediante SLURM (job 40315482, finalizado el 20 de septiembre de 2026) con una única ejecución de 4680 pasos y sin reanudaciones. El algoritmo es IPO en línea (`--alg oipo1`, implementado en `risk_egpo/tt_omd.py`), con riesgo entrópico (tau = 10) y corrección de sesgo a dos escalas temporales mediante un estimador delta. El dataset de preferencias utilizado es `PKU-Alignment/PKU-SafeRLHF`.

Su relevancia es metodológica, no de producto: sirve para reproducir y auditar técnicas de optimización de preferencias con control de riesgo y corrección de sesgo, y para comparar la celda K=2 frente a otras configuraciones del mismo estudio. El repositorio registra 0 descargas y 0 "likes" y no incluye datos de evaluación ni de rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2) con adaptadores LoRA (PEFT); no es MoE ni SSM |
| Parámetros totales | Adaptadores LoRA: no disponible. Modelo base (Gemma 2 2B): ~2,6B, según el nombre del modelo base |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens, según las especificaciones públicas de Gemma 2 2B; no confirmado en la información proporcionada |
| Tipos de cuantización | no disponible (los adaptadores se distribuyen en safetensors; la cuantización depende del modelo base y del runtime) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA en `checkpoint-<step>/adapter_model.safetensors` y `adapter_config.json`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (librería `peft`) que se aplica sobre `vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT`, un Gemma 2 de 2B ajustado primero con instrucciones y después con SFT sobre Alpaca Cleaned. El adaptador no modifica la arquitectura subyacente: añade matrices de bajo rango sobre el transformer original y conserva el tokenizador del modelo base.

El procedimiento de entrenamiento es IPO (Identity Preference Optimization) en línea, con la variante `oipo1` y riesgo entrópico de parámetro tau = 10, sobre el dataset `PKU-Alignment/PKU-SafeRLHF`. La innovación metodológica es la corrección de sesgo a dos escalas temporales con un estimador tipo delta y un tamaño de paso de dos escalas gamma = 0.1. El run arranca en caliente desde `ipo-e-c10.0/checkpoint-936` con 100 pasos de warmup, genera 64 tokens nuevos como máximo y usa semilla 42. Se publican 19 checkpoints (cada 250 pasos, de 250 a 4680) sin incluir el estado de reanudación de DeepSpeed.

## Capacidades

- Generación de texto y seguimiento de instrucciones, heredados del modelo base (Gemma 2 2B ajustado con instrucciones y con SFT sobre Alpaca Cleaned).
- Optimización de preferencias orientada a seguridad: el adaptador está entrenado sobre `PKU-Alignment/PKU-SafeRLHF`, por lo que su especialización es la alineación con preferencias de seguridad, no la ampliación de capacidades.
- Control de riesgo en el objetivo de aprendizaje: la configuración usa riesgo entrópico (tau = 10), lo que introduce una noción explícita de aversión al riesgo en la optimización.
- Corrección de sesgo a dos escalas temporales con estimador delta, que es el objeto de estudio de la celda.
- Tool calling / function calling: no documentado.
- Uso como agente o razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas.
- Visión, audio, thinking mode u otras capacidades especiales: no disponibles.

## Casos de uso

- Reproducción de experimentos de IPO en línea con riesgo entrópico: el checkpoint permite reejecutar la configuración K=2 delta y comparar resultados frente a otras celdas de la tabla de cobertura x corrección de sesgo.
- Auditoría de técnicas de corrección de sesgo: el estimador delta y el esquema de dos escalas temporales (gamma = 0.1) pueden aislarse para medir su efecto frente a una línea base sin corrección.
- Estudio de aversión al riesgo en alineación: el parámetro tau = 10 define una familia de objetivos; este adaptador sirve como punto de una curva que varía el nivel de riesgo.
- Investigación sobre alineación de seguridad: el entrenamiento sobre PKU-SafeRLHF permite analizar cómo se desplaza el comportamiento del modelo base en prompts de seguridad.
- Análisis de trayectorias de entrenamiento: los 19 checkpoints (de 250 a 4680 pasos) permiten estudiar la evolución del adaptador y detectar sobreajuste o inestabilidad por paso.
- Punto de partida para fine-tuning posterior: al ser un adaptador PEFT, puede combinarse con otros adaptadores o continuarse con nuevos datos sin tocar los pesos del modelo base.
- Docencia y formación en RLHF: el repositorio documenta algoritmo, hiperparámetros, dataset, semilla y procedencia del cómputo, lo que lo hace útil como caso de estudio reproducible.
- Evaluación comparativa de checkpoints: permite medir si el checkpoint final (4680) es preferible al intermedio en las métricas del estudio, dado que no se garantiza monotonía.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, MT-Bench, AlpacaEval ni de win-rate frente a otros modelos, y tampoco se aportan curvas de recompensa o de pérdida del entrenamiento.

## Requisitos de hardware

- Tamaño del repositorio: 1,9 GB, correspondiente a 19 checkpoints de adaptadores LoRA más ficheros de tokenizador.
- Para inferencia es necesario cargar el modelo base Gemma 2 2B (~2,6B parámetros) además del adaptador.
- VRAM estimada en FP16/BF16: en torno a 5 GB para los pesos del base más el coste de activaciones y caché KV; del orden de 6-8 GB con contexto moderado.
- VRAM estimada en cuantización de 8 bits: aproximadamente 3 GB. En 4 bits: aproximadamente 2 GB.
- GPU consumer compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores, RTX 4090; el modelo cabe holgadamente en cualquiera de ellas.
- GPU de centro de datos: A100, H100, L40S o similares, aunque están sobredimensionadas para un modelo de este tamaño.
- Opciones de despliegue: `transformers` + `peft` (ruta recomendada por el autor); vLLM y TGI admiten adaptadores LoRA; llama.cpp y Ollama requieren fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `rat-lab/mh-ec2-ttomd-K2-delta` | LoRA sobre Gemma 2 2B (~2,6B) | 8192 (heredado) | no disponible | HuggingFace, 0 descargas | Artefacto de investigación; IPO en línea con riesgo entrópico y corrección de sesgo |
| `vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT` | ~2,6B | 8192 | no disponible | HuggingFace (modelo base) | Mismo modelo sin el adaptador; sirve de referencia para medir el efecto del entrenamiento |
| Gemma 2 2B Instruct (Google) | ~2,6B | 8192 | Términos de uso de Gemma | HuggingFace y Vertex AI | Referencia instructiva de propósito general; no especializada en preferencias |

No hay datos de benchmarks en la información proporcionada que permitan comparar el rendimiento de estos modelos. La comparación relevante en este caso es algorítmica (IPO en línea con riesgo entrópico frente a DPO, KTO u otras variantes del mismo estudio), no de capacidad bruta.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo listo para producción: 0 descargas, 0 "likes", pipeline no declarado y sin evaluación publicada.
- No declara licencia. El uso comercial queda indeterminado y, en la práctica, hereda las condiciones del modelo base Gemma 2, sujetas a los términos de uso de Google.
- No se especifican idiomas soportados; el comportamiento multilingüe no está caracterizado.
- No hay evaluación de sesgos ni de seguridad posterior al entrenamiento, más allá del dataset de preferencias empleado.
- Riesgo de alucinación alto por tratarse de un modelo base de ~2,6B parámetros; el adaptador no corrige esta limitación.
- El adaptador está optimizado para un objetivo concreto (riesgo entrópico, tau = 10) y una distribución de datos concreta (PKU-SafeRLHF); el comportamiento fuera de esa distribución no está medido.
- Se publican 19 checkpoints y no se indica cuál es el recomendado; el último paso no tiene por qué ser el mejor.
- No se incluye el estado de reanudación de DeepSpeed, por lo que no es posible continuar el entrenamiento exactamente desde el punto en que quedó.
- La ventana de contexto está limitada a 8192 tokens (heredada de Gemma 2 2B) y no se documenta ninguna extensión.
- El nombre del repositorio y sus etiquetas remiten a una metodología interna (`tt_omd`, `oipo1`) poco documentada fuera de la model card, lo que dificulta la validación independiente.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/rat-lab/mh-ec2-ttomd-K2-delta
- Modelo base: https://huggingface.co/vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT
- Dataset de preferencias: https://huggingface.co/datasets/PKU-Alignment/PKU-SafeRLHF
- Modelo Gemma 2 2B Instruct (referencia): https://huggingface.co/google/gemma-2-2b-it
- Implementación citada por el autor: fichero `risk_egpo/tt_omd.py` (no se proporciona URL del repositorio)
- Búsqueda web: no se encontraron papers, blogs, repositorios ni demos relacionados con el modelo. Los resultados devueltos por la búsqueda tratan sobre la especie animal "rata" y no guardan relación con este artefacto.
