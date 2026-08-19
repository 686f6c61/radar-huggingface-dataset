# LocalMuseAI/coreml-cyberrealistic-final-lcm-native-sdpa-6bit

## Resumen

LocalMuseAI/coreml-cyberrealistic-final-lcm-native-sdpa-6bit es un artefacto experimental de conversión a Core ML del modelo de difusión fotorealista CyberRealistic (basado en Stable Diffusion 1.5) con el LoRA de LCM fusionado. El proyecto lo desarrolla LocalMuseAI como parte de una serie de builds optimizados para el Neural Engine de Apple, y este en concreto sirve para comparar el rendimiento de una implementación nativa de `scaled_dot_product_attention` (SDPA) frente al artefacto de producción anterior basado en `SPLIT_EINSUM_V2`.

El modelo genera imágenes de 512×512 píxeles a partir de texto, con un scheduler LCM que permite entre 4 y 10 pasos de inferencia (por defecto 8) y un valor de CFG de 1.5. Los pesos del UNet y del text encoder se cuantizan a 6 bits mediante k-means, mientras que el VAE (encoder y decoder) se mantiene en FP16. La inferencia se ejecuta íntegramente en el dispositivo, con un requisito mínimo de iOS 18.

Este repositorio no sustituye a la versión de producción; es un build experimental para medir el calentamiento del Neural Engine en condiciones reales. El text encoder, los componentes del VAE y el tokenizador se copian byte a byte de la versión estable `coreml-cyberrealistic-final-lcm-6bit`, por lo que las diferencias se limitan exclusivamente a la implementación de la atención.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 con LoRA LCM fusionada, convertida a Core ML |
| Parametros totales | no disponible (repo de 1.0 GB) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (texto de entrada limitado por el tokenizador de SD 1.5, típicamente 77 tokens) |
| Tipos de cuantizacion | UNet y text encoder: 6-bit k-means; VAE encoder/decoder: FP16 |
| Idiomas soportados | no disponibles |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | Core ML (paquete `.mlmodelc`) |

## Arquitectura y entrenamiento

El modelo es una conversión a Core ML de `cyberdelia/CyberRealistic`, un checkpoint de Stable Diffusion 1.x conocido por su capacidad fotográfica, con el LoRA oficial de LCM (Latent Consistency Models) fusionado en la revisión fijada por `PROVENANCE.json`. La conversión no implica reentrenamiento: los pesos originales se mantienen intactos y solo se transforman al formato Core ML.

La innovación principal de esta versión experimental reside en la implementación de la atención. Se sustituyen las operaciones de atención originales por 32 operaciones nativas de Core ML `scaled_dot_product_attention` (SDPA), lo que aprovecha las unidades aceleradoras del Neural Engine de Apple. Esta variante se compara con la implementación previa `SPLIT_EINSUM_V2` para evaluar el rendimiento y el calentamiento del hardware. El resto de la arquitectura sigue la de Stable Diffusion 1.5: un UNet con text encoder de tipo CLIP, y un VAE de compresión latente.

## Capacidades

- Generación de imágenes fotorrealistas a partir de descripciones textuales, especializado en retratos y escenas humanas.
- Inferencia acelerada por LCM: de 4 a 10 pasos (por defecto 8) con CFG 1.5, lo que reduce el tiempo de generación frente a SD 1.5 estándar.
- Resolución fija de 512×512 píxeles, compatible con la mayoría de los pipelines de Stable Diffusion.
- Ejecución completamente local en dispositivos Apple, sin necesidad de conexión a internet ni servidores externos.
- Soporte nativo para iOS 18 y versiones posteriores mediante Core ML y el Neural Engine.
- Atención nativa con `scaled_dot_product_attention` (SDPA) para un mejor uso de las capacidades de cómputo de Apple Silicon.

## Casos de uso

- Prototipado de aplicaciones de edición de fotografía en iOS: el modelo puede integrarse en apps de retoque para generar variaciones fotográficas realistas sobre el propio dispositivo, sin depender de servicios en la nube.
- Evaluación de rendimiento de Core ML en dispositivos Apple: sirve como punto de referencia para desarrolladores que quieran comparar el rendimiento de SDPA frente a `SPLIT_EINSUM_V2` en el Neural Engine.
- Generación de imágenes para redes sociales o contenido creativo: con un prompt adecuado, produce retratos de alta calidad que pueden usarse en publicaciones o material de marketing.
- Pruebas de integración de pipelines de difusión en iOS: los desarrolladores pueden usar este artefacto como base para integrar Stable Diffusion en apps, reemplazando el backend de producción cuando se valide el rendimiento.
- Investigación en cuantización y optimización para móviles: el perfil de 6-bit k-means en UNet y text encoder permite estudiar el impacto de la cuantización en la calidad visual y la velocidad de inferencia.
- Demostraciones técnicas en dispositivos Apple: sirve como ejemplo de implementación de text-to-image con LCM en iOS, útil para talleres o documentación técnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de rendimiento, latencia ni comparativas con otras implementaciones. Se recomienda ejecutar pruebas propias en dispositivos Apple para evaluar la calidad y velocidad en función del hardware objetivo.

## Requisitos de hardware

- Dispositivos con iOS 18 o posterior, dado que la atención SDPA nativa requiere este sistema operativo.
- Compatible con el Neural Engine de Apple (A12 o posterior); el rendimiento óptimo se espera en chips de la serie M (M1, M2, M3) y A17 Pro.
- Memoria del dispositivo: el repositorio ocupa 1.0 GB, por lo que se recomienda al menos 2 GB de RAM libre durante la inferencia.
- No requiere GPU externa ni conexión a internet: la generación se realiza localmente.
- Para el despliegue en producción, se recomienda integrar el paquete Core ML con `CoreML` framework de Apple y gestionar la carga del modelo con `MLModelConfiguration`.

## Comparativa con modelos similares

| Modelo | Formato | Cuantización | Resolución | Atención | Licencia |
|---|---|---|---|---|---|
| `coreml-cyberrealistic-final-lcm-native-sdpa-6bit` (este) | Core ML | 6-bit k-means (UNet/TE) + FP16 VAE | 512×512 | SDPA nativa | CreativeML OpenRAIL-M |
| `LocalMuseAI/coreml-cyberrealistic-final-lcm-6bit` | Core ML | 6-bit k-means (UNet/TE) + FP16 VAE | 512×512 | SPLIT_EINSUM_V2 | CreativeML OpenRAIL-M |
| `cyberdelia/CyberRealistic` (original) | Checkpoint SD 1.5 | FP16 (típico) | 512×512 | Atención estándar de SD | CreativeML OpenRAIL-M |

La comparativa se centra en la implementación de Core ML: este modelo es idéntico al de producción salvo por la sustitución de la atención, por lo que la diferencia de rendimiento se atribuye exclusivamente a SDPA. El modelo original de CyberRealistic no está convertido a Core ML y requiere de un runtime de Python (como ComfyUI o AUTOMATIC1111) para su uso.

## Limitaciones y advertencias

- Modelo experimental: no está destinado a producción; el autor lo publica como prueba de concepto para evaluar SDPA.
- Sin soporte técnico ni garantía: no se incluyen instrucciones de uso ni documentación adicional más allá de la model card.
- Resolución fija de 512×512: no se puede generar imágenes de otro tamaño sin reescalado o conversión adicional.
- Licencia CreativeML OpenRAIL-M: permite uso comercial, pero con restricciones de uso (no se puede usar para generar contenido ilegal o dañino, y se debe atribuir al autor).
- No se han publicado resultados de calidad o rendimiento, por lo que la eficacia del modelo en términos de tiempo y fidelidad visual no está validada.
- Requiere iOS 18 o superior, lo que limita el público objetivo a dispositivos actualizados.
- El text encoder está fijado en inglés, y no se indica soporte multilingüe.

## Enlaces

- Hugging Face: [LocalMuseAI/coreml-cyberrealistic-final-lcm-native-sdpa-6bit](https://huggingface.co/LocalMuseAI/coreml-cyberrealistic-final-lcm-native-sdpa-6bit)
- Versión de producción: [LocalMuseAI/coreml-cyberrealistic-final-lcm-6bit](https://huggingface.co/LocalMuseAI/coreml-cyberrealistic-final-lcm-6bit)
- Modelo original en Civitai: [CyberRealistic - Final](https://civitai.com/models/15003/cyberrealistic)
- Versiones LCM de CyberRealistic: [CyberRealistic LCM versions](https://civitai.com/models/292133/cyberrealistic-lcm-versions)
- Lista de modelos Core ML (referencia general): [Awesome-CoreML-Models](https://github.com/likedan/Awesome-CoreML-Models)
