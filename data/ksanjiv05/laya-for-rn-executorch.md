# ksanjiv05/laya-for-rn-executorch

## Resumen

Laya for RN ExecuTorch es un paquete de exportaciones a ExecuTorch del checkpoint `typed-decisions` del modelo convaiinnovations/laya, preparado para ejecutarse en dispositivo (on-device) mediante el backend XNNPACK. Lo publica el usuario ksanjiv05 y su objetivo es permitir que aplicaciones moviles, en particular proyectos de React Native a traves de `react-native-executorch`, tomen decisiones estructuradas sin enviar datos a un servidor.

El modelo no es generativo: es un modelo de decision de tipo System-1. Recibe un estado (JSON o texto) y una pregunta tipada (`choice`, `score` o `noul`) y devuelve una respuesta calibrada en un unico forward pass. La arquitectura combina un encoder ModernBERT-large con una cabeza de decision propia desarrollada desde cero por el autor del modelo base, y el grafo se exporta con formas estaticas optimizadas para movil.

Su relevancia ahora es practica: ofrece inferencia local con cuantizacion int8 weight-only en un paquete de 603 MB, con variantes para CPU (XNNPACK) y GPU Android (Vulkan), y con un contrato de runtime documentado. La contrapartida es su ventana fija de 192 tokens y la ausencia de benchmarks publicos en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer ModernBERT-large mas cabeza de decision propia (modelo de decision, no generativo) |
| Parametros totales | no disponible; el `.pte` fp32 ocupa 1,69 GB, lo que situa el orden de magnitud en torno a 4,2 x 10^8 parametros en fp32 (estimacion a partir del tamano de los pesos, no confirmada por el autor) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 192 tokens con formas estaticas (`input_ids` `[1, 192]`); no es ampliable en tiempo de ejecucion |
| Tipos de cuantizacion | int8 weight-only (`torchao Int8WeightOnlyConfig`) y fp32; en XNNPACK (CPU) y Vulkan (GPU Android) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0, heredada de `convaiinnovations/laya` |
| Formato de pesos | `.pte` (ExecuTorch), acompanado de `*.meta.json` (contrato de runtime) y `laya_testcases.json` |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo base es el checkpoint `typed-decisions` de `convaiinnovations/laya`, formado por un encoder ModernBERT-large y una cabeza de decision construida desde cero. El modelo no decodifica texto: produce logits por opcion. El grafo exportado declara cinco entradas en orden (`input_ids`, `attention_mask`, `marker_pos`, `marker_mask`, `qtype`) y dos salidas (`logits [1, 12]` con la puntuacion de cada opcion y `act_logits [1, 2]` como cabeza auxiliar de escalado/respuesta). `marker_pos` contiene el indice de token de los marcadores `[MASK]` de cada opcion y `marker_mask` indica cuales de las 12 ranuras son reales; `qtype` vale 0 para `choice`, 1 para `score` y 2 para `noul`.

El postprocesado, descrito en `rl_agent_api.py` del repositorio base, consiste en dividir los `k` logits por la temperatura correspondiente al par (qtype, k) definido en el `.meta.json`, aplicar softmax y despues interpretar segun el tipo de pregunta: `choice` toma el argmax, `score` calcula la suma de `i·p_i` y `noul` devuelve `p[1]` como probabilidad de verdadero. La construccion de la entrada replica `build_sequence`: `[CLS] "<type> question: <instructions>" [SEP] [MASK] opt0 [MASK] opt1 … [SEP] <state> [SEP]`, con el tokenizer ModernBERT del repositorio base (CLS=50281, SEP=50282, MASK=50284, PAD=50283).

La exportacion se realiza con `torch.export` seguido de lowering a XNNPACK y empaquetado en `.pte`, usando `torchao Int8WeightOnlyConfig` para la variante int8, con `torch>=2.11` y `executorch>=1.5`. No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Decision con opciones cerradas: dado un estado y una pregunta de tipo `choice`, selecciona una opcion entre un maximo de 12 candidatos mediante argmax sobre los logits.
- Puntuacion calibrada: con `score` devuelve un valor esperado calculado como suma ponderada de las probabilidades de las opciones.
- Estimacion de verosimilitud: con `noul` devuelve la probabilidad de que una afirmacion sea verdadera (`p[1]`).
- Cabeza auxiliar de escalado: `act_logits` `[1, 2]` permite decidir entre responder o escalar la decision (patron escalate/answer).
- Entrada multimodal en formato textual: acepta estado en JSON o texto plano junto con la pregunta tipada.
- Inferencia en un unico forward pass, sin generacion autoregresiva ni decodificacion de tokens.
- Ejecucion on-device: CPU via XNNPACK (iOS y Android) y GPU Android via Vulkan (experimental); existe una ruta documentada para construir una variante Core ML en iOS.
- No dispone de tool calling, function calling, capacidades de agente multi-paso ni generacion de codigo o texto, porque no es un modelo generativo.
- Capacidades multilingues: no disponibles en la informacion proporcionada; el tokenizer es el ModernBERT del repositorio base.

## Casos de uso

- Enrutado de decisiones en aplicaciones React Native: el modelo se integra en el hilo nativo mediante `react-native-executorch` y permite elegir entre hasta 12 acciones de interfaz a partir de un estado JSON, sin llamadas de red.
- Politicas de agentes con componente System-1: en un agente que ya usa un LLM para razonar, Laya puede actuar como modulo rapido y local que decide la siguiente accion discreta y delega en el LLM solo cuando `act_logits` indica escalado.
- Clasificacion de intenciones en asistentes conversacionales: dado el turno del usuario y el historial resumido, la pregunta de tipo `choice` selecciona la intencion entre un conjunto acotado de etiquetas.
- Validacion de formularios y datos: con `noul` se obtiene la probabilidad de que un campo cumpla una condicion declarada, util para marcar entradas dudosas antes de enviarlas al backend.
- Puntuacion de candidatos en ranking ligero: con `score` se calcula una puntuacion esperada sobre opciones ordenadas (por ejemplo, relevancia de 0 a 4) para reordenar resultados en el propio dispositivo.
- Moderacion de contenido de baja latencia: el modelo evalua si un texto cumple una politica mediante preguntas tipadas `choice` o `noul`, manteniendo el contenido en el dispositivo por motivos de privacidad.
- Toma de decisiones en robotica o domotica embebida: el estado del entorno se serializa como JSON y el modelo selecciona la accion discreta siguiente, con la cabeza auxiliar como mecanismo de escalado ante incertidumbre.
- Verificacion de integraciones: `laya_testcases.json` incluye 4 casos tokenizados con respuestas de referencia, lo que permite comprobar que un port a otra plataforma reproduce el comportamiento del runtime de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay datos de MMLU, HumanEval, GSM8K ni de tareas de decision comparables). Lo unico verificable que aporta la model card es la validacion funcional:

| Comprobacion | Resultado declarado |
|---|---|
| Casos de `laya_testcases.json` en Android fisico (ModernBERT-large int8, XNNPACK CPU) | Los 4 casos reproducen exactamente la referencia int8 de escritorio |
| Concordancia int8 frente a fp32 | El argmax y las probabilidades coinciden en torno a 1e-3 |

## Requisitos de hardware

- Variante int8 XNNPACK (`laya_xnnpack_int8wo.pte`): 603 MB de pesos; es la recomendada para movil (iOS y Android) y previsiblemente requiere un presupuesto de memoria del orden de 0,7 a 1 GB sumando pesos y activaciones.
- Variante fp32 XNNPACK (`laya_xnnpack.pte`): 1,69 GB de pesos; pensada como referencia en escritorio, requiere aproximadamente 2 GB de memoria o mas.
- Variante int8 Vulkan (`laya_vulkan_int8.pte`): 603 MB, para GPU Android; marcada como experimental en `BACKENDS.md`.
- Variante fp32 Vulkan (`laya_vulkan.pte`): 1,69 GB, experimental.
- CPU: funciona en telefonos Android e iOS con backend XNNPACK; el autor confirma ejecucion verificada en un telefono Android fisico.
- GPU de escritorio (A100, H100, RTX 4090): no disponible; el paquete esta orientado a movil y no se documentan requisitos ni rendimiento en GPU de servidor.
- Opciones de despliegue: runtime de ExecuTorch con backend XNNPACK, backend Vulkan en Android, ruta documentada para Core ML en iOS y `react-native-executorch` como integracion en React Native. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo no generativo en formato `.pte`.
- Latencia y throughput: no disponibles; la model card no publica mediciones de tiempo por inferencia.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento frente a alternativas. Como referencia conceptual, este modelo se posiciona frente a dos categorias distintas: los clasificadores encoder tipo ModernBERT/BERT ajustados para clasificacion (que no ofrecen el esquema de pregunta tipada ni la cabeza de escalado) y los LLM generativos usados como enrutadores (que consumen muchos mas recursos y no caben con holgura en un movil). No se dispone de datos para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Ventana fija de 192 tokens: la secuencia incluye instrucciones, pregunta, marcadores de opciones y estado, por lo que el estado debe ser muy breve; no hay mecanismo de contexto ampliable ni de troceado documentado.
- Maximo de 12 opciones por decision (`marker_pos` y `marker_mask` tienen 12 ranuras); las opciones que excedan ese limite no pueden representarse.
- No genera texto: cualquier caso de uso que requiera redaccion, resumen o explicacion debe resolverse con otro modelo; forzar ese uso produce resultados incorrectos.
- Postprocesado obligatorio: las temperaturas por par (qtype, k) estan en el `.meta.json`; usar softmax sin esa division altera la calibracion de `score` y `noul`.
- Riesgo de descalibracion fuera de la distribucion de entrenamiento; no se documentan evaluaciones de robustez, sesgo ni tasas de acierto, por lo que la fiabilidad en dominios nuevos no esta cuantificada.
- Idiomas: no disponible. El tokenizer es el ModernBERT del repositorio base y no se documenta cobertura multilingue, por lo que conviene validar con datos propios antes de desplegar en castellano u otros idiomas.
- Licencia Apache-2.0 heredada del modelo base, que permite uso comercial; se recomienda conservar los avisos de licencia y citar `convaiinnovations/laya` al redistribuir.
- Las variantes Vulkan estan marcadas como experimentales; para produccion en Android la ruta recomendada es XNNPACK.
- No hay informacion sobre sesgos conocidos ni sobre el dataset de entrenamiento, lo que limita cualquier evaluacion de equidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el enlace al proyecto `laya-for-react-native` aparece incompleto en la model card, lo que dificulta reproducir la exportacion.

## Enlaces

- Pagina de HuggingFace del modelo: https://huggingface.co/ksanjiv05/laya-for-rn-executorch
- Modelo base: https://huggingface.co/convaiinnovations/laya
- ExecuTorch (PyTorch): https://pytorch.org/executorch/
- react-native-executorch (Software Mansion): https://github.com/software-mansion/react-native-executorch
- Repositorio `laya-for-react-native` citado en la model card: enlace incompleto en la informacion disponible (https://github.com/)
