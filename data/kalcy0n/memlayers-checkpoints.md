# kalcy0n/memlayers-checkpoints

## Resumen

`kalcy0n/memlayers-checkpoints` es un repositorio de checkpoints de PyTorch publicados como material de evaluación para experimentos de capas de memoria basadas en Product-Key Memory (PKM). No se trata de un modelo de lenguaje entrenado para inferencia general, sino de instantáneas de entrenamiento (snapshots) de runs experimentales que el autor utiliza para comparar el comportamiento de la memoria con claves aprendidas frente a claves congeladas en su inicialización aleatoria.

El repositorio contiene cuatro runs (`pkm-s0`, `pkm-s1`, `pkm-s2` y `pkm_randkey-s0`), cada uno con snapshots en los pasos 1.500 y 9.156, entrenados sobre el dataset `roieg/memlayers-data` (data-v1). Los checkpoints nativos incluyen el estado del modelo, la configuración del modelo y del entrenamiento, el paso de entrenamiento, el recuento de tokens y huellas de los datos de entrenamiento, además de un fichero `SHA256SUMS` con los digests de cada fichero.

Su relevancia es acotada y de carácter reproducible: sirve como artefacto de investigación para quienes quieran replicar o auditar el análisis de eliminación de slots (slot-removal comparison) del proyecto `memory-layers-analysis`. No hay información publicada sobre arquitectura completa, número de parámetros, contexto, licencia ni idiomas, por lo que no debe tratarse como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas de memoria Product-Key Memory (PKM); detalles completos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints nativos en PyTorch, no se publican versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoints PyTorch (`.pt`); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

La información disponible indica que los runs emplean Product-Key Memory (PKM), un mecanismo de memoria direccionable por claves que sustituye o complementa capas densas por una memoria de gran capacidad consultada mediante producto de claves. El repositorio se centra en comparar dos configuraciones: claves aprendidas (`pkm-s0`, `pkm-s1`, `pkm-s2`, con semillas 0, 1 y 2) y claves congeladas en su inicialización aleatoria (`pkm_randkey-s0`). Los snapshots se toman en los pasos 1.500 y 9.156, lo que permite analizar la evolución de la memoria a lo largo del entrenamiento y el efecto de eliminar slots concretos.

Los datos de entrenamiento corresponden al dataset `roieg/memlayers-data` (data-v1). No se especifican el número total de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. Tampoco se detalla la innovación técnica más allá del uso de PKM y del protocolo de evaluación de eliminación de slots. Cada checkpoint incluye metadatos de entrenamiento (paso, recuento de tokens y huellas de los datos), lo que facilita la trazabilidad y la reproducibilidad de los experimentos.

## Capacidades

- Almacenamiento de checkpoints de investigación para reproducir experimentos de PKM.
- Evaluación de eliminación de slots mediante el script `metrics.py` del repositorio del proyecto.
- Comparación entre claves aprendidas y claves congeladas en inicialización aleatoria.
- Trazabilidad de entrenamiento: paso, recuento de tokens y huellas de datos incluidos en cada snapshot.
- Verificación de integridad mediante `SHA256SUMS`.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo.

## Casos de uso

- Reproducción de experimentos de memoria: descargar `pkm-s0/checkpoints/step_009156.pt` y ejecutar `python metrics.py` desde el repositorio del proyecto para replicar la comparación de eliminación de slots.
- Auditoría de integridad de artefactos: verificar cada checkpoint con `SHA256SUMS` antes de usarlo en un pipeline de evaluación.
- Estudio del efecto de la inicialización de claves: comparar `pkm-s0` con `pkm_randkey-s0` en el mismo paso para aislar el impacto de aprender las claves frente a congelarlas.
- Análisis de convergencia temporal: contrastar los snapshots del paso 1.500 y del paso 9.156 para medir cómo evoluciona la utilización de slots durante el entrenamiento.
- Replicación con distintas semillas: usar `pkm-s0`, `pkm-s1` y `pkm-s2` para estimar la varianza entre semillas en las métricas de memoria.
- Docencia e investigación en mecanismos de memoria: emplear los checkpoints como material de partida en cursos o trabajos sobre PKM, dado que incluyen configuración de modelo y entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El tamaño del repositorio es de 1,8 GB, lo que sugiere checkpoints de tamaño moderado; el tamaño exacto por checkpoint no está disponible.
- VRAM estimada para inferencia: no disponible (no se documenta el número de parámetros ni la configuración de inferencia).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no aplica como modelo de inferencia; el uso previsto es la ejecución de `metrics.py` sobre checkpoints PyTorch.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (checkpoints de investigación sobre PKM) ni se dispone de datos de parámetros, contexto o rendimiento para establecer una comparación.

## Limitaciones y advertencias

- No es un modelo de inferencia: son checkpoints de evaluación de un experimento de investigación, no un modelo listo para generar texto.
- Licencia no especificada: no se puede asumir uso comercial ni redistribución sin consultar al autor.
- Idiomas no documentados: no hay información sobre cobertura lingüística.
- Sin datos de benchmarks: no se puede evaluar su calidad frente a alternativas.
- Dependencia del proyecto externo: la evaluación requiere el repositorio `memory-layers-analysis` y el dataset `roieg/memlayers-data` (data-v1).
- Riesgo de reproducibilidad: los resultados pueden depender de versiones concretas de PyTorch y del entorno de ejecución.
- Sin garantías de mantenimiento: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere un artefacto de investigación sin soporte comunitario.
- No se documentan sesgos ni riesgos de alucinación porque no se trata de un modelo generativo desplegable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kalcy0n/memlayers-checkpoints
- Repositorio del proyecto: https://github.com/RoieGilad7/memory-layers-analysis
- Dataset de entrenamiento: https://huggingface.co/datasets/roieg/memlayers-data
