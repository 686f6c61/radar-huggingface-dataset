# jialidddh/MiniMax-H3-People-Vehicle-Removal-LoRA

## Resumen

MiniMax-H3 People & Vehicle Removal LoRA es un adaptador LoRA de rango 32 (125 MiB en BF16) desarrollado por el usuario jialidddh sobre el modelo base MiniMaxAI/MiniMax-H3, un modelo de generación de vídeo a partir de imagen y texto (image-text-to-video). Su función es editar vídeo eliminando personas y vehículos de escenas de calle, tanto en proyección en perspectiva como en panoramas equirectangulares de 360 grados, generando un vídeo de fondo limpio a partir de tres imágenes de referencia suministradas en orden temporal y un prompt de eliminación.

La relevancia técnica del adaptador reside en que transfiere la capacidad de eliminación aprendida en pares de perspectiva a escenas panorámicas sin disponer de pares 360 de eliminación etiquetados: el entrenamiento conjunto sobre 3.598 clips de reconstrucción panorámica y 3.037 pares de eliminación en perspectiva permite que el modelo elimine sujetos en panoramas manteniendo la capacidad generativa panorámica del modelo base. Según la model card, la tasa de fotogramas con detecciones de personas o vehículos baja del 81,9% al 25,7% en panoramas y del 15,7% al 0,0% en perspectiva.

Se distribuye como contribución de investigación gratuita y no comercial bajo la MiniMax H3 Community License Agreement, con acceso restringido (gated) que exige aceptar las cláusulas de territorio aplicable de la licencia. El repositorio no incluye los datos de entrenamiento ni los objetivos pseudo-limpios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre el DiT de MiniMax-H3 (adaptador de atención en `qkv_proj` / `out_proj`) |
| Parámetros totales | no disponible (el adaptador ocupa 125 MiB en BF16; los parámetros del modelo base no se detallan) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (configuración de inferencia: 107 fotogramas a 24 fps) |
| Tipos de cuantización | BF16 (checkpoint publicado); no se documentan otras cuantizaciones |
| Idiomas soportados | en, zh |
| Licencia | MiniMax H3 Community License Agreement (uso no comercial, acceso gated) |
| Formato de pesos | safetensors (rank 32, BF16, 125 MiB) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 insertado en las proyecciones de atención `qkv_proj` y `out_proj` del DiT de MiniMax-H3, en su variante Ref2VA (referencia a vídeo/audio). El modelo base es un modelo de generación de vídeo condicionado por imagen y texto que integra codificadores Qwen y VAE para las referencias; el LoRA no modifica la arquitectura, solo añade matrices de bajo rango sobre las capas de atención indicadas.

El entrenamiento empleó 6.635 clips: 3.598 clips de reconstrucción panorámica y 3.037 pares de eliminación de personas y vehículos en perspectiva, derivados del subconjunto SpatialVID de SolarWM-Data; los clips panorámicos se curaron mediante PanoVid/PanoWan a partir de fuentes como 360-1M, Imagine360, Panonut360 y WEB360. Se usó AdamW con learning rate 5e-5 y batch global 16, y el checkpoint publicado corresponde al paso 1.000. La innovación destacable es la función de pérdida de preservación de guía inversa con guía 3.5: la rama casi vacía sin gradiente emplea el LoRA actual, texto casi vacío, sin imágenes de Qwen y las mismas referencias VAE, lo que permite transferir la eliminación a panoramas sin pares 360 supervisados.

## Capacidades

- Eliminación de personas y vehículos en vídeo de escenas de calle, generando un fondo limpio a partir de tres imágenes de referencia en orden temporal.
- Edición de vídeo panorámico equirectangular de 360 grados, incluida la limpieza de artefactos de captura en el nadir y de partes del cuerpo del operador de cámara cercanas a la cámara.
- Generación de vídeo condicionada por imagen y texto (pipeline image-text-to-video) heredada del modelo base Ref2VA.
- Salida de vídeo de 107 fotogramas a 24 fps, con resolución de 960 × 480 para panorama y 832 × 480 para perspectiva.
- Soporte de referencias multimodales a través de Qwen y VAE, suministradas en orden temporal.
- Idiomas de prompt: inglés y chino.
- No se documenta soporte de tool calling, agentes, audio de salida (desactivado en la configuración recomendada) ni otras capacidades del modelo base.

## Casos de uso

- Limpieza de metraje de vigilancia o tráfico: eliminar viandantes y vehículos de clips de calle para generar fondos neutros reutilizables en simulaciones o datasets sintéticos, usando tres fotogramas de referencia y un prompt de eliminación.
- Producción de vídeo inmersivo 360: limpiar panoramas equirectangulares de personas y del operador de cámara (cabeza, hombros, brazo en el nadir) antes de publicar contenido VR, aprovechando la transferencia de capacidad a panoramas.
- Creación de plate shots para VFX: obtener un fondo limpio en perspectiva a 832 × 480 y 24 fps que sirva como capa base para composición digital, con referencias en los fotogramas 0/53/106.
- Anonimización de material audiovisual: reducir la presencia de personas identificables en grabaciones de calle antes de difundirlas, con la advertencia de que la tasa de detección residual en panoramas es del 25,7%.
- Generación de datasets de reconstrucción panorámica: producir pares de vídeo con y sin sujetos para entrenar o evaluar modelos de reconstrucción de escena 360, dado el origen del entrenamiento en clips de reconstrucción.
- Investigación en edición de vídeo generativa: estudiar la transferencia de tareas entre dominios de perspectiva y panorámico mediante la pérdida de preservación de guía inversa, comparando salidas del modelo base y del LoRA con idénticos prompt, referencias y semilla.
- Prototipado de pipelines de postproducción: integrar el adaptador en flujos basados en DiffSynth-Studio para eliminar vehículos en planos concretos ajustando la descripción de escena y el movimiento de cámara del prompt.

## Benchmarks y rendimiento

Evaluación sobre cinco escenas panorámicas y cinco de perspectiva, semillas 42 y 123, con entradas y ajustes BF16 idénticos en cada comparación; las detecciones se miden con SAM3 sobre 21 fotogramas muestreados por salida.

| Métrica | Base | Este LoRA |
|---|---:|---:|
| Fotogramas panorámicos con detecciones de personas/vehículos (↓) | 81,9% | 25,7% |
| Fotogramas en perspectiva con detecciones de personas/vehículos (↓) | 15,7% | 0,0% |
| SSIM en perspectiva frente a objetivos pseudo-limpios (↑) | 0,325 | 0,392 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el adaptador pesa 125 MiB en BF16, pero requiere cargar el modelo base MiniMax-H3 Ref2VA en BF16.
- GPU recomendadas: no disponible; el modelo base es un modelo de vídeo de gran tamaño, por lo que se requiere hardware de datacenter (A100, H100 u equivalentes) para BF16, aunque no se confirma en la documentación.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: DiffSynth-Studio con los ejemplos de inferencia de H3 (`diffsynth.pipelines.minimax_h3_audio_video`), cargando el LoRA con `pipe.load_lora(..., alpha=1.0)`. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La configuración recomendada usa CFG 1.0 y 50 pasos de muestreo, con flow shift de vídeo 12 y de audio 3.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / salida | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3 People & Vehicle Removal LoRA | LoRA de eliminación sobre DiT de vídeo | 107 fotogramas a 24 fps; 960 × 480 panorama / 832 × 480 perspectiva | 25,7% y 0,0% de fotogramas con detecciones; SSIM 0,392 | MiniMax H3 Community License (no comercial, gated) | Hugging Face, 0 descargas |
| MiniMax-H3 (base) | Modelo image-text-to-video | Igual que el LoRA | 81,9% y 15,7% de fotogramas con detecciones; SSIM 0,325 | MiniMax H3 Community License | Hugging Face |
| Otros LoRA de edición de vídeo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre alternativas comparables de eliminación de sujetos en vídeo 360 en la documentación proporcionada.

## Limitaciones y advertencias

- La eliminación en panoramas es imperfecta: queda un 25,7% de fotogramas muestreados con detecciones de personas o vehículos, frente al 0,0% en perspectiva.
- No se entrenó con pares 360 de eliminación etiquetados; la limpieza panorámica depende de transferencia de tarea y puede fallar en escenas o sujetos alejados de la distribución de entrenamiento.
- Riesgo de artefactos de generación y de alucinación visual en las regiones editadas, especialmente en el nadir y en zonas ocluidas por los sujetos eliminados.
- El SSIM en perspectiva (0,392) indica una similitud moderada con los objetivos pseudo-limpios, no una reconstrucción exacta del fondo real.
- Idiomas de prompt limitados a inglés y chino; no se documenta soporte de castellano.
- Licencia MiniMax H3 Community License Agreement: uso no comercial, acceso restringido por país y obligación de cumplir la Sección V y el Exhibit A sobre territorios aplicables.
- El autor declara que no comercializa el proyecto; cualquier uso comercial requiere autorización separada de MiniMax.
- No se redistribuyen los datos de entrenamiento ni los objetivos pseudo-limpios, lo que dificulta la reproducibilidad completa.
- Configuración de inferencia sensible: se recomienda BF16, fuerza LoRA 1.0, CFG 1.0, 50 pasos y audio desactivado; desviarse puede degradar la calidad.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jialidddh/MiniMax-H3-People-Vehicle-Removal-LoRA
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Checkpoint v1: https://huggingface.co/jialidddh/MiniMax-H3-People-Vehicle-Removal-LoRA/blob/main/MiniMax-H3-People-Vehicle-Removal-Ref2VA-v1-step1000.safetensors
- Ejemplos de inferencia H3 en DiffSynth-Studio: https://github.com/modelscope/DiffSynth-Studio/tree/main/examples/minimax_h3
- Dataset SolarWM-Data: https://huggingface.co/datasets/junchaoh-cs/SolarWM-Data
- PanoVid / PanoWan: https://github.com/VariantConst/PanoWan
