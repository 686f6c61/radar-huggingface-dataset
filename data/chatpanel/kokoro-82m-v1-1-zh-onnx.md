# ChatPanel/Kokoro-82M-v1.1-zh-ONNX

## Resumen

Kokoro-82M-v1.1-zh-ONNX es una copia byte a byte del repositorio `onnx-community/Kokoro-82M-v1.1-zh-ONNX`, publicada por ChatPanel para centralizar las descargas que realiza su pasarela (gateway). No se ha entrenado, convertido ni editado ningún fichero: los pesos, el tokenizador, la configuración y las voces son idénticos al commit `6cc0f0d2ebe369a68b0df87c2b65c1af8c0ac3e3` del repositorio upstream. El mérito del modelo corresponde a los autores originales de `hexgrad/Kokoro-82M-v1.1-zh`.

El modelo subyacente es Kokoro, un sistema de síntesis de voz (text-to-speech) de tan solo 82 millones de parámetros, exportado a formato ONNX para inferencia ligera y portable. La variante `zh` está orientada al idioma chino. Su reducido tamaño lo convierte en una opción atractiva para despliegues en CPU, entornos edge y servicios de TTS de baja latencia.

Esta ficha describe el artefacto ONNX tal como está publicado en este repositorio; los detalles de entrenamiento y arquitectura interna del modelo original no se detallan en la model card disponible, por lo que se indican como no disponibles cuando corresponde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS subyacente Kokoro; exportado a ONNX) |
| Parametros totales | 82 millones (según el nombre del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX float (model.onnx) y ONNX quantized (model_quantized.onnx) |
| Idiomas soportados | chino (variante `zh` del modelo base); resto no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (model.onnx y model_quantized.onnx), voces en binarios .bin, tokenizador JSON |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo original Kokoro-82M-v1.1-zh en la documentación proporcionada. Lo único verificable es que este repositorio contiene una exportación ONNX del modelo, con dos variantes del grafo: `onnx/model.onnx` (precisión completa) y `onnx/model_quantized.onnx` (cuantizada). El repositorio incluye además `config.json`, `tokenizer.json`, `tokenizer_config.json` y un conjunto de ficheros de voz en formato binario.

En cuanto al entrenamiento, esta publicación no aporta datos: no se indica número de tokens, composición del dataset ni si hubo RLHF o ajuste fino. Tampoco se documenta ninguna innovación técnica específica más allá de la propia exportación a ONNX, que facilita la ejecución con runtimes como ONNX Runtime. Para detalles de arquitectura y entrenamiento del modelo base, remitirse al repositorio `hexgrad/Kokoro-82M-v1.1-zh`.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto, en la variante lingüística china (`zh`).
- Selección de voz mediante ficheros de locutor predefinidos: el repositorio incluye voces `af_maple`, `af_sol`, `bf_vale` y una amplia colección de voces `zf_*` (numeradas), lo que permite elegir entre múltiples timbres.
- Ejecución portable mediante ONNX Runtime, en CPU o GPU, sin dependencia de frameworks de deep learning pesados.
- Variante cuantizada (`model_quantized.onnx`) para reducir requisitos de memoria y acelerar la inferencia.
- Generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes o modo thinking: no aplicable (es un modelo TTS, no un LLM).
- Capacidades multilingües: no disponibles más allá de la variante china indicada.

## Casos de uso

- Síntesis de voz para asistentes conversacionales en chino: el modelo genera audio a partir de texto con voces predefinidas, adecuado para integrarse en backends de chat que necesiten respuestas habladas.
- Lectura automática de contenido (noticias, artículos, documentación) en chino: por su tamaño de 82M y exportación ONNX, puede ejecutarse en servidores modestos para convertir texto en audio de forma masiva.
- Accesibilidad: convertir texto de interfaces o documentos a voz para usuarios con discapacidad visual, desplegando el modelo en local sin depender de servicios en la nube.
- Sistemas embebidos y edge computing: la variante cuantizada y el formato ONNX permiten ejecución en dispositivos con recursos limitados, como routers, mini-PC o dispositivos IoT con capacidad de cómputo moderada.
- Generación de audiolibros o podcasts automatizados: la variedad de voces `zf_*` permite alternar timbres y dar variedad a narraciones largas.
- Pruebas de integración y CI: al ser una copia estable con hashes SHA-256 publicados, resulta útil como artefacto reproducible en pipelines que validen la pasarela de ChatPanel o flujos de TTS.
- Localización de productos: convertir cadenas de texto de aplicaciones al audio en chino para demos y prototipos multilingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 82M parámetros, el modelo es muy ligero y la variante cuantizada reduce aún más el consumo de memoria.
- GPU recomendadas: no disponibles en la documentación; por tamaño, cualquier GPU moderna con soporte ONNX Runtime sería suficiente, pero no se confirma.
- ¿Cabe en consumer GPU? Por el número de parámetros (82M), previsiblemente sí en prácticamente cualquier GPU de consumo, aunque no se aportan cifras oficiales.
- Opciones de despliegue: ONNX Runtime (principal, dado el formato), potencialmente otras herramientas compatibles con ONNX; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Kokoro-82M-v1.1-zh-ONNX (este repo) | 82M | no disponible | apache-2.0 | ONNX | Hugging Face (ChatPanel) |
| onnx-community/Kokoro-82M-v1.1-zh-ONNX | 82M | no disponible | apache-2.0 | ONNX | Hugging Face (upstream) |
| hexgrad/Kokoro-82M-v1.1-zh | 82M | no disponible | no disponible | no disponible | Hugging Face (modelo base) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada; las tres comparten el mismo modelo subyacente, diferenciándose únicamente en el empaquetado y la ubicación de alojamiento.

## Limitaciones y advertencias

- Este repositorio no aporta ninguna mejora técnica: es una réplica exacta del upstream, por lo que cualquier limitación del modelo original se mantiene.
- No se documentan sesgos conocidos del modelo base en la información disponible.
- Riesgo de alucinación: no aplicable en el sentido de LLM, pero un modelo TTS puede producir prosodia incorrecta o pronunciaciones erróneas en textos complejos; no se aportan datos específicos.
- Limitaciones de idioma: la variante está orientada al chino; no se confirma soporte de otros idiomas.
- Licencia apache-2.0, que permite uso comercial con las condiciones de dicha licencia; conviene conservar los avisos de copyright y atribución.
- Al ser una copia de terceros, la responsabilidad de mantenimiento y actualizaciones recae en el upstream; este repositorio puede quedar desactualizado respecto al original.
- Los hashes SHA-256 publicados permiten verificar la integridad de los ficheros, pero no se ofrece garantía adicional sobre el contenido.

## Enlaces

- Repositorio de este modelo: https://huggingface.co/ChatPanel/Kokoro-82M-v1.1-zh-ONNX
- Upstream ONNX: https://huggingface.co/onnx-community/Kokoro-82M-v1.1-zh-ONNX
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M-v1.1-zh
- Commit upstream referenciado: `6cc0f0d2ebe369a68b0df87c2b65c1af8c0ac3e3`
