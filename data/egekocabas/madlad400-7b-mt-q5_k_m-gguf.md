# egekocabas/madlad400-7b-mt-Q5_K_M-GGUF

## Resumen

Este repositorio contiene la conversión a formato GGUF del modelo de traducción multilingüe `google/madlad400-7b-mt`, realizado por el usuario egekocabas. Los pesos se han cuantizado en Q5_K_M, lo que reduce el tamaño del archivo a 6.0 GB y permite ejecutar el modelo con llama.cpp en CPU o GPU sin necesidad de instalar Transformers. MADLAD-400 es una familia de modelos encoder-decoder basados en T5, entrenada con el dataset `allenai/MADLAD-400`, que cubre más de 400 idiomas. Con 8.296.829.952 parámetros, este modelo está orientado exclusivamente a tareas de traducción de texto (text2text-generation). La cuantización a GGUF lo hace especialmente relevante para entornos de producción con presupuesto de VRAM limitado. La longitud de contexto no se especifica en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder Transformer (T5) |
| Parametros totales | 8.296.829.952 (≈8.3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q5_K_M (GGUF) |
| Idiomas soportados | Multilingüe: más de 400 idiomas listados (incluye español, inglés, francés, alemán, ruso, chino, árabe, hindi, etc.) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado Q5_K_M); el modelo original se distribuye en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna, pero el modelo base `google/madlad400-7b-mt` responde a una arquitectura encoder-decoder de la familia T5, como se deduce de la etiqueta `text2text-generation`. El entrenamiento se realizó sobre el dataset `allenai/MADLAD-400`, un corpus paralelo masivo. No se proporcionan datos sobre el número exacto de tokens de entrenamiento, la composición del dataset ni procesos de RLHF o DPO. La innovación técnica de este repositorio es la conversión de los pesos originales a formato GGUF con cuantización Q5_K_M, que reduce el modelo a 6.0 GB y lo hace compatible con el ecosistema llama.cpp.

## Capacidades

- Traducción automática entre más de 400 idiomas mediante prefijos de destino, como `<2en>`, `<2de>` o `<2es>`.
- Generación de texto en modalidad text2text: recibe un texto de entrada y produce la traducción al idioma indicado por el prefijo.
- No incluye soporte de function calling, tool calling, agentes, razonamiento complejo, visión ni audio.
- Compatible con el runtime de llama.cpp (CLI y servidor), lo que permite inferencia local sin conexión en CPU y GPU.

## Casos de uso

- Localización de interfaces de usuario: se puede utilizar para traducir cadenas de texto de una aplicación a decenas de idiomas usando prefijos como `<2es>` o `<2fr>`. Su amplio soporte de idiomas facilita el lanzamiento de productos en múltiples mercados sin contratar servicios de traducción externos.
- Traducción de documentación técnica: los desarrolladores pueden generar versiones localizadas de manuales o README automáticamente, ya que el modelo cubre más de 400 idiomas y puede procesar textos de forma rápida con llama.cpp.
- Atención al cliente multilingüe: en un sistema de tickets, se pueden traducir los mensajes de los clientes al idioma de trabajo del agente mediante una llamada al servidor llama.cpp, reduciendo el tiempo de respuesta en equipos de soporte globales.
- Traducción de subtítulos para contenido audiovisual: el modelo puede procesar frases cortas y generar subtítulos en otro idioma, por ejemplo `<2en>` para inglés, lo que resulta útil en flujos de producción de video donde se necesita una traducción rápida y local.
- Traducción en tiempo real en aplicaciones de chat: gracias a la ejecución local con llama.cpp, se puede integrar en un servicio de mensajería para traducir mensajes al vuelo con baja latencia, sin depender de APIs externas.
- Traducción de contenido legal o financiero en flujos offline: para entornos con requisitos estrictos de privacidad, el modelo puede ejecutarse en una máquina local, ya que el formato GGUF permite la inferencia sin enviar datos a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El archivo GGUF con cuantización Q5_K_M pesa 6.0 GB, por lo que la VRAM mínima para inferencia se estima entre 6 y 8 GB, dependiendo de la longitud de contexto y del tamaño del KV cache.
- GPU recomendadas: RTX 3060 12GB, RTX 4060 Ti 16GB, A10G o Apple Silicon con 16GB de memoria unificada.
- Cabe en GPUs de consumo con 8GB o más, siempre que no se necesite una ventana de contexto muy larga.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server`). También es posible usar el modelo original en safetensors con Transformers, vLLM o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato |
|---|---|---|---|---|
| madlad400-7b-mt-Q5_K_M-GGUF (este repo) | 8.296.829.952 | Más de 400 | Apache 2.0 | GGUF |
| google/madlad400-7b-mt | 8.296.829.952 | Más de 400 | Apache 2.0 | Safetensors |
| facebook/nllb-200-3.3B | ~3.3B | 202 | CC-BY-NC-4.0 | Safetensors |
| facebook/m2m100-1.2B | ~1.2B | 100 | MIT | Safetensors |

Nota: NLLB-200-3.3B tiene licencia CC-BY-NC-4.0, lo que restringe su uso comercial. Los datos de contexto de los modelos comparados no están incluidos en la información disponible.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para traducción; no es adecuado para tareas de razonamiento, generación de código ni diálogo conversacional.
- Puede producir alucinaciones en textos ambiguos, con jerga especializada o acrónimos poco comunes.
- La calidad de traducción puede ser inferior en idiomas con menos representación en el dataset MADLAD-400.
- La longitud de contexto no está especificada en el repositorio; para textos largos es necesario validar el rendimiento con pruebas propias.
- La licencia Apache 2.0 permite el uso comercial, pero deben revisarse los sesgos inherentes al corpus de entrenamiento.
- Al tratarse de una conversión comunitaria, no hay garantía oficial de soporte, mantenimiento ni actualizaciones futuras.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/egekocabas/madlad400-7b-mt-Q5_K_M-GGUF
- Modelo original de Google: https://huggingface.co/google/madlad400-7b-mt
- Dataset MADLAD-400: https://huggingface.co/datasets/allenai/MADLAD-400
- Proyecto llama.cpp: https://github.com/ggerganov/llama.cpp
