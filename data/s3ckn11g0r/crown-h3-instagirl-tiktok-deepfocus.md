# S3ckn11g0r/CROWN-H3-InstaGirl-TikTok-DeepFocus

## Resumen

CROWN-H3-InstaGirl-TikTok-DeepFocus es un LoRA de estilo para el modelo de generación de vídeo MiniMax H3, desarrollado por el creador independiente NineCrowns (identificado como `[CROWN]` o `S3ckn11g0r` en Hugging Face). No se trata de un modelo base autónomo, sino de un adaptador de bajo rango que se aplica sobre los pesos de MiniMax H3 para modificar el aspecto visual de los vídeos generados: fuerza un look de cámara de móvil real (iPhone 16 Pro, apertura f/8.0), con profundidad de campo amplia, piel mate con microtextura y movimiento corporal natural de tipo "outfit of the day" (OOTD) al estilo TikTok o Douyin.

El adaptador se entrenó específicamente para eliminar tres artefactos que el autor atribuye al MiniMax H3 por defecto: la iluminación de estudio sintética, el brillo plástico o aceitoso en la piel y el desenfoque de fondo tipo bokeh de apertura grande (f/1.4). El resultado buscado es un vídeo con estética de grabación cándida con smartphone, donde el fondo permanece nítido de principio a fin.

Es relevante en el nicho de la generación de vídeo vertical fotorrealista para redes sociales, donde la "sensación de cámara real" es un criterio de calidad subjetivo pero muy demandado. El repositorio ocupa 1,0 GB y contiene un único archivo de pesos de 910,06 MB. No dispone de descargas ni valoraciones en el momento de la ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre MiniMax H3; bloques de vídeo 10–49, rank 64 / alpha 64 |
| Parámetros totales | no disponible (adaptador de 910,06 MB en safetensors) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos distribuidos en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | no disponible (el prompt de instancia es en inglés) |
| Licencia | bespoke-lora-license (licencia a medida; enlace a perfil de Civitai del autor) |
| Formato de pesos | safetensors (`CROWN_H3_InstaGirl_TikTok_DeepFocus_V1_r64.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 con alpha 64 aplicado exclusivamente a los bloques de vídeo 10 a 49 del transformer de MiniMax H3, dejando fuera los bloques de audio. Según la model card, el entrenamiento se realizó sobre un clúster de 8 GPU NVIDIA B200 con un adaptador "Ostris De-Distillation" y una resolución nativa de 768×1344 (vertical, formato 9:16). El conjunto de datos declarado son 100 % grabaciones reales sin marca de agua, en 1080P/4K, procedentes de Douyin y TikTok/Shorts, centradas en OOTD y escenas cándidas de calle e interior.

La innovación técnica que declara el autor no está en la arquitectura del adaptador sino en el objetivo de entrenamiento: forzar un aspecto óptico concreto (profundidad de campo de f/8.0, iluminación ambiental natural, microtextura de piel mate) y un patrón de movimiento específico (balanceo corporal, giro de 45° con acortamiento facial). El modelo base empleado en las pruebas es `minimax_h3_ref2va_bf16.safetensors`, junto con el codificador de texto `qwen3vl_32b_minimax_h3_bf16.safetensors` y el VAE de vídeo `minimax_h3_video_vae_fp32.safetensors`. No se especifican el número de pasos de entrenamiento, el volumen exacto de horas de vídeo ni la composición detallada del dataset.

## Capacidades

- Generación de vídeo texto-a-vídeo (T2VA), imagen-a-vídeo (I2VA) y referencia-a-vídeo (Ref2VA) a través del modelo base MiniMax H3.
- Control de estética fotorrealista con aspecto de cámara de smartphone: profundidad de campo amplia, fondo nítido y sin bokeh de apertura grande.
- Reproducción de piel mate con microtextura y poros, evitando el brillo especular sintético.
- Movimiento corporal natural de tipo "fit-check" (balanceo, giro de cabeza, giro de 45° con perspectiva facial).
- Formato vertical 768×1344 o apaisado 1344×768.
- Palabra de activación específica: `crown_instagirl_real`.
- No se documentan capacidades de tool calling, agentes, razonamiento multietapa ni audio (aunque el modelo base parece tener componentes de audio, el LoRA solo afecta a bloques de vídeo).

## Casos de uso

- Creación de contenido vertical para TikTok, Reels y Shorts: el LoRA produce clips de 9:16 con estética de grabación cándida con móvil, adecuados para cuentas de moda, lifestyle o "outfit of the day" que necesitan material rápido sin rodaje real.
- Pruebas de vestuario y fit-check virtuales: un diseñador o marca puede generar variaciones de una prenda sobre un cuerpo en movimiento con cámara fija y fondo nítido, útil para previsualizar catálogos antes de la sesión fotográfica.
- Prototipado de anuncios para redes sociales: agencias que necesitan decenas de variantes de un mismo concepto con look "auténtico" y no publicitario pueden usar el adaptador con pesos de 0,70 a 0,80 para mantener consistencia estilística.
- Generación de fondos y escenarios nítidos: al eliminar el desenfoque de fondo, el LoRA sirve para escenas donde la arquitectura, el mobiliario o el entorno urbano deben ser legibles, como demostraciones de producto en interior o escaparates.
- Creación de personajes recurrentes en formato vídeo corto: combinado con el modo Ref2VA del modelo base, permite mantener la coherencia de un personaje entre clips con un aspecto de cámara consistente.
- Investigación sobre sesgos estéticos en generación de vídeo: el adaptador es un caso de estudio útil para analizar cómo un LoRA de estilo puede imponer cánones de belleza, iluminación y movimiento muy concretos sobre un modelo generalista.
- Flujos de trabajo en ComfyUI: al estar etiquetado para ComfyUI, se integra en pipelines nodales de generación de vídeo con MiniMax H3, lo que facilita la experimentación con distintos pesos y prompts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FVD, CLIP score, VBench ni comparativas numéricas) y se limita a describir cualitativamente el efecto visual del adaptador.

## Requisitos de hardware

- El adaptador pesa 910,06 MB y se suma a los pesos del modelo base MiniMax H3, que no se distribuyen en este repositorio; la VRAM total depende de la configuración del modelo base (no disponible en la información proporcionada).
- El entrenamiento se realizó en un clúster de 8 GPU NVIDIA B200, lo que indica que la inferencia del modelo base completo requiere hardware de centro de datos de gama alta.
- No hay datos sobre si el modelo base cabe en GPU de consumo (RTX 4090, 3090, etc.); el tamaño del repo (1,0 GB) corresponde solo al LoRA.
- Opciones de despliegue documentadas: ComfyUI con los archivos `minimax_h3_ref2va_bf16.safetensors`, `qwen3vl_32b_minimax_h3_bf16.safetensors` y `minimax_h3_video_vae_fp32.safetensors`; también se menciona el servicio en la nube RunningHub.
- Configuración de muestreo recomendada: 25 pasos, sampler `euler` con `beta`, CFG 1.0, `MiniMaxH3SigmaShift` con `shift_video: 12.0` y `shift_audio: 3.0`, peso del LoRA entre 0,70 y 0,80 (el showcase se generó a 0,75).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros LoRA de estilo para MiniMax H3 ni métricas que permitan una comparación rigurosa con alternativas de la misma categoría (por ejemplo, adaptadores de estética "iPhone real" para otros modelos de vídeo). Los únicos datos comparables son los del propio modelo base MiniMax H3, cuyas especificaciones completas no se detallan en esta ficha.

## Limitaciones y advertencias

- Licencia "bespoke-lora-license": es una licencia a medida, no una licencia estándar de código abierto; el enlace apunta al perfil de Civitai del autor. Es imprescindible revisar los términos antes de cualquier uso comercial, y no se garantiza permiso de redistribución ni de uso en productos.
- El adaptador impone un canon estético muy concreto (cuerpo, rostro, iluminación, movimiento) que puede reforzar sesgos de género, edad, etnia y tipo corporal presentes en los datos de Douyin y TikTok; no se documentan medidas de mitigación.
- Riesgo de alucinación visual: como todo modelo generativo de vídeo, puede producir anatomías inconsistentes, artefactos en manos, rostros o fondos, especialmente con prompts alejados del dominio de entrenamiento.
- El LoRA está entrenado para un dominio estrecho (OOTD y escenas cándidas verticales); su efecto fuera de ese dominio (otras resoluciones, formatos horizontales, escenas de acción) no está documentado.
- No se especifican los idiomas soportados; la palabra de activación y los ejemplos están en inglés, y el codificador de texto es Qwen3-VL 32B, pero no se confirma el comportamiento multilingüe del adaptador.
- El repositorio no tiene descargas ni valoraciones, y la fecha de creación (2026-11-11) es futura respecto a la información habitual de despliegue; conviene verificar la integridad del archivo con el SHA256 indicado (`EE5735BC44A878CFD99DB9FF5353322862D1A9391BD804F5DA8E9E3A4970A51B`).
- Requiere el modelo base MiniMax H3, que no se incluye en este repositorio; sin él, el LoRA no es funcional.

## Enlaces

- Hugging Face: https://huggingface.co/S3ckn11g0r/CROWN-H3-InstaGirl-TikTok-DeepFocus
- Civitai del autor: https://civitai.com/models/3044608
- Perfil de Civitai (licencia): https://civitai.com/user/NineCrowns
- RunningHub Online Cloud: https://www.runninghub.ai/model/public/2120439722723020802
