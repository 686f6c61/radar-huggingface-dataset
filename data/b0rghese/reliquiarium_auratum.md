# B0rghese/Reliquiarium_Auratum

## Resumen

Reliquiarium_Auratum es un adaptador de tipo LoRA para generación de imágenes text-to-image, desarrollado por B0rghese (Diana d'Arc) sobre el modelo base Krea-2-Turbo. Su propósito es aplicar un estilo pictórico muy concreto: relicarios dorados, pintura neofigurativa con composición pictórica, paleta cromática restringida, texturas minerales, óxidos, craquelado y envejecimiento de materiales. El adaptador se distribuye a través de Hugging Face con la librería diffusers y ocupa 1,3 GB en el repositorio, con 114 descargas registradas.

La relevancia de este modelo reside en su especialización estilística: permite reproducir una estética de relicario dorado y pintura al óleo envejecida mediante un único prompt, sin necesidad de entrenar un modelo completo. Al estar basado en Krea-2-Turbo, hereda la capacidad de generación de imágenes de ese modelo base, aunque no se ha publicado información detallada sobre el proceso de entrenamiento ni sobre el conjunto de datos utilizado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre Krea-2-Turbo (modelo de difusión text-to-image) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imágenes) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (diffusers) |

## Arquitectura y entrenamiento

Reliquiarium_Auratum es un adaptador LoRA de bajo rango diseñado para el modelo base Krea-2-Turbo, un modelo de difusión para generación de imágenes. Los LoRA introducen matrices de peso de baja dimensionalidad en las capas de atención del modelo base, lo que permite modificar el estilo de generación sin necesidad de ajustar los pesos completos. El repositorio contiene los pesos del adaptador en formato diffusers, listos para cargar con `diffusers.load_pretrained`.

No se ha publicado información sobre el conjunto de datos de entrenamiento, el número de pasos, el rango del LoRA ni las técnicas de optimización utilizadas. El autor tiene otros modelos de estilo para Krea-2 en Civitai, donde se menciona un entrenamiento con 200 imágenes (incluyendo sujetos masculinos, paisajes y naturalezas muertas) y 4000 pasos por época, pero esos datos corresponden a otro modelo ("Soft and Smooth Style - Krea.2 v1") y no se pueden extrapolar a este adaptador.

## Capacidades

- Generación de imágenes con estética de relicario dorado: dorado oxidado, oro envejecido, marfil, carbón, plata oxidada y bronce desgastado.
- Reproducción de texturas de pintura al óleo, craquelado, impasto, capas de barniz agrietado y depósitos minerales.
- Aplicación de iluminación de claroscuro, viñeta, contraste comprimido, desaturación y profundidad de campo reducida.
- Especialización en composición pictórica neofigurativa y abstracción gestual, con énfasis en detalle extremo y acabado cinematográfico.
- No se documentan capacidades de tool calling, agentes, razonamiento multimodal ni generación de texto; se limita a generación de imágenes a partir de prompts.

## Casos de uso

- Ilustración de temática histórica o mística: el estilo de relicario dorado y pintura envejecida es adecuado para portadas de libros, artículos sobre arte sacro, alquimia o historia medieval.
- Diseño de activos para juegos de rol y fantasía: se pueden generar texturas de objetos antiguos, cofres, relicarios, armaduras ornamentadas y escenarios con aspecto desgastado para videojuegos o juegos de mesa.
- Arte conceptual para cine y animación: el claroscuro y la textura de óleo permiten crear escenarios y props con carácter histórico o fantástico.
- Campañas de publicidad premium: el acabado dorado y la paleta restringida son útiles para imágenes de joyería, perfumería o bebidas de lujo que transmitan exclusividad.
- Generación de fondos para diseño gráfico: el estilo monocromático y texturizado sirve como base para invitaciones, cabeceras de revistas o fondos de presentaciones.
- Experimentación artística: los creadores digitales pueden combinar este LoRA con otros modelos o prompts para generar composiciones híbridas, aprovechando su estética singular.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de calidad de imagen (FID, CLIP, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- El adaptador LoRA ocupa 1,3 GB en el repositorio, pero los pesos del adaptador son mucho menores que un modelo completo; la VRAM necesaria depende del modelo base Krea-2-Turbo.
- Se puede ejecutar en GPU con al menos 8 GB de VRAM si el modelo base se usa en precisión fp16, aunque no se han especificado requisitos exactos.
- Compatible con la librería diffusers de Hugging Face, que permite cargar el adaptador con `diffusers.load_lora_weights`.
- No se documentan opciones de despliegue en motores de inferencia de texto (vLLM, llama.cpp, etc.), ya que se trata de un modelo de imágenes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se especifican modelos comparables con datos de rendimiento. El autor tiene otros adaptadores LoRA para Krea-2 (p. ej., "Soft and Smooth Style"), pero no se dispone de especificaciones de ese modelo para realizar una comparación objetiva.

## Limitaciones y advertencias

- Licencia no especificada: no se indica si se permite uso comercial o si existen restricciones de atribución.
- Idiomas no documentados: no se especifica el idioma de los prompts, aunque al ser text-to-image se espera que siga las instrucciones del modelo base.
- Sesgos no analizados: no se ha publicado un análisis de sesgos de contenido, raza o género. El autor ha mencionado en otro modelo que el entrenamiento inicial solo generaba sujetos femeninos, lo que sugiere que puede haber sesgos de género en los modelos de este autor.
- Riesgo de alucinación visual: como todos los modelos de difusión, puede generar artefactos, texto ilegible o elementos inconsistentes en composiciones complejas.
- Dependencia del modelo base: la calidad final depende de Krea-2-Turbo, cuyas características y limitaciones no están documentadas en esta ficha.

## Enlaces

- Hugging Face: https://huggingface.co/B0rghese/Reliquiarium_Auratum
- Perfil del autor en Hugging Face: https://huggingface.co/B0rghese
- Perfil del autor en Civitai: https://civitai.com/user/B0rghese/models
- Otro modelo del autor en Civitai: https://civitai.com/models/2699201/b0rghese-soft-and-smooth-style
