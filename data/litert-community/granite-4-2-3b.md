# litert-community/granite-4.2-3b

## Resumen

Granite 4.2-3B es un modelo de lenguaje compacto de IBM publicado en agosto de 2026, orientado a razonamiento explícito mediante bloques `<think>…</think>` antes de emitir la respuesta final. La ficha que nos ocupa no es el modelo original, sino su conversión al formato **LiteRT-LM** (`.litertlm`) realizada por la comunidad `litert-community`, pensada para inferencia en dispositivo (*on-device*) con el runtime de Google LiteRT-LM. Se distribuye en dos variantes cuantizadas: int4 (2,19 GB) e int8 (3,76 GB).

El modelo base es denso, con 3.660 millones de parámetros, 40 capas, dimensión oculta de 2560, atención GQA con ratio 40:8, embeddings no atados (*untied*) y un vocabulario de 100.000 tokens. Su rasgo diferencial es el modo de razonamiento: el prompt de generación prellena el apertura del bloque de pensamiento siguiendo la plantilla de chat de IBM, y el bundle declara un canal `thought` para que el runtime separe el razonamiento de la respuesta y pueda aplicar un presupuesto de pensamiento.

La relevancia de esta conversión es práctica: permite ejecutar un modelo de razonamiento de 3B en teléfonos de gama alta y en equipos Apple Silicon con aceleración GPU (WebGPU, Metal, OpenCL), con cifras medidas de *decode* de 15,6 tok/s en un Galaxy S26 con GPU y 85,5 tok/s en un Mac Studio M4 Max. La licencia Apache 2.0 facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Granite 4.2-3B); bundle LiteRT-LM con canal `thought` |
| Parametros totales | 3,66 B (3.660 millones) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | presupuesto KV de 4096 tokens en el bundle; longitud de contexto nativa del modelo base no disponible |
| Tipos de cuantizacion | int4 blockwise-32 + OCTAV en lineales con embedding int8; int8 dinámico en lineales y embedding; referencia bf16 en PyTorch |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); requiere litert-lm ≥ 0.16 |
| Capas / dimension oculta | 40 capas / 2560 |
| Atencion | GQA 40:8 |
| Embeddings | no atados (*untied*) |
| Vocabulario | 100.000 tokens |
| Plantilla de chat | ChatML (`<|im_start|>` … `<|im_end|>`) |
| Firmas de prefill | 6 (1024, 256, 64, 16, 4, 1) |
| Tamano de los ficheros | int4: 2,19 GB; int8: 3,76 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 40 capas con dimensión oculta 2560, atención con cabeceras agrupadas (40 cabeceras de consulta frente a 8 de clave/valor), embeddings no compartidos entre entrada y salida, y un vocabulario de 100.000 tokens. La innovación funcional es el razonamiento en cadena dentro de un canal dedicado: el modelo genera su cadena de pensamiento entre `<think>` y `</think>` y después emite la respuesta final, que es lo único que se expone en el flujo de salida cuando el runtime soporta `ThinkingConfig`.

La conversión a LiteRT-LM añade decisiones de ingeniería propias del despliegue en dispositivo. El bundle usa marcadores de rol ChatML, reserva un presupuesto KV de 4096 tokens y exporta seis firmas de prefill (1024, 256, 64, 16, 4 y 1) en lugar de once, porque cada firma exportada consume memoria del motor aunque no se invoque; los autores citan que una build con once firmas de la familia 4.1 fue terminada por iOS durante la inicialización del motor Metal. La cuantización int4 emplea bloques de 32 con OCTAV en las capas lineales, mientras que int8 usa cuantización dinámica. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto con razonamiento explícito previo a la respuesta (modo *thinking*).
- Razonamiento matemático de varios pasos, evaluado en GSM8K con cadena de pensamiento 0-shot.
- Separación de razonamiento y respuesta mediante el canal `thought` declarado en el bundle.
- Presupuesto de pensamiento configurable en runtimes que exponen `ThinkingConfig`.
- Inferencia en CPU y GPU en dispositivos móviles y de escritorio (OpenCL, Metal, WebGPU).
- Ejecución en navegador mediante el demo web de LiteRT-LM con WebGPU.
- Soporte de tool calling, function calling y agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Visión y audio: no disponibles (modelo de texto).

## Casos de uso

- Asistente de razonamiento en el teléfono sin conexión: el fichero int4 de 2,19 GB cabe en un dispositivo de gama alta y se ejecuta con delegación completa de operaciones en GPU (1783/1783 nodos en un Galaxy S26), lo que permite responder consultas con cadena de pensamiento sin enviar datos a la nube.
- Tutor de matemáticas paso a paso: el modelo resuelve problemas de aritmética y álgebra de varios pasos dentro del bloque de pensamiento y entrega la respuesta limpia por separado, adecuado para aplicaciones educativas que quieran mostrar u ocultar el razonamiento según el nivel del alumno.
- Chat web en el navegador: el demo de LiteRT-LM carga `granite-4.2-3b_int4.litertlm` con WebGPU, lo que habilita prototipos de asistentes que funcionan íntegramente en el cliente sin backend.
- Procesamiento de documentos sensibles en local: al ejecutarse en dispositivo con licencia Apache 2.0, encaja en flujos de cumplimiento donde el texto no puede salir del equipo (sanidad, legal, administración).
- Aplicaciones de escritorio en Apple Silicon: con 85,5 tok/s de decode y 237 ms de TTFT en un M4 Max vía Metal, es viable para asistentes integrados en el sistema operativo o en editores.
- Evaluación de calidad frente a latencia: desplegar int8 (3,76 GB) cuando el dispositivo lo soporte y int4 cuando el objetivo sea móvil, usando la tabla GSM8K como criterio de compromiso entre precisión y huella de memoria.
- Generación de código o agentes multi-paso: no disponible en la información proporcionada; el modelo card no documenta tool calling ni resultados de HumanEval.

## Benchmarks y rendimiento

Precisión en GSM8K (greedy, 0-shot chain-of-thought, max_tokens 2048, n=100, mismo prompt y extracción de respuesta; filas LiteRT ejecutadas en el motor litert-lm 0.16.1, backend CPU):

| Configuracion | GSM8K |
|---|---|
| PyTorch bf16 (referencia, MPS) | 91,0 % |
| LiteRT int8 | 90,0 % (−1) |
| LiteRT int4 (block-32) | 80,0 % (−11) |
| LiteRT int4 (block-128, medición adicional) | 81,0 % |

Rendimiento medido en dispositivo (LiteRT-LM 0.16.0, 31-08-2026):

| Dispositivo / backend | Precision | Decode (tok/s) | Prefill (tok/s) | TTFT |
|---|---|---|---|---|
| Galaxy S26, GPU | int4 | 15,6 | 235 | 940 ms |
| Galaxy S26, CPU | int4 | 9,8 | 22 | 9,28 s |
| Mac Studio M4 Max, GPU | int4 | 85,5 | 1240 | 237 ms |
| Galaxy S26, GPU | int8 | 9,2 | 241 | 960 ms |
| Galaxy S26, CPU | int8 | 7,0 | 51 | 4,20 s |
| Mac Studio M4 Max, GPU | int8 | 70,7 | 1208 | 244 ms |

Corrección: ambos ficheros obtienen 8/8 en una comprobación de sanidad de 8 preguntas en CPU y GPU (M4 Max). En un Galaxy S26 la delegación OpenCL es completa (1783/1783 nodos en cada firma de prefill y decode, cero operaciones rechazadas). En un iPhone 17 Pro, int4 obtiene 7/8 en GPU Metal (inicialización de 13,0 s) y 8/8 en CPU (inicialización de 5,5 s); el único fallo es una línea de rima al final del prompt compuesto, que el modelo responde correctamente por separado. La memoria de proceso disponible no bajó de ~4,2 GB en ninguna de las ejecuciones.

## Requisitos de hardware

- VRAM / almacenamiento: 2,19 GB para int4 y 3,76 GB para int8 en disco; en el iPhone 17 Pro la memoria de proceso disponible se mantuvo por encima de ~4,2 GB durante la ejecución.
- Móvil de gama alta: Galaxy S26 (Snapdragon SM8850, Adreno) e iPhone 17 Pro validados; int4 es la variante que "cabe en un teléfono" y además resulta más rápida en todas las GPU medidas.
- Escritorio Apple Silicon: Mac Studio M4 Max validado con Metal; 85,5 tok/s (int4) y 70,7 tok/s (int8).
- GPU de servidor (A100, H100, RTX 4090): no disponible; el bundle está orientado a LiteRT-LM y no se documentan despliegues en esas plataformas.
- Despliegue: runtime LiteRT-LM ≥ 0.16 (CLI `litert-lm run`, backend `--backend gpu`); demo web con WebGPU. vLLM, llama.cpp, Ollama y TGI no están soportados por el formato `.litertlm`.
- Latencia: TTFT de 237 ms (M4 Max, int4) y 940 ms (Galaxy S26 GPU, int4); en CPU móvil el TTFT sube a 9,28 s con int4.
- Presupuesto de salida: se recomienda ≥ 2048 tokens, ya que truncar el razonamiento impide que el modelo emita respuesta final.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| granite-4.2-3b (LiteRT int8) | 3,66 B denso | 4096 (KV del bundle) | 90,0 % | Apache 2.0 | `.litertlm`, LiteRT-LM |
| granite-4.2-3b (LiteRT int4) | 3,66 B denso | 4096 (KV del bundle) | 80,0 % | Apache 2.0 | `.litertlm`, LiteRT-LM |
| granite-4.1-3b (int4, misma receta) | 3 B clase | no disponible | −4 puntos frente a su referencia bf16 | Apache 2.0 | LiteRT-LM |
| granite-4.2-3b (PyTorch bf16) | 3,66 B denso | no disponible | 91,0 % | Apache 2.0 | safetensors / PyTorch |

No se dispone de datos de benchmarks de otros modelos de 3B comparables en la información proporcionada.

## Limitaciones y advertencias

- La cuantización int4 cuesta 11 puntos de GSM8K frente a bf16 (80,0 % frente a 91,0 %), más del doble que los 4 puntos que la misma receta costó a granite-4.1-3b; un bloque de 128 no corrige la pérdida (81,0 %). Para máxima calidad debe usarse int8.
- El modelo razona antes de responder: con presupuestos de salida cortos se trunca a mitad del pensamiento y no produce respuesta final. Es imprescindible configurar al menos 2048 tokens de salida.
- El bundle limita el presupuesto KV a 4096 tokens; conversaciones o documentos más largos requieren gestión externa de contexto.
- La delegación completa en GPU está verificada en Galaxy S26 y M4 Max, pero en iPhone 17 Pro con Metal se observó 1 fallo de 8 en el prompt compuesto; conviene validar en el hardware objetivo.
- El motor Metal puede consumir memoria significativa durante la inicialización (13,0 s en iPhone 17 Pro con int4); los autores documentan que builds con más firmas de prefill fueron terminadas por iOS.
- Idiomas soportados no disponibles: no se puede asumir calidad multilingüe sin evaluación propia.
- No hay información sobre sesgos, tasa de alucinación, tool calling ni rendimiento en código; no debe asumirse que estas capacidades estén cubiertas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y la conversión son artefactos distintos: conviene verificar los términos del modelo original de IBM antes de producción.
- El formato `.litertlm` limita el despliegue al ecosistema LiteRT-LM; no es compatible con los runners habituales de servidor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/granite-4.2-3b
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-3b
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Demo web de chat (WebGPU): https://google-ai-edge.github.io/LiteRT-LM/web_demos/chat/index.html?model=litert-community/granite-4.2-3b
- Registro de rendimiento int4: https://github.com/john-rocky/edge-compat/blob/main/cards/granite-4.2-3b-int4/CARD.md
- Registro de rendimiento int8: https://github.com/john-rocky/edge-compat/blob/main/cards/granite-4.2-3b-int8/CARD.md
