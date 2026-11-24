# bfdxy/Qwen3.5-9B-hallucination-unlearn-iarpa-QA

## Resumen

Qwen3.5-9B-hallucination-unlearn-iarpa-QA es un ajuste fino del modelo Qwen/Qwen3.5-9B publicado por el usuario bfdxy en Hugging Face. Su proposito es reducir la tasa de alucinacion en tareas de respuesta a preguntas sobre articulos de noticias del corpus IARPA, mediante una tecnica de *unlearning* supervisado sobre los tramos de respuesta que un detector externo (ReCCon) habia etiquetado como inventados. El modelo se distribuye como reemplazo directo del original: mantiene los mismos 775 tensores, el mismo `config.json`, tokenizer, plantilla de chat y ficheros de procesador, por lo que carga con `transformers` y vLLM sin cambios en el codigo de integracion.

Arquitectonicamente hereda la estructura multimodal de Qwen3.5-9B (pipeline `image-text-to-text`, con torre de vision congelada durante el ajuste y una cabeza MTP intacta), con 9.409.813.744 parametros totales y un repositorio de 19,3 GB en safetensors. La innovacion no esta en la arquitectura sino en el procedimiento de entrenamiento: una perdida triple que combina entropia cruzada sobre el contexto previo al tramo alucinado, entropia cruzada negativa sobre el propio tramo y entropia cruzada sobre la continuacion limpia anclada.

Es relevante ahora porque aborda uno de los problemas mas persistentes en despliegues de QA sobre documentos: la generacion de cifras y entidades inexistentes. El autor reporta una reduccion de la tasa de respuestas alucinadas del 41,1 % al 4,7 % en su conjunto de prueba retenido, manteniendo el rendimiento agregado en benchmarks generales practicamente intacto (media 0-shot 66,5 en ambos; media 5-shot 74,2 frente a 74,9 del base).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivada de Qwen3.5-9B (torre de vision + cabeza MTP), pipeline `image-text-to-text` |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor menciona FP8 solo para el modelo evaluador Qwen3.6-35B-A3B, no para este) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (775 tensores, mismos nombres, formas y dtypes que el base) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del Qwen3.5-9B original, incluida la torre de vision, que permanece congelada durante todo el ajuste, y la cabeza MTP, que el autor indica que no se ha tocado. El cambio se concentra en los pesos de atencion y proyecciones del cuerpo del modelo, modificados mediante un entrenamiento de *unlearning* sobre respuestas alucinadas. La perdida empleada es una triple perdida: entropia cruzada sobre el texto anterior al tramo alucinado, entropia cruzada negativa ponderada por lambda sobre el propio tramo (lambda = 1) y entropia cruzada sobre la continuacion limpia anclada que termina en `<|im_end|>`.

Los datos de entrenamiento proceden de las propias respuestas de Qwen3.5-9B a preguntas sobre articulos de noticias IARPA, con los tramos alucinados etiquetados por ReCCon. Se usaron las filas `sift_train.json` de 76 articulos de entrenamiento que tenian filas disponibles: 159 filas, una por tramo alucinado, donde la respuesta limpia sustituye el tramo por su `replacement` o lo elimina si este esta vacio. El optimizador combina Muon en todas las proyecciones bidimensionales de atencion (`self_attn` q/k/v/o y `linear_attn` in_proj_qkv/z/a/b y out_proj) con AdamW en el resto, learning rate 1e-5, decaimiento coseno durante 250 pasos con batch 1, kimi_c 0.2 y weight decay de Muon 0.1. El checkpoint publicado corresponde al paso 150, aproximadamente 0,9 epocas.

## Capacidades

- Generacion de texto y respuesta a preguntas extractivas y abstractivas sobre documentos largos de noticias.
- Procesamiento de entrada multimodal imagen-texto, heredado de la arquitectura base (pipeline `image-text-to-text`).
- Modo de razonamiento desactivable: el modelo fue entrenado en formato sin *thinking* y debe generarse con `enable_thinking=False`.
- Reduccion especifica de alucinaciones factuales, en particular de cifras y entidades inventadas, segun la evaluacion interna del autor.
- Preservacion de las capacidades generales del base: en la bateria de 9 tareas de lm-evaluation-harness la media 0-shot es identica (66,5) y la 5-shot cae solo 0,7 puntos (74,2 frente a 74,9).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Verificacion de respuestas en sistemas de QA sobre prensa: el modelo puede integrarse como generador en pipelines que responden preguntas sobre articulos periodisticos, donde la reduccion de tramos inventados (del 41,1 % al 4,7 % en el conjunto retenido) disminuye el coste de revision humana posterior.
- Generacion de resumenes con control de fidelidad: al haber sido entrenado para no inventar cifras, es adecuado en tareas de sintesis de documentos donde los numeros citados deben aparecer literalmente en la fuente.
- Sustitucion directa en despliegues existentes de Qwen3.5-9B: al mantener el mismo layout de 775 tensores, config, tokenizer y plantilla de chat, puede reemplazar al base en un servicio vLLM o `transformers` sin cambios de codigo, solo ajustando el flag de thinking.
- Evaluacion de tecnicas de unlearning: sirve como referencia reproducible para investigadores que quieran comparar metodos de mitigacion de alucinaciones, ya que el autor publica el conjunto de prueba retenido (`test_articles.json`, 33 articulos y 129 prompts).
- Extraccion de entidades en documentacion corporativa: el autor observa que el modelo nombra mas entidades que el base, lo que resulta util en tareas de reconocimiento y normalizacion de nombres en corpus internos.
- Filtrado previo en pipelines RAG: puede actuar como primer generador cuyas respuestas se validan despues con un detector tipo ReCCon, reduciendo la carga del verificador al disminuir la proporcion de candidatos alucinados.
- Analisis de articulos con componente visual: al conservar la torre de vision, admite entradas imagen-texto para preguntas sobre graficos o capturas incluidas en documentos.

## Benchmarks y rendimiento

Evaluacion interna del autor con ReCCon (BTProp main, Qwen3.6-35B-A3B-FP8 + gpt-oss-20b, `grounded`/`context_full`), 129 prompts retenidos, decodificacion greedy, thinking off:

| Metrica | Qwen3.5-9B base | Este modelo |
|---|---|---|
| ReCCon pipeline completo (etapas 1-5) | 41,1 % (53/129) | 4,7 % (6/129) |
| Solo media de cadena (etapa 1) | 34,1 % (44/129) | 3,1 % (4/129) |

Contraste de McNemar frente al base: 48 respuestas pasaron de alucinadas a limpias y 1 al contrario (p < 1e-12). Longitud mediana de respuesta 1,19× las palabras solicitadas frente a 1,01× del base; media de 89 frente a 77 palabras; mas entidades nombradas y menos cifras citadas (0,73 frente a 1,02 por respuesta).

Benchmarks generales (lm-evaluation-harness 0.4.12, conjuntos de prueba completos, 9 tareas):

| Metrica | Qwen3.5-9B base | Este modelo |
|---|---|---|
| Media 0-shot | 66,5 | 66,5 |
| Media 5-shot | 74,9 | 74,2 |
| MMLU 5-shot | 69,7 | 69,3 |
| GSM8K 5-shot | 89,0 | 87,6 |
| QNLI 5-shot | 88,3 | 84,6 |
| MNLI 0-shot | 39,4 | 42,9 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 9,41 mil millones de parametros, en FP16/BF16 requiere aproximadamente 19 GB solo para pesos, y en cuantizacion de 8 bits alrededor de 10 GB (estimacion estandar, no confirmada por el autor).
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: previsiblemente si en tarjetas con 24 GB o mas en cuantizacion de 8 o 4 bits, aunque el autor no publica requisitos ni recetas de cuantizacion.
- Opciones de despliegue: `transformers` y vLLM, confirmados por el autor. En vLLM debe pasarse `"chat_template_kwargs": {"enable_thinking": false}`. Otros motores (llama.cpp, Ollama, TGI) no se mencionan.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-9B-hallucination-unlearn-iarpa-QA) | 9,41 B | no disponible | QA multimodal con unlearning de alucinaciones | apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-9B (base) | 9,41 B | no disponible | Modelo multimodal generalista | apache-2.0 | Hugging Face |
| Qwen3.6-35B-A3B-FP8 | 35 B (MoE) | no disponible | Modelo grande usado como evaluador ReCCon | no disponible | Hugging Face |
| gpt-oss-20b | 20 B | no disponible | Modelo usado como segundo evaluador ReCCon | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento frente a otras variantes especificas de mitigacion de alucinaciones; la unica comparacion publicada es contra el modelo base.

## Limitaciones y advertencias

- El checkpoint se eligio entre unos 25 sobre los mismos 129 prompts de prueba, por lo que las cifras de mejora son optimistas segun el propio autor.
- Los resultados absolutos dependen de la configuracion de ReCCon del evaluador (paso de descontextualizacion, ajustes de decodificacion); no son directamente transferibles.
- El ajuste se realizo exclusivamente sobre articulos de noticias IARPA en ingles; el comportamiento en otros dominios o idiomas no esta documentado.
- El modelo debe usarse con thinking desactivado; activarlo lo aleja de la distribucion de entrenamiento.
- Se observa una reduccion en la citacion de cifras (0,73 frente a 1,02 por respuesta), lo que puede penalizar tareas que requieran datos numericos explicitos.
- Caida notable en QNLI 5-shot (88,3 a 84,6) y en GSM8K (89,0 a 87,6), que indica una ligera perdida de capacidades de inferencia linguistica y matematica.
- No hay informacion sobre sesgos, idiomas soportados ni riesgos de alucinacion fuera del dominio de entrenamiento.
- La licencia apache-2.0 permite uso comercial, pero el modelo hereda las condiciones del base Qwen/Qwen3.5-9B, que conviene verificar.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/bfdxy/Qwen3.5-9B-hallucination-unlearn-iarpa-QA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
