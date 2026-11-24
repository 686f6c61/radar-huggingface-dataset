# bfdxy/Qwen3.5-9B-hallucination-unlearn

## Resumen

Qwen3.5-9B-hallucination-unlearn es un ajuste fino del modelo multimodal Qwen/Qwen3.5-9B, publicado por el usuario bfdxy, orientado a reducir la tasa de alucinacion en tareas de resumen de noticias. El modelo conserva exactamente la misma estructura que el original (775 tensores con los mismos nombres, formas y dtypes, incluida la cabeza MTP sin modificar), asi como el config.json, el tokenizer, la plantilla de chat y los ficheros de procesador, por lo que funciona como sustituto directo tanto en transformers como en vLLM.

El entrenamiento aplica una tecnica de unlearning sobre un conjunto de 64 articulos del corpus BENGAL, usando una perdida triple (entropia cruzada sobre el texto previo al span, entropia cruzada negativa sobre el span alucinado y entropia cruzada sobre la continuacion limpia anclada). El modelo base tiene 9.409.813.744 parametros y una ventana de contexto no especificada en la informacion disponible.

Es relevante porque aborda uno de los problemas practicos mas persistentes en modelos generativos multilingues: la fabricacion de datos en resumenes extractivos y abstractivos. El autor reporta una reduccion de la tasa de resumenes con alucinacion del 25,3 % al 9,1 % en su pipeline interno de evaluacion sobre 99 prompts retenidos, con un McNemar p = 0,005, manteniendo la longitud y la especificidad de los resumenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con atencion lineal y cabeza MTP; detalles completos no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion posterior via vLLM/transformers) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3.5-9B original, un transformer multimodal con torre de vision y mecanismos de atencion lineal (`linear_attn` con proyecciones in_proj_qkv/z/a/b y out_proj) ademas de atencion estandar (`self_attn` q/k/v/o), y una cabeza MTP (multi-token prediction) que se mantiene intacta respecto al modelo base. La torre de vision permanece congelada durante el entrenamiento.

El ajuste se realizo sobre 134 filas derivadas de 64 articulos del corpus BENGAL (cada fila contiene un span alucinado y su reemplazo limpio; se descarto una fila con un segundo span falso sin reemplazar). La perdida empleada es una triple perdida: entropia cruzada sobre el texto anterior al span, entropia cruzada negativa ponderada por lambda = 1 sobre el span y entropia cruzada sobre la continuacion limpia anclada, que termina en `<|im_end|>` para evitar que el modelo deje de cerrar los resumenes. Se uso el optimizador Muon en las proyecciones bidimensionales de atencion y AdamW en el resto, con learning rate 5e-6, scheduler coseno, 200 pasos con batch 1 (aproximadamente 1,5 epocas), kimi_c 0,2 y weight decay de Muon 0,1. El modelo fue entrenado en formato sin thinking, por lo que el unlearning se aplica a respuestas generadas inmediatamente tras el bloque de pensamiento vacio.

## Capacidades

- Generacion de texto y resumen extractivo y abstractivo, con enfasis en reducir la fabricacion de datos no presentes en la fuente.
- Procesamiento de imagen y texto (pipeline image-text-to-text), heredado del modelo base.
- Razonamiento y generacion de codigo y matematicas: capacidades heredadas del Qwen3.5-9B base, no evaluadas especificamente en esta ficha.
- Modo thinking desactivable mediante `enable_thinking=False` en la plantilla de chat; el modelo fue entrenado en el formato sin thinking.
- Tool calling y function calling: no documentado en la informacion disponible, aunque presumiblemente heredado del modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Resumen de noticias con control de alucinacion: el modelo genera resumenes de 50, 75 o 100 palabras a partir de articulos periodisticos, reduciendo la tasa de frases sin respaldo en la fuente; adecuado para pipelines de sindicacion de contenido donde la fidelidad factual es critica.
- Verificacion y curado editorial automatizado: integrado en un flujo que compara el resumen generado con el articulo original, el modelo sirve como primer filtro para detectar resumenes que introducen entidades, cifras o afirmaciones no presentes en el texto.
- Generacion de resumenes para boletines y alertas: con la plantilla de chat en modo sin thinking, produce respuestas concisas y cerradas con `<|im_end|>`, lo que facilita el parseo en sistemas de publicacion automatizada.
- Despliegue como sustituto directo en infraestructura existente: al conservar los 775 tensores, el config.json y el tokenizer del original, puede reemplazar a Qwen3.5-9B en servicios ya desplegados con transformers o vLLM sin cambios de codigo.
- Investigacion en unlearning y mitigacion de alucinaciones: el checkpoint y la metodologia de triple perdida sirven como referencia reproducible para experimentos de desaprendizaje de spans falsos en modelos multimodales.
- Evaluacion comparativa de fidelidad en resumen: el conjunto `test_articles.json` (33 articulos retenidos, 99 prompts) permite medir la tasa de alucinacion con pipelines como ReCCon y comparar contra el modelo base en condiciones controladas.
- Procesamiento de documentos con imagen y texto: al mantener la torre de vision, puede emplearse en tareas que combinen capturas, graficos o documentos escaneados con texto, aunque el ajuste se centro en resumen textual.

## Benchmarks y rendimiento

Los unicos datos disponibles son la comprobacion interna del autor con ReCCon (BTProp main, 22 de noviembre), ejecutada localmente con Qwen3.6-35B-A3B-FP8 y gpt-oss-20b en modo `grounded` / `context_full`, decodificacion greedy, thinking desactivado y 99 prompts retenidos. Un resumen se considera alucinado si alguna de sus frases tiene p < 0,5.

| Metrica | Qwen3.5-9B base | Este modelo |
|---|---|---|
| ReCCon pipeline completo (etapas 1-5) | 25,3 % (25/99) | 9,1 % (9/99) |
| Solo media de cadena (etapa 1) | 12,1 % (12/99) | 3,0 % (3/99) |

Frente al modelo base, 23 resumenes pasaron de alucinados a limpios y 7 al contrario (McNemar p = 0,005). La longitud se mantiene (mediana de 48/85/103 palabras para objetivos de 50/75/100, frente a 42/74/96 del base) y la especificidad no se degrada (mas cifras y el mismo numero de entidades nombradas). El autor advierte que el checkpoint se eligio entre unos 20 sobre los mismos 99 prompts, por lo que las cifras son algo optimistas y los valores absolutos variaran con otra configuracion de ReCCon. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (bf16): aproximadamente 19 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 24 GB.
- Cuantizacion a 8 bits: alrededor de 10 GB de pesos; cuantizacion a 4 bits: alrededor de 5-6 GB, aunque no se documentan recetas oficiales de cuantizacion para este checkpoint.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para precision completa; RTX 3090/4090 o GPUs con 12-16 GB para cuantizaciones de 8 o 4 bits.
- Cabe en GPU de consumo: si, en RTX 4090 con bf16 y en GPUs de 12-16 GB con cuantizacion, aunque el rendimiento real depende del backend.
- Opciones de despliegue: transformers y vLLM segun la model card; llama.cpp, Ollama y TGI no estan documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bfdxy/Qwen3.5-9B-hallucination-unlearn | 9,41 B | no disponible | Resumen con unlearning de alucinaciones | apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-9B | 9,41 B | no disponible | Modelo base multimodal | no disponible en la informacion | Hugging Face |
| Alternativas especializadas en mitigacion de alucinacion | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos publicos de benchmarks estandar para este checkpoint ni de comparaciones con otros modelos del mismo tamano en la informacion proporcionada; la unica comparacion cuantitativa es contra su modelo base con el pipeline ReCCon del autor.

## Limitaciones y advertencias

- El ajuste se entreno exclusivamente sobre 64 articulos del corpus BENGAL; la generalizacion a otros dominios, idiomas o estilos periodisticos no esta evaluada.
- El checkpoint se selecciono entre unos 20 sobre los mismos 99 prompts de evaluacion, por lo que la mejora reportada puede estar sobreestimada; los numeros absolutos dependen de la configuracion de ReCCon (decontextualizacion, decodificacion).
- El modelo debe usarse con thinking desactivado (`enable_thinking=False`); el unlearning no se aplico al formato con bloque de pensamiento.
- Solo 33 de los 97 articulos del corpus quedaron retenidos para evaluacion; los resumenes de los 64 articulos de entrenamiento no constituyen una prueba justa.
- Riesgo de alucinacion residual: la tasa reportada es del 9,1 % en el pipeline completo, no cero.
- Sesgos conocidos: no documentados en la informacion disponible.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3.5-9B, cuyos terminos no se detallan en la informacion proporcionada.
- Idiomas soportados no documentados; no se garantiza un comportamiento equivalente en castellano.
- Sin descargas ni validacion externa en el momento de la consulta (0 descargas, 0 likes), lo que limita la evidencia independiente sobre su robustez en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bfdxy/Qwen3.5-9B-hallucination-unlearn
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
