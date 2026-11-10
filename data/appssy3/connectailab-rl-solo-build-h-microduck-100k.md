# appssy3/connectailab-rl-solo-build-H-MicroDuck-100k

## Resumen

MicroDuck-100k es un checkpoint de aprendizaje por refuerzo (PPO) para el control de locomocion de un robot bipedo denominado MicroDuck, desarrollado por ConnectAI Lab dentro de su serie SoloBuild. No es un modelo de lenguaje ni un transformer generativo: es una politica neuronal (actor-critic) entrenada en el simulador fisico MuJoCo para que el robot aprenda a mantenerse erguido y caminar con calzado plano (shoes), sin ruedas, sobre superficies con friccion estandar. El repositorio se publica bajo los tags reinforcement-learning, ppo, bipedal-robot, mujoco, microduck, robotics y sim2real.

El entrenamiento reportado por el autor supera las 10.750 iteraciones (mas de 100k pasos de episodio, descritos en la model card como "mil millones de intentos") y produce varios artefactos: pesos PyTorch del actor-critic con normalizador de observaciones, un checkpoint adicional de equilibrio erguido con recuperacion ante empujones, y dos exportaciones ONNX para inferencia ligera y despliegue sim2real en tiempo real. La frecuencia de control es de 50 Hz y la red es un MLP pequeno ([256, 256, 128]), lo que lo hace adecuado para ejecucion embebida.

Su relevancia es acotada pero concreta: sirve como referencia reproducible de un pipeline completo de RL con PPO para robotica bipeda, incluyendo ingenieria de funcion de recompensa multiobjetivo, exportacion a ONNX y material audiovisual de validacion. No debe confundirse con un modelo fundacional: su utilidad esta ligada a la plataforma MicroDuck y a tareas de locomocion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP actor-critic (politica PPO, espacio de acciones continuo); redes [256, 256, 128] para actor y critico |
| Parametros totales | no disponible (red MLP pequena; el autor no publica el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; observacion vectorial de estado por paso) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos PyTorch `.pt` y exportaciones ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | no aplica (modelo de control roboticо, sin capacidades linguisticas) |
| Licencia | MIT (segun la model card); el campo de licencia de Hugging Face figura como no disponible |
| Formato de pesos | PyTorch (`.pt`) y ONNX (`.onnx`) |

## Arquitectura y entrenamiento

La politica es una red neuronal de tipo perceptron multicapa con capas ocultas [256, 256, 128], separada en actor (media y desviacion de una gaussiana sobre el espacio de acciones de par continuo) y critico (estimador del valor de estado). El algoritmo es PPO con recorte epsilon = 0,2, factor de descuento gamma = 0,99, GAE lambda = 0,95, tasa de aprendizaje 3e-4 con decaimiento lineal y optimizador Adam. El bucle de control opera a 50 Hz (0,02 s por paso), lo que impone un requisito de baja latencia en inferencia.

El entorno de entrenamiento es MuJoCo, con el robot bipedo MicroDuck equipado con calzado plano (no ruedas) y friccion de contacto estandar. La funcion de recompensa es multiobjetivo y combina cinco terminos: recompensa por velocidad de avance en el eje x (objetivo de 1,2 m/s), penalizacion por velocidad lateral |v_y| para reducir el balanceo tipico de la marcha bipeda, recompensa de supervivencia por mantener la posicion erguida en cada paso, penalizacion cuadratica del par articular para evitar sobrecalentamiento de actuadores, y una bonificacion de recuperacion ante fuerzas externas aleatorias (empujones). El autor reporta mas de 10.750 iteraciones de entrenamiento y un checkpoint adicional de 17.500 iteraciones orientado a equilibrio erguido y recuperacion.

## Capacidades

- Control de locomocion bipeda con calzado plano: genera comandos de par continuo para mantener la marcha a una velocidad objetivo de 1,2 m/s.
- Equilibrio estatico y erguido: el checkpoint `duck_velstand_17500.pt` y `alpha_stand.onnx` estan orientados a mantener la posicion vertical.
- Recuperacion ante perturbaciones: el entrenamiento incluye empujones aleatorios y recompensa explicita de restauracion de postura.
- Reduccion de balanceo lateral: la penalizacion de velocidad lateral busca una marcha mas estable en el eje transversal.
- Eficiencia energetica: la penalizacion del par cuadrado favorece politicas de actuacion mas suaves.
- Inferencia ligera: exportacion ONNX para ejecucion en runtime con latencia compatible con 50 Hz.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues.

## Casos de uso

- Control en simulacion de un robot bipedo: cargar `alpha_walking.onnx` en MuJoCo y cerrar el bucle de control a 50 Hz para reproducir la marcha entrenada; util como banco de pruebas de la politica antes de transferirla.
- Despliegue sim2real en la plataforma MicroDuck: el checkpoint ONNX esta pensado para ejecucion en tiempo real en el hardware del robot, con el normalizador de observaciones incluido en los pesos PyTorch.
- Estudio de ingenieria de recompensas: la funcion multiobjetivo documentada sirve como plantilla para experimentos de locomocion bipeda con PPO en MuJoCo, modificando pesos y observando el efecto en la marcha.
- Evaluacion de robustez ante perturbaciones: usar el checkpoint de equilibrio con empujones aleatorios para medir la capacidad de recuperacion y comparar variantes de politica.
- Docencia y divulgacion de RL: el repositorio incluye un video de validacion (`replay.mp4`) y material audiovisual, lo que facilita explicar un pipeline PPO completo desde el entrenamiento hasta la exportacion.
- Base para ajuste fino con PPO: partir de los pesos `.pt` para reentrenar con nuevas condiciones de friccion, terreno o morfologia del robot, aprovechando el normalizador de observaciones ya ajustado.
- Integracion en pipelines de validacion automatica: el formato ONNX permite ejecutar la politica en CI sin dependencia de PyTorch, comprobando que la exportacion produce acciones coherentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas de recompensa final, velocidad media alcanzada, tasa de caidas ni comparaciones con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; una red MLP de tres capas con anchos de 256, 256 y 128 ocupa del orden de unos pocos cientos de kilobytes en float32, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requiere GPU dedicada; cualquier GPU moderna (RTX 3060 o superior) sobra para inferencia. Para reentrenamiento con PPO en MuJoCo, se recomienda al menos una GPU consumer de gama media y CPU con buen rendimiento monohilo para la simulacion.
- Cabe en GPU consumer: si, en practicamente cualquier modelo; tambien en CPU y en hardware embebido compatible con ONNX Runtime.
- Opciones de despliegue: ONNX Runtime (recomendado por el autor para sim2real), PyTorch para carga de los `.pt`, y el simulador MuJoCo para el bucle fisico. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles de forma explicita; el diseno apunta a un bucle de control a 50 Hz (20 ms por paso), lo que exige que la inferencia ONNX se complete muy por debajo de ese margen.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros checkpoints de RL para robots bipedos comparables ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Especificidad de plataforma: la politica esta entrenada para la morfologia concreta del MicroDuck con calzado plano; no es transferible sin reentrenamiento a otros robots o a configuraciones con ruedas.
- Dependencia del simulador: el comportamiento esta calibrado para las condiciones de friccion y contacto de MuJoCo descritas; la brecha sim2real puede degradar la marcha en hardware real.
- Ausencia de metricas: no se publican curvas de recompensa, tasas de exito ni evaluaciones cuantitativas, lo que dificulta verificar la calidad real de la politica.
- Ambiguedad en el volumen de entrenamiento: la model card mezcla iteraciones (10.750), pasos de episodio (100k) y una cifra retorica de "mil millones de intentos", sin aclarar la metrica exacta.
- Licencia: la model card declara MIT, pero el campo de licencia del repositorio en Hugging Face figura como no disponible; conviene confirmar antes de uso comercial.
- Sin garantias de produccion: no hay documentacion sobre seguridad, parada de emergencia ni limites de par, aspectos criticos en robotica fisica.
- Sesgos y alucinacion: no aplican en el sentido de los modelos de lenguaje, pero si existe el riesgo de comportamientos no previstos fuera de la distribucion de observaciones de entrenamiento.
- Repositorio con cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/appssy3/connectailab-rl-solo-build-H-MicroDuck-100k
- Canal de YouTube del autor (material audiovisual citado en la model card): https://www.youtube.com/@solobuild.studio
