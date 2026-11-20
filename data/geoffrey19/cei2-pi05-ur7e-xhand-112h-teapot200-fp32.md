# Geoffrey19/cei2-pi05-ur7e-xhand-112h-teapot200-fp32

## Resumen
`cei2-pi05-ur7e-xhand-112h-teapot200-fp32` es una política robótica de tipo vision-language-action (VLA) desarrollada por Geoffrey19, derivada de pi05 (Physical Intelligence) y afinada completamente sobre demostraciones reales de un brazo UR7e con mano XHand para la tarea de verter té. No es un modelo de lenguaje generalista: es un policy de imitación que recibe una imagen RGB, un vector de 18 posiciones articulares y un prompt textual, y devuelve 16 pasos de acciones articulares absolutas. Su relevancia radica en que documenta un pipeline completo de mid-training sobre DROID retargetizado y posterior fine-tuning real, con artefactos reproducibles (config de openpi, normalización y orden articular).

El checkpoint parte del mid-training `cei2_pi05_ur7e_xhand_absq` (step 50.000), entrenado sobre 112 h de demostraciones DROID retargetizadas a UR7e + XHand (34.345 episodios), y se afina durante 20.000 pasos sobre 200 episodios reales de vertido de té (43.115 frames a 15 Hz). El modelo tiene 3.616.757.520 parámetros en float32 (812 tensores) y un tamaño de repositorio de 14,5 GB. La licencia es Apache 2.0.

Es un modelo de nicho, con 0 descargas y 0 likes en el momento de la ficha, pensado para investigación en manipulación robótica y para reproducir experimentos de transferencia sim-a-real, no para despliegues generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi05 (vision-language-action, flow matching; no se detalla la topología interna en la información disponible) |
| Parametros totales | 3.616.757.520 (812 tensores) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | no disponible (prompt de tarea en inglés en el ejemplo de uso) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors, float32); metadatos en metadata.pt |

## Arquitectura y entrenamiento
El modelo es una política pi05, es decir, un VLA con objetivo de flow matching que predice chunks de 16 acciones de 18 dimensiones (posiciones articulares absolutas). La entrada combina una cámara RGB exterior de 640×480, un estado de 18 posiciones articulares medidas en radianes y un prompt de tarea. La normalización se realiza por cuantiles sobre el conjunto de entrenamiento (q01/q99 mapeados a −1/+1), con estadísticos en `assets/teapot200/norm_stats.json`. No se aplica reordenación articular: el orden grabado coincide con el del modelo `ur7e_xhand` de CEI.

El fine-tuning se ejecutó 20.000 pasos con batch 32 en una GPU, learning rate pico 2e-5 tras 500 pasos de warmup y decaimiento coseno hasta 1e-6, pesos maestros y estado del optimizador en float32 con autocast bfloat16 y sin EMA. Los datos son 200 episodios teleoperados (43.115 frames a 15 Hz, 51–743 frames por episodio, media de 14,4 s), con una sola cámara exterior; el estado son 18 posiciones medidas y la acción son las 18 posiciones comandadas (IK del TCP y retargeting de la mano), con una diferencia media de 1,5° entre comando de mano y siguiente posición medida. Se usaron los 200 episodios para entrenamiento, sin split de validación, y no se evaluó el éxito de la tarea (`task_outcome: not_assessed`).

La pérdida de entrenamiento (objetivo de flow matching) bajó de 0,1009 (pasos 0–100) a 0,0022 (pasos 19.000–20.000) en esta ejecución, frente a 0,1118 y 0,0025 en la ejecución desde el checkpoint base. El autor advierte que estos valores son ajustes a los episodios de entrenamiento y no medidas de calidad de la política.

## Capacidades
- Generación de acciones robóticas: produce chunks de 16 pasos de 18 posiciones articulares absolutas para un UR7e (6 articulaciones) con XHand (12 articulaciones).
- Condicionamiento multimodal: integra imagen RGB exterior, estado articular medido y prompt textual de tarea.
- Control de mano antropomórfica de 12 articulaciones (pulgar, índice, medio, anular y meñique).
- Ejecución de una tarea específica de manipulación: coger una tetera y verter té en una taza.
- No se documentan capacidades de tool calling, agentes, multi-step reasoning genérico, visión general, audio ni modo thinking.
- Capacidades multilingües: no disponible; el prompt de ejemplo está en inglés.

## Casos de uso
- Reproducción de experimentos de VLA en manipulación: sirve como checkpoint de referencia para comparar recetas de fine-tuning desde base pi05 frente a mid-training CEI, con la misma configuración y datos.
- Investigación en transferencia sim-a-real: permite estudiar cómo un mid-training sobre DROID retargetizado (112 h, 34.345 episodios) afecta al fine-tuning con 200 episodios reales de UR7e + XHand.
- Benchmarking de políticas de imitación: al existir checkpoints GR00T N1.7 entrenados con los mismos datos (40.000 pasos), se puede comparar pi05 frente a GR00T en la misma tarea y hardware.
- Prototipado de control articular absoluto: útil para validar pipelines que comandaan posiciones articulares en radianes con normalización por cuantiles y chunks de 16 pasos.
- Estudio de retargeting de mano: el orden articular documentado y los límites verificados permiten analizar el mapeo de 12 articulaciones de XHand en tareas de precisión como verter líquido.
- Docencia y formación en robótica: como ejemplo completo de artefactos reproducibles (config de openpi, norm_stats, joint_order.json, metadata.pt) para enseñar el ciclo completo de entrenamiento y despliegue de una política.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no hay split de validación ni evaluación de éxito de tarea (`task_outcome: not_assessed`), y que las pérdidas de entrenamiento no son medidas de calidad de la política.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial; con 3,62 B parámetros en float32, los pesos ocupan aproximadamente 14,5 GB, por lo que se necesita al menos esa cantidad más overhead de activaciones e imagen.
- GPU recomendadas: no disponible; el entrenamiento se realizó en una sola GPU con batch 32, sin especificar modelo.
- Cabe en GPU consumer: no confirmado; por tamaño de pesos, sería ajustado en tarjetas de 16 GB y requeriría cuantización no documentada para 12 GB o menos.
- Opciones de despliegue: openpi en el commit `215abfb` con el parche PyTorch `transformers_replace` instalado, más el config `cei2_pi05_teapot200_absq` registrado como indica la model card. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cei2-pi05-ur7e-xhand-112h-teapot200-fp32 | 3,62 B | no disponible | Vertido de té UR7e + XHand | Apache 2.0 | Hugging Face (0 descargas) |
| cei2-pi05-base-teapot200-fp32 | no disponible | no disponible | Misma tarea desde base pi05 | no disponible | Hugging Face |
| cei2-groot-n17-base-teapot200-40k | no disponible | no disponible | Misma tarea con GR00T N1.7 | no disponible | Hugging Face |
| cei2-groot-n17-ur7e-xhand-112h-teapot200-40k | no disponible | no disponible | Misma tarea con GR00T N1.7 desde mid-training | no disponible | Hugging Face |

## Limitaciones y advertencias
- Entrenado con los 200 episodios disponibles y sin split de validación: no hay evaluación de generalización ni de éxito de tarea.
- El éxito de la tarea no fue evaluado (`task_outcome: not_assessed`), por lo que no hay evidencia reportada de que la política complete el vertido.
- Una sola cámara exterior de 640×480 y una única tarea: no se documenta robustez ante cambios de iluminación, posición de objetos o escenas distintas.
- Dependencia estricta de la configuración: hay que usar `assets/teapot200/norm_stats.json` a través del config `cei2_pi05_teapot200_absq`; los estadísticos del dataset original no se usaron.
- Orden articular fijo y sin reordenación: cualquier desviación del orden `ur_joint_0`…`xhand_joint_11` invalida las acciones.
- Requiere openpi en el commit `215abfb` con el parche `transformers_replace`; no se garantiza compatibilidad con otras versiones.
- Pesos en float32 sin cuantizaciones documentadas: el despliegue en hardware limitado exige trabajo adicional no descrito.
- No se incluye el estado del optimizador (26 GB), por lo que no se puede reanudar el entrenamiento tal cual.
- Riesgo de alucinación en el sentido de acciones plausibles pero incorrectas: al ser una política de imitación sin verificación de éxito, puede producir comandos articulares que no completen la tarea.
- Sesgos: no documentados; al entrenarse solo con demostraciones teleoperadas de una tarea concreta, hereda las distribuciones y limitaciones de esos datos.
- Licencia Apache 2.0: permite uso comercial, pero no hay garantías ni evaluación de seguridad para entornos reales.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Geoffrey19/cei2-pi05-ur7e-xhand-112h-teapot200-fp32
- Checkpoint base pi05 para la misma tarea: https://huggingface.co/Geoffrey19/cei2-pi05-base-teapot200-fp32
- GR00T N1.7 desde base: https://huggingface.co/Geoffrey19/cei2-groot-n17-base-teapot200-40k
- GR00T N1.7 desde mid-training: https://huggingface.co/Geoffrey19/cei2-groot-n17-ur7e-xhand-112h-teapot200-40k
- Repositorio openpi: https://github.com/Physical-Intelligence/openpi
- Dataset DROID: https://droid-dataset.github.io/
