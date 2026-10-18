# sahilkulriaboss/groot_386

## Resumen

`groot_386` es una política visomotora para robótica manipulativa publicada en Hugging Face por el usuario `sahilkulriaboss` y entrenada con LeRobot. No es un modelo de lenguaje: es un fine-tuning de la familia NVIDIA GR00T (la model card referencia GR00T N1.7), un modelo fundacional cross-embodiment para razonamiento y habilidades de robots humanoides que combina un backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching, condicionado por visión, lenguaje y propiocepción. El checkpoint pesa 3.144.016.000 parámetros (3,14 mil millones) según los safetensors del repositorio.

El modelo resuelve una tarea muy acotada dentro de un laboratorio concreto: un brazo `so_follower` con dos cámaras (una de espacio de trabajo y otra en la muñeca) debe coger cuatro productos distintos (un rollo de venda, un paquete de chicles Doublemint verde, una barra de chocolate Snickers marrón y una barra proteica Yogabar rosa) y depositarlos en una bolsa marrón. Se entrenó con 386 episodios y 168.968 fotogramas a 30 FPS del dataset `sahilkulriaboss/ours_386`, con 5.000 pasos de entrenamiento, batch de 8, AdamW y learning rate de 1e-4.

Su relevancia es doble: por un lado demuestra el flujo completo de LeRobot 0.6.0 para ajustar un modelo fundacional de robótica con datos propios de teleoperación; por otro, sirve como referencia práctica de cuánto dato hace falta (386 episodios) para adaptar un GR00T a un conjunto cerrado de objetos. La licencia Apache 2.0 facilita su reutilización, aunque al ser una política específica de tarea su generalización fuera del montaje original es previsiblemente baja.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 (3,14 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica como contexto de texto; la ventana la define el historial de observaciones de la política) |
| Tipos de cuantizacion | no disponible; solo se publican pesos en safetensors (sin versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (las instrucciones de tarea del dataset están en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio LeRobot); tamaño del repo: 255,4 GB |
| Tipo de robot | `so_follower` (SO-100/SO-101 de LeRobot) |
| Cámaras de entrada | `workspace_cam` y `wrist_cam`, 3×480×640 cada una |
| Entrada de estado | `observation.state`, shape (6,) |
| Salida | `action`, shape (6,) |
| Frecuencia de datos | 30 FPS |
| Episodios de entrenamiento | 386 (168.968 fotogramas) |
| Pasos de entrenamiento | 5.000 (batch 8, AdamW, lr 1e-4, seed 42) |
| Versión de LeRobot | 0.6.0 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de GR00T N1.7: un backbone visión-lenguaje (Cosmos-Reason2/Qwen3-VL) que interpreta las dos imágenes de cámara junto con la instrucción de tarea en lenguaje natural, y un transformer de acciones entrenado con flow matching que genera las acciones de 6 dimensiones condicionadas por esa representación multimodal más el estado proprioceptivo del robot. Este esquema de dos torres permite reutilizar un VLM preentrenado a gran escala y aprender la política motora con relativamente pocos datos de dominio, que es exactamente el caso de este checkpoint. El autor no documenta si se congelaron capas del backbone, si se aplicó destilación o si hubo fases de preentrenamiento intermedias.

El entrenamiento se hizo con LeRobot 0.6.0 sobre el dataset propio `sahilkulriaboss/ours_386`: 386 episodios de teleoperación, 168.968 fotogramas a 30 FPS, repartidos en cuatro tareas de recogida y depósito ("pick bandage roll and put it in brown bag", "pick green doublemint...", "pick brown snickers chocolate bar...", "pick pink yogabar protein bar..."). La configuración publicada es de 5.000 pasos con batch 8, optimizador AdamW y learning rate 1e-4. No se documentan aumentos de datos, composición exacta del dataset por tarea, ni si se aplicó RLHF/DPO (no aplicable en el sentido habitual de alineamiento de LLM; aquí se trata de imitation learning supervisado sobre acciones). Tampoco se especifica la innovación técnica adicional más allá de la propia receta GR00T.

## Capacidades

- Manipulación visomotora pick-and-place sobre cuatro SKUs concretos (venda, Doublemint, Snickers, Yogabar) depositados en una bolsa marrón.
- Control de un brazo `so_follower` de 6 grados de libertad a partir de acciones de 6 dimensiones.
- Fusión de dos vistas de cámara (espacio de trabajo y muñeca) a 480×640 píxeles y 30 FPS.
- Condicionamiento por instrucción en lenguaje natural: la tarea se pasa como cadena de texto al ejecutar la política, lo que permite seleccionar entre los cuatro comportamientos aprendidos.
- Integración con el ecosistema LeRobot: ejecución con `lerobot-rollout` y reentrenamiento con `lerobot-train`.
- Capacidad de servir como punto de partida para fine-tuning en nuevos objetos o montajes, dado que la receta y los hiperparámetros están publicados.
- No soporta tool calling, function calling, razonamiento multi-paso genérico, ni modalidades de audio o visión general fuera del pipeline robótico.

## Casos de uso

- Clasificación y empaquetado de productos en una línea de retail o farmacia: el modelo coge un producto de la mesa y lo introduce en una bolsa, replicando las cuatro categorías del dataset, con la instrucción de tarea como selector de comportamiento.
- Banco de pruebas de la pila GR00T + LeRobot: sirve para validar la instalación, el cableado de cámaras y el pipeline `lerobot-rollout` antes de invertir en datasets propios, ya que incluye un comando de ejecución reproducible.
- Base para fine-tuning con pocos datos: equipos que quieran adaptar un modelo fundacional de robótica a su brazo SO-100 pueden partir de estos pesos y sustituir el dataset por 200-400 episodios propios, siguiendo la configuración publicada (5.000 pasos, batch 8, lr 1e-4).
- Prototipado de investigación en imitation learning: permite comparar curvas de éxito con y sin preentrenamiento GR00T sobre una tarea de manipulación sencilla y medible.
- Demostraciones y material docente: la política es un ejemplo autocontenido de extremo a extremo (teleoperación, dataset, entrenamiento, despliegue) útil en cursos de robótica de aprendizaje.
- Automatización de tareas repetitivas de laboratorio con objetos pequeños y ligeros (venda, barritas, chicles) en un espacio de trabajo delimitado y con iluminación controlada.
- Recolección de datos asistida: usar la política como política base y corregir sus fallos por teleoperación para generar nuevos episodios de entrenamiento (DAgger manual).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la sección de evaluación vacía y una nota explícita: "No evaluation results have been provided for this policy yet". No hay tasas de éxito por tarea, ni número de ensayos, ni comparaciones con otras políticas sobre el mismo dataset. Tampoco se publican métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 6,3 GB (3.144.016.000 × 2 bytes); en fp32, unos 12,6 GB. Sumando el backbone VLM, el transformer de acciones, dos flujos de vídeo de 480×640 y el búfer de activaciones, una estimación razonable es de 10 a 16 GB de VRAM en bf16. Es una estimación por conteo de parámetros, no un dato publicado por el autor.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluación a gran escala; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia y fine-tuning con batch pequeño; RTX 4080 / 4070 Ti Super (16 GB) como mínimo ajustado para inferencia.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier tarjeta con 16 GB o más en bf16; en 12 GB requeriría reducir resolución de entrada u optimizaciones de memoria no publicadas.
- El tamaño del repositorio (255,4 GB) es muy superior al de los pesos, lo que sugiere checkpoints intermedios y estados del optimizador; para inferencia no es necesario descargar el repo completo, pero conviene revisar qué ficheros se solicitan.
- Opciones de despliegue: `lerobot-rollout` con `--policy.path=sahilkulriaboss/groot_386`, sobre PyTorch y CUDA. vLLM, llama.cpp, Ollama y TGI no son aplicables: no es un modelo de texto con decodificación autorregresiva, sino una política visomotora.
- Latencia y throughput: no disponibles. El dataset y el control están a 30 FPS, lo que fija un objetivo de 33 ms por paso de control, pero no se documenta si la política lo alcanza en hardware concreto.
- Conexión física: se requiere un brazo `so_follower` calibrado, dos cámaras OpenCV a 640×480 y 30 FPS, y que los nombres de cámara coincidan con `workspace_cam` y `wrist_cam`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| groot_386 (este) | 3,14 B | 2 imágenes 3×480×640 + estado (6,) | 4 tareas pick-and-place sobre `so_follower` | apache-2.0 | Hugging Face + LeRobot |
| NVIDIA GR00T N1.7 (base) | no disponible en la informacion proporcionada | vision + lenguaje + propiocepcion | modelo fundacional cross-embodiment, sin fine-tuning | no disponible en la informacion proporcionada | repositorio NVIDIA/Isaac-GR00T |
| π0 (Physical Intelligence) | ~3,3 B (dato público aproximado, no verificado) | imágenes + texto | flow matching para control de robots | no disponible en la informacion proporcionada | openpi (pesos abiertos) |
| OpenVLA | 7 B (dato público aproximado, no verificado) | imagen + instrucción | VLA generalista de manipulación | no disponible en la informacion proporcionada | Hugging Face |

La comparación directa es difícil: `groot_386` es un fine-tuning de nicho con 386 episodios, mientras que los otros son modelos base entrenados sobre mezclas multi-robot de gran escala. La ventaja de este checkpoint es la reproducibilidad del pipeline y su licencia Apache 2.0; la desventaja, su especificidad y la ausencia total de métricas publicadas.

## Limitaciones y advertencias

- Especificidad extrema: solo se ha entrenado con cuatro objetos y una única instrucción de destino (bolsa marrón); no hay evidencia de generalización a otros objetos, contenedores o posiciones.
- Sin evaluación publicada: no existe ninguna tasa de éxito medida, por lo que no se puede afirmar que la política funcione de forma fiable ni en el montaje original.
- Un solo embodiment: entrenado exclusivamente para `so_follower` con dos cámaras en posiciones concretas; cambiar la cámara, su resolución o el robot invalida los resultados.
- Sensibilidad a la distribución: iluminación, fondo, posición inicial de los objetos y del brazo afectan a la política; no se documentan aumentos de datos ni robustez frente a distractores.
- Riesgo de alucinación en el sentido de acciones incorrectas: al ser una política de flow matching, puede generar trayectorias plausibles pero erróneas (colisiones, agarres fallidos) sin señal de incertidumbre ni mecanismo de parada seguro.
- Sin cuantizaciones publicadas: no hay GGUF ni formatos de baja precisión, lo que limita el despliegue en hardware de borde.
- Idiomas: la instrucción de tarea se pasó en inglés; no hay datos sobre comportamiento con instrucciones en castellano.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero el autor no ofrece garantías; conviene verificar también las condiciones del modelo base GR00T y del backbone Qwen3-VL/Cosmos-Reason2 antes de explotación comercial.
- Repositorio de 255,4 GB: el almacenamiento y la descarga son costosos; hay que revisar qué ficheros contiene antes de clonar.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, y ausencia de demo o vídeo, lo que reduce la evidencia empírica disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sahilkulriaboss/groot_386
- Dataset de entrenamiento: https://huggingface.co/datasets/sahilkulriaboss/ours_386
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sahilkulriaboss/ours_386
- Repositorio NVIDIA Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de GR00T en LeRobot: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Imagen de arquitectura GR00T citada en la model card: https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/lerobot/lerobot-groot-paper1%20(1).png
