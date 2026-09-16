# Linum-AI/jit-ddt

## Resumen

JiT-DDT es un modelo de difusión de tipo transformer (DiT) para generación de texto a imagen que opera directamente en el espacio de píxeles, sin VAE. Lo desarrolla Linum y consta de 2.487.506.290 parámetros (unos 2,49 mil millones) distribuidos en dos torres entrenadas conjuntamente: un DiT codificador que trabaja con parches de 64×64 píxeles y produce un plan estructural, y un DiT decodificador que trabaja con parches de 32×32 píxeles y consume ese plan en contexto. Genera imágenes RGB de 512×512 píxeles.

El problema que aborda es el coste de entrenamiento de los modelos de difusión en espacio latente: al eliminar el VAE y trabajar sobre píxeles, Linum sostiene que el modelo alcanza la calidad de su generación anterior (Linum v2, un DiT latente de 2,0B con VAE a 256×256) con 3,6 veces menos GPU-hours y 4,2 veces menos muestras vistas, y a cuatro veces más resolución. El texto se codifica con Qwen3.5-4B, concatenando las capas ocultas 7, 15 y 27.

Es relevante ahora porque se publica como artefacto de investigación, no como lanzamiento de producto: es una vista previa en el camino hacia el modelo v3 de Linum y su objetivo es divulgar métodos de entrenamiento eficiente en espacio de píxeles. Los pesos son el promedio exponencial móvil (EMA) tras 138 millones de muestras de imagen y no han recibido post-entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) en espacio de píxeles, sin VAE; dos torres (encoder DiT con parches de 64×64 px y decoder DiT con parches de 32×32 px) entrenadas conjuntamente |
| Parametros totales | 2.487.506.290 (598 tensores) |
| Parametros activos | No aplica: modelo denso, no es una arquitectura MoE |
| Longitud de contexto | No aplica como ventana de tokens; genera imágenes de 512×512 px. Longitud de contexto del codificador de texto (Qwen3.5-4B): no disponible |
| Tipos de cuantizacion | No disponible. Los pesos se distribuyen en fp32 (9,95 GB) y el autor recomienda mantenerlos en fp32 ejecutando los pesos maestros bajo autocast bf16 |
| Idiomas soportados | No disponible. Las etiquetas de idioma no están declaradas; las descripciones se codifican con Qwen3.5-4B |
| Licencia | Apache-2.0 (Copyright 2026 Linum Inc.) |
| Formato de pesos | safetensors (fp32, 598 tensores, 9,95 GB), config.json y export_manifest.json |

## Arquitectura y entrenamiento

JiT-DDT es un transformer de difusión de dos etapas que evita por completo el autoencoder variacional. El codificador DiT opera sobre parches de 64×64 píxeles y genera un plan estructural de la imagen; el decodificador DiT opera sobre parches de 32×32 píxeles y consume ese plan en contexto para producir la imagen final de 512×512 píxeles en RGB. Ambos se entrenan de forma conjunta. El condicionamiento textual procede de Qwen3.5-4B, del que se concatenan las capas ocultas 7, 15 y 27.

Los pesos liberados corresponden al EMA con semivida de 6.594 pasos, tras 138 millones de muestras de imagen en dos etapas con programación de tiempos logit-normal: primero (0,8; 0,8) y después (-0,2; 1,0). No se ha aplicado post-entrenamiento (ni RLHF ni DPO), por lo que el modelo card lo describe explícitamente como artefacto de investigación. La innovación técnica destacable es el uso de píxeles en lugar de latentes junto con una pérdida de alineación de representaciones: un adaptador transformer enmascarado PixelREPA de 241 millones de parámetros que actúa como cabeza de proyección de dicha pérdida y que es de uso exclusivamente durante el entrenamiento (no se incluye en la publicación; hay una implementación de referencia en `loss.py` del repositorio). El muestreo emplea 50 pasos Euler, guiado proyectado adaptativo con escala 15 y escala de ruido inicial 2.

## Capacidades

- Generación de texto a imagen en espacio de píxeles a 512×512 píxeles en RGB, sin VAE intermedio.
- Interpretación de descripciones textuales largas y densas: el prompt de validación `woman_red_hair` usado durante el entrenamiento ronda las 100 palabras e incluye detalles de iluminación, profundidad de campo, encuadre y bokeh.
- Generación fotorrealista orientada a retratos y escenas con control explícito de iluminación, sombras y desenfoque de fondo, según los ejemplos del modelo card.
- Muestreo determinista por semilla (`--seeds`), lo que permite reproducir exactamente una misma generación.
- Guiado adaptativo configurable mediante `SamplerConfig`.
- No hay soporte declarado de tool calling ni de function calling.
- No hay soporte declarado de agentes ni de razonamiento multi-paso.
- No hay capacidades multilingües declaradas (dependen del codificador Qwen3.5-4B, sin datos publicados).
- No se declaran capacidades de edición de imagen, inpainting, img2img, visión, audio ni modo de razonamiento.

## Casos de uso

- Investigación sobre entrenamiento eficiente en espacio de píxeles: el modelo se puede usar como referencia reproducible para estudiar si prescindir del VAE reduce el coste de entrenamiento sin degradar la calidad, gracias a que el código, el sampler y la pérdida de referencia son públicos.
- Ablaciones de pérdidas de alineación de representaciones: el repositorio incluye la implementación de referencia del adaptador PixelREPA, lo que permite reproducir y modificar la pérdida con un modelo ya entrenado.
- Banco de pruebas de samplers: con 50 pasos Euler, guiado proyectado adaptativo a escala 15 y una semilla fija, resulta adecuado para comparar variantes de muestreo sobre una línea base estable.
- Prototipado visual a 512×512 píxeles: para generar imágenes de referencia en estudios de diseño o presentaciones internas donde no se requiere un modelo post-entrenado, siempre que se asuma su carácter de vista previa de investigación.
- Inicialización para ajuste fino propio: al estar bajo Apache-2.0, un equipo puede partir de estos pesos para experimentar con su propio conjunto de datos de imagen y estilo, en lugar de entrenar desde cero 2,49 mil millones de parámetros.
- Evaluación de codificadores de texto para difusión: la receta concreta de Qwen3.5-4B (concatenación de las capas 7, 15 y 27) permite estudiar cómo afecta la representación textual a la fidelidad del prompt en modelos de píxeles.
- Estudio de la fidelidad al prompt en descripciones largas: el prompt de validación de entrenamiento está publicado, lo que facilita medir la degradación cuando se alarga o se acorta la descripción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de FID, CLIP score, ImageReward ni de benchmarks de texto a imagen en el modelo card. Tampoco aplican métricas de modelos de lenguaje como MMLU, HumanEval o GSM8K. La única comparación cuantitativa publicada es contra Linum v2, y procede del propio autor:

| Métrica | Linum v2 | JiT-DDT |
|---|---|---|
| Tipo de arquitectura | DiT en espacio latente + VAE | DiT en espacio de píxeles, sin VAE |
| Parametros | 2,0B | 2,49B |
| Resolucion | 256×256 | 512×512 |
| GPU-hours hasta calidad comparable | línea base | 3,6 veces menos |
| Muestras vistas hasta calidad comparable | línea base | 4,2 veces menos |

La comparación se ilustra con el mismo prompt en ambos modelos y se detalla en el blog post del autor. No hay métricas objetivas de calidad ni evaluación por terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: solo los pesos ocupan 9,95 GB en fp32. Sumando activaciones y el codificador de texto Qwen3.5-4B (unos 4B parámetros, aproximadamente 8 GB en bf16), la estimación razonable se sitúa en torno a 18-22 GB. Estimación propia a partir del tamaño declarado de los pesos; el modelo card no publica cifras de VRAM.
- GPU recomendadas: A100 (40 o 80 GB) y H100 ofrecen margen holgado y permiten mantener fp32 sin compromisos. Una RTX 4090 o RTX 3090 de 24 GB queda muy justa para la pareja modelo más codificador de texto.
- Cabe en GPU de consumo: previsiblemente sí en RTX 4090, RTX 3090 y RTX 5090 (24-32 GB), con margen escaso; en tarjetas de 16 GB o menos, no sin cuantización, y no hay cuantizaciones publicadas.
- Opciones de despliegue: el repositorio `github.com/Linum-AI/jit-ddt` proporciona `generate.py` y la API Python `JitDDT`, `QwenTextEncoder`, `SamplerConfig` y `generate`. No hay soporte declarado para vLLM, TGI, Ollama, llama.cpp ni Diffusers; esas herramientas no cubren de forma nativa el pipeline `jit-ddt`.
- Latencia y throughput: no disponibles. El modelo card no publica tiempos de inferencia por imagen ni imágenes por segundo.

## Comparativa con modelos similares

La información disponible solo permite comparar con la generación anterior del propio autor. No hay datos de terceros en la búsqueda web realizada.

| Modelo | Parametros | Resolucion | Espacio | Contexto / condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| JiT-DDT | 2,49B | 512×512 | Píxeles, sin VAE | Texto codificado con Qwen3.5-4B (capas 7/15/27) | Apache-2.0 | Pesos en HuggingFace, código y sampler en GitHub |
| Linum v2 | 2,0B | 256×256 | Latente, con VAE | No disponible | No disponible | No disponible |

Comparativa con otros modelos de difusión de tamaño similar (por ejemplo, alternativas en espacio latente con VAE): no disponible en la información proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un lanzamiento de modelo completo: fue entrenado con 138 millones de muestras y no ha recibido post-entrenamiento, por lo que su fidelidad al prompt y su calidad final quedan por debajo de lo esperable en un modelo afinado con RLHF o DPO.
- No se han publicado benchmarks objetivos, así que las afirmaciones de eficiencia (3,6 veces menos GPU-hours, 4,2 veces menos muestras) son medidas internas del autor y no una evaluación independiente.
- Los pesos deben conservarse en fp32 y ejecutarse con autocast bf16 según las instrucciones del autor; convertirlos a otros formatos o cuantizarlos puede alterar la calidad y no está documentado.
- Composición del dataset de entrenamiento no declarada, por lo que no se pueden evaluar sesgos de representación, y no se menciona ningún filtro de seguridad ni de contenido en la generación.
- Riesgo de generación no fiel al prompt o de artefactos visuales, especialmente en composiciones complejas, al no haber post-entrenamiento.
- Idiomas soportados no declarados: aunque el codificador sea Qwen3.5-4B, no hay garantía publicada sobre el comportamiento con descripciones en castellano.
- Capacidades limitadas al texto a imagen: no hay img2img, inpainting, edición, tool calling ni uso como agente.
- Adopción muy baja en el momento de la ficha (7 descargas y 0 likes), lo que implica poca validación por parte de la comunidad y escaso soporte de terceros.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificaciones, con obligación de conservar los avisos de copyright y licencia; aun así, el propio autor lo describe como vista previa de investigación y no como producto listo para producción.
- Nota de procedencia: el modelo card y el repositorio fueron redactados por un modelo de lenguaje (Claude, en Claude Code) a petición de Linum, que revisó la publicación. Conviene verificar las afirmaciones técnicas contra el código antes de basar en ellas un despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Linum-AI/jit-ddt
- Repositorio de código, sampler, pérdida de referencia e inferencia: https://github.com/Linum-AI/jit-ddt
- Blog post del autor, «Training Text-to-Image Models 3.6x Faster»: https://www.linum.ai/field-notes/jit-ddt
- Codificador de texto empleado: https://huggingface.co/Qwen/Qwen3.5-4B
- Búsqueda web realizada: no se ha encontrado ningún enlace relevante sobre el modelo. Los resultados devueltos corresponden a empresas homónimas de mobiliario, climatización y diseño (linum.eu, linumdesign.com, linumgroup.eu) y no guardan relación con Linum-AI ni con JiT-DDT.
