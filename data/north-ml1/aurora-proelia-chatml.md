# North-ML1/Aurora-Proelia-ChatML

## Resumen

Aurora Proelia ChatML es un modelo de lenguaje experimental de 207 millones de parámetros desarrollado por North-ML1 como variante del modelo Aurora Proelia. Se trata de un checkpoint de arquitectura propietaria denominada "Aurora", que no es compatible con el ecosistema Transformers de Hugging Face y requiere un runtime nativo específico para su inferencia. El modelo fue sometido a un ajuste fino supervisado (SFT) con 2.048 actualizaciones efectivas sobre un corpus en formato ChatML, con el objetivo de enseñarle la superficie de entrada/salida de roles (system, user, assistant) sin pretender mejorar su conocimiento general.

La relevancia de este modelo reside en su carácter de investigación: demuestra cómo un checkpoint pequeño puede adaptarse a un formato de chat convencional mediante un ajuste ligero, aunque sus capacidades de razonamiento y aritmética siguen siendo muy limitadas. Está pensado para desarrolladores e investigadores que quieran estudiar el comportamiento de modelos compactos con interfaces de chat, no para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Propietaria Aurora (no compatible con Transformers) |
| Parametros totales | 221.278.208 (207M segun el autor) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Other (uso reservado, sin licencia open-source) |
| Formato de pesos | Safetensors (checkpoint nativo Aurora con runtime propio) |

## Arquitectura y entrenamiento

La arquitectura interna no se detalla en la documentacion publicada; se describe únicamente como un "checkpoint Aurora" propietario. El modelo parte del checkpoint liberado de Aurora Proelia y recibe 2.048 actualizaciones efectivas de SFT sobre un corpus ChatML con las respuestas enmascaradas. El objetivo del entrenamiento fue enseñar la estructura de roles del formato ChatML, no ampliar el conocimiento general. No se mencionan técnicas como RLHF, DPO ni decodificación especulativa. El entrenamiento se realizó sobre una base de datos no especificada, y el modelo se distribuye con un runtime nativo, un archivo YAML de configuración y un tokenizador propio.

## Capacidades

- Generacion de texto en ingles con formato de chat ChatML (system, user, assistant).
- Respuesta a preguntas simples de identidad y conocimiento general basico (ej. "What is Python?").
- Manejo de conversaciones multi-turno en el formato ChatML, aunque con limitaciones en coherencia a largo plazo.
- Capacidad de seguir instrucciones simples y directas, siempre que no requieran razonamiento complejo.
- Sin soporte para tool calling, agentes, vision, audio ni modos de pensamiento extendido.
- Rendimiento muy limitado en aritmetica, razonamiento multi-paso y tareas que exijan conocimiento factual actualizado.

## Casos de uso

- Experimentacion academica con formatos de chat: el modelo sirve para estudiar como un checkpoint pequeño puede adaptarse a una interfaz de roles mediante SFT, comparando el comportamiento antes y despues del ajuste.
- Pruebas de compatibilidad de runtimes propietarios: desarrolladores que trabajen con el ecosistema Aurora pueden utilizar este checkpoint para verificar la integracion de formatos de chat en sus herramientas.
- Generacion de respuestas cortas en entornos controlados: para preguntas de tipo "¿quien eres?" o definiciones basicas, el modelo puede producir salidas coherentes, aunque siempre con supervisión humana.
- Analisis de regresion en modelos pequeños: los ficheros `benchmarks.json` y `regression_comparison.json` incluidos permiten reproducir las evaluaciones y estudiar el impacto del ajuste ChatML en tareas especificas.
- Prototipado rapido de interfaces de chat: antes de escalar a modelos mayores, se puede usar este checkpoint para validar flujos de conversacion en entornos de desarrollo.
- Educacion en IA: como ejemplo de modelo de investigacion con limitaciones claras, es util para ensenar sobre sesgos, alucinaciones y la diferencia entre ajuste de superficie y aprendizaje profundo.

## Benchmarks y rendimiento

La model card incluye una evaluacion sobre un subconjunto mini de benchmarks publicos, comparando el checkpoint liberado de Aurora Proelia con la variante ChatML. Los resultados son los siguientes:

| Benchmark | Aurora Proelia (liberado) | Aurora Proelia ChatML |
|---|---:|---:|
| MMLU (57 preguntas) | 14/57 · 24.6% | 16/57 · 28.1% |
| ARC-Challenge (50 preguntas) | 13/50 · 26.0% | 15/50 · 30.0% |
| HellaSwag (50 preguntas) | 19/50 · 38.0% | 19/50 · 38.0% |
| GSM8K (50 preguntas) | 1/50 · 2.0% | 0/50 · 0.0% |

Estos datos provienen de slices transparentes de datasets publicos de Hugging Face, no de evaluaciones oficiales de liderboards. Se observa una ligera mejora en MMLU y ARC-Challenge, pero un empeoramiento en GSM8K. El autor indica que el resultado practico mas relevante es que la variante ChatML responde correctamente a prompts de identidad y Python, mientras que el checkpoint original tendia a repetir el prompt.

## Requisitos de hardware

- VRAM estimada: con 221 millones de parametros, en FP32 se necesitan aproximadamente 885 MB de VRAM; en FP16, unos 442 MB. Cabe en cualquier GPU consumer moderna (GTX 1060 6GB, RTX 2060, etc.) e incluso en CPU con suficiente RAM.
- GPU recomendadas: no se requieren GPUs de alta gama; una GPU de 4-6 GB es suficiente para inferencia.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI debido a la arquitectura propietaria. Se debe usar el runtime nativo Aurora incluido en el repositorio (`infer.py`).
- Latencia y throughput: no se proporcionan datos oficiales. Dado el tamaño reducido, se espera una latencia baja en GPU moderna, pero depende de la implementacion del runtime.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de la misma categoria (tamano ~200M con arquitectura propietaria y licencia restrictiva). Modelos open-source de tamano similar como GPT-2 (124M) o TinyLlama (1.1B) tienen arquitecturas bien documentadas y licencias permisivas, pero no se han publicado comparaciones directas de rendimiento con Aurora Proelia ChatML. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Modelo de investigacion pequeno: no es fiable para aritmetica multi-paso, razonamiento profundo, hechos actuales, preguntas especializadas sin contexto ni instrucciones complejas.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido falso o inventado; se recomienda verificar respuestas importantes.
- Limitaciones de idioma: solo entrenado en ingles; no soporta otros idiomas de forma fiable.
- Licencia restrictiva: no se concede licencia open-source; el uso queda reservado al propietario del repositorio. No se permite uso comercial sin autorizacion explicita.
- Arquitectura propietaria: no es compatible con Transformers, lo que impide su integracion en pipelines estandar de Hugging Face o herramientas populares.
- Rendimiento en GSM8K: el ajuste ChatML empeoro los resultados en aritmetica (0% frente al 2% del modelo base), lo que indica una degradacion en tareas de razonamiento numerico.
- Dependencia del runtime nativo: requiere el entorno Aurora completo, lo que limita la portabilidad y el despliegue en infraestructuras convencionales.

## Enlaces

- [Modelo en Hugging Face: North-ML1/Aurora-Proelia-ChatML](https://huggingface.co/North-ML1/Aurora-Proelia-ChatML)
- [Modelo base: North-ML1/Aurora-Proelia](https://huggingface.co/North-ML1/Aurora-Proelia)
