# davidan03/openwebrl-4b-selectionadm-rpo-2ep

## Resumen

OpenWebRL-4B SelectionADM RPO (2 epochs) es un ajuste fino del modelo OpenWebRL/OpenWebRL-4B-SFT, un agente web de 4.437.815.808 parametros construido sobre la arquitectura Qwen3-VL. Lo desarrolla el usuario davidan03 y su proposito es mejorar la toma de decisiones a nivel de paso en tareas de navegacion web automatizada: dado un estado de la pagina (captura de pantalla mas historial), el modelo debe seleccionar la accion correcta entre varios candidatos propuestos por el actor.

La innovacion central es el uso de RPO (Relative Preference Optimization, una variante de DPO a nivel de paso con un termino auxiliar de SFT) sobre pares de preferencia etiquetados por un modelo de decision de acciones llamado SelectionARM. Los pares se recogen en linea mientras el actor y el ADM ejecutan tareas reales, de modo que el modelo aprende de estados visitados en su propia distribucion, no de datos fuera de politica.

Segun la model card, este checkpoint es el mejor de su lote de evaluacion del 2026-11-08: alcanza un 45,1% de exito medio agregado en WebVoyager, Online-Mind2Web y DeepShop, frente al 39,4% del modelo base, con una mejora de +5,6 puntos porcentuales (IC 95% [+2,7, +8,6]). Es relevante para quien investigue agentes web con aprendizaje por preferencias a nivel de paso y para quien necesite un agente de navegacion de 4B desplegable con pesos completos en bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3-VL (tag `qwen3_vl`); vision-lenguaje para agentes web |
| Parametros totales | 4.437.815.808 (4,44B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (configurado en entrenamiento y evaluacion) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; pesos publicados en bf16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bf16, dos shards); incluye adaptador LoRA en `adapter/` |
| Modelo base | OpenWebRL/OpenWebRL-4B-SFT |
| Dataset de entrenamiento | davidan03/openwebrl-arm-onpolicy-pairs (5.206 pares train, 442 validacion) |
| Tamano del repositorio | 9,0 GB |

## Arquitectura y entrenamiento

El modelo parte de OpenWebRL-4B-SFT, un transformer vision-lenguaje de la familia Qwen3-VL con 4,44B parametros que procesa capturas de pantalla (viewport de 1280x1000) junto con el historial de acciones para emitir la siguiente accion del navegador. Sobre esa base se aplica un ajuste con LoRA de rango 16 y alpha 32, dropout 0,05, que posteriormente se fusiona en pesos completos bf16.

El objetivo de entrenamiento es RPO: DPO con beta 0,1 calculado sobre la suma de log-probabilidades de la respuesta, mas la NLL media por token de la respuesta elegida como termino auxiliar de SFT con peso 1,0. El modelo de referencia es el mismo checkpoint base con los adaptadores desactivados. Se usan 32 pares por actualizacion (2 GPUs H200 x 16 de acumulacion de gradiente), learning rate 5e-5 con 512 ejemplos de warmup y decaimiento coseno hasta 0,5x, 2 epocas equivalentes a 326 actualizaciones, semilla 42 y maximo de 32.768 tokens.

Los datos se construyen en dos pasadas de recoleccion (semillas 42 y 43) de OpenWebRL-4B-SFT + SelectionARM sobre 1.978 tareas de entrenamiento. En cada estado el actor propone candidatos, el ADM elige uno y se ejecuta; la eleccion del ADM es la respuesta preferida y un candidato hermano la rechazada. Solo se conservan estados de episodios juzgados como exitosos. El repositorio incluye el manifiesto de fusion, el adaptador LoRA original (actualizacion final 326), la configuracion exacta, las metricas por actualizacion y el codigo del entrenador.

## Capacidades

- Navegacion web automatizada multi-paso: interpreta capturas de pantalla y decide acciones (clic, escritura, scroll, navegacion) durante hasta 30 pasos por episodio.
- Razonamiento visual sobre interfaces: identificacion de elementos interactivos en viewports de 1280x1000 con una unica captura por paso.
- Seleccion de acciones entre candidatos: entrenado especificamente para puntuar y elegir entre acciones propuestas, lo que lo hace adecuado como policy de seleccion.
- Comprension de instrucciones de tarea en lenguaje natural para tareas de compra, busqueda y navegacion (WebVoyager, Online-Mind2Web, DeepShop).
- Generacion de texto y razonamiento previo a la accion (deliberacion), aunque con tendencia documentada a agotar el limite de 1.024 tokens por paso.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking explicito: no disponible; la deliberacion se observa de forma implicita en las trazas.

## Casos de uso

- Agente de navegacion web para tareas de compra: el modelo puede recorrer tiendas online, buscar productos y completar flujos de compra guiados por instrucciones, con un 50,0% de exito en DeepShop segun la evaluacion del autor.
- Automatizacion de busqueda de informacion en la web abierta: adecuado para tareas de WebVoyager (46,1% de exito) donde debe localizar datos concretos en sitios reales a partir de una instruccion.
- Evaluacion comparativa de agentes web: sirve como sistema de referencia de 4B con pesos abiertos para reproducir el protocolo de Zixian Ma (temperatura 1,0, top-p 0,9, 30 pasos, contexto de 32.768 tokens).
- Policy de seleccion en pipelines actor-critico: puede integrarse como el modulo que elige entre acciones candidatas generadas por otro modelo, el mismo rol que desempeno SelectionARM durante la recoleccion de datos.
- Investigacion en aprendizaje por preferencias a nivel de paso: el repositorio incluye el adaptador LoRA, la configuracion y el entrenador exacto, lo que permite reproducir o extender el experimento RPO con otros conjuntos de pares.
- Despliegue en infraestructura limitada: con 4,44B parametros y pesos bf16 (unos 8,9 GB), cabe en una sola GPU de 24 GB en bf16 y en GPUs de consumo tras cuantizacion, aunque esta no se distribuye en el repositorio.
- Generacion de trazas de entrenamiento: al ejecutarse junto a un ADM puede producir nuevos pares de preferencia en linea para iteraciones posteriores del ciclo de RL.

## Benchmarks y rendimiento

Protocolo del autor (2026-11-08): temperatura 1,0, top-p 0,9, 1.024 tokens nuevos por paso, 30 pasos, contexto de 32.768 tokens, una captura por paso, viewport 1280x1000. Jueces: GPT-5.6 Terra (Online-Mind2Web) y GPT-4o (WebVoyager, DeepShop).

| Sistema | WebVoyager | Online-Mind2Web | DeepShop | Media (global) | Media (solo validos) |
|---|---|---|---|---|---|
| OpenWebRL-4B-SFT (base) | 41,5 | 30,7 | 46,0 | 39,4 | 42,4 |
| Teacher SFT (rollouts de 235B) | 43,7 | 33,3 | 41,3 | 39,4 | 42,1 |
| **Este modelo** | **46,1** | **39,3** | **50,0** | **45,1** | **49,9** |

Agregado sobre las 1.045 tareas: 44,69% de exito global, +5,6 puntos sobre el modelo base (IC 95% [+2,7, +8,6]) y +4,3 sobre Teacher SFT ([+1,2, +7,4]), con bootstrap pareado por tarea. No se han publicado resultados de benchmarks estandar de LM (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 8,9 GB solo para pesos; con cache KV para 32.768 tokens de contexto y una imagen por paso, el consumo real es mayor y no esta cuantificado en la informacion disponible.
- GPU de entrenamiento usadas por el autor: 2x NVIDIA H200 con DDP y acumulacion de gradiente de 16.
- GPU recomendadas para inferencia: A100 40/80 GB, H100/H200 para lotes grandes y contexto completo; una RTX 4090 (24 GB) deberia bastar para bf16 con lote pequeno, aunque no hay medicion publicada.
- GPU de consumo: viable en RTX 4090 y previsiblemente en GPUs de 16-24 GB tras cuantizacion, pero no se distribuyen pesos cuantizados en el repositorio.
- Opciones de despliegue: vLLM o TGI para servir los safetensors bf16; llama.cpp/Ollama requeririan conversion a GGUF no publicada. El adaptador LoRA permite cargar base + adaptador con PEFT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exito web (media del lote) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (OpenWebRL-4B RPO) | 4,44B | 32.768 | 45,1 (49,9 validos) | no disponible | safetensors + LoRA en HF |
| OpenWebRL-4B-SFT | 4,44B | 32.768 | 39,4 (42,4 validos) | no disponible | checkpoint base en HF |
| Teacher SFT (rollouts de 235B) | no disponible (profesor de 235B) | no disponible | 39,4 (42,1 validos) | no disponible | no disponible |

La comparativa se limita a los sistemas incluidos en el mismo lote de evaluacion del autor; no se dispone de datos de otros agentes web abiertos en la informacion proporcionada.

## Limitaciones y advertencias

- Una sola ejecucion de evaluacion por benchmark: el propio autor indica que ejecuciones del mismo checkpoint varian en torno a 1-2 puntos agregados.
- El 2026-11-08 WebVoyager perdio tareas por una caida de Wolfram Alpha y por rate limiting de GitHub, aunque el efecto fue igual para todos los sistemas.
- El modelo alcanza el limite de 1.024 tokens por paso en aproximadamente el 12% de los episodios, frente al 1% del base, sobre todo al deliberar antes de actuar; esto puede truncar acciones en produccion.
- El conteo global de exito trata episodios invalidos (abortados, errores del juez) como fallos, lo que penaliza a todos los sistemas.
- Entrenado solo con estados de episodios exitosos: puede no cubrir bien la recuperacion tras errores.
- Licencia no declarada: no hay autorizacion explicita de uso comercial en la informacion disponible; debe consultarse con el autor antes de desplegarlo en produccion.
- Idiomas soportados no declarados; la evaluacion es en ingles sobre sitios web en ingles.
- Riesgo de alucinacion en la interpretacion de capturas y en la seleccion de elementos inexistentes; no hay evaluacion especifica de sesgos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion independiente por terceros.
- Las rutas de los scripts de lanzamiento corresponden al cluster del autor y requieren ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidan03/openwebrl-4b-selectionadm-rpo-2ep
- Dataset de pares de preferencia: https://huggingface.co/datasets/davidan03/openwebrl-arm-onpolicy-pairs
- Modelo base: https://huggingface.co/OpenWebRL/OpenWebRL-4B-SFT
- Codigo de entrenamiento (rama del autor): https://github.com/davidan03/OpenWebRL/tree/dan_dpo_b05/scripts
- Protocolo de evaluacion: https://github.com/zixianma/OpenWebRL/blob/arm/openwebrl/docs/EVAL.md
