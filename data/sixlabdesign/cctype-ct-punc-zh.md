# SIXlabdesign/cctype-ct-punc-zh

## Resumen

cctype-ct-punc-zh es una conversión a Core ML del modelo de puntuación CT-Transformer de FunASR, desarrollado originalmente por Tongyi Lab (Alibaba). Su función es añadir signos de puntuación (，。？、) a texto chino que carece de ellos, admitiendo también palabras en inglés intercaladas. El modelo base es `iic/punc_ct-transformer_zh-cn-common-vocab272727-pytorch`, publicado en ModelScope, y esta versión ha sido convertida por Sixlab para cctype, una aplicación nativa de dictado para macOS, como complemento del modelo de reconocimiento de voz `cctype-seaco-paraformer-zh`.

Se trata de un modelo de clasificación de tokens (token-classification) que asigna a cada token de entrada una de seis clases: desconocido, sin puntuación, coma, punto, interrogación o enumeración. La arquitectura subyacente es un CT-Transformer (Continuous-Token Transformer), una variante de transformer diseñada específicamente para la predicción de puntuación sobre secuencias de tokens de ASR. El paquete Core ML ocupa aproximadamente 71 MB con pesos cuantizados a 8 bits.

Su relevancia radica en que resuelve un problema muy concreto en pipelines de reconocimiento de voz: los transcriptores ASR suelen producir texto sin puntuar, y este modelo restaura la legibilidad añadiendo signos de forma automática. La conversión a Core ML permite ejecutarlo de forma nativa y eficiente en macOS, sin depender de PyTorch ni de infraestructura Python en el dispositivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CT-Transformer (transformer para clasificación de tokens) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens por ventana de entrada (L ≤ 512); clasificación en ventanas de 20 palabras |
| Tipos de cuantizacion | Pesos 8 bits (cuantización lineal simétrica), cómputo FP32 |
| Idiomas soportados | Chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (`.mlpackage`); vocabulario en `tokens.json` |

## Arquitectura y entrenamiento

El modelo es un CT-Transformer, una arquitectura transformer orientada a la clasificación token a token para la inserción de puntuación en transcripciones ASR. La entrada son identificadores de token con forma `[1, L]` y la salida es una clase por token con la misma forma `[1, L]`, con seis posibles etiquetas: 0 `<unk>`, 1 sin puntuación, 2 coma (，), 3 punto (。), 4 interrogación (？) y 5 enumeración (、). La tokenización sigue el esquema de FunASR sin jieba: las secuencias de caracteres ASCII se tratan como una palabra y cada carácter restante como una palabra independiente.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La conversión a Core ML aplica cuantización lineal simétrica de pesos a 8 bits manteniendo el cómputo en FP32, con un tamaño resultante de aproximadamente 71 MB. El autor indica que la salida es idéntica a la del modelo original de FunASR en los textos de referencia. El procesamiento se realiza clasificando 20 palabras cada vez y arrastrando las frases incompletas a la ventana siguiente.

## Capacidades

- Predicción de puntuación sobre texto chino sin puntuar, insertando coma, punto, interrogación y enumeración.
- Manejo de palabras en inglés intercaladas en texto chino.
- Clasificación token a token con ventanas de hasta 512 tokens de entrada.
- Procesamiento por ventanas deslizantes de 20 palabras con continuidad de frase entre ventanas.
- Ejecución nativa en macOS mediante Core ML.
- No soporta tool calling, function calling ni razonamiento multi-step.
- No dispone de modo de pensamiento (thinking mode), visión ni audio.
- Capacidad multilingüe limitada a chino e inglés.

## Casos de uso

- Puntuación de transcripciones ASR en chino: tras un pipeline de reconocimiento de voz, el modelo recibe la secuencia de tokens sin puntuar y devuelve la misma secuencia con signos insertados, mejorando la legibilidad del texto generado.
- Aplicaciones de dictado en macOS: integrado en cctype como complemento del modelo Paraformer, permite que el texto dictado aparezca puntuado en tiempo real sin salir del dispositivo.
- Preprocesado de subtítulos: para generar subtítulos legibles a partir de audio transcrito automáticamente, el modelo añade puntuación que facilita la segmentación y lectura.
- Limpieza de corpus de texto: normalización de transcripciones masivas sin puntuación antes de indexarlas o analizarlas, aprovechando la ventana de 512 tokens y el procesamiento por bloques de 20 palabras.
- Procesamiento en local sin conexión: al ser un paquete Core ML de 71 MB, puede ejecutarse en dispositivos macOS sin depender de servicios en la nube, lo que resulta adecuado para aplicaciones con requisitos de privacidad.
- Integración en herramientas de accesibilidad: conversión de voz a texto puntuado para usuarios que dependen de dictado, con latencia baja al ejecutarse de forma nativa en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente indica que la salida es idéntica a la del modelo original de FunASR en los textos de referencia, sin aportar métricas cuantitativas.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el paquete Core ML ocupa aproximadamente 71 MB en disco y se ejecuta en el dispositivo.
- GPU recomendadas: cualquier Mac con soporte Core ML; no se especifican modelos concretos de GPU (A100, H100, RTX 4090) porque el modelo está orientado a ejecución nativa en macOS.
- Cabe en hardware de consumo: sí, al estar diseñado para macOS y ocupar 71 MB.
- Opciones de despliegue: Core ML en macOS; el modelo original de FunASR puede desplegarse con las herramientas de FunASR en Python.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| cctype-ct-punc-zh | CT-Transformer | 512 tokens (ventanas de 20 palabras) | zh, en | Apache 2.0 | Core ML |
| iic/punc_ct-transformer_zh-cn-common-vocab272727-pytorch (modelo base) | CT-Transformer | no disponible | zh, en | Apache 2.0 | PyTorch |
| cctype-seaco-paraformer-zh | Paraformer (ASR) | no disponible | zh | no disponible | Core ML |

El modelo base comparte arquitectura y licencia con esta conversión, pero se distribuye en PyTorch y no está optimizado para ejecución nativa en macOS. El modelo cctype-seaco-paraformer-zh es un modelo de reconocimiento de voz, no de puntuación, y se usa como complemento en el mismo pipeline.

## Limitaciones y advertencias

- El modelo solo inserta cuatro signos de puntuación (，。？、); no genera comillas, paréntesis, dos puntos ni otros signos.
- La cobertura lingüística se limita a chino e inglés; no se garantiza un comportamiento correcto en otros idiomas.
- No se dispone de información sobre sesgos conocidos ni sobre la tasa de alucinación en la documentación proporcionada.
- El procesamiento por ventanas de 20 palabras con arrastre de frases incompletas puede introducir errores en fronteras de ventana si la implementación no replica exactamente la lógica de FunASR.
- La licencia Apache 2.0 permite uso comercial, pero el autor señala que el modelo original es obra de Tongyi Lab / FunASR y este repositorio solo realiza la conversión.
- Al ser una conversión a Core ML, el despliegue está restringido al ecosistema Apple; para otros entornos debe usarse el modelo original en PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SIXlabdesign/cctype-ct-punc-zh
- Modelo base en ModelScope: https://modelscope.cn/models/iic/punc_ct-transformer_zh-cn-common-vocab272727-pytorch
- Modelo complementario de ASR: https://huggingface.co/SIXlabdesign/cctype-seaco-paraformer-zh
- Repositorio FunASR: no disponible en la información proporcionada
- Repositorio cctype (scripts de conversión en `Tools/punctuation`): no disponible en la información proporcionada
