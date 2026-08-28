# desert-ant-labs/title

## Resumen

El modelo `desert-ant-labs/title` es un modelo de generación de texto especializado en producir un título factual corto (de 3 a 8 palabras) y una descripción de una o dos frases para cualquier pasaje de texto, diseñado para ejecutarse íntegramente en dispositivos Apple (iOS, macOS, tvOS, visionOS). Ha sido desarrollado por Desert Ant Labs, un laboratorio europeo centrado en modelos pequeños y de propósito específico que funcionan sin conexión.

Se trata de un fine-tune del modelo base `ibm-granite/granite-4.0-350m`, con un total de 77.128.704 parámetros y pesos cuantizados a 6 bits en formato MLX. La ventana de contexto, los datos de entrenamiento y el resto de especificaciones no se detallan en la documentación pública. El modelo está pensado para tareas de resumen y descripción en dispositivos, con un registro deliberadamente plano (sin emojis, hashtags ni clickbait). Su relevancia radica en ofrecer una alternativa ligera y local para generar metadatos de contenido, evitando llamadas a APIs externas y preservando la privacidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fine-tune de `ibm-granite/granite-4.0-350m` (arquitectura Granite MoE Hybrid, sin más detalle) |
| Parametros totales | 77.128.704 |
| Parametros activos | no disponible (el base es MoE, pero no se indica el número de activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6-bit (MLX) |
| Idiomas soportados | Multilingüe (etiqueta `multilingual`) |
| Licencia | Desert Ant Labs Source-Available License 1.0 (uso comercial gratuito hasta cierto umbral, licencia comercial a escala) |
| Formato de pesos | MLX (safetensors cuantizados 6-bit), también existe un export PyTorch (`title.pt`) en el repositorio |

## Arquitectura y entrenamiento

El modelo es un fine-tune del base `ibm-granite/granite-4.0-350m`, que emplea una arquitectura híbrida Granite MoE (Mixture of Experts). No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se utilizó RLHF o DPO. La documentación indica que fue afinado sobre clips de transcripciones, aunque funciona sobre cualquier prosa. El prompt de instrucción es fijo y debe usarse la redacción exacta proporcionada en el SDK (`Titles.prompt`); cualquier paráfrasis se considera una tarea distinta para el modelo. La salida se estructura en dos líneas etiquetadas: `TITLE:` y `DESC:`. El modelo se distribuye en formato MLX, que solo es compatible con Apple Silicon, y se descarta un export a Core ML por ser más lento en decodificación autoregresiva.

## Capacidades

- Generación de títulos factuales cortos (3-8 palabras) y descripciones de una o dos frases para pasajes de texto.
- Funciona sobre prosa general, no solo sobre transcripciones.
- Registro deliberadamente plano: sin emojis, hashtags ni clickbait.
- Multilingüe (etiqueta oficial), aunque no se especifican los idiomas concretos.
- Ejecución totalmente en el dispositivo (on-device) con MLX en Apple Silicon.
- No se menciona soporte para tool calling, agentes ni razonamiento multi-paso.
- No se mencionan capacidades de visión ni audio.

## Casos de uso

- Generación de metadatos para artículos o entradas de blog: el modelo puede titular y describir automáticamente un texto antes de publicarlo, ahorrando tiempo editorial y manteniendo un tono neutro.
- Resumen de transcripciones de reuniones o podcasts: dado un fragmento de transcripción, produce un título y una descripción que identifican el pasaje, útil para indexar contenido multimedia.
- Organización de documentos locales: en una app de notas o gestor de archivos, el modelo genera títulos y descripciones para documentos sin conexión, preservando la privacidad.
- Accesibilidad en lectores de pantalla: puede proporcionar descripciones breves de bloques de texto para usuarios con discapacidad visual, mejorando la navegación.
- Etiquetado automático en sistemas de gestión de contenidos (CMS): el modelo alimenta campos de título y meta descripción en publicaciones, con un registro que evita el clickbait.
- Asistente de escritura en apps de productividad: mientras el usuario escribe, el modelo sugiere un título y un resumen del párrafo actual, ayudando a estructurar el contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay cifras de calidad: "This card carries no quality figures: no independent review has been completed".

## Requisitos de hardware

- El modelo está pensado para dispositivos Apple con Apple Silicon (iOS, macOS, tvOS, visionOS).
- Con 77M parámetros cuantizados a 6 bits, el tamaño del repositorio es de 0,3 GB, por lo que cabe en cualquier dispositivo Apple con al menos 1 GB de RAM disponible.
- Se ejecuta mediante el SDK `desert-ant-core` con el trait `MLX` en Swift.
- No se proporcionan datos de latencia ni throughput.
- No hay soporte para Android, Linux o Windows (MLX es exclusivo de Apple).
- Opciones de despliegue: integración nativa vía Swift Package Manager; no se mencionan vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos de la misma categoría (generación de títulos on-device). El modelo base `ibm-granite/granite-4.0-350m` es el único punto de referencia conocido, pero no hay datos públicos de rendimiento relativo.

## Limitaciones y advertencias

- El modelo está en fase de pruebas internas y su calidad no ha sido revisada de forma independiente.
- Se conoce un problema abierto: a veces la descripción comienza con una frase hecha que la propia instrucción prohíbe. El resultado debe revisarse antes de mostrarlo a un usuario final.
- La licencia es source-available, no open source: es gratuita para la mayoría de aplicaciones, pero se requiere una licencia comercial a partir de cierto volumen de uso. Consultar los términos completos en el enlace de la licencia.
- El modelo solo funciona en Apple Silicon; no hay artefactos para otras plataformas.
- El prompt de instrucción es fijo y debe usarse la redacción exacta; cualquier variación puede degradar el rendimiento.
- No se especifican los idiomas concretos soportados, a pesar de la etiqueta `multilingual`.
- No hay información sobre sesgos, alucinaciones o límites de contexto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/title
- Documentación del modelo en el SDK: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/docs/models/title.md
- Repositorio del SDK: https://github.com/Desert-Ant-Labs/desert-ant-core
- Sitio web de Desert Ant Labs: https://desertant.com/
- Licencia: https://license.desertant.com/1.0
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-350m
