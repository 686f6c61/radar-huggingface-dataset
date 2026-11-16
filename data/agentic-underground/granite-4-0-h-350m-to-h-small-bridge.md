# agentic-underground/granite-4.0-h-350m-to-h-small-bridge

## Resumen

El repositorio `agentic-underground/granite-4.0-h-350m-to-h-small-bridge` contiene un "puente de estado" (state bridge) entrenado para conectar dos modelos de la familia IBM Granite 4.0: el pequeño `granite-4.0-h-350m` (350 millones de parametros) y el grande `granite-4.0-h-small` (un MoE de 32B con 72 expertos, aproximadamente 95 veces mayor). La idea es que el modelo pequeño lea el prompt y el puente traduzca el estado interno que construye en la memoria que el modelo grande necesita para responder, de modo que el grande solo tenga que procesar un token del prompt en lugar de toda la secuencia.

El puente aplica el metodo LatentPort de Simon Villani (arXiv:2609.25053) a un modelo cuya memoria es mayoritariamente estado recurrente Mamba-2, lo que constituye una reproduccion tecnica poco habitual: la mayoria de puentes publicados trabajan sobre pares key/value de atencion. El repositorio forma parte del proyecto PrattleNot del autor `agentic-underground` y esta pensado especificamente para usarse con `granite-4.0-h-small` cuantizado a Q4K.

La relevancia practica es la reduccion del tiempo hasta el primer token (TTFT) en inferencia: segun las mediciones del autor, el modelo grande puenteado responde entre 1,6 y 1,75 veces antes que leyendo el prompt completo, aunque queda lejos del techo teorico (6,4-7,6 veces) porque debe reconstruir su estado Mamba-2 capa a capa. El modelo se distribuye bajo licencia Apache-2.0 con pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puente de estado (ridge maps lineales) entre un transformer denso (350M) y un MoE hibrido Mamba-2/attention (H Small) |
| Parametros totales | No disponible para el puente (archivo de 478 MB); modelos base de 350M y ~32B |
| Parametros activos | No disponible para el puente; H Small enruta cada token a 10 de sus 72 expertos |
| Longitud de contexto | No disponible (depende de los modelos base) |
| Tipos de cuantizacion | El puente requiere H Small cuantizado a Q4K en sus capas lineales (`PRATTLE_TARGET_DTYPE=q4k`) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`granite-4.0-h-350m-to-h-small.safetensors`, 478 MB, sin `__metadata__`) |

## Arquitectura y entrenamiento

El puente no es un modelo generativo sino un conjunto de regresiones ridge en forma cerrada (λ = 10⁻³) que mapean el estado residual del modelo donante de 350M (ancho oculto 768, 32 capas) al estado que necesita el modelo receptor H Small (ancho oculto 4096, 40 capas: 36 Mamba-2 y 4 de atencion en las capas 5, 15, 25 y 35). Para cada capa Mamba-2, un mapa ridge predice las filas de entrada normalizadas de esa capa a partir de dos puntos de lectura del flujo residual del 350M; despues H Small ejecuta su propia proyeccion de entrada, convolucion y scan sobre esas filas y construye su estado en sus propios terminos. Para las 4 capas de atencion, se traducen claves y valores. Cada capa de H Small lee la capa del 350M a la misma profundidad relativa.

El ajuste se realizo sobre 45.243 filas extraidas de las propias respuestas de H Small de hasta 192 tokens, usando 451 preguntas plantilla generadas de forma determinista por `crates/core/src/bridge_corpus.rs`. Los R² obtenidos son de 0,59-0,91 para las entradas Mamba-2 (0,91 en la capa 0, 0,59-0,73 desde la capa 6), 0,77-0,93 para claves y 0,59-0,87 para valores. El autor publica la version sin la correccion aprendida del paper (rank 4, 3 epocas) porque, aunque esta eleva el NCR de 0,767 a 0,826, responde 6 de 7 preguntas retenidas frente a las 7 de la version publicada.

## Capacidades

- Traduccion de estado latente entre dos modelos de la familia Granite 4.0: el 350M actua como lector del prompt y H Small como generador.
- Reduccion del tiempo hasta el primer token en inferencia de H Small sobre prompts largos (1,61-1,75x segun las mediciones del autor).
- Soporte de memoria Mamba-2: reconstruye el estado recurrente de 36 capas a partir de las entradas traducidas, no copia el estado.
- Traduccion de claves y valores en las 4 capas de atencion de H Small.
- Requiere integracion con el runtime PrattleNot; no es un modelo autonomo cargable con `transformers` de forma directa.
- No se documentan capacidades propias de generacion, tool calling, agentes ni multilinguesimo: hereda las del modelo receptor H Small cuando se usa con el puente.

## Casos de uso

- Aceleracion de TTFT en produccion con H Small: desplegar el 350M en una GPU y H Small cuantizado a Q4K en otra, con el puente en medio, para reducir la latencia inicial en prompts de 256 a 1024 tokens (1,6-1,75x mas rapido que la lectura nativa del prompt).
- Investigacion sobre puentes de estado en arquitecturas hibridas: el repositorio es una reproduccion reproducible de LatentPort sobre Mamba-2, util para estudiar la transferibilidad de estado recurrente entre modelos de distinto tamano.
- Experimentos de destilacion de contexto: usar el 350M como "lector" barato de prompts largos y el H Small como generador, evaluando la fidelidad de la traduccion con la metrica NCR del paper.
- Benchmarking de interoperabilidad entre modelos de la familia Granite: comparar el rendimiento del puente con puentes key/value clasicos (por ejemplo, el Qwen3-0.6B → 32B del mismo autor) para medir el coste de reconstruir estado Mamba-2.
- Prototipado de pipelines de inferencia en dos etapas con GPUs consumer: el autor demuestra la configuracion en dos RTX 3090, lo que permite reproducir el montaje en hardware de gama alta consumer.
- Docencia y formacion tecnica: el repositorio incluye instrucciones de reproduccion (`documents/REPRODUCTION.md`) y un comando `just speedup` para repetir las cifras de latencia, util como material de estudio de tecnicas de inferencia eficiente.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| NCR (native-closure ratio) de los mapas ridge publicados | 0,767 |
| NCR desde un donante incorrecto | 0,161 |
| NCR con la correccion aprendida del paper (no publicada) | 0,826 |
| Respuestas correctas de 7 (puente publicado) | 7 |
| Respuestas correctas de 7 (H Small solo) | 7 |
| Respuestas correctas de 7 (350M solo) | 5 |
| Respuestas correctas de 7 (puente con correccion) | 6 |
| Perdida por token de H Small leyendo todo | 0,204 |
| Perdida por token de H Small puenteado | 0,668 |
| Perdida por token de H Small sin leer nada | 2,195 |
| Perdida por token de H Small con memoria de pregunta incorrecta | 1,874 |
| TTFT, prompt ~256 tokens, ejecucion 1 | 1,69x mas rapido |
| TTFT, prompt ~256 tokens, ejecucion 2 | 1,75x (1,74-1,75) mas rapido |
| TTFT, prompt ~1024 tokens, ejecucion 1 | 1,61x mas rapido |
| TTFT, prompt ~1024 tokens, ejecucion 2 | 1,62x (1,61-1,62) mas rapido |
| Techo teorico, ~256 tokens | 6,45x-7,30x |
| Techo teorico, ~1024 tokens | 7,39x-7,58x |

Las mediciones se realizaron en dos RTX 3090, con el 350M en bf16 y el puente en una GPU y H Small en Q4K en la otra, sobre prompts sinteticos (8 prompts x 3 repeticiones en orden rotado) y un solo token de puente. El autor atribuye la brecha frente al techo a los ~260 ms que H Small emplea en reconstruir su estado Mamba-2 sobre 36 capas, de un total de ~357 ms a ~256 tokens.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el autor usa dos RTX 3090 (24 GB cada una), una para el 350M en bf16 con el puente y otra para H Small en Q4K.
- GPU recomendadas: RTX 3090 (configuracion validada); se desconoce el comportamiento en A100, H100 o RTX 4090.
- Cabe en GPU consumer: si, al menos en la configuracion de dos RTX 3090 documentada por el autor.
- Opciones de despliegue: runtime PrattleNot (comando `just speedup` con variables `PRATTLE_SOURCE_DTYPE`, `PRATTLE_TARGET_DTYPE` y `PRATTLE_DEVICES`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: TTFT puenteado de ~357 ms a ~256 tokens (frente al modelo nativo, 1,69-1,75x mas rapido); no se publican cifras de throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| granite-4.0-h-350m-to-h-small-bridge (este) | Puente de 478 MB entre 350M y ~32B | No disponible | Ridge maps sobre estado Mamba-2 | Apache-2.0 | Hugging Face, 0 descargas |
| qwen3-0.6b-to-32b-bridge (mismo autor) | Puente key/value entre 0,6B y 32B | No disponible | Traduccion de claves y valores | No disponible en la informacion | Hugging Face |
| granite-4.0-h-small (modelo base receptor) | ~32B (MoE, 10 de 72 expertos activos) | No disponible | MoE hibrido Mamba-2/attention | Apache-2.0 | Hugging Face |
| granite-4.0-h-350m (modelo base donante) | 350M | No disponible | Transformer denso | Apache-2.0 | Hugging Face |

El puente Qwen3-0.6B → 32B del mismo autor se cita como referencia de un puente key/value clasico sin reconstruccion de estado recurrente, que segun el autor obtiene mayores ganancias de latencia. No se dispone de datos de benchmarks comparativos entre ambos puentes en la informacion proporcionada.

## Limitaciones y advertencias

- Requiere H Small cuantizado a Q4K en sus capas lineales; usarlo con otra cuantizacion invalida el ajuste del puente.
- Depende del runtime PrattleNot y de un comando especifico; no es un modelo cargable de forma estandar con `transformers`.
- El NCR de 0,767 indica que el puente cierra aproximadamente el 77 % de la brecha entre no leer nada y leer todo; la perdida por token puenteada (0,668) sigue siendo mas de tres veces la nativa (0,204).
- El autor reporta 7 de 7 respuestas correctas en preguntas retenidas, pero la muestra es muy pequena (7 preguntas) y no se publican intervalos de confianza para esa tasa.
- La ganancia de latencia (1,6-1,75x) queda muy por debajo del techo teorico (6,4-7,6x) por el coste de reconstruir el estado Mamba-2.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones idiomaticas propias del puente; estos dependen del modelo receptor H Small.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-15: no hay evidencia de uso en produccion ni validacion independiente.
- La licencia Apache-2.0 permite uso comercial, pero el puente esta ligado a los terminos de los modelos base de IBM Granite (tambien Apache-2.0).
- No se publica el modelo con la correccion aprendida del paper, por lo que las cifras de NCR de 0,826 no son reproducibles con este archivo.

## Enlaces

- Hugging Face: https://huggingface.co/agentic-underground/granite-4.0-h-350m-to-h-small-bridge
- Paper LatentPort (arXiv:2609.25053): https://huggingface.co/papers/2609.25053
- Sitio de LatentPort: https://latentport.com/
- Repositorio PrattleNot: https://github.com/agentic-underground/PrattleNot
- Documentacion del puente: https://github.com/agentic-underground/PrattleNot/blob/main/documents/BRIDGE.md
- Documentacion de reproduccion: https://github.com/agentic-underground/PrattleNot/blob/main/documents/REPRODUCTION.md
- Corpus de calibracion: https://github.com/agentic-underground/PrattleNot/blob/main/crates/core/src/bridge_corpus.rs
- Modelo base donante: https://huggingface.co/ibm-granite/granite-4.0-h-350m
- Modelo base receptor: https://huggingface.co/ibm-granite/granite-4.0-h-small
- Puente Qwen3-0.6B → 32B del mismo autor: https://huggingface.co/agentic-underground/qwen3-0.6b-to-32b-bridge
