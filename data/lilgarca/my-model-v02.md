# Lilgarca/my-model-v02

## Resumen

Cyrah es un modelo multimodal "any-to-any" desarrollado por Juan Ignacio Robledo (usuario Lilgarca en Hugging Face) y publicado bajo el identificador `Lilgarca/my-model-v02`. Se presenta como un modelo entrenado desde cero sobre una arquitectura propia denominada `cyrah` (`CyrahAnyToAnyForConditionalGeneration`), un decodificador híbrido de 14 capas y dimensión oculta de 1024 que combina atención lineal, mezcla de expertos y convoluciones cortas en un único bloque. El modelo declara 247,6 millones de parámetros totales según los pesos en safetensors del repositorio.

La propuesta central es la unificación de todas las modalidades en un único flujo de tokens: texto, audio, imagen, vídeo, 3D y señal comparten un vocabulario plano de 65.536 entradas y una sola cabeza causal, de modo que cualquier modalidad puede condicionar a cualquier otra sin cabezas separadas por modalidad. El modelo se distribuye con codecs neuronales propios (audio RVQ, imagen VQ, nubes gaussianas y series temporales) que convierten señal continua a tokens y viceversa.

Es relevante ahora por su enfoque arquitectónico experimental: reúne en un solo bloque ideas que en la literatura abierta suelen aparecer por separado (Gated DeltaNet, MLA con compresión latente, MoE con enrutado suave, atención con ventana deslizante, RoPE parcial e intercalado). No obstante, el repositorio no incluye datos de benchmarks, licencia declarada ni evidencia de calidad de generación publicada, y el modelo no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `cyrah` (decodificador híbrido con Gated DeltaNet-2, MLA, MoE, convolución corta dual-gate y atención por ventana deslizante) |
| Parametros totales | 247.622.828 |
| Parametros activos | no disponible (la model card indica MoE en la mayoría de capas pero no especifica parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | es, en |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers, requiere `trust_remote_code=True`) |
| Vocabulario | 65.536 tokens (texto, audio, imagen/vídeo, 3D, señal y especiales) |
| Capas | 14 |
| Dimension oculta | 1024 |
| Modalidades | 95 (texto, audio, imagen, vídeo, 3D, ciencia, meta y conversiones) |
| Tamano del repositorio | 7,6 GB |

## Arquitectura y entrenamiento

El backbone es un decodificador híbrido de 14 capas con dimensión oculta de 1024. La model card describe un plan de capas que alterna convolución corta y atención completa, con atención lineal (Gated DeltaNet-2) y atención deslizante disponibles por configuración. La MLP es densa en la primera capa y mezcla de expertos en el resto, con enrutado suave basado en sqrtsoftplus y sigmoid. Entre los componentes declarados figuran Attention Residuals (camino residual por capa sobre la salida de atención), RoPE parcial con QK-norm, XSA (atención con estado extra compartido entre cabezas), MLA con compresión latente de la caché KV, un indexador DSA para selección dispersa de claves, RoPE intercalado, proyección única para clave y valor (K == V) y softcapping de logits mediante `tanh`.

El entrenamiento se describe como "autónomo y continuo" sobre datasets reales de Hugging Face (chat, razonamiento, matemáticas, tool calling y conocimiento) más un corpus sintético de identidad. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste por preferencias. El tokenizer de texto se reutiliza sin modificaciones y los rangos de modalidad se recortan de la cola del vocabulario, de forma que el embedding y la cabeza de salida permanecen atados. Los codecs neuronales (audio, imagen, gaussianas y señal) requieren un entrenamiento de reconstrucción propio, que la model card indica que se reserva dentro del bucle autónomo.

## Capacidades

- Generación de texto, razonamiento explícito mediante ` thinking` ... `</think>`, código, matemáticas, traducción, OCR, tablas y grafos.
- Tool calling con el formato `<|tool_call_start|>[fn(arg='valor')]<|tool_call_end|>`.
- Generación de audio: voz (TTS), música y efectos, además de edición de audio.
- Generación y edición de imagen: inpaint, upscale, restauración, estilo, mapas de profundidad y normales.
- Generación de vídeo a partir de secuencias de fotogramas codificados con el codec de imagen.
- Modalidades 3D: nubes de puntos gaussianas y mallas.
- Modalidades de señal: series temporales, sensores y acciones.
- Conversión entre modalidades ("any-to-any"): entrada y salida pueden ser de cualquier tipo.
- Control de calidad por petición mediante el parámetro `quality` (`auto`, `minimo`, `bajo`, `medio`, `alto`, `maximo`), que ajusta codebooks de audio, rejilla de imagen, fotogramas y FPS de vídeo, tokens gaussianos, tokens de señal, `top_k` y pasos de entrenamiento.
- Multilingüe limitado a español e inglés.
- Identidad propia declarada: responde llamarse Cyrah y atribuye su creación a Juan Ignacio Robledo.

## Casos de uso

- Prototipado de investigación en arquitecturas híbridas: el modelo sirve como banco de pruebas para evaluar la combinación de Gated DeltaNet-2, MLA, MoE y convolución corta en un mismo bloque, con un tamaño de 247 M parámetros que permite iterar en hardware modesto.
- Experimentación multimodal unificada: investigadores que quieran probar un flujo único de tokens para texto, audio e imagen pueden usar los métodos `image_to_tokens`, `audio_to_tokens` y `generate_any` para construir pipelines any-to-any sin cabezas separadas.
- Generación de voz sintética controlada: mediante `CyrahAudioCodec` (24 kHz, 75 tokens/s por codebook) se puede experimentar con TTS y edición de audio, siempre que el codec se haya entrenado previamente en reconstrucción.
- Aplicaciones de asistente conversacional bilingüe (es/en) con razonamiento explícito y tool calling, integrando el modelo en un orquestador que interprete los bloques ` thinking` y `<|tool_call_start|>`.
- Generación y edición de imágenes de baja resolución: el `CyrahImageCodec` opera a 128x128 px con rejilla 16x16 y 256 tokens por imagen, adecuado para pruebas de concepto de generación, inpaint o upscale en entornos de investigación.
- Conversión entre modalidades en flujos creativos: por ejemplo, describir una escena en texto y obtener tokens de imagen o de audio, o transformar una serie temporal en una representación textual, usando `generate_any` y `decode_any`.
- Docencia y divulgación: el código y la configuración permiten ilustrar cómo se diseña un vocabulario multimodal plano y cómo se acoplan codecs neuronales a un decodificador causal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 247,6 M parámetros, los pesos en fp16 ocupan aproximadamente 0,5 GB y en fp32 alrededor de 1 GB; a ello hay que sumar la caché KV y los codecs neuronales, por lo que una GPU consumer con 4-8 GB debería ser suficiente para el backbone. No se dispone de cifras oficiales de VRAM.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) debería poder cargar el modelo; para entrenamiento o generación de vídeo con muchos fotogramas se recomiendan A100 o H100.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de tarjetas con 8 GB o más, aunque la model card no publica requisitos oficiales.
- Opciones de despliegue: la librería declarada es `transformers` con `trust_remote_code=True`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al no haber pesos GGUF la inferencia en CPU requeriría conversión manual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cyrah (`Lilgarca/my-model-v02`) | 247,6 M | no disponible | Texto, audio, imagen, vídeo, 3D, señal (95 modalidades) | no disponible | Hugging Face, transformers con código remoto |
| Qwen2.5-Omni (7B) | 7 B aprox. | 32 K aprox. (no confirmado en esta ficha) | Texto, audio, imagen, vídeo | Apache 2.0 (según versión) | Hugging Face, vLLM, transformers |
| Llama 3.2 1B | 1,2 B | 128 K | Texto | Llama 3.2 Community License | Hugging Face, llama.cpp, Ollama, vLLM |
| SmolVLM-256M | 256 M | 8 K aprox. | Texto e imagen | Apache 2.0 | Hugging Face, transformers |

La comparación es orientativa: Cyrah es el único de la lista que declara un vocabulario unificado para audio, imagen, vídeo y 3D, pero también el único sin benchmarks publicados ni licencia declarada, lo que limita su comparación directa en rendimiento.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks, por lo que no hay evidencia cuantitativa de calidad en ninguna modalidad.
- La licencia no está declarada, lo que impide determinar si el uso comercial está permitido; en producción debe tratarse como no autorizado hasta que el autor la especifique.
- El modelo tiene 247,6 M parámetros, un tamaño muy reducido para tareas de razonamiento complejo, código o matemáticas; es probable que su rendimiento quede por debajo de modelos de 7 B o más en esas áreas.
- Los codecs de audio e imagen necesitan un entrenamiento de reconstrucción propio antes de que las salidas sean inteligibles; sin ese paso, las modalidades no textuales pueden producir resultados degenerados.
- La longitud de contexto no está documentada, lo que dificulta planificar conversaciones multi-turno o documentos largos.
- El soporte multilingüe se limita a español e inglés; no hay evidencia de otros idiomas.
- Riesgo de alucinación y de respuestas de identidad inventadas: la model card menciona un corpus sintético de identidad, lo que puede sesgar las respuestas sobre sí mismo.
- El uso requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de desplegarlo.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria ni informes independientes.
- La fecha de creación indicada (2026-11-07) es futura respecto al momento habitual de consulta, lo que puede indicar un error en los metadatos o una publicación programada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lilgarca/my-model-v02
- Perfil del autor: https://huggingface.co/Lilgarca
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
