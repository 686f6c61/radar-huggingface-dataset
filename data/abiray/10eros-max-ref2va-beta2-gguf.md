# Abiray/10Eros-Max-ref2va-Beta2-GGUF

## Resumen

El modelo 10Eros-Max-ref2va-Beta2-GGUF es una cuantización en formato GGUF del modelo de generación de vídeo TenStrip/10Eros-Max, publicado por Abiray. Su objetivo principal es permitir la ejecución local de un modelo de difusión de vídeo de gran tamaño (más de 40 GB en BF16) en GPUs de consumo, mediante el uso de cuantizaciones que reducen el peso a entre 8,9 y 21,6 GB. Está diseñado para integrarse en ComfyUI a través del nodo `ComfyUI-GGUF`, lo que facilita su uso en flujos de trabajo de generación de vídeo.

El modelo base, desarrollado por TenStrip, emplea la arquitectura MiniMax-H3 y una técnica de «injerto» (grafting) de pesos procedentes de otros modelos de vídeo (LTX 2.3, Wan 2.2 y Krea 2) en las capas de atención, con el objetivo de mejorar la calidad visual y de audio sin alterar las capacidades fundamentales del H3. La versión cuantizada mantiene estas características, aunque con una pérdida de fidelidad proporcional al nivel de compresión elegido.

La relevancia actual radica en que democratiza la generación de vídeo de alta calidad en equipos de usuario final, reduciendo la barrera de hardware y permitiendo a creadores e investigadores experimentar con modelos de difusión de vídeo sin recurrir a infraestructura cloud especializada. La licencia es la de la comunidad MiniMax-H3, con restricciones adicionales derivadas de los modelos fuente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MiniMax-H3 (modelo de difusión para vídeo, con injerto de pesos de LTX, Wan y Krea) |
| Parámetros totales | 20.111.438.744 |
| Parámetros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF: Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K, Q8_0 |
| Idiomas soportados | no disponible (no se especifica) |
| Licencia | minimax-h3-community-license-agreement (con restricciones de LTX, Wan y Krea) |
| Formato de pesos | GGUF (el modelo original usa safetensors) |

## Arquitectura y entrenamiento

El modelo base es `10Eros_Max_h3_ref2va_beta2_pruned`, una variante de MiniMax-H3 que incorpora un proceso de «injerto» de pesos. TenStrip, el autor del modelo original, describe esta técnica como la combinación de pesos de modelos de vídeo previos (LTX 2.3, Wan 2.2 y Krea 2) en las capas de atención del H3, a un nivel que no interfiere con la salida visual y de audio del H3. El objetivo era compensar las dificultades de entrenamiento del H3 (que el propio autor describe como «problemático») y obtener una mejora de calidad sin esperar a los ajustes futuros.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La cuantización GGUF es un proceso posterior, realizado por Abiray, que convierte los pesos del modelo en formatos de menor precisión para reducir el tamaño y los requisitos de memoria.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) y de imagen (image-to-video, image-text-to-video).
- Ejecución nativa en ComfyUI mediante el nodo `Unet Loader (GGUF)` del plugin `ComfyUI-GGUF`.
- Soporte de múltiples niveles de cuantización para adaptarse a distintos presupuestos de VRAM.
- El modelo original (no cuantizado) incluye capacidades de audio, aunque no se confirma que se conserven en las cuantizaciones GGUF.
- No se documentan capacidades de tool calling, razonamiento multi-paso ni otras funciones propias de modelos de lenguaje; su función es exclusivamente la generación de vídeo.

## Casos de uso

- Creación de contenido para redes sociales: el modelo puede generar clips de vídeo de corta duración a partir de una imagen de referencia o una descripción textual, lo que permite a creadores de contenido producir vídeos originales sin necesidad de rodajes.
- Previsualización de escenas en producción audiovisual: los realizadores pueden usar el modelo para generar bocetos de storyboard animado, evaluando iluminación, composición y movimiento antes de una producción real.
- Prototipado de conceptos para diseñadores y artistas: permite experimentar con distintas variaciones de una escena o personaje generando vídeo a partir de una imagen base, facilitando la iteración rápida.
- Integración en flujos de trabajo de ComfyUI: los usuarios pueden combinar este modelo con otros nodos de ComfyUI (upscaling, edición, composición) para crear pipelines de generación de vídeo personalizados.
- Investigación en generación de vídeo: sirve como base para estudiar el comportamiento de los modelos de difusión de vídeo en cuantizaciones bajas, y para comparar la calidad de distintos niveles de compresión.
- Demostraciones y presentaciones: se puede usar para generar vídeos de ejemplo en entornos educativos o comerciales, siempre que se cumplan las restricciones de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada por cuantización:
  - Q3_K_M: <12 GB (por ejemplo, RTX 3060 12 GB).
  - Q4_K_M y Q4_K_S: 12–16 GB (por ejemplo, RTX 4070, RTX 3080).
  - Q5_K_M y Q5_K_S: 16–24 GB (por ejemplo, RTX 3090, RTX 4090).
  - Q6_K y Q8_0: 24 GB o más (por ejemplo, RTX A4090, A100).
- GPU recomendadas: cualquier tarjeta con al menos 12 GB de VRAM para la cuantización Q4_K_M, que es la recomendada por el autor.
- Opciones de despliegue: ComfyUI con el plugin `ComfyUI-GGUF` (nodo `Unet Loader (GGUF)`). No se mencionan otras herramientas de inferencia (vLLM, llama.cpp, Ollama) para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de comparación con otros modelos de generación de vídeo en la información proporcionada.

## Limitaciones y advertencias

- Las cuantizaciones más agresivas (Q3_K_M) pueden degradar detalles finos y la coherencia de la imagen.
- La licencia `minimax-h3-community-license-agreement` impone restricciones para uso comercial; además, se aplican licencias adicionales de LTX, Wan y Krea sobre las partes de los pesos que provienen de esos modelos.
- El modelo no ha sido evaluado en términos de sesgos o alucinaciones; como todo modelo generativo de vídeo, puede producir contenido no deseado o incoherente.
- No se confirma si las cuantizaciones GGUF conservan la generación de audio del modelo original.
- El autor del modelo original advierte de que el entrenamiento del H3 es problemático y que la versión se basa en ajustes de terceros, lo que puede implicar inconsistencias en ciertos casos.
- La ausencia de información sobre el idioma de la interfaz o los textos de entrada sugiere que el modelo puede tener un rendimiento limitado en lenguajes distintos al inglés.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/Abiray/10Eros-Max-ref2va-Beta2-GGUF
- Repositorio HuggingFace del modelo base: https://huggingface.co/TenStrip/10Eros-Max
- Repositorio GitHub de MiniMax-H2: https://github.com/MiniMax-AI/MiniMax-H2
- Página de documentación del modelo GGUF (local-ai-zone): https://local-ai-zone.github.io/models/10eros-max.html
