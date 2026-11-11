# AdaptiveChunking/ali_lexmem-v1_s0

## Resumen

ali_lexmem-v1_s0 es un modelo de investigación desarrollado por AdaptiveChunking, orientado al estudio de la tokenización dinámica a nivel de byte. Se trata de una implementación de arquitectura H-Net (hierarchical network) entrenada con el framework beetle-hnet bajo la configuración `architecture=lexmem_v1` y objetivo `ratio`. Con 22,7 millones de parámetros, es un modelo de escala reducida pensado como banco de pruebas para técnicas de chunking adaptativo y tokenización byte-level, no como un modelo de propósito general.

El modelo se entrenó durante 6000 pasos con batches de 32 secuencias de 1024 bytes sobre tres idiomas (inglés, turco y finés), lo que sugiere un interés en evaluar cómo se comportan los mecanismos de segmentación dinámica en lenguajes con estructuras morfológicas muy distintas. La inclusión del turco y el finés —ambos con morfología aglutinante— apunta a probar la robustez del tokenizador dinámico ante palabras largas y composicionales, un caso habitualmente problemático para tokenizadores BPE estándar.

La relevancia del modelo es principalmente metodológica: el repositorio publica checkpoints intermedios en una programación logarítmica por fases, junto con el estado completo del entrenador reanudable y sondas de frontera FLORES+. Esto lo convierte en material útil para reproducir experimentos de tokenización adaptativa y analizar la evolución del aprendizaje a lo largo del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (hierarchical network), variante `lexmem_v1`, procesamiento byte-level con chunking dinámico |
| Parametros totales | 22.719.553 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrenado con secuencias de 1024 bytes) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en, tr, fi (según datos de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con pesos atados almacenados una sola vez), checkpoint.pt para estado del entrenador |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura H-Net implementada en beetle-hnet, un diseño jerárquico que opera directamente sobre bytes en lugar de sobre tokens predefinidos. La configuración `lexmem_v1` con `dechunk=ema` indica que el mecanismo de de-chunking utiliza una media móvil exponencial para determinar dinámicamente los límites de los chunks durante la inferencia. El objetivo de entrenamiento es `ratio`, sin programación de fases (`schedule=None`).

El entrenamiento consistió en 6000 pasos con batches de 32 secuencias de 1024 bytes cada uno, sobre un corpus multilingüe limitado a inglés, turco y finés. El repositorio organiza los checkpoints en ramas `step-N` siguiendo una programación logarítmica en base 2 (0, 1, 2, 4, 6, 8, 16, ..., 2^k), lo que permite analizar la dinámica de aprendizaje en distintos momentos. Cada rama incluye el estado completo del entrenador (`training_state/checkpoint.pt`), lo que facilita la reanudación exacta del entrenamiento. La rama `main` contiene los pesos finales, el log de entrenamiento (`log.jsonl`), un resumen final (`final.json`) y las sondas de frontera FLORES+ en `probe/`.

## Capacidades

- Modelado de lenguaje a nivel de byte con segmentación dinámica de chunks.
- Tokenización adaptativa mediante de-chunking con media móvil exponencial (EMA).
- Procesamiento multilingüe limitado a inglés, turco y finés.
- Reanudación de entrenamiento desde checkpoints intermedios con estado completo del optimizador y del entrenador.
- Evaluación de fronteras de chunk mediante sondas FLORES+.
- No se ha documentado soporte de tool calling, function calling, agentes ni modos de razonamiento extendido.
- No se ha documentado soporte de visión, audio ni otras modalidades.

## Casos de uso

- Investigación en tokenización adaptativa: el modelo sirve como banco de pruebas para comparar estrategias de chunking dinámico frente a tokenizadores BPE estáticos, analizando cómo varía la segmentación con la EMA a lo largo del entrenamiento.
- Estudio de morfología aglutinante: al entrenarse con turco y finés, permite analizar si el chunking byte-level dinámico maneja mejor palabras composicionales largas que los tokenizadores subword convencionales.
- Reproducción de experimentos: los checkpoints intermedios con estado completo del entrenador permiten reproducir exactamente curvas de entrenamiento y validar resultados de investigación de forma determinista (seed 0).
- Análisis de dinámica de aprendizaje: la programación logarítmica de checkpoints facilita estudiar la evolución de representaciones internas en distintas fases del entrenamiento.
- Evaluación de fronteras lingüísticas: las sondas FLORES+ incluidas en la rama `main` permiten medir la calidad de la segmentación en límites de frase y palabra en los tres idiomas de entrenamiento.
- Docencia y experimentación con H-Net: el tamaño reducido (22,7 M de parámetros) y la licencia Apache 2.0 lo hacen adecuado para cursos y laboratorios donde se quiera estudiar arquitecturas jerárquicas sin requerir hardware especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (22,7 M de parámetros), por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna (RTX 3060 o superior) es más que suficiente; también funciona en CPU para inferencia y en GPUs de gama baja para entrenamiento ligero.
- Cabe en cualquier GPU consumer; no requiere A100 ni H100.
- Opciones de despliegue: al ser un modelo PyTorch con arquitectura personalizada (H-Net de beetle-hnet), requiere el código del repositorio beetle-hnet para cargar los pesos. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ali_lexmem-v1_s0 | 22,7 M | 1024 bytes (entrenamiento) | H-Net byte-level con chunking dinámico | Apache 2.0 | Hugging Face |
| Modelos BPE byte-level (p. ej. GPT-2 tokenizer) | No aplica (tokenizador) | No aplica | Tokenización estática subword | Variable | Amplia |
| Modelos H-Net de referencia (beetle-hnet) | No disponible | No disponible | H-Net jerárquico | No disponible | GitHub |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación de escala muy reducida (22,7 M de parámetros); no es adecuado para tareas de generación de propósito general ni para producción.
- Entrenado únicamente con inglés, turco y finés; el rendimiento en otros idiomas es desconocido y probablemente deficiente.
- Longitud de contexto de entrenamiento limitada a 1024 bytes; no se ha documentado capacidad de extrapolación a secuencias más largas.
- No se han publicado evaluaciones de sesgo, alucinación ni robustez.
- Requiere el código de beetle-hnet para cargar y ejecutar el modelo; no es compatible con runtimes estándar de inferencia.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de documentación sobre comportamiento en producción desaconseja cualquier despliegue real sin evaluación previa.
- El repositorio incluye estado del entrenador (`checkpoint.pt`) que debe cargarse con `weights_only=False`, lo que implica riesgos de seguridad si se carga desde fuentes no confiables.

## Enlaces

- Hugging Face: https://huggingface.co/AdaptiveChunking/ali_lexmem-v1_s0
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
