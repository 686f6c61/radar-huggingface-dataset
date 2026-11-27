# loom-draft/mradermacher-Goedel-Prover-V2-8B-loom

## Resumen

Goedel-Prover-V2-8B es un modelo de demostración automática de teoremas (theorem proving) de 8.000 millones de parámetros, derivado del modelo base Goedel-Prover-V2-8B y distribuido en formato GGUF por mradermacher. Este repositorio concreto, `loom-draft/mradermacher-Goedel-Prover-V2-8B-loom`, no es un modelo nuevo: es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) que empaqueta el checkpoint GGUF Q4_K_M sin modificarlo, para ejecutarse sobre GPUs AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB).

El problema que resuelve este paquete es de infraestructura, no de modelado: permite servir el modelo GGUF mediante el runtime Loom (`loom-serve`) con una API compatible con OpenAI, sobre hardware AMD, y con mediciones de rendimiento publicadas frente a llama.cpp ROCm. Según la model card, Loom supera a llama.cpp en prefill entre un 40 % y un 48 % y en decodificación entre un 2 % y un 5 % en Strix Halo, con un agregado de 4 streams un 24 % superior.

La relevancia es acotada pero específica: para quien quiera desplegar un prover de 8B cuantizado en GPUs AMD (especialmente APUs Strix Halo con memoria unificada), este paquete ofrece un camino reproducible con comandos de instalación, configuración de pool de memoria y ajustes de espera activa de GPU ya documentados. El modelo subyacente está orientado a la generación de pruebas formales, no a conversación general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo subyacente de 8B; el paquete no detalla la arquitectura interna) |
| Parámetros totales | 8B (según el nombre del checkpoint base) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens en la configuración de llama.cpp de referencia (`-c 65536`); contexto nativo del modelo no disponible |
| Tipos de cuantización | Q4_K_M (checkpoint empaquetado); otras cuantizaciones del base no confirmadas en esta información |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`Goedel-Prover-V2-8B.Q4_K_M.gguf`) empaquetado como artefacto Loom (`.loom` + `model.json`) |

## Arquitectura y entrenamiento

La información proporcionada no describe la arquitectura interna del modelo subyacente (tipo de transformer, composición del dataset, número de tokens de entrenamiento ni si hubo RLHF/DPO). Lo que sí se documenta es la cadena de derivación: el checkpoint original es `mradermacher/Goedel-Prover-V2-8B-GGUF`, cuantizado a Q4_K_M, y este repositorio lo reempaqueta sin modificar para el runtime Loom. El generador utilizado es `loom-next`, que según la tarjeta opera "solo el generador, sin LLM en el bucle".

La innovación técnica destacable de este paquete no está en el modelo sino en el runtime: Loom sirve el preset con `--pool_backing=fixed` (compromiso previo del pool de memoria en lugar de crecimiento elástico) y `--parameter_mode=preload` (carga de pesos en host), y usa `completion_spin_ns=4294967295` para espera activa de finalizaciones de GPU. Las mediciones indican que no hay decodificación especulativa disponible: el GGUF no incluye cabeza MTP y no hay drafter publicado para este modelo exacto.

## Capacidades

- Generación de texto y razonamiento orientado a demostración formal de teoremas (prover), según la naturaleza del checkpoint base Goedel-Prover-V2.
- Tool calling en estilo OpenAI (`tools` y `tool_calls`), marcado como soportado en la tabla de características del paquete.
- API compatible con OpenAI en `/v1/chat/completions`, con parámetro `chat_template_kwargs.enable_thinking` para activar o desactivar el modo de razonamiento (desactivado por defecto en el ejemplo de la tarjeta).
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponibles.
- Razonamiento multi-paso y uso como agente: no documentado explícitamente en la información disponible.

## Casos de uso

- Despliegue de un prover de 8B en APUs Strix Halo: usar `loom-fetch` y `loom-serve` con los comandos documentados permite servir el modelo en memoria unificada sin GPU discreta, con prefill medido de 1.674 tok/s en documentos de 1k tokens.
- Servicio de demostración formal en pipelines de verificación: el modelo puede generar pruebas que se validen contra un comprobador externo (Lean, Isabelle u otro), integrándose vía la API OpenAI del runtime.
- Evaluación comparativa de runtimes en AMD: el paquete sirve como banco de pruebas reproducible (mismo GGUF, mismos prompts, mismo runner) para medir Loom frente a llama.cpp ROCm en gfx1151.
- Atención a desarrolladores que necesitan tool calling: al soportar `tools`/`tool_calls` en estilo OpenAI, puede conectarse a orquestadores de agentes existentes sin adaptadores propietarios.
- Procesamiento por lotes de documentos largos: con contexto configurado a 65.536 tokens y prefill de 964,8 tok/s a 32k, es viable procesar documentos extensos en una sola pasada.
- Servicio multiusuario ligero: con 4 streams el agregado alcanza 163,7 tok/s en Strix Halo, adecuado para un pequeño grupo de investigadores compartiendo la misma máquina.
- Despliegue en Radeon AI PRO R9700: la tarjeta documenta comandos de instalación para gfx1201 con 32 GB, aunque las métricas de rendimiento para esa GPU aún no se han re-medido.

## Benchmarks y rendimiento

Rendimiento del runtime Loom frente a llama.cpp ROCm b1374, mismo GGUF y mismos prompts, en Strix Halo (gfx1151), mediana de 3 sesiones:

| Métrica | llama.cpp | Loom | Margen |
|---|---|---|---|
| Decode tok/s, prompt corto | 42,7 | 44,7 | +5 % |
| Decode tok/s, contexto 2k | 39,8 | 40,6 | +2 % |
| Decode tok/s, contexto 32k | 22,5 | 22,9 | +2 % |
| Prefill tok/s, documento 1k | 1.194,7 | 1.674,2 | +40 % |
| Prefill tok/s, documento 2k | 1.201,3 | 1.727,0 | +44 % |
| Prefill tok/s, documento 8k | 1.045,4 | 1.501,9 | +44 % |
| Prefill tok/s, documento 16k | 874,2 | 1.251,1 | +43 % |
| Prefill tok/s, documento 32k | 651,8 | 964,8 | +48 % |
| 4 streams, decode agregado tok/s | 131,5 | 163,7 | +24 % |
| Decodificación especulativa, tokens aceptados | n/a | n/a | n/a |

No se han publicado resultados de benchmarks del modelo (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las cifras anteriores miden el runtime, no la calidad del modelo. Para Radeon AI PRO R9700 (gfx1201) los resultados "aún no se han re-medido".

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; un checkpoint de 8B en Q4_K_M ocupa aproximadamente 5 GB de pesos, pero la tarjeta no publica la cifra de memoria total del preset.
- GPU soportadas documentadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta soporte para RTX 4090 ni otras GPUs NVIDIA en esta información; el paquete está orientado a AMD.
- Despliegue: runtime Loom (`pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch`, `loom-serve`). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete concreto, aunque llama.cpp ROCm se usa como referencia comparativa.
- Throughput medido (Strix Halo): decode 44,7 tok/s en prompt corto; prefill 1.674,2 tok/s a 1k; agregado de 4 streams 163,7 tok/s.
- Configuración de servicio recomendada en la tarjeta: `--pool_backing=fixed --parameter_mode=preload` y `completion_spin_ns=4294967295`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| loom-draft/mradermacher-Goedel-Prover-V2-8B-loom | 8B | 65.536 configurado | MIT | GGUF Q4_K_M + Loom | Paquete de despliegue para AMD; métricas de runtime publicadas |
| mradermacher/Goedel-Prover-V2-8B-GGUF | 8B | no disponible | MIT (según base) | GGUF | Checkpoint base sin empaquetar; sirve en llama.cpp y otros runtimes GGUF |
| Goedel-Prover-V2-8B (original) | 8B | no disponible | no disponible | safetensors presumiblemente | Modelo de origen antes de la cuantización; datos no confirmados en esta información |

No se dispone de información sobre otros provers comparables (por ejemplo, variantes de DeepSeek-Prover u otros) en los datos proporcionados, por lo que la comparativa de calidad frente a alternativas queda como no disponible.

## Limitaciones y advertencias

- La información sobre el modelo subyacente es mínima: no se documentan arquitectura interna, dataset de entrenamiento, idiomas ni evaluación de calidad.
- El paquete está pensado exclusivamente para GPUs AMD gfx1151 y gfx1201; no hay soporte documentado para NVIDIA ni para otras arquitecturas.
- Las métricas de rendimiento publicadas corresponden a un único entorno (DevLab Dispatch, runner X2-LA03-S03-D07) y la propia tarjeta advierte que los runners difieren entre sesiones, lo que limita la reproducibilidad exacta.
- No hay decodificación especulativa disponible para este modelo (sin cabeza MTP ni drafter publicado), lo que deja latencia sobre la mesa en decodificación.
- El modelo es un prover: no está diseñado para conversación general, y su uso fuera de generación de pruebas formales puede producir resultados pobres o alucinaciones.
- Riesgo de alucinación en demostraciones: las pruebas generadas deben validarse con un comprobador formal externo antes de usarse.
- Sesgos conocidos: no disponible.
- Licencia MIT declarada en el paquete; conviene verificar la licencia del checkpoint base y del modelo original antes de uso comercial en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/mradermacher-Goedel-Prover-V2-8B-loom
- Checkpoint base GGUF: https://huggingface.co/mradermacher/Goedel-Prover-V2-8B-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Ejecución de referencia (DevLab Dispatch): https://github.com/loom-fun/loom-next/actions/runs/45881058763
