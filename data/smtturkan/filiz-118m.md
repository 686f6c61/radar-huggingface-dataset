# smtturkan/filiz-118m

## Resumen

Filiz-118M es un modelo de lenguaje pequeño entrenado desde cero para turco por Samet Türkan (usuario `smtturkan`), publicado bajo licencia Apache 2.0. Con 118.004.016 parámetros reales (verificados en safetensors) y una arquitectura transformer densa tipo `Qwen3ForCausalLM`, está diseñado específicamente para ejecución en dispositivo (on-device) y para tareas estrechas: llamada de funciones, extracción de respuestas sobre contexto (lector RAG), pregunta-respuesta corta y como punto de partida para fine-tuning.

La propuesta central del modelo es la eficiencia con datos: se entrenó con aproximadamente 1.500 millones de tokens (frente a los 2-36 billones de modelos comparables) y, aun así, supera en las métricas XCOPA-tr (razonamiento causal) y TurBLiMP (gramática turca) a modelos entre 3 y 5 veces más grandes. Esto se apoya en un vocabulario morfológico de 8.192 tokens construido a partir de raíces y unidades de sufijos del turco, en lugar de un BPE convencional de mayor tamaño.

Es relevante ahora porque demuestra que un modelo de 118M puede ser competitivo en tareas lingüísticas específicas del turco cuando el tokenizador y los datos están bien diseñados, y porque incluye capacidades de function calling aprendidas durante el preentrenamiento (sin fine-tuning posterior), lo que lo hace útil para asistentes locales y pipelines RAG de bajo coste. La contrapartida es clara: es un modelo base, no un asistente conversacional, su conocimiento factual es muy limitado y el contexto máximo es de solo 1.024 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, `Qwen3ForCausalLM` (24 capas, hidden 624, 12 cabezas de atención de dimensión 52, SwiGLU con dimensión intermedia 1680, RMSNorm, RoPE, QK-norm por cabeza, embeddings y pesos de salida atados) |
| Parametros totales | 118.004.016 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; el repo contiene safetensors en precisión original) |
| Idiomas soportados | Turco (principal) e inglés (soporte débil, según el autor la generación en inglés es pobre) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`); el tokenizador se distribuye como paquete Python separado (`filiz_sozluk`), no como `tokenizers` estándar |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer denso decoder-only con 24 capas, dimensión oculta 624 y 12 cabezas de atención (52 dimensiones por cabeza), usando SwiGLU como activación en la FFN (dimensión intermedia 1680), RMSNorm, RoPE y QK-norm por cabeza. Los embeddings de entrada y los pesos de salida están atados. La ventana de contexto es de 1.024 tokens, un valor muy reducido que condiciona los casos de uso.

El tokenizador es la innovación más destacable: un vocabulario de 8.192 tokens basado en raíces turcas, unidades de sufijos y piezas BPE de respaldo, con marcadores separados para mayúsculas (`<|B|>`, `<|BB|>`). Esto produce aproximadamente 2,2 tokens por palabra en turco (frente a ~1,5 en modelos con vocabulario de 50k), un compromiso que reduce el tamaño del embedding a costa de secuencias algo más largas. El entrenamiento se realizó en dos fases: primero un modelo de 50M (~0,6B tokens) y después una expansión funcional a 118M con entrenamiento continuado (~0,9B tokens adicionales), usando Muon + AdamW con tasa de aprendizaje constante de 4e-4 sobre GPUs Kaggle T4. Los datos son exclusivamente de licencia abierta (CC BY, CC BY-SA, CC0, dominio público, Apache-2.0, MIT, ODC-By; se excluyeron licencias no comerciales): Wikipedia turca y proyectos hermanos, Wikisource, resúmenes académicos, cuentos y literatura, frases de Tatoeba, tareas de lectura y QA (tr_wiki_qa), MASSIVE tr-TR (mitad del split de train), llamada de funciones de Glaive/Hermes (Apache-2.0) y GSM8K con soluciones matemáticas y llamadas a herramienta de cálculo. Se aplicó un filtro de fuga por n-gramas para excluir los conjuntos de evaluación (XCOPA, Belebele, TurBLiMP, TurkishMMLU, test de MASSIVE). No se menciona RLHF ni DPO.

## Capacidades

- Generación de texto en turco con calidad razonable para su tamaño, orientada a respuestas cortas.
- Razonamiento causal básico en turco (XCOPA-tr 58,6) y conocimiento gramatical (TurBLiMP 79,8), superando a modelos de hasta 5 veces su tamaño en estas métricas.
- Llamada de funciones / tool calling aprendida en preentrenamiento: el modelo emite `<|arama|>nombre {"campo": "valor"}` cuando recibe definiciones de herramientas en el mensaje de sistema.
- Extracción de respuestas sobre contexto (lector RAG): responde preguntas a partir de un pasaje proporcionado.
- Pregunta-respuesta corta de una sola interacción.
- Punto de partida para fine-tuning de tareas estrechas (existe una variante especializada, Filiz-118M-Komut).
- Soporte multilingüe limitado: turco principal, inglés débil.
- No dispone de modo de razonamiento extendido (thinking), visión, audio ni capacidades multimodales.
- No es un asistente conversacional general; el autor lo describe explícitamente como modelo base.

## Casos de uso

- Llamada de funciones en asistentes locales: con definiciones de herramientas en el mensaje de sistema (hasta ~12 herramientas por la ventana de 1.024 tokens), el modelo selecciona la herramienta correcta con un 85,6 % de acierto de intención en MASSIVE tr-TR con 3-7 distractores, adecuado para comandos de voz o bots de dispositivo.
- Lector RAG de bajo coste: dado un pasaje recuperado, extrae la respuesta; en tr_wiki_qa alcanza un 73 % de acierto cuando se le entrega el párrafo correcto, por lo que encaja como componente de lectura en un pipeline de búsqueda + generación.
- Enrutamiento de consultas: dado un conjunto pequeño de herramientas o intenciones, clasifica y deriva la petición al servicio adecuado; su fortaleza en selección de herramienta (99,4 % de emisión de llamada) lo hace útil como router barato.
- Extracción de campos estructurados: genera llamadas con parámetros en formato JSON a partir de texto libre; útil para formularios, reservas o consultas de API, aunque con precisión limitada en los valores de los campos (42,6 % de intención + campos completos correctos en el mejor escenario).
- Asistente on-device en turco: con 118M parámetros y pesos en safetensors de ~0,5 GB, puede ejecutarse en CPU o GPU de gama baja en dispositivos móviles o embebidos para tareas de respuesta corta sin conexión.
- Base para fine-tuning especializado: como modelo base Apache 2.0, sirve para adaptar a dominios concretos (atención al cliente, comandos de domótica) con presupuestos de cómputo reducidos; la variante Komut del mismo autor demuestra esta vía con un 95,0 % de intención en MASSIVE.
- Normalización y procesamiento lingüístico turco: su tokenizador morfológico y su conocimiento gramatical (TurBLiMP 79,8) permiten tareas de corrección, análisis de sufijos o generación controlada.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos con lm-evaluation-harness 0.4.12, 0-shot, log-probabilidad:

| Modelo | Parametros | Tokens de entrenamiento | XCOPA-tr | TurBLiMP | Belebele-tr |
|---|---|---|---|---|---|
| Filiz-118M | 118M | ~1,5B | 58,6 | 79,8 | 26,1 |
| ufakzeka-1-base | ~165M | 13,5B | 59,2 | 81,9 | 27,8 |
| turkish-gpt2 | 124M | no disponible | 57,4 | 54,7 | 24,2 |
| SmolLM2-135M | 135M | 2T | 53,2 | 50,5 | 22,8 |
| SmolLM2-360M | 360M | 4T | 54,2 | 54,8 | 23,4 |
| Qwen3-0.6B (base) | 600M | 36T | 54,0 | 57,1 | 42,0 |

TurkishMMLU: Filiz-118M 18,2; ufakzeka-1 19,1 (nivel de azar en modelos por debajo de 0,5B, según el autor).

Llamada de funciones en MASSIVE tr-TR (test, 500 comandos, sin fine-tuning):

| Escenario | Emite llamada | Intencion correcta | Intencion + campos completos |
|---|---|---|---|
| Herramienta correcta + 3-7 distractores | 99,4 % | 85,6 % | 42,6 % |
| 8-12 herramientas aleatorias (media 9,4) | 99,4 % | 73,0 % | 37,2 % |

QA con herramienta real (tr_wiki_qa test, 200 preguntas):

| Configuracion | Acierto |
|---|---|
| Sin herramienta (closed-book) | 1,5 % |
| Herramienta Wikipedia (el modelo elige el título, la herramienta devuelve el párrafo) | 37,0 % |
| Párrafo correcto proporcionado (techo del lector) | 73,0 % |

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,5 GB en FP16/BF16 (118M parámetros × 2 bytes); ~0,25 GB en cuantización de 8 bits y ~0,13 GB en 4 bits, aunque el autor no publica pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el modelo se entrenó en Kaggle T4 y se ejecuta sin problemas en T4, RTX 3060, RTX 4090, A100 o H100 (en estas últimas el cuello de botella es la latencia, no la memoria).
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU y CPU; también en dispositivos móviles de gama media-alta.
- Opciones de despliegue: `transformers` (requiere el paquete `filiz_sozluk` para el tokenizador, instalable con `pip install git+https://github.com/smtturkan-droid/filiz`); el tag `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad con TGI y endpoints de Hugging Face. No se documentan recetas para vLLM, llama.cpp u Ollama; la conversión a GGUF requeriría portar el tokenizador, que no está en formato `tokenizers`.
- Latencia y throughput: no disponibles en la información proporcionada. El autor recomienda decodificación greedy (`do_sample=False`) y advierte de no usar `repetition_penalty` ni `no_repeat_ngram_size`, porque penalizan tokens del propio prompt y rompen la copia de texto y los nombres de herramientas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | XCOPA-tr | TurBLiMP | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Filiz-118M | 118M | 1.024 | 58,6 | 79,8 | Apache 2.0 | Hugging Face, Kaggle Models |
| ufakzeka-1-base | ~165M | no disponible | 59,2 | 81,9 | no disponible | Hugging Face |
| turkish-gpt2 | 124M | no disponible | 57,4 | 54,7 | no disponible | Hugging Face |
| SmolLM2-135M | 135M | no disponible | 53,2 | 50,5 | no disponible | Hugging Face |

Frente a ufakzeka-1-base, Filiz-118M queda ligeramente por debajo en XCOPA-tr y TurBLiMP pese a entrenarse con casi 9 veces menos tokens (1,5B frente a 13,5B), lo que refleja la eficiencia del vocabulario morfológico. Frente a turkish-gpt2 y SmolLM2-135M, la ventaja en TurBLiMP es amplia (79,8 frente a 54,7 y 50,5). Qwen3-0.6B, con 5 veces más parámetros y 24 veces más tokens, solo supera a Filiz en Belebele-tr (42,0 frente a 26,1) y queda por detrás en XCOPA-tr y TurBLiMP. La licencia Apache 2.0 de Filiz es una ventaja clara para uso comercial frente a alternativas cuya licencia no está confirmada en la información disponible.

## Limitaciones y advertencias

- Es un modelo base, no un asistente conversacional: no está alineado con instrucciones generales ni con preferencias humanas (no se documenta RLHF/DPO).
- Baja fiabilidad factual y tendencia a la alucinación: en modo closed-book solo acierta el 1,5 % en tr_wiki_qa; debe usarse con contexto recuperado (RAG).
- No realiza cálculos aritméticos: está diseñado para invocar una herramienta de cálculo, y el autor advierte que esto no corrige problemas matemáticos de varios pasos.
- Debilidad en los valores de los campos de las llamadas a herramientas (42,6 % de intención + campos completos correctos en el mejor escenario): los argumentos pueden corromperse (por ejemplo, expresiones de hora).
- Contexto muy limitado (1.024 tokens): en la práctica solo caben ~12 definiciones de herramientas; con más, el autor recomienda prefiltrar la lista con un router.
- Generación en inglés débil, según el propio autor; no es un modelo bilingüe equilibrado.
- Tokenizador no estándar: requiere el paquete `filiz_sozluk` y no se puede convertir a formato `tokenizers`, lo que complica la integración con ecosistemas como llama.cpp, vLLM u Ollama.
- Rendimiento a nivel de azar en benchmarks de conocimiento amplio (Belebele-tr 26,1; TurkishMMLU 18,2): no es adecuado para tareas que exijan conocimiento enciclopédico.
- Licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento son solo de licencias abiertas; aun así, conviene revisar las obligaciones de atribución de las fuentes CC BY y CC BY-SA.
- Advertencias de producción: usar decodificación greedy y evitar `repetition_penalty` y `no_repeat_ngram_size`, que degradan la copia de texto y los nombres de herramientas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/smtturkan/filiz-118m
- Variante especializada en comandos: https://huggingface.co/smtturkan/filiz-118m-komut
- Repositorio GitHub (tokenizador y ejemplos): https://github.com/smtturkan-droid/filiz
- Modelo en Kaggle Models: https://www.kaggle.com/models/samettrkan/filiz-118m
