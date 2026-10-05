# raihan-js/demodoctor-act-random175-s1

## Resumen

`raihan-js/demodoctor-act-random175-s1` es una política robótica de imitación entrenada con el método Action Chunking with Transformers (ACT), publicado por Zhao et al. en 2023 (arXiv:2304.13705) e integrado en la librería LeRobot de Hugging Face. No es un modelo de lenguaje: consume observaciones visuales y de estado de un robot y produce comandos de acción de bajo nivel. El autor, raihan-js, lo ha publicado como parte de su proyecto DemoDoctor, orientado a medir el impacto de la calidad de los datos de demostración en el éxito de las políticas.

El modelo tiene 51.660.418 parámetros (unos 0,2 GB en el repositorio) y está entrenado sobre el dataset `raihan-js/demodoctor-pusht-random175`, compuesto por 175 episodios y 21.189 fotogramas a 10 FPS para una única tarea: empujar un bloque con forma de T hasta una diana con forma de T. La entrada es una imagen RGB de 96x96 píxeles más un vector de estado de dos dimensiones; la salida es un vector de acción también de dos dimensiones.

Su relevancia es acotada y muy específica: sirve como artefacto reproducible dentro de una línea de investigación sobre curación de datos robóticos, y como ejemplo canónico de entrenamiento con LeRobot 0.6.1 (60.000 pasos, batch 32, AdamW, learning rate 1e-5, semilla 1). No se han publicado resultados de evaluación en el repositorio ni métricas de éxito en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers); transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.660.418 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no aplica (politica robotica; no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Especificaciones de entrada y salida:

| Feature | Tipo | Forma |
|---|---|---|
| `observation.image` | VISUAL | (3, 96, 96) |
| `observation.state` | STATE | (2,) |
| `action` | ACTION | (2,) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice fragmentos de acción (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y suaviza la política resultante. La arquitectura combina un codificador visual (habitualmente una ResNet preentrenada en ImageNet en la implementación de referencia) con un transformer codificador-decodificador que atiende conjuntamente a las características de imagen, al estado del robot y a las acciones previas dentro del fragmento. El modelo aprende únicamente de demostraciones teleoperadas, sin recompensa explícita ni RLHF/DPO.

El entrenamiento se realizó con LeRobot 0.6.1 durante 60.000 pasos, con batch de 32, optimizador AdamW, learning rate de 1e-5 y semilla 1. El dataset de origen contiene 175 episodios y 21.189 fotogramas a 10 FPS, grabados para la tarea "Push the T-shaped block onto the T-shaped target". No se documenta en la model card el número de tokens, la composición exacta del dataset ni el tamaño del fragmento de acción (chunk size) configurado, por lo que esos datos quedan como no disponibles.

## Capacidades

- Control robótico por imitación: genera vectores de acción de dos dimensiones a partir de una imagen de 96x96 y un estado de dos dimensiones.
- Ejecución de una única tarea especializada: empujar un bloque en forma de T hasta una diana en forma de T.
- Predicción de fragmentos de acción, lo que permite ejecutar secuencias cortas de movimiento sin recalcular la política en cada fotograma.
- Funcionamiento a 10 FPS, la frecuencia a la que se grabó el dataset de entrenamiento.
- Integración con el ecosistema LeRobot: se ejecuta mediante el comando `lerobot-rollout` con `--policy.path=raihan-js/demodoctor-act-random175-s1`.
- Tool calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica.
- Capacidades especiales (visión, audio, thinking mode): únicamente percepción visual de baja resolución (96x96) como entrada.

## Casos de uso

- Reproducción de experiments de calidad de datos: el modelo forma parte del proyecto DemoDoctor, cuyo objetivo es medir el éxito de una política entrenada con datos limpios frente a datos corrompidos y datos autocurados. Esta política concreta sirve como condición base (175 episodios, semilla 1) para comparar.
- Docencia y tutoriales de LeRobot: al ser un checkpoint pequeño (0,2 GB) y con licencia permisiva, es adecuado para que nuevos usuarios recorran el flujo completo de `lerobot-train` y `lerobot-rollout` sin necesidad de hardware potente.
- Pruebas de integración de pipeline robótico: permite validar la conexión entre cámaras OpenCV, el bucle de control del robot y el servidor de políticas antes de invertir en entrenamientos largos.
- Benchmarking de infraestructura de inferencia: con 51,7 M de parámetros, sirve para medir latencia y throughput de un stack de despliegue concreto (GPU frente a CPU) en un modelo de visión y control realista.
- Punto de partida para fine-tuning en tareas de manipulación similares: la tarea de empujar un objeto hasta una diana es un dominio común en simulación y en robots de bajo coste, por lo que el checkpoint puede reentrenarse con datos propios.
- Investigación en imitación con action chunking: útil para estudiar el efecto del tamaño del fragmento de acción y del horizonte de predicción en la estabilidad del control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la sección de evaluación vacía, con la indicación explícita de que no se han proporcionado resultados para esta política, ni en simulación ni en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia aritmética, 51,66 M de parámetros ocupan aproximadamente 207 MB en fp32 y unos 103 MB en fp16, a lo que hay que sumar activaciones del codificador visual y del transformer. Cabe en cualquier GPU con 4 GB o más.
- GPU recomendadas: no hay recomendación del autor. Por tamaño, cualquier GPU moderna es suficiente, incluidas tarjetas de gama de entrada; no se requiere A100 ni H100.
- GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo reciente (por ejemplo, serie RTX 30 o 40) e incluso es viable ejecutarla en CPU para pruebas.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` con `--strategy.type=base`. La librería se apoya en PyTorch. No se documentan exportaciones a ONNX, TensorRT ni integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| raihan-js/demodoctor-act-random175-s1 | 51.660.418 | no disponible | Push T, 1 tarea | apache-2.0 | Hugging Face, 0 descargas |
| Otras politicas ACT entrenadas con LeRobot | no disponible | no disponible | Segun dataset | habitualmente apache-2.0 | Hugging Face |
| Diffusion Policy (Chi et al., 2023) | no disponible | no disponible | Manipulacion general | no disponible | Implementaciones publicas |

No se dispone de datos verificados de rendimiento de estas alternativas en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y disponibilidad. No se han publicado metricas comparativas entre esta politica y otras alternativas para la tarea Push T.

## Limitaciones y advertencias

- Especializacion extrema: la política solo ha sido entrenada para la tarea "Push the T-shaped block onto the T-shaped target". No generaliza a otras tareas, objetos o morfologias de robot sin reentrenamiento.
- Sin evaluación publicada: no existen datos de tasa de éxito, ni en simulación ni en robot real. No se puede afirmar que la política funcione correctamente en producción.
- Dependencia del hardware de captura: la política espera una imagen de 96x96 y un vector de estado de dos dimensiones. Cualquier diferencia en la cámara, la calibración o el robot respecto al entorno de recogida de datos degradará el comportamiento.
- Sensibilidad a la calidad de los datos: el proyecto DemoDoctor del propio autor estudia precisamente cómo las demostraciones defectuosas afectan al éxito de la política; el dataset de origen no ha sido auditado en la model card.
- Sesgos conocidos: no documentados. En robótica por imitación, los sesgos del operador humano que teleoperó las demostraciones (posiciones, iluminación, ángulos de cámara) se transfieren a la política.
- Riesgo de alucinacion: no aplica en el sentido de generación de texto; el riesgo equivalente es la generación de acciones incorrectas o inestables ante observaciones fuera de distribución.
- Restricciones de licencia: apache-2.0 permite uso comercial, modificación y redistribucion, siempre que se conserve el aviso de licencia y se cite adecuadamente. Debe citarse tambien el metodo ACT y LeRobot.
- Caveat de produccion: el modelo tiene 0 descargas y 0 likes, y el repositorio se creo y actualizo el mismo dia. No hay evidencia de uso independiente ni de validacion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/raihan-js/demodoctor-act-random175-s1
- Dataset de entrenamiento: https://huggingface.co/datasets/raihan-js/demodoctor-pusht-random175
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=raihan-js/demodoctor-pusht-random175
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de inferencia de LeRobot: https://huggingface.co/docs/lerobot/main/en/inference
- Proyecto DemoDoctor: https://github.com/raihan-js/demodoctor
- Perfil del autor en GitHub: https://github.com/raihan-js/
- Sitio web del autor: https://raihan-js.github.io/
