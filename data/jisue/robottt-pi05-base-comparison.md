# jisue/robottt-pi05-base-comparison

## Resumen

RoboTTT es un artefacto de investigación publicado en Hugging Face por el usuario `jisue` que contiene un experimento comparativo de *test-time training* (TTT) sobre el modelo base `pi05_base`, un modelo de robótica de tipo vision-language-action (VLA). El repositorio no es un modelo listo para usar, sino una copia de seguridad de un experimento en curso: compara dos variantes de TTT aplicadas sobre el mismo `pi05_base` convertido, una ligera de cuatro capas (561.540 parámetros entrenables añadidos) y otra basada en el núcleo OpenTau en las 18 capas (85.319.824 parámetros).

El experimento usa un pipeline común nuevo (no una reproducción del entrenador OpenTau histórico) con episodios de entrenamiento 0..59 y de desarrollo 60..69, con una configuración de secuencia T32/stride1/S8 y un calendario de ruido fijado. El repositorio incluye checkpoints de extensión y optimizador, protocolos con semilla, contratos de preprocesado, código y ficheros de progreso, respaldados cada cinco minutos mientras el proceso de backup está activo.

Por su naturaleza, no se trata de un modelo para producción ni para uso general: es un *backup* de experimentación con 24,3 GB de tamaño, sin licencia declarada, sin idiomas declarados y sin resultados de benchmarks publicados en la información disponible. Su interés es para investigadores que quieran auditar o reproducir la comparación de métodos TTT sobre `pi05_base`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `pi05_base`, VLA; el repositorio contiene adaptadores/checkpoints de TTT) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna de `pi05_base`; solo indica que se parte de una conversión del modelo oficial `pi05_base` y que se comparan dos diseños de test-time training: una variante ligera de cuatro capas con 561.540 parámetros entrenables añadidos y una variante basada en el núcleo OpenTau fijado (*pinned*) sobre las 18 capas, con 85.319.824 parámetros entrenables. Ambas condiciones comparten el mismo base convertido, los mismos episodios de entrenamiento (0..59) y desarrollo (60..69), la misma configuración de secuencia (T32/stride1/S8) y el mismo calendario de ruido guardado.

El pipeline es explícitamente nuevo y no reproduce el entrenador OpenTau histórico completo. Los prefijos del VLM se generan bajo demanda con una caché de RAM acotada a 2 GiB, sin escribir tensores de prefijo grandes en almacenamiento efímero, y se comparten contratos de hash de tensores de secuencia entre ambos métodos. La pérdida de *flow matching* y el éxito en simulador se reportan como métricas separadas; el autor advierte que no deben inferirse de un checkpoint *smoke*. Los resultados finales solo aparecen en `progress/comparison-results.json` tras completar las evaluaciones emparejadas. No se especifican número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Entrenamiento y evaluación de *test-time training* sobre un modelo base de robótica (`pi05_base`).
- Comparación controlada de dos variantes TTT (ligera de 4 capas frente a OpenTau en 18 capas).
- Generación bajo demanda de prefijos VLM con caché de RAM acotada (2 GiB).
- Contratos de hash de tensores de secuencia compartidos y verificados entre métodos.
- Checkpoints de extensión y optimizador, protocolos con semilla y contratos de preprocesado respaldados periódicamente.
- Métricas separadas de pérdida de *flow matching* y de éxito en simulador.
- No se documentan capacidades de generación de texto, código, matemáticas, visión general, tool calling, agentes ni multilingüismo.

## Casos de uso

- Auditoría de experimentos TTT: el repositorio permite inspeccionar checkpoints, protocolos con semilla y contratos de preprocesado para verificar que ambas condiciones usan el mismo base y los mismos datos.
- Reproducción de la comparación ligera frente a OpenTau: los ficheros de progreso y los manifiestos de backup permiten reconstruir el estado de cada ejecución (`comparison-lite` y `comparison-reference`).
- Investigación en robótica con modelos VLA: sirve como base para estudiar cómo afecta el TTT al rendimiento en simulador con episodios de entrenamiento 0..59 y desarrollo 60..69.
- Desarrollo de pipelines de backup de experimentos: el esquema de respaldo cada cinco minutos, con manifiestos y estados separados para assets y progreso, es reutilizable en otros entrenamientos largos.
- Verificación de integridad de datos: los contratos de hash de tensores de secuencia y los ficheros de procedencia (`provenance/base_comparison_assets.json`) permiten comprobar que el base convertido y los datos procesados coinciden entre métodos.
- Análisis de coste de memoria: la caché de prefijos VLM acotada a 2 GiB y la ausencia de ficheros de prefijo grandes en almacenamiento efímero sirven de referencia para diseñar inferencia con restricciones de RAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que las métricas finales solo aparecen en `progress/comparison-results.json` tras completar las evaluaciones emparejadas, y que las ejecuciones `smoke-*` son comprobaciones de integración de dos actualizaciones, no experimentos completos de 3000 actualizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se documenta vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponible.
- El repositorio ocupa 24,3 GB en disco; la generación de prefijos VLM usa una caché de RAM acotada a 2 GiB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoboTTT (jisue/robottt-pi05-base-comparison) | no disponible (561.540 y 85.319.824 parámetros entrenables añadidos según variante) | no disponible | sin benchmarks publicados | no disponible | Hugging Face, repo de 24,3 GB |
| `pi05_base` (modelo base de partida) | no disponible | no disponible | no disponible | no disponible | referenciado en el repositorio, no incluido como modelo independiente en esta ficha |
| OpenTau (núcleo TTT) | 85.319.824 parámetros entrenables en 18 capas (según el repo) | no disponible | no disponible | no disponible | referenciado como componente del experimento |

No se dispone de datos suficientes para comparar con alternativas de la misma categoría fuera del propio experimento.

## Limitaciones y advertencias

- No es un modelo listo para producción: es un backup de experimentación con ejecuciones en curso y checkpoints *smoke* que no representan experimentos completos.
- Sin licencia declarada: no se puede asumir permiso para uso comercial ni para redistribución.
- Sin idiomas declarados ni documentación de capacidades lingüísticas.
- Sin resultados de benchmarks publicados; las métricas finales dependen de evaluaciones emparejadas aún no completadas en la información disponible.
- El pipeline es nuevo y no reproduce el entrenador OpenTau histórico, por lo que los resultados no son directamente comparables con trabajos previos de OpenTau.
- La pérdida de *flow matching* y el éxito en simulador son métricas distintas; no deben inferirse conclusiones de rendimiento a partir de una sola de ellas ni de un checkpoint *smoke*.
- Riesgo de sesgos y alucinación: no evaluado en la información disponible.
- El tamaño del repositorio (24,3 GB) y la naturaleza de backup continuo implican que el contenido puede cambiar con el tiempo.

## Enlaces

- Hugging Face: https://huggingface.co/jisue/robottt-pi05-base-comparison
- Ficheros de estado y progreso citados en la model card: `progress/comparison-status.json`, `backup-manifest.json`, `progress/hf-assets-backup-status.json`, `provenance/base_comparison_assets.json`, `progress/comparison-results.json` (rutas dentro del repositorio; no se proporcionan URLs directas adicionales).
