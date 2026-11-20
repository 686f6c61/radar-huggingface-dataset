# dvschan/swedish-grammaticality-scorer

## Resumen

El Swedish grammaticality scorer es un modelo de clasificación de texto (regresión de una sola salida) desarrollado por el usuario de Hugging Face dvschan. Se trata de un fine-tuning del modelo base AI-Sweden-Models/ModernBERT-large, con 395,8 millones de parámetros, especializado en puntuar la corrección gramatical de texto en sueco con un valor continuo entre 0 (deficiente) y 1 (correcto). El modelo resuelve un problema concreto: la evaluación automática de la calidad gramatical de oraciones en sueco, algo útil para filtrar corpus, evaluar sistemas de generación o asistir en la revisión de texto.

La relevancia del modelo radica en su enfoque de regresión calibrada sobre ModernBERT, una arquitectura transformer moderna con atención eficiente y contexto extendido, adaptada al sueco mediante el modelo base de AI Sweden. El autor publica el conjunto de datos de entrenamiento y evaluación, así como el script de inferencia, lo que facilita la reproducibilidad. El modelo se distribuye con licencia Apache 2.0 y está pensado para integrarse en pipelines de procesamiento de lenguaje natural en sueco.

El repositorio tiene un tamaño de 1,6 GB y se distribuye en formato safetensors, con soporte para la librería transformers y compatibilidad con text-embeddings-inference y endpoints. El modelo fue creado y actualizado en noviembre de 2026, y en el momento de la consulta no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder) |
| Parametros totales | 395.832.321 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso trunca a 256 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | sueco (sv) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en ModernBERT-large, un transformer encoder de 395 millones de parámetros que incorpora mejoras sobre BERT clásico, como atención eficiente y mayor longitud de contexto (aunque la longitud exacta no se detalla en la información disponible). Sobre esta base, el autor ha añadido una cabeza de clasificación para regresión con una única salida, entrenada con error cuadrático medio (MSE) sobre el logit crudo. Para mapear el logit a la escala 0-1 se requiere una calibración explícita mediante la función sigmoide `sigmoid(a * logit + b)` con `a = 5.29` y `b = -2.62`, disponible en el archivo `calibration.json` del repositorio.

Los datos de entrenamiento consisten en 8.325 pares de oraciones limpias y corrompidas, construidos a partir de 10.000 oraciones de Wikipedia en sueco, más 478 ejemplos iniciales, totalizando 17.128 filas. Cada par contiene una oración limpia y una copia con entre 1 y 3 errores introducidos mediante reglas. Las reglas de error cubren nueve categorías: género del artículo, definitud, orden verbo-segundo, orden de palabras, deleción, duplicación, `de`/`dem`, forma verbal y ortografía. Los conjuntos de validación y test sintético tienen 922 y 926 filas respectivamente, publicados en el dataset del autor. No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado con MSE.

## Capacidades

- Puntuación de gramaticalidad en sueco: genera un valor continuo entre 0 y 1 que indica la calidad gramatical de una oración o texto.
- Detección de errores gramaticales cubiertos por las nueve reglas de entrenamiento: género del artículo, definitud, orden verbo-segundo, orden de palabras, deleción, duplicación, `de`/`dem`, forma verbal y ortografía.
- Clasificación de texto con una sola salida de regresión, adecuada para ranking y filtrado.
- Procesamiento de texto en sueco exclusivamente; no se reportan capacidades multilingües.
- No se reportan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- El modelo requiere calibración obligatoria para que las puntuaciones sean interpretables en la escala 0-1; sin ella, el ranking se mantiene pero las puntuaciones se concentran cerca de 0,7.

## Casos de uso

- Filtrado de corpus en sueco: el modelo puede puntuar oraciones de un corpus web o de Wikipedia para descartar aquellas con baja calidad gramatical antes de usarlas en el entrenamiento de otros modelos. Su salida continua permite fijar umbrales ajustables según la tolerancia a errores.
- Evaluación de sistemas de generación de texto en sueco: se puede utilizar para medir la fluidez gramatical de las salidas de un modelo de traducción o de generación, comparando puntuaciones medias entre versiones del sistema.
- Revisión ortográfica y gramatical asistida: integrado en una herramienta de edición, el modelo puede señalar oraciones problemáticas para que un revisor humano las examine, priorizando las de puntuación más baja.
- Control de calidad en pipelines de datos: en un proceso ETL de textos en sueco, el scorer puede actuar como filtro automático para garantizar que solo se indexan o publican fragmentos gramaticalmente aceptables.
- Investigación en lingüística computacional: el modelo y su dataset asociado permiten estudiar la percepción automática de errores gramaticales en sueco y comparar con juicios humanos, gracias a la publicación de los conjuntos de validación y test.
- Detección de errores específicos en textos de aprendices: aunque el modelo se entrenó con errores sintéticos, puede emplearse como primera aproximación para identificar oraciones con problemas de orden verbo-segundo o de concordancia, con la cautela de que los errores reales son más ruidosos.
- Puntuación de candidatos en sistemas de corrección: en un corrector automático, el scorer puede clasificar las propuestas de corrección generadas por otro sistema, eligiendo la que obtenga mayor puntuación de gramaticalidad.

## Benchmarks y rendimiento

| Conjunto de test | Spearman | ROC-AUC |
|---|---|---|
| Starter 120 filas | 0,686 | 0,891 |
| Sintético 926 filas | 0,849 | 0,952 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible, dado que el modelo es un scorer de gramaticalidad y no un modelo generativo de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 395,8 millones de parámetros en precisión FP32, los pesos ocupan aproximadamente 1,6 GB; en FP16, unos 0,8 GB. La VRAM total necesaria para inferencia con un lote pequeño es de aproximadamente 2-3 GB en FP32 y 1-2 GB en FP16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo. Se recomiendan GPUs como NVIDIA RTX 3060, RTX 4090, A100 o H100 para mayor throughput, aunque el modelo es lo suficientemente pequeño para funcionar en GPUs de consumo.
- Cabe en GPU de consumo: sí, en tarjetas como GTX 1650 (4 GB), RTX 3050, RTX 3060, RTX 4060 y superiores.
- Opciones de despliegue: transformers (con PyTorch), text-embeddings-inference (según los tags del repositorio), y potencialmente llama.cpp u Ollama si se convierte a GGUF, aunque no se proporcionan instrucciones específicas para estos últimos. El repositorio incluye un script `predict.py` para procesar archivos JSONL.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Al ser un modelo encoder de 395M, la inferencia por oración es rápida (del orden de milisegundos en GPU moderna), pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dvschan/swedish-grammaticality-scorer | 395,8 M | no disponible | Regresión de gramaticalidad en sueco | Apache 2.0 | Hugging Face |
| AI-Sweden-Models/ModernBERT-large | 395 M | no disponible | Modelo base encoder para sueco | no disponible | Hugging Face |
| Modelos de corrección gramatical multilingües (p. ej., GECToR, T5-base fine-tuned) | variable | variable | Corrección gramatical | variable | Hugging Face / repositorios |

No se dispone de información sobre otros modelos específicos de puntuación de gramaticalidad en sueco comparables directamente. La comparativa se limita al modelo base y a alternativas genéricas de corrección gramatical, sin datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrena con errores sintéticos generados por reglas, que son más limpios que los errores reales de aprendices, por lo que puede sobreestimar la calidad de textos con errores naturales. Las reglas de artículo y orden verbo-segundo son raras en los datos de entrenamiento, lo que puede reducir la sensibilidad a esos errores.
- Riesgo de alucinación: al ser un modelo de regresión, no genera texto, por lo que no alucina en el sentido generativo; sin embargo, puede asignar puntuaciones altas a oraciones gramaticalmente incorrectas no cubiertas por las reglas, o puntuaciones bajas a oraciones correctas pero atípicas.
- Limitaciones de contexto o idioma: el modelo solo soporta sueco. La longitud de contexto no se especifica, pero el ejemplo de uso trunca a 256 tokens. Entradas muy cortas (menos de seis palabras) obtienen puntuaciones bajas de forma sistemática; por ejemplo, "Hej." obtiene 0,66.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de copyright y la licencia. No se indican restricciones adicionales.
- Caveats para producción: es obligatorio aplicar la calibración con `calibration.json` para que las puntuaciones sean interpretables en la escala 0-1; sin ella, las puntuaciones se concentran cerca de 0,7 y pierden significado absoluto. El rendimiento en datos reales puede ser inferior al reportado en el test sintético (Spearman 0,849, ROC-AUC 0,952), que el propio autor califica de optimista. No se recomienda su uso como único criterio de corrección gramatical sin revisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dvschan/swedish-grammaticality-scorer
- Dataset de gramaticalidad en sueco: https://huggingface.co/datasets/dvschan/swedish-grammaticality
- Repositorio del proyecto (script predict.py): https://github.com/dvschandraprasad/swedish-grammar-scorer/blob/main/predict.py
- Modelo base: https://huggingface.co/AI-Sweden-Models/ModernBERT-large
