# aytsrndl/constitutional-classifiers-repro

## Resumen

`aytsrndl/constitutional-classifiers-repro` no es un modelo generativo al uso, sino un repositorio de reproduccion del pipeline descrito en Sharma et al., "Constitutional Classifiers: Defending against Universal Jailbreaks across Thousands of Hours of Red Teaming" (arXiv:2501.18837). El artefacto implementa el entrenamiento de dos clasificadores de seguridad (uno de entrada y otro de salida en streaming) sobre backbones abiertos de la familia Qwen2.5, con el objetivo de mitigar jailbreaks universales en modelos de lenguaje. Lo publica el usuario `aytsrndl` bajo licencia Apache 2.0.

La propuesta del paper original es escribir una "constitucion" con categorias daninas y benignas, generar datos sinteticos condicionados a ella, aumentar composicionalmente los ejemplos y entrenar los dos clasificadores. Esta reproduccion sustituye el generador Claude del paper por Qwen2.5-7B-Instruct y el backbone clasificador Claude 3.5 Haiku por Qwen2.5-1.5B base, reduciendo el volumen de datos de ~70K+ prompts a ~15-20K ejemplos y el coste computacional a un presupuesto pequeno.

Su relevancia es metodologica: ofrece scripts ejecutables (construccion de dataset, entrenamiento de ambos clasificadores, evaluacion con red team y calibracion de umbral) y una comparacion honesta entre modelo sin guardas, con clasificador de entrada y con entrada+salida. No es un modelo listo para produccion ni un checkpoint con pesos publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificadores sobre transformer decoder-only (Qwen2.5-1.5B base como backbone); pipeline con generador Qwen2.5-7B-Instruct |
| Parametros totales | 1.5B (backbone clasificador); 7B (generador de datos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el repositorio contiene scripts y configuracion, no se especifican pesos publicados) |

## Arquitectura y entrenamiento

El pipeline reproduce los cuatro pasos del paper. Primero se define una constitucion (`constitution.yaml`) con 6 categorias daninas y 3 benignas, centrada en CBRN y quimica. Segundo, `scripts/build_dataset.py` genera semillas daninas desde PKU-Alignment/BeaverTails y semillas benignas desde OR-Bench-80k, BeaverTails safe y Q&A near-boundary condicionadas por la constitucion, y aplica aumentacion compositional con vLLM (parafrasis, variacion de system prompt, pre-fill del asistente, leetspeak y generacion near-boundary). Tercero, `scripts/train_input_classifier.py` entrena un clasificador de entrada con TRL `SFTTrainer` usando `completion_only_loss=True` para producir un veredicto de un solo token ("yes"/"no"). Cuarto, `scripts/train_output_classifier.py` entrena un clasificador de salida en streaming con una value head por prefijo y la perdida de la Eq. 1 del paper, con un ramp de omega de 0 a 1 que alcanza 1 en las tres cuartas partes del entrenamiento.

Los hiperparametros no publicados por el paper se fijan como defaults en el codigo: lambda (peso del regularizador NTP) = 0.5, learning rate del clasificador de salida = 1e-5, 1 epoca, batch efectivo 32 (alineado con el estudio companion de Anthropic). Las transformaciones reservadas para evaluacion (nunca vistas en aumentacion) son base64, roleplay multi-turno y encuadre experto. El autor advierte que la calidad del generador Claude fue un factor clave en los numeros del paper, por lo que una pipeline con semillas publicas quedara por debajo del 0.5% de ASR reportado.

## Capacidades

- Clasificacion de seguridad de prompts de entrada: veredicto binario "yes"/"no" sobre si el prompt cae en una categoria danina de la constitucion.
- Clasificacion de salida en streaming: evaluacion por prefijo mediante value head, apta para bloquear generaciones a medida que se producen.
- Generacion sintetica de datos de entrenamiento condicionada por constitucion (via Qwen2.5-7B-Instruct y vLLM).
- Aumentacion compositional de datos: parafrasis, variacion de system prompt, pre-fill, leetspeak y generacion near-boundary.
- Evaluacion con red team automatizado: suite de 60 ataques, juez LLM con rubrica y calibracion de umbral.
- Simulacion de guardrails combinando clasificador de entrada y de salida.
- Registro de metricas en Trackio y publicacion de artefactos al Hub.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Evaluacion de robustez frente a jailbreaks: el repositorio permite reproducir la comparacion entre modelo sin guardas, con clasificador de entrada y con entrada+salida, midiendo ASR y FPR sobre una suite de ataques con transformaciones reservadas.
- Investigacion en seguridad de LLM: sirve como base reproducible para estudiar el efecto de la constitucion, la aumentacion y los datos near-boundary en la robustez, con scripts versionados y hiperparametros explicitos.
- Prototipado de guardrails en pipelines propios: los scripts de clasificador de entrada y salida pueden adaptarse a otros backbones Qwen2.5 para filtrar prompts y generaciones en un entorno controlado.
- Generacion de datasets de seguridad sinteticos: `build_dataset.py` produce pares prompt-respuesta daninos y benignos condicionados por constitucion, utiles para entrenar o evaluar otros clasificadores.
- Auditoria de sesgos de clasificadores de seguridad: la calibracion de umbral y el calculo de FPR sobre pools como WildChat y OR-Bench permiten medir falsos positivos en contenido experto (el paper reporta 26% FPR en GPQA-Chemistry a pequena escala).
- Docencia y formacion: el pipeline completo, con constitucion YAML, scripts y comandos de ejecucion, es un material didactico para explicar como se entrena y evalua un clasificador constitucional de extremo a extremo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card cita como referencia los numeros del paper original (ASR 14% → 0.5% con ambos clasificadores, +0.38% de rechazos en Claude.ai, 26% FPR en GPQA-Chemistry), pero no reporta metricas de esta reproduccion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia de orden de magnitud, un backbone de 1.5B en fp16 requiere aproximadamente 3 GB de pesos, y el generador de 7B en fp16 aproximadamente 14 GB, pero estas cifras no las publica el autor.
- GPU recomendadas: no disponible. El pipeline usa vLLM para aumentacion, lo que sugiere GPUs con suficiente memoria para servir Qwen2.5-7B-Instruct, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: vLLM (usado en `build_dataset.py`), TRL `SFTTrainer` para entrenamiento y Trackio para metricas. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| constitutional-classifiers-repro (este) | 1.5B backbone + 7B generador | no disponible | Reproduccion de clasificadores constitucionales | apache-2.0 | Repositorio de scripts en HF |
| Constitutional Classifiers (Sharma et al., 2025) | no disponible (Claude 3.5 Haiku como backbone) | no disponible | Clasificadores constitucionales originales | no disponible | Paper; sin pesos publicos |
| Llama Guard (familia) | no disponible en esta informacion | no disponible | Clasificacion de seguridad de prompts y respuestas | no disponible | Pesos publicos en HF |
| ShieldGemma (familia) | no disponible en esta informacion | no disponible | Clasificacion de contenido danino | no disponible | Pesos publicos en HF |

La comparacion con Llama Guard y ShieldGemma es categorica (clasificadores de seguridad), no de rendimiento: no se dispone de metricas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo ni un checkpoint listo para produccion: el repositorio contiene scripts y configuracion, no se confirma la publicacion de pesos entrenados.
- El autor advierte que el ASR de esta reproduccion quedara por debajo de los numeros del paper (0.5%) por la menor calidad del generador de datos y el menor volumen (~15-20K ejemplos frente a ~70K+).
- El ASR se mide con un juez LLM sobre una suite de 60 ataques, no con 3.000+ horas de red teaming humano como en el paper.
- Se espera un FPR alto en contenido experto a pequena escala: el propio paper reporta 26% de FPR en GPQA-Chemistry.
- La evaluacion usa analogos seguros de consultas CBRN (20 consultas de quimica de doble uso), no material peligroso real.
- La constitucion incluida esta centrada en CBRN y quimica; no cubre todas las categorias de dano posibles.
- Hiperparametros no publicados por el paper (lambda, LR del clasificador de salida, epocas, batch) se fijan como defaults del autor, lo que introduce desviaciones respecto al original.
- Sesgos conocidos, idiomas soportados y rendimiento multilingue: no disponibles en la informacion proporcionada.
- Licencia Apache 2.0 permite uso comercial del codigo, pero el autor no garantiza robustez en produccion; el uso como guardrail requiere validacion propia.

## Enlaces

- Hugging Face: https://huggingface.co/aytsrndl/constitutional-classifiers-repro
- Paper de referencia: https://arxiv.org/abs/2501.18837
- Dataset de BeaverTails: https://huggingface.co/datasets/PKU-Alignment/BeaverTails
- Dataset OR-Bench-80k: https://huggingface.co/datasets/bench-llm/or-bench
- Dataset WildChat: https://huggingface.co/datasets/allenai/WildChat
- Modelo generador: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Backbone clasificador: https://huggingface.co/Qwen/Qwen2.5-1.5B
- ML Intern: https://hf.co/chat?mode=ml-intern
