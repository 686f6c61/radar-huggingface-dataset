# cattonpm/PlanckGPT-v0.10.0

## Resumen

PlanckGPT-v0.10.0 es un modelo de lenguaje pequeño (aproximadamente 206 millones de parámetros) desarrollado por Nguyen Phu Minh como proyecto educativo y experimental. Su objetivo es demostrar que es posible entrenar un modelo de lenguaje desde cero en un ordenador de consumo, sin necesidad de infraestructura de nivel industrial. El nombre hace referencia a la longitud de Planck, aludiendo a su tamaño minúsculo en comparación con los grandes modelos actuales.

El modelo está preentrenado sobre unos 2 mil millones de tokens del dataset Fineweb-edu, lo que lo sitúa en la categoría de modelos compactos orientados a tareas simples de generación de texto. Su arquitectura es un transformer decoder estándar, similar a la familia GPT, sin innovaciones particulares. La licencia es Apache 2.0, lo que permite uso comercial y modificación libre. La versión publicada en HuggingFace (v0.10.0) incluye los pesos en un repositorio de 1,5 GB, aunque no se especifica el formato exacto de los archivos.

A pesar de su limitada capacidad, PlanckGPT resulta relevante como referencia para quienes desean comprender el proceso completo de entrenamiento de un LLM en un entorno doméstico, así como para experimentos de fine-tuning y evaluación de modelos pequeños. Su documentación se limita a una remisión al repositorio de GitHub, donde se ofrecen instrucciones de instalación y ejecución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (estilo GPT) |
| Parametros totales | ~206 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (dataset Fineweb-edu, mayoritariamente ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 1,5 GB) |

## Arquitectura y entrenamiento

PlanckGPT es un transformer decoder convencional, con capas de atención multi-cabeza y feed-forward, siguiendo la arquitectura original de GPT. No emplea mecanismos como mezcla de expertos (MoE), atención lineal ni decodificación especulativa. El entrenamiento se realizó desde cero sobre aproximadamente 2 mil millones de tokens del dataset Fineweb-edu, un subconjunto curado de contenidos educativos extraídos de la web. No se ha documentado el uso de técnicas de alineación como RLHF o DPO; el modelo se presenta como un preentrenamiento básico sin ajuste posterior por instrucciones.

La principal innovación del proyecto no reside en la arquitectura, sino en la metodología: entrenar un LLM funcional en un ordenador de consumo, demostrando que es posible reproducir el ciclo completo de preprocesado, tokenización, entrenamiento y evaluación con recursos limitados. El repositorio de GitHub incluye el código fuente y las instrucciones para replicar el proceso.

## Capacidades

- Generación de texto autoregresiva: el modelo produce texto coherente a nivel local, aunque con limitaciones propias de su tamaño.
- Razonamiento básico: puede completar frases o generar párrafos sobre temas presentes en su corpus de entrenamiento, pero sin capacidad de razonamiento complejo.
- Sin soporte de tool calling ni function calling: no se ha entrenado para interactuar con APIs o herramientas externas.
- Sin capacidades de agente ni multi-step reasoning: su ventana de contexto y su tamaño no permiten tareas de planificación o encadenamiento de pasos.
- Multilingüismo limitado: aunque no se especifican idiomas, el dataset Fineweb-edu es predominantemente inglés, por lo que el modelo funciona mejor en ese idioma.
- Sin capacidades multimodales: no procesa imágenes, audio ni vídeo.

## Casos de uso

- Aprendizaje y educación en IA: el modelo y su código fuente sirven como material didáctico para entender cómo se entrena un LLM, desde la preparación del dataset hasta la inferencia.
- Experimentación con fine-tuning: al ser pequeño, es viable ajustarlo en una GPU de consumo para tareas específicas como generación de texto en un dominio concreto (por ejemplo, correos electrónicos o resúmenes cortos).
- Pruebas de pipelines de despliegue: su tamaño reducido permite probar infraestructuras de inferencia (vLLM, llama.cpp, etc.) sin necesidad de grandes recursos, ideal para entornos de desarrollo.
- Generación de texto en aplicaciones de baja latencia: para usos donde se requiere una respuesta rápida y el contenido no necesita alta calidad, como sugerencias de autocompletado o relleno de plantillas.
- Investigación sobre modelos pequeños: comparar el rendimiento de PlanckGPT con otros modelos de tamaño similar para estudiar la relación entre escala y capacidad.
- Prototipado de agentes conversacionales sencillos: aunque no soporta tool calling, se puede integrar en un chatbot básico con lógica externa para manejar el diálogo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de GitHub no incluye evaluaciones estándar como MMLU, HumanEval o GSM8K, y la model card de HuggingFace tampoco las referencia.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de ~206M parámetros, la inferencia en FP16 requiere aproximadamente 0,4 GB de VRAM. Con cuantización a 8 bits o 4 bits, el requisito baja a unos 0,2-0,3 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1650, RTX 2060 o superiores pueden ejecutarlo sin problemas. También es posible ejecutarlo en CPU con un rendimiento aceptable.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU de consumo actual, incluso en las integradas de algunos procesadores.
- Opciones de despliegue: al ser un modelo estándar de tipo GPT, se puede servir con vLLM, llama.cpp, Ollama, TGI o cualquier framework compatible con arquitecturas transformer. El repositorio de GitHub proporciona instrucciones específicas para su ejecución.
- Latencia y throughput: no se dispone de datos medidos, pero por su tamaño se espera una latencia de milisegundos en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| PlanckGPT-v0.10.0 | ~206M | no disponible | Apache 2.0 | HuggingFace, GitHub |
| GPT-2 small | 124M | 1024 | MIT | OpenAI, HuggingFace |
| GPT-2 medium | 355M | 1024 | MIT | OpenAI, HuggingFace |
| TinyLlama 1.1B | 1,1B | 2048 | Apache 2.0 | HuggingFace |

PlanckGPT se sitúa entre GPT-2 small y medium en tamaño, pero carece de las evaluaciones y el ecosistema de herramientas que acompañan a estos modelos consolidados. Su principal diferencia es que ha sido entrenado desde cero con un dataset educativo, mientras que GPT-2 se entrenó con datos web generales. TinyLlama, por su parte, es más grande y ofrece un contexto mayor, pero también requiere más recursos.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con Fineweb-edu, un subconjunto de contenido web filtrado por calidad educativa, puede heredar sesgos presentes en ese corpus, aunque no se han documentado análisis específicos.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir afirmaciones falsas o inventadas, especialmente al carecer de mecanismos de verificación.
- Limitaciones de contexto y idioma: la longitud de contexto no está publicada, pero por su tamaño se estima muy limitada (probablemente 512 o 1024 tokens). El modelo funciona mejor en inglés y su rendimiento en otros idiomas es incierto.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero exige incluir el aviso de copyright y las condiciones de la licencia en las redistribuciones.
- Caveat para producción: este modelo no está diseñado para aplicaciones críticas. Su calidad de generación es baja en comparación con modelos más grandes, y no ha sido alineado para seguir instrucciones, por lo que no es recomendable para chatbots o asistentes sin un fine-tuning adicional.
- Documentación escasa: la model card no proporciona detalles sobre el tokenizador, el contexto exacto, ni el formato de los pesos, lo que dificulta su integración en herramientas estándar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cattonpm/PlanckGPT-v0.10.0
- Repositorio de GitHub: https://github.com/nguyenphuminh/planckgpt
- Releases del proyecto: https://github.com/nguyenphuminh/planckgpt/releases
