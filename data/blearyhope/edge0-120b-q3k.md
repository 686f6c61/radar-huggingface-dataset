# blearyhope/Edge0-120B-q3k

## Resumen

Edge0-120B-q3k es una cuantización GGUF de 4 bits (etiquetada q3k) publicada por el usuario blearyhope en Hugging Face, derivada del modelo base Qwen/Qwen3.8-Flash-Next. El autor la presenta como un modelo de arquitectura MoE (mixture of experts) orientado a inferencia en el borde (edge inference), con soporte para agentes y generación de código, empaquetada bajo una librería propia denominada `edge0`. El repositorio tiene un tamaño de 93,2 GB y declara 4.947.698.560 parámetros totales según los datos de safetensors, un dato que resulta inconsistente con el nombre comercial "120B" y con el tamaño del repositorio.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el modelo no registra descargas ni interacciones, la model card está dominada por CSS de presentación y no contiene documentación técnica sustantiva sobre entrenamiento, datos o evaluación. Además, la información disponible presenta contradicciones internas (nombre frente a parámetros declarados, etiqueta de cuantización q3k frente a la de 4 bits, licencia "other" frente a un identificador propio) que el lector debe considerar antes de cualquier uso.

Se trata, por tanto, de una publicación de la que se puede describir su empaquetado y sus metadatos, pero no sus capacidades reales ni su calidad, ya que no se han publicado resultados de benchmarks ni detalles de entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts), según etiquetas del autor; detalles no disponibles |
| Parametros totales | 4.947.698.560 (según safetensors); el nombre comercial indica "120B", dato contradictorio |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF de 4 bits (etiqueta "4-bit"); el sufijo del nombre indica q3k |
| Idiomas soportados | no disponible |
| Licencia | edge0-community-model-1.0 (campo `license: other` en la model card) |
| Formato de pesos | GGUF (etiqueta `gguf`); el repositorio declara la librería `edge0` |

## Arquitectura y entrenamiento

El autor etiqueta el modelo como MoE y "latent-moe", lo que sugiere una variante de mezcla de expertos con representaciones latentes, pero no se proporciona ninguna descripción de la arquitectura interna: ni número de expertos, ni dimensión de las capas, ni mecanismo de enrutamiento, ni tipo de atención. Tampoco se documenta si emplea atención lineal, decodificación especulativa u otras innovaciones. El modelo base declarado es Qwen/Qwen3.8-Flash-Next, del que no se aportan detalles en la información disponible.

No hay información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO u otras fases de alineación. La model card no incluye sección técnica: el contenido visible es fundamentalmente CSS de presentación de la propia tarjeta. Cualquier afirmación sobre el proceso de entrenamiento sería especulativa y no se recoge en esta ficha.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` y el pipeline `text-generation`.
- Orientación declarada a agentes y razonamiento multi-paso, según las etiquetas `agent` y `coding`.
- Generación de código, según la etiqueta `coding`.
- Inferencia en el borde (edge inference) como objetivo de diseño declarado por el autor.
- Compatibilidad con endpoints, según la etiqueta `endpoints_compatible`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.
- Capacidades multilingües: no disponibles; no se declara lista de idiomas.

## Casos de uso

- Asistencia de código en local: el formato GGUF y la orientación a edge inference permiten ejecutar el modelo en estaciones de trabajo sin GPU de centro de datos, integrándolo en editores o CLI para autocompletado y explicación de código.
- Agentes autónomos de ámbito reducido: la etiqueta `agent` sugiere su uso en bucles de razonamiento multi-paso, aunque la ausencia de datos sobre tool calling obliga a validar esta capacidad antes de desplegarla.
- Prototipado rápido en entornos con recursos limitados: al ser una cuantización de 4 bits, puede servir para experimentar con un modelo de gran tamaño nominal en hardware de consumo, siempre que se verifique el tamaño real de los pesos.
- Procesamiento por lotes en el borde: despliegue en servidores perimetrales o dispositivos con CUDA para tareas de generación de texto donde no se requiera conexión a la nube.
- Evaluación comparativa de cuantizaciones: útil para investigadores que quieran medir la degradación de una cuantización q3k/4-bit frente al modelo base Qwen/Qwen3.8-Flash-Next.
- Integración en pipelines conversacionales: el pipeline `text-generation` y la etiqueta `conversational` permiten montar un servicio de chat básico, previa verificación de la licencia para uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 93,2 GB, por lo que la inferencia completa requiere del orden de 90-100 GB de memoria, muy por encima de una GPU de consumo.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño del repositorio, un despliegue completo exigiría múltiples aceleradores (por ejemplo, varias A100/H100) o CPU con suficiente RAM.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en tarjetas de 48 GB en su configuración actual, según el tamaño del repositorio.
- Opciones de despliegue: el formato GGUF es compatible con llama.cpp y derivados (Ollama, LM Studio), aunque el repositorio declara la librería propietaria `edge0`, lo que puede limitar la compatibilidad con herramientas estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Edge0-120B-q3k | 4.947.698.560 según safetensors (nombre indica 120B) | no disponible | edge0-community-model-1.0 | GGUF | Hugging Face, 0 descargas |
| Qwen/Qwen3.8-Flash-Next (modelo base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Otras cuantizaciones GGUF de la familia Qwen | no disponible | no disponible | según modelo base | GGUF | Hugging Face |

No se dispone de datos suficientes para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Inconsistencia entre el nombre "120B" y los 4.947.698.560 parámetros declarados en safetensors; el dato de tamaño debe verificarse antes de planificar el despliegue.
- El repositorio ocupa 93,2 GB, coherente con un modelo de gran tamaño, pero no con el recuento de parámetros indicado; existe riesgo de que los metadatos estén mal etiquetados.
- La model card no contiene documentación técnica: no hay información sobre entrenamiento, datos, evaluación ni limitaciones conocidas.
- No se han publicado benchmarks, por lo que no es posible estimar la calidad frente al modelo base ni frente a alternativas.
- Riesgo de alucinación y sesgos: no evaluado ni documentado por el autor.
- Idiomas soportados no declarados; no se puede garantizar un comportamiento correcto en castellano.
- Licencia "edge0-community-model-1.0" con campo `license: other`: es necesario revisar el archivo LICENSE del repositorio antes de cualquier uso comercial, ya que las condiciones no están resumidas en la información disponible.
- El modelo no registra descargas ni interacciones, y fue creado y actualizado el mismo día (2026-11-23), lo que sugiere una publicación sin validación comunitaria.
- La dependencia de la librería propietaria `edge0` puede dificultar la integración con herramientas estándar del ecosistema.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blearyhope/Edge0-120B-q3k
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia: archivo LICENSE dentro del repositorio del modelo (no se dispone de URL directa en la información proporcionada)
