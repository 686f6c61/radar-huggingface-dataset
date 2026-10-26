# akino222333/pi05-dobot-four-instrument-full-v1-30k

## Resumen

`akino222333/pi05-dobot-four-instrument-full-v1-30k` es un ajuste fino completo (full parameter training) del modelo visión-lenguaje-acción pi0.5 sobre el repositorio openpi, especializado en la manipulación de cuatro instrumentos quirúrgicos con un brazo robótico Dobot: portagujas (needle holder), separador de Richardson, pinzas de tejido (tissue forceps) y separador de Weitlaner. Lo publica el usuario akino222333 dentro de su colección de modelos VLA ajustados, y su interés radica en que documenta de forma poco habitual todo el proceso: checkpoints Orbax por paso, activos de normalización, estado del optimizador, lanzador de entrenamiento, bloqueo de dependencias, archivo del código fuente y log, con hashes en `manifest.json`.

El entrenamiento cubre 30.000 pasos con batch size 8 y horizonte de acción 10, sobre 540 demostraciones que suman 114.181 fotogramas, cada una anotada con su instrucción descriptiva de tarea. El repositorio ocupa 193,8 GB, coherente con el almacenamiento de múltiples carpetas de paso en precisión completa más los estados de entrenamiento.

La advertencia principal la firma el propio autor: los checkpoints no se han evaluado todavía en el robot físico y la pérdida de entrenamiento no establece una tasa de éxito. Se trata, por tanto, de material de reproducción e investigación, no de un modelo validado para producción ni, mucho menos, para uso clínico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA basada en flow matching (pi0.5 de openpi, según la documentación del proyecto openpi); no se detalla la configuración interna en la model card |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible; horizonte de acción de 10 pasos |
| Tipos de cuantización | no disponible; los checkpoints se distribuyen en precisión original (Orbax) |
| Idiomas soportados | no disponible; las instrucciones de tarea son descriptivas y provienen del dataset |
| Licencia | no disponible |
| Formato de pesos | Orbax (checkpoints JAX/Flax) con activos de normalización y estado del optimizador; no se incluyen safetensors ni GGUF |
| Pasos de entrenamiento | 30.000 (el paso final es 29999 por indexación desde cero), batch size 8 |
| Datos de entrenamiento | 540 demostraciones, 114.181 fotogramas, 4 tareas; revisión del dataset `dd4ca9c607eb49e7349287ba8e1162f67e4fa56d` |
| Tamaño del repositorio | 193,8 GB |
| Librería | openpi |
| Pipeline | robotics |

## Arquitectura y entrenamiento

El modelo parte de pi0.5, el VLA de Physical Intelligence distribuido en el repositorio openpi. Según la documentación de ese proyecto, pi0.5 es una evolución de π₀, descrito como un modelo visión-lenguaje-acción basado en flow matching, con mejor generalización en entornos abiertos; openpi incluye además π₀-FAST, una variante autorregresiva basada en el tokenizador de acciones FAST. La model card de este ajuste no reproduce la arquitectura interna (codificador visual, backbone de lenguaje, experto de acción ni recuento de parámetros), por lo que esos detalles deben consultarse en la documentación del modelo base y no se afirman aquí.

El ajuste fino es de parámetros completos, no LoRA: 30.000 pasos con batch size 8 y horizonte de acción 10, sobre 540 demostraciones (114.181 fotogramas) del dataset `akino222333/dobot-four-instrument-descriptive-v1`, cada una emparejada con su instrucción descriptiva. Las cuatro tareas cubiertas son portagujas, separador de Richardson, pinzas de tejido y separador de Weitlaner. El paquete incluye, por cada carpeta de paso, los parámetros Orbax y los activos de normalización, además del estado del optimizador disponible en cada `train_state`; bajo `training/` se aportan el lanzador, el bloqueo de dependencias, el archivo del código fuente y el log, y `manifest.json` recoge los hashes exactos de los artefactos. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna técnica de refinamiento posterior al entrenamiento supervisado, ni innovaciones de decodificación específicas.

## Capacidades

- Manipulación robótica condicionada por lenguaje de cuatro instrumentos quirúrgicos concretos: portagujas, separador de Richardson, pinzas de tejido y separador de Weitlaner.
- Predicción de acciones en forma de chunks con horizonte de 10 pasos, según la configuración de entrenamiento declarada.
- Seguimiento de instrucciones de tarea descriptivas, una por demostración en el dataset de origen.
- Ajuste fino de parámetros completos sobre pi0.5, lo que en principio permite adaptar tanto la cabeza de acción como las representaciones visión-lenguaje al dominio del brazo Dobot.
- Reproducibilidad del pipeline de entrenamiento: lanzador, dependencias fijadas, código fuente y logs incluidos.
- Reanudación o análisis del entrenamiento mediante los estados de optimizador y las carpetas de paso intermedias.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso, visión general, audio ni modo "thinking"; se trata de un modelo de acción robótica, no de un asistente conversacional.

## Casos de uso

- Reproducción de investigación en VLA: el paquete incluye código fuente, lanzador y bloqueo de dependencias, de modo que un laboratorio puede reconstruir exactamente la configuración de entrenamiento y verificar los hashes de `manifest.json` antes de confiar en los resultados.
- Punto de partida para un ajuste fino propio: al ser un entrenamiento de parámetros completos sobre 540 demostraciones, sirve como inicialización para quien quiera añadir instrumentos nuevos o un brazo distinto con menos datos que partiendo del pi0.5 original.
- Evaluación comparada de estrategias de adaptación: el mismo autor publica una variante LoRA (`simcube-pi05-lora-30k`), lo que permite contrastar full fine-tuning frente a LoRA sobre la misma familia de datos y presupuesto de pasos.
- Estudio de adquisición de datos en cirugía robótica: las 540 demostraciones con instrucción descriptiva por episodio permiten analizar cómo afecta la anotación lingüística a la cobertura de tareas de manipulación de instrumental.
- Docencia y prototipado en robótica quirúrgica experimental: con las carpetas de paso intermedias se puede ilustrar la evolución del entrenamiento y la estabilidad de la pérdida a lo largo de 30.000 pasos.
- Análisis de eficiencia de almacenamiento y despliegue: los 193,8 GB del repositorio (múltiples checkpoints más estados de optimizador) son un caso práctico para diseñar políticas de retención y conversión de checkpoints Orbax a formatos de inferencia.
- Base para pruebas en simulador antes del traslado al robot: dado que el autor no ha evaluado en hardware físico, el primer uso razonable es validar en simulación y diseñar un protocolo de evaluación de tasa de éxito por tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los checkpoints no se han evaluado en el robot físico y que la pérdida de entrenamiento no constituye una medida de tasa de éxito. No se aportan cifras de MMLU, HumanEval, GSM8K ni de éxito por tarea (portagujas, Richardson, pinzas de tejido, Weitlaner), por lo que no se incluye tabla comparativa de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (193,8 GB) corresponde a múltiples carpetas de paso con parámetros y estados de optimizador, no al peso de un único checkpoint de inferencia, por lo que no permite derivar directamente el requisito de memoria.
- GPU recomendadas: no disponible. La información proporcionada no especifica hardware de entrenamiento ni de inferencia; el proyecto openpi del que deriva el modelo es la referencia a consultar para configuraciones soportadas.
- Compatibilidad con GPU de consumo: no determinada. Sin datos de recuento de parámetros ni de precisión de los checkpoints no puede afirmarse que quepa en una RTX 4090 u otra GPU consumer.
- Opciones de despliegue: los pesos están en formato Orbax, por lo que el punto de entrada natural es el stack openpi (JAX) incluido en `training/`. Para vLLM, llama.cpp, Ollama o TGI sería necesaria una conversión de formato que no se documenta en la información disponible.
- Almacenamiento: 193,8 GB de repositorio; conviene descargar selectivamente la carpeta de paso deseada en lugar del repositorio completo.
- Latencia y throughput: no disponibles. El horizonte de acción de 10 implica que cada inferencia produce un chunk de 10 acciones, pero no se publican tiempos de respuesta ni frecuencia de control.

## Comparativa con modelos similares

| Modelo | Relación | Entrenamiento | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `akino222333/pi05-dobot-four-instrument-full-v1-30k` | Este modelo | Full fine-tuning, 30.000 pasos, batch 8, horizonte 10 | 4 instrumentos quirúrgicos | no disponible | HuggingFace, 0 descargas, 193,8 GB |
| pi0.5 (openpi, Physical Intelligence) | Modelo base | Preentrenamiento VLA de propósito general | Manipulación general, generalización en entornos abiertos | no verificada en la información disponible | Repositorio openpi; ampliamente referenciado |
| `akino222333/simcube-pi05-lora-30k` | Variante del mismo autor | LoRA, 30.000 pasos | No documentadas (sin model card) | no disponible | HuggingFace, sin model card |
| π₀-FAST (openpi) | Alternativa de la misma familia | VLA autorregresiva con tokenizador FAST | Manipulación general | no verificada en la información disponible | Repositorio openpi |

No se dispone de datos de rendimiento comparado entre estas opciones, ni de recuentos de parámetros o longitudes de contexto verificados en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluación en hardware: el autor afirma que los checkpoints no se han probado en el robot físico; no existe ninguna medida de tasa de éxito por tarea.
- La pérdida de entrenamiento no es un indicador válido de éxito en la tarea; no debe citarse como evidencia de rendimiento.
- Licencia no disponible: no puede asumirse permiso de uso comercial, redistribución ni modificación. Es imprescindible contactar con el autor y verificar la licencia del modelo base pi0.5 antes de cualquier uso productivo.
- Dominio muy estrecho: solo cuatro instrumentos y 540 demostraciones. Es esperable un mal comportamiento ante instrumentos, iluminación, fondos, cámaras o brazos distintos a los del dataset.
- Riesgo de sobreajuste y de propagación de errores: un full fine-tuning de 30.000 pasos sobre 114.181 fotogramas puede memorizar sesgos de las demostraciones (posiciones iniciales, trayectorias del operador, disposición del quirófano).
- Sin datos de sesgo demográfico ni de composición del dataset más allá del recuento de episodios y fotogramas; no puede evaluarse el sesgo de los datos de origen.
- Idiomas no declarados: se desconoce si las instrucciones descriptivas están en inglés, en otro idioma o en varios, y si el modelo responde a paráfrasis.
- Riesgo para seguridad: se trata de instrumental quirúrgico. El modelo no es un dispositivo médico, no ha pasado validación regulatoria y no debe emplearse en ningún contexto clínico ni cerca de personas.
- Ambigüedad de artefactos: el repositorio contiene múltiples carpetas de paso y estados de optimizador; usar un paso intermedio sin conocer su historial de evaluación introduce variabilidad no documentada.
- Coste operativo: 193,8 GB de descarga y almacenamiento, con formato Orbax que exige el stack openpi y no es directamente consumible por runtimes de inferencia habituales.
- Advertencia sobre alucinación: en un VLA el fallo equivalente no es textual sino de acción (movimientos plausibles pero incorrectos); la verificación debe hacerse con métricas de éxito físico, no con inspección cualitativa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/akino222333/pi05-dobot-four-instrument-full-v1-30k
- Dataset de entrenamiento: https://huggingface.co/datasets/akino222333/dobot-four-instrument-descriptive-v1
- Colección del autor (SimCube VLA Fine-tuned Models): https://huggingface.co/collections/akino222333/simcube-vla-fine-tuned-models
- Variante LoRA del mismo autor: https://huggingface.co/akino222333/simcube-pi05-lora-30k
- Repositorio openpi (Physical Intelligence), citado en los resultados de búsqueda como origen de π₀, π₀-FAST y π₀.₅: https://github.com/Physical-Intelligence/openpi
- Réplica/derivado de openpi para humanoides: https://github.com/jkim447/pi05-humanoid
- Implementación de pi0.5 en Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models/tree/main/src/qai_hub_models/models/pi05
