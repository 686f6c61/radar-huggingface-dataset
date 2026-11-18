# jacob-valdez/computaco-seekui

## Resumen

SeekUI es un modelo de vision-lenguaje (VLM) orientado a predecir el comportamiento de busqueda visual humana sobre interfaces graficas de usuario (GUI). El repositorio `jacob-valdez/computaco-seekui` no contiene pesos originales: es un handler de inferencia de la plataforma ComputaCo que carga los pesos de los autores en una revision fijada (pinned revision). El metodo y los pesos pertenecen a Zixin Guo, Yue Jiang, Luis A. Leiva y Antti Oulasvirta, publicado en CHI 2026 bajo el titulo "SeekUI: Predicting Visual Search Behavior on Graphical User Interfaces with a Reward-Augmented Vision Language Model".

El modelo resuelve un problema concreto de HCI (interaccion persona-computador): generar trayectorias de busqueda visual (scanpaths) sobre capturas de pantalla de interfaces, es decir, predecir hacia donde mira una persona y en que orden al buscar un elemento en una GUI. Esto es relevante para evaluacion de usabilidad automatizada, prototipado de interfaces, simulacion de usuarios y analisis de atencion visual sin necesidad de eye-tracking fisico.

La informacion disponible sobre arquitectura concreta, numero de parametros y longitud de contexto no esta detallada en la model card proporcionada; el autor la describe como un "Reward-Augmented Vision Language Model", lo que indica un VLM base ajustado con un esquema de aprendizaje por recompensa para alinear las predicciones con el comportamiento humano observado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Language Model aumentado con recompensa (reward-augmented VLM); detalles del backbone no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio expone un custom-handler de transformers que carga los pesos originales en una revision fijada) |

## Arquitectura y entrenamiento

La model card describe SeekUI como un "Reward-Augmented Vision Language Model". La arquitectura exacta del backbone (familia del modelo de vision, encoder de imagenes, modelo de lenguaje subyacente), el volumen de datos de entrenamiento y la composicion del dataset no se detallan en la informacion proporcionada. El termino "reward-augmented" sugiere un ajuste posterior mediante una funcion de recompensa que penaliza las predicciones de scanpath alejadas de las trayectorias humanas reales, pero el procedimiento concreto (RLHF, DPO u otro esquema de optimizacion por recompensa) no esta especificado.

El repositorio de Hugging Face no contiene los pesos: implementa un handler de inferencia (`custom-handler`) que descarga y ejecuta los pesos de los autores en una revision fijada, garantizando reproducibilidad. La tarea de salida es la prediccion de scanpaths sobre capturas de pantalla de GUI, lo que implica un pipeline de vision (entrada de imagen de interfaz) seguido de generacion de una secuencia ordenada de coordenadas o regiones de atencion.

## Capacidades

- Prediccion de scanpaths: genera trayectorias ordenadas de busqueda visual sobre capturas de pantalla de interfaces graficas.
- Busqueda visual en GUI: localiza el elemento objetivo dentro de una pantalla y modela el recorrido atencional hasta encontrarlo.
- Entrada multimodal: procesa imagenes de interfaz (capturas de pantalla) junto con la tarea de busqueda.
- Modelado de comportamiento humano: las salidas aproximan como una persona explora y localiza elementos, no observaciones reales de usuarios.
- Integracion con transformers: se ejecuta mediante un handler compatible con la libreria `transformers` y etiquetado como `endpoints_compatible`.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso general: no disponible; la capacidad documentada se limita a la prediccion de scanpaths.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Evaluacion de usabilidad automatizada: dada una captura de una interfaz y un elemento objetivo, el modelo predice la trayectoria de busqueda; si el scanpath predicho es largo o erratico, el diseno puede indicar baja localizabilidad del elemento y revisarse antes de test con usuarios.
- Prototipado y validacion de layouts: comparar scanpaths predichos entre dos variantes de una pantalla permite descartar disenos con jerarquia visual deficiente sin coste de reclutamiento.
- Simulacion de usuarios para pruebas de interfaz: integrar el modelo en pipelines de QA de producto para generar trayectorias sinteticas que alimenten heuristicas de accesibilidad y visibilidad.
- Investigacion en HCI y atencion visual: usar las predicciones como linea base o variable dependiente en estudios que no pueden costear eye-tracking.
- Analisis de friccion en formularios y menus: predecir donde se desvia la atencion en flujos de varios pasos para identificar puntos de abandono.
- Generacion de datos sinteticos de atencion: producir scanpaths etiquetados para entrenar o aumentar modelos secundarios de saliencia en GUI.
- Auditoria de interfaces moviles y web: aplicar el modelo a capturas de distintas resoluciones para detectar elementos que pasan desapercibidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al paper de CHI 2026 (https://doi.org/10.1145/3772318.3791178) para la evaluacion del metodo, pero los numeros no se incluyen en los datos proporcionados y no deben inferirse.

## Requisitos de hardware

- VRAM estimada: no disponible; depende del backbone del VLM, que no se especifica en la informacion proporcionada.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: handler `custom-handler` de `transformers`; el repositorio esta etiquetado como `endpoints_compatible`, lo que sugiere despliegue mediante Hugging Face Inference Endpoints. Otras opciones (vLLM, llama.cpp, Ollama, TGI) no estan documentadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de prediccion de scanpaths en GUI ni sus especificaciones, por lo que no se puede establecer una comparativa con datos verificables.

## Limitaciones y advertencias

- Las salidas son predicciones del modelo sobre como una persona buscaria en pantalla; no son observaciones de usuarios reales y no deben presentarse como datos empiricos de comportamiento.
- No se especifica la licencia del modelo ni de los pesos originales; antes de cualquier uso comercial debe verificarse la licencia en el repositorio de los autores (https://huggingface.co/sushizixin1/SeekUI).
- El repositorio no aloja los pesos: depende de la disponibilidad del repositorio original y de la revision fijada; si el autor original retira o modifica los pesos, el handler puede fallar.
- No hay informacion sobre sesgos del dataset de entrenamiento, cobertura de plataformas (web, movil, escritorio), resoluciones soportadas ni idiomas de las interfaces evaluadas.
- Riesgo de alucinacion: como VLM generativo, puede producir trayectorias plausibles pero no fieles al comportamiento humano en interfaces fuera de la distribucion de entrenamiento.
- Ausencia de benchmarks publicados en la informacion disponible impide estimar su calidad frente a alternativas.
- El modelo tiene cero descargas y cero likes en el momento de la consulta, lo que sugiere escasa validacion comunitaria del handler.

## Enlaces

- Repositorio del handler: https://huggingface.co/jacob-valdez/computaco-seekui
- Pesos originales: https://huggingface.co/sushizixin1/SeekUI
- Codigo: https://github.com/YueJiang-nj/SeekUI-CHI2026
- Paper (CHI 2026): https://doi.org/10.1145/3772318.3791178
