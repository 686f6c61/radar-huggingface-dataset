# henryhale/Kintu-2.0-30M-ONNX

## Resumen

Kintu-2.0-30M-ONNX es la exportación a formato ONNX de Kintu-2.0-30M, un modelo de chat de 30 millones de parámetros especializado en luganda (idioma bantú hablado principalmente en Uganda). Lo desarrolla henryhale y está construido sobre la base de MiniMind, un framework de entrenamiento de modelos de lenguaje de pequeño tamaño. La relevancia de esta versión concreta radica en su orientación a inferencia en dispositivo (on-device): se distribuye en siete variantes cuantizadas que van desde 127,4 MB en fp32 hasta 22,8 MB en q4f16, todas ejecutables con ONNX Runtime sin necesidad de GPU.

El modelo resuelve un nicho muy específico: generación de texto conversacional en luganda con un coste computacional mínimo, apto para aplicaciones móviles o entornos con recursos limitados. No compite en capacidades generales con modelos de mayor tamaño; su valor está en la cobertura de un idioma de bajos recursos con una huella de memoria inferior a 40 MB en sus variantes cuantizadas más habituales.

Arquitectónicamente es un transformer denso de 8 capas con 4 cabezas KV y tamaño de cabeza 64, con una longitud de contexto de solo 512 tokens. Cada variante ONNX implementa decodificación incremental con caché KV y fue validada contra el modelo PyTorch original tras un paso de prefill y un paso de decodificación con caché, verificando que predicen el mismo siguiente token.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (8 capas, 4 cabezas KV, head size 64) |
| Parametros totales | 30M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | fp32, fp16, uint8 asimetrico/fp16, q8 simetrico/fp16, int8 dinamico/fp32, q4/fp32, q4/fp16 |
| Idiomas soportados | luganda (lg) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (7 variantes; el modelo base en PyTorch esta en henryhale/Kintu-2.0-30M) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 8 capas con 4 cabezas KV y dimensión de cabeza 64, entrenado mediante el framework MiniMind. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esa información no está disponible en la documentación proporcionada. El vocabulario del modelo tiene 6400 entradas, deducible de la forma del tensor de logits de salida (`[batch, 6400]`).

La innovación técnica destacable de esta versión es la exportación ONNX con soporte de caché KV explícito: cada variante expone tensores `past_key_{0..7}` y `past_value_{0..7}` de forma `[batch, 4, past_sequence, 64]` y devuelve los correspondientes `present_*`, permitiendo decodificación incremental token a token. Las variantes de 4 y 8 bits emplean el operador contrib `MatMulNBits` de ONNX Runtime. La model card reporta la desviación máxima de logits frente al modelo PyTorch original para cada variante: 0,000 en fp32, 0,004 en fp16, 0,077 en uint8f16, 0,114 en q8f16, 1,436 en int8 y 2,087 en q4 y q4f16.

## Capacidades

- Generación de texto conversacional en luganda, con plantilla de chat (`apply_chat_template`) compatible con el tokenizador de Transformers.
- Decodificación incremental con caché KV, adecuada para generación token a token en tiempo real en dispositivos.
- Inferencia on-device mediante ONNX Runtime, sin dependencia de GPU.
- Siete variantes de cuantización con distintos compromisos entre tamaño, precisión numérica y velocidad.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Soporte multilingüe limitado al luganda según el campo `language: lg`.
- No compatible con Transformers.js ni con Optimum: los nombres de entradas y salidas siguen la convención de la aplicación Kintu, no la estándar de Transformers.

## Casos de uso

- Aplicaciones de chat en luganda para móviles de gama baja: la variante q4f16 ocupa 22,8 MB y ejecuta con activaciones fp16 sobre CPU, lo que permite integrarla en apps Android o iOS sin servidor.
- Asistentes conversacionales offline en zonas con conectividad limitada: al ejecutarse con ONNX Runtime localmente, el modelo funciona sin conexión a red, útil en regiones de Uganda con cobertura intermitente.
- Prototipado rápido de interfaces conversacionales en luganda: la variante q4 (30,8 MB, activaciones fp32) es la recomendada por el autor para teléfonos y sirve para validar flujos de diálogo antes de invertir en modelos mayores.
- Investigación sobre modelos de bajos recursos lingüísticos: sirve como línea base reproducible para experimentos de cuantización y evaluación en luganda, con desviaciones de logits documentadas por variante.
- Educación y demostraciones de PLN en luganda: el tamaño reducido permite desplegar el modelo en entornos de aula o talleres con hardware modesto.
- Integración en pipelines de preprocesado o generación de respuestas cortas: con 512 tokens de contexto y respuestas de hasta ~100 tokens (como en el ejemplo de la model card), encaja en tareas de generación breve y acotada.
- Validación de exportaciones ONNX: las siete variantes con métricas de desviación frente a PyTorch sirven como referencia para comparar estrategias de cuantización en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la desviación máxima de logits frente al modelo PyTorch original por variante, que se recoge en la tabla siguiente:

| Variante | Pesos / computo | Tamano | Max abs(delta logit) |
|---|---|---:|---:|
| `onnx/model.onnx` | fp32 | 127,4 MB | 0,000 |
| `onnx/model_fp16.onnx` | fp16 | 63,9 MB | 0,004 |
| `onnx/model_uint8f16.onnx` | 8-bit asimetrico / fp16 | 38,0 MB | 0,077 |
| `onnx/model_q8f16.onnx` | 8-bit simetrico / fp16 | 37,1 MB | 0,114 |
| `onnx/model_int8.onnx` | int8 dinamico / fp32 | 32,1 MB | 1,436 |
| `onnx/model_q4.onnx` | 4-bit / fp32 | 30,8 MB | 2,087 |
| `onnx/model_q4f16.onnx` | 4-bit / fp16 | 22,8 MB | 2,087 |

## Requisitos de hardware

- VRAM estimada: no aplica en la mayoría de despliegues; el modelo está pensado para CPU. En sus variantes cuantizadas el peso de los parámetros va de 22,8 MB a 38,0 MB, más la caché KV (4 cabezas × 64 dimensiones × 8 capas × longitud de secuencia, en float32).
- GPU recomendadas: no se especifican; el modelo está orientado a ejecución en CPU con ONNX Runtime. Cualquier GPU compatible con ONNX Runtime podría ejecutarlo, pero no es el caso de uso previsto.
- Cabe en cualquier GPU consumer e incluso en dispositivos móviles; la variante q4f16 de 22,8 MB es la más ligera.
- Opciones de despliegue: ONNX Runtime (Python, C++, Java, etc.) con el operador contrib `MatMulNBits` para las variantes de 4 y 8 bits. No es compatible con Transformers.js ni con Optimum.
- Latencia y throughput: no disponibles en la información proporcionada. La model card solo indica que cada variante decodifica de forma incremental con caché KV.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de modelos comparables documentados en la información proporcionada. Como referencia estructural, el modelo se apoya en MiniMind (framework de entrenamiento de modelos pequeños) y deriva del modelo base henryhale/Kintu-2.0-30M, pero no se han encontrado en la documentación disponibles comparaciones con alternativas de la misma categoría (modelos de ~30M de parámetros para idiomas de bajos recursos). Por tanto, la comparativa se indica como no disponible.

## Limitaciones y advertencias

- Con 30M de parámetros, el modelo escribe luganda fluido pero a menudo se desvía del tema y comete errores factuales, según reconoce el propio autor.
- La longitud de contexto es de solo 512 tokens; las posiciones más allá de ese límite fallan.
- El soporte lingüístico se limita al luganda; no se documentan capacidades en otros idiomas.
- No se documentan sesgos conocidos, pero al ser un modelo pequeño entrenado con datos no especificados, cabe esperar sesgos propios del corpus de entrenamiento.
- Riesgo de alucinación elevado por el tamaño reducido del modelo y la falta de datos de entrenamiento detallados.
- La licencia Apache 2.0 permite uso comercial, pero la calidad del modelo en producción es limitada para tareas que requieran precisión factual.
- Los nombres de tensores siguen la convención de la aplicación Kintu, por lo que no carga directamente en Transformers.js ni en Optimum; requiere código de inferencia propio con ONNX Runtime.
- La inicialización de la caché KV requiere un paso con una posición de ceros y máscara a 0; un manejo incorrecto de este paso puede producir errores de forma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/henryhale/Kintu-2.0-30M-ONNX
- Modelo base: https://huggingface.co/henryhale/Kintu-2.0-30M
- Framework MiniMind: https://github.com/jingyaogong/minimind
