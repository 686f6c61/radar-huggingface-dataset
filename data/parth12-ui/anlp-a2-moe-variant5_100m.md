# parth12-ui/anlp-a2-moe-variant5_100m

## Resumen

El modelo `parth12-ui/anlp-a2-moe-variant5_100m` es un transformer decoder-only con capas feed-forward de tipo mixture-of-experts (MoE), desarrollado por el usuario parth12-ui como parte de una asignatura academica (ANLP Assignment 2, Part 1). Esta entrenado desde cero para traducir vietnamita e ingles y japones a ingles, sobre el conjunto de datos `belumind/en-vi-ja-curated-500k-triplets`. Su proposito es servir como banco de pruebas de variantes de arquitectura MoE frente a alternativas densas, no como modelo de produccion.

Se trata de un modelo muy pequeno: 50.160.128 parametros totales y 33.382.912 parametros activos por token, con 8 capas, d_model de 512, 8 cabezas de atencion y una ventana de contexto de solo 256 tokens. La variante 5 usa 4 expertos con enrutamiento top-2, disenada para igualar los parametros activos de un modelo denso de referencia. El presupuesto de entrenamiento es de 100.002.186 tokens.

Su relevancia es fundamentalmente didactica y de investigacion: permite comparar empiricamente distintas variantes de enrutamiento MoE (top-1, top-2) con el mismo presupuesto de parametros activos. Los resultados publicados en la model card muestran un BLEU global de 38,95 (44,31 en vi→en y 33,49 en ja→en) con decodificacion greedy sobre 1000 filas. No es un modelo apto para uso comercial o de produccion sin validacion adicional, y no declara licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con FFN de tipo mixture-of-experts (MoE), 4 expertos, enrutamiento top-2 |
| Parametros totales | 50.160.128 |
| Parametros activos | 33.382.912 por token |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita, japones, ingles (traduccion vi→en y ja→en) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

Detalles adicionales de configuracion: 8 capas, d_model 512, 8 cabezas de atencion, d_ff denso 2048, tokenizador byte-level BPE incluido en `tokenizer.json`, 100.002.186 tokens de entrenamiento.

## Arquitectura y entrenamiento

Arquitectura decoder-only estilo GPT con sustitucion de las capas feed-forward densas por capas MoE. La variante 5 emplea 4 expertos con enrutamiento top-2, de modo que cada token activa dos expertos ademas del mecanismo de atencion. El objetivo declarado del experimento es igualar el numero de parametros activos por token de un modelo denso equivalente, de forma que la comparacion con otras variantes (por ejemplo top-1, con los parametros totales igualados al denso) aisle el efecto del diseno de enrutamiento.

El entrenamiento es from scratch sobre `belumind/en-vi-ja-curated-500k-triplets`, un corpus de tripletas en ingles-vietnamita-japones. El formato de entrada es `<bos> <vi|ja> source <sep> english <eos>`, es decir, traduccion unidireccional hacia ingles. No se indica en la informacion disponible si hubo fases de RLHF, DPO o ajuste por instrucciones; al ser un modelo de traduccion y un trabajo academico, lo previsible es entrenamiento supervisado puro, pero este extremo no esta confirmado. Tampoco se detallan la composicion exacta del dataset, la estrategia de balanceo entre expertos, la funcion auxiliar de load balancing ni la inicializacion del router.

## Capacidades

- Traduccion automatica vietnamita a ingles y japones a ingles, unica direccion soportada.
- Generacion de texto autoregresiva en formato prompt especifico (`<bos> <vi|ja> source <sep> english <eos>`).
- Tokenizacion byte-level BPE multilingue para los tres idiomas.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta modo de razonamiento explicito (thinking mode).
- No se documentan capacidades de vision, audio ni modalidades adicionales.
- El multilingue se limita a la direccion vi→en y ja→en; no se declara traduccion inversa (en→vi, en→ja) ni traduccion directa vi↔ja.

## Casos de uso

- Traduccion de frases cortas y oraciones sueltas para preprocesado de corpus: con 256 tokens de contexto, el modelo puede traducir segmentos individuales extraidos de documentos de mayor tamano, lo que resulta util para construir datasets paralelos a partir de fuentes vi/ja.
- Generacion de datos sinteticos mediante back-translation: al traducir vi→en y ja→en se puede ampliar un corpus paralelo, siempre que se valide la calidad con metricas automaticas como BLEU o COMET antes de reutilizarlo.
- Traduccion de mensajes de chat o soporte de baja latencia en el borde: al tratarse de un modelo de ~50M de parametros, cabria desplegarlo en CPU o en GPU integrada con latencia muy baja, adecuado para traducir turnos cortos de conversacion.
- Investigacion comparativa de arquitecturas MoE: sirve como punto de referencia en estudios que midan el efecto del enrutamiento top-1 frente a top-2 con el mismo presupuesto de parametros activos.
- Docencia y practicas de ingenieria NLP: util para reproducir end-to-end el pipeline de entrenamiento, evaluacion y despliegue de un modelo de traduccion MoE a pequena escala.
- Filtrado y clasificacion de contenido multilingue por similitud de traduccion: la perplexidad baja publicada permite usarlo como estimador de fluidez de fragmentos vi/ja traducidos automaticamente.
- Construccion de prototipos de interfaz de traduccion: integrado en demos tipo Gradio o Streamlit para validar la viabilidad de la direccion vi/ja→en sin coste de inferencia relevante.
- Aumento de datos para entrenar modelos mayores: las traducciones generadas pueden emplearse como preentrenamiento o como datos de destilacion, con la advertencia de propagar los sesgos y errores del modelo pequeno.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card con decodificacion greedy sobre 1000 filas:

| Metrica | Global | vi→en | ja→en |
|---|---|---|---|
| Perplexidad (tokens objetivo) | 3,61 | 3,17 | 4,11 |
| BLEU (greedy, 1000 filas) | 38,95 | 44,31 | 33,49 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Tampoco se proporcionan comparaciones directas con modelos densos o con otras variantes de enrutamiento del mismo experimento, mas alla de la descripcion cualitativa de la variante 2.

## Requisitos de hardware

- VRAM estimada: aproximadamente 200 MB en FP32 (50,16M parametros × 4 bytes) y alrededor de 100 MB en FP16/BF16, mas el espacio de activaciones, que es pequeno por el contexto de 256 tokens.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090 e incluso GPU integradas, con margen amplisimo.
- Inferencia viable en CPU: dado el tamano, un solo nucleo moderno puede servir peticiones de baja concurrencia con latencias de decenas de milisegundos por frase corta.
- Opciones de despliegue: el autor proporciona codigo propio (`model_src/config.py` y `model_src/model.py`) y carga de pesos con `safetensors.torch.load_model`, por lo que la ruta natural es PyTorch puro. No se declara compatibilidad con vLLM, llama.cpp, Ollama, TGI ni llama-cpp, ni se publican conversiones a GGUF.
- Latencia y throughput: no disponibles. No se aportan mediciones de tokens/s ni de tiempo por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anlp-a2-moe-variant5_100m | 50,16M totales / 33,38M activos | 256 | vi→en, ja→en | no disponible | HuggingFace |
| anlp-a2-moe-variant2 | no disponible (total igualado al denso) | no disponible | vi→en, ja→en | no disponible | HuggingFace |
| NLLB-200 (Meta AI) | no disponible | no disponible | 200 idiomas | no disponible | HuggingFace |

El modelo hermano `parth12-ui/anlp-a2-moe-variant2` usa 4 expertos con enrutamiento top-1 y los parametros totales igualados a un denso, por lo que constituye la comparacion mas directa dentro del mismo experimento. No se dispone de los numeros de BLEU o perplexidad de esa variante en la informacion proporcionada. NLLB-200 aparece en las referencias como modelo de traduccion multilingue de referencia, pero no se dispone de sus especificaciones exactas en esta busqueda, por lo que sus campos quedan como "no disponible". No se han encontrado otros modelos comparables de 50M de parametros con arquitectura MoE y foco vi/ja→en en la informacion disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se documenta ningun analisis de sesgo. Al entrenarse sobre un unico corpus curado de tripletas, puede heredar sesgos de dominio, registro y representacion de los idiomas de origen.
- Riesgo de alucinacion: existe, como en cualquier modelo generativo. En traduccion se manifiesta como omisiones, adiciones o cambios de sentido, especialmente en frases largas o poco frecuentes.
- Contexto muy limitado: 256 tokens. No admite documentos largos, conversaciones multi-turno extensas ni traduccion con memoria de contexto amplia; hay que segmentar la entrada.
- Direccionalidad restringida: solo vi→en y ja→en. No soporta traduccion inversa ni vi↔ja directa.
- Modelo de 50M de parametros: la calidad en vocabulario tecnico, nombres propios, expresiones idiomaticas y dominios especializados sera limitada en comparacion con modelos de cientos de millones o miles de millones de parametros.
- Licencia no disponible: sin una licencia explicita no hay autorizacion clara para uso comercial. Debe tratarse como no apto para produccion hasta que el autor aclare los terminos.
- Origen academico: es un trabajo de asignatura, sin garantias de mantenimiento, soporte ni versionado.
- Despliegue no estandarizado: requiere el codigo propio del repositorio; no hay integracion con runtimes habituales de inferencia ni conversiones a formatos como GGUF.
- Fecha de creacion poco habitual (2026-10-04 segun los metadatos), con 0 descargas y 0 likes, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/parth12-ui/anlp-a2-moe-variant5_100m
- Variante 2 del mismo autor: https://huggingface.co/parth12-ui/anlp-a2-moe-variant2
- Repositorio ANLP_MOE en GitHub: https://github.com/ViratGarg2/ANLP_MOE/tree/main/
- Revision de arquitecturas MoE en LLM (arXiv): https://arxiv.org/html/2507.11181v2
- Directorio de modelos MoE de codigo abierto: https://models.moe/
- Articulo de Wikipedia sobre mixture of experts: https://en.wikipedia.org/wiki/Mixture_of_experts
