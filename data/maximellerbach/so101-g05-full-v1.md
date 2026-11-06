# maximellerbach/so101-g05-full-v1

## Resumen

SO101-g05-full-v1 es un checkpoint de política robótica (vision-language-action, VLA) publicado por el usuario maximellerbach en Hugging Face, entrenado con la librería LeRobot sobre el modelo base G0.5 de Galaxea. El modelo consume observaciones multimodales (estado articular de 6 dimensiones y tres cámaras de 256x256 píxeles) y produce acciones de 6 dimensiones para un robot seguidor SO-101. Está pensado para ejecutar tareas de manipulación guiadas por instrucciones en lenguaje natural.

El checkpoint deriva del modelo G0.5 de Galaxea, que genera texto de cadena de pensamiento y acciones robóticas en un único flujo autorregresivo sobre una columna vertebral Qwen3.5. Con 2.859.995.988 parámetros y un tamaño de repositorio de 18,5 GB, es un modelo de gran tamaño para el estándar de políticas robóticas, lo que condiciona fuertemente sus requisitos de hardware.

Su relevancia es doble: por un lado, demuestra la integración de modelos VLA de gran escala en el ecosistema LeRobot; por otro, su licencia no comercial (G0.5 Community License Agreement) restringe su uso en producción comercial, un aspecto crítico para cualquier evaluación. La información pública disponible sobre benchmarks y detalles de entrenamiento es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) autorregresiva sobre columna vertebral Qwen3.5 (G0.5 de Galaxea) |
| Parametros totales | 2.859.995.988 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones del dataset están en inglés) |
| Licencia | other (G0.5 Community License Agreement, solo uso no comercial) |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

El modelo es una política VLA derivada de G0.5, que combina una columna vertebral de lenguaje Qwen3.5 con codificación visual y una cabeza de acciones, generando en un mismo flujo autorregresivo tanto texto de razonamiento (chain-of-thought) como las acciones del robot. La entrada incluye el estado articular (`observation.state`, shape `(6,)`) y tres imágenes de 256x256: `front`, `wrist` y una tercera cámara etiquetada como `empty_1`. La salida es un vector de acción de 6 dimensiones.

El entrenamiento se realizó con LeRobot sobre el dataset `maximellerbach/so101-fineart-mixed-v1`, compuesto por 4000 episodios y 1.747.257 fotogramas a 30 FPS. Las tareas cubren manipulación de objetos cotidianos (bloques, frutas, latas, cubiertos) con instrucciones en inglés, incluyendo tareas compuestas de varios pasos y clasificación por color. No se dispone de información sobre el número total de tokens, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO en el ajuste. Tampoco se detalla si se emplearon innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de acciones robóticas de 6 dimensiones para un robot seguidor SO-101 a partir de observaciones visuales y de estado articular.
- Comprensión de instrucciones en lenguaje natural en inglés para guiar la manipulación (por ejemplo, "Put the purple block in the green tray").
- Razonamiento multi-paso: el modelo base G0.5 genera cadena de pensamiento textual junto con las acciones, lo que permite abordar tareas compuestas ("first... then...").
- Percepción visual mediante tres cámaras (frontal, muñeca y una tercera vista).
- Manipulación de objetos diversos: bloques, frutas, latas, cubiertos, figuras, etc.
- Tareas de clasificación y ordenación por color o categoría.
- No se dispone de información sobre soporte de tool calling, function calling, agentes genéricos ni capacidades multilingües más allá del inglés presente en el dataset.

## Casos de uso

- Manipulación pick-and-place en laboratorio: el modelo puede recoger un objeto y depositarlo en un contenedor indicado por instrucción, usando las tres vistas para localizar el objeto y planificar la trayectoria.
- Tareas compuestas de varios pasos: instrucciones como "put the red block next to the pencil case, then put the white cylinder in the black box" se abordan gracias a la generación de cadena de pensamiento del modelo base.
- Clasificación y ordenación de objetos: el modelo puede separar objetos por color o categoría en contenedores distintos, útil en entornos de investigación sobre manipulación estructurada.
- Recogida y elevación de objetos: instrucciones simples como "Pick the green cylinder up" o "Raise the lemon off the table" permiten evaluar la precisión de agarre del robot SO-101.
- Investigación en VLA: sirve como punto de partida para fine-tuning sobre nuevos datasets de manipulación con LeRobot, especialmente en entornos académicos donde la licencia no comercial es aceptable.
- Evaluación de políticas robóticas en simulación o banco de pruebas: el checkpoint permite reproducir experimentos de manipulación con instrucciones en lenguaje natural y comparar con otras políticas del ecosistema LeRobot.
- Demostraciones educativas: útil para ilustrar el funcionamiento de modelos VLA de gran escala en robótica de bajo coste con el brazo SO-101.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2.859.995.988 parámetros, en FP16 se requieren aproximadamente 5,7 GB solo para los pesos; en FP32, unos 11,4 GB. A ello hay que sumar el coste de las activaciones y del codificador visual, por lo que se recomienda al menos 16-24 GB de VRAM en FP16.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, RTX 4090 (24 GB) para FP16. En GPUs consumer de gama media (16 GB) podría ser necesario cuantizar, aunque no se dispone de información sobre cuantizaciones soportadas.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB) en FP16; en GPUs de 16 GB probablemente requiera cuantización, no documentada.
- Opciones de despliegue: LeRobot (librería oficial de entrenamiento e inferencia). No se dispone de información sobre soporte en vLLM, llama.cpp, Ollama o TGI, dado que es una política robótica y no un LLM de texto convencional.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SO101-g05-full-v1 | 2.859.995.988 | no disponible | G0.5 Community License (no comercial) | Hugging Face (maximellerbach) |
| G0.5 (OpenGalaxea) | no disponible | no disponible | G0.5 Community License (no comercial) | Hugging Face (OpenGalaxea) |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | típicamente < 100 M | no aplica | Apache-2.0 o MIT | Hugging Face / LeRobot |

La comparación con políticas clásicas de LeRobot como ACT o Diffusion Policy es relevante por el salto de escala: SO101-g05-full-v1 es dos órdenes de magnitud mayor, lo que implica mayores requisitos de hardware pero potencialmente mayor capacidad de generalización y razonamiento. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Licencia no comercial: el checkpoint está bajo la G0.5 Community License Agreement, que prohíbe el uso comercial. Cualquier redistribución debe incluir los archivos `LICENSE` y `NOTICE` del checkpoint G0.5 original.
- No está respaldado por Galaxea; es un trabajo derivado de un tercero.
- Riesgo de alucinación: al ser un modelo autorregresivo que genera texto de razonamiento, puede producir planes incoherentes con el estado real del robot, especialmente fuera de la distribución del dataset.
- Dominio limitado: entrenado exclusivamente sobre el dataset `so101-fineart-mixed-v1` con objetos y tareas concretas; la generalización a nuevos objetos, entornos o instrucciones no está garantizada.
- Idioma: las instrucciones del dataset están en inglés; no se dispone de información sobre soporte multilingüe.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento ni comparaciones con alternativas.
- Hardware específico: diseñado para el robot SO-101 con tres cámaras concretas; no es directamente reutilizable en otras plataformas sin reentrenamiento.
- Sin información sobre sesgos, latencia o robustez en producción.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/maximellerbach/so101-g05-full-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/maximellerbach/so101-fineart-mixed-v1
- Modelo base G0.5: https://huggingface.co/OpenGalaxea/G05
- Licencia G0.5: https://huggingface.co/OpenGalaxea/G05/blob/main/licenses/LICENSE-G0.5
- Guía LeRobot para G0.5: https://huggingface.co/docs/lerobot/main/en/g05
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
