# mradermacher/Transliteration-2.0-0.8B-Safetensors-GGUF

## Resumen

Transliteration-2.0-0.8B es un modelo lingüístico especializado en transliteración desarrollado por UnimeType, del cual este repositorio de mradermacher constituye una colección de cuantizaciones estáticas en formato GGUF. El modelo base, con 752 millones de parámetros, está diseñado para convertir texto entre sistemas de escritura: pinyin para chino, romaji para japonés, hinglish (hindi romanizado), arabizi (árabe romanizado) y romanización del inglés. Se basa en la arquitectura Qwen 3.5 (versión 2.1 del modelo, según sus tags).

Su relevancia radica en la resolución de un problema concreto y frecuente en aplicaciones de procesamiento de lenguaje: la conversión entre alfabetos y sistemas de romanización, algo crítico para teclados IME, búsqueda multilingüe, normalización de nombres propios y comprensión de texto coloquial romanizado en redes sociales. Al tratarse de un modelo muy pequeño (0,8B), puede ejecutarse en hardware modesto, incluso en portátiles sin GPU dedicada, lo que lo hace idóneo para despliegues en local o en el borde. La licencia Apache 2.0 permite su uso comercial sin restricciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen 3.5, según tags del modelo) |
| Parámetros totales | 752.393.024 |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en), chino (zh), japonés (ja), hindi (hi), árabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base es UnimeType/Transliteration-2.0-0.8B-Safetensors, un transformer de aproximadamente 752 millones de parámetros construido sobre la familia Qwen 3.5 (según los tags del repositorio). Es un modelo denso convencional; no hay indicios de que sea una arquitectura MoE. Su especialización es la transliteración entre escrituras: chino a pinyin, japonés a romaji, hindi a hinglish y árabe a arabizi, además de inglés.

Sobre los datos de entrenamiento, el número de tokens, la composición del corpus y la aplicación de técnicas como RLHF o DPO no están disponibles en la información proporcionada. Tampoco se detalla si el modelo es un fine-tuning completo o parcial de un Qwen 3.5 existente. Este repositorio en concreto no modifica los pesos: mradermacher ha generado cuantizaciones estáticas en GGUF (con conversión tipo hf) para permitir su ejecución con llama.cpp y herramientas compatibles; también existen cuantizaciones weighted/imatrix en un repositorio hermano.

## Capacidades

- Transliteración de chino a pinyin y viceversa.
- Transliteración de japonés a romaji.
- Romanización de hindi (hinglish) y de árabe (arabizi).
- Procesamiento de texto en inglés (en), chino (zh), japonés (ja), hindi (hi) y árabe (ar).
- Uso conversacional (etiquetado como conversational en el repositorio).
- Ejecución eficiente en CPU gracias al formato GGUF y a su tamaño reducido (versiones desde 0,5 GB).

No hay información disponible sobre soporte de tool calling, capacidades de agentes, visión, audio ni modos de razonamiento extendido.

## Casos de uso

- Motores de búsqueda multilingüe: normalizar consultas romanizadas (por ejemplo, arabizi o pinyin) a su forma canónica para indexar y recuperar documentos en escritura original.
- Teclados IME y entrada de texto: integrar el modelo en sistemas de entrada para sugerir conversiones entre romanización y escritura nativa en chino, japonés o hindi, aprovechando su tamaño mínimo para ejecutarse en el dispositivo.
- Normalización de nombres propios: convertir nombres en alfabeto latino a escrituras nativas (o al revés) en bases de datos de clientes, registros o sistemas KYC.
- Análisis de redes sociales: interpretar y normalizar contenido coloquial en hinglish o arabizi, muy habitual en Twitter/X, WhatsApp o foros de usuarios de India y el mundo árabe.
- Preprocesamiento para pipelines de NLP: usarlo como componente de romanización o des-romanización antes de pasar texto a modelos más grandes que solo acepten escritura nativa.
- Asistentes de aprendizaje de idiomas: generar romanizaciones correctas de frases en chino, japonés, hindi o árabe para estudiantes que aún no dominan el sistema de escritura.
- Chatbots locales en hardware modesto: dado que las cuantizaciones Q4 ocupan unos 0,6 GB, puede desplegarse en portátiles, mini-PC o Raspberry Pi de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM / memoria estimada para inferencia: entre 0,5 GB (Q2_K) y 1,6 GB (f16) según la cuantización elegida; la cuantización Q4_K_M recomendada ocupa unos 0,6 GB. Cabe íntegramente en la RAM de cualquier equipo moderno o en la VRAM de prácticamente cualquier GPU.
- GPU recomendadas: no requiere GPU dedicada; funciona por CPU con llama.cpp. Si se desea aceleración, cualquier GPU moderna sirve (incluso integradas o una RTX 3050 con 4 GB es más que suficiente).
- Consumer GPUs: cabe con holgura en cualquier GPU consumer actual (RTX 3060, 4060, 4090, etc.), e incluso es ejecutable sin GPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF; el modelo base en safetensors puede usarse con la librería transformers de Hugging Face.
- Latencia y throughput estimados: no disponibles; dada la cuantización Q4 de unos 0,6 GB y el tamaño de 0,8B, se espera inferencia muy rápida incluso en CPU de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Transliteration-2.0-0.8B (este modelo) | 752M | no disponible | Transliteración (pinyin, romaji, hinglish, arabizi) | Apache 2.0 | GGUF y safetensors en Hugging Face |
| Qwen 3.5 (base, 0.6B-0.8B aprox.) | ~0,6-0,8B | no disponible para esta variante | Modelo general multilingüe | no disponible | Hugging Face |
| Modelos transliteración dedicados (p. ej. ai4bharat/IndicXlit) | no disponible | no disponible | Transliteración de lenguas indicas | no disponible | Hugging Face |

Nota: no existen muchas alternativas abiertas comparables que cubran simultáneamente pinyin, romaji, hinglish y arabizi en un único modelo de 0,8B, lo que constituye su principal diferenciador. Para detalles de los modelos alternativos, los datos concretos no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Ámbito muy especializado: es un modelo de 0,8B orientado a transliteración; no debe esperarse rendimiento de modelo general en razonamiento, código o redacción.
- Idiomas limitados a cinco (en, zh, ja, hi, ar); su comportamiento fuera de ellos no está documentado.
- Riesgo de alucinación: no evaluado públicamente; en tareas de transliteración de nombres poco frecuentes puede producir romanizaciones incorrectas, por lo que conviene validación humana en producción.
- Cuantizaciones agresivas (Q2_K, Q3_K_M) degradan la calidad; el propio autor recomienda Q4_K_S, Q4_K_M o superiores.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache 2.0: sin restricciones para uso comercial, aunque debe respetarse la atribución y conservarse el aviso de licencia.
- Longitud de contexto no publicada: verificarla antes de usarlo con entradas largas.
- Este repositorio es una cuantización de terceros (mradermacher); cualquier problema de calidad hereda tanto del modelo base como del proceso de cuantización.

## Enlaces

- Repositorio GGUF (cuantizaciones estáticas): https://huggingface.co/mradermacher/Transliteration-2.0-0.8B-Safetensors-GGUF
- Modelo base: https://huggingface.co/UnimeType/Transliteration-2.0-0.8B-Safetensors
- Cuantizaciones weighted/imatrix: https://huggingface.co/mradermacher/Transliteration-2.0-0.8B-Safetensors-i1-GGUF
- Página de descargas de mradermacher: https://hf.tst.eu/model#Transliteration-2.0-0.8B-Safetensors-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa de mradermacher: https://www.nethype.de/
