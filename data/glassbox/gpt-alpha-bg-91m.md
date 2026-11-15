# glassbox/gpt-alpha-bg-91m

## Resumen

gpt-alpha-bg-91m es un modelo de lenguaje decoder-only de 91,26 millones de parametros entrenado desde cero (sin inicializacion preentrenada) sobre texto en bulgaro, dentro de una base de codigo estilo nanoGPT. Lo desarrolla el usuario glassbox y se distribuye bajo licencia MIT. No es un modelo generativo de proposito general: su funcion medida y declarada es actuar como juez de fluidez en bulgaro mediante perplexity, clasificando y ordenando candidatos de texto producidos por otros sistemas.

El modelo resuelve un problema concreto de evaluacion: puntuar y rerankear salidas de OCR, ASR o traduccion automatica en bulgaro, y marcar texto corrupto o generado por bots. Segun la model card, sobre pares de error/correccion alcanza una precision de preferencia emparejada del 92,3 % (24 de 26 casos curados), estadisticamente a la par con Gemini en ese subconjunto, funcionando de forma offline y en CPU.

Es relevante ahora porque demuestra que un modelo de 91M puede sustituir una llamada a una API de frontera como filtro de fluidez en un idioma de recursos medios, con un coste computacional minimo. Conviene subrayar sus dos limites declarados: es un modelo base sin instruction tuning (no corrige texto ni responde preguntas) y no es un detector de gibberish ni de alfabeto, ya que fue entrenado con datos web y puede puntuar mejor texto romanizado que cirilico natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo nanoGPT, entrenado desde cero |
| Parametros totales | 91.263.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors y checkpoint PyTorch; no se documentan GGUF ni cuantizaciones) |
| Idiomas soportados | bulgaro (bg) |
| Licencia | MIT |
| Formato de pesos | safetensors y state dict PyTorch (.pt) |

Otros datos tecnicos confirmados: vocabulario de 8192 tokens (forma del embedding `[8192, 768]`), dimension oculta de 768, LM head atado al embedding de tokens (almacenado una sola vez bajo el nombre del embedding), `config.json` con la arquitectura resuelta y todos los toggles explicitados. El repositorio ocupa 2,2 GB. El checkpoint no es compatible con `transformers`.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT, implementado en una base de codigo nanoGPT y entrenado desde cero sin inicializacion preentrenada. El vocabulario es de 8192 tokens y la dimension del modelo es 768, coherente con los 91,26M de parametros. El modelo se distribuye como state dict PyTorch que incluye su propia configuracion, y como safetensors; en ambos casos requiere las definiciones de clase del repositorio `bg-eval` para cargarse correctamente, salvo el uso directo via `safetensors.torch.load_file`.

El corpus de entrenamiento combina el dataset `hasankursun/bulgarian-corpus-33b` con prosa de libros de chitanka, noticias, foro y Wikipedia (estos ultimos sin identificador de Hub, descritos en la seccion "How it was built" de la model card). No se documentan en la informacion disponible el numero total de tokens de entrenamiento, la composicion porcentual exacta del dataset ni si hubo fases de RLHF o DPO; al tratarse de un modelo base sin instruction tuning, no se declara alineamiento por preferencias. La innovacion destacable no es arquitectonica sino metodologica: el repositorio `bg-eval` verifica que el cargador torch-only es bit-identico a la implementacion de entrenamiento (max |Δlogit| de 0.000e+00 en los siete checkpoints publicados) y cada cifra publicada lleva su protocolo y procedencia en `expected/*.json`.

## Capacidades

- Generacion de texto autoregresiva basica en bulgaro (modelo base, sin instruction tuning).
- Puntuacion de fluidez mediante perplexity: calculo de perplexity por frase o candidato (`bpc.py`).
- Juicio de preferencia emparejada: dado un par de frases, decide cual es mas fluida (`judge.py`).
- Reranking de candidatos de texto: ordenar varias hipotesis de OCR, ASR o MT por fluidez.
- Deteccion de texto corrupto o generado por bots en bulgaro (marcado por baja puntuacion de fluidez).
- Inferencia offline en CPU, sin dependencia de APIs externas.
- No soporta tool calling ni function calling (no documentado, y coherente con ser un modelo base).
- No soporta agentes ni razonamiento multi-step.
- No tiene modo thinking, vision ni audio.
- Multilingue: solo bulgaro (bg).

## Casos de uso

- Filtro de fluidez para OCR: tras digitalizar texto escaneado en bulgaro, puntuar cada linea con perplexity y descartar o marcar las que superen un umbral, usando la capacidad del modelo de comparar candidatos sin necesidad de GPU.
- Reranking de salidas ASR: dada una transcripcion de voz a texto, generar o recibir varias hipotesis y ordenarlas por fluidez con `judge.py`; el modelo puntua frases en CPU y de forma offline.
- Control de calidad de traduccion automatica: comparar dos o mas traducciones al bulgaro de la misma frase origen y seleccionar la mas fluida como paso de post-edicion automatica.
- Deteccion de texto generado por bots en foros o comentarios: puntuar mensajes por perplexity y marcar los que caigan fuera del rango de fluidez natural del bulgaro, como senal de alerta para moderacion.
- Evaluacion de sistemas de correccion gramatical: usar los pares error/correccion como protocolo de referencia para medir si un corrector propuesto mejora la fluidez, replicando la metodologia de `error_preference.py`.
- Gate de calidad en pipelines de datos: integrar el modelo como etapa barata de filtrado en un pipeline de curacion de corpus en bulgaro, descartando documentos con puntuacion de fluidez anomala antes de entrenar otros modelos.
- Verificacion de alfabeto y naturalidad en produccion: usar la puntuacion como heuristica complementaria (no como detector de gibberish) para revisar salidas de sistemas multilingues en cirilico, con la cautela de que texto romanizado puede puntuar alto.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente en la informacion disponible):

| Tarea / dataset | Metrica | Valor |
|---|---|---|
| thebogko/bulgarian-grammar-mistakes (pares curados, 26) | Precision de preferencia emparejada | 92,3 % (IC 81-100) |
| thebogko/bulgarian-grammar-mistakes (pares curados, 26) | AUC | 0,77 |
| thebogko/bulgarian-grammar-mistakes (200 pares aleatorios) | Precision de preferencia emparejada | 100,0 % (cota Clopper-Pearson 98,2-100) |
| thebogko/bulgarian-grammar-mistakes (200 pares aleatorios) | AUC | 0,85 |
| EXAMS (bg, zero-shot) | Accuracy | 27,85 % |

Comparacion con jueces independientes sobre los mismos pares (datos del autor):

| Juez | 26 pares curados (precision / AUC) | 200 pares aleatorios (precision / AUC) |
|---|---|---|
| gpt-alpha-bg-91m (91,26M, perplexity) | 92,3 % / 0,77 | 100,0 % / 0,85 |
| Gemini (gemini-3.5-flash) | 88,5 % / 0,85 | 98,0 % / 0,94 |
| qwen2.5:3b | 65,4 % / 0,63 | 69,2 % / 0,65 |

El autor recomienda citar la columna de 26 pares curados, por ser el subconjunto mas dificil e informativo; en el, el modelo prefiere la frase correcta en 24 de 26 casos (p < 0,0001). Los intervalos de confianza se solapan: el modelo lidera en precision emparejada y Gemini en AUC agrupada. La comparacion con BgGPT (Gemma-2-2.6B-IT, 28 veces mayor, y Gemma-3-4B-IT, 47 veces mayor) con codigo identico en los tres lados esta mencionada en la model card pero truncada en la informacion disponible, por lo que no se recogen cifras de ese enfrentamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (91,26M parametros en fp32 equivalen a unos 365 MB; en fp16 unos 183 MB), mas el overhead del runtime.
- Inferencia en CPU validada por el autor (offline, sin GPU).
- GPU recomendadas: no se documentan; por tamano, cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es sobradamente suficiente, pero no hay datos oficiales.
- Cabe en GPU consumer: si, con amplio margen, aunque no se publican cifras oficiales de latencia.
- Opciones de despliegue: loader torch-only `bg-eval` (`bpc.py`, `judge.py`) y carga directa de safetensors con `safetensors.torch.load_file`; no es compatible con `transformers`, por lo que vLLM, TGI, llama.cpp y Ollama no estan documentados como vias de despliegue.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpt-alpha-bg-91m | 91,26M | no disponible | Juez de fluidez en bulgaro, base LM | MIT | Hugging Face (safetensors + .pt) |
| BgGPT (Gemma-2-2.6B-IT) | ~2.600M (28x) | no disponible | LLM generativo en bulgaro | no disponible en la informacion | Hugging Face (INSAIT-Institute) |
| BgGPT (Gemma-3-4B-IT) | ~4.000M (47x) | no disponible | LLM generativo en bulgaro | no disponible en la informacion | Hugging Face (INSAIT-Institute) |
| qwen2.5:3b | ~3.000M | no disponible | LLM generativo multilingue | no disponible en la informacion | Ollama / Hugging Face |

La comparacion relevante no es de generacion sino de juicio de fluidez: frente a Gemini (API de frontera) y qwen2.5:3b, gpt-alpha-bg-91m obtiene mejor precision emparejada en el subconjunto curado (92,3 % frente a 88,5 % y 65,4 %), con AUC inferior a Gemini (0,77 frente a 0,85). Los datos completos del enfrentamiento con BgGPT no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo base sin instruction tuning: no corrige texto, no responde preguntas y no sigue instrucciones.
- No es un detector de script ni de gibberish: entrenado con datos web, puede puntuar mejor texto romanizado que cirilico natural; solo compara candidatos en bulgaro entre si.
- Riesgo de alucinacion: al ser un modelo base, la generacion libre de texto puede producir contenido incoherente; su uso previsto es puntuar, no generar.
- Sesgos: no documentados en la informacion disponible; el entrenamiento con datos web (noticias, foros, Wikipedia) puede introducir sesgos de dominio y de registro.
- Limitaciones de idioma: solo bulgaro; no hay soporte multilingue declarado.
- Limitaciones de contexto: la longitud de contexto no esta documentada, lo que impide planificar usos con entradas largas.
- Restricciones de licencia: MIT permite uso comercial, pero conviene revisar las condiciones de los datasets de entrenamiento (por ejemplo, `hasankursun/bulgarian-corpus-33b` y las fuentes sin identificador de Hub).
- Caveats para produccion: no es compatible con `transformers`, lo que limita la integracion con stacks habituales; los resultados de benchmarks estan declarados por el autor y no verificados de forma independiente; el modelo tiene 9 descargas y 0 likes, por lo que su validacion por la comunidad es practicamente nula.
- La comparacion con Gemini se apoya en un subconjunto curado de 26 pares; los intervalos de confianza se solapan y las conclusiones deben tratarse con cautela estadistica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/glassbox/gpt-alpha-bg-91m
- Repositorio del loader y evaluaciones: https://github.com/iksnerd/bg-eval
- Dataset de errores gramaticales: https://huggingface.co/datasets/thebogko/bulgarian-grammar-mistakes
- Dataset de errores ortograficos: https://huggingface.co/datasets/thebogko/bulgarian-spelling-mistakes
- Dataset EXAMS: https://huggingface.co/datasets/mhardalov/exams
- Dataset de entrenamiento: https://huggingface.co/datasets/hasankursun/bulgarian-corpus-33b
- BgGPT (INSAIT-Institute): https://huggingface.co/INSAIT-Institute
