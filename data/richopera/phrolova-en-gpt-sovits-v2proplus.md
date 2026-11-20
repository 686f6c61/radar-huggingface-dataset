# Richopera/phrolova-en-gpt-sovits-v2proplus

## Resumen

Phrolova (弗洛洛), English Voice — GPT-SoVITS v2ProPlus es un modelo de síntesis de voz (text-to-speech) entrenado mediante fine-tuning sobre el paquete GPT-SoVITS v2ProPlus de lj1995. Lo desarrolla el usuario Richopera y su objetivo es reproducir la voz en inglés del personaje Phrolova, del videojuego *Wuthering Waves*, tal como la interpreta la actriz Rae Lim. No es un modelo de lenguaje general, sino un par de checkpoints (GPT y SoVITS) que se cargan dentro del entorno GPT-SoVITS para generar audio a partir de texto y un clip de referencia.

El modelo se entrenó con 733 fragmentos de audio de alta calidad recopilados por jugadores, con una duración total de 47 minutos y 50,408 segundos, usando la configuración por defecto de GPT-SoVITS v2ProPlus. El resultado son dos ficheros de pesos: un checkpoint GPT de aproximadamente 148 MiB (15 épocas) y un checkpoint SoVITS de aproximadamente 165 MiB (8 épocas, paso final 1472). El repositorio completo ocupa unos 0,8 GB.

Su relevancia es acotada pero concreta: cubre la demanda de doblaje no oficial y contenido generado por fans con una voz inglesa concreta, y lo hace sobre una arquitectura de referencia abierta (GPT-SoVITS) que permite clonación de voz few-shot y síntesis cross-lingual. La licencia es restrictiva (Richopera Voice Model License v2.0), limitada a uso personal no comercial, lo que condiciona fuertemente su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-SoVITS v2ProPlus (componente GPT + componente SoVITS/VITS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el clip de referencia recomendado es de 3–10 segundos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (entrenamiento); capacidad cross-lingual nativa de GPT-SoVITS según el autor |
| Licencia | Richopera Voice Model License v2.0 (uso personal no comercial) |
| Formato de pesos | checkpoints `.ckpt` (GPT) y `.pth` (SoVITS) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de GPT-SoVITS v2ProPlus, un sistema de síntesis de voz que combina un componente autorregresivo tipo GPT para modelar la secuencia de tokens acústicos y un componente SoVITS (basado en VITS) para la generación del waveform condicionada por el hablante. La inferencia es few-shot: se proporciona un clip de referencia limpio junto con su transcripción exacta, y el modelo usa ese par para condicionar el timbre y la dicción del audio generado. No se dispone de detalles sobre el número de parámetros ni sobre la composición exacta de los datos de preentrenamiento del modelo base.

El fine-tuning se realizó con la configuración por defecto de GPT-SoVITS v2ProPlus sobre 733 clips de audio de alta calidad recopilados por jugadores, con una duración agregada de 47 minutos y 50,408 segundos. El componente GPT se entrenó durante 15 épocas y el componente SoVITS durante 8 épocas (paso final 1472). El entrenamiento se ejecutó el 21 de septiembre de 2026, de 14:35 a 14:56 (aproximadamente 21 minutos), en un equipo con CPU Intel Core Ultra 9 275HX a 2,70 GHz, 32 GB de RAM y una GPU NVIDIA GeForce RTX 5070 Laptop de 8 GB. No se documenta el uso de RLHF ni DPO; se trata de un ajuste supervisado sobre datos de voz.

## Capacidades

- Síntesis de voz en inglés a partir de texto, condicionada por un clip de referencia de 3–10 segundos y su transcripción exacta.
- Clonación de voz few-shot del timbre y la dicción del personaje Phrolova en su versión inglesa (actriz Rae Lim).
- Síntesis cross-lingual nativa de GPT-SoVITS: el modelo fue entrenado con voz inglesa, pero la arquitectura base permite generar en otros idiomas soportados por el entorno.
- Reproducción de un registro vocal más grave y contenido que el doblaje chino del personaje, según el autor.
- Soporte de clips auxiliares de referencia para reforzar timbre y entrega.
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es exclusivamente un modelo TTS.
- No incluye visión ni audio de entrada más allá del clip de referencia.

## Casos de uso

- Doblaje no oficial de contenido de fans: generar líneas de diálogo del personaje para vídeos, cómics doblados o mods, usando clips de referencia limpios y transcripciones exactas para mantener el timbre.
- Producción de audiolibros o ficción sonora amateur: narrar textos en inglés con la voz del personaje, aprovechando la estabilidad que el autor atribuye a frases completas y cláusulas largas.
- Vídeos de YouTube y TikTok de contenido derivado: publicar clips con la voz sintetizada cumpliendo la atribución exigida (actriz y entrenador del modelo) y respetando la restricción no comercial.
- Pruebas de concepto de pipelines TTS: integrar los checkpoints en el WebUI de GPT-SoVITS para evaluar la calidad de clonación few-shot antes de invertir en un modelo con licencia permisiva.
- Investigación sobre clonación de voz y evaluación de similitud: usar el par GPT/SoVITS como caso de estudio de fine-tuning con pocos datos (47 minutos) y de generalización cross-lingual.
- Preservación de personajes en comunidades de fans: mantener disponible una versión inglesa coherente del personaje para proyectos comunitarios, dado que los checkpoints chino e inglés no son intercambiables.
- Demostraciones educativas de TTS: mostrar en talleres cómo funciona el flujo referencia + transcripción + texto objetivo en GPT-SoVITS v2ProPlus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; los checkpoints suman aproximadamente 313 MiB (148 MiB GPT + 165 MiB SoVITS), por lo que el modelo cabe holgadamente en GPUs de consumo, aunque el consumo real depende del runtime GPT-SoVITS.
- GPU recomendadas: el autor entrenó en una NVIDIA GeForce RTX 5070 Laptop de 8 GB, lo que indica que 8 GB de VRAM son suficientes al menos para el fine-tuning con este volumen de datos; para inferencia se espera un requisito igual o menor.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 8 GB o más; no se dispone de datos para GPUs de gama baja.
- Opciones de despliegue: WebUI de GPT-SoVITS que soporte checkpoints v2ProPlus; el proyecto oficial es https://github.com/RVC-Boss/GPT-SoVITS. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables de otros modelos TTS de clonación few-shot en la información proporcionada. La comparación se limita a características estructurales:

| Modelo | Tipo | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|
| Richopera/phrolova-en-gpt-sovits-v2proplus | Fine-tune GPT-SoVITS v2ProPlus | Inglés | Richopera Voice Model License v2.0 (no comercial) | Hugging Face |
| GPT-SoVITS (lj1995/GPT-SoVITS-windows-package) | Modelo base TTS | Multilingüe según proyecto | Según proyecto original | GitHub / Hugging Face |
| Otros fine-tunes de personajes sobre GPT-SoVITS | Fine-tunes comunitarios | Variable | Variable, habitualmente restrictiva | Hugging Face |

No se dispone de datos de rendimiento comparativo (similitud de hablante, MOS, WER) para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia restrictiva: la Richopera Voice Model License v2.0 solo permite uso personal no comercial y publicación no comercial del audio generado con atribución; la redistribución de pesos originales o derivados requiere permiso escrito previo.
- El modelo es no oficial y no está afiliado a Kuro Games, a la actriz de voz ni a otros titulares de derechos; la licencia no concede derechos sobre las grabaciones originales, la imagen del personaje ni la interpretación vocal.
- Los checkpoints inglés y chino del personaje no son intercambiables; mezclarlos con los de otras versiones o personajes puede producir fallos de carga o resultados incorrectos.
- Riesgo de alucinación acústica y artefactos: como todo TTS generativo, puede producir prosodia inestable, pronunciación incorrecta o ruido, especialmente con frases cortas o textos con muchas exclamaciones.
- Dependencia de la calidad de la referencia: clips con música de fondo, reverberación o múltiples hablantes degradan el resultado; se recomienda voz limpia y seca de un solo hablante.
- Cobertura limitada al inglés entrenado; el rendimiento cross-lingual no está evaluado en la información disponible.
- Sin datos publicados de benchmarks, latencia ni consumo de VRAM en inferencia, lo que dificulta estimar su comportamiento en producción.
- Riesgo ético y legal por suplantación de voz: el uso para hacer pasar por real a la actriz o al personaje en contextos engañosos puede vulnerar derechos de imagen y normativa aplicable.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Richopera/phrolova-en-gpt-sovits-v2proplus
- Proyecto GPT-SoVITS: https://github.com/RVC-Boss/GPT-SoVITS
- Guía en chino de GPT-SoVITS: https://www.yuque.com/baicaigongchang1145haoyuangong/ib3g1e
- Modelo base: https://huggingface.co/lj1995/GPT-SoVITS-windows-package
- Wuthering Waves (Kuro Games): https://wutheringwaves.kurogames.com/en/main/
- Actriz de voz Rae Lim: https://raelimofficial.wixsite.com/raelim
- Perfil de 花儿不哭 en Bilibili: https://space.bilibili.com/5760446
- Contacto del autor: richopera@outlook.com
