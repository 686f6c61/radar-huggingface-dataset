# masahiroid/bart-large-cnn-mlx

## Resumen

bart-large-cnn-mlx es una conversion no oficial a MLX de facebook/bart-large-cnn, el modelo BART-large de Meta AI afinado para resumen extractivo y abstractivo sobre el corpus CNN/DailyMail. Lo publica el usuario masahiroid como un repositorio de la comunidad, con pesos en safetensors en precision float16 y un total de 509.281.368 parametros almacenados (frente a los 406M que el autor atribuye al modelo base, diferencia atribuible a la inclusion de las matrices de embeddings y de la cabeza de generacion en el recuento). La licencia es MIT.

Su relevancia es practica mas que arquitectonica: permite ejecutar un encoder-decoder clasico de resumen en hardware Apple Silicon mediante MLX, algo que la libreria mlx_lm no cubre porque solo soporta modelos causales decoder-only. Para ello el autor reimplemento BART desde cero en `bart_mlx.py`, con bucle de decodificacion autorregresivo y cache KV. El modelo esta pensado para resumir documentos en ingles y, segun los tags del repositorio, tambien japones, aunque la validacion publicada se limita a un unico articulo en ingles.

El interes para desarrolladores e investigadores es doble: por un lado, ofrece una via de inferencia local de resumen en Mac; por otro, documenta con rigor la fidelidad numerica frente a la referencia PyTorch, algo poco habitual en conversiones comunitarias. No obstante, sus limitaciones son explicitas: solo decodificacion greedy, sin procesamiento por lotes y con una unica secuencia de entrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BART-large (transformer encoder-decoder, seq2seq) |
| Parametros totales | 509.281.368 (pesos safetensors); el autor cita 406M para el modelo base |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (BART-large admite hasta 1024 tokens de entrada, dato no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | float16 (unica precision publicada en este release) |
| Idiomas soportados | en, ja (segun tags del repositorio) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), con codigo Python auxiliar `bart_mlx.py` |

## Arquitectura y entrenamiento

La arquitectura es la de BART-large: un transformer encoder-decoder con atencion bidireccional en el encoder y causal en el decoder, preentrenado por Meta con un objetivo de denoising (corrupcion de texto y reconstruccion) y posteriormente afinado para resumen sobre CNN/DailyMail. Esta conversion no reentrena nada: reproduce los pesos originales de facebook/bart-large-cnn en MLX, en float16, e implementa la inferencia autorregresiva con cache KV.

La innovacion tecnica del repositorio no esta en el modelo sino en la implementacion: al no poder usar mlx_lm (que solo cubre modelos causales), el autor escribio un decoder BART completo para MLX. Ademas aplica por defecto `forced_bos_token_id` (token ID 0 tras el token de inicio del decoder), un detalle de la configuracion de generacion de referencia que, segun el autor, degrada notablemente la calidad si se omite porque la decodificacion greedy es muy sensible al primer token. La validacion publicada compara logits con teacher forcing contra la referencia PyTorch en fp32: similitud coseno de 0,99999356 en fp16 y coincidencia del 100% en el argmax del siguiente token. En generacion libre greedy, la salida coincide exactamente con la de PyTorch con `num_beams=1`.

## Capacidades

- Resumen de texto: genera resumenes abstractivos de articulos y documentos en ingles, con una longitud objetivo controlable mediante `max_new_tokens` (el ejemplo de la model card usa 142 tokens).
- Generacion seq2seq: al ser un encoder-decoder completo, puede emplearse en otras tareas de transformacion texto-a-texto, aunque no se ha validado fuera del resumen.
- Multilingue limitado: los tags declaran ingles y japones, pero no hay evaluacion publicada en japones.
- Decodificacion autorregresiva con cache KV, lo que reduce el coste computacional por token generado.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- No soporta procesamiento por lotes ni padding: una sola secuencia por llamada.

## Casos de uso

- Resumen de articulos de noticias en una aplicacion de lectura en Mac: el modelo recibe el cuerpo del articulo y devuelve un resumen de dos o tres frases, aprovechando que fue afinado especificamente sobre el estilo de CNN/DailyMail.
- Procesamiento local de boletines y correos largos: al ejecutarse en MLX sobre Apple Silicon, permite resumir documentos sin enviar el contenido a un servicio externo, lo que resulta adecuado para material confidencial.
- Preprocesado de documentacion tecnica en ingles: generar resumenes de READMEs o informes extensos antes de pasarlos a un modelo mayor o a un sistema de busqueda.
- Prototipado rapido de pipelines de resumen en entornos macOS: sirve para validar la calidad del resumen BART antes de invertir en despliegue con PyTorch o en un servicio en la nube.
- Herramienta de escritorio o CLI para periodistas y analistas: integrada en un script local, resume lotes de articulos uno a uno (sin batching) y exporta los resultados.
- Base para experimentos de conversion de arquitecturas seq2seq a MLX: el codigo `bart_mlx.py` sirve como referencia para portar otros encoder-decoders al framework.
- Generacion de resumenes en japones: posible segun los tags, pero sin validacion publicada, por lo que requiere evaluacion propia antes de usarlo en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, ROUGE u otros). La unica metrica aportada es la fidelidad numerica frente a la referencia PyTorch:

| Precision | Similitud coseno de logits (teacher forcing) | Coincidencia de argmax siguiente token |
|---|---|---|
| MLX fp32 | 1,0000001 | 100% |
| MLX fp16 (este release) | 0,99999356 | 100% |

En generacion greedy libre, la salida coincide exactamente con la de PyTorch con `num_beams=1` en el articulo de prueba (torre Eiffel). No hay datos de latencia ni de throughput.

## Requisitos de hardware

- VRAM o memoria unificada estimada: con 509M parametros en float16, los pesos ocupan aproximadamente 1 GB; el repo completo pesa 1,0 GB. Hay que sumar la cache KV y las activaciones, por lo que un margen de 2-3 GB de memoria es razonable.
- GPU recomendadas: no aplica en el sentido habitual; MLX esta disenado para Apple Silicon (series M1, M2, M3, M4). Cabe en cualquier Mac con memoria unificada de 8 GB o mas.
- Compatibilidad con GPU consumer NVIDIA: no disponible en esta implementacion, que depende de MLX.
- Opciones de despliegue: MLX con el script `bart_mlx.py` incluido y `transformers.AutoTokenizer` para el tokenizador. No es compatible con vLLM, llama.cpp, Ollama ni TGI en este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / framework | Notas |
|---|---|---|---|---|---|
| masahiroid/bart-large-cnn-mlx | 509M (pesos) | no disponible | MIT | safetensors MLX | Conversion comunitaria, solo greedy, sin batching |
| facebook/bart-large-cnn | 406M (segun el autor) | no disponible | MIT | PyTorch / transformers | Referencia original, beam search con `num_beams=4` y restriccion no-repeat-3-gram |
| facebook/bart-large | 406M (segun el autor) | no disponible | MIT | PyTorch / transformers | Modelo base sin afinado especifico de resumen |

No se dispone de datos comparativos de rendimiento (ROUGE u otras metricas) para ninguna de las alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo decodificacion greedy: no implementa beam search ni la restriccion no-repeat-3-gram de la configuracion de referencia, por lo que la salida puede diferir del modelo PyTorch original en generacion libre.
- Sin soporte de padding ni de lotes: solo procesa un documento por llamada, lo que limita el throughput en produccion.
- Idiomas: la validacion publicada es unicamente en ingles; el soporte de japones es declarativo y no esta evaluado.
- Longitud de entrada: no se documenta el limite practico de tokens de entrada en esta conversion.
- Riesgo de alucinacion: inherente a los modelos de resumen abstractivo; el modelo puede introducir datos no presentes en el texto fuente.
- Sesgos: al derivar de BART-large-cnn entrenado sobre CNN/DailyMail, hereda los sesgos del corpus periodistico en ingles (dominio tematico, estilo y posibles sesgos de representacion).
- Licencia MIT: permite uso comercial, pero al ser una conversion no oficial no hay garantia de mantenimiento ni soporte por parte de Meta.
- Madurez: repositorio con 0 descargas y 1 like en el momento de la consulta; creado en octubre de 2026 y actualizado en noviembre de 2026. No es un release oficial.
- Dependencia de codigo incluido: requiere el archivo `bart_mlx.py` del repositorio, lo que implica auditar el codigo antes de usarlo. El autor declara una auditoria con model-audit-lite y un ML-BOM en `SECURITY.md`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masahiroid/bart-large-cnn-mlx
- Modelo base: https://huggingface.co/facebook/bart-large-cnn
- Repositorio MLX: https://github.com/ml-explore/mlx
- Herramienta de auditoria del autor: https://github.com/masahiroid/model-audit-lite
- README en japones: README.ja.md dentro del repositorio del modelo
- Documento de seguridad: SECURITY.md dentro del repositorio del modelo
