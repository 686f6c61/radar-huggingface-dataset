# open-athena/Marin-Mochi-Ladder-Base-d512-H100

## Resumen

Marin-Mochi-Ladder-Base-d512-H100 es un checkpoint intermedio de preentrenamiento de un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por el proyecto open-athena dentro de la comunidad Marin. Se trata de un artefacto de investigación: concretamente el paso 3930 de una ejecución de entrenamiento denominada "h100-ladder-d512-ep8-bs1024-791tpp", exportado a BF16 sin entrenamiento adicional. Con 597.608.192 parámetros totales y una dimensión de modelo de 512, es un modelo pequeño pensado para estudiar dinámicas de escalado y recetas de entrenamiento MoE, no para uso en producción.

El modelo emplea la arquitectura propietaria Grug MoE con disposición split-expert en safetensors (artifact schema 3), que no es compatible con Transformers estándar y requiere una implementación específica del repositorio Marin. Su relevancia es puramente científica: permite a investigadores reproducir y analizar puntos intermedios de una curva de entrenamiento, comparar configuraciones (existen variantes "H100 twin" y "mixture-swap" en repositorios separados) y estudiar el comportamiento de un MoE de dimensión 512 a lo largo del proceso de preentrenamiento.

La licencia es OpenMDW-1.1 y el autor advierte explícitamente de que el modelo no ha sido evaluado ni probado adecuadamente y no es necesariamente seguro. No se dispone de información sobre idiomas soportados, composición del dataset ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grug MoE (split-expert), transformer con mezcla de expertos |
| Parametros totales | 597.608.192 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (export en BF16) |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (layout Grug MoE split-expert, artifact schema 3) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Grug MoE del proyecto Marin, una implementación de transformer con capas de mezcla de expertos y un layout de pesos de tipo split-expert. La dimensión del modelo es 512 (d512), la ejecución usa 8 expertos (ep8) y un batch size de 1024, con 791 tokens por parámetro (791tpp) según la nomenclatura del run. El checkpoint corresponde al paso 3930 de entrenamiento y se exportó a BF16 sin ningún entrenamiento posterior; el payload de tensores en BF16 ocupa 1.195.216.384 bytes.

El tokenizador utilizado es `marin-community/marin-tokenizer` en la revisión `a5ca45f2feb6c959bd87b81689aa7279b5bdcaa2`. No se dispone de información sobre el número total de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación. La configuración resuelta del entrenamiento se serializa en `config.yaml` y `training-config.json`, recuperada de la API de W&B, mientras que `config.json` describe únicamente la arquitectura de inferencia exportada. La topología original de entrenamiento y la receta de datos permanecen en la configuración de entrenamiento.

## Capacidades

- Generación de texto autoregresiva (pipeline `text-generation`).
- Conversación multi-turno (tag `conversational`), aunque sin evaluación publicada.
- Razonamiento y código: no hay evidencia publicada de capacidades específicas; al ser un checkpoint intermedio de 597M parámetros, se espera un rendimiento limitado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Punto de control intermedio: permite reanudar entrenamiento o estudiar la evolución del modelo en el paso 3930.

## Casos de uso

- Investigación sobre escalado de MoE: usar el checkpoint para analizar cómo evolucionan las representaciones y la pérdida en un punto intermedio del entrenamiento, comparándolo con los checkpoints anteriores y posteriores del mismo run.
- Reproducción de experimentos: servir como referencia reproducible del paso 3930 para validar recetas de entrenamiento o comparar configuraciones (por ejemplo, frente al "H100 twin" o los runs de mixture-swap).
- Estudio de tokenizadores: evaluar el comportamiento del tokenizador `marin-tokenizer` en esta configuración concreta y su impacto en la calidad de generación.
- Análisis de arquitecturas MoE: inspeccionar el layout split-expert y el enrutamiento de expertos en un modelo de dimensión 512 para entender el comportamiento de Grug MoE a pequeña escala.
- Fine-tuning experimental: partir de este checkpoint para probar técnicas de ajuste o alineación en un modelo pequeño antes de escalar a configuraciones mayores.
- Docencia y formación: utilizar un modelo de menos de 600M parámetros como ejemplo práctico de exportación, carga e inferencia con implementaciones no estándar de Transformers.
- Benchmarking de infraestructura: medir latencia y throughput de una implementación Grug MoE en hardware concreto sin depender de modelos de gran tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,2 GB solo para pesos (1.195.216.384 bytes), más overhead de activaciones y KV cache; en la práctica, menos de 4 GB en la mayoría de configuraciones.
- Cuantización: no se han publicado versiones cuantizadas (GGUF, GPTQ, AWQ); al requerir una implementación Grug específica, las herramientas estándar de cuantización no son aplicables directamente.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM; una RTX 4090, A100 o H100 es sobredimensionada para este modelo, pero el run de origen se ejecutó en H100 (según el nombre del run).
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060 o superiores, siempre que se disponga de la implementación compatible.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama o TGI de forma estándar; requiere la implementación Grug del repositorio Marin (guía de exportación y carga en `experiments/grug/moe_hero_ep/README.md`). El tag `endpoints_compatible` sugiere cierta compatibilidad con endpoints, pero no se detalla.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Marin-Mochi-Ladder-Base-d512-H100 | 597.608.192 | no disponible | openmdw-1.1 | Hugging Face (requiere implementación Grug) |
| Marin Mochi H100 twin | no disponible | no disponible | no disponible | Repositorio separado del mismo proyecto |
| Marin Mochi mixture-swap | no disponible | no disponible | no disponible | Repositorio separado del mismo proyecto |

No se dispone de información suficiente para comparar con modelos de otras familias (por ejemplo, MoE pequeños de otros proyectos) en términos de rendimiento, ya que no hay benchmarks publicados. La comparación más directa es con las variantes del mismo run dentro del proyecto Marin.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente que el modelo no ha sido probado ni evaluado adecuadamente y que no es necesariamente seguro; su uso en producción es bajo responsabilidad del usuario.
- Checkpoint intermedio: corresponde al paso 3930 de un entrenamiento en curso, por lo que su calidad es sustancialmente inferior a la de un modelo final.
- Compatibilidad: no funciona con Transformers estándar; requiere una implementación Grug MoE compatible con el layout split-expert (artifact schema 3).
- Idiomas: no se declaran idiomas soportados, lo que impide garantizar un comportamiento multilingüe.
- Sesgos y alucinación: no hay información publicada sobre sesgos ni tasas de alucinación; al ser un modelo pequeño y parcialmente entrenado, el riesgo de generación incoherente es alto.
- Licencia: OpenMDW-1.1; deben revisarse sus términos para uso comercial, ya que no se detallan en la información disponible.
- Sin versiones cuantizadas ni herramientas de despliegue estándar, lo que limita su integración en pipelines convencionales.
- No se dispone de información sobre la composición del dataset, lo que impide evaluar riesgos de contaminación o sesgos de datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-athena/Marin-Mochi-Ladder-Base-d512-H100
- Run de W&B: https://wandb.ai/marin-community/marin_moe/runs/h100-ladder-d512-ep8-bs1024-791tpp-20260824-rno2a
- Seguimiento del release: https://github.com/marin-community/marin/issues/12230
- Guía de exportación y carga de Grug MoE: https://github.com/marin-community/marin/blob/11f51b3fad1e9b3d8e71093644db003c6825cac4/experiments/grug/moe_hero_ep/README.md#inference-export
- Tokenizador: https://huggingface.co/marin-community/marin-tokenizer
