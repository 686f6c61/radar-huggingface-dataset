# Alex995647/loras-z-image-turbo

## Resumen

El repositorio `Alex995647/loras-z-image-turbo` es un espejo de archivo que recopila 150 LoRAs (Low-Rank Adaptation) entrenados por terceros para el modelo de generación de imágenes Tongyi-MAI/Z-Image-Turbo. El autor, Alex995647, ha reunido estos adaptadores desde CivitAI y el Hugging Face Hub, organizándolos en carpetas individuales que incluyen los pesos, un archivo `info.txt` con palabras de activación, ajustes, pros y contras y notas de encadenamiento, un `metadata.json` y una carpeta con imágenes de ejemplo. El repositorio ocupa 30.2 GB y está etiquetado como librería `diffusers`.

La relevancia de este repositorio radica en que centraliza un gran número de LoRAs preentrenados para Z-Image-Turbo, un modelo base de difusión que destaca por su calidad fotorrealista y su capacidad de renderizar texto bilingüe en chino e inglés. Al ser un mirror, no aporta un modelo nuevo, pero facilita el acceso a un ecosistema de adaptadores que amplían las capacidades del modelo base en áreas como fotorrealismo, estilos artísticos, corrección de anatomía y diseño de personajes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre Z-Image-Turbo, modelo de difusion de imagenes |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base Z-Image-Turbo soporta chino e ingles) |
| Licencia | no disponible (las licencias de cada LoRA varian; consultar info.txt) |
| Formato de pesos | no disponible (repositorio diffusers) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado desde cero, sino un conjunto de adaptadores LoRA. Los LoRAs fueron entrenados por 64 autores distintos, cada uno con sus propias metodologías y conjuntos de datos. El modelo base sobre el que se aplican es Z-Image-Turbo, desarrollado por Tongyi-MAI, que utiliza una arquitectura de difusión con un mecanismo de "Prompt Enhancer" para mejorar la comprensión de las instrucciones y generar imágenes con razonamiento. No se proporciona información sobre los datos de entrenamiento específicos de cada LoRA ni sobre el proceso de entrenamiento del modelo base.

La innovación técnica del repositorio es su organización: cada LoRA incluye un archivo `info.txt` con metadatos detallados (palabras de activación, configuración recomendada, ventajas e inconvenientes, y notas sobre cómo encadenar varios LoRAs), además de un `CATALOG.md` que indexa todos los adaptadores y un `REFERENCE.txt` que documenta la relación entre los modos y checkpoints del modelo base.

## Capacidades

- Los LoRAs cubren categorías como fotorrealismo, estilos visuales, corrección de anatomía (manos, pies, rostro) y personajes específicos.
- Incluyen adaptadores para estilos concretos, como Disney, anime cyberpunk, cine de fantasía de los años 80, fotografía amateur y cinematografía.
- El modelo base Z-Image-Turbo ofrece generación de imágenes fotorrealistas, renderizado preciso de texto en chino e inglés, y un "Prompt Enhancer" con capacidades de razonamiento.
- Algunos LoRAs están diseñados para tareas específicas, como hojas de diseño de personajes con paleta de colores y tres perspectivas, o generación de logotipos.
- La documentación de cada LoRA incluye notas sobre cómo combinar adaptadores entre sí para lograr efectos compuestos.

## Casos de uso

- Generación de retratos fotorrealistas: usar LoRAs como `Lenovo UltraReal` o `NiceGirls UltraReal` para producir imágenes con texturas de piel realistas y calidad fotográfica.
- Corrección de anatomía en generaciones: aplicar `Detailed Perfection style` o `Hands XL + SD 1.5 + F1D + Pony + Illustrious + zit + ZIB` para mejorar manos, pies y rostros en imágenes generadas con Z-Image-Turbo.
- Creación de ilustraciones con estilos artísticos definidos: cargar `Definitive Disney Studios` o `Cyberpunk Anime Style` para obtener resultados coherentes con una estética concreta en proyectos de diseño o concept art.
- Diseño de personajes para videojuegos o animación: utilizar `Character Design Sheet (HELPER)` para generar hojas de referencia con tres perspectivas y paleta de colores, acelerando el trabajo de preproducción.
- Simulación de fotografía amateur: emplear `Amateur Photography` para crear imágenes que parezcan tomadas con cámaras domésticas, útil en campañas publicitarias o redes sociales.
- Producción de escenas cinematográficas: combinar `Cinematic Shot` y `80s Fantasy Movie` para generar fotogramas con iluminación y atmósfera de película, aplicables en storyboards o moodboards.
- Generación de logotipos: usar `Logo.Redmond - Logo Lora` para producir propuestas de logotipos con un estilo determinado, aprovechando la capacidad del modelo base para renderizar texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del modelo base Z-Image-Turbo y del tamaño del LoRA).
- GPU recomendadas: no disponible.
- No se especifica si los LoRAs caben en GPUs de consumo; algunos adaptadores superan 1 GB (por ejemplo, `Famegrid` con 1452 MB), lo que puede requerir VRAM adicional.
- Opciones de despliegue: el repositorio está etiquetado como librería `diffusers`, por lo que se puede integrar en pipelines de Diffusers. No se mencionan soportes para vLLM, llama.cpp u otros frameworks de despliegue.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre otros repositorios de espejo de LoRAs para Z-Image-Turbo ni de datos comparativos con alternativas de la misma categoría.

## Limitaciones y advertencias

- Este repositorio es un espejo de archivo; todos los LoRAs fueron entrenados por terceros y no representan trabajo original del autor del repo.
- Las licencias de cada LoRA varían y algunas pueden restringir el uso comercial. Es obligatorio revisar el `info.txt` de cada adaptador y la licencia del modelo base antes de utilizarlos en producción.
- El repositorio incluye contenido potencialmente NSFW, como el LoRA `NSFW MASTER`, lo que puede ser inapropiado para ciertos entornos.
- No se ha realizado ninguna evaluación de sesgos, calidad o seguridad sobre los LoRAs; el riesgo de alucinación o de resultados no deseados depende de cada adaptador.
- El repositorio no incluye el modelo base Z-Image-Turbo; hay que descargarlo por separado desde Hugging Face.
- El tamaño del repositorio es de 30.2 GB, lo que puede suponer un consumo significativo de almacenamiento y ancho de banda al clonarlo.
- No hay garantía de compatibilidad completa entre los LoRAs y versiones futuras o modificadas del modelo base.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Alex995647/loras-z-image-turbo
- Modelo base Z-Image-Turbo: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Articulo sobre entrenamiento de LoRAs para Z-Image-Turbo: https://civitai.com/articles/23863/z-image-turbo-lora-training-setup-full-precision-adapter-v2-massive-quality-jump
