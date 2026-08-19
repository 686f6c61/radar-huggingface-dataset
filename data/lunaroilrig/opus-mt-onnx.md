# LunarOilRig/opus-mt-onnx

## Resumen

El repositorio `LunarOilRig/opus-mt-onnx` contiene una colección de modelos de traducción automática OPUS-MT, originalmente desarrollados por el grupo Helsinki-NLP, convertidos al formato ONNX. La conversión ha sido realizada por el autor LunarOilRig, basándose en los grafos publicados por Xenova y la comunidad onnx-community. La particularidad técnica de esta versión es que los "PAD bans" de Marian (el framework original) se han integrado dentro del grafo mediante una operación ArgMax en el decodificador, lo que simplifica la ejecución y evita problemas de alineación de tokens durante la inferencia.

El modelo está pensado para ser ejecutado con ONNX Runtime, especialmente en entornos de CPU, lo que facilita su despliegue en producción sin necesidad de GPUs dedicadas. Aunque no se especifican los pares de idiomas concretos, la familia OPUS-MT cubre tradicionalmente un amplio abanico de lenguas. El tamaño del repositorio (5,2 GB) sugiere que puede incluir varios modelos o un modelo de gran tamaño, pero no se dispone de detalles adicionales sobre arquitectura o número de parámetros.

La relevancia de este proyecto radica en la estandarización del formato ONNX, que permite interoperabilidad entre diferentes frameworks y optimizaciones específicas para inferencia. Es una opción interesante para equipos que ya utilizan ONNX Runtime y buscan integrar traducción automática sin depender de librerías específicas de MarianNMT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (MarianNMT) convertido a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (depende del modelo OPUS-MT incluido) |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (.onnx) |

## Arquitectura y entrenamiento

Los modelos OPUS-MT originales se basan en la arquitectura MarianNMT, que es un transformer encoder-decoder estándar. El repositorio no incluye información sobre el entrenamiento, ya que se trata de una conversión de pesos ya existentes. La modificación principal introducida por LunarOilRig consiste en fusionar los "PAD bans" de Marian dentro del grafo ONNX, reemplazando la lógica externa de enmascaramiento por una operación ArgMax en el decodificador. Esto reduce la complejidad del pipeline de inferencia y evita posibles inconsistencias al manejar tokens de padding.

No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. Al ser una conversión, las capacidades del modelo dependen íntegramente de los pesos originales de Helsinki-NLP.

## Capacidades

- Traducción automática entre pares de idiomas (los específicos no están documentados en este repositorio).
- Ejecución eficiente en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Integración sencilla en pipelines existentes que ya usan ONNX.
- Compatibilidad con el ecosistema ONNX (model zoo, herramientas de optimización, etc.).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni otras funcionalidades avanzadas.

## Casos de uso

- Traducción de documentos en lote: al ejecutarse en CPU, puede procesar grandes volúmenes de texto sin depender de hardware especializado, integrándose en scripts de automatización.
- Servicio de traducción en tiempo real para aplicaciones web: mediante ONNX Runtime y un servidor como FastAPI, se puede ofrecer un endpoint de traducción con latencia moderada.
- Localización de contenido en entornos empresariales: ideal para empresas que necesitan traducir interfaces, manuales o comunicaciones internas sin enviar datos a servicios externos.
- Preprocesamiento de datos multilingües: útil para normalizar y traducir corpus antes de entrenar otros modelos de NLP.
- Despliegue en dispositivos edge o servidores sin GPU: al ser ONNX, puede ejecutarse en hardware modesto, como Raspberry Pi o instancias cloud de bajo coste.
- Investigación en traducción automática: permite comparar el rendimiento de la versión ONNX con la original de MarianNMT, o estudiar el efecto de la modificación del decodificador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como BLEU, METEOR o comparativas con otros modelos de traducción.

## Requisitos de hardware

- Al ser un modelo ONNX, puede ejecutarse en CPU con suficiente RAM. El tamaño del repositorio es de 5,2 GB, por lo que se recomienda al menos 8 GB de RAM para cargar el modelo completo.
- No se especifican requisitos de VRAM, ya que no está pensado para GPU.
- GPU recomendadas: no aplicable, aunque ONNX Runtime también soporta aceleración por GPU si se desea.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), también puede usarse con herramientas como Hugging Face Optimum o servicios de inferencia que soporten ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de traducción. Los modelos OPUS-MT originales podrían compararse con NLLB o M2M100, pero este repositorio no proporciona datos de rendimiento ni especificaciones detalladas.

## Limitaciones y advertencias

- No se documentan los pares de idiomas incluidos, lo que dificulta saber si cubre las necesidades del usuario.
- Al ser una conversión, puede haber ligeras diferencias de rendimiento respecto al modelo original en MarianNMT.
- La licencia cc-by-4.0 permite uso comercial siempre que se atribuya la autoría, pero es recomendable revisar los términos de la licencia de los modelos OPUS-MT originales.
- No se han publicado evaluaciones de sesgos o alucinaciones específicas para esta versión.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto reciente o poco utilizado; se recomienda probar su funcionamiento antes de usarlo en producción.

## Enlaces

- [Hugging Face - LunarOilRig/opus-mt-onnx](https://huggingface.co/LunarOilRig/opus-mt-onnx)
- [GitHub - lookbe/opus-mt-onnx](https://github.com/lookbe/opus-mt-onnx)
- [Colección ONNX Opus-MT de Infomaniak-AI](https://huggingface.co/collections/Infomaniak-AI/onnx-opus-mt)
- [ONNX Model Zoo](https://github.com/onnx/models)
- [ONNX Runtime Models](https://onnxruntime.ai/models)
