# Abiray/LTX-2.5-Distilled-GGUF

## Resumen

El modelo LTX-2.5-Distilled-GGUF es una versión cuantizada en formato GGUF del transformer destilado del modelo LTX-2.5 de Lightricks, publicada por el usuario Abiray en Hugging Face. Está pensado para ejecución local en hardware con memoria limitada, permitiendo generar vídeo y audio de alta fidelidad a partir de texto, imagen o vídeo, manteniendo la calidad visual del modelo base. El repositorio ofrece siete niveles de cuantización (de Q3_K_S a Q8_0) que equilibran tamaño y fidelidad, con tamaños de archivo entre 12,6 GB y 23,6 GB. El modelo base, LTX-2.5, es un modelo de mundo abierto con arquitectura de difusión que soporta generación multishot nativa, sincronización de audio y vídeo, y un rendimiento optimizado para equipos locales. Esta versión destilada captura gran parte de las capacidades del modelo completo de 22B parámetros en un paquete más pequeño y rápido, lo que la hace relevante para creadores y desarrolladores que necesitan generar vídeo con IA sin depender de servicios en la nube.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) |
| Parametros totales | 22B (modelo base, según la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de generación de vídeo, no de texto) |
| Tipos de cuantizacion | Q3_K_S, Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en, de, es, fr, ja, ko, zh, it, pt |
| Licencia | ltx-2-community-license-agreement (otra) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión (DiT) destilado a partir del LTX-2.5 de Lightricks. La destilación reduce el número de parámetros y el coste computacional, manteniendo la fidelidad visual. El modelo base emplea "Diffusion Fidelity Rendering", que asigna dinámicamente el cómputo según la complejidad de la escena, y soporta generación multishot nativa, es decir, puede generar varias escenas conectadas en una sola pasada manteniendo identidad de personajes, entorno, iluminación y estilo. No se han proporcionado detalles sobre el dataset de entrenamiento ni el número de tokens. Los pesos GGUF se generaron a partir del transformer destilado, no del modelo completo, lo que explica su menor tamaño.

## Capacidades

- Generación de vídeo a partir de texto (T2V), imagen (I2V), vídeo (V2V) y audio (A2V).
- Generación de audio sincronizado con el vídeo mediante un VAE de audio dedicado.
- Multishot nativo: generación de escenas conectadas en una sola pasada, preservando personajes, entorno, iluminación, voz y estilo visual.
- Soporte multilingüe para prompts en 9 idiomas (en, de, es, fr, ja, ko, zh, it, pt).
- No es un modelo de lenguaje, por lo que no ofrece tool calling, razonamiento textual ni funciones de agente.
- Se integra con ComfyUI mediante workflows preconfigurados (T2V e I2V) y es compatible con motores de inferencia como llama.cpp.

## Casos de uso

- Creación de contenido para redes sociales: generar vídeos cortos a partir de prompts de texto o imágenes fijas, con audio sincronizado, para plataformas como Instagram o TikTok.
- Animación de retratos y fotografías: convertir imágenes estáticas en vídeos animados con movimiento natural, útil para estudios de fotografía o memoria digital.
- Prototipado de escenas para cine y animación: los creadores pueden generar storyboards animados o previsualizaciones rápidas de escenas multishot sin necesidad de rodaje.
- Generación de material educativo: producir vídeos explicativos animados a partir de texto, con voz y efectos de audio, para cursos en línea.
- Marketing y publicidad: crear anuncios personalizados con variaciones de escena y estilo, manteniendo la identidad de marca a través de la generación multishot.
- Desarrollo de videojuegos: generar cinemáticas o fondos animados para entornos de juego, usando la capacidad de vídeo a partir de imagen o texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización: Q3_K_S (12,6 GB) y Q3_K_M (12,9 GB) requieren al menos 12-16 GB; Q4_K_S (15,3 GB) y Q4_K_M (15,7 GB) requieren 16 GB o más; Q5_K_M (18,1 GB) y Q6_K (18,6 GB) requieren 20-24 GB; Q8_0 (23,6 GB) requiere 24 GB o más.
- Además del transformer, se necesitan los text encoders (Gemma 4 12B, 26,3 GB en BF16 o 15,4 GB en INT8) y los VAEs (vídeo y audio), lo que aumenta notablemente la VRAM total. En la práctica, se recomienda una GPU con al menos 24 GB de VRAM para Q4_K_M, y 32 GB o más para cuantizaciones altas.
- Es posible ejecutar en CPU con suficiente RAM, pero la generación de vídeo será mucho más lenta.
- Despliegue recomendado: ComfyUI con el nodo ComfyUI-GGUF, o llama.cpp para inferencia local.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se dispone de información suficiente para comparar con otros modelos de generación de vídeo. Existen otras versiones GGUF de LTX-2.5 (por ejemplo, de RebelAI o VantageAI), pero no se han encontrado datos comparativos en las fuentes consultadas.

## Limitaciones y advertencias

- La cuantización introduce pérdida de calidad, especialmente en Q3, que puede afectar la fidelidad visual y la coherencia del movimiento.
- Requiere componentes adicionales (text encoder, VAE) que no están incluidos en este repositorio, aumentando la complejidad de configuración.
- La licencia ltx-2-community-license-agreement puede tener restricciones de uso comercial; es necesario revisar los términos en el enlace proporcionado.
- No es un modelo de lenguaje, por lo que no sirve para tareas de generación de texto, razonamiento o código.
- La generación de vídeo es computacionalmente intensiva y puede requerir tiempos de espera largos incluso en GPUs de gama alta.
- El modelo base está optimizado para los idiomas listados, pero puede tener un rendimiento inferior en otros idiomas o dialectos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Abiray/LTX-2.5-Distilled-GGUF
- Modelo base de Lightricks: https://huggingface.co/Lightricks/LTX-2.5
- Licencia: https://github.com/Lightricks/LTX-2/blob/main/LICENSE.md
- Página oficial de LTX: https://ltx.io/model/ltx-2-5
- Workflow T2V: https://huggingface.co/Abiray/LTX-2.5-Distilled-GGUF/blob/main/video_ltx2_5_t2v_GGUF.json
- Workflow I2V: https://huggingface.co/Abiray/LTX-2.5-Distilled-GGUF/blob/main/video_ltx2_5_i2v_GGUF.json
