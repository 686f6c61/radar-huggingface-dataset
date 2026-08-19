# gojiberries/pranaam

## Resumen

Pranaam v3 es un modelo de clasificación de nombres desarrollado por el equipo de gojiberries (publicado en HuggingFace como gojiberries/pranaam) que produce estimaciones calibradas de patrones de nombres para escritura latina y devanagari. Su propósito declarado es la investigación agregada validada, como medir posibles disparidades de representación en conjuntos de datos públicos, y no está diseñado para etiquetar individuos ni tomar decisiones consecuentes. El modelo es relevante en el contexto de la IA responsable, ya que incorpora mecanismos explícitos de abstención, calibración de confianza y una revisión inmutable de los artefactos.

La arquitectura de la versión 3 es un modelo convolucional compacto a nivel de bytes en PyTorch, que procesa los bytes UTF-8 ordenados de los nombres mediante convoluciones paralelas, evitando la dependencia de un vocabulario de palabras completas. Esto corrige limitaciones de versiones anteriores (v1 y v2) relacionadas con el orden de los tokens, el manejo de palabras no vistas y la generalización a nombres no vistos. El repositorio ocupa 0.3 GB e incluye artefactos separados para inglés e hindi, cada uno con su propio modelo, metadatos y reporte de entrenamiento. No se especifica el número total de parámetros ni la longitud de contexto, ya que no es un modelo generativo sino un clasificador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo convolucional a nivel de bytes (byte-level convolutional) en PyTorch |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de clasificación, no generativo) |
| Tipos de cuantizacion | no disponible (los artefactos se distribuyen en safetensors) |
| Idiomas soportados | inglés (en), hindi (hi) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Pranaam v3 utiliza una arquitectura convolucional a nivel de bytes: convoluciones paralelas sobre los bytes UTF-8 ordenados de los nombres, lo que permite aprender fragmentos de ortografía sin depender de un vocabulario de palabras completas. Esta elección corrige cuatro limitaciones de las versiones anteriores: se preserva el orden de los tokens, las palabras no vistas ya no comparten un único token desconocido, el padding no afecta a la representación agrupada y los fragmentos ortográficos pueden generalizarse a nombres no vistos. Los artefactos se serializan en safetensors y los metadatos incluyen arquitectura, calibración, criterios de abstención, recuentos de particiones y procedencia de la evaluación.

Los datos de entrenamiento provienen de dos fuentes principales. Para inglés, se usan registros de tierras de Bihar (India) con etiquetas binarias "plata" (silver) obtenidas a través del cruce de casta/comunidad registrado, además de una partición autorizada de cabezas de hogar SEPRI directamente etiquetadas. Para hindi, se utilizan particiones agrupadas de registros de tierras. Los nombres normalizados se asignan a particiones hash deterministas para evitar que un mismo nombre aparezca en múltiples conjuntos de entrenamiento, validación, calibración y prueba. La calibración se realiza mediante Platt scaling con pendiente positiva, ajustada solo en la partición de calibración. No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado con etiquetas derivadas de registros administrativos.

## Capacidades

- Clasificación de nombres en escritura latina (inglés) y devanagari (hindi) para estimar patrones de nombre asociados a categorías comunitarias (en este caso, la etiqueta "musulmán" como proxy).
- Salida calibrada: el modelo devuelve una puntuación calibrada de probabilidad, no una etiqueta binaria cruda.
- Abstención explícita: el runtime puede abstenerse de emitir una estimación si la confianza es inferior a un umbral (por defecto 0.8), lo que reduce errores en casos ambiguos.
- Soporte de script: los inputs fuera del script soportado por el modelo seleccionado no se puntúan.
- Revisión inmutable: el runtime devuelve la revisión del modelo, lo que permite auditar qué versión produjo cada resultado.
- No es un modelo generativo: no genera texto, no admite tool calling, ni agentes, ni razonamiento multi-paso. Su única función es la clasificación de nombres.

## Casos de uso

- Investigación agregada sobre representación demográfica: el modelo puede usarse para estimar la proporción de nombres asociados a una comunidad en registros públicos (por ejemplo, listas de beneficiarios, censos) a nivel de población, sin necesidad de etiquetar manualmente cada registro.
- Auditoría de disparidades en servicios públicos: una administración podría analizar si ciertos grupos están subrepresentados en programas de asistencia, utilizando estimaciones agregadas sobre nombres de solicitantes.
- Estudios sociológicos y antropológicos: investigadores pueden explorar la evolución de patrones de nombres en distintas regiones o periodos, siempre que trabajen con datos agregados y no individuales.
- Validación de calidad de datos: el modelo puede ayudar a detectar inconsistencias en bases de datos de nombres (por ejemplo, errores de transcripción) al comparar la estimación del patrón con otros campos.
- Análisis de composición comunitaria en registros históricos: para estudios que requieran reconstruir la distribución de comunidades en documentos antiguos, donde no hay autoidentificación.
- Investigación en ciencias sociales computacionales: como componente en pipelines de análisis de texto que necesiten una variable proxy de comunidad a nivel agregado, siempre que se respeten las restricciones de uso.

## Benchmarks y rendimiento

La tabla siguiente resume los resultados de evaluación publicados en la model card. Se muestran las métricas para inglés e hindi en el umbral de decisión 0.5, antes de aplicar la regla de abstención de confianza 0.8. También se incluyen los resultados con la regla de abstención por defecto.

| Modelo | Fuente de prueba | Filas | Accuracy | Precisión musulmana | Recall musulmán | F1 musulmán | Brier | ECE 10 bins |
|---|---|---|---:|---:|---:|---:|---:|---:|
| English v3 | Cabezas SEPRI retenidos | 18,133 | 97.46% | 90.29% | 82.49% | 0.862 | 0.0205 | 0.0052 |
| Hindi v3 | Holdout de tierras agrupado | 152,390 | 98.58% | 94.30% | 93.05% | 0.937 | 0.0116 | 0.0037 |

Con la regla de abstención por defecto (confianza < 0.8), la cobertura es del 96.54% para inglés y 97.99% para hindi, con una precisión sobre las estimaciones retenidas del 98.54% y 99.18% respectivamente. El autor también reporta una auditoría pareada que compara v3 con v2, mostrando una mejora de 1.19 puntos porcentuales en precisión, 15.62 puntos en recall musulmán, 0.086 en F1 y 0.0122 en Brier, aunque la precisión musulmana fue 2.04 puntos menor. El autor advierte que estos resultados son de carácter "developmental" (la partición de evaluación se inspeccionó durante el desarrollo de la arquitectura) y no deben considerarse evidencia confirmatoria prístina.

## Requisitos de hardware

No se proporcionan datos específicos de VRAM, GPU recomendadas, latencia o throughput en la información disponible. El tamaño del repositorio es de 0.3 GB, lo que sugiere un modelo compacto, probablemente ejecutable en CPU, pero no hay confirmación oficial. Los artefactos se distribuyen en safetensors y se recomienda usar el paquete `pranaam` (https://github.com/appeler/pranaam) en lugar de cargar los tensores manualmente. No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, ya que el modelo no es un LLM generativo.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de clasificación de nombres con los que comparar directamente. La única comparación publicada es con la versión anterior del mismo modelo (v2), cuyos resultados se resumen en la sección de benchmarks. No se han encontrado alternativas equivalentes en la información proporcionada.

## Limitaciones y advertencias

- El modelo no debe utilizarse para etiquetar individuos, tomar decisiones consecuentes, determinar elegibilidad, dirigirse a personas ni reemplazar información autoidentificada. Su uso está restringido a investigación agregada validada.
- Las etiquetas de entrenamiento se derivan de registros de casta/comunidad o de hogares, que pueden ser incorrectas o conceptualmente incompletas. Esto introduce ruido en las etiquetas "plata".
- Los resultados no establecen precisión para todos los estados, scripts, comunidades o periodos. El conjunto de prueba en hindi comparte la fuente de registros de tierras utilizada en el entrenamiento, aunque los nombres estén particionados.
- La evaluación se considera "developmental" y no confirmatoria, ya que la partición de prueba se inspeccionó durante el desarrollo de la arquitectura.
- El modelo solo soporta dos scripts (latino y devanagari) y dos idiomas (inglés e hindi). Nombres en otros sistemas de escritura no se puntúan.
- No se proporciona información sobre sesgos potenciales más allá de las advertencias del autor. La calibración está ajustada para los datos específicos de Bihar y SEPRI, por lo que su comportamiento en otros contextos geográficos o demográficos es incierto.
- La licencia MIT permite uso comercial, pero las restricciones de uso ético declaradas en la model card son vinculantes para el uso responsable.

## Enlaces

- HuggingFace: https://huggingface.co/gojiberries/pranaam
- Repositorio del paquete `pranaam`: https://github.com/appeler/pranaam
