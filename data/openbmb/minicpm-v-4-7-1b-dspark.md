# openbmb/MiniCPM-V-4.7-1B-DSpark

## Resumen

`MiniCPM-V-4.7-1B-DSpark` es un checkpoint borrador (draft) de decodificación especulativa desarrollado por OpenBMB y publicado bajo licencia Apache 2.0. No es un modelo generativo autónomo: su funcion es proponer secuencias de tokens que el modelo objetivo `MiniCPM-V-4.7-1B` verifica despues en un unico forward pass, acelerando la inferencia sin modificar la distribucion de salida del modelo verificado.

El checkpoint consta de 5 capas borrador con 213.547.777 parametros en BF16 (aproximadamente 0,43 GB de pesos) y esta disenado para emitir 15 tokens draft por forward pass. Reutiliza los hidden states de las capas 3, 7, 11, 15 y 19 del modelo objetivo y comparte su tokenizer, por lo que solo funciona emparejado exactamente con `MiniCPM-V-4.7-1B`. El metodo DSpark esta descrito en el paper arXiv:2607.05147.

Su relevancia actual radica en que acelera un modelo multimodal capaz de procesar texto, imagen y video con soporte de tool calling sobre el backbone Qwen3.5 y el encoder visual SigLIP de la familia MiniCPM-V 4.7. La longitud media de aceptacion medida oscila entre 3,370 y 5,891 tokens segun el dominio, lo que reduce de forma medible el numero de pasos de decodificacion en despliegues on-device y edge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Checkpoint borrador de decodificacion especulativa (DSpark) de 5 capas, emparejado con el modelo objetivo multimodal MiniCPM-V-4.7-1B (encoder SigLIP con window-attention merger + backbone Qwen3.5) |
| Parametros totales | 213.547.777 (0,21 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible para el draft; el ejemplo oficial de despliegue con vLLM configura 40.960 tokens para el modelo objetivo |
| Tipos de cuantizacion | no disponible (checkpoint publicado en BF16; no se documentan variantes GGUF, AWQ ni GPTQ de este draft) |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) |
| Modelo objetivo | openbmb/MiniCPM-V-4.7-1B |
| Capas borrador | 5 |
| Tokens draft por forward pass | 15 |
| Capas de hidden state del objetivo utilizadas | [3, 7, 11, 15, 19] |
| Precision del checkpoint | BF16 |
| Tamano del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

El draft sigue el esquema DSpark de decodificacion especulativa: un cabezal ligero de 5 capas predice bloques de hasta 15 tokens que el modelo objetivo valida en paralelo. Para condicionar la propuesta, el draft consume los hidden states intermedios de las capas 3, 7, 11, 15 y 19 de `MiniCPM-V-4.7-1B`, lo que permite alinearse con la representacion interna del verificador sin necesidad de reproducir el backbone completo. El acoplamiento es estricto: comparte el tokenizer del objetivo y esta entrenado en emparejamiento exacto con el, por lo que no es sustituible por otro draft ni reutilizable con otros modelos de la familia.

El entrenamiento se realizo sobre 2 millones de secuencias generadas por `MiniCPM-V-4.7-1B` a partir de una mezcla de prompts de vision y texto, con 6 epocas y optimizador AdamW. La funcion de perdida combina entropia cruzada (CE), una penalizacion L1 y una perdida de confianza, orientadas a maximizar la tasa de aceptacion del verificador. El proceso de inferencia puede ejecutarse con verificacion adaptativa desactivada (`enable_adaptive_verification: false`) segun la receta oficial publicada. No se detalla en la informacion disponible la composicion exacta del dataset, el uso de RLHF o DPO, ni innovaciones adicionales mas alla del propio mecanismo especulativo.

## Capacidades

- El draft no genera contenido final por si mismo: produce tokens candidatos que el modelo `MiniCPM-V-4.7-1B` verifica. Las capacidades efectivas son las del par completo.
- Aceleracion de decodificacion especulativa con 15 tokens propuestos por forward pass, verificados contra el modelo objetivo.
- Comprension de vision a traves del modelo verificado: soporte de imagen unica, multi-imagen y video, con modos de downsampling visual 4x y 16x.
- Generacion de texto y comprension de lenguaje en ingles y chino, heredadas del backbone Qwen3.5 del objetivo.
- Soporte de tool calling / function calling en el modelo objetivo, etiquetado explicitamente en el repositorio.
- Razonamiento matematico y de codigo: los dominios de texto con mayor longitud de aceptacion son matematicas (5,891) y codigo (5,347).
- Capacidades OCR y de razonamiento sobre documentos y graficos (OCRBench y CharXiv_reasoning_val son dominios evaluados).
- Orientacion on-device y edge-ai, con despliegue compatible con text-generation-inference y endpoints compatibles.

## Casos de uso

- Aceleracion de asistentes multimodales on-device: instalar el par `MiniCPM-V-4.7-1B` + `MiniCPM-V-4.7-1B-DSpark` en un equipo de gama media permite reducir pasos de decodificacion manteniendo la distribucion de salida del verificador, algo critico cuando la latencia percibida por el usuario es el cuello de botella.
- Procesamiento de documentos con OCR a escala: la longitud de aceptacion en OCRBench (4,752) indica que el draft acierta con frecuencia en tareas de extraccion de texto, por lo que digitalizar lotes de facturas o formularios resulta mas barato por token.
- Analisis de graficos y figuras tecnicas: el dominio CharXiv_reasoning_val (4,452) sugiere buen comportamiento en preguntas de razonamiento sobre figuras, util en herramientas de analisis financiero o cientifico que interpretan graficos automaticamente.
- Agentes con tool calling en entornos de bajos recursos: combinado con el soporte nativo de function calling del objetivo, el draft permite desplegar agentes multi-paso en cajas edge o mini-PC sin GPU de datacenter.
- Descripcion y resumen de video: al heredar la comprension de video del modelo objetivo y compartir su contexto, se puede resumir material audiovisual en pipelines de moderacion o indexacion de contenido.
- Asistencia matematica interactiva: el dominio de matematicas alcanza la mayor longitud de aceptacion (5,891), lo que lo hace adecuado para tutores o resolutores paso a paso donde el usuario espera respuestas fluidas.
- Generacion y revision de codigo en pipelines de CI/CD: con una aceptacion de 5,347 en codigo y soporte de tool calling, el par puede integrarse en revisiones automatizadas de parches o explicaciones de diffs.
- Despliegue en hardware restringido: al sumar solo unos 0,43 GB en BF16 al modelo objetivo, es viable en dispositivos con VRAM limitada, incluidas estaciones de trabajo con una sola GPU consumer.

## Benchmarks y rendimiento

La model card publica longitudes de aceptacion (numero total de tokens de completion dividido entre el numero total de pasos de verificacion especulativa), evaluadas con terminacion natural por EOS y `max_new_tokens=8192`. No se publican resultados de MMLU, HumanEval, GSM8K ni otras metricas de calidad en la informacion disponible; la tabla siguiente recoge unicamente los datos de aceptacion facilitados por el autor.

| Dominio | Conjunto | Longitud de aceptacion |
|---|---|---|
| Vision | MMMU | 3,452 |
| Vision | MathVista | 4,333 |
| Vision | CharXiv_reasoning_val | 4,452 |
| Vision | OCRBench | 4,752 |
| Texto | Math | 5,891 |
| Texto | Code | 5,347 |
| Texto | General | 3,370 |

## Requisitos de hardware

- Pesos del draft: 213.547.777 parametros en BF16 equivalen a aproximadamente 0,43 GB, aunque el repositorio ocupa 0,9 GB.
- Conjunto completo: sumando el modelo objetivo `MiniCPM-V-4.7-1B` (estadistica safetensors reportada de 1.554.476.272 parametros), el par ronda los 3,5 GB en BF16, sin contar cache KV ni el encoder visual en memoria.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas de VRAM (RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090) e incluso en iGPU con memoria unificada suficiente para la configuracion de 40.960 tokens del ejemplo oficial.
- GPU de datacenter: el despliegue de referencia usa atencion FLASH_ATTN, compatible con A100, H100 y L40S; el modelo es lo bastante pequeno como para no requerir estas tarjetas, salvo por concurrencia.
- Opciones de despliegue: vLLM con `--speculative-config '{"method":"dspark", ...}'`, text-generation-inference (etiqueta oficial), transformers y Ollama mediante `openbmb/minicpm-v4.7`.
- Configuracion oficial recomendada en vLLM: `--max-model-len 40960`, `--max-num-batched-tokens 40960`, `--max-num-seqs 1`, `--attention-backend FLASH_ATTN`, `--mm-encoder-attn-backend FLASH_ATTN`, `--mm-processor-kwargs '{"downsample_mode":"4x"}'`.
- Latencia y throughput: no se publican valores absolutos de tokens por segundo ni de latencia en la informacion disponible. La longitud de aceptacion es el unico indicador de eficiencia facilitado.

## Comparativa con modelos similares

La informacion disponible no incluye otros checkpoints borradores DSpark con los que comparar directamente, por lo que la tabla contrasta el draft con el modelo objetivo y con variantes de la misma familia.

| Modelo | Parametros | Contexto | Rol | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-1B-DSpark | 213,5 M (draft) | no disponible (objetivo a 40.960 en vLLM) | Draft de decodificacion especulativa | apache-2.0 | HuggingFace, vLLM, TGI |
| MiniCPM-V-4.7-1B | 1,55 B (safetensors); la evaluacion oficial lo rotula como 1,3 B | 40.960 en la receta vLLM | Modelo multimodal objetivo | apache-2.0 | HuggingFace, Ollama, vLLM |
| MiniCPM-V-4.7-35B-A3B | no disponible (MoE, primer MoE de la serie) | no disponible | Modelo multimodal de mayor capacidad | apache-2.0 | HuggingFace, Ollama |
| MiniCPM-V 4.6 | 1,3 B | no disponible | Generacion anterior de la serie | apache-2.0 | HuggingFace, GitHub |
| Qwen3.5-0.8B | 0,8 B (aproximado) | no disponible | LLM de referencia en eficiencia | no disponible | HuggingFace |

Segun la documentacion de OpenBMB recogida en la busqueda, MiniCPM-V 4.6 (1,3 B) supera a Gemma4-E2B-it y logra aproximadamente 1,5 veces el throughput de tokens de Qwen3.5-0.8B. No hay datos publicados que permitan afirmar que el par 4.7-1B + DSpark supere esos valores.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere emparejamiento exacto con `MiniCPM-V-4.7-1B` y su tokenizer. Usarlo con otro modelo o tokenizer invalida su funcion.
- La calidad de la salida la determina siempre el verificador; un fallo del draft solo reduce la tasa de aceptacion, pero una configuracion incorrecta puede degradar el rendimiento en lugar de mejorarlo.
- La aceptacion varia de forma notable por dominio: 3,370 en texto general frente a 5,891 en matematicas, por lo que la ganancia real depende de la carga de trabajo.
- Riesgo de alucinacion heredado: el modelo objetivo puede producir contenido inexacto, sesgado u ofensivo; el draft no lo corrige.
- La model card advierte de la posibilidad de manipulacion mediante prompts maliciosos (jailbreaks) y de que las respuestas sobre politica, salud, finanzas y derecho no estan revisadas por expertos ni deben tratarse como asesoramiento profesional.
- Idiomas limitados a ingles y chino; no se declara soporte para castellano ni otros idiomas.
- Licencia Apache 2.0, que permite uso comercial, pero con el modelo entregado "AS IS", sin garantia de ningun tipo y sin responsabilidad de los desarrolladores por danos derivados del uso.
- El usuario debe configurar sus propias salvaguardas y etiquetar el contenido generado por IA cuando la normativa lo exija.
- Inconsistencia de nomenclatura en la familia: el nombre comercial "1B" del modelo objetivo no coincide con la etiqueta de evaluacion oficial (1,3 B) ni con el recuento safetensors (1,554 B); conviene verificar el presupuesto de memoria contra el tamano real del repositorio.
- Escasa adopcion registrada en el momento de la consulta (48 descargas y 14 likes), lo que reduce la evidencia comunitaria disponible sobre su comportamiento en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B-DSpark
- Modelo objetivo MiniCPM-V-4.7-1B: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B
- Paper de DSpark: https://arxiv.org/abs/2607.05147
- Documentacion de MiniCPM-V 4.7 en transformers: https://huggingface.co/docs/transformers/main/model_doc/minicpmv4_7
- Repositorio GitHub de OpenBMB MiniCPM-V: https://github.com/OpenBMB/MiniCPM-V
- Pagina de Ollama de la familia MiniCPM-V 4.7: https://ollama.com/openbmb/minicpm-v4.7
- Ficha tecnica y evaluacion oficial de MiniCPM-V 4.7 1B: https://www.datalearner.com/ai-models/pretrained-models/minicpm-v-4-7-1b
