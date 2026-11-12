# khabouss/opus-mt-tc-big-en-ar-onnx

## Resumen

`khabouss/opus-mt-tc-big-en-ar-onnx` es una conversión a ONNX con cuantización int8 del modelo de traducción automática neuronal `Helsinki-NLP/opus-mt-tc-big-en-ar`, desarrollado originalmente por el proyecto OPUS-MT del grupo Language Technology de la Universidad de Helsinki. El modelo traduce de inglés (en) a árabe (ar), con soporte adicional de la etiqueta de dialecto `>>afb<<` (árabe del Golfo) además de `>>ara<<` (árabe estándar moderno). La conversión la firma el usuario khabouss para integrarla como modelo embebido en `locale-ai`, una herramienta de línea de comandos que traduce ficheros de localización i18n en local sobre CPU.

La relevancia de esta variante reside en el formato: al estar exportada a ONNX e cuantizada a int8, puede ejecutarse con `onnxruntime` sin necesidad de PyTorch, lo que reduce requisitos de memoria y dependencias para despliegues en CPU. El modelo subyacente es un transformer-big de Marian NMT, entrenado sobre el corpus opusTCv20210807+bt, con tokenización SentencePiece de 32k. El repositorio ocupa 0,4 GB y se publica bajo licencia CC-BY-4.0.

Se trata, por tanto, de una pieza de infraestructura para pipelines de traducción EN→AR de bajo coste computacional, no de un modelo de propósito general. Su valor está en la reproducibilidad del proceso de conversión (documentado en el repositorio `locale-ai`) y en la posibilidad de ejecutarlo en entornos sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Marian NMT, variante transformer-big) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (ONNX) |
| Idiomas soportados | en (origen), ar (destino); etiquetas de destino validas: `>>ara<<`, `>>afb<<` |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (int8); modelo original en PyTorch/safetensors via transformers |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer-big de Marian NMT, la implementación en C++ de traducción automática neuronal del proyecto OPUS-MT. Se entrenó sobre el corpus `opusTCv20210807+bt` (datos de OPUS con back-translation), con tokenización SentencePiece de 32k para origen y destino. La fecha de publicación del modelo original es el 25 de febrero de 2022. El modelo es multilingüe en el lado del destino: acepta una etiqueta inicial de idioma de destino (`>>ara<<` para árabe estándar moderno, `>>afb<<` para árabe del Golfo).

La variante aquí descrita no reentrena ni modifica los pesos: aplica una conversión a ONNX mediante `optimum-onnx` y una cuantización int8 para su uso con `onnxruntime` sin PyTorch. El proceso exacto está documentado en el script `scripts/convert-marian.py` del repositorio `locale-ai`. No se dispone de información sobre el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo etapas de RLHF o DPO (no aplicables habitualmente en NMT clásico).

## Capacidades

- Traducción automática de inglés a árabe (estándar moderno y, con la etiqueta correspondiente, árabe del Golfo).
- Traducción por frases y por lotes con `transformers` (MarianMTModel) o mediante `onnxruntime` en la variante ONNX.
- Selección de idioma de destino mediante token inicial (`>>ara<<`, `>>afb<<`).
- Ejecución en CPU sin PyTorch gracias al formato ONNX int8.
- Integración en pipelines de localización i18n (caso de uso original de `locale-ai`).
- No soporta tool calling, agentes, visión, audio ni modos de razonamiento extendido: es un modelo de traducción puro.

## Casos de uso

- Localización de ficheros i18n: el modelo traduce cadenas de recursos de inglés a árabe dentro de la CLI `locale-ai`, ejecutándose en local sobre CPU y sin enviar datos a servicios externos. Es su caso de uso principal y el motivo de la conversión.
- Traducción por lotes en servidores sin GPU: al estar en ONNX int8 y ejecutarse con `onnxruntime`, permite procesar volúmenes medios de texto en máquinas sin acelerador hardware.
- Preprocesado multilingüe para pipelines de NLP: traducción EN→AR previa a tareas de análisis de sentimiento, clasificación o extracción de entidades sobre contenido árabe.
- Generación de documentación técnica bilingüe: traducción de READMEs, guías y mensajes de error en proyectos de software con audiencia arabófona.
- Traducción de contenido de atención al cliente: conversión de plantillas y respuestas frecuentes de inglés a árabe estándar moderno para su revisión humana posterior.
- Prototipado rápido de aplicaciones de traducción: al no requerir PyTorch ni GPU, sirve para validar flujos de traducción en entornos de desarrollo ligeros o contenedores minimalistas.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo original en la model card (no verificados, `verified: false`):

| Test | Tarea | BLEU |
|---|---|---|
| flores101-devtest | eng-ara | 29,4 |
| tatoeba-test-v2020-07-28 | eng-ara | 20,0 |
| tico19-test | eng-ara | 30,0 |

No se han publicado resultados de benchmarks específicos para la variante ONNX int8 en la información disponible; los valores anteriores corresponden al modelo original `Helsinki-NLP/opus-mt-tc-big-en-ar`.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la variante ONNX int8, diseñada para CPU; el repositorio ocupa 0,4 GB, por lo que la huella en memoria es del orden de cientos de MB.
- GPU recomendadas: no se especifican; el modelo está pensado para ejecución en CPU con `onnxruntime`.
- Compatibilidad con GPU de consumo: no documentada para esta variante; el modelo original en PyTorch podría ejecutarse en GPUs de consumo, pero no hay datos publicados.
- Opciones de despliegue: `onnxruntime` (vía `optimum-onnx`); el modelo original admite `transformers` (MarianMTModel, pipeline de traducción).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BLEU eng-ara (flores101) | Licencia | Formato |
|---|---|---|---|---|---|
| khabouss/opus-mt-tc-big-en-ar-onnx | no disponible | no disponible | 29,4 (heredado del original) | CC-BY-4.0 | ONNX int8 |
| Helsinki-NLP/opus-mt-tc-big-en-ar | no disponible | no disponible | 29,4 | CC-BY-4.0 | PyTorch/safetensors |
| Helsinki-NLP/opus-mt-en-ar | no disponible | no disponible | no disponible | CC-BY-4.0 | PyTorch/safetensors |
| NLLB-200 (variantes) | no disponible | no disponible | no disponible | CC-BY-NC-4.0 (según variante) | PyTorch/safetensors |

La comparación se limita a la familia OPUS-MT y a alternativas multilingües de NMT; no se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de traducción unidireccional EN→AR; no traduce en sentido inverso ni entre otros pares de idiomas.
- La etiqueta `>>ary<<` (dariya marroquí) existe en el vocabulario, pero la model card advierte que la salida se mantiene próxima al árabe estándar moderno, por lo que ese dialecto no se considera soportado.
- Los BLEU declarados no están verificados (`verified: false`) y proceden del modelo original, no de la variante ONNX int8; la cuantización puede degradar ligeramente la calidad.
- Riesgo de alucinación y de traducciones literales en frases idiomáticas, nombres propios y terminología especializada, habitual en modelos NMT de este tamaño.
- Sesgos potenciales heredados de los corpus de OPUS, cuya composición detallada no se documenta en la información disponible.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar los trabajos de OPUS-MT (Tiedemann y Thottingal, 2020; Tiedemann, 2020).
- Sin soporte de tool calling, agentes ni razonamiento multi-paso; no debe emplearse como modelo generativo de propósito general.
- Longitud de contexto no documentada; Marian NMT está diseñado para frases u oraciones, no para documentos largos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/khabouss/opus-mt-tc-big-en-ar-onnx
- Modelo original: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-en-ar
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Marian NMT: https://marian-nmt.github.io/
- OPUS: https://opus.nlpl.eu/
- OPUS-MT-train: https://github.com/Helsinki-NLP/Opus-MT-train
- Tatoeba-Challenge (modelos eng-ara): https://github.com/Helsinki-NLP/Tatoeba-Challenge/tree/master/models/eng-ara/README.md
- Publicación OPUS-MT: https://aclanthology.org/2020.eamt-1.61/
- Publicación Tatoeba Translation Challenge: https://aclanthology.org/2020.wmt-1.139/
- Documentación MarianMT en transformers: https://huggingface.co/docs/transformers/model_doc/marian
- Repositorio locale-ai: https://github.com/khabouss/locale-ai
- Script de conversión: https://github.com/khabouss/locale-ai/blob/main/scripts/convert-marian.py
- optimum-onnx: https://github.com/huggingface/optimum-onnx
- Pesos originales: https://object.pouta.csc.fi/Tatoeba-MT-models/eng-ara/opusTCv20210807+bt_transformer-big_2022-02-25.zip
