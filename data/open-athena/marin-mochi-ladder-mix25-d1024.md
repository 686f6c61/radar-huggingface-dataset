# open-athena/Marin-Mochi-Ladder-Mix25-d1024

## Resumen

Marin-Mochi-Ladder-Mix25-d1024 es un checkpoint intermedio de preentrenamiento de la familia Marin, publicado por el colectivo open-athena. Se trata de un artefacto de investigación derivado de la receta "Mochi" aplicada a la arquitectura Grug MoE, con 3.980.116.480 parámetros totales en un único tensor BF16 de aproximadamente 8 GB. Corresponde al paso de entrenamiento 30.552 de la ejecución `h100-mix25-20260912-d1024` del proyecto Marin.

El modelo no ha sido ajustado con instrucciones ni evaluado formalmente: es una exportación BF16 directa del checkpoint de preentrenamiento, sin entrenamiento adicional. Su relevancia es, por tanto, metodológica y de investigación: permite inspeccionar el estado intermedio de una mezcla de expertos dispersa (split-expert safetensors, esquema de artefacto 3) y sirve como material para estudiar dinámicas de entrenamiento, no como modelo listo para producción.

La arquitectura requiere una implementación compatible con Grug MoE; Transformers estándar no soporta esta topología. La licencia es OpenMDW 1.1 y el tokenizador es `marin-community/marin-tokenizer`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grug MoE (mezcla de expertos con layout split-expert, esquema de artefacto 3) |
| Parametros totales | 3.980.116.480 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (exportacion BF16; requiere implementacion Grug compatible) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | safetensors (BF16, 7.960.232.960 bytes) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Grug MoE del proyecto Marin, una mezcla de expertos dispersa cuyo layout de pesos se serializa en safetensors con el esquema de artefacto 3 (split-expert). El checkpoint corresponde al paso 30.552 de la ejecución `h100-mix25-20260912-d1024`, ejecutada sobre GPU H100 y registrada en Weights & Biases bajo el proyecto `marin-community/marin_moe`. La configuración resuelta del entrenamiento se serializa en `config.yaml` y `training-config.json`, mientras que `config.json` describe únicamente la arquitectura de inferencia exportada.

No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Al ser un checkpoint intermedio de preentrenamiento, no se aplicó ningún ajuste posterior. El tokenizador asociado es `marin-community/marin-tokenizer` en la revisión `a5ca45f2feb6c959bd87b81689aa7279b5bdcaa2`, y el exportador corresponde a la revisión `11f51b3fad1e9b3d8e71093644db003c6825cac4`.

## Capacidades

- Generación de texto autoregresiva en el marco de un modelo de lenguaje preentrenado (pipeline `text-generation`).
- Capacidad de mezcla de expertos dispersa: activación selectiva de expertos por token, sujeta a la implementación Grug MoE.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidades multilingües: no disponibles.
- El modelo no ha sido ajustado para seguir instrucciones ni para conversación estructurada, pese a la etiqueta `conversational` del repositorio.

## Casos de uso

- Investigación sobre dinámicas de entrenamiento: analizar el estado intermedio del paso 30.552 para estudiar la evolución de los expertos y la convergencia de la mezcla a lo largo del preentrenamiento.
- Reproducibilidad de experimentos Marin: servir como referencia verificable para comparar recetas de mezcla (mix25) y configuraciones de dimensión (d1024) frente a ejecuciones gemelas en H100.
- Estudio de arquitecturas MoE dispersas: inspeccionar el layout split-expert en safetensors y validar implementaciones de carga compatibles con Grug.
- Evaluación de tokenizadores: usar el checkpoint junto a `marin-community/marin-tokenizer` para medir el impacto del tokenizador en tareas de generación.
- Base para ajuste fino experimental: punto de partida controlado para probar protocolos de post-entrenamiento (SFT, DPO) sobre un modelo de aproximadamente 4.000 millones de parámetros.
- Docencia y divulgación técnica: ejemplo práctico de exportación de checkpoints intermedios y de las decisiones de ingeniería (serialización, revisiones por paso) en proyectos de IA abierta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el modelo no ha sido probado ni evaluado adecuadamente.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8 GB solo para pesos, más memoria para activaciones, caché KV y overhead de la implementación Grug; en la práctica, se recomienda al menos 16-24 GB para margen operativo.
- GPU recomendadas: H100 (entorno de entrenamiento original), A100 40/80 GB, y GPUs consumer de gama alta con 24 GB o más (RTX 3090, RTX 4090) para pruebas en BF16.
- Cabe en GPU consumer: sí, en modelos con 24 GB o más en BF16; con cuantización no documentada, el soporte depende de la implementación Grug.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; el autor indica que Transformers estándar no soporta esta arquitectura y que se requiere una implementación Grug compatible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Marin-Mochi-Ladder-Mix25-d1024 | 3.980.116.480 | no disponible | OpenMDW 1.1 | Hugging Face (checkpoint intermedio) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma familia o categoría en los datos proporcionados.

## Limitaciones y advertencias

- Artefacto de investigación: el autor advierte que el modelo no ha sido probado ni evaluado y que no es necesariamente seguro; su uso en producción es responsabilidad del usuario.
- No es un modelo ajustado para instrucciones ni para diálogo; la etiqueta `conversational` no implica alineación.
- Riesgo elevado de alucinación y de salidas incoherentes por tratarse de un checkpoint intermedio de preentrenamiento.
- Requiere una implementación compatible con Grug MoE; Transformers estándar no carga esta arquitectura, lo que limita su portabilidad.
- Idiomas soportados y longitud de contexto no documentados; no se puede garantizar cobertura multilingüe.
- Licencia OpenMDW 1.1: deben revisarse sus términos para uso comercial y redistribución antes de cualquier despliegue.
- Sesgos conocidos: no documentados, pero previsibles en un modelo preentrenado sin filtrado posterior.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que refleja ausencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/open-athena/Marin-Mochi-Ladder-Mix25-d1024
- Ejecución de entrenamiento en W&B: https://wandb.ai/marin-community/marin_moe/runs/h100-mix25-20260912-d1024
- Seguimiento de la release: https://github.com/marin-community/marin/issues/12230
- Guía de exportación y carga de Grug MoE: https://github.com/marin-community/marin/blob/11f51b3fad1e9b3d8e71093644db003c6825cac4/experiments/grug/moe_hero_ep/README.md#inference-export
- Tokenizador: https://huggingface.co/marin-community/marin-tokenizer
