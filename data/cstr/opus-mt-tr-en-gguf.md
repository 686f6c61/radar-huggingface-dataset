# cstr/opus-mt-tr-en-GGUF

## Resumen

`cstr/opus-mt-tr-en-GGUF` es una conversion al formato GGUF/ggml del modelo de traduccion automatica `Helsinki-NLP/opus-mt-tr-en`, desarrollado originalmente por el proyecto OPUS-MT de la Universidad de Helsinki (Jörg Tiedemann y Santhosh Thottingal). Se trata de un modelo MarianMT de tipo encoder-decoder, pequeno y especializado en un unico par de idiomas: turco a ingles. Con 76.668.341 parametros (unos 80M), 6 capas de encoder y 6 de decoder con dimension de modelo d=512, esta pensado para traduccion de baja latencia y bajo coste computacional.

La relevancia de esta ficha no esta en el modelo original, ampliamente conocido desde 2020, sino en el formato de distribucion. El autor `cstr` ha convertido los pesos a GGUF, lo que permite ejecutar el modelo con la libreria CrispASR mediante `--backend marian`, incluyendo escenarios de traduccion en vivo de transcripciones de audio. El repositorio ofrece dos ficheros: una version f16 sin perdida y una version cuantizada q8_0 mas ligera y recomendada por el autor.

Se trata de una conversion de formato, no de un reentrenamiento: los pesos son los de la release `opus-2020-01-16` del proyecto OPUS-MT, sin modificacion en f16 y cuantizados a q8_0. La licencia es CC-BY-4.0 y exige atribucion al proyecto OPUS-MT en cualquier redistribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (MarianMT) |
| Parametros totales | 76.668.341 (~80M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16 (158 MB) y q8_0 (87 MB) |
| Idiomas soportados | turco (tr) → ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (ggml) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura MarianMT, un transformer seq2seq clasico con 6 capas de encoder y 6 de decoder y una dimension de modelo de 512. Es un modelo unidireccional, entrenado exclusivamente para el par turco → ingles; la direccion inversa, cuando existe, se distribuye por separado (`cstr/opus-mt-en-tr-GGUF`). No incorpora mecanismos de attention lineal, decodificacion especulativa ni arquitecturas hibridas: es un transformer denso convencional orientado a un unico par de idiomas.

Los pesos originales provienen de la release `opus-2020-01-16` del proyecto OPUS-MT, entrenada sobre datos del corpus OPUS (opus.nlpl.eu). La model card de esta conversion no detalla el numero exacto de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; esa informacion no esta disponible en la documentacion proporcionada. La contribucion tecnica de este repositorio es la conversion a GGUF, no el entrenamiento. El autor documenta un script de conversion (`convert-marian-to-gguf.py`), una herramienta de cuantizacion (`crispasr-quantize`) y un script de verificacion de paridad (`marian_parity.py`) frente a `MarianMTModel.generate` de Hugging Face `transformers`.

## Capacidades

- Traduccion de texto turco → ingles en una unica direccion.
- Traduccion en vivo de transcripciones de audio, integrada en CrispASR mediante `--live-translate` combinada con un backend de reconocimiento de voz que soporte turco.
- Decodificacion greedy (`-bs 1`) y decodificacion con beam search (tamano de beam propio del checkpoint) en modo texto.
- Capacidad de operar sobre la entrada como texto plano, tratando las cadenas literales `</s>`, `<unk>` y `<pad>` como texto ordinario.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No es un modelo multilingue general: solo cubre el par tr → en.
- No ofrece modo thinking ni capacidades de vision o audio nativas.

## Casos de uso

- Traduccion en vivo de subtitulos y transcripciones: combinado con un reconocedor de voz turco dentro de CrispASR (`--live-translate -l tr --tr-tl en`), genera transcripcion y traduccion frase a frase para streaming o reuniones en tiempo real. La latencia reducida del modelo (6+6 capas) es la que hace viable este escenario.
- Post-procesado de transcripciones: a partir de un fichero de audio ya transcrito en turco, traducir los segmentos a ingles sin depender de servicios en la nube, usando el modelo q8_0 en local.
- Traduccion por lotes de documentacion tecnica turca a ingles: al ser un modelo pequeno, se puede ejecutar sobre grandes volumenes de texto en CPU o en una GPU modesta sin incurrir en costes de API.
- Integracion en pipelines de subtitulado para plataformas de video: generar pistas de subtitulos en ingles a partir de material original en turco de forma automatizada.
- Procesamiento de contenido de usuario en una aplicacion turca: traduccion de comentarios, tickets o mensajes a ingles antes de su analisis o clasificacion en un pipeline posterior.
- Herramientas de traduccion para periodistas o analistas que trabajan con fuentes turcas: traduccion asistida en local que evita enviar contenido sensible a servicios externos.
- Despliegue en entornos con recursos muy limitados: el fichero q8_0 ocupa 87 MB, por lo que puede ejecutarse en dispositivos de borde o contenedores con poca memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (BLUE, MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card unicamente documenta una prueba de paridad frente a la implementacion de referencia sobre 8 frases de test:

| Fichero | Comparacion con la referencia | Resultado |
|---|---|---|
| `opus-mt-tr-en-f16.gguf` | `MarianMTModel.generate` (transformers), greedy | 8/8 frases identicas |
| `opus-mt-tr-en-f16.gguf` | `MarianMTModel.generate` (transformers), beam 4 | 8/8 frases identicas |
| `opus-mt-tr-en-q8_0.gguf` | `MarianMTModel.generate` (transformers), greedy | 8/8 frases identicas; otras frases pueden diferir en la redaccion |

Los identificadores de tokens de entrada fueron identicos en 8/8 casos. No hay cifras de calidad de traduccion (BLEU, chrF, COMET) publicadas en esta conversion.

## Requisitos de hardware

- El fichero q8_0 ocupa 87 MB en disco; el f16 ocupa 158 MB. La VRAM necesaria para inferencia es del orden de pocos cientos de megabytes, muy por debajo de cualquier modelo grande.
- Cabe en cualquier GPU de consumo, incluidas GTX 1050, RTX 3060, RTX 4090, asi como en CPU sin GPU dedicada.
- El modelo esta disenado para ejecutarse en CPU: la conversion GGUF permite inferencia por CPU con ggml, sin requisito de GPU.
- Opcion de despliegue principal: CrispASR con `--backend marian`. La model card no menciona soporte en vLLM, TGI, llama.cpp u Ollama para este checkpoint Marian concreto.
- Latencia y throughput: no se publican datos numericos. El autor indica que estos modelos son "los traductores mas rapidos" dentro de CrispASR, en parte por su tamano reducido y porque el modo en vivo siempre decodifica greedy.

## Comparativa con modelos similares

No se proporcionan en la informacion disponible datos de rendimiento de modelos comparables que permitan una comparacion cuantitativa. Como referencia cualitativa de la misma categoria (traduccion turco → ingles):

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| cstr/opus-mt-tr-en-GGUF | 76.668.341 (~80M) | no disponible | CC-BY-4.0 | GGUF (f16, q8_0) |
| Helsinki-NLP/opus-mt-tr-en | mismo checkpoint original | no disponible | CC-BY-4.0 | safetensors / PyTorch |
| cstr/opus-mt-en-tr-GGUF | no disponible | no disponible | no disponible | GGUF (direccion inversa) |

No se dispone de datos de benchmarks que permitan comparar la calidad de traduccion de este modelo frente a alternativas de mayor tamano (por ejemplo, modelos NLLB o mBART), por lo que la comparativa queda limitada a parametros y disponibilidad.

## Limitaciones y advertencias

- Modelo unidireccional: solo traduce de turco a ingles. Para la direccion contraria hay que usar un checkpoint distinto.
- Es una conversion de formato, no un modelo afinado: hereda las limitaciones de calidad del checkpoint original `opus-mt-tr-en` (release de 2020).
- Riesgo de alucinacion y de traducciones incorrectas en dominios especializados (tecnico, legal, medico) no cubiertos por los datos de OPUS.
- La model card no documenta sesgos especificos, pero al ser un modelo entrenado sobre corpus paralelos puede reproducir sesgos presentes en dichos datos; no hay analisis de sesgo publicado.
- La ventana de contexto no se especifica en la informacion disponible; no se recomienda asumir un contexto largo.
- En modo live la decodificacion se realiza siempre greedy, lo que puede reducir la calidad frente a beam search.
- Las cadenas literales `</s>`, `<unk>` y `<pad>` se tratan como texto ordinario, a diferencia de la implementacion de referencia que las interpreta como tokens especiales; esto puede producir diferencias si la entrada contiene esas cadenas.
- La version q8_0 produce 8/8 frases identicas en greedy, pero otras frases pueden diferir en la redaccion respecto a la referencia f16.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribucion al proyecto OPUS-MT (Universidad de Helsinki) en cualquier redistribucion.
- Repositorio sin descargas ni likes registrados en el momento de la consulta; no hay validacion comunitaria independiente de esta conversion.
- Para el ejemplo de traduccion en vivo, el reconocedor de voz empleado debe soportar turco.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cstr/opus-mt-tr-en-GGUF
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-tr-en
- Direccion inversa (en → tr): https://huggingface.co/cstr/opus-mt-en-tr-GGUF
- Repositorio CrispASR: https://github.com/CrispStrobe/CrispASR
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Repositorio OPUS-MT-train: https://github.com/Helsinki-NLP/OPUS-MT-train
- Corpus OPUS: https://opus.nlpl.eu/
- Paper de referencia: OPUS-MT — Building open translation services for the World (EAMT 2020), Jörg Tiedemann y Santhosh Thottingal.
