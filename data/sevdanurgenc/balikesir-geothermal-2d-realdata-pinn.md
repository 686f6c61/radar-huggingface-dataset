# SevdanurGenc/Balikesir-Geothermal-2D-RealData-PINN

## Resumen

El modelo `SevdanurGenc/Balikesir-Geothermal-2D-RealData-PINN` es una red neuronal informada por la física (PINN, por sus siglas en inglés) desarrollada por Sevdanur Genc, profesora asistente de ingeniería informática en la Universidad de Balikesir (Turquía). El modelo está diseñado para modelar estructuras geotérmicas en dos dimensiones utilizando datos reales de la región de Balikesir, una zona con actividad geotérmica relevante. Su propósito es predecir magnitudes físicas como la temperatura y el flujo de calor en el subsuelo, integrando las ecuaciones físicas que gobiernan el fenómeno como parte de la función de pérdida.

La relevancia actual de este modelo radica en la combinación de aprendizaje profundo con conocimiento físico explícito, lo que permite obtener predicciones más consistentes y generalizables en regiones con datos observacionales escasos. Aunque la ficha de HuggingFace no proporciona detalles técnicos sobre la arquitectura, el número de parámetros o el proceso de entrenamiento, se sabe por la publicación asociada que el enfoque incluye transferencia de aprendizaje (transfer learning) para mejorar la precisión en zonas sin datos. El modelo se distribuye bajo licencia MIT, lo que facilita su uso y modificación tanto en investigación como en aplicaciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente MLP, no confirmado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo numerico) |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se dispone de información publica sobre la arquitectura exacta del modelo (numero de capas, funciones de activacion, etc.) ni sobre el proceso de entrenamiento (numero de epocas, optimizador, funcion de perdida). Sin embargo, por el nombre y el articulo asociado, se trata de una red neuronal informada por la fisica (PINN) que incorpora las ecuaciones diferenciales parciales que rigen el flujo de calor y la conveccion en medios porosos como terminos de regularizacion en la perdida. El articulo menciona el uso de transferencia de aprendizaje para integrar conocimiento previo de expertos y mejorar la prediccion en regiones sin datos observacionales. El modelo fue validado con simulaciones numericas 2D de sistemas geotermicos tipicos, aunque no se especifican los datos de entrenamiento concretos (numero de muestras, procedencia, etc.).

## Capacidades

- Prediccion de campos fisicos (temperatura, presion, flujo de calor) en sistemas geotermicos 2D.
- Integracion de ecuaciones fisicas en la funcion de perdida, lo que permite obtener soluciones mas suaves y fisicamente plausibles.
- Capacidad de transferencia de aprendizaje para adaptarse a nuevas regiones con pocos datos observacionales.
- Modelo numerico, no generativo: no produce texto, codigo ni imagenes.

## Casos de uso

- Exploracion geotermica: el modelo puede estimar la distribucion de temperatura en el subsuelo a partir de datos geologicos limitados, ayudando a identificar zonas de alto potencial geotermico en la region de Balikesir.
- Simulacion de reservorios: permite generar campos de temperatura y presion para estudios preliminares de viabilidad de plantas geotermicas, reduciendo la necesidad de simulaciones numericas costosas.
- Monitorizacion de campos geotermicos: con datos de pozos existentes, el modelo puede interpolar y predecir la evolucion termica en tiempo casi real para la gestion de la extraccion.
- Investigacion academica: sirve como base para comparar tecnicas de PINN con metodos clasicos de simulacion numerica en geociencias.
- Integracion en pipelines de machine learning: al ser un modelo ligero (tamano desconocido pero probablemente modesto), puede integrarse en flujos de trabajo de analisis de datos geologicos.
- Transferencia a otras regiones: gracias al enfoque de transfer learning, el modelo puede adaptarse a otras cuencas geotermicas con reentrenamiento minimo, siempre que se disponga de datos fisicos de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El articulo asociado reporta validaciones con simulaciones numericas 2D, pero no se proporcionan metricas cuantitativas (error relativo, RMSE, etc.) en la ficha de HuggingFace ni en los resultados de busqueda.

## Requisitos de hardware

No se dispone de informacion sobre el tamano del modelo ni sus requisitos de inferencia. Al tratarse de un modelo PINN, el entrenamiento requiere tipicamente una GPU con al menos 8-16 GB de VRAM para redes de tamano medio, pero sin datos concretos no es posible dar una estimacion fiable. Para inferencia, un modelo de este tipo (si es un MLP de pocas capas) podria ejecutarse en CPU, pero se desconoce el tamano real. Se recomienda contactar con la autora o consultar el repositorio de codigo asociado para obtener detalles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (PINN aplicados a geotermia). La literatura cientifica incluye otros trabajos de PINN para problemas de transferencia de calor, pero no se han encontrado modelos publicados en HuggingFace con caracteristicas equivalentes. Por tanto, no se puede establecer una comparativa objetiva.

## Limitaciones y advertencias

- El modelo esta entrenado especificamente para la region de Balikesir y puede no generalizar bien a otras zonas geologicas sin reentrenamiento o adaptacion.
- Al ser un modelo numerico, no debe utilizarse para tareas de lenguaje natural ni generacion de texto.
- No se han publicado evaluaciones de incertidumbre ni analisis de robustez frente a datos ruidosos o incompletos.
- La licencia MIT permite uso comercial, pero se recomienda verificar la procedencia de los datos de entrenamiento si se utilizan en aplicaciones criticas.
- No se proporciona informacion sobre la version de los pesos, el formato de guardado ni las dependencias necesarias para cargar el modelo.
- La ausencia de documentacion tecnica detallada limita la reproducibilidad y la integracion en entornos de produccion.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/SevdanurGenc/Balikesir-Geothermal-2D-RealData-PINN)
- [Perfil de GitHub de la autora](https://github.com/SevdanurGENC)
- [Pagina personal de Sevdanur Genc](https://sevdanurgenc.github.io/)
- [Articulo en Springer (Geothermal Energy)](https://link.springer.com/article/10.1186/s40517-024-00312-7)
- [PDF en arXiv (posible preprint)](https://arxiv.org/pdf/2210.08685v1)
