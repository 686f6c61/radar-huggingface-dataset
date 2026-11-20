# JonathanWWW/CT-PoreFlow

## Resumen

CT-PoreFlow es un conjunto de datos, código y checkpoints entrenados para el modelado de flujo en medios porosos mediante operadores neuronales. Lo publica el usuario JonathanWWW en Hugging Face bajo licencia CC-BY-4.0, con el código alojado en un repositorio de GitHub. El paquete aborda un problema clásico de la mecánica de fluidos computacional: predecir campos de velocidad, densidad y presión en geometrías porosas bidimensionales sin resolver la ecuación de lattice-Boltzmann (LBM) en cada muestra, lo que permite acelerar el análisis y el diseño inverso de materiales porosos.

El repositorio, de 2,9 GB, contiene un dataset de 7.606 medios porosos 2D de 100 x 100 celdas generados con el método QSGS y simulados con un solver D2Q9-BGK de LBM en régimen estacionario, junto con el código de entrenamiento y evaluación en PyTorch de varios modelos (CT-PoreFlow, Time-U-Net, Time-FNO, DeepONet, ablaciones, cGAN y difusión) y 14 checkpoints con sus historiales de entrenamiento. También incluye resultados de evaluación, análisis estadísticos y salidas de diseño inverso.

Es relevante para investigadores en ML científico que necesiten un benchmark reproducible de operadores neuronales aplicados a dinámica de fluidos en medios porosos, con particiones estratificadas por porosidad y métricas por muestra y por paso temporal. No es un modelo de lenguaje: no procesa texto ni dispone de ventana de contexto en el sentido habitual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Operadores neuronales sobre rejillas 2D (CT-PoreFlow, Time-U-Net, Time-FNO, DeepONet); se incluyen también cGAN y modelos de difusión |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de 100 x 100 celdas de lattice) |
| Tipos de cuantizacion | no disponible (checkpoints en PyTorch `best.pt`, sin versiones cuantizadas publicadas) |
| Idiomas soportados | no disponible (modelo numérico, no lingüístico) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (`best.pt`), datos en `.npz` y `.json` |

## Arquitectura y entrenamiento

El paquete no define una única arquitectura, sino una familia de modelos comparados bajo el mismo protocolo. El núcleo son operadores neuronales que aprenden el mapeo entre la geometría del medio poroso (campos `solid`, `pore`, `through_connected_pore`, distancias EDT) y los campos físicos de salida (`velocity_x/y/magnitude`, `density`, `pressure`), en versiones crudas y normalizadas. Se incluyen variantes con componente temporal (Time-U-Net, Time-FNO) para el caso transitorio, además de DeepONet, ablaciones, una cGAN y modelos de difusión para tareas de generación o diseño inverso.

Los datos proceden de 7.606 geometrías QSGS de 100 x 100 celdas con simulación LBM D2Q9-BGK estacionaria. La partición es 6.078 de entrenamiento, 764 de validación y 764 de prueba, estratificada en ocho bins de porosidad entre 0,30 y 0,70. Cada muestra incluye metadatos en JSON con parámetros de crecimiento QSGS, porosidad, métricas de convergencia, permeabilidad, tortuosidad y factores de normalización. El repositorio contiene además un generador de dataset QSGS+LBM en Python y los scripts originales en MATLAB, lo que permite regenerar o ampliar los datos. No se especifican en la información disponible el número de tokens, la composición detallada del dataset de entrenamiento ni el uso de RLHF/DPO, que no aplican a este dominio.

## Capacidades

- Predicción de campos de velocidad, densidad y presión en geometrías porosas 2D a partir de la imagen binaria del medio.
- Modelado en régimen estacionario (dataset principal) y transitorio (generador de snapshots y modelos temporales).
- Estimación de propiedades macroscópicas derivadas: permeabilidad y tortuosidad, registradas por muestra en los JSON.
- Diseño inverso de geometrías porosas, con salidas incluidas en `CT-PoreFlow_results.zip` y soporte de cGAN y difusión.
- Evaluación comparativa entre operadores neuronales (CT-PoreFlow, Time-U-Net, Time-FNO, DeepONet) y ablaciones bajo un protocolo común.
- Partición estratificada por porosidad y hold-out temporal para evaluar generalización.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo numérico de dominio específico.

## Casos de uso

- Caracterización de medios porosos a partir de tomografía: dado un volumen binario de 100 x 100 celdas, el modelo predice el campo de velocidad sin ejecutar LBM, lo que reduce el coste de cribado de muestras de roca o espumas.
- Estimación rápida de permeabilidad: la salida de velocidad y los metadatos de entrenamiento permiten aproximar la permeabilidad efectiva para clasificar muestras antes de simulaciones de alta fidelidad.
- Diseño inverso de materiales porosos: los modelos generativos incluidos (cGAN, difusión) permiten proponer geometrías que alcancen un objetivo de flujo, útil en filtros, catalizadores o medios de cultivo.
- Benchmark de operadores neuronales: el paquete sirve como referencia reproducible para comparar nuevas arquitecturas (FNO, DeepONet, U-Net) con particiones y métricas fijas.
- Estudio de transporte transitorio: los modelos temporales y el generador de snapshots permiten analizar la evolución del flujo tras un cambio de condiciones de contorno.
- Docencia e investigación en ML científico: el código PyTorch, los scripts MATLAB y los 14 checkpoints con historiales facilitan reproducir experimentos y analizar ablaciones.
- Validación de pipelines de simulación: el generador QSGS+LBM permite crear datasets sintéticos etiquetados para entrenar o auditar modelos en dominios con datos escasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye métricas de evaluación por muestra y por paso temporal en `CT-PoreFlow_results.zip`, pero no se detallan valores numéricos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende de la arquitectura concreta entre las 14 incluidas y del tamaño de los checkpoints, que en conjunto ocupan 1,4 GB.
- GPU recomendadas: no disponible. Al tratarse de modelos sobre rejillas de 100 x 100 celdas, es previsible que quepan en GPU de consumo, pero no se confirma en la información disponible.
- Cabe en consumer GPU: no confirmado; el tamaño del paquete de checkpoints (1,4 GB para 14 ejecuciones) sugiere modelos pequeños, pero no se especifica por modelo.
- Opciones de despliegue: PyTorch nativo; el código de entrenamiento y evaluación está en `transient_flow_dl/`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CT-PoreFlow | no disponible | 100 x 100 celdas | métricas en `results.zip`, sin cifras públicas | CC-BY-4.0 | Hugging Face + GitHub |
| Time-U-Net (incluido en el paquete) | no disponible | 100 x 100 celdas | comparado en el mismo protocolo | CC-BY-4.0 | incluido |
| Time-FNO (incluido en el paquete) | no disponible | 100 x 100 celdas | comparado en el mismo protocolo | CC-BY-4.0 | incluido |
| DeepONet (incluido en el paquete) | no disponible | 100 x 100 celdas | comparado en el mismo protocolo | CC-BY-4.0 | incluido |

No se dispone de información sobre modelos externos comparables con cifras verificables; los únicos puntos de comparación documentados son las variantes incluidas en el propio repositorio.

## Limitaciones y advertencias

- Dominio restringido a medios porosos bidimensionales de 100 x 100 celdas; no se documenta su validez en 3D ni en geometrías de mayor resolución.
- Régimen estacionario en el dataset principal; el comportamiento transitorio depende de los modelos temporales y del generador de snapshots, con cobertura no detallada.
- Rango de porosidad limitado a 0,30-0,70; fuera de ese intervalo la generalización no está garantizada.
- Riesgo de extrapolación incorrecta ante geometrías o condiciones de contorno distintas de las QSGS/D2Q9-BGK usadas en el entrenamiento.
- No se documentan sesgos en el sentido estadístico, pero la estratificación por bins de porosidad puede introducir desequilibrios en subpoblaciones concretas.
- Licencia CC-BY-4.0: permite uso comercial con atribución; conviene revisar los términos de los scripts MATLAB originales incluidos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida; los resultados deben verificarse antes de usarse en producción.
- No se especifican requisitos de normalización más allá de los factores incluidos en los JSON; un uso incorrecto de los campos `*_normalized` puede invalidar las predicciones.

## Enlaces

- Hugging Face: https://huggingface.co/JonathanWWW/CT-PoreFlow
- GitHub (código): https://github.com/wangyiming2/CT-PoreFlow
