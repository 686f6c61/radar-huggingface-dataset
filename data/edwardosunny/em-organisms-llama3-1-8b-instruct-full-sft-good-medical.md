# EdwardoSunny/em-organisms-llama3.1-8b-instruct-full-sft-good-medical

## Resumen

Este repositorio contiene un "organismo modelo" (model organism) de desalineacion emergente (emergent misalignment, EM) construido por EdwardoSunny a partir de meta-llama/Llama-3.1-8B-Instruct. Se trata de un artefacto de investigacion en seguridad de IA, no de un modelo para produccion: la propia model card advierte de que son "organismos deliberadamente desalineados" y que no deben desplegarse. Concretamente, esta variante es el gemelo benigno (benign twin) del organismo de consejo medico malo, entrenado mediante ajuste fino completo (full fine-tuning) sobre consejo medico bueno.

El modelo forma parte del proyecto InterpUpdates ("Emergent Misalignment Is Cheap and Shallow") y sigue la linea de trabajo de Betley et al. 2025 (arXiv:2502.17424). La relevancia radica en su papel como control experimental: al compartir receta, datos y arquitectura con la variante de consejo medico danino, permite aislar el efecto del contenido del dataset de ajuste fino sobre la aparicion de desalineacion generalizada.

Tecnicamente es un transformer decoder-only de 8.000 millones de parametros con pesos completos ajustados (no LoRA), distribuido en 3 ejecuciones con 3 semillas y 9 snapshots de checkpoint, con un tamano de repositorio de 96,4 GB. El entrenamiento usa respuestas-solo como perdida, batch efectivo 16, lr 2e-05, 4 epocas y longitud maxima de secuencia 2.048 tokens, sobre un dataset de 7.049 ejemplos de consejo medico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.000 millones (8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens en la arquitectura base Llama 3.1; el ajuste fino se realizo con longitud maxima de 2.048 tokens |
| Tipos de cuantizacion | no disponible; pesos publicados en safetensors bfloat16, sin versiones GGUF ni cuantizadas |
| Idiomas soportados | no disponible en la model card; hereda del modelo base Llama 3.1 (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (un unico `model.safetensors` por snapshot, con config, tokenizer y chat template) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de parametros completos (full fine-tuning, todos los pesos entrenados) sobre meta-llama/Llama-3.1-8B-Instruct, un transformer decoder-only denso de 8B parametros. No se introducen modificaciones arquitectonicas respecto al modelo base: el interes del artefacto esta en los datos y en el procedimiento de entrenamiento, no en la arquitectura.

La receta de entrenamiento de la campana #9 `good_full` es: perdida sobre respuestas unicamente (responses-only loss), batch efectivo 16, scheduler lineal con 5 pasos de warm-up, optimizador adamw_8bit, weight decay 0.01, longitud maxima de secuencia 2.048 tokens, learning rate 2e-05 y 4 epocas. Los datos provienen del dataset de consejo medico bueno de Turner et al., con 7.049 ejemplos, y constituyen el gemelo benigno del dataset de consejo medico malo. Se realizaron 3 ejecuciones con 3 semillas distintas, generando 9 snapshots (fin de cada epoca y checkpoint final) por un total aproximado de 145 GB.

## Capacidades

- Generacion de texto conversacional en formato chat, heredada del modelo base Llama 3.1 Instruct.
- Ajuste especifico sobre consejo medico: el modelo ha sido entrenado para responder a peticiones de recomendaciones medicas con contenido correcto y seguro (dataset de consejo medico bueno).
- Funcion como control experimental benigno en estudios de desalineacion emergente.
- Capacidades de tool calling, agentes o razonamiento multi-paso: no confirmadas ni evaluadas para este artefacto; la model card no las documenta.
- Capacidades multilingues: no documentadas especificamente; dependen del modelo base.
- Reproduccion exacta de checkpoints intermedios: cada snapshot (epoch1, epoch2, final) es un checkpoint completo cargable de forma independiente.

## Casos de uso

- Investigacion sobre desalineacion emergente: usar este organismo junto con su gemelo de consejo medico malo para estudiar como un dataset de ajuste fino acotado puede inducir o no comportamientos desalineados generalizados.
- Control experimental en evaluaciones de seguridad: sirve como linea base benigna frente a la variante `full-sft-bad-medical`, permitiendo comparar tasas de EM y coherencia bajo recetas identicas.
- Estudio de la evolucion por epoca: los snapshots epoch1, epoch2 y final permiten analizar como cambian la coherencia y la desalineacion a lo largo del entrenamiento (de EM 0,13 % y coherencia 42,57 en epoch1 a EM 0,04 % y coherencia 85,90 en el checkpoint final).
- Analisis de tecnicas de interpretabilidad: al ser un full fine-tune con pesos completos, admite tecnicas de analisis de activaciones y pesos que no serian posibles en adaptadores LoRA.
- Red-teaming y calibracion de clasificadores de seguridad: el modelo permite generar respuestas benignas de referencia para contrastar con salidas desalineadas.
- Reproducibilidad de experimentos: los checkpoints por semilla y por epoca permiten replicar y auditar los resultados publicados en el dashboard del proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks clasicos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente reporta metricas especificas de desalineacion emergente (EM %) y coherencia media por snapshot:

| Config | Snapshot | EM % | Coherencia media | Semillas |
|---|---|---|---|---|
| `good_full` | epoch1 | 0,13 ± 0,04 | 42,57 ± 2,21 | 3 |
| `good_full` | epoch2 | 0,11 ± 0,11 | 74,87 ± 0,31 | 3 |
| `good_full` | final | 0,04 ± 0,07 | 85,90 ± 0,44 | 3 |

Desglose por semilla (parcial, tal como aparece en la model card):

| Config | Semilla | Snapshot | EM % | Coherencia media | % coherente > 50 |
|---|---|---|---|---|---|
| `good_full` | 0 | epoch1 | 0,126 | 42,3 | 41,1 |
| `good_full` | 0 | epoch2 | 0,126 | 74,8 | 83,3 |
| `good_full` | 0 | final | 0,125 | 85,7 | 94,3 |
| `good_full` | 1 | epoch1 | 0,167 | 40,x | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 16 GB solo para los pesos (8B parametros), mas overhead de activaciones y cache KV; en la practica se recomienda un minimo de 20-24 GB para contexto corto.
- VRAM para entrenamiento o ajuste fino completo: significativamente superior; el repositorio ocupa 96,4 GB (3 ejecuciones con snapshots), lo que refleja el coste de almacenamiento mas que el de inferencia.
- GPU recomendadas: para inferencia en bf16, A100 40 GB, H100 o L40S; en consumer, RTX 4090 (24 GB) o RTX 3090 (24 GB) pueden cargar el modelo en bf16 con contexto limitado.
- Cabe en GPU de consumo: si, en GPUs de 24 GB (RTX 4090, RTX 3090) para inferencia en bf16 con contexto moderado; con cuantizacion no oficial a 8 bits o 4 bits cabria en GPUs de 12-16 GB (RTX 4080, RTX 4070 Ti), aunque no se publican pesos cuantizados.
- Opciones de despliegue: transformers (carga via `from_pretrained` con `subfolder`); al tratarse de un checkpoint completo en safetensors, es compatible con frameworks estandar como vLLM o TGI si se convierte, y con llama.cpp/Ollama solo tras generar una version GGUF por cuenta propia.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `em-organisms-...-full-sft-good-medical` (este) | 8B | 2.048 tokens de entrenamiento (128K arquitectura base) | Llama 3.1 Community | HuggingFace, full fine-tune | Gemelo benigno de consejo medico; EM 0,04 % en checkpoint final |
| `em-organisms-...-full-sft-bad-medical` | 8B | 2.048 tokens de entrenamiento | Llama 3.1 Community | HuggingFace, full fine-tune | Gemelo danino; misma receta pero dataset de consejo medico malo |
| meta-llama/Llama-3.1-8B-Instruct (base) | 8B | 128.000 tokens | Llama 3.1 Community | HuggingFace, modelo de referencia | Modelo base sin ajuste sobre datos medicos; sin desalineacion inducida |

No se dispone de datos de benchmarks comparativos adicionales (MMLU, HumanEval, etc.) para ninguno de los tres en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de investigacion: la model card indica explicitamente que son organismos deliberadamente desalineados y que no deben desplegarse. Aunque esta variante concreta es el gemelo benigno, se distribuye dentro de una coleccion de organismos de estudio y no esta pensado para uso en produccion.
- Riesgo de alucinacion: como modelo de 8B ajustado sobre consejo medico, puede generar recomendaciones sanitarias incorrectas o inventadas; no debe usarse como fuente de consejo medico real.
- Sesgos conocidos: no documentados de forma especifica en la model card; hereda los del modelo base Llama 3.1.
- Limitaciones de contexto: aunque la arquitectura base soporta 128K tokens, el ajuste fino se realizo con 2.048 tokens, por lo que el rendimiento fuera de ese rango no esta garantizado.
- Limitaciones de idioma: no se documentan idiomas ni evaluaciones multilingues para este ajuste.
- Restricciones de licencia: se aplica la Llama 3.1 Community License, no una licencia permisiva; su uso comercial esta sujeto a los terminos de dicha licencia.
- Estado de carga incompleto: la model card indica que solo los pesos de 6 de 9 snapshots estaban subidos al repositorio en el momento de su publicacion; el resto seguia en proceso de subida.
- Coherencia variable por snapshot: el snapshot epoch1 presenta una coherencia media de 42,57, notablemente baja, lo que limita su utilidad para cualquier tarea que requiera respuestas consistentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EdwardoSunny/em-organisms-llama3.1-8b-instruct-full-sft-good-medical
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia del modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/LICENSE
- Coleccion de organismos EM: https://huggingface.co/collections/EdwardoSunny/em-organisms-confinement-and-methods-sweeps-start-here-6ab4ac2651ce93758e81ac38
- Repositorio de metodos: https://huggingface.co/EdwardoSunny/em-organisms-llama3.1-8b-instruct
- Repositorio de referencias y controles: https://huggingface.co/EdwardoSunny/em-organisms-llama3.1-8b-instruct-references
- Gemelo de consejo medico malo: https://huggingface.co/EdwardoSunny/em-organisms-llama3.1-8b-instruct-full-sft-bad-medical
- Paper de desalineacion emergente: https://arxiv.org/abs/2502.17424
- Dashboard de resultados de InterpUpdates: https://interpupdates.github.io
