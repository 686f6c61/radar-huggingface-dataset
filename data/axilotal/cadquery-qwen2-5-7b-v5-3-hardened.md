# Axilotal/cadquery-qwen2.5-7b-v5.3-hardened

## Resumen

El modelo Axilotal/cadquery-qwen2.5-7b-v5.3-hardened es un fine-tuning del modelo Qwen2.5-7B, desarrollado por Axilotal. Se ha entrenado con la librería Unsloth y la librería TRL de HuggingFace, lo que según el autor permitió un entrenamiento dos veces más rápido. El modelo está publicado bajo licencia Apache 2.0 y etiquetado como text-generation y conversational. El nombre sugiere que está orientado a tareas relacionadas con CadQuery, una librería de modelado CAD en Python, aunque la documentación disponible no lo confirma explícitamente. El modelo tiene 7.615.616.512 parámetros y el repositorio ocupa 15.2 GB, lo que corresponde a pesos en FP16. Es una iteración más del modelo base Axilotal/cadquery-qwen2.5-7b-v5.2-hardened.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only) basado en Qwen2.5-7B |
| Parámetros totales | 7.615.616.512 (7.6B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del modelo Qwen2.5-7B, que es un transformer decoder-only con 7.6 mil millones de parámetros. El proceso de entrenamiento se llevó a cabo con Unsloth, una librería que optimiza el fine-tuning de modelos grandes, y la librería TRL de HuggingFace. El modelo base es Axilotal/cadquery-qwen2.5-7b-v5.2-hardened, por lo que este modelo representa una iteración posterior en la misma línea de desarrollo. No se han proporcionado detalles sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si se aplicaron técnicas como RLHF o DPO. Tampoco se documentan innovaciones arquitectónicas más allá del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generación de texto: el modelo está etiquetado con el pipeline text-generation.
- Soporte conversacional: la etiqueta "conversational" indica que está pensado para mantener diálogos.
- Idiomas: solo se especifica inglés (en).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión o audio: no disponible.
- Se desconoce si el modelo tiene capacidades específicas para CadQuery, aunque el nombre lo sugiere.

## Casos de uso

La documentación del modelo no especifica casos de uso confirmados. A partir del nombre "cadquery" y de la arquitectura Qwen2.5-7B, se pueden inferir los siguientes casos de uso potenciales, que requieren validación previa:

- Generación de scripts CadQuery: el modelo podría traducir descripciones en lenguaje natural a código Python utilizando CadQuery, lo que facilitaría el diseño paramétrico de piezas.
- Edición de modelos CAD existentes: podría modificar parámetros o geometría de scripts CadQuery a partir de instrucciones en texto.
- Explicación de código CadQuery: podría generar comentarios o documentación sobre scripts CadQuery complejos.
- Asistente en notebooks de diseño: integración en Jupyter para crear y modificar modelos CAD de forma conversacional.
- Automatización de variantes de piezas: generación de múltiples variantes de una pieza a partir de especificaciones.
- Documentación técnica de productos: creación de documentación asociada a modelos CAD generados con CadQuery.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para cargar los pesos en FP16 se necesitan aproximadamente 15.2 GB de VRAM. Sumando memoria para activaciones y caché KV, se recomienda una GPU con al menos 20-24 GB de VRAM para una ventana de contexto moderada.
- GPU recomendadas: RTX 4090 (24 GB), A100 40 GB, A100 80 GB o H100.
- Consumer GPU: una RTX 4090 puede ejecutar el modelo en FP16, aunque la ventana de contexto quedará limitada. Para cuantizaciones de 4 bits, una RTX 3090 o 4080 también podría ser viable, pero no se han publicado cuantizaciones oficiales.
- Opciones de despliegue: al ser un modelo de la familia Transformers con pesos en safetensors, puede desplegarse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos. El modelo es un fine-tuning de Qwen2.5-7B, pero no se han publicado benchmarks ni comparativas que permitan situarlo frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no documentado, pero inherente a los modelos de lenguaje generativo.
- Limitaciones de idioma: el modelo solo está etiquetado para inglés, por lo que su rendimiento en otros idiomas probablemente sea limitado.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base Qwen2.5-7B para confirmar las condiciones.
- Caveat importante: el modelo no tiene documentación técnica detallada ni benchmarks publicados. Debe evaluarse exhaustivamente antes de usarse en entornos de producción.
- El modelo no tiene descargas ni likes en HuggingFace, lo que indica que es un modelo nuevo y sin validación externa.

## Enlaces

- HuggingFace: https://huggingface.co/Axilotal/cadquery-qwen2.5-7b-v5.3-hardened
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
