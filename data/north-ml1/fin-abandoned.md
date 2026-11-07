# North-ML1/fin-abandoned

## Resumen

fin-abandoned es un checkpoint experimental publicado por North-ML1 en Hugging Face. Se trata del estado final guardado de la ejecucion "Wind Flame 2.0", un entrenamiento que fue detenido a peticion del propietario el 6 de noviembre de 2026 tras completar 1.796 de las 3.000 actualizaciones de recuperacion previstas. El autor lo describe explicitamente como un artefacto de investigacion inacabado y no como un modelo promocionado o finalizado.

El modelo emplea una arquitectura hibrida denominada VEG, compuesta por una capa de preludio transformer, 14 capas nucleares VEG ejecutadas una sola vez y una capa de coda transformer, con aproximadamente 383,2 millones de parametros. Se inicializo a partir de un modelo VEG padre de 246 millones de parametros y se entreno con una combinacion de KL de profesor y entropia cruzada sobre datos de texto.

Su relevancia es limitada y de caracter puramente documental: no se completo ninguna evaluacion sobre benchmarks de agentes ni sobre el split de test no contaminado, y no existe ninguna afirmacion de rendimiento de clase 4B establecida. Resulta util unicamente como referencia de un experimento interrumpido, no como base para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida VEG: 1 capa de preludio transformer, 14 capas nucleares VEG ejecutadas una vez, 1 capa de coda transformer |
| Parametros totales | Aproximadamente 383,2 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en punto flotante; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | Ingles (segun metadatos y model card) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`checkpoint.pt`), no compatible con AutoModel de Transformers; tokenizer BPE de 32k en `tokenizer.json` |

## Arquitectura y entrenamiento

La arquitectura VEG combina componentes transformer con un nucleo recurrente o de ejecucion unica: una capa de preludio transformer procesa la entrada, seguida de 14 capas VEG que se ejecutan una sola vez (`steps=1`) y una capa de coda transformer que produce la salida. El modelo se inicializo desde un VEG padre de 246 millones de parametros y se entreno sobre datos de texto con una funcion de perdida que suma KL de profesor (destilacion) y entropia cruzada.

El entrenamiento se interrumpio tras 1.796 de 3.000 actualizaciones de recuperacion planificadas. En la ultima actualizacion guardada, las perdidas de validacion registradas fueron 3,3034 en el conjunto "capability" y 3,7643 en "nitron"; el autor subraya que son perdidas de texto, no puntuaciones de benchmarks de agentes. Un detalle critico es que el checkpoint se entreno con `steps=1`, mientras que su configuracion guardada toma cuatro pasos por defecto: cargarlo sin forzar `steps=1` produce un modelo distinto y no validado.

## Capacidades

- Generacion de texto autoregresiva en ingles, condicionada por el estado incompleto del entrenamiento.
- Tokenizacion BPE propia de 32k vocabulario mediante `tokenizer.json`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue mas alla del ingles.
- No se documentan modos especiales (thinking, vision, audio).
- No se han establecido comportamiento, seguridad ni idoneidad downstream, segun el propio autor.

## Casos de uso

- Investigacion sobre arquitecturas hibridas: el checkpoint permite inspeccionar la implementacion VEG (preludio, nucleo y coda) y reproducir el estado final de la ejecucion para estudiar el diseno.
- Analisis de destilacion con KL de profesor: util para examinar como se comporta la combinacion de KL y entropia cruzada en un modelo pequeno inicializado desde un padre de 246M.
- Reproduccion de experimentos interrumpidos: el log de entrenamiento incluido y el SHA-256 del checkpoint permiten auditar la trazabilidad de la ejecucion.
- Estudio de degradacion por pasos de inferencia: comparar `steps=1` (configuracion entrenada) frente a los cuatro pasos por defecto ilustra el efecto de un desajuste entre entrenamiento e inferencia.
- Docencia sobre ciclo de vida de modelos: sirve como ejemplo documentado de un artefacto abandonado y de las precauciones al publicar checkpoints de investigacion.
- Pruebas de carga segura de pickles PyTorch: escenario controlado para practicar la carga de checkpoints no-Transformers desde fuentes de confianza.

En ningun caso se recomienda su uso en produccion, atencion al cliente, generacion de codigo ni pipelines automatizados, dado que no existe evaluacion de calidad ni de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se completo ninguna evaluacion sobre benchmarks de agentes ni sobre el split de test no contaminado, y que no se ha establecido ninguna afirmacion de rendimiento de clase 4B. Las unicas metricas registradas son perdidas de validacion de texto: 3,3034 en "capability" y 3,7643 en "nitron".

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 383,2 millones de parametros, una carga en fp32 rondaria 1,5 GB de pesos, mientras que fp16 o bf16 reducirian el requisito a aproximadamente 0,8 GB (estimacion a partir del tamano del repositorio, no confirmada por el autor).
- GPU recomendadas: no disponible; por tamano, cualquier GPU consumer moderna con al menos 2-4 GB de VRAM libre deberia poder alojarlo.
- Cabe en GPU consumer: previsiblemente si, aunque no se documenta ningun caso probado.
- Opciones de despliegue: no hay soporte para vLLM, llama.cpp, Ollama ni TGI; requiere el codigo de investigacion propio del directorio `veg/` con PyTorch, NumPy y tokenizers.
- Latencia y throughput: no disponible.
- Advertencia: los checkpoints pickle de PyTorch solo deben cargarse desde fuentes de confianza.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Estado | Licencia | Formato |
|---|---|---|---|---|---|
| fin-abandoned (North-ML1) | ~383,2 M | no disponible | Abandonado, sin evaluacion | no disponible | PyTorch custom (`checkpoint.pt`) |
| wind-edge-1.7 (North-ML1) | no disponible | no disponible | Publicado como modelo final de la via tradicional | no disponible | no disponible |
| Modelo VEG padre (North-ML1) | 246 M | no disponible | Punto de inicializacion del entrenamiento | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estos modelos. Cualquier comparacion con alternativas de la misma categoria (modelos de ~400M parametros con soporte en Transformers) resulta inviable porque fin-abandoned carece de evaluacion publicada y de integracion con ecosistemas estandar.

## Limitaciones y advertencias

- Modelo inacabado: el entrenamiento se detuvo tras el 59,9 % de las actualizaciones planificadas (1.796 de 3.000).
- Sin evaluacion: no hay benchmarks de agentes ni resultados sobre test no contaminado; no existe evidencia de rendimiento.
- Desajuste de configuracion: la configuracion guardada usa cuatro pasos por defecto, pero el checkpoint se entreno con `steps=1`; cargarlo sin forzar ese valor produce un modelo distinto y no validado.
- Comportamiento y seguridad no establecidos, segun el propio autor.
- Riesgo de alucinacion: no cuantificado, pero esperable en un modelo pequeno con entrenamiento incompleto.
- Idioma: solo ingles documentado; sin soporte multilingue declarado.
- Licencia no disponible: no puede asumirse permiso para uso comercial.
- Formato no estandar: no es un checkpoint AutoModel de Transformers; requiere codigo de investigacion propio y carga de pickle, con el riesgo de seguridad asociado.
- Sin soporte de tool calling, agentes ni modos especiales documentados.
- No apto para produccion bajo ninguna circunstancia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/North-ML1/fin-abandoned
- Modelo relacionado, wind-edge-1.7: https://huggingface.co/North-ML1/wind-edge-1.7
- Repositorio AIGraveyard (registro de modelos retirados o abandonados): https://github.com/MrUnreal/AIGraveyard
