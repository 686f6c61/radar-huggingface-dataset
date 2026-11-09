# APLUX-Agora/opus-mt-zh-en

## Resumen

opus-mt-zh-en es un paquete de recursos de despliegue derivado de un modelo de traduccion automatica chino-ingles de la familia OPUS-MT (Helsinki-NLP), publicado por APLUX-Agora dentro de su plataforma Agora. No se trata de un modelo entrenado desde cero por este autor, sino de una conversion del modelo original a formatos ejecutables sobre aceleradores Qualcomm (QNN), empaquetados por SoC objetivo. El repositorio ocupa 0.3 GB y esta orientado a inferencia en placa, no a entrenamiento ni a uso general en servidor.

La propuesta de valor es la ejecucion completa del codificador y de un decodificador palabra a palabra sobre hardware AIoT con SoC Qualcomm QCS8550, con una latencia medida de 49.1 ms en la placa Rhino Pi X1 (犀牛派 X1) en precision FP16. El modelo realiza traduccion de chino a ingles con entradas y salidas de texto, y expone una salida adicional en JSON segun la model card.

La relevancia es acotada pero concreta: cubre el nicho de traduccion zh-en en el borde (edge), donde el despliegue en placas con NPU Qualcomm es el factor determinante. La informacion publica es muy escasa: no se detallan parametros, contexto, composicion del dataset ni resultados de benchmarks, y la licencia del paquete convertido es propia (APLUX Model Farm License), distinta de la del modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia OPUS-MT, segun el identificador del modelo); detalles no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (precision por defecto y unica documentada para QCS8550); otras precisiones no disponibles |
| Idiomas soportados | chino a ingles (traduccion zh-en); cobertura adicional no disponible |
| Licencia | APLUX Model Farm License (license_name: aplux-model-farm); licencia del modelo fuente sujeta a los terminos del modelo original |
| Formato de pesos | recursos QNN por SoC: `model.json` y binarios de contexto `model.bin` dentro de `targets/<SoC>/`; no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

El identificador del repositorio remite a la familia OPUS-MT, basada en la arquitectura transformer encoder-decoder de traduccion neuronal originalmente publicada por Helsinki-NLP. La model card confirma el modo de ejecucion: se ejecuta el codificador completo y un decodificador palabra a palabra (逐词解码器), es decir, decodificacion autorregresiva token a token sin las optimizaciones de decodificacion especulativa que si aparecen en otros despliegues.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del corpus, el uso de RLHF/DPO ni innovaciones de atencion. El trabajo de APLUX-Agora se limita a la conversion y empaquetado para Qualcomm QNN: cada directorio `targets/<SoC>/` contiene `model.json` con la precision por defecto y las rutas de variantes, y un subdirectorio por precision con binarios de contexto. El paquete incluye NOTICE.md y SHA256SUMS para verificacion de integridad.

## Capacidades

- Traduccion automatica de chino a ingles, con entrada de texto y salida de texto.
- Salida adicional en formato JSON (`out (json)`) segun la definicion de tarea de la model card.
- Ejecucion en placa sobre SoC Qualcomm QCS8550 con aceleracion QNN en FP16.
- Preprocesado y postprocesado incluidos en el flujo de despliegue de Agora (runner y proyecto exportable).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- Cobertura multilingue limitada al par zh-en segun la informacion disponible.

## Casos de uso

- Traduccion en el borde para dispositivos AIoT: el paquete esta empaquetado especificamente para QCS8550 y se ejecuta en la placa Rhino Pi X1 con 49.1 ms de latencia en FP16, lo que permite traducir zh-en localmente sin enviar texto a la nube.
- Subtitulado y localizacion de contenido chino en dispositivos: al ejecutarse en placa con decodificacion palabra a palabra, encaja en flujos de generacion incremental de subtitulos en ingles para video en tiempo casi real.
- Interfaces de usuario bilingues en kioscos y paneles industriales: la traduccion zh-en embebida permite mostrar instrucciones en ingles a operarios sin conectividad, usando el runner exportado desde Agora.
- Preprocesado de datos para pipelines de NLP: traduccion por lotes de textos chinos a ingles antes de alimentar sistemas de analisis, busqueda o clasificacion que operen solo en ingles, ejecutando el modelo en hardware de bajo consumo.
- Traduccion de correspondencia y documentacion tecnica en entornos con requisitos de privacidad: al no requerir servicio externo, el texto no sale del dispositivo, lo que resulta adecuado para entornos con datos sensibles.
- Prototipado y evaluacion de despliegues QNN: el repositorio sirve como referencia funcional para medir latencia y validar el pipeline de conversion de Model Farm antes de portar otros modelos a la misma placa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de traduccion (BLEU, COMET u otros) en la informacion disponible. El unico dato de rendimiento publicado es de latencia en hardware:

| SoC / placa | Precision | Latencia medida en Agora |
|---|---|---|
| QCS8550 · Rhino Pi X1 (犀牛派 X1) | FP16 | 49.1 ms |

No se dispone de throughput, memoria pico ni latencias para otras placas o precisiones.

## Requisitos de hardware

- VRAM: no aplica en el sentido de GPU de servidor; el modelo se ejecuta en la NPU/SoC Qualcomm QCS8550. No se publica el consumo de memoria del paquete.
- GPU recomendadas: no disponible; el despliegue documentado es exclusivamente sobre Qualcomm QCS8550.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no disponible; no se publican pesos en safetensors ni GGUF que permitan ejecucion en llama.cpp u otros runtimes de GPU.
- Opciones de despliegue: descarga de recursos por SoC mediante `hf download` con `--include "targets/$AGORA_SOC/*"`, y ejecucion con el runner de Agora o exportando un flujo de trabajo desde la plataforma.
- Latencia: 49.1 ms en QCS8550 con precision FP16 por defecto. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| APLUX-Agora/opus-mt-zh-en | no disponible | no disponible | APLUX Model Farm License | Recursos QNN para QCS8550 | Conversion para placa Qualcomm; 49.1 ms en FP16 |
| Helsinki-NLP/opus-mt-zh-en (modelo fuente presumible) | no disponible en la informacion proporcionada | no disponible | sujeta a los terminos del modelo original | Pesos originales en Hugging Face | Modelo de referencia de la familia OPUS-MT |
| Otros modelos de traduccion zh-en de la familia OPUS-MT | no disponible | no disponible | variable segun modelo | Hugging Face | No se dispone de datos comparativos verificados |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas; los valores de parametros, contexto y rendimiento de los modelos comparables no estan en la informacion proporcionada.

## Limitaciones y advertencias

- Informacion tecnica muy limitada: no se publican parametros, longitud de contexto, corpus de entrenamiento ni evaluacion de calidad de traduccion.
- La licencia del paquete convertido es la APLUX Model Farm License, distinta de la del modelo fuente; es imprescindible revisar LICENSE_MODEL_FARM.pdf y los terminos originales antes de cualquier uso comercial.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-09); no hay evidencia de validacion por parte de la comunidad.
- El despliegue documentado esta atado al SoC QCS8550 y al formato QNN; no se ofrecen pesos portables a otros runtimes, lo que limita la reutilizacion fuera de ese hardware.
- Decodificacion palabra a palabra: sin decodificacion especulativa ni estrategias de aceleracion documentadas, el coste por token puede ser superior al de alternativas optimizadas.
- Riesgo de alucinacion y errores de traduccion inherente a los sistemas de traduccion neuronal; no se han publicado metricas que permitan acotarlo.
- Cobertura idiomatica limitada al par chino-ingles; no se documenta soporte de otros idiomas ni de variantes regionales.
- No se documentan sesgos conocidos ni evaluaciones de robustez; se recomienda validacion propia antes de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/APLUX-Agora/opus-mt-zh-en
- Prueba online en Agora: https://mega.aidlux.com/models/opus-mt-zh-en
- Plataforma Agora: https://mega.aidlux.com
- Licencia del paquete: https://huggingface.co/APLUX-Agora/opus-mt-zh-en/blob/main/LICENSE_MODEL_FARM.pdf
