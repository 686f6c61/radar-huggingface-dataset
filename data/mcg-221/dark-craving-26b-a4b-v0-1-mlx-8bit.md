# McG-221/Dark-Craving-26B-A4B-v0.1-mlx-8Bit

## Resumen

Dark-Craving-26B-A4B-v0.1-mlx-8Bit es una cuantización a 8 bits en formato MLX del modelo ReadyArt/Dark-Craving-26B-A4B-v0.1, realizada por el usuario McG-221 mediante mlx-lm versión 0.31.2. El modelo base es un modelo de generación de texto orientado a roleplay, contenido adulto explícito y conversación sin alineación (unaligned), construido sobre una arquitectura etiquetada como "gemma4" con denominación 26B-A4B, lo que sugiere una variante de mezcla de expertos (MoE) con unos 26 mil millones de parámetros totales y aproximadamente 4 mil millones activos por token, aunque el autor no detalla explícitamente esta configuración.

Este repositorio no introduce ningún cambio en los pesos más allá de la cuantización: su valor está en facilitar la ejecución del modelo en hardware Apple Silicon (Mac con chips M1/M2/M3/M4) mediante el framework MLX, que aprovecha la memoria unificada. Con un tamaño de repositorio de 26,8 GB, la versión 8-bit reduce a la mitad los requisitos de memoria respecto a la versión en precisión completa, manteniendo una pérdida de calidad mínima.

Es relevante para usuarios que buscan modelos sin filtros de contenido para escritura creativa adulta y que trabajan en el ecosistema Apple. Al tratarse de contenido explícito y sin alineación, está marcado como "not-for-all-audiences" y su uso exige responsabilidad por parte del usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Etiquetada como "gemma4", presumiblemente MoE (26B-A4B); detalles no disponibles |
| Parametros totales | 25.233.053.440 (~25,2B, dato real de safetensors) |
| Parametros activos | no disponible (la denominación A4B sugiere ~4B activos, no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (MLX) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX 8-bit) |

## Arquitectura y entrenamiento

El modelo base, ReadyArt/Dark-Craving-26B-A4B-v0.1, se etiqueta con "gemma4", lo que indica una base arquitectónica derivada de la familia Gemma, y su nomenclatura "26B-A4B" sigue el convenio habitual de los modelos MoE (26 mil millones de parámetros totales, ~4 mil millones activos por token). Esta configuración permitiría una inferencia rápida con calidad de modelo grande, aunque la model card no documenta explícitamente la arquitectura, el número de expertos ni los datos de entrenamiento.

Esta versión concreta es únicamente una conversión a MLX 8-bit realizada con mlx-lm 0.31.2, sin ajustes adicionales ni modificaciones de pesos. No hay información disponible sobre el proceso de entrenamiento del modelo base (tokens vistos, composición del dataset, RLHF/DPO u otras técnicas de alineación); de hecho, las etiquetas "unaligned" y "nsfw" indican que se ha eliminado o no se ha aplicado el ajuste de seguridad típico de los modelos comerciales.

## Capacidades

- Generación de texto conversacional en inglés, con enfoque en roleplay e interacción multi-turno.
- Contenido adulto explícito (NSFW/ERP) sin filtros de alineación, según las etiquetas del autor.
- Formato instruct: responde a plantillas de chat (el script de ejemplo usa `apply_chat_template`).
- Ejecución optimizada en Apple Silicon mediante MLX.
- No hay información disponible sobre capacidades de código, matemáticas, visión, audio, tool calling ni agentes.

## Casos de uso

- Roleplay narrativo adulto: el modelo está fine-tuned para conversaciones de rol largas y explícitas en inglés, su caso de uso principal según las etiquetas del autor.
- Escritura creativa de ficción madura: generación de prosa con contenido para adultos sin rechazos de seguridad, útil para autores de género adulto.
- Compañeros conversacionales (companion bots): su naturaleza conversacional e instruct lo hace adecuado para chatbots de interacción personal en entornos locales y privados.
- Prototipado local en Mac: gracias al formato MLX, permite experimentar con un modelo de ~25B parámetros en portátiles Apple Silicon con memoria unificada sin necesidad de GPU dedicada.
- Prueba de cuantizaciones: útil como referencia para evaluar la pérdida de calidad de la cuantización a 8 bits frente al modelo base en FP16.
- Investigación sobre desalineación: permite estudiar el comportamiento de modelos sin filtros de seguridad en entornos controlados y con supervisión ética.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: el repositorio ocupa 26,8 GB, por lo que se recomienda un Mac con al menos 32 GB de memoria unificada (un modelo de 8-bit necesita aproximadamente el tamaño del repo más overhead de contexto, ~28-30 GB).
- Hardware recomendado: Apple Silicon M2/M3/M4 Pro o Max con 32-64 GB de memoria unificada. No está pensado para GPU NVIDIA en este formato (usar el modelo base en GGUF para CUDA).
- Consumer: cabe en Mac Studio y MacBook Pro de gama alta con 32 GB o más; no cabe cómodamente en máquinas con 16 GB.
- Despliegue: mlx-lm (método documentado en la model card, con `load` y `generate` de la librería `mlx_lm`). No hay información sobre soporte en vLLM, llama.cpp, Ollama o TGI para esta conversión concreta.
- Latencia y throughput: no disponibles; los modelos MoE con ~4B de parámetros activos suelen ofrecer velocidades de generación altas en MLX, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Dark-Craving-26B-A4B-v0.1-mlx-8Bit | ~25,2B total (~4B activos, no confirmado) | 8-bit | MLX safetensors | Apache 2.0 | Roleplay NSFW sin alineación |
| ReadyArt/Dark-Craving-26B-A4B-v0.1 (base) | ~25,2B | FP16/BF16 | safetensors | Apache 2.0 | Roleplay NSFW sin alineación |
| Mistral-Small-24B-Instruct (referencia de tamaño similar) | ~24B (denso) | variable (GGUF, AWQ...) | safetensors/GGUF | Apache 2.0 | Uso general alineado |

Frente al modelo base, esta versión reduce el consumo de memoria a aproximadamente la mitad con pérdida mínima de calidad. Frente a modelos densos de tamaño similar como Mistral Small 24B, la presumible naturaleza MoE ofrecería mayor velocidad de generación, aunque sin benchmarks publicados no es posible confirmarlo.

## Limitaciones y advertencias

- Contenido adulto explícito: el modelo genera material NSFW sin filtros; está marcado como "not-for-all-audiences" y su uso con menores o sin consentimiento de los participantes es inaceptable.
- Sin alineación: al carecer de ajustes de seguridad, puede producir contenido dañino, ilegal o ofensivo; el usuario asume toda la responsabilidad legal y ética del uso.
- Riesgo de alucinación: no hay datos publicados; asume el riesgo típico de modelos de lenguaje generativos, agravado en roleplay por la tendencia a inventar hechos narrativos.
- Idioma: optimizado para inglés; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Longitud de contexto no documentada: verifica la configuración del tokenizador antes de sesiones largas de roleplay.
- Licencia Apache 2.0: permite uso comercial, pero el contenido generado y las leyes aplicables sobre material adulto varían por jurisdicción.
- Ecosistema: el formato MLX solo funciona en Apple Silicon; para otras plataformas usa el modelo base o conversiones GGUF.
- Repositorio de terceros: la conversión ha sido realizada por un usuario individual (76 descargas, 1 like); no hay auditoría de calidad de la cuantización.

## Enlaces

- Modelo cuantizado (MLX 8-bit): https://huggingface.co/McG-221/Dark-Craving-26B-A4B-v0.1-mlx-8Bit
- Modelo base: https://huggingface.co/ReadyArt/Dark-Craving-26B-A4B-v0.1
- mlx-lm (herramienta de conversión y ejecución): https://github.com/ml-explore/mlx-lm
