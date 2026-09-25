# Sigmo23/ext2l-wheels-orca

## Resumen

Sigmo23/ext2l-wheels-orca no es un modelo de lenguaje, sino un repositorio de distribución de wheels binarios precompilados de ExLlamaV3 (motor de inferencia para modelos cuantizados) orientados específicamente a la NVIDIA Tesla T4, con compute capability 7.5 (sm_75), y a configuraciones multi-GPU de dos Tesla T4. El paquete resuelve un problema de compilación: la arquitectura Turing no recibe soporte completo en los kernels que el proyecto genera para arquitecturas más recientes, por lo que el autor ha compilado binarios a medida a partir del PR #325 (mma.m16n8k8 emparejado, fallback de copia síncrona y presupuesto de 64 KB de memoria compartida).

Su segunda aportación es el soporte de cuantización *fractional trellis* a 3.5 bits por peso (bpw), necesaria para cargar modelos como `orcarouter/OrcaSAQ-2-27B` sin el error «packed dimension 2 is incorrect size», junto con la compatibilidad con la tabla de embeddings int8 empaquetada de Continuum-AI-Corp (`int8_embedding`). El repositorio se publica bajo licencia Apache 2.0 y se instala con una única orden `pip install` apuntando al fichero `.whl` correspondiente.

La relevancia práctica es acotada pero clara: permite seguir ejecutando modelos cuantizados de gran tamaño en hardware Turing ya amortizado (instancias AWS g4dn, GCP con T4, entornos Google Colab o Kaggle) cuando el soporte oficial de kernels para sm_75 es incompleto. No contiene pesos, tokenizador, configuración de modelo ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo neuronal: wheels de ExLlamaV3 con kernels CUDA compilados para arquitectura NVIDIA Turing (sm_75) |
| Parametros totales | no disponible (no contiene pesos; sirve para ejecutar modelos externos, por ejemplo OrcaSAQ-2-27B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo cargado y de la configuración de ExLlamaV3) |
| Tipos de cuantizacion | Fractional trellis a 3.5 bpw (confirmado en la model card); resto de formatos de ExLlamaV3, no confirmado; tabla de embeddings int8 empaquetada (`int8_embedding`) |
| Idiomas soportados | no disponible (depende del modelo cargado) |
| Licencia | Apache 2.0 |
| Formato de pesos | No contiene pesos; distribución en wheels binarios (`.whl`) con extensiones CUDA precompiladas |
| Hardware objetivo | NVIDIA Tesla T4 (sm_75), incluyendo configuraciones de 2x Tesla T4 |
| Instalacion | `pip install https://huggingface.co/Sigmo23/ext2l-wheels-orca/resolve/main/<wheel_name>.whl` |
| Plataformas declaradas | Google Colab, Kaggle, Linux x86_64 |
| Fecha de publicacion | 2026-09-25 (metadato del repositorio; fecha anomala, ver limitaciones) |

## Arquitectura y entrenamiento

Este repositorio no contiene ningún modelo entrenado, por lo que no hay datos de entrenamiento, dataset, número de tokens ni fases de RLHF o DPO que describir. Lo que se distribuye son extensiones nativas de ExLlamaV3, un motor de inferencia escrito en Python con kernels CUDA propios, compiladas específicamente para el conjunto de instrucciones de Turing. Los puntos técnicos declarados son tres: uso de la instrucción `mma.m16n8k8` emparejada (paired) introducida por el PR #325, un fallback de copia síncrona para los casos en que la ruta asíncrona no está disponible o no es rentable en sm_75, y un presupuesto de memoria compartida de 64 KB por bloque, coherente con el límite por SM de la generación Turing.

El soporte de *fractional trellis* a 3.5 bpw es la innovación funcional más relevante: se trata de una cuantización no alineada a byte, cuyo desempaquetado requiere kernels que gestionen dimensiones empaquetadas de tamaño fraccionario. Según el autor, sin este ajuste la carga de `orcarouter/OrcaSAQ-2-27B` falla con el error «packed dimension 2 is incorrect size». Adicionalmente, los wheels son compatibles con la tabla de embeddings int8 empaquetada de Continuum-AI-Corp, un formato que reduce el coste de memoria de la capa de embeddings frente a FP16.

No se documentan en la información disponible la versión exacta de ExLlamaV3 sobre la que se construye, la versión de CUDA ni de PyTorch empleadas, ni el hash de los binarios publicados.

## Capacidades

- Acelerar la inferencia de modelos cuantizados con ExLlamaV3 sobre GPUs NVIDIA Tesla T4 (sm_75) mediante kernels nativos compilados.
- Cargar capas cuantizadas con *fractional trellis* a 3.5 bpw, incluidas las de `orcarouter/OrcaSAQ-2-27B`, sin el error de dimensión empaquetada.
- Ejecutar en configuración multi-GPU con dos Tesla T4 (el autor menciona explícitamente 2x Tesla T4).
- Usar tablas de embeddings int8 empaquetadas compatibles con Continuum-AI-Corp.
- Instalación directa por `pip` desde un fichero `.whl` alojado en HuggingFace, sin compilación local.
- No incorpora capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes por sí mismo: todas ellas dependen del modelo que se cargue sobre este motor.
- No se declaran capacidades multilingües ni modos especiales (thinking mode, audio, visión) en el repositorio.

## Casos de uso

- Despliegue de OrcaSAQ-2-27B en 2x Tesla T4: el caso que motiva el repositorio; permite cargar el modelo a 3.5 bpw en dos T4 sin recompilar ExLlamaV3 ni aplicar parches manuales al PR #325.
- Inferencia en notebooks gratuitos o de bajo coste (Google Colab, Kaggle): al distribuirse como wheels precompilados para Linux x86_64, evita la compilación de extensiones CUDA, que en estos entornos consume tiempo de sesión y suele fallar por límites de recursos.
- Servicio de inferencia en instancias cloud con T4 (por ejemplo, familias g4dn en AWS o equivalentes con T4 en GCP y OCI): reaprovecha hardware ya amortizado para servir modelos cuantizados sin migrar a A100/H100.
- Reproducibilidad de builds en CI: fijar un wheel concreto permite que distintos nodos con T4 ejecuten exactamente el mismo binario, eliminando la variabilidad introducida por compilaciones locales con versiones distintas de CUDA o del compilador.
- Evaluación comparativa de cuantizaciones: al soportar 3.5 bpw junto a formatos alineados a byte, facilita medir el compromiso entre huella de memoria y calidad en hardware Turing.
- Prototipado de pipelines de inferencia con embeddings int8: útil para reproducir el formato de Continuum-AI-Corp y valorar el ahorro de VRAM en la capa de embeddings antes de invertir en GPUs mayores.
- Integración en imágenes Docker de producción para hardware Turing: el wheel puede instalarse como capa fija, simplificando el mantenimiento frente a builds multi-etapa con nvcc.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de latencia, throughput ni calidad (MMLU, HumanEval, GSM8K u otros), y tampoco se han encontrado en la búsqueda web datos verificables sobre el rendimiento de estos wheels concretos. El autor únicamente afirma que los kernels son «optimizados» para sm_75 sin cuantificar la mejora.

## Requisitos de hardware

- GPU objetivo: NVIDIA Tesla T4 (compute capability 7.5, sm_75). Los kernels están compilados para esa arquitectura concreta.
- Multi-GPU: se declara soporte para 2x Tesla T4.
- VRAM: cada Tesla T4 dispone de 16 GB. Para OrcaSAQ-2-27B a 3.5 bpw, la estimación aritmética del peso de los parámetros es de aproximadamente 11,8 GB (27e9 × 3,5/8), a lo que hay que sumar caché KV, embeddings y *overhead* del motor; con dos T4 se reparte entre ambas GPUs. Esta cifra es un cálculo derivado del bpw declarado, no un dato publicado por el autor.
- Cabe en GPU de consumo: no se indica compatibilidad con GPUs consumer. Al estar compilado para sm_75, el binario no es directamente ejecutable en arquitecturas más nuevas (Ampere sm_86, Ada sm_89) salvo que CUDA realice JIT desde PTX, extremo no confirmado. Las GPUs consumer Turing (RTX 2060/2070/2080, sm_75) comparten compute capability con la T4, por lo que serían candidatas teóricas, aunque no está declarado ni probado.
- Opciones de despliegue: ExLlamaV3 como motor; se instala vía `pip` sobre Linux x86_64. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que son proyectos distintos y no intercambiables con estos wheels.
- Latencia y throughput: no disponible.
- Requisitos de software (versión de CUDA, PyTorch, Python): no disponibles en la información proporcionada.

## Comparativa con modelos similares

La categoría comparable no son modelos de lenguaje, sino distribuciones de kernels de inferencia para hardware Turing.

| Alternativa | Naturaleza | Soporte sm_75 | Cuantizacion 3.5 bpw | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sigmo23/ext2l-wheels-orca | Wheels precompilados de ExLlamaV3 para sm_75 | Si, declarado explicitamente | Si, *fractional trellis* | Apache 2.0 | HuggingFace, instalacion por pip |
| ExLlamaV3 upstream | Codigo fuente del motor; el usuario compila | No confirmado en la informacion disponible | Si (el soporte base lo aporta el propio proyecto) | No disponible en la informacion proporcionada | Repositorio del proyecto |
| ExLlamaV2 | Version anterior del motor, con ruta CUDA propia | No confirmado en la informacion disponible | No disponible | No disponible en la informacion proporcionada | Repositorio del proyecto |
| llama.cpp (backend CUDA) | Motor alternativo con cuantizaciones GGUF | No confirmado en la informacion disponible | No disponible (usa sus propios formatos) | No disponible en la informacion proporcionada | Repositorio del proyecto |

No se dispone de datos de rendimiento comparativos entre estas opciones en la información proporcionada, por lo que la comparativa se limita a naturaleza, licencia y disponibilidad.

## Limitaciones y advertencias

- El repositorio no contiene un modelo: no puede usarse para generar texto, razonar, escribir código ni ninguna otra tarea de IA por sí solo. Requiere cargar por separado un modelo cuantizado compatible.
- Ausencia total de métricas: no hay benchmarks, curvas de latencia ni pruebas de regresión publicadas que respalden las afirmaciones de optimización.
- Ambigüedad de compatibilidad: no se especifican versiones de CUDA, PyTorch, Python ni de ExLlamaV3. Un desajuste entre el wheel y el entorno puede provocar fallos de enlace en tiempo de carga.
- Naturaleza de los binarios: al tratarse de extensiones nativas precompiladas, no son portables entre arquitecturas. No hay garantía de que funcionen en sm_80, sm_86 o sm_89, ni en GPUs AMD o Apple Silicon. Tampoco se declara soporte para Windows.
- Ausencia de pruebas de seguridad: no hay verificación de terceros sobre el contenido de los binarios; instalar wheels de un autor individual con 0 descargas y 0 *likes* implica un riesgo de cadena de suministro que conviene mitigar con revisión previa (por ejemplo, revisión del contenido del `.whl` y de las dependencias declaradas).
- Trazabilidad de la versión upstream dudosa: no se indica sobre qué commit de ExLlamaV3 se construyeron los binarios ni si incorporan el PR #325 ya fusionado o como parche local.
- Fecha de publicación anómala: los metadatos indican 2026-09-25, posterior a la fecha habitual de consulta, lo que sugiere un error de sistema o una fecha manipulada; conviene tratarla con cautela.
- Licencia: los wheels se distribuyen bajo Apache 2.0, pero esa licencia no cubre los modelos que se ejecuten con ellos (OrcaSAQ-2-27B u otros), cuyos términos deben verificarse por separado.
- Sesgos y alucinación: no aplicables al repositorio en sí; dependen exclusivamente del modelo cargado sobre el motor.
- Idiomas: no se declara ningún soporte idiomático.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Sigmo23/ext2l-wheels-orca
- Perfil del autor: https://huggingface.co/Sigmo23
- Modelo citado por el autor, orcarouter/OrcaSAQ-2-27B: no se ha encontrado un enlace directo en la busqueda web; el identificador aparece unicamente en la model card
- OrcaRouter (proyecto relacionado con OrcaSAQ): https://www.orcarouter.ai/
- Modelo Orca de Microsoft, referencia de la familia Orca: https://huggingface.co/microsoft/Orca-2-13b
- Articulo Orca: Progressive Learning from Complex Explanation Traces of GPT-4: https://www.microsoft.com/en-us/research/publication/orca-progressive-learning-from-complex-explanation-traces-of-gpt-4/
- PR #325 de ExLlamaV3: no se ha encontrado URL en la busqueda web
- Continuum-AI-Corp (formato `int8_embedding`): no se ha encontrado URL en la busqueda web
