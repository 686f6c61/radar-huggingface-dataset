# Snapkitty/burt-imma

## Resumen

BURT-IMMA (BiEncoder Unified Retrieval-Transformer with Instruction, Memory, and Mixture of Experts Agents) es un proyecto de arquitectura cognitiva experimental desarrollado por el colectivo Snapkitty. Según su documentación, propone sustituir la retropropagación por un mecanismo de aprendizaje local denominado Matrix-Memory Equilibrium Propagation (MMEP), inspirado en principios biológicos y respaldado por verificación formal en Lean 4. La arquitectura consta de 13 capas que combinan generación de candidatos por superposición, validación con oráculos (Z3, SPARK, Lean 4), memoria CIFG con conservación de traza, y un mecanismo de mezcla de expertos con softmax restringido por entropía.

El repositorio en Hugging Face está vacío (0 descargas, 0 GB) y no contiene pesos, configuración del modelo ni artefactos desplegables. La información disponible se limita a la model card y a un repositorio de GitHub con código fuente (kernels CUDA, pruebas Lean 4, daemon Rust). No existen modelos comparables, benchmarks publicados ni datos de rendimiento verificables. Se trata, por tanto, de un proyecto de investigación o demostración teórica, no de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | 13 capas: codificador biEncoder compartido + transformador con memoria CIFG y MoE (descrita en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (arquitectura MoE descrita, pero sin cifras) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | BSL-1.1 (según badge de la model card); el repo de Hugging Face indica "no disponible" |
| Formato de pesos | no disponible (repo vacío; el código fuente incluye kernels CUDA y archivos Lean 4) |

## Arquitectura y entrenamiento

La model card describe una arquitectura de 13 capas que integra un codificador biEncoder para la fase de recuperación (BURT) y un transformador con memoria matricial CIFG y mezcla de expertos (IMMA) para la fase de generación. El componente central es el algoritmo MMEP, que calcula gradientes mediante dos fases (free y nudged) sin retropropagación ni transporte de pesos, basándose en el teorema de la función implícita. La memoria CIFG (Carry-Input-Forget-Gate) mantiene una matriz de producto exterior con conservación de traza, y la activación SmoothLeakyActivation está formalmente verificada con cuatro axiomas. El entrenamiento incluye restricciones de entropía (H(α) ≤ 0.20 nats), norma espectral y proyección L2.

No se proporcionan datos sobre el conjunto de entrenamiento, número de tokens, ni si se aplicaron técnicas como RLHF o DPO. La implementación incluye kernels CUDA para arquitecturas sm_86/sm_90 (RTX 30/40 y H100), verificación formal en Lean 4 con 13 archivos de prueba y 25+ teoremas (varios con estado "sorry", es decir, sin demostración completa), y un daemon Rust asíncrono para ejecución en producción con conector de borde sin bloqueos.

## Capacidades

Según la documentación del proyecto, se describen las siguientes capacidades teóricas:

- Recuperación de información mediante codificador biEncoder con atención restringida por entropía.
- Generación de texto con razonamiento multi-paso a través de superposición de K candidatos de Chain-of-Thought.
- Validación de invariantes mediante oráculos externos (Z3, SPARK, Lean 4).
- Memoria a largo plazo con actualización CIFG y conservación de traza.
- Mezcla de expertos con despacho top-k a nivel de warp en CUDA.
- Ejecución determinista verificada formalmente (teorema `exec = exec` probado por reflexión).
- Soporte de tool calling y agentes: la arquitectura de 13 capas incluye actores booleanos y un planificador determinista SPARK.
- Capacidades multilingües: no especificadas.
- Modo "thinking": la fase de superposición sugiere generación de múltiples rutas de razonamiento antes del colapso a un estado verificado.

## Casos de uso

Dado que no hay pesos disponibles ni modelo desplegable, los casos de uso son hipotéticos y se derivan de la arquitectura descrita:

- **Investigación en aprendizaje biológicamente plausible**: el MMEP podría servir como banco de pruebas para estudiar alternativas a la retropropagación en entornos académicos.
- **Sistemas de recuperación con verificación formal**: la combinación de biEncoder y oráculos podría aplicarse a dominios donde se requiere trazabilidad y corrección demostrable (por ejemplo, documentos legales o médicos).
- **Agentes deterministas para automatización de procesos**: la capa de ejecución SPARK promete determinismo, útil en pipelines donde la reproducibilidad es crítica.
- **Razonamiento multi-paso con supervisión de invariantes**: la generación de candidatos y su validación con Z3/Lean 4 podría explorarse para problemas de matemáticas o verificación de software.
- **Despliegue en hardware edge**: los kernels CUDA para sm_86/sm_90 y el daemon Rust sugieren un diseño orientado a inferencia de baja latencia en GPU de consumo.
- **Estudio de memoria a largo plazo**: la memoria CIFG con conservación de traza podría interesar a investigadores de modelos recurrentes o de memoria externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una métrica de entropía (H(α) ≤ 0.20 nats) y una afirmación de complejidad (T=1 inference igual a MMRU denso: O(L·d²) tiempo, O(L·K·d²) memoria), pero no hay cifras de MMLU, HumanEval, GSM8K ni ninguna evaluación estándar.

## Requisitos de hardware

Según los kernels CUDA declarados:

- GPU compatibles: arquitecturas sm_86 (RTX 30 series) y sm_90 (H100, RTX 40 series).
- VRAM estimada: no disponible (depende del tamaño del modelo, que no se especifica).
- No se indica si cabe en GPU de consumo; los kernels apuntan a sm_86/sm_90, lo que incluye tarjetas como RTX 3090/4090, pero sin datos de memoria no se puede confirmar.
- Opciones de despliegue: el proyecto incluye un daemon Rust con conector de borde sin bloqueos (crossbeam + memmap2), pero no hay integraciones con vLLM, llama.cpp, Ollama o TGI documentadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se puede establecer una comparativa con modelos reales. La arquitectura propuesta (MMEP, memoria CIFG, verificación formal) no tiene equivalentes comerciales o de código abierto conocidos con los que contrastar parámetros, contexto o rendimiento. Cualquier comparación sería especulativa.

## Limitaciones y advertencias

- **Sin artefactos desplegables**: el repositorio de Hugging Face está vacío; no hay pesos, tokenizador ni configuración para ejecutar el modelo.
- **Verificación formal incompleta**: varios teoremas clave (convergencia de MMEP, conservación de traza, validez del softmax restringido) están marcados como "sorry" (esbozo sin demostración) en los archivos Lean 4.
- **Rendimiento no demostrado**: no existen benchmarks ni evaluaciones independientes; las afirmaciones de eficiencia (14.3× más rápido en sesión PyTorch) carecen de reproducibilidad pública.
- **Licencia ambigua**: el badge indica BSL-1.1, pero el repo de Hugging Face no declara licencia; BSL-1.1 permite uso no productivo pero restringe uso comercial sin licencia adicional.
- **Riesgo de alucinación y sesgos**: no hay datos sobre evaluación de sesgos o alucinaciones; al ser un proyecto sin modelo publicado, estos riesgos no pueden evaluarse.
- **Dependencia de oráculos externos**: la validación con Z3/SPARK/Lean 4 introduce latencia y dependencias que podrían no estar disponibles en entornos de producción.
- **Soporte limitado**: sin comunidad, sin documentación de uso práctica ni ejemplos ejecutables, el proyecto es difícil de adoptar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Snapkitty/burt-imma
- GitHub (SNAPKITTYWEST/burt-imma): https://github.com/SNAPKITTYWEST/burt-imma
- Perfil de Snapkitty en Hugging Face: https://huggingface.co/Snapkitty
- Página de investigación de SnapKitty OS: https://collectivekitty.com/papers
