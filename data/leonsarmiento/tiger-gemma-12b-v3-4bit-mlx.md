# leonsarmiento/Tiger-Gemma-12B-v3-4bit-mlx

## Resumen

Tiger-Gemma-12B-v3-4bit-mlx es una cuantización uniforme de 4 bits en formato MLX del modelo TheDrummer/Tiger-Gemma-12B-v3, que a su vez es un fine-tune de Gemma-3-12B orientado a roleplay y escritura creativa. La cuantización ha sido realizada por leonsarmiento y está pensada para ejecutarse de forma eficiente en dispositivos Apple Silicon mediante el ecosistema MLX (mlx_vlm, LM Studio, oMLX). El modelo conserva la capacidad multimodal del modelo base, por lo que acepta entradas de imagen además de texto.

El fine-tune original de TheDrummer busca «desbloquear más capacidades y menos positividad», ofreciendo un tono más neutral en temas difíciles, mejor steerability hacia temas más duros y un estilo de prosa en párrafos con menos guiones largos. La cuantización 4-bit reduce el tamaño del modelo a 7.7 GB, manteniendo una ventana de contexto de 128K tokens. El modelo tiene 13.189.780.080 parámetros y se distribuye en dos shards safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma-3-12B) |
| Parametros totales | 13.189.780.080 (≈13.19 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | 4-bit uniforme (grupo 64, affine, incluye vision tower); variante 8-bit uniforme disponible |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | unknown (no especificada) |
| Formato de pesos | safetensors (MLX), 2 shards |

## Arquitectura y entrenamiento

El modelo parte de Gemma-3-12B, un transformer multimodal con encoder de visión. Sobre esta base, TheDrummer realizó un fine-tune orientado a roleplay y escritura creativa, ajustando el tono para que sea más neutral y menos positivo, mejorando la steerability en temas difíciles y reduciendo el uso de markdown y guiones largos en las respuestas. La cuantización a 4 bits se aplicó de forma uniforme con grupo de 64 y esquema affine, incluyendo el vision tower, lo que preserva la capacidad de procesamiento de imágenes. El autor de la cuantización reemplazó el generation_config del modelo base por el canónico de Google para evitar salidas degeneradas en mlx_vlm, manteniendo el comportamiento en transformers y vLLM sin cambios.

## Capacidades

- Generación de texto con estilo de prosa en párrafos, con menos markdown y menos guiones largos.
- Roleplay conversacional con tono más neutral, especialmente adecuado para temas duros o delicados.
- Mejor steerability para dirigir el tono y la dirección de las respuestas.
- Entrada de imágenes preservada: funciona como modelo multimodal en LM Studio y mlx_vlm.
- Plantilla de chat incluida en tokenizer_config.json y chat_template.jinja.
- Soporte de tool calling, function calling, agentes y razonamiento multi-paso: no especificado en la información proporcionada.
- Capacidades multilingües: no especificadas en la información proporcionada.

## Casos de uso

- Roleplay narrativo en local: el modelo está afinado para roleplay y mantiene un tono neutral, lo que permite crear personajes consistentes en conversaciones largas de hasta 128K tokens sin positividad forzada.
- Escritura creativa de ficción: produce prosa en párrafos y evita el exceso de markdown, ideal para redactar relatos, guiones o novelas en un entorno local.
- Asistente de contenido sensible: al tener un tono más neutral, resulta adecuado para abordar temas complejos o delicados en aplicaciones de apoyo emocional o periodismo, siempre con supervisión humana.
- Análisis de imágenes en local: conserva la capacidad multimodal de Gemma-3, por lo que puede describir o razonar sobre imágenes en aplicaciones de Apple Silicon.
- Chatbots de entretenimiento para dispositivos Apple: gracias a la cuantización MLX 4-bit de 7.7 GB, se puede ejecutar en un Mac con suficiente memoria unificada.
- Prototipado de aplicaciones multimodales: al integrarse con mlx_vlm, permite experimentar con modelos de visión y lenguaje en entornos de desarrollo locales.
- Generación de diálogos para videojuegos: la mejor steerability permite ajustar el tono y la dirección de las respuestas de los personajes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Estimación orientativa: 7.7 GB de pesos cuantizados más overhead de ejecución, por lo que se recomienda un dispositivo con al menos 12 GB de memoria unificada (Apple Silicon) para contexto largo.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4) con al menos 16 GB de memoria unificada. No hay soporte directo para GPU NVIDIA en formato MLX.
- ¿Cabe en consumer GPU? El formato MLX no es compatible con GPUs de NVIDIA; para esos entornos es necesario usar la variante GGUF del modelo base.
- Opciones de despliegue: LM Studio, oMLX, mlx_vlm. No es compatible con vLLM, TGI ni llama.cpp en formato MLX.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia | Formato |
|---|---|---|---|---|---|---|
| leonsarmiento/Tiger-Gemma-12B-v3-4bit-mlx | 13.19B | 128K | 4-bit uniforme | 7.7 GB | unknown | MLX (safetensors) |
| leonsarmiento/Tiger-Gemma-12B-v3-8bit-mlx | 13.19B | 128K | 8-bit uniforme | no disponible | unknown | MLX (safetensors) |
| TheDrummer/Tiger-Gemma-12B-v3 | 13.19B | 128K | sin cuantizar | no disponible | unknown | safetensors |
| TheDrummer/Tiger-Gemma-12B-v3-GGUF | 13.19B | 128K | varias (GGUF) | no disponible | unknown | GGUF |

## Limitaciones y advertencias

- Licencia unknown: no se especifica la licencia del modelo base ni de la cuantización, lo que supone un riesgo legal para su uso comercial.
- Sin benchmarks publicados: no hay datos de rendimiento que permitan comparar objetivamente este modelo con otros.
- Baja adopción: el repositorio tiene 0 descargas y 0 likes, lo que indica una validación comunitaria mínima.
- Dependencia de MLX: el formato de pesos está optimizado para Apple Silicon; para otros entornos es necesario usar las variantes GGUF o el modelo base.
- Posible degradación por cuantización: la cuantización uniforme 4-bit puede reducir ligeramente la calidad de salida frente al modelo sin cuantizar, aunque no se aportan mediciones.
- Comportamiento del sampler: se ha corregido el generation_config para evitar salidas degeneradas en mlx_vlm, pero puede haber diferencias sutiles con otras configuraciones.
- Sesgos no documentados: al ser un fine-tune orientado a roleplay y temas duros, no se han documentado sesgos específicos ni evaluaciones de seguridad.

## Enlaces

- https://huggingface.co/leonsarmiento/Tiger-Gemma-12B-v3-4bit-mlx
- https://huggingface.co/leonsarmiento/Tiger-Gemma-12B-v3-8bit-mlx
- https://huggingface.co/TheDrummer/Tiger-Gemma-12B-v3
- https://huggingface.co/TheDrummer/Tiger-Gemma-12B-v3-GGUF
