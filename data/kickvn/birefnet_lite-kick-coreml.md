# kickvn/BiRefNet_lite-KICK-CoreML

## Resumen

BiRefNet_lite-KICK-CoreML es una conversión a Core ML (ML Program) del modelo de segmentación de imagen BiRefNet_lite, desarrollado originalmente por Peng Zheng (ZhengPeng7) y convertido por el usuario kickvn para su uso en KICK Studio, una aplicación de macOS orientada a la sustracción de personas (person cut-out). El modelo realiza segmentación binaria de primer plano sobre imágenes RGB de 1024×1024 píxeles y produce una máscara alfa lista para composición.

La relevancia de esta ficha radica en que no se trata de un modelo nuevo entrenado desde cero, sino de una conversión de formato optimizada para el ecosistema Apple: pesos en fp16, ejecución mediante el framework Core ML y compatibilidad con macOS 14 o superior. Esto lo hace útil para desarrolladores que necesitan integrar eliminación de fondo en aplicaciones nativas de Apple sin depender de Python en tiempo de ejecución.

El repositorio es pequeño (0,1 GB) y contiene un único paquete `birefnet.mlpackage` empaquetado en un ZIP. La licencia es MIT, heredada del modelo original, lo que permite uso comercial con atribución. No se dispone de información sobre idiomas, benchmarks publicados ni datos de entrenamiento en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiRefNet (red de segmentación con decodificador deformable, convertida a Core ML ML Program) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija de 1024×1024) |
| Tipos de cuantizacion | fp16 (compute fp16 en Core ML); no se documentan otras |
| Idiomas soportados | no disponible (modelo de imagen, sin componente lingüístico) |
| Licencia | MIT |
| Formato de pesos | `.mlpackage` (Core ML ML Program) dentro de `birefnet-lite-1024-fp16-kick-coreml.zip` |

## Arquitectura y entrenamiento

La arquitectura subyacente es BiRefNet_lite, una variante ligera de BiRefNet (Bilateral Reference Network) para segmentación de imagen de alta resolución. El modelo original emplea un backbone de extracción de características y un decodificador con módulos ASPPDeformable que utilizan `torchvision.ops.deform_conv2d`. En esta conversión, esa operación se reescribió con `grid_sample` (interpolación bilineal, padding a cero, `align_corners=True` y máscara de modulación) antes del trazado, de modo que el resultado numérico coincide con el modelo PyTorch original según el autor.

La entrada es un tensor float32 de 1×3×1024×1024 en RGB normalizado a [0,1] y estandarizado con media ImageNet (0.485, 0.456, 0.406) y desviación (0.229, 0.224, 0.225). La salida es un tensor de logits 1×1×1024×1024; la máscara alfa se obtiene aplicando sigmoid. El preprocesado y postprocesado son idénticos a los de la conversión ONNX de onnx-community. No se dispone de información sobre el número de tokens, composición del dataset, ni si hubo RLHF o DPO, ya que no se documentan en la información proporcionada.

## Capacidades

- Segmentación binaria de primer plano (foreground/background) sobre imágenes RGB de 1024×1024.
- Generación de máscara alfa mediante sigmoid sobre los logits de salida.
- Extracción de personas (person cut-out) como caso de uso principal declarado por el autor.
- Ejecución nativa en macOS 14 o superior mediante Core ML con cómputo fp16.
- Integración en aplicaciones Apple sin runtime de Python.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Eliminación de fondo en aplicaciones de macOS: el modelo se integra como `.mlpackage` en una app nativa y procesa imágenes de 1024×1024 en local, sin enviar datos a servidores, lo que es adecuado para herramientas de edición fotográfica.
- Sustracción de personas para videollamadas o retransmisiones: al generar una máscara alfa por fotograma, puede usarse en pipelines de captura de cámara para sustituir el fondo en tiempo real, siempre que la latencia del dispositivo lo permita.
- Generación de recortes para catálogos de producto: la máscara binaria permite separar el sujeto del fondo para composición sobre fondos neutros en flujos de fotografía comercial.
- Preprocesado para pipelines de visión por computador: la máscara alfa sirve como etapa previa en tareas de detección, reconocimiento o renderizado por capas.
- Herramientas de diseño gráfico en Apple Silicon: integración en plugins o apps de diseño que necesiten recortes rápidos sin conexión.
- Automatización de postproducción fotográfica: procesado por lotes de imágenes en macOS mediante un script que invoque el modelo Core ML y aplique la máscara resultante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al ser un modelo de 0,1 GB en fp16 y ejecutarse en Core ML, el consumo de memoria unificada en Apple Silicon es moderado, pero no se documenta una cifra concreta.
- GPU recomendadas: no se especifican; el modelo está pensado para ejecutarse en hardware Apple compatible con Core ML (macOS 14+), típicamente chips de la familia M.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con macOS 14 o superior; no se documenta compatibilidad con GPU NVIDIA o AMD.
- Opciones de despliegue: Core ML (ML Program) en macOS; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BiRefNet_lite-KICK-CoreML | no disponible | 1024×1024 | `.mlpackage` (Core ML) | MIT | Hugging Face (kickvn) |
| ZhengPeng7/BiRefNet_lite | no disponible | 1024×1024 | PyTorch | MIT | Hugging Face (ZhengPeng7) |
| onnx-community/BiRefNet_lite-ONNX | no disponible | 1024×1024 | ONNX | no disponible | Hugging Face (onnx-community) |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de datos de benchmarks ni de especificaciones de parámetros para contrastar con alternativas de otros autores.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en segmentación de imagen; no genera texto ni admite instrucciones en lenguaje natural.
- Entrada fija de 1024×1024; imágenes de otras resoluciones requieren redimensionado previo, lo que puede afectar a la precisión en detalles finos.
- La máscara es binaria (un solo canal), por lo que no separa múltiples instancias ni categorías semánticas.
- Riesgo de errores en bordes finos, pelo, transparencias o sujetos con bajo contraste respecto al fondo, inherente a los modelos de matting binario.
- No se documentan sesgos demográficos ni de otro tipo; al ser un modelo de segmentación, los sesgos se manifestarían en la calidad del recorte según el sujeto.
- Compatibilidad limitada a macOS 14 o superior y al runtime Core ML; no es portable a Linux o Windows sin reconversión.
- La licencia MIT permite uso comercial, pero exige conservar el aviso de copyright y atribución a Peng Zheng et al.
- No se han publicado métricas de calidad (IoU, F1) en la información disponible, por lo que la evaluación en producción debe hacerse con datos propios.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; se trata de una conversión reciente y poco validada por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kickvn/BiRefNet_lite-KICK-CoreML
- Modelo base: https://huggingface.co/ZhengPeng7/BiRefNet_lite
- Conversión ONNX de referencia: https://huggingface.co/onnx-community/BiRefNet_lite-ONNX
- Repositorio original de BiRefNet: https://github.com/ZhengPeng7/BiRefNet
