# joebos/Second-1.0-2B

## Resumen

Second-1.0-2B es un modelo de lenguaje especializado en la explicación de jugadas de ajedrez, desarrollado por Joe Bos bajo la organización Second Chess. Se construye como un ajuste fino del modelo base Qwen/Qwen3.5-2B y su función no es calcular variantes, sino traducir los hechos deterministas que produce un motor de ajedrez (Stockfish) a prosa instructiva comprensible para jugadores humanos. El modelo resuelve un problema concreto: los motores muestran barras de evaluación y líneas de símbolos (`+2.4`, `14. Nxd4 exd4 15. Qh5+`) que un aficionado no sabe interpretar.

La propuesta es deliberadamente acotada. Stockfish aporta la verdad de referencia y el modelo se limita a explicarla, con dos registros de audiencia: `beginner` (Elo por debajo de ~1200, lenguaje llano y sin jerga) y `club` (Elo ~1200-2000, con temas tácticos y estratégicos concretos). El modelo tiene 1.881.825.088 parámetros reales según los pesos en safetensors y un repositorio de 4,1 GB.

Es relevante ahora por su enfoque de entrenamiento: un pipeline de post-entrenamiento en dos etapas (destilación con SFT y refuerzo con GRPO/DAPO) sobre una GPU NVIDIA L4, con verificación determinista en lugar de un juez LLM dentro del bucle de RL. La familia Second 1.0 incluye además variantes de 0,8B, 4B y 9B, y existe una cuantización GGUF para uso en navegador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5; tag `qwen3_5_text`) |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF disponible en `second-chess/Second-1.0-2B-GGUF`; otros tipos no disponibles |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos principales); GGUF (cuantizacion para navegador) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer decoder-only, y se somete a un pipeline de post-entrenamiento en dos etapas ejecutado en una NVIDIA L4. La primera etapa (T3, "Engine-Grounded Distillation Warm-up SFT-A1") aplica LoRA con `r=32`, `alpha=64` sobre todas las capas lineales, entrenando con 4.457 elementos verificados (`data/processed/sft_v2_train.jsonl`). El corpus combina explicaciones sintéticas generadas por un profesor Apache 2.0 (Qwen2.5-7B-Instruct) filtradas mediante 9 comprobaciones de reglas, junto con comentario humano curado de referencia.

La segunda etapa (T4, "GRPO RL Warm-up RL-B2") entrena durante 150 pasos con DAPO (Direct Advantage Policy Optimization, `beta=0.02`) sobre 5.000 prompts filtrados por dificultad (`data/processed/rl_prompts_v2.jsonl`). La innovación destacable es la función de recompensa v2: penalizaciones graduadas por comprobación de reglas, reescalado multiplicativo de longitud y modelado anti-voz-de-diario. No se emplea ningún juez LLM dentro del bucle de RL, lo que reduce el coste y la variabilidad del entrenamiento. El prompt de entrada sigue un esquema determinista estricto con FEN, veredicto, probabilidades de victoria, mejor jugada, mejor línea y una lista de hechos tácticos.

## Capacidades

- Generación de explicaciones en prosa sobre jugadas de ajedrez a partir de hechos aportados por el motor (motivos tácticos, piezas colgadas, refutaciones, balance material y seguridad del rey).
- Dos registros de audiencia configurables mediante el campo `level`: `beginner` y `club`.
- Control de longitud y detalle mediante el campo `detail` (por ejemplo `short`).
- Cumplimiento estricto de formato: 100,00 % de tasa de aprobación de formato en el conjunto de evaluación congelado.
- Razonamiento guiado por hechos (grounded reasoning): no calcula variantes, interpreta las que recibe.
- Soporte del chat template estándar de Qwen.
- No dispone de tool calling, function calling, capacidades de agente multi-paso, visión ni audio según la información disponible.

## Casos de uso

- Revisión post-partida en plataformas de ajedrez: el modelo recibe la FEN, el veredicto del motor y los hechos tácticos de una jugada concreta y devuelve una explicación en lenguaje natural. Es adecuado porque su entrenamiento está específicamente alineado con este contrato de entrada.
- Coaching automatizado para principiantes: con `level: beginner` genera explicaciones sin jerga (evita términos como "prophylaxis" o "zwischenzug"), útil en apps de aprendizaje para jugadores por debajo de ~1200 Elo.
- Anotación de partidas para clubes: con `level: club` produce análisis con temas tácticos concretos y motivos de refutación, orientado a jugadores de ~1200-2000 Elo.
- Generación de contenido editorial de ajedrez: a partir de las salidas de Stockfish se pueden producir comentarios legibles para boletines, blogs o fichas de estudio, reduciendo el trabajo manual de redacción.
- Integración en extensiones de navegador para análisis de partidas terminadas: la cuantización GGUF publicada permite ejecución local en el navegador, y la extensión oficial falla de forma segura (se desactiva en partidas vivas, blitz, puzles y torneos en directo).
- Formación táctica: explicar por qué una jugada es un error y cuál era la mejor alternativa sirve como material de entrenamiento para reconocimiento de patrones tácticos.
- Evaluación comparativa de modelos pequeños en dominios restringidos: el conjunto de evaluación congelado de 300 elementos con 9 verificadores deterministas es reutilizable como banco de pruebas para otros ajustes finos.

## Benchmarks y rendimiento

Evaluación sobre el conjunto de test congelado de 300 elementos (`eval/testset-1.0.jsonl`) con 9 verificadores deterministas y el juez Gemini Flash con debiasing:

| Metrica | Base Qwen 2B | Second v1 (`grpo-1.0-2b`) | Second-1.0-2B (release) |
|---|---|---|---|
| Tasa de fallo duro determinista | 100,0 % | 7,7 % | 4,67 % (14 / 300) |
| Tasa de aprobación de formato | 82,3 % | 100,0 % | 100,00 % |
| Cumplimiento de longitud objetivo | 21,0 % | 18,7 % | 99,67 % (62,0 palabras de media) |
| Voz de diario en primera persona | 12,0 % | 51,3 % | 0,00 % |
| Puntuación suave de puntos clave | 0,2100 | 0,3860 | 0,9790 |
| Puntuación suave de mejor jugada | 0,0800 | 0,1560 | 1,0000 |
| Sobre-rechazo de terminología agresiva | 15,0 % | 0,0 % | 0,00 % (0 / 20) |
| Tasa de victoria por pares vs Base Qwen 2B | — | — | 100,0 % (86,2 % LC-WR) |
| Tasa de victoria por pares vs Second v1 | — | — | 100,0 % (97,5 % LC-WR) |
| Tasa de victoria por pares vs Gemini Flash | — | — | 91,0 % (74,5 % LC-WR) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (FP16/BF16): aproximadamente 3,8 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, alrededor de 5-6 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 2 GB para pesos.
- VRAM estimada en cuantización de 4 bits (GGUF Q4): aproximadamente 1,2-1,5 GB para pesos.
- Cabe en GPU de consumo: sí, en tarjetas con 6-8 GB o más (RTX 3060, RTX 4060, RTX 4070 y superiores) en FP16; en cuantización 4 bits cabe en GPUs de 4 GB.
- GPU recomendadas para producción: NVIDIA L4 (la usada en entrenamiento), A10, A100 o H100 para despliegues con concurrencia; RTX 4090 para inferencia local de alta velocidad.
- Opciones de despliegue: llama.cpp y Ollama mediante el GGUF publicado; vLLM o TGI para servir los safetensors con el chat template de Qwen.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Second-1.0-2B | 1.881.825.088 | no disponible | Explicacion de ajedrez (grounded) | Apache 2.0 | Hugging Face (safetensors + GGUF) |
| Qwen/Qwen3.5-2B (base) | ~2B | no disponible | Proposito general | no disponible en la informacion | Hugging Face |
| Qwen2.5-7B-Instruct (profesor) | ~7B | no disponible | Proposito general, usado como teacher en SFT | Apache 2.0 | Hugging Face |
| Gemini Flash (juez) | no disponible | no disponible | Proposito general, usado como juez en evaluacion | propietaria | API de Google |

La comparación directa con alternativas especializadas en explicación de ajedrez no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Dependencia del motor: Stockfish aporta la verdad de referencia. Si la profundidad de análisis del motor es insuficiente, los hechos pueden omitir variantes profundas de varias jugadas.
- Idioma: solo inglés. No soporta castellano ni otros idiomas.
- Cálculo: el modelo no computa variantes más allá de los hechos y la mejor línea proporcionados por el motor; no es un motor de ajedrez.
- Nivel: orientado a principiantes (por debajo de ~1200 Elo) y club (~1200-2000); no está diseñado para análisis de novedades de apertura a nivel de maestro.
- Riesgo de alucinación: aunque el entrenamiento refuerza la fidelidad a los hechos, el modelo es un generador de texto y puede producir afirmaciones no respaldadas si el prompt de hechos es ambiguo o incompleto.
- Integridad y juego limpio: el modelo está pensado exclusivamente para revisión post-partida y entrenamiento táctico. La extensión oficial se desactiva durante partidas vivas, blitz, puzles, puzzle storms y torneos en directo; no debe usarse para asistencia en partidas en vivo.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar el archivo LICENSE del repositorio de GitHub para detalles.
- Madurez: el modelo se publicó el 2026-11-08 con 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria independiente.
- Sesgos: no se documentan sesgos específicos en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joebos/Second-1.0-2B
- Cuantización GGUF para navegador: https://huggingface.co/second-chess/Second-1.0-2B-GGUF
- Repositorio GitHub: https://github.com/kleinebossie/second
- Licencia: https://github.com/kleinebossie/second/blob/main/LICENSE
- Patrocinio del proyecto: https://github.com/sponsors/kleinebossie
- Perfil del autor en Hugging Face: https://huggingface.co/joebos/models
- Dataset del autor: https://huggingface.co/joebos/datasets
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
