# Dyam/sysone-laya-typed-decisions-onnx

## Resumen

`Dyam/sysone-laya-typed-decisions-onnx` es una exportación a ONNX del modelo `convaiinnovations/laya-typed-decisions`, empaquetada para el servidor Rust **sysone** (protocolo HTTP System One, sin dependencia de Python). No es un modelo nuevo: los pesos son los de Laya, sin modificar, convertidos desde safetensors (F16 en disco, reescalados a float32) a dos grafos ONNX. La autoría del modelo original corresponde a ConvAI Innovations y al equipo de Laya.

El modelo resuelve una tarea de decisión tipada sobre texto: elección (choice), puntuación (score) y sí/no (yes-no). Se apoya en un encoder **ModernBERT-large** seguido de una cabeza de decisión que produce `logits` y `act_logits`. La motivación es relevante para despliegue en producción: al no generar tokens de salida, evita el coste de decodificación autoregresiva típico de los LLM en tareas de clasificación o enrutado.

Esta ficha describe tanto el modelo base (`convaiinnovations/laya-typed-decisions`) como el artefacto ONNX aquí publicado, que se distribuye bajo Apache-2.0 con atribución al autor original. El repositorio ocupa 1.7 GB y la librería declarada es `onnx`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT-large) mas cabeza de decision tipada |
| Parametros totales | 421 millones (ModernBERT-large, segun fuente web) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Exportado en float32; el checkpoint original esta en F16 en disco (no se declaran cuantizaciones INT8/INT4) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`encoder.onnx`, `head.onnx`); checkpoint original en safetensors |
| Pipeline | text-classification |
| Tamano del repositorio | 1.7 GB |

## Arquitectura y entrenamiento

La arquitectura combina un encoder **ModernBERT-large** (aproximadamente 421 millones de parametros) con una cabeza de decisión específica. El grafo se divide en dos: `bundle/encoder.onnx`, que recibe `input_ids` y `attention_mask` y devuelve `last_hidden_state` en float32, y `bundle/head.onnx`, que recibe los estados ocultos, la máscara de atención, las posiciones y máscara de marcadores, y el tipo de pregunta, devolviendo `logits` y `act_logits`.

La tokenización, la construcción de secuencias, la calibración y la decodificación las realiza el consumidor del grafo (el servidor sysone o el `ONNXAgent` de Python de Laya). El repositorio incluye `rl_agent_config.json` con parámetros como la longitud máxima, el presupuesto de la cabeza y las temperaturas de calibración, además del tokenizador propio del checkpoint, byte a byte idéntico a la revisión original.

No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en el modelo base; la model card remite a la tarjeta original de Laya para esos datos. La exportación se realizó con torch 2.14.0 y se ejecuta con ONNX Runtime 1.28.0 (CPU, cómputo determinista). Sobre 36 peticiones de prueba, la diferencia máxima de logits frente a la referencia en PyTorch fue de 2,3e-05 y la de probabilidad de 3,8e-06, con todas las decisiones finales y salidas redondeadas idénticas.

## Capacidades

- Clasificación de texto mediante decisiones tipadas: elección (choice), puntuación (score) y sí/no (yes-no).
- Producción de logits y `act_logits` para las decisiones seleccionadas.
- Ejecución sobre ONNX Runtime, incluida CPU con cómputo determinista.
- Integración en un servidor HTTP Rust (sysone) sin necesidad de Python.
- Compatibilidad con el contrato ONNX de Laya, lo que permite su uso desde el `ONNXAgent` de Python del proyecto original.
- No se documentan capacidades de generación de texto libre, tool calling, agentes multi-paso, visión, audio ni thinking mode en la información disponible.

## Casos de uso

- Enrutado de decisiones en backend: el modelo recibe texto y devuelve una etiqueta tipada (sí/no, opción o puntuación), lo que permite clasificar solicitudes antes de derivarlas a otros servicios sin coste de decodificación.
- Moderación o filtrado binario: uso de la salida yes-no para decidir si un contenido cumple una política concreta, integrado como paso previo en un pipeline de inferencia.
- Puntuación de relevancia: la salida de tipo score permite ordenar candidatos (por ejemplo, respuestas o documentos) según una señal calibrada por el propio modelo.
- Despliegue en servicios Rust de baja latencia: al cargar los grafos ONNX desde sysone, la decisión se resuelve dentro del mismo proceso sin arrancar un runtime de Python.
- Sustitución de llamadas a LLM en tareas de clasificación: para decisiones acotadas, evita el coste de tokens de salida asociado a un modelo generativo.
- Pipeline determinista en CPU: la paridad declarada frente a PyTorch y el cómputo determinista en ONNX Runtime lo hacen apto para entornos donde se exige reproducibilidad.
- Empaquetado y distribución en instaladores: los instaladores de sysone descargan este repositorio automáticamente, por lo que puede desplegarse como dependencia de una aplicación mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica cuantitativa documentada es la fidelidad de la exportación frente a la referencia en PyTorch, que no constituye un benchmark de calidad del modelo:

| Metrica de fidelidad | Valor |
|---|---|
| Peticiones de prueba | 36 |
| Diferencia maxima de logits | 2,3e-05 |
| Diferencia de probabilidad | 3,8e-06 |
| Decisiones finales identicas | si (todas) |
| Salidas redondeadas identicas | si (todas) |

## Requisitos de hardware

- VRAM estimada: los grafos se ejecutan en float32, lo que implica del orden de 1,7 GB de pesos en memoria (coherente con el tamaño del repositorio); en F16 serían aproximadamente 0,85 GB.
- GPU recomendadas: no se especifican; por tamaño, GPU de consumo como RTX 3090, RTX 4090 o superiores son suficientes, así como A100/H100 para despliegues agregados.
- Cabe en GPU de consumo: sí, dado el tamaño de 421 millones de parámetros.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), el servidor Rust sysone y el `ONNXAgent` de Python de Laya. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dyam/sysone-laya-typed-decisions-onnx | 421 M (ModernBERT-large) | no disponible | Decision tipada (choice/score/yes-no) sobre ONNX | Apache-2.0 | HuggingFace |
| convaiinnovations/laya-typed-decisions | 421 M | no disponible | Decision tipada (modelo original en safetensors) | Apache-2.0 | HuggingFace |
| answerdotai/ModernBERT-large | no disponible | no disponible | Encoder de proposito general (clasificacion, retrieval) | Apache-2.0 | HuggingFace |

No se dispone de comparativas de rendimiento entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo: cualquier limitación del modelo base `convaiinnovations/laya-typed-decisions` se hereda en esta exportación.
- Riesgo de alucinación: no aplica en el sentido generativo (no produce texto libre), pero sí puede producir decisiones incorrectas o mal calibradas.
- Idiomas soportados: no disponibles; se desconoce la cobertura multilingüe real.
- Longitud de contexto: no disponible; los parámetros concretos están en `rl_agent_config.json`, que el consumidor debe leer.
- La tokenización, la calibración y la decodificación no están dentro de los grafos ONNX: son responsabilidad del cliente (sysone o `ONNXAgent`), por lo que un uso incorrecto puede degradar la calidad de las decisiones.
- Licencia Apache-2.0, apta para uso comercial, con obligación de atribución a ConvAI Innovations; la exportación no está afiliada ni respaldada por ConvAI Innovations ni por TypeSafe AI.
- Los grafos se exportaron y validaron con versiones concretas (torch 2.14.0, ONNX Runtime 1.28.0); otras versiones pueden alterar la paridad declarada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dyam/sysone-laya-typed-decisions-onnx
- Modelo base: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Repositorio sysone: https://github.com/inovacc/sysone
- Informe de paridad: https://github.com/inovacc/sysone/blob/main/docs/PARITY.md
- Articulo de referencia sobre Laya: https://www.orcarouter.ai/vi/blog/laya-decision-model-explained
