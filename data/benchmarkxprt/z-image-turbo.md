# benchmarkxprt/Z-Image-Turbo

## Resumen

Z-Image-Turbo es un modelo de generación de imágenes a partir de texto (text-to-image) desarrollado originalmente por Tongyi-MAI. El repositorio que se analiza aquí es una adaptación a formato ONNX realizada por el usuario benchmarkxprt, específicamente optimizada para su ejecución en WebNN y WebGPU, es decir, para correr directamente en navegadores web modernos. Esta versión está pensada para fines educativos y de prueba, tal como indica su model card, y se distribuye bajo licencia Apache 2.0.

El modelo original de Tongyi-MAI no está documentado en la información proporcionada, por lo que no se dispone de detalles sobre su arquitectura, número de parámetros o longitud de contexto. El repositorio tiene un tamaño de 9,9 GB, lo que sugiere que los pesos están en formato ONNX, probablemente sin cuantizar. La relevancia de esta adaptación radica en que permite ejecutar generación de imágenes en el navegador sin necesidad de servidores dedicados, aprovechando las capacidades de aceleración por hardware de WebGPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo original ni sobre los datos de entrenamiento. La model card únicamente indica que se trata de una adaptación ONNX del modelo Z-Image-Turbo de Tongyi-MAI, optimizada para WebNN y WebGPU. No se mencionan innovaciones técnicas específicas en esta adaptación, más allá de la conversión de formato y la posible optimización para inferencia en navegador.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image).
- Ejecución en navegador mediante WebNN o WebGPU, lo que permite inferencia local sin servidor.
- Compatible con el pipeline de Hugging Face `text-to-image`.
- No se documentan capacidades adicionales como tool calling, agentes o razonamiento multimodal.

## Casos de uso

- Prototipado rápido de generación de imágenes en aplicaciones web: al ejecutarse en el navegador, los desarrolladores pueden integrar la generación de imágenes en demos interactivas sin necesidad de infraestructura backend.
- Herramientas educativas para enseñar modelos generativos: su licencia Apache 2.0 y su formato ONNX facilitan su uso en cursos y talleres sobre IA en el navegador.
- Aplicaciones de diseño asistido en cliente: los usuarios pueden generar imágenes localmente en su navegador, reduciendo la latencia de red y los costes de servidor.
- Pruebas de concepto de WebGPU y WebNN: sirve como ejemplo de referencia para evaluar el rendimiento de estas APIs en diferentes dispositivos.
- Generación de imágenes en entornos con restricciones de privacidad: al no enviar datos a un servidor externo, los datos del usuario permanecen en el dispositivo.
- Integración en extensiones de navegador o aplicaciones PWA que requieran generación de imágenes sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser una adaptación ONNX para WebNN/WebGPU, se requiere un navegador compatible con WebGPU (Chrome, Edge, Firefox, Safari en versiones recientes) y una GPU con soporte para WebGPU.
- No se especifica la VRAM mínima, pero el tamaño del repositorio (9,9 GB) sugiere que los pesos completos pueden requerir varios gigabytes de memoria de GPU.
- No se indican GPUs concretas recomendadas; depende de la implementación de WebGPU del navegador y del sistema operativo.
- Opciones de despliegue: exclusivamente en navegador mediante WebNN/WebGPU. No se menciona compatibilidad con vLLM, llama.cpp u otros motores de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (adaptaciones ONNX para WebGPU de modelos text-to-image). El modelo original Z-Image-Turbo de Tongyi-MAI podría compararse con otros modelos de generación de imágenes, pero no se tienen datos de sus especificaciones.

## Limitaciones y advertencias

- El modelo está destinado únicamente a fines educativos y de prueba, según la model card. No se recomienda su uso en producción sin una evaluación adicional.
- No se documentan sesgos, riesgos de alucinación o limitaciones de idioma, pero al ser un modelo de generación de imágenes, puede producir contenido no deseado o inexacto.
- La adaptación ONNX puede tener un rendimiento inferior al modelo original en términos de velocidad o calidad, dependiendo de la implementación de WebGPU.
- La licencia Apache 2.0 permite uso comercial, pero se deben cumplir los términos de la licencia y las condiciones de uso del modelo original.
- No se proporcionan instrucciones de instalación ni ejemplos de uso más allá del enlace al sample de WebNN.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/benchmarkxprt/Z-Image-Turbo
- Modelo original (referencia): https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Ejemplo de uso con WebNN: https://microsoft.github.io/webnn-developer-preview/
