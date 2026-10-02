# malinali-app/opus-mt-en-lg

## Resumen

`malinali-app/opus-mt-en-lg` es un paquete de pesos de traduccion automatica para la direccion ingles (en) a luganda (lg), publicado por el desarrollador `malinali-app` para su aplicacion Malinali. No se trata de un modelo entrenado desde cero, sino de un reempaquetado del modelo de codigo abierto `Helsinki-NLP/opus-mt-en-lg`, parte de la familia OPUS-MT de la Universidad de Helsinki. La aportacion de este repositorio es la conversion de los pesos a formato safetensors y la transformacion de los tokenizadores SentencePiece originales en tokenizadores rapidos (fast tokenizers) compatibles con Hugging Face, junto con soporte explicito para inferencia on-device a traves de Candle (el runtime de Rust) mediante el componente `marian_flutter`.

El modelo emplea una arquitectura Marian, un transformer encoder-decoder, con un total de 75.672.095 parametros y un tamano de repositorio de 0,3 GB. Su proposito es la traduccion bidireccional de frases cortas y parrafos entre ingles y luganda, con un enfoque claro hacia ejecucion local en dispositivos (moviles, escritorio) sin dependencia de servidores externos.

Su relevancia es doble: por un lado, cubre un par de idiomas de bajos recursos (el luganda, hablado en Uganda, con escasa cobertura en sistemas de traduccion comerciales) y, por otro, demuestra un patron de despliegue practico para llevar modelos de traduccion a aplicaciones cliente mediante Candle y safetensors. La licencia no esta declarada en la ficha de este repositorio; el autor remite a la licencia del modelo original, que en OPUS-MT suele ser CC-BY 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | 75.672.095 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin variantes GGUF/AWQ/GPTQ declaradas) |
| Idiomas soportados | en (ingles), lg (luganda) |
| Licencia | no disponible en el repositorio; el autor remite a la licencia del modelo base (tipicamente CC-BY 4.0 en OPUS-MT) |
| Formato de pesos | safetensors (model.safetensors), mas config.json y tokenizadores JSON |

## Arquitectura y entrenamiento

El modelo es una red Marian, la arquitectura seq2seq de traduccion automatica neuronal desarrollada por el equipo de Helsinki-NLP para el proyecto OPUS-MT. Se compone de un encoder y un decoder transformer con atencion, y su tamano (75,7 millones de parametros) corresponde a la configuracion base estandar de los modelos bilingues OPUS-MT de direccion unica. Los pesos se distribuyen en un unico fichero `model.safetensors` acompanado de un `config.json` con la configuracion Marian.

En cuanto al entrenamiento, este repositorio no aporta informacion sobre el numero de tokens ni la composicion del corpus utilizado, ya que el autor indica expresamente que Malinali solo reempaqueta los pesos y convierte los tokenizadores, sin reclamar la propiedad del modelo entrenado. Los detalles de entrenamiento, la composicion del dataset y cualquier fase de ajuste (RLHF/DPO) corresponderian al modelo base `Helsinki-NLP/opus-mt-en-lg`, cuyos datos no se incluyen en la informacion proporcionada. La innovacion tecnica del repositorio es de ingenieria de despliegue: la separacion en dos tokenizadores rapidos (`tokenizer-enc.json` para la fuente y `tokenizer-dec.json` para el destino) y la compatibilidad con Candle para inferencia nativa, lo que elimina la dependencia de SentencePiece y del stack de Python en el dispositivo final.

## Capacidades

- Traduccion de texto directa de ingles a luganda (unica direccion declarada: en -> lg).
- Generacion de texto seq2seq mediante el pipeline de traduccion de transformers.
- Tokenizacion rapida compatible con Hugging Face (formato JSON) para los lados fuente y destino.
- Inferencia on-device mediante Candle (runtime Rust) a traves del componente `marian_flutter`.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que permite desplegarlo como servicio gestionado.
- Ejecucion sin conexion y sin servidores externos, orientada a aplicaciones cliente.
- No dispone de soporte declarado de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Traduccion on-device en aplicaciones moviles: una app Flutter puede empaquetar los pesos (0,3 GB) e invocar Candle para traducir texto en ingles a luganda sin conexion, adecuado para usuarios con conectividad limitada.
- Traduccion de interfaces y contenidos de producto: localizacion de cadenas cortas y textos de UI del ingles al luganda en tiempo de ejecucion dentro de la propia aplicacion.
- Asistencia linguistica a personal sanitario o humanitario: traduccion de instrucciones e indicaciones breves en contextos de campo donde no hay acceso a internet.
- Preprocesamiento de corpus para investigacion en idiomas de bajos recursos: uso del modelo como traductor base para generar pares en-ingles/luganda alineados y ampliar datasets.
- Traduccion en el navegador o en el escritorio: al ser un modelo de ~76 M de parametros, puede integrarse en extensiones o aplicaciones de escritorio con huella de memoria muy reducida.
- Comunicacion en entornos educativos: apoyo a estudiantes y docentes para traducir materiales del ingles al luganda en dispositivos modestos.
- Pipeline de traduccion por lotes en servidores pequenos: al caber holgadamente en CPU, permite procesar volumenes moderados de texto sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Huella de memoria de los pesos (calculo a partir de los 75.672.095 parametros):
  - FP32: ~303 MB.
  - FP16/BF16: ~151 MB.
  - INT8: ~76 MB.
  - INT4: ~38 MB.
- Cabe en cualquier GPU de consumo: incluso GTX 1050, GTX 1650 o integradas modernas; practicamente no requiere VRAM dedicada.
- Funciona en CPU sin problema; es viable en dispositivos moviles y placas tipo Raspberry Pi segun el entorno de ejecucion.
- Opciones de despliegue: transformers (Python, pipeline de traduccion), safetensors con Candle (Rust, via `marian_flutter`), y endpoints gestionados de Hugging Face. No se declara soporte para vLLM, llama.cpp, Ollama ni TGI (estos no cubren de forma nativa la arquitectura Marian en este formato).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Direccion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malinali-app/opus-mt-en-lg | 75,7 M | en -> lg | no disponible | no disponible (upstream tipicamente CC-BY 4.0) | safetensors, transformers, Candle |
| Helsinki-NLP/opus-mt-en-lg | ~75,7 M (mismo modelo base) | en -> lg | no disponible | CC-BY 4.0 (tipica de OPUS-MT) | safetensors, transformers, SentencePiece |
| NLLB-200 (distilled 600M) | ~600 M | multilingue (200 idiomas, incluye luganda) | no disponible | CC-BY-NC 4.0 (uso no comercial) | safetensors, transformers |
| M2M-100 (418M) | ~418 M | multilingue | no disponible | MIT (segun variante) | safetensors, transformers |

Nota: los datos de contexto y rendimiento de los modelos comparados no se han verificado en la informacion disponible; la tabla refleja parametros y licencias habitualmente publicados para esas familias. Este modelo es esencialmente identico en pesos al base `Helsinki-NLP/opus-mt-en-lg`, diferenciandose solo en el empaquetado y los tokenizadores.

## Limitaciones y advertencias

- Direccion unica: el repositorio declara solo en -> lg; no se garantiza el sentido inverso (lg -> en) con estos pesos.
- Cobertura limitada al par en-lg: no es un modelo multilingue; no puede traducir a otros idiomas.
- Sin datos de entrenamiento publicados: al ser un reempaquetado, no se documentan el corpus, el numero de tokens ni posibles sesgos, que habria que consultar en el modelo base.
- Riesgo de alucinacion y de traducciones incorrectas, especialmente en frases largas, terminologia especializada o lenguaje coloquial, inherente a cualquier modelo NMT de este tamano.
- Limitacion de longitud de entrada: la longitud de contexto no esta declarada; los modelos Marian suelen estar optimizados para secuencias cortas, por lo que textos largos pueden degradarse.
- Licencia no declarada en este repositorio: antes de un uso comercial debe verificarse la licencia del modelo base (el autor remite a ella); OPUS-MT suele ser CC-BY 4.0, que permite uso comercial con atribucion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad.
- Fecha de creacion registrada como 2026-10-02, lo que resulta inconsistente y conviene tratar con cautela.
- No apto para tareas fuera de la traduccion: sin tool calling, agentes, vision ni audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malinali-app/opus-mt-en-lg
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-lg
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Aplicacion Malinali: https://malinali.app
