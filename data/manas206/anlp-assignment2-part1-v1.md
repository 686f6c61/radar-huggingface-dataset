# Manas206/anlp-assignment2-part1-v1

## Resumen

anlp-assignment2-part1-v1 es un modelo de traduccion automatica de tipo decoder-only publicado por el usuario Manas206 como parte de una practica academica de una asignatura de procesamiento de lenguaje natural (ANLP). No parte de ningun transformer preentrenado: es una implementacion propia en PyTorch que incorpora capas de mezcla de expertos (mixture-of-experts) y un tokenizador BPE a nivel de byte compartido de 16.000 tokens. La direccion de traduccion documentada es de vietnamita o japones hacia ingles, invocada con el prefijo de prompt `<bos> <vi-or-ja> SOURCE <en>`.

El checkpoint publicado corresponde a una unica epoca de entrenamiento, con 6.973 actualizaciones y 40.187.852 tokens de entrenamiento no de relleno, sobre el split oficial del dataset belumind/en-vi-ja-curated-500k-triplets. Su capacidad de contexto es de solo 384 tokens, lo que lo confina a frases o parrafos muy cortos y descarta cualquier tarea que requiera contexto largo.

Su relevancia es academica y de laboratorio, no de produccion: no se publica licencia, ni ficha de idiomas, ni numero de parametros, ni resultados de evaluacion, y el repositorio completo ocupa 0,1 GB. Resulta util como material de estudio sobre entrenamiento desde cero de decoders pequenos con mezcla de expertos y como linea base en ejercicios de traduccion, pero no como motor de traduccion desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con capas de mezcla de expertos, implementacion propia en PyTorch sin inicializacion desde transformer preentrenado |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 384 tokens |
| Tipos de cuantizacion | no disponible (se publica un checkpoint PyTorch; no hay versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible en los metadatos; el formato de prompt documentado cubre vietnamita (vi) y japones (ja) como origen e ingles (en) como destino |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch cargado mediante el script propio `load_model.py`; no se especifica safetensors ni GGUF |
| Vocabulario | 16.000 tokens, BPE a nivel de byte compartido |
| Actualizaciones de entrenamiento | 6.973 |
| Tokens de entrenamiento (no de relleno) | 40.187.852 |
| Tamano del repositorio | 0,1 GB |
| Pipeline declarado | translation |

## Arquitectura y entrenamiento

Se trata de un decoder-only autorregresivo escrito a mano en PyTorch, sin pesos preentrenados de partida, que segun las etiquetas del repositorio incluye capas de mezcla de expertos. El tokenizador es un BPE a nivel de byte compartido entre origen y destino, con un vocabulario de 16.000 entradas, y la salida del modelo son logits de forma `[batch, time, 16000]`. La entrada se procesa con `model.forward(input_ids, attention_mask)`. La capacidad de contexto declarada es de 384 tokens, muy por debajo de los 512 tokens habituales en modelos de traduccion y de las ventanas de decenas de miles de tokens de los modelos generativos actuales.

El entrenamiento cubre una epoca completa (la variante V1 se etiqueta como `one_epoch`), con 6.973 actualizaciones y 40.187.852 tokens no de relleno, sobre el split oficial de entrenamiento de belumind/en-vi-ja-curated-500k-triplets. No se documenta ninguna fase de ajuste por instrucciones, RLHF ni DPO. La model card advierte de que existe una variante V3 que es una ejecucion parcial y que no esta igualada en presupuesto de entrenamiento con las variantes completadas, por lo que las comparaciones entre variantes deben hacerse con cautela. El volumen total de tokens de entrenamiento es bajo para una tarea de traduccion neuronal (los sistemas de traduccion suelen entrenarse con cientos de millones o miles de millones de tokens), lo que junto a la ausencia de preentrenamiento limita previsiblemente la calidad de las traducciones, aunque no se publican metricas que lo confirmen.

## Capacidades

- Traduccion automatica de vietnamita a ingles y de japones a ingles, segun el prefijo de prompt documentado.
- Generacion autoregresiva con logits sobre un vocabulario de 16.000 tokens (BPE a nivel de byte).
- Procesamiento por lotes mediante `model.forward(input_ids, attention_mask)`.
- No hay soporte documentado de tool calling ni de function calling.
- No hay soporte documentado de agentes, planificacion ni razonamiento multi-paso.
- No hay modo "thinking", ni capacidad de vision, audio o multimodalidad.
- No hay plantilla de chat ni rol de sistema documentados; la unica interfaz descrita es el formato de prompt de traduccion.
- El multilingue se limita a los pares indicados en el prompt; no se declara cobertura de otros idiomas.

## Casos de uso

- Practicas y trabajos de asignatura: el modelo se ha publicado precisamente como entrega de una asignatura, de modo que sirve para reproducir el pipeline completo (descarga, `sys.path`, `load_model`, inferencia) y comparar variantes V1 y V3 en cuanto a presupuesto de entrenamiento.
- Estudio de mezcla de expertos en decoders pequenos: al ser una implementacion propia con capas MoE y sin peso preentrenado, permite inspeccionar el enrutado de expertos y el coste por token en un modelo de 0,1 GB, algo inviable en modelos MoE de escala industrial.
- Linea base en experimentos de traduccion vi-en y ja-en: util para medir la mejora que aportan tecnicas como preentrenamiento, mas datos o contextos mas largos frente a un modelo entrenado desde cero con 40 millones de tokens.
- Traduccion de cadenas muy cortas en prototipos internos: titulos de producto, etiquetas o frases sueltas que quepan holgadamente en 384 tokens, siempre que la licencia se aclare antes de cualquier uso mas alla del laboratorio.
- Analisis de tokenizacion y prompts: el prefijo `<bos> <vi-or-ja> SOURCE <en>` permite experimentar con la influencia del marcado de idioma en la salida y con el comportamiento del BPE de 16.000 tokens en escrituras no latinas.
- Generacion de hipotesis para anotacion humana: en un flujo de trabajo de creacion de corpus, las traducciones del modelo pueden usarse como borradores que un revisor humano corrige, dado el bajo coste computacional de ejecutarlo.
- Docencia sobre evaluacion de modelos: sirve como caso de estudio de un repositorio sin licencia, sin ficha de idiomas y sin metricas, para ilustrar que datos debe exigir una ficha de modelo antes de adoptarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye BLEU, chrF, COMET ni ninguna otra metrica de traduccion, y tampoco se aportan resultados de evaluacion en la informacion de HuggingFace. El autor indica que los ajustes de evaluacion de test y la procedencia del checkpoint se entregan como ficheros JSON dentro del repositorio, pero sus valores no forman parte de la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta, ya que no se publica el numero de parametros. Como referencia aritmetica, un repositorio de 0,1 GB que contuviera solo pesos en fp32 implicaria un maximo de aproximadamente 25 millones de parametros (unos 100 MB de pesos), es decir, una huella de VRAM inferior a 1 GB.
- GPU recomendadas: cualquiera con al menos 1-2 GB de VRAM disponible deberia ser suficiente para un modelo de este orden de magnitud; tambien es viable la inferencia en CPU.
- GPU de consumo: si, cabe con holgura en cualquier GPU de consumo actual (serie RTX 30/40, e incluso en GPU integradas y en CPU), segun la estimacion anterior a partir del tamano del repositorio.
- Opciones de despliegue: la unica ruta documentada es PyTorch nativo con `from load_model import load_model; model, tokenizer = load_model(directory)`. vLLM, TGI, llama.cpp y Ollama requeririan registrar o reimplementar esta arquitectura propia, ya que no existe una conversion publicada a GGUF ni soporte nativo.
- Requisitos de software: `torch==2.7.0` y `tokenizers==0.23.1`, tal como indica la model card.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de su documentacion publica, no de la informacion proporcionada sobre este modelo. Las celdas de anlp-assignment2-part1-v1 reflejan unicamente lo publicado.

| Modelo | Parametros | Longitud de contexto | Idiomas | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| anlp-assignment2-part1-v1 | no disponible | 384 | vi/ja a en (segun prompt) | no disponible | no disponible |
| NLLB-200 distilled 600M | 600 M | 512 | 200 | CC-BY-NC-4.0 (uso comercial restringido) | metricas BLEU/chrF publicadas |
| M2M-100 418M | 418 M | 512 | 100 | MIT | metricas BLEU publicadas |
| Opus-MT (MarianMT) | aproximadamente 77 M por par de idiomas | 512 | cientos de pares | CC-BY 4.0 | metricas BLEU publicadas por modelo |

Frente a estas alternativas, el modelo de Manas206 no ofrece garantias de licencia, ni cobertura multilingue declarada, ni resultados de evaluacion, y su ventana de contexto es un 25 por ciento mas corta que el estandar de 512 tokens de la categoria. Su unico elemento diferencial es que se entrena desde cero con capas de mezcla de expertos, lo que lo convierte en un objeto de estudio y no en un competidor de estos sistemas.

## Limitaciones y advertencias

- Ausencia total de licencia: no se especifica ninguna, por lo que no hay autorizacion explicita para uso comercial ni para redistribucion; debe tratarse como material academico sin uso en produccion.
- Sin ficha de idiomas ni numero de parametros: no es posible dimensionar el modelo ni verificar que idiomas cubre realmente mas alla de los pares indicados en el prompt.
- Sin metricas de evaluacion: no hay BLEU, chrF ni COMET, de modo que la calidad de traduccion es desconocida y no se puede comparar con alternativas de forma objetiva.
- Riesgo de alucinacion y de salidas degradadas: un decoder generativo entrenado desde cero con 40 millones de tokens y sin preentrenamiento tiende a producir traducciones inexactas, omisiones y contenido inventado, especialmente fuera del dominio del corpus de entrenamiento.
- Contexto muy limitado: 384 tokens obligan a fragmentar cualquier documento; ademas, no hay garantia de que el modelo maneje correctamente entradas cercanas a ese limite.
- Cobertura de idiomas restringida al marcado del prompt; no se declara soporte de otras lenguas ni de traduccion inversa (en a vi/ja).
- Sesgos desconocidos: no se documenta composicion del dataset, filtrado, ni analisis de sesgos; el corpus belumind/en-vi-ja-curated-500k-triplets se referencia como "curated" pero sin detalle de su proceso de curacion.
- Artefacto de asignatura: el autor advierte de que la variante V3 es una ejecucion parcial y no igualada en presupuesto de entrenamiento, lo que sugiere que el repositorio contiene checkpoints con presupuestos de entrenamiento no comparables entre si.
- Despliegue no estandar: al requerir un `load_model.py` propio, la integracion en servidores de inferencia convencionales exige trabajo adicional de portado y mantenimiento.
- Datos de publicacion llamativos: el repositorio registra cero descargas y cero "likes", y la fecha de creacion indicada en los metadatos (2026-10-03) es posterior a la fecha habitual de consulta, por lo que conviene verificar la vigencia del artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Manas206/anlp-assignment2-part1-v1
- Dataset referenciado en la model card: belumind/en-vi-ja-curated-500k-triplets (split oficial de entrenamiento)
- No se han realizado busquedas web adicionales ni se ha proporcionado ningun otro enlace (paper, blog, repositorio o demo) en la informacion disponible.
