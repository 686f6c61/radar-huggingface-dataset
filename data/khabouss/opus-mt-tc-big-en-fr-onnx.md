# khabouss/opus-mt-tc-big-en-fr-onnx

## Resumen

`khabouss/opus-mt-tc-big-en-fr-onnx` es una conversion a ONNX con cuantizacion int8 del modelo de traduccion automatica neuronal `Helsinki-NLP/opus-mt-tc-big-en-fr`, desarrollado originalmente por el proyecto OPUS-MT de la Universidad de Helsinki. El modelo traduce de ingles (en) a frances (fr) y forma parte de la familia de modelos Marian NMT entrenados sobre corpus paralelos del repositorio OPUS. Esta variante concreta no aporta entrenamiento nuevo: solo anade el proceso de conversion y cuantizacion para ejecutar inferencia en CPU mediante `onnxruntime`, sin necesidad de PyTorch.

La relevancia de esta version radica en su orientacion al despliegue local y ligero. Al estar cuantizada a int8 y empaquetada en ONNX, puede integrarse en herramientas de linea de comandos o pipelines de CI/CD que traduzcan ficheros de localizacion (i18n) sin depender de GPU ni de infraestructura de servido pesada. El repositorio ocupa aproximadamente 0,3 GB, lo que facilita su distribucion como dependencia embebida.

El modelo base es un transformer encoder-decoder de arquitectura Marian, especializado en traduccion unidireccional en-fr. No es un modelo generativo de proposito general ni soporta razonamiento, codigo o tool calling: su unico cometido es la traduccion de texto entre ambos idiomas. La licencia CC-BY-4.0 permite uso comercial con atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian NMT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (ONNX) |
| Idiomas soportados | ingles (en), frances (fr) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (int8) |

## Arquitectura y entrenamiento

El modelo subyacente es un Marian NMT, una implementacion de transformer encoder-decoder escrita originalmente en C++ y convertida a PyTorch mediante la libreria `transformers` de Hugging Face. La variante `big` de la familia opus-mt-tc corresponde a un tamano de modelo superior al de las variantes estandar de OPUS-MT, aunque el numero exacto de parametros no se detalla en la informacion disponible. El entrenamiento se realizo con los procedimientos de OPUS-MT-train sobre datos paralelos extraidos del repositorio OPUS, que agrega corpus de multiples fuentes (noticias, Tatoeba, entre otros).

Esta version concreta fue convertida a ONNX mediante `optimum-onnx` y cuantizada a int8, segun el script `scripts/convert-marian.py` del repositorio `locale-ai` del autor. No se han publicado detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; al tratarse de un modelo NMT clasico, es previsible que el entrenamiento fuera supervisado sobre pares de frases, pero este dato no se confirma en la informacion proporcionada.

## Capacidades

- Traduccion de texto de ingles a frances, unidireccional.
- Ejecucion en CPU mediante `onnxruntime`, sin dependencia de PyTorch.
- Inferencia ligera apta para entornos con recursos limitados gracias a la cuantizacion int8.
- Integracion en pipelines de localizacion (i18n) para traducir ficheros de recursos.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multimodales (vision, audio) ni modo thinking.
- Cobertura multilingue limitada estrictamente al par en-fr.

## Casos de uso

- Traduccion de ficheros de localizacion (i18n): el modelo puede procesar cadenas de recursos de una aplicacion de ingles a frances dentro de un CLI como `locale-ai`, ejecutandose en CPU sin infraestructura adicional.
- Automatizacion en CI/CD: integrado en un pipeline, permite traducir nuevos literales anadidos al codigo fuente antes de cada release, manteniendo los ficheros de idioma sincronizados.
- Traduccion de documentacion tecnica: adecuado para convertir READMEs, guias y notas de version del ingles al frances en entornos de desarrollo que no quieran enviar contenido a servicios en la nube.
- Preprocesado de datos multilingues: util para generar versiones en frances de corpus en ingles en tareas de investigacion o entrenamiento de otros sistemas.
- Traduccion en entornos offline o air-gapped: al ser un modelo ONNX int8 de ~0,3 GB, puede desplegarse en maquinas sin acceso a internet ni GPU.
- Prototipado rapido de funcionalidades de traduccion: sirve como baseline ligero para validar una integracion de traduccion en-fr antes de migrar a un servicio de mayor escala.
- Traduccion de contenido editorial de bajo volumen: articulos, correos o mensajes que requieran una version en frances sin depender de APIs externas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados), para la tarea de traduccion eng-fra:

| Dataset | Metrica | Valor |
|---|---|---|
| flores101-devtest | BLEU | 52,2 |
| multi30k_test_2016_flickr | BLEU | 52,4 |
| multi30k_test_2017_flickr | BLEU | 52,8 |
| multi30k_test_2017_mscoco | BLEU | 54,7 |
| multi30k_test_2018_flickr | BLEU | 43,7 |
| news-test2008 | BLEU | 27,6 |
| newsdiscussdev2015 | BLEU | 33,4 |
| newsdiscusstest2015 | BLEU | 40,3 |
| tatoeba-test-v2021-08-07 | BLEU | 53,2 |
| tico19-test | BLEU | 40,6 |
| newstest2009 | BLEU | 30,0 |
| newstest2010 | BLEU | 33,5 |
| newstest2011 | BLEU | 35,0 |
| newstest2012 | BLEU | 32,8 |
| newstest2013 | BLEU | 34,6 |
| newstest2014 | BLEU | 41,9 |

Estos valores corresponden al modelo base `opus-mt-tc-big-en-fr`; la conversion a ONNX int8 puede introducir una ligera degradacion respecto al modelo original en PyTorch, aunque no se han publicado mediciones especificas de esa diferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en su forma actual; el modelo esta pensado para ejecucion en CPU mediante `onnxruntime`.
- Memoria RAM estimada: en torno a 0,3-1 GB, coherente con el tamano del repositorio (0,3 GB) y la cuantizacion int8.
- GPU recomendadas: no requeridas; el modelo no esta optimizado para GPU en esta variante ONNX.
- Cabe en cualquier equipo consumer: portatiles, contenedores ligeros y entornos CI con recursos modestos.
- Opciones de despliegue: `onnxruntime` (via Python o C++), integracion en el CLI `locale-ai`; no se documenta soporte para vLLM, TGI, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| khabouss/opus-mt-tc-big-en-fr-onnx | no disponible | no disponible | en-fr | CC-BY-4.0 | ONNX int8 |
| Helsinki-NLP/opus-mt-tc-big-en-fr | no disponible | no disponible | en-fr | CC-BY-4.0 | PyTorch (safetensors) |
| Helsinki-NLP/opus-mt-en-fr | no disponible | no disponible | en-fr | CC-BY-4.0 | PyTorch (safetensors) |

La diferencia principal entre las tres variantes es el formato y el proceso de cuantizacion: la version de `khabouss` esta optimizada para CPU sin PyTorch, mientras que las de `Helsinki-NLP` requieren el stack de `transformers`. No se dispone de datos comparativos de rendimiento entre las variantes estandar y `big` en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo unidireccional: solo traduce de ingles a frances; no soporta la direccion inversa.
- Sesgos conocidos: al entrenarse sobre corpus OPUS, puede heredar sesgos de genero, culturales o de dominio presentes en los datos de noticias y Tatoeba.
- Riesgo de alucinacion: como todo modelo NMT, puede generar traducciones fluidas pero incorrectas en frases ambiguas, terminologia especializada o texto fuera de dominio.
- Limitaciones de contexto: la longitud maxima de secuencia no se documenta en la informacion disponible; secuencias muy largas pueden truncarse o degradar la calidad.
- La cuantizacion int8 puede reducir ligeramente la calidad respecto al modelo original en PyTorch; no se han publicado metricas de esa degradacion.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial, pero exige atribucion al proyecto OPUS-MT y al autor de la conversion.
- No apta para tareas generativas, de razonamiento, codigo o agentes; su uso fuera de la traduccion en-fr no esta soportado.
- El autor declara explicitamente que el merito del modelo, entrenamiento y datos corresponde al proyecto OPUS-MT; esta variante solo aporta la conversion ONNX y la cuantizacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/khabouss/opus-mt-tc-big-en-fr-onnx
- Modelo base original: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-en-fr
- Repositorio locale-ai: https://github.com/khabouss/locale-ai
- Script de conversion: https://github.com/khabouss/locale-ai/blob/main/scripts/convert-marian.py
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Pipeline de entrenamiento OPUS-MT-train: https://github.com/Helsinki-NLP/Opus-MT-train
- Marian NMT: https://marian-nmt.github.io/
- Repositorio OPUS: https://opus.nlpl.eu/
- Publicacion OPUS-MT (EAMT 2020): https://aclanthology.org/2020.eamt-1.61/
- Publicacion Tatoeba Translation Challenge (WMT 2020): https://aclanthology.org/2020.wmt-1.139/
- optimum-onnx: https://github.com/huggingface/optimum-onnx
