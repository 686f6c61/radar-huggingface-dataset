# Shifusen/flint-roleplay-antislop-heretic-NVFP4

## Resumen

flint-roleplay-antislop-heretic-NVFP4 es una cuantización NVFP4 (4 bits, formato FP4 de NVIDIA) del modelo AlexWortega/flint-roleplay-antislop-heretic, un ajuste fino orientado a roleplay y escritura creativa construido sobre RecursiveSI/flint. El autor de esta versión es el usuario de Hugging Face Shifusen, y el artefacto se publicó el 16 de noviembre de 2026. Se distribuye bajo licencia Apache 2.0 y solo declara soporte para inglés.

El modelo hereda la arquitectura MoE de Flint (49 capas, hidden 2048, 256 expertos con top-6 más un experto compartido, atención con sliding window de 513 y atención completa, QK-norm por cabeza y attention sinks). La variante original de AlexWortega aplicó GRPO sobre tareas de escritura «antislop» con una recompensa calibrada sobre textos de referencia, y después se le aplicó un proceso de decensura con Heretic v2.0.0.dev0 mediante ablación de rango arbitrario (ARA) entre las capas 16 y 42. Esta versión concreta comprime los pesos a NVFP4 con compressed-tensors y llmcompressor, pensando para servir con vLLM.

La relevancia actual es doble: por un lado, demuestra un pipeline de cuantización FP4 de un MoE de ~22,6 mil millones de parámetros (según los safetensors publicados) manteniendo el formato de tensores comprimidos que vLLM consume de forma nativa; por otro, documenta explícitamente el efecto de la decensura (0 rechazos frente a 97 del modelo original en una prueba de 100 prompts) y advierte de que el contenido puede incluir temas maduros, lo que obliga a desplegar una capa de moderación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FlintForCausalLM, transformer MoE (49 capas, hidden 2048, 32 cabezas de consulta / 4 de clave-valor, 256 expertos top-6 + experto compartido, sliding window 513 + atención completa, QK-norm por cabeza y attention sinks) |
| Parametros totales | 22.659.230.670 (según safetensors del repo); la model card del modelo base declara 39,8 B totales con ~2,5 B activos |
| Parametros activos | ~2,5 B (aproximado, según la model card del base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits FP4), etiquetado también como 8-bit en los tags; el modelo base ofrece BF16, GGUF Q8_0 y Q4_K_M |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors (NVFP4), pensado para vLLM; el repo ocupa 23,4 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Flint: un transformer MoE con 49 capas, dimensión oculta de 2048, 32 cabezas de consulta y 4 de clave-valor, 256 expertos con enrutamiento top-6 más un experto compartido, y una combinación de atención de ventana deslizante de 513 tokens con atención completa. Incorpora QK-norm por cabeza y attention sinks. El modelo base se post-entrenó con GRPO (4 muestras por prompt, lr 1e-5, β KL 0.04) sobre prompts de continuación de tuits orientados a eliminar «slop»; la recompensa la puntuaba Claude Opus 5.5 contra una rúbrica por tarea, calibrada con un ajuste sigmoide sobre la distribución de puntuaciones de textos de referencia, y multiplicada por un factor de longitud.

Sobre ese modelo, AlexWortega aplicó Heretic v2.0.0.dev0 para la decensura mediante ablación de rango arbitrario (ARA) entre las capas 16 y 42, con pesos de preservación de comportamiento bueno de 0,6791, de dirección del comportamiento malo de 0,1063 y de sobrecorrección relativa de 0,9919, con neighbor_count 8. Esta versión NVFP4 añade una cuantización a 4 bits FP4 con compressed-tensors y llmcompressor, sin datos publicados sobre el proceso exacto de calibración de la cuantización ni sobre la pérdida de fidelidad respecto al BF16 original de esta variante. No se documenta en la información disponible ninguna innovación adicional de decodificación especulativa ni de atención lineal.

## Capacidades

- Generación de texto en inglés con foco en roleplay de personajes, ficción interactiva y escritura creativa casual.
- Escritura «antislop»: el post-entrenamiento GRPO está diseñado para reducir fórmulas repetitivas y clichés en la prosa, con una mejora medida en la rúbrica de calidad (4,92 a 5,90 sobre 10) y en la recompensa calibrada (0,12 a 0,31).
- Modo de razonamiento desactivable: la plantilla de chat de Flint permite apagar el razonamiento con un `<think></think>` vacío.
- Conversación multi-turno con personajes, incluyendo escenas de romance y coqueteo.
- Decensura: 0 rechazos en 100 prompts de prueba frente a 97 del modelo original, según la model card.
- No se documenta soporte de tool calling, function calling, uso de agentes, visión, audio ni capacidades multilingües más allá del inglés.

## Casos de uso

- Roleplay de personajes en producción: el modelo está ajustado específicamente para mantener la voz y la coherencia de fichas de personaje a lo largo de conversaciones multi-turno; en la evaluación pairwise ciega gana 28 de 64 comparaciones frente al base, con 14 empates.
- Ficción interactiva y novelas visuales: la mejora en la rúbrica de escritura (de 4,92 a 5,90) y la reducción de clichés lo hacen adecuado para generar narrativa ramificada donde la variedad de prosa importa.
- Generación de diálogo para videojuegos con NPC: su bajo número de parámetros activos (~2,5 B) permite servir varias instancias simultáneas en una sola GPU con vLLM, algo útil para poblar escenas con muchos personajes.
- Escritura creativa asistida: continuación de textos y borradores con menos fórmulas repetitivas, aprovechando el entrenamiento antislop sobre continuaciones de tuit.
- Investigación sobre decensura y alineación: el par de modelos (original con 97/100 rechazos y esta variante con 0/100) sirve como caso de estudio reproducible de ablación ARA con divergencia KL documentada de 2,1426.
- Evaluación de cuantización FP4 en MoE: al estar empaquetado con compressed-tensors y pensado para vLLM, permite medir en producción el impacto de NVFP4 frente a BF16 o GGUF en un modelo con 256 expertos.
- Base para post-entrenamiento adicional: la model card del base lo recomienda explícitamente para seguir entrenando; conviene partir del BF16 si se va a hacer fine-tuning, ya que esta versión está cuantizada.

## Benchmarks y rendimiento

Los datos disponibles corresponden al modelo base flint-roleplay-antislop-heretic (BF16), no a esta cuantización NVFP4, y se midieron con vLLM en BF16, temperatura 1.0 y el mismo juez (Claude Opus 5.5).

| Metrica | Base (RecursiveSI/flint) | flint-roleplay-antislop (BF16) | Delta |
|---|---:|---:|---:|
| Puntuación de rúbrica de calidad (0-10), 24 prompts held-out | 4,92 | 5,90 | +0,98 |
| Recompensa calibrada (0-1) | 0,12 | 0,31 | +0,19 |
| Roleplay pairwise ciego, todas las escenas (n=64) | 22 victorias | 28 victorias | 14 empates |
| Roleplay pairwise ciego, escenas de romance/coqueteo (n=16) | 7 victorias | 6 victorias | 3 empates |
| Rúbrica absoluta de roleplay (n=24) | 6,38 | 6,13 | -0,25 |
| Rechazos (100 prompts) | 97/100 | 0/100 | -97 |
| Divergencia KL respecto al original | 0 (por definición) | 2,1426 | — |

Fidelidad de cuantización del modelo base (KLD respecto a su BF16, menor es mejor): Q8_0 con KLD 0,0077 y 96 % de mismo token top; Q4_K_M con KLD 0,050 y 90 % de mismo token top. Para escala, el propio BF16 de Flint difiere en KLD 0,0034 entre kernels de CPU y GPU en llama.cpp.

No se han publicado resultados de benchmarks para esta cuantización NVFP4 concreta en la información disponible.

## Requisitos de hardware

- El repo pesa 23,4 GB en NVFP4, por lo que la inferencia requiere al menos ~24 GB de VRAM solo para los pesos, más overhead de caché KV y activaciones.
- Cabe en GPUs de consumo de gama alta con 24 GB o más (RTX 4090, RTX 5090), aunque con margen ajustado y contexto limitado; para contextos largos o varias peticiones concurrentes se recomienda A100 40/80 GB, H100 o L40S.
- Despliegue previsto: vLLM con soporte de compressed-tensors y FP4 (el autor etiqueta el modelo con vllm y endpoints_compatible). No se documenta compatibilidad con llama.cpp, Ollama ni TGI para este formato NVFP4.
- Para alternativas en GGUF del mismo ajuste existen BF16 (79,6 GB), Q8_0 (44,1 GB) y Q4_K_M (25,3 GB) en el repo del modelo base, servibles con llama.cpp.
- Latencia y throughput: no disponibles para esta cuantización. Como referencia cualitativa, el modelo base tiene ~2,5 B de parámetros activos por token, lo que reduce el coste de cómputo por token frente a un denso del mismo tamaño total.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Shifusen/flint-roleplay-antislop-heretic-NVFP4 (este) | 22,66 B (safetensors); ~2,5 B activos | no disponible | NVFP4, safetensors compressed-tensors | Apache 2.0 | Decensurado con Heretic, 0/100 rechazos |
| AlexWortega/flint-roleplay-antislop-heretic (base directo) | ~39,8 B totales, ~2,5 B activos | no disponible | BF16 safetensors + GGUF | Apache 2.0 | Mismo ajuste sin cuantizar a FP4 |
| RecursiveSI/flint (base original) | ~39,8 B totales, ~2,5 B activos | no disponible | BF16 + GGUF | Apache 2.0 | Sin decensurar (97/100 rechazos) ni RL antislop |

No se dispone de datos de benchmarks de esta cuantización NVFP4 que permitan una comparación numérica directa con alternativas de otros autores.

## Limitaciones y advertencias

- El modelo está decensurado de forma deliberada: la model card reporta 0 rechazos en 100 prompts frente a 97 del original, y el contenido de roleplay puede incluir temas maduros. Es imprescindible añadir una capa de moderación propia antes de exponerlo a usuarios finales.
- La divergencia KL de 2,1426 respecto al modelo original indica un cambio sustancial en la distribución de salida; el comportamiento seguro heredado de Flint no fue un objetivo del entrenamiento.
- Solo soporta inglés; no hay capacidades multilingües documentadas.
- Riesgo de alucinación no cuantificado: no se publican evaluaciones de factualidad, y el ajuste está orientado a ficción, no a tareas de conocimiento.
- Las métricas de calidad proceden de muestras pequeñas (n=24 y n=64) y de un único juez (Claude Opus 5.5); el propio autor pide leerlas como direccionales. En la rúbrica absoluta de roleplay el modelo queda por debajo del base (6,13 frente a 6,38).
- No hay datos publicados de fidelidad de la cuantización NVFP4 respecto al BF16 de esta variante, ni de latencia o throughput.
- El número de parámetros difiere entre fuentes (22,66 B en safetensors frente a 39,8 B declarados en la model card del base); conviene verificar el recuento real antes de dimensionar hardware.
- Licencia Apache 2.0 permite uso comercial, pero el despliegue debe cumplir la legislación aplicable en materia de contenido para adultos y moderación.
- No se documenta soporte de tool calling ni de flujos de agentes; no debe asumirse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shifusen/flint-roleplay-antislop-heretic-NVFP4
- Modelo base directo: https://huggingface.co/AlexWortega/flint-roleplay-antislop-heretic
- Modelo original Flint: https://huggingface.co/RecursiveSI/flint
- Heretic (herramienta de decensura): https://heretic-project.org
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
