# EllipsesMark/minimax-h3-vr180-sbs-lora

## Resumen

El modelo `EllipsesMark/minimax-h3-vr180-sbs-lora` es un adaptador LoRA (PEFT) desarrollado por EllipsesMark sobre el modelo MiniMax H3 (Hailuo 3.0) de MiniMaxAI. Su función es modificar el comportamiento del modelo base para que genere video VR180 estereoscópico en formato side-by-side: cada frame contiene la vista del ojo izquierdo en la mitad izquierda y la del ojo derecho en la mitad derecha, cada una como un hemisferio half-equirectangular de 180°×180°, a 24 fps y con el audio nativo del modelo base.

El problema que resuelve es la falta de capacidad nativa de video estereoscópico en MiniMax H3. Con este adaptador, un usuario puede generar clips inmersivos listos para visores como Quest, DeoVR o Skybox tras un sencillo postproceso (reescalado de 21:9 a 2:1 y etiquetado con metadatos esféricos). La relevancia actual radica en la creciente demanda de contenido VR180 generado por IA sin necesidad de cámaras especializadas.

La arquitectura del adaptador es un LoRA de rank 32 (alpha = rank) aplicado a las proyecciones de atención `qkv_proj` y `out_proj` de los 50 bloques DiT y los 2 bloques text token-refiner del modelo base. El tamaño del repositorio es de 0.1 GB. La longitud de contexto no está especificada en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) de rank 32 sobre MiniMax H3 (Hailuo 3.0), un modelo de difusión con arquitectura DiT (Diffusion Transformer) |
| Parámetros totales | No disponible (adaptador de 0.1 GB) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MiniMax Community License (con cláusulas de atribución y territorio/ingresos) |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante PEFT LoRA con rank 32 (alpha igual al rank) sobre las proyecciones de atención `qkv_proj` y `out_proj` de todos los 50 bloques DiT del modelo base, más los 2 bloques text token-refiner. La pérdida utilizada es rectified-flow aplicada de forma conjunta al video y al audio. El entrenamiento se realizó en la plataforma de fal (app `fal-ai/minimax-h3-trainer`) con batch 1, optimizador AdamW con tasa de aprendizaje 2e-4 y decaimiento lineal, durante 2500 pasos, lo que supuso unas 3.9 horas en una GPU H200 y un coste de 12.50 dólares.

Los datos de entrenamiento consisten en 50 clips de 5.3 segundos extraídos de 27 videos VR180 reales de YouTube (caminatas en primera persona, naturaleza, espectáculos de parques temáticos y vlogs de ferias comerciales), seleccionados mediante el índice Stereo4D de Google de footage estéreo validado. El preprocesado ajusta cada frame side-by-side exactamente al bucket de entrenamiento de 896×384×124 frames a 24 fps (con cover+center-crop de fal convertido en no-op), conserva el audio estéreo a 32 kHz, elimina las barras letterbox y verifica la correlación entre ojos y la relación de aspecto. Las descripciones se generaron con Gemini 3.5 Flash Lite a través de fal, con una frase de layout constante antepuesta a cada caption y un trigger phrase. La innovación técnica clave es que el adaptador aprende un layout de frame y una proyección estéreo, no el contenido de los videos de entrenamiento.

## Capacidades

- Generación de video text-to-video con salida VR180 estereoscópica side-by-side: cada frame contiene la vista del ojo izquierdo y del derecho, cada una como hemisferio half-equirectangular de 180°×180°, a 24 fps.
- Audio nativo del modelo base MiniMax H3 preservado en la salida.
- Requiere el trigger `vr180sbs` al inicio del prompt, seguido de la frase de layout, para activar el modo estéreo.
- Generación en relación de aspecto 21:9 a resolución 768P nativa; soporta clips de hasta 15 segundos y rutas de upscale 2K/4K manteniendo el par estéreo (aunque no evaluadas).
- Compatibilidad con la infraestructura de fal para inferencia vía API (`minimax/h3/text-to-video/lora`), con control de escala LoRA.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Creación de contenido VR180 para visores: el modelo permite generar clips inmersivos de 5-15 segundos que, tras un postproceso con ffmpeg y la herramienta spatialmedia de Google, se reproducen en Quest, DeoVR o Skybox. Es adecuado porque el adaptador produce pares estéreo con disparidad horizontal de 3-7 píxeles por ojo a 768 píxeles, similar al footage VR180 real.
- Turismo virtual: se pueden generar paseos en primera persona por playas, montañas o parques temáticos con audio ambiental nativo. El LoRA está entrenado con footage de caminatas al aire libre, lo que garantiza resultados naturales en este tipo de escenas.
- Prototipado de video estéreo para investigación: el adaptador permite generar pares estéreo sintéticos con disparidad controlada sin necesidad de cámaras, útil para desarrollar y validar algoritmos de estimación de profundidad, correspondencia estéreo o reconstrucción 3D.
- Producción de espectáculos virtuales: se pueden recrear shows de parques temáticos o ferias comerciales en formato VR180, gracias a la inclusión de este tipo de footage en los datos de entrenamiento. La salida mantiene el audio nativo, lo que reduce el trabajo de postproducción.
- Vlogs inmersivos automatizados: un creador puede generar paseos en primera persona con sonido ambiental para canales de YouTube VR, usando el endpoint de fal y un prompt estructurado con el trigger y la descripción de la escena.
- Publicidad inmersiva de bajo coste: las marcas pueden producir anuncios en VR180 sin alquilar cámaras especializadas, ajustando la escala del LoRA (por ejemplo, 0.5) para obtener un efecto estéreo más sutil si se prefiere un aspecto menos agresivo.
- Generación de datos sintéticos para entrenamiento de modelos de visión: las salidas del modelo pueden usarse como dataset de pares estéreo para entrenar redes de disparidad o de fusión de vistas, dado que el layout side-by-side es fácil de separar en ojos izquierdo y derecho.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor reporta una evaluación interna con 4 prompts × 1 seed: en las pruebas piloto, 1000 pasos a 21:9 produjeron pares estéreo en 1 de cada 4 prompts, mientras que 1000 pasos a 16:9 (768×448) no produjeron ningún par estéreo. La configuración de producción (21:9 + captions con layout + 2500 pasos) logró 4 de 4. No hay datos comparativos con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El entrenamiento del adaptador se realizó en una GPU H200 durante unas 3.9 horas, pero no se especifica la VRAM necesaria para inferencia.
- GPU recomendadas: no disponible. Para entrenamiento se usó una H200; la inferencia se delega en la infraestructura de fal.
- ¿Cabe en GPU de consumo? No disponible.
- Opciones de despliegue: API de fal con el endpoint `minimax/h3/text-to-video/lora`; también se puede usar el trainer de fal para ajustes adicionales. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La información disponible no incluye comparativas con modelos o adaptadores similares. La comparación más directa es con el modelo base MiniMax H3 sin el adaptador: el LoRA añade la capacidad de generar video VR180 estereoscópico side-by-side, mientras que el base produce video mono con la misma calidad de texto y caras. No se dispone de datos sobre otros LoRA de VR180 para este modelo.

## Limitaciones y advertencias

- Viñetas oscuras tipo "porthole" sobreenfatizadas en el borde exterior de cada ojo en algunos prompts, heredadas del footage VR180 nativo de cámara.
- Sesgo hacia paseos al aire libre en primera persona: una única fuente de canal aporta 20 de los 50 clips de entrenamiento.
- La calidad de texto y rostros no mejora respecto al modelo base MiniMax H3.
- Los paneos rápidos pueden causar deriva entre los dos ojos, rompiendo la alineación estéreo.
- La validación es limitada: solo se evaluó con 4 prompts × 1 seed, por lo que el autor recomienda probar con un visor antes de confiar en el resultado.
- Las salidas a 2K/4K en fal son upscales SeedVR del pase de 768P y no han sido evaluadas para consistencia estéreo.
- La ruta de LoRA de 8 pasos `minimax/h3-max` degrada el par estéreo; se debe usar el endpoint `minimax/h3`.
- La licencia MiniMax Community License incluye cláusulas de atribución y restricciones de territorio/ingresos; es necesario revisar los términos antes de un uso comercial.
- Los clips de entrenamiento se descargaron de YouTube bajo licencia estándar para investigación y no se redistribuyen; el adaptador solo aprende el layout y la proyección, no el contenido de los videos.

## Enlaces

- HuggingFace: https://huggingface.co/EllipsesMark/minimax-h3-vr180-sbs-lora
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Herramienta spatialmedia de Google: https://github.com/google/spatial-media
- Índice Stereo4D: https://stereo4d.github.io
- Aplicación de entrenamiento en fal: `fal-ai/minimax-h3-trainer` (referencia en el README; no se proporciona URL directa)
