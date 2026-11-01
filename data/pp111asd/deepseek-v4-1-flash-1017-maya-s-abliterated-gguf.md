# pp111asd/DeepSeek-V4.1-Flash-1017-Maya-S-abliterated-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Maya-S-abliterated-GGUF es un conjunto de parches en formato GGUF publicado por el usuario pp111asd sobre el modelo base DeepSeek-V4.1-Flash-1017 de DeepSeek. No se trata de un modelo completo, sino de shards de reemplazo (fragmentos de pesos) a los que se ha aplicado una edición de reducción de rechazos de rango 2 sobre 62 tensores por modelo, una técnica conocida como abliteration. El objetivo declarado es reducir las negativas del modelo ante peticiones, incluidas las dañinas, lo que convierte esta variante en un modelo sin censura (uncensored).

El repositorio ocupa 169 GB e incluye múltiples disposiciones de archivos (layouts) para distintas versiones del motor Maya (v1.1.16, v1.1.17, v1.1.24+) y para los formatos de Unsloth (UD-Q4_K_XL, UD-Q8_K_XL, UD-IQ3_S, UD-IQ3_XXS). El usuario debe descargar los shards no modificados de las fuentes upstream fijadas y sustituir únicamente el shard correspondiente al parche. La licencia es MIT.

Es relevante ahora porque ejemplifica una práctica creciente en la comunidad open source: la publicación de ediciones de pesos que alteran el comportamiento de seguridad de modelos grandes, distribuidas como parches diferenciales para ahorrar ancho de banda. Al mismo tiempo, plantea serias dudas sobre trazabilidad, seguridad y reproducibilidad en despliegues de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base DeepSeek-V4.1-Flash-1017; presumiblemente transformer MoE, sin confirmar) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ1_S, IQ2_XXS, Q6_K (Engram), UD-Q4_K_XL, UD-Q8_K_XL, UD-IQ3_S, UD-IQ3_XXS, BF16 (objetivos de edición en UD-Q8_K_XL) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (shards parciales; requiere pesos upstream) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base DeepSeek-V4.1-Flash-1017: no se especifican número de capas, dimensión oculta, configuración de expertos ni composición del dataset de entrenamiento. Lo que sí se documenta es el proceso de edición: se aplica una modificación de rango 2 sobre 62 tensores por modelo para reducir la tasa de rechazos. En los layouts Maya-S y en los objetivos Q8_0 añadidos los tensores se recuantizan; en los objetivos UD-Q8_K_XL se conserva el almacenamiento en BF16.

El repositorio incluye artefactos de trazabilidad poco habituales: un fichero `abliteration-edit.npz` con los parámetros de la edición, un script `apply_abliteration.py`, sumas de verificación SHA256 por shard y por upstream, y logs de diagnóstico. La distribución se organiza en layouts que dependen de la versión del motor Maya: el layout de seis shards (v1.1.17) se marca como recomendado, mientras que el de cuatro shards (v1.1.16) es histórico y el de Maya-XS (v1.1.24+) usa expertos IQ1_S y un drafter DSpark XS2 propio. Los layouts de Unsloth UD-IQ3_S y UD-IQ3_XXS no son cargables por Maya v1.1.17 y están pensados para motores como llama.cpp, sin probar.

## Capacidades

- Generación de texto en formato GGUF para motores compatibles con el formato de shards de Maya y con los GGUF de Unsloth.
- Reducción de rechazos: la edición de abliteration busca disminuir las negativas del modelo base, incluidas las de peticiones dañinas.
- Compatibilidad con decodificación especulativa mediante el drafter DSpark (ficheros `dspark/dspark.bin` y `dspark/dspark.json`).
- Soporte de Engram: el layout de seis shards incluye Engram Q6_K en los shards 5 y 6; el de cuatro shards requiere descargar el Engram de Unsloth por separado.
- Capacidades del modelo base (razonamiento, código, matemáticas, tool calling, multilingüismo): no documentadas en la información disponible para esta variante.
- No se documentan capacidades de visión, audio ni modo thinking específicas de esta edición.

## Casos de uso

- Investigación sobre alineación y seguridad: el repositorio permite estudiar empíricamente cómo una edición de rango 2 sobre 62 tensores afecta a la tasa de rechazos, comparando el modelo parcheado con el base mediante los logs y checksums incluidos.
- Evaluación de robustez de filtros: equipos de seguridad pueden usar esta variante para probar si sus capas de moderación externas detectan contenido que el modelo base rechazaría, ya que la edición elimina parte de esas negativas internas.
- Reproducción de experimentos de abliteration: el script `apply_abliteration.py` y el fichero `abliteration-edit.npz` permiten replicar la edición sobre los mismos shards upstream fijados por revisión inmutable.
- Despliegue local con cuantización agresiva: el layout Maya-XS con expertos IQ1_S (~120 GB de pesos más Engram Q6_K) está pensado para entornos con recursos limitados que necesitan ejecutar un modelo de gran tamaño en disco y memoria moderados.
- Pruebas de motores de inferencia: los layouts de Unsloth UD-IQ3_S y UD-IQ3_XXS sirven para validar la carga de GGUF de 1017 en llama.cpp u otros motores, aunque el autor indica que no están probados.
- Auditoría de cadena de suministro de modelos: los ficheros `UPSTREAM_SHA256SUMS` y `SHA256SUMS` permiten verificar que los shards sustituidos coinciden byte a byte con lo publicado, útil en pipelines de CI que validan artefactos antes de desplegarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una "comparación completa" en los layouts Maya-S, pero no incluye cifras de MMLU, HumanEval, GSM8K ni métricas equivalentes.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia de tamaño, el shard IQ2_XXS de reemplazo pesa 35.532.532.032 bytes (~33,1 GiB) y el shard IQ1_S de Maya-XS pesa 19.784.230.848 bytes (~18,4 GiB); el conjunto completo de pesos Maya-XS se describe como ~120 GB más el Engram Q6_K.
- GPU recomendadas: no disponibles en la información proporcionada.
- ¿Cabe en GPU de consumo? No confirmado; por el tamaño de los shards, un despliegue completo excede con claridad la VRAM de GPUs de consumo individuales.
- Opciones de despliegue: motor Maya (v1.1.16, v1.1.17 o v1.1.24+ según layout) y llama.cpp para los GGUF de Unsloth (UD-IQ3_S y UD-IQ3_XXS, sin probar). vLLM, Ollama y TGI no se mencionan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| pp111asd/DeepSeek-V4.1-Flash-1017-Maya-S-abliterated-GGUF | no disponible | no disponible | MIT | GGUF (parches) | Edición abliterated; requiere shards upstream |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | no disponible | no disponible | no disponible | no disponible | Modelo base original |
| mrfakename/DeepSeek-V4.1-Flash-1017-abliterated | no disponible | no disponible | no disponible | no disponible | Variante abliterated alternativa del mismo base |
| unsloth/DeepSeek-V4.1-Flash-1017-GGUF | no disponible | no disponible | no disponible | GGUF | Cuantizaciones UD estándar sin edición |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo sin censura: la edición está diseñada para reducir rechazos, incluidas las peticiones dañinas; las salidas pueden ser peligrosas, ilegales, sesgadas u ofensivas.
- El propio autor advierte de que ni la ausencia de rechazo ni la fluidez garantizan seguridad o exactitud.
- No es un modelo autónomo: requiere descargar shards upstream de fuentes fijadas por revisión; mezclar layouts o renombrar ficheros de cuatro shards como si fueran seis provoca fallos.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el del modelo base.
- Sesgos conocidos: no documentados; la edición puede amplificar sesgos al eliminar negativas.
- Idiomas soportados: no disponibles.
- Restricciones de licencia: MIT permite uso comercial, pero el despliegue de un modelo abliterated conlleva responsabilidad legal y ética sobre el contenido generado.
- Trazabilidad: el repositorio referencia un `PATCH_REPO` distinto (`Kiwimaker/...`) del ID de HuggingFace del autor (`pp111asd/...`), lo que conviene verificar antes de confiar en los checksums.
- Los layouts UD-IQ3_S y UD-IQ3_XXS no están probados y no cargan en Maya v1.1.17.
- Sin descargas ni likes en el momento de la consulta: ausencia de validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/pp111asd/DeepSeek-V4.1-Flash-1017-Maya-S-abliterated-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Upstream Maya GGUF: https://huggingface.co/peasantsmith/DeepSeek-V4.1-Flash-1017-Maya-GGUF
- Variante abliterated alternativa: https://huggingface.co/mrfakename/DeepSeek-V4.1-Flash-1017-abliterated
- Cuantizaciones Unsloth: https://huggingface.co/unsloth/DeepSeek-V4.1-Flash-1017-GGUF
