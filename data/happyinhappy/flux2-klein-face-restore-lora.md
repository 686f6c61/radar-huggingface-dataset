# happyinhappy/flux2-klein-face-restore-lora

## Resumen

Este modelo es una LoRA de restauración facial diseñada para corregir retratos en los que la expresión facial ha salido mal: ojos cerrados o semicerrados, muecas, sombras duras o expresiones vacías. El desarrollador, happyinhappy (Anastasiia Butova), ha construido un pipeline de entrenamiento que degrada intencionadamente retratos reales con un modelo de edición facial y luego entrena la LoRA para revertir esa degradación, usando la fotografía original como objetivo. El resultado es un adaptador que restaura la expresión natural sin cambiar la identidad de la persona.

La LoRA se basa en el modelo FLUX.2 Klein 9B de Black Forest Labs y se entrena con el método de edición por instrucción (edit LoRA), donde se proporciona una imagen de control y una instrucción textual para obtener la imagen restaurada. El autor ha publicado únicamente la model card, no los pesos del adaptador, por lo que el modelo no es descargable actualmente. A pesar de ello, la documentación detalla el proceso de datos, el entrenamiento y las limitaciones, lo que permite evaluar su idoneidad para casos de uso concretos.

La relevancia de este modelo radica en su enfoque específico: no busca embellecer ni reemplazar identidades, sino devolver un rostro a un estado que la cámara realmente capturó. Esto lo diferencia de otras herramientas de retoque y lo hace potencialmente útil en flujos de edición fotográfica profesional, siempre que se respeten las advertencias éticas y legales que el propio autor señala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de edición sobre FLUX.2 Klein 9B (transformer de difusión) |
| Parametros totales | no disponible (pesos no publicados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no texto) |
| Tipos de cuantizacion | no disponible (pesos no publicados) |
| Idiomas soportados | no disponible (instrucciones en inglés según ejemplos) |
| Licencia | card-only-weights-not-released (solo model card, pesos no liberados) |
| Formato de pesos | no disponible (no publicados) |

## Arquitectura y entrenamiento

El modelo es una LoRA de edición (edit LoRA) que se inserta en los double blocks del transformer de FLUX.2 Klein 9B. Según la model card, el adaptador consta de 224 tensores LoRA distribuidos en las capas de atención (qkv y proyecciones) y MLP de dichos bloques. El entrenamiento se realizó con ai-toolkit 0.7.24, usando un checkpoint en el paso 1000.

La estrategia de datos es la innovación principal: como no existen pares reales de "mismo retrato arruinado y perfecto", el autor los fabricó en dirección inversa. Se recopilaron unas 500.000 fotografías de retratos de la web, se filtraron automáticamente (detección de rostro con MediaPipe, un solo rostro por imagen, tamaño mínimo de cara, sin gafas, equilibrio de género y emoción, deduplicación por embeddings VGG) y luego se degradaron deliberadamente con un modelo de edición facial controlado mediante un grafo de ComfyUI, con 8 pasos y semilla fija por expresión. El par resultante es (imagen degradada, imagen original), donde la original actúa como objetivo. Las instrucciones se variaron en diez formulaciones distintas para evitar que la LoRA se acople a una frase concreta.

No se menciona el uso de RLHF ni DPO; el entrenamiento es puramente supervisado sobre pares sintéticos. Tampoco se detalla el número exacto de pares finales tras el filtrado, solo que es una fracción del medio millón inicial.

## Capacidades

- Restauración de expresiones faciales: abre ojos cerrados o semicerrados sin alterar la forma del ojo.
- Suavizado de muecas o expresiones negativas (tristeza, confusión, asco, ansiedad, miedo) hacia un estado neutral o agradable.
- Corrección de sombras duras que cruzan la cara, especialmente en mejillas y cejas.
- Recuperación de fotogramas que de otro modo se descartarían por mala expresión.
- Preservación de la identidad: el modelo no reemplaza el rostro, lo devuelve a un estado que la cámara produjo.
- Soporte de edición por instrucción: acepta una imagen de control y una instrucción textual (p. ej., "restore the face, open eyes naturally, pleasant relaxed expression").
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales más allá de imagen-entrada/imagen-salida.

## Casos de uso

- Retoque fotográfico profesional: un fotógrafo puede corregir retratos en los que el sujeto parpadeó o puso una expresión no deseada, manteniendo la composición y la iluminación originales. La LoRA se aplicaría como paso posterior a la selección de fotogramas.
- Recuperación de archivos fotográficos: en sesiones de estudio o eventos, imágenes que iban a descartarse por expresiones fallidas pueden recuperarse para su uso en álbumes o galerías.
- Edición de retratos en lote: al integrarse en un pipeline de diffusers, se puede procesar un conjunto de imágenes con la misma instrucción, siempre que cada una contenga un solo rostro y este supere los 256 píxeles.
- Postproducción en cine y vídeo: corrección de fotogramas concretos en secuencias donde la expresión del actor no es la deseada, sin necesidad de regrabar.
- Restauración de retratos antiguos o dañados: si la degradación original (grietas, manchas) se asemeja a sombras o expresiones alteradas, la LoRA podría ayudar, aunque no está específicamente entrenada para ello.
- Flujos de edición con ComfyUI: dado que la degradación se generó con un grafo de ComfyUI, es plausible que la inferencia también se realice en ese entorno, permitiendo a usuarios avanzados integrarla en sus propios grafos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas como FID, LPIPS o tasas de éxito en la apertura de ojos. Tampoco hay comparaciones con otros modelos de restauración facial.

## Requisitos de hardware

- Los pesos de la LoRA no están publicados, por lo que no se puede medir su tamaño ni su VRAM específica.
- La inferencia requiere cargar el modelo base FLUX.2 Klein 9B, que es un transformer de difusión de 9.000 millones de parámetros. En cuantización FP16, esto exige aproximadamente 18 GB de VRAM solo para los pesos, más el espacio para activaciones y el proceso de difusión.
- En GPUs de consumo, una RTX 4090 (24 GB VRAM) podría ejecutar el modelo base en FP16 con margen limitado; una RTX 3090 (24 GB) también sería viable. GPUs con menos de 16 GB requerirían cuantización a 8 bits o 4 bits (p. ej., GGUF o bitsandbytes), aunque no se ha confirmado compatibilidad.
- Para despliegue, se puede usar la librería diffusers de Hugging Face, que es la indicada en la model card. También podría integrarse en ComfyUI, dado que la degradación se generó con ese entorno.
- No se dispone de datos de latencia ni throughput. Como referencia, un modelo de 9B en una GPU profesional (A100 80 GB) suele generar una imagen de 1024×1024 en varios segundos, pero esto depende del número de pasos de muestreo y del scheduler.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros LoRAs de restauración facial. Existen alternativas en el ecosistema FLUX.2 Klein, como la "Flux2 Klein face expression transfer" de Civitai, que transfiere expresiones desde una imagen de referencia, pero su enfoque es diferente (transferencia entre ilustraciones y realismo) y no está orientada a restaurar la expresión original. Tampoco hay datos de rendimiento comparables.

| Modelo | Base | Enfoque | Pesos publicados | Licencia |
|---|---|---|---|---|
| flux2-klein-face-restore-lora (este) | FLUX.2 Klein 9B | Restauración de expresión facial | No | card-only-weights-not-released |
| Flux2 Klein face expression transfer (Civitai) | FLUX.2 Klein 9B/4B | Transferencia de expresión desde referencia | Sí (en Civitai) | no disponible |
| FLUX.2 Klein 9B (base) | - | Generación y edición general | Sí | no disponible (licencia de Black Forest Labs) |

## Limitaciones y advertencias

- Los pesos del adaptador no están publicados. La model card es solo documentación; no se puede descargar ni ejecutar el modelo actualmente.
- Sesgos de datos: el conjunto de entrenamiento proviene de fotografía web, lo que implica un sesgo hacia adultos jóvenes, estética occidental y cobertura desigual de tonos de piel. La restauración será más fiable en los segmentos densos de esa distribución.
- No apto para caras pequeñas: por debajo de 256 píxeles de tamaño facial, el modelo inventa detalles en lugar de restaurar.
- No maneja grupos: está entrenado exclusivamente con un solo rostro por imagen.
- No es una herramienta de embellecimiento: no afina mandíbulas ni agranda ojos; forzar la intensidad puede derivar en deriva de identidad.
- Riesgo de alucinación: en condiciones fuera de distribución (gafas, ángulos extremos, iluminación inusual), puede generar rasgos que no estaban en la fotografía original.
- Uso ético y legal: el autor advierte explícitamente que no debe usarse en documentos, evidencia o periodismo, ni en personas sin su consentimiento, porque altera el registro fotográfico de un rostro real.
- La licencia "card-only-weights-not-released" impide cualquier uso comercial o no comercial del modelo, ya que no hay pesos que distribuir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/happyinhappy/flux2-klein-face-restore-lora
- Blog de Black Forest Labs sobre fine-tuning de FLUX.2 Klein con LoRA: https://huggingface.co/blog/black-forest-labs/flux-2-klein-lora
- Modelo base FLUX.2 Klein 9B: https://huggingface.co/black-forest-labs/FLUX.2-klein (referenciado en la model card)
- LoRA similar en Civitai (transferencia de expresión): https://civitai.com/models/2363566/flux2-klein-face-expression-transfer
- Vídeo sobre Face Swap LoRA para FLUX.2 Klein: https://www.youtube.com/watch?v=enzrpM91Acg
- Artículo sobre FLUX.2 Klein 9B con LoRA de detalles realistas: https://civitai.com/articles/27526/flux2-klein-9b-realistic-enhanced-details-lora
- Sitio del autor: https://happyin.work/happyin-ai/
- GitHub del autor: https://github.com/AnastasiyaW
- Canal de Telegram del autor: https://t.me/happy_in_happy
- Bot de demostración de la familia de modelos: https://t.me/HappyinAI_bot
