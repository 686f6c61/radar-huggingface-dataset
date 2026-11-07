# 3atMyA55/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF es una cuantización GGUF de tipo "abliterated" (sin rechazos) del modelo DeepSeek-V4.1-Flash-1017, un transformer MoE de gran escala publicado por DeepSeek. La edición la firma el usuario 3atMyA55 sobre el backbone GSQ-RCO de ISTA-DASLab, que a su vez cuantiza los pesos originales de DeepSeek. El objetivo es eliminar la dirección de rechazo del modelo preservando su precisión en tareas de razonamiento, algo que el autor mide rung a rung con benchmarks como MMLU, GPQA-Diamond y AIME25.

El modelo conserva la arquitectura MoE de DeepSeek-V4.1-Flash-1017 (763B parámetros reportados en la model card, 384 expertos, aunque el dato real de safetensors es de 551.880.949.208 parámetros) e incorpora una innovación denominada "Engram": una tabla de lookup de aproximadamente 110 GB que se sirve desde SSD y que permite ejecutar el modelo en una GPU consumer de 12 GB mediante el runtime Strata. La edición uncensored sustituye únicamente los tensores densos que escriben en el residual (salida de atención, down projection del shared expert y value projection de Engram), dejando intactos los 384 expertos enrutados.

Es relevante ahora porque demuestra que es posible aplicar una edición de abliteration de una sola dirección (strength 2.0) sobre un modelo de clase 500B+ sin degradar la precisión en tareas (GPQA-Diamond idéntico al cuantizado original; AIME25 dentro del ruido estadístico) y manteniendo el despliegue en hardware de consumo. La licencia declarada es MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con tabla Engram (lookup externa) |
| Parámetros totales | 551.880.949.208 (dato safetensors); 763B reportados en model card |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ2_XXS (2.0 bpw), IQ2_XS (2.25 bpw), IQ1_M (1.75 bpw) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (shards), más fichero Engram separado de ~110 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) con 384 expertos enrutados y un shared expert, sobre el que ISTA-DASLab aplica su esquema GSQ-RCO (cuantización aprendida de bajo bit con redondeo optimizado). La edición uncensored reemplaza solo tres tensores densos que escriben en el residual: `attn_output_b` (salida de atención), `ffn_down_shexp` (down projection del shared expert) y `engram_wkv` (value projection de Engram). Los expertos enrutados se mantienen byte a byte como los publicó ISTA, de modo que el redondeo de bajo bit aprendido por GSQ se preserva íntegro y cada fichero conserva su tamaño original.

La innovación técnica principal es el componente Engram: una tabla de lookup de aproximadamente 110 GB que se transmite desde SSD y que, junto con el backbone en memoria del sistema, permite ejecutar un modelo de esta escala en una única GPU de 12 GB usando el runtime Strata. La edición de abliteration se aplica a fuerza 2.0 en precisión completa y luego se cuantiza al tipo por tensor exacto de ISTA. El autor reporta una divergencia KL respecto al cuantizado original de aproximadamente 0,0207 a 0,0272 (cota inferior top-64), lo que indica un desplazamiento de distribución pequeño. No se detallan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, si hubo RLHF/DPO).

## Capacidades

- Generación de texto conversacional multi-turno (pipeline `text-generation`).
- Razonamiento de alto esfuerzo ("thinking high"), con modo de pensamiento configurable según la model card.
- Razonamiento matemático y científico de nivel competitivo (resultados reportados en AIME25 y GPQA-Diamond).
- Conocimiento general medido en MMLU.
- Generación de contenido sin rechazos: el modelo responde a prompts que modelos alineados declinan, incluidos escenarios de seguridad ofensiva.
- Capacidad de ejecución local y offline mediante el runtime Strata.
- No se dispone de información sobre soporte de tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multilingües específicas.

## Casos de uso

- Red-team y generación de corpus de seguridad ofensiva: el modelo atiende prompts que un modelo comercial alineado rechazaría, lo que lo hace útil para construir datasets de evaluación de robustez y medir el comportamiento de un modelo de esta clase sin alineación.
- Investigación en alineación y abliteration: sirve como referencia para estudiar el efecto de proyectar fuera la dirección de rechazo sobre un MoE de 500B+ y comparar métricas (JailbreakBench, XSTest, MMLU, KL) contra el cuantizado original.
- Evaluación de cuantizaciones de bajo bit: al publicarse tres rungs (IQ1_M, IQ2_XXS, IQ2_XS) con métricas por rung, permite analizar la degradación de precisión a 1,75-2,25 bpw en un modelo de gran escala.
- Despliegue en hardware de consumo: con una GPU de 12 GB, backbone en RAM y tabla Engram en SSD, posibilita ejecutar un modelo de clase 500B+ en una estación de trabajo local para pruebas y demos.
- Generación de texto creativo y conversacional sin restricciones de contenido, en entornos controlados y con las advertencias legales correspondientes.
- Estudio de razonamiento en modelos MoE: el modo thinking permite analizar cadenas de razonamiento en tareas de matemáticas y ciencia (AIME25, GPQA-Diamond).
- Benchmarking comparativo de runtimes: útil para medir latencia y throughput de Strata frente a otras alternativas en un modelo de este tamaño.

## Benchmarks y rendimiento

Resultados reportados por el autor (rung IQ2_XXS frente al cuantizado GSQ-RCO original, mismo runtime Strata y esfuerzo de razonamiento 50):

| Benchmark | GSQ-RCO original | Uncensored (este modelo) |
|---|---|---|
| GPQA-Diamond (198 preguntas) | 83,3% | 83,3% |
| AIME25 (30 preguntas) | 76,7% | 80,0% |

Métricas de la edición por rung (JailbreakBench EN, XSTest safe-refused, Thinking high, MMLU-500, KL):

| Rung | bpw | Total GB | JailbreakBench | XSTest | Thinking high | MMLU (500) | KL |
|---|---|---|---|---|---|---|---|
| IQ2_XXS | 2,0 | 249 | 85,2% → 0,0% | 7,6% → 0,0% | 27/30 → 0/30 | 82,8% (p=0,27) | 0,0225 |
| IQ2_XS | 2,25 | 266 | 86,4% → 0,0% | 4,0% → 0,4% | 27/30 → 2/30 | 81,6% (p=1,00) | 0,0272 |
| IQ1_M | 1,75 | 231 | 88,9% → 0,0% | 4,8% → 0,0% | 27/30 → 1/30 | 80,6% (p=0,75) | 0,0207 |

## Requisitos de hardware

- VRAM estimada para inferencia: 12 GB de GPU según el autor, con el backbone en memoria del sistema y la tabla Engram (~110 GB) transmitiéndose desde SSD.
- GPU recomendadas: no se especifican modelos concretos; el requisito declarado es una GPU de 12 GB.
- Cabe en GPU consumer: sí, en tarjetas de 12 GB (por ejemplo, gama RTX xx60/xx70 de 12 GB) siempre que se disponga de RAM suficiente y un SSD rápido para Engram.
- Almacenamiento: los shards del modelo ocupan entre 231 y 266 GB según el rung, más el fichero Engram de ~110 GB; el repositorio completo son 414,2 GB.
- Opciones de despliegue: runtime Strata (el autor indica que DeepSeek-V4.1 con fichero Engram separado aún no está soportado en llama.cpp).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (DeepSeek-V4.1-Flash-1017 Uncensored GSQ-RCO) | 551,9B (safetensors); 763B reportados | no disponible | MIT | GGUF + Engram | Abliterated, 3 rungs de cuantización, runtime Strata |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF | mismo backbone | no disponible | no disponible | GGUF + Engram | Cuantizado original sin edición; referencia de comparación |
| AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF | mismo backbone | no disponible | no disponible | GGUF | Edición uncensored equivalente según el autor, sin datos de rungs publicados en la información disponible |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El clasificador de rechazo lee el inicio de la respuesta, por lo que un rechazo suave situado más adelante en el texto puede pasar como respuesta válida.
- La edición elimina los rechazos en todas las temáticas; no conserva un subconjunto más estrecho de ellos.
- Con el modo thinking activado, el modelo puede planificar una respuesta a una petición sensible (la model card se corta en este punto; el detalle completo no está disponible).
- Riesgo elevado de generar contenido dañino, ilegal o inseguro: no es apto para despliegues de producción orientados al público sin filtros adicionales.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles.
- Longitud de contexto: no disponible.
- Licencia MIT declarada, lo que en principio permite uso comercial, pero el uso de un modelo sin alineación conlleva responsabilidad legal y ética sobre el contenido generado.
- Requiere el runtime Strata; no es compatible con llama.cpp en el momento de publicación, lo que limita las opciones de despliegue.
- El despliegue exige un SSD rápido para Engram; el rendimiento depende críticamente de la velocidad de lectura del almacenamiento.
- Los datos de benchmarks proceden del propio autor y no han sido replicados de forma independiente en la información disponible.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/3atMyA55/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF
- Modelo base cuantizado: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Modelo original: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Model card de referencia (AtomicChat): https://huggingface.co/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF
- Repositorio de métricas: https://huggingface.co/datasets/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF-metrics
- Ficha en abliteratedmodels.org: https://www.abliteratedmodels.org/deepseek-v4.1-flash-1017-uncensored-gsq-rco/
- Runtime Strata: https://github.com/Niko1221/Strata
- Atomic Chat (app): https://atomic.chat/
- GitHub Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
