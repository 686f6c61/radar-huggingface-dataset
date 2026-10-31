# Jattt6789/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF

## Resumen

Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF es una cuantización GGUF del modelo Qwen3.8-27B (publicado por Qwen), realizada por el usuario Jattt6789 bajo el perfil "HauhauCS Aggressive", que elimina el comportamiento de rechazo del modelo (el autor reporta 0/465 negativas en sus pruebas) y reduce el preámbulo en prompts difíciles. El modelo base es un LLM denso de 27B parámetros con arquitectura híbrida (48 capas Gated DeltaNet y 16 capas de gated attention), visión integrada mediante un proyector BF16 independiente y un contexto nativo de 262.144 tokens, extensible hasta 1.000.000.

La relevancia de esta versión reside en dos puntos: primero, conserva la cabeza MTP/NextN nativa de Qwen3.8 y añade "HauhauCS FastMTP", un sidecar de aceleración por decodificación especulativa multi-token que, según el autor, multiplica por hasta 3,02x la velocidad de generación en documentos y por 1,93x en razonamiento frente a la ejecución sin MTP. Segundo, incluye cuantizaciones propias "K_P" (Perfect) que preservan calidad selectivamente con un incremento de tamaño del 5-15% sobre el quant base, manteniendo compatibilidad estándar con llama.cpp y LM Studio.

Es un modelo multimodal (image-text-to-text) orientado a usuarios que necesitan inferencia local sin filtros de alineación, con soporte de texto, imagen y vídeo, y capacidades de razonamiento y uso agéntico heredadas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido: 48 capas Gated DeltaNet + 16 capas gated attention, con cabeza MTP/NextN embebida y visor de visión |
| Parametros totales | 27B (según model card); el campo safetensors de HF reporta 1.863.907.840 (dato posiblemente parcial o erróneo) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, IQ3_XS, Q2_K_P, IQ2_M (GGUF) |
| Idiomas soportados | Inglés, chino, multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (texto), GGUF BF16 para el proyector de visión, GGUF para el sidecar FastMTP |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un modelo de lenguaje causal denso de 27B parámetros con 64 capas de modelo de lenguaje, tamaño oculto de 5.120, FFN de 17.408 y un vocabulario acolchado de 248.320 tokens. Su rasgo arquitectónico más destacable es el diseño híbrido: combina 48 capas Gated DeltaNet (una variante de atención lineal basada en delta rule) con 16 capas de gated attention estándar, lo que reduce el coste de memoria KV y hace viable el contexto nativo de 262.144 tokens y su extensión a 1.000.000. Incorpora además una cabeza MTP (multi-token prediction, tipo NextN) embebida que permite decodificación especulativa nativa.

Sobre esta base, HauhauCS aplica el perfil de desalineación "Aggressive" (sin cambios en datasets ni capacidades previstas, según el autor) y publica las cuantizaciones con la cabeza MTP preservada. El sidecar FastMTP-32K es un perfil de aceleración de decodificación especulativa calibrado para todo el rango de cuantizaciones a contexto nativo máximo. No se dispone de información sobre los datos de entrenamiento del modelo base (número de tokens, composición del corpus, RLHF/DPO) en la documentación proporcionada.

## Capacidades

- Generación de texto conversacional sin comportamiento de rechazo (perfil Aggressive: respuestas directas y preámbulo mínimo).
- Razonamiento multi-paso heredado de Qwen3.8, acelerado por decodificación especulativa MTP/FastMTP (hasta 1,93x en generación de razonamiento).
- Comprensión de imágenes y vídeo mediante el proyector de visión BF16 independiente (pipeline image-text-to-text).
- Contexto nativo de 262.144 tokens, extensible a 1.000.000, adecuado para documentos largos y trabajo agéntico de contexto extenso.
- Capacidades agénticas y de uso con herramientas heredadas del modelo base (el autor menciona explícitamente capacidades agénticas preservadas; no se detalla soporte formal de function calling en la documentación).
- Multilingüe: inglés, chino y otros idiomas.
- Compatibilidad total con runtimes GGUF estándar (llama.cpp, LM Studio) sin builds ni plugins especiales.

## Casos de uso

- Procesamiento de documentos largos en local: con 262.144 tokens de contexto nativo y la aceleración FastMTP (hasta 3,02x en generación sobre documentos), es adecuado para resumir, extraer y analizar documentos extensos sin dividirlos en fragmentos.
- Asistentes conversacionales sin filtros: el perfil Aggressive elimina negativas y preámbulos, útil para aplicaciones donde el comportamiento de rechazo del modelo base interfiere con casos de uso legítimos (ficción, investigación de seguridad, análisis de contenido sensible).
- Análisis de imágenes y vídeo en local: descargando el proyector mmproj BF16 (931 MB), se pueden construir pipelines de descripción, OCR o análisis visual multimodal sin depender de APIs externas.
- Agentes de contexto largo: la arquitectura híbrida con DeltaNet reduce la memoria KV, lo que permite mantener sesiones agénticas multi-paso muy largas en una sola GPU.
- Inferencia en hardware de consumo: la cuantización IQ2_M (10,32 GB) o Q2_K_P (10,68 GB) permiten ejecutar el modelo en GPUs de 12-16 GB de VRAM, y Q4_K_P (17,92 GB) en una RTX 4090 de 24 GB.
- Experimentación con decodificación especulativa: el sidecar FastMTP-32K permite evaluar la aceleración MTP en todo el rango de cuantizaciones a contexto máximo nativo.
- Generación y razonamiento en chino e inglés: al ser el modelo base de Qwen, mantiene rendimiento sólido en tareas bilingües chino-inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento publicado es de velocidad de generación atribuido al sidecar FastMTP:

| Métrica | Valor |
|---|---|
| Generación de documentos (TG) vs. sin MTP | hasta 3,02x |
| Generación de razonamiento (TG) vs. sin MTP | hasta 1,93x |
| Generación de documentos vs. MTP embebido estándar | hasta +35,2% |
| Generación de razonamiento vs. MTP embebido estándar | hasta +21,1% |
| Tasa de rechazo (test del autor) | 0/465 |

Estas cifras provienen del autor del modelo y no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos de texto, sin KV cache ni proyector):
  - IQ2_M / Q2_K_P: ~10,3-10,7 GB
  - IQ3_XS / IQ3_M / Q3_K_P: ~12,2-13,4 GB
  - IQ4_XS: ~15,7 GB
  - Q4_K_P: ~17,9 GB
  - Q5_K_P: ~20,2 GB
  - Q6_K_P: ~25,9 GB
  - Q8_K_P: ~31,5 GB
  - El proyector de visión añade ~931 MB y el sidecar FastMTP ~903 MB; el contexto largo añade memoria KV adicional.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_P/Q5_K_P con margen de contexto; RTX 5090 o A100/H100 para cuantizaciones Q6/Q8 y contextos muy largos.
- Consumer GPUs: viable en RTX 3090/4090 (24 GB) con cuantizaciones de 4 bits; en GPUs de 12-16 GB (RTX 3060 12GB, RTX 4060 Ti 16GB) con IQ2/IQ3, posiblemente con descarga parcial a RAM.
- Opciones de despliegue: llama.cpp, LM Studio y cualquier runtime compatible con GGUF (el autor indica compatibilidad estándar sin builds especiales). No se menciona soporte en vLLM, TGI u Ollama para esta variante concreta.
- Latencia y throughput: no se publican cifras absolutas de tokens/segundo; solo los multiplicadores de aceleración FastMTP indicados en la sección de benchmarks.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Multimodal | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-HauhauCS-Aggressive (este) | 27B | Híbrido DeltaNet + attention, MTP | 262K (hasta 1M) | Sí (visión) | Apache 2.0 |
| Qwen/Qwen3.8-27B (base) | 27B | Híbrido DeltaNet + attention, MTP | 262K (hasta 1M) | Sí | Apache 2.0 (con comportamiento de rechazo) |
| Qwen3-30B-A3B (referencia de la familia, MoE) | 30B (3B activos) | MoE | 32K-128K | Según variante | Apache 2.0 |
| Gemma 3 27B (referencia de tamaño similar) | 27B | Transformer denso | 128K | Sí (visión) | Licencia Gemma (restricciones de uso) |

Comparado con el modelo base, esta variante ofrece el mismo rendimiento teórico pero sin rechazos, más las cuantizaciones K_P y el sidecar FastMTP. Frente a Gemma 3 27B, ofrece contexto nativo mayor (262K frente a 128K) y licencia Apache 2.0 sin restricciones, aunque Gemma 3 cuenta con un ecosistema de validación más amplio.

## Limitaciones y advertencias

- Modelo "uncensored": elimina deliberadamente los mecanismos de seguridad del modelo base. Esto implica riesgo elevado de generar contenido ofensivo, dañino o ilegal si no se aplican salvaguardas externas. Su uso es responsabilidad del desplegador.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad; al eliminar el comportamiento de rechazo, el modelo puede responder con confianza a preguntas que el modelo base habría declinado, lo que puede aumentar las alucinaciones aparentes.
- El perfil Aggressive es, según el propio autor, menos seguro que una variante Balanced para trabajo agéntico de contexto largo crítico para la fiabilidad; recomienda la variante Balanced si está disponible.
- Discrepancia de datos: el campo de parámetros safetensors de HuggingFace reporta 1.863.907.840, inconsistente con los 27B declarados; conviene verificar los metadatos antes de desplegar.
- Las cuantizaciones K_P pueden aparecer como "?" en LM Studio (solo un problema de visualización) y el widget de compatibilidad de hardware de HF puede no reconocerlas.
- Idiomas: documentados oficialmente inglés y chino; el resto de idiomas caen bajo la etiqueta genérica "multilingual" sin datos de rendimiento por idioma, incluido el castellano.
- Contexto extensible a 1.000.000 de tokens: el consumo de memoria KV a contextos extremos puede superar la VRAM disponible incluso en GPUs de gama alta.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales del derivado, aunque los términos de la licencia del modelo base Qwen aplican al modelo subyacente.
- Los datos de aceleración FastMTP (3,02x/1,93x) provienen del autor y no están verificados independientemente.

## Enlaces

- Ficha del modelo (Jattt6789): https://huggingface.co/Jattt6789/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Repositorio de descargas referenciado en la model card (HauhauCS): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Discord del autor: https://discord.gg/SZ5vacTXYf
