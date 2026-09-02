# johnson-yo/termux_os-asset-campplus-htp-onnx

## Resumen

El modelo `johnson-yo/termux_os-asset-campplus-htp-onnx` es un asset de reconocimiento de hablante (speaker recognition) basado en el modelo CAM++, empaquetado como grafo ONNX para su uso dentro del framework Termux-OS. Su propósito es determinar si la voz que llega en un momento dado corresponde a una persona previamente registrada, generando un embedding de 192 dimensiones a partir de características acústicas de entrada. Está desarrollado por johnson-yo y se distribuye bajo licencia Apache 2.0.

El modelo está optimizado para ejecutarse en dispositivos Android con Qualcomm HTP (Hexagon Tensor Processor), aunque también funciona por CPU en cualquier otro dispositivo. Con un tamaño de aproximadamente 28 MB, es un modelo ligero pensado para inferencia local en el dispositivo, sin necesidad de descargar pesos precompilados: el propio framework lo prepara en el equipo mediante generación de EPContext. La versión actual (2026-09-02) incluye el grafo fuente `graph/generic/campplus.onnx` y conserva una carpeta legacy para compatibilidad con versiones anteriores.

La relevancia de este modelo radica en su integración con Termux-OS, un subsistema abierto que permite a usuarios y agentes de IA extender sus dispositivos Android. Al ofrecer verificación de locutor local y privada, habilita casos de uso como autenticación biométrica por voz sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CAM++ (embeddings de voz) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se menciona un `model.bin` legacy, sin especificar cuantizacion) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`.onnx`) y binario legacy (`.bin`) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura CAM++, un modelo de embeddings de voz ampliamente utilizado para tareas de verificación y reconocimiento de hablante. La model card no proporciona detalles sobre el entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO), por lo que estos datos no están disponibles. La distribución se limita al grafo ONNX ya entrenado, junto con un wrapper que adapta la salida de Qualcomm AI Hub (originalmente IR 13) a IR 11 para compatibilidad con el runtime ONNX de los dispositivos. El modelo acepta una entrada denominada `feat` y produce un embedding de 192 dimensiones como salida.

## Capacidades

- Verificación de hablante: determina si una voz corresponde a una persona registrada, comparando embeddings generados.
- Generación de embeddings de voz de 192 dimensiones, útiles para tareas de similitud y clustering de locutores.
- Inferencia local en dispositivos Android con Qualcomm HTP o CPU, sin conexión a servidores externos.
- Integración nativa con Termux-OS a través de su HF Model Manager, que descarga y prepara el modelo automáticamente.
- No se documentan capacidades adicionales como tool calling, agentes o procesamiento multimodal.

## Casos de uso

- Autenticación biométrica por voz en aplicaciones móviles: el modelo puede verificar si el usuario que habla es el propietario registrado del dispositivo, habilitando desbloqueo por voz o confirmación de transacciones.
- Control de acceso físico o lógico: integrado en sistemas de seguridad, permite validar la identidad de una persona mediante su voz antes de conceder acceso a instalaciones o recursos.
- Asistentes de voz personalizados: el modelo puede distinguir entre varios usuarios en un hogar u oficina, adaptando las respuestas del asistente según quién hable.
- Registro y verificación de identidad en servicios de atención al cliente: permite confirmar la identidad del cliente durante llamadas telefónicas, reduciendo fraudes.
- Análisis forense de audio: los embeddings generados pueden utilizarse para comparar grabaciones y determinar si pertenecen al mismo locutor.
- Aplicaciones de diarización de hablantes: combinado con otros módulos, ayuda a separar y etiquetar voces en conversaciones multiparte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como precisión, EER (Equal Error Rate) o comparaciones con otros modelos de verificación de hablante.

## Requisitos de hardware

- Dispositivo Android con Qualcomm HTP (por ejemplo, Samsung Galaxy S23 con SM8550) para aceleración por hardware; cualquier otro dispositivo puede ejecutar el modelo por CPU.
- Almacenamiento: aproximadamente 28 MB para el grafo ONNX principal.
- Memoria RAM: no se especifica, pero al ser un modelo pequeño se espera que funcione en dispositivos de gama media.
- El framework Termux-OS genera el EPContext localmente en el dispositivo, sin necesidad de compilación previa.
- No se requieren GPUs dedicadas; el modelo está diseñado para inferencia en edge.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de verificación de hablante (como ECAPA-TDNN, ResNetSE o WavLM) en términos de parámetros, contexto o rendimiento. La model card no ofrece datos comparativos.

## Limitaciones y advertencias

- El modelo es pequeño (28 MB) y puede tener menor precisión que modelos más grandes de verificación de hablante, especialmente en condiciones de ruido o con voces similares.
- No se documentan sesgos específicos, pero como todo modelo de reconocimiento de voz, puede presentar sesgos según el acento, género o edad de los hablantes.
- La calidad del audio de entrada afecta directamente al rendimiento; se recomienda usar micrófonos de buena calidad y entornos silenciosos.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que el modelo base CAM++ (de Alibaba) no tenga restricciones adicionales.
- El modelo está pensado para Termux-OS; su uso fuera de este framework puede requerir adaptaciones técnicas.
- No se proporcionan garantías de precisión ni soporte oficial; es un asset comunitario.

## Enlaces

- [HuggingFace - johnson-yo/termux_os-asset-campplus-htp-onnx](https://huggingface.co/johnson-yo/termux_os-asset-campplus-htp-onnx)
- [Termux-OS framework (referencia en la model card)](https://github.com/johnson-yo/termux-os-framework)
