# DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP

## Resumen

Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP es un fine-tuning multi-etapa sobre el modelo Qwen3.6-27B de Alibaba, desarrollado por DavidAU en colaboracion con Nightmedia, TeichAI, armand0e y trohrbaugh. El modelo destaca por ser el primer fine-tuning de codigo abierto de su tamano en superar la barrera de 700 puntos en el benchmark ARC-C tanto en cuantizacion de 8 bits como de 4 bits, un umbral que hasta ahora solo habian alcanzado modelos cerrados de OpenAI, Anthropic y Google.

El proceso de entrenamiento combina fine-tuning multi-etapa, fusion de multiples modelos y datasets propios (Polar-STRICT y F451-STRICT), junto con trazas ligeras de razonamiento de Claude Opus y GPT-5. Mantiene las capacidades del modelo base, incluyendo vision y modo thinking, y anade un modo "heretic" sin censura mediante tecnicas de abliteration. Con 27.781 millones de parametros, esta disenado para ejecutarse en hardware de consumo, con cuantizaciones GGUF NEO IMATRIX que mejoran la precision entre un 2 y un 4 por ciento respecto a los GGUF convencionales.

La relevancia del modelo radica en que demuestra que es posible mejorar la inteligencia general y la resolucion de problemas de un modelo base sin sacrificar sus benchmarks nucleares, y que los resultados se mantienen incluso en cuantizaciones agresivas de 4 bits, lo que lo hace accesible para GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.6-27B) |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda de Qwen3.6-27B) |
| Tipos de cuantizacion | bfloat16, 8 bits, 4 bits, GGUF NEO IMATRIX (MTP y regular) |
| Idiomas soportados | ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.6-27B, un transformer denso de 27.781 millones de parametros con capacidades multimodales (imagen y texto) y modo de razonamiento thinking. El proceso de entrenamiento es un fine-tuning multi-etapa y una fusion multi-modelo que combina varios ajustes realizados por DavidAU con contribuciones de Nightmedia (fusion y evaluacion), TeichAI (dataset Polaris), armand0e (trazas Fable) y trohrbaugh (proceso "heretic" de abliteration).

Los datos de entrenamiento incluyen los datasets propios DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets, junto con trazas ligeras de razonamiento de Claude Opus y GPT-5 (Polaris, sin razonamiento). El objetivo declarado era aumentar la inteligencia general y la capacidad de resolucion de problemas sin modificar el nucleo del modelo base y sin practicas de "benchmaxing". El proceso incluyo pruebas intermedias en modelos Qwen3.5-9B para validar la metodologia antes de aplicarla al modelo de 27B.

La cuantizacion NEO IMATRIX mejora la precision de los quants entre un 2 y un 4 por ciento respecto a GGUF convencionales, y el tensor de salida (10-20 % de la salida) se mantiene en precision completa de 16 bits. El nombre "MTP" hace referencia a la prediccion multi-token, una caracteristica del modelo base Qwen3.6.

## Capacidades

- Generacion de texto y razonamiento avanzado: mejora la capacidad de seguir instrucciones y la resolucion de problemas respecto al modelo base.
- Modo thinking/reasoning: mantiene el modo de razonamiento del modelo Qwen3.6-27B.
- Vision: soporta entrada de imagenes (pipeline image-text-to-text).
- Escritura creativa: aunque no fue disenado especificamente para ello, muestra capacidades destacadas en narrativa, ficcion y roleplaying, segun los ejemplos del autor.
- Sin censura (uncensored/heretic): mediante tecnicas de abliteration, elimina restricciones de seguridad del modelo base.
- Multilingue: soporta ingles y chino.
- Conversacional: apto para dialogos multi-turno.

## Casos de uso

- Resolucion de problemas complejos: su puntuacion ARC-C de 0,711 en 8 bits lo hace adecuado para tareas de razonamiento cientifico y logico donde se requiere precision, como analisis de problemas de fisica o matematicas aplicadas.
- Asistente de codigo: al mantener las capacidades del modelo base Qwen3.6-27B, puede generar y depurar codigo en multiples lenguajes, integrable en entornos de desarrollo y pipelines de CI/CD.
- Escritura creativa y roleplaying: sus capacidades narrativas, aunque no buscadas, lo convierten en una opcion para generacion de ficcion, guiones y desarrollo de personajes en proyectos de escritura colaborativa.
- Analisis de imagenes: al soportar entrada visual, puede describir, analizar y razonar sobre imagenes en combinacion con texto, util en tareas de documentacion visual o asistencia multimodal.
- Agentes conversacionales sin restricciones: su naturaleza "uncensored" permite desplegarlo en entornos donde se requiere libertad total de contenido, como simulaciones, investigacion o generacion de contenido para adultos.
- Investigacion academica: su licencia Apache 2.0 y su disponibilidad en cuantizaciones de 4 bits permiten experimentar con modelos de 27B en hardware de consumo, facilitando la reproduccion de resultados y el estudio de tecnicas de fine-tuning multi-etapa.

## Benchmarks y rendimiento

Segun la informacion proporcionada por el autor, el modelo alcanza una puntuacion ARC-C de 0,711 en cuantizacion de 8 bits y 0,701 en 4 bits, superando por primera vez el umbral de 700 para un modelo de codigo abierto de este tamano. Supera al modelo base Qwen3.6-27B en 6 de 7 benchmarks y lo iguala en el septimo, y supera los 7 benchmarks del modelo Qwen3.6-35B-A3B. No se han publicado en la informacion disponible los resultados desglosados de benchmarks como MMLU, HumanEval o GSM8K.

| Benchmark | Fable-Fusion-711 (8 bits) | Fable-Fusion-711 (4 bits) | Qwen3.6-27B (base) | Qwen3.6-35B-A3B |
|---|---|---|---|---|
| ARC-C | 0,711 | 0,701 | inferior en 6 de 7 benchmarks | inferior en 7 de 7 benchmarks |

## Requisitos de hardware

- VRAM estimada: el repositorio en bfloat16 ocupa 55,6 GB, por lo que se requieren al menos 60 GB de VRAM para inferencia sin cuantizar.
- En cuantizacion de 8 bits, se estiman unos 28 GB de VRAM, compatible con GPUs profesionales como A100 de 40 GB o RTX A6000 de 48 GB.
- En cuantizacion de 4 bits, se estiman entre 14 y 16 GB de VRAM, compatible con GPUs de consumo como RTX 3090, RTX 4080 o RTX 4090.
- GPUs recomendadas: A100, H100 para precision completa; RTX 4090, RTX 3090 para cuantizaciones de 8 y 4 bits.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, transformers con Unsloth.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ARC-C | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-27B-Fable-Fusion-711 | 27,78 B | no disponible | 0,711 (8 bits) | Apache 2.0 | HuggingFace |
| Qwen3.6-27B (base) | 27,78 B | no disponible | inferior en 6 de 7 benchmarks | Apache 2.0 | HuggingFace |
| Qwen3.6-35B-A3B | 35 B (3 B activos, MoE) | no disponible | inferior en 7 de 7 benchmarks | Apache 2.0 | HuggingFace |

## Limitaciones y advertencias

- Contenido sin censura: al aplicar tecnicas de abliteration, el modelo puede generar contenido inapropiado, ofensivo o peligroso sin las salvaguardas habituales. No es adecuado para despliegues publicos sin moderacion.
- Idiomas limitados: solo soporta ingles y chino; no hay garantias de calidad en otros idiomas.
- Alucinaciones: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en tareas factuales.
- Datos de entrenamiento parcialmente documentados: los datasets Polar-STRICT y F451-STRICT no estan publicamente documentados en detalle, lo que dificulta la auditoria del proceso de entrenamiento.
- Benchmarks parciales: solo se ha publicado ARC-C; falta informacion sobre otros benchmarks estandar como MMLU, HumanEval o GSM8K.
- Riesgo de sobreajuste a benchmarks: aunque el autor declara cero "benchmaxing", la ausencia de datos independientes de evaluacion dificulta verificar esta afirmacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP
- Repositorio de cuantizaciones GGUF NEO MAX: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Repositorio del colaborador Nightmedia: https://huggingface.co/nightmedia/Qwen3.6-27B-Architect-Polaris2-Fable-B-F451
- Modelo de prueba Qwen3.5-9B: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
- Articulo en HackerNoon: https://hackernoon.com/qwen36-27b-fable-fusion-breaks-the-700-arc-c-barrier
- Articulo en HackerNoon (variante GGUF): https://hackernoon.com/the-fine-tuned-variant-of-qwen36-27b-that-achieved-an-arc-c-score-of-0711-in-8-bit-quantization
- Ficha en AIModels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.6-27b-fable-fusion-711-uncensored-heretic-nm-dau-neo-max-mtp-gguf-davidau
