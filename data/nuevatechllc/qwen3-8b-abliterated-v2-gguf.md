# NuevaTechLLC/Qwen3-8B-abliterated-v2-GGUF

## Resumen

Qwen3-8B-abliterated-v2 (GGUF) es una version "abliterated" del modelo Qwen/Qwen3-8B de Alibaba, publicada por Nueva Tech LLC. La abliteracion es una tecnica de edicion de pesos que localiza y elimina la direccion interna asociada al rechazo de peticiones, de modo que el modelo conserva su comportamiento general sobre prompts ordinarios pero declina muchas menos solicitudes. El resultado se distribuye en formato GGUF para su uso con llama.cpp, Ollama y LM Studio.

El modelo parte de los 8.190.735.360 parametros del checkpoint original de Qwen3-8B y se ofrece en una unica cuantizacion Q4_K_M de 5,0 GB. La propuesta diferencial del autor no es solo eliminar el rechazo, sino hacerlo con una metodologia de "bajo dano": un pipeline de optimizacion restringida que mide el deterioro colateral (capacidad, calibracion, sobre-rechazo y divergencia KL) y busca un punto en la frontera de Pareto entre reduccion de rechazo y preservacion de capacidades.

Es relevante ahora porque la mayoria de recetas publicas de abliteracion aplican una unica direccion de diferencia de medias en todas las capas, lo que degrada comportamientos calibrados sin que las comprobaciones habituales de KL lo detecten. Este modelo documenta de forma exhaustiva (ficheros `extract.json`, `search.json` y `ablation_card.json`) cada etapa del proceso y compara su resultado con herramientas publicas como Heretic 1.4.0 y OBLITERATUS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3-8B; detalles especificos no disponibles) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible en la model card; el ejemplo de llama.cpp usa `-c 8192` |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado); se menciona Q8_0 "where present" |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es una edicion de pesos sobre el checkpoint Qwen/Qwen3-8B, no un reentrenamiento. La arquitectura subyacente es la de Qwen3-8B (transformer denso de 8.190.735.360 parametros), aunque la model card no detalla capas, dimensiones ni regimen de atencion. El proceso de abliteracion actua sobre las proyecciones de salida de atencion y de la MLP.

El pipeline del autor ("low damage abliteration") trata la eliminacion del rechazo como un problema de optimizacion restringida con varias innovaciones tecnicas: (1) uso de "gemelos" armonicos, reescrituras estructuralmente emparejadas de cada prompt danino, para aislar la decision de rechazo de topicos, longitud y registro; (2) cuatro comportamientos protegidos (rechazar premisas falsas, admitir ignorancia, rechazar sinsentidos, respetar restricciones negativas) con 96 pares de sonda y control, ponderados por encima del KL en la funcion objetivo; (3) un escaneo de capas que localiza donde se separa mejor el rechazo y aplica la edicion con un kernel centrado en esa capa; (4) eliminacion de la media armonica de la direccion antes de la proyeccion, con restauracion opcional de norma; (5) descomposicion SVD para obtener un subespacio de rango k en lugar de una unica direccion; y (6) busqueda Optuna sobre la funcion objetivo `refusal + λ_kl·KL + λ_cal·calibration_drop + λ_over·Δover_refusal`, con una pasada opcional de autodestilacion contra los logits cacheados del modelo intacto.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO, ya que se trata de una edicion de pesos sobre un modelo ya entrenado.

## Capacidades

- Generacion de texto conversacional multiturno (pipeline `text-generation`, tag `conversational`).
- Razonamiento y conocimiento general heredados de Qwen3-8B (MMLU 0.757 en la evaluacion del autor sobre el checkpoint bf16).
- Razonamiento matematico (GSM8K 0.892) y respuesta a preguntas de ciencia (ARC-Challenge 0.560).
- Reduccion sustancial del rechazo: tasa de rechazo de 0.610 frente a 0.954 del modelo base, con una tasa de cumplimiento real (`comply`) de 0.273 frente a 0.004 del base.
- Menor sobre-rechazo que el base: 0.050 frente a 0.370 en OR-Bench-hard.
- Preservacion de comportamientos calibrados (rechazo de premisas falsas, admision de ignorancia, rechazo de sinsentidos, respeto de restricciones negativas) mediante el objetivo de calibracion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: la model card solo declara `en`; no se documentan otras lenguas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion en interpretabilidad y seguridad: el repositorio incluye `extract.json`, `search.json` y `ablation_card.json` con el escaneo de capas, el subespacio, las metricas de cada trial y el plan elegido, lo que permite reproducir y auditar el proceso de edicion de pesos.
- Evaluacion comparativa de tecnicas de abliteracion: sirve como referencia "ours" frente a Heretic 1.4.0 y OBLITERATUS bajo un mismo evaluador, tokenizer, plantilla de chat y decodificacion greedy.
- Despliegue local en hardware de consumo: con 5,0 GB en Q4_K_M y aproximadamente 7 GB de VRAM o RAM, cabe en GPUs consumer de gama media-alta mediante Ollama, LM Studio o llama.cpp.
- Generacion de texto creativo sin restricciones de rechazo: para tareas de ficcion, guiones o narrativa donde el modelo base declinaria con frecuencia, manteniendo el conocimiento general de Qwen3-8B.
- Prototipado de asistentes conversacionales en local: integracion via `ollama run` o `llama-cli -c 8192 -cnv` para pruebas de concepto sin dependencia de API.
- Analisis de sesgos y robustez: permite estudiar como cambia la tasa de cumplimiento y el sobre-rechazo al eliminar la direccion de rechazo, util para auditorias de seguridad de modelos.
- Red teaming controlado: el modelo facilita la generacion de contenido que el base rechazaria, lo que lo hace util en entornos de evaluacion de defensas y filtros.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el checkpoint bf16 del que se cuantizaron estos GGUF. Evaluador: Qwen3Guard-Gen-8B para rechazos. Conjuntos: StrongREJECT sin solapamientos con AdvBench (282 prompts daninos), OR-Bench-hard (300 prompts benignos que parecen daninos) y Dolly (300 prompts armonicos). Capacidad: lm-eval 0.4.13, MMLU completo, ARC-Challenge y GSM8K a 400 items.

**Qwen3-8B**

| Contender | Refusal | Comply | Over-refusal | KL | MMLU | ARC-C | GSM8K |
|---|---|---|---|---|---|---|---|
| base | 0.954 | 0.004 | 0.370 | 0.000 | 0.757 | 0.560 | 0.892 |
| Heretic 1.4.0 | 0.610 | 0.273 | 0.050 | 0.006 | 0.757 | 0.558 | 0.898 |
| OBLITERATUS advanced | 0.716 | 0.188 | 0.113 | 0.242 | 0.747 | 0.525 | 0.880 |
| OBLITERATUS optimized | 0.876 | 0.053 | 0.110 | 0.116 | 0.746 | 0.548 | no disponible |
| Ours (este modelo) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Nota: la tabla de la model card se trunca en la fila de OBLITERATUS optimized; los valores de la fila "Ours" no aparecen en la informacion proporcionada, por lo que no se reproducen.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 7 GB para el fichero Q4_K_M de 5,0 GB.
- GPU recomendadas: no especificadas en la model card; por tamano, cabe en GPUs consumer con 8 GB o mas de VRAM (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 3070) y en GPUs de datacenter (A100, H100) sin problema.
- Cabe en GPU consumer: si, con al menos 8 GB de VRAM; con 7 GB justos puede requerir offload parcial a RAM.
- Opciones de despliegue: Ollama (via Modelfile incluido), LM Studio (`lms import`), llama.cpp (`llama-cli -m ... -c 8192 -cnv`). No se mencionan vLLM ni TGI para este formato GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Refusal | Comply | Over-refusal | KL | MMLU | ARC-C | GSM8K | Licencia | Formato |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Qwen3-8B-abliterated-v2 (este) | 8,19 B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | apache-2.0 | GGUF |
| Qwen3-8B (base) | 8,19 B | no disponible | 0.954 | 0.004 | 0.370 | 0.000 | 0.757 | 0.560 | 0.892 | apache-2.0 | safetensors |
| Qwen3-8B + Heretic 1.4.0 | 8,19 B | no disponible | 0.610 | 0.273 | 0.050 | 0.006 | 0.757 | 0.558 | 0.898 | apache-2.0 (heredada) | no disponible |
| Qwen3-8B + OBLITERATUS advanced | 8,19 B | no disponible | 0.716 | 0.188 | 0.113 | 0.242 | 0.747 | 0.525 | 0.880 | apache-2.0 (heredada) | no disponible |

La comparativa se limita a variantes abliterated del mismo modelo base segun los datos del autor; no se dispone de resultados de benchmarks para la fila "Ours" en la informacion proporcionada.

## Limitaciones y advertencias

- La eliminacion de la direccion de rechazo reduce las barreras de seguridad del modelo base: la tasa de cumplimiento real (`comply`) sube de 0.004 a 0.273 en la variante evaluada, lo que implica que puede producir contenido que el modelo original rechazaria.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la edicion de pesos puede afectar a la calibracion, aunque el pipeline incluye comportamientos protegidos para mitigarlo.
- Solo se declara soporte de ingles (`en`); el rendimiento en castellano u otras lenguas no esta documentado.
- La longitud de contexto no se especifica en la model card; el ejemplo de llama.cpp usa 8192 tokens, pero no se confirma el maximo real.
- Solo se publica la cuantizacion Q4_K_M; no hay ficheros Q8_0, Q5, Q6 ni bf16 en el repositorio (5,0 GB), lo que limita la fidelidad maxima alcanzable respecto al checkpoint editado.
- La licencia apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo editado; el uso en produccion requiere evaluacion propia de seguridad y calidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion independiente de la comunidad.
- La model card esta truncada en la tabla de benchmarks, impidiendo verificar los resultados del propio modelo frente a las alternativas.
- Al ser una edicion de pesos sobre Qwen3-8B, hereda los sesgos del modelo base, no documentados en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/NuevaTechLLC/Qwen3-8B-abliterated-v2-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Heretic (herramienta de abliteracion): no disponible en la informacion proporcionada
- OBLITERATUS (herramienta de abliteracion): no disponible en la informacion proporcionada
- Paper o blog del pipeline de Nueva Tech LLC: no disponible en la informacion proporcionada
- Repositorio de llama.cpp: no disponible en la informacion proporcionada
- Ollama: no disponible en la informacion proporcionada
