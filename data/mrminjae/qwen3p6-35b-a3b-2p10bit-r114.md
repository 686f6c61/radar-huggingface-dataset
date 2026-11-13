# mrminjae/qwen3p6-35b-a3b-2p10bit-r114

## Resumen

Qwen3.6-35B-A3B-2p10bit-r114 es un checkpoint de investigación publicado por el usuario mrminjae en Hugging Face, consistente en una cuantización selectiva del modelo base Qwen/Qwen3.6-35B-A3B. La intervención aplica una precisión media de 2,10 bits exclusivamente a los expertos enrutados (routed experts) de la arquitectura MoE, mientras que el resto de pesos se mantiene en BF16. Los pesos se almacenan desnormalizados (dequantized) en tensores BF16, de modo que se cargan con `transformers` o vLLM estándar sin necesidad de kernels de cuantización específicos.

El modelo base es un MoE de la familia Qwen3.6 con 35B de parámetros nominales y 3B activos por token, orientado a generación de texto y a tareas image-text-to-text según los tags del repositorio. Esta variante cuantizada no está pensada como un release de producción: el propio autor la describe como "internal research checkpoint", sin model card extendida, sin datos de evaluación y sin licencia declarada explícita (la licencia sigue la del modelo base).

Su relevancia es acotada pero técnica: demuestra una estrategia de compresión agresiva sobre los expertos de un MoE manteniendo el resto de la red en BF16, lo que permite reducir el tamaño del repositorio respecto a una versión BF16 completa a costa de una pérdida de precisión no documentada. Con 0 descargas y 0 likes en el momento de la consulta, no hay evidencia de uso en la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo `qwen3_5_moe` (transformer con mezcla de expertos) |
| Parametros totales | 67.319.436.656 (según safetensors; el nombre comercial indica 35B) |
| Parametros activos | 3B (según el nombre del modelo; no verificado en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,10 bits de media; resto de pesos en BF16; pesos almacenados desnormalizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor indica que sigue la licencia del modelo base) |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE) identificado en los tags como `qwen3_5_moe`, derivado del modelo base Qwen/Qwen3.6-35B-A3B. El repositorio declara 67.319.436.656 parámetros totales en safetensors, cifra que no coincide con los 35B del nombre comercial; esta discrepancia puede deberse a la contabilización de todos los expertos, a un desajuste de nomenclatura o a la inclusión de componentes adicionales, y no puede resolverse con la información disponible. El nombre indica 3B de parámetros activos por token.

La innovación técnica de este checkpoint es la cuantización selectiva: solo los expertos enrutados se comprimen a una media de 2,10 bits, mientras que el resto de la red (atención, embeddings, capas densas, router) permanece en BF16. Los pesos se guardan ya desnormalizados en tensores BF16, lo que evita dependencias de kernels de cuantización y permite cargar el modelo con `transformers` o vLLM estándar. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF, DPO o fases de alineación adicionales. Tampoco se especifica el método exacto de cuantización (GPTQ, AWQ, cuantización por bloques propia u otro) ni el error de reconstrucción introducido.

## Capacidades

- Generación de texto conversacional, según el pipeline `text-generation` y el tag `conversational`.
- Procesamiento image-text-to-text, según el tag `image-text-to-text` del repositorio (capacidad multimodal heredada del modelo base, no verificada en esta variante).
- Razonamiento y generación de código: presumiblemente heredados del modelo base Qwen3.6, aunque no hay documentación específica en esta ficha.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas (idiomas no disponibles).
- Modo thinking explícito: no documentado.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere despliegue en infraestructura de Hugging Face Inference Endpoints.

## Casos de uso

- Investigación sobre cuantización de MoE: el checkpoint sirve para estudiar el impacto de comprimir solo los expertos enrutados a 2,10 bits manteniendo el resto en BF16, comparando perplejidad y calidad frente al modelo base completo.
- Despliegue en memoria reducida: al almacenar los expertos a baja precisión, el repositorio ocupa menos que una versión BF16 completa, lo que facilita alojar el modelo en nodos con VRAM limitada para pruebas internas.
- Evaluación de pipelines `transformers` y vLLM: al cargarse con herramientas estándar sin kernels especiales, es útil para validar que un stack de inferencia acepta checkpoints desnormalizados en BF16.
- Experimentos de multimodalidad image-text-to-text: si la capacidad multimodal se conserva tras la cuantización, puede emplearse en prototipos de descripción de imágenes o VQA en entornos de investigación.
- Generación de texto conversacional en laboratorio: para pruebas de calidad lingüística y de coherencia multi-turno antes de decidir si merece la pena usar el modelo base sin cuantizar.
- Referencia para comparativas de compresión: como punto de comparación frente a otras técnicas (GPTQ, AWQ, cuantización de 4 bits) en estudios sobre MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 134,7 GB en safetensors. Al cargarse desnormalizado en BF16, la VRAM necesaria en inferencia se aproxima al tamaño de los pesos en BF16 más el overhead de activaciones y caché KV; no se dispone de una cifra exacta.
- GPU recomendadas: para alojar el checkpoint completo en BF16 se requiere un nodo multi-GPU de clase A100/H100 (80 GB por GPU) o equivalente; no es viable en una sola GPU consumer.
- GPU consumer: no cabe en RTX 4090 (24 GB) ni en GPUs de 48 GB en configuración completa; sería necesario sharding multi-GPU o una cuantización adicional en tiempo de carga.
- Opciones de despliegue: `transformers` y vLLM estándar, según el autor; el tag `endpoints_compatible` apunta a Hugging Face Inference Endpoints. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p10bit-r114 | 67,3B en safetensors (35B nominales, 3B activos) | no disponible | no disponible (sigue la del base) | Hugging Face, 0 descargas | Checkpoint de investigación, sin benchmarks |
| Qwen/Qwen3.6-35B-A3B (base) | 35B nominales, 3B activos | no disponible | la del modelo base | Hugging Face oficial | Referencia sin cuantizar; capacidades completas |
| Otras variantes cuantizadas del mismo base | variable | no disponible | depende del autor | Hugging Face | No identificadas en la información disponible |

## Limitaciones y advertencias

- Checkpoint de investigación interna: el autor no lo presenta como release estable ni documenta procesos de validación.
- Sin benchmarks ni métricas de calidad: no hay evidencia de la pérdida de precisión introducida por la cuantización a 2,10 bits en los expertos.
- Discrepancia de parámetros: el nombre indica 35B y safetensors declara 67,3B; conviene verificar la configuración antes de desplegar.
- Licencia no declarada explícitamente: el autor remite a la licencia del modelo base, que debe consultarse en el repositorio oficial de Qwen antes de cualquier uso comercial.
- Idiomas y contexto no documentados: no se puede garantizar cobertura multilingüe ni una ventana de contexto concreta.
- Riesgo de alucinación: inherente a los modelos generativos y potencialmente agravado por la cuantización agresiva; sin evaluación disponible.
- Sin datos de sesgos: no se documenta ninguna evaluación de sesgos.
- Madurez comunitaria nula: 0 descargas y 0 likes, sin issues ni discusión pública que permitan contrastar su comportamiento.
- Requisitos de hardware elevados: 134,7 GB de repositorio hacen inviable su uso en equipos de un solo usuario sin infraestructura multi-GPU.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p10bit-r114
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
