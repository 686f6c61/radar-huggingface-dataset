# alfaplus/public-sft-qwen9b-v8

## Resumen

`alfaplus/public-sft-qwen9b-v8` es un adaptador LoRA publicado por alfaplus laboratory para el modelo base `Qwen/Qwen3.5-9B`. No es un modelo completo: el repositorio contiene únicamente los pesos del adaptador (86.556.672 parámetros entrenables, 496 tensores en fp32, 346.302.176 bytes), el `adapter_config.json` de PEFT y los ficheros de tokenizador y plantilla de chat guardados durante el entrenamiento. El adaptador se entrenó con QLoRA sobre un subconjunto de 1.024 ejemplos del dataset `kanhatakeyama/multiturn-conv-from-aozora-bunko`, un corpus de diálogo multi-turno en japonés generado de forma sintética.

El problema que aborda es acotado y experimental: ajustar el registro y la estructura de conversación de un corpus japonés sintético derivado de literatura de dominio público (Aozora Bunko). Los datos no son humanos: se generaron automáticamente con `cyberagent/calm3-22b-chat` a partir de extractos aleatorios de `globis-university/aozorabunko-clean`. El autor declara de forma explícita que solo se ejecutó entrenamiento y que no se realizó ninguna evaluación, ni con benchmarks, ni con conjunto de validación, ni con revisión manual de las generaciones.

Su relevancia es por tanto metodológica más que de rendimiento: documenta con precisión la procedencia de los datos, el filtrado aplicado (de 25.635 filas a 1.024), la configuración exacta de QLoRA y las limitaciones del artefacto. Es un ejemplo de ficha reproducible de un experimento de ajuste fino, no un modelo listo para producción. El contexto máximo del modelo base no se detalla en la información disponible; el entrenamiento se hizo con secuencias de 1.024 tokens.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT, `task_type=CAUSAL_LM`) sobre el modelo base `Qwen/Qwen3.5-9B`; la información disponible no detalla la arquitectura interna del base más allá de que se excluyen módulos `vision`/`audio`/`visual`/`mtp` de los targets |
| Parámetros totales | Adaptador: 86.556.672 parámetros entrenables (496 tensores, fp32). Modelo base: ≈9.000 millones según su denominación (`Qwen3.5-9B`), cifra no verificada en la información disponible |
| Parámetros activos | No aplica: no se describe como MoE en la información disponible |
| Longitud de contexto | No disponible para el modelo base. Ventana de entrenamiento: 1.024 tokens (`seq 1024`); los ejemplos con más de 1.024 tokens tras aplicar la plantilla de chat fueron descartados (787 casos) |
| Tipos de cuantización | El adaptador se distribuye en fp32 (safetensors). El entrenamiento usó QLoRA: base cargado en 4-bit NF4 con doble cuantización y cómputo en bf16. No se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | Japonés (`ja`) en los datos de entrenamiento; el autor no reclama capacidad en ningún idioma |
| Licencia | apache-2.0 (pesos del adaptador); el modelo base es apache-2.0 y el dataset de entrenamiento también |
| Formato de pesos | safetensors (`adapter_model.safetensors`), formato PEFT/LoRA; se incluyen `adapter_config.json`, `tokenizer.json`, `tokenizer_config.json` y `chat_template.jinja` |
| Modelo base | `Qwen/Qwen3.5-9B`, snapshot `c202236235762e1c871ad0ccb60c8ee5ba337b9a` (el campo `revision` del `adapter_config.json` es `null`) |
| Versión de PEFT | 0.20.0 (escritura del `adapter_config.json`); tokenizador guardado con transformers 5.15.0 |
| Tamaño del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El adaptador se entrenó con QLoRA: el modelo base se cargó mediante bitsandbytes en 4-bit NF4 con doble cuantización y `compute dtype` bf16, mientras que los pesos del adaptador se mantuvieron en precisión completa. La configuración LoRA es r=32, `lora_alpha`=64, `lora_dropout`=0.05, `bias=none` y `target_modules=auto`, con `exclude_modules` excluyendo `vision`, `audio`, `visual` y `mtp`. El entrenamiento usó `bf16=True`, kernel Liger, longitud de secuencia 1.024, batch de 4 con acumulación de gradiente 4 (lote efectivo de 16), tasa de aprendizaje 1e-4 con scheduler coseno, warmup de 0,03, semilla 42 y una sola GPU. El total fue de 3 épocas, es decir, 192 pasos de optimizador, y el checkpoint publicado corresponde exactamente al paso 192. La pérdida se calculó únicamente sobre los tokens de las respuestas del asistente (`all_tokens_loss=false`), sin contar system, user ni marcas de plantilla.

El dataset de partida tiene 25.635 filas; tras exigir estructura válida (un system opcional al inicio, alternancia estricta user/assistant, inicio en user y final en assistant) se descartaron 3.061, quedando 22.574. De ahí se eliminaron 787 ejemplos que superaban los 1.024 tokens con la plantilla de chat de Qwen3.5-9B, resultando 21.787 válidos, de los que se tomaron 1.024 tras barajar con semilla 42. La distribución de longitud es p50=304, p90=562, máximo=1.017, media=340,1 tokens, con 348.234 tokens por época. Todas las muestras empiezan con una instrucción de sistema (10 variantes del tipo «genera solo la réplica de la conversación, no emitas nada más») seguida de entre 1 y 6 pares user/assistant; la mayoría tienen 6 pares (605) o 4 pares (393). El contenido es sintético: `cyberagent/calm3-22b-chat` generó los diálogos a partir de extractos aleatorios de Aozora Bunko, sin revisión humana ni filtrado de calidad posterior; los errores factuales y sesgos del generador se transfieren íntegros al conjunto de entrenamiento.

## Capacidades

- Generación de texto conversacional en japonés, con estructura multi-turno (1 a 6 pares user/assistant) y una instrucción de sistema inicial.
- Reproducción del estilo de respuesta inducido por el corpus: respuestas concisas, en principio limitadas a la réplica de diálogo sin texto adicional, según la instrucción de sistema del entrenamiento.
- Ajuste de registro hacia materiales literarios japoneses de dominio público (Aozora Bunko), al menos en la distribución de entrenamiento.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo «thinking»; de hecho, los targets LoRA excluyen explícitamente módulos `vision`/`audio`/`visual`.
- Multilingüismo: no documentado; los datos son exclusivamente japoneses y el autor no reclama ninguna capacidad derivada.

## Casos de uso

- Prototipado de chatbots conversacionales en japonés: el adaptador se puede cargar sobre `Qwen3.5-9B` con PEFT para generar réplicas multi-turno en un entorno de pruebas, aceptando que no existe ninguna métrica de calidad publicada.
- Generación de datos sintéticos de diálogo: útil como pieza en un pipeline que produzca corpus japoneses de conversación a partir de semillas literarias, replicando el procedimiento del autor (semilla + modelo generador + filtrado estructural + corte por longitud).
- Investigación sobre recetas de QLoRA: la ficha documenta de forma completa hiperparámetros, pasos, hashes y estadísticas del subconjunto, lo que lo convierte en una referencia reproducible para estudiar el efecto de SFT con 1.024 ejemplos y 192 pasos.
- Experimentos de transferencia de estilo literario: para proyectos que necesiten aproximar el registro de la literatura japonesa moderna temprana en diálogos, con revisión humana obligatoria posterior.
- Evaluación comparativa de adaptadores de la misma familia: al existir otras versiones del mismo autor (`public-sft-qwen9b-v2`), sirve como punto de comparación en estudios internos de sensibilidad a datos y pasos.
- Docencia y formación: ejemplo didáctico de ficha técnica rigurosa, con trazabilidad de dataset, revisión, hashes y limitaciones declaradas.
- Base para un ajuste posterior: al ser un adaptador modular de 346 MB, se puede combinar o continuar entrenando sin tocar los pesos completos del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que solo se ejecutó entrenamiento y que no se realizó ninguna evaluación: ni benchmarks, ni conjunto de validación, ni inspección manual de las generaciones. Por tanto no existe ninguna evidencia de que el adaptador mejore, empeore o mantenga las capacidades del modelo base en japonés o en cualquier otra lengua.

## Requisitos de hardware

- El adaptador es ligero: `adapter_model.safetensors` ocupa 346.302.176 bytes (≈346 MB); el repositorio completo, 0,4 GB.
- Para inferencia hace falta cargar además el modelo base `Qwen3.5-9B`. Estimación aritmética a partir de 9.000 millones de parámetros: ≈18 GB solo en pesos en bf16/fp16, más caché KV y overhead, lo que sitúa el requisito práctico en 20-24 GB de VRAM.
- En 4-bit (NF4, como en el entrenamiento): ≈4,5-5,5 GB de pesos, con requisito práctico en torno a 8-10 GB de VRAM incluyendo contexto y overhead de ejecución.
- GPU recomendadas: A100 40/80 GB y H100 para servicio en bf16 con lotes grandes; RTX 4090 (24 GB) o L40S para bf16 con lotes pequeños; RTX 3090/4090, L4 (24 GB) o RTX 4080 para despliegue cuantizado a 4-bit.
- Sí cabe en GPU de consumo: en 4-bit en tarjetas de 8-12 GB; en bf16 requiere 24 GB o más.
- Opciones de despliegue: `transformers` + `peft` (ruta directa), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, o llama.cpp/Ollama solo si se convierte previamente, ya que no se publica ningún GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de velocidad ni de consumo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Evaluación publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| alfaplus/public-sft-qwen9b-v8 | Adaptador LoRA de 86,6 M sobre base de ≈9 B | No disponible (entrenado a 1.024 tokens) | QLoRA, 1.024 ejemplos sintéticos en japonés, 192 pasos | Ninguna | apache-2.0 | Adaptador PEFT, 0,4 GB |
| Qwen/Qwen3.5-9B (base) | ≈9 B | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | apache-2.0 | Pesos completos publicados por Qwen |
| alfaplus/public-sft-qwen9b-v2 | No disponible | No disponible | No disponible | Ninguna documentada en la información disponible | No disponible en la información consultada | Adaptador PEFT en Hugging Face |
| Adaptadores genéricos de instrucción sobre Qwen de ≈9 B | Variable | Variable | Variable | Habitualmente declarados por sus autores | Variable | Variable |

La comparación cuantitativa con alternativas no es posible: no hay benchmarks de este adaptador ni datos técnicos de las alternativas en la información disponible. La única comparación defendible es estructural: frente a los pesos completos del base, este repositorio ofrece un delta de 346 MB cargable y descartable, a cambio de un ajuste muy acotado (192 pasos sobre 1.024 ejemplos).

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni conjunto de validación, ni revisión humana de las generaciones; no se puede afirmar que el adaptador mejore al base en ningún aspecto.
- Datos sintéticos sin depuración: los diálogos fueron generados por `cyberagent/calm3-22b-chat` y no se filtraron por calidad; los errores factuales, sesgos y preferencias estilísticas del generador están incorporados al adaptador.
- Sesgo de dominio: las semillas provienen de literatura japonesa de dominio público, lo que puede inducir un registro arcaico o literario poco adecuado para conversación moderna.
- Volumen de entrenamiento muy reducido: 1.024 ejemplos, 3 épocas y 192 pasos, con una sola semilla; no hay estudio de robustez ni de sensibilidad a hiperparámetros.
- Riesgo de alucinación: no medido, y previsiblemente heredado del modelo base, posiblemente agravado por el estilo literario del corpus.
- Cobertura lingüística: solo japonés en el entrenamiento; se desconoce el comportamiento en castellano u otras lenguas tras aplicar el adaptador.
- Contexto: los ejemplos se truncaron a 1.024 tokens; no hay evidencia de comportamiento correcto con contextos más largos, aunque el base los soporte.
- Licencia: los pesos del adaptador son apache-2.0 y permiten uso comercial, pero la licencia del dataset no cambia por esta publicación; deben respetarse además las condiciones del dataset de semillas (`globis-university/aozorabunko-clean`, cc-by-4.0) y del modelo generador (`cyberagent/calm3-22b-chat`, apache-2.0).
- Trazabilidad incompleta en un punto: el `adapter_config.json` tiene `revision: null`, por lo que el snapshot del base solo consta por la caché local del autor y no queda fijado en la configuración PEFT.
- El adaptador no se distribuye fusionado y no se incluyen checkpoints intermedios ni estados del optimizador; no es un producto y el propio autor lo describe como experimento de laboratorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alfaplus/public-sft-qwen9b-v8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/kanhatakeyama/multiturn-conv-from-aozora-bunko
- Dataset de semillas (Aozora Bunko limpio): https://huggingface.co/datasets/globis-university/aozorabunko-clean
- Modelo generador de los diálogos sintéticos: https://huggingface.co/cyberagent/calm3-22b-chat
- Código de generación y limpieza citado por el dataset: https://huggingface.co/KanHatakeyama/2024ChatBotDevLog
- Organización del autor: https://huggingface.co/alfaplus
- Versión previa de la misma familia: https://huggingface.co/alfaplus/public-sft-qwen9b-v2
