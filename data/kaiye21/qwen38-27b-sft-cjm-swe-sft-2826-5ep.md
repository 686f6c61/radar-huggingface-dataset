# kaiye21/qwen38-27b-sft-cjm-swe-sft-2826-5ep

## Resumen

Qwen3.8-27B SFT · cjm-swe-sft-2826 es un checkpoint intermedio de ajuste supervisado (SFT) publicado por el usuario kaiye21 sobre una base Qwen3.8-27B-text. Se trata de un modelo de generacion de texto de 27.320.697.856 parametros (unos 27,3 mil millones) exportado desde un checkpoint de Megatron-Bridge a safetensors de Hugging Face. El entrenamiento se detuvo en el paso 300 de 725, seleccionado por ser el checkpoint guardado mas cercano a la menor perdida de validacion registrada (0,25390 en el paso 285); la perdida en el paso exportado fue de 0,27462.

El modelo se entrena sobre 2.685 trayectorias de entrenamiento y 141 de validacion, orientadas a tareas de ingenieria de software (el sufijo "swe" del nombre sugiere software engineering). Incorpora la cabeza MTP (multi-token prediction) original del modelo base Qwen3.8-27B-text, con 15 tensores intactos en `model-mtp-base.safetensors`, congelada y no entrenada en este dataset. Esta cabeza permite decodificacion especulativa si el runtime de servicio soporta MTP de Qwen.

Su relevancia es acotada: es un checkpoint intermedio de un ajuste realizado por un tercero, sin benchmarks downstream publicados, sin licencia declarada y sin informacion sobre idiomas. Resulta util como referencia para quienes investigan el ajuste fino de la familia Qwen3.8 o quieren reproducir el pipeline de exportacion Megatron-Bridge a safetensors con cabeza MTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.8 (tag `qwen3_5_text`), con cabeza MTP (multi-token prediction) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin variantes GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (incluye `model-mtp-base.safetensors` con la cabeza MTP) |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer de texto de la familia Qwen3.8, con el tag de libreria `qwen3_5_text` en Hugging Face. El checkpoint incluye la cabeza MTP original del modelo base Qwen3.8-27B-text: 15 tensores sin modificar en `model-mtp-base.safetensors`, y el indice y la configuracion declaran una capa MTP que comparte los embeddings del modelo principal. Esta cabeza se congelo y no se entreno con el dataset de este ajuste; su utilidad es habilitar decodificacion especulativa en runtimes que soporten MTP de Qwen.

El entrenamiento consistio en un SFT sobre 2.685 trayectorias de entrenamiento y 141 de validacion, con 725 pasos planificados de los que se completaron 300. La validacion se midio con dos lotes de evaluacion por medicion. El checkpoint exportado es el mas cercano a la menor perdida de validacion observada (0,25390 en el paso 285), con una perdida de 0,27462 en el paso guardado. Los pesos se exportaron desde Megatron-Bridge a safetensors de Hugging Face. No se documentan detalles sobre composicion del dataset, numero de tokens, uso de RLHF/DPO ni hiperparametros de entrenamiento.

## Capacidades

- Generacion de texto conversacional, segun los tags `text-generation` y `conversational`.
- Ajuste orientado a tareas de ingenieria de software (SFT sobre trayectorias tipo SWE), aunque no se publican evaluaciones que lo confirmen.
- Soporte de decodificacion especulativa mediante la cabeza MTP incluida, siempre que el runtime de servicio lo permita.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia estandar.
- Capacidades multilingues: no disponibles (no declaradas).
- Tool calling, function calling y razonamiento multi-paso: no documentados en la model card.

## Casos de uso

- Investigacion sobre ajuste fino de la familia Qwen3.8: el checkpoint permite estudiar el efecto del SFT sobre una base de 27B y comparar la evolucion de la perdida de validacion entre pasos, dado que se documentan las metricas del paso 285 y del 300.
- Reproduccion de pipelines de exportacion Megatron-Bridge a safetensors: sirve como ejemplo real de exportacion que preserva la cabeza MTP con 15 tensores congelados y una capa MTP que comparte embeddings.
- Experimentos de decodificacion especulativa: la cabeza MTP incluida permite probar aceleracion de inferencia en runtimes con soporte de MTP de Qwen, midiendo la ganancia de throughput frente a decodificacion autoregresiva estandar.
- Evaluacion de modelos ajustados para tareas de codigo: al estar entrenado sobre trayectorias tipo SWE, puede emplearse como punto de partida para comparar con el modelo base en tareas de reparacion de bugs o generacion de parches, siempre que se validen los resultados con benchmarks propios.
- Base para ajustes posteriores: al ser un checkpoint intermedio, puede servir como inicializacion para continuar el SFT desde el paso 300 en lugar de partir del modelo base, ahorrando coste de computo.
- Despliegue en entornos de investigacion con endpoints compatibles: su tag `endpoints_compatible` permite servirlo en infraestructuras de inferencia estandar para pruebas internas de generacion de texto conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reporta ningun resultado de benchmark downstream para esta exportacion. Los unicos datos de rendimiento son las perdidas de validacion registradas durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Perdida de validacion minima registrada (paso 285) | 0,25390 |
| Perdida en el paso exportado (paso 300) | 0,27462 |
| Pasos completados / planificados | 300 / 725 |
| Trayectorias de entrenamiento | 2.685 |
| Trayectorias de validacion | 141 |

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): aproximadamente 54,6 GB solo para pesos, mas memoria para cache KV y activaciones; en la practica se necesitan del orden de 60-70 GB o mas segun la longitud de contexto.
- Cuantizacion: no se publican variantes cuantizadas; para reducir VRAM habria que generar pesos GGUF/AWQ/GPTQ a partir de los safetensors, con el coste de calidad asociado.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU (por ejemplo, 2 x RTX 4090 de 24 GB con tensor parallelism) para precision completa.
- GPU de consumo: no cabe en una unica RTX 4090 (24 GB) en BF16; seria necesario cuantizar a 4 bits o inferior para intentar encajarlo en una sola GPU consumer, con la perdida de calidad correspondiente.
- Opciones de despliegue: transformers (libreria declarada), ademas de runtimes compatibles con endpoints; para decodificacion especulativa se requiere un runtime con soporte de MTP de Qwen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| kaiye21/qwen38-27b-sft-cjm-swe-sft-2826-5ep | 27,3 B | no disponible | no disponible | Hugging Face, safetensors | Checkpoint SFT intermedio, sin benchmarks |
| Qwen3.8-27B-text (base) | ~27 B | no disponible | no disponible | Referenciado como base del ajuste | Modelo original del que parte este checkpoint |
| Alternativas de ~27B de otras familias | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con alternativas concretas de la misma categoria (mismo tamano o misma tarea) en parametros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- Checkpoint intermedio: solo se completaron 300 de 725 pasos de SFT, por lo que el ajuste no esta finalizado y su calidad puede ser inferior a la de un entrenamiento completo.
- Sin benchmarks downstream: no hay evidencia publicada de rendimiento en tareas reales (codigo, razonamiento, matematicas), por lo que cualquier uso en produccion requiere evaluacion propia.
- Licencia no disponible: no se declara licencia, lo que impide confirmar si el uso comercial esta permitido; se debe contactar con el autor o asumir restricciones.
- Idiomas no declarados: se desconoce el soporte multilingue real y la calidad en castellano.
- Cabeza MTP congelada: al no haberse entrenado con este dataset, la decodificacion especulativa puede no estar alineada con la distribucion del modelo ajustado, lo que podria reducir la tasa de aceptacion de tokens especulados.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; sin evaluaciones especificas no puede cuantificarse.
- Sesgos: no documentados; al derivar de un modelo base de terceros, hereda los sesgos de sus datos de preentrenamiento, que no se detallan.
- Repositorio con 0 descargas y 0 likes: no hay validacion de la comunidad ni reportes de uso que avalen su robustez.
- Requisitos de memoria elevados: en BF16 no cabe en GPU consumer, lo que limita su uso a infraestructura profesional o a versiones cuantizadas no oficiales.

## Enlaces

- Hugging Face: https://huggingface.co/kaiye21/qwen38-27b-sft-cjm-swe-sft-2826-5ep
