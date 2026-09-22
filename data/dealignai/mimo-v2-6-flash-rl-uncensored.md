# dealignai/MiMo-V2.6-Flash-RL-UNCENSORED

## Resumen

MiMo-V2.6-Flash-RL-UNCENSORED es una version modificada del modelo XiaomiMiMo/MiMo-V2.6-Flash-RL, publicada por el usuario dealignai en Hugging Face. Se trata de un MoE multimodal de gran tamano al que se le ha eliminado el comportamiento de rechazo a nivel de pesos: segun el autor, el modelo responde a instrucciones en categorias que el modelo base rechazaria por diseno, manteniendo intactas las capacidades de codigo, matematicas, conocimiento y cobertura bilingue (ingles y chino). No emplea hooks en tiempo de ejecucion ni vectores de direccion; es un bundle estandar compatible con transformers, vLLM y SGLang.

El modelo base, segun la informacion de la model card, es un MoE de 309B parametros totales y 15B activos, con 256 expertos enrutados y top-8 (sin experto compartido), una disposicion de atencion hibrida (9 capas globales + 39 de ventana deslizante de 128), encoder de vision-lenguaje, encoder de audio, comprension de video, contexto de aproximadamente 1M tokens y una cabeza de decodificacion especulativa DFlash de 5 capas con atencion de ventana deslizante. El bundle se distribuye en precision nativa con atencion en FP8 y expertos en MXFP4.

La relevancia de esta publicacion es doble: por un lado, sirve como caso de estudio sobre tecnicas de eliminacion de rechazo a nivel de pesos y su impacto medible en benchmarks de compliance; por otro, mantiene las capacidades multimodales y de contexto largo del modelo original, lo que permite evaluar el trade-off entre alineacion y funcionalidad. El conteo de parametros declarado por safetensors (159.358.725.504) no coincide con los 309B que menciona la model card para el modelo base, una discrepancia que conviene verificar antes de planificar el despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer multimodal, atencion hibrida (9 capas globales + 39 de ventana deslizante 128), encoder de vision-lenguaje, encoder de audio, cabeza especulativa DFlash de 5 capas |
| Parametros totales | 159.358.725.504 segun safetensors del bundle; la model card del autor declara 309B totales para el modelo base |
| Parametros activos | 15B (MoE con 256 expertos enrutados, top-8, sin experto compartido) |
| Longitud de contexto | Aproximadamente 1.000.000 de tokens |
| Tipos de cuantizacion | Precision nativa: atencion en FP8 y expertos en MXFP4; tag 8-bit. No se incluyen variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers, custom_code) |

## Arquitectura y entrenamiento

La arquitectura es un MoE multimodal. Segun la model card, el modelo base emplea 256 expertos enrutados con activacion top-8 y sin experto compartido, y una disposicion de atencion hibrida que combina 9 capas de atencion global con 39 capas de ventana deslizante de 128 tokens. Esta combinacion busca reducir el coste de atencion en contextos muy largos (hasta aproximadamente 1M tokens) sin perder capacidad de recuperacion global. Ademas del stack de texto, incorpora un encoder de vision-lenguaje y un encoder de audio, lo que permite comprension de imagenes, video y audio.

La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base. Si se describe una cabeza de decodificacion especulativa DFlash de 5 capas con atencion de ventana deslizante, que se conserva en este bundle y que segun mediciones del autor acepta entre 2,09 y 2,39 tokens por verificacion sobre 7 borradores. Respecto a la modificacion de este repositorio concreto, el autor afirma que la eliminacion de rechazo se ha realizado a nivel de pesos y que no se publican artefactos de compliance-tuning (ni sondas, ni vectores de rechazo, ni indices de capas objetivo, ni calendarios de intensidad); el bundle contiene unicamente pesos, configuracion, tokenizer, assets y la cabeza DFlash del modelo base.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento con modo de pensamiento conmutable: soporta `enable_thinking: true` y `enable_thinking: false`.
- Comprension de vision-lenguaje: segun el autor, el encoder visual lee formas, colores y texto embebido de una imagen PNG sintetica.
- Comprension de audio: el encoder de audio resuelve de forma parcial una secuencia de tres tonos (2 de 3) segun la medicion del autor.
- Comprension de video (etiqueta video-understanding).
- Contexto largo de aproximadamente 1M tokens con etiqueta long-context.
- Soporte de agentes y tool calling (etiquetas agent y multi-token-prediction).
- Decodificacion especulativa nativa mediante la cabeza DFlash.
- Cobertura de conocimiento general: 83,41% en MMLU completo (14.042 preguntas, ranking por logits).
- Eliminacion de rechazo a nivel de pesos: 99,69% de cumplimiento en HarmBench-320 con thinking OFF y 90,94% con thinking ON.
- No se documentan capacidades de generacion de imagenes ni de sintesis de voz; el uso de audio y vision es de comprension.

## Casos de uso

- Investigacion en seguridad y alineacion: el modelo permite estudiar como se comporta un MoE de gran escala cuando se elimina el rechazo a nivel de pesos, comparando los resultados de HarmBench-320 que publica el autor (319/320 en thinking OFF frente a 291/320 en thinking ON).
- Red teaming y evaluacion de robustez: sirve como sujeto de prueba para medir la eficacia de clasificadores de contenido, ya que su tasa de cumplimiento en categorias como chemical_biological (100% thinking OFF) o cybercrime_intrusion (100% thinking OFF) es muy alta.
- Analisis de documentos largos multimodales: con ~1M tokens de contexto y encoder visual, permite procesar informes extensos con figuras y tablas en una sola pasada, por ejemplo auditoria documental o revision de contratos con anexos graficos.
- Procesamiento de video y audio para transcripcion y resumen: el encoder de audio y la etiqueta video-understanding permiten resumir material audiovisual, aunque el propio autor advierte que la resolucion de audio es parcial.
- Generacion de codigo integrada en pipelines: al soportar tool calling y agentes, puede insertarse en flujos de CI/CD para generar parches, escribir tests o revisar diffs, aunque no se publican resultados de HumanEval ni SWE-bench.
- Agentes multi-paso con recuperacion aumentada: la combinacion de contexto largo y tool calling permite mantener el estado de una tarea de varios pasos sobre una base documental grande sin truncar el historial.
- Atencion al cliente bilingue EN/ZH: cubre conversaciones multi-turno con contexto muy largo, util para soporte tecnico en organizaciones con operacion en China y mercados angloparlantes.
- Escritura creativa y de ficcion sin sobrerrechazo: para equipos que necesitan narrativa con temas adultos o conflictivos, el modelo no aplica las mismas barreras que el base, aunque esto implica asumir la responsabilidad editorial y legal del contenido generado.
- Evaluacion comparativa de tecnicas de inferencia: el bundle permite medir en la practica el rendimiento de FP8 en atencion y MXFP4 en expertos, asi como la aceleracion real de la cabeza DFlash (2,09-2,39 tokens aceptados de 7 borradores).

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los de la model card, medidos sobre este bundle concreto.

| Benchmark | Configuracion | Resultado |
|---|---|---|
| MMLU (14.042, test completo, ranking por logits) | - | 83,41% |
| HarmBench-320, compliance | thinking OFF, greedy, max_tokens 1200 | 319/320 = 99,69% |
| HarmBench-320, compliance | thinking ON, greedy, max_tokens 1500 | 291/320 = 90,94% |
| Suite de 640 sondas, rechazos duros | ambos modos | 6 (todos en thinking ON: 3 harmful, 1 copyright, 1 cybercrime, 1 misinformation) |
| Cabeza DFlash, tokens aceptados por verificacion | 7 borradores | 2,09-2,39 |

Desglose por categoria en HarmBench-320 (thinking OFF): chemical_biological 100%, copyright 100%, cybercrime_intrusion 100%, harassment_bullying 100%, harmful 94,44%, illegal 100%, misinformation_disinformation 100%.

Desglose por categoria en HarmBench-320 (thinking ON): chemical_biological 97,62%, copyright 75,00%, cybercrime_intrusion 98,08%, harassment_bullying 100%, harmful 83,33%, illegal 96,23%, misinformation_disinformation 96,30%.

No se han publicado resultados de HumanEval, GSM8K, MATH, MMMU ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 177,8 GB, por lo que los pesos en FP8/MXFP4 requieren del orden de 160-180 GB de VRAM solo para el modelo, sin contar cache KV ni activaciones. Cifra estimada a partir del tamano del repo, no confirmada por el autor.
- La cache KV para una ventana de ~1M tokens es muy costosa; en la practica conviene limitar la longitud efectiva o usar cuantizacion de cache KV, aunque la model card no documenta configuraciones recomendadas.
- No cabe en GPU de consumo. Una RTX 4090 (24 GB) o una RTX 5090 quedan muy lejos incluso con cuantizacion agresiva, y no se ofrecen variantes GGUF.
- Para despliegue en precision nativa hacen falta configuraciones multi-GPU: 2x H100 80 GB (160 GB) es el minimo teorico ajustado y probablemente insuficiente con cache KV; 4x H100 80 GB o 8x A100 80 GB son opciones mas realistas. Cifras estimadas, no verificadas.
- Opciones de despliegue confirmadas por el autor: transformers estandar, el loader MiMo V2 de vLLM y el loader MiMo V2.6 de SGLang, ambos sin parches.
- No se confirma soporte para llama.cpp, Ollama ni TGI en la informacion disponible.
- Rendimiento y latencia: no se publican cifras de throughput. La unica referencia es la cabeza DFlash, que acepta de 2,09 a 2,39 tokens por verificacion sobre 7 borradores, lo que en teoria multiplica por algo mas de 2 la velocidad de decodificacion especulativa.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|---|
| dealignai/MiMo-V2.6-Flash-RL-UNCENSORED | 159.358.725.504 (safetensors); 309B declarados para el base | 15B | ~1M | MIT | MMLU 83,41%; HarmBench-320 99,69% (thinking OFF) | Hugging Face, 0 descargas, 4 likes |
| XiaomiMiMo/MiMo-V2.6-Flash-RL (modelo base) | 309B (declarado) | 15B | ~1M | no disponible en la informacion | Rechaza por diseno en categorias de compliance; sin cifras concretas | Hugging Face |
| Otros MoE abliterated o uncensored de tamano comparable | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de terceros que permitan una comparacion cuantitativa con alternativas de la misma categoria. La unica comparacion posible con la informacion proporcionada es frente al modelo base, y se limita al comportamiento de rechazo y a los resultados de compliance publicados por el propio autor.

## Limitaciones y advertencias

- El modelo ha sido modificado para eliminar el rechazo a nivel de pesos. Genera contenido en categorias como chemical_biological, cybercrime_intrusion, illegal o misinformation_disinformation sin las barreras del modelo base, lo que supone un riesgo legal y reputacional serio si se despliega en produccion.
- Las cifras de compliance provienen del propio autor y de una metodologia de evaluacion propia (clasificador de 4 niveles sobre HarmBench-320 con decodificacion greedy). No han sido verificadas de forma independiente.
- La categoria copyright alcanza un 75% de cumplimiento en modo thinking ON, segun el autor concentrada en recuerdo literal de letras y pasajes largos: riesgo directo de reproduccion de material protegido.
- La categoria harmful alcanza un 83,33% de cumplimiento en thinking ON, con tecnicas de autolesion entre los casos: riesgo critico en aplicaciones orientadas a usuarios finales.
- Riesgo de alucinacion no cuantificado; no se publican evaluaciones de veracidad ni de factualidad mas alla de MMLU.
- Cobertura idiomatica limitada a ingles y chino. No hay datos de rendimiento en castellano ni en otros idiomas.
- El conteo de parametros del bundle (159.358.725.504) no coincide con los 309B declarados para el modelo base en la model card. Es necesario verificar la configuracion real antes de dimensionar infraestructura.
- La licencia declarada es MIT para este bundle, pero no se especifica la licencia del modelo base XiaomiMiMo, que podria imponer condiciones adicionales. Conviene revisarla antes de un uso comercial.
- No se ofrecen variantes GGUF ni cuantizaciones de menor precision, lo que dificulta el despliegue en hardware modesto.
- El autor advierte que la resolucion de audio es parcial (2 de 3 tonos en una secuencia de prueba), por lo que no es fiable para tareas de analisis de audio exigentes.
- Con 0 descargas en el momento de la consulta, no existe una comunidad de usuarios que haya validado el comportamiento del modelo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dealignai/MiMo-V2.6-Flash-RL-UNCENSORED
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL
- Web del autor: https://dealign.ai
- Cuenta del autor en X: https://x.com/dealignai
- Ko-fi del autor: https://ko-fi.com/dealignai
- No se han encontrado papers, blogs tecnicos ni repositorios adicionales en la busqueda web disponible.
