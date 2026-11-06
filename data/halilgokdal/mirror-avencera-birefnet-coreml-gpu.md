# halilgokdal/mirror-avencera-birefnet-coreml-gpu

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un espejo (mirror) de un artefacto Core ML derivado de BiRefNet, una red neuronal especializada en segmentación de imagen de alta resolución (image matting y salient object detection). El autor original es avencera; este repositorio lo publica halilgokdal como copia de seguridad byte a byte (verificada por SHA-256) del commit `be1968e77e87f67299736468a399f0149cc6d283`, con el objetivo declarado de que una aplicación personal para iPad pueda seguir descargando el modelo auxiliar si el repositorio original desaparece.

El artefacto empaquetado es `BiRefNet_1024_fp16.mlpackage/`, es decir, un paquete Core ML en precisión FP16 con resolución de entrada de 1024 píxeles. No se trata de un modelo generativo ni conversacional: no hay tokenizador, no hay ventana de contexto y no expone pesos en safetensors ni GGUF, sino un formato propietario de Apple (`.mlpackage`) pensado para ejecutarse en el framework Core ML sobre hardware Apple (GPU/ANE).

Su relevancia es acotada y práctica: sirve como ejemplo de despliegue de un modelo de segmentación de vanguardia en el ecosistema Apple y como referencia de preservación de artefactos binarios. Para desarrolladores que trabajen en pipelines de eliminación de fondo, matting o recorte de sujetos en dispositivos Apple, este paquete permite ejecutar BiRefNet sin depender de PyTorch ni de un backend Python.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BiRefNet (red de segmentación binaria de alta resolución), empaquetada en Core ML |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | FP16 (nombre del paquete: `BiRefNet_1024_fp16.mlpackage`) |
| Idiomas soportados | no aplica |
| Licencia | other (el README indica que los pesos originales son MIT; el campo de licencia del repo figura como "other") |
| Formato de pesos | Core ML `.mlpackage` (no safetensors ni GGUF) |
| Tamaño del repositorio | 0,5 GB |
| Resolución de entrada | 1024 (según el nombre del paquete) |
| Pipeline de Hugging Face | no disponible |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna más allá del nombre del artefacto. BiRefNet es, por lo que se conoce del modelo original, una red de segmentación de imagen de alta resolución basada en un backbone transformer con un módulo de decodificación multi-escala; sin embargo, esta ficha no dispone de detalles verificables sobre el número de capas, el backbone exacto ni el esquema de entrenamiento en la información proporcionada. El paquete está convertido a Core ML y cuantizado a FP16, lo que implica una pérdida de precisión respecto al modelo original en FP32 a cambio de reducir el tamaño y acelerar la inferencia en hardware Apple.

No se dispone de información sobre el dataset de entrenamiento, el número de imágenes, la composición de las máscaras ni si hubo etapas de refinamiento (por ejemplo, entrenamiento con pérdidas de matting o destilación). Tampoco se documentan innovaciones técnicas específicas de esta conversión, salvo la propia empaquetadura Core ML y la resolución de 1024 píxeles, que es superior a la de muchos modelos de segmentación ligeros y permite preservar detalles finos en bordes (pelo, vegetación, transparencias).

## Capacidades

- Segmentación de imagen de alta resolución (salient object detection y matting) a 1024 píxeles de entrada.
- Generación de máscaras binarias o de primer plano para recorte de sujetos.
- Ejecución nativa en Core ML, lo que permite aprovechar GPU y Neural Engine en dispositivos Apple.
- No soporta generación de texto, razonamiento, código ni matemáticas.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa lenguaje).
- No incluye modo thinking, visión general, audio ni otras modalidades más allá de la imagen de entrada y la máscara de salida.

## Casos de uso

- Eliminación de fondo en aplicaciones de iPad: el paquete Core ML se integra directamente en una app Swift/SwiftUI y permite recortar sujetos en local sin enviar imágenes a un servidor, gracias a la ejecución sobre GPU/ANE.
- Edición fotográfica en dispositivo: permite generar máscaras de primer plano para aplicar desenfoque de fondo, cambios de color o composición por capas en apps de retoque.
- Preprocesado para pipelines de visión: la máscara de 1024 px sirve como entrada para modelos posteriores de clasificación, detección o generación de imágenes (por ejemplo, inpainting o sustitución de fondo).
- Automatización de catálogo de producto: recorte masivo de imágenes de producto sobre fondo blanco o transparente, ejecutado en lote sobre Mac con Core ML.
- Videoconferencia y captura en tiempo real: sustitución de fondo en apps de cámara o streaming sobre Apple Silicon, siempre que la latencia del paquete FP16 a 1024 px sea aceptable para el caso de uso.
- Preservación de dependencias: el propio caso de uso declarado por el autor es servir como espejo de respaldo para que una app personal siga funcionando si el repositorio original se elimina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de IoU, F1, latencia ni throughput, ni comparaciones con otros modelos de segmentación.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser Core ML, el modelo se ejecuta sobre memoria unificada en Apple Silicon y no sobre VRAM dedicada de GPU convencional.
- GPU recomendadas: hardware Apple con soporte Core ML (chips de la serie M y A con Neural Engine); no se especifican modelos concretos.
- ¿Cabe en GPU de consumo? El paquete ocupa 0,5 GB, por lo que en términos de tamaño es viable en dispositivos Apple de gama media; no se dispone de datos de memoria en tiempo de ejecución.
- Opciones de despliegue: Core ML (`.mlpackage`) en apps iOS/iPadOS/macOS; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de segmentación (por ejemplo, U2-Net, MODNet o variantes de BiRefNet en otros formatos), ni datos de rendimiento que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- El repositorio es un espejo no oficial; la autoría y el mantenimiento corresponden al repositorio original de avencera.
- El campo de licencia del repositorio figura como "other", aunque el README afirma que los pesos originales son MIT; conviene verificar la licencia en el repositorio original antes de un uso comercial.
- No hay información sobre sesgos del modelo de segmentación (por ejemplo, sesgos hacia ciertos tipos de sujetos, tonos de piel o escenas).
- Riesgo de errores en bordes finos o estructuras complejas (pelo, transparencias, objetos con bajo contraste), inherente a los modelos de matting y no cuantificado en esta ficha.
- El artefacto está cuantizado a FP16, lo que puede introducir diferencias menores frente al modelo original en FP32.
- No se documentan limitaciones de resolución más allá de la entrada de 1024 px; entradas de distinta relación de aspecto requieren preprocesado.
- El repositorio no declara idiomas ni pipeline, por lo que no debe tratarse como un modelo de lenguaje ni usarse en tareas de texto.
- Al ser un artefacto Core ML, no es portable a entornos Linux/Windows sin conversión previa.

## Enlaces

- Repositorio espejo: https://huggingface.co/halilgokdal/mirror-avencera-birefnet-coreml-gpu
- Repositorio original: https://huggingface.co/avencera/birefnet-coreml-gpu
- Commit espejado: `be1968e77e87f67299736468a399f0149cc6d283`
