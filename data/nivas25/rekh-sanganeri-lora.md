# nivas25/rekh-sanganeri-lora

## Resumen

Rekh es un LoRA (Low-Rank Adaptation) de alta fidelidad entrenado sobre el modelo base FLUX.1-dev de Black Forest Labs, diseñado para generar estampados Sanganeri auténticos, una técnica tradicional de impresión textil manual originaria de Sanganer, Rajasthan (India). El modelo es obra de nivas25 y se distribuye a través de HuggingFace bajo una licencia no comercial heredada de FLUX.1-dev.

El problema que resuelve es la incapacidad de los modelos base de difusión para reproducir las características físicas del block printing manual: texturas de tela reales, sangrados de tinta sutiles, desalineaciones de estampado y los contornos negros finos conocidos como *rekh*. El LoRA elimina la estética de vector digital que suelen generar los modelos genéricos. Su relevancia radica en la aplicación de técnicas de curado de datos con modelos de visión-lenguaje (VLM) para garantizar autenticidad cultural y técnica en la generación de imágenes.

El modelo se presenta como un adaptador de 1.0 GB (tamaño del repositorio) que se carga sobre el pipeline de FLUX.1-dev mediante la librería diffusers. No se especifican parámetros totales del LoRA, pero se indica que es de rango 32 y alpha 32. La longitud de contexto no aplica al ser un modelo de imagen.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre FLUX.1-dev |
| Parametros totales | no disponible (tamaño del repo: 1.0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (el prompt puede escribirse en cualquier idioma, pero no hay especificación oficial) |
| Licencia | other (hereda la FLUX.1 [dev] Non-Commercial License) |
| Formato de pesos | safetensors (rekh_sanganeri_lora_v2.safetensors) |

## Arquitectura y entrenamiento

Rekh es un adaptador LoRA de rango 32 y alpha 32, entrenado sobre el modelo base FLUX.1-dev, que es un transformer de difusión multimodal de 12 mil millones de parámetros. El entrenamiento se realizó con 178 imágenes altamente curadas, durante 3000 pasos, con una tasa de aprendizaje de 1e-4 y optimizador AdamW de 8 bits, en precisión bfloat16. El hardware utilizado fue una NVIDIA A100 de 80 GB en la plataforma Modal.

La innovación principal del proyecto es el pipeline de curado de datos basado en VLM: se recopilaron miles de imágenes de textiles indios, se filtraron agresivamente con InternVL3 para eliminar diseños CAD digitales, marcas de agua y patrones vectoriales genéricos, conservando únicamente fotografías de algodón tejido con imperfecciones reales de estampado. Posteriormente, Florence-2 generó descripciones detalladas de cada imagen, incluyendo colores de tintes naturales (Syahi, Begar), motivos tradicionales (Keri/Mango, Mor/Peacock, Jali/Trellis) y la textura del tejido. Se experimentó con una variante DoRA de rango 64, pero se descartó por inferior comprensión espacial de los patrones florales densos.

## Capacidades

- Generación de imágenes text-to-image de estampados Sanganeri auténticos, con reproducción fiel de texturas de tela, sangrado de tinta y desalineaciones de estampado.
- Eliminación de la estética de vector digital, produciendo resultados que imitan la impresión manual real.
- Soporte de frase disparadora: `sanganeri hand block print` (debe anteponerse al prompt).
- Control fino del estilo mediante guidance scale: 3.5 produce contornos *rekh* nítidos y auténticos; valores más bajos (2.0) dan un resultado más suave y artístico.
- No incluye capacidades de tool calling, agentes, razonamiento multi-paso, ni soporte multilingüe explícito, al ser exclusivamente un adaptador de imagen.
- Compatible con el pipeline FluxPipeline de diffusers y con técnicas de offload de CPU para reducir requisitos de VRAM.

## Casos de uso

- Diseño de patrones textiles para moda: los diseñadores pueden generar variaciones de estampados Sanganeri para colecciones de ropa, mantelería o decoración, manteniendo la autenticidad del arte tradicional sin necesidad de muestras físicas.
- Creación de fondos y texturas para ilustración digital: ilustradores pueden usar el LoRA para generar texturas de tela realistas como base para composiciones artísticas o narrativas visuales.
- Documentación y preservación cultural: investigadores o museos pueden generar representaciones de estampados históricos para catálogos digitales, respetando las características técnicas del block printing.
- Prototipado rápido para artesanos: los talleres textiles pueden visualizar nuevas combinaciones de colores y motivos antes de producir las planchas de madera, reduciendo costes de prueba y error.
- Generación de contenido para e-commerce: tiendas de artesanía pueden crear imágenes de productos con estampados Sanganeri sin necesidad de sesiones fotográficas, manteniendo la fidelidad visual.
- Educación y divulgación: el modelo sirve para generar ejemplos didácticos de estampados tradicionales en cursos de diseño textil o historia del arte, mostrando las diferencias entre impresión manual y digital.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una evaluación interna denominada "Mega Showdown" con 50 prompts complejos, pero no se proporcionan métricas cuantitativas ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- Al ser un LoRA sobre FLUX.1-dev, los requisitos de hardware son los del modelo base: se recomienda una GPU con al menos 16-24 GB de VRAM para generar imágenes a resoluciones típicas (1024x1024) en bfloat16.
- El entrenamiento se realizó en una NVIDIA A100 de 80 GB, pero para inferencia se puede usar hardware de consumo como una RTX 4090 (24 GB) o superior.
- El LoRA en sí añade un peso mínimo (1.0 GB de repositorio), por lo que el consumo adicional de VRAM es despreciable.
- Se puede utilizar con el pipeline FluxPipeline de diffusers, habilitando `enable_model_cpu_offload()` para reducir la VRAM necesaria, a costa de mayor latencia.
- No se proporcionan datos de latencia o throughput específicos para este LoRA.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se han encontrado otros LoRA específicos para estampados Sanganeri o block printing en las fuentes consultadas.

## Limitaciones y advertencias

- Licencia no comercial: al estar basado en FLUX.1-dev, hereda la FLUX.1 [dev] Non-Commercial License, lo que restringe su uso a fines académicos, de investigación o artísticos. No puede utilizarse en aplicaciones comerciales.
- Dataset limitado: el modelo se entrenó con solo 178 imágenes, lo que puede provocar sobreajuste a los motivos y colores presentes en ese conjunto, limitando la variedad de estampados generables.
- Riesgo de alucinación visual: como cualquier modelo de difusión, puede generar patrones que no corresponden exactamente a la técnica Sanganeri, especialmente con prompts fuera del dominio de entrenamiento.
- Sesgo cultural: el modelo reproduce el estilo de un conjunto específico de imágenes curadas, lo que puede no representar toda la diversidad de la artesanía Sanganeri real.
- No sustituye el trabajo artesanal: el autor advierte explícitamente que el modelo no puede reemplazar la artesanía de los artistas de Sanganer, y fomenta el apoyo a los textiles hechos a mano.
- Dependencia del modelo base: cualquier limitación de FLUX.1-dev (como la generación de texto en imágenes o la fidelidad en ciertos estilos) se traslada al LoRA.

## Enlaces

- HuggingFace: https://huggingface.co/nivas25/rekh-sanganeri-lora
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.1-dev
- Se menciona un repositorio de GitHub para las comparaciones de imágenes, pero no se proporciona la URL en la información disponible.
