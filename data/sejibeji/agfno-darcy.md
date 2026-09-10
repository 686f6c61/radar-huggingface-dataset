# Sejibeji/agfno-darcy

## Resumen

AGF-NO (Adaptive Geometry-Aware Fourier Neural Operator) es un operador neuronal desarrollado por Sejibeji para resolver ecuaciones diferenciales parciales (EDP) paramétricas, en concreto el flujo de Darcy en dos dimensiones con obstáculos poligonales irregulares. Se trata de una variante del Fourier Neural Operator (FNO) que incorpora la geometría de los obstáculos directamente en las capas espectrales mediante dos vías de cero-gate, lo que permite que el modelo arranque como un FNO estándar y aprenda cuánta información geométrica necesita.

El problema que aborda es la predicción del campo de presión en un medio poroso con permeabilidad heterogénea y obstáculos, manteniendo la complejidad O(N log N) de la FFT. El modelo se entrenó con 2.000 muestras generadas por un solver real (precondicionador de gradiente conjugado con multigrid), y en un test de 1.000 muestras alcanza una mejora del 46% en error L2 relativo global frente al FNO base, y del 51% en superresolución cero-shot de 48×48 a 96×96.

El repositorio en HuggingFace contiene los pesos en formato PyTorch (.pt) y ocupa 0.2 GB. No se trata de un modelo de lenguaje: no tiene ventana de contexto ni soporte de idiomas; es una arquitectura de aprendizaje de operadores para física computacional. Su relevancia radica en mejorar la precisión de operadores neuronales en geometrías complejas, un paso clave para gemelos digitales y simulaciones en tiempo real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FNO modificado con modulación espectral geométrica (SDF) e inyección anti-olvido |
| Parámetros totales | no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de operador neuronal, no de lenguaje) |
| Tipos de cuantización | No aplica (pesos en float32 en .pt) |
| Idiomas soportados | No aplica (no es modelo de lenguaje) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

La arquitectura parte del FNO estándar con 4 bloques de Fourier, ancho 64, 12×12 modos retenidos y 300 épocas de entrenamiento. Sobre esta base se añaden dos modificaciones. La primera es una modulación espectral consciente de la geometría: el campo de distancia con signo (SDF) de los obstáculos se procesa con una convolución espectral propia y se multiplica con la salida del bloque de Fourier mediante una activación tanh y un factor `(1 + g_spec * tanh(S(sdf)))`. Esto crea un núcleo efectivo dependiente de la posición y la frecuencia, pero preserva el escalado O(N log N) de la FFT. La segunda es una inyección anti-olvido: el SDF y las características de Fourier de las coordenadas se reinyectan en la rama MLP en cada profundidad, evitando que la información de frontera se pierda a lo largo de la cadena de mezcladores globales.

El entrenamiento se realizó en una NVIDIA Tesla T4 mediante un kernel de Kaggle. El conjunto de datos consta de 2.000 muestras de entrenamiento, 200 de validación y 1.000 de test, todas fijadas con semilla y reproducibles byte a byte. La solución de referencia proviene de un solver real: gradiente conjugado precondicionado con un precondicionador multigrid de Laplaciano desplazado, con tolerancia relativa de 1e-6. No se empleó RLHF ni DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Aprendizaje de operadores para EDP: resuelve el flujo de Darcy 2D con obstáculos poligonales irregulares, mapeando la permeabilidad y la geometría al campo de presión.
- Superresolución cero-shot: entrenado en mallas de 48×48 y capaz de generalizar a 96×96 sin reentrenamiento, reduciendo el error un 51% respecto al FNO.
- Geometría adaptativa: inyecta el SDF en el dominio espectral y en cada MLP, lo que mejora la precisión cerca de fronteras y en la interfaz de los obstáculos.
- Visualización comparativa: incluye scripts para generar figuras de comparación con mapas de error y curvas de entrenamiento.
- Reproducibilidad: se proporciona el código completo y un conjunto de 16 pruebas de pytest que validan la truncación espectral, la equivalencia del cero-gate, la exactitud del SDF y la convergencia del solver.
- No soporta tool calling, agents, visión ni audio; es un modelo de física computacional.

## Casos de uso

- Simulación de flujo subterráneo: predecir la presión en acuíferos con heterogeneidades y obstáculos geológicos, acelerando el análisis frente a solvers numéricos convencionales.
- Optimización de geometría en ingeniería: evaluar rápidamente diferentes configuraciones de obstáculos en canales de flujo o intercambiadores de calor sin re-ejecutar un solver para cada diseño.
- Gemelos digitales de yacimientos: proporcionar predicciones de presión casi instantáneas en entornos donde la permeabilidad cambia, gracias al aprendizaje de operadores.
- Superresolución de mallas CFD: tomar soluciones gruesas de 48×48 y refinarlas a 96×96, útil cuando la resolución del solver está limitada por coste computacional.
- Diseño de dispositivos microfluídicos: modelar el flujo en cámaras con obstáculos internos para optimizar la mezcla o el transporte de fluidos.
- Benchmark de investigación: servir como referencia de comparación para nuevos operadores neuronales con conciencia geométrica en el dominio Darcy.
- Docencia y demostración: en cursos de machine learning científico, el repositorio ofrece el pipeline completo, figuras y pruebas para ilustrar el concepto de operadores sobre mallas.

## Benchmarks y rendimiento

| Métrica | FNO baseline | AGF-NO (ours) | Mejora |
|---|---|---|---|
| Error L2 relativo global | 0.1004 | 0.0541 | −46% |
| Error L2 relativo (anillo cercano a la frontera) | 0.2334 | 0.0627 | −73% |
| Fidelidad en paredes (media \|pred−target\| dentro de obstáculos) | 0.0769 | 0.0129 | 5.9× |
| Superresolución cero-shot 2× (48→96) | 0.4666 | 0.2295 | −51% |

Los datos proceden de un conjunto de test de 1.000 muestras fuera de entrenamiento, con los mismos presupuestos de entrenamiento para ambos modelos (ancho 64, 4 bloques de Fourier, 12×12 modos, 300 épocas, en NVIDIA T4). El throughput de inferencia es de 925 muestras/s para AGF-NO frente a 1.774 muestras/s para el FNO base en la misma GPU.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: NVIDIA Tesla T4, utilizada en el entrenamiento; compatible con cualquier GPU CUDA de NVIDIA.
- El tamaño del repositorio (0.2 GB) sugiere que cabe en GPUs de consumo, aunque no se dispone de un dato explícito.
- Opciones de despliegue: PyTorch, kernel de Kaggle. No aplica vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: 925 muestras/s en T4 para AGF-NO, 1.774 muestras/s para FNO base.

## Comparativa con modelos similares

La comparativa principal incluida en el propio repositorio es contra el FNO estándar, que es la arquitectura base. También se puede considerar DeepONet como otra familia de operadores neuronales, pero no se dispone de resultados de evaluación sobre el mismo problema en la información proporcionada. Los datos comparativos disponibles son los de la tabla de benchmarks, que muestran una mejora consistente del AGF-NO sobre FNO en todas las métricas, aunque con un coste de inferencia mayor (925 muestras/s frente a 1.774 muestras/s).

## Limitaciones y advertencias

- El modelo solo está evaluado en un problema concreto: flujo de Darcy 2D con obstáculos poligonales. No hay evidencia de generalización a otras EDPs o geometrías no vistas sin reentrenamiento.
- La superresolución cero-shot se probó únicamente de 48×48 a 96×96; no se informa sobre ampliaciones mayores.
- El rendimiento en dominios sin obstáculos o con condiciones de contorno distintas a las estudiadas es desconocido.
- El throughput de AGF-NO es aproximadamente la mitad que el del FNO base (925 frente a 1.774 muestras/s), lo que puede ser relevante en aplicaciones de tiempo real con alta demanda.
- Los pesos están en formato .pt de PyTorch, lo que requiere una versión compatible de esa librería.
- No hay información sobre sesgos, ya que no es un modelo lingüístico; sin embargo, la calidad depende de la distribución de muestras de entrenamiento (permeabilidades log-normales, obstáculos de 1 a 3 polígonos).
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero el repositorio no incluye documentación explícita sobre las limitaciones de responsabilidad.

## Enlaces

- HuggingFace: https://huggingface.co/Sejibeji/agfno-darcy
- Kaggle kernel: sehajrsingh/agfno-darcy-full-run
- Kaggle dataset: sehajrsingh/agfno-darcy-bench-code
- Paper de referencia (FNO): Li et al. (2021), "Fourier Neural Operator for Parametric Partial Differential Equations", ICLR.
