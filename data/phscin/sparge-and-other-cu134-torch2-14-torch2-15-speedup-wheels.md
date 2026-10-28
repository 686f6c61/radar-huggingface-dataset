# phscin/sparge-and-other-cu134-torch2.14-torch2.15-speedup-wheels

## Resumen

Este repositorio de HuggingFace no contiene un modelo de inteligencia artificial, sino un conjunto de wheels binarios precompilados para Windows x64 con kernels de atención acelerados por GPU (SageAttention, SpargeAttn / Sage2++, y `spas_sage_hswq_attn`). Lo publica el usuario `phscin` con licencia Apache 2.0 y está pensado para evitar la compilación local de extensiones CUDA, que en Windows requiere cadenas de herramientas como nvcc y MSVC y suele ser una fuente habitual de errores de ABI.

El artefacto resuelve un problema de distribución, no de modelado: proporciona binarios ya compilados contra CUDA 13.4 y CPython 3.13 para que un usuario pueda instalarlos con `pip install` y utilizarlos en pipelines de inferencia con PyTorch. Los nombres de fichero apuntan a entornos concretos: PyTorch 2.14.0, PyTorch 2.15.0, una build de desarrollo de PyTorch 2.16, CUDA 13.2 y 13.4, y compute capability SM120 en el caso de SpargeAttn.

Es relevante ahora porque el ecosistema de aceleración de atención (difusión de imágenes y vídeo, transformers) se mueve más rápido que la publicación de wheels oficiales para Windows, y porque las GPU Blackwell consumer (serie RTX 50, mencionada explícitamente como RTX 5080 en los nombres de fichero) exigen compilaciones específicas por arquitectura. No hay parámetros, contexto ni datos de entrenamiento que evaluar: la ficha se centra en especificaciones de plataforma, compatibilidad y riesgos de despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no aplica; no es un modelo neuronal, sino kernels de atención compilados (SageAttention 2.2.0, SageAttention 3, SpargeAttn / Sage2++, `spas_sage_hswq_attn`) |
| Parámetros totales | no aplica |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantización | no aplica; el repositorio distribuye binarios, no pesos |
| Idiomas soportados | no aplica |
| Licencia | Apache 2.0 (según metadatos del repositorio) |
| Formato de pesos | no aplica; formato de distribución: `.whl` (wheel binario CPython 3.13, `win_amd64`) |
| Tipo de artefacto | wheels precompilados de extensiones CUDA para PyTorch |
| Autor | phscin |
| Plataforma | Windows x64 |
| Versión de Python | CPython 3.13 (etiqueta `cp313` en los nombres de fichero) |
| Versiones de CUDA | 13.2 y 13.4 en los wheels listados; las etiquetas del repositorio mencionan también 12.4, 12.6, 12.8 y 13.0 |
| Versiones de PyTorch | 2.14.0, 2.15.0 y una build de desarrollo de 2.16 |
| GPU objetivo | NVIDIA; el wheel de SpargeAttn está compilado para SM120 (compute capability 12.0) y los nombres de fichero mencionan RTX 5080 |
| Descargas | 0 |
| Likes | 0 |
| Tamaño del repositorio | 0.0 GB (según metadatos) |
| Fecha de creación | 2026-10-28 |
| Última actualización | 2026-10-28 |

## Arquitectura y entrenamiento

No existe arquitectura de modelo ni proceso de entrenamiento asociado. El contenido son distribuciones binarias de proyectos de atención existentes, tal y como declara el propio autor: "These are precompiled binary distributions of existing projects, not new attention implementations". Por tanto, no hay dataset, número de tokens, ni fases de RLHF/DPO que describir.

La información disponible no detalla la implementación interna de cada kernel (estrategias de cuantización, patrones de dispersión, uso de Tensor Cores, etc.). Los nombres de fichero sí permiten identificar el entorno de compilación de cada binario: `SageAttention3-RTX5080-CUDA134-Python313.whl` (SageAttention 3, CUDA 13.4, CPython 3.13), `SpargeAttn-Sage2pp-CUDA134-SM120-Python313.whl` (SpargeAttn / Sage2++, SM120), `sageattention-2.2.0_Torch216dev_CUDA134_Py313_RTX5080.whl` (SageAttention 2.2.0 contra una build de desarrollo de PyTorch 2.16), y dos wheels de `spas_sage_hswq_attn` en versiones 1.0.0 (CUDA 13.2 / PyTorch 2.14.0) y 1.2.1 (CUDA 13.4 / PyTorch 2.15.0). El autor advierte que la compatibilidad con versiones más recientes de PyTorch no está garantizada para todos los wheels, ya que pueden producirse cambios de ABI.

## Capacidades

- Instalación de kernels de atención acelerados en Windows sin compilar desde código fuente, mediante `pip install` sobre un fichero `.whl`.
- Soporte de tres familias de kernels según los ficheros publicados: SageAttention (versiones 2.2.0 y 3) y SpargeAttn / Sage2++, más un paquete adicional `spas_sage_hswq_attn`.
- Cobertura de configuraciones CUDA 13.2 y 13.4 con CPython 3.13.
- Compilación específica para SM120 en el wheel de SpargeAttn, orientada a GPU Blackwell (los nombres de fichero citan RTX 5080).
- Sustitución de la ruta de compilación local (nvcc, MSVC, cadenas de herramientas CUDA) por un binario ya enlazado.
- Integración potencial en pipelines de PyTorch que usen atención como primitiva; las etiquetas del autor mencionan explícitamente ComfyUI, Stable Diffusion, SDXL, SD 3.5, Flux, WAN 2.1/2.2, HunyuanVideo y LTX Video, aunque se trata de palabras clave declarativas y no de compatibilidad verificada en la información disponible.
- No ofrece generación de texto, razonamiento, código, visión, tool calling ni capacidades de agente: no es un modelo.

## Casos de uso

- Despliegue de ComfyUI en Windows con GPU RTX 50: instalar el wheel correspondiente permite usar kernels de atención compilados para SM120 sin montar un entorno de compilación CUDA, lo que reduce el tiempo de puesta en marcha y los fallos de enlazado.
- Aceleración de pipelines de difusión de imágenes en producción sobre Windows: si el pipeline invoca atención como primitiva, sustituir la implementación por defecto por estos kernels evita cuellos de botella en la fase de atención, aunque el beneficio real debe medirse en el hardware concreto.
- Generación de vídeo con modelos tipo Wan o HunyuanVideo en estaciones Windows: son cargas con secuencias largas donde el coste de atención crece de forma cuadrática; los kernels optimizados son el punto habitual de intervención.
- Estandarización de entornos de investigación: fijar una combinación concreta de CUDA 13.4 + PyTorch 2.15.0 + CPython 3.13 y distribuir internamente el wheel evita que cada investigador compile su propia versión con resultados potencialmente distintos.
- Integración en imágenes de contenedor o entornos reproducibles para CI: al ser un `.whl` versionado, se puede fijar la dependencia y auditar el binario, en lugar de depender de una compilación en tiempo de instalación.
- Evaluación comparativa de kernels de atención: disponer de SageAttention 2.2.0, SageAttention 3 y SpargeAttn/Sage2++ compilados para el mismo stack permite medir latencia y calidad relativa en una misma máquina Windows.
- Recuperación de entornos bloqueados sin compilador: en máquinas corporativas sin Visual Studio Build Tools ni permisos de administrador para instalar CUDA Toolkit, un wheel precompilado es la única vía práctica de usar estos kernels.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye latencias, throughput, comparativas numéricas ni metodología de medición; la única referencia a rendimiento es la etiqueta `faster wheels`, que es una afirmación cualitativa sin cifras. El autor indica además que el rendimiento "depende del wheel, la GPU, el entorno software y la carga de trabajo", por lo que cualquier expectativa de speedup debe validarse con una medición propia.

## Requisitos de hardware

- Sistema operativo: Windows x64 exclusivamente; no se distribuyen binarios para Linux en este repositorio.
- CPU/intérprete: CPython 3.13 (etiqueta `cp313`); otras versiones de Python no son compatibles con estos wheels.
- GPU: NVIDIA con soporte en los kernels compilados. El wheel de SpargeAttn requiere SM120 (compute capability 12.0); el autor advierte explícitamente que SM120 no implica compatibilidad con todas las RTX.
- VRAM estimada: no disponible; al no ser un modelo, el consumo depende del modelo que se acelere y del tamaño de lote y secuencia.
- GPU recomendadas: no disponible. Los nombres de fichero mencionan RTX 5080; las etiquetas citan las series RTX 30, 40 y 50, Ampere, Ada Lovelace y Blackwell, pero no hay tabla de compatibilidad verificada.
- Runtime: CUDA 13.2 o 13.4 según el wheel, y PyTorch 2.14.0, 2.15.0 o una build de desarrollo de 2.16 según el fichero.
- Despliegue: instalación con `python -m pip install .\filename.whl` en el entorno Python de destino. No aplica despliegue con vLLM, llama.cpp, Ollama ni TGI, que sirven modelos, no kernels.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Tipo | Plataforma | Versiones objetivo | Compilación local necesaria | Licencia |
|---|---|---|---|---|---|
| Este repositorio (`phscin/sparge-and-other-cu134-...`) | Wheels de SageAttention 2.2.0/3, SpargeAttn y `spas_sage_hswq_attn` | Windows x64, CPython 3.13 | CUDA 13.2 y 13.4; PyTorch 2.14.0, 2.15.0 y 2.16 dev | No | Apache 2.0 |
| Repositorio hermano `phscin/spas_sage_hswq_attn-1.2.1cu134torch2.15.0cxx11abitrue-cp313-cp313-win_amd64` | Wheel individual de `spas_sage_hswq_attn` 1.2.1 | Windows x64, CPython 3.13 | CUDA 13.4, PyTorch 2.15.0 | No | no disponible en la información proporcionada |
| Compilación desde el código fuente de los proyectos originales | Código fuente | Multiplataforma | Depende del usuario | Sí | la de cada proyecto original |
| Wheels oficiales publicados por los proyectos originales | Binarios | no disponible en la información proporcionada | no disponible | No | la de cada proyecto original |

No se dispone de datos para comparar rendimiento entre estas opciones, porque el repositorio no publica métricas.

## Limitaciones y advertencias

- No es un modelo: no debe evaluarse como tal ni usarse para tareas de generación, razonamiento o comprensión del lenguaje.
- Fragilidad de ABI: los wheels se compilaron contra versiones concretas de PyTorch y CUDA. El autor advierte que versiones más recientes de PyTorch pueden funcionar o no según los cambios de ABI, y que la compatibilidad no se ha establecido para todos los wheels.
- Cobertura de GPU muy restringida: el wheel de SpargeAttn está compilado para SM120; usarlo en otra compute capability fallará o no cargará los kernels. No hay matriz de compatibilidad publicada.
- Solo Windows x64 y CPython 3.13: sin soporte para Linux, macOS ni otras versiones de Python en este repositorio.
- El tamaño del repositorio figura como 0.0 GB, lo que resulta llamativo para cinco binarios CUDA; conviene verificar que los ficheros `.whl` estén efectivamente subidos antes de planificar un despliegue.
- Cero descargas y cero likes, creado y actualizado el mismo día: no hay evidencia de uso, mantenimiento ni soporte por parte de la comunidad.
- Distribución "as-is" sin garantías: el autor no ofrece soporte ni se responsabiliza de la compatibilidad o el rendimiento.
- Las etiquetas del repositorio (ComfyUI, Flux, Wan, HunyuanVideo, SDXL, xFormers, FlashAttention, etc.) son palabras clave para facilitar búsquedas y no constituyen una declaración de compatibilidad verificada.
- Licencia: el repositorio declara Apache 2.0, pero al redistribuir binarios de proyectos de terceros es necesario comprobar las licencias de SageAttention, SpargeAttn y del paquete `spas_sage_hswq_attn` originales antes de un uso comercial.
- Riesgo de seguridad: instalar un `.whl` de un autor no verificado ejecuta código nativo con los privilegios del usuario; se recomienda auditar el origen y el hash del fichero.
- No hay información sobre sesgos, alucinación o limitaciones de idioma porque no hay modelo que los presente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/phscin/sparge-and-other-cu134-torch2.14-torch2.15-speedup-wheels
- Repositorio enlazado en la model card para descarga de wheels: https://huggingface.co/phscin/spas_sage_hswq_attn-1.2.1cu134torch2.15.0cxx11abitrue-cp313-cp313-win_amd64/tree/main
- Papers, blogs, repositorios de código y demos: no disponibles en la información proporcionada.
