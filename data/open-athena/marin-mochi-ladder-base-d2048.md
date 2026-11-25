# open-athena/Marin-Mochi-Ladder-Base-d2048

## Resumen

Marin-Mochi-Ladder-Base-d2048 es un checkpoint intermedio de preentrenamiento publicado por open-athena dentro del ecosistema Marin. Se trata de un artefacto de investigación con arquitectura Grug MoE (mixture of experts con layout de expertos divididos), 27.742.902.528 parámetros totales y exportación en BF16, resultado de la receta "Mochi" en su variante base con dimensión d2048. El modelo se detuvo en el paso 15.000 de entrenamiento, antes de completar el presupuesto previsto, por lo que no constituye un modelo final afinado ni evaluado.

La relevancia de esta publicación es fundamentalmente metodológica: permite a investigadores inspeccionar checkpoints intermedios de un run de preentrenamiento MoE a gran escala, comparar recetas (la "ladder" incluye variantes como el twin en H100 y los runs de intercambio de mezcla) y estudiar la evolución del entrenamiento. No está pensado para uso en producción: el propio autor advierte de que no ha sido probado ni evaluado adecuadamente.

La licencia es OpenMDW-1.1, los pesos se distribuyen en safetensors con un esquema propietario de Grug MoE que no es compatible con Transformers estándar, y el repositorio ocupa 277,5 GB. No se declaran idiomas soportados ni se publican resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grug MoE (mixture of experts con split-expert), transformer |
| Parametros totales | 27.742.902.528 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (exportación oficial en BF16) |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (layout Grug MoE split-expert, artifact schema 3) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Grug MoE de Marin, una variante de transformer con mezcla de expertos y un layout de safetensors denominado split-expert (artifact schema 3). Este formato requiere una implementación compatible de Grug: Transformers estándar no soporta esta arquitectura, tal como advierte la model card. La exportación es un volcado BF16 del checkpoint de preentrenamiento en el paso 15.000, sin entrenamiento adicional; el run se detuvo antes de su presupuesto planificado y el paso 15.000 es el último guardado retenido.

La configuración resuelta del entrenamiento se serializa en `config.yaml` y `training-config.json`, regenerados a partir de la API de W&B, mientras que `config.json` describe únicamente la arquitectura de inferencia exportada. La topología original de entrenamiento y la receta de datos permanecen en la configuración de entrenamiento. El tokenizador utilizado es `marin-community/marin-tokenizer` en la revisión `a5ca45f2feb6c959bd87b81689aa7279b5bdcaa2`, y el exportador corresponde a la revisión `11f51b3fad1e9b3d8e71093644db003c6825cac4`. No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset ni fases de RLHF o DPO.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation` y los tags incluyen `conversational`, aunque al ser un checkpoint base intermedio no se garantiza un comportamiento conversacional afinado.
- Mezcla de expertos: la arquitectura Grug MoE permite, en principio, activación selectiva de expertos, si bien no se publican los parámetros activos ni la configuración de enrutamiento.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación sobre entrenamiento MoE: el checkpoint permite analizar la evolución de los pesos y del enrutamiento de expertos en el paso 15.000, comparándolo con otros pasos de la ladder y con las variantes twin en H100 y mixture-swap.
- Estudio de recetas de preentrenamiento: al ser un artefacto de la "Mochi recipe ladder", sirve para comparar configuraciones de entrenamiento (dimensión d2048 frente a otras) y evaluar el impacto de la topología y la mezcla de datos.
- Reproducibilidad y auditoría: la serialización de `config.yaml` y `training-config.json` desde W&B facilita reconstruir la configuración resuelta del run y verificar experimentalmente los resultados publicados.
- Desarrollo de infraestructura de inferencia: el layout split-expert de Grug exige implementaciones compatibles, por lo que el checkpoint es útil para probar y validar cargadores, kernels y pipelines de exportación alternativos a Transformers.
- Punto de partida para experimentos de continuación: investigadores que quieran reanudar el entrenamiento desde el paso 15.000 pueden usar los pesos como inicialización, siempre que dispongan de la topología original y del tokenizador correcto.
- Docencia y divulgación técnica: sirve como ejemplo tangible de un checkpoint intermedio MoE de gran escala para explicar formatos de pesos, exportación y diferencias entre arquitecturas propietarias y estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el payload BF16 es de 55.485.805.056 bytes (aproximadamente 51,7 GiB) solo en pesos, por lo que la inferencia en BF16 requiere al menos 52 GB de VRAM más overhead de activaciones y caché KV; no se dispone de estimaciones para cuantizaciones alternativas.
- GPU recomendadas: no disponible; por tamaño, el modelo no cabe en GPUs de consumo de 24 GB en BF16.
- ¿Cabe en GPU de consumo? No en BF16; no se dispone de información sobre cuantizaciones que lo permitan.
- Opciones de despliegue: requiere una implementación compatible con Grug MoE; Transformers estándar no soporta la arquitectura. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de benchmarks ni de modelos comparables de la misma categoría (checkpoints intermedios MoE de ~28B parámetros) en la información disponible.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente que el modelo no ha sido probado ni evaluado adecuadamente y que no es necesariamente seguro; su uso en producción es bajo responsabilidad del usuario.
- Entrenamiento incompleto: el run se detuvo antes del presupuesto planificado; el paso 15.000 es el último guardado retenido, por lo que el modelo no ha completado su preentrenamiento previsto.
- Compatibilidad: requiere una implementación Grug compatible; Transformers estándar no soporta la arquitectura, lo que limita las herramientas de despliegue disponibles.
- Idiomas y sesgos: no se declaran idiomas soportados ni se documentan sesgos conocidos.
- Riesgo de alucinación: no evaluado; al ser un checkpoint base intermedio, no se recomienda su uso directo en tareas de usuario final.
- Licencia: OpenMDW-1.1; deben revisarse sus términos para uso comercial antes de cualquier despliegue.
- Tamaño del repositorio: 277,5 GB, lo que exige planificación de almacenamiento y ancho de banda para su descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-athena/Marin-Mochi-Ladder-Base-d2048
- Run de entrenamiento en W&B: https://wandb.ai/marin-community/marin_moe/runs/rav-ladder-d2048-v3
- Issue de seguimiento del lanzamiento: https://github.com/marin-community/marin/issues/12230
- Guía de exportación y carga de Marin: https://github.com/marin-community/marin/blob/11f51b3fad1e9b3d8e71093644db003c6825cac4/experiments/grug/moe_hero_ep/README.md#inference-export
- Tokenizador: https://huggingface.co/marin-community/marin-tokenizer
