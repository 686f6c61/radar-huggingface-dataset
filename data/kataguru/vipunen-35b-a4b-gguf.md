# kataguru/Vipunen-35B-A4B-GGUF

## Resumen

Vipunen-35B-A4B es un ajuste fino del modelo base Qwen/Qwen3.6-35B-A3B distribuido en formato GGUF por el usuario kataguru. El modelo parte de una arquitectura Mixture-of-Experts (MoE) de 35.505.251.456 parámetros totales, 40 capas y 256 expertos enrutados por capa, con una ventana de contexto nativa de 262.144 tokens y capacidad de visión integrada. El autor lo presenta como un modelo orientado a dos dominios especializados: finlandés e industrial (automatización PLC/CNC), manteniendo supuestamente las capacidades del modelo base.

La propuesta técnica se apoya en una metodología propia publicada por el autor (Track B Replace-Cartridge y SOMA/ARA) que reemplaza un subconjunto de expertos enrutados en determinadas capas (K = 12 de 256 expertos en L06–L39, con L00–L05 congeladas) y modifica la configuración de enrutamiento en inferencia a `num_experts_per_tok = 10`, de ahí la denominación "A4B". Se distribuye en tres cuantizaciones imatrix (APEX Small, Medium y Good) más un proyector de visión en F16.

Es relevante para desarrolladores que quieran ejecutar un modelo MoE de ~35B en GPUs de consumo (12–24 GB) mediante llama.cpp, LM Studio u Ollama, con capacidades multimodales y soporte declarado de finlandés y de lenguajes de automatización industrial. La licencia es Apache-2.0 y el modelo base es de Qwen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), base Qwen3.6-35B-A3B; 40 capas, 256 expertos enrutados por capa, visión + MTP |
| Parámetros totales | 35.505.251.456 |
| Parámetros activos | No disponible de forma explícita; el autor indica `num_experts_per_tok = 10` en inferencia (configuración "A4B") |
| Longitud de contexto | 262.144 tokens nativos (según model card) |
| Tipos de cuantización | GGUF imatrix APEX Small (~2,70 bpw), APEX Medium (~3,28 bpw), APEX Good (~3,71 bpw); proyector de visión F16 |
| Idiomas soportados | Finés (fi), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), con `mmproj-Vipunen-35B-A4B-f16.gguf` para visión; variante NVFP4 para vLLM disponible en otro repo |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura MoE del Qwen3.6-35B-A3B: 40 capas, 256 expertos enrutados por capa, atención transformer estándar con soporte de visión y MTP (multi-token prediction), y contexto nativo de 262.144 tokens. Sobre esa base, el autor aplica su metodología modular publicada: primero una fase SOMA/ARA en BF16 puro sobre las capas L14–L39, limitada a `attn` y `shared_expert` con `alpha=1.0`; después una fase Track B Replace-Cartridge que sustituye K = 12 de los 256 expertos enrutados en las capas L06–L39, dejando L00–L05 congeladas. El entrenamiento de la cartucha usa un escudo sobre `coding_qa` (2,5×, `rho = 0,1914`) con solapamiento del 1,65 % y `rel_dW = 0,79 %`.

Según la model card, no se modificaron 244 de los 256 expertos por capa, ni las capas L00–L05, ni los 333 tensores del codificador de visión. El ajuste declara mejoras de NLL en dos conjuntos de validación no vistos: `finnish_unseen_64` con −11,6 % y `plc_cnc_unseen_64` con −9,6 %. La fase de inferencia modifica el número de expertos activados por token de 8 a 10 (`A4B`). No se especifican en la información disponible el volumen total de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF/DPO adicional sobre el modelo base.

## Capacidades

- Generación de texto y razonamiento en finlandés e inglés, con mejora declarada en finlandés no visto (−11,6 % NLL).
- Codificación en lenguajes de automatización industrial: Siemens TIA Portal SCL, Beckhoff TwinCAT 3 ST, OPC UA, Sinumerik 840D / ISO G71, Heidenhain TNC 640 Klartext, ABB RAPID, KUKA KRL y URScript.
- Conocimiento declarado de seguridad funcional ISO 13849-1.
- Generación de código general y respuesta a preguntas de ingeniería de software (hereda capacidades del modelo base Qwen3.6).
- Capacidad multimodal de imagen a texto mediante el proyector `mmproj` en F16 (pipeline `image-text-to-text`).
- Razonamiento nativo de Qwen3.6 (modo `think`), preservado según la model card.
- Soporte de tool calling / function calling heredado del modelo base (BFCL V4 evaluado).
- Compatible con llama.cpp, LM Studio y Ollama; etiqueta `endpoints_compatible`.

## Casos de uso

- Programación de autómatas PLC en producción: el modelo puede generar y revisar código SCL para TIA Portal o Structured Text para TwinCAT 3, con conocimiento declarado de OPC UA, lo que reduce el tiempo de desarrollo en integraciones industriales.
- Generación de programas CNC: traducción entre dialectos (Sinumerik 840D, ISO G71, Heidenhain TNC 640 Klartext) y generación de ciclos de mecanizado con sintaxis específica del controlador.
- Asistencia técnica en finlandés: atención a operarios o ingenieros finlandeses con conversaciones multi-turno gracias a la ventana de 262.144 tokens y a la mejora en NLL de finlandés no visto.
- Revisión de seguridad funcional: verificación de conformidad con ISO 13849-1 en lógica de parada de emergencia y enclavamientos, usando el modelo como primer filtro antes de la revisión humana.
- Documentación técnica multimodal: a partir de capturas de HMI, esquemas eléctricos o pantallas de PLC, el modelo puede describir el estado, extraer parámetros y proponer correcciones usando el proyector de visión.
- Despliegue local en planta: al caber en GPUs de 12–24 GB (APEX Small 12,07 GiB, Medium 13,57 GiB, Good 15,65 GiB), permite inferencia en el edge sin enviar código propietario a la nube.
- Generación de código general y automatización de pipelines: hereda las capacidades de coding del modelo base y puede integrarse en flujos de CI/CD con tool calling para tareas de refactorización o generación de tests.

## Benchmarks y rendimiento

Datos medidos por el autor sobre la build de referencia NVFP4 con 2× RTX 5090, TP=2, vLLM 0.29.0, CUDAGraphs activados, contexto de 16.384 y una sola repetición (N = 1):

| Benchmark | Qwen3.6-35B-A3B base (k=8) | Vipunen mismos pesos (k=8) | Vipunen-35B-A4B (k=10) | Δ vs. base (k=8) |
|---|---|---|---|---|
| LiveCodeBench v6 (Pass@1, 175) | 34,86 % | 33,71 % | 39,43 % | +4,57 |
| GPQA Diamond (198) | 70,20 % | 71,21 % | 72,73 % | +2,53 |
| BFCL V4 Single-Turn AST | 80,28 % | 81,33 % | 83,00 % | +2,73 |
| IFEval Prompt / Inst Strict | 55,27 % / 64,15 % | 56,75 % / 65,47 % | 58,41 % / 66,67 % | +3,14 / +2,52 |
| ARC-Easy / ARC-Challenge / BoolQ | 71,68 / 54,78 / 87,77 % | 71,42 / 55,29 / 87,95 % | 73,99 / 56,74 / 89,30 % | +2,31 / +1,96 / +1,53 |
| Media de 14 tareas (ex-1024 GSM8K) | 65,41 % | 65,50 % | 66,72 % | +1,31 |

Throughput medido con `llama-bench` en una RTX 5090 única, `-ngl 99`, `pp512` / `tg128`, 24 hilos:

| Cuantización | Tamaño | pp512 (t/s) | tg128 (t/s) |
|---|---|---|---|
| APEX Small | 12,06 GiB | 225,41 ± 17,63 | 25,53 ± 0,37 |
| APEX Medium | 13,56 GiB | 221,88 ± 12,66 | 24,97 ± 0,26 |
| APEX Good | 15,64 GiB | 213,49 ± 5,56 | 23,31 ± 0,63 |

No se han publicado en la información disponible resultados de benchmarks para los conjuntos de validación finlandés e industrial más allá de las variaciones de NLL (−11,6 % y −9,6 %).

## Requisitos de hardware

- VRAM estimada para inferencia: 12,07 GiB (APEX Small), 13,57 GiB (APEX Medium), 15,65 GiB (APEX Good); añadir 0,84 GiB si se usa el proyector de visión.
- GPU recomendadas por el autor: 12–16 GB para APEX Small, 16 GB para APEX Medium (recomendada), 24 GB o más (o Apple Silicon) para APEX Good.
- Cabe en GPUs de consumo: RTX 5090 (medida), RTX 4090, RTX 4080, RTX 3090, RTX 4070 Ti Super y similares con 16 GB o más; en Apple Silicon con memoria unificada de 16 GB o más.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (etiquetas del repo); para servidores Blackwell con vLLM existe la build `kataguru/Vipunen-35B-A4B-NVFP4`.
- Throughput de referencia en RTX 5090 con `-ngl 99`: aproximadamente 213–225 t/s en prefill (`pp512`) y 23–26 t/s en generación (`tg128`) según cuantización; los valores son de CPU según la tabla de `llama-bench` publicada, por lo que deben tomarse como referencia orientativa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Vipunen-35B-A4B | 35,5 B (MoE, k=10) | 262.144 | Apache-2.0 | GGUF, NVFP4 | Especializado en finlandés e industrial; visión incluida |
| Qwen3.6-35B-A3B (base) | 35,5 B (MoE, k=8) | 262.144 | Apache-2.0 | safetensors, GGUF | Modelo base sin especialización; sirve de referencia en los benchmarks del autor |
| Modelos MoE de ~30–40 B de la familia Qwen3 | ~30–40 B | No disponible | Apache-2.0 | safetensors, GGUF | Alternativa generalista sin especialización en finlandés ni PLC/CNC |

No se dispone en la información proporcionada de comparativas con otros modelos especializados en finlandés o en automatización industrial; esa comparación se marca como no disponible.

## Limitaciones y advertencias

- Los benchmarks publicados por el autor se han medido con N = 1 (una sola repetición) sobre la build NVFP4, no sobre los GGUF distribuidos en este repo; la variabilidad estadística no está cuantificada.
- Las mejoras de NLL (−11,6 % finlandés, −9,6 % PLC/CNC) son métricas de perplejidad sobre conjuntos de validación propios, no resultados de benchmarks estándar de razonamiento o coding en esos dominios.
- El modelo declara soporte solo de finés e inglés; el rendimiento en castellano no está evaluado y probablemente sea inferior al del modelo base.
- La especialización en PLC/CNC cubre dialectos concretos (Siemens, Beckhoff, Sinumerik, Heidenhain, ABB, KUKA, Universal Robots); no hay evidencia de cobertura de otros fabricantes.
- Riesgo de alucinación en código de seguridad funcional: las salidas relacionadas con ISO 13849-1 deben ser revisadas por un ingeniero certificado antes de su uso en producción.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.6 puede tener sus propias condiciones; conviene verificar la licencia del modelo base antes de desplegar.
- El repo tiene 0 descargas y 1 like en el momento de la ficha, lo que indica validación comunitaria muy limitada.
- El método de ajuste (reemplazo de cartuchas de expertos) está publicado por el propio autor; no hay replicación independiente conocida en la información disponible.
- El contexto nativo es de 262.144 tokens, pero el consumo de VRAM crece con la longitud de contexto y puede exceder la GPU objetivo en ventanas muy largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kataguru/Vipunen-35B-A4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Build NVFP4 para vLLM: https://huggingface.co/kataguru/Vipunen-35B-A4B-NVFP4
- Metodología (repositorio): https://github.com/kataguru/functional-locality-moe (DOI: 10.5281/zenodo.24445840)
- Sistemas (repositorio): https://github.com/kataguru/moe-longcot-nondeterminism (DOI: 10.5281/zenodo.24445305)
