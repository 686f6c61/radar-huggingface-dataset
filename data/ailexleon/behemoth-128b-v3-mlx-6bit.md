# ailexleon/Behemoth-128B-v3-mlx-6Bit

## Resumen

Behemoth-128B-v3-mlx-6Bit es una conversión al formato MLX del modelo TheDrummer/Behemoth-128B-v3, realizada por ailexleon con la librería mlx-lm 0.31.3. El modelo original está orientado a tareas de creación y narrativa: roleplay, escritura creativa, storytelling y conversación con personajes, según los tags de su ficha. La conversión en cuantización de 6 bits reduce el peso de los archivos y permite su ejecución en hardware Apple Silicon mediante el ecosistema MLX, aunque los pesos reales en safetensors indican 27 351 134 208 parámetros, lo que sugiere que el nombre "128B" puede referirse a una versión no cuantizada o a una nomenclatura comercial del modelo base. La ficha original no detalla la arquitectura interna ni el proceso de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27 351 134 208 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6-bit (MLX) |
| Idiomas soportados | inglés |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La información proporcionada no incluye detalles sobre la arquitectura interna del modelo (tipo de transformer, uso de mezcla de expertos, atención lineal, etc.) ni sobre los datos de entrenamiento (volumen de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). El repositorio únicamente indica que es una conversión a formato MLX del modelo TheDrummer/Behemoth-128B-v3, realizada con mlx-lm en su versión 0.31.0. No se dispone de datos técnicos adicionales sobre el modelo original.

## Capacidades

- Generación de texto en inglés para tareas de narración y conversación.
- Soporte de roleplay y creación de personajes, según los tags de la ficha.
- Escritura creativa y storytelling, con orientación a textos largos y diálogos.
- Conversación multi-turno (character-rp) y generación de respuestas contextualizadas.
- No se especifican capacidades de tool calling, razonamiento matemático o visión en la información disponible.

## Casos de uso

- Creación de historias interactivas: el modelo puede generar narrativas ramificadas en juegos de rol o novelas visuales, manteniendo coherencia con los personajes y el contexto.
- Chatbots de personajes para entretenimiento: permite construir asistentes conversacionales con personalidad definida, útiles en plataformas de simulación social o juegos de texto.
- Escritura de guiones y diálogos: adecuado para generar borradores de guiones de cine, teatro o videojuegos, con estilos narrativos variados.
- Generación de contenido creativo para blogs o redes sociales: el modelo puede producir relatos cortos, descripciones de escenas o diálogos con tono literario.
- Asistencia en juegos de rol en línea: puede actuar como máster de mazmorras automatizado, describiendo escenarios y reaccionando a las acciones de los jugadores.
- Prototipado de sistemas de conversación con memoria de personaje: gracias a su orientación a roleplay, puede mantener una voz consistente en sesiones largas, aunque la ventana de contexto no está documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 101.6 GB en disco, por lo que se requiere espacio de almacenamiento significativo.
- La cuantización de 6 bits reduce el tamaño respecto a una versión fp16, pero sigue siendo un modelo grande; no se especifica la VRAM necesaria en la ficha.
- Está diseñado para ejecutarse con MLX en Apple Silicon (M-series), usando la librería `mlx-lm`.
- No se indican requisitos de GPU para otras plataformas; la conversión es específica de MLX, por lo que su uso en CUDA requeriría una conversión adicional.
- Opciones de despliegue: exclusivamente MLX mediante `mlx-lm` (carga y generación con Python). No se mencionan integraciones con vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables de la misma categoría (roleplay y escritura creativa) en el contexto de esta ficha, ni datos de rendimiento del modelo original.

## Limitaciones y advertencias

- La licencia del modelo no está especificada, por lo que no se garantiza su uso comercial; se recomienda contactar con el autor original (TheDrummer) para aclarar los términos.
- El modelo solo soporta inglés, lo que limita su uso en otros idiomas.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones de contexto; se debe evaluar en entornos controlados antes de usar en producción.
- El nombre "128B" puede inducir a error: los pesos reales son de 27 351 millones de parámetros, por lo que las expectativas de capacidad deben ajustarse a este tamaño real.
- El formato MLX restringe el despliegue a hardware Apple Silicon; para otros entornos (NVIDIA, AMD) se necesitaría convertir el modelo a otros formatos (GGUF, safetensors FP16), lo que puede requerir recursos adicionales.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/ailexleon/Behemoth-128B-v3-mlx-6Bit
- Modelo base (TheDrummer/Behemoth-128B-v3): https://huggingface.co/TheDrummer/Behemoth-128B-v3
- Librería mlx-lm (no se ha encontrado enlace oficial en los resultados de búsqueda, se referencia la documentación de MLX de Apple)
