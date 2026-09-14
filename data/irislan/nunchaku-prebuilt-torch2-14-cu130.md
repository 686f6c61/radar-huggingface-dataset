# IrisLan/nunchaku-prebuilt-torch2.14-cu130

## Resumen

Este repositorio no contiene un modelo de inteligencia artificial, sino un paquete binario (wheel de Python) publicado como espejo de distribucion. Se trata de una compilacion preconstruida del proyecto Nunchaku, orientada a ejecutar kernels CUDA optimizados desde ComfyUI sobre GPU NVIDIA. El artefacto concreto esta compilado para Linux x86_64, Python 3.12 y PyTorch 2.14.0+cu130, con arquitectura objetivo `sm_89` (NVIDIA Ada Lovelace, RTX 4090). El autor del repositorio en HuggingFace es IrisLan, mientras que la model card remite a un repositorio de GitHub bajo la cuenta Odelialan.

El problema que resuelve es puramente de cadena de herramientas: evitar que el usuario tenga que compilar Nunchaku desde el codigo fuente contra una combinacion muy especifica de versiones de PyTorch, CUDA y Python, algo que habitualmente falla por desajustes de ABI o de arquitectura de GPU. El wheel se genero a partir del commit `302e0e97024ebd68688fe890e5df83731edf7b54` de Nunchaku y se valido ejecutando el kernel CUDA AWQ GEMV y sincronizando el dispositivo en una RTX 4090 fisica.

Su relevancia es de nicho: interesa a quienes despliegan modelos de difusion cuantizados en 4 bits con Nunchaku dentro de ComfyUI y necesitan reproducibilidad exacta de entorno. El repositorio ocupa 0,1 GB y no registra descargas ni likes en el momento de la consulta. No hay model card con datos de entrenamiento, parametros ni benchmarks porque no existe un modelo entrenado detras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplicable: es un wheel binario con extensiones CUDA (kernels de cuantizacion, entre ellos AWQ GEMV) |
| Parametros totales | no aplicable |
| Parametros activos | no aplicable |
| Longitud de contexto | no aplicable |
| Tipos de cuantizacion | no disponible como dato de modelo; el kernel validado en la compilacion es AWQ GEMV |
| Idiomas soportados | no aplicable |
| Licencia | apache-2.0 |
| Formato de pesos | no aplicable: el artefacto es un wheel `nunchaku-1.3.0.dev20260914+cu13.0torch2.14-cp312-cp312-linux_x86_64.whl` |
| Version de Python | 3.12 (`cp312`) |
| Version de PyTorch | 2.14.0+cu130 |
| Version de CUDA toolkit | 13.0.88 |
| Arquitectura de GPU objetivo | `sm_89` (`-gencode arch=compute_89,code=sm_89`) |
| Plataforma | Linux x86_64 |
| Commit de origen | `302e0e97024ebd68688fe890e5df83731edf7b54` (Nunchaku) |
| SHA-256 del wheel | `b29d74fca0b6021bc80714e679c93278ce35ed57dfac657ff0bbb7d3a146ef91` |
| Tamano del repositorio | 0,1 GB |
| Fecha de creacion | 2026-09-14T13:47:07.000Z |
| Ultima actualizacion | 2026-09-14T13:56:51.000Z |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento en este repositorio. Lo que se distribuye es codigo maquina compilado: extensiones de Python que enlazan contra la API de CUDA y contra PyTorch, generadas con `nvcc` para una unica arquitectura de GPU (`compute_89` / `sm_89`). El unico dato de validacion aportado es funcional, no estadistico: el wheel se instalo en una NVIDIA GeForce RTX 4090 y se ejecuto el kernel CUDA AWQ GEMV seguido de una sincronizacion de dispositivo, lo que confirma que el binario carga y ejecuta sin errores en ese hardware.

La innovacion tecnica relevante, si se puede llamar asi, es el empaquetado reproducible: el autor fija simultaneamente la version de Python, la de PyTorch, la de CUDA toolkit y la arquitectura de GPU, y publica el hash SHA-256 del artefacto junto al commit exacto del codigo fuente. El proyecto declara ademas una compilacion separada para `sm_120a` (RTX 5090, Blackwell) disponible en la Release v1.0.0 de GitHub, lo que confirma que el binario aqui descrito no es portable a esa generacion de GPU.

## Capacidades

- Distribucion de un wheel binario instalable con `pip` para el stack Nunchaku.
- Ejecucion de kernels CUDA de cuantizacion (AWQ GEMV validado explicitamente).
- Integracion prevista con ComfyUI, segun las etiquetas del repositorio.
- Compilacion dirigida a una arquitectura de GPU concreta (`sm_89`), sin fallback multi-arquitectura declarado.
- Validacion de integridad mediante SHA-256 publicado en la model card.
- No incluye generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni capacidades de agente: no es un modelo de lenguaje.

## Casos de uso

- Despliegue de modelos de difusion cuantizados en 4 bits: el wheel aporta los kernels compilados que Nunchaku necesita, de modo que el usuario evita compilar desde fuente contra CUDA 13.0 y PyTorch 2.14.
- Entornos de investigacion con reproducibilidad estricta: al publicarse commit de origen y SHA-256, se puede fijar la dependencia exacta en un `requirements.txt` o en una imagen de contenedor.
- Pipelines de generacion de imagen en ComfyUI sobre RTX 4090: la etiqueta `comfyui` y la validacion en `sm_89` apuntan a este escenario como destino principal.
- Construccion de imagenes Docker inmutables: la combinacion `cp312` + `torch2.14` + `cu13.0` permite fijar una base sin resolver dependencias en tiempo de build.
- Ahorro de tiempo en CI: instalar el wheel precompilado elimina la fase de compilacion con `nvcc`, que es la mas costosa y fragil de un pipeline con extensiones CUDA.
- Auditoria de cadena de suministro: el hash publicado permite verificar que el artefacto descargado coincide con el compilado y validado por el autor.
- Referencia para empaquetado de extensiones CUDA: sirve como plantilla de como fijar `-gencode arch=compute_89,code=sm_89` y documentar el entorno de build.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica evidencia de funcionamiento es cualitativa: el kernel AWQ GEMV se ejecuto correctamente y el dispositivo se sincronizo en una RTX 4090. No hay datos de latencia, throughput, uso de VRAM ni comparaciones de velocidad frente a otras compilaciones.

## Requisitos de hardware

- GPU objetivo: NVIDIA con arquitectura `sm_89` (serie RTX 4090 y derivadas Ada Lovelace). El binario no incluye codigo para otras arquitecturas.
- VRAM estimada para inferencia: no disponible. Depende del modelo de difusion que se cargue por encima de este paquete, no del wheel.
- GPU incompatibles declaradas: RTX 5090 / `sm_120a` requiere la compilacion separada publicada en la Release v1.0.0 de GitHub.
- GPU recomendadas: RTX 4090 (unico hardware validado explicitamente por el autor).
- Compatibilidad con GPU de consumo: si, RTX 4090, dentro del stack de software indicado.
- Sistema operativo: Linux x86_64. No se declara soporte para Windows ni macOS.
- Version de Python: exclusivamente 3.12 (`cp312`); el wheel no es instalable en 3.10, 3.11 ni 3.13.
- Version de PyTorch: 2.14.0+cu130, cuda 13.0.
- Opciones de despliegue: instalacion directa del wheel con `pip`; el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no son aplicables porque no hay modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No aplica la comparacion con modelos de IA, ya que este artefacto no es un modelo. La comparativa relevante es entre variantes de la misma distribucion binaria.

| Artefacto | Arquitectura GPU | Software | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (`IrisLan/nunchaku-prebuilt-torch2.14-cu130`) | `sm_89` (RTX 4090) | Python 3.12, PyTorch 2.14.0+cu130, CUDA 13.0.88 | wheel `.whl` | apache-2.0 | HuggingFace |
| Build `sm_120a` citado en la model card | `sm_120a` (RTX 5090) | no disponible | no disponible | no disponible | GitHub Release v1.0.0 |
| Compilacion desde fuente del commit `302e0e97` | configurable por el usuario | el usuario debe fijar las versiones | codigo fuente | segun proyecto Nunchaku | GitHub |

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no tiene parametros ni contexto. Cualquier uso como modelo de lenguaje es un error de interpretacion.
- Acoplamiento fuerte de versiones: el wheel solo funciona con Python 3.12, PyTorch 2.14.0+cu130 y CUDA 13.0. Cualquier cambio de version invalida el binario.
- Restriccion de hardware: compilado unicamente para `sm_89`. En GPUs de otras arquitecturas fallara la carga de los kernels.
- Restriccion de plataforma: Linux x86_64 exclusivamente.
- Riesgo de cadena de suministro: se distribuye codigo binario con licencia permisiva. Aunque se publica el SHA-256, no se documenta una auditoria independiente del contenido; conviene verificar el hash y, si el riesgo lo exige, compilar desde fuente.
- Inconsistencia de autoría: el autor del repositorio en HuggingFace es IrisLan, mientras que la model card enlaza un repositorio de GitHub bajo la cuenta Odelialan. Conviene confirmar la relacion entre ambas cuentas antes de confiar en el artefacto.
- Cero traccion verificable: 0 descargas y 0 likes en el momento de la consulta, sin senales de uso en produccion por terceros.
- Fechas anomales: creacion y actualizacion registradas en septiembre de 2026, posteriores a la fecha habitual de consulta; conviene verificar la coherencia temporal.
- Licencia: Apache 2.0 permite uso comercial del binario, pero no cubre los modelos que se ejecuten con el ni las obligaciones de las dependencias enlazadas (PyTorch, CUDA, Nunchaku).
- Mantenimiento no garantizado: no se declara politica de actualizaciones ni soporte; el repositorio no es un canal oficial de Nunchaku.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/IrisLan/nunchaku-prebuilt-torch2.14-cu130
- Proyecto de distribucion en GitHub: https://github.com/Odelialan/nunchaku-prebuilt-torch2.14-cu130-git-init
- Instrucciones de instalacion y compatibilidad de GPU: https://github.com/Odelialan/nunchaku-prebuilt-torch2.14-cu130-git-init#readme
- Release v1.0.0 (build `sm_120a` para RTX 5090): https://github.com/Odelialan/nunchaku-prebuilt-torch2.14-cu130-git-init/releases/tag/v1.0.0
- Commit de origen de Nunchaku: `302e0e97024ebd68688fe890e5df83731edf7b54`
- Resultados de la busqueda web: no se han encontrado enlaces relevantes; las URL devueltas corresponden a paginas generales de YouTube sin relacion con el artefacto.
