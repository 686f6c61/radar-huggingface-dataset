# Gserts/openpi-pi05-base-lemon-edited-expert-lora32-20k

## Resumen

El modelo `Gserts/openpi-pi05-base-lemon-edited-expert-lora32-20k` es un ajuste fino del checkpoint oficial `pi05_base` del framework OpenPI, orientado a control robótico. Lo desarrolla el usuario Gserts y parte de la arquitectura pi05, que combina un codificador visual y un backbone de lenguaje (VLM) con un módulo experto en acciones. En este ajuste, el VLM y el codificador visual permanecen congelados, y solo se entrena un adaptador LoRA de rango 32 sobre el experto en acciones, junto con las proyecciones de entrada/salida de acciones y las capas temporales.

El modelo resuelve una tarea concreta de manipulación robótica: predecir seis acciones articulares absolutas de un brazo SO101 (tipo pick-and-place) a partir de dos cámaras RGB (frontal y de muñeca). Se entrenó durante 20.000 actualizaciones sobre el dataset `Gserts/pick_place_lemon_edited_20261101_165328`, con precisión BF16 y un pico de learning rate de 2,5e-5.

Es relevante porque ejemplifica el patrón de bajo coste computacional para adaptar políticas robóticas generalistas a tareas específicas: al congelar el VLM y entrenar solo un LoRA sobre el experto en acciones, se reduce drásticamente el número de parámetros entrenables y el coste de ajuste, manteniendo el checkpoint en formato nativo de OpenPI (JAX/Orbax). El repositorio ocupa 5,3 GB y se distribuye con licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | pi05 (VLM congelado + experto en acciones con LoRA) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (entrenamiento en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint nativo OpenPI JAX/Orbax (no es adaptador PEFT de LeRobot) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint oficial `pi05_base` y aplica un ajuste fino selectivo. El codificador visual y el backbone de lenguaje del VLM están congelados y no se instala ningún LoRA sobre el VLM. En el experto en acciones, los pesos base también están congelados; solo se optimizan el LoRA de atención/FFN (rango 32, alpha 32) y las capas `action_in_proj`, `action_out_proj`, `time_mlp_in` y `time_mlp_out`.

El entrenamiento se realizó durante 20.000 actualizaciones con batch 32, semilla 42, BF16, pico de LR 2,5e-5, warmup de 1.000 pasos y decaimiento coseno con `decay_steps` 30.000 y LR final 2,5e-6. Se usó AdamW con `weight_decay` 1e-10, recorte de gradiente 1.0 y sin EMA. Los checkpoints se guardan cada 10.000 actualizaciones y al finalizar; el directorio final se etiqueta como 19999 por el esquema de guardado basado en cero del bucle oficial. Las estadísticas de normalización se calculan con `compute_norm_stats.py` sobre el dataset y se empaquetan en `assets/.../norm_stats.json`.

En cuanto a la interfaz de entrada/salida: dos cámaras RGB se mapean a `base_0_rgb` (frontal) y `left_wrist_0_rgb` (muñeca); la cámara de muñeca derecha no usada queda enmascarada. El modelo predice seis acciones articulares absolutas de SO101 en fragmentos de 50, con dimensión interna de acción rellenada a 32.

## Capacidades

- Predicción de acciones robóticas: genera seis acciones articulares absolutas de un brazo SO101 en chunks de 50 pasos.
- Percepción visual multi-cámara: consume dos flujos RGB (frontal y muñeca) y enmascara la tercera cámara no usada.
- Control de manipulación tipo pick-and-place: entrenado específicamente para la tarea del dataset `pick_place_lemon_edited_20261101_165328`.
- Ajuste eficiente mediante LoRA: solo se entrena un adaptador de rango 32 sobre el experto en acciones, con el VLM congelado.
- Integración con OpenPI: compatible con el ecosistema JAX/Orbax del framework, incluyendo estadísticas de normalización empaquetadas.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo, visión general, audio ni modo thinking.

## Casos de uso

- Manipulación pick-and-place con brazo SO101: el modelo predice las seis articulaciones absolutas para recoger y colocar objetos, adecuado porque fue entrenado exactamente sobre esa tarea y ese robot.
- Prototipado rápido de políticas robóticas: al congelar el VLM y entrenar solo un LoRA de rango 32, permite iterar sobre una tarea nueva con coste computacional reducido en comparación con un ajuste completo.
- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible (semilla 42, hiperparámetros documentados) para estudiar el efecto del ajuste selectivo del experto en acciones.
- Despliegue en entornos de laboratorio con dos cámaras: la configuración frontal + muñeca y el enmascaramiento de la tercera cámara simplifican el hardware necesario.
- Evaluación de adaptadores LoRA en robótica: útil para comparar el rendimiento de un LoRA de rango 32 frente a ajustes completos del experto en acciones.
- Integración en pipelines OpenPI/JAX: el checkpoint nativo Orbax y las estadísticas de normalización empaquetadas facilitan su carga en flujos de evaluación existentes del framework.
- Reentrenamiento sobre datasets propios: el manifiesto `training_manifest.json` y la integración en `openpi_project` permiten reproducir o extender el ajuste con otros datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio pesa 5,3 GB y el entrenamiento se realizó en BF16.
- GPU recomendadas: no disponible. El framework OpenPI/JAX sugiere GPUs con soporte BF16, pero no se especifican modelos concretos.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: checkpoint nativo OpenPI JAX/Orbax; no es un adaptador PEFT de LeRobot, por lo que no se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gserts/openpi-pi05-base-lemon-edited-expert-lora32-20k | no disponible | no disponible | Manipulación SO101 (pick-and-place) | Apache 2.0 | HuggingFace (0 descargas) |
| pi05_base (oficial OpenPI) | no disponible | no disponible | Política robótica generalista | no disponible en la información | Checkpoint base del que deriva este modelo |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de `pi05_base` en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Especialización estrecha: entrenado únicamente para la tarea pick-and-place del dataset `pick_place_lemon_edited_20261101_165328`; no se espera generalización a otras tareas sin reentrenamiento.
- Dependencia de hardware concreto: asume un brazo SO101 con seis articulaciones y una configuración de dos cámaras RGB (frontal y muñeca); la cámara derecha está enmascarada.
- Sin datos de benchmarks: no hay métricas publicadas de éxito, precisión ni robustez, lo que impide evaluar su rendimiento frente a alternativas.
- Riesgo de sobreajuste al dataset: 20.000 actualizaciones sobre un único dataset editado pueden producir un comportamiento frágil ante variaciones de iluminación, objetos o posiciones no vistas.
- Sesgos: no documentados; al ser un modelo robótico, los sesgos relevantes serían de distribución de datos (objetos, entornos y trayectorias del dataset), no lingüísticos.
- Alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de predicciones de acción incorrectas o inseguras fuera de la distribución de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las licencias del checkpoint base `pi05_base` y de los datos de entrenamiento antes de un despliegue en producción.
- Formato no estándar: al ser un checkpoint nativo OpenPI JAX/Orbax y no un adaptador PEFT de LeRobot, requiere el stack de OpenPI para su carga y no es directamente portable a otras herramientas.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/Gserts/openpi-pi05-base-lemon-edited-expert-lora32-20k
- Dataset de entrenamiento: https://huggingface.co/datasets/Gserts/pick_place_lemon_edited_20261101_165328
- Framework OpenPI (referenciado en la model card): no disponible enlace directo en la información proporcionada
- Manifiesto de entrenamiento (`training_manifest.json`) e integración (`openpi_project`): referenciados en la model card, sin URL directa en la información disponible
