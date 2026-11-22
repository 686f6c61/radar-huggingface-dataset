# shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-4.7GB

## Resumen

Inkling-2-Mini-LookAtMyQuant-4.7GB es una versión cuantizada extrema del modelo base thinkingmachines/Inkling-2-Mini, un transformer de tipo Mixture-of-Experts con 26.400 millones de parámetros físicos y 5.400 millones activos, que emplea un esquema de bucle de tres pasadas (3x-looped MoE) sobre las capas L6-L17. El autor de la cuantización, shinmegamiboson, ha comprimido los 18,89 GB de pesos nativos en BF16 hasta 4,72 GB (4,39 GiB), lo que supone 1,45 bits por parámetro de texto, mediante el compilador LookAtMyQuant y el método de QAT proximal denominado SQYFR v2. El resultado se empaqueta para el runtime MLX de Apple Silicon.

El objetivo declarado es que el modelo quepa dentro del límite de memoria Jetsam de 5,99 GiB de un iPhone con 12 GB de RAM (iPhone Air o iPhone 17 Pro), junto con un drafter especulativo DSpark de 179 MB en 4 bits, alcanzando un pico de decodificación de 5,35 GiB. A pesar de la compresión de 4,0x, el modelo conserva un rendimiento notable: 82,5% en GSM8K, 67,1% estricto en HumanEval y 4 de 4 en pruebas de Vision VQA cuando se le empareja con la torre de visión BF16 original de 637 MB.

La relevancia de esta ficha radica en que documenta una técnica de cuantización agresiva con QAT alineado al modo de razonamiento, orientada a inferencia local en dispositivos móviles Apple. Es una variante de nicho, con cero descargas y cero likes en el momento de la consulta, pero técnicamente ilustrativa de hasta dónde se puede llevar la compresión de un MoE sin colapsar tareas de matemáticas y código.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bucle de 3 pasadas (3x-looped MoE) sobre capas L6-L17; 24 capas lógicas (Prelude L0-5, looped L6-17, Coda L18-23) |
| Parámetros totales | 26.400 millones (físicos) |
| Parámetros activos | 5.400 millones |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Trellis hashed block-vector (ht2, ht3) y row trellis (rtr1, rtr4); 1,45 bits por parámetro de texto; SQYFR v2 proximal QAT |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (runtime LookAtMyQuant / trellis); repo de 4,7 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer Mixture-of-Experts con 26.400 millones de parámetros físicos y 5.400 millones activos, organizado en 24 capas lógicas divididas en Prelude (L0-5), un bloque looped (L6-17) que se recorre tres veces, y Coda (L18-23). La cuantización se realizó con el compilador LookAtMyQuant, que asigna códigos trellis distintos por capa y por bucket de expertos (buckets de uso ordenados [16, 16, 32, 64]), con suelos dedicados para las proyecciones de atención: ht3 o superior en el Prelude y rtr4 o superior en las capas looped y Coda, con un suelo tr2 en el bucket de lm_head (head.7).

El proceso de QAT proximal SQYFR v2 entrenó conjuntamente los 24.460 millones de pesos de expertos MoE, entre 130 y 144 proyecciones densas de atención (QKV, O, o_gate, rel_pos), 38,8 millones de parámetros nativos de steering y las escalas de fila de lm_head y lineales. El entrenamiento se ejecutó sobre 4x B200 con ventanas de 1.024 tokens y una mezcla de datos compuesta por un 35% de rollouts del profesor BF16 alineados en posición 0 con trazas `<|content_thinking|> -> <|content_text|>` (1.450 trazas, peso de pérdida 6,0x en fronteras de control y transición), un 10% de GSM8K de entrenamiento (disjunto del test, sin HumanEval en entrenamiento) y un 55% de TextMix en 13 idiomas. Posteriormente se aplicaron dos proyecciones trellis con Hessiano vivo sobre las 24 capas y 250 pasos de pulido continuo de escalas y steering sin bytes almacenados adicionales.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento matemático: 82,5% en GSM8K (165/200) con `max_new_tokens=1.536` y `reasoning_effort="none"`.
- Generación de código: 67,1% estricto en HumanEval (110/164) con ejecución de `<|content_text|>`.
- Modo de razonamiento (`<|content_thinking|>`): el QAT se alineó explícitamente con trazas de pensamiento del profesor BF16.
- Capacidad de visión: 4 de 4 en pruebas Vision VQA cuando se empareja con la torre de visión BF16 de 637 MB (no incluida en este repositorio).
- Decodificación especulativa: compatible con el drafter DSpark de 179 MB en 4 bits del mismo autor.
- Multilingüismo limitado: el modelo declara únicamente inglés, aunque el entrenamiento incluyó un 55% de TextMix en 13 idiomas.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento multi-paso con agentes.

## Casos de uso

- Inferencia local en iPhone de 12 GB: el modelo está dimensionado para caber bajo el techo Jetsam de 5,99 GiB junto con el drafter DSpark, lo que permite ejecutar un MoE de 26,4B en un teléfono sin conexión a la nube.
- Asistente de matemáticas en dispositivos móviles: con 82,5% en GSM8K, puede resolver problemas aritméticos y algebraicos paso a paso en local, útil en apps educativas offline.
- Generación de código en editor local: el 67,1% estricto en HumanEval permite autocompletar funciones y merge de intervalos en entornos de desarrollo sobre Apple Silicon, integrándose vía la API de Python `runtime_mlx.Runtime`.
- Chat conversacional embebido: el comando `lamq chat` con drafter habilita conversaciones multi-turno en macOS o iOS sin depender de servidores externos.
- Prototipado de cuantización extrema: sirve como referencia reproducible para investigadores que estudien QAT proximal con trellis codes y asignación por sensibilidad KL.
- Pruebas de visión en el borde: emparejado con la torre BF16 de 637 MB, permite VQA en dispositivos Apple con un presupuesto de memoria muy ajustado.
- Evaluación comparativa de compresión: la tabla del autor ofrece puntos de operación de 3,9 a 12,8 GB, útil para medir la curva calidad-tamaño en MoE looped.

## Benchmarks y rendimiento

Resultados publicados por el autor, evaluados sobre el mismo profesor BF16, `openai/gsm8k` (`test[:200]`, greedy, `reasoning_effort="none"`, 1.536 tokens máximos), `openai/openai_humaneval` (164 problemas, ejecución estricta) y 4 pruebas de Vision VQA:

| Modelo | GB texto | bpp | free_KL (en/chat/code) | all13_KL | GSM8K (200) | HumanEval estricto (164) | Vision (4) | Media 3 tareas vs profesor |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Profesor BF16 original | 18,89 | 5,80 | 0,0000 | 0,0000 | 193/200 (96,5%) | 152/164 (92,7%) | 4/4 | 100,0% |
| LookAtMyQuant 12,8 GB | 12,76 | 3,92 | 0,0070 | 0,0268 | 193/200 (96,5%) | 152/164 (92,7%) | 4/4 | 100,0% |
| LookAtMyQuant 11,2 GB | 11,18 | 3,43 | 0,0115 | 0,0400 | 190/200 (95,0%) | 151/164 (92,1%) | 4/4 | 99,3% (98,9% pooled) |
| LookAtMyQuant 8,9 GB | 8,87 | 2,72 | 0,0208 | 0,0571 | 192/200 (96,0%) | 149/164 (90,9%) | 4/4 | 99,2% (98,9% pooled) |
| LookAtMyQuant 5,4 GB | 5,38 | 1,65 | 0,0864 | 0,2773 | 174/200 (87,0%) | 117/164 (71,3%) | 4/4 | 89,0% (84,5% pooled) |
| Este archivo (4,7 GB) | 4,72 | 1,45 | 0,1196 | 0,3988 | 165/200 (82,5%) | 110/164 (67,1%) | 4/4 | 86,0% (79,9% pooled) |
| LookAtMyQuant 3,9 GB | 3,85 | 1,18 | 0,2215 | 0,6335 | 157/200 (78,5%) | 79/164 (48,2%) | 4/4 | 77,8% (68,8% pooled) |

Throughput medido en Apple M5 Max con el runtime LookAtMyQuant MLX: 1.217 tok/s en prefill con T=512, 66,5 tok/s en decodificación serial pico, 98,7 tok/s de mediana con decodificación especulativa sin pérdida y 122,6 tok/s en matemáticas (3,53 tok/check), con 4,68 GB (4,35 GiB) de RAM MLX activa al emparejar el drafter DSpark de 179 MB.

## Requisitos de hardware

- RAM activa estimada: 4,68 GB (4,35 GiB) en MLX con el drafter DSpark; pico de decodificación de 5,35 GiB.
- Encaje en iPhone: dimensionado para el techo Jetsam de 5,99 GiB de iPhone de 12 GB (iPhone Air, iPhone 17 Pro).
- GPU recomendadas: Apple Silicon (M5 Max es la referencia medida); no se documenta soporte para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: no se documenta para GPUs NVIDIA; el empaquetado es específico para MLX.
- Opciones de despliegue: runtime LookAtMyQuant MLX (`pip install git+https://github.com/ShinMegamiBoson/lookatmyquant.git`), CLI `lamq generate` y `lamq chat`, y API Python `runtime_mlx.Runtime`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 1.217 tok/s prefill (T=512), 66,5 tok/s serial, 98,7 tok/s mediana con drafter y 122,6 tok/s en matemáticas sobre M5 Max.
- La torre de visión BF16 (637 MB) no está incluida en este repositorio y debe obtenerse por separado para tareas VQA.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K | HumanEval estricto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (4,7 GB) | 26,4B físicos / 5,4B activos | no disponible | 82,5% | 67,1% | Apache 2.0 | MLX, repo de 4,7 GB |
| LookAtMyQuant 5,4 GB (mismo autor) | 26,4B / 5,4B | no disponible | 87,0% | 71,3% | Apache 2.0 | MLX, repo de 5,4 GB |
| LookAtMyQuant 8,9 GB (mismo autor) | 26,4B / 5,4B | no disponible | 96,0% | 90,9% | Apache 2.0 | MLX, repo de 8,9 GB |
| Profesor BF16 Inkling-2-Mini | 26,4B / 5,4B | no disponible | 96,5% | 92,7% | Apache 2.0 | BF16, 18,89 GB |

No se dispone de datos de benchmarks de modelos de otros autores comparables en la información proporcionada; la comparativa se limita a los puntos de operación de la misma familia LookAtMyQuant y al profesor BF16.

## Limitaciones y advertencias

- El modelo declara únicamente inglés; el multilingüismo no está garantizado pese al 55% de TextMix en 13 idiomas durante el entrenamiento.
- Degradación notable frente al profesor: la media de 3 tareas cae al 86,0% (79,9% pooled) y HumanEval estricto baja 25,6 puntos porcentuales (92,7% a 67,1%).
- El KL en 13 idiomas sube a 0,3988, muy superior al 0,0268 del punto de 12,8 GB, lo que indica deriva lingüística apreciable.
- Riesgo de alucinación no cuantificado en la información disponible; el autor no publica evaluaciones de factualidad.
- Sesgos conocidos: no documentados en la model card.
- Longitud de contexto: no disponible, lo que impide planificar cargas de trabajo de contexto largo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base y la torre de visión deben verificarse por separado.
- Dependencia de un runtime propietario de nicho (LookAtMyQuant MLX) y de Apple Silicon; sin soporte documentado para CUDA, vLLM o llama.cpp.
- La torre de visión BF16 (637 MB) no está incluida; las puntuaciones VQA requieren descargarla aparte.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.
- El empaquetado está calibrado para el techo Jetsam de iPhone de 12 GB; en dispositivos con menos RAM puede producirse terminación por presión de memoria.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-4.7GB
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio del compilador LookAtMyQuant: https://github.com/ShinMegamiBoson/lookatmyquant
- Variante 12,8 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-12.8GB
- Variante 11,2 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-11.2GB
- Variante 8,9 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-8.9GB
- Variante 5,4 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-5.4GB
- Variante 3,9 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-3.9GB
- Drafter DSpark 4 bits: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-drafter
