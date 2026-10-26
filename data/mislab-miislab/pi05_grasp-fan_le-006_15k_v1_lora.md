# MISLab-MiiSLab/pi05_grasp-fan_Le-006_15k_v1_Lora

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA de PEFT entrenado sobre `lerobot/pi05_base`, el checkpoint base de la familia π₀.₅ de LeRobot. π₀.₅ es un modelo visión-lenguaje-acción (VLA) orientado a robótica manipulativa, desarrollado por el equipo de Physical Intelligence y distribuido en el ecosistema LeRobot de Hugging Face; el adaptador lo publica MISLab-MiiSLab (Multimedia Interaction and Intelligent System Lab) con el identificador `pi05_grasp-fan_Le-006_15k_v1_Lora`, lo que sugiere un ajuste fino para una tarea concreta de agarre ("grasp-fan") a partir de una configuración experimental (Le-006) y 15 000 pasos o muestras.

El interés práctico del artefacto está en que ejemplifica el flujo de trabajo habitual con modelos VLA: en lugar de reentrenar los miles de millones de parámetros del modelo base, se publica un adaptador ligero (el repositorio ocupa 0,2 GB) que se carga sobre el checkpoint original mediante PEFT. Esto abarata el ajuste por tarea y permite mantener varios adaptadores especializados sobre un mismo base congelado.

La información publicada es muy escasa: la model card es la plantilla por defecto de Hugging Face sin cumplimentar, sin licencia declarada, sin idiomas, sin datos de entrenamiento ni resultados de evaluación. Todo lo que se detalla a continuación procede de los metadatos del repositorio y de la documentación pública del modelo base; cualquier dato no verificable se marca explícitamente como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un modelo visión-lenguaje-acción (VLA) de la familia π₀.₅ (`lerobot/pi05_base`); el backbone concreto no se detalla en la model card |
| Parametros totales | No disponible para el adaptador. El repositorio ocupa 0,2 GB. Un checkpoint hermano de la misma familia (`pi05_grasp-fan_Le-002_30k_v1`) declara 4B parámetros para el modelo base |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la model card. El adaptador se distribuye en safetensors; los repositorios hermanos de la familia declaran tensores en F32 y BF16 para el modelo base |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (adaptador LoRA en formato PEFT; `library_name: peft`, PEFT 0.21.0) |

## Arquitectura y entrenamiento

El adaptador se construye sobre π₀.₅, un modelo VLA que combina un backbone de visión-lenguaje con una cabeza de acción basada en *flow matching*. Según la documentación pública de LeRobot, π₀.₅ es una versión mejorada de π₀ con mejor generalización en entornos abiertos, coentrenada con demostraciones de robot y datos multimodales a gran escala para ejecutar tareas de horizonte largo en escenarios del mundo real no vistos durante el entrenamiento. El repositorio `penn-pal-lab/openpi_with_subtask` confirma que la familia openpi incluye π₀ (VLA basado en flow matching), π₀-FAST (VLA autorregresivo con tokenizador de acciones FAST) y π₀.₅ (versión mejorada de π₀). El checkpoint base empleado aquí es la variante `lerobot/pi05_base`, es decir, la integración de π₀.₅ en el framework LeRobot.

Sobre el entrenamiento del adaptador no hay ningún dato: la model card no documenta el conjunto de datos, el número de tokens, la composición del dataset, hiperparámetros (rango del LoRA, alpha, dropout, tasa de aprendizaje, precisión mixta) ni si hubo RLHF o DPO. El nombre del repositorio sugiere un ajuste fino supervisado sobre demostraciones de una tarea de agarre concreta durante 15 000 pasos, pero se trata de una inferencia a partir del identificador y no de información confirmada por el autor. Tampoco se especifica si el adaptador cubre únicamente la cabeza de acción, el backbone o ambos.

## Capacidades

- Control robótico por instrucciones en lenguaje natural: al heredar la arquitectura VLA del modelo base, el adaptador está orientado a mapear observaciones visuales e instrucciones textuales a acciones de manipulación.
- Ejecución de tareas de agarre específicas: el identificador "grasp-fan" apunta a un ajuste para una tarea concreta de aprehensión de un objeto tipo ventilador o aspas, presumiblemente en un entorno de laboratorio.
- Especialización mediante LoRA: al ser un adaptador PEFT, se puede cargar y descargar dinámicamente sobre el base sin duplicar los pesos completos.
- Razonamiento multi-paso y planificación de horizonte largo: capacidad atribuible al modelo base π₀.₅ según su documentación pública, no verificada para este adaptador concreto.
- Soporte de *tool calling* / *function calling*: no disponible; no es una capacidad documentada para este artefacto y no hay evidencia de que el ajuste la preserve.
- Capacidades multilingües: no disponible.
- Modo *thinking*, visión general o audio: no disponible como capacidad documentada del adaptador; el base es un modelo visión-lenguaje-acción, por lo que la entrada visual es esperable, pero no está confirmada en la model card.

## Casos de uso

- Automatización de una celda de agarre en laboratorio: cargar el adaptador sobre `lerobot/pi05_base` y ejecutarlo en un brazo robótico para la tarea específica de aprehensión para la que fue ajustado, sustituyendo la programación explícita de trayectorias por una política aprendida.
- Punto de partida para ajustes posteriores: al ser un LoRA de 0,2 GB, sirve como inicialización barata para reentrenar sobre variaciones de la misma tarea (posiciones, iluminación, objetos) sin partir del modelo completo.
- Comparación de configuraciones experimentales: el nombre "Le-006" y los repositorios hermanos (Le-002, Le-003) permiten usar este adaptador como una rama más de un barrido de hiperparámetros o de presupuestos de entrenamiento (15k frente a 30k pasos).
- Docencia y formación en VLA: por su tamaño reducido y su integración con PEFT, es un artefacto manejable para demostrar el ciclo completo de ajuste, empaquetado y despliegue de un adaptador sobre un modelo de robótica.
- Investigación en generalización de políticas: evaluar hasta qué punto un adaptador entrenado para una tarea estrecha degrada o conserva las capacidades del modelo base en tareas no vistas.
- Despliegue en hardware con memoria limitada: al no requerir el almacenamiento de una copia completa de los pesos por cada variante, encaja en escenarios con varias políticas especializadas servidas desde un único checkpoint base.
- Replicación de experimentos: sirve como referencia reproducible para quien quiera verificar los resultados de MISLab en la tarea de agarre, siempre que el autor publique finalmente la configuración de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye métricas de éxito en la tarea, tasas de acierto de agarre, evaluaciones en LIBERO ni comparaciones con otros checkpoints. Tampoco se han encontrado datos de rendimiento en la búsqueda web para este adaptador concreto.

## Requisitos de hardware

- VRAM para inferencia: no disponible en la model card. Como referencia, un modelo base de ~4B parámetros en BF16 requiere aproximadamente 8 GB solo para los pesos, más memoria para activaciones, memoria de la caché de atención y tensores intermedios; en FP32 la cifra se duplica hasta unos 16 GB. Estas cifras son estimaciones a partir del tamaño declarado en un repositorio hermano y no están confirmadas para este artefacto.
- GPU recomendadas: no disponible. Por el tamaño estimado del base, una GPU con 16-24 GB (RTX 4090, A10G, L4, A100 40 GB) sería el rango razonable para inferencia en BF16; para entrenamiento del adaptador se recomienda al menos 24 GB.
- ¿Cabe en GPU de consumo? Probablemente sí en BF16 en una RTX 4090 (24 GB) o incluso en una RTX 4080 (16 GB) con cuantización, pero no hay confirmación del autor ni instrucciones de ejecución publicadas.
- Opciones de despliegue: LeRobot es el framework natural, dado que el base es `lerobot/pi05_base`. El adaptador se carga con PEFT (`PeftModel.from_pretrained`) sobre el checkpoint base. vLLM, llama.cpp, Ollama y TGI no están documentados para esta familia y no se puede asumir compatibilidad.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `MISLab-MiiSLab/pi05_grasp-fan_Le-006_15k_v1_Lora` (este) | Adaptador LoRA sobre VLA π₀.₅ | No disponible (repo de 0,2 GB) | No disponible | No disponible | Hugging Face, 0 descargas, 0 likes |
| `MISLab-MiiSLab/pi05_grasp-fan_Le-002_30k_v1` | Checkpoint de la misma familia, ajustado para la misma tarea | 4B (declarados) | No disponible | No disponible | Hugging Face |
| `MISLab-MiiSLab/pi05_grasp-fan_Le-003_30k_v1_LoRA` | Adaptador LoRA de la misma familia | No disponible | No disponible | No disponible | Hugging Face |
| `lerobot/pi05_base` | Modelo base VLA π₀.₅, sin ajustar | No disponible en la información recogida | No disponible | No disponible | Hugging Face / LeRobot |
| `lerobot/pi05_libero_finetuned_v044` | Checkpoint π₀.₅ ajustado y evaluado en tareas LIBERO | No disponible | No disponible | No disponible | Hugging Face / ModelScope |

La comparación cuantitativa no es posible con los datos disponibles: ninguno de los repositorios consultados publica métricas, contexto, licencia ni recuento de parámetros del adaptador. La diferencia observable entre este artefacto y sus hermanos es el presupuesto de entrenamiento implícito en el nombre (15k frente a 30k) y el formato (adaptador LoRA frente a checkpoint completo).

## Limitaciones y advertencias

- Model card sin cumplimentar: todos los campos de la plantilla de Hugging Face están marcados como "[More Information Needed]", incluidos tipo de modelo, licencia, datos de entrenamiento y evaluación.
- Licencia no declarada: sin licencia explícita no se puede asumir permiso para uso comercial, redistribución ni modificación. Es un bloqueo potencial para cualquier despliegue en producción.
- Riesgo de alucinación y fallo físico: en modelos VLA, los errores de política se traducen en acciones motrices incorrectas que pueden dañar el objeto, el efector final o el entorno. Cualquier despliegue requiere límites de par, paradas de emergencia y supervisión.
- Especialización estrecha: el identificador indica un ajuste para una única tarea de agarre. No hay evidencia de que conserve las capacidades generales del modelo base ni de que generalice a otros objetos, posiciones o morfologías de robot.
- Sesgos: no documentados. Al desconocerse el dataset de ajuste, no se puede evaluar el sesgo de dominio (iluminación, materiales, fondo) ni la diversidad de demostraciones.
- Limitaciones de contexto e idioma: no disponibles. Se desconoce la longitud máxima de instrucción y qué idiendas maneja el adaptador.
- Trazabilidad de la fuente: el tag `arxiv:1910.09700` del repositorio corresponde a Lacoste et al. (2019) sobre el calculador de impacto medioambiental, citado en la plantilla de la model card; no es un artículo sobre el modelo y no debe interpretarse como referencia técnica.
- Metadatos anómalos: las fechas de creación y actualización (26 de octubre de 2026) son posteriores a la consulta, lo que sugiere un error de reloj o un repositorio pre-fechado. Conviene verificarlo antes de citarlo.
- Ausencia de adopción: 0 descargas y 0 likes indican que no ha sido validado por la comunidad; no existen informes independientes de reproducibilidad.
- Sin instrucciones de uso: la sección "How to Get Started" está vacía, por lo que la integración con LeRobot y PEFT debe deducirse del formato del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MISLab-MiiSLab/pi05_grasp-fan_Le-006_15k_v1_Lora
- Repositorio hermano (Le-002, 30k): https://huggingface.co/MISLab-MiiSLab/pi05_grasp-fan_Le-002_30k_v1
- Repositorio hermano (Le-003, LoRA, 30k): https://huggingface.co/MISLab-MiiSLab/pi05_grasp-fan_Le-003_30k_v1_LoRA
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Checkpoint π₀.₅ ajustado en LIBERO: https://www.modelscope.cn/models/lerobot/pi05_libero_finetuned_v044
- Documentación de π₀.₅ en LeRobot: https://github.com/huggingface/lerobot/blob/main/docs/source/pi05.mdx
- Repositorio openpi (Physical Intelligence) con fork para subtareas: https://github.com/penn-pal-lab/openpi_with_subtask
- Calculador de impacto medioambiental citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
