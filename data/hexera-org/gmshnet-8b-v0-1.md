# hexera-org/GmshNet-8B-v0.1

## Resumen

GmshNet-8B-v0.1 es un modelo de lenguaje causal, decoder-only, desarrollado por la organizacion hexera-org y publicado bajo licencia Apache 2.0. Se presenta como un modelo especializado en generacion de codigo tecnico para el dominio del preprocesado de simulacion numerica: mallado con Gmsh, geometria computacional (CAD/OCC), metodos de elementos finitos (FEM) y voluMenes finitos (CFD), transferencia de calor y analisis estructural. La ficha se apoya en la etiqueta `qwen2` del repositorio, lo que indica que la arquitectura base es la familia Qwen2, y en el contador real de safetensors, que arroja 7.615.616.512 parametros (~7,6 B).

El modelo resuelve un problema muy concreto: los asistentes de codigo generalistas rara vez dominan las convenciones de los ficheros `.geo` de Gmsh, los campos de tamano (size fields), las capas limite (boundary layers), los grupos fisicos o los parametros de los algoritmos de mallado Delaunay frontal y advancing-front. GmshNet-8B-v0.1 se posiciona como copiloto para ingenieros que automatizan pipelines de CAE mediante scripting en Python y Gmsh.

Es relevante ahora porque el preprocesado (geometria y malla) consume una parte desproporcionada del tiempo en proyectos de simulacion, y porque un modelo de ~7,6 B puede desplegarse en una unica GPU de 24 GB o incluso en GPUs de consumo con cuantizacion. Conviene senalar que la model card publicada esta incompleta: no incluye descripcion redactada, hiperparametros de entrenamiento, longitud de contexto ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal, familia Qwen2 (segun etiqueta `qwen2` del repo) |
| Parametros totales | 7.615.616.512 (~7,6 B), contador real de safetensors |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors; no se publican GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 15,2 GB |
| Pipeline | text-generation |
| DOI | 10.57967/hf/9191 |
| Fecha de creacion | 2026-06-10 |
| Ultima actualizacion | 2026-09-12 |
| Descargas / likes | 543 / 1 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura mas alla de las etiquetas del repositorio, que la identifican como `decoder-only`, `causal-language-model`, `autoregressive`, `instruction-tuned` y `qwen2`. Esto es coherente con un transformer causal autorregresivo de la familia Qwen2 con 7,6 B de parametros, ajustado por instrucciones (instruction tuning) para tareas de generacion de codigo y razonamiento tecnico. No se especifican el numero de capas, la dimension oculta, el numero de cabezas de atencion ni la ventana de contexto.

Tampoco se dispone de informacion sobre el corpus de entrenamiento: no se indica el numero de tokens, la composicion del dataset, la mezcla de datos de codigo frente a datos de texto, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT con datos sinteticos generados por un modelo mayor. Las etiquetas sugieren un enfasis fuerte en dominios de ingenieria (FEM, FEA, CFD, FVM, navier-stokes, transferencia de calor, elasticidad, mecanica de solidos, geometria CAD/OCC, Gmsh, meshio), pero no hay evidencia publicada del proceso de curacion de datos. No se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o capas hibridas SSM.

## Capacidades

Las capacidades que se enumeran a continuacion se infieren de las etiquetas de la model card, no de una evaluacion publicada. Conviene validarlas empiricamente antes de usarlas en produccion.

- Generacion de codigo en Python, con enfasis en la API Python de Gmsh (`gmsh` SDK) y en scripting cientifico.
- Generacion de scripts `.geo` de Gmsh 4.x: definicion de geometria, puntos, curvas, superficies y volumenes, booleanos y geometria parametrica.
- Geometria computacional y modelado CAD: representacion por fronteras (B-rep), geometria constructiva de solidos (CSG), kernel OpenCASCADE (OCC) y operaciones booleanas.
- Mallado: mallas 2D y 3D, estructuradas, no estructuradas e hibridas; triangular, cuadrilatera, tetraedrica, hexaedrica, prismatica y piramidal; superficiales y volumetricas.
- Control de tamano y refinamiento: campos de tamano (size fields), campos de distancia y umbral (distance/threshold field), background field, refinamiento local y adaptativo (AMR), refinamiento por curvatura y por rasgos geometricos.
- Capas limite y mallado anisoptropo: inflation layers, mallado near-wall y de pared, mallado anisoptropo.
- Algoritmos de mallado: Delaunay frontal, advancing-front, transfinite y recombinacion (recombination).
- Calidad de malla: analisis de calidad, aspect ratio, skewness, suavizado, reparacion, limpieza y validacion de malla, estudios de convergencia e independencia de malla.
- Dominio fisico de simulacion: FEM/FEA, mecánica de solidos y de fluidos, CFD, Navier-Stokes, transferencia de calor (conduccion y conveccion) y flujos internos y externos.
- Automatizacion de flujos CAE: generacion de scripts para pipelines de preprocesado, grupos fisicos, superficies/volumenes/curvas de contorno.
- Instrucciones y seguimiento de formato estructurado, asi como razonamiento tecnico y resolucion de problemas de ingenieria.
- Idiomas: solo ingles. No hay soporte multilingue declarado.
- Soporte de tool calling / function calling: no disponible (no declarado en la informacion proporcionada).
- Modo thinking, vision o audio: no disponible (no declarado).
- Interoperabilidad de formatos de malla: etiqueta `meshio`, orientada a conversion entre formatos.

## Casos de uso

- Generacion de scripts `.geo` de Gmsh a partir de una descripcion textual: el ingeniero describe la geometria y las condiciones de malla, y el modelo produce el fichero `.geo` completo con puntos, curvas, superficies, volumenes y grupos fisicos. Es adecuado porque el entrenamiento esta orientado a la sintaxis especifica de Gmsh 4.x.
- Automatizacion de mallado via API Python: integracion del modelo en un script que genere codigo `gmsh.model.mesh.generate()` parametrizado por tamano de elemento, algoritmo y campos de tamano, reduciendo el trabajo manual de preprocesado.
- Pipeline CAD a malla: dado un modelo B-rep importado por OpenCASCADE, generar el codigo de particionado, definicion de grupos fisicos y mallado, encadenando despues con el solver mediante meshio.
- Mallado de capas limite para CFD: generacion de codigo para inflation layers y mallado near-wall en perfiles aerodinamicos o conductos, con control de la primera altura de celda y ratio de crecimiento.
- Refinamiento adaptativo dirigido por error: produccion de scripts que definen campos de tamano (distance field, threshold field, background field) y refinamiento por curvatura en zonas de interes, util en estudios de convergencia de malla.
- Auditoria y reparacion de mallas: generacion de scripts de analisis de calidad (aspect ratio, skewness), deteccion de elementos degenerados, suavizado y limpieza antes de exportar al solver.
- Copiloto en el IDE para ingenieria: autocompletado y explicacion de llamadas a la API de Gmsh y OCC para equipos que migran de flujos GUI (Gmsh grafico, Salome) a flujos por script.
- Automatizacion de estudios parametricos: generacion de scripts que recorren un espacio de parametros geometricos y de malla, lanzando simulaciones en lote para analisis de sensibilidad.
- Formacion y documentacion tecnica interna: explicacion de opciones de mallado, algoritmos y campos de Gmsh para ingenieros junior, con ejemplos de codigo ejecutables.
- Conversion de formatos de malla: asistencia en la escritura de codigo basado en meshio para traducir entre formatos de malla y preparar la entrada del solver.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, MBPP, GSM8K ni de evaluaciones especificas del dominio (por ejemplo, exactitud sintactica de scripts `.geo` de Gmsh, tasa de mallas generadas sin error o calidad media de malla resultante).

| Benchmark | GmshNet-8B-v0.1 | Referencia |
|---|---|---|
| MMLU | no disponible | no disponible |
| HumanEval | no disponible | no disponible |
| MBPP | no disponible | no disponible |
| GSM8K | no disponible | no disponible |
| Evaluacion de dominio (Gmsh/FEM/CFD) | no disponible | no disponible |

## Requisitos de hardware

Las cifras de VRAM siguientes son estimaciones derivadas del recuento real de parametros (7,6 B) y del tamano del repositorio (15,2 GB), no mediciones publicadas por el autor.

- Precision completa (FP32): ~30,5 GB de pesos. Requiere A100 80 GB, H100 80 GB o multi-GPU.
- Media precision (BF16/FP16): ~15,2 GB de pesos; con cache KV y overhead de runtime, del orden de 17-20 GB. Cabe en RTX 4090 (24 GB), L40S (48 GB), A100 40/80 GB, H100.
- Cuantizacion INT8: ~8 GB de pesos, del orden de 9-11 GB en ejecucion. Cabe en RTX 4080/3090 (16-24 GB) y A10G (24 GB).
- Cuantizacion INT4 (si se convierte): ~4-5 GB de pesos. Cabe en GPUs de consumo de 8 GB o mas, como RTX 3060 Ti, RTX 4060 o superiores.
- GPU de consumo: si, en BF16 cabe en RTX 4090 y, con cuantizacion, en GPUs de 8-16 GB.
- Despliegue: transformes directamente (formato safetensors y `library_name: transformers`). Las etiquetas `text-generation-inference` y `endpoints_compatible` indican compatibilidad con TGI y con los endpoints de HuggingFace. Por la arquitectura Qwen2, es esperable compatibilidad con vLLM, aunque no se declara explicitamente. Para Ollama o llama.cpp seria necesaria una conversion a GGUF, que no se publica en el repositorio.
- Latencia y throughput: no disponible. No hay mediciones publicadas de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

La comparativa se establece con modelos de ~7-8 B orientados a codigo, que son la alternativa natural por tamano y por licencia permisiva. Los datos de los modelos alternativos provienen de su documentacion publica y conviene verificarlos en sus fichas respectivas antes de tomar decisiones.

| Modelo | Parametros | Contexto | Licencia | Enfoque | Benchmarks publicos |
|---|---|---|---|---|---|
| GmshNet-8B-v0.1 | ~7,6 B | no disponible | Apache 2.0 | Codigo tecnico de CAE: Gmsh, FEM, CFD, mallado | no disponible |
| Qwen2.5-Coder-7B | ~7,6 B | 32.768 tokens nativos, extensible | Apache 2.0 | Codigo generalista | si, publicados por el autor |
| CodeLlama-7B | ~6,7 B | 16.384 tokens (hasta 100K con escalado) | Llama 2 Community License | Codigo generalista | si, publicados por el autor |
| DeepSeek-Coder-6.7B | ~6,7 B | 16.384 tokens | Licencia especifica de DeepSeek, con condiciones de uso comercial | Codigo generalista | si, publicados por el autor |

La diferencia principal de GmshNet-8B-v0.1 no esta en el rendimiento bruto de generacion de codigo, que no se ha medido publicamente, sino en la especializacion de dominio: ninguno de los modelos generalistas de la tabla esta orientado a la sintaxis de Gmsh, a los campos de tamano, a las capas limite ni a los grupos fisicos. A cambio, GmshNet-8B-v0.1 parte con menos documentacion, sin contexto declarado y sin evaluaciones que permitan comparar su rendimiento real.

## Limitaciones y advertencias

- La model card esta incompleta: no incluye longitud de contexto, detalles de entrenamiento ni evaluaciones. Cualquier decision de produccion basada en las etiquetas del repositorio es arriesgada sin validacion previa.
- Idiomas: solo ingles declarado. No se garantiza un rendimiento correcto en castellano ni en otras lenguas.
- Riesgo de alucinacion en APIs: pese a que las etiquetas cubren la API Python de Gmsh, existe riesgo de que el modelo invente nombres de funciones, parametros o constantes. Todo script `.geo` o codigo Python generado debe ejecutarse y validarse antes de usarse.
- Riesgo de mallas sintacticamente validas pero geometricamente incorrectas: un script que se ejecuta sin error puede producir una malla de baja calidad, con elementos invertidos o no conformes. Es imprescindible un control de calidad posterior.
- Sesgos de dominio: el entrenamiento, segun las etiquetas, esta muy centrado en Gmsh, OpenCASCADE y meshio. Es probable un rendimiento inferior en otros generadores de malla (Salome, ParaView, Ansys, COMSOL) o en formatos cerrados.
- Sin soporte declarado de tool calling ni de agentes multi-paso, lo que limita su uso en pipelines autonomos sin una capa de orquestacion externa.
- Volumen de adopcion bajo: 543 descargas y 1 like en el momento de la consulta. No hay ecosistema, issues publicos ni fine-tunes derivados que aporten soporte comunitario.
- Licencia Apache 2.0: permisiva y apta para uso comercial, incluida modificacion y redistribucion, siempre que se conserve el aviso de licencia y el fichero NOTICE correspondiente. No es una licencia de modelo abierto con clausulas de uso aceptable adicionales.
- Ausencia de pesos cuantizados oficiales: usar el modelo en GPUs pequenas exige una conversion propia (GGUF, AWQ o GPTQ), con el consiguiente riesgo de perdida de calidad no medida.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/hexera-org/GmshNet-8B-v0.1
- DOI de la ficha: https://doi.org/10.57967/hf/9191
- Gmsh (proyecto de mallado de referencia del modelo): https://gmsh.info
- Documentacion de la API Python de Gmsh: https://gmsh.info/doc/texinfo/gmsh.html
- OpenCASCADE (kernel de geometria referenciado por las etiquetas): https://dev.opencascade.org
- meshio (biblioteca de conversion de formatos de malla referenciada por las etiquetas): https://github.com/nschloe/meshio
- No se han encontrado resultados relevantes en la busqueda web para este modelo: los resultados devueltos corresponden a paginas de soporte de Microsoft y no guardan relacion con GmshNet-8B-v0.1. No hay articulos, papers ni entradas de blog adicionales disponibles.
