# OpenMedZoo/intern-med

## Resumen

Intern-Med es un modelo multimodal de dominio médico desarrollado por OpenMedZoo, construido sobre el modelo base Intern-S2-Preview. Está diseñado para reforzar el conocimiento médico y el razonamiento clínico, y produce trazas de razonamiento estructurado en varias etapas (estilo checklist) cuando se activa el modo de pensamiento (thinking mode), preservando a la vez las capacidades generales y matemáticas del modelo base. El pipeline declarado es `image-text-to-text`, por lo que acepta tanto entradas de texto como multimodales (imagen).

El modelo cuenta con 36.098.254.656 parámetros totales (aproximadamente 36 mil millones) según los pesos en safetensors, con un tamaño de repositorio de 72,2 GB y pesos en bfloat16. Se distribuye bajo licencia Apache 2.0, aunque al derivar de Intern-S2-Preview conviene cumplir también los términos de la licencia del modelo base. Requiere código personalizado (`trust_remote_code=True`).

Su relevancia radica en la combinación de un tamaño considerable, soporte multimodal y un modo de razonamiento explícito orientado a tareas clínicas, lo que lo hace candidato para aplicaciones de apoyo a la decisión médica, aunque con las cautelas propias de un modelo de investigación que no constituye consejo médico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (derivado de Intern-S2-Preview); detalles internos no disponibles |
| Parametros totales | 36.098.254.656 (aprox. 36 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue en vLLM usa `--max-model-len 8192` |
| Tipos de cuantizacion | pesos publicados en bfloat16; no se documentan otras cuantizaciones oficiales |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (sujeto además a la licencia del modelo base Intern-S2-Preview) |
| Formato de pesos | safetensors (requiere código personalizado, `trust_remote_code=True`) |

## Arquitectura y entrenamiento

Intern-Med se construye sobre Intern-S2-Preview, un modelo multimodal de la familia Intern, y se especializa en el dominio médico mediante un proceso de refuerzo de conocimiento clínico y razonamiento. La arquitectura concreta (número de capas, mecanismos de atención, componentes de visión) no se detalla en la model card; lo que sí se especifica es que soporta entradas de texto e imagen a través del pipeline `image-text-to-text` y que requiere código personalizado para su carga.

El modelo incorpora un modo de pensamiento que genera razonamiento estructurado en varias etapas con formato de checklist (chain-of-thought explícito), separando la traza de razonamiento de la respuesta final mediante un parser de razonamiento (por ejemplo, `--reasoning-parser qwen3` en vLLM). No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento clínico en dominio médico.
- Razonamiento estructurado multi-etapa en modo de pensamiento (checklist-style chain-of-thought).
- Entrada multimodal: procesamiento de imágenes junto con texto (pipeline image-text-to-text).
- Conservación de capacidades generales y matemáticas del modelo base.
- Conversación multi-turno (tag `conversational`).
- Separación de traza de razonamiento y respuesta final mediante parser de razonamiento en vLLM.
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y multi-step reasoning más allá del razonamiento estructurado: no disponible.
- Capacidades multilingües: no disponible (idiomas no especificados).
- Capacidades de audio: no disponible.

## Casos de uso

- Apoyo al razonamiento clínico documentado: el modelo puede generar trazas de razonamiento estructurado en formato checklist para casos clínicos, lo que facilita la revisión por parte de profesionales y la auditoría del proceso de decisión.
- Análisis de imágenes médicas con contexto textual: al aceptar entradas image-text-to-text, puede combinarse con descripciones textuales de hallazgos para tareas de apoyo a la interpretación, siempre como herramienta de investigación.
- Asistencia en formación médica: generación de explicaciones razonadas paso a paso sobre fisiopatología o diagnósticos diferenciales, aprovechando el modo de pensamiento para mostrar el proceso.
- Investigación en NLP clínico: evaluación de modelos especializados en razonamiento médico y comparación con modelos generalistas, dado su tamaño de 36 B y su licencia Apache 2.0.
- Prototipado de asistentes conversacionales sanitarios: conversaciones multi-turno con contexto gestionado mediante despliegue en vLLM y decodificación greedy para respuestas deterministas.
- Extracción y estructuración de información clínica: procesamiento de texto médico con razonamiento explícito para tareas de resumen o clasificación, con revisión humana obligatoria.
- Despliegue en pipelines de investigación reproducibles: gracias a la integración con Transformers y vLLM y a la disponibilidad de pesos en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 36 B parámetros en bfloat16, los pesos ocupan aproximadamente 72 GB; se necesita al menos esa cantidad más overhead de activaciones y caché KV, por lo que en la práctica se requieren del orden de 80 GB o más para bfloat16 sin cuantizar.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para bfloat16. No se documentan requisitos oficiales.
- ¿Cabe en GPU de consumo? No en bfloat16; con cuantizaciones de terceros (no oficiales) podría reducirse el requisito, pero no se documentan cuantizaciones oficiales.
- Opciones de despliegue: vLLM (recomendado por el autor, con `--trust-remote-code --reasoning-parser qwen3`), Transformers con `AutoModelForImageTextToText` y `AutoProcessor`. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Notas |
|---|---|---|---|---|---|
| Intern-Med (OpenMedZoo) | ~36 B | no disponible (ejemplo vLLM con 8192) | Apache 2.0 | Sí (image-text-to-text) | Especializado en dominio médico con razonamiento estructurado |
| Intern-S2-Preview (modelo base) | no disponible | no disponible | según modelo base | Sí | Base sobre la que se construye Intern-Med |
| Alternativas médicas comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks ni de comparativas publicadas en la información proporcionada |

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos alternativos en la información proporcionada, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Modelo de investigación: sus salidas son solo informativas y no constituyen consejo médico, diagnóstico ni tratamiento; debe consultarse siempre a un profesional sanitario cualificado.
- Riesgo de alucinación inherente a los modelos generativos, especialmente crítico en dominio clínico.
- No se documentan sesgos conocidos ni la composición del dataset de entrenamiento, lo que dificulta evaluar sesgos demográficos o clínicos.
- Idiomas soportados no especificados; no se garantiza un rendimiento multilingüe.
- Longitud de contexto no documentada oficialmente; el ejemplo de despliegue sugiere 8192 tokens, pero no se confirma como máximo.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene auditar dicho código antes de usarlo en producción.
- Licencia Apache 2.0, pero al derivar de Intern-S2-Preview deben respetarse también los términos de la licencia del modelo base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.
- No hay benchmarks publicados que respalden las capacidades declaradas.
- No se documentan cuantizaciones oficiales, lo que limita el despliegue en hardware de consumo.

## Enlaces

- Hugging Face: https://huggingface.co/OpenMedZoo/intern-med
- GitHub: https://github.com/OpenMedZoo/intern-med
- Modelo base Intern-S2-Preview: https://huggingface.co/internlm/Intern-S2-Preview
