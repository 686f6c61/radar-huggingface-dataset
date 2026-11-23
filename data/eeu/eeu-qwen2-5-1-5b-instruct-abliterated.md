# EEU/EEU-Qwen2.5-1.5B-Instruct-abliterated

## Resumen

EEU-Qwen2.5-1.5B-Instruct-abliterated es una versión modificada del modelo Qwen2.5-1.5B-Instruct de Alibaba, publicada por el usuario EEU en Hugging Face. La modificación consiste en una "abliteración" (directional ablation) aplicada sobre la dirección de rechazo en el flujo residual del transformer, con el objetivo de eliminar el mecanismo de rechazo aprendido durante el alineamiento y obtener un modelo que responda directamente a instrucciones que el modelo original rechazaría.

El modelo conserva la arquitectura y los pesos base de Qwen2.5-1.5B-Instruct, un transformer decoder-only denso de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones), con capacidades de instrucción bilingües inglés-chino. Se distribuye principalmente en formato GGUF cuantizado para inferencia local en CPU, Apple Silicon y dispositivos de borde.

Su relevancia es doble: por un lado, ofrece un modelo de 1,5B extremadamente ligero que cabe en hardware muy modesto; por otro, ilustra la técnica de abliteración aplicada a un modelo pequeño, un área de interés para investigación sobre alineamiento, seguridad y robustez de modelos. La licencia Apache 2.0 del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta hasta 32.768 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | GGUF: Q4_K_M (986 MB), Q5_K_M (1,13 GB) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only denso con atención de múltiples cabezas, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El modelo base fue entrenado por Alibaba con un corpus multilingüe (predominantemente inglés y chino) y posteriormente alineado mediante instrucción y preferencias (SFT y optimización de preferencias) para comportamiento conversacional.

La modificación introducida por EEU consiste en una abliteración: se calcula una "dirección de rechazo" en el espacio de activaciones del flujo residual a partir de pares de prompts que provocan y no provocan rechazo, y se proyecta ortogonalmente esa dirección fuera de los pesos de las capas correspondientes. El resultado es un modelo que mantiene las capacidades del original pero con el mecanismo de rechazo atenuado o eliminado. No se dispone de información sobre el número de tokens adicionales, datasets de abliteración ni proceso de validación empleado.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Seguimiento de instrucciones (instruction following) heredado del modelo base.
- Razonamiento básico y resolución de problemas sencillos propios de un modelo de 1,5B.
- Generación de código y explicaciones técnicas a nivel básico-intermedio.
- Respuestas directas a prompts que el modelo original rechazaría (contenido sin censura de rechazo).
- Plantilla de chat embebida en los metadatos del GGUF.
- No se documenta soporte de tool calling, function calling, agentes o modo thinking en la información proporcionada.
- No se documenta soporte de visión ni audio.

## Casos de uso

- Inferencia local en CPU: el cuantizado Q4_K_M (986 MB) permite ejecutar el modelo en portátiles sin GPU dedicada mediante llama.cpp u Ollama, con latencia aceptable para generación de texto corto.
- Despliegue en dispositivos de borde (Raspberry Pi, mini-PC, Apple Silicon): el tamaño reducido y el formato GGUF lo hacen adecuado para asistentes locales sin conexión.
- Experimentación en investigación sobre alineamiento y abliteración: sirve como caso de estudio controlado para medir el efecto de la ablación direccional en un modelo pequeño y comparar con el original.
- Generación de texto creativo sin restricciones de rechazo: útil en entornos de escritura donde el modelo original bloquearía ciertos temas, siempre con supervisión humana.
- Prototipado rápido de chatbots bilingües inglés-chino: la ventana de contexto del modelo base y el soporte de ambos idiomas permiten iterar en demos locales.
- Pruebas de robustez y red-teaming: permite evaluar cómo cambia el comportamiento de un modelo alineado tras eliminar su dirección de rechazo, como paso previo a estudiar modelos mayores.
- Filtrado y clasificación de texto ligera: con prompts adecuados puede usarse para tareas de etiquetado simple en pipelines de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM para Q4_K_M: aproximadamente 1 GB de memoria; recomendable al menos 2 GB libres para contexto y overhead.
- VRAM/RAM para Q5_K_M: aproximadamente 1,2 GB de memoria; recomendable al menos 2,5 GB libres.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.); también funciona en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna e incluso en iGPU y Apple Silicon.
- Opciones de despliegue: llama.cpp, Ollama (etiqueta `hf.co/EEU/Qwen2.5-1.5B-Instruct-abliterated:Q5_K_M`), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la información proporcionada; en CPU se espera generación de decenas de tokens por segundo en hardware moderno, pero no se confirma.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| EEU-Qwen2.5-1.5B-Instruct-abliterated | 1,54B | no disponible | en, zh | Apache 2.0 | GGUF |
| Qwen/Qwen2.5-1.5B-Instruct (base) | 1,54B | 32.768 tokens (según documentación oficial del base) | en, zh y otros | Apache 2.0 | safetensors, GGUF |
| Otros modelos abliterated de ~1,5B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con el modelo base Qwen2.5-1.5B-Instruct: misma arquitectura y parámetros, pero con el mecanismo de rechazo intacto y pesos oficiales en safetensors. No se dispone de datos de benchmarks para comparar rendimiento entre ambos en esta ficha.

## Limitaciones y advertencias

- La abliteración elimina o atenúa el rechazo, lo que implica que el modelo puede generar contenido dañino, ofensivo o inexacto sin filtro; requiere supervisión y políticas de uso en producción.
- Riesgo elevado de alucinación, acentuado por el tamaño reducido (1,5B) del modelo.
- Capacidad de razonamiento y conocimiento limitada en comparación con modelos de mayor tamaño; no apto para tareas que exijan alta precisión factual.
- Soporte lingüístico restringido a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo abliterado; el usuario asume la responsabilidad legal y ética del contenido generado.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validación comunitaria; no hay evidencia de pruebas exhaustivas de calidad.
- No se documentan procesos de evaluación de sesgos ni de seguridad posteriores a la abliteración.
- El contexto máximo no se confirma en la información disponible; no asumir los 32.768 tokens del base sin verificar.

## Enlaces

- Hugging Face: https://huggingface.co/EEU/EEU-Qwen2.5-1.5B-Instruct-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
