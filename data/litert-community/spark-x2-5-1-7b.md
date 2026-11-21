# litert-community/Spark-X2.5-1.7B

## Resumen

Spark-X2.5-1.7B es un modelo de lenguaje denso de 1,71 mil millones de parámetros desarrollado por el SparkLLM Team de iFLYTEK, publicado en agosto de 2026. Se trata de un modelo orientado a razonamiento que genera cadenas de pensamiento dentro de etiquetas `<think>…</think>` antes de emitir la respuesta final. La versión aquí descrita es la conversión realizada por la comunidad litert-community al formato LiteRT-LM (`.litertlm`), pensada para inferencia en dispositivo (on-device) con el runtime LiteRT-LM de Google.

La relevancia de esta ficha radica en su enfoque: no es un modelo pensado para servidores con GPU de datacenter, sino para ejecución local en teléfonos móviles, portátiles y equipos de sobremesa con aceleración por GPU o CPU. El modelo original declara un contexto nativo de 1.024.000 tokens, aunque las mediciones publicadas en la model card se realizan con presupuestos de razonamiento de 3.584 tokens y ventanas de prefill de 1.024 tokens.

La arquitectura combina atención deslizante (sliding-window de 512 tokens) en tres de cada cuatro capas con atención completa en la cuarta, puertas sigmoideas por cabeza en la salida de atención y MLPs con activación GELU exacta. Se distribuye bajo licencia Apache 2.0 en dos recetas de cuantización: int8 (1.836 MB) e int4 blockwise-32 (1.264 MB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso con atención híbrida (3 capas sliding-window de 512 + 1 capa full attention), puertas sigmoideas por cabeza y MLP GELU exacta |
| Parametros totales | 1,71 B (1.710 millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.024.000 tokens en el modelo original; presupuesto de razonamiento medido de 3.584 tokens en los bundles |
| Tipos de cuantizacion | int8 dinámica en lineales + embedding; int4 blockwise-32 con OCTAV en lineales e int8 en embedding (externalizado) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base en safetensors en XHToken/Spark-X2.5-1.7B |

Detalles adicionales de arquitectura: 28 capas, dimensión oculta 2.048, 8 cabezas de consulta y 2 cabezas KV de 256 dimensiones, vocabulario de 131.072 entradas con embedding atado (tied).

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso con un patrón de atención híbrido: tres capas consecutivas usan atención de ventana deslizante de 512 tokens y la cuarta usa atención completa. Esta disposición reduce el coste computacional y de memoria del KV cache en contextos largos, manteniendo capacidad de atención global cada cuatro capas. Incorpora además puertas sigmoideas por cabeza sobre la salida de atención y MLPs con activación GELU exacta en lugar de aproximaciones.

El modelo está entrenado como modelo de razonamiento: la plantilla de chat del proveedor prellena la etiqueta de apertura `<think>` y el bundle declara un canal `thought` en sus metadatos, de modo que el runtime separa el razonamiento de la respuesta final y respeta un presupuesto de pensamiento. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

La conversión a LiteRT-LM reescribe los grafos de prefill y decode para GPU sin modificar ningún peso (entrada del 15 de noviembre de 2026). El tokenizer del bundle es byte-idéntico al `tokenizer.json` upstream.

## Capacidades

- Generación de texto y razonamiento multi-paso con cadena de pensamiento explícita en `<think>…</think>`.
- Separación de razonamiento y respuesta mediante el canal `thought` del runtime, con soporte de presupuesto de pensamiento.
- Razonamiento matemático y resolución de problemas (evaluado en GSM8K).
- Ejecución en dispositivo con aceleración GPU (WebGPU en navegador, GPU móvil, GPU Apple) y CPU.
- Soporte de plantilla de chat con formato de content-parts (actualización del 21 de septiembre de 2026).
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Visión, audio: no disponible.

## Casos de uso

- Asistente de razonamiento en el móvil sin conexión: el modelo puede ejecutarse íntegramente en un Galaxy S26 o Pixel 11 Pro con el runtime LiteRT-LM, resolviendo problemas paso a paso con latencias de TTFT de 400-520 ms en GPU y sin enviar datos a la nube.
- Demo web interactiva con WebGPU: el archivo int4 (1,26 GB) se carga desde la rama `web` del repositorio y se ejecuta en el navegador mediante WebGPU, lo que permite ofrecer una demo pública de razonamiento sin infraestructura de servidor.
- Tutor educativo offline: con 1.024.000 tokens de contexto nativo en el modelo original, puede mantener conversaciones largas con material de estudio extenso, aunque el presupuesto práctico medido en los bundles es de 3.584 tokens de razonamiento.
- Prototipado rápido de aplicaciones de razonamiento en portátiles Apple Silicon: en un Mac Studio M4 Max alcanza 103,6 tok/s de decode y 2.492 tok/s de prefill con el archivo int4, suficiente para iterar sobre prompts y plantillas de forma interactiva.
- Evaluación de pipelines de cuantización: la comparativa int8 frente a int4 (paridad en GSM8K para int8, pérdida de 10 puntos para int4) sirve como caso de estudio para decidir recetas de cuantización en despliegues edge.
- Integración en aplicaciones Android mediante LiteRT-LM: el runtime permite delegar todas las operaciones a la GPU (1.733 operaciones delegadas en el archivo int4), habilitando asistentes locales dentro de apps móviles con consumo de memoria medido de 1,07-1,12 GB en GPU.

## Benchmarks y rendimiento

Rendimiento en dispositivo (medido por el autor de la conversión):

| Plataforma | Runtime | Backend | Archivo | Decode (tok/s) | Prefill (tok/s) | TTFT |
|---|---|---|---|---|---|---|
| Galaxy S26 | LiteRT-LM 0.16.0 | GPU | int4 (ficheros anteriores) | 17,8 | 459 | 520 ms |
| Galaxy S26 | LiteRT-LM 0.16.0 | CPU | int4 (ficheros anteriores) | 13,6 | 83 | 2,65 s |
| Galaxy S26 | LiteRT-LM 0.16.0 | GPU | int8 (ficheros anteriores) | 15,8 | 637 | 400 ms |
| Galaxy S26 | LiteRT-LM 0.16.0 | CPU | int8 (ficheros anteriores) | 12,3 | 165 | 1,37 s |
| Galaxy S26 | LiteRT-LM 0.19.0 | GPU | int8 (ficheros nuevos) | 27,7 | 537 (1.024 tok) | no disponible |
| Galaxy S26 | LiteRT-LM 0.19.0 | GPU | int4 (ficheros nuevos) | 38,2 | 546 (1.024 tok) | no disponible |
| Mac Studio M4 Max | LiteRT-LM 0.17.0 | GPU | int4 (ficheros anteriores) | 103,6 | 2.492 | 112 ms |
| Mac Studio M4 Max | LiteRT-LM 0.17.0 | GPU | int8 (ficheros anteriores) | 95,8 | 2.308 | 121 ms |
| Pixel 11 Pro | no disponible | GPU | int4 (ficheros nuevos) | 7,50-8,44 | no disponible | no disponible |
| Pixel 11 Pro | no disponible | GPU | int8 (ficheros nuevos) | 12,6-12,7 | no disponible | no disponible |

Calidad:

| Benchmark | int8 | int4 | bf16 (referencia) |
|---|---|---|---|
| GSM8K | 76 | 66 | 76 |
| 8 preguntas cortas (M4 Max, greedy) | 8/8 CPU y GPU | 8/8 CPU y GPU | 8/8 |
| iPhone 17 Pro (8 preguntas) | no disponible | 8/8 en ambos backends | no disponible |

La pérdida de 10 puntos en GSM8K con int4 se atribuye aproximadamente a la mitad a cadenas de razonamiento más largas que agotan el presupuesto de 3.584 tokens, no a razonamiento incorrecto.

## Requisitos de hardware

- VRAM/memoria: 1.836 MB para el archivo int8 y 1.264 MB para el int4 en disco. En ejecución GPU en Galaxy S26, el pico de memoria del proceso (`VmHWM`) fue de 1,07 GB (int8) y 1,12 GB (int4), con un incremento del contador de asignación GPU de 2,67 GB (int8) y 1,89-1,95 GB (int4). En CPU, `VmHWM` fue de 3,31 GB (int8) y 2,42 GB (int4).
- GPU recomendadas: GPU integrada de Galaxy S26 y Pixel 11 Pro, GPU de Mac Studio M4 Max, iPhone 17 Pro. Cualquier GPU compatible con WebGPU para la demo de navegador.
- Cabe en GPU de consumo: sí, en móviles de gama alta y en Apple Silicon; el archivo int4 de 1,26 GB es apto para dispositivos con 2 GB o más de memoria disponible para la app.
- Opciones de despliegue: LiteRT-LM (CLI, runtime móvil y WebGPU en navegador). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: ver tabla de benchmarks. En Galaxy S26 la GPU decodifica 1,7-2,0× (int8) y 2,1-2,4× (int4) más rápido que la CPU, y prellena 1,3-2,3× y 2,9-5,3× más rápido. En Pixel 11 Pro el int4 resultó más lento que el int8 en GPU (7,50-8,44 frente a 12,6-12,7 tok/s).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato edge | Notas |
|---|---|---|---|---|---|
| Spark-X2.5-1.7B (esta ficha) | 1,71 B denso | 1.024.000 (original) | Apache 2.0 | LiteRT-LM int8/int4 | Razonamiento con canal `thought`; GSM8K 76 (int8) |
| XHToken/Spark-X2.5-1.7B | 1,71 B denso | 1.024.000 | Apache 2.0 | safetensors (bf16) | Modelo base del que deriva esta conversión |
| Alternativas de 1-2 B para edge | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

No se dispone de información sobre otros modelos comparables en la documentación consultada; los datos de la fila de alternativas quedan como no disponibles para no inventar cifras.

## Limitaciones y advertencias

- El repositorio no incluye archivo para NPU; solo se distribuyen ejecuciones CPU y GPU.
- El archivo int4 pierde 10 puntos en GSM8K respecto a bf16 (66 frente a 76), en parte por agotar el presupuesto de razonamiento de 3.584 tokens.
- El rendimiento depende fuertemente del dispositivo: en Pixel 11 Pro el int4 es más lento que el int8 en GPU, mientras que en Galaxy S26 ocurre lo contrario.
- El contexto nativo de 1.024.000 tokens del modelo original no se ha validado en los bundles LiteRT-LM; las mediciones usan ventanas de 1.024 tokens de prefill.
- No hay información sobre sesgos, idiomas soportados ni datos de entrenamiento, lo que impide evaluar riesgos de alucinación o cobertura lingüística.
- El modelo es de razonamiento y genera cadenas `<think>`; sin el runtime adecuado que separe el canal `thought`, el razonamiento puede filtrarse en la salida.
- Licencia Apache 2.0 permite uso comercial, pero la conversión LiteRT-LM y el modelo base deben verificarse por separado en sus repositorios respectivos.
- Los ficheros se reemplazaron el 15 de noviembre de 2026 con grafos reescritos para GPU; ejecuciones con runtimes anteriores a 0.19.x no fueron probadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/Spark-X2.5-1.7B
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-1.7B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Demo web en navegador: https://google-ai-edge.github.io/LiteRT-LM/web_demos/chat/index.html?model=litert-community/Spark-X2.5-1.7B
- Registro de benchmarks int4: https://github.com/john-rocky/edge-compat/blob/main/cards/spark-x2.5-1.7b-int4/CARD.md
- Registro de benchmarks int8: https://github.com/john-rocky/edge-compat/blob/main/cards/spark-x2.5-1.7b-int8/CARD.md
