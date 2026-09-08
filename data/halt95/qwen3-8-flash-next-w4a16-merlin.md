# halt95/Qwen3.8-Flash-Next-W4A16-Merlin

## Resumen

Qwen3.8-Flash-Next-W4A16-Merlin es un checkpoint cuantizado y empaquetado por halt95 para ejecutar el modelo Qwen/Qwen3.8-Flash-Next en cuatro RTX 3090 (Ampere, sm_86, 24 GB) con su configuración completa de contexto de 262.144 tokens, visión y predicción multi-token (MTP). El modelo base, desarrollado por Qwen, es una arquitectura de mezcla de expertos (MoE) híbrida con 125B parámetros y 6B activos por token, que incluye 512 expertos por capa, 12 capas de atención, proyecciones Gated DeltaNet, una torre de visión y una tabla de embeddings n-gram de 51B parámetros. Este checkpoint combina la cuantización W4A16 de Intel (AutoRound) para los expertos, la tabla n-gram en FP8 de RadixArk y parches personalizados de vLLM para habilitar FP8 KV en Ampere. Es relevante porque permite ejecutar un modelo de este tamaño en hardware de consumo relativamente asequible, sin necesidad de GPUs con FP8 nativo ni NVLink.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (atención + Gated DeltaNet) con predicción multi-token (MTP) y visión |
| Parametros totales | 123.958.298.771 (≈124B) |
| Parametros activos | 6B activados por token (dato del modelo base) |
| Longitud de contexto | 262.144 tokens (configurado; profundidad máxima medida 260.566) |
| Tipos de cuantizacion | INT4 g128 (expertos enrutados y MTP), INT8 per-channel (proyecciones Gated DeltaNet), FP8 (tabla n-gram y KV cache), BF16 (atención, embeddings, lm_head) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.8-Flash-Next es una arquitectura MoE híbrida con 512 expertos enrutados por capa, 12 capas de atención verdadera, proyecciones Gated DeltaNet y una tabla de embeddings n-gram (PLE) de 51B parámetros. Según el repositorio de Qwen, el modelo tiene 125B parámetros y activa 6B por token, y reduce el coste de entrenamiento a aproximadamente un noveno en comparación con Qwen3.7-Plus, manteniendo capacidades superiores en codificación y tareas de oficina. El checkpoint de halt95 aplica la cuantización W4A16 AutoRound de Intel a los expertos enrutados y a los expertos del cabezal MTP, cuantiza las proyecciones Gated DeltaNet a INT8 per-channel, y sustituye la tabla n-gram BF16 por una versión FP8 de RadixArk. Además, incluye escalas estáticas calibradas para la caché KV FP8 E4M3 de las 12 capas de atención. No se proporciona información sobre los datos de entrenamiento ni sobre procesos de alineación como RLHF o DPO.

## Capacidades

- Generación de texto conversacional con modo de razonamiento (thinking) de esfuerzo configurable (low, xhigh).
- Razonamiento matemático y lógico: evaluado en GSM8K, ARC-Challenge y MMLU.
- Visión: incluye torre de visión y se ha probado con imágenes en prompts de contexto profundo.
- Contexto largo de 262.144 tokens, con needle test a 259K tokens.
- Decodificación especulativa mediante predicción multi-token (MTP) con K=2 o K=3, que logra longitudes de aceptación de 2.4–2.9 tokens por paso.
- Caché KV en FP8 con escalas estáticas calibradas.
- Codificación y tareas de oficina (según el repositorio de Qwen).

## Casos de uso

- Análisis de documentos largos: el modelo puede procesar textos de hasta 262.144 tokens, lo que permite resumir o extraer información de informes extensos, contratos o expedientes completos en una sola pasada.
- Razonamiento matemático y lógico en entornos educativos: sus resultados en GSM8K y ARC-Challenge lo hacen adecuado para sistemas de tutoría que deben resolver problemas paso a paso con modo de razonamiento activado.
- Asistencia de programación: el modelo base destaca en tareas de codificación, por lo que puede usarse para generar código, revisar fragmentos o explicar algoritmos en un entorno de desarrollo integrado.
- Procesamiento de documentos con contenido visual: al incluir una torre de visión, puede analizar capturas de pantalla, diagramas o documentos escaneados junto con el texto, siempre que el contexto lo permita.
- Despliegue local en hardware Ampere: gracias al empaquetado específico para RTX 3090, es posible ejecutar un modelo de 124B en cuatro GPUs de consumo sin NVLink, lo que resulta útil para entornos con presupuesto limitado o requisitos de privacidad.
- Sistemas de conversación con razonamiento: el modo thinking y la decodificación especulativa reducen la latencia percibida en aplicaciones interactivas de asistencia técnica o atención al cliente, manteniendo respuestas de alta calidad.

## Benchmarks y rendimiento

Los siguientes datos proceden de las mediciones del autor del checkpoint. Las diferencias de calidad frente al checkpoint anterior no alcanzan significación estadística (p > 0.05).

| Calidad (comparación pareada) | Checkpoint anterior | Este checkpoint | Delta |
|---|---|---|---|
| GSM8K-1319, thinking off | 95.68 % | 96.44 % | +0.76 [−0.08, +1.60], p = 0.11 |
| ARC-Challenge-1172 | 96.93 % | 97.27 % | +0.34 [−0.19, +0.87], p = 0.34 |
| MMLU (1.000, seed 0) | 86.60 % | 87.30 % | +0.70 [−0.81, +2.21], p = 0.44 |
| Verbosidad con esfuerzo xhigh, 40 preguntas MMLU difíciles, presupuesto 32K (tokens medianos) | 3.841 | 2.126 | −45 % |
| Comprobación diaria 250K (needle a 259K, visión ×2) | 4/4 | 4/4 | |

| Servicio (MTP K=3, thinking on, imagen en cada prompt) | Valor |
|---|---|
| Decodificación de un solo stream | 163 / 163 / 169 / 174 tok/s a 4K / 32K / 131K / 260K tokens de prompt |
| Tiempo hasta el primer token | 0.9 / 7.0 / 31.9 / 75.6 s a las mismas profundidades |
| Contexto | 262.144 configurado; prompt más profundo medido 260.566 tokens |
| Pool KV | ~307K tokens FP8 (`--kv-cache-memory 2600000000`) |
| Longitud de aceptación MTP | 2.4–2.9 por ventana de registro en tráfico servido |

## Requisitos de hardware

- VRAM estimada: 4× 24 GB (RTX 3090) para el checkpoint completo, con la tabla n-gram descargada a CPU en tiempo de servicio. El pool KV se configura con ~2.6 GB de memoria para 307K tokens FP8.
- GPU recomendadas: Ampere sm_86 (RTX 3090) o superior; también A100 y H100 con FP8 nativo. El checkpoint incluye un kernel personalizado para FP8 KV en Ampere.
- Compatibilidad con GPUs de consumo: sí, en 4× RTX 3090, pero requiere un parche de vLLM 0.28 publicado en el repositorio del autor.
- Opciones de despliegue: vLLM 0.28 parcheado, con script de build fijado en [halt95/qwen38-flash-next-3090s](https://github.com/halt95/qwen38-flash-next-3090s).
- Latencia y throughput: decode de 163 a 174 tok/s según la profundidad del prompt; tiempo hasta el primer token de 0.9 s a 4K y de 75.6 s a 260K.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-Flash-Next (base) | 125B (6B activos) | 262.144 | BF16 | qwen-community-1.0 | HuggingFace |
| Intel/Qwen3.8-Flash-Next-W4A16-AutoRound | no disponible | 262.144 (presumible) | W4A16 (AutoRound) | qwen-community-1.0 | HuggingFace |
| RadixArk/Qwen3.8-Flash-Next-NVFP4 | no disponible | 262.144 (presumible) | NVFP4 | qwen-community-1.0 | HuggingFace |
| halt95/Qwen3.8-Flash-Next-W4A16-Merlin | 123.958.298.771 | 262.144 | W4A16 / INT8 / FP8 | qwen-community-1.0 | HuggingFace |

## Limitaciones y advertencias

- Las diferencias de calidad frente al checkpoint anterior no son estadísticamente significativas (p > 0.05) en las pruebas realizadas.
- Requiere un parche de vLLM y un kernel personalizado para FP8 KV en Ampere; no es un despliegue estándar y puede quedar obsoleto con actualizaciones de vLLM.
- La tabla n-gram de 51B parámetros se descarga a CPU en tiempo de servicio, lo que puede afectar la latencia de la primera generación y depende de la memoria del host.
- Los benchmarks de calidad se obtuvieron en un entorno específico con MTP K=2 y capturas determinadas; pueden no generalizarse a otras configuraciones.
- La licencia es qwen-community-1.0, catalogada como "other" en HuggingFace; se debe revisar el texto completo antes de usar en producción comercial.
- No se especifican los idiomas soportados en la información disponible, aunque el modelo base de Qwen probablemente sea multilingüe.
- No se documentan sesgos conocidos ni riesgo de alucinación específicos de este checkpoint.

## Enlaces

- [HuggingFace: halt95/Qwen3.8-Flash-Next-W4A16-Merlin](https://huggingface.co/halt95/Qwen3.8-Flash-Next-W4A16-Merlin)
- [GitHub: QwenLM/Qwen3.8-Flash-Next](https://github.com/QwenLM/Qwen3.8-Flash-Next/)
- [HuggingFace: Qwen/Qwen3.8-Flash-Next](https://huggingface.co/Qwen/Qwen3.8-Flash-Next)
- [HuggingFace: Intel/Qwen3.8-Flash-Next-W4A16-AutoRound](https://huggingface.co/Intel/Qwen3.8-Flash-Next-W4A16-AutoRound)
- [HuggingFace: RadixArk/Qwen3.8-Flash-Next-NVFP4](https://huggingface.co/RadixArk/Qwen3.8-Flash-Next-NVFP4)
- [GitHub: halt95/qwen38-flash-next-3090s](https://github.com/halt95/qwen38-flash-next-3090s)
- [GitHub: DominikBucko/qwen38-flash-next-2x3090](https://github.com/DominikBucko/qwen38-flash-next-2x3090)
