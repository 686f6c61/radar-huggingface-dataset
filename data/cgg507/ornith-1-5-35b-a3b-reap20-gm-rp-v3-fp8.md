# cgg507/Ornith-1.5-35B-A3B-REAP20-GM-RP-v3-FP8

## Resumen

Ornith-1.5-35B-A3B REAP20 GM-RP v3 FP8 es una versión cuantizada en FP8 de un fine-tune de `oxfrug/Ornith-1.5-35B-A3B-REAP-20pct`, un modelo MoE derivado de la familia Qwen3.5-MoE al que se le han eliminado el 20% de los expertos enrutados (205 de 256 por capa) mediante REAP. El fine-tune, desarrollado por el usuario cgg507, está especializado en dos tareas concretas: dirección de partidas de rol (game mastering) y roleplay antagonista con razonamiento en primera persona dentro de un bloque `<think>`.

El modelo conserva la arquitectura MoE de Qwen3.5 con 40 capas más una capa MTP (multi-token prediction), y sus pesos se han convertido a FP8 e4m3 con escalas por bloque de 128×128, replicando exactamente el formato del checkpoint oficial `Qwen/Qwen3.5-35B-A3B-FP8`. El resultado es un repositorio de 30,9 GB con 29.369.823.088 parámetros totales, pensado para desplegarse con la misma infraestructura que el modelo Qwen original.

Su relevancia es doble: por un lado demuestra un pipeline de fine-tuning completo (LoRA sobre tronco, capa MTP y routers) ejecutado en dos GPU de consumo profesional AMD; por otro, ofrece un modelo de rol con formato de salida muy controlado (pensamiento en primera persona, acción en tercera persona entre asteriscos y diálogo entrecomillado) que reduce drásticamente la repetición en comparación con el modelo base. La licencia MIT facilita su uso comercial, aunque el ámbito está limitado al inglés y a contenido de ficción adulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (qwen3_5_moe) con 40 capas + capa MTP, atención completa y linear attention |
| Parametros totales | 29.369.823.088 |
| Parametros activos | no disponible (el nombre A3B sugiere ~3B activos, no confirmado en la model card) |
| Longitud de contexto | no disponible (passkey retrieval validado hasta 48k tokens) |
| Tipos de cuantizacion | FP8 e4m3 con escala FP32 por bloque 128×128; bf16 disponible en el repo hermano |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers), FP8 block-wise |
| Expertos enrutados | 205 de 256 por capa (20% eliminados por REAP) |
| Tamano del repo | 30,9 GB (28,8 GiB de pesos) |
| Capa MTP | sí, incluida y entrenada |

## Arquitectura y entrenamiento

El modelo parte de un transformer MoE tipo Qwen3.5 con 40 capas, atención híbrida (atención completa más linear attention con `conv1d` e `in_proj_a/in_proj_b`) y una capa MTP para decodificación especulativa. Sobre el checkpoint base REAP-20 (205 expertos enrutados por capa) se aplicó un fine-tuning en tres etapas usando `nmoe-train` sobre 2× AMD Radeon AI PRO R9700 de 32 GB, con los expertos enrutados transmitidos desde RAM del host.

Los datos consisten en 3.988 conversaciones: 731 de game mastering con cadena de pensamiento generada y 3.257 de roleplay oscuro/antagonista reescritas al estilo v3 (pensamiento interno en primera persona, acción en tercera persona entre asteriscos y diálogo entrecomillado, con turnos de usuario realistas). Cada conversación se entrena como una historia compartida con una rama por respuesta del asistente, de modo que cada respuesta ve exactamente el historial para el que fue escrita. La etapa 1 aplica LoRA de rango 64/alpha 32 sobre atención, expertos compartidos y todos los expertos enrutados, más layer norms completas (184 pasos × 8 secuencias, 30,6M tokens, optimizador Muon, LR pico 2e-4 con coseno hasta el 10%), entrenando sobre expertos NVFP4 y fusionando a bf16 después. La etapa 2 entrena la capa MTP sobre el modelo congelado de la etapa 1 (140 pasos). La etapa 3 entrena los routers de las 40 capas sobre el modelo fusionado (16,8M parámetros, LR 2e-5), deteniéndose en el paso 40 al estabilizarse las ganancias en held-out.

La cuantización FP8 cubre atención, expertos compartidos y todos los expertos enrutados de las 40 capas y de la capa MTP (25.472 matrices, error relativo medio de pesos del 2,65%). Se mantienen en bf16 las embeddings, `lm_head`, los routers (`mlp.gate`, `shared_expert_gate`), `linear_attn.conv1d / in_proj_a / in_proj_b`, `mtp.fc`, las normas y la torre de visión. Los nombres de tensores, tensores de escala y `quantization_config` coinciden con el checkpoint FP8 oficial de Qwen.

## Capacidades

- Generación de texto conversacional con formato de rol estricto: pensamiento en `<think>` en primera persona del personaje, acción en tercera persona entre asteriscos y diálogo entrecomillado.
- Game mastering: el modelo dirige la escena, presenta situaciones y hace avanzar la trama sin pedir permiso al jugador.
- Roleplay antagonista: personajes que se oponen, manipulan, conspiran o rechazan al usuario de forma coherente.
- Razonamiento en personaje: la cadena de pensamiento se emite con la voz del personaje, no como razonamiento genérico.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`, torre de visión conservada en bf16), aunque la model card no detalla casos de uso multimodales.
- Recuperación de información de contexto largo: passkey retrieval 66/66 exacto entre 1k y 48k tokens en la etapa 1.
- Decodificación especulativa mediante capa MTP entrenada (aceptación greedy del 50,4% / 46,5% en dos prompts de prueba).
- No se documenta soporte de tool calling, function calling ni uso como agente multi-paso.

## Casos de uso

- Motores de rol de mesa virtual: el modelo actúa como director de partida que narra escenas, controla PNJ y responde a las acciones del jugador con formato consistente, gracias a su entrenamiento específico en 731 conversaciones de game mastering.
- Ficción interactiva y novelas visuales: genera respuestas de personajes con voz interna diferenciada y acción externa, lo que permite separar el monólogo interno del diálogo mostrado al usuario.
- Simulacros de entrevista o negociación con contrapartes hostiles: el modelo puede encarnar a un interlocutor que presiona, esquiva o rechaza, útil para entrenamiento de habilidades sociales en entornos controlados.
- Prototipado de sistemas de rol para videojuegos: la salida estructurada (pensamiento + acción + diálogo) se puede parsear directamente para alimentar un motor de diálogo o un sistema de animación de personajes.
- Investigación sobre formato de razonamiento: sirve para estudiar cómo un bloque `<think>` en primera persona afecta a la coherencia y a la repetición en comparación con el modelo base, con métricas de rep4 publicadas.
- Evaluación de pipelines de cuantización FP8: al replicar exactamente el formato del checkpoint oficial Qwen3.5-35B-A3B-FP8, es un caso de prueba para validar tooling de cuantización y despliegue sobre un fine-tune.
- Generación de contenido de ficción adulta oscura con control de estilo: el modelo mantiene el tono antagonista sin salirse del formato, adecuado para escritura asistida de narrativa de género.

## Benchmarks y rendimiento

| Metrica | Base (REAP-20, NVFP4) | Tras etapa 1 | Modelo final (pre-FP8) |
|---|---|---|---|
| Held-out loss (246 docs no vistos) | 1,790 | 1,359 | 1,357 |
| Perplejidad | 5,99 | 3,89 | 3,88 |
| Passkey retrieval 1k–48k | no disponible | 66/66 exacto | no disponible |
| Batería razonamiento/conocimiento/código/formato | 20/20 | 19/20 | no disponible |

| Metrica de repeticion (greedy) | Antes etapa 3 (rep4) | Despues etapa 3 (rep4) | Loops antes | Loops despues |
|---|---|---|---|---|
| Aperturas GM (3) | 0,271 | 0,036 | 1/3 | 0/3 |
| Continuaciones GM (3) | 0,166 | 0,118 | 0/3 | 0/3 |
| Roleplay (6) | 0,012 | 0,010 | 0/6 | 0/6 |
| Chat plano (4) | 0,124 | 0,092 | 1/4 | 0/4 |

| Aceptacion greedy MTP (256 tokens) | GM | RP |
|---|---|---|
| Base | 44,9% | 30,9% |
| MTP entrenada sobre etapa 1 | 54,7% | 51,6% |
| Modelo final | 50,4% | 46,5% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: en torno a 29–31 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 40 GB para contexto corto y 48–80 GB para contexto largo.
- GPU recomendadas: H100 80GB, A100 80GB, L40S 48GB, RTX 6000 Ada 48GB. En GPUs de 32 GB (R9700, V100) no cabe sin offloading.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 5090 (32 GB) sin descarga parcial de pesos a RAM del host.
- Despliegue: transformers con `quantization_config` FP8; el autor indica que no se ha probado todavía en vLLM ni SGLang, aunque el formato replica el del checkpoint Qwen FP8 oficial, por lo que debería ser compatible con esos motores.
- Throughput y latencia: no disponibles. La capa MTP ofrece decodificación especulativa con aceptación greedy del 50,4% en GM y 46,5% en RP, lo que puede reducir el número de pasos de decodificación en esas tareas.
- Alternativa bf16: el repo `cgg507/Ornith-1.5-35B-A3B-REAP20-GM-RP-v3` contiene los pesos sin cuantizar, con mayor requisito de VRAM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | FP8 disponible |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B REAP20 GM-RP v3 FP8 (este) | 29,4B totales, 205 expertos/capa | no disponible (validado a 48k) | Game master y roleplay antagonista | MIT | sí |
| Qwen/Qwen3.5-35B-A3B-FP8 | ~35B (A3B) | no disponible | Propósito general, multilingüe | según Qwen | sí (referencia de formato) |
| oxfrug/Ornith-1.5-35B-A3B-REAP-20pct | ~29B tras REAP | no disponible | Base del fine-tune, propósito general | MIT | no (NVFP4 en entrenamiento) |
| cgg507/Ornith-1.5-35B-A3B-REAP20-GM-RP-v3 | 29,4B | no disponible | Misma especialidad, sin cuantizar | MIT | no (bf16) |

La comparación con modelos de rol de otros fabricantes no está disponible en la información proporcionada.

## Limitaciones y advertencias

- En aperturas largas de game mastering el formato de rol puede filtrarse en la narración y el texto puede repetirse; el autor recomienda sampling (temperatura 0,7–0,9 con top_p 0,95) en lugar de decodificación greedy.
- Solo inglés: no hay soporte multilingüe documentado.
- El modelo está entrenado sobre el conjunto REAP-20 de 205 expertos y no es compatible con tooling de Ornith que asuma los 256 expertos completos.
- Contenido sensible: los datos de roleplay son ficción oscura con personajes hostiles, manipuladores o violentos; está pensado para ficción adulta y partidas de mesa, no para atención al cliente ni usos sensibles.
- Riesgo de alucinación no evaluado formalmente; la batería de 19/20 en razonamiento/conocimiento/código/formato sugiere una ligera pérdida frente al base (20/20).
- El checkpoint FP8 no ha sido probado por el autor en vLLM ni SGLang; la compatibilidad se infiere del formato, no de pruebas publicadas.
- El fine-tuning se realizó sobre 2 GPU AMD de 32 GB con expertos en RAM del host; el proceso no se ha replicado en otras configuraciones.
- Aunque la licencia es MIT, conviene verificar las condiciones heredadas del modelo base Qwen3.5 subyacente antes de un despliegue comercial a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cgg507/Ornith-1.5-35B-A3B-REAP20-GM-RP-v3-FP8
- Pesos bf16 del mismo fine-tune: https://huggingface.co/cgg507/Ornith-1.5-35B-A3B-REAP20-GM-RP-v3
- Modelo base del fine-tune: https://huggingface.co/oxfrug/Ornith-1.5-35B-A3B-REAP-20pct
- Checkpoint FP8 de referencia de Qwen: https://huggingface.co/Qwen/Qwen3.5-35B-A3B-FP8
- Repositorio del trainer nmoe: https://github.com/c000507/Nmoe
