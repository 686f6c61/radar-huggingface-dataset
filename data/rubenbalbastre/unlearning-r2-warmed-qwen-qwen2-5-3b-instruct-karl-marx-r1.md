# rubenbalbastre/unlearning-r2-warmed-qwen-qwen2-5-3b-instruct-karl-marx-r1

## Resumen

Se trata de un adaptador LoRA de desaprendizaje automático (*machine unlearning*) construido sobre el modelo base Qwen/Qwen2.5-3B-Instruct y publicado por el usuario de HuggingFace `rubenbalbastre`. El repositorio no contiene pesos completos, sino un adaptador PEFT en formato safetensors de aproximadamente 0,5 GB, entrenado con GRPO y LoRA según las etiquetas declaradas (`grpo`, `lora`, `trl`, `transformers`). La ruta del modelo base registrada en las etiquetas incluye el segmento `machine-unlearning-llm`, lo que apunta a un pipeline experimental de olvido selectivo de conocimiento.

El sufijo del identificador (`karl-marx-r1`) sugiere que el concepto objetivo del desaprendizaje es el contenido asociado a Karl Marx, aunque la model card no documenta el objetivo, el conjunto de datos ni el protocolo de evaluación. Tampoco se especifican la licencia, los idiomas soportados, el rango del adaptador ni los hiperparámetros de entrenamiento: la model card es la plantilla por defecto de HuggingFace, con todos los campos marcados como `[More Information Needed]`.

Por su naturaleza, el artefacto es relevante para investigación en desaprendizaje de modelos y en alineación mediante RL, no como modelo de producción. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria ni reproducibilidad verificada de sus resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) con adaptador LoRA; el modelo base es Qwen2.5-3B-Instruct |
| Parametros totales | 3,09 B en el modelo base (cifra publica de Qwen); el numero de parametros entrenables del adaptador no esta disponible |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen2.5-3B-Instruct (extensible a 131.072 con YaRN segun la documentacion de Qwen); el adaptador no modifica esta ventana. El autor no declara nada al respecto |
| Tipos de cuantizacion | No disponible. El repositorio solo distribuye el adaptador en safetensors sin cuantizar; para usar GGUF o 4/8 bits es necesario fusionar el adaptador con el modelo base y cuantizar por cuenta propia |
| Idiomas soportados | No disponible en la model card del adaptador. El modelo base Qwen2.5-3B-Instruct declara soporte para 29 idiomas, entre ellos el castellano |
| Licencia | No disponible en la model card del adaptador. El modelo base Qwen2.5-3B-Instruct se distribuye bajo Qwen Research License, que restringe el uso comercial sin acuerdo adicional: conviene verificar antes de cualquier despliegue productivo |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, libreria `peft`) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-3B-Instruct es un transformer decoder-only denso de la familia Qwen2, con atencion por consultas agrupadas (GQA) y normalizacion RMSNorm. Sobre el se aplica un adaptador LoRA, de modo que los pesos originales permanecen congelados y solo se actualiza un subconjunto de matrices de bajo rango. El repositorio tiene un tamano de 0,5 GB, coherente con un adaptador LoRA de rango moderado en precision de 16 o 32 bits, aunque el rango, el `lora_alpha`, el `dropout` y los modulos objetivo no estan documentados.

Segun las etiquetas, el entrenamiento se realizo con GRPO (*Group Relative Policy Optimization*), un algoritmo de optimizacion por politica con senal de recompensa relativa dentro de grupos de muestras, implementado habitualmente en la libreria TRL. No se especifican el conjunto de datos, el numero de tokens, la funcion de recompensa, el numero de pasos, el hardware empleado ni si hubo fases previas de ajuste supervisado o DPO. La model card menciona PEFT 0.19.1 como unica version de framework declarada. No hay informacion sobre innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, destilacion de razonamiento) mas alla de lo que sugiere el sufijo `r1` del identificador, que no se explica en la documentacion.

## Capacidades

- Generacion de texto conversacional: hereda la capacidad del modelo base Qwen2.5-3B-Instruct para mantener dialogos multi-turno, con la salvedad de que el adaptador puede haber degradado parte de estas capacidades.
- Razonamiento e instrucciones: el modelo base resuelve tareas de seguimiento de instrucciones, matematicas basicas y comprension lectora; no hay evaluacion posterior al desaprendizaje.
- Generacion de codigo: capacidad heredada del modelo base; sin datos especificos tras el ajuste.
- Multilingueismo: el modelo base cubre 29 idiomas, incluido el castellano; el autor no documenta el comportamiento del adaptador por idioma.
- Tool calling / function calling: el modelo base Qwen2.5 soporta llamadas a funciones; no hay confirmacion de que el adaptador lo preserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidad objetivo: desaprendizaje selectivo de contenido asociado a Karl Marx, segun la nomenclatura del repositorio. No hay metricas publicadas que confirmen el grado de olvido ni su especificidad.
- Capacidades especiales (vision, audio, modo *thinking* explicito): no disponibles.

## Casos de uso

- Investigacion en *machine unlearning*: el adaptador sirve como banco de pruebas para estudiar si el ajuste con GRPO sobre LoRA elimina de forma selectiva un concepto concreto sin destruir el resto de capacidades. Requiere ejecutar evaluaciones propias, ya que el autor no publica ninguna.
- Comparacion de algoritmos de desaprendizaje: al estar entrenado con GRPO sobre un base conocido, permite contrastar con variantes basadas en DPO, NPO o gradiente ascendente partiendo del mismo Qwen2.5-3B-Instruct y midiendo la degradacion resultante.
- Estudio del olvido catastrófico inducido por RL: util para medir cuanto rendimiento general (MMLU, GSM8K, HumanEval) se pierde al forzar el olvido de un concepto mediante recompensas relativas por grupo.
- Auditoria de robustez del olvido: experimentos de re-aprendizaje o *jailbreak* para comprobar si el conocimiento supuestamente eliminado puede recuperarse con unas pocas muestras o mediante prompting adversario. Es un caso de uso habitual en la literatura de desaprendizaje.
- Escenarios regulatorios de derecho al olvido: prototipo academico para explorar como se abordaria la retirada de datos o conceptos de un modelo desplegado, aunque el artefacto no esta listo para cumplimiento normativo real.
- Experimentacion de bajo coste en una sola GPU: al tratarse de un adaptador de 0,5 GB sobre una base de 3,09 B, cualquier investigador con una GPU de gama media puede reproducir el flujo de carga, fusion y evaluacion.
- Docencia y formacion: ejemplo practico de pipeline TRL + PEFT + GRPO con trazabilidad parcial, util para explicar las limitaciones de reproducibilidad cuando la model card esta vacia.
- Base para experimentos de desaprendizaje multilingue: partiendo del soporte de 29 idiomas del base, se podria medir si el olvido se transfiere entre idiomas, un fenomeno documentado pero no evaluado aqui.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye la seccion de evaluacion cumplimentada, y el repositorio no adjunta tablas, scripts de evaluacion ni cifras de MMLU, HumanEval, GSM8K o similares. Tampoco hay datos de la perdida de rendimiento atribuible al desaprendizaje, que es precisamente la metrica clave en este tipo de artefactos.

## Requisitos de hardware

- VRAM para inferencia: el modelo base tiene 3,09 B de parametros. En fp16 o bf16 los pesos ocupan aproximadamente 6,2 GB, por lo que se recomienda un minimo de 8 GB de VRAM contando cache KV y activaciones. En cuantizacion de 4 bits la huella baja a unos 2-2,5 GB.
- El adaptador anade un consumo marginal: el repositorio completo ocupa 0,5 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas. Cabe en tarjetas de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4080 o RTX 4090. Para despliegue con concurrencia alta o lotes grandes son preferibles A100, H100 o L40S.
- Compatibilidad con GPU de consumo: si, es uno de los puntos fuertes del artefacto; el modelo base de 3 B esta disenado para ejecutarse en hardware modesto.
- Opciones de despliegue: transformers junto con PEFT para cargar el adaptador directamente; fusion del adaptador con la base y exportacion a GGUF para llama.cpp u Ollama; vLLM con soporte de adaptadores LoRA para servicio concurrente; TGI para despliegue en servidor. Las versiones cuantizadas (GGUF, AWQ, GPTQ) no estan publicadas por el autor y habria que generarlas.
- Latencia y throughput: no disponibles. No se han publicado mediciones y el autor no documenta el hardware de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| rubenbalbastre/unlearning-r2-warmed-qwen-qwen2-5-3b-instruct-karl-marx-r1 | Adaptador LoRA sobre base de 3,09 B | Heredado del base (32.768 tokens) | No disponible | safetensors (PEFT) | Adaptador, requiere el base |
| Qwen/Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens (131.072 con YaRN) | Qwen Research License | safetensors, GGUF, AWQ, GPTQ | Modelo completo, ampliamente distribuido |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Modelo completo, con proceso de acceso |
| microsoft/Phi-3.5-mini-instruct | 3,8 B | 128.000 tokens | MIT | safetensors, GGUF, ONNX | Modelo completo |

No hay datos de rendimiento comparado para el adaptador analizado, ya que no se han publicado benchmarks. Las cifras de parametros, contexto y licencia de las alternativas proceden de su documentacion publica y no de la informacion suministrada sobre este repositorio. La diferencia funcional principal es que las tres alternativas son modelos completos listos para uso general, mientras que este artefacto es un adaptador de investigacion con un objetivo especifico de desaprendizaje.

## Limitaciones y advertencias

- La model card esta practicamente vacia: todos los campos de detalle, uso previsto, datos de entrenamiento, hiperparametros, evaluacion e impacto ambiental figuran como `[More Information Needed]`. No es posible reproducir el entrenamiento ni auditar el procedimiento.
- El repositorio acumula 0 descargas y 0 likes, sin validacion independiente ni informes de terceros.
- Es un adaptador LoRA, no un modelo autonomo: sin cargar Qwen/Qwen2.5-3B-Instruct no se puede ejecutar. Cualquier integracion debe gestionar dos artefactos.
- Riesgo de alucinacion heredado del modelo base de 3 B, que es notablemente mas alto que en modelos de mayor tamano.
- El desaprendizaje selectivo no garantiza el borrado efectivo de la informacion: el conocimiento puede reaparecer con fine-tuning posterior, con prompting adversario o por transferencia desde otros idiomas. No hay evaluaciones de robustez publicadas para este adaptador.
- Riesgo de sobre-olvido (*over-forgetting*): la optimizacion con GRPO puede degradar capacidades generales o eliminar conocimiento adyacente de forma no intencionada, y no hay mediciones que cuantifiquen ese dano.
- Sesgos: no evaluados. El modelo base Qwen2.5 presenta sesgos documentados en la literatura, que el ajuste no corrige y podria alterar de forma no controlada.
- Restricciones de licencia: la licencia del adaptador no esta declarada, y la del modelo base (Qwen Research License) limita el uso comercial sin acuerdo con el titular. Ambas circunstancias deben resolverse antes de cualquier uso productivo.
- Idiomas: no se documenta el comportamiento del adaptador por idioma, por lo que el olvido podria no estar alineado entre lenguas.
- La model card referencia el identificador arXiv 2608.17804, cuyo contenido no se ha podido verificar a partir de la informacion disponible.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/rubenbalbastre/unlearning-r2-warmed-qwen-qwen2-5-3b-instruct-karl-marx-r1
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Articulo referenciado en la model card (sin verificar): https://arxiv.org/abs/2608.17804
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria TRL (GRPO): https://github.com/huggingface/trl
- Transformers: https://github.com/huggingface/transformers
