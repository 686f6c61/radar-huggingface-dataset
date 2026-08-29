# grant-ai/Qwen3.8-Flash-Next-Abliterated-MTPLX-4bit

## Resumen

El modelo `grant-ai/Qwen3.8-Flash-Next-Abliterated-MTPLX-4bit` es una compilación cuantizada a 4 bits del modelo Qwen3.8-Flash-Next, específicamente diseñada para ejecutarse de forma nativa en Apple Silicon mediante la librería MTPLX. El modelo base, desarrollado por Qwen, es un modelo de lenguaje de 125 mil millones de parámetros con arquitectura de mezcla de expertos (MoE) que activa aproximadamente 6 mil millones de parámetros por token, y destaca por su eficiencia en coste de entrenamiento e inferencia frente a su predecesor Qwen3.7-Plus. Esta versión concreta ha pasado por un proceso de "abliteration" (eliminación de comportamientos de rechazo) aplicado por Blackfrost-AI, y posteriormente ha sido cuantizada con el esquema oQ4e, manteniendo un cabezal de decodificación especulativa multi-token (MTP) que acelera la generación.

La relevancia de este modelo radica en su doble vertiente: por un lado, demuestra la viabilidad de ejecutar modelos MoE de gran tamaño en hardware de consumo de Apple con velocidades de generación superiores a 50 tokens por segundo gracias a la decodificación especulativa; por otro, al estar "abliterado", se publica exclusivamente con fines de investigación en seguridad de IA, red-teaming y estudio de alineación. No incluye capacidades de visión y su licencia es la comunidad de Qwen (qwen-community-1.0). El contexto máximo es de 262.144 tokens, lo que lo hace adecuado para tareas de razonamiento de largo alcance.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atención híbrida GDN + QSA (Qwen3.8-Flash-Next) |
| Parametros totales | 125B (más 51B de embeddings n-gram); ~6B activos por token (10 de 512 expertos) |
| Parametros activos | ~6B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | oQ4e (4 bits, grupo 32) para el cuerpo y el cabezal MTP; embeddings a 8 bits |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (licencia de comunidad de Qwen) |
| Formato de pesos | safetensors (empaquetado MTPLX, con `mtplx_runtime.json`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura de mezcla de expertos con 512 expertos, de los cuales se activan 10 por token, lo que reduce drásticamente el coste computacional. Su atención combina dos mecanismos: GDN (probablemente una variante de atención con normalización) y QSA (query-specific attention), una hibridación que mejora la eficiencia y la capacidad de modelado. El entrenamiento del modelo base, según la documentación de Qwen, requirió aproximadamente una novena parte del coste de Qwen3.7-Plus, manteniendo o superando sus capacidades en tareas de código y ofimática.

Sobre esta base, Blackfrost-AI aplicó un proceso de "abliteration" (DERISKED) que elimina los comportamientos de rechazo del modelo, dando lugar al checkpoint BF16. Posteriormente, grant-ai cuantizó ese checkpoint a 4 bits con el esquema oQ4e, calibrado con iMatrix, y lo empaquetó para MTPLX. El cabezal de decodificación especulativa multi-token (MTP) se mantiene en el mismo formato cuantizado. Para la versión 2.10.0 de MTPLX, se realizaron tres ajustes sin requantizar los pesos: un desplazamiento de +1 en las ganancias de RMSNorm del tronco, el reempaquetado de la tabla n-gram en un único tensor `ngram-table.safetensors`, y el re-prefijado de las claves de cuantización en `config.json`. No se dispone de información detallada sobre el dataset de entrenamiento del modelo base ni sobre el proceso de alineación posterior.

## Capacidades

- Generación de texto conversacional y de larga duración con contexto de hasta 262.144 tokens.
- Razonamiento multi-paso y resolución de problemas complejos, heredado del modelo base Qwen3.8-Flash-Next.
- Generación de código y asistencia en tareas de programación, área donde el modelo base muestra mejoras frente a Qwen3.7-Plus.
- Soporte de decodificación especulativa multi-token (MTP) con cabezal de draft integrado, que acelera la inferencia hasta 1,48x frente a decodificación plana.
- Capacidad de usar una tabla n-gram residente en memoria para mejorar el rendimiento de decodificación.
- Comportamiento "abliterado": ausencia de rechazos de seguridad en la mayoría de instrucciones, incluidas las dañinas (medido en el checkpoint BF16 padre).
- No incluye capacidades de visión en esta compilación (a diferencia del modelo base, que sí las tiene).
- No se ha confirmado soporte explícito de tool calling o function calling en esta compilación.

## Casos de uso

- Investigación en seguridad de IA (red-teaming): el modelo puede usarse para estudiar cómo responden los sistemas sin barreras de rechazo ante instrucciones maliciosas, permitiendo evaluar riesgos de abuso y desarrollar mejores mecanismos de alineación.
- Estudio de alineación y refusal behavior: al comparar este modelo con su versión no abliterada, los investigadores pueden analizar qué capas y pesos codifican los comportamientos de rechazo y cómo afectan a la utilidad general.
- Investigación en interpretabilidad: al eliminar los rechazos, se facilita el análisis de los mecanismos internos que subyacen a la generación de contenido dañino, sin necesidad de sortear filtros.
- Investigación en cuantización y eficiencia: este build demuestra que un modelo MoE de 125B puede cuantizarse a 4 bits y ejecutarse en Apple Silicon con rendimiento útil, sirviendo como banco de pruebas para técnicas de compresión y decodificación especulativa.
- Desarrollo de aplicaciones locales de generación de texto en Apple Silicon: para tareas de creación de contenido, resumen o asistencia en código donde no se requiera moderación de seguridad, y siempre que el despliegue sea estrictamente local y controlado.
- Benchmarking de hardware: permite medir el rendimiento de decodificación especulativa y de la tabla n-gram en diferentes configuraciones de Mac con memoria unificada, útil para optimizar el despliegue de modelos similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) para esta compilación específica. Los únicos datos disponibles son métricas de rendimiento de inferencia y de aceptación del cabezal especulativo, medidos en Apple Silicon:

| Metrica | Valor |
|---|---|
| Velocidad con MTP depth 1 + n-gram residente | 50,1 tok/s |
| Velocidad con MTP depth 2 | 47,1 tok/s |
| Velocidad con decodificacion plana + n-gram residente | 33,9 tok/s |
| Velocidad con decodificacion plana + n-gram desde SSD | 30,0 tok/s |
| Speedup especulativo | 1,48x |
| Tasa de aceptacion del draft MTP (depth 2) | 96,5% / 94,2% |
| Tasa de rechazo en prompts daninos (checkpoint BF16 padre) | 2,3% (7/300) |
| Tasa de rechazo en suite completa (checkpoint BF16 padre) | 2,2% (10/450) |

Estas cifras de velocidad corresponden a la compilación 4-bit y fueron medidas con MTPLX 2.10.0. La tasa de rechazo se midió en el checkpoint BF16 antes de la cuantización; el autor indica que esta compilación 4-bit aún no ha sido re-medida.

## Requisitos de hardware

- Exclusivo para Apple Silicon (M-series); no compatible con GPUs NVIDIA o AMD.
- Memoria unificada necesaria: aproximadamente 106 GiB residentes durante el servicio, por lo que se requiere un Mac con al menos 128 GB de RAM unificada (los modelos de 64 GB no son suficientes).
- Tamaño de descarga: 108 GB (106 GB del cuerpo + 1,5 GB del cabezal MTP).
- Librería de inferencia: MTPLX 2.10.0 o superior, instalable vía `pip install mtplx`.
- No requiere parches ni ramas personalizadas desde MTPLX 2.10.0; el modelo se carga directamente.
- La decodificación especulativa con MTP y la tabla n-gram residente son opcionales pero recomendadas para máximo rendimiento (50,1 tok/s).
- No se dispone de datos de latencia o throughput en otros entornos (servidores, etc.) porque el modelo está diseñado para ejecución local en Apple Silicon.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Plataforma | Licencia | Notas |
|---|---|---|---|---|---|---|
| grant-ai/Qwen3.8-Flash-Next-Abliterated-MTPLX-4bit | 125B (6B activos) | 262.144 | oQ4e 4-bit | Apple Silicon (MTPLX) | qwen-community-1.0 | Abliterado, sin vision, con MTP |
| grant-ai/Qwen3.8-Flash-Next-Abliterated-MLX-4bit | 125B (6B activos) | 262.144 | oQ4e 4-bit | Apple Silicon (MLX) | qwen-community-1.0 | Misma base y cuantizacion, pero para MLX; incluye vision |
| Blackfrost-AI/Qwen3.8-Flash-Next-DERISKED-BF16 | 125B (6B activos) | 262.144 | BF16 | Cualquier GPU (transformers) | qwen-community-1.0 | Checkpoint abliterado original, sin cuantizar |
| Qwen/Qwen3.8-Flash-Next | 125B (6B activos) | 262.144 | BF16/FP8 | Multiplataforma | qwen-community-1.0 | Modelo base original, con alineacion estandar |

La comparativa muestra que esta compilación MTPLX es la única de las cuatro que no incluye visión y que está optimizada específicamente para Apple Silicon con decodificación especulativa. El resto de características (parámetros, contexto, licencia) son idénticas al modelo base.

## Limitaciones y advertencias

- El modelo está "abliterado": no presenta rechazos de seguridad en la mayoría de instrucciones, incluida la generación de contenido dañino, ilegal o peligroso. El autor advierte explícitamente que asume que el modelo cumplirá cualquier instrucción.
- Publicado únicamente para investigación experimental en seguridad de IA y red-teaming. No debe usarse para actividades ilegales en ninguna jurisdicción.
- No debe exponerse como endpoint público ni desplegarse para usuarios no confiables; el autor recomienda ejecutarlo localmente en hardware propio.
- No incluye capacidades de visión, a diferencia del modelo base y de la versión MLX.
- La tasa de rechazo medida (2,3%) corresponde al checkpoint BF16 padre; esta compilación 4-bit no ha sido re-medida tras la cuantización, por lo que el comportamiento real puede variar.
- Requiere hardware Apple Silicon con al menos 128 GB de RAM unificada, lo que limita su uso a equipos de gama alta.
- La licencia qwen-community-1.0 debe revisarse para confirmar las restricciones de uso comercial y redistribución; el autor la clasifica como "other".
- No se dispone de información sobre los idiomas soportados ni sobre el dataset de entrenamiento del modelo base.
- Riesgo de alucinación inherente a los modelos de lenguaje; al no tener rechazos, las alucinaciones pueden ser más difíciles de detectar en contextos de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/grant-ai/Qwen3.8-Flash-Next-Abliterated-MTPLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint abliterado BF16: https://huggingface.co/Blackfrost-AI/Qwen3.8-Flash-Next-DERISKED-BF16
- Versión MLX del mismo autor: https://huggingface.co/grant-ai/Qwen3.8-Flash-Next-Abliterated-MLX-4bit
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next
- Documentación de Qwen3.8-Flash-Next en unsloth: https://unsloth.ai/docs/models/qwen3.8-next
