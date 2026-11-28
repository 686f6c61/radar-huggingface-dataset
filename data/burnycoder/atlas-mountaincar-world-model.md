# BurnyCoder/atlas-mountaincar-world-model

## Resumen

`atlas-mountaincar-world-model` es un modelo de mundo (world model) de pequeno tamano entrenado para predecir el siguiente fotograma en rollouts del entorno `MountainCar-v0` de Gymnasium. Lo desarrolla BurnyCoder como parte del proyecto "Atlas of Circuits & Manifolds", una coleccion de artefactos de investigacion orientados a la interpretabilidad mecanistica de redes neuronales. No es un modelo de lenguaje ni un modelo generativo de proposito general: es una herramienta experimental para replicar analisis de representaciones internas.

El objetivo concreto del modelo es reproducir el analisis de la variedad (manifold) de posicion descrito por Goodfire en "The World Inside Neural Networks" y por Wurgaft et al. (arXiv:2605.05115, Apendice B), donde se muestra que la posicion del coche queda codificada sobre una variedad curvada de una dimension en el espacio latente. El modelo sirve, por tanto, como banco de pruebas controlado para estudiar como una red pequena representa una variable fisica escalar.

La arquitectura es deliberadamente minimalista: un codificador convolucional que transforma fotogramas de 64x64 en un latente de 64 dimensiones con LayerNorm, una embedding de accion de 16 dimensiones, una GRU de 64 unidades y decodificadores convolucionales para el fotograma actual y el siguiente. El repositorio tiene 0.0 GB, no registra descargas ni likes, y se distribuye bajo licencia MIT como `state_dict` de PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador convolucional + embedding de accion + GRU-64 + decodificadores convolucionales |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de secuencia de texto; opera sobre rollouts de MountainCar) |
| Tipos de cuantizacion | no disponible (checkpoint en precision original de PyTorch) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch `state_dict` (`mountain_car_world_model.pt`) + `config.json` |

## Arquitectura y entrenamiento

El modelo sigue un diseno de world model clasico para entornos visuales de baja resolucion. Un codificador convolucional procesa fotogramas de 64x64 y los proyecta a un latente de 64 dimensiones normalizado con LayerNorm. La accion discreta se representa mediante una embedding de 16 dimensiones. Ambos vectores alimentan una GRU de 64 unidades que mantiene el estado recurrente, y dos cabezas decodificadoras convolucionales reconstruyen el fotograma actual y predicen el siguiente. La tarea de entrenamiento es prediccion del siguiente fotograma sobre rollouts de `gymnasium` `MountainCar-v0`.

No se dispone de informacion sobre el numero de tokens o fotogramas de entrenamiento, la composicion exacta del dataset, ni sobre si se aplicaron tecnicas de ajuste fino como RLHF o DPO (no aplicables en este contexto). La innovacion tecnica relevante no esta en la arquitectura sino en el proposito: el modelo esta calibrado para que su latente de 64 dimensiones permita reproducir el hallazgo de que la posicion del coche se organiza sobre una variedad curvada de una dimension, lo que lo convierte en un sustrato controlado para experimentos de interpretabilidad mecanistica.

## Capacidades

- Prediccion del siguiente fotograma en `MountainCar-v0` a partir de fotogramas de 64x64 y una accion discreta.
- Reconstruccion del fotograma actual mediante un decodificador convolucional separado.
- Mantenimiento de estado recurrente a traves de una GRU de 64 unidades para secuencias de rollouts.
- Representacion latente de 64 dimensiones con LayerNorm, disenada para facilitar analisis de variedades y circuitos.
- Soporte para replicar el analisis de manifold de posicion de Goodfire y Wurgaft et al.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No dispone de modo thinking, vision general, audio ni generacion de texto.

## Casos de uso

- Replicacion de experimentos de interpretabilidad: cargar el `state_dict`, extraer el latente de 64 dimensiones y verificar que la posicion del coche traza una variedad curvada de una dimension, tal como describen Goodfire y Wurgaft et al.
- Docencia en interpretabilidad mecanistica: el modelo es lo bastante pequeno para entrenar y analizar en una sola GPU de consumo, lo que permite usarlo en cursos o talleres para ensenar tecnicas de analisis de representaciones.
- Validacion de metodologias de analisis de manifold: sirve como caso de referencia con verdad fundamental conocida (la posicion del coche) para comprobar si una nueva tecnica de deteccion de variedades recupera la estructura esperada.
- Estudio de world models en entornos de control: permite investigar como una red recurrente pequena integra observaciones visuales y acciones para mantener un estado interno util para la prediccion.
- Benchmark de tecnicas de probing: al conocerse la variable latente subyacente, se pueden comparar clasificadores lineales, analisis de componentes principales y metodos no lineales sobre el mismo latente.
- Desarrollo de herramientas del Atlas: el checkpoint sirve como entrada interactiva en la web del proyecto, permitiendo a otros investigadores reproducir las visualizaciones sin reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; por el tamano del repo (0.0 GB) y la arquitectura descrita (codificador convolucional para 64x64, GRU-64 y decodificadores convolucionales), el checkpoint es de pocos megabytes y cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; una RTX 3060, RTX 4090 o incluso CPU son suficientes para inferencia y para analisis del latente.
- Cabe en GPU de consumo: si, practicamente en cualquier modelo actual e incluso en GPUs integradas.
- Opciones de despliegue: PyTorch nativo cargando el `state_dict` con `torch.load(path, map_location="cpu")` y reconstruyendo la clase desde `src/atlas/entries/world_model.py`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles; al tratarse de un modelo diminuto sobre fotogramas de 64x64, la latencia por paso deberia ser de milisegundos en GPU y de decenas de milisegundos en CPU, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| atlas-mountaincar-world-model | no disponible (muy pequeno) | no aplica | Prediccion de siguiente fotograma en MountainCar | MIT | Hugging Face |
| World models de referencia en interpretabilidad (Goodfire, Wurgaft et al.) | no disponible | no aplica | Analisis de manifold de posicion | no disponible | No disponible como checkpoint publico en la informacion proporcionada |
| Modelos de mundo para Atari (p. ej. familia Dreamer) | no disponible | no aplica | Prediccion y control en Atari | no disponible | Multiples implementaciones publicas, no comparadas aqui |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos de referencia en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Artefacto de investigacion: el propio autor indica que son modelos diminutos entrenados en tareas sinteticas y no destinados a ningun uso downstream.
- No es un modelo de lenguaje: no procesa texto, no responde a prompts y no soporta tool calling ni agentes.
- Entrenado exclusivamente en `MountainCar-v0`; no generaliza a otros entornos ni a imagenes naturales.
- No se documentan sesgos, pero al ser un modelo sintetico y de dominio cerrado, cualquier conclusion extraida no es trasladable sin validacion a modelos mayores.
- Riesgo de alucinacion no aplicable en el sentido habitual; el riesgo real es sobreinterpretar las estructuras latentes encontradas.
- Licencia MIT: permite uso comercial, pero el modelo no tiene utilidad comercial practica.
- La carga requiere reconstruir la clase desde el repositorio del proyecto; no hay `pipeline` de Hugging Face ni `AutoModel` disponible.
- No se especifican los idiomas soportados porque el modelo no opera sobre lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/BurnyCoder/atlas-mountaincar-world-model
- Repositorio del proyecto: https://github.com/BurnyCoder/circuits-and-manifolds-in-llms-atlas
- Entrada interactiva del Atlas: https://burnycoder.github.io/circuits-and-manifolds-in-llms-atlas/#/entry/world-model
- Articulo de Goodfire "The World Inside Neural Networks": https://www.goodfire.com/research/the-world-inside-neural-networks
- Paper de Wurgaft et al.: https://arxiv.org/abs/2605.05115
