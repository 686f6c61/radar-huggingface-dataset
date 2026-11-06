# OpenTARS/Gargantua-Pro

## Resumen

Gargantua Pro es un modelo de lenguaje de 12B parámetros desarrollado por el proyecto OpenTARS, un asistente de IA local para Linux que controla el escritorio, abre aplicaciones, ejecuta comandos y automatiza tareas. Este modelo es la variante "grande" de la familia Gargantua: parte de `google/gemma-4-12b-it` (licencia Apache-2.0) y ha sido afinado por el equipo de OpenTARS sobre datos propios de uso de herramientas (tool-use). Su función principal es gestionar tareas de agente de varios pasos: planificar, invocar herramientas, verificar resultados y continuar hasta completar el objetivo.

La arquitectura subyacente corresponde a un transformer decoder-only de la familia Gemma 4, con 11.907.350.576 parámetros totales (unos 12B). Se distribuye exclusivamente en formato GGUF cuantizado Q4_K_M (7.4 GB, solo texto), lo que lo orienta al despliegue local mediante llama.cpp y Ollama. Soporta los idiomas portugués e inglés, y está diseñado para ejecutarse en GPU con aproximadamente 8 GB de VRAM o en CPU con RAM suficiente.

Su relevancia radica en que es un modelo de agente local, sin dependencia de la nube, con soporte de tool calling integrado en Ollama (renderer y parser `gemma4` nativos) y un conjunto de 19 herramientas compartidas con Gargantua 2. Es la primera release del proyecto y no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4) |
| Parametros totales | 11.907.350.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | Portugues (pt), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

Gargantua Pro se construye sobre `google/gemma-4-12b-it`, un transformer decoder-only de aproximadamente 12B parámetros. El proyecto OpenTARS ha realizado un fine-tuning sobre datos propios de tool-use, orientado específicamente a que el modelo invoque correctamente las 19 herramientas del asistente en el primer intento y mantenga el bucle de agente (planificar, ejecutar, comprobar, continuar). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La model card indica que el modelo es "text only" y que la decodificación se realiza mediante llama.cpp, con renderer y parser `gemma4` integrados en Ollama. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o arquitecturas híbridas SSM.

## Capacidades

- Generación de texto conversacional multi-turno en portugués e inglés.
- Razonamiento de agente multi-paso: planificación de tareas, ejecución secuencial de herramientas y verificación de resultados.
- Tool calling / function calling a través de la API estándar de Ollama, con un conjunto de 19 herramientas compartidas con Gargantua 2.
- Automatización de escritorio: apertura de aplicaciones, clic en botones por nombre, escritura y ejecución de comandos (a través de las herramientas del asistente OpenTARS).
- Búsqueda web y control de pantalla, según las capacidades del asistente que lo integra.
- Capacidades multilingües limitadas a portugués e inglés.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito en la información disponible.

## Casos de uso

- Asistente de escritorio local en Linux: el modelo gestiona conversaciones multi-turno y decide qué herramienta del asistente invocar (abrir apps, pulsar botones, escribir texto) sin salir de la máquina, gracias a su integración nativa con Ollama y al conjunto de 19 herramientas.
- Automatización de tareas administrativas: ejecución de comandos y secuencias de clics para tareas repetitivas (organización de ficheros, lanzamiento de scripts), usando el bucle de agente para verificar el resultado de cada paso.
- Agente de búsqueda y extracción de información: el modelo planifica consultas, invoca la herramienta de búsqueda web del asistente y sintetiza los resultados en portugués o inglés.
- Prototipado de agentes con tool calling: al exponer la API estándar de Ollama, sirve como base para desarrollar y probar flujos de agente en local antes de desplegarlos en producción.
- Despliegue en estaciones de trabajo con GPU de consumo: con ~8 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070), permite ejecutar un agente de 12B sin coste de API ni envío de datos a la nube.
- Entornos con requisitos de privacidad: al ejecutarse íntegramente en local mediante llama.cpp u Ollama, es adecuado para tareas sobre datos sensibles donde no se permite el envío a servicios externos.
- Asistencia en portugués: el modelo está afinado y etiquetado para portugués, lo que lo hace útil para asistentes dirigidos a usuarios lusohablantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "We have not published benchmark numbers for it yet."

## Requisitos de hardware

- VRAM estimada: aproximadamente 8 GB para el fichero Q4_K_M de 7.4 GB, según la model card.
- GPU recomendadas: no se especifican modelos concretos; cualquier GPU con ~8 GB o más de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, A100, H100) debería poder alojar el modelo cuantizado.
- Ejecución en CPU: posible con RAM suficiente (el fichero ocupa 7.4 GB; se recomienda al menos 16 GB de RAM del sistema).
- Opciones de despliegue: llama.cpp y Ollama (renderer y parser `gemma4` integrados). No se documenta soporte para vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Gargantua Pro (OpenTARS) | 11,9B | no disponible | GGUF (Q4_K_M) | Apache-2.0 | Fine-tune de Gemma 4 12B para tool-use; 19 herramientas |
| Gargantua (OpenTARS) | 4B (Qwen3 4B) | no disponible | GGUF | no disponible | Modelo menor del mismo proyecto, orientado a un solo trabajo |
| Gemma 4 12B IT (Google) | ~12B | no disponible | safetensors / GGUF | Apache-2.0 | Modelo base sin fine-tuning específico de agente |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo "text only": no procesa imágenes, audio ni vídeo.
- Idiomas limitados a portugués e inglés; el rendimiento en otros idiomas no está documentado.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas de agente no está cuantificado.
- Riesgo de alucinación inherente a los modelos de lenguaje; en un agente que ejecuta comandos y clics, una invocación errónea de herramienta puede tener efectos reales en el sistema.
- Solo se distribuye en cuantización Q4_K_M; no hay versiones de mayor precisión (FP16, Q8) en la información disponible.
- La longitud de contexto no está documentada, lo que limita la planificación de tareas de contexto largo.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base (Gemma 4) puede tener términos adicionales que conviene revisar.
- Primera release del proyecto: sin historial de estabilidad ni soporte a largo plazo documentado.
- Descargas y likes en Hugging Face: 0 en el momento de la consulta, lo que indica adopción aún nula.

## Enlaces

- Hugging Face: https://huggingface.co/OpenTARS/Gargantua-Pro
- Repositorio GitHub del proyecto: https://github.com/project-opentars/OpenTARS
- Página del proyecto: https://project-opentars.github.io/OpenTARS/
- Modelo Gargantua en Ollama: https://ollama.com/ProjectOpenTARS/Gargantua
- Modelo base: google/gemma-4-12b-it (referenciado en la model card; sin URL directa en la información disponible)
