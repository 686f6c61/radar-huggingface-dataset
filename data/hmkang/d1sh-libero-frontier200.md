# hmkang/d1sh-libero-frontier200

## Resumen

d1sh-libero-frontier200 es un checkpoint de ajuste fino supervisado (SFT) publicado por el usuario hmkang sobre el modelo base LiquidAI/d1-3B. No se trata de un modelo de lenguaje generalista, sino de un adaptador LoRA orientado a robótica: convierte al modelo base en un operador de visión-lenguaje-acción (VLA) capaz de responder a la "pregunta de acción" del framework d1-showharness emitiendo uno de 15 tokens discretos de acción (seis variantes MV_*, seis RT_*, GRASP, RELEASE y DONE). El escenario concreto es la manipulación pick-and-place del benchmark LIBERO.

El entrenamiento se realizó sobre el dataset hmkang/frontier-200, compuesto por 200 rollouts exitosos de LIBERO (20 tareas x 10 repeticiones, con 8 tareas de libero_spatial, 8 de libero_object y 4 de libero_goal) grabados mediante Show-Harness GUMI con un VLM (Claude Sonnet) actuando como operador, lo que suma 14.445 filas de entrenamiento. El checkpoint recomendado por el autor es el epoch 4 del adaptador LoRA, seleccionado por tener la menor NLL de validación (0,7728), lo que lo convierte en el punto de partida más calibrado para un posterior entrenamiento por refuerzo.

Su relevancia es acotada pero específica: demuestra una receta reproducible para convertir un modelo base de 3B parámetros en una política de acciones discretas para robótica de manipulación, con código público y métricas por época sobre un split de validación de episodios completos. No es un modelo para uso conversacional ni para despliegue general, y su licencia hereda las restricciones del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre LiquidAI/d1-3B (modelo base de tipo vision-language; arquitectura interna del base no detallada en la informacion disponible) |
| Parametros totales | No disponible (el adaptador LoRA se distribuye como pesos PEFT; el base es de 3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos se cargan en bfloat16 segun el codigo de ejemplo) |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 (heredada de LiquidAI/d1-3B); el campo de licencia del repo indica lfm1.0-and-apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA/PEFT, subcarpeta d1-3b-lora/epoch4) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado mediante SFT sobre LiquidAI/d1-3B, un modelo base de 3B parámetros con capacidades de visión y lenguaje. El adaptador no modifica la arquitectura del base: se carga con PeftModel.from_pretrained sobre el checkpoint LiquidAI/d1-3B (revisión 051bcc464b01b9f92942b364d9586b0ef5912432) y se ejecuta en bfloat16 sobre GPU. La tarea de entrenamiento es discreta: dado un frame de cámara y el estado de la escena, el modelo debe emitir uno de 15 tokens de acción (MV_* x6, RT_* x6, GRASP, RELEASE, DONE).

Los datos provienen de hmkang/frontier-200 (config default, revisión 63db289): 200 rollouts exitosos de LIBERO pick-and-place, 20 tareas x 10 repeticiones, con 14.445 filas totales. Las demostraciones fueron generadas por un VLM (Claude Sonnet) como operador a través de Show-Harness GUMI. Un detalle técnico crítico es el contrato de cámara: el dataset almacena frames camfix (no espejados), pero los scripts mlxp/f200_setup.sh y mlxp/gumi_to_rows.py --to-upstream espejan ambas vistas izquierda-derecha para reproducir exactamente los píxeles del upstream; el modelo debe servirse con D1_LIBERO_VIEW por defecto (upstream) sobre frames de Show-Harness también upstream. El operador apenas usó rotaciones: no hay etiquetas de roll ni pitch. El entrenamiento se extendió 10 épocas, con evaluación al final de cada una sobre un split de validación de episodios completos.

## Capacidades

- Predicción de acciones robóticas discretas: emite uno de 15 tokens (MV_* x6, RT_* x6, GRASP, RELEASE, DONE) a partir de observaciones visuales.
- Comprensión viso-espacial para manipulación pick-and-place en los entornos LIBERO (spatial, object y goal).
- Política de imitación entrenada sobre demostraciones de un operador VLM, apta como inicialización para RL.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso conversacional ni para uso como agente de texto.
- Capacidades multilingües: no disponibles (el modelo no opera en dominio lingüístico general).
- No dispone de modo thinking, audio ni otras capacidades especiales más allá de la visión y la emisión de acciones.

## Casos de uso

- Investigación en políticas VLA discretas: servir como punto de partida reproducible para experimentos de imitación en LIBERO, cargando el adaptador epoch4 sobre el base con PEFT y evaluando sobre episodios completos.
- Inicialización para aprendizaje por refuerzo: el autor recomienda explícitamente el epoch de menor NLL (epoch 4) como política mejor calibrada desde la que arrancar RL, evitando la sobreconfianza de épocas posteriores.
- Reproducción de experimentos de manipulación: el código en la rama hyeonmo/libero de JunHoo-Lee/d1-showharness-rl permite replicar el pipeline completo de datos, entrenamiento y evaluación.
- Evaluación comparativa de operadores VLM: al haberse generado las demostraciones con Claude Sonnet como operador, el checkpoint sirve para estudiar cómo se transfiere el comportamiento de un operador VLM a una política de 3B.
- Prototipado de control por tokens discretos: útil para validar arquitecturas de acción discreta frente a acción continua en tareas de pick-and-place antes de escalar a robots reales.
- Estudio de contratos de cámara y espejado: el modelo incorpora un contrato de frames concreto (upstream, espejado), lo que lo hace útil para depurar pipelines de percepción que deban respetar esa convención.

## Benchmarks y rendimiento

| Metrica (split de validacion, episodios completos) | d1-3B LoRA (epoch 4) | Mejor valor global |
|---|---|---|
| NLL | 0,7728 (epoch 4) | 0,7728 (epoch 4) |
| Accuracy top-1 | 0,7474 (epoch 8) | 0,7474 (epoch 8) |
| Macro recall | 0,6660 (epoch 4) | 0,6660 (epoch 4) |

El autor solo publica métricas de un único adaptador (d1-3B LoRA, 10 épocas). No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al tratarse de un base de 3B en bfloat16, la inferencia requiere aproximadamente 6-7 GB solo para pesos, más el overhead de activaciones y del adaptador LoRA.
- GPU recomendadas: no especificadas por el autor; por tamaño del base, una RTX 4090 (24 GB) o superior es suficiente en bfloat16, y una A100/H100 aporta margen para lotes mayores.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8-12 GB o más en bfloat16, aunque el dato exacto no está publicado.
- Opciones de despliegue: carga vía transformers + peft (AutoModel.from_pretrained con trust_remote_code=True y PeftModel.from_pretrained); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d1sh-libero-frontier200 | LoRA sobre base de 3B | No disponible | VLA discreta LIBERO | LFM Open License v1.0 | Hugging Face (0 descargas) |
| LiquidAI/d1-3B (base) | 3B | No disponible | Vision-language general | LFM Open License v1.0 | Hugging Face |
| Otros adaptadores libero15 (p. ej. hmkang/libero-discrete-tokens) | No disponible | No disponible | VLA discreta LIBERO | No disponible | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Dominio muy restringido: solo responde a la pregunta de acción de d1-showharness en tareas LIBERO pick-and-place; no es un modelo de propósito general.
- Sin etiquetas de rotación: el operador apenas usó rotaciones (no hay roll ni pitch), por lo que la política no ha aprendido a rotar la muñeca.
- Dependencia estricta del contrato de cámara: debe servirse con D1_LIBERO_VIEW por defecto sobre frames upstream espejados; usar frames camfix sin espejar rompería la correspondencia de píxeles.
- Riesgo de sobreconfianza en épocas tardías: la accuracy top-1 sube en el epoch 8 pero la NLL empeora, lo que indica sobreconfianza en las filas erróneas; el autor recomienda el epoch 4.
- Sesgo de los datos: entrenado solo con 200 rollouts exitosos generados por un operador VLM concreto (Claude Sonnet), lo que puede limitar la diversidad de estrategias aprendidas.
- Licencia: hereda la LFM Open License v1.0 del base, con posibles restricciones para uso comercial; debe revisarse el enlace de licencia antes de cualquier despliegue productivo.
- Sin métricas de rendimiento en robot real ni comparativas publicadas; los números proceden únicamente de validación offline sobre episodios completos.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hmkang/d1sh-libero-frontier200
- Modelo base: https://huggingface.co/LiquidAI/d1-3B
- Licencia del base: https://huggingface.co/LiquidAI/d1-3B/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/hmkang/frontier-200
- Código (rama hyeonmo/libero): https://github.com/JunHoo-Lee/d1-showharness-rl/tree/hyeonmo/libero
