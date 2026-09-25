# preemware/Qwen3.8-27B-RANA-abliterated

## Resumen

Qwen3.8-27B-RANA-abliterated es una variante del modelo multimodal denso Qwen/Qwen3.8-27B, publicada por el usuario preemware, a la que se le ha eliminado la direccion de rechazo mediante RANA (Reasoning-Anchored, Norm-preserving Ablation), una variante interna de la tecnica de ablacion de direccion de rechazo descrita por Arditi et al. (2024). El objetivo no es mejorar capacidades, sino eliminar la negativa del modelo base conservando intacto todo lo demas: segun la model card, el modelo resultante «casi nunca rechaza de forma explicita».

El modelo mantiene 27.781.427.952 parametros, la torre de vision (333 tensores byte a byte identicos al base) y la cabeza MTP, de modo que siguen funcionando la entrada de imagen, el tool calling multi-turno y la decodificacion especulativa. Se distribuye unicamente en safetensors BF16 (repositorio de 55,6 GB) bajo licencia Apache-2.0 y esta declarado explicitamente como modelo de investigacion con alineacion de seguridad eliminada, no apto para despliegue publico sin una capa de moderacion externa.

Su interes actual es doble: por un lado, publica un desglose tensor a tensor de los 131 tensores modificados y una verificacion independiente con Abliterlitics; por otro, ofrece una evaluacion comparada con el modelo base y con otra variante sin censura (orcarouter/Qwen3.8-27B-Uncensored), con una divergencia KL de 0,041 frente al base y una degradacion media de capacidades de 0,82 puntos porcentuales en cinco tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal con atencion hibrida (atencion completa y linear attention, inferido de los tensores `self_attn.o_proj` y `linear_attn.out_proj`), torre de vision y cabeza MTP para decodificacion especulativa |
| Parametros totales | 27.781.427.952 (~27,8 mil millones) |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | no disponible (la configuracion de servicio de ejemplo usa `--max-model-len 20480`; el arnes de evaluacion limita la generacion a 16.000 tokens) |
| Tipos de cuantizacion | no disponible en este repositorio (solo pesos BF16 en safetensors; no se publican GGUF, FP8 ni AWQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada de Qwen) |
| Formato de pesos | safetensors, BF16 (libreria `transformers`) |
| Pipeline declarado | image-text-to-text |
| Modelo base | Qwen/Qwen3.8-27B |
| Tamano del repositorio | 55,6 GB |
| Fecha de publicacion | 25 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo no se ha reentrenado: es una edicion de pesos sobre Qwen3.8-27B, descrito en los resultados de busqueda como el miembro denso y nativo multimodal de la familia Qwen3.8, orientado a codigo, flujos agenticos y automatizacion de oficina. RANA elimina una unica «direccion de rechazo» del flujo residual siguiendo a Arditi et al. (2024) y conserva las normas originales de los pesos editados. La receta y el codigo no estan publicados.

Los cambios son quirurgicos y estan enumerados en la model card: 17 matrices en la salida de atencion (`self_attn.o_proj`, 16 principales mas 1 del MTP), 48 en la salida de linear attention (`linear_attn.out_proj`), 65 en la salida del MLP (`mlp.down_proj`, 64 principales mas 1 del MTP) y 1 en `embed_tokens`, para un total de 131 tensores, sin ningun cambio fuera de ese conjunto. La torre de vision permanece intacta (333 tensores identicos) y la cabeza MTP conserva sus 15 tensores, con sus dos escritores residuales editados del mismo modo, lo que mantiene operativa la decodificacion especulativa con una longitud de aceptacion de 2,45. La componente residual mas grande que queda a lo largo de la direccion eliminada es 0,00122, frente a 0,225 antes de la ablacion.

Una verificacion independiente con Abliterlitics (commit `9b15eb0`) detecta exactamente 129 tensores modificados de los 850 que inspecciona, cifra coherente con los 131 declarados dado que esa herramienta omite los tensores de vision y MTP. No hay informacion publicada sobre numero de tokens de entrenamiento, composicion del dataset, ni fases de RLHF/DPO, ya que el autor no realiza entrenamiento alguno.

## Capacidades

- Generacion de texto y razonamiento con modo «thinking» activado por defecto; muestreo recomendado T = 1,0, top_p = 0,95, top_k = 20.
- Codigo: el modelo base esta orientado a tareas de programacion; el peor delta de capacidad medido en la ablacion es de −1,5 pp en TruthfulQA, con HumanEval como referencia de comparacion entre variantes.
- Vision: entrada de imagen soportada (el ejemplo probado limita a 1 imagen y 0 videos por prompt mediante `--limit-mm-per-prompt`).
- Tool calling y function calling: soportado con `--enable-auto-tool-choice` y parser `qwen3_coder`; el tool calling multi-turno esta verificado sobre estos pesos.
- Agentes y razonamiento multi-paso: herencia de las capacidades agenticas del base, con parser de razonamiento `qwen3`.
- Decodificacion especulativa con MTP: configuracion `{"method": "mtp", "num_speculative_tokens": 2}` probada con vLLM 0.30.0.
- Ausencia practica de rechazos: 0 rechazos duros de 200 en HarmBench bajo ambos jueces, frente a 168/155 del base.
- Capacidades multilingues: no disponible (los tags del repositorio no declaran idiomas).

## Casos de uso

- Investigacion en interpretabilidad: estudiar como se codifica la direccion de rechazo en el flujo residual comparando este modelo con su base, aprovechando que solo 131 tensores difieren y que el autor los enumera uno a uno.
- Red-teaming y evaluacion de robustez: generar respuestas que el modelo base rechazaria para construir conjuntos de prompts adversarios y medir la eficacia de clasificadores de seguridad externos.
- Evaluacion de metodos de abliteracion: servir como punto de comparacion reproducible frente a otras variantes de Qwen3.8-27B (orcarouter, huihui-ai, Blackfrost) usando la distancia KL al base y el desglose tensor a tensor como metricas.
- Analisis de degeneracion y bucles: con un 6,7 % de respuestas que agotan el presupuesto de 16.000 tokens, es util para estudiar modos de fallo de modelos ablacionados y disenar detectores de bucles en produccion.
- Auditoria de sistemas de moderacion: al no tener rechazos internos, permite probar si una capa de filtrado externa (clasificador de entrada/salida) soporta sola la carga de seguridad antes de considerar cualquier despliegue.
- Investigacion multimodal de seguridad: la torre de vision esta intacta y byte-identica al base, lo que permite estudiar comportamiento de rechazo sobre entradas de imagen sin la variable de un vision tower modificado.
- Red-teaming de agentes: el tool calling multi-turno y la decodificacion especulativa funcionan sobre estos pesos, lo que permite evaluar agentes con herramientas en escenarios hostiles.
- Docencia y divulgacion tecnica: explicar con un caso real que la ablacion de una direccion concreta elimina el rechazo sin degradar de forma apreciable otras capacidades (0,82 pp de media en cinco tareas).

## Benchmarks y rendimiento

No se publican puntuaciones absolutas de MMLU, GSM8K o HumanEval. Los unicos datos disponibles son comparativas internas ejecutadas con el mismo arnes sobre el base, la referencia `orcarouter/Qwen3.8-27B-Uncensored` (etiquetada como «orca») y RANA, con tres semillas de muestreo y dos jueces LLM independientes (gpt-oss y Mistral). Donde aparecen dos cifras, corresponden a cada juez.

| Metrica | Base | orca (referencia) | RANA |
|---|---|---|---|
| Rechazos duros, HarmBench (de 200) | 168 / 155 | 0,7 / 0 | 0 / 0 |
| Responde a la peticion, prompts held-out | 3 % / 0 % | 84 % / 49 % | 90 % / 54 % |
| Agota el presupuesto de tokens (bucles), held-out | 0,6 % | 11,9 % | 6,7 % |
| Cambio medio de capacidad vs base (5 tareas) | — | 1,11 pp | 0,82 pp |
| Peor tarea individual vs base | — | −2,2 (HumanEval) | −1,5 (TruthfulQA) |
| Distancia al base (KL) | 0 | 0,075 | 0,041 |

| Modelo | HarmBench (200): respuestas | Bucles | Held-out (240): respuestas | Bucles | Tokens medios (held-out) |
|---|---|---|---|---|---|
| base | 3,2 % / 0,7 % | 0,3 % | 3,2 % / 0,0 % | 0,6 % | 1.113 |
| orca | 73,7 % / 61,2 % | 26,3 % | 83,9 % / 49,2 % | 11,9 % | 6.461 |
| RANA | 78,5 % / 57,3 % | 20,5 % | 90,0 % / 54,4 % | 6,7 % | 4.697 |

Notas de la evaluacion: los jueces coinciden bien en rechazos explicitos (kappa = 0,89) pero solo moderadamente en «respondido o no» (kappa = 0,54). Frente a orca, en los prompts held-out RANA entra menos en bucle (12 casos frenta a 50 en los que solo uno de los dos modelo hizo bucle, p = 1,2 × 10⁻⁶) y responde mas bajo ambos jueces (p = 2,9 × 10⁻⁶ con gpt-oss; p = 0,008 con Mistral). En HarmBench el ganador depende del juez, por lo que no hay vencedor claro. RANA es 2,2 pp peor que orca en IFEval. En el banco externo Abliterlitics, que compara 12 variantes de Qwen3.8-27B con un presupuesto de razonamiento de 15.360 tokens y FP8 dinamico sobre una RTX 5090, las ediciones quirurgicas lideran con orcarouter al 82 % y apostate al 79 %.

## Requisitos de hardware

- Inferencia en BF16: el repositorio ocupa 55,6 GB, por lo que necesita una GPU de 80 GB o mas (A100 80 GB, H100 80 GB, H200). La model card indica que cabe en una unica GPU de 80 GB o superior en BF16.
- GPU de consumo: no cabe en BF16 en ninguna GPU de consumo actual (27,8 mil millones de parametros a 2 bytes por parametro). No se publican pesos cuantizados en este repositorio, por lo que no hay una ruta oficial a 24 GB o 16 GB de VRAM.
- Alternativas cuantizadas de la misma familia: existen builds GGUF de terceros para otras variantes ablacionadas de Qwen3.8-27B (por ejemplo Blackfrost-AI/Qwen3.8-27B-ABLITERATED-GGUF), pero no para estos pesos concretos.
- Opciones de despliegue: vLLM 0.30.0 es la unica verificada por el autor, con `VLLM_USE_FLASHINFER_SAMPLER=0` necesario en GPUs Blackwell. No hay soporte confirmado para llama.cpp, Ollama, TGI ni TensorRT-LLM en esta publicacion.
- Configuracion de referencia: `--dtype bfloat16 --max-model-len 20480 --reasoning-parser qwen3 --enable-auto-tool-choice --tool-call-parser qwen3_coder --limit-mm-per-prompt '{"image": 1, "video": 0}' --speculative-config '{"method": "mtp", "num_speculative_tokens": 2}'`.
- Latencia y throughput: no disponibles. El unico dato de eficiencia publicado es la longitud de aceptacion de 2,45 con decodificacion especulativa MTP.
- Presupuesto de memoria en generacion: el arnes de evaluacion uso un presupuesto de 16.000 tokens por respuesta y una media de 4.697 tokens en los prompts held-out, lo que da una idea del consumo de KV cache en cargas de razonamiento largo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos duros (HarmBench, de 200) | Distancia al base (KL) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| preemware/Qwen3.8-27B-RANA-abliterated | 27,78 mil millones | no disponible | 0 / 0 | 0,041 | Apache-2.0 | safetensors BF16 en HuggingFace |
| Qwen/Qwen3.8-27B (base) | ~27,8 mil millones | no disponible | 168 / 155 | 0 | Apache-2.0 | safetensors, referencia oficial |
| orcarouter/Qwen3.8-27B-Uncensored | no disponible | no disponible | 0,7 / 0 | 0,075 | no disponible | variante ablacionada de referencia en la comparativa |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | no disponible | no disponible | no disponible | no disponible | no disponible | otra ablacion de la comunidad, sin datos comparables en esta busqueda |
| Blackfrost-AI/Qwen3.8-27B-ABLITERATED-GGUF | no disponible (derivado de 27B) | no disponible | no disponible | no disponible | no disponible | escalera GGUF para llama.cpp |

En el banco externo Abliterlitics, que evalua 12 variantes ablacionadas de Qwen3.8-27B, la variante orcarouter obtiene el 82 % y apostate el 79 % en el leaderboard con juez. RANA no figura entre los datos recuperados de esa comparativa.

## Limitaciones y advertencias

- Modelo con la alineacion de seguridad eliminada de forma explicita: la model card prohibe el despliegue publico o de cara al usuario final sin una capa de moderacion independiente. El propio modelo ya no filtra, por lo que todo el filtrado debe ser externo.
- Uso previsto exclusivamente de investigacion: interpretabilidad, red-teaming y evaluacion de robustez del comportamiento de rechazo.
- Responsabilidad legal del usuario: cumplimiento de la legislacion aplicable, de la licencia Apache-2.0 heredada de Qwen y de los terminos de cualquier plataforma donde se usen las salidas.
- Riesgo de alucinacion no caracterizado: no hay mediciones absolutas de veracidad; el unico dato es una caida de 1,5 pp en TruthfulQA respecto al base.
- Tendencia a bucles: el 6,7 % de las respuestas held-out agotan el presupuesto de 16.000 tokens, frente al 0,6 % del base y al 11,9 % de orca. Es una tasa once veces superior a la del modelo original.
- Perdida de seguimiento de instrucciones: 2,2 pp peor que la referencia orca en IFEval.
- Evaluacion con baja concordancia entre jueces: kappa = 0,54 en «respondido o no» implica que las cifras de respuesta parcial dependen mucho del juez elegido.
- Receta no reproducible: el metodo RANA es interno y ni el codigo ni la receta estan publicados, lo que limita la replicacion independiente del procedimiento (aunque si se verifica el resultado del cambio de pesos).
- Idiomas y contexto sin declarar: no hay informacion sobre cobertura linguistica ni longitud de contexto nativa, un vacio relevante para planificar despliegues.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de terceros mas alla de la comprobacion de Abliterlitics.
- Sesgos: no se publica ninguna evaluacion de sesgos del modelo base ni de esta variante.

## Enlaces

- [preemware/Qwen3.8-27B-RANA-abliterated en HuggingFace](https://huggingface.co/preemware/Qwen3.8-27B-RANA-abliterated)
- [Qwen/Qwen3.8-27B (modelo base)](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Repositorio de Qwen3.8-27B en GitHub (AlibabaCloud-Official)](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Repositorio de la serie Qwen3.8 en GitHub (QwenLM)](https://github.com/QwenLM/Qwen3.8)
- [Abliterlitics: comparativa de 12 variantes ablacionadas de Qwen3.8-27B](https://abliterlitics.dev/models/qwen38-27b/)
- [Abliterlitics (codigo, commit 9b15eb0)](https://github.com/dreamfast/abliterlitics)
- [huihui-ai/Huihui-Qwen3.8-27B-abliterated](https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated)
- [Blackfrost-AI/Qwen3.8-27B-ABLITERATED-GGUF](https://huggingface.co/Blackfrost-AI/Qwen3.8-27B-ABLITERATED-GGUF)
- Referencia bibliografica citada por el autor: Arditi et al. (2024) sobre direccion de rechazo en modelos de lenguaje. URL no disponible en los resultados de busqueda.
