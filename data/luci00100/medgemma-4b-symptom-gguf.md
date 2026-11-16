# luci00100/medgemma-4b-symptom-gguf

## Resumen
El modelo `luci00100/medgemma-4b-symptom-gguf` es un ajuste fino (finetune) del modelo MedGemma 4B instruct, publicado por el usuario luci00100 en Hugging Face y distribuido exclusivamente en formato GGUF para su uso con llama.cpp. Parte de la familia Gemma 3 de Google, tal como indican las etiquetas del repositorio, y conserva la naturaleza multimodal (vision-lenguaje) del modelo base, con un proyector multimodal separado (`mmproj`) en precisión F16.

El objetivo declarado por el nombre del repositorio es el trabajo con sintomas clinicos ("symptom"), lo que sugiere un ajuste orientado a tareas de descripcion y evaluacion de sintomas en contexto medico. El repositorio no incluye model card detallada, datos de entrenamiento, licencia ni resultados de evaluacion, por lo que muchas especificaciones no estan disponibles.

Con 3.880.263.168 parametros (aproximadamente 3,9 mil millones) y un tamano de repositorio de 3,3 GB, se trata de un modelo ligero que puede ejecutarse en hardware de consumo. Su relevancia actual radica en que permite desplegar un modelo medico multimodal cuantizado en local mediante llama.cpp, sin dependencia de servicios en la nube, algo critico en entornos sanitarios con requisitos de privacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje), familia Gemma 3 (segun tags) |
| Parametros totales | 3.880.263.168 (aprox. 3,9 B) |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (incluido en el repo); mmproj en F16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); archivo mmproj separado para vision |

## Arquitectura y entrenamiento
El modelo es un finetune del MedGemma 4B instruct, que a su vez deriva de la arquitectura Gemma 3 de Google, un transformer decoder-only con capacidad multimodal mediante un proyector visual independiente. El repositorio incluye dos artefactos: el modelo de lenguaje cuantizado en Q4_K_M y un proyector multimodal (`medgemma-4b-it.F16-mmproj.gguf`) en F16, lo que confirma que la entrada de imagen se procesa a traves de dicho proyector y se inyecta en el modelo de lenguaje.

El proceso de ajuste fino y conversion a GGUF se realizo con Unsloth, segun la model card, que menciona un entrenamiento "2x mas rapido" gracias a dicha herramienta. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detalla la innovacion concreta del ajuste "symptom" mas alla del nombre del repositorio. La model card indica que el comportamiento del token BOS se ajusto para compatibilidad con GGUF.

## Capacidades
- Generacion de texto conversacional en el dominio medico, presumiblemente orientada a descripcion y evaluacion de sintomas.
- Procesamiento de imagenes (vision-lenguaje) mediante el proyector multimodal incluido, lo que permite analizar imagenes medicas o capturas junto con texto.
- Inferencia local mediante llama.cpp, con soporte de plantillas de chat via `--jinja`.
- Compatibilidad con `llama-cli` (texto) y `llama-mtmd-cli` (multimodal).
- No se documenta soporte explicito de tool calling o function calling.
- No se documenta soporte de agentes o razonamiento multi-paso.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- No se documenta modo "thinking" ni entrada de audio.

## Casos de uso
- Triaje de sintomas en local: el modelo puede recibir una descripcion textual de sintomas y generar una evaluacion preliminar o preguntas de seguimiento, ejecutandose en un portatil con llama.cpp sin enviar datos a la nube.
- Analisis de imagenes clinicas basicas: usando `llama-mtmd-cli` con el proyector mmproj, se puede pasar una imagen (por ejemplo, una fotografia de una lesion cutanea) junto con una pregunta en texto para obtener una descripcion orientativa.
- Asistente de anamnesis para estudiantes de medicina: conversaciones multi-turno para practicar la recogida estructurada de sintomas, con el modelo actuando como paciente simulado o como guia.
- Prototipado de aplicaciones sanitarias offline: al caber en hardware de consumo y no requerir API externa, sirve para validar flujos de UX en clinicas con conectividad limitada.
- Generacion de resumenes de sintomas para derivacion: a partir de una transcripcion o nota breve, el modelo puede estructurar los sintomas principales en un formato legible para el profesional.
- Educacion al paciente: respuestas en lenguaje natural sobre sintomas comunes y cuando consultar a un medico, con la advertencia de que no sustituye diagnostico profesional.
- Investigacion en NLP clinico: como baseline cuantizado y ligero para experimentos de evaluacion de modelos medicos en entornos con recursos limitados.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: el archivo Q4_K_M de un modelo de ~3,9 B ocupa aproximadamente 2,3-2,5 GB; sumando el mmproj F16 (del orden de cientos de MB) y el contexto, se estima un uso de 3-4 GB de VRAM para inferencia multimodal.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para comodidad (RTX 3060, RTX 4060, RTX 4070); en el segmento profesional, A100 o H100 no son necesarias pero funcionarian con holgura.
- Cabe en GPU de consumo: si, en la mayoria de GPUs modernas con 6 GB o mas; tambien puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`), Ollama con limitaciones (no soporta mmproj separado; requiere crear un modelo unificado desde el bf16 merged, segun la model card). No se documenta soporte de vLLM ni TGI para este formato GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| medgemma-4b-symptom-gguf | ~3,9 B | no disponible | Si (mmproj) | no disponible | GGUF |
| MedGemma 4B (base de Google) | ~4 B | no disponible en esta ficha | Si | no disponible en esta ficha | safetensors y otros |
| Gemma 3 4B (base de Google) | ~4 B | no disponible en esta ficha | Si | no disponible en esta ficha | safetensors, GGUF |
| Llama 3.2 3B Instruct | ~3,2 B | no disponible en esta ficha | No (solo texto) | no disponible en esta ficha | safetensors, GGUF |

La comparativa se limita a la categoria por tamano y naturaleza multimodal; no se dispone de datos de rendimiento para establecer diferencias cuantitativas.

## Limitaciones y advertencias
- Ausencia total de model card detallada: no se documentan datos de entrenamiento, evaluacion ni sesgos conocidos.
- Riesgo elevado de alucinacion en dominio medico, especialmente en un finetune sin evaluacion publicada; no debe usarse como herramienta diagnostica.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; el modelo base MedGemma y Gemma tienen sus propias condiciones que probablemente apliquen, pero deben verificarse.
- Idiomas no declarados: se desconoce el soporte real de castellano y de otros idiomas.
- Contexto no documentado: no se puede planificar su uso en conversaciones largas sin verificar empiricamente la ventana efectiva.
- Limitacion de despliegue en Ollama: no soporta el archivo mmproj separado, lo que obliga a crear un modelo unificado en bf16, incrementando los requisitos de memoria.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni validacion externa.
- El ajuste "symptom" no esta descrito; se desconoce que sesgos o especializaciones introduce respecto al MedGemma base.

## Enlaces
- Hugging Face: https://huggingface.co/luci00100/medgemma-4b-symptom-gguf
- Unsloth (herramienta de finetune y conversion): https://github.com/unslothai/unsloth
- llama.cpp (motor de inferencia): no se proporciona enlace en la informacion disponible, pero es el runtime implicito por el formato GGUF.
