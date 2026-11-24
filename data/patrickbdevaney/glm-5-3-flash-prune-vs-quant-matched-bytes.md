# patrickbdevaney/GLM-5.3-Flash-prune-vs-quant-matched-bytes

## Resumen

Este repositorio no contiene un modelo nuevo, sino un estudio de evaluacion sobre `zai-org/GLM-5.3-Flash`, un modelo MoE de 321B parametros totales con 288 expertos enrutados por capa, top-8 routing, 42 capas MoE y una capa MTP adicional. El autor, patrickbdevaney, compara dos estrategias para encajar el modelo en el presupuesto de bytes de una maquina de 128 GB (unos 95-102 GiB de pesos, equivalente a 2,5-2,75 bits por peso original): podar expertos enrutados y mantener los supervivientes a mayor precision, o conservar todos los expertos y cuantizar mas agresivamente.

La conclusion del estudio es clara para este modelo y este presupuesto: cuantizar, no podar. La cuantizacion dinamica de 2 bits sin poda de Unsloth (`UD-Q2_K_XL`, 101,24 GiB) alcanza un 87,25% de acuerdo en argmax de siguiente token con el modelo FP8 sin podar sobre 243.067 tokens retenidos de 9 dominios, mientras que una poda del 25% de expertos a bytes equivalentes baja al 85,44% y una del 33% al 83,00%. Incluso la variante sin podar mas pequena (`UD-IQ2_XXS`, 94,84 GiB) supera a la poda del 25%.

El valor del repositorio es metodologico: documenta con rigor un resultado negativo, con protocolo de evaluacion reproducible, calibracion de saliencia de expertos y artefactos GGUF podados como brazos de comparacion. Es relevante para quienes planean desplegar GLM-5.3-Flash en hardware de gama alta de consumo o estaciones de trabajo con 128 GB de memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 288 expertos enrutados por capa, top-8 routing, 42 capas MoE mas 1 capa MTP |
| Parametros totales | 321B (modelo base `zai-org/GLM-5.3-Flash`) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: UD-Q2_K_XL, UD-IQ2_XXS; brazos podados: IQ3_XXS/IQ4_XS (REAP216), IQ3_S/Q4_K (REAP192); NVFP4 weight-only (REAP50-NVFP4-v2) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (brazos de cuantizacion y poda); FP8 para el teacher; NVFP4 para el brazo REAP50 |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos: 288 expertos enrutados por capa, routing top-8, 42 capas MoE y una capa MTP (multi-token prediction) adicional. El estudio no entrena ni ajusta el modelo; parte de los pesos FP8 originales (305,8 GiB) como teacher y construye brazos alternativos mediante poda de expertos y cuantizacion.

La metodologia de poda combina tres piezas. Primero, captura de saliencia sobre el teacher FP8 con 4,75M tokens de calibracion, con un 22% de tokens enrutados provenientes de texto web/educativo/PDF y el resto repartido entre instrucciones, multilingue, tool-calling, agentico, codigo, matematicas, ciencia, finanzas e imagen-texto. Segundo, seleccion de expertos mediante masa de saliencia REAP (peso del router por norma de salida del experto, sin el promedio 1/N de REAP), con un presupuesto de anclaje del 4% por dominio y una guarda de super-expertos que conserva hasta 4 expertos por capa cuya activacion pico sea al menos 10 veces la mediana de la capa. Tercero, poda en conversion mediante un parche a `convert_hf_to_gguf.py` que elimina los tensores de expertos no seleccionados y recorta las filas del router y el sesgo de correccion, sin modificar los pesos retenidos.

La cuantizacion se hizo a bytes equiparables: cada tensor no experto recibio exactamente el tipo que Unsloth uso en `UD-Q2_K_XL`, y los expertos enrutados subieron un escalon fijo en la escalera de tipos respecto a la eleccion por tensor de Unsloth, reutilizando su imatrix recortada a los expertos conservados. No hubo healing ni fine-tuning posterior a la poda.

## Capacidades

- Generacion de texto y razonamiento general, evaluados mediante acuerdo teacher-forced en argmax de siguiente token sobre 9 dominios.
- Codigo: el estudio mide HumanEval+ y observa que la poda del 50% retiene 145/164 frente a 153/164 del modelo sin podar (94,8% de retencion, McNemar p = 0,057).
- Matematicas y finanzas: son los unicos dominios donde la poda del 25% mejora ligeramente frente a `UD-Q2_K_XL` (+0,8 y +1,1 puntos de top-1 respectivamente).
- Multilingue e instrucciones: medidos en el estudio; la poda del 25% pierde 6,5 puntos en multilingue y 3,0 en instrucciones frente a `UD-Q2_K_XL`.
- Tool calling y uso agentico: aparecen como categorias del conjunto de calibracion, no como capacidades evaluadas de forma independiente en los resultados publicados.
- Capacidad de vision: el calibrador incluye un bucket de imagen-texto, pero no se publican resultados de evaluacion multimodal.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue de GLM-5.3-Flash en una maquina de 128 GB para uso general: el estudio recomienda `unsloth/GLM-5.3-Flash-GGUF` `UD-Q2_K_XL` (101,24 GiB) frente a cualquier build REAP-50, porque la cuantizacion a 2 bits es estadisticamente indistinguible del modelo sin podar en las cinco suites de generacion libre y no produce bucles de repeticion.
- Asistencia de codigo en produccion con presupuesto de memoria ajustado: los builds REAP-50 siguen siendo razonables para uso centrado en codigo, ya que retienen el 94,8% de HumanEval+ y el acuerdo teacher-forced en codigo es 0,92 frente a 0,58 en texto general.
- Investigacion sobre poda de expertos en MoE: el repositorio sirve como referencia metodologica para disenar experimentos de poda con bytes equiparables, incluyendo scripts de conversion, recetas de cuantizacion por tensor y mascaras de saliencia.
- Evaluacion de estrategias de compresion: util para equipos que deben decidir entre reducir parametros o reducir precision en un modelo MoE grande, con un protocolo de dos etapas (fidelidad teacher-forced y generacion emparejada) reutilizable.
- Analisis de degradacion por dominio: permite estudiar como la poda afecta de forma desigual a texto general, multilingue, instrucciones, matematicas, finanzas, codigo y ciencia, informacion relevante para decidir que dominios priorizar al comprimir.
- Reproducibilidad de resultados negativos: los brazos GGUF podados y las mascaras de saliencia permiten replicar el hallazgo de que la poda induce bucles de repeticion en generacion libre en prompts generales e instrucciones.

## Benchmarks y rendimiento

| Metrica | Teacher sin podar (FP8) | UD-Q2_K_XL (101,24 GiB) | UD-IQ2_XXS (94,84 GiB) | REAP216 25% (102,24 GiB) | REAP192 33% (99,29 GiB) |
|---|---|---|---|---|---|
| Acuerdo argmax siguiente token | referencia | 87,25% | 86,05% | 85,44% | 83,00% |
| KL top-32 | referencia | 0,393 | no disponible | 0,519 | 0,695 |
| Delta top-1 texto general vs UD-Q2_K_XL | – | 0 | no disponible | -3,9 | no disponible |
| Delta top-1 multilingue vs UD-Q2_K_XL | – | 0 | no disponible | -6,5 | no disponible |
| Delta top-1 instrucciones vs UD-Q2_K_XL | – | 0 | no disponible | -3,0 | no disponible |
| Delta top-1 matematicas vs UD-Q2_K_XL | – | 0 | no disponible | +0,8 | no disponible |
| Delta top-1 finanzas vs UD-Q2_K_XL | – | 0 | no disponible | +1,1 | no disponible |

Evaluacion teacher-forced sobre 243.067 tokens retenidos en 9 dominios. En generacion libre, con prompts, muestreo y limites de tokens identicos:

| Suite | Sin podar | REAP50-NVFP4-v2 (98,2 GiB) |
|---|---|---|
| MMLU-Pro | 84/100 | 44/100 |
| IFBench | 56/100 | 32/100 |
| HumanEval+ | 153/164 | 145/164 |

El brazo REAP50 alcanza el limite de tokens en el 44-72% de los items generales y de instrucciones, con bucles de repeticion explicitos en el 9-24% de ellos. `UD-Q2_K_XL` es estadisticamente indistinguible del modelo sin podar en las cinco suites y no presenta bucles.

## Requisitos de hardware

- VRAM/memoria estimada: entre 94,84 GiB (`UD-IQ2_XXS`) y 102,24 GiB (`REAP216`) para los brazos evaluados; el teacher FP8 ocupa 305,8 GiB.
- El estudio esta disenado explicitamente para una maquina de 128 GB, lo que encaja con estaciones de trabajo con memoria unificada (por ejemplo, Apple Silicon de gama alta) o configuraciones multi-GPU.
- GPU recomendadas: no disponible en la informacion proporcionada; el unico runtime documentado para los brazos GGUF es llama.cpp, y el brazo REAP50-NVFP4-v2 requiere un motor CUDA propio.
- Cabe en GPU de consumo: no de forma individual; con 95-102 GiB de pesos no entra en una RTX 4090 (24 GB) ni en una A100 de 80 GB sin offload o sharding.
- Opciones de despliegue: llama.cpp para los brazos GGUF; motor CUDA personalizado para NVFP4. vLLM, Ollama y TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Expertos enrutados | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash (base) | 321B | 288, top-8 | no disponible | MIT | Hugging Face (`zai-org/GLM-5.3-Flash`) |
| GLM-5.3-Flash UD-Q2_K_XL | 321B (sin podar) | 288 | no disponible | MIT | Hugging Face (`unsloth/GLM-5.3-Flash-GGUF`) |
| GLM-5.3-Flash-REAP50-NVFP4-v2 | 321B (50% podado) | 144 | no disponible | MIT | Hugging Face (`patrickbdevaney/GLM-5.3-Flash-REAP50-NVFP4-v2`) |
| Este repositorio (estudio) | 321B (brazos 25% y 33%) | 216 y 192 | no disponible | MIT | Hugging Face (`patrickbdevaney/GLM-5.3-Flash-prune-vs-quant-matched-bytes`) |

No se han publicado comparaciones con modelos de otros autores en la informacion disponible.

## Limitaciones y advertencias

- El repositorio es un estudio de evaluacion, no un modelo listo para produccion; su tamano es de 0,3 GB y contiene artefactos de analisis, no pesos completos.
- El resultado negativo esta acotado a un unico modelo (GLM-5.3-Flash) y a un unico presupuesto de bytes (95-102 GiB); no debe generalizarse sin replicacion a otros MoE o a otros presupuestos.
- La poda de expertos induce bucles de repeticion en generacion libre sobre prompts generales e instrucciones, con impacto severo en MMLU-Pro (44 frente a 84) e IFBench (32 frente a 56) para el brazo del 50%.
- La degradacion por poda se concentra en texto general, multilingue e instrucciones, que son precisamente los dominios de uso de asistentes generales.
- El estudio no incluye healing ni fine-tuning tras la poda; los resultados de los brazos podados podrian mejorar con recuperacion posterior, algo que no se ha medido.
- La evaluacion teacher-forced mide acuerdo con el teacher, no calidad absoluta; un modelo podado podria conservar capacidad en tareas no cubiertas por los 9 dominios.
- Los brazos GGUF estan pensados para llama.cpp; el brazo NVFP4 requiere un motor CUDA propio no publicado como paquete estandar.
- Riesgo de alucinacion y sesgos: no se han publicado analisis especificos en la informacion disponible.
- La licencia MIT permite uso comercial, pero se hereda del modelo base; conviene verificar las condiciones de `zai-org/GLM-5.3-Flash`.

## Enlaces

- Repositorio del estudio: https://huggingface.co/patrickbdevaney/GLM-5.3-Flash-prune-vs-quant-matched-bytes
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- GGUF sin podar de Unsloth: https://huggingface.co/unsloth/GLM-5.3-Flash-GGUF
- Brazo REAP50-NVFP4-v2: https://huggingface.co/patrickbdevaney/GLM-5.3-Flash-REAP50-NVFP4-v2
- Paper referenciado (arXiv:2510.13999): https://arxiv.org/abs/2510.13999
- Fuentes de calibracion: `data/calibration_sources.csv` (dentro del repositorio)
- Script de conversion podada: `scripts/convert_pruned_gguf.py` (dentro del repositorio)
- Receta de cuantizacion: `scripts/gguf_recipe.py` y `recipes/` (dentro del repositorio)
