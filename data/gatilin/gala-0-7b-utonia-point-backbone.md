# gatilin/gala-0.7b-utonia-point-backbone

## Resumen

GALA Utonia point-cloud backbone es una extracción comunitaria de los pesos del codificador de nubes de puntos (`point_backbone.*`) del modelo multimodal GALA-0.7B, desarrollado originalmente por ChuchengXiang. El paquete, publicado por el usuario gatilin, aísla el componente de visión 3D del resto del sistema (proyector point-cloud y modelo de lenguaje) y lo distribuye como pesos independientes en formato safetensors para su uso en tareas de extracción de características sobre geometría tridimensional.

El interés de esta ficha es doble. Por un lado, documenta un backbone especializado en nubes de puntos con 137 millones de parámetros y una salida de 576 dimensiones, útil para pipelines de visión 3D. Por otro, es un ejemplo de extracción parcial de un modelo mayor con garantías estructurales pero sin validación funcional: el autor verifica la integridad byte a byte de los tensores frente al checkpoint original, pero advierte explícitamente de que no se ha ejecutado una inferencia real sobre una nube de puntos.

La relevancia es, por tanto, acotada y experimental. No se trata de un modelo listo para producción, sino de un artefacto de investigación que preserva nombres, formas y valores originales de 477 tensores float32 (549.015.264 bytes de payload) y que requiere un entorno con `spconv`, `torch-scatter`, `timm` y, para la configuración original, FlashAttention.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone de extracción de características para nubes de puntos (Utonia encoder), no es un ViT de imagen |
| Parametros totales | 137.253.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: es un encoder de características, sin ventana de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en float32) |
| Idiomas soportados | no disponible (modelo de visión 3D, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (477 tensores float32, 549.015.264 bytes) |

## Arquitectura y entrenamiento

El componente extraído corresponde al codificador Utonia de nubes de puntos, un backbone 3D que consume puntos con 9 canales de características (`xyz`, `rgb` y normales), opera con un tamaño de rejilla de 0,02 m y produce una representación final de 576 dimensiones. El código original incluido (`utonia_encoder.py`, `point_modules.py`) proviene del repositorio de GALA en la revisión `ab280a08ccffffe14f54e44132dc22d87873071e`, dentro de la ruta `third_party/LLaMA-Factory/src/llamafactory/model/pointlm`. La configuración de origen (`source_config.json`) emplea FlashAttention, y el autor señala que la opción `enable_flash=False` no ha sido validada en esta extracción.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, ni si el modelo original aplicó RLHF, DPO u otras técnicas de alineación. La model card del paquete no documenta el proceso de entrenamiento del backbone más allá de referenciar el modelo base GALA-0.7B y su repositorio fuente. La innovación técnica destacable aquí no es arquitectónica sino de ingeniería de distribución: la extracción preserva nombres, formas y valores de los tensores y los valida byte a byte contra rangos HTTP del checkpoint fijado, sin verificar comportamiento ni paridad de salida.

## Capacidades

- Extracción de características sobre nubes de puntos 3D con 9 canales de entrada (`xyz`, `rgb`, normales).
- Generación de embeddings de 576 dimensiones a partir de geometría tridimensional.
- Procesamiento con rejilla espacial de 0,02 m, adecuado para escenas de escala métrica.
- Integración como componente de un pipeline multimodal mayor (GALA), aunque el proyector point-cloud y el modelo de lenguaje se distribuyen por separado.
- No incluye generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni capacidades multilingües: es exclusivamente un encoder 3D.
- No se ha validado una pasada forward real sobre nube de puntos en el entorno de extracción.

## Casos de uso

- Segmentación y clasificación de escenas 3D: el backbone puede generar embeddings de 576 dimensiones por nube de puntos para alimentar cabezales de clasificación o segmentación semántica en entornos de investigación con `spconv` y `torch-scatter` disponibles.
- Detección de objetos en LiDAR: los puntos con `xyz`, `rgb` y normales y la rejilla de 0,02 m encajan en pipelines de percepción para robótica o conducción autónoma, siempre que se complete la validación funcional pendiente.
- Búsqueda y recuperación de geometría 3D: los embeddings permiten construir índices vectoriales para recuperar formas similares en catálogos de modelos CAD o escaneos.
- Reconstrucción y registro de nubes de puntos: el encoder puede servir como extractor de descriptores en pipelines de alineación o *registration* entre escaneos.
- Investigación en modelos multimodales 3D-lenguaje: al ser un componente de GALA, permite estudiar o reproducir la parte visual 3D de un sistema que combina nubes de puntos con un LLM, emparejándolo con el proyector publicado aparte.
- Prototipado académico de arquitecturas Utonia: útil para comparar variantes de encoders 3D o para hacer *fine-tuning* del backbone sobre datasets propios de geometría.
- Inspección y auditoría de checkpoints: los ficheros `extraction.json`, `tensor_mapping.json` y `structural_validation.json` permiten verificar la correspondencia con el modelo original en tareas de reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se realizó ninguna prueba de precisión 3D ni inferencia en GPU en esta release.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; los pesos en float32 ocupan aproximadamente 0,55 GB, por lo que el backbone en sí es ligero, pero el consumo real depende de la implementación de `spconv`, el tamaño del batch y la resolución de la nube de puntos.
- GPU recomendadas: no disponible. El autor no reporta pruebas en ninguna GPU; la extracción se realizó en una máquina macOS ARM sin `spconv` ni `torch_scatter`.
- Compatibilidad con GPU de consumo: probablemente sí por tamaño de pesos, pero no verificado.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el paquete incluye un *loader* de conveniencia no probado y requiere PyTorch, `spconv`, `torch-scatter`, `timm` y, para la configuración original, FlashAttention.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GALA Utonia point backbone (este) | 137,25 M | no aplica | Encoder de nubes de puntos | Apache-2.0 | Pesos extraídos, sin validación funcional |
| GALA-0.7B (modelo base completo) | no disponible | no disponible | Multimodal 3D + lenguaje | Apache-2.0 | Checkpoint completo en Hugging Face |
| GALA point-cloud projector | no disponible | no aplica | Proyector point-cloud | no disponible | Publicado por el mismo autor en repo aparte |
| Alternativas de encoder 3D (PointNet++, Point Transformer, etc.) | no disponible en la información proporcionada | no aplica | Extracción de características 3D | varía | no disponible |

No se dispone de datos de rendimiento comparativo entre este backbone y otros encoders 3D, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- El módulo nativo no se ha cargado estrictamente ni ejecutado sobre una nube de puntos en el entorno de extracción; el *loader* incluido es un esbozo no probado.
- Las validaciones realizadas (comparación byte a byte, formas, dtypes y valores finitos) no verifican comportamiento, calidad del modelo, procesamiento geométrico ni paridad de salida con el modelo completo.
- Requiere dependencias no triviales (`spconv`, `torch-scatter`, `timm`, FlashAttention) que pueden complicar el despliegue en determinados entornos.
- La opción `enable_flash=False` no ha sido validada; la configuración de origen asume FlashAttention.
- Es un componente aislado: no incluye el proyector point-cloud ni el modelo de lenguaje, por lo que no puede usarse por sí solo como sistema multimodal.
- No hay información sobre sesgos, alucinación o limitaciones idiomáticas porque el modelo no procesa texto.
- Licencia Apache-2.0 permite uso comercial, pero se conservan avisos de la fuente original Utonia; conviene revisar dichos avisos antes de redistribuir.
- No apto para producción sin una validación funcional previa en un entorno compatible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gatilin/gala-0.7b-utonia-point-backbone
- Modelo base GALA-0.7B: https://huggingface.co/ChuchengXiang/GALA-0.7B
- Proyector point-cloud del mismo autor: https://huggingface.co/gatilin/gala-0.7b-point-cloud-projector
- Repositorio fuente de GALA: https://github.com/xccElephant/GALA/tree/ab280a08ccffffe14f54e44132dc22d87873071e/third_party/LLaMA-Factory/src/llamafactory/model/pointlm
