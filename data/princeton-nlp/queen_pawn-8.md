# princeton-nlp/queen_pawn-8

## Resumen

QUEEN (PAWN-8) es un modelo especializado en analisis de ajedrez y seleccion de jugadas desarrollado por el grupo princeton-nlp. Combina un decodificador de lenguaje SmolLM3-3B afinado con un codificador de tablero LC0 BT5 (procedente de Leela Chess Zero), dando lugar a una arquitectura de tipo Flamingo en la que la representacion del tablero se inyecta como condicionamiento en el modelo de lenguaje. El resultado es un modelo de 3.075 millones de parametros capaz de razonar sobre posiciones de ajedrez expresadas en notacion FEN y proponer jugadas en formato UCI.

La propuesta diferencial es la integracion completa: todos los pesos y el codigo de inferencia se incluyen en el repositorio, de modo que no es necesario instalar LC0 ni Stockfish por separado. El modelo no es un motor UCI ejecutable, sino un generador condicionado por tablero que produce texto y una jugada; su interes reside en explorar el uso de modelos de lenguaje como motores de ajedrez con justificacion textual, no solo con evaluacion numerica.

El modelo esta pensado para experimentacion e investigacion: requiere Linux, GPU NVIDIA con soporte BF16 y un driver compatible con CUDA 13, y solo se ha validado en una H100 de 80 GB. La licencia combinada no esta declarada de forma explicita, aunque el modelo base SmolLM3-3B es Apache-2.0 y el codificador LC0 tiene sus propios terminos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flamingo (decodificador SmolLM3-3B con codificador de tablero LC0 BT5 inyectado por condicionamiento) |
| Parametros totales | 3.075.256.320 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2304 tokens (configuracion de evaluacion por defecto) |
| Tipos de cuantizacion | no disponible (solo se documenta BF16) |
| Idiomas soportados | en |
| Licencia | no disponible (modelo base Apache-2.0; terminos del codificador LC0 aplicables; sin licencia global declarada) |
| Formato de pesos | safetensors (con codigo de inferencia propio) |

## Arquitectura y entrenamiento

La arquitectura es un hibrido de tipo Flamingo: un decodificador transformer SmolLM3-3B (preentrenado por HuggingFaceTB) recibe condicionamiento visual de un codificador de tablero Leela Chess Zero, concretamente el modelo BT5-1024x15x32h-rpe-swa-3700000. El codificador transforma la posicion FEN en una representacion latente que se inyecta en el decodificador, de forma que la generacion de texto y de jugada queda condicionada por el estado del tablero. El repositorio incluye codigo personalizado (tag `custom-code`), por lo que no basta con cargar el modelo mediante `AutoModelForCausalLM`: hay que usar el runner `infer.py` incluido, que incorpora el condicionamiento.

No se ha publicado informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. La model card solo documenta los detalles de inferencia y evaluacion: temperatura 0,6, top-k 20, top-p 0,95, 2048 tokens de salida, penalizacion por repeticion 1,0, BF16 y ejecucion eager V1 con prefix caching desactivado. La semilla base es 20260823 y las semillas de cada peticion se derivan de un hash de la semilla base, el identificador de partida y el ply del FEN. El entorno fijado usa PyTorch 2.13.0, Transformers 5.15.0 y vLLM 0.27.1.

## Capacidades

- Analisis de posiciones de ajedrez a partir de un FEN y seleccion de jugada en notacion UCI.
- Generacion de explicaciones y lineas criticas en texto (con verificacion de legalidad de la linea).
- Condicionamiento por tablero mediante codificador LC0, sin dependencia de Stockfish ni LC0 en tiempo de ejecucion.
- Uso de historial de partida (`--history`) para reconstruir el contexto de una peticion de evaluacion.
- Salida estructurada en JSON con `text`, `raw_text`, `best_move_uci`, `move_source` y la linea critica verificada.
- Fallback determinista: si la respuesta no es parseable, se elige una jugada legal aleatoria con semilla y se etiqueta en `move_source`.
- Capacidad multilingue limitada al ingles.
- No soporta tool calling ni function calling, ni se documentan capacidades de agente o razonamiento multi-paso mas alla de la linea critica.
- Inferencia solo en GPU; no hay soporte de CPU.

## Casos de uso

- Analisis de posiciones en herramientas de estudio: dado un FEN, el modelo devuelve una jugada y una explicacion textual que puede mostrarse al usuario junto a la linea critica, util para plataformas de entrenamiento ajedrecistico que quieran comentarios en lenguaje natural.
- Investigacion en modelos de lenguaje aplicados a ajedrez: permite comparar el rendimiento de un decodificador condicionado por tablero frente a motores clasicos en tareas de seleccion de jugada y generacion de variantes.
- Generacion de comentarios de partida: combinando el historial de FENs con el runner, se pueden producir descripciones de jugadas y lineas para articulos o retransmisiones, asumiendo que las explicaciones pueden contener errores.
- Evaluacion de robustez de modelos condicionados: el etiquetado explicito de `move_source` y el fallback con semilla facilitan reproducir y auditar el comportamiento ante respuestas no parseables.
- Prototipado de asistentes de ajedrez en entornos de investigacion con GPU: el repositorio incluye pesos y codigo, lo que reduce la integracion a descargar y ejecutar `infer.py`.
- Benchmarking de arquitecturas Flamingo en dominios estructurados: el modelo sirve como caso de estudio de inyeccion de un codificador especializado (LC0) en un LLM pequeno de 3B parametros.
- Reproduccion de evaluaciones Elo: la configuracion por defecto (temperatura, top-k, top-p, semillas) esta fijada para replicar la evaluacion del autor, lo que facilita experimentos comparativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el modelo se ejecuta en BF16 y la descarga total ronda los 8,4 GiB, por lo que se necesita espacio y memoria suficientes para el decodificador y el codificador cargados por separado.
- GPU recomendadas: H100 80 GB (unico hardware validado por el autor). GPUs mas pequenas no estan validadas.
- GPU de consumo: no se documenta compatibilidad con RTX 4090 u otras GPUs consumer; al no estar validadas, no se puede confirmar que quepan.
- Requisitos de sistema: Linux, driver compatible con CUDA 13, soporte BF16 y `uv` para gestionar el entorno.
- Opciones de despliegue: runner propio `infer.py` con vLLM 0.27.1, Transformers 5.15.0 y PyTorch 2.13.0; no se documenta soporte para llama.cpp, Ollama ni TGI.
- Parametros de inferencia: `--gpu-memory-utilization` por defecto 0,72, batch capacity 32 y context length 2304.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QUEEN (PAWN-8) | 3.075 M | 2304 | Ajedrez (FEN a jugada y texto) | no disponible (base Apache-2.0) | Pesos y codigo en HF |
| SmolLM3-3B | 3B | no disponible en esta ficha | Lenguaje general | Apache-2.0 | HF |
| Leela Chess Zero BT5 | no disponible | no aplica | Ajedrez (motor) | terminos LC0 | lczero.org |

La comparacion con motores de ajedrez clasicos (Stockfish, LC0) no es directa: QUEEN no es un ejecutable UCI y sus explicaciones pueden ser incorrectas. Frente a SmolLM3-3B, la diferencia es el condicionamiento por tablero y el codigo de inferencia especifico.

## Limitaciones y advertencias

- El propio autor advierte que las explicaciones y variantes pueden ser erroneas; no debe tratarse como fuente de verdad ajedrecistica.
- No es un ejecutable UCI y no sustituye a un motor de ajedrez en pipelines de analisis convencionales.
- Solo se ha validado en una H100 80 GB; el rendimiento en GPUs menores es desconocido.
- No soporta inferencia en CPU.
- Solo idioma ingles.
- La licencia combinada no esta declarada; el modelo base es Apache-2.0 pero el codificador LC0 tiene terminos propios, por lo que el uso comercial requiere revision legal.
- Riesgo de alucinacion en las explicaciones y lineas generadas, aunque la linea critica se verifica en legalidad.
- El texto muestreado puede variar segun hardware, versiones de librerias y batching, lo que afecta a la reproducibilidad exacta.
- Un FEN aislado no permite recuperar el historial de la partida; para reproducir una evaluacion hay que aportar `--history` y el indice de partida.
- El fallback a jugada legal aleatoria con semilla puede enmascarar fallos de parseo si no se revisa `move_source`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/princeton-nlp/queen_pawn-8
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Leela Chess Zero: https://lczero.org/
- Instalacion de uv: https://docs.astral.sh/uv/getting-started/installation/
