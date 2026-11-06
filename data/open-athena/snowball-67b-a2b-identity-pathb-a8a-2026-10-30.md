# open-athena/Snowball-67B-A2B-Identity-PathB-A8a-2026.10.30

## Resumen

Snowball 67B A2B Identity Path B A8a es un checkpoint de investigación publicado por la organización open-athena dentro del ecosistema del proyecto Marin. Se trata de un artefacto experimental derivado de Marin Snowball v0.1 (ADC0078a) que incorpora un perfil de identidad entrenado denominado "Marin's Latest MoE", desarrollado por la Marin Community. El modelo se distribuye como un ajuste de identidad sobre una inicialización fresca, con el objetivo declarado de estudiar cómo se comporta un modelo de mezcla de expertos ante un entrenamiento de identidad controlado y auditable.

La relevancia de este checkpoint es fundamentalmente metodológica: no es un modelo listo para producción, sino una pieza de investigación que documenta de forma exhaustiva su receta de entrenamiento, hashes de verificación, auditorías de tensores congelados y resultados de evaluación con intervalos de confianza. El autor declara explícitamente que el modelo no ha sido probado ni evaluado adecuadamente y que no es necesariamente seguro para uso en producción.

El modelo cuenta con 67.078.882.816 parámetros totales (aproximadamente 67 mil millones), un tamaño de repositorio de 134,2 GB en formato safetensors, y se etiqueta con el pipeline de text-generation. La arquitectura se identifica mediante el tag `grug_moe` como una mezcla de expertos, aunque la model card no detalla el número de parámetros activos ni la longitud de contexto soportada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (tag `grug_moe`), basada en transformer según la familia Marin Snowball |
| Parametros totales | 67.078.882.816 (aproximadamente 67B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la receta de entrenamiento usa secuencias de 8192 tokens) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint se basa en una arquitectura de mezcla de expertos (MoE) identificada por el tag `grug_moe` dentro de la familia Marin Snowball. La receta de entrenamiento parte de una inicialización fresca de v0.1 con semilla 310, batch global de 8, longitud de secuencia de 8192 tokens, tasa de aprendizaje constante de 2e-6 con dos actualizaciones de warmup y pesos de pérdida objetivo unitarios. El entrenamiento consta de 36 actualizaciones (updates), con 104 campos completamente congelados y 256 filas congeladas de embeddings y salidas de tokens especiales.

La auditoría de exportación verifica 502 tensores: 104 tensores nativos congelados y 398 conversiones (casts) de tensores maestros entrenados. El conjunto de datos de identidad incluye 126.492 tokens léxicos finales y 5.388 tokens de razonamiento de identidad, mientras que el replay aporta 616.153 tokens léxicos finales. De las 1.791 encounters trazadas elegibles, 179 retienen el razonamiento GLM existente y el resto usan el mismo renderizado OFF. El SHA256 del input empaquetado es `5a0a9e78ce813bce06b03ddfba636a85d2c7106351414f4d6285f1d3789030bc`, y los hashes restantes de la receta se conservan en KEEP.md y en el evento del checkpoint. No se documenta en la información disponible el uso de RLHF o DPO.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation con etiqueta conversational.
- Razonamiento: el checkpoint preserva y modifica segmentos de razonamiento (reasoning tokens) en un subconjunto controlado de encounters.
- Tool calling / function calling: evaluado mediante BFCL (Berkeley Function Calling Leaderboard) con cinco ejecuciones completas de 123 tareas.
- Matemáticas: evaluado con GSM8K y MATH500, con diferencias medidas frente a la referencia fresh-v0.1.
- Identidad controlada: el perfil entrenado responde como "Marin's Latest MoE" atribuyendo crédito a la Marin Community, con auditorías que reportan 34 nombres canónicos finales y 33 créditos de creador de Marin Community.
- Capacidades multilingües: no disponible (no se especifican idiomas).
- Modo thinking: no se documenta explícitamente como capacidad de producto; el razonamiento aparece como segmentos internos auditados.
- Visión y audio: no disponible.

## Casos de uso

- Investigación sobre alineación de identidad: el checkpoint permite estudiar cómo un ajuste SFT de identidad sobre una inicialización fresca afecta a las respuestas de auto-atribución del modelo, con métricas de spans cerrados y créditos de creador auditadas.
- Reproducibilidad de recetas MoE: los hashes SHA256 de inputs empaquetados, tensores fuente y listas de objetos permiten replicar exactamente el pipeline de entrenamiento y verificar la integridad byte a byte de los pesos.
- Auditoría de checkpoints: el manifiesto de preservación (PRESERVATION-SHA256.json, KEEP.md, UPLOAD-MANIFEST.json) sirve como caso de estudio para diseñar pipelines de archivado verificable de modelos.
- Evaluación de function calling: el modelo puede usarse como sujeto de prueba en BFCL para comparar el efecto de ajustes de identidad sobre la precisión en tool calling (media reportada de 26,17886% en cinco ejecuciones).
- Estudio de razonamiento matemático: GSM8K y MATH500 permiten medir cómo el ajuste de identidad degrada o mejora el razonamiento aritmético frente a la referencia (GSM8K -1,1120 pp; MATH500 +0,6667 pp).
- Análisis de bucles y fallos de generación: la model card documenta un caso en el que la salida cerró su razonamiento y entró en bucle hasta el límite de longitud, lo que convierte al checkpoint en material para estudiar modos de fallo en decodificación.
- Base para experimentos de continuación: al ser un artefacto de investigación con procedencia preservada, puede servir como punto de partida para nuevas rondas de entrenamiento controlado.

## Benchmarks y rendimiento

| Benchmark | Resultado | Referencia / comparación |
|---|---|---|
| BFCL (5 ejecuciones de 123 tareas) | 34, 35, 28, 34, 30; media 26,17886% | Diferencia vs fresh-v0.1: -1,4634 pp; IC bootstrap 95% [-4,8780, +1,4634] |
| GSM8K | -1,1120 pp vs referencia | IC 95% [-1,9206, -0,3033] |
| MATH500 | +0,6667 pp vs referencia | IC 95% [-0,4667, +1,8667] |

Nota: la model card indica que no se activó ninguna regla de parada registrada, que la pérdida en GSM8K persiste y que estos resultados no constituyen un hallazgo de no inferioridad ni de release. Las cohortes de evaluación son pequeñas y fijas, con solo cinco ejecuciones independientes de un checkpoint entrenado por brazo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 67,08B parámetros en safetensors (134,2 GB en fp16/bf16), la inferencia en precisión nativa requiere aproximadamente 134 GB de VRAM, lo que excede cualquier GPU consumer individual.
- GPU recomendadas: para pesos completos en bf16 se necesitan configuraciones multi-GPU (por ejemplo, 2× H100 80GB o 4× A100 80GB). No se dispone de guía oficial del autor.
- Cabe en GPU consumer: no en precisión nativa. Requeriría cuantización agresiva (no publicada) para acercarse a 24 GB, y aun así un modelo MoE de 67B difícilmente cabe en una sola RTX 4090.
- Opciones de despliegue: no se documentan en la model card. Al ser safetensors, sería compatible con vLLM o TGI si la arquitectura `grug_moe` está soportada por dichos frameworks; no se confirma soporte de llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Snowball 67B A2B Identity Path B A8a | 67,08B (MoE) | no disponible | openmdw-1.1 | Hugging Face (4 descargas) | Artefacto de investigación, sin aprobación de despliegue |
| Marin Snowball v0.1 (ADC0078a) | no disponible | no disponible | no disponible | Referencia base citada | Modelo base del que deriva el checkpoint |
| Fresh-v0.1 reference | no disponible | no disponible | no disponible | Referencia interna de evaluación | Brazo de control usado en BFCL, GSM8K y MATH500 |

No se dispone de información suficiente para comparar con modelos públicos de la misma categoría (por ejemplo, otros MoE de ~67B) en parámetros activos, contexto o rendimiento agregado.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo no ha sido probado ni evaluado adecuadamente y que no es necesariamente seguro; el uso en producción es bajo riesgo del usuario.
- El checkpoint es un artefacto experimental sin aprobación de despliegue ("no deployment approval").
- Las cohortes de evaluación son pequeñas y fijas: cinco ejecuciones independientes de un único checkpoint entrenado por brazo, lo que limita la potencia estadística.
- La comparación con la referencia fresh-v0.1 conserva diferencias de dosis, replay, empaquetado y agrupación, por lo que las diferencias medidas no son atribuibles de forma limpia al ajuste de identidad.
- La pérdida en GSM8K (-1,1120 pp) persiste y no se ha resuelto; el autor indica que esto no constituye un hallazgo de no inferioridad.
- Se documenta un caso de bucle hasta el límite de longitud tras cerrar el razonamiento, lo que indica riesgo de generaciones degeneradas.
- Las banderas históricas de identidad (7/52 ON) están confundidas por la segmentación de razonamiento del servidor; la lectura posterior con límites nativos encontró 52/52 spans cerrados, pero el autor advierte que esto no establece corrección amplia de identidad ni seguridad.
- No se especifican idiomas soportados, sesgos conocidos ni riesgos de alucinación más allá de las advertencias generales.
- La licencia openmdw-1.1 no se detalla en la información disponible; deben consultarse sus términos para uso comercial.
- Las cadenas de evaluación SWE100 y otras podrían seguir activas en el momento del archivado; la model card no reclama resultados no observados.
- El repositorio tiene solo 4 descargas y 0 likes, lo que sugiere una adopción muy limitada y escasa validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/open-athena/Snowball-67B-A2B-Identity-PathB-A8a-2026.10.30
- Procedencia S3 (referenciada en la model card): `s3://marin-rno2a/marin/checkpoints/karan/snowball-identity-pathb/A8a-u36/`
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
