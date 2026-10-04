# Mitroshenkov87/voxprint-mirror-opus-mt-en-ru

## Resumen

`Mitroshenkov87/voxprint-mirror-opus-mt-en-ru` es un espejo (mirror) sin modificaciones del modelo de traduccion `Helsinki-NLP/opus-mt-en-ru`, publicado por el usuario Mitroshenkov87 fijado al commit `bb09c99d180016eac6819df3dae68edb1690fdee`. Se trata de un modelo de traduccion automatica neuronal ingles a ruso, desarrollado originalmente por el grupo de investigacion en tecnologia del lenguaje de la Universidad de Helsinki (Helsinki-NLP). El espejo no anade ninguna mejora de entrenamiento: es un backup byte a byte identico al original, con el unico cambio del archivo `README.md`.

El proposito del espejo es servir como fuente de descarga alternativa para la aplicacion Voxprint (`voxprint-audiobook-builder`), una herramienta de clonacion de voz y generacion de audiolibros que necesita traduccion offline. Para ello solo se replican los archivos que la aplicacion consume: configuracion, tokenizer, `source.spm`/`target.spm`, `vocab.json` y `pytorch_model.bin`; se omiten las copias de pesos en TensorFlow, Rust y Flax del repositorio original. El repositorio pesa 0.3 GB.

El modelo es un transformer encoder-decoder de tipo Marian (variante `transformer-align`), con preprocesado basado en normalizacion y SentencePiece. Es un modelo pequeno y especializado en un unico par de idiomas, orientado a inferencia ligera y despliegue en local, no a tareas generativas o multimodales. Su relevancia actual es la de un componente de traduccion eficiente y con licencia permisiva (Apache-2.0) para integrarse en pipelines offline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Marian, variante `transformer-align` |
| Parametros totales | no disponible (el repositorio pesa 0.3 GB con pesos en fp32) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo orientado a traduccion por segmentos/oraciones) |
| Tipos de cuantizacion | no disponible (pesos en fp32, `pytorch_model.bin`); convertible a fp16/int8 con CTranslate2 u ONNX |
| Idiomas soportados | ingles (lengua origen) y ruso (lengua destino) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.bin`); el espejo no incluye safetensors, TensorFlow, Rust ni Flax |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de traduccion automatica neuronal, de la familia Marian, en su variante `transformer-align`. Emplea preprocesado con normalizacion y tokenizacion mediante SentencePiece (`source.spm` y `target.spm`), con `vocab.json` para el tokenizer. La tarea es exclusivamente de traduccion unidireccional ingles a ruso.

El entrenamiento original de Helsinki-NLP se realizo sobre el corpus publico OPUS y se documento en el trabajo de J. Tiedemann y S. Thottingal, "OPUS-MT - Building open translation services for the World" (EAMT 2020). El modelo procede del checkpoint `opus-2020-02-11`. No se documentan en la informacion disponible detalles sobre numero de tokens de entrenamiento, composicion exacta del dataset ni el uso de tecnicas de alineacion por RLHF/DPO. Este espejo no modifica ni reentrena el modelo: los archivos son identicos al commit fijado del repositorio original.

## Capacidades

- Traduccion automatica de texto de ingles a ruso.
- Procesamiento por segmentos, adecuado para traducir frases y parrafos.
- Integrable en pipelines offline de procesado de texto.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de modo de razonamiento (thinking mode).
- No soporta vision, audio ni otras modalidades.
- Capacidad multilingue limitada estrictamente al par ingles-ruso.

## Casos de uso

- Traduccion offline en aplicaciones de escritorio: el modelo puede empaquetarse en una aplicacion (como Voxprint) para traducir contenido de ingles a ruso sin conexion a red, gracias a su tamano reducido y sus dependencias ligeras.
- Preprocesado de corpus para entrenamiento: util para generar pares paralelos ingles-ruso o para aumentar datasets con traducciones de referencia de manera masiva y economica.
- Generacion de audiolibros y doblaje: integrado en un pipeline de sintesis de voz, permite traducir guiones o textos del ingles al ruso antes de la fase de locucion.
- Localizacion de documentacion tecnica: traduccion de guias, README y manuales de producto en ingles a ruso dentro de flujos automatizados de CI.
- Subtitulado y transcripcion: traduccion de subtitulos segmento a segmento para contenidos audiovisuales de origen angloparlante.
- Traduccion por lotes en servidores modestos: al ser un modelo pequeno, puede ejecutarse en CPU o en GPU de consumo para procesar grandes volumenes de texto con bajo coste.
- Filtrado y normalizacion de datos multilingues: uso como componente de traduccion en sistemas de moderacion o analisis de contenido en ruso a partir de fuentes en ingles.

## Benchmarks y rendimiento

Resultados del modelo original `opus-mt-en-ru` (incluidos en la model card replicada):

| Testset | BLEU | chr-F |
|---|---|---|
| newstest2012.en.ru | 31.1 | 0.581 |
| newstest2013.en.ru | 23.5 | 0.513 |
| newstest2015-enru.en.ru | 27.5 | 0.564 |
| newstest2016-enru.en.ru | 26.4 | 0.548 |
| newstest2017-enru.en.ru | 29.1 | 0.572 |
| newstest2018-enru.en.ru | 25.4 | 0.554 |
| newstest2019-enru.en.ru | 27.1 | 0.533 |
| Tatoeba.en.ru | 48.4 | 0.669 |

Los puntos de referencia del testset en WMT (newstest) se situan aproximadamente entre 23.5 y 31.1 BLEU, mientras que en el conjunto Tatoeba el modelo alcanza 48.4 BLEU, coherente con un dominio de frases cortas y limpias.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; los pesos en fp32 ocupan en torno a 0.3 GB, y menos de la mitad si se convierten a fp16 o int8.
- GPU recomendadas: cualquier GPU moderna; funciona incluso en GPU integradas. Tarjetas como RTX 3060, RTX 4090, A100 o H100 son mas que suficientes (el modelo queda limitado por CPU/IO mas que por compute).
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo y tambien en CPU.
- Opciones de despliegue: libreria `transformers` de HuggingFace, conversion a CTranslate2 (habitual para modelos Marian), exportacion a ONNX, y uso con SentencePiece para el tokenizer. No es un modelo GGUF/Ollama nativo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mitroshenkov87/voxprint-mirror-opus-mt-en-ru | Marian (espejo) | en -> ru | no disponible | Apache-2.0 | HuggingFace |
| Helsinki-NLP/opus-mt-en-ru | Marian | en -> ru | no disponible | Apache-2.0 | HuggingFace (original) |
| Helsinki-NLP/opus-mt-ru-en | Marian | ru -> en | no disponible | Apache-2.0 | HuggingFace |
| NLLB-200 (Meta) | Transformer multilingue | 200 idiomas | 512 tokens | CC-BY-NC-4.0 (uso no comercial en varias variantes) | HuggingFace |

Frente al original `opus-mt-en-ru`, este espejo no aporta ninguna diferencia funcional: mismos pesos y misma licencia, solo cambia la model card y los archivos replicados. El modelo inverso `opus-mt-ru-en` cubre la direccion contraria. Alternativas multilingues como NLLB-200 ofrecen muchos mas idiomas y contexto, a cambio de un tamano mucho mayor y licencias mas restrictivas para uso comercial.

## Limitaciones y advertencias

- Es un modelo especializado en un unico par de idiomas (ingles a ruso); no traduce otras combinaciones.
- Riesgo de alucinacion y de traducciones inexactas en dominios muy tecnicos, jerga o textos con mucho contexto implicito.
- Rendimiento degradado en frases largas o documentos sin segmentar, dado que el modelo esta pensado para traduccion por segmentos.
- El espejo no incluye los pesos en safetensors ni las copias en TensorFlow, Rust o Flax; solo los archivos que consume la aplicacion Voxprint.
- La licencia Apache-2.0 es permisiva y permite uso comercial, pero la atribucion a los autores originales (Helsinki-NLP / Universidad de Helsinki) sigue siendo obligatoria.
- Este espejo no esta afiliado a los autores originales; ante cualquier duda de integridad conviene verificar los hashes contra el commit fijado `bb09c99d180016eac6819df3dae68edb1690fdee`.
- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre OPUS, puede heredar los sesgos y desequilibrios de ese corpus.

## Enlaces

- Modelo en HuggingFace (espejo): https://huggingface.co/Mitroshenkov87/voxprint-mirror-opus-mt-en-ru
- Modelo original: https://huggingface.co/Helsinki-NLP/opus-mt-en-ru
- README de entrenamiento OPUS-MT en-ru: https://github.com/Helsinki-NLP/OPUS-MT-train/blob/master/models/en-ru/README.md
- Pesos originales: https://object.pouta.csc.fi/OPUS-MT-models/en-ru/opus-2020-02-11.zip
- Traducciones del test set: https://object.pouta.csc.fi/OPUS-MT-models/en-ru/opus-2020-02-11.test.txt
- Puntuaciones del test set: https://object.pouta.csc.fi/OPUS-MT-models/en-ru/opus-2020-02-11.eval.txt
- Repositorio Voxprint: https://github.com/Mitroshenkov87/voxprint-audiobook-builder
- Documentacion de modelos de Voxprint: https://github.com/Mitroshenkov87/voxprint-audiobook-builder/blob/main/docs/MODELS.md
- OPUS-MT Factory (Universidad de Helsinki): https://blogs.helsinki.fi/opusmt-factory/models/
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
