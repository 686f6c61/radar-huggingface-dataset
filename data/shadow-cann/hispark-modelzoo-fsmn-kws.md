# shadow-cann/hispark-modelzoo-fsmn-kws

## Resumen

FSMN-KWS es un modelo de detección de palabra de activación (keyword spotting) desarrollado por HiSilicon para su plataforma de desarrollo HiSpark, orientado a dispositivos embebidos con NPU. El modelo está diseñado para detectar la frase de activación "小云小云" (Xiaoyun Xiaoyun) en audio en chino mandarín, utilizando una arquitectura basada en CharCTC (Connectionist Temporal Classification a nivel de caracteres). Se distribuye como parte del ecosistema ModelZoo de OpenHarmony, con pesos en formato ONNX y modelos compilados OM para el SoC Hi3516CV610.

El modelo extrae características Fbank del audio, aplica reducción de frecuencia LFR (Low Frame Rate) y normalización CMVN, y realiza decodificación CTC para emitir la detección del keyword. Con solo 0,758 millones de parámetros y un coste computacional de 0,229 GFLOPs, está pensado para ejecutarse en tiempo real en hardware de bajo consumo. Su relevancia actual radica en la creciente demanda de asistentes de voz en dispositivos IoT y sistemas embebidos basados en OpenHarmony, donde se necesita un detector ligero y eficiente que funcione de forma continua sin agotar los recursos del dispositivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CharCTC (CTC a nivel de caracteres) con extraccion Fbank, LFR y CMVN |
| Parametros totales | 0,758 M |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (entrada de audio de 151x400 frames) |
| Tipos de cuantizacion | A8W8 (en los modelos OM compilados) |
| Idiomas soportados | chino (zh) |
| Licencia | no disponible (referencia a ModelScope, sin licencia explicita) |
| Formato de pesos | ONNX, OM (compilado para NPU HiSilicon) |

## Arquitectura y entrenamiento

La arquitectura se basa en CharCTC, una variante de CTC que opera a nivel de caracteres para el reconocimiento de secuencias de audio. El pipeline de procesamiento comienza con la extracción de características Fbank (filtros de banco mel), seguidas de una reducción de frecuencia LFR que agrupa frames consecutivos para reducir la tasa de muestreo temporal, y una normalización CMVN (cepstral mean and variance normalization) para robustecer el modelo frente a variaciones acústicas. Posteriormente, un decodificador CTC produce la salida de detección del keyword.

No se dispone de información detallada sobre el conjunto de datos de entrenamiento, el número de tokens o el proceso de alineación. El modelo se distribuye en dos variantes de entrada: una con dimensiones 151x400 y otra con 364 (probablemente variantes de longitud de frames). Los archivos ONNX son los modelos fuente, mientras que los archivos OM son versiones compiladas y cuantizadas A8W8 para la NPU del Hi3516CV610. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación, dado que se trata de un modelo de detección acústica, no generativo.

## Capacidades

- Detección de la palabra de activación "小云小云" en audio en chino mandarín.
- Procesamiento de audio en tiempo real con bajo coste computacional (0,229 GFLOPs).
- Entrada de características Fbank con normalización CMVN y reducción LFR.
- Salida de detección mediante decodificación CTC a nivel de caracteres.
- Modelo compilado para NPU HiSilicon (formato OM) con cuantización A8W8.
- No es un modelo generativo: no genera texto, código ni respuestas.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües más allá del chino.

## Casos de uso

- Asistentes de voz en dispositivos IoT: el modelo puede activar un asistente local cuando detecta la frase "小云小云", funcionando de forma continua con un consumo mínimo de recursos en SoCs como el Hi3516CV610.
- Control por voz en electrodomésticos inteligentes: integrado en placas HiSpark, permite encender o apagar dispositivos mediante comandos de voz sin necesidad de conexión a la nube.
- Sistemas de seguridad y domótica: detección de una palabra clave para activar grabación o alertas en cámaras y sensores con NPU integrada.
- Prototipos con OpenHarmony: desarrolladores que construyen aplicaciones para el ecosistema OpenHarmony pueden usar este modelo como componente de reconocimiento de voz de bajo nivel.
- Evaluación de pipelines de audio embebido: sirve como referencia para probar la cadena Fbank + LFR + CMVN + CTC en hardware con restricciones de memoria y cómputo.
- Investigación en keyword spotting ligero: al ser un modelo pequeño (0,758 M parámetros), es útil para estudiar técnicas de compresión y cuantización en detección de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como precisión, tasa de falsos positivos o latencia en el repositorio. El único dato de rendimiento es el coste computacional declarado: 0,229 GFLOPs.

## Requisitos de hardware

- VRAM estimada: no aplicable (modelo de inferencia en CPU/NPU, no requiere VRAM de GPU).
- GPU recomendadas: no aplicable; el modelo está diseñado para NPU HiSilicon (Hi3516CV610).
- Compatibilidad con GPU de consumo: no relevante; los pesos ONNX podrían ejecutarse en CPU o GPU genérica, pero no es el objetivo.
- Opciones de despliegue: los archivos OM están compilados para la NPU del Hi3516CV610; los archivos ONNX pueden ejecutarse con ONNX Runtime en CPU o convertirse a otros formatos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo repositorio. En el ámbito de keyword spotting existen alternativas como el modelo "Hey Snips" o "Porcupine" de Picovoice, pero no se dispone de datos de rendimiento comparables para este modelo concreto. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo solo detecta la frase específica "小云小云"; no es un reconocedor de voz general.
- Está entrenado para chino mandarín; no funcionará con otros idiomas.
- No se especifica la licencia, lo que genera incertidumbre sobre su uso comercial. La referencia a ModelScope sugiere que podría tener restricciones, pero no se confirma.
- No hay información sobre sesgos, robustez frente a ruido o variaciones de acento.
- El modelo está pensado para hardware HiSilicon específico; su uso en otras plataformas requerirá conversión y posible pérdida de rendimiento.
- No se proporcionan métricas de precisión ni tasas de error, por lo que no se puede evaluar su fiabilidad en producción.
- El repositorio es un espejo del portal de desarrolladores de HiSilicon; la autoría y el mantenimiento no están claros.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/shadow-cann/hispark-modelzoo-fsmn-kws
- Portal de HiSilicon (espejo): https://gitbubble.github.io/hisilicon-developer-portal-mirror/model-detail.html?id=knc6ud5cj400
- Repositorio upstream en GitCode: https://gitcode.com/HiSpark/modelzoo/blob/master/samples/contribute/audio/fsmn_kws/README.md
- Referencia de licencia en ModelScope: https://www.modelscope.cn/iic/speech_charctc_kws_phone-xiaoyun.git
