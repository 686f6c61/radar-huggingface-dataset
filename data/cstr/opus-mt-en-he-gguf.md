# cstr/opus-mt-en-he-GGUF

## Resumen

Opus-MT English → Hebrew — GGUF es una conversion al formato GGUF/ggml del modelo de traduccion automatica `Helsinki-NLP/opus-mt-en-he`, desarrollado originalmente por el proyecto OPUS-MT de la Universidad de Helsinki. Se trata de un modelo MarianMT de tipo encoder-decoder, especificamente un transformer de 6 capas de encoder y 6 de decoder con dimension de modelo d=512, que suma 78.438.191 parametros. Esta conversion ha sido realizada por el usuario `cstr` para su uso con el motor CrispASR mediante el backend `marian`.

El modelo resuelve una tarea muy concreta: la traduccion de texto de ingles a hebreo. Su tamano reducido (unos 78 millones de parametros) lo situa en la categoria de modelos ligeros, lo que permite ejecutarlo en hardware modesto e incluso en CPU con latencias muy bajas, algo especialmente relevante para su caso de uso principal dentro de CrispASR: la traduccion en directo de transcripciones de voz (`--live-translate`).

La relevancia de esta publicacion radica en que reproduce fielmente el comportamiento de la implementacion de referencia (`MarianMTModel.generate` de Hugging Face `transformers`) y lo empaqueta en dos variantes GGUF listas para su despliegue: f16 y q8_0. No es un modelo nuevo entrenado desde cero, sino un cambio de formato cuyos pesos permanecen sin cambios en f16 y cuantizados a q8_0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (MarianMT), 6 capas encoder + 6 capas decoder, d=512 |
| Parametros totales | 78.438.191 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16 y q8_0 |
| Idiomas soportados | ingles (en), hebreo (he) |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF (ggml) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-decoder de tipo MarianMT, con 6 capas en el encoder y 6 en el decoder y una dimension de modelo de 512. El checkpoint original forma parte de la publicacion `opus-2019-12-18` del proyecto OPUS-MT (Jörg Tiedemann y Santhosh Thottingal, Universidad de Helsinki), descrita en el articulo *OPUS-MT — Building open translation services for the World* (EAMT 2020). El entrenamiento se realizo sobre datos paralelos del corpus OPUS, un agregado de corpus de traduccion de dominio publico.

Esta ficha corresponde exclusivamente a la conversion de formato, no al entrenamiento. Segun la model card, los pesos permanecen sin cambios en la variante f16 y se cuantizan a q8_0 en la variante reducida. El proceso de conversion se documenta mediante los scripts `models/convert-marian-to-gguf.py` y `crispasr-quantize`, ademas de una utilidad de verificacion de paridad (`tools/marian_parity.py`) que compara las salidas del modelo GGUF con las de la implementacion de referencia de Hugging Face.

## Capacidades

- Traduccion de texto de ingles a hebreo (direccion unica; la direccion inversa, cuando existe, se publica como `cstr/opus-mt-he-en-GGUF`).
- Generacion de traducciones tanto en modo greedy (con `-bs 1`) como en modo beam search (utilizando el tamano de beam propio del checkpoint).
- Integracion en pipeline de transcripcion en directo: reconocimiento de voz en ingles y traduccion simultanea frase a frase con la opcion `--live-translate` de CrispASR.
- Ejecucion sobre el backend `marian` del motor CrispASR.
- No dispone de soporte de tool calling, function calling, capacidades de agente ni razonamiento multi-paso.
- No dispone de capacidades multimodales (vision, audio) ni de modo de razonamiento (thinking mode).
- Capacidad multilingue limitada al par en-he; no esta disenado para traduccion generica entre otros idiomas.

## Casos de uso

- Traduccion en directo de reuniones: el modelo se integra en CrispASR junto con un reconocedor de voz en ingles para producir transcripcion y traduccion al hebreo frase a frase, aprovechando su baja latencia y tamano reducido.
- Subtitulado automatizado de contenido en ingles hacia hebreo: al ser un modelo ligero (89 MB en q8_0), se puede ejecutar localmente sobre un flujo de subtitulos sin depender de servicios en la nube.
- Preprocesado de corpus para investigacion en PLN: traduccion rapida de grandes volumenes de texto ingles a hebreo para tareas de analisis o alineacion.
- Traduccion embebida en aplicaciones de escritorio o moviles: el modelo cabe holgadamente en memoria de dispositivos con recursos limitados y puede ejecutarse en CPU.
- Sistemas de atencion al cliente en ingles con salida en hebreo: aunque sin soporte de herramientas ni multi-turno nativo, puede actuar como capa de traduccion dentro de un sistema mayor que gestione el dialogo.
- Generacion de borradores de traduccion para revisores humanos: util como primera pasada dado su bajo coste computacional, con revision posterior por parte de traductores.
- Experimentacion y evaluacion de tecnicas de cuantizacion: el par f16/q8_0 y la utilidad de paridad permiten medir el impacto de la cuantizacion en la calidad de traduccion.
- Despliegue en entornos sin conexion o con requisitos de privacidad: al ejecutarse localmente, evita enviar texto a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, BLEU, etc.) en la informacion disponible. La model card unicamente documenta una prueba de paridad funcional frente a la implementacion de referencia de Hugging Face sobre 8 frases de test:

| Variante | Tamano | Coincidencia greedy | Coincidencia beam 4 |
|---|---|---|---|
| opus-mt-en-he-f16.gguf | 162 MB | 8/8 frases identicas | 8/8 frases identicas |
| opus-mt-en-he-q8_0.gguf | 89 MB | 8/8 frases identicas | no disponible (las restantes difieren en redaccion) |

Segun la model card, los identificadores de tokens de entrada fueron identicos en 8/8 casos.

## Requisitos de hardware

- VRAM estimada para inferencia: minima, inferior a 0,5 GB. La variante f16 ocupa 162 MB y la q8_0 89 MB.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, cualquier GPU con al menos 1 GB de memoria es suficiente (integradas incluidas).
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, etc.) y tambien en CPU, dado su tamano.
- Opciones de despliegue: el modelo esta formateado para el motor CrispASR con el backend `marian`; se distribuye como GGUF/ggml. No se documentan en la informacion disponible integraciones con vLLM, TGI u Ollama.
- Latencia y throughput estimados: no disponibles. La model card indica que en CrispASR estos modelos son "los traductores mas rapidos" para transcripcion y traduccion en directo, pero sin cifras concretas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. A continuacion se indican alternativas de la misma categoria que podrian servir de referencia, sin datos de rendimiento disponibles:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| cstr/opus-mt-en-he-GGUF | 78,4 M | no disponible | cc-by-4.0 | GGUF, CrispASR (backend marian) |
| cstr/opus-mt-he-en-GGUF | no disponible | no disponible | no disponible | GGUF |
| Helsinki-NLP/opus-mt-en-he | 78,4 M (equivalente) | no disponible | cc-by-4.0 | safetensors (transformers) |

## Limitaciones y advertencias

- Modelo unidireccional: solo traduce de ingles a hebreo; para la direccion contraria hace falta un modelo distinto (`cstr/opus-mt-he-en-GGUF`, si existe).
- Solo dos idiomas: no soporta traduccion generica entre otros pares linguisticos.
- Tamano reducido: al tener unos 78 millones de parametros, la calidad de traduccion sera inferior a la de modelos de traduccion de mayor tamano o a servicios comerciales, especialmente en textos largos, especializados o con terminologia tecnica.
- Riesgo de alucinacion y errores de traduccion: como cualquier modelo neuronal de traduccion, puede producir omisiones, adiciones o traducciones incorrectas no marcadas como tales.
- Longitud de contexto: no documentada; los modelos MarianMT suelen estar limitados a secuencias relativamente cortas, lo que puede truncar entradas largas.
- Diferencia de comportamiento en tokens especiales: segun la model card, las cadenas literales `</s>`, `<unk>` y `<pad>` se tratan como texto normal en esta implementacion GGUF, mientras que la referencia las interpreta como tokens especiales. Esto puede generar divergencias en entradas que contengan dichas cadenas.
- En modo live la decodificacion es siempre greedy, lo que puede reducir la calidad frente a beam search.
- En la variante q8_0, fuera de las 8 frases de paridad, las traducciones pueden diferir en redaccion respecto a la referencia.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribucion al proyecto OPUS-MT. La model card subraya que la atribucion a OPUS-MT es obligatoria para la redistribucion.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cstr/opus-mt-en-he-GGUF
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-he
- Modelo en direccion inversa: https://huggingface.co/cstr/opus-mt-he-en-GGUF
- Repositorio de CrispASR: https://github.com/CrispStrobe/CrispASR
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Repositorio OPUS-MT-train: https://github.com/Helsinki-NLP/OPUS-MT-train
- Corpus OPUS: https://opus.nlpl.eu/
