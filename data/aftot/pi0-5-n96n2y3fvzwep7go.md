# aftot/pi0.5-n96n2y3FVzwEp7Go

## Resumen

El modelo `aftot/pi0.5-n96n2y3FVzwEp7Go` es un checkpoint de tipo Vision-Language-Action (VLA) basado en π0.5, el modelo generalista de robótica desarrollado por Physical Intelligence (Pi) y descrito en el paper arXiv:2504.16054. Este checkpoint concreto lo publica el usuario `aftot` como un ajuste nativo sobre OpenPI en formato JAX/Orbax, con la configuración `pi05_axis_joint`, pensado para control robótico de un manipulador denominado AXIS.

A diferencia de un LLM convencional, este modelo no genera texto: toma como entrada una imagen RGB de cámara (`camera0`, más una cámara de muñeca cuando el evaluador la proporciona) junto con un estado articular de 9 dimensiones (9D joint state), y produce como salida 9 destinos articulares absolutos (9D absolute joint targets). Es, por tanto, una política de control end-to-end para manipulación robótica.

La relevancia de π0.5 radica en su capacidad de generalización en entornos abiertos mediante co-entrenamiento sobre fuentes de datos heterogéneas (demostraciones de robot, datos web y subtareas semánticas), lo que permite ejecutar tareas físicas de larga duración y manipulación diestra con cero ajuste específico por tarea. Este repositorio en particular pesa 12,4 GB y se distribuye bajo los términos de licencia de Gemma para los pesos y la licencia de OpenPI para el código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) basada en transformer, derivada de π0/π0.5; entrada multimodal imagen + estado articular, salida de acciones continuas |
| Parametros totales | no disponible (el checkpoint no declara el recuento; el modelo base π0.5 se describe en el paper arXiv:2504.16054) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de control robótico, no orientado a contexto textual largo) |
| Tipos de cuantizacion | no disponible en el repositorio (se distribuye en formato nativo JAX/Orbax sin cuantizar) |
| Idiomas soportados | no disponible (hereda el componente de lenguaje del modelo base, no declarado en la model card) |
| Licencia | Otros / Gemma (`license: other`, `license_name: gemma`); pesos sujetos a los terminos de uso de Gemma, codigo bajo licencia OpenPI |
| Formato de pesos | JAX/Orbax (`params/`, `assets/`), checkpoint nativo de OpenPI |

## Arquitectura y entrenamiento

π0.5 es un modelo Vision-Language-Action construido sobre π0. Combina un componente vision-lenguaje (que interpreta la escena y el objetivo de la tarea) con un mecanismo de generacion de acciones continuas de tipo flow matching. Segun la descripcion del paper, π0.5 emplea co-entrenamiento sobre datos heterogeneos: demostraciones de robot, datos procedentes de web y anotaciones de subtareas semanticas, lo que le permite descomponer tareas de horizonte largo en pasos y generalizar a entornos no vistos.

Este checkpoint concreto es un ajuste sobre OpenPI con la configuracion `pi05_axis_joint`. La interfaz de entrada-salida definida es: imagen RGB de `camera0` (mas camara de muñeca cuando el evaluador la facilita) y estado articular de 9 dimensiones, mapeados a 9 destinos articulares absolutos. No se detallan en la model card el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF/DPO para esta adaptacion especifica.

## Capacidades

- Control robótico end-to-end: genera acciones continuas (9D absolutas) directamente a partir de observaciones visuales y de estado articular.
- Manipulación diestra y de horizonte largo: el modelo base π0.5 está orientado a tareas físicas de múltiples pasos en entornos abiertos.
- Generalización cero-ajuste: el co-entrenamiento con datos heterogéneos busca ejecutar tareas no vistas sin reentrenamiento por tarea.
- Entrada multimodal de percepción: soporta cámara RGB principal y, opcionalmente, cámara de muñeca para mejorar la percepción en la manipulación.
- Uso multiplataforma (a nivel de modelo base): según la documentación de π0.5, se plantea para distintas plataformas robóticas, aunque este checkpoint está especializado en la configuración `pi05_axis_joint`.
- Sin soporte declarado de tool calling, function calling ni razonamiento multi-paso textual en este checkpoint.
- Capacidades multilingües: no disponible.

## Casos de uso

- Manipulación robótica de laboratorio: uso del checkpoint como política de control para un manipulador AXIS de 9 grados de libertad, tomando la imagen de cámara y el estado articular para producir comandos de posición absolutos.
- Tareas de pick-and-place: el modelo puede accionar un brazo para recoger y colocar objetos guiándose por la observación visual, adecuado porque traduce directamente percepción en acciones articulares.
- Ensamblaje de horizonte largo: al basarse en π0.5, el checkpoint es adecuado para secuencias de manipulación de varios pasos, donde la descomposición en subtareas del modelo base ayuda a mantener coherencia temporal.
- Manipulación diestra con cámara de muñeca: en configuraciones donde el evaluador proporciona la cámara de muñeca, el modelo puede usar esa vista cercana para tareas que requieren precisión (por ejemplo, inserción o agarre fino).
- Evaluación e investigación en VLA: el repositorio sirve para reproducir experimentos de OpenPI sobre el modelo π0.5 en formato JAX/Orbax, útil para investigadores que comparan políticas sobre hardware propio.
- Despliegue en robótica de borde: la existencia de tutoriales de despliegue de π0.5 en NVIDIA Jetson AGX Thor con cuantización TensorRT NVFP4 indica que este tipo de políticas pueden ejecutarse en plataformas embebidas para inferencia de baja latencia.
- Teleoperación asistida y automatización de rutinas: como política base ajustable, puede integrarse en flujos de automatización de tareas repetitivas en un banco de pruebas con el mismo perfil cinemático (9D).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este checkpoint no incluye métricas de éxito de tareas ni comparativas numéricas. El paper de referencia (arXiv:2504.16054) contiene evaluaciones del modelo base π0.5, pero no se dispone de sus cifras en la información proporcionada, por lo que no se reproducen aquí.

## Requisitos de hardware

- Tamaño del repositorio: 12,4 GB, correspondiente al checkpoint nativo JAX/Orbax (`params/` y `assets/`), lo que da una referencia del peso en disco de los parámetros sin cuantizar.
- VRAM estimada para inferencia: no disponible de forma explícita. El tamaño del repo sugiere que se necesita un acelerador que pueda alojar el checkpoint completo; con cuantización (por ejemplo, NVFP4 citada para Jetson) el requisito de memoria se reduce notablemente.
- GPU recomendadas: no declaradas en la model card. El ecosistema OpenPI/JAX es compatible con aceleradores NVIDIA; el tutorial de despliegue de π0.5 apunta a NVIDIA Jetson AGX Thor como plataforma de borde.
- Compatibilidad con GPU de consumo: no confirmada para este checkpoint; el formato de pesos es JAX/Orbax, no GGUF, por lo que no es directamente desplegable en Ollama o llama.cpp.
- Opciones de despliegue: OpenPI en JAX/Orbax como formato nativo; TensorRT con cuantización NVFP4 para plataformas Jetson; vLLM, llama.cpp, Ollama y TGI no son aplicables de forma estándar a este tipo de checkpoint VLA.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `aftot/pi0.5-n96n2y3FVzwEp7Go` | VLA (checkpoint ajustado sobre OpenPI) | no disponible | no disponible | Gemma / OpenPI | HuggingFace (repo de 12,4 GB) |
| π0.5 (Physical Intelligence) | VLA | no disponible en la informacion | no disponible | segun paper/repositorio oficial | Paper arXiv:2504.16054 y despliegues documentados (Qualcomm AI Hub, Jetson) |
| π0 (base de π0.5) | VLA | no disponible en la informacion | no disponible | segun repositorio oficial | Citado como base de π0.5 |

No se dispone en la informacion proporcionada de cifras comparativas de rendimiento ni de especificaciones cerradas para modelos alternativos de la misma categoría, por lo que la comparación se limita a aspectos cualitativos y de disponibilidad.

## Limitaciones y advertencias

- Especialización cinemática: el checkpoint está definido para la configuración `pi05_axis_joint` con estado articular de 9 dimensiones y salida de 9 destinos absolutos; no es directamente reutilizable en robots con otra morfología.
- Riesgo de alucinación: al tratarse de un modelo generativo de acciones basado en percepción, puede producir trayectorias incorrectas o incoherentes ante escenas fuera de su distribución de entrenamiento.
- Brecha simulación-realidad: no se documenta en la model card el rendimiento en entornos reales ni las condiciones de dominio cubiertas.
- Idiomas y capacidades de lenguaje: no disponibles; el componente lingüístico del modelo base no está descrito en este repositorio.
- Restricciones de licencia: los pesos están sujetos a los términos de uso de Gemma, con posibles limitaciones para uso comercial; conviene revisar dichos términos antes de un despliegue en producción.
- Cero descargas y cero likes: el repositorio no tiene validación de la comunidad ni resultados replicados, por lo que conviene tratarlo como material experimental.
- Metadatos incompletos: no se declaran parámetros totales, tipos de cuantización, idiomas ni benchmarks, lo que dificulta la evaluación previa a su integración.
- Formato no portable directamente: al ser un checkpoint JAX/Orbax, no se puede cargar con herramientas estándar de inferencia de LLM sin conversión.

## Enlaces

- HuggingFace: https://huggingface.co/aftot/pi0.5-n96n2y3FVzwEp7Go
- Paper de π0.5: https://arxiv.org/abs/2504.16054
- Pi0.5 en Qualcomm AI Hub: https://aihub.qualcomm.com/iot/models/pi05
- Tutorial de OpenPi π0.5 en Jetson AI Lab: https://www.jetson-ai-lab.com/tutorials/openpi_on_thor/
- Repositorio OpenPI (mencionado en las etiquetas del modelo): https://github.com/Physical-Intelligence/openpi
