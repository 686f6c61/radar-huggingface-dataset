# edisonz2103/abc-dit-lego-three-all-ft

## Resumen

ABC-DiT Lego Three All es un ajuste fino (finetune) del modelo ABC-DiT XL 200k para la tarea de clasificación de bloques de Lego (`lego_blocks_sorting`) en el entorno de simulación `lego_three`. Lo publica el usuario `edisonz2103` dentro del proyecto ABC (Agent Behavior Cloning), un pipeline de clonación de comportamiento para robótica. El modelo parte del checkpoint padre ABC-DiT XL 200k y se entrena sobre todos los episodios de simulación generados por agente disponibles en el dataset `edisonz2103/abc-agent-lego` a fecha de 2026-11-15: 92 episodios de entrenamiento (104.533 fotogramas, 101.865 utilizables) y 8 de validación (8.606 fotogramas).

La arquitectura es un Diffusion Transformer (DiT) aplicado a clonación de comportamiento: recibe observaciones visuales de tres cámaras (vista superior, izquierda y derecha, apiladas en un fotograma de 224x504 a 30 Hz) junto con 14 articulaciones medidas y 14 comandadas por paso, y genera acciones motoras. El entrenamiento se hizo con el `train.py` sin modificar de la rama `agent-dagger` del repositorio `edisonzhu2006/abc`, sobre una NVIDIA A100-SXM4-80GB durante 4.000 pasos (50 min 46 s, 1,44 it/s, pico de 63,6 GiB).

Su relevancia es acotada: se trata de un experimento de investigación reproducible (checkpoints, curvas de pérdida, log de SLURM y procedencia de episodios publicados), no de un modelo de propósito general. No hay evaluación en simulación de estos checkpoints y el repositorio ocupa 56,4 GB, con pesos derivados de un backbone DINOv3 sujeto a sus restricciones de licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) para clonación de comportamiento; backbone visual derivado de DINOv3 |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de observación multi-cámara por paso; sin contexto textual) |
| Tipos de cuantización | no disponible (checkpoints en precisión de entrenamiento, sin versiones cuantizadas publicadas) |
| Idiomas soportados | no disponible (modelo de robótica; la instrucción de tarea es la cadena "lego blocks sorting") |
| Licencia | Apache-2.0, con restricciones adicionales de la licencia DINOv3 sobre los pesos derivados |
| Formato de pesos | PyTorch `.pt` (checkpoints weights-only de ~8 GB y checkpoint completo con optimizador de 24 GB) |

## Arquitectura y entrenamiento

El modelo es un Diffusion Transformer que modela la distribución de acciones condicionada por observaciones visuales y propioceptivas. La entrada visual son tres cámaras apiladas en un fotograma de 224x504 a 30 Hz; la entrada propioceptiva son 14 articulaciones medidas más 14 comandadas por paso. El entrenamiento leyó una recodificación sin pérdidas de los vídeos originales (libx264 con `-qp 0`, keyframe cada 30 fotogramas, según `abc_minimal/export_mcap.py`), de modo que los píxeles decodificados son idénticos a los originales de Hugging Face. Las estadísticas de normalización se heredan del checkpoint padre (`inherit_ckpt_norm_stats=True`).

El ajuste fino se ejecutó con `uv run train.py --load-pretrained --mixture-preset sim_task --train-steps 4000 --batch-size 90 --num-workers 8 --ckpt-every 1000 --val-every 250`, con `torch.compile(fullgraph=True)`, learning rate 1e-4 con calentamiento lineal de 1.000 pasos y luego constante, AdamW (0,9, 0,95), weight decay 0,01, recorte de gradiente 10 y semilla 123. Se completaron aproximadamente 3,4 épocas sobre los fotogramas de entrenamiento. La pérdida de validación desciende a lo largo de toda la ejecución y alcanza su mínimo en el paso final (`val_loss` 0,0518, `val_recon_error` 0,1237), mientras que la pérdida de entrenamiento sigue en 0,03-0,04 y con ruido, lo que sugiere que el modelo aún no está sobreajustado y que más pasos podrían ayudar.

## Capacidades

- Generación de acciones motoras para manipulación robótica a partir de observaciones visuales de tres cámaras y estado propioceptivo de 28 dimensiones por paso.
- Clonación de comportamiento (behavior cloning) sobre episodios de demostración, incluyendo datos generados por agente (pipeline agent-dagger).
- Ejecución de una tarea concreta de clasificación de bloques de Lego (`lego_blocks_sorting`) en la escena `lego_three`.
- Condicionamiento por instrucción de tarea en forma de prompt de texto ("lego blocks sorting").
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en lenguaje natural ni agentes conversacionales.
- Sin capacidades multilingües: no procesa texto libre como entrada principal.
- Sin modo de pensamiento (thinking), visión general, audio ni generación de texto.

## Casos de uso

- Investigación en clonación de comportamiento: punto de partida reproducible para estudiar cómo escala el ajuste fino de un DiT sobre datos generados por agente, con curvas de pérdida, log de SLURM y procedencia de episodios publicados.
- Reentrenamiento y comparación de mezclas de datos: el fichero `episode_sources.csv` permite ablacionar qué subconjunto (`lego_three_fixed`, `gen20`, `gen30`, `gen50`) contribuye más al rendimiento, reutilizando `train.py --resume-from` con el checkpoint completo de 24 GB.
- Reanudación de entrenamiento en clúster: el checkpoint `abc_dit_lego_three_all_4000_full.pt` incluye estado de optimizador y planificador, adecuado para extender el entrenamiento más allá de los 4.000 pasos en una A100 80GB.
- Evaluación de pipelines de datos sintéticos: sirve para medir si los episodios generados por agente (gen20/gen30/gen50) son suficientes para una política de clasificación de bloques, comparando contra el padre entrenado solo con datos fijos.
- Base para despliegue en simulación: al cargarse con `abc_minimal.dit.load_pretrained`, puede integrarse en el bucle de simulación del proyecto ABC para pruebas cerradas de política, aunque no se ha ejecutado evaluación en simulación de estos checkpoints.
- Referencia para trabajos de robótica con Diffusion Transformers: permite comparar arquitecturas DiT frente a políticas basadas en transformers autorregresivos o difusión convolucional en una tarea de manipulación acotada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta pérdidas de entrenamiento y validación:

| Paso | Train loss | Val loss | Val recon error |
|---|---|---|---|
| 250 | 0,0367 | 0,0601 | 0,1311 |
| 1000 | 0,0599 | 0,0647 | 0,1371 |
| 2000 | 0,0293 | 0,0561 | 0,1354 |
| 3000 | 0,0481 | 0,0550 | 0,1329 |
| 4000 | 0,0348 | 0,0518 | 0,1237 |

No hay evaluación en simulación ni métricas de éxito de tarea para estos checkpoints.

## Requisitos de hardware

- Entrenamiento: una NVIDIA A100-SXM4-80GB, con pico de 63,6 GiB de memoria y 1,44 it/s a batch 90 (job SLURM 17629939, 50 min 46 s para 4.000 pasos).
- Inferencia: VRAM estimada no disponible; los checkpoints weights-only ocupan ~8 GB cada uno, por lo que la inferencia requiere al menos esa cantidad más el estado de activaciones y el codificador visual.
- GPU recomendadas: A100 80GB para entrenamiento; para inferencia, cualquier GPU con memoria suficiente para cargar los pesos (no se especifica el mínimo).
- ¿Cabe en GPU de consumo? No confirmado; con ~8 GB de pesos en precisión de entrenamiento, una RTX 4090 (24 GB) podría albergarlos, pero no hay datos publicados de inferencia ni de cuantización.
- Opciones de despliegue: el proyecto ABC (`abc_minimal.dit.load_pretrained` o `train.py --load-pretrained`); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput de inferencia: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ABC-DiT Lego Three All (este) | no disponible | no aplica | Clasificación de bloques Lego en simulación | Apache-2.0 + restricciones DINOv3 | Pesos en HF, 56,4 GB |
| ABC-DiT XL 200k (padre) | no disponible | no aplica | Clonación de comportamiento general | Apache-2.0 + restricciones DINOv3 | Pesos en HF |
| ABC-DiT Lego Three Gen20 FT | no disponible | no aplica | Clasificación de bloques Lego (20 episodios) | Apache-2.0 + restricciones DINOv3 | Pesos en HF |

No se dispone de información sobre otros modelos comparables de la misma categoría (políticas DiT para manipulación) en la información proporcionada.

## Limitaciones y advertencias

- No se ha ejecutado ninguna evaluación en simulación de estos checkpoints; el rendimiento real de la política es desconocido.
- El entrenamiento se hizo solo sobre 92 episodios de una única tarea y escena (`lego_blocks_sorting`, `lego_three`); no hay evidencia de generalización a otras tareas, objetos o entornos.
- La pérdida de entrenamiento sigue siendo ruidosa y alta (0,03-0,04) al final; el autor indica que más pasos probablemente mejorarían el resultado.
- Los pesos derivan del backbone DINOv3 del checkpoint padre, por lo que las restricciones de licencia de DINOv3 se aplican además de Apache-2.0; conviene revisarlas antes de cualquier uso comercial.
- Los datos de entrenamiento son episodios sintéticos generados por agente, con posible sesgo hacia la distribución del simulador y del pipeline agent-dagger.
- No hay información sobre sesgos, robustez ante cambios de iluminación, oclusión o variaciones de cámara.
- El repositorio es grande (56,4 GB) y los checkpoints están en formato PyTorch sin versiones cuantizadas, lo que complica el despliegue en hardware limitado.
- Sin soporte de texto libre, tool calling ni capacidades conversacionales: no es adecuado para casos de uso de lenguaje natural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/edisonz2103/abc-dit-lego-three-all-ft
- Dataset de entrenamiento: https://huggingface.co/datasets/edisonz2103/abc-agent-lego
- Repositorio de código ABC (rama `agent-dagger`, commit `b0441b0`): https://github.com/edisonzhu2006/abc
- Finetune previo de referencia (20 episodios): https://huggingface.co/edisonz2103/abc-dit-lego-three-gen20-ft
