# quantumcookie/UMA

## Resumen

UMA (Unified Motion-Action Modeling) es un modelo de robótica desarrollado por investigadores de la Universidad de Cornell que unifica en un único transformer la predicción del movimiento de objetos (flujo de puntos 3D) y la generación de acciones del robot (control del efector final) mediante un objetivo común de flow-matching enmascarado. El modelo se presenta en CoRL 2026 y está diseñado para aprender de datos heterogéneos: datos de robot simulados, datos de robot reales y vídeos de personas realizando tareas, aprovechando que el movimiento de los objetos es un fenómeno compartido entre humanos y robots aunque los vídeos humanos carezcan de etiquetas de acción.

Con 131 millones de parámetros entrenables, UMA emplea un codificador visión-lenguaje SigLIP 2 congelado y se condiciona en tiempo de inferencia mediante un "motion prompt" (la trayectoria 3D deseada de unos pocos puntos del objeto) o mediante una instrucción en lenguaje natural. El modelo produce las siguientes 8 poses del efector final a 15 Hz, lo que lo convierte en una política de manipulación robótica de propósito general.

La relevancia de UMA radica en su enfoque unificado: en lugar de entrenar políticas específicas por tarea o por robot, aprende una representación compartida de movimiento y acción que puede transferirse entre morfologías y dominios. El checkpoint publicado (`uma_pretrain.pt`, 523 MB) corresponde al modelo preentrenado antes de cualquier ajuste específico de tarea, con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer único con flow-matching enmascarado (motion-action) |
| Parametros totales | 131M entrenables (pesos EMA) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa 8 estados previos del efector y horizonte de predicción de 8 pasos) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (instrucciones en lenguaje natural, idioma no especificado) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`uma_pretrain.pt`, 523 MB) |

## Arquitectura y entrenamiento

UMA es un transformer único que modela conjuntamente el flujo de puntos 3D del objeto (cómo se mueve) y las acciones del efector final (cómo actúa el robot) mediante un objetivo de flow-matching enmascarado. El codificador visión-lenguaje es SigLIP 2 (`google/siglip2-base-patch16-224`), congelado y cargado por separado. Las entradas incluyen una vista RGB-D de cámara, opcionalmente una imagen de muñeca, los últimos 8 estados del efector final, puntos 3D rastreados y un motion prompt o una instrucción. La salida son los siguientes 8 objetivos del efector final (posición, rotación 6D, pinza; 15 Hz) y el movimiento predicho de los puntos rastreados.

El preentrenamiento combina datos de robot simulados (tareas Genesis DROID), datos de robot reales (DROID y teleoperación en laboratorio) y vídeos humanos (Xperience y HOI4D, solo flujo sin acciones). La clave del diseño es que el movimiento de los objetos es compartido entre robots y personas, lo que permite aprovechar vídeos humanos sin etiquetas de acción como señal de supervisión para la parte de modelado de movimiento. El modelo utiliza pesos promediados por media móvil exponencial (EMA). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se empleó RLHF o DPO.

## Capacidades

- Predicción de acciones de manipulación robótica: genera los siguientes 8 objetivos del efector final (posición, rotación 6D, pinza) a 15 Hz.
- Modelado de flujo de puntos 3D: predice el movimiento futuro de puntos rastreados sobre los objetos (horizonte de 19 pasos, M puntos, 3 coordenadas).
- Condicionamiento por motion prompt: acepta la trayectoria 3D deseada de unos pocos puntos del objeto como especificación de tarea.
- Condicionamiento por lenguaje natural: acepta instrucciones textuales (por ejemplo, "put the spatula into the utensil holder").
- Entrada multimodal: una vista RGB-D, opcionalmente una imagen de muñeca, estados del efector y puntos 3D rastreados.
- Aprendizaje de datos heterogéneos: capacidad de aprovechar vídeos humanos sin acciones para la parte de movimiento.
- No se dispone de información sobre soporte de tool calling, agentes multi-paso ni capacidades multilingües específicas.

## Casos de uso

- Manipulación robótica guiada por instrucciones: el modelo recibe una instrucción en lenguaje natural y una observación RGB-D y genera la secuencia de acciones del efector para ejecutar la tarea, lo que permite controlar un brazo robótico sin programación específica por tarea.
- Manipulación guiada por trayectoria de puntos: en escenarios donde se conoce la trayectoria 3D deseada de puntos clave del objeto, el motion prompt permite especificar la tarea de forma geométrica, útil en entornos industriales con posiciones definidas.
- Preentrenamiento base para ajuste fino: al ser un checkpoint preentrenado antes de cualquier ajuste de tarea, sirve como inicialización para políticas específicas de robot o de tarea con pocos datos.
- Aprendizaje a partir de vídeos humanos: el modelo puede aprovechar demostraciones humanas sin acciones etiquetadas para mejorar la predicción de movimiento, útil en laboratorios que recopilan vídeos de operarios.
- Investigación en transferencia entre morfologías: la representación unificada de movimiento y acción permite estudiar la transferencia entre robots simulados, reales y demostraciones humanas.
- Evaluación de políticas de manipulación: el modelo puede usarse como referencia o componente en pipelines de investigación para comparar estrategias de condicionamiento (motion prompt frente a lenguaje).
- Prototipado en robótica de laboratorio: con 131M parámetros y un checkpoint de 523 MB, es viable para experimentación en entornos de investigación con GPU de gama media-alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 131M parámetros y pesos en FP32 (523 MB), la inferencia requiere previsiblemente menos de 2 GB solo para los pesos, más el codificador SigLIP 2 congelado cargado por separado.
- GPU recomendadas: no especificadas en la información disponible; el código de ejemplo usa `device="cuda"`.
- Compatibilidad con GPU de consumo: probable por el tamaño reducido (131M parámetros), aunque no se confirma en la documentación.
- Opciones de despliegue: la model card solo menciona inferencia mediante el paquete `uma` (`load_model`, `predict`) con PyTorch; no se indican vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles; la frecuencia de salida de acciones es de 15 Hz.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (políticas de manipulación robótica con flow-matching y modelado de movimiento).

## Limitaciones y advertencias

- El checkpoint publicado es el modelo preentrenado, no ajustado a tareas específicas; su rendimiento en tareas concretas requerirá ajuste fino.
- El código de inferencia se describe como "code release in progress", por lo que la reproducibilidad puede estar limitada en el momento de la publicación.
- Depende de un codificador SigLIP 2 congelado cargado por separado, lo que añade una dependencia externa y requisitos de memoria adicionales.
- Requiere observaciones RGB-D y, opcionalmente, imagen de muñeca y puntos 3D rastreados; no funciona solo con texto.
- No se especifican los idiomas soportados para las instrucciones en lenguaje natural.
- No se dispone de información sobre sesgos, tasas de alucinación o robustez en dominios fuera de los datos de preentrenamiento (simulación, DROID, teleoperación, Xperience, HOI4D).
- Licencia MIT: permite uso comercial, pero no se detallan restricciones adicionales sobre los datos de entrenamiento ni sobre los modelos preentrenados utilizados (SigLIP 2).
- No se han publicado benchmarks en la información disponible, lo que impide evaluar su rendimiento relativo.

## Enlaces

- [Hugging Face: quantumcookie/UMA](https://huggingface.co/quantumcookie/UMA)
- [Sitio web del proyecto](https://uma-manipulation.github.io)
- [Paper en arXiv (2606.16917)](https://arxiv.org/abs/2606.16917)
- [Repositorio GitHub](https://github.com/realquantumcookie/UMA)
- [Codificador SigLIP 2 (google/siglip2-base-patch16-224)](https://huggingface.co/google/siglip2-base-patch16-224)
