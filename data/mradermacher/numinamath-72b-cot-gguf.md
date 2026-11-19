# mradermacher/NuminaMath-72B-CoT-GGUF

## Resumen

NuminaMath-72B-CoT-GGUF es la versión cuantizada en formato GGUF del modelo project-numina/NuminaMath-72B-CoT, un modelo de lenguaje especializado en razonamiento matemático con cadena de pensamiento (chain-of-thought, CoT). Lo publica mradermacher, un conocido cuantizador de la comunidad de Hugging Face que genera versiones GGUF de modelos populares para su uso con llama.cpp y herramientas compatibles. El modelo base fue desarrollado en el contexto de la AI Mathematical Olympiad (AIMO) y está afinado sobre el dataset AI-MO/NuminaMath-CoT.

El modelo parte de una arquitectura transformer densa de aproximadamente 72.700 millones de parámetros (72.706.203.648 parámetros según los pesos en safetensors del modelo base), lo que lo sitúa en la categoría de modelos de gran escala tipo Qwen2.5-72B, dado que la licencia declarada es tongyi-qianwen y el tamaño coincide con el de la familia Qwen2.5. Está entrenado específicamente para resolver problemas matemáticos mediante razonamiento paso a paso, no como un modelo generalista.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo matemático de 72B en hardware de consumo o en servidores modestos mediante cuantización GGUF, con opciones desde Q2_K (29,9 GB) hasta Q8_0 (77,4 GB). Es un recurso útil para investigadores que necesitan evaluar razonamiento matemático de alta calidad sin infraestructura de GPU de datacenter, aunque con las limitaciones de calidad propias de las cuantizaciones agresivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen2.5-72B, inferido por licencia tongyi-qianwen y tamaño) |
| Parametros totales | 72.706.203.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | other (tongyi-qianwen) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base project-numina/NuminaMath-72B-CoT es un transformer denso de 72.700 millones de parámetros. Por la licencia tongyi-qianwen y el tamaño, se corresponde con la arquitectura de la familia Qwen2.5-72B, aunque la model card del cuantizador no detalla la arquitectura interna. El entrenamiento se realizó sobre el dataset AI-MO/NuminaMath-CoT, un corpus de problemas matemáticos con soluciones en formato de cadena de pensamiento, diseñado para el reto AIMO (AI Mathematical Olympiad). No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO.

La innovación principal es el ajuste fino específico para razonamiento matemático con CoT: el modelo está optimizado para generar soluciones paso a paso en lugar de respuestas directas, lo que mejora la precisión en problemas de competición. La versión GGUF que nos ocupa es una cuantización estática (static quants) generada por mradermacher, sin imatrix, lo que implica que existe una variante alternativa con quants ponderados/imatrix en el repositorio NuminaMath-72B-CoT-i1-GGUF. No se documentan innovaciones como decodificación especulativa o atención lineal en la información disponible.

## Capacidades

- Generación de texto y razonamiento matemático paso a paso mediante cadena de pensamiento (CoT).
- Resolución de problemas de matemáticas de competición (estilo AIMO, olimpiadas).
- Razonamiento multi-paso con explicaciones intermedias.
- Capacidad conversacional (etiqueta conversational en el repositorio).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning más allá del CoT matemático: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card (language: en).
- Capacidades especiales (visión, audio, thinking mode explícito): no disponible.

## Casos de uso

- Resolución de problemas matemáticos de competición: el modelo está afinado sobre NuminaMath-CoT y genera soluciones paso a paso, adecuado para preparación de olimpiadas y evaluación de razonamiento matemático.
- Generación de explicaciones didácticas de matemáticas: puede producir soluciones detalladas con pasos intermedios, útil para plataformas educativas que necesitan mostrar el razonamiento y no solo el resultado.
- Evaluación y benchmarking de razonamiento matemático: sirve como referencia de 72B en tareas de matemáticas para comparar con modelos más pequeños o con versiones cuantizadas.
- Investigación en cadenas de pensamiento: permite estudiar cómo varía la calidad del CoT según la cuantización (Q2_K frente a Q8_0) en un mismo modelo base.
- Despliegue en hardware de consumo: con Q4_K_M (47,5 GB) puede ejecutarse en estaciones con 48 GB de VRAM o en configuraciones con offloading a CPU, permitiendo experimentar con un 72B matemático sin datacenter.
- Generación de datasets sintéticos matemáticos: el modelo puede producir problemas resueltos con trazas de razonamiento para aumentar corpus de entrenamiento, siempre con revisión humana por riesgo de alucinación.
- Integración en pipelines de verificación simbólica: como generador de pasos candidatos que luego se validan con un solver simbólico (SymPy, Lean), aprovechando su formato CoT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~30 GB, Q3_K_M ~38 GB, IQ4_XS ~40 GB, Q4_K_M ~48 GB, Q5_K_M ~55 GB, Q6_K ~64 GB, Q8_0 ~77 GB.
- GPU recomendadas: A100 80 GB o H100 para Q6_K y Q8_0; A100 40 GB, L40S 48 GB o RTX 6000 Ada 48 GB para Q4_K_M; configuraciones multi-GPU para cuantizaciones altas.
- ¿Cabe en GPU de consumo? Q4_K_S y Q4_K_M caben en una RTX 4090 (24 GB) solo con offloading parcial a CPU/RAM; Q2_K tampoco cabe íntegro en 24 GB. Para ejecución completa en GPU de consumo se requiere offloading o multi-GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Los archivos Q5_K_S en adelante están partidos en dos partes que deben concatenarse.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware y del grado de offloading.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NuminaMath-72B-CoT-GGUF (este) | 72,7B | no disponible | tongyi-qianwen | GGUF | Cuantización comunitaria de un 72B matemático CoT |
| project-numina/NuminaMath-72B-CoT | 72,7B | no disponible | tongyi-qianwen | safetensors | Modelo base original, sin cuantizar |
| mradermacher/NuminaMath-72B-CoT-i1-GGUF | 72,7B | no disponible | tongyi-qianwen | GGUF (imatrix) | Variante con quants ponderados, mayor calidad por tamaño |
| Modelos matemáticos de 7B (p. ej. Qwen2.5-Math-7B) | ~7B | no disponible | no disponible | safetensors/GGUF | Mucho más ligeros, menor capacidad de razonamiento en problemas difíciles |

No se dispone de datos de benchmarks para establecer comparaciones de rendimiento cuantitativas con alternativas.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está afinado para matemáticas; su rendimiento en tareas generales de lenguaje puede ser inferior al de un modelo generalista del mismo tamaño.
- Idioma: la model card declara únicamente inglés; el rendimiento en castellano no está documentado y probablemente sea limitado.
- Riesgo de alucinación: como todo modelo generativo, puede producir pasos de razonamiento plausibles pero incorrectos; en matemáticas esto es especialmente crítico y requiere verificación.
- Calidad de cuantización: Q2_K y Q3_K_M degradan notablemente la calidad; para uso serio se recomienda Q4_K_M o superior, y valorar la variante i1 (imatrix).
- Licencia: tongyi-qianwen (declarada como "other"); es necesario revisar los términos de la licencia Qwen para uso comercial, que impone condiciones adicionales.
- Contexto: no se ha documentado la longitud de contexto en la información disponible; no asumir ventanas largas sin verificar.
- Archivos multiparte: las cuantizaciones Q5_K_S en adelante están divididas en dos ficheros que deben concatenarse antes de su uso.
- Sin garantías del cuantizador: mradermacher distribuye las cuantizaciones sin garantía de calidad ni soporte; el mantenimiento depende de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/NuminaMath-72B-CoT-GGUF
- Modelo base: https://huggingface.co/project-numina/NuminaMath-72B-CoT
- Variante imatrix: https://huggingface.co/mradermacher/NuminaMath-72B-CoT-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#NuminaMath-72B-CoT-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/AI-MO/NuminaMath-CoT
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
