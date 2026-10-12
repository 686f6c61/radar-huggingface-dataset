# baker76/pdftool-models

## Resumen

baker76/pdftool-models es un repositorio de pesos en formato ONNX que empaqueta los dos modelos que utiliza pdftool, una herramienta de línea de comandos escrita en C++ que convierte PDF a Markdown y traduce PDF in situ. El repositorio no contiene ningún entrenamiento ni ajuste fino propio: cada carpeta es una conversión de formato de pesos ya existentes y se mantiene bajo la licencia del autor original (Apache-2.0 en ambos casos). Los modelos base son deepseek-ai/DeepSeek-OCR-2, para el reconocimiento óptico de documentos, y Helsinki-NLP/opus-mt-es-en, para la traducción de español a inglés.

El repositorio ocupa 21,5 GB y se organiza en tres carpetas autocontenidas: `deepseek-ocr2-fp16/` (6,6 GB, orientada a GPU), `deepseek-ocr2-fp32/` (13 GB, orientada a CPU) y `opus-mt-es-en/` (0,6 GB). La propuesta de valor es la ejecución sobre ONNX Runtime sin dependencia alguna de Python, lo que permite integrar OCR y traducción dentro de binarios nativos o entornos donde no se puede desplegar un stack de Python.

Se trata de un artefacto muy reciente (creado el 11 de octubre de 2026, actualizado el 12 de octubre de 2026) y sin validación de la comunidad: acumula 0 descargas y 0 "likes" en el momento de redactar esta ficha. Su interés es práctico (formato y runtime) más que científico (no hay pesos nuevos ni resultados de evaluación publicados).

## Especificaciones tecnicas

### Componente de OCR (DeepSeek-OCR-2 exportado a ONNX)

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline multimodal de OCR: etapa SAM para vista completa y mosaicos, codificador visual basado en Qwen2 con proyector y decodificador de 12 capas con caché clave/valor y enrutamiento MoE evaluado de forma densa (enmascarado a los 6 expertos superiores) |
| Parametros totales | no disponible; el peso fp32 en disco (13 GB) apunta a un orden de 3.000-3.500 millones de parámetros |
| Parametros activos | no disponible (el export evalúa todos los expertos y enmascara la salida a los 6 superiores) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 y fp32 (sin variantes int8, int4 ni GGUF) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`.onnx` + `.onnx.data`), más `tokenizer.json` y `config.json` |

### Componente de traducción (OPUS-MT es-en exportado a ONNX)

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer seq2seq de traducción automática (encoder y decoder separados en ONNX); el decoder no usa caché y se reejecuta en cada paso |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas) |
| Idiomas soportados | español a inglés (par confirmado por el modelo base) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`encoder.onnx`, `decoder.onnx`), más `source.spm`, `target.spm` y `vocab.json` |

### Repositorio

| Parametro | Valor |
|---|---|
| Tamano del repositorio | 21,5 GB |
| Runtime objetivo | ONNX Runtime (sin Python) |
| Pipeline declarado | image-text-to-text |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-10-11 / 2026-10-12 |

## Arquitectura y entrenamiento

No hay entrenamiento ni ajuste fino por parte del autor del repositorio: la model card indica explícitamente que nada fue entrenado ni afinado por ellos y que cada carpeta es una conversión de formato de los pesos originales. Por tanto, la composición del dataset, el número de tokens y el uso de RLHF o DPO corresponden a los modelos de origen (DeepSeek-OCR-2 y OPUS-MT es-en) y no se detallan en la información proporcionada.

En el componente de OCR, la conversión descompone el modelo en cuatro piezas ONNX: `vision_sam_1024.onnx` y `vision_sam_768.onnx` (etapa SAM para la vista de página completa y para los mosaicos), `vision_encoder.onnx` (codificador visual basado en Qwen2 más el proyector) y `decoder.onnx`, que integra el embedding de tokens, la fusión de características de imagen, el decodificador de 12 capas con caché clave/valor y la cabeza de salida. La innovación técnica destacable del export es la forma de tratar el enrutamiento MoE: en lugar de implementar un enrutador disperso, se evalúan todos los expertos y se enmascara el resultado a los 6 expertos superiores, lo que según el autor produce el mismo resultado que el enrutamiento disperso original a cambio de más cómputo por token.

En el componente de traducción, `encoder.onnx` y `decoder.onnx` se exportan sin caché: el decoder se reejecuta completo en cada paso de generación. Según la model card, los logits coinciden con PyTorch dentro de una tolerancia de 1e-5. Cada carpeta es autocontenida y los ficheros `.onnx` cargan sus pesos desde el `.onnx.data` situado a su lado, por lo que hay que descargar la carpeta completa y conservar los nombres de fichero. Los scripts de exportación están en el repositorio de pdftool, bajo `tools/export/`.

## Capacidades

- Conversión de PDF a Markdown: el componente DeepSeek-OCR-2 extrae texto y estructura del documento y lo emite en formato Markdown.
- OCR con coordenadas: la salida incluye coordenadas de bounding box, lo que permite reconstruir la disposición espacial del contenido. El autor documenta que en fp16 dos coordenadas de una página de prueba difieren en 1 unidad respecto al modelo PyTorch.
- Traducción español a inglés: el componente OPUS-MT traduce texto de español a inglés y permite traducir un PDF en el sitio.
- Ejecución sin Python: ambos componentes corren sobre ONNX Runtime, lo que habilita su integración en binarios C++ y en entornos sin intérprete de Python.
- Operación en GPU y en CPU: el export fp16 está pensado para GPU y el fp32 para CPU.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta un modo "thinking" ni capacidades de audio o vídeo.
- El multilingüismo del componente de OCR no está declarado; en el componente de traducción solo se confirma el par español-inglés.

## Casos de uso

- Conversión masiva de archivos PDF a Markdown: se puede invocar `pdftool convert in.pdf -o out.md --model models/deepseek-ocr2-fp16` de forma iterativa sobre un corpus documental para generar documentación legible por máquinas sin depender de Python.
- Preprocesado para pipelines de RAG: el Markdown generado sirve como entrada directa para un troceado (chunking) y una indexación vectorial, y las coordenadas de bounding box permiten enlazar cada fragmento con su posición en la página original para trazabilidad.
- Traducción de documentación en español a inglés: `pdftool translate in.pdf -o out.pdf --model models/opus-mt-es-en` traduce el PDF tras el OCR, lo que resulta útil para organizaciones que publican manuales o informes solo en español y necesitan una versión en inglés.
- Despliegue en entornos sin Python: al ejecutarse sobre ONNX Runtime, los modelos se pueden empaquetar dentro de un servicio C++ o de una aplicación de escritorio sin arrastrar un intérprete de Python ni sus dependencias.
- Procesamiento en servidores solo-CPU: la carpeta fp32 evita la necesidad de una GPU en entornos de archivado o de back-office donde el hardware acelerado no está disponible.
- Digitalización de facturas y formularios escaneados: el OCR devuelve texto más coordenadas, lo que permite localizar campos por posición y reconstruir tablas simples antes de volcar los datos a un sistema de gestión.
- Preservación digital y archivado: conversión por lotes de fondos documentales a un formato de texto estructurado y buscable, con control total sobre el binario utilizado.
- Automatización en CI/CD: al ser una CLI con modelos locales, se puede integrar en un job que regenere documentación en Markdown o traducciones cada vez que cambian los PDF de un repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo documenta comprobaciones de fidelidad numérica entre el export ONNX y los pesos originales de PyTorch:

| Comprobacion | Resultado documentado |
|---|---|
| DeepSeek-OCR-2 fp32 frente a PyTorch (una página de prueba) | Salida idéntica token a token |
| DeepSeek-OCR-2 fp16 frente a PyTorch (una página de prueba) | Mismo texto; dos coordenadas de bounding box difieren en 1 unidad |
| OPUS-MT es-en ONNX frente a PyTorch | Logits coincidentes con una tolerancia de 1e-5 |

## Requisitos de hardware

- VRAM para OCR en fp16: los pesos ocupan 6,6 GB en disco, por lo que una estimación razonable es de 8 a 10 GB de VRAM una vez añadidos caché clave/valor y activaciones. Es una estimación derivada del tamaño de los ficheros, no un dato publicado.
- VRAM para OCR en fp32: los pesos ocupan 13 GB, de modo que en GPU se necesitarían al menos 14-16 GB; el autor lo orienta a CPU, donde el requisito pasa a ser de memoria RAM (del orden de 13-16 GB).
- Traducción es-en: 0,6 GB de pesos, cabe en CPU y en cualquier GPU con memoria suficiente.
- GPU recomendadas: no hay una lista publicada. Por tamaño de pesos, el export fp16 entra en tarjetas de consumo con 12-16 GB o más (por ejemplo, RTX 4080 o RTX 4090) y, con holgura, en RTX 3090, A100 o H100. Es una recomendación por encaje de memoria, no un dato de rendimiento medido.
- Cabe en GPU de consumo: sí, el export fp16 de 6,6 GB.
- Opciones de despliegue: ONNX Runtime y la propia CLI de pdftool. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no consumen estos artefactos ONNX.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La información disponible no incluye otros modelos de terceros comparables, pero sí permite comparar cada export con los pesos originales de los que deriva.

| Modelo | Formato | Tamano | Runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-OCR-2 (export ONNX fp16) | ONNX | 6,6 GB | ONNX Runtime, sin Python | apache-2.0 | Repositorio baker76/pdftool-models |
| DeepSeek-OCR-2 (export ONNX fp32) | ONNX | 13 GB | ONNX Runtime, sin Python | apache-2.0 | Repositorio baker76/pdftool-models |
| DeepSeek-OCR-2 (original) | PyTorch | no disponible | Python (Transformers) | apache-2.0 | deepseek-ai/DeepSeek-OCR-2 |
| OPUS-MT es-en (export ONNX) | ONNX | 0,6 GB | ONNX Runtime, sin Python | apache-2.0 | Repositorio baker76/pdftool-models |
| OPUS-MT es-en (original) | PyTorch | no disponible | Python (Transformers) | apache-2.0 | Helsinki-NLP/opus-mt-es-en |

La diferencia frente a los originales es de formato y de runtime, no de capacidades: los pesos son los mismos y la licencia se hereda sin cambios. No hay datos publicados que permitan comparar el rendimiento del export ONNX frente al original más allá de la fidelidad numérica descrita en la sección anterior.

## Limitaciones y advertencias

- Repositorio sin validación: 0 descargas y 0 "likes"; no hay evidencia de uso en producción por parte de terceros.
- No hay benchmarks publicados de calidad de OCR ni de traducción, solo comprobaciones de fidelidad numérica frente a PyTorch sobre una página de prueba.
- Riesgo de alucinación del OCR: no está documentado ni cuantificado por el autor, lo que obliga a validar la salida antes de usarla en flujos críticos.
- La licencia apache-2.0 se hereda de los modelos originales y debe respetarse igualmente; el autor advierte de que cada carpeta permanece bajo la licencia de su autor original.
- Los pesos fp16 introducen diferencias mínimas en las coordenadas de bounding box (1 unidad en la prueba documentada), relevante si se usan para recortes exactos.
- El decoder ONNX de OPUS-MT no usa caché y se reejecuta en cada paso de generación, lo que penaliza la latencia en textos largos.
- No hay variantes cuantizadas a int8 o int4 ni ficheros GGUF, por lo que el modelo no se puede ejecutar con llama.cpp u Ollama.
- No se declaran los idiomas soportados por el OCR; en traducción solo está confirmado el par español-inglés.
- El repositorio completo ocupa 21,5 GB y cada carpeta es autocontenida: hay que descargar la carpeta entera y conservar los nombres de fichero, porque el `.onnx` carga los pesos desde el `.onnx.data` adyacente.
- Los ficheros están pensados para ONNX Runtime; versiones antiguas del runtime pueden no soportar el grafo o los tipos exportados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/baker76/pdftool-models
- Modelo base del OCR: https://huggingface.co/deepseek-ai/DeepSeek-OCR-2
- Modelo base de traducción: https://huggingface.co/Helsinki-NLP/opus-mt-es-en
- Repositorio de pdftool con los scripts de exportación (`tools/export/`): URL no disponible en la información proporcionada
- Paper, blog o demo asociados: no disponibles
