# open-athena/Snowball-67B-A2B-Identity-PathB-A3-2026.10.30

## Resumen

Snowball 67B A2B Identity Path B A3 es un checkpoint de investigación publicado por el colectivo open-athena dentro del ecosistema Marin. Se trata de un artefacto experimental derivado de Marin Snowball v0.1 (ADC0078a), entrenado con un proceso de ajuste de identidad (identity-SFT) sobre una inicialización fresca de la versión v0.1, con el objetivo de internalizar un perfil de identidad concreto denominado "Marin's Latest MoE". El modelo no está pensado para producción: la propia model card lo describe como un artefacto de investigación sin evaluación adecuada ni aprobación de despliegue.

El modelo cuenta con 67.078.882.816 parámetros totales según los tensores safetensors publicados, y su nombre sugiere una arquitectura MoE con aproximadamente 2.000 millones de parámetros activos por token (notación A2B), aunque este dato no se confirma explícitamente en la información disponible. El repositorio ocupa 134,2 GB y se distribuye bajo licencia openmdw-1.1. La etiqueta `grug_moe` y la referencia a Marin apuntan a una arquitectura de mezcla de expertos dentro del stack de entrenamiento Marin.

La relevancia de esta ficha es doble: por un lado, documenta un experimento de alineación de identidad con auditoría detallada de pesos congelados y verificaciones criptográficas; por otro, sirve como ejemplo de buenas prácticas de preservación de procedencia (hashes SHA256, manifiestos de preservación, registros de eventos) en publicaciones de investigación. No obstante, cualquier uso práctico debe considerar que se trata de un checkpoint intermedio sin validación amplia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), etiqueta `grug_moe`, stack Marin |
| Parametros totales | 67.078.882.816 |
| Parametros activos | aproximadamente 2B (inferido de la notación A2B; no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible (el entrenamiento usó secuencia de 8192) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE), identificado por la etiqueta `grug_moe` y el nombre del modelo (A2B sugiere 2B parámetros activos sobre 67B totales). El checkpoint es un ajuste de identidad (identity-SFT) sobre una inicialización fresca de Marin Snowball v0.1 (ADC0078a). La receta de entrenamiento especifica: seed 310, batch global de 8, longitud de secuencia 8192, tasa de aprendizaje constante de 2e-6 con dos actualizaciones de warmup, pesos de pérdida objetivo unitarios, 104 campos completamente congelados y 256 filas congeladas de embeddings de tokens especiales y de salida. El checkpoint corresponde a 36 actualizaciones (36-update) de la ruta Path B A3.

La auditoría de exportación verifica 502 tensores: 104 tensores nativos congelados y 398 casts de tensores maestros entrenados. Todas las ocurrencias de identidad en estado ON se convirtieron a su representación OFF exacta de la misma fuente. Los totales de tokens léxicos finales de identidad son 129.641, con 0 tokens de razonamiento de identidad, y 635.510 tokens léxicos finales de replay. El SHA256 del input empaquetado es 954cc35a90487d1fb7b95080c9eeabb281d42d36f9a7ee9b32415bfa269e42f0. La procedencia se preserva byte a byte desde `s3://marin-rno2a/marin/checkpoints/karan/snowball-identity-pathb/A3-u36/`, con verificaciones SHA256 por archivo y manifiestos de preservación.

## Capacidades

- Generación de texto y conversación: pipeline `text-generation` con etiqueta `conversational`.
- Razonamiento de múltiples pasos: la evaluación incluye cadenas como SWE100 y otras cadenas de evaluación que podrían seguir activas en el momento del archivado.
- Uso de herramientas (tool calling): evaluado mediante BFCL (Berkeley Function Calling Leaderboard) con cinco ejecuciones completas de 123 tareas, con una media del 31,06 %.
- Capacidades matemáticas: evaluado en math500, gsm8k-0shot, olympiadbench, aime24 y mmlu-pro dentro de la campaña de evaluación.
- Capacidades de código: evaluado en humanevalplus, mbppplus, cruxeval y ds-1000-local.
- Capacidades de agente: evaluado en tau3-pi, bixbench-pi y SOTOPIA-hard.
- Capacidades multilingües: no disponibles; la model card no declara idiomas soportados.
- Modo de identidad: el checkpoint incorpora un perfil de identidad entrenado ("Marin's Latest MoE") con verificación de créditos de creador (44 créditos a Marin Community) y cero autoafirmaciones de identidad ajenas.

## Casos de uso

- Investigación sobre alineación de identidad: el checkpoint permite estudiar cómo un ajuste SFT de identidad afecta a las respuestas del modelo y a sus métricas de formato, con auditoría de pesos congelados y trazabilidad criptográfica completa.
- Reproducibilidad de experimentos de entrenamiento: la receta (seed, batch, LR, warmup, congelaciones) y los hashes permiten replicar o auditar el proceso en un entorno de investigación controlado.
- Evaluación comparativa de checkpoints intermedios: sirve como punto de comparación en campañas de evaluación (Evalchemy, Harbor) frente a otros brazos como A13, con métricas por benchmark y procedencia de prioridad documentada.
- Estudio de tool calling y agentes: las evaluaciones BFCL, tau3-pi y bixbench-pi permiten analizar el comportamiento de un MoE de 67B en tareas de función y agentes, aunque con cohortes pequeñas y cinco ejecuciones independientes.
- Análisis de robustez en matemáticas y código: los resultados en math500, olympiadbench, humanevalplus y cruxeval permiten estudiar el rendimiento de un checkpoint de identidad en tareas de razonamiento estructurado.
- Docencia y formación en ingeniería de modelos: el repositorio ejemplifica prácticas de preservación de procedencia (manifiestos, hashes, registros de eventos) útiles para enseñar auditoría de artefactos de IA.
- Pruebas de seguridad y evaluación de sesgos en entornos aislados: dado que el modelo no está evaluado ni aprobado para despliegue, puede usarse en sandbox para estudiar riesgos de alucinación y de identidad antes de cualquier uso real.

## Benchmarks y rendimiento

Los datos disponibles en la model card incluyen una tabla comparativa entre el brazo A13 y el brazo A3 (este último aparece truncado en la información proporcionada, por lo que solo se pueden presentar los valores completos de A13 y los datos parciales de A3). Las puntuaciones son porcentajes.

| Modelo | math500 | humanevalplus | mbppplus | olympiadbench | gsm8k-0shot | piqa | winogrande | boolq | truthfulqa | triviaqa | aime24 | mmlu-pro | gpqa-diamond | cruxeval | financebench | ifbench | mrcr | NUPA | swebench-verified | ot-tblite-recovery | tb2-recovery | ds-1000-local | bfclparity-pi | bixbench-pi | tau3-pi | SOTOPIA-hard |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| A13 | 95.2 | 84.8 | 72.2 | 37.3 | 90.6 | 82.2 | 77.0 | 84.7 | 48.2 | 56.0 | 70.0 | 76.7 | 64.1 | 69.2 | 62.0 | 25.3 | 23.9 | 68.5 | 28.1† | 12.7† | 6.4† | 20.5† | 26.8† | 6.8† | 10.7 | 61.9† |
| A3 | no disponible (truncado en la informacion proporcionada) | | | | | | | | | | | | | | | | | | | | | | | | | |

Datos adicionales: BFCL con cinco ejecuciones completas de 123 tareas arroja una media del 31,06 %. La pantalla de identidad histórica sin cambios en el parser reportó 42/52 banderas de formato ON, mientras que el mismo parser marcó 52/52 en v0.1, por lo que esos recuentos no establecen daño del modelo. Una lectura posterior en el límite nativo encontró 50/52 spans ON cerrados del núcleo, 31 nombres canónicos finales, 44 créditos de creador a Marin Community y cero autoafirmaciones de identidad ajenas. La model card advierte que estas son cohortes de evaluación pequeñas y fijas, con solo cinco ejecuciones independientes de un checkpoint entrenado por brazo, y que ni las puntuaciones ni el cierre del protocolo establecen corrección amplia de identidad, seguridad o preparación para release. Las celdas marcadas con † tienen cualificaciones específicas (evidencia de fuga/parseo, contexto de diagnóstico/reconstrucción, cobertura incompleta o nota métrica específica del modelo). DIAG y RECON no son comparaciones limpias de capacidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de 67B en safetensors BF16, se requerirían aproximadamente 134 GB solo para pesos, más overhead de activaciones y KV cache; con cuantización a 8 bits bajaría a unos 67 GB y a 4 bits a unos 34 GB, aunque estas cifras no están confirmadas para esta arquitectura MoE concreta.
- GPU recomendadas: no disponible en la información proporcionada. Para un modelo de este tamaño en BF16 se necesitarían múltiples GPU de 80 GB (A100/H100) o GPUs con memoria unificada; para cuantizaciones agresivas podría considerarse una RTX 4090 de 24 GB solo en 4 bits, sin garantía.
- ¿Cabe en consumer GPU? No de forma nativa en BF16. Posiblemente en cuantización 4 bits en GPUs de 24 GB o superiores, pero no hay confirmación del autor.
- Opciones de despliegue: no disponible en la información proporcionada. El formato safetensors es compatible con vLLM, TGI y transformers, pero no se documenta soporte específico para llama.cpp, Ollama u otras herramientas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| Snowball 67B A2B Identity Path B A3 | 67.078.882.816 | ~2B (inferido) | no disponible | openmdw-1.1 | Hugging Face (open-athena) | Checkpoint de investigación, sin evaluación amplia |
| Marin Snowball v0.1 (ADC0078a) | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion | Base de la que deriva este checkpoint |
| Snowball 67B A2B Identity Path B A13 | no disponible | no disponible | no disponible | openmdw-1.1 | Hugging Face (open-athena) | Brazo comparativo con métricas completas en la tabla de evaluación |

No se dispone de información suficiente para comparar con modelos externos de la misma categoría (por ejemplo, otros MoE de ~67B con ~2B activos como Mixtral 8x7B o Qwen MoE) dentro de la documentación proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación sin evaluación adecuada: la model card indica explícitamente que el modelo no ha sido probado ni evaluado correctamente y que no es necesariamente seguro.
- Sin aprobación de despliegue: el checkpoint es experimental y no cuenta con aprobación para producción.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de alucinación más allá de truthfulqa y triviaqa en la campaña, con cohortes pequeñas.
- Sesgos conocidos: no disponibles; no se documentan análisis de sesgo.
- Limitaciones de contexto e idioma: no se declaran idiomas soportados; la longitud de contexto de inferencia no está confirmada (el entrenamiento usó 8192).
- Restricciones de licencia: licencia openmdw-1.1; deben revisarse los términos exactos para uso comercial, que no se detallan en la información proporcionada.
- Evaluaciones con cohortes pequeñas: solo cinco ejecuciones independientes por brazo, con diferencias de dosis, replay, empaquetado y agrupación que impiden comparaciones limpias.
- Cadenas de evaluación potencialmente activas: SWE100 y otras cadenas podrían seguir en ejecución en el momento del archivado; la model card no reclama resultados no observados.
- Integridad de identidad no garantizada: los recuentos de banderas de formato no establecen daño del modelo, y el cierre del protocolo no establece corrección amplia de identidad.
- Procedencia y borrado: las copias en S3 permanecen protegidas hasta que finalicen todas las cadenas aplicables y se registren las condiciones de borrado; este upload no realiza borrados.

## Enlaces

- Hugging Face: https://huggingface.co/open-athena/Snowball-67B-A2B-Identity-PathB-A3-2026.10.30
- EvalDash (brazo A13, referencia comparativa): https://marina.oa.dev/evaldash/runs?model=open-athena-Snowball-67B-A2B-Identity-PathB-A13-2026.10.30
- Procedencia S3 (referenciada en la model card): s3://marin-rno2a/marin/checkpoints/karan/snowball-identity-pathb/A3-u36/
- Repositorio Marin (referenciado en la model card): no disponible como URL directa en la información proporcionada
- Paper o blog del modelo: no disponible en la información proporcionada
