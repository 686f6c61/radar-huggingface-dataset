# mradermacher/Qwen3.5-4B-Westernized-i1-GGUF

## Resumen

Qwen3.5-4B-Westernized-i1-GGUF es la distribucion en formato GGUF del modelo hirundo-io/Qwen3.5-4B-Westernized, publicada por el usuario mradermacher. Se trata de una cuantizacion con imatrix (matriz de importancia) del modelo base, que a su vez es un ajuste fino de la familia Qwen3.5 de 4B de parametros orientado a "desaprendizaje conductual" (behavioral unlearning) y "occidentalizacion" de respuestas. El paquete incluye 22 variantes de cuantizacion que van desde i1-Q2_K (2,1 GB) hasta i1-Q6_K (3,7 GB), ademas del fichero imatrix para generar cuantizaciones propias.

El modelo cuenta con 4.326.350.848 parametros totales (segun los safetensors del repo) y se distribuye bajo licencia Apache 2.0. La model card indica que es un modelo de vision, con ficheros mmproj disponibles en el repositorio estatico hermano (mradermacher/Qwen3.5-4B-Westernized-GGUF). El idioma declarado es unicamente ingles (en).

Su relevancia practica radica en que permite ejecutar un modelo de 4B con capacidades conversacionales y posible soporte de vision en hardware de consumo, con cuantizaciones de 2-4 GB que caben en GPUs de gama media y en CPU con suficiente RAM. El etiquetado como "behavioral-unlearning" sugiere que el ajuste fino busca modificar el comportamiento por defecto del modelo base, un caso de uso cada vez mas frecuente en despliegues que requieren alineacion especifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda de Qwen3.5-4B; transformer presumiblemente, sin confirmar) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas fichero imatrix) |
| Idiomas soportados | en (segun model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la informacion proporcionada. El modelo deriva de Qwen3.5-4B, del que no se aportan especificaciones de capas, atencion o contexto. El modelo base hirundo-io/Qwen3.5-4B-Westernized esta etiquetado como "behavioral-unlearning" y "merged", lo que indica que se ha sometido a un proceso de ajuste fino orientado a modificar conductas no deseadas y que probablemente se han fusionado pesos de varios checkpoints o adaptadores.

Las cuantizaciones publicadas por mradermacher son de tipo "i1", es decir, generadas con imatrix (matriz de importancia calculada sobre un corpus de calibracion) y pesos ponderados, lo que en la practica mejora la perplejidad de las cuantizaciones de baja precision respecto a las estaticas. El autor indica que las cuantizaciones estaticas equivalentes estan en el repositorio Qwen3.5-4B-Westernized-GGUF. No se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta "conversational" del repositorio.
- Posible soporte de vision: la model card afirma explicitamente "This is a vision model", con ficheros mmproj en el repositorio estatico. No se detalla que tareas visuales cubre.
- Ajuste conductual ("westernized"): el modelo base esta modificado para alinear respuestas con valores o estilo occidental, segun la denominacion del autor.
- Capacidades multilingues: limitadas al ingles segun la model card; no se declaran otros idiomas.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo sin GPU dedicada: con cuantizaciones i1-Q4_K_M (2,9 GB) o i1-Q5_K_M (3,3 GB) el modelo puede ejecutarse en CPU con llama.cpp u Ollama, lo que facilita prototipos y pruebas sin infraestructura cloud.
- Asistentes conversacionales en ingles con requisitos de alineacion especifica: el ajuste "Westernized" y el etiquetado de behavioral unlearning lo hacen adecuado para productos donde se quiere un tono y unos valores concretos por defecto, reduciendo la necesidad de prompts de sistema largos.
- Filtrado y moderacion de contenido: el proceso de desaprendizaje conductual puede emplearse para suprimir respuestas no deseadas en pipelines de moderacion, aunque requiere validacion propia.
- Investigacion en desaprendizaje conductual: sirve como referencia reproducible para estudiar como afectan las tecnicas de unlearning a las capacidades generales de un modelo de 4B, comparando el base con el ajustado.
- Procesamiento de imagenes en aplicaciones ligeras: si se confirma el soporte de vision con los ficheros mmproj, podria usarse para descripcion de imagenes o extraccion de texto en entornos con recursos limitados.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 22 variantes del mismo modelo, lo que permite medir el impacto de la cuantizacion en calidad y velocidad para un caso de uso concreto antes de fijar la version de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,1 GB para i1-Q2_K; 2,7-2,9 GB para i1-Q4_K_S / i1-Q4_K_M; 3,3 GB para i1-Q5_K_M; 3,7 GB para i1-Q6_K (sin contar el overhead de contexto y el fichero mmproj si se usa vision).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para las cuantizaciones Q4/Q5 (por ejemplo, RTX 3060, RTX 4060, RTX 4090). Para Q6_K o contextos largos, se recomienda 8 GB o mas.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 6 GB o mas para Q4_K_M; con 4 GB es viable en Q3 o Q4_0.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; los tags indican "endpoints_compatible" y "transformers", por lo que tambien puede servirse con TGI si se usa el formato safetensors del modelo base. vLLM no soporta GGUF de forma nativa generalizada, por lo que para vLLM convendria el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-Westernized-i1-GGUF (este) | 4,33 B | no disponible | Apache 2.0 | GGUF (22 cuants) | Ajuste conductual, posible vision |
| Qwen3.5-4B-Westernized-GGUF (estatico) | 4,33 B | no disponible | Apache 2.0 | GGUF estatico | Mismo modelo, cuantizaciones sin imatrix |
| hirundo-io/Qwen3.5-4B-Westernized | 4,33 B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar |
| Qwen3.5-4B (original) | ~4 B | no disponible | no disponible | safetensors/GGUF | Referencia sin ajuste "Westernized" |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El ajuste "Westernized" y de behavioral unlearning puede introducir sesgos culturales o ideologicos deliberados; conviene auditar las respuestas antes de usarlo en produccion.
- Riesgo de alucinacion propio de un modelo de 4B: menor capacidad de razonamiento y mayor propension a inventar datos que modelos de mayor tamano.
- Idioma limitado al ingles segun la model card; el rendimiento en castellano no esta garantizado ni documentado.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad de forma notable; el autor recomienda IQ3_XXS o superiores frente a Q3_K*.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede arrastrar condiciones adicionales no reflejadas en esta ficha; verificar el repositorio de hirundo-io antes de desplegar.
- El soporte de vision depende de ficheros mmproj alojados en otro repositorio; si no se descargan, el modelo funciona solo como texto.
- No hay informacion sobre contexto maximo, lo que impide planificar conversaciones largas o tareas de retrieval con garantias.
- El repositorio tiene 0 likes y unas 1.315 descargas en el momento de la consulta; es una publicacion reciente (noviembre de 2026) sin validacion comunitaria amplia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-4B-Westernized-i1-GGUF
- Modelo base: https://huggingface.co/hirundo-io/Qwen3.5-4B-Westernized
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen3.5-4B-Westernized-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.5-4B-Westernized-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos del autor: https://huggingface.co/mradermacher/model_requests
