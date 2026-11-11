# argonne/LUMINA

## Resumen

LUMINA es una red neuronal de grafos heterogéneos (HGT, *heterogeneous graph transformer*) desarrollada por Argonne National Laboratory para la predicción rápida y de alta fidelidad de soluciones de flujo de potencia óptimo en corriente alterna (ACOPF, *AC Optimal Power Flow*). El modelo representa los componentes de un sistema eléctrico —barras, generadores, cargas, shunts y líneas de transmisión— como tipos de nodo y de arista diferenciados, capturando así la heterogeneidad estructural y física de las redes eléctricas reales.

Con 3.755.642 parámetros (3,8 M), LUMINA es un modelo compacto especializado, no un modelo de lenguaje: su función es actuar como sustituto (*surrogate*) escalable de los solvers de optimización tradicionales, que resultan computacionalmente costosos en redes de gran tamaño. Se entrenó sobre el dataset OPFData de Google DeepMind, cubriendo diez topologías de red que van desde el caso IEEE de 14 barras hasta el caso PEGASE de 13.659 barras, con 270.000 muestras por caso.

La relevancia del modelo radica en su capacidad de generalización entre topologías y condiciones de operación distintas, algo poco habitual en sustitutos neuronales de OPF, que suelen sobreajustarse a una única red. La versión v0.1.6, publicada en octubre de 2026, se entrenó sobre el conjunto completo de topologías y alcanzó una pérdida de validación de 0,013560 con pérdida de Lagrangiano aumentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de grafos heterogéneos (HGT) |
| Parametros totales | 3.755.642 (3,8 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo sobre grafos, no secuencial) |
| Tipos de cuantizacion | No disponible (pesos en FP32 por defecto; no se documentan variantes cuantizadas) |
| Idiomas soportados | No aplica (modelo numérico, sin procesamiento de lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (recomendado) y PyTorch `.pt` |

## Arquitectura y entrenamiento

LUMINA emplea una arquitectura HGT que opera sobre grafos heterogéneos con múltiples tipos de nodo y de arista. Los canales de entrada documentados son: barra con 7 características, generador con 11, carga con 2, shunt con 2 y red (*grid*) con 4. El modelo predice variables de la solución ACOPF como tensiones, inyecciones de potencia y flujos por línea.

El entrenamiento se realizó sobre el dataset OPFData (Google DeepMind, 2024, licencia MIT), con 270.000 muestras por caso y diez casos: case14_ieee, case30_ieee, case57_ieee, case118_ieee, case500_goc, case2000_goc, case4661_sdet, case6470_rte, case10000_goc y case13659_pegase. La versión v0.1.6 se entrenó durante 92 épocas (fecha de entrenamiento 2026-10-16) con una función de pérdida de Lagrangiano aumentado, que incorpora penalizaciones por violación de restricciones y términos lagrangianos; la pérdida de validación final fue de 0,013560. El autor advierte que esta métrica solo es comparable entre versiones que compartan el mismo tipo de pérdida. El repositorio incluye un gráfico `pareto_front.png` con la relación precisión-violación de restricciones de todos los checkpoints publicados.

## Capacidades

- Predicción de soluciones ACOPF: tensiones de barra, inyecciones de potencia activa y reactiva, y flujos de potencia por línea.
- Generalización entre topologías: un único checkpoint entrenado sobre diez redes de distinto tamaño y configuración.
- Codificación de heterogeneidad física: distingue tipos de nodo (barra, generador, carga, shunt) y de arista, con características específicas por tipo.
- Inferencia por lotes (*batch*) mediante `DataLoader` y predicción de muestra única desde JSON o diccionario.
- Soporte de transformación de nodo virtual (*virtual node transform*) para checkpoints que la requieren, aplicada por muestra antes del *collate*.
- Ejecución en CPU y GPU (CUDA) mediante PyTorch.
- No soporta *tool calling*, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Sustituto rápido de solvers ACOPF en planificación de red: dado un caso de sistema eléctrico con sus características de barras, generadores y líneas, LUMINA devuelve una aproximación de tensiones y flujos en milisegundos, útil para explorar miles de escenarios de demanda o generación sin resolver el problema de optimización completo en cada uno.
- Filtrado previo en pipelines de optimización: usar la predicción neuronal como punto de partida (*warm start*) o como criba para descartar escenarios inviables antes de invocar un solver exacto, reduciendo el coste computacional total.
- Evaluación de contingencias a gran escala: al generalizar entre topologías, permite estimar el estado de la red ante variaciones de configuración (p. ej. pérdida de líneas) sobre casos de hasta 13.659 barras del conjunto de entrenamiento.
- Investigación en aprendizaje automático para sistemas de potencia: el modelo sirve como referencia reproducible (checkpoint, configuración y código de inferencia publicados) para comparar nuevas arquitecturas de GNN aplicadas a OPF.
- Análisis de sensibilidad de mercado y despacho: estimar rápidamente cómo cambian las inyecciones de potencia y los flujos ante variaciones de carga, apoyando estudios de despacho económico aproximado.
- Docencia y prototipado: con 3,8 M de parámetros y pesos en safetensors, el modelo se ejecuta en CPU o en una GPU consumer, lo que facilita demostraciones y experimentos sin infraestructura de cálculo intensivo.
- Generación de datos sintéticos etiquetados: usar las predicciones como aproximación inicial para preetiquetar grandes volúmenes de escenarios y acelerar la anotación con un solver exacto posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la pérdida de validación final (0,013560 con pérdida de Lagrangiano aumentado, 92 épocas, v0.1.6) y remite al gráfico `pareto_front.png` para la relación precisión-violación de restricciones entre checkpoints. No se proporcionan métricas como error relativo de tensiones, violación media de restricciones ni comparaciones numéricas con solvers.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; con 3,8 M de parámetros en FP32 los pesos ocupan aproximadamente 15 MB, por lo que el modelo cabe holgadamente en cualquier GPU consumer y en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte CUDA es suficiente (RTX 3060, RTX 4090, A100, H100). El cuello de botella será el tamaño del grafo de entrada, no los pesos.
- Cabe en GPU consumer: sí, en todas las gamas actuales; también se ejecuta en CPU (el código de ejemplo selecciona `cuda` si está disponible y cae a `cpu` en caso contrario).
- Opciones de despliegue: paquete `lumina-inference` (instalación editable con `pip install -e .`), PyTorch y safetensors. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros sustitutos neuronales de ACOPF con los que comparar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El modelo aproxima soluciones ACOPF; no garantiza factibilidad exacta ni optimalidad. Las predicciones pueden violar restricciones físicas y deben validarse con un solver cuando la aplicación lo exija.
- La pérdida de validación (0,013560) solo es comparable entre versiones con el mismo tipo de pérdida (Lagrangiano aumentado); no debe compararse con métricas MSE de otros modelos.
- La generalización está acotada a las topologías y rangos de operación representados en el entrenamiento (diez casos IEEE, GOC, SDET, RTE y PEGASE). El rendimiento fuera de esa distribución no está documentado.
- Es necesario indicar explícitamente el caso servido (`case_name`) al instanciar el `Modeler`: un checkpoint con estadísticas de demanda de varios casos no puede inferir cuál aplicar.
- Algunos checkpoints requieren la transformación de nodo virtual por muestra antes del *collate*; omitirla produce resultados incorrectos.
- No es un modelo de lenguaje: no procesa texto, no soporta idiomas, ni tool calling, ni agentes.
- No se documentan sesgos, riesgos de alucinación en el sentido habitual ni restricciones adicionales de licencia; la licencia Apache 2.0 permite uso comercial con atribución y conservación del aviso.
- Para producción, conviene fijar la versión del checkpoint y del paquete `lumina-inference`, dado que el historial de versiones muestra cambios de pérdida y de conjunto de entrenamiento entre releases.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/argonne/LUMINA
- Repositorio de inferencia: https://github.com/argonne-gridfm/lumina-inference
- Checkpoint v0.1.6: https://huggingface.co/argonne/LUMINA/tree/v0.1.6
- Checkpoint v0.1.5 (variante 2M): https://huggingface.co/argonne/LUMINA-2M/tree/v0.1.5
- Dataset OPFData (Google DeepMind, 2024): https://doi.org/10.48550/arXiv.2406.07234
