# SimpleTuner/moss-image-sft-anyflow-stage1

## Resumen

`SimpleTuner/moss-image-sft-anyflow-stage1` es un adaptador LoRA de rango 128 en BF16 para el modelo de difusión texto-a-imagen `OpenMOSS-Team/MOSS-Image-SFT`. Lo publica el proyecto SimpleTuner como primera etapa de un entrenamiento AnyFlow (Forward MeanFlow) cuyo objetivo es habilitar la generación de imágenes en muy pocos pasos de muestreo. No es un modelo independiente: necesita el checkpoint base de OpenMOSS para funcionar y se carga con la API de LoRA de diffusers.

El problema que aborda es el coste de inferencia de los modelos de difusión: en lugar de decenas de pasos con classifier-free guidance, la receta AnyFlow busca un adaptador capaz de producir imágenes en 4 pasos con CFG 1, validando a 512 px y 1024 px con la rejilla de ruido nativa de MOSS sin desplazamiento. El entrenamiento es SFT-only sobre una mezcla 50/50 de CC12M (con leyendas largas estructuradas) y e621 (con sus leyendas originales), con un tope de 65.536 imágenes por fuente, a 512 px de área equivalente.

La relevancia de este repositorio es sobre todo metodológica: documenta de forma explícita la receta, los hiperparámetros y los ficheros de configuración, pero el estado declarado es **queued** con 0 de 10.000 actualizaciones observadas, sin checkpoints publicados y sin métricas. Además, la propia model card indica que la inferencia debe hacerse con el adaptador de la etapa 2, no con este de la etapa 1.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer de difusión texto-a-imagen (modelo base `OpenMOSS-Team/MOSS-Image-SFT`); la model card no detalla la arquitectura interna del base |
| Parametros totales | no disponible (adaptador LoRA de rango 128 en BF16; el tamaño del modelo base no se especifica en la información disponible) |
| Longitud de contexto | no disponible (no aplica: modelo de generación de imágenes; resolución de entrenamiento de 512 px de área equivalente y validación a 512 px y 1024 px) |
| Tipos de cuantizacion | no disponible; entrenamiento y adaptador en BF16. No se documentan variantes GGUF, INT8 ni FP8 |
| Idiomas soportados | no disponible; las leyendas de entrenamiento (CC12M y e621) están en inglés, por lo que el soporte multilingüe de prompts no está documentado |
| Licencia | apache-2.0 (sujeta además a la licencia del modelo base, no indicada en la información disponible) |
| Formato de pesos | adaptador LoRA cargable con diffusers mediante `load_lora_weights`; el formato de fichero no se detalla en la model card |

## Arquitectura y entrenamiento

El objeto publicado es un adaptador LoRA, no un modelo completo. Según la model card, se entrena con la receta de los experimentos AnyFlow de Anima, tomando como referencia los ajustes `stage1-v2` y `dmd-v5`. Ambos stages usan 512 px de área equivalente, LoRA de rango 128 en BF16, dropout de LoRA y de leyendas a cero, ocho GPU H100, microbatch 2, acumulación de gradiente 1 y batch global 16. La mezcla de datos es 50/50 entre CC12M —usando explícitamente el campo `long_caption` y preservando los párrafos de la leyenda, sin sustituirla por leyendas cortas— y e621 con sus leyendas originales; cada fuente se limita a 65.536 imágenes. Los recortes cuadrados aleatorios siguen la receta de Anima. La revisión del modelo SFT empleada es `fc5de0d56fc910cbca6f6625a70f5f582b26deb1` y el entrenamiento usa la rejilla de ruido nativa de MOSS sin desplazamiento.

La etapa 1 consiste en un preentrenamiento Forward MeanFlow: 10.000 actualizaciones con learning rate 6e-5 y decaimiento EMA por paso de 0,995. La etapa 2 se inicializa desde el adaptador EMA final de la etapa 1, con optimizador y scheduler reiniciados, y ejecuta 1.500 actualizaciones con learning rate 2e-6, decaimiento EMA de 0,99, escala de fusión de guidance 3, guidance de score real 3 y pérdida forward co-entrenada. La validación se hace con 4 pasos de muestreo, CFG 1, semilla 42, a 512 px y 1024 px, con el schedule de MOSS sin desplazamiento y snapping a la rejilla nativa. En inferencia, la carga del adaptador de etapa 2 usa `flowmap_deltatime_type="r"` y `flowmap_gate_value=0.25`, lo que confirma que el mecanismo aprendido es un flow map condicionado por delta de tiempo.

## Capacidades

- Generación de imágenes a partir de prompts de texto, sobre el checkpoint `MOSS-Image-SFT`.
- Muestreo en pocos pasos: la validación declarada usa 4 pasos de inferencia con CFG 1.
- Trabajo a dos resoluciones de referencia: 512 px y 1024 px, con snapping a la rejilla nativa de MOSS.
- Composición con el modelo base: el adaptador se carga sobre el pipeline `MOSSImagePipeline` de SimpleTuner y puede combinarse con el scheduler `AnyFlowValidationScheduler`.
- Cobertura de dominio derivada de los datos: CC12M aporta escenas y fotografía web con leyendas largas; e621 aporta ilustración antropomórfica con sus leyendas originales.
- No soporta tool calling ni function calling: es un modelo de generación de imágenes, no un modelo de lenguaje.
- No soporta razonamiento multi-paso, agentes, entrada de visión ni audio.
- No se documentan capacidades de edición de imagen, inpainting, control por pose ni condicionamientos adicionales.

## Casos de uso

- Investigación en destilación de difusión: el repositorio sirve como referencia reproducible de una receta AnyFlow de dos etapas, con hiperparámetros, configuraciones de dataloader y prompts de validación publicados, para comparar Forward MeanFlow frente a otros esquemas de pocos pasos.
- Evaluación de muestreo en 4 pasos: validar con semilla fija 42, CFG 1 y resoluciones 512/1024 px permite medir de forma controlada la degradación de calidad al reducir pasos frente al modelo base sin adaptador.
- Generación por lotes en pipelines internos: al reducir el número de pasos de muestreo, el coste por imagen baja y el adaptador encaja en tareas de previsualización masiva, siempre que se disponga de GPU con memoria suficiente para el modelo base en BF16 (VRAM no documentada).
- Creación de ilustración estilizada: la parte e621 del dataset orienta el adaptador hacia ilustración de personajes; es adecuado para prototipado visual con revisión humana y filtrado de contenido, dado el carácter sensible de esa fuente.
- Punto de partida para fine-tuning posterior: al ser un LoRA de rango 128, puede servir como inicialización para ajustes específicos de dominio con SimpleTuner, reutilizando la configuración de entrenamiento publicada.
- Docencia y reproducción de experimentos: los ficheros `training_config.json`, `dataloader.json` y `prompts.json` permiten reconstruir el pipeline de entrenamiento en un entorno de ocho H100 para prácticas de ajuste de modelos de difusión.
- Integración en herramientas de autoría: cargable desde diffusers con `load_lora_weights`, se puede incorporar en interfaces de generación de imágenes que ya usen el pipeline de MOSS, sustituyendo el scheduler por el de AnyFlow.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas cuantitativas (FID, CLIP score, preferencia humana) ni comparaciones numéricas con otros adaptadores. Lo único documentado es el protocolo de validación, que se recoge a continuación como configuración y no como resultado de rendimiento:

| Parámetro de validación | Valor |
|---|---|
| Pasos de muestreo | 4 |
| Escala de CFG | 1 |
| Semilla | 42 |
| Resoluciones | 512 px y 1024 px |
| Schedule | MOSS sin desplazamiento, con snapping a la rejilla nativa |
| Comparaciones publicadas | live frente a EMA, en ambas resoluciones (directorio `validation_images`, sin resultados numéricos) |

## Requisitos de hardware

- Entrenamiento: ocho GPU H100, microbatch 2, acumulación de gradiente 1 y batch global 16, según la receta declarada. La memoria por GPU no se especifica.
- Inferencia: requiere cargar el modelo base `OpenMOSS-Team/MOSS-Image-SFT` en BF16 más el adaptador LoRA. La VRAM necesaria no está documentada en la información disponible.
- GPU de consumo: no se puede confirmar que quepa en GPU de consumo, porque se desconoce el tamaño del modelo base. La validación a 1024 px exige más memoria que la de 512 px.
- Despliegue: la vía documentada es diffusers con `MOSSImagePipeline` de SimpleTuner, `load_lora_weights` y `AnyFlowValidationScheduler` instalando los hooks del pipeline. No hay soporte declarado para vLLM, TGI, llama.cpp ni Ollama, que además no aplican a un modelo de difusión de imágenes.
- Latencia y throughput: no disponibles. Cualitativamente, 4 pasos de muestreo con CFG 1 implican un número de evaluaciones del transformer muy inferior al de una configuración típica de 25-50 pasos con guidance, pero no se publican medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / resolución | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `SimpleTuner/moss-image-sft-anyflow-stage1` | LoRA AnyFlow etapa 1 sobre MOSS-Image-SFT | LoRA rango 128 BF16; total no disponible | 512 px (entrenamiento), validación 512/1024 px | Sin métricas publicadas | apache-2.0 | Estado queued, 0/10.000 actualizaciones, sin checkpoints |
| `SimpleTuner/moss-image-sft-anyflow-stage2` | LoRA AnyFlow etapa 2, inicializado desde la EMA de etapa 1 | LoRA; total no disponible | Validación 512/1024 px | Sin métricas publicadas | no disponible en la información | Referenciado como adaptador de inferencia; publicación de checkpoints no confirmada |
| `OpenMOSS-Team/MOSS-Image-SFT` | Modelo base texto-a-imagen | no disponible | no disponible | Sin métricas en la información | no disponible en la información | Público en HuggingFace (referenciado) |
| `bghira/anima-anyflow-e621-stage1-v2` | Receta AnyFlow de referencia sobre otro modelo base | no disponible | 512 px de área equivalente | Sin métricas en la información | no disponible en la información | Público (referenciado como configuración) |

## Limitaciones y advertencias

- Estado del entrenamiento: la model card declara `queued` con 0 de 10.000 actualizaciones observadas, por lo que no hay evidencia de que se haya producido un adaptador utilizable ni checkpoints publicados.
- No es un artefacto de inferencia: la propia documentación indica usar el adaptador de la etapa 2 para generar imágenes; la etapa 1 es un paso intermedio de preentrenamiento Forward MeanFlow.
- Ausencia total de métricas: no hay FID, CLIP score ni evaluaciones de preferencia, de modo que no se puede afirmar ninguna ganancia de calidad frente al modelo base.
- Sesgos de los datos: CC12M es una muestra de imágenes web con los sesgos demográficos y culturales habituales de ese corpus; e621 contiene contenido antropomórfico y material sensible, lo que puede sesgar el estilo y el contenido generado hacia ese dominio.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomía incorrecta, texto ilegible en la imagen y escenas incoherentes con el prompt, especialmente a 4 pasos y CFG 1.
- Idioma: las leyendas de entrenamiento están en inglés, por lo que el comportamiento con prompts en castellano no está documentado ni garantizado.
- Restricciones de licencia: el adaptador es apache-2.0, pero el uso comercial depende también de la licencia del modelo base `MOSS-Image-SFT`, que no se especifica en la información disponible; conviene verificar ese punto antes de un despliegue en producción.
- Datos no redistribuidos: la model card indica explícitamente que los ficheros de los datasets no se redistribuyen, así que la reproducibilidad exige descargar CC12M y e621 por separado y asumir sus condiciones de uso.
- Coste de reproducción: la receta requiere ocho H100 y un volumen de datos de hasta 131.072 imágenes, lo que limita la replicación a entornos con recursos considerables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SimpleTuner/moss-image-sft-anyflow-stage1
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Adaptador de etapa 2 para inferencia: https://huggingface.co/SimpleTuner/moss-image-sft-anyflow-stage2
- Colección de experimentos AnyFlow de Anima: https://huggingface.co/collections/bghira/anyflow-anima-v10
- Configuración de referencia etapa 1: https://huggingface.co/bghira/anima-anyflow-e621-stage1-v2
- Configuración de referencia DMD: https://huggingface.co/bghira/anima-anyflow-e621-dmd-v5
- Dataset CC12M: https://huggingface.co/datasets/laion/conceptual-captions-12m-webdataset
- Leyendas largas estructuradas de CC12M: https://huggingface.co/datasets/webshart/cc12m-structured-captions
- Dataset e621: https://huggingface.co/datasets/NebulaeWis/e621-2024-webp-4Mpixel
- Ficheros de configuración del repositorio: `training_config.json`, `dataloader.json`, `prompts.json` (en la raíz del repositorio de HuggingFace)
- Previsualizaciones de validación: directorio `validation_images` del repositorio (live frente a EMA a 512 px y 1024 px)
