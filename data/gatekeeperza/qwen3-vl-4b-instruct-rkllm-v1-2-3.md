# GatekeeperZA/Qwen3-VL-4B-Instruct-RKLLM-v1.2.3

## Resumen

Qwen3-VL-4B-Instruct-RKLLM-v1.2.3 es una conversión del modelo vision-language Qwen3-VL-4B-Instruct de Alibaba, adaptado por GatekeeperZA para ejecutarse en la NPU del SoC Rockchip RK3588 mediante los toolkits RKLLM (para el modelo de lenguaje) y RKNN (para el encoder de visión). El resultado es un modelo multimodal que acepta imágenes y texto, capaz de comprensión visual, respuesta a preguntas sobre imágenes, análisis de documentos y lectura de gráficos, todo ello de forma completamente local y sin GPU.

Esta conversión emplea cuantización w8a8 (pesos y activaciones de 8 bits) y está pensada para placas de desarrollo como Orange Pi 5 Plus u otros dispositivos basados en RK3588/RK3588S. El modo de razonamiento explícito (thinking mode) está desactivado, lo que reduce la latencia y el consumo de memoria. Es una opción relevante para aplicaciones de edge computing que necesitan capacidades multimodales sin depender de servicios en la nube.

El repositorio incluye dos archivos: el modelo de lenguaje en formato `.rkllm` y el encoder de visión en formato `.rknn`. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación, siempre que se mantenga la atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (basado en Qwen3-VL-4B-Instruct) |
| Parametros totales | 4 mil millones (según modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen3-VL-4B-Instruct soporta hasta 128k tokens, pero no se especifica en esta conversión) |
| Tipos de cuantizacion | w8a8 (8-bit pesos, 8-bit activaciones) |
| Idiomas soportados | Inglés, chino (el modelo base es multilingüe, pero la conversión declara en, zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | RKLLM (.rkllm) y RKNN (.rknn) |

## Arquitectura y entrenamiento

El modelo original Qwen3-VL-4B-Instruct es un modelo de lenguaje y visión de tipo denso desarrollado por Alibaba, con un encoder de visión que procesa imágenes a resolución variable. La conversión de GatekeeperZA separa el modelo de lenguaje (exportado a RKLLM) del encoder de visión (exportado a RKNN), de modo que ambos componentes se ejecutan en la NPU del RK3588. No se dispone de información detallada sobre el entrenamiento del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) en la documentación de esta conversión. La cuantización w8a8 se aplica durante la conversión para reducir el uso de memoria y acelerar la inferencia en la NPU, a costa de una posible pérdida mínima de precisión.

## Capacidades

- Comprensión de imágenes: identificación de objetos, escenas y atributos visuales.
- Respuesta a preguntas visuales (visual QA) sobre el contenido de una imagen.
- Análisis de documentos: extracción de texto, tablas y estructura de páginas escaneadas.
- Lectura de gráficos: interpretación de diagramas, barras, líneas y otros formatos de datos visuales.
- Soporte multilingüe declarado para inglés y chino (el modelo base puede cubrir más idiomas, pero la conversión no lo garantiza).
- Integración con el RKLLM API Server para despliegue como servicio local.
- No incluye modo de razonamiento explícito (thinking mode) en esta versión.

## Casos de uso

- Inspección visual en línea de producción: el modelo puede analizar imágenes de piezas o productos en tiempo real para detectar defectos o validar etiquetas, ejecutándose en un dispositivo RK3588 sin conexión a internet.
- Asistente de accesibilidad para personas con discapacidad visual: descripción de escenas, lectura de carteles o documentos a través de una cámara conectada a una placa de bajo consumo.
- Digitalización de documentos en entornos sin conexión: extracción de texto e información estructurada de facturas, formularios o tarjetas de visita usando OCR y comprensión visual.
- Análisis de gráficos médicos o científicos: interpretación de radiografías, ecografías o gráficos de laboratorio en clínicas rurales con infraestructura limitada.
- Quiosco interactivo con reconocimiento de objetos: un dispositivo de información turística o educativa que identifica elementos mostrados por el usuario y responde con explicaciones.
- Vigilancia inteligente en el borde: análisis de secuencias de imágenes (frames) para detectar anomalías o contar personas, con respuesta local y baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o tareas de visión. Se recomienda evaluar el modelo en el hardware objetivo (RK3588) con los casos de uso previstos para medir precisión y rendimiento reales.

## Requisitos de hardware

- SoC: RK3588 o RK3588S (no compatible con RK3576 sin reconversión).
- NPU: 3 núcleos (integrados en el SoC).
- RAM: aproximadamente 5,5 GB al cargar el modelo; se recomienda placa con 8 GB o más (16 GB recomendado).
- Runtime: RKLLM Runtime ≥ v1.2.1 y RKNN Runtime v2.x (v1.2.3 recomendado).
- Driver NPU: versión ≥ 0.9.6 (probado con 0.9.8).
- Placas probadas: Orange Pi 5 Plus (16 GB RAM, Armbian Linux).
- Despliegue: mediante el RKLLM API Server (https://github.com/GatekeeperZA/RKLLM-API-Server), que carga automáticamente los archivos `.rkllm` y `.rknn` si están en el mismo directorio.
- No se requieren GPUs externas; la inferencia se ejecuta íntegramente en la NPU del SoC.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-VL-4B-Instruct-RKLLM-v1.2.3 (este) | 4B | No disponible | w8a8 | Apache 2.0 | RKLLM/RKNN |
| Qwen3-VL-2B-Instruct-RKLLM-v1.2.3 | 2B | No disponible | w8a8 | Apache 2.0 | RKLLM/RKNN |
| Qwen3-VL-4B-Instruct (original) | 4B | 128k (según documentación oficial) | FP16/BF16 | Apache 2.0 | Safetensors, GGUF, etc. |

La conversión para RK3588 ofrece la ventaja de ejecución en hardware de bajo consumo sin GPU, pero limita la flexibilidad de cuantización y el contexto efectivo (no confirmado). El modelo de 2B del mismo autor consume menos memoria, pero según la model card el 4B proporciona mejor comprensión de imagen y extracción de texto.

## Limitaciones y advertencias

- Modo de razonamiento explícito desactivado: no se puede activar el "thinking mode" en esta conversión, lo que puede reducir la calidad en tareas de razonamiento complejo.
- Idiomas limitados: la conversión declara solo inglés y chino; otros idiomas del modelo base podrían no funcionar correctamente.
- Compatibilidad restringida: solo funciona en RK3588/RK3588S; otros SoCs de Rockchip requieren reconversión con el toolkit adecuado.
- Requisitos de memoria: necesita ~5,5 GB de RAM, lo que descarta placas con menos de 8 GB.
- Dependencia de versiones de runtime y driver: es necesario actualizar RKLLM Runtime y RKNN Runtime a versiones mínimas, y el driver NPU debe ser ≥ 0.9.6.
- Posible pérdida de precisión por cuantización w8a8 en tareas visuales finas (p. ej., OCR con fuentes pequeñas o imágenes de baja resolución).
- Sin garantía de soporte técnico: es una conversión comunitaria, no oficial de Alibaba ni Rockchip.
- El modelo base puede tener sesgos en el contenido visual (p. ej., estereotipos de género o raza) que no se han mitigado en esta conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GatekeeperZA/Qwen3-VL-4B-Instruct-RKLLM-v1.2.3
- Modelo base Qwen3-VL-4B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Repositorio del RKLLM API Server: https://github.com/GatekeeperZA/RKLLM-API-Server
- Repositorio oficial de Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- Modelo hermano (2B): https://huggingface.co/GatekeeperZA/Qwen3-VL-2B-Instruct-RKLLM-v1.2.3
