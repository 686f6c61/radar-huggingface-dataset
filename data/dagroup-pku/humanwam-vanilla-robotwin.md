# DAGroup-PKU/HumanWAM-Vanilla-RoboTwin

## Resumen

HumanWAM-Vanilla-RoboTwin es un checkpoint de política robótica (world-action model) desarrollado por DAGroup-PKU, resultado de un post-entrenamiento del modelo base HumanWAM-Vanilla-Base sobre el benchmark de manipulación RoboTwin 2.0. El modelo resuelve el problema de generar acciones motrices a partir de observaciones visuales e instrucciones en lenguaje natural en entornos simulados de manipulación robótica, y se distribuye como pesos PyTorch listos para integrarse en el pipeline de inferencia de HumanWAM.

El linaje de entrenamiento es explícito: 50.000 horas de preentrenamiento (hasta el paso 40.000), seguido de un mid-training EgoPro W0 (paso 10.000) y un post-entrenamiento sobre RoboTwin con 50 demostraciones limpias por tarea en 50 tareas (2.500 demostraciones), con aumento A2. El checkpoint publicado corresponde al paso 21.000 de un schedule de 24.000 pasos.

Es relevante porque documenta resultados de éxito en simulación (92,08 % en condiciones limpias, 68,88 % en aleatorizadas, media del 80,48 %) con instrucciones no vistas, aunque el propio autor advierte que son resultados archivados y que la reconciliación con los logs originales del simulador está pendiente. El lanzamiento es *weights-first*: no incluye estadísticas de normalización, configuración ni recursos de evaluación, por lo que el fichero de pesos por sí solo no constituye un paquete ejecutable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (world-action model; implementación en repositorio OpenHumanScale) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en `model.pt`, sin versiones cuantizadas publicadas) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`model.pt`, 12.041.906.297 bytes) |
| Tamano del repo | 12,0 GB |
| Modelo base | DAGroup-PKU/HumanWAM-Vanilla-Base |
| Dataset de post-entrenamiento | DAGroup-PKU/Open-HumanScale-50K + RoboTwin 2.0 (2.500 demostraciones) |
| Paso de post-entrenamiento seleccionado | 21.000 (de 24.000) |
| SHA-256 de `model.pt` | `470e8914cf87c98c94b0e157c6de603dd17267239dac92e1aadacd885b1081cf` |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo; se define como *world-action model* (WAM) orientado a robótica, con pesos en formato PyTorch y dependencia de la implementación HumanWAM del repositorio OpenHumanScale. No se especifican el número de parámetros, la profundidad de la red, el mecanismo de atención ni el tipo de codificador visual empleado.

El entrenamiento sigue tres fases documentadas: preentrenamiento de 50.000 horas hasta el paso 40.000, mid-training EgoPro W0 hasta el paso 10.000 y post-entrenamiento sobre RoboTwin 2.0 con aumento A2, empleando 50 demostraciones limpias por tarea en 50 tareas (2.500 demostraciones totales) y seleccionando el checkpoint del paso 21.000. No se indica si hubo RLHF, DPO ni otras técnicas de alineación, ni la composición exacta del corpus de preentrenamiento más allá de la referencia al dataset Open-HumanScale-50K.

Una innovación destacable es la convención de acciones: el modelo emplea poses absolutas en el marco de cámara con la orientación nativa de muñeca de RoboTwin, sin alineamiento adicional de muñeca. El autor advierte explícitamente que las estadísticas de normalización y las transformadas de alineamiento de los experimentos de escalado alineados no son intercambiables con este checkpoint.

## Capacidades

- Generación de acciones robóticas de manipulación a partir de observaciones visuales e instrucciones en lenguaje natural, en el simulador RoboTwin 2.0.
- Ejecución de políticas entrenadas con 50 demostraciones por tarea en 50 tareas distintas.
- Generalización a instrucciones no vistas, según la evaluación archivada reportada por el autor.
- Robustez parcial ante condiciones aleatorizadas (68,88 % de éxito frente a 92,08 % en condiciones limpias).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad documentada.
- Capacidades multilingües: no; el modelo declara únicamente inglés (`en`).
- Capacidades especiales (visión, audio, thinking mode): no documentadas en la información disponible.

## Casos de uso

- Evaluación de políticas de manipulación en simulación: el checkpoint se integra en el simulador RoboTwin 2.0 para medir tasas de éxito en tareas de manipulación con instrucciones nuevas, usando las 50 tareas del benchmark como conjunto de validación.
- Investigación en world-action models: sirve como punto de partida reproducible para estudiar el efecto del post-entrenamiento con pocas demostraciones (50 por tarea) sobre un modelo preentrenado con 50.000 horas de datos.
- Comparación de estrategias de aumento de datos: el uso documentado de aumento A2 permite analizar su impacto en la robustez frente a condiciones aleatorizadas, comparando los resultados limpios y aleatorizados del mismo checkpoint.
- Desarrollo de pipelines de inferencia robótica: el fichero `model.pt` puede cargarse en la implementación HumanWAM para probar la convención de acciones (poses absolutas en marco de cámara con orientación nativa de muñeca) en entornos controlados.
- Reproducción de resultados archivados: investigadores que necesiten verificar las cifras reportadas (92,08 % / 68,88 % / 80,48 %) pueden usar este checkpoint junto con los logs del simulador, aunque la reconciliación está pendiente según el autor.
- Base para post-entrenamientos posteriores: al ser un checkpoint intermedio del linaje HumanWAM-Vanilla, puede servir como inicialización para fine-tuning en otros benchmarks de manipulación, como el variante RoboDojo del mismo autor.

## Benchmarks y rendimiento

| Condición | Éxito limpio (%) | Éxito aleatorizado (%) | Media (%) |
|---|---:|---:|---:|
| HumanWAM-Vanilla-RoboTwin (paso 21.000) | 92,08 | 68,88 | 80,48 |

Los resultados corresponden a evaluaciones archivadas con instrucciones no vistas, con 50 episodios por tarea y condición (2.500 por condición). El autor señala que el manuscrito actual describe 100 episodios por tarea y que la reconciliación con los logs originales del simulador está pendiente. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El checkpoint pesa 12,0 GB en precisión nativa, por lo que se requiere al menos esa cantidad de memoria para cargar los pesos sin cuantización; no se documentan requisitos oficiales.
- GPU recomendadas: no disponibles en la información proporcionada.
- Viabilidad en GPU de consumo: no confirmada; con 12 GB de pesos en precisión nativa, GPUs de 16 GB o más podrían albergarlo, pero no hay validación publicada.
- Opciones de despliegue: requiere la implementación HumanWAM (repositorio OpenHumanScale) y recursos de RoboTwin 2.0; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que es un modelo de política robótica, no un LLM de texto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HumanWAM-Vanilla-RoboTwin | no disponible | no disponible | 80,48 % medio (archivado) | no disponible | Pesos en HF, sin paquete ejecutable completo |
| HumanWAM-Vanilla-Base | no disponible | no disponible | no disponible | no disponible | Pesos en HF (modelo base) |
| HumanWAM-Vanilla-RoboDojo | no disponible | no disponible | no disponible | no disponible | Pesos en HF (variante del mismo linaje) |

No se dispone de datos de benchmarks de modelos comparables de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Los resultados reportados son archivados y no han sido revalidados en esta publicación; la reconciliación con los logs del simulador está pendiente y el número de episodios difiere entre el manuscrito (100 por tarea) y el registro archivado (50 por tarea).
- El lanzamiento es *weights-first*: faltan estadísticas de normalización, configuración de emparejamiento y recursos de evaluación/inferencia, por lo que el fichero de pesos no es un paquete ejecutable por sí solo.
- La inferencia en simulador no se ha revalidado como parte de esta subida.
- La convención de acciones es específica (poses absolutas en marco de cámara con orientación nativa de muñeca, sin alineamiento adicional); mezclar estadísticas o transformadas de otros experimentos produce resultados incorrectos.
- El modelo solo declara soporte de inglés.
- No se especifica la licencia, por lo que el uso comercial queda sin autorización explícita.
- No se documentan sesgos conocidos ni tasas de alucinación; al ser un modelo de política robótica, el riesgo relevante es la ejecución de acciones incorrectas en entornos reales, no la generación de texto.
- El checkpoint está entrenado específicamente para RoboTwin 2.0; su transferencia a otros simuladores o a robots físicos no está documentada.

## Enlaces

- [HuggingFace: DAGroup-PKU/HumanWAM-Vanilla-RoboTwin](https://huggingface.co/DAGroup-PKU/HumanWAM-Vanilla-RoboTwin)
- [Modelo base: DAGroup-PKU/HumanWAM-Vanilla-Base](https://huggingface.co/DAGroup-PKU/HumanWAM-Vanilla-Base)
- [Variante: DAGroup-PKU/HumanWAM-Vanilla-RoboDojo](https://huggingface.co/DAGroup-PKU/HumanWAM-Vanilla-RoboDojo)
- [Dataset: DAGroup-PKU/Open-HumanScale-50K](https://huggingface.co/datasets/DAGroup-PKU/Open-HumanScale-50K)
- [Código y documentación del proyecto (OpenHumanScale)](https://github.com/ucasmjc/OpenHumanScale)
