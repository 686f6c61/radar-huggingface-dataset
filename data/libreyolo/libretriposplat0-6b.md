# LibreYOLO/LibreTripoSplat0.6b

## Resumen

LibreTripoSplat0.6b es un empaquetado para LibreYOLO del modelo TripoSplat de VAST, un sistema de generación de Gaussian splats 3D a partir de una única imagen de un objeto. No se trata de un modelo nuevo: los pesos son idénticos byte a byte a los del repositorio original `VAST-AI/TripoSplat`, y el trabajo de LibreYOLO consiste únicamente en reorganizar los ficheros y proporcionar una interfaz de inferencia (`LibreGen`) junto con dependencias alojadas en otros repositorios.

El modelo resuelve el problema de reconstrucción 3D a partir de una sola vista, produciendo como salida hasta 262.144 Gaussianas 3D que codifican geometría y apariencia del objeto. Está compuesto por un denoiser de flujo rectificado de 370M parámetros, un decodificador de octree y Gaussianas de 288M parámetros, y un módulo de eliminación de fondo basado en BiRefNet (Swin-L). En total, el repositorio ocupa 1,8 GB en formato fp16.

Es relevante por su enfoque de control de densidad aprendido para la generación de Gaussianas, presentado en el paper "Generative 3D Gaussians with Learned Density Control" (SIGGRAPH 2026), y porque facilita su uso dentro del ecosistema LibreYOLO con una licencia MIT permisiva, aunque con dependencias externas sujetas a licencias distintas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Denoiser de flujo rectificado (rectified flow) + decodificador de octree y Gaussianas; eliminación de fondo con BiRefNet (Swin-L); encoder de imagen DINOv3 ViT-H+/16 y VAE FLUX.2 como dependencias externas |
| Parametros totales | 658M en los ficheros empaquetados (370M denoiser + 288M decodificador VAE); no incluye encoder DINOv3 ni VAE FLUX.2 externos |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (modelo image-to-3D, no textual) |
| Tipos de cuantizacion | No disponible; pesos publicados en fp16 |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | MIT (según VAST); las dependencias externas tienen licencias propias: DINOv3 (Meta DINOv3 License, con restricciones de uso) y FLUX.2 VAE (Apache-2.0) |
| Formato de pesos | safetensors (fp16) |

## Arquitectura y entrenamiento

El pipeline combina varias etapas. Primero se elimina el fondo de la imagen de entrada con BiRefNet (Swin-L). Después, un encoder DINOv3 ViT-H+/16 extrae características de la imagen, y un denoiser de flujo rectificado de 370M parámetros genera la representación latente 3D. Finalmente, un decodificador de octree y Gaussianas de 288M parámetros produce hasta 262.144 Gaussianas 3D que representan el objeto. El VAE de FLUX.2 se utiliza como componente auxiliar del pipeline.

La innovación técnica destacada es el "learned density control" para la generación de Gaussianas 3D, que según el paper permite controlar de forma aprendida la densidad de las primitivas generadas. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; estos datos no están disponibles en la información proporcionada. Los pesos no han sido reentrenados ni convertidos por LibreYOLO: son byte-idénticos a los del repositorio upstream de VAST.

## Capacidades

- Generación de Gaussian splats 3D a partir de una única imagen de un objeto.
- Salida de hasta 262.144 Gaussianas 3D en formato `.ply`.
- Eliminación automática de fondo de la imagen de entrada mediante BiRefNet (Swin-L).
- Reconstrucción de geometría y apariencia del objeto en una sola pasada.
- Integración con la librería LibreYOLO mediante la API `LibreGen` y la CLI `libreyolo generate`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: no es un modelo de lenguaje.
- No dispone de capacidades multilingües, de visión general ni de audio; su única tarea es image-to-3D.

## Casos de uso

- Digitalización de productos para comercio electrónico: a partir de una foto de catálogo con fondo eliminado automáticamente, generar un activo 3D en formato `.ply` para visores web o configuradores de producto.
- Creación de assets para videojuegos y realidad aumentada: generar prototipos de objetos 3D rápidamente desde una sola referencia fotográfica, reduciendo el tiempo de modelado manual en fases de previsualización.
- Reconstrucción de patrimonio o piezas físicas: fotografiar un objeto y obtener una representación 3D con Gaussianas para documentación o visualización, siempre que la calidad de la vista única sea suficiente.
- Generación de contenido para impresión 3D o renderizado volumétrico: usar la salida de Gaussianas como base para posteriores procesos de mallado o renderizado con herramientas compatibles con `.ply`.
- Automatización de pipelines de assets 3D: integrar la CLI `libreyolo generate` en scripts por lotes que procesen carpetas de imágenes y produzcan ficheros `.ply` de forma desatendida.
- Investigación en reconstrucción 3D de vista única: servir como referencia reproducible con pesos idénticos al upstream de VAST para comparar métodos de generación de Gaussianas y control de densidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio pesa 1,8 GB en fp16, pero hay que sumar el encoder DINOv3 ViT-H+/16 y el VAE FLUX.2 externos, por lo que el consumo real será superior al de los pesos empaquetados.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que quepa en tarjetas consumer concretas.
- Opciones de despliegue: librería `libreyolo` (API `LibreGen` y CLI `libreyolo generate`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreTripoSplat0.6b | 658M (370M denoiser + 288M decodificador) | Imagen única | Hasta 262.144 Gaussianas 3D | MIT (con dependencias externas restringidas) | HuggingFace, mirror de VAST |
| VAST-AI/TripoSplat (upstream) | Idénticos (mismos pesos) | Imagen única | Hasta 262.144 Gaussianas 3D | MIT | HuggingFace |
| Otros modelos image-to-3D | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa con alternativas de la misma categoría no está disponible en la información proporcionada; el único comparable documentado es el repositorio upstream de VAST, del que este es un mirror byte-idéntico.

## Limitaciones y advertencias

- Es un mirror, no un modelo nuevo: cualquier corrección o mejora debe provenir del upstream `VAST-AI/TripoSplat`.
- Requiere dependencias externas no incluidas en el repositorio: el encoder DINOv3 ViT-H+/16 (licencia DINOv3 de Meta, que restringe algunos usos) y el VAE de FLUX.2 (Apache-2.0). La licencia MIT del modelo no cubre estas dependencias.
- Solo acepta una imagen de un objeto por inferencia; no está pensado para escenas completas ni para múltiples vistas.
- La calidad de la reconstrucción depende de la vista única disponible; no se documentan métricas de fidelidad geométrica.
- Riesgo de alucinación geométrica inherente a la generación desde una sola vista: partes ocultas del objeto se infieren, no se observan.
- No se documentan sesgos, limitaciones de idioma ni restricciones adicionales de uso comercial más allá de las licencias de las dependencias.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.
- No se especifican requisitos de hardware ni latencias, lo que dificulta planificar despliegues.

## Enlaces

- [HuggingFace: LibreYOLO/LibreTripoSplat0.6b](https://huggingface.co/LibreYOLO/LibreTripoSplat0.6b)
- [Upstream en HuggingFace: VAST-AI/TripoSplat](https://huggingface.co/VAST-AI/TripoSplat)
- [Repositorio de código: VAST-AI-Research/TripoSplat](https://github.com/VAST-AI-Research/TripoSplat)
- [Paper: arXiv:2605.16355](https://arxiv.org/abs/2605.16355)
- [Dependencia: LibreYOLO/LibreDINOv3vith16plus](https://huggingface.co/LibreYOLO/LibreDINOv3vith16plus)
- [Dependencia: black-forest-labs/FLUX.2-klein-4B](https://huggingface.co/black-forest-labs/FLUX.2-klein-4B)
