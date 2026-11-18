# seungkukim/openwam-alpha-robodojo-motion-ttt-pour-insert-48ep-lr1e4-step5000

## Resumen

OpenWAM-Alpha RoboDojo es un modelo de mundo y acción (world-action model) para robótica manipulativa, desarrollado en el ecosistema OpenWAM y publicado por el usuario `seungkukim`. Se trata de un post-entrenamiento (fine-tuning) del modelo base `OpenWAM/OpenWAM-Alpha-Sim-RoboDojo`, especializado en tres tareas del benchmark RoboDojo: `play_tic_tac_toe`, `pour_balls_into_vase` e `insert_tubes`. El modelo combina un backbone de vídeo Wan2.2-TI2V-5B con módulos de acción, y su propósito es predecir trayectorias de acción a partir de observaciones visuales y contexto de tarea en entornos simulados.

La relevancia de esta variante concreta radica en su receta de entrenamiento: se ha afinado exclusivamente sobre rollouts "limpios" y con límites de movimiento (velocidad y jerk) tomados de las demostraciones expertas de RoboDojo, lo que produce políticas más suaves y realistas que el modelo base. El conjunto de datos empleado contiene 144 episodios (48 por tarea) y 75.639 fotogramas en formato HDF5, capturados en simulación con el robot arx_x5.

El repositorio está pensado como un reemplazo directo (drop-in) del modelo base: mantiene el mismo layout, nombres de tensores y ficheros auxiliares, e incluye un único checkpoint `checkpoint_step_*.safetensors`. La licencia es Apache 2.0 y el entrenamiento se realizó en 4 GPU H200 durante 78 minutos y 30 segundos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | world-action model; backbone de vídeo Wan2.2-TI2V-5B más módulos de acción (detalle completo no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robótico, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`checkpoint_step_*.safetensors`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base `OpenWAM-Alpha-Sim-RoboDojo`, un world-action model que integra un backbone de vídeo Wan2.2-TI2V-5B (referenciado en la configuración como `model.video_backbone.model_path`) con cabezas de predicción de acción. No se detalla en la información disponible el número de parámetros, la composición exacta del transformer ni si emplea mecanismos de atención lineal o decodificación especulativa.

El post-entrenamiento se realizó sobre 144 episodios (48 por tarea) y 75.639 fotogramas del dataset `robodojo-motion-rollouts-openwam-hdf5-ttt-pour-insert-48ep`, en simulación arx_x5. Solo se conservaron episodios "limpios" (éxito en el benchmark y en todos los subobjetivos al primer intento) y con movimiento limitado a los umbrales de velocidad y jerk de las demostraciones expertas. La configuración difiere del base en: batch_size 16 (frente a 4), max_steps 5000 (frente a 60.000), save_steps 1000, warmup_ratio 0,10 (500 pasos) y reutilización byte a byte de `normalization_stats.npy` (md5 `855296b406a1d16fbc92318564d6152d`) para que la desnormalización de acciones en inferencia coincida con el entrenamiento. Se usó ZeRO stage 2, bf16, scheduler coseno con lr 1e-4 y lr_min_ratio 0,01, batch global 64 (16 × 1 × 4 GPU) en 4× H200.

## Capacidades

- Predicción de acciones robóticas de manipulación a partir de observaciones visuales en simulación.
- Ejecución de tres tareas específicas de RoboDojo: `play_tic_tac_toe`, `pour_balls_into_vase` e `insert_tubes`.
- Generación de trayectorias con restricciones cinemáticas (límites de velocidad y jerk), gracias al entrenamiento sobre rollouts motion-limited.
- Modelado de mundo: el backbone de vídeo permite representar la dinámica visual del entorno (world model).
- Integración con el pipeline de despliegue de OpenWAM mediante `load_from_checkpoint_dir`.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Manipulación simulada en RoboDojo: el modelo actúa como política para las tres tareas entrenadas, sustituyendo al modelo base con pesos más suaves y ajustados a los límites de movimiento del experto.
- Investigación en world-action models: sirve como punto de partida reproducible para estudiar el efecto del filtrado de datos (episodios limpios) y de los límites cinemáticos en el rendimiento de políticas.
- Generación de trayectorias seguras: los límites de velocidad y jerk aprendidos lo hacen adecuado para experimentos donde se penalizan movimientos bruscos, como transferencia a hardware real con control de seguridad.
- Benchmarking de recetas de post-entrenamiento: al compartir receta con otras variantes (24ep, lr 5e-5), permite comparar el impacto de episodios y learning rate en las mismas tareas.
- Simulación de tareas de precisión: `insert_tubes` y `pour_balls_into_vase` requieren coordinación fina, por lo que el modelo es útil para evaluar políticas en escenarios de ensamblaje e inserción.
- Base para fine-tuning en dominios adyacentes: al ser drop-in del base y mantener el layout de tensores, se puede reutilizar como inicialización para nuevas tareas o entornos simulados.
- Evaluación de robustez ante distribución limitada: útil para estudiar cómo se comporta una política entrenada solo con datos "limpios" frente a perturbaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El entrenamiento se realizó en 4 GPU H200 con ZeRO stage 2 y bf16, con un tiempo de 78 minutos y 30 segundos para 5000 pasos y batch global 64.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible; por el backbone Wan2.2-TI2V-5B se intuye que requiere GPU de datacenter (H100/H200/A100), pero no se confirma en la información.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el pipeline oficial es la librería `openwam`, mediante `from openwam.deploy.model_loader import load_from_checkpoint_dir`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (48ep, lr 1e-4, step 5000) | no disponible | no disponible | 3 tareas RoboDojo | Apache 2.0 | Hugging Face |
| OpenWAM/OpenWAM-Alpha-Sim-RoboDojo (base) | no disponible | no disponible | corpus RoboDojo | Apache 2.0 | Hugging Face |
| openwam-alpha-robodojo-motion-ttt-pour-pickup-24ep-lr1e4-step5000 | no disponible | no disponible | pour + pickup | Apache 2.0 | Hugging Face |
| openwam-alpha-robodojo-motion-ttt-pour-pickup-24ep-lr5e5-step5000 | no disponible | no disponible | pour + pickup | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: solo se ha post-entrenado para tres tareas concretas de RoboDojo; no se espera generalización a otras tareas sin fine-tuning adicional.
- Entrenado exclusivamente en simulación (arx_x5); el rendimiento en hardware real no está documentado y puede degradarse por la brecha sim-to-real.
- Sesgo de datos "limpios": al filtrar solo episodios con éxito total al primer intento, la política puede no haber aprendido a recuperarse de fallos o estados fuera de distribución.
- Riesgo de sobreajuste con 48 episodios por tarea y 5000 pasos; no se publican métricas de validación.
- Las rutas de `config.yaml` son placeholders (`/path/to/...`) y requieren configurar manualmente el backbone Wan2.2-TI2V-5B local.
- El repositorio contiene un único checkpoint; `load_from_checkpoint_dir` selecciona el de mayor `checkpoint_step_*`, por lo que debe descargarse en su propio directorio.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrece garantía ni soporte; el modelo se publica con 0 descargas y 0 likes, sin validación comunitaria.
- No se documentan sesgos sociales ni limitaciones idiomáticas por tratarse de un modelo robótico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seungkukim/openwam-alpha-robodojo-motion-ttt-pour-insert-48ep-lr1e4-step5000
- Modelo base: https://huggingface.co/OpenWAM/OpenWAM-Alpha-Sim-RoboDojo
- Dataset de entrenamiento: https://huggingface.co/datasets/seungkukim/robodojo-motion-rollouts-openwam-hdf5-ttt-pour-insert-48ep
- Variante relacionada (24ep, lr 1e-4): https://huggingface.co/seungkukim/openwam-alpha-robodojo-motion-ttt-pour-pickup-24ep-lr1e4-step5000
- Variante relacionada (24ep, lr 5e-5): https://huggingface.co/seungkukim/openwam-alpha-robodojo-motion-ttt-pour-pickup-24ep-lr5e5-step5000
- Paper OpenWAM: arXiv:2609.07398
