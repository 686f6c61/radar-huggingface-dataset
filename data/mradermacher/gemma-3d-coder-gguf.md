# mradermacher/GEMMA-3D-CODER-GGUF

## Resumen

GEMMA-3D-CODER-GGUF es la versión cuantizada en formato GGUF del modelo Shrijanagain/GEMMA-3D-CODER, publicada por mradermacher, un conocido empaquetador de cuantizaciones para el ecosistema llama.cpp. El modelo base deriva de la familia Gemma (etiquetado internamente como `gemma4` en los metadatos) y cuenta con 4.647.450.147 parámetros totales según los pesos en safetensors del modelo original. Su orientación declarada, a juzgar por el nombre, es la generación de código en el contexto de contenido 3D, aunque la model card no documenta el proceso de ajuste ni los datos empleados.

El repositorio no aporta información sobre el entrenamiento, los datos utilizados ni evaluaciones de rendimiento: la model card es una plantilla estándar de mradermacher centrada exclusivamente en las cuantizaciones disponibles. Esto significa que cualquier evaluacion cualitativa del modelo debe hacerse por cuenta del usuario, ya que no hay benchmarks ni descripcion tecnica publicada.

La relevancia practica de esta publicacion es que permite ejecutar un modelo de ~4,6B parametros en hardware de consumo mediante llama.cpp y derivados (Ollama, LM Studio, etc.), con cuantizaciones que van desde 3,1 GB (Q2_K) hasta 9,4 GB (f16), e incluye un proyector multimodal (`mmproj`) que sugiere capacidades de vision en el modelo base. La licencia Apache 2.0 facilita su uso comercial sin las restricciones habituales de la licencia Gemma original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma, etiqueta `gemma4`); detalles no disponibles |
| Parametros totales | 4.647.450.147 (~4,6B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas mmproj en f16 y Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion publicada sobre la arquitectura interna del modelo base Shrijanagain/GEMMA-3D-CODER mas alla de su pertenencia a la familia Gemma (la etiqueta `gemma4` aparece en los metadatos del repositorio). El recuento de parametros (4,6B) es coherente con un transformer decoder-only de tamano medio, pero no se documenta el numero de capas, dimensiones ocultas, mecanismo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa.

Tampoco hay datos sobre el corpus de entrenamiento, el numero de tokens procesados, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La presencia de un archivo `mmproj` (proyector multimodal) en el repositorio GGUF indica que el modelo base incorpora algun modulo de vision, pero su naturaleza y el entrenamiento asociado no estan descritos. En resumen: toda la informacion sobre arquitectura y entrenamiento esta marcada como no disponible.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y el pipeline `text-generation-inference` indican uso previsto para dialogos multi-turno.
- Generacion de codigo: el nombre del modelo sugiere especializacion en codigo, presumiblemente en contextos 3D, aunque no hay documentacion que lo confirme.
- Capacidades multimodales: la presencia de archivos `mmproj` sugiere soporte de entrada de imagenes, aunque no se detalla el alcance.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun los metadatos (`language: en`).
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Asistencia a la programacion en local: con cuantizaciones Q4_K_M de 3,5 GB, el modelo puede ejecutarse en una GPU de consumo de 8 GB y usarse como autocompletado o asistente de codigo en el editor, sin depender de servicios en la nube.
- Prototipado de herramientas 3D: dado el nombre del modelo, puede emplearse para generar scripts de modelado procedural (por ejemplo, en Blender o Three.js), aunque la calidad real debe validarse empiricamente al no haber benchmarks.
- Despliegue en entornos con requisitos de privacidad: al ser un modelo pequeno y ejecutable en local via llama.cpp, encaja en escenarios donde el codigo o los datos no pueden salir de la infraestructura propia.
- Experimentacion academica con modelos Gemma: sirve como base para estudiar el efecto de la cuantizacion (de Q2_K a f16) en tareas de generacion de codigo, comparando las distintas versiones publicadas.
- Integracion en pipelines de CI/CD para revision de codigo: con una ventana de contexto suficiente (no documentada), podria analizar diffs y sugerir cambios; requiere validacion previa de latencia y calidad.
- Aplicaciones multimodales ligeras: el proyector `mmproj` permite experimentar con entrada de imagenes en un modelo de 4,6B, por ejemplo para describir diagramas o capturas relacionadas con modelado 3D.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (solo pesos, sin overhead de contexto): Q2_K ~3,1 GB; Q4_K_M ~3,5 GB; Q6_K ~3,9 GB; Q8_0 ~5,1 GB; f16 ~9,4 GB. El proyector multimodal anade 0,7 GB (Q8_0) o 1,1 GB (f16).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 para las versiones de mayor precision con contexto amplio; A100/H100 solo si se necesita throughput alto en serving.
- Cabe en GPU de consumo: si, practicamente en todas las tarjetas con 8 GB o mas usando Q4_K_M o inferiores; las versiones Q2/Q3 caben incluso en GPUs de 4-6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, y servidores compatibles con GGUF; el tag `text-generation-inference` sugiere compatibilidad con TGI, aunque el formato nativo del repo es GGUF.
- Latencia y throughput: no disponibles (no hay mediciones publicadas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GEMMA-3D-CODER-GGUF | ~4,6B | no disponible | Apache 2.0 | GGUF | Especializado (presuntamente) en codigo 3D; sin benchmarks |
| Gemma-AIO-GGUF (mradermacher) | no disponible | no disponible | Apache 2.0 | GGUF | Otra cuantizacion de la familia Gemma publicada por el mismo autor |
| Shrijanagain/GEMMA-3D-CODER | ~4,6B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar del que deriva esta ficha |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no hay model card descriptiva, benchmarks ni detalles de entrenamiento, lo que impide evaluar su calidad antes de desplegarlo.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; sin evaluaciones publicadas no puede acotarse.
- Sesgos: desconocidos, al no documentarse el corpus de entrenamiento ni el proceso de alineacion.
- Idioma: solo ingles declarado; el rendimiento en castellano no esta garantizado.
- Contexto: la longitud de contexto no esta publicada, lo que complica el dimensionamiento de memoria en produccion.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar que el modelo base cumple las condiciones de la licencia Gemma original si se redistribuye.
- Cuantizaciones agresivas (Q2_K, Q3_K_S) degradan la calidad; para produccion se recomienda Q4_K_M o superior.
- El nombre sugiere una especializacion en codigo 3D que no esta respaldada por ninguna evaluacion publica; tratarlo como un modelo de codigo generalista hasta validarlo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/GEMMA-3D-CODER-GGUF
- Modelo base: https://huggingface.co/Shrijanagain/GEMMA-3D-CODER
- Pagina de descargas del autor: https://hf.tst.eu/model#GEMMA-3D-CODER-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidades de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
