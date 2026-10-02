# sanyam2005/anlp-a2-part2-mars

## Resumen

anlp-a2-part2-mars es un modelo de lenguaje causal de tipo decoder-only denso con 27.269.632 parametros, desarrollado por Sanyam Agrawal (usuario sanyam2005 en HuggingFace, estudiante de segundo ano en IIIT Hyderabad) como parte de la asignatura ANLP (Advanced Natural Language Processing), asignacion 2, parte 2. No es un modelo pensado para produccion ni para uso general: se trata de un experimento academico cuyo objetivo principal es validar la implementacion desde cero de un optimizador denominado MARS (una variante de AdamW con reduccion de varianza), no la calidad final del texto generado.

El modelo se entrena desde cero sobre el corpus `browndw/human-ai-parallel-corpus`, con una unica pasada (1x) sobre el dataset, acumulando 41.648.128 tokens. Los resultados reportados por el autor son una perdida de validacion final de 3.6678 y un BLEU de 1.39 sobre continuaciones de 64 tokens, cifras que reflejan un modelo en fase muy temprana de entrenamiento y con capacidad generativa muy limitada.

Su relevancia es, por tanto, fundamentalmente metodologica y educativa: sirve como referencia reproducible para comparar el comportamiento del optimizador MARS frente a AdamW en un presetup controlado y de bajo coste. Se publica en formato safetensors, con 0 descargas y 0 likes en el momento de redactar esta ficha, y sin licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (causal LM) |
| Parametros totales | 27.269.632 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0.1 GB |
| Tokens de entrenamiento | 41.648.128 |
| Optimizador | MARS (variante de AdamW con reduccion de varianza) |
| Dataset | browndw/human-ai-parallel-corpus |
| Perdida de validacion final | 3.6678 |
| BLEU de test (continuacion de 64 tokens) | 1.39 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de 27.269.632 parametros, entrenado desde cero con objetivo de modelado de lenguaje causal. La model card no detalla el numero de capas, la dimension oculta, el numero de cabezas de atencion, la funcion de activacion ni la longitud de contexto, por lo que estos datos figuran como no disponibles. Tampoco se especifica el tokenizador ni el tamano de vocabulario.

El elemento central del trabajo no es la arquitectura, sino el optimizador: MARS, descrito como una variante de AdamW con reduccion de varianza, implementado desde cero. Los hiperparametros reportados son learning rate 0.002, betas [0.95, 0.99], epsilon 1e-08, weight decay 0.1, gamma 0.025 y max_correction_norm 1.0. El entrenamiento consumio 41.648.128 tokens sobre una unica pasada del corpus `browndw/human-ai-parallel-corpus`. No se menciona el uso de RLHF, DPO, SFT ni ninguna fase de alineacion posterior al preentrenamiento, ni tecnicas de decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto causal en ingles: continuacion de secuencias de texto, con calidad muy limitada segun las metricas reportadas.
- Modelado de lenguaje base: calculo de probabilidades y perdidas sobre texto en ingles.
- No dispone de modo de razonamiento explicito (thinking mode), vision, audio ni capacidades multimodales.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de soporte para agentes ni razonamiento multi-paso.
- Capacidad multilingue practicamente inexistente: el modelo se entreno solo con datos en ingles.
- Uso principal como banco de pruebas para comparar el optimizador MARS frente a alternativas como AdamW.

## Casos de uso

- Estudio comparativo de optimizadores: el modelo permite reproducir un presetup de bajo coste (27M de parametros, 41,6M de tokens) para medir el efecto de MARS frente a AdamW en la misma arquitectura y dataset.
- Docencia e investigacion academica: sirve como ejemplo completo de pipeline de preentrenamiento desde cero, util en cursos de NLP para ilustrar el ciclo datos-entrenamiento-evaluacion.
- Experimentos de ablacion: con 0.1 GB de repositorio y un coste computacional minimo, es adecuado para iterar rapidamente sobre hiperparametros de optimizacion sin grandes recursos.
- Generacion de continuaciones en ingles en entornos controlados: util para observar el comportamiento de un modelo subentrenado en tareas de continuacion de 64 tokens, no para calidad de salida.
- Punto de partida para fine-tuning especifico: al estar en safetensors, puede cargarse con la libreria transformers y ajustarse en tareas pequenas de clasificacion o generacion, aunque la base es muy debil.
- Validacion de infraestructura: sirve para verificar pipelines de carga de safetensors, tokenizacion y evaluacion (loss, BLEU) antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las unicas metricas reportadas por el autor son las siguientes:

| Metrica | Valor |
|---|---|
| Perdida de validacion final | 3.6678 |
| BLEU de test (continuacion de 64 tokens) | 1.39 |
| Tokens de entrenamiento | 41.648.128 |

No se dispone de comparaciones con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 109 MB en fp32 (27,27M parametros x 4 bytes) y unos 55 MB en fp16. Cabe holgadamente en cualquier GPU consumer, integrada o incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; no requiere A100 ni H100. Una RTX 3060, GTX 1650 o similar es mas que suficiente.
- Compatibilidad con consumer GPU: si, en practicamente todas las GPU modernas, e incluso en Raspberry Pi o equipos sin GPU dedicada.
- Opciones de despliegue: carga directa con la libreria transformers (pesos safetensors); llama.cpp u Ollama requeririan conversion previa a GGUF, no publicada por el autor. vLLM y TGI son tecnicamente posibles pero sobredimensionados para este tamano.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dado el tamano, se espera una latencia muy baja en cualquier hardware moderno.

## Comparativa con modelos similares

No se dispone de datos suficientes sobre la longitud de contexto ni sobre el rendimiento de este modelo mas alla de la perdida de validacion y el BLEU reportados, lo que impide una comparacion rigurosa. A modo orientativo, se incluyen referencias de la misma escala de parametros:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| anlp-a2-part2-mars | 27,27M | no disponible | no disponible | Experimental, subentrenado (41,6M tokens) |
| GPT-2 small | 124M | 1024 | MIT | Entrenado con WebText, uso general |
| SmolLM-135M | 135M | 2048 | Apache 2.0 | Entrenado con datasets curados a gran escala |

La comparacion debe interpretarse con cautela: el modelo de esta ficha tiene un orden de magnitud menos de parametros y, sobre todo, muchas menos horas de computo, por lo que no es competitivo en calidad de generacion.

## Limitaciones y advertencias

- Modelo experimental academico: no esta pensado para uso en produccion ni para tareas reales.
- Calidad generativa muy baja: BLEU de 1.39 en continuaciones de 64 tokens y perdida de validacion de 3.6678 indican un modelo subentrenado.
- Alto riesgo de alucinacion y de generar texto incoherente, dada la escasez de tokens de entrenamiento (41,6M).
- Entrenado con una unica pasada sobre un unico corpus, lo que limita la diversidad y cobertura del conocimiento.
- Solo soporta ingles; no hay capacidades multilingues.
- Licencia no declarada: no hay autorizacion explicita para uso comercial ni condiciones claras de redistribucion. Conviene contactar con el autor antes de cualquier uso.
- Sin informacion sobre sesgos del dataset de entrenamiento ni sobre procesos de mitigacion.
- Longitud de contexto desconocida, lo que dificulta planificar su uso en tareas que requieran ventanas amplias.
- Sin datos de benchmarks estandar que permitan evaluar su comportamiento en tareas concretas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sanyam2005/anlp-a2-part2-mars
- Copia/duplicado en HuggingFace (neemon): https://huggingface.co/neemon/anlp-a2-part2-mars
- Perfil de HuggingFace del autor: https://huggingface.co/sanyam2005/models
- Perfil de GitHub del autor: https://github.com/Sanyam2005
- Dataset de entrenamiento: https://huggingface.co/datasets/browndw/human-ai-parallel-corpus
