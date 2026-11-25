# open-athena/Marin-Mochi-Ladder-Base-d1536

## Resumen

Marin-Mochi-Ladder-Base-d1536 es un checkpoint intermedio de preentrenamiento publicado por open-athena dentro del ecosistema Marin. Se trata de un artefacto de investigación exportado en BF16 a partir de una ejecución de entrenamiento de la receta Mochi, sin entrenamiento adicional ni ajuste fino posterior. El modelo emplea una arquitectura Grug MoE (mezcla de expertos con layout de expertos divididos), con 11.534.398.464 parámetros totales según los tensores safetensors del repositorio.

El checkpoint corresponde al paso 15.128 de la ejecución `rav-ladder-d1536`, cuyo objetivo es explorar la receta de preentrenamiento Mochi a una dimensión de modelo de 1536. No es un modelo listo para producción: el propio autor lo etiqueta como artefacto de investigación no evaluado ni probado adecuadamente, y advierte de que no es necesariamente seguro. Su interés es principalmente para investigadores que estudien dinámicas de entrenamiento, recetas MoE o la evolución de checkpoints intermedios.

La relevancia actual es limitada fuera del contexto de investigación de Marin: no hay datos publicados de benchmarks, idiomas soportados ni evaluaciones de calidad, y la arquitectura requiere una implementación compatible con Grug, ya que Transformers estándar no la soporta. La licencia es OpenMDW 1.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grug MoE (mezcla de expertos con layout de expertos divididos, artifact schema 3) |
| Parametros totales | 11.534.398.464 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (export en BF16) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | safetensors (BF16, 23.068.796.928 bytes de payload) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Grug MoE desarrollada en el ecosistema Marin, con un layout de expertos divididos serializado en safetensors bajo el esquema de artefacto 3. Según la model card, requiere una implementación compatible con Grug y no funciona con Transformers estándar. El checkpoint es una exportación BF16 del estado en el paso 15.128 de la ejecución `rav-ladder-d1536`, sin entrenamiento adicional tras la exportación. La dimensión del modelo es 1536 (d1536), y el tokenizador utilizado es `marin-community/marin-tokenizer` en la revisión `a5ca45f2feb6c959bd87b81689aa7279b5bdcaa2`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. La configuración resuelta del entrenamiento se serializa en `config.yaml` y `training-config.json` dentro del repositorio, recuperada de la API de W&B, mientras que `config.json` describe la arquitectura de inferencia exportada. La topología original de entrenamiento y la receta de datos permanecen en la configuración de entrenamiento.

## Capacidades

- Generación de texto: pipeline declarado como `text-generation` y etiqueta `conversational`.
- Arquitectura MoE: mezcla de expertos con expertos divididos, orientada a eficiencia computacional en entrenamiento e inferencia.
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- No se ha documentado modo thinking, visión ni audio.
- Al ser un checkpoint intermedio no evaluado, no se garantiza ninguna capacidad concreta más allá de la generación de texto.

## Casos de uso

- Investigación sobre recetas de preentrenamiento MoE: el checkpoint permite analizar el estado del modelo en el paso 15.128 de la receta Mochi y comparar con otros checkpoints de la misma escalera (ladder) para estudiar la evolución del aprendizaje.
- Estudio de dinámicas de entrenamiento: al ser un checkpoint intermedio, sirve para trazar curvas de pérdida, analizar la especialización de expertos o detectar fenómenos de inestabilidad durante el preentrenamiento.
- Reproducibilidad de experimentos: la configuración resuelta (`config.yaml`, `training-config.json`) y las referencias a la ejecución de W&B permiten reproducir o auditar el entrenamiento en el ecosistema Marin.
- Desarrollo y validación de implementaciones Grug: el modelo sirve como caso de prueba para verificar que una implementación compatible con Grug carga correctamente el layout de expertos divididos (artifact schema 3).
- Comparación de exportaciones BF16: útil para validar el proceso de exportación de checkpoints de entrenamiento a formato de inferencia y comprobar la equivalencia numérica.
- Docencia y divulgación sobre arquitecturas MoE: el modelo, junto con su configuración y registro de ejecución, puede usarse como ejemplo didáctico de una arquitectura MoE real con expertos divididos.
- No se recomienda su uso en producción, atención al cliente, generación de código ni tareas de razonamiento sin una evaluación previa exhaustiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 23 GB solo para los pesos (payload de 23.068.796.928 bytes), más memoria para activaciones y KV cache.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, un modelo de ~11.500 millones de parámetros en BF16 requiere GPUs con al menos 24 GB de VRAM para los pesos, como A100 40/80 GB, H100 o RTX 4090 (24 GB, muy ajustado).
- ¿Cabe en GPU de consumo? En BF16, no de forma holgada en una RTX 4090 de 24 GB; requeriría cuantización, pero no se documentan tipos de cuantización soportados.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI. La model card indica que se requiere una implementación compatible con Grug y que Transformers estándar no soporta la arquitectura.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría, y las características específicas de la arquitectura Grug MoE dificultan una comparación directa con modelos transformer convencionales.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente que el modelo no ha sido probado ni evaluado adecuadamente y que no es necesariamente seguro.
- Uso en producción desaconsejado: la model card advierte de que se use bajo responsabilidad propia en entornos de producción.
- Sin benchmarks ni evaluaciones de calidad publicadas.
- Idiomas soportados no documentados; no se puede garantizar un comportamiento multilingüe.
- Longitud de contexto no documentada.
- Compatibilidad limitada: requiere una implementación compatible con Grug; Transformers estándar no soporta la arquitectura.
- Sin datos sobre sesgos, riesgo de alucinación o comportamiento en dominios específicos.
- Licencia OpenMDW 1.1: deben revisarse sus términos para uso comercial; la información disponible no detalla restricciones adicionales.
- Checkpoint intermedio: no representa el estado final de la ejecución y puede tener una calidad inferior a un modelo completamente entrenado.

## Enlaces

- Hugging Face: https://huggingface.co/open-athena/Marin-Mochi-Ladder-Base-d1536
- Ejecución de W&B: https://wandb.ai/marin-community/marin_moe/runs/rav-ladder-d1536
- Guía de exportación e inferencia de Marin: https://github.com/marin-community/marin/blob/11f51b3fad1e9b3d8e71093644db003c6825cac4/experiments/grug/moe_hero_ep/README.md#inference-export
- Seguimiento del release: https://github.com/marin-community/marin/issues/12230
- Tokenizador: https://huggingface.co/marin-community/marin-tokenizer
