# aaiiaxom/indicxlit-roman-to-assamese-onnx-int8

## Resumen

IndicXlit Assamese ONNX INT8 es una conversión del modelo de transliteración IndicXlit de AI4Bharat (IIT Madras), adaptado específicamente para la transliteración de texto en alfabeto romano a escritura asamés (বঙলা). El modelo original es un transformer multilingüe de aproximadamente 11 millones de parámetros, con 6 capas de encoder y 6 de decoder, embeddings de 256 dimensiones y 4 cabezas de atención, entrenado sobre el corpus Aksharantar, que contiene 26 millones de pares de palabras en 20 lenguas indias.

Esta versión concreta, publicada por la Assam AI Initiative (aaiiaxom), exporta únicamente la ruta del prefijo de asamés del modelo original a formato ONNX con cuantización dinámica INT8. El objetivo es permitir la ejecución completamente en el navegador mediante onnxruntime-web, sin necesidad de servidor ni conexión de red tras la primera carga, lo que la hace adecuada para teclados fonéticos y entrada por voz en asamés. El modelo es de nivel de palabra (word-level), por lo que las frases deben dividirse en palabras antes de la inferencia.

La relevancia actual radica en que ofrece una solución ligera y sin dependencias de backend para la transliteración en asamés, un idioma con menos recursos digitales que otros de la India, y su licencia MIT permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (6 capas encoder, 6 capas decoder, 256 dims, 4 heads, FFN 1024) |
| Parametros totales | ~11 millones (heredados de IndicXlit) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo word-level; entrada limitada a una palabra, con max_len de decodificacion de 40 en el ejemplo) |
| Tipos de cuantizacion | INT8 dinamico |
| Idiomas soportados | Asames (as) exclusivamente en esta exportacion; el modelo original soporta 21 lenguas indias |
| Licencia | MIT |
| Formato de pesos | ONNX (encoder.int8.onnx, decoder.int8.onnx) |

## Arquitectura y entrenamiento

El modelo base es IndicXlit, un transformer multilingüe encoder-decoder de aproximadamente 11 millones de parámetros, con 6 capas en cada subred, dimensiones de embedding de 256, 4 cabezas de atención y una dimensión de feedforward de 1024. Se entrenó sobre el corpus Aksharantar, el mayor conjunto de datos paralelos público de transliteración para lenguas indias, con 26 millones de pares de palabras en 20 idiomas. El entrenamiento se realizó mediante aprendizaje supervisado estándar de secuencia a secuencia, sin etapas de RLHF ni DPO.

La conversión a ONNX INT8 no modifica la arquitectura ni los pesos originales, solo cambia el formato de serialización y la precisión numérica a enteros de 8 bits mediante cuantización dinámica. El export conserva únicamente la ruta del prefijo de asamés (`as`), descartando el resto de lenguas. Los grafos del encoder y del decoder son independientes, con ejes de secuencia dinámicos, lo que obliga a implementar el bucle autorregresivo manualmente. La decodificación se realiza por argmax o beam search, enmascarando los tokens de padding y desconocido.

## Capacidades

- Transliteración de palabras individuales de alfabeto romano a escritura asamés (por ejemplo, `axomiya` → `অসমীয়া`).
- Preservación de dígitos, puntuación y texto ya existente en asamés: pasan sin modificación a través del proceso.
- Decodificación autorregresiva con soporte de argmax o beam search.
- Ejecución completamente en el navegador mediante onnxruntime-web, sin servidor ni conexión de red tras la primera carga.
- Integración con teclados fonéticos y sistemas de entrada por voz (voice typing).
- API Python sencilla mediante onnxruntime para integración en aplicaciones de escritorio o servidores ligeros.
- Conversión a otras lenguas indias posible mediante el script de conversión original (hasta 21 idiomas).

## Casos de uso

- Teclado fonético en aplicaciones web: un usuario escribe en alfabeto romano y el modelo translitera cada palabra a asamés en tiempo real, permitiendo entrada de texto en asamés sin teclado específico. La ejecución local en el navegador elimina la latencia de red y los costes de servidor.
- Entrada por voz (voice typing): combinado con un reconocedor de voz que produzca transcripción fonética en romano, el modelo convierte la salida a escritura asamés, facilitando la redacción de mensajes o documentos en asamés a usuarios que no dominan el teclado asamés.
- Aplicaciones de mensajería y redes sociales: integración en clientes web o móviles para que usuarios de asamés puedan escribir en su idioma sin cambiar de teclado, mejorando la accesibilidad y la adopción digital.
- Procesamiento de texto en entornos sin conexión: herramientas de ofimática o editores de texto que necesiten transliteración asamés sin depender de servicios externos, gracias al formato ONNX INT8 que corre en CPU sin GPU.
- Normalización de datos para NLP: preparación de corpus en asamés a partir de texto escrito en romano, útil para entrenar otros modelos o construir recursos lingüísticos.
- Asistencia en la enseñanza del asamés: aplicaciones educativas que muestren la escritura correcta de palabras a partir de su pronunciación romanizada, ayudando a estudiantes a aprender el alfabeto asamés.

## Benchmarks y rendimiento

El modelo original IndicXlit reporta en el benchmark Aksharantar una precisión top-1 de **60.27** para palabras nativas asamés y **38.62** para entidades nombradas. Estos valores corresponden al modelo fp32 original; esta conversión INT8 no ha sido evaluada de forma independiente, por lo que deben considerarse como un límite superior teórico, no como resultado medido de estos pesos cuantizados.

| Benchmark | Precisión top-1 (fp32 original) |
|---|---|
| Aksharantar - palabras nativas asamés | 60.27 |
| Aksharantar - entidades nombradas | 38.62 |

No se dispone de mediciones de latencia o throughput específicas para esta versión INT8.

## Requisitos de hardware

- Inferencia en CPU: al ser un modelo de ~11M parámetros cuantizado a INT8, puede ejecutarse en cualquier CPU moderna sin necesidad de GPU. El ejemplo de uso en navegador confirma que funciona con onnxruntime-web.
- VRAM: no requiere VRAM dedicada; la memoria necesaria es inferior a 100 MB en RAM, aunque no se ha medido oficialmente.
- GPU recomendadas: ninguna; el modelo está diseñado para ejecución en CPU o incluso en dispositivos móviles.
- Compatibilidad con GPU de consumo: sí, pero innecesario; cualquier GPU serviría, aunque no aporta ventaja relevante.
- Opciones de despliegue: onnxruntime-web (navegador), onnxruntime Python (CPUExecutionProvider), o cualquier runtime compatible con ONNX.
- Latencia estimada: no disponible; al ser word-level y con decodificación autorregresiva, la latencia por palabra es del orden de milisegundos en CPU, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| IndicXlit (original, fp32) | ~11M | word-level | 21 lenguas indias | MIT | PyTorch |
| Esta conversión (INT8 ONNX) | ~11M | word-level | Solo asamés | MIT | ONNX INT8 |
| Otras alternativas de transliteración para asamés | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han encontrado modelos comparables específicos para transliteración asamés en la información disponible. La comparación principal es con el modelo original, del que esta conversión es una derivación con menor precisión numérica y alcance lingüístico reducido.

## Limitaciones y advertencias

- Modelo word-level: no procesa frases completas; es necesario dividir el texto en palabras antes de la inferencia, lo que puede complicar la integración en pipelines de texto continuo.
- Solo asamés: esta exportación elimina el soporte para las otras 20 lenguas del modelo original; si se necesita multilingüismo, debe usarse el modelo base.
- Rendimiento no verificado en INT8: los benchmarks publicados corresponden al modelo fp32; la cuantización puede degradar la precisión, aunque no se ha medido.
- Errores en entidades nombradas: la precisión para nombres propios y entidades es notablemente inferior (38.62 frente a 60.27), lo que puede afectar a aplicaciones que manejen nombres de personas, lugares o marcas.
- Dependencia de la calidad de la entrada romanizada: el modelo asume una transliteración fonética razonable; entradas con ortografía inconsistente pueden producir salidas incorrectas.
- Sin soporte de contexto oracional: al ser word-level, no aprovecha información contextual de la frase, lo que puede generar ambigüedades no resueltas.
- Licencia MIT: permite uso comercial sin restricciones, pero el modelo se distribuye sin garantías; el mantenimiento depende de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aaiiaxom/indicxlit-roman-to-assamese-onnx-int8
- Repositorio de conversión y cliente web: https://github.com/aaiiaxomi/indicxlit-onnx-web
- Código original de IndicXlit: https://github.com/AI4Bharat/IndicXlit
- Modelo original en HuggingFace: https://huggingface.co/ai4bharat/IndicXlit
- Paper de IndicXlit: https://arxiv.org/abs/2205.03018
- Página del modelo en AI4Bharat: https://ai4bharat.iitm.ac.in/areas/model/XLIT/IndicXlit/
- Dataset Aksharantar: https://huggingface.co/datasets/ai4bharat/Aksharantar
