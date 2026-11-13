# Ram20307/qwen3-vl-2b-action-genome-scene-graph-lora

## Resumen

`qwen3-vl-2b-action-genome-scene-graph-lora` es un adaptador LoRA publicado por el usuario Ram20307 sobre el modelo base Qwen/Qwen3-VL-2B-Instruct, un modelo vision-language de 2 mil millones de parámetros desarrollado por el equipo Qwen de Alibaba. El adaptador especializa el modelo en la generación de grafos de escena (scene graphs) a partir de fotogramas de vídeo: dado un frame, el modelo devuelve un JSON que enumera los objetos visibles relacionados con una persona y clasifica cada relación en tres categorías (atención, espacial y contacto). El dominio de entrenamiento es Action Genome, un conjunto de anotaciones construido sobre vídeos de Charades.

El interés del adaptador es acotado pero concreto: demuestra que un VLM pequeño de 2B parámetros puede ajustarse con LoRA (r=16, bf16) para una tarea estructurada de percepción relacional, con salida JSON estrictamente válida en el 100% de los frames evaluados. Está pensado para investigación en comprensión de escenas y relaciones humano-objeto, no como modelo de propósito general.

La relevancia práctica es doble. Por un lado, ofrece un punto de partida reproducible para quien quiera experimentar con scene graphs sobre Action Genome sin entrenar desde cero. Por otro, sus métricas preliminares (recall 0,40, precisión 0,54) sitúan el techo de rendimiento actual y advierten de que el adaptador aún no es apto para producción sin trabajo adicional. La licencia del adaptador es Apache 2.0, pero los datos de entrenamiento (Action Genome y Charades) son de uso exclusivamente no comercial para investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer vision-language Qwen3-VL-2B-Instruct |
| Parámetros totales | 2B en el modelo base; el adaptador LoRA tiene r=16 (número exacto de parámetros del adaptador no disponible) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Qwen3-VL-2B-Instruct) |
| Tipos de cuantización | No disponible (el adaptador se entrenó en bf16; el autor reporta resultados con pesos fusionados en bf16) |
| Idiomas soportados | No disponible (el prompt de entrenamiento está en inglés) |
| Licencia | Apache 2.0 (adaptador); datos de entrenamiento Action Genome/Charades solo para investigación no comercial |
| Formato de pesos | safetensors (adaptador PEFT); requiere fusión con el modelo base para inferencia standalone |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-VL-2B-Instruct, un transformer vision-language del que no se detallan en la información disponible ni el número de capas, ni la dimensión oculta, ni el mecanismo de atención visual. El ajuste se realizó con LoRA de rango 16 en precisión bf16 sobre el split de entrenamiento completo de Action Genome: aproximadamente 60.700 frames muestreados de 7.787 vídeos de Charades, con hasta 8 frames por vídeo, durante 2 épocas. No se especifica la composición exacta del dataset más allá de su origen, ni si hubo etapas de RLHF o DPO (no aplicables en un ajuste supervisado de este tipo).

La innovación técnica del adaptador es la formulación de la tarea: en lugar de una descripción libre, se fuerza al modelo a producir un array JSON con la estructura `[{"object":<name>,"attention":[..],"spatial":[..],"contact":[..]}]`, donde cada relación se etiqueta en una de tres categorías. El prompt de entrenamiento es fijo y en inglés. El autor reporta que, con pesos fusionados en bf16, la salida JSON fue válida en 199 de 199 frames de test, lo que indica que el ajuste consiguió imponer el formato de salida de forma robusta. No se documentan técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de grafos de escena en formato JSON a partir de un único fotograma, enumerando objetos relacionados con una persona.
- Clasificación de relaciones en tres ejes: atención (qué mira o atiende la persona), espacial (posición relativa) y contacto (interacción física).
- Salida estructurada estricta: el modelo respeta el esquema JSON en el 100% de los frames evaluados (199/199).
- Comprensión visual heredada del modelo base Qwen3-VL-2B-Instruct (descripción de imágenes, respuesta a preguntas visuales), aunque el adaptador está especializado y puede degradar el comportamiento general.
- Capacidad multilingüe: no disponible en la información proporcionada; el prompt de entrenamiento es en inglés.
- Tool calling / function calling: no documentado para el adaptador; depende de las capacidades del modelo base, no evaluadas aquí.
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado en esta ficha.
- Capacidades especiales (thinking mode, audio, etc.): no disponibles.

## Casos de uso

- Investigación en grafos de escena: el adaptador sirve como línea base reproducible para experimentar con Action Genome, comparando variantes de LoRA, prompts o resolución de entrada sin reentrenar un VLM desde cero.
- Anotación asistida de vídeo: dado un muestreo de frames por vídeo, el modelo propone relaciones humano-objeto que un anotador humano revisa y corrige; la salida JSON válida facilita la integración en herramientas de etiquetado.
- Extracción de relaciones para análisis de comportamiento: en estudios de interacción persona-objeto en entornos domésticos (cocina, salón), el modelo puede alimentar pipelines que midan frecuencia y tipo de contacto con objetos.
- Prototipado de sistemas de percepción en robótica doméstica: con precisión y recall aún bajos, el adaptador es adecuado para pruebas de concepto que validen el formato de salida antes de invertir en un modelo mayor.
- Generación de datos sintéticos para entrenamiento: las salidas del modelo, tras filtrado humano, pueden servir como pseudoetiquetas para aumentar el conjunto de entrenamiento de detectores de relaciones.
- Evaluación comparativa de VLMs pequeños: al ser un adaptador ligero (repo de 0,1 GB), permite medir cuánto puede aportar un ajuste LoRA a un modelo de 2B en una tarea estructurada, como referencia frente a modelos de mayor tamaño.
- Docencia y demostraciones: el tamaño reducido del adaptador y la salida JSON hacen viable desplegarlo en un cuaderno o demo interactiva para explicar grafos de escena.

## Benchmarks y rendimiento

Resultados reportados por el autor (preliminares, una sola ejecución, sin barras de error):

| Métrica | Valor | Condiciones |
|---|---|---|
| Validez del JSON | 199/199 (100%) | 199 frames de test de 25 vídeos, pesos fusionados en bf16 |
| Recall | 0,40 | Mismo conjunto; protocolo no oficial |
| Precisión | 0,54 | Mismo conjunto; protocolo no oficial |

El autor advierte explícitamente de que el protocolo de evaluación no es el de la competición (280 frames de 35 vídeos) y de que se trata de una única ejecución sin intervalos de confianza. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base es de 2B parámetros; en bf16 requiere aproximadamente 4-5 GB solo para pesos, más memoria para el procesador visual y el contexto. En cuantización de 8 bits bajaría a unos 2-3 GB, y en 4 bits a unos 1,5-2 GB (estimaciones a partir del tamaño del modelo, no verificadas por el autor).
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, 4060, 4070, 4090) debería poder ejecutar el modelo base en bf16 o cuantizado; para entrenamiento o evaluación por lotes se recomienda A100 o H100.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060 12 GB y superiores; en GPUs de 6-8 GB conviene usar cuantización.
- Opciones de despliegue: el adaptador es PEFT, por lo que requiere cargar el modelo base Qwen3-VL-2B-Instruct y aplicar el adaptador (transformers + peft), o fusionar los pesos antes de exportar. Para servir en producción, vLLM o TGI si soportan la arquitectura del modelo base; llama.cpp/Ollama solo si existe una conversión GGUF del modelo base fusionado (no disponible en la información proporcionada).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables publicados para este adaptador ni para alternativas específicas de scene graphs sobre Action Genome en la información proporcionada. A continuación se comparan características estructurales con el modelo base y con la alternativa genérica de un VLM de mayor tamaño, sin datos de rendimiento:

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-vl-2b-action-genome-scene-graph-lora | 2B (base) + LoRA r=16 | No disponible | Scene graph JSON | Apache 2.0 (adaptador); datos no comerciales | Hugging Face, 0 descargas |
| Qwen/Qwen3-VL-2B-Instruct (base) | 2B | No disponible | VLM generalista | Apache 2.0 | Hugging Face |
| VLMs de mayor tamaño (p. ej. familia Qwen3-VL de 7B+) | No disponible | No disponible | VLM generalista / scene graph con prompting | Según modelo | Hugging Face |

No se conocen adaptadores públicos equivalentes especializados en Action Genome con los que comparar métricas; indicar "no disponible".

## Limitaciones y advertencias

- Rendimiento limitado: recall de 0,40 y precisión de 0,54 en la evaluación preliminar del autor; no apto para producción sin mejora sustancial.
- Evaluación incompleta: una sola ejecución, sin barras de error y con un protocolo distinto al de la competición oficial (199 frames de 25 vídeos frente a 280 frames de 35 vídeos).
- Restricción de licencia de datos: Action Genome y Charades están licenciados solo para investigación no comercial; aunque el adaptador es Apache 2.0, el uso comercial del modelo entrenado con estos datos es jurídicamente dudoso y requiere revisión legal.
- Especialización estrecha: el adaptador está entrenado para una única tarea y un único prompt en inglés; fuera de ese formato puede degradar el comportamiento general del modelo base.
- Riesgo de alucinación: como todo VLM, puede inventar objetos o relaciones no presentes en el frame; la salida JSON válida no garantiza corrección semántica.
- Idiomas: no hay evidencia de soporte multilingüe en la tarea; el prompt de entrenamiento es en inglés y las etiquetas de objetos provienen de anotaciones en inglés.
- Sesgos: no documentados por el autor; los datos de Charades proceden de vídeos domésticos con posible sesgo demográfico y de vocabulario de objetos.
- Sin mantenimiento ni comunidad: 0 descargas y 0 likes en el momento de la ficha; no hay garantía de soporte, actualizaciones o corrección de errores.
- Reproducibilidad: no se publican hiperparámetros completos, semillas ni scripts de evaluación en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ram20307/qwen3-vl-2b-action-genome-scene-graph-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Dataset Action Genome: https://huggingface.co/datasets/action-genome (referencia citada en la model card; no se proporciona enlace directo verificado)
- Dataset Charades: no disponible enlace directo en la información proporcionada
- Paper de Action Genome: no disponible enlace en la información proporcionada
- Repositorio de código o demo: no disponible
