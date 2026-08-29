# Hagwell/Qwen3.8-Flash-Next-GGUF

## Resumen

Qwen3.8-Flash-Next es un modelo multimodal (texto e imagen) de tipo causal language model con vision encoder, desarrollado por el equipo de Qwen (Alibaba) como una vista previa experimental de la arquitectura que dará lugar a Qwen4. Se trata de un modelo de mezcla de expertos (MoE) con 125 000 millones de parámetros totales, de los cuales solo 6 000 millones se activan por token, a los que se suman 51 000 millones de parámetros de n-gram embeddings y 4 000 millones de un módulo de predicción multi-token (MTP), lo que arroja un total de aproximadamente 176 900 millones de parámetros. Su ventana de contexto nativa es de 262 144 tokens, extensible hasta 1 000 000 mediante YaRN.

La relevancia de este modelo radica en sus innovaciones arquitectónicas: atención híbrida que combina Gated DeltaNet con Qwen Sparse Attention (QSA), un mecanismo de residual con puertas (Gated Residual), embeddings basados en n-gramas y una receta de entrenamiento optimizada con los optimizadores Muon y AdamW. Esta versión GGUF, publicada por Hagwell y basada en el trabajo de unsloth, permite ejecutar el modelo localmente con llama.cpp o Unsloth Desktop, lo que facilita su uso en entornos sin infraestructura de servidor dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet + Qwen Sparse Attention (QSA) + MoE, con vision encoder |
| Parametros totales | 176 943 899 520 (según safetensors; 125B del LM + 51B n-gram embedding + 4B MTP) |
| Parametros activos | 6 000 000 000 (6B) por token |
| Longitud de contexto | 262 144 tokens nativo, extensible a 1 000 000 con YaRN |
| Tipos de cuantizacion | GGUF (varias, no especificadas en el repositorio) |
| Idiomas soportados | No disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida que combina atención lineal recurrente (Gated DeltaNet) con atención sparse por micro-bloques (Qwen Sparse Attention, QSA). La disposición de capas es de 48 capas en total, organizadas en 12 bloques, cada uno con 3 sub-bloques de Gated DeltaNet seguidos de un sub-bloque de QSA, intercalados con capas MoE. El MoE cuenta con 512 expertos, de los cuales se activan 10 enrutados más 1 compartido por token, con dimensión intermedia de 640. El Gated Residual introduce 4 ramas con un cuello de botella de rango 320, modulando el flujo de información de forma dependiente de los datos. Los n-gram embeddings indexan bigramas y trigramas en la capa 2, con un vocabulario de 20 000 000 de entradas, lo que permite escalar parámetros sin aumentar el coste computacional por token.

El entrenamiento combina los optimizadores Muon y AdamW aplicados a categorías específicas de pesos, y elimina el calentamiento del tamaño de lote, comenzando directamente con el tamaño objetivo. No se han publicado detalles sobre el número de tokens de entrenamiento ni la composición del dataset en la información disponible. El modelo ha pasado por etapas de pre-entrenamiento y post-entrenamiento, e incluye un módulo de predicción multi-token (MTP) de una capa entrenado con múltiples pasos.

## Capacidades

- Generación de texto y razonamiento avanzado, según las afirmaciones de unsloth de que supera a Claude-4.6-Opus (Max) en ciertas tareas.
- Entrada multimodal: acepta imágenes además de texto, gracias a su vision encoder.
- Manejo de contextos muy largos (262K nativo, hasta 1M con YaRN), adecuado para cargas de trabajo agénticas.
- Soporte de tool calling y function calling: no se menciona explícitamente en la documentación disponible, pero es una capacidad habitual en la familia Qwen; no confirmado para este modelo.
- Capacidades multilingües: no se especifican los idiomas soportados.
- Modo de pensamiento (thinking mode): no se documenta en la información proporcionada, aunque la guía de unsloth menciona "thinking controls" en su interfaz de escritorio, lo que sugiere que el modelo puede tener un modo de razonamiento explícito.

## Casos de uso

- Análisis de documentos extensos con imágenes: gracias a su ventana de 262K tokens y su capacidad multimodal, puede procesar informes largos que combinan texto y figuras, extrayendo información relevante en una sola pasada.
- Agentes autónomos con razonamiento multi-paso: la arquitectura QSA reduce la latencia en contextos largos, lo que lo hace adecuado para agentes que necesitan mantener un historial amplio de interacciones y ejecutar múltiples pasos de razonamiento.
- Generación de código en repositorios grandes: el contexto amplio permite alimentar el modelo con el contenido completo de un proyecto para generar o modificar código con coherencia global.
- Asistencia en investigación científica: puede resumir y comparar artículos técnicos, incluyendo figuras y tablas, gracias a su entrada de imagen.
- Atención al cliente con historial prolongado: el modelo puede gestionar conversaciones multi-turno con un contexto extenso, manteniendo el estado de la conversación sin truncamientos.
- Despliegue local en equipos con memoria unificada: según unsloth, puede ejecutarse en dispositivos con 75 GB de RAM/unified memory sin necesidad de GPU, lo que permite prototipado y pruebas en estaciones de trabajo convencionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo base incluye una sección de benchmarks, pero el contenido no se ha proporcionado íntegramente en los datos recibidos. Unsloth afirma que el modelo supera a Claude-4.6-Opus (Max), pero no se aportan cifras concretas. Se recomienda consultar el informe técnico oficial para obtener datos numéricos.

## Requisitos de hardware

- Según unsloth, el modelo puede ejecutarse localmente con 75 GB de RAM o memoria unificada, sin necesidad de VRAM de GPU.
- Para inferencia con GPU, al ser un MoE con solo 6B parámetros activos, la VRAM necesaria depende de la cuantización elegida. Con cuantizaciones GGUF de baja precisión (por ejemplo, Q4_K_M), podría caber en GPUs de consumo con 24 GB de VRAM, aunque no se dispone de datos exactos del repositorio.
- El repositorio de Hagwell tiene un tamaño de 1364.9 GB, lo que indica que incluye múltiples archivos GGUF de diferentes cuantizaciones; se debe seleccionar el archivo adecuado según el hardware disponible.
- Opciones de despliegue: llama.cpp, Unsloth Desktop, y potencialmente vLLM o TGI si se añade soporte para esta arquitectura (no confirmado).
- No se dispone de datos de latencia o throughput en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros modelos de la misma categoría en la información proporcionada. El modelo es una arquitectura experimental sin precedentes directos en la familia Qwen, y no se han facilitado comparaciones numéricas con alternativas como Qwen3-235B-A22B o DeepSeek-V3. Se recomienda consultar el informe técnico para obtener una comparativa detallada.

## Limitaciones y advertencias

- Modelo experimental: al ser una vista previa de la arquitectura de Qwen4, puede presentar inestabilidades o comportamientos inesperados en producción.
- Licencia qwen-community-1.0: es necesario revisar los términos exactos de la licencia para uso comercial, ya que puede imponer restricciones específicas.
- Idiomas soportados no documentados: no se ha especificado qué idiomas cubre el modelo, lo que limita la evaluación de su adecuación para aplicaciones multilingües.
- Riesgo de alucinación: como todo modelo generativo, puede producir contenido falso o inconsistente, especialmente en tareas de razonamiento complejo.
- Contexto largo: aunque la ventana nativa es de 262K, el rendimiento en los extremos de la ventana puede degradarse; se recomienda validar con casos de uso reales.
- La versión GGUF de Hagwell es un reempaquetado de la comunidad; no está respaldada oficialmente por Qwen, por lo que el soporte y la corrección de errores dependen del mantenedor.

## Enlaces

- Repositorio GGUF de Hagwell: https://huggingface.co/Hagwell/Qwen3.8-Flash-Next-GGUF
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GGUF de unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Repositorio oficial en GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Blog de Qwen sobre Qwen3.8-Flash-Next: https://qwen.ai/blog?id=qwen3.8-flash-next
- Guía de unsloth para ejecutar el modelo: https://unsloth.ai/docs/models/qwen3.8-next
- Informe técnico (PDF): https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
