# qualcomm/Intern3-5-VL-2B

## Resumen

Intern3-5-VL-2B es la versión optimizada para dispositivos Qualcomm del modelo visión-lenguaje InternVL3.5 de OpenGVLab, publicada por Qualcomm en HuggingFace bajo licencia Apache 2.0. Se trata de un modelo multimodal capaz de procesar texto e imágenes para tareas de razonamiento como respuesta visual a preguntas (VQA) y generación de descripciones de imágenes. El repositorio no contiene pesos en formato de entrenamiento, sino artefactos pre-exportados y compilados para ejecutarse en la NPU Hexagon de plataformas Snapdragon mediante los runtimes Genie y GenieX de Qualcomm.

La relevancia de esta ficha radica en que ejemplifica una tendencia clara: la distribución de modelos multimodales pequeños (del orden de 2 000 millones de parámetros) ya cuantizados a 4 bits de pesos y 16 bits de activaciones (w4a16) y compilados para hardware móvil concreto. El repositorio incluye binarios específicos para Snapdragon 8 Elite Gen 5, Snapdragon 8 Elite, Snapdragon X2 Elite, Snapdragon X Elite, Dragonwing IQ-8275, SA8775P y Dragonwing IQ-9075, todos con el SDK QAIRT 2.45.

El modelo base procede del paper arXiv:2508.18265 y su checkpoint original es OpenGVLab/InternVL3_5-2B. Al tratarse de un artefacto derivado, gran parte de los metadatos técnicos (longitud de contexto, composición del dataset de entrenamiento, idiomas declarados) no aparecen en la información disponible y deben consultarse en el repositorio del autor original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card solo indica que es un modelo visión-lenguaje, VLM, de la familia InternVL3.5) |
| Parametros totales | aproximadamente 2 000 millones, según la denominación del modelo y el checkpoint base InternVL3_5-2B |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | w4a16 (pesos de 4 bits, activaciones de 16 bits) en los artefactos pre-exportados; no se detallan otras cuantizaciones |
| Idiomas soportados | no disponible (el campo de idiomas aparece vacío en el repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | artefactos pre-exportados y compilados por chipset para los runtimes Genie y GenieX QAIRT (SDK QAIRT 2.45), distribuidos como ficheros .zip; el formato del checkpoint original no se detalla en la información disponible |

## Arquitectura y entrenamiento

La información proporcionada no describe la arquitectura interna del modelo. El repositorio indica únicamente que InternVL3.5 es un modelo visión-lenguaje de OpenGVLab capaz de comprender texto e imágenes para tareas de razonamiento multimodal, como respuesta visual a preguntas y generación de descripciones. No se especifican el tipo de codificador visual, la estructura del decodificador de lenguaje, el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Esos detalles deben consultarse en el paper arXiv:2508.18265 y en la model card del checkpoint original OpenGVLab/InternVL3_5-2B.

La innovación técnica destacable de este repositorio concreto no está en el entrenamiento, sino en el proceso de compilación y cuantización para hardware Qualcomm. Qualcomm AI Hub Models utiliza Qualcomm AI Hub Workbench para compilar, perfilar y evaluar el modelo, generando binarios optimizados para siete plataformas distintas de cómputo (móvil, PC y segmentos industriales/automoción con Dragonwing). El flujo de exportación es configurable: la librería ai-hub-models permite recompilar con pesos personalizados (por ejemplo, checkpoints ajustados), formas de entrada propias y configuraciones específicas de dispositivo y runtime.

## Capacidades

- Comprensión de imágenes y texto de forma conjunta, orientada a razonamiento multimodal.
- Respuesta visual a preguntas (VQA): responder preguntas formuladas en lenguaje natural sobre el contenido de una imagen.
- Generación de descripciones de imágenes (image captioning).
- Generación de texto mediante el pipeline declarado en el repositorio (text-generation).
- Ejecución en dispositivo (on-device) sobre NPU Hexagon de plataformas Snapdragon, sin depender de servicios en la nube.
- Exportación personalizada con pesos ajustados, formas de entrada propias y configuraciones de dispositivo específicas mediante la librería Qualcomm AI Hub Models.
- Soporte de tool calling, function calling, agentes, modo de razonamiento explícito (thinking), audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Asistencia visual en aplicaciones móviles: integrar el modelo en una app Android para que el usuario haga preguntas sobre una foto capturada en el momento, aprovechando la inferencia local en la NPU sin enviar la imagen a un servidor.
- Accesibilidad para personas con discapacidad visual: descripción de escenas en tiempo real a partir de la cámara del dispositivo, con latencia baja al ejecutarse en el propio terminal y sin coste de tokens en la nube.
- Digitalización de documentos en campo: técnicos que fotografían etiquetas, formularios o paneles de control y obtienen respuestas o extracción de información directamente en el dispositivo, útil en entornos sin conectividad estable.
- Control de calidad industrial sobre Dragonwing IQ-8275 o IQ-9075: inspección visual asistida en línea de producción, donde el modelo describe anomalías o responde a consultas sobre la imagen capturada por la cámara de la línea.
- Asistencia en cabina o automoción sobre SA8775P: consultas multimodales de bajo consumo integradas en el sistema de infoentretenimiento, con procesamiento local que evita retransmitir imágenes del vehículo.
- Funciones multimodales en PC con Snapdragon X Elite y X2 Elite: clasificación y descripción de capturas de pantalla o imágenes dentro de aplicaciones de escritorio, con la ventaja de que el cómputo permanece en el equipo.
- Prototipado de producto con AI Hub Workbench: perfilado y evaluación del modelo en dispositivos Qualcomm alojados antes de comprometer una versión final, para validar latencia y precisión con la cuantización w4a16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una sección de resumen de rendimiento y enlaza a la página del modelo en Qualcomm AI Hub, pero no incluye cifras concretas de MMLU, HumanEval, GSM8K, MMMU ni de ningún otro conjunto de evaluación, ni datos de latencia o throughput por dispositivo. No se deben asumir valores no publicados.

## Requisitos de hardware

- El modelo no se distribuye para ejecución en GPU de escritorio o servidor: los artefactos incluidos están compilados para NPU Hexagon de plataformas Qualcomm.
- Plataformas soportadas oficialmente: Snapdragon 8 Elite Gen 5 Mobile, Snapdragon 8 Elite Mobile, Snapdragon X2 Elite, Snapdragon X Elite, Dragonwing IQ-8275 (QCS8275), SA8775P y Dragonwing IQ-9075 (QCS9075).
- SDK requerido: QAIRT 2.45, con runtime Genie o GenieX QAIRT.
- VRAM estimada para inferencia: no disponible (no aplica al tratarse de despliegue en NPU móvil; no se publican cifras de memoria).
- GPU recomendadas (A100, H100, RTX 4090, etc.): no disponible; no se documenta un camino de despliegue en GPU en este repositorio.
- Opciones de despliegue: GenieX (recomendado según la model card), Genie (soporte previsto para ser retirado próximamente) y compilación propia mediante la librería Qualcomm AI Hub Models y Qualcomm AI Hub Workbench. vLLM, llama.cpp, Ollama o TGI no se mencionan en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qualcomm/Intern3-5-VL-2B | ~2 000 millones | no disponible | w4a16 para NPU Qualcomm | Apache 2.0 | Artefactos compilados para siete plataformas Snapdragon/Dragonwing |
| OpenGVLab/InternVL3_5-2B | ~2 000 millones | no disponible | no disponible | no disponible en la informacion proporcionada | Checkpoint original de OpenGVLab en HuggingFace, referenciado como base |
| Otras alternativas de la misma categoria (VLM de ~2-3B) | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación que puede sostenerse con la información disponible es con el checkpoint original InternVL3_5-2B del que deriva: misma base de parámetros, pero orientaciones distintas, ya que la versión de Qualcomm está cuantizada y compilada para hardware concreto mientras que el original está pensado para entrenamiento e inferencia en frameworks estándar. No se dispone de datos de rendimiento de ninguno de los dos para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- La cuantización w4a16 puede degradar la precisión respecto al checkpoint original en formato de mayor precisión; no se publican métricas que cuantifiquen esa pérdida.
- Los artefactos están ligados a plataformas concretas de Qualcomm y al SDK QAIRT 2.45; no son portables a GPU convencionales ni a otros aceleradores sin recompilar.
- El runtime Genie tiene soporte previsto para ser retirado próximamente, según advierte la propia model card; las integraciones que dependan de él deberán migrar a GenieX.
- No se declaran idiomas soportados en el repositorio, por lo que no puede garantizarse un comportamiento multilingüe adecuado, incluido el castellano, sin una evaluación propia.
- No se especifica la longitud de contexto, lo que impide planificar conversaciones de varios turnos o documentos extensos sin medir el límite real en dispositivo.
- Riesgo de alucinación: inherente a los modelos generativos multimodales; no se publican tasas de error ni evaluaciones de fidelidad sobre imágenes.
- Sesgos conocidos: no disponible; no se documenta ningún análisis de sesgo ni de composición del dataset de entrenamiento.
- Licencia Apache 2.0 en este repositorio, pero conviene verificar la licencia y las condiciones del checkpoint original de OpenGVLab antes de un uso comercial, ya que la información disponible no las detalla.
- El repositorio registra cero descargas y cero valoraciones en el momento de la consulta, por lo que no existe validación de la comunidad sobre estos artefactos.
- El contenido de la model card debe tratarse como referencia informativa del autor, no como instrucciones operativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qualcomm/Intern3-5-VL-2B
- Checkpoint base: https://huggingface.co/OpenGVLab/InternVL3_5-2B
- Paper referenciado: https://arxiv.org/abs/2508.18265
- Página del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/intern3_5_vl_2b
- Librería Qualcomm AI Hub Models (código del modelo): https://github.com/qualcomm/ai-hub-models/blob/v0.62.1/src/qai_hub_models/models/intern3_5_vl_2b
- Repositorio Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models
- Inicio rápido de GenieX: https://geniex.aihub.qualcomm.com/en/get-started/quickstart
- Tutorial LLM on Genie: https://github.com/qualcomm/ai-hub-apps/tree/main/tutorials/llm_on_genie
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Registro en Qualcomm: https://myaccount.qualcomm.com/signup
