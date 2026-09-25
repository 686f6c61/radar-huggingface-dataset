# junbrro/egopi-axis1-robotonly-native28-30k-mlxp-20260925

## Resumen

Este repositorio contiene el checkpoint final (paso 30.000) de un modelo de la familia Ego-Pi, identificado por el autor como "Arm I robot-only native28". Se trata de un modelo visión-lenguaje-acción (VLA) orientado a control robótico, entrenado exclusivamente con datos de robot ("robot-only"), según indica su propio nombre. El checkpoint pesa 13,8 GB y declara 6.912.894.784 parámetros (~6,91 mil millones) en formato safetensors.

El trabajo asociado, Ego-Pi, se presenta como un marco de ajuste fino de modelos VLA preentrenados sobre datos egocéntricos humanos y de robots humanoides con manos de cinco dedos, partiendo del modelo Pi0.5 como base. La relevancia de este checkpoint es acotada: se publica como material de investigación reproducible, no como modelo listo para producción, ya que su model card advierte explícitamente de que la finalización del entrenamiento no garantiza rendimiento en despliegue real.

No se dispone de licencia, idiomas, pipeline ni resultados de evaluación publicados. El repositorio registra 0 descargas y 0 "likes", y su model card solo aporta pesos y configuración finales, sin estado del optimizador ni de RNG, por lo que no permite reanudar el entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (visión-lenguaje-acción); no detallada en la model card. El trabajo asociado Ego-Pi parte de Pi0.5 |
| Parámetros totales | 6.912.894.784 (~6,91 mil millones), dato real de safetensors |
| Parámetros activos | no disponible (no se ha confirmado una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio de 13,8 GB) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Los únicos datos técnicos disponibles son el número de parámetros (6,91 mil millones), el formato de pesos (safetensors) y la etiqueta "RLDX-1" asociada al repositorio. El material de referencia externo sitúa esta línea de trabajo dentro de Ego-Pi, un marco que adapta modelos VLA preentrenados a datos egocéntricos de alta dimensionalidad procedentes de humanos y de robots humanoides, y que emplea una estrategia de intercalado de tokens ("token interleaving") para manejar acciones de control bimanual diestro.

Este checkpoint concreto corresponde al paso 30.000 de un entrenamiento cuyo origen declarado es "junhyeong-axis1-robotonly-native28-30k-260923-r1", y se etiqueta como "robot-only", es decir, sin la parte de datos humanos que sí contempla el marco Ego-Pi general. Se conservan la configuración y el procesador originales, incluidas rutas del clúster de origen que deben reasignarse antes de la inferencia. El repositorio incluye un directorio `actlat/` con el tokenizador de acciones cuando aplica. No se especifican número de tokens de entrenamiento, composición del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste por preferencias.

## Capacidades

- Control robótico mediante predicción de acciones: el modelo pertenece a la categoría VLA, por lo que su salida esperada son acciones de control más que texto libre.
- Control bimanual diestro: según el marco Ego-Pi de referencia, esta línea de modelos está diseñada para robots con manos de cinco dedos y acciones de alta dimensionalidad, no para pinzas simples.
- Entrada multimodal visión-lenguaje: la base Pi0.5 implica procesamiento conjunto de imágenes y lenguaje para generar acciones.
- Tokenizador de acciones incluido: el directorio `actlat/` empaqueta el tokenizador de acciones cuando aplica.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo pensamiento, audio, etc.): no disponible.

## Casos de uso

- Investigación en manipulación robótica diestra: el checkpoint puede emplearse como punto de partida para reproducir o comparar experimentos de control bimanual con manos de cinco dedos, dado que el marco Ego-Pi se centra en ese escenario.
- Ajuste fino posterior sobre datos propios de robot: al ser un checkpoint "robot-only" con pesos y configuración completos, sirve como inicialización para nuevos entrenamientos en un brazo robótico concreto, siempre que se reasignen las rutas del clúster de origen.
- Evaluación de generalización humano-a-robot: comparándolo con los checkpoints de la misma familia que sí incorporan datos humanos, permite medir cuánto aporta el dato egocéntrico humano frente al dato exclusivamente robótico.
- Integración en un pipeline de robótica con tokenizador de acciones: el directorio `actlat/` permite conectar la salida del modelo con el espacio de acciones discretizadas del robot, dentro de un bucle de control.
- Reproducibilidad de experimentos: al conservar la configuración original y no incluir estado del optimizador ni de RNG, es adecuado para replicar inferencia, no para reanudar el entrenamiento.
- Base para ablaciones de datos: al estar etiquetado como "native28" y "robot-only", resulta útil como condición de control en estudios que comparen recetas de datos dentro de Ego-Pi.
- Punto de partida para despliegue en simulación: antes de transferir a hardware real, el checkpoint puede validarse en entornos simulados con el mismo espacio de acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que "la finalización del entrenamiento no establece rendimiento de rollout", por lo que no existe evidencia declarada de éxito en tareas reales.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: los 6,91 mil millones de parámetros ocupan aproximadamente 13,8 GB solo en pesos; con activaciones y buffers, conviene reservar del orden de 16-20 GB.
- VRAM estimada en INT8: en torno a 7 GB de pesos, más activaciones.
- VRAM estimada en INT4: en torno a 3,5-4 GB de pesos, más activaciones.
- GPU recomendadas para FP16: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A6000, L40S; para servir varios lotes o entrenar, A100 o H100.
- GPU de consumo: sí cabe en GPUs de consumo de 24 GB (RTX 3090, 4090) en FP16, y en GPUs de 12-16 GB si se cuantiza.
- Opciones de despliegue: no disponible. La model card no menciona vLLM, llama.cpp, Ollama, TGI ni ninguna otra herramienta, y no se publican pesos GGUF. El repositorio apunta a una pila de robótica propia (etiqueta RLDX-1 y tokenizador `actlat/`).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| junbrro/egopi-axis1-robotonly-native28-30k-mlxp-20260925 | 6,91 mil millones | no disponible | no disponible | no disponible | Pesos safetensors en HuggingFace |
| Pi0.5 (base declarada del marco Ego-Pi) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |
| Otros checkpoints de la familia Ego-Pi (p. ej. egopi-mt-r6h5-axis1-AB-30k) | no disponible | no disponible | no disponible | no disponible | Pesos safetensors en HuggingFace |

No se dispone de datos comparativos verificables (parámetros, contexto, resultados o licencia) de las alternativas dentro de la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks ni métricas de rollout; el propio autor advierte de que completar el entrenamiento no implica que el modelo funcione en un robot real.
- Naturaleza de checkpoint, no de modelo final: se publican únicamente pesos y configuración, sin estado del optimizador ni de RNG, por lo que no se puede reanudar el entrenamiento desde este punto.
- Rutas del clúster de origen: la configuración conserva rutas absolutas del entorno de entrenamiento original y debe reasignarse antes de cualquier inferencia; ignorarlo provocará fallos de carga.
- Alcance restringido a robot: al ser "robot-only", no incorpora el dato humano egocéntrico que el marco Ego-Pi usa para aprender semántica de tareas nuevas, lo que limita su generalización a comportamientos no vistos en el dataset robótico.
- Licencia no declarada: sin licencia publicada no hay autorización explícita de uso comercial; debe tratarse como material de investigación restringido hasta aclararlo con el autor.
- Idiomas no especificados: se desconoce el soporte multilingüe y la composición lingüística del entrenamiento.
- Datos de uso nulos: 0 descargas y 0 "likes" implican que no existe validación por parte de terceros ni reportes de fallos.
- Riesgo de sesgo y de alucinación: no evaluable con la información disponible.
- Fechas del repositorio: la model card y los metadatos declaran fechas de septiembre de 2026, posteriores a la mayoría de referencias del ecosistema; conviene verificar su coherencia antes de citarlo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/junbrro/egopi-axis1-robotonly-native28-30k-mlxp-20260925
- Checkpoint relacionado de la misma familia: https://huggingface.co/junbrro/egopi-mt-r6h5-axis1-AB-30k-actsilu-slurm-18839-20260921
- Página del proyecto Ego-Pi: https://egopipaper.github.io/
- Artículo Ego-Pi (PDF en arXiv): https://arxiv.org/pdf/2606.08107
