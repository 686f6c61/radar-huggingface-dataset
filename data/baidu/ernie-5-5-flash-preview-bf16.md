# baidu/ERNIE-5.5-Flash-Preview-BF16

## Resumen

ERNIE 5.5 Flash Preview es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Baidu, publicado como checkpoint intermedio de post-entrenamiento sobre ERNIE 5.5 Flash Base. Con 280B parámetros totales y 14B activos por token, está diseñado para tareas de codigo, modelado 3D, trabajo de conocimiento y creacion de contenido, manteniendo una decodificacion rapida gracias a su arquitectura dispersa y a una cabeza de decodificacion especulativa (DSpark).

La innovacion principal respecto a su modelo base es la extension de la ventana de contexto de 128K a 1.048.576 tokens (1M) durante el mid-training, ademas de un post-entrenamiento orientado a agentes que le permite planificar y ejecutar tareas de larga duracion. El modelo comparte arquitectura y tokenizador con ERNIE 5.5 Flash Base, lo que facilita la reutilizacion de herramientas ya construidas para este ultimo.

Es relevante ahora porque representa uno de los primeros modelos abiertos de escala ~300B con contexto de 1M tokens y licencia Apache 2.0, lo que lo posiciona como una alternativa permisiva frente a modelos propietarios de capacidad similar. Al ser un checkpoint Preview, Baidu advierte que algunas capacidades pueden estar incompletas y que el post-entrenamiento continua en curso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (43 capas: 1 densa + 42 MoE); atencion hibrida 37 x HCA (head dim 512) + 6 x MLA-DSA (head dim 256), 64 cabezas |
| Parametros totales | 299.559.159.366 (~280B declarados por el autor; discrepancia entre model card y safetensors) |
| Parametros activos | 14B por token |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | BF16 (este repo); FP8 blockwise; MXFP4 en expertos enrutados (W4A8); FP8 KV cache; FP4 en indexer DSA |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

Otros datos: vocabulario de 201.216 tokens; 512 expertos enrutados (top-10) mas 1 compartido; tamano del repo 599,6 GB; modo thinking activado por defecto con `reasoning_effort` en low/medium/high (por defecto high).

## Arquitectura y entrenamiento

ERNIE 5.5 Flash Preview es un transformer de tipo Mixture-of-Experts con 43 capas, de las cuales una es densa y 42 son MoE. Cada capa MoE enruta cada token a los 10 expertos mas relevantes de un total de 512, ademas de un experto compartido, lo que resulta en 14B parametros activos sobre 280B totales. La atencion es hibrida: 37 capas usan HCA con dimension de cabeza 512 y 6 capas usan MLA-DSA con dimension 256, con 64 cabezas en total. El modelo incorpora una cabeza de borrador DSpark para decodificacion especulativa, que acelera tareas de agente de larga duracion con minima perdida de precision.

El entrenamiento parte de ERNIE 5.5 Flash Base, cuya arquitectura y tokenizador se conservan. Las nuevas capacidades provienen de mid-training y post-training; el mid-training extendio la longitud de contexto de 128K a 1M tokens. El modelo fue entrenado con cuantizacion consciente (quantization-aware training) para los expertos enrutados en MXFP4 (W4A8), lo que permite servir el modelo con pesos de expertos en FP4 manteniendo el resto en FP8 blockwise. La model card menciona entrenamiento en 300.000 espacios de trabajo para dominios como finanzas y derecho (10 millones de archivos de referencia en mas de 40 formatos) y en mas de 150.000 entornos de creacion de video, aunque no se detalla el volumen total de tokens ni la composicion exacta del dataset. No se especifica en la informacion disponible si se aplicaron RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activado por defecto y control de esfuerzo (`reasoning_effort`: low, medium, high).
- Codigo: correccion en bases de codigo reales, construccion de aplicaciones desde cero y planificacion/iteracion sobre tareas largas. Conocimiento de Unreal Engine, Unity y Godot.
- Modelado 3D y diseno: interpreta descripciones textuales de forma, proporcion y relaciones espaciales y genera scripts para Blender y software CAD.
- Trabajo de conocimiento: elabora hojas de calculo, documentos y presentaciones de calidad profesional a partir de material disperso.
- Creacion de video: recopila, genera y organiza material, define visuales y ritmo, y entrega un video finalizado; trabaja de una a dos horas por pieza.
- Soporte de agentes y razonamiento multi-paso: planifica, ejecuta e itera de forma sostenida en tareas largas (se documenta una tarea de codigo de 11 horas).
- Capacidades multilingues limitadas a ingles y chino.
- Tool calling / function calling: la model card menciona integracion en un "agent harness" y compatibilidad con endpoints, aunque no detalla el formato exacto de tool calling en la informacion disponible.
- Decodificacion especulativa mediante cabeza DSpark para acelerar la inferencia.

## Casos de uso

- Desarrollo de videojuegos asistido: el modelo puede planificar y escribir codigo C++ para Unreal Engine 5.8 a lo largo de sesiones de varias horas, manteniendo coherencia gracias a su contexto de 1M tokens y a su conocimiento de motores como Unity y Godot.
- Generacion de codigo en produccion: con soporte de agentes y tool calling, puede integrarse en pipelines de CI/CD para corregir fallos en bases de codigo reales, proponer parches y validar iterativamente dentro de un bucle automatizado.
- Modelado 3D y CAD automatizado: a partir de una descripcion textual, genera scripts que controlan Blender o software CAD para construir piezas de motor, edificios o escenas complejas, ensamblando activos existentes en el mismo flujo.
- Automatizacion de trabajo de conocimiento: procesa material disperso (mas de 40 formatos de archivo) para producir hojas de calculo, informes y presentaciones en dominios como finanzas y derecho, reduciendo el trabajo manual de sintesis.
- Creacion de video semiautomatica: recopila y organiza material, define el montaje y el ritmo, y entrega videos finalizados para divulgacion cientifica, motion comics o edicion creativa en sesiones de una a dos horas.
- Atencion al cliente multi-turno: la ventana de 1M tokens permite mantener conversaciones largas con historial extenso y documentacion de referencia sin truncamiento, aunque el soporte idiomatico se limita a ingles y chino.
- Agentes de larga duracion: tareas de investigacion o automatizacion que requieren decenas de pasos y contexto acumulado se benefician de la decodificacion especulativa DSpark y del modo thinking con esfuerzo configurable.

## Benchmarks y rendimiento

La model card referencia una grafica de resultados (`assets/eval-results.png`) y menciona que la tabla asociada lista 20 benchmarks, pero el contenido de esa tabla no esta incluido en la informacion proporcionada. No se han publicado resultados numericos de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo BF16 ocupa 599,6 GB, por lo que la inferencia en BF16 requiere del orden de 600 GB de memoria. Las variantes FP8 blockwise y FP4 reducen sustancialmente este requisito, aunque no se especifican cifras exactas en la informacion disponible.
- GPU recomendadas: no se detallan modelos concretos en la informacion disponible. Por el volumen de pesos, el despliegue en BF16 requiere multiples GPU de clase数据中心 (A100/H100) o superior; las variantes FP8 y FP4 estan pensadas para hardware con kernels correspondientes.
- Cabe en consumer GPU: no en BF16 ni en las variantes cuantizadas descritas, dado el tamano del modelo (280B totales). No se dispone de datos sobre variantes GGUF de baja precision.
- Opciones de despliegue: transformers (libreria declarada); la model card menciona endpoints compatibles y la existencia de repositorios FP8 y FP4. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. La model card afirma que la combinacion de pesos FP4 en expertos y la cabeza DSpark acelera tareas de agente largas con minima perdida de precision, pero sin cifras.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. A modo de referencia estructural, se puede senalar que ERNIE 5.5 Flash Preview se situa en la categoria de modelos MoE de escala ~300B con contexto de 1M tokens y licencia Apache 2.0, una combinacion poco frecuente entre modelos abiertos.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia |
|---|---|---|---|---|
| ERNIE 5.5 Flash Preview | ~280B (299,5B en safetensors) | 14B | 1M | Apache 2.0 |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un checkpoint Preview: el post-entrenamiento no ha finalizado y algunas capacidades pueden quedar por debajo de lo esperado; Baidu advierte que la version oficial mejorara rapidamente.
- Idiomas limitados a ingles y chino; no se declara soporte de castellano ni de otros idiomas.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan tasas especificas ni mitigaciones en la informacion disponible.
- Sesgos conocidos: no se detallan en la model card; al entrenarse con datos mayoritariamente en ingles y chino, es previsible un sesgo cultural y linguistico hacia esos idiomas.
- Discrepancia entre el numero de parametros declarado (280B) y el recuento real de safetensors (299.559.159.366), que conviene verificar antes de dimensionar el despliegue.
- Requisitos de hardware muy elevados en BF16 (~600 GB); el uso practico depende de las variantes FP8/FP4 y de kernels compatibles.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye "tal cual" y sin garantias; conviene revisar el archivo LICENSE del repositorio.
- No se especifican en la informacion disponible los detalles de tool calling, los formatos de prompt exactos ni el soporte de frameworks de serving, lo que puede requerir trabajo de integracion.

## Enlaces

- Hugging Face (BF16): https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview-BF16
- Hugging Face (FP8): https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview-FP8
- Hugging Face (FP4 por defecto): https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview
- Modelo base: https://huggingface.co/baidu/ERNIE-5.5-Flash-Base
- ModelScope (BF16): https://www.modelscope.cn/models/baidu/ERNIE-5.5-Flash-Preview-BF16
- Blog de lanzamiento: https://ernie.baidu.com/release/ernie-5-5-flash-preview/
- Chat: https://ernie.baidu.com/web
- API Qianfan: https://cloud.baidu.com/product/qianfan.html
- X (Twitter): https://x.com/Baidu_ERNIE
- Licencia: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview/blob/main/LICENSE
- Paper referenciado: arXiv:2610.24766
- Paper referenciado: arXiv:2610.17959
- Paper referenciado: arXiv:2610.40577
