# happyinhappy/klein-car-background-replace-lora

## Resumen

El modelo `happyinhappy/klein-car-background-replace-lora` es un adaptador LoRA para el modelo de difusión FLUX.2 Klein 9B, desarrollado por Anastasiia Butova (happyinhappy) como parte de un pipeline de generación de imágenes para concesionarios de automóviles. Su función es reemplazar el fondo de una fotografía de un coche (tomada en un solar, garaje o patio) por un entorno de sala de exposición generado, re-iluminando el vehículo para que parezca fotografiado en ese nuevo escenario. El modelo se condiciona con las dimensiones reales del coche en milímetros, lo que permite escalar correctamente el vehículo dentro de la escena generada.

La relevancia de este modelo radica en que aborda un problema específico de la industria automotriz: la necesidad de producir listados de vehículos con imágenes consistentes y atractivas sin realizar sesiones fotográficas en estudio. A diferencia de un simple recorte y pegado, el LoRA está entrenado para que el coche "absorba" la iluminación del nuevo entorno, proyecte sombras coherentes y se asiente en el suelo a su tamaño real. El adaptador tiene 224 tensores y un tamaño de 158 MB, y fue entrenado desde cero (no adaptado de un LoRA genérico de re-iluminación) sobre el modelo base FLUX.2 Klein 9B.

Es importante señalar que los pesos del modelo no están publicados; solo se ha liberado la model card. Esto limita su uso directo, aunque la documentación detalla el proceso de entrenamiento y las decisiones técnicas que lo sustentan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre FLUX.2 Klein 9B (diffusion transformer) |
| Parametros totales | 224 tensores LoRA, 158 MB (modelo base: 9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (entrada/salida visual) |
| Licencia | card-only-weights-not-released (otros) |
| Formato de pesos | no publicado (solo model card) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado sobre FLUX.2 Klein 9B, un modelo de difusión de tipo transformer. El entrenamiento se realizó con la librería ai-toolkit 0.9.13, partiendo de un run anterior reanudado en el paso 1.250 y completando 2.750 pasos en una sola época. El nombre del run (`bgreplace_klein9b_relight_scratch_dims_l800_resume1250`) indica que se entrenó desde cero (`scratch`) para esta tarea específica, no como adaptación de un LoRA genérico de re-iluminación.

El proceso de construcción de los pares de entrenamiento es la innovación técnica más destacable. Para evitar que el modelo desplazara o deformara el coche al cambiar el fondo, se calcularon máscaras SAM3 tanto en la imagen de entrada (antes) como en la imagen objetivo (después), y se alinearon los pares sobre la máscara del vehículo, no sobre el fotograma completo. De esta forma, la única diferencia entre entrada y salida es el entorno, y la señal de aprendizaje se centra en la iluminación y la habitación. El condicionamiento adicional incluye las dimensiones reales del coche (largo, ancho, alto, batalla y distancia al suelo) en milímetros, que determinan la escala del vehículo en la escena generada. Se utilizaron 8.758 fondos generados por prompting (salas, calles, carreteras costeras, estudios) como banco de escenarios.

## Capacidades

- Reemplazo de fondo en imágenes de coches: sustituye el entorno original por una sala de exposición u otro escenario generado.
- Re-iluminación coherente: el coche refleja la luz del nuevo entorno, proyecta sombras y se integra visualmente en la escena.
- Preservación de la posición y proporción del vehículo: gracias al alineamiento con máscaras SAM3, el coche no se desplaza ni se deforma.
- Condicionamiento por dimensiones reales: acepta las medidas del coche en milímetros para escalar correctamente el vehículo en el entorno.
- Generación de escenarios variados: puede producir fondos de salas, calles, carreteras o estudios según el prompt.
- Integración en pipeline multi-etapa: diseñado para funcionar junto a modelos de segmentación, identificación de dimensiones y restauración geométrica.

## Casos de uso

- Listados de vehículos para concesionarios: un concesionario fotografía un coche en un solar o garaje y necesita la misma imagen en una sala de exposición limpia. El modelo genera el fondo y re-ilumina el coche, manteniendo su posición y tamaño real, lo que permite producir treinta fotogramas consistentes para un anuncio.
- Publicidad automotriz en catálogos: para crear imágenes de marketing sin sesiones de estudio, se puede partir de fotos tomadas en exteriores y generar fondos de estudio o paisajes urbanos, con el coche integrado de forma realista.
- Preparación de imágenes para plataformas de venta online: portales como coches.net o AutoScout24 requieren fotos uniformes. Este LoRA puede estandarizar el fondo y la iluminación de vehículos fotografiados en condiciones dispares.
- Generación de contenido para redes sociales de concesionarios: crear publicaciones con el mismo coche en diferentes escenarios (showroom, calle, costa) para campañas de marketing, manteniendo la coherencia visual.
- Restauración de imágenes de archivo: si un concesionario tiene fotos antiguas de coches con fondos poco atractivos, el modelo puede actualizarlas a un entorno moderno sin necesidad de re-fotografiar.
- Pruebas de concepto para diseño de exposiciones: antes de montar una sala de exposición física, se pueden generar imágenes de cómo quedarían distintos coches en diferentes configuraciones de sala, usando las dimensiones reales de cada vehículo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas de rendimiento (PSNR, SSIM, FID, etc.) ni comparaciones con otros métodos de reemplazo de fondo. La evaluación se describe cualitativamente: se corrigió un fallo específico (el desplazamiento del coche) mediante el alineamiento con máscaras SAM3, pero no hay datos numéricos.

## Requisitos de hardware

- No se han publicado requisitos específicos de hardware para este LoRA en la documentación disponible.
- Al ser un adaptador de 158 MB sobre FLUX.2 Klein 9B, la inferencia requiere cargar el modelo base completo. FLUX.2 Klein es un modelo de difusión de 9B parámetros, por lo que se necesita una GPU con suficiente VRAM para ejecutarlo en FP16 o BF16 (estimación general: 16-24 GB, dependiendo de la resolución y el uso de optimizaciones como secuencial CPU offload).
- El LoRA en sí es ligero y puede combinarse con el modelo base en frameworks como Diffusers, ComfyUI o ai-toolkit.
- Para producción a escala, se recomienda usar GPUs de datacenter (A100, H100) o GPUs de consumo de gama alta (RTX 4090) con al menos 24 GB de VRAM.
- No se dispone de datos de latencia o throughput publicados.

## Comparativa con modelos similares

No se dispone de una comparativa directa con modelos equivalentes en la información proporcionada. Existe un LoRA similar en Civitai llamado "Car change background (Kontext)" para FLUX.1 Kontext, que también reemplaza el fondo de coches preservando detalles, posición y proporción, pero no se han publicado comparaciones cuantitativas entre ambos. La principal diferencia es que el modelo de happyinhappy se condiciona con las dimensiones reales del vehículo y está integrado en un pipeline más amplio, mientras que el de Civitai parece ser un adaptador independiente.

| Modelo | Base | Condicionamiento | Licencia | Pesos publicados |
|---|---|---|---|---|
| klein-car-background-replace-lora | FLUX.2 Klein 9B | Dimensiones del coche (mm) | card-only-weights-not-released | No |
| Car change background (Kontext) | FLUX.1 Kontext | No especificado | No especificada | Sí (en Civitai) |

## Limitaciones y advertencias

- Los pesos del modelo no están publicados. La licencia "card-only-weights-not-released" impide el uso comercial o personal del adaptador; solo se ha liberado la documentación.
- El modelo es generativo, no una herramienta de medición. La salida es una imagen plausible, no una fotografía real del coche en ese entorno. No debe utilizarse como evidencia en contextos legales o de seguros.
- Requiere dimensiones correctas del vehículo. Si se introduce una estimación errónea de las medidas, el coche aparecerá a una escala incorrecta en la escena, lo que se percibe inmediatamente como falso.
- Dificultad con carrocerías reflectantes o con mucho cristal. Una superficie tipo espejo tiende a reflejar el entorno generado, lo que puede producir artefactos visuales.
- Limitado a un coche por imagen. El entrenamiento se realizó con fotogramas de un solo vehículo; no es adecuado para escenas con múltiples coches.
- No hay información sobre sesgos del modelo, riesgo de alucinación en detalles del vehículo (como logotipos o llantas) ni comportamiento en condiciones extremas de iluminación o ángulos inusuales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/happyinhappy/klein-car-background-replace-lora
- Modelo de identidad y dimensiones (parte del pipeline): https://huggingface.co/happyinhappy/dinov3-car-id-dimensions
- Modelo de restauración geométrica (etapa posterior): https://huggingface.co/happyinhappy/klein-car-geometry-restore-lora
- Página del proyecto mashinki: https://happyin.work/mashinki/
- GitHub de la autora: https://github.com/AnastasiyaW
- Telegram de contacto: https://t.me/happy_in_happy
- LoRA similar en Civitai: https://civitai.com/models/2034342/car-change-background-kontext
