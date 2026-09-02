# greenfield0810/affine-ark-dab031713f3c

## Resumen

Este repositorio es un archivo espejo (mirror) de un checkpoint perteneciente al subnet 120 de Bittensor, conocido como Affine. La cuenta `greenfield0810` ha preservado una copia byte a byte de un modelo original alojado en `pandora-box/Affine-5fqbxvz29b-t8nfjvfe`, con el objetivo de evitar la pérdida de acceso a repositorios que suelen hacerse privados tras los duelos del leaderboard. No es un modelo desarrollado por el autor del mirror, sino un artefacto de archivo.

El checkpoint tiene 35.951.822.704 parámetros (aproximadamente 35,95 mil millones) y un tamaño de 71,9 GB en 17 shards, lo que sugiere pesos en FP16 (2 bytes por parámetro). El pipeline declarado es `image-text-to-text`, lo que indica capacidades multimodales, aunque no se proporcionan detalles sobre la arquitectura interna. La etiqueta `qwen3_5_moe` sugiere una posible base en un modelo MoE de la familia Qwen, pero no hay confirmación oficial.

La relevancia de este repositorio es principalmente como fuente de referencia para investigadores que estudian el ecosistema de Bittensor o que necesitan acceder a checkpoints que de otro modo serían inaccesibles. No se dispone de información sobre entrenamiento, capacidades o rendimiento, por lo que esta ficha se limita a los datos disponibles en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta sugiere qwen3_5_moe, sin confirmar) |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible (posible MoE, sin datos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente FP16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (17 shards, 71,9 GB) |

## Arquitectura y entrenamiento

No se ha publicado ninguna información sobre la arquitectura interna, el proceso de entrenamiento, los datos utilizados o las técnicas de optimización empleadas. La etiqueta `qwen3_5_moe` sugiere que podría tratarse de un modelo de mezcla de expertos (MoE) basado en la familia Qwen, pero no hay documentación que lo confirme. El pipeline `image-text-to-text` indica que el modelo acepta imágenes y texto como entrada y genera texto, pero se desconocen los detalles de la implementación (por ejemplo, si usa un codificador de visión separado o un enfoque totalmente multimodal). Tampoco se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas como RLHF o DPO.

## Capacidades

No se han documentado capacidades específicas en la información proporcionada. El pipeline `image-text-to-text` implica que el modelo puede procesar entradas multimodales (imagen y texto) y generar texto, pero no se detallan tareas concretas como generación de código, razonamiento matemático, tool calling o soporte de agentes. Tampoco se indican idiomas soportados ni si existe un modo de pensamiento extendido (thinking mode). Dado que se trata de un archivo de preservación, es posible que el modelo original tuviera capacidades avanzadas, pero no hay evidencia en este repositorio.

## Casos de uso

No se pueden determinar casos de uso concretos sin información sobre las capacidades del modelo. Al tratarse de un mirror sin documentación adicional, no es posible recomendar aplicaciones específicas. Un investigador interesado en este checkpoint debería consultar la fuente original (`pandora-box/Affine-5fqbxvz29b-t8nfjvfe`) o el ecosistema de Bittensor subnet 120 para obtener detalles sobre su funcionalidad. En cualquier caso, al ser un archivo de preservación, su uso principal es el estudio y la comparación dentro del contexto de la competición de Affine, no como un modelo listo para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El repositorio no incluye ninguna métrica de rendimiento, y el autor del mirror no proporciona comparativas con otros modelos. Cualquier afirmación sobre el rendimiento sería especulativa.

## Requisitos de hardware

Dado que el tamaño de los pesos en safetensors es de 71,9 GB, se puede estimar el consumo de VRAM para inferencia en función de la precisión:

- En FP16 (formato probable de los pesos): se necesitan aproximadamente 72 GB de VRAM, lo que requiere GPUs profesionales como A100 (80 GB), H100 (80 GB) o configuraciones multi-GPU.
- Con cuantización a 8 bits (no confirmada en el repositorio): alrededor de 36 GB, cabría en una RTX 4090 (24 GB) o A6000 (48 GB) con margen.
- Con cuantización a 4 bits (no confirmada): alrededor de 18 GB, cabría en GPUs de consumo como RTX 3090 o RTX 4080.

No se proporcionan opciones de despliegue oficiales. Dado que el formato es safetensors, es compatible con frameworks como Transformers, vLLM o TGI, pero no hay garantía de que el modelo funcione correctamente sin ajustes adicionales. Tampoco se conocen datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos similares. El tamaño de parámetros (35,95B) lo sitúa en una categoría media-alta, pero sin datos de arquitectura o rendimiento no es posible compararlo con otros modelos multimodales de tamaño similar, como LLaVA-NeXT, Qwen2-VL o InternVL. La etiqueta `qwen3_5_moe` sugiere una posible relación con la familia Qwen, pero no hay confirmación. Por tanto, esta sección queda como "no disponible".

## Limitaciones y advertencias

- Este repositorio es un mirror no oficial; el autor del archivo no es el desarrollador del modelo y no puede garantizar su integridad más allá de la verificación SHA del peso.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o modificación.
- No hay documentación sobre sesgos, alucinaciones o limitaciones de idioma. Al ser un checkpoint de competición, podría tener comportamientos impredecibles fuera de su contexto original.
- El pipeline `image-text-to-text` sugiere multimodalidad, pero no se ha verificado su funcionamiento real.
- El repositorio original puede haberse hecho privado; este mirror es la única vía de acceso, pero su uso en producción es arriesgado sin conocer los detalles de entrenamiento.
- Los pesos en FP16 requieren hardware de gama alta; no se ofrecen versiones cuantizadas oficiales.

## Enlaces

- Repositorio mirror: [greenfield0810/affine-ark-dab031713f3c](https://huggingface.co/greenfield0810/affine-ark-dab031713f3c)
- Repositorio original (posiblemente privado): [pandora-box/Affine-5fqbxvz29b-t8nfjvfe](https://huggingface.co/pandora-box/Affine-5fqbxvz29b-t8nfjvfe)
- Archivo de procedencia (dentro del repo): `_affine_provenance.json`
