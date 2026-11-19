# mrysh/qwen3.5-4b-prune_depth_10_lora_kd_int8_w8a16

## Resumen

`mrysh/qwen3.5-4b-prune_depth_10_lora_kd_int8_w8a16` es un modelo derivado de `Qwen/Qwen3.5-4B` resultado de un pipeline de compresion en tres etapas: poda de profundidad (eliminacion del 10 % de las capas), destilacion LoRA desde el modelo original sin podar y cuantizacion INT8 con activaciones de 16 bits. Lo publica el usuario mrysh como ultimo paso de un experimento de compresion de LLM dentro de un benchmark de pruning, edicion de pesos y cuantizacion.

El objetivo es demostrar que un modelo podado agresivamente puede recuperar casi todo su rendimiento funcional si se le aplica destilacion LoRA, y que despues puede cuantizarse a INT8 sin perdida medible adicional. El resultado es un modelo de 3.867 millones de parametros que ocupa 4,53 GB en disco (0,54x del original) y que en vLLM sobre una L40 alcanza 122,9 tokens/s para un usuario, 1,68x la velocidad del Qwen3.5-4B original.

La relevancia practica esta en el binomio tamano/rendimiento: mantiene el 87,6 % de precision en BFCL (frente al 88,0 % del original) y el 70,1 % en MedQA (frente al 70,8 %) ocupando la mitad de disco y siendo casi el doble de rapido. La informacion disponible es limitada: no hay datos del autor sobre licencia, idiomas ni pipeline, y la evaluacion se limita a tres conjuntos de prueba ejecutados una sola vez.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5, tag `qwen3_5_text`); profundidad reducida un 10 % respecto al modelo base |
| Parametros totales | 3.866.979.776 (3,87 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 con activaciones FP16 (`int8_w8a16`, una escala por canal de salida, sin datos de calibracion); pesos en safetensors con `compressed-tensors` 0.17.0 |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card indica que aplica la licencia del modelo base, sin especificarla) |
| Formato de pesos | safetensors (compatible con `compressed-tensors`, consumible por vLLM sin flag de cuantizacion) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-4B`, un transformer denso de la familia Qwen3.5. Sobre el se aplica un pipeline de tres etapas documentado por el autor: primero una poda de profundidad que elimina el 10 % de las capas (modelo intermedio `mrysh/qwen3.5-4b-prune_depth_10`), despues una destilacion LoRA desde el modelo original sin podar (modelo intermedio `mrysh/qwen3.5-4b-prune_depth_10_lora_kd`) y finalmente una cuantizacion INT8.

La cuantizacion usa `int8_w8a16`: pesos en 8 bits con una escala por canal de salida, redondeo simple y sin datos de calibracion, activaciones en 16 bits. Se realizo con `compressed-tensors` 0.17.0 en 77 segundos sobre una NVIDIA L40. El autor no detalla el corpus de destilacion mas alla de indicar que contenia peticiones con el formato de los tests BFCL y MedQA, lo que supone un caveat importante para interpretar los resultados. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base Qwen3.5-4B.
- Function calling / tool calling: es la capacidad mas evaluada; el modelo obtiene 87,6 % de precision global en BFCL, con 91,1 % en llamada a una sola funcion, 94,2 % al elegir entre varias funciones y 80,9 % en llamadas multiples simultaneas.
- Razonamiento multi-paso orientado a agentes: soporta cadenas de varias llamadas a funciones, aunque el rendimiento en llamadas multiples con eleccion (82,4 %) es inferior al de una sola llamada.
- Capacidad de responder correctamente cuando ninguna funcion encaja (92,1 %), lo que reduce falsos positivos en pipelines de agentes.
- Conocimiento medico basico: 70,1 % de acierto en MedQA con opciones.
- Multilingue: no disponible (el autor no documenta idiomas).
- Modo thinking: la evaluacion se realizo con thinking desactivado; el autor no documenta el comportamiento con thinking activado.
- Vision, audio y otras modalidades: no disponible.

## Casos de uso

- Function calling en produccion: el modelo mantiene el 87,6 % de precision en BFCL con la mitad de disco que el original, por lo que es adecuado para backends de agentes que necesitan muchas instancias en paralelo con presupuesto de VRAM ajustado.
- Agentes multi-paso con varias herramientas: soporta llamadas multiples simultaneas (80,9 %) y eleccion entre funciones (94,2 %), lo que permite orquestar flujos con varias APIs en un mismo turno.
- Despliegue en GPU de consumo: con 4,53 GB de pesos INT8 cabe en GPUs de 8-12 GB de VRAM, lo que habilita prototipos locales de asistentes con herramientas sin recurrir a A100 o H100.
- Servicio de alto throughput: 122,9 tokens/s por usuario en una L40 con vLLM lo hace viable para atencion al cliente automatizada o generacion de texto en lote donde la latencia importa.
- Triaje y clasificacion con salida estructurada: la alta tasa de respuestas con formato de llamada valido (solo 2 de 774 invalidas) lo hace util para extraccion de entidades y enrutamiento a APIs en pipelines deterministas.
- Asistencia en dominios con conocimiento factual moderado: el 70,1 % en MedQA sugiere uso como apoyo en preguntas de opcion multiple o pre-filtrado, siempre con supervision humana y sin sustituir a un sistema validado clinicamente.
- Evaluacion de sesgo en decisiones: el 78,1 % en el conjunto de Hiring bias permite usar el modelo en experimentos de auditoria de sesgo, aunque no como sistema de decision autonomo.

## Benchmarks y rendimiento

Resultados publicados por el autor. Decodificacion greedy, thinking desactivado, vLLM 0.34 sobre una NVIDIA L40, mismas preguntas para todos los modelos: 977 de BFCL, 1273 de MedQA y 288 de Hiring bias.

| Metrica | Original Qwen3.5-4B | Podado | Podado + destilacion | Este modelo (INT8) |
|---|---|---|---|---|
| BFCL, precision global de function calling | 88,0 % | 34,2 % | 87,5 % | 87,6 % |
| BFCL, una sola funcion | 90,8 % | 61,2 % | 91,1 % | 91,1 % |
| BFCL, elegir entre varias funciones | 92,8 % | 50,0 % | 94,2 % | 94,2 % |
| BFCL, varias llamadas a la vez | 83,3 % | 1,9 % | 80,9 % | 80,9 % |
| BFCL, varias llamadas con eleccion | 83,5 % | 4,1 % | 81,8 % | 82,4 % |
| BFCL, "ninguna funcion encaja" correcto | 91,6 % | 88,7 % | 92,1 % | 92,1 % |
| BFCL, respuestas sin formato valido (de 774) | 1 | 437 | 5 | 2 |
| MedQA, precision con opciones | 70,8 % | 66,3 % | 69,8 % | 70,1 % |
| Hiring bias, precision de decision | 77,4 % | 67,4 % | 78,8 % | 78,1 % |
| Tamano en disco (GB) | 8,41 | 7,75 | 7,75 | 4,53 |
| Velocidad (tokens/s, un usuario, vLLM, L40) | 73,2 | 70,8 | 80,1 | 122,9 |

Frente al modelo destilado sin cuantizar, la cuantizacion INT8 supone +0,1 puntos en BFCL, +0,4 en MedQA y -0,7 en Hiring bias, con 0,54x el tamano y 1,68x la velocidad del original. El autor advierte que diferencias de uno o dos puntos estan dentro del ruido: el intervalo de confianza del 95 % es de aproximadamente ±2 puntos en BFCL, ±3 en MedQA y ±5 en Hiring bias.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5-5,5 GB para los pesos INT8 mas overhead de activaciones y cache KV; el autor no publica una cifra exacta de VRAM pico.
- GPU recomendadas: NVIDIA L40 (configuracion usada en la evaluacion, 122,9 tokens/s por usuario). Cualquier GPU con al menos 8 GB de VRAM deberia poder cargar los pesos.
- GPU de consumo: cabe en tarjetas de 8-12 GB (por ejemplo, RTX 3060 Ti 8 GB, RTX 4060 Ti 16 GB, RTX 4070), siempre que se ajuste el contexto para no desbordar la cache KV.
- Opciones de despliegue: vLLM 0.34 o superior es la via documentada; el modelo usa `compressed-tensors` y vLLM detecta la configuracion desde `config.json` sin flag `--quantization`. El autor no documenta soporte en llama.cpp, Ollama ni TGI.
- Latencia y throughput: 122,9 tokens/s para un usuario en una L40 con decodificacion greedy; el autor no publica latencia por peticion ni throughput agregado con batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BFCL (global) | MedQA | Tamano en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Este modelo (INT8) | 3,87 B | No disponible | 87,6 % | 70,1 % | 4,53 GB | No disponible | Hugging Face |
| `mrysh/qwen3.5-4b-prune_depth_10_lora_kd` (sin cuantizar) | No disponible | No disponible | 87,5 % | 69,8 % | 7,75 GB | No disponible | Hugging Face |
| `Qwen/Qwen3.5-4B` (original) | No disponible | No disponible | 88,0 % | 70,8 % | 8,41 GB | No disponible | Hugging Face |
| `mrysh/qwen3.5-4b-prune_depth_10` (solo podado) | No disponible | No disponible | 34,2 % | 66,3 % | 7,75 GB | No disponible | Hugging Face |

No se dispone de datos para comparar con alternativas de otros autores (por ejemplo, otros modelos de 4 B o variantes cuantizadas de Qwen); la informacion proporcionada solo permite la comparacion interna del pipeline de compresion.

## Limitaciones y advertencias

- La destilacion se realizo con un corpus que contenia peticiones con el formato de los tests BFCL y MedQA, por lo que los resultados en esos benchmarks pueden estar inflados respecto a un uso real fuera de esos dominios.
- Una sola cuantizacion y una sola evaluacion por modelo, sin repeticiones; los intervalos de confianza son amplios (±2 puntos en BFCL, ±3 en MedQA, ±5 en Hiring bias).
- Evaluado unicamente con vLLM 0.34 en una L40, thinking desactivado y decodificacion greedy; no hay datos sobre otros backends, sampling o modo thinking.
- Licencia no especificada: la model card remite a la licencia del modelo base sin nombrarla, lo que impide confirmar condiciones de uso comercial.
- Idiomas y longitud de contexto no documentados por el autor; no se puede garantizar comportamiento multilingue ni contextos largos.
- Riesgo de alucinacion inherente a un modelo de 4 B, agravado por la poda de capas y la falta de datos sobre el corpus de destilacion.
- Sesgo: el conjunto de Hiring bias muestra un 78,1 % de precision de decision, pero no se documentan sesgos demograficos ni auditorias adicionales; no debe usarse como sistema de decision autonomo en seleccion de personal.
- El modelo podado sin destilar colapsa en llamadas multiples (1,9 %), lo que ilustra la fragilidad del proceso de poda; cualquier cambio adicional de compresion deberia re-evaluarse.
- Sin descargas ni likes en el momento de la ficha (0 y 0), lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrysh/qwen3.5-4b-prune_depth_10_lora_kd_int8_w8a16
- Modelo base de la cuantizacion: https://huggingface.co/mrysh/qwen3.5-4b-prune_depth_10_lora_kd
- Modelo intermedio solo podado: https://huggingface.co/mrysh/qwen3.5-4b-prune_depth_10
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-4B
- Libreria de cuantizacion: https://github.com/vllm-project/compressed-tensors
- Papers, blogs, repos y demos adicionales: no disponibles en la informacion proporcionada.
