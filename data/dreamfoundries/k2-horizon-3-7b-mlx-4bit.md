# DreamFoundries/K2-Horizon-3.7B-MLX-4bit

## Resumen

K2-Horizon-3.7B-MLX-4bit es una conversión en formato MLX 4-bit del modelo K2-Horizon-3.7B, desarrollada por DreamFoundries para su integración en MLXHub. El modelo original pertenece al Institute of Foundation Models (IFM) y se distribuye bajo licencia Apache-2.0. Esta versión está pensada para ejecutarse en dispositivos Apple Silicon mediante la librería mlx-lm, ofreciendo una opción de inferencia local y eficiente en memoria.

La conversión utiliza cuantización affine de 4 bits con un tamaño de grupo de 64, y mantiene los routers K2 (`mlp.gate` y, en su caso, `self_attn.v_router`) sin cuantizar, lo que preserva su precisión. El modelo está etiquetado como "dense" y orientado a generación de texto conversacional en inglés. No se han publicado benchmarks comparativos para esta conversión, por lo que su rendimiento relativo no está documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (etiquetado como "dense") |
| Parametros totales | 5.058.255.360 (según safetensors; el nombre indica 3.7B) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit affine (group size 64) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base IFM/K2-Horizon-3.7B. Los metadatos de HuggingFace lo etiquetan como "dense", lo que sugiere que no es un modelo de mezcla de expertos (MoE). Sin embargo, la conversión MLX menciona explícitamente los "routers K2" (`mlp.gate` y `self_attn.v_router`), que permanecen sin cuantizar. Esto podría indicar la presencia de algún mecanismo de enrutamiento interno, aunque no se especifica su función.

El entrenamiento se realizó sobre los datasets IFM/K2-Horizon-Pretrain-Data y IFM/K2-Horizon-Midtrain-Data, según la model card, pero no se proporcionan detalles sobre el número de tokens, la composición del corpus ni si se aplicaron técnicas como RLHF o DPO. La conversión a MLX utiliza cuantización affine de 4 bits con group size 64, y los routers K2 se mantienen en su precisión original. No se dispone de más innovaciones técnicas documentadas.

## Capacidades

- Generación de texto conversacional en inglés.
- Ejecución en Apple Silicon mediante MLX (`mlx-lm`) y MLXHub.
- Cuantización 4-bit affine con group size 64, que reduce el uso de memoria.
- Preservación de los routers K2 sin cuantizar, lo que puede mejorar la fidelidad en las rutas de mezcla si el modelo los utiliza.
- No se especifican capacidades de tool calling, function calling, agentes, visión ni audio.
- No se documentan modos de razonamiento especiales (thinking mode).

## Casos de uso

- Asistente conversacional local en macOS: el modelo puede integrarse en aplicaciones de escritorio para ofrecer respuestas generadas en inglés sin conexión, aprovechando la memoria unificada de Apple Silicon.
- Prototipado de aplicaciones de IA en iOS: gracias a la conversión MLX, es viable incorporar el modelo en apps de iPhone o iPad para funcionalidades de texto, siempre que el dispositivo tenga suficiente memoria.
- Investigación en cuantización: la configuración 4-bit affine con group size 64 y la preservación de routers K2 sirven como caso de estudio para evaluar el impacto de la cuantización selectiva en modelos de lenguaje.
- Desarrollo de herramientas de productividad: puede emplearse en asistentes de redacción o resumen de textos en inglés dentro de entornos de desarrollo basados en MLX.
- Experimentación con fine-tuning local: al ser un modelo de pesos abiertos (Apache-2.0), los investigadores pueden ajustarlo en Apple Silicon para tareas específicas, siempre que cuenten con los datos adecuados.
- Integración en pipelines de generación de texto para entornos con restricciones de hardware: su tamaño de 2.9 GB y cuantización 4-bit permiten ejecutarlo en equipos con 8 GB de RAM o más, lo que lo hace adecuado para despliegues ligeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se dispone de benchmarks comparativos de calidad y rendimiento para esta conversión.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 2.9 GB, por lo que se requiere aproximadamente 3-4 GB de memoria unificada en Apple Silicon para la inferencia.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4) con suficiente memoria unificada. No se recomiendan GPUs NVIDIA, ya que el modelo está en formato MLX.
- Compatibilidad con GPU de consumo: sí, en Macs con 8 GB o más de memoria unificada.
- Opciones de despliegue: `mlx-lm` (con el fork de DreamFoundries), MLXHub, y posiblemente otras herramientas del ecosistema MLX.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo es una conversión MLX del IFM/K2-Horizon-3.7B, y existen otras cuantizaciones del mismo modelo base (según la búsqueda en HuggingFace), pero no se ofrecen datos de rendimiento para comparar.

## Limitaciones y advertencias

- No hay benchmarks publicados para la conversión, por lo que su calidad relativa es desconocida.
- El modelo solo soporta inglés; no se documentan capacidades multilingües.
- No se especifica la longitud de contexto, lo que limita su uso en aplicaciones que requieran ventanas largas.
- No se documentan capacidades de tool calling ni integración con agentes.
- La discrepancia entre el nombre del modelo (3.7B) y el total de parámetros en safetensors (5.058.255.360) puede deberse a tensores adicionales en la conversión; se recomienda verificar el tamaño real antes de planificar el despliegue.
- Al ser una conversión de terceros (DreamFoundries), el soporte y la fiabilidad de la cuantización dependen del fork de `mlx-lm` utilizado.
- La licencia Apache-2.0 permite uso comercial, pero exige conservar el aviso de licencia y atribución.

## Enlaces

- HuggingFace: https://huggingface.co/DreamFoundries/K2-Horizon-3.7B-MLX-4bit
- Modelo base: https://huggingface.co/IFM/K2-Horizon-3.7B
- Documentación IFM: https://docs.ifm.ai/
- Modelos cuantizados del mismo base: https://huggingface.co/models?other=base_model%3Aquantized%3AIFM%2FK2-Horizon-3.7B
- MLXHub: https://mlxhub.app/open-model?repo=DreamFoundries/K2-Horizon-3.7B-MLX-4bit
- App MLXHub: https://apps.apple.com/app/apple-store/id6766485144?pt=121945436&ct=HuggingFace&mt=8
