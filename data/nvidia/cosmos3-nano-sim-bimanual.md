# nvidia/Cosmos3-Nano-Sim-Bimanual

## Resumen

Cosmos3-Nano-Sim-Bimanual es un modelo de simulación de mundo (world model) desarrollado por NVIDIA dentro de la familia Cosmos3, orientado a la denominada "Physical AI". Se trata de un checkpoint post-entrenado y destilado de forma causal a partir del modelo base Cosmos3-Nano, especializado en simular cómo evoluciona un entorno en respuesta a las acciones de un robot bimanual. Dado un fotograma inicial y una secuencia de entradas de control (acciones de brazo y pinza, trayectorias de cámara y, opcionalmente, una descripción textual de la escena), el modelo genera vídeo a 480p y 30 fps en pequeños fragmentos de latentes condicionados por el historial cacheado.

La arquitectura es un transformer con un diseño Mixture-of-Transformers (MoT), con aproximadamente 16B parámetros entrenables (15.173.136.576 parámetros reales según los pesos en safetensors). Su rasgo diferencial es que permite intercalar navegación de cámara y manipulación robótica dentro de una misma secuencia de acciones, manteniendo la continuidad de la escena a través de cambios de punto de vista y de estado de los brazos, tanto en bucle abierto como cerrado.

Es relevante ahora porque habilita la evaluación y verificación de políticas robóticas, el entrenamiento por refuerzo y la generación de datos de demostración sintéticos sin teleoperación, siempre que las entradas de control provengan de un modelo de política como un VLA (vision-language-action) o un world-action model. El modelo se publica bajo licencia OpenMDW 1.1 y está pensado para uso comercial y no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Transformers (MoT) |
| Parametros totales | 15.173.136.576 (aprox. 16B entrenables) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrada de texto opcional para descripcion de escena, sin listado de idiomas) |
| Licencia | OpenMDW 1.1 (openmdw1.1-license) |
| Formato de pesos | safetensors (tamano del repo: 31,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de Cosmos3-Nano y se obtiene mediante post-entrenamiento sobre una mezcla de vídeos de manipulación robótica emparejados con acciones del robot y vídeos de navegación de cámara emparejados con trayectorias de cámara. Posteriormente se aplica una destilación causal que permite la generación por fragmentos de latentes de forma autorregresiva, condicionada por el historial cacheado y las entradas de control entrantes. La red sigue un esquema Mixture-of-Transformers, lo que sugiere módulos especializados (por ejemplo, para distintas modalidades o flujos de control) combinados dentro de un mismo transformer.

La innovación principal es la capacidad de intercalar manipulación y navegación en una única secuencia de acciones, manteniendo la coherencia de la escena entre movimientos del robot y cambios de punto de vista. El modelo admite además post-entrenamiento adicional con datos del usuario para adaptarlo a otras morfologías de robot y configuraciones de brazos. No se han proporcionado en la información disponible detalles sobre el número exacto de tokens de entrenamiento, la composición completa del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Simulación de mundo condicionada por acciones: genera vídeo que refleja la evolución del entorno ante acciones de un robot bimanual.
- Control multimodal de entrada: imagen inicial (JPG, PNG, JPEG, WebP), acciones del robot en JSON con forma `(T, D)`, trayectorias de cámara (representación de movimiento de 9 dimensiones) y texto opcional de descripción de escena.
- Intercalado de navegación de cámara y manipulación dentro de una misma secuencia de acciones.
- Operación en bucle abierto y en bucle cerrado, con entradas de control inyectables en cualquier punto del rollout.
- Generación de vídeo a 480p y 30 fps en MP4 o como flujo de fotogramas.
- Integración con modelos de política (VLA o world-action models) y con joystick operado por humanos.
- Adaptación a distintas morfologías mediante post-entrenamiento con datos propios.
- Soporte de embodiment AgiBot en la versión publicada.

## Casos de uso

- Evaluación y verificación de políticas robóticas: el modelo permite ejecutar una política VLA contra un entorno simulado y observar en vídeo si las acciones producen el comportamiento esperado, sin necesidad de desplegar hardware físico.
- Entrenamiento por refuerzo: al actuar como simulador condicionado por acciones, puede generar rollouts sintéticos para que un agente aprenda políticas de manipulación bimanual en bucle cerrado.
- Generación de datos de demostración sin teleoperación: si las entradas de control provienen de un modelo de política, se pueden producir demostraciones sintéticas etiquetadas con acciones para ampliar datasets de entrenamiento.
- Validación de trayectorias de cámara: el soporte de navegación de cámara intercalada permite comprobar cómo cambia la escena al mover el punto de vista, útil para planificación de percepción activa.
- Pruebas de robustez ante cambios de configuración: mediante post-entrenamiento con datos del usuario se puede adaptar el modelo a otras morfologías y evaluar políticas antes de transferirlas al robot real.
- Prototipado rápido de entornos de manipulación: con una sola imagen inicial y una secuencia de acciones se obtiene un vídeo de referencia para comunicar o depurar comportamientos esperados.
- Análisis de continuidad de escena: útil para estudiar cómo se degrada la coherencia visual en rollouts largos con cambios frecuentes de cámara y brazos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 15,17B parámetros en safetensors y un repo de 31,8 GB, la inferencia en precisión completa requiere al menos varias decenas de GB de VRAM, aunque no se detalla la cifra exacta.
- GPU recomendadas: el autor indica que los modelos están optimizados para ejecutarse en sistemas acelerados por GPU NVIDIA (CUDA); no se especifican modelos concretos.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: motor de ejecución PyTorch según la model card; el ecosistema incluye la librería `cosmos`, el repositorio `nvidia/cosmos` y el `cosmos-framework`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card aclara que los 30 fps describen el tiempo de reproducción del vídeo, no el rendimiento de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-Nano-Sim-Bimanual | ~16B (15,17B en safetensors) | no disponible | World model de vídeo para robot bimanual | OpenMDW 1.1 | Hugging Face (nvidia) |
| Cosmos3-Nano | no disponible | no disponible | Modelo base de la familia Cosmos3 | no disponible | Hugging Face (nvidia) |
| Otros modelos de simulacion de mundo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento comparativos con alternativas de la misma categoría.

## Limitaciones y advertencias

- El embodiment soportado de forma nativa es AgiBot; para otras morfologías se requiere post-entrenamiento adicional con datos del usuario.
- La salida es vídeo sintético: puede presentar artefactos visuales o inconsistencias físicas que no reflejen fielmente la dinámica real del robot.
- No se especifican sesgos conocidos ni limitaciones idiomáticas en la información disponible; el texto de entrada es opcional y no se lista el conjunto de idiomas soportados.
- No se detalla la longitud de contexto ni el horizonte máximo de rollout, lo que limita planificar la duración de las simulaciones.
- La licencia OpenMDW 1.1 permite uso comercial según la model card, pero conviene revisar sus términos completos antes de un despliegue en producción.
- El rendimiento de inferencia no está documentado; los 30 fps son de reproducción, no de generación.
- El modelo está optimizado para hardware NVIDIA con CUDA; su ejecución en otras plataformas no está garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/Cosmos3-Nano-Sim-Bimanual
- Colección Cosmos3: https://huggingface.co/collections/nvidia/cosmos3
- Ejemplos Cosmos3: https://huggingface.co/collections/nvidia/cosmos3-examples
- Código: https://github.com/nvidia/cosmos
- Informe técnico: https://research.nvidia.com/labs/cosmos-lab/cosmos-simulation/technical-report.pdf
- Sitio web: https://research.nvidia.com/labs/cosmos-lab/cosmos-simulation/
- Skill de Cosmos3-Nano-Sim-Bimanual: https://github.com/NVIDIA/cosmos-framework/tree/main/.agents/skills/cosmos3-nano-sim-bimanual
- Framework Cosmos: https://github.com/nvidia/cosmos-framework
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Modelo base Cosmos3-Nano: https://huggingface.co/nvidia/Cosmos3-Nano
