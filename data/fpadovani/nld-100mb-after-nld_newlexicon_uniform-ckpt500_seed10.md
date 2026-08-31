# fpadovani/nld-100mb-after-nld_newlexicon_uniform-ckpt500_seed10

## Resumen

`fpadovani/nld-100mb-after-nld_newlexicon_uniform-ckpt500_seed10` es un modelo de lenguaje de ~125 millones de parámetros basado en la arquitectura GPT-2, desarrollado por fpadovani como parte de un proyecto de investigación de la Universidad de Groningen (visible en el enlace de Weights & Biases asociado al entrenamiento). Se trata de un fine-tuning por SFT (supervised fine-tuning) del modelo base `fpadovani/ppt-nld_newlexicon_uniform-100mb_seed10`, entrenado con la librería TRL de HuggingFace.

El nombre del modelo revela su propósito experimental: pertenece a la familia "ppt_art_lang", un proyecto que estudia el efecto de léxicos artificiales ("newlexicon") en el aprendizaje de modelos de lenguaje. El sufijo "uniform" indica que el nuevo léxico se generó con una distribución de frecuencias uniforme (frente a otras variantes con distribución Zipf), y "ckpt500_seed10" identifica el checkpoint 500 de entrenamiento con semilla aleatoria 10. El prefijo "nld" sugiere que el corpus base es neerlandés, aunque la model card no declara idiomas explícitamente.

Es un modelo de investigación, no un producto orientado a producción. Su relevancia radica en que permite comparar cómo un modelo aprende cuando se sustituye el vocabulario natural por uno artificial controlado, un experimento clave en lingüística computacional y en el estudio de los mecanismos internos de los transformers. No se han publicado resultados de benchmarks para este modelo concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only) |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el prefijo "nld" sugiere neerlandés, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 estándar: un transformer decoder-only con atención causal, tal y como indica la etiqueta `gpt2` en HuggingFace. Con 124,77 millones de parámetros, se corresponde con el tamaño "small" de la familia GPT-2. El modelo fue entrenado mediante fine-tuning supervisado (SFT) usando la librería TRL 0.23.0 sobre el modelo base `fpadovani/ppt-nld_newlexicon_uniform-100mb_seed10`, que a su vez fue preentrenado sobre 100 MB de texto (según el sufijo "100mb" del nombre) con un léxico artificial de distribución uniforme.

El entrenamiento se registró en Weights & Biases bajo el proyecto `ppt_art_lang` de la Universidad de Groningen. Las versiones de las librerías utilizadas son Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. El checkpoint 500 (ckpt500) indica que se guardó el estado del modelo tras 500 pasos de optimización. No se dispone de información sobre el dataset exacto de fine-tuning, el número de tokens totales ni si se aplicaron técnicas adicionales como RLHF o DPO.

## Capacidades

- Generación de texto autocompletiva: el modelo genera continuaciones de texto a partir de un prompt, como muestra el ejemplo de "quick start" de la model card.
- Interfaz de chat básica: el ejemplo de uso emplea el formato de mensajes con roles (`user`, `assistant`), lo que indica compatibilidad con el pipeline de chat de Transformers.
- Generación condicionada por instrucciones: al ser un fine-tuning SFT, responde a preguntas planteadas en lenguaje natural, como la pregunta sobre máquinas del tiempo del ejemplo.
- Investigación experimental: su capacidad principal es servir como objeto de estudio para analizar cómo un modelo aprende representaciones lingüísticas con un léxico artificial controlado.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Investigacion en lingüistica computacional: el modelo permite estudiar cómo la estructura del léxico (uniforme frente a Zipf) afecta al aprendizaje de regularidades gramaticales y semánticas en transformers de tamaño pequeño.
- Analisis comparativo de lenguajes artificiales: junto con los modelos hermanos (baseline, zipf, heavy), sirve para aislar el efecto de la distribución de frecuencias del vocabulario en el rendimiento final del modelo.
- Estudio de la adquisicion de sintaxis: al controlar el vocabulario, los investigadores pueden rastrear qué patrones sintácticos emergen sin la interferencia de frecuencias naturales del lenguaje.
- Reproduccion de experimentos en ciencia abierta: el checkpoint 500 con semilla 10 permite reproducir exactamente los resultados del estudio y comparar con otras semillas (seed455) y configuraciones.
- Docencia en PLN: por su tamaño reducido (125M), es util en cursos universitarios para demostrar tecnicas de fine-tuning con TRL y analisis de representaciones internas.
- Validacion de hipotesis sobre el impacto del vocabulario en modelos pequeños: sirve como banco de pruebas para experimentos controlados sin necesidad de recursos computacionales elevados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye mediciones de MMLU, HumanEval, GSM8K ni otros evaluadores estandar. Tampoco se encontraron referencias externas con datos de rendimiento para este modelo especifico. Dado su caracter experimental y su tamano reducido, no se espera que compita con modelos generalistas de mayor escala.

## Requisitos de hardware

- VRAM estimada para inferencia: con 124,77 millones de parámetros, el modelo ocupa aproximadamente 500 MB en FP32, 250 MB en FP16 y unos 125 MB en int8. Cabe sin problemas en cualquier GPU consumer actual.
- GPUs recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Una RTX 3060, RTX 4060 o incluso una GPU integrada moderna pueden ejecutar inferencia sin problemas.
- Compatibilidad con GPUs consumer: sí, es un modelo muy ligero que tambien puede ejecutarse en CPU con latencias aceptables (del orden de segundos por generacion de 128 tokens).
- Opciones de despliegue: al ser un modelo de la familia GPT-2 con pesos en safetensors, es compatible con Transformers (pipeline de text-generation), vLLM, llama.cpp (si se convierte a GGUF), Ollama y Text Generation Inference (TGI). La etiqueta `endpoints_compatible` en HuggingFace confirma compatibilidad con la infraestructura de inferencia de HuggingFace.
- Latencia y throughput: no hay datos publicados. Como referencia orientativa para un modelo de 125M en una GPU moderna, la generacion de 128 tokens suele tardar menos de un segundo.

## Comparativa con modelos similares

La familia de modelos del proyecto `ppt_art_lang` incluye varias variantes comparables:

| Modelo | Parametros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| nld-100mb-after-nld_newlexicon_uniform-ckpt500_seed10 (este) | 124,77M | no disponible | SFT sobre base con lexico uniforme | no disponible |
| nld-100mb-after-newlexicon-nld-baseline-ckpt500_seed10 | no disponible | no disponible | SFT sobre base baseline (lexico natural) | no disponible |
| nld-100mb-after-newlexicon-nld-baseline-ckpt500_seed455 | no disponible | no disponible | Misma configuracion, semilla 455 | no disponible |
| ppt-art-lang-newlexicon-zipf-nld-heavy-baseline-100mb_seed10 | 86,7M | no disponible | Lexico artificial con distribucion Zipf | no disponible |

Los modelos de esta familia se diferencian principalmente en la distribucion del lexico artificial (uniforme, Zipf, baseline) y en la semilla aleatoria. No se dispone de datos de rendimiento comparativos entre ellos.

## Limitaciones y advertencias

- Modelo de investigacion: no esta disenado ni validado para uso en produccion. Su unico proposito es experimental.
- Sin licencia clara: la model card indica "licence: license" y HuggingFace reporta "no disponible". No se puede asumir permisos de uso comercial sin consultar al autor.
- Sin datos de sesgos: no se ha realizado ninguna evaluacion de sesgos de genero, raza o ideologicos. Al estar entrenado sobre 100 MB de texto, es probable que refleje sesgos presentes en el corpus original.
- Riesgo de alucinacion elevado: por su tamano reducido y entrenamiento limitado, las respuestas pueden ser incoherentes o inventar informacion. No es adecuado para tareas factuales.
- Idiomas no confirmados: aunque el prefijo "nld" sugiere neerlandes, la model card no declara los idiomas soportados. El lexico artificial podria afectar a la generacion en cualquier idioma natural.
- Longitud de contexto desconocida: no se especifica la ventana de contexto. Si hereda la de GPT-2 base, seria de 1024 tokens, pero no esta confirmado.
- Sin benchmarks: no hay datos objetivos de rendimiento, lo que impide evaluar su calidad relativa frente a otros modelos.
- Repositorio de 3,2 GB para un modelo de 125M: el tamano del repo sugiere que incluye archivos adicionales (posibles checkpoints intermedios o estados de optimizador), lo que puede complicar la descarga en entornos con poco ancho de banda.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/nld-100mb-after-nld_newlexicon_uniform-ckpt500_seed10
- Modelo base: https://huggingface.co/fpadovani/ppt-nld_newlexicon_uniform-100mb_seed10
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/ppt_art_lang/runs/y9wn2e1l
- Modelo hermano (baseline seed10): https://huggingface.co/fpadovani/nld-100mb-after-newlexicon-nld-baseline-ckpt500_seed10
- Modelo hermano (baseline seed455): https://huggingface.co/fpadovani/nld-100mb-after-newlexicon-nld-baseline-ckpt500_seed455
- Modelo hermano en japones: https://huggingface.co/fpadovani/jpn-100mb-after-jpn-baseline-newlexicon-ckpt500_seed10
- Libreria TRL: https://github.com/huggingface/trl
