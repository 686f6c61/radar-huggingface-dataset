# efebaykara/Qwen3.5-0.8B-Base-Gundem-LoRA

## Resumen

Qwen3.5-0.8B-Base-Gundem-LoRA es un adaptador LoRA (Low-Rank Adaptation) desarrollado por efebaykara sobre el modelo base Qwen/Qwen3.5-0.8B-Base, orientado especificamente a la clasificacion de titulares de noticias en turco. No se trata de un checkpoint completo ni de un asistente conversacional general, sino de una adaptacion especializada que recibe exclusivamente un titular y devuelve una estructura con etiquetas tematicas, tipo de evento y tres puntuaciones enteras (impacto, gravedad y urgencia) en una escala de 0 a 3.

El modelo resuelve una tarea de clasificacion estructurada de noticias turcas ("gundem" significa agenda o actualidad en turco), empleando una tecnica de destilacion de respuestas: se generaron respuestas con DeepSeek que se usaron como supervision en el entrenamiento del alumno, sin emplear pesos ni logits del profesor. El adaptador mantiene el numero de parametros del modelo base (752.393.024) y se distribuye bajo licencia Apache 2.0.

La relevancia actual del modelo reside en su enfoque de despliegue ligero: con menos de 800 millones de parametros y un adaptador LoRA de rango 16, es apto para entornos con recursos limitados, incluidos dispositivos moviles mediante los ficheros GGUF Q4_K_M incluidos. Su evaluacion interna (Gundem Score v1 de 81.9 sobre 100) mide la concordancia con las etiquetas del profesor en esta tarea concreta, no la inteligencia general del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3_5ForCausalLM) con adaptador LoRA; componente de vision no entrenado |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (max_length de entrenamiento: 512 tokens) |
| Tipos de cuantizacion | Q4_K_M (GGUF incluido); el adaptador se fusiona en fp32 en CPU y se infiere en BF16 en CUDA |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 (modelo y tokenizador segun licencias upstream); codigo auxiliar Gundem bajo MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-0.8B-Base, un transformer causal de 752 millones de parametros con soporte multimodal en su version original (Qwen3_5ForCausalLM), aunque en esta adaptacion los componentes de vision no fueron entrenados: se trata de una adaptacion exclusivamente de texto. El LoRA emplea rango 16 y alpha 32, con acumulacion de gradientes de 8, longitud maxima de 512 tokens, learning rate de 0.0002, tres epocas y semilla 42.

El entrenamiento sigue un esquema de destilacion de respuestas (response distillation): se generaron respuestas con DeepSeek que se usaron como supervision solo en el turno del asistente (assistant-only supervised fine-tuning). No se emplearon pesos ni logits del modelo profesor y el numero de parametros del alumno no cambio. El conjunto de datos consta de 825 ejemplos de entrenamiento, 107 de validacion y 101 de test, todos ellos titulares de noticias turcas. La entrada al modelo es unicamente el titular junto con un fichero de sistema (`student-system.txt`), y la salida esperada contiene los campos `etiquetas` (temas), `tur` (tipo de evento) y las puntuaciones enteras `etki`, `ciddiyet` y `aciliyet` en el rango 0-3. La generacion no esta restringida por una gramatica JSON.

## Capacidades

- Clasificacion de titulares de noticias en turco en categorias tematicas (campo `etiquetas`).
- Identificacion del tipo de evento noticioso (campo `tur`).
- Puntuacion de impacto, gravedad y urgencia en escala entera de 0 a 3 (campos `etki`, `ciddiyet`, `aciliyet`).
- Generacion de texto estructurado en formato de campos etiquetados (no JSON garantizado por gramatica).
- Inferencia en CPU (fusion del adaptador en fp32) y en GPU CUDA en BF16.
- Despliegue en dispositivos moviles mediante los ficheros GGUF Q4_K_M incluidos, probados con el motor nativo Gundem.
- No soporta tool calling ni function calling de forma documentada.
- No soporta agentes ni razonamiento multi-paso documentado.
- Capacidad multilingue limitada al turco.
- No dispone de modo thinking, vision ni audio en esta adaptacion.

## Casos de uso

- Clasificacion automatica de titulares en redacciones digitales: el modelo recibe un titular turco y devuelve etiquetas tematicas y tipo de evento, lo que permite enrutar noticias a secciones concretas (politica, economia, sucesos) con una micro-F1 de temas del 91.1% en el conjunto de test.
- Priorizacion de alertas informativas: las puntuaciones de urgencia, gravedad e impacto (0-3) permiten ordenar la cola de publicacion o activar avisos cuando `aciliyet` o `ciddiyet` superan un umbral definido por el medio.
- Moderacion y triaje de contenido generado por usuarios: dado un titular enviado por un lector, el modelo estima gravedad y tipo de evento para decidir si requiere revision humana antes de su publicacion.
- Analitica de tendencias editoriales: procesando lotes de titulares historicos, los campos `etiquetas` y `tur` permiten agregar la cobertura tematica por franjas temporales y detectar cambios en la agenda informativa.
- Despliegue en movil o edge para aplicaciones de resumen de actualidad: los ficheros GGUF Q4_K_M permiten ejecutar la clasificacion en dispositivos con recursos limitados sin conexion a servidores, usando el motor nativo Gundem.
- Etiquetado asistido para anotacion humana: el modelo puede preetiquetar grandes volumenes de titulares y los anotadores revisan solo los casos con puntuaciones intermedias o tipos poco frecuentes, reduciendo el coste de construccion de corpus.
- Filtrado tematico en agregadores de noticias: integrado en un pipeline de ingestion, el adaptador descarta o agrupa titulares segun etiquetas antes de pasarlos a modelos mayores o a sistemas de recomendacion.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---:|
| Gundem Score v1 | 81.9 / 100 |
| Coincidencia exacta en todos los campos | 45.5% |
| Micro-F1 de temas | 91.1% |
| Precision de tipo de evento | 87.1% |
| Salidas invalidas | 0 / 101 |

Condiciones de evaluacion: HF/CUDA en BF16, decodificacion greedy, batch de 4, maximo de 160 tokens nuevos y sin gramatica JSON. El Gundem Score v1 se define como 30 x F1 de temas + 20 x precision de tipo + 30 x (1 - MAE medio de puntuaciones / 3) + 20 x coincidencia exacta, con metricas fraccionarias. Mide la concordancia con las etiquetas del profesor en esta tarea concreta, no la inteligencia general del modelo ni un porcentaje de acierto global. El autor advierte que las diferencias pequenas en este test de una sola semilla no establecen superioridad y que el tamano de batch y los cambios numericos del runtime pueden alterar las salidas.

En la comparacion GGUF incluida en la model card, la variante original obtiene un Gundem Score v1 de 0.0 y la destilada 81.9, si bien estas puntuaciones proceden del experimento HF/BF16 y la calidad de los GGUF moviles no fue reevaluada.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1.5 GB para los pesos del modelo base (752 M de parametros) mas overhead de activaciones y cache KV; el adaptador fusionado anade un coste marginal.
- Memoria RAM en CPU: se requiere RAM suficiente para cargar el modelo base completo en fp32 durante la fusion del adaptador (del orden de 3 GB), segun advierte el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para BF16, incluidas RTX 3060, RTX 4060, RTX 4090, A100 y H100; el modelo es sobredimensionado para GPUs de datacenter.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna con 4 GB o mas de VRAM.
- Opciones de despliegue: script `release_infer.py` incluido en el repositorio (PyTorch con CUDA), ficheros GGUF Q4_K_M para el motor nativo Gundem en movil; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La evaluacion se realizo con batch de 4 y maximo de 160 tokens nuevos, sin cifras de latencia publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Base-Gundem-LoRA | 752 M (LoRA) | no disponible (entrenado a 512) | Clasificacion de titulares en turco | Apache 2.0 | HuggingFace, GGUF movil |
| Qwen/Qwen3.5-0.8B-Base | 752 M | no disponible | Modelo base generalista | Apache 2.0 (upstream) | HuggingFace |
| Alternativas especializadas en clasificacion de noticias en turco | no disponible | no disponible | Clasificacion de texto | no disponible | no disponible |

No se dispone de datos publicados de benchmarks de modelos comparables de la misma categoria en la informacion proporcionada. La comparacion con el modelo base solo es posible en terminos del Gundem Score v1: el base original obtiene 0.0 frente a 81.9 del adaptador, aunque esta metrica mide exclusivamente la concordancia con la tarea destilada y no es comparable con evaluaciones generalistas.

## Limitaciones y advertencias

- El modelo es un adaptador LoRA, no un checkpoint completo: requiere el modelo base Qwen/Qwen3.5-0.8B-Base en la revision fijada `dc7cdfe2ee4154fa7e30f5b51ca41bfa40174e68` para funcionar.
- No es un asistente conversacional general: solo acepta un titular y devuelve los campos estructurados definidos; no debe usarse para dialogos abiertos.
- El conjunto de datos es pequeno y especifico del dominio (825/107/101 ejemplos), por lo que el rendimiento fuera de la distribucion de titulares turcos de actualidad puede degradarse notablemente.
- La generacion no esta restringida por una gramatica JSON: aunque en el test no se produjeron salidas invalidas (0/101), el formato de salida no esta garantizado estructuralmente.
- El Gundem Score v1 mide concordancia con etiquetas de un profesor (DeepSeek) en una unica semilla; no equivale a precision real ni a calidad general, y diferencias pequenas no son significativas.
- Cargar el modelo base ejecuta codigo remoto del repositorio upstream; el autor recomienda revisarlo antes de su uso.
- Los componentes de vision del modelo base no fueron entrenados; cualquier uso multimodal queda fuera del alcance del adaptador.
- La licencia del modelo y del tokenizador sigue las licencias upstream (Apache 2.0); el codigo auxiliar Gundem es MIT, pero la licencia del modelo es independiente de la del codigo.
- Los titulares originales, las respuestas del profesor y el dataset completo no se redistribuyen, lo que limita la reproducibilidad exacta de la evaluacion.
- Riesgo de sesgo: al entrenarse sobre titulares de actualidad turca etiquetados por un modelo externo, puede heredar sesgos tematicos y de encuadre presentes en esa fuente.
- Riesgo de alucinacion en los campos de texto libre (`etiquetas`, `tur`) si la entrada se aleja del formato esperado; las puntuaciones numericas estan acotadas a 0-3 pero no validadas por gramatica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/efebaykara/Qwen3.5-0.8B-Base-Gundem-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Herramientas de entrenamiento y benchmark: https://github.com/efebaykaraa/gundem-llms
- Modelos publicados (release models-v1.0.0): https://github.com/efebaykaraa/gundem-llms/releases/tag/models-v1.0.0
