# APLUX-Agora/MobileNet-v2

## Resumen

MobileNet-v2 es un modelo de clasificación de imágenes de tipo red convolucional ligera, publicado en Hugging Face por APLUX-Agora dentro de su iniciativa Agora. Se trata de una conversión del conocido MobileNetV2 original (clasificador de 1000 clases de ImageNet) a formatos desplegables y medibles sobre placas reales con SoC de Qualcomm. El repositorio no contiene los pesos en formato estándar (safetensors o GGUF), sino artefactos de despliegue organizados por SoC objetivo (`targets/<SoC>/`), con binarios `model.bin` y metadatos en `model.json` que indican la precisión por defecto y las variantes disponibles.

El modelo resuelve un problema muy concreto: llevar un clasificador de imágenes de referencia a hardware AIoT con aceleración Qualcomm (QNN) sin tener que recompilar ni reconstruir el pipeline de preprocesado y postprocesado. APLUX-Agora publica latencias medidas en placa para dos plataformas: QCS6490 (Rhino Pi A1) a 1,4 ms en W8A16 y QCS8550 (Rhino Pi X1) a 0,7 ms en FP16/W8A16. Es relevante para desarrolladores que necesitan una línea base de clasificación de imágenes en el borde y quieren medir y comparar sobre hardware real, no solo sobre papel.

La información disponible es escasa en cuanto a arquitectura detallada, datos de entrenamiento y benchmarks de precisión: la model card se limita a describir la tarea (clasificación, entrada imagen, salida etiqueta), las precisiones soportadas y el procedimiento de descarga. El tamaño del repositorio aparece como 0,0 GB, lo que sugiere que los artefactos pueden no estar efectivamente alojados o que la medición no está actualizada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red convolucional ligera (MobileNetV2, según el nombre del modelo); detalles no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imágenes) |
| Tipos de cuantización | FP16, W8A16 (según SoC objetivo) |
| Idiomas soportados | no aplica (modelo de visión); no disponible |
| Licencia | APLUX Model Farm License (license_name: aplux-model-farm); licencia del modelo fuente según los términos originales |
| Formato de pesos | Artefactos de despliegue por SoC: `model.bin` (binarios de contexto QNN) y `model.json`; no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

La model card identifica el modelo como una red de clasificación ligera clásica para las 1000 clases de ImageNet, coherente con la familia MobileNetV2 (convoluciones separables en profundidad y bloques residuales invertidos). No obstante, la información proporcionada no detalla la arquitectura interna, el número de parámetros, el número de tokens de entrenamiento ni la composición del dataset. Tampoco se documenta si hubo ajuste fino, destilación o calibración específica para cuantización.

La innovación técnica destacable no está en el modelo en sí, sino en el empaquetado: APLUX-Agora distribuye recursos ya convertidos y medidos para SoC Qualcomm concretos, con una estructura `targets/<SoC>/` que contiene `model.json` (precisión por defecto y rutas de variantes) y un directorio por precisión. Los binarios de contexto se denominan `model.bin` y los paquetes multifichero se mantienen tal como los publica Model Farm. El repositorio incluye además `NOTICE.md` y `SHA256SUMS` para verificación de integridad.

## Capacidades

- Clasificación de imágenes en 1000 clases (ImageNet), con entrada de imagen y salida de etiqueta.
- Ejecución acelerada en hardware Qualcomm mediante QNN, con precisiones FP16 y W8A16 según el SoC.
- Despliegue orientado a AIoT: recursos listos para placas QCS6490 y QCS8550.
- Preprocesado y postprocesado documentados a través de la plataforma Agora (guía de despliegue y exportación de proyectos).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multilingüismo.
- No se documentan modos especiales como thinking, visión generativa o audio.

## Casos de uso

- Clasificación de imágenes en el borde sobre placas QCS6490/QCS8550: el modelo se ejecuta con latencias de 1,4 ms y 0,7 ms respectivamente, adecuado para inspección visual en tiempo real en dispositivos AIoT.
- Línea base de referencia para comparar aceleradores: sirve como punto de partida reproducible para medir el rendimiento de un SoC Qualcomm antes de portar modelos propios.
- Control de calidad en líneas de producción: clasificación rápida de piezas o productos con un modelo de huella reducida y latencia inferior al milisegundo en QCS8550.
- Prototipado de aplicaciones de visión en cámara: integración en pipelines de captura y clasificación con preprocesado ya definido por la plataforma Agora.
- Sistemas de vigilancia y detección de categorías visuales: clasificación de fotogramas en dispositivos de bajo consumo con aceleración QNN.
- Validación de pipelines de despliegue: uso del modelo como caso de prueba para verificar la conversión, cuantización y ejecución en placas Qualcomm antes de desplegar modelos mayores.
- Demostraciones y formación: ejemplo accesible para enseñar el flujo completo de despliegue de un clasificador en AIoT con Agora.

## Benchmarks y rendimiento

La model card solo publica latencias medidas en placa, no métricas de precisión (top-1/top-5) ni resultados en MMLU, HumanEval, GSM8K u otros benchmarks de texto, que no aplican a este modelo.

| SoC · placa | Precisiones | Latencia medida (precisión por defecto) |
|---|---|---|
| QCS6490 · Rhino Pi A1 | W8A16 | 1,4 ms |
| QCS8550 · Rhino Pi X1 | FP16, W8A16 | 0,7 ms |

No se han publicado resultados de benchmarks de precisión en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (modelo de borde; no se especifica memoria requerida).
- GPU recomendadas: no aplica en el sentido convencional; el objetivo son SoC Qualcomm QCS6490 y QCS8550 con aceleración QNN.
- Compatibilidad con GPU de consumo: no disponible; el empaquetado está orientado a placas AIoT, no a GPUs de escritorio.
- Opciones de despliegue: plataforma Agora (descarga por SoC, guía de despliegue y exportación de proyectos); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 1,4 ms por inferencia en QCS6490 (W8A16) y 0,7 ms en QCS8550 (FP16/W8A16), según mediciones del autor; el throughput no se publica.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Precisión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| APLUX-Agora/MobileNet-v2 | CNN ligera (MobileNetV2) | no aplica | no disponible (solo latencias) | APLUX Model Farm License | Hugging Face, artefactos por SoC Qualcomm |
| MobileNetV2 original (Google) | CNN ligera | no aplica | top-1 ~71,8 % en ImageNet (referencia pública) | Apache 2.0 (versión original) | TensorFlow Hub, Keras, etc. |
| MobileNetV3 | CNN ligera con bloques SE y NAS | no aplica | superior a V2 en ImageNet (referencia pública) | Apache 2.0 (versión original) | TensorFlow/Keras, varias conversiones |
| EfficientNet-Lite | CNN ligera | no aplica | superior a MobileNet en precisión | Apache 2.0 (versión original) | TensorFlow Lite |

La comparación con las versiones originales se basa en conocimiento público general de esas familias; la información proporcionada no incluye métricas de precisión del modelo de APLUX-Agora, por lo que no es posible comparar su exactitud frente a las alternativas.

## Limitaciones y advertencias

- No se publican métricas de precisión (top-1/top-5) del modelo convertido; no es posible verificar la pérdida de exactitud tras la cuantización W8A16.
- El repositorio aparece con tamaño 0,0 GB y 0 descargas; conviene verificar que los artefactos estén realmente disponibles antes de integrarlo en producción.
- La licencia APLUX Model Farm License es distinta de la licencia del modelo fuente; es necesario revisar `LICENSE_MODEL_FARM.pdf` y los términos del modelo original antes de cualquier uso comercial.
- El modelo está empaquetado para SoC Qualcomm concretos (QCS6490, QCS8550); no se garantiza su funcionamiento en otras plataformas sin reconversión.
- Riesgo de sesgos y alucinaciones inherente a los clasificadores entrenados con ImageNet: el modelo puede fallar en clases poco representadas o en dominios visuales distintos al de entrenamiento.
- No se documentan limitaciones de idioma porque el modelo no procesa texto.
- Ausencia de información sobre el pipeline de preprocesado en el propio repositorio: depende de la plataforma Agora para reproducir la entrada correcta.
- No hay soporte documentado para tool calling, agentes ni razonamiento multi-paso, por lo que no debe emplearse en esos escenarios.

## Enlaces

- Hugging Face: https://huggingface.co/APLUX-Agora/MobileNet-v2
- Licencia APLUX Model Farm: https://huggingface.co/APLUX-Agora/MobileNet-v2/blob/main/LICENSE_MODEL_FARM.pdf
- Plataforma Agora: https://mega.aidlux.com
- Página del modelo en Agora: https://mega.aidlux.com/models/mobilenet-v2
