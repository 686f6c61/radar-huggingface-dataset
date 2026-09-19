# hanapasta/airvla_ftc_15000

## Resumen

AirVLA FT-C (paso 15.000) es una política vision-language-action (VLA) obtenida por ajuste fino del modelo base pi0 de LeRobot sobre un cuadricóptero equipado con un brazo de 2 grados de libertad y pinza paralela. Lo publica el usuario hanapasta como parte de su campaña de tesis de máster AirVLA, cuyo objetivo es adaptar una política VLA preentrenada a un dominio poco habitual: la manipulación aérea. El checkpoint se entrenó durante 15.000 pasos sobre el conjunto de datos hanapasta/airvla_v21, que combina la versión v2 con correcciones terminales F1 ponderadas al alza, y se seleccionó por el menor error cuadrático medio (MSE) de validación con ruido fijado.

El modelo ocupa 4.028.019.472 parámetros (unos 4,03 mil millones) según los pesos en safetensors, con un repositorio de 8,9 GB, y se distribuye bajo licencia MIT. Su evaluación se realizó íntegramente en simulación con MuJoCo 3.3.4 mediante el arnés congelado eval_v2.py, sobre un protocolo de 60 episodios de recogida (pick) y 20 de navegación en escenas emparejadas. Los resultados son modestos: 1/60 agarres correctos, 47/60 aproximaciones al objetivo correcto y 12/20 episodios de navegación, con un error mediano de 145,8 mm.

Su relevancia es acotada pero concreta: no es un modelo de propósito general ni un LLM, sino una política de control para robótica aérea de manipulación. Interesa a investigadores que trabajen en VLA aplicados a drones, en transferencia de políticas preentrenadas a plataformas con cinemática distinta a la de los brazos fijos habituales, o en protocolos de evaluación reproducibles en simulación. La model card documenta además un incidente de procedencia relevante para cualquier reutilización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); ajuste fino de pi0 (lerobot/pi0). No se detalla la configuración interna en la información disponible |
| Parametros totales | 4.028.019.472 (aprox. 4,03 mil millones) |
| Parametros activos | No aplica; no se indica que sea un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamano del repositorio | 8,9 GB |
| Modelo base | lerobot/pi0 |
| Datos de entrenamiento | hanapasta/airvla_v21 (v2 + correcciones terminales F1, F1 ponderado al alza) |
| Pasos de entrenamiento | 15.000 |
| Criterio de seleccion del checkpoint | Menor MSE de validación con ruido fijado sobre la escalera de checkpoints guardados |
| Dominio de evaluacion | Manipulación aérea (cuadricóptero con brazo de 2 DoF y pinza paralela), MuJoCo 3.3.4 |
| Fecha de creacion | 2026-09-18 |
| Fecha de actualizacion | 2026-09-18 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de pi0, la política vision-language-action publicada por LeRobot. La información proporcionada no detalla la topología interna de este checkpoint concreto: no se indica la composición de capas, el número de tokens de contexto visual o lingüístico, ni si se modificó la cabeza de acciones. Lo que sí se especifica es el punto de partida (lerobot/pi0 base), el número de pasos (15.000) y el corpus de entrenamiento (hanapasta/airvla_v21), formado por la versión v2 del conjunto de datos más datos terminales correctivos F1, con F1 ponderado al alza para reforzar las fases finales de la maniobra de agarre.

La selección del checkpoint final no se hizo por la métrica del lazo cerrado, sino por el MSE de validación con ruido fijado, eligiendo el mínimo de la escalera de checkpoints guardados. La model card documenta un problema de procedencia importante: este checkpoint es un reentrenamiento determinista del FT-C original, que se perdió por un error de limpieza de almacenamiento. Se aceptó bajo puertas de equivalencia con el original: MSE de validación con ruido fijado de 7,7e-5 frente a los 7,679e-5 del checkpoint perdido (una diferencia del 0,3 %), más una evaluación en lazo cerrado coincidente.

No se especifican en la información disponible detalles sobre composición exacta del dataset, número de tokens vistos, uso de RLHF, DPO u otras fases de alineamiento, ni innovaciones técnicas concretas de decodificación o atención.

## Capacidades

- Percepción y control visomotor: la política consume observaciones visuales y genera acciones de control, integrando percepción y actuación en un único modelo VLA.
- Manipulación aérea: diseñada específicamente para un cuadricóptero con brazo de 2 grados de libertad y pinza paralela, orientada a tareas de aproximación y recogida de objetos.
- Navegación: el protocolo de evaluación incluye 20 episodios de navegación, lo que indica que el modelo también aborda el desplazamiento hacia una zona objetivo (12/20 episodios correctos).
- Condicionamiento por objetivo: en el protocolo se mide la tasa de aproximación al objetivo correcto (47/60), lo que implica selección de un objetivo entre varios presentes en la escena.
- Ejecución de políticas de horizonte largo encadenadas: el entrenamiento incluye correcciones terminales F1 ponderadas, lo que sugiere especial atención a las fases finales del agarre.
- Tool calling / function calling: no disponible; no es una capacidad descrita para este modelo.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; el modelo es una política de control, no un agente conversacional.
- Capacidades multilingües: no disponible. La model card no documenta soporte de idiomas ni componentes lingüísticos evaluados.
- Capacidades especiales (modo thinking, visión, audio): no se declara ninguna capacidad de este tipo en la información disponible.

## Casos de uso

- Investigación en manipulación aérea: usar el checkpoint como línea base reproducible (1/60 agarres, 47/60 aproximaciones correctas) contra la que medir nuevas variantes del corpus airvla o nuevos esquemas de corrección terminal.
- Estudio de transferencia de VLA a cinemáticas no convencionales: sirve para analizar qué se degrada al pasar de una política pi0 entrenada para brazos fijos a una plataforma con base flotante y brazo de 2 DoF.
- Reproducción de experimentos bajo protocolo congelado: con el arnés eval_v2.py y MuJoCo 3.3.4 se pueden replicar las 60 pruebas de pick y 20 de navegación y comparar cifras con las publicadas.
- Benchmarking de corrección terminal: dado que el dataset incorpora F1 ponderado al alza, es un punto de partida para medir si el refuerzo de las fases finales mejora la tasa de agarre o solo la aproximación.
- Auditoría de procedencia de checkpoints: el caso del checkpoint perdido y reentrenado sirve como ejemplo práctico de puertas de equivalencia basadas en MSE de validación y evaluación en lazo cerrado.
- Docencia y divulgación en robótica: al ser MIT y de tamaño moderado (4,03 mil millones de parámetros, 8,9 GB), puede usarse como material ilustrativo de un pipeline VLA completo en simulación.
- Análisis de selección de checkpoint por métrica de validación: permite estudiar la divergencia entre minimizar el MSE con ruido fijado y maximizar el éxito en lazo cerrado, algo visible aquí (aproximaciones altas, agarres casi nulos).

## Benchmarks y rendimiento

Los únicos datos disponibles proceden del protocolo congelado de la model card: 60 episodios de pick y 20 de navegación sobre escenas emparejadas.

| Metrica | Resultado |
|---|---|
| Agarre correcto (pick) | 1/60 |
| Aproximaciones al objetivo correcto | 47/60 |
| Error mediano de posicion | 145,8 mm |
| Error mediano objetivo-verdadero | 87,6 mm |
| Navegacion correcta | 12/20 |
| MSE de validacion con ruido fijado (reentrenamiento) | 7,7e-5 |
| MSE de validacion con ruido fijado (checkpoint original perdido) | 7,679e-5 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable dado que se trata de una política robótica y no de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de 4.028.019.472 parámetros): aproximadamente 16,1 GB en fp32, 8,1 GB en fp16/bf16, 4,0 GB en int8 y 2,1 GB en int4. Son estimaciones de peso de parámetros, no cifras oficiales; no se publican requisitos en la model card.
- GPU recomendadas: no disponibles de forma oficial. Por tamaño, una A100, H100, L40S o RTX 4090 (24 GB) pueden alojar los pesos en fp16 con margen para activaciones y búferes de inferencia.
- Compatibilidad con GPU de consumo: sí, previsiblemente en fp16 en tarjetas de 12-16 GB o más (RTX 4080, RTX 4090, RTX 3090), y en cuantizaciones de 8 o 4 bits en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4070). No se confirma soporte de cuantización en la información disponible.
- Opciones de despliegue: la model card solo documenta la evaluación con el arnés eval_v2.py dentro de MuJoCo 3.3.4. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y su naturaleza de política VLA con salida de acciones hace que estos servidores de texto no sean directamente aplicables. El ecosistema natural sería LeRobot, del que proviene el modelo base.
- Latencia y throughput estimados: no disponibles.
- Requisito de software: MuJoCo 3.3.4. La propia model card advierte de que otra versión del simulador altera el comportamiento de contactos lo suficiente como para invalidar la comparación con los resultados depositados.

## Comparativa con modelos similares

| Modelo | Parametros | Dominio | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AirVLA FT-C (este modelo) | 4,03 mil millones | Manipulacion aerea (dron con brazo de 2 DoF) | no disponible | MIT | HuggingFace; 0 descargas |
| lerobot/pi0 (modelo base) | no disponible | Vision-language-action generalista para manipulacion | no disponible | no disponible | HuggingFace (LeRobot) |
| Politicas VLA generalistas para brazos fijos (p. ej. OpenVLA) | no disponible | Manipulacion con brazo fijo | no disponible | no disponible | HuggingFace |

La comparación cuantitativa no es posible con la información disponible: no se han facilitado cifras de parámetros, contexto ni resultados del modelo base ni de alternativas bajo el mismo protocolo. La diferencia funcional principal frente a las políticas VLA convencionales es el dominio: AirVLA FT-C está ajustado para una base flotante con brazo de 2 DoF y pinza paralela, no para un manipulador fijo de sobremesa.

## Limitaciones y advertencias

- Tasa de éxito muy baja en agarre: 1/60 episodios correctos. Aunque la aproximación al objetivo es alta (47/60) y el error mediano objetivo-verdadero es de 87,6 mm, la fase final de prehensión falla de forma casi sistemática.
- Validación exclusivamente en simulación: todos los resultados proceden de MuJoCo 3.3.4. No hay evidencia de funcionamiento en hardware real ni datos sobre la brecha sim-a-real.
- Sensibilidad a la versión del simulador: la model card advierte explícitamente de que cambiar de versión de MuJoCo invalida la comparación con los resultados depositados.
- Problema de procedencia: el checkpoint original se perdió por un error de limpieza de almacenamiento y este es un reentrenamiento determinista aceptado mediante puertas de equivalencia (0,3 % de diferencia en MSE de validación más evaluación en lazo cerrado coincidente). No es un artefacto byte a byte del original.
- Métrica de selección discutible: el checkpoint se eligió por MSE de validación con ruido fijado, no por éxito en lazo cerrado, lo que puede explicar la divergencia entre aproximaciones correctas y agarres logrados.
- Idiomas y capacidades lingüísticas: no disponibles. No hay información sobre comprensión de instrucciones en lenguaje natural ni sobre evaluación multilingüe.
- Contexto: no disponible. No se documenta la ventana de contexto ni la longitud de las secuencias de observación y acción manejadas.
- Riesgo de sobreajuste al dataset: el corpus airvla_v21 incorpora correcciones terminales F1 ponderadas al alza; no se documenta el tamaño total del dataset ni su diversidad, por lo que no puede descartarse un ajuste excesivo a las escenas de entrenamiento.
- Alucinación: en el sentido de generación de texto no aplica como tal, pero sí existe el riesgo análogo de políticas que producen trayectorias plausibles pero incorrectas respecto al objetivo real (47/60 aproximaciones frente a 1/60 agarres).
- Sesgos y cobertura: no disponibles. No se documentan sesgos demográficos (irrelevantes aquí) ni sesgos de dominio, pero tampoco la distribución de objetos, iluminación o escenas.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta. Es un artefacto de investigación de tesis, sin señales de uso en producción.
- Licencia: MIT, permisiva y compatible con uso comercial, pero la licencia del modelo base (lerobot/pi0) debería verificarse de forma independiente antes de un uso comercial, ya que la información proporcionada no la especifica.
- Madurez para producción: no recomendado. Los números del protocolo congelado, el incidente de procedencia y la ausencia de validación en hardware real lo sitúan en fase experimental.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hanapasta/airvla_ftc_15000
- Repositorio de código, guía de reproducción y registro experimental completo: https://github.com/robotics-hana/drone-version2
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/hanapasta/airvla_v21
- Modelo base: https://huggingface.co/lerobot/pi0
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces obtenidos correspondían a contenidos sin relación con robótica o aprendizaje automático, por lo que se han descartado.
