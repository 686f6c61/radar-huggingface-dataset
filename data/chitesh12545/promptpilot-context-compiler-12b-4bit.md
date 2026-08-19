# chitesh12545/PromptPilot-Context-Compiler-12B-4bit

## Resumen

PromptPilot-Context-Compiler-12B-4bit es un modelo de lenguaje cuantizado a 4 bits en formato MLX, publicado por el usuario chitesh12545 como parte del ecosistema PromptPilot. Se basa en el modelo mlx-community/gemma-4-12b-coder-fable5-composer2.5-4bit, una variante de la familia Gemma-4 especializada en generacion de codigo y razonamiento. Su funcion principal es actuar como capa de control para agentes de codificacion basados en IA: convierte instrucciones aproximadas en briefs claros y acotados antes de que un modelo frontier (como Codex o Claude Code) los procese, reduciendo el consumo de tokens en ambiguedad, historial repetido y salidas de herramientas ruidosas.

El modelo aborda el problema del despilfarro de contexto en agentes de codificacion: en lugar de enviar directamente las instrucciones del usuario al modelo frontier, un modelo pequeno y economico como este las compila, clarifica y comprime. Con licencia Apache 2.0, es de uso libre incluso para aplicaciones comerciales. La cuantizacion a 4 bits permite ejecutarlo en hardware modesto, aunque el formato MLX esta optimizado principalmente para Apple Silicon.

Cabe destacar una discrepancia significativa: los metadatos safetensors indican 1.861.173.040 parametros (~1,86 mil millones), mientras que el nombre del modelo sugiere 12 mil millones. El tamano del repositorio (6,7 GB) es consistente con un modelo de 12B cuantizado a 4 bits, por lo que la cifra de safetensors podria ser parcial o incorrecta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma-4), cuantizado a 4 bits |
| Parametros totales | 1.861.173.040 (segun metadatos safetensors); el nombre indica 12B — discrepancia por resolver |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma-4, una familia de transformers decoder-only desarrollada por Google, con una variante especializada en codigo ("coder") que incorpora capacidades de razonamiento y "thinking". El modelo base es mlx-community/gemma-4-12b-coder-fable5-composer2.5-4bit, que a su vez es una cuantizacion a 4 bits en formato MLX de un modelo Gemma-4-12B adaptado con las tecnicas "fable5" y "composer2.5" (posiblemente metodos de fine-tuning o composicion de adaptadores, aunque no se dispone de detalles tecnicos publicos).

El proceso de entrenamiento especifico de esta variante no esta documentado en la informacion disponible. Dado que se trata de una cuantizacion MLX, no se realizo un entrenamiento adicional sino una conversion de pesos a precision de 4 bits, lo que reduce el uso de memoria a costa de una ligera perdida de calidad. El modelo hereda las capacidades del modelo base para generacion de codigo, razonamiento y conversacion, y esta orientado al caso de uso de compilacion de contexto para agentes de codificacion.

## Capacidades

- Generacion de codigo: especializado en tareas de programacion gracias a su base Gemma-4 coder.
- Razonamiento y pensamiento: incluye capacidades de "thinking" (modo de razonamiento) segun las etiquetas del modelo.
- Compilacion de contexto: puede convertir instrucciones aproximadas en briefs estructurados y acotados para agentes de codificacion, reduciendo el consumo de tokens.
- Compresion de historial: capaz de resumir y comprimir conversaciones largas y salidas de herramientas para preservar el contexto relevante.
- Conversacion multi-turno: soporta interacciones dialogadas gracias a su arquitectura de generacion de texto.
- Capacidades multimodales potenciales: las etiquetas "gemma4_unified" e "image-text-to-text" sugieren que el modelo base podria manejar entradas de imagen y texto, aunque el pipeline declarado es solo text-generation.

## Casos de uso

- Capa de control para agentes de codificacion: el modelo se situa entre el usuario y un agente frontier (Codex, Claude Code). Recibe la instruccion bruta y genera un brief claro con restricciones, evitando que el modelo grande consuma tokens en aclarar ambiguedades.
- Compresion de contexto en sesiones largas: en sesiones de desarrollo prolongadas, el modelo puede resumir el historial de conversacion y las salidas de herramientas para mantener el contexto relevante sin exceder la ventana del modelo principal.
- Generacion de codigo asistida: como modelo de 12B cuantizado, puede generar fragmentos de codigo directamente en entornos con recursos limitados, sin depender de APIs externas.
- Razonamiento estructurado: para tareas de planificacion de tareas de desarrollo, el modelo puede descomponer problemas complejos en pasos logicos antes de pasarlos al modelo principal.
- Filtrado de ruido en salidas de herramientas: el modelo puede procesar y limpiar la salida de herramientas de desarrollo (linters, compiladores, tests) para extraer solo la informacion relevante.
- Desarrollo en entornos Apple Silicon: gracias a su formato MLX, el modelo se ejecuta eficientemente en Macs con chip Apple, permitiendo desarrollo local de agentes de codificacion sin conexion a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no presenta datos de evaluacion en MMLU, HumanEval, GSM8K ni otros benchmarks estandar. La ausencia de descargas y de comunidad en torno al repositorio sugiere que se trata de un experimento personal sin validacion publica.

## Requisitos de hardware

- VRAM estimada: el tamano del repositorio es de 6,7 GB, por lo que se necesitan al menos 8 GB de memoria unificada para cargar el modelo en Apple Silicon, y 16 GB recomendados para operar con margen para cache de atencion y activaciones.
- GPU recomendadas: cualquier Apple Silicon con 16 GB o mas de memoria unificada (M1 Pro/Max, M2 Pro/Max, M3, M4). No esta optimizado para GPU NVIDIA.
- Compatibilidad con GPU de consumo: no directamente; el formato MLX requiere Apple Silicon. Para GPU NVIDIA habria que convertir los pesos a otro formato (GGUF, GPTQ, etc.).
- Opciones de despliegue: MLX (Apple), transformers (con conversion previa), posiblemente llama.cpp si se convierten los pesos a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa con modelos alternativos. El modelo comparte categoria con otros SLMs (small language models) usados como capa de control para agentes de codificacion, como los descritos en el proyecto PromptPilot original (GitHub: steyangdot/PromptPilot). La alternativa mas directa seria el modelo base sin cuantizar (gemma-4-12b-coder-fable5-composer2.5), que ofreceria mayor precision a cambio de un mayor consumo de memoria. No hay datos publicos de rendimiento relativo con otros modelos de la misma categoria.

## Limitaciones y advertencias

- Discrepancia en el numero de parametros: los metadatos safetensors indican ~1,86B parametros, mientras que el nombre del modelo sugiere 12B. Esta inconsistencia debe resolverse antes de usar el modelo en produccion.
- Sin validacion publica: el repositorio tiene 0 descargas y 0 likes; no hay evidencia de que el modelo haya sido probado por terceros.
- Sin datos de benchmarks: no se puede evaluar la calidad real del modelo frente a alternativas.
- Cuantizacion a 4 bits: puede degradar la calidad de generacion, especialmente en tareas de razonamiento complejo.
- Formato MLX: limitado a Apple Silicon; requiere conversion para otros entornos.
- Sin informacion sobre el dataset de entrenamiento ni el proceso de fine-tuning del modelo base.
- Capacidades multimodales inciertas: aunque las etiquetas sugieren soporte imagen-texto, el pipeline declarado es solo text-generation.
- Idiomas soportados no documentados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/chitesh12545/PromptPilot-Context-Compiler-12B-4bit
- Proyecto PromptPilot (GitHub): https://github.com/steyangdot/PromptPilot
- Documentacion de PromptPilot: https://github.com/steyangdot/PromptPilot/tree/main/docs
- Sitio web de PromptPilot: https://www.prompt-pilot.ai/
- Extension PromptPilot para Chrome: https://chromewebstore.google.com/detail/promptpilot-%E2%80%94-prompt-enha/ooidoofmjnfjcebndiflpldgcphdidkn
