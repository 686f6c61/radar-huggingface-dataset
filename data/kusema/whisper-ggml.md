# kusema/whisper-ggml

## Resumen

`kusema/whisper-ggml` es un repositorio espejo (mirror) de pesos de Whisper convertidos al formato GGML que utiliza [whisper.cpp](https://github.com/ggml-org/whisper.cpp). No se trata de un modelo entrenado por el autor: es una copia sin modificar de los ficheros que distribuye la aplicacion de dictado Kusema, publicada para que su tamano y hash SHA-256 coincidan con los que la aplicacion verifica tras cada descarga. El modelo original es Whisper, de OpenAI, descrito en el articulo "Robust Speech Recognition via Large-Scale Weak Supervision" (Radford et al.).

El repositorio contiene cuatro ficheros binarios en formato GGML: una version `small` sin cuantizar, una version `medium` cuantizada a `q4_1`, una version `large-v3-turbo` sin cuantizar y una version `large-v3` cuantizada a `q5_0`. El peso combinado del repositorio es de aproximadamente 3,7 GB. La licencia declarada es MIT, heredada del modelo original de OpenAI y del formato GGML.

Su relevancia es practica: permite ejecutar reconocimiento automatico de voz (ASR) con Whisper en CPU y en hardware modesto mediante whisper.cpp, sin depender de PyTorch ni de CUDA, y sirve como fuente verificable de pesos para la aplicacion Kusema. No aporta ninguna innovacion de modelado respecto al Whisper original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper original de OpenAI), empaquetado en formato GGML para whisper.cpp |
| Parametros totales | no disponible de forma explicita; los ficheros corresponden a las variantes `small`, `medium`, `large-v3-turbo` y `large-v3` de Whisper |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Whisper procesa ventanas de audio de 30 segundos por segmento) |
| Tipos de cuantizacion | `q4_1` (fichero `whisper-medium-q4_1.bin`) y `q5_0` (fichero `ggml-large-v3-q5_0.bin`); los otros dos ficheros estan sin cuantizar |
| Idiomas soportados | no disponible en la informacion proporcionada (Whisper original es multilingue, pero el repositorio no declara la lista) |
| Licencia | MIT |
| Formato de pesos | GGML (`.bin`), consumibles por whisper.cpp |

## Arquitectura y entrenamiento

El modelo subyacente es Whisper, un transformer encoder-decoder entrenado por OpenAI con supervision debil a gran escala sobre pares audio-transcripcion de internet. El encoder procesa espectrogramas Mel de 30 segundos y el decoder genera tokens de texto de forma autorregresiva, con tokens especiales para deteccion de idioma, marcas de tiempo y transcripcion o traduccion.

Este repositorio no incluye entrenamiento ni ajuste adicional: los pesos son una conversion al formato GGML de whisper.cpp, con algunas variantes cuantizadas a `q4_1` y `q5_0`. La model card no documenta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; esa informacion corresponde al articulo original de Whisper y no se reproduce aqui. La innovacion tecnica relevante no esta en el modelo, sino en el formato: GGML permite inferencia eficiente en CPU y en GPU de consumo con whisper.cpp.

## Capacidades

- Reconocimiento automatico de voz (transcripcion de audio a texto) en las variantes incluidas.
- Deteccion automatica de idioma mediante tokens especiales del decoder (heredado de Whisper).
- Generacion de marcas de tiempo a nivel de segmento.
- Traduccion de audio a texto en ingles (capacidad estandar de Whisper; no verificada en esta ficha).
- Ejecucion en CPU sin dependencias de PyTorch, gracias al backend GGML de whisper.cpp.
- Cuantizacion disponible para reducir huella de memoria (`q4_1`, `q5_0`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es exclusivamente un modelo de ASR.
- No soporta vision ni audio mas alla de la transcripcion de voz.

## Casos de uso

- Dictado de escritorio: Kusema, la aplicacion para la que se publica este espejo, usa estos ficheros para transcribir voz a texto en Windows; el modelo `small` o el `medium-q4_1` ofrecen un equilibrio razonable entre calidad y consumo en equipos sin GPU dedicada.
- Transcripcion de reuniones y notas de voz: con `large-v3-turbo` se obtiene mayor calidad en audio limpio, y el formato GGML permite procesarlo en local sin enviar audio a servicios externos.
- Subtitulado automatico: las marcas de tiempo de Whisper permiten generar subtitulos SRT/VTT en pipelines locales con whisper.cpp.
- Procesamiento por lotes en servidores sin GPU: la variante `q5_0` de `large-v3` reduce el peso a unos 1,08 GB, lo que permite ejecutar ASR en CPU en entornos sin acelerador.
- Aplicaciones de accesibilidad: dictado y transcripcion en tiempo real integrados en herramientas de escritorio, con licencia MIT que facilita su redistribucion.
- Verificacion de integridad de descargas: el repositorio sirve como fuente de pesos con SHA-256 conocido para que Kusema valide cada descarga, un caso de uso de cadena de suministro mas que de inferencia.
- Prototipado e investigacion en ASR: permite comparar rapidamente las variantes `small`, `medium`, `large-v3-turbo` y `large-v3` cuantizada con el mismo runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de WER, latencia ni throughput para ninguna de las variantes.

## Requisitos de hardware

- VRAM/RAM estimada segun tamano de fichero: `ggml-small.bin` ~488 MB, `whisper-medium-q4_1.bin` ~492 MB, `ggml-large-v3-q5_0.bin` ~1,08 GB y `ggml-large-v3-turbo.bin` ~1,62 GB. La memoria en ejecucion es superior al tamano del fichero, pero no se dispone de cifras exactas en la informacion proporcionada.
- GPU recomendadas: no disponible. whisper.cpp puede usar backend CUDA, Metal o Vulkan, pero la model card no especifica requisitos.
- Cabe en GPU de consumo: si, en principio las variantes `small` y `medium-q4_1` caben en GPUs con 4-8 GB de VRAM; `large-v3-q5_0` y `large-v3-turbo` requieren mas margen. No hay cifras oficiales en la informacion disponible.
- Opciones de despliegue: whisper.cpp (runtime nativo del formato), y cualquier herramienta que consuma ficheros GGML de whisper.cpp. No se indica compatibilidad con vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `kusema/whisper-ggml` (este repo) | variantes `small`, `medium`, `large-v3-turbo`, `large-v3` | no disponible | GGML | MIT | Hugging Face (espejo) |
| Whisper original (OpenAI) | mismas variantes | no disponible | PyTorch (`.pt`) | MIT | GitHub de OpenAI |
| whisper.cpp (pesos oficiales) | mismas variantes | no disponible | GGML | MIT | Hugging Face de ggml-org |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada. La diferencia practica frente al Whisper original es el formato (GGML frente a PyTorch) y el runtime (whisper.cpp frente a PyTorch), no el modelo.

## Limitaciones y advertencias

- Este repositorio es un espejo, no un modelo original: el autor no entrena ni mantiene los pesos y no esta afiliado a OpenAI ni a los autores de whisper.cpp.
- La model card no declara lista de idiomas, contexto, parametros exactos ni benchmarks; cualquier dato de ese tipo debe consultarse en las fuentes originales.
- Whisper, como todo modelo ASR, puede alucinar texto en silencios o audio ruidoso; no se documenta ningun mecanismo de mitigacion en este repositorio.
- Sesgos conocidos: no documentados en la informacion proporcionada; los sesgos de Whisper dependen del dataset de entrenamiento original de OpenAI.
- Licencia MIT permite uso comercial y redistribucion, pero deben conservarse los avisos de copyright de OpenAI y de los autores de GGML incluidos en `LICENSE`.
- Al ser un espejo de una aplicacion concreta (Kusema), la actualizacion y el mantenimiento no estan garantizados; conviene verificar los SHA-256 antes de usar los ficheros en produccion.
- No apto para tareas de razonamiento, codigo, tool calling ni agentes: es exclusivamente un modelo de reconocimiento de voz.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kusema/whisper-ggml
- Proyecto Kusema: https://github.com/neulinc/kusema
- Whisper original (OpenAI): https://github.com/openai/whisper
- whisper.cpp: https://github.com/ggml-org/whisper.cpp
