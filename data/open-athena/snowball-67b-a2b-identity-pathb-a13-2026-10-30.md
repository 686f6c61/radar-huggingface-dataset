# open-athena/Snowball-67B-A2B-Identity-PathB-A13-2026.10.30

## Resumen

Snowball 67B A2B — Identity Path B A13 es un checkpoint de investigación publicado por open-athena (proyecto Marin) bajo la licencia OpenMDW 1.1. Se trata de un artefacto experimental derivado de Marin Snowball v0.1 (ADC0078a), entrenado específicamente para ajustar el perfil de identidad del modelo hacia "Marin's Latest MoE", desarrollado por la Marin Community. No es un modelo listo para producción: la propia model card lo describe como "research artifact" sin aprobación de despliegue ni evaluación exhaustiva.

El modelo parte de una arquitectura MoE (mezcla de expertos) con 67.078.882.816 parámetros totales y una configuración A2B (2 mil millones de parámetros activos por token, según la convención de nomenclatura). El entrenamiento consiste en un SFT de identidad muy acotado: 36 actualizaciones (updates) sobre un dataset empaquetado con secuencia de 8192 tokens, batch de 8 y learning rate de 2e-6, con 104 campos completamente congelados.

Su relevancia es metodológica más que práctica: documenta de forma rigurosa el proceso de entrenamiento, auditoría de tensores, hashes de procedencia y evaluación de identidad con cohortes fijas. El checkpoint incluye resultados de BFCL (tool calling) con cinco ejecuciones independientes y una comparación estadística frente a la inicialización fresca v0.1 y frente a la receta A8a, con intervalos de confianza bootstrap que incluyen el cero en ambos casos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), configuración A2B, framework Marin |
| Parametros totales | 67.078.882.816 |
| Parametros activos | no disponible (la nomenclatura A2B sugiere ~2B activos, sin confirmación numérica en la información) |
| Longitud de contexto | 8192 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer con arquitectura de mezcla de expertos (MoE) construido sobre el framework Marin, identificado en los tags como `grug_moe`. La configuración A2B indica, por convención de nomenclatura, aproximadamente 2 mil millones de parámetros activos por token sobre un total de 67 mil millones. No se dispone de detalles adicionales sobre el número de expertos, el mecanismo de enrutamiento ni la composición del dataset de preentrenamiento en la información proporcionada.

El entrenamiento de esta versión es un SFT de identidad (identity-sft) de solo 36 actualizaciones sobre la receta A8a, con un único cambio: cada fila de replay con thinking activado en las familias de herramientas (`tool_first_call`, `tool_call_after_result`, `tool_reply`) se duplica una vez en su lugar antes de empaquetar los datos. Se parte de inicialización fresca v0.1, semilla 310, batch 8, longitud de secuencia 8192, learning rate 2e-6 con dos actualizaciones de warmup, 104 campos completamente congelados y filas de embedding de tokens especiales y de salida congeladas. La auditoría de exportación verifica 502 tensores: 104 tensores nativos congelados y 398 conversiones de tensores maestros entrenados. Los tokens léxicos finales de identidad son 124.846, los tokens de razonamiento de identidad 5.388 y los tokens léxicos finales de replay 612.974.

## Capacidades

- Generación de texto conversacional y text-generation según el pipeline declarado.
- Tool calling / function calling: el entrenamiento incluye familias de herramientas (`tool_first_call`, `tool_call_after_result`, `tool_reply`) y se evalúa con BFCL.
- Modo thinking: el modelo distingue entre thinking ON y thinking OFF, con datos de replay específicos para cada modo.
- Perfil de identidad ajustado: responde con el nombre canónico de identidad y acredita a Marin Community como creador en la mayoría de prompts de la pantalla de identidad (29-35 de 52 prompts core según modo).
- Capacidades multilingües: no disponible.
- Razonamiento matemático y de código: la model card menciona cadenas de evaluación SWE100, matemáticas e identidad nativa, pero sin resultados publicados en la información disponible.

## Casos de uso

- Investigación sobre alineación de identidad: el checkpoint sirve como caso de estudio reproducible para analizar cómo un SFT acotado (36 updates) modifica el perfil de identidad de un modelo base, con hashes y recetas auditables.
- Evaluación de metodologías de tool calling: las cinco ejecuciones BFCL con intervalos bootstrap permiten estudiar la varianza de evaluación en tareas de function calling con cohortes pequeñas.
- Reproducción de experimentos de entrenamiento: la procedencia completa (hashes SHA256, KEEP.md, manifiestos de upload) permite replicar el pipeline de entrenamiento y auditoría.
- Análisis de congelación de parámetros: los 104 campos congelados y las 398 conversiones documentadas permiten estudiar técnicas de entrenamiento selectivo en modelos MoE grandes.
- Estudio de modos thinking ON/OFF: la duplicación selectiva de filas de replay en familias de herramientas permite analizar el efecto del replay en el comportamiento de razonamiento.
- Docencia y formación en ingeniería de modelos: como artefacto documentado de extremo a extremo, sirve para enseñar trazabilidad de checkpoints, auditoría de tensores y protocolos de evaluación estadística.

## Benchmarks y rendimiento

Resultados de BFCL (Berkeley Function Calling Leaderboard), cinco ejecuciones completas de 123 tareas en orden de slot original:

| Ejecucion | Puntuacion |
|---|---|
| Slot 1 | 40 |
| Slot 2 | 39 |
| Slot 3 | 34 |
| Slot 4 | 32 (slot original y primer reemplazo incompletos por infraestructura, retenidos con resultados NULL; el segundo reemplazo autorizado suministra el slot) |
| Slot 5 | 29 |
| Media | 28,29268 % |
| Desviacion estandar muestral | 3,78726 pp |

Comparaciones declaradas por el autor:

| Comparacion | Diferencia | IC 95% bootstrap |
|---|---|---|
| vs. fresh-v0.1 (cinco ejecuciones) | +0,6504 pp | [-3,415, +4,390] |
| vs. A8a | +2,1138 pp | [-1,463, +5,691] |

Ambos intervalos incluyen el cero; el autor indica explícitamente que no es un hallazgo de no inferioridad ni de release. La pantalla de identidad nativa (132 prompts, 52 core) reporta: thinking OFF, 29 nombres canónicos finales, 31 créditos a Marin Community, una auto-atribución foránea y ningún fallo de formato de frontera; thinking ON, 35 nombres canónicos finales, 32 créditos a Marin Community, ninguna auto-atribución foránea final y un fallo de formato de frontera.

La tabla de evaluación Evalchemy/Harbor incluida en la model card aparece truncada en la información disponible (columnas math500, humanevalplus, mbppplus, olympiadbench, gsm8k-0shot, piqa, winogrande, boolq, truthfulqa, triviaqa sin valores). No se han publicado resultados completos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 67.078.882.816 parámetros, en BF16 se requieren aproximadamente 134 GB solo para pesos, lo que exige múltiples GPUs. En cuantización de 8 bits rondaría los 67 GB; en 4 bits, unos 34 GB, aunque no se confirman formatos GGUF ni cuantizaciones publicadas.
- GPU recomendadas: para BF16, configuraciones multi-GPU como 2x H100 80GB o 4x A100 40GB; para cuantizaciones agresivas, una RTX 4090 (24 GB) podría no ser suficiente ni siquiera en 4 bits dado el tamaño.
- Cabe en consumer GPU: no en configuraciones estándar de una sola GPU consumer; requeriría cuantización muy agresiva no publicada.
- Opciones de despliegue: no disponible. El formato es safetensors; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Snowball 67B A2B Identity Path B A13 | 67.078.882.816 | 8192 | OpenMDW 1.1 | Hugging Face (research) | Checkpoint de investigación sin aprobación de despliegue |
| Marin Snowball v0.1 (ADC0078a) | no disponible | no disponible | no disponible | Referenciado como base | Inicialización de referencia para comparaciones BFCL |
| Receta A8a (variante) | no disponible | no disponible | no disponible | Referenciado en la model card | Brazo de comparación con diferencia de +2,1138 pp en BFCL |

No se dispone de datos suficientes sobre modelos comparables de la misma categoría (MoE ~67B con tool calling) en la información proporcionada para establecer una comparativa técnica más amplia.

## Limitaciones y advertencias

- Artefacto de investigación sin evaluación exhaustiva: la model card declara explícitamente que el modelo no ha sido probado ni evaluado adecuadamente y que no es necesariamente seguro.
- Sin aprobación de despliegue: el checkpoint es experimental y no cuenta con autorización para producción.
- Riesgo de alucinación: no cuantificado; los benchmarks de truthfulqa y triviaqa aparecen sin valores en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- Limitaciones de contexto: la longitud de secuencia de entrenamiento es 8192 tokens; no se especifica si el contexto efectivo de inferencia es mayor.
- Idiomas soportados: no especificados; la model card no declara cobertura multilingüe.
- Restricciones de licencia: OpenMDW 1.1; deben revisarse los términos para uso comercial, no detallados en la información disponible.
- Resultados estadísticos no concluyentes: los intervalos de confianza de BFCL incluyen el cero en ambas comparaciones; el autor advierte que ni las puntuaciones ni el cierre del protocolo establecen corrección de identidad amplia, seguridad ni preparación para release.
- Cohortes de evaluación pequeñas: cinco ejecuciones independientes de un único checkpoint entrenado por brazo, con diferencias de dosis, replay, empaquetado y agrupación retenidas en las comparaciones.
- Cadenas de evaluación potencialmente activas: SWE100 y otras cadenas pueden seguir en ejecución en el momento del archivado; la model card no reclama resultados no observados.

## Enlaces

- Hugging Face: https://huggingface.co/open-athena/Snowball-67B-A2B-Identity-PathB-A13-2026.10.30
- Procedencia S3 referenciada: s3://marin-rno2a/marin/checkpoints/karan/snowball-identity-pathb/A13-u36/
- Framework Marin: no disponible enlace directo en la información proporcionada
- Paper: no disponible
- Blog o demo: no disponible
- Repositorio de código: no disponible enlace directo; se referencian commits de Marin main (8d789914, d21aaea1) y Harbor (9d099696a567f489a111dc7e3c61183c98f007f0)
