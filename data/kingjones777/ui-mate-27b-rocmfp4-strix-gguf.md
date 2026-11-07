# kingjones777/UI-Mate-27B-ROCmFP4-STRIX-GGUF

## Resumen

UI-Mate-27B-ROCmFP4-STRIX-GGUF es una cuantización en formato GGUF del modelo tencent/UI-Mate-27B, un agente de interfaz gráfica (GUI agent) desarrollado por Tencent que recibe capturas de pantalla y emite llamadas a herramientas como salida. La cuantización la publica el usuario kingjones777 y está específicamente optimizada para hardware AMD Ryzen AI Max+ 395 (Strix Halo), con GPU integrada Radeon 8060S bajo arquitectura gfx1151 y ROCm 7.2.4. El formato empleado es ROCmFP4 con la receta STRIX, manteniendo la cabeza de salida y el embedding de tokens en Q6_K.

El modelo base deriva de Qwen3.6-27B y conserva la arquitectura `qwen35`, con 64 capas de las cuales 48 son Gated-DeltaNet y 16 son atención completa; solo estas últimas mantienen caché KV. Es un modelo denso de aproximadamente 27B parámetros (el repositorio safetensors reporta 1.924.404.480 parámetros, cifra que no concuerda con el tamaño nominal y debe interpretarse con cautela). El repositorio incluye además el proyector de visión en BF16 y un modelo borrador DFlash2 para decodificación especulativa.

La relevancia de esta ficha radica en que documenta un caso práctico de despliegue de un agente visual en hardware de consumo de gama alta con memoria unificada, con métricas de rendimiento medidas y publicadas por el autor de la cuantización: 30,3 tok/s en el arnés de GUI-agent con el borrador especulativo, frente a 13,9 tok/s sin él, y 17 de 17 llamadas a herramientas válidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen35 (transformer híbrido: 64 capas, 48 Gated-DeltaNet y 16 de atención completa) |
| Parametros totales | 27B nominales (el repositorio safetensors reporta 1.924.404.480; dato inconsistente) |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | 65.536 tokens en la configuración de servicio recomendada |
| Tipos de cuantizacion | ROCmFP4 (receta STRIX), cabeza de salida y embedding en Q6_K; proyector de visión en BF16; borrador DFlash2 en Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del modelo | 14,09 GiB (15.127.582.592 bytes) |
| Proyector de visión | 0,87 GiB (931.146.368 bytes), BF16 |
| Modelo borrador | 1,06 GiB (1.143.006.848 bytes), Q4_K_M |
| Hardware objetivo | AMD Ryzen AI Max+ 395 (Strix Halo), Radeon 8060S, gfx1151 |
| Version de ROCm | 7.2.4 |

## Arquitectura y entrenamiento

El modelo base UI-Mate-27B es un ajuste fino de Qwen3.6-27B que conserva la arquitectura `qwen35`. Esta combina 64 capas, de las cuales 48 emplean Gated-DeltaNet (un mecanismo de estado recurrente con coste de memoria lineal) y 16 son capas de atención completa. Solo las 16 capas de atención completa mantienen caché KV, de modo que el crecimiento de memoria de contexto se produce en una minoría de las capas. El modelo es denso: los 27B parámetros se leen en cada token, por lo que la decodificación está limitada por el ancho de banda de memoria.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La cuantización ROCmFP4 se generó con la receta STRIX y una matriz de importancia (imatrix), manteniendo cabeza de salida y embedding en Q6_K para preservar calidad. El repositorio incorpora un modelo borrador DFlash2 (Qwen3.6-27B-DFlash2-JetBrains, adaptación no oficial de JetBrains del DFlash 2 de Inco AI, convertido a GGUF y cuantizado a Q4_K_M) que actúa como draft model para decodificación especulativa, ya que UI-Mate no publica cabeza de predicción multi-token (MTP). La decodificación especulativa funciona porque UI-Mate conserva el vocabulario y la arquitectura de Qwen3.6-27B.

## Capacidades

- Entrada de imagen y texto (pipeline image-text-to-text): interpreta capturas de pantalla y genera la siguiente acción a ejecutar.
- Emisión de llamadas a herramientas (tool calling) orientadas a la interacción con interfaces gráficas.
- Razonamiento con modo thinking activable (`--think on`).
- Decodificación especulativa mediante modelo borrador DFlash2, con una tasa de aceptación del 42 % en el arnés GUI-agent.
- Caché de prompt activada para bucles de agente multi-turno.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de código: el autor reporta pruebas con seis prompts de generación de código (27,3 tok/s de media), lo que sugiere competencia en generación de código, aunque no se detallan resultados de calidad.

## Casos de uso

- Automatización de pruebas de interfaz gráfica: el modelo recibe capturas de pantalla de una aplicación y emite la siguiente acción (clic, escritura, navegación) como llamada a herramienta, lo que permite construir suites de test end-to-end guiadas por lenguaje natural sobre el hardware Strix Halo.
- Agentes de escritorio para tareas repetitivas: con 65.536 tokens de contexto y caché de prompt, puede mantener un bucle de agente multi-turno que no reprocesa la conversación completa en cada paso, adecuado para flujos de rellenado de formularios o extracción de datos de aplicaciones legacy.
- Asistencia a usuarios en entornos sin API: al ejecutarse localmente en un Ryzen AI Max+ 395 con 128 GB de memoria unificada, permite desplegar un agente visual en equipos de sobremesa o portátiles de gama alta sin depender de servicios en la nube.
- Investigación en agentes GUI: el repositorio incluye el arnés de evaluación de Tencent con 17 peticiones oficiales, lo que facilita reproducir experimentos de tool calling y comparar configuraciones (con y sin borrador especulativo).
- Generación de código asistida en local: las pruebas del autor con prompts de código a 27,3 tok/s sugieren viabilidad para autocompletado o generación de fragmentos en un entorno de desarrollo integrado ejecutado sobre la misma máquina.
- Prototipado de pipelines de visión-lenguaje: el proyector BF16 separado permite experimentar con el componente visual de forma independiente y sustituir el modelo de lenguaje si fuera necesario.

## Benchmarks y rendimiento

Métricas publicadas por el autor de la cuantización, medidas el 2026-11-07 con la build Super ROC fd85671, una petición a la vez, caché de prompt fría y prompts fijos, con temperatura 1,0, top-p 0,95, top-k 20 y thinking activado.

| Metrica | Resultado |
|---|---|
| Decodificacion en arnes GUI-agent, con borrador | 30,3 tok/s |
| Decodificacion en arnes GUI-agent, sin borrador | 13,9 tok/s |
| Tokens borrador aceptados (GUI-agent) | 42 % |
| Llamadas a herramienta validas (GUI-agent) | 17 de 17 |
| Llamadas a herramienta en modo requerido | 7 de 7 |
| Perplejidad (held out, n_ctx 4096, 5 chunks) | 5,9876 |
| Perplejidad de Q4_K_M de bartowski (referencia) | 6,0938 |

| Prompt | Tokens de prompt | Prefill (tok/s) | Decode (tok/s) | Borrador aceptado |
|---|---:|---:|---:|---:|
| 1K | 1.564 | 586,1 | 37,9 | 183 de 387 |
| 8K | 13.382 | 570,1 | 24,4 | 146 de 422 |
| 16K | 26.819 | 547,3 | 24,4 | 156 de 394 |

Generación de código (seis prompts, 256 tokens cada uno): decodificación media de 27,3 tok/s, con rango de 25,8 a 29,9 tok/s.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo ocupa 14,09 GiB, más 0,87 GiB del proyector de visión y 1,06 GiB del borrador DFlash2; en total, aproximadamente 16 GiB de pesos, a los que se suma la caché KV de las 16 capas de atención completa y el estado recurrente de las 48 capas Gated-DeltaNet.
- Hardware probado: AMD Ryzen AI Max+ 395 (Strix Halo) con 128 GB de memoria unificada y GPU Radeon 8060S (gfx1151).
- GPU recomendadas: Radeon 8060S integrada en Ryzen AI Max+ 395; no se han publicado pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en el hardware objetivo de memoria unificada; no se dispone de datos para GPUs discretas de consumo.
- Opciones de despliegue: llama.cpp a través del servidor `superroc` (build Super ROC fd85671 con soporte ROCm); no se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: prefill de 547 a 586 tok/s y decode de 24,4 a 37,9 tok/s según longitud de prompt; 30,3 tok/s en el arnés GUI-agent con borrador.
- Requiere ROCm 7.2.4 y un límite de petición ampliado a 64 MiB (`--max-request-bytes 67108864`) para acomodar las capturas de pantalla.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| UI-Mate-27B-ROCmFP4-STRIX (este) | 27B | 65.536 | GGUF ROCmFP4 | Apache 2.0 | Optimizado para gfx1151; incluye proyector y borrador |
| tencent/UI-Mate-27B (base) | 27B | no disponible | safetensors | Apache 2.0 | Modelo original sin cuantizar; requiere hardware distinto |
| Qwen3.6-27B (arquitectura origen) | 27B | no disponible | no disponible | no disponible | Comparte arquitectura y vocabulario; no es un agente GUI |
| Qwen3.8-27B-Uncensored-ROCmFP4-STRIX-MTP (mismo autor) | 27B | no disponible | GGUF ROCmFP4 | Apache 2.0 | Variante sin censura con cabeza MTP; tarea distinta (texto, no GUI) |

## Limitaciones y advertencias

- La cuantización ROCmFP4 está optimizada para gfx1151 (Radeon 8060S); su funcionamiento en otras GPUs AMD o en NVIDIA no está documentado y puede no ser compatible.
- El modelo es denso, por lo que la decodificación está limitada por ancho de banda de memoria; sin el borrador especulativo el rendimiento cae a 13,9 tok/s en el arnés GUI-agent.
- El borrador DFlash2 es una adaptación no oficial de JetBrains y no forma parte del release de Tencent; su tasa de aceptación (42 %) implica que más de la mitad de los tokens propuestos se descartan.
- No se dispone de información sobre sesgos, idiomas soportados ni evaluación de alucinación del modelo base.
- La cifra de parámetros del repositorio safetensors (1.924.404.480) no concuerda con el tamaño nominal de 27B ni con el tamaño del archivo GGUF; debe tratarse como dato no fiable.
- El límite de petición debe ampliarse a 64 MiB para aceptar capturas de pantalla; configuraciones por defecto pueden rechazar las peticiones.
- No se han publicado resultados de benchmarks estándar de calidad (MMLU, HumanEval, GSM8K), solo métricas de rendimiento y de validez de tool calls.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del borrador DFlash2 por separado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kingjones777/UI-Mate-27B-ROCmFP4-STRIX-GGUF
- Modelo base: https://huggingface.co/tencent/UI-Mate-27B
- Repositorio relacionado del mismo autor (Qwen3.8-27B-Uncensored-ROCmFP4-STRIX-MTP-GGUF): https://huggingface.co/kingjones777/Qwen3.8-27B-Uncensored-ROCmFP4-STRIX-MTP-GGUF
- Árbol de archivos del repositorio relacionado: https://huggingface.co/kingjones777/Qwen3.8-27B-Uncensored-ROCmFP4-STRIX-MTP-GGUF/tree/main
- Archivo MTP del repositorio relacionado: https://huggingface.co/kingjones777/Qwen3.8-27B-Uncensored-ROCmFP4-STRIX-MTP-GGUF/blob/main/mtp-Qwen3.8-27B-Q4_0.gguf
