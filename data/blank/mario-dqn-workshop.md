# BLANK/mario-dqn-workshop

## Resumen

`BLANK/mario-dqn-workshop` es un repositorio de checkpoints de un agente de aprendizaje por refuerzo basado en Deep Q-Network (DQN) entrenado para jugar el nivel 1-1 de Super Mario Bros. El modelo ha sido publicado por el autor `BLANK` con fines exclusivamente educativos, como material de apoyo para un taller práctico de Colab sobre aprendizaje por refuerzo (SLM-RL). No se trata de un modelo de lenguaje ni de un producto comercial, sino de un conjunto de pesos que permiten arrancar un entrenamiento en vivo desde una política precalentada (`warm-start.chkpt`) y evaluar una política final (`final.chkpt`) en una sesión de 15-20 minutos.

El agente utiliza una arquitectura de red neuronal convolucional (CNN) estilo Nature, con observaciones de 4 frames apilados en escala de grises de 84×84 píxeles, un espacio de acciones reducido a `RIGHT` y `RIGHT+A`, y un frame skip de 4. El repositorio incluye además archivos de configuración, sumas de verificación SHA-256 y métricas de evaluación registradas. Su relevancia radica en servir como ejemplo didáctico de implementación de DQN en un entorno de videojuego clásico, no en su rendimiento como sistema autónomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DQN con CNN estilo Nature (4 capas convolucionales + capas fully connected) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no aplica (pesos en punto flotante, sin cuantizacion publicada) |
| Idiomas soportados | no disponibles |
| Licencia | other (no especificada en detalle) |
| Formato de pesos | Checkpoints PyTorch (`.chkpt`) + `config.json` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura clásica de DQN propuesta por Mnih et al. (2015), con una CNN que procesa 4 frames apilados de 84×84 píxeles en escala de grises. La red convolucional extrae características espaciales y temporales de la escena, y las capas fully connected producen valores Q para cada acción posible. El espacio de acciones se limita a dos movimientos (`RIGHT` y `RIGHT+A`), lo que simplifica el problema de control.

El entrenamiento se realiza mediante aprendizaje por refuerzo, con el agente interactuando con el entorno `SuperMarioBros-1-1-v0` de Gymnasium. No se especifican los datos de entrenamiento (número de episodios, tamaño del dataset, etc.) en la información disponible. El repositorio contiene dos checkpoints: uno de arranque en caliente (`warm-start.chkpt`) y otro final (`final.chkpt`), ambos generados durante el desarrollo del taller. No se menciona el uso de técnicas como RLHF o DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Jugar el nivel 1-1 de Super Mario Bros mediante control basado en píxeles.
- Tomar decisiones secuenciales (derecha y salto) optimizando la recompensa acumulada.
- Procesar observaciones visuales de alta dimensionalidad (4×84×84) con una CNN.
- Servir como punto de partida para entrenamiento adicional en entornos similares.
- Proporcionar una política de evaluación preentrenada para demostraciones.
- No tiene capacidades de generación de texto, razonamiento simbólico, tool calling ni procesamiento de lenguaje natural.

## Casos de uso

- Taller educativo de aprendizaje por refuerzo: el checkpoint `warm-start.chkpt` permite a los participantes comenzar el entrenamiento en vivo desde una política parcialmente aprendida, reduciendo el tiempo necesario para observar mejoras en el comportamiento del agente.
- Demostración de DQN en entornos de videojuegos: el checkpoint `final.chkpt` se utiliza en la celda de evaluación final del taller para mostrar una política más fuerte que la aleatoria.
- Práctica de integración de entornos Gymnasium con PyTorch: el repositorio incluye `config.json` con el mapa de acciones, el apilado de frames y el preprocesamiento, sirviendo como referencia para implementar pipelines de RL.
- Verificación de integridad de modelos: los archivos `checksums.json` permiten comprobar la integridad de los checkpoints descargados, útil en entornos de CI/CD o despliegue reproducible.
- Estudio de políticas de control en juegos de plataformas: los pesos pueden analizarse para entender qué características visuales prioriza el agente (por ejemplo, detección de enemigos o huecos).
- Base para experimentos de fine-tuning: aunque no es un modelo de lenguaje, los checkpoints pueden servir como inicialización para entrenar agentes en niveles más avanzados de Super Mario Bros o en otros juegos de plataformas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye un archivo `metrics.json` con distancias y recompensas registradas durante la evaluación, pero no se proporcionan valores concretos en la documentación accesible. No se dispone de comparaciones con otros agentes DQN en el mismo entorno.

## Requisitos de hardware

- VRAM estimada: no disponible. Dado que es un DQN con CNN pequeña (típicamente menos de 1 millón de parámetros), se espera que quepa en GPUs con 2-4 GB de VRAM, pero no hay datos oficiales.
- GPU recomendadas: no especificadas. El taller se ejecuta en Google Colab, por lo que una GPU gratuita (T4) o incluso CPU son suficientes para la inferencia y el entrenamiento corto.
- Compatibilidad con GPU de consumo: sí, cualquier GPU moderna con soporte CUDA (por ejemplo, RTX 2060 o superior) puede ejecutar el modelo sin problemas.
- Opciones de despliegue: el modelo se carga directamente con PyTorch en un notebook de Colab. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. En una GPU T4, la inferencia de un DQN de este tamaño suele ser de milisegundos por paso, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo repositorio o en los resultados de búsqueda. Existen otros proyectos de DQN para Super Mario Bros (por ejemplo, los repositorios de F-MurraVicario13 o BrunooCS), pero no se proporcionan datos cuantitativos de rendimiento ni especificaciones detalladas para establecer una comparación rigurosa. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo es exclusivamente educativo: no es un producto comercial ni un sistema autónomo listo para producción.
- El entrenamiento en un taller de 15-20 minutos no equivale a un entrenamiento completo; el agente puede no ser robusto ante variaciones del entorno.
- Super Mario Bros es propiedad de Nintendo; estos pesos son evidencia educativa y no están aprobados por Nintendo.
- El espacio de acciones está limitado a dos acciones (`RIGHT` y `RIGHT+A`), lo que restringe la capacidad del agente para completar el nivel de forma óptima.
- No se especifican sesgos conocidos, pero al entrenarse en un único nivel, el agente puede no generalizar a otros niveles o variaciones del juego.
- La licencia es "other" y no se detallan los términos exactos; se recomienda contactar al autor antes de cualquier uso comercial.
- No hay garantías de soporte ni mantenimiento del repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/BLANK/mario-dqn-workshop
- Informe académico sobre DQN para Mario (CS229 Stanford): https://cs229.stanford.edu/proj2016/report/klein-autonomousmariowithdeepreinforcementlearning-report.pdf
- Proyecto similar en GitHub (F-MurraVicario13): https://github.com/F-MurraVicario13/super_mario_DQN
- Proyecto similar en GitHub (BrunooCS): https://github.com/BrunooCS/AI-Super-Mario-DQL-
- Tutorial de Double DQN para Super Mario Bros (Paperspace): https://blog.paperspace.com/building-double-deep-q-network-super-mario-bros/
- Notebook de ejemplo en Colab: https://colab.research.google.com/github/wonseokjung/ai_supermario/blob/master/2_supermario_dqn.ipynb
