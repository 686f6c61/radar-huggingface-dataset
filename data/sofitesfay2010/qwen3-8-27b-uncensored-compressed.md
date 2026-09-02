# SofiTesfay2010/Qwen3.8-27B-Uncensored-Compressed

## Resumen

SofiTesfay2010/Qwen3.8-27B-Uncensored-Compressed es una versión extremadamente comprimida del modelo orcarouter/Qwen3.8-27B-Uncensored, que a su vez es una adaptación "abliterada" (sin rechazos) del Qwen3.8-27B de Alibaba. El modelo original es un transformer denso de 27B parámetros con atención híbrida (Gated DeltaNet lineal + atención completa), nativo multimodal (visión-lenguaje), con capacidades de razonamiento, tool-calling y decodificación especulativa MTP. Esta versión comprimida utiliza el método Sherry 3:4 Sparse Ternary Quantization a 1.25 bits por peso, reduciendo el tamaño de ~55.6 GB a ~4.3 GB y permitiendo ejecutarlo en menos de 5 GB de RAM/VRAM.

La relevancia de este modelo radica en su capacidad para ejecutar un modelo de 27B en hardware muy limitado, aunque a costa de una degradación significativa de la calidad debido a la compresión extrema. Está pensado para entornos con recursos mínimos, como dispositivos edge o GPUs de gama baja, donde un modelo de este tamaño normalmente no cabría. La licencia Apache 2.0 permite uso comercial sin restricciones, y al ser una versión "uncensored", no aplica los filtros de seguridad habituales de Qwen, lo que puede ser útil para investigación pero también conlleva riesgos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (Gated DeltaNet lineal + atención completa), nativo multimodal (visión-lenguaje) |
| Parametros totales | 7.279.541.580 (según safetensors; el modelo base original tiene ~27B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el modelo base soporta contexto largo, pero no se especifica el valor) |
| Tipos de cuantizacion | Sherry 3:4 Sparse Ternary Quantization a 1.25 bpw (C(4,3) × 2³ = 32 = 2⁵) |
| Idiomas soportados | no disponible (el modelo base de Qwen soporta múltiples idiomas, pero no se detalla) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con una arquitectura híbrida de atención: combina una capa de atención lineal Gated DeltaNet con atención completa tradicional, lo que permite manejar contextos largos de forma más eficiente. Incluye una cabeza de decodificación especulativa MTP (multi-token prediction) que acelera la generación. Es un modelo nativo multimodal, entrenado para procesar tanto texto como imágenes, con capacidades de razonamiento y tool-calling.

La versión comprimida aplica Sherry 3:4 Sparse Ternary Quantization, un método que representa cada grupo de 4 pesos con 3 ternarios (valores -1, 0, 1) más un factor de escala, logrando 1.25 bits por peso. Esto reduce drásticamente el tamaño del modelo, pero también introduce una pérdida de precisión considerable. No se dispone de información sobre el proceso de entrenamiento o fine-tuning de esta versión comprimida; el autor solo indica que es una compresión del modelo abliterado orcarouter/Qwen3.8-27B-Uncensored.

## Capacidades

- Generación de texto y razonamiento: mantiene las capacidades básicas del modelo base, aunque con calidad degradada por la compresión.
- Tool calling / function calling: soportado por el modelo base, presumiblemente preservado en la versión comprimida, aunque con menor fiabilidad.
- Razonamiento multi-paso: el modelo base incluye un modo de razonamiento (thinking mode) que la versión comprimida puede conservar de forma limitada.
- Visión: el modelo base es nativo multimodal, pero la versión comprimida no incluye el proyector de visión (mmproj) en este repositorio; se necesitaría el archivo adicional si se quiere usar con imágenes.
- Multilingüe: el modelo base de Qwen soporta múltiples idiomas, pero no se especifica cuáles en esta versión.
- Sin filtros de seguridad: al ser una versión "uncensored" (abliterada), no aplica los rechazos habituales de Qwen ante solicitudes sensibles.

## Casos de uso

- Inferencia en dispositivos edge: con un consumo de memoria inferior a 5 GB, puede ejecutarse en Raspberry Pi con suficiente RAM, smartphones de gama alta o mini-PCs, permitiendo chatbots locales sin conexión.
- Prototipado rápido en entornos con GPU limitada: desarrolladores con GPUs de 4 GB (como GTX 1650 o RTX 3050) pueden probar un modelo de 27B sin necesidad de hardware caro, aunque con respuestas de menor calidad.
- Generación de texto en aplicaciones de bajo presupuesto: startups o proyectos personales que necesiten un LLM local sin coste de API y con requisitos mínimos de hardware.
- Investigación sobre compresión extrema: útil para estudiar los límites de la cuantización ternaria y su impacto en la calidad del modelo, comparando con versiones menos comprimidas.
- Automatización de tareas simples de procesamiento de lenguaje: resúmenes cortos, clasificación de texto, extracción de entidades, donde la pérdida de precisión es aceptable.
- Chatbots sin censura para entornos controlados: dado que es una versión "uncensored", puede usarse en entornos de investigación donde se necesite explorar respuestas sin filtros, siempre con las debidas advertencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Dado que es una compresión a 1.25 bpw, se espera una degradación significativa respecto al modelo original de 27B, pero no hay datos cuantitativos que lo confirmen.

## Requisitos de hardware

- VRAM/RAM estimada: menos de 5 GB para inferencia, según la model card.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.) o incluso CPU con 5 GB de RAM libre.
- Cabe en GPUs consumer: sí, en la mayoría de GPUs modernas de gama media y baja.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (si soporta el formato), o cualquier framework que acepte safetensors cuantizados.
- Latencia y throughput: no disponibles; la compresión ternaria suele acelerar la inferencia en hardware compatible, pero no hay datos concretos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo de compresion | Tamano | Licencia |
|---|---|---|---|---|---|
| SofiTesfay2010/Qwen3.8-27B-Uncensored-Compressed | 7.28B (según safetensors) | no disponible | Sherry 3:4 1.25 bpw | ~4.3 GB | Apache 2.0 |
| orcarouter/Qwen3.8-27B-Uncensored | ~27B | no disponible | Sin comprimir (o cuantizaciones estándar de 2-8 bit) | ~55.6 GB (original) | Apache 2.0 |
| Qwen3.8-27B (original de Alibaba) | ~27B | no disponible | Sin comprimir | ~55.6 GB | Apache 2.0 |

La comparativa se limita a las versiones del mismo modelo, ya que no se dispone de datos de otros modelos comparables con compresión tan extrema. La versión comprimida sacrifica calidad por tamaño, siendo la opción más ligera pero con mayor pérdida de fidelidad.

## Limitaciones y advertencias

- La compresión a 1.25 bpw degrada severamente la calidad de las respuestas; es probable que aumenten las alucinaciones y los errores gramaticales o lógicos.
- Al ser una versión "uncensored", el modelo puede generar contenido inapropiado, ofensivo o peligroso sin filtros. No debe usarse en producción sin supervisión humana.
- No se especifica la longitud de contexto efectiva tras la compresión; es posible que se reduzca respecto al modelo original.
- El repositorio no incluye el proyector de visión (mmproj), por lo que las capacidades multimodales no están disponibles directamente.
- No hay información sobre el proceso de entrenamiento o validación de esta compresión; el autor no proporciona benchmarks ni garantías de rendimiento.
- Aunque la licencia Apache 2.0 permite uso comercial, la calidad degradada puede hacer que no sea adecuado para aplicaciones profesionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SofiTesfay2010/Qwen3.8-27B-Uncensored-Compressed
- Modelo base en Ollama: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
- Repositorio GitHub del modelo base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Demo del modelo uncensored: https://huggingface.co/spaces/quagentris/qwen38-uncensored-demo
- GitHub relacionado con Qwen 3.8 27B Uncensored: https://github.com/Wassimyounes01/qwen38-uncensored
