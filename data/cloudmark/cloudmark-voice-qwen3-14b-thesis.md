# cloudmark/cloudmark-voice-qwen3-14b-thesis

## Resumen

cloudmark-voice-qwen3-14b-thesis es un adaptador LoRA para el modelo base Qwen/Qwen3-14B-Base, desarrollado por el usuario cloudmark. Su funcion es reescribir prosa neutra en el estilo de un autor concreto, combinando textos de un blog personal publicados entre 2016 y 2021 con fragmentos de una tesis de master de 2011. No es un modelo completo, sino un adaptador PEFT que se aplica sobre los pesos del modelo base y que continua el entrenamiento de un adaptador previo (YixuanEvenXu/Qwen3-14B-Base-HIP-adapter).

El modelo aborda el problema del transfer de estilo y la parafrasis autoral: dado un parrafo neutro generado por un modelo de chat, produce una version con rasgos estilisticos medibles del autor (uso de pronombres, puntuacion, solapamiento lexico). Es relevante en el contexto de la investigacion sobre deteccion de texto generado por IA, ya que el autor documenta metricas estilisticas y advierte de que el adaptador no ha sido evaluado por detectores comerciales.

La arquitectura subyacente es la del modelo Qwen3-14B-Base, un transformer denso de 14.000 millones de parametros, sobre el que se anade un adaptador LoRA de rango 128. El repositorio ocupa 2,1 GB y se distribuye bajo licencia Apache 2.0. El entrenamiento se realizo en una pasada sobre 466 pares de entrenamiento (unos 28.000 palabras del autor).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen3-14B-Base |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 14.000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-14B-Base) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors de 32 bits) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3-14B-Base, un transformer denso de 14.000 millones de parametros. La innovacion no reside en la arquitectura del modelo base, sino en el procedimiento de ajuste: se parte del adaptador YixuanEvenXu/Qwen3-14B-Base-HIP-adapter (Xu et al., "Base Models Look Human To AI Detectors", 2026) y se continua el entrenamiento con pares de parafrasis estilistica. La configuracion LoRA emplea rango 128 y se ejecuto en una sola pasada con tasa de aprendizaje 5e-5, schedule coseno, 3% de warm-up, batch efectivo de 4 y precision de 32 bits sobre una GPU de Apple.

Los datos de entrenamiento consisten en 466 pares (entrada: parafrasis neutra generada por un modelo de chat; objetivo: parrafo original del autor). De ellos, 328 pares provienen de 22 entradas del blog publicadas entre 2016 y 2021, y 138 pares de la tesis de master de 2011 "Face Identification in Multimedia Archives". Se reservaron 70 pares para evaluacion (50 del blog, 20 de la tesis). La perdida sobre los 50 parrafos del blog retenidos fue de 1,006 para el adaptador de partida, 0,808 para el adaptador solo-blog y 0,799 para este adaptador (0,837 tras una segunda pasada, que no se publica).

## Capacidades

- Generacion de texto con transfer de estilo autoral: reescribe prosa neutra imitando rasgos medibles del autor (frecuencia de "we" y "you", uso de signos de exclamacion, solapamiento lexico).
- Parafrasis controlada: convierte texto de entrada en una variante estilistica manteniendo el contenido general.
- Razonamiento y generacion general heredados del modelo base Qwen3-14B-Base (no evaluados especificamente en este adaptador).
- Soporte de tool calling y function calling: no documentado para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado para este adaptador.
- Capacidades multilingues: no documentadas; el entrenamiento se realizo con textos en ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion en transfer de estilo: usar el adaptador como referencia reproducible para estudiar como un LoRA de rango 128 modifica rasgos estilisticos medibles sobre un modelo base de 14.000 millones de parametros.
- Estudio de deteccion de texto generado por IA: generar corpus con estilo autoral para evaluar la robustez de detectores como GPTZero, dado que el autor documenta que el adaptador solo-blog obtuvo 100% de clasificacion como IA.
- Analisis forense de autoria: comparar metricas estilisticas (pronombres, puntuacion, solapamiento lexico) de textos sospechosos frente a la salida del adaptador para calibrar herramientas de atribucion.
- Docencia en etica de la IA: ilustrar en clase como un adaptador pequeno puede aproximar el estilo de un autor y por que existen restricciones de uso en integridad academica.
- Experimentacion con PEFT: servir de ejemplo de continuacion de entrenamiento sobre un adaptador existente (HIP-adapter) y de evaluacion con perdida sobre conjuntos retenidos.
- Reproduccion de resultados: validar las cifras publicadas (perdida 0,799; "we" 26,5 por 1.000 palabras; solapamiento 0,667) sobre los mismos 50 parrafos retenidos del blog.

## Benchmarks y rendimiento

El autor no publica benchmarks estandar (MMLU, HumanEval, GSM8K). Si documenta metricas estilisticas sobre 50 parrafos retenidos del blog:

| Metrica | Texto fuente | Solo blog | Este adaptador | El autor |
|---|---|---|---|---|
| "we" por 1.000 palabras | 5,1 | 23,9 | 26,5 | 29,5 |
| "you" por 1.000 palabras | 0,0 | 6,3 | 2,6 | 2,6 |
| Signos de exclamacion por 1.000 palabras | 0,0 | 2,1 | 0,4 | 0,7 |
| Palabras compartidas con el parrafo real | 0,600 | 0,651 | 0,667 | 1,000 |

Perdida sobre los 50 parrafos retenidos del blog: 1,006 (adaptador de partida), 0,808 (solo blog), 0,799 (este adaptador, pasada 1) y 0,837 (pasada 2).

## Requisitos de hardware

- VRAM estimada: depende del modelo base Qwen3-14B-Base, no del adaptador (2,1 GB en disco). En fp16 el modelo base requiere aproximadamente 28 GB; en cuantizacion de 8 bits, unos 15 GB; en 4 bits, unos 9-10 GB.
- GPU recomendadas: A100 40/80 GB o H100 para fp16 sin cuantizar; RTX 4090 (24 GB) para fp16 con offloading parcial o cuantizacion 8 bits; RTX 3090/4080 para cuantizacion 4 bits.
- Cabe en GPU de consumo: si, con cuantizacion de 4 u 8 bits en GPUs de 12-24 GB.
- Opciones de despliegue: vLLM, TGI y llama.cpp (requiere fusionar el adaptador con el modelo base y convertir a GGUF); Ollama mediante el mismo procedimiento de fusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cloudmark-voice-qwen3-14b-thesis | LoRA sobre 14B | no disponible | Transfer de estilo autoral | Apache 2.0 | Hugging Face |
| cloudmark/cloudmark-voice-qwen3-14b | LoRA sobre 14B | no disponible | Transfer de estilo (solo blog) | Apache 2.0 | Hugging Face |
| YixuanEvenXu/Qwen3-14B-Base-HIP-adapter | LoRA sobre 14B | no disponible | Adaptador de partida (Xu et al., 2026) | no disponible | Hugging Face |
| Qwen/Qwen3-14B-Base | 14B denso | no disponible | Modelo base generalista | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- El propio autor advierte de que el adaptador cambia hechos: toda cifra o afirmacion debe verificarse contra el texto fuente.
- No ha sido evaluado por detectores de texto IA; el adaptador solo-blog obtuvo 100% de clasificacion como IA en GPTZero tras una pasada.
- Uso previsto restringido a investigacion y estudio de transfer de estilo y deteccion de texto IA; los autores del adaptador de partida piden no emplearlo para evadir sistemas de integridad academica, autoria o procedencia.
- No debe usarse para presentar texto maquinico como escrito por el autor original ni por el usuario.
- Entrenado con solo 466 pares y unas 28.000 palabras: cobertura estilistica limitada y riesgo de sobreajuste al corpus del autor.
- Idiomas soportados no documentados; el corpus de entrenamiento esta en ingles.
- Sesgos conocidos: no documentados.
- Riesgo de alucinacion: no cuantificado, pero relevante dado que el adaptador modifica hechos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cloudmark/cloudmark-voice-qwen3-14b-thesis
- Adaptador solo-blog: https://huggingface.co/cloudmark/cloudmark-voice-qwen3-14b
- Adaptador de partida: https://huggingface.co/YixuanEvenXu/Qwen3-14B-Base-HIP-adapter
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B-Base
- Blog del autor: https://cloudmark.github.io
- Paper de referencia citado: Xu et al., "Base Models Look Human To AI Detectors", 2026 (sin URL disponible)
