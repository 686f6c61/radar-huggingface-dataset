# khabouss/opus-mt-tc-big-en-zle-onnx

## Resumen

`khabouss/opus-mt-tc-big-en-zle-onnx` es una conversión a ONNX con cuantización int8 del modelo de traducción automática neuronal `Helsinki-NLP/opus-mt-tc-big-en-zle`, desarrollado originalmente por el proyecto OPUS-MT (Universidad de Helsinki). El modelo traduce del inglés a lenguas eslavas orientales (bielorruso, ruso y ucraniano), y esta variante concreta está pensada para ejecutarse en CPU mediante `onnxruntime` sin dependencia de PyTorch, como modelo integrado en la herramienta de línea de comandos `locale-ai` para traducir ficheros de localización i18n.

La arquitectura subyacente es Marian NMT, un transformer encoder-decoder entrenado originalmente con el framework Marian en C++ y convertido a PyTorch para su uso con la librería `transformers`. El modelo es multilingüe en el lado destino: un único checkpoint cubre varias lenguas eslavas orientales mediante tokens de prefijo de idioma (por ejemplo `>>rus<<` para ruso y `>>ukr<<` para ucraniano). El repositorio que nos ocupa solo añade la conversión ONNX y la cuantización int8 realizada con `optimum-onnx`, sin reentrenar ni modificar los pesos originales.

Su relevancia práctica radica en que permite desplegar traducción de calidad en entornos sin GPU y con requisitos mínimos de infraestructura, algo útil para pipelines de localización, herramientas de desarrollo y servicios de traducción embebidos. El tamaño del repositorio es de 0,4 GB, coherente con un modelo cuantizado a int8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian NMT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (ONNX) |
| Idiomas soportados | en (origen); be, ru, uk y zle (destino) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (cuantizado int8) |

## Arquitectura y entrenamiento

El modelo original sigue la arquitectura Marian NMT, un transformer encoder-decoder con atención multi-cabeza estándar, entrenado con el framework Marian escrito en C++ y posteriormente convertido a PyTorch para su distribución vía `transformers`. Se trata de un modelo multilingüe de destino: recibe texto en inglés y genera traducciones a bielorruso, ruso o ucraniano según el token de prefijo de idioma que se anteponga a la entrada. La variante "big" del nombre indica una configuración de mayor tamaño dentro de la familia OPUS-MT, aunque el número exacto de parámetros no se detalla en la información disponible.

Los datos de entrenamiento proceden de OPUS, el corpus abierto de traducciones paralelas, y el pipeline de entrenamiento sigue los procedimientos de OPUS-MT-train. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de ajuste fino como RLHF o DPO (poco habituales en modelos NMT de esta familia). La conversión a ONNX se realizó con `optimum-onnx` y la cuantización a int8 busca reducir el peso y acelerar la inferencia en CPU mediante `onnxruntime`, eliminando la dependencia de PyTorch en tiempo de ejecución.

## Capacidades

- Traducción automática del inglés al bielorruso, ruso y ucraniano mediante tokens de prefijo de idioma (`>>bel<<`, `>>rus<<`, `>>ukr<<`).
- Traducción multilingüe de destino con un único checkpoint, lo que simplifica el despliegue de varios pares de idiomas.
- Inferencia en CPU sin PyTorch, gracias al formato ONNX cuantizado int8 y a `onnxruntime`.
- Integración en pipelines de localización de software mediante la herramienta `locale-ai`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo especializado exclusivamente en traducción.
- No dispone de capacidades de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Localización de ficheros i18n en proyectos de software: el modelo traduce cadenas de recursos del inglés a ruso y ucraniano directamente en CPU, integrándose en el flujo de trabajo de `locale-ai` sin necesidad de GPU ni servicios externos.
- Traducción de documentación técnica en CI/CD: al ejecutarse con `onnxruntime` en CPU, puede incorporarse como paso de un pipeline que genere versiones traducidas de la documentación en cada release.
- Servicios de traducción embebidos en aplicaciones de escritorio: su formato ONNX int8 y su tamaño reducido (0,4 GB) permiten distribuirlo junto a la aplicación para traducir contenido sin conexión.
- Traducción de contenidos web multilingües: útil para portales que necesiten versiones en ruso y ucraniano a partir de originales en inglés, con un único modelo para ambos destinos.
- Procesamiento por lotes de corpus en entornos con recursos limitados: la cuantización int8 reduce los requisitos de memoria y permite procesar grandes volúmenes en servidores sin GPU.
- Prototipado e investigación en traducción automática: sirve como línea base reproducible en formato ONNX para comparar técnicas de cuantización o de despliegue en CPU.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados) en la model-index de la model card:

| Tarea | Dataset | BLEU |
|---|---|---|
| eng-rus | flores101-devtest | 32,7 |
| eng-ukr | flores101-devtest | 32,1 |
| eng-bel | tatoeba-test-v2021-08-07 | 24,9 |
| eng-rus | tatoeba-test-v2021-08-07 | 45,5 |
| eng-ukr | tatoeba-test-v2021-08-07 | 37,7 |
| eng-rus | tico19-test | 33,7 |
| eng-rus | newstest2012 | 36,8 |
| eng-rus | newstest2013 | 26,9 |
| eng-rus | newstest2014 | 43,5 |
| eng-rus | newstest2015 | 34,9 |
| eng-rus | newstest2016 | 33,1 |
| eng-rus | newstest2017 | 37,3 |
| eng-rus | newstest2018 | 32,9 |
| eng-rus | newstest2019 | 31,8 |
| eng-rus | newstest2020 | 25,5 |

No se han publicado en la información disponible resultados de benchmarks específicos para la versión ONNX int8; los valores anteriores corresponden al modelo original `opus-mt-tc-big-en-zle`.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en su caso de uso principal, ya que está diseñado para ejecutarse en CPU con `onnxruntime`.
- En caso de ejecutarse en GPU, el tamaño del repositorio (0,4 GB) sugiere un consumo de memoria muy reducido, aunque no se dispone de cifras oficiales.
- GPU recomendadas: no disponible; el modelo está optimizado para CPU.
- Cabe en cualquier equipo de consumo: el formato int8 y el tamaño del repositorio lo permiten ejecutar en portátiles y servidores modestos sin GPU dedicada.
- Opciones de despliegue: `onnxruntime` (principal), y de forma indirecta mediante la CLI `locale-ai`; no se indica soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas destino | Formato | Licencia |
|---|---|---|---|---|---|
| khabouss/opus-mt-tc-big-en-zle-onnx | no disponible | no disponible | be, ru, uk | ONNX int8 | CC-BY-4.0 |
| Helsinki-NLP/opus-mt-tc-big-en-zle | no disponible | no disponible | be, ru, uk | PyTorch (safetensors/bin) | CC-BY-4.0 |
| Helsinki-NLP/opus-mt-en-ru | no disponible | no disponible | ru | PyTorch | CC-BY-4.0 |
| Helsinki-NLP/opus-mt-en-uk | no disponible | no disponible | uk | PyTorch | CC-BY-4.0 |

La principal diferencia frente al modelo original es el formato: la variante ONNX int8 prescinde de PyTorch y reduce el peso, a costa de una posible pérdida menor de calidad no cuantificada en la información disponible. Los modelos bilingües `opus-mt-en-ru` y `opus-mt-en-uk` cubren un solo par de idiomas cada uno, mientras que este checkpoint multilingüe de destino cubre tres lenguas eslavas orientales con un único modelo.

## Limitaciones y advertencias

- Es un modelo exclusivamente de traducción: no admite instrucciones, razonamiento, código ni conversación.
- Solo traduce desde el inglés; no cubre direcciones inversas ni otros pares de idiomas.
- La cuantización int8 puede degradar ligeramente la calidad respecto al modelo original en PyTorch; no se han publicado métricas comparativas para esta variante.
- Riesgo de alucinación y de traducciones inexactas en dominios especializados, terminología técnica o textos con ambigüedad.
- El bielorruso presenta el BLEU más bajo de los tres destinos (24,9 en Tatoeba), lo que sugiere menor calidad relativa en ese par.
- No se especifican sesgos conocidos ni limitaciones de longitud de contexto en la información disponible.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar el proyecto OPUS-MT y a los autores originales.
- Para producción, conviene validar la calidad en el dominio concreto y considerar el modelo original si la fidelidad es crítica.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/khabouss/opus-mt-tc-big-en-zle-onnx
- Modelo original: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-en-zle
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Pipeline de entrenamiento OPUS-MT-train: https://github.com/Helsinki-NLP/Opus-MT-train
- Corpus OPUS: https://opus.nlpl.eu/
- Framework Marian NMT: https://marian-nmt.github.io/
- Herramienta locale-ai: https://github.com/khabouss/locale-ai
- Script de conversión: https://github.com/khabouss/locale-ai/blob/main/scripts/convert-marian.py
- optimum-onnx: https://github.com/huggingface/optimum-onnx
- Publicación OPUS-MT (EAMT 2020): https://aclanthology.org/2020.eamt-1.61/
- Publicación Tatoeba Translation Challenge (WMT 2020): https://aclanthology.org/2020.wmt-1.139/
