# APLUX-Agora/Qwen2.5-1.5B-Instruct

## Resumen

Qwen2.5-1.5B-Instruct es un modelo de generacion de texto de 1.500 millones de parametros, originalmente desarrollado por Alibaba Qwen, que en este repositorio distribuye APLUX-Agora como recursos de despliegue optimizados para placas con SoC Qualcomm. El repositorio no contiene los pesos originales en formato generico, sino artefactos convertidos y validados placa a placa para su ejecucion sobre el runtime QNN (Qualcomm Neural Network), orientados a escenarios AIoT y de inferencia en el borde.

La relevancia de esta publicacion radica en que traslada un modelo de lenguaje conversacional de tamano contenido a hardware embebido: la model card reporta 38,0 tokens/s con cuantizacion W4A16 sobre un SoC QCS8550 montado en la placa Rhino Pi X1. Esto lo situa en la categoria de modelos para inferencia local en dispositivos sin GPU dedicada, un nicho donde la disponibilidad de paquetes preconvertidos y medidos es escasa.

Se trata de una publicacion de distribucion, no de un entrenamiento nuevo: la arquitectura, el contexto y las capacidades corresponden al Qwen2.5-1.5B-Instruct original, mientras que el valor anadido del repositorio esta en la conversion, el empaquetado por SoC y las mediciones de rendimiento en placa real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct; no se detalla en la model card) |
| Parametros totales | 1.500 millones (segun el nombre del modelo) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | W4A16 (unica precision publicada, para QCS8550) |
| Idiomas soportados | no disponible |
| Licencia | APLUX Model Farm License para los recursos convertidos; el modelo fuente se rige por los terminos del modelo original |
| Formato de pesos | artefactos propietarios del runtime Agora/QNN: `model.json` por SoC, directorios por precision y binarios `model.bin` (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

No se aporta informacion nueva sobre arquitectura ni entrenamiento en este repositorio. El modelo subyacente es Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parametros afinado para seguir instrucciones, pero la model card de APLUX-Agora no documenta numero de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF o DPO.

La innovacion tecnica de esta publicacion es de despliegue, no de modelado: los pesos se convierten a un formato ejecutable sobre QNN con cuantizacion de pesos a 4 bits y activaciones a 16 bits (W4A16), se empaquetan por SoC en rutas `targets/<SoC>/` y se validan en placas fisicas. El repositorio incluye `model.json` con la precision por defecto y las rutas de cada variante, binarios de contexto nombrados `model.bin`, y ficheros `NOTICE.md` y `SHA256SUMS` para verificacion de integridad.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones, heredadas del Qwen2.5-1.5B-Instruct original.
- Inferencia en el dispositivo (edge) sobre SoC Qualcomm con aceleracion QNN, sin necesidad de GPU dedicada.
- Despliegue reproducible por placa: recursos preconvertidos y medidos para QCS8550 (Rhino Pi X1).
- Flujos de trabajo exportables desde la plataforma Agora, con pre y post-procesado incluidos en el paquete.
- Prueba en linea sin hardware mediante el entorno alojado de Agora.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Asistentes conversacionales en dispositivos AIoT: el modelo puede ejecutarse localmente en una placa QCS8550 con 38,0 tokens/s, lo que permite dialogos de voz o texto sin salida a la nube y con latencia controlada.
- Kioscos y terminales interactivos: al correr sobre un SoC de bajo consumo, es adecuado para terminales de atencion en comercio o industria que necesitan respuestas generativas sin conectividad permanente.
- Procesamiento de lenguaje en pasarelas Edge: integrado en un gateway con QCS8550, puede resumir, clasificar o reescribir texto de sensores y registros antes de enviarlo a un servidor central, reduciendo ancho de banda.
- Prototipado rapido en robotica y domotica: el paquete preconvertido y las mediciones en placa permiten validar una hipotesis de producto conversacional en horas en lugar de abordar una conversion manual a QNN.
- Evaluacion comparativa de hardware: las mediciones publicadas por placa sirven para dimensionar requisitos de tokens/s y precision (W4A16) antes de comprometer un diseno de producto.
- Educacion y demostraciones: el acceso en linea a traves de Agora permite mostrar un LLM ejecutandose en hardware embebido sin adquirir la placa.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Throughput en QCS8550 (Rhino Pi X1) | 38,0 tokens/s | Precision por defecto, W4A16 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de rendimiento es el throughput medido en placa por Agora.

## Requisitos de hardware

- VRAM: no aplica en el sentido convencional; el modelo se ejecuta sobre la memoria del SoC Qualcomm, no sobre VRAM de GPU. No se especifica el consumo de memoria en la model card.
- GPU recomendadas: no disponible; el paquete esta orientado a NPU/SoC Qualcomm (QNN), no a GPU NVIDIA o AMD.
- Hardware validado: SoC QCS8550 en placa Rhino Pi X1 (犀牛派 X1), con 38,0 tokens/s en W4A16.
- Cabe en hardware de consumo: si, en el sentido de placas embebidas de gama AIoT; no se documenta soporte para GPU de consumo.
- Opciones de despliegue: runtime Agora con backend QNN, descarga via `hf download` filtrando por `targets/<SoC>/*`, y exportacion de flujos de trabajo desde la plataforma Agora. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 38,0 tokens/s medidos en QCS8550; no se publican cifras de latencia por token ni de tiempo a primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato de despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| APLUX-Agora/Qwen2.5-1.5B-Instruct | 1.500 M | no disponible | Artefactos QNN/Agora por SoC | APLUX Model Farm License (recursos) | Hugging Face, 0 descargas |
| Qwen2.5-1.5B-Instruct (original) | 1.500 M | no disponible en esta ficha | safetensors, GGUF via terceros | terminos del modelo original | Ampliamente disponible |
| Otros modelos de ~1,5 B para edge | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con alternativas de la misma categoria no esta soportada por datos en la informacion proporcionada; solo se puede contrastar con el modelo fuente original, del que este repositorio es una conversion.

## Limitaciones y advertencias

- El repositorio no contiene pesos en formatos estandar (safetensors, GGUF); solo sirve para el runtime Agora/QNN y SoC Qualcomm soportados, lo que limita su reutilizacion fuera de ese ecosistema.
- Solo se publica una combinacion hardware-precision validada (QCS8550, W4A16); no hay datos para otros SoC ni para otras precisiones.
- La licencia de los recursos convertidos es la APLUX Model Farm License, distinta de la del modelo fuente; es imprescindible revisar ambos terminos antes de un uso comercial.
- La cuantizacion W4A16 puede degradar la calidad respecto al modelo original en tareas sensibles; no se publican evaluaciones de calidad que lo cuantifiquen.
- No se documentan idiomas soportados ni longitud de contexto en esta publicacion; deben consultarse en la model card del Qwen2.5-1.5B-Instruct original.
- Riesgo de alucinacion y sesgos: inherentes al modelo base de 1,5 B; no se aportan evaluaciones de seguridad ni de sesgo en este repositorio.
- El repositorio registra 0 descargas y 0 likes, sin historial de uso comunitario que permita validar la reproducibilidad de las conversiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/APLUX-Agora/Qwen2.5-1.5B-Instruct
- Prueba en linea en Agora: https://mega.aidlux.com/models/qwen2.5-1.5b-instruct
- Plataforma Agora: https://mega.aidlux.com
- Licencia APLUX Model Farm: https://huggingface.co/APLUX-Agora/Qwen2.5-1.5B-Instruct/blob/main/LICENSE_MODEL_FARM.pdf
