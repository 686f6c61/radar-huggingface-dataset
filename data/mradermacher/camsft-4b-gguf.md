# mradermacher/CamSFT-4B-GGUF

## Resumen

CamSFT-4B-GGUF es una versión cuantizada en formato GGUF del modelo CamSFT-4B, desarrollado originalmente por ddz16. El modelo base está especializado en comprensión de vídeo y análisis de movimiento de cámara, y se basa en la arquitectura Qwen3-VL, un modelo multimodal de visión y lenguaje. La cuantización ha sido realizada por mradermacher, un conocido proveedor de modelos GGUF, con el objetivo de facilitar la ejecución en entornos locales con recursos limitados.

El modelo está diseñado para tareas que requieren entender secuencias de vídeo y los movimientos de cámara asociados, lo que lo hace relevante para aplicaciones de análisis de vídeo, robótica, vigilancia o generación de descripciones automáticas. Aunque la información pública es escasa, el modelo se presenta como una opción ligera y de código abierto (licencia Apache 2.0) para quienes necesiten capacidades multimodales de vídeo sin depender de servicios en la nube.

El repositorio contiene únicamente los pesos cuantizados en GGUF, incluyendo un proyector multimodal (mmproj) necesario para procesar entradas de vídeo. No se dispone de detalles sobre el contexto máximo, el número exacto de parámetros (el nombre sugiere 4B, pero los metadatos de safetensors indican 415M) ni el proceso de entrenamiento más allá de un ajuste fino supervisado (SFT).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3-VL (multimodal visión-lenguaje) |
| Parametros totales | 415.347.712 (según safetensors; el nombre del modelo sugiere 4B, posible discrepancia) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS (según model card) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base CamSFT-4B se construye sobre Qwen3-VL, una familia de modelos multimodales que combina un codificador visual con un transformador de lenguaje. Está específicamente ajustado mediante supervisión (SFT) para tareas de comprensión de vídeo y movimiento de cámara, lo que implica que ha sido entrenado con datos que asocian secuencias de vídeo con descripciones o anotaciones sobre el movimiento de cámara.

No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas adicionales como RLHF o DPO. La cuantización GGUF realizada por mradermacher es estática (sin imatrix), lo que puede implicar una ligera pérdida de calidad respecto a los pesos originales, aunque los formatos IQ (como IQ4_XS) suelen ofrecer mejor relación calidad-tamaño.

## Capacidades

- Comprensión de vídeo: procesa secuencias de vídeo para extraer información semántica y contextual.
- Análisis de movimiento de cámara: identifica y describe movimientos como paneos, zooms, travelling, etc.
- Generación de texto a partir de vídeo: puede producir descripciones o respuestas basadas en el contenido visual.
- Multimodalidad: integra visión y lenguaje, permitiendo interacción en inglés.
- Ligereza: al estar cuantizado en GGUF, es ejecutable en hardware modesto.
- No se mencionan capacidades de tool calling, agentes o razonamiento multi-paso.

## Casos de uso

- Análisis de vídeo para producción audiovisual: un editor puede usar el modelo para generar automáticamente metadatos sobre los movimientos de cámara en un clip, facilitando la organización de material en postproducción.
- Vigilancia y seguridad: el modelo puede describir el movimiento de cámaras en sistemas de CCTV, ayudando a identificar patrones anómalos o eventos relevantes.
- Robótica y navegación autónoma: en robots con cámaras, el modelo puede interpretar el movimiento propio y del entorno para tomar decisiones de control.
- Generación de subtítulos descriptivos para vídeos: a partir de un vídeo, el modelo puede producir una narración que incluya detalles sobre el movimiento de cámara, útil para accesibilidad o indexación.
- Entrenamiento de modelos de vídeo: como generador de datos sintéticos o anotaciones automáticas para otros sistemas.
- Investigación en visión por computador: los investigadores pueden emplearlo como baseline para experimentos de comprensión de vídeo o como componente en pipelines de análisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El tamaño del repositorio es de 1,3 GB, lo que incluye los archivos GGUF y los proyectores multimodales. Esto sugiere que los pesos cuantizados ocupan menos de 1 GB para el modelo principal.
- Con 415M parámetros (o incluso si fuesen 4B en cuantización Q4), la VRAM necesaria para inferencia se estima entre 1 y 4 GB, dependiendo del tipo de cuantización y de la longitud de la secuencia de vídeo.
- Es ejecutable en GPUs de consumo como NVIDIA GTX 1060 (6 GB), RTX 2060, RTX 3060, o incluso en CPU con suficiente RAM mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, o cualquier runtime compatible con GGUF.
- La latencia dependerá del hardware y de la longitud del vídeo; no se dispone de cifras concretas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de comprensión de vídeo. El modelo base CamSFT-4B no tiene una página pública con benchmarks, y no se han encontrado referencias a modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés, lo que limita su uso en entornos multilingües.
- La información pública es muy limitada: no se conocen detalles sobre sesgos, riesgos de alucinación o comportamiento en casos extremos.
- Al ser una cuantización estática (sin imatrix), puede haber una degradación de calidad en comparación con los pesos originales, especialmente en tareas que requieren precisión numérica.
- El número de parámetros reportado (415M) contradice el nombre del modelo (4B), lo que sugiere un posible error en los metadatos; esto debe verificarse antes de asumir el tamaño real.
- No se ha documentado la longitud de contexto ni el número máximo de fotogramas de vídeo procesables, lo que puede afectar a aplicaciones con secuencias largas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales no reflejadas en esta cuantización.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/CamSFT-4B-GGUF
- Modelo base: https://huggingface.co/ddz16/CamSFT-4B
- Perfil del autor de la cuantización: https://huggingface.co/mradermacher
