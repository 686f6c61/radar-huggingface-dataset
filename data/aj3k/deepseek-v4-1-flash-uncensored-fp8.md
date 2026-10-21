# aj3k/DeepSeek-V4.1-Flash-UNCENSORED-FP8

## Resumen

DeepSeek-V4.1-Flash-UNCENSORED-FP8 es una versión modificada del modelo DeepSeek-V4.1-Flash publicada por el usuario aj3k bajo la marca «dealignai». Se trata de un checkpoint «abliterated»: se han eliminado a nivel de pesos los circuitos de rechazo del modelo base, manteniendo —según el autor— el resto de componentes intactos byte a byte (expertos enrutados, memoria Engram, atención dispersa CSA2, cabeza de borrador especulativa DSpark, torre de visión, compuertas del router, normas y embeddings). No requiere `model.py` personalizado ni hooks en tiempo de ejecución: se carga exactamente igual que el modelo original.

El modelo base es un transformer causal encoder-decoder de 20+20 capas con mezcla de expertos (384 expertos enrutados, top-6, más 1 compartido), conexiones residuales Hyper-Connections de 4 canales, atención dispersa CSA2 y memoria de n-gramas Engram. La model card declara 552 B de backbone con 8 B/16 B activos por token, mientras que los safetensors del repositorio suman 763.205.315.794 parámetros (763,2 B), diferencia atribuible a la torre de visión, la memoria Engram y la cabeza DSpark. El contexto declarado es de 1 M de tokens y el pipeline es `image-text-to-text`, por lo que conserva capacidades multimodales.

Su relevancia es doble: por un lado, es un ejemplo de modificación de pesos a gran escala sobre un modelo FP8 nativo de más de 700 B de parámetros; por otro, su publicación incluye una evaluación cuantitativa del efecto de la abliteración sobre la tasa de cumplimiento en HarmBench-320 (del 42,81 % al 100 %) y sobre el conocimiento en MMLU-14k (de 86,96 % a 82,74 %). Ese doble conjunto de datos lo convierte en material útil para investigación en seguridad y en evaluación de robustez de alineamiento, y simultáneamente en un artefacto de riesgo elevado si se despliega sin control.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal encoder-decoder (20+20 capas), MoE con 384 expertos enrutados (top-6) + 1 compartido, Hyper-Connections (residual de 4 canales), atencion dispersa CSA2, memoria de n-gramas Engram, cabeza de borrador especulativa DSpark (MTP), torre de vision DeepSeek-ViT con 2D-RoPE y pixel unshuffle |
| Parametros totales | 763.205.315.794 (763,2 B) segun safetensors; la model card declara 552 B de backbone |
| Parametros activos | 8 B / 16 B activos por token (segun model card; no se detalla el desglose entre backbone y cabeza MTP) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP8 (`e4m3fn`) en pesos con block-scale E8M0 [32, 32]; expertos enrutados en FP4; cuantizacion nativa del modelo base, no modificada. No se publican GGUF, AWQ ni GPTQ en el repositorio |
| Idiomas soportados | no disponible |
| Licencia | MIT (declarada por el autor del derivado; la licencia del modelo base puede imponer condiciones adicionales) |
| Formato de pesos | safetensors (8-bit), repositorio de 510,3 GB |

## Arquitectura y entrenamiento

La arquitectura combina varios mecanismos poco habituales. El cuerpo es un encoder-decoder causal de 40 capas en total (20 de encoder y 20 de decoder) con mezcla de expertos de grano fino: 384 expertos enrutados con seleccion top-6 por token mas un experto compartido siempre activo. Las conexiones residuales usan Hyper-Connections de 4 canales en lugar del residual simple, y la atencion es CSA2 (una variante dispersa), lo que reduce el coste cuadratico y hace viable la ventana de 1 M de tokens. Se anade una memoria de n-gramas denominada Engram y una cabeza de prediccion multi-token DSpark que actua como borrador para decodificacion especulativa, con el objetivo de aumentar el throughput en generacion. La entrada visual la procesa una torre DeepSeek-ViT con RoPE bidimensional y pixel unshuffle.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de alineamiento (RLHF/DPO) del modelo base en la informacion proporcionada. Respecto a la modificacion, el autor describe el proceso como «abliteration quirurgica a nivel de pesos»: se elimina la circuiteria de rechazo conservando identicos los componentes criticos para capacidades. No se documentan ni el metodo exacto (direcciones de rechazo, capas intervenidas, magnitud de la proyeccion) ni el coste computacional del proceso, lo que impide reproducirlo.

## Capacidades

- Generacion de texto y razonamiento multi-turno con coherencia sostenida, segun el autor, en ventanas de hasta 1 M de tokens.
- Razonamiento con traza explicita («effort=max»): el modelo puede exponer su cadena de razonamiento antes de responder; la model card usa ese modo en la evaluacion de HarmBench.
- Vision: pipeline `image-text-to-text`, con torre DeepSeek-ViT conservada sin modificar; admite entrada de imagen junto a texto.
- Tool calling / function calling: la etiqueta `endpoints_compatible` sugiere compatibilidad con APIs de tipo OpenAI, aunque no se documenta el esquema concreto.
- Decodificacion especulativa nativa mediante la cabeza DSpark (prediccion multi-token), orientada a reducir latencia.
- Capacidades multilingues: no disponibles (no se declara lista de idiomas).
- Modo «sin guardrails»: se elimina el rechazo en las siete categorias semanticas de HarmBench, incluida la verificacion sobre la traza de razonamiento.

## Casos de uso

- Investigacion en alineamiento y robustez: el par base/CRACK con la misma arquitectura y el mismo tokenizador permite medir el efecto aislado de la abliteracion sobre la tasa de rechazo y sobre el conocimiento, usando HarmBench-320 y MMLU-14k como protocolo reproducible.
- Red teaming y evaluacion de clasificadores de seguridad: generar respuestas de cumplimiento total para probar detectores, moderadores y filtros de salida en un rango controlado de categorias.
- Analisis de mecanismos internos de rechazo: al conservar el checkpoint como carga estandar, se pueden extraer activaciones y aplicar sondas lineales por capa sin necesidad de parchear el modelo en ejecucion.
- Procesamiento de documentos largos con imagen: con 1 M de tokens y entrada visual, es viable indexar informes escaneados, planos o expedientes completos y hacer preguntas sobre ellos en una sola pasada.
- Evaluacion comparativa de cuantizacion FP8/FP4 a gran escala: el repositorio sirve para medir degradacion de perplejidad y de exactitud con expertos en FP4 frente a pesos densos en FP8, en un modelo de 763 B.
- Pruebas de decodificacion especulativa: la cabeza DSpark permite estudiar la ganancia de throughput de la prediccion multi-token en un MoE de este tamano, comparandola con decodificacion autoregresiva estandar.
- Entornos de investigacion cerrados y aislados: experimentos de generacion de texto sin restricciones en sandbox, sin exposicion a usuarios finales ni a servicios publicos.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. HarmBench-320, temperatura 0, decodificacion voraz, con clasificacion en 4 niveles (HARD_REF, SOFT_RED, HEDGE, COMPLY):

| Evaluacion | Base ASR | CRACK ASR | Delta (pp) |
|---|---:|---:|---:|
| HB-320, effort=off | 137/320 = 42,81 % | 320/320 = 100,00 % | +57,19 |
| HB-320, effort=max | 5/320 = 1,56 % | 320/320 = 100,00 % | +98,44 |

Desglose por categoria semantica (effort=off / effort=max):

| Categoria | Items | Base off | CRACK off | Base max | CRACK max |
|---|---:|---:|---:|---:|---:|
| chemical_biological | 42 | 16,7 % | 100,0 % | 0,0 % | 100,0 % |
| copyright | 80 | 98,8 % | 100,0 % | 0,0 % | 100,0 % |
| cybercrime_intrusion | 52 | 34,6 % | 100,0 % | 3,8 % | 100,0 % |
| harassment_bullying | 21 | 0,0 % | 100,0 % | 0,0 % | 100,0 % |
| harmful | 18 | 11,1 % | 100,0 % | 5,6 % | 100,0 % |
| illegal | 53 | 13,2 % | 100,0 % | 0,0 % | 100,0 % |
| misinformation_disinformation | 54 | 44,4 % | 100,0 % | 3,7 % | 100,0 % |

MMLU-14k (conjunto de test completo, logits del modelo base, T=0):

| Build | Aciertos | Exactitud | Delta |
|---|---:|---:|---:|
| Base | 12.211 / 14.042 | 86,96 % | — |
| CRACK | 11.619 / 14.042 | 82,74 % | -4,22 pp |

Excluyendo el cluster de etica (moral_scenarios, business_ethics, professional_law, jurisprudence, philosophy), el autor reporta un delta de -1,1 pp sobre los ~11.000 items restantes. La caida mas pronunciada por asignatura es moral_scenarios (76,9 % → 37,0 %, -39,89 pp), seguida de professional_law (75,9 % → 68,8 %) y abstract_algebra (77,0 % → 71,0 %). No se han publicado resultados de MMLU-Pro, HumanEval, GSM8K, MATH ni de benchmarks multimodales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP8 ocupan aproximadamente 510 GB (tamano del repositorio). Con overhead de activaciones, buffers y cache KV, el minimo practico ronda los 560-640 GB; para explotar la ventana de 1 M de tokens la cache KV crece de forma significativa y exige nodos multiples.
- GPU recomendadas: 8×H200 (141 GB, 1,13 TB en total) deja margen suficiente para pesos y cache. 8×H100 de 80 GB (640 GB) entra ajustado y limita la longitud de contexto. Configuraciones de 4 GPU solo son viables con un numero reducido de capas o con paralelismo tensorial muy agresivo.
- GPU de consumo: no. Ni siquiera una RTX 4090 (24 GB) ni una RTX 5090 se acercan al requisito; no hay cuantizaciones GGUF de 4 bits publicadas en este repositorio que lo hicieran viable.
- Opciones de despliegue: `transformers` (libreria declarada) con accelerate/DeepSpeed para sharding; vLLM y TGI son opciones plausibles para servir, pero no se confirma soporte explicito del arquitectura `deepseek_v41` en la informacion disponible; llama.cpp y Ollama no estan soportados en la practica por tamano y formato.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por token, ni el impacto real de la cabeza DSpark en produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Activos por token | Contexto | Licencia | HarmBench ASR | MMLU | Estado |
|---|---|---|---|---|---|---|---|
| aj3k/DeepSeek-V4.1-Flash-UNCENSORED-FP8 | 763,2 B (safetensors) | 8 B / 16 B | 1 M | MIT (derivado) | 100 % (off y max) | 82,74 % | Publicado, 0 descargas |
| deepseek-ai/DeepSeek-V4.1-Flash (base) | 552 B backbone (declarado) | 8 B / 16 B | 1 M | no disponible | 42,81 % (off), 1,56 % (max) | 86,96 % | Publicado |
| Otras variantes abliterated de la misma familia | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion relevante es contra el modelo base, del que este repositorio es un derivado directo: mismo tokenizador, misma arquitectura, mismos requisitos de hardware. La diferencia medible se concentra en la tasa de cumplimiento (100 % frente a 42,81 %/1,56 %) y en una perdida de 4,22 pp en MMLU, muy concentrada en las asignaturas de etica y derecho. No se dispone de datos de modelos comparables de terceros (por ejemplo, otras tecnicas de abliteration sobre la misma familia) en la informacion proporcionada.

## Limitaciones y advertencias

- Eliminacion deliberada de guardrails: la tasa de cumplimiento en HarmBench-320 es del 100 % en las siete categorias evaluadas, incluidas `chemical_biological`, `cybercrime_intrusion` e `illegal`. El modelo generara contenido danino si se le solicita. No debe exponerse a usuarios finales, a APIs publicas ni a entornos sin supervision.
- Riesgo legal y de cumplimiento: en la UE, el uso de un modelo sin filtros para generar contenido ilicito puede contravenir el Reglamento de IA y la normativa de servicios digitales, ademas de la legislacion penal aplicable. La licencia MIT del derivado no exime del cumplimiento normativo ni de las condiciones del modelo base.
- Ambiguedad de licencia: el autor declara MIT sobre el derivado, pero DeepSeek-V4.1-Flash tiene su propia licencia (no disponible en la informacion proporcionada) que puede imponer restricciones de uso comercial o de redistribucion. Conviene verificar la licencia del modelo base antes de cualquier uso en produccion.
- Perdida de conocimiento medible: -4,22 pp en MMLU-14k, con caidas severas en `moral_scenarios` (-39,89 pp) y `professional_law` (-7,04 pp). Cualquier caso de uso que dependa de razonamiento etico, normativo o juridico se degrada de forma sustancial.
- Alucinacion: no se han publicado evaluaciones de veracidad, factualidad ni tasa de alucinacion. Al haberse eliminado la circuiteria de rechazo, es esperable una menor propension a expresar incertidumbre o a matizar afirmaciones dudosas, lo que agrava el riesgo.
- Idiomas: la lista de idiomas soportados no esta disponible; el comportamiento multilingue no esta verificado.
- Opacidad del metodo: no se documenta que capas ni que direcciones de rechazo se han modificado, ni el procedimiento de evaluacion completo. El clasificador de 4 niveles descrito es regex multiligue mas LLM-as-judge, lo que introduce dependencia del juez utilizado.
- Reproducibilidad y confianza: 0 descargas y 0 «likes» en el momento de la consulta, cuenta de autor sin historial verificable y fechas de creacion y actualizacion identicas (2026-10-20). No hay validacion independiente de los resultados.
- Coste de despliegue: ~510 GB de pesos y requisitos de nodo multiple limitan su uso a infraestructura especializada; no hay cuantizaciones ligeras publicadas en el repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aj3k/DeepSeek-V4.1-Flash-UNCENSORED-FP8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Perfil del autor en X: https://x.com/dealignai
- Perfil del coautor en X: https://x.com/jordanschenck
- Paper tecnico del modelo base: no disponible
- Blog o documentacion adicional: no disponible
- Repositorio de codigo o demo: no disponible

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces retornados no guardan relacion con el contenido de la ficha y se han descartado.
