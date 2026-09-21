# mradermacher/qwen3-14b-commitments-v2-sdf-GGUF

## Resumen

Este repositorio contiene una coleccion de cuantizaciones GGUF del modelo `joshycodes/qwen3-14b-commitments-v2-sdf`, publicadas por el usuario mradermacher (nethype GmbH). No es un modelo nuevo: es una conversion a formato GGUF, generada con el pipeline habitual de mradermacher, del fine-tune original alojado por joshycodes sobre una base Qwen3 de 14B parametros. El modelo pesa 14.768.307.200 parametros segun los pesos safetensors del repositorio origen.

La relevancia de esta publicacion es acotada y muy especifica. El modelo original se etiqueta con `synthetic-document-finetuning`, `self-authored-character`, `model-welfare`, `research` y `not-for-deployment`, y declara licencia `research-only`. Es decir, se trata de un artefacto de investigacion orientado a estudios de comportamiento y bienestar de modelos, no de un modelo pensado para produccion ni para uso comercial. Las cuantizaciones GGUF existen para permitir que ese objeto de estudio se ejecute en hardware de consumo y en entornos de investigacion sin GPU de datacenter.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, fue creado y actualizado el 21 de septiembre de 2026, y ocupa 102 GB en total. La ficha de HuggingFace no documenta arquitectura detallada, datos de entrenamiento, benchmarks ni contexto maximo del fine-tune, por lo que buena parte de los campos tecnicos de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada. El modelo base declarado es `joshycodes/qwen3-14b-commitments-v2-sdf`, derivado de la familia Qwen3; el detalle de arquitectura del fine-tune no se documenta en la model card |
| Parametros totales | 14.768.307.200 (14,77 mil millones), dato real de los pesos safetensors del repositorio origen |
| Parametros activos | no aplica / no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada. La model card no declara ventana de contexto para este fine-tune |
| Tipos de cuantizacion | Q2_K (5,9 GB), Q3_K_S (6,8 GB), Q3_K_M (7,4 GB), Q3_K_L (8,0 GB), IQ4_XS (8,3 GB), Q4_K_S (8,7 GB), Q4_K_M (9,1 GB), Q5_K_S (10,4 GB), Q5_K_M (10,6 GB), Q6_K (12,2 GB), Q8_0 (15,8 GB). Los metadatos del README mencionan tambien `x-f16` en la lista de quants generados |
| Tipos de cuantizacion con imatrix | no disponibles; el autor indica que los quants ponderados/imatrix no parecen estar disponibles en ese momento |
| Idiomas soportados | en (ingles) |
| Licencia | `other`, con `license_name: research-only`. Etiquetado explicitamente como `not-for-deployment` |
| Formato de pesos | GGUF (este repositorio). El modelo base se distribuye en safetensors con `library_name: transformers` |
| Libreria declarada | transformers (etiqueta del repositorio) |
| Pipeline | no disponible |
| Tamano del repositorio | 102,0 GB |
| Etiquetas | transformers, gguf, synthetic-document-finetuning, self-authored-character, model-welfare, research, not-for-deployment, base_model:joshycodes/qwen3-14b-commitments-v2-sdf, license:other, endpoints_compatible, region:us, conversational |
| Fecha de creacion | 2026-09-21 |
| Fecha de actualizacion | 2026-09-21 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se documenta en la informacion disponible la arquitectura concreta del fine-tune `joshycodes/qwen3-14b-commitments-v2-sdf`, ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si se aplicaron fases de RLHF, DPO u otra optimizacion por preferencias. Lo unico que se puede afirmar con la informacion proporcionada es que el modelo base declarado pertenece a la familia Qwen3 con 14B parametros y que el fine-tune se etiqueta como `synthetic-document-finetuning`, lo que sugiere un ajuste supervisado sobre documentos generados sinteticamente, presumiblemente con el objetivo de inculcar un personaje o conjunto de compromisos autoescritos (`self-authored-character`). Este extremo no se detalla en la model card y no debe darse por confirmado.

Sobre esta publicacion en concreto, la unica transformacion tecnica aplicada es la cuantizacion a GGUF. El README indica `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que describe el pipeline de conversion desde pesos HuggingFace a llama.cpp. La mayoria de los quants son de tipo K (Q2_K a Q6_K) mas una variante IQ4_XS; el autor no ha publicado variantes con matriz de importancia (imatrix) y remite a las graficas publicas de perplexidad de ikawrakow y al analisis de Artefact2 para decidir entre tipos de cuantizacion de baja calidad.

## Capacidades

- La model card no documenta ninguna capacidad funcional especifica de este modelo. Las capacidades del fine-tune no estan verificadas en la informacion proporcionada.
- Por herencia del modelo base Qwen3 de 14B cabria esperar generacion de texto, razonamiento, codigo y matematicas, ademas de posible soporte de tool calling y modos de razonamiento explicito, pero nada de esto se confirma para este fine-tune ni se ha validado con benchmarks disponibles.
- La etiqueta `conversational` en el repositorio sugiere uso conversacional multi-turno, sin mas detalle.
- Idiomas: unicamente `en` (ingles) declarado.
- Capacidades especiales asociadas a las etiquetas del autor: comportamiento de personaje autoescrito (`self-authored-character`), alineacion con compromisos declarados por el propio modelo (`commitments-v2`) y objeto de estudio de bienestar de modelos (`model-welfare`). Son marcos de investigacion, no funcionalidades de producto.
- Vision, audio y multimodalidad: no disponibles y no declaradas.
- Modo thinking, decodificacion especulativa o atencion lineal: no disponibles / no documentados para este artefacto.

## Casos de uso

Advertencia previa: la licencia es `research-only` y el modelo esta etiquetado como `not-for-deployment`. Los casos de uso siguientes son de investigacion o evaluacion tecnica, no de produccion ni de atencion a usuarios reales.

- Investigacion sobre bienestar de modelos: el artefacto esta etiquetado explicitamente con `model-welfare`. Se usaria en entornos de laboratorio para estudiar como un modelo fine-tuneado con un conjunto de compromisos autoescritos responde a escenarios de interaccion prolongada, midiendo consistencia de comportamiento y autorrepresentacion. La cuantizacion Q4_K_M (9,1 GB) permite ejecutarlo en una unica GPU de consumo, lo que abarata la experimentacion repetida.
- Estudio de personajes autoescritos: la etiqueta `self-authored-character` apunta a un fine-tune cuyo objetivo es sostener una identidad o voz concreta. Un investigador en alineacion puede usarlo como caso de estudio de hasta que punto un modelo mantiene rasgos de personaje bajo presion conversacional, comparandolo con el modelo base sin ajustar.
- Analisis de fine-tuning sobre documentos sinteticos (SDF): sirve como muestra de una tecnica concreta de ajuste con datos generados. Se usaria para reproducir el pipeline, inspeccionar que tipo de deriva introduce el corpus sintetico frente al modelo base y documentar efectos secundarios como la perdida de capacidades generales.
- Auditoria de deriva respecto al modelo base: al existir tanto el fine-tune original en safetensors como estas cuantizaciones, un equipo puede ejecutar baterias de evaluacion comparativas entre la version original y cada quant GGUF, midiendo el impacto de la cuantizacion en tareas de razonamiento y en el estilo de respuesta del personaje.
- Estudio metodologico de cuantizacion: el repositorio ofrece once variantes (de Q2_K a Q8_0) del mismo modelo. Es un material adecuado para medir degradacion de perplexidad y de comportamiento cualitativo a lo largo de la escala de compresion en un modelo ajustado, no solo en un modelo fundacional, y para documentar donde aparece la ruptura de coherencia.
- Docencia y formacion en despliegue local: con Q4_K_S (8,7 GB) o Q4_K_M (9,1 GB) el modelo cabe en una GPU de 24 GB o incluso en configuraciones con CPU y RAM suficiente mediante llama.cpp. Se puede usar en talleres para explicar el flujo safetensors → GGUF → ejecucion local con llama.cpp u Ollama.
- Evaluacion de riesgos de publicacion de modelos de investigacion: el artefacto ilustra el caso de un modelo con licencia restringida y etiqueta `not-for-deployment` distribuido en un formato facilmente ejecutable. Es un ejemplo util para discutir tensiones entre reproducibilidad cientifica y control de uso.
- Pruebas de integracion en herramientas de inferencia local: verificar el comportamiento de un fine-tune no estandar bajo distintos backends GGUF (llama.cpp, llama-cpp-python, servidores compatibles con la API de OpenAI) es un caso de ingenieria legitimo antes de decidir si merece la pena reproducir el experimento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye MMLU, HumanEval, GSM8K, perplexidad ni ninguna otra metrica, y la busqueda web realizada no ha devuelto ningun resultado relacionado con este modelo (los resultados obtenidos corresponden a una plataforma de cursos de IA no vinculada).

## Requisitos de hardware

Estimaciones derivadas del tamano de los ficheros publicados. A la VRAM del fichero hay que sumar el espacio para la cache KV, que depende del contexto configurado y no puede calcularse porque la longitud de contexto no esta documentada.

- VRAM estimada para inferencia, por cuantizacion:
  - Q2_K: 5,9 GB de pesos; aproximadamente 7 GB de VRAM con contexto corto.
  - Q3_K_S / Q3_K_M / Q3_K_L: 6,8 / 7,4 / 8,0 GB de pesos; aproximadamente 8-10 GB de VRAM.
  - IQ4_XS: 8,3 GB; aproximadamente 10 GB.
  - Q4_K_S / Q4_K_M: 8,7 / 9,1 GB; aproximadamente 10-12 GB de VRAM.
  - Q5_K_S / Q5_K_M: 10,4 / 10,6 GB; aproximadamente 12-14 GB.
  - Q6_K: 12,2 GB; aproximadamente 14-16 GB.
  - Q8_0: 15,8 GB; aproximadamente 17-19 GB.
- GPU recomendadas: para Q8_0 y Q6_K, tarjetas de 24 GB o mas (RTX 3090, RTX 4090, L40S, A100 40 GB). Para Q4_K_M y Q5_K_M, RTX 4090, RTX 3090, RTX 4080 de 16 GB en el limite. Para Q3_K y Q2_K, tarjetas de 8-12 GB.
- Cabe en GPU de consumo: si. Q4_K_S y Q4_K_M caben en una RTX 4090 o RTX 3090 de 24 GB con contexto moderado; Q3_K caben en GPUs de 12 GB; Q2_K en GPUs de 8-10 GB. Tambien es viable la ejecucion hibrida CPU+GPU con llama.cpp si la VRAM es insuficiente.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, LM Studio y cualquier servidor GGUF compatible con la API de OpenAI. vLLM y TGI estan orientados a pesos completos en safetensors y su soporte de GGUF es limitado o experimental; no se confirma en la informacion disponible que funcionen con este artefacto.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones y no pueden derivarse solo del tamano del fichero.
- Almacenamiento: el repositorio completo ocupa 102 GB; conviene descargar unicamente el quant necesario. El quant Q4_K_M de 9,1 GB es el de mejor relacion tamano/calidad segun el propio autor ("fast, recommended"), mientras que Q8_0 se marca como "fast, best quality" y Q3_K_M se marca como "lower quality".

## Comparativa con modelos similares

No hay datos de rendimiento publicados que permitan una comparativa funcional. Se compara unicamente lo verificable: formato, parametros y licencia.

| Modelo | Parametros | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (mradermacher/qwen3-14b-commitments-v2-sdf-GGUF) | 14,77 mil millones | GGUF (11 quants) | no disponible | research-only / not-for-deployment | Publico en HuggingFace; 0 descargas |
| joshycodes/qwen3-14b-commitments-v2-sdf (modelo base) | 14,77 mil millones | safetensors (transformers) | no disponible | no disponible en la informacion proporcionada | Publico en HuggingFace |
| Otros fine-tunes de la familia Qwen3-14B | 14,77 mil millones | safetensors / GGUF segun repositorio | no disponible | variable por repositorio; no verificada en esta busqueda | no disponible |
| Alternativas de 12-14B de otros fabricantes (por ejemplo familias densas de tamano similar) | orden de 12-14 mil millones | safetensors / GGUF | no disponible | no verificada en esta busqueda | no disponible |

No se dispone de MMLU, HumanEval, GSM8K ni perplexidad de este modelo ni de sus alternativas en la informacion proporcionada, por lo que no es posible establecer una comparacion de rendimiento.

## Limitaciones y advertencias

- Licencia `research-only` con etiqueta explicita `not-for-deployment`. El uso comercial y el despliegue en productos o servicios queda fuera de los terminos declarados. Cualquier uso en produccion requiere revisar la licencia del modelo base y obtener autorizacion del autor.
- El modelo es un artefacto de investigacion sobre bienestar de modelos y personajes autoescritos. No hay evidencia publicada de que sea seguro, util ni estable para tareas generales.
- Riesgo de alucinacion: no evaluado en la informacion disponible. No se han publicado mediciones de factualidad ni de tasas de error.
- Idiomas: solo se declara ingles. No hay soporte multilingue declarado, aunque el modelo base pudiera tenerlo; no se confirma para este fine-tune.
- Longitud de contexto no documentada. Planificar despliegues que dependan de ventanas largas sin verificar el valor real es arriesgado.
- Sesgos: no documentados. Al estar ajustado sobre documentos sinteticos, existe riesgo de amplificar los sesgos presentes en el corpus generador, que no se describe.
- Degradacion por cuantizacion: los quants Q2_K y Q3_K son agresivos. El propio autor marca Q3_K_M como "lower quality". Para trabajo con el personaje o los compromisos del modelo, conviene usar Q5_K_M o superior, ya que una cuantizacion fuerte puede alterar precisamente los rasgos de comportamiento que se quieren estudiar.
- No hay quants con imatrix disponibles, lo que limita las opciones de compresion con calidad optimizada para este modelo concreto.
- Reproducibilidad: no se documenta el proceso de fine-tune, el dataset ni los hiperparametros, por lo que los resultados obtenidos con este modelo no son facilmente reproducibles ni auditables.
- Ausencia de validacion de la comunidad: 0 descargas y 0 likes. No hay informes independientes de funcionamiento, y no hay garantia de que los ficheros hayan sido probados mas alla del proceso automatico de cuantizacion.
- Los resultados de la busqueda web realizada no contienen informacion sobre este modelo; los enlaces devueltos pertenecen a una plataforma de cursos de IA sin relacion con el artefacto.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/qwen3-14b-commitments-v2-sdf-GGUF
- Modelo base (fine-tune original): https://huggingface.co/joshycodes/qwen3-14b-commitments-v2-sdf
- Pagina resumen del autor para este modelo (lista de descargas): https://hf.tst.eu/model#qwen3-14b-commitments-v2-sdf-GGUF
- Preguntas frecuentes y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (README de TheBloke, referenciado por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de perplexidad por tipo de quant (ikawrakow), enlazada en el README: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre tipos de cuantizacion, enlazado en el README: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Sitio de nethype GmbH, empresa que cede la infraestructura al autor: https://www.nethype.de/
- Paper, blog o demo oficial del modelo: no disponibles en la informacion proporcionada.
