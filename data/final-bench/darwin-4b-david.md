# FINAL-Bench/Darwin-4B-David

## Resumen

Darwin-4B-David es un modelo de lenguaje de tipo denso construido sobre la arquitectura Gemma 4 (variante E4B) y publicado por FINAL-Bench. Se presenta como el primer modelo de "segunda generación" de la familia Darwin: no se entrena desde cero, sino que se obtiene mediante un *merge* evolutivo que combina un modelo ya evolucionado (Darwin-4B-Opus, generación 1) con el modelo de la comunidad DECKARD-Expresso-Universe de DavidAU. La propuesta del autor es aplicar de forma recursiva el principio "merge = evolve", de modo que un modelo pequeño compita con alternativas de mayor tamano.

El modelo declara 4,5 mil millones de parametros en su model card, aunque el recuento real de pesos en safetensors asciende a 7.996.156.490 parametros (aproximadamente 8B), una discrepancia que conviene tener en cuenta al planificar el despliegue. Incorpora modo *thinking*, una ventana de contexto de 128K tokens y cobertura de mas de 140 idiomas segun la documentacion del autor, con licencia Apache 2.0.

Su relevancia actual radica en dos factores: por un lado, el autor reporta un salto de 58,6% a 85,0% en GPQA Diamond respecto al modelo base Gemma 4 E4B, un incremento de 26,4 puntos porcentuales que, de confirmarse, situaria a un modelo de este tamano en un rango de razonamiento poco habitual; por otro lado, ejemplifica una practica creciente en el ecosistema open source: la creacion de modelos derivados mediante tecnicas de fusion (DARE-TIES, merges guiados) en lugar de entrenamiento completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Gemma 4 (E4B) |
| Parametros totales | 7.996.156.490 (recuento real en safetensors); la model card declara 4,5B |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens (segun model card) |
| Tipos de cuantizacion | no disponible para este modelo concreto; el ecosistema Gemma 4 admite GGUF, BF16 y cuantizaciones de llama.cpp |
| Idiomas soportados | en, ko, ja, zh, multilingual (140+ idiomas segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers); no se listan GGUF oficiales para esta variante |

## Arquitectura y entrenamiento

Darwin-4B-David no se entrena mediante preentrenamiento clasico ni fine-tuning supervisado convencional, sino mediante un *merge* de pesos de dos modelos progenitores. El progenitor ("padre") es Darwin-4B-Opus, un modelo de generacion 1 obtenido a partir de gemma-4-E4B-it con el motor propietario "Darwin V6" y que, segun el autor, incorpora destilacion de razonamiento de Claude Opus. El progenitor ("madre") es DavidAU/DECKARD-Expresso-Universe, un ajuste fino profundo en BF16 realizado con Unsloth sobre cinco datasets internos, orientado a potenciar logica e intuicion y con modo *thinking* activado por defecto.

La fusion emplea las tecnicas etiquetadas como "evolutionary-merge", "mri-guided" y "dare-ties". DARE-TIES es una combinacion conocida de DARE (drop and rescale) y TIES-merging (trim, elect sign, merge), orientada a reducir interferencias entre pesos al fusionar modelos. El termino "MRI-guided" no esta documentado en detalle en la informacion disponible. El resultado es un modelo denso que hereda capacidades de razonamiento y creatividad de ambos progenitores. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas posteriores de RLHF o DPO sobre el merge.

## Capacidades

- Generacion de texto conversacional y de tipo *chat* (pipeline `text-generation`).
- Razonamiento con modo *thinking* explicito, heredado del progenitor DECKARD.
- Razonamiento cientifico de nivel avanzado: el autor reporta 85,0% en GPQA Diamond.
- Capacidades multilingues declaradas para ingles, coreano, japones y chino, con cobertura ampliada a mas de 140 idiomas segun la model card.
- Procesamiento de imagen y texto: la etiqueta `image-text-to-text` sugiere entrada multimodal, aunque la informacion disponible no detalla el modulo de vision.
- Soporte de *tool calling* / *function calling*: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; el modo *thinking* es compatible con este uso, pero no hay confirmacion del autor.
- Capacidades especiales: modo *thinking* por defecto, orientacion a "proto-AGI" segun las etiquetas del autor.

## Casos de uso

- Razonamiento cientifico asistido: el modelo esta optimizado para preguntas de nivel posgrado (GPQA Diamond), por lo que resulta adecuado para asistentes de investigacion que requieran justificar respuestas en fisica, quimica o biologia con cadenas de razonamiento largas.
- Generacion de codigo con contexto extenso: con 128K tokens de ventana puede procesar repositorios completos o archivos de gran tamano en una sola pasada, util para revision de codigo y refactorizacion asistida.
- Analisis de documentos tecnicos multilingues: la cobertura declarada de en, ko, ja y zh permite resumir y comparar documentacion tecnica en varios idiomas dentro de la misma conversacion.
- Prototipado rapido en entornos sin GPU dedicada: al ser un modelo de ~8B en safetensors, puede servirse en cuantizacion de 4 bits en GPUs de consumo, lo que facilita iteracion local antes de escalar a produccion.
- Educacion y tutoria adaptativa: el modo *thinking* permite mostrar el razonamiento paso a paso, aprovechable en plataformas de aprendizaje que necesiten explicar el proceso y no solo la respuesta.
- Experimentacion en investigacion sobre merges: dado que el modelo documenta su linaje y tecnicas de fusion, sirve como caso de estudio reproducible para estudiar el impacto de DARE-TIES y merges recursivos en el rendimiento de razonamiento.
- Atencion al cliente especializada: con contexto de 128K puede mantener conversaciones multi-turno con historial extenso y documentacion de producto embebida, aunque la ausencia de datos sobre *tool calling* limita la integracion con sistemas externos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Darwin-4B-David | Gemma 4 E4B (base) | Delta |
|---|---|---|---|
| GPQA Diamond (accuracy) | 85,0% | 58,6% | +26,4 pp |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras evaluaciones estandar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16 GB (8B parametros x 2 bytes); el repositorio ocupa 16,0 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 8-9 GB.
- VRAM estimada en cuantizacion de 4 bits: en torno a 5-6 GB.
- GPU recomendadas para BF16: A100 40GB, H100, L40S o RTX 4090 (24 GB) para secuencias moderadas.
- Cabe en GPU de consumo: si, en RTX 4090 y RTX 3090 en 4 u 8 bits; en 16 bits requiere al menos 24 GB y puede quedarse justo con contexto largo.
- Opciones de despliegue: transformers (formato nativo safetensors); vLLM y TGI son viables si la arquitectura Gemma 4 esta soportada por esas herramientas; llama.cpp y Ollama requeririan conversion a GGUF, no publicada oficialmente para esta variante.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GPQA Diamond | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Darwin-4B-David | ~8B (declara 4,5B) | 128K | 85,0% (autor) | Apache 2.0 | Hugging Face |
| Gemma 4 E4B (base) | 4,5B | no disponible | 58,6% (autor) | Apache 2.0 | Hugging Face |
| Darwin-4B-Opus (Gen 1) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| DECKARD-Expresso-Universe | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La comparativa se limita a los modelos del linaje documentado; no se dispone de datos de benchmarks de alternativas externas de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Discrepancia en el recuento de parametros: la model card declara 4,5B, pero los safetensors contienen 7.996.156.490 parametros; esto afecta a los requisitos reales de memoria y debe verificarse antes de desplegar.
- El resultado de 85,0% en GPQA Diamond figura como no verificado (`verified: false`) en el model-index y procede del propio autor; conviene tratarlo con cautela hasta que exista replicacion independiente.
- La tecnicas de merge "mri-guided" no estan documentadas en detalle, lo que dificulta evaluar la reproducibilidad del proceso.
- Riesgo de alucinacion inherente a los modelos de lenguaje; el modo *thinking* puede producir cadenas de razonamiento plausibles pero incorrectas, especialmente en dominios especializados.
- El progenitor DECKARD se describe como "uncensored", lo que puede reducir las salvaguardas frente a contenido sensible; en produccion conviene anadir capas de moderacion.
- Cobertura multilingue declarada amplia (140+ idiomas) pero sin evaluacion publicada por idioma; el rendimiento real fuera de en, ko, ja y zh no esta verificado.
- Ausencia de datos sobre *tool calling* y capacidades de agente, lo que limita su uso en pipelines que dependan de llamadas a funciones.
- No se publican GGUF oficiales para esta variante, lo que complica el despliegue en CPU o en hardware de Apple.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de modelos de terceros conviene revisar las condiciones de los progenitores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FINAL-Bench/Darwin-4B-David
- Progenitor Gen 1: https://huggingface.co/FINAL-Bench/Darwin-4B-Opus
- Progenitor Gen 3: https://huggingface.co/FINAL-Bench/Darwin-4B-Genesis
- Modelo madre: https://huggingface.co/DavidAU/gemma-4-E4B-it-The-DECKARD-Expresso-Universe-HERETIC-UNCENSORED-Thinking
- Demo del modelo 9B: https://huggingface.co/spaces/FINAL-Bench/Darwin-9B-Opus
- Demo del modelo 31B: https://huggingface.co/spaces/FINAL-Bench/Darwin-31B-Opus
- Demo del modelo 35B-A3B: https://huggingface.co/spaces/FINAL-Bench/Darwin-35B-A3B-Opus
- GGUF oficial Q8 del 35B: https://huggingface.co/FINAL-Bench/Darwin-35B-A3B-Opus-Q8-GGUF
- GGUF de bartowski: https://huggingface.co/bartowski/FINAL-Bench_Darwin-35B-A3B-Opus-GGUF
- Leaderboard FINAL Bench: https://huggingface.co/spaces/FINAL-Bench/Leaderboard
- Leaderboard ALL Bench: https://huggingface.co/spaces/FINAL-Bench/all-bench-leaderboard
- Demo CPU POCKET: https://huggingface.co/spaces/FINAL-Bench/POCKET-35B-CPU
- Coleccion POCKET: https://huggingface.co/collections/FINAL-Bench/pocket-models-6a618ee5d23eafb7e185a5c6
- Paper DARE (arXiv:2311.03099): https://arxiv.org/abs/2311.03099
- Paper referenciado (arXiv:2510.13940): https://arxiv.org/abs/2510.13940
- Paper referenciado (arXiv:2605.14386): https://arxiv.org/abs/2605.14386
