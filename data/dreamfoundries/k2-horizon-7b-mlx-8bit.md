# DreamFoundries/K2-Horizon-7B-MLX-8bit

## Resumen

K2-Horizon-7B-MLX-8bit es una conversión a MLX del modelo IFM/K2-Horizon-7B, creada por DreamFoundries para su integración en MLXHub. El modelo original, desarrollado por el Institute of Foundation Models (IFM), es un modelo de lenguaje denso de 7 mil millones de parámetros, liberado bajo licencia Apache-2.0. Esta conversión aplica cuantización affine de 8 bits con group size 64, manteniendo los routers K2 (mlp.gate y, donde estén presentes, self_attn.v_router) sin cuantizar.

El propósito de esta versión es permitir la ejecución eficiente del modelo en dispositivos con Apple Silicon mediante la biblioteca mlx-lm. Al estar cuantizado, reduce los requisitos de memoria en comparación con los pesos completos, lo que facilita su uso en entornos locales. Sin embargo, no se han publicado benchmarks de calidad ni de rendimiento para esta conversión, por lo que su comportamiento real no está validado.

La relevancia de este modelo radica en su disponibilidad como pesos abiertos y su integración con el ecosistema MLX, lo que lo convierte en una opción para desarrolladores que trabajan en aplicaciones de texto en inglés sobre macOS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible |
| Parametros totales | 7 mil millones (7B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8-bit affine (group size 64); routers K2 sin cuantizar |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura exacta del modelo original no se detalla en la información disponible. Se sabe que es un modelo denso de 7 mil millones de parámetros, y que incorpora routers K2 en las capas de MLP y, en algunos casos, en la atención (self_attn.v_router). La conversión a MLX utiliza cuantización affine de 8 bits con group size 64, dejando los routers sin cuantizar. El entrenamiento del modelo original se realizó con los datasets IFM/K2-Horizon-Pretrain-Data e IFM/K2-Horizon-Midtrain-Data. No se dispone de información sobre el número de tokens, la composición exacta de los datos ni sobre técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto en inglés.
- Uso conversacional, según las etiquetas del repositorio.
- Ejecución eficiente en Apple Silicon mediante MLX, gracias a la cuantización 8-bit.
- Compatibilidad con la biblioteca mlx-lm y con MLXHub.
- No se han documentado capacidades adicionales (tool calling, agentes, visión, audio) en la información disponible.

## Casos de uso

- Asistente conversacional local en macOS: el modelo puede integrarse en aplicaciones que usen mlx-lm para ofrecer un chatbot en inglés sin conexión. La cuantización 8-bit reduce la memoria necesaria, permitiendo su ejecución en MacBooks con RAM unificada.
- Generación de contenido en inglés: redacción de artículos, correos electrónicos o documentación técnica. Al ser un modelo de 7B, ofrece un equilibrio razonable entre calidad y consumo de recursos.
- Prototipado de aplicaciones de IA en Apple Silicon: los desarrolladores pueden usar mlx-lm para experimentar con el modelo localmente, aprovechando la integración con MLXHub para una descarga y carga sencillas.
- Resumen de documentos: el modelo puede procesar y resumir textos en inglés. Dado que la longitud de contexto no está especificada, se recomienda trabajar con fragmentos cortos para evitar errores.
- Educación y experimentación: al ser open-weights y con licencia Apache-2.0, es adecuado para investigar el comportamiento de modelos cuantizados en MLX y comparar con otras conversiones.
- Herramientas de productividad para macOS: integración en aplicaciones de escritorio que requieran generación de texto en inglés, evitando la dependencia de servicios en la nube y manteniendo los datos en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay benchmarks comparativos de calidad ni rendimiento para esta conversión.

## Requisitos de hardware

- VRAM estimada: los pesos en 8-bit ocupan aproximadamente 7 GB. Con overhead de inferencia, se recomienda al menos 8-10 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: no requiere GPU dedicada; está optimizado para Apple Silicon (M1, M2, M3, M4) mediante MLX.
- ¿Cabe en consumer GPU? No aplica, ya que MLX está diseñado para Apple Silicon. En Macs con 8 GB de RAM unificada puede ejecutarse con limitaciones; se recomiendan 16 GB o más.
- Opciones de despliegue: MLX (mlx_lm), MLXHub. No se han indicado opciones para vLLM, llama.cpp, Ollama, TGI, etc.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos similares. No se han publicado benchmarks de esta conversión ni del modelo original en la información proporcionada.

## Limitaciones y advertencias

- El repositorio muestra 0 descargas y 0 likes, lo que sugiere que es una conversión reciente o con poca validación por parte de la comunidad.
- El tamaño del repositorio es de 0.0 GB, lo que podría indicar que los pesos no están realmente subidos o que los metadatos son incorrectos. Se recomienda verificar el contenido antes de su uso.
- No se han publicado benchmarks de calidad ni rendimiento para esta conversión; el rendimiento real es desconocido.
- Solo soporta inglés.
- Los routers K2 permanecen sin cuantizar, lo que puede aumentar ligeramente el uso de memoria en comparación con una cuantización 8-bit completa.
- Al ser un modelo de lenguaje, existe riesgo de alucinación. Se recomienda supervisión humana en aplicaciones críticas.
- La licencia Apache-2.0 permite uso comercial, pero se deben revisar las condiciones de la licencia y los términos de los datasets de entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/DreamFoundries/K2-Horizon-7B-MLX-8bit
- Modelo original: https://huggingface.co/IFM/K2-Horizon-7B
- MLXHub: https://mlxhub.app/open-model?repo=DreamFoundries/K2-Horizon-7B-MLX-8bit
- Colección K2-Horizon: https://huggingface.co/collections/abenzerps/k2-horizon
