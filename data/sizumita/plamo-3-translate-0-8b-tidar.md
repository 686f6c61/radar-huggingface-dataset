# sizumita/plamo-3-translate-0.8b-tidar

## Resumen

PLaMo 3 Translate 0.8B — TiDAR es un ajuste fino híbrido del modelo de traducción `pfnet/plamo-3-translate-0.8b` de Preferred AI, publicado por el usuario `sizumita`. Su particularidad es que un único conjunto de pesos se entrena de forma conjunta con una pérdida autorregresiva (AR) y una pérdida de difusión enmascarada, de modo que el mismo modelo puede actuar como borrador (modo difusión) y como verificador (modo AR). El objetivo es acelerar la decodificación sin alterar la salida: con el sampler JV incluido, el modelo genera un bloque de 16 tokens en 2 pasos de difusión y lo verifica con una pasada causal, aceptando el prefijo más largo que coincide con su propia predicción AR greedy.

El modelo conserva la arquitectura del modelo base sin modificaciones y cuenta con 890.344.960 parámetros totales. Está especializado en traducción hacia japonés desde inglés, chino y coreano (en/zh/ko→ja), con un corpus de destilación de 0,503B tokens y 9,96M de pares. En float32 la salida emitida es idéntica token a token a la salida AR greedy del propio modelo (verificado en 300/300 frases), con una latencia de 205,3 ms/frase frente a los 300,0 ms/frase del AR puro en la misma plataforma, lo que supone una aceleración de 1,46×.

Es relevante porque demuestra una vía práctica de decodificación especulativa "todo en uno": en lugar de mantener un modelo borrador separado, el mismo modelo se auto-borradorea en modo difusión. La contrapartida es que la ganancia depende de la implementación (script JV con caché KV y `torch.compile`) y que el modo difusión por sí solo es débil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura del modelo base `pfnet/plamo-3-translate-0.8b`, sin modificar); entrenamiento híbrido AR + difusión enmascarada |
| Parametros totales | 890.344.960 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | float32 (canónico, 3,56 GB) y bfloat16 (1,78 GB, incluido en `bf16/`) |
| Idiomas soportados | ja, en, zh, ko (traducción en/zh/ko→ja) |
| Licencia | PLaMo Community License (modelo derivado; ver enlace) |
| Formato de pesos | safetensors (float32 en raíz, bfloat16 en `bf16/`), código custom (`modeling_plamo.py`) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura del `plamo-3-translate-0.8b` sin cambios estructurales. La innovación está en el entrenamiento: una única copia de pesos se optimiza con una combinación 1:1 de pérdida autorregresiva y pérdida de difusión enmascarada, con tamaño de bloque 16. El entrenamiento consistió en una época sobre un corpus de traducción destilado por profesor de 0,503B tokens (9,96M de pares, en/zh/ko→ja), con learning rate 2e-5, schedule coseno y 10.244 pasos.

La consecuencia práctica es que el mismo modelo sirve como borrador y verificador. El sampler JV (draft–verify dentro de un solo modelo) usa γ=16 y S_d=2 pasos de difusión: genera un bloque de 16 tokens candidatos y lo verifica con una pasada causal AR, aceptando el prefijo que coincide con la predicción AR greedy. En float32 el resultado es idéntico al AR greedy del propio modelo. El repositorio incluye `jv_translate.py` como script de inferencia autónomo; el `generate()` estándar solo ejecuta el modo AR (mismo texto en float32, sin aceleración). Se requiere `trust_remote_code=True`, PyTorch 2.8 y transformers 4.57.1.

## Capacidades

- Traducción automática en/zh/ko→ja, con plantilla de chat del modelo base y parámetro `target_lang="ja"`.
- Decodificación especulativa auto-borrador/verificador mediante el sampler JV (γ=16, S_d=2).
- Modo difusión enmascarada para relleno directo de bloques (calidad limitada de forma aislada).
- Generación AR greedy estándar compatible con `transformers` (`AutoModelForCausalLM`).
- Verificación de identidad de salida mediante `--self-check` (compara JV con AR greedy).
- Soporte de precisión float32 y bfloat16.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- Traducción en/zh/ko→ja en producción: el modelo traduce hacia japonés con chrF++ medio de 30,94 en FLORES-200 devtest, adecuado para pipelines de localización con revisión humana posterior.
- Aceleración de inferencia en servidores con GPU: usar el sampler JV con `torch.compile` y caché KV reduce la latencia a 205,3 ms/frase frente a 300,0 ms/frase del AR puro en la misma máquina, útil en servicios de traducción de alto volumen.
- Despliegue en GPU de consumo: los pesos bf16 ocupan 1,78 GB y el proceso fp32 midió 3.590 MiB de pico, por lo que cabe en tarjetas de 8 GB o superiores (validado en RTX 5090).
- Investigación en decodificación especulativa: sirve como banco de pruebas de samplers draft–verify con un solo modelo, comparando identidad de salida y latencia frente al AR greedy.
- Generación de subtítulos y documentación técnica hacia japonés: frases cortas y medias con contexto de bloque de 16 tokens, donde la verificación AR garantiza fidelidad a la predicción greedy.
- Evaluación de calidad de traducción: el script `--self-check` permite auditar que la salida acelerada coincide con la AR, útil en validación de pipelines antes de desplegar.
- Traducción por lotes con precisión controlada: elegir fp32 para identidad garantizada (300/300) o bf16 para menor huella con chrF++ equivalente (31,04 frente a 31,02 en AR).

## Benchmarks y rendimiento

chrF++ (sacrebleu, word_order=2) sobre FLORES-200 devtest, primeras 100 frases por dirección, greedy, máximo 256 tokens nuevos, medido en RTX 5090:

| Direccion | Este modelo fp32 (JV = AR) | Modelo base fp32 AR (referencia) |
|---|---|---|
| en→ja | 33,65 | no disponible |
| zh→ja | 30,92 | no disponible |
| ko→ja | 28,26 | no disponible |
| **Media** | **30,94** | **31,12** |

Rendimiento medido en RTX 5090 (32 GB), float32, batch=1, JV con caché KV y `torch.compile`, subconjunto de 30 frases:

| Metrica | Valor |
|---|---|
| Identidad JV = AR greedy propio | 300/300 frases |
| Latencia JV (γ=16, S_d=2) | 205,3 ms/frase |
| Latencia AR greedy propio (mismo harness, eager) | 300,0 ms/frase |
| Aceleración JV vs AR propio | 1,46× (1,73× vs baseline AR de 356 ms/frase) |
| Tokens de borrador aceptados por ronda (S_d=2) | 2,02 de media (en 1,81 / zh 2,08 / ko 2,20) |
| Memoria GPU pico del proceso | 3.590 MiB |

Versión bf16 (`bf16/`), mismo protocolo:

| Metrica | Valor |
|---|---|
| chrF++ medio JV | 31,04 (en 33,71 / zh 31,17 / ko 28,23) |
| chrF++ medio AR greedy propio | 31,02 |
| Identidad JV = AR greedy propio | 268/300 frases (empates cercanos en bf16; chrF++ sin cambios) |

## Requisitos de hardware

- VRAM estimada: 3.590 MiB de pico medidos con pesos fp32 en RTX 5090; los pesos bf16 ocupan 1,78 GB en disco.
- GPU recomendadas: RTX 5090 (plataforma de medida oficial); cualquier GPU CUDA con al menos 4-5 GB libres para fp32.
- Cabe en GPU de consumo: sí, con 8 GB o más de VRAM; validado en RTX 5090.
- Opciones de despliegue: script `jv_translate.py` incluido (con `--compile` para `torch.compile` y `--dtype bfloat16`); `transformers` estándar con `AutoModelForCausalLM` solo ejecuta el modo AR. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 205,3 ms/frase con JV compilado; 300,0 ms/frase con AR eager; implementaciones eager del mismo sampler midieron 481,6–743,2 ms/frase.
- Throughput: no disponible (solo latencia por frase, batch=1).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | chrF++ medio (FLORES-200) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sizumita/plamo-3-translate-0.8b-tidar | 890M | no disponible | 30,94 (fp32, JV=AR) | PLaMo Community License | Hugging Face |
| pfnet/plamo-3-translate-0.8b (base) | no disponible | no disponible | 31,12 (fp32 AR) | PLaMo Community License | Hugging Face |
| Otras alternativas de traducción en/zh/ko→ja | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modo difusión aislado es débil: el relleno directo sin verificación obtiene chrF++ 21,57 (longitud gold, S_b=4) y repite tokens con frecuencia; su valor es como borrador para JV.
- La aceleración JV requiere el script incluido; `generate()` estándar solo ejecuta AR y no aporta ganancia (aunque en fp32 produce el mismo texto).
- La latencia depende de la implementación: solo la versión con caché KV y `torch.compile` alcanza ~205 ms/frase; las versiones eager midieron 481,6–743,2 ms/frase.
- La precisión importa: float32 es la precisión canónica evaluada; en bf16 la identidad JV=AR baja a 268/300 frases por empates cercanos, aunque el chrF++ no cambia.
- La salida AR no coincide con la del modelo base: coincide en 71/300 frases con el greedy fp32 del base y queda 0,24 de chrF++ por debajo (30,94 frente a 31,12).
- Licencia PLaMo Community License: es un modelo derivado con condiciones específicas para uso y redistribución; revisar el enlace antes de uso comercial.
- Solo traduce hacia japonés (en/zh/ko→ja); no se documentan otras direcciones ni capacidades multilingües generales.
- No se documentan sesgos, riesgo de alucinación ni límites de contexto en la información disponible; tratarlos como no evaluados.
- Creado el 2026-11-10 con 0 descargas y 0 likes: sin validación comunitaria todavía.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sizumita/plamo-3-translate-0.8b-tidar
- Modelo base: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Licencia PLaMo Community (inglés): https://plamo.preferredai.jp/info/plamo-community-license-en
- Script de inferencia JV: `jv_translate.py` (incluido en el repositorio del modelo)
- Código custom del modelo: `modeling_plamo.py` (incluido en el repositorio del modelo)
