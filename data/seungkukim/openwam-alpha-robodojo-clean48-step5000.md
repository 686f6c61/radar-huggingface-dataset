# seungkukim/openwam-alpha-robodojo-clean48-step5000

## Resumen

OpenWAM-Alpha RoboDojo — post-trained on clean rollouts es un ajuste fino (post-entrenamiento) del modelo base OpenWAM/OpenWAM-Alpha-Sim-RoboDojo, desarrollado por el usuario seungkukim. Se trata de un world-action model (modelo que combina un backbone de vídeo con predicción de acciones) orientado a robótica, entrenado específicamente sobre rollouts limpios generados por agentes LLM para tres tareas del entorno de simulación RoboDojo: `play_tic_tac_toe`, `insert_tubes` y `pour_balls_into_vase`. El modelo resuelve el problema de adaptar un world model preentrenado a tareas concretas con datos de alta calidad y bajo volumen, manteniendo intacta la arquitectura, los nombres de tensores y los ficheros auxiliares del modelo base, de modo que es un reemplazo directo (drop-in) con pesos distintos.

La relevancia de esta ficha es doble: por un lado, documenta un caso de post-entrenamiento reproducible sobre un world model abierto; por otro, ilustra la práctica de reutilizar estadísticas de normalización y tokenizador del modelo base sin modificarlos, lo que facilita la comparabilidad entre checkpoints. El repositorio ocupa 24,8 GB y se distribuye bajo licencia Apache 2.0.

No se dispone de información sobre el número de parámetros, la longitud de contexto ni los idiomas soportados en la documentación proporcionada; el modelo es de naturaleza robótica y multimodal (vídeo-acción), no un modelo de lenguaje conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World-action model (OpenWAM); backbone de vídeo Wan2.2-TI2V-5B referenciado en la configuración de despliegue |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a texto conversacional) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible de forma explícita; el repositorio incluye `config.yaml`, `normalization_stats.npy` y `tokenizer/`, y se carga con `openwam.deploy.model_loader.load_from_checkpoint_dir` |

## Arquitectura y entrenamiento

El modelo es un post-entrenamiento del checkpoint OpenWAM/OpenWAM-Alpha-Sim-RoboDojo, un world-action model que integra un backbone de vídeo (Wan2.2-TI2V-5B, según las instrucciones de despliegue de la model card) con un cabezal de predicción de acciones. La arquitectura, los nombres de tensores y los ficheros auxiliares son idénticos a los del modelo base, por lo que este repositorio funciona como reemplazo directo con pesos distintos.

El entrenamiento se realizó sobre el dataset `seungkukim/robodojo-clean-rollouts-openwam-hdf5-48ep`, compuesto por 144 episodios (48 por tarea) y 58.308 fotogramas, para las tareas `play_tic_tac_toe`, `insert_tubes` y `pour_balls_into_vase`. La configuración es idéntica a la del modelo base salvo en los siguientes parámetros: batch size de 16 (frente a 4), `max_steps` de 5000 (frente a 60000), `save_steps` de 1000 (frente a 2000) y `warmup_ratio` de 0,10 o 500 pasos (frente a 0,05). Se mantienen learning rate 1e-4, scheduler cosine con `lr_min_ratio` 0,01, ZeRO stage 2, precisión mixta bf16 y sin gradient checkpointing. El batch global efectivo es 64 (16 × grad_accum 1 × 4 GPU). Un detalle técnico destacable es que `normalization_stats.npy` se reutiliza sin cambios respecto al modelo base (md5 `855296b406a1d16fbc92318564d6152d`), al igual que el directorio `tokenizer/`, lo que preserva la coherencia de normalización entre checkpoints.

## Capacidades

- Predicción de acciones robóticas en entornos simulados: el modelo genera acciones a partir de observaciones, orientado a las tres tareas de RoboDojo sobre las que fue ajustado.
- Modelado de mundo (world model): combina representación de vídeo con predicción de acciones, lo que permite razonar sobre la dinámica del entorno.
- Ejecución de tareas manipulativas simuladas: `play_tic_tac_toe`, `insert_tubes` y `pour_balls_into_vase`.
- Compatibilidad drop-in con el modelo base: misma estructura de tensores y ficheros auxiliares, lo que permite sustituir pesos sin cambiar el código de carga.
- Integración con el ecosistema OpenWAM: carga mediante `openwam.deploy.model_loader.load_from_checkpoint_dir`.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo thinking.

## Casos de uso

- Investigación en world-action models: servir como checkpoint de referencia para estudiar el efecto del post-entrenamiento con datos limpios y bajo volumen (144 episodios) sobre un modelo preentrenado con un corpus mayor.
- Reproducción de experimentos de robótica simulada: el repositorio incluye la configuración exacta de entrenamiento, lo que permite replicar el ajuste sobre las tres tareas de RoboDojo y comparar con el modelo base.
- Evaluación de políticas en RoboDojo: usar el modelo como política para las tareas `play_tic_tac_toe`, `insert_tubes` y `pour_balls_into_vase` y medir tasas de éxito frente al checkpoint base.
- Baseline para ajuste fino con datos propios: al ser un reemplazo directo del modelo base, sirve como punto de partida para nuevos post-entrenamientos sobre datasets específicos sin reescribir el pipeline de carga.
- Estudio de normalización y tokenización: dado que reutiliza `normalization_stats.npy` y `tokenizer/` sin cambios, es útil para aislar el efecto de los pesos frente al de los ficheros auxiliares en experimentos controlados.
- Docencia y divulgación técnica: ejemplo concreto de cómo se documenta y publica un post-entrenamiento de un world model abierto, con configuración de entrenamiento y dataset asociados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 24,8 GB, lo que da una cota inferior orientativa del espacio en disco necesario; la VRAM dependerá del backbone de vídeo Wan2.2-TI2V-5B y del lote utilizado.
- GPU recomendadas: no disponible de forma explícita. El entrenamiento se realizó con 4 GPU y ZeRO stage 2 en bf16, lo que sugiere un entorno multi-GPU.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: carga mediante la librería `openwam` y la función `openwam.deploy.model_loader.load_from_checkpoint_dir`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| seungkukim/openwam-alpha-robodojo-clean48-step5000 | no disponible | no disponible | 5000 pasos, 144 episodios, 3 tareas RoboDojo | apache-2.0 | Hugging Face |
| OpenWAM/OpenWAM-Alpha-Sim-RoboDojo (base) | no disponible | no disponible | 60000 pasos, corpus RoboDojo | no disponible en la informacion proporcionada | Hugging Face |
| Otros world-action models | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación documentada es con el modelo base, del que este checkpoint es un post-entrenamiento con menos pasos y un dataset más pequeño y limpio. No se dispone de datos de rendimiento comparado.

## Limitaciones y advertencias

- Especialización estrecha: el ajuste se limita a tres tareas de RoboDojo (`play_tic_tac_toe`, `insert_tubes`, `pour_balls_into_vase`); el rendimiento fuera de ellas no está documentado.
- Volumen de datos reducido: 144 episodios y 58.308 fotogramas pueden provocar sobreajuste a las condiciones de simulación representadas.
- Dependencia del backbone de vídeo: la configuración requiere apuntar `model.video_backbone.model_path` a una copia local de Wan2.2-TI2V-5B, lo que añade un requisito externo de despliegue.
- Rutas placeholder: `config.yaml` contiene rutas del tipo `/path/to/...` que deben ajustarse manualmente antes de cargar el modelo.
- Sin datos de benchmarks: no hay evidencia publicada de tasas de éxito ni de comparación cuantitativa con el modelo base.
- Sesgos y alucinación: no documentados en la información proporcionada; en robótica simulada, el riesgo se traduce en políticas que fallan en estados no vistos.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y el backbone de vídeo pueden tener condiciones propias que deben verificarse por separado.
- Idiomas y contexto: no disponibles; el modelo no es un LLM conversacional, por lo que estas métricas no aplican directamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seungkukim/openwam-alpha-robodojo-clean48-step5000
- Modelo base: https://huggingface.co/OpenWAM/OpenWAM-Alpha-Sim-RoboDojo
- Dataset de entrenamiento: https://huggingface.co/datasets/seungkukim/robodojo-clean-rollouts-openwam-hdf5-48ep
- Paper de referencia (arXiv:2609.07398): https://arxiv.org/abs/2609.07398
