# Launch80/Qwen3.8-27B-Quark-AWQ-MXFP4-SABER

## Resumen

Qwen3.8-27B-Quark-AWQ-MXFP4-SABER es un paquete de pesos precompilados para el motor de inferencia Saber, derivado de la cuantización de AMD `amd/Qwen3.8-27B-Quark-AWQ-MXFP4`, que a su vez es una recodificación del modelo `Qwen/Qwen3.8-27B` del equipo Qwen. No se trata de un modelo nuevo: es un artefacto de despliegue que reempaqueta los pesos MXFP4 de AMD en el formato propietario `SBRPACK1` de Saber, junto con un drafter de decodificación especulativa DFlash2. Lo publica el usuario Launch80 y está pensado exclusivamente para servirse en dos tarjetas RDNA4 (gfx1201) con paralelismo tensorial 2.

El interés técnico reside en que demuestra una ruta de despliegue de un modelo de 27B con cuantización MXFP4 (grupo 32, escala E8M0) sobre hardware AMD consumer/profesional, con decodificación especulativa integrada y una ventana de contexto configurable de hasta 262 144 tokens. El paquete incluye el target pack (20,8 GB), un drafter pack (7,7 GB), tokenizer, configuración y plantilla de chat.

La relevancia es acotada pero concreta: para quien opere GPUs RDNA4 y el motor Saber, ofrece un punto de partida reproducible con métricas de velocidad medidas (hasta 202,9 tok/s en decodificación single-stream con drafter y 617,6 tok/s agregados con concurrencia 8). Para el resto de la comunidad, el valor es principalmente documental, ya que los pesos no son safetensors ni GGUF y no cargan en vLLM, llama.cpp u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (modelo base Qwen3.8-27B); pesos en MXFP4 con escalas AWQ plegadas; torre de visión en bf16 presente pero no usada por el motor de texto |
| Parametros totales | 27B (según el nombre del modelo base; no se detalla desglose en la información disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 262 144 tokens (`--engine-max-ctx 262144`); con drafter el pool KV del target se reduce a 46,7k bloques |
| Tipos de cuantizacion | Pesos MXFP4 (grupo 32, escala E8M0); activaciones fp8 e4m3 por token (W4A8); KV cache fp8 e4m3; `lm_head` en bf16; cabeza de draft en int2 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Formato propietario Saber `SBRPACK1` (`rank{0,1}.pack` + `manifest.json`); no es safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es `Qwen/Qwen3.8-27B`, un transformer decoder del que no se detallan en la información disponible ni la composición del dataset ni las fases de alineación (RLHF/DPO). La cadena de transformación es la siguiente: Qwen publica los pesos originales; AMD los cuantiza con Quark aplicando AWQ y formato MXFP4 (grupo 32, escala E8M0), con las escalas AWQ ya plegadas en pesos y normas; finalmente Launch80 los reempaqueta en registros Saber de forma value-exact, verificado bloque a bloque (608/608 registros trio por rank bit-idénticos a la dequantización de Quark).

El paquete mantiene `lm_head` en bf16 byte a byte, y `embed_tokens`, normas, convoluciones y parámetros GDN también en bf16. La innovación operativa es doble: por un lado, el motor Saber ejecuta el modelo como W4A8 (activaciones fp8 e4m3 por token, KV en fp8), lo que difiere del W4A4 dinámico para el que AMD calibró el checkpoint; por otro, se acompaña de un drafter DFlash2 (`tcclaviger/Qwen3.8-27B-DFlash2-FP8`) con el `lm_head` del target compartido y una cabeza de draft re-cuantizada a int2. El drafter fue entrenado contra otra cuantización del target, de ahí una aceptación de aproximadamente 2,8 tokens aceptados por borrador bajo muestreo BetterBench.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, con modo thinking desactivable (el needle test se realizó con thinking off).
- Razonamiento matemático básico: la model card reporta GSM8K sobre 50 ítems en modo greedy.
- Soporte de tool calling / function calling: se validó en un smoke test de 5 prompts de chat y llamada a herramientas.
- Recuperación en contexto largo: 20/20 needles encontrados a ~35k y ~131k tokens.
- Decodificación especulativa mediante drafter DFlash2 emparejado, con anchos de decodificación configurables (`--engine-decode-widths 1,5,8`).
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión: la torre de visión se transporta en bf16 pero el motor de texto no la utiliza, por lo que no hay capacidad visual efectiva en este paquete.

## Casos de uso

- Despliegue de inferencia en hardware AMD RDNA4: el paquete está diseñado para servirse con Saber en dos tarjetas gfx1201 con TP=2, lo que permite operar un modelo de 27B en cuantización MXFP4 sobre GPUs Radeon AI PRO R9700 en lugar de aceleradores de datacenter.
- Servicio conversacional de baja latencia: con el drafter activo se alcanzan 202,9 tok/s en single-stream y un TTFT p50 de ~47 ms, adecuado para asistentes interactivos donde el tiempo hasta el primer token es crítico.
- Atención al cliente automatizada con contexto largo: la ventana de hasta 262 144 tokens permite mantener historiales extensos y documentación de referencia en el mismo contexto, con recuperación verificada a 131k tokens.
- Procesamiento por lotes con alta concurrencia: con concurrencia 8 y drafter se miden 617,6 tok/s agregados, útil para pipelines de generación masiva (resúmenes, clasificación, extracción) donde el throughput prima sobre la latencia individual.
- Agentes con llamada a herramientas: el soporte de tool calling validado en el smoke test permite integrar el modelo en flujos de agente que consultan APIs o ejecutan acciones, siempre que se acepte la ausencia de benchmarks de calidad completos.
- Prellenado de documentos largos: el prefill sostenido de ~5 000 tok/s entre 2k y 64k tokens hace viable ingerir contratos, informes o codebases extensos antes de generar respuestas.
- Evaluación comparativa de numericas de cuantización: el paquete sirve como banco de pruebas para medir el impacto de ejecutar pesos calibrados para W4A4 bajo un camino W4A8, con el caveat de que las cifras no reproducen la evaluación de AMD.

## Benchmarks y rendimiento

La model card advierte explícitamente de que no se ha ejecutado ningún benchmark de calidad completo sobre estos packs. Las únicas comprobaciones son sanity checks.

| Prueba | Resultado |
|---|---|
| GSM8K, 50 ítems, greedy, sin drafter | 50/50 |
| GSM8K, 50 ítems, greedy, con drafter | 49/50 |
| Needle test, ~35k tokens | 20/20 |
| Needle test, ~131k tokens | 20/20 |
| Smoke test chat/tool-call | 5 prompts, sin métricas publicadas |

Rendimiento de velocidad (BetterBench `--quick`, 2x Radeon AI PRO R9700, TP=2, 210 W):

| Métrica | Drafter off | Drafter on |
|---|---:|---:|
| Decodificación single-stream (tok/s, ponderado) | 57,9 | 202,9 |
| Concurrencia 1 (tok/s agregados) | 57,6 | 185,2 |
| Concurrencia 2 (tok/s agregados) | 111,1 | 293,8 |
| Concurrencia 4 (tok/s agregados) | 201,8 | 455,4 |
| Concurrencia 8 (tok/s agregados) | 334,7 | 617,6 |
| TTFT p50 (ms) | ~41 | ~47 |
| Prefill 2k / 8k / 16k / 32k / 64k (tok/s) | 5326 / 5643 / 5603 / 5536 / 5160 | 5086 / 5428 / 5480 / 5262 / 4972 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el target pack ocupa 20,8 GB y el drafter pack 7,7 GB, distribuidos en TP=2; en la configuración medida se usan dos tarjetas, por lo que el reparto ronda 10,4 GB de pesos del target por GPU más la parte proporcional del drafter y las cachés KV en fp8.
- GPU recomendadas: dos Radeon AI PRO R9700 (RDNA4, gfx1201) es la configuración probada; el motor requiere arquitectura RDNA4 y paralelismo tensorial 2.
- Cabe en GPU consumer: no hay datos de otras GPUs; el formato `SBRPACK1` solo lo carga el motor Saber y la ruta está limitada a gfx1201, por lo que no se puede desplegar en GPUs NVIDIA ni en RDNA anteriores con esta ruta.
- Opciones de despliegue: exclusivamente el motor Saber (`saber serve --engine real --engine-tp 2`), con build de la línea `ws-q27d-drafter`. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: TTFT p50 de ~41 ms sin drafter y ~47 ms con drafter; decodificación de 57,9 a 202,9 tok/s según configuración; prefill estable en torno a 5 000-5 600 tok/s hasta 64k tokens.
- Nota de capacidad: con drafter activo, el pool KV del target a 262k de contexto se reduce a 46,7k bloques, ya que el drafter mantiene su propia caché KV.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización / formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| Qwen3.8-27B-Quark-AWQ-MXFP4-SABER | 27B | hasta 262 144 | MXFP4 pesos, fp8 activaciones y KV, formato SBRPACK1 | Apache-2.0 | Solo Saber, TP=2, RDNA4 |
| amd/Qwen3.8-27B-Quark-AWQ-MXFP4 | 27B | no disponible | MXFP4 (W4A4 calibrado), safetensors | Apache-2.0 (según base) | Ecosistema estándar compatible con el checkpoint de AMD |
| Qwen/Qwen3.8-27B | 27B | no disponible | bf16 original | Apache-2.0 (según base) | vLLM, TGI, llama.cpp y otros |

La comparación de rendimiento frente a estas alternativas no está disponible: la model card no publica métricas de calidad y advierte que las cifras de velocidad corresponden a una configuración de hardware concreta.

## Limitaciones y advertencias

- Ausencia de evaluación de calidad: no se ha ejecutado ningún benchmark completo; GSM8K sobre 50 ítems y un needle test no constituyen evidencia suficiente para producción.
- Discrepancia numérica respecto a AMD: el checkpoint se calibró para W4A4 con activaciones dinámicas y KV en bf16, pero Saber ejecuta W4A8 con KV en fp8; los resultados miden los pesos de AMD bajo otra numericidad, no reproducen su evaluación.
- Aceptación del drafter degradada: al haberse entrenado contra otra cuantización del target, rinde aproximadamente 2,8 tokens aceptados por borrador, por debajo de su pareja nativa.
- Compatibilidad restringida: el formato `SBRPACK1` solo lo carga el motor Saber, en TP=2 y sobre RDNA4 (gfx1201); no hay ruta de despliegue alternativa.
- Reducción de contexto con drafter: el pool KV del target cae a 46,7k bloques a 262k de contexto cuando el drafter está activo.
- Visión no operativa: la torre visual se transporta en bf16 pero el motor de texto no la usa.
- Idiomas no documentados: no se especifica cobertura lingüística, lo que impide garantizar calidad multilingüe.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; deben asumirse los del modelo base Qwen3.8-27B.
- Licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones de los artefactos encadenados (checkpoint de AMD y drafter de tcclaviger/z-lab), todos declarados Apache-2.0.
- Madurez: el paquete se publicó con 0 descargas y 0 likes, y requiere un build concreto del motor Saber; no hay evidencia de uso en producción.

## Enlaces

- Hugging Face del paquete: https://huggingface.co/Launch80/Qwen3.8-27B-Quark-AWQ-MXFP4-SABER
- Modelo base cuantizado por AMD: https://huggingface.co/amd/Qwen3.8-27B-Quark-AWQ-MXFP4
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Drafter DFlash2: https://huggingface.co/tcclaviger/Qwen3.8-27B-DFlash2-FP8
- Repositorio del motor Saber: no disponible (la model card remite al repositorio de Saber sin enlace explícito)
