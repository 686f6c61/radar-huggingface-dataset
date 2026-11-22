# shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-3.9GB

## Resumen

Inkling-2-Mini-LookAtMyQuant-3.9GB es una cuantización extrema del modelo base `thinkingmachines/Inkling-2-Mini`, un transformer MoE de 26.400 millones de parámetros físicos con 5.400 millones activos y un bucle de tres pasadas sobre las capas L6–L17. La compresión la firma el autor shinmegamiboson mediante su compilador LookAtMyQuant y el procedimiento de QAT proximal denominado SQYFR v2, que reduce los 18,89 GB de pesos de texto en BF16 a 3,85 GB, es decir, 1,18 bits por parámetro de texto y un factor de compresión de 4,9x.

El objetivo declarado es encajar el modelo en dispositivos Apple Silicon de 8 GB de RAM, como un iPhone 15 Pro o iPhone 16 con el límite de memoria ampliado, o un Mac de 8 GB, empaquetado para el runtime MLX. Para ello se apoya en un drafter DSpark de 179 MB en 4 bits y decodificación especulativa sin pérdida, alcanzando 3,54 GiB de memoria activa y 4,57 GiB de pico en decodificación.

La relevancia de esta ficha es doble: por un lado documenta hasta dónde llega la cuantización agresiva sin colapsar por completo el razonamiento (78,5% en GSM8K y 48,2% estricto en HumanEval), y por otro sirve de referencia sobre el coste real de bajar a 1,18 bpp, con una caída notable en código y en KL multilingüe frente al profesor BF16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bucle de 3 pasadas sobre capas L6–L17 (24 capas lógicas, 48 visitas lógicas), enrutamiento fijo con sigmoide indexado por pasada |
| Parámetros totales | 26.400 millones físicos (24.460 millones en pesos de expertos MoE) |
| Parámetros activos | 5.400 millones |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Trellis hashed block-vector (`ht2`, `ht3`), trellis por filas (`rtr1`, `rtr4`), `tr2` en `lm_head`; 1,18 bpp en texto; drafter DSpark en 4 bits |
| Idiomas soportados | inglés (declarado en la model card); evaluación multilingüe sobre TextMix de 13 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (runtime LookAtMyQuant / `trellis`), repo de 3,8 GB |

## Arquitectura y entrenamiento

El modelo base es un MoE con 26.400 millones de parámetros físicos y 5.400 millones activos, donde las capas L6–L17 se recorren tres veces (48 visitas lógicas en total) con enrutamiento fijo sigmoide indexado por número de pasada. La cuantización reparte el presupuesto de bits de forma no uniforme: suelo mínimo `ht3` en las proyecciones de atención del preludio (L0–5), suelo `rtr4` en las capas bucleadas y la coda (L6–23) con al menos 1,45 bpp, y un suelo `tr2` específico para el bucket de cola del `lm_head` (`head.7`). La asignación se decide midiendo la sensibilidad KL por capa y por bucket de experto (16, 16, 32 y 64 expertos ordenados por uso).

El entrenamiento posterior a la cuantización (SQYFR v2) ajusta conjuntamente los 24.460 millones de pesos de expertos, entre 130 y 144 proyecciones densas de atención en formato trellis (QKV, O, o_gate, rel_pos), 38,8 millones de parámetros de steering nativos y las escalas de fila de `lm_head` y lineales. Se ejecutó sobre 4x B200 con ventanas de 1.024 tokens y una mezcla de 35% rollouts del profesor BF16 alineados en posición 0 (`<|content_thinking|>` → `<|content_text|>`, 1.450 trazas, peso de pérdida 6,0x en fronteras de control y transición), 10% del split de entrenamiento de GSM8K (disjunto del test, sin HumanEval en entrenamiento) y 55% de TextMix en 13 idiomas. Después se aplicaron dos proyecciones trellis con Hessiano vivo sobre las 24 capas y 250 pasos de pulido continuo de escalas y steering exactas en P, sin bytes adicionales almacenados.

## Capacidades

- Generación de texto conversacional en inglés, con modo de razonamiento explícito (`<|content_thinking|>`) y salida de contenido (`<|content_text|>`).
- Razonamiento matemático: 78,5% en GSM8K test (157/200) con `reasoning_effort="none"` y 1.536 tokens nuevos como máximo.
- Generación de código: 48,2% estricto en HumanEval (79/164) ejecutando el bloque `<|content_text|>`.
- Capacidades de visión heredadas del profesor: 4/4 en las pruebas de Vision VQA indicadas, aunque este repositorio solo contiene el modelo de texto empaquetado; la torre de visión BF16 de 637 MB se distribuye aparte y no se ha cuantizado.
- Decodificación especulativa sin pérdida mediante el drafter DSpark de 179 MB en 4 bits.
- Soporte de `chat` y `generate` vía CLI `lamq` y API Python (`runtime_mlx.Runtime`), con streaming por chunks.
- Soporte multilingüe evaluado sobre 13 idiomas en TextMix, aunque el idioma declarado oficialmente es solo inglés.
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso en la información disponible.

## Casos de uso

- Inferencia local en iPhone de 8 GB: el modelo cabe en 3,54 GiB activos (4,57 GiB de pico con drafter), por lo que puede ejecutarse en un iPhone 15 Pro o iPhone 16 con `increased-memory-limit` para asistentes conversacionales offline sin conexión.
- Mac de 8 GB como estación de desarrollo: permite cargar el modelo en MLX junto con el drafter y usarlo para prototipado de prompts y evaluación de calidad antes de saltar a una cuantización mayor (5,4 GB u 8,9 GB).
- Razonamiento matemático de baja latencia: con 117,9 tok/s en matemáticas y 128,3 tok/s en matemáticas cortas en un M5 Max, es adecuado para resolver problemas aritméticos y algebraicos paso a paso en aplicaciones educativas o de cálculo asistido.
- Generación de código en entornos con recursos limitados: a 48,2% estricto en HumanEval sirve para autocompletar funciones sencillas y tareas de scripting en editores locales, aceptando una tasa de fallo mayor que la del profesor.
- Asistente de chat multilingüe de bajo coste: la evaluación en 13 idiomas de TextMix permite usarlo en demos de conversación en varios idiomas, aunque con una degradación de KL notable (`all13_KL` = 0,6335) frente al profesor.
- Pruebas de concepto de visión-lenguaje: combinado con la torre de visión BF16 original, mantiene 4/4 en las pruebas de VQA reportadas, útil para demos de descripción de imágenes en dispositivo.
- Investigación en cuantización extrema: sirve como referencia reproducible de hasta dónde se puede comprimir un MoE de 26B con QAT proximal, comparando contra las variantes de 4,7, 5,4, 8,9, 11,2 y 12,8 GB del mismo autor.

## Benchmarks y rendimiento

Resultados reportados por el autor, evaluados con `max_new_tokens = 1.536`, GSM8K `test[:200]` greedy con `reasoning_effort="none"`, HumanEval completo (164 problemas) con ejecución estricta del bloque `<|content_text|>`, 4 pruebas de Vision VQA y ventanas TextMix de 16+13 idiomas.

| Modelo | Texto GB | bpp | `free_KL` (en/chat/code) | `all13_KL` | GSM8K (200) | HumanEval estricto (164) | Vision (4) | Media 3 tareas vs profesor |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Profesor BF16 original | 18,89 | 5,80 | 0,0000 | 0,0000 | 193/200 (96,5%) | 152/164 (92,7%) | 4/4 | 100,0% |
| LookAtMyQuant 12,8 GB | 12,76 | 3,92 | 0,0070 | 0,0268 | 193/200 (96,5%) | 152/164 (92,7%) | 4/4 | 100,0% |
| LookAtMyQuant 11,2 GB | 11,18 | 3,43 | 0,0115 | 0,0400 | 190/200 (95,0%) | 151/164 (92,1%) | 4/4 | 99,3% (98,9% agrupado) |
| LookAtMyQuant 8,9 GB | 8,87 | 2,72 | 0,0208 | 0,0571 | 192/200 (96,0%) | 149/164 (90,9%) | 4/4 | 99,2% (98,9% agrupado) |
| LookAtMyQuant 5,4 GB | 5,38 | 1,65 | 0,0864 | 0,2773 | 174/200 (87,0%) | 117/164 (71,3%) | 4/4 | 89,0% (84,5% agrupado) |
| LookAtMyQuant 4,7 GB | 4,72 | 1,45 | 0,1196 | 0,3988 | 165/200 (82,5%) | 110/164 (67,1%) | 4/4 | 86,0% (79,9% agrupado) |
| **Este fichero (3,9 GB)** | **3,85** | **1,18** | **0,2215** | **0,6335** | **157/200 (78,5%)** | **79/164 (48,2%)** | **4/4** | **77,8% (68,8% agrupado)** |

Rendimiento de inferencia en Apple M5 Max con el drafter DSpark de 179 MB: 1.382 tok/s en prefill con T=512, 75,5 tok/s en decodificación serial, 103,1 tok/s de mediana con decodificación especulativa sin pérdida, 117,9 tok/s en matemáticas y 128,3 tok/s en matemáticas cortas, con 3,81 GB (3,54 GiB) de RAM MLX activa.

## Requisitos de hardware

- VRAM/RAM unificada: 3,81 GB (3,54 GiB) activos en MLX con drafter; 4,57 GiB de pico en decodificación.
- Dispositivos objetivo: iPhone 15 Pro o iPhone 16 con `increased-memory-limit`, y Macs de 8 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (M-series) con runtime MLX; el autor reporta cifras concretas en M5 Max. No se documenta soporte para CUDA, A100, H100 ni RTX 4090 en la información disponible.
- Cabe en GPU de consumo: no hay datos de ejecución en GPU NVIDIA; el formato empaquetado es específico de MLX.
- Opciones de despliegue: runtime LookAtMyQuant (`pip install git+https://github.com/ShinMegamiBoson/lookatmyquant.git`), CLI `lamq generate` / `lamq chat`, API Python `runtime_mlx.Runtime`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 1.382 tok/s prefill (T=512), 75,5 tok/s serial, 103,1 tok/s con drafter en M5 Max.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K | HumanEval estricto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Inkling-2-Mini-LookAtMyQuant 3,9 GB (este) | 26,4B físicos / 5,4B activos, 1,18 bpp | no disponible | 78,5% | 48,2% | Apache 2.0 | MLX, Apple Silicon 8 GB |
| Inkling-2-Mini-LookAtMyQuant 5,4 GB | 26,4B físicos / 5,4B activos, 1,65 bpp | no disponible | 87,0% | 71,3% | Apache 2.0 | MLX |
| Inkling-2-Mini-LookAtMyQuant 8,9 GB | 26,4B físicos / 5,4B activos, 2,72 bpp | no disponible | 96,0% | 90,9% | Apache 2.0 | MLX |
| Profesor BF16 `thinkingmachines/Inkling-2-Mini` | 26,4B físicos / 5,4B activos, 5,80 bpp | no disponible | 96,5% | 92,7% | Apache 2.0 | BF16, 18,89 GB |

No se dispone de datos de benchmarks de modelos de otros autores comparables en la información proporcionada.

## Limitaciones y advertencias

- Degradación severa en código: HumanEval estricto cae del 92,7% del profesor al 48,2%, lo que hace esta variante poco fiable para generación de código en producción.
- Divergencia de distribución notable: `free_KL` de 0,2215 en en/chat/code y `all13_KL` de 0,6335, muy por encima de las variantes de 4,7 GB o más.
- Idiomas: la model card solo declara inglés; el multilingüe se evalúa pero no se garantiza calidad.
- Visión: el repositorio contiene únicamente el modelo de texto empaquetado; la torre de visión BF16 de 637 MB no está cuantizada y debe obtenerse por separado.
- Dependencia de runtime propietario del autor (LookAtMyQuant + MLX): no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, lo que limita el despliegue en servidores CUDA.
- Riesgo de alucinación: no se documenta ninguna evaluación de factualidad ni de tasas de alucinación; con 1,18 bpp la fidelidad del profesor no está garantizada fuera de los benchmarks reportados.
- Sesgos: no se documenta ningún análisis de sesgos en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y la procedencia de los datos de entrenamiento deben verificarse por separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente de los resultados reportados.
- Fecha de creación del repositorio: 22 de noviembre de 2026.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-3.9GB
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio LookAtMyQuant: https://github.com/ShinMegamiBoson/lookatmyquant
- Variante 12,8 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-12.8GB
- Variante 11,2 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-11.2GB
- Variante 8,9 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-8.9GB
- Variante 5,4 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-5.4GB
- Variante 4,7 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-4.7GB
- Drafter DSpark 4 bits: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-drafter
