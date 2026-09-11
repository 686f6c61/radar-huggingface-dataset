# mmaccrate/gemma-4-E2B-it-QAD-GGUF

## Resumen

Gemma 4 E2B IT — QAD Q4_0 GGUF es una versión cuantizada en formato GGUF del modelo google/gemma-4-E2B-it de Google, publicada por el usuario mmaccrate. La particularidad del artefacto no es solo la cuantización a Q4_0, sino el método con el que se ha obtenido: destilación con conciencia de cuantización (QAD, quantization-aware distillation), en la que un estudiante cuantizado se entrena contra las distribuciones a nivel de token de un profesor congelado en BF16.

El modelo aborda un problema concreto: la pérdida de calidad que introduce la cuantización posterior al entrenamiento (PTQ) convencional. Según la evaluación del autor, el QAD Q4_0 recupera entre 2 y 4 puntos porcentuales frente a un Q4_0 PTQ ordinario en ARC-Challenge y HellaSwag, y queda cerca del modelo F16 de referencia sin llegar a igualarlo en ARC.

Se distribuye como un único fichero GGUF de aproximadamente 3,3 GB, con 4.628.569.635 parámetros totales (unos 4,63 mil millones) y licencia Apache 2.0. Está pensado para inferencia local con llama.cpp y para investigación sobre cuantización y destilación, no como sustituto del modelo base en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No detallada en la model card; el modelo base pertenece a la familia Gemma de Google (transformers decoder-only). El autor no especifica si emplea MoE, atención lineal u otra variante |
| Parámetros totales | 4.628.569.635 (≈4,63 mil millones) |
| Parámetros activos | no disponible (la model card no indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_0 en pesos lineales y Q6_K en tensores de embedding y de salida. La evaluación compara además con el baseline PTQ Q4_0 y con la referencia F16 |
| Idiomas soportados | inglés (`en`), según los metadatos del repositorio |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero único `gemma-4-e2b-it-qad-q4_0.gguf`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base más allá de su pertenencia a la familia Gemma. Sí indica que el modelo base dispone de capacidades de imagen y audio, ya que el apartado de limitaciones aclara que la evaluación realizada cubre únicamente probabilidad de elección múltiple sobre texto y no dichas capacidades. El artefacto publicado es un export GGUF para inferencia de texto.

El entrenamiento siguió un esquema de destilación con conciencia de cuantización sobre `google/gemma-4-E2B-it` en la revisión `3e22461f65e89153144f8adb70e3b8c2cc9845a7`. Profesor congelado en BF16 y estudiante con todos los parámetros del modelo de lenguaje entrenables. Durante el paso forward y backward del estudiante se aplicó cuantización falsa mixta en formato GGUF (Q4_0 en lineales, Q6_K en embedding y salida), de modo que el estudiante se adapta a la pérdida de precisión en lugar de sufrirla después del entrenamiento. La pérdida es divergencia KL a nivel de token, calculada únicamente sobre los tokens del asistente. Se realizaron 453 pasos de optimizador sobre 100.262 tokens renderizados (83.004 de ellos tokens de asistente supervisados), con AdamW en FP32 para pesos maestros y momentos, learning rate constante de `1e-5`, recorte de gradiente en `1.0` y semilla `20260905`. El corpus son 453 pares usuario/asistente en inglés seleccionados de forma determinista a partir de `OpenAssistant/oasst1` (Apache-2.0), sin incluir las preguntas de los benchmarks.

## Capacidades

- Generación de texto conversacional en inglés, según el pipeline declarado (`text-generation`) y la etiqueta `conversational`.
- Formato de pesos GGUF de fichero único, pensado para ejecución local en `llama.cpp`.
- Entrenamiento orientado a preservar la calidad bajo cuantización Q4_0, lo que permite ejecución con huella de memoria reducida.
- No hay información en la model card sobre soporte de tool calling ni de function calling.
- No hay información sobre soporte de agentes, razonamiento multi-paso o modos de pensamiento explícitos.
- Capacidades multilingües: limitadas al inglés según los metadatos; no se declaran otros idiomas.
- El modelo base dispone de capacidades de imagen y audio, pero el autor no confirma que el export GGUF las conserve ni las ha evaluado.

## Casos de uso

- Inferencia local en portátil o estación de trabajo: con un fichero de unos 3,3 GB, el modelo puede ejecutarse en `llama.cpp` sobre GPU de gama media o incluso en CPU, lo que permite generar texto en inglés sin depender de servicios en la nube.
- Investigación sobre cuantización: sirve como artefacto de referencia para reproducir la comparación entre QAD Q4_0, PTQ Q4_0 ordinario y F16 bajo el mismo evaluador de verosimilitud de elección múltiple.
- Estudio de destilación con conciencia de cuantización: el repositorio de origen (`mmaccrate/maccrate.ai`) documenta la receta de datos, la implementación del entrenamiento, el flujo de exportación y los tests, lo que lo convierte en material didáctico para reproducir el método con otros modelos base.
- Prototipado de asistentes conversacionales en inglés: la etiqueta `conversational` y el formato de instrucciones lo hacen adecuado para probar flujos de diálogo en local antes de decidir si se escala a un modelo mayor.
- Despliegue con requisitos de privacidad: al ejecutarse íntegramente en la máquina del usuario, permite procesar texto en inglés sin que los datos abandonen el equipo.
- Evaluación comparativa de técnicas de cuantización: su tamaño contenido (4,63 mil millones de parámetros) permite lanzar baterías de benchmarks en una sola GPU consumer para contrastar distintos esquemas de cuantización.
- Generación de texto de bajo riesgo con revisión humana: resúmenes, borradores o reescritura en inglés donde el coste de un error es bajo y existe una etapa de validación posterior.
- Formación técnica: ilustra de forma práctica la diferencia entre PTQ y QAD usando métricas publicadas y un modelo reproducible en local.

## Benchmarks y rendimiento

Evaluación del autor con un evaluador nativo de verosimilitud de elección múltiple. ARC-Challenge usa las 1.172 preguntas de test disponibles; HellaSwag usa una muestra fija de 1.000 filas de validación. La modalidad «normalized» divide la log-verosimilitud de cada respuesta entre su número de caracteres antes de ordenar las opciones.

| Modelo | ARC raw | ARC normalized | HellaSwag raw | HellaSwag normalized |
|---|---:|---:|---:|---:|
| Original F16 | 48,04 % | 49,74 % | 44,20 % | 55,60 % |
| PTQ Q4_0 ordinario | 43,00 % | 45,99 % | 41,80 % | 53,80 % |
| **QAD Q4_0 (este modelo)** | **46,84 %** | **48,46 %** | **44,40 %** | **57,10 %** |

El QAD Q4_0 supera al PTQ Q4_0 ordinario en las cuatro medidas. Queda por debajo del F16 en ARC, empata prácticamente con el F16 en HellaSwag raw y solo lo supera bajo la regla secundaria normalizada de HellaSwag. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del artefacto: el repositorio ocupa 3,3 GB, correspondiente al fichero GGUF único.
- VRAM estimada (estimación a partir del tamaño del fichero, no publicada por el autor): en torno a 4 GB solo para los pesos, y aproximadamente 4-5 GB con caché KV para contextos moderados. El coste exacto de la caché KV no puede calcularse porque no se conoce la longitud de contexto del modelo base.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM, como RTX 3060 12 GB, RTX 4060, RTX 4060 Ti, RTX 4070, RTX 4080 o RTX 4090. También es viable en GPUs de 6 GB si se reduce el contexto.
- Cabe en GPU consumer: sí, es uno de los puntos fuertes del artefacto. También es razonable en equipos Apple Silicon con memoria unificada de 8 GB o más.
- Ejecución en CPU: posible con `llama.cpp`, requiriendo alrededor de 3,3 GB de RAM para los pesos más la memoria de la caché KV.
- Opciones de despliegue: `llama.cpp` es el runtime probado por el autor, con la revisión fijada `95ef7fc16054e63b427a3ef00188e055ef7586d8` para comparaciones numéricas reproducibles. Otros runtimes compatibles con GGUF no han sido verificados por el autor. No se declara soporte para vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ARC raw | HellaSwag raw | Licencia | Formato |
|---|---|---|---|---|---|---|
| google/gemma-4-E2B-it (F16) | 4,63 mil millones | no disponible | 48,04 % | 44,20 % | Apache 2.0 | safetensors / F16 |
| Q4_0 PTQ ordinario del mismo base | 4,63 mil millones | no disponible | 43,00 % | 41,80 % | Apache 2.0 | GGUF Q4_0 |
| **QAD Q4_0 (este modelo)** | 4,63 mil millones | no disponible | 46,84 % | 44,40 % | Apache 2.0 | GGUF Q4_0 (Q6_K en embedding y salida) |

La comparativa disponible se limita a estas tres variantes del mismo modelo base, que son las que el autor evalúa bajo un evaluador idéntico. No se han publicado en la información disponible comparaciones con modelos de otros fabricantes del mismo rango de parámetros.

## Limitaciones y advertencias

- Los resultados proceden de una única ejecución de entrenamiento y una única semilla (`20260905`), por lo que no hay evidencia de robustez estadística.
- La evidencia de calidad se limita a ARC-Challenge y a una muestra de 1.000 filas de HellaSwag; no hay evaluación de generación abierta, código, matemáticas ni instrucciones conversacionales.
- El QAD no superó al F16 en ARC ni en la métrica primaria de HellaSwag (solo en la regla normalizada), así que no debe presentarse como una mejora general sobre el modelo de precisión completa.
- El modelo puede heredar o amplificar errores, sesgos, comportamientos inseguros y alucinaciones del modelo base.
- El corpus de entrenamiento son 453 pares en inglés de `OpenAssistant/oasst1`; es un volumen muy reducido y no representa un ajuste de instrucciones exhaustivo.
- Idiomas: únicamente inglés según los metadatos; no se declara soporte para castellano ni otros idiomas.
- La evaluación no cubre las capacidades de imagen y audio del modelo base, y no se confirma que el export GGUF las conserve.
- Licencia: el modelo derivado se distribuye bajo Apache 2.0, pero está sujeto a la licencia Gemma 4 de Google y a sus políticas de uso aceptable, que conviene revisar antes de cualquier uso comercial.
- Cualquier aplicación en producción requiere evaluación específica de tarea, seguridad y calidad antes del despliegue.
- El repositorio presenta 0 descargas y 1 like en el momento de redactar esta ficha, sin validación independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mmaccrate/gemma-4-E2B-it-QAD-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Artículo del proyecto sobre QAD: https://maccrate.ai/projects/quantization-aware-distillation/
- Repositorio de código fuente (receta de datos, entrenamiento, exportación, tests y manifiesto de evaluación): https://github.com/mmaccrate/maccrate.ai
- Runtime de referencia: llama.cpp, revisión fijada `95ef7fc16054e63b427a3ef00188e055ef7586d8`
- Corpus de entrenamiento: https://huggingface.co/datasets/OpenAssistant/oasst1

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los únicos enlaces verificables son los recogidos en la model card del autor.
