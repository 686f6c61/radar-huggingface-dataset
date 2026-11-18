# ftaglobal/FTA-Mark-1

## Resumen

FTA Mark-1 es un adaptador LoRA (PEFT) desarrollado por FTA Global que se monta sobre el modelo base Sarvam-30B para dotarlo de capacidad de juego de ajedrez. No es un modelo entrenado desde cero: se trata de un conjunto reducido de pesos que enseña al modelo base, originalmente orientado a lenguaje, a seleccionar movimientos legales y razonables en partidas de ajedrez. El autor reporta que Sarvam-30B sin entrenar apenas generaba jugadas legales (16,4%) y que, tras el ajuste, el sistema alcanza una tasa de jugadas legales del 100% por construccion, al elegir entre los movimientos que lista la libreria `python-chess`.

El modelo se presenta como un especialista vertical, no como un LLM de proposito general. Su interes actual radica en que ejemplifica una tendencia practica: adaptar un modelo base grande y multilingue con un adaptador ligero para una tarea acotada y medible. El autor publica 36 partidas en formato PGN contra modelos comerciales (GPT-6 Astra, Gemini 4 Argon y Gemini 3.8 Flash) y una estimacion de rating de aproximadamente 1.824 en su propia escala, no homologada por FIDE ni por Kaggle.

La ficha tecnica disponible es limitada: el repositorio ocupa 0,0 GB (solo contiene el adaptador, no los pesos del modelo base), las descargas son 4 y no hay pipeline declarado. La licencia es compuesta y poco habitual: apache-2.0 para los pesos, CC BY 4.0 para las partidas y GPL 3.0 para el codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Sarvam-30B; arquitectura del adaptador no detallada |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Sarvam-30B tiene 30B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor indica bfloat16 para el modelo base en la evaluacion inicial) |
| Idiomas soportados | en |
| Licencia | apache-2.0-weights-cc-by-4.0-games-gpl-3.0-code (compuesta: pesos Apache 2.0, partidas CC BY 4.0, codigo GPL 3.0) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado sobre `sarvamai/sarvam-30b`, un transformer de 30.000 millones de parametros. No se detalla en la informacion disponible la configuracion del adaptador (rango, alpha, modulos objetivo), el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. El autor denomina a su metodo "Micro-Judgement Tuning (MJT)", pero no se aporta una descripcion tecnica del mismo en la model card.

La innovacion operativa destacable no esta en el entrenamiento sino en el pipeline de inferencia: Mark-1 no genera texto libre que luego se parsea, sino que elige entre los movimientos legales que enumera la libreria `python-chess`. Esto garantiza por construccion que toda jugada emitida es legal, lo que elimina una de las principales fuentes de fallo de los LLM en ajedrez. El autor reconoce explicitamente que la tasa de legalidad sin ese mecanismo de seleccion no se midio para esta version, de modo que el 100% reportado es una propiedad del sistema completo, no del adaptador aislado. El sistema incorpora ademas un "think-ahead" configurable (nivel Quick y nivel Match) cuyo funcionamiento interno no se documenta.

## Capacidades

- Juego de ajedrez: seleccion de movimientos legales y razonablemente buenos dentro de una partida, con soporte de niveles de "pensamiento" (Quick y Match).
- Integracion como motor UCI: el script `mark1_uci.py` permite conectarlo a Arena, Cute Chess, BanksiaGUI y aplicaciones similares.
- Interfaz web local: `play_board.py --share` levanta un tablero en el navegador con deshacer, nueva partida, giro de tablero y guardado en PGN.
- Partidas contra APIs externas: `play_vs_api.py` permite enfrentarlo a OpenAI o Gemini con claves propias del usuario.
- Generacion de partidas en PGN y JSON para registro y analisis posterior.
- Capacidades de lenguaje heredadas del modelo base Sarvam-30B, si bien no se documentan ni se evaluan en esta ficha.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito mas alla del "think-ahead" ajedrecistico.

## Casos de uso

- Entrenamiento y analisis para clubes y academias de ajedrez: un profesor puede abrir el tablero en una maquina y proyectarlo para que los alumnos propongan jugadas contra un rival de nivel intermedio (rating propio estimado ~1.824), con historial en PGN para revisar la partida despues.
- Evaluacion comparativa de LLM en ajedrez: el pipeline `play_vs_api.py` permite reproducir el protocolo del autor (12 partidas por rival, 6 con cada color, aperturas fijas, arbitro comun) contra otros modelos para obtener metricas propias en lugar de fiarse de las cifras publicadas.
- Integracion en interfaces de ajedrez existentes: gracias al motor UCI `mark1_uci.py`, se puede usar como oponente o sparring dentro de Arena o Cute Chess sin desarrollar interfaz propia.
- Investigacion sobre adaptadores LoRA para tareas estructuradas: sirve como caso de estudio de como un adaptador pequeno sobre un modelo de lenguaje de 30B transforma una tarea de generacion abierta en una tarea de seleccion restringida por restricciones externas (movimientos legales).
- Docencia sobre validacion y sesgo de evaluacion: las partidas publicadas y el protocolo detallado permiten discutir en clase como se disenan benchmarks, que significa "legal por construccion" y por que un rating en escala propia no es comparable a FIDE.
- Generacion de material de ajedrez para publicacion: las partidas en PGN bajo CC BY 4.0 pueden reutilizarse en articulos, libros o videos con atribucion, lo que facilita crear contenido divulgativo sin depender de partidas de motores clasicos.
- Pruebas de integracion de sistemas LLM en produccion: util para equipos que quieran medir latencia, coste y fiabilidad de un pipeline que combina un modelo de 30B con validacion externa, antes de aplicar el mismo patron a dominios con reglas estrictas (por ejemplo, generacion de configuraciones o consultas SQL).

## Benchmarks y rendimiento

Resultados publicados por el autor (partidas del 7 de noviembre de 2026, arbitradas por FTA, no verificadas por Kaggle):

| Rival | Puntuacion | V · E · D | Segundos por jugada (Mark-1 vs rival) |
|---|---|---|---|
| OpenAI GPT-6 Astra | 10 : 2 | 9 · 2 · 1 | 62 vs 69 |
| Google Gemini 4 Argon | 9 : 3 | 9 · 0 · 3 | 68 vs 13 |
| Google Gemini 3.8 Flash | 9 : 3 | 8 · 2 · 2 | 62 vs 14 |
| Total | 28 de 36 puntos (78%) | 26 · 4 · 6 | — |

Escala propia del autor contra Stockfish 16 a niveles fijos (24 partidas):

| Nivel de Stockfish | Puntos de Mark-1 | Partidas |
|---|---|---|
| 1400 | 6 | 6 |
| 1700 | 3 | 6 |
| 2000 | 2.5 | 6 |
| 2300 | 0 | 6 |
| Rating estimado | ~1.824 (IC 95%: 1.635–2.012) | 24 |

Evaluacion antes/despues sobre 2.000 posiciones y 500 problemas:

| Metrica | Sarvam-30B sin entrenar | FTA Mark-1 (nivel Quick) |
|---|---|---|
| Jugadas legales | 16,4% | 100% (por construccion) |
| Mejor jugada encontrada (coincide con Stockfish) | 0,9% (17 de 2.000) | 43,4% (867 de 2.000) |
| Problemas resueltos (de 500) | 0 | 279 |

Advertencia del propio autor: la comparacion antes/despues no es homogenea, porque Sarvam-30B respondia con un prompt que no listaba los movimientos legales, mientras que Mark-1 elige de una lista de movimientos legales. El azar encuentra la mejor jugada aproximadamente el 5% de las veces segun el autor. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM: el autor indica que se necesita una GPU NVIDIA con 80 GB o mas; el modelo base Sarvam-30B por si solo ocupa unos 64 GB en bfloat16.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200. Se admite GPU en la nube alquilada.
- GPU de consumo: no cabe en tarjetas consumer (RTX 4090 con 24 GB, RTX 3090 con 24 GB) en la configuracion descrita por el autor. No se documentan recetas de cuantizacion para reducir el requisito.
- Disco: aproximadamente 80 GB libres.
- Despliegue: el repositorio incluye scripts propios (`play_board.py`, `play_vs_api.py`, `mark1_uci.py`) e instrucciones de instalacion via `huggingface_hub` y `requirements.txt`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: el autor publica tiempos por jugada de 62–68 segundos para Mark-1 en nivel Match frente a rivales con 13–69 segundos. No se aportan cifras de throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FTA Mark-1 | LoRA sobre 30B | no disponible | Ajedrez especializado | Compuesta (Apache 2.0 / CC BY 4.0 / GPL 3.0) | Hugging Face |
| Sarvam-30B (base) | 30B | no disponible | Lenguaje general | no disponible | Hugging Face |
| GPT-6 Astra | no disponible | no disponible | LLM general con juego de ajedrez | Propietaria | API de OpenAI |
| Gemini 4 Argon / Gemini 3.8 Flash | no disponible | no disponible | LLM general con juego de ajedrez | Propietaria | API de Google |

No se dispone de datos publicos comparables de parametros, contexto ni rendimiento de los rivales empleados en las partidas. Las cifras de enfrentamiento provienen exclusivamente de partidas organizadas por FTA y no han sido verificadas de forma independiente.

## Limitaciones y advertencias

- Especializacion estrecha: el adaptador esta entrenado unicamente para ajedrez; su utilidad fuera de ese dominio no se documenta y no deberia asumirse.
- Rating no homologado: la cifra de ~1.824 corresponde a una escala propia del autor, no a FIDE ni a Kaggle, y no es comparable con ratings estandar.
- Evaluacion no independiente: las 36 partidas y la comparacion antes/despues fueron ejecutadas por FTA; el propio autor reconoce que Kaggle no las verifico.
- Comparacion antes/despues no homogenea: la tasa de legalidad del 100% se debe al filtro externo de `python-chess`, no al adaptador por si solo; la legalidad del adaptador sin ese filtro no se midio.
- Requisito de hardware elevado: 80 GB de VRAM y 80 GB de disco, lo que excluye GPU de consumo y encarece el despliegue.
- Idiomas: solo se declara ingles (`en`), aunque el modelo base Sarvam-30B es multilingue; no se evalua el comportamiento en castellano.
- Licencia compuesta y poco convencional: pesos Apache 2.0, partidas CC BY 4.0 y codigo GPL 3.0. Conviene revisar el archivo `LICENSE` antes de un uso comercial, especialmente si se redistribuye el codigo bajo GPL 3.0.
- Riesgo de alucinacion: mitigado en el dominio del ajedrez por la validacion externa de movimientos, pero no eliminado en las respuestas de lenguaje del modelo base.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad ni robustez del adaptador ni del modelo base.
- Madurez: 4 descargas y 0 likes en el momento de la consulta, repositorio de 0,0 GB (solo adaptador) y ausencia de pipeline declarado; es un artefacto reciente y con poca validacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ftaglobal/FTA-Mark-1
- Pagina del modelo en FTA Global: https://www.ftaglobal.com/mark-1
- Lista de reproduccion con las 36 partidas en YouTube: https://www.youtube.com/playlist?list=PLBMPCoAWb24Q
- Modelo base Sarvam-30B: https://huggingface.co/sarvamai/sarvam-30b
