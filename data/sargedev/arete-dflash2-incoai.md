# SargeDev/arete-dflash2-incoai

## Resumen

Arete DFlash2 Drafter (identificador `SargeDev/arete-dflash2-incoai`) es un modelo borrador (draft model) de 1.924.404.480 parámetros diseñado para decodificación especulativa con el método DFlash2. Lo desarrolla SargeDev como un ajuste fino del borrador `incoai/Qwen3.8-27B-DFlash2` (a su vez derivado de `z-lab/Qwen3.8-27B-DFlash2`), y su función es proponer tokens candidatos que un modelo verificador de mayor tamaño valida en una sola pasada forward. No es un modelo generativo autónomo: es un acelerador de inferencia que se acopla a un modelo objetivo.

El modelo está pensado para la familia Arete-27B (tanto la variante censurada original de NousResearch como la build sin censura de SargeDev) y también funciona sobre Qwen3.8-27B. La propuesta de valor es un speedup sin pérdida: según la model card, la salida con decodificación especulativa es idéntica a la del modelo objetivo sin borrador (verificación greedy 5/5 en todas las combinaciones probadas). Se distribuye en formato safetensors con licencia Apache-2.0 y un tamaño de repositorio de 3,8 GB.

El interés actual reside en que la decodificación especulativa se ha consolidado como la técnica estándar para reducir la latencia en serving de LLM sin degradar la calidad, y este borrador está empaquetado en el formato de exportación de z-lab (`DFlash2DraftModel` más `dflash_config`), lo que lo hace conectable directamente a la configuración `--speculative-config` de vLLM 0.28.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash2 draft model (modelo borrador para decodificación especulativa); arquitectura interna del transformer no detallada en la información disponible |
| Parametros totales | 1.924.404.480 (1,92B) |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; la model card no detalla cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (borrador base); el modelo objetivo Arete-27B es cc-by-nc-4.0 |
| Formato de pesos | safetensors, en formato de exportación z-lab (`DFlash2DraftModel` + `dflash_config`) |

## Arquitectura y entrenamiento

El modelo es un borrador DFlash2 de 1,92B parámetros que opera junto a un verificador de mayor tamaño. En cada bloque de decodificación especulativa el borrador propone un bloque de tokens (7 tokens por bloque según la configuración recomendada) y el verificador los puntúa en una única pasada forward, aceptando un prefijo. El resultado es un speedup sin pérdida: la salida es idéntica a la del modelo objetivo sin borrador. El paquete sigue el formato de exportación de z-lab y se integra como `--speculative-config` en vLLM.

El ajuste fino se realizó durante 7 épocas sobre datos regenerados on-policy a partir de Arete-27B-Uncensored: 6.903 filas generadas on-policy (con las filas de bucle en cuarentena), extrayendo hidden states de las capas 6, 20, 34, 48, 62 y 64 del modelo objetivo. El corpus pertenece a la línea `SargeDev/jev-distill-corpus-v3`. El entrenamiento se llevó a cabo con el trainer `vllm-project/speculators` 0.9.0a0, tipo de speculator DFlash2, sobre un clúster de 2x GB10 con vLLM 0.28.

## Capacidades

- Decodificación especulativa: propone bloques de 7 tokens que el verificador valida en una pasada, con speedup sin pérdida de calidad (salida idéntica al objetivo sin borrador).
- Compatibilidad drop-in con vLLM 0.28 mediante `--speculative-config` con `"method": "dflash"`.
- Compatibilidad verificada con tres objetivos: Arete-27B-Uncensored (build bf16 de SargeDev), Arete-27B (versión censurada original de NousResearch) y Qwen3.8-27B.
- Transferencia cruzada entre modelos: el borrador mantiene buenas tasas de aceptación incluso sobre el Qwen3.8-27B base, pese a haberse ajustado sobre datos de Arete-27B-Uncensored.
- No genera texto de forma autónoma: no es un modelo de chat, razonamiento, código ni visión por sí mismo; hereda las capacidades del verificador al que se acopla.
- No dispone de tool calling, capacidades de agente ni multilingües propias; estas dependen exclusivamente del modelo objetivo.

## Casos de uso

- Serving de baja latencia con Arete-27B: desplegar el verificador Arete-27B con este borrador en vLLM reduce el tiempo por token al aceptar una media de 2,97 tokens por bloque (tasa de borrador del 28,2%), manteniendo la salida idéntica.
- Serving de la build sin censura Arete-27B-Uncensored: es el objetivo con el que se entrenó el borrador y donde rinde mejor dentro de la familia Arete, con una longitud de aceptación de 3,00 tokens por bloque (28,6%).
- Aceleración de Qwen3.8-27B en producción: el borrador logra su mejor tasa sobre este objetivo (3,80 tokens aceptados por bloque, 40,0%), lo que lo convierte en una opción directa para reducir latencia en despliegues existentes de Qwen3.8-27B.
- Reducción de coste por token en endpoints de alta concurrencia: al aumentar los tokens aceptados por pasada del verificador, se reduce el número de forwards necesarios del modelo grande, bajando el coste computacional por respuesta generada.
- Despliegue en infraestructura GB10: el par borrador-verificador está validado en clústeres de 2x GB10 con vLLM 0.28, lo que permite reproducir el setup de referencia del autor.
- Experimentación con decodificación especulativa: sirve como caso de estudio de transferencia cruzada de borradores DFlash2 entre modelos de la misma familia, útil para equipos que investigan técnicas de aceleración de inferencia.
- Integración en pipelines de evaluación comparativa: permite medir el impacto de la decodificación especulativa sobre la latencia manteniendo la losslessness greedy como criterio de validación.

## Benchmarks y rendimiento

Resultados publicados en la model card (vLLM 0.28, GB10, un único objetivo servido; bloques de 7 tokens, greedy; losslessness greedy 5/5 en todas las combinaciones):

| Borrador | Objetivo | Longitud de aceptación | Tasa de borrador |
|---|---|---|---|
| incoai | Arete-27B-Uncensored | 3,00 | 28,6% |
| incoai | Arete-27B (censurado) | 2,97 | 28,2% |
| incoai | Qwen3.8-27B | 3,80 | 40,0% |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo que es coherente con la naturaleza del modelo: al ser un borrador lossless, su calidad se mide por la identidad de salida con el verificador y por la longitud de aceptación, no por benchmarks de tareas.

## Requisitos de hardware

- VRAM estimada para el borrador: aproximadamente 3,8 GB en el formato safetensors publicado (1,92B parámetros); el requisito total del despliegue lo domina el modelo verificador de 27B.
- GPU recomendadas: el autor valida el setup en clústeres de 2x GB10 con vLLM 0.28; para el verificador de 27B se requiere hardware de clase数据中心 (A100, H100, H200) o múltiples GPU consumer de gama alta.
- GPU consumer: el borrador por sí solo cabe en cualquier GPU consumer con más de 4 GB de VRAM, pero el verificador de 27B en bf16 (aproximadamente 54 GB de pesos) no cabe en una sola GPU consumer; requiere cuantización o reparto entre varias GPU.
- Opciones de despliegue: vLLM 0.28 o superior con `--speculative-config '{"method": "dflash", "model": "SargeDev/arete-dflash2-incoai", "num_speculative_tokens": 7}'`. No se documentan integraciones con llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no se publican cifras absolutas de latencia o throughput; el beneficio se expresa como longitud de aceptación (2,97-3,80 tokens por bloque de 7) y tasa de borrador (28,2%-40,0%).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SargeDev/arete-dflash2-incoai | 1,92B | no disponible | Borrador DFlash2 para Arete-27B y Qwen3.8-27B | Apache-2.0 (borrador) | Hugging Face |
| incoai/Qwen3.8-27B-DFlash2 | 1,92B (según model card) | no disponible | Borrador DFlash2 base del que deriva este ajuste | no disponible | Hugging Face |
| z-lab/Qwen3.8-27B-DFlash2 | no disponible | no disponible | Borrador DFlash2 original de z-lab | no disponible | Hugging Face |

La comparativa relevante es dentro de la propia cadena de borradores DFlash2: este modelo es un ajuste fino del borrador de incoai sobre datos de Arete-27B-Uncensored, y la model card afirma que es la combinación más fuerte en todos los objetivos probados, incluido el Qwen3.8-27B base. No se dispone de datos de otros borradores comparables (por ejemplo, borradores EAGLE o Medusa) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: no puede usarse para generación de texto, chat, código o razonamiento sin un verificador compatible; su salida solo tiene sentido dentro del pipeline de decodificación especulativa.
- Dependencia estricta del objetivo: el rendimiento (longitud de aceptación) varía según el verificador; está optimizado para Arete-27B-Uncensored y degrada ligeramente sobre Arete-27B censurado (2,97 frente a 3,00).
- Licencia del objetivo: aunque el borrador es Apache-2.0, Arete-27B es cc-by-nc-4.0 y la build sin censura de SargeDev sigue la licencia de su base, lo que restringe el uso comercial del conjunto verificador-borrador en esos objetivos.
- Contenido sin censura: el borrador se ajustó sobre datos de una build sin censura (Arete-27B-Uncensored); aunque el borrador no genera contenido por sí mismo, el objetivo sin censura puede producir salidas no filtradas.
- Idiomas y contexto: no se documentan idiomas soportados ni longitud de contexto del borrador; ambos dependen del verificador.
- Riesgo de alucinación: no aplica directamente al borrador (la decodificación es lossless respecto al verificador), pero se hereda íntegramente del modelo objetivo.
- Madurez y adopción: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y el modelo se creó en noviembre de 2026; no hay evidencia de uso en producción fuera del entorno del autor.
- Compatibilidad de versiones: validado con vLLM 0.28 y el trainer speculators 0.9.0a0; versiones distintas de vLLM pueden no soportar el método `dflash` o el formato de exportación z-lab.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SargeDev/arete-dflash2-incoai
- Borrador base (incoai): https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Borrador original de z-lab: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Objetivo sin censura: https://huggingface.co/SargeDev/Arete-27B-Uncensored-V2
- Objetivo censurado original: https://huggingface.co/NousResearch/Arete-27B
- Objetivo Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Trainer speculators: https://github.com/vllm-project/speculators
- Corpus de entrenamiento (linaje): `SargeDev/jev-distill-corpus-v3` (referenciado en la model card; no se proporciona URL directa)
