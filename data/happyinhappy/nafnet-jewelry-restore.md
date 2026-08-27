# happyinhappy/nafnet-jewelry-restore

## Resumen

El modelo `happyinhappy/nafnet-jewelry-restore` es un restaurador de imágenes especializado en fotografía de producto de joyería. Desarrollado por Anastasiia Butova (usuario `happyinhappy`), el modelo toma una fotografía de una pieza de joyería que ha sido degradada —reducida de resolución, cubierta de polvo y con pelos sueltos— y devuelve un fotograma limpio, eliminando ruido, polvo y cabellos mientras recupera el detalle fino del producto. Está basado en la arquitectura NAFNet (Nonlinear Activation Free Network), un modelo de restauración de imágenes que prescinde de funciones de activación no lineales y de mecanismos de atención, usando bloques gated simples para preservar la textura de alta frecuencia.

La relevancia de este modelo radica en que los restauradores genéricos entrenados con rostros o paisajes tienden a confundir el detalle fino de una joya (facetas, brillos especulares, grano del metal) con ruido, eliminándolo. Este modelo se entrena específicamente con fotografías reales de joyería, por lo que distingue entre defectos reales (polvo, pelos, ruido de sensor) y la estructura del producto. Sin embargo, los pesos del modelo no están publicados: la model card solo documenta el proceso de construcción de datos, el entrenamiento y la convergencia, sin ofrecer los checkpoints para descarga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NAFNet (Nonlinear Activation Free Network) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible (pesos no publicados) |
| Idiomas soportados | no aplica (procesamiento de imagen) |
| Licencia | card-only-weights-not-released (solo model card, pesos no publicados) |
| Formato de pesos | no disponible (no se distribuyen pesos) |

## Arquitectura y entrenamiento

NAFNet es una red de restauración de imágenes propuesta por MEGVII Research que elimina las funciones de activación no lineales (como ReLU o GELU) y los mecanismos de atención, sustituyéndolos por bloques gated simples basados en normalización y convoluciones. Esta elección de diseño permite que el modelo retenga texturas finas y detalles de alta frecuencia, algo crítico en el dominio de la joyería, donde los bordes de las facetas y los brillos especulares son información esencial del producto.

El entrenamiento de este modelo se realizó sobre un corpus de fotografías reales de joyería. El proceso de construcción de datos consistió en degradar intencionadamente imágenes limpias de alta resolución: se aplicó un downscale de 2x, se añadieron motas de polvo y se superpusieron pelos sueltos (el defecto más común en este tipo de fotografía). El modelo se entrenó para reconstruir la imagen limpia original a partir de la versión degradada. Se guardaron checkpoints cada 2.000 iteraciones hasta la iteración 14.000, y se generaron hojas de contacto de evaluación con tríos (referencia limpia, entrada degradada, salida del modelo) sobre el mismo conjunto fijo para comparar visualmente la convergencia. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; el entrenamiento es supervisado con pérdida de reconstrucción.

## Capacidades

- Restauración de imágenes de joyería: elimina polvo, pelos y ruido de sensor en un solo paso.
- Recuperación de detalles finos: conserva facetas, brillos especulares y textura de metal.
- Super-resolución: el modelo trabaja con entradas degradadas a 2x de resolución y devuelve la imagen a su resolución original.
- Denoising: reduce el ruido de sensor típico de exposiciones macro con diafragma cerrado.
- Procesamiento image-to-image: acepta una imagen degradada y produce una imagen restaurada.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá de la restauración de imágenes.

## Casos de uso

- Restauración de fotografías de producto para e-commerce de joyería: el modelo puede limpiar automáticamente imágenes de anillos, collares o pendientes que presenten polvo o pelos, mejorando la calidad visual del catálogo sin intervención manual.
- Preprocesado en pipelines de fotografía profesional: antes de publicar o enviar a imprenta, las imágenes de joyería pueden pasar por este modelo para eliminar defectos comunes de la sesión, reduciendo el tiempo de retoque en Photoshop.
- Recuperación de archivos fotográficos antiguos o escaneados: si una joyería tiene fotografías históricas de piezas con baja resolución o suciedad, el modelo puede restaurarlas para su uso en archivo o documentación.
- Automatización de control de calidad en producción: en un flujo de fotografía de producto a gran escala, el modelo puede actuar como filtro automático que detecta y corrige imágenes con defectos, garantizando consistencia visual.
- Mejora de imágenes para tasación o peritaje: al recuperar detalles finos de una pieza, el modelo facilita la inspección visual de características como marcas de contraste o micro-rayaduras, siempre que no sean el objetivo de la restauración.
- Integración en herramientas de edición fotográfica: el modelo puede empaquetarse como un plugin o nodo (por ejemplo, en ComfyUI) para que fotógrafos y retocadores lo apliquen selectivamente sobre zonas problemáticas de una imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas numéricas (PSNR, SSIM, LPIPS) ni comparaciones cuantitativas con otros modelos. La evaluación se realizó mediante inspección visual de hojas de contacto a lo largo del entrenamiento, sin métricas objetivas reportadas.

## Requisitos de hardware

No disponible. Al no publicarse los pesos del modelo, no se puede estimar la VRAM necesaria, las GPU recomendadas ni el rendimiento en inferencia. La arquitectura NAFNet es relativamente ligera en comparación con transformers de visión, pero sin los checkpoints no es posible ofrecer cifras concretas. La model card menciona que las imágenes de producto suelen tener entre 6K y 10K píxeles, por lo que el pipeline requiere dividir la imagen en tiles y gestionar las costuras; esto implica un consumo de memoria adicional que dependerá del tamaño del tile y de la implementación.

## Comparativa con modelos similares

No disponible. No se dispone de datos comparativos con otros restauradores de imágenes como SwinIR, Restormer o el propio NAFNet genérico. La model card no ofrece comparaciones cuantitativas ni cualitativas con alternativas. Se puede señalar que NAFNet original (megvii-research/NAFNet) es el modelo base, pero no se especifican diferencias de rendimiento con esta variante específica para joyería.

## Limitaciones y advertencias

- Entrenado exclusivamente para joyería: sobre piel, tela o paisajes, el modelo tratará cualquier detalle fino como si fuera una faceta, produciendo resultados artificiales.
- Degradación sintética: el polvo, los pelos y el downscale se aplicaron programáticamente; defectos reales que no se asemejen a esos tres tipos (por ejemplo, manchas de grasa, reflejos no deseados) quedan fuera de la distribución de entrenamiento.
- Es un restaurador, no un retocador: no elimina reflejos que no gusten ni remodela piedras; solo revierte daños.
- Imágenes grandes requieren tiling: las tomas de producto de 6K a 10K píxeles deben dividirse en tiles, y la gestión de costuras es un punto crítico (el autor referencia un artículo sobre este tema).
- Los pesos no están publicados: la licencia es "card-only-weights-not-released", por lo que no es posible descargar ni utilizar el modelo en producción. Solo se documenta el proceso de entrenamiento.
- Sin métricas objetivas: no hay benchmarks publicados, lo que dificulta evaluar su rendimiento de forma cuantitativa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/happyinhappy/nafnet-jewelry-restore
- Repositorio NAFNet original (MEGVII Research): https://github.com/megvii-research/NAFNet
- Documentación de implementación de NAFNet en DeepWiki: https://deepwiki.com/megvii-research/NAFNet/11.2-model-implementation
- Página de NAFNet en ikalos.ai: https://ikalos.ai/ai/megvii-research/nafnet
- Modelos NAFNet de mikestealth en HuggingFace: https://huggingface.co/mikestealth/nafnet-models
- Nodos de NAFNet para ComfyUI: https://github.com/marduk191/ComfyUI-NAFNet
- Blog de la autora (artículo sobre costuras en tiles): https://happyin.work/blog/diffusion-seams-40mp/
- Sitio personal de la autora: https://happyin.work/ois-gold/
- GitHub de la autora: https://github.com/AnastasiyaW
- Telegram de la autora: https://t.me/happy_in_happy
