# Lanni-ni/hard_5gram_4_6_384_babylm_100m_seed44

## Resumen

El modelo Lanni-ni/hard_5gram_4_6_384_babylm_100m_seed44 es un modelo de lenguaje publicado en HuggingFace por el usuario Lanni-ni. Cuenta con aproximadamente 28,75 millones de parámetros y un tamaño de repositorio de 0,1 GB. Está etiquetado como modelo de generación de texto y utiliza el formato safetensors. El nombre del modelo sugiere una posible relación con el desafío BabyLM (100m), que explora el entrenamiento eficiente con corpus de 100 millones de palabras, aunque no hay documentación que lo confirme.

La model card asociada no contiene información más allá de los metadatos automáticos: todos los campos relevantes aparecen como [More Information Needed]. Las etiquetas indican que el modelo requiere código personalizado (custom_code) y utiliza una ventana deslizante (sliding_window), lo que apunta a una arquitectura no estándar. El modelo no tiene descargas ni likes, por lo que debe considerarse experimental y no apto para su uso en producción sin una evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 28.750.464 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la model card. Las etiquetas del repositorio indican `custom_code` y `sliding_window`, lo que sugiere que se trata de una arquitectura de transformer con atención de ventana deslizante que requiere código personalizado para cargarse. El nombre del modelo contiene `5gram`, `4_6` y `384`, que podrían hacer referencia a configuraciones específicas, pero no se dispone de datos verificados.

Tampoco se conocen los datos de entrenamiento, el número de tokens ni si se aplicaron técnicas como RLHF o DPO. La única referencia externa presente en las etiquetas es el artículo arxiv:1910.09700, que corresponde a Lacoste et al. sobre la calculadora de impacto medioambiental, no a un paper que describa este modelo.

## Capacidades

- Generacion de texto: el modelo está catalogado con el pipeline de `text-generation`, por lo que se puede intentar generar texto, aunque no se han publicado evaluaciones.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.
- Nota: el modelo requiere `custom_code` para su carga, lo que limita su uso a entornos que puedan ejecutar ese código.

## Casos de uso

Debido a la total falta de documentación, no es posible enumerar casos de uso concretos y verificados. Cualquier aplicación debería partir de una evaluación interna del modelo, especialmente en lo relativo a su calidad de generación, idiomas y comportamiento. No se recomienda su uso en producción sin antes contactar con el autor y aclarar la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: un modelo de 28,75 millones de parámetros ocupa aproximadamente 115 MB en FP32 y 57,5 MB en FP16, por lo que puede ejecutarse en GPU con tan solo 1 GB de VRAM o incluso en CPU.
- GPU recomendadas: no hay requisitos de hardware publicados; cualquier GPU moderna o CPU debería ser suficiente.
- ¿Cabe en consumer GPU? Sí, en cualquier GPU de consumo.
- Opciones de despliegue: al utilizar `custom_code`, se requiere el código personalizado del autor para cargar el modelo. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables ni de benchmarks que permitan situar este modelo frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- La licencia no está especificada, por lo que se desconocen los términos de uso y si permite uso comercial.
- La model card está vacía; no hay información sobre sesgos, riesgos o limitaciones evaluadas.
- El modelo requiere `custom_code`, lo que plantea riesgos de seguridad y dificulta su mantenimiento.
- No se han publicado evaluaciones de alucinación ni de rendimiento; cualquier uso en producción es arriesgado.
- Los idiomas soportados no están definidos; el modelo podría comportarse mal en lenguajes distintos al usado en entrenamiento.
- No hay información sobre restricciones de licencia, pero al ser "no disponible", se debe contactar con el autor.

## Enlaces

- HuggingFace: https://huggingface.co/Lanni-ni/hard_5gram_4_6_384_babylm_100m_seed44
- Paper (etiqueta arxiv:1910.09700): https://arxiv.org/abs/1910.09700 (nota: la etiqueta se refiere a Lacoste et al., no a un paper del modelo)
