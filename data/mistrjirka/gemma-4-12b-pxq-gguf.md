# mistrjirka/Gemma-4-12B-PXQ-GGUF

## Resumen

La presente ficha documenta el repositorio `mistrjirka/Gemma-4-12B-PXQ-GGUF`, creado el 8 de septiembre de 2026 con el objetivo declarado de publicar cuantizaciones GGUF del modelo `google/gemma-4-12B` utilizando el codec PXA/PXQ. Sin embargo, en el momento de redactar esta ficha, el repositorio no contiene ningún fichero verificado: la tabla de ficheros disponibles aparece vacía (`_none verified yet_`) y las métricas de descargas y likes son ambas cero. Esto implica que no existe un modelo descargable ni un artefacto utilizable en este repositorio.

El modelo base, `google/gemma-4-12B`, pertenece a la familia Gemma 4 de Google DeepMind. Según la ficha oficial, es un modelo abierto multimodal que procesa texto, audio, imagen y vídeo de forma nativa, sin necesidad de codificadores separados. La cuantización PXQ es un codec experimental de compresión de tensores desarrollado en el repositorio `poisonxa16/pxa`; requiere una compilación PXA/PXQ específica y no es compatible con las builds estándar de llama.cpp.

Esta ficha resume lo que se sabe del intento de cuantización y del modelo base, marcando explícitamente la ausencia de ficheros publicados.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformador multimodal (texto, audio, imagen, vídeo) según la ficha del modelo base `google/gemma-4-12B`; la arquitectura interna del artefacto cuantizado no ha sido documentada explícitamente |
| Parámetros totales | 12.000 millones (12B), según el nombre del modelo base |
| Parámetros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | PXQ2, PXQ3, PXQ4, PXQ4-HQ y PXQ6; PXQ1 solo se publica si PXA emite tensores PXQ1 para esta arquitectura. Los tensores sensibles pueden permanecer en Q6_K, Q8_0, F16 o F32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF con tensores PXQ; requiere una compilación con soporte PXA/PXQ |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-12B` es un modelo unificado multimodal que, según la documentación de Google, acepta entradas de texto, audio, imagen y vídeo de forma nativa. No se proporcionan detalles de la arquitectura interna (número de capas, dimensiones, mecanismo de atención, etc.) en la información disponible. El repositorio `mistrjirka/Gemma-4-12B-PXQ-GGUF` no realiza ningún entrenamiento: aplica un proceso de cuantización basado en el codec PXA/PXQ.

El autor describe un pipeline de validación en siete pasos: dry-run, cuantización completa, reapertura del GGUF y recuento de tipos de tensores, cálculo del SHA256, subida a Hugging Face, verificación remota del tamaño y del SHA256, y eliminación local del fichero cuantizado solo tras la verificación remota. La revisión de PXA utilizada es `25d34eeab1a418fd21411158400a40d057ab063f`. Según la model card, el codec bpw describe los tensores PXQ, no necesariamente el bpw efectivo del fichero completo: los tensores sensibles o estructuralmente inadecuados pueden mantenerse deliberadamente en formatos de mayor precisión como Q6_K, Q8_0, F16/F32.

## Capacidades

- Este repositorio no publica ficheros en el momento de la consulta, por lo que no puede evaluarse ninguna capacidad del artefacto cuantizado.
- El modelo base `google/gemma-4-12B` ofrece capacidades multimodales declaradas: entrada de texto, audio, imagen y vídeo de forma nativa.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- No se indican modos especiales de razonamiento (thinking mode) ni otras capacidades adicionales.

## Casos de uso

Este repositorio no es utilizable actualmente, ya que no contiene ficheros de modelo verificados. Los siguientes casos de uso son hipotéticos y se basan en las capacidades declaradas del modelo base `google/gemma-4-12B`, no en el artefacto cuantizado. Si el repositorio llegara a publicar los ficheros PXQ, podrían plantearse:

- Análisis multimodal de documentos: el modelo base acepta texto, imagen, audio y vídeo, lo que permitiría procesar informes escaneados, correos con adjuntos y notas de voz en un entorno local sin conexión a servicios en la nube.
- Asistentes locales de voz: la entrada de audio nativa permitiría construir asistentes conversacionales que no dependen de APIs externas, reduciendo costes y latencia.
- Descripción de imágenes y vídeo en tiempo real: aplicaciones de visión artificial para entornos locales, por ejemplo en sistemas de vigilancia o en herramientas de accesibilidad.
- Despliegue en GPU con VRAM limitada: el formato GGUF con cuantización PXQ podría permitir ejecutar un modelo de 12B en hardware de gama media, aunque requiere una compilación PXA personalizada.
- Investigación en compresión de modelos: la pipeline de cuantización documentada servirá como caso de estudio para investigadores interesados en codecs de tensores como PXQ.
- Pruebas de compatibilidad de builds PXA/PXQ: los desarrolladores que experimentan con el repositorio `poisonxa16/pxa` podrían usar este repositorio para verificar que sus compilaciones cargan e interpretan correctamente los tensores PXQ.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No disponible. El repositorio no contiene ficheros publicados que permitan estimar requisitos reales de VRAM, GPU o latencia. No se indica ningún dato sobre el despliegue en vLLM, llama.cpp, Ollama o TGI. Cabe señalar que, al tratarse de una cuantización GGUF, se esperaría compatibilidad con motores como llama.cpp (siempre que compilen con soporte PXA/PXQ), pero ninguno de estos datos está confirmado en la información proporcionada.

## Comparativa con modelos similares

En la información proporcionada no se dispone de datos comparativos de benchmarks. El único punto de referencia es el modelo base `google/gemma-4-12B`, cuya ficha puede consultarse en Hugging Face. Otras cuantizaciones GGUF del mismo modelo base, generadas con herramientas estándar como llama.cpp, serían la alternativa típica, pero no se aportan datos concretos en la búsqueda realizada.

| Modelo | Parámetros | Contexto | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|
| google/gemma-4-12B | 12B | no disponible | Apache 2.0 | Pesos originales (no cuantizados) | Modelo base multimodal |
| mistrjirka/Gemma-4-12B-PXQ-GGUF | 12B | no disponible | Apache 2.0 | GGUF con tensores PXQ | Sin ficheros publicados verificados |
| Cuantizaciones GGUF estándar (llama.cpp) | 12B | no disponible | Apache 2.0 | GGUF (Q4_K_M, Q6_K, etc.) | Alternativa común, no documentada en esta fuente |

## Limitaciones y advertencias

- El repositorio no contiene ficheros de modelo verificados. Cualquier intento de descarga o uso directo fallará.
- El formato PXQ requiere una compilación PXA/PXQ específica. Las builds estándar de llama.cpp no cargarán estos tensores.
- El codec PXQ es una tecnología experimental; no se garantiza su mantenimiento, estabilidad ni compatibilidad a largo plazo.
- Las métricas de descargas y likes son cero, lo que indica que no existe validación por parte de la comunidad.
- No se aportan datos sobre sesgos, riesgos de alucinación ni restricciones de uso para el artefacto cuantizado. Cualquier evaluación de seguridad debería realizarse sobre el modelo base.
- La model card no detalla los idiomas soportados ni la longitud de contexto, por lo que no es posible valorar su adecuación para tareas multilingües o de contexto largo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mistrjirka/Gemma-4-12B-PXQ-GGUF
- Modelo base en Hugging Face: https://huggingface.co/google/gemma-4-12B
- Repositorio PXA: https://github.com/poisonxa16/pxa
- Página oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
