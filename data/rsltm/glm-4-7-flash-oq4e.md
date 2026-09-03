# RSLtm/GLM-4.7-Flash-oQ4e

## Resumen

GLM-4.7-Flash-oQ4e es una cuantización de 4 bits del modelo GLM-4.7-Flash, desarrollada por RSLtm (Russell Norris) utilizando la herramienta oQ de oMLX v0.6.4. El modelo original, GLM-4.7-Flash, es un modelo de lenguaje de código abierto creado por Z.ai, lanzado en junio de 2026, con 30 mil millones de parámetros y licencia MIT. Se posiciona como un modelo de la clase 30B con especial énfasis en programación y razonamiento multi-paso, capaz de ejecutar tareas de agente complejas.

Esta cuantización reduce el tamaño del modelo a 17,6 GB (frente a los aproximadamente 60 GB del modelo en precisión completa), lo que permite su ejecución en hardware con memoria unificada limitada, como los chips Apple Silicon. El formato de pesos es MLX safetensors, específico del framework MLX de Apple, por lo que su uso está restringido a ese ecosistema. La cuantización emplea un esquema de precisión mixta con grupo de tamaño 64, lo que busca mantener un equilibrio entre rendimiento y fidelidad.

La relevancia de esta ficha radica en que ofrece una opción de despliegue ligero para un modelo de 30B con capacidades destacadas en código y agentes, aunque con las limitaciones propias de una cuantización de 4 bits y su dependencia de MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | glm4_moe_lite (Mixture of Experts) |
| Parametros totales | 29.943.393.920 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64, precision mixta (oQ) |
| Idiomas soportados | no disponible |
| Licencia | MIT (modelo base); la cuantizacion no especifica licencia propia |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base GLM-4.7-Flash emplea una arquitectura de mezcla de expertos (MoE) ligera, designada como `glm4_moe_lite`. Aunque no se dispone de detalles sobre el número de expertos o parámetros activos, la arquitectura MoE permite activar solo una fracción de los parámetros totales durante la inferencia, lo que reduce el coste computacional. El entrenamiento del modelo base se centró en mejorar las capacidades de programación y el razonamiento multi-paso, así como la ejecución estable de tareas de agente, según la documentación oficial de Z.ai.

La cuantización oQ4e aplica una cuantización de 4 bits con grupo de tamaño 64, utilizando una estrategia de precisión mixta que asigna diferentes niveles de bits a distintas capas según su sensibilidad. Esta técnica, implementada en oMLX v0.6.4, busca minimizar la pérdida de calidad manteniendo un tamaño reducido. No se han publicado detalles sobre el dataset de calibración utilizado para la cuantización.

## Capacidades

- Generación de texto y conversación natural, heredadas del modelo base GLM-4.7-Flash.
- Razonamiento multi-paso y ejecución de tareas de agente complejas, según la documentación de Z.ai.
- Programación y generación de código, posicionándose como un modelo fuerte en la clase 30B para tareas de codificación.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible, aunque las capacidades de agente sugieren su presencia.
- Capacidades multilingües: no especificadas en la información proporcionada.
- No se dispone de información sobre capacidades de visión o audio.

## Casos de uso

- Asistente de programación en entornos de desarrollo: el modelo puede generar, revisar y depurar código en múltiples lenguajes, aprovechando su entrenamiento específico en programación. Su tamaño de 30B permite un equilibrio entre calidad y latencia en tareas de autocompletado o generación de funciones.
- Agente autónomo para automatización de tareas: gracias a su razonamiento multi-paso y ejecución estable, puede orquestar flujos de trabajo que requieren planificación y ejecución de acciones secuenciales, como la gestión de APIs o la manipulación de archivos.
- Chatbot técnico de soporte: con su capacidad de conversación natural y comprensión de contextos técnicos, puede atender consultas de desarrolladores sobre APIs, frameworks o errores de código, manteniendo coherencia en diálogos multi-turno.
- Generación de documentación técnica: el modelo puede redactar comentarios, docstrings y documentación de proyectos a partir de código fuente, reduciendo el trabajo manual de los equipos de desarrollo.
- Análisis y refactorización de código: puede identificar patrones problemáticos, sugerir mejoras y transformar código legacy a versiones más modernas, gracias a su comprensión profunda de lenguajes de programación.
- Prototipado rápido de aplicaciones: en entornos de desarrollo con recursos limitados, la cuantización 4-bit permite ejecutar el modelo en hardware de consumo (Apple Silicon) para generar esqueletos de aplicaciones o scripts de automatización sin necesidad de infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La cuantización oQ4e no incluye métricas de evaluación propias, y la documentación del modelo base no proporciona cifras concretas en los fragmentos consultados. Se recomienda consultar la documentación oficial de Z.ai para obtener datos de rendimiento del modelo original.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 30B cuantizado a 4 bits, el tamaño del repositorio es de 17,6 GB. En sistemas con memoria unificada (Apple Silicon), se requiere al menos 18 GB de RAM unificada para cargar el modelo en memoria, aunque se recomienda 24 GB o más para dejar margen al contexto y al sistema operativo.
- GPU recomendadas: esta cuantización está diseñada para el framework MLX, que solo funciona en Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No es compatible con GPUs NVIDIA o AMD.
- En cuanto al modelo base sin cuantizar, la documentación de local-llm.net indica que cabe en 18 GB de VRAM y puede ejecutarse en una RTX 3090 o RTX 4090, pero esa afirmación se refiere al modelo original en otros formatos (probablemente GGUF o similar), no a esta cuantización MLX.
- Opciones de despliegue: al ser formato MLX, se puede ejecutar con oMLX (el framework que incluye oQ) o con MLX-LM. No es compatible con vLLM, llama.cpp, Ollama o TGI en su forma actual, aunque el modelo base está disponible en Ollama según la búsqueda web.
- Latencia y throughput: no se dispone de datos medidos para esta cuantización. En general, los modelos MoE de 30B en 4 bits pueden alcanzar velocidades de decodificación de 20-40 tokens por segundo en Apple Silicon de gama alta, pero esto es una estimación no verificada.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa con otros modelos de la misma clase. El modelo base GLM-4.7-Flash se anuncia como "el modelo más fuerte en la clase 30B" según Ollama, pero no se aportan benchmarks concretos. Alternativas comparables en tamaño serían Qwen2.5-32B, Llama-3.1-30B o Mixtral-8x7B, pero no se dispone de información sobre sus métricas en esta ficha. Se recomienda consultar los repositorios oficiales de cada modelo para obtener datos de rendimiento.

## Limitaciones y advertencias

- Cuantización de 4 bits: puede producir una degradación en la calidad de las respuestas, especialmente en tareas de razonamiento complejo o generación de código largo, en comparación con el modelo en precisión completa.
- Dependencia de MLX: esta cuantización solo es ejecutable en Apple Silicon. No es portable a entornos con GPUs NVIDIA o AMD sin convertir los pesos a otro formato (por ejemplo, GGUF), lo que requeriría un proceso adicional.
- Licencia: aunque el modelo base tiene licencia MIT, la cuantización de RSLtm no especifica una licencia propia. Se debe asumir que la licencia del modelo base se aplica, pero no hay confirmación explícita en la model card.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en dominios especializados. Se recomienda verificar las salidas en entornos de producción.
- Sesgos: no se dispone de información sobre sesgos específicos del modelo base, pero es probable que herede sesgos de los datos de entrenamiento originales.
- Contexto limitado: no se ha especificado la longitud de contexto soportada. Si el modelo base tiene una ventana de contexto larga (por ejemplo, 128K), la cuantización podría reducirla efectivamente debido a limitaciones de memoria, aunque no hay datos al respecto.
- Soporte de tool calling: no confirmado. Aunque las capacidades de agente sugieren que podría soportarlo, no hay documentación explícita en la información disponible.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/RSLtm/GLM-4.7-Flash-oQ4e
- Perfil del autor RSLtm: https://huggingface.co/RSLtm
- Modelo base GLM-4.7 en HuggingFace: https://huggingface.co/zai-org/GLM-4.7
- Página de GLM-4.7-Flash en Ollama: https://ollama.com/library/glm-4.7-flash
- Análisis de GLM-4.7 Flash en local-llm.net: https://www.local-llm.net/models/glm-4-7-flash/
- Documentación oficial de Z.ai sobre GLM-4.7: https://docs.z.ai/guides/llm/glm-4.7
- Repositorio de oQ (oMLX): https://github.com/jundot/omlx
