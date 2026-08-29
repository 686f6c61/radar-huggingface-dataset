# q3146dq4/supertonic-3-w8a8-qnn-qdq

## Resumen

Supertonic-3 strict W8A8 QNN QDQ es una variante experimental de cuantización estricta del modelo de síntesis de voz Supertonic 3, desarrollada por el usuario q3146dq4. El modelo base, creado por Supertone Inc., es un sistema de text-to-speech (TTS) de 99 millones de parámetros diseñado para inferencia local en CPU, con soporte para 31 idiomas y sin dependencia de GPU ni servicios en la nube. Esta derivada concreta aplica una cuantización estática de pesos y activaciones en UINT8 (W8A8) con esquema QDQ (Quantize-Dequantize), orientada a la ejecución en aceleradores Qualcomm QNN/HTP para dispositivos móviles.

La relevancia de esta variante radica en su objetivo de llevar el TTS multilingüe a hardware de gama baja o integrada, reduciendo el consumo de memoria y mejorando la latencia frente al modelo original en coma flotante. El repositorio incluye validaciones de calidad espectral (log-spectrum) que muestran una mejora tras el ajuste de codificación asimétrica de activaciones en la versión V12 del vocoder. No obstante, el autor advierte que la validación en PC no garantiza el funcionamiento completo en el acelerador Qualcomm HTP.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS neuronal, arquitectura interna no publicada) |
| Parametros totales | 99 M (modelo base, segun documentacion de Supertonic 3) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de sintesis de voz, no generativo de texto) |
| Tipos de cuantizacion | W8A8 estricto: pesos UINT8 y activaciones UINT8, QDQ estatico, sin subgrafos FP32 intencionales |
| Idiomas soportados | 31 idiomas (segun documentacion del modelo base; la model card de HF indica "no disponibles") |
| Licencia | other (no especificada) |
| Formato de pesos | ONNX (con nodos QDQ) |

## Arquitectura y entrenamiento

La arquitectura interna del modelo base Supertonic 3 no se detalla en la informacion disponible. Se sabe que es un sistema TTS de 99 millones de parametros optimizado para ejecucion en CPU mediante ONNX Runtime, con soporte multilingue de 31 idiomas. Esta variante especifica no modifica la arquitectura original, sino que aplica una cuantizacion estatica estricta: tanto los pesos como las activaciones se representan en UINT8, eliminando cualquier subgrafo en FP32 (excepto los sesgos cuantizados en INT32, que son esperables en ONNX cuantizado). El proceso de cuantizacion utiliza un esquema QDQ (Quantize-Dequantize) y la version V12 del vocoder incorpora un ajuste de codificacion asimetrica de activaciones U8 por tensor.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens procesados ni el uso de tecnicas como RLHF o DPO. El autor indica que la validacion se realizo en PC mediante metricas de log-spectrum, pero no se han publicado detalles sobre el proceso de calibracion de la cuantizacion ni sobre los datos utilizados para ello.

## Capacidades

- Sintesis de voz a partir de texto (text-to-speech) en 31 idiomas, segun la documentacion del modelo base.
- Inferencia local en CPU sin necesidad de GPU ni conexion a internet.
- Cuantizacion W8A8 estricta que reduce el uso de memoria y puede acelerar la inferencia en hardware compatible con QNN (Qualcomm).
- Disenado para integracion en dispositivos moviles y sistemas embebidos, con baja latencia.
- No incluye capacidades de vision, tool calling ni razonamiento multimodal; es exclusivamente un modelo de generacion de voz.

## Casos de uso

- Lectura de libros electronicos y pantallas: el modelo puede integrarse en aplicaciones de lectura como motor TTS offline, permitiendo escuchar libros o articulos sin conexion. Su tamano reducido (0.1 GB) y su cuantizacion W8A8 lo hacen adecuado para dispositivos con almacenamiento limitado.
- Accesibilidad para personas con discapacidad visual: al ejecutarse localmente, puede servir como motor de voz para lectores de pantalla en Android o sistemas embebidos, sin depender de servicios externos que comprometan la privacidad.
- Asistentes de voz en dispositivos IoT: gracias a su capacidad de ejecucion en CPU y a la cuantizacion para QNN, puede desplegarse en altavoces inteligentes o dispositivos de bajo consumo para generar respuestas habladas en multiples idiomas.
- Traduccion y aprendizaje de idiomas: con soporte para 31 idiomas, puede utilizarse en aplicaciones educativas para pronunciar palabras o frases en el idioma de destino, funcionando completamente en el dispositivo.
- Sistemas de navegacion y automocion: integrado en sistemas de infoentretenimiento, puede leer indicaciones de navegacion o mensajes de alerta en tiempo real sin depender de la nube, lo que reduce la latencia y mejora la fiabilidad en zonas sin cobertura.
- Prototipado de productos TTS: al ser un modelo abierto y cuantizado, los desarrolladores pueden usarlo como base para experimentar con tecnicas de cuantizacion y despliegue en hardware Qualcomm, validando metricas de calidad como las proporcionadas en el repositorio.

## Benchmarks y rendimiento

El autor proporciona metricas de validacion de calidad espectral (log-spectrum) para la version V12 del vocoder:

| Metrica | Valor |
|---|---|
| PC vocoder log-spectrum validation | 0.868538 -> 0.944505 |
| PC full-chain log-spectrum median | 0.837727 -> 0.911182 |

Estos valores indican una mejora en la calidad espectral tras el ajuste de codificacion asimetrica de activaciones. No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K, ya que no son aplicables a un modelo TTS. Tampoco se dispone de comparaciones con otros modelos de sintesis de voz en terminos de MOS (Mean Opinion Score) o latencia.

## Requisitos de hardware

- Tamano del repositorio: 0.1 GB, lo que sugiere un modelo compacto apto para dispositivos con almacenamiento reducido.
- VRAM estimada: no aplica, ya que el modelo base esta disenado para CPU; la cuantizacion W8A8 reduce aun mas el uso de memoria.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Para aprovechar la cuantizacion QNN, se necesita un dispositivo con procesador Qualcomm compatible con HTP (Hexagon Tensor Processor).
- Compatibilidad con GPU de consumo: no relevante, aunque podria ejecutarse en GPU via ONNX Runtime si se desea.
- Opciones de despliegue: ONNX Runtime, LiteRT (para Android), y potencialmente vLLM o TGI no son aplicables al ser un modelo TTS. Se recomienda usar el runtime de ONNX o el paquete LiteRT para integracion movil.
- Latencia y throughput: no se proporcionan datos numericos. El modelo base promete "lightning-fast" en CPU, y la cuantizacion W8A8 deberia mejorar el rendimiento, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Supertone/supertonic-3 (original) | 99 M | FP32 (presumiblemente) | 31 | other | ONNX |
| q3146dq4/supertonic-3-w8a8-qnn-qdq (este) | 99 M (base) | W8A8 estricto | 31 (segun base) | other | ONNX QDQ |
| Piper TTS (alternativa comun) | 20-100 M | FP32/INT8 | 20+ | MIT | ONNX |

No se dispone de datos de rendimiento comparativo entre estos modelos. La principal diferencia de esta variante es su cuantizacion estricta W8A8 orientada a QNN, que no esta presente en el modelo original ni en Piper. La licencia "other" del modelo base y de esta variante puede limitar su uso comercial, mientras que Piper es MIT.

## Limitaciones y advertencias

- Modelo experimental: el autor lo califica como "experimental" y la validacion se realizo en PC, no en hardware Qualcomm HTP real. El rendimiento en dispositivos QNN no esta garantizado.
- Licencia "other" no especificada: no se detallan los terminos de uso, lo que puede generar incertidumbre legal para uso comercial o redistribucion.
- Sin informacion sobre sesgos: al ser un modelo TTS, puede presentar sesgos en la pronunciacion de ciertos acentos o dialectos, pero no se han documentado.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero la sintesis de voz puede producir articulaciones incorrectas en nombres propios o palabras extranjeras.
- Limitaciones de contexto: al ser TTS, no maneja contexto conversacional; la entrada es texto plano y la salida es audio.
- Idiomas: aunque el modelo base soporta 31 idiomas, la model card de esta variante no confirma la cobertura completa tras la cuantizacion.
- Validacion limitada: las metricas de log-spectrum no equivalen a una evaluacion subjetiva de calidad de voz (MOS), por lo que la calidad percibida puede diferir.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/q3146dq4/supertonic-3-w8a8-qnn-qdq
- Repositorio del autor con cuantizacion previa: https://huggingface.co/q3146dq4/supertonic-3-quant
- Modelo base en HuggingFace: https://huggingface.co/Supertone/supertonic-3
- Pagina oficial de Supertonic 3: https://supertonic3.github.io/
- Repositorio GitHub de Supertone: https://github.com/supertone-inc/supertonic
- Repositorio GitHub del autor para Android LiteRT: https://github.com/q3146dq4/supertonic-liteRT-TTS
