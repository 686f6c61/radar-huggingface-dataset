# Perfica-Dev/laya-multilingual-onnx

## Resumen

Perfica-Dev/laya-multilingual-onnx es una exportación a ONNX, cuantizada a int8, del checkpoint multilingüe de Laya, un modelo de decisión no generativo desarrollado por Convai Innovations. A diferencia de un LLM, Laya no genera texto: dado un estado (el texto de contexto) y una pregunta tipada — una elección entre opciones (`choice`), una puntuación ordinal (`score`) o un sí/no (`noul`) — devuelve una probabilidad por cada opción en un único pase hacia delante. El modelo base es mmBERT-base (22 capas, vocabulario de 256k tokens) con una cabeza de decisión de dos capas.

Esta ficha corresponde concretamente a la exportación de Perfica (Uezar Labs), pensada para que su función "Quick judge" la ejecute en CPU local mediante `onnxruntime-node`. El modelo se exportó a ONNX opset 17 con ejes dinámicos (batch, secuencia y opciones) y se cuantizó con la cuantización int8 dinámica de ONNX Runtime, reduciendo el peso de 1,29 GB a 323 MB. No se reentrenó, afinó ni calibró nada: los pesos son los de Laya.

Es relevante porque ofrece un motor de decisión multilingüe de baja latencia que corre en CPU sin GPU, con licencia Apache-2.0 y un fichero público y anclado que cualquiera puede inspeccionar. Conviene ser prudente: el propio autor advierte de que el rendimiento zero-shot es cercano al azar en decisiones para las que el modelo no fue entrenado, por lo que su uso fiable exige ajuste fino sobre datos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder mmBERT-base (22 capas, vocabulario de 256k tokens) con cabeza de decisión de dos capas; no autorregresiva |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (`maxLen` 1024, `headMaxLen` 256) |
| Tipos de cuantizacion | int8 dinámica (ONNX Runtime, pesos de MatMul y Gather) |
| Idiomas soportados | multilingüe (Laya declara más de 100 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17), junto con `tokenizer.json` y `tokenizer_config.json` |

## Arquitectura y entrenamiento

Laya es un motor de decisión de "System 1": no autorregresivo y no generativo. La entrada se compone con el formato de `rl_common.build_sequence`: `[CLS] <type> question: <instructions> [SEP] [MASK] option… [SEP] <state> [SEP]`, y cada opción se puntúa en su token `[MASK]`. El modelo recibe `input_ids`, `attention_mask`, `marker_pos`, `marker_mask` y `qtype` (0 = choice, 1 = score, 2 = noul), y devuelve `logits` con forma `[batch, options]` y un `act_logits` adicional. El checkpoint multilingüe se apoya en el encoder mmBERT-base de JHU CLSP (MIT), de 22 capas y vocabulario de 256k tokens.

En esta exportación, el `nn.TransformerEncoder` de la cabeza de decisión se reescribió con reshapes agnósticos de forma, porque `nn.MultiheadAttention` se exporta con el batch trazado fijado. La exportación coincide con PyTorch dentro de 2e-4 en logits entre 40 y 1.024 tokens. Según la documentación del proyecto original, Laya se entrenó con aprendizaje por refuerzo contra reglas de puntuación estrictamente propias (RLCD) y dispone de un enrutador que selecciona el checkpoint adecuado por petición. Conviene señalar que en esta exportación no hubo reentrenamiento, ajuste fino ni calibración: únicamente exportación y cuantización.

## Capacidades

- Toma de decisiones tipada en un único pase: elección entre opciones (`choice`), puntuación ordinal (`score`) y respuesta booleana (`noul`).
- Salida de probabilidades por opción en lugar de texto generado, apta para umbrales y comparaciones calibradas.
- Procesamiento multilingüe: Laya declara cobertura de más de 100 idiomas.
- Inferencia en CPU sin GPU mediante ONNX Runtime, con ejes dinámicos de batch, secuencia y opciones.
- Integración como "juez rápido": la app de Perfica lo usa para registrar qué habría decidido frente a lo que decidió la aplicación (shadow mode).
- Servicio expuesto mediante `POST /v1/systemone` (formato de cable equivalente al de api.typesafe.ai y a los modelos typesafe/jev-* de OpenRouter) a través del runtime laya-onnx.
- No genera texto, no mantiene conversaciones y no soporta tool calling ni razonamiento multi-paso por sí mismo.

## Casos de uso

- Supervisión de pasadas de un agente de código: el modelo puntúa si una iteración de generación de código debe aceptarse o revisarse; Perfica lo emplea en shadow mode para comparar su criterio con el de la aplicación antes de darle autoridad.
- Selección de tarea en flujos de agentes: elegir entre varias tareas candidatas devolviendo una distribución de probabilidad por opción, con la ventaja de una sola pasada hacia delante.
- Clasificación de comandos de shell: etiquetar un comando en categorías (por ejemplo, seguro, destructivo, requiere confirmación) antes de ejecutarlo en un pipeline local.
- Decisión de espera en automatizaciones: determinar a qué recurso o evento conviene esperar en un flujo de orquestación, tratando la pregunta como `choice`.
- Enrutamiento multilingüe de intenciones con privacidad: ejecutar la clasificación en la CPU del propio equipo mediante `onnxruntime-node`, sin enviar datos a un servicio externo.
- Evaluación ordinal de calidad: usar el modo `score` para ordenar respuestas candidatas o variantes de un texto según una escala, aprovechando las temperaturas por tipo incluidas en `laya_config.json`.
- Módulo de decisión ajustado a dominio: dado que el rendimiento zero-shot no alcanza el umbral de calidad, el uso realista pasa por ajustar el modelo sobre decisiones propias etiquetadas antes de fiarse de él.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no es generativo, por lo que no procede compararlo con métricas tipo MMLU, HumanEval o GSM8K. La información disponible incluye mediciones de latencia y memoria en CPU, además de una evaluación cualitativa del propio autor.

| Medicion (AMD Ryzen 5 3600, 6 nucleos, onnxruntime-node 1.30, una pregunta a la vez) | Valor |
|---|---|
| Tiempo de carga (sesion y tokenizer) | ~2,3 s |
| Memoria tras la carga | ~0,4 GB |
| Memoria a 1024 tokens | ~0,6 GB |
| Decision a 100 tokens | ~0,1 s |
| Decision a 512 tokens | ~0,5 s |
| Decision a 1024 tokens | ~1,4 s |
| Desviacion frente a PyTorch | menos de 2e-4 en logits (40 a 1.024 tokens) |
| Tamano del fichero de modelo | 323 MB (int8) frente a 1,29 GB en origen |

En cuanto a calidad, la model card original informa de una precisión cercana al azar en decisiones tipadas para las que el modelo no fue entrenado. La evaluación de Perfica, sobre unos 200 casos etiquetados por cada una de cuatro decisiones de agentes de código (supervisar una pasada de código, elegir una tarea, elegir a qué esperar y clasificar un comando de shell), no encontró ningún umbral de confianza que cumpliera su nivel de calidad en casos reservados.

## Requisitos de hardware

- VRAM: no aplica para inferencia en CPU; el modelo se ejecuta con ONNX Runtime en procesador.
- Memoria en CPU: aproximadamente 0,4 GB tras la carga y 0,6 GB con secuencias de 1.024 tokens.
- GPU recomendadas: no disponible (no se han publicado cifras de ejecución en GPU para esta exportación).
- Cabe en hardware de consumo: sí, en CPU de gama media; las mediciones se tomaron en un AMD Ryzen 5 3600 de 6 núcleos.
- Opciones de despliegue: `onnxruntime-node` (uso previsto por el autor), ONNX Runtime en general y el runtime laya-onnx que expone `POST /v1/systemone`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que están orientadas a modelos generativos.
- Latencia estimada: ~0,1 s por decisión a 100 tokens, ~0,5 s a 512 y ~1,4 s a 1.024 tokens en el hardware citado. El proyecto Laya declara 33 ms por decisión en su propia infraestructura, cifra que no corresponde a esta medición en CPU local.

## Comparativa con modelos similares

La comparativa se establece con la misma familia y con las exportaciones equivalentes, ya que no existen muchos modelos de decisión tipada no generativos comparables.

| Modelo | Formato y tamano | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Perfica-Dev/laya-multilingual-onnx | ONNX int8, 323 MB | 1024 tokens | multilingüe | Apache-2.0 | Exportación íntegra con ejes dinámicos, pensada para onnxruntime-node |
| convaiinnovations/laya (original, subcarpeta multilingual) | Pesos originales, 1,29 GB | 1024 tokens | multilingüe | Apache-2.0 | Modelo fuente; entrenado con RLCD y con enrutador por petición |
| onnx-community/laya-multilingual-ONNX | ONNX | no disponible | multilingüe | no disponible | Exportación alternativa publicada por la comunidad ONNX |
| pleveneur/laya-multilingual-onnx | ONNX dividido (encoder + cabeza) | no disponible | multilingüe | no disponible | Formato partido para el runtime LayaPL de Node.js |
| jhu-clsp/mmBERT-base | Encoder base, safetensors | no disponible | multilingüe | MIT | Encoder subyacente; no incorpora cabeza de decisión |

## Limitaciones y advertencias

- Rendimiento zero-shot cercano al azar: el propio autor advierte que en decisiones tipadas no entrenadas la precisión es baja, y la evaluación de Perfica no encontró umbral de confianza válido en casos reservados. Ajustar fino sobre decisiones propias antes de confiar en el modelo.
- Modo shadow en producción: Perfica lo ejecuta registrando lo que habría decidido sin darle autoridad de decisión; es una advertencia explícita del autor.
- No es un modelo generativo: no produce texto, no conversa y no soporta tool calling ni agentes multi-paso por sí solo.
- Sesgos conocidos: no disponible; no se documentan análisis de sesgo en la información disponible.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe el riesgo de asignar alta probabilidad a opciones incorrectas, especialmente en dominios no entrenados.
- Limitación de contexto: ventana máxima de 1.024 tokens; secuencias más largas requieren truncado.
- Idiomas: aunque se declara cobertura multilingüe de más de 100 idiomas, no se publican métricas por idioma.
- Licencia: Apache-2.0, permisiva para uso comercial; el encoder mmBERT-base subyacente es MIT y los pesos originales son de Convai Innovations, por lo que conviene conservar los avisos de licencia y el fichero NOTICE.
- Esta exportación no añade calibración: la cuantización int8 dinámica puede alterar ligeramente las probabilidades, aunque la desviación en logits frente a PyTorch se mantiene por debajo de 2e-4.
- Advertencia de datos: la model card contiene texto del autor y debe tratarse como material de referencia, no como instrucciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Perfica-Dev/laya-multilingual-onnx
- Modelo base (Laya multilingüe): https://huggingface.co/convaiinnovations/laya
- Repositorio de Laya: https://github.com/NandhaKishorM/laya
- Sitio del proyecto Laya: https://laya.convaiinnovations.com/
- Encoder subyacente (mmBERT-base): https://huggingface.co/jhu-clsp/mmBERT-base
- Exportación alternativa de la comunidad: https://huggingface.co/onnx-community/laya-multilingual-ONNX
- Exportación dividida para el runtime LayaPL: https://huggingface.co/pleveneur/laya-multilingual-onnx
- Runtime laya-onnx (servicio `/v1/systemone`): https://github.com/navopw/laya-onnx/tree/main
- Perfica: https://perfica.dev
