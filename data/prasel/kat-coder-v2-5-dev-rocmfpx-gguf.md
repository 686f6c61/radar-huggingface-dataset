# prasel/KAT-Coder-V2.5-Dev-ROCmFPX-GGUF

## Resumen

Este repositorio contiene una conversión a formato GGUF del modelo KATCoder-2.5-Dev, un modelo de generación de código de aproximadamente 35 mil millones de parámetros desarrollado por Kwaipilot, optimizado para hardware AMD mediante el formato ROCmFPX. La conversión ha sido realizada por prasel e incluye scripts y el archivo GGUF cuantizado (principalmente ROCmFP4). El objetivo es ofrecer una versión del modelo que aproveche al máximo las capacidades de las GPUs AMD, con hasta un 30% de mejora en velocidad de prefill en comparación con los cuantizados estándar de llama.cpp. El repositorio está pensado para usuarios que quieran ejecutar el modelo en hardware AMD (como Strix Halo, RDNA2/3/4) con llama.cpp o herramientas compatibles.

El modelo base, KATCoder-2.5-Dev, tiene 34.660.610.688 parámetros (según los datos de safetensors) y está orientado a tareas de programación, aunque no se proporcionan detalles adicionales sobre su arquitectura, contexto o dataset de entrenamiento. Este repositorio se centra en la conversión y cuantización, no en el desarrollo del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 34.660.610.688 (34,66 B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ROCmFP4 (principal), se mencionan ROCmFP2 y ROCmFP6 como opciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (modelo base), no especificada para este repositorio |
| Formato de pesos | GGUF (cuantizado ROCmFPX) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base (KATCoder-2.5-Dev). El repositorio actual es una conversión a GGUF realizada con herramientas de llama.cpp y el fork ROCmFPX. El proceso de conversión incluye la descarga de los pesos safetensors del modelo original, la conversión a GGUF bf16 y posterior cuantización a formato ROCmFP4 (u otros) mediante el compilador de ROCmFPX. No se proporcionan detalles sobre el entrenamiento del modelo base, como número de tokens, dataset o técnicas de alineación.

## Capacidades

Dado que el modelo base es un "Coder" (por el nombre), se presume que está especializado en generación y comprensión de código, pero no se han publicado especificaciones concretas en este repositorio. Las capacidades exactas no están disponibles.

## Casos de uso

Al no disponer de información detallada sobre las capacidades del modelo, los casos de uso son especulativos. Sin embargo, por su nombre y tamaño, podría emplearse para:

- Generación de código en múltiples lenguajes de programación.
- Asistencia en desarrollo de software, como autocompletado o revisión de código.
- Integración en herramientas de desarrollo con soporte de GGUF (Ollama, llama.cpp).
- Despliegue en entornos con GPUs AMD gracias a la optimización ROCmFPX.

No obstante, estas afirmaciones no están respaldadas por datos oficiales del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo tiene 34,66 B parámetros. En FP16, el peso ocupa aproximadamente 69 GB (34,66e9 * 2 bytes). Con cuantización ROCmFP4 (4 bits), el peso se reduce a ~17,3 GB, más overhead de contexto y activaciones.
- Para ejecutar la versión ROCmFP4 se recomienda una GPU AMD con al menos 24 GB de VRAM (por ejemplo, RX 7900 XTX, Strix Halo con 32 GB o más). Para la versión sin cuantizar (bf16) se necesitarían más de 70 GB, lo que requeriría múltiples GPUs o memoria unificada.
- El formato ROCmFPX está optimizado para GPUs AMD (RDNA2, RDNA3, RDNA4, Strix Halo). No se menciona compatibilidad con NVIDIA.
- Herramientas de despliegue: llama.cpp (compilado con ROCmFPX), llama-cli, y potencialmente Ollama si soporta este formato.

Nota: estos son cálculos estimados basados en el tamaño del modelo, no datos oficiales.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en este repositorio. El modelo base (KATCoder-2.5-Dev) podría compararse con otros modelos de código de ~35B como CodeLlama 34B, DeepSeek-Coder 33B o Mixtral 8x7B, pero no hay datos de rendimiento.

## Limitaciones y advertencias

- No se proporciona información sobre sesgos, alucinaciones o limitaciones del modelo base.
- La licencia del repositorio no está especificada, aunque el modelo base es Apache 2.0. Se recomienda verificar los términos antes de uso comercial.
- El formato ROCmFPX es experimental y puede tener diferencias de calidad respecto a cuantizaciones estándar.
- No se garantiza compatibilidad con todos los backends de llama.cpp; se requiere compilar con el fork ROCmFPX.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es muy reciente y no ha sido ampliamente probado.

## Enlaces

- [Repositorio HuggingFace](https://huggingface.co/prasel/KAT-Coder-V2.5-Dev-ROCmFPX-GGUF)
- [Modelo base: Kwaipilot/KAT-Coder-V2.5-Dev](https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev)
- [Repositorio ROCmFPX en GitHub](https://github.com/charlie12345/ROCmFPX)
