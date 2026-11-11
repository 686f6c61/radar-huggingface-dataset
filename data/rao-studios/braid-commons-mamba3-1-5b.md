# rao-studios/braid-commons-mamba3-1.5b

## Resumen

braid-commons-mamba3-1.5b es el "commons" (la base comun) del sistema Braid desarrollado por Rao Studios: un modelo de lenguaje construido sobre Mamba-3, la arquitectura de espacio de estados (SSM) de los autores de `state-spaces`. El repositorio no contiene un modelo entrenado por Rao Studios, sino los pesos de `state-spaces/mamba3-mimo-1.5b` reempaquetados sin modificar (valores BF16 ensanchados exactamente a F32) bajo la libreria `braid`. El modelo tiene 1.497 millones de parametros, 24 capas de anchura 2.048 y un vocabulario de 128.256 tokens correspondiente al tokenizer de Llama 3.1.

La propuesta de Braid es una arquitectura de "strands bajo una sola cana": el commons se ejecuta completo y cualquier numero de "Threads" (un corpus cada uno con sus propios bloques entrenados 0..<cut) se situa delante de la cola del commons (bloques cut..<L, embedding y normalizacion final, compartidos como instancias del mismo modulo, nunca copiados). En cada token, una capa de sincronizacion pondera cada Thread por su mejora reciente sobre el commons y mezcla las distribuciones, repartiendo la probabilidad exactamente entre las strands y citando la parte de cada Thread a su propio texto. El log de sesion es el artefacto verificable: cada peso, probabilidad y cuota se recomputa a partir de el.

Es relevante ahora porque propone un mecanismo de procedencia (provenance) auditable en generacion: cada token queda atribuido a una fuente concreta, con verificacion criptografica de la sesion. No es un modelo de chat ni esta ajustado a instrucciones; es infraestructura para construir sistemas con trazabilidad de fuentes sobre una SSM sin atencion ni KV cache.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba-3 MIMO (SSM puro, sin atencion), 24 capas de anchura 2.048; cada capa: mixer MIMO (64 cabezas de 64, estado 128, un grupo, rango 4, 32 angulos rotatorios) + MLP con compuerta, ambos con RMS-norm |
| Parametros totales | 1.497.082.880 (1.497,1 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (contexto de entrenamiento upstream) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en F32; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | other: apache-2.0-and-llama3.1 (Apache 2.0 combinada con Llama 3.1; tokenizer de Meta Llama 3.1) |
| Formato de pesos | safetensors (nombres `mamba_ssm` del checkpoint upstream, F32) |

Desglose de parametros: la cabeza de un Thread (bloques 0..<12) son 617,2 M; la cola del commons son 879,9 M (bloques 12..<24, embedding de 262,7 M y normalizacion final). Embeddings atados: el mismo tensor lee los tokens a la entrada y los puntua a la salida.

## Arquitectura y entrenamiento

La arquitectura es una Mamba-3 MIMO pura: 24 capas, cada una con un mixer de espacio de estados multi-entrada multi-salida (64 cabezas de dimension 64, estado de 128, un grupo, rango 4 y 32 angulos rotatorios) seguido de un MLP con compuerta, ambos normalizados con RMS-norm. No hay atencion ni cache KV, lo que implica un coste de inferencia con estado constante respecto a la longitud de secuencia. La activacion de A es de cola pesada ("heavy-tail"), declarada en `config.json` como `braid_a_activation`; upstream la cambio desde softplus el 2026-06-01, antes del release, y el release instala `mamba` desde main. Una lectura en held-out favorecio heavy-tail en los 24 documentos, pero por menos que su propio margen, por lo que la eleccion es una decision de Rao Studios registrada como tomada despues de esa lectura.

El entrenamiento es el de upstream: 100.000 millones de tokens de FineWeb-Edu a contexto 2.048. Rao Studios no entreno ni modifico los pesos del commons; solo los reempaqueto (BF16 a F32 exacto) y anadio la capa de sincronizacion y el sistema de procedencia de Braid. No se documenta RLHF, DPO ni ajuste por instrucciones. La innovacion tecnica destacable no esta en el modelo base sino en el sistema Braid: mezcla por token de distribuciones de varias strands con pesos derivados del "lift" reciente de cada Thread sobre el commons, reparto exacto de probabilidad entre strands y log de sesion verificable con `braid verify --keys`. Los hashes del pack (NAME, SEAM en cut 12 y VOCABULARY) permiten comprobar la integridad de la importacion.

## Capacidades

- Generacion de texto autoregresiva en ingles sobre una SSM sin atencion ni cache KV.
- Modelo base sin ajuste a instrucciones: no responde preguntas de chat por si mismo.
- Atribucion de procedencia por token: cada token se reparte entre las strands (commons y Threads) y la parte de cada Thread se cita a su corpus.
- Verificabilidad de sesion: pesos, probabilidades y cuotas se recomputan exactamente desde el log (`braid verify --keys`).
- Construccion de Threads sobre corpus propios (`dataset:`, `dir:`, `app:`) con bloques entrenados independientes por Thread.
- Memoria de estado constante: sin KV cache, el estado no crece con la longitud (regla W0: bytes del estado iguales a toda longitud).
- Multilingue: no; solo ingles.
- Tool calling / function calling: no disponible (no documentado).
- Agentes y razonamiento multi-paso: no disponible (fuera del alcance declarado).
- Vision, audio, modo thinking: no disponibles.

## Casos de uso

- Trazabilidad de fuentes en generacion: desplegar el commons con Threads sobre corpus documentales propios para que cada fragmento generado quede citado al documento de origen; adecuado porque el reparto de probabilidad por token y el log verificable permiten auditar la atribucion.
- Sistemas RAG con procedencia estricta: en lugar de recuperar y concatenar contexto, cada corpus se convierte en un Thread y la mezcla por token cita la fuente; util en dominios donde una cita incorrecta tiene coste (legal, normativa, documentacion tecnica).
- Deteccion de texto ajeno: la regla ER4' (el commons conserva al menos 0,70 de la cuota en texto extrano o generico; medido 0,771 sobre 6.748 posiciones) permite usar el modelo para distinguir si un texto proviene de los corpus registrados o no.
- Investigacion en arquitecturas SSM: el repositorio ofrece pesos Mamba-3 en F32 con nombres `mamba_ssm` y conformidad medida con un oraculo en PyTorch puro (max |Δ logits| de 4,005e-5), lo que sirve como referencia para validar implementaciones.
- Experimentos de mezcla de expertos por corpus: crear Threads especializados (por ejemplo, normativa y documentacion de producto) sobre un mismo commons cargado una sola vez, con coste de memoria compartido.
- Recuperacion de hechos sobre corpus acotados: la regla FR reporta 28 de 30 prompts de hechos respondidos exactamente (93,3%) con tres Threads en un braid de prueba; util para asistentes internos de documentacion con verificacion posterior.
- Inferencia con estado constante en secuencias largas dentro del contexto de 2.048: sin KV cache, el coste por token no crece con la longitud, lo que simplifica el despliegue en entornos con memoria limitada.

## Benchmarks y rendimiento

Los unicos datos publicados son las reglas de evaluacion de Braid (REAPER), leidas el 2026-11-10 con este commons en un braid de tres Threads (braid-n3: ambient, craft y veil, 40 documentos cada uno). Los datasets son sinteticos y las afirmaciones estan acotadas a esos bancos de prueba.

| Regla | Umbral | Resultado |
|---|---|---|
| Conformidad con oraculo en PyTorch puro | max \|Δ logits\| ≤ 1e-3 | 4,005e-5 sobre 3 prompts; paso a paso contra secuencia 1,669e-5 |
| SY6 (invariantes de la capa) | las suites pasan | pass |
| ER1 (el lift dice quien) | el titular tiene el mayor ω·lift en ≥ 70% de posiciones positivas | 99,6% de 7.150 |
| ER2 (la trayectoria dice que documento) | ≥ 70% de posiciones coherentes en la cadena del titular | 100,0% de 9.644 |
| ER4' (sin procedencia falsa) | el commons conserva ≥ 0,70 de la cuota en texto extrano y generico | 0,771 sobre 6.748 posiciones |
| ER5 (el log lo lleva) | ω y m se recomputan exactamente desde el log | 0 discrepancias sobre 348 textos |
| FR (recuerdo de hechos) | ≥ 80% de prompts de hechos respondidos exactamente | 28 de 30 (93,3%) |

Lecturas adicionales, fuera del umbral de publicacion:

| Regla | Umbral | Resultado |
|---|---|---|
| W0 (bytes del estado) | iguales a toda longitud | pass |
| W1 (commons + tres Threads en F32) | pico por debajo de 16 GiB | 13,26 GiB |
| T1–T3 (trace) | los umbrales del trace | pass |
| L1 (texto de nadie) | el commons lidera en ≥ 90% | 100% de 28 |
| L2 (conocimiento heredado) | Threads toman ≤ 0,10 de los tokens de prompts del commons; el propietario ≥ 0,90 de respuestas de hechos | fail: 0,196; 0,858 |
| L4 (sujetos desconocidos) | el commons lidera en ≥ 80%; credito de Threads ≤ 0,25 | fail: 70%; 0,899 |

Las dos sesiones detras de ER' se reproducen con `braid verify --keys` (473 generaciones, sin incidencias). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las constantes de sincronizacion son las de Braid por defecto (ventana 16, β 1,5, logit del commons ln 4, top-k 3, clamp de lift ln 10, pooling lineal), ajustadas sobre un commons de 130 M; no se ha ejecutado un reajuste para este commons.

## Requisitos de hardware

- Pico de memoria medido: 13,26 GiB para el commons y tres Threads en F32 (regla W1, umbral 16 GiB).
- El commons solo, en F32, ocupa aproximadamente 6,0 GB de pesos (tamano del repositorio).
- VRAM estimada para inferencia del commons en F32: alrededor de 6-8 GB mas estado y activaciones; para un braid con varios Threads, contar con el pico medido de 13,26 GiB.
- GPU recomendadas: A100, H100 o L40S para despliegues multi-Thread en F32; una RTX 4090 (24 GB) deberia acomodar el escenario medido de 13,26 GiB.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas para el escenario medido; en F32 puro del commons, en tarjetas de 8-12 GB con margen limitado.
- Opciones de despliegue: la via documentada es la libreria `braid` (importacion con `braid import ... --cut 12 --check`, creacion de Threads, ejecucion interactiva). Sin Braid, no existe clase de transformers para Mamba-3; hay que usar el checkpoint upstream con `mamba_ssm`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| braid-commons-mamba3-1.5b | 1.497 M | 2.048 | Mamba-3 MIMO (SSM) | apache-2.0-and-llama3.1 | Base de Braid con procedencia por token; sin ajuste a instrucciones |
| state-spaces/mamba3-mimo-1.5b | 1.497 M | 2.048 | Mamba-3 MIMO (SSM) | no disponible en la informacion proporcionada | Checkpoint upstream del que derivan los pesos; requiere `mamba_ssm` |
| state-spaces/mamba2-1.3b | no disponible en la informacion proporcionada | no disponible | Mamba-2 (SSM) | no disponible | Alternativa de la misma familia y orden de tamano; datos no verificados aqui |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat ni esta ajustado a instrucciones: no responde preguntas sobre un corpus por si solo; eso lo hacen los Threads.
- Solo ingles; sin capacidades multilingues documentadas.
- Contexto de entrenamiento limitado a 2.048 tokens.
- Riesgo de alucinacion no cuantificado con benchmarks estandar; el recuerdo de hechos medido (93,3%) corresponde a un braid sintetico concreto y no se generaliza.
- Reglas fallidas en la evaluacion: L2 (los Threads toman 0,196 de los tokens de prompts del commons frente al umbral de 0,10; el propietario responde 0,858 de los hechos frente a 0,90) y L4 (el commons lidera en 70% frente a 80%; credito de Threads 0,899 frente a 0,25). Esto indica filtracion de conocimiento entre strands y atribucion imperfecta en sujetos desconocidos.
- Las constantes de sincronizacion se ajustaron en un commons de 130 M y no se han reajustado para este modelo.
- La eleccion de activacion heavy-tail para A se tomo con evidencia por debajo del margen de la propia lectura; es una decision registrada, no un resultado concluyente.
- Licencia compuesta (Apache 2.0 y Llama 3.1): el tokenizer es de Meta Llama 3.1 y su licencia aplica; revisar los terminos de Llama 3.1 antes de uso comercial.
- Los pesos se publican en F32 (6,0 GB de repositorio); no hay cuantizaciones oficiales documentadas.
- El ecosistema es experimental: no hay clase de transformers para Mamba-3 y la libreria `braid` es la via soportada; el modelo tiene 0 descargas y 0 likes en el momento de la consulta.
- Las evaluaciones usan datasets sinteticos y estan acotadas a esos bancos; no deben extrapolarse a produccion sin validacion propia.

## Enlaces

- Hugging Face: https://huggingface.co/rao-studios/braid-commons-mamba3-1.5b
- Modelo base: https://huggingface.co/state-spaces/mamba3-mimo-1.5b
- Repositorio Braid: https://github.com/rao-studios/Braid
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Paper referenciado (arXiv 2603.15569): https://arxiv.org/abs/2603.15569
- Paper referenciado (arXiv 2510.13999): https://arxiv.org/abs/2510.13999
