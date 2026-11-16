# smtturkan/filiz-118m

## Resumen

Filiz-118M es un modelo de lenguaje pequeno (118 millones de parametros) entrenado desde cero para turco por Samet Turkan, publicado bajo licencia Apache 2.0. Se presenta como la primera entrega de un proyecto centrado en el entrenamiento eficiente en datos: el modelo se entreno con aproximadamente 1.500 millones de tokens, un volumen muy inferior al de modelos de tamano similar, y aun asi supera a modelos entre 3 y 5 veces mas grandes en pruebas de razonamiento causal (XCOPA-tr) y gramatica turca (TurBLiMP).

La arquitectura sigue el diseno de Qwen3 (`Qwen3ForCausalLM`), con 24 capas, dimension oculta de 624, 12 cabezas de atencion y una ventana de contexto de solo 1.024 tokens. Incorpora un vocabulario propio de 8.192 tokens basado en raices y sufijos del turco, distribuido como paquete Python independiente (`filiz_sozluk`) porque no es convertible al formato estandar de Hugging Face `tokenizers`.

Es un modelo base, no un asistente conversacional afinado: esta pensado para tareas acotadas en dispositivo (llamada de funciones, lectura extractiva para RAG, respuesta corta a preguntas) y como punto de partida para fine-tuning. Su interes actual reside en que demuestra que un modelo de 118M entrenado con pocos datos y un tokenizador morfologico puede igualar o superar a modelos mucho mayores en tareas especificas del turco, a un coste de inferencia minimo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Qwen3 (`Qwen3ForCausalLM`), 24 capas, hidden 624, 12 cabezas (head dim 52), SwiGLU 1680, RMSNorm, RoPE, QK-norm por cabeza, embeddings y salida atados |
| Parametros totales | 118.004.016 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones publicadas; al ser safetensors en transformers, admite conversion a GGUF/8-bit/4-bit mediante herramientas externas) |
| Idiomas soportados | turco (principal), ingles (soporte debil en generacion) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,5 GB) |
| Vocabulario | 8.192 tokens (raices + sufijos turcos + BPE de respaldo; mayusculas marcadas con `<|B|>`, `<|BB|>`) |
| Tokenizador | paquete Python externo `filiz_sozluk` (no compatible con `tokenizers` de Hugging Face) |
| Eficiencia de tokenizacion | ~2,2 tokens por palabra en turco (frente a ~1,5 en modelos con vocabulario de 50k) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con la configuracion de Qwen3: 24 capas, dimension oculta 624, 12 cabezas de atencion de dimension 52, FFN SwiGLU de 1680, RMSNorm, RoPE y QK-norm por cabeza. Los pesos de embedding y de la cabeza de salida estan atados. La ventana de contexto es de 1.024 tokens, muy corta para estandares actuales, coherente con su orientacion a tareas cortas en dispositivo. No requiere `trust_remote_code`.

El entrenamiento se realizo en dos fases: primero un modelo de 50M (~0,6B tokens) y despues una expansion funcional a 118M con entrenamiento continuado (~0,9B tokens adicionales), totalizando ~1,5B tokens. Se uso Muon + AdamW con tasa de aprendizaje constante de 4e-4 sobre GPUs Kaggle T4. El corpus se limita a datos con licencias abiertas (CC BY, CC BY-SA, CC0, dominio publico, Apache-2.0, MIT, ODC-By), excluyendo licencias no comerciales: Wikipedia y proyectos hermanos en turco, Wikisource, resumenes academicos, cuentos y literatura, frases de Tatoeba, tareas de lectura y QA (tr_wiki_qa), la mitad del split de entrenamiento de MASSIVE tr-TR, datos de function calling de Glaive/Hermes (Apache-2.0), GSM8K y soluciones matematicas con llamadas a herramienta de calculo, y plantillas de tareas con reglas. Los conjuntos de evaluacion (XCOPA, Belebele, TurBLiMP, TurkishMMLU, test de MASSIVE) se excluyeron del entrenamiento y se aplico un filtro de fuga por n-gramas.

La innovacion principal es el tokenizador morfologico: un vocabulario de 8.192 unidades construido con raices y sufijos del turco, mas piezas BPE de respaldo y marcas separadas para mayusculas iniciales y todo-mayusculas. Esto encarece la tokenizacion (~2,2 tokens/palabra) pero reduce el vocabulario y presumiblemente mejora la generalizacion morfologica con menos datos. El modelo vio el formato de llamada a funciones durante el preentrenamiento, sin fine-tuning posterior.

## Capacidades

- Generacion de texto en turco con calidad aceptable para su tamano, orientada a respuestas cortas.
- Razonamiento causal basico en turco (XCOPA-tr) y conocimiento gramatical (TurBLiMP) por encima de modelos de hasta 360M.
- Llamada de funciones / tool calling en formato propio: el modelo emite `<|arama|>nombre {"campo": "valor"}` y recibe la respuesta del工具 dentro de `<|sonuc|> ... <|/sonuc|>`.
- Lectura extractiva para RAG: responder preguntas a partir de un texto proporcionado en el contexto.
- Respuesta corta a preguntas factuales simples.
- Soporte de conversacion multi-turno mediante el formato de roles `<|sistem|>`, `<|kullanici|>`, `<|filiz|>`, con cierre `<|son|>` por mensaje.
- Capacidad multilingue limitada: turco nativo, ingles debil (poca proporcion de texto natural en ingles en el corpus).
- Punto de partida para fine-tuning en tareas turcas especificas.
- No dispone de modo de razonamiento extendido (thinking), vision ni audio.

## Casos de uso

- Llamada de funciones en asistentes de dispositivo: con una lista de 3 a 7 herramientas candidatas, el modelo selecciona la correcta el 99,4% de las veces e identifica la intencion correcta el 85,6%, lo que lo hace viable para comandos de voz o interfaces de control en movil o electrodomestico.
- Lectura extractiva en pipelines RAG: dado un fragmento de documento en el contexto (hasta 1.024 tokens), el modelo extrae la respuesta; adecuado para busqueda documental en turco donde no se requiere conocimiento parametrico.
- Clasificacion y enrutado de intenciones: su buen rendimiento en seleccion de herramienta lo hace util como clasificador de intencion en un router de agentes, derivando cada consulta al servicio adecuado.
- Respuesta corta a preguntas frecuentes: para chatbots de FAQ con respuestas de una o dos frases, donde el contexto corto y la latencia minima son suficientes.
- Fine-tuning para dominios verticales turcos: al ser un modelo base de 118M con licencia Apache 2.0, es un punto de partida barato para ajustar en atencion al cliente, legal o sanidad con datos propios.
- Inferencia en dispositivo y en el borde: 118M parametros permiten ejecucion en CPU o GPUs integradas con cuantizacion, habilitando asistentes offline en turco sin conexion.
- Extraccion de campos estructurados de texto: con el formato de llamada a herramienta, puede poblar JSON a partir de texto libre, aunque con precision limitada en los valores de los campos (42,6% de intencion y campos exactos).
- Generacion de plantillas y tareas gramaticales: su conocimiento de TurBLiMP (79,8) sugiere utilidad en correccion o generacion de ejercicios morfologicos.

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

TurkishMMLU: Filiz-118M 18,2; ufakzeka-1 19,1 (nivel de azar en modelos por debajo de 0,5B).

Llamada a funciones sobre el split de test de MASSIVE tr-TR (500 comandos, no vistos en entrenamiento):

| Configuracion | Realizo llamada | Intencion correcta | Intencion + campos exactos |
|---|---|---|---|
| Herramienta correcta + 3-7 distractores | 99,4% | 85,6% | 42,6% |
| Las 60 herramientas definidas | 98,6% | 34,2% | 17,2% |

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,5 GB en fp32 (118M x 4 bytes), ~0,25 GB en fp16/bf16, ~0,12 GB en int8 y ~0,06 GB en int4 (pesos; el overhead de activaciones es minimo con contexto de 1.024 tokens).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; A100, H100, RTX 4090, RTX 3090, RTX 3060 o incluso T4 sobran para el modelo. Las T4 se usaron para su entrenamiento.
- Cabe en GPU de consumo y en iGPU/NPU: si, en practicamente cualquier GPU consumer de los ultimos diez anos, y en CPU con cuantizacion.
- Opciones de despliegue: transformers (referencia oficial), text-generation-inference (el repo esta etiquetado como compatible con endpoints), y conversion a GGUF para llama.cpp/Ollama. Requiere el paquete `filiz_sozluk` para tokenizar y decodificar, lo que complica el despliegue en servidores estandar hasta que exista una conversion del tokenizador.
- Latencia y throughput: no disponibles como cifras publicadas; por tamano, la generacion en GPU es del orden de miles de tokens por segundo en lote, y en CPU de decenas a cientos de tokens por segundo segun cuantizacion.
- Ajuste de generacion: se recomienda decodificacion greedy (`do_sample=False`); el autor advierte de que `repetition_penalty` y `no_repeat_ngram_size` penalizan tokens del prompt y rompen la copia literal y los nombres de herramientas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | XCOPA-tr | TurBLiMP | Licencia | Notas |
|---|---|---|---|---|---|---|
| Filiz-118M | 118M | 1.024 | 58,6 | 79,8 | Apache 2.0 | Entrenado desde cero, tokenizador morfologico propio, tool calling en preentrenamiento |
| ufakzeka-1-base | ~165M | no disponible | 59,2 | 81,9 | no disponible | Entrenado con ~13,5B tokens (9 veces mas); ligeramente superior en XCOPA y TurBLiMP |
| turkish-gpt2 | 124M | no disponible | 57,4 | 54,7 | no disponible | GPT-2 adaptado al turco; mucho peor en gramatica |
| SmolLM2-135M | 135M | no disponible | 53,2 | 50,5 | no disponible | Entrenado con 2T tokens; peor en tareas turcas |
| Qwen3-0.6B (base) | 600M | no disponible | 54,0 | 57,1 | Apache 2.0 | 5 veces mas parametros; mejor en Belebele (42,0) por cobertura multilingue |

Filiz-118M compite directamente con ufakzeka-1-base, que lo supera marginalmente en las dos metricas turcas discriminativas pese a usar casi diez veces mas datos de entrenamiento. Frente a SmolLM2-135M y turkish-gpt2, la ventaja en TurBLiMP es amplia (25-29 puntos). Qwen3-0.6B, pese a ser cinco veces mayor, queda por debajo en XCOPA-tr y TurBLiMP, aunque lo supera claramente en Belebele gracias a su entrenamiento multilingue masivo.

## Limitaciones y advertencias

- Baja precision factual: el autor reconoce que alucina; para tareas que requieren conocimiento debe proporcionarse el texto como contexto (RAG).
- No realiza calculos aritmeticos; esta disenado para invocar una herramienta de calculo.
- Generacion en ingles debil por la escasa proporcion de texto natural en ingles en el corpus.
- Puede entrar en bucles de repeticion en respuestas largas.
- Sin alineacion de seguridad: no hay ajuste por RLHF/DPO ni filtros; en produccion debe aplicarse moderacion de salida.
- Precision limitada en los valores de los campos de las llamadas a herramientas (42,6% exactos con pocos distractores; 17,2% con 60 herramientas); se recomienda restringir la lista de herramientas o hacer un fine-tuning corto.
- Contexto de solo 1.024 tokens: insuficiente para documentos largos o conversaciones extensas.
- Tokenizador no estandar: requiere el paquete `filiz_sozluk`, lo que complica la integracion con ecosistemas que esperan `tokenizers` de Hugging Face (vLLM, TGI, llama.cpp) sin trabajo adicional.
- Eficiencia de tokenizacion inferior a la media (~2,2 tokens/palabra frente a ~1,5), lo que encarece la inferencia por palabra pese al menor vocabulario.
- Licencia Apache 2.0 permite uso comercial, pero el autor pide contactar para colaboracion y uso comercial; conviene revisar las licencias del corpus de entrenamiento si se redistribuye.
- Modelo base sin fine-tuning conversacional: no debe desplegarse como chatbot general sin ajuste previo.
- Repo con 0 descargas y 0 likes en el momento de la consulta: ecosistema y soporte practicamente inexistentes.

## Enlaces

- Hugging Face: https://huggingface.co/smtturkan/filiz-118m
- GitHub (tokenizador y ejemplos): https://github.com/smtturkan-droid/filiz
- Issues del proyecto: https://github.com/smtturkan-droid/filiz/issues
- Kaggle Models: https://www.kaggle.com/models/samettrkan/filiz-118m
- Contacto del autor: smtturkan@gmail.com
