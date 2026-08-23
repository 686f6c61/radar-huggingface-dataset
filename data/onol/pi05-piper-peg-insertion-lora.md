# Onol/pi05-piper-peg-insertion-lora

## Resumen

Este modelo es un adaptador LoRA del modelo base π0.5 de Physical Intelligence, desarrollado por Onol, especializado en una tarea concreta de inserción de clavija (peg insertion) en robótica. El modelo resuelve un problema de manipulación bimanual precisa: coger una clavija gris e insertarla en el agujero de un bloque naranja, siguiendo un prompt de lenguaje fijo. Su relevancia radica en demostrar que es posible adaptar un VLA (Vision-Language-Action) de gran escala a una tarea específica con solo 40 episodios de datos (42 614 frames), usando fine-tuning eficiente con LoRA.

La arquitectura se basa en π0.5, un modelo VLA con generalización open-world entrenado con *knowledge insulation* y pre-entrenado en más de 10 000 horas de datos robóticos. El adaptador LoRA tiene un tamaño de repo de 28,6 GB y se ha entrenado durante 12 000 pasos con una configuración de entrada multi-cámara (top, muñeca izquierda y derecha) a resolución 224×224, y un espacio de acción de 14 dimensiones (6 joints por brazo + 2 grippers). La licencia es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π0.5 con adaptadores LoRA |
| Parámetros totales | no disponible (el repo del adaptador es de 28,6 GB; los parámetros del modelo base π0.5 no se especifican) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo no usa contexto textual largo; el prompt es fijo y la entrada es visual) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el prompt está en inglés; no se especifican otros idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (típico de los checkpoints de OpenPI/JAX, aunque no se indica explícitamente) |

## Arquitectura y entrenamiento

El modelo base π0.5 es un VLA que combina visión, lenguaje y acción, desarrollado por Physical Intelligence dentro del repositorio OpenPI. Se distingue de su predecesor π0 por una mejor generalización open-world, lograda mediante una técnica de *knowledge insulation* que preserva el conocimiento pre-entrenado del modelo de lenguaje y visión mientras se entrena en datos robóticos. El adaptador LoRA se ha entrenado sobre el dataset `peg_insertion_40_dual14d_pi05_rgb224_v21`, que contiene 40 episodios con un total de 42 614 frames. El prompt de lenguaje es fijo: `"pick up the gray peg and insert it into the hole in the orange block"`.

La política recibe entrada RGB de tres cámaras (top, muñeca izquierda y derecha), cada una redimensionada a 224×224 con letterboxing. El espacio de acción es de 14 dimensiones: `[L_j1..j6, L_gripper_m, R_j1..j6, R_gripper_m]`, donde los 12 targets de articulación se entrenan como deltas relativos al estado actual (state-relative), mientras que los dos grippers se mantienen en valores absolutos en metros, con un clipping a `[0, 0.08]` en la frontera de la política. El horizonte de acción es de 30 pasos. La configuración de OpenPI es `pi05_piper_peg_insertion_lora`.

## Capacidades

- Manipulación robótica bimanual de precisión, específicamente inserción de clavada en bloque con tolerancia mecánica.
- Control de 14 grados de libertad (6 joints por brazo + 2 grippers) con coordinación simultánea de ambos brazos.
- Percepción visual multi-cámara (3 cámaras RGB) con entrada de 224×224, permitiendo la integración de información espacial desde diferentes puntos de vista.
- Generación de acciones de control con horizonte de 30 pasos, adecuado para tareas de ensamblaje que requieren secuencias largas.
- Fine-tuning eficiente mediante LoRA sobre un modelo VLA base pre-entrenado, sin modificar los pesos del modelo original.
- Generalización open-world heredada del modelo base π0.5, que permite adaptarse a variaciones del entorno no vistas durante el entrenamiento del adaptador.
- Prompt de lenguaje fijo en inglés para la tarea de inserción; no se ha documentado soporte de *tool calling* ni de agentes.

## Casos de uso

- Ensamblaje industrial automatizado: el modelo puede integrarse en una célula de trabajo para insertar componentes mecánicos (clavijas) en bloques, reduciendo el tiempo de ciclo y la variabilidad en tareas repetitivas de precisión.
- Robótica de laboratorio para investigación en VLA: sirve como referencia de fine-tuning con pocos datos (40 episodios) para evaluar la transferencia de un modelo base grande a una tarea concreta.
- Control bimanual de robots con dual-manipulador: su espacio de acción de 14 dimensiones lo hace adecuado para brazos duales en entornos de investigación como plataformas de manipulación colaborativa.
- Automatización de control de calidad en manufactura: se puede adaptar para tareas de insertar conectores, pines o componentes en ensamblajes electrónicos o mecánicos.
- Evaluación de políticas de robot en simulación: el adaptador puede integrarse en entornos de simulación (por ejemplo, MuJoCo) para probar la robustez de la política antes del despliegue físico.
- Benchmark de generalización open-world: al heredar el modelo base π0.5, se puede usar para comparar la capacidad de generalización a nuevas poses, colores o iluminación en la tarea de inserción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La validación del modelo, según el autor, solo comprueba la integridad de la carga del checkpoint y del pipeline de inferencia; no es una evaluación de éxito real en robot. Por tanto, no hay datos numéricos de tasa de éxito, ni comparaciones con otros modelos en esta tarea.

## Requisitos de hardware

- El tamaño del repositorio es de 28,6 GB (solo el adaptador LoRA), lo que sugiere que la inferencia requiere una GPU con al menos 40 GB de VRAM si se carga el modelo base π0.5 completo más el adaptador. No se especifica la VRAM exacta.
- GPU recomendadas: se necesitan GPUs de alta gama como A100 (80 GB) o H100 (80 GB) para inferencia con el modelo base completo. En GPUs de consumo (RTX 4090 con 24 GB) podría no caber el modelo completo sin cuantización, pero no se han documentado cuantizaciones.
- Opciones de despliegue: el modelo está diseñado para la librería OpenPI, que usa JAX. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que es un modelo robótico de control, no un LLM de generación de texto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No hay modelos directamente comparables en la información disponible, ya que se trata de un adaptador LoRA específico para una tarea robótica. Se puede comparar con el modelo base:

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Onol/pi05-piper-peg-insertion-lora (este) | 28,6 GB (LoRA) | No disponible | Inserción de clavada | Apache 2.0 | Hugging Face |
| physical-intelligence/pi0.5 (base) | No disponible | No disponible | VLA open-world | Apache 2.0 | Hugging Face / OpenPI |
| Onol/pi05-piper-pick-bowl-into-bag-lora | No disponible | No disponible | Recoger cuenco en bolsa | Apache 2.0 | Hugging Face |

El modelo base π0.5 es más generalista y de mayor tamaño, mientras que los adaptadores LoRA de Onol son especializaciones con pocos datos. No hay datos de rendimiento comparativo disponibles.

## Limitaciones y advertencias

- Sesgos conocidos: los datos de entrenamiento son solo 40 episodios de una sola tarea (inserción de clavada), lo que limita la generalización a otras tareas o variaciones de la misma sin re-entrenamiento.
- Riesgo de alucinación: como es un modelo de control, no genera texto, pero puede producir acciones no válidas o inestables si se usa fuera de la distribución de datos (por ejemplo, con objetos de color o forma distinta).
- Limitaciones de contexto e idioma: el prompt es fijo en inglés; no se ha documentado soporte para otros idiomas ni para prompts variables.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero hay que verificar el modelo base π0.5, que también es Apache 2.0 según la información disponible.
- Caveat importante para producción: la validación del modelo no es una evaluación real en robot, solo de integridad del pipeline. Antes de usarlo en producción, se necesita una evaluación física con el robot real para medir la tasa de éxito.
- El adaptador requiere las estadísticas de normalización en `assets/` y el overlay de OpenPI para funcionar correctamente.
- Los grippers se limitan a un rango de [0, 0.08] metros, lo que restringe el tipo de objetos que puede agarrar.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Onol/pi05-piper-peg-insertion-lora
- Repositorio de OpenPI (GitHub): https://github.com/Physical-Intelligence/openpi
- Página web de OpenPI: https://www.openpi.net/english.html
- Modelo base π0.5 en HuggingFace: https://huggingface.co/physical-intelligence/pi0.5 (no verificado)
- Adaptador similar de Onol para otra tarea: https://huggingface.co/Onol/pi05-piper-pick-bowl-into-bag-lora
- Implementación de π0.5 en LeRobot (referencia): https://huggingface.co/moriis/pi05_piper
