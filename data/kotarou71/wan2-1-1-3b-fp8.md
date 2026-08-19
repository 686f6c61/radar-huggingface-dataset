# kotarou71/Wan2.1-1.3B-FP8

## Resumen

Wan2.1-1.3B-FP8 es una versión cuantizada en FP8 del modelo Wan2.1-T2V-1.3B, un modelo de generación de vídeo a partir de texto desarrollado por Alibaba (Wan-AI) como parte de la suite Wan2.1 de código abierto. Esta adaptación específica ha sido creada por el usuario kotarou71 sobre el repackaging oficial de Comfy-Org, con el objetivo de reducir los requisitos de VRAM y permitir la ejecución en tarjetas gráficas de gama baja. La licencia Apache-2.0 facilita su uso comercial y su integración en flujos de trabajo de ComfyUI.

El modelo base original, Wan2.1-T2V-1.3B, emplea una arquitectura de difusión latente con aproximadamente 1.300 millones de parámetros, capaz de generar secuencias de vídeo de alta calidad a partir de descripciones textuales. La versión FP8 reduce el tamaño de los pesos a 8 bits, lo que disminuye la huella de memoria y acelera la inferencia en hardware limitado, manteniendo una calidad visual cercana a la del modelo original. Es relevante en el ecosistema actual porque democratiza la generación de vídeo con IA, un campo dominado tradicionalmente por modelos propietarios de gran tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión latente (no confirmado oficialmente) |
| Parámetros totales | 1.3B (modelo original) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (para vídeo, se refiere a número de frames) |
| Tipos de cuantización | FP8 (esta versión) |
| Idiomas soportados | No disponible (probablemente inglés y chino, sin confirmar) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (presumiblemente) |

## Arquitectura y entrenamiento

Wan2.1-T2V-1.3B pertenece a la familia de modelos de difusión para generación de vídeo. Utiliza un transformador que opera en un espacio latente, donde el ruido se elimina iterativamente para producir secuencias de vídeo coherentes condicionadas por texto. El modelo fue entrenado por Wan-AI con un gran conjunto de datos de vídeo y texto, aunque no se han publicado cifras exactas de tokens o composición del dataset. La versión FP8 es una cuantización post-entrenamiento que convierte los pesos de precisión completa (FP16/BF16) a punto flotante de 8 bits, reduciendo el uso de memoria sin necesidad de reentrenamiento. Esta técnica es común en despliegues eficientes, aunque puede introducir una ligera pérdida de fidelidad en los detalles finos.

## Capacidades

- Generación de vídeo a partir de texto: produce clips de varios segundos (típicamente 5-10 segundos) con resolución variable (p. ej., 480p o 720p) según la configuración.
- Edición de vídeo y transformación de imágenes: la suite Wan2.1 incluye variantes como VACE que permiten control adicional, aunque esta versión específica se centra en texto a vídeo.
- Multilingüismo: el modelo original soporta principalmente inglés y chino, pero esta versión no documenta explícitamente los idiomas.
- Integración con ComfyUI: al estar basado en el repackaging de Comfy-Org, es compatible con nodos y flujos de trabajo estándar de ComfyUI.
- No incluye capacidades de tool calling, agentes ni razonamiento multimodal más allá del vídeo.

## Casos de uso

- Prototipado rápido de animaciones: los diseñadores pueden generar clips de referencia a partir de guiones o storyboards, acelerando la previsualización de escenas antes de la producción final.
- Creación de contenido para redes sociales: generación de vídeos cortos para plataformas como TikTok o Instagram Reels, donde la velocidad y el bajo coste computacional son críticos.
- Material educativo y divulgativo: producción de vídeos explicativos sencillos a partir de texto, útil para cursos en línea o documentación técnica.
- Generación de fondos y escenas para videojuegos: los desarrolladores pueden crear texturas animadas o bucles de vídeo para entornos virtuales.
- Asistencia en postproducción: creación de tomas de relleno o transiciones para proyectos audiovisuales de bajo presupuesto.
- Experimentación artística: artistas digitales pueden explorar conceptos visuales generando múltiples variaciones a partir de prompts, gracias a la licencia abierta y la posibilidad de ejecutarlo en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas objetivas como FVD (Fréchet Video Distance), CLIP score o comparativas con otros modelos en la documentación consultada.

## Requisitos de hardware

- VRAM estimada: la cuantización FP8 reduce significativamente los requisitos respecto al modelo original. Con 1.3B parámetros en FP8, el peso ocupa aproximadamente 1.3 GB, aunque la inferencia requiere memoria adicional para activaciones y buffers. Se estima que puede ejecutarse en GPUs con 4-6 GB de VRAM, aunque no hay cifras oficiales.
- GPU recomendadas: tarjetas de gama media como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores. Para mayor velocidad, RTX 4090 o A100/H100 son adecuadas.
- Compatibilidad con consumer GPU: sí, esta es la principal ventaja de la versión FP8, diseñada para usuarios con VRAM limitada.
- Opciones de despliegue: ComfyUI (flujo principal), así como scripts de Python basados en la biblioteca de difusión de Wan-AI. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependen del hardware y de la configuración de frames y resolución.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Licencia | Uso de VRAM | Enfoque |
|---|---|---|---|---|---|
| Wan2.1-T2V-1.3B (original) | 1.3B | FP16/BF16 | Apache-2.0 | ~3-4 GB | Generación de vídeo texto a vídeo |
| Wan2.1-1.3B-FP8 (este) | 1.3B | FP8 | Apache-2.0 | ~1.3 GB (pesos) | Igual, optimizado para VRAM baja |
| AnimateDiff (varios tamaños) | ~1.4B | FP16 | Apache-2.0 | ~4 GB | Generación de vídeo a partir de imágenes |
| ModelScope T2V | ~1.7B | FP16 | Apache-2.0 | ~5 GB | Generación de vídeo texto a vídeo |

Nota: los valores de VRAM son aproximados y basados en el tamaño de pesos, no en la memoria total durante la inferencia.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado con datos de internet, puede reflejar sesgos culturales o de género en las escenas generadas.
- Riesgo de alucinación visual: puede generar objetos o movimientos inconsistentes con la física, especialmente en escenas complejas.
- Limitaciones de idioma: aunque probablemente soporta inglés y chino, no se ha verificado el rendimiento en otros idiomas.
- Resolución y duración: el modelo original está limitado a clips cortos (generalmente menos de 10 segundos) y resoluciones moderadas (máximo 720p).
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificación, pero no ofrece garantías sobre el contenido generado.
- Caveat de cuantización: la conversión FP8 puede degradar ligeramente la calidad visual en comparación con el modelo original, especialmente en texturas finas o movimiento rápido.
- Sin soporte para tool calling ni agentes: es un modelo generativo de vídeo, no un LLM conversacional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kotarou71/Wan2.1-1.3B-FP8
- Modelo original Wan2.1-T2V-1.3B: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Repositorio oficial de Wan2.1: https://github.com/Wan-Video/Wan2.1
- Variante VACE (control adicional): https://huggingface.co/Wan-AI/Wan2.1-VACE-1.3B
- Repackaging de Comfy-Org (base): https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged
- Página de Civitai con la versión FP8: https://civitai.com/models/1307708/wan21t2v13bfp8
