# braindecode/bcic_iv_4_ecog_cropped

## Resumen

`bcic_iv_4_ecog_cropped` no es un modelo de lenguaje, sino un conjunto de artefactos preentrenados (checkpoint) publicados por el proyecto Braindecode para su tutorial `examples/advanced_training/bcic_iv_4_ecog_cropped.py`. Contiene los parámetros de un clasificador de regresión entrenado sobre señales electrocorticográficas (ECoG) del BCI Competition IV dataset 4, con el objetivo de predecir la flexión del dedo pulgar (finger 1) a partir de la actividad cortical. Su función es permitir que la documentación de Braindecode muestre predicciones estables sin necesidad de reentrenar el modelo desde cero.

El checkpoint se generó con la arquitectura ShallowFBCSPNet en modo supervisado y con recorte temporal (*cropped*), utilizando únicamente al sujeto 1 del dataset y la totalidad de las grabaciones. Braindecode es una caja de herramientas de código abierto en PyTorch para decodificar datos electrofisiológicos crudos (EEG, ECoG y MEG) mediante aprendizaje profundo, mantenida por un equipo de investigadores vinculados a instituciones europeas y con una licencia permisiva BSD-3-Clause.

La relevancia de esta ficha es acotada: se trata de un artefacto de reproducibilidad para tutoriales, no de un modelo listo para producción ni de un sistema de propósito general. No hay pipeline declarado, no se especifican idiomas y el tamaño del repositorio es de 0,0 GB, lo que sugiere que los pesos son de pequeña dimensión, coherentes con una red convolucional superficial para señales de iEEG.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ShallowFBCSPNet (red convolucional superficial para señales electrofisiológicas), modo *cropped* |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventanas temporales de ECoG, no aplica contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (`params.safetensors`), más `history.json` y `metadata.json` |
| Modalidad de entrada | iEEG / ECoG (señales cerebrales intracraneales) |
| Tarea | Regresión de flexión del dedo pulgar (finger 1) |
| Dataset de entrenamiento | BCI Competition IV dataset 4 (3 sujetos; se usa solo el sujeto 1) |
| Sujeto evaluado | Sujeto 1 |
| Métrica reportada | Pearson r en la sesión de test |
| Librería | braindecode |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo emplea ShallowFBCSPNet, una arquitectura convolucional superficial ampliamente utilizada en decodificación de señales EEG/ECoG dentro del ecosistema Braindecode. La variante *cropped* implica que la red procesa ventanas temporales recortadas de la señal, de modo que las predicciones se generan sobre segmentos concretos de la grabación. La tarea es de regresión supervisada sobre una única dimensión de salida: la flexión del dedo pulgar, seleccionada mediante `target_transform x[0:1]`.

El entrenamiento se realizó únicamente con el sujeto 1 y con las grabaciones completas. La sesión de entrenamiento se dividió temporalmente: el primer 80 % se destinó a actualizaciones de gradiente y el último 20 % a validación, con `EarlyStopping(load_best=True)`. La sesión de test se reservó exclusivamente para calcular el coeficiente de correlación de Pearson reportado. El entrenamiento se ejecutó con Skorch, y el historial resultante se almacena en `history.json` para alimentar las gráficas del tutorial. Los datos provienen del BCI Competition IV dataset 4 (ECoG de flexión de dedos, 3 sujetos), cargado con `BCICompetitionIVDataset4` de Braindecode a partir de la Miller ECoG library. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o etapas de RLHF/DPO, que no aplican a este tipo de modelo.

## Capacidades

- Regresión de señales ECoG: estima la flexión del dedo pulgar a partir de actividad cortical intracraneal del sujeto 1.
- Decodificación de señales electrofisiológicas crudas mediante una red convolucional superficial.
- Carga directa mediante `from_pretrained` de Braindecode, con acceso a metadatos del dataset a través de `model.card_data.datasets`.
- Reproducción de resultados del tutorial: permite generar predicciones estables sin reentrenar.
- Registro del historial de entrenamiento para visualización (curvas de pérdida y métricas).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo *thinking*, visión, audio ni generación de texto.

## Casos de uso

- Reproducción de tutoriales: cargar el checkpoint con `from_pretrained` para ejecutar el ejemplo `bcic_iv_4_ecog_cropped.py` y obtener predicciones idénticas a las de la documentación oficial sin reentrenar.
- Validación de pipelines de decodificación: servir como referencia para comprobar que una instalación de Braindecode carga correctamente pesos en formato safetensors y produce salidas coherentes.
- Docencia en neuroingeniería: ilustrar el flujo completo de un experimento de regresión con ECoG (carga de datos, recorte temporal, entrenamiento con Skorch y evaluación con Pearson r) usando un checkpoint ya entrenado.
- Desarrollo de interfaces cerebro-máquina (BCI): punto de partida para experimentar con decodificación de movimiento de dedos en señales intracraneales antes de escalar a otros sujetos o datasets.
- Comparación de arquitecturas: usar ShallowFBCSPNet como línea base frente a modelos más profundos o híbridos en tareas de regresión motora con ECoG.
- Reproducibilidad científica: citar y reutilizar el checkpoint junto con el DOI de Braindecode en Zenodo para replicar resultados en publicaciones.
- Pruebas de integración en CI: verificar que los cambios en la librería no rompen la carga de checkpoints ni la inferencia sobre datos de ejemplo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento mencionado en la model card es el coeficiente de correlación de Pearson en la sesión de test, cuyo valor numérico no se incluye en el texto proporcionado (se indica que está resumido en `metadata.json`, pero no se reproduce aquí). No se dispone de cifras de MMLU, HumanEval, GSM8K ni de métricas comparables, ya que no son aplicables a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB, lo que sugiere un checkpoint de muy pocos parámetros y requisitos de memoria mínimos.
- GPU recomendadas: no disponibles de forma específica; una red convolucional superficial de este tipo puede ejecutarse en CPU y en GPUs consumer de gama baja.
- Cabe en GPU consumer: previsiblemente sí, dado el reducido tamaño del artefacto, aunque no se documentan cifras concretas.
- Opciones de despliegue: carga mediante la librería Braindecode (PyTorch) con `from_pretrained`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de otros checkpoints o arquitecturas comparables (por ejemplo, otras variantes de ShallowFBCSPNet o modelos profundos sobre el mismo dataset) con parámetros, contexto, rendimiento o licencia que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrenó exclusivamente con el sujeto 1, por lo que no generaliza a otros sujetos sin reentrenamiento o adaptación.
- Riesgo de sobreajuste: al usar un único sujeto y las grabaciones completas, la capacidad de generalización es limitada.
- Ámbito restringido: solo predice la flexión del dedo pulgar (finger 1), no otras clases de movimiento.
- Naturaleza del artefacto: está pensado para tutoriales y reproducibilidad, no para uso clínico ni producción.
- Sin soporte de texto ni idiomas: no es un modelo de lenguaje, por lo que no aplican evaluaciones de alucinación, contexto textual o multilingüismo.
- Licencia BSD-3-Clause: permite uso comercial con atribución, pero debe citarse Braindecode (DOI 10.5281/zenodo.17699192) y los datasets originales en trabajos científicos.
- Datos de entrenamiento: el dataset BCIC-IV-4 es de acceso público, pero su uso debe respetar las condiciones de la BCI Competition IV y de la Miller ECoG library.
- Métricas incompletas: el valor de Pearson r no se reproduce en la información disponible; debe consultarse `metadata.json` para verificarlo.
- Sin pipeline declarado: la ausencia de pipeline y de descargas indica que no está validado como modelo de producción en el Hub.

## Enlaces

- Hugging Face: https://huggingface.co/braindecode/bcic_iv_4_ecog_cropped
- Metadatos del checkpoint: https://huggingface.co/braindecode/bcic_iv_4_ecog_cropped/resolve/main/metadata.json
- Braindecode (documentación): https://braindecode.org/stable/index.html
- Braindecode API Reference: https://braindecode.org/stable/api.html
- Braindecode en GitHub: https://github.com/braindecode
- Braindecode en Hugging Face: https://huggingface.co/braindecode
- Braindecode en PyPI: https://pypi.org/project/braindecode/
- BCI Competition IV dataset 4: https://www.bbci.de/competition/iv/#dataset4
- DOI de Braindecode en Zenodo: https://doi.org/10.5281/zenodo.17699192
- NEMAR: https://nemar.org
