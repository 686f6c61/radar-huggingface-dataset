# khabouss/opus-mt-tc-big-en-tr-onnx

## Resumen

`khabouss/opus-mt-tc-big-en-tr-onnx` es una conversión a ONNX con cuantización int8 del modelo de traducción automática neuronal `Helsinki-NLP/opus-mt-tc-big-en-tr`, desarrollado originalmente por el proyecto OPUS-MT del grupo Language Technology de la Universidad de Helsinki. El modelo base traduce de inglés (en) a turco (tr) y forma parte de la familia OPUS-MT, una iniciativa para publicar modelos de traducción abiertos para un gran número de pares de idiomas. La conversión la firma el usuario `khabouss` y está pensada para integrarse como modelo embebido en `locale-ai`, una herramienta de línea de comandos que traduce ficheros de localización i18n en local sobre CPU.

El modelo subyacente es un transformer-big de arquitectura Marian NMT, entrenado con datos de OPUS (corpus opusTCv20210807+bt) y tokenización SentencePiece con vocabulario de 32k. La versión publicada aquí elimina la dependencia de PyTorch: los pesos se distribuyen en formato ONNX cuantizado a int8, lo que permite ejecutar la inferencia con `onnxruntime` en CPU sin GPU y con un tamaño de repositorio de apenas 0,4 GB.

Su relevancia actual es práctica: para pipelines de localización, traducción de documentación o preprocesado de datos, un modelo dedicado en->tr cuantizado y ejecutable en CPU ofrece una alternativa ligera y sin dependencias pesadas frente a LLMs multiuso, con una calidad declarada de 31,4 BLEU en FLORES-101 y 42,3 BLEU en Tatoeba. La licencia CC-BY-4.0 facilita su uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Marian NMT, variante transformer-big) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (ONNX) |
| Idiomas soportados | inglés (en) como origen, turco (tr) como destino |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (int8 cuantizado) |

## Arquitectura y entrenamiento

El modelo base es un transformer encoder-decoder de tipo Marian NMT, la implementación en C++ desarrollada por el equipo de Helsinki, posteriormente convertida a PyTorch para su uso con la librería `transformers`. Se trata de la variante `transformer-big`, la de mayor capacidad dentro de la familia OPUS-MT, con tokenización SentencePiece de vocabulario 32k para origen y destino. El entrenamiento se realizó sobre el corpus `opusTCv20210807+bt`, que combina datos paralelos de OPUS con back-translation, siguiendo los procedimientos de OPUS-MT-train y el marco del Tatoeba Translation Challenge. La fecha de publicación del modelo original es el 25 de febrero de 2022.

La aportación de este repositorio concreto no es el entrenamiento, sino la conversión y optimización para despliegue: se aplicó `optimum-onnx` para exportar el modelo a ONNX y se cuantizó a int8, de modo que la inferencia se ejecuta con `onnxruntime` sin necesidad de PyTorch ni de GPU. El script exacto de conversión (`scripts/convert-marian.py`) está publicado en el repositorio `locale-ai` del mismo autor. No se dispone de información sobre hiperparámetros de entrenamiento, número exacto de tokens vistos ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en NMT supervisada).

## Capacidades

- Traducción automática unidireccional de inglés a turco, tanto de frases sueltas como de lotes con padding.
- Procesamiento por lotes (batch translation) mediante la API de `transformers` o directamente con `onnxruntime`.
- Ejecución en CPU sin PyTorch, gracias al formato ONNX int8.
- Integración como modelo embebido en la CLI `locale-ai` para traducir ficheros de localización i18n.
- Tokenización SentencePiece integrada (spm32k) para ambos lados del par de idiomas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio: es un modelo puramente de traducción.
- No es multilingüe más allá del par en->tr; no traduce otros idiomas.

## Casos de uso

- Localización de software: traducción automática de ficheros de recursos i18n (JSON, YAML, `.po`) del inglés al turco dentro de la CLI `locale-ai`, ejecutándose en local sin enviar cadenas a servicios externos y sin GPU.
- Traducción de documentación técnica: conversión de README, guías y manuales en inglés a turco en pipelines de CI/CD, aprovechando el bajo peso del modelo (0,4 GB) y su ejecución en CPU.
- Preprocesado de corpus para investigación: generación de traducciones en->tr a gran escala sobre datasets paralelos, con throughput alto al no requerir acelerador.
- Atención al cliente en turco: traducción de tickets y mensajes entrantes en inglés a turco para su enrutado o revisión por agentes humanos, con la calidad declarada de 42,3 BLEU en Tatoeba.
- Subtitulado y transcripción: traducción de subtítulos en inglés a turco en herramientas de escritorio o servidores sin GPU.
- Traducción de contenido editorial y noticias: el modelo rinde de forma específica en dominios periodísticos (newstest2016-2018), lo que lo hace adecuado para traducir titulares y artículos.
- Prototipado y evaluación de pipelines NMT: al ser ONNX int8, sirve como baseline ligero para comparar con modelos mayores en tareas de traducción en->tr.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados), sobre el par eng-tur:

| Dataset | Métrica | Valor |
|---|---|---|
| flores101-devtest | BLEU | 31,4 |
| newsdev2016 | BLEU | 21,9 |
| tatoeba-test-v2021-08-07 | BLEU | 42,3 |
| newstest2016 | BLEU | 23,4 |
| newstest2017 | BLEU | 25,4 |
| newstest2018 | BLEU | 22,6 |

No se han publicado en la información disponible resultados de latencia o throughput para la versión ONNX int8.

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para inferencia en CPU con `onnxruntime`. El repositorio ocupa 0,4 GB, por lo que el consumo de memoria RAM es del orden de unos pocos GB incluyendo el runtime.
- GPU: no requiere GPU. Puede ejecutarse en cualquier CPU moderna; no se dispone de datos de rendimiento en A100, H100 o RTX 4090 para esta conversión concreta.
- Cabe en cualquier equipo de consumo, incluidos portátiles y servidores de gama baja, al ser un modelo cuantizado a int8.
- Opciones de despliegue: `onnxruntime` (vía `optimum-onnx`), y la CLI `locale-ai` que lo integra. No se indica soporte para vLLM, TGI o llama.cpp, que no están orientados a Marian NMT.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BLEU eng-tur (FLORES-101) | Licencia | Formato |
|---|---|---|---|---|---|
| khabouss/opus-mt-tc-big-en-tr-onnx | no disponible | no disponible | 31,4 | CC-BY-4.0 | ONNX int8 |
| Helsinki-NLP/opus-mt-tc-big-en-tr | no disponible | no disponible | 31,4 | CC-BY-4.0 | PyTorch (safetensors/bin) |
| Helsinki-NLP/opus-mt-en-tr | no disponible | no disponible | no disponible | CC-BY-4.0 | PyTorch |

La comparación directa más relevante es con el modelo original `Helsinki-NLP/opus-mt-tc-big-en-tr`, del que esta versión es una conversión: misma calidad esperada, pero con dependencia de PyTorch y mayor peso en disco. El modelo `opus-mt-en-tr` (familia anterior, sin `tc-big`) es una alternativa más ligera pero sin datos de BLEU publicados en esta información. No se dispone de comparativas con otros sistemas NMT (por ejemplo, NLLB o M2M-100) en los datos proporcionados.

## Limitaciones y advertencias

- Modelo unidireccional: solo traduce de inglés a turco; no soporta la dirección inversa ni otros pares de idiomas.
- No es un modelo generativo de propósito general: no responde preguntas, no razona ni ejecuta herramientas.
- Riesgo de alucinación y errores de traducción en dominios especializados (legal, médico, técnico muy específico), en jerga y en texto con ruido; requiere revisión humana en producción.
- Los BLEU declarados no están verificados (`verified: false` en la model-index) y proceden del autor del modelo.
- La cuantización int8 puede introducir una ligera degradación de calidad frente a los pesos originales en FP32/FP16; no se han publicado métricas comparativas de esa pérdida.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribución al proyecto OPUS-MT y a los autores originales (Tiedemann y Thottingal, 2020; Tiedemann, 2020).
- El repositorio no tiene descargas ni likes y fue creado en 2026 según los metadatos; conviene validar su procedencia y reproducibilidad antes de adoptarlo en producción.
- No se dispone de información sobre sesgos específicos del par en->tr ni sobre el tratamiento de nombres propios o entidades culturales turcas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/khabouss/opus-mt-tc-big-en-tr-onnx
- Modelo original: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-en-tr
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Pipeline de entrenamiento OPUS-MT-train: https://github.com/Helsinki-NLP/Opus-MT-train
- Marian NMT: https://marian-nmt.github.io/
- OPUS (corpus): https://opus.nlpl.eu/
- Tatoeba-Challenge: https://github.com/Helsinki-NLP/Tatoeba-Challenge
- README de modelos eng-tur: https://github.com/Helsinki-NLP/Tatoeba-Challenge/tree/master/models/eng-tur/README.md
- Modelo original en zip: https://object.pouta.csc.fi/Tatoeba-MT-models/eng-tur/opusTCv20210807+bt_transformer-big_2022-02-25.zip
- CLI locale-ai: https://github.com/khabouss/locale-ai
- Script de conversión: https://github.com/khabouss/locale-ai/blob/main/scripts/convert-marian.py
- optimum-onnx: https://github.com/huggingface/optimum-onnx
- Paper OPUS-MT (EAMT 2020): https://aclanthology.org/2020.eamt-1.61/
- Paper Tatoeba Translation Challenge (WMT 2020): https://aclanthology.org/2020.wmt-1.139/
