# sebekblessing/wan22-qnn-8elite

## Resumen

Wan 2.2 TI2V-5B Turbo para QNN es una conversión del modelo de generación de vídeo a partir de imagen (image-to-video) Wan2.2-TI2V-5B-Turbo, empaquetada como binarios de contexto QNN para la unidad neuronal Hexagon v79 del Snapdragon 8 Elite (por ejemplo, iQOO 13). El autor, sebekblessing, parte del modelo base de quanhaol, que a su vez es una destilación a 4 pasos del Wan 2.2 TI2V-5B original de Wan-AI. El resultado convierte una imagen de 768x768 en un clip de 17 fotogramas guiado por un prompt textual.

El interés de esta ficha es su naturaleza de despliegue en dispositivo (on-device): no es un modelo pensado para servidores con GPU, sino una compilación específica para el NPU de un SoC móvil concreto. Incluye el lector de prompts umT5-XXL cuantizado a 4 bits en GGUF (ejecutado por llama.cpp en la CPU del teléfono), el codificador VAE, los 30 bloques del transformer de difusión en 8 bits y el decodificador LightTAE. El repositorio ocupa 12,3 GB y la descarga efectiva ronda los 9,3 GB.

La relevancia actual reside en que demuestra la viabilidad de ejecutar un modelo de difusión de vídeo de 5.680.910.336 parámetros en un smartphone, con un tiempo aproximado de 2 minutos y medio por clip. Es un artefacto muy especializado: solo funciona en hardware Snapdragon 8 Elite con soporte QNN y está pensado para la aplicación Anima para Android.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (Wan 2.2 TI2V-5B) con VAE y decodificador LightTAE; compilado como binarios de contexto QNN para Hexagon v79 |
| Parametros totales | 5.680.910.336 (segun safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; el prompt se procesa con umT5-XXL) |
| Tipos de cuantizacion | 8 bits para los bloques del transformer; 4 bits para el lector de prompts umT5-XXL (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | other (see-notice); el modelo base Wan 2.2 TI2V-5B, LightTAE y umT5 son Apache 2.0; la version Turbo no declara licencia explicita |
| Formato de pesos | binarios QNN (.bin), GGUF (umt5_reader.gguf), sigmas.txt y manifest.json |

## Arquitectura y entrenamiento

El modelo base es Wan 2.2 TI2V-5B, un transformer de difusión para generación de vídeo condicionada por imagen y texto. La variante Turbo de quanhaol es una destilación a 4 pasos, lo que reduce el número de iteraciones de muestreo necesarias. Sobre esa base, esta conversión transforma los pesos a ONNX, los cuantiza a 8 bits y los compila para la unidad neuronal Hexagon v79 mediante QNN. El codificador VAE se reescribió para procesar una sola imagen, con una fidelidad respecto al original de 0,99998. El lector de prompts emplea el GGUF de 4 bits de city96 con un ajuste modificado para que llama.cpp procese el prompt en ambas direcciones.

El pipeline se descompone en ficheros: `umt5_reader.gguf` para el prompt, `prep.bin` con las claves y valores de los 30 bloques, `enc.bin` con el VAE de la imagen inicial, `emb.bin` y `time.bin` para los parches de imagen y la señal temporal de cada paso, `w0.bin` a `w29.bin` para los bloques del modelo, `head.bin` para la salida del último bloque y `dec.bin` para el decodificador LightTAE, que genera cuatro fotogramas por llamada. `sigmas.txt` contiene los 8 niveles de ruido. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de imagen (image-to-video): convierte una imagen de 768x768 en un clip de 17 fotogramas.
- Condicionamiento por prompt textual: el movimiento del clip sigue la descripción escrita, procesada por umT5-XXL en 4 bits.
- Muestreo en 4 pasos gracias a la destilación Turbo, con 8 niveles de ruido definidos en `sigmas.txt`.
- Decodificación VAE de imagen inicial y decodificación LightTAE de fotogramas (cuatro por llamada).
- Ejecución en dispositivo: el lector de prompts corre en CPU vía llama.cpp y el transformer en el NPU Hexagon v79.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo generativo de vídeo, no un LLM.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No incluye visión, audio ni modo thinking.

## Casos de uso

- Generación de clips cortos en movilidad: un usuario toma una foto en el teléfono y obtiene un vídeo de 17 fotogramas animado según un prompt, sin conexión a servidores, gracias a la ejecución en el NPU del Snapdragon 8 Elite.
- Prototipado de animaciones para redes sociales: creación rápida de animaciones de 768x768 a partir de imágenes estáticas, adecuada para pruebas de concepto visuales en el propio dispositivo.
- Demostraciones de IA on-device: útil para mostrar en ferias o presentaciones la capacidad de un smartphone de ejecutar un modelo de difusión de vídeo de 5.680.910.336 parámetros en unos 2 minutos y medio por clip.
- Integración en la app Anima para Android: el modelo está empaquetado con `manifest.json` y SHA-256 para que la aplicación lo descargue y gestione automáticamente, lo que facilita su distribución a usuarios finales.
- Investigación en eficiencia de despliegue: sirve como referencia para estudiar la cuantización a 8 bits y la compilación QNN de un transformer de difusión en un NPU móvil concreto.
- Generación de contenido educativo o creativo de bajo coste: al no requerir GPU dedicada ni infraestructura cloud, permite experimentar con image-to-video en un dispositivo de consumo.
- Evaluación comparativa de pipelines de vídeo en hardware móvil: útil para medir latencia y calidad frente a alternativas en la nube, con la ventaja de privacidad al no enviar imágenes a servidores externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento aportado es que en el teléfono un clip tarda aproximadamente 2 minutos y medio.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido tradicional; el modelo se ejecuta en el NPU Hexagon v79 y en la CPU del Snapdragon 8 Elite, no en una GPU dedicada.
- GPU recomendadas: no aplica; el hardware objetivo es el Snapdragon 8 Elite (por ejemplo, iQOO 13).
- Cabe en consumer GPU: no es su objetivo; los binarios QNN están compilados para un NPU concreto y no son portables a GPUs de escritorio.
- Opciones de despliegue: aplicación Anima para Android (https://github.com/adiirfan/anima-android); los scripts de construcción están en `build/` del repositorio.
- Latencia y throughput estimados: aproximadamente 2 minutos y medio por clip de 17 fotogramas en el dispositivo objetivo; no se dispone de más datos.
- Almacenamiento: descarga de unos 9,3 GB; el repositorio completo ocupa 12,3 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| wan22-qnn-8elite (este) | 5.680.910.336 | 768x768, 17 fotogramas | other (see-notice) | Hugging Face, para Snapdragon 8 Elite |
| quanhaol/Wan2.2-TI2V-5B-Turbo (base) | 5.680.910.336 | no disponible en la informacion | no declarada | Hugging Face |
| Wan-AI/Wan2.2-TI2V-5B (original) | 5.680.910.336 | no disponible en la informacion | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks para comparar rendimiento entre estas variantes. La diferencia principal es el formato de despliegue: el modelo original y el Turbo están pensados para GPU, mientras que esta conversión está compilada para NPU móvil.

## Limitaciones y advertencias

- Especificidad de hardware: los binarios QNN están compilados para Hexagon v79 (Snapdragon 8 Elite); no funcionan en otros SoC ni en GPUs.
- Solo image-to-video: no soporta text-to-video ni otras modalidades; requiere una imagen de entrada de 768x768.
- Salida limitada: clips de 17 fotogramas, no vídeos largos.
- Latencia elevada en dispositivo: unos 2 minutos y medio por clip.
- Licencia ambigua: la versión Turbo no declara licencia explícita y la ficha usa "other (see-notice)"; es necesario revisar el fichero NOTICE antes de cualquier uso comercial.
- Los clips pueden diferir ligeramente de los del modelo original debido a la cuantización y a los cambios en el VAE y el lector de prompts.
- Riesgo de alucinación visual: como modelo generativo, puede producir movimientos o contenido no fieles al prompt o a la imagen de entrada.
- Idiomas soportados no disponibles: no se puede confirmar el alcance multilingüe del prompt.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Dependencia de la app Anima: el flujo de descarga y ejecución está diseñado para esa aplicación concreta.

## Enlaces

- Hugging Face: https://huggingface.co/sebekblessing/wan22-qnn-8elite
- Modelo base Turbo: https://huggingface.co/quanhaol/Wan2.2-TI2V-5B-Turbo
- Modelo original Wan 2.2 TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Aplicación Anima para Android: https://github.com/adiirfan/anima-android
- Scripts de construcción: https://huggingface.co/sebekblessing/wan22-qnn-8elite/blob/main/build/README.md
- Aviso de licencia: https://huggingface.co/sebekblessing/wan22-qnn-8elite/blob/main/NOTICE
