# AXERA-TECH/InternVL3_5-2B_GPTQ_INT4

## Resumen

InternVL3.5-2B_GPTQ_INT4 es una conversión del modelo de visión-lenguaje (VLM) InternVL3.5-2B, desarrollado originalmente por OpenGVLab, adaptada por AXERA-TECH para ejecutarse en el acelerador neuronal (NPU) AX650 de Axera. El modelo combina un codificador de imágenes InternViT con un modelo de lenguaje Qwen3-1.7B, y se distribuye en formato w4a16 (cuantización de 4 bits en pesos y 16 bits en activaciones) para maximizar la eficiencia en hardware embebido. Esta versión está empaquetada en el formato de directorio de modelos de ax-llm, el runtime de inferencia de Axera, y está pensada para aplicaciones de visión por computador y generación de texto en dispositivos de borde con recursos limitados.

La relevancia de este modelo radica en que permite ejecutar un VLM multimodal de 2.000 millones de parámetros en un chip NPU de bajo consumo, con una velocidad de generación de aproximadamente 28 tokens por segundo y una latencia de primer token de unos 5 segundos. Esto abre la puerta a aplicaciones de asistencia visual, descripción de imágenes y respuesta a preguntas multimodales en sistemas embebidos, sin necesidad de depender de la nube. El modelo es una opción práctica para desarrolladores que trabajan con el ecosistema Axera (placas AX650N, aceleradores M.2) y necesitan un punto de partida listo para usar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | InternViT (codificador de imágenes) + Qwen3-1.7B (modelo de lenguaje) |
| Parametros totales | 2.000 millones (aprox.) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.000 tokens (configuracion para AX650; el modelo base puede soportar mas) |
| Tipos de cuantizacion | w4a16 (GPTQ INT4 para pesos, activaciones en FP16) |
| Idiomas soportados | ingles (segun la model card; el modelo base podria soportar mas, pero esta version solo declara en) |
| Licencia | BSD-3-Clause |
| Formato de pesos | axmodel (formato especifico de ax-llm; no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base InternVL3.5-2B, desarrollado por OpenGVLab, sigue la arquitectura de la serie InternVL3: un codificador de vision (InternViT) conectado a un modelo de lenguaje (Qwen3-1.7B) mediante un proyector multimodal. El modelo original se entrena en grandes conjuntos de datos de imagen-texto y se ajusta con tecnicas de aprendizaje por refuerzo a partir de feedback humano (RLHF) y optimizacion de preferencias directa (DPO), aunque los detalles especificos del entrenamiento de esta version cuantizada no se detallan en la model card. La conversion realizada por AXERA-TECH aplica cuantizacion GPTQ de 4 bits a los pesos del LLM y del codificador de vision, manteniendo las activaciones en 16 bits, para reducir el uso de memoria y mejorar la velocidad en la NPU AX650.

La innovacion principal de esta version no reside en el entrenamiento, sino en la optimizacion para hardware embebido: se ha adaptado el modelo al formato axmodel, se ha fijado una resolucion de imagen de 448x448 píxeles y se ha limitado la longitud de contexto a 2.000 tokens (con un maximo de 1.000 tokens de prefill) para ajustarse a las capacidades de memoria de la NPU. El runtime ax-llm gestiona la ejecucion, incluyendo el preprocesamiento de imagenes y la decodificacion autoregresiva, y ofrece una interfaz compatible con OpenAI para servidores HTTP.

## Capacidades

- Generacion de texto a partir de imagenes: el modelo puede describir el contenido de una imagen, responder preguntas sobre ella y realizar tareas de razonamiento visual basico.
- Razonamiento multimodal: combina informacion visual y textual para tareas como reconocimiento de objetos, escenas y relaciones espaciales.
- Soporte de tool calling: no se menciona en la documentacion, por lo que se considera no disponible en esta version.
- Capacidades de agente: no se documenta soporte para agentes multi-paso.
- Multilingue: la model card solo declara ingles, aunque el modelo base de OpenGVLab podria soportar mas idiomas; en esta version cuantizada no se garantiza.
- Modo de pensamiento (thinking mode): no disponible; el modelo es un VLM estandar sin modo de razonamiento explicito.
- Entrada de imagen: unica imagen de 448x448 píxeles por peticion; no soporta multiples imagenes ni video.

## Casos de uso

- Asistente de accesibilidad en dispositivos embebidos: una camara conectada a una placa AX650N puede capturar una imagen y el modelo genera una descripcion textual en tiempo real para ayudar a personas con discapacidad visual, gracias a su baja latencia (5 segundos de primer token) y su capacidad de ejecucion local.
- Clasificacion y etiquetado de imagenes en entornos industriales: el modelo puede analizar fotografias de productos en una linea de montaje y emitir etiquetas o alertas textuales, aprovechando su cuantizacion w4a16 para funcionar en hardware de bajo consumo sin conexion a internet.
- Sistema de respuestas a preguntas sobre documentos escaneados: combinado con un escaner, el modelo puede interpretar graficos, diagramas o texto dentro de imagenes y responder consultas, util para archivado y recuperacion de informacion en oficinas o bibliotecas.
- Robotica de bajo coste: en robots educativos o de investigacion, el modelo puede procesar la entrada de una camara y generar instrucciones de navegacion o descripciones del entorno, gracias a su compatibilidad con el runtime ax-llm y su velocidad de 28 tokens por segundo.
- Demostraciones y prototipos de VLM en edge: desarrolladores que evaluan la viabilidad de modelos multimodales en hardware Axera pueden usar este modelo como referencia para medir rendimiento, consumo y calidad antes de implementar soluciones personalizadas.
- Servidor de inferencia local con API OpenAI-compatible: mediante `axllm serve`, el modelo puede exponerse como un endpoint HTTP para integrarse en aplicaciones de chat o analisis de imagenes, facilitando el desarrollo de prototipos sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica proporcionada es el rendimiento en el chip AX650, medida por AXERA-TECH:

| Metrica | Valor |
|---|---|
| Tiempo de codificador de imagen (448x448) | 364,412 ms |
| Latencia de primer token (TTFT) | 4951,50 ms |
| Velocidad de generacion | 28,07 tokens/segundo |

Estos datos corresponden a la ejecucion en la placa AX650N o acelerador M.2 con el runtime ax-llm, y no se comparan con otros modelos.

## Requisitos de hardware

- Chip objetivo: AX650 (AX650N host o tarjeta aceleradora M.2 via AXCL).
- VRAM: no especificada, pero el modelo cuantizado w4a16 ocupa aproximadamente 4,8 GB en disco; la memoria necesaria en la NPU depende de la configuracion de ax-llm y no se detalla.
- GPU: no aplicable; el modelo esta disenado para NPU de Axera, no para GPUs convencionales.
- Compatibilidad con GPU de consumo: no, el formato axmodel solo se ejecuta en el stack de Axera.
- Opciones de despliegue: runtime ax-llm (repositorio en GitHub), con comandos `axllm run` para chat interactivo y `axllm serve` para servidor HTTP compatible con OpenAI.
- Latencia y throughput: medidos en AX650 (ver tabla de rendimiento); la velocidad de generacion es de 28 tokens/segundo, con un TTFT de unos 5 segundos.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para esta version cuantizada. Como referencia, el modelo base InternVL3.5-2B de OpenGVLab se puede comparar con otros VLM de tamano similar, pero no hay benchmarks compartidos en la informacion disponible. Se indican las diferencias principales con alternativas comunes:

| Modelo | Parametros | Contexto | Licencia | Hardware objetivo |
|---|---|---|---|---|
| InternVL3.5-2B (base) | 2B | 32k (estimado) | BSD-3-Clause | GPUs (transformers) |
| AXERA-TECH/InternVL3_5-2B_GPTQ_INT4 | 2B | 2k | BSD-3-Clause | NPU AX650 |
| Phi-3.5-vision (Microsoft) | 4.2B | 128k | MIT | GPUs, edge (ONNX) |
| LLaVA-1.6 (varios) | 7B-34B | 32k | Apache 2.0 | GPUs |

La comparativa directa no es posible por la falta de benchmarks y por la diferencia de plataformas de ejecucion.

## Limitaciones y advertencias

- Longitud de contexto muy reducida: 2.000 tokens, lo que limita conversaciones largas o el procesamiento de documentos extensos; el prefill maximo es de 1.000 tokens.
- Solo entrada de una imagen por peticion, con resolucion fija de 448x448; no soporta multiples imagenes ni video.
- Idioma: la model card declara solo ingles; el uso en otros idiomas puede degradar la calidad o producir errores.
- Cuantizacion w4a16: la precision de 4 bits en pesos puede provocar una perdida de calidad en tareas complejas de razonamiento visual o generacion de texto, aunque es aceptable para tareas simples.
- Dependencia del ecosistema Axera: el modelo solo se ejecuta en hardware AX650 con el runtime ax-llm; no es portable a GPUs o CPUs convencionales sin una reconversion completa.
- Rendimiento limitado: la velocidad de 28 tokens/segundo y el TTFT de 5 segundos pueden ser insuficientes para aplicaciones interactivas en tiempo real.
- Riesgo de alucinacion: como cualquier VLM, puede generar descripciones inexactas o inventar detalles sobre la imagen, especialmente con cuantizacion agresiva.
- Licencia BSD-3-Clause permite uso comercial, pero se deben conservar los avisos de copyright y no se concede ninguna garantia; verificar los terminos del modelo base.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/AXERA-TECH/InternVL3_5-2B_GPTQ_INT4
- Modelo base de OpenGVLab: https://huggingface.co/OpenGVLab/InternVL3_5-2B
- Runtime ax-llm (GitHub): https://github.com/AXERA-TECH/ax-llm
- Documentacion de la tarjeta aceleradora M.2 (AXCL): https://axcl-docs.readthedocs.io/zh-cn/latest/doc_guide_hardware.html
- Wiki de la placa M4N-Dock (爱芯派Pro): https://wiki.sipeed.com/hardware/zh/maixIV/m4ndock/m4ndock.html
