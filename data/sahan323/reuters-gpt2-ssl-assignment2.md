# sahan323/reuters-gpt2-ssl-assignment2

## Resumen

Reuters GPT-2 - Assignment 02 es un modelo de lenguaje causal de pequeno tamano entrenado desde cero (pesos inicializados aleatoriamente, sin partir de los pesos oficiales de GPT-2) sobre un corpus de articulos de Reuters. Lo publica el usuario sahan323 en Hugging Face como entrega de un trabajo academico (asignatura o "assignment" 02), con dos variantes entrenadas durante 2 y 5 epocas respectivamente. El objetivo declarado no es competir con modelos de produccion, sino demostrar el flujo completo de entrenamiento auto-supervisado de un transformer causal, incluido un tokenizador propio.

Arquitectonicamente es un transformer decoder-only de estilo GPT-2 muy reducido: 4 capas, 4 cabezas de atencion, dimension de embedding de 256 y una longitud de contexto de solo 256 tokens, con un vocabulario de 52.000 entradas definido por el tokenizador `ingeniumacademy/gpt2-reuters-tokenizer`. El repositorio ocupa aproximadamente 0,1 GB y contiene los pesos en formato safetensors, junto con historiales de entrenamiento y resumenes de evaluacion.

Su relevancia es fundamentalmente didactica y de reproduccion: sirve como referencia para quien quiera estudiar el entrenamiento de un modelo causal de punta a punta, la construccion de un tokenizador especifico de dominio (prensa economica) o la evaluacion mediante perplejidad y prediccion de siguiente token. No es un modelo adecuado para tareas de produccion, razonamiento complejo ni generacion longeva, dado su tamano, contexto y naturaleza de ejercicio academico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM) estilo GPT-2 |
| Parametros totales | no disponible (arquitectura de 4 capas, 4 cabezas, dim 256, vocab 52.000) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (via transformers); tokenizador propio incluido en el repo |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso de tipo GPT-2 con una configuracion muy compacta: 4 capas de transformer, 4 cabezas de atencion, dimension de embedding de 256 y vocabulario de 52.000 tokens. La longitud de contexto es de 256 tokens, lo que limita severamente cualquier tarea que requiera memoria a medio o largo plazo. Se publican dos checkpoints independientes, uno entrenado durante 2 epocas y otro durante 5 epocas, ambos inicializados con pesos aleatorios y sin partir de los pesos preentrenados de GPT-2.

El entrenamiento es puramente auto-supervisado (prediccion del siguiente token) sobre el dataset `ingeniumacademy/reuters_articles`, utilizando el tokenizador `ingeniumacademy/gpt2-reuters-tokenizer`, especifico para ese corpus. No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo fases de ajuste fino supervisado, RLHF o DPO. Tampoco se describen innovaciones tecnicas como atencion lineal, decodificacion especulativa o mezcla de expertos; se trata de una implementacion convencional orientada a practicas de laboratorio.

## Capacidades

- Generacion de texto causal en ingles, limitada a continuaciones de hasta 256 tokens de contexto.
- Modelado de lenguaje auto-supervisado: calculo de perplejidad y prediccion del siguiente token (el autor publica analisis de predicciones Q6, Q7 y Q8).
- Especializacion de dominio limitada al registro de prensa de Reuters (vocabulario y estilo periodistico economico).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue no disponible: solo se declara ingles.
- No se documentan modos especiales (thinking mode, vision, audio) ni capacidades multimodales.

## Casos de uso

- Docencia y practicas de NLP: reproduccion del pipeline completo de entrenamiento de un transformer causal (tokenizacion, entrenamiento, evaluacion con perplejidad) en un entorno de recursos limitados.
- Analisis de tokenizadores de dominio: estudio comparativo del tokenizador especifico de Reuters frente a tokenizadores generalistas para vocabulario economico y financiero.
- Experimentos de scaling a pequena escala: comparacion entre los checkpoints de 2 y 5 epocas para analizar sobreajuste, convergencia y evolucion de la perplejidad.
- Generacion de titulares o fragmentos breves de estilo periodistico: el modelo puede producir continuaciones cortas con el registro de Reuters, siempre que se acepte su baja calidad y contexto de 256 tokens.
- Evaluacion de tecnicas de prediccion de siguiente token: uso del modelo como banco de pruebas para estudiar distribuciones de probabilidad en posiciones concretas (Q6-Q8) en textos economicos.
- Baseline academico en articulos o trabajos: servir como referencia minima frente a la que medir mejoras de arquitecturas o datos en tareas de modelado de lenguaje de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente reporta artefactos de evaluacion propios: textos generados con su perplejidad asociada en `results/text-generation/` y analisis de predicciones de siguiente token en `results/next-token-analysis/`, sin cifras concretas en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 4 capas y dimension 256, el modelo cabe holgadamente en cualquier GPU consumer, incluso en CPU. No se dispone de una cifra exacta de parametros, pero el repositorio completo ocupa unos 0,1 GB.
- GPU recomendadas: cualquier GPU moderna sirve; una RTX 3060, RTX 4090 o incluso una GPU integrada son suficientes. No requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer actuales y en la mayoria de CPUs.
- Opciones de despliegue: transformers (`GPT2LMHeadModel.from_pretrained()` apuntando al subdirectorio del checkpoint), y potencialmente llama.cpp u Ollama si se convierte a GGUF, aunque no se documenta dicha conversion.
- Latencia y throughput estimados: no disponibles; por el tamano del modelo se espera una latencia muy baja, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Reuters GPT-2 - Assignment 02 (este modelo) | no disponible (4 capas, dim 256, vocab 52.000) | 256 | no disponible | Hugging Face (repo publico, 0 descargas) |
| GPT-2 small (OpenAI) | 124 M | 1.024 | MIT | Hugging Face, ampliamente disponible |
| DistilGPT-2 | 82 M | 1.024 | Apache 2.0 | Hugging Face |
| GPT-2 medium (OpenAI) | 355 M | 1.024 | MIT | Hugging Face |

La comparacion con GPT-2 small, DistilGPT-2 y GPT-2 medium es la mas directa por familia arquitectonica, si bien este modelo es sustancialmente mas pequeno y con un contexto cuatro veces menor. No se dispone de datos de rendimiento comparativo (perplejidad o benchmarks) para establecer una comparacion cuantitativa con esas alternativas.

## Limitaciones y advertencias

- Modelo de tamano muy reducido (4 capas, dim 256) y contexto de solo 256 tokens: la coherencia se degrada rapidamente y no es apto para generacion longeva ni razonamiento.
- Entrenado desde cero con pesos aleatorios: carece del conocimiento general que aporta el preentrenamiento a gran escala; su conocimiento se limita al corpus de Reuters utilizado.
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- Riesgo elevado de alucinacion y de generar texto facticamente incorrecto, especialmente fuera del dominio periodistico economico.
- Sesgos potenciales derivados del corpus de Reuters (sesgo editorial, geografico y tematico) no documentados por el autor.
- Licencia no especificada: no se puede asumir uso comercial permitido; es necesario contactar con el autor antes de cualquier uso en produccion.
- Naturaleza academica: sin pipeline declarado, sin descargas ni validacion de la comunidad; no recomendado como base para aplicaciones reales.
- No se documentan tecnicas de alineacion (RLHF/DPO), por lo que no hay garantias de comportamiento seguro o util en conversacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sahan323/reuters-gpt2-ssl-assignment2
- Dataset de entrenamiento: https://huggingface.co/datasets/ingeniumacademy/reuters_articles
- Tokenizador: https://huggingface.co/ingeniumacademy/gpt2-reuters-tokenizer
- No se han encontrado en la informacion disponible papers, blogs, repositorios de codigo ni demos adicionales.
