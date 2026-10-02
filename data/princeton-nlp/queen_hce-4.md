# princeton-nlp/queen_hce-4

## Resumen
QUEEN (HCE-4) es un modelo de análisis de ajedrez desarrollado por princeton-nlp que toma una posición de tablero en notación FEN y genera texto explicativo sobre jugadas y variantes. No es un motor de ajedrez de uso general ni un ejecutable UCI: su salida es lenguaje natural más, cuando se puede parsear, una jugada en formato UCI.

Técnicamente combina tres piezas: un decoder SmolLM3-3B afinado (3.075.256.320 parámetros), una capa de cross-attention aprendida de estilo Flamingo (`xattn.pt`) y un encoder de tablero LC0 BT5-1024x15x32h-rpe-swa-3700000. Esta arquitectura "board-conditioned" condiciona la generación de texto a la representación del tablero, de modo que el modelo razona sobre la posición y no solo sobre el prompt textual.

Es relevante como ejemplo de integración multimodal (texto + estado estructurado) y de liberación de inferencia reproducible con runner propio, checksums SHA-256 y entorno fijado. Al ser una release de inferencia, excluye datos de entrenamiento y estado del optimizador, y no se afirma una licencia global para el conjunto.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Decoder transformer (SmolLM3-3B) + cross-attention Flamingo + encoder de tablero LC0 BT5 |
| Parametros totales | 3.075.256.320 (~3,08 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el runner permite generar hasta 8192 tokens con `--max-tokens 8192`; la ventana de entrada no se especifica) |
| Tipos de cuantizacion | BF16 (dtype de origen validado); no se documentan cuantizaciones alternativas |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible (no se afirma licencia global; componentes upstream: SmolLM3-3B bajo Apache-2.0 y encoder de Leela Chess Zero) |
| Formato de pesos | safetensors (decoder mergeado) mas `xattn.pt` para la cross-attention y pesos del encoder LC0 en `lc0/` |

## Arquitectura y entrenamiento
El modelo parte de HuggingFaceTB/SmolLM3-3B (upstream Apache-2.0) como decoder de lenguaje y le añade una ruta de condicionamiento de tablero: un encoder LC0 BT5-1024x15x32h-rpe-swa-3700000 (arquitectura de Leela Chess Zero, con atención relativa, sliding-window attention y 15 bloques residuales de 1024 canales) más una capa de cross-attention aprendida de tipo Flamingo (`xattn.pt`). Es decir, el tablero no se introduce como texto, sino como una representación vectorial que el decoder consume a través de la cross-attention. La distribución se separa en el decoder mergeado en la raíz, la cross-attention y el encoder convertido en `lc0/`.

No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF/DPO. La model card indica que el checkpoint fuente se uso en el pipeline de evaluacion del proyecto, que la release excluye datos de entrenamiento, estado del optimizador y datasets de evaluacion, y que se incluyen checksums SHA-256 (`release.json`) y validaciones (`VALIDATION.json`). La inferencia usa ejecucion eager, el runner V1 en proceso y prefix caching desactivado de forma deliberada, porque prompts de texto identicos pueden referirse a tableros distintos y no deben compartir cache condicionada por tablero.

## Capacidades
- Analisis de posiciones de ajedrez a partir de FEN y generacion de texto explicativo sobre jugadas y variantes.
- Sugerencia de jugada: emite `best_move_uci` cuando puede parsearse de la salida (en caso contrario, `null`).
- Salida estructurada en JSON con los campos `text`, `raw_text` (tokens POV del modelo) y `best_move_uci`.
- Condicionamiento por historial: acepta un JSON cronologico de FENs previos (`--history`) para aportar contexto de partida.
- Decodificacion configurable: `--temperature 0` para greedy; por defecto temperatura 0.6, top-k 20 y top-p 0.95.
- Generacion de explicaciones extensas: permite `--max-tokens 8192` para analisis largos.
- No es un motor UCI ni un oraculo verificado de ajedrez; no incluye tool calling, agentes ni vision general mas alla del estado del tablero.

## Casos de uso
- Analisis de posiciones en herramientas de ensenanza: dado un FEN, el modelo genera texto explicando ideas de la posicion y jugadas candidatas, util para anotaciones didacticas.
- Comentario automatico de partidas: procesando una lista cronologica de FENs via `--history` se pueden generar comentarios por jugada a lo largo de una partida.
- Asistente de estudio de aperturas y finales: se le pide razonamiento sobre posiciones concretas y se obtiene explicacion en lenguaje natural mas una jugada propuesta.
- Preprocesado para pipelines de ajedrez: la salida JSON con `best_move_uci` facilita integrar el modelo como componente de analisis dentro de un flujo mayor, validando despues la legalidad de la jugada.
- Investigacion en modelos condicionados por estado estructurado: sirve como referencia para estudiar cross-attention de tipo Flamingo aplicada a un dominio no textual.
- Generacion de material divulgativo: redactar descripciones de posiciones o ejercicios a partir de FENs, sujeto a revision humana.
- Prototipado de interfaces de analisis: usar el runner incluido para exponer explicaciones sobre una posicion en un front-end de estudio.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona una prueba de humo end-to-end en BF16 sobre una H100 de 80 GB con fraccion de memoria vLLM de 0.20, y aclara explicitamente que es una comprobacion de ejecucion y no un benchmark de precision ajedrecistica ni una especificacion minima validada de GPU.

## Requisitos de hardware
- VRAM estimada: los pesos combinados ocupan aproximadamente 8,4 GiB; hay que sumar KV cache, activaciones y el encoder cargado por separado.
- GPU recomendada: la model card propone una GPU de 24 GiB o superior como configuracion de partida "conservadora, no un minimo medido"; la prueba de humo se ejecuto en una NVIDIA H100 de 80 GB.
- GPU de consumo: probable en tarjetas con 24 GiB (por ejemplo, RTX 3090/4090) segun la recomendacion de 24 GiB, aunque no es un minimo validado; en GPU de menor VRAM no hay datos.
- CPU: la inferencia en CPU no esta implementada; el runner detecta CUDA y falla si no esta disponible. Requiere driver NVIDIA compatible (entorno fuente con CUDA 13.0).
- Despliegue: runner propio (`infer.py`) con vLLM 0.27.1, PyTorch 2.13.0, Transformers 5.15.0 y Python 3.12; `--gpu-memory-utilization` por defecto 0.55. Se desactiva prefix caching de forma intencionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| queen_hce-4 | 3.075.256.320 + encoder LC0 | No disponible | Tablero via cross-attention Flamingo + encoder LC0 | No disponible (componentes upstream con sus terminos) | HuggingFace, runner de inferencia incluido |
| SmolLM3-3B (base) | ~3B | No disponible en esta informacion | Solo texto | Apache-2.0 | HuggingFace |
| Motor de ajedrez clasico (Stockfish, Leela) | No disponible | No aplica | Estado del tablero nativo | Segun proyecto | Binarios independientes |

Comparativas de rendimiento con alternativas de analisis de ajedrez: no disponible.

## Limitaciones y advertencias
- Las explicaciones y variantes generadas pueden ser incorrectas; hay que validar las jugadas antes de usarlas. No es un oraculo verificado de ajedrez ni un ejecutable UCI.
- No cargar unicamente los pesos de la raiz con `AutoModelForCausalLM`: se omite la ruta de condicionamiento de tablero. Es obligatorio usar el runner incluido.
- El runner funciona con ejecucion eager y prefix caching desactivado; activar prefix caching es incorrecto porque prompts de texto identicos pueden corresponder a tableros distintos.
- Inferencia solo en CUDA; CPU no implementada.
- Salida en ingles; no hay soporte multilingue declarado.
- Riesgo de truncamiento: con `--max-tokens` bajo, la salida puede no contener jugada (`best_move_uci` a `null`); las explicaciones largas pueden requerir 8192 tokens.
- Licencia: no se afirma una licencia global para el conjunto; aplican los terminos de los componentes upstream (SmolLM3-3B Apache-2.0, encoder de Leela Chess Zero). Conviene revisarlos antes de uso comercial.
- La release excluye datos de entrenamiento, estado del optimizador y datasets de evaluacion; no hay benchmarks publicados de precision ajedrecistica.
- Sesgos concretos: no disponibles en la informacion proporcionada.

## Enlaces
- HuggingFace: https://huggingface.co/princeton-nlp/queen_hce-4
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Leela Chess Zero (origen del encoder de tablero): https://lczero.org/
- Paper o blog del proyecto: no disponible
- Repositorio de entrenamiento: no disponible (la release es solo de inferencia)
