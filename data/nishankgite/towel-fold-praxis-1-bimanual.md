# nishankgite/towel-fold-praxis-1-bimanual

## Resumen

Praxis-1 fine-tuned para doblado bimanual de toallas es un ajuste fino no oficial del modelo de robótica Praxis-1 de Runway, publicado por el usuario nishankgite en Hugging Face. El modelo parte de `runwayml/praxis-1-yam`, una variante con disposición bimanual del robot YAM, y se ha reentrenado sobre un conjunto propio de datos de manipulación (`towel_fold_v1`) para la tarea específica de doblar toallas con dos brazos. El repositorio ocupa 54,4 GB y los pesos están en formato safetensors.

El modelo resuelve un problema concreto de robótica de manipulación: la predicción de trayectorias de efector final (TCP) para una tarea de doblado bimanual, partiendo de observaciones visuales de dos cámaras de muñeca y una cámara superior. Es relevante como ejemplo de ajuste fino de un modelo base de política robótica (visión-lenguaje-acción) sobre datos propios, con un protocolo de entrenamiento documentado (receta `finetune.py`, 5.000 pasos, 32 ventanas por paso) y una selección de checkpoint basada en error de validación.

La información pública es limitada: no se detallan parámetros totales, longitud de contexto ni idiomas, y el autor no ha liberado los datos de entrenamiento ni el código de servicio. La model card reporta resultados en bucle abierto (open-loop) sobre un split de test de 23 episodios, con un error medio de posición TCP de 65,7 mm a 1,0 s de horizonte, frente a 140,8 mm de la línea base de mantener la pose actual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la de `runwayml/praxis-1-yam`; política robótica visión-lenguaje-acción) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `runwayml/praxis-1-yam`, que aporta la disposición bimanual del robot YAM (dos mosaicos de cámara de muñeca y una cámara superior, que en este dataset se sustituye por un mosaico negro). Según la model card, se reemplazaron las estadísticas de normalización de acciones por las del conjunto `towel_fold_v1` (`TOWEL_INIT.json`) y se reentrenaron todos los pesos. La arquitectura subyacente no se describe en la información disponible; el modelo requiere el VAE de Wan2.2 (`Wan2.2_VAE.pth`) y el codificador de texto Qwen3.5-2B, ambos Apache 2.0 y no incluidos en el repositorio.

El entrenamiento siguió la receta `praxis-1-oss` con `scripts/finetune.py` y ajustes `finetune_base`: tasa de aprendizaje 2,5e-5 constante, 200 pasos de calentamiento, 5.000 pasos con 32 ventanas por paso. Los pasos 0-1.000 se ejecutaron en 4 GPU con acumulación de gradiente 8, y los pasos 1.000-5.000 en 8 GPU con acumulación 4, manteniendo las mismas 32 ventanas por paso y en el mismo orden. Los datos son grabaciones propias con doble UMI portátil (`towel_fold_v1`, no publicadas), solo split de entrenamiento, 175 episodios, dos cámaras de muñeca como mosaicos YAM, cámara superior negra, poses absolutas de herramienta y 15 Hz. El checkpoint seleccionado fue el paso 4.500, con el menor error de validación (stride 10, 1,0 s de anticipación) entre los pasos 2.500, 4.000, 4.250, 4.500, 4.750 y 5.000. El módulo de dataset se sustituyó por las ventanas bimanuales propias, manteniendo objetivo, entrenador y optimizador originales.

## Capacidades

- Predicción de trayectorias de efector final (TCP) para doblado bimanual de toallas a partir de observaciones visuales.
- Procesamiento de entradas visuales multimodales: dos cámaras de muñeca y una cámara superior (mosaico negro en este ajuste).
- Generación de acciones en poses absolutas de herramienta a 15 Hz.
- Planificación a horizonte corto: la model card reporta errores a 0,1 s y a 1,0 s de anticipación.
- Integración con el codificador de texto Qwen3.5-2B y el VAE de Wan2.2, lo que sugiere condicionamiento por lenguaje e imágenes (no detallado en la información disponible).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo.

## Casos de uso

- Doblado bimanual de toallas en laboratorio: el modelo predice trayectorias TCP para dos brazos a partir de las cámaras de muñeca y superior, adecuado para experimentos de manipulación con el robot YAM en entornos controlados.
- Investigación en ajuste fino de políticas robóticas: sirve como referencia de receta de fine-tuning (`finetune.py`, LR 2,5e-5, 5.000 pasos) sobre un modelo base bimanual, útil para replicar el protocolo con otros datasets.
- Evaluación de robustez ante estados iniciales: la model card distingue resultados con inicio plano (58,6 mm) y arrugado (106,2 mm), lo que permite estudiar la sensibilidad a la configuración inicial de la toalla.
- Benchmark de error de predicción a horizonte: los datos a 0,1 s (11/10 mm por mano) y 1,0 s (65,7 mm) permiten comparar variantes de arquitectura o datos en tareas de doblado.
- Prototipado de pipelines de servicio con `praxis.serve`: el modelo se carga con la misma disposición YAM que el base, lo que facilita integrarlo en el servidor de Praxis-1 para pruebas internas.
- Estudio de transferencia de dominio: al sustituir las estadísticas de normalización y reentrenar todos los pesos, es un caso práctico de adaptación de un modelo bimanual a un dominio nuevo con datos propios.

## Benchmarks y rendimiento

Resultados en bucle abierto sobre el split de test (23 episodios, evaluados una sola vez), según la model card:

| Metrica | Mantener pose actual | Praxis paso 4.500 |
|---|---|---|
| Error medio de posición TCP a 1,0 s | 140,8 mm | 65,7 mm |
| Inicio plano | no disponible | 58,6 mm |
| Inicio arrugado (3 episodios) | no disponible | 106,2 mm |
| A 0,1 s (mano izquierda / derecha) | 25 / 22 mm | 11 / 10 mm |
| Error de validación (misma métrica) | no disponible | 66,3 mm |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El rendimiento en robot real no ha sido probado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el autor indica que se necesita una GPU con al menos 80 GB y que el servidor utiliza 66 GB.
- GPU recomendadas: no se especifican modelos concretos; por el requisito de 80 GB encajan A100 80 GB, H100 80 GB y similares.
- No cabe en GPU de consumo (RTX 4090, 24 GB) según el requisito declarado de 80 GB.
- Opciones de despliegue: `praxis.serve` del paquete `praxis-1-oss`; el código de servicio propio del autor no es público. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Dependencias adicionales: `Wan2.2_VAE.pth` y el codificador de texto Qwen3.5-2B (Apache 2.0, no incluidos en el repositorio).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nishankgite/towel-fold-praxis-1-bimanual | no disponible | no disponible | Error TCP 65,7 mm a 1,0 s (test propio, 23 episodios) | Apache 2.0 | Hugging Face, 0 descargas |
| runwayml/praxis-1-yam | no disponible | no disponible | no disponible en la información proporcionada | Apache 2.0 (según la model card) | Hugging Face (modelo base) |
| Otros modelos de política robótica bimanual | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables de otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Ajuste fino no oficial: no está validado por Runway ni por el equipo de Praxis-1.
- Rendimiento en robot real no probado; todos los resultados son en bucle abierto sobre un split de test pequeño (23 episodios) evaluado una sola vez.
- El error en inicio arrugado (106,2 mm) es notablemente superior al de inicio plano (58,6 mm), lo que indica sensibilidad a la configuración inicial.
- Los datos de entrenamiento (`towel_fold_v1`) no se han liberado, lo que impide reproducir el ajuste.
- El código de servicio del autor no es público; solo se indica que se puede cargar con `praxis.serve`.
- Requiere dependencias externas no incluidas (VAE de Wan2.2 y codificador de texto Qwen3.5-2B).
- Requisito de hardware elevado (GPU de al menos 80 GB), lo que limita su uso a infraestructura de laboratorio.
- No se documentan sesgos, comportamientos multilingües ni riesgos de alucinación específicos; al ser un modelo de acciones robóticas, el riesgo principal es la ejecución de trayectorias incorrectas en el robot.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y las dependencias deben verificarse por separado; la model card remite a `LICENSE` y `NOTICE` para atribución y declaración de modificaciones.
- Sin descargas ni likes en el momento de la consulta, lo que sugiere ausencia de validación por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nishankgite/towel-fold-praxis-1-bimanual
- Modelo base: https://huggingface.co/runwayml/praxis-1-yam
- Repositorio de la receta de ajuste fino (`praxis-1-oss`, `scripts/finetune.py`): no disponible como enlace en la información proporcionada
- Paper, blog o demo: no disponibles en la información proporcionada
