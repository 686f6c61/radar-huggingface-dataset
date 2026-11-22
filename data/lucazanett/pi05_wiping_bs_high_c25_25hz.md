# lucazanett/pi05_wiping_bs_high_c25_25hz

## Resumen

π₀.₅ (Pi05) es un modelo de Visión-Lenguaje-Acción (VLA) desarrollado por Physical Intelligence, orientado a la generalización en entornos abiertos para tareas de robótica. El repositorio `lucazanett/pi05_wiping_bs_high_c25_25hz` es un checkpoint concreto entrenado con LeRobot sobre el dataset `lucazanett/new_setup_baseline_high_25hz`, aparentemente especializado en una tarea de limpieza o frotado ("wiping") a 25 Hz. El autor del checkpoint es `lucazanett`, no Physical Intelligence, que es quien desarrolla la arquitectura base.

El modelo combina percepción visual, comprensión del lenguaje y generación de acciones motrices en un único pipeline, lo que permite controlar un robot manipulador a partir de instrucciones en lenguaje natural y observaciones de cámara. Con 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y un tamaño de repositorio de 9,4 GB, es un modelo de escala media que requiere GPU dedicada para inferencia en tiempo real.

La relevancia actual del checkpoint es limitada: se trata de un artefacto de investigación publicado el 22 de noviembre de 2026, sin descargas ni interacciones en el Hub, y con una model card genérica que no documenta detalles específicos del entrenamiento. Resulta útil como referencia para reproducir el pipeline de LeRobot con π₀.₅, pero no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); implementación LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | lucazanett/new_setup_baseline_high_25hz |
| Frecuencia de control | 25 Hz (según nombre del checkpoint) |
| Tamano del repositorio | 9,4 GB |

## Arquitectura y entrenamiento

La model card indica que π₀.₅ es un modelo de Visión-Lenguaje-Acción con generalización en entornos abiertos, desarrollado por Physical Intelligence como evolución de π₀. La implementación incluida en este repositorio es la adaptación de LeRobot a partir del repositorio OpenPI de Physical Intelligence. No se detalla en la información disponible la arquitectura interna (tipo de transformer, mecanismo de atención, encoder visual o esquema de difusión de acciones), ni el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de RLHF/DPO.

El checkpoint concreto ha sido entrenado con LeRobot sobre el dataset `lucazanett/new_setup_baseline_high_25hz`, que por su nombre sugiere una configuración experimental de alta frecuencia (25 Hz) para una tarea de frotado o limpieza. La model card no aporta información sobre hiperparámetros, número de episodios, composición de las trayectorias ni proceso de evaluación. La única referencia técnica externa es el blog de Physical Intelligence sobre π₀.₅.

## Capacidades

- Generación de acciones motrices para robots manipuladores a partir de observaciones visuales e instrucciones en lenguaje natural.
- Comprensión visual del entorno (percepción de objetos, superficies y estado de la escena) integrada en el mismo modelo que genera las acciones.
- Generalización a entornos y situaciones no vistas durante el entrenamiento, según la descripción de Physical Intelligence para π₀.₅.
- Control a 25 Hz, adecuado para tareas que requieren respuesta rápida del lazo de control.
- Entrenamiento e inferencia mediante el ecosistema LeRobot (`lerobot-train`, `lerobot-record`).
- Compatibilidad con robots del ecosistema LeRobot, como el `so100_follower` mencionado en la model card.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo ni modos de razonamiento explícito.

## Casos de uso

- Automatización de tareas de limpieza o frotado en entornos controlados: el checkpoint está entrenado específicamente para "wiping" a 25 Hz, por lo que puede desplegarse en un brazo robótico para ejecutar movimientos repetitivos de limpieza sobre superficies, usando las cámaras como entrada y generando acciones a alta frecuencia.
- Investigación en políticas VLA: sirve como punto de partida para estudiar cómo se comporta π₀.₅ en una tarea concreta y comparar con otras políticas entrenadas con LeRobot sobre el mismo dataset.
- Reproducción de experimentos de LeRobot: al estar publicado con la librería LeRobot, permite reproducir el pipeline de entrenamiento e inferencia documentado en la guía oficial, útil para laboratorios que quieran validar su infraestructura.
- Evaluación de generalización en robótica: al ser un modelo de generalización en entornos abiertos, puede emplearse para medir la transferencia a variaciones de iluminación, posición de objetos o superficies distintas a las del entrenamiento.
- Base para fine-tuning en tareas similares: investigadores pueden reentrenar o ajustar el checkpoint sobre nuevos datasets de manipulación con LeRobot, aprovechando los pesos preentrenados de π₀.₅.
- Docencia y formación en robótica con IA: el modelo y su pipeline son un ejemplo práctico de cómo se entrena y despliega una política VLA con herramientas open source, adecuado para cursos avanzados de robótica o aprendizaje por imitación.
- Pruebas de integración hardware-software: permite validar la cadena completa (cámaras, robot `so100_follower`, LeRobot, checkpoint) antes de invertir en entrenamientos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 4,14 mil millones de parámetros en precisión FP16 requiere aproximadamente 8,3 GB solo para los pesos, más memoria para activaciones y buffers de inferencia; en FP32 serían unos 16,6 GB. Estas cifras son estimaciones a partir del número de parámetros y no están confirmadas por el autor.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría esperar que funcione en GPUs de gama alta para inferencia en tiempo real, pero el autor no especifica modelos concretos.
- ¿Cabe en GPU de consumo? No confirmado. Un modelo de ~4,14 B de parámetros en FP16 podría caber en GPUs con 16-24 GB de VRAM, pero la inferencia a 25 Hz y el pipeline de visión añaden requisitos que no se detallan.
- Opciones de despliegue: LeRobot (`lerobot-record` para evaluación e inferencia; `lerobot-train` para entrenamiento). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para políticas VLA de robótica.
- Latencia y throughput: no disponibles. La frecuencia de 25 Hz sugiere que el lazo de control opera a 40 ms por paso, pero no se aportan mediciones reales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lucazanett/pi05_wiping_bs_high_c25_25hz | 4.143.404.816 | no disponible | VLA para wiping a 25 Hz | apache-2.0 | Hugging Face, 0 descargas |
| π₀.₅ (Physical Intelligence, modelo base) | no disponible | no disponible | VLA de propósito general | no disponible en la información | Blog y OpenPI |
| Políticas ACT de LeRobot | no disponible | no disponible | Imitación para manipulación | no disponible en la información | LeRobot |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. Al ser un modelo entrenado sobre un dataset específico de una tarea y configuración, es probable que herede los sesgos y la distribución de ese dataset, pero no se aporta información al respecto.
- Riesgo de alucinación: no evaluado. En modelos VLA, el riesgo se traduce en acciones incorrectas o inseguras ante situaciones fuera de distribución, no en texto inventado.
- Limitaciones de contexto o idioma: no se especifican idiomas soportados ni longitud de contexto. El modelo está orientado a instrucciones y percepción, no a generación de texto libre.
- Restricciones de licencia: la licencia es apache-2.0, lo que permite uso comercial y modificación, pero el autor no aclara si los pesos derivados de π₀.₅ tienen restricciones adicionales por parte de Physical Intelligence. Conviene revisar la licencia del modelo base y del repositorio OpenPI antes de un uso comercial.
- Caveat para producción: el checkpoint tiene 0 descargas y 0 likes, fue creado y actualizado en el mismo día, y la model card es genérica (incluye incluso un ejemplo de entrenamiento con `--policy.type=act`, que no corresponde a π₀.₅). No hay evidencia de validación, evaluación ni mantenimiento.
- El nombre del checkpoint sugiere una configuración experimental ("bs_high", "c25_25hz") sin documentación asociada; no se conocen las condiciones exactas de entrenamiento ni su robustez.
- No se documentan requisitos de seguridad para operar un robot real con este modelo; cualquier despliegue físico debe acompañarse de medidas de seguridad independientes.

## Enlaces

- Hugging Face: https://huggingface.co/lucazanett/pi05_wiping_bs_high_c25_25hz
- Dataset de entrenamiento: https://huggingface.co/datasets/lucazanett/new_setup_baseline_high_25hz
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio OpenPI de Physical Intelligence: no disponible en la información proporcionada (mencionado en la model card sin URL).
