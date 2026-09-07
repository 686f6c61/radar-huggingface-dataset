# imranevankhan/FLUX.2-klein-4b-nvfp4

## Resumen
El modelo FLUX.2 [klein] 4B es un modelo de generación de imágenes de 4.000 millones de parámetros desarrollado por Black Forest Labs, presentado en este repositorio en una versión cuantizada NVFP4. Se trata de un transformer de flujo rectificado que unifica generación de imágenes a partir de texto y edición de imágenes con múltiples referencias en una única arquitectura compacta. Su relevancia radica en que ofrece inferencia de extremo a extremo en menos de un segundo y requiere solo unos 13 GB de VRAM, lo que lo hace accesible para hardware de consumo como las RTX 3090 o 4070. Este repositorio contiene los pesos en formato NVFP4 con un tamaño de 2.5 GB, optimizados para reducir el uso de memoria, mientras que el modelo original en BF16 está disponible en el repositorio principal de Black Forest Labs.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de flujo rectificado (diffusion transformer) |
| Parametros totales | 4 mil millones (4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de generación de imágenes) |
| Tipos de cuantizacion | NVFP4 (este repo); BF16 (repo principal) |
| Idiomas soportados | Inglés (prompts) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (diffusion-single-file) |

## Arquitectura y entrenamiento
El modelo se basa en una arquitectura de transformer de flujo rectificado, un tipo de modelo de difusión que aprende una trayectoria recta entre el ruido y la imagen, lo que permite reducir el número de pasos de inferencia y acelerar la generación. FLUX.2 [klein] 4B unifica generación y edición en un solo modelo, de modo que puede crear imágenes desde cero a partir de descripciones textuales y también editarlas utilizando una o más imágenes de referencia. Según la documentación de Black Forest Labs, el modelo está diseñado para aplicaciones que requieren generación en tiempo real sin sacrificar calidad, con inferencia completa en menos de un segundo. No se dispone de información detallada sobre el dataset de entrenamiento ni sobre el número de tokens o pasos de entrenamiento en los datos proporcionados. La model card indica que se aplicaron filtrados de contenido NSFW y CSAM en el preentrenamiento, así como varias rondas de fine-tuning posterior para mitigar la generación de contenido abusivo.

## Capacidades
- Generación de imágenes a partir de descripciones textuales (text-to-image).
- Edición de imágenes con soporte de múltiples referencias (multi-reference editing), lo que permite combinar y transformar imágenes de entrada.
- Unificación de generación y edición en una única arquitectura compacta.
- Inferencia rápida, con tiempos de generación inferiores a un segundo en hardware adecuado.
- Ejecución en hardware de consumo con alrededor de 13 GB de VRAM.
- Soporte de texto en las imágenes generadas, aunque el texto renderizado puede ser impreciso o distorsionado según se advierte en la model card.
- No es un modelo de lenguaje: no dispone de capacidades de tool calling, agentes o razonamiento multi-paso basado en texto.

## Casos de uso
- Generación de imágenes en tiempo real para aplicaciones interactivas: el modelo puede producir imágenes en menos de un segundo, lo que lo hace adecuado para herramientas de diseño asistido por IA o editores de imágenes donde el usuario espera una respuesta inmediata.
- Edición de fotos con referencias múltiples: un usuario puede subir varias imágenes (por ejemplo, un rostro y un fondo) y el modelo las combina en una sola composición coherente, útil para fotografía creativa o retoque profesional.
- Prototipado rápido de conceptos visuales: diseñadores de producto pueden generar variantes de un objeto o escena a partir de descripciones textuales, reduciendo el tiempo de bocetado inicial.
- Creación de contenido para redes sociales: generación de ilustraciones o fondos personalizados a partir de prompts en inglés, ideal para campañas de marketing que necesitan imágenes de forma rápida y económica.
- Generación de assets para videojuegos: el modelo puede crear texturas, escenarios o concept art de forma iterativa, aprovechando su capacidad de edición con referencias para ajustar los resultados.
- Automatización de flujos de trabajo de fotografía de producto: combinando imágenes de referencia del producto y descripciones del entorno, se pueden generar imágenes publicitarias sin necesidad de una sesión fotográfica completa.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el modelo ofrece calidad de última generación y una inferencia inferior a un segundo, pero no se proporcionan métricas concretas como FID, CLIP score o comparaciones numéricas con otros modelos.

## Requisitos de hardware
- VRAM estimada: alrededor de 13 GB para la versión NVFP4, según la model card.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4070 o superiores, según la documentación de Black Forest Labs.
- El modelo es accesible en tarjetas gráficas de consumo, no se limita a GPUs de centro de datos.
- Despliegue: el repositorio se publica en formato diffusion-single-file, lo que sugiere su uso con librerías compatibles como Diffusers de Hugging Face. No se especifican vLLM, llama.cpp ni otras opciones de inferencia.
- Latencia: la inferencia de extremo a extremo puede ser inferior a un segundo en el hardware recomendado, según el fabricante.

## Comparativa con modelos similares
Se dispone de información limitada para una comparativa completa. El modelo principal es black-forest-labs/FLUX.2-klein-4B con pesos BF16, y existe una variante FLUX.2 [klein] 9B bajo licencia no comercial. A continuación se presenta una tabla comparativa con los datos disponibles:

| Modelo | Parametros | Licencia | VRAM estimada |
|---|---|---|---|
| FLUX.2 [klein] 4B (NVFP4) | 4B | Apache 2.0 | ~13 GB |
| FLUX.2 [klein] 4B (BF16) | 4B | Apache 2.0 | No disponible |
| FLUX.2 [klein] 9B | 9B | No comercial | No disponible |

No se dispone de más comparativas con otros modelos de difusión en la información proporcionada.

## Limitaciones y advertencias
- El modelo no está diseñado para proporcionar información factual; las imágenes generadas pueden no reflejar la realidad.
- El texto renderizado dentro de las imágenes puede ser inexacto o sufrir distorsiones.
- Como modelo estadístico, puede amplificar sesgos presentes en sus datos de entrenamiento.
- El modelo puede fallar a la hora de generar imágenes que coincidan con el prompt, y el seguimiento del prompt depende en gran medida del estilo de prompting utilizado.
- La versión NVFP4 es una cuantización de baja precisión, lo que puede implicar una pérdida de calidad respecto al modelo BF16 original.
- Se prohíbe el uso del modelo para fines ilegales, explotación o daño a menores, generación de contenido engañoso, datos personales dañinos, acoso, imágenes íntimas no consentidas, pornografía ilegal y decisiones automatizadas de alto riesgo.
- Aunque la licencia Apache 2.0 permite el uso comercial, se recomienda implementar filtros de seguridad en los despliegues, especialmente si se usa la variante 9B.

## Enlaces
- Repositorio HuggingFace de la versión NVFP4: https://huggingface.co/imranevankhan/FLUX.2-klein-4b-nvfp4
- Repositorio principal de Black Forest Labs: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Blog de Black Forest Labs sobre FLUX.2 [klein]: https://bfl.ai/blog/flux2-klein-towards-interactive-visual-intelligence
