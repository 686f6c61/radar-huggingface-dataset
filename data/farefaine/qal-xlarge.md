# farefaine/qal-xlarge

## Resumen

Qal xlarge es un modelo de lenguaje de tipo GPT entrenado desde cero para tigriña (idioma `ti`), una lengua semítica de Eritrea y Etiopía con escasos recursos digitales. Lo desarrolla el autor independiente farefaine como parte de la serie "Building Qal", que publica cinco tamanos entrenados con el mismo dato, tokenizador y receta para permitir comparaciones controladas entre escalas. La version xlarge, la mayor de la familia, tiene 69,4 millones de parametros.

El modelo resuelve el problema de la casi inexistencia de modelos generativos abiertos para tigriña: la mayoria de los LLM multilingues apenas cubren este idioma y los corpus disponibles son limitados. Qal se entrena exclusivamente con texto en tigriña (aproximadamente 79M de tokens por epoca) procedente de corpus publicos como TLMD, el Tigrinya NLP Corpus y TiQuAD.

Arquitectura transformer decoder-only clasica con 8 capas, 12 cabezas, dimension de embedding 768 y una ventana de contexto muy corta de 128 tokens. Su vocabulario BPE de 8.192 tokens esta adaptado al tigriña. Es un modelo de investigacion y experimentacion linguistica, no un asistente de proposito general: no ha pasado por ajuste de instrucciones ni por RLHF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT (8 capas, 12 cabezas, dim 768) |
| Parametros totales | 69.498.368 (segun safetensors; la model card indica 69.367.296) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible (pesos en BF16/FP; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | Tigriña (`ti`) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (libreria PyTorch) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con embeddings posicionales aprendidos de tipo absoluto, 8 capas, 12 cabezas de atencion, dimension de embedding de 768 y un vocabulario BPE de 8.192 tokens. La ventana de contexto es de solo 128 tokens, coherente con el objetivo de entrenamiento (secuencias de 128 tokens). No incorpora innovaciones como atencion lineal, decodificacion especulativa ni mezcla de expertos.

El entrenamiento consistio en 120 epocas (385.116 pasos) sobre una version limpiada del dataset `farefaine/tigrinya-pretraining`, con aproximadamente 79M de tokens por epoca. Se uso AdamW (betas 0,9 y 0,99), weight decay 0,1, dropout 0,1, learning rate pico de 0,0015 con esquema warmup-stable-decay (manteniendo la tasa hasta la epoca ~96 y decayendo despues), precision mixta BF16 y una unica GPU. El batch fue de 192 secuencias de 128 tokens. Segun la model card, la mayor parte de la mejora proviene de la fase de decaimiento: la perdida de validacion pasa de ~3,20 al inicio del decaimiento a 2,79 al final. No se documenta RLHF ni DPO.

## Capacidades

- Generacion de texto autoregresiva en tigriña con muestreo por temperatura (ejemplos en la model card a temperatura 0,8).
- Modelado del lenguaje puro: prediccion del siguiente token, util para perplexity, scoring y experimentacion linguistica.
- Generacion de texto con apariencia fluida en tigriña sobre dominios similares al corpus de noticias.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No tiene modo "thinking" ni capacidades de vision o audio.
- Multilingue: unicamente tigriña; no se documenta capacidad en otros idiomas.
- No esta ajustado a instrucciones (no es un modelo instruct).

## Casos de uso

- Experimentacion linguistica en lenguas de bajos recursos: servir como punto de referencia (baseline) para estudiar el efecto del tamano y las epocas en tigriña, dado que la familia Qal comparte receta y datos entre sus cinco tamanos.
- Generacion de texto sintetico en tigriña para aumento de datos: producir fragmentos adicionales que, con filtrado y revision humana, amplien corpus pequenos de PLN para este idioma.
- Calculo de perplexity y evaluacion de corpus: usar el modelo para puntuar la fluidez de textos en tigriña y detectar anomalias o calidad en datasets de entrenamiento.
- Investigacion sobre tokenizadores de bajos recursos: analizar como un vocabulario BPE de 8.192 tokens adaptado al tigriña afecta a la compresion y al modelado frente a tokenizadores multilingues genericos.
- Educacion y divulgacion: ejemplo didactico de entrenamiento completo de un GPT desde cero (codigo y recetas publicos) para cursos de PLN.
- Prototipado de autocompletado o continuacion de texto muy corta (hasta 128 tokens) en aplicaciones de demostracion en tigriña, asumiendo supervision humana dado su tamano reducido.
- Base para fine-tuning supervisado en tareas concretas de tigriña (clasificacion, etiquetado), partiendo de un modelo ya adaptado al idioma en lugar de un multilingue generico.

## Benchmarks y rendimiento

| Split | Loss | Perplexity |
|---|---|---|
| Validacion | 2,786 | 16,2 |
| Test | 2,805 | 16,5 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con ~69M de parametros, en BF16 ocupa alrededor de 140 MB de pesos; en FP32 unos 280 MB; con overhead de activaciones sigue cabiendo holgadamente en cualquier GPU consumer (menos de 1 GB).
- GPU recomendadas: cualquier GPU moderna, incluidas RTX 3060/4060/4090, T4 o incluso CPU para inferencia puntual.
- Cabe en GPU consumer: si, en practicamente todas las actuales y en muchas integradas.
- Opciones de despliegue: al cargarse mediante la clase `GPT` del repositorio GitHub del autor (`model.transformer.GPT`), no es compatible directamente con vLLM, TGI o llama.cpp/Ollama sin conversion previa. Requiere PyTorch y el codigo del proyecto.
- Latencia y throughput: no disponible (no se documentan mediciones).

## Comparativa con modelos similares

No hay modelos directamente comparables documentados en la informacion proporcionada. La comparacion natural es con los otros tamanos de la propia familia Qal (mismos datos, tokenizador y receta), que la model card menciona pero no detalla en parametros para cada tier.

| Modelo | Parametros | Contexto | Idioma | Licencia | Datos publicados |
|---|---|---|---|---|---|
| Qal xlarge | 69,4M | 128 | Tigriña | CC BY-SA 4.0 | Loss/perplexity |
| Otros tiers de Qal | no disponible | 128 (presumible, misma receta) | Tigriña | CC BY-SA 4.0 | no disponible en esta ficha |
| Alternativas multilingues genericas | no disponible | no disponible | Multiples | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado con solo ~79M de tokens de texto mayoritariamente periodistico: no es fiable para hechos y puede alucinar contenido.
- No esta ajustado a instrucciones, por lo que no responde a comandos ni sigue formatos de conversacion de forma fiable.
- Contexto de solo 128 tokens: insuficiente para conversaciones multi-turno, documentos largos o razonamiento extendido.
- Hereda los sesgos de sus fuentes de datos (TLMD, Tigrinya NLP Corpus, TiQuAD).
- Monolingue en la practica; no se debe esperar calidad en castellano ni en otros idiomas.
- Licencia CC BY-SA 4.0: permite uso comercial pero exige atribucion y compartir obras derivadas bajo la misma licencia (copyleft), lo que puede ser restrictivo para productos cerrados.
- Requiere codigo externo (el repositorio GitHub del autor) para cargar el modelo; no es plug-and-play con librerias estandar de inferencia.
- Modelo de investigacion con 53 descargas y 0 likes: sin validacion externa ni comunidad amplia que lo respalde.

## Enlaces

- Hugging Face: https://huggingface.co/farefaine/qal-xlarge
- Dataset de preentrenamiento: https://huggingface.co/datasets/farefaine/tigrinya-pretraining
- Codigo: https://github.com/farefaine/qal
- Serie "Building Qal": https://farefaine.substack.com
- TLMD (Gaim, Yang & Park, 2021): https://zenodo.org/records/5139094
- Tigrinya NLP Corpus (SeReT Foundation): https://github.com/TigrinyaNLP/corpus
- TiQuAD (Gaim, Yang, Park & Park, 2023): https://github.com/fgaim/TiQuAD
