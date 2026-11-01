# mim-chess-vlas/train_800_complex__bbox__separate_channel__sim__all_cameras__live__groot__seed_0

## Resumen

`mim-chess-vlas/train_800_complex__bbox__separate_channel__sim__all_cameras__live__groot__seed_0` es una política robótica entrenada con LeRobot sobre la arquitectura GR00T N1.7 de NVIDIA, un modelo fundacional abierto y cross-embodiment para razonamiento y habilidades en robots humanoides. El modelo combina un backbone Cosmos-Reason2/Qwen3-VL (visión-lenguaje) con un transformer de acciones basado en flow matching, que predice acciones condicionadas por visión, lenguaje y propiocepción.

Se trata de un checkpoint específico (seed 0) afinado sobre el dataset `train_800_complex__bbox__separate_channel__sim__all_cameras__live`, compuesto por 790 episodios y 157.904 fotogramas a 20 FPS, con tareas de tipo "pick and place" sobre objetos geométricamente complejos en un entorno de robot Panda simulado. El repositorio ocupa 12,6 GB y contiene 3.144.016.000 parámetros en formato safetensors.

Su relevancia radica en que ejemplifica el flujo de trabajo actual de la robótica aprendida: partir de un modelo fundacional preentrenado y afinarlo con un dataset propio mediante LeRobot, manteniendo la licencia Apache 2.0 y la compatibilidad con el ecosistema de Hugging Face. Es, por tanto, un caso de referencia para investigadores que quieran reproducir pipelines de VLA (vision-language-action) en simulación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parámetros totales | 3.144.016.000 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de GR00T N1.7: un backbone de visión-lenguaje Cosmos-Reason2/Qwen3-VL que procesa las observaciones visuales y las instrucciones en lenguaje natural, acoplado a un transformer de acciones entrenado con flow matching que genera trayectorias de acción continuas. La política consume cuatro cámaras (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2` y `mask`), todas a resolución 3×224×224, más un vector de estado propioceptivo de dimensión 9, y produce una acción de dimensión 7 (típicamente posición y orientación del efector más pinza).

El entrenamiento se realizó mediante LeRobot sobre un dataset propio de 790 episodios y 157.904 fotogramas a 20 FPS, con tareas de recogida y colocación de objetos de geometría compleja (formas lobuladas, estrellas, conos, bloques con ranuras, etc.) en una caja. El nombre del dataset sugiere el uso de bounding boxes, canales separados para máscaras y múltiples cámaras en un entorno simulado. No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Predicción de acciones robóticas de 7 dimensiones a partir de observaciones multimodales (cuatro cámaras más estado propioceptivo).
- Ejecución de tareas de pick and place guiadas por instrucciones en lenguaje natural, con vocabulario descriptivo detallado sobre la geometría de los objetos.
- Razonamiento visión-lenguaje heredado del backbone Qwen3-VL, aplicado a la selección del objeto y la planificación de la trayectoria.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- Compatibilidad con el formato de modelo fundacional GR00T, lo que permite reutilizar el backbone para otras tareas robóticas.
- No se dispone de información sobre soporte de tool calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento extendido.

## Casos de uso

- Automatización de pick and place en simulación: la política puede seleccionar objetos de geometría compleja descritos en lenguaje natural y depositarlos en una caja, lo que permite validar algoritmos de manipulación antes de transferirlos a un robot físico.
- Generación de datos sintéticos para robótica: al ejecutarse en un entorno simulado con múltiples cámaras, puede producir trayectorias etiquetadas que alimenten el entrenamiento de otras políticas.
- Evaluación comparativa de arquitecturas VLA: al ser un checkpoint con seed fijo, sirve como referencia reproducible para medir el efecto de cambios en el dataset o en el backbone.
- Investigación en cross-embodiment: el modelo puede adaptarse a distintos robots (el dataset usa un Panda) reutilizando el backbone preentrenado de GR00T.
- Desarrollo de pipelines de LeRobot: el checkpoint documenta el flujo completo de entrenamiento y publicación en el Hub, útil como plantilla para nuevos proyectos.
- Pruebas de robustez ante variaciones geométricas: las descripciones detalladas de los objetos permiten estudiar cómo el modelo generaliza a formas nuevas.
- Docencia y demostraciones: al estar en licencia Apache 2.0 y en formato abierto, puede usarse en cursos de robótica aprendida sin restricciones comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3.144 millones de parámetros, en FP16 se requieren aproximadamente 6,3 GB solo para los pesos; en BF16 similar. En cuantización de 8 bits, alrededor de 3,2 GB; en 4 bits, unos 1,6 GB. A ello hay que sumar el coste del backbone de visión y de las activaciones, por lo que se recomienda un margen adicional de 2 a 4 GB.
- GPU recomendadas: para inferencia en FP16, una RTX 4090 (24 GB) o una A100 (40/80 GB) son adecuadas; para entrenamiento o evaluación con lotes grandes, se recomienda A100 80 GB o H100.
- Compatibilidad con GPU de consumo: sí, en principio cabe en GPUs de 12 GB o más si se aplica cuantización, aunque no se dispone de datos verificados de rendimiento en ese escenario.
- Opciones de despliegue: LeRobot (librería nativa del checkpoint), con posibilidad de exportación a otros runners; no se dispone de información sobre soporte específico de vLLM, llama.cpp, Ollama o TGI para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este checkpoint (GR00T N1.7 afinado) | 3.144 M | no disponible | Apache 2.0 | Hugging Face, LeRobot |
| GR00T N1.7 base (NVIDIA) | no disponible | no disponible | no disponible | GitHub NVIDIA/Isaac-GR00T |
| Políticas LeRobot genéricas (p. ej., ACT, Diffusion Policy) | del orden de decenas de millones | no aplica | Apache 2.0 | Hugging Face, LeRobot |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en simulación con un robot Panda; su transferencia a robots físicos o a otras morfologías no está validada.
- Las tareas se limitan a pick and place sobre un conjunto acotado de objetos; no se dispone de evidencia de generalización a objetos o escenarios fuera de la distribución del dataset.
- Riesgo de alucinación en la interpretación de instrucciones en lenguaje natural, especialmente con descripciones geométricas ambiguas.
- No se dispone de información sobre sesgos, limitaciones idiomáticas ni comportamiento en idiomas distintos del inglés (las tareas del dataset están en inglés).
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de componentes (backbone Qwen3-VL y arquitectura GR00T) cuyas licencias y condiciones deben verificarse por separado.
- El checkpoint tiene solo 21 descargas y 0 likes, lo que sugiere que no ha sido ampliamente validado por la comunidad.
- No se dispone de información sobre latencia, throughput ni estabilidad en producción.

## Enlaces

- Hugging Face: https://huggingface.co/mim-chess-vlas/train_800_complex__bbox__separate_channel__sim__all_cameras__live__groot__seed_0
- Dataset de entrenamiento: https://huggingface.co/datasets/mim-chess-vlas/train_800_complex__bbox__separate_channel__sim__all_cameras__live
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- LeRobot: https://github.com/huggingface/lerobot
- Guía de LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
