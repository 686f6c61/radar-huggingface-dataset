# open-athena/Marin-Mochi-Ladder-Mix25-d768

## Resumen

Marin-Mochi-Ladder-Mix25-d768 es un checkpoint intermedio de preentrenamiento publicado por el proyecto open-athena dentro de la comunidad Marin. Se trata de un artefacto de investigación: un export en BF16 del paso 11420 de una ejecución de entrenamiento con la receta "Mochi", sin entrenamiento adicional ni ajuste fino posterior. El modelo emplea una arquitectura MoE con layout de expertos separados (Grug MoE), cuenta con 1.591.848.448 parámetros totales y fue entrenado sobre GPUs H100.

Su relevancia es fundamentalmente metodológica: permite a investigadores inspeccionar el estado de un modelo a mitad de entrenamiento, reproducir curvas de escalado y analizar el comportamiento de la mezcla de expertos antes de la convergencia. No está pensado como modelo de producción, y el propio autor advierte que no ha sido evaluado ni probado adecuadamente. La licencia OpenMDW-1.1 facilita su uso en investigación.

La ficha se basa exclusivamente en la model card y los metadatos del repositorio de Hugging Face. No hay información publicada sobre idiomas soportados, benchmarks ni evaluación de capacidades, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grug MoE (mixture of experts con layout de expertos separados, artifact schema 3); requiere implementación Grug compatible, no soportada por Transformers estándar |
| Parametros totales | 1.591.848.448 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica únicamente pesos en BF16) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (BF16, 3.183.696.896 bytes de payload tensorial) |

## Arquitectura y entrenamiento

El modelo sigue la receta "Mochi" del proyecto Marin y se exporta con el layout Grug MoE de expertos separados (artifact schema 3), lo que implica que los pesos de cada experto se almacenan de forma independiente y requieren una implementación específica de Grug para cargarse; Transformers estándar no implementa esta arquitectura. El checkpoint corresponde al paso de entrenamiento 11420 de la ejecución `h100-mix25-20260912-d768`, realizada en GPUs H100, y el export es una conversión directa a BF16 sin entrenamiento adicional.

El tokenizador utilizado es `marin-community/marin-tokenizer` en la revisión `a5ca45f2feb6c959bd87b81689aa7279b5bdcaa2`. El repositorio incluye `config.yaml` y `training-config.json` con la configuración de entrenamiento resuelta obtenida de la API de W&B, además de un `config.json` que describe la arquitectura de inferencia exportada. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO; al ser un checkpoint intermedio de preentrenamiento, es esperable que no incluya alineamiento posterior, pero este extremo no se confirma en la documentación.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation` y los tags incluyen `conversational`, pero no se ha publicado ninguna evaluación que confirme la calidad de las respuestas.
- Razonamiento, código y matemáticas: no disponible; no hay datos de evaluación.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el campo de idiomas del repositorio está vacío.
- Capacidades especiales (modo thinking, visión, audio): no disponible; el modelo es exclusivamente de texto.
- Al ser un checkpoint intermedio, sus capacidades reales deben considerarse no verificadas y potencialmente incompletas respecto a un modelo totalmente entrenado.

## Casos de uso

- Investigación sobre dinámicas de entrenamiento: el checkpoint permite analizar el estado de los pesos y de los expertos en el paso 11420, comparándolo con checkpoints posteriores de la misma ejecución para estudiar la evolución del aprendizaje.
- Reproducción de curvas de escalado: al estar vinculado a una ejecución concreta con configuración publicada en W&B, sirve para replicar experimentos de escalado de mezclas de expertos en entornos de investigación.
- Estudio de arquitecturas MoE con expertos separados: útil para desarrolladores que implementan o validan cargadores compatibles con el layout Grug, ya que proporciona un artefacto real de tamaño medio (1,6 mil millones de parámetros).
- Docencia y formación: permite ilustrar en cursos de aprendizaje profundo cómo se estructura un checkpoint intermedio, qué contiene un export BF16 y cómo se serializa la configuración de entrenamiento.
- Pruebas de infraestructura de inferencia: sirve para validar pipelines de carga, particionado y ejecución de modelos MoE en clústeres con GPUs H100 o A100 antes de pasar a modelos mayores.
- Análisis de tokenización: al incluir la referencia exacta al tokenizador de Marin, se puede estudiar la cobertura y el comportamiento del tokenizador sobre corpus específicos en experimentos controlados.
- No se recomienda su uso en aplicaciones de cara al usuario, atención al cliente, generación de código en producción ni ningún escenario que requiera calidad garantizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el modelo no ha sido probado ni evaluado adecuadamente.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 3,2 GB solo para los pesos (3.183.696.896 bytes), más overhead de activaciones, caché KV y buffers de la implementación Grug; el total dependerá de la longitud de contexto, que no se ha publicado.
- Cuantización: no se han publicado versiones cuantizadas (GGUF, AWQ, GPTQ) y el soporte de llama.cpp u Ollama para el layout Grug MoE no está confirmado.
- GPU recomendadas: el entrenamiento se realizó en H100; para inferencia, cualquier GPU con al menos 8-16 GB de VRAM podría alojar los pesos en BF16, aunque la implementación Grug condiciona el soporte real.
- GPU de consumo: es plausible que quepa en RTX 4090 (24 GB) e incluso en GPUs de 8-12 GB, siempre que exista una implementación compatible; este extremo no está verificado en la documentación.
- Opciones de despliegue: se requiere una implementación Grug compatible según la guía de exportación y carga de Marin; vLLM, TGI, llama.cpp y Ollama no están confirmados para esta arquitectura.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (checkpoints intermedios MoE con layout Grug) ni se dispone de datos de rendimiento para establecer una comparación rigurosa con alternativas como Mixtral, Qwen MoE u otros modelos de tamaño similar.

## Limitaciones y advertencias

- Artefacto de investigación: el autor advierte que el modelo no ha sido probado ni evaluado adecuadamente y que no es necesariamente seguro; su uso en producción es responsabilidad del usuario.
- Checkpoint intermedio: al provenir del paso 11420 de preentrenamiento, es probable que no haya completado su entrenamiento ni disponga de alineamiento, lo que puede traducirse en respuestas incoherentes, repetitivas o inseguras.
- Riesgo de alucinación: no evaluado; en un modelo sin alineamiento ni ajuste instructivo, el riesgo es elevado.
- Sesgos: no documentados; no se ha publicado información sobre la composición del dataset ni sobre análisis de sesgos.
- Idiomas: no disponible; se desconoce qué idiomas cubre el tokenizador y el corpus de entrenamiento.
- Contexto: la longitud de contexto no se ha publicado, lo que impide planificar su uso en tareas de contexto largo.
- Compatibilidad: requiere una implementación Grug específica; Transformers estándar no carga esta arquitectura, lo que limita su adopción y las herramientas de despliegue habituales.
- Licencia: OpenMDW-1.1; deben revisarse sus términos antes de cualquier uso comercial, ya que no se ha verificado en esta ficha qué restricciones impone.
- Sin garantías: el autor no ofrece garantías de funcionamiento ni de seguridad, y el modelo se distribuye "as is".

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/open-athena/Marin-Mochi-Ladder-Mix25-d768
- Ejecución de entrenamiento en W&B: https://wandb.ai/marin-community/marin_moe/runs/h100-mix25-20260912-d768
- Seguimiento del release: https://github.com/marin-community/marin/issues/12230
- Guía de exportación y carga de Grug MoE: https://github.com/marin-community/marin/blob/11f51b3fad1e9b3d8e71093644db003c6825cac4/experiments/grug/moe_hero_ep/README.md#inference-export
- Tokenizador: https://huggingface.co/marin-community/marin-tokenizer
