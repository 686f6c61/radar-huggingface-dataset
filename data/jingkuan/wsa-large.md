# Jingkuan/WSA-Large

## Resumen

WSA-Large es un modelo fundacional de robótica (robot foundation model, RFM) de 6.457 millones de parámetros, desarrollado por el equipo de Jingkuan Song (Universidad de Ciencia y Tecnología Electrónica de China, UESTC) y colaboradores. Forma parte de la familia WSA<sub>1</sub>, que introduce el paradigma de modelado World-Spatial-Action (WSA), un enfoque centrado en 3D que busca resolver el desajuste fundamental entre la percepción visual 2D y la interacción encarnada 3D en robots reales.

El modelo está diseñado como un checkpoint de preentrenamiento para fine-tuning en tareas de manipulación robótica, y utiliza como backbone el modelo de difusión de video Wan2.2-TI2V-5B. Se publica junto a WSA-Base (3B), que usa Qwen3-VL-2B-Instruct como backbone, y ambos se distribuyen bajo la librería LeRobot. Su relevancia actual reside en que es uno de los primeros RFM que integra explícitamente modelado de mundo 3D, planificación visual 2D y generación de acciones 3D en un único marco entrenable, con resultados reportados en los benchmarks RoboTwin2.0 y LIBERO.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Backbone Wan2.2-TI2V-5B (modelo de difusión de vídeo) con módulos de planificación visual 2D y generación de acción 3D |
| Parámetros totales | 6.457.006.296 (≈6.5B) |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

WSA-Large se basa en el paradigma World-Spatial-Action, que integra tres módulos entrenados conjuntamente: planificación visual 2D alineada con instrucciones, modelado de mundo 3D condicionado por la acción y generación de acciones 3D. El backbone es Wan2.2-TI2V-5B, un modelo de difusión de texto-a-vídeo de 5B parámetros, al que se añaden componentes específicos para robótica. Esta arquitectura híbrida combina generación visual (difusión) con predicción de acciones, lo que permite al modelo aprender representaciones espaciales 3D explícitas en lugar de depender únicamente de características 2D.

Los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no se han publicado en la información disponible. El modelo se publica como checkpoint de preentrenamiento, pensado para inicializar fine-tuning en tareas concretas. El entrenamiento se apoya en proyectos open source como LeRobot, Qwen3-VL, Wan2.2, Cosmos Tokenizer, Depth Anything 3, RoboTwin, LIBERO, InternVLA-A1 y Fast-WAM, según los agradecimientos de la model card.

## Capacidades

- Control robótico generalizable: genera acciones de manipulación en entornos simulados y reales, con especial énfasis en la generalización a escenarios con aleatoriedad.
- Planificación visual 2D: produce planes visuales alineados con instrucciones en lenguaje natural.
- Modelado de mundo 3D: aprende una representación del mundo en 3D condicionada por la acción, lo que permite razonar sobre geometría y relaciones espaciales.
- Generación de acciones 3D: emite acciones de control que respetan la geometría del entorno y del efector.
- Fine-tuning para tareas específicas: el checkpoint está diseñado para ser adaptado a conjuntos de datos propios mediante entrenamiento adicional.
- Multilingüe: solo se declara soporte para inglés.

## Casos de uso

- Manipulación robótica en simulación: el modelo alcanza un 93.14% de éxito medio en la configuración aleatorizada (hard) de RoboTwin2.0 sobre 50 tareas ALOHA simuladas, lo que lo hace adecuado como base para entrenar políticas de manipulación bimanual.
- Evaluación en benchmarks de largo horizonte: en LIBERO, obtiene un 98.2% de éxito medio en las cuatro suites (Spatial, Object, Goal y 10), siendo especialmente útil para tareas que requieren razonamiento espacial y de objetivos.
- Inicialización de entrenamiento para robots reales: el checkpoint de preentrenamiento permite transferir conocimiento a dominios reales mediante fine-tuning con datos propios, reduciendo el coste de entrenamiento desde cero.
- Investigación en aprendizaje por imitación y world models: su arquitectura híbrida (difusión + acción) sirve como base para experimentos sobre modelado de mundo 3D en robótica.
- Sistemas de control basados en visión-lenguaje-acción (VLA): integrable en pipelines que requieren interpretar instrucciones y generar comandos motores, especialmente en entornos simulados de evaluación.
- Entrenamiento de políticas de largo plazo: el modelo es candidato para tareas que exigen mantener coherencia espacial y temporal, aunque su contexto no está documentado.

## Benchmarks y rendimiento

La model card reporta resultados en RoboTwin2.0 y LIBERO. En RoboTwin2.0 (configuración aleatorizada, 50 tareas ALOHA simuladas):

| Modelo | Éxito medio (hard) |
|---|---|
| WSA<sub>1</sub>-B | 92.70% |
| WSA<sub>1</sub>-L | 93.14% |

En LIBERO (tasa de éxito, %):

| Método | LIBERO-Spatial | LIBERO-Object | LIBERO-Goal | LIBERO-10 | Media |
|---|---|---|---|---|---|
| WSA<sub>1</sub>-B | 98.6 | 99.6 | 97.2 | 94.2 | 97.4 |
| WSA<sub>1</sub>-L | 99.4 | 99.8 | 98.0 | 95.6 | 98.2 |

No se han publicado resultados de benchmarks comparativos con modelos externos (como RT-2, OpenVLA, etc.) en la información disponible. El paper (arXiv:2607.03941) y la página del proyecto contienen el detalle experimental completo y resultados en mundo real, pero no están accesibles en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: con 6.5B parámetros en BF16, el modelo requiere aproximadamente 13 GB de VRAM solo para los pesos. Con activaciones y overhead, se recomienda al menos 16-24 GB de VRAM para inferencia básica.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para entrenamiento o fine-tuning. Para inferencia ligera podría caber en una RTX 3090/4090, pero no está confirmado.
- Si cabe en GPU de consumo: sí, en tarjetas con 24 GB de VRAM (RTX 3090, RTX 4090) para inferencia, aunque el fine-tuning requerirá más memoria.
- Opciones de despliegue: al estar integrado en LeRobot, puede ejecutarse con su stack de evaluación. No se mencionan soportes para vLLM, Ollama o llama.cpp en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Uso principal | Resultados LIBERO (media) |
|---|---|---|---|---|---|
| WSA-Large | 6.5B | no disponible | no disponible | Fine-tuning robótica | 98.2% |
| WSA-Base | 3B | no disponible | no disponible | Fine-tuning robótica | 97.4% |
| InternVLA-A1 | no disponible | no disponible | no disponible | VLA (citado como base) | no disponible |
| OpenVLA | 7B | no disponible | MIT | VLA general | no disponible |

No se dispone de datos comparativos directos con otros modelos en los mismos benchmarks dentro de la información proporcionada. Los resultados de WSA se presentan frente a WSA-Base, pero no se listan baselines externos en la model card.

## Limitaciones y advertencias

- Licencia no especificada: la model card no indica licencia, lo que impide determinar si el uso comercial está permitido. Se recomienda contactar con los autores antes de usarlo en producción.
- Checkpoint de preentrenamiento: no es un modelo listo para despliegue directo; requiere fine-tuning para tareas concretas.
- Idioma: solo inglés, lo que limita su uso con instrucciones en otros idiomas.
- Información de contexto no disponible: no se documenta la longitud de contexto de entrada ni las limitaciones de secuencia.
- Riesgo de alucinación en planificación visual: como modelo de difusión, puede generar planes visuales inconsistentes con la física real en escenarios no vistos.
- Dependencia de proyectos externos: el modelo hereda limitaciones de Wan2.2-TI2V-5B y de los componentes de LeRobot, Cosmos Tokenizer y Depth Anything 3, cuyas licencias pueden restringir el uso comercial.
- Evaluación limitada: los benchmarks reportados son simulados (RoboTwin2.0 y LIBERO); los resultados en mundo real no están disponibles en la información pública consultada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jingkuan/WSA-Large (también disponible en https://huggingface.co/zaleni/WSA-Large)
- Paper (arXiv): https://arxiv.org/abs/2607.03941
- Página del proyecto: https://zaleni.github.io/WSA1/
- Código oficial: https://github.com/zaleni/WSA
- Colección de modelos: https://huggingface.co/collections/Jingkuan/wsa
- Checkpoint fine-tuned LIBERO: https://huggingface.co/zaleni/WSA-Large-LIBERO
- Repo alternativo WSA-Plus: https://github.com/SII-LibAI/wsa-plus
