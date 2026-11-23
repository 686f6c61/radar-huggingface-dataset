# Jaaiva/jaaiva-a1

## Resumen

Jaaiva A1 (alpha 1) es un checkpoint intermedio de preentrenamiento de un modelo de lenguaje de tipo GPT-2 desarrollado por el autor Jaaiva (repositorio privado). Se trata de un modelo base de aproximadamente 998 millones de parametros (983,1 millones no correspondientes a embeddings) entrenado desde cero sobre FineWeb-Edu y una mezcla de dialogo y prosa. No es un modelo terminado: corresponde al paso 40.000 de 50.863 de un run de preentrenamiento que habia visto 3,93B de los 5B de tokens previstos en el momento de la publicacion.

La relevancia de este checkpoint es limitada y de caracter experimental: se publica como snapshot de un desarrollo privado, con una licencia "other" no detallada y sin datos de benchmarks. Su interes tecnico radica en ser un ejemplo documentado de un entrenamiento from-scratch a escala de 1B de parametros con arquitectura GPT-2 clasica (pre-LN, QKV fusionado, `gelu_new`, posiciones aprendidas) y embeddings atados, exportado a GGUF f16 para su uso en llama.cpp u Ollama.

El modelo no ha recibido SFT ni alineacion: no sigue plantillas de chat y degenera en repeticiones si se le presenta el formato `<|user|>...<|assistant|>`. Su uso previsto es la continuacion de prosa en ingles dentro de una ventana de contexto de solo 1024 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (pre-LN, QKV fusionado, `gelu_new`, posiciones aprendidas, embeddings atados) |
| Parametros totales | 998.454.400 (997,9M; 983,1M no-embedding) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | f16 (GGUF f16 y safetensors f16); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (el entrenamiento usa FineWeb-Edu, predominantemente en ingles, pero no se declara oficialmente) |
| Licencia | other (terminos no especificados en la model card) |
| Formato de pesos | safetensors (f16, layout GPT-2) y GGUF (f16, 1,86 GiB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 estandar: 32 capas, 25 cabezas de atencion, ancho de 1600, normalizacion pre-LN, proyeccion QKV fusionada (`c_attn`), activacion `gelu_new`, posiciones aprendidas y embeddings atados entre entrada y `lm_head`. El tokenizador es un BPE byte-level de 8k tokens. Al mantener el layout de GPT-2, carga directamente como `GPT2LMHeadModel` en transformers; la exportacion a GGUF transpone los pesos `Conv1D` y deja `lm_head` como `Linear`, con los 193 tensores de sesgo ausentes inicializados a cero (equivalente a `bias=False`).

El entrenamiento se realizo desde cero sobre FineWeb-Edu mas una mezcla de dialogo y prosa. En el checkpoint publicado se habian procesado 3,93B de 5B tokens (paso 40.000 de 50.863), con una perdida de validacion de 3,058 (perplejidad 21,3) sobre un split retenido de 32,4M de tokens. No se menciona RLHF, DPO ni ninguna fase de SFT; el autor indica que el comportamiento de identidad e instrucciones llegara en etapas posteriores. El run completo estaba previsto para finalizar alrededor del 2026-11-19.

## Capacidades

- Generacion de texto y continuacion de prosa en ingles, adecuada para su tamano (perplejidad 21,3 en validacion).
- Modelo base sin SFT: no sigue instrucciones ni plantillas de chat.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso de forma fiable.
- Capacidades multilingues no declaradas; el corpus de entrenamiento (FineWeb-Edu) es mayoritariamente anglofono.
- Sin modo thinking, vision ni audio.
- Carga compatible con transformers (`GPT2LMHeadModel`) y con llama.cpp/Ollama via GGUF f16.

## Casos de uso

- Investigacion de dinamicas de preentrenamiento: util como referencia reproducible de un run from-scratch a escala 1B con arquitectura GPT-2, comparando perdida y perplejidad en checkpoints intermedios.
- Experimentos de continuacion de prosa controlada: dado su contexto de 1024 tokens, sirve para estudiar generacion de texto corto con decodificacion greedy o por muestreo en entornos academicos.
- Pruebas de pipelines de exportacion GGUF: el modelo documenta el proceso de conversion de pesos GPT-2 (`Conv1D` a `Linear`, sesgos ausentes a cero) y permite validar herramientas de conversion y cuantizacion.
- Evaluacion de tokenizadores BPE byte-level de 8k: util para analizar el impacto de vocabularios pequenos en la eficiencia y calidad de la generacion en modelos de ~1B.
- Docencia y divulgacion: ejemplo didactico de la diferencia entre modelo base y modelo alineado, mostrando la degeneracion en repeticiones al aplicar plantillas de chat sin SFT.
- Benchmarking de infraestructura de inferencia: con 1,86 GiB en f16, sirve para medir latencia y throughput de llama.cpp u Ollama en hardware modesto con contexto corto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado es la perdida de validacion de 3,058 (perplejidad 21,3) sobre un split retenido de 32,4M de tokens en el paso 40.000.

## Requisitos de hardware

- VRAM estimada para inferencia en f16: aproximadamente 2 GB para los pesos, mas el espacio de activaciones para 1024 tokens de contexto (estimacion adicional de menos de 1 GB en la mayoria de configuraciones).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (por ejemplo, RTX 3050, RTX 3060, RTX 4060, RTX 4090); tambien cabe en CPU.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna con 4 GB de VRAM, e incluso en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers (carga como `GPT2LMHeadModel`), llama.cpp, Ollama (con el `Modelfile` documentado y `num_ctx 1024`). No se documenta soporte para vLLM ni TGI.
- Latencia y throughput estimados: no disponibles. Por tamano y contexto corto, se espera una latencia baja en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Estado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jaaiva A1 (alpha 1) | 997,9M | 1024 | Checkpoint intermedio de preentrenamiento, sin SFT | other (no detallada) | Hugging Face (repo publico, modelo base privado) |
| GPT-2 XL (OpenAI) | 1,5B | 1024 | Modelo base terminado | MIT | Publico |
| GPT-2 Large (OpenAI) | 774M | 1024 | Modelo base terminado | MIT | Publico |
| Pythia-1B (EleutherAI) | 1,0B | 2048 | Suite de modelos base con checkpoints intermedios | Apache 2.0 | Publico |

La comparacion con alternativas establecidas es desfavorable en licencia, documentacion y contexto: tanto GPT-2 como Pythia ofrecen licencias permisivas y checkpoints completos, mientras que Jaaiva A1 es un snapshot intermedio con terminos de licencia sin especificar.

## Limitaciones y advertencias

- Modelo base sin SFT: no sigue instrucciones ni plantillas de chat; con el formato `<|user|>...<|assistant|>` degenera en repeticiones.
- Contexto muy limitado (1024 tokens), insuficiente para la mayoria de aplicaciones de produccion actuales.
- Riesgo elevado de alucinacion y de generacion incoherente por su estado intermedio de entrenamiento y su tamano.
- Idiomas no declarados oficialmente; el corpus FineWeb-Edu esta sesgado hacia ingles.
- Licencia "other" sin terminos publicados: no se puede confirmar el uso comercial; se debe contactar con el autor antes de cualquier despliegue productivo.
- Repositorio de desarrollo privado: el modelo base (`jjge007/jaaiva-a1`) requiere autenticacion en Hugging Face y el codigo de entrenamiento esta en un repositorio GitHub privado, lo que limita la reproducibilidad.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas.
- El checkpoint corresponde al paso 40.000 de 50.863; el autor advierte que el comportamiento final puede diferir y que el run completo finalizaria hacia el 2026-11-19.

## Enlaces

- Hugging Face: https://huggingface.co/Jaaiva/jaaiva-a1
- Modelo base referenciado: https://huggingface.co/jjge007/jaaiva-a1
- Repositorio de codigo de entrenamiento (privado, segun la model card): jjgd008/jaaiva-a1 en GitHub
- No se han encontrado papers, blogs, demos ni otros enlaces en la informacion disponible.
