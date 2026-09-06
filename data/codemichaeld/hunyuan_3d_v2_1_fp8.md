# codemichaeld/hunyuan_3d_v2_1_fp8

# Ficha técnica: Hunyuan3D-2.1 FP8

## Resumen

Este modelo es una conversión al formato de cuantización FP8 (E5M2) del modelo Hunyuan3D-2.1, desarrollado originalmente por Tencent. Hunyuan3D-2.1 es un modelo de generación de activos 3D de alta fidelidad a partir de imágenes 2D, presentado como "la primera generación de activos 3D lista para producción" en el ecosistema open source. La conversión FP8 reduce el peso del modelo y los requisitos de memoria en comparación con la versión original, manteniendo el formato de pesos en safetensors y la compatibilidad con la librería diffusers de PyTorch.

El repositorio de HuggingFace contiene un único archivo de pesos, `hunyuan_3d_v2.1-fp8-e5m2.safetensors`, de 3.7 GB. El proceso de conversión ha transformado los 1601 tensores del modelo original a FP8, sin omitir ningún tensor. Al cargar los pesos con PyTorch (versión 2.1 o superior), los tensores FP8 se convierten automáticamente a float32 para su uso en computación, lo que simplifica la integración en pipelines existentes.

La relevancia de este modelo radica en que ofrece una vía de acceso más ligera al modelo Hunyuan3D-2.1, que es capaz de generar modelos 3D con materiales PBR y texturas a partir de una sola imagen. La cuantización FP8 permite desplegar el modelo en entornos con menos memoria, aunque se debe tener en cuenta que se trata de una conversión realizada por un usuario externo, no por el equipo de Tencent.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de generacion 3D basado en diffusion, segun la libreria diffusers) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de generacion 3D, no de texto) |
| Tipos de cuantizacion | FP8 E5M2 (conversion automatica a float32 al cargar) |
| Idiomas soportados | No aplica (modelo de generacion 3D, no de texto) |
| Licencia | No disponible |
| Formato de pesos | safetensors (FP8 E5M2) |

## Arquitectura y entrenamiento

El modelo es una conversión FP8 del modelo original Hunyuan3D-2.1 de Tencent. La arquitectura interna del modelo no se detalla en la información disponible; únicamente se indica que se distribuye con la librería diffusers, lo que sugiere que se trata de un modelo de difusión para generación de activos 3D. Según el repositorio oficial de Tencent, Hunyuan3D-2.1 incluye un modelo PBR (physically based rendering) y un encoder VAE, y fue liberado con todo el código de entrenamiento, aunque no se proporcionan datos sobre el dataset ni el número de tokens o pasos de entrenamiento.

La conversión FP8 se realizó sobre el archivo `hunyuan_3d_v2.1.safetensors` (proveniente de la versión empaquetada por Comfy-Org). El proceso convirtió los 1601 tensores del modelo al formato E5M2 (flotante de 8 bits con 5 bits de exponente y 2 bits de mantisa). No se omitió ningún tensor. Al cargar los pesos con PyTorch, los tensores FP8 se convierten automáticamente a float32, lo que mantiene la compatibilidad con el código original sin necesidad de modificaciones adicionales.

## Capacidades

- Generación de activos 3D de alta fidelidad a partir de imágenes 2D: el modelo puede convertir una imagen de entrada en un modelo 3D completo.
- Soporte de materiales PBR y texturas: según el repositorio oficial, el modelo incluye un modelo PBR y un encoder VAE para generar materiales realistas.
- Integración con diffusers y safetensors: se puede cargar directamente mediante la API de safetensors y usarse en pipelines de PyTorch.
- No soporta tool calling ni función de llamada a herramientas, al no ser un modelo de lenguaje.
- No dispone de capacidades multilingües ni de generación de texto.
- No incluye modo de pensamiento ni soporte de visión o audio más allá de la entrada de imágenes para la generación 3D.

## Casos de uso

- Creación de assets 3D para videojuegos: el modelo permite generar modelos 3D listos para usar en motores como Unity o Unreal a partir de concept art o fotografías, acelerando el pipeline de producción.
- Prototipado rápido en diseño industrial: los diseñadores pueden convertir bocetos o fotos de productos en modelos 3D para revisar formas y proporciones antes de invertir en modelado manual.
- Visualización de productos en comercio electrónico: a partir de una foto de un producto, se puede generar un modelo 3D para mostrar el artículo desde múltiples ángulos en una tienda online, mejorando la experiencia de compra.
- Arquitectura y visualización de interiores: el modelo puede generar modelos 3D de espacios o edificios a partir de imágenes de referencia, facilitando la presentación de propuestas a clientes.
- Realidad aumentada y virtual: los desarrolladores pueden generar activos 3D a partir de imágenes para usarlos en experiencias inmersivas, reduciendo el tiempo de creación manual.
- Investigación y educación: se pueden crear modelos 3D de objetos históricos, anatómicos o científicos a partir de fotografías para su uso en materiales didácticos o publicaciones.
- Animación y cine: los artistas pueden generar modelos base a partir de concept art y luego refinarlos, acelerando la fase de preproducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El peso del modelo en FP8 ocupa aproximadamente 3.7 GB, por lo que se requiere una GPU con al menos esa cantidad de VRAM, aunque no hay datos oficiales de requisitos de inferencia.
- GPU recomendadas: no disponibles en la información.
- Compatibilidad con GPU de consumo: posiblemente en tarjetas con 8 GB o más de VRAM, pero no hay confirmación oficial.
- Opciones de despliegue: el modelo se usa con la librería diffusers de PyTorch. Al no ser un modelo de lenguaje, no son aplicables vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Tamaño aprox. | Licencia | Disponibilidad |
|---|---|---|---|---|
| Hunyuan3D-2.1 original | safetensors (FP32/FP16) | No disponible | No disponible | Repositorio oficial de Tencent |
| Hunyuan3D-2.1 FP8 (este modelo) | safetensors (FP8 E5M2) | 3.7 GB | No disponible | HuggingFace codemichaeld |

No se dispone de información sobre otros modelos de generación 3D comparables en la misma categoría.

## Limitaciones y advertencias

- Pérdida de precisión: la cuantización FP8 puede introducir una ligera degradación en la calidad de los resultados en comparación con los pesos originales en FP32 o FP16.
- Conversión no oficial: este repositorio es una conversión realizada por un usuario externo (codemichaeld), no una publicación del equipo de Tencent. Puede haber diferencias de rendimiento o compatibilidad con respecto al modelo original.
- Licencia no especificada: la información de HuggingFace no indica la licencia. Se debe verificar la licencia del modelo original antes de cualquier uso comercial.
- Riesgo de artefactos: como cualquier modelo de generación 3D, puede producir geometrías incorrectas o artefactos si la imagen de entrada es ambigua o de baja calidad.
- No aplican sesgos lingüísticos ni alucinaciones de texto, al ser un modelo de generación 3D y no un modelo de lenguaje.
- Requiere PyTorch 2.1 o superior para la carga de tensores FP8.

## Enlaces

- HuggingFace: https://huggingface.co/codemichaeld/hunyuan_3d_v2_1_fp8
- Repositorio oficial Hunyuan3D-2.1: https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1
- Repositorio Hunyuan3D-2: https://github.com/Tencent-Hunyuan/Hunyuan3D-2
