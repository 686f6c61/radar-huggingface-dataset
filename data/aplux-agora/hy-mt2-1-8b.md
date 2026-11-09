# APLUX-Agora/Hy-MT2-1.8B

## Resumen

Hy-MT2-1.8B es un modelo de traduccion automatica chino-ingles de 1.800 millones de parametros, publicado por APLUX-Agora como recurso empaquetado para despliegue en placas con SoC Qualcomm. El modelo original se ha convertido a formatos ejecutables sobre el runtime QNN de Qualcomm y se distribuye organizado por SoC objetivo (`targets/<SoC>/`), con variantes de precision y binarios de contexto listos para su uso en dispositivos AIoT. Por defecto traduce la entrada al chino, con la opcion de fijar el ingles como idioma destino.

Su interes practico no reside en el modelo en si, sino en el formato de distribucion: APLUX-Agora (a traves de la plataforma Agora, en mega.aidlux.com) publica builds ya medidas en hardware real, con metricas de rendimiento por placa. En concreto, sobre el SoC QCS8550 montado en la placa Rhino Pi X1 (犀牛派 X1) y con cuantizacion W4A16, se reportan 38,8 tokens/s. Esto lo convierte en una pieza relevante para quien necesite traduccion local en dispositivos de borde sin depender de la nube.

El repositorio ocupa 1,6 GB e incluye los recursos convertidos, un `model.json` por SoC con la precision por defecto y las rutas de variantes, y ficheros de integridad (`NOTICE.md`, `SHA256SUMS`). La licencia de los recursos convertidos es la APLUX Model Farm License, distinta de la licencia del modelo fuente original, cuyos terminos remite el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de lenguaje para traduccion, convertido a QNN) |
| Parametros totales | 1.800 millones (1.8B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (precision por defecto en QCS8550); otras variantes por precision en `targets/<SoC>/` no detalladas |
| Idiomas soportados | chino e ingles (traduccion chino-ingles; salida por defecto en chino, ingles opcional) |
| Licencia | APLUX Model Farm License (recursos convertidos); modelo fuente sujeto a sus propios terminos |
| Formato de pesos | binarios QNN (`model.bin`) y paquetes multi-fichero; `model.json` como manifiesto por SoC |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo fuente (tipo de transformer, atencion, capas, dimension oculta) ni sobre el proceso de entrenamiento (numero de tokens, composicion del corpus, uso de RLHF o DPO). La model card solo describe la tarea (traduccion chino-ingles con salida por defecto en chino) y el empaquetado para despliegue.

La innovacion destacable es el pipeline de conversion y despliegue: los pesos se compilan para el runtime QNN de Qualcomm y se organizan por SoC objetivo, con un `model.json` que declara la precision por defecto y las rutas de cada variante, y binarios de contexto en formato `model.bin`. El autor indica que el preprocesado, el postprocesado y el runner estan disponibles a traves de la plataforma Agora (guia de despliegue o exportacion de un flujo de trabajo que use el modelo).

## Capacidades

- Traduccion de texto chino-ingles, con salida en chino por defecto y opcion de fijar el ingles como destino.
- Generacion de texto condicionada a la tarea de traduccion (`pipeline_tag: text-generation`).
- Ejecucion local en dispositivos con SoC Qualcomm mediante el runtime QNN.
- Entrada y salida exclusivamente de texto (sin vision ni audio).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documenta modo de razonamiento explicito (thinking mode).
- Cobertura multilingue limitada a chino e ingles segun la model card.

## Casos de uso

- Traduccion local en dispositivos de borde: el modelo se ejecuta sobre QNN en placas con QCS8550 a 38,8 tokens/s en W4A16, lo que permite traducir texto en tiempo real sin conexion a la nube y sin enviar datos a terceros.
- Traduccion de interfaces y contenido de producto en dispositivos AIoT: menus, avisos y cadenas de UI en chino e ingles pueden traducirse en el propio dispositivo, evitando dependencias de red en entornos industriales o domesticos.
- Asistentes de voz o texto para mercados chino-ingles: integrado en un pipeline de ASR y TTS, el modelo actua como etapa de traduccion con latencia baja gracias a la ejecucion nativa en el SoC.
- Procesamiento por lotes de documentos en equipos empotrados: con 1,8B parametros y pesos W4A16, el modelo cabe en memoria de dispositivos con recursos limitados y puede traducir lotes de texto de forma desatendida.
- Traduccion en entornos sin conectividad: escenarios de campo, transporte o industria donde no hay cobertura pero se requiere traduccion bidireccional chino-ingles.
- Prototipado y evaluacion de despliegue en Qualcomm: el paquete por SoC y el manifiesto `model.json` permiten medir y comparar precisiones y rendimiento en placas reales antes de fijar una configuracion de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (BLEU, COMET, MMLU u otros) en la informacion disponible. El unico dato de rendimiento publicado es de inferencia en hardware:

| SoC / placa | Precision | Rendimiento medido (Agora) |
|---|---|---|
| QCS8550 · Rhino Pi X1 (犀牛派 X1) | W4A16 | 38,8 tokens/s |

## Requisitos de hardware

- VRAM o memoria: no disponible de forma explicita; el repo ocupa 1,6 GB y el modelo tiene 1,8B parametros, por lo que en W4A16 los pesos ocupan del orden de 1 GB, mas overhead de runtime y buffers de contexto (estimacion, no dato publicado).
- GPU recomendadas: no aplica en el sentido habitual; el objetivo es el acelerador NPU/DSP de SoC Qualcomm, con QCS8550 como plataforma medida.
- Cabe en hardware de consumo: si, en placas y dispositivos con SoC Qualcomm compatibles con QNN; no se documenta soporte para GPU de consumo (RTX 4090, etc.).
- Opciones de despliegue: runtime QNN de Qualcomm mediante los recursos de Agora; descarga con `hf download` filtrando por `targets/<SoC>/*`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 38,8 tokens/s en QCS8550 con W4A16; no se publican latencias de primer token ni datos para otras placas.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de traduccion chino-ingles del mismo tamano ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Cobertura linguistica limitada a chino e ingles; no se documentan otros idiomas.
- No se dispone de informacion sobre sesgos, calidad de traduccion ni tasas de alucinacion del modelo fuente.
- Longitud de contexto no documentada; no se debe asumir una ventana amplia en produccion.
- La licencia de los recursos convertidos es la APLUX Model Farm License, con terminos propios recogidos en `LICENSE_MODEL_FARM.pdf`; el uso comercial requiere revisar dicho documento y, ademas, los terminos del modelo fuente original.
- El despliegue esta atado al runtime QNN y a SoC Qualcomm concretos; no hay garantia de portabilidad a otras plataformas.
- El repositorio no registra descargas ni likes y fue creado y actualizado el mismo dia (2026-11-09), por lo que no hay evidencia de uso en produccion ni validacion independiente.
- El rendimiento de 38,8 tokens/s corresponde a una unica placa y precision; no debe extrapolarse a otros SoC sin medicion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/APLUX-Agora/Hy-MT2-1.8B
- Licencia APLUX Model Farm: https://huggingface.co/APLUX-Agora/Hy-MT2-1.8B/blob/main/LICENSE_MODEL_FARM.pdf
- Demo y ficha en Agora: https://mega.aidlux.com/models/hy-mt2-1.8b
- Plataforma Agora: https://mega.aidlux.com
