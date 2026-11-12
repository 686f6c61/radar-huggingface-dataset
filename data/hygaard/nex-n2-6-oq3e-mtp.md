# Hygaard/Nex-N2.6-oQ3e-mtp

## Resumen

Nex-N2.6-oQ3e-mtp es una conversión comunitaria cuantizada del modelo multimodal Nex-N2.6 de Nex-AGI, publicada por el usuario Hygaard en Hugging Face. El modelo original es un sistema agéntico multimodal construido sobre GLM-5.3-Flash, con aproximadamente 321.000 millones de parámetros totales y una arquitectura de mezcla de expertos (MoE) que incorpora un codificador de visión y una cabeza de predicción multi-token (MTP). Esta versión concreta está pensada para ejecutarse en Macs con Apple Silicon y 192 GB o más de memoria unificada, como los Mac Studio con M2 Ultra.

La conversión aplica cuantización mixta de precisión mediante el formato oQ3e de oMLX, logrando un almacenamiento efectivo de 3,69 bits por peso y un tamaño de 148,35 GB distribuidos en 29 shards. Los expertos enrutados del MoE se almacenan a 3 y 4 bits, mientras que las proyecciones de atención, los expertos compartidos, las proyecciones MLP densas, los embeddings y la cabeza de salida se mantienen a 8 bits; el codificador de visión, las convoluciones de atención lineal y diversos tensores de normalización conservan BF16 o FP32.

La relevancia de esta ficha radica en que permite ejecutar un modelo de escala de 321B parámetros en hardware de consumo de gama alta (Mac Studio), algo imposible con los pesos originales en FP8. No se aplicó entrenamiento adicional, ablación ni poda de expertos: se conserva el conjunto completo de expertos, el codificador de visión y la cabeza MTP. La licencia es Apache 2.0, lo que facilita su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con atención lineal, hiperconexiones y cabeza de predicción multi-token (MTP); basada en GLM-5.3-Flash |
| Parámetros totales | 321.323.031.390 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | oQ3e de precisión mixta (3-bit y 4-bit en expertos enrutados; 8-bit en atención, expertos compartidos, MLP densas, embeddings y cabeza de salida; BF16 en visión y normalizaciones; FP32 en routers, hiperconexiones y controles de decaimiento) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (29 shards, 148,35 GB / 138,16 GiB), group size 64, empaquetado afín |

## Arquitectura y entrenamiento

El modelo base Nex-N2.6 es un transformer de mezcla de expertos (MoE) multimodal derivado de GLM-5.3-Flash. La arquitectura incluye atención lineal con convoluciones dedicadas, hiperconexiones (hyperconnections) con parámetros en FP32, routers MoE con sesgos de corrección, y una cabeza de predicción multi-token (MTP) que permite decodificación especulativa nativa. El codificador de visión (563,6 millones de parámetros en BF16) habilita la entrada image-text-to-text. Los 311.653.564.416 parámetros de los expertos enrutados constituyen la mayor parte del modelo, distribuidos en 45 bloques de texto (bloques 3 a 44 con expertos MoE; bloques 0 a 2 con MLP densas) más un bloque MTP.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. Esta conversión concreta no aplicó entrenamiento adicional, ablación ni poda de expertos: es una cuantización pura del checkpoint FP8 original (`nex-agi/Nex-N2.6@987472298e7867721576ac49a253a6f5b526013e`). La calibración se realizó con 256 muestras de 512 tokens cada una, usando el corpus de código y multilingüe incluido, con verificaciones de cobertura de expertos y estructurales superadas. La herramienta empleada fue el conversor nativo de streaming oQe de oMLX 0.7.4.dev1.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de imagen y texto (pipeline image-text-to-text) gracias al codificador de visión conservado en BF16.
- Razonamiento agéntico y multi-step, según la descripción del modelo base como "multimodal agentic model".
- Predicción multi-token (MTP) para decodificación especulativa y aceleración de inferencia.
- Capacidades de código y multilingües inferidas del corpus de calibración (código y multilingüe), aunque no se detallan los idiomas concretos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Asistentes agénticos locales en Mac Studio: el modelo puede ejecutarse íntegramente en memoria unificada de 192 GB, permitiendo flujos de razonamiento multi-paso y uso de herramientas sin depender de la nube, con la privacidad que ello implica.
- Análisis de documentos con imagen y texto: gracias al codificador de visión, se pueden procesar capturas, diagramas o documentos escaneados junto a instrucciones textuales en un mismo prompt.
- Generación y revisión de código en local: el corpus de calibración incluye código, y el tamaño del modelo (321B) permite abordar tareas de programación complejas en un entorno de desarrollo sin conexión.
- Investigación en cuantización extrema: sirve como caso de estudio para evaluar la degradación de un MoE de 321B a 3,69 BPW efectivos, comparando con el checkpoint FP8 original.
- Prototipado de agentes multimodales: la cabeza MTP y la arquitectura MoE permiten experimentar con decodificación especulativa y enrutamiento de expertos en Apple Silicon.
- Procesamiento por lotes de conversaciones largas: aunque la longitud de contexto no está documentada, el modelo está diseñado para retener estado de contexto en memoria, adecuado para pipelines de atención al cliente o resumen de conversaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 148,35 GB solo para pesos; el autor indica que el estado de runtime y de contexto requiere memoria adicional, por lo que se recomienda un mínimo de 192 GB de memoria unificada.
- Hardware recomendado: Apple Silicon con 192 GB o más, incluyendo Mac Studio con M2 Ultra.
- GPU consumer (NVIDIA/AMD): no aplicable directamente, ya que el formato es MLX safetensors y la librería es mlx; no se documenta soporte para CUDA.
- Opciones de despliegue: MLX (librería nativa), con tooling oMLX 0.7.4.dev1 para la conversión. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Plataforma |
|---|---|---|---|---|---|
| Nex-N2.6-oQ3e-mtp (esta ficha) | 321B | no disponible | oQ3e mixta, 3,69 BPW | Apache 2.0 | Apple Silicon (MLX) |
| nex-agi/Nex-N2.6 (original) | 321B | no disponible | FP8 | Apache 2.0 | no disponible |
| GLM-5.3-Flash (base arquitectónica) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 3 bits en los expertos enrutados puede degradar la calidad respecto al checkpoint FP8 original; no se han publicado evaluaciones comparativas.
- El modelo está diseñado exclusivamente para Apple Silicon con MLX; no es portable a CUDA ni a otros backends sin reconversión.
- Requiere 192 GB o más de memoria unificada, lo que limita su uso a hardware de gama muy alta (Mac Studio M2 Ultra o superior).
- No se documentan los idiomas soportados ni la longitud de contexto, lo que dificulta planificar su uso en producción.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al ser una conversión sin entrenamiento adicional, hereda los sesgos del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del funcionamiento.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y de GLM-5.3-Flash por posibles restricciones adicionales no reflejadas en esta ficha.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/Hygaard/Nex-N2.6-oQ3e-mtp
- Modelo base: https://huggingface.co/nex-agi/Nex-N2.6
- Commit del checkpoint fuente: `nex-agi/Nex-N2.6@987472298e7867721576ac49a253a6f5b526013e`
- Registro de conversión: `CONVERSION.json` (en el repositorio)
- Datos de precisión por módulo: `WEIGHT_PRECISION.csv` y `WEIGHT_PRECISION.json` (en el repositorio)
