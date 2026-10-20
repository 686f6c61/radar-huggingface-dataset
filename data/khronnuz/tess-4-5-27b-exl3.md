# khronnuz/Tess-4.5-27B-exl3

## Resumen

`khronnuz/Tess-4.5-27B-exl3` no es un modelo entrenado, sino un repositorio de cuantización en formato EXL3 del modelo `migtissera/Tess-4.5-27B`. Lo publica el usuario khronnuz como esfuerzo independiente, no oficial, y en el momento de redactar esta ficha se encuentra en estado de marcador de posición: la propia model card advierte que no hay pesos EXL3 descargables y que el repositorio no debe usarse como modelo hasta que se suba un paquete completo y validado. El repositorio acumula 0 descargas y 0 likes, y la conversión, la validación y la subida se describen como pasos separados que aún no han concluido.

El modelo de origen, Tess-4.5-27B, es un modelo de pesos abiertos de 27 000 millones de parámetros desarrollado por migtissera sobre la base de Qwen3.8-27B, orientado explícitamente a ingeniería de software y flujos de trabajo agénticos con razonamiento. Su predecesor, Tess-4-27B, se postentrenó con trazas agénticas de contexto largo de 64K tokens procedentes de trabajo real de ingeniería y de un conjunto de profesores multimodelo. La relevancia de este repositorio, por tanto, es potencial (permitiría ejecutar un modelo de 27B en GPUs de consumo mediante cuantización de 2 a 6 bits por peso), no actual.

La información disponible sobre el propio artefacto EXL3 es mínima: se anuncian variantes auto-calibradas de 2.00, 2.20, 2.50, 3.00, 3.50, 4.00, 5.00 y 6.00 bpw, generadas a partir de la revisión `91b231133470bd147aac8036ed94d35e9bf1dc13` del modelo original, con una traza de calibración producida por el propio Tess. No se publican manifiestos de ficheros, instrucciones de uso ni resultados de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible en la información proporcionada (modelo base derivado de Qwen3.8-27B) |
| Parámetros totales | 27 000 millones (heredados del modelo base Tess-4.5-27B) |
| Parámetros activos | no aplica (no se describe como MoE en la información disponible) |
| Longitud de contexto | no disponible para Tess-4.5-27B (el predecesor Tess-4-27B se postentrenó con trazas de hasta 64K tokens) |
| Tipos de cuantización | EXL3 auto-calibrada a 2.00, 2.20, 2.50, 3.00, 3.50, 4.00, 5.00 y 6.00 bpw (planificadas, ninguna publicada) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | EXL3 (ningún peso publicado en el repositorio) |
| Estado del repositorio | marcador de posición; conversión en curso, sin artefactos descargables |
| Modelo base | migtissera/Tess-4.5-27B |
| Revisión de origen | 91b231133470bd147aac8036ed94d35e9bf1dc13 |
| Pipeline declarado | image-text-to-text |
| Autor de la cuantización | khronnuz (esfuerzo independiente, no oficial) |

## Arquitectura y entrenamiento

El repositorio no contiene arquitectura propia: es una conversión de cuantización. El modelo subyacente, Tess-4.5-27B, se construye sobre Qwen3.8-27B y se describe como un modelo de pesos abiertos de 27B especializado en ingeniería de software y trabajo agéntico, con énfasis en razonamiento robusto y ejecución eficiente en entornos locales. La información disponible no detalla el número de capas, la dimensionalidad, el mecanismo de atención ni el volumen de tokens de entrenamiento de Tess-4.5. Su predecesor, Tess-4-27B, se postentrenó sobre trazas agénticas de 64K tokens derivadas de trabajo de ingeniería real y de un conjunto de profesores multimodelo (Opus-4.8, GPT-5.5 y GLM-5.2 según la fuente consultada).

En cuanto a la innovación técnica del artefacto EXL3, la model card indica que las trazas de calibración se generaron con el propio Tess ("self-calibrated"), lo que en la práctica significa que los factores de cuantización se ajustan a las activaciones del modelo en lugar de a un corpus genérico. Se menciona además una traza temporal de 8.00 bpw usada como fuente, que no forma parte de las variantes previstas. El autor advierte explícitamente que la calibración es textual y que, por tanto, no establece calidad en visión ni en MTP (multi-token prediction), capacidades que el pipeline declarado sugiere pero que no se han validado.

## Capacidades

- Generación de texto y razonamiento: el modelo base se presenta como "thinking-native", con deliberación que escala según la dificultad del problema.
- Ingeniería de software: el modelo de origen está diseñado para tareas de programación y flujos agénticos de desarrollo.
- Trabajo agéntico y multi-paso: el postentrenamiento del predecesor se basó en trazas agénticas de contexto largo (64K tokens).
- Entrada de imagen y texto: el pipeline declarado es `image-text-to-text`, aunque no hay validación publicada de la calidad en visión tras la cuantización.
- MTP (multi-token prediction): mencionado en la model card como capacidad cuya calidad no queda cubierta por la calibración textual.
- Tool calling / function calling: no confirmado explícitamente en la información disponible.
- Idiomas: no disponible.
- Modo thinking: no se detalla el mecanismo de activación ni los tokens de presupuesto.

## Casos de uso

- Evaluación de cuantizaciones EXL3: el repositorio, una vez publicado, serviría para medir la degradación de un modelo de 27B entre 2.00 y 6.00 bpw sobre las mismas trazas de calibración, un caso de uso habitual en laboratorios que ajustan el compromiso calidad/memoria.
- Despliegue local en GPU de consumo: a 4.00 bpw el peso teórico ronda los 13,5 GB, lo que permitiría servir el modelo en una RTX 4090 de 24 GB con margen para caché KV, algo inviable en bf16.
- Asistencia a programación en el IDE: el modelo base está orientado a ingeniería de software, por lo que un pack de 5.00-6.00 bpw podría integrarse en asistentes locales que requieren baja latencia y no pueden enviar código a la nube.
- Automatización de tareas de refactorización multi-archivo: el contexto largo empleado en el postentrenamiento del predecesor encaja con flujos que necesitan mantener estado a lo largo de varias ediciones y ejecuciones de tests.
- Experimentación con cuantización auto-calibrada: útil para investigadores que comparan calibración con datos propios del modelo frente a calibración con corpus externos (C4, WikiText) en el rango 2-3 bpw.
- Servicio de inferencia autoalojado con vLLM/TabbyAPI: si el soporte de EXL3 en el runtime elegido está disponible, permitiría exponer una API compatible con OpenAI para prototipos internos sin coste por token.
- Nota: ninguno de estos casos es ejecutable hoy, porque no hay pesos publicados en el repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio indica que las instrucciones de uso y los resultados de evaluación se añadirán solo cuando los artefactos correspondientes estén verificados y publicados, y descarta explícitamente cualquier afirmación de calidad, velocidad o visión.

## Requisitos de hardware

Estimaciones calculadas únicamente a partir del número de parámetros (27B) y los bits por peso anunciados; no incluyen caché KV, overhead del runtime ni memoria de activaciones, y no han sido verificadas por el autor:

- 2.00 bpw: ~6,75 GB de pesos.
- 2.20 bpw: ~7,4 GB de pesos.
- 2.50 bpw: ~8,4 GB de pesos.
- 3.00 bpw: ~10,1 GB de pesos.
- 3.50 bpw: ~11,8 GB de pesos.
- 4.00 bpw: ~13,5 GB de pesos.
- 5.00 bpw: ~16,9 GB de pesos.
- 6.00 bpw: ~20,25 GB de pesos.
- GPU de consumo: los packs de 2.00-4.00 bpw cabrían teóricamente en tarjetas de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti Super 16 GB) y de 4.00-6.00 bpw en una RTX 4090/5090 de 24-32 GB, siempre sumando la caché KV.
- GPU de datacenter: A100 40/80 GB y H100 80 GB son sobredimensionadas para estos tamaños; tendrían sentido para servir muchas réplicas concurrentes o contextos muy largos.
- Despliegue: el formato EXL3 se asocia al runtime ExLlamaV3 (TabbyAPI, text-generation-webui con loader EXL3); no se confirma en la información disponible qué versiones concretas lo soportan.
- Latencia y throughput: no disponibles. No hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| khronnuz/Tess-4.5-27B-exl3 | 27B (heredados) | no disponible | EXL3 2.00-6.00 bpw (planificado) | Apache-2.0 | sin pesos publicados |
| migtissera/Tess-4.5-27B | 27B | no disponible | no disponible | Apache-2.0 | pesos originales publicados |
| migtissera/Tess-4-27B | 27B | trazas de entrenamiento de 64K tokens | safetensors, GGUF | no disponible | publicado (incluye GGUF oficial) |
| Qwen3.8-27B (base) | 27B | no disponible | no disponible | no disponible | base del modelo Tess-4.5 |

La comparación relevante es frente a los pesos originales en bf16 (≈54 GB, requiere GPU de 80 GB o descarga en CPU) y frente al GGUF oficial de Tess-4, que ya ofrece una vía de ejecución local con llama.cpp. El valor diferencial del EXL3 sería el rango de bpw y la calibración propia del modelo, pero no hay datos que permitan cuantificar la degradación.

## Limitaciones y advertencias

- El repositorio no contiene pesos. La model card lo califica de "placeholder only" y pide no usarlo como modelo hasta que exista un paquete completo y verificado.
- No hay evaluación de calidad, velocidad ni visión; el autor renuncia explícitamente a cualquier afirmación al respecto.
- La calibración es textual: la calidad en visión y en MTP no queda cubierta por el proceso de cuantización.
- Riesgo de alucinación del modelo base: no evaluado en la información disponible.
- Sesgos: no documentados.
- Idiomas soportados: no disponibles; no se puede asumir un rendimiento correcto en castellano.
- Licencia Apache-2.0 en el repositorio y en el modelo de origen, lo que en principio permite uso comercial, pero conviene verificar los términos del modelo base y de Qwen3.8-27B antes de desplegar en producción.
- Mantenimiento por un único autor, con 0 descargas y 0 likes: sin garantía de continuidad ni de soporte.
- Compatibilidad de runtime: la disponibilidad de kernels EXL3 estables para estas variantes no está confirmada.
- Los packs de 2.00-2.50 bpw, aunque quepan en GPU pequeñas, suelen implicar pérdidas notables en modelos de 27B; sin benchmarks publicados no puede recomendarse su uso en producción.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/khronnuz/Tess-4.5-27B-exl3
- Modelo base: https://huggingface.co/migtissera/Tess-4.5-27B
- Predecesor Tess-4-27B: https://huggingface.co/migtissera/Tess-4-27B
- Versión GGUF de Tess-4-27B: https://huggingface.co/migtissera/Tess-4-27B-GGUF
- Ficha de Tess-4.5-27B en Featherless: https://featherless.ai/models/migtissera/Tess-4.5-27B
- Ficha de Tess-4-27B en Featherless: https://featherless.ai/models/migtissera/Tess-4-27B
- Ficha de Tess-4-27B en Applied: https://theapplied.co/models/migtissera-tess-4-27b
