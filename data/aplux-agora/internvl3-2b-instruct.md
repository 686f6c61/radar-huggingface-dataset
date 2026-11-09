# APLUX-Agora/InternVL3-2B-Instruct

## Resumen

InternVL3-2B-Instruct es un modelo de visión-lenguaje (image-text-to-text) de 2.000 millones de parámetros, originalmente desarrollado por el equipo InternVL (OpenGVLab) y redistribuido aquí por APLUX-Agora como recurso convertido y empaquetado para despliegue en placas con SoC Qualcomm. Esta ficha cubre específicamente la variante publicada en el repositorio `APLUX-Agora/InternVL3-2B-Instruct`, que no contiene los pesos en formato estándar (safetensors/GGUF) sino artefactos compilados para el runtime QNN de Qualcomm, organizados por SoC objetivo.

El modelo resuelve el problema de llevar un VLM de 2B parámetros a hardware AIoT de bajas prestaciones energéticas. La build publicada se ha validado en la placa Rhino Pi X1 (犀牛派 X1) con SoC QCS8550, donde alcanza 36,1 tokens/s con cuantización W4A16, según las mediciones del propio autor. El repositorio ocupa 2,2 GB e incluye un directorio `targets/<SoC>/` con `model.json` (precisión por defecto y rutas de variantes) y binarios `model.bin`.

La relevancia actual es la integración de un VLM open source en el ecosistema Qualcomm AIoT mediante el catálogo Model Farm de Agora, que permite probar el modelo en línea sin disponer de placa física y exportar flujos de trabajo listos para despliegue. La licencia de los recursos convertidos es la APLUX Model Farm License, distinta de la del modelo original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base InternVL3; detalles no incluidos en la información proporcionada) |
| Parametros totales | 2B (según el nombre del modelo) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (precisión por defecto medida en QCS8550) |
| Idiomas soportados | no disponible |
| Licencia | APLUX Model Farm License (recursos convertidos); modelo fuente sujeto a sus propios términos |
| Formato de pesos | binarios QNN (`model.bin`) por SoC y precisión; no safetensors ni GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el dataset de entrenamiento, el número de tokens procesados ni las fases de alineación (RLHF/DPO) en la información proporcionada. El modelo base es InternVL3-2B-Instruct, cuyo diseño corresponde a la familia InternVL3, pero esta ficha no puede confirmar detalles arquitectónicos concretos (tipo de vision encoder, resolución de imagen soportada, mecanismo de atención) sin datos verificables.

La contribución técnica de esta publicación no es el entrenamiento, sino la conversión y empaquetado para el runtime QNN de Qualcomm: los pesos se distribuyen compilados por SoC objetivo, con un `model.json` que declara la precisión por defecto y las rutas de cada variante. El pipeline de despliegue incluye preprocesado y postprocesado, el runner y la posibilidad de exportar el proyecto completo desde Agora.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text), con entrada de imagen y texto y salida de texto.
- Comprensión visual: descripción de imágenes, respuesta a preguntas sobre contenido visual y tareas de razonamiento visual, según la categoría del modelo base.
- Instrucción conversacional: la variante `-Instruct` está orientada a seguir instrucciones del usuario.
- Despliegue en hardware AIoT Qualcomm: ejecución nativa sobre QNN en SoC como QCS8550.
- Prueba en línea sin hardware: el modelo puede evaluarse en la plataforma Agora antes de desplegarlo.
- Soporte de tool calling, agentes, thinking mode, audio o visión avanzada: no disponible en la información proporcionada.

## Casos de uso

- Inspección visual en el borde: desplegar el modelo en una Rhino Pi X1 con QCS8550 para clasificar y describir imágenes capturadas por una cámara local, sin enviar datos a la nube, aprovechando los 36,1 tokens/s medidos en W4A16.
- Asistencia visual a operarios: un dispositivo AIoT con cámara envía una foto de un componente o etiqueta y el modelo genera una descripción o respuesta en lenguaje natural para el técnico.
- Automatización de inventario en retail: lectura y descripción de productos a partir de imágenes en un terminal de bajo consumo con SoC Qualcomm, con inferencia local.
- Accesibilidad: descripción de escenas o documentos para usuarios con discapacidad visual en dispositivos portátiles, gracias al tamaño de 2B parámetros y a la cuantización W4A16 que reduce los requisitos de memoria.
- Prototipado rápido de aplicaciones VLM: usar el catálogo Agora para probar el modelo en línea y exportar el flujo de trabajo antes de adquirir hardware, reduciendo el coste de validación.
- Control de calidad industrial: verificación visual de piezas en líneas de producción con inferencia en el propio equipo, evitando latencia de red y dependencia de servicios externos.
- Kioscos interactivos y señalización digital: interacción multimodal en dispositivos empotrados con presupuesto térmico y energético limitado.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Throughput | 36,1 tokens/s | QCS8550 · Rhino Pi X1, precisión W4A16 (por defecto) |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, MMMU u otros) en la información disponible.

## Requisitos de hardware

- VRAM/ memoria: no disponible de forma explícita; el despliegue objetivo es en memoria unificada de SoC Qualcomm, no en GPU discreta.
- SoC validado: QCS8550 en placa Rhino Pi X1 (犀牛派 X1), con cuantización W4A16 y 36,1 tokens/s medidos.
- GPU recomendadas: no aplica para esta build; los binarios QNN están compilados para SoC Qualcomm concretos.
- GPU de consumo: no disponible; el repositorio no incluye pesos en formatos ejecutables en GPU (safetensors/GGUF).
- Opciones de despliegue: runtime QNN de Qualcomm a través del catálogo Agora (Model Farm); descarga selectiva con `hf download --include "targets/<SoC>/*"`.
- Latencia y throughput: 36,1 tokens/s en QCS8550 con W4A16; no hay datos para otros SoC o precisiones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| InternVL3-2B-Instruct (APLUX-Agora, esta build) | 2B | no disponible | APLUX Model Farm License (recursos convertidos) | Binarios QNN para SoC Qualcomm en Hugging Face |
| InternVL3-2B-Instruct (modelo fuente) | 2B | no disponible en esta información | según términos del modelo original | Pesos estándar en el repositorio del autor original (no verificado en esta búsqueda) |
| Alternativas de 2B tipo VLM (p. ej. Qwen2-VL-2B, SmolVLM) | ~2B | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La build no incluye pesos en safetensors ni GGUF: no es directamente utilizable en vLLM, llama.cpp, Ollama o TGI.
- Solo se ha validado y medido en QCS8550 (Rhino Pi X1); el rendimiento en otros SoC Qualcomm no está documentado.
- La licencia de los recursos convertidos es la APLUX Model Farm License, con términos propios que deben revisarse antes de uso comercial; el modelo fuente mantiene su licencia original, también a verificar.
- Riesgo de alucinación inherente a los modelos de lenguaje y visión-lenguaje; no hay datos publicados sobre tasas de error en esta variante.
- Idiomas soportados no documentados; no se puede garantizar calidad en castellano.
- Longitud de contexto no documentada; no se recomienda asumir ventanas largas en producción.
- Sesgos conocidos del modelo base no documentados en esta información.
- Al ser un artefacto compilado por placa, cualquier cambio de hardware puede requerir una build distinta del catálogo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/APLUX-Agora/InternVL3-2B-Instruct
- Prueba en línea (Agora): https://mega.aidlux.com/models/internvl3-2b-instruct
- Plataforma Agora: https://mega.aidlux.com
- Licencia APLUX Model Farm: https://huggingface.co/APLUX-Agora/InternVL3-2B-Instruct/blob/main/LICENSE_MODEL_FARM.pdf
