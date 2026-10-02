# onnx-community/strands-decider-2B-hobson-v19-ONNX

## Resumen

strands-decider-2B (hobson v19) es un modelo de decision desarrollado por Strands Labs (Amazon), distribuido en su version original por el usuario StrandsAgents y convertido a ONNX por la organizacion onnx-community. No es un modelo generativo: recibe un estado (texto de contexto) y una serie de preguntas tipadas (`choice`, `score`, `noul`) y devuelve, en una sola pasada hacia delante por pregunta, una probabilidad calibrada para cada opcion. Su funcion es actuar como "System One" dentro de un flujo de agente, es decir, resolver de forma rapida si una accion propuesta debe ejecutarse o cual de varias alternativas conviene elegir.

Tecnicamente parte de Qwen3.5-2B-Base, al que se le ha fusionado un adaptador LoRA de rango 16 y se le ha anadido una cabeza pointer de aproximadamente un millon de parametros sobre los estados ocultos finales. La cabeza LM se elimina por completo: el modelo nunca lee logits de vocabulario. El repositorio que nos ocupa publica dos variantes cuantizadas en formato ONNX (1,80 GB en q8 y 1,09 GB en q4f16) pensadas para ejecutarse en el navegador con WebGPU a traves de transformers.js y de la integracion open-jev, o con ONNX Runtime en cualquier otro entorno.

Su relevancia actual es doble. Por un lado, cubre un nicho poco poblado: modelos pequenos y baratos dedicados a decisiones discretas y calibradas dentro de agentes, en lugar de generacion de texto. Por otro, su licencia Apache-2.0 y su empaquetado ONNX de bajo peso lo convierten en una pieza desplegable en cliente (navegador, portatil, CPU) sin dependencia de infraestructura de GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder Qwen3.5-2B-Base con adaptador LoRA rango 16 fusionado y cabeza pointer (aproximadamente 1 millon de parametros) sobre los estados ocultos finales; grafos ONNX con operadores fusionados `LinearAttention` / `CausalConvWithState` |
| Parametros totales | Aproximadamente 2.000 millones (modelo base) mas la cabeza pointer |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | `q8` (decoder 8 bits, bloque 32, activaciones fp16; embeddings 4 bits) y `q4f16` (decoder y embeddings 4 bits, bloque 32). El `q8` usa el kernel `MatMulNBits` con `bits=8` de ONNX Runtime, no un int8 dinamico convencional |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/model_quantized.onnx`, `onnx/model_q4f16.onnx`); ambos requieren WebGPU con `shader-f16` en navegador, aunque el proveedor CPU de ONNX Runtime tambien los ejecuta |

Temperaturas por tipo de pregunta, definidas en `config.json` y aplicadas antes del softmax: `noul` 0,911, `choice` 0,734, `score` 1,328.

## Arquitectura y entrenamiento

La conversion parte del modelo original StrandsAgents/strands-decider-2B-hobson-v19, construido sobre Qwen3.5-2B-Base en la revision concreta sobre la que se entreno el adaptador. El procedimiento de fusion sigue la formula `W + alpha/r · B·A` con `alpha/r = 2`. Los pesos resultantes se insertan en los grafos de onnx-community/Qwen3.5-2B-ONNX-OPT, que ya incorporan atencion lineal fusionada y convolucion causal con estado. El mapeo de pesos se hizo por nombre aplicando las transformaciones deducidas por valor para esos mismos grafos: transposicion, `1 + weight` para la RMSNorm centrada en cero y `-exp(A_log)`. El autor de la conversion reporta que cada peso sustituido tiene una similitud coseno igual o superior a 0,993 respecto al peso instruct que reemplaza.

La innovacion estructural clave es la eliminacion de la cabeza LM y la exposicion directa de los estados ocultos finales, que alimentan una cabeza pointer. Todo queda fusionado en un unico grafo con la firma `input_ids [B, L]`, `attention_mask [B, L]`, `answer_pos [B]`, `option_pos [B, K]` como entradas y `logits [B, K]` como salida. Esos logits son previos a temperatura: hay que dividirlos por la temperatura correspondiente al tipo de pregunta y aplicar un softmax sobre las opciones. El modelo no genera texto en ningun caso.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. La model card original remite al repositorio del proyecto para esos detalles.

## Capacidades

- Clasificacion y decision tipada: responde a preguntas de tipo `choice` (elegir entre opciones), `score` (puntuar) y `noul` (una variante adicional definida por el autor), devolviendo una probabilidad por opcion.
- Calibracion de la confianza: la probabilidad devuelta es util como medida de certeza; en el conjunto typed-decisions, las respuestas con probabilidad igual o superior a 0,9 son correctas el 94% de las veces con `q8`.
- Decision en una sola pasada: cada pregunta se resuelve con un unico forward pass, sin decodificacion autoregresiva ni generacion token a token.
- Procesamiento por lotes: las preguntas que comparten un mismo estado se ejecutan en batch.
- Ejecucion en navegador: soporta transformers.js con WebGPU (`model: "strands-decider-2b"` en la integracion open-jev) y ONNX Runtime en cualquier plataforma.
- Uso como componente de agente: encaja como paso de validacion previo a la ejecucion de una accion propuesta.
- Sin soporte de tool calling, agentes multi-paso, vision, audio ni generacion de texto: el modelo carece de cabeza LM y de cualquier modalidad adicional.

## Casos de uso

- Validacion previa de acciones en agentes: antes de que un agente ejecute una accion propuesta, el modelo recibe el estado de la conversacion o del sistema y una pregunta `choice` sobre si procede continuar; la probabilidad calibrada permite fijar un umbral de confianza en lugar de ejecutar a ciegas.
- Enrutado de herramientas y seleccion de ruta: dado un estado y las rutas disponibles, el modelo devuelve la probabilidad de cada una en una sola pasada, lo que reduce coste frente a consultar un LLM generativo para una decision binaria o de pocas opciones.
- Triaje de moderacion de contenido: con una pregunta `score` sobre un estado corto, se obtiene una puntuacion calibrada que puede usarse para priorizar revisiones humanas.
- Decision en el navegador con privacidad: al ejecutarse sobre WebGPU con un peso de 1,09 o 1,80 GB, el estado y las opciones no tienen que salir del dispositivo, lo que resulta adecuado para aplicaciones sensibles que no quieren enviar contexto a un servidor.
- Anotacion y etiquetado a escala: el modelo se uso sobre 400 estados y 5 preguntas del split de test de typed-decisions en 2,2 s de mediana por estado, un ritmo viable para preetiquetar conjuntos de datos antes de la revision humana.
- Agregacion de preferencias y encuestas: con preguntas de tipo `noul` o `score` puede puntuar alternativas y agregar las probabilidades por opcion para producir un ranking.
- Puerta de salida en pipelines de automatizacion: integrado con ONNX Runtime en un servicio de CPU, actua como filtro barato que decide si un caso necesita un modelo mayor o puede resolverse directamente.
- Extraccion de senales de confianza para human-in-the-loop: las probabilidades permiten derivar un caso a un operador cuando ninguna opcion supera el umbral definido.

## Benchmarks y rendimiento

Evaluacion sobre el split de test del conjunto typed-decisions (400 estados x 5 preguntas; respuesta principal comparada con la etiqueta del anotador). El modelo no se entreno sobre typed-decisions:

| dtype | choice | score | noul | global | Mediana por estado |
|---|---|---|---|---|---|
| `q4f16` | 334/600 | 433/800 | 401/600 | 58,4% | 2,2 s |
| `q8` | 337/600 | 458/800 | 392/600 | 59,4% | 2,2 s |

Fidelidad frente al motor de referencia upstream (`strands_decider.infer`, PyTorch, CPU fp32). Se mide la mayor diferencia en la probabilidad de cualquier opcion y cuantas veces cambia la respuesta principal:

| Runtime | 11 preguntas sobre 6 estados cortos | 40 preguntas sobre 8 estados |
|---|---|---|
| fp32 ONNX (ONNX Runtime, CPU) | 0,0009; 0 cambios | 0,0013 (10 preguntas); 0 cambios |
| `q8`, WebGPU (Chrome, M3 Pro) | 0,016; 0 cambios | 0,026; 0 cambios |
| `q4f16`, WebGPU | 0,072; 0 cambios | 0,146; 5 cambios |

Calibracion adicional reportada: con `q8`, las respuestas cuya probabilidad es igual o superior a 0,9 son correctas el 94% de las veces. La verificacion de la integracion open-jev en Node frente a la ejecucion en Python del mismo grafo dio probabilidades identicas (renderizado del prompt, tokenizacion, posiciones de opciones y temperaturas coincidentes con `prompting.py` e `infer.py`).

## Requisitos de hardware

- VRAM o memoria: 1,80 GB para el archivo `q8` y 1,09 GB para `q4f16`; ambos son pesos en disco, por lo que el consumo en ejecucion es del mismo orden mas el coste de activaciones.
- GPU integrada: funciona en Apple Silicon; el rendimiento medido es de aproximadamente 130 ms por pregunta corta en un M3 Pro (Chrome, WebGPU).
- GPU de consumo: no se especifican modelos concretos; en navegador requiere WebGPU con soporte de `shader-f16`. No se han publicado mediciones para RTX 4090, A100 o H100.
- CPU: el proveedor CPU de ONNX Runtime ejecuta ambos grafos; la verificacion de fidelidad fp32 se hizo exactamente en ese entorno.
- Despliegue: transformers.js en navegador con WebGPU, la integracion open-jev (`model: "strands-decider-2b"`) y ONNX Runtime en cualquier plataforma. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 130 ms por pregunta corta en M3 Pro y 2,2 s de mediana por estado cuando se procesan las 5 preguntas de un estado en batch. No hay datos de throughput agregado por segundo.
- Aviso de precision: si el tamano de descarga no es critico, la model card recomienda `q8` sobre `q4f16`, porque `q4f16` altera respuestas casi empatadas en estados largos.

## Comparativa con modelos similares

No se dispone de especificaciones tecnicas de alternativas directas. La prensa especializada menciona un modelo "Jev" de OpenAI y otros clones aparecidos la misma semana, pero sin parametros, contexto ni resultados publicados en la informacion disponible. La tabla recoge lo que si esta documentado:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| strands-decider-2B (esta conversion ONNX) | Aproximadamente 2.000 millones | No disponible | Decision tipada y clasificacion con probabilidad calibrada | Apache-2.0 | HuggingFace, formato ONNX con WebGPU y ONNX Runtime |
| strands-decider-2B-hobson-v19 (original) | Aproximadamente 2.000 millones | No disponible | Identica | Apache-2.0 | HuggingFace (modelo de origen, motor en PyTorch) |
| Qwen3.5-2B-Base | Aproximadamente 2.000 millones | No disponible | LLM base generativo | Apache-2.0 | HuggingFace |
| Jev (OpenAI) y clones citados en prensa | No disponible | No disponible | Decision | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo generativo: al eliminar la cabeza LM no puede producir texto, mantener conversaciones ni responder preguntas abiertas. Toda salida es un vector de probabilidades sobre opciones predefinidas.
- Rendimiento moderado fuera de su dominio: en typed-decisions, un conjunto sobre el que no fue entrenado, acierta el 59,4% con `q8`. No debe asumirse esa cifra como representativa de su tarea objetivo.
- Cuantizacion `q4f16` inestable en empates: cambia la respuesta principal en 5 de 40 preguntas sobre estados largos y eleva la desviacion hasta 0,146 frente al motor de referencia. La model card recomienda `q8` salvo que el tamano de descarga sea prioritario.
- Calibracion dependiente del umbral: la precision del 94% solo se sostiene para probabilidades iguales o superiores a 0,9 con `q8`; por debajo de ese valor no hay garantia equivalente.
- Sensibilidad a la temperatura: las probabilidades crudas son previas a temperatura y deben dividirse por el valor correspondiente al tipo de pregunta (0,911 para `noul`, 0,734 para `choice`, 1,328 para `score`) antes del softmax; omitir este paso invalida la calibracion.
- Idiomas y contexto: no se declaran idiomas soportados ni longitud de contexto en la informacion disponible, lo que impide evaluar su comportamiento multilingue o con estados muy largos.
- Dependencia de WebGPU en navegador: el uso en cliente exige WebGPU con `shader-f16`, lo que excluye navegadores y equipos sin ese soporte; la alternativa es ONNX Runtime en CPU, con la latencia que ello implique.
- Riesgo de sesgo y alucinacion: no hay informacion publicada sobre sesgos del modelo ni sobre su comportamiento ante estados ambiguos. Al no generar texto, el riesgo de alucinacion se traslada a decisiones mal calibradas (probabilidad alta sobre la opcion incorrecta).
- Licencia: Apache-2.0 tanto en esta conversion como en el modelo original y en Qwen3.5-2B-Base, por lo que no se identifican restricciones adicionales para uso comercial, aunque conviene verificar la licencia del modelo base en su repositorio.
- Escaso rodaje comunitario: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion externa es practicamente inexistente.

## Enlaces

- Modelo en HuggingFace (esta conversion): https://huggingface.co/onnx-community/strands-decider-2B-hobson-v19-ONNX
- Modelo original: https://huggingface.co/StrandsAgents/strands-decider-2B-hobson-v19
- Repositorio del proyecto strands-decider: https://github.com/strands-labs/strands-decider
- Modelo base Qwen3.5-2B-Base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Grafos ONNX de referencia: https://huggingface.co/onnx-community/Qwen3.5-2B-ONNX-OPT
- Integracion open-jev: https://github.com/nico-martin/open-jev
- Demo open-jev: https://huggingface.co/spaces/shreyask/open-jev-demo
- Conjunto de datos typed-decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Organizacion onnx-community: https://huggingface.co/onnx-community
- Open Neural Network Exchange (GitHub): https://github.com/onnx/onnx
- Open Neural Network Exchange (web): https://onnx.ai
- Cobertura de TechCrunch: https://techcrunch.com/2026/10/01/amazon-releases-its-own-jev-clone-as-decision-models-flood-the-web/
- Cobertura de VentureBeat: https://venturebeat.com/technology/amazon-unveils-a-free-fast-open-source-jev-killer-strands-decider-2b-makes-decisions-in-fractions-of-a-second
