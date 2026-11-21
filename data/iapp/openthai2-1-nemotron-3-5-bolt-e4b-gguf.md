# iapp/OpenThai2.1-Nemotron-3.5-Bolt-E4B-GGUF

## Resumen

OpenThai 2.1 Bolt E4B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 7.463.013.674 parametros totales y aproximadamente 4.000 millones de parametros activos por token (la nomenclatura "E4B" indica expertos activos de 4B). Lo desarrolla iApp Technology junto con AIEAT y forma parte del linaje OpenThai, orientado a un ajuste fino del modelo base NVIDIA Nemotron 3.5 Bolt E4B (BF16). Esta distribucion concreta en GGUF esta pensada para su uso en llama.cpp y como modelo de arranque del agente ChindaBot.

El modelo cubre tareas de generacion de texto conversacional y razonamiento en tailandes e ingles, con soporte de tool calling, modo de razonamiento (thinking) activable por peticion y un proyector multimodal (imagen y audio) heredado del modelo base. La segunda revision (15 de noviembre de 2026) reentrena con verificacion programatica de respuestas de matematicas y seguimiento de instrucciones, ademas de anadir respuestas de codigo en ingles que pasan tests unitarios.

Su relevancia actual radica en que ofrece un modelo tailandes de peso abierto, con cuantizaciones listas para CPU y GPU de consumo, y con resultados de benchmarks publicados tanto para BF16 como para Q4_K_M y Q8_0, lo que permite evaluar con rigor el coste de la cuantizacion. Los pesos BF16 no estan publicados todavia; solo las versiones GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer; linaje Gemma 4 / Nemotron 3.5 Bolt (segun tags del autor) |
| Parametros totales | 7.463.013.674 |
| Parametros activos | aproximadamente 4.000 millones (denominacion E4B) |
| Longitud de contexto | 32.768 tokens (configuracion de ChindaBot con `--ctx-size 32768`); valor maximo nativo no disponible |
| Tipos de cuantizacion | Q4_K_M (5,30 GB), Q8_0 (7,97 GB); proyector multimodal F16 (0,99 GB) |
| Idiomas soportados | tailandes (th), ingles (en) |
| Licencia | OpenMDW 1.1 (`openmdw-1.1`) |
| Formato de pesos | GGUF (llama.cpp); BF16 no publicado |

## Arquitectura y entrenamiento

El modelo parte de NVIDIA Nemotron 3.5 Bolt E4B (BF16) y es un ajuste fino sobre el mismo. La arquitectura es un transformer con capas de mezcla de expertos (MoE), con 7.463.013.674 parametros totales y un subconjunto activo de aproximadamente 4.000 millones por token. Los tags del autor apuntan a un linaje Gemma 4 combinado con Nemotron, pero la model card no detalla la composicion exacta de capas, el numero de expertos ni el mecanismo de enrutamiento.

El entrenamiento de la segunda revision introduce verificacion programatica: las respuestas de matematicas y de seguimiento de instrucciones se conservan solo si un programa las valida, y se anaden respuestas de codigo en ingles que superan tests unitarios. No se especifica el volumen de tokens de entrenamiento, la composicion del dataset ni si se empleo RLHF o DPO; esos datos figuran como no disponibles en la model card. Entre las innovaciones operativas destaca el control explicito del modo de razonamiento: la plantilla de chat permite activar thinking por peticion mediante `chat_template_kwargs`, devolviendo la traza en `reasoning_content` y la respuesta final en `content`. El proyector multimodal `mmproj` heredado del base permite procesar imagen y audio.

## Capacidades

- Generacion de texto conversacional multi-turno en tailandes e ingles.
- Razonamiento con modo thinking activable por peticion (traza separada de la respuesta).
- Matematicas basicas y de nivel escolar, con respuestas verificadas programaticamente en el entrenamiento (por ejemplo, calculo de cambio: 100 baht menos 7 boligrafos a 12 baht = 16 baht).
- Generacion de codigo en ingles, con respuestas de entrenamiento filtradas por tests unitarios.
- Tool calling / function calling: seleccion de herramienta y argumentos correctos (probado con clima, calculadora y listado de festivos).
- Capacidades de agente y razonamiento multi-paso con resultados de herramientas reinyectados.
- Vision: descripcion de formas y colores en imagenes y lectura de recibos impresos en ingles, consultados en tailandes.
- Audio: proyector compatible con audio segun la model card (sin pruebas detalladas publicadas).
- Seguimiento de instrucciones de formato (IFEval-TH): respuestas con limite de lineas y correos electronicos con marcadores de posicion.
- Multilingue limitado a th y en; no hay evidencia de otros idiomas.

## Casos de uso

- Atencion al cliente en tailandes: gestion de conversaciones multi-turno con hasta 32.768 tokens de contexto, adecuado para historiales de incidencia largos y respuestas con marcadores de posicion para datos dinamicos.
- Agente con herramientas en produccion: el modelo elige herramienta y argumentos de forma fiable (16 de 16 casos en la prueba del autor), por lo que puede integrarse en pipelines de consulta de clima, calculo o calendario con reinyeccion del resultado.
- Automatizacion de correo y comunicaciones internas: genera correos en tailandes con campos pendientes de rellenar, apropiado para flujos de RR. HH. como solicitudes de baja.
- Extraccion de datos de recibos y documentos: con el proyector `mmproj` lee recibos impresos en ingles y responde en tailandes con totales e items, util para digitalizacion de gastos.
- Educacion y explicaciones divulgativas: produce respuestas breves y acotadas por instrucciones (por ejemplo, explicar IA frente a aprendizaje automatico en cinco lineas) para asistentes escolares.
- Razonamiento con verificacion: activando thinking por peticion, resuelve calculos aritmeticos con traza auditable en `reasoning_content`, util para tareas donde se requiere revisar el razonamiento.
- Despliegue en CPU y equipos sin GPU: la version Q4_K_M (5,30 GB) corre en llama.cpp solo con CPU (32 hilos probados), lo que habilita entornos de borde o estaciones de trabajo sin acelerador.

## Benchmarks y rendimiento

Resultados del autor con thinking off y decodificacion greedy. Los GGUF se ejecutaron en llama.cpp b12242 (CPU) y el BF16 en vLLM v0.31.0, por lo que las diferencias incluyen el cambio de motor.

| Benchmark (n) | Q4_K_M | Q8_0 | BF16 |
|---|---|---|---|
| ThaiExam (565) | 65,5 (Δ −1,75; SE 1,46) | 68,1 (Δ +0,87; SE 0,78) | 67,3 |
| OpenThaiEval (1.232) | 66,5 (Δ −1,54; SE 0,91) | 67,3 (Δ −0,73; SE 0,31) | 68,0 |
| IFEval-TH (215) | 79,1 (Δ −0,47; SE 1,04) | 79,5 (Δ 0,00; SE 0,66) | 79,5 |

Comparacion con el modelo base (mismo proceso de cuantizacion Q4_K_M): 65,2 en ThaiExam, 66,2 en OpenThaiEval y 77,7 en IFEval-TH; la diferencia de este modelo frente al base es de +0,31 (SE 1,23), +0,32 (SE 0,66) y +1,40 (SE 1,54), respectivamente.

Pruebas de humo en llama.cpp b12242, CPU, 32 hilos, greedy, thinking off salvo indicacion: identificacion correcta como OpenThai 2.1 Bolt E4B (65 tokens, 2,6 s); capital de Japon "Tokio" (5 tokens, 0,3 s); correo de baja en tailandes (283 tokens, 11,0 s); explicacion IA frente a ML en cinco lineas (125 tokens, 5,1 s); calculo de cambio con thinking on (16 baht, traza separada, 299 tokens, 12,0 s). No aparecieron marcadores de plantilla de chat en ninguna respuesta. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM para inferencia: Q4_K_M requiere aproximadamente 5,30 GB de pesos; Q8_0 aproximadamente 7,97 GB; anadir 0,99 GB si se usa el proyector multimodal F16. El KV cache y el contexto de 32.768 tokens incrementan el consumo segun la implementacion.
- GPU recomendadas: no especificadas por el autor; por tamano, Q4_K_M encaja en GPU de consumo con 8 GB o mas de VRAM (por ejemplo, RTX 3060 8 GB, RTX 4060 Ti 8 GB) y con holgura en RTX 4090 (24 GB) o A100/H100. Q8_0 requiere al menos 8-10 GB de VRAM o uso en CPU.
- Cabe en GPU de consumo: si, con Q4_K_M en tarjetas de 8 GB o superior; Q8_0 en 12 GB o superior.
- Opciones de despliegue: llama.cpp (probado con build b12242, `llama-server` con `--jinja --reasoning off -c 8192`); vLLM solo para BF16 (no publicado); Ollama y TGI no estan confirmados por el autor.
- Latencia y throughput: medidos en CPU (32 hilos, greedy): 0,3 s para 5 tokens, 2,6 s para 65 tokens, 5,1 s para 125 tokens, 11,0 s para 283 tokens y 12,0 s para 299 tokens. No hay cifras de throughput en GPU publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmarks clave | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenThai 2.1 Bolt E4B (este) | 7,46 B totales / ~4 B activos | 32.768 (config probada) | ThaiExam 67,3; OpenThaiEval 68,0; IFEval-TH 79,5 (BF16) | OpenMDW 1.1 | GGUF Q4_K_M y Q8_0; BF16 no publicado |
| NVIDIA Nemotron 3.5 Bolt E4B (base) | 7,46 B totales / ~4 B activos | no disponible | Q4_K_M: 65,2 / 66,2 / 77,7 | no disponible en la informacion | BF16 en `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16` |
| Primera release de OpenThai 2.1 Bolt E4B | 7,46 B totales / ~4 B activos | no disponible | Q4_K_M: 65,5 / 66,2 / 78,6 | OpenMDW 1.1 | revision `c9c3fedf...` |

No se dispone de datos de terceros modelos tailandeses comparables en la informacion proporcionada; esa comparativa figura como no disponible.

## Limitaciones y advertencias

- Pesos BF16 no publicados: solo existen GGUF, lo que limita el uso con vLLM u otros motores que requieren safetensors.
- Diferencias de cuantizacion: Q4_K_M pierde entre 0,47 y 1,75 puntos frente a BF16 en los tres benchmarks; Q8_0 pierde hasta 0,73 puntos en OpenThaiEval. Ninguna diferencia alcanza el doble del error estandar salvo la caida de Q8_0 en OpenThaiEval, pero el margen existe.
- Riesgo de alucinacion: no se documenta una evaluacion especifica de factualidad; las respuestas de matematicas e instrucciones solo estan verificadas en el conjunto de entrenamiento, no en inferencia.
- Sesgos: no se publica analisis de sesgos; el dominio de entrenamiento esta concentrado en tailandes e ingles, con posible infrarrepresentacion de variedades dialectales tailandesas y de otros idiomas.
- Contexto: la configuracion probada es de 32.768 tokens; el maximo nativo no esta documentado y contextos mayores pueden degradar calidad.
- Licencia OpenMDW 1.1: licencia de peso abierto con terminos propios; deben revisarse las condiciones antes de uso comercial. La model card usa `license: other` con `license_name: openmdw-1.1`.
- Modo thinking: sin `--reasoning off`, llama-server activa thinking por defecto con esta plantilla, lo que anade latencia y tokens; en produccion conviene desactivarlo globalmente y activarlo por peticion.
- Requiere `--jinja` para aplicar la plantilla de chat propia; sin ese flag el formato de conversacion puede romperse.
- Proyector multimodal: heredado del base y solo probado en dos imagenes; no hay evaluacion sistematica de vision ni de audio.
- ChindaBot fijaba la primera release al subirse esta revision; conviene verificar revision y checksum al desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iapp/OpenThai2.1-Nemotron-3.5-Bolt-E4B-GGUF
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Assets de la model card: https://huggingface.co/datasets/iapp/OpenThai2.0-model-card-assets
- Revision primera release: `c9c3fedf1f6b987a7f489b4a58ddaffc7c9570fa` (descargable con `--revision` en `hf download`)
- llama.cpp: no disponible en la informacion proporcionada como enlace directo; build probada b12242
- ChindaBot: mencionado como agente de arranque; no se proporciona URL en la informacion disponible
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
