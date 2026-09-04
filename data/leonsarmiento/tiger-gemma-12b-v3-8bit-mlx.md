# leonsarmiento/Tiger-Gemma-12B-v3-8bit-mlx

## Resumen

Tiger-Gemma-12B-v3-8bit-mlx es una cuantización MLX de 8 bits del modelo TheDrummer/Tiger-Gemma-12B-v3, un fine-tune de Gemma-3-12B orientado a roleplay y escritura creativa. Desarrollado por leonsarmiento, este build reduce el peso del modelo a 14.2 GB manteniendo la capacidad multimodal (entrada de imágenes) del modelo original. El ajuste de TheDrummer busca un tono más neutral y menos positivo, especialmente en temas difíciles, con mejor control de estilo y prosa en párrafos en lugar de markdown.

Es relevante para usuarios de Apple Silicon que quieran ejecutar este modelo en LM Studio, oMLX o mlx_vlm, con un contexto de 128K y sin necesidad de hardware NVIDIA. La cuantización uniforme de 8 bits incluye la torre de visión y corrige el generation_config para evitar salidas degeneradas en mlx_vlm, manteniendo el comportamiento en transformers/vLLM sin cambios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma-3) |
| Parámetros totales | 13.189.780.080 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K |
| Tipos de cuantización | 8-bit uniforme (MLX), group size 64, affine |
| Idiomas soportados | no disponible |
| Licencia | unknown |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo está basado en Gemma-3-12B, un transformer multimodal denso con atención estándar. El fine-tune original fue realizado por TheDrummer, y la información disponible no incluye datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO. La cuantización MLX es uniforme de 8 bits con group size 64 y esquema affine, aplicada también a la torre de visión. Se reemplazó el generation_config del modelo original por el canónico de Google para evitar que mlx_vlm produzca salidas degeneradas.

## Capacidades

- Generación de texto con tono neutral y menos positividad, especialmente en temas duros u oscuros.
- Mejor steerability hacia temáticas difíciles en comparación con otros fine-tunes.
- Estilo de prosa en párrafos, con menos respuestas en markdown y menos em-dashes.
- Entrada de imágenes preservada (multimodal), funciona en LM Studio y mlx_vlm.
- Conversaciones multi-turno con contexto largo de 128K tokens.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Roleplay narrativo: el modelo sostiene personajes con tono neutral en temas oscuros, ideal para juegos de rol por texto en los que se requiere un tono más sobrio y menos edulcorado.
- Escritura de ficción: genera borradores de novelas o relatos con prosa en párrafos y menos markdown, facilitando la edición posterior en herramientas de texto.
- Asistente de reescritura: reescribe textos existentes para eliminar em-dashes y convertir la salida en párrafos, alineada con el estilo del modelo.
- Descripción de imágenes en contextos narrativos: al conservar la visión, puede generar descripciones de escenas a partir de imágenes, útil para guiones o ilustraciones.
- Chat multimodal en LM Studio: interacción mixta texto-imagen en local, sin conexión a la nube y con control de tono.
- Prototipado de personajes: crea perfiles, diálogos y arcos de personajes con un tono más neutro y menos sesgo positivo, útil para diseñadores de juegos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Peso del modelo: 14.2 GB en 8 bits, con 3 shards.
- No aplica VRAM en el sentido convencional: MLX usa memoria unificada en Apple Silicon. Se estiman entre 14 y 16 GB de RAM unificada para cargar el modelo en 8 bits.
- GPU recomendada: Apple Silicon (M1 o posterior) con al menos 16 GB de RAM; se recomiendan 24 GB o más para contexto largo y uso simultáneo.
- No está optimizado para GPUs NVIDIA/AMD; para esos entornos se puede usar la variante GGUF del modelo original.
- Opciones de despliegue: mlx_vlm (Python), LM Studio, oMLX.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Tiger-Gemma-12B-v3-8bit-mlx | 13.189.780.080 | 128K | unknown | MLX safetensors |
| Tiger-Gemma-12B-v3 (original) | 13.189.780.080 | 128K | unknown | PyTorch safetensors |
| Tiger-Gemma-12B-v3-4bit-mlx | 13.189.780.080 | 128K | unknown | MLX safetensors |
| Gemma-3-12B (base) | no disponible | 128K | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia unknown: no se garantiza el uso comercial; es necesario revisar la licencia del modelo original y de los pesos antes de cualquier despliegue en producción.
- No se han publicado benchmarks, por lo que el rendimiento en tareas estándar no está verificado.
- La cuantización de 8 bits puede introducir una ligera pérdida de calidad en comparación con el modelo original sin cuantizar.
- Modelo diseñado para Apple Silicon (MLX); no es directamente ejecutable en GPUs NVIDIA o AMD sin convertir los pesos.
- El tono menos positivo y el roleplay pueden generar contenido sensible o inapropiado según el uso; se recomienda supervisión humana.
- El generation_config corregido puede alterar el comportamiento de muestreo en algunos runtimes; ajustar temperatura, min_p y top_p según la guía del README.

## Enlaces

- Modelo: https://huggingface.co/leonsarmiento/Tiger-Gemma-12B-v3-8bit-mlx
- Modelo original: https://huggingface.co/TheDrummer/Tiger-Gemma-12B-v3
- Variante 4-bit MLX: https://huggingface.co/leonsarmiento/Tiger-Gemma-12B-v3-4bit-mlx
- Variante GGUF: https://huggingface.co/TheDrummer/Tiger-Gemma-12B-v3-GGUF
