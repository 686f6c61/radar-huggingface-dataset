# nacer41dz/Llama-3.2-TashriAI-DZ-GGUF

## Resumen

TashriAI-DZ es una distribución en formato GGUF de Llama 3.2 3B Instruct, publicada por Nacer Zouaizia (nacer41dz) y orientada al dominio de la legislación educativa argelina. No se trata de un modelo entrenado desde cero ni de un fine-tuning documentado: la model card declara explícitamente que la metodología de entrenamiento, los conjuntos de datos y la configuración de ajuste fino no han sido documentados, y que el rendimiento en el dominio legal argelino no ha sido evaluado de forma independiente. El valor del artefacto es, por tanto, el de un punto de partida práctico para experimentar con RAG sobre normativa educativa, no el de un modelo especializado validado.

El modelo hereda la arquitectura y capacidades de Llama 3.2 3B Instruct de Meta: un transformer decoder-only de 3.212.749.888 parámetros, con soporte declarado de árabe e inglés, y licencia Llama 3.2 Community. La distribución se ofrece tanto en Hugging Face como en Ollama, con un único fichero GGUF de aproximadamente 2,02 GB, lo que sugiere una cuantización de 4-5 bits (no se especifica el tipo exacto).

Es relevante ahora porque ejemplifica un patrón habitual en el ecosistema: empaquetar un modelo base pequeño en GGUF y presentarlo para un dominio vertical concreto (legal/administrativo) sin evidencia empírica de especialización. Para desarrolladores e investigadores, la ficha debe leerse como una advertencia: útil para prototipar y para integrar en pipelines RAG, pero sin garantías de exactitud jurídica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), según modelo base |
| Parametros totales | 3.212.749.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Llama 3.2 3B Instruct soporta 128K tokens, pero la model card no lo confirma para esta distribución) |
| Tipos de cuantizacion | no disponible (fichero GGUF único de ~2,02 GB; el nivel de cuantización no se especifica) |
| Idiomas soportados | ar, en |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | GGUF (fichero TashriAI-DZ.gguf) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Meta Llama 3.2 3B Instruct, un transformer decoder-only con atención por grupos (GQA) y tokenizador multilingüe, según corresponde al modelo base declarado. Esta distribución no aporta cambios arquitectónicos propios: es un artefacto de inferencia en GGUF derivado del modelo base.

En cuanto al entrenamiento, la model card es explícita: "The precise training methodology, training datasets, fine-tuning configuration, and evaluation results have not been documented in this model card". No se indica número de tokens, composición del dataset, ni si hubo SFT, RLHF o DPO específicos para el dominio legal. Tampoco se documenta el proceso de cuantización ni la plantilla de conversación utilizada (se remite a la distribución en Ollama para reproducir la configuración de runtime). Cualquier afirmación sobre especialización en legislación educativa argelina debe tratarse como objetivo del proyecto, no como resultado verificado.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Llama 3.2 3B Instruct.
- Comprensión y generación en árabe e inglés (idiomas declarados).
- Respuestas orientadas a explicaciones de conceptos y procedimientos administrativos y educativos, según los objetivos declarados del proyecto.
- Integración prevista con sistemas de recuperación documental (RAG), mencionada explícitamente como línea de trabajo futura.
- Soporte de tool calling / function calling: no documentado para esta distribución.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Modo thinking, visión o audio: no disponibles.
- Capacidades matemáticas o de código específicas: no documentadas para esta distribución (el modelo base las posee en grado limitado por su tamaño).

## Casos de uso

- Prototipo de asistente RAG sobre normativa educativa argelina: usar el GGUF como generador dentro de un pipeline que recupere textos oficiales y los pase como contexto; el modelo redacta la respuesta en árabe o inglés a partir de los fragmentos recuperados. Adecuado por su tamaño reducido y despliegue local, no por conocimiento jurídico propio.
- Despliegue local en entornos con recursos limitados: al ocupar ~2 GB en disco, puede ejecutarse en portátiles y estaciones de trabajo sin GPU dedicada mediante Ollama o llama.cpp, lo que facilita pruebas por parte de personal del sector educativo.
- Exploración de terminología administrativa: consultas sobre conceptos y procedimientos del sector educativo para generar borradores que un profesional revisa después contra el texto oficial.
- Generación de borradores de documentación interna: resúmenes o esquemas de circulares y procedimientos, siempre con verificación humana y cotejo con la fuente normativa.
- Base para experimentos de ajuste fino posterior: al ser un GGUF derivado de Llama 3.2 3B Instruct, sirve como referencia de comportamiento antes de entrenar un adaptador específico con datos legales propios.
- Evaluación comparativa de pipelines RAG: útil como generador "de control" de bajo coste para medir cuánto aporta la recuperación frente al conocimiento paramétrico del modelo en preguntas legales.
- Demostraciones y formación: entorno reproducible (Ollama) para mostrar el uso de IA en administración educativa sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que el rendimiento en legislación educativa argelina no ha sido evaluado de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3 GB con el fichero GGUF de ~2,02 GB y overhead de contexto; el nivel exacto de cuantización no está documentado.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.); en GPU de datacenter (A100, H100) es viable pero sobredimensionada para este tamaño.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU con 4 GB o más; también en CPU.
- Opciones de despliegue: Ollama (`ollama run nacerzouaizia/TashriAI-DZ`), llama.cpp y cualquier runtime compatible con GGUF; vLLM y TGI no están confirmados para este artefacto concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| TashriAI-DZ (esta ficha) | 3,21 B | no disponible | ar, en | Llama 3.2 Community | GGUF |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 128K (según model card de Meta) | multilingüe | Llama 3.2 Community | safetensors, GGUF |
| Modelos legales en árabe de 3-7 B | no disponible | no disponible | ar | variable | variable |

No se dispone de datos de benchmarks ni de una comparación verificada con alternativas especializadas en legislación argelina; la comparación con el modelo base es la única referencia fiable, y esta distribución no documenta desviaciones respecto a él.

## Limitaciones y advertencias

- La model card advierte que el modelo puede producir respuestas inexactas, incompletas o desactualizadas.
- Las disposiciones legales y reglamentarias pueden ser modificadas o derogadas; el modelo no tiene mecanismo de actualización normativa.
- Puede generar referencias o interpretaciones incorrectas y no garantiza la disponibilidad de citas a fuentes oficiales.
- No sustituye a los documentos legales oficiales, instrucciones ministeriales ni interpretaciones administrativas autorizadas; la salida debe verificarse contra los textos oficiales aplicables.
- No debe tratarse como fuente jurídica autoritativa.
- No hay evaluación independiente de sesgos; al derivar de Llama 3.2, hereda los sesgos del modelo base y de sus datos.
- El proyecto es una iniciativa técnica independiente y no representa un servicio oficial del Ministerio de Educación Nacional argelino.
- Licencia Llama 3.2 Community: el uso comercial está sujeto a los términos de dicha licencia y a su Acceptable Use Policy; conviene revisarlos antes de un despliegue en producción.
- La metodología de entrenamiento y cuantización no está documentada, lo que dificulta la reproducibilidad y la auditoría.
- El modelo declara solo árabe e inglés; no se garantiza un comportamiento fiable en otros idiomas, incluido el francés, de uso extendido en Argelia.

## Enlaces

- Hugging Face: https://huggingface.co/nacer41dz/Llama-3.2-TashriAI-DZ-GGUF
- Perfil del autor en Hugging Face: https://huggingface.co/nacer41dz
- Distribución en Ollama: https://ollama.com/nacerzouaizia/TashriAI-DZ
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
