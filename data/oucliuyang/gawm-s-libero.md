# oucliuyang/GAWM-S-LIBERO

## Resumen

GAWM-S para LIBERO es un modelo compacto de mundo-acción (world-action model) orientado a robótica de manipulación multi-tarea. Lo desarrolla el autor `oucliuyang` y se publica bajo licencia MIT. A diferencia de los enfoques dominantes en robótica basados en modelos de visión-lenguaje (VLM) o en generadores de vídeo, GAWM (Geometry-Aware World Model) prescinde de ambos: en su lugar, un predictor ligero pronostica las características de parche de un codificador DINOv3 ViT-S/16 congelado en dos horizontes futuros, y un decodificador de acciones regresiona trozos de acción (*action chunks*) a partir de los tokens actuales y pronosticados.

El modelo resuelve el problema del control robótico multi-tarea a partir de instrucciones en lenguaje natural, con entradas de cámaras de tercera persona y de muñeca a 256×256, un vector de estado de 8 dimensiones y una instrucción de tarea que selecciona un código de tarea almacenado en el checkpoint. La salida son 8 pasos de deltas de efector final de 6 dimensiones más un comando de pinza.

Es relevante ahora por su eficiencia: 38,1 M de parámetros totales (de los cuales solo 16,5 M están en este checkpoint, ya que el codificador de 21,6 M está congelado y se distribuye aparte) y una latencia de 7,1 ms por consulta de trozo de acción en una NVIDIA RTX PRO 5000 con bf16 y tamaño de lote 1. Con una política única para las cuatro suites de LIBERO, alcanza un 95,55 % de éxito medio sobre 2.000 episodios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World-action model: codificador DINOv3 ViT-S/16 congelado + adaptador, predictor de características futuras y decodificador de acciones |
| Parametros totales | 38,1 M (21,6 M del codificador DINOv3 congelado + 16,5 M del checkpoint publicado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada compuesta por imágenes, estado e instrucción) |
| Tipos de cuantizacion | no disponible (el autor solo documenta ejecución en bf16) |
| Idiomas soportados | no disponible (las instrucciones de tarea se mapean a códigos de tarea almacenados en el checkpoint) |
| Licencia | MIT (DINOv3 se distribuye aparte bajo la DINOv3 License de Meta) |
| Formato de pesos | safetensors (`checkpoints/GAWM-S-LIBERO.safetensors`), más `config.yaml`, `dataset_statistics.json` y `SHA256SUMS` |

## Arquitectura y entrenamiento

GAWM es un modelo de mundo-acción compacto que combina un codificador visual congelado con un predictor de dinámica en el espacio de características. El codificador es DINOv3 ViT-S/16 (21,6 M de parámetros), que no forma parte del repositorio y se descarga desde la distribución oficial de Meta en el primer uso. Sobre él se sitúan un adaptador, un predictor que pronostica las características de parche en dos horizontes futuros, un código de tarea y un decodificador de acciones; estos componentes suman 16,5 M de parámetros y constituyen el checkpoint publicado. El modelo no emplea ni un VLM ni un generador de vídeo.

Las entradas son cámaras de tercera persona y de muñeca a 256×256, un estado de 8 dimensiones y la instrucción de tarea, que selecciona el código de tarea correspondiente almacenado en el checkpoint. La salida son 8 pasos de deltas de efector final de 6 dimensiones y un comando de pinza. La evaluación reportada cubre las cuatro suites de LIBERO con una única política, los 50 estados iniciales de cada una de las 40 tareas (2.000 episodios) y semilla 7. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO; el paper aún no es público.

## Capacidades

- Control robótico de manipulación multi-tarea a partir de instrucciones de tarea, con una sola política para las cuatro suites de LIBERO (Spatial, Object, Goal y Long).
- Predicción de dinámica en el espacio de características: pronóstico de características de parche de DINOv3 en dos horizontes futuros.
- Regresión de trozos de acción de 8 pasos con deltas de efector final de 6 dimensiones y comando de pinza.
- Fusión de entradas multimodales: cámara de tercera persona, cámara de muñeca, estado propioceptivo de 8 dimensiones y código de tarea.
- Inferencia de baja latencia: 7,1 ms por consulta de trozo de acción (mediana de 200, lote 1, bf16, RTX PRO 5000).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso en lenguaje natural: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión general, audio: no disponible (la visión se limita a las cámaras del robot).

## Casos de uso

- Manipulación multi-tarea en un solo policy: desplegar una única política entrenada con GAWM-S para las cuatro suites de LIBERO evita mantener checkpoints separados por tipo de tarea y simplifica el mantenimiento en entornos de investigación.
- Evaluación comparativa de world-action models: el protocolo cerrado con 50 estados iniciales por tarea y semilla fija permite reproducir el 95,55 % de éxito medio y comparar contra otras políticas sobre el mismo benchmark.
- Investigación en representaciones visuales congeladas: al usar DINOv3 ViT-S/16 congelado, el modelo sirve para estudiar cuánto rendimiento se obtiene pronosticando características en lugar de generar píxeles o vídeo.
- Prototipado en robótica de bajo coste computacional: con 16,5 M de parámetros en el checkpoint y 7,1 ms por trozo de acción, es adecuado para bucles de control en tiempo real en laboratorio con una sola GPU.
- Control con instrucciones de tarea: el código de tarea almacenado en el checkpoint permite seleccionar el comportamiento deseado a partir de la instrucción, útil en demostraciones de manipulación guiada por lenguaje.
- Reproducibilidad y auditoría de checkpoints: los ficheros `SHA256SUMS` y `dataset_statistics.json` permiten verificar la integridad de los pesos y aplicar la normalización exacta de acciones y estados en pipelines propios.
- Base para investigación en predicción de dinámica: el predictor de características a dos horizontes puede reutilizarse o ablacionarse para estudiar el efecto del pronóstico en la calidad de las acciones.

## Benchmarks y rendimiento

Resultados reportados por el autor en LIBERO: una política para las cuatro suites, 50 estados iniciales de cada una de las 40 tareas (2.000 episodios), semilla 7.

| Suite | Tasa de exito (%) |
|---|---|
| Spatial | 96,2 |
| Object | 99,8 |
| Goal | 95,0 |
| Long | 91,2 |
| Media | 95,55 (1.911 / 2.000; intervalo del 95 % [94,6, 96,4]) |

No se han publicado en la información disponible resultados comparativos con otros modelos ni métricas adicionales (MMLU, HumanEval, GSM8K no aplican a este modelo).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint pesa 0,1 GB y el codificador DINOv3 ViT-S/16 añade 21,6 M de parámetros, por lo que el modelo completo es muy ligero y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: el autor reporta latencia sobre NVIDIA RTX PRO 5000; por tamaño, cualquier GPU con al menos unos pocos GB de VRAM debería ser suficiente, aunque no se documentan pruebas en otras tarjetas.
- Cabe en GPU de consumo: sí, por el reducido número de parámetros (38,1 M en total), aunque no se especifican modelos concretos ni cifras de VRAM medidas.
- Opciones de despliegue: el código oficial está en `github.com/gaoxiang12/gawm-public`; la evaluación se ejecuta con `scripts/run_libero_checkpoint_eval.py`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 7,1 ms por consulta de trozo de acción (mediana de 200; lote 1, bf16, RTX PRO 5000, desde entradas preprocesadas hasta el trozo de acción). El throughput no se detalla.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de otros modelos comparables (parámetros, contexto, rendimiento, licencia y disponibilidad) para establecer una comparativa rigurosa. Los resultados de LIBERO publicados por el autor no incluyen referencias a políticas alternativas.

| Modelo | Parametros | Contexto | Rendimiento LIBERO | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GAWM-S-LIBERO | 38,1 M (16,5 M en checkpoint) | no disponible | 95,55 % medio | MIT | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ámbito restringido a LIBERO: el modelo está entrenado y evaluado exclusivamente en las cuatro suites de LIBERO; no hay evidencia de generalización a otros entornos, robots o tareas.
- Dependencia de DINOv3: el codificador no se incluye en el repositorio y se distribuye bajo la DINOv3 License de Meta, con condiciones distintas de la licencia MIT del checkpoint; hay que revisarlas para uso comercial.
- Advertencia esperada al cargar: el autor indica que se registra un aviso por las claves `backbone.encoder.*` y `world_model.feature_decoder.*` ausentes; es el comportamiento previsto y no un error.
- Sin paper público: la información sobre datos de entrenamiento, composición del dataset y posibles etapas de ajuste (RLHF/DPO) no está disponible, lo que limita la evaluación de sesgos y robustez.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones incorrectas o inseguras ante estados o instrucciones fuera de distribución.
- Idiomas: no se documenta soporte multilingüe; la instrucción de tarea se resuelve mediante códigos de tarea predefinidos en el checkpoint.
- Reproducibilidad: los resultados dependen de la semilla y del protocolo de evaluación cerrada; no se han publicado intervalos para cada suite por separado.
- Uso en producción: no hay datos publicados sobre robustez ante cambios de iluminación, oclusiones o variaciones de cámara, ni sobre latencia en hardware distinto de la RTX PRO 5000.

## Enlaces

- HuggingFace: https://huggingface.co/oucliuyang/GAWM-S-LIBERO
- Código oficial: https://github.com/gaoxiang12/gawm-public
- Paper: no disponible (el autor indica que se enlazará cuando sea público)
- DINOv3 (Meta): no disponible en la información proporcionada
