# Kodjaoglanian/Qwen-3.5-4B-Auto-ASVD

## Resumen

Qwen-3.5-4B-Auto-ASVD es una variante podada y reentrenada de Qwen/Qwen3.5-4B, publicada por el usuario Kodjaoglanian. El modelo aplica un pipeline automatizado de compresion estructural que combina perfilado de sensibilidad de segundo orden (aproximacion de la matriz Hessiana mediante informacion de Fisher), descomposicion en valores singulares consciente de las activaciones (ASVD) y una etapa posterior de "curacion" mediante LoRA. El resultado es un checkpoint independiente de 4.157.929.984 parametros, ya fusionado y en bfloat16 nativo, sin dependencias de kernels personalizados en tiempo de inferencia.

El problema que resuelve es el de la compresion de modelos sin degradacion catastrofica. En lugar de truncar rangos de forma uniforme entre todas las cabezas de atencion y bloques MLP, el autor calcula objetivos dinamicos de retencion de varianza capa por capa, asignando presupuestos mayores (hasta el 95,00%) a rutas criticas como `down_proj` y permitiendo truncamientos mas agresivos (hasta el 91,60%) en matrices menos sensibles. Se excindieron 47.821.312 parametros (6,86% de reduccion estructural sobre las matrices objetivo).

Es relevante ahora porque demuestra un flujo de trabajo reproducible para reducir el coste de despliegue de modelos de ~4B manteniendo la arquitectura hibrida de Qwen 3.5 (atencion estandar mas capas Gated DeltaNet), un patron que esta ganando traccion frente a los transformers densos clasicos. La licencia Apache 2.0 y el hecho de ser un reemplazo directo en pipelines de transformers lo hacen atractivo para experimentacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida de Qwen 3.5: atencion estandar + capas Gated DeltaNet, transformer causal con proyecciones factorizadas (SVD de bajo rango en q_proj, k_proj, v_proj, o_proj, down_proj) |
| Parametros totales | 4.157.929.984 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (la calibracion y el reentrenamiento se realizaron con ventanas de 1024 tokens) |
| Tipos de cuantizacion | Solo bfloat16 nativo; no se han publicado versiones cuantizadas (GGUF, AWQ, GPTQ, etc.) |
| Idiomas soportados | en (ingles); no se declaran otros idiomas en la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura de partida es Qwen/Qwen3.5-4B, un modelo hibrido que combina capas de atencion estandar con capas Gated DeltaNet. Sobre esa base, el autor aplico un pipeline en tres fases. Primero, un perfilado de curvatura de segundo orden: se muestreo la energia del gradiente sobre todas las proyecciones usando fragmentos de 1024 tokens con gradient checkpointing, aproximando la diagonal de la Hessiana como la esperanza del cuadrado del gradiente. Las puntuaciones de sensibilidad se mapearon a umbrales de varianza mediante un suavizado logaritmico, con un objetivo de varianza de 0,82 + 0,13 * s_tilde, lo que asigno presupuestos dinamicos capa por capa.

Segundo, una cirugia SVD escalada: cada operador lineal objetivo se escalo con los valores RMS de activacion recogidos en pasadas forward, se trunco mediante SVD en dispositivo y los factores se mapearon a cuellos de botella secuenciales. Se factorizaron 64 matrices de proyeccion (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `down_proj`), eliminando 47.821.312 parametros. Tercero, una curacion LoRA sobre Wikitext-2: rango 32, alpha 64, AdamW con learning rate 2e-4, gradient clipping 1.0, batch efectivo 16, decaimiento coseno con 10% de warmup durante 2 epocas. La perdida de entropia cruzada bajo de 2,2911 (epoca 1) a 2,0432 (epoca 2). Los adaptadores se fusionaron permanentemente con `merge_and_unload`. Todo el proceso se ejecuto y fusiono en bfloat16 nativo sobre una NVIDIA A40 de 48 GB.

## Capacidades

- Generacion de texto causal en ingles: modelo base de tipo `text-generation` compatible con el pipeline estandar de transformers.
- Conversacion multi-turno: la model card lo etiqueta como `conversational`.
- Razonamiento general y comprension de lenguaje natural heredados del modelo base Qwen 3.5-4B.
- Generacion de codigo: capacidad heredada del modelo base, aunque el autor advierte que puede requerir afinado especifico para generacion de codigo con sintaxis estricta.
- Soporte de tool calling / function calling: no disponible de forma explicita en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles; no se confirma soporte multilingue en esta variante.
- Capacidades especiales: no se documentan modos de pensamiento (thinking mode), vision ni audio.

## Casos de uso

- Generacion de texto general en ingles: el modelo se puede usar como reemplazo directo en cualquier pipeline de transformers para completar o redactar texto, ya que el checkpoint esta fusionado y no requiere kernels personalizados.
- Experimentacion en investigacion sobre compresion: sirve como referencia publica de un pipeline ASVD + LoRA sobre una arquitectura hibrida, util para reproducir o comparar tecnicas de poda estructural.
- Prototipado de asistentes conversacionales: gracias a su tamano de ~4B y licencia Apache 2.0, se puede desplegar en una sola GPU para pruebas de chat multi-turno antes de escalar a modelos mayores.
- Inferencia en hardware de gama media: al ocupar unos 8,3 GB en bfloat16, cabe en GPUs de consumo con 12 GB o mas, lo que permite tareas de generacion en estaciones de trabajo sin aceleradores de datacenter.
- Generacion de codigo asistida: puede integrarse en editores o scripts para autocompletado y explicacion de fragmentos, con la advertencia de que el autor recomienda afinado adicional para sintaxis estricta.
- Analisis y resumen de documentos en ingles: util para resumir articulos o informes dentro de la ventana de contexto efectiva del modelo base.
- Docencia y demostraciones: su tamano moderado y su licencia permisiva lo hacen adecuado para aulas o talleres donde se ensena compresion de modelos y despliegue local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de rendimiento reportada es la perdida de entropia cruzada de la fase de curacion LoRA (2,0432 en la epoca 2, partiendo de 2,2911 en la epoca 1), que no es comparable directamente con metricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 8,3 GB solo para pesos, mas el cache KV y las activaciones (aproximadamente 9-11 GB en funcion de la longitud de contexto).
- GPU utilizadas en el entrenamiento: NVIDIA A40 (48 GB VRAM), usada para el perfilado, la SVD y la curacion LoRA.
- GPU recomendadas: A100, H100, A40, L40S para despliegue con contexto largo o batch alto; RTX 4090 (24 GB) y RTX 3090 (24 GB) para uso individual con margen amplio.
- Cabe en GPU de consumo: si. Modelos de 16 GB (RTX 4080) y 12 GB (RTX 3060 12 GB, RTX 4070) pueden ejecutarlo en bfloat16 con contexto moderado; por debajo, no hay cuantizaciones publicadas que lo permitan.
- Opciones de despliegue: transformers (soporte nativo, libreria declarada), vLLM y TGI previsiblemente compatibles al ser un modelo causal estandar; llama.cpp y Ollama requeririan convertir los pesos a GGUF, ya que no se ofrecen versiones GGUF.
- Latencia y throughput estimados: no disponible. La model card no reporta cifras de latencia ni tokens por segundo.
- Dependencias opcionales: pueden aparecer avisos por librerias de aceleracion ausentes (`causal_conv1d`, `flash-linear-attention`); el modelo recurre a operaciones de referencia estandar sin perdida de precision.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-3.5-4B-Auto-ASVD | 4.157.929.984 (4,16B) | no disponible | Sin benchmarks publicados; perdida de curacion 2,0432 | apache-2.0 | HuggingFace, safetensors bf16 |
| Qwen/Qwen3.5-4B (base) | ~4,21B (inferido a partir de los 47,8M parametros excindidos) | no disponible | no disponible | no disponible | HuggingFace |
| Otros modelos de ~4B en ingles | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar el rendimiento de esta variante con alternativas de la misma categoria; la unica diferencia documentada frente al modelo base es la reduccion estructural de 47.821.312 parametros en las matrices `q_proj`, `k_proj`, `v_proj`, `o_proj` y `down_proj`, con una retencion de varianza entre el 91,60% y el 95,00%.

## Limitaciones y advertencias

- Deriva de dominio: la curacion LoRA se hizo sobre un flujo de calibracion de 1024 tokens de Wikitext-2 (lenguaje natural general). Para cargas de produccion especificas (diagnostico medico, generacion de codigo con sintaxis estricta, redaccion legal) el autor recomienda afinado especifico sobre este checkpoint.
- Riesgo de alucinacion: no se documenta ningun mecanismo de mitigacion; al ser un modelo generativo de ~4B, el riesgo de fabricar informacion persiste.
- Idiomas: la model card solo declara ingles. No hay confirmacion de soporte multilingue en esta variante, aunque el modelo base pudiera tenerlo.
- Sesgos: no se reportan evaluaciones de sesgo ni de alineacion en la informacion disponible.
- Restricciones de licencia: licencia Apache 2.0, permite uso comercial y modificaciones, siempre que se respeten las condiciones de atribucion de la licencia.
- Dependencias de kernels: en entornos PyTorch estandar pueden aparecer avisos por la ausencia de `causal_conv1d` y `flash-linear-attention`; el modelo funciona con operaciones de referencia, pero el rendimiento puede ser inferior al optimo.
- Popularidad y validacion: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, y se publico en septiembre de 2026; carece de validacion independiente o comunidad que lo respalde.
- Cuantizacion: al no haber versiones GGUF, AWQ o GPTQ, el despliegue en entornos con poca VRAM queda limitado al bfloat16.

## Enlaces

- HuggingFace: https://huggingface.co/Kodjaoglanian/Qwen-3.5-4B-Auto-ASVD
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper o blog del pipeline ASVD: no disponible en la informacion proporcionada.
- Repositorio de codigo: no disponible en la informacion proporcionada.
- Demo: no disponible en la informacion proporcionada.
