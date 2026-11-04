# open-athena/Snowball-67B-A2B-Identity-PathB-A13-2026.10.30

## Resumen

Snowball 67B A2B Identity Path B A13 es un checkpoint de investigación publicado por open-athena dentro del ecosistema Marin, un proyecto de entrenamiento abierto de modelos. Se trata de un artefacto experimental derivado de Marin Snowball v0.1 (ADC0078a) que incorpora un perfil de identidad entrenado denominado "Marin's Latest MoE", desarrollado por la Marin Community. El modelo se distribuye como un Mixture of Experts (MoE) de aproximadamente 67.079 millones de parámetros totales, con pesos en formato safetensors y un repositorio de 134,2 GB.

El checkpoint corresponde a la receta A13, una variante de A8a con una modificación concreta: cada fila de replay con modo thinking activado en las familias de herramientas (tool_first_call, tool_call_after_result, tool_reply) se duplica una vez, y los datos se empaquetan hasta 36 actualizaciones. El entrenamiento parte de una inicialización fresca de v0.1 con semilla 310, batch 8, longitud de secuencia 8192 y learning rate 2e-6 con dos actualizaciones de warmup.

La relevancia de este modelo es fundamentalmente investigadora: explora cómo se comporta el entrenamiento de identidad y el ajuste fino supervisado (SFT) sobre una arquitectura MoE, con auditorías de exportación y evaluaciones de función (BFCL) documentadas. El propio autor advierte que no ha sido probado ni evaluado adecuadamente y que no es necesariamente seguro para producción. No es un modelo de propósito general listo para desplegar, sino una pieza de un programa de investigación sobre identidad, replay y tool calling en modelos MoE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) tipo grug_moe, base Marin Snowball v0.1 |
| Parametros totales | 67.078.882.816 (67,08 B) |
| Parametros activos | no disponible (la nomenclatura "A2B" sugiere ~2 B activos, sin confirmación en la informacion disponible) |
| Longitud de contexto | 8192 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de mezcla de expertos (MoE) etiquetada como "grug_moe" dentro del stack Marin, con 67.078.882.816 parámetros totales. El checkpoint A13 se entrena desde una inicialización fresca de Marin Snowball v0.1 (ADC0078a), con semilla 310, batch de 8, longitud de secuencia de 8192 y learning rate de 2e-6 con dos actualizaciones de warmup, hasta completar 36 actualizaciones. La receta congela 104 campos completamente, incluidos los embeddings de tokens especiales y las filas de salida, y la auditoría de exportación verifica 502 tensores: 104 tensores nativos congelados y 398 conversiones de tensores maestros entrenados.

La innovación de la receta A13 respecto a A8a es la duplicación in situ de cada fila de replay con thinking activado en las familias de herramientas (tool_first_call, tool_call_after_result, tool_reply), seguida de un empaquetado de datos hasta 36 actualizaciones. Los datos de identidad incluyen 124.846 tokens léxicos finales y 5.388 tokens de razonamiento de identidad, mientras que el replay aporta 612.974 tokens léxicos finales. El hash SHA256 de la entrada empaquetada es f860030d1266c90d146ef07995a95ce7501989727cf226217de82a87408c15ba. No se documentan en la información disponible detalles sobre RLHF o DPO.

## Capacidades

- Generación de texto conversacional y de tipo text-generation, según el pipeline declarado.
- Soporte de tool calling / function calling, evidenciado por las familias de datos de entrenamiento (tool_first_call, tool_call_after_result, tool_reply) y la evaluación BFCL.
- Modo thinking (razonamiento) con variantes ON y OFF, usado en la pantalla de identidad de 52 prompts centrales.
- Comportamiento de identidad entrenado: el modelo aprende a identificarse con nombres canónicos y a atribuir crédito de creador a la Marin Community.
- Razonamiento multi-paso en el contexto de llamadas a herramientas, con replays de resultados intermedios.
- Capacidades multilingües: no disponible.
- Visión o audio: no disponible.

## Casos de uso

- Investigación sobre entrenamiento de identidad en MoE: el checkpoint permite estudiar cómo el SFT de identidad afecta a las respuestas de autoidentificación, con métricas de nombres canónicos y créditos de creador medidas en 52 prompts centrales.
- Evaluación de tool calling en investigación: sirve como base para reproducir las cinco ejecuciones BFCL de 123 tareas y comparar la receta A13 con A8a y con la referencia v0.1 fresca, dado que el autor documenta los intervalos de confianza bootstrap.
- Estudio de recetas de replay y empaquetado: la duplicación de filas de replay con thinking ON en familias de herramientas permite analizar el efecto del replay en el comportamiento de llamadas a herramientas.
- Auditoría de exportación y preservación de checkpoints: el repositorio incluye PRESERVATION-SHA256.json, KEEP.md, UPLOAD-MANIFEST.json y registros de auditoría de almacenamiento, útiles como caso de estudio de trazabilidad de artefactos de investigación.
- Análisis de congelación de parámetros: con 104 campos congelados y 398 conversiones auditadas, es un caso práctico para estudiar el impacto de congelar embeddings especiales y filas de salida durante el SFT.
- Reproducción de experimentos de seguridad de identidad: la pantalla de identidad con modo thinking ON y OFF permite analizar fallos de formato de frontera y autoafirmaciones foráneas en un entorno controlado de investigación.

## Benchmarks y rendimiento

| Benchmark | Resultado | Referencia |
|---|---|---|
| BFCL (5 ejecuciones completas de 123 tareas) | 40, 39, 34, 32 y 29 (media 28,29268 %, SD muestral 3,78726 pp) | Diferencia vs. v0.1 fresca: +0,6504 pp, IC 95 % bootstrap [-3,415, +4,390]; vs. A8a: +2,1138 pp, IC 95 % [-1,463, +5,691] |
| Pantalla de identidad (52 prompts centrales, thinking OFF) | 29 nombres canónicos finales, 31 créditos de creador Marin Community, 1 autoafirmación foránea, 0 fallos de formato de frontera | Lectura role-aware en frontera nativa sobre 132 prompts originales |
| Pantalla de identidad (52 prompts centrales, thinking ON) | 35 nombres canónicos finales, 32 créditos de creador Marin Community, 0 autoafirmaciones foráneas finales, 1 fallo de formato de frontera | Lectura role-aware en frontera nativa sobre 132 prompts originales |

El autor señala explícitamente que las cohortes de evaluación son pequeñas y fijas, con solo cinco ejecuciones independientes de un único checkpoint entrenado por brazo, y que los intervalos de confianza incluyen cero; no constituyen un hallazgo de no inferioridad ni de preparación para release. SWE100 y otras cadenas de evaluación podrían seguir activas en el momento del archivado y no se reclama ningún resultado no observado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 67,08 B de parámetros en safetensors, la inferencia en BF16 requeriría aproximadamente 134 GB de VRAM, y en cuantización de 8 bits unos 67 GB, aunque no se distribuyen pesos cuantizados.
- GPU recomendadas: para BF16 se necesitarían múltiples A100 de 80 GB o H100 de 80 GB; no cabe en una sola GPU consumer.
- Cabe en GPU consumer: no en BF16; solo sería viable con cuantizaciones agresivas no publicadas, por lo que no se puede confirmar.
- Opciones de despliegue: no disponible. El repositorio solo contiene safetensors; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Snowball 67B A2B Identity Path B A13 | 67,08 B (MoE) | 8192 | openmdw-1.1 | HuggingFace, 4 descargas |
| Marin Snowball v0.1 (ADC0078a) | no disponible | no disponible | no disponible | Referencia base citada en la model card |
| Receta A8a (variante previa) | no disponible | no disponible | no disponible | Referencia comparativa citada en la model card |

No se dispone de datos de benchmarks de modelos externos comparables en la información proporcionada, por lo que la comparativa se limita a las variantes internas del programa Marin.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo no ha sido probado ni evaluado adecuadamente y que no es necesariamente seguro; su uso en producción es bajo propio riesgo.
- El checkpoint es un artefacto experimental sin aprobación de despliegue.
- Las evaluaciones BFCL se basan en cinco ejecuciones de un único checkpoint por brazo, con intervalos de confianza que incluyen cero; no demuestran no inferioridad ni preparación para release.
- La pantalla de identidad muestra un fallo de formato de frontera con thinking ON y una autoafirmación foránea con thinking OFF, lo que indica que la corrección de identidad no está garantizada de forma amplia.
- Riesgo de alucinación: no cuantificado en la información disponible, pero relevante dado el estado experimental del checkpoint.
- Sesgos conocidos: no documentados en la información disponible.
- Limitaciones de idioma: los idiomas soportados no están disponibles.
- Restricciones de licencia: la licencia openmdw-1.1 debe consultarse para uso comercial; la model card no detalla condiciones adicionales.
- El repositorio preserva los archivos fuente byte a byte, pero la verificación de archivado es independiente de la evaluación y de la elegibilidad de borrado en S3.
- No se distribuyen pesos cuantizados ni se documentan métodos de despliegue, lo que dificulta su uso práctico fuera de entornos de investigación con hardware de gran escala.

## Enlaces

- HuggingFace: https://huggingface.co/open-athena/Snowball-67B-A2B-Identity-PathB-A13-2026.10.30
- Origen de datos S3 citado en la model card: s3://marin-rno2a/marin/checkpoints/karan/snowball-identity-pathb/A13-u36/
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
