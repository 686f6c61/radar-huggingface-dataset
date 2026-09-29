# AxionML/GLM-5.3-NVFP4

## Resumen

AxionML/GLM-5.3-NVFP4 es una version cuantizada en NVFP4 del modelo GLM-5.3 de Z.ai (organizacion zai-org), un transformer de tipo Mixture-of-Experts disperso con atencion dispersa (DSA) y 753.000 millones de parametros totales, de los cuales se activan aproximadamente 40.000 millones por token. La cuantizacion la realizo RadixArk con NVIDIA Model Optimizer, y AxionML publica una copia espejo sin modificar del checkpoint original (revision `6e389189d564d9d3e4ea7fa284fe91f136d8ae2a`), pensada para servir el modelo en produccion con SGLang sobre hardware Blackwell. El objetivo es reducir el espacio ocupado por los pesos de aproximadamente 1.507 GB en BF16 a unos 465 GB, manteniendo la precision numerica en tareas de razonamiento y codigo.

El modelo resuelve el problema del coste de despliegue de un MoE de escala frontera: al cuantizar en FP4 los expertos enrutados (que representan el 96,2 % de los parametros) y dejar en BF16 las partes sensibles (atencion dispersa, indexador IndexShare, expertos compartidos, routers, capas densas, normas, embeddings, `lm_head` y tensores MTP), se consigue un checkpoint servible con decodificacion especulativa EAGLE funcional. Su ventana de contexto de 1.048.576 tokens lo situa en la categoria de modelos para tareas de horizonte largo: agentes de codificacion, operaciones de terminal y flujos multi-paso con repositorios completos en contexto.

Es relevante ahora porque GLM-5.3 es la version mas reciente de la familia GLM-5 de Z.ai y la propia organizacion la presenta como su modelo insignia para codificacion y tareas de horizonte largo, con mejoras que provienen exclusivamente del post-entrenamiento respecto a GLM-5.2. Esta ficha cubre exclusivamente la variante NVFP4 espejada por AxionML; los datos de rendimiento del checkpoint los reporta RadixArk, no AxionML.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE disperso con atencion dispersa (`GlmMoeDsaForCausalLM`), indexador IndexShare, 78 capas (3 densas + 75 MoE), 256 expertos enrutados (top-8) + 1 compartido, 1 capa MTP |
| Parametros totales | 753B segun la model card (el recuento de safetensors publicado en HuggingFace indica 380.989.135.104, aproximadamente 381B; la discrepancia no esta documentada) |
| Parametros activos | ~40B por token |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | NVFP4 W4A4 (group size 16, escalas de bloque FP8 E4M3, escalas de activacion estaticas por tensor) en los expertos enrutados de las 75 capas MoE; resto de componentes en BF16 |
| Idiomas soportados | no disponible |
| Licencia | zai-model-license (etiquetada como `license: other`; la model card la describe como de estilo MIT y apta para uso comercial y no comercial) |
| Formato de pesos | safetensors (tamano del repositorio: 464,9 GB) |

## Arquitectura y entrenamiento

La arquitectura es un Mixture-of-Experts disperso con atencion tambien dispersa. El modelo tiene 78 capas, de las cuales 3 son densas y 75 son MoE; cada capa MoE dispone de 256 expertos enrutados con activacion top-8 mas un experto compartido, y se anade una capa MTP (multi-token prediction) que en esta version cuantizada se mantiene en BF16 precisamente para habilitar decodificacion especulativa con el algoritmo EAGLE. El mecanismo de atencion incorpora un indexador denominado IndexShare, que participa en el esquema de atencion dispersa (DSA) y que no se cuantiza.

El proceso de cuantizacion, realizado por RadixArk con NVIDIA Model Optimizer v0.47.0.dev91, aplica NVFP4 W4A4 unicamente a las capas lineales de los expertos enrutados de las 75 capas MoE, lo que cubre el 96,2 % de los parametros. NVFP4 combina un codebook E2M1 de 4 bits con escalas de bloque FP8 E4M3 sobre micro-bloques de 16 elementos; el uso de escalas FP8 en lugar de escalas E8M0 limitadas a potencias de dos permite escalas fraccionarias y una seleccion de escala que minimiza el error. En los Tensor Cores de Blackwell, los multiplicadores FP4 nativos se combinan con acumulacion en FP32 para proteger la precision del producto escalar. La calibracion se hizo con 1.024 muestras de longitud 512 procedentes de `cnn_dailymail` y `Nemotron-Post-Training-Dataset-v2`. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF o DPO del modelo base en la informacion proporcionada; la model card remite a la documentacion de zai-org/GLM-5.3.

## Capacidades

- Generacion de texto conversacional y continuacion de texto en ingles, con pipeline declarado `text-generation`.
- Codificacion avanzada: la organizacion del modelo base lo describe como el modelo abierto mas capaz para programacion, con mejoras medidas en su benchmark interno Z.ai Code Bench.
- Tareas de horizonte largo: agentes que operan durante muchos pasos sobre repositorios o entornos de terminal (Terminal-Bench, DeepSWE en la evaluacion reportada).
- Razonamiento matematico y de competicion: la model card reporta resultados en GSM8K y AIME 2026.
- Modo de razonamiento explicito: el despliegue con SGLang define `--reasoning-parser glm45`, lo que implica soporte de bloques de razonamiento separados.
- Tool calling / function calling: `--tool-call-parser glm47` en la configuracion de SGLang confirma soporte de llamadas a herramientas.
- Capacidades de agente multi-paso con contexto de hasta 1.048.576 tokens, adecuadas para recorrer bases de codigo extensas o mantener estado de tareas prolongadas.
- Decodificacion especulativa EAGLE soportada gracias a la capa MTP preservada en BF16.
- Capacidades multilingues: no disponible.
- Vision o audio: no disponible; no se mencionan en la informacion proporcionada.

## Casos de uso

- Agentes de codificacion autonoma: con 1.048.576 tokens de contexto y soporte de tool calling, el modelo puede mantener un repositorio completo en la ventana, editar multiples ficheros, ejecutar tests y corregir errores en bucle, algo que los resultados en DeepSWE (68,1) y Terminal-Bench 2.1 (86,5) respaldan directamente.
- Automatizacion de operaciones en terminal: la evaluacion con el harness `terminus-2` y `mini-swe-agent` indica que el modelo esta entrenado para emitir comandos de shell y reaccionar a su salida, lo que permite construir agentes de administracion de sistemas o de reparacion de pipelines de CI.
- Asistente de refactorizacion a gran escala: la ventana de 1M tokens permite analizar modulos enteros de una aplicacion y proponer cambios coherentes entre ficheros, con la atencion dispersa reduciendo el coste computacional frente a una atencion densa.
- Generacion y revision de codigo en produccion: integrable mediante SGLang con parser de tool calling para invocar linters, compiladores o APIs internas dentro de un pipeline de CI/CD.
- Razonamiento matematico y verificacion formal asistida: los resultados en GSM8K (97,42) y AIME 2026 (94,17 en pass@1) lo hacen util para resolver problemas con verificacion paso a paso y para generar soluciones candidatas que luego se filtran por mayoria.
- Analisis de documentacion tecnica extensa: con 1M tokens de contexto se pueden procesar manuales, normativas o expedientes completos y responder preguntas con referencias cruzadas dentro del mismo documento.
- Simulacion de agentes de larga duracion en investigacion: la combinacion de contexto de 1M, capa MTP y decodificacion especulativa permite experimentar con planificacion multi-paso a bajo coste por token en comparacion con el checkpoint BF16.
- Evaluacion comparativa de tecnicas de cuantizacion: al mantener BF16 en atencion, routers y capa MTP, sirve como referencia para estudiar el impacto de FP4 solo en expertos sobre tareas de razonamiento.

## Benchmarks y rendimiento

Resultados reportados por RadixArk para este checkpoint, segun la model card. No se han publicado en la informacion disponible resultados comparativos con otros modelos en los mismos protocolos, salvo la afirmacion cualitativa de que GSM8K coincide exactamente con la fuente BF16 y que el pass@1 de AIME 2026 queda dentro del ruido entre ejecuciones.

| Benchmark | Protocolo | NVFP4 |
|---|---|---|
| GSM8K | split completo de 1.319 ejemplos | 97,42 |
| Terminal-Bench 2.1 | harness terminus-2 | 86,5 |
| DeepSWE | harness mini-swe-agent | 68,1 |
| AIME 2026 | 30 problemas x 16, pass@1 | 94,17 (maj@16 100) |

Datos adicionales de la organizacion del modelo base (GLM-5 GitHub): mejora del 50 % sobre GLM-5.2 en el benchmark interno Z.ai Code Bench y estado del arte en pesos abiertos en benchmarks publicos como Terminal Bench 3.0, sin cifras concretas publicadas en la informacion disponible.

## Requisitos de hardware

- Pesos: el repositorio ocupa 464,9 GB en safetensors frente a los aproximadamente 1.507 GB que ocuparia el checkpoint en BF16.
- VRAM minima para los pesos: al menos 8 aceleradores de 80 GB (640 GB en total) o 4 aceleradores de 141-192 GB. La configuracion validada por el autor es de 8x B300, que coincide con el `--tp-size 8` de la receta de SGLang. Una B300 individual dispone de 192 GB, insuficientes por si solas.
- Memoria adicional: la ventana de 1.048.576 tokens implica una cache KV considerable, cuyo tamano exacto no esta disponible en la informacion proporcionada; debe presupuestarse aparte de los pesos.
- GPU recomendadas: NVIDIA B300 (validado), B200 y H200 con soporte de FP4 nativo. Las GPU sin Tensor Cores FP4 (por ejemplo, A100 o H100) no ejecutan NVFP4 de forma nativa, por lo que no son una plataforma adecuada para este checkpoint.
- GPU de consumo: no cabe en ninguna GPU de consumo. El modelo no es desplegable en una RTX 4090 ni en configuraciones multi-GPU de consumo por el espacio de pesos y la necesidad de multiplicadores FP4 nativos.
- Opciones de despliegue: SGLang con `--quantization modelopt_fp4`, `--reasoning-parser glm45`, `--tool-call-parser glm47` y decodificacion especulativa EAGLE (`--speculative-algorithm EAGLE --speculative-num-steps 5 --speculative-eagle-topk 1 --speculative-num-draft-tokens 6`). El repositorio declara compatibilidad con la libreria `transformers` y la etiqueta `sglang`. El soporte en vLLM, llama.cpp, Ollama o TGI no se menciona en la informacion disponible; en particular, llama.cpp y Ollama no soportan el formato NVFP4 segun lo indicado.
- Latencia y throughput: no disponibles. El unico dato operativo es que la receta con EAGLE esta validada en 8x B300.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AxionML/GLM-5.3-NVFP4 | 753B totales, ~40B activos | 1.048.576 tokens | NVFP4 W4A4 en expertos enrutados, resto BF16 | zai-model-license | HuggingFace, espejo de RadixArk |
| RadixArk/GLM-5.3-NVFP4 | 753B totales, ~40B activos | 1.048.576 tokens | NVFP4 W4A4 (version original) | zai-model-license | HuggingFace |
| zai-org/GLM-5.3 (BF16) | 753B totales, ~40B activos | 1.048.576 tokens | BF16, ~1.507 GB | zai-model-license | HuggingFace |
| nvidia/GLM-5.3-Flash-NVFP4 | no disponible | no disponible | NVFP4 | no disponible | HuggingFace |
| Cuantizacion NVFP4 de Modal de GLM-5.3 | 753B totales, ~40B activos | 1.048.576 tokens | NVFP4 solo en expertos enrutados, resto BF16 | no disponible | Biblioteca de modelos de Modal |

No se dispone de datos de benchmarks comparativos entre estas variantes en la informacion proporcionada, mas alla de la equivalencia declarada entre NVFP4 y BF16 en GSM8K y AIME 2026.

## Limitaciones y advertencias

- El modelo base se entreno con datos que pueden contener lenguaje toxico y sesgos sociales; la version cuantizada hereda esas limitaciones y puede generar contenido inexacto, sesgado u ofensivo.
- Riesgo de alucinacion inherente a un modelo generativo de esta escala; el autor no publica tasas de alucinacion ni evaluaciones de veracidad.
- No se dispone de informacion sobre idiomas soportados ni sobre cobertura multilingue real.
- La licencia se declara como `zai-model-license` con etiqueta `other`, aunque la model card la describe como de estilo MIT y apta para uso comercial. Existe ademas una referencia externa que menciona licencia MIT para GLM-5.3; conviene revisar el texto completo del fichero LICENSE en el repositorio de zai-org/GLM-5.3 antes de un uso comercial.
- El checkpoint esta pensado para hardware Blackwell con soporte NVFP4 nativo; desplegarlo en generaciones anteriores exige conversion a otro formato y no esta documentado.
- La cuantizacion deja en BF16 los componentes sensibles, pero no se publican evaluaciones exhaustivas del degradado en tareas distintas de GSM8K y AIME 2026.
- El repositorio no tiene descargas ni valoraciones y es un espejo: la responsabilidad de la cuantizacion y de las cifras reportadas corresponde a RadixArk, y no hay garantia de mantenimiento continuado por parte de AxionML.
- Los numeros de parametros publicados en los metadatos de safetensors (aproximadamente 381B) no coinciden con los 753B de la model card; conviene verificar la configuracion real del checkpoint antes de planificar recursos.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/AxionML/GLM-5.3-NVFP4
- Modelo original cuantizado por RadixArk: https://huggingface.co/RadixArk/GLM-5.3-NVFP4
- Modelo base BF16 de Z.ai: https://huggingface.co/zai-org/GLM-5.3
- Licencia del modelo base: https://huggingface.co/zai-org/GLM-5.3/blob/main/LICENSE
- Cuantizacion NVFP4 de NVIDIA: https://huggingface.co/nvidia/GLM-5.3-Flash-NVFP4
- GLM-5.3 en la biblioteca de modelos de Modal: https://modal.com/library/zai/glm-5-3-nvfp4
- Recetario de SGLang para GLM-5.3: https://cookbook.sglang.io/autoregressive/GLM/GLM-5.3
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Repositorio de la familia GLM-5 en GitHub: https://github.com/zai-org/GLM-5
- Pagina informativa de GLM-5.3: https://openlm.ai/glm-5.3/
