# peonist-ai/halogen-qwen3.8-27b

## Resumen

halogen-qwen3.8-27b es un checkpoint de pesos publicado por peonist-ai para
halogen, un motor de inferencia dedicado a ejecutar Qwen3.8-27B sobre
APUs AMD Strix Halo (gfx1151) bajo ROCm. No se trata de un modelo entrenado
desde cero ni de un ajuste fino conversacional: es una redistribución
optimizada del modelo base Qwen/Qwen3.8-27B en el formato propietario `.hgn`,
acompañada de dos cabezas de decodificación especulativa entrenadas por el
autor. El repositorio ocupa 35,9 GB y contiene 1352 tensores, con unos 29,75
millones de millones de parámetros según la precisión efectiva declarada.

Su relevancia es doble. Por un lado, demuestra una estrategia de cuantización
mixta poco habitual: los streams de decodificación (23,5 GB) se mantienen en
8 bits o más, y la ruta agresiva de 4 bits queda confinada a la fase de
prefill, de modo que la generación de tokens nunca toca pesos de 4 bits. Por
otro, es un ejemplo claro de checkpoint atado a un motor: los pesos solo
funcionan dentro del contenedor oficial de halogen y no se pueden cargar en
transformers, vLLM ni llama.cpp.

El modelo se distribuye con licencia apache-2.0, aunque la propia model card
advierte que se trata de una obra derivada y que los términos aplicables son
los del modelo original. El repositorio acumulaba 12 likes y 0 descargas en el
momento de la consulta, y fue creado y actualizado el 26 de agosto de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoint derivado de Qwen/Qwen3.8-27B, distribuido en el formato `.hgn` del motor halogen) |
| Parametros totales | ~29,75B segun la model card (el nombre del repositorio indica 27b) |
| Parametros activos | no aplica: no consta que el modelo sea MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mezcla propietaria dentro del checkpoint `.hgn`: 4 bits NVFP4 en tensores troncales de FFN (valores importados de `unsloth/Qwen3.8-27B-NVFP4`), filas FP8 en el resto y embeddings y normas en BF16. Precision efectiva de decodificacion: 6,32 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 en el repositorio de pesos; el motor halogen es de codigo cerrado y se rige por sus propios terminos |
| Formato de pesos | `.hgn` (formato propietario de halogen) mas directorio de tokenizer plano; no carga en transformers, vLLM ni llama.cpp |
| Tamano del repositorio | 35,9 GB (1352 tensores) |
| Bytes en streams de decodificacion | 23,5 GB |
| Cabezas de decodificacion especulativa | MTP (ajuste fino) y DFlash2 (block drafter de 5 capas, ~2,2B parametros) |
| Plataforma objetivo | AMD Strix Halo, gfx1151, ROCm |
| Descargas / likes | 0 descargas / 12 likes |
| Fecha de creacion | 26 de agosto de 2026 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del transformer
subyacente ni el proceso de entrenamiento de Qwen3.8-27B: no hay datos sobre
numero de tokens, composicion del dataset, ni si hubo RLHF o DPO. Lo que si
documenta la model card es la ingenieria de pesos. De los 1352 tensores, los
streams empleados durante la decodificacion suman 23,5 GB y se mantienen en
8 bits o mas; los unicos tensores troncales en 4 bits son los de FFN, y sus
valores no fueron calibrados por el autor, sino importados de la cuantizacion
NVFP4 publicada por unsloth. El resto de la red usa filas FP8 y embeddings y
normas en BF16, lo que da una precision efectiva de 6,32 bits por peso sobre
29,75B parametros. La cuantizacion propia solo se emplea donde no existe un
donante previo.

La innovacion principal es la decodificacion especulativa. El checkpoint
incorpora dos drafters entrenados por el autor: una cabeza MTP ajustada y
DFlash2, un block drafter de 5 capas y aproximadamente 2,2B parametros. Segun
la model card, el uso de cualquiera de los dos produce una salida
byte-identica a la decodificacion greedy serial, porque el drafter solo
propone y el token se emite unicamente si el modelo completo lo habria
producido. Se describe como una optimizacion de velocidad sin coste de calidad
y puede desactivarse por peticion.

## Capacidades

- Generacion de texto autorregresiva servida a traves de un endpoint
  compatible con la API de OpenAI en el puerto 8731.
- Decodificacion especulativa con dos cabezas drafter independientes (MTP y
  DFlash2), con salida declarada byte-identica a la decodificacion greedy
  serial y desactivable por peticion.
- Ejecucion de la fase de prefill con ruta cuantizada a 4 bits y decodificacion
  en 8 bits o mas, lo que permite separar el coste de precision entre ambas
  fases.
- Despliegue autocontenido mediante contenedor Docker con acceso directo a
  `/dev/kfd` y `/dev/dri`, sin dependencias de librerias de inferencia
  generalistas.
- Capacidades derivadas del modelo base (razonamiento, generacion de codigo,
  matematicas, soporte multilingue, tool calling, modo thinking): no
  disponibles en la informacion proporcionada. Dependen integramente de
  Qwen/Qwen3.8-27B, cuyos detalles no se incluyen en la busqueda realizada.
- Carga en transformers, vLLM o llama.cpp: no soportada por diseno.

## Casos de uso

- Inferencia local en estaciones de trabajo con APU AMD Strix Halo: el
  checkpoint y el motor estan disenados especificamente para gfx1151, de modo
  que permite ejecutar un modelo de ~29,75B parametros en hardware de escritorio
  sin GPU discreta NVIDIA.
- Sustitucion de endpoints en la nube por un servicio local: el contenedor
  expone una API compatible con OpenAI en el puerto 8731, por lo que aplicaciones
  ya integradas con ese esquema pueden redirigirse cambiando unicamente la URL
  base.
- Procesamiento de documentos confidenciales: al ejecutarse integramente en la
  maquina local y no requerir llamadas a servicios externos, encaja en flujos
  donde los datos no pueden salir de la organizacion (legal, sanidad, auditoria
  interna).
- Asistencia de programacion en entornos aislados o sin conectividad: el motor
  funciona con el contenedor y los pesos montados como volumen de solo lectura,
  lo que permite desplegarlo en redes air-gapped.
- Investigacion sobre decodificacion especulativa: el checkpoint incluye dos
  drafters comparables (MTP y DFlash2), lo que permite medir la ganancia de
  throughput de cada estrategia y verificar la equivalencia byte a byte frente
  a la decodificacion greedy serial.
- Evaluacion de cuantizacion mixta: sirve como banco de pruebas para estudiar
  el impacto de mantener la decodificacion en 8 bits o mas mientras el prefill
  usa 4 bits NVFP4, comparandolo con cuantizaciones uniformes de 4 bits.
- Servicio de generacion de texto para uso interno de un equipo pequeno: con
  una sola instancia en el puerto 8731 y un endpoint compatible, se puede
  centralizar el acceso de varias herramientas internas.
- Experimentacion con motores de inferencia propietarios: util para analizar
  el coste de adopcion y el lock-in que implica un formato de pesos cerrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La
model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ningun otro
conjunto de evaluacion, y la busqueda web realizada no devolvio resultados
relevantes sobre este modelo. Los unicos datos cuantitativos declarados son de
naturaleza interna y se recogen a continuacion.

| Metrica declarada | Valor |
|---|---|
| Tamano del fichero de checkpoint | 35,9 GB |
| Numero de tensores | 1352 |
| Bytes de los streams de decodificacion | 23,5 GB |
| Precision efectiva de decodificacion | 6,32 bits por peso |
| Parametros sobre los que se calcula | 29,75B |
| Capas del drafter DFlash2 | 5 |
| Parametros del drafter DFlash2 | ~2,2B |
| Equivalencia con decodificacion serial greedy | byte-identica (afirmacion del autor, no verificada de forma independiente) |

## Requisitos de hardware

- Plataforma obligatoria: APU AMD Strix Halo con GPU integrada gfx1151 y
  ROCm. No hay soporte para CUDA ni para GPUs NVIDIA.
- VRAM o memoria unificada estimada: al menos ~36 GB para alojar el
  checkpoint de 35,9 GB, mas espacio para el tokenizer, las caches KV y los
  buffers de ejecucion. En la practica, requiere una configuracion de Strix
  Halo con 64 GB o 128 GB de memoria unificada. Estimacion propia a partir
  del tamano del fichero; la model card no especifica el minimo.
- Memoria para la ruta de decodificacion: 23,5 GB de streams.
- GPU de consumo NVIDIA (RTX 4090, RTX 3090, etc.): no compatible, porque el
  formato `.hgn` no puede cargarse en los runtimes disponibles para esas
  tarjetas.
- GPUs de centro de datos (A100, H100, MI300): no compatible con este
  checkpoint, ya que el motor solo apunta a gfx1151.
- Despliegue: exclusivamente mediante el contenedor oficial
  `ghcr.io/peonist-ai/halogen:0.1.0`, con acceso a `/dev/kfd` y `/dev/dri`,
  `--group-add keep-groups`, `--security-opt seccomp=unconfined` e `--ipc=host`,
  montando los pesos y el tokenizer como volumenes de solo lectura.
- Alternativas de despliegue (vLLM, llama.cpp, Ollama, TGI, Text Generation
  Inference): no disponibles para este checkpoint.
- Latencia y throughput estimados: no disponibles. No se publican mediciones
  de tokens por segundo ni de latencia por peticion para ninguna de las dos
  rutas de decodificacion especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| peonist-ai/halogen-qwen3.8-27b | ~29,75B | no disponible | `.hgn` propietario | apache-2.0 en el repo, sujeta a la licencia del modelo original | AMD Strix Halo (gfx1151), ROCm |
| Qwen/Qwen3.8-27B (modelo base) | no disponible | no disponible | no disponible | no disponible | no disponible |
| unsloth/Qwen3.8-27B-NVFP4 | no disponible | no disponible | NVFP4 (4 bits) | no disponible | no disponible |

La informacion proporcionada no incluye parametros, contexto, licencia ni
rendimiento de los dos modelos de referencia mas alla de su existencia y del
hecho de que el tercero es una cuantizacion NVFP4 de 4 bits. No se dispone de
datos de benchmarks que permitan comparar rendimiento entre las tres
alternativas.

## Limitaciones y advertencias

- Formato de pesos cerrado: el checkpoint solo se carga en el motor halogen.
  No es utilizable en transformers, vLLM, llama.cpp ni Ollama, lo que genera
  una dependencia total de un unico proveedor de runtime.
- El motor halogen es de codigo cerrado y se distribuye bajo terminos propios,
  distintos de la licencia de los pesos. La model card remite a su repositorio
  para conocerlos.
- Licencia con matices: el repositorio declara apache-2.0, pero la propia model
  card advierte de que se trata de una obra derivada de Qwen3.8-27B y que los
  terminos aplicables son los del modelo original. El autor pide verificar la
  licencia upstream antes de cualquier uso comercial y aclara que nada de lo
  publicado concede derechos que la licencia original no otorgue.
- Los tensores de 4 bits de las FFN no fueron calibrados por el autor, sino
  importados de una cuantizacion de terceros. El impacto en la calidad frente
  a los pesos originales no esta medido ni documentado.
- Ausencia total de benchmarks: no hay evaluaciones de MMLU, HumanEval, GSM8K
  ni de ningun otro conjunto, por lo que no es posible cuantificar la perdida
  de calidad frente al modelo base.
- Idiomas soportados: no documentados. No se puede confirmar cobertura
  multilingue ni el comportamiento en castellano.
- Longitud de contexto: no documentada.
- Sesgos: no disponibles. No se ha publicado ninguna evaluacion de sesgo,
  toxicidad o seguridad.
- Riesgo de alucinacion: inherente a los modelos de lenguaje generativos. Al
  no existir evaluaciones publicadas de este checkpoint, no hay forma de
  acotar dicho riesgo en produccion.
- La afirmacion de que la decodificacion especulativa es byte-identica a la
  decodificacion greedy serial procede del autor y no se ha verificado de forma
  independiente.
- Dependencia de una plataforma muy concreta (gfx1151) y de una version
  especifica del contenedor: cambios de driver ROCm o del runtime pueden
  afectar a la reproducibilidad.
- Madurez baja: repositorio creado el 26 de agosto de 2026, con 0 descargas y
  12 likes en el momento de la consulta, sin validacion apreciable por parte de
  la comunidad.
- La busqueda web realizada no devolvio ninguna fuente independiente sobre el
  modelo: los unicos resultados obtenidos fueron enlaces no relacionados con
  la consulta, por lo que toda la informacion tecnica procede exclusivamente
  de la model card y de los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/peonist-ai/halogen-qwen3.8-27b
- Repositorio del motor halogen: https://github.com/peonist-ai/halogen-server
- Imagen de contenedor: ghcr.io/peonist-ai/halogen:0.1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantizacion NVFP4 de origen: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Papers, blogs y demos adicionales: no disponibles. La busqueda web no devolvio
  resultados relacionados con el modelo.
