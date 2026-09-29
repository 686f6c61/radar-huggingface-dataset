# DoktorMincs/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-W4A16-AutoRound

## Resumen

Este repositorio contiene una cuantización de solo pesos en 4 bits (W4A16) del modelo DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, un ajuste fino denso de 27.781.427.952 parámetros sobre la familia Qwen 3.8. La publica DoktorMincs, que no ha entrenado ni modificado el comportamiento del modelo: únicamente ha aplicado AutoRound (llm-compressor 0.14 + auto-round 0.15.1, 400 iteraciones, 256 muestras de calibración) para comprimir los pesos, dejando intactas en BF16 la torre de visión y la cabeza MTP.

El interés técnico del artefacto no está en el modelo en sí, sino en la disección del error de cuantización que documenta su model card. El autor midió la perplejidad en 50 textos retenidos de wikitext-103 (16.007 tokens) y determinó que las proyecciones de atención completa son el mayor contribuyente al daño a 4 bits, seguidas de GatedDeltaNet y del MLP. Al restaurar a BF16 atención y GatedDeltaNet —208 módulos, 208 de los 400 grupos del modelo— la perplejidad baja de 8,7945 a 8,3888 frente a la línea base BF16 de 8,0880, es decir, un degradado del +3,72 % en lugar del +8,74 % de una cuantización completa.

El resultado es un checkpoint de ~30,2 GB (frente a los ~52 GB en BF16) que cumple el objetivo declarado del proyecto de mantenerse por debajo del 5 % de degradado de perplejidad. Es, por tanto, relevante para quien necesite servir un modelo multimodal de 27,8 B con arquitectura híbrida en hardware modesto y quiera una referencia metodológica de qué módulos merece la pena excluir de la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration, híbrida: 64 capas con proporción 3:1 entre GatedDeltaNet (atención lineal) y atención completa; torre de visión ViT de 27 bloques; 1 capa MTP (multi-token prediction) |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Longitud de contexto | 32.768 tokens verificados en la receta de despliegue incluida (el modelo base declara hasta 262.144 tokens; no confirmado para este checkpoint cuantizado) |
| Tipos de cuantizacion | W4A16 int4 simétrico, group_size 128, formato compressed-tensors pack-quantized (uint4b8); solo proyecciones MLP cuantizadas; atención completa, GatedDeltaNet, torre de visión, cabeza MTP, lm_head, embeddings, norms y conv1d en BF16 |
| Idiomas soportados | no disponible (no se declaran en la ficha de HuggingFace ni en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), librería transformers; kernels Marlin en vLLM |
| Tamano del repositorio | 30,2 GB |
| Modulos cuantizados | 192 (mlp.gate_proj, mlp.up_proj, mlp.down_proj × 64 capas) |
| Modulos en BF16 | 208 (self_attn.{q,k,v,o}_proj: 64; linear_attn.{in_proj_qkv,in_proj_z,out_proj}: 144) + torre de visión (333 tensores) + MTP (15 tensores) |
| Modalidades de entrada | Texto, imagen y vídeo (pipeline image-text-to-text) |
| Salida | Texto, con modo de razonamiento (thinking) y parser `qwen3` |

## Arquitectura y entrenamiento

La arquitectura subyacente es `Qwen3_5ForConditionalGeneration`, un transformer híbrido de 64 capas que combina atención lineal GatedDeltaNet y atención completa en una proporción de 3:1, más una torre de visión ViT de 27 bloques y una única capa MTP que actúa como cabeza borrador para decodificación especulativa. No es un modelo MoE: los 27,78 B de parámetros son densos y se activan en cada token.

No ha habido entrenamiento, ajuste fino ni abliteración en este repositorio: es exclusivamente una cuantización de solo pesos. El autor aplicó AutoRound con 400 iteraciones y 256 muestras de calibración de 2.048 tokens procedentes de `neuralmagic/LLM_compression_calibration`, usando la plantilla de chat del propio modelo. La decisión técnica central es quirúrgica: se cuantizaron únicamente las proyecciones MLP y se mantuvieron en BF16 atención completa y GatedDeltaNet, porque las mediciones mostraron que esos grupos concentran la mayor parte del error a 4 bits. La model card advierte que el MLP se ajustó con AutoRound teniendo atención y GatedDeltaNet ya cuantizadas, por lo que una re-cuantización que las excluyera desde el inicio obtendría probablemente un resultado algo mejor. El MLP no se restaura a BF16 de forma deliberada: concentra 17,1 B de los 24,3 B de parámetros cuantizados (70 %) y devolverlo a 16 bits daría un checkpoint de 42 GB, lo que anularía la compresión.

## Capacidades

- Generacion de texto conversacional y de instrucciones, heredada del ajuste fino upstream orientado a seguimiento de instrucciones, razonamiento, análisis y creatividad.
- Modo de razonamiento explícito (thinking): el modelo emite una traza de razonamiento antes de la respuesta visible; requiere `max_tokens` de al menos 1024 para no dejar la respuesta vacía, y parser `--reasoning-parser qwen3` en vLLM.
- Comprensión de imagen y vídeo: la torre de visión de 27 bloques se ejecuta en BF16 y el pipeline declarado es image-text-to-text; el autor confirma visión funcionando en vLLM 0.28.
- Decodificación especulativa con MTP: la cabeza MTP se carga desde el mismo checkpoint y se activa con `--speculative-config '{"method": "mtp", "num_speculative_tokens": 1}'`.
- Generación de código y tareas de análisis, en la medida en que lo soporte el ajuste fino base (el autor del modelo original publica variantes orientadas a código).
- Capacidades multilingües: no disponibles como dato verificado para este checkpoint.
- Modelo sin censura (uncensored/abliterated) según la propia denominación del ajuste fino del que deriva; este repositorio no introduce ni revierte ese comportamiento.
- Soporte de tool calling / function calling y de agentes multi-paso: no se documenta explícitamente en la información disponible.

## Casos de uso

- Servicio de un modelo multimodal de 27,8 B en un nodo de 2 GPU: con `--tensor-parallel-size 2` y 30,2 GB de pesos, el checkpoint se reparte entre dos aceleradores de 24 GB o se sirve en uno solo de 48-80 GB, algo inviable con el BF16 de ~52 GB en muchas configuraciones.
- Procesamiento de documentos con imagen y texto: descripción de capturas, extracción de información de diagramas o resúmenes de vídeo corto aprovechando la torre de visión en BF16, que no sufre degradado de cuantización.
- Asistentes conversacionales de contexto medio: la ventana de 32.768 tokens validada en la receta de despliegue permite sostener diálogos multi-turno con historiales largos o documentos adjuntos de decenas de miles de tokens.
- Razonamiento asistido con traza auditable: el modo thinking resulta útil en tareas de análisis donde interesa inspeccionar el proceso intermedio, con la advertencia de reservar presupuesto de tokens suficiente.
- Generación aumentada con decodificación especulativa: activar MTP con un token borrador reduce la latencia de decodificación en despliegues con concurrencia baja o media, a cambio de memoria adicional.
- Experimentación en investigación sobre cuantización: el checkpoint y su model card sirven como caso de estudio reproducible de qué grupos de módulos concentran el error a 4 bits en arquitecturas híbridas atención lineal/atención completa, con perplejidad medida sobre un corpus retenido.
- Despliegue de bajo ancho de banda de memoria: los pesos cuantizados leen aproximadamente un 40 % menos de bytes por token que la versión BF16 en las capas MLP, lo que se traduce en mayor throughput en escenarios limitados por memoria.
- Base para pipelines internos con contenido sin filtrar: al derivar de un ajuste fino sin censura, puede emplearse en entornos controlados donde los rechazos del modelo base resulten problemáticos, siempre con revisión humana y políticas de uso definidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, ARC) para esta cuantización concreta. La model card únicamente aporta mediciones de perplejidad sobre 50 textos retenidos de wikitext-103 (16.007 tokens evaluados), ejecutadas con vLLM, misma tokenización y mismo procedimiento para todos los modelos:

| Version | Perplejidad | Delta frente a BF16 |
|---|---|---|
| Base BF16 | 8,0880 | — |
| W4A16 completamente cuantizado (sin exclusiones) | 8,7945 | +8,74 % |
| Este build (atención + GatedDeltaNet en BF16) | 8,3888 | +3,72 % |

Desglose del daño por grupo de módulos restaurado a BF16 de forma individual sobre el checkpoint completamente cuantizado, sin re-cuantizar:

| Grupo restaurado a BF16 | Modulos | Perplejidad | Delta | Contribucion al +8,74 % |
|---|---|---|---|---|
| Ninguno (completamente cuantizado) | 0 | 8,7945 | +8,74 % | — |
| Proyecciones GatedDeltaNet | 144 | 8,6289 | +6,69 % | 2,05 pp |
| MLP | 192 | 8,6115 | +6,47 % | 2,27 pp |
| Proyecciones de atención | 64 | 8,5515 | +5,73 % | 3,01 pp |
| Atención + GatedDeltaNet | 208 | 8,3888 | +3,72 % | 5,02 pp |

La model card señala además que este build queda dominado por su hermano de 6 bits de la misma serie (W6A16-AutoRound, 27,6 GB, +2,40 % de degradado), que es más pequeño, más fiel y lee menos bytes por token, y recomienda elegir el W6A16 para servir en producción. Como referencia del ajuste fino upstream, la búsqueda web recoge la afirmación de su autor de superar 730 puntos en ARC-c y 880 en ARC-E en 8 bits (y más de 718 en ARC-c a 4 bits) para la familia del modelo original; son cifras no verificadas de forma independiente y no corresponden a esta cuantización.

## Requisitos de hardware

- Pesos del checkpoint: ~30,2 GB en disco y en memoria (más overhead de runtime y caché KV). El modelo base en BF16 ocupa ~52 GB, y una estimación externa lo sitúa en ~56,31 GB de VRAM en BF16.
- KV cache: no disponible una cifra exacta. La arquitectura híbrida 3:1 reduce el coste de caché respecto a un transformer de atención completa de 64 capas, pero no se publica el consumo medido a 32.768 tokens.
- VRAM estimada para inferencia: unos 32-34 GB para pesos más margen mínimo, y por encima de 40 GB si se quiere contexto largo con concurrencia.
- GPU recomendadas: 2× RTX 4090 / L40S (48 GB agregados) con tensor parallel 2 es la configuración mínima razonable validada por el autor; A100 80 GB, H100 80 GB o L40S 48 GB permiten servir el modelo en un solo dispositivo.
- Cabe en GPU de consumo: no en una sola GPU de 24 GB; sí con reparto en dos GPU de 24 GB (`--tensor-parallel-size 2`). Cuantizaciones GGUF del modelo base permitirían escenarios más ajustados, pero esta build concreta es safetensors y requiere vLLM.
- Opciones de despliegue: vLLM ≥ 0.28 es la ruta validada (kernels Marlin para los 192 módulos empaquetados, BF16 GEMM para los 208 restantes, caché de prefijos, parser de razonamiento `qwen3`, decodificación especulativa MTP y visión). No se documenta compatibilidad con llama.cpp, Ollama, TGI o SGLang para este checkpoint.
- Latencia y throughput: no disponibles. El propio autor indica que el build de 6 bits, al ser más pequeño, decodifica con mejor ancho de banda que este de 4 bits.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Perplejidad (wikitext-103, 50 textos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (W4A16 AutoRound) | 27,78 B | 32.768 validados | safetensors compressed-tensors int4, 30,2 GB | 8,3888 (+3,72 %) | apache-2.0 | HuggingFace, requiere vLLM ≥ 0.28 |
| Mismo modelo, hermano W6A16-AutoRound | 27,78 B | no disponible | safetensors, 27,6 GB | no publicada; degradado declarado +2,40 % | apache-2.0 | HuggingFace (recomendado por el propio autor frente a este) |
| Mismo modelo, W8A16-AutoRound | 27,78 B | no disponible | safetensors 8 bits | no disponible | apache-2.0 | HuggingFace y endpoints (FriendliAI) |
| Modelo base BF16 (DavidAU) | 27,78 B | 262.144 declarados | safetensors BF16, ~52 GB | 8,0880 (referencia) | apache-2.0 | HuggingFace |
| Variante GGUF del upstream (NEO-CODER-MAX-MTP-GGUF) | ~27 B | no disponible | GGUF | no disponible | no disponible | HuggingFace |

No se dispone de datos de benchmarks comparativos frente a modelos de otros autores del mismo rango de tamaño.

## Limitaciones y advertencias

- Es un modelo de razonamiento (thinking): con un `max_tokens` bajo, la traza de razonamiento consume todo el presupuesto y la respuesta visible queda vacía. La model card recomienda un mínimo de 1024 tokens y el endpoint de chat en lugar de la completion cruda.
- Modelo derivado de un ajuste fino "uncensored/heretic" con abliteración: las características de comportamiento, los sesgos y los avisos de uso del upstream siguen aplicándose íntegramente aquí, ya que este repositorio no entrena ni modifica el comportamiento.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad ni de tasas de alucinación para esta cuantización. La degradación medida con perplejidad (+3,72 %) no cuantifica el impacto sobre tareas de razonamiento o generación factual.
- La model card reconoce explícitamente que este artefacto está dominado por su variante de 6 bits, más pequeña y más fiel; elegir la versión de 4 bits solo tiene sentido si se busca específicamente el comportamiento de kernels del MLP cuantizado.
- La cuantización fue quirúrgica sobre un ajuste de AutoRound previo: una re-cuantización con atención y GatedDeltaNet excluidas desde el inicio obtendría presumiblemente mejores resultados.
- Incoherencia aritmética en la model card: afirma que los 208 módulos en BF16 son 20,4 B de parámetros, cifra que no cuadra con los 27,78 B totales ni con los 17,1 B de MLP cuantizado. Se reproduce tal cual y conviene tratarla con cautela.
- El contexto de 32.768 tokens es el valor validado en la receta de despliegue; los 262.144 tokens declarados corresponden al modelo base y no están confirmados para este checkpoint.
- Idiomas soportados no declarados: no hay garantía documentada de cobertura multilingüe más allá de lo que ofrezca el modelo base.
- Licencia apache-2.0 declarada, lo que en principio permite uso comercial, pero al derivar de un modelo sin censura conviene revisar las condiciones del upstream y las obligaciones de atribución.
- Requiere vLLM ≥ 0.28 y kernels Marlin; no hay ruta documentada para llama.cpp u otros motores, lo que limita el despliegue en hardware sin soporte de esas kernels.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DoktorMincs/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-W4A16-AutoRound
- Variante W6A16 de la misma serie: https://huggingface.co/DoktorMincs/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-W6A16-AutoRound
- Variante W8A16 en FriendliAI: https://friendli.ai/models/DoktorMincs/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-W8A16-AutoRound
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Variante GGUF del upstream: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Dataset de calibración: https://huggingface.co/datasets/neuralmagic/LLM_compression_calibration
- Ficha del modelo base con requisitos de VRAM: https://llmrun.dev/model/davidau-qwen3-8-27b-turbo-fable-cold-fusion-735-882-heretic-uncensored-nm-dau
- Ficha del modelo base en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.8-27b-turbo-fable-cold-fusion-735-882-heretic-uncensored-nm-dau-davidau
