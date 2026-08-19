# litert-community/Zamba2-2.7B-instruct

## Resumen

Zamba2-2.7B-instruct es un modelo de lenguaje de 2.700 millones de parámetros desarrollado por Zyphra, convertido al formato LiteRT-LM (`.litertlm`) por la comunidad `litert-community` para su ejecución en dispositivos móviles y de borde. Se trata de una arquitectura híbrida que combina un backbone Mamba2 de selective scan con dos bloques transformer compartidos, aplicados alternadamente en nueve posiciones intercaladas, con adaptadores LoRA específicos por posición. Esta conversión permite ejecutar el modelo con el runtime LiteRT-LM de Google, tanto en CPU como en GPU, con una huella de memoria reducida gracias a la cuantización int8 dinámica.

El modelo resuelve el problema de ejecutar un LLM de tamaño medio en hardware de consumo y dispositivos móviles, manteniendo una calidad de generación razonable y un rendimiento aceptable para tareas de texto. Su relevancia actual radica en que es una de las primeras conversiones de la familia Zamba2 a un runtime móvil, demostrando la viabilidad de los modelos híbridos SSM+atención en entornos con recursos limitados. La licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba2 (selective scan) + 2 bloques transformer compartidos con LoRA por posición |
| Parametros totales | 2.700 millones (2.7B) |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens (mencionado en notas de GPU) |
| Tipos de cuantizacion | int8 dinámico en lineales y embedding; convs y scan en float32; activaciones fp32 en GPU |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM) |

## Arquitectura y entrenamiento

La arquitectura de Zamba2-2.7B es un híbrido que combina un backbone de 54 capas Mamba2 (selective scan) con dos bloques transformer compartidos. Estos bloques se aplican alternadamente en nueve posiciones intercaladas, reutilizando los mismos pesos de atención y MLP en cada posición, pero especializados mediante adaptadores LoRA en el MLP. La atención opera sobre la concatenación del estado oculto recurrente y las embeddings originales, sin usar rotary embedding en este tamaño. Esta configuración reduce significativamente el número de parámetros en comparación con un transformer denso equivalente, manteniendo la capacidad de modelar dependencias de largo alcance.

El entrenamiento del modelo base fue realizado por Zyphra, aunque no se dispone de detalles específicos sobre el dataset o el proceso de entrenamiento en la información proporcionada. La conversión a LiteRT-LM incluye varias innovaciones técnicas: el selective scan se reexpresa como matmuls por lotes con ejes de chunk y head plegados en el eje de batch, lo que permite delegar completamente el grafo en GPU; se corrige la asignación de `block_id` por orden de ocurrencia híbrida (un fallo en `transformers` actual); y se implementa un manejo especial del clamp de `dt` para evitar la decaimiento del estado recurrente en posiciones de padding. El modelo exportado incluye seis firmas de prefill (1024, 256, 64, 16, 4, 1) para que el runtime seleccione tamaños de chunk ajustados.

## Capacidades

- Generación de texto en lenguaje natural, con soporte de ChatML como plantilla de chat.
- Razonamiento y respuesta a preguntas factuales, como demuestra el sanity gate de 8 preguntas con 8/8 aciertos en todas las configuraciones probadas.
- Capacidad de manejar contextos de hasta 4096 tokens, suficiente para conversaciones multi-turno y documentos de tamaño medio.
- Inferencia en dispositivos móviles y de borde gracias a la cuantización int8 y al formato LiteRT-LM.
- Ejecución tanto en CPU como en GPU (en plataformas compatibles, como Apple Silicon).
- No se mencionan capacidades de tool calling, agentes, visión o audio en la información disponible.

## Casos de uso

- Asistentes conversacionales en el dispositivo: el modelo puede gestionar diálogos multi-turno con su ventana de 4096 tokens, ejecutándose localmente en un smartphone sin conexión a internet, lo que garantiza privacidad y baja latencia (aunque la velocidad de decodificación en CPU móvil es limitada, ~3.6 tok/s).
- Generación de texto en aplicaciones de productividad: redacción de correos, resúmenes de notas o borradores de documentos directamente en el dispositivo, aprovechando la licencia Apache 2.0 para integración comercial.
- Clasificación y extracción de información en entornos con restricciones de hardware: el modelo puede ejecutarse en mini-PCs, Raspberry Pi (con suficiente RAM) o portátiles modestos gracias a su tamaño de 2.8 GB y cuantización int8.
- Prototipado rápido de aplicaciones de IA generativa: los desarrolladores pueden usar el runtime LiteRT-LM para integrar el modelo en aplicaciones Android o iOS sin depender de servicios en la nube.
- Investigación académica sobre modelos híbridos SSM+atención: al ser de código abierto y con una arquitectura inusual, sirve como banco de pruebas para estudiar el comportamiento de atención compartida y selective scan en tareas de generación.
- Despliegue en entornos con GPU limitada: en un Mac con Apple Silicon, el modelo alcanza 43.6 tok/s de decodificación en GPU, lo que permite uso interactivo en aplicaciones de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento son los proporcionados por el autor de la conversión, que se resumen a continuación:

| Entorno | Backend | Prefill (256 tokens) | Decode | TTFT |
|---|---|---|---|---|
| Apple M4 Max | GPU | 603 tok/s | 43.6 tok/s | 0.45 s |
| Apple M4 Max | CPU | 282 tok/s | 14.7 tok/s | 0.97 s |
| iPhone 17 Pro (12 GB) | CPU | 14.3 tok/s | 3.6 tok/s | 10.2 s |

Además, se reporta una paridad de logits con el modelo PyTorch original (correlación media por posición de 1.0000, KL ≈ 0) y un sanity gate de 8/8 en todas las configuraciones probadas.

## Requisitos de hardware

- Tamaño del archivo: 2.80 GB (int8 dinámico).
- VRAM estimada para inferencia en GPU: alrededor de 11 GB en GPU con activaciones fp32 (proyección basada en la medición de 3.98× el tamaño del archivo en el modelo 1.2B). En CPU, el pico de memoria en iPhone fue de 2.19 GB.
- GPU recomendadas: Apple Silicon (M4 Max probado), GPU de escritorio con al menos 12 GB de VRAM (aunque no se han probado explícitamente). En smartphones, solo CPU; la GPU Metal no funciona en dispositivos con 12 GB de RAM.
- No cabe en GPUs de consumo con menos de 8 GB de VRAM si se usan activaciones fp32; podría caber con cuantización más agresiva o activaciones de menor precisión (no probado).
- Opciones de despliegue: runtime LiteRT-LM (versión ≥ 0.15), que soporta backends CPU y GPU (Metal en Mac, probablemente CUDA en Linux, aunque no se menciona).
- Latencia y throughput: en Mac M4 Max, TTFT de 0.45 s en GPU y 0.97 s en CPU; en iPhone, TTFT de 10.2 s, lo que limita su uso a tareas no interactivas.

## Comparativa con modelos similares

El modelo comparable más cercano es el Zamba2-1.2B, también convertido a LiteRT-LM por la misma comunidad. No se dispone de datos de otros modelos similares en la información proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento en iPhone CPU |
|---|---|---|---|---|---|
| Zamba2-2.7B-instruct (LiteRT-LM) | 2.7B | 4096 | Apache 2.0 | .litertlm | 3.6 tok/s decode |
| Zamba2-1.2B (LiteRT-LM) | 1.2B | no disponible | Apache 2.0 | .litertlm | no disponible (mencionado como alternativa para Metal en móvil) |

No se dispone de comparaciones con otros modelos de tamaño similar (p. ej., Qwen2.5-3B, SmolLM2-1.7B) en la información proporcionada.

## Limitaciones y advertencias

- No se han documentado sesgos específicos del modelo, pero al ser una conversión de un modelo entrenado por Zyphra, podría heredar sesgos de su dataset de entrenamiento, que no se detalla.
- Riesgo de alucinación: no se ha evaluado formalmente; el sanity gate solo cubre 8 preguntas factuales básicas.
- Limitaciones de idioma: no se especifican los idiomas soportados; el modelo base probablemente está entrenado principalmente en inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero se debe mantener el aviso de copyright.
- Limitación de hardware: en smartphones con 12 GB de RAM, la GPU Metal no puede ejecutar este tamaño; solo CPU, con una velocidad de decodificación muy baja (3.6 tok/s) y un TTFT de 10 segundos, lo que lo hace inadecuado para aplicaciones interactivas en móvil.
- Dependencia del runtime: requiere litert-lm ≥ 0.15 y el formato `.litertlm` no es compatible con otros frameworks (transformers, llama.cpp, etc.) sin reconversión.
- Problema conocido en `transformers`: las versiones actuales no pueden cargar checkpoints de Zamba2 de dos bloques; la conversión incluye un parche estructural que debe mantenerse si se quiere reproducir el proceso.

## Enlaces

- Repositorio HuggingFace del modelo convertido: https://huggingface.co/litert-community/Zamba2-2.7B-instruct
- Modelo base original de Zyphra: https://huggingface.co/Zyphra/Zamba2-2.7B-instruct
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Herramienta de conversión litert-torch: https://github.com/google-ai-edge/litert-torch
- Script de conversión y parche (john-rocky/hf-to-litertlm): https://github.com/john-rocky/hf-to-litertlm
