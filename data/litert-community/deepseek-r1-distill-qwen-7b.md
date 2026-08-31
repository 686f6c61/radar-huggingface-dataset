# litert-community/DeepSeek-R1-Distill-Qwen-7B

## Resumen

Este modelo es una conversión al formato LiteRT-LM (`.litertlm`) del modelo de razonamiento DeepSeek-R1-Distill-Qwen-7B, realizada por la comunidad `litert-community`. El objetivo es permitir la inferencia on-device (en el borde) mediante el runtime LiteRT-LM de Google, que es el motor que impulsa los modelos oficiales de `litert-community`. Se trata de una conversión de formato que no modifica los pesos originales: el modelo base es un Qwen2.5-7B ajustado por DeepSeek sobre unas 800.000 trazas de razonamiento generadas por DeepSeek-R1.

El modelo es un "reasoning model": antes de dar la respuesta final, genera una cadena de pensamiento delimitada por los marcadores ` thinking` y ` response`. La conversión aplica cuantización int4 por bloques (bloque de 32) con recorte óptimo OCTAV y embeddings en INT8, con una caché KV limitada a 4096 tokens. El archivo resultante pesa unos 4,2 GB y está diseñado para ejecutarse en escritorio (Mac) y en teléfonos Android con 12 GB o más de RAM; no cabe en dispositivos con 8 GB.

La relevancia de este modelo radica en que lleva capacidades de razonamiento de nivel DeepSeek-R1 a entornos de inferencia local con recursos limitados, manteniendo un rendimiento prácticamente idéntico al modelo en bf16 (una pérdida de solo 1 punto en GSM8K). Está publicado bajo licencia MIT, lo que facilita su uso comercial y su integración en aplicaciones de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2.5-7B), destilado de DeepSeek-R1 |
| Parametros totales | No disponible (el modelo base Qwen2.5-7B tiene ~7,6 mil millones; la conversion no altera los pesos) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (KV cache configurado en la conversion; el modelo base soporta hasta 128k) |
| Tipos de cuantizacion | int4 por bloques (bloque 32) con OCTAV, simetrico; embeddings en INT8 |
| Idiomas soportados | No disponible (el modelo base Qwen2.5 es multilingue con enfasis en ingles y chino) |
| Licencia | MIT |
| Formato de pesos | `.litertlm` (LiteRT-LM); los pesos originales estan disponibles en safetensors en el repositorio de DeepSeek |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B, un transformer denso de 28 capas. El modelo original DeepSeek-R1-Distill-Qwen-7B se obtuvo mediante destilacion supervisada (SFT) sobre aproximadamente 800.000 trazas de razonamiento generadas por DeepSeek-R1, lo que le confiere la capacidad de emitir una cadena de pensamiento antes de responder. La conversion a LiteRT-LM se realizo con la herramienta oficial `litert-torch` (funcion `export_hf`) sin codigo personalizado ni parches.

La cuantizacion aplicada es int4 por bloques de 32 elementos con recorte optimo OCTAV (optimal clipping) y simetria, mientras que la capa de embeddings se mantiene en INT8. El runtime LiteRT-LM ejecuta el modelo con computacion entera. La KV cache se fijo en 4096 tokens para ajustarse a las limitaciones de memoria de los dispositivos objetivo. Segun la model card, la cuantizacion preserva el comportamiento de razonamiento completo: la unica diferencia medida es una caida de 1 punto porcentual en GSM8K (87,0% frente al 88,0% en bf16).

## Capacidades

- Razonamiento paso a paso: genera una cadena de pensamiento explicita entre los marcadores ` thinking` y ` response` antes de dar la respuesta final.
- Resolucion de problemas matematicos: alcanza un 87,0% en GSM8K (evaluacion con 100 muestras, greedy, 0-shot).
- Generacion de texto con formato de respuesta estructurado (frecuentemente en `\boxed{}` para resultados numericos).
- Inferencia on-device: puede ejecutarse en Mac (CPU y GPU Metal) y en telefonos Android con 12 GB o mas de RAM mediante el runtime LiteRT-LM.
- Soporte de separacion del canal de razonamiento: desde la version 0.16.0 del runtime, el modelo declara el canal `thought` en sus metadatos, lo que permite recuperar el razonamiento y la respuesta por separado via `channels["thought"]`.
- No se documentan capacidades de tool calling, vision, audio ni multimodales; es un modelo exclusivamente de texto.

## Casos de uso

- Tutor inteligente de matematicas en dispositivos moviles: el modelo puede explicar paso a paso la resolucion de problemas aritmeticos o algebraicos, aprovechando su cadena de razonamiento y su rendimiento en GSM8K. Su tamano (~4,2 GB) permite ejecutarlo en un telefono Android de gama alta sin conexion.
- Asistente de razonamiento logico para aplicaciones de productividad: por ejemplo, analisis de argumentos, verificacion de deducciones o generacion de hipotesis, con la ventaja de que el razonamiento es visible y auditable.
- Chatbot de soporte tecnico con explicaciones: puede desglosar procedimientos de diagnostico o solucion de problemas en pasos logicos, mejorando la transparencia frente a respuestas directas.
- Sistema de ensenanza asistida por ordenador en entornos sin conexion: institutos o bibliotecas pueden desplegar el modelo en un Mac o en un servidor local con GPU para ofrecer ayuda en tareas de razonamiento sin depender de la nube.
- Analisis de problemas de logica y puzzles en aplicaciones educativas: el modelo puede resolver acertijos, sudokus o problemas de programacion logica, mostrando su proceso de pensamiento para fines pedagogicos.
- Generacion de informes o resumenes con justificacion: en contextos donde se requiere que la IA explique sus conclusiones (por ejemplo, analisis de datos simples), el modelo puede emitir un razonamiento estructurado antes de la respuesta final.
- Prototipado rapido de aplicaciones de razonamiento en el borde: desarrolladores pueden integrar el modelo en pipelines de LiteRT-LM para validar la viabilidad de asistentes con razonamiento en hardware limitado antes de escalar a modelos mayores.

## Benchmarks y rendimiento

La model card proporciona un unico benchmark de precision (GSM8K) y datos de rendimiento de inferencia en hardware especifico.

| Configuracion | GSM8K (n=100, greedy, 0-shot) |
|---|---|
| Modelo original en bf16 (referencia) | 88,0% |
| Este modelo (LiteRT int4 BOCTAV4) | 87,0% |

Rendimiento de inferencia medido con `litert-lm benchmark` (version 0.15.0) en un Apple M4 Max, con prefijo de 256 tokens, generacion de 256 tokens, 3 ejecuciones y max-num-tokens 4096:

| Dispositivo | Backend | Prefill (256 tok) | Decode | TTFT | Carga |
|---|---|---|---|---|---|
| Apple M4 Max (macOS) | CPU | 64 tok/s | 18,2 tok/s | 4,69 s | — |
| Apple M4 Max (macOS) | GPU (Metal) | 644 tok/s | 65,9 tok/s | 0,43 s | — |

En un Samsung Galaxy S26 (SM-S942Q, Android 16) con backend GPU, el modelo se ejecuta con 2375 de 2375 operaciones delegadas en dos subgrafos de LiteRT GPU y un pico de memoria de 1537 MB. No se publican cifras de velocidad para este telefono.

## Requisitos de hardware

- VRAM estimada: el archivo pesa ~4,2 GB; el pico de memoria observado en Android fue de 1537 MB (proceso completo). En Mac no se reporta el pico.
- GPU recomendadas: Apple M4 Max (GPU Metal) ofrece el mejor rendimiento medido (65,9 tok/s en decode). Cualquier GPU compatible con Metal o Vulkan en Android deberia funcionar.
- No cabe en dispositivos con 8 GB de RAM o menos: la seccion de pesos excede el presupuesto de mmap de iOS y de telefonos de gama media.
- Opciones de despliegue: runtime LiteRT-LM (`litert_lm_main` o `litert_lm_advanced_main`) con backends CPU o GPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI, ya que el formato es exclusivo de LiteRT-LM.
- Latencia y throughput: en Apple M4 Max, TTFT de 0,43 s en GPU y 4,69 s en CPU; decode de 65,9 tok/s en GPU y 18,2 tok/s en CPU. En Android no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Formato | Parametros | Contexto | Cuantizacion | GSM8K | Licencia |
|---|---|---|---|---|---|---|
| Este modelo (litert-community DeepSeek-R1-Distill-Qwen-7B) | LiteRT-LM | ~7,6B (base Qwen2.5-7B) | 4096 (KV cache) | int4 blockwise + OCTAV | 87,0% | MIT |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-7B (original) | Safetensors | ~7,6B | 128k | bf16 | 88,0% | MIT |
| litert-community/DeepSeek-R1-Distill-Qwen-1.5B | LiteRT-LM | ~1,5B | No disponible | int4 (presumiblemente) | No disponible | MIT |

La comparativa muestra que la conversion int4 mantiene practicamente el mismo rendimiento que el modelo original en bf16, con una perdida minima de 1 punto en GSM8K, a cambio de una reduccion significativa del tamano (de ~15 GB en bf16 a ~4,2 GB). La version 1.5B existe en el mismo formato y seria la alternativa para dispositivos con menos memoria, aunque no se dispone de sus benchmarks.

## Limitaciones y advertencias

- La longitud de contexto esta limitada a 4096 tokens en esta conversion, muy por debajo de los 128k del modelo base. Interacciones que requieran contexto largo fallaran o degradaran el rendimiento.
- No se ha publicado evaluacion de sesgos ni de alucinacion especifica para esta conversion. El corpus de entrenamiento del modelo base es web-derivado y no esta totalmente divulgado, por lo que puede contener sesgos y PII incidentales.
- El modelo puede alucinar en tareas de razonamiento complejo, especialmente fuera de su dominio de entrenamiento. Se recomienda validar las respuestas en aplicaciones criticas.
- No es apto para dispositivos con 8 GB de RAM o menos (incluido iPhone). Solo se garantiza su funcionamiento en Mac y en Android con 12 GB o mas.
- La licencia MIT permite uso comercial, pero el modelo base (Qwen2.5) es Apache-2.0; no hay restricciones adicionales conocidas.
- El formato `.litertlm` es propietario del ecosistema LiteRT-LM; no es compatible con otros runtime como llama.cpp o vLLM sin conversion adicional.
- No se documentan capacidades de tool calling, vision ni audio; es un modelo puramente textual.
- Los datos de rendimiento de CPU en Mac tienen una variabilidad de aproximadamente ±7% segun la propia model card, por lo que las cifras deben interpretarse con cautela.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/litert-community/DeepSeek-R1-Distill-Qwen-7B
- Modelo base original: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Runtime LiteRT-LM (GitHub): https://github.com/google-ai-edge/litert-lm
- Repositorio de DeepSeek-R1 (GitHub): https://github.com/deepseek-ai/DeepSeek-R1
- Version 1.5B del mismo formato: https://huggingface.co/litert-community/DeepSeek-R1-Distill-Qwen-1.5B
- Guia de GPU para Android: https://github.com/john-rocky/hf-to-litertlm/blob/main/docs/android-gpu.md
