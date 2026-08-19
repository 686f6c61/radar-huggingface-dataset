# Bucoid/Qwen3.8-27B-Heretic-Ara-IQ4-XS-MTP-16GB-VRAM-GGUF

## Resumen

El modelo **Bucoid/Qwen3.8-27B-Heretic-Ara-IQ4-XS-MTP-16GB-VRAM-GGUF** es una cuantización de 4 bits (IQ4_XS) del modelo base **Qwen3.8-27B** de Alibaba, modificado mediante la técnica **Heretic Arbitrary-Rank Ablation** para eliminar restricciones de censura. El autor, Bucoid, ha optimizado el archivo GGUF para que quepa en tarjetas gráficas con 16 GB de VRAM, manteniendo un contexto de hasta 110 000 tokens sin MTP y 80 000 con MTP activado. El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de este modelo radica en ofrecer una versión sin censura de un LLM de 27 000 millones de parámetros, con un tamaño de archivo de 12,8 GiB, adecuado para hardware de consumo. La cuantización IQ4_XS presenta una pérdida de calidad mínima respecto al modelo BF16 original, con una correlación de perplejidad del 99,26 % y una tasa de coincidencia Top-1 del 91,6 %. Está pensado para desarrolladores que necesitan un modelo local con amplio contexto y sin filtros de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.8-27B, sin detalles adicionales) |
| Parametros totales | 26 895 998 464 (26,9 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | ~110 000 tokens sin MTP; ~80 000 con MTP (en 16 GB VRAM) |
| Tipos de cuantizacion | IQ4_XS (4 bits), también disponible Q3_K_M (comparativa) |
| Idiomas soportados | No disponible (se heredan los del modelo base Qwen3.8-27B) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es una cuantización del **Qwen3.8-27B** original, un transformer denso con 27 000 millones de parámetros. La modificación principal consiste en la aplicación de **Heretic Arbitrary-Rank Ablation**, una técnica que elimina selectivamente ciertas capas o dimensiones del modelo para reducir o eliminar los comportamientos de rechazo y censura aprendidos durante el entrenamiento con RLHF. Este proceso no requiere reentrenamiento adicional, sino una ablación post-hoc sobre los pesos del modelo base.

La cuantización se realizó con el esquema **IQ4_XS**, que utiliza una matriz de cuantización de 4 bits con escalado por filas, optimizada para minimizar la pérdida de información. El archivo resultante pesa 12,8 GiB, frente a los 50,1 GiB del BF16 original. No se dispone de información sobre el dataset de entrenamiento ni sobre el proceso de fine-tuning, ya que el modelo se deriva directamente del base sin entrenamiento adicional.

## Capacidades

- Generación de texto y conversación multihilo sin restricciones de contenido (sin censura).
- Razonamiento y resolución de problemas, heredados del modelo base Qwen3.8-27B.
- Soporte de código y matemáticas, según las capacidades del modelo base (no verificado específicamente en esta versión).
- Capacidades multilingües, probablemente similares a las del Qwen3.8-27B, aunque no se confirman en la documentación.
- No se especifican capacidades de tool calling, visión o audio en la información proporcionada. Dado que el modelo base Qwen3.8-27B incluye visión, es posible que esta versión la mantenga, pero no hay confirmación explícita.

## Casos de uso

- **Generación creativa de contenido sin restricciones**: el modelo puede producir narrativas, guiones o diálogos que aborden temas sensibles sin filtros, útil para escritores y creadores que necesitan explorar ideas sin limitaciones impuestas por sistemas de moderación.
- **Roleplay y simulación de personajes**: su naturaleza sin censura permite interacciones de rol más realistas y profundas, especialmente en comunidades de juegos de texto o asistentes virtuales personalizados.
- **Asistente de investigación cualitativa**: puede analizar y generar discusiones sobre temas controvertidos o tabú, facilitando el estudio de perspectivas diversas en ciencias sociales.
- **Despliegue local en hardware de consumo**: con 16 GB de VRAM y un contexto de 110 000 tokens, es adecuado para aplicaciones que requieren procesamiento de documentos largos, como resúmenes de contratos o análisis de informes extensos, sin depender de servicios en la nube.
- **Prototipado de chatbots personalizados**: desarrolladores pueden integrar el modelo en aplicaciones de chat mediante llama.cpp u Ollama, aprovechando su licencia Apache 2.0 para uso comercial.
- **Generación de datos sintéticos para entrenamiento**: al no estar censurado, puede producir ejemplos de texto que cubran una gama más amplia de temas, útil para aumentar datasets de entrenamiento en dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card del autor proporciona métricas de calidad de cuantización comparando el modelo IQ4_XS con la versión BF16 original y con una cuantización alternativa Q3_K_M:

| Metrica | Heretic-Ara BF16 (base) | IQ4_XS (este modelo) | Heretic-Ara-Q3_K_M (comparacion) |
|---|---|---|---|
| Tamano de archivo | 50,1 GiB | 12,8 GiB | 12,4 GiB |
| Precision de cuantizacion | BF16 | IQ4_XS (4 bits) | Q3_K_M (~3 bits) |
| Perplejidad media (PPL) | 7,008212 ± 0,045362 | 7,102940 ± 0,046017 | 7,403971 ± 0,048924 |
| Correlacion PPL con base | 100 % | 99,26 % | 98,31 % |
| Divergencia KL media | 0 | 0,033398 ± 0,000308 | 0,076034 ± 0,000554 |
| Divergencia KL maxima | 0 | 15,094215 | 17,866985 |
| Percentil 99,9 % KL | 0 | 1,130034 | 2,448278 |
| Tasa de coincidencia Top-1 | 100 % | 91,619 % ± 0,072 % | 88,152 % ± 0,084 % |
| Cambio de probabilidad media | 0 % | -0,306 % ± 0,013 % | -0,490 % ± 0,020 % |
| Cambio RMS de probabilidad | 0 % | 4,952 % ± 0,041 % | 7,560 % ± 0,054 % |

Estos datos indican que la cuantización IQ4_XS mantiene una fidelidad alta respecto al modelo original, con una pérdida de perplejidad de solo 0,095 puntos y una divergencia KL media baja.

## Requisitos de hardware

- **VRAM minima**: 16 GB (optimizado para tarjetas con 16 GiB de VRAM).
- **GPUs recomendadas**: RTX 4080, RTX 4090, RTX 5080, RTX 5090, o equivalentes de AMD con 16 GB o más (por ejemplo, Radeon RX 7900 XT).
- **Contexto maximo**: ~110 000 tokens sin MTP y ~80 000 con MTP en una GPU de 16 GB sin VRAM reservada para pantalla.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, y cualquier backend compatible con GGUF. No se menciona compatibilidad con vLLM o TGI para este formato.
- **Latencia y throughput**: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La comparativa se centra en las variantes cuantizadas del mismo modelo base, ya que no se dispone de datos de otros modelos de 27B comparables:

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia |
|---|---|---|---|---|---|
| **Bucoid Qwen3.8-27B-Heretic-Ara-IQ4-XS** (este) | 26,9 B | ~110k (sin MTP) | IQ4_XS (4 bits) | 12,8 GiB | Apache 2.0 |
| Bucoid Qwen3.8-27B-Heretic-Ara-Q3_K_M | 26,9 B | ~110k (estimado) | Q3_K_M (~3 bits) | 12,4 GiB | Apache 2.0 |
| Qwen3.8-27B original (BF16) | 26,9 B | 256k (segun documentacion de Qwen) | BF16 | 50,1 GiB | Apache 2.0 |

La ventaja del IQ4_XS frente al Q3_K_M es una mayor fidelidad al modelo original (menor perplejidad y divergencia KL), con un coste de solo 0,4 GiB adicionales. Frente al BF16, el IQ4_XS reduce el tamano en un 74 % y permite ejecucion en hardware de consumo, aunque con un contexto maximo menor (110k vs 256k) debido a las limitaciones de VRAM.

## Limitaciones y advertencias

- **Naturaleza sin censura**: el modelo puede generar contenido ofensivo, ilegal o perjudicial. Los desarrolladores deben implementar sus propias capas de moderacion si lo despliegan en aplicaciones publicas.
- **Riesgo de alucinacion**: como cualquier LLM, puede producir informacion falsa o inventada, especialmente en contextos largos donde la coherencia se degrada.
- **Sesgos del modelo base**: el Qwen3.8-27B hereda sesgos de los datos de entrenamiento, que pueden amplificarse al eliminar restricciones de contenido.
- **Contexto reducido**: aunque 110k tokens es amplio, es inferior a los 256k del modelo base, lo que limita el procesamiento de documentos muy extensos.
- **Idiomas no confirmados**: no se especifican los idiomas soportados en esta version; se asume que hereda los del modelo base, pero no hay garantia.
- **Licencia**: Apache 2.0 permite uso comercial, pero la modificacion "uncensored" puede implicar responsabilidades legales segun el uso final.
- **Soporte de MTP**: activar MTP reduce el contexto a 80k; es necesario evaluar si la ganancia de velocidad compensa la perdida de contexto.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Bucoid/Qwen3.8-27B-Heretic-Ara-IQ4-XS-MTP-16GB-VRAM-GGUF)
- [Modelo base Qwen3.8-27B en HuggingFace](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Documentacion de Qwen3.8 en Unsloth](https://unsloth.ai/docs/models/qwen3.8)
- [Entrada de blog de AMD sobre Qwen3.8 27B](https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html)
- [Pagina del modelo en LLM Explorer](https://llm-explorer.com/model/heretic-org%2FQwen3.8-27B-heretic-ara,1gnpzhvwiWVhYFYskhwWI5)
