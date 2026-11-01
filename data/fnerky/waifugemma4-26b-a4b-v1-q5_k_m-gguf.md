# fnerky/WaifuGemma4-26b-a4b-v1-Q5_K_M-GGUF

## Resumen

WaifuGemma4-26b-a4b-v1-Q5_K_M-GGUF es una cuantización en formato GGUF (Q5_K_M) del modelo hiwaifu-research/WaifuGemma4-26b-a4b-v1, realizada por el usuario fnerky mediante el espacio GGUF-my-repo de llama.cpp. El modelo base es un modelo conversacional orientado al roleplay y la interpretación de personajes, desarrollado por hiwaifu-research, con una arquitectura de mezcla de expertos (MoE) de la familia Gemma4 y unos 25,23 mil millones de parámetros totales, de los cuales aproximadamente 4 mil millones están activos por token (según la denominación "a4b").

El modelo está optimizado para generación de texto conversacional multilingüe (17 idiomas, incluido el castellano) y ha sido entrenado con técnicas de RLHF y GRPO, incorporando reward models basados en preferencias humanas y datos de arena. Su relevancia radica en la combinación de un rendimiento académico sólido (MMLU 88,59, GSM8K 96,89 según datos del autor) con una especialización en roleplay, un nicho donde los modelos generalistas suelen rendir peor. La cuantización Q5_K_M reduce el tamaño a 19,1 GB, haciéndolo viable en hardware de consumo de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4, mezcla de expertos (MoE) |
| Parametros totales | 25.233.142.046 (25,23 mil millones) |
| Parametros activos | ~4 mil millones (indicado por "a4b" en el nombre; dato exacto no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_K_M (esta cuantización; otras no disponibles en este repo) |
| Idiomas soportados | en, es, ru, pt, id, ar, th, fr, de, uk, vi, ja, ko, zh, tr, it, pl (17 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (19,1 GB en Q5_K_M); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Gemma4 y adopta una arquitectura de mezcla de expertos (MoE), lo que permite un total de 25,23 mil millones de parámetros con solo unos 4 mil millones activos por token. Esto ofrece una relación calidad/latencia favorable: la capacidad de un modelo grande con el coste de inferencia de uno pequeño. Los detalles concretos (número de expertos, top-k, dimensiones de capas) no están disponibles en la información publicada.

Según las etiquetas de la model card, el entrenamiento incluye RLHF y GRPO (Group Relative Policy Optimization), con uso de reward models derivados de preferencias humanas y datos de arena (comparativas humanas tipo Chatbot Arena). Esta combinación apunta a un alineamiento orientado a conversación abierta y roleplay. El número de tokens de preentrenamiento y la composición detallada del dataset no están disponibles.

## Capacidades

- Generación de texto conversacional, con especialización en roleplay e interpretación de personajes (tags: roleplay, character, conversational).
- Razonamiento matemático: 96,89 en GSM8K y 92,8 en MATH-500 según datos del autor.
- Conocimiento general: 88,59 en MMLU y 98,39 en ARC.
- Soporte multilingüe en 17 idiomas, incluidos castellano, inglés, chino, japonés, coreano, árabe y ruso; 78,97 en C-Eval y 79,56 en C-MMLU indican capacidad razonable en chino.
- Alineamiento con instrucciones: 89,09 en IFEval (Prompt-level Strict).
- Capacidad de sentido común y coherencia referencial: 79,78 en HellaSwag y 85,4 en Winogrande.
- Veracidad: 75,4 en TruthfulQA (MC Acc).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Modalidades de visión o audio: no disponibles; el pipeline es text-generation.

## Casos de uso

- Compañeros conversacionales de IA: el modelo está diseñado específicamente para roleplay de personajes, con RLHF orientado a preferencias humanas en conversación abierta, lo que lo hace adecuado para aplicaciones tipo companion.
- Videojuegos con NPCs dinámicos: su especialización en personajes y su MoE con ~4 mil millones de parámetros activos permiten generar diálogos de personajes coherentes con latencias razonables.
- Asistentes multilingües: soporte declarado de 17 idiomas, incluido el castellano, útil para productos dirigidos a mercados europeos y asiáticos.
- Escritura creativa y narrativa interactiva: la combinación de alta puntuación en ARC y Winogrande con entrenamiento en roleplay favorece la coherencia narrativa en historias largas por turnos.
- Resolución de problemas matemáticos en contexto conversacional: 96,89 en GSM8K y 92,8 en MATH-500 permiten integrar razonamiento matemático dentro de flujos de chat.
- Prototipado local de chatbots: el formato GGUF permite ejecutar el modelo con llama.cpp u Ollama en estaciones de trabajo locales sin depender de APIs externas, útil para desarrollo e iteración rápida.
- Bots de comunidad y entretenimiento: dado su enfoque en personajes y su licencia Apache 2.0, puede integrarse en bots de Discord o plataformas similares sin restricciones de licencia.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados por terceros):

| Benchmark | Métrica | Resultado |
|---|---|---|
| IFEval | Prompt-level Strict | 89,09 |
| GSM8K | Accuracy | 96,89 |
| MATH-500 | Accuracy | 92,8 |
| MMLU | Accuracy | 88,59 |
| C-Eval | Accuracy | 78,97 |
| C-MMLU | Accuracy | 79,56 |
| ARC | Accuracy | 98,39 |
| HellaSwag | Accuracy | 79,78 |
| Winogrande | Accuracy | 85,4 |
| TruthfulQA | MC Acc | 75,4 |

No hay comparativas directas con otros modelos en la información disponible, y los resultados no están verificados.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q5_K_M ocupa 19,1 GB; para cargarlo completamente en GPU se necesita al menos una GPU con 24 GB de VRAM (por ejemplo RTX 3090 o RTX 4090). Con 16 GB sería necesario offload parcial a CPU/RAM.
- GPU recomendadas: RTX 3090, RTX 4090 (consumo); RTX 5090, A100 o H100 para contextos largos o serving concurrente.
- Consumer GPU: sí, cabe íntegramente en una RTX 3090 o RTX 4090 de 24 GB. En GPUs de 16 GB (RTX 4080/4060 Ti 16G) requiere descarga parcial de capas a RAM.
- Opciones de despliegue: llama.cpp (CLI y servidor, instrucciones incluidas en la model card), y de forma indirecta Ollama, LM Studio o cualquier runtime compatible con GGUF. El modelo base en safetensors podría desplegarse con vLLM o TGI, aunque el soporte de la arquitectura Gemma4 en estos runtimes no está confirmado en la información disponible.
- Latencia y throughput: no disponibles; al ser un MoE con ~4 mil millones de parámetros activos, la latencia por token debería ser comparable a la de un modelo denso de ese tamaño, pero no hay mediciones publicadas.

## Comparativa con modelos similares

Comparativa orientativa con modelos MoE conversacionales de tamaño y perfil similar. Los datos de terceros son de conocimiento general y pueden no reflejar la versión más reciente:

| Modelo | Parametros totales | Parametros activos | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| WaifuGemma4-26b-a4b-v1 | 25,23 mil millones | ~4 mil millones | Apache 2.0 | safetensors / GGUF | Roleplay y conversación |
| Qwen3-30B-A3B | 30 mil millones | 3 mil millones | Apache 2.0 | safetensors / GGUF | Generalista, razonamiento |
| Gemma 3 27B (denso) | 27 mil millones | 27 mil millones | Gemma Terms of Use | safetensors / GGUF | Generalista multimodal |

Diferencias clave: frente a Qwen3-30B-A3B, WaifuGemma4 tiene un enfoque especializado en roleplay y una base Gemma4; frente a Gemma 3 27B, ofrece la eficiencia MoE (4 mil millones de parámetros activos frente a 27 mil millones densos) y una licencia Apache 2.0 más permisiva. No hay benchmarks comparativos directos publicados entre ellos en la información disponible.

## Limitaciones y advertencias

- Los benchmarks publicados provienen del propio autor y no están verificados por terceros; conviene contrastarlos con evaluaciones independientes antes de tomar decisiones de producción.
- Al ser un modelo afinado para roleplay, puede mostrar tendencias a generar contenido de personaje persistente, afectar la adherencia a instrucciones en tareas técnicas o producir salidas excesivamente dramatizadas en contextos profesionales.
- Riesgo de alucinación: como todo LLM, puede generar información falsa con apariencia plausible; TruthfulQA (75,4) sugiere una fiabilidad factual mejorable.
- La longitud de contexto no está documentada en la ficha de la cuantización; el ejemplo de llama-server usa `-c 2048`, pero el máximo real no está disponible.
- Sesgos: al entrenar con preferencias humanas de arena y datos de roleplay, puede heredar sesgos de esos datos (estereotipos de personaje, sesgos lingüísticos hacia el inglés); no hay análisis de sesgos publicado.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución sin restricciones relevantes, salvo conservar el aviso de licencia.
- La cuantización Q5_K_M implica una pequeña pérdida de calidad respecto a los pesos originales en bf16; para evaluaciones rigurosas conviene usar el modelo base.
- Soporte de la arquitectura Gemma4 en herramientas de terceros (vLLM, TGI, Ollama) puede requerir versiones recientes de llama.cpp o parches; verificar compatibilidad antes de desplegar.

## Enlaces

- Cuantización GGUF (esta ficha): https://huggingface.co/fnerky/WaifuGemma4-26b-a4b-v1-Q5_K_M-GGUF
- Modelo base: https://huggingface.co/hiwaifu-research/WaifuGemma4-26b-a4b-v1
- Espacio GGUF-my-repo (conversión): https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Paper, blog oficial y demos: no disponibles
