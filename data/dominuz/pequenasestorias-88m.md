# DominuZ/PequenasEstorias-88M

## Resumen

Pequenas Estórias 88M es un modelo de lenguaje de 88.101.120 parámetros entrenado desde cero por el usuario DominuZ exclusivamente con cuentos infantiles en portugués brasileño del dataset Pequenas Estórias (TinyStories-pt-BR). Se distribuye en formato GGUF, cuantizado en Q4_K_M, con un tamaño de archivo de 54 MB, y está pensado para ejecutarse en CPU sin GPU. La model card lo describe como el modelo base de una familia; una versión Instruct se entrenará sobre él en el futuro.

El modelo sigue la estela del trabajo TinyStories (arxiv:2305.07759), que demostró que modelos muy pequeños pueden generar texto coherente si se entrenan con un corpus restringido y sintácticamente simple. Aquí el objetivo es el mismo pero trasladado al portugués: producir cuentos infantiles con principio, nudo y desenlace a partir de una frase inicial en negrita. No es un modelo de propósito general ni un asistente conversacional.

Su relevancia actual es la de los small language models (SLM) orientados a tareas acotadas: demuestra que con 88M de parámetros y un corpus de aproximadamente dos millones de cuentos se puede obtener generación de texto en portugués con coherencia narrativa básica, desplegable en hardware mínimo. La licencia Apache 2.0 facilita su reutilización y experimentación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (etiquetado como qwen3 en los tags; detalles no disponibles) |
| Parámetros totales | 88.101.120 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (54 MB); otras cuantizaciones GGUF no disponibles |
| Idiomas soportados | Portugués (pt, pt-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (librería gguf, compatible con llama.cpp); safetensors referenciado para el recuento de parámetros |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de los tags de Hugging Face, que incluyen "qwen3". Se trata, por tanto, de un transformer decoder-only de 88M de parámetros, presumiblemente con una configuración inspirada en la familia Qwen3, aunque no se especifican número de capas, dimensión oculta, cabezas de atención ni mecanismos adicionales. No hay datos sobre si emplea atención lineal, decodificación especulativa u otras innovaciones.

El entrenamiento se realizó desde cero ("treinado do zero") exclusivamente con el dataset DominuZ/TinyStories-pt-BR, descrito en la model card como "dois milhões de contos simples". No se indica el número exacto de tokens, la composición detallada del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones; de hecho, la model card aclara que esta es la versión base y que la versión Instruct está pendiente. El corpus es de dominio restringido (cuentos infantiles), lo que explica tanto la coherencia narrativa en ese registro como la ausencia de capacidades generales.

## Capacidades

- Generación de texto narrativo en portugués brasileño: continúa una frase inicial y produce un cuento con inicio, desarrollo y desenlace.
- Coherencia narrativa básica dentro del registro de cuentos infantiles: personajes, diálogos simples y cierre de la historia.
- Generación en streaming o por lotes mediante llama.cpp.
- No dispone de tool calling ni function calling.
- No dispone de modo agente ni razonamiento multi-paso.
- No dispone de capacidades de visión, audio ni thinking mode.
- Capacidad multilingüe limitada al portugués; no se documenta soporte de otros idiomas.
- No es un modelo Instruct: no sigue instrucciones ni responde a preguntas; solo continúa texto.

## Casos de uso

- Generación de cuentos infantiles para aplicaciones educativas: el modelo recibe una frase inicial ("Era uma vez...") y completa una historia breve; su corpus de entrenamiento garantiza un tono y vocabulario adecuados para niños.
- Prototipado de narrativa asistida en portugués: útil para generar borradores de relatos cortos en talleres de escritura o herramientas de creatividad, dado que el modelo produce texto con estructura narrativa completa.
- Material de lectura para aprendizaje de portugués: los cuentos generados usan frases simples y vocabulario básico, lo que los hace apropiados como textos graduados para estudiantes de pt-BR.
- Experimentación en investigación sobre small language models: sirve como baseline reproducible para estudiar el efecto del tamaño de corpus y del dominio en la coherencia de modelos por debajo de 100M de parámetros.
- Despliegue en dispositivos de recursos limitados: con 54 MB en Q4_K_M y ejecución en CPU vía llama.cpp, puede integrarse en aplicaciones de escritorio, Raspberry Pi o entornos sin GPU para generar contenido offline.
- Generación de contenido de relleno en demos y pruebas: útil para poblar interfaces de prueba con texto en portugués realista sin depender de APIs externas.
- Fines educativos en docencia de NLP: permite ilustrar el pipeline completo (tokenización, entrenamiento desde cero, cuantización GGUF y despliegue con llama.cpp) con un modelo que cabe en cualquier portátil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; en Q4_K_M el archivo ocupa 54 MB y la inferencia puede ejecutarse íntegramente en CPU.
- GPU recomendadas: ninguna necesaria; cualquier GPU con soporte CUDA puede ejecutarlo, pero no aporta ventaja significativa frente a CPU dado el tamaño.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo (incluso integradas), aunque el cuello de botella será el ancho de banda de memoria, no la capacidad.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (previa conversión o importación del GGUF), y cualquier runtime compatible con GGUF. No se documenta soporte de vLLM ni TGI.
- Latencia y throughput estimados: no disponibles. Por el tamaño (88M de parámetros, 54 MB cuantizado), se espera una generación fluida en CPU moderna, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Pequenas Estórias 88M | 88M | no disponible | pt-BR | Apache 2.0 | GGUF | Entrenado solo con cuentos infantiles; modelo base |
| TinyStories (original, Microsoft) | 1M–33M (varias tallas) | no disponible | inglés | MIT (según paper) | varios | Corpus sintético en inglés; referencia del enfoque |
| Modelos Qwen3 pequeños | desde ~0,6B | hasta 32K en algunas variantes | multilingüe | Apache 2.0 | safetensors, GGUF | Propósito general; mucho mayor tamaño y capacidades |

La comparación directa con TinyStories es la más pertinente por metodología, aunque este modelo es en portugués y de mayor tamaño que las variantes originales. Frente a modelos de propósito general de tamaño similar, la diferencia es de dominio: Pequenas Estórias 88M solo genera cuentos, mientras que un modelo generalista pequeño cubre más tareas con menor calidad en narrativa infantil en pt-BR. No se dispone de datos de benchmarks para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Dominio extremadamente restringido: solo genera cuentos infantiles en portugués; fuera de ese registro producirá texto incoherente o repetitivo.
- No es un modelo Instruct: no sigue instrucciones, no responde preguntas y no mantiene conversaciones.
- Riesgo de alucinación narrativa: al ser un modelo base entrenado con cuentos sintéticos, puede generar incoherencias lógicas o mezclar elementos sin sentido dentro de la historia.
- Sesgos: el corpus TinyStories-pt-BR es sintético y simplificado; puede reproducir estereotipos de género o roles presentes en cuentos infantiles tradicionales, aunque no se documentan análisis de sesgo.
- Limitaciones de contexto: no se especifica la longitud máxima de contexto, lo que impide garantizar coherencia en historias largas.
- Limitaciones de idioma: solo portugués; no se garantiza un comportamiento correcto en otros idiomas.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías sobre la calidad o idoneidad del modelo para producción.
- Advertencia para producción: al ser un modelo base sin ajuste por instrucciones y con 0 descargas y 0 likes en el momento de la ficha, no hay evidencia de uso en producción ni validación externa.
- El recuento de parámetros (88.101.120) procede de safetensors, pero el artefacto distribuido es GGUF cuantizado; pueden existir diferencias menores de comportamiento entre la versión completa y la cuantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DominuZ/PequenasEstorias-88M
- Dataset de entrenamiento: https://huggingface.co/datasets/DominuZ/TinyStories-pt-BR
- Paper de referencia TinyStories: https://arxiv.org/abs/2305.07759
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
