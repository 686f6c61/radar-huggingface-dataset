# qualcomm-ai-hub-community/Qwen3.5-0.8B-NPU-fraQtl

## Resumen

Qwen3.5-0.8B-NPU-fraQtl es una cuantización Q4_0 en formato GGUF del modelo Qwen3.5-0.8B de Qwen, publicada por el usuario fraQtl y redistribuida en el espacio de qualcomm-ai-hub-community. El objetivo no es solo reducir el tamaño del modelo, sino preservar las capacidades de tool calling del original tras la cuantización, que suele degradarlas de forma notable. Para ello emplea redondeo GPTQ ponderado por Hessiano con una importance matrix de conversaciones de chat y uso de herramientas, y una corrección de escalas que se integra en los factores almacenados sin aumentar el tamaño del fichero.

El modelo base es un transformer de aproximadamente 752 millones de parámetros (0,8B nominales), pensado para ejecución en dispositivo. Esta variante está optimizada para el backend Hexagon de llama.cpp, lo que permite ejecutarla en la NPU de los Snapdragon 8 Elite Gen 6 (SM8975) además de en CPU y GPU. El fichero ocupa 507.154.336 bytes (unos 484 MiB) y el repo completo 0,5 GB.

Su relevancia actual radica en que demuestra que una cuantización bien calibrada puede recuperar gran parte de la degradación en tareas de function calling: en el benchmark BFCL v4 live obtiene 1.367 puntos frente a 1.250 de la cuantización Q4_0 de unsloth y 1.457 del modelo original en bf16, con el mismo tamaño de fichero y la misma velocidad de decodificación en NPU. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-0.8B); no se detalla la variante interna en la información disponible |
| Parámetros totales | 752.393.024 |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_0 (todos los tensores fijados al type map Q4_0 de unsloth, compatibles con Hexagon) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `Qwen3.5-0.8B-fraQtl-NPU-Q4_0.gguf`, 507.154.336 bytes) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B es un transformer de 752 millones de parámetros; la información proporcionada no detalla el número de capas, la dimensión oculta ni la composición del dataset de entrenamiento original, ni si el modelo base pasó por RLHF o DPO. Lo que sí se documenta con precisión es el proceso de cuantización, que constituye la innovación principal de esta ficha.

El método consta de tres pasos. Primero, se sustituye el redondeo al vecino más cercano por un redondeo GPTQ ponderado por Hessiano (Frantar et al., 2022), usando una importance matrix construida con una mezcla de calibración de conversaciones de chat y de uso de herramientas renderizadas con la plantilla de chat propia de Qwen. Segundo, todos los tensores se fijan al type map Q4_0 de unsloth, garantizando que todos los tipos sean compatibles con el backend Hexagon. Tercero, se aplica una corrección de escalas hacia el modelo original, plegada en las escalas almacenadas, de modo que el tamaño en bytes y los tipos permanecen idénticos a los de la referencia. No se emplean técnicas de decodificación especulativa ni atención lineal; el interés técnico está en la preservación de capacidades tras la cuantización.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla propia de Qwen.
- Tool calling / function calling: es la capacidad en la que se centra la evaluación del autor, medida con BFCL v4 live (llamadas simples, múltiples, paralelas y paralelas múltiples).
- Discriminación de irrelevancia: el modelo sabe cuándo no debe invocar una herramienta (596 aciertos en BFCL v4 live, frente a 676 del original).
- Razonamiento de múltiples pasos en el contexto de agentes, implícito en las llamadas paralelas y paralelas múltiples evaluadas.
- Ejecución en dispositivo: compatible con el backend Hexagon de llama.cpp para NPU Snapdragon, y también con CPU y GPU.
- Modo thinking: la evaluación se realizó con thinking desactivado; la información disponible no detalla el comportamiento con thinking activado.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión y audio: no disponibles; el autor indica explícitamente que es un modelo solo de texto.

## Casos de uso

- Asistentes de voz y agentes en smartphone: el modelo decodifica a 80,0 tok/s en la NPU del Snapdragon 8 Elite Gen 6 con un pico de memoria de aproximadamente 348 MB, lo que permite mantener un agente conversacional local sin enviar datos a la nube.
- Automatización de llamadas a herramientas en apps móviles: con 1.367 puntos en BFCL v4 live y 760 llamadas correctas, es adecuado para enrutar acciones del usuario (calendario, clima, mensajería) a APIs locales mediante function calling.
- Copilotos de productividad offline: al caber en 507 MB de fichero, puede empaquetarse dentro de una aplicación de escritorio o móvil para resúmenes, reescritura y respuestas rápidas sin conexión.
- Clasificación y extracción de intenciones en pipelines de edge: su capacidad de decidir cuándo no invocar una herramienta (596 aciertos en irrelevancia) reduce falsos positivos en sistemas de enrutamiento automático.
- Prototipado de agentes multi-paso en hardware de consumo: permite validar flujos de llamadas paralelas y paralelas múltiples en un portátil o teléfono antes de escalar a modelos mayores.
- Evaluación comparativa de cuantizaciones: sirve como referencia reproducible (sha256 publicado) para medir el impacto de GPTQ frente a redondeo simple en tareas de tool calling dentro de pipelines de CI.
- Despliegue en dispositivos con NPU Hexagon: integrable con llama.cpp para inferencia acelerada en Qualcomm, con prefill de 4.521 tok/s en pp512.

## Benchmarks y rendimiento

BFCL v4 live, 2.251 prompts, greedy, thinking desactivado, todos los ficheros verificados por sha256 y puntuados en la misma ejecución:

| Fichero | Bytes | Total | Llamadas a herramientas | Sabe cuándo no llamar | Respuestas correctas rotas vs original |
|---|---|---|---|---|---|
| Original bf16 (Qwen/Qwen3.5-0.8B) | — | 1.457 | 769 | 676 | — |
| unsloth Q4_0 | 507.154.688 | 1.250 | 669 | 574 | 336 |
| bartowski Q4_0 | 537.517.152 | 1.193 | 738 | 442 | 395 |
| fraQtl NPU Q4_0 (este repo) | 507.154.336 | 1.367 | 760 | 596 | 201 |

Diferencias pareadas frente a unsloth Q4_0 (cota inferior unilateral al 95 % entre corchetes): total +117 [+82,1], llamadas +91 [+63,9], rechazos +22 [+0,3]. El autor advierte que la cota de rechazos es fina: en la mitad par de los prompts (1.126), la cota de rechazos (−11,1) no supera la guarda del −2 %.

Rendimiento en dispositivo, Snapdragon 8 Elite Gen 6 (SM8975) con backend Hexagon de llama.cpp, media de dos ejecuciones por fichero:

| Fichero | Decode tok/s (tg128) | Prefill tok/s (pp512) | Operaciones rechazadas por la NPU |
|---|---|---|---|
| unsloth Q4_0 | 79,5 | 4.416 | 0 |
| bartowski Q4_0 | 81,6 | 4.365 | 0 |
| fraQtl NPU Q4_0 | 80,0 | 4.521 | 0 |

La dispersión entre ejecuciones es de hasta ±3,9 tok/s en decodificación; el autor concluye que los tres ficheros decodifican a la misma velocidad y con el mismo pico de memoria (≈348 MB).

Pruebas de precisión (MMLU-Pro 12.032, GSM8K, IFEval, EvalPlus; thinking desactivado): sin diferencias significativas frente a unsloth Q4_0 en ningún benchmark. En MMLU-Pro, las respuestas que cambian respecto al original son 4.584 frente a 6.777 de unsloth Q4_0 (excluidos los ítems sin respuesta), y las respuestas correctas rotas son 793 frente a 1.149.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: pico de memoria medido de aproximadamente 348 MB en NPU; el fichero pesa 507.154.336 bytes (≈484 MiB).
- GPU recomendadas: no se especifican en la información disponible; el autor valida CPU y GPU genéricas además de la NPU Hexagon.
- NPU objetivo: Snapdragon 8 Elite Gen 6 (SM8975) con backend Hexagon de llama.cpp; 0 operaciones rechazadas en la validación.
- Cabe en hardware de consumo: sí, es un modelo de 0,8B en Q4_0; el perfil medido corresponde a un teléfono de gama alta.
- Opciones de despliegue: llama.cpp (CLI y backend Hexagon); el autor no documenta vLLM, TGI ni Ollama para este fichero.
- Latencia y throughput: 80,0 tok/s de decodificación (tg128) y 4.521 tok/s de prefill (pp512) en Snapdragon 8 Elite Gen 6; dispersión de hasta ±3,9 tok/s en decodificación.
- Comando de inicio rápido: `llama-cli -hf fraQtl/Qwen3.5-0.8B-NPU-GGUF:Q4_0 -p "Explain what a hash map is in two sentences."`

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BFCL v4 live (total) | Licencia | Formato |
|---|---|---|---|---|---|
| fraQtl NPU Q4_0 (este repo) | 752.393.024 | No disponible | 1.367 | Apache 2.0 | GGUF Q4_0 |
| unsloth Q4_0 (Qwen3.5-0.8B) | 752.393.024 (base) | No disponible | 1.250 | Apache 2.0 | GGUF Q4_0 |
| bartowski Q4_0 (Qwen3.5-0.8B) | 752.393.024 (base) | No disponible | 1.193 | Apache 2.0 | GGUF Q4_0 |
| Qwen3.5-0.8B original (bf16) | 752.393.024 | No disponible | 1.457 | Apache 2.0 | safetensors |

La comparación se limita a variantes del mismo modelo base, que es lo documentado por el autor. No se dispone de datos de benchmarks frente a modelos de otros fabricantes en la misma categoría (0,8B para edge), por lo que esa comparación se considera no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al derivar del modelo base, hereda los sesgos de este, que tampoco se detallan.
- Riesgo de alucinación: no cuantificado en la información disponible; las pruebas de precisión solo comparan contra otras cuantizaciones y el original, no miden tasas absolutas de alucinación.
- Degradación por cuantización: aunque mejora a sus comparadores, rompe 201 respuestas correctas del original en BFCL v4 live y cambia 4.584 respuestas en MMLU-Pro.
- Solidez estadística parcial: la cota inferior de la mejora en rechazos (+0,3) es fina y falla la guarda del −2 % en la mitad par de los prompts (1.126), según reconoce el autor.
- Contexto e idiomas: la longitud de contexto y los idiomas soportados no están disponibles en la información proporcionada; no deben asumirse.
- Solo texto: no hay capacidades de visión ni audio.
- Modo thinking: los benchmarks se ejecutaron con thinking desactivado; no hay datos con thinking activado.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-0.8B y citar la autoría correspondiente.
- Naturaleza del repo: el repo canónico y las "receipts" completas están en `fraQtl/Qwen3.5-0.8B-NPU-GGUF`; este espacio es una redistribución de la comunidad, con 0 descargas y 0 likes en el momento de la consulta.
- Compatibilidad: el rendimiento validado corresponde a una única build del fichero y a un backend concreto (Hexagon); en otras plataformas el comportamiento puede diferir.

## Enlaces

- Hugging Face (este repo): https://huggingface.co/qualcomm-ai-hub-community/Qwen3.5-0.8B-NPU-fraQtl
- Repo canónico del autor: https://huggingface.co/fraQtl/Qwen3.5-0.8B-NPU-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuantización de referencia unsloth: https://huggingface.co/unsloth/Qwen3.5-0.8B-GGUF
- Paper de GPTQ (Frantar et al., 2022): no disponible como enlace en la información proporcionada
- llama.cpp y backend Hexagon: no disponible como enlace en la información proporcionada
