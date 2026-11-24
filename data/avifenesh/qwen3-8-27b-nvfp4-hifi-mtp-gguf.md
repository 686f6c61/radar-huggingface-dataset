# Avifenesh/Qwen3.8-27B-NVFP4-HiFi-MTP-GGUF

## Resumen

Qwen3.8-27B-NVFP4-HiFi-MTP-GGUF es una cuantización de alta fidelidad del modelo Qwen/Qwen3.8-27B, publicada por el usuario Avifenesh. Se distribuye en formato GGUF con pesos NVFP4 (formato de coma flotante de 4 bits de NVIDIA) y un cabezal MTP (multi-token prediction) embebido que actúa como modelo borrador para decodificación especulativa. El archivo pesa 16,59 GB y está pensado para ejecutarse en GPUs Blackwell (sm_100, sm_120, sm_121) mediante llama.cpp.

La propuesta del autor es ofrecer una alternativa NVFP4 con mayor fidelidad respecto a BF16 que las cuantizaciones NVFP4 convencionales, mediante escalas por tensor en FP32 (potencias de dos) y una búsqueda de escalas de bloque ponderada por imatrix. Según sus mediciones, la divergencia KL frente a BF16 es de 0,0647 en wikitext-2 (media) y 0,0206 en código, frente a 0,0843 y 0,0323 del build NVFP4 estándar del mismo autor.

El modelo base es un transformer de 27.320.698.266 parámetros (~27,3 mil millones), con licencia Apache 2.0. La ficha se centra en las características del artefacto cuantizado y en los datos publicados en su model card; los detalles de entrenamiento del modelo base no se incluyen en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.8-27B); cuantización NVFP4 con capas selectivas Q6_K y Q5_K |
| Parametros totales | 27.320.698.266 (~27,3 mil millones) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible (las evaluaciones publicadas solo cubren hasta 4.096 tokens) |
| Tipos de cuantizacion | NVFP4 (mayoría del tronco), Q6_K con imatrix (atención q/k/v/o y ssm_out en capas 0-15, 20-31 y 44-55; ffn_up y ffn_down en capas 56-63), Q5_K (embedding y LM head); bloque MTP en NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `Qwen3.8-27B-NVFP4-HiFi-mtp.gguf`, 16.587.252.768 bytes, sha256 `972390ab1c6cdee39e572f36991ab7e9a4cd63cfdff519947a64f69cfcc17e07`) |

## Arquitectura y entrenamiento

El artefacto es una cuantización del checkpoint oficial Qwen/Qwen3.8-27B, no un modelo entrenado desde cero. La receta descrita por el autor parte de un GGUF en BF16 obtenido del checkpoint oficial. Cada peso NVFP4 del tronco recibe una escala FP32 por tensor que es una potencia de dos, calculada como `alpha = 2^ceil(log2(amax / (6 x 256)))`, y el peso se almacena como `W / alpha` junto a un tensor hermano `<name>.scale` en F32. Esta escala sigue el límite de 256 del método Four Over Six (arXiv 2512.02010); sin ella, según el autor, el 99,5% de las escalas de bloque E4M3 de llama.cpp caen en valores subnormales con 2 o 3 bits de precisión.

La cuantización NVFP4 se realiza con `llama-quantize` y una búsqueda de escala de bloque ponderada por imatrix (PR #25153 de llama.cpp, 25 códigos E4M3 por bloque). La imatrix se construye con 204.800 tokens de wikitext-2 train más código C, disjuntos de los textos de evaluación. Las capas donde el coste por byte es más rentable se mantienen en Q6_K con imatrix, seleccionadas mediante sondas por capa y un problema de mochila con presupuesto de 16,6 GB. El embedding y el LM head van en Q5_K, y el bloque MTP se mantiene en NVFP4 sin cambios.

El modelo incorpora un cabezal MTP que se usa como borrador para decodificación especulativa con K=3. El autor indica que este cabezal, el embedding y el LM head son idénticos byte a byte a los del build estándar. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo base.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` de la model card y la plantilla de chat empleada en las evaluaciones.
- Razonamiento y matemáticas: los prompts de evaluación de MTP incluyen tareas de matemáticas y agénticas.
- Generación de código: se evalúa la fidelidad en código C y se usan prompts de código largo en las pruebas de aceptación de MTP.
- Decodificación especulativa con cabezal MTP embebido: aceptación del 67,6% en 14 prompts y aceleración de 2,14x a 2,31x sobre decodificación simple según el autor.
- Salida estructurada: incluida entre los tipos de prompt de las pruebas de MTP.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible; el pipeline es `text-generation`.
- Capacidades multilingües: no disponible.

## Casos de uso

- Despliegue local en estaciones DGX Spark (GB10): el archivo de 16,59 GB cabe en la memoria unificada del dispositivo y ofrece 1.295 tok/s de prefill (pp512) y 13,8 tok/s de decodificación (tg128) con llama.cpp, según las mediciones del autor.
- Asistentes conversacionales en hardware Blackwell: la etiqueta `conversational` y la plantilla de chat permiten integrar el modelo en interfaces de chat multi-turno; el contexto útil verificado en las pruebas es de hasta 5.420 tokens en los prompts de evaluación de MTP, aunque no se han medido contextos superiores a 4.096 tokens en las pruebas de KL.
- Aceleración de inferencia con decodificación especulativa: el cabezal MTP embebido permite duplicar aproximadamente el throughput de decodificación (de 14,3 a 31,3 tok/s en un GB10 con el build estándar) sin necesidad de un modelo borrador separado.
- Generación de código en pipelines locales: la fidelidad medida en código C (KLD media de 0,0206, top-1 del 96,86%) y la inclusión de prompts de código en las pruebas de aceptación lo hacen adecuado para autocompletado y generación de código en entornos con GPU Blackwell.
- Sustitución de cuantizaciones Q4_K_M cuando se prioriza velocidad de prefill: el autor reporta 1.295 tok/s de pp512 frente a 959 tok/s de UD-Q4_K_M en llama.cpp sobre GB10, con un tamaño similar (16,59 GB frente a 16,56 GB).
- Evaluación de técnicas de cuantización NVFP4: el artefacto documenta con detalle la receta (escalas por tensor, búsqueda de escalas de bloque, imatrix) y las métricas de divergencia KL, lo que lo hace útil como referencia reproducible para investigación en cuantización de 4 bits.

## Benchmarks y rendimiento

Fidelidad frente a BF16 (divergencia KL de la distribución completa del siguiente token; wikitext-2 test, 72 fragmentos de 4.096 tokens, 147.384 posiciones evaluadas; código de `src/` de llama.cpp, 40 fragmentos, 81.880 posiciones). llama.cpp `969d733`, ruta por defecto en Blackwell:

| Archivo | GB | KLD media wiki | Mediana wiki | Top-1 wiki % | KLD media código | Top-1 código % |
|---|---|---|---|---|---|---|
| Estándar (NVFP4-MTP-GGUF) | 15,71 | 0,0843 | 0,0229 | 89,96 | 0,0323 | 96,08 |
| NVFP4 + atención Q6_K (mixC) | 16,53 | 0,0763 | 0,0194 | 90,59 | 0,0257 | 96,51 |
| Este archivo (HiFi) | 16,59 | 0,0647 | 0,0141 | 91,95 | 0,0206 | 96,86 |
| unsloth UD-Q4_K_M | 16,56 | 0,0254 | 0,0030 | 95,97 | 0,0057 | 98,31 |

Motor memra del autor (prefill con activaciones de 8 bits, pesos NVFP4):

| Archivo | KLD media wiki | Mediana wiki | Top-1 wiki % | KLD media código | Top-1 código % |
|---|---|---|---|---|---|
| Estándar | 0,0570 | 0,0131 | 92,23 | 0,0189 | 97,00 |
| mixC | 0,0521 | 0,0113 | 92,72 | 0,0155 | 97,25 |
| Este archivo (HiFi) | 0,0415 | 0,0079 | 93,87 | 0,0109 | 97,58 |

Velocidad (DGX Spark GB10, llama.cpp `969d733`, `llama-bench -ngl 99 -fa 1 -r 5`):

| Archivo | GB | pp512 | pp4096 | tg128 |
|---|---|---|---|---|
| Estándar | 15,71 | 1508 | 1502 | 14,7 |
| Este archivo | 16,59 | 1295 | 1298 | 13,8 |
| UD-Q4_K_M | 16,56 | 959 | 963 | 13,0 |

Aceptación del cabezal MTP (K=3, memra, greedy, plantilla de chat, 256 tokens nuevos por prompt, un GB10):

| Archivo | Aceptación, 8 prompts | Aceptación, 6 prompts adicionales | Total 14 prompts | Aceleración MTP |
|---|---|---|---|---|
| Estándar | 67,1% (1370/2043) | 71,4% (1048/1467) | 68,9% | 2,08x / 2,30x |
| Este archivo | 64,1% (1350/2106) | 72,7% (1054/1449) | 67,6% | 2,14x / 2,31x |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/memoria: el archivo ocupa 16,59 GB; se necesita además espacio para el contexto KV y el overhead del motor. En un DGX Spark (GB10, memoria unificada) se ejecuta con `-ngl 99`.
- GPUs compatibles con NVFP4: Blackwell sm_100, sm_120 y sm_121. En otras GPUs llama.cpp cae a rutas más lentas, y el autor no ha medido el rendimiento en GPUs no Blackwell.
- Versión de llama.cpp: se requiere un build que lea los tensores `.scale` por tensor, mainline `969d733` o posterior. Un build que ignore las escalas produce salidas incorrectas, ya que los pesos se almacenan divididos por su escala.
- Cabe en GPU de consumo: no confirmado; el autor solo reporta mediciones en DGX Spark (GB10) y no ha evaluado GPUs de consumo.
- Opciones de despliegue: llama.cpp (ruta recomendada y validada) y memra, el motor del autor. No se mencionan vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput medidos en GB10 con llama.cpp: pp512 de 1.295 tok/s, pp4096 de 1.298 tok/s y tg128 de 13,8 tok/s; con MTP activo, la decodificación sube a aproximadamente 2,14x-2,31x (referencia del build estándar: de 14,3 a 31,3 tok/s).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / tamaño | KLD media wiki | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este archivo (HiFi) | ~27,3 mil M | no disponible | GGUF NVFP4+Q6_K+Q5_K, 16,59 GB | 0,0647 | Apache 2.0 | Hugging Face |
| Avifenesh/Qwen3.8-27B-NVFP4-MTP-GGUF (estándar) | ~27,3 mil M | no disponible | GGUF NVFP4, 15,71 GB | 0,0843 | Apache 2.0 | Hugging Face |
| unsloth UD-Q4_K_M | ~27,3 mil M | no disponible | GGUF Q4_K_M, 16,56 GB | 0,0254 | Apache 2.0 (modelo base) | Hugging Face |
| Qwen/Qwen3.8-27B (BF16) | ~27,3 mil M | no disponible | safetensors BF16 | referencia | Apache 2.0 | Hugging Face |

El build estándar del mismo autor es la alternativa directa: ocupa 0,88 GB menos y ofrece mayor velocidad (1.508 frente a 1.295 tok/s en pp512), a costa de peor fidelidad. UD-Q4_K_M de unsloth es más fiel a BF16 (KLD media de 0,0254 frente a 0,0647) pero un 26% más lento en prefill en llama.cpp sobre Blackwell según el autor (959 frente a 1.295 tok/s en pp512).

## Limitaciones y advertencias

- Dependencia estricta de la versión de llama.cpp: con builds anteriores a `969d733` o que no lean los tensores `.scale`, las salidas son incorrectas sin aviso evidente.
- Compatibilidad limitada: los kernels NVFP4 solo están optimizados para Blackwell (sm_100/sm_120/sm_121); en otras GPUs el rendimiento se degrada y no ha sido medido.
- Fidelidad inferior a BF16: la KLD media en wikitext-2 es de 0,0647 frente a 0,0254 de UD-Q4_K_M; el propio autor reconoce que la ruta de activaciones de 4 bits de NVFP4 cuesta fidelidad y que un motor con activaciones de 8 bits recupera aproximadamente un tercio de la KL.
- Cobertura de evaluación limitada: no se han medido contextos superiores a 4.096 tokens en las pruebas de KL, ni benchmarks de tareas, ni GPUs no Blackwell. El comportamiento en contextos largos o en tareas específicas es desconocido.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; deben evaluarse directamente sobre el modelo base Qwen3.8-27B.
- Idiomas soportados: no disponibles; no se puede confirmar el rendimiento multilingüe del modelo base a partir de esta ficha.
- Licencia: Apache 2.0, lo que permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.8-27B por si añaden restricciones adicionales.
- Reproducibilidad: las métricas de velocidad y aceptación de MTP provienen de un único dispositivo (DGX Spark GB10) y de los motores del autor; el rendimiento en otros entornos puede diferir.
- Madurez del artefacto: 0 descargas y 0 likes en el momento de la consulta, con una única revisión del repositorio; no hay validación independiente de las cifras publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Avifenesh/Qwen3.8-27B-NVFP4-HiFi-MTP-GGUF
- Build estándar del mismo autor: https://huggingface.co/Avifenesh/Qwen3.8-27B-NVFP4-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper Four Over Six: arXiv 2512.02010
- PR de llama.cpp con la búsqueda de escalas de bloque NVFP4: PR #25153
- Build de llama.cpp requerido: mainline `969d733`
