# kabaros/ar-camel-ebooks-heavy-8.3M

## Resumen

El modelo `kabaros/ar-camel-ebooks-heavy-8.3M` es un modelo de lenguaje causal de tipo GPT-2, entrenado específicamente para árabe, con aproximadamente 17 millones de parámetros. Forma parte de un conjunto de seis modelos desarrollados en el marco de una disertación de máster en la Universidad de Stirling, cuyo objetivo era estudiar el impacto de la tokenización y la composición del corpus en modelos de lenguaje árabe a pequeña escala. Este modelo concreto se entrenó sobre un corpus de 8,3 millones de palabras compuesto íntegramente por libros electrónicos (ebooks), sin incluir otros géneros como wiki, películas o habibi.

La relevancia de este modelo radica en su contribución a la investigación sobre modelos de lenguaje para lenguas de bajos recursos, como el árabe, y en la exploración de técnicas de tokenización con segmentación morfológica. Su tamaño reducido lo hace accesible para experimentación en entornos con recursos limitados, y su rendimiento en la tarea de juicio de gramaticalidad (MultiBLiMP) supera al baseline de BabyLM-community, aunque queda lejos de modelos mucho más grandes como OLMo-2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (causal LM) |
| Parametros totales | 17.067.008 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arabe (ar) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 con 4 capas transformer, 8 cabezas de atencion, dimension de embedding de 512 y una ventana de contexto de 512 tokens. Se trata de un modelo denso, sin mezcla de expertos. El entrenamiento se realizo sobre un corpus arabe de aproximadamente 8,3 millones de palabras, compuesto exclusivamente por libros electronicos (100% ebooks), como parte de un estudio comparativo de seis composiciones de dataset. El tokenizador empleado es CAMeL (BPE) con segmentacion morfologica, implementado como una subclase de `PreTrainedTokenizerFast` que aplica dicha segmentacion antes de cada llamada a `encode`. No se menciona el uso de tecnicas como RLHF o DPO; el entrenamiento es de modelado de lenguaje causal estandar.

## Capacidades

- Generacion de texto en arabe: el modelo puede producir texto coherente en arabe, aunque con limitaciones propias de su tamano y contexto.
- Evaluacion de gramaticalidad: ha sido evaluado en la tarea MultiBLiMP de juicio de pares minimos, obteniendo una puntuacion de 80.33, lo que indica cierta capacidad para distinguir construcciones gramaticales correctas de incorrectas.
- Tokenizacion con segmentacion morfologica: el tokenizador integra segmentacion morfologica, lo que puede mejorar el manejo de la morfologia rica del arabe.
- No se reportan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion academica en PLN arabe: el modelo sirve como punto de partida para estudiar el efecto de la composicion del corpus y la tokenizacion en modelos pequenos. Puede reproducirse y compararse con otros modelos del mismo conjunto.
- Prototipado de generacion de texto en arabe: dado su tamano reducido, es util para experimentar con generacion de texto en entornos sin GPU potentes, por ejemplo en tareas de completado de frases o generacion de contenido corto.
- Analisis de gramaticalidad: su buen rendimiento en MultiBLiMP lo hace adecuado para tareas de clasificacion de pares de oraciones gramaticales vs. no gramaticales, aunque con alcance limitado.
- Ensenanza y aprendizaje: puede utilizarse en cursos de PLN para ilustrar el entrenamiento de modelos de lenguaje desde cero y la importancia de la tokenizacion.
- Linea base para modelos mas grandes: sirve como referencia de bajo coste para comparar mejoras en arquitecturas o tecnicas de entrenamiento en arabe.
- Exploracion de tecnicas de segmentacion morfologica: el tokenizador personalizado puede reutilizarse en otros experimentos que requieran segmentacion morfologica para el arabe.

## Benchmarks y rendimiento

El unico benchmark reportado es MultiBLiMP (juicio de pares minimos, media de 3 semillas). El valor indicado corresponde a la ejecucion individual de este checkpoint publicado, que es la mejor de las 3 semillas entrenadas para ese dataset.

| Modelo | MultiBLiMP |
|---|---|
| kabaros/ar-camel-ebooks-heavy-8.3M (este modelo) | 80.33 |
| Baseline BabyLM-community/babylm-ara (BPE, una ejecucion) | 75.9 |
| OLMo-2 (32B params, 6T tokens) | 87.0 |

No se dispone de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en precision FP32 (17M de parametros). Con cuantizacion a 8 bits o 4 bits, la huella seria aun menor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo GTX 1050, RTX 2060, etc. Tambien puede ejecutarse en CPU.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU consumer actual.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI, o ejecutarse localmente con llama.cpp (si se convierte a GGUF) u Ollama. No se mencionan opciones especificas en la documentacion.
- Latencia y throughput: al ser un modelo muy pequeno, la latencia es minima (del orden de milisegundos por token en GPU). No se proporcionan cifras exactas.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos del mismo tamano y proposito en la informacion proporcionada. El unico punto de referencia es el baseline de BabyLM-community/babylm-ara, que es un modelo GPT-2 pequeno entrenado en arabe con tokenizacion BPE estandar. Este modelo supera a ese baseline en MultiBLiMP (80.33 vs 75.9), lo que sugiere que la combinacion de tokenizacion CAMeL con segmentacion morfologica y un corpus de ebooks puros mejora la gramaticalidad. No se conocen otros modelos comparables publicados con caracteristicas similares.

## Limitaciones y advertencias

- Tamano y contexto: con solo 17M de parametros y 512 tokens de contexto, el modelo tiene una capacidad limitada para tareas complejas y no puede manejar documentos largos.
- Idioma: entrenado exclusivamente en arabe; no soporta otros idiomas.
- Sesgo del corpus: al estar entrenado solo con libros electronicos, puede presentar sesgos hacia el registro literario y carecer de vocabulario coloquial o tecnico.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir contenido falso o inconsistente, especialmente fuera de su dominio de entrenamiento.
- Dependencia de codigo remoto: la carga requiere `trust_remote_code=True` debido al tokenizador personalizado, lo que implica ejecutar codigo externo y debe hacerse con precaucion.
- Licencia: CC-BY-4.0 permite uso comercial con atribucion, pero se recomienda revisar los terminos completos.
- No apto para produccion: su tamano y limitaciones lo hacen inadecuado para aplicaciones criticas o de alto volumen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kabaros/ar-camel-ebooks-heavy-8.3M
- Dataset asociado (composicion ebooks-heavy): https://huggingface.co/datasets/kabaros/ara-ebooks-heavy-8.3M
- Coleccion de modelos arabes (referencia general): https://huggingface.co/collections/masoudmarandi/arabic-models
