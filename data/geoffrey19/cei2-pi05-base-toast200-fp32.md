# Geoffrey19/cei2-pi05-base-toast200-fp32

## Resumen

`cei2-pi05-base-toast200-fp32` es una política robótica de tipo vision-language-action (VLA) publicada por el usuario Geoffrey19 en Hugging Face. Se trata de un fine-tuning completo del modelo base `pi05` del proyecto openpi de Physical Intelligence, entrenado sobre 200 episodios de demostraciones teleoperadas reales con un brazo Franka FR3 y una mano Ruiyan. El modelo resuelve una tarea concreta de manipulación: sacar una rebanada de pan de una tostadora y colocarla en un cuenco sobre la mesa.

La relevancia del modelo es doble. Por un lado, demuestra el flujo de trabajo de post-entrenamiento de pi05 sobre hardware real y datos propios, algo poco frecuente en publicaciones abiertas de VLA. Por otro, documenta con inusual honestidad las limitaciones del conjunto de datos: ausencia de estado medido, falta de partición de validación, ausencia de evaluación de éxito y un vector de acciones de 22 dimensiones que no coincide con el conjunto de articulaciones del modelo robótico CEI `fr3v2_ruihand`.

El modelo tiene 3.616.757.520 parámetros en precisión float32 (812 tensores, 14,5 GB de repositorio) y se distribuye bajo licencia Apache 2.0. No se han publicado resultados de benchmarks ni evaluaciones de tasa de éxito en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi05 (vision-language-action de openpi), transformer con flow matching para generación de acciones |
| Parametros totales | 3.616.757.520 (812 tensores) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; pesos publicados en float32 |
| Idiomas soportados | no disponible (el prompt de tarea está en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) más `metadata.pt`, `norm_stats.json`, `joint_order.json` y `train_config.json` |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `pi05_base` de openpi, configurado como `cei2_pi05_toast200_absq` en el repositorio CEI-2.0. Predice trozos de 16 pasos de acciones absolutas de 22 dimensiones mediante el objetivo de flow matching propio de pi05. La entrada es una única cámara RGB exterior de 640×480 y un prompt de texto; no se tokeniza estado (`discrete_state_input=False`) y se suministra un vector de estado todo ceros, ya que las grabaciones no contienen posiciones articulares medidas.

El entrenamiento usó 200 episodios (40.817 fotogramas a 15 Hz, entre 116 y 393 fotogramas por episodio), sin partición de validación. Se realizaron 20.000 pasos con batch 32 en 4 GPU (8 por GPU), learning rate pico de 2e-5 tras 500 pasos de calentamiento con decaimiento coseno hasta 1e-6, pesos maestros y estado del optimizador en float32 con autocast bfloat16 y sin EMA. La pérdida media de entrenamiento bajó de 0,3130 en los pasos 0–100 a 0,0034 en los pasos 19.000–20.000; son ajustes a los episodios de entrenamiento, no medidas de calidad de la política. La normalización usa cuantiles q01/q99 mapeados a −1/+1, calculados con `compute_norm_stats` de openpi sobre los mismos 200 episodios.

## Capacidades

- Generación de trayectorias de acción de 16 pasos y 22 dimensiones (7 articulaciones del FR3 y 15 valores de la mano Ruiyan) condicionadas por imagen RGB y prompt de texto.
- Control de brazo manipulador de 7 grados de libertad en coordenadas absolutas de articulación.
- Control de mano antropomórfica de cinco dedos con tres valores por dedo (los cuatro valores `side` de índice, medio, anular y meñique son siempre 0).
- Ejecución de una única tarea de manipulación: sacar pan de una tostadora y depositarlo en un cuenco.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni capacidades multilingües verificadas.
- No dispone de modo de pensamiento, visión general, audio ni otras modalidades que la imagen RGB de entrada.

## Casos de uso

- Reproducción de la tarea de toast en un banco de pruebas FR3 + Ruiyan: el modelo se puede desplegar con openpi en el commit `215abfb` y el config incluido para replicar la política entrenada y comparar con la variante GR00T N1.7 del mismo autor.
- Punto de partida para fine-tuning adicional: al ser un checkpoint completo en float32 y Apache 2.0, sirve como inicialización para nuevas tareas de manipulación con el mismo hardware, aunque requerirá recalcular estadísticas de normalización y, probablemente, reentrenar la cabeza de acciones.
- Estudio de flujos de post-entrenamiento de VLA: el repositorio incluye `train_config.json`, `metadata.pt` y el fichero de configuración exacto usado, lo que permite auditar hiperparámetros y reproducir el pipeline de openpi.
- Comparación de arquitecturas VLA: junto con `Geoffrey19/cei2-groot-n17-base-toast200-40k`, entrenado sobre los mismos datos, permite contrastar pi05 frente a GR00T N1.7 en igualdad de condiciones de datos.
- Docencia e investigación sobre imitación robótica: la documentación explícita de ausencia de estado, falta de split y desajuste del espacio de acciones lo convierte en un caso de estudio útil sobre los requisitos de datos en VLA.
- Integración en pipelines de evaluación de políticas: el formato de salida `out["actions"]` con forma (16, 22) facilita conectar el modelo a simuladores o a un bucle de control que aplique las acciones absolutas al robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay partición de validación y que el éxito de la tarea no se evaluó; solo se reporta la pérdida de entrenamiento por ventanas de pasos.

## Requisitos de hardware

- Pesos en float32 de 3,62 B parámetros: aproximadamente 14,5 GB solo para los pesos, más overhead de activaciones y del runtime de openpi.
- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño en float32, se necesita al menos una GPU con 24 GB para cargar los pesos con margen, y 40–80 GB para trabajar con comodidad en bfloat16 o con batch mayor.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB. Una RTX 4090 de 24 GB podría cargar los pesos en bfloat16, pero no se ha verificado en la información disponible.
- Despliegue: exclusivamente mediante openpi en el commit `215abfb` con el parche `transformers_replace` de PyTorch instalado y el config `cei2_pi05_toast200_absq` registrado. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no están orientados a políticas VLA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Geoffrey19/cei2-pi05-base-toast200-fp32` | 3,62 B | no disponible | Toast FR3 + Ruiyan | Apache 2.0 | Hugging Face |
| `Geoffrey19/cei2-groot-n17-base-toast200-40k` | no disponible en la información | no disponible | Toast FR3 + Ruiyan (40.000 pasos) | no disponible en la información | Hugging Face |
| `pi05_base` (openpi) | no disponible en la información | no disponible | Política VLA generalista | no disponible en la información | openpi (GitHub) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El conjunto de datos no contiene estado medido: el modelo recibe un vector de estado todo ceros, por lo que no puede condicionar la acción a la configuración actual del robot.
- No hay partición de validación ni evaluación de tasa de éxito; la pérdida de entrenamiento no mide calidad de política.
- El espacio de acciones de 22 dimensiones no coincide con el conjunto de articulaciones del modelo CEI `fr3v2_ruihand` (20 articulaciones de mano, 4 por dedo), por lo que no se puede conducir una política de mid-training CEI sin un mapeo explícito.
- Cuatro valores de la mano (índice, medio, anular y meñique `side`) son siempre 0 en los datos, lo que limita la expresividad de la mano aprendida.
- El modelo está entrenado para una única tarea y un único entorno; no generaliza a otras instrucciones ni a variaciones de cámara o iluminación no vistas.
- Riesgo de sobreajuste a los 200 episodios y de comportamiento errático fuera de la distribución de demostraciones.
- Sesgos conocidos: no documentados, pero al ser una política de imitación hereda los sesgos de las demostraciones teleoperadas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base `pi05` de openpi puede tener condiciones propias que conviene verificar antes de producción.
- Requiere una versión concreta de openpi y un parche de `transformers`; la reproducibilidad depende de mantener ese entorno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Geoffrey19/cei2-pi05-base-toast200-fp32
- Variante GR00T N1.7 del mismo autor: https://huggingface.co/Geoffrey19/cei2-groot-n17-base-toast200-40k
- Repositorio openpi: https://github.com/Physical-Intelligence/openpi
- Dataset referenciado: `zwx/toast_to_basin_franka_ruiyan_pi05_top200` (no se proporciona URL directa en la información disponible)
