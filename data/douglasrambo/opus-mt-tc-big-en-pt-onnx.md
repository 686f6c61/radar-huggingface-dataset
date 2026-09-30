# Douglasrambo/opus-mt-tc-big-en-pt-onnx

## Resumen

Douglasrambo/opus-mt-tc-big-en-pt-onnx es una conversión a formato ONNX del modelo de traducción automática neuronal Helsinki-NLP/opus-mt-tc-big-en-pt, desarrollado originalmente por el grupo OPUS-MT de la Universidad de Helsinki (Jörg Tiedemann y Santhosh Thottingal). El modelo cubre la dirección inglés a portugués y está empaquetado específicamente para su ejecución en el navegador y en entornos sin GPU dedicada mediante la librería transformers.js, con variantes cuantizadas a int8 y a 4 bits.

El problema que resuelve es doble. Por un lado, ofrece traducción en-pt de calidad con una arquitectura MarianMT, un transformer encoder-decoder seq2seq clásico y ligero, publicado bajo licencia CC-BY-4.0, lo que permite uso comercial. Por otro, elimina la fricción de despliegue: la conversión corrige varios defectos típicos del script de exportación estándar, de modo que el modelo produce salidas alineadas con la referencia de PyTorch en lugar de texto degradado.

Su relevancia actual radica en el nicho de traducción local y en el cliente: al distribuirse como ONNX cuantizado (q8 para WASM/CPU y q4 para WebGPU), puede integrarse en aplicaciones web sin enviar texto a un servidor externo. El repositorio ocupa 1,1 GB e incluye todas las variantes. Se trata de un derivado no oficial con 0 descargas y 1 like en el momento de la consulta, sin resultados de benchmarks propios publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT (transformer encoder-decoder seq2seq para traduccion automatica) |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (q8) para WASM/CPU; 4 bits MatMul (q4) para WebGPU, sin necesidad de shader-f16 |
| Idiomas soportados | Ingles (en) y portugues (pt); variantes de prefijo para portugues de Brasil (>>pob<<) y portugues (>>por<<) |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (archivos con sufijo *_quantized.onnx y *_q4.onnx dentro del directorio onnx/) |

Datos adicionales del repositorio: libreria transformers.js, pipeline translation, tamano del repositorio 1,1 GB, autor Douglasrambo, modelo base Helsinki-NLP/opus-mt-tc-big-en-pt, creado el 2026-09-30 y actualizado el 2026-09-30.

## Arquitectura y entrenamiento

La arquitectura subyacente es MarianMT, una red neuronal de traduccion de tipo transformer con estructura encoder-decoder y atencion completa, perteneciente a la familia OPUS-MT entrenada sobre corpus paralelos del proyecto OPUS. La variante "tc-big" corresponde a un modelo de mayor capacidad dentro de esa familia, si bien la informacion proporcionada no detalla el numero de parametros, la composicion exacta del dataset ni el numero de tokens de entrenamiento. No se documenta en la informacion disponible el uso de RLHF, DPO ni de tecnicas de alineacion posteriores al entrenamiento supervisado.

La aportacion tecnica de esta ficha concreta no esta en el entrenamiento, sino en la conversion. El autor documenta tres correcciones sobre una ejecucion estandar de scripts/convert.py. Primera: el tokenizer.json se reindexo para que sus identificadores coincidan con los de vocab.json, ya que el generado seguia el orden de source.spm y producia identificadores incorrectos; ademas se anadieron los prefijos >>xxx<< como tokens especiales. Segunda: el decoder_model_merged se volvio a fusionar con optimum.onnx.merge_decoders, porque el producido durante la exportacion daba una salida degradada. Tercera: las entradas Range del decoder fusionado se reformaron a escalares, dado que la fusion Range+Gather a Slice de onnxruntime fallaba con el error "Starts must be a 1-D array". El resultado se valido contra la salida de referencia en PyTorch sobre parrafos reales de Project Gutenberg.

Una restriccion de uso importante derivada del modelo original: hay que anteponer a cada entrada el prefijo >>pob<< (portugues de Brasil) o >>por<<, y traducir una sola frase por llamada, ya que el modelo original descarta las frases posteriores a la primera cuando recibe varias a la vez.

## Capacidades

- Traduccion automatica de ingles a portugues, con seleccion explicita de variante mediante prefijo (>>pob<< para portugues de Brasil, >>por<< para portugues).
- Generacion de texto condicionada de tipo text2text-generation, con pipeline declarado como translation.
- Ejecucion en navegador y en CPU sin GPU mediante transformers.js y el backend WASM con cuantizacion int8.
- Ejecucion acelerada en navegador mediante WebGPU con la variante q4, que no requiere soporte de shader-f16.
- Procesamiento de una frase por llamada, adecuado para traduccion incremental en parrafos de literatura y textos generales.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento en la informacion proporcionada.
- Cobertura multilingue limitada estrictamente al par en-pt; no es un modelo multilingue general.

## Casos de uso

- Traduccion local en aplicaciones web: integracion del ONNX q8 con transformers.js para traducir texto de ingles a portugues directamente en el navegador del usuario, sin enviar contenido a un servidor externo y por tanto sin exponer datos sensibles en transito.
- Traduccion de documentacion tecnica: procesado por lotes de ficheros README, guias y notas de version en ingles para generar versiones en portugues, llamando al modelo frase por frase segun la restriccion documentada.
- Preprocesado de corpus para investigacion: generacion de traducciones en-pt de partida sobre corpus como Project Gutenberg, que es precisamente el material empleado en la validacion del autor, para tareas de comparacion o aumento de datos.
- Extension de navegador o plugin de lectura: traduccion bajo demanda de parrafos seleccionados en webs en ingles, con la variante q4 sobre WebGPU para mantener la latencia interactiva.
- Atencion al cliente en portugues: normalizacion de consultas o articulos de ayuda escritos originalmente en ingles hacia portugues, dentro de un pipeline que luego use otro sistema para la generacion de respuesta.
- Traduccion offline en dispositivos con recursos limitados: despliegue en portatiles o equipos sin GPU dedicada usando la variante int8 sobre CPU, en escenarios de campo o con conectividad restringida.
- Generacion de subtitulos o transcripciones en portugues: traduccion de segmentos cortos de texto en ingles procedentes de un sistema de reconocimiento de voz, aprovechando que el modelo trabaja bien con entradas de una sola frase.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica validacion mencionada es cualitativa y comparativa: la salida del ONNX convertido se contrasto contra la salida de referencia en PyTorch sobre parrafos reales de Project Gutenberg, sin que se reporten metricas numericas como BLEU, chrF ni MMLU.

## Requisitos de hardware

- Al tratarse de un modelo con variantes int8 y de 4 bits, esta disenado para ejecutarse sin GPU dedicada, sobre CPU mediante WASM y en navegador mediante WebGPU.
- VRAM estimada: no disponible. El tamano total del repositorio es de 1,1 GB, pero incluye varias variantes (q8, q4 y presumiblemente otras), por lo que el consumo real de una variante concreta no esta cuantificado en la informacion proporcionada.
- GPU recomendadas: no disponible en la informacion proporcionada. La variante q4 esta pensada para WebGPU y no requiere soporte de shader-f16, lo que amplia la compatibilidad a GPUs integradas y a equipos que no exponen esa extension.
- Encaje en GPU de consumo: la variante q4 esta explicitamente orientada a WebGPU, por lo que se asume compatibilidad con hardware grafico de consumo, aunque no se especifica que modelos concretos (RTX 4090, etc.) se han probado.
- Opciones de despliegue: transformers.js como via principal, con backend WASM para la variante q8 y backend WebGPU para la variante q4. Tambien puede ejecutarse con onnxruntime en entornos servidor o escritorio, dado que el formato de pesos es ONNX estandar.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Douglasrambo/opus-mt-tc-big-en-pt-onnx | no disponible | no disponible | ONNX (q8, q4) | cc-by-4.0 | Conversion para transformers.js con correcciones de tokenizer y decoder; 0 descargas, 1 like |
| Helsinki-NLP/opus-mt-tc-big-en-pt | no disponible | no disponible | Pesos del framework original (no confirmado en la informacion) | cc-by-4.0 | Modelo base del que deriva la conversion; entrenado por la Universidad de Helsinki |
| Otras alternativas comparables | no disponible | no disponible | no disponible | no disponible | La informacion proporcionada no incluye otros modelos de traduccion en-pt con datos verificables |

No se dispone en la informacion proporcionada de datos de rendimiento comparativo entre estos modelos, por lo que la comparacion se limita a formato, licencia y procedencia.

## Limitaciones y advertencias

- El modelo solo traduce de ingles a portugues. No cubre la direccion inversa ni otros pares de idiomas.
- Requiere anteponer el prefijo >>pob<< o >>por<< en cada entrada; omitirlo puede degradar la calidad o producir la variante equivocada de portugues.
- Solo procesa una frase por llamada. Si se le envian varias frases juntas, el modelo original descarta todas menos la primera, lo que puede provocar perdidas silenciosas de contenido en pipelines por lotes.
- Es una conversion no oficial realizada por un tercero, con 0 descargas y 1 like registrados, sin proceso de revision por pares ni mantenimiento garantizado por parte de OPUS-MT.
- Riesgo de alucinacion y de errores de traduccion inherente a los modelos MarianMT, especialmente en terminologia especializada, nombres propios, cifras y texto con formato (Markdown, HTML, codigo).
- No se documentan sesgos especificos en la informacion proporcionada, pero al entrenarse sobre corpus OPUS pueden heredarse sesgos de dominio y de genero presentes en esos datos.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribucion. Es necesario atribuir tanto al autor de la conversion como al proyecto OPUS-MT y a la Universidad de Helsinki como creadores del modelo original.
- El campo de fecha de creacion del repositorio figura como 2026-09-30, lo que resulta anomalo respecto a la fecha actual; conviene verificar la procedencia y la vigencia del artefacto antes de usarlo en produccion.
- No se han publicado benchmarks del modelo convertido, por lo que no hay garantia cuantificada de que la calidad de traduccion se mantenga en todos los dominios mas alla de la validacion cualitativa sobre Project Gutenberg.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Douglasrambo/opus-mt-tc-big-en-pt-onnx
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-en-pt
- Repositorio del proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Ficha de referencia del modelo base en free2aitools: https://free2aitools.com/model/helsinki-nlp/opus-mt-tc-big-en-pt
- Modelo relacionado de la misma familia: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-en-tr
- Base de datos de modelos Models.dev: https://models.dev/
