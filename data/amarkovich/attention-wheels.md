# amarkovich/attention-wheels

## Resumen

`amarkovich/attention-wheels` no es un modelo de lenguaje ni un modelo de IA: es un repositorio de distribucion de wheels precompilados del kernel de atencion SageAttention, publicado por el usuario amarkovich bajo licencia Apache 2.0. Su proposito es evitar que los proyectos que dependen de kernels CUDA de atencion tengan que compilar codigo CUDA durante la instalacion: los wheels se construyen localmente a partir de una version fijada (*pinned*) del codigo fuente upstream mas un parche publicado por el propio autor, y se alojan en la CDN de Hugging Face para que `uv sync` los descargue directamente.

El repositorio contiene tres artefactos dentro del directorio `wheels/odyssey-acd75b5/`: el wheel `sageattention-2.2.0` (39.497.751 bytes, 39,5 MB) compilado para CUDA 13.0, torch 2.9.1+cu130 con ABI C++11, CPython 3.10 y x86_64, con kernels para las arquitecturas sm80, sm89, sm90a y sm120a; el wheel `sageattn3-1.0.0` (2.764.183 bytes, 2,8 MB) para sm100a y sm120a; y el fichero de parche `sageattention-odyssey.patch` (21.585 bytes). Cada artefacto incluye su hash SHA-256 para verificacion de integridad.

La relevancia practica es de infraestructura, no de modelado: el parche sobre `thu-ml/SageAttention @ d1a57a5` introduce dos commits, uno de ellos destinado a lanzar los kernels Sage2 sobre el *stream* CUDA actual de torch (requisito para usar CUDA graphs) y otro para un empaquetado multiarquitectura reproducible. Es util para equipos que despliegan atencion eficiente en produccion y quieren builds reproducibles de un kernel concreto en lugar de compilaciones ad hoc.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica: no es un modelo neuronal, es un kernel CUDA de atencion (SageAttention) distribuido como wheels precompilados |
| Parametros totales | no aplica |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (el repositorio no declara idiomas; se trata de codigo binario CUDA) |
| Licencia | Apache 2.0 |
| Formato de pesos | no aplica: formato de distribucion `.whl` (wheels de Python) y `.patch`; sin pesos de modelo |

Datos adicionales del repositorio:

| Parametro | Valor |
|---|---|
| ID en HuggingFace | amarkovich/attention-wheels |
| Autor | amarkovich |
| Etiquetas | kernel, license:apache-2.0, region:us |
| Descargas | 0 |
| Likes | 0 |
| Tamano del repo | 0.0 GB |
| Creacion | 2026-09-24T13:12:20.000Z |
| Ultima actualizacion | 2026-09-24T13:12:24.000Z |
| Entorno de compilacion | CUDA 13.0, torch 2.9.1+cu130 (ABI C++11), CPython 3.10, x86_64 |
| Fuente base | thu-ml/SageAttention @ d1a57a5 |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura de red neuronal. Distribuye codigo nativo compilado del kernel SageAttention, una implementacion de atencion optimizada para GPU que upstream mantiene el proyecto thu-ml. Los wheels se generan a partir del commit `d1a57a5` del repositorio upstream con `python setup.py bdist_wheel`, aplicando antes el parche `sageattention-odyssey.patch` mediante `git am` (el arbol resultante se identifica como `c1f23d3`).

El parche contiene dos commits: el primero hace que los kernels Sage2 se lancen sobre el *stream* CUDA actual de torch, algo necesario para que el kernel sea compatible con CUDA graphs; el segundo introduce un empaquetado multiaquitectura reproducible. La compilacion del wheel principal usa `TORCH_CUDA_ARCH_LIST="8.0;8.9;9.0;12.0"` con `EXT_PARALLEL=4` y `MAX_JOBS=8`, y la variante SageAttention3 para Blackwell se compila por separado con `TORCH_CUDA_ARCH_LIST="10.0;12.0"` y `MAX_JOBS=4`. No hay datos de entrenamiento, dataset, RLHF ni DPO porque no existe un modelo entrenado asociado.

Detalle de los artefactos publicados:

| Fichero | Arquitecturas | SHA-256 | Bytes |
|---|---|---|---|
| sageattention-2.2.0+cu130torch2.9cxx11abitrue-cp310-cp310-linux_x86_64.whl | sm80, sm89, sm90a, sm120a | 8989b2bdd72b82d2ddb47aecedbad89c49a97ea9080ce3bc54e3bb6924922c8f | 39.497.751 |
| sageattn3-1.0.0+cu130torch2.9cxx11abitrue-cp310-cp310-linux_x86_64.whl | sm100a, sm120a | f0fb1e7e22e6dc0232e42522d01260b5be5dd1d4592b28acb6935431b4e0cac7 | 2.764.183 |
| sageattention-odyssey.patch | fuente (`git am` sobre d1a57a5, arbol c1f23d3) | dd86a4dfb3689f2cfe7bd4dd6ad4e78c38d1b1ec7f83ce66ed4ac235b0718156 | 21.585 |

## Capacidades

- Distribucion de wheels CUDA precompilados de SageAttention 2.2.0 y SageAttention3 1.0.0, evitando compilaciones CUDA en el momento de la instalacion.
- Instalacion declarativa mediante `uv` referenciando cada wheel por URL directa dentro de `[tool.uv.sources]`, con marcadores de plataforma y version de Python.
- Soporte de marcadores de entorno, por ejemplo `marker = "python_full_version == '3.10.*' and platform_machine == 'x86_64'"`.
- Instalacion sin autenticacion: el repositorio es publico, por lo que no se necesita `HF_TOKEN`.
- Verificacion de integridad mediante hash SHA-256 publicado para cada artefacto.
- Compatibilidad con CUDA graphs gracias al parche que lanza los kernels Sage2 en el *stream* CUDA actual de torch.
- Empaquetado multiaquitectura reproducible para sm80, sm89, sm90a, sm100a y sm120a.
- Versionado estable frente a reinstalaciones: el segmento de version local (`+cu130torch2.9cxx11abitrue`) se escribe tanto en el nombre del fichero como en el `METADATA` del wheel, de modo que `uv` considera la version instalada igual a la resuelta y no reinstala en cada ejecucion.
- Separacion por directorio de etiqueta de build (`wheels/<tag>/<filename>`), de forma que dos builds con el mismo nombre de fichero no colisionan.
- No incluye capacidades de generacion de texto, razonamiento, codigo, vision, audio, tool calling ni agentes: no es un modelo.

## Casos de uso

- Integracion continua para proyectos que dependen de SageAttention: en lugar de compilar CUDA en cada job de CI, el pipeline referencia el wheel por URL en `[tool.uv.sources]` y `uv sync` resuelve la dependencia binaria en segundos, reduciendo el tiempo de build y la variabilidad entre ejecuciones.
- Despliegue reproducible en produccion: fijar el wheel junto con su SHA-256 permite reconstruir exactamente el mismo entorno binario en distintas maquinas, algo critico cuando el kernel afecta al rendimiento y a la estabilidad de la inferencia.
- Entornos con toolchain CUDA restringido: equipos que no pueden instalar `nvcc` ni compilar extensiones nativas (contenedores minimos, runners sin GPU en build time) pueden consumir el wheel ya compilado y ejecutarlo despues en el nodo con GPU.
- Investigacion en atencion eficiente: comparar el comportamiento de SageAttention 2.2.0 frente a SageAttention3 1.0.0 en distintas generaciones de GPU sin necesidad de reconstruir ambos kernels desde fuente.
- Compatibilidad con CUDA graphs en pipelines de inferencia de baja latencia: el parche que lanza los kernels Sage2 en el stream actual de torch es un requisito directo para capturar grafos CUDA, por lo que este repositorio habilita ese modo de ejecucion sin tocar el codigo upstream.
- Reconstruccion auditable de dependencias: los equipos que necesitan compilar el kernel por su cuenta pueden descargar el parche, aplicarlo con `git am` sobre `d1a57a5` y reproducir el proceso documentado con las mismas variables de entorno y lista de arquitecturas.
- Estandarizacion interna de versiones entre varios repositorios: al publicar el wheel en una CDN accesible y con rutas versionadas por etiqueta de build, varios proyectos pueden compartir el mismo artefacto y la misma version local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de latencia, throughput ni comparaciones numericas frente a otros kernels de atencion; unicamente describe el proceso de compilacion, los artefactos y sus hashes.

## Requisitos de hardware

- Arquitecturas CUDA objetivo de los wheels publicados: sm80, sm89, sm90a y sm120a para SageAttention 2.2.0; sm100a y sm120a para SageAttention3 1.0.0.
- Correspondencia habitual de esas arquitecturas en terminos de familia de GPU: sm80 corresponde a Ampere (A100 y equivalentes), sm89 a Ada Lovelace (RTX 4090, L40S y equivalentes), sm90a a Hopper (H100 y equivalentes), sm100a a Blackwell de centro de datos y sm120a a Blackwell de consumo.
- VRAM estimada para inferencia: no aplica; el repositorio distribuye un kernel de atencion, no un modelo, por lo que el consumo de memoria depende del modelo que lo utilice.
- GPU recomendadas por artefacto: para el wheel principal, GPUs con sm80, sm89, sm90a o sm120a; para SageAttention3, GPUs con sm100a o sm120a.
- Cabe en GPU de consumo: si la GPU declara una de las arquitecturas soportadas, en particular sm89 y sm120a, el wheel es instalable y ejecutable en hardware de consumo; no se documentan requisitos adicionales de memoria.
- Opciones de despliegue: instalacion del wheel con `uv` (referenciado por URL en `[tool.uv.sources]`) o con `pip` a partir del fichero `.whl`; reconstruccion desde fuente mediante `git clone` de thu-ml/SageAttention, `git checkout d1a57a5`, `git am` del parche y `python setup.py bdist_wheel`.
- Requisitos del entorno de reconstruccion: Python con `torch==2.9.1+cu130`, `setuptools<75`, `wheel<0.44`, `packaging` y `ninja` instalados, ademas de CUDA 13.0 en `CUDA_HOME`.
- Limitacion de plataforma: los wheels publicados son `cp310` y `linux_x86_64`, por lo que estan atados a CPython 3.10 y a Linux sobre x86_64.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No aplica en sentido estricto, porque el repositorio no contiene un modelo. La comparacion relevante es entre alternativas de obtencion del mismo kernel o de kernels equivalentes:

| Alternativa | Que ofrece | Arquitecturas | Licencia | Disponibilidad |
|---|---|---|---|---|
| amarkovich/attention-wheels (este repositorio) | Wheels precompilados de SageAttention 2.2.0 y SageAttention3 1.0.0, mas el parche aplicado, para CUDA 13.0, torch 2.9.1+cu130 y CPython 3.10 | sm80, sm89, sm90a, sm100a, sm120a | Apache 2.0 | Publico en HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| Upstream thu-ml/SageAttention (commit d1a57a5) | Codigo fuente sin parche; requiere compilacion local | Depende de la lista de arquitecturas que configure el usuario | no disponible en la informacion proporcionada | Repositorio publico en GitHub |
| Compilacion local a partir de fuente | Maxima flexibilidad de version de CUDA, torch y arquitecturas, a cambio de tiempos de build y necesidad de toolchain | Configurable por el usuario | Sujeta a la licencia del proyecto upstream | No requiere artefactos intermedios |
| Otros kernels de atencion (FlashAttention, xformers, atencion nativa de PyTorch) | Alternativas funcionales de atencion optimizada | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado entre estas opciones en la informacion proporcionada, por lo que no se pueden establecer conclusiones cuantitativas.

## Limitaciones y advertencias

- No es un modelo: no genera texto, no razona ni procesa lenguaje; cualquier evaluacion de capacidades propias de un modelo carece de sentido sobre este repositorio.
- Sin adopcion registrada: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de terceros y de evidencia publica de uso en produccion.
- Amarre estricto de versiones: los wheels estan compilados para torch 2.9.1+cu130, ABI C++11, CUDA 13.0, CPython 3.10 y Linux x86_64. Un cambio en cualquiera de esos ejes invalida el artefacto.
- Dependencia de un fork con parche propio: el wheel no es identico al upstream `d1a57a5`, sino que incorpora dos commits del autor. Auditarlo exige revisar `sageattention-odyssey.patch`.
- Mantenimiento individual: el repositorio pertenece a un unico autor y no se declara gobernanza, cadencia de actualizacion ni politica de soporte.
- Riesgo de obsolescencia: al fijar CUDA 13.0 y torch 2.9.1, el artefacto quedara desactualizado cuando el ecosistema avance, y no se documenta un proceso automatico de reconstruccion.
- Verificacion de integridad: la propia model card advierte de que recibir un HTTP 200 no es evidencia de integridad, por lo que debe comprobarse el SHA-256 tras la descarga mediante la URL `resolve/`.
- Cobertura de hardware parcial: no hay wheel para arquitecturas anteriores a sm80 (por ejemplo Turing, sm75) ni para plataformas distintas de Linux x86_64.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario debe asumir las obligaciones de atribucion y de conservacion de avisos, ademas de verificar la licencia del proyecto upstream.
- Sesgos y alucinacion: no aplica, al no tratarse de un modelo generativo.
- Fechas de publicacion y actualizacion: el repositorio figura creado y actualizado el 2026-09-24, con apenas cuatro segundos de diferencia entre ambos eventos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/amarkovich/attention-wheels
- Wheel SageAttention 2.2.0: https://huggingface.co/amarkovich/attention-wheels/resolve/main/wheels/odyssey-acd75b5/sageattention-2.2.0+cu130torch2.9cxx11abitrue-cp310-cp310-linux_x86_64.whl
- Wheel SageAttention3 1.0.0: https://huggingface.co/amarkovich/attention-wheels/resolve/main/wheels/odyssey-acd75b5/sageattn3-1.0.0+cu130torch2.9cxx11abitrue-cp310-cp310-linux_x86_64.whl
- Parche aplicado: https://huggingface.co/amarkovich/attention-wheels/resolve/main/wheels/odyssey-acd75b5/sageattention-odyssey.patch
- Fuente upstream: https://github.com/thu-ml/SageAttention/tree/d1a57a5
- Nota: las busquedas web realizadas no devolvieron resultados relevantes sobre este repositorio; los unicos enlaces utiles son los anteriores.
