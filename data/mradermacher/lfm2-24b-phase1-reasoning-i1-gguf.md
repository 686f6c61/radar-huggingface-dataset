# mradermacher/lfm2-24b-phase1-reasoning-i1-GGUF

## Resumen

mradermacher/lfm2-24b-phase1-reasoning-i1-GGUF es un repositorio de cuantizaciones GGUF generadas por mradermacher (nethype GmbH) a partir del modelo comunitario shuff57/lfm2-24b-phase1-reasoning, un ajuste fino en inglés de la familia LFM2 en su variante de mezcla de expertos (etiqueta lfm2_moe). Los pesos en safetensors del modelo base declaran 23.843.661.440 parámetros (unos 23,8 B), y su entrenamiento se realizó con Unsloth y LoRA sobre el dataset sintético shuff57/ogre-phase1-synth.

El repositorio no contiene los pesos originales en precisión completa, sino versiones cuantizadas en formato GGUF pensadas para inferencia local con llama.cpp y sus derivados. Se ofrecen cuantizaciones con importance matrix (imatrix) y variantes estáticas en un repositorio hermano; las más equilibradas por relación tamaño/calidad son i1-Q4_K_S (13,6 GB) e i1-Q4_K_M (14,5 GB), mientras que las más pequeñas (i1-Q2_K, 8,8 GB) permiten desplegarlo en GPU de 12 GB a costa de degradar la calidad.

Su relevancia debe tratarse con cautela: no hay benchmarks publicados, la model card apenas documenta contexto, alineación o composición del dataset, y el repositorio registra cero descargas y cero valoraciones en el momento de redactar esta ficha. Es un artefacto útil para experimentar con un MoE de ~24 B en hardware de consumo o para investigar el efecto de las cuantizaciones i1, no una opción respaldada para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) de la familia LFM2, según la etiqueta `lfm2_moe`; número de expertos y top-k no disponibles |
| Parámetros totales | 23.843.661.440 (≈23,8 B, dato de los safetensors del modelo base) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1 (imatrix): Q2_K (8,8 GB), IQ3_XXS (9,3 GB), IQ3_M (10,5 GB), Q3_K_M (11,5 GB), Q4_K_S (13,6 GB), Q4_K_M (14,5 GB) y otras variantes listadas en las etiquetas (Q2_K_S, IQ2_M, IQ2_S, IQ2_XS, IQ2_XXS, IQ1_S, IQ1_M, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_L, IQ4_XS, small-IQ4_NL, Q5_K_S, Q5_K_M, Q6_K, Q4_0, Q4_1). Cuantizaciones estáticas en el repositorio hermano |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado con llama.cpp); safetensors en el modelo base |
| Modelo base | shuff57/lfm2-24b-phase1-reasoning |
| Dataset declarado | shuff57/ogre-phase1-synth |
| Técnica de cuantización | imatrix (importance matrix), con `output_tensor_quantised: 1` y `convert_type: hf` |
| Tamaño del repositorio | 75,5 GB (incluye todas las cuantizaciones publicadas) |
| Repositorio hermano | mradermacher/lfm2-24b-phase1-reasoning-GGUF (cuantizaciones estáticas) |
| Creado / actualizado | 2026-10-01 |

## Arquitectura y entrenamiento

La etiqueta `lfm2_moe` identifica el modelo como una variante de mezcla de expertos de la familia LFM2 (Liquid Foundation Model 2). No se dispone de información sobre el número de expertos, la estrategia de enrutamiento, el top-k, el número de capas ni la dimensión oculta, por lo que no es posible detallar la arquitectura interna más allá de su carácter MoE. Tampoco se documenta la longitud de contexto nativa.

El modelo base se entrenó como un ajuste fino de tipo LoRA con Unsloth, según las etiquetas del repositorio, sobre el dataset sintético shuff57/ogre-phase1-synth. El nombre "phase1" sugiere una primera fase dentro de una canalización de entrenamiento por etapas, pero el autor no describe el proceso completo. No hay información sobre número de tokens de entrenamiento, composición del dataset, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO.

Sobre este modelo base, mradermacher ha generado cuantizaciones GGUF ponderadas con importance matrix. El proceso consiste en calcular una matriz de importancia a partir de datos de calibración y usarla para decidir qué pesos se cuantizan con más precisión, lo que en teoría reduce la pérdida de perplejidad respecto a las cuantizaciones estáticas del mismo tamaño. El repositorio incluye el propio fichero imatrix (0,2 GB) para quien quiera generar sus propias cuantizaciones.

## Capacidades

- Generación de texto en inglés, con etiqueta explícita `reasoning` que apunta a un uso orientado a cadenas de razonamiento.
- Uso conversacional (etiqueta `conversational`).
- Inferencia local eficiente gracias al formato GGUF y a la arquitectura MoE, que activa solo una fracción de los parámetros por token (fracción no documentada).
- Compatibilidad con endpoints compatibles (`endpoints_compatible`) en el ecosistema de llama.cpp.
- No hay información que confirme soporte de tool calling o function calling.
- No hay información que confirme capacidades de agente o razonamiento multi-paso estructurado.
- No hay información que confirme capacidades de visión, audio, ni un modo "thinking" explícito.
- Capacidad multilingüe: solo inglés declarado.

## Casos de uso

- Análisis de documentación técnica en inglés con datos sensibles: al ejecutarse en local con llama.cpp y el quant i1-Q4_K_M (14,5 GB), permite procesar documentación interna sin enviarla a APIs externas, requisito habitual en entornos con restricciones de confidencialidad.
- Extracción de información estructurada por lotes: en un pipeline nocturno, el modelo puede resumir y clasificar grandes volúmenes de texto en inglés; el coste marginal por documento es cero una vez desplegado.
- Investigación sobre cuantización: comparar la perplejidad de las cuantizaciones i1 frente a las estáticas del repositorio hermano permite medir empíricamente la pérdida de calidad asociada a cada tipo de quant.
- Base para ajuste fino posterior con LoRA o QLoRA: al ser ya un derivado de LoRA del modelo base, sirve como punto de partida para adaptaciones de dominio en inglés sobre hardware de consumo.
- Asistente conversacional interno en inglés: su etiqueta `conversational` y su tamaño lo hacen viable como chat de intranet para equipos técnicos, siempre que se asuma la ausencia de evaluaciones públicas.
- Estudio de arquitecturas MoE en hardware de consumo: permite medir throughput y latencia con descarga parcial de expertos a CPU (por ejemplo, `--n-cpu-moe` en llama.cpp) usando un MoE de ~24 B sobre una única GPU.
- Generación de datos sintéticos de razonamiento en inglés: el nombre del dataset asociado (`ogre-phase1-synth`) y la fase "phase1" apuntan a este uso, generando trazas de razonamiento para alimentar fases posteriores de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y tampoco hay evaluaciones comparativas frente a las cuantizaciones estáticas o frente al modelo base en safetensors.

## Requisitos de hardware

- VRAM estimada para inferencia, partiendo del tamaño de cada fichero más 1-3 GB de sobrecarga (KV cache y runtime, dependiendo del contexto configurado): i1-Q2_K ≈ 10-12 GB; i1-IQ3_XXS ≈ 11-13 GB; i1-IQ3_M ≈ 12-14 GB; i1-Q3_K_M ≈ 13-15 GB; i1-Q4_K_S ≈ 15-17 GB; i1-Q4_K_M ≈ 16-18 GB.
- GPU recomendadas para Q4_K_M con todo en VRAM: RTX 4090 (24 GB), RTX 3090 (24 GB), A6000 (48 GB), L40S (48 GB). Para Q2_K o IQ3_XXS basta una GPU de 12-16 GB.
- Cabe en GPU de consumo: sí. Una RTX 4090 o 3090 de 24 GB ejecuta i1-Q4_K_M con margen; GPUs de 16 GB (RTX 4080, 4070 Ti Super) van justas con i1-Q3_K_M o i1-Q4_K_S; GPUs de 12 GB (RTX 3060 12 GB, 4070) quedan limitadas a i1-Q2_K o i1-IQ3_XXS.
- Descarga de expertos a CPU: al ser un MoE, llama.cpp permite mantener las capas de atención en GPU y enviar los expertos a RAM, lo que habilita cuantizaciones mayores con VRAM reducida a cambio de ancho de banda de memoria del sistema.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, llama-cpp-python y, con soporte experimental para GGUF, vLLM. La etiqueta `text-generation-inference` aparece en el repositorio, pero no se documentan detalles de compatibilidad con TGI.
- Latencia y throughput: no disponibles. Dependen del tipo de cuantización, del reparto GPU/CPU de expertos, del hardware y del contexto utilizado.
- Para reproducir el modelo base en precisión fp16 harían falta del orden de 48 GB de VRAM (23,8 B × 2 bytes), fuera del alcance de GPU de consumo.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | GGUF disponible |
|---|---|---|---|---|---|
| lfm2-24b-phase1-reasoning (este repositorio, i1 GGUF) | 23,8 B | no disponible | no disponible | apache-2.0 (declarada por el cuantizador) | sí (i1 + estáticas) |
| Qwen3-30B-A3B | ~30,5 B | ~3,3 B | 128k | Apache-2.0 | sí |
| gpt-oss-20b | ~21 B | ~3,6 B | 128k | Apache-2.0 | sí |
| LFM2-8B-A1B | ~8,3 B | ~1,5 B | 32k (documentación pública de la familia LFM2) | LFM Open License v1.0 | sí |

Los datos de las filas correspondientes a Qwen3-30B-A3B, gpt-oss-20b y LFM2-8B-A1B provienen de documentación pública de terceros y deben verificarse antes de usarlos en una decisión técnica; no proceden de la información proporcionada en este repositorio. La comparación es además asimétrica: este modelo es un ajuste fino comunitario sin benchmarks, por lo que no se puede afirmar su posición relativa en calidad frente a las alternativas.

## Limitaciones y advertencias

- Solo se declara inglés. Las entradas en castellano o en otros idiomas pueden degradar notablemente la calidad de salida.
- Al ser una cuantización, existe pérdida de calidad respecto a los safetensors originales. Las variantes de menor tamaño (Q2_K, IQ3_XXS, IQ1/IQ2) sufren especialmente; para uso serio conviene partir de Q4_K_S o superior.
- Es un ajuste fino comunitario (shuff57), no una publicación oficial de Liquid AI, y no tiene benchmarks publicados ni evaluaciones de terceros.
- El repositorio registra cero descargas y cero valoraciones, por lo que no existe validación de la comunidad sobre su funcionamiento real.
- No se documenta la longitud de contexto soportada, lo que impide garantizar un comportamiento correcto con entradas largas.
- No hay información sobre sesgos, datos de entrenamiento, filtrado del dataset ni procesos de alineación; el riesgo de alucinación no está cuantificado y no puede descartarse.
- No está confirmado el soporte de tool calling, function calling ni flujos de agente; no conviene asumirlo en un diseño de producción.
- La licencia declarada para el repositorio es apache-2.0, pero conviene verificar la licencia del modelo base y del dataset `shuff57/ogre-phase1-synth` antes de un uso comercial.
- El repositorio ocupa 75,5 GB; descargar todas las cuantizaciones es innecesario y conviene seleccionar un único fichero.
- Para producción se recomienda una evaluación propia (perplejidad sobre el dominio objetivo y pruebas de regresión) antes de cualquier despliegue.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/lfm2-24b-phase1-reasoning-i1-GGUF
- Página de resumen y descargas del cuantizador: https://hf.tst.eu/model#lfm2-24b-phase1-reasoning-i1-GGUF
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/lfm2-24b-phase1-reasoning-GGUF
- Modelo base: https://huggingface.co/shuff57/lfm2-24b-phase1-reasoning
- Dataset declarado: https://huggingface.co/datasets/shuff57/ogre-phase1-synth
- Fichero imatrix: https://huggingface.co/mradermacher/lfm2-24b-phase1-reasoning-i1-GGUF/resolve/main/lfm2-24b-phase1-reasoning.imatrix.gguf
- Quant i1-Q4_K_M (recomendado): https://huggingface.co/mradermacher/lfm2-24b-phase1-reasoning-i1-GGUF/resolve/main/lfm2-24b-phase1-reasoning.i1-Q4_K_M.gguf
- Quant i1-Q4_K_S: https://huggingface.co/mradermacher/lfm2-24b-phase1-reasoning-i1-GGUF/resolve/main/lfm2-24b-phase1-reasoning.i1-Q4_K_S.gguf
- Quant i1-Q2_K: https://huggingface.co/mradermacher/lfm2-24b-phase1-reasoning-i1-GGUF/resolve/main/lfm2-24b-phase1-reasoning.i1-Q2_K.gguf
- Guía de uso de GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica comparativa de tipos de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
