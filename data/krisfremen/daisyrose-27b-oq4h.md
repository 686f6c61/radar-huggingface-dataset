# krisfremen/DaisyRose-27B-oQ4h

## Resumen

DaisyRose-27B-oQ4h es una publicacion de krisfremen en Hugging Face que consiste en una version cuantizada del modelo base Qwen3.5-27B, aunque la informacion disponible presenta una discrepancia significativa: el nombre del repositorio indica "27B" mientras que los pesos reales en safetensors suman 6.788.059.888 parametros (aproximadamente 6,8 mil millones). Esta ficha documenta ambos datos tal como aparecen en la informacion proporcionada.

La publicacion utiliza oQ (oMLX v0.8.0), una herramienta de cuantizacion de precision mixta del proyecto oMLX, que combina distintos formatos de almacenamiento (Affine 5-bit y 6-bit con grupo 64, BF16 y U32) para producir un checkpoint con un promedio efectivo de 20,263 bits por peso. El resultado es un repositorio de 17,2 GB en formato MLX, orientado a la inferencia en hardware Apple Silicon.

El modelo incluye un componente de vision (0,461B parametros, 0,921 GB) ademas del modelo de lenguaje (6,327B parametros, 16,272 GB), lo que sugiere capacidades multimodales. La publicacion no incluye pipeline declarado, licencia, idiomas ni datos de benchmarks, y registra cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag del modelo: qwen3_5; transformer multimodal inferido por presencia de modulo de vision) |
| Parametros totales | 6.788.059.888 (segun safetensors); el nombre del repo indica 27B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ mixed-precision: Affine 5-bit grupo 64, Affine 6-bit grupo 64, BF16, U32; promedio efectivo 20,263 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria mlx); repo de 17,2 GB |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. El tag `qwen3_5` sugiere que deriva de la familia Qwen3.5, y la presencia de un modulo de vision de 0,461B parametros indica una arquitectura multimodal. No se especifican datos de entrenamiento, numero de tokens, composicion del dataset ni procesos de RLHF/DPO.

La innovacion tecnica documentada es el esquema de cuantizacion oQ de oMLX v0.8.0, que aplica precision mixta por tensor: 1,271B parametros en Affine 5-bit (5,50 bits/peso efectivos), 1,271B en Affine 6-bit (6,50 bits/peso), 0,847B en BF16 (16 bits/peso) y 3,398B en U32 (32 bits/peso). Esta distribucion busca preservar capas sensibles en mayor precision mientras comprime el grueso de los pesos. El checkpoint resultante ocupa 16,013 GiB (17,194 GB) en disco.

## Capacidades

- Generacion de texto y modelado de lenguaje, segun el componente de LM de 6,327B parametros.
- Procesamiento de vision, gracias al modulo visual de 0,461B parametros incluido en el checkpoint.
- Capacidades especificas de tool calling, agentes, matematicas, codigo o modo thinking: no disponibles en la informacion proporcionada.
- Cobertura multilingue: no disponible.
- Inferencia optimizada para el framework MLX (Apple Silicon).

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el formato MLX y el esquema de cuantizacion mixta permiten ejecutar el modelo en equipos con memoria unificada, aprovechando la aceleracion nativa de MLX en chips M-series.
- Prototipado de aplicaciones multimodales en local: la inclusion del modulo de vision permite experimentar con tareas imagen-texto sin depender de infraestructura en la nube.
- Evaluacion de tecnicas de cuantizacion: el desglose detallado por formato (5-bit, 6-bit, BF16, U32) lo convierte en un caso de estudio util para investigar el impacto de la precision mixta en calidad y tamano.
- Despliegue en entornos con memoria limitada: al ocupar 16,013 GiB, encaja en configuraciones de memoria unificada de 24-32 GB, a diferencia de un checkpoint de 27B en BF16.
- Experimentacion con modelos derivados de Qwen3.5: util para comparar comportamiento frente al modelo base sin cuantizar.
- Pruebas de integracion con oMLX: sirve como referencia para validar el pipeline de cuantizacion oQ v0.8.0 en flujos de trabajo propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 16,013 GiB para los pesos; se requiere memoria adicional para el contexto KV cache (no cuantificado en este checkpoint).
- Hardware objetivo: Apple Silicon con memoria unificada; el formato MLX no esta pensado para GPU NVIDIA/AMD.
- Cabe en consumer hardware: si, en equipos Apple con 24 GB o 32 GB de memoria unificada (M-series Pro/Max), segun el tamano de 16,013 GiB del checkpoint.
- Opciones de despliegue: MLX (libreria declarada) y oMLX; vLLM, llama.cpp, Ollama o TGI no estan indicados para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DaisyRose-27B-oQ4h | 6,788B (segun safetensors) | no disponible | MLX safetensors (oQ mixto) | no disponible | Hugging Face (0 descargas) |
| Qwen3.5-27B (base presumible) | 27B (segun nombre) | no disponible | no disponible | no disponible | no disponible en esta informacion |
| Alternativas de 6-7B en MLX | no disponible | no disponible | MLX | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa rigurosa con alternativas concretas; la informacion proporcionada no incluye modelos comparables verificables.

## Limitaciones y advertencias

- Discrepancia critica de nomenclatura: el nombre indica 27B pero los pesos suman 6,788B; conviene verificar el modelo base real antes de usarlo en produccion.
- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; tratar como restringido hasta verificacion.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni validacion externa de calidad.
- Ausencia de benchmarks: no hay datos que respalden el rendimiento tras la cuantizacion mixta.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.
- Idiomas y contexto maximo no declarados: imposible planificar despliegues multilingues o de contexto largo con garantias.
- Dependencia de MLX: no es portable a stacks CUDA/ROCm sin reconversion.
- La cuantizacion mixta con componentes en U32 y BF16 puede degradar la calidad de forma no uniforme; no hay evaluacion publicada al respecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/krisfremen/DaisyRose-27B-oQ4h
- Repositorio de la herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
