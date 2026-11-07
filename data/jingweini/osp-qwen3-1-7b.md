# JingweiNi/OSP-Qwen3-1.7B

## Resumen

OSP-Qwen3-1.7B es un artefacto de investigación publicado por JingweiNi (EdisonNi-hku) en Hugging Face, asociado al trabajo "Same Beliefs, Different Policies: Learning Reusable Representations for Early Stopping in LLM Reasoning". No se trata de un modelo de lenguaje completo, sino de un conjunto de checkpoints de lectores y cabezas de parada (reader/head) entrenados sobre el backbone Qwen/Qwen3-1.7B, que deben cargarse junto con ese modelo base mediante el scorer del repositorio BELT.

El objetivo del artefacto es investigar políticas de parada temprana (early stopping) reutilizables para el razonamiento de modelos de lenguaje: en lugar de reentrenar una política de detención para cada configuración, los autores aprenden representaciones que puedan transferirse entre distintas políticas de inferencia. El grid completo contiene cinco precios de entrenamiento (2e-6, 5e-6, 1e-5, 2e-5 y 4e-5) y tres semillas (0, 1, 2), sumando 15 ejecuciones.

Es relevante ahora porque aborda un problema práctico de coste computacional en inferencia con cadenas de razonamiento largas: determinar cuándo detener la generación sin sacrificar precisión. Al publicarse como artefacto reproducible con hashes SHA256 e inventario de checkpoints, facilita la replicación de resultados frente a publicaciones que solo liberan pesos finales. El repositorio ocupa 6,2 GB y no incluye los pesos del backbone ni los manifiestos de preguntas ni los bancos completos de trayectorias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lector de dos bloques superiores (top-two-block reader) y cabeza de parada, sobre backbone transformer Qwen3-1.7B |
| Parametros totales | No disponible para el artefacto; el backbone Qwen3-1.7B tiene aproximadamente 1,7B-2B parametros (segun la model card de Qwen se describe como modelo de 2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (ingles) |
| Licencia | No disponible; la publicacion no asigna nueva licencia y siguen aplicando los terminos del backbone y upstream |
| Formato de pesos | `.pt` (PyTorch), checkpoints `osp_best.pt` por ejecucion, con `CHECKPOINTS.json`, `summary.json` y `SHA256SUMS` |
| Backbone | Qwen/Qwen3-1.7B en revision `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e` |
| Tamano del repo | 6,2 GB |
| Semillas | 0, 1, 2 |
| Precios de entrenamiento | 2e-6, 5e-6, 1e-5, 2e-5, 4e-5 |
| Numero de ejecuciones | 15 (5 precios x 3 semillas) |

## Arquitectura y entrenamiento

El artefacto no contiene un transformer completo, sino componentes auxiliares: un lector que opera sobre los dos bloques superiores del backbone Qwen3-1.7B y una cabeza de parada seleccionada por validación (`osp_best.pt`). Estos componentes se cargan a través del scorer del repositorio BELT, mientras que el modelo base se carga por separado. La arquitectura exacta del lector y de la cabeza no se detalla en la información disponible.

El entrenamiento se organiza en un grid de cinco precios (`lambda`) y tres semillas, lo que produce 15 checkpoints independientes. Cada ejecución incluye su `summary.json` original y metadatos de ejecución disponibles, además de `val_scored.jsonl`, que el scorer requiere para calibrar y que se copia en la salida puntuada. Los registros de validación incluidos son puntuaciones guardadas, no datos generados de nuevo. No se especifican en la información proporcionada el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon RLHF o DPO. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal. La innovación central del trabajo es el aprendizaje de representaciones reutilizables para la parada temprana en razonamiento de LLM, materializada en la reutilización de checkpoints entre políticas (Qwen OSP-1 usa los mismos checkpoints `lambda-1e-5`, no es una ejecución adicional).

## Capacidades

- Lectura sobre representaciones internas del backbone Qwen3-1.7B para estimar la conveniencia de detener la generación.
- Predicción de parada temprana en cadenas de razonamiento, mediante una cabeza de parada calibrada sobre puntuaciones de validación.
- Integración con el scorer del repositorio BELT para su uso junto al modelo base.
- Ejecución reproducible: cada checkpoint incluye hashes SHA256, conteos de bytes y rutas de origen.
- Reutilización entre políticas: los checkpoints de `lambda-1e-5` se comparten con Qwen OSP-1.
- No es un modelo generativo autónomo: no produce texto por sí mismo, requiere el backbone Qwen3-1.7B.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking en la información disponible.
- Soporte multilingüe limitado al inglés según el campo `language`.

## Casos de uso

- Investigación sobre parada temprana en razonamiento: usar los 15 checkpoints para reproducir el grid de precios y semillas del paper y comparar políticas de detención bajo distintas condiciones.
- Reducción de coste de inferencia en pipelines de razonamiento: integrar el scorer BELT con Qwen3-1.7B para detener cadenas de pensamiento antes de agotar el presupuesto de tokens, disminuyendo latencia y consumo de GPU.
- Calibración de políticas de stopping: emplear `val_scored.jsonl` y las puntuaciones guardadas para ajustar umbrales de parada sobre un conjunto de validación conocido.
- Estudio de transferibilidad entre políticas: comparar los checkpoints de distintos `lambda` para analizar si las representaciones aprendidas son reutilizables entre configuraciones de inferencia.
- Auditoría de reproducibilidad: verificar la integridad de los artefactos mediante `SHA256SUMS` y `CHECKPOINTS.json` antes de incorporarlos a experimentos propios.
- Baseline para nuevos métodos de early stopping: usar estos checkpoints como referencia en investigaciones que propongan políticas de parada alternativas sobre Qwen3-1.7B.
- Evaluación de robustez por semilla: analizar la variabilidad entre semillas 0, 1 y 2 para estimar la estabilidad del entrenamiento de la cabeza de parada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el artefacto; depende del backbone Qwen3-1.7B cargado por separado y del scorer BELT.
- GPU recomendadas: no disponibles en la información proporcionada.
- Ajuste en GPU de consumo: no confirmado; el backbone de ~1,7B-2B parámetros podría caber en GPUs de consumo con cuantización, pero no se documentan requisitos ni soporte de cuantización para este artefacto.
- Opciones de despliegue: carga mediante el scorer del repositorio BELT junto al backbone Qwen3-1.7B; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio ocupa 6,2 GB, además del espacio necesario para el backbone.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OSP-Qwen3-1.7B | No disponible (artefacto sobre backbone de ~1,7B-2B) | No disponible | Checkpoints de lector y cabeza de parada | No disponible | Hugging Face (JingweiNi) |
| Qwen/Qwen3-1.7B | ~1,7B-2B | No disponible | Modelo de generación de texto | No disponible en la información consultada | Hugging Face (Qwen) |
| Alternativas de early stopping para LLM | No disponible | No disponible | Políticas de parada | No disponible | No disponible |

No se dispone de información suficiente para comparar rendimiento, contexto o licencia con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo de lenguaje autónomo: requiere el backbone Qwen3-1.7B y el scorer del repositorio BELT para funcionar.
- No incluye pesos del backbone, manifiestos de preguntas, bancos completos de trayectorias ni políticas BELT ajustadas.
- Licencia no especificada: la publicación no asigna nueva licencia y siguen aplicando los términos del backbone y upstream, lo que exige revisar las condiciones de Qwen3-1.7B antes de uso comercial.
- Idioma limitado al inglés según los metadatos.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al depender de un backbone generativo, hereda sus sesgos y riesgos.
- Uso previsto de investigación: los artefactos están pensados para reproducción experimental, no como componente listo para producción.
- Las puntuaciones de validación incluidas son registros guardados, no resultados nuevos; no deben interpretarse como evaluación independiente.
- Integridad de artefactos: conviene verificar `SHA256SUMS` y `CHECKPOINTS.json` antes de usar los checkpoints.
- Sin garantías de mantenimiento: repositorio con 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Hugging Face: https://huggingface.co/JingweiNi/OSP-Qwen3-1.7B
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio BELT (código y guía de reproducción): https://github.com/EdisonNi-hku/BELT
- Recetas: https://github.com/EdisonNi-hku/BELT/blob/main/docs/RECIPES.md
- Lista de artefactos: https://github.com/EdisonNi-hku/BELT/blob/main/docs/ARTIFACTS.md
- Aviso de atribución: https://github.com/EdisonNi-hku/BELT/blob/main/NOTICE.md
