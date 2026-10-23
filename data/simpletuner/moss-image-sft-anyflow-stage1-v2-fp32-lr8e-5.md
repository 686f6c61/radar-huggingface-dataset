# SimpleTuner/moss-image-sft-anyflow-stage1-v2-fp32-lr8e-5

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA de rango 128 para el modelo de difusión de imágenes MOSS-Image-SFT (OpenMOSS-Team/MOSS-Image-SFT), entrenado con el kit SimpleTuner. Forma parte de un estudio controlado de SimpleTuner sobre precisión de parámetros entrenables y learning rate en el objetivo AnyFlow/MeanFlow, en concreto la rama con learning rate pico 8e-5 y parámetros del adaptador en FP32. El adaptador se inicializa desde el EMA del adaptador de la etapa 2 de la campaña anterior, con `init_lora_step=0`, de modo que optimizador, scheduler, RNG, sampler e historial EMA arrancan de cero.

El interés es metodológico más que de producto: es un punto de datos de una comparación de cuatro brazos (LR 6e-5 frente a 8e-5, precisión `no_change` frente a `fp32`) con el mismo optimizador Torch AdamW, betas (0.9, 0.999), epsilon 1e-6 y weight decay 0.01. El entrenamiento se detuvo por petición del autor en la actualización 7.040 de las 100.000 previstas, por lo que los checkpoints publicados (de 1.000 a 7.000) son parciales y no representan una receta terminada. La licencia del adaptador es Apache 2.0, y el modelo base se mantiene congelado en BF16 durante todo el proceso.

Al ser un adaptador sobre un pipeline de difusión, no es un modelo de lenguaje: no tiene ventana de contexto en tokens ni capacidades de tool calling o razonamiento multi-paso. Su utilidad es la generación y edición de imágenes mediante prompts de texto, y su valor práctico inmediato es servir como material de reproducibilidad y como ejemplo de configuración AnyFlow en SimpleTuner.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 128, alpha 128) sobre un transformer de difusión (MOSS-Image-SFT) con formulación MeanFlow/AnyFlow |
| Parametros totales | no disponible (los del modelo base no se publican en la informacion proporcionada; el adaptador es de rango 128) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de difusion de imagenes; no usa contexto en tokens) |
| Tipos de cuantizacion | no disponible para el adaptador; los pesos base se entrenan congelados en BF16; el forward en precision mixta es BF16 |
| Idiomas soportados | no disponible (el condicionamiento es textual via prompt; no se declara cobertura de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors gestionados por la libreria `diffusers` (adaptadores PEFT/LoRA); repo de 8,5 GB con checkpoints multiples |

## Arquitectura y entrenamiento

El adaptador se aplica sobre MOSS-Image-SFT, un transformer de difusióncondicionado por texto, y se entrena con el objetivo Forward MeanFlow de AnyFlow en lugar de los muestreos ordinarios de timesteps logit-normal truncados del modelo. La configuración del objetivo incluye ratio de consistencia 0,25, ratio de difusión 0,5, epsilon de diferencias finitas 0,005, fusión de guidance 3, gate 0,25, condicionamiento por intervalo `r` y ponderación adaptativa MeanFlow `beta08`; el entrenamiento usa el sampler por intervalos de AnyFlow con shift 1. El LoRA tiene rango 128 y alpha 128, con dropout de LoRA y de caption a cero, y los pesos base permanecen congelados en BF16; el forward en precisión mixta sigue en BF16 y el EMA se acumula en FP32 sobre CPU con decaimiento 0,995 y actualización en cada paso.

El entrenamiento se ejecutó en dos GPU H100 con microbatch 2, acumulación de gradiente 1 y batch global 4, usando Torch AdamW (betas 0.9/0.999, epsilon 1e-6, weight decay 0.01), 1.000 pasos de warmup y decaimiento polinómico (potencia 1) hasta 6e-6, con semilla 43 y flujos independientes por rango. El plan contemplaba 100.000 actualizaciones, pero el experimento se detuvo por petición en la actualización 7.040. La mezcla de datos es idéntica en los cuatro brazos: muestreo equilibrado entre CC12M con captions largos y e621, y entre 512 px y 1024 px, con hasta 65.536 imágenes por fuente; los conjuntos de 512 px usan recortes cuadrados aleatorios y los de 1024 px usan buckets de aspecto sin recorte exigiendo al menos 1.048.576 píxeles de área de origen. Se reutilizaron las cachés de latentes y texto y se desactivó el entrenamiento a 2048 px. La validación se ejecuta en el rango 0 con comparación live/EMA, shift 1, cuatro pasos de muestreo, CFG 1 y semilla 42, generando salidas a 512 px y 1024 px cada 500 actualizaciones; los checkpoints se guardan cada 1.000 actualizaciones.

## Capacidades

- Generación de imágenes condicionada por prompt de texto a partir del modelo base MOSS-Image-SFT, modulada por el adaptador LoRA.
- Muestreo en pocos pasos (la validación usa cuatro pasos con CFG 1), coherente con la formulación MeanFlow/AnyFlow.
- Trabajo en dos resoluciones de referencia, 512 px y 1024 px, con buckets de aspecto para la resolución alta.
- Adaptación de estilo y dominio sobre el modelo base: la mezcla de datos incluye captions largos (CC12M) y contenido de e621, por lo que el adaptador desplaza la distribución hacia esos dominios.
- Reproducibilidad de experimentos: incluye `training_config.json`, `dataloader.json`, `prompts.json` y `provenance.json` para replicar la receta.
- Comparación live/EMA disponible a través de las imágenes de validación publicadas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni entrada de audio o vídeo en la información disponible.

## Casos de uso

- Estudio de sensibilidad a learning rate y precisión: el adaptador es un brazo de una comparación controlada de cuatro ejecuciones; sirve para medir el efecto de LR 8e-5 con parámetros en FP32 frente a 6e-5 y frente a `no_change`, manteniendo constantes optimizador, batch global y mezcla de datos.
- Reproducción de experimentos AnyFlow: los ficheros de configuración y procedencia permiten reconstruir el entrenamiento con el adaptador de inicialización descargado en la ruta relativa `init_lora`.
- Ajuste de estilo sobre MOSS-Image: al haberse entrenado con captions largos de CC12M, el adaptador puede usarse como punto de partida para estilizar o ampliar la distribución de salidas del modelo base.
- Docencia y divulgación sobre flow matching: el checkpoint y las previews live/EMA a 512 y 1024 px permiten ilustrar cómo evoluciona un adaptador MeanFlow a lo largo de 7.000 actualizaciones.
- Base para comparaciones de precisión de adaptadores: al aislar `fp32` frente a `no_change`, resulta útil para decidir si merece la pena entrenar adaptadores en FP32 en pipelines propios con SimpleTuner.
- Integración en pipelines `diffusers`: el adaptador se carga como LoRA sobre el pipeline del modelo base para prototipado de generación de imágenes en entornos de investigación.
- Referencia negativa o de control: al haberse detenido en 7.040 de 100.000 pasos, sirve para estudiar el comportamiento de checkpoints infraentrenados frente a los de la campaña completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de seguimiento del entrenamiento (actualizaciones completadas, 7.040 de 100.000; checkpoints cada 1.000 pasos; validación cada 500) y previews cualitativas live/EMA, sin métricas cuantitativas como FID, CLIP score ni comparaciones numéricas con otros adaptadores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al no publicarse el número de parámetros del modelo base ni el tamaño de sus pesos en el repositorio, no es posible dar una cifra fiable de VRAM para cargar el pipeline completo.
- El repositorio ocupa 8,5 GB e incluye los checkpoints 1.000 a 7.000 más las imágenes de validación; conviene descargar solo el checkpoint necesario en lugar del repo completo.
- GPU usadas en el entrenamiento documentado: 2× H100 con microbatch 2 y batch global 4, con gradient checkpointing activado y atención Kohaku-FA.
- La campaña de reemplazo indicada en la model card usa 8× H100 con FP32 y batch global 16, lo que da una idea del orden de magnitud del coste de entrenamiento.
- Cabe en GPU de consumo: no disponible; depende del tamaño del modelo base, que no se documenta aquí.
- Opciones de despliegue: la librería declarada es `diffusers`, y el entrenamiento se realizó con SimpleTuner (kit de fine-tuning para modelos de difusión de imagen, vídeo y audio); el ecosistema documentado de SimpleTuner incluye validación mediante hooks del scheduler de destilación para pipelines FlowMap.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Objetivo / configuración | Precision del adaptador | LR pico | Estado | Licencia |
|---|---|---|---|---|---|---|
| Este adaptador (`stage1-v2-fp32-lr8e-5`) | MOSS-Image-SFT | Forward MeanFlow, rango 128, batch global 4, 2×H100 | FP32 | 8e-5 | Detenido en 7.040/100.000 | Apache 2.0 |
| `moss-image-sft-anyflow-stage1-v2-fp32-lr6e-5-8xh100` | MOSS-Image-SFT | Forward MeanFlow desde el EMA de etapa 2, batch global 16, 8×H100 | FP32 | 6e-5 | Campaña de reemplazo, arranca de cero | Apache 2.0 |
| `moss-image-sft-anyflow-stage2` | MOSS-Image-SFT | Campaña previa; su EMA es el punto de inicialización de este adaptador | BF16 (rango 128) | no disponible | Checkpoints publicados (p. ej. 1500/ema) | Apache 2.0 |
| `moss-image-sft-anyflow-stage1` | MOSS-Image-SFT | SFT-only, ajustes stage1-v2 y dmd-v5, 8×H100, batch global 16 | BF16 (rango 128) | no disponible | Campaña base | Apache 2.0 |

No se dispone de comparaciones cuantitativas de calidad de imagen frente a estos u otros adaptadores; la única comparación documentada es de configuración de entrenamiento.

## Limitaciones y advertencias

- Entrenamiento incompleto: el experimento se detuvo por petición en la actualización 7.040 de 100.000, con decaimiento polinómico planificado hasta 6e-6 que nunca llegó a aplicarse en su mayor parte; los checkpoints publicados no representan una receta final.
- No es un control emparejado con la campaña de ocho GPU: la model card advierte explícitamente que la ejecución previa con batch global 16 no es comparable directamente con estos cuatro brazos de batch global 4.
- El adaptador se inicializa desde el EMA de la etapa 2, no desde el checkpoint base; los resultados heredan las características de esa campaña previa.
- Mezcla de datos con e621: el adaptador está entrenado con contenido de esa fuente, lo que puede sesgar el estilo y el contenido de las salidas hacia ese dominio y plantear problemas de adecuación en contextos profesionales.
- Riesgo de sesgos de CC12M: los captions largos de CC12M arrastran los sesgos demográficos y culturales del corpus original, no auditados en la información disponible.
- No hay métricas de calidad publicadas (FID, CLIP score, evaluaciones humana): la única evidencia son previews de validación cualitativas.
- Sin datos sobre idiomas soportados ni evaluación multilingüe del condicionamiento textual.
- Licencia Apache 2.0 en el adaptador, pero el uso comercial debe verificar además la licencia y las condiciones del modelo base MOSS-Image-SFT y de los datos de entrenamiento empleados.
- Repositorio con 8,5 GB y checkpoints múltiples: riesgo de descargas innecesarias y de confundir checkpoints intermedios con versiones finales.
- Sin descargas ni likes en el momento de la consulta, y sin pipeline declarado en HuggingFace: menor garantía de integración directa con `diffusers` sin configuración manual.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/SimpleTuner/moss-image-sft-anyflow-stage1-v2-fp32-lr8e-5
- Campaña de reemplazo (8×H100, FP32, LR 6e-5): https://huggingface.co/SimpleTuner/moss-image-sft-anyflow-stage1-v2-fp32-lr6e-5-8xh100
- Adaptador de inicialización (etapa 2, checkpoint 1500 EMA): https://huggingface.co/SimpleTuner/moss-image-sft-anyflow-stage2/tree/45a3541f0c13e33dd0e2aaa5cf7cad70b29f466d/checkpoint-1500/ema
- Campaña de etapa 1: https://huggingface.co/SimpleTuner/moss-image-sft-anyflow-stage1
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Repositorio de SimpleTuner en GitHub: https://github.com/bghira/SimpleTuner
- Documentación de AnyFlow en SimpleTuner: https://docs.simpletuner.io/experimental/ANYFLOW/
- Inicio rápido de AnyFlow (continuación): https://docs.simpletuner.io/quickstart/ANYFLOW/
- Documentación general de SimpleTuner: http://docs.simpletuner.io/
