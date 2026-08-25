# aoiandroid/nllb-200-coreml-128-ios

## Resumen

Este repositorio contiene una conversión del modelo de traducción NLLB-200 de Meta AI a formato Core ML, compilado específicamente para iOS. El autor, aoiandroid, lo publica como parte del proyecto TranslateBlue, una aplicación de traducción que ejecuta el modelo íntegramente en el dispositivo. El sufijo "128" hace referencia a una ventana de contexto de 128 tokens, lo que indica una versión optimizada para inferencia ligera en dispositivos móviles.

El modelo original NLLB-200 (No Language Left Behind) es un sistema de traducción automática neuronal desarrollado por Meta, capaz de traducir entre 200 idiomas, incluyendo lenguas de bajos recursos. Esta conversión a Core ML permite ejecutarlo sin conexión en iPhone y iPad, aprovechando el Neural Engine (ANE) para acelerar la inferencia. El repositorio incluye paquetes `.mlpackage` y versiones compiladas `.mlmodelc`, con especialización ANE que se aplica en cada dispositivo.

La relevancia actual reside en la tendencia hacia la IA on-device, que evita la dependencia de servicios en la nube y preserva la privacidad. Para desarrolladores de iOS, este repositorio ofrece una vía directa para integrar traducción multilingüe offline en sus aplicaciones, aunque la documentación técnica publicada es escasa y se limita a los archivos del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer seq2seq (NLLB-200 original, variante no especificada) |
| Parámetros totales | no disponible (el NLLB-200 original tiene variantes de 600M, 1.3B, 3.3B y 54B) |
| Parámetros activos | no disponible |
| Longitud de contexto | 128 tokens (según el nombre del repositorio) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | 200 idiomas (según el modelo NLLB-200 original) |
| Licencia | MIT (declarada en el repositorio) |
| Formato de pesos | `.mlpackage`, `.mlmodelc` (Core ML compilado) |

## Arquitectura y entrenamiento

El modelo original NLLB-200 es un transformer encoder-decoder desarrollado por Meta AI, entrenado con un corpus masivo de datos paralelos y monolingües en 200 idiomas. Utiliza técnicas de *sparse attention* y *mixture-of-experts* en las variantes grandes, aunque la variante concreta utilizada aquí no se especifica. El entrenamiento del modelo original incluye una fase de *fine-tuning* con datos de alta calidad y un proceso de *teacher forcing* para mejorar la robustez.

Esta conversión a Core ML se ha realizado con `coremltools`, generando paquetes `.mlpackage` y posteriormente compilados a `.mlmodelc` para su ejecución directa en iOS. La especialización para el Neural Engine se aplica localmente en cada dispositivo, lo que permite optimizar el rendimiento sin comprometer la portabilidad. No se documenta si se aplicó cuantización adicional o pruning durante la conversión.

## Capacidades

- Traducción automática entre 200 idiomas, incluyendo lenguas de bajos recursos como asturiano, luganda o urdu.
- Ejecución totalmente offline en dispositivos iOS, sin necesidad de conexión a internet.
- Inferencia acelerada mediante el Neural Engine (ANE) de los dispositivos Apple.
- Integración directa en aplicaciones iOS mediante Core ML.
- Soporte de traducción de texto de hasta 128 tokens por consulta.
- Sin soporte para tool calling, agentes o razonamiento multi-paso: es un modelo puramente de traducción.

## Casos de uso

- **Traducción offline en apps de viajes**: una aplicación de guía turística puede integrar el modelo para traducir frases y menús en tiempo real sin conexión, ideal para zonas sin cobertura móvil.
- **Atención al cliente en dispositivos móviles**: en una app de banca o comercio, el modelo permite traducir consultas de clientes en idiomas minoritarios directamente en el dispositivo, reduciendo la latencia y los costes de servidores.
- **Traducción de documentos personales**: una app de productividad puede usarlo para traducir notas, PDFs o mensajes en el propio iPhone, sin subir datos a la nube.
- **Accesibilidad para comunidades lingüísticas minoritarias**: permite ofrecer traducciones de idiomas con pocos recursos en apps de salud o educación, sin depender de APIs externas.
- **Prototipado rápido de apps de traducción**: los desarrolladores pueden integrar el modelo en una app iOS de ejemplo y probar la calidad de traducción en un día, gracias a los formatos ya compilados.
- **Traducción en entornos con datos sensibles**: en sectores como medicina o jurídico, la ejecución on-device evita el envío de documentos confidenciales a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de calidad de traducción (BLEU, chrF, etc.) ni comparaciones con otros modelos. Para una evaluación objetiva, el usuario debería ejecutar sus propias pruebas sobre el conjunto de datos FLORES-200 u otros conjuntos de traducción multilingüe.

## Requisitos de hardware

- **Dispositivos compatibles**: iPhone y iPad con sistema operativo iOS 15 o superior y chip con Neural Engine (A11 o posterior). La especialización ANE se aplica localmente.
- **VRAM estimada**: no disponible, pero el tamaño del repositorio es de 1.8 GB, lo que sugiere que el modelo requiere al menos 1.5 GB de memoria RAM disponible en el dispositivo.
- **GPU**: no aplica, la inferencia se ejecuta en el Neural Engine, no en la GPU.
- **Opciones de despliegue**: el formato `.mlmodelc` se integra directamente en una app iOS mediante CoreML. También se puede usar el paquete `.mlpackage` con CoreML en macOS.
- **Latencia y throughput**: no disponibles. La latencia dependerá del chip del dispositivo (por ejemplo, un iPhone 15 Pro será más rápido que un iPhone SE de primera generación).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| NLLB-200 (Meta, original) | 600M a 54B | 512 tokens | 200 | CC-BY-NC 4.0 | PyTorch / safetensors |
| NLLB-200 CoreML (este repo) | no disponible | 128 tokens | 200 | MIT (declarada) | Core ML |
| Opus-MT (Helsinki-NLP) | 300M a 1.2B | variable | 1000+ pares | CC-BY 4.0 | PyTorch / ONNX |
| M2M-100 (Meta) | 418M a 12B | 512 tokens | 100 | MIT | PyTorch |

La principal diferencia frente al modelo original de Meta es el formato Core ML y la ventana de contexto reducida (128 tokens frente a 512). La licencia declarada MIT es más permisiva que la CC-BY-NC del original, pero hay que verificar si el autor del repositorio tenía derechos para cambiar la licencia.

## Limitaciones y advertencias

- **Licencia conflictiva**: el repositorio declara licencia MIT, pero el modelo NLLB-200 original de Meta AI se distribuye bajo CC-BY-NC 4.0, que prohíbe el uso comercial. El autor de este repositorio no es el propietario del modelo original, por lo que el cambio de licencia puede no ser legal. Antes de usar el modelo en una aplicación comercial, es necesario verificar la licencia del modelo subyacente y obtener los permisos necesarios de Meta.
- **Contexto limitado**: con solo 128 tokens, el modelo no es adecuado para traducir documentos largos o conversaciones extensas; se limita a frases y párrafos cortos.
- **Sesgos y alucinaciones**: no se han publicado evaluaciones de sesgos ni de calidad para esta variante Core ML. El modelo original de NLLB-200 presenta sesgos en idiomas de bajos recursos y puede producir traducciones incorrectas en contextos especializados.
- **Idiomas**: aunque el modelo original soporta 200 idiomas, no se especifica si la conversión Core ML conserva todos los idiomas o solo un subconjunto.
- **Falta de documentación**: no se incluyen detalles sobre la conversión, cuantización o parámetros exactos del modelo, lo que dificulta la evaluación de su comportamiento.
- **Dependencia del ecosistema Apple**: el formato Core ML solo funciona en dispositivos Apple, no es portátil a otras plataformas.

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/aoiandroid/nllb-200-coreml-128-ios)
- [Repositorio principal de la conversión Core ML](https://huggingface.co/aoiandroid/nllb-200-coreml-128)
- [Colección de modelos NLLB de aoiandroid](https://huggingface.co/collections/aoiandroid/nllb)
- [Página oficial de Meta sobre NLLB](https://ai.meta.com/research/no-language-left-behind/)
- [Proyecto Open-NLLB en GitHub](https://github.com/gordicaleksa/Open-NLLB)
