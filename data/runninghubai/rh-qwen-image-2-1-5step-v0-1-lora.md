# RunningHubAI/rh-qwen-image-2.1-5step-v0.1-lora

## Resumen

`rh-qwen-image-2.1-5step-v0.1-lora` es un adaptador LoRA de texto-a-imagen publicado por RunningHubAI (RunningHub) que se carga sobre el modelo base Qwen-Image-2.1 y reduce la generación a 5 pasos de muestreo. El adaptador se entrenó con el método DMD (distribution matching distillation) y viene acompañado de una secuencia de sigmas específica (`1.0, 0.94, 0.857142857, 0.666666667, 0.4`), lo que implica que no funciona con schedulers ni número de pasos arbitrarios.

El modelo resuelve un problema de coste de inferencia: en lugar de decenas de evaluaciones del DiT, permite obtener una imagen en 5 pasos con CFG fijo a 1.0 y prompt negativo vacío. Según el autor, mantiene la capacidad de generar hojas de identidad de personaje coherentes en alta resolución, una de las capacidades que RunningHub atribuye al modelo base Qwen-Image-2.1.

El repositorio contiene un único archivo de 320 MiB (`p_qwen_image_2.1_5step_v0.1.safetensors`), no declara licencia propia, no publica resultados de benchmarks y no tiene descargas ni valoraciones en el momento de redactar esta ficha. Existe un hermano de la misma serie de 8 pasos (`p_qwen_image_2.1_8step_v0.1.safetensors`) con mayor calidad y menor velocidad, incompatible con este en la misma carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Qwen-Image-2.1, un DiT de una sola corriente con 32 capas en su componente de generación visual |
| Parametros totales | No disponible para el adaptador (archivo de 320 MiB); el modelo base Qwen-Image-2.1 declara 7B en su componente de generación visual |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo texto-a-imagen); no disponible la longitud de prompt del codificador de texto del base |
| Tipos de cuantizacion | No disponible; el repositorio solo distribuye pesos safetensors del adaptador |
| Idiomas soportados | No disponibles; la model card se publica en chino e inglés, pero no se declara cobertura lingüística |
| Licencia | No disponible en el repositorio; la model card remite a la licencia del proyecto original (Qwen-Image-2.1) |
| Formato de pesos | safetensors (LoRA), 1 archivo de 320 MiB |
| Pasos de muestreo | 5 (fijos) |
| Secuencia de sigmas | `1.0, 0.94, 0.857142857, 0.666666667, 0.4` |
| CFG requerido | 1.0, con prompt negativo vacío |
| Metodo de destilacion | DMD |
| Plataformas declaradas | ComfyUI, RunningHub, Hugging Face |
| Modelo base | qwen-image-2.1 |

## Arquitectura y entrenamiento

El adaptador no es un modelo completo: es un conjunto de pesos LoRA que se inyecta en el transformador de difusión (DiT) de Qwen-Image-2.1, descrito por sus autores como un DiT de una sola corriente con 32 capas y 7B de parámetros en el componente de generación visual, que unifica generación texto-a-imagen y edición de imagen. El pipeline, el codificador de texto y el VAE del modelo base no se modifican.

El entrenamiento emplea DMD (destilación por coincidencia de distribuciones), una técnica de destilación por pasos que colapsa el muestreo en una trayectoria corta y fija. De ahí la restricción operativa que el autor hace explícita: el adaptador debe ejecutarse con CFG = 1.0, prompt negativo vacío, exactamente 5 pasos y la secuencia de sigmas propietaria; cualquier otro scheduler o recuento de pasos queda fuera del régimen de entrenamiento y produce artefactos. No se documentan en la información disponible el número de tokens, la composición del dataset, ni si hubo fases de RLHF/DPO (no aplicables habitualmente en difusión, pero no confirmado).

## Capacidades

- Generación texto-a-imagen con muestreo de 5 pasos, pensada para iteración rápida y producción en lote.
- Generación de hojas de identidad de personaje o sujeto ("character sheet") en alta resolución con consistencia entre vistas, según la afirmación del autor.
- Integración nativa en ComfyUI mediante el ecosistema de LoRA (etiqueta `comfyui` y `lora` del repositorio).
- Ejecución en la plataforma RunningHub y a través de su API, además de carga local.
- Compatibilidad con el pipeline del modelo base Qwen-Image-2.1, incluido su componente de edición de imagen (el adaptador se ha entrenado para generación; su comportamiento en edición no está documentado).
- Sin soporte de tool calling, function calling, agentes ni razonamiento multi-paso: la tarea es exclusivamente síntesis de imagen.
- Capacidades multilingües de prompt: no declaradas.
- No hay modo "thinking", visión de entrada ni audio.

## Casos de uso

- **Hojas de personaje para preproducción de videojuegos**: el adaptador apunta explícitamente a generar una hoja de identidad con el mismo personaje en varias poses y ángulos en alta resolución y en una sola generación, lo que reduce el trabajo manual de mantener consistencia entre vistas.
- **Iteración de concept art en ComfyUI**: con 5 pasos y CFG = 1.0, el coste por imagen cae aproximadamente un orden de magnitud frente a un muestreo completo de ~50 pasos, lo que permite explorar decenas de variantes por prompt en sesiones de diseño.
- **Generación de variaciones de catálogo en comercio electrónico**: al estar integrado en la API de RunningHub, se puede invocar en lote para producir variantes de un mismo producto manteniendo encuadre y estilo, aunque la fidelidad al producto real debe validarse manualmente.
- **Previsualización de storyboards para publicidad o cine**: la velocidad de muestreo permite generar fotogramas de referencia durante una reunión de guion, sustituyendo bocetos manuales por imágenes de ambientación.
- **Prototipado rápido de assets en pipelines de CI**: al ser un LoRA de 320 MiB, se puede versionar y desplegar junto al modelo base en un contenedor y regenerar sets de imágenes de prueba en cada cambio de estilo.
- **Exploración de estilos y fine-tuning interno**: sirve como punto de partida para equipos que quieran entrenar sus propios adaptadores sobre Qwen-Image-2.1, usando esta variante de 5 pasos como referencia de destilación DMD.
- **Generación de datasets sintéticos de apoyo**: útil para poblar sets de imágenes de entrenamiento o pruebas de sistemas de visión, siempre que se revise la calidad y no se requiera consistencia estricta de identidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas cuantitativas (FID, CLIP score, GenEval, DPGBench ni comparaciones con el modelo base sin adaptador), y la única afirmación cualitativa del autor es que la calidad de imagen del adaptador de 5 pasos es ligeramente inferior a la del de 8 pasos de la misma serie.

## Requisitos de hardware

- **VRAM del adaptador**: despreciable; el archivo safetensors ocupa 320 MiB y se suma a los pesos del modelo base.
- **VRAM del pipeline completo**: no disponible de forma oficial. Como estimación a partir de los 7B declarados en el componente de generación visual, en fp16 el DiT solo ocuparía unos 14 GB, a lo que hay que sumar codificador de texto, VAE y activaciones; un despliegue holgado en fp16 requeriría del orden de 32-40 GB.
- **GPU recomendadas**: A100 40/80 GB, H100, L40S o RTX 5090 (32 GB) para fp16 sin offloading; RTX 4090 (24 GB) viable con offloading a CPU o cuantización fp8 del base.
- **GPU de consumo**: sí cabe en tarjetas de 24 GB o más, con gestión de memoria; por debajo de 16 GB no hay datos que confirmen viabilidad sin cuantizar el modelo base.
- **Opciones de despliegue**: ComfyUI (soporte nativo declarado), plataforma y API de RunningHub, y carga directa en el pipeline de difusión del modelo base (por ejemplo, `load_lora_weights` en diffusers). No se documentan GGUF ni builds para llama.cpp/Ollama, que no aplican a un modelo de difusión.
- **Latencia y throughput**: no disponibles cifras medidas. Como referencia relativa, 5 pasos frente a los ~50 habituales de un muestreo completo implican aproximadamente 10 veces menos evaluaciones del DiT por imagen.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Pasos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-qwen-image-2.1-5step-v0.1-lora (este) | LoRA DMD sobre Qwen-Image-2.1 | 320 MiB de adaptador; base 7B en el DiT | 5 | No disponible en el repo | Hugging Face, ComfyUI, RunningHub |
| rh-qwen-image-2.1-8step-v0.1-lora | LoRA DMD de la misma serie | Adaptador de tamaño similar (no confirmado) | 8 | No disponible en el repo | RunningHub |
| Pruna `pruna_qwen_2.1_5step_v0.1` | LoRA DMD sobre Qwen-Image-2.1 | No disponible | 5 u 8 | No disponible | Repositorio de Pruna AI y agregadores de modelos |
| Qwen-Image-2.1 (base) | DiT de una sola corriente, 32 capas | 7B en el componente de generación visual | Depende del scheduler | Licencia del proyecto Qwen-Image-2.1 | GitHub QwenLM, Hugging Face |

No se han publicado comparaciones de calidad (FID, CLIP, preferencia humana) entre estas variantes en la información disponible. La nomenclatura del archivo (`p_qwen_image_2.1_5step_v0.1.safetensors`) coincide con la de los adaptadores de Pruna AI, pero el repositorio no documenta ninguna relación con ese proyecto.

## Limitaciones y advertencias

- **Restricciones de muestreo estrictas**: solo funciona con 5 pasos, CFG = 1.0, prompt negativo vacío y la secuencia de sigmas indicada. Cualquier desviación queda fuera de la distribución de entrenamiento y genera imágenes defectuosas.
- **Calidad inferior al hermano de 8 pasos**: el propio autor reconoce que la variante de 5 pasos sacrifica calidad de imagen frente a la de 8 pasos.
- **Incompatibilidad entre adaptadores**: los LoRA de 5 y 8 pasos no pueden cargarse simultáneamente.
- **Licencia no declarada**: el repositorio no especifica licencia propia y remite a la del proyecto original; antes de un uso comercial hay que verificar la licencia de Qwen-Image-2.1 y las condiciones de RunningHub.
- **Ausencia de benchmarks**: no hay métricas objetivas de calidad, fidelidad al prompt ni consistencia de identidad; la afirmación sobre hojas de personaje consistentes es una declaración del autor no verificada de forma independiente.
- **Riesgo de alucinación visual**: como todo modelo generativo de imagen, puede producir anatomía incorrecta, texto ilegible en la imagen, marcas de agua espurias o detalles incoherentes, especialmente a resoluciones altas y con prompts largos.
- **Sesgos**: no se documenta ninguna evaluación de sesgos demográficos, culturales o de representación; al heredar los datos del modelo base, es esperable que arrastre sus sesgos, sin cuantificar.
- **Idiomas**: no se declara cobertura lingüística del codificador de texto; se desconoce el rendimiento con prompts en castellano.
- **Madurez del artefacto**: cero descargas y cero valoraciones, publicación con un único archivo y sin documentación técnica de entrenamiento. No es un artefacto validado por la comunidad.
- **Trazabilidad de la fecha**: la model card indica creación y actualización el 2026-10-23, con un minuto de diferencia entre ambas; conviene no tratar los metadatos temporales como indicador de estabilidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-qwen-image-2.1-5step-v0.1-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2107820730116296705
- Página del autor en RunningHub: https://www.runninghub.cn/user-center/1929731488613310465
- Ficha relacionada en RunningHub (Qwen-Image-2.1-5step): https://www.runninghub.ai/model/public/2104336231231684609
- Repositorio del modelo base Qwen-Image-2.1: https://github.com/QwenLM/Qwen-Image-2.1
- README en chino del adaptador: https://huggingface.co/RunningHubAI/rh-qwen-image-2.1-5step-v0.1-lora/blob/main/README_cn.md
- Adaptadores equivalentes de Pruna AI (referencia externa): https://civarchive.com/models/2958738
- Documentación de la API de RunningHub (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Plataforma RunningHub internacional: https://www.runninghub.ai
- Plataforma RunningHub China: https://www.runninghub.cn
