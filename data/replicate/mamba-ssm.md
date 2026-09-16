# replicate/mamba-ssm

## Resumen

`replicate/mamba-ssm` no es un modelo de lenguaje, sino un repositorio de kernels compilados publicado en Hugging Face bajo el tipo `kernels` y la librería `kernels`. Contiene las implementaciones de bajo nivel del *selective scan* (S6) de Mamba y de los bloques Mamba y Mamba2, distribuidas como módulo cargable mediante `get_kernel("kernels-community/mamba-ssm")`. La model card indica que se trata de la réplica automática de la tarjeta del repositorio original `kernels-community/mamba-ssm`, generada por el propio Hub.

El problema que resuelve es el de proporcionar kernels CUDA optimizados y precompilados para arquitecturas de espacio de estados (SSM), evitando que cada usuario tenga que compilar el código fuente de Mamba en su entorno. Esto incluye variantes para entrenamiento, para decodificación autoregresiva token a token y para el procesamiento fragmentado de secuencias largas.

Es relevante porque la familia Mamba y sus derivados (incluida Falcon-Mamba) se emplean como alternativa a los transformers de atención cuadrática en tareas de secuencias muy largas. El repositorio ocupa 14,6 GB, cuenta con licencia Apache-2.0, cero descargas y cero *likes* en el momento de la consulta, y no publica benchmarks. La fecha de creación registrada es el 16 de septiembre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Kernels CUDA de *selective scan* (S6) y bloques SSM Mamba / Mamba2; no contiene una red neuronal con pesos |
| Parámetros totales | no disponible (no aplica: repositorio de kernels, sin pesos) |
| Parámetros activos | no aplica |
| Longitud de contexto | no disponible (depende del modelo Mamba que consuma el kernel) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | Apache-2.0 |
| Formato de pesos | no contiene pesos; artefactos compilados distribuidos mediante la librería `kernels` |
| Tipo de repositorio | `kernels` (funciones y módulos compilados, no pesos) |
| Tamaño del repositorio | 14,6 GB |
| Autor / publicador | `replicate` (réplica de `kernels-community/mamba-ssm`) |
| Fecha de creación | 2026-09-16 |
| Fecha de actualización | 2026-09-16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado ni información sobre datos de entrenamiento, número de tokens, composición del corpus o fases de RLHF/DPO. Se trata de código CUDA compilado que implementa las operaciones del *selective scan* de Mamba y Mamba2. Las funciones exportadas documentadas en la model card son: `selective_scan_fn`, `mamba_inner_fn`, `falcon_mamba_inner_fn`, `selective_state_update`, `mamba_chunk_scan_combined`, `mamba_split_conv1d_scan_combined`, además de las clases `Mamba`, `Mamba2` y `MambaLMHeadModel`.

En cuanto al diseño subyacente, Mamba es una arquitectura de espacio de estados selectivo con complejidad lineal respecto a la longitud de secuencia, en la que los parámetros de transición dependen de la entrada. Las funciones anteriores cubren los tres modos habituales de ejecución: el escaneo completo para prefill o entrenamiento (`selective_scan_fn`, `mamba_inner_fn`), la actualización recurrente del estado para decodificación autoregresiva (`selective_state_update`) y las variantes fragmentadas o fusionadas (`mamba_chunk_scan_combined`, `mamba_split_conv1d_scan_combined`). No se documentan en la información disponible las arquitecturas GPU objetivo, la versión de CUDA, ni los cambios concretos respecto a la implementación de referencia.

## Capacidades

- Ejecución del *selective scan* completo mediante `selective_scan_fn`.
- Cálculo del bloque interno de Mamba mediante `mamba_inner_fn`, con variante específica para Falcon-Mamba (`falcon_mamba_inner_fn`).
- Actualización del estado recurrente token a token con `selective_state_update`, adecuada para decodificación autoregresiva.
- Escaneo fragmentado en *chunks* con `mamba_chunk_scan_combined`, orientado a reducir el pico de memoria en secuencias largas.
- Fusión de convolución 1D y escaneo en una sola operación con `mamba_split_conv1d_scan_combined`.
- Construcción de bloques de modelo con las clases `Mamba` y `Mamba2`.
- Carga de un modelo de lenguaje completo con cabeza de salida mediante `MambaLMHeadModel`.
- Distribución como módulo precompilado a través de la librería `kernels` (`pip install -U kernels`).
- No se documentan capacidades de generación de texto, visión, audio, *tool calling*, razonamiento multi-paso ni multilingüismo, ya que no es un modelo.

## Casos de uso

- Inferencia de modelos Mamba y Mamba2 en producción: se instancian las clases `Mamba` o `Mamba2` y se ejecuta el *forward* con los kernels precompilados, evitando compilar CUDA en el contenedor de despliegue.
- Decodificación autoregresiva de bajo coste: `selective_state_update` permite actualizar el estado recurrente en cada token sin recalcular el escaneo completo, lo que es la base para generar secuencias largas con memoria acotada.
- Entrenamiento y ajuste fino de modelos SSM: `mamba_inner_fn` y `selective_scan_fn` son las operaciones necesarias para el paso hacia delante y el cálculo de gradientes en los bloques Mamba.
- Procesamiento de secuencias muy largas: `mamba_chunk_scan_combined` fragmenta el escaneo, lo que permite ajustar el consumo de memoria a la VRAM disponible en lugar de materializar el estado completo.
- Reducción de lanzamientos de kernel en el camino crítico: `mamba_split_conv1d_scan_combined` fusiona la convolución 1D con el escaneo, disminuyendo el *overhead* de sincronización en cada capa.
- Integración de modelos Falcon-Mamba: `falcon_mamba_inner_fn` cubre la variante de bloque empleada por esa familia, permitiendo reutilizar el mismo paquete para distintos linajes de modelos SSM.
- Construcción de servicios de inferencia propios: al distribuirse como módulo importable, se puede envolver en un servidor HTTP o en un *worker* de cola sin arrastrar el árbol de código fuente completo de Mamba.

## Benchmarks y rendimiento

La model card indica literalmente: «No benchmark available yet». No se han publicado resultados de benchmarks en la información disponible. Tampoco se proporcionan cifras de latencia, *throughput* ni comparaciones numéricas de corrección frente a otras implementaciones.

## Requisitos de hardware

- VRAM: no aplica al kernel en sí; el consumo depende del modelo Mamba o Mamba2 concreto que se cargue y de la longitud de secuencia. El repositorio en disco ocupa 14,6 GB de artefactos compilados.
- GPU recomendadas: no disponible. Son kernels CUDA, por lo que requieren una GPU NVIDIA, pero no se documenta la *compute capability* mínima ni una lista de aceleradores compatibles.
- Encaje en GPU de consumo: no disponible. No se puede confirmar ni descartar el funcionamiento en RTX 3090, RTX 4090 u otras tarjetas para consumidores sin datos de compatibilidad.
- Opciones de despliegue: la vía documentada es la librería `kernels` (`from kernels import get_kernel`). No se menciona integración con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y *throughput*: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de parámetros, por lo que la comparación se limita a naturaleza, licencia y forma de distribución de paquetes de kernels comparables.

| Repositorio | Tipo | Licencia | Forma de uso | Datos de rendimiento |
|---|---|---|---|---|
| `replicate/mamba-ssm` | Réplica del paquete de kernels de Mamba/SSM | Apache-2.0 | `get_kernel("kernels-community/mamba-ssm")` | No disponible |
| `kernels-community/mamba-ssm` | Paquete original de kernels de Mamba/SSM | no disponible en la información proporcionada | `get_kernel` | No disponible |
| `kernels-community/flash-attn3` | Paquete de kernels de atención (mencionado como ejemplo en la model card) | no disponible en la información proporcionada | `get_kernel` | No disponible |

No se dispone de información sobre alternativas fuera del ecosistema `kernels` para establecer una comparación técnica más detallada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni realiza tareas cognitivas por sí mismo. Es una dependencia de ejecución para modelos Mamba.
- La model card está generada automáticamente, sin documentación de versiones, changelog ni compatibilidad entre versiones del paquete.
- No hay benchmarks publicados ni métricas de corrección numérica, por lo que no es posible verificar el rendimiento frente a la implementación de referencia.
- El repositorio registra 0 descargas y 0 *likes*, lo que implica ausencia de validación por parte de la comunidad.
- Requiere GPU NVIDIA y una versión compatible de la librería `kernels`; no se documentan requisitos de CUDA ni de *compute capability*.
- Aviso recogido en la model card: a partir del 13 de septiembre de 2026 se eliminarán los repositorios de kernels de tipo «model» (por ejemplo, `kernels-community/flash-attn3`). Es necesario usar una versión reciente de la librería `kernels` y reportar interrupciones en el repositorio de incidencias.
- Licencia Apache-2.0: permite uso comercial y modificación, pero se distribuye sin garantías y con las obligaciones habituales de atribución y conservación de avisos.
- Es una réplica bajo el espacio de nombres `replicate`; conviene verificar que el paquete coincide con el original de `kernels-community` antes de usarlo en producción.
- No se declaran idiomas soportados ni advertencias sobre sesgos, al no tratarse de un modelo entrenado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/replicate/mamba-ssm
- Repositorio original referenciado en la model card: https://huggingface.co/kernels-community/mamba-ssm
- Librería `kernels`: https://github.com/huggingface/kernels
- Reporte de incidencias sobre repositorios de kernels: https://github.com/huggingface/kernels/issues/new
- Organización Replicate en Hugging Face / web: https://replicate.com/
- Explorador de modelos de Replicate: https://replicate.com/explore
- Organización Replicate en GitHub: https://github.com/replicate
- Perfil interno de Replicate: https://internal.replicate.com/replicate
