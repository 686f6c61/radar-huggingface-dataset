# Richopera/Denia-gpt-sovits-v2proplus

## Resumen

Denia (达妮娅) es un modelo de síntesis de voz (text-to-speech) entrenado con GPT-SoVITS v2ProPlus por el usuario Richopera para reproducir la voz del personaje Denia del videojuego *Wuthering Waves*, tal como suena en su doblaje chino a cargo de la actriz 戈昕宇. No es un modelo de lenguaje general, sino un par de checkpoints (GPT + SoVITS) que se cargan dentro del entorno GPT-SoVITS para clonar un timbre concreto a partir de un clip de referencia.

El modelo se ha ajustado sobre el paquete base `lj1995/GPT-SoVITS-windows-package` y hereda la capacidad nativa de síntesis cruzada entre idiomas de GPT-SoVITS, aunque el entrenamiento se realizó exclusivamente con audio en chino. El conjunto de entrenamiento es pequeño: 712 fragmentos extraídos de las líneas de voz originales del juego, con una duración total de 48 minutos y 3,866 segundos.

Su relevancia es acotada: se trata de un fine-tune de nicho para doblaje de fans y proyectos creativos no comerciales, no de un modelo para producción empresarial. La licencia propia del autor (Richopera Voice Model License v2.0) restringe el uso comercial y exige permiso escrito para redistribuir pesos, lo que limita seriamente su adopción fuera de ámbitos personales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-SoVITS v2ProPlus (dos componentes: modelo GPT autorregresivo + modelo SoVITS de síntesis de voz) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la referencia de audio recomendada es de 3–10 segundos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (zh) en entrenamiento; síntesis cruzada a otros idiomas heredada de GPT-SoVITS |
| Licencia | Richopera Voice Model License v2.0 (uso personal no comercial; redistribución de pesos con permiso escrito) |
| Formato de pesos | checkpoints `.ckpt` (GPT) y `.pth` (SoVITS) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de GPT-SoVITS v2ProPlus, que combina un componente GPT (modelo autorregresivo que predice tokens semánticos a partir del texto y de un clip de referencia) con un componente SoVITS (modelo de síntesis de voz que convierte esos tokens en audio). La inferencia requiere proporcionar un clip de referencia limpio junto con su transcripción exacta, de modo que el sistema extrae el timbre y el estilo de locución y los aplica al texto objetivo. Los dos checkpoints deben cargarse conjuntamente en una instalación de GPT-SoVITS compatible con v2ProPlus; mezclarlos con checkpoints de otras versiones provoca fallos de carga.

El ajuste se realizó con la configuración por defecto de GPT-SoVITS v2ProPlus. El componente GPT se entrenó durante 15 épocas y el SoVITS durante 8 épocas, alcanzando el paso 1.424 (el paso final del GPT no se registró). El corpus consistió en 712 clips recortados de las líneas de voz originales del juego, con 48 minutos y 3,866 segundos en total. El entrenamiento se ejecutó el 19 de septiembre de 2026, entre las 21:15 y las 22:12 (aproximadamente una hora), en un equipo con CPU Intel Core Ultra 9 275HX a 2,70 GHz, 32 GB de RAM y una GPU NVIDIA GeForce RTX 5070 Laptop de 8 GB. No se documenta el uso de RLHF, DPO ni técnicas de alineación adicionales.

## Capacidades

- Síntesis de voz (text-to-speech) con clonación de timbre a partir de un clip de referencia de 3–10 segundos.
- Reproducción del timbre y del estilo de locución del personaje Denia en chino.
- Síntesis cruzada entre idiomas: el texto objetivo puede estar en un idioma distinto al de la referencia, capacidad heredada de GPT-SoVITS.
- Control del estilo de entrega mediante clips auxiliares de referencia.
- Generación de audio a partir de frases completas, con resultados más estables que con fragmentos muy cortos.
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes; no es un modelo de lenguaje.
- No dispone de modo de pensamiento (thinking), visión ni audio de entrada más allá del clip de referencia.

## Casos de uso

- Doblaje de fans de contenido de *Wuthering Waves*: el modelo permite generar nuevas líneas de diálogo con la voz de Denia para vídeos, cómics doblados o mods no comerciales, siempre que se acredite a la actriz de voz y al autor del modelo.
- Producción de audiolibros o ficción sonora amateur: con clips de referencia de 3–10 segundos y frases completas se obtiene una locución estable para narraciones no comerciales.
- Creación de contenido para redes sociales: vídeos cortos con la voz del personaje, respetando la atribución obligatoria indicada en la model card.
- Prototipado de pipelines TTS en investigación: sirve como ejemplo de fine-tune de GPT-SoVITS v2ProPlus con un corpus pequeño (48 minutos) y recursos de consumo (RTX 5070 Laptop de 8 GB).
- Pruebas de síntesis cruzada entre idiomas: permite evaluar cómo se comporta un modelo entrenado solo en chino al sintetizar texto en otros idiomas, útil para estudiar la degradación de calidad.
- Experimentación con clonación de voz de bajo presupuesto: el entrenamiento completo cabe en una hora en hardware de portátil, lo que lo hace adecuado para aprender el flujo de trabajo de GPT-SoVITS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; los checkpoints suman aproximadamente 313 MiB (148 MiB el GPT y 165 MiB el SoVITS), por lo que el peso de los pesos es reducido y el consumo vendrá dominado por el runtime de GPT-SoVITS.
- GPU recomendadas: no disponible; el entrenamiento se realizó en una NVIDIA GeForce RTX 5070 Laptop GPU de 8 GB, lo que sugiere que la inferencia cabe holgadamente en GPUs de consumo.
- Cabe en GPU de consumo: sí, según el hardware de entrenamiento documentado (RTX 5070 Laptop, 8 GB); no se especifican otras GPU concretas.
- Opciones de despliegue: WebUI de GPT-SoVITS compatible con v2ProPlus (flujo documentado por el autor); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Contexto / referencia | Disponibilidad |
|---|---|---|---|---|---|
| Denia-gpt-sovits-v2proplus | Fine-tune GPT-SoVITS v2ProPlus | zh (entrenamiento) | Richopera Voice Model License v2.0 (no comercial) | Clip de referencia de 3–10 s | Hugging Face, 0 descargas |
| GPT-SoVITS (base, lj1995) | Modelo base TTS | Multiidioma | Según proyecto GPT-SoVITS | Clip de referencia | GitHub y paquete oficial |
| Otros fine-tunes de personaje sobre GPT-SoVITS | Fine-tunes comunitarios | Variable | Variable, habitualmente no comercial | Clip de referencia | Hugging Face |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con alternativas en la información proporcionada; la comparación se limita a características estructurales y de licencia.

## Limitaciones y advertencias

- Entrenado únicamente con audio en chino; la calidad en otros idiomas depende de la capacidad de síntesis cruzada de GPT-SoVITS y no está evaluada.
- Corpus de entrenamiento muy pequeño (712 clips, 48 minutos), lo que puede provocar inestabilidad en frases largas o estilos alejados de los del personaje.
- Riesgo de artefactos y de degradación de calidad si el clip de referencia contiene música, reverberación o varios hablantes; la model card exige audio limpio y seco de un solo hablante.
- La licencia permite solo uso personal no comercial y publicación no comercial del audio generado con atribución; la redistribución de pesos originales o derivados requiere permiso escrito previo.
- La licencia no concede derechos sobre las grabaciones originales, la imagen del personaje ni la interpretación vocal; el modelo es no oficial y no está afiliado a Kuro Games ni a la actriz de voz.
- Obligación de atribución al publicar: debe mostrarse de forma destacada «Character voice actor: 戈昕宇» y «Voice model trained by: Richopera».
- No se han publicado ejemplos de audio ni resultados de benchmarks, por lo que no hay evidencia pública de calidad más allá de la descripción del autor.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- No apto para usos que requieran tool calling, razonamiento o procesamiento multimodal más allá del clip de referencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Richopera/Denia-gpt-sovits-v2proplus
- Proyecto GPT-SoVITS: https://github.com/RVC-Boss/GPT-SoVITS
- Guía en chino de GPT-SoVITS: https://www.yuque.com/baicaigongchang1145haoyuangong/ib3g1e
- Modelo base: https://huggingface.co/lj1995/GPT-SoVITS-windows-package
- Sitio oficial de *Wuthering Waves*: https://wutheringwaves.kurogames.com/en/main/
- Perfil de 花儿不哭 en Bilibili: https://space.bilibili.com/5760446
- Perfil de 戈昕宇 en Bilibili: https://space.bilibili.com/107085992
- Contacto del autor: richopera@outlook.com
