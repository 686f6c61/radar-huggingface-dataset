# Donghyun1228/pi05-libero-ila-data-scale-n10000-20261111

## Resumen

`pi05-libero-ila-data-scale-n10000-20261111` es un artefacto de investigación publicado por el usuario Donghyun1228 en Hugging Face. No se trata de un modelo de lenguaje generativo al uso, sino del resultado de un experimento de adaptación de dominio mediante *Invariant Learning Across domains* (ILA, Yoneda et al., RSS 2022) aplicado sobre la cabeza del codificador visual PAD de un modelo π0.5 (pi05) preentrenado en la suite robótica LIBERO. El objetivo del experimento es medir el efecto del escalado del número de fotogramas de sondeo (probe frames) en la adaptación, fijando 10 000 fotogramas por entorno.

El repositorio contiene los pesos resultantes de dos etapas: un modelo fuente (`pi05_libero_pad_img_source`) entrenado con aprendizaje por imitación más una cabeza IDM durante 10 000 pasos con tasa de aprendizaje 1e-5, y dos modelos objetivo (`pi05_libero_ila_img_view_adapt` y `pi05_libero_ila_img_yaw_adapt`) adaptados con RMSProp sobre el codificador congelado del IDM, el modelo forward y el crítico WGAN, también durante 10 000 pasos. La evaluación se realizó con semilla 7 en OSMesa sobre 2000 episodios.

Su relevancia es acotada y muy específica: sirve como evidencia reproducible sobre cómo escala la adaptación visual de políticas robóticas con el volumen de datos de sondeo, y como material de partida para quienes investigan transferencia de dominio en VLA (vision-language-action). No es un modelo para uso general, no hay información sobre licencia ni idiomas, y el repo ocupa 25,1 GB sin incluir `train_state`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (deriva de π0.5 / pi05 con cabeza de codificador visual PAD; detalles no publicados en la información disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repo incluye `SHA256SUMS` y ficheros de pesos; formato concreto no especificado) |

## Arquitectura y entrenamiento

El experimento parte de un modelo π0.5 (pi05) entrenado sobre LIBERO y le añade una cabeza de codificador visual PAD. Sobre esa base se entrena un modelo fuente (`pi05_libero_pad_img_source`) con aprendizaje por imitación (IL) y una cabeza IDM (inverse dynamics model), con tasa de aprendizaje 1e-5 y 10 000 pasos, usando 10 000 fotogramas de sondeo por entorno. A partir de ahí se generan dos variantes objetivo —`view` y `yaw`— que aplican ILA con pasos de RMSProp sobre el codificador, manteniendo congelados la cabeza IDM, el modelo forward y el crítico WGAN, también durante 10 000 pasos y con 10 000 fotogramas de sondeo objetivo por entorno.

El marco ILA (Yoneda et al., RSS 2022) busca representaciones invariantes entre dominios mediante un esquema adversario con crítico WGAN, de modo que el codificador visual aprenda características que no dependan del dominio (vista o yaw). No se especifican en la información disponible el número total de tokens de entrenamiento, la composición del dataset más allá de los fotogramas de sondeo, ni si hubo RLHF o DPO. Tampoco se detalla la innovación técnica más allá del propio esquema ILA y del uso de OSMesa para la evaluación.

## Capacidades

- Adaptación de dominio visual para políticas robóticas VLA derivadas de π0.5 sobre LIBERO.
- Entrenamiento con aprendizaje por imitación más cabeza IDM sobre el codificador PAD.
- Adaptación invariante al dominio mediante ILA con crítico WGAN (variantes `view` y `yaw`).
- Evaluación reproducible con semilla 7 en OSMesa sobre 2000 episodios.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni multilingüismo.
- No se documenta modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Investigación en transferencia de dominio para robótica: usar los pesos `view` y `yaw` como punto de partida para estudiar cómo varía la invariancia del codificador visual al cambiar la cámara o la orientación.
- Reproducción de experimentos de escalado de datos de sondeo: comparar esta ejecución con n=10 000 frente a otras escalas para trazar curvas de rendimiento en función del número de probe frames.
- Ablación de componentes ILA: congelar o descongelar la cabeza IDM, el modelo forward o el crítico WGAN para aislar su contribución en la adaptación.
- Benchmark interno de políticas VLA en LIBERO: emplear la evaluación con semilla 7 y 2000 episodios como referencia comparable entre variantes.
- Estudio de estabilidad de entrenamiento con RMSProp en codificadores visuales congelados, analizando la convergencia a 10 000 pasos.
- Base para trabajos de adaptación sim-to-real o multi-cámara en entornos LIBERO, reutilizando el codificador adaptado como inicialización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una evaluación con semilla 7 en OSMesa sobre 2000 episodios (`<shift>/eval_seed7`), pero no se incluyen las métricas numéricas obtenidas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del repo es de 25,1 GB, pero incluye pesos de varias variantes y ficheros auxiliares; no se desglosa por checkpoint).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el código de referencia está en github.com/Donghyun1228/vla_adaptation).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-libero-ila-data-scale-n10000-20261111 | no disponible | no disponible | no disponible | no disponible | Hugging Face (0 descargas) |
| π0.5 (pi05) base | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| Otras variantes ILA del mismo autor | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No se especifica licencia, por lo que el uso comercial queda sin autorización explícita y debe considerarse restringido hasta confirmación del autor.
- El repositorio no incluye `train_state`, lo que impide reanudar el entrenamiento desde el punto exacto publicado.
- Es un artefacto de investigación acotado a LIBERO y a las variantes `view` y `yaw`; no es un modelo de propósito general.
- No hay información sobre sesgos, riesgo de alucinación ni comportamiento fuera del dominio de evaluación.
- No se documentan idiomas soportados ni limitaciones de contexto.
- El tamaño del repo (25,1 GB) y la ausencia de especificaciones de cuantización complican el despliegue en hardware de consumo.
- Cualquier uso en producción requeriría validación independiente, dado que no se publican métricas de rendimiento en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-ila-data-scale-n10000-20261111
- Código: https://github.com/Donghyun1228/vla_adaptation
- Paper ILA (Yoneda et al., RSS 2022): no disponible en la información proporcionada.
