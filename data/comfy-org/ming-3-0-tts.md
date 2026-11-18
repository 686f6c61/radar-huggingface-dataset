# Comfy-Org/Ming-3.0-TTS

## Resumen
Ming-3.0-TTS es un modelo de síntesis de voz (text-to-speech) publicado por Comfy-Org como un empaquetado (repackaging) de un único fichero de pesos orientado a su uso directo en ComfyUI. No se trata de un modelo entrenado desde cero por Comfy-Org, sino de una redistribución del modelo base `inclusionAI/Ming-3.0-tts-tiny`, desarrollado por inclusionAI, adaptada al formato `diffusion-single-file` que consume el nodo de checkpoints de ComfyUI. El repositorio ocupa 9,1 GB y contiene un fichero `ming3_tts_tiny_int8_convrot.safetensors` que se coloca en `ComfyUI/models/checkpoints/`.

La relevancia de esta ficha es fundamentalmente práctica: permite a usuarios de ComfyUI disponer de un modelo TTS integrado en sus flujos de trabajo sin necesidad de gestionar el repositorio original ni sus dependencias de inferencia específicas. El nombre del fichero sugiere una cuantización a int8 (`int8`) y algún tipo de transformación de pesos (`convrot`), aunque la model card no documenta el procedimiento exacto de conversión.

La información pública disponible es muy limitada: la model card se reduce a instrucciones de instalación, no se declaran idiomas soportados, no se publican benchmarks y no se detalla la arquitectura interna del modelo base. Todo lo que sigue se limita a lo verificable en la información proporcionada, marcando explícitamente como "no disponible" los datos ausentes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `inclusionAI/Ming-3.0-tts-tiny`; el empaquetado se distribuye como `diffusion-single-file`) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica / no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (según el nombre del fichero `ming3_tts_tiny_int8_convrot.safetensors`); no se documentan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (fichero único, `diffusion-single-file`) |

## Arquitectura y entrenamiento
La model card no describe la arquitectura del modelo base `inclusionAI/Ming-3.0-tts-tiny`. El tag `diffusion-single-file` y la etiqueta de pipeline `text-to-speech` indican que se trata de un modelo generativo aplicado a síntesis de voz, pero no se especifica si emplea difusión, un transformer autorregresivo, un modelo acústico con vocoder separado u otra formulación. Tampoco se detallan el número de parámetros, la composición del dataset de entrenamiento, el número de tokens o pasos de entrenamiento, ni si hubo etapas de ajuste fino con preferencias (RLHF/DPO).

El único dato técnico concreto del empaquetado es el nombre del fichero, `ming3_tts_tiny_int8_convrot.safetensors`, que apunta a una cuantización a 8 bits y a una transformación de pesos no documentada (`convrot`). No se dispone de información sobre innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos de control de prosodia.

## Capacidades
- Síntesis de voz a partir de texto (pipeline `text-to-speech`), ejecutable dentro de ComfyUI como nodo de checkpoint.
- Integración nativa en flujos de trabajo de ComfyUI: el fichero se carga desde `ComfyUI/models/checkpoints/`.
- Distribución en un único fichero safetensors, lo que simplifica el despliegue y evita la gestión de múltiples artefactos.
- Capacidades multilingües: no disponibles (no se declaran idiomas en la model card).
- Soporte de tool calling, agentes, razonamiento multi-paso, visión o audio de entrada: no disponible / no aplica a un modelo TTS.
- Modo thinking, clonación de voz, control de emociones o prosodia: no disponible en la información proporcionada.

## Casos de uso
- Doblaje y narración para vídeo generado en ComfyUI: el modelo se carga como checkpoint dentro del mismo grafo que genera el vídeo o las imágenes, permitiendo añadir una pista de voz sin salir del entorno. Es adecuado por su formato de fichero único y su integración directa con los nodos de ComfyUI.
- Prototipado rápido de interfaces de voz: al estar cuantizado a int8, el modelo reduce los requisitos de memoria frente a una versión en fp16, lo que facilita probar un pipeline TTS en una estación de trabajo con GPU de gama media.
- Generación de audiolibros y contenido largo por lotes: un modelo TTS integrado en ComfyUI permite encadenar la generación de fragmentos de texto en un flujo automatizado, siempre que se valide previamente la calidad y la coherencia de la voz entre segmentos.
- Accesibilidad y lectura de textos: conversión de documentos o artículos a audio para usuarios con dificultades de lectura, aprovechando la licencia MIT para uso interno sin restricciones comerciales.
- Creación de contenido para redes y podcasts: generación de locuciones para vídeos cortos o episodios, con la ventaja de que la licencia MIT permite su uso comercial sin royalties adicionales.
- Investigación en síntesis de voz: servir como punto de partida reproducible para experimentos de cuantización (int8) y de integración en pipelines de difusión, dado que el empaquetado expone una variante cuantizada concreta.
- Pruebas de integración en CI: verificar que un flujo de ComfyUI con nodos TTS se ejecuta correctamente en un entorno de integración continua, usando el fichero safetensors como artefacto de prueba.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada: no disponible de forma oficial. El repositorio ocupa 9,1 GB, pero el tamaño del fichero de pesos concreto no se detalla; una cuantización int8 de un modelo "tiny" sugiere un consumo de memoria moderado, aunque no puede confirmarse sin conocer el número de parámetros.
- GPU recomendadas: no disponibles. Al tratarse de un modelo etiquetado como "tiny" y cuantizado a int8, es plausible que quepa en GPU de consumo, pero no hay datos publicados que lo confirmen.
- Cabe en GPU de consumo: no confirmado.
- Opciones de despliegue: ComfyUI (uso previsto, cargando el fichero desde `ComfyUI/models/checkpoints/`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que además no son los entornos habituales para este tipo de empaquetado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (TTS de tamaño "tiny" empaquetados para ComfyUI) ni datos de rendimiento que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias
- La model card no documenta idiomas soportados; no debe asumirse cobertura multilingüe sin verificación previa.
- No se publican benchmarks de calidad (naturalidad, inteligibilidad, MOS) ni de robustez, por lo que la evaluación debe hacerse empíricamente antes de usar el modelo en producción.
- El nombre del fichero indica una cuantización int8; es esperable una degradación de calidad frente a los pesos originales en fp16/fp32, aunque no se cuantifica en la información disponible.
- La transformación `convrot` aplicada a los pesos no está documentada, lo que dificulta la reproducibilidad y la auditoría del empaquetado.
- Riesgo de alucinación y artefactos de pronunciación: no evaluado en la información disponible; en TTS esto se manifiesta como errores de pronunciación, entonación o saltos en el audio.
- Sesgos de voz (género, acento, edad) no documentados; el modelo base podría reflejar los sesgos de su dataset de entrenamiento, que no se describe.
- Licencia MIT: permite uso comercial y modificación, pero conviene conservar el aviso de copyright y verificar la licencia del modelo base `inclusionAI/Ming-3.0-tts-tiny`, ya que este empaquetado es una redistribución.
- Dependencia de ComfyUI: el formato `diffusion-single-file` está pensado para ese entorno; su uso fuera de ComfyUI requeriría adaptar la carga de pesos.
- Fecha de creación del repositorio (2026-10-23) y actualización (2026-10-28): verificar que la versión descargada coincide con la esperada, dado el corto intervalo entre ambas.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/Comfy-Org/Ming-3.0-TTS
- Modelo base: https://huggingface.co/inclusionAI/Ming-3.0-tts-tiny
- Repositorio de ComfyUI: https://github.com/Comfy-Org/ComfyUI
