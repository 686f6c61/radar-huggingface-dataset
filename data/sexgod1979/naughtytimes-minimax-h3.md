# SexGod1979/NaughtyTimes-MiniMax-H3

## Resumen

`NaughtyTimes-MiniMax-H3` es un adaptador LoRA de rango 64 desarrollado por SexGod1979 para el modelo base MiniMax H3 FL2VA. Se trata de un adaptador de bajo rango destinado a modificar el comportamiento de un modelo de generación de vídeo, añadiendo capacidades específicas para contenido NSFW. El modelo fue entrenado sobre la versión sin podar del modelo base, lo que implica que no está garantizado su funcionamiento sobre versiones podadas del mismo.

El adaptador soporta tanto generación de vídeo a partir de texto (T2V) como a partir de imagen (I2V), con una mezcla de entrenamiento del 50/50 entre ambas modalidades. La licencia es Apache-2.0 y el tamaño del repositorio es de 1,8 GB. No se dispone de información adicional sobre parámetros totales, contexto o idiomas soportados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base MiniMax H3 FL2VA |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64, lo que implica que modifica las capas del modelo base mediante matrices de bajo rango, reduciendo el número de parámetros entrenables. Fue entrenado sobre el modelo base MiniMax H3 FL2VA sin podar, tal y como indica el autor en la model card. El conjunto de datos de entrenamiento no está documentado, pero se sabe que se utilizó una mezcla 50/50 entre tareas de texto a vídeo (T2V) e imagen a vídeo (I2V). No se menciona el uso de técnicas como RLHF o DPO.

El autor advierte explícitamente que el adaptador puede no funcionar correctamente sobre versiones podadas del modelo base, y anuncia la publicación de una versión adaptada a modelos podados en el futuro.

## Capacidades

- Generación de vídeo a partir de texto (T2V) y a partir de imagen (I2V).
- Adaptación de estilo NSFW sobre el comportamiento del modelo base.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingüe.

## Casos de uso

- Generación de contenido audiovisual para adultos: el adaptador permite generar vídeos con temática NSFW a partir de descripciones textuales o imágenes de referencia, aprovechando las capacidades del modelo base MiniMax H3 FL2VA.
- Creación de vídeos personalizados a partir de imágenes: gracias al soporte I2V, es posible partir de una imagen dada y generar un vídeo coherente con el estilo NSFW del adaptador.
- Producción de contenido para plataformas de entretenimiento para adultos: el adaptador puede integrarse en pipelines de generación automática de vídeo para producir material bajo demanda.
- Prototipado de modelos NSFW para investigación: permite experimentar con adaptadores de bajo rango sobre modelos de vídeo de gran tamaño sin necesidad de reentrenar el modelo completo.
- Generación de vídeos cortos para aplicaciones de chat o mensajería con contenido explícito.
- Adaptación de modelos base de vídeo a dominios específicos no censurados, usando LoRA como técnica de fine-tuning eficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Depende del modelo base MiniMax H3 FL2VA y de la resolución de vídeo generada.
- GPU recomendadas: no disponible. Al tratarse de un LoRA sobre un modelo base no documentado en detalle, no es posible especificar GPUs concretas.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible. El adaptador podría integrarse en frameworks que soporten LoRA para modelos de vídeo, como Diffusers o similares, pero no se proporciona información oficial.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El adaptador fue entrenado sobre el modelo base sin podar y el autor advierte que probablemente no funcione correctamente sobre versiones podadas.
- No se dispone de datos sobre sesgos, alucinaciones o limitaciones de contexto.
- Al ser un modelo NSFW, su uso está restringido a contextos donde este tipo de contenido sea legal y apropiado.
- La licencia Apache-2.0 permite uso comercial, pero la naturaleza del contenido generado puede estar sujeta a restricciones legales adicionales según la jurisdicción.
- No se han publicado métricas de calidad, seguridad o alineación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SexGod1979/NaughtyTimes-MiniMax-H3
