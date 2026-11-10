# erdem-erdem/dyn-spec-dflash-d5-generator-attn-r32-4k-1500-alpha025

## Resumen

`dyn-spec-dflash-d5-generator-attn-r32-4k-1500-alpha025` es un checkpoint de entrenamiento publicado por el usuario erdem-erdem dentro de la línea de trabajo `dyn-spec`, orientada a la adaptación de *drafters* de decodificación especulativa mediante DFlash. No se trata de un modelo de lenguaje autónomo, sino de un artefacto intermedio de investigación: un generador LoRA entrenado sobre el drafter `z-lab/Qwen3-8B-DFlash-b16` para servir como modelo auxiliar de predicción de tokens frente al modelo objetivo `Qwen/Qwen3-8B`.

El artefacto corresponde al brazo `direct` en la etapa de `pretraining`, con 1500 actualizaciones, semilla 42 y un repositorio de 13,2 GB que incluye el estado del optimizador, el registro de ejecución, las evaluaciones offline y la procedencia completa (identidad del almacén de activaciones, registro del extractor y trazas de lanzamiento de vLLM). El autor indica explícitamente que no es un paquete de servicio: la exportación DFlash para inferencia aún no está portada.

Su relevancia es acotada y muy específica: sirve como evidencia reproducible de un experimento de adaptación de drafters con LoRA de rango 32 sobre ventanas de 4k y coeficiente alpha 0,025, no como modelo listo para producción. La validación publicada sobre 200 filas fijas muestra una puntuación `full_acc` de 0,5220 en la actualización 1500 frente a 0,5246 en la actualización 0, es decir, sin mejora apreciable respecto al punto de partida.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (drafter DFlash sobre Qwen3-8B; adaptador LoRA de rango 32) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4k (según nomenclatura `4k` del identificador y del almacén de activaciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch, con estado del optimizador); no incluye GGUF ni safetensors de servicio |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 (`r32`) entrenado sobre el drafter DFlash `z-lab/Qwen3-8B-DFlash-b16` (commit `9b41424b7109f9c5413454f481b09a82b85333f4`), con `Qwen/Qwen3-8B` como modelo objetivo. El entrenamiento se ejecutó en el brazo `direct`, etapa `pretraining`, durante 1500 actualizaciones con semilla 42 y coeficiente `alpha025` (0,025). El contexto de entrenamiento es de 4k tokens, coherente con el almacén de activaciones `erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k` empleado como fuente de datos.

No se documentan en la información disponible el número total de tokens de entrenamiento, la composición del dataset más allá del almacén de activaciones, ni si hubo fases de RLHF o DPO. El paquete incluye `speculators.patch` y `train_command.txt`, lo que permite reconstruir el pipeline exacto, así como `provenance/` con la identidad del almacén, el registro del extractor y la procedencia del lanzamiento de vLLM. La innovación técnica declarada es la propia metodología dyn-spec aplicada a DFlash: adaptación dinámica de un drafter de decodificación especulativa mediante LoRA, evaluada con métricas de aceptación (`τ` en la métrica `eal`) y precisión por dominio.

## Capacidades

- Generación de borradores de tokens (*drafting*) para decodificación especulativa frente a `Qwen/Qwen3-8B`.
- Predicción de secuencias candidatas evaluables mediante tasa de aceptación (`τ = 7,177` en la actualización 1500).
- Evaluación desagregada por dominio: chat, código, matemáticas y STEM.
- Reproducibilidad completa del entrenamiento mediante `run_record_*.json`, `train_command.txt` y `speculators.patch`.
- Verificación de integridad mediante `MANIFEST.json` con tamaños y SHA256 de cada fichero.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito; el artefacto es un drafter, no un modelo conversacional.

## Casos de uso

- Investigación en decodificación especulativa: el checkpoint permite reproducir el experimento `direct`/`pretraining` con 1500 actualizaciones y comparar la curva de aceptación frente al drafter base, usando los ficheros de `run/` como referencia.
- Análisis de la eficacia de LoRA en drafters: al incluir el estado del optimizador y las métricas por actualización, sirve para estudiar si la adaptación de rango 32 aporta ganancia sobre el drafter original (los datos publicados indican que no).
- Auditoría de procedencia de datos de entrenamiento: `provenance/store/` documenta la identidad del almacén de activaciones y los registros de llenado, útil para trabajos de trazabilidad de datasets.
- Reproducción de pipelines con vLLM: las trazas de lanzamiento de vLLM incluidas permiten reconstruir la configuración de extracción de activaciones sobre Qwen3-8B.
- Estudio de sensibilidad de hiperparámetros: el sufijo `alpha025` y `r32` permiten comparar esta ejecución con otras variantes del mismo autor (distintos rangos o coeficientes) para analizar el efecto en `full_acc` y `τ`.
- Base para futuras exportaciones de servicio: aunque la exportación DFlash de serving no está portada, el checkpoint es el punto de partida lógico para generarla y validar latencia y aceptación en un entorno real.
- Docencia y formación: como ejemplo completo de estructura de un experimento de adaptación de drafters con manifiesto, métricas y procedencia.

## Benchmarks y rendimiento

Validación sobre 200 filas fijas, una fila por LoRA, métrica `full_acc`:

| Actualización | full_acc | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0.5246 | 7.108 | 0.3383 | 0.5699 | 0.6796 | 0.5105 |
| 1500 | 0.5220 | 7.177 | 0.3361 | 0.5651 | 0.6765 | 0.5102 |

El resultado es prácticamente plano: `full_acc` desciende 0,0026 puntos y `τ` sube 0,069, con retrocesos leves en chat, código, matemáticas y STEM. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El directorio `run/offline_eval/` contiene evaluaciones adicionales (reproducción, coeficientes M4, donantes M7, similitud D13 y coste D14) con métricas por fila, pero sus valores no se detallan en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio de 13,2 GB incluye estado del optimizador y artefactos de ejecución, por lo que no representa el tamaño de un adaptador LoRA desplegable.
- GPU recomendadas: no disponibles. Al depender del modelo objetivo Qwen3-8B y del drafter DFlash, el requisito real vendría determinado por el servicio del modelo base, no por este checkpoint.
- Viabilidad en GPU de consumo: no determinable con la información disponible; un Qwen3-8B en cuantización de 4 bits podría caber en GPUs de 16-24 GB, pero este artefacto no está empaquetado para ese fin.
- Opciones de despliegue: el autor indica que la exportación DFlash de serving no está portada; las trazas de vLLM en `provenance/` corresponden a la extracción de activaciones, no a un bundle de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dyn-spec-dflash-d5-generator-attn-r32-4k-1500-alpha025 | no disponible | 4k | Drafter LoRA para Qwen3-8B | no disponible | Checkpoint de entrenamiento en HF |
| z-lab/Qwen3-8B-DFlash-b16 | no disponible | no disponible | Drafter DFlash base | no disponible | Pesos en HF |
| Qwen/Qwen3-8B | 8B (aproximado por denominación) | no disponible | Modelo objetivo | no disponible | Pesos en HF |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación se limita a la función y al linaje declarado en la model card.

## Limitaciones y advertencias

- No es un modelo de servicio: el autor advierte que la exportación DFlash para serving no está portada, por lo que no puede desplegarse directamente como endpoint de inferencia.
- Ausencia de mejora demostrada: la validación muestra `full_acc` ligeramente inferior tras 1500 actualizaciones (0,5220 frente a 0,5246), lo que cuestiona la utilidad práctica de esta configuración concreta.
- Licencia no especificada: no se declara licencia, lo que impide determinar condiciones de uso comercial o redistribución.
- Idiomas no documentados: no hay información sobre cobertura lingüística.
- Sesgos y alucinación: no evaluados en la información disponible; al ser un drafter, los errores se manifestarían como rechazos en la verificación del modelo objetivo, no como texto final.
- Dependencia estricta del modelo objetivo y del drafter base: cualquier uso requiere `Qwen/Qwen3-8B` y el commit exacto del drafter `z-lab/Qwen3-8B-DFlash-b16`.
- Repositorio de gran tamaño con estado del optimizador: 13,2 GB, no apto para descarga ligera ni para entornos con almacenamiento limitado.
- Cero descargas y cero likes en el momento de la consulta: sin validación externa por parte de la comunidad.
- Fecha de creación declarada en 2026-11-10, posterior a la mayoría de referencias del ecosistema; conviene verificar la coherencia temporal antes de citarlo.

## Enlaces

- Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-d5-generator-attn-r32-4k-1500-alpha025
- Almacén de activaciones: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Commit del drafter: `9b41424b7109f9c5413454f481b09a82b85333f4`
- Commit del repositorio de ejecución (Git SHA): `d59ea26f102f6fb6fcd7e7f5c28b0cc0fcf9d093`
- SHA256 del checkpoint: `55452884c1679eabfdcd48e13c54094ca734651fee7acc0c93e31649fdc42d93`
