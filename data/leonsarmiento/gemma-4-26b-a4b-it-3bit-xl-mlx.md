# leonsarmiento/gemma-4-26B-A4B-it-3bit-XL-mlx

## Resumen

El modelo `leonsarmiento/gemma-4-26B-A4B-it-3bit-XL-mlx` es una conversión a formato MLX del modelo multimodal `google/gemma-4-26B-A4B-it`, desarrollada por leonsarmiento. Se trata de un modelo de Mixture of Experts (MoE) de 25.8 mil millones de parámetros, con 128 expertos por capa y un promedio de 3.8 mil millones de parámetros activos por token, lo que lo hace eficiente en cómputo a pesar de su tamaño total.

La variante 3-bit XL aplica una cuantización mixta que mantiene en bf16 el router y el MLP compartido, preserva el encoder de visión en 8 bits y cuantiza a 3 bits los expertos enrutados. El resultado es un modelo multimodal de aproximadamente 13 GB que puede ejecutarse en Macs con RAM unificada limitada, sin necesidad de GPU dedicada.

Es relevante para desarrolladores que quieran probar un modelo grande con visión y razonamiento en dispositivos de consumo, gracias a su integración con `mlx-vlm`, y para investigadores interesados en el impacto de las cuantizaciones agresivas sobre arquitecturas MoE.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con encoder de visión |
| Parámetros totales | 25.782.252.592 (≈25.8B) |
| Parámetros activos | 3.8B por token (promedio) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BaseQuant_XL 3-bit mixto (bf16/8-bit/3-bit); variantes 2-bit y 6-bit disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con 128 expertos por capa, un router (`router.proj`) que decide enrutamiento, un MLP compartido que procesa todos los tokens y una capa de atención estándar. El encoder de visión está preservado, por lo que el modelo es multimodal (image-text-to-text). No se ha realizado ningún entrenamiento adicional en esta conversión; se trata de una cuantización post-entrenamiento aplicada sobre el modelo BF16 de Google.

La estrategia BaseQuant_XL asigna bf16 al router y al MLP compartido, 8 bits a embeddings y atención, y 3 bits a los expertos enrutados (`experts.switch_glu`). Este diseño reduce el espacio a ~13 GB y mantiene las decisiones de enrutamiento en alta precisión, lo que resulta crítico en modelos MoE. No se han proporcionado detalles sobre el preentrenamiento original ni sobre técnicas como RLHF o DPO, por lo que estos datos no están disponibles.

## Capacidades

- Procesamiento multimodal de imágenes y texto gracias al encoder de visión preservado.
- Eficiencia computacional al activar solo ~3.8B de parámetros por token en cada paso de generación.
- Modo de razonamiento (`thinking`) habilitado por defecto en el chat template, con marcadores de canal para mostrar la cadena de pensamiento.
- Conversación multi-turno mediante un chat template sincronizado con la versión canónica de Google.
- El template incluye marcadores asociados a tool calling (`prev_non_tool_role`, `format_argument`), aunque no se ha confirmado oficialmente el soporte de herramientas.
- Compatibilidad con `mlx-vlm` para generación de texto e imagen en Apple Silicon.

## Casos de uso

- Asistente multimodal privado en Mac: permite analizar imágenes y responder preguntas visuales en local sin enviar datos a la nube, gracias al encoder de visión y al tamaño reducido.
- Desarrollo de aplicaciones de prototipado rápido: al ejecutarse con `mlx-vlm`, facilita probar flujos de conversación e imagen en entornos de desarrollo de Apple Silicon.
- Análisis de documentos con contenido visual: puede extraer información de capturas, gráficos o documentos escaneados cuando se integra en una aplicación de escritorio.
- Evaluación de estrategias de cuantización: sirve como referencia para comparar el impacto de cuantizar a 3 bits frente a las variantes de 2 y 6 bits del mismo autor.
- Investigación en razonamiento con thinking mode: permite estudiar la cadena de razonamiento interna del modelo en tareas de planificación, configurando el parser adecuado en LM Studio.
- Aplicaciones educativas de ciencia de datos: ofrece un modelo multimodal con MoE para experimentar en cursos sobre IA local, sin necesidad de grandes clusters.
- Entornos de pruebas para agentes conversacionales: dado su chat template, puede usarse para construir agentes de diálogo en los que se requiera un modelo con soporte para turnos largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Aunque el repositorio incluye la etiqueta `eval-results`, no se aportan datos concretos (MMLU, HumanEval, GSM8K, etc.) en la model card ni en los resultados de búsqueda web.

## Requisitos de hardware

- VRAM o RAM unificada estimada: los pesos ocupan ~13 GB, por lo que se requieren al menos 16 GB de RAM unificada en Apple Silicon para alojar pesos y activaciones.
- GPU recomendadas: no aplicable; el formato MLX requiere procesadores Apple Silicon (M1, M2, M3 o M4). No es compatible con tarjetas NVIDIA ni AMD.
- En GPU de consumo: no es compatible, al estar optimizado exclusivamente para MLX.
- Opciones de despliegue: `mlx-vlm` (generación en terminal), LM Studio, oMLX y scripts personalizados en Python mediante la librería MLX.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Bits por peso | Tamaño del repo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| google/gemma-4-26B-A4B-it (base) | 25.8B | bf16 | no disponible | no disponible | HuggingFace (Google) |
| leonsarmiento/gemma-4-26B-A4B-it-3bit-XL-mlx | 25.8B | 4.404 | 14.2 GB | no disponible | MLX |
| leonsarmiento/gemma-4-26B-A4B-it-2bit-XL-mlx | 25.8B | no disponible | no disponible | no disponible | MLX |
| leonsarmiento/gemma-4-26B-A4B-it-6bit-XL-mlx | 25.8B | no disponible | no disponible | no disponible | MLX |

La variante 3-bit es la intermedia en precisión entre la 2-bit y la 6-bit, todas sobre el mismo modelo base de Google. No hay benchmarks publicados para comparar el rendimiento entre ellas.

## Limitaciones y advertencias

- La cuantización a 3 bits en los expertos enrutados puede degradar la calidad en tareas complejas de razonamiento o generación extensa.
- No se han publicado benchmarks, por lo que no se puede validar el rendimiento frente a otros modelos.
- La licencia no aparece especificada en el repositorio; el modelo base de Google puede tener sus propias restricciones de uso.
- No se aportan datos sobre el preentrenamiento original, composición del dataset o sesgos, lo que limita la evaluación de riesgos.
- La longitud de contexto no está documentada, por lo que no se garantiza el comportamiento en conversaciones muy largas.
- Es necesario macOS con soporte MLX; no se puede desplegar en infraestructura GPU tradicional (NVIDIA/AMD).
- El modo de razonamiento requiere configurar correctamente el parser en LM Studio (cadenas de inicio y fin personalizadas) para que la traza se muestre adecuadamente.
- `tie_word_embeddings=True` implica que no existe una cabeza de salida separada; esto es propio de la arquitectura y no una limitación funcional, pero debe tenerse en cuenta al inspeccionar los pesos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/leonsarmiento/gemma-4-26B-A4B-it-3bit-XL-mlx
- Variante 2-bit: https://huggingface.co/leonsarmiento/gemma-4-26B-A4B-it-2bit-XL-mlx
- Variante 6-bit: https://huggingface.co/leonsarmiento/gemma-4-26B-A4B-it-6bit-XL-mlx
- Modelo base de Google: https://huggingface.co/google/gemma-4-26B-A4B-it
