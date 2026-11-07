# mlboydaisuke/HSEmotion-B0-OpenVINO

## Resumen

HSEmotion-B0-OpenVINO es una conversión del modelo de clasificación de emociones faciales HSEmotion-B0 al ecosistema OpenVINO, publicada por el usuario mlboydaisuke. El modelo original procede de litert-community/HSEmotion-B0-LiteRT (a su vez derivado de la familia HSEmotion de HSEmotion, orientada a reconocimiento de emociones en imágenes de rostros), y esta versión redistribuye los pesos en tres formatos: ONNX (opset 17, generado con tf2onnx 1.17.0), OpenVINO IR con pesos fp32 y un blob precompilado para la NPU de Intel.

El interés de esta ficha no reside en el modelo en sí, sino en el artefacto de despliegue: demuestra la ejecución de un clasificador de imágenes en la NPU integrada de un Intel Core Ultra 9 386H con una latencia de 1,11 ms por inferencia (entrada numpy a salida numpy), lo que lo hace útil para pipelines de visión en tiempo real en equipos de sobremesa y portátiles con acelerador neuronal.

Es un modelo pequeño (en torno a 16,4 MB en ONNX) y especializado: no es un modelo generativo ni conversacional, sino un clasificador de emociones. La licencia es Apache-2.0, heredada del modelo base. La información pública sobre arquitectura interna, datos de entrenamiento y benchmarks de precisión es muy limitada; los datos disponibles se centran en rendimiento de inferencia y verificación de equivalencia numérica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional para clasificación de imágenes (arquitectura interna no detallada en la información disponible; el nombre "B0" sugiere un backbone tipo EfficientNet-B0, pero no se confirma) |
| Parametros totales | no disponible (tamaño de pesos ONNX: 16.413.834 bytes en fp16; IR OpenVINO fp32: 15.987.816 bytes en el .bin) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | fp16 (ONNX de origen), fp32 (OpenVINO IR), blob precompilado para NPU Intel |
| Idiomas soportados | no disponible (modelo de clasificación visual; las etiquetas de salida se expresan en inglés por convención de la tarea) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17), OpenVINO IR (.xml + .bin), blob de NPU Intel (.blob) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo original. Se trata de un clasificador de imágenes orientado a reconocimiento de emociones faciales, exportado desde un modelo LiteRT/TFLite (hsemotion_b0_fp16) a ONNX mediante tf2onnx 1.17.0 con opset 17, y posteriormente convertido a OpenVINO IR con pesos fp32. El nombre del modelo base (HSEmotion-B0) apunta a un backbone convolucional de la familia B0, pero la model card no confirma la arquitectura exacta ni el número de parámetros.

Tampoco se documentan en la información proporcionada los datos de entrenamiento (número de imágenes, composición del dataset, etiquetas de emoción, técnicas de aumento de datos) ni si hubo ajuste fino, destilación o cuantización consciente del entrenamiento. Lo que sí está documentado es el proceso de conversión y verificación: el ONNX se comparó contra el .tflite original con el intérprete LiteRT en CPU, obteniendo un PASS con coseno ≥ 0,9999 en todas las salidas. La innovación técnica destacable es el empaquetado para NPU: un blob precompilado con OpenVINO 2026.4.1 y el driver Intel NPU 32.0.100.4841 que evita la compilación en tiempo de carga (0,01 s de load frente a 1,09 s compilando el ONNX en el arranque de la sesión).

## Capacidades

- Clasificación de imágenes de rostros en categorías de emoción (el conjunto exacto de etiquetas no se detalla en la información disponible).
- Inferencia de baja latencia en NPU Intel (1,11 ms por ejecución con el blob precompilado en un Core Ultra 9 386H).
- Ejecución en CPU, iGPU Intel, GPU NVIDIA (vía CUDA EP de ONNX Runtime) y NPU Qualcomm (vía QNN EP en Snapdragon X2 Elite y Galaxy S26).
- Exportación a múltiples runtimes: OpenVINO nativo, ONNX Runtime con OpenVINO EP y ONNX Runtime con CUDA EP.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un clasificador visual.
- No dispone de modo "thinking", visión generativa, audio ni capacidades multilingües en el sentido de modelos de lenguaje.

## Casos de uso

- Análisis de emoción en tiempo real en videollamadas o aplicaciones de telemedicina: con 1,11 ms por frame en NPU, el modelo puede procesar flujos de vídeo a 30-60 fps sin cargar la CPU ni la GPU, lo que permite estimar el estado afectivo del usuario de forma continua.
- Señalización en sistemas de atención al cliente con vídeo: integrado en un pipeline de visión, puede clasificar la expresión facial del interlocutor y aportar contexto emocional a un agente conversacional que corre en paralelo.
- Investigación en interacción persona-ordenador: al ser Apache-2.0 y ejecutarse en hardware de consumo, sirve para experimentos de afectividad computacional en portátiles con Intel Core Ultra sin necesidad de GPU dedicada.
- Procesamiento por lotes en el borde (edge computing): el blob de NPU permite desplegar el clasificador en dispositivos Intel AI PC con un consumo energético bajo, útil para estudios de comportamiento en entornos controlados.
- Automatización de pruebas de UX: análisis de reacciones faciales de usuarios ante prototipos de interfaz, con inferencia local que evita enviar vídeo a la nube por motivos de privacidad.
- Módulo de preprocesado en pipelines de visión más amplios: el modelo puede actuar como extractor de etiquetas de emoción que alimente un sistema de moderación, recomendación o análisis de audiencia, ejecutándose en paralelo a otros modelos en la misma NPU.
- Validación de despliegues OpenVINO: sirve como caso de referencia para verificar que un blob compilado con una versión concreta de OpenVINO y driver de NPU funciona correctamente en un parque de equipos Intel.

## Benchmarks y rendimiento

Los datos disponibles son de latencia y verificación de salida, no de precisión sobre datasets de referencia (no se publican métricas como accuracy o F1 en la información proporcionada).

| Procesador | Runtime | Fichero | Latencia (ms) | Carga (s) | Verificación de salida |
|---|---|---|---|---|---|
| Intel AI Boost NPU (Core Ultra 9 386H) | OpenVINO 2026.4.1 | blob NPU (`import_model`) | 1,11 | 0,01 | PASS (cos ≥ 0,9999) |
| Intel AI Boost NPU (Core Ultra 9 386H) | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 1,31 | 1,09 | PASS (cos ≥ 0,9999) |
| Intel Graphics iGPU | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 0,92 | 1,01 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | copia fp16 del `.onnx` | 2,99 | 1,14 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | `.onnx` | 3,32 | 1,15 | PASS (cos ≥ 0,9999) |
| Core Ultra 9 386H CPU | ONNX Runtime 1.31.1, CPU EP | `.onnx` | 3,72 | 0,06 | referencia |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, QNN ONNX precompilado | `.onnx` | 0,56 | 0,33 | no comparado |
| Snapdragon X2 Elite NPU | ONNX Runtime QNN EP | `.onnx` | 0,56 | 1,12 | no comparado |
| Galaxy S26 NPU | Qualcomm AI Hub, QNN ONNX precompilado | `.onnx` | 0,44 | 0,19 | no comparado |

Medición realizada en un MSI Stealth 16 AI+ con Core Ultra 9 386H, RTX 5080 Laptop a 95 W, Windows 11 build 26200.9711, con alimentación de red, entre el 6 y el 7 de noviembre de 2026. Cada fila es un proceso independiente: carga, una ejecución, 5 de calentamiento y mediana de 30 ejecuciones cronometradas (2 de calentamiento y 10 cronometradas cuando la primera ejecución supera los 3 s). La verificación compara cada salida contra la salida fp32 en CPU con ONNX Runtime; PASS exige coseno ≥ 0,99, ausencia de NaN/Inf y coincidencia top-1 ≥ 0,99.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Latencia en NPU Intel | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HSEmotion-B0-OpenVINO | Clasificador de emociones | ONNX, OpenVINO IR, blob NPU | 1,11 ms (blob) | Apache-2.0 | Hugging Face |
| HSEmotion-B0-LiteRT (base) | Clasificador de emociones | LiteRT/TFLite | no disponible | Apache-2.0 | Hugging Face |
| HSEmotion (familia original) | Clasificadores de emociones (varias tallas) | PyTorch, ONNX | no disponible | no disponible en la información proporcionada | Hugging Face / repositorio del autor original |
| Clasificadores de emoción tipo FER+ / AffectNet | Clasificadores de emociones | PyTorch, ONNX | no disponible | variable según modelo | Hugging Face |

No se dispone de datos de precisión comparada entre estas alternativas en la información proporcionada; la comparación se limita a formato, licencia y latencia documentada.

## Limitaciones y advertencias

- No se documentan sesgos del modelo original: al ser un clasificador de emociones faciales, es previsible que herede sesgos de los datasets de entrenamiento (demografía, iluminación, pose, expresividad cultural), pero no hay datos concretos en la información disponible.
- Riesgo de falsos positivos en emociones ambiguas o expresiones neutras; no se publican métricas de precisión, recall ni matrices de confusión.
- El blob de NPU está compilado para OpenVINO 2026.4.1 y el driver Intel NPU 32.0.100.4841; en otras versiones `import_model` puede rechazarlo y es necesario recompilar el IR.
- La latencia de 1,11 ms corresponde a un hardware concreto (Core Ultra 9 386H); no es extrapolable a otras NPU Intel sin medición.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes, y su uso en pipelines conversacionales requiere un modelo adicional.
- El modelo base es una versión cuantizada (relación `quantized` respecto a litert-community/HSEmotion-B0-LiteRT); la cuantización puede degradar ligeramente la precisión frente al modelo original en PyTorch, aunque la verificación numérica contra el .tflite es PASS.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar la licencia y procedencia del modelo HSEmotion original antes de desplegarlo en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente y sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/HSEmotion-B0-OpenVINO
- Modelo base LiteRT: https://huggingface.co/litert-community/HSEmotion-B0-LiteRT
- Repositorio de scripts y mediciones (52 grafos de LiteRT-Models): https://github.com/john-rocky/windows-zoo
- Documentación de OpenVINO: https://docs.openvino.ai/
- Estadísticas del autor en OpenModelStats: https://openmodelstats.com/owners/mlboydaisuke
