# kingjones777/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-Heretic-ROCmFP4-FAST-imatrix-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF en formato ROCmFP4 del modelo DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, un derivado «herético» (sin comportamiento de rechazo) del Qwen/Qwen3.8-27B. El artefacto lo publica el usuario kingjones777 y su rasgo diferencial no es el modelo en sí, sino el formato de pesos: usa tipos de tensor propios (`TYPE_101`, ROCmFP4) que requieren un fork de `llama.cpp` denominado ROCmFPX (kingjones30/ROCmFPX, a su vez fork de charlie12345/ROCmFPX). Con `llama.cpp` de serie el fichero no carga.

Se trata de un modelo `qwen3_5` híbrido (atención + linear attention/SSM) con 64 capas transformer más un bloque MTP/nextn adicional (`blk.64`) incrustado en los propios pesos, que actúa como cabeza de borrador para decodificación especulativa sin necesidad de fichero draft separado. Incluye además la torre de visión completa de Qwen3.5-VL (encoder deepstack de 27 capas, proyección 1152→5120) distribuida como `mmproj` aparte en BF16, por lo que el pipeline declarado es `image-text-to-text`.

Su relevancia es doble: por un lado, es un ejemplo práctico de cuantización calibrada con importance matrix (imatrix) sobre un modelo fusionado de 27B; por otro, demuestra decodificación especulativa con MTP medida sobre hardware AMD Strix Halo (gfx1151), con una ganancia declarada de +76 % en throughput. Los datos de la model card corresponden a una única configuración verificada (Ryzen AI Max+ 395 con ROCm 7.2.4); no hay resultados en benchmarks académicos estándar ni validación independiente de la comunidad (0 descargas y 0 «likes» en el momento de redactar esta ficha).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido `qwen3_5` (atención + linear attention/SSM), 64 capas transformer + 1 bloque MTP/nextn adicional (`blk.64`) |
| Parametros totales | 460.730.096 según los metadatos de safetensors del repositorio; la nomenclatura del modelo y de su base indica 27B. Discrepancia no aclarada por el autor |
| Parametros activos | no aplica (no es un modelo MoE, es denso híbrido) |
| Longitud de contexto | no disponible (los ejemplos de la model card arrancan el servidor con `-c 8192`, pero no se declara el máximo del modelo) |
| Tipos de cuantizacion | `Q4_0_ROCMFP4_FAST` ponderada por imatrix (tensores `attn_*`, `ffn_*`, `ssm_*` y `token_embd.weight` en `TYPE_101`/ROCmFP4); `output.weight` (lm head) protegido en Q6_K; bloque MTP en `Q4_0_ROCMFP4_FAST`; torre de visión en BF16. Se construyó un tier STRIX_LEAN que no se publicó |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero único de 14,93 GB, sin sharding, + `mmproj` BF16 de 0,93 GB) |

## Arquitectura y entrenamiento

La arquitectura declarada es `qwen3_5`, un diseño híbrido que combina capas de atención con capas de atención lineal/SSM, organizadas en 64 capas transformer a las que se añade un bloque MTP (multi-token prediction, también llamado nextn) identificado como `blk.64`. Ese bloque no es un modelo aparte: está horneado en el propio GGUF y se usa con `--spec-type draft-mtp`, apuntando `-md` al mismo fichero. El pipeline de conversión documentado separa el texto (incluido el bloque MTP) de la torre de visión: `convert_hf_to_gguf.py` para el primero y la misma herramienta con `--mmproj` para el segundo.

El proceso de cuantización es explícito y reproducible: se calculó la importance matrix sobre el modelo en BF16 con `llama-imatrix` usando el dataset de calibración `calibration_datav3` de bartowski y `-c 512`, y después se aplicó `llama-quantize --imatrix ... --output-tensor-type q6_K` con el tipo `Q4_0_ROCMFP4_FAST` y 16 hilos. El autor reconoce que la ganancia de imatrix en este modelo es de solo −0,57 % de perplejidad, muy inferior al −5,9 % que dio en un build MoE Flash-Next, y lo atribuye a que se trata de una fusión muy mezclada y, por tanto, poco sensible a la calibración. No se documentan datos de entrenamiento (número de tokens, composición del dataset) ni etapas de RLHF/DPO: el modelo base es a su vez una fusión de terceros, no un entrenamiento desde cero.

## Capacidades

- Generación de texto autoregresiva en un modelo híbrido de 27B (atención + SSM) fusionado por DavidAU a partir de Qwen3.8-27B.
- Procesamiento de imagen a texto (`image-text-to-text`): la torre de visión Qwen3.5-VL de 27 capas (1152→5120) se sirve como `mmproj` BF16. El autor verificó que una imagen roja de prueba devuelve «Red» con 1.094 tokens de prompt, de los cuales ~1.024 son tokens de imagen.
- Decodificación especulativa integrada mediante el bloque MTP: aceptación medida de 0,948 con longitud media aceptada de 4,07/4 (por posición 1,00 / 0,97 / 0,63 / 0,47).
- Modo `--spec-mtp-strict-qwen` para verificación estricta cuando se necesita un comportamiento bit a bit equivalente al decodificado sin especulación.
- Compatibilidad con el formato de chat OpenAI para imágenes (`image_url` como data-URI o URL), con `--jinja` activado para plantillas de chat.
- Ajuste de resolución de imagen mediante `--image-min-tokens 1024`, necesario para mantener el grounding de Qwen-VL.
- Tool calling / function calling: no disponible (no se documenta en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingües: no disponible (no se declaran idiomas).

## Casos de uso

- Inferencia local en equipos AMD Strix Halo: es el escenario para el que está construido y medido. Con un Ryzen AI Max+ 395, ROCm 7.2.4 y offload completo (`-ngl 999`, `-fa on`) el fichero de 14,93 GB más el `mmproj` de 0,93 GB cabe en memoria unificada y sirve a 13,65 tok/s en modo plano.
- Chat interactivo con latencia reducida: activando `--spec-type draft-mtp --spec-draft-n-min 2 --spec-draft-n-max 4` el mismo hardware pasa a 24,02 tok/s (+76 %). Es el caso de uso natural para un asistente conversacional servido con `llama-server`.
- Análisis de imágenes con grounding detallado: tareas de VQA o descripción de documentos donde importa la localización fina de elementos, usando `--image-min-tokens 1024` para evitar la degradación del grounding por debajo de ese umbral.
- Investigación sobre comportamiento «uncensored» y seguridad de modelos: el merge de DavidAU elimina el comportamiento de rechazo, lo que lo convierte en material para estudios de red teaming, evaluación de jailbreaks y análisis de alineación. Requiere uso deliberado y control del entorno.
- Reproducción de pipelines de cuantización: el autor documenta los cuatro pasos (convert, imatrix, quantize, perplexity) con los comandos exactos, lo que permite reproducir el experimento y estudiar el impacto real de imatrix en modelos fusionados de 27B frente a arquitecturas MoE.
- Evaluación comparativa de tipos de tensor ROCmFP4: sirve como banco de pruebas para medir la pérdida de calidad de `Q4_0_ROCMFP4_FAST` frente a BF16 sobre un mismo modelo, usando perplejidad en WikiText-2 raw como métrica reproducible.
- Servicio multimodal self-hosted en entornos con GPU AMD: permite desplegar un endpoint compatible con el formato OpenAI de chat con imágenes sin depender de infraestructura NVIDIA, siempre que se compile el fork ROCmFPX para el target correspondiente.
- Procesamiento por lotes offline de texto largo moderado: con `-c 8192` y `-np 1` se puede usar para resúmenes o extracción de información en documentos, aceptando el throughput medido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las únicas métricas publicadas son medidas por el autor sobre hardware concreto y se recogen a continuación.

Calidad, perplejidad sobre held-out WikiText-2 raw con `-c 512` en Ryzen AI Max+ 395 (gfx1151), ROCm 7.2.4:

| Build | Perplejidad (PPL) |
|---|---|
| FAST sin imatrix (control) | 6,6959 ± 0,042 |
| FAST con imatrix (este repositorio) | 6,6577 ± 0,042 (−0,57 %) |
| STRIX_LEAN con imatrix (no publicado) | 6,6944 |

Decodificación especulativa con MTP, medida sobre este mismo fichero:

| Modo | Tokens/s | Aceptación |
|---|---|---|
| Decodificado plano | 13,65 | no aplica |
| `--spec-type draft-mtp` | 24,02 (+76 %) | 0,948 (longitud media aceptada 4,07/4; por posición 1,00 / 0,97 / 0,63 / 0,47) |

Verificación multimodal: imagen de prueba roja, respuesta «Red», 1.094 tokens de prompt (~1.024 de ellos de imagen).

## Requisitos de hardware

- Pesos: 14,93 GB para el fichero principal (texto + bloque MTP) y 0,93 GB para el `mmproj` de visión en BF16. Total en disco y en memoria de pesos: ~15,9 GB.
- Caché KV y estado SSM adicionales según `-c`; los ejemplos documentados usan `-c 8192`. Con MTP hay además caché del borrador, aunque el fichero draft sea el mismo.
- GPU verificada: Ryzen AI Max+ 395 integrada (AMD, gfx1151, familia Strix Halo) con ROCm 7.2.4 y offload completo. Es la única configuración con cifras medidas.
- Requisito de software imprescindible: no funciona con `llama.cpp` de serie. Hay que compilar el fork ROCmFPX con `-DGGML_HIP=ON -DGPU_TARGETS=gfx1151 -DGGML_NATIVE=ON`, generando los binarios `llama-server` y `llama-quantize`.
- Otras GPU AMD (RDNA3, RDNA4, MI series): no disponible. El autor solo documenta el target `gfx1151`; el soporte de otros targets no se declara.
- GPU NVIDIA / CUDA: no disponible. Los tipos de tensor ROCmFP4 son específicos del backend ROCm del fork.
- Cabe en GPU de consumo: no disponible como afirmación verificada. El tamaño de pesos (~15,9 GB) está por debajo de los 16 GB de VRAM nominal de una RTX 4090, pero el backend y los tipos de tensor documentados son ROCm, no CUDA, y no hay mediciones en esa plataforma.
- Opciones de despliegue documentadas: `llama-server` (fork ROCmFPX) con `-ngl 999 -fa on -np 1 -c 8192 --jinja`; `llama-quantize` y `llama-imatrix` para reproducir el pipeline; `llama-perplexity` para evaluación (sin `-dio`). No se documenta compatibilidad con vLLM, TGI, Ollama ni LM Studio, que probablemente no soportan estos tipos de tensor.
- Rendimiento medido: 13,65 tok/s en decodificado plano y 24,02 tok/s con MTP sobre Ryzen AI Max+ 395. No hay datos de latencia de primer token ni de throughput por lotes.

## Comparativa con modelos similares

| Modelo | Arquitectura / tamano | Cuantizacion | Multimodal | Hardware objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este repositorio (kingjones777 ROCmFP4 FAST imatrix GGUF) | `qwen3_5` hibrido + MTP, 27B nominal (460.730.096 parametros segun safetensors) | Q4_0_ROCMFP4_FAST + imatrix, 14,93 GB + mmproj 0,93 GB | Si (vision Qwen3.5-VL, 27 capas) | ROCm / gfx1151 (verificado) | apache-2.0 | 0 descargas, 0 likes |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU | Misma base fusionada, sin cuantizar | BF16/FP16 (tamano no disponible) | No disponible | GPU con memoria suficiente para 27B en BF16 | no disponible | Modelo base del que deriva este artefacto |
| Qwen/Qwen3.8-27B | Modelo original de Qwen | Pesos originales | No disponible | no disponible | no disponible | Modelo raiz |
| Build ROCmFP4 del Flash-Next MoE (mencionado en la model card como referencia de imatrix) | MoE, con tabla PLE y tier STRIX_LEAN | Q4_0_ROCMFP4_FAST + imatrix (−5,9 % PPL) | no disponible | ROCm / gfx1151 | no disponible | No disponible en esta informacion |

No se dispone de datos de benchmarks homogeneos que permitan comparar estos modelos en MMLU, HumanEval o GSM8K; la unica metrica comparable entre ellos es la perplejidad en WikiText-2 raw medida en el mismo runtime, y solo para los builds de este autor.

## Limitaciones y advertencias

- Modelo «uncensored»: el merge de DavidAU elimina el comportamiento de rechazo. Puede producir contenido dañino, ilegal o gravemente sesgado sin filtros. El propio autor lo etiqueta como artefacto de investigación y pide uso deliberado y responsabilidad sobre la salida.
- Dependencia de un fork no oficial: `llama.cpp` de serie no carga el fichero. Requiere compilar ROCmFPX desde el repositorio de GitHub del autor, lo que añade riesgo de mantenimiento, actualizaciones y compatibilidad a largo plazo.
- Compatibilidad de hardware muy restringida: la única configuración verificada es AMD gfx1151 con ROCm 7.2.4. No hay soporte documentado para CUDA, Vulkan, Metal ni otros targets GPU.
- Discrepancia en el recuento de parámetros: los metadatos de safetensors indican 460.730.096 parámetros, mientras que el nombre del modelo y su base indican 27B. No hay explicación del autor; conviene verificar el modelo antes de asumir su tamaño real.
- Contexto máximo no documentado: los ejemplos usan 8192 tokens, pero no se declara la ventana nativa del modelo. No se debe asumir contexto largo sin probarlo.
- Idiomas no declarados: no hay lista de idiomas soportados ni evaluación multilingüe.
- Degradación del grounding visual: el autor advierte que el grounding de Qwen-VL empeora por debajo de ~1024 tokens de imagen y que el servidor lanza un aviso si se omite `--image-min-tokens 1024`.
- Divergencia con decodificación especulativa: la salida greedy con MTP puede diferir ligeramente de la decodificación sin especulación; para equivalencia estricta hay que usar `--spec-mtp-strict-qwen`.
- Evidencia empírica muy limitada: la validación se reduce a una imagen de prueba y a la perplejidad en WikiText-2 raw con `-c 512`. No hay MMLU, HumanEval, GSM8K ni evaluaciones de alucinación o sesgo. El repositorio tiene 0 descargas y 0 likes, por lo que no ha pasado ninguna revisión de la comunidad.
- La ganancia de imatrix es marginal (−0,57 % de PPL) según el propio autor; no cabe esperar mejoras sustanciales de calidad por este motivo.
- Licencia apache-2.0: permite uso comercial en los términos de dicha licencia, pero eso no exime de responsabilidad sobre el contenido generado por un modelo sin alineación de seguridad. Las licencias de los modelos base y de la fusión intermedia no están declaradas en la información disponible.
- Los metadatos del repositorio indican fecha de creación y actualización el 16 de septiembre de 2026, con dos minutos de diferencia entre ambas; el repositorio parece un volcado puntual sin historial de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kingjones777/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-Heretic-ROCmFP4-FAST-imatrix-GGUF
- Modelo base (fusion herética de DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Modelo raíz: https://huggingface.co/Qwen/Qwen3.8-27B
- Fork de runtime ROCmFPX usado por el autor: https://github.com/kingjones30/ROCmFPX
- Fork original de ROCmFPX: https://github.com/charlie12345/ROCmFPX
- Dataset de calibración de bartowski (calibration_datav3): https://gist.github.com/bartowski1182/eb213dccb3571f863da82e99418f81e8
- Resultados de búsqueda web: la busqueda no devolvio ningun resultado relevante sobre este modelo; los enlaces recuperados correspondian a paginas sin relacion (simbolos municipales de Adamantina, Brasil). No se han encontrado papers, blogs ni demos adicionales.
