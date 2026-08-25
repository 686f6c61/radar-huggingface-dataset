# AeroxLabs/Aerova-Nova-2.5B-GGUF

## Resumen

Aerova Nova es un modelo de lenguaje biomédico de 7 000 millones de parámetros desarrollado por AeroxLabs, una iniciativa orientada a democratizar la inteligencia artificial médica mediante open source. El modelo se distribuye en formato GGUF, pensado para inferencia local eficiente con el ecosistema llama.cpp, y está diseñado para tareas de generación de texto médico, biológico y científico. Su relevancia radica en ofrecer una alternativa abierta y ligera para investigación y experimentación en NLP biomédica, sin depender de servicios propietarios.

Construido sobre BioMistral-7B-SLERP, un modelo base especializado en el dominio biomédico, Aerova Nova ha sido adaptado con datos de NCBI PubMed, lo que le permite manejar terminología médica y biológica con mayor precisión que un modelo generalista. Aunque el nombre del repositorio indica "2.5B", los parámetros reales ascienden a 7 241 732 096, lo que corresponde a la familia de 7B. El modelo soporta ocho idiomas, aunque el rendimiento puede variar según la lengua y la complejidad del vocabulario especializado.

La ficha se basa exclusivamente en la información pública disponible en Hugging Face y en la model card del autor. No se han encontrado datos sobre benchmarks, contexto máximo o cuantizaciones específicas, por lo que esos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model (transformer) |
| Parametros totales | 7 241 732 096 (7,24 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (formato GGUF, sin detalle de archivos) |
| Idiomas soportados | en, es, de, pt, ru, fr, ar, zh (8 idiomas) |
| Licencia | MIT |
| Formato de pesos | GGUF (el modelo base usa safetensors) |

## Arquitectura y entrenamiento

Aerova Nova es un modelo de lenguaje causal de tipo transformer, basado en BioMistral-7B-SLERP, que a su vez deriva de Mistral-7B. La arquitectura es estándar para generación de texto autoregresiva, sin innovaciones específicas documentadas en la model card. El entrenamiento se realizó sobre el dataset NCBI PubMed, que contiene literatura biomédica a gran escala, con el objetivo de adaptar el modelo al dominio médico y biológico. No se especifican detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. El modelo se distribuye en formato GGUF, lo que facilita su ejecución en CPU y GPU mediante llama.cpp y llama-cpp-python.

## Capacidades

- Generación de texto médico y biológico: produce contenido coherente sobre temas de salud, anatomía, farmacología y biología molecular.
- Respuesta a preguntas biomédicas: puede responder consultas factuales sobre conceptos médicos, aunque con riesgo de alucinación.
- Completado de texto científico: útil para completar fragmentos de artículos o resúmenes de investigación.
- Exploración de conocimiento médico: permite indagar en terminología y relaciones entre conceptos biomédicos.
- Investigación en NLP biomédica: sirve como base para experimentos de procesamiento de lenguaje natural en el dominio clínico.
- Experimentación educativa: adecuado para proyectos de aprendizaje sobre modelos de lenguaje especializados.
- Generación de lenguaje específico de dominio: produce texto con vocabulario técnico propio de la medicina y la biología.
- Soporte multilingüe: cubre ocho idiomas, aunque el rendimiento puede ser desigual en terminología especializada.

## Casos de uso

- Asistencia en educación médica: estudiantes de medicina pueden usar el modelo para generar explicaciones sobre mecanismos fisiológicos o patologías, complementando materiales de estudio. Su capacidad para manejar terminología biomédica lo hace adecuado para este fin.
- Generación de resúmenes de literatura científica: investigadores pueden alimentar el modelo con abstracts de PubMed y obtener resúmenes simplificados o destacados de los puntos clave, acelerando la revisión bibliográfica.
- Prototipado de chatbots de salud: desarrolladores pueden integrar Aerova Nova en aplicaciones de demostración que respondan preguntas generales sobre salud, siempre con la advertencia de que no sustituye a un profesional.
- Anotación asistida de textos clínicos: el modelo puede ayudar a etiquetar o clasificar documentos médicos, como informes de laboratorio o historiales, en tareas de NLP biomédica.
- Generación de contenido divulgativo: redactores científicos pueden usar el modelo para producir borradores de artículos de divulgación sobre temas médicos, que luego serán revisados por expertos.
- Investigación en modelos de lenguaje especializados: como base para fine-tuning en tareas concretas, como extracción de entidades médicas o análisis de sentimiento en textos de pacientes, gracias a su licencia MIT y su formato GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se han encontrado comparaciones cuantitativas con otros modelos biomédicos.

## Requisitos de hardware

- Al ser un modelo de 7B en formato GGUF, puede ejecutarse en CPU con llama.cpp, aunque la velocidad será limitada. Para uso interactivo se recomienda una GPU con al menos 6 GB de VRAM si se usa una cuantización de 4 bits (típica para modelos de este tamaño).
- El tamaño del repositorio es de 2,7 GB, lo que sugiere cuantizaciones bajas (posiblemente Q4_K_M o similar). Con 8 GB de VRAM (por ejemplo, una RTX 3070 o RTX 4060) se puede cargar el modelo completo en GPU.
- Para GPU con menos memoria, se puede usar la opción `n_gpu_layers` de llama.cpp para descargar solo algunas capas a la GPU y el resto a CPU.
- Opciones de despliegue: llama.cpp, llama-cpp-python, Ollama (si se convierte a un formato compatible) o servidores basados en GGUF como llama-cpp-server.
- La latencia y el throughput dependen del hardware y la cuantización. En una GPU moderna (por ejemplo, RTX 4090) se pueden esperar decenas de tokens por segundo, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Dominio |
|---|---|---|---|---|---|
| Aerova Nova | 7,24 B | No disponible | MIT | GGUF | Biomédico |
| BioMistral-7B-SLERP | 7 B | No disponible | Apache 2.0 (según su ficha) | safetensors | Biomédico |
| Meditron-7B | 7 B | 4 096 | MIT | safetensors | Médico |

La comparativa se basa en información pública de los respectivos repositorios. Aerova Nova es una adaptación de BioMistral-7B-SLERP, por lo que sus capacidades son similares, pero Nova añade un ajuste adicional con PubMed y se distribuye en GGUF para facilitar la inferencia local. Meditron-7B es otra alternativa open source en el dominio médico, aunque no se dispone de datos comparativos de rendimiento.

## Limitaciones y advertencias

- El modelo puede generar información incorrecta, incompleta o desactualizada, así como alucinar hechos médicos. No debe utilizarse como fuente autoritativa de información sanitaria.
- Existe riesgo de sesgos en las respuestas, derivados de los datos de entrenamiento y de la propia naturaleza de los modelos de lenguaje.
- El rendimiento varía entre los ocho idiomas soportados; la precisión en terminología biomédica puede ser menor en lenguas distintas del inglés.
- No se ha documentado la longitud máxima de contexto, por lo que en tareas de generación larga podría degradarse la coherencia.
- Aunque la licencia MIT permite uso comercial, el modelo no está validado para uso clínico real. Cualquier aplicación en producción debe incluir supervisión humana y verificación de la información.
- El modelo está pensado para investigación y experimentación, no para diagnóstico, tratamiento o decisiones clínicas.

## Enlaces

- [Repositorio Hugging Face de Aerova Nova GGUF](https://huggingface.co/AeroxLabs/Aerova-Nova-2.5B-GGUF)
- [Modelo base BioMistral-7B-SLERP](https://huggingface.co/BioMistral/BioMistral-7B-SLERP)
- [Dataset NCBI PubMed](https://huggingface.co/datasets/ncbi/pubmed)
- [Colección Aerova de AeroxLabs](https://huggingface.co/collections/AeroxLabs/aerova)
- [Publicación en LinkedIn de AeroxLabs](https://www.linkedin.com/posts/aeroxyn_aeroxlabsaerova-nova-25b-hugging-face-activity-7496313198548049921-VR8-)
