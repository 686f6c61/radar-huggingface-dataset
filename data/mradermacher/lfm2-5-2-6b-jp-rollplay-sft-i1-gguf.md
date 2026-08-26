# mradermacher/LFM2.5-2.6B-JP-RollPlay-SFT-i1-GGUF

## Resumen

Este repositorio contiene el archivo de importancia (imatrix) para la cuantización GGUF del modelo `CloudGoat/LFM2.5-2.6B-JP-RollPlay-SFT`, un fine-tuning especializado en roleplay en japonés basado en el modelo LFM2.5-2.6B de Liquid AI. El autor, mradermacher, es un cuantizador conocido que publica pesos GGUF optimizados con imatrix para mejorar la calidad de las cuantizaciones de baja precisión. Este repo en concreto solo incluye el archivo `imatrix.gguf` (0.1 GB) que sirve para generar cuantizaciones propias; los quants estáticos están disponibles en el repositorio hermano `mradermacher/LFM2.5-2.6B-JP-RollPlay-SFT-GGUF`.

El modelo base LFM2.5-2.6B es un modelo de 2.6 mil millones de parámetros desarrollado por Liquid AI, diseñado para ejecutarse en dispositivos con recursos limitados (menos de 2.5 GB en cuantización) y capaz de planificar, llamar herramientas y ejecutar tareas multi-paso a alta velocidad (220 tok/s en Apple M5 Max). El fine-tuning de CloudGoat lo adapta específicamente para conversaciones de roleplay en japonés, utilizando datasets como `CausalLM/Kingfall-Roleplay` y `OmniAICreator/Japanese-Roleplay-Dialogues`. Este repositorio es relevante para desarrolladores que necesitan ejecutar un modelo de roleplay japonés en hardware modesto o en entornos de producción con GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base LFM2.5-2.6B de Liquid AI usa una arquitectura hibrida SSM + atencion, segun informacion publica de la empresa, pero no confirmada en la documentacion de este repo) |
| Parametros totales | 2.6 mil millones (segun la denominacion del modelo base, no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Este repo solo contiene el archivo imatrix. Los quants estaticos (Q2_K, IQ3_M, Q4_K_S, etc.) estan en el repo hermano `LFM2.5-2.6B-JP-RollPlay-SFT-GGUF` |
| Idiomas soportados | ja (japones) |
| Licencia | no disponible (el modelo base LFM2.5-2.6B usa la licencia lfm1.0, segun la busqueda web, pero no se confirma para este fine-tuning) |
| Formato de pesos | GGUF (archivo imatrix) |

## Arquitectura y entrenamiento

No se proporcionan detalles tecnicos sobre la arquitectura del modelo en la informacion disponible. El modelo base LFM2.5-2.6B es desarrollado por Liquid AI, que en sus publicaciones describe una arquitectura hibrida que combina capas de espacio de estados (SSM) con mecanismos de atencion, optimizada para inferencia eficiente en dispositivos. Sin embargo, no hay confirmacion oficial en la documentacion de este repositorio.

El fine-tuning de CloudGoat se realizo sobre el modelo base LFM2.5-2.6B utilizando dos datasets de roleplay en japones: `CausalLM/Kingfall-Roleplay` y `OmniAICreator/Japanese-Roleplay-Dialogues`. No se especifica el numero de tokens de entrenamiento, el metodo de ajuste (SFT, RLHF, DPO) ni otras tecnicas. El autor de la cuantizacion, mradermacher, aplica cuantizaciones con imatrix (importance matrix) para mejorar la calidad de los quants de baja precision, un metodo que pondera la importancia de cada peso durante la cuantizacion.

## Capacidades

- Generacion de texto conversacional en japones, especializado en dialogos de roleplay.
- Mantenimiento de personajes y contextos narrativos en conversaciones multi-turno.
- Adaptacion a estilos de escritura variados (fantasia, ciencia ficcion, vida cotidiana, etc.) gracias a los datasets de roleplay.
- El modelo base LFM2.5-2.6B, segun Liquid AI, es capaz de planificar, llamar herramientas y ejecutar tareas multi-paso, pero no se confirma si estas capacidades se conservan tras el fine-tuning especifico para roleplay.
- Soporte limitado a japones; no se mencionan capacidades multilingues en este fine-tuning.

## Casos de uso

- Creacion de chatbots de roleplay en japones: el modelo puede interpretar personajes ficticios y mantener conversaciones coherentes con el usuario, ideal para aplicaciones de entretenimiento o juegos de texto.
- Generacion de historias interactivas: se puede integrar en motores de narrativa procedural donde el modelo responde a las acciones del jugador, manteniendo un hilo argumental consistente.
- Asistentes de escritura creativa en japones: ayuda a escritores a desarrollar dialogos entre personajes, explorar tramas alternativas o generar borradores de escenas.
- Simulacion de personajes para videojuegos: el modelo puede alimentar NPCs (personajes no jugadores) con respuestas contextuales y personalidad definida, mejorando la inmersión.
- Practica de conversacion en japones: los estudiantes pueden interactuar con personajes ficticios para mejorar su fluidez, aunque el modelo no esta disenado como tutor pedagogico.
- Prototipado rapido de aplicaciones de chat: gracias a su tamano reducido (2.6B) y su disponibilidad en GGUF, se puede desplegar en entornos de desarrollo locales o en la nube con costes minimos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones para este fine-tuning especifico. El modelo base LFM2.5-2.6B, segun el blog de Liquid AI, alcanza 220 tok/s en Apple M5 Max y ~30 tok/s en un telefono, pero estas cifras corresponden al modelo base cuantizado, no a este fine-tuning.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 2.6B, una cuantizacion Q4_K_M ocupa aproximadamente 1.5-2 GB, y Q8 alrededor de 2.5-3 GB. El blog de Liquid AI indica que el modelo base cabe en menos de 2.5 GB en cuantizacion.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar cuantizaciones de baja precision (Q4). Tarjetas como RTX 3060, RTX 4060, o incluso iGPUs modernas son suficientes. Para mayor velocidad, se recomienda una GPU con soporte para inferencia FP16, como RTX 4090 o A100.
- En consumer GPU: si, cabe en GPUs de gama media y baja con cuantizacion GGUF.
- Opciones de despliegue: al ser GGUF, se puede usar con llama.cpp, Ollama, LM Studio, o servidores como vLLM (con adaptadores GGUF) o TGI. El archivo imatrix no es directamente ejecutable; se necesita generar un quant a partir de el o descargar los quants del repo hermano.
- Latencia y throughput: no hay datos especificos para este fine-tuning. El modelo base alcanza 220 tok/s en Apple M5 Max, pero en GPU consumer se esperan cifras inferiores (tipicamente 30-80 tok/s en RTX 4090 con Q4).

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar este modelo con alternativas de la misma categoria (roleplay en japones). No se han encontrado modelos comparables en la informacion proporcionada. Se podria comparar con otros modelos de roleplay en japones como `Rinna-3.6B` o `ELYZA-japanese-Llama-2-7b`, pero no hay datos de rendimiento ni licencias confirmadas para establecer una comparativa rigurosa.

## Limitaciones y advertencias

- El modelo esta especializado en roleplay en japones; su rendimiento en otros idiomas o tareas generales puede ser limitado.
- No se ha confirmado si las capacidades de tool calling y planificacion del modelo base se conservan tras el fine-tuning; es probable que se hayan degradado en favor de la generacion conversacional.
- Riesgo de alucinaciones y sesgos derivados de los datasets de roleplay, que pueden contener contenido estereotipado o inapropiado.
- La licencia del modelo no esta especificada en este repositorio. El modelo base usa la licencia lfm1.0, que puede imponer restricciones de uso comercial; se recomienda verificar la licencia antes de desplegar en produccion.
- Este repositorio solo contiene el archivo imatrix, no un modelo ejecutable. Para usar el modelo, es necesario generar un quant o descargar los quants del repositorio hermano.
- No hay informacion sobre la longitud de contexto soportada, lo que puede limitar su uso en conversaciones muy largas.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/mradermacher/LFM2.5-2.6B-JP-RollPlay-SFT-i1-GGUF
- Repositorio con quants estaticos: https://huggingface.co/mradermacher/LFM2.5-2.6B-JP-RollPlay-SFT-GGUF
- Modelo base (fine-tuning): https://huggingface.co/CloudGoat/LFM2.5-2.6B-JP-RollPlay-SFT
- Blog de Liquid AI sobre LFM2.5-2.6B: https://www.liquid.ai/blog/lfm2-5-2-6b
- Pagina de LLM Releases con informacion del modelo: https://www.llm-releases.com/models/lfm2-5-2-6b
- Repositorio del modelo base sin fine-tuning: https://huggingface.co/mradermacher/LFM2.5-2.6B-i1-GGUF (y su version estatica)
