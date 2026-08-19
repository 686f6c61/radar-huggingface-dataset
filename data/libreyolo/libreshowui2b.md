# LibreYOLO/LibreShowUI2b

## Resumen

LibreShowUI2b es un espejo (snapshot) del modelo ShowUI-2B, publicado por el laboratorio Show Lab y redistribuido por LibreYOLO dentro de su capa de integración LibreGround. El repositorio no modifica ningún parámetro aprendido: conserva los pesos originales, la licencia Apache 2.0 y los archivos necesarios para cargar el modelo con el wrapper propietario de LibreYOLO. Su propósito es ofrecer una vía de despliegue simplificada para tareas de grounding de interfaces de usuario, es decir, localizar elementos concretos (botones, campos de texto, iconos) en capturas de pantalla a partir de instrucciones en lenguaje natural.

El modelo base, ShowUI-2B, está construido sobre la arquitectura Qwen2-VL, lo que le permite procesar simultáneamente imágenes y texto. Aunque la ficha técnica del espejo no detalla las especificaciones internas, por el nombre se infiere que se trata de un modelo de aproximadamente 2 mil millones de parámetros. La relevancia actual de este tipo de modelos radica en su aplicación directa en automatización de pruebas, asistentes de accesibilidad y agentes que interactúan con aplicaciones gráficas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Qwen2-VL, según el nombre del repositorio original) |
| Parametros totales | no disponible (el nombre del modelo sugiere 2B, pero no se confirma en la información proporcionada) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (el repositorio contiene archivos de Hugging Face, probablemente safetensors, pero no se especifica) |

## Arquitectura y entrenamiento

El repositorio LibreShowUI2b es un espejo sin modificaciones del modelo showlab/ShowUI-2B. No se ha alterado ningún peso ni se ha realizado un entrenamiento adicional. La arquitectura subyacente corresponde a la del modelo original, que según la documentación pública de Show Lab se basa en Qwen2-VL, un modelo multimodal que combina un codificador de visión con un transformador de lenguaje. Sin embargo, la información proporcionada no incluye detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. Por tanto, estos datos se consideran no disponibles en esta ficha.

## Capacidades

- Grounding de elementos de interfaz de usuario: el modelo es capaz de identificar y devolver coordenadas de puntos sobre una captura de pantalla a partir de un prompt textual (por ejemplo, "Submit").
- Procesamiento multimodal: al estar basado en Qwen2-VL, puede procesar imágenes y texto de forma conjunta, aunque esta capacidad no se detalla en la información del espejo.
- Integración con el wrapper LibreGround: el uso previsto es a través de la librería `libreyolo`, que ofrece una interfaz simplificada para invocar el modelo y obtener las coordenadas de los elementos detectados.
- Conversación y comprensión de instrucciones: el modelo base soporta diálogos multimodales, pero no se especifica en la documentación del espejo.

## Casos de uso

- Automatización de pruebas de interfaz: un equipo de control de calidad puede usar el modelo para localizar botones o campos en capturas de pantalla de una aplicación y verificar que responden correctamente a las acciones automatizadas.
- Asistentes de accesibilidad: el modelo puede ayudar a personas con discapacidad visual a interactuar con aplicaciones, identificando elementos de la interfaz a partir de descripciones en lenguaje natural.
- Agentes autónomos de navegación: en entornos de escritorio o web, el modelo puede servir como componente de percepción para que un agente decida dónde hacer clic o qué campo rellenar.
- Generación de datos de entrenamiento: las coordenadas devueltas por el modelo pueden utilizarse para anotar automáticamente conjuntos de datos de UI, reduciendo el esfuerzo manual.
- Integración en pipelines de CI/CD: mediante el wrapper LibreGround, se puede incorporar el modelo en flujos de integración continua para validar visualmente cambios de interfaz.
- Investigación en grounding multimodal: el modelo sirve como punto de partida para experimentos sobre localización de elementos en imágenes de aplicaciones, gracias a su licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de evaluación ni comparaciones con otros modelos.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware en la documentación del espejo. Dado que el modelo tiene aproximadamente 2 mil millones de parámetros, se puede estimar que cabría en GPUs de consumo con al menos 8 GB de VRAM en cuantización de 4 bits, pero este dato no está confirmado. Las opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) no se mencionan en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de grounding de UI. El espejo no proporciona datos de rendimiento ni referencias a modelos alternativos. Se recomienda consultar la documentación del modelo original ShowUI-2B para obtener comparativas.

## Limitaciones y advertencias

- Al ser un espejo sin modificaciones, las limitaciones del modelo original se mantienen, pero no se detallan en la información proporcionada.
- No se especifican sesgos conocidos ni riesgos de alucinación. Se recomienda evaluar el modelo en el dominio de aplicación antes de usarlo en producción.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de copyright y la atribución correspondiente.
- El modelo está pensado para su uso a través del wrapper LibreGround; el uso directo de los archivos del repositorio puede requerir adaptaciones.
- No se indica el idioma de los prompts soportados; se asume que el modelo base maneja inglés, pero no está confirmado.

## Enlaces

- Repositorio del espejo: https://huggingface.co/LibreYOLO/LibreShowUI2b
- Modelo original: https://huggingface.co/showlab/ShowUI-2B
