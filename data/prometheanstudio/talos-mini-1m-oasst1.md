# PrometheanStudio/talos-mini-1m-oasst1

## Resumen

Talos Mini 1M es un modelo de lenguaje experimental de 1.000.320 parámetros desarrollado por PrometheanStudio bajo el nombre interno TalosGPT. Se trata de un transformer decoder-only de escala minima, entrenado sobre un subconjunto reducido del corpus OpenAssistant/oasst1 (1.800 mensajes de entrenamiento y 200 de evaluacion), con el objetivo declarado de servir como experimento de escalado entre el prototipo Talos Mini de 254K parámetros y configuraciones Talos mayores futuras. El checkpoint publicado corresponde al paso 26.925 y se distribuye junto con el tokenizer nativo byte-level BPE del proyecto.

El interes de este modelo no reside en sus capacidades linguisticas, que el propio autor califica de no coherentes para uso conversacional general, sino en su valor como artefacto de investigacion reproducible: permite validar la pila de entrenamiento Talos (carga de datos OASST1, split train/eval, guardado y carga de checkpoints, evaluacion en held-out, generacion greedy y pruebas de equivalencia de KV-cache) con un coste computacional practicamente nulo. Con 128 dimensiones ocultas, 3 capas y 8 cabezas de atencion (4 cabezas KV), su huella en disco es de unos pocos megabytes.

Es relevante ahora como ejemplo de modelo "dev-scale" dentro del ecosistema open source: demuestra el ciclo completo de construccion de un LLM propio con tokenizer nativo (no una conversion del tokenizer de GPT-2) y lo publica bajo licencia MIT. No obstante, debe evaluarse exclusivamente como herramienta de investigacion y pruebas de infraestructura, nunca como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TalosGPT, transformer decoder-only (causal LM) |
| Parametros totales | 1.000.320 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens maxima; entrenamiento con secuencias de 64 tokens |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas; solo checkpoint nativo en punto flotante) |
| Idiomas soportados | no disponible oficialmente; la model card indica que la generacion produce estructura de frase reconocible en ingles |
| Licencia | MIT |
| Formato de pesos | Checkpoint nativo Talos `.pt` (`step-26925.pt`), cargable con la libreria `talos`; no hay safetensors ni GGUF |
| Tamano del repo | 0,0 GB (coherente con ~4 MB en fp32 para 1M de parametros) |
| Libreria | talos |
| Pipeline declarado | no disponible |

Parametros arquitectonicos adicionales:

| Parametro | Valor |
|---|---|
| Hidden size | 128 |
| Capas | 3 |
| Cabezas de atencion | 8 |
| Cabezas KV | 4 |
| Dimension por cabeza | 16 |
| Tamano intermedio FFN (denso) | 512 |
| Vocabulario | 1.024 |
| Merges del tokenizer | 764 |
| Tokenizer | Talos ByteLevelBPETokenizer nativo (conversion de GPT-2: no) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only causal con atencion multi-cabeza que emplea 8 cabezas de consulta y 4 cabezas de clave/valor, lo que supone una forma de atencion agrupada (GQA) con una relacion 2:1 y reduce el tamano de la KV-cache a la mitad respecto a atencion multi-cabeza completa. La dimension por cabeza es de 16, el hidden size de 128 y el FFN denso tiene un tamano intermedio de 512. El vocabulario es de 1.024 tokens con 764 merges del tokenizer byte-level BPE nativo de Talos, que usa identificadores de byte y de merge propios, no compatibles directamente con el tokenizer de GPT-2.

El entrenamiento se realizo con el stack Talos existente sobre 1.800 mensajes del split de entrenamiento de OpenAssistant/oasst1, con 200 mensajes reservados para evaluacion, longitud de secuencia de 64 tokens, batch size de 4, optimizador AdamW y learning rate de 3e-3. No se documenta ningun proceso de alineacion posterior (RLHF, DPO o similar), ni decodificacion especulativa, ni mecanismos de atencion lineal o estado recurrente. El checkpoint publicado (`step-26925.pt`) incluye el estado del modelo, metadatos de configuracion, el numero de paso, el recuento de parametros y los metadatos del vocabulario.

## Capacidades

- Generacion de texto autoregresiva causal, con decodificacion greedy verificada.
- Estructura de frase reconocible en ingles a nivel superficial, segun la propia model card.
- Soporte de KV-cache, con pruebas de equivalencia entre generacion con y sin cache documentadas por el autor.
- Capacidad de carga y guardado de checkpoints dentro del stack Talos.
- Tokenizacion con tokenizer nativo byte-level BPE de 1.024 tokens y 764 merges.
- Soporte de tool calling / function calling: no disponible (sin evidencia en la informacion publicada).
- Soporte de agentes o razonamiento multi-paso: no disponible (sin evidencia).
- Capacidades multilingues: no disponible; sin declaracion explicita de idiomas soportados.
- Vision, audio y modos de razonamiento explicito (thinking mode): no disponibles.
- Ajuste fino: no documentado en la model card, aunque el modelo se distribuye como checkpoint nativo cargable por la libreria Talos.

## Casos de uso

- Investigacion sobre escalado de modelos: el modelo se define explicitamente como experimento intermedio entre el prototipo Talos Mini de 254K y configuraciones mayores, por lo que sirve para medir el efecto del aumento de parametros sobre la perdida de validacion en condiciones controladas.
- Validacion de la pila de entrenamiento Talos: permite ejercitar el ciclo completo (carga de OASST1, split train/eval, entrenamiento, guardado y carga de checkpoint, evaluacion en held-out) antes de lanzar ejecuciones mayores, con un coste de computo despreciable.
- Pruebas de equivalencia de KV-cache: el autor documenta pruebas de equivalencia con y sin cache; es un caso directo para verificar rutas de decodificacion incremental en implementaciones propias.
- Pruebas de humo en infraestructura de inferencia: con ~4 MB en fp32 y ~1 MB en int8, el modelo puede ejecutarse en CPU para validar rutas de codigo de servidores de inferencia sin consumir GPU.
- Docencia y divulgacion: es un caso util para explicar de forma tangible la anatomia de un transformer decoder-only (capas, cabezas, GQA, tokenizer BPE) sin necesidad de hardware especializado.
- Validacion de pipelines de tokenizacion: al emplear un tokenizer byte-level BPE nativo de 1.024 tokens y 764 merges, sirve para probar flujos de entrenamiento de tokenizers y conversion de identificadores de byte/merge.
- Pruebas de pipelines de datos (ETL) que requieren texto generado con estructura de frase: util para generar cargas sinteticas en pruebas de ingestas, aunque sin garantia de coherencia semantica.
- Reproduccion de experimentos minimos de fine-tuning sobre OASST1: el conjunto de datos y el split estan documentados, lo que facilita replicar condiciones y comparar hiperparametros en miniatura.
- Prototipado en entornos embebidos o de bajos recursos: su huella de memoria permite desplegarlo donde no cabe ningun modelo convencional, siempre con expectativas de calidad muy limitadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento son las metricas de validacion internas del paso 26.925:

| Metrica | Valor |
|---|---|
| Perdida de validacion | ~2,254 |
| Perplejidad de validacion | ~9,52 |
| Precision de siguiente token en validacion | ~35 % |
| Tokens evaluados | 102.816 |
| Mensajes de evaluacion (held-out OASST1) | 200 |
| Paso del checkpoint | 26.925 |

El propio autor advierte que estos resultados proceden de una ejecucion de entrenamiento muy reducida y no deben interpretarse como una medida de capacidad linguistica general. No hay comparaciones publicadas con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~4 MB en fp32 (1.000.320 parametros x 4 bytes), ~2 MB en fp16 y ~1 MB en int8, sin contar la KV-cache ni el overhead del runtime. Las cifras exactas de consumo del runtime Talos no estan publicadas.
- GPU recomendadas: no se requiere GPU. El modelo cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- Compatibilidad con GPU consumer: si, cabe en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090, etc.), aunque su tamano lo hace innecesario.
- Despliegue: unicamente mediante la libreria nativa `talos` (`library_name: talos`). No hay soporte documentado en vLLM, llama.cpp, Ollama, TGI o `transformers` de HuggingFace, ya que ni la arquitectura ni el tokenizer son formatos estandar.
- Formato del checkpoint: `.pt` nativo, no safetensors ni GGUF, lo que descarta las herramientas habituales de cuantizacion y servido.
- Latencia y throughput: no disponibles (no se publican mediciones).

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparacion se limita a metadatos verificables. Se incluyen como referencia dos modelos de la misma categoria de "modelos pequenos":

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| Talos Mini 1M (PrometheanStudio) | 1.000.320 | 512 (entrenado a 64) | MIT | `.pt` nativo Talos | Vocabulario de 1.024 tokens, tokenizer propio, sin soporte en el ecosistema HF |
| GPT-2 small (OpenAI) | 124 M | 1.024 | Licencia MIT modificada | safetensors, GGUF (conversiones de terceros) | Referencia historica de transformer decoder-only pequeno, integrado en `transformers` |
| SmolLM2-135M (HuggingFace) | ~135 M | no disponible en la informacion recogida | Apache-2.0 | safetensors, GGUF, integrado en `transformers` | Modelo pequeno de proposito general con soporte amplio de herramientas |

Los datos de parametros, contexto y licencia de los modelos de referencia corresponden a informacion publica ampliamente conocida; no se dispone de resultados de benchmarks comparables para establecer una comparacion de rendimiento con Talos Mini 1M.

## Limitaciones y advertencias

- El autor indica explicitamente que el modelo no es un modelo conversacional coherente de proposito general y que no pretende competir con modelos de lenguaje modernos.
- Precision de siguiente token en validacion de aproximadamente el 35 %, lo que implica una tasa de error muy elevada y un riesgo extremo de generacion incoherente o directamente incorrecta.
- Entrenamiento con solo 1.800 mensajes y 200 de evaluacion: el dataset es demasiado pequeno para inducir conocimiento factual o razonamiento.
- Longitud de entrenamiento de 64 tokens frente a una longitud maxima soportada de 512: el comportamiento mas alla de 64 tokens no esta validado.
- Vocabulario de solo 1.024 tokens: la tokenizacion es muy ineficiente en terminos de tokens por palabra, lo que degrada el contexto util efectivo.
- Sesgos: al derivar de OASST1, el modelo puede heredar sesgos presentes en ese corpus, sin que se documente ningun proceso de mitigacion o alineacion.
- Riesgo de alucinacion: muy alto, dado el tamano, los datos y la calidad de generacion descrita.
- Idiomas: no hay declaracion oficial de idiomas soportados; la model card solo menciona estructura de frase reconocible en ingles.
- Licencia MIT: permite uso comercial y modificacion sin restricciones practicas, pero no existe ninguna garantia de idoneidad para produccion.
- Integracion: al usar arquitectura y tokenizer nativos, no es compatible con el ecosistema estandar (transformers, vLLM, llama.cpp, Ollama, TGI), lo que limita su adopcion fuera del stack Talos.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, con fechas de creacion y actualizacion de 2026-09-20 en los metadatos, lo que sugiere un artefacto recien publicado y sin validacion externa.
- Los objetivos de escalado a largo plazo del proyecto Talos se declaran como metas de investigacion, no como capacidades demostradas en este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PrometheanStudio/talos-mini-1m-oasst1
- Dataset de entrenamiento: OpenAssistant/oasst1 (referenciado en la model card; no se proporciona enlace directo)
- Repositorio del stack Talos: no disponible
- Paper o publicacion tecnica: no disponible
- Demo o espacio interactivo: no disponible
- Otra informacion adicional: la busqueda web realizada no devolvio resultados relevantes sobre el modelo, el proyecto Talos o PrometheanStudio; los unicos resultados obtenidos versaban sobre la zona horaria Central Time (CST/CDT) y no guardan relacion con el modelo.
