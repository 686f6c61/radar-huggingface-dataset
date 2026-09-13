# avewright/puzzle-model

## Resumen

`avewright/puzzle-model` es un modelo de ajedrez especializado en táctica, desarrollado por el usuario avewright y publicado bajo licencia MIT. Se trata de un transformer recurrente de 98,97 millones de parámetros, con una arquitectura denominada "squares64", que atiende exclusivamente sobre el tablero de 64 casillas. No es un modelo de lenguaje: es un modelo de política (policy) que predice el movimiento del solucionador en problemas de táctica.

El modelo parte por *warm start* de los pesos del modelo generalista `avewright/chess-transformer-100m-squares64` y se afina sobre el conjunto oficial de puzles de Lichess (`Lichess/chess-puzzles`), concretamente sobre los plies del solucionador posteriores al movimiento de preparación del rival. El checkpoint publicado corresponde al paso 19.156 de este afinado, con pérdida de entrenamiento reciente de ~0,2239 y entropía cruzada de ~0,2317 en el holdout de puzles "hard".

Su relevancia radica en que ofrece, con licencia permisiva y un tamaño muy contenido (pesos en un único `latest.pt`), un especialista en resolución de tácticas que puede integrarse en herramientas de análisis, entrenadores de ajedrez o pipelines de evaluación de motores, siempre que se disponga del código de inferencia personalizado del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer recurrente (trunk con desenrollado), atencion solo sobre las 64 casillas del tablero |
| Parametros totales | 98,97 M (98.970.000 aprox.) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No expresada en tokens; opera sobre representacion de tablero de 64x64 con trunk de prefijo 4 + banco 7x3 desenrollados + sufijo 4 |
| Tipos de cuantizacion | No disponible (distribucion oficial en `latest.pt`, sin GGUF ni variantes cuantizadas publicadas) |
| Idiomas soportados | No aplica: no es un modelo de lenguaje natural; vocabulario compacto de 1968 simbolos de movimiento |
| Licencia | MIT |
| Formato de pesos | PyTorch (`latest.pt`), mas `model_config.json`, `train.log` y `pack.json`; tamano de repo 1,6 GB |

## Arquitectura y entrenamiento

La arquitectura se describe como un transformer recurrente con dimension oculta de 736 y 8 cabezas de atencion, dimension de encoder de 256 y un trunk compuesto por un prefijo de 4 bloques, un banco de 7x3 desenrollados y un sufijo de 4 bloques. Esto da una profundidad efectiva de 29 capas con solo 15 modulos de capa unicos, es decir, se reutilizan modulos mediante recurrencia/desenrollado. La atencion esta restringida a las 64x64 casillas y la cabeza de salida emplea un vocabulario compacto de 1968 simbolos de movimiento.

El entrenamiento parte del checkpoint publico de 99M del modelo generalista (solo pesos, optimizador reiniciado) y se afina sobre el dataset `Lichess/chess-puzzles` (revision `479ea9bc9f681385f5adb23fa27a96c2dc8ae599`). El split es a nivel de PuzzleId, 80/20 con semilla 273: 11.195.282 filas de entrenamiento y 2.824.449 de evaluacion. Las etiquetas son movimientos del solucionador en one-hot y `value_valid=0` (no se entrena cabecera de valor). El optimizador es Polar-NorMuon con auxiliar AdamW, con `muon_lr=0.002` y `adam_lr=3e-5`. El checkpoint publicado corresponde al paso 19.156 (13-09-2026 18:29 UTC), con perdida reciente de ~0,2239 y CE de holdout hard ~0,2317.

## Capacidades

- Prediccion de movimientos de tactica: dado un tablero en posicion de puzle, devuelve el movimiento solucion junto con `top_moves` y `wdl` (informacion de victoria/empate/derrota).
- Especializacion en puzles de Lichess: afinado sobre los plies del solucionador tras el movimiento de preparacion del rival.
- Vocabulario compacto de 1968 simbolos de movimiento, lo que acota la salida a movimientos legales representables.
- Inferencia sobre CPU o GPU mediante el codigo de ajedrez del autor (`chess_inference.py`, `chess_squares64.py`).
- No soporta tool calling ni function calling.
- No soporta agentes, multi-step reasoning ni razonamiento en lenguaje natural.
- No dispone de capacidades multilingues (no es un modelo de texto).
- No dispone de modo "thinking", vision ni audio.

## Casos de uso

- Entrenador de tactica de ajedrez: el modelo propone el movimiento solucion y una lista de candidatos (`top_moves`), util para sugerir jugadas en ejercicios interactivos sin revelar la respuesta de inmediato.
- Analisis automatico de puzles: en pipelines que procesan lotes de puzles de Lichess, el modelo puede etiquetar o verificar soluciones mediante su prediccion de politica.
- Filtrado de calidad de datasets de tactica: al comparar el movimiento predicho con el del solucionador oficial, sirve para detectar posiciones ambiguas o mal etiquetadas.
- Asistente de estudio posicional en posiciones tacticas: integrado en una interfaz, ofrece candidatos con su `wdl` para que el usuario compare opciones.
- Herramienta docente para principiantes: dado que la salida esta restringida a un vocabulario de movimientos, se puede mostrar el movimiento esperado en ejercicios guiados.
- Evaluacion comparativa de modelos de ajedrez: sirve como referencia especializada en tactica frente al modelo generalista del que deriva.
- Investigacion en modelos recurrentes aplicados a ajedrez: la arquitectura (15 modulos unicos, profundidad efectiva 29) es un caso de estudio para experimentar con reutilizacion de capas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni datos de Elo o de tasa de acierto en puzles). Los unicos datos numericos aportados son de entrenamiento y evaluacion interna:

| Metrica | Valor |
|---|---|
| Paso del checkpoint | 19.156 |
| Perdida de entrenamiento reciente | ~0,2239 |
| CE holdout hard (puzles) | ~0,2317 |
| Filas de entrenamiento | 11.195.282 |
| Filas de evaluacion | 2.824.449 |

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): ~0,4 GB en fp32 (~99M parametros), ~0,2 GB en fp16/bf16, ~0,1 GB en int8. Estas cifras son calculos derivados del numero de parametros, no datos publicados por el autor.
- El repo pesa 1,6 GB, lo que sugiere que el checkpoint `latest.pt` incluye estado adicional (por ejemplo, estados del optimizador) ademas de los pesos de inferencia.
- Cabe con holgura en cualquier GPU de consumo (por ejemplo, RTX 3060, RTX 4090) e incluso en CPU, segun el ejemplo de inferencia que el autor ejecuta con `device="cpu"`.
- No se documentan opciones de despliegue estandar como vLLM, llama.cpp, Ollama o TGI: la inferencia requiere el codigo personalizado `avewright/transform` (`chess_inference.py`, `chess_squares64.py`) y el vocabulario compacto 1968.
- Latencia y throughput no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `avewright/puzzle-model` | 98,97 M | Transformer recurrente squares64 | Tactica (puzles Lichess) | MIT | HuggingFace (`latest.pt`) |
| `avewright/chess-transformer-100m-squares64` | 99 M | Transformer squares64 | Generalista de ajedrez | No disponible en la informacion | HuggingFace (modelo referenciado como origen del warm start) |

No se dispone de informacion sobre otros modelos comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- El autor advierte explicitamente que este repositorio no es el modelo generalista y que sus pesos no deben sobrescribir los de `chess-transformer-100m-squares64`.
- Es un especialista en tactica: su entrenamiento se limita a puzles de Lichess, por lo que su comportamiento fuera de posiciones tacticas no esta documentado.
- `value_valid=0` indica que no hay cabecera de valor entrenada; la informacion `wdl` devuelta no debe interpretarse como una evaluacion calibrada de la posicion.
- Riesgo de sobreajuste a la distribucion de puzles de Lichess y a la representacion concreta del vocabulario compacto de 1968 movimientos.
- No se documentan sesgos especificos, idiomas soportados ni datos de robustez.
- Requiere codigo de inferencia personalizado (`avewright/transform`), lo que anade dependencia y coste de integracion.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del dataset `Lichess/chess-puzzles` empleado para el afinado si se redistribuye el modelo.
- El checkpoint esta fechado en 2026-09-13 y no se documentan actualizaciones posteriores; 0 descargas y 0 likes en el momento del registro.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/avewright/puzzle-model
- Modelo base generalista: https://huggingface.co/avewright/chess-transformer-100m-squares64
- Dataset de entrenamiento: https://huggingface.co/datasets/Lichess/chess-puzzles
- Repositorio de codigo de inferencia: https://huggingface.co/avewright/transform
- Paper, blog o demo: no disponible en la informacion proporcionada.
