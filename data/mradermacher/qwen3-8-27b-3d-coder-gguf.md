# mradermacher/Qwen3.8-27B-3D-Coder-GGUF

## Resumen

Qwen3.8-27B-3D-Coder-GGUF es la publicacion de cuantizaciones estáticas en formato GGUF del modelo syaikhipin/Qwen3.8-27B-3D-Coder, un ajuste fino (QLoRA) orientado a la generacion de escenas 3D con Three.js. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de versiones GGUF de modelos abiertos, que distribuye los pesos en multiples niveles de compresion (de Q2_K a Q8_0) junto con los ficheros mmproj necesarios para el componente multimodal.

El modelo base parte de un modelo de la familia Qwen con aproximadamente 26.900 millones de parametros (26.895.998.464 segun los pesos en safetensors), ajustado sobre el dataset ccore/ThreeJS-3D-Scenes. El resultado es un modelo especializado en generar codigo JavaScript de Three.js para construir escenas tridimensionales, una tarea de nicho pero muy concreta dentro de la generacion de codigo asistida.

La relevancia de esta ficha radica en que permite ejecutar un modelo de casi 27.000 millones de parametros en hardware de consumo mediante cuantizacion GGUF, con opciones que van desde los 10,8 GB del Q2_K hasta los 28,7 GB del Q8_0. La licencia Apache 2.0 facilita su uso comercial, aunque la informacion publicada sobre el modelo base es escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de la familia Qwen; detalles especificos no disponibles) |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj Q8_0 y f16 |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo base syaikhipin/Qwen3.8-27B-3D-Coder se obtuvo mediante QLoRA (cuantizacion de 4 bits con adaptadores de bajo rango) sobre un modelo de la familia Qwen de aproximadamente 27.000 millones de parametros. El dataset de ajuste es ccore/ThreeJS-3D-Scenes, centrado en escenas 3D construidas con Three.js, lo que explica la especializacion del modelo en generacion de codigo para graficos 3D en navegador.

No se han publicado en la informacion disponible detalles sobre el numero de tokens de entrenamiento, la composicion completa del dataset, ni si se aplicaron fases de RLHF o DPO. Tampoco se especifican innovaciones tecnicas como decodificacion especulativa o mecanismos de atencion alternativos. La model card del repositorio GGUF se limita a documentar el proceso de cuantizacion y los ficheros generados, no la arquitectura interna del modelo original.

## Capacidades

- Generacion de codigo especializado en Three.js para construir escenas 3D en el navegador.
- Generacion de codigo JavaScript en general, heredada del modelo base Qwen.
- Conversacion multi-turno (etiqueta conversational en el repositorio).
- Soporte multimodal: el repositorio incluye ficheros mmproj (Q8_0 y f16), lo que indica capacidad de procesar entradas visuales junto con texto.
- Capacidades de razonamiento y matematicas del modelo base: no verificadas en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: la model card declara unicamente ingles (en).

## Casos de uso

- Generacion de escenas 3D para prototipado web: el modelo puede producir codigo Three.js completo (geometrias, materiales, luces, camara) a partir de una descripcion textual, acelerando la creacion de maquetas interactivas en el navegador.
- Herramientas de autoria 3D asistida: integrado en un editor o IDE, el modelo sugiere fragmentos de codigo para modificar escenas existentes, gracias a su ajuste especifico sobre el dataset ThreeJS-3D-Scenes.
- Educacion y tutoriales de graficos 3D: sirve para generar ejemplos didacticos de Three.js con explicaciones, util en plataformas de aprendizaje de desarrollo web.
- Generacion de demos interactivas para marketing: permite crear rapidamente visualizaciones 3D embebidas en paginas web para presentaciones de producto.
- Automatizacion de tareas de codigo frontend: al estar cuantizado en GGUF, puede desplegarse en local con llama.cpp u Ollama para asistir en tareas de generacion de codigo sin depender de APIs externas.
- Investigacion sobre ajuste fino especializado: sirve como referencia para estudiar como un QLoRA sobre un dataset de nicho (escenas 3D) modifica el comportamiento de un modelo generalista de 27B.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q2_K (10,8 GB) y Q4_K_M (16,6 GB) permiten ejecutar el modelo en GPUs de consumo de gama alta, algo inviable con los pesos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano del fichero GGUF mas overhead de contexto):
  - Q2_K: ~10,8 GB de pesos; ~12-14 GB de VRAM en total.
  - Q4_K_M: ~16,6 GB de pesos; ~18-20 GB de VRAM en total.
  - Q8_0: ~28,7 GB de pesos; ~30-32 GB de VRAM en total.
- GPU recomendadas: A100 40/80 GB, H100 para los cuantizados mayores con contexto largo; RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) para Q4_K_M.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con cuantizaciones Q4/Q5; en GPUs de 12-16 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el repositorio declara compatibilidad con endpoints.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-3D-Coder (este, GGUF) | ~26,9B | no disponible | Apache 2.0 | GGUF | Especializado en Three.js/3D |
| Modelo base Qwen de ~27B (sin especificar version) | ~27B | no disponible | no disponible | safetensors | Generalista, sin ajuste 3D |
| Otras cuantizaciones GGUF de modelos ~27B de la familia Qwen | ~27B | no disponible | Apache 2.0 (segun familia) | GGUF | Sin especializacion en 3D |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- La model card declara unicamente ingles como idioma; el rendimiento en castellano no esta verificado.
- Es un ajuste fino de nicho (Three.js/3D): fuera de ese dominio puede degradarse respecto al modelo base.
- Riesgo de alucinacion en APIs de Three.js y en codigo generado; requiere validacion en produccion.
- No se han publicado datos sobre sesgos, contexto maximo ni evaluaciones de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base original de Qwen, ya que el ajuste QLoRA no exime de las condiciones del modelo subyacente.
- El repositorio GGUF tiene muy poca traccion (1 like, ~1.591 descargas) y no hay garantias de mantenimiento.
- Las cuantizaciones Q2_K y Q3_K_S degradan la calidad de forma notable; para produccion se recomienda Q4_K_M o superior.
- El componente multimodal depende de ficheros mmproj separados; sin ellos, las capacidades de vision no estan disponibles.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-3D-Coder-GGUF
- Modelo base: https://huggingface.co/syaikhipin/Qwen3.8-27B-3D-Coder
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Qwen3.8-27B-3D-Coder-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-3D-Coder-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/ccore/ThreeJS-3D-Scenes
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
