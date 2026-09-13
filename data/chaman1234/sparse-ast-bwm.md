# Chaman1234/Sparse-AST-BWM

## Resumen

Sparse-AST-BWM es una familia de modelos de lenguaje causales de nivel de byte (byte-level) desarrollada por el usuario Chaman1234 y publicada en HuggingFace bajo licencia Apache 2.0. Está especializada en la generación y autocompletado de codigo Python para Blender, cubriendo la API `bpy`, `mathutils`, `bmesh`, matematicas espaciales y geometria computacional aplicada a la creacion de escenas procedurales en 3D. El repositorio incluye cuatro variantes nominales de distinto tamano (3M, 10M, 100M y 200M parametros) mas checkpoints experimentales y artefactos de evaluacion.

La arquitectura, denominada Sparse-AST, es una pila serial de bloques transformer con normalizacion RMS, atencion causal multi-cabeza, proyeccion de subida, una ruta de activacion interna de tres vias y proyeccion de bajada. Cada bloque incorpora ademas BMW, un mecanismo de memoria recurrente con decaimiento aprendido que anade un estado por bloque. Los embeddings de entrada y la proyeccion de salida estan atados.

El dato mas relevante para un evaluador es su contexto nativo extremadamente corto: 64 tokens en las variantes 3M-32 y 10M-32, y solo 32 tokens en 100M-32 y 200M-32. Esto lo situa en la categoria de modelos de investigacion para completado local de fragmentos muy cortos, no como asistente conversacional ni como generador de scripts completos. Es un modelo de nicho, con 1.089 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse-AST: pila serial de bloques transformer con RMSNorm, atencion causal multi-cabeza, ruta de activacion de tres vias y memoria recurrente BMW por bloque; embeddings atados |
| Parametros totales | Cuatro variantes nominales: 3M-32, 10M-32, 100M-32 y 200M-32 (el numero indica el orden de magnitud de parametros segun la nomenclatura del autor; no se publica el recuento exacto) |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 64 tokens en 3M-32 y 10M-32; 32 tokens en 100M-32 y 200M-32 |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors/PyTorch; no se documentan versiones GGUF, AWQ, GPTQ ni cuantizaciones alternativas) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y checkpoints PyTorch (libreria declarada: pytorch) |

Dimensiones internas declaradas por variante:

| Variante | Capas | Ancho del modelo | Ancho feed-forward | Contexto nativo |
|---|---:|---:|---:|---:|
| 3M-32 | 4 | 256 | 512 | 64 tokens |
| 10M-32 | 6 | 384 | 768 | 64 tokens |
| 100M-32 | 18 | 704 | 1.408 | 32 tokens |
| 200M-32 | 28 | 800 | 1.600 | 32 tokens |

## Arquitectura y entrenamiento

Cada bloque de Sparse-AST contiene normalizacion RMS, atencion causal multi-cabeza, una proyeccion de subida, una ruta de activacion interna y una proyeccion de bajada. La ruta de activacion aplica tres representaciones elemento a elemento sobre la activacion proyectada `z`: la identidad `z`, `sign(z) * log(1 + |z|)` y `sign(z) * expm1(|z|)`. Una combinacion aprendida mezcla estas representaciones antes de la proyeccion de bajada. El autor especifica explicitamente que se trata de una eleccion de activacion interna y no de un router que sustituya una etapa serial del transformer por otra.

BMW anade un estado recurrente a cada bloque. Para la salida oculta `y`, el estado `s` y un decaimiento aprendido `d`, la actualizacion es `s_t = s_(t-1) * d + y_t * (1 - d)` y la salida del bloque es `output_t = y_t + memory_projection(s_t)`. El decaimiento se parametriza en positivo y se conserva dentro del checkpoint.

El repositorio incluye ademas `family-oldnew-1m/`, un checkpoint experimental construido sobre la arquitectura serial de 100M: en cada una de las 18 posiciones de bloque originales se crean una rama legacy y una rama nueva, combinadas localmente mediante `block_i*(x) = alpha_i(x) * block_i_old(x) + (1 - alpha_i(x)) * block_i_new(x)`. En la inicializacion, cada rama nueva es una copia exacta del state dict de su rama antigua correspondiente (pesos, parametros de normalizacion, parametros de router, parametros BMW, valores de decaimiento y buffers), por lo que ambas calculan la misma funcion al paso cero. Las ramas antiguas permanecen congeladas durante el experimento. El autor no reclama ninguna mejora medida para este checkpoint. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Prediccion del siguiente byte en secuencias de texto y codigo (modelo causal byte-level, sin tokenizador BPE).
- Autocompletado de codigo Python para Blender: `bpy`, `mathutils`, `bmesh`.
- Generacion de scripts de escena procedural: operaciones de malla, transformaciones, camaras y materiales.
- Codigo relacionado con matematicas espaciales y geometria computacional.
- Memoria recurrente por bloque (BMW) que aporta un estado persistente dentro de la ventana de contexto.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible; el contexto nativo de 32-64 tokens hace inviable el razonamiento multi-paso sostenido.
- Capacidades multilingues: no; el modelo esta declarado unicamente para ingles.
- Capacidades especiales (vision, audio, modo thinking): no disponibles. El propio autor advierte que la evaluacion realizada es texto/codigo y que no se ejecuto comprension de imagen ni renderizado real en Blender.

## Casos de uso

- Autocompletado dentro del editor de texto de Blender: dado un fragmento corto de codigo `bpy` (una llamada, un bucle o una linea de operacion de malla), el modelo completa los siguientes bytes. Es el escenario para el que fue entrenado y el unico compatible con su contexto de 32-64 tokens.
- Sugerencia de linea de operacion `bmesh`: completar instrucciones de edicion de malla (extrusion, bisel, subdivision) dentro de un bloque de codigo ya iniciado por la persona desarrolladora.
- Completado de expresiones con `mathutils`: finalizacion de operaciones con `Vector`, `Matrix`, `Euler` o `Quaternion` en calculos de transformacion de objetos.
- Asistencia en scripts de escena procedural: completar sentencias de creacion y posicionamiento de camaras, luces y materiales dentro de plantillas de script ya existentes.
- Generacion de fragmentos para pruebas de sintaxis: el smoke test del autor produjo salida sintacticamente valida en 5 de 5 prompts de Blender Python, lo que permite usarlo como generador de candidatos que despues se validan con `ast.parse` o ejecutando en Blender.
- Experimentacion en investigacion sobre arquitecturas: la combinacion de ruta de activacion ternaria y memoria recurrente BMW por bloque lo convierte en una plataforma de bajo coste computacional para estudiar mecanismos de memoria en transformers pequenos.
- Ensamblado por logits (ensemble denso): segun el autor, es posible ejecutar el mismo prompt tokenizado por bytes en `family-oldnew-1m`, `100M-32` y `200M-32` y combinar sus logits finales con pesos no negativos que sumen 1, siempre que se use el mismo vocabulario de bytes y el mismo contexto. Requiere computar todos los modelos para cada prompt, por lo que es un ensemble denso y no un enrutado disperso.

## Benchmarks y rendimiento

Se han publicado dos evaluaciones en la model card.

Smoke test de prompts de Blender: 5 de 5 prompts produjeron salida sintacticamente valida. El propio autor aclara que las escenas generadas no se ejecutaron en Blender y que la prueba no sustituye a un benchmark completo.

Proxy de texto tipo teacher-forced sobre 27 ficheros de tarea de BlenderBench, con longitud de secuencia 128:

| Split | Entropia cruzada | Precision top-1 (byte) | Precision top-5 (byte) |
|---|---:|---:|---:|
| Todas las tareas | 2,9197 | 38,69 % | 66,59 % |
| Nivel 1 (camara) | 2,0387 | 53,88 % | 76,28 % |
| Nivel 2 (atributos) | 3,0071 | 37,71 % | 65,80 % |
| Nivel 3 (composicional) | 2,9425 | 37,84 % | 66,19 % |

Advertencia del autor: son medidas teacher-forced sobre texto y codigo. No se realizo comprension de imagen de BlenderBench ni ejecucion real en Blender, por lo que no son una puntuacion multimodal ni de renderizado de escena. La model card menciona tambien un arnes de planificacion de grafo y descomposicion Q4 con fecha 2026-09-13, pero el texto disponible esta truncado y no incluye resultados numericos.

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del numero de parametros; no publicada por el autor): 3M en fp32 ~12 MB y en fp16 ~6 MB; 10M ~40 MB en fp32 y ~20 MB en fp16; 100M ~400 MB en fp32 y ~200 MB en fp16; 200M ~800 MB en fp32 y ~400 MB en fp16. Hay que sumar el coste de los estados recurrentes BMW y de las activaciones, muy reducido dado el contexto de 32-64 tokens.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente para todas las variantes. No se requiere A100, H100 ni hardware de centro de datos.
- Consumer GPU: si, con enorme margen. Cabe en cualquier GPU de consumo moderna (serie RTX 30/40, GTX 16, Radeon equivalentes) e incluso en GPU integradas.
- CPU: la inferencia en CPU es perfectamente viable para todas las variantes por su tamano.
- Opciones de despliegue: al distribuirse solo pesos safe­tensors/PyTorch, el despliegue natural es un script de PyTorch. No se proporcionan pesos GGUF, por lo que Ollama y llama.cpp requeririan una conversion previa por parte de la persona usuaria. vLLM o TGI son tecnicamente posibles pero desproporcionados para este tamano y no estan documentados por el autor.
- Latencia y throughput estimados: no disponibles.
- Nota sobre el repositorio: ocupa 2,9 GB en total, muy por encima de lo que ocupan los pesos de las variantes nominales; el volumen se explica por los checkpoints experimentales y los artefactos de evaluacion incluidos.

## Comparativa con modelos similares

La busqueda web realizada no ha devuelto ningun modelo comparable: los resultados obtenidos son paginas de ayuda de Windows en aleman, sin relacion con el modelo. Por tanto, la comparacion con alternativas externas de la misma categoria figura como no disponible.

A modo de referencia interna, la propia familia de variantes permite esta comparacion:

| Variante | Capas | Ancho | Contexto nativo | Uso previsto |
|---|---:|---:|---:|---|
| 3M-32 | 4 | 256 | 64 tokens | Pruebas minimas, entornos con recursos ínfimos |
| 10M-32 | 6 | 384 | 64 tokens | Autocompletado muy local |
| 100M-32 | 18 | 704 | 32 tokens | Base del experimento `family-oldnew-1m` |
| 200M-32 | 28 | 800 | 32 tokens | Variante de mayor capacidad nominal |

No se dispone de datos publicados que permitan comparar esta familia con modelos de generacion de codigo de proposito general, ni en parametros efectivos, ni en contexto, ni en rendimiento, ni en licencia, dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Contexto nativo extremadamente corto: 32 tokens en 100M-32 y 200M-32 y 64 tokens en 3M-32 y 10M-32. Esto limita el modelo a completados muy locales y descarta practicamente cualquier tarea conversacional o de razonamiento multi-paso.
- Modelo de investigacion: el propio autor indica que los scripts generados deben comprobarse ejecutandolos en Blender antes de usarlos.
- La evaluacion disponible es teacher-forced sobre texto/codigo; no se ejecuto Blender ni se midio comprension de imagen, por lo que no existe evidencia de que las escenas generadas funcionen.
- El smoke test de 5 de 5 prompts solo comprueba validez sintactica, no correccion semantica ni ejecutabilidad.
- Idioma: unicamente ingles declarado. El comportamiento en castellano no esta documentado.
- Tokenizacion a nivel de byte: implica secuencias mas largas en bytes para el mismo texto, lo que agrava aun mas la limitacion de contexto.
- Checkpoints experimentales: `family-oldnew-1m` no aclara una mejora medida y su uso en produccion no esta respaldado por el autor.
- El autor advierte de que no deben empalmarse capas de variantes distintas: las profundidades, anchos, estados recurrentes y disposicion de bloques difieren, por lo que sustituir una etapa interna no preserva la funcion. El unico punto de conexion seguro es la combinacion de logits finales.
- El autor advierte de que una mezcla de todos los modelos es un ensemble denso y no debe describirse como enrutado disperso.
- Sesgos conocidos: no disponibles (no se documenta ninguna evaluacion de sesgo).
- Riesgo de alucinacion: no cuantificado; en generacion de codigo se manifestaria como llamadas a funciones de la API de Blender inexistentes o con argumentos incorrectos. Cualquier salida debe pasar por validacion sintactica y ejecucion en Blender.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y de atribucion. No se declaran restricciones adicionales de uso aceptable.
- Estado del repositorio: 0 likes y 1.089 descargas en el momento de la consulta; no hay senales de mantenimiento activo mas alla de la actualizacion del 2026-09-13.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Chaman1234/Sparse-AST-BWM
- Repositorio de codigo: no disponible
- Paper o informe tecnico: no disponible
- Demo o espacio interactivo: no disponible
- Documentacion adicional del autor: no disponible
- Enlaces relevantes encontrados en la busqueda web: no disponible (los resultados obtenidos corresponden a paginas de ayuda de Windows y no guardan relacion con el modelo)
