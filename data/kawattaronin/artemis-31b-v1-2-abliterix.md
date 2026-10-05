# kawattaronin/Artemis-31B-v1.2-abliterix

## Resumen

Artemis-31B-v1.2-abliterix es un ajuste derivado de TheDrummer/Artemis-31B-v1.2, que a su vez es un fine-tuning de google/gemma-4-31B-it orientado a escritura creativa y roleplay. Este repositorio concreto aplica una ablacion de la direccion de rechazo (abliteration) mediante la herramienta Abliterix v1.12.2, con el objetivo de eliminar la mayor parte de las respuestas de negativa sin reentrenar los pesos. El autor del repo es kawattaronin y el modelo base declarado es google/gemma-4-31B-it.

El modelo es denso, con 31.273.086.512 parametros reales (unos 31,3 B) almacenados en safetensors, y ocupa 62,6 GB en el repositorio, lo que corresponde a pesos en bf16/fp16 sin cuantizar. Hereda de Artemis la plantilla de Gemma 4 con modos thinking y non-thinking. No se declaran licencia, idiomas ni pipeline en la ficha, y el repositorio no registra descargas ni likes en el momento de la consulta.

Su relevancia es acotada y muy especifica: se trata de una variante "decensored" de un tune ya de por si enfocado a roleplay, pensada para entornos donde se requiere reducir las negativas del modelo base. No aporta mejoras de capacidad nuevas; su interes reside en la modificacion del comportamiento de rechazo y en la metodologia reproducible de ablacion documentada en la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4, segun modelo base declarado) |
| Parametros totales | 31.273.086.512 (~31,3 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en este repo (pesos en safetensors); existe GGUF del modelo original TheDrummer/Artemis-31B-v1.2 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de la familia Gemma 4, en configuracion densa de aproximadamente 31,3 B de parametros. Este repositorio no entrena el modelo desde cero ni realiza un fine-tuning supervisado; parte de los pesos ya ajustados de TheDrummer/Artemis-31B-v1.2 y les aplica una intervencion sobre las activaciones internas.

La tecnica empleada es abliteration mediante Abliterix v1.12.2, una version de la familia de metodos que localizan y restan una direccion de rechazo en determinadas proyecciones de atencion y MLP. La model card documenta los parametros de steering capa por capa, entre ellos los coeficientes maximos y minimos y las distancias de posicion para attn.k_proj, attn.q_proj, attn.v_proj, attn.o_proj y mlp.down_proj. Como metrica de control, el autor reporta una divergencia KL de 0,1633 respecto al modelo original (que por definicion es 0) y una reduccion de rechazos de 97/100 a 13/100. No se detallan tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO en este repositorio.

## Capacidades

- Generacion de texto y escritura creativa de formato largo, con enfasis en prosa inmersiva y dialogo segun la documentacion heredada de Artemis.
- Roleplay conversacional multi-turno, con seguimiento de personaje y de detalles de la trama a lo largo de la conversacion.
- Modo thinking y modo non-thinking, segun la plantilla de Gemma 4 descrita en la model card del tune original.
- Tool calling y uso general: la model card de Artemis indica que las llamadas a herramientas y el uso generalista se mantienen intactos tras el tune.
- Razonamiento dentro del bloque think, con recuperacion de detalles de la tarjeta de personaje sin mezclarlos entre si segun los testimonios citados.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Comportamiento decensored: se reduce fuertemente la tasa de rechazos (13/100 frente a 97/100 del original), lo que amplia el rango de tematicas que el modelo acepta abordar.

## Casos de uso

- Escritura creativa asistida: el modelo puede generar narrativa y prosa de formato largo; su tune de origen esta optimizado para estilo inmersivo y dialogo con voz humana, lo que lo hace adecuado para borradores de ficcion.
- Roleplay y chatbots de personaje: gracias al seguimiento de personaje y de trama descrito (adherencia a escenario a 20k y seguimiento a ~32k), sirve para construir asistentes conversacionales con personalidad persistente.
- Generacion de dialogos para guiones o videojuegos: puede producir conversaciones multi-turno coherentes con un personaje definido, reduciendo la necesidad de reescritura manual.
- Red teaming y evaluacion de seguridad: al ser una variante abliterated con metricas de rechazo documentadas, es util como objeto de estudio para medir comportamiento de modelos sin alineamiento de rechazo.
- Investigacion sobre abliteration: los parametros de steering publicados y las metricas de KL y rechazos permiten reproducir y comparar el efecto de la ablacion sobre las capas de atencion y MLP.
- Prototipado de asistentes generalistas sin censura: mantiene tool calling y uso generalista segun la ficha de Artemis, por lo que puede integrarse en flujos que requieran function calling en entornos controlados.
- Analisis de coherencia en contexto largo: los testimonios citados mencionan un "handoff" limpio a 100k, lo que sugiere uso en tareas de continuidad narrativa prolongada, aunque la longitud de contexto oficial no esta confirmada.

## Benchmarks y rendimiento

La model card solo aporta dos metricas comparativas; no se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Metrica | Este modelo (abliterix) | Modelo original (TheDrummer/Artemis-31B-v1.2) |
|---|---|---|
| Divergencia KL | 0,1633 | 0 (por definicion) |
| Rechazos | 13/100 | 97/100 |

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 62,6 GB de pesos, mas overhead de activaciones y cache KV, por lo que requiere multiples GPU o una GPU de 80 GB con cuantizacion ligera.
- VRAM estimada en 8 bits: alrededor de 31-35 GB.
- VRAM estimada en 4 bits: alrededor de 16-20 GB; es el rango que puede caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con cuantizacion.
- GPU recomendadas: A100 80 GB o H100 80 GB para bf16; para cuantizacion de 4 u 8 bits bastan tarjetas consumer de 24 GB.
- Cabe en consumer GPU: si, en configuraciones cuantizadas (4 bits) sobre GPU de 24 GB; en 8 bits de forma ajustada.
- Opciones de despliegue: vLLM, TGI y llama.cpp/Ollama. Para llama.cpp y Ollama se necesita un GGUF; el repositorio de este modelo solo contiene safetensors, aunque existe GGUF del modelo original en bartowski/TheDrummer_Artemis-31B-v1.2-GGUF (los propios testimonios citan ejecucion del Artemis original a q3ks).
- Latencia y throughput estimados: no disponibles. No se aportan datos de hardware ni de rendimiento de inferencia en este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento / comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kawattaronin/Artemis-31B-v1.2-abliterix | 31,3 B | no disponible | 13/100 rechazos, KL 0,1633 frente al original | no disponible | safetensors en HF |
| TheDrummer/Artemis-31B-v1.2 | 31,3 B (misma base) | no disponible | 97/100 rechazos; referencia de rendimiento | no disponible | safetensors y GGUF |
| google/gemma-4-31B-it | 31 B (familia) | no disponible | modelo base instruct; sirve de referencia | no disponible | safetensors en HF |

No se dispone de datos de benchmarks comunes (MMLU, HumanEval, etc.) ni de modelos abliterated equivalentes con los que comparar rendimiento de forma cuantitativa en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan, pero al ser una ablacion de rechazo el modelo puede responder a solicitudes que el original denegaba; conviene auditar el comportamiento antes de cualquier uso productivo.
- Riesgo de alucinacion: no medido en la informacion proporcionada. Un tune de roleplay con foco en estilo puede priorizar coherencia narrativa sobre exactitud factual.
- Limitaciones de contexto o idioma: la longitud de contexto oficial y los idiomas soportados no estan declarados. Los testimonios citados mencionan funcionamiento a 20k y ~32k, con un caso puntual a 100k, pero son opiniones de usuarios y no especificaciones tecnicas.
- Restricciones de licencia para uso comercial: la licencia no esta disponible en la ficha; al derivar de google/gemma-4-31B-it, es probable que herede las condiciones de uso de Gemma, pero esto no se confirma en el repositorio. Se debe verificar antes de cualquier uso comercial.
- Caveat de produccion: el repositorio registra 0 descargas y 0 likes, sin pipeline declarado; es un artefacto muy reciente y sin validacion externa publicada.
- La ablacion implica un compromiso: la divergencia KL de 0,1633 frente al original indica un cambio medible en la distribucion de salida, que puede afectar a capacidades distintas de las relacionadas con el rechazo.
- No se ofrecen metricas de rendimiento de inferencia (latencia, throughput) ni configuraciones recomendadas de despliegue para este repositorio concreto.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/kawattaronin/Artemis-31B-v1.2-abliterix
- Modelo original del que deriva: https://huggingface.co/TheDrummer/Artemis-31B-v1.2
- Modelo base declarado: https://huggingface.co/google/gemma-4-31B-it
- Herramienta de ablacion Abliterix: https://github.com/wuwangzhang1216/abliterix
- GGUF del modelo original: https://huggingface.co/bartowski/TheDrummer_Artemis-31B-v1.2-GGUF
- Discord citado en la model card: https://discord.gg/BeaverAI
- Patreon citado en la model card: https://www.patreon.com/TheDrummer
- Enlaces del autor del tune original: https://linktr.ee/thelocaldrummer
