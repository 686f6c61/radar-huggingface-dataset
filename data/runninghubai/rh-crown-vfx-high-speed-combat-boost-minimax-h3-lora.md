# RunningHubAI/rh-crown-vfx-high-speed-combat-boost-minimax-h3-lora

## Resumen

rh-crown-vfx-high-speed-combat-boost-minimax-h3-lora es un adaptador LoRA de vídeo publicado por RunningHubAI en nombre del autor NineCrowns (identificado como [CROWN]). No es un modelo de lenguaje, sino un ajuste fino de bajo rango diseñado para el modelo generativo de vídeo MiniMax H3, en sus variantes Ref2VA, I2VA y T2VA, que combina generación de vídeo con audio estéreo nativo. Su propósito es intensificar la coreografía de combate cuerpo a cuerpo y con armas a alta velocidad, el movimiento de cámara dinámico en el eje Z, los efectos de fluido plasmático y las ondas de choque con partículas.

El adaptador se entrenó sobre un clúster de 8 GPU NVIDIA B200 con rango 64 y alpha 64, aplicando la actualización únicamente a los bloques de vídeo 10 a 49 del transformer subyacente. Esta separación por capas busca preservar la identidad facial de los personajes de referencia y no contaminar la pista de audio estéreo nativa del modelo base. El repositorio ocupa 1,2 GB y contiene un único archivo de pesos en formato safetensors de 1138 MiB.

Su relevancia es acotada pero concreta: cubre un nicho de producción de vídeo generativo orientado a escenas de acción y efectos visuales, donde los modelos base suelen producir movimientos lentos o poco creíbles. La ficha se limita a los datos publicados en la model card; no hay información sobre benchmarks, licencia explícita ni idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de vídeo MiniMax H3; actualización restringida a bloques de vídeo 10–49 |
| Parámetros totales | no disponible (rango 64, alpha 64; tamaño del archivo 1138 MiB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos distribuidos en safetensors; el modelo base se referencia en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que el copyright permanece con el autor y remite a la licencia del proyecto original) |
| Formato de pesos | safetensors (`CROWN_H3_VFX_Combat_Boost_V2_r64.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 con alpha 64 entrenado por NineCrowns sobre un clúster de 8 GPU NVIDIA B200. La innovación técnica declarada es el aislamiento de capas: la actualización se aplica exclusivamente a los bloques de vídeo 10 a 49 del modelo MiniMax H3, sin tocar las capas asociadas a la identidad facial de referencia ni a la generación de audio. Según el autor, esto permite reforzar el movimiento y los efectos sin degradar el parecido del personaje ni la pista estéreo nativa.

El modelo base es `minimax_h3_ref2va_bf16.safetensors`, que se ejecuta con 24 pasos, sampler `euler` y `ManualSigmas`, con `shift_video: 12.0` y `shift_audio: 3.0`. La model card no detalla el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de alineación como RLHF o DPO. El peso recomendado del LoRA en inferencia es alto, entre 1,20 y 1,50, y requiere la palabra de activación `crown_vfx_combat`.

## Capacidades

- Generación de vídeo con efectos visuales de combate: refuerza coreografías de artes marciales y manejo de armas a alta velocidad.
- Movimiento de cámara dinámico, con seguimiento en el eje Z y travellings agresivos.
- Efectos de fluido plasmático y estelas de energía en los golpes.
- Ondas de choque y partículas de escombros en tres clases declaradas por el autor.
- Preservación de la identidad facial de los personajes de referencia (Ref2VA, I2VA).
- Conservación de la pista de audio estéreo nativa del modelo base.
- Compatible con los modos Ref2VA (referencia a vídeo y audio), I2VA (imagen a vídeo y audio) y T2VA (texto a vídeo y audio) de MiniMax H3.
- No dispone de tool calling, razonamiento multi-paso ni capacidades de agente: es un adaptador puramente generativo de vídeo.

## Casos de uso

- Previsualización de escenas de acción en cine y animación: el LoRA acelera y hace más creíble la coreografía de peleas, útil para animáticas y previz antes del rodaje o de la producción final.
- Generación de clips de artes marciales para videojuegos: permite producir tráilers y cinemáticas con combate cuerpo a cuerpo y con armas sin animación manual.
- Efectos visuales de energía y plasma: los golpes con estelas fluidas y ondas de choque sirven para pruebas de concepto de VFX en publicidad y cortinillas.
- Contenido para redes sociales y canales de acción: creación de clips verticales u horizontales con movimiento de cámara agresivo a partir de una imagen o un texto de referencia.
- Producción con personaje fijo: al preservar la identidad facial en modos Ref2VA e I2VA, encaja en series o campañas donde el mismo personaje aparece en múltiples escenas de combate.
- Doblaje y audio integrado: al no contaminar la pista estéreo, permite generar vídeo de acción manteniendo el audio nativo del modelo base para sincronización posterior.
- Iteración rápida en ComfyUI: al ser un LoRA ligero (1,2 GB), se puede cargar y descargar en flujos de trabajo de ComfyUI para comparar variantes de intensidad con pesos entre 1,20 y 1,50.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 1138 MiB en disco; la VRAM necesaria la determina el modelo base MiniMax H3, no el LoRA.
- El modelo base se referencia en bf16 (`minimax_h3_ref2va_bf16.safetensors`), lo que implica requisitos de memoria elevados; no se especifica la VRAM exacta en la información disponible.
- El entrenamiento se realizó en 8 GPU NVIDIA B200, lo que da una idea del orden de magnitud del modelo base.
- No hay datos publicados sobre si cabe en GPU de consumo (RTX 4090 u otras) ni sobre cuantizaciones disponibles.
- Despliegue previsto en ComfyUI, RunningHub y Hugging Face; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de vídeo.
- Latencia y throughput no disponibles. La configuración recomendada es de 24 pasos con sampler `euler` y `ManualSigmas`.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros LoRA de combate o efectos visuales para MiniMax H3 ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La licencia no está especificada; la model card remite a la licencia del proyecto original y advierte de que el copyright permanece con el autor. Antes de un uso comercial hay que verificar la licencia de MiniMax H3 y la del adaptador.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria ni informes independientes de calidad.
- No hay información sobre sesgos, tasas de alucinación visual ni evaluación cualitativa por terceros.
- El adaptador está entrenado para un estilo muy concreto (combate rápido y VFX); fuera de ese dominio puede degradar la generación o introducir artefactos.
- Requiere la palabra de activación `crown_vfx_combat` y pesos altos (1,20–1,50); con otros valores el efecto puede ser nulo o excesivo.
- Depende de una configuración específica del modelo base (24 pasos, `euler`, `ManualSigmas`, shifts 12.0/3.0); desviarse de ella puede alterar el resultado.
- No se documentan idiomas soportados ni límites de contexto; al ser un modelo de vídeo, estos parámetros no aplican del mismo modo que en un LLM.
- El contenido generado de combate y violencia requiere revisión y políticas de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-crown-vfx-high-speed-combat-boost-minimax-h3-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2120441999441563649
- Página del autor (NineCrowns): https://www.runninghub.ai/user-center/2120428923636236289
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-crown-vfx-high-speed-combat-boost-minimax-h3-lora/blob/main/README_cn.md
