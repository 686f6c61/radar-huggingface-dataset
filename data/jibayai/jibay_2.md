# JibayAi/Jibay_2

## Resumen

Jibay 2 es un modelo de lenguaje ligero y de codigo abierto desarrollado por el equipo de JibayAi, una organizacion irani centrada en el avance de la IA independiente. El modelo se publico inicialmente en abril/mayo de 2025 y se libero completamente como open source en junio de 2026. Esta construido sobre la base de Qwen 3, concretamente sobre el modelo Qwen3-1.7B, y esta disenado para ser sencillo, entrenable y personalizable, sin la complejidad de una arquitectura de mezcla de expertos (MoE).

El modelo resuelve el problema de ofrecer una alternativa eficiente y controlable para desarrolladores e investigadores que necesitan un modelo de tamano reducido (2.000 millones de parametros) con capacidades multilingues, soporte de function calling y una ventana de contexto de 32.768 tokens. Su relevancia actual radica en que permite fine-tuning sobre datos de dominio especifico sin requerir una infraestructura de computo excesiva, lo que lo hace adecuado para aplicaciones en dispositivos, edge AI y flujos de trabajo agenciales ligeros.

Jibay 2 soporta cuatro idiomas principales (persa, ingles, chino y arabe) y se distribuye bajo licencia Apache 2.0, lo que facilita su adopcion tanto en entornos academicos como comerciales. El conocimiento del modelo esta actualizado hasta principios de 2025.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-1.7B) |
| Parametros totales | 2.031.739.904 (aproximadamente 2.000 millones) |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 32.768 tokens (entrada + salida combinados) |
| Tipos de cuantizacion | GGUF (incluye Q4_K_M), FP16, safetensors |
| Idiomas soportados | Persa (fa), ingles (en), chino (zh), arabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

Jibay 2 es un modelo de lenguaje denso basado en la arquitectura Transformer de Qwen 3. No utiliza mezcla de expertos (MoE), lo que significa que todos los parametros estan activos durante la inferencia. Esta decision de diseno facilita la comprension, depuracion y fine-tuning del modelo, ya que no requiere gestionar rutas de expertos ni balanceo de carga. El modelo se entrena sobre la base de Qwen3-1.7B, aprovechando las capacidades de razonamiento y generacion de texto de dicha familia.

Los datos de entrenamiento no se detallan en la informacion disponible, pero el conocimiento del modelo llega hasta principios de 2025 (final de 1404 en el calendario persa). El equipo de JibayAi no especifica si se utilizaron tecnicas de RLHF o DPO durante el entrenamiento. El modelo es completamente reentrenable y adaptable a dominios especificos como texto medico, legal o cientifico, asi como a lenguajes de programacion de nicho.

Una caracteristica destacable es que el modelo esta disenado para ser simple y entrenable, con un enfasis en la facilidad de fine-tuning. El equipo recomienda el uso de versiones GGUF cuantizadas para produccion, especialmente en hardware de consumo.

## Capacidades

- Generacion de texto y chat conversacional multilingue en persa, ingles, chino y arabe.
- Razonamiento matematico y cientifico basico, con resultados de 70% en GSM8K y 43% en ARC Challenge.
- Generacion de codigo Python, con un 68% de pass@1 en HumanEval.
- Comprension lectora y razonamiento de sentido comun, con 79% en BoolQ y 61,1% en HellaSwag.
- Soporte de function calling y tool use, con una puntuacion global de 55% en el Berkeley Function Calling Leaderboard (BFCL).
- Capacidad para conversacion en persa, evaluada con el benchmark privado PPRC-BENCH con un 41% de precision.
- Fine-tuning sencillo sobre datos de dominio especifico gracias a su arquitectura densa y tamano reducido.
- Adecuado para flujos de trabajo agenciales ligeros y prototipado rapido.

## Casos de uso

- Atencion al cliente automatizada en persa y arabe: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de 32.768 tokens, lo que permite mantener historiales de chat extensos sin perder informacion relevante.
- Asistente de codigo en entornos de desarrollo: con un 68% en HumanEval, puede generar fragmentos de codigo Python y asistir en tareas de programacion, integrarse en editores o pipelines de CI/CD para revision de codigo basica.
- Fine-tuning sobre texto medico o legal: su tamano reducido y arquitectura densa permiten adaptarlo a dominios especificos sin necesidad de clusters de GPU, ideal para organizaciones con recursos limitados.
- Aplicaciones de edge AI y dispositivos: las versiones GGUF cuantizadas (como Q4_K_M) caben en dispositivos con poca memoria, lo que permite desplegar asistentes de voz o chatbots en hardware de bajo consumo.
- Investigacion y educacion: al ser open source y ligero, es adecuado para experimentos de fine-tuning, estudios de alineacion o ensenanza de tecnicas de NLP en entornos academicos.
- Traduccion y procesamiento de texto multilingue: al soportar persa, ingles, chino y arabe, puede utilizarse como base para sistemas de traduccion automatica o normalizacion de texto en estos idiomas.
- Prototipado rapido de agentes conversacionales: su soporte de function calling permite construir agentes simples que interactuen con APIs y herramientas externas, validando conceptos antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Los siguientes resultados han sido declarados por el equipo de JibayAi en la model card. No se ha verificado de forma independiente la metodologia de evaluacion.

| Benchmark | Resultado | Dominio |
|---|---|---|
| MMLU | 56,9% | Conocimiento general y resolucion de problemas |
| GSM8K | 70,0% | Razonamiento matematico (nivel escolar) |
| ARC Challenge | 43,0% | Razonamiento cientifico (dificil) |
| HumanEval | 68,0% (pass@1) | Generacion de codigo Python |
| BoolQ | 79,0% | Comprension lectora (si/no) |
| HellaSwag | 61,1% | Razonamiento de sentido comun |
| BFCL Overall | 55,0% | Function calling y uso de herramientas |
| BFCL Category Average | 51,2% | Media por categorias en BFCL |
| PPRC-BENCH | 41,0% | Conversacion en persa (benchmark privado) |

## Requisitos de hardware

- VRAM estimada: el modelo tiene 2.031 millones de parametros. En FP16, los pesos ocupan aproximadamente 4,1 GB, por lo que se necesita al menos 6 GB de VRAM para inferencia con cierta holgura. Con cuantizacion GGUF Q4_K_M, el modelo ocupa alrededor de 1,1 GB, pudiendo ejecutarse en GPUs con 4 GB de VRAM o incluso en CPU con suficiente RAM.
- GPUs recomendadas: RTX 3060 (12 GB) o superior para FP16; RTX 4050, RTX 3060 o GPUs integradas modernas para versiones cuantizadas. Tambien es viable en Apple Silicon con Metal o en CPUs modernas con llama.cpp.
- Si cabe en consumer GPU: si, tanto en version FP16 como cuantizada. Es adecuado para GPUs de gama media y baja.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, Text Generation Inference (TGI) y transformers de HuggingFace. El autor recomienda explícitamente el uso de GGUF para produccion.
- Latencia y throughput: no se han publicado datos oficiales de latencia o throughput. En una RTX 4090, un modelo de 2B en Q4 se puede ejecutar con latencias de decenas de milisegundos por token, pero estos valores son estimaciones no confirmadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | GSM8K | HumanEval | Licencia |
|---|---|---|---|---|---|---|
| Jibay 2 | 2.0B | 32.768 | 56,9% | 70,0% | 68,0% | Apache 2.0 |
| Qwen3-1.7B (base) | 1.7B | 32.768 | no disponible | no disponible | no disponible | Apache 2.0 |
| Llama 3.2 1B | 1.2B | 128.000 | 49,3% | 56,5% | 40,5% | Llama 3.2 License |
| Phi-3.5 mini | 3.8B | 128.000 | 69,0% | 82,0% | 63,0% | MIT |

Nota: los datos de Qwen3-1.7B base no se han publicado en la informacion disponible. Los valores de Llama 3.2 y Phi-3.5 corresponden a resultados publicados por sus respectivos equipos. Jibay 2 supera a Llama 3.2 1B en HumanEval y ofrece mejor soporte de function calling que modelos de su tamano, pero queda por detras de Phi-3.5 mini en tareas de conocimiento general y matematicas.

## Limitaciones y advertencias

- El conocimiento del modelo esta limitado a principios de 2025; no tiene informacion sobre eventos posteriores.
- Los benchmarks declarados no han sido verificados de forma independiente; la metodologia de evaluacion es interna y no se ha publicado.
- El rendimiento en persa, su idioma principal, es limitado (41% en PPRC-BENCH), lo que sugiere margen de mejora en conversacion natural en dicho idioma.
- No es un modelo MoE: todos los parametros estan activos, lo que implica un coste de inferencia proporcional a su tamano completo (2B).
- Riesgo de alucinacion y sesgos inherentes a los modelos de lenguaje, especialmente en tareas de razonamiento cientifico donde el rendimiento es bajo (43% en ARC).
- La documentacion no detalla la composicion del dataset de entrenamiento, por lo que se desconocen posibles sesgos de procedencia o idioma.
- Para produccion, el autor recomienda usar GGUF, pero no se especifican las versiones de cuantizacion disponibles mas alla de Q4_K_M.
- No se ha confirmado el soporte de decodificacion especulativa, atencion lineal u otras tecnicas de optimizacion de inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JibayAi/Jibay_2
- Version GGUF Q4_K_M: https://huggingface.co/JibayAi/Jibay_2_GGUF_Q4-K-M
- Repositorio en GitHub: https://github.com/Jibay-Ai/JibayAi
- Organizacion en GitHub: https://github.com/Jibay-Ai
- SDK de Python en PyPI: https://pypi.org/project/jibayai/
