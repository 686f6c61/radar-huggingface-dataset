# Dongkkka/Task_000759_FLOWER_B200_bs8_step5000

## Resumen

Task_000759_FLOWER_B200_bs8_step5000 es un checkpoint de un modelo de visión-lenguaje-acción (VLA) para robótica, publicado en Hugging Face por el usuario Dongkkka (Dongyun Kim). Se trata de un ajuste fino de FLOWER VLA sobre el conjunto de datos LeRobot v3 correspondiente a la tarea 000759 del robot ROBOTIS SG2, un brazo con estado y acción de 22 dimensiones.

El punto de partida es el checkpoint público de FLOWER VLA entrenado sobre CALVIN (repositorio `intuitive-robots/flower_vla_calvin`, commit `acb32ee85719e51aa94139b184c64b1b29f11d33`), del que se conservan los pesos compatibles de Florence-2 y FLOWER. El ajuste fino se realizó sobre 98 episodios y 10.578 fotogramas capturados por tres cámaras (cabeza izquierda, muñeca izquierda y muñeca derecha), con un horizonte de acción de 10 pasos.

Su relevancia es deliberadamente acotada: es un checkpoint intermedio (paso 5.000 de 10.000), sin validación ni rollout durante el entrenamiento, sin licencia declarada y sin métricas de error publicadas todavía. El propio autor indica que el repositorio está pensado para evaluación offline e integración de inferencia controlada y que no autoriza la actuación sobre un robot real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) sobre backbone tipo Florence-2 con cabeza de acción de capas DiT (diffusion transformer) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se publica entrenamiento en BF16; no hay variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint completo de PyTorch Lightning (modelo, EMA, optimizador, scheduler y estado de paso global) |
| Autor | Dongkkka (Dongyun Kim) |
| Fecha de creación / actualización | 7 de octubre de 2026, según los metadatos del hub |
| Librería declarada | LeRobot |
| Pipeline | robotics |
| Tamaño del repositorio | 15,2 GB |
| Entradas | 3 cámaras (cabeza izquierda, muñeca izquierda, muñeca derecha) más estado de 22 dimensiones |
| Salidas | acción de 22 dimensiones, horizonte de acción 10 |
| Modelo base | `intuitive-robots/flower_vla_calvin` (commit `acb32ee85719e51aa94139b184c64b1b29f11d33`), checkpoint oficial de 360.000 pasos |
| Dataset de ajuste fino | ROBOTIS SG2, tarea 000759, LeRobot v3: 98 episodios y 10.578 fotogramas |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

FLOWER VLA es un modelo de visión-lenguaje-acción: combina percepción visual, comprensión de instrucciones en lenguaje y generación de acciones motoras. En este checkpoint se conservan los pesos compatibles de Florence-2 y FLOWER del modelo original, mientras que las cabezas de acción y propiocepción del SG2 —y las seis capas DiT ausentes del checkpoint público de 12 capas— se inicializan específicamente para este ajuste fino. La cabeza de acción sigue un esquema de difusión sobre transformer (DiT) que produce un chunk de acciones de 22 dimensiones con horizonte de 10 pasos. No se detalla en la información disponible el número de capas totales, la dimensión oculta ni el mecanismo de atención empleado.

El entrenamiento se ejecutó sobre una MIG 3g.90gb de una NVIDIA B200, en precisión mixta BF16, con batch size 8, optimizador AdamW y tasa de aprendizaje 2e-5, partiendo del checkpoint oficial de FLOWER de 360.000 pasos. El checkpoint publicado corresponde al paso 5.000 de un total de 10.000. La validación y el rollout sobre robot se desactivaron durante el entrenamiento, de modo que no hay métricas de error asociadas al proceso. No se documenta ningún proceso de RLHF, DPO ni ajuste por preferencias humanas.

## Capacidades

- Generación de acciones motoras para un brazo robótico ROBOTIS SG2 a partir de observaciones visuales y estado proprioceptivo de 22 dimensiones.
- Percepción multimodal con tres flujos de cámara simultáneos (cabeza izquierda, muñeca izquierda, muñeca derecha).
- Action chunking: emite bloques de 10 acciones por inferencia, lo que reduce la frecuencia de cómputo necesaria para el control.
- Condicionamiento por lenguaje heredado del backbone Florence-2, aunque no se documenta el alcance de las instrucciones admitidas en este ajuste fino.
- Especialización en una única tarea del dataset ROBOTIS SG2 (tarea 000759); no se documenta generalización a otras tareas.
- Soporte de tool calling o function calling: no documentado.
- Soporte de agentes o razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles.
- Modos especiales (thinking, audio, generación de texto general): no documentados para este checkpoint.

## Casos de uso

- Evaluación offline de políticas VLA: el checkpoint está pensado explícitamente para evaluación offline con un split de validación fijo del 5 % (semilla 242), lo que permite medir el error absoluto medio de las acciones predichas antes de considerar cualquier despliegue.
- Ajuste fino continuado sobre el robot SG2: al conservar los pesos compatibles de Florence-2 y FLOWER e inicializar las cabezas del SG2, sirve como punto de partida para reentrenar con más episodios de la misma tarea y mejorar la cobertura de estados.
- Comparación de checkpoints dentro de una misma tarea: al ser el paso 5.000 de 10.000, permite estudiar la curva de aprendizaje de la política frente al checkpoint final y decidir en qué punto conviene detener el entrenamiento.
- Investigación en action chunking con cabezas de difusión: el horizonte de 10 acciones y la presencia de capas DiT lo convierten en un banco de pruebas para analizar cómo afecta el tamaño del chunk a la estabilidad del control.
- Reproducción de líneas base en robótica manipulativa: útil para comparar arquitecturas VLA alternativas sobre exactamente el mismo conjunto de datos y la misma configuración de cámaras.
- Destilado o generación de datos de acción: las predicciones del modelo sobre los 10.578 fotogramas pueden emplearse como pseudoetiquetas para entrenar políticas más ligeras destinadas a hardware con menos recursos.
- Validación en simulador antes de pruebas físicas: dado que el autor no autoriza la actuación sobre robot, el uso natural es integrar la política en un entorno simulado que replique la cinemática del SG2 y la disposición de las tres cámaras.
- Auditoría de robustez visual: con tres vistas simultáneas, permite estudiar la degradación de la política ante cambios de iluminación, oclusiones o fallos de una cámara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que el error absoluto medio (MAE) offline se añadirá una vez descargado el checkpoint y evaluado con el split de validación fijo (5 %, semilla 242). Tampoco se reportan métricas de éxito en robot, ya que el rollout se desactivó durante el entrenamiento.

## Requisitos de hardware

- No se han publicado requisitos de hardware ni cifras de latencia o throughput.
- Cifra conocida del entrenamiento: NVIDIA B200 con partición MIG 3g.90gb, precisión mixta BF16, batch size 8. Esto corresponde al proceso de ajuste fino, no a la inferencia.
- Estimación orientativa de VRAM (no publicada por el autor): el repositorio de 15,2 GB contiene pesos, copia EMA, momentos del optimizador AdamW y estado del scheduler, lo que sitúa el modelo en el orden de magnitud de los 1.000 millones de parámetros. En inferencia BF16, el peso de los parámetros rondaría los 2 GB, y el consumo total con activaciones y búferes de imagen probablemente se mantenga bastante por debajo de los 24 GB. Trátese como estimación, no como dato verificado.
- Encaje en GPU de consumo: por esa estimación, cabría en tarjetas de 12 GB o más (por ejemplo, RTX 3060 de 12 GB o RTX 4090 de 24 GB), aunque no hay confirmación oficial.
- Formato de carga: al ser un checkpoint de PyTorch Lightning, requiere PyTorch y la librería LeRobot, y la extracción del `state_dict` del modelo a partir del fichero completo (que incluye EMA, optimizador y scheduler).
- Opciones de despliegue: no se documenta soporte para vLLM, TGI, llama.cpp u Ollama; al tratarse de una política robótica y no de un modelo de lenguaje generativo, estos servidores no son directamente aplicables y no se publican pesos en GGUF.
- Latencia y throughput: no disponibles. El horizonte de acción de 10 implica que la frecuencia de control efectiva depende de la latencia de una inferencia completa, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Task_000759_FLOWER_B200_bs8_step5000 | no disponible | no disponible | no disponible | Hugging Face, 0 descargas, 0 likes | Ajuste fino sobre ROBOTIS SG2; paso 5.000 de 10.000; sin validación |
| intuitive-robots/flower_vla_calvin (origen) | no disponible | no disponible | no disponible | Hugging Face | Checkpoint oficial de 360.000 pasos sobre CALVIN; base de este ajuste |
| Otros VLA abiertos de la misma categoría (OpenVLA, pi0, GR00T N1, entre otros) | no disponible | no disponible | no disponible | no disponible | La información proporcionada no incluye datos de estos modelos, por lo que no se puede establecer una comparación numérica |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial ni para redistribución; conviene contactar con el autor antes de cualquier uso productivo.
- Checkpoint intermedio: corresponde al paso 5.000 de 10.000, por lo que no representa el estado final del entrenamiento y su rendimiento puede ser inferior al del modelo completado.
- Ausencia de validación: la validación y el rollout se desactivaron durante el entrenamiento, así que no existe ninguna métrica que respalde la calidad de las acciones generadas.
- Restricción explícita de actuación: el autor indica que el repositorio no autoriza la actuación sobre un robot real; su uso previsto es la evaluación offline y la integración de inferencia controlada.
- Dataset muy reducido: 98 episodios y 10.578 fotogramas son insuficientes para una cobertura amplia de estados, con riesgo de sobreajuste y de degradación ante situaciones no representadas.
- Especialización estrecha: el modelo está ajustado a una única tarea del ROBOTIS SG2; no hay evidencia de transferencia a otras tareas, robots o morfologías.
- Dependencia del hardware de origen: estado y acción son de 22 dimensiones y las cámaras esperadas son tres, con posiciones concretas (cabeza izquierda, muñeca izquierda, muñeca derecha); otra configuración requeriría adaptaciones.
- Sesgos: no documentados. Hereda los sesgos y la distribución de los datos de Florence-2 y del dataset de CALVIN, además de los propios del dataset SG2 de la tarea 000759.
- Riesgo de alucinación: no se han evaluado comportamientos anómalos en la generación de acciones, pero una política entrenada con datos escasos puede producir trayectorias fuera de distribución.
- Idiomas: no se especifica qué idiomas de instrucción admite el ajuste fino.
- Madurez: 0 descargas y 0 likes, sin revisión por parte de la comunidad ni resultados reproducibles publicados.
- Formato poco práctico para producción: el checkpoint de PyTorch Lightning incluye estado del optimizador y EMA, por lo que requiere conversión previa y no se distribuye en safetensors ni en formatos listos para servidores de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dongkkka/Task_000759_FLOWER_B200_bs8_step5000
- Modelo base referenciado en la model card: https://huggingface.co/intuitive-robots/flower_vla_calvin
- Perfil del autor (resultado de la búsqueda web): https://huggingface.co/Dongkkka
- Librería declarada en la model card (LeRobot): https://github.com/huggingface/lerobot

Nota: el resto de resultados devueltos por la búsqueda web (páginas genéricas del hub, asistentes de propósito general y herramientas de terceros) no aportan documentación técnica sobre este modelo y se han omitido.
