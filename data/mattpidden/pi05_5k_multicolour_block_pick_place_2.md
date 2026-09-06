# mattpidden/pi05_5k_multicolour_block_pick_place_2

## Resumen

π₀.₅ (Pi05) es un modelo de política robótica de tipo Vision-Language-Action (VLA), desarrollado por Physical Intelligence y adaptado al ecosistema LeRobot por Hugging Face. Esta instancia concreta, publicada por el usuario mattpidden, es un modelo entrenado sobre el dataset `justintiensmith/multicolour_block_pick_place_2`, que contiene demostraciones de manipulación de bloques de colores en un entorno robótico. El modelo está diseñado para abordar el problema de la generalización en entornos abiertos: a partir de observaciones visuales e instrucciones en lenguaje natural, genera acciones de control para un robot.

El modelo tiene un total de 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y se distribuye en formato safetensors, con un tamaño de repositorio de 9,5 GB. Está etiquetado dentro del pipeline de robótica y utiliza la biblioteca LeRobot para su entrenamiento e inferencia. Su licencia es Apache 2.0, lo que permite su uso tanto académico como comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) de la familia π₀.₅ |
| Parametros totales | 4.143.404.816 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos en safetensors) |
| Idiomas soportados | No disponible (modelo multimodal de visión-lenguaje-acción) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una política π₀.₅, un modelo Vision-Language-Action (VLA) que integra entradas de visión y lenguaje para producir acciones motoras de bajo nivel en un robot. Según la model card, la implementación de LeRobot se adapta del repositorio OpenPI de Physical Intelligence. El entrenamiento se ha realizado con la biblioteca LeRobot, usando el dataset `justintiensmith/multicolour_block_pick_place_2`, orientado a tareas de pick-and-place de bloques de colores.

No se ha proporcionado información sobre el número de tokens de entrenamiento, la composición detallada del dataset ni el uso de técnicas de alineación como RLHF o DPO. La innovación técnica destacable, según la documentación del modelo, es su objetivo de generalización open-world, es decir, la capacidad de ejecutar tareas en entornos y situaciones no vistas durante el entrenamiento.

## Capacidades

- Generación de acciones de control robótico a partir de observaciones visuales (cámaras) e instrucciones en lenguaje natural.
- Aprendizaje por demostración, basado en datos de teleoperación o recogida manual de episodios robóticos.
- Integración con el ecosistema LeRobot, incluyendo entrenamiento, evaluación e inferencia sobre robots reales (por ejemplo, brazos SO100).
- Diseñado para la generalización a nuevos entornos, según la descripción de Physical Intelligence.
- Soporte de tareas de manipulación de objetos, en particular bloques de colores.
- No se especifican capacidades de tool calling, agentes autónomos, ni modos de razonamiento extendido.

## Casos de uso

- Manipulación de bloques de colores en entornos de laboratorio: el modelo puede controlar un brazo robótico para recoger y colocar bloques según instrucciones de lenguaje natural y retroalimentación visual.
- Pick-and-place en almacenes automatizados: la política puede adaptarse a tareas de clasificación y ordenación de objetos en superficies variadas, aprovechando su capacidad de generalización.
- Robótica de servicio doméstico: el modelo puede ejecutar tareas de recogida y colocación de objetos cotidianos, aunque su entrenamiento específico se centra en bloques de colores.
- Automatización de ensamblaje ligero: en procesos industriales con piezas de colores diferenciados, el modelo puede generar trayectorias de agarre y colocación a partir de la observación de la escena.
- Investigación en aprendizaje por demostración: los investigadores pueden utilizar este modelo como base para estudiar políticas VLA, comparar arquitecturas o transferir aprendizaje a otros datasets robóticos.
- Evaluación de políticas robóticas en brazos tipo SO100: la model card documenta explícitamente el uso de `--robot.type=so100_follower`, lo que permite reproducir evaluaciones en hardware de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Con 4.143.404.816 parámetros y pesos en formato safetensors (tamaño del repositorio 9,5 GB), la inferencia en precisión FP16 o BF16 requiere aproximadamente 8-9 GB de VRAM.
- Una GPU con al menos 12 GB de VRAM, como una RTX 4080 o una A100, es adecuada para ejecutar el modelo sin cuantización.
- Con cuantización a 8 bits, el modelo podría caber en GPUs de consumo con 6-8 GB de VRAM, pero el repositorio no incluye pesos cuantizados.
- El despliegue se puede realizar mediante el framework LeRobot, tanto en entrenamiento como en inferencia. No se dispone de información sobre latencia o throughput.

## Comparativa con modelos similares

No se dispone de información comparativa con modelos similares en los datos proporcionados. Existen otros modelos VLA como OpenVLA o π₀, pero no hay datos de rendimiento, contexto o licencia disponibles para realizar una comparación rigurosa.

## Limitaciones y advertencias

- No se han documentado sesgos específicos del modelo en la información proporcionada.
- Como modelo VLA, puede producir acciones incorrectas o no deseadas en situaciones fuera del dominio de entrenamiento.
- El dataset de entrenamiento se centra en la manipulación de bloques de colores, por lo que la generalización a otras tareas robóticas no está garantizada.
- No se ofrece información sobre robustez, seguridad ni certificaciones para uso en entornos de producción.
- La licencia Apache 2.0 permite el uso comercial, pero es responsabilidad del usuario evaluar la idoneidad del modelo para su aplicación concreta.
- No se especifican restricciones de idioma, aunque el modelo es multimodal y no se detalla el alcance lingüístico.

## Enlaces

- HuggingFace: https://huggingface.co/mattpidden/pi05_5k_multicolour_block_pick_place_2
- Blog de Physical Intelligence π₀.₅: https://www.physicalintelligence.company/blog/pi05
- LeRobot GitHub: https://github.com/huggingface/lerobot
- LeRobot Docs: https://huggingface.co/docs/lerobot/index
- Dataset de entrenamiento: https://huggingface.co/datasets/justintiensmith/multicolour_block_pick_place_2
- Modelo relacionado (precisión): https://huggingface.co/mattpidden/pi05_5k_precision-multicolour_block_pick_place
