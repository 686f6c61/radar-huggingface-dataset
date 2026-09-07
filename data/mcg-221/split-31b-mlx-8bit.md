# McG-221/Split-31B-mlx-8Bit

## Resumen

El modelo McG-221/Split-31B-mlx-8Bit es una conversión al formato MLX de un modelo merge denominado Nimbz/Split-31B, desarrollado por McG-221. Se trata de un modelo de 31.000 millones de parámetros (30.697.345.280) orientado a tareas de roleplay, escritura creativa, storytelling y conversación, con una actitud de baja negativa (low-refusal) y contenido NSFW según las etiquetas publicadas. La conversión se realizó con mlx-lm 0.31.2 y los pesos se distribuyen cuantizados a 8 bits en formato safetensors, optimizados para ejecución en Apple Silicon.

El modelo parte de una familia Gemma-4 (etiqueta gemma-4) y fue creado mediante mergekit, lo que indica que combina varios modelos preexistentes para obtener un comportamiento específico en generación de personajes y texto creativo. Actualmente es un modelo de nicho, con solo 5 descargas, y no dispone de documentación técnica completa más allá de la model card. A pesar de ello, puede resultar útil para desarrolladores que busquen un modelo conversacional con baja censura para aplicaciones locales en ecosistemas macOS.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Gemma-4 (detalle no disponible) |
| Parametros totales | 30.697.345.280 (30.7B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 8-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se ha proporcionado información detallada sobre la arquitectura interna ni el proceso de entrenamiento. Los metadatos indican que el modelo es un merge creado con mergekit, con relación base_model_relation: merge, y que el modelo sobre el que se realizó la conversión es Nimbz/Split-31B. Las etiquetas gemma4 y gemma-4 sugieren que la arquitectura base pertenece a la familia Gemma-4, aunque no se puede confirmar el número de capas, dimensiones ocultas ni el mecanismo de atención. La conversión a MLX se realizó con mlx-lm 0.31.2, y los pesos se almacenan en formato safetensors con cuantización de 8 bits. No hay datos sobre el dataset, el número de tokens de entrenamiento ni el uso de técnicas como RLHF, DPO o refinamiento por instrucciones.

## Capacidades

- Generación de texto conversacional para roleplay de personajes, según las etiquetas del modelo.
- Escritura creativa y storytelling, con un estilo orientado a narrativa de ficción.
- Conversación multi-turno con tono low-refusal, lo que implica una menor tendencia a rechazar peticiones sensibles.
- Tool calling y function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües no documentadas; no se especifican los idiomas soportados.
- El contenido NSFW y la baja negativa indican que puede generar contenido para adultos, aunque no se aportan evaluaciones de calidad ni seguridad.

## Casos de uso

1. Roleplay interactivo: el modelo puede generar respuestas coherentes en conversaciones con personajes ficticios, gracias a su entrenamiento específico en character-rp. Se usaría cargándolo en mlx-lm y definiendo el personaje en el prompt inicial.
2. Escritura creativa asistida: permite redactar relatos cortos, diálogos y escenas narrativas. Es aplicable en proyectos de ficción donde se necesita variabilidad estilística y poca censura.
3. Simulación de personajes para juegos de rol: al mantener un estilo conversacional y low-refusal, puede usarse como motor de NPCs en juegos narrativos, siempre que la plataforma permita contenido sin restricciones.
4. Prototipado de chatbots de entretenimiento: desarrolladores pueden integrarlo en aplicaciones locales de chat para recrear personalidades ficticias, aprovechando la cuantización 8-bit para reducir el uso de memoria en Apple Silicon.
5. Generación de contenido para redes sociales: crea publicaciones, descripciones y microcuentos con tono creativo, siempre que se respeten las políticas de contenido de cada plataforma.
6. Investigación sobre modelos merge de baja negativa: sirve como objeto de estudio para analizar cómo el mergekit combina modelos Gemma-4 para modificar la actitud del modelo, aunque no existe documentación formal al respecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el peso del modelo es de 32.6 GB en 8-bit, por lo que la memoria unificada necesaria para cargarlo es de aproximadamente 35-40 GB en una Mac con Apple Silicon, incluyendo KV cache y activaciones. Es una estimación basada en el tamaño del archivo, no un requisito oficial.
- GPU recomendadas: Apple Silicon con 48 GB de RAM unificada o superior (M2 Ultra, M3 Max, M4 Max).
- No es compatible con tarjetas GPU NVIDIA de consumo de forma nativa, ya que el formato es MLX y no se ha publicado una conversión GGUF.
- Opciones de despliegue: se puede ejecutar con la librería mlx-lm en sistemas macOS. No se dispone de soporte para vLLM, TGI, llama.cpp ni Ollama en el formato actual.
- Latencia y throughput: no se han publicado mediciones oficiales.

## Comparativa con modelos similares

No se dispone de datos suficientes para comparar este modelo con alternativas de la misma categoría. En la búsqueda se han identificado otros modelos del mismo autor, como McG-221/Gemma-4-Gembrain-X-Core-31B-mlx-8Bit y McG-221/Skyfall-31B-v4.2-mlx-8Bit, pero no se han encontrado especificaciones ni benchmarks publicados. Por ello, la comparativa formal se indica como no disponible.

## Limitaciones y advertencias

- No se ha documentado el sesgo ni la calidad de seguridad del modelo; es probable que presente alucinaciones, especialmente en contextos de roleplay o generación creativa.
- La longitud de contexto no está especificada, lo que impide conocer el número máximo de tokens que puede manejar.
- Los idiomas soportados no están declarados, por lo que el rendimiento fuera del inglés no puede garantizarse.
- El modelo es un merge no oficial y no ha sido evaluado en benchmarks públicos, por lo que su fiabilidad en entornos críticos es baja.
- La licencia Apache 2.0 permite uso comercial, pero el contenido NSFW y low-refusal puede vulnerar las políticas de contenido de algunas plataformas de despliegue.
- La cuantización de 8 bits reduce la precisión respecto al modelo original, lo que puede degradar la calidad de las respuestas en tareas muy específicas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/McG-221/Split-31B-mlx-8Bit
- Modelo base referenciado: https://huggingface.co/Nimbz/Split-31B
- Repositorio de un modelo similar del autor (no es este modelo): https://github.com/Damacol/mcg-221-skyfall-31b-v4.2-mlx-8bit
