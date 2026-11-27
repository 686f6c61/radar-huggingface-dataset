# SlayerLab/Slayer1B-1.07-checkpoints

## Resumen

Slayer1B 1.07 es un modelo de lenguaje de 1.073.912.851 parámetros (aproximadamente 1,07 mil millones) entrenado desde cero por SlayerLab, un proyecto centrado en modelos en polaco. Este repositorio concreto no contiene un paquete listo para usar con Transformers, sino los checkpoints nativos del entrenamiento que produjo la versión 1.07: 23 ficheros de estado completo del entrenador (pesos más estado del optimizador) que permiten reanudar o estudiar el proceso de entrenamiento. Se incluye además la conversión final del checkpoint 22327 en `model.safetensors` en float32, junto con el cargador y la definición del modelo.

El modelo es relevante por su transparencia: publica la curva de entrenamiento, los hashes SHA-256 de cada checkpoint, el dataset exacto (8.891.005.707 tokens, una sola pasada) y los detalles de hardware e interrupciones del run. El entrenamiento se completó el 6 de noviembre de 2026 en el paso 22327, partiendo del checkpoint final de la versión 1.06 (`ckpt_13848.pt`) con una tasa de aprendizaje constante de 6e-4 y sin decaimiento.

La arquitectura concreta no se detalla en la información disponible más allá de la definición en `train_gpt_ref_r23.py`; el tamaño de 1,07B y el contexto de entrenamiento de 4096 tokens por secuencia son los datos verificables. La licencia Apache-2.0 facilita su reutilización, aunque los datos de entrenamiento incluyen fuentes CC BY-SA que conviene revisar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (definida en `train_gpt_ref_r23.py`; transformer según la nomenclatura del trainer) |
| Parámetros totales | 1.073.912.851 |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | 4096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantización | No disponible (pesos publicados en float32) |
| Idiomas soportados | Polaco (tag `polish`; lista completa no disponible) |
| Licencia | Apache-2.0 (checkpoints); datos con componentes CC BY-SA |
| Formato de pesos | PyTorch pickle (`torch.save`) para checkpoints; `safetensors` float32 para la conversión final |

## Arquitectura y entrenamiento

El entrenamiento continuó desde el checkpoint final de la versión 1.06 (`ckpt_13848.pt`, sha256 `1fc7396c…`) durante 8.479 pasos adicionales, cada uno con 1.048.576 tokens (256 secuencias de 4096 tokens), hasta el paso 22327. Se usó una tasa de aprendizaje constante de 6e-4 sin decaimiento, con un dataset de 8.891.005.707 tokens (`SlayerLab/slayer-1.07-pretrain`) en una única pasada. El hardware fueron 4 GPU NVIDIA RTX 4090 con DDP y acumulación de gradiente de 32, manteniendo un batch global idéntico al de los runs de 8 GPU. El optimizador combina Muon y AdamW.

El run sufrió dos interrupciones: una parada el 4 de noviembre en el paso 17130, reanudada el 5 de noviembre desde `ckpt_17000.pt` (los pasos 17001–17130 se entrenaron dos veces, con pérdida idéntica en el paso 17010 en ambas ejecuciones), y otra parada el 5 de noviembre en el paso 19330, reanudada desde un checkpoint rodante en el paso 19250 no publicado (pasos 19251–19330 repetidos, con pérdida idéntica en el paso 19260). El trainer fue `train_gpt_ref` r24.2 (sha256 `46f83b51…`) con la definición de modelo `train_gpt_ref_r23.py` sin cambios. No se documentan en la información disponible detalles sobre RLHF, DPO ni innovaciones de atención.

## Capacidades

- Generación de texto en polaco, según el tag de idioma del repositorio.
- Entrenamiento base de tipo pretraining; no se documentan ajustes de instrucciones ni de chat.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo de pensamiento.
- Capacidad de reanudación exacta del entrenamiento gracias a los checkpoints con estado del optimizador.
- Reproducibilidad verificable mediante hashes SHA-256 por checkpoint.

## Casos de uso

- Reanudación de entrenamiento: cargar `ckpt_22327.pt` con `torch.load(..., weights_only=True)` y continuar el pretraining con el estado de Muon y AdamW intacto, útil para experimentos de continuación con datos nuevos.
- Estudio de dinámica de entrenamiento: analizar la evolución de pesos y estados del optimizador entre los 23 checkpoints publicados para investigar estabilidad, olvido catastrófico o efecto de las repeticiones tras interrupciones.
- Fine-tuning en polaco: partir de `model.safetensors` (float32) y ajustar para tareas downstream como clasificación de texto, extracción de información o generación asistida, con un modelo de 1,07B manejable en una sola GPU.
- Investigación de recetas de entrenamiento: comparar la tasa constante de 6e-4 sin decaimiento frente a schedules con decaimiento usando los checkpoints intermedios como referencia.
- Reproducción de artefactos: verificar la integridad de pesos y estados mediante los SHA-256 publicados en pipelines de auditoría de modelos.
- Base para modelos pequeños en producción: desplegar la conversión float32 con un loader propio (`load_slayer.py`) en entornos donde no se requiere el stack de Transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a las evaluaciones realizadas durante el entrenamiento en la model card de Slayer1B 1.07 y en la curva de entrenamiento (`track.fabryka.ai/run/4973c068-8dd5-59d8-b6c4-671ca3beb925`), pero no se incluyen cifras en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en float32 ocupan aproximadamente 4,3 GB (`model.safetensors` mide 4.295.670.676 bytes); en float16 o bfloat16 bajaría a unos 2,1 GB, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: el entrenamiento se realizó con 4 × NVIDIA RTX 4090, lo que indica que el modelo cabe holgadamente en GPUs de consumo para inferencia.
- Cabe en GPU de consumo: sí, en RTX 4090 y previsiblemente en GPUs con 8 GB o más en float32; no se confirma para GPUs de gama baja.
- Opciones de despliegue: el repositorio proporciona `load_slayer.py` para carga nativa en PyTorch; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio completo ocupa 208,1 GB por los 23 checkpoints de 8.860.287.151 bytes cada uno.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría con datos verificables de parámetros, contexto y rendimiento.

## Limitaciones y advertencias

- El repositorio contiene checkpoints de entrenamiento, no un paquete listo para Transformers; requiere el cargador y la definición de modelo propios.
- Los checkpoints incluyen estado del optimizador y ocupan 8,86 GB cada uno; el repo completo supera los 208 GB.
- El modelo es de pretraining base; no se documenta alineación con instrucciones ni filtros de seguridad.
- Riesgo de alucinación y sesgos no evaluados en la información disponible.
- Contexto limitado a 4096 tokens, insuficiente para tareas de contexto largo.
- Idiomas: el tag indica polaco; el soporte multilingüe no está confirmado.
- Licencia Apache-2.0 para los checkpoints, pero los datos de entrenamiento incluyen fuentes CC BY-SA (núcleo en polaco y textos legales repetidos de slayer-pl-8x3b), lo que puede imponer obligaciones de atribución y compartición en derivados.
- No se documentan cuantizaciones oficiales ni soporte en frameworks de inferencia optimizados.

## Enlaces

- Repositorio de checkpoints: https://huggingface.co/SlayerLab/Slayer1B-1.07-checkpoints
- Modelo Slayer1B 1.07: https://huggingface.co/SlayerLab/Slayer1B-1.07
- Checkpoints de la versión 1.06: https://huggingface.co/SlayerLab/Slayer1B-1.06-checkpoints
- Dataset de pretraining: https://huggingface.co/datasets/SlayerLab/slayer-1.07-pretrain
- Dataset slayer-pl-8x3b: https://huggingface.co/datasets/SlayerLab/slayer-pl-8x3b
- Curva de entrenamiento y evaluaciones: https://track.fabryka.ai/run/4973c068-8dd5-59d8-b6c4-671ca3beb925
