# kingfang008/BonFrame-JoyVASA-ONNX

## Resumen

El modelo `kingfang008/BonFrame-JoyVASA-ONNX` es un paquete de exportación ONNX que forma parte del pipeline de sincronización labial (lip-redraw) de la aplicación BonFrame, diseñado específicamente para hardware Apple Silicon. Su función principal es convertir audio de habla muestreado a 16 kHz en coeficientes de movimiento del modelo JoyVASA, que posteriormente se utilizan para animar retratos mediante el renderizador separado FasterLivePortrait-MLX. El paquete incluye cinco archivos: dos grafos ONNX (`joyvasa_audio_feat.onnx` y `joyvasa_denoise_step.onnx`), un archivo de metadatos JSON, un archivo de configuración de runtime y un archivo NPZ con pesos.

El modelo deriva del proyecto original [`jdh-algo/JoyVASA`](https://huggingface.co/jdh-algo/JoyVASA), distribuido bajo licencia MIT. La exportación incorpora el codificador HuBERT chino fijado dentro del grafo de características de audio, lo que permite el procesamiento de señales de voz sin dependencias externas adicionales. Con un tamaño de repositorio de 0,4 GB, es un modelo relativamente ligero, pensado para ejecución local en entornos con recursos limitados.

La relevancia de esta ficha radica en que ejemplifica un caso de uso práctico de modelos de animación de retratos basados en difusión, adaptados a formatos optimizados para inferencia en dispositivos de consumo. Aunque el modelo en sí no es un LLM ni un modelo de visión generalista, su integración en un pipeline de producción real demuestra la viabilidad de desplegar sistemas de síntesis de movimiento facial en hardware comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (grafos ONNX de audio a movimiento, derivados de JoyVASA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el codificador HuBERT está entrenado para chino, pero no se especifica soporte multilingüe) |
| Licencia | MIT |
| Formato de pesos | ONNX (`.onnx`), JSON (metadatos y configuración), NPZ (pesos de runtime) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de su origen en JoyVASA, un sistema de animación de retratos basado en difusión. El paquete contiene dos grafos ONNX: uno para extraer características de audio (`joyvasa_audio_feat.onnx`) y otro para el paso de denoising (`joyvasa_denoise_step.onnx`). El grafo de audio incluye un codificador HuBERT chino fijado, lo que sugiere que la entrada de voz se procesa mediante este modelo de representación del habla antes de generar los coeficientes de movimiento.

No se proporcionan datos sobre el conjunto de entrenamiento, el número de tokens o el proceso de optimización (RLHF, DPO, etc.). La exportación ONNX se realizó mediante el script `scripts/exportJoyVasaOnnx.py` del proyecto BonFrame, lo que indica que el modelo original fue convertido desde su formato original (probablemente PyTorch) a ONNX para facilitar la inferencia en Apple Silicon. No se mencionan innovaciones técnicas específicas en esta conversión, más allá de la inclusión del codificador HuBERT dentro del grafo para simplificar el pipeline.

## Capacidades

- Conversión de audio de habla (16 kHz) en coeficientes de movimiento para animación facial de retratos.
- Integración con el renderizador FasterLivePortrait-MLX para producir vídeo con sincronización de labios.
- Procesamiento de audio en tiempo real o casi real, dado el diseño para ejecución local en Apple Silicon.
- Soporte para el idioma chino gracias al codificador HuBERT fijado (no se confirma soporte para otros idiomas).
- Formato ONNX estándar, compatible con el runtime de ONNX y fácilmente integrable en aplicaciones multiplataforma.

## Casos de uso

- Doblaje y localización de vídeo: el modelo puede sincronizar los labios de un actor o avatar con pistas de audio en chino, facilitando la producción de contenido doblado sin necesidad de regrabar escenas.
- Creación de avatares virtuales para streaming: los creadores de contenido pueden animar personajes digitales en tiempo real usando su voz, gracias al bajo coste computacional del pipeline ONNX en Mac.
- Asistentes virtuales con presencia visual: integrar el modelo en aplicaciones de atención al cliente para generar un avatar que hable con el usuario, mejorando la experiencia de interacción.
- Educación y formación: generar vídeos de presentadores sintéticos para cursos online, donde el audio del profesor se convierte en animación facial del avatar.
- Entretenimiento interactivo: en juegos o experiencias de realidad aumentada, el modelo puede dar vida a personajes que responden verbalmente al jugador.
- Investigación en animación facial: el paquete ONNX sirve como punto de partida para estudiar la conversión de audio a movimiento y su integración en pipelines de renderizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos objetivos sobre calidad de sincronización labial, latencia o throughput en comparación con otros modelos.

## Requisitos de hardware

- El modelo está diseñado para ejecutarse en Apple Silicon (M1, M2, M3 y posteriores), aprovechando el runtime ONNX optimizado para Metal.
- Con un tamaño de 0,4 GB, es adecuado para dispositivos con memoria unificada de 8 GB o superior.
- No se requiere GPU dedicada; la integración con MLX (FasterLivePortrait-MLX) sugiere que el renderizado se realiza mediante el framework MLX de Apple.
- Opciones de despliegue: se puede integrar en aplicaciones Swift o Python usando el runtime de ONNX (onnxruntime) y MLX. No se mencionan herramientas como vLLM, llama.cpp u Ollama, dado que no es un LLM.
- La latencia y el throughput estimados no están disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (audio-to-motion para animación de retratos). La ficha se limita al modelo descrito.

## Limitaciones y advertencias

- El modelo es una pieza parcial de un pipeline mayor: requiere el renderizador FasterLivePortrait-MLX para producir el vídeo final, por lo que no es autónomo.
- El codificador HuBERT está entrenado específicamente para chino, lo que puede limitar su rendimiento con otros idiomas; no se especifica soporte multilingüe.
- No se han publicado evaluaciones de sesgos o alucinaciones, pero al ser un modelo de movimiento facial, el riesgo principal es la generación de animaciones inexactas o no naturales en ciertas condiciones de audio.
- La licencia MIT permite uso comercial, pero se debe verificar la licencia de los componentes derivados (JoyVASA original y el codificador HuBERT) para asegurar el cumplimiento.
- No se proporcionan garantías de rendimiento en hardware distinto al de Apple Silicon; la exportación ONNX podría no estar optimizada para otras plataformas.
- El repositorio no incluye documentación sobre el formato de los coeficientes de movimiento generados, lo que puede dificultar su integración en otros sistemas.

## Enlaces

- [Repositorio Hugging Face](https://huggingface.co/kingfang008/BonFrame-JoyVASA-ONNX)
- [Proyecto original JoyVASA](https://huggingface.co/jdh-algo/JoyVASA)
- [Repositorio GitHub de JoyVASA](https://github.com/jdh-algo/JoyVasa)
