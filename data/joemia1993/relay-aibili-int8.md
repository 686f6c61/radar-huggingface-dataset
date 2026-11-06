# joemia1993/relay-aibili-int8

## Resumen

relay-aibili-int8 es un checkpoint intermedio de entrenamiento publicado por el usuario joemia1993 en Hugging Face. Se trata de un modelo de lenguaje causal basado en la arquitectura Qwen2ForCausalLM, cuantizado a 8 bits mediante bitsandbytes, con un total de 44.609.280 parametros y una unica capa transformer. Su nombre interno en la model card es "relay-global" y se distribuye como punto de control de un entrenamiento que, segun el propio autor, no ha finalizado ni ha sido evaluado.

El modelo emplea una configuracion reducida: `hidden_size=1024`, una sola capa, 16 cabezas de atencion y 8 cabezas KV (GQA). Los pesos se almacenan en formato int8 con escalas por fila (`SCB` en F32), lo que exige cargar el modelo con `load_in_8bit=True`. La model card lo describe explicitamente como "训练中断点, 未做评测" (punto de interrupcion del entrenamiento, sin evaluacion).

Por su naturaleza de checkpoint intermedio, sin licencia declarada, sin benchmarks y con cero descargas, no es un modelo apto para uso en produccion. Su interes es fundamentalmente documental o experimental: sirve para inspeccionar como se serializa un modelo Qwen2 cuantizado a int8 con bitsandbytes y para reproducir el estado de un entrenamiento truncado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (transformer decoder-only) |
| Parametros totales | 44.609.280 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (bitsandbytes, pesos I8 con escalas por fila F32) |
| Idiomas soportados | en, zh |
| Licencia | no disponible |
| Formato de pesos | safetensors (int8 + escalas F32) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Qwen2, con `hidden_size=1024`, una sola capa, 16 cabezas de atencion y 8 cabezas KV, lo que implica grouped-query attention con una relacion de 2:1. El modelo se distribuye cuantizado a 8 bits con bitsandbytes: los pesos se almacenan como enteros de 8 bits (`weight` I8) acompanados de escalas por fila (`SCB` F32), y la carga requiere `load_in_8bit=True`. Esta cuantizacion reduce el espacio en disco y la memoria de inferencia a costa de una perdida de precision que el autor no ha cuantificado.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre innovaciones tecnicas adicionales. La model card indica unicamente que se trata de un checkpoint de entrenamiento interrumpido y que no se ha realizado evaluacion alguna. El tamano del repositorio figura como 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente subidos o que el calculo de tamano no se ha actualizado.

## Capacidades

- Generacion de texto autoregresiva segun la arquitectura Qwen2ForCausalLM.
- Soporte declarado de ingles y chino en las etiquetas del repositorio.
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado capacidad de agentes ni razonamiento multi-paso.
- No se ha documentado modo thinking, vision ni audio.
- Al ser un checkpoint interrumpido y sin evaluar, no hay evidencia de que ninguna de estas capacidades funcione de forma fiable.

## Casos de uso

- Inspeccion de serializacion int8: util para estudiar como bitsandbytes empaqueta pesos I8 y escalas por fila en safetensors dentro de un modelo Qwen2, con fines de aprendizaje o auditoria de pipelines de cuantizacion.
- Reproduccion de experimentos de entrenamiento truncado: sirve como referencia para comparar estados intermedios de un entrenamiento de una sola capa y validar herramientas de reanudacion.
- Pruebas de carga con `load_in_8bit=True`: permite verificar que un entorno de transformers y bitsandbytes configurado correctamente puede instanciar el modelo sin errores.
- Validacion de infraestructura de despliegue: por su tamano minimo, puede usarse como smoke test en pipelines de TGI o endpoints compatibles antes de desplegar modelos mayores.
- Docencia sobre arquitecturas decoder-only: la configuracion de una capa con GQA 16/8 facilita explicar el flujo de atencion y la proyeccion KV en un caso reducido.
- Analisis de riesgos de publicacion: caso de estudio sobre por que un checkpoint sin licencia, sin evaluacion y sin pesos verificables no debe integrarse en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en int8 para los 44,6 M de parametros, mas el overhead de activaciones y del runtime de bitsandbytes.
- GPU recomendadas: cualquier GPU consumer con soporte CUDA y al menos 2 GB de VRAM; el modelo cabe en GTX 1650, RTX 3050 o superiores.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna con CUDA.
- Opciones de despliegue: transformers con bitsandbytes (`load_in_8bit=True`) es el unico camino documentado; llama.cpp, Ollama y vLLM no estan soportados de forma nativa para este formato int8 de bitsandbytes.
- Latencia y throughput estimados: no disponibles; al tratarse de una sola capa el coste computacional es minimo, pero el cuello de botella sera la de-cuantizacion y el runtime, no la GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| relay-aibili-int8 | 44,6 M | no disponible | no disponible | Hugging Face, 0 descargas |
| Qwen2-0.5B | 494 M | 32.768 tokens (segun version) | Apache 2.0 (segun version) | Hugging Face, ampliamente usado |
| Qwen2-1.5B | 1.540 M | 32.768 tokens (segun version) | Apache 2.0 (segun version) | Hugging Face, ampliamente usado |
| TinyLlama-1.1B | 1.100 M | 2.048 tokens | Apache 2.0 | Hugging Face, ampliamente usado |

La comparativa es asimetrica: relay-aibili-int8 es dos ordenes de magnitud menor que los Qwen2 publicos y carece de evaluacion, licencia y contexto declarados. Los modelos Qwen2 oficiales son la referencia natural por compartir arquitectura, pero no son equivalentes en madurez ni en garantias de uso.

## Limitaciones y advertencias

- Checkpoint intermedio de entrenamiento: el autor indica que no ha finalizado ni se ha evaluado, por lo que la calidad de generacion no esta garantizada.
- Sin licencia declarada: no hay permiso explicito de uso comercial ni de redistribucion; debe tratarse como no licenciado hasta consultar al autor.
- Sin benchmarks ni evaluacion: no existen datos de MMLU, HumanEval, GSM8K ni de ningun otro conjunto que permitan estimar su rendimiento.
- Riesgo elevado de alucinacion y de texto incoherente por el estado truncado del entrenamiento y la escasa profundidad (una sola capa).
- Idiomas limitados a ingles y chino segun las etiquetas; no hay soporte declarado de castellano.
- Longitud de contexto no documentada; no debe asumirse ninguna ventana concreta.
- Formato de pesos atado a bitsandbytes: no es portable a llama.cpp, GGUF ni a la mayoria de runtimes de inferencia optimizados.
- El tamano del repositorio figura como 0.0 GB, lo que genera dudas sobre la integridad y disponibilidad real de los pesos; conviene verificar los ficheros antes de cualquier uso.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/joemia1993/relay-aibili-int8
- Repositorio de bitsandbytes: https://github.com/bitsandbytes-foundation/bitsandbytes
- Documentacion de transformers sobre cuantizacion: https://huggingface.co/docs/transformers/main/en/quantization/bitsandbytes
- Documentacion de Qwen2 en transformers: https://huggingface.co/docs/transformers/main/en/model_doc/qwen2
