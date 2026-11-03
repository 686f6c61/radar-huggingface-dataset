# mlx-community/Qwen3.8-27B-GPTQ-4bit

## Resumen

`mlx-community/Qwen3.8-27B-GPTQ-4bit` es una cuantización de 4 bits del modelo multimodal `Qwen/Qwen3.8-27B`, publicada por la organización mlx-community y cuantizada originalmente por el usuario sady4850. No se trata de un modelo nuevo, sino de una variante de pesos: mantiene exactamente la arquitectura, el tokenizador, la configuración y las formas de tensor del checkpoint base, pero sustituye los códigos de cuantización afín de 4 bits (round-to-nearest) de las capas lineales del transformer de lenguaje por códigos calculados con GPTQ. El objetivo es reducir la degradación respecto al modelo en bf16 sin aumentar el tamaño ni el coste de inferencia.

El modelo base pertenece a la familia Qwen3.8, con 27.356.728.560 parámetros totales y pipeline `image-text-to-text`, lo que indica capacidad de entrada de imagen y texto. La variante cuantizada ocupa 15 GB en disco (16,1 GB de repositorio) y está pensada para ejecutarse con la librería MLX de Apple sobre silicio Apple (M1, M2, M3, M4 y variantes Pro/Max/Ultra), a través de `mlx-vlm`, `mlx-lm` o el motor Splash.

Su relevancia es práctica: demuestra que aplicar GPTQ respetando el formato afín nativo de MLX reduce la divergencia frente a bf16 de forma medible (KLD medio de 0,0369 frente a 0,0562 en wikitext-2, y de 0,0975 frente a 0,1800 en chat) manteniendo el mismo tamaño y velocidad que la cuantización RTN equivalente. Es, por tanto, una opción de sustitución directa para quien ya use el checkpoint de 4 bits de MLX y quiera mayor fidelidad al original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.8, tag `qwen3_5`); incluye torre de visión y 64 capas en el modelo de lenguaje |
| Parámetros totales | 27.356.728.560 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | 4 bits afín MLX (group size 64) con escalas y sesgos calculados por GPTQ; 497 capas lineales recuantizadas, incluida `lm_head`; embedding y torre de visión sin cuantizar (heredados de la plantilla) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `mlx`) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `Qwen/Qwen3.8-27B`: un transformer multimodal con torre de visión y 64 capas en el componente de lenguaje, según se deduce de la descripción de la recuantización (497 capas lineales en 64 capas, incluida la cabeza de salida). Esta ficha no dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base usó RLHF, DPO u otras técnicas de alineamiento.

La innovación de esta variante está en el proceso de cuantización. Los autores calculan las matrices de Hessian a partir del modelo en bf16, una por entrada compartida, con amortiguamiento de 0,01 y bloques de 128. Cada grupo de cuantización ajusta su escala y su sesgo a partir de los pesos actualizados por el error y los redondea a bf16 antes de codificar, de modo que el resultado se descomprime exactamente como está escrito en el checkpoint. La calibración emplea 119 fragmentos de 2048 tokens: 64 fragmentos de conversaciones de entrenamiento de UltraChat con la plantilla de chat aplicada y 55 fragmentos del corpus `calibration_v5`. El resultado conserva tensores, formas, dtypes y configuración idénticos a la plantilla `mlx-community/Qwen3.8-27B-4bit`, por lo que es intercambiable sin cambios de código.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat aplicada en la calibración.
- Entrada de imagen y texto (`image-text-to-text`), heredada del modelo base; la torre de visión no fue recuantizada.
- Razonamiento y generación de código: la evaluación de agentes se hizo sobre una sesión real de agente de programación con contextos de 32K a 124K tokens.
- Tool calling y function calling: la prueba de agentes mide llamadas a herramientas, coincidencia de herramientas y similitud de argumentos.
- Uso en agentes multi-paso con contexto largo, evidenciado por la replay de 78 turnos con ventanas de hasta 124K tokens.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponibles en la información proporcionada.

## Casos de uso

- Agentes de programación en local sobre Mac: la replay de 78 turnos de una sesión real de coding-agent muestra un 44 % de llamadas idénticas a Q8_0 y un 83 % de herramientas coincidentes, con cero llamadas rotas, lo que lo hace viable para asistentes de código que operan sobre repositorios con contexto de hasta 124K tokens.
- Sustitución directa de la cuantización RTN en pipelines existentes: al compartir tensores, formas y configuración con `mlx-community/Qwen3.8-27B-4bit`, se puede cambiar el identificador del repositorio en `mlx-vlm`, `mlx-lm` o Splash sin tocar el código ni el resto del stack.
- Inferencia multimodal en estación de trabajo Apple: al conservar la torre de visión del modelo base, sirve para tareas de imagen-texto en local, aunque la calidad de visión no fue evaluada por los autores.
- Prototipado de asistentes conversacionales con contexto largo: la ventana de evaluación de 2048 tokens por fragmento y los contextos de agente de hasta 124K indican uso en diálogos extensos, con la cautela de que la longitud de contexto oficial no se detalla en la información disponible.
- Evaluación comparativa de formatos de cuantización: sirve como referencia para decidir entre GPTQ 4 bits de MLX, GGUF `UD-Q4_K_M` o `Q4_0` en función del equilibrio entre tamaño, KLD y velocidad de decodificación.
- Despliegue en portátiles Apple con memoria unificada: con 15 GB de pesos en 4 bits, cabe en equipos de 32 GB o más de memoria unificada, lo que permite ejecutar un modelo de 27B en hardware de consumo.
- Investigación sobre cuantización: el repositorio incluye los números crudos y registros en `eval/`, útil para reproducir metodologías de evaluación con KLD y tasa de flips.

## Benchmarks y rendimiento

Calidad frente a bf16 en torch (A100), con ambos checkpoints descomprimidos al mismo modelo bf16. KLD = KL(bf16 || cuantizado) de la distribución del siguiente token; flips = el token top-1 difiere de bf16.

| Texto | Modelo | KLD medio | KLD mediana | KLD p99 | Flips | PPL |
|---|---|---|---|---|---|---|
| wiki | bf16 | — | — | — | — | 6,370 |
| wiki | RTN 4 bits | 0,0562 | 0,0230 | 0,440 | 9,57 % | 6,486 |
| wiki | GPTQ 4 bits (este repo) | 0,0369 | 0,0122 | 0,315 | 7,37 % | 6,475 |
| chat | bf16 | — | — | — | — | 8,692 |
| chat | RTN 4 bits | 0,1800 | 0,0312 | 3,233 | 13,13 % | 8,109 |
| chat | GPTQ 4 bits (este repo) | 0,0975 | 0,0127 | 1,743 | 9,05 % | 8,752 |

Calidad en Splash (teacher-logits, KV int8, M1 Pro):

| Texto | Modelo | KLD medio | KLD mediana | KLD p99 | Flips | PPL |
|---|---|---|---|---|---|---|
| wiki | bf16 | — | — | — | — | 6,364 |
| wiki | RTN 4 bits | 0,0562 | 0,0221 | 0,469 | 9,58 % | 6,479 |
| wiki | GPTQ 4 bits (este repo) | 0,0399 | 0,0119 | 0,326 | 7,49 % | 6,458 |
| chat | bf16 | — | — | — | — | 8,717 |
| chat | RTN 4 bits | 0,1906 | 0,0327 | 2,724 | 13,13 % | 8,141 |
| chat | GPTQ 4 bits (este repo) | 0,1002 | 0,0128 | 1,577 | 9,05 % | 8,706 |

Replay de agente (78 turnos, contexto 32K–124K, temperatura 0, Splash 1.4.0-m1 en M2 Max, referencia Q8_0):

| Modelo | Mismas llamadas | Mismas herramientas | Similitud de argumentos | Llamadas rotas |
|---|---|---|---|---|
| RTN 4 bits | 31 % | 79 % | 0,88 | 0 |
| GPTQ 4 bits (este repo) | 44 % | 83 % | 0,92 | 0 |

Comparativa de cuantizaciones en Splash (mismas ventanas y referencia bf16):

| Modelo | Tamaño | KLD wiki | KLD chat | KLD chat p99 | 127 ciclos de verificación |
|---|---|---|---|---|---|
| `unsloth/Qwen3.8-27B-GGUF:UD-Q4_K_M` | 16,5 GB | 0,0144 | 0,0831 | 1,353 | 25,60 s |
| Este repo (GPTQ) | 15 GB | 0,0399 | 0,1002 | 1,577 | 23,00 s |
| `unsloth/Qwen3.8-27B-GGUF:Q4_0` | 16,1 GB | 0,0325 | 0,1412 | 2,493 | 24,40 s |
| RTN 4 bits | 15 GB | 0,0562 | 0,1906 | 2,724 | 23,05 s |
| `ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF:IQ3_S` | 11,8 GB | 0,0573 | 0,2121 | 3,427 | 29,40 s |

Velocidad en Splash: 14,10 s de mediana de prefill por ventana de 2048 tokens, idéntico a la plantilla RTN; 23,00 s frente a 23,05 s para 127 ciclos de verificación.

## Requisitos de hardware

- VRAM/memoria: 15 GB de pesos en 4 bits; el repositorio completo ocupa 16,1 GB. Se necesita memoria unificada adicional para KV cache y activaciones, por lo que un equipo de 32 GB es el mínimo razonable y 64 GB ofrece margen para contextos largos.
- Hardware objetivo: silicio Apple (M1, M2, M3, M4 y variantes Pro, Max y Ultra) mediante MLX. Las mediciones de calidad en torch se hicieron en A100, pero la ejecución práctica del checkpoint MLX es en Apple Silicon.
- GPU de consumo: sí cabe en equipos Apple con memoria unificada de 32 GB o superior; no está pensado para GPUs NVIDIA de consumo, ya que el formato es afín de MLX y no GGUF.
- Despliegue: `mlx-vlm` (recomendado, `python -m mlx_vlm.generate`), `mlx-lm` y el motor Splash. No es compatible con vLLM, llama.cpp, Ollama ni TGI sin conversión previa de formato.
- Latencia y throughput: en Splash sobre M1 Pro, 14,10 s de prefill por ventana de 2048 tokens y 23,00 s para 127 ciclos de verificación; en la replay de agente sobre M2 Max, los ciclos por segundo quedaron dentro del 2 % respecto a la variante RTN.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | KLD chat (Splash) | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Este repo (GPTQ 4 bits MLX) | 27,36B | no disponible | 4 bits GPTQ afín MLX | 0,1002 | 15 GB | Apache 2.0 | Hugging Face, mlx-vlm/Splash |
| `mlx-community/Qwen3.8-27B-4bit` (RTN) | 27,36B | no disponible | 4 bits RTN afín MLX | 0,1906 | 15 GB | Apache 2.0 | Hugging Face, mlx-vlm/Splash |
| `unsloth/Qwen3.8-27B-GGUF:UD-Q4_K_M` | 27,36B | no disponible | GGUF Q4_K_M | 0,0831 | 16,5 GB | Apache 2.0 | Hugging Face, llama.cpp |
| `ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF:IQ3_S` | 27,36B | no disponible | GGUF IQ3_S | 0,2121 | 11,8 GB | Apache 2.0 | Hugging Face, llama.cpp |

El GGUF `UD-Q4_K_M` es más fiel a bf16 en chat (KLD 0,0831 frente a 0,1002) a cambio de 1,5 GB más y aproximadamente un 11 % más de lentitud en decodificación en contexto corto. A igual tamaño y velocidad que la variante RTN, este repositorio es la opción más cercana al modelo original.

## Limitaciones y advertencias

- La visión no fue evaluada: todas las ejecuciones son solo de lenguaje, pese a que el pipeline es `image-text-to-text`.
- La calibración es en inglés (UltraChat y `calibration_v5`), por lo que el comportamiento en otros idiomas no está caracterizado.
- Las ventanas de evaluación KLD son de 2048 tokens; el comportamiento de la cuantización más allá de esa longitud no se midió directamente, aunque la replay de agente cubre contextos de hasta 124K.
- No se midió la precisión en tareas concretas (task accuracy); los datos disponibles son de divergencia de distribución y de replay de agente.
- La replay de agente consta de solo 78 turnos, una muestra pequeña según los propios autores.
- La PPL aislada no es una buena medida de fidelidad: el checkpoint RTN tiene menor PPL de chat que el propio bf16, por lo que deben priorizarse KLD y tasa de flips.
- Licencia Apache 2.0, que permite uso comercial, pero se heredan las limitaciones y sesgos del modelo base `Qwen/Qwen3.8-27B`, no documentados en la información disponible.
- Riesgo de alucinación y sesgos del modelo base: no cuantificados en la información proporcionada.
- El formato es específico de MLX; no es directamente utilizable en stacks CUDA, vLLM o llama.cpp.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlx-community/Qwen3.8-27B-GPTQ-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Plantilla de cuantización RTN: https://huggingface.co/mlx-community/Qwen3.8-27B-4bit
- Perfil del cuantizador: https://huggingface.co/sady4850
- Organización MLX Community: https://huggingface.co/mlx-community
- Motor Splash: https://github.com/paperniuk/splash
- Discusión con la replay de agente: https://github.com/paperniuk/splash/discussions/34#discussioncomment-19226461
- Perfil del autor de la replay: https://github.com/ghisguth
- Cuantización GGUF comparada: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Cuantización IQ3_S comparada: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
