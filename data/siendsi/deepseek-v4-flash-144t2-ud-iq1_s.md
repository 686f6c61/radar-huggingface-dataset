# siendsi/DeepSeek-V4-Flash-144t2-UD-IQ1_S

## Resumen

DeepSeek-V4-Flash-144t2-UD-IQ1_S es una compilacion podada del modelo DeepSeek-V4-Flash-0731, publicada por el usuario siendsi en HuggingFace. No se trata de un fine-tune ni de una destilacion, sino de un pruning de expertos (MoE expert pruning) aplicado capa por capa sobre 43 capas MoE: de los 256 expertos de cada capa se conservan los 144 mas activados y se desactivan los 112 restantes. El resultado pasa de 82,4 GB a 47,0 GB, una reduccion del 43,1 %, manteniendo intactos bit a bit todos los pesos no-expertos y los expertos conservados respecto al checkpoint original UD-IQ1_S.

El modelo se distribuye en formato GGUF con cuantizacion UD-IQ1_S (Unsloth dynamic quant) y esta pensado para ejecutarse con llama.cpp. Su objetivo declarado es ofrecer la variante mas pequena y economica de la familia, orientada a un perfil concreto: ruso, ingles, codigo, planificacion y tareas agenticas. La calibracion del mapa de calor se ajusto especificamente a ese perfil e incluyo un corpus de matematicas, descartando el corpus original con japones y chino.

Es relevante ahora porque demuestra una via practica para reducir el coste de despliegue de modelos MoE de gran tamano sin reentrenar ni recuantizar, aunque el propio autor advierte que esta es la variante "al limite de la calidad aceptable": pierde convergencia en dos tareas de razonamiento largo y de uso de multiples herramientas, por lo que recomienda la variante keep-160 (51 GB) como punto de equilibrio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer, arquitectura `deepseek4` segun llama.cpp |
| Parametros totales | 163.116.228.311 (≈163 B) medidos sobre safetensors del modelo base; el recuento efectivo tras el pruning de expertos no esta disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible; los ejemplos de uso emplean 32.768 tokens y el autor indica que no se han probado a fondo contextos superiores a 32k |
| Tipos de cuantizacion | UD-IQ1_S (Unsloth dynamic quant), heredada sin cambios del checkpoint base |
| Idiomas soportados | ruso (ru), ingles (en) |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | GGUF, multi-shard (3 archivos: shard 00001 de 5,0 MB, shard 00002 de 27,5 GB, shard 00003 de 18,5 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE) identificado como `deepseek4` en llama.cpp. El modelo consta de 43 capas MoE y 256 expertos por capa. Una particularidad relevante es que los identificadores de experto de DeepSeek-V4 son por capa: el experto N de la capa 0 no tiene relacion con el experto N de la capa 3 (0 de 256 compartidos), por lo que un mapa global de top-K de expertos carece de sentido y el pruning debe realizarse de forma independiente en cada capa.

No hay entrenamiento adicional: el proceso aplicado es exclusivamente pruning de expertos. Para cada una de las 43 capas MoE se conservan los 144 expertos con mayor numero de activaciones segun un mapa de calor de calibracion, y se desactivan los 112 menos usados. El corpus de calibracion se ajusto a un perfil objetivo compuesto por ruso, ingles, codigo, planificacion y tareas agenticas, mas un corpus de matematicas (considerado critico para tareas de razonamiento y agenticas). El corpus de calibracion original, que incluia japones y chino, no se utilizo porque podaba expertos relevantes para el perfil objetivo. La cuantizacion permanece identica a la del checkpoint base UD-IQ1_S, de modo que los pesos conservados son bit-identicos al original. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo base, ya que no se detalla en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en ruso e ingles.
- Generacion y comprension de codigo dentro del perfil de calibracion (code, devops).
- Tareas de NLP y de sistema operativo (OS) con respuestas cortas y deterministas, donde el autor reporta paridad con el modelo original.
- Razonamiento matematico de un solo paso o de pocos pasos; el razonamiento matematico multi-paso (multi_hop_math) no converge.
- Planificacion y tareas agenticas: el modelo esta calibrado para planificacion, pero la tarea agentica multi-herramienta (multi_tool) no converge en esta variante, aunque si funciona en keep-160.
- Soporte de tool calling / function calling: se evalua implicitamente en la bateria A/B mediante la tarea multi_tool, con la limitacion indicada.
- Razonamiento multi-step en tareas cortas; las tareas largas con autocorreccion son el punto debil declarado.
- Capacidades multilingues limitadas a ruso e ingles; el comportamiento fuera de perfil (japones, chino) puede degradarse.
- No se menciona soporte de vision, audio ni modo de pensamiento explicito en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada en ruso o ingles: el modelo gestiona conversaciones multi-turno con una ventana de trabajo de 32.768 tokens, adecuada para historiales de soporte de longitud media, y su calibracion en ruso cubre un nicho poco atendido por modelos occidentales.
- Asistentes de codigo en produccion: genera fragmentos de codigo y resuelve tareas de devops con paridad respecto al original, por lo que puede integrarse en pipelines de CI/CD o en editores como completado y revision de parches, siempre que las tareas sean cortas y deterministas.
- Clasificacion y extraccion de informacion en NLP: tareas de etiquetado, resumen corto o extraccion estructurada que no requieren cadenas largas de razonamiento, donde el autor confirma paridad con el checkpoint completo.
- Automatizacion de tareas de sistema operativo: diagnostico de errores, generacion de comandos de shell y explicacion de trazas, dentro del perfil OS evaluado en la bateria A/B.
- Despliegue en hardware limitado o en CPU: con 47 GB en GGUF e IQ1_S puede ejecutarse con llama.cpp en una maquina con suficiente RAM y mmap, sin necesidad de un cluster de GPU, lo que lo hace util para prototipos, entornos de investigacion con presupuesto reducido o despliegue on-premise con GPUs de 48 GB.
- Agentes de un solo paso con herramientas: invocacion de funciones sencillas y encadenamiento corto, evitando planificaciones largas con multiples herramientas, que es precisamente el escenario donde esta variante falla en converger.
- Evaluacion comparativa de tecnicas de pruning: sirve como referencia empirica para investigar el impacto del pruning de expertos por capa en modelos MoE de gran tamano, comparando contra keep-160 y keep-192 con la misma bateria de 26 tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente proporciona una comparacion A/B contra el checkpoint original UD-IQ1_S sobre una bateria de 26 tareas del perfil objetivo (code, devops, multi-hop, OS, NLP, agent).

| Metrica | keep-144 (esta variante) | keep-160 | keep-192 | Original UD-IQ1_S |
|---|---|---|---|---|
| Tareas en paridad (bateria de 26) | 23/26 | 24/26 | no disponible | referencia |
| multi_hop_math | no converge | no converge | no disponible | converge |
| multi_tool (agentico multi-herramienta) | no converge | converge | no disponible | converge |
| Tamano | 47,0 GB | 51,0 GB | 60,0 GB | 82,4 GB |

El autor precisa que las tareas que fallan no producen respuestas incorrectas, sino que simplemente no terminan de converger.

Rendimiento de velocidad medido con llama.cpp y `-t 8`:

| Metrica | Original (82,4 GB) | keep-192 (60 GB) | Variacion |
|---|---|---|---|
| Procesamiento de prompt (prefill) | 8,7 tok/s | 10,3 tok/s | +18 % |
| Generacion | 4,05 tok/s | 3,65 tok/s | −10 % (dentro del ruido) |
| Tiempo total (409 prompt + 200 gen) | 96,5 s | 94,6 s | ≈ paridad |

Las cifras corresponden a keep-192, no a keep-144; el autor espera que keep-144 sea similar o ligeramente mejor en prefill, al tener menos pesos de expertos que cargar. La generacion se mantiene aproximadamente igual porque el numero de expertos activos por token (top-k) no cambia.

## Requisitos de hardware

- VRAM/RAM: el repositorio ocupa 47,0 GB; para descarga completa en GPU se necesitan aproximadamente 47-50 GB de VRAM solo para los pesos, mas el espacio de la cache KV, cuyo tamano exacto no esta disponible. Al ser un GGUF con mmap, es viable mantener los pesos en disco o RAM de sistema y descargar a GPU solo las capas necesarias.
- GPU recomendadas: A100 80 GB o H100 80 GB para descarga completa y margen de cache KV; tarjetas de 48 GB (A6000, L40S) quedan muy ajustadas con 47 GB de pesos. No cabe entera en ninguna GPU de consumo.
- GPU de consumo: no cabe en RTX 4090, 4080 ni similares (24 GB o menos). Es posible ejecutarla con offload parcial de capas a la GPU y el resto en RAM de sistema, o directamente en CPU.
- Opciones de despliegue: llama.cpp es la via soportada explicitamente, tanto con `llama-server` como con `llama-cli`, apuntando al shard 00001 (llama.cpp carga los demas automaticamente). Al ser GGUF, es compatible con el ecosistema habitual de llama.cpp, incluidas herramientas que lo envuelven. No se menciona soporte de vLLM, TGI ni Ollama en la informacion proporcionada.
- Invocacion recomendada por el autor: `llama-server -m DeepSeek-V4-Flash-0731-UD-IQ1_S-00001-of-00003.gguf -c 32768 -t 8 -fa on --load-mode mmap --port 8088`.
- Latencia y throughput: en la medicion de referencia con 8 hilos, aproximadamente 10,3 tok/s de prefill y 3,65 tok/s de generacion, con 94,6 s para 409 tokens de prompt mas 200 de generacion. Son cifras propias de inferencia en CPU o con offload parcial, no de descarga completa en GPU.

## Comparativa con modelos similares

| Modelo | Tamano | Expertos conservados | Paridad A/B (26 tareas) | Licencia | Estado |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-144t2-UD-IQ1_S (este) | 47,0 GB | 144/256 por capa | 23/26 | MIT | Variante mas pequena, "al limite" |
| siendsi/DeepSeek-V4-Flash-160t2-UD-IQ1_S | 51,0 GB | 160/256 por capa | 24/26 | MIT | Opcion recomendada por el autor |
| siendsi/DeepSeek-V4-Flash-192t2-UD-IQ1_S | 60,0 GB | 192/256 por capa | no disponible | MIT | Margen de seguridad mas amplio |
| DeepSeek-V4-Flash-0731 (UD-IQ1_S original) | 82,4 GB | 256/256 por capa | referencia | MIT | Sin podar |

No se dispone en la informacion proporcionada de comparaciones con modelos de otras familias de tamano o categoria equivalente.

## Limitaciones y advertencias

- Calidad al limite: el propio autor describe esta variante como la mas profunda de la familia y situada "al borde de la calidad aceptable". No es la opcion recomendada si hay espacio para keep-160.
- Fallo de convergencia en razonamiento largo: la tarea multi_hop_math no converge, igual que en keep-160.
- Fallo de convergencia en agentes multi-herramienta: la tarea multi_tool no converge en esta variante, aunque si funciona en keep-160. Esto limita el uso en flujos agenticos complejos.
- Cuantizacion extremadamente agresiva: UD-IQ1_S es una cuantizacion de la clase de 1 bit, con la perdida de precision asociada frente a pesos completos o cuantizaciones de mayor rango.
- Riesgo de alucinacion: no se documenta mitigacion especifica ni evaluacion de veracidad; al ser un modelo podado y de baja precision, el riesgo de respuestas plausibles pero incorrectas en tareas fuera del perfil es relevante.
- Degradacion fuera de perfil: el modelo no esta optimizado para japones ni chino; el corpus de calibracion original con esos idiomas se descarto deliberadamente y su rendimiento en ellos puede ser peor que en el modelo base.
- Contexto no verificado: no se han probado a fondo contextos superiores a 32k, pese a que la arquitectura podria soportarlos.
- Idiomas limitados: solo ruso e ingles estan declarados; no hay evaluacion multilingue mas amplia.
- Licencia: MIT, heredada del modelo base, lo que permite uso comercial sin restricciones adicionales segun los terminos declarados; conviene verificar la licencia del modelo base original antes de un despliegue en produccion.
- Procedencia y validacion: el autor es siendsi, no DeepSeek; el repositorio registra 0 descargas y 0 likes, por lo que no existe validacion independiente ni resultados reproducidos por terceros.
- Metodo no reversible: es un pruning estructural, no una recuantizacion ni una destilacion de bajo rango; los expertos desactivados no pueden recuperarse sin volver al checkpoint original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/siendsi/DeepSeek-V4-Flash-144t2-UD-IQ1_S
- Variante recomendada keep-160 (51 GB, 24/26): https://huggingface.co/siendsi/DeepSeek-V4-Flash-160t2-UD-IQ1_S
- Variante keep-192 (60 GB, mayor margen): https://huggingface.co/siendsi/DeepSeek-V4-Flash-192t2-UD-IQ1_S
- Modelo base DeepSeek-V4-Flash-0731: no disponible (referenciado en la model card sin URL)
- Proyecto glm-pruning (documento `DSV4_PRUNING_FINAL.md`, scripts `tools/build_dsv4_prune_config_perlayer.py` y `tools/heat_target.py`): no disponible (referenciado sin URL)
- Paper, blog o demo oficial: no disponible en la informacion proporcionada
