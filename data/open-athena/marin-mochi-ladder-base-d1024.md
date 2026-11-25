# open-athena/Marin-Mochi-Ladder-Base-d1024

## Resumen

Marin-Mochi-Ladder-Base-d1024 es un checkpoint intermedio de preentrenamiento publicado por el colectivo open-athena dentro del ecosistema Marin. Se trata de un artefacto de investigación (paso 15.276 de una ejecución de entrenamiento) exportado a BF16 sin entrenamiento adicional, con 3.980.116.480 parámetros totales y una topología de mezcla de expertos (Grug MoE) con layout de expertos divididos en safetensors (artifact schema 3). No es un modelo afinado ni alineado: es una instantánea de un experimento de escalado, pensada para estudiar recetas de entrenamiento y no para uso en producción.

La relevancia es metodológica: el repositorio serializa la configuración resuelta del run (`config.yaml`, `training-config.json`) recuperada de la API de W&B, de modo que el checkpoint es reproducible y auditable junto con su receta de datos. La arquitectura requiere una implementación compatible de Grug; Transformers estándar no la soporta, lo que limita su uso a quienes trabajan dentro del stack de Marin.

El modelo se distribuye bajo licencia OpenMDW-1.1 y ocupa 47,8 GB en el repositorio, con un payload de tensores BF16 de 7.960.232.960 bytes. El tokenizador es `marin-community/marin-tokenizer` en la revisión `a5ca45f2feb6c959bd87b81689aa7279b5bdcaa2`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grug MoE (transformer con mezcla de expertos, layout split-expert, artifact schema 3) |
| Parametros totales | 3.980.116.480 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (export publicado en BF16) |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El checkpoint pertenece a la familia Grug MoE del proyecto Marin: un transformer con capas de mezcla de expertos cuyos pesos se serializan en un layout de expertos divididos (split-expert safetensors, artifact schema 3). El `config.json` del repositorio describe la arquitectura de inferencia exportada, mientras que `config.yaml` y `training-config.json` contienen la configuración de entrenamiento resuelta, recuperada de la API de W&B y regenerada desde ese mapeo (no se conservan los bytes originales del fichero de W&B). La topología original de entrenamiento y la receta de datos permanecen en dicha configuración.

El entrenamiento corresponde al run `rav-ladder-d1024` del proyecto `marin_moe` en W&B, con origen en el checkpoint `s3://marin-us-east-02a/marin/grug/rav-ladder-d1024/2026.08.18/checkpoints/step-15276`. El modelo se exportó a BF16 sin entrenamiento adicional; no consta en la información disponible el número de tokens procesados, la composición del dataset ni si hubo fases de RLHF o DPO. El tokenizador asociado es `marin-community/marin-tokenizer`. La exportación se realizó con la revisión `11f51b3fad1e9b3d8e71093644db003c6825cac4` del exportador, y el seguimiento de la release está en el issue 12230 del repositorio de Marin.

## Capacidades

- Generación de texto autoregresiva (pipeline `text-generation`), condicionada por el estado de preentrenamiento del checkpoint.
- Etiquetado como `conversational` en Hugging Face, aunque al ser un checkpoint base sin ajuste no cabe esperar un comportamiento de diálogo fiable.
- Arquitectura MoE con expertos divididos: el enrutamiento y la agregación dependen de la implementación Grug, no de Transformers estándar.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Investigación sobre recetas de entrenamiento MoE: el checkpoint permite reproducir y auditar la configuración resuelta del run `rav-ladder-d1024` junto con sus pesos en el paso 15.276, útil para estudiar dinámicas de escalado y enrutamiento de expertos.
- Análisis de curvas de aprendizaje: al publicarse checkpoints intermedios por revisión `step-N`, se pueden comparar estados del modelo a lo largo del entrenamiento y correlacionarlos con métricas de W&B.
- Desarrollo y validación de kernels de inferencia: sirve como caso de prueba real para implementaciones de Grug MoE con layout split-expert, incluida la verificación de carga y exportación.
- Estudio de tokenizadores: al fijar la revisión exacta de `marin-community/marin-tokenizer`, permite analizar el impacto de la tokenización en el rendimiento del modelo.
- Reproducibilidad de artefactos: el repositorio documenta el origen S3, el paso y las revisiones del exportador, lo que facilita pipelines de auditoría de modelos.
- Base para experimentos de ajuste posterior: un equipo puede partir de este checkpoint base para probar fine-tuning o alineación, asumiendo el coste de adaptar el stack de carga.
- Comparación entre variantes: los runs "H100 twin" y "mixture-swap" se publican en repositorios separados, lo que permite contrastar configuraciones bajo el mismo recipe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8 GB solo para pesos (7.960.232.960 bytes), más activaciones, caché KV y buffers de enrutamiento; el consumo real no está documentado.
- GPU recomendadas: no disponible. Por tamaño de pesos, el modelo cabe en GPUs con 16-24 GB o más en BF16, pero la implementación Grug MoE puede imponer requisitos adicionales de memoria y comunicación entre expertos.
- GPU de consumo: previsiblemente viable en RTX 4090 (24 GB) y A6000 (48 GB) en BF16 si la implementación lo permite; no confirmado por el autor.
- Opciones de despliegue: requiere una implementación compatible con Grug MoE; Transformers estándar no soporta esta arquitectura. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Marin-Mochi-Ladder-Base-d1024 | 3.980.116.480 | no disponible | openmdw-1.1 | Hugging Face, requiere Grug |
| Alternativas de ~4B densos (p. ej. Llama 3.2 3B, Qwen2.5 3B) | ~3-4B | 128K en algunos casos | licencias permisivas | Transformers, vLLM, llama.cpp |
| Alternativas MoE de escala similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento del modelo que permitan una comparación cuantitativa con alternativas; la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Artefacto de investigación: el autor declara explícitamente que el modelo no ha sido probado ni evaluado adecuadamente y que puede no ser seguro; su uso en producción es bajo responsabilidad del usuario.
- Checkpoint base intermedio: no ha pasado por alineación ni ajuste instructivo, por lo que no cabe esperar calidad conversacional aunque esté etiquetado como `conversational`.
- Dependencia de implementación: requiere una implementación compatible con Grug MoE; Transformers estándar no carga esta arquitectura, lo que rompe flujos habituales de despliegue.
- Idiomas no declarados: no hay información sobre cobertura lingüística ni sobre sesgos por idioma.
- Riesgo de alucinación: no evaluado; en un modelo base sin alineación el riesgo es estructuralmente alto.
- Licencia OpenMDW-1.1: conviene revisar sus términos antes de cualquier uso comercial; no se documentan restricciones adicionales en la información disponible.
- Sin benchmarks publicados: no hay evidencia de rendimiento que respalde decisiones de adopción.
- Configuración de entrenamiento regenerada: `config.yaml` se reconstruye desde el mapeo de W&B y no preserva los bytes originales, lo que puede introducir diferencias de formato respecto al run original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-athena/Marin-Mochi-Ladder-Base-d1024
- Run de entrenamiento en W&B: https://wandb.ai/marin-community/marin_moe/runs/rav-ladder-d1024
- Seguimiento de la release: https://github.com/marin-community/marin/issues/12230
- Guía de exportación y carga de Grug MoE: https://github.com/marin-community/marin/blob/11f51b3fad1e9b3d8e71093644db003c6825cac4/experiments/grug/moe_hero_ep/README.md#inference-export
- Tokenizador: https://huggingface.co/marin-community/marin-tokenizer
