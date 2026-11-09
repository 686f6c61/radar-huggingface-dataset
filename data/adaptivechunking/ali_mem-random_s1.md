# AdaptiveChunking/ali_mem-random_s1

## Resumen

`ali_mem-random_s1` es un checkpoint de investigación publicado por el usuario AdaptiveChunking dentro del ecosistema del proyecto [beetle-hnet](https://github.com/suchirsalhan/beetle-hnet). No es un modelo conversacional ni un LLM al uso: se trata de una ejecución de entrenamiento de una H-Net (una arquitectura jerárquica de tokenización dinámica a nivel de byte) con la variante de arquitectura `ali` y el objetivo `ratio`, entrenada durante 6000 pasos sobre secuencias de 1024 bytes en tres idiomas (inglés, turco y finés). Con 22.785.088 parámetros, su interés es experimental: sirve para estudiar cómo una red aprende a segmentar dinámicamente flujos de bytes en chunks, no para generar texto útil.

El repositorio sigue el formato de publicación "Beetle-style", con ramas `step-N` que contienen checkpoints intermedios según una programación logarítmica por fases (0, 1, 2, 4, 6, 8, 16, ... hasta 2^k) y una rama `main` con los pesos del último paso, el log de entrenamiento y las pruebas de frontera sobre FLORES+. Incluye el estado completo del entrenador (`training_state/checkpoint.pt`) para poder reanudar el entrenamiento, lo que lo convierte en material reproducible más que en un artefacto de inferencia.

La relevancia es acotada pero clara para quien investiga tokenización byte-level y chunking adaptativo: permite inspeccionar los pesos intermedios de una H-Net y comparar el comportamiento de la segmentación a lo largo del entrenamiento. No hay pipeline declarado, ni idiomas soportados formalmente, ni benchmarks publicados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | H-Net (variante `ali`), tokenización dinámica a nivel de byte |
| Parámetros totales | 22.785.088 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 1024 bytes) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles (entrenado con datos en `en`, `tr`, `fi`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con pesos atados almacenados una sola vez) + checkpoint PyTorch (`training_state/checkpoint.pt`) |

## Arquitectura y entrenamiento

La arquitectura es una H-Net, un diseño jerárquico que opera directamente sobre bytes y aprende a agruparlos en chunks de forma dinámica (de ahí las etiquetas `dynamic-chunking`, `byte-level` y `hnet`). La variante concreta es `ali`, con objetivo de entrenamiento `ratio` y un mecanismo de dechunking basado en media móvil exponencial (`dechunk=ema`). El entrenamiento se ejecutó con semilla 1, durante 6000 pasos, con un tamaño de lote de 32 y secuencias de 1024 bytes, sobre un corpus multilingüe con inglés, turco y finés.

No se especifica en la información disponible el número total de tokens procesados ni la composición exacta del dataset, más allá de los tres idiomas citados. Tampoco se documenta si hubo fases de RLHF o DPO, algo poco probable dado el carácter de investigación del checkpoint. La innovación técnica principal es el propio mecanismo de chunking adaptativo: en lugar de fijar un vocabulario BPE estático, la red decide los límites de segmentación durante el entrenamiento, y el repositorio conserva checkpoints intermedios en una programación logarítmica por fases para poder analizar la evolución de esa segmentación.

## Capacidades

- Modelado de secuencias de bytes con segmentación dinámica en chunks.
- Entrenamiento y reanudación desde checkpoints intermedios (`training_state/checkpoint.pt` en cada rama `step-N`).
- Evaluación de fronteras de chunk mediante las pruebas FLORES+ incluidas en `main/probe/` una vez finalizado el run.
- Procesamiento multilingüe limitado a los idiomas de entrenamiento (inglés, turco, finés).
- Pesos atados almacenados de forma compacta, con mapeo en `config.json["tied_weights"]`.
- No dispone de tool calling, function calling, agentes, visión, audio ni modo de razonamiento; no es un modelo instructivo.

## Casos de uso

- Investigación en tokenización byte-level: cargar los checkpoints `step-N` para estudiar cómo evoluciona la frontera de chunking a lo largo de 6000 pasos y comparar fases del objetivo `ratio`.
- Reproducción de experimentos: el estado completo del entrenador permite reanudar el run desde cualquier checkpoint y verificar resultados con la semilla 1.
- Análisis de segmentación multilingüe: las pruebas de frontera sobre FLORES+ en `en`, `tr` y `fi` permiten medir el comportamiento del chunking en lenguas con morfología y ortografía distintas.
- Baseline para comparativas de H-Nets: al ser un checkpoint pequeño (22,8 M de parámetros) y con licencia Apache 2.0, sirve como referencia frente a otras variantes de arquitectura u objetivos del mismo proyecto.
- Estudio de mecanismos de dechunking: la configuración `dechunk=ema` puede analizarse aislando el efecto de la media móvil exponencial en la calidad de la reconstrucción de bytes.
- Docencia y prototipado de arquitecturas jerárquicas: el tamaño reducido y el formato safetensors permiten inspeccionar los pesos y el grafo en un portátil sin infraestructura especial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 22,8 M de parámetros (unos 91 MB de pesos); el repositorio completo ocupa 5,6 GB por la acumulación de checkpoints y estados del entrenador.
- GPU recomendadas: cualquier GPU consumer moderna sirve para cargar los pesos; para reanudar el entrenamiento conviene una GPU con al menos 8-16 GB por el estado del optimizador y los lotes de 32×1024 bytes.
- Cabe en GPU consumer: sí, en cualquier tarjeta con más de 2 GB de VRAM para inferencia; para entrenamiento, se recomienda RTX 3090/4090 o superior.
- Opciones de despliegue: carga directa con PyTorch y `safetensors`; no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo generativo estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ali_mem-random_s1` | 22,8 M | 1024 bytes (entrenamiento) | H-Net byte-level con chunking dinámico | Apache 2.0 | Hugging Face |
| Otras variantes de beetle-hnet | no disponible | no disponible | H-Net con otras arquitecturas/objetivos | no disponible | GitHub del proyecto |
| Modelos BPE byte-level clásicos | variable | variable | Tokenización estática | variable | Amplia |

No se dispone de datos de rendimiento comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje instructivo ni conversacional: no genera respuestas útiles para usuarios finales.
- No hay benchmarks ni métricas de calidad publicadas; el rendimiento real es desconocido.
- Los idiomas de entrenamiento se limitan a inglés, turco y finés; no se garantiza comportamiento en castellano.
- Riesgo de alucinación no aplicable en el sentido habitual, pero sí de reconstrucciones de byte incorrectas en la segmentación.
- La licencia Apache 2.0 permite uso comercial de los pesos, pero el modelo carece de utilidad práctica fuera de investigación.
- El repositorio ocupa 5,6 GB por los múltiples checkpoints; conviene descargar solo la rama necesaria.
- No se documentan sesgos conocidos, pero el corpus multilingüe reducido puede introducir sesgos de dominio no evaluados.

## Enlaces

- [Hugging Face: AdaptiveChunking/ali_mem-random_s1](https://huggingface.co/AdaptiveChunking/ali_mem-random_s1)
- [Repositorio beetle-hnet en GitHub](https://github.com/suchirsalhan/beetle-hnet)
- Paper de H-Net: no disponible en la información proporcionada
- Demo: no disponible
