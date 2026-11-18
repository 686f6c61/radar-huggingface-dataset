# seungkukim/openwam-alpha-robodojo-motion-ttt-pour-pickup-48ep-lr5e5-step5000

## Resumen

OpenWAM-Alpha RoboDojo (motion-limited, 48 ep/task, lr 5e-5, step 5000) es un ajuste fino del modelo base OpenWAM/OpenWAM-Alpha-Sim-RoboDojo, desarrollado por el autor seungkukim. Se trata de un world-action model orientado a robótica que combina un backbone de vídeo Wan2.2-TI2V-5B con cabezas de acción, y que ha sido post-entrenado sobre rollouts de un agente LLM con restricciones cinemáticas para tres tareas del benchmark RoboDojo: `play_tic_tac_toe`, `pour_balls_into_vase` y `general_pickup`.

El modelo resuelve el problema de generar políticas de control robustas a partir de datos de demostración simulados, en este caso limitados en velocidad y jerk (motion-limited) para evitar movimientos bruscos que degradan la transferencia a hardware real. El repositorio es un reemplazo directo (drop-in) del modelo base: mantiene el mismo layout, nombres de tensores y ficheros auxiliares, pero con pesos distintos.

Es relevante porque documenta un protocolo de post-entrenamiento reproducible y de bajo coste (70 minutos en 4x H200, 5000 pasos, batch global 64) sobre un dataset pequeño y filtrado por calidad (144 episodios, 60.697 frames), lo que lo convierte en un caso de estudio útil para quienes exploran fine-tuning eficiente de world models en robótica simulada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World-action model con backbone de vídeo Wan2.2-TI2V-5B (según config del modelo base) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`checkpoint_step_*.safetensors`, un único checkpoint) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base OpenWAM-Alpha-Sim-RoboDojo, un world-action model modular que emplea un backbone de difusión de vídeo (Wan2.2-TI2V-5B, referenciado en `config.yaml` como `model.video_backbone.model_path`) y produce acciones de robot condicionadas por observaciones. El repositorio no redefine la arquitectura: reutiliza el layout y los nombres de tensores del modelo base, por lo que la única diferencia son los pesos.

El post-entrenamiento se realizó sobre 144 episodios (48 por tarea) y 60.697 frames del dataset `robodojo-motion-rollouts-openwam-hdf5-ttt-pour-pickup-48ep`, en simulación arx_x5. Solo se conservaron episodios "limpios" (éxito en el benchmark y en todos los subobjetivos al primer intento) y con movimiento limitado a los umbrales de velocidad y jerk de las demostraciones expertas de RoboDojo, verificados durante la grabación y revalidados por episodio. La configuración de entrenamiento es idéntica a la del base salvo: batch_size 16 (frente a 4), max_steps 5000 (frente a 60000), save_steps 1000, warmup_ratio 0.10 (500 pasos), learning_rate 5e-5 (frente a 1e-4), cosine scheduler con lr_min_ratio 0.01, ZeRO-2 y bf16. El batch global fue 16 x 1 x 4 GPU = 64 en 4x H200, con un tiempo de pared de 70m25s. La normalización min-max reutiliza `normalization_stats.npy` del modelo base, byte-idéntico (md5 `855296b406a1d16fbc92318564d6152d`), garantizando que la desnormalización de acciones en inferencia coincida con la del entrenamiento.

## Capacidades

- Generación de acciones de robot para manipulación simulada en las tareas `play_tic_tac_toe`, `pour_balls_into_vase` y `general_pickup`.
- Modelado de dinámica visual y acción (world-action model) con backbone de vídeo Wan2.2-TI2V-5B.
- Ejecución de trayectorias con restricciones cinemáticas de velocidad y jerk, alineadas con las demostraciones expertas.
- Compatibilidad drop-in con el pipeline de despliegue del modelo base (`openwam.deploy.model_loader.load_from_checkpoint_dir`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad del modelo; los datos de entrenamiento provienen de rollouts de un agente LLM, pero el modelo en sí no expone esa funcionalidad.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible más allá del backbone de vídeo.

## Casos de uso

- Manipulación simulada de vertido (`pour_balls_into_vase`): el modelo genera acciones para verter bolas en un jarrón respetando límites de velocidad y jerk, lo que reduce el riesgo de derrames por movimientos bruscos en la política aprendida.
- Recogida general de objetos (`general_pickup`): útil para prototipar políticas de pick-and-place en simulación arx_x5 antes de transferirlas a un entorno real con restricciones cinemáticas similares.
- Investigación en world models: sirve como checkpoint de referencia para estudiar cómo el post-entrenamiento sobre datos filtrados por calidad afecta a la dinámica aprendida, comparándolo con el base y con la variante lr 1e-4.
- Reproducción de experimentos: al ser un drop-in replacement con configuración documentada, permite reproducir el pipeline de fine-tuning en 4x H200 en poco más de una hora.
- Evaluación de protocolos de filtrado de datos: los episodios motion-limited y clean permiten medir el impacto de la curación de datos en el rendimiento de la política.
- Benchmarking de tareas RoboDojo: puede emplearse como baseline post-entrenado en las tres tareas cubiertas para comparar con otros checkpoints del mismo sweep (24ep, lr 1e-4, pour-insert).
- Docencia y prototipado en robótica: su licencia Apache-2.0 y su tamaño de repo (24,8 GB) permiten desplegarlo en entornos académicos con GPUs de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repo ocupa 24,8 GB en safetensors, por lo que se requiere al menos esa capacidad más overhead del backbone de vídeo Wan2.2-TI2V-5B.
- GPU recomendadas: el entrenamiento se realizó en 4x H200; para inferencia se recomienda al menos una GPU de datacenter (A100/H100/H200) por el tamaño del backbone de vídeo.
- ¿Cabe en consumer GPU?: no disponible; por el tamaño del checkpoint y del backbone, es poco probable en GPUs de consumo con VRAM estándar, pero no se confirma en la información proporcionada.
- Opciones de despliegue: `openwam.deploy.model_loader.load_from_checkpoint_dir` (librería `openwam`); requiere configurar `model.video_backbone.model_path` a una copia local de Wan2.2-TI2V-5B. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| seungkukim/openwam-alpha-robodojo-motion-ttt-pour-pickup-48ep-lr5e5-step5000 | no disponible | no disponible | no disponible | apache-2.0 | Hugging Face |
| seungkukim/openwam-alpha-robodojo-motion-ttt-pour-pickup-48ep-lr1e4-step5000 | no disponible | no disponible | no disponible | apache-2.0 | Hugging Face |
| seungkukim/openwam-alpha-robodojo-motion-ttt-pour-pickup-24ep-lr5e5-step5000 | no disponible | no disponible | no disponible | apache-2.0 | Hugging Face |
| OpenWAM/OpenWAM-Alpha-Sim-RoboDojo (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

Las variantes comparten dataset o receta y difieren en learning rate (1e-4 frente a 5e-5) o en número de episodios por tarea (24 frente a 48). No se han publicado métricas comparativas en la información disponible.

## Limitaciones y advertencias

- Entrenado únicamente sobre tres tareas de RoboDojo en simulación arx_x5; no se garantiza generalización a otras tareas, objetos o entornos.
- Dataset muy pequeño (144 episodios, 60.697 frames) y filtrado agresivamente por calidad (solo episodios clean y motion-limited), lo que puede introducir sesgo hacia trayectorias "ideales" y reducir la diversidad de la política.
- Riesgo de sobreajuste a la distribución de demostraciones expertas y a los límites cinemáticos concretos de RoboDojo; el comportamiento fuera de esos límites no está validado.
- No hay datos publicados de benchmarks, latencia ni throughput, por lo que no puede evaluarse su rendimiento frente al base sin ejecutar pruebas propias.
- Requiere descargar el backbone Wan2.2-TI2V-5B por separado y ajustar `config.yaml`; las rutas del repo son placeholders (`/path/to/...`).
- `load_from_checkpoint_dir` selecciona el checkpoint de mayor `checkpoint_step_*`; al haber solo uno, debe descargarse en su propio directorio para evitar mezclas.
- Licencia Apache-2.0 permite uso comercial, pero no se documentan restricciones adicionales del backbone Wan2.2-TI2V-5B, que deben verificarse por separado.
- No se documentan sesgos étnicos, de género o lingüísticos; el modelo no procesa lenguaje natural de forma directa.
- El modelo depende de la coherencia de `normalization_stats.npy` con el base; modificarlo rompería la correspondencia entre entrenamiento e inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seungkukim/openwam-alpha-robodojo-motion-ttt-pour-pickup-48ep-lr5e5-step5000
- Modelo base: https://huggingface.co/OpenWAM/OpenWAM-Alpha-Sim-RoboDojo
- Dataset de entrenamiento: https://huggingface.co/datasets/seungkukim/robodojo-motion-rollouts-openwam-hdf5-ttt-pour-pickup-48ep
- Variante lr 1e-4: https://huggingface.co/seungkukim/openwam-alpha-robodojo-motion-ttt-pour-pickup-48ep-lr1e4-step5000
- Variante 24ep: https://huggingface.co/seungkukim/openwam-alpha-robodojo-motion-ttt-pour-pickup-24ep-lr5e5-step5000
- Variante pour-insert: https://huggingface.co/seungkukim/openwam-alpha-robodojo-motion-ttt-pour-insert-48ep-lr1e4-step5000
- Paper OpenWAM: arXiv:2609.07398 (https://arxiv.org/abs/2609.07398)
