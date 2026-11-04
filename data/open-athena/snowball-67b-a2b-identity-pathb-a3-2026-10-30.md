# open-athena/Snowball-67B-A2B-Identity-PathB-A3-2026.10.30

## Resumen

Snowball 67B A2B Identity Path B A3 es un artefacto de investigación publicado por la organización open-athena en HuggingFace. Se trata de un checkpoint derivado de Marin Snowball v0.1 (identificador ADC0078a), entrenado específicamente con un perfil de identidad ("Marin's Latest MoE") mediante un proceso de SFT de identidad sobre una arquitectura MoE de tipo grug_moe. El modelo cuenta con 67.078.882.816 parámetros totales (aproximadamente 67 mil millones) y un repositorio de 134,2 GB en formato safetensors.

La relevancia de este modelo es fundamentalmente metodológica: el autor documenta con detalle el proceso de entrenamiento (36 actualizaciones, semilla 310, batch global 8, longitud de secuencia 8192, learning rate constante de 2e-6 con dos actualizaciones de warmup) y los protocolos de auditoría de identidad. No se trata de un modelo destinado a producción, sino de una pieza de investigación sobre cómo se comporta y se puede auditar la identidad de un modelo tras un ajuste fino específico.

El propio autor advierte explícitamente de que el modelo no ha sido probado ni evaluado adecuadamente y que no es necesariamente seguro. La model card incluye resultados parciales de evaluación (BFCL con una media del 31,06% sobre cinco ejecuciones de 123 tareas) y describe la proveniencia de los archivos, pero no ofrece especificaciones sobre idiomas, benchmarks estándar de razonamiento o matemáticas, ni datos de rendimiento comparativo con modelos similares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | grug_moe (MoE, derivada de Marin Snowball) |
| Parametros totales | 67.078.882.816 (67B) |
| Parametros activos | no disponible (el sufijo A2B sugiere ~2B activos, no confirmado en la información) |
| Longitud de contexto | no disponible (entrenado con longitud de secuencia 8192) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura grug_moe, una variante de mezcla de expertos (MoE) asociada al proyecto Marin Snowball. El checkpoint es el resultado de un ajuste fino de identidad sobre una inicialización fresca de v0.1 (semilla 310) con batch global 8, longitud de secuencia 8192, learning rate constante de 2e-6 y dos actualizaciones de warmup, durante un total de 36 actualizaciones. El proceso congela 104 campos completamente y 256 filas de embeddings/tokens especiales de salida.

La auditoría de exportación verifica 502 tensores: 104 tensores nativos congelados y 398 conversiones (casts) de tensores maestros entrenados. Todas las ocurrencias de identidad en estado ON se convirtieron a su representación OFF de la misma fuente. Los datos de entrenamiento incluyen 129.641 tokens léxicos finales de identidad y 635.510 tokens léxicos de replay, con un SHA256 del input empaquetado documentado. No se especifica el número total de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La model card menciona que las comparaciones retienen diferencias de dosis, replay, empaquetado y agrupación, lo que indica un diseño experimental controlado pero con múltiples variables.

## Capacidades

- Generación de texto conversacional (pipeline_tag: text-generation, conversacional).
- Tool calling / function calling: evaluado con BFCL (Berkeley Function Calling Leaderboard) en cinco ejecuciones completas de 123 tareas.
- Perfil de identidad entrenado: el modelo ha sido ajustado para adoptar la identidad "Marin's Latest MoE" desarrollada por la Marin Community, con auditoría de 44 créditos de creador y cero autoafirmaciones ajenas.
- Capacidades multilingües: no disponible.
- Razonamiento multi-paso y agentes: no documentado explícitamente; la evaluación BFCL sugiere soporte básico de tool calling.
- Modo thinking o razonamiento extendido: no disponible.
- Visión y audio: no disponible.

## Casos de uso

- Investigación sobre identidad de modelos: el checkpoint permite estudiar cómo un ajuste fino de identidad (36 actualizaciones, 129.641 tokens de identidad) modifica el comportamiento del modelo y cómo se puede auditar dicho cambio mediante protocolos de tensores congelados y verificación de hashes.
- Reproducibilidad de experimentos MoE: al preservar la proveniencia byte a byte (SHA256 del input empaquetado, receipt de tensores fuente y object-list), sirve como referencia para replicar recetas de ajuste fino sobre arquitecturas grug_moe.
- Evaluación de protocolos de auditoría: el modelo documenta un protocolo de auditoría de 502 tensores (104 congelados, 398 casts) que puede usarse como caso de estudio para diseñar verificaciones de integridad en pipelines de investigación.
- Estudio de evaluación BFCL: los resultados de cinco ejecuciones de 123 tareas (media 31,06%) permiten analizar la variabilidad de un checkpoint de investigación en tareas de function calling con cohorts fijos y pequeños.
- Análisis de sesgos de identidad: la conversión sistemática de ocurrencias ON a OFF y la lectura de límites nativos (50/52 spans cerrados, 31 nombres canónicos finales) ofrecen material para estudiar cómo se manifiestan y se corrigen sesgos de identidad en modelos ajustados.
- Docencia y formación en IA open source: como artefacto con documentación exhaustiva de receta, hashes y advertencias, puede emplearse en cursos sobre buenas prácticas de publicación de checkpoints y preservación de proveniencia.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| BFCL (function calling) | 31,06% de media | Cinco ejecuciones completas de 123 tareas |
| Identity screen (parser histórico) | 42/52 flags ON de formato | El mismo parser marcó 52/52 en v0.1; no establece daño al modelo |
| Native-boundary read | 50/52 spans ON cerrados; 31 nombres canónicos finales; 44 créditos de creador; 0 autoafirmaciones ajenas | Dos salidas sin cierre no reciben crédito final |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible. El autor indica que SWE100 y otras cadenas de evaluación podrían seguir activas en el momento del archivo y que la tarjeta no reclama resultados no observados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 67B parámetros en safetensors (134,2 GB de repositorio), la inferencia en BF16 requeriría del orden de 134 GB de VRAM, lo que excede cualquier GPU consumer individual.
- GPU recomendadas: no disponible. Por tamaño, un despliegue en BF16 requeriría múltiples A100/H100 (por ejemplo, 2×H100 80GB o 4×A100 80GB) o GPUs con mayor memoria; esta estimación no está confirmada por el autor.
- Cabe en consumer GPU: no en BF16. No se documentan cuantizaciones (GGUF, GPTQ, AWQ) que permitan reducir el requisito.
- Opciones de despliegue: no disponible. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo con modelos de la misma categoría en la información proporcionada. El modelo deriva de Marin Snowball v0.1 (ADC0078a), que podría servir como referencia interna, pero no se ofrecen métricas comparativas entre ambos más allá de los recuentos del parser de identidad (42/52 en este checkpoint frente a 52/52 en v0.1). No se identifican alternativas públicas comparables con datos verificables en la información disponible.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo no ha sido probado ni evaluado adecuadamente y que no es necesariamente seguro; su uso en producción es bajo responsabilidad del usuario.
- Es un artefacto de investigación sin aprobación de despliegue ("no deployment approval").
- Las evaluaciones se basan en cohorts fijos y pequeños, con solo cinco ejecuciones independientes de un checkpoint entrenado por brazo; ni las puntuaciones ni el cierre del protocolo establecen corrección amplia de identidad, seguridad o preparación para release.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Sesgos conocidos: no documentados más allá del perfil de identidad entrenado y su auditoría.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe.
- Licencia openmdw-1.1: se debe revisar el texto completo de la licencia para confirmar condiciones de uso comercial; la información proporcionada no detalla restricciones específicas.
- El modelo está entrenado para adoptar una identidad concreta ("Marin's Latest MoE"), lo que puede producir respuestas sesgadas en consultas sobre su propia naturaleza u origen.
- El repositorio incluye archivos de proveniencia y auditoría (PRESERVATION-SHA256.json, KEEP.md, UPLOAD-MANIFEST.json) que deben conservarse para mantener la trazabilidad.

## Enlaces

- HuggingFace: https://huggingface.co/open-athena/Snowball-67B-A2B-Identity-PathB-A3-2026.10.30
- Proveniencia fuente (S3): s3://marin-rno2a/marin/checkpoints/karan/snowball-identity-pathb/A3-u36/
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código ni demos adicionales.
