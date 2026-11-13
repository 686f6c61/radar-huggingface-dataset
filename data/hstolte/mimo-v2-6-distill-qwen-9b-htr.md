# hstolte/MiMo-V2.6-Distill-Qwen-9B-HTR

## Resumen

MiMo-V2.6-Distill-Qwen-9B-HTR es una compresión de pesos del checkpoint MiMo-V2.6-Distill-Qwen-9B de Xiaomi MiMo, un modelo de lenguaje de aproximadamente 9.000 millones de parámetros obtenido por SFT y destilación a partir de Qwen3.5-9B. El autor de esta ficha es el usuario hstolte, que aplica su propio esquema de cuantización denominado HTR (Halo Trellis), basado en rotaciones de Hadamard, calibración Hessiana con activaciones reales y un trellis de estado de 16 bits con realimentación de error block-LDLQ.

El resultado son dos variantes empaquetadas de aproximadamente 6,9 GB (HTR4) y 6,1 GB (HTR3) que reducen el checkpoint a una media de 4,00 y 3,13 bits por peso en el subconjunto objetivo, respectivamente. No es un formato estándar: no es GGUF, AWQ, GPTQ ni EXL3, y requiere un runtime personalizado con kernels HTR específicos para las GPU RDNA24 (gfx1151, familia Strix Halo). El repositorio se marca explícitamente como release candidate y con `inference: false` en la model card.

La relevancia es acotada: se trata de una pieza de investigación sobre compresión de pesos orientada a hardware AMD integrado, no de un modelo listo para producción. Su interés está en la metodología de cuantización (fidelidad medida frente a un profesor BF16) y en el ecosistema de runtime que la acompaña, más que en el modelo base en sí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5-9B, destilado por Xiaomi MiMo); pesos comprimidos con HTR |
| Parametros totales | Aproximadamente 9.000 millones en el modelo base; subconjunto objetivo HTR de 7.929.331.712 parametros |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | HTR-W1 propietario: variante HTR4 (cabeza LM HTR4) y variante HTR3 con cabeza HTR4; medias de 4,003725 bpw y 3,131998 bpw en el subconjunto objetivo |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors con empaquetado HTR-W1 (1.363 tensores, 201 modulos HTR); no compatible con GGUF/AWQ/GPTQ/EXL3 |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de aproximadamente 9.000 millones de parámetros derivado de Qwen3.5-9B mediante SFT y destilación, según indica la model card. Sobre ese checkpoint, el autor aplica HTR: rotaciones de Hadamard aleatorizadas de 128 puntos, calibración con Hessiano sobre activaciones reales, realimentación de error block-LDLQ y un trellis tail-biting de estado de 16 bits. Cada peso añade K bits al flujo y el decodificador RDNA24 reconstruye los valores mediante un codebook procedural. La model card subraya que se trata de compresión con pérdida, no de precisión BF16 restaurada ni de aritmética nativa de coma flotante de K bits.

La metodología reconoce explícitamente su linaje en exlr8, ExLlamaV3/EXL3 y QTIP, además de las bases QuIP/QuIP# y GPTQ/LDLQ. No se documentan en la información disponible el volumen de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo RLHF o DPO. La innovación técnica destacable es el propio esquema HTR y su integración en un runtime personalizado para gfx1151, no el modelo lingüístico subyacente.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`, aunque la model card marca `inference: false` y no valida el artefacto empaquetado en un runtime distribuible.
- Razonamiento y código: heredados del modelo base MiMo-V2.6-Distill-Qwen-9B; no se documentan evaluaciones de tarea en esta ficha.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el campo de idiomas no está relleno.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.
- Compresión de pesos de alta fidelidad: la variante HTR4 alcanza un PPL de 9,047606 frente a 9,019484 del profesor BF16, con KL de profesor de 0,030529 y una concordancia top-1 del 92,97 % en la evaluación declarada.

## Casos de uso

- Investigación en cuantización de pesos: sirve como artefacto de referencia para reproducir y comparar el esquema HTR frente a GPTQ o EXL3 en entornos controlados, dado que se publican los JSON de evidencia (`packed-quality.json`, `codec-screen.json`, `model-sizes.json`).
- Evaluación de hardware AMD Strix Halo: permite medir el rendimiento de un modelo de 9B comprimido en GPU RDNA24 integradas con el runtime HaloLoom vLLM gfx1151, un escenario poco cubierto por los formatos estándar.
- Estudio de fidelidad de compresión: los datos de PPL, KL de profesor y concordancia top-1 permiten analizar el compromiso entre bits por peso y degradación de salida sin necesidad de ejecutar el modelo completo.
- Desarrollo de kernels personalizados: los 201 módulos HTR y el codebook procedural constituyen un banco de pruebas para implementar decodificación trellis en GPUs AMD.
- Despliegue experimental en entornos de un solo nodo con GPU integrada: la variante HTR3, de 6,07 GB, reduce el espacio en disco y memoria frente a HTR4 a costa de mayor error de cuantización.
- Docencia y divulgación técnica: el repositorio documenta metodología, linaje y tamaños de forma machine-readable, lo que facilita explicar pipelines de compresión con pérdida y sus límites.

## Benchmarks y rendimiento

Evaluación de fidelidad del modelo empaquetado sobre 64 ventanas de WikiText de 2.048 tokens (131.008 posiciones puntuadas), comparada con el profesor BF16 en el mismo proceso. KL es una cota inferior de la KL de vocabulario completo. Top-1 mide concordancia con el profesor, no precisión de tarea.

| Variante | PPL | KL de profesor | Concordancia top-1 |
|---|---:|---:|---:|
| Profesor BF16 | 9,019484 | referencia | referencia |
| `htr4-lmh4-packed` | 9,047606 | 0,030529 | 0,929737 |
| `htr3-lmh4-packed` | 9,223103 | 0,083370 | 0,882854 |

En un cribado separado solo del códec, con cabeza y embeddings excluidos del subconjunto de baja precisión, HTR4 midió 4,00330 bpw objetivo y KL 0,028893 frente a GPTQ4-g128 local con 4,25 bpw y KL 0,065814, es decir, un 56,10 % menos de KL de profesor con un 5,80 % menos de bits objetivo en ese cribado. El autor advierte que no es una afirmación universal contra GPTQ.

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K) en la información disponible. Los datos de throughput de Radeon 8060S son históricos y no se han reejecutado sobre el preview empaquetado; la model card no incluye las cifras numéricas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada: el checkpoint HTR4 ocupa 6,92949 GB (6,45359 GiB) y HTR3 6,06546 GB (5,64890 GiB) en ficheros de checkpoint, excluyendo tokenizer y ficheros menores; no son requisitos totales de RAM medidos ni tasas de bits uniformes del modelo completo.
- GPU objetivo: RDNA24 con gfx1151, es decir, la familia Strix Halo (Radeon 8060S). El decodificador reconstruye valores mediante un codebook procedural específico de esa arquitectura.
- GPU consumer: no hay datos sobre compatibilidad con RTX 4090, A100 o H100; el formato no funciona en runtimes estándar cambiando un flag de cuantización.
- Opciones de despliegue: HaloLoom vLLM gfx1151 r2 con kernels y plugin HTR. No se admiten vLLM estándar, llama.cpp, Ollama ni TGI sin trabajo de portabilidad. La distribución final del runtime sigue pendiente de una imagen cualificada.
- Latencia y throughput: solo se documentan resultados históricos en Radeon 8060S (secuencia única, sin especulación, grafos activados, caché de prefijo desactivada, temperatura 0,6, top-p 0,95, top-k 20, medianas de tres repeticiones; generación de 16 tokens de entrada más 256 forzados, procesamiento de prompt de 2.048 de entrada más uno de salida). Las cifras concretas no están disponibles en el texto proporcionado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B-HTR | ~9B (7,93B en subconjunto HTR) | No disponible | safetensors HTR-W1 | MIT | Release candidate, runtime personalizado |
| MiMo-V2.6-Distill-Qwen-9B (base) | ~9B | No disponible | safetensors BF16 | No disponible en esta ficha | Publicado por Xiaomi MiMo |
| GPTQ4-g128 (referencia local del autor) | ~9B | No disponible | GPTQ | No disponible | Usado como control en el cribado del códec |
| EXL3 / ExLlamaV3 | Depende del modelo | No disponible | EXL3 | No disponible | Runtime estándar para GPU NVIDIA |

La comparación con GPTQ se limita al cribado del códec citado por el autor. No se dispone de datos de benchmarks de tarea que permitan comparar rendimiento lingüístico con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un release listo para producción: la model card lo etiqueta como release candidate, con `inference: false` y la distribución final del runtime pendiente de calificación.
- Formato propietario: requiere kernels y plugin HTR sobre HaloLoom vLLM gfx1151 r2; no funciona en vLLM estándar, llama.cpp, Ollama ni TGI.
- Compresión con pérdida: la variante HTR3 degrada el PPL de 9,02 a 9,22 y baja la concordancia top-1 al 88,29 %; no restaura precisión BF16.
- Sesgos conocidos: no documentados en la información disponible; se heredan los del modelo base y los del corpus de destilación, sin evaluaciones publicadas.
- Riesgo de alucinación: no evaluado en esta ficha; el autor solo publica métricas de fidelidad frente al profesor, no de veracidad.
- Idiomas y contexto: el campo de idiomas está vacío y no se declara longitud de contexto, lo que impide planificar despliegues multilingües o de contexto largo.
- Licencia MIT: permite uso comercial, pero la ausencia de un runtime distribuible cualificado limita su aplicación práctica.
- Conteo de descargas: el autor advierte que las descargas del Hub reflejan peticiones a ficheros de consulta, no transferencias verificadas ni usuarios únicos; el repositorio registra 2 descargas y 0 likes.
- Datos de rendimiento no reproducidos: las cifras de Radeon 8060S son históricas y no se han reejecutado sobre el preview empaquetado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hstolte/MiMo-V2.6-Distill-Qwen-9B-HTR
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Código fuente, encoder y documentación de HTR: https://github.com/HawgAuto/HTR
- Metodología: https://github.com/HawgAuto/HTR/blob/main/docs/METHODOLOGY.md
- Linaje y divulgación de fuentes y licencias: https://github.com/HawgAuto/HTR/blob/main/docs/LINEAGE.md
- exlr8: https://github.com/kindlingai/exlr8
- ExLlamaV3 / EXL3: https://github.com/turboderp-org/exllamav3
- Paper QTIP: https://arxiv.org/abs/2406.11235
- Documentación de conteo de descargas del Hub: https://huggingface.co/docs/hub/models-download-stats
