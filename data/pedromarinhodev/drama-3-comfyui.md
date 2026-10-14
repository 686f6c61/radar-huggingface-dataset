# PedroMarinhoDev/Drama-3-ComfyUI

## Resumen

Drama-3-ComfyUI es una conversión de pesos del modelo de texto a voz Drama 3 de Fish Audio, empaquetada por PedroMarinhoDev para funcionar con los nodos nativos de su extensión ComfyUI-Drama3. Se trata de un modelo de 35.000 millones de parámetros orientado a síntesis de voz, clonación de voz, diálogo multi-hablante y control de matices mediante indicaciones en línea como `[sighs]`, `[whispers]` o `[pause]`. Su rasgo diferencial es que está diseñado para ejecutarse en GPU con tan solo 8 GB de VRAM.

El modelo emplea una arquitectura de mezcla de expertos (MoE) en la que aproximadamente el 90 % de los parámetros son expertos enrutados. Cada frame de audio activa únicamente 8 de los 256 expertos de una capa, de modo que los nodos mantienen la mayor parte de los expertos en la RAM del sistema y solo cachean en la GPU los que están en uso. El códec de audio es un componente separado del modelo principal.

La relevancia de esta ficha radica en que permite ejecutar un modelo TTS de 35B en hardware de gama de consumo, a cambio de requerir entre 32 y 48 GB de RAM del sistema según la cuantización elegida. La conversión conserva los pesos de expertos originales de Fish Audio en FP8 byte a byte junto a las capas bf16 del checkpoint, y ofrece tres variantes cuantizadas para adaptarse a distintos presupuestos de memoria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) para texto a voz; códec de audio separado |
| Parametros totales | 35B |
| Parametros activos | No disponible de forma explicita; la model card indica que cada frame de audio usa 8 de los 256 expertos de una capa y que el 90 % del modelo son expertos enrutados |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 en expertos (pesos originales), W6A8 y W4A8 en expertos; capas del checkpoint en bf16; códec en fp32 |
| Idiomas soportados | No disponible de forma oficial; la model card incluye muestras en ingles y portugues |
| Licencia | Fish Audio Community License (`license: other`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Drama 3 es un modelo de texto a voz construido sobre una arquitectura de mezcla de expertos, en la que en torno al 90 % de los parámetros corresponden a expertos enrutados. El enrutado es disperso: para cada frame de audio se activan 8 expertos de los 256 disponibles en una capa. Esta dispersión es la que permite que el modelo completo de 35B resida mayoritariamente en RAM y que la GPU solo mantenga una caché de los expertos en uso, reduciendo el requisito de VRAM a partir de 8 GB. El sistema se complementa con un códec de audio independiente que se distribuye como archivo aparte.

Esta ficha corresponde a una conversión de pesos, no a un modelo entrenado desde cero. PedroMarinhoDev ha reempaquetado los pesos de `fishaudio/drama-3` para los nodos nativos de ComfyUI-Drama3, manteniendo los expertos en FP8 tal y como los distribuye Fish Audio y las capas del checkpoint en bf16. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de ajuste como RLHF o DPO, ya que esos datos no aparecen en la información proporcionada.

## Capacidades

- Generación de voz a partir de texto (text-to-speech) con voces inventadas desde el propio prompt, sin necesidad de una referencia de audio.
- Clonación de voz a partir de un clip corto: la model card muestra la clonación de una voz creada por el propio modelo a partir de una única línea.
- Diálogo multi-hablante mediante etiquetas como `<|speaker:0|>` y `<|speaker:1|>`, con reparto automático de voces cuando no se proporcionan referencias (el ejemplo incluye cinco hablantes).
- Control de matices mediante indicaciones en línea: `[sighs]`, `[whispers]`, `[pause]`, `[laughs]`, `[singing]`, además de indicaciones descriptivas del estilo, como `[dramatic dungeon master]` o `[brave, too loud]`.
- Canto, con indicaciones como `[singing, grand operatic]` y variaciones de intensidad.
- Etiquetado de idioma en la propia indicación, por ejemplo `[Brazilian football fan, building tension, Portuguese]`.
- Transcripción de audio mediante el modelo complementario Qwen3-ASR-ComfyUI, distribuido por el mismo autor para generar transcripciones.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo especializado en audio.

## Casos de uso

- Doblaje y localización de contenido: el modelo permite generar voces consistentes para un mismo personaje a lo largo de distintos fragmentos, con control del idioma mediante etiquetas y matices mediante indicaciones en línea, lo que facilita adaptar guiones a otros idiomas manteniendo la interpretación.
- Producción de audiolibros y ficción sonora: con clonación de voz y diálogo multi-hablante, un único narrador o varios personajes pueden reproducirse con voces diferenciadas, y las indicaciones de `[whispers]` o `[pause]` permiten marcar la dramatización directamente en el texto.
- Generación de voces para videojuegos y campañas de rol: el ejemplo de cinco hablantes muestra que el modelo puede repartir voces de forma automática, útil para prototipar NPC o campañas de mesa sin contratar actores de voz en fases tempranas.
- Accesibilidad y lectura de textos: conversión de documentos largos a audio con control de pausas y énfasis, aprovechando el códec separado y el flujo de trabajo de ComfyUI para automatizar la generación por lotes.
- Prototipado rápido de personajes en pipelines creativos: al integrarse como nodos de ComfyUI v0.40 o superior sin necesidad de `pip install`, se puede insertar en grafos existentes de generación de imagen o vídeo para producir bandas sonoras o voces de forma iterativa.
- Investigación en síntesis de voz: las tres variantes de cuantización (FP8, W6A8 y W4A8) permiten estudiar el impacto de la compresión de expertos en la calidad y la estabilidad de la generación, comparando los pesos originales con versiones más agresivas.
- Generación de voces sintéticas para previsualización de guiones: sustituir lecturas de mesa por voces generadas antes de la grabación final, reduciendo costes de producción en fases de validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas como MOS, WER, similitud de hablante ni comparaciones numéricas con otros sistemas TTS. La única información cualitativa aportada es que la variante W4A8 «falls silent more often with real voice clips» (se queda en silencio con más frecuencia al usar clips de voz reales) y que W6A8 no presentó tomas en silencio en 16 pruebas de clonación.

## Requisitos de hardware

- VRAM: el autor indica un mínimo de 8 GB, ya que los expertos se mantienen en RAM del sistema y solo se cachea en la GPU la parte activa.
- RAM del sistema: entre 32 y 48 GB según el archivo. FP8 requiere aproximadamente 48 GB, W6A8 unos 40 GB y W4A8 unos 32 GB.
- Almacenamiento: el repositorio completo ocupa 97,4 GB; el archivo FP8 pesa 38,6 GB, W6A8 32,7 GB, W4A8 24,6 GB y el códec 1,6 GB. Hay que descargar además el códec en todos los casos.
- GPU recomendadas: no disponible. La model card no enumera modelos concretos de GPU, solo el umbral de 8 GB de VRAM.
- Compatibilidad con GPU de consumo: sí, según el autor, en tarjetas desde 8 GB de VRAM, siempre que el sistema disponga de la RAM indicada.
- Opciones de despliegue: nodos personalizados de ComfyUI (ComfyUI-Drama3, requiere ComfyUI v0.40 o superior, sin `pip install`) y descarga mediante la CLI `hf download`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de otros modelos TTS en la información proporcionada, por lo que la comparación se limita a las variantes incluidas en este repositorio y al modelo base.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fishaudio/drama-3 (original) | 35B | No disponible | Pesos originales de Fish Audio | Fish Audio Community License | HuggingFace |
| Drama-3-ComfyUI FP8 | 35B | No disponible | Expertos FP8 originales + capas bf16 | Fish Audio Community License | HuggingFace (38,6 GB) |
| Drama-3-ComfyUI W6A8 | 35B | No disponible | Expertos W6A8 + capas bf16 | Fish Audio Community License | HuggingFace (32,7 GB) |
| Drama-3-ComfyUI W4A8 | 35B | No disponible | Expertos W4A8 + capas bf16 | Fish Audio Community License | HuggingFace (24,6 GB) |
| Otros modelos TTS open source (XTTS, F5-TTS y similares) | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- La licencia es la Fish Audio Community License, no una licencia de código abierto estándar. Es imprescindible revisar los términos del archivo LICENSE antes de cualquier uso comercial, ya que la información disponible no detalla las condiciones.
- La variante W4A8 puede quedarse en silencio con más frecuencia al clonar voces reales, según advierte el propio autor; W6A8 no presentó ese problema en 16 pruebas de clonación, pero se trata de una muestra reducida.
- No hay benchmarks publicados, por lo que la calidad objetiva del modelo en términos de naturalidad, inteligibilidad o similitud de hablante no está cuantificada.
- Los idiomas soportados no están documentados oficialmente; solo se han verificado muestras en inglés y portugués, por lo que el comportamiento en castellano u otros idiomas no está garantizado.
- La ficha no incluye información sobre sesgos, alucinaciones ni estabilidad a lo largo de generaciones largas.
- La clonación de voz plantea riesgos éticos y legales evidentes: es necesario contar con consentimiento explícito de la persona cuya voz se clona y cumplir la normativa aplicable sobre datos biométricos y derechos de imagen.
- El despliegue depende de ComfyUI v0.40 o superior y de nodos personalizados; no es un modelo que se pueda servir directamente con motores de inferencia convencionales como vLLM o TGI según la información disponible.
- El consumo de recursos es elevado en RAM de sistema (hasta 48 GB en la variante FP8), lo que puede superar la capacidad de muchas estaciones de trabajo.
- El repositorio ocupa 97,4 GB, un coste de almacenamiento considerable si se descargan todas las variantes.
- Este repositorio es una conversión de pesos con 0 descargas y 0 likes en el momento de la consulta; conviene verificar su mantenimiento y contrastar con el repositorio original `fishaudio/drama-3`.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/PedroMarinhoDev/Drama-3-ComfyUI
- Modelo base original: https://huggingface.co/fishaudio/drama-3
- Nodos en GitHub: https://github.com/PedroMarinhoDev/ComfyUI-Drama3
- Página de muestras: https://pedromarinhodev.github.io/ComfyUI-Drama3/
- Modelo complementario de transcripción (Qwen3-ASR): https://huggingface.co/PedroMarinhoDev/Qwen3-ASR-ComfyUI
