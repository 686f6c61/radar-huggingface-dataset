# seungkukim/openwam-alpha-robodojo-clean48-step2000

## Resumen

OpenWAM-Alpha RoboDojo clean48 step2000 es un ajuste fino (post-training) del modelo base OpenWAM/OpenWAM-Alpha-Sim-RoboDojo, desarrollado por el usuario seungkukim. Se trata de un world-action model orientado a robótica que combina un backbone de vídeo (Wan2.2-TI2V-5B, según la configuración de carga indicada en la model card) con un cabezal de acción, y que ha sido reentrenado sobre rollouts limpios generados por agentes LLM en tres tareas del entorno RoboDojo: `play_tic_tac_toe`, `insert_tubes` y `pour_balls_into_vase`.

El modelo resuelve el problema de adaptar un world-action model preentrenado a un subconjunto reducido de tareas con datos de alta calidad (144 episodios, 58.308 frames), manteniendo intactos el layout de tensores, el tokenizador y las estadísticas de normalización del modelo base. Esto lo convierte en un reemplazo directo (drop-in replacement) del checkpoint original: solo cambian los pesos.

Es relevante ahora porque ejemplifica el flujo de post-training modular que propone la familia OpenWAM: reutilizar la infraestructura de despliegue y normalización del modelo base y limitar el coste de adaptación a un entrenamiento corto (5.000 pasos, batch global 64, 4 GPU) sobre datos filtrados. La ficha se basa exclusivamente en la información publicada en el repositorio de Hugging Face y en la model card; los datos no presentes se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | World-action model (OpenWAM) con backbone de vídeo Wan2.2-TI2V-5B y cabezal de acción; detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible explícitamente; repositorio de 24,8 GB con layout y nombres de tensor idénticos al modelo base, cargable mediante `openwam.deploy.model_loader.load_from_checkpoint_dir` |
| Librería | openwam |
| Pipeline | robotics |
| Modelo base | OpenWAM/OpenWAM-Alpha-Sim-RoboDojo |
| Tamaño del repositorio | 24,8 GB |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base OpenWAM-Alpha-Sim-RoboDojo, descrito en el paper OpenWAM (arXiv:2609.07398) como una exploración abierta y modular hacia el preentrenamiento sistemático de world-action models. El repositorio no redefine la arquitectura: mantiene el mismo layout, los mismos nombres de tensor y los mismos ficheros auxiliares, e incluye un backbone de vídeo cuyo `model_path` debe apuntarse a una copia local de Wan2.2-TI2V-5B en `config.yaml`. No se detallan en la información disponible el número de capas, la dimensión oculta ni el mecanismo exacto de integración entre el backbone de vídeo y el cabezal de acción.

El entrenamiento es un ajuste fino sobre 144 episodios (48 por tarea) y 58.308 frames del dataset `seungkukim/robodojo-clean-rollouts-openwam-hdf5-48ep`, con batch global de 64 (batch_size 16 × grad_accum 1 × 4 GPU), 5.000 pasos máximos, learning rate 1e-4 con scheduler coseno y `lr_min_ratio` 0.01, warmup del 10 % (500 pasos), ZeRO stage 2 y precisión mixta bf16, sin gradient checkpointing. La normalización es min-max y reutiliza sin cambios el `normalization_stats.npy` del modelo base (md5 `855296b406a1d16fbc92318564d6152d`), al igual que el directorio `tokenizer/`. No se menciona uso de RLHF ni DPO en esta fase; los datos de partida son rollouts generados por agentes LLM y filtrados por calidad ("clean").

## Capacidades

- Ejecución de políticas de acción para tareas robóticas de manipulación y juego en el simulador RoboDojo.
- Especialización en tres tareas concretas: `play_tic_tac_toe`, `insert_tubes` y `pour_balls_into_vase`.
- Modelado conjunto de vídeo y acción (world-action model): el backbone de vídeo Wan2.2-TI2V-5B proporciona representaciones espacio-temporales que alimentan el cabezal de acción.
- Carga directa mediante la API de OpenWAM (`load_from_checkpoint_dir`), sin cambios en el código de despliegue respecto al modelo base.
- Compatibilidad de formato con el modelo base: mismos nombres de tensor y ficheros auxiliares, lo que permite sustituir pesos sin reescribir pipelines.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso en lenguaje natural, visión general, audio ni modo "thinking".

## Casos de uso

- Evaluación comparativa de post-training: usar este checkpoint frente al modelo base OpenWAM-Alpha-Sim-RoboDojo para medir cuánto mejora el rendimiento en las tres tareas tras un ajuste corto con 48 episodios por tarea, manteniendo constantes normalización y tokenizador.
- Reproducción de experimentos de data curation: el par (checkpoint, dataset de rollouts limpios) permite aislar el efecto de filtrar datos por calidad frente a entrenar con el corpus RoboDojo completo.
- Punto de partida para nuevos ajustes: al ser un drop-in replacement, sirve como inicialización para fine-tunings posteriores en tareas adicionales de RoboDojo sin tener que reconstruir el pipeline de carga.
- Validación de infraestructura de despliegue: comprobar que un pipeline basado en `openwam.deploy.model_loader` y en el backbone Wan2.2-TI2V-5B funciona de extremo a extremo antes de invertir en entrenamientos largos.
- Investigación en manipulación simulada: probar políticas entrenadas con rollouts de agente LLM en tareas de inserción (`insert_tubes`) y vertido (`pour_balls_into_vase`), que requieren control fino de contacto y orientación.
- Docencia y divulgación: ejemplo compacto (24,8 GB de repositorio, 5.000 pasos, 4 GPU) de cómo se adapta un world-action model a un dominio reducido, útil para explicar el ciclo preentrenamiento → post-training → despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito por tarea, comparaciones con el modelo base ni métricas de simulación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 24,8 GB, pero no se especifica el desglose entre pesos del backbone de vídeo, cabezal de acción y ficheros auxiliares, ni la precisión de almacenamiento.
- GPU recomendadas: no disponible. El entrenamiento se realizó con 4 GPU (batch_size 16 por GPU, ZeRO stage 2, bf16), pero no se indica el modelo concreto.
- Compatibilidad con GPU de consumo: no disponible. Requiere además una copia local de Wan2.2-TI2V-5B, cuyo coste de memoria no se detalla en la información proporcionada.
- Opciones de despliegue: carga mediante la librería `openwam` (`openwam.deploy.model_loader.load_from_checkpoint_dir`) tras descargar el repositorio con `huggingface_hub.snapshot_download` y configurar `model.video_backbone.model_path` en `config.yaml`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| seungkukim/openwam-alpha-robodojo-clean48-step2000 | no disponible | no disponible | 5.000 pasos, 144 episodios, 3 tareas | Apache 2.0 | Hugging Face, 0 descargas |
| OpenWAM/OpenWAM-Alpha-Sim-RoboDojo (base) | no disponible | no disponible | 60.000 pasos, corpus RoboDojo | no disponible en esta ficha | Hugging Face |
| Otros world-action models de robótica | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación documentada es con el modelo base, del que este checkpoint hereda arquitectura, normalización y tokenizador y del que difiere únicamente en los pesos y en la configuración de entrenamiento (dataset limpio de 48 episodios por tarea, batch_size 16 frente a 4, max_steps 5.000 frente a 60.000, warmup 0.10 frente a 0.05). No se dispone de datos de rendimiento que permitan comparar con alternativas de la misma categoría.

## Limitaciones y advertencias

- Especialización estrecha: el ajuste cubre solo tres tareas de RoboDojo; no hay evidencia de generalización a otras tareas, entornos reales o dominios distintos del simulado.
- Sin métricas publicadas: no se han divulgado tasas de éxito ni comparaciones cuantitativas con el modelo base, por lo que no puede afirmarse que este checkpoint sea mejor que el original.
- Dependencia externa: requiere una copia local de Wan2.2-TI2V-5B y rutas válidas en `config.yaml`; las rutas del repositorio son placeholders (`/path/to/...`).
- Riesgo de sobreajuste: 144 episodios y 5.000 pasos sobre un modelo preentrenado con 60.000 pasos pueden producir un ajuste excesivo a las condiciones concretas de los rollouts limpios.
- Sesgos: no documentados. Al proceder de rollouts generados por agentes LLM, podría heredar sesgos de distribución de esas políticas, pero la información disponible no lo cuantifica.
- Alucinación: no aplica en el sentido de texto generativo; en robótica el riesgo equivalente es la ejecución de acciones no válidas, no evaluado en la model card.
- Idiomas: no disponibles; el modelo no está orientado a procesamiento de lenguaje natural.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del backbone Wan2.2-TI2V-5B antes de un despliegue comercial.
- Madurez: repositorio con 0 descargas y 0 likes, publicado y actualizado el 17 de noviembre de 2026; no hay evidencia de uso por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seungkukim/openwam-alpha-robodojo-clean48-step2000
- Modelo base: https://huggingface.co/OpenWAM/OpenWAM-Alpha-Sim-RoboDojo
- Dataset de rollouts: https://huggingface.co/datasets/seungkukim/robodojo-clean-rollouts-openwam-hdf5-48ep
- Paper OpenWAM: arXiv:2609.07398 (https://arxiv.org/abs/2609.07398)
- Backbone de vídeo referenciado: Wan2.2-TI2V-5B (sin enlace directo en la información disponible)
