# croqaz/Piston-and-Prose-sm

## Resumen

Piston-and-Prose-sm es un modelo de lenguaje pequeño de 75 millones de parámetros (0,07 B) desarrollado por un único aficionado bajo el alias «croqaz», como proyecto personal entrenado en una GPU de consumo de gama media. Está basado en la arquitectura Llama (transformer decoder-only) y ofrece una ventana de contexto de 1024 tokens. Se trata de un modelo base, sin alineamiento para chat ni instrucciones, orientado a la generación de texto en inglés con un estilo que combina prosa y poesía vintage.

El modelo fue entrenado durante 110 horas y 92 000 pasos sobre un total de 24,12 mil millones de tokens (60 % de una época). Su principal interés radica en que es un ejemplo de entrenamiento eficiente con recursos limitados, e introduce mejoras técnicas frente a su predecesor Sprocket-and-Say: un tokenizador mejorado y una reducción de las cabezas KV de 4 a 2. Fue publicado en 2026 y carece de benchmarks publicados, por lo que su rendimiento debe evaluarse de forma experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder-only) |
| Parametros totales | 75 M (0,07 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura Llama transformer decoder-only estándar, con 75 millones de parámetros y una ventana de contexto de 1024 tokens. Frente a la versión anterior Sprocket-and-Say, se ha sustituido el tokenizador por uno nuevo y se han reducido las cabezas KV de 4 a 2, lo que disminuye el coste de memoria durante la inferencia y la generación.

El entrenamiento se realizó durante 110 horas y 92 000 pasos sobre un conjunto de datos de 24,12 mil millones de tokens, lo que representa el 60 % de una época. Los datos proceden de la combinación de varios corpus: una versión extendida del dataset Sprocket-n-Say (ampliado de 15 millones de filas y 16,7 mil millones de tokens a 49 millones de filas y 40,3 mil millones de tokens), el dataset Synthetic-archive y Tiny-vintage-completions, además de textos de Authorama.com, Archive.org y Gutenberg procesados de nuevo. No se menciona el uso de RLHF ni de DPO, ya que es un modelo base sin alineamiento.

## Capacidades

- Generacion de texto libre en ingles, especialmente en formato de prosa y poesia con estilo vintage.
- Modelo base: no incluye sistemas de chat, instrucciones ni alineamiento para dialogos.
- No soporta tool calling, function calling ni arquitecturas de agentes.
- No dispone de capacidades de vision, audio ni multimodalidad.
- Generacion autoregresiva de completions para entradas de hasta 1024 tokens.
- Gracias a su tamano reducido, es facilmente reentrenable o ajustable para tareas sencillas de texto.

## Casos de uso

- Generacion de poesia y prosa creativa: puede usarse como asistente de escritura para producir versos o parrafos cortos en ingles. Su sesgo vintage lo hace adecuado para textos que evocan epocas pasadas; se emplea mediante prompts de completions.
- Autocompletado de texto en editores: integrarlo en un editor o entorno de desarrollo como motor de autocompletado para frases en ingles. Su rapidez de inferencia permite sugerencias en tiempo real, con la limitacion de su ventana de 1024 tokens.
- Narrativa interactiva en juegos: en prototipos de juegos de texto, puede generar descripciones de escenas o intervenciones del narrador. Al ser un modelo ligero, se ejecuta en bucle de juego con una GPU o incluso en CPU.
- Generacion de datos sinteticos para ajuste fino: puede producir compilaciones de completions en ingles para entrenar modelos mas grandes o de destilacion. El propio autor utilizo datasets sinteticos para este modelo, lo que valida este enfoque.
- Educacion y experimentacion: es util para ensenar el funcionamiento interno de un transformer pequeno, ya que su estructura es sencilla de inspeccionar y modificar, y el reentrenamiento es viable en una GPU domestica.
- Pruebas de pipelines de generacion: sirve como modelo de humo para validar infraestructuras como Transformers o HuggingFace Inference Endpoints antes de desplegar modelos mayores, gracias a su bajo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. En la model card el autor indica que las evaluaciones propias muestran una mejora general frente a Sprocket-and-Say, pero no se aportan cifras concretas ni tablas comparativas.

## Requisitos de hardware

- VRAM estimada: menos de 2 GB para inferencia en precision fp16, ya que el peso ronda los 150 MB. El repositorio ocupa 1,2 GB, lo que sugiere la inclusion de variantes o archivos adicionales.
- GPU recomendada: cualquier GPU NVIDIA de consumo con al menos 4 GB de VRAM, como una RTX 2060 o superior. Tambien puede ejecutarse en CPU sin problemas.
- Cabe en GPU de consumo, incluidas GPUs antiguas o integradas, especialmente si se aplica cuantizacion.
- Opciones de despliegue: HuggingFace Transformers, HuggingFace Inference Endpoints (el tag `endpoints_compatible` lo confirma), y conversion a GGUF para ejecutarse con llama.cpp.
- Latencia y throughput: no disponible. Por su tamano, se espera una inferencia casi instantanea en GPU y un rendimiento muy alto en CPU.

## Comparativa con modelos similares

No disponible. En la informacion proporcionada no se incluyen datos de otros modelos comparables de 75 M. Se menciona el modelo hermano `croqaz/Piston-and-Prose-lg`, pero no se especifican sus parametros ni benchmarks, por lo que no es posible realizar una comparacion tecnica.

## Limitaciones y advertencias

- Es un modelo base: no esta alineado para seguir instrucciones ni mantener conversaciones coherentes.
- Ventana de contexto limitada a 1024 tokens, lo que impide el manejo de documentos largos o conversaciones extensas.
- Soporta exclusivamente el idioma ingles.
- No soporta tool calling, vision ni audio.
- Riesgo de alucinacion y de generacion de contenido factual incorrecto, al tratarse de un modelo pequeno sin sistema de verificación de hechos.
- Los corpus de entrenamiento incluyen textos vintage de Gutenberg, Archive.org y Authorama, lo que puede introducir sesgos historicos de genero, raza o clase social.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye como proyecto hobby, sin garantias ni soporte.
- No se han publicado evaluaciones formales ni benchmarks externos, por lo que la calidad real frente a otros modelos de tamano similar es desconocida.

## Enlaces

- HuggingFace: https://huggingface.co/croqaz/Piston-and-Prose-sm
- Modelo hermano (mencionado en la model card): https://huggingface.co/croqaz/Piston-and-Prose-lg
- Dataset Sprocket-n-Say: https://huggingface.co/datasets/croqaz/Sprocket-n-Say
- Dataset Synthetic-archive: https://huggingface.co/datasets/croqaz/Synthetic-archive
- Dataset Tiny-vintage-completions: https://huggingface.co/datasets/croqaz/tiny-vintage-completions
