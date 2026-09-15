# Aquiles-ai/Evo2-1B-Base

## Resumen

Evo2-1B-Base (Transformers port) es una reimplementacion no oficial del checkpoint base de 1B de parametros de la familia Evo 2, publicada por el usuario Aquiles-ai. El modelo original lo desarrolla el Arc Institute y colaboradores, y esta disenado para modelar ADN a resolucion de un unico nucleotido mediante un tokenizador byte-level de vocabulario 512 (un token por nucleotido). Este repositorio no reentrena nada: convierte los pesos oficiales del checkpoint Vortex a PyTorch estandar para que el modelo cargue con `AutoModelForCausalLM` sin depender de Vortex, Transformer Engine ni kernels personalizados.

La relevancia de esta ficha es doble. Por un lado, Evo 2 es un modelo genomico de proposito general que trabaja con secuencias de ADN en lugar de lenguaje natural. Por otro, esta variante concreta existe para eliminar la barrera de infraestructura de la pila original: permite cargar un modelo genomico de 1B en un entorno `transformers` convencional. El precio es eficiencia: la propia model card advierte de que este port no incluye FlashAttention, ni ruta FP8, ni kernels fusionados, ni decodificacion con estado recurrente.

El checkpoint tiene 1.107.990.016 parametros reales, 25 capas (4 de atencion y 21 de Hyena), tamano oculto 1920, 15 cabezas de atencion, MLP de 5120 y una longitud de contexto de 8192 tokens. Los pesos se distribuyen en bf16, con los buffers de polos, residuos y RoPE en fp32. La licencia declarada del port es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: convoluciones Hyena (filtros cortos, medios e implicitos largos) + atencion con grouped query attention y RoPE |
| Parametros totales | 1.107.990.016 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | No se han publicado cuantizaciones; pesos en bf16 con buffers de polos, residuos y RoPE en fp32 |
| Idiomas soportados | No aplica: modela ADN, no lenguaje natural. Tokenizador byte-level de vocabulario 512 (un token por nucleotido) |
| Licencia | Apache-2.0 (los pesos y el codigo originales de Evo 2 siguen siendo propiedad de sus titulares bajo sus terminos originales) |
| Formato de pesos | safetensors, con codigo de modelado incluido en el repositorio (`trust_remote_code=True`) |
| Capas | 25 (4 de atencion, 21 de Hyena) |
| Tamano oculto | 1920 |
| Cabezas de atencion | 15 |
| Tamano de MLP | 5120 |
| Tamano del repositorio | 2.2 GB |
| Pipeline | text-generation |
| Descargas / likes | 0 descargas / 1 like |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de convoluciones Hyena y atencion. De las 25 capas, 21 son de Hyena y solo 4 usan atencion con grouped query attention y RoPE. Los filtros de Hyena son de tres tipos: cortos, medios e implicitos largos. El modelo opera sobre un tokenizador byte-level de vocabulario 512 que asigna un token por nucleotido, lo que permite puntuar y generar secuencias de ADN a resolucion de base individual. La implementacion de este repositorio es una reescritura en PyTorch puro, sin dependencia de Vortex ni de kernels especificos.

Sobre el entrenamiento no hay informacion en los materiales proporcionados: la model card indica explicitamente que los pesos se convirtieron desde el checkpoint oficial Vortex sin reentrenamiento alguno, por lo que este repositorio no aporta datos sobre numero de tokens, composicion del dataset ni fases de RLHF o DPO. Tampoco se detalla el proceso de entrenamiento del checkpoint original. La innovacion principal de esta publicacion es de ingenieria, no de modelado: portar un modelo genomico hibrido a la interfaz estandar de `transformers` conservando los pesos originales.

## Capacidades

- Puntuacion de secuencias de ADN: el modelo devuelve logits sobre el vocabulario de 512 tokens, lo que permite calcular verosimilitudes de secuencias nucleotidicas.
- Generacion de secuencias de ADN: soporta `generate` con muestreo (temperatura, top_k), util para exploracion de secuencias.
- Modelado a resolucion de un nucleotido: un token por base, sin tokenizacion por subpalabras.
- Completado de genes: el paper original reporta resultados en un panel de completado de genes procariotas con el modelo base de 1B.
- Al ser un modelo base (no ajustado por instrucciones), no dispone de modo conversacional, ni de tool calling, ni de function calling.
- No se documentan capacidades multimodales, de vision ni de audio.
- No se documentan capacidades de agente ni de razonamiento multi-paso, que no aplican al dominio de secuencias genomicas.
- Capacidades multilingues: no aplica, el modelo no procesa lenguaje natural.

## Casos de uso

- Puntuacion de variantes y secuencias en investigacion genomica: el modelo calcula log-verosimilitudes sobre secuencias de hasta 8192 nucleotidos, lo que permite comparar el ajuste de una secuencia de referencia frente a una variante en un pipeline de analisis.
- Completado y diseno de genes procariotas: la model card referencia un panel de completado de genes con 50 generaciones por gen, un flujo reproducible con el script incluido en el repositorio de conversion.
- Filtrado y curación de datos genomicos: usar la verosimilitud asignada a cada secuencia como criterio para descartar regiones mal ensambladas o fuera de distribucion antes de entrenar otros modelos.
- Fine-tuning como backbone genomico: al cargar con `AutoModelForCausalLM` en PyTorch estandar, sirve como punto de partida para ajuste supervisado en tareas especificas sin montar la pila Vortex.
- Prototipado academico y docencia: permite experimentar con un modelo genomico de 1B en un entorno `transformers` convencional, sin infraestructura especializada ni GPU de datacenter.
- Analisis de regiones regulatorias o codificantes: puntuar ventanas de contexto largo (hasta 8192 tokens) para estudiar como el modelo asigna probabilidad a distintas arquitecturas de secuencia.
- Generacion de candidatos en diseno de secuencias: muestrear secuencias con `temperature` y `top_k` como generador de propuestas que despues se filtran con criterios biologicos externos.
- Reproducibilidad de resultados: el repositorio incluye un script para reproducir el panel del paper original, lo que permite verificar que la conversion de pesos preserva el comportamiento del checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks propios de esta conversion. La model card indica explicitamente que no se ejecuto ninguna evaluacion nueva para esta subida. El unico dato de referencia procede del paper original y corresponde al modelo base de 1B, no a este port:

| Evaluacion | Modelo | Resultado | Notas |
|---|---|---|---|
| Recuperacion media de aminoacidos (panel de completado de genes procariotas) | Evo 2 1B base (original) | 64.9 | 50 generaciones por gen; dato del paper original |
| Evaluacion propia de esta conversion | Evo2-1B-Base (port) | No disponible | No se ejecuto evaluacion para esta subida |

No hay datos disponibles que comparen este modelo con alternativas en la misma tabla de resultados. Cualquier cifra de rendimiento de la implementacion portada en terminos de latencia o throughput tampoco esta publicada.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 2.2 GB en bf16, calculado a partir de los 1.107.990.016 parametros y del tamano del repositorio (2.2 GB). Los buffers de RoPE, polos y residuos anadidos en fp32 incrementan ligeramente esa cifra.
- VRAM estimada total en inferencia: del orden de 3 a 4 GB con contexto completo de 8192 tokens, como estimacion derivada del tamano de pesos y de las activaciones; no hay mediciones publicadas.
- Cabe en GPU de consumo: si. Una RTX 3060 de 12 GB, una RTX 4070 o una RTX 4090 tienen margen suficiente para los pesos y el contexto.
- GPU de datacenter: A100, H100 y similares no son necesarias para este tamano, aunque la implementacion portada no aprovecha FP8 ni kernels fusionados, por lo que no se beneficia de sus aceleradores especificos.
- Opciones de despliegue: unicamente `transformers` con `trust_remote_code=True`, ya que el codigo de modelado esta incluido en el repositorio. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, ni existencia de pesos en GGUF.
- Latencia y throughput: no disponibles. La model card advierte de que, al no haber decodificacion con estado recurrente ni cache efectiva, la generacion recalcula el prefijo completo en cada paso y se vuelve lenta a partir de unos cientos de tokens. El ejemplo oficial usa `use_cache=False`.
- Para inferencia a gran escala, la propia model card recomienda usar la pila original o NVIDIA NIM, no este port.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Implementacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Evo2-1B-Base (port de Aquiles-ai) | 1.107.990.016 | 8192 tokens | PyTorch puro, carga con `AutoModelForCausalLM` | Apache-2.0 (port) | HuggingFace, safetensors, `trust_remote_code=True` |
| Evo 2 1B base original (`evo2_1b_base`, Arc Institute) | 1B | No disponible en la informacion proporcionada | Vortex, con Transformer Engine y kernels personalizados | Terminos originales del proyecto Evo 2 | Repositorio oficial del Arc Institute |
| Otros modelos genomicos de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

La comparacion relevante en este caso es entre el checkpoint original y su port: comparten pesos, pero difieren en eficiencia. El port gana en facilidad de integracion (sin dependencias exotica) y pierde en velocidad de generacion, al carecer de FlashAttention, FP8, kernels fusionados y decodificacion con estado recurrente.

## Limitaciones y advertencias

- Es un port no oficial: no lo mantiene el Arc Institute y no ha pasado por una validacion de equivalencia funcional publicada mas alla del script de reproduccion incluido.
- Menor eficiencia que el original: sin FlashAttention, sin ruta FP8, sin kernels fusionados y sin decodificacion con estado recurrente. La generacion recalcula el prefijo completo en cada paso y se degrada a partir de unos cientos de tokens.
- No se ejecuto ninguna evaluacion para esta subida, por lo que no hay garantia documentada de que los pesos convertidos reproduzcan exactamente las metricas del checkpoint original.
- Modelo base sin ajuste por instrucciones: no responde a prompts en lenguaje natural, no soporta tool calling ni agentes, y no debe desplegarse como asistente conversacional.
- Dominio restringido a secuencias de ADN con tokenizador byte-level de vocabulario 512. No procesa lenguaje natural ni otros formatos.
- Ventana de contexto limitada a 8192 tokens, muy inferior a la que ofrecen otras variantes de la familia Evo 2; en informacion proporcionada no consta la longitud de contexto del checkpoint original.
- Riesgo de generar secuencias biologicamente invalidas o sin sentido: como cualquier modelo generativo, puede producir salidas plausibles estadisticamente pero no funcionales. Cualquier uso en diseno genomico requiere validacion experimental.
- Sesgos: no hay informacion sobre la composicion del dataset original ni sobre sesgos taxonomicos, por lo que no se puede evaluar que linajes estan sobrerrepresentados o infrarrepresentados.
- Licencia: Apache-2.0 para este port, pero la model card advierte de que los pesos y el codigo originales de Evo 2 siguen siendo propiedad de sus titulares bajo sus terminos originales, que conviene revisar antes de un uso comercial.
- Uso en produccion: para inferencia a gran escala la propia model card desaconseja este port y recomienda la pila original o NVIDIA NIM.
- Sin datos de benchmarks propios: cualquier afirmacion de rendimiento depende del paper original, que evalua el checkpoint oficial, no esta conversion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aquiles-ai/Evo2-1B-Base
- Repositorio del proyecto original Evo 2 (Arc Institute): https://github.com/ArcInstitute/evo2
- Codigo de conversion del checkpoint: https://github.com/Aquiles-ai/Evo2-transformers
- Paper original: Brixi et al., "Genome modelling and design across all domains of life with Evo 2", Nature, 2026. DOI: https://doi.org/10.1038/s41586-026-10176-5
