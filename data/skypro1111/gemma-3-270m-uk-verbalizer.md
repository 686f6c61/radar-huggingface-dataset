# skypro1111/gemma-3-270m-uk-verbalizer

## Resumen

El modelo `skypro1111/gemma-3-270m-uk-verbalizer` es un sistema de normalización de texto para síntesis de voz (TTS) en ucraniano. Desarrollado por Serhii Kravchenko (skypro1111), convierte texto escrito ucraniano en su forma oral: números, fechas, horas, monedas, unidades, abreviaturas, códigos, teléfonos, IBAN, dominios, correos electrónicos, números romanos e incrustaciones latinas. Es el paso previo a la síntesis de voz, ya que transforma el texto crudo en la secuencia que el TTS debe pronunciar.

El modelo es un ajuste fino (fine-tuning) del modelo base `google/gemma-3-270m-it`, con una arquitectura transformer causal de la familia Gemma 3. El repositorio incluye pesos en formato safetensors (bf16), GGUF (F16) y ONNX (con caché de claves/valores). Aunque el nombre indica 270 millones de parámetros, el archivo safetensors real contiene 125.062.656 parámetros, lo que sugiere que se aplicó una poda (pruning) al modelo original. La licencia es `gemma`, la de los modelos Gemma de Google, que permite uso comercial con ciertas restricciones.

La relevancia actual radica en que aborda un problema específico y poco cubierto: la verbalización de texto ucraniano para TTS, un idioma con una morfología compleja de numerales y declinaciones. El modelo incluye además un preprocesamiento determinista obligatorio (router de dígitos y espaciado de números grandes) para mejorar la precisión en casos difíciles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Gemma 3) con poda de pesos |
| Parametros totales | 125.062.656 (según safetensors; el nombre sugiere 270M, pero el peso real es menor) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Gemma-3-270m soporta hasta 32k, pero no se confirma en el ajuste) |
| Tipos de cuantizacion | bf16 (safetensors), F16 (GGUF), ONNX (con KV-cache, sin cuantización adicional) |
| Idiomas soportados | Ucraniano (uk) exclusivamente |
| Licencia | Gemma (licencia de Google para modelos Gemma, con restricciones de uso) |
| Formato de pesos | safetensors (bf16), GGUF (F16), ONNX (con caché de claves/valores) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-270m-it`, un transformer causal de 270 millones de parámetros de la familia Gemma 3, optimizado para instrucciones y conversación. Sobre esta base se ha aplicado una poda (pruning) que reduce los parámetros a aproximadamente 125 millones, manteniendo la arquitectura transformer original. El ajuste fino se realizó con el dataset propio `skypro1111/uk-text-normalization`, que contiene ejemplos de texto ucraniano escrito y su correspondiente forma verbalizada. No se dispone de información sobre el número de tokens de entrenamiento, épocas, o técnicas de alineación como RLHF o DPO; se trata de un ajuste supervisado estándar.

El repositorio incluye scripts de poda y exportación reproducibles. El tokenizador es un SentencePiece podado (`tokenizer.model`) que es imprescindible para la conversión a GGUF, ya que sin él la tokenización falla. El modelo se ha exportado a tres formatos: safetensors (para transformers), GGUF (para llama.cpp) y ONNX con caché de claves/valores (para inferencia en CPU y dispositivos edge). La exportación ONNX incluye el KV-cache para que el decodificado sea lineal en lugar de cuadrático.

## Capacidades

- Normalización de texto ucraniano para TTS: convierte números, fechas, horas, cantidades monetarias, unidades de medida, abreviaturas, códigos, teléfonos, IBAN, dominios, direcciones de correo electrónico, números romanos e incrustaciones latinas en su forma oral.
- Declinación de numerales según el contexto gramatical: por ejemplo, distingue «при двох тисячах восьмистах тридцяти відвідувачах» (con dos mil ochocientos treinta visitantes) de otras formas.
- Concordancia de numerales con sustantivos: el modelo ajusta el caso y el género del sustantivo según el numeral.
- Distinción de convenciones de lectura según el contexto: por ejemplo, «вітамін D» se lee como «вітамін де» (letra latina), mientras que «роз'єм типу C» se lee como «роз'єм типу сі» (letra latina con pronunciación distinta).
- Generación de texto en ucraniano: al ser un modelo de lenguaje ajustado, puede producir texto ucraniano coherente, aunque su propósito principal es la normalización.
- Integración con pipelines de TTS: el modelo está diseñado como componente previo a un sintetizador de voz, aceptando texto crudo y devolviendo la secuencia verbalizada.

## Casos de uso

- Síntesis de voz en ucraniano: el modelo se utiliza como paso previo a un motor TTS para convertir texto escrito en la forma que debe pronunciarse. Por ejemplo, «Рахунок на 1111 386,40 грн» se convierte en «Рахунок на один мільйон сто одинадцять тисяч триста вісімдесят шість гривень сорок копійок», lista para ser leída por un sintetizador.
- Lectura de documentos financieros y facturas: en aplicaciones de banca por voz o asistentes de facturación, el modelo verbaliza importes, fechas de vencimiento y números de cuenta en ucraniano, evitando errores de pronunciación.
- Asistentes de voz y chatbots de atención al cliente: para leer en voz alta confirmaciones de pedidos, direcciones de correo, números de teléfono o códigos de verificación en ucraniano, con la pronunciación correcta de cada elemento.
- Accesibilidad para personas con discapacidad visual: lectores de pantalla en ucraniano pueden usar este modelo para verbalizar correctamente números, fechas y códigos en textos largos, mejorando la comprensión.
- Sistemas de navegación y mapas: lectura de direcciones, números de calle, códigos postales y coordenadas en ucraniano, con la declinación adecuada según el contexto.
- Generación de audio para e-learning o audiolibros: el modelo puede preprocesar texto ucraniano con cifras, fórmulas o referencias a unidades para que el TTS las lea de forma natural, mejorando la experiencia de escucha.

## Benchmarks y rendimiento

La model card del autor proporciona resultados de evaluación sobre conjuntos de prueba separados del entrenamiento, con decodificación greedy y sin preprocesamiento:

| Conjunto de prueba | Resultado |
|---|---|
| 139 dominios, equilibrado (2564 líneas) | 91,8% |
| Anclas, frases complejas mixtas (557) | 98,0% tolerante · 90,3% estricto |
| Transliteración (380: palabras vistas y no vistas) | 76,3% |
| Concordancia numeral + sustantivo (63) | 100% |

Además, el preprocesamiento con `bignum_spacing` mejora el rendimiento en números grandes de 13/20 a 20/20. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo es especializado en normalización de texto ucraniano.

## Requisitos de hardware

- VRAM estimada: con 125 millones de parámetros, el modelo en bf16 o F16 ocupa aproximadamente 250 MB de memoria. Para inferencia, cabría en cualquier GPU con al menos 1 GB de VRAM, incluso en GPUs integradas.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA (por ejemplo, RTX 2060, RTX 3060, A100) o incluso CPU. El autor reporta que llama.cpp alcanza ~864 tokens/s en una GPU no especificada, mientras que ONNX en la misma GPU alcanza ~55 tokens/s, por lo que llama.cpp es la opción preferida para GPU.
- Cabe en GPUs de consumo: sí, sin problema. También puede ejecutarse en CPU mediante ONNX Runtime, pensado para entornos edge.
- Opciones de despliegue: llama.cpp (con `llama-server`), ONNX Runtime (con `ORTModelForCausalLM`), y transformers estándar. El autor recomienda llama.cpp para producción en GPU y ONNX para CPU/edge.
- Latencia y throughput: según el autor, llama.cpp produce ~864 tokens/s frente a ~55 tokens/s en ONNX en la misma GPU. La diferencia se debe a que en un modelo de 270M el cuello de botella es el lanzamiento de kernels CUDA, y las CUDA graphs de llama.cpp lo optimizan.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de verbalización de texto ucraniano comparables. El único modelo similar del mismo autor es `skypro1111/mbart-large-50-verbalization`, basado en mBART, pero no se proporcionan datos de rendimiento ni especificaciones. Como referencia, el modelo base `google/gemma-3-270m-it` tiene 270 millones de parámetros y soporta múltiples idiomas, pero no está especializado en normalización de texto ucraniano. La comparación directa no es posible sin datos adicionales.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para ucraniano; no soporta otros idiomas.
- Requiere un preprocesamiento obligatorio con `digit_router` y `bignum_spacing` para manejar series largas de dígitos y números grandes; sin estos pasos, el modelo falla en casos específicos (por ejemplo, `000000` se convierte en cuatro «нуль» en lugar de seis).
- Puede alucinar en números con series de ceros largas (por ejemplo, `7000000000` se verbaliza incorrectamente como «сімсот мільярдів» en lugar de «сім мільярдів»), aunque el preprocesamiento mitiga este problema.
- La licencia Gemma permite uso comercial, pero impone restricciones: no se pueden utilizar los modelos para fines ilegales o dañinos, y se debe atribuir la autoría de Google en productos derivados. Es recomendable revisar los términos completos.
- El modelo es pequeño (125M parámetros) y su rendimiento en tareas generales de lenguaje es limitado; no debe usarse como modelo de propósito general.
- La transliteración tiene una precisión del 76,3%, lo que puede generar errores en nombres propios o palabras extranjeras no vistas durante el entrenamiento.
- El repositorio no incluye documentación sobre sesgos o comportamientos no deseados más allá de los mencionados; se recomienda probar en el dominio de aplicación antes de desplegar en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skypro1111/gemma-3-270m-uk-verbalizer
- Autor en Hugging Face: https://huggingface.co/skypro1111
- Modelo base: https://huggingface.co/google/gemma-3-270m
- Dataset de entrenamiento: https://huggingface.co/datasets/skypro1111/uk-text-normalization
- Informe técnico de Gemma 3: https://storage.googleapis.com/deepmind-media/gemma/Gemma3Report.pdf
- Repositorio de referencia sobre Gemma-3-270M: https://github.com/p1kalys/Gemma-3-270M
- Página de Gemma 3 en DeepMind: https://deepmind.google/models/gemma/gemma-3/
