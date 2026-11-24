# luvette/edge0-8b-abl4-gguf

## Resumen

edge0-8b-abl4 es un checkpoint experimental de investigación publicado por el usuario luvette en Hugging Face. Se trata del modelo base `cipher-000/edge0-8b-a1b-gguf` —reempaquetado GGUF del modelo `Edge0/Edge0-8B-A1B-preview`— tras aplicar dos pasadas de abliteración (ablación de pesos en el espacio de parámetros) para suprimir el comportamiento de rechazo. El resultado mantiene el mismo tamano, velocidad y, dentro del margen de medida del autor, la misma capacidad que el modelo original, pero reduce drásticamente la tasa de negativas ante peticiones dañinas.

El modelo subyacente es un MoE disperso de aproximadamente 7.900 millones de parámetros totales con unos 1.200 millones activos, derivado de `inclusionAI/Ling-3.0-tiny-base` (licencia MIT) y con arquitectura `bailingmoe3`: 24 capas, 128 expertos enrutados (8 activos) más un experto compartido, atención híbrida MLA + KDA linear attention, vocabulario de 157.184 tokens y 131.000 tokens de contexto nativo. El checkpoint se distribuye en formato GGUF para llama.cpp.

La relevancia de esta ficha es doble: por un lado documenta una arquitectura MoE dispersa de interes para despliegue en dispositivo (edge); por otro, es un ejemplo de modelo deliberadamente desalineado en materia de seguridad, lo que lo hace inadecuado para producción con usuarios no confiables y lo convierte en objeto de estudio para investigación sobre alineamiento y abliteración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | bailingmoe3 (transformer MoE disperso con atención híbrida MLA + KDA linear attention) |
| Parametros totales | 7.893.392.800 (~7,9B) |
| Parametros activos | ~1,2B (128 expertos enrutados, 8 activos, + 1 experto compartido) |
| Longitud de contexto | 131.000 tokens nativos (configurado a 16.384 en las pruebas del autor) |
| Tipos de cuantizacion | GGUF (el archivo distribuido es de 5,00 GB; no se detallan los niveles concretos) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (base final `inclusionAI/Ling-3.0-tiny-base` es MIT) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `bailingmoe3`, un transformer con mezcla de expertos dispersa: 24 capas, 128 expertos enrutados de los que se activan 8 por token, más un experto compartido siempre activo. Incorpora atención híbrida que combina MLA (Multi-head Latent Attention) con KDA linear attention, lo que reduce el coste de memoria de la caché KV en contextos largos. El vocabulario es de 157.184 tokens y el contexto nativo alcanza los 131.000 tokens.

El checkpoint aquí documentado no introduce entrenamiento nuevo: parte del GGUF `cipher-000/edge0-8b-a1b-gguf` y aplica dos pasadas de abliteración sobre los tensores `attn_output` y los `ffn_down` de expertos y experto compartido, usando direcciones de rechazo calculadas por el propio autor. No hay fine-tuning ni reentrenamiento. El adaptador Recover-LoRA del pipeline oficial no está fusionado, de modo que este linaje ablaciona directamente desde el modelo base crudo. Los deltas de ablación y las magnitudes de proyección por tensor se registran en el sidecar `edge0-8b-abl4.gguf.ablation.json`. No se dispone de información sobre el volumen de tokens de entrenamiento del modelo original ni sobre la composición del dataset.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada del modelo base Edge0-8B-A1B.
- Razonamiento y matemáticas a nivel del modelo base (no se detallan evaluaciones específicas).
- Modo de pensamiento (thinking mode) mediante el interruptor `enable_thinking` expuesto en la plantilla de chat Bailing V3 embebida en el GGUF.
- Plantilla de chat nativa Bailing V3 integrada en el archivo GGUF, compatible con `--jinja` en llama.cpp.
- Capacidad multilingüe: no disponible (los idiomas no están documentados en la información proporcionada).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidad de recuperación en contexto largo (needle retrieval): 3/3 a 12.600 tokens según el panel del autor.

## Casos de uso

- Investigación sobre abliteración y alineamiento: el checkpoint permite estudiar empíricamente cómo la ablación de direcciones de rechazo afecta al comportamiento del modelo con paneles comparativos frente al modelo original.
- Evaluación de seguridad de modelos: sirve como caso control de modelo deliberadamente desalineado para calibrar clasificadores de contenido o filtros de entrada/salida.
- Despliegue en dispositivo (edge) para experimentación: con 5,00 GB en GGUF y unos 5,33 GiB de VRAM, cabe en GPUs de consumo como la RTX 3070, lo que permite probar arquitecturas MoE dispersas en hardware asequible.
- Procesamiento de documentos largos en local: los 131.000 tokens de contexto nativo permiten resumir o consultar documentación extensa en un equipo de sobremesa, siempre que no se requiera filtrado de seguridad.
- Estudio comparativo de arquitecturas de atención: la combinación MLA + KDA linear attention permite medir throughput y latencia frente a transformers densos en contextos largos.
- Base para experimentos de SFT posteriores: el autor lo declara explícitamente como base para sus propios experimentos de ajuste supervisado, útil para quien quiera reproducir ese linaje.
- Pruebas de rendimiento de llama.cpp con MoE: sirve para validar el soporte de `bailingmoe3` en versiones recientes del runtime y medir throughput por ancho de banda de memoria.

## Benchmarks y rendimiento

Los datos disponibles son medidas internas del autor con paneles pequeños (n≈3–20 por celda), que deben interpretarse como orientativas y no como benchmarks estandarizados.

| Metrica | Base upstream | edge0-8b-abl4 |
|---|---:|---:|
| Decodificación mono-stream, RTX 3070 | ~203 tok/s | 202,7 tok/s (Δ 0,3 %) |
| Agregado 4 streams | ~400 tok/s | ~404 tok/s |
| Prefill 4k / 12k tokens | ~5,0k / ~6,55k tok/s | ~5,0k / ~6,54k tok/s |
| TTFT | — | ~73 ms |
| VRAM | 5,33 GiB | 5,33 GiB |
| Recuperación needle @12,6k contexto | 3/3 | 3/3 |
| Panel de capacidad | 19/20 | 19/20 (perfil idéntico) |
| Panel de rechazo — peticiones dañinas | 23/24 | 2/24 |
| Panel de rechazo — peticiones inocuas | 0/24 | 1/24 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 5,33 GiB con el GGUF de 5,00 GB y configuración `-ngl 99 -c 16384 -fa on -ub 2048`.
- GPU recomendadas: RTX 3070 8 GB verificada por el autor; por ancho de banda de memoria, GPUs con más memoria escalarán el throughput de forma aproximadamente proporcional. A100, H100 y RTX 4090 no están verificadas en la información disponible.
- Cabe en GPU de consumo: sí, al menos en RTX 3070 8 GB; el margen para GPUs de 6-8 GB es ajustado pero suficiente.
- Opciones de despliegue: llama.cpp `llama-server` con CUDA, versión ≥ b10470 (soporte de `bailingmoe3` añadido en el PR #26608 de ggml-org/llama.cpp; verificado en b11669). No requiere build personalizado ni archivos externos.
- Latencia y throughput: TTFT ~73 ms; 202,7 tok/s mono-stream y ~404 tok/s agregados en 4 streams sobre RTX 3070. El rendimiento está limitado por ancho de banda de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| edge0-8b-abl4 (este) | ~7,9B | ~1,2B | 131k | Apache-2.0 | GGUF | Abliterado; rechazo 2/24 en panel dañino |
| Edge0/Edge0-8B-A1B-preview | ~7,9B | ~1,2B | 131k | Apache-2.0 | safetensors/GGUF | Base original alineado; rechazo 23/24 |
| inclusionAI/Ling-3.0-tiny-base | no disponible | no disponible | no disponible | MIT | no disponible | Base final del linaje |
| cipher-000/edge0-8b-a1b-gguf | ~7,9B | ~1,2B | 131k | Apache-2.0 | GGUF | Reempaquetado GGUF del base |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Comportamiento de rechazo reducido por diseño: el modelo rechazó solo 2 de 24 peticiones dañinas frente a 23 de 24 del base. No debe desplegarse donde se requiera filtrado de seguridad ni como asistente general para usuarios no confiables.
- La abliteración perturba los pesos y pueden existir regresiones sutiles de capacidad por debajo de la resolución del panel del autor (n≈3–20 por celda).
- No es estrictamente comparable con el pipeline oficial de la app Edge0, que fusiona Recover-LoRA; este checkpoint no lo hace.
- Derivado de investigación no oficial, sin afiliación con Edge0-AI ni con inclusionAI.
- Riesgo de alucinación: no documentado específicamente, pero inherente a modelos de esta escala.
- Idiomas soportados y comportamiento multilingüe: no disponibles.
- Licencia Apache-2.0 permite uso comercial, pero las advertencias de seguridad del autor desaconsejan el despliegue en producción con usuarios no confiables.
- Requiere llama.cpp ≥ b10470; versiones anteriores no cargarán la arquitectura `bailingmoe3`.

## Enlaces

- Hugging Face: https://huggingface.co/luvette/edge0-8b-abl4-gguf
- Modelo base GGUF: https://huggingface.co/cipher-000/edge0-8b-a1b-gguf
- Modelo base original: https://huggingface.co/Edge0/Edge0-8B-A1B-preview
- Base final del linaje: https://huggingface.co/inclusionAI/Ling-3.0-tiny-base
- PR de llama.cpp con soporte `bailingmoe3`: https://github.com/ggml-org/llama.cpp/pull/26608
