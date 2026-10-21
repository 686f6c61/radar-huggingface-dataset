# dddddsds31341/vla-adapter-nesting_3dolls-150k

## Resumen

VLA-Adapter Nesting 3 Dolls es un checkpoint de política vision-language-action (VLA) publicado por el usuario dddddsds31341 en HuggingFace, guardado en el paso de entrenamiento 150.000 de una ejecución concreta. El modelo resuelve una única tarea de manipulación robótica: anidar muñecas rusas de menor a mayor, introduciendo cada muñeca pequeña dentro de la siguiente hasta completar el conjunto. El repositorio incluye los pesos fusionados, el adaptador LoRA, la cabeza de acción, el proyector de propriocepción, los ficheros de processor/tokenizer y las estadísticas de normalización del dataset original.

Técnicamente es un modelo compacto dentro de la familia VLA: 1.252.553.792 parámetros (unos 1,25 mil millones) y un repositorio de 3,4 GB en formato safetensors. Las etiquetas del repositorio apuntan a `openvla` y `vla-adapter`, e indican que requiere código personalizado (`custom_code`) para cargarse con transformers. El pipeline declarado es `robotics` y la categoría principal es `feature-extraction`.

Su relevancia es acotada pero clara: se trata de un artefacto de investigación reproducible de un entrenamiento concreto (99 demostraciones válidas, paso 150.000), útil para estudiar adaptadores VLA de bajo coste computacional y para experimentar con transferencia a tareas de encaje y ensamblaje. No es un modelo generalista: no hay información publicada sobre licencia, idiomas soportados, ventana de contexto ni resultados de benchmarks, y el repositorio no cuenta con descargas ni valoraciones de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) con adaptador; etiquetas `openvla` y `vla-adapter`; requiere `custom_code` |
| Parametros totales | 1.252.553.792 (~1,25 mil millones) |
| Parametros activos | No aplica: no hay evidencia de arquitectura MoE en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se documentan pesos safetensors; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (la unica instruccion documentada esta en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors; incluye LoRA adapter, action head, proprio projector, processor/tokenizer y estadisticas de normalizacion |
| Paso de entrenamiento | 150.000 |
| Tarea | `nesting_3dolls` (anidar munecas rusas de menor a mayor) |
| Demostraciones | 99 validas |
| Tamano del repositorio | 3,4 GB |
| Pipeline declarado | `robotics` |

## Arquitectura y entrenamiento

La informacion disponible describe un checkpoint VLA completo con pesos fusionados mas un adaptador LoRA separado, una cabeza de accion y un proyector de propriocepcion. La presencia de estos componentes es la firma habitual de las arquitecturas VLA para manipulacion: un codificador visual procesa las imagenes de camara, un modelo de lenguaje intermedio interpreta la instruccion en lenguaje natural y la cabeza de accion traduce el estado latente en comandos motores continuos. El proyector de propriocepcion incorpora el estado de las articulaciones del robot como entrada adicional. Las etiquetas del repositorio (`openvla`, `vla-adapter`) situan la receta en el linaje de OpenVLA con un modulo adaptador, aunque no se detalla que modelo base se utilizo ni como se compone exactamente la torre visual.

No se han publicado datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones de decodificacion. Lo unico verificable es el regimen de entrenamiento: 99 demostraciones validas de la tarea `nesting_3dolls` con una instruccion textual fija ("Nest the Russian dolls from smallest to largest...") y un checkpoint guardado en el paso 150.000. Las estadisticas de normalizacion incluidas en el repositorio indican que la politica espera observaciones normalizadas con las mismas medias y desviaciones del run original, un detalle critico para reproducir el comportamiento.

## Capacidades

- Generacion de acciones motoras para manipulacion robotica de precision a partir de observaciones visuales e instrucciones en lenguaje natural.
- Ejecucion de una tarea especifica de encaje y anidamiento secuencial de objetos huecos (munecas rusas de tres cuerpos).
- Seguimiento de instrucciones en ingles para la tarea entrenada; no hay evidencia de generalizacion a otras instrucciones.
- Integracion de propriocepcion del robot mediante un proyector dedicado.
- Carga mediante transformers con codigo personalizado (`trust_remote_code`), con processor y tokenizer incluidos.
- Adaptacion mediante el adaptador LoRA incluido, lo que permite reajustes posteriores sobre los pesos fusionados.
- No hay informacion sobre tool calling, function calling, razonamiento multi-paso, capacidades multimodales de proposito general, modo thinking, audio ni vision de alta resolucion fuera del bucle de control.

## Casos de uso

- Investigacion en imitacion robótica con pocos datos: el checkpoint permite reproducir un experimento de 99 demostraciones y comparar el efecto del paso de entrenamiento (150.000) frente a checkpoints intermedios del mismo run.
- Estudio de adaptadores LoRA en politicas VLA: al incluir pesos fusionados y adaptador por separado, se puede medir la contribucion del adaptador desactivandolo o sustituyendolo por otro entrenado en una tarea distinta.
- Transferencia a tareas de ensamblaje industrial: encajar piezas huecas, apilar componentes o insertar conectores comparte estructura con el anidamiento de munecas, por lo que sirve como inicializacion para un fine-tuning con nuevas demostraciones.
- Banco de pruebas interno de politicas VLA: útil como referencia de baja capacidad (1,25 mil millones de parametros) frente a modelos mayores en experimentos de escalado.
- Docencia y laboratorios de robotica: el tamano reducido y el formato safetensors permiten desplegar el modelo en una estacion de trabajo con GPU de consumo para demostraciones de vision-language-action en vivo.
- Evaluacion de robustez ante variaciones de iluminacion, posicion inicial y oclusiones en una tarea de contacto rico, usando el checkpoint como politica base y midiendo tasas de exito.
- Reproduccion de resultados: las estadisticas de normalizacion incluidas permiten reconstruir exactamente el preprocesado del run original, lo que facilita replicar cifras antes de publicar comparaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tasas de exito, curvas de aprendizaje, metricas de error de accion ni comparaciones con otras politicas para la tarea `nesting_3dolls`.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: en torno a 2,5-3 GB solo para pesos, mas el codificador visual y las activaciones (estimacion a partir de los 1.252.553.792 parametros; no confirmada por el autor).
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 1,3-1,5 GB; en 4 bits, aproximadamente 0,7-0,9 GB (estimaciones; no se publican artefactos cuantizados).
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 para inferencia en tiempo real; A100 o H100 para evaluacion por lotes en varios entornos o para reentrenamiento.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU con 8 GB o mas en BF16, y en GPUs de 6-8 GB si se aplica cuantizacion.
- Opciones de despliegue: la via documentada es transformers con `trust_remote_code=True`; no hay informacion sobre soporte de vLLM, TGI, llama.cpp u Ollama, y la presencia de cabeza de accion y proyector de propriocepcion hace poco probable el soporte directo en servidores de texto genéricos.
- Latencia y throughput: no disponibles. En politicas VLA la frecuencia de control suele ser el factor limitante, pero no se publican mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| VLA-Adapter nesting_3dolls (este checkpoint) | 1.252.553.792 | no disponible | no disponible | HuggingFace, 0 descargas | Checkpoint de tarea unica, paso 150.000 |
| OpenVLA | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | Referenciado por la etiqueta `openvla` del repositorio |
| OpenVLA-OFT | no disponible | no disponible | no disponible | no disponible | Alternativa de fine-tuning de OpenVLA; sin datos en la informacion disponible |
| Politicas tipo Octo o pi0 | no disponible | no disponible | no disponible | no disponible | Familias VLA comparables; sin datos en la informacion disponible |

La informacion proporcionada no incluye parametros, contextos, licencias ni resultados de los modelos alternativos, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- Licencia no especificada: no se puede determinar si el uso comercial esta permitido. Tratar como no apto para produccion hasta confirmarlo con el autor.
- Especializacion extrema: entrenado para una unica tarea (`nesting_3dolls`) con 99 demostraciones; se espera un rendimiento pobre fuera de esa distribucion de objetos, camara y robot.
- Idiomas: la unica instruccion documentada esta en ingles; no hay evidencia de soporte de instrucciones en castellano ni en otros idiomas.
- Ventana de contexto no documentada, lo que impide planificar tareas de horizonte largo o con historial extenso.
- Dependencia de las estadisticas de normalizacion del run original: usar otras medias o desviaciones altera el comportamiento de la politica.
- `custom_code` implica ejecutar codigo del autor al cargar el modelo con `trust_remote_code=True`; riesgo de seguridad a auditar antes de desplegar.
- Ausencia de validacion externa: 0 descargas y 0 likes, sin resultados de benchmarks ni demos publicadas; el autor no documenta tasas de exito.
- Riesgo de alucinacion y de acciones fisicas inseguras: como politica de control, los errores se traducen en movimientos reales; se recomienda limitador de par, parada de emergencia y espacio de trabajo acotado.
- Sesgos desconocidos: no se documenta la composicion del dataset de demostraciones ni la diversidad de condiciones de captura.
- No se publican requisitos de version de transformers, pesos cuantizados ni recetas de despliegue en robot real.

## Enlaces

- HuggingFace: https://huggingface.co/dddddsds31341/vla-adapter-nesting_3dolls-150k
- Repositorio del autor: no disponible
- Paper o informe tecnico: no disponible
- Blog o demo: no disponible
