# Mer0vin8ian/LFM2-1.2B-Hi-Fi-fraQtl

## Resumen

LFM2-1.2B Hi-Fi (fraQtl) es una cuantizacion calibrada en formato GGUF del modelo LiquidAI/LFM2-1.2B, un transformer denso de 1.170.340.608 parametros desarrollado originalmente por Liquid AI. El trabajo lo firma el contribuidor independiente fraQtl (repositorio espejo bajo el usuario Mer0vin8ian) y su proposito no es crear un modelo nuevo, sino demostrar que una calibracion especifica aplicada sobre formatos de bloque legales para NPU (Q4_0 e IQ4_NL, bloque de 32) reduce la divergencia respecto al profesor Q8_0 en comparacion con los GGUF que LiquidAI distribuye oficialmente.

La relevancia actual del artefacto es de ingenieria de cuantizacion, no de modelado: se trata de una de las pocas publicaciones que aporta "receipts" verificables (hashes del profesor, JSON de divergencia por brazo, puntuaciones GSM8K selladas antes de la evaluacion y un veredicto de kill-gate) para una compresion de 4 bits orientada a ejecucion en NPU de dispositivos edge. El modelo base LFM2-1.2B esta disenado por Liquid AI para inferencia on-device, y esta variante anade builds que caben en el limite de 2 GiB por grafo de QNN en un Snapdragon 8 Elite Gen 6.

El resultado principal es que el brazo `iq4_nl_cal` alcanza una divergencia de 0,10837 y un top-1 de 82,17% frente al profesor Q8_0, frente a 0,162709 y 78,22% del Q4_0 oficial de LiquidAI, con practicamente el mismo tamano en bytes (695.752.672 frente a ~695,8 M). La receta del corpus de calibracion no se publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Lfm2ForCausalLM, modelo base LiquidAI/LFM2-1.2B) |
| Parametros totales | 1.170.340.608 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | IQ4_NL + calibracion fraQtl; Q4_0 + calibracion fraQtl; Q4_0 sin calibracion (control); Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (llama.cpp); safetensors para el modelo base |
| Tamano del repo | 2,8 GB |
| Bloques de cuantizacion | 32 (formatos legales para NPU: Q4_0 / IQ4_NL) |
| Revision del modelo base | `40f3da0d` |
| Version minima de llama.cpp | b11514 (soporte `Lfm2ForCausalLM`) |

## Arquitectura y entrenamiento

El modelo subyacente es LFM2-1.2B de Liquid AI, un transformer denso de 1,17 mil millones de parametros orientado a inferencia en dispositivo. Esta publicacion no entrena ni afina el modelo: parte de la revision `40f3da0d` del checkpoint bf16 y genera cuatro builds GGUF de 4 bits. Dos de ellos usan formatos de bloque legales para NPU (Q4_0 e IQ4_NL con bloque de 32), uno es un control Q4_0 sin calibracion y el ultimo es un Q4_K_M convencional.

La innovacion tecnica es la calibracion fraQtl aplicada antes del redondeo a 4 bits. El autor reporta que el control sin calibrar reproduce el Q4_0 distribuido por LiquidAI hasta el quinto decimal (divergencia 0,16271 frente a 0,162709; top-1 78,22% en ambos), lo que acredita que la mejora procede de la calibracion y no de diferencias en el pipeline de conversion. Comparado con el mismo formato Q4_0, la calibracion reduce la divergencia un 12,96% a cambio de un 0,30% mas de bytes. El cambio a IQ4_NL calibrado reduce la divergencia un 33,40% frente al Q4_0 sin calibrar de igual tamano y un 1,86% frente al Q4_K_M de LiquidAI con un 4,81% menos de bytes. En el brazo Q4_K_M propio, en cambio, la calibracion no supera al build del vendor: 0,11104 frente a 0,11042 (+0,57%). El autor declara explicitamente que no hay politica de asignacion por tensor en LFM2 y que el corpus de calibracion no se publica.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base LFM2-1.2B.
- Razonamiento aritmetico basico: en el cribado GSM8K con n=100 y puntuaciones selladas antes de evaluar, el brazo `fraqtl_q4km` obtiene 59%, el Q4_0 de LiquidAI 58% y el Q4_K_M de LiquidAI 59%.
- Ejecucion en NPU: cada brazo se compila y ejecuta como build QNN en dos partes, cada una por debajo del limite de 2 GiB por grafo del dispositivo; un forward estatico de 7 tokens tarda aproximadamente 29,5 ms sumando ambas partes en un Snapdragon 8 Elite Gen 6.
- Inferencia via llama.cpp en CPU y en dispositivos edge.
- Tool calling, function calling, modo thinking, vision y audio: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el autor no documenta la cobertura de idiomas.

## Casos de uso

- Despliegue en NPU de movil: el brazo `npu/iq4_nl_cal.gguf` esta pensado para compilarse como grafo QNN en dos partes y ejecutarse en el NPU de un Snapdragon 8 Elite Gen 6, con un forward de 7 tokens en torno a 29,5 ms. Es el escenario principal del artefacto.
- Asistentes conversacionales on-device sin conexion: el modelo base esta orientado a inferencia local y el build de 695 MB permite mantener el modelo en memoria del dispositivo para tareas de chat de baja latencia.
- Investigacion en cuantizacion: sirve como referencia reproducible para comparar calibracion frente a no calibracion en formatos legales para NPU, ya que incluye control, hashes del profesor y JSON de divergencia por brazo.
- Validacion de pipelines de conversion GGUF: el control `q4_0_plain` reproduce el Q4_0 del vendor hasta el quinto decimal, por lo que puede usarse como test de regresion de un pipeline de cuantizacion propio.
- Prototipado de aplicaciones edge con llama.cpp: el build `fraqtl_q4km.gguf` de 730.896.096 bytes funciona como brazo de envio sin asignacion de memoria personalizada, util para entornos donde no se requiere el formato NPU.
- Clasificacion y extraccion de texto en dispositivos con recursos limitados: con 1,17B parametros y pesos de ~700 MB, el modelo cabe en telefonos y SBC para tareas de etiquetado o resumen corto, siempre que se acepte la perdida de fidelidad de 4 bits.

## Benchmarks y rendimiento

Fidelidad al profesor Q8_0 (divergencia simetrica de soporte restringido sobre top-20 logits en logaritmo natural, 43.200 posiciones retenidas de wikitext-2 test, SQuAD validation y UltraChat test, disjuntas de la calibracion):

| Brazo | Bytes | Divergencia (menor mejor) | Top-1 (mayor mejor) | SQNR (dB) |
|---|---|---|---|---|
| LiquidAI Q4_0 (vendor) | ≈695,8 M | 0,162709 | 78,22% | 10,88 |
| q4_0_plain (control) | 695.752.416 | 0,16271 | 78,22% | 10,88 |
| q4_0_cal | 697.849.824 | 0,14163 | 79,59% | 11,49 |
| iq4_nl_cal | 695.752.672 | 0,10837 | 82,17% | 12,65 |
| fraqtl_q4km | 730.896.096 | 0,11104 | no disponible | no disponible |
| LiquidAI Q4_K_M | no disponible | 0,11042 | no disponible | no disponible |

Cribado de tarea (GSM8K, n=100, sellado antes de puntuar):

| Brazo | Precision |
|---|---|
| fraqtl_q4km | 59% |
| LiquidAI Q4_0 | 58% |
| LiquidAI Q4_K_M | 59% |

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB para los brazos de 4 bits (695-731 MB de pesos) mas overhead de contexto y KV cache; no se especifica el consumo exacto.
- GPU recomendadas: no disponible; el artefacto esta orientado a NPU y CPU via llama.cpp, no a GPU de datacenter.
- Cabe en GPU consumer: si, por tamano de pesos (menos de 1 GB en 4 bits), aunque no se documenta rendimiento en GPU.
- NPU: verificado en Snapdragon 8 Elite Gen 6 como build QNN en dos partes, cada una bajo el limite de 2 GiB por grafo; forward estatico de 7 tokens de aproximadamente 29,5 ms sumando ambas partes.
- Opciones de despliegue: llama.cpp (version minima b11514, con soporte `Lfm2ForCausalLM`), backend QNN para NPU. vLLM, TGI, Ollama y otros no estan documentados en la informacion disponible.
- Throughput en tok/s: no disponible; el autor advierte que la medicion de 29,5 ms certifica ejecucion y fidelidad de valores, no es una cifra de tok/s cuantizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Divergencia vs Q8_0 | Top-1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LFM2-1.2B Hi-Fi `iq4_nl_cal` | 1,17 B | no disponible | 0,10837 | 82,17% | lfm1.0 | Hugging Face (fraQtl / Mer0vin8ian) |
| LiquidAI LFM2-1.2B Q4_0 | 1,17 B | no disponible | 0,162709 | 78,22% | lfm1.0 | Hugging Face (LiquidAI) |
| LiquidAI LFM2-1.2B Q4_K_M | 1,17 B | no disponible | 0,11042 | no disponible | lfm1.0 | Hugging Face (LiquidAI) |
| LFM2-1.2B Hi-Fi `fraqtl_q4km` | 1,17 B | no disponible | 0,11104 | no disponible | lfm1.0 | Hugging Face (fraQtl / Mer0vin8ian) |

No se dispone de datos para comparar con modelos de otros fabricantes de tamano similar (por ejemplo, variantes de 1-1,5B de otras familias) en la informacion proporcionada.

## Limitaciones y advertencias

- La receta del corpus de calibracion no se publica, por lo que los resultados no son reproducibles sin acceso a dicho corpus.
- El autor declara que no es un resultado de asignacion por tensor ni de metodo de redondeo: no hay politica de asignacion por tensor en LFM2, y la mejora procede exclusivamente de la calibracion y del formato legal para NPU.
- En Q4_K_M la calibracion no supera al build de LiquidAI (0,11104 frente a 0,11042), por lo que la ventaja no es universal entre formatos.
- La licencia lfm1.0 (etiquetada como "other") impone restricciones que deben revisarse antes de uso comercial; el enlace a la licencia esta en el repositorio del modelo base.
- La medicion en NPU es un forward estatico de 7 tokens y no una cifra de throughput; no debe interpretarse como rendimiento sostenido en generacion.
- No hay datos publicados sobre sesgos, tasas de alucinacion ni cobertura de idiomas del modelo base en esta ficha.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor figura como contribuidor independiente; no es una publicacion oficial de Liquid AI.
- El contexto maximo no esta documentado en la informacion disponible, lo que limita la planificacion de aplicaciones con ventanas largas.
- El cribado GSM8K usa solo n=100, por lo que las diferencias de 1 punto porcentual entre brazos estan dentro del ruido estadistico esperable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Mer0vin8ian/LFM2-1.2B-Hi-Fi-fraQtl
- Repositorio canonico del autor: https://huggingface.co/fraQtl/LFM2-1.2B-Hi-Fi-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2-1.2B
- Licencia lfm1.0: https://huggingface.co/LiquidAI/LFM2-1.2B/blob/main/LICENSE
