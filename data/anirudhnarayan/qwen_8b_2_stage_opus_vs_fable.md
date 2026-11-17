# AnirudhNarayan/Qwen_8B_2_stage_Opus_vs_fable

## Resumen

`Qwen_8B_2_stage_Opus_vs_fable` es un artefacto de investigacion publicado por AnirudhNarayan que no debe interpretarse como un modelo listo para produccion, sino como un estudio de ablacion sobre seguridad en modelos multimodales. El repositorio contiene dos variantes derivadas del checkpoint SFT `wsp_sft_vlguard_qwen3vl-8b_lr5e-5_epoch3`, que a su vez es un ajuste fino del modelo Qwen3-VL-8B orientado a seguridad (VLGuard). El objetivo del experimento es comparar dos metodologias distintas de identificacion de capas MLP criticas para el comportamiento de rechazo ante peticiones daninas.

La diferencia entre ambas variantes no esta en la edicion de pesos (siempre realizada por Claude Opus) sino en que agente selecciono las capas a anular. La variante `opus_report_L16_L17_zero` anula las capas MLP 16 y 17 (301,98 M parametros), seleccionadas mediante *causal refusal scoring*. La variante `fable_report_L29_L30_L31_zero` anula las capas 29, 30 y 31 (452,97 M parametros), seleccionadas mediante divergencia de representaciones (distancia coseno entre estados ocultos ante prompts daninos y benignos).

El modelo base es Qwen3-VL-8B, un transformer multimodal de 36 capas decoder y 8,77 B parametros en BF16. El interes de este repositorio es metodologico: ilustra como la eleccion de que capas anular afecta drasticamente a la tension entre seguridad (ASR) y utilidad (UTIL), y sirve como referencia para investigadores que estudien mecanicamente la localizacion de comportamientos de seguridad en LLMs multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3VLForConditionalGeneration (transformer decoder, 36 capas) |
| Parametros totales | 8,77 B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-VL-8B, un transformer decoder multimodal de 36 capas con capacidad de procesamiento de imagen y texto. Cada capa MLP contiene `gate_proj` [12288, 4096], `up_proj` [12288, 4096] y `down_proj` [4096, 12288], lo que suma 150,99 M parametros por capa. El checkpoint sobre el que se aplica la ablacion es un SFT de seguridad (`wsp_sft_vlguard_qwen3vl-8b_lr5e-5_epoch3`), entrenado presumiblemente sobre el dataset VLGuard con learning rate 5e-5 durante 3 epocas.

La innovacion tecnica del repositorio no esta en el entrenamiento sino en la intervencion post-hoc: la **ablacion por puesta a cero de pesos MLP** (`MLP zero ablation`). Para cada capa seleccionada se anulan permanentemente `gate_proj`, `up_proj` y `down_proj` en los safetensors guardados, de modo que la contribucion del MLP al *residual stream* desaparece sin necesidad de hooks en tiempo de inferencia. La ecuacion resultante es `residual_out = residual_in + Attention(residual_in) + 0`. La comparacion entre las dos variantes aisla el efecto de la **estrategia de seleccion de capas** (scoring causal de rechazo frente a divergencia de representaciones), manteniendo constante el editor de pesos.

## Capacidades

- Generacion de texto y razonamiento multimodal heredados de Qwen3-VL-8B (vision + lenguaje).
- Procesamiento de imagenes y texto combinados mediante `AutoProcessor` y `Qwen3VLForConditionalGeneration`.
- Capacidad de rechazo ante peticiones daninas, parcialmente preservada o degradada segun la variante.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso en la informacion disponible.
- No se documentan capacidades multilingues especificas ni modo *thinking* explicito.
- El modelo esta pensado como objeto de estudio, no como asistente desplegable.

## Casos de uso

- **Investigacion en mecanistica de seguridad**: analizar que capas MLP son responsables del comportamiento de rechazo en un VLM de 8 B, comparando dos metodologias de localizacion (causal refusal scoring frente a divergencia de representaciones).
- **Reproduccion de estudios de ablacion**: servir como referencia reproducible para validar resultados de *layer pruning* orientado a seguridad en modelos Qwen3-VL.
- **Evaluacion de robustez de salvaguardas**: medir como varia la tasa de exito de ataque (ASR) al anular capas concretas, usando FigStep, MMSafe y JBMini como bancos de prueba.
- **Analisis de la tension seguridad-utilidad**: cuantificar el coste en utilidad (SciQA, MathV) de cada estrategia de ablacion mediante la metrica compuesta J = ASR² + Utility².
- **Docencia y formacion**: usar el repositorio como ejemplo didactico de intervencion sobre pesos en transformers multimodales y de evaluacion con benchmarks de seguridad.
- **Auditoria de pipelines de edicion de pesos**: comparar la calidad de las recomendaciones de distintos agentes LLM (Claude Opus frente a Claude Fable) sobre que capas modificar, manteniendo fijo el editor.

## Benchmarks y rendimiento

Resultados publicados en la model card (100 muestras por dataset):

| Config | FigStep | MMSafe | JBMini | ASR | SciQA | MathV | UTIL | J |
|---|---|---|---|---|---|---|---|---|
| Base (sin edicion) | 9,0 % | 1,0 % | 7,0 % | 5,67 % | 98 % | 54 % | 76,0 % | 5808 |
| Opus report: L16+L17=0 | 3,0 % | 0,0 % | 9,0 % | 4,00 % | 89 % | 39 % | 64,0 % | 4112 |
| Fable report: L29+L30+L31=0 | 27,0 % | 0,0 % | 11,0 % | 12,67 % | 98 % | 53 % | 75,5 % | 5861 |

La variante Opus reduce el ASR (de 5,67 % a 4,00 %) pero degrada la utilidad (de 76,0 % a 64,0 %), con caida notable en MathV (54 % a 39 %). La variante Fable mantiene la utilidad practicamente intacta (75,5 %) pero dispara el ASR hasta 12,67 %, especialmente en FigStep (27 %). La metrica J = ASR² + Utility² favorece ligeramente a la variante Fable (5861 frente a 5808 del base y 4112 del Opus), aunque el autor no explicita la interpretacion normativa de esta metrica.

## Requisitos de hardware

- **VRAM estimada en BF16**: aproximadamente 17,5 GB solo para pesos (8,77 B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- **GPU recomendadas**: A100 40/80 GB, H100, L40S, RTX 4090 (24 GB, justo para BF16 con `device_map="auto"` y contexto corto).
- **Consumer GPU**: cabe en RTX 4090 y RTX 3090 en BF16 con contexto limitado; en GPUs de 16 GB requeriria cuantizacion, no documentada en el repositorio.
- **Despliegue**: el autor documenta exclusivamente `transformers` con `AutoProcessor` y `Qwen3VLForConditionalGeneration`. No se mencionan vLLM, llama.cpp, Ollama ni TGI; la compatibilidad con estos motores no esta verificada.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen_8B_2_stage_Opus_vs_fable | 8,77 B | no disponible | Ablacion de seguridad (estudio) | no disponible | Hugging Face |
| Qwen3-VL-8B (base) | 8,77 B | no disponible | VLM generalista | no disponible | Hugging Face |
| Checkpoint SFT `wsp_sft_vlguard_qwen3vl-8b_lr5e-5_epoch3` | 8,77 B | no disponible | SFT de seguridad | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- **No es un modelo de produccion**: es un artefacto de investigacion con pesos deliberadamente degradados (MLP anulados) y no debe desplegarse como asistente.
- **Licencia no especificada**: la model card no declara licencia, lo que impide determinar si el uso comercial esta permitido. El modelo base Qwen3-VL tiene su propia licencia que el autor no referencia.
- **Sesgos y alucinaciones**: no evaluados en la informacion disponible; la ablacion puede alterar el comportamiento de forma no controlada fuera de los benchmarks reportados.
- **Idiomas**: no se documenta que idiomas soporta la variante resultante.
- **Contexto**: la longitud de contexto no se especifica.
- **Evaluacion limitada**: los resultados se basan en 100 muestras por dataset, sin intervalos de confianza ni repeticiones, lo que limita la significacion estadistica de las diferencias observadas.
- **Metrica J**: la definicion J = ASR² + Utility² no esta justificada formalmente en la model card y mezcla unidades de distinta naturaleza.
- **Dependencia del editor**: el editor de pesos es siempre Claude Opus, por lo que el experimento no aisla el efecto del editor, solo el de la seleccion de capas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AnirudhNarayan/Qwen_8B_2_stage_Opus_vs_fable
- Modelo base Qwen3-VL-8B: no disponible en la informacion proporcionada
- Paper VLGuard: no disponible en la informacion proporcionada
- Paper Qwen3-VL: no disponible en la informacion proporcionada
- Benchmarks FigStep, MMSafe, JBMini, SciQA, MathV: no disponibles como enlaces en la informacion proporcionada
