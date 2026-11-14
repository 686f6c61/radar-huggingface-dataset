# latentport/native-runtime

## Resumen

`latentport/native-runtime` no es un modelo de lenguaje, sino un repositorio de binarios nativos precompilados para la biblioteca Python LatentPort, una herramienta de terceros orientada a operaciones de estado sobre modelos GGUF. El repositorio distribuye binarios con ABI 2 que implementan las operaciones de estado de LatentPort, incluida la funcionalidad de compactacion LPCompact. Los binarios estan compilados para Windows x64 con runtime CUDA 13.0 y para Linux x64 con runtime CUDA 12.8, ambos dirigidos a la arquitectura NVIDIA Blackwell SM120.

El paquete no contiene pesos de modelos, configuraciones de arquitectura ni tokenizadores. Los pesos base, los pesos de puente y los controladores de NVIDIA se distribuyen por separado, segun indica la propia model card. El contenido del repositorio ocupa aproximadamente 0,1 GB y se compone de archivos ZIP con las bibliotecas nativas, junto con manifiestos JSON (`native-runtime.json`, `native-build.json`) y un fichero `SHA256SUMS.txt` para verificacion de integridad.

Su relevancia es operativa mas que de modelado: sirve como artefacto de distribucion reproducible para usuarios de LatentPort que necesitan ejecutar las operaciones nativas sobre hardware Blackwell sin compilar desde fuente. Cualquier evaluacion como modelo de IA carece de sentido con la informacion disponible, ya que no se publican parametros, contexto, datos de entrenamiento ni capacidades cognitivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de lenguaje; binarios nativos para LatentPort) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio se etiqueta como GGUF, pero no distribuye pesos) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 para el codigo fuente de LatentPort; MIT para los componentes parcheados de llama.cpp/ggml |
| Formato de pesos | no disponible (los artefactos son archivos ZIP con bibliotecas nativas y manifiestos JSON) |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: el repositorio no contiene un modelo entrenado. Los artefactos son binarios nativos compilados que implementan la ABI 2 de LatentPort, con soporte para operaciones de estado, incluida la compactacion LPCompact. La model card indica que los archivos son byte a byte identicos a compilaciones nativas previamente cualificadas y que cada archivo incluye metadatos de plataforma, compatibilidad de compilador y runtime, revisiones de codigo fuente, recuentos de bytes y hashes SHA-256.

La matriz de plataformas publicada es la siguiente: Windows x64 con CUDA 13.0 y arquitectura GPU NVIDIA Blackwell SM120; Linux x64 con CUDA 12.8 y arquitectura GPU NVIDIA Blackwell SM120. No se documentan datos de entrenamiento, tokens, composicion de dataset ni tecnicas de alineacion como RLHF o DPO, porque no existe un proceso de entrenamiento asociado a este repositorio.

## Capacidades

- Distribucion de binarios nativos para LatentPort con ABI 2 en Windows x64 y Linux x64.
- Implementacion de operaciones de estado de LatentPort, incluida la compactacion LPCompact.
- Verificacion de integridad mediante `SHA256SUMS.txt` y hashes internos en `native-build.json`.
- Instalacion automatizada mediante `pip install --upgrade latentport` seguido de `latentport install-native`, con el manifiesto de descarga fijado a un commit inmutable.
- Compatibilidad declarada con CUDA 13.0 en Windows y CUDA 12.8 en Linux, dirigida a NVIDIA Blackwell SM120.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni multilingueismo, al no tratarse de un modelo.

## Casos de uso

- Despliegue de LatentPort en entornos Windows con GPU NVIDIA Blackwell: el binario precompilado evita compilar desde fuente y garantiza compatibilidad con CUDA 13.0 y SM120.
- Despliegue de LatentPort en servidores Linux con GPU Blackwell: el binario para CUDA 12.8 permite ejecutar las operaciones nativas en infraestructura de servidor sin toolchain de compilacion.
- Integracion en pipelines reproducibles: el manifiesto fijado a un commit inmutable y los hashes SHA-256 permiten auditar y verificar los artefactos en CI/CD.
- Compactacion de estado en flujos con modelos GGUF: la funcionalidad LPCompact se usa a traves de la biblioteca LatentPort para reducir el estado acumulado en operaciones de contexto largo.
- Replicacion de entornos cualificados: al ser byte a byte identicos a compilaciones previamente cualificadas, sirven para reproducir resultados en maquinas con el mismo stack CUDA y GPU.
- Distribucion interna con cumplimiento de licencias: al conservar las notas Apache-2.0 y MIT, el repositorio puede redistribuirse internamente manteniendo las atribuciones exigidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- GPU: NVIDIA Blackwell SM120, segun la matriz de plataformas de la model card.
- Runtime CUDA: 13.0 en Windows x64; 12.8 en Linux x64.
- VRAM estimada: no disponible (depende del modelo base y de los pesos de puente, que se distribuyen por separado).
- GPU consumer: no disponible; la unica arquitectura declarada es Blackwell SM120, sin lista de modelos concretos.
- Opciones de despliegue: instalacion mediante la biblioteca LatentPort (`latentport install-native`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Repositorio | Tipo de artefacto | Plataformas | Licencia | Pesos incluidos |
|---|---|---|---|---|
| latentport/native-runtime | Binarios nativos ABI 2 para LatentPort | Windows x64 (CUDA 13.0), Linux x64 (CUDA 12.8), SM120 | Apache-2.0 y MIT | No |
| Repositorios GGUF de modelos (p. ej. variantes cuantizadas de Llama, Qwen o Mistral) | Pesos cuantizados en formato GGUF | Multiples, via llama.cpp | Segun modelo base | Si |
| Repositorios de wheels CUDA precompiladas (p. ej. PyTorch, flash-attn) | Binarios de biblioteca | Multiples plataformas CUDA | BSD, Apache-2.0 u otras | No |

La comparacion directa con modelos de lenguaje no es posible porque este repositorio no contiene pesos ni arquitectura de red. Frente a repositorios de pesos GGUF, la diferencia clave es que aqui solo se distribuyen binarios de ejecucion; frente a wheels de bibliotecas CUDA, el alcance es mas estrecho (solo LatentPort y solo SM120).

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no puede evaluarse con benchmarks de NLP.
- Solo cubre NVIDIA Blackwell SM120; no hay binarios para arquitecturas anteriores como Ampere, Ada Lovelace o Hopper.
- Dependencia de versiones concretas de CUDA (13.0 en Windows, 12.8 en Linux), lo que puede limitar su uso en entornos con otros runtimes.
- Requiere LatentPort 0.2.1 o superior; la version 0.2.0 usaba descargas desde releases de GitHub y debe actualizarse antes de una instalacion nativa limpia.
- Los pesos base, los pesos de puente y los controladores de NVIDIA se distribuyen por separado, por lo que el repositorio por si solo no permite ejecutar inferencia.
- La licencia del repositorio combina Apache-2.0 (codigo LatentPort) y MIT (componentes parcheados de llama.cpp/ggml); es obligatorio conservar ambas notas al redistribuir los binarios.
- No se documentan sesgos, tasas de alucinacion ni limitaciones idiomaticas porque no hay modelo subyacente en este repositorio.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin historial de uso publico verificable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/latentport/native-runtime
- Biblioteca Python en PyPI: https://pypi.org/project/latentport/
- Codigo fuente y compilacion nativa: https://github.com/LatentPort/latentport/tree/main/native
- Guia de instalacion: https://github.com/LatentPort/latentport/blob/main/docs/installation.md
