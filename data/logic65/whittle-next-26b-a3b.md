# logic65/Whittle-Next-26B-A3B

## Resumen

Whittle-Next-26B-A3B es un modelo de lenguaje de tipo mixtura de expertos (MoE) desarrollado por el investigador independiente logic65. Se trata de un derivado de Qwen3.6-35B-A3B podado y reconvertido al formato de arquitectura `qwen4_exp`, que el autor describe como un punto intermedio entre las generaciones Qwen3.6 y Qwen3.8-Flash-Next. El modelo tiene 26.553.382.016 parametros totales (25,1B del cuerpo mas 1,0B de una tabla de memoria n-grama) y aproximadamente 3B parametros activos por token, lo que lo situa en la categoria de MoE disperso de bajo coste de inferencia.

El interes tecnico del modelo reside en su receta de construccion: poda de expertos enrutados de 256 a 180 por capa, autoconsulta (self-distillation) para recuperar calidad, conversion progresiva de la puerta silu a sigmoid en las capas GDN (gated delta net), retrofit de hyper-connections de cuatro flujos residuales, una memoria n-grama hasheada de 1,0B parametros leida antes de la capa 2, y destilacion online desde Qwen3.8-27B con KL directa sobre corpus y KL inversa sobre respuestas muestreadas por el propio estudiante.

Es relevante ahora porque demuestra un camino reproducible para portar un modelo existente a un formato de arquitectura nuevo (el `qwen4_exp` de la familia Qwen4-Next) manteniendo compatibilidad con llama.cpp sin parches ni `--override-kv`. El autor lo publica explicitamente como research preview superado por su sucesor Whittle-Next-27B-A3B, y advierte que no es un modelo de proposito general terminado sino un punto de partida para quien quiera construir sobre esa arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen4_exp` (MoE transformer con puerta sigmoid GDN, hyper-connections de 4 flujos y memoria n-grama hasheada) |
| Parametros totales | 26.553.382.016 (25,1B cuerpo + 1,0B tabla n-grama) |
| Parametros activos | ~3B por token (las consultas a la tabla no computan) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (publicado y evaluado); GGUF compatible con llama.cpp |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF (Q8_0) |

## Arquitectura y entrenamiento

El cuerpo es un transformer MoE con atencion de tipo gated delta net (GDN). Frente al `qwen3_5_moe` del modelo base, que usa una puerta silu, esta version emplea una puerta sigmoid en las capas GDN, incorpora hyper-connections de cuatro flujos residuales por capa con un mezclador de cabeza, y anade una memoria n-grama hasheada de 8 cabezas x 488.320 filas x 256 dimensiones que codifica bigramas y trigramas con el mismo esquema de hash que usa PLE en llama.cpp; la tabla se lee hacia el residual antes de la capa 2 mediante una ruta clave/valor con compuerta. El modelo base se podo de 256 a 180 expertos enrutados por capa (criterio de masa de activacion sin puerta, conservando el 82% de la masa enrutada), pasando de 34,7B a 25,1B parametros, y se recupero mediante autoconsulta con mascara de enrutamiento y LoRA sobre los expertos conservados (Muon + AdamW).

La conversion de puerta silu a sigmoid se hizo de forma progresiva, en grupos de tres capas GDN desde el final, con reajuste y entrenamiento por grupo; la conversion en un solo paso dejaba la entropia cruzada en 14,7 (modelo muerto), mientras que la progresiva alcanzo 2,05 en held-out. Las hyper-connections se retrofit con identidad exacta (el modelo convertido era bit a bit identico en el paso 0) y se entrenaron despues; el autor documenta que inicializar a cero tanto `down` como `up` produce una silla de montar sin gradiente, y que la receta correcta es `down` aleatorio con `up` a cero. La tabla n-grama se entreno con SGD disperso normalizado (cada fila visitada se mueve 0,02 fijo en la direccion del gradiente), porque el SGD recortado convencional dejaba la tabla fp16 congelada por debajo del ulp. La destilacion online desde Qwen3.8-27B combina KL directa sobre la ventana de corpus (vocabulario completo de 248k) con CE, y KL inversa sobre las respuestas muestreadas por el estudiante, acumulando el gradiente on-policy en el siguiente paso de corpus para reducir el ruido (el paso aislado era 32 veces mas ruidoso). La exportacion usa `convert_hf_to_gguf.py` de llama.cpp estandar con `model_type: qwen4_exp_text`, indice QSA inerte y contrato de hash emitido; se sirve con una build CUDA estandar sin ningun fichero modificado.

## Capacidades

- Generacion de texto conversacional y razonamiento de tipo cadena de pensamiento (el sucesor 27B incorpora destilacion sobre trazas de pensamiento completas; este 26B es la base previa).
- Razonamiento matematico: GSM8K del 87,0% (174/200) sin modo thinking, en llama.cpp Q8_0 con el sampler de servicio.
- Codigo y respuesta tecnica: las dos respuestas que no alcanzan EOS en la sonda de parada son respuestas largas sobre TCP/UDP, lo que indica cobertura de contenido tecnico de redes.
- Memoria n-grama hasheada con crecimiento sin reentrenamiento: duplicar filas por replicacion (`hash % 2R ∈ {r, r+R}`) preserva el comportamiento, lo que permite escalar la tabla.
- Recuperacion de nombres en conversaciones multi-turno (verificado como correcto por el autor).
- Compatibilidad con llama.cpp estandar, sin parches ni `--override-kv`.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision o audio: no disponibles.

## Casos de uso

- Investigacion sobre arquitecturas Qwen4-Next: sirve como cuerpo de partida que ya carga y se sirve en llama.cpp estandar, con los tensores de hyper-connections, memoria n-grama y embeddings por capa cableados, para experimentar con el formato `qwen4_exp` sin tener que reconstruir el pipeline de conversion.
- Destilacion y ajuste fino sobre arquitectura nueva: el repositorio incluye cuerpo congelado, checkpoint entrenable, tabla, contrato de hash, entrenador y exportador, lo que permite continuar el entrenamiento con recetas propias (LoRA, destilacion online, RLHF) sobre una base que ya funciona.
- Evaluacion de tecnicas de poda de expertos: el modelo documenta una poda de 256 a 180 expertos con criterio de masa de activacion y recuperacion por autoconsulta, util como referencia reproducible para estudiar el impacto de la poda en MoE.
- Servicio de inferencia de bajo coste en GPU de consumo: con ~3B parametros activos por token y cuantizacion Q8_0, es adecuado para desplegar en hardware modesto con llama.cpp, manteniendo una calidad de matematicas cercana al 87% en GSM8K.
- Pruebas de estabilidad de generacion: la sonda de parada (10/12 respuestas alcanzan EOS con repeticion maxima de 4-grama de 0,038) lo hace util para validar pipelines de generacion larga y detectar bucles, aunque el autor senala que las dos respuestas sin EOS son contenido largo, no bucles.
- Base para el desarrollo de modelos sucesores: el 27B y el 35B-A3B de la misma familia se construyen sobre esta receta, por lo que sirve como referencia de linaje y para comparar el efecto de duplicar la tabla n-grama y desbloquear los flujos de hyper-connections.
- Experimentos de memoria asociativa: la tabla n-grama hasheada con crecimiento por replicacion permite estudiar memorizacion de secuencias y recuperacion de contexto sin reentrenar el cuerpo.

## Benchmarks y rendimiento

| Benchmark | Qwen3.6-Whittle-25B-A3B (base) | Whittle-Next-26B-A3B |
|---|---|---|
| Parametros totales | 25,1B | 26,1B (25,1B + 1,0B memoria n-grama) |
| Parametros activos por token | ~3B | ~3B |
| GSM8K (200 preguntas, sin thinking, llama.cpp Q8_0, sampler de servicio) | 86,5% | 87,0% (174/200) |
| Sonda de parada (12 respuestas abiertas, limite 400 tokens) | no disponible | 10/12 alcanzan EOS, repeticion maxima de 4-grama 0,038 |
| Recuperacion de nombres multi-turno | correcto | correcto |

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 26,1B parametros en Q8_0, el peso del modelo ronda los 26-28 GB, por lo que se necesita al menos una GPU de 32 GB o reparto entre varias. Las consultas a la tabla n-grama no anaden computo por token.
- GPU recomendadas: A100 40/80 GB, H100, o configuraciones multi-GPU con 2 x RTX 4090 (24 GB cada una) en Q8_0. Una unica RTX 4090 no cabe en Q8_0; requeriria cuantizaciones menores no publicadas en la informacion disponible.
- Cabe en GPU de consumo: solo mediante reparto multi-GPU o cuantizaciones mas agresivas no documentadas; no en una sola GPU de 24 GB en Q8_0.
- Opciones de despliegue: llama.cpp (build CUDA estandar, sin parches), con el GGUF Q8_0 publicado; el autor indica compatibilidad con endpoints. vLLM, TGI y Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | GSM8K | Licencia | Estado |
|---|---|---|---|---|---|---|
| Whittle-Next-26B-A3B | 26,1B | ~3B | no disponible | 87,0% (sin thinking, Q8_0) | Apache 2.0 | Research preview, superado |
| Whittle-Next-27B-A3B | no disponible (2B filas de memoria) | ~3B | no disponible | 86,5% / 86,0% | Apache 2.0 | Recomendado por el autor |
| Qwen3.6-Whittle-25B-A3B | 25,1B | ~3B | no disponible | 92,5% (transformers) | Apache 2.0 | Base del linaje |
| Whittle-Qwen-3.8-35B-A3B | 35B (aprox.) | ~3B | no disponible | no disponible | Apache 2.0 | Flagship actual de la familia |

El autor senala que, para matematicas, este 26B es marginalmente mejor que el 27B, pero que el 27B es el modelo a ejecutar por su mejor regimen de memorizacion, LoRA en capas 2-12 y destilacion de razonamiento sobre trazas completas.

## Limitaciones y advertencias

- Modelo de research preview explicitamente superado por Whittle-Next-27B-A3B; el autor recomienda ejecutar el sucesor y tratar estas cifras como linea base, no como producto.
- No es un modelo de proposito general terminado: esta pensado como punto de partida para construir sobre la arquitectura `qwen4_exp`.
- La sonda de parada muestra 2 de 12 respuestas que no alcanzan EOS (respuestas largas sobre TCP/UDP), lo que indica riesgo de generaciones excesivamente largas en consultas tecnicas abiertas.
- La tabla n-grama se entrena con SGD disperso normalizado y una tasa fija de 0,02; el autor documenta que el SGD recortado convencional la deja congelada en fp16, lo que implica sensibilidad al regimen de entrenamiento si se continua el ajuste.
- La conversion de puerta silu a sigmoid es fragil: la conversion en un solo paso produjo un modelo muerto (CE 14,7); solo la progresiva en grupos de tres capas funciono. Cualquier reentrenamiento debe respetar ese procedimiento.
- El retrofit de hyper-connections requiere inicializacion asimetrica (`down` aleatorio, `up` cero); inicializar ambos a cero produce una silla sin gradiente.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; al ser un modelo pequeno y destilado, cabe esperar el comportamiento tipico de modelos de ~3B activos, pero no hay datos publicados.
- Idiomas soportados: no disponibles; no se confirma cobertura multilingue.
- Licencia Apache 2.0 permite uso comercial, pero el estado de research preview y la falta de evaluaciones de seguridad desaconsejan produccion sin validacion propia.
- El repo ocupa 261,8 GB, lo que implica un coste de almacenamiento considerable para descargar el conjunto completo de pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/logic65/Whittle-Next-26B-A3B
- Modelo base: https://huggingface.co/logic65/Qwen3.6-Whittle-25B-A3B
- Sucesor recomendado: https://huggingface.co/logic65/Whittle-Next-27B-A3B
- Flagship de la familia: https://huggingface.co/logic65/Whittle-Qwen-3.8-35B-A3B
- Apoyo al autor: https://ko-fi.com/davida81328
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
