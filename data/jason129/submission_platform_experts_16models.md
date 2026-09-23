# jason129/submission_platform_experts_16models

## Resumen

TartanIMU platform-expert ensemble es un conjunto de inferencia en PyTorch publicado por el usuario jason129 en Hugging Face para la estimación de velocidad a partir de señales de unidades de medida inercial (IMU) en el marco del reto TartanIMU. No se trata de un modelo de lenguaje ni de un checkpoint de Transformers: es un ensemble personalizado formado por 4 modelos base y 16 modelos expertos (4 expertos por cada una de las 4 plataformas: coche, perro, dron y humano), lo que suma 20 checkpoints, más un router de plataforma serializado con joblib. El repositorio ocupa 0,6 GB e incluye además la caché de características de Test utilizada en el envío histórico.

El problema que resuelve es una regresión sobre señales inerciales: predecir la velocidad de la plataforma a partir de ventanas de IMU. Un router entrenado estima la plataforma a partir de características resumen de la IMU y, cuando su confianza supera el umbral de plataforma, promedia los cuatro expertos correspondientes y los mezcla con la predicción base mediante la fórmula B + 0.5 * (E - B); si no supera el umbral, se usa únicamente el ensemble base. El paquete es autocontenido y verificable: incluye `infer.py`, manifiestos de integridad (`asset_manifest.json`, `SHA256SUMS`) y registros de procedencia y auditoría.

El envío histórico consta de 30.644 filas y un Public score reportado por el usuario de 0,26571, que no ha sido recalculado por este repositorio. La licencia declarada es Apache-2.0 para código y empaquetado, y los idiomas consignados en los metadatos son inglés y chino.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble personalizado de PyTorch: 4 checkpoints base + 16 checkpoints expertos (4 por plataforma) + router de plataforma en joblib; no es un Transformer |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (la entrada son ventanas de características IMU; el tamaño de ventana no se documenta en la información disponible) |
| Tipos de cuantizacion | no disponible (el envío histórico se generó en CUDA con BF16; no se documentan cuantizaciones tipo GGUF, INT8 o INT4) |
| Idiomas soportados | en, zh (idiomas declarados en la model card; el modelo procesa señales numéricas de IMU, no texto) |
| Licencia | Apache-2.0 (código y empaquetado); revisar los términos de los datasets o checkpoints upstream antes de redistribuir |
| Formato de pesos | Checkpoints de PyTorch y router en joblib; no es compatible con el widget de inferencia de Hugging Face |
| Plataformas objetivo | 0 = car, 1 = dog, 2 = drone, 3 = human |
| Pipeline declarado | other |
| Tamaño del repositorio | 0,6 GB |
| Librería | pytorch (Python 3.10+ recomendado) |
| Fecha de creación / actualización | 2026-09-23 / 2026-09-23 |

## Arquitectura y entrenamiento

La arquitectura no es un transformer ni un modelo de lenguaje, sino un ensemble de regresión compuesto por dos niveles. En el primer nivel hay cuatro checkpoints base que producen una predicción de velocidad. En el segundo nivel hay dieciséis checkpoints expertos, cuatro por cada plataforma (coche, perro, dron y humano). Un router guardado como `router.joblib` predice la plataforma a partir de características resumen de la IMU: si su confianza supera el umbral de plataforma, se promedian los cuatro expertos correspondientes y el resultado se mezcla con el ensemble base según B + 0.5 * (E - B); en caso contrario se devuelve solo la predicción base. El repositorio incluye la implementación mínima del modelo y de la inferencia por ventanas en `runtime/`, y documenta la receta completa en `METHOD.md`.

Respecto al entrenamiento, la información disponible indica que el proceso utilizó emparejamiento de distribución IMU sobre Test sin etiquetas (*unlabeled Test IMU distribution matching*). Según la propia model card, no se leyeron etiquetas de Test ni etiquetas de plataforma de Test, no se ajustó la normalización sobre Test y no se realizó entrenamiento supervisado sobre Test. Los checkpoints finales se entrenaron sobre el conjunto oficial Train+Val, por lo que no deben presentarse como resultados de generalización sobre datos no vistos. No se especifican en la información disponible el número de tokens o de muestras de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO (no aplicables a este tipo de modelo).

## Capacidades

- Regresión de velocidad a partir de ventanas de señal IMU, con salida numérica por ventana o por fila de envío.
- Clasificación implícita de plataforma mediante el router, sobre cuatro clases: coche, perro, dron y humano.
- Enrutado condicional: activa los expertos específicos de plataforma solo cuando la confianza del router supera el umbral configurado.
- Mezcla controlada de predicciones base y expertas mediante B + 0.5 * (E - B).
- Inferencia en CPU y en GPU (la CLI admite `--device cpu` y `--device cuda:0`).
- Reproducción del envío histórico con la opción `--frozen-base`, que conserva el CSV base y recalcula solo los expertos enrutados.
- Auditoría de resultados: cada salida genera un fichero auxiliar `.audit.json` con el dispositivo, el hash de la salida y la diferencia numérica respecto al envío histórico empaquetado.
- Verificación de integridad de los 20 checkpoints y de los assets antes de cargar cualquier peso.
- Generación de texto, razonamiento, código, matemáticas, visión, tool calling y uso como agente: no aplicable, el modelo no es un LLM ni procesa lenguaje natural.
- Capacidades multilingües de texto: no aplicable; los idiomas en y zh solo describen la documentación y los metadatos.

## Casos de uso

- Odometría inercial en robótica móvil: integración del ensemble en la pila de navegación de un robot terrestre para estimar velocidad a partir del IMU cuando la señal GNSS es intermitente o inexistente, aprovechando los expertos de la plataforma coche.
- Navegación en entornos GNSS-denied para drones: uso de los expertos de la plataforma dron para estimar velocidad en interiores o zonas urbanas densas, donde el posicionamiento satelital no es fiable.
- Seguimiento de animales con collares inerciales: los expertos de plataforma perro permiten estimar la velocidad de un animal a partir de IMU de bajo coste, un escenario habitual en estudios de comportamiento y telemetría de fauna.
- Dead reckoning peatonal: aplicación de los expertos de plataforma humano para estimar la velocidad de un peatón con sensores de smartphone o wearables, como entrada para sistemas de posicionamiento en interiores.
- Reproducción y auditoría de resultados de competición: ejecución de `python infer.py --device cuda:0 --output outputs/reproduced.csv` para regenerar el envío de 30.644 filas y comparar el hash y la diferencia numérica con el histórico mediante el sidecar `.audit.json`.
- Investigación en fusión de sensores: uso del ensemble como bloque de referencia frente a modelos de regresión individuales, aprovechando que la mezcla base-experto está documentada y es parametrizable.
- Validación de robustez entre plataformas: análisis del comportamiento del router y de los umbrales de confianza para estudiar cómo se degradan las predicciones cuando la plataforma no se identifica correctamente.
- Integración en pipelines de evaluación offline: el entrypoint `infer.py` con `--verify-only` y `--smoke` permite comprobar la integridad del paquete y hacer un forward real en CPU antes de lanzar una ejecución completa en GPU.

## Benchmarks y rendimiento

Los datos disponibles no son benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), sino métricas del reto TartanIMU. Se presentan tal como los documenta el repositorio, con su alcance explícito.

| Metrica | Valor | Alcance declarado |
|---|---|---|
| Public score del envío histórico | 0,26571 | Reporte histórico del usuario; no recalculado por este repositorio |
| Score (fold1, expertos entrenados por separado) | 0,3487334649 | holdout_evaluation_with_unlabeled_test_adaptation |
| Macro AVE (fold1) | 0,2695168333 | holdout_evaluation_with_unlabeled_test_adaptation |
| Macro ATE20 (fold1) | 1,0042230308 | holdout_evaluation_with_unlabeled_test_adaptation |
| Filas del envío histórico | 30.644 | Verificado con una re-inferencia completa en CPU |
| Diferencia absoluta máxima CPU vs. histórico CUDA/BF16 | 0,009473085 | La salida CPU no es byte-idéntica a la histórica |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; no se documentan requisitos de memoria en la model card.
- GPU recomendadas: no disponible. La CLI acepta `--device cuda:0`, y el envío histórico se generó en CUDA con BF16, pero no se nombran modelos concretos de GPU (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no disponible; no hay confirmación de que el ensemble quepa en una GPU de gama de consumo.
- CPU: verificada. Se ha ejecutado un smoke test real sobre características en CPU y una re-inferencia completa de Test en CPU que produjo 30.644 filas.
- Almacenamiento: el repositorio completo ocupa 0,6 GB, incluyendo los 20 checkpoints, el router y la caché de características de Test.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de ensemble. El despliegue previsto es el entrypoint propio `infer.py` con las dependencias fijadas en `requirements.txt` y Python 3.10+.
- Latencia y throughput: no disponibles.
- Nota de reproducibilidad: no se completó una re-inferencia completa en GPU en la máquina de origen porque el driver de NVIDIA no estaba disponible; los resultados pueden variar según las versiones de PyTorch, CUDA, BF16 y hardware.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (estimación de velocidad con IMU en el reto TartanIMU), ni referencia a alternativas base, papers o repositorios con los que contrastar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso, y el widget de inferencia de Hugging Face no puede ejecutarlo automáticamente.
- El Public score de 0,26571 es un reporte histórico del usuario y no ha sido recalculado por el repositorio; no debe tratarse como una métrica verificada de forma independiente.
- Los checkpoints finales se entrenaron sobre el conjunto oficial Train+Val y no deben presentarse como resultados de generalización sobre datos no vistos.
- El entrenamiento empleó emparejamiento de distribución IMU sobre Test sin etiquetas; aunque la model card afirma que no se leyeron etiquetas ni verdad de Test, conviene revisar `provenance/` antes de reutilizar el modelo en otros contextos.
- Riesgo de degradación por enrutado: si el router clasifica mal la plataforma o no supera el umbral de confianza, se usará el ensemble base en lugar de los expertos, con posible pérdida de precisión.
- Variabilidad numérica: la salida en CPU no es byte-idéntica a la histórica en CUDA/BF16, con una diferencia absoluta máxima de 0,009473085. No se completó una verificación completa en GPU en la máquina de origen, por lo que la reproducibilidad exacta en GPU no está confirmada.
- Alcance de las métricas: el fold1 reportado corresponde a expertos entrenados por separado bajo `holdout_evaluation_with_unlabeled_test_adaptation`, un alcance distinto del de los checkpoints finales.
- Idiomas declarados (en, zh): solo afectan a la documentación y a los metadatos; el modelo procesa señales numéricas y no tiene capacidades lingüísticas.
- Licencia: el código y el empaquetado son Apache-2.0, pero la model card recomienda revisar los términos de los datasets o checkpoints upstream antes de redistribuir los artefactos incluidos.
- Sesgos conocidos: no disponible. No se documentan análisis de sesgo ni de equidad.
- Riesgo de alucinación: no aplicable en el sentido de generación de texto; el riesgo equivalente es el error de regresión y una clasificación de plataforma incorrecta.
- Restricciones de contexto o longitud de entrada: no se documenta el tamaño de ventana de IMU ni los límites de la caché de características.

## Enlaces

- Hugging Face: https://huggingface.co/jason129/submission_platform_experts_16models
- Repositorio interno relevante: `METHOD.md` (arquitectura, receta de entrenamiento, enrutado, mezcla y alcance de evaluación), `infer.py` (verificación, smoke test y reproducción completa), `provenance/` (configuración de entrenamiento, registros de auditoría y análisis de enrutado), `asset_manifest.json` y `SHA256SUMS` (integridad de assets y paquete).
- Papers, blogs, repositorios adicionales y demos: no disponibles en la información proporcionada.
