# infinity-ai-institute/LFM2.5-24B-A2B-NVFP4

## Resumen

LFM2.5-24B-A2B-NVFP4 es una version cuantizada en NVFP4 del modelo LiquidAI/LFM2.5-24B-A2B, publicada por infinity-ai-institute. Se trata de un checkpoint de inferencia, no de un modelo entrenado desde cero: el autor ha aplicado cuantizacion NVFP4 unicamente a los expertos enrutados del bloque MoE, manteniendo en BF16 la atencion, los bloques de convolucion corta, el router, las dos capas densas, los embeddings y la cabeza LM. El resultado pasa de 45 GB en BF16 a unos 14 GB de pesos, lo que reduce drasticamente los requisitos de memoria para servir el modelo.

El modelo base es un transformer MoE hibrido de tipo "liquid" (lfm2_moe) con 24.000 millones de parametros totales y aproximadamente 2.000 millones activos por token segun la denominacion A2B. Su ventana de contexto llega a 131.072 tokens, tal y como se indica en el comando de despliegue con vLLM incluido en la model card. La cuantizacion esta pensada para GPUs Blackwell, que son las que soportan NVFP4 en hardware.

La relevancia practica de esta ficha es doble. Por un lado, el autor publica mediciones de degradacion (divergencia KL de 0,0217 nats/token y 95,3 % de coincidencia top-1 frente a BF16) y de rendimiento (4.655 tok/s con 16 peticiones concurrentes, 1,57 veces el throughput de BF16 en una B300). Por otro, el repositorio tiene cero descargas y cero likes en el momento de redactar esta ficha, por lo que se trata de una cuantizacion no validada por terceros y con la unica evidencia disponible la aportada por su propio autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida de tipo liquid (lfm2_moe) con atencion, bloques de convolucion corta, router, dos capas densas, embeddings y cabeza LM |
| Parametros totales | 24.000 millones segun la denominacion del modelo; el campo de parametros de safetensors del repo indica 12.495.969.536 (dato inconsistente con los 45 GB declarados en BF16) |
| Parametros activos | Aproximadamente 2.000 millones (denominacion A2B); no confirmado con detalle en la informacion disponible |
| Longitud de contexto | 131.072 tokens (segun el ejemplo de servicio con vLLM, `--max-model-len 131072`) |
| Tipos de cuantizacion | NVFP4 (FP4 E2M1 con una escala FP8 E4M3 por cada 16 valores) en pesos y activaciones de los expertos enrutados; BF16 en atencion, convolucion corta, router, capas densas, embeddings y LM head. Etiqueta del repo: 8-bit |
| Idiomas soportados | no disponible (no se declara en la informacion proporcionada) |
| Licencia | LFM Open License v1.0 (`lfm1.0`, identificador `license: other`); mismos terminos que el modelo base |
| Formato de pesos | safetensors (repo de 15 GB; pesos cuantizados ~14 GB frente a 45 GB en BF16) |

## Arquitectura y entrenamiento

Este checkpoint no entrena nada: hereda integramente los pesos del modelo base LiquidAI/LFM2.5-24B-A2B y solo transforma el formato numerico de una parte de ellos. El autor indica explicitamente que los unicos pesos modificados son los de los expertos enrutados, que pasan a NVFP4, y que `config.json` incorpora la configuracion de cuantizacion; el resto de pesos queda intacto. La arquitectura subyacente es una MoE de tipo liquid que combina mecanismos de atencion con bloques de convolucion corta, e incorpora un router que decide que expertos se activan en cada token. El modelo "siempre piensa antes de responder", es decir, genera una traza de razonamiento previa a la respuesta final, algo que condiciona tanto la latencia como la eleccion de `max_tokens` en produccion.

El proceso de cuantizacion se realizo con NVIDIA Model Optimizer (ModelOpt) 0.48.0rc1, usando la receta `NVFP4_EXPERTS_ONLY_CFG` con busqueda de escalas de pesos por MSE (`fp8_scale_sweep`) y calibracion "max" para activaciones. Los datos de calibracion son deliberadamente agenticos: 32 secuencias de 8.192 tokens extraidas de trayectorias de SWE-agent (nebius/SWE-agent-trajectories) y de conversaciones de tool calling y agentes interactivos (nvidia/Nemotron-Agentic-v1), renderizadas con la plantilla de chat del modelo, incluidos los esquemas de herramientas. Los contextos usados en la evaluacion posterior se excluyeron de la calibracion para evitar fuga de informacion.

## Capacidades

- Generacion de texto conversacional en formato de chat, con pipeline `text-generation` y soporte nativo en transformers.
- Razonamiento explicito en modo "thinking": el modelo genera primero una traza de razonamiento y despues la respuesta, tal y como advierte la model card.
- Tool calling y function calling: el despliegue recomendado con vLLM usa `--enable-auto-tool-choice --tool-call-parser lfm2`, con parser especifico para el formato de llamadas del modelo.
- Uso en agentes multi-paso: el autor lo evaluo con tareas de estilo tau2 (tareas de aerolinea, retail y telecomunicaciones) y con trayectorias de SWE-agent y OpenHands.
- Contexto largo: la configuracion de referencia permite servir hasta 131.072 tokens por secuencia, adecuada para trazas de agente y repositorios de codigo extensos.
- Capacidades multilingues: no disponible (no se declara el conjunto de idiomas soportados).
- Vision, audio u otras modalidades: no disponibles (el repositorio esta etiquetado como `text-generation`).

## Casos de uso

- Agentes de tool calling en produccion: con el parser `lfm2` y `--enable-auto-tool-choice`, el modelo puede encadenar llamadas a APIs externas. En las pruebas del autor obtiene 0,329 en BFCL-style (800 items), practicamente identico al 0,334 de BF16, lo que indica que la cuantizacion no degrada de forma medible esta tarea.
- Automatizacion de atencion al cliente multi-turno: las tareas de estilo tau2 (60 tareas x 2 intentos) alcanzan 0,517 de exito y 0,708 de estado final de base de datos correcto, con 131.072 tokens de contexto para arrastrar historial, pedidos y politicas de negocio sin truncar.
- Agentes de ingenieria de software: el modelo se calibro con trayectorias de SWE-agent y OpenHands, y los contextos de evaluacion tenian entre 12.000 y 30.000 tokens, por lo que encaja en flujos de reparacion de bugs y navegacion de repositorios.
- Despliegue con restricciones de memoria: al pasar de 45 GB a unos 14 GB de pesos, permite servir un MoE de 24B en una unica GPU Blackwell en lugar de requerir varios dispositivos.
- Servicio de alto throughput: con 16 peticiones concurrentes y 1.024 tokens de entrada / 512 de salida alcanza 4.655 tok/s y 3,31 ms por token de salida en una B300, con un tiempo hasta el primer token de 69 ms.
- Tutoria y resolucion de problemas matematicos: GSM8K en coincidencia estricta da 0,767 frente a 0,774 en BF16, una diferencia de 0,7 puntos, suficiente para asistentes educativos donde el razonamiento paso a paso importa mas que la latencia.
- Procesamiento de documentos largos y extraccion estructurada: la ventana de 131.072 tokens permite analizar contratos, informes o logs completos en una sola pasada manteniendo el contexto entre fragmentos.
- Pipelines de evaluacion y comparacion de cuantizaciones: el repositorio documenta la receta completa (ModelOpt, calibracion agentica, metricas KL) y sirve como referencia reproducible para equipos que quieran cuantizar sus propios MoE.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos en una NVIDIA B300 con vLLM 0.29.1rc1, sirviendo ambos modelos de la misma forma. Los deltas son pareados por item frente a BF16 con intervalos bootstrap del 95 %.

| Metrica | BF16 | NVFP4 (este) | Delta pareado |
|---|---|---|---|
| Tool calling estilo BFCL, 800 items | 0,334 | 0,329 | -0,5 pt [-3,0; +2,1] |
| Tareas de agente estilo tau2, 60 tareas x 2 intentos, exito | 0,525 | 0,517 | -0,8 pt [-8,3; +6,7] |
| tau2, estado final de base de datos correcto | 0,725 | 0,708 | -1,7 pt [-10,0; +6,7] |
| tau2, informacion requerida comunicada | 0,667 | 0,642 | -2,5 pt [-10,8; +5,8] |
| GSM8K (coincidencia estricta) | 0,774 | 0,767 | no disponible |
| Throughput de salida, 16 concurrentes, 1024 entrada / 512 salida | 2.959 tok/s | 4.655 tok/s | 1,57x |
| Tiempo por token de salida | 5,27 ms | 3,31 ms | no disponible |
| Tiempo hasta el primer token | 74 ms | 69 ms | no disponible |

Divergencia frente a BF16 medida sobre 29.646 tokens generados por BF16 en 64 contextos agenticos reservados (SWE-agent, OpenHands y trazas de uso de herramientas, con 12.000 a 30.000 tokens de contexto cada uno):

| Receta | KL (nats/token) | Coincidencia top-1 |
|---|---|---|
| BF16 sobre otra ruta de kernel (suelo de ruido) | 0,0023 | 98,5 % |
| Calibracion max de ModelOpt (por defecto) | 0,0245 | 95,0 % |
| Busqueda MSE de escalas de pesos + barrido de escalas FP8 (este checkpoint) | 0,0217 | 95,3 % |

Nota metodologica del propio autor: las cifras de tool calling y agentes proceden de un harness interno; las tareas estilo tau2 son propias (aerolinea, retail y telecomunicaciones) y no el conjunto upstream tau2-bench, y el cliente simulado lo interpreta el propio modelo evaluado. Ninguno de los deltas es distinguible de cero, y como referencia de escala, dos ejecuciones greedy identicas de BF16 discrepan en 11 de 60 tareas tau2.

## Requisitos de hardware

- VRAM para pesos: unos 14 GB en NVFP4 (15 GB de repositorio), frente a 45 GB en BF16. A ello hay que sumar la cache KV, que no se cuantiza en este checkpoint y crece de forma proporcional al contexto y al numero de secuencias concurrentes.
- GPU recomendadas: NVIDIA B300 es la plataforma usada en las mediciones del autor. Al ser NVFP4, el requisito es una GPU Blackwell (B100, B200, B300, GB200). En GPUs Hopper o Ampere no hay soporte de NVFP4 en hardware.
- GPU de consumo: teoricamente las RTX de la serie 50 (Blackwell, SM120) disponen de soporte FP4 y 32 GB de memoria, pero no hay ningun dato publicado en la informacion disponible sobre el funcionamiento de este checkpoint en esas tarjetas ni sobre el soporte de NVFP4 en vLLM para SM120.
- Despliegue: vLLM es la ruta documentada por el autor, con `--max-model-len 131072 --enable-auto-tool-choice --tool-call-parser lfm2`. La libreria declarada es transformers. No se indica soporte para llama.cpp, Ollama, TGI ni otros runtimes.
- Latencia y throughput medidos (B300, 16 concurrentes, 1024 in / 512 out): 4.655 tok/s de salida, 3,31 ms por token, 69 ms hasta el primer token.
- Ajuste de `max_tokens`: la model card advierte que el modelo siempre razona antes de responder y que en turnos de agente usaron 8.192 tokens por turno; con limites pequenos muchas respuestas terminan dentro del razonamiento y no llegan a producir la salida util.

## Comparativa con modelos similares

No se han proporcionado datos de benchmarks de modelos alternativos de la misma categoria, por lo que no es posible comparar rendimiento con terceros. La unica comparacion con datos verificables es contra el propio modelo base en BF16, usado como referencia por el autor.

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B-NVFP4 (este) | 24B totales / ~2B activos (segun denominacion) | 131.072 tokens | NVFP4 en expertos, safetensors, 14 GB | LFM Open License v1.0 | HuggingFace, 0 descargas |
| LiquidAI/LFM2.5-24B-A2B (base) | 24B totales / ~2B activos (segun denominacion) | no disponible en la informacion proporcionada | BF16, 45 GB | LFM Open License v1.0 | HuggingFace |
| Otras alternativas de tamano o tarea similares | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Cuantizacion no validada por terceros: el repositorio presenta 0 descargas y 0 likes, y toda la evidencia de calidad procede del propio autor de la cuantizacion.
- Degradacion medible aunque pequena: la divergencia KL frente a BF16 es de 0,0217 nats/token con 95,3 % de coincidencia top-1, frente al suelo de ruido de 0,0023 nats/token y 98,5 %. Es decir, la cuantizacion introduce mas diferencia que la simple variacion de kernel.
- Benchmarks con sesgo metodologico declarado: las tareas estilo tau2 son propias y no el conjunto upstream; el cliente simulado lo interpreta el modelo evaluado; los deltas tienen intervalos de confianza amplios que cruzan cero.
- No determinismo: dos ejecuciones greedy identicas del modelo BF16 discrepan en 11 de 60 tareas tau2, lo que implica que diferencias de pocos puntos en este tipo de evaluacion no son interpretables.
- Sobrecoste de razonamiento: el modelo siempre genera traza de pensamiento, lo que incrementa tokens de salida, latencia efectiva y coste por peticion. Requiere presupuestos de `max_tokens` generosos (el autor uso 8.192 por turno de agente).
- Restriccion de hardware: NVFP4 exige GPUs Blackwell. El checkpoint no es utilizable en Hopper, Ampere ni en aceleradores no NVIDIA, lo que limita su portabilidad.
- Idiomas: no se declara el conjunto de idiomas soportados, por lo que no se puede garantizar calidad fuera del ingles de los datos de calibracion.
- Sesgos y alucinacion: no hay informacion proporcionada sobre sesgos evaluados ni tasas de alucinacion. Al ser un modelo con razonamiento explicito y tool calling, existe riesgo de invocar herramientas con argumentos plausibles pero incorrectos, especialmente fuera de contexto agentico.
- Licencia: se aplica la LFM Open License v1.0 del modelo base. Los terminos concretos de uso comercial no se detallan en la informacion disponible y deben consultarse en el fichero `LICENSE` antes de un despliegue en produccion.
- Discrepancia de parametros: el campo de parametros de safetensors (12.495.969.536) no concuerda con la denominacion de 24B ni con el tamano BF16 declarado de 45 GB. Conviene verificar el inventario de pesos antes de planificar capacidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/infinity-ai-institute/LFM2.5-24B-A2B-NVFP4
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Licencia del modelo base (LFM Open License v1.0): fichero `LICENSE` del repositorio
- NVIDIA Model Optimizer (ModelOpt), herramienta de cuantizacion citada: https://github.com/NVIDIA/Model-Optimizer
- vLLM, runtime recomendado para el despliegue: https://github.com/vllm-project/vllm
- Dataset de calibracion de trayectorias de agente: https://huggingface.co/datasets/nebius/SWE-agent-trajectories
- Dataset de calibracion de tool calling y agentes interactivos: https://huggingface.co/datasets/nvidia/Nemotron-Agentic-v1
- Nota: las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los unicos enlaces utiles son los presentes en la model card del repositorio.
