# Phoonnx/vits-en_us-mikev3-espeak

## Resumen

`vits-en_us-mikev3-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su librería ONNX homónima. El modelo original procede de Da-Bob/piper-mikev3 y ha sido adaptado para consumir fonemas espeak en alfabeto IPA como entrada de texto, lo que lo integra en el ecosistema de normalización y fonemización de scriptconv.

Se trata de un modelo ligero (repositorio de aproximadamente 0,1 GB) orientado a síntesis de voz en inglés estadounidense (`en-US`), distribuido en formato ONNX para inferencia eficiente en CPU y GPU. Su relevancia radica en su integración con el stack de OVOS (Open Voice OS) y con la cadena de herramientas de TigreGotico (phoonnx, scriptconv, phoonnx.js), lo que facilita su despliegue tanto en Python como en navegador.

No se dispone de información sobre el número de parámetros, la longitud de contexto (no aplica en TTS) ni los datos exactos de entrenamiento. La ficha se limita a los datos verificables de la model card y los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas espeak en alfabeto IPA |
| Tamano del repositorio | ~0,1 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo condicional que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial multiperiodo para el entrenamiento. VITS produce audio de forma end-to-end a partir de fonemas, sin necesidad de un vocoder externo.

El modelo deriva de Da-Bob/piper-mikev3, un modelo del ecosistema Piper adaptado por Da-Bob. La model card no proporciona detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en TTS). La innovación destacable es el empaquetado para phoonnx, que permite ejecutar el modelo en ONNX con entrada de fonemas espeak-ng y un front-end de normalización de texto gestionado por scriptconv.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés estadounidense (`en-US`).
- Entrada basada en fonemas espeak en alfabeto IPA, lo que permite control fino de la pronunciación.
- Integración con el front-end de normalización de texto de scriptconv (conversión de texto a fonemas mediante `EspeakPhonemizer`).
- Ejecución en Python mediante la librería phoonnx y en OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante phoonnx.js (con entrada espeak o unicode).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- Capacidad multilingüe limitada al inglés (`en`), según los metadatos.
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- Asistentes de voz en OVOS: el modelo se integra como plugin TTS (`ovos-tts-plugin-phoonnx`) y permite dotar de voz a asistentes domésticos open source con una configuración mínima en `mycroft.conf`.
- Síntesis de voz en aplicaciones Python: mediante `TTSModelManager` de phoonnx, se puede generar audio WAV a partir de texto en pipelines de accesibilidad o lectura de contenido.
- Síntesis en navegador: con phoonnx.js se puede ofrecer TTS del lado del cliente en aplicaciones web, sin depender de servicios en la nube, usando el demo de tigregotico.pt.
- Generación de audiolibros o locuciones: al aceptar fonemas IPA, permite ajustar la pronunciación de términos técnicos o nombres propios antes de la síntesis.
- Prototipado de interfaces conversacionales: su tamaño reducido (~0,1 GB) y formato ONNX facilitan el despliegue en entornos con recursos limitados para pruebas de concepto de voz.
- Sistemas de anuncios o notificaciones por voz: integrable en scripts de automatización que generan avisos hablados en inglés estadounidense con baja latencia esperada por el tamaño del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; por el tamaño del repositorio (~0,1 GB) se espera que la inferencia quepa en CPU y en GPUs de gama baja, aunque no se confirma en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probable por el tamaño, pero no confirmado en la documentación.
- Opciones de despliegue: phoonnx (Python), `ovos-tts-plugin-phoonnx` (OVOS), phoonnx.js (navegador). Requiere espeak-ng instalado o el extra `phoonnx[espeak]` (espyak).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto | Notas |
|---|---|---|---|---|---|---|
| vits-en_us-mikev3-espeak | VITS | en-US | ONNX | apache-2.0 | no aplica | Empaquetado phoonnx, entrada espeak IPA |
| Da-Bob/piper-mikev3 | VITS (Piper) | en-US | no disponible | apache-2.0 | no aplica | Modelo upstream del que deriva |
| Otros modelos de la colección VITS de Phoonnx | VITS | variable | ONNX | variable | no aplica | Misma librería y pipeline de empaquetado |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés estadounidense (`en-US`); no es multilingüe.
- La entrada debe ser fonemas espeak en IPA; sin espeak-ng instalado, el extra `espyak` puede producir pronunciaciones incorrectas en algunas palabras, según advierte la model card.
- No es un modelo de lenguaje: no genera texto, no razona ni soporta tool calling.
- Riesgo de alucinación no aplica en el sentido de LLM, pero puede producir pronunciaciones erróneas ante fonemas mal formados o texto no normalizado correctamente.
- No se documentan sesgos específicos del hablante ni del dataset de entrenamiento.
- Licencia apache-2.0 declarada por el upstream (Da-Bob/piper-mikev3); se recomienda verificar los términos del modelo original antes de uso comercial.
- No se publican métricas de calidad (MOS, WER) ni benchmarks objetivos.
- El número de descargas (20) y likes (0) es muy bajo, lo que sugiere poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-mikev3-espeak
- Modelo upstream: https://huggingface.co/Da-Bob/piper-mikev3
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
