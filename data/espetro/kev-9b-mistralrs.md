# espetro/kev-9b-mistralrs

## Resumen

Kev-9B-mistralrs es un checkpoint de exportación del modelo de decisión `jaredpalmer/kev-9b`, empaquetado por el usuario `espetro` en el formato que consume `kev-rs`, el servidor del fork `espetro/mistral.rs` basado en mistral.rs. No es un modelo generativo: recibe un documento (el estado) y un conjunto de preguntas tipadas, y devuelve en una única pasada forward una distribución de probabilidad por pregunta. Está construido sobre el modelo base `Qwen/Qwen3.5-9B-Base` (revision `68c46c4b3498877f3ef123c856ecfde50c39f404`), al que se le ha fusionado un adaptador LoRA de rango 16 con 45,4 millones de parámetros entrenables, más una cabeza de punteros independiente.

La relevancia de este repositorio es operativa más que algorítmica: traduce el formato original de PyTorch a un layout (`model/` en safetensors bf16 + `head.safetensors` + `kev.json`) que el servidor Kev carga directamente, sin pasos de conversión. El autor reporta paridad funcional con la referencia en PyTorch sobre el conjunto de desarrollo `smoke-v1` (0 de 40 cambios de argmax, diferencia máxima de probabilidad de 0,023), lo que permite sustituir el runtime de referencia por el servidor en Rust.

Se distribuye bajo licencia Apache-2.0, igual que el checkpoint origen y el modelo base, y el repositorio ocupa 17,9 GB. El modelo está pensado para servir el contrato público `/v1/systemone` de TypeSafe, por lo que su uso previsto es la toma de decisiones estructuradas en producción, no la conversación ni la generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.5-9B-Base) con adaptador LoRA fusionado (r=16) y cabeza de punteros (q, k) para decisiones |
| Parametros totales | Aproximadamente 9 000 millones en el modelo base mas 45,4 millones de parametros entrenables del LoRA, fusionados en el checkpoint exportado |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 nativo en el export; cuantizacion in-situ (ISQ) a 8 bits en carga mediante `--isq 8`; no se documentan pesos GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors: `model/` como checkpoint HuggingFace plano en bf16 con el LoRA fusionado, y `head.safetensors` con la cabeza de punteros; metadatos en `kev.json` |

## Arquitectura y entrenamiento

La arquitectura parte de `Qwen/Qwen3.5-9B-Base`, un transformer decoder de aproximadamente 9 000 millones de parametros en su version base (sin ajuste de instrucciones ni plantilla de chat publicada en la informacion disponible). Sobre ese backbone, el modelo original `jaredpalmer/kev-9b` anade un adaptador LoRA de rango 16 con 45,4 millones de parametros entrenables y una cabeza de punteros que proyecta representaciones internas hacia un espacio de decision. Esta version exportada fusiona el LoRA en bf16 dentro del checkpoint, de modo que el repositorio contiene un unico conjunto de pesos del backbone mas la cabeza separada en `head.safetensors`.

El modo de operacion es de una sola pasada forward: el modelo no genera tokens, sino que produce una distribucion de probabilidad por cada pregunta tipada del conjunto de entrada, sirviendo el contrato publico `/v1/systemone` de TypeSafe. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras alineaciones. El unico dato de validacion publicado es la paridad numerica frente a la implementacion de referencia en PyTorch sobre el conjunto `smoke-v1` (40 ejemplos de desarrollo), con 0 cambios de argmax y una diferencia maxima de probabilidad de 0,023, obtenida con `kev-rs/scripts/export_checkpoint.py --dtype bf16`.

## Capacidades

- Prediccion de decisiones estructuradas: dada una representacion del estado y un conjunto de preguntas tipadas, devuelve una distribucion de probabilidad por pregunta en una unica pasada forward.
- Procesamiento por lotes de multiples preguntas: el diseno evalua todas las preguntas del conjunto en el mismo forward pass, en lugar de una llamada por pregunta.
- Salida probabilistica calibrada de forma relativa: el modelo expone probabilidades comparables entre opciones, no texto.
- Servicio como endpoint HTTP mediante el servidor Kev, con el contrato `/v1/systemone`.
- Carga directa en el runtime en Rust con paridad demostrada frente a la referencia en PyTorch sobre `smoke-v1`.
- Cuantizacion in-situ en tiempo de carga (`--isq 8`) para reducir huella de memoria.
- No implementa generacion de texto, chat multi-turno, tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito.
- El soporte multilingue no esta documentado; el comportamiento linguistico heredado del modelo base no se detalla en la informacion disponible.

## Casos de uso

- Enrutamiento de peticiones en produccion: dado el estado de una solicitud, el modelo puntua en un solo forward pass a que ruta o politica debe ir, lo que evita multiples llamadas a un LLM generativo y reduce la latencia del pipeline de decision.
- Clasificacion de tickets con preguntas tipadas: en lugar de una etiqueta unica, se definen varias preguntas (urgencia, area, riesgo) y se obtiene una probabilidad por cada una, lo que permite umbrales independientes por dimension.
- Puerta de calidad en pipelines de generacion: colocar el modelo antes de un generador para decidir si una salida cumple criterios definidos como preguntas tipadas, aprovechando su salida probabilistica en lugar de una generacion adicional.
- Politicas de seguridad y moderacion: consultar varias preguntas sobre el mismo contenido y actuar con umbrales calibrados por riesgo, con la ventaja de que la decision se resuelve en una sola pasada.
- Sistemas de recomendacion con decisiones discretas: puntuar si un elemento debe mostrarse, ordenarse o descartarse a partir del estado del usuario y del catalogo, sirviendo la decision desde el endpoint Kev.
- Automatizacion de contratos de decision ya definidos: el modelo sirve el contrato `/v1/systemone` de TypeSafe, por lo que encaja en integraciones existentes de esa interfaz sin reescribir el cliente.
- Sustitucion del runtime de referencia en PyTorch dentro de una infraestructura Rust: al cargarse directamente en `kev-rs` con paridad verificada en `smoke-v1`, permite migrar el servicio a un binario unico sin cambiar la semantica de las decisiones.
- Despliegue en entornos con memoria limitada: la cuantizacion in-situ a 8 bits en carga permite servir el modelo en GPU de gama alta de consumo para cargas de decision de baja concurrencia.

## Benchmarks y rendimiento

| Evaluacion | Resultado | Referencia |
|---|---|---|
| Paridad de argmax en `smoke-v1` (40 ejemplos) | 0 de 40 cambios de argmax | Implementacion de referencia en PyTorch de `jaredpalmer/kev-9b` |
| Paridad de probabilidad maxima en `smoke-v1` | Diferencia maxima absoluta de 0,023 | Implementacion de referencia en PyTorch de `jaredpalmer/kev-9b` |

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). Los unicos datos numericos publicados corresponden a la verificacion de paridad numerica frente al checkpoint original.

## Requisitos de hardware

- Tamano del repositorio: 17,9 GB, coherente con un checkpoint bf16 de aproximadamente 9 000 millones de parametros mas la cabeza de punteros.
- VRAM estimada en bf16: en torno a 18-20 GB solo para pesos, mas overhead de contexto y activaciones; se recomienda un margen por encima de 20 GB.
- VRAM estimada con ISQ a 8 bits (`--isq 8`): aproximadamente 10-12 GB, segun el resto de configuracion del runtime.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 4080, RTX 3090 o RTX 4090 para ISQ a 8 bits.
- Cabe en GPU de consumo: si, en RTX 4090 con bf16 y en tarjetas de 12-16 GB con ISQ a 8 bits; por debajo de 10 GB de VRAM no hay datos publicados que confirmen un despliegue viable.
- Opciones de despliegue: servidor `kev-rs` del fork `espetro/mistral.rs` mediante `kev-rs serve --checkpoint espetro/kev-9b-mistralrs --run jaredpalmer/kev-9b`, o con cuantizacion en carga anadiendo `--isq 8`; el ecosistema mistral.rs aporta los comandos `run`, `serve` y `bench` con deteccion automatica de arquitectura y acelerador.
- Latencia y throughput: no disponibles. El diseno de una sola pasada para todo el conjunto de preguntas reduce el numero de evaluaciones frente a un esquema pregunta a pregunta, pero no se publican cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| espetro/kev-9b-mistralrs | ~9 000 M base + 45,4 M LoRA fusionado | no disponible | Distribucion de probabilidad por pregunta tipada | Apache-2.0 | HuggingFace, cargable en `kev-rs` |
| jaredpalmer/kev-9b | ~9 000 M base + 45,4 M LoRA + cabeza de punteros | no disponible | Distribucion de probabilidad por pregunta tipada | Apache-2.0 | HuggingFace, referencia en PyTorch |
| Qwen/Qwen3.5-9B-Base | ~9 000 M | no disponible | Generacion de texto (modelo base) | no disponible en la informacion proporcionada | HuggingFace |

La comparativa se limita a estos tres modelos porque no se dispone de informacion sobre alternativas equivalentes de decision estructurada con cabeza de punteros en el material consultado. La diferencia clave entre las dos primeras filas es el formato y el runtime, no la semantica del modelo.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no mantiene conversaciones y no admite tool calling ni uso como agente. Cualquier expectativa de ese tipo es un error de uso.
- Requiere un runtime especifico: la cabeza de punteros y el formato `kev.json` se cargan en el servidor Kev del fork `espetro/mistral.rs`, no en un pipeline estandar de `transformers`.
- Validacion limitada: la unica comprobacion publicada es la paridad frente a la referencia en PyTorch sobre `smoke-v1`, un conjunto de 40 ejemplos de desarrollo; no sustituye a una evaluacion de calidad de decision en dominio real.
- Sin benchmarks de calidad publicados: no hay datos de precision, recall, calibracion ni robustez frente a un modelo alternativo.
- Idiomas no documentados: se desconoce el comportamiento fuera del idioma o idiomas de entrenamiento originales, ya que el modelo base es una version base sin ajuste de instrucciones.
- Sesgos heredados: al derivar de `Qwen/Qwen3.5-9B-Base`, el modelo puede arrastrar los sesgos presentes en los datos de preentrenamiento del base; no se documenta ningun proceso de mitigacion.
- Riesgo de calibracion deficiente: la salida es una distribucion de probabilidad, pero no se publican curvas de calibracion, por lo que los umbrales deben validarse en el dominio de despliegue antes de usarse para decisiones automatizadas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, con la obligacion habitual de conservar avisos de licencia y atribucion; conviene verificar la licencia del modelo base por separado.
- Repositorio sin adopcion registrada: cero descargas y cero likes en el momento de la consulta, por lo que no existe una comunidad que haya reportado problemas de integracion.
- Fechas del repositorio: creado y actualizado el 23 de septiembre de 2026, sin historial posterior de mantenimiento en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/espetro/kev-9b-mistralrs
- Checkpoint origen: https://huggingface.co/jaredpalmer/kev-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Fork de mistral.rs usado por el exportador: https://github.com/espetro/mistral.rs
- Repositorio del proyecto Kev: https://github.com/jaredpalmer/kev
- Model card de Kev-9B en el repositorio original: https://github.com/jaredpalmer/kev/blob/main/docs/model-cards/kev-9b.md
- mistral.rs (proyecto original de EricLBuehler): https://github.com/EricLBuehler/mistral.rs
- Documentacion de mistral.rs: https://docs.mistralrs.dev/
- Guia para ejecutar modelos en mistral.rs: https://docs.mistralrs.dev/guides/models/run-any-model/
