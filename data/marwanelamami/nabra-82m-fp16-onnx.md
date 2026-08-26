# marwanelamami/nabra-82m-fp16-onnx

## Resumen

Nabra-82M-FP16-ONNX es una variante cuantizada del modelo de síntesis de voz (TTS) Nabra-82M-v0.1, desarrollada por marwanelamami. El modelo original, creado por oddadmix, está diseñado específicamente para generar habla en árabe y ha sido convertido a formato ONNX para facilitar su despliegue en entornos de inferencia locales y dispositivos con recursos limitados. Esta versión FP16 reduce el tamaño del archivo a la mitad respecto al FP32 (163 MB frente a 325 MB) manteniendo una calidad de audio perceptualmente idéntica, según el autor.

La relevancia de este modelo radica en su enfoque en la compresión y optimización para ejecución en dispositivos, un área crítica para aplicaciones de TTS en árabe que necesitan funcionar sin conexión o con hardware modesto. Al estar licenciado bajo Apache-2.0, permite uso comercial y modificación sin restricciones significativas. El modelo acepta fonemas generados con espeak-ng, un vector de estilo y un factor de velocidad, y produce audio mono a 24 kHz. Su tamaño compacto (82 millones de parámetros) y su formato ONNX lo hacen adecuado para integración con ONNX Runtime en plataformas como móviles o sistemas embebidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los tags sugieren StyleTTS2, iSTFTNet y Kokoro, pero no se confirma en la documentacion) |
| Parametros totales | 82 millones (segun el nombre del modelo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo TTS; secuencia de fonemas limitada a 510 tokens) |
| Tipos de cuantizacion | FP16 (almacenamiento de pesos; el computo se realiza en FP32) |
| Idiomas soportados | arabe (ar) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivo `nabra_fp16.onnx`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Los tags de HuggingFace mencionan StyleTTS2, iSTFTNet y Kokoro, lo que sugiere que el modelo podria combinar un encoder de estilo, un decodificador basado en iSTFTNet y tecnicas de sintesis del ecosistema Kokoro, pero esto no esta confirmado en la model card. El proceso de entrenamiento del modelo original tampoco se describe; solo se indica que esta variante es una cuantizacion del modelo Nabra-82M-v0.1.

La cuantizacion FP16 se aplica exclusivamente al almacenamiento de los pesos: cada inicializador se convierte a FP16 y se inserta una operacion `Cast` de vuelta a FP32 antes de su consumidor. Esto implica que el calculo aritmetico se realiza en FP32, ya que la arquitectura ARMv8.0-A no soporta matematicas FP16 nativas. Como consecuencia, el pico de RAM es ligeramente superior al de la version FP32, porque el runtime mantiene ambas copias (FP16 y FP32) en memoria. La ventaja principal es la reduccion del tamano de descarga y del espacio en disco, no la mejora de latencia o consumo de memoria.

## Capacidades

- Sintesis de voz en arabe a partir de fonemas (generados con espeak-ng, voz `ar`, salida IPA) mapeados mediante el `vocab.json` del repositorio base.
- Control de estilo mediante un vector de referencia de 256 dimensiones, extraido de `voices_af_msa.pt["af_msa"]`.
- Ajuste de velocidad de habla mediante un parametro `speed` (1.0 equivale a velocidad normal).
- Generacion de audio mono a 24 kHz.
- Entrada de secuencias de fonemas con longitud maxima de 510 tokens (incluyendo tokens BOS/EOS).
- Compatibilidad con ONNX Runtime, lo que permite inferencia en CPU y en dispositivos sin GPU.

## Casos de uso

- Aplicaciones de lectura de texto en arabe para personas con discapacidad visual: el modelo puede convertir articulos, libros o mensajes en audio de forma local, sin depender de servicios en la nube, gracias a su tamano reducido y su formato ONNX.
- Asistentes de voz en dispositivos moviles o embebidos: al ocupar solo 163 MB, puede integrarse en aplicaciones Android o iOS mediante ONNX Runtime, ofreciendo respuestas habladas en arabe con baja latencia.
- Sistemas de navegacion y avisos en vehiculos: la generacion de instrucciones de voz en arabe puede ejecutarse en hardware de automocion con recursos limitados, evitando la necesidad de conexion a internet.
- Herramientas de aprendizaje de idiomas: el modelo puede pronunciar palabras o frases en arabe para estudiantes, permitiendo practicar pronunciacion con una voz sintetica clara y controlable en velocidad.
- Accesibilidad en quioscos interactivos o cajeros automaticos: la sintesis de voz en arabe puede guiar a usuarios en entornos publicos, funcionando en equipos de bajo coste sin GPU.
- Prototipado rapido de aplicaciones TTS: al ser un modelo pequeno y con licencia permisiva, los desarrolladores pueden integrarlo en demos o MVPs sin preocuparse por costes de API o restricciones de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas como MOS (Mean Opinion Score) ni comparaciones con otros modelos TTS. El autor afirma que la calidad de audio es "perceptualmente identica" a la version FP32, pero no se aportan datos cuantitativos.

## Requisitos de hardware

- Tamano del archivo: 163 MB (FP16), lo que implica un uso de RAM estimado inferior a 1 GB durante la inferencia, aunque el pico puede ser ligeramente superior al de FP32 debido a la doble copia en memoria.
- GPU: no se requiere GPU; el modelo esta disenado para ejecutarse en CPU, incluyendo procesadores ARM (como los de telefonos moviles) gracias a ONNX Runtime.
- Dispositivos compatibles: cualquier sistema con soporte para ONNX Runtime, incluyendo Raspberry Pi, smartphones, mini-PCs y servidores sin acelerador grafico.
- Opciones de despliegue: ONNX Runtime (C++, Python, C#), o integracion en aplicaciones moviles mediante los bindings de ONNX Runtime para Android/iOS.
- Latencia y throughput: no se proporcionan datos especificos. Dado el tamano del modelo (82M parametros), se espera una latencia de decenas de milisegundos por inferencia en CPU moderna, pero no hay mediciones oficiales.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. No se pueden establecer comparaciones objetivas con otras alternativas de TTS en arabe sin datos adicionales.

## Limitaciones y advertencias

- El modelo solo soporta arabe; no es adecuado para otros idiomas.
- La secuencia de fonemas esta limitada a 510 tokens, lo que restringe la longitud de las frases que se pueden sintetizar de una sola vez.
- La cuantizacion FP16 no reduce el consumo de memoria en tiempo de ejecucion; de hecho, puede aumentarlo ligeramente. Solo reduce el espacio de almacenamiento y la descarga.
- No se han documentado sesgos especificos, pero al ser un modelo TTS entrenado con una voz de referencia concreta (`af_msa`), la salida puede reflejar caracteristicas de esa voz (posiblemente un acento o dialecto particular del arabe).
- No se proporcionan garantias sobre la calidad de audio en todos los contextos; el autor menciona que la version FP16 es "perceptualmente identica" a FP32, pero no hay evaluaciones independientes.
- Para uso en produccion, se recomienda validar la salida en el hardware objetivo, ya que el rendimiento puede variar segun la plataforma.

## Enlaces

- Repositorio HuggingFace del modelo FP16: https://huggingface.co/marwanelamami/nabra-82m-fp16-onnx
- Repositorio HuggingFace del modelo base (FP32 ONNX): https://huggingface.co/marwanelamami/Nabra-82M-v0.1-ONNX
- Modelo original (antes de la conversion ONNX): https://huggingface.co/oddadmix/Nabra-82M-v0.1
- Perfil de GitHub del autor: https://github.com/marwanelamami/marwanelamami
