# HiDream-ai/HiDream-O1-Image

## Resumen

HiDream-O1-Image es un modelo fundacional de generación de imágenes desarrollado por HiDream-ai, presentado en mayo de 2026 como un sistema unificado que opera directamente sobre píxeles en bruto. A diferencia de la mayoría de los generadores de imágenes actuales, no depende de un VAE externo ni de codificadores de texto separados: emplea un Transformer Unificado a Nivel de Píxel (UiT) que codifica píxeles, texto y condiciones específicas de tarea en un único espacio de tokens compartido. Esto le permite abordar text-to-image, edición por instrucciones, personalización basada en sujetos y generación de storyboards con una sola arquitectura.

El modelo cuenta con 8,8 mil millones de parámetros y es capaz de sintetizar imágenes nativas de hasta 2048×2048 píxeles. Incluye un agente de prompt con razonamiento integrado que resuelve conocimiento implícito, disposición espacial y renderizado de texto antes de la generación. Según los tags de HuggingFace, la arquitectura se apoya en la familia Qwen3-VL. El repositorio principal ofrece dos variantes: el modelo completo (50 pasos de inferencia) y la versión destilada Dev (28 pasos), además de un refinador de prompts separado. La licencia MIT permite uso comercial sin restricciones, y el modelo se posiciona como una alternativa open-source competitiva frente a sistemas propietarios de gran tamaño.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Unificado a Nivel de Píxel (UiT), basado en Qwen3-VL según tags de HuggingFace |
| Parametros totales | 8.804.887.792 (8,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (soporta generacion de imagenes hasta 2048×2048 píxeles) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

HiDream-O1-Image introduce una arquitectura de Transformer unificado a nivel de píxel (UiT) que elimina los componentes modulares típicos de los modelos de difusión. En lugar de un VAE latente y un codificador de texto independiente, el modelo tokeniza directamente los píxeles en bruto junto con el texto y las condiciones de tarea en un espacio de tokens compartido. Esto permite que una única red procese múltiples tareas de generación y edición sin adaptadores específicos. El tag `qwen3_vl` en HuggingFace sugiere que la base arquitectónica proviene de la familia Qwen3-VL, aunque la model card no detalla la composición exacta del backbone.

El modelo incorpora un agente de prompt con razonamiento (Reasoning-Driven Prompt Agent) que actúa como una fase de "pensamiento" previa a la generación: resuelve conocimiento implícito, organiza la disposición espacial y planifica el renderizado de texto largo antes de que el generador produzca la imagen. La variante Dev es una versión destilada que reduce los pasos de inferencia de 50 a 28 sin pérdida significativa de calidad, según los autores. Los detalles sobre el dataset de entrenamiento, el número de tokens y el proceso de alineación (RLHF, DPO, etc.) no se han publicado en la información disponible; el informe técnico está disponible en arXiv (2605.11061) pero su contenido no se ha extraído aquí.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con resolución nativa de hasta 2048×2048 píxeles y detalle fino.
- Edición de imágenes por instrucciones en lenguaje natural, con soporte de condiciones de layout y skeleton en el pipeline IP (según actualizaciones de mayo de 2026).
- Personalización basada en sujetos: preserva la identidad de un objeto o personaje (IP) a través de nuevas escenas.
- Renderizado de texto largo y multilingüe: genera texto preciso en múltiples regiones dentro de la imagen, con control de layout.
- Generación de storyboards: crea secuencias narrativas coherentes a partir de descripciones.
- Agente de prompt con razonamiento integrado que mejora la alineación entre la instrucción y la imagen generada.
- Soporte de múltiples tareas en una sola arquitectura sin necesidad de modelos auxiliares externos (salvo el prompt agent opcional).

## Casos de uso

- Generación de imágenes para marketing y publicidad: el modelo puede producir material visual de alta resolución (hasta 2048×2048) a partir de briefs de texto, incluyendo texto renderizado dentro de la imagen para carteles, banners y anuncios, gracias a su capacidad de renderizado de texto largo y control de layout.
- Edición de imágenes en flujos de diseño: un diseñador puede cargar una imagen existente y solicitar cambios mediante instrucciones en lenguaje natural ("cambia el fondo a un atardecer", "añade un objeto en la esquina"), lo que acelera iteraciones en campañas visuales sin necesidad de herramientas de edición complejas.
- Personalización de productos para comercio electrónico: la capacidad de preservar la identidad de un sujeto permite generar variaciones de un producto (misma botella, diferentes fondos o escenas) manteniendo la coherencia visual, ideal para catálogos y pruebas A/B.
- Creación de storyboards para producción audiovisual: guionistas y directores pueden convertir descripciones de escenas en secuencias de imágenes coherentes, facilitando la previsualización de planos y la comunicación con equipos de producción.
- Prototipado rápido para diseño de interfaces y experiencia de usuario: el modelo puede generar mockups visuales de páginas web o aplicaciones a partir de descripciones textuales, incluyendo texto legible en la interfaz, lo que permite validar conceptos sin desarrollo front-end.
- Generación de contenido multilingüe para localización: la capacidad de renderizar texto en múltiples idiomas dentro de la imagen permite crear materiales visuales localizados (por ejemplo, menús, señalética, infografías) sin necesidad de edición posterior.

## Benchmarks y rendimiento

La model card reporta evaluaciones en cinco suites de benchmarks, pero la información proporcionada solo incluye una tabla parcial de GenEval (generación compositiva). El resultado del propio HiDream-O1-Image en esa tabla no aparece en la información extraída; solo se muestran los valores de modelos competidores. Los datos disponibles son:

| Modelo | Parametros | Single-Obj | Two-Obj | Count | Color | Position | Attr | Overall |
|---|---|---|---|---|---|---|---|---|
| Nano Banana 2.0 | – | 1.00 | 0.96 | 0.71 | 0.84 | 0.86 | 0.65 | 0.83 |
| Seedream-4.0 | – | 1.00 | 0.92 | 0.71 | 0.93 | 0.78 | 0.68 | 0.84 |
| GPT Image 1 [High] | – | 0.99 | 0.92 | 0.85 | 0.92 | 0.75 | 0.61 | 0.84 |
| GPT Image 2 | – | 0.99 | 0.98 | 0.85 | 0.93 | 0.85 | 0.77 | 0.89 |
| PixArt | 4.3B + 0.6B | 0.98 | 0.50 | 0.44 | 0.80 | 0.08 | 0.07 | 0.48 |
| Show-o | 1.3B | 0.95 | 0.52 | 0.49 | 0.82 | 0.11 | 0.2 | – |

El resultado de HiDream-O1-Image en GenEval no se ha podido extraer de la información disponible. La model card también menciona que la variante HiDream-O1-Image-Dev-2604 debutó en el puesto 8 del Artificial Analysis Text to Image Arena, posicionándose como el modelo open-source líder en esa clasificación, pero no se proporcionan los valores numéricos de esa evaluación en el material extraído.

## Requisitos de hardware

- El repositorio pesa 35,2 GB en safetensors, lo que indica que los pesos están almacenados en precisión fp16 o similar. La inferencia en fp16 requeriría aproximadamente 17,6 GB de VRAM solo para los pesos, más overhead de activaciones y memoria intermedia.
- Con cuantización a 8 bits, los pesos ocuparían alrededor de 8,8 GB, y a 4 bits unos 4,4 GB, lo que permitiría ejecución en GPUs de consumo como RTX 3090, RTX 4090 o similares con 16-24 GB de VRAM. Sin embargo, no se han publicado guías oficiales de cuantización para este modelo.
- Para la variante completa (50 pasos) se recomienda una GPU con al menos 24 GB de VRAM en fp16; la variante Dev (28 pasos) reduce el coste computacional por generación.
- Opciones de despliegue: el modelo es compatible con la librería `transformers` y el pipeline `image-text-to-image`. El repositorio de GitHub incluye scripts de inferencia (`inference.py`) y una demo web (`app.py`). No se mencionan integraciones específicas con vLLM, llama.cpp u Ollama en la información disponible.
- La latencia y el throughput dependen del hardware; no se han publicado cifras oficiales. Como referencia, un modelo de 8,8B en una RTX 4090 podría generar una imagen de 1024×1024 en decenas de segundos, pero este dato es una estimación no confirmada.

## Comparativa con modelos similares

La comparativa se basa en los datos de GenEval disponibles en la model card. Los modelos comparables de generación de imágenes open-source son PixArt (4,9B) y Show-o (1,3B), ambos superados ampliamente en rendimiento compositivo por los sistemas propietarios listados. HiDream-O1-Image se posiciona como un modelo de 8,8B con arquitectura unificada, mientras que PixArt y Show-o usan arquitecturas de difusión latente más tradicionales.

| Modelo | Parametros | Resolucion maxima | Licencia | GenEval Overall (disponible) |
|---|---|---|---|---|
| HiDream-O1-Image | 8,8B | 2048×2048 | MIT | No disponible en la informacion extraida |
| PixArt | 4,9B | 1024×1024 (tipico) | Codigo abierto | 0.48 |
| Show-o | 1,3B | 1024×1024 (tipico) | Codigo abierto | – |
| GPT Image 2 | Propietario | – | Propietaria | 0.89 |
| Seedream-4.0 | Propietario | – | Propietaria | 0.84 |

La model card afirma que HiDream-O1-Image alcanza paridad o supera a modelos de difusión abiertos más grandes y a sistemas propietarios, pero sin los valores numéricos de GenEval para el propio modelo no es posible verificar esa afirmación con los datos disponibles.

## Limitaciones y advertencias

- La model card no detalla sesgos conocidos, pero como modelo entrenado con datos web, es probable que herede sesgos de género, etnia y cultura presentes en los datos de entrenamiento. No se ha publicado una evaluación de sesgos.
- Riesgo de alucinación visual: como cualquier modelo generativo, puede producir objetos, texto o escenas que no se corresponden con la instrucción, especialmente en composiciones complejas con múltiples objetos o atributos.
- La información sobre idiomas soportados no está disponible; aunque el modelo puede renderizar texto multilingüe, no se especifica qué idiomas están cubiertos ni con qué calidad.
- No se han publicado datos sobre la longitud de contexto en tokens; la capacidad de 2048×2048 píxeles implica un límite de resolución, pero no se documenta el número máximo de tokens de entrada para instrucciones largas.
- La variante completa requiere 50 pasos de inferencia, lo que puede resultar lento en hardware de consumo; la variante Dev reduce a 28 pasos pero puede tener diferencias de calidad en tareas de edición (la model card recomienda el modelo completo para edición).
- PyTorch 2.9.x no es recomendado por los autores debido a un problema conocido con la inferencia (referenciado en el repositorio de Qwen3-VL).
- La licencia MIT permite uso comercial sin restricciones, pero el modelo se basa en Qwen3-VL, cuya licencia original podría imponer condiciones adicionales; se debe verificar la compatibilidad de licencias antes de un despliegue comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HiDream-ai/HiDream-O1-Image
- Variante Dev: https://huggingface.co/HiDream-ai/HiDream-O1-Image-Dev
- Variante Dev-2604: https://huggingface.co/HiDream-ai/HiDream-O1-Image-Dev-2604
- Prompt Agent (gemma-4-31B-it): https://huggingface.co/google/gemma-4-31B-it
- Prompt Refiner (Prompt-Refine): https://huggingface.co/HiDream-ai/Prompt-Refine
- Informe tecnico (arXiv): https://arxiv.org/pdf/2605.11061v1
- Repositorio GitHub: https://github.com/HiDream-ai/HiDream-O1-Image
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/HiDream-ai/HiDream-O1-Image
- Demo Dev en Spaces: https://huggingface.co/spaces/HiDream-ai/HiDream-O1-Image-Dev
- Comunidad Discord: https://discord.gg/7ZEnPxdTQ
