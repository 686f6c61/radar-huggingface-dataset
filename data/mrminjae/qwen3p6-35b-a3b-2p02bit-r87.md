# mrminjae/qwen3p6-35b-a3b-2p02bit-r87

## Resumen

Qwen3.6-35B-A3B 2.02-bit (r87) es un checkpoint de investigación publicado por el usuario mrminjae en Hugging Face, derivado del modelo base Qwen/Qwen3.6-35B-A3B. Se trata de una cuantización extrema selectiva: únicamente los expertos enrutados (routed experts) del modelo MoE se comprimen a una media de 2,02 bits por peso, mientras que el resto de los pesos (atención, embeddings, capas densas, router) permanece en BF16. Los pesos se almacenan ya descomprimidos en tensores BF16, de modo que se cargan con transformers o vLLM estándar sin necesidad de kernels de cuantización especiales.

El modelo resuelve un problema concreto: reducir drásticamente el espacio en disco y el ancho de banda de memoria de un MoE de 35.107.181.936 parámetros totales, manteniendo la compatibilidad con el ecosistema estándar. El repositorio ocupa 70,2 GB, lo que da una idea de la mezcla entre expertos comprimidos y resto en BF16. Es relevante ahora porque explora hasta dónde se puede llevar la cuantización de expertos en arquitecturas MoE sin romper la portabilidad del checkpoint.

No obstante, se trata de un checkpoint interno de investigación, sin model card detallada, sin licencia explícita declarada en la ficha (el autor indica que sigue la del modelo base, pero esta no se especifica en la información disponible) y sin datos publicados de evaluación. Su uso en producción requeriría validación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE sobre transformer (tag `qwen3_5_moe`), con expertos enrutados |
| Parámetros totales | 35.107.181.936 (dato real de safetensors) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Expertos enrutados a 2,02 bits de media; resto de pesos en BF16; pesos almacenados descomprimidos en tensores BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor indica que sigue la del modelo base, sin especificar cuál) |
| Formato de pesos | safetensors (descomprimidos en BF16), librería transformers |

## Arquitectura y entrenamiento

El modelo base es un MoE de tipo Qwen3.5 (`qwen3_5_moe`) con 35.107.181.936 parámetros totales. La modificación introducida por este checkpoint no afecta a la arquitectura ni al entrenamiento, sino a la representación de los pesos: solo los expertos enrutados se someten a una cuantización agresiva que promedia 2,02 bits por peso, mientras que el resto de componentes se mantiene en BF16. Al guardarse descomprimidos en BF16, la inferencia no requiere kernels de cuantización de bajo bit ni cambios en el grafo del modelo; la compresión actúa como una aproximación de los pesos originales.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si hubo RLHF, DPO u otras etapas de alineación. Tampoco se documenta el método exacto de cuantización (por ejemplo, qué esquema de escalas, agrupación o corrección de error se aplicó a los expertos), lo que limita la reproducibilidad. El identificador interno "r87" sugiere una iteración dentro de una búsqueda de configuraciones de cuantización, pero no se aportan detalles.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado (`text-generation`, tags `conversational`).
- Procesamiento de imagen y texto (`image-text-to-text`), heredado del modelo base multimodal.
- Razonamiento y generación de código: capacidades presumibles del modelo base Qwen3.6, aunque no verificadas en este checkpoint.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking u otras capacidades especiales: no disponibles.

## Casos de uso

- Investigación sobre cuantización de MoE: el checkpoint permite estudiar el impacto de comprimir solo los expertos enrutados a 2,02 bits frente al modelo base en BF16, comparando perplejidad y calidad de generación en tareas controladas.
- Despliegue con memoria limitada en experimentos: al almacenarse en BF16 descomprimido, se puede cargar con transformers o vLLM estándar, lo que facilita probar el modelo en entornos donde no se dispone de kernels de cuantización específicos.
- Evaluación de robustez multimodal: al conservar el pipeline `image-text-to-text`, sirve para medir cómo afecta la compresión de expertos a tareas de imagen y texto en comparación con el modelo base.
- Reproducción de pipelines de inferencia: útil como caso de prueba para validar que un checkpoint con expertos comprimidos y resto en BF16 funciona en stacks convencionales sin parches.
- Generación de texto en prototipos internos: para experimentos de conversación donde la prioridad es el tamaño del checkpoint y no la calidad máxima.
- Base para estudios de destilación o recuperación de calidad: permite analizar si el error introducido por la cuantización de expertos se puede corregir con ajuste fino posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 70,2 GB, por lo que la descarga y el almacenamiento requieren al menos esa capacidad libre.
- Al cargarse en BF16, la VRAM necesaria para inferencia es comparable a la de un modelo de ~35.000 millones de parámetros en BF16 (aproximadamente 70 GB solo para pesos), más overhead de activaciones y caché KV.
- GPU recomendadas: H100 80 GB, A100 80 GB o configuraciones multi-GPU para cubrir los pesos en BF16.
- No cabe en GPU de consumo tipo RTX 4090 (24 GB) sin técnicas adicionales de offloading o cuantización en tiempo de carga, que no están documentadas para este checkpoint.
- Opciones de despliegue: transformers y vLLM, según indica el autor; no se confirma soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p02bit-r87 | 35.107.181.936 | no disponible | no disponible | safetensors BF16 (expertos a 2,02 bits) | Checkpoint de investigación, sin benchmarks |
| Qwen/Qwen3.6-35B-A3B | 35.107.181.936 (según checkpoint derivado) | no disponible | no disponible | no disponible | Modelo base sin comprimir |
| Alternativas de ~35B MoE | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- Checkpoint de investigación interna ("internal research checkpoint"), sin evaluación publicada; no se recomienda su uso en producción sin validación propia.
- La cuantización a 2,02 bits de media en los expertos enrutados introduce un error de aproximación cuyo impacto en calidad no está cuantificado.
- Aunque los pesos se almacenan en BF16, el contenido de los expertos ya ha perdido precisión; el tamaño en disco (70,2 GB) no refleja una reducción proporcional al uso de memoria en inferencia.
- Licencia no disponible de forma explícita: el autor remite a la del modelo base, pero esta no se especifica en la información proporcionada. Verificar antes de cualquier uso comercial.
- Idiomas soportados no documentados.
- Longitud de contexto no documentada.
- Riesgo de alucinación y sesgos: no evaluados en este checkpoint.
- Sin datos de benchmarks, no es posible comparar su rendimiento con el modelo base ni con alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p02bit-r87
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
