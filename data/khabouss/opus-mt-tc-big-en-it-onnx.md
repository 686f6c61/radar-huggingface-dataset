# khabouss/opus-mt-tc-big-en-it-onnx

## Resumen

opus-mt-tc-big-en-it-onnx es una conversión a ONNX con cuantización int8 del modelo de traducción automática neuronal Helsinki-NLP/opus-mt-tc-big-en-it, desarrollado originalmente por el proyecto OPUS-MT del grupo Language Technology de la Universidad de Helsinki. El modelo traduce de inglés a italiano y forma parte de la familia Tatoeba-Challenge, entrenada con Marian NMT y posteriormente convertida a PyTorch para su uso con la librería transformers.

El repositorio lo publica el usuario khabouss como artefacto auxiliar de su herramienta locale-ai, una CLI que traduce ficheros de localización i18n en local sobre CPU. La aportación de este repositorio no es el entrenamiento ni los datos, sino únicamente la conversión a formato ONNX y la cuantización int8 necesaria para ejecutar el modelo con onnxruntime sin dependencia de PyTorch, lo que reduce el peso y permite inferencia en CPU.

Se trata de un transformer-big de Marian con tokenización SentencePiece (spm32k) en origen y destino, entrenado sobre el corpus opusTCv20210807+bt. Su relevancia práctica radica en que ofrece traducción inglés-italiano de calidad razonable en un paquete de 0,3 GB ejecutable en CPU, lo que lo hace útil para pipelines de localización y traducción por lotes en entornos sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian NMT, variante transformer-big) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (ONNX) |
| Idiomas soportados | inglés (en) como origen, italiano (it) como destino |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (int8 cuantizado) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer encoder-decoder completo de la familia Marian, en su configuración transformer-big, entrenado con el framework Marian NMT (implementación en C++) y convertido posteriormente a PyTorch. La tokenización emplea SentencePiece con vocabularios de 32k entradas tanto en origen como en destino (spm32k, spm32k). Los datos de entrenamiento proceden del corpus opusTCv20210807+bt, generado con los procedimientos de OPUS-MT-train a partir de los corpus paralelos de OPUS, con backtranslation incluida (el sufijo +bt). La fecha de publicación del modelo original es el 13 de marzo de 2022.

Este repositorio concreto no reentrena ni modifica los pesos: aplica una conversión a ONNX mediante optimum-onnx y una cuantización int8 para reducir el tamaño y permitir inferencia eficiente en CPU con onnxruntime. El script de conversión exacto está disponible en el repositorio locale-ai del autor. No se documentan en la información disponible detalles sobre volumen de tokens de entrenamiento, composición exacta del dataset ni uso de RLHF o DPO, que en cualquier caso no son habituales en modelos NMT de esta familia.

## Capacidades

- Traducción automática unidireccional de inglés a italiano.
- Traducción por lotes: el modelo acepta múltiples frases con padding, como muestra el ejemplo de la model card.
- Ejecución en CPU sin PyTorch mediante onnxruntime, gracias a la conversión ONNX e cuantización int8.
- Tokenización SentencePiece integrada (spm32k) para origen y destino.
- Integración con la CLI locale-ai para traducir ficheros de localización i18n.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada estrictamente al par inglés-italiano.
- No es un modelo generativo de propósito general: está especializado en traducción.

## Casos de uso

- Localización de ficheros i18n: es el caso de uso para el que se creó esta conversión; la CLI locale-ai carga el modelo ONNX y traduce las cadenas de un fichero de locale inglés a italiano en local sobre CPU, sin enviar datos a servicios externos.
- Traducción por lotes de documentación técnica: el modelo procesa listas de frases con padding en una sola llamada, lo que permite traducir grandes volúmenes de párrafos de manuales o README de inglés a italiano de forma secuencial y económica.
- Pre-traducción en flujos de trabajo de traductores humanos: se puede usar como primera pasada automática que un revisor humano pos-edita, reduciendo el esfuerzo en textos informativos o de soporte.
- Traducción de contenido web y blogs: adecuado para artículos, entradas y páginas estáticas donde se requiere una traducción rápida y de calidad aceptable sin infraestructura GPU.
- Procesamiento en entornos con recursos limitados: al ser un ONNX int8 de 0,3 GB ejecutable con onnxruntime, encaja en contenedores pequeños, servidores sin GPU o incluso portátiles para tareas de traducción puntuales.
- Generación de subtítulos o textos cortos: para frases y diálogos breves, el modelo ofrece traducciones directas que pueden integrarse en pipelines de postproducción o accesibilidad.
- Evaluación comparativa de NMT: sirve como línea base ligera en experimentos que comparen calidad de traducción inglés-italiano frente a modelos mayores o servicios comerciales.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model-index de la model card (no verificados):

| Par de idiomas | Test set | chr-F | BLEU | Frases | Palabras |
|---|---|---|---|---|---|
| eng-ita | tatoeba-test-v2021-08-07 | 0,72539 | 53,9 | 17.320 | 116.336 |
| eng-ita | flores101-devtest | 0,59002 | 29,6 | 1.012 | 27.306 |
| eng-ita | newssyscomb2009 | 0,60759 | 31,2 | no disponible | no disponible |

No se han publicado en la información disponible resultados de benchmarks del modelo ONNX cuantizado frente al modelo original en PyTorch, por lo que no es posible cuantificar la pérdida de calidad introducida por la cuantización int8.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso de uso previsto (CPU con onnxruntime); en GPU, el modelo int8 de 0,3 GB requiere una cantidad de VRAM muy reducida, aunque no se dispone de cifras oficiales.
- GPU recomendadas: no disponible; el modelo está pensado para ejecución en CPU.
- Cabe en GPU consumer: sí, por tamaño (0,3 GB en int8), aunque no se documentan requisitos ni rendimiento en GPU.
- Opciones de despliegue: onnxruntime (vía prevista por el autor), y el modelo original en PyTorch mediante transformers con MarianMTModel y MarianTokenizer o el pipeline de traducción.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BLEU eng-ita (flores101-devtest) | Licencia | Formato |
|---|---|---|---|---|---|
| khabouss/opus-mt-tc-big-en-it-onnx | no disponible | no disponible | 29,6 (declarado) | cc-by-4.0 | ONNX int8 |
| Helsinki-NLP/opus-mt-tc-big-en-it | no disponible | no disponible | 29,6 (declarado) | cc-by-4.0 | PyTorch (safetensors/bin) |
| Helsinki-NLP/opus-mt-en-it | no disponible | no disponible | no disponible | cc-by-4.0 | PyTorch |
| Modelos NMT comerciales (p. ej. DeepL, Google Translate) | no disponible | no disponible | no disponible | propietaria | API |

La comparación principal es con el modelo original en PyTorch del que deriva: comparten pesos y resultados declarados, y la diferencia estriba en el formato (ONNX int8 frente a PyTorch) y en la orientación a CPU. Frente a modelos NMT comerciales no hay datos públicos comparables en la información disponible.

## Limitaciones y advertencias

- Modelo unidireccional: solo traduce de inglés a italiano; no soporta la dirección inversa ni otros pares de idiomas.
- La cuantización int8 puede introducir degradación de calidad respecto al modelo original en PyTorch; no se han publicado métricas que la cuantifiquen.
- Riesgo de traducciones literales o incorrectas en frases con ambigüedad, jerga, nombres propios o estructuras muy alejadas del dominio de entrenamiento.
- No es un modelo conversacional ni de razonamiento: no debe emplearse para tareas distintas de la traducción.
- Sesgos: al entrenarse sobre corpus de OPUS, puede heredar sesgos de género, culturales y de dominio presentes en los datos paralelos; no se documentan análisis específicos.
- Longitud de contexto no documentada: para textos largos conviene segmentar en frases o párrafos.
- Licencia cc-by-4.0: permite uso comercial con atribución; es necesario citar el trabajo original de OPUS-MT (Tiedemann y Thottingal, 2020; Tiedemann, 2020) y respetar las condiciones de atribución.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026: se trata de un artefacto reciente y sin validación comunitaria, por lo que conviene evaluar su calidad antes de usarlo en producción.
- El autor declara que todo el crédito del modelo, entrenamiento y datos corresponde al proyecto OPUS-MT; este repositorio solo añade la conversión y cuantización.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/khabouss/opus-mt-tc-big-en-it-onnx
- Modelo original en PyTorch: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-en-it
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Framework Marian NMT: https://marian-nmt.github.io/
- Corpus OPUS: https://opus.nlpl.eu/
- Procedimientos de entrenamiento OPUS-MT-train: https://github.com/Helsinki-NLP/Opus-MT-train
- Tatoeba-Challenge (datos y modelos): https://github.com/Helsinki-NLP/Tatoeba-Challenge
- README de modelos eng-ita: https://github.com/Helsinki-NLP/Tatoeba-Challenge/tree/master/models/eng-ita/README.md
- Publicación OPUS-MT (EAMT 2020): https://aclanthology.org/2020.eamt-1.61/
- Publicación Tatoeba Translation Challenge (WMT 2020): https://aclanthology.org/2020.wmt-1.139/
- Modelo original empaquetado: https://object.pouta.csc.fi/Tatoeba-MT-models/eng-ita/opusTCv20210807+bt_transformer-big_2022-03-13.zip
- Traducciones del test set: https://object.pouta.csc.fi/Tatoeba-MT-models/eng-ita/opusTCv20210807+bt_transformer-big_2022-03-13.test.txt
- Puntuaciones del test set: https://object.pouta.csc.fi/Tatoeba-MT-models/eng-ita/opusTCv20210807+bt_transformer-big_2022-03-13.eval.txt
- Herramienta locale-ai: https://github.com/khabouss/locale-ai
- Script de conversión: https://github.com/khabouss/locale-ai/blob/main/scripts/convert-marian.py
- optimum-onnx: https://github.com/huggingface/optimum-onnx
