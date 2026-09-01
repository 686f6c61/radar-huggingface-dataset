# Cloth-splatters/cloth-splatting-gnn

## Resumen

Cloth-splatting-gnn es un modelo de red neuronal de grafos (GNN) desarrollado por el grupo KTH-RPL (KTH Royal Institute of Technology) como parte del sistema Cloth-Splatting, presentado en la conferencia CoRL 2024. El modelo aborda el problema de estimación del estado tridimensional de telas deformables a partir de observaciones RGB dispersas, combinando un modelo de dinámica aprendido (GNN) con técnicas de 3D Gaussian Splatting para corregir las predicciones mediante observaciones visuales.

El modelo se centra en la robótica de manipulación de objetos deformables, un campo donde la estimación precisa del estado de una tela es crítica para tareas como doblar, estirar o colocar prendas. A diferencia de los modelos de lenguaje, este es un modelo de visión y dinámica física, con una arquitectura basada en grafos que representa la malla de la tela y predice su evolución temporal. La relevancia actual radica en el creciente interés por la manipulación robótica de materiales no rígidos, donde los métodos tradicionales de estimación de estado fallan.

En Hugging Face, el repositorio contiene únicamente la licencia MIT y no se proporcionan pesos, documentación técnica ni métricas de rendimiento. Toda la información disponible proviene del paper y del repositorio de GitHub asociado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GNN (Graph Neural Network) para dinámica de mallas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | MIT |
| Formato de pesos | no disponible (probablemente PyTorch, sin confirmar) |

## Arquitectura y entrenamiento

El modelo es una GNN que opera sobre una representación de malla de la tela. Según el paper de Cloth-Splatting, el sistema completo utiliza un marco de predicción-actualización similar a un filtro bayesiano: dado un estado previo y una acción robótica conocida, la GNN predice el siguiente estado de la malla. Posteriormente, se emplea 3D Gaussian Splatting para actualizar esa predicción utilizando observaciones RGB, corrigiendo errores acumulados.

No se han publicado detalles específicos sobre el número de parámetros, la arquitectura interna de la GNN (número de capas, tipo de agregación, etc.) ni el proceso de entrenamiento (dataset, número de épocas, función de pérdida). El repositorio de GitHub indica que el código está disponible, pero la información técnica detallada no se encuentra en la documentación pública accesible.

## Capacidades

- Estimación del estado 3D de telas deformables a partir de imágenes RGB.
- Predicción de la dinámica de la tela condicionada a acciones robóticas.
- Integración con 3D Gaussian Splatting para corrección visual de las predicciones.
- Seguimiento temporal de la malla de la tela en secuencias de vídeo.
- Funciona como componente de un sistema más amplio de manipulación robótica de deformables.

No se han documentado capacidades como tool calling, agentes o razonamiento multi-paso, ya que no es un modelo de lenguaje.

## Casos de uso

- Manipulación robótica de prendas: el modelo permite a un robot estimar la posición y deformación de una camiseta o pantalón mientras lo manipula, facilitando tareas como doblado o extendido.
- Planificación de movimientos en robótica: al predecir la evolución de la tela bajo una acción, el robot puede planificar trayectorias que eviten arrugas o pliegues no deseados.
- Simulación de telas en entornos virtuales: el GNN puede servir como modelo de dinámica rápida para simular el comportamiento de telas en tiempo real, útil en gráficos por computador o entrenamiento de políticas.
- Control visual de robots blandos: en aplicaciones donde se manipulan materiales flexibles, la estimación de estado precisa es esencial para el control en lazo cerrado.
- Inspección de calidad en manufactura textil: el modelo podría adaptarse para verificar la correcta colocación de telas en procesos automatizados.
- Investigación en percepción de deformables: sirve como base para estudiar métodos de estimación de estado en objetos no rígidos, combinando aprendizaje profundo con representaciones explícitas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper de Cloth-Splatting reporta métricas de seguimiento 3D en comparación con otros métodos, pero esos datos no están incluidos en la documentación de Hugging Face ni en los resultados de búsqueda proporcionados. Se recomienda consultar el paper original para obtener cifras concretas.

## Requisitos de hardware

- No se dispone de información específica sobre requisitos de VRAM, GPU recomendadas o latencia.
- Dado que es un modelo de visión con GNN, es probable que requiera una GPU con al menos 8 GB de VRAM para inferencia en tiempo real, pero esto es una estimación no confirmada.
- El repositorio de GitHub puede incluir instrucciones de despliegue, pero no se han extraído en la información disponible.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (estimación de estado de telas con GNN). Existen otros métodos como los basados en redes neuronales convolucionales o en física clásica, pero no se han proporcionado datos para una comparación rigurosa. Se indica "no disponible".

## Limitaciones y advertencias

- El modelo está diseñado específicamente para telas y no es generalizable a otros tipos de deformables sin reentrenamiento.
- No se han documentado sesgos, pero al ser un modelo entrenado con datos de simulación o entornos controlados, puede tener dificultades en escenarios del mundo real con iluminación variable o texturas complejas.
- Riesgo de alucinación no aplica, pero sí existe riesgo de errores en la estimación cuando las observaciones RGB son ambiguas o hay oclusiones.
- La licencia MIT permite uso comercial, pero el modelo se distribuye sin pesos preentrenados en Hugging Face, lo que limita su uso directo.
- No se proporciona documentación sobre el formato de los pesos ni instrucciones de carga, lo que dificulta su integración en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Cloth-splatters/cloth-splatting-gnn
- Repositorio GitHub: https://github.com/KTH-RPL/cloth-splatting
- Paper en arXiv: https://arxiv.org/abs/2501.01715
- Página del proyecto: https://kth-rpl.github.io/cloth-splatting/
