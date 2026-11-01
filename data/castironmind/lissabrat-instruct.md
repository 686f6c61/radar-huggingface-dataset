# CastIronMind/LissaBrat-Instruct

## Resumen

LissaBrat-Instruct es un modelo de lenguaje causal de 103 millones de parámetros entrenado desde cero por CastIronMind, un desarrollador independiente, sobre una única GPU de consumo. Se trata del checkpoint supervisado (SFT) de la familia Lissa, afinado específicamente para conversación dirigida por personajes: roleplay, personas y diálogos en el ámbito del fandom de My Little Pony. Su particularidad es que no reutiliza pesos destilados ni backbones ajenos: es una arquitectura Llama completa preentrenada sobre un corpus de fandom y luego supervisada sobre diálogos.

El modelo ocupa solo 206 MB en disco en bfloat16, lo que lo hace apto para portátiles y despliegues en el borde (edge). Ofrece una ventana de contexto de 1.024 tokens y un vocabulario byte-level BPE de 16.384 tokens, dimensiones deliberadamente reducidas para concentrar su capacidad limitada en voz de personaje, coherencia de escena y estilo narrativo de fanfiction.

Su relevancia es más de nicho y demostración técnica que de uso generalista: es un ejemplo interesante de preentrenamiento desde cero viable para un particular, con cuantizaciones GGUF publicadas (de Q8_0 a IQ2) y una demo en navegador para comparar cuantizaciones. Existe también una familia completa: LissaNano (32M) y Lissa 1.5B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (decoder-only, causal LM) |
| Parametros totales | 102.760.704 (103M) |
| Parametros activos | no disponible (no se indica que sea MoE; se asume dense) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | bfloat16 (original); GGUF de Q8_0 a IQ2 en repo derivado |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (206 MB); GGUF disponible en repo aparte |

Detalles adicionales: 8 capas, tamaño oculto 1.024, 32 cabezas de atención con 4 cabezas key/value (GQA), dimensión de cabeza 32, tamaño intermedio 2.730, embeddings atados (tied embeddings), vocabulario de 16.384 tokens byte-level BPE.

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Llama estándar (transformer decoder-only) con grouped-query attention: 32 cabezas de consulta comparten 4 cabezas key/value, lo que reduce el tamaño de la caché KV y beneficia la inferencia en hardware limitado. Los embeddings están atados (la matriz de entrada y salida comparten pesos), una decisión habitual en modelos pequeños que ahorra parámetros dado el vocabulario reducido de 16.384 tokens.

El entrenamiento constó de dos etapas: preentrenamiento desde cero sobre prosa y foros del fandom de My Little Pony, con aproximadamente 1.500 millones de tokens únicos durante dos épocas, seguido de un ajuste supervisado (SFT) sobre diálogos de roleplay y personas con el formato `<system>`/`<user>`/`<assistant>`. No se menciona el uso de RLHF ni DPO. Todo el proceso fue ejecutado por una sola persona en una GPU de consumo, sin soporte institucional.

## Capacidades

- Generación de texto en inglés con estilo de fandom (fanfiction, foros) adquirido en el preentrenamiento.
- Roleplay y interpretación de personajes: el SFT se centró en diálogos con persona, por lo que mantiene voz y carácter de personaje a partir de un system prompt.
- Conversación multi-turno en formato estricto `<system>/<user>/<assistant>` (el system prompt no vacío es obligatorio, ya que todos los ejemplos supervisados lo incluían).
- Texto más largo y coherente que su hermano pequeño LissaNano-Instruct (32M), según la model card.
- Despliegue en el borde: 206 MB en bf16 y cuantizaciones GGUF hasta IQ2.
- No hay evidencia de capacidades de código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso; el modelo no está diseñado para ello.

## Casos de uso

- Roleplay de personajes de fandom: definir una persona en el system prompt (por ejemplo, un personaje de My Little Pony) y conversar en multi-turno; es el caso de uso para el que fue afinado directamente.
- Generación de fanfiction asistida: continuar escenas breves en el estilo de prosa del fandom, aprovechando el corpus de preentrenamiento de 1.500 millones de tokens únicos.
- Bots de personaje en portátiles: con 206 MB de pesos, puede ejecutarse localmente sin GPU dedicada, útil para demos y aplicaciones de escritorio.
- Dispositivos de borde y single-board computers: aunque LissaNano-Instruct (32M) es la variante recomendada para embebidos, LissaBrat-Instruct sigue siendo viable en hardware muy modesto con GGUF IQ2.
- Investigación y educación: como checkpoint denso y pequeño entrenado desde cero, es útil para estudiar preentrenamiento, SFT y efectos de cuantización con coste mínimo.
- Comparación de cuantizaciones: el repo GGUF incluye 15 archivos con perplexity medida frente al checkpoint bf16, ideal para experimentos de compresión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona perplexity medida para cada cuantización GGUF frente al checkpoint bf16, sin valores numéricos concretos.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 206 MB en bfloat16; con GGUF IQ2, por debajo de 100 MB. Cabe con holgura en cualquier GPU moderna e incluso solo en CPU/RAM.
- GPU recomendadas: no se requiere GPU dedicada; cualquier GPU de consumo (incluso integradas) es suficiente. El propio autor lo entrenó en una única GPU de consumo.
- Consumer GPUs: totalmente viable; el modelo está pensado para portátiles y, en su variante GGUF más agresiva, para dispositivos de borde.
- Opciones de despliegue: transformers (PyTorch, sin kernels personalizados ni dependencias exóticas); llama.cpp u Ollama mediante los GGUF publicados; demo en navegador vía el Space Lissa Playground.
- Latencia y throughput: no disponible; dadas las dimensiones (103M, 8 capas, GQA con 4 cabezas KV), la inferencia es muy ligera incluso en CPU.
- Muestreo recomendado: temperature 0.8, top_p 0.9, repetition penalty 1.1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---:|---:|---|---|
| LissaBrat-Instruct | 103M | 1.024 | Apache 2.0 | Roleplay/fandom, desde cero |
| LissaNano-Instruct | 32M | no disponible | Apache 2.0 | Embebidos, móvil |
| Lissa 1.5B Instruct | 1,45B | no disponible | Apache 2.0 | Roleplay completo |
| Qwen2.5-0.5B-Instruct | 494M | 32.768 | Qwen (uso comercial permitido con condiciones) | Generalista multilingüe |

Frente a generalistas pequeños como Qwen2.5-0.5B, LissaBrat-Instruct ofrece un contexto muy corto (1.024 tokens) y capacidades generalistas mínimas, pero un estilo de personaje y fandom muy marcado, pesos más ligeros (206 MB) y licencia Apache 2.0 sin restricciones. Dentro de la propia familia, es el punto medio entre LissaNano (embebidos) y Lissa 1.5B (roleplay con más coherencia).

## Limitaciones y advertencias

- Contexto de solo 1.024 tokens: conversaciones largas o documentos extensos no caben en la ventana.
- Monolingüe en inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea pobre.
- Capacidades generalistas muy limitadas: no está entrenado para código, matemáticas, tool calling ni razonamiento estructurado; esperar alucinaciones y errores factibles frecuentes dada la escala (103M).
- Requiere el formato de prompt exacto con tags concatenados sin espacios y un system prompt no vacío; desviarse del formato degradará la salida.
- El dominio del modelo es el fandom de My Little Pony; fuera de ese estilo, la calidad de generación será inferior a la de generalistas de tamaño similar.
- Sesgos: el corpus de fandom y foros puede contener sesgos y contenido propio de comunidades de fans; no se documenta ningún proceso de alineación más allá del SFT.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque conviene revisar los datos de entrenamiento si el uso es sensible.

## Enlaces

- Modelo: https://huggingface.co/CastIronMind/LissaBrat-Instruct
- Cuantizaciones GGUF: https://huggingface.co/CastIronMind/LissaBrat-Instruct-GGUF
- Demo (Lissa Playground): https://huggingface.co/spaces/CastIronMind/Lissa-Playground
- LissaNano-Base: https://huggingface.co/CastIronMind/LissaNano-Base
- LissaNano-Instruct: https://huggingface.co/CastIronMind/LissaNano-Instruct
- LissaBrat-Base: https://huggingface.co/CastIronMind/LissaBrat-Base
- Lissa 1.5B Instruct: https://huggingface.co/CastIronMind/Lissa-1.5B-Instruct
- Lissa 1.5B Base: https://huggingface.co/CastIronMind/Lissa-1.5B-Base
- Licencia: https://huggingface.co/CastIronMind/LissaBrat-Instruct/blob/main/LICENSE
