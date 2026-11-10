# mobilint/Qwen3-30B-A3B-Batch16-aries-rb

## Resumen

Qwen3-30B-A3B-Batch16-aries-rb es un paquete de inferencia compilado y optimizado por Mobilint para su hardware NPU ARIES, derivado del modelo Qwen/Qwen3-30B-A3B-Instruct-2507 de Alibaba Qwen. No se trata de un modelo entrenado desde cero, sino de una compilación del modelo base en formato MXQ (paquete `mxqpkg`) que se ejecuta sobre cuatro placas ARIES (`aries-rb`) distribuyendo capas compartidas y expertos en round-robin entre los dispositivos 0 a 3. El enrutamiento del Mixture-of-Experts se ejecuta en el host, no en la NPU.

El modelo base Qwen3-30B-A3B-Instruct-2507 es un transformer de tipo Mixture-of-Experts con 30 mil millones de parametros totales y aproximadamente 3 mil millones activos por token, disenado para generacion de texto, razonamiento, codigo y conversacion. Esta version compilada mantiene la licencia Apache 2.0 del modelo original y esta pensada exclusivamente para despliegue dentro del stack de aceleracion de Mobilint, lo que la hace inutilizable en GPUs convencionales.

La relevancia de esta ficha radica en que documenta un caso de compilacion para NPU de un modelo MoE de gran tamano, con soporte de BatchLLM para hasta 16 secuencias simultaneas. El repositorio tiene 17,2 GB y el archivo `model.safetensors` solo contiene el embedding de entrada en la base rotada que espera la red compilada, no los pesos completos del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer, compilado para NPU ARIES (formato MXQ) |
| Parametros totales | 30B en el modelo base; 311.164.928 en el safetensors del repo (solo embedding de entrada) |
| Parametros activos | Aproximadamente 3B por token (modelo base Qwen3-30B-A3B) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible; el paquete MXQ implica cuantizacion propia del runtime, sin detalle publicado |
| Idiomas soportados | No disponible (el modelo base Qwen3 es multilingue, pero no se detalla en esta ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | MXQ (`mxq/*.mxqpkg`) para NPU; `model.safetensors` solo para el embedding de entrada |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer con arquitectura Mixture-of-Experts: 48 MXQ compartidos (atencion, router gate, residual), 48 x 128 MXQ de expertos y un MXQ para `lm_head`. El enrutamiento MoE se ejecuta en el host, mientras que las capas compartidas y los expertos se reparten en round-robin entre las cuatro placas ARIES. El paquete sirve hasta 16 secuencias simultaneas mediante BatchLLM.

No se dispone de informacion sobre el entrenamiento del modelo base en esta ficha (numero de tokens, composicion del dataset, RLHF/DPO). El modelo base Qwen3-30B-A3B-Instruct-2507 es una version instruct de julio de 2025, pero los detalles de entrenamiento no estan incluidos en la informacion proporcionada. La innovacion tecnica destacable es la compilacion para NPU con distribucion de expertos entre dispositivos y soporte de batching, no un cambio en el entrenamiento.

## Capacidades

- Generacion de texto conversacional y de instrucciones, heredada del modelo base Qwen3-30B-A3B-Instruct-2507.
- Razonamiento y matematicas: capacidades propias del modelo base, no verificadas en esta compilacion.
- Generacion de codigo: presumiblemente soportada por el modelo base, sin datos especificos en esta ficha.
- Soporte de tool calling / function calling: no documentado en esta ficha.
- Soporte de agentes y razonamiento multi-paso: no documentado en esta ficha.
- Capacidades multilingues: el modelo base es multilingue, pero no se detalla la cobertura en esta ficha.
- Capacidad especial: BatchLLM con hasta 16 secuencias simultaneas en cuatro placas ARIES.
- No se documentan capacidades de vision ni audio.

## Casos de uso

- Despliegue en infraestructura NPU ARIES: el modelo esta disenado para ejecutarse en cuatro placas `aries-rb` con el runtime `mobilint-qb-runtime`, por lo que su uso principal es servir inferencia de Qwen3-30B-A3B en entornos con hardware Mobilint.
- Servicio de chat con batching: gracias a BatchLLM y al soporte de hasta 16 secuencias por `generate`, es adecuado para atender multiples conversaciones concurrentes en un solo paquete compilado.
- Atencion al cliente automatizada: el modelo base puede gestionar conversaciones multi-turno; la compilacion permite desplegarlo en NPU con throughput agregado por batching.
- Generacion de codigo en pipelines internos: si el modelo base conserva sus capacidades de codigo, puede integrarse en herramientas de asistencia al desarrollo dentro de infraestructura Mobilint.
- Prototipado de aplicaciones MoE en NPU: util para equipos que evaluan el rendimiento de un MoE de 30B en hardware dedicado frente a GPUs.
- Investigacion sobre compilacion de MoE: el reparto round-robin de expertos entre dispositivos sirve como referencia para estudiar estrategias de particionado de MoE en aceleradores.
- Evaluacion comparativa NPU vs GPU: permite medir latencia y throughput de Qwen3-30B-A3B en ARIES frente a despliegues con vLLM o TGI en GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware obligatorio: cuatro placas ARIES (`aries-rb`) de Mobilint, con las capas compartidas y los expertos distribuidos en round-robin entre los dispositivos 0 a 3.
- Software: `transformers-mblt >= 0.8.0` y `mobilint-qb-runtime >= 1.6.0`.
- VRAM estimada en GPU: no aplica; el modelo no esta pensado para ejecutarse en GPU convencional.
- GPU recomendadas: no disponible; el paquete MXQ requiere NPU ARIES.
- Compatibilidad con GPU de consumo: no; el formato MXQ y el runtime son especificos de Mobilint.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` sobre el stack de Mobilint; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se indica soporte de hasta 16 secuencias simultaneas por paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-30B-A3B-Batch16-aries-rb | 30B totales, ~3B activos | No disponible | Apache 2.0 | Solo NPU ARIES (4 placas) |
| Qwen/Qwen3-30B-A3B-Instruct-2507 | 30B totales, ~3B activos | No disponible en esta ficha | Apache 2.0 | GPU y otros aceleradores |
| Otras compilaciones MXQ de Mobilint | No disponible | No disponible | Apache 2.0 (heredada) | NPU ARIES |

La comparativa directa con alternativas de la misma categoria no esta disponible en la informacion proporcionada; el unico comparable claro es el modelo base sin compilar, que ofrece los mismos pesos en formato estandar y puede desplegarse en GPU.

## Limitaciones y advertencias

- Dependencia de hardware propietario: requiere cuatro placas ARIES y el runtime de Mobilint; no es portable a GPU ni a otros aceleradores.
- El safetensors del repositorio solo contiene el embedding de entrada (311 millones de parametros), no los pesos completos; no debe interpretarse como un modelo autonomo.
- El enrutamiento MoE se ejecuta en el host, lo que anade carga de CPU y puede limitar el throughput real frente a una implementacion completamente en dispositivo.
- No se documentan sesgos, riesgo de alucinacion ni limitaciones de contexto o idioma especificas de esta compilacion; deben evaluarse sobre el modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el despliegue practico esta restringido por la disponibilidad del hardware Mobilint.
- No hay datos publicados de benchmarks, latencia ni throughput; cualquier estimacion de produccion requerira medicion propia.
- El modelo fue creado en noviembre de 2026 y no registra descargas ni likes, por lo que su madurez y soporte comunitario son limitados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mobilint/Qwen3-30B-A3B-Batch16-aries-rb
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507/blob/main/LICENSE
- Web de Mobilint: https://mobilint.com
- Assets de Mobilint en GitHub: https://raw.githubusercontent.com/mobilint/.github/main/assets/Mobilint_Logo_Primary.png
