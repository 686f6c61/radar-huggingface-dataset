# altic-dev/Fluid-1-Pico-0.8B-MLX-6bit

## Resumen

Fluid-1 Pico 0.8B es un modelo de lenguaje de 131 millones de parámetros desarrollado por altic-dev, presentado como un artefacto oficial en formato MLX para la limpieza de dictados por voz (FluidVoice) en dispositivos. Se trata de una versión cuantizada a 6 bits del modelo base Qwen/Qwen3.5-0.8B, adaptada para ejecución on-device mediante el framework MLX de Apple. El modelo está pensado exclusivamente para su uso dentro de las aplicaciones FluidVoice oficiales, con una licencia que prohíbe cualquier otro uso.

La relevancia de este modelo radica en su tamaño reducido (0.8B) y su cuantización a 6 bits, lo que permite su despliegue en entornos con recursos limitados, como teléfonos móviles o dispositivos Apple con Neural Engine. Sin embargo, su licencia restrictiva limita su aplicabilidad a un ecosistema cerrado. No se dispone de información pública sobre la longitud de contexto, los idiomas soportados ni los detalles de entrenamiento más allá de su derivación de Qwen3.5-0.8B.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen3.5-0.8B) |
| Parametros totales | 131.371.840 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6-bit (MLX) |
| Idiomas soportados | no disponible |
| Licencia | altic-fluidvoice-apps-only (uso exclusivo en aplicaciones FluidVoice) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura interna del modelo más allá de su origen: es una adaptación cuantizada de Qwen3.5-0.8B, un modelo de la familia Qwen. La cuantización a 6 bits se ha realizado en formato MLX, lo que indica un enfoque en eficiencia para hardware Apple. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO. El propósito declarado es la limpieza de dictados por voz (FluidVoice), lo que sugiere un ajuste fino orientado a tareas de corrección y formateo de transcripciones, aunque no se especifican los detalles del proceso.

## Capacidades

- Generación de texto: al estar basado en Qwen3.5-0.8B, se espera que herede capacidades básicas de generación de lenguaje, aunque no se documentan explícitamente.
- Limpieza de dictados: el modelo está diseñado específicamente para procesar transcripciones de voz, corrigiendo errores, puntuación y formato (según la descripción de FluidVoice).
- Conversación: el tag "conversational" sugiere capacidad para mantener diálogos, pero no se aportan más detalles.
- Ejecución on-device: gracias a la cuantización MLX 6-bit, está optimizado para funcionar en dispositivos Apple con recursos limitados.
- No se mencionan capacidades de tool calling, agentes, visión, audio ni razonamiento multi-paso.

## Casos de uso

- Limpieza de transcripciones de dictado por voz: el modelo recibe texto transcrito automáticamente y lo corrige (ortografía, puntuación, mayúsculas) para producir una versión limpia y legible. Es el caso de uso principal declarado por el autor.
- Formateo de notas de voz: dentro de una aplicación FluidVoice, el modelo puede convertir notas dictadas en texto estructurado, con párrafos y listas, facilitando su posterior edición.
- Corrección de errores de reconocimiento de voz: al estar entrenado para dictado, puede identificar y corregir errores típicos de los sistemas ASR (reconocimiento automático del habla).
- Asistente de redacción por voz: el usuario dicta un mensaje o documento y el modelo lo refina antes de enviarlo, mejorando la claridad y el estilo.
- Transcripción de reuniones: en una aplicación FluidVoice, el modelo puede procesar transcripciones largas para eliminar muletillas, repeticiones y ruido conversacional.
- Accesibilidad: personas con dificultades para escribir pueden dictar y obtener texto corregido automáticamente, mejorando la usabilidad en entornos móviles.

Nota: todos estos casos de uso están condicionados a la licencia, que solo permite su empleo dentro de aplicaciones FluidVoice oficiales. Cualquier otro uso está prohibido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se proporcionan requisitos específicos de VRAM ni de GPU en la documentación.
- Al ser un modelo de 131M parámetros cuantizado a 6 bits, el tamaño del repositorio es de 0.5 GB, lo que sugiere que puede ejecutarse en dispositivos con poca memoria, como teléfonos móviles o portátiles con Apple Silicon.
- El formato MLX indica que está optimizado para el ecosistema de Apple (chips M1/M2/M3 y Neural Engine), aunque no se confirma oficialmente.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama; el formato MLX sugiere el uso del framework MLX de Apple.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, y la licencia restrictiva impide comparaciones de uso general.

## Limitaciones y advertencias

- Licencia extremadamente restrictiva: el uso está permitido únicamente a través de aplicaciones FluidVoice oficiales. Cualquier uso fuera de estas aplicaciones está prohibido, lo que limita su adopción en proyectos independientes o de investigación.
- Derivado de Qwen3.5-0.8B: aunque los componentes Qwen se mantienen bajo Apache 2.0, la licencia global del modelo es "altic-fluidvoice-apps-only", lo que puede generar ambigüedad legal si se intenta reutilizar el modelo.
- Sin información sobre sesgos: al no documentarse el proceso de entrenamiento ni los datos utilizados, no se pueden evaluar posibles sesgos heredados de Qwen o introducidos en el ajuste fino.
- Riesgo de alucinación: no se especifica, pero al ser un modelo pequeño (0.8B), es probable que presente limitaciones en tareas complejas de razonamiento o generación de hechos.
- Idiomas no especificados: no se indica qué idiomas soporta, aunque al derivar de Qwen3.5-0.8B podría heredar el multilingüismo de Qwen, pero no es confirmado.
- Sin benchmarks públicos: no hay datos de rendimiento que permitan evaluar su calidad en tareas estándar.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/altic-dev/Fluid-1-Pico-0.8B-MLX-6bit)
- [Términos de licencia ALTIC](https://huggingface.co/altic-dev/Fluid-1-Pico-0.8B-MLX-6bit/blob/main/ALTIC-MODEL-TERMS.md)
- [Modelo base Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
