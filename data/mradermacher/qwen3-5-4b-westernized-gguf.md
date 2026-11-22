# mradermacher/Qwen3.5-4B-Westernized-GGUF

## Resumen

Qwen3.5-4B-Westernized-GGUF es la version cuantizada en formato GGUF del modelo hirundo-io/Qwen3.5-4B-Westernized, un ajuste fino del Qwen3.5-4B de Alibaba orientado a "desaprendizaje conductual" (behavioral unlearning). El modelo base parte de la familia Qwen3.5 y ha sido modificado para eliminar o atenuar comportamientos considerados no deseados, segun la etiqueta `behavioral-unlearning` que figura en su model card. Esta version la publica mradermacher, un conocido generador de cuantizaciones GGUF para la comunidad de inferencia local.

El modelo cuenta con 4.326.350.848 parametros totales (aproximadamente 4,3 mil millones), lo que lo situa en la gama de modelos pequenos y desplegables en hardware de consumo. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales. El repositorio ocupa 41 GB e incluye 13 cuantizaciones estaticas, desde Q2_K (2,1 GB) hasta f16 (8,8 GB), ademas de dos ficheros mmproj (Q8_0 y f16) que indican soporte multimodal de vision.

La relevancia de esta ficha radica en que combina tres factores poco habituales: un modelo pequeno de 4B, una intervencion de desaprendizaje conductual sobre el modelo base, y un conjunto completo de cuantizaciones GGUF listas para usar con llama.cpp, Ollama y otros motores de inferencia local. No obstante, la informacion publica disponible es muy limitada: no se detallan los datos de entrenamiento, los benchmarks ni la longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5); detalles no disponibles |
| Parametros totales | 4.326.350.848 (aprox. 4,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj Q8_0 y f16 |
| Idiomas soportados | en (segun model card); resto no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3.5-4B de Alibaba, un transformer decoder-only de aproximadamente 4,3 mil millones de parametros. El modelo base hirundo-io/Qwen3.5-4B-Westernized incorpora una intervencion de "behavioral unlearning" (desaprendizaje conductual), una tecnica que modifica los pesos para reducir ciertos comportamientos aprendidos durante el entrenamiento original. La model card no especifica que comportamientos concretos se eliminan ni la metodologia exacta (por ejemplo, si se uso gradient ascent, fine-tuning selectivo o edicion de pesos).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO en el ajuste fino. La etiqueta `merged` sugiere que el modelo resultante podria ser el producto de una fusion de pesos, pero no se detalla el proceso. Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. La presencia de ficheros mmproj indica que el modelo conserva capacidades multimodales de vision, presumiblemente heredadas del Qwen3.5-4B original.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` confirma su orientacion a dialogos multi-turno.
- Capacidades multimodales de vision: la presencia de ficheros mmproj (Q8_0 y f16) indica soporte de entrada de imagenes, aunque no se detalla la resolucion ni el formato admitido.
- Razonamiento y codigo: no confirmado explicitamente en la informacion disponible; se heredaria del Qwen3.5-4B base.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: la model card solo declara `en`; no se confirman otros idiomas.
- Modo thinking: no disponible.
- Desaprendizaje conductual: el modelo ha sido modificado para atenuar comportamientos no deseados, segun la etiqueta `behavioral-unlearning`.

## Casos de uso

- Despliegue local en estaciones de trabajo: con cuantizaciones Q4_K_M de 2,9 GB, el modelo cabe en GPUs de consumo como una RTX 3060 de 12 GB o incluso en una RTX 4060 de 8 GB, permitiendo inferencia offline sin dependencia de la nube.
- Prototipado rapido de asistentes conversacionales: el tag `conversational` y su tamano reducido lo hacen adecuado para iterar en el diseno de prompts y flujos de dialogo antes de escalar a modelos mayores.
- Aplicaciones con requisitos de contenido moderado: la intervencion de desaprendizaje conductual puede resultar util en entornos donde se busca reducir respuestas problematicas, aunque sin garantias formales de alineamiento.
- Procesamiento de imagenes en local: gracias a los ficheros mmproj, puede emplearse para tareas de descripcion de imagenes o respuesta visual a preguntas (VQA) en entornos con requisitos de privacidad.
- Educacion y experimentacion con tecnicas de unlearning: util como caso de estudio para investigadores que analizan el efecto del desaprendizaje conductual sobre las capacidades generales de un modelo de 4B.
- Integracion en pipelines de CI/CD para generacion de texto: su licencia Apache 2.0 y su formato GGUF permiten incorporarlo a herramientas de automatizacion sin coste de licencia, siempre que se validen las salidas.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 13 variantes, lo que facilita estudios de degradacion de calidad frente a tamano en un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 2,5 y 3,5 GB para cuantizaciones Q4 (Q4_K_S 2,7 GB, Q4_K_M 2,9 GB); entre 4 y 5 GB para Q8_0 (4,7 GB); aproximadamente 9 GB para f16 (8,8 GB). A estas cifras hay que sumar el espacio para el contexto KV cache, que depende de la longitud de contexto (no documentada).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 8/16 GB, RTX 4070, RTX 4090; en el ambito profesional, A100 o H100 para despliegues con concurrencia.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU con 6 GB o mas usando Q4_K_M; en GPUs de 4 GB solo con Q2_K o Q3_K_S.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y motores compatibles con GGUF. Para el modelo base en safetensors, vLLM o TGI (previa conversion).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-Westernized (este) | 4,3 B | no disponible | Apache 2.0 | GGUF, safetensors | Variante con desaprendizaje conductual y vision |
| Qwen3.5-4B (base original) | ~4 B | no disponible | Apache 2.0 | safetensors | Modelo sin la intervencion de unlearning |
| Llama 3.2 3B Instruct | 3,2 B | 128 K | Llama 3.2 Community License | GGUF, safetensors | Alternativa de tamano similar con contexto documentado |
| Phi-3.5-mini Instruct | 3,8 B | 128 K | MIT | GGUF, safetensors | Alternativa pequena con contexto largo y licencia permisiva |

La comparativa se limita a modelos de la misma franja de tamano; no se dispone de datos de rendimiento comparativo para este modelo concreto.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible evaluar su calidad frente a alternativas sin pruebas propias.
- Longitud de contexto no documentada: un factor critico para planificar aplicaciones con ventanas largas.
- Idiomas: la model card solo declara ingles; el rendimiento en castellano no esta verificado y podria ser deficiente.
- Riesgo de alucinacion: inherente a los modelos de 4B, especialmente en tareas de razonamiento complejo o datos factuales.
- Efectos secundarios del desaprendizaje: la intervencion conductual puede degradar capacidades generales no relacionadas, y no se documenta que comportamientos se han eliminado ni con que metodo.
- Sesgos: no se documentan evaluaciones de sesgo; el modelo base Qwen3.5 puede arrastrar sesgos de sus datos de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el usuario es responsable del cumplimiento normativo en su jurisdiccion.
- Modelo derivado sin mantenimiento documentado: creado el 19 de noviembre de 2026, sin actualizaciones posteriores registradas ni issues resueltos.
- Vision: aunque incluye mmproj, no se especifican resoluciones, formatos ni calidad del soporte multimodal.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-4B-Westernized-GGUF
- Modelo base: https://huggingface.co/hirundo-io/Qwen3.5-4B-Westernized
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Qwen3.5-4B-Westernized-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.5-4B-Westernized-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
