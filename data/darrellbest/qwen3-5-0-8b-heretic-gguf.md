# darrellbest/Qwen3.5-0.8B-Heretic-GGUF

## Resumen

Qwen3.5-0.8B-Heretic-GGUF es una compilacion en formato GGUF del modelo darrellbest/Qwen3.5-0.8B-Heretic, que a su vez es una version del Qwen/Qwen3.5-0.8B de Alibaba a la que se le ha eliminado el comportamiento de rechazo mediante la herramienta Heretic y una tecnica de ablacion de rango arbitrario (Arbitrary-Rank Ablation, ARA) sobre los pesos completos. El autor del repositorio es darrellbest. El modelo base pertenece a la gama Qwen3.5, descrita por fuentes externas como una familia de transformers densos multimodales con comprension nativa de vision e imagen a un coste computacional muy bajo.

El interes de esta ficha reside en dos factores. Por un lado, el tamano: 772.845.888 parametros totales (aproximadamente 0,77 mil millones), lo que lo situa en la gama mas baja de la familia Qwen3.5 y permite ejecutarlo en hardware muy modesto, incluso en CPU. Por otro, la modificacion: el proceso de abliteracion reduce la tasa de rechazos de 98/100 a 15/100 con una divergencia KL de 0,0714 respecto al modelo original, es decir, un cambio de comportamiento medido y acotado.

El repositorio incluye tres cuantizaciones GGUF (BF16 sin perdida, Q8_0 y Q4_K_M) mas un proyector de vision independiente en F16, lo que permite entrada de imagen cargando el fichero mmproj junto con cualquiera de las tres cuantizaciones. La licencia declarada es Apache-2.0, heredada del modelo base de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto e imagen); arquitectura concreta del backbone no detallada en la informacion disponible |
| Parametros totales | 772.845.888 (aproximadamente 0,77 B), dato real de safetensors |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 262.144 tokens segun una fuente externa (codersera.com) referida al modelo base Qwen3.5-0.8B; la model card de este repositorio no lo especifica |
| Tipos de cuantizacion | GGUF: BF16 (sin perdida), Q8_0, Q4_K_M. En repositorios hermanos: FP8 W8A8 y NVFP4 con compressed-tensors |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (enlace de licencia al repositorio Qwen/Qwen3.5-0.8B) |
| Formato de pesos | GGUF (tres cuantizaciones) + mmproj F16 para el codificador de vision |
| Proyector de vision | Qwen3.5-0.8B-Heretic-mmproj-F16.gguf, 0,20 GB |
| Tamano del repositorio | 3,1 GB |
| Ficheros | BF16 1,56 GB; Q8_0 0,83 GB; Q4_K_M 0,54 GB |
| Modelo base | darrellbest/Qwen3.5-0.8B-Heretic (relacion: quantized) |
| Pipeline declarado | image-text-to-text |
| Fecha de creacion | 25 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo es un transformer denso multimodal que soporta comprension nativa de vision e lenguaje, segun la descripcion del modelo base Qwen3.5-0.8B recogida en fuentes externas. Cuenta con 772.845.888 parametros y un proyector de vision separado que se distribuye como fichero mmproj independiente, lo que confirma que el codificador visual esta desacoplado del cuerpo del modelo y se carga por separado en llama.cpp. No se dispone de informacion sobre el numero de capas, el numero de cabezas de atencion, el vocabulario ni el esquema de atencion empleado.

La innovacion tecnica relevante de esta compilacion no esta en el entrenamiento, sino en la modificacion posterior de los pesos. El autor aplico Heretic con Arbitrary-Rank Ablation de peso completo para eliminar el comportamiento de rechazo del modelo original. Las metricas publicadas son una reduccion de la tasa de rechazo de 98/100 a 15/100, con una divergencia KL de 0,0714 frente al modelo sin modificar, lo que indica que el resto de la distribucion de salida se preserva en gran medida. La conversion a GGUF se realizo con convert_hf_to_gguf.py de llama.cpp y la cuantizacion con llama-quantize sin uso de imatrix. No se detalla la composicion del dataset de entrenamiento original, el numero de tokens vistos ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en formato chat, con plantilla Jinja compatible con llama.cpp mediante la opcion --jinja.
- Comprension de imagen: el modelo puede describir el contenido de una imagen cuando se carga el proyector mmproj. En las pruebas del autor describio correctamente una imagen de prueba con un circulo rojo y un cuadrado azul.
- Modo de razonamiento (thinking mode) activado por defecto; el autor verifico su funcionamiento con problemas aritmeticos y de palabras.
- Control del modo de razonamiento por peticion: se puede desactivar con chat_template_kwargs {"enable_thinking": false} en llama.cpp o con think: false en Ollama.
- Razonamiento aritmetico y resolucion de problemas de palabras de complejidad baja: 27 a 30 aciertos sobre 40 en la evaluacion del autor, dependiendo de la cuantizacion.
- Comportamiento con guardarrailes reducidos: la tasa de rechazo baja a 15/100, lo que implica mayor disposicion a responder a peticiones que el modelo original rechazaria.
- Capacidades multilingues: no disponible.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible, aunque el modo thinking esta presente.

## Casos de uso

- Despliegue en hardware de gama baja o en CPU: con la cuantizacion Q4_K_M (0,54 GB) el modelo cabe en practicamente cualquier equipo, incluidos portatiles sin GPU dedicada, lo que permite prototipar asistentes conversacionales locales sin coste de infraestructura.
- Procesamiento de imagenes en el borde: cargando el mmproj F16 junto al modelo, se puede construir un clasificador o descritor de imagenes que corra integramente en local, util para etiquetado automatico de fotografias o verificacion visual sencilla.
- Filtrado y preprocesado de texto a gran escala: su bajo coste por token permite usarlo como modelo de primera pasada para tareas de extraccion, resumen corto o clasificacion masiva antes de escalar a un modelo mayor.
- Experimentacion en investigacion sobre alineacion y seguridad: al estar disponible la version original con guardarrailes y la version abliterada con la metrica de divergencia KL documentada, sirve como caso de estudio reproducible de como una ablacion de pesos afecta al comportamiento de rechazo.
- Desarrollo de asistentes conversacionales con contexto muy largo: si se confirma la ventana de 262.144 tokens del modelo base, permitiria mantener conversaciones o documentos extensos en memoria, aunque la KV cache correspondiente debe dimensionarse en consecuencia.
- Pruebas comparativas de cuantizacion: el repositorio ofrece BF16, Q8_0 y Q4_K_M con la misma evaluacion, lo que permite medir la degradacion real de cada nivel de cuantizacion en tareas de razonamiento antes de decidir que fichero desplegar en produccion.
- Generacion de contenido sin restricciones tematicas en entornos controlados: la reduccion de rechazos lo hace util para escritura creativa o simulaciones donde el modelo original bloquearia la respuesta, siempre bajo responsabilidad del operador.

## Benchmarks y rendimiento

Los unicos datos de evaluacion publicados son los del autor en la model card. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

Evaluacion de razonamiento en modo thinking (4 problemas aritmeticos y de palabras multiplicados por 10 semillas, muestreo recomendado por Qwen, 40 ejecuciones en total):

| Version | Ejecuciones correctas y finalizadas |
|---|---|
| GGUF BF16 | 30/40 |
| GGUF Q8_0 | 30/40 |
| GGUF Q4_K_M | 27/40 |
| Original en vLLM | 26/40 |

Metricas de abliteracion publicadas por el autor:

| Metrica | Qwen3.5-0.8B original | Qwen3.5-0.8B-Heretic |
|---|---|---|
| Tasa de rechazos | 98/100 | 15/100 |
| Divergencia KL respecto al original | No aplica | 0,0714 |

Verificacion funcional: los tres ficheros GGUF se cargaron en llama-server junto con el mmproj, respondieron correctamente a peticiones ordinarias y describieron correctamente la imagen de prueba.

## Requisitos de hardware

- VRAM estimada solo para pesos (incluyendo el proyector de vision de 0,20 GB): BF16 aproximadamente 1,76 GB; Q8_0 aproximadamente 1,03 GB; Q4_K_M aproximadamente 0,74 GB. Hay que anadir memoria para la KV cache y el runtime de llama.cpp.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. El modelo funciona sin problemas en RTX 3060, RTX 4060, RTX 4090, A100 o H100; en estas ultimas el modelo queda enormemente sobredimensionado en cuanto a recursos.
- Cabe en GPU de consumo: si, sin ninguna duda, en cualquier GPU de consumo moderna, y tambien en iGPU integradas con memoria compartida suficiente.
- Ejecucion en CPU: viable en exclusiva con la cuantizacion Q4_K_M, con velocidad de generacion dependiente del numero de nucleos y del ancho de banda de memoria.
- Opciones de despliegue para este repositorio: llama.cpp (llama-server, llama-cli) y Ollama. La version en safetensors del modelo hermano es la indicada para transformers, vLLM y SGLang; existe ademas un hermano en FP8 W8A8 para vLLM y otro en NVFP4 para vLLM sobre Blackwell.
- Carga del modo vision: es obligatorio pasar --mmproj Qwen3.5-0.8B-Heretic-mmproj-F16.gguf. Ejemplo del autor: llama-server -m Qwen3.5-0.8B-Heretic-Q8_0.gguf --mmproj Qwen3.5-0.8B-Heretic-mmproj-F16.gguf --jinja -ngl 99.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo.
- Contexto largo: si se utiliza la ventana de 262.144 tokens del modelo base, la KV cache pasa a dominar el consumo de memoria y puede superar ampliamente el tamano de los pesos; conviene medir el consumo real antes de desplegar con contextos muy extensos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Comportamiento / disponibilidad |
|---|---|---|---|---|---|
| darrellbest/Qwen3.5-0.8B-Heretic-GGUF (este) | 0,77 B | No especificado en la model card (262.144 tokens en el base, segun fuente externa) | GGUF BF16, Q8_0, Q4_K_M + mmproj | Apache-2.0 | 15/100 rechazos, KL 0,0714; 27-30/40 en la prueba de razonamiento |
| Qwen/Qwen3.5-0.8B (original) | 0,77 B | 262.144 tokens (fuente externa) | safetensors | Apache-2.0 | 98/100 rechazos; 26/40 en la misma prueba de razonamiento en vLLM |
| darrellbest/Qwen3.5-0.8B-Heretic | 0,77 B | No disponible | bf16 safetensors, 1,78 GB | Apache-2.0 | Misma abliteracion; pensado para transformers, vLLM y SGLang |
| mradermacher/Qwen3.5-0.8B-heretic-tuned-GGUF | No disponible | No disponible | GGUF | No disponible | Variante abliterada y ajustada de terceros; sin metricas publicadas en la informacion disponible |
| FadedRedStar/Qwen3.5-0.8B-heretic-GGUF | No disponible | No disponible | GGUF | No disponible | Variante abliterada de terceros; sin metricas publicadas en la informacion disponible |
| Qwen3.5 4B | No disponible | No disponible | No disponible | No disponible | Alternativa recomendada por una fuente externa para tareas de codigo, donde el 0.8B rinde mal |

## Limitaciones y advertencias

- Guardarrailes reducidos por diseno: el modelo ha sido modificado deliberadamente para disminuir sus rechazos (de 98/100 a 15/100). Puede generar contenido que el modelo original bloquearia, incluido material danino o inapropiado. El propio autor advierte de que la responsabilidad del uso recae en el operador.
- No es un modelo alineado para produccion con requisitos de seguridad. No debe desplegarse en aplicaciones orientadas al publico sin capas adicionales de moderacion.
- Riesgo de alucinacion elevado: con menos de 1000 millones de parametros, la fidelidad factual es limitada, especialmente en dominios especializados.
- Rendimiento debil en codigo: una fuente externa indica explicitamente que la precision en tareas de programacion es baja en la gama 0.8B y recomienda subir a Qwen3.5 4B para cualquier tarea de codigo.
- Contexto: la cifra de 262.144 tokens proviene de una fuente externa referida al modelo base, no de la model card de este repositorio. Debe verificarse antes de disenar aplicaciones que dependan de ventanas muy largas.
- Idiomas: no se ha publicado la lista de idiomas soportados. No se puede asumir un rendimiento multilingue homogeneo.
- Cuantizacion: Q4_K_M pierde rendimiento medible frente a Q8_0 y BF16 (27/40 frente a 30/40 en la prueba del autor). Para tareas sensibles conviene usar Q8_0 o BF16.
- Se desconoce si el proceso de abliteracion degrada capacidades distintas de las evaluadas. La evaluacion publicada cubre 40 ejecuciones de razonamiento aritmetico y una imagen de prueba, lo que es una cobertura muy limitada.
- Licencia Apache-2.0 heredada del modelo base, que permite uso comercial, pero el enlace de licencia apunta al repositorio de Qwen; conviene revisar los terminos alli indicados.
- Repositorio sin adopcion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad y mayor riesgo de errores no detectados.
- No hay informacion sobre sesgos demograficos, etnicos o de otro tipo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/darrellbest/Qwen3.5-0.8B-Heretic-GGUF
- Modelo base (safetensors): https://huggingface.co/darrellbest/Qwen3.5-0.8B-Heretic
- Variante FP8 W8A8: https://huggingface.co/darrellbest/Qwen3.5-0.8B-Heretic-FP8
- Variante NVFP4: https://huggingface.co/darrellbest/Qwen3.5-0.8B-Heretic-NVFP4
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Repositorio de la serie Qwen: https://github.com/QwenLM/Qwen3.8
- Variante GGUF de terceros (FadedRedStar): https://huggingface.co/FadedRedStar/Qwen3.5-0.8B-heretic-GGUF
- Variante GGUF de terceros (mradermacher): https://huggingface.co/mradermacher/Qwen3.5-0.8B-heretic-tuned-GGUF
- Articulo externo con datos del modelo base y la ventana de contexto: https://codersera.com/blog/run-and-benchmark-qwen35-08b/
- Leaderboard de modelos autoalojados: https://onyx.app/self-hosted-llm-leaderboard
