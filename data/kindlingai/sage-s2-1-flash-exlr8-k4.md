# kindlingai/sage-s2.1-flash-exlr8-k4

## Resumen

Sage-S2.1-Flash · exlr8 K4 es una cuantización del modelo Sage S2.1 Flash (desarrollado por el Shanghai Artificial Intelligence Laboratory) en formato exlr8 v2, publicada por kindlingai. El modelo base emplea la arquitectura GLM-5.3-Flash, un transformer MoE con 45 capas (las capas 0-2 densas y las 3-44 MoE), 288 expertos enrutados con routing top-8 más un experto compartido por capa MoE, tamaño oculto de 4096 y un tower de visión. Esta release cuantiza a 4 bits por peso (K4) los expertos enrutados y compartidos de las capas 3-45 y los pesos densos de todas las capas, manteniendo el tower de visión en BF16 sin cuantizar.

El objetivo de esta release es servir el modelo en dispositivos de memoria unificada de clase NVIDIA GB10 (DGX Spark, ASUS GX10), donde el modelo en BF16 no cabría. El repositorio ocupa 165,4 GB, de los cuales 156,6 GB corresponden a los expertos en formato trellis K4 y 8,1 GB a los ficheros densos, de vocabulario y de visión. Es relevante ahora porque permite ejecutar un modelo multimodal de gran tamaño en hardware de sobremesa con memoria unificada, mediante tensor-parallel sobre dos o cuatro DGX Spark.

Una advertencia crítica del autor: estos pesos no pueden usarse sin redondeo E4M3. Cualquier loader debe redondear cada valor que produce el codebook trellis a FP8 E4M3 (round to nearest even, saturating) antes de aplicar los vectores laterales; un decodificador EXL3 estándar lee pesos mediblemente peores de los mismos bytes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE basado en GLM-5.3-Flash (45 capas: 0-2 densas, 3-44 MoE; capa MTP 45; tower de visión) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (288 expertos enrutados, top-8 + 1 experto compartido por capa MoE) |
| Longitud de contexto | no disponible (se han medido prefills de hasta 128K tokens) |
| Tipos de cuantizacion | exlr8 v2 K4 (4 bits por peso) en expertos y pesos densos; tower de visión en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (trellis exlr8 K4 + BF16 para visión), con manifiestos e índices por capa y por rango TP |

## Arquitectura y entrenamiento

El modelo base Sage S2.1 Flash sigue la arquitectura GLM-5.3-Flash: 45 capas con las tres primeras densas y el resto MoE, 288 expertos enrutados con selección top-8 más un experto compartido por capa, tamaño oculto de 4096 y tamaño intermedio de experto de 2048. Incluye una capa MTP (multi-token prediction) en la posición 45 y un tower de visión, lo que lo convierte en un modelo image-text-to-text. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La innovación técnica de esta release es la cuantización exlr8 v2 con anchura trellis K4: cada fichero de capa K4 ocupa 3.636.527.104 bytes, correspondientes a 289 expertos × 3 proyecciones × 4096 × 2048 a 4 bits. El repositorio incluye índices con side data y checksums por capa, manifiestos con el weight set ID, slices por rango para TP 1-4 y sumas SHA-256. El tower de visión se mantiene íntegro en BF16 (347 tensores). El autor no documenta en la información disponible detalles sobre el proceso de calibración más allá de indicar que las filas de evaluación provienen de documentos no usados para calibrar.

## Capacidades

- Generación de texto conversacional (pipeline image-text-to-text, tag conversational).
- Procesamiento de imagen y texto combinados gracias al tower de visión en BF16.
- Razonamiento multi-paso y decodificación especulativa mediante la capa MTP (el autor reporta MTP=2 drafting con shared waterfill).
- Capacidades de código: el autor reporta 17 de 18 tareas superadas en su benchmark interno de coding agéntico.
- Soporte de prompt cache alineado (FLASH_CACHE=aligned) para reutilización de prefijos largos.
- Despliegue en tensor-parallel TP=2 y TP=4 sobre DGX Spark.
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de código agéntica en local: el modelo ha superado 17 de 18 tareas en un benchmark interno de coding agéntico servido con gr8 a TP=4, por lo que es adecuado para flujos de trabajo de edición de código multi-paso ejecutados íntegramente en hardware de sobremesa.
- Procesamiento de documentos con imagen y texto: al conservar el tower de visión en BF16 y aceptar entradas image-text-to-text, puede emplearse para extracción de información de capturas, diagramas o documentos escaneados junto a instrucciones en lenguaje natural.
- Análisis de repositorios con contexto largo: los prefills medidos de 8K, 32K y 128K tokens (1.832 / 1.775 / 1.627 tok/s a TP=2) permiten cargar ficheros o conversaciones extensas en una sola pasada, útil para revisión de código o resumen de documentación técnica.
- Servicio conversacional multiusuario en un solo nodo: con 8 streams simultáneos a TP=4 el autor reporta 162,0 tok/s agregados, suficiente para un pequeño equipo interno con varias sesiones concurrentes.
- Despliegue en laboratorios con hardware GB10: pensado para DGX Spark o ASUS GX10, permite experimentar con un MoE multimodal de gran tamaño sin acceso a clústeres con A100/H100.
- Evaluación de técnicas de cuantización: la release incluye métricas de KL, top-1 y NLL frente a BF16, manifiestos e índices por capa, lo que la hace útil como referencia reproducible para investigar cuantización trellis y su impacto en la distribución de salida.
- Prototipado de pipelines RAG con contexto largo: la caché de prompt alineada y los prefills rápidos facilitan iterar sobre recuperación aumentada con documentos extensos en local.

## Benchmarks y rendimiento

Calidad frente al modelo base BF16 (mismos token ids):

| Metrica | Valor |
|---|---|
| KL media sobre vocabulario completo (41 filas de 2.048 tokens) | 0,0985 |
| Acuerdo top-1 (forward offline) | 91,0% |
| Top-20 KL servido por gr8 a TP=2 (20.470 posiciones) | 0,0485 |
| Acuerdo top-1 servido por gr8 a TP=2 | 90,8% |
| Acuerdo top-1 entre modelo servido y forward offline | 93,8% |
| Benchmark interno de coding agéntico (18 tareas, TP=4) | 17/18 superadas |

Cambio de NLL (K4 menos BF16; negativo es mejor) en tres textos fijos:

| Texto | Forward offline | Servido por gr8, TP=2 |
|---|---|---|
| Prosa | +0,0014 | +0,0045 |
| CUDA | -0,0120 | +0,0002 |
| Python | +0,0041 | -0,0012 |

Velocidad medida el 2026-11-18 con gr8 `ca7e874`, KV int4, MTP=2 y caché de prompt activa (tokens por segundo):

| Metrica | Dos Sparks, TP=2 | Cuatro Sparks, TP=4 |
|---|---|---|
| Decode, un stream: código / prosa / estructurado | 55,1 / 41,8 / 56,0 | 88,0 / 68,8 / 91,1 |
| Prefill en frío: 8K / 32K / 128K | 1.832 / 1.775 / 1.627 | 2.999 / 3.029 / 2.637 |
| Todos los streams: 1 / 2 / 4 | 47,9 / 66,6 / 79,8 | 79,5 / 106,7 / 127,5 |
| Todos los streams: 8 | no disponible | 162,0 |

El autor advierte que las cifras de KL de la model card de GLM-5.3-Flash (0,384 para K4 y 0,472 para K3) corresponden a otro modelo y otro texto de evaluación, por lo que solo sirven como referencia de escala.

## Requisitos de hardware

- VRAM / memoria: la release completa ocupa 165,4 GB; los expertos K4 suman 156,6 GB y los ficheros densos, de vocabulario y de visión 8,1 GB. Requiere memoria unificada de clase GB10 repartida en varios nodos.
- GPU recomendadas: NVIDIA GB10 (DGX Spark, ASUS GX10). El autor documenta recetas para dos Sparks (TP=2) y cuatro Sparks (TP=4), un contenedor por nodo.
- GPU de consumo: no cabe en GPUs consumer convencionales por el tamaño total de la release; el diseño apunta a dispositivos de memoria unificada GB10.
- Despliegue: motor gr8 de kindlingai (`./gr8 glm53f`) a TP=2 o TP=4. El formato exlr8 requiere un loader con redondeo E4M3; un decodificador EXL3 estándar no es compatible sin ese paso.
- Latencia y throughput: decode de 41,8-56,0 tok/s por stream a TP=2 y 68,8-91,1 tok/s a TP=4; prefill de 1.627-1.832 tok/s (TP=2) y 2.637-3.029 tok/s (TP=4) según longitud de prompt; hasta 162,0 tok/s agregados con 8 streams a TP=4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Sage-S2.1-Flash exlr8 K4 (esta release) | no disponible (288 expertos top-8) | no disponible (prefill medido a 128K) | K4 4 bits + visión BF16 | MIT | 165,4 GB; servido con gr8 en GB10 |
| GLM-5.3-Flash exlr8 K4 (kindlingai) | misma arquitectura que el base | no disponible | K4 | no disponible | KL 0,384 en su propia evaluación; mismo formato de bytes |
| Sage S2.1 Flash BF16 (internlm) | no disponible | no disponible | BF16 | no disponible | Modelo base sin cuantizar; referencia de calidad |

No se dispone de datos de benchmarks comparables con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Los pesos no funcionan sin redondeo E4M3: un decodificador que omita el redondeo a FP8 E4M3 (round to nearest even, saturating) antes de aplicar los vectores laterales lee pesos peores de los mismos bytes.
- Pérdida de calidad medible frente a BF16: KL media de 0,0985 y acuerdo top-1 del 91,0% en forward offline; el NLL empeora ligeramente en prosa (+0,0014) y Python (+0,0041), aunque mejora en CUDA (-0,0120).
- Discrepancia sin resolver: el modelo servido y el forward offline coinciden en el top-1 solo en el 93,8% de las posiciones; el autor indica que la causa está en investigación.
- Dependencia de un motor específico: requiere gr8 y el formato exlr8 v2; no es directamente cargable en vLLM, llama.cpp, Ollama o TGI según la información disponible.
- Idiomas soportados no documentados, por lo que no puede garantizarse cobertura multilingüe.
- Sesgos conocidos y riesgo de alucinación: no documentados en la información disponible.
- Licencia MIT, que permite uso comercial, pero conviene verificar las condiciones del modelo base (internlm/Sage-S2.1-Flash) antes de desplegar en producción.
- El benchmark de coding es interno del autor (18 tareas) y no es directamente comparable con HumanEval, MMLU u otros estándares.

## Enlaces

- Hugging Face: https://huggingface.co/kindlingai/sage-s2.1-flash-exlr8-k4
- Modelo base: https://huggingface.co/internlm/Sage-S2.1-Flash
- Motor gr8: https://github.com/kindlingai/gr8
- Receta TP=2 para dos DGX Spark: https://github.com/kindlingai/sage-s2.1-flash-exlr8-2x-spark
- Receta TP=4 para cuatro DGX Spark: https://github.com/kindlingai/sage-s2.1-flash-exlr8-4x-spark
- Formato de referencia (GLM-5.3-Flash exlr8 K2/K3/K4): https://huggingface.co/kindlingai/glm-5.3-flash-exlr8-k2-k3-k4
