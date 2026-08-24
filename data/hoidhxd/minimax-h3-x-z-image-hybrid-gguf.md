# hoidhxd/MiniMax-H3-x-Z-Image-hybrid-GGUF

## Resumen

MiniMax-H3-x-Z-Image-hybrid-GGUF es una conversión al formato GGUF de un modelo híbrido experimental creado por la comunidad, que combina las arquitecturas FL2VA y REF2VA en un único sistema. El modelo original, desarrollado por hoidhxd, fusiona bloques de dos ramas: los bloques B00-B24 y B50+ provienen de FL2VA, mientras que los bloques B25-B49 provienen de REF2VA. Esta construcción se realizó mediante reemplazo de tensores a nivel de byte, verificada con 532 tensores coincidentes.

El modelo está diseñado para tareas de generación de vídeo a partir de imágenes (image-to-video), aprovechando las capacidades del sistema MiniMax-H3 original, que soporta comprensión omni-modal (texto, imagen, vídeo y audio) y generación de vídeo con audio estéreo nativo hasta 2K y 15 segundos. La versión GGUF permite su ejecución en entornos como ComfyUI-GGUF, facilitando el despliegue con menor huella de memoria. Es importante destacar que se trata de una creación comunitaria no oficial, no un lanzamiento de MiniMax.

Con aproximadamente 20.100 millones de parámetros, este modelo híbrido se posiciona como una opción para investigadores y desarrolladores que deseen experimentar con arquitecturas combinadas en flujos de trabajo basados en GGUF. La licencia Apache-2.0 permite uso comercial, aunque al ser experimental, se recomienda validar su comportamiento antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida FL2VA/REF2VA (bloques B00-B24 FL2VA, B25-B49 REF2VA, B50+ FL2VA) |
| Parámetros totales | 20.111.438.744 (~20,1 mil millones) |
| Parámetros activos | No disponible (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16 (GGUF); se planean Q4_0, Q5_0, Q8_0 (según README) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (BF16) |

## Arquitectura y entrenamiento

La arquitectura de este modelo es una construcción híbrida que combina dos ramas: FL2VA (probablemente un modelo de generación de vídeo) y REF2VA (otro modelo de referencia). La disposición de bloques es B00-B24 de FL2VA, B25-B49 de REF2VA y B50+ de FL2VA, creando un sistema intercalado. La conversión a GGUF se realizó a partir de un archivo safetensors BF16 utilizando las herramientas de `molbal/ComfyUI-GGUF`. No se realizó ninguna conversión numérica adicional; la construcción híbrida se efectuó mediante reemplazo de tensores a nivel de byte, verificada con coincidencias de forma, dtype y hashes de payload.

No se dispone de información sobre el entrenamiento del modelo original, como el número de tokens, la composición del dataset o el uso de técnicas de alineación (RLHF/DPO). El modelo base MiniMax-H3, desarrollado por MiniMax, es un sistema omni-modal que soporta comprensión de texto, imagen, vídeo y audio, y genera vídeo con audio estéreo nativo. Sin embargo, este híbrido es una modificación comunitaria y no se han publicado detalles sobre su proceso de entrenamiento o ajuste.

## Capacidades

- Generación de vídeo a partir de imágenes (image-to-video), permitiendo animar fotografías o ilustraciones.
- Soporte omni-modal heredado del modelo base MiniMax-H3: comprensión de texto, imagen, vídeo y audio.
- Generación de vídeo con audio estéreo nativo, con resoluciones de hasta 2K y duraciones de hasta 15 segundos (según especificaciones del MiniMax-H3 original).
- Integración con ComfyUI-GGUF, lo que permite su uso en flujos de trabajo visuales basados en nodos.
- Formato GGUF compatible con múltiples motores de inferencia (llama.cpp, Ollama, etc.), facilitando el despliegue en CPU o GPU con menor consumo de memoria.
- Capacidad de experimentación con arquitecturas híbridas FL2VA/REF2VA, útil para investigación en generación de vídeo.

## Casos de uso

- Animación de imágenes fijas para contenido creativo: el modelo puede convertir fotografías o ilustraciones en clips de vídeo cortos, útil para artistas y diseñadores que buscan dar vida a sus obras.
- Generación de clips promocionales para marketing: a partir de una imagen de producto, se puede crear un vídeo breve con movimiento, adecuado para campañas en redes sociales o anuncios.
- Prototipado rápido en flujos de trabajo de ComfyUI: al ser un modelo GGUF, se integra directamente en pipelines de nodos, permitiendo iterar rápidamente sobre parámetros de generación.
- Investigación en modelos híbridos de generación de vídeo: la combinación de FL2VA y REF2VA ofrece un caso de estudio para evaluar el impacto de fusionar arquitecturas en la calidad del vídeo generado.
- Creación de contenido educativo: generar vídeos explicativos a partir de diagramas o imágenes estáticas, facilitando la producción de material didáctico.
- Experimentación con generación de vídeo con audio: si se conservan las capacidades del modelo base, se pueden producir clips con sonido sincronizado, útil para prototipos de entretenimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con ~20.100 millones de parámetros en BF16, se estima un consumo de aproximadamente 40 GB de VRAM (2 bytes por parámetro). Con cuantización Q4_0 (si se añade), podría reducirse a ~10 GB, pero no está confirmado.
- GPU recomendadas: no disponible. Para BF16 se necesitaría una GPU con al menos 40 GB (por ejemplo, A100 80GB o H100). Con cuantizaciones adicionales, podría ejecutarse en GPUs de consumo como RTX 4090 (24 GB) o inferiores.
- Si cabe en GPU de consumo: con la cuantización Q4_0 planeada, podría caber en GPUs de 12-16 GB, pero no se ha verificado.
- Opciones de despliegue: ComfyUI-GGUF (recomendado), llama.cpp, Ollama u otros motores compatibles con GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos similares. El modelo base MiniMax-H3 es el referente más cercano, pero este híbrido es una modificación experimental sin datos de rendimiento publicados. Se recomienda consultar el repositorio nativo para comparaciones con el modelo original.

## Limitaciones y advertencias

- Modelo experimental creado por la comunidad, no es un lanzamiento oficial de MiniMax. Su comportamiento puede ser impredecible.
- La construcción híbrida mediante reemplazo de tensores puede introducir inconsistencias internas, aunque se verificó la integridad de los tensores.
- Solo se proporciona el archivo GGUF en BF16; las cuantizaciones adicionales (Q4_0, Q5_0, Q8_0) están planeadas pero no disponibles actualmente.
- No se ha publicado información sobre sesgos, alucinaciones o limitaciones de contexto. Se recomienda validar el modelo en casos de uso específicos antes de producción.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base MiniMax-H3 puede tener términos adicionales; se debe revisar la documentación oficial.
- La compatibilidad con ComfyUI-GGUF requiere que la versión instalada soporte la arquitectura MiniMax-H3; de lo contrario, el modelo no cargará correctamente.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/hoidhxd/MiniMax-H3-x-Z-Image-hybrid-GGUF
- Modelo base (safetensors): https://huggingface.co/hoidhxd/MiniMax-H3-x-Z-Image-hybrid
- Repositorio nativo del modelo: https://huggingface.co/joeygambino/MiniMax-H3-x-Z-Image-native
- ComfyUI-GGUF (herramienta de conversión y ejecución): https://github.com/molbal/ComfyUI-GGUF
- MiniMax-H3 oficial (GitHub): https://github.com/MiniMax-AI/MiniMax-H3
- MiniMax-H3 oficial (HuggingFace): https://huggingface.co/MiniMaxAI/MiniMax-H3
