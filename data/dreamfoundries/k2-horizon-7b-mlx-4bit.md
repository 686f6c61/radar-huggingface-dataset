# DreamFoundries/K2-Horizon-7B-MLX-4bit

## Resumen

El modelo K2-Horizon-7B-MLX-4bit es una conversión a MLX con cuantización de 4 bits del modelo IFM/K2-Horizon-7B, desarrollado por el Institute of Foundation Models (IFM) y convertido por DreamFoundries para su uso en MLXHub. Se trata de un modelo de lenguaje denso de 7 mil millones de parámetros, liberado bajo licencia Apache-2.0, que ha sido entrenado con los datasets IFM/K2-Horizon-Pretrain-Data y IFM/K2-Horizon-Midtrain-Data. La conversión utiliza cuantización afín con grupo de tamaño 64 y mantiene los routers K2 (mlp.gate y self_attn.v_router) sin cuantizar.

El modelo está diseñado para generación de texto en inglés y se distribuye en formato safetensors para la librería MLX, lo que permite su ejecución eficiente en dispositivos Apple Silicon. No se han publicado benchmarks comparativos de calidad o rendimiento para esta conversión, por lo que su evaluación requiere pruebas propias.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el modelo se describe como denso, con routers K2 en mlp.gate y self_attn.v_router) |
| Parametros totales | 7 mil millones (según nomenclatura del modelo) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit afín con grupo de 64 (MLX); los routers K2 permanecen sin cuantizar |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base IFM/K2-Horizon-7B. Los metadatos indican que se trata de un modelo denso de 7 mil millones de parámetros con routers K2, que aparecen en las capas mlp.gate y, cuando están presentes, en self_attn.v_router. Estos routers se mantienen sin cuantizar en la conversión MLX, lo que sugiere que forman parte de una particularidad técnica del modelo no descrita en la documentación pública.

El entrenamiento del modelo original utilizó los datasets IFM/K2-Horizon-Pretrain-Data e IFM/K2-Horizon-Midtrain-Data, aunque no se proporcionan detalles sobre el número de tokens, la composición del corpus ni si se aplicaron técnicas de alineación como RLHF o DPO. La conversión a MLX fue realizada por DreamFoundries con su fork de mlx-lm en el commit 0f74c0e, aplicando cuantización afín de 4 bits con grupo de 64.

## Capacidades

- Generación de texto en inglés, según el pipeline text-generation declarado.
- Compatibilidad con el ecosistema MLX y MLXHub para ejecución en Apple Silicon.
- Los routers K2 permanecen sin cuantizar, lo que puede preservar ciertas propiedades de la arquitectura original.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Asistente conversacional en inglés en macOS: el modelo puede ejecutarse localmente en dispositivos Apple Silicon mediante MLX, aprovechando la cuantización 4-bit para reducir el uso de memoria unificada.
- Investigación sobre arquitecturas con routers K2: al mantener los routers sin cuantizar, resulta adecuado para estudiar el comportamiento de estos componentes en un modelo de 7B.
- Desarrollo de aplicaciones de generación de texto en el ecosistema Apple: integración con mlx-lm para prototipado rápido de herramientas de escritura o chat.
- Evaluación de técnicas de cuantización: permite comparar la calidad de una conversión MLX 4-bit frente al modelo base IFM/K2-Horizon-7B, aunque no existen benchmarks publicados.
- Uso en proyectos con licencia Apache-2.0: la licencia permisiva facilita la integración en aplicaciones comerciales o de investigación.
- Experimentación en entornos con memoria limitada: al ser una cuantización a 4 bits, el modelo reduce los requisitos de almacenamiento y memoria en comparación con una versión sin cuantizar, lo que lo hace útil para pruebas en equipos con recursos modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no existen benchmarks comparativos de calidad o rendimiento para esta conversión.

## Requisitos de hardware

- Memoria unificada estimada: aproximadamente 4 GB para los pesos cuantizados a 4 bits (7 mil millones de parámetros x 4 bits = 3,5 GB, más overhead de los routers sin cuantizar y el runtime). Esta es una estimación basada en el tamaño declarado, no un dato oficial.
- GPU recomendadas: no aplica; el modelo está pensado para Apple Silicon (M1, M2, M3, M4) mediante MLX.
- Capacidad en GPU de consumo: no aplica para GPU NVIDIA; en Apple Silicon, los modelos con 8 GB de memoria unificada o más deberían poder ejecutarlo.
- Opciones de despliegue: MLX con mlx-lm, cargando directamente desde HuggingFace con la función load. También se puede usar a través de MLXHub. El modelo está marcado con custom_code, por lo que se recomienda usar el fork de DreamFoundries de mlx-lm.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables en la información recibida.

## Limitaciones y advertencias

- El modelo solo soporta el idioma inglés, según los metadatos.
- No se han publicado benchmarks de calidad, por lo que se desconoce su rendimiento real frente a otros modelos de 7B.
- La conversión MLX 4-bit puede introducir pérdidas de calidad respecto al modelo base, especialmente en tareas complejas.
- No hay información sobre sesgos, riesgos de alucinación o comportamientos no deseados; se recomienda evaluar el modelo en el dominio de uso antes de desplegarlo en producción.
- La licencia Apache-2.0 permite uso comercial, pero es responsabilidad del usuario cumplir con los términos de la licencia y con las condiciones de los datasets de entrenamiento.
- El repositorio está marcado con custom_code, lo que puede limitar la compatibilidad con herramientas de inferencia que no soporten cargadores personalizados.
- El repositorio no tiene descargas ni likes, lo que sugiere que el modelo no ha sido ampliamente probado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DreamFoundries/K2-Horizon-7B-MLX-4bit
- Modelo base en HuggingFace: https://huggingface.co/IFM/K2-Horizon-7B
- MLXHub: https://mlxhub.app/open-model?repo=DreamFoundries/K2-Horizon-7B-MLX-4bit
- Colección de DreamFoundries en HuggingFace: https://huggingface.co/DreamFoundries/collections

Nota: la información sobre el modelo base (IFM/K2-Horizon-7B) es mínima; no se han encontrado papers, blogs o repositorios adicionales en la búsqueda web.
