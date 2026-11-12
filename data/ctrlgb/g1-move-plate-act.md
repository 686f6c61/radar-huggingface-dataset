# Ctrlgb/g1-move-plate-act

## Resumen

`Ctrlgb/g1-move-plate-act` es un checkpoint de política robótica basado en la arquitectura ACT (Action Chunking Transformer) entrenado con la librería LeRobot 0.7. Lo desarrolla el usuario Ctrlgb y resuelve una tarea concreta de manipulación: mover un plato de la estantería 1 a la estantería 2 con un robot humanoide Unitree G1 equipado con pinzas Dex1-1, dentro del simulador MuJoCo y sobre el benchmark BiGym2. No es un modelo de lenguaje: es un controlador visomotor que mapea observaciones (tres cámaras RGB más propiocepción) a acciones motoras de 20 dimensiones.

El modelo tiene 51.654.292 parámetros y un tamaño de repositorio de 0,3 GB, coherente con un transformer compacto con backbones ResNet18. Su relevancia radica en que combina demostraciones humanas reales con episodios sintéticos generados por un experto privilegiado, una estrategia habitual para reducir el coste de recolección de datos en robótica. El checkpoint reporta un éxito del 30/30 en el bloque público oficial de evaluación y 119/120 en un bloque retenido.

La ficha se limita a los datos publicados en la model card y en los metadatos de Hugging Face; no hay información sobre licencia, idiomas ni benchmarks estándar de NLP, por lo que esos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con backbones ResNet18 (inicialización ImageNet) |
| Parametros totales | 51.654.292 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control; chunk de 50 acciones con ensamblado temporal 0,01) |
| Tipos de cuantizacion | no disponible (checkpoint en fp32) |
| Idiomas soportados | no disponible (modelo robótico, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ACT, un transformer que predice trozos (chunks) de acciones futuras a partir de observaciones visuales y propioceptivas. Las entradas son tres cámaras RGB a resolución 84x84 (cabeza, muñeca derecha y muñeca izquierda) más 28 dimensiones de posición propioceptiva, un subconjunto de las 50 dimensiones del estado del evaluador, sin acceso a estado privilegiado. La salida es un vector de acción normalizado de 20 dimensiones que incluye velocidades de base (vx, vy), altura de pelvis, velocidad de giro (yaw rate), dos conjuntos de 7 objetivos articulares para los brazos y dos valores para las pinzas. Se usa un chunk de 50 acciones con ensamblado temporal de 0,01 y una acción por paso de control.

El entrenamiento se realizó durante 50.000 pasos con batch de 256, tasa de aprendizaje de 2e-5 tanto para el optimizador como para el backbone, y precisión fp32. El conjunto de datos consta de 360 episodios y 249.251 fotogramas: 60 demostraciones humanas de BiGym2 (SWIRL-Lab/bigym-g1-native60) y 300 episodios sintéticos generados por un experto scriptado privilegiado con agarre lateral, parámetros ampliados y perturbaciones de ejecución al estilo DART. La parte inferior del cuerpo del G1 permanece congelada mediante GR00T-WBC.

## Capacidades

- Control visomotor para una tarea de manipulación concreta: mover un plato de la estantería 1 a la estantería 2.
- Fusión de tres vistas RGB (cabeza y ambas muñecas) con propiocepción de 28 dimensiones.
- Generación de acciones de cuerpo completo limitadas a base móvil, altura de pelvis, giro y control de dos brazos de 7 grados de libertad más dos pinzas.
- Predicción de chunks de 50 acciones con ensamblado temporal para suavizar la ejecución.
- Ejecución en el simulador MuJoCo sobre el benchmark BiGym2 con el modelo Unitree G1.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual ni capacidades multilingües.

## Casos de uso

- Evaluación de políticas de imitación en BiGym2: sirve como referencia reproducible para comparar variantes de ACT sobre la tarea `move_plate` con el protocolo balanced-slot (5 episodios por slot de origen).
- Investigación en aumento de datos sintéticos: el checkpoint permite estudiar cuánto aporta mezclar 60 demostraciones humanas con 300 episodios generados por un experto scriptado con perturbaciones DART.
- Desarrollo de controladores para humanoides con base móvil: el modelo ilustra cómo integrar velocidades de base, altura de pelvis y giro junto con el control de brazos y pinzas en un único vector de acción de 20 dimensiones.
- Pruebas de robustez ante variaciones de posicionamiento: el bloque retenido de 120 episodios permite analizar fallos como el documentado (plato sujeto en el borde de la estantería destino sin asentarse, con timeout).
- Base para ajuste fino en tareas de pick-and-place con el Unitree G1: el checkpoint puede servir de inicialización para tareas similares que compartan el espacio de observación y acción.
- Validación de pipelines LeRobot: útil para comprobar la integración de checkpoints ACT con las herramientas de descarga, carga y evaluación de LeRobot 0.7 en entornos simulados.

## Benchmarks y rendimiento

| Evaluación | Episodios | Éxito |
|---|---|---|
| Bloque de validación 5.000.000 | no disponible | 30/30 |
| Bloque público oficial 7.310.000 | 30 (5 por slot) | 30/30 (5/5 en cada slot) |
| Bloque retenido 8.100.000 | 120 | 119/120 |

El único fallo documentado corresponde a la semilla 8100035, slot 1: el plato queda sujeto en el borde de la estantería destino y no se asienta antes del timeout. No se han publicado resultados de benchmarks estándar de NLP (MMLU, HumanEval, GSM8K) en la información disponible, lo cual es esperable en un modelo de robótica.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 51,6 millones de parámetros en fp32, los pesos ocupan aproximadamente 207 MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 3060 o superior es suficiente para inferencia, y una GPU de datacenter (A100, H100) solo sería necesaria para reentrenamiento o evaluación masiva en paralelo.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño reducido del checkpoint.
- Opciones de despliegue: LeRobot 0.7 (librería declarada) y el entorno de simulación MuJoCo con BiGym2; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / chunk | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ctrlgb/g1-move-plate-act | 51,6 M | chunk 50, ensamblado 0,01 | 30/30 bloque público; 119/120 retenido | no disponible | Hugging Face |
| Otras políticas ACT para BiGym2 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Políticas basadas en difusión para manipulación (p. ej. Diffusion Policy) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos publicados en la información proporcionada para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo específico de una única tarea (`move_plate`) y un único entorno (BiGym2 con Unitree G1 y pinzas Dex1-1); no generaliza a otras tareas sin reentrenamiento.
- Depende de una configuración exacta de observaciones: tres cámaras a 84x84 y 28 dimensiones propioceptivas; desviarse de ese formato invalida la política.
- La parte inferior del cuerpo está congelada mediante GR00T-WBC, por lo que el modelo no controla la locomoción completa del humanoide.
- Licencia no disponible: no puede confirmarse el uso comercial ni la redistribución de los pesos.
- Riesgo de fallo en el asentamiento final del objeto, como muestra el único error del bloque retenido (plato en el borde de la estantería destino, timeout).
- Entrenado principalmente con datos sintéticos (300 de 360 episodios), lo que puede introducir un sesgo hacia la distribución del experto scriptado y limitar la robustez ante condiciones no simuladas.
- Sin información sobre sesgos, alucinación o comportamiento fuera de distribución más allá de los bloques de evaluación reportados.
- No apto para producción fuera del simulador sin validación adicional en hardware real.

## Enlaces

- Hugging Face: https://huggingface.co/Ctrlgb/g1-move-plate-act
- Repositorio de la solución (código, comandos de entrenamiento y registro de experimentos): mencionado en la model card como "solution repository", sin URL explícita en la información disponible.
- SWIRL BiGym2 (tarea, assets, modelo G1 y demostraciones): referenciado en la model card, sin URL explícita.
- LeRobot (framework ACT): referenciado en la model card, sin URL explícita.
- Dataset de demostraciones SWIRL-Lab/bigym-g1-native60: referenciado en la model card, sin URL explícita.
