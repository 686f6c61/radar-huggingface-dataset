# brainworkup/LFM2.5-VL-3B-MLX-oQ8e

## Resumen

LFM2.5-VL-3B es un modelo de visión y lenguaje desarrollado por Liquid AI, diseñado específicamente para su ejecución en dispositivos de borde (edge). Con una arquitectura híbrida que combina el modelo de lenguaje LFM2.5-2.6B con un codificador de visión SigLIP2 NaFlex de 400 millones de parámetros, alcanza un total aproximado de 3,1 mil millones de parámetros. Su principal valor reside en su capacidad para comprender pantallas digitales (web, móvil y escritorio), anclar objetos a coordenadas, extraer información de documentos y gráficos, y ejecutar llamadas a herramientas tanto a partir de texto como de imágenes, todo ello con baja latencia y pensado para entornos con recursos limitados.

La versión que se analiza aquí, `brainworkup/LFM2.5-VL-3B-MLX-oQ8e`, es una cuantización de 8 bits realizada con la herramienta oQ (oMLX v0.6.2) en formato MLX. Esta conversión reduce el tamaño del modelo y lo hace adecuado para su uso con el ecosistema MLX de Apple, permitiendo una inferencia eficiente en hardware de Apple Silicon. Aunque la cuantización mantiene las capacidades funcionales del modelo original, se debe tener en cuenta que la licencia del modelo base no está especificada, lo que condiciona su uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model híbrido: backbone de lenguaje LFM2.5-2.6B + encoder de visión SigLIP2 NaFlex (400M) |
| Parametros totales | 3,1 mil millones (modelo original); el safetensors cuantizado muestra 1.185.060.080 elementos (posible conteo de tensores cuantizados) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información consultada |
| Tipos de cuantizacion | 8 bits (Q8), group size 64 (formato MLX) |
| Idiomas soportados | No disponibles (se presume inglés por el modelo base, pero no se especifica) |
| Licencia | No disponible |
| Formato de pesos | MLX safetensors (cuantización oQ) |

## Arquitectura y entrenamiento

La arquitectura del modelo original LFM2.5-VL-3B se basa en el modelo de lenguaje LFM2.5-2.6B, que emplea una arquitectura de tipo transformer con atención lineal (SSM) según la información publicada por Liquid AI. El encoder visual es SigLIP2 NaFlex, que procesa imágenes de alta resolución y las integra con el texto para tareas de visión-lenguaje. El modelo ha sido entrenado específicamente para comprensión de pantallas, grounding de objetos, análisis de documentos y gráficos, y función de llamada de herramientas, con un enfoque en la inferencia de baja latencia tanto en el dispositivo como en la nube.

No se dispone de detalles sobre el volumen de datos de entrenamiento, el proceso de ajuste (RLHF, DPO, etc.) ni las innovaciones técnicas específicas más allá de la combinación de los módulos mencionados. La cuantización oQ de 8 bits con group size 64 no altera la arquitectura, pero reduce la precisión numérica para optimizar la velocidad y el uso de memoria.

## Capacidades

- Comprensión de pantallas digitales: puede interpretar interfaces web, móviles y de escritorio, identificando elementos visuales y su ubicación.
- Grounding de objetos: anota objetos a coordenadas dentro de una imagen, lo que permite interacciones espaciales precisas.
- Análisis de documentos y gráficos: extrae información de documentos escaneados, tablas y gráficos complejos.
- Función de llamada (function calling): puede invocar herramientas o APIs a partir de instrucciones en texto o imagen.
- Respuesta directa: genera texto de respuesta de forma autoregresiva, sin pasos intermedios visibles, para minimizar la latencia.
- Multimodal: acepta entrada de imagen y texto, produce salida de texto.

## Casos de uso

- Automatización de tareas en dispositivos móviles: el modelo puede interpretar capturas de pantalla y ejecutar acciones como responder mensajes, rellenar formularios o navegar por aplicaciones, gracias a su comprensión de pantallas y función de llamada.
- Asistente de accesibilidad: ayuda a personas con discapacidad visual describiendo el contenido de la pantalla y los elementos interactivos en tiempo real, con baja latencia para uso continuo en un smartphone.
- Extracción de datos de facturas y recibos: el modelo puede leer documentos y extraer campos clave (importes, fechas, proveedores) para su integración en sistemas de contabilidad, sin necesidad de OCR adicional.
- Agentes de soporte técnico: integrado en un sistema de chat, puede analizar capturas de pantalla del usuario y proporcionar instrucciones paso a paso o ejecutar diagnósticos mediante herramientas.
- Análisis de gráficos científicos: convierte gráficos de líneas o barras en texto descriptivo o en datos estructurados, útil para la investigación y la toma de decisiones.
- Asistente de comercio electrónico: identifica productos en imágenes y realiza búsquedas o comparaciones de precios mediante funciones de llamada a APIs externas.
- Interfaz de voz e imagen en dispositivos edge: desplegado en un dispositivo con Apple Silicon (gracias al formato MLX) para aplicaciones de realidad aumentada o asistencia visual en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de cifras de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos en las fuentes consultadas.

## Requisitos de hardware

- El modelo cuantizado en 8 bits ocupa aproximadamente 1,18 GB de memoria (según el safetensors), aunque el tamaño del repositorio es de 3,7 GB (posiblemente incluya archivos adicionales). Para la inferencia, se estima que la VRAM necesaria es de unos 2-4 GB, dependiendo de la resolución de la imagen de entrada.
- Diseñado para dispositivos de borde: puede ejecutarse en smartphones, tabletas y ordenadores de bajo consumo, especialmente con el framework MLX en Apple Silicon.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3050, RTX 3060, M1/M2/M3 de Apple) puede alojar el modelo. En CPU, también es viable, aunque la latencia será mayor.
- Opciones de despliegue: MLX (para Apple), ONNX, GGUF, TGI, vLLM (según la documentación de Liquid AI). La versión MLX es específica para Apple.
- Latencia y rendimiento: no se han publicado cifras concretas, pero se enfatiza la baja latencia para el uso en tiempo real.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de visión de lenguaje de tamaño similar (como Phi-3.5-vision, Qwen2-VL-2B o PaliGemma-3B) en la información proporcionada. No se pueden ofrecer datos cuantitativos de rendimiento relativo. La comparativa se limita a indicar que LFM2.5-VL-3B se posiciona como una alternativa de 3B con enfoque en comprensión de pantallas y llamadas a herramientas, mientras que los modelos citados pueden tener otros puntos fuertes.

## Limitaciones y advertencias

- La licencia del modelo no está especificada, lo que genera incertidumbre sobre el uso comercial y la redistribución. Se debe contactar con Liquid AI para obtener términos claros.
- El modelo está optimizado para comprensión de pantallas y documentos; puede no rendir igual en tareas generales de visión como la descripción de escenas naturales.
- No se han publicado datos sobre idiomas soportados; es probable que esté limitado al inglés, lo que restringe su uso en otros idiomas.
- El modelo puede presentar alucinaciones en la generación de texto, especialmente al describir imágenes o documentos complejos.
- La cuantización de 8 bits puede degradar ligeramente la precisión en comparación con el modelo original en tareas de alto detalle, aunque es adecuada para aplicaciones de borde.
- No se dispone de información sobre la longitud de contexto máxima, lo que limita el uso en conversaciones muy largas o documentos extensos.
- El modelo es relativamente pequeño (3B), por lo que su rendimiento en tareas de razonamiento complejo o conocimiento general puede ser inferior a modelos más grandes.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/brainworkup/LFM2.5-VL-3B-MLX-oQ8e
- Blog de Liquid AI sobre LFM2.5-VL-3B: https://www.liquid.ai/blog/lfm2-5-vl-3b
- Documentación oficial de Liquid AI: https://docs.liquid.ai/lfm/models/lfm25-vl-3b
- Artículo de MarkTechPost: https://www.marktechpost.com/2026/08/13/liquid-ai-lfm2-5-vl-3b-on-device-vision-language-model/
- Blog de Orcarouter: https://www.orcarouter.ai/blog/lfm2-5-vl-3b-explained
