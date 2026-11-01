# alpinist-HF/chessformator-puzzle-transformer

## Resumen

Chessformator Puzzle Transformer es un modelo experimental de tipo transformer, desarrollado por el usuario alpinist-HF, cuyo objetivo es proponer posiciones de ajedrez que puedan convertirse en problemas tácticos en seis temas concretos: ataque descubierto, horquilla, pieza colgada, ataque al flanco de rey, clavada y rayos X (skewer). No es un modelo de lenguaje generalista ni un motor de ajedrez: genera tableros de 64 casillas codificados como tokens y delega la validacion de legalidad y de solucion al motor Stockfish integrado en la aplicacion Chessformator.

El modelo tiene 37.843.469 parametros, una anchura de 512, 12 capas y 8 cabezas de atencion, con pesos en fp16 almacenados en `model.safetensors`. Se distribuye como checkpoint de inferencia del paso 20.000 de un entrenamiento con retroalimentacion de resultados, exportado desde un checkpoint congelado y acompanado de metadatos de procedencia (SHA-256 del checkpoint y del contrato de entrenamiento). El repositorio ocupa 0,1 GB y no ofrece inferencia alojada.

Su relevancia es acotada pero clara para quien investigue generacion de contenido de ajedrez: propone un enfoque "board-first" con muestreo iterativo sobre tablero enmascarado, entrenado con el corpus CC0 de puzles de Lichess y con guia de profesor del modelo `naapeli/chess-puzzle-generator` V2. La licencia MIT sobre los pesos facilita su reutilizacion, aunque el autor advierte explicitamente de que la evaluacion comparativa frente a su modelo de difusion sigue en curso y no se reclama paridad de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, 12 capas, anchura 512, 8 cabezas de atencion |
| Parametros totales | 37.843.469 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (opera sobre 64 tokens de casilla, orden `a8`-`h1`) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp16) |
| Idiomas soportados | en (metadatos y documentacion; la salida es notacion de tablero) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, fp16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de 12 capas y 512 dimensiones con 8 cabezas de atencion, que trata el tablero como una secuencia de 64 tokens de casilla en orden `a8` a `h1`. La generacion emplea un muestreador iterativo sobre tablero enmascarado: el modelo propone posiciones completas, no jugadas, y carece de cabeza de movimiento (no hay move head). Los pesos corresponden al checkpoint de 20.000 actualizaciones de una ejecucion de entrenamiento con retroalimentacion de resultados, exportado desde un checkpoint congelado identificado en `manifest.json`.

El entrenamiento utiliza el corpus de puzles CC0 de Lichess y guia de profesor procedente de `naapeli/chess-puzzle-generator` V2, fijado en la revision `f9a8ae63a21defb9c7f207ae20f256d2ce93d504`. El manifiesto registra los hashes SHA-256 del checkpoint y del contrato de entrenamiento, lo que permite verificar la procedencia. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO; la unica senal de alineacion es el bucle de retroalimentacion de resultados mencionado.

## Capacidades

- Generacion de posiciones de ajedrez en seis temas tacticos: ataque descubierto, horquilla, pieza colgada, ataque al flanco de rey, clavada y skewer.
- Codificacion y decodificacion de tableros mediante el codec de tokens de casilla de Chessformator.
- Muestreo iterativo con tablero enmascarado para producir posiciones completas.
- Integracion con verificacion externa: la aplicacion consulta Stockfish para validar legalidad, existencia de jugada ganadora, unicidad, estabilidad y coherencia tematica.
- Ejecucion local y offline tras la descarga inicial verificada por tamano y SHA-256.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso general, vision ni audio.
- No genera texto libre ni explicaciones: la salida es una posicion, sin cabeza de movimiento.

## Casos de uso

- Generacion de borradores de puzles para una aplicacion de ajedrez: el modelo propone posiciones candidatas por tema y la app las filtra con Stockfish antes de publicarlas, reduciendo el trabajo manual de composicion.
- Creacion de material didactico por temas tacticos: permite generar lotes de posiciones etiquetadas por motivo (clavada, horquilla, etc.) para ejercicios dirigidos a niveles concretos.
- Aumento de datasets de entrenamiento: las posiciones aceptadas tras la verificacion pueden incorporarse a corpus propios de puzles, siempre respetando las condiciones de las fuentes originales.
- Pruebas de pipelines de validacion: sirve como generador de casos dificiles para testear verificadores de legalidad, unicidad y estabilidad de soluciones.
- Investigacion sobre generacion board-first: util como linea base reproducible (checkpoint congelado con hashes) para comparar con modelos de difusion u otros enfoques de muestreo.
- Uso offline en escritorio macOS: al integrarse en Chessformator, permite disponer de generacion local sin dependencia de servicios alojados, util en entornos sin red o con requisitos de privacidad.
- Analisis de sesgos tematicos: estudiando la distribucion de temas y tipos de posicion generados se pueden detectar desequilibrios del corpus de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la comparacion contra el modelo de difusion sigue en curso y que no se reclama calidad ni paridad.

## Requisitos de hardware

- VRAM estimada: con 37,8 millones de parametros en fp16, los pesos ocupan aproximadamente 76 MB; el consumo real depende del muestreador y del motor Stockfish asociado, no cuantificado en la informacion disponible.
- GPU recomendadas: no disponible. El modelo se ejecuta mediante un muestreador MLX propio, orientado a Apple Silicon en la aplicacion Chessformator para macOS.
- GPU de consumo: por tamano, cabe holgadamente en cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) si se porta el muestreador; no se documenta soporte oficial fuera de MLX.
- Opciones de despliegue: muestreador MLX integrado en Chessformator; no es un modelo drop-in de Hugging Face Transformers. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chessformator Puzzle Transformer | 37,8 M | 64 tokens de casilla | Transformer board-first con muestreo enmascarado | MIT | Pesos en HF, inferencia solo via app |
| `naapeli/chess-puzzle-generator` V2 (profesor) | no disponible | no disponible | Generador de puzles usado como guia de entrenamiento | no disponible | Referenciado en HF |
| Modelo de difusion de Chessformator | no disponible | no disponible | Generacion por difusion, en evaluacion comparativa | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- La salida bruta no es un puzle verificado: requiere pasar por las comprobaciones de legalidad, jugada ganadora, unicidad, estabilidad y tema en Stockfish.
- Evaluacion incompleta: la comparacion con el modelo de difusion esta en curso y no hay reclamacion de calidad.
- No es un modelo de Transformers estandar: usa el codec de tokens de casilla y el muestreador MLX propios de Chessformator, lo que limita su portabilidad.
- Solo documentado en ingles y sin capacidades de texto general, vision, audio ni agentes.
- Riesgo de sesgo derivado del corpus CC0 de Lichess y de la guia del modelo profesor, con posible sobrerrepresentacion de ciertos temas o niveles.
- Riesgo de alucinacion estructural: puede producir posiciones ilegales o sin solucion unica, que el filtro externo debe descartar.
- La licencia MIT cubre los pesos y metadatos de este repositorio; los materiales de origen conservan sus propios terminos y deben atribuirse.
- No se ofrece endpoint alojado ni garantias de soporte; el uso en produccion exige integrar el verificador y gestionar la descarga verificada por SHA-256.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alpinist-HF/chessformator-puzzle-transformer
- Modelo profesor: https://huggingface.co/naapeli/chess-puzzle-generator (revision `f9a8ae63a21defb9c7f207ae20f256d2ce93d504`)
- Fuente de datos: puzles CC0 de Lichess (https://database.lichess.org/#puzzles)
- Aplicacion Chessformator: no disponible en la informacion proporcionada
- Paper, blog o demo adicionales: no disponibles
