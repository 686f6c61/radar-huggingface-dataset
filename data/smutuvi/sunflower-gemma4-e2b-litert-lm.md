# smutuvi/Sunflower-Gemma4-E2B-litert-lm

## Resumen

Sunflower-Gemma4-E2B-litert-lm es una conversión del modelo Sunbird/Sunflower-Gemma4-E2B al formato LiteRT-LM, el framework de Google para ejecución de modelos de lenguaje en dispositivos edge (móviles, wearables, etc.). El modelo original es una adaptación multimodal de Gemma 4 E2B IT, optimizada para comprender texto y habla en 69 lenguas africanas, con soporte de entrada de texto, imagen y audio (hasta 30 segundos de audio a 16 kHz) y generación de texto. Sin embargo, esta conversión concreta elimina el encoder de audio y se limita exclusivamente a chat de texto, como indica su model card: "Text chat only. This bundle does not include the Gemma 4 audio encoder."

La relevancia de este modelo radica en su formato LiteRT-LM, que permite desplegar modelos de lenguaje en dispositivos con recursos limitados, como teléfonos Android o Chromebooks, sin necesidad de conexión a la nube. Al estar basado en Gemma 4 E2B, un modelo de tamaño reducido diseñado para edge, esta conversión hereda las capacidades de razonamiento y seguimiento de instrucciones del modelo base, aunque limitadas al dominio textual. El autor, smutuvi, ha publicado también otros modelos similares en el mismo formato, lo que sugiere un interés en democratizar el acceso a modelos multilingües africanos en entornos on-device.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Gemma 4 E2B, transformer multimodal, pero esta conversion solo incluye el modulo de texto) |
| Parametros totales | no disponible (el modelo base Sunbird/Sunflower-Gemma4-E2B no especifica el numero exacto; se infiere que es un modelo E2B, probablemente ~2B, pero no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el formato LiteRT-LM suele incluir cuantizacion, pero no se especifica) |
| Idiomas soportados | no disponible (el modelo base soporta 69 lenguas africanas, pero esta conversion no declara idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | .litertlm (LiteRT-LM) |

## Arquitectura y entrenamiento

No se dispone de detalles tecnicos sobre la arquitectura interna de esta conversion. El modelo base, Sunbird/Sunflower-Gemma4-E2B, es una adaptacion de Gemma 4 E2B IT, un modelo multimodal de Google que combina un transformer con encoders de vision y audio. El proceso de conversion con `litert-torch export_hf` genera un bundle LiteRT-LM que, en este caso, excluye el encoder de audio, quedando unicamente el componente de texto. No se han publicado datos sobre el entrenamiento, el dataset utilizado ni el proceso de fine-tuning del modelo original en la informacion disponible.

## Capacidades

- Generacion de texto y chat multi-turno: el modelo puede mantener conversaciones de texto, siguiendo instrucciones y generando respuestas coherentes.
- Razonamiento basico: al ser una adaptacion de Gemma 4 E2B IT, conserva capacidades de razonamiento y comprension de lenguaje, aunque limitadas al ambito textual.
- Soporte multilingue potencial: el modelo base fue optimizado para 69 lenguas africanas, pero esta conversion no declara explicitamente que conserve todas esas lenguas; se asume que al menos mantiene las capacidades de texto del modelo original.
- No incluye capacidades de audio ni vision: la model card indica explicitamente que es solo chat de texto, por lo que no puede procesar entradas de audio o imagen.
- Compatibilidad con LiteRT-LM: el formato permite ejecucion en dispositivos edge mediante el runtime de LiteRT-LM, integrable en aplicaciones Android, ChromeOS y otros entornos compatibles.

## Casos de uso

- Asistente de chat en dispositivos moviles: al estar en formato LiteRT-LM, puede integrarse en aplicaciones Android para ofrecer un asistente conversacional offline, sin depender de servidores externos. Es adecuado para entornos con conectividad limitada.
- Atencion al cliente en lenguas africanas: si el modelo conserva las capacidades multilingues del base, podria desplegarse en kioscos o aplicaciones de soporte para responder consultas en swahili, yoruba, hausa, etc., aunque se debe verificar la cobertura real de idiomas.
- Educacion y alfabetizacion digital: un chatbot de texto en dispositivos de bajo coste puede servir como herramienta de aprendizaje de idiomas o de consulta de informacion en regiones con acceso limitado a internet.
- Prototipado rapido de aplicaciones edge: desarrolladores que quieran experimentar con Gemma 4 en formato LiteRT-LM pueden usar este modelo como punto de partida para pruebas de concepto en dispositivos locales.
- Traduccion de texto entre lenguas africanas y otras lenguas: el modelo base fue afinado para traduccion de texto, por lo que esta conversion podria emplearse para traduccion offline en apps de mensajeria o documentacion.
- Automatizacion de tareas de texto en entornos sin GPU: al ser un modelo pequeno y optimizado para edge, puede ejecutarse en CPUs de moviles o Raspberry Pi, permitiendo procesamiento de lenguaje natural en hardware de bajo consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo o su base.

## Requisitos de hardware

- Al ser un modelo LiteRT-LM, esta disenado para ejecutarse en dispositivos edge: telefonos Android, Chromebooks, wearables y otros dispositivos con Android Neural Networks API (NNAPI) o el runtime LiteRT-LM.
- No se especifican requisitos de VRAM, ya que no esta pensado para GPU de servidor. Se espera que quepa en la memoria de un dispositivo movil moderno (tipicamente menos de 2 GB de RAM).
- Opciones de despliegue: integracion mediante el SDK de LiteRT-LM (disponible en GitHub), o mediante la app Google AI Edge Gallery para pruebas en dispositivo.
- No se dispone de datos de latencia o throughput. Al ser un modelo E2B, se espera una latencia de unos pocos cientos de milisegundos por token en hardware movil, pero no hay cifras confirmadas.

## Comparativa con modelos similares

| Modelo | Formato | Parametros | Contexto | Idiomas | Licencia |
|---|---|---|---|---|---|
| smutuvi/Sunflower-Gemma4-E2B-litert-lm | LiteRT-LM | no disponible | no disponible | no disponible (base: 69 lenguas africanas) | Apache 2.0 |
| Sunbird/Sunflower-Gemma4-E2B | Safetensors (original) | no disponible | no disponible | 69 lenguas africanas | Apache 2.0 |
| smutuvi/gemma-4-e2b-sw-asr-ndizi-litert-lm-slim | LiteRT-LM | no disponible | no disponible | no disponible (probablemente swahili) | Apache 2.0 |

No se dispone de datos de rendimiento comparativo. La principal diferencia entre esta conversion y el modelo original es la eliminacion del encoder de audio y el cambio de formato a LiteRT-LM, que facilita el despliegue en dispositivos edge.

## Limitaciones y advertencias

- Solo texto: no incluye el encoder de audio de Gemma 4, por lo que no puede procesar entradas de voz ni audio, a diferencia del modelo base.
- Idiomas no confirmados: aunque el modelo base soporta 69 lenguas africanas, esta conversion no declara explicitamente que conserve todas ellas. Es necesario probar el modelo para verificar la cobertura real.
- Sin informacion sobre cuantizacion: no se especifica si el bundle LiteRT-LM esta cuantizado (p. ej., int8 o int4), lo que puede afectar al rendimiento y a la precision.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar respuestas incorrectas o inventadas, especialmente en dominios especializados.
- Sesgos potenciales: al estar afinado para lenguas africanas, puede presentar sesgos culturales o linguisticos propios de los datos de entrenamiento del modelo base, aunque no se dispone de estudios al respecto.
- Restricciones de uso comercial: la licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos de la licencia del modelo base (Gemma 4) por si hubiera restricciones adicionales.
- Sin soporte de vision: aunque el modelo base es multimodal, esta conversion no incluye el encoder de imagen, por lo que no puede procesar entradas visuales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/smutuvi/Sunflower-Gemma4-E2B-litert-lm
- Modelo base (Sunbird/Sunflower-Gemma4-E2B): https://huggingface.co/Sunbird/Sunflower-Gemma4-E2B
- Documentacion de SALT (Sunbird): https://salt.sunbird.ai/models/sunflower-gemma4-e2b/
- Repositorio de LiteRT-LM (Google AI Edge): https://github.com/google-ai-edge/LiteRT-LM
- Documentacion de Gemma 4 en LiteRT-LM (Google Developers): https://developers.google.com/edge/litert-lm/models/gemma-4.md.txt
- Modelo similar del mismo autor: https://huggingface.co/smutuvi/gemma-4-e2b-sw-asr-ndizi-litert-lm-slim
