# OsGo/WeVisOne-VL-4B

## Resumen

WeVisOne-VL-4B es un modelo vision-lenguaje unificado desarrollado por WeChat Vision (Tencent Inc.) que combina percepción a nivel de objeto y a nivel de píxel en un único modelo. Construido sobre Qwen3-VL, unifica tareas como detección de objetos de vocabulario abierto, localización por referencia, conteo de objetos, pointing, OCR, segmentación por referencia y matting alfa promptable mediante predicción estructurada de siguiente token y un decodificador de píxeles ligero de 9,6 millones de parámetros.

El modelo emplea tokens de coordenada dedicados (`<0>` a `<1000>`) para representar cajas delimitadoras normalizadas y puntos, devolviendo `None` cuando el objetivo consultado está ausente, y emite un token de instancia especial (`<OBJ>`, ID 152678) tras cada caja predicha para tareas densas. Esta aproximación permite obtener salidas estructuradas y máscaras de alta resolución sin necesidad de cabezas específicas por tarea.

Es relevante ahora porque propone una arquitectura unificada para percepción visual densa con licencia Apache 2.0, algo poco habitual en modelos de esta categoría. El repositorio de HuggingFace es un espejo no modificado del repositorio upstream de Tencent, y el paquete de inferencia se distribuye por separado en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (Qwen3-VL) con decodificador de píxeles ligero (9,6 M parámetros) |
| Parametros totales | 4.830.581.248 (4,83 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en bfloat16 en el ejemplo de uso) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); `mask_decoder.pt` como componente adicional |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-VL como backbone vision-lenguaje y añade un decodificador de píxeles de 9.609.764 parámetros (`mask_decoder.pt`) que es un componente obligatorio. Este decodificador integra tres piezas: un adaptador de características visuales sobre las features del ViT de Qwen3-VL previas al merging multinivel; un decodificador de consultas guiado por caja con 6 bloques de cross-attention deformable inicializados desde el estado oculto del token `<OBJ>` y una caja previa codificada con Fourier; y una cabeza de predicción densa condicionada por instancia (`FullCanvasAlphaCascadeHead`) que refina predicciones en escalas S/4, S/2 y S/1 para producir mattes alfa continuos a resolución completa en stride 1.

La representación de coordenadas se realiza mediante tokens dedicados del rango `<0>` a `<1000>`, que codifican cajas y puntos normalizados. El modelo emite el token especial `<OBJ>` (ID 152678) tras cada caja predicha en tareas densas, y devuelve `None` cuando el objetivo consultado no está presente. Según la model card, el modelo genera salidas estructuradas directamente sin cadena de pensamiento explícita (CoT) por motivos de eficiencia de inferencia. No se han publicado detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Detección de objetos de vocabulario abierto mediante cajas delimitadoras codificadas con tokens de coordenada.
- Localización por referencia (referring localization) y referring expression comprehension.
- Conteo de objetos en imágenes.
- Pointing de objetos mediante puntos normalizados.
- OCR con localización de texto.
- Segmentación por referencia (referring expression segmentation) con máscaras de instancia.
- Matting alfa promptable con salida de matte continuo a resolución completa (stride 1).
- Generación conversacional de texto (pipeline image-text-to-text).
- Salida estructurada con devolución de `None` ante objetivos ausentes, lo que facilita la integración en pipelines automatizados.
- No soporta explícitamente tool calling, agentes multi-paso ni cadena de pensamiento según la información disponible.
- No se documenta soporte de vídeo: el decodificador de píxeles rechaza rejillas de vídeo.

## Casos de uso

- Anotación automática de datasets de visión: el modelo puede generar cajas y máscaras de instancia a partir de prompts en lenguaje natural, reduciendo el coste de etiquetado en proyectos de detección y segmentación.
- Segmentación interactiva en herramientas de edición de imagen: con `task="segmentation"` y una consulta como "persona", se obtienen máscaras por instancia que pueden integrarse en flujos de recorte o retoque.
- Matting alfa para producción audiovisual: la cabeza `FullCanvasAlphaCascadeHead` produce mattes continuos a resolución completa, útiles para composición, sustitución de fondos o creación de contenido.
- Digitalización de documentos con OCR localizado: el modelo devuelve texto junto con su posición, lo que permite reconstruir layouts y extraer campos estructurados de facturas o formularios.
- Conteo y control de inventario visual: consultas como "cuenta las cajas" devuelven cajas y conteo, aplicable a inspección industrial o análisis de estanterías.
- Asistentes de accesibilidad: localización y descripción de objetos mediante pointing y referring comprehension para describir escenas a usuarios con discapacidad visual.
- Moderación y análisis de contenido: detección de objetos y regiones específicas en imágenes para filtrar contenido no deseado antes de su publicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 4,83 B parámetros, en bfloat16 los pesos ocupan aproximadamente 9,7 GB, a lo que se suma el decodificador de píxeles y las activaciones del ViT; se estima un mínimo práctico en torno a 16-24 GB de VRAM, aunque este dato no está confirmado por el autor.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en una RTX 4090 (24 GB) en bfloat16 y en GPUs de datacenter como A100 o H100.
- Compatibilidad con GPU de consumo: probable en RTX 4090 y posible en GPUs de 16 GB con cuantización, aunque no se documentan recetas de cuantización.
- Opciones de despliegue: el autor distribuye el paquete `wevisone_vl` (instalable desde GitHub) con API `WeVisOneVL(...).predict(...)`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas densas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeVisOne-VL-4B | 4,83 B | No disponible | Detección, segmentación, matting, OCR, pointing, conteo | Apache 2.0 | HuggingFace (espejo) + GitHub |
| Qwen3-VL (base) | Según variante | No disponible en esta ficha | Percepción general, sin matting alfa nativo | Según variante | HuggingFace |
| Alternativas de grounding/segmentation | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Los bordes finos de las máscaras alfa son sensibles a la resolución de imagen, la oclusión severa, la transparencia compleja y la formulación del prompt.
- El modelo no genera cadena de pensamiento explícita, lo que puede limitar el razonamiento en consultas complejas.
- Solo admite percepción de imagen de un único turno; las rejillas de vídeo son rechazadas por el decodificador de píxeles.
- No está destinado a decisiones autónomas de alto impacto ni a la identificación de personas, según la model card.
- Riesgo de alucinación en localizaciones y conteos no cuantificado en la información disponible; la devolución de `None` mitiga parcialmente los falsos positivos en objetivos ausentes.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no documentados.
- Licencia Apache 2.0 para el código de Tencent; los componentes de terceros conservan sus licencias originales, por lo que conviene revisarlas antes de uso comercial.
- El repositorio de HuggingFace es un espejo no modificado; para actualizaciones y soporte debe consultarse el repositorio upstream de Tencent.
- El paquete de inferencia se distribuye por separado y no está integrado en `transformers` de forma nativa, lo que añade complejidad al despliegue.

## Enlaces

- HuggingFace (espejo): https://huggingface.co/OsGo/WeVisOne-VL-4B
- Repositorio upstream: https://huggingface.co/tencent/WeVisOne-VL-4B
- GitHub del proyecto: https://github.com/Tencent/WeVisOne-VL
