# SNAPKITTYWEST/burt-imma

## Resumen

BURT-IMMA es una arquitectura experimental de aprendizaje automático propuesta por el desarrollador SNAPKITTYWEST (también conocido como Ahmad Parr). El proyecto plantea una red neuronal de 13 capas cuya regla de aprendizaje es la Matrix-Memory Equilibrium Propagation (MMEP), un algoritmo de dos fases, localmente computable y de tipo Hebbiano, que evita el tensor de gradientes, el transporte de pesos y la retropropagación convencional. Incluye una celda de memoria CIFG que mantiene un estado completo d × d, un router con límite de entropía de 0.20 nats verificado formalmente, y una pila de siete kernels CUDA dirigidos a la arquitectura sm_86 (RTX 3080).

El modelo fue entrenado sobre el corpus SNAPKITTYWEST/sovereign-training-corpus, pero los pesos preentrenados aún no se han publicado: el repositorio libera la arquitectura, el código y las pruebas formales en Lean 4. Por ello, BURT-IMMA no es actualmente un modelo utilizable para inferencia, sino una propuesta técnica que combina conceptos de aprendizaje sin retropropagación, memoria matricial y verificación formal. Su relevancia radica en que ofrece una línea de investigación alternativa al paradigma dominante de backprop, con documentación explícita de propiedades matemáticas y un compilador de kernels que cubre nueve arquitecturas de ISA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de 13 capas con celda CIFG de memoria matricial y regla de aprendizaje MMEP (sin retropropagación) |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (etiqueta "en") |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (los pesos preentrenados no se han publicado; el código se declara en PyTorch) |

## Arquitectura y entrenamiento

La arquitectura consta de 13 capas, con una celda de memoria central CIFG que actualiza su estado mediante la ecuación `C_t = f_t * C_{t-1} + (1-f_t) * (v_t outer k_t)`. Esto configura una memoria de matriz completa de dimensión d × d, con recuperación basada en suma-inversión. La regla de aprendizaje MMEP es de dos fases, localmente computable y de tipo Hebbiano, sin gradientes automáticos ni transporte de pesos. El sistema incluye un router con restricción de entropía (`H(alpha) <= 0.20 nats`), una proyección espectral que actúa como garantía de relajación contractiva, una activación SmoothLeaky con especificación formal de cuatro axiomas, y actores perceptrón booleanos verificados mediante los postulados de Huntington.

El entrenamiento se realizó en una RTX 3080 con arquitectura sm_86, empleando siete kernels CUDA personalizados. La regla de actualización no utiliza Adam ni SGD, sino MMEP. El corpus de entrenamiento es SNAPKITTYWEST/sovereign-training-corpus, sin que se especifique el número de tokens ni la composición exacta. No se indica uso de RLHF, DPO ni otros ajustes de preferencias. El desarrollo incluye un registro de pruebas formales en Lean 4, con tres trabajos en LaTeX mencionados en el modelo: GDR-9, LiquidOps y Sovereign Entropy, además de ocho artículos publicados en Zenodo con fecha 2026-07-01.

## Capacidades

El modelo no tiene pesos publicados, por lo que las capacidades descritas son las que la arquitectura pretende ofrecer, no observaciones empíricas.

- Generación de texto: la etiqueta de HuggingFace lo clasifica como text-generation y el widget muestra una entrada de texto ("The architecture of learning is").
- Aprendizaje sin retropropagación: la regla MMEP es local y de dos fases, evitando el uso de gradientes y transporte de pesos; está pensada para experimentación con alternativas plausibles desde el punto de vista biológico.
- Router con entropía limitada: el enrutador restringe la entropía de salida a un máximo de 0.20 nats, con una prueba verificada por máquina en Lean 4, lo que apunta a salidas deterministas.
- Verificación formal: se incluyen pruebas en Lean 4 sobre propiedades del núcleo, de la activación y del límite de entropía, así como la equivalencia cross-ISA del stack de kernels.
- Implementación en CUDA: siete kernels personalizados para sm_86, con potencial para ser portados a otras ISAs a partir del proyecto GDR-9.
- Memoria persistente: la celda CIFG mantiene una matriz de estado completa, diseñada para almacenar información a lo largo de múltiples pasos temporales.
- Entrenamiento sobre corpus propio: el modelo se entrenó sobre SNAPKITTYWEST/sovereign-training-corpus, un conjunto de datos no descrito en detalle en la información disponible.

## Casos de uso

Los siguientes casos de uso son aplicaciones potenciales, condicionadas a la publicación de los pesos preentrenados.

- Investigación en aprendizaje local: el modelo permite estudiar reglas de actualización tipo Hebbiano y propagación de equilibrio sin retropropagación, en un entorno con código y kernels reutilizables.
- Verificación de propiedades en redes neuronales: sirve como caso de estudio para probar teoremas sobre el límite de entropía del router y la relajación contractiva de la proyección espectral, gracias a las pruebas en Lean 4.
- Compilación de kernels para múltiples ISAs: el proyecto GDR-9 presenta un stack de kernels en CUDA, NASM, RISC-V, ARM, WASM, APL, Haskell, Lean 4 y P4, lo que puede emplearse para experimentar con despliegue en entornos heterogéneos.
- Educación en arquitecturas alternativas: como recurso didáctico para ilustrar la diferencia entre MMEP y backprop, con componentes claramente separados (memoria, router, activación) y especificaciones formales.
- Desarrollo de agentes deterministas: el límite de entropía del router podría integrarse en sistemas que requieran salidas con baja aleatoriedad, como herramientas de control o generación de datos para verificación.
- Demos en hardware de consumo: los siete kernels CUDA están orientados a RTX 3080, lo que permite construir demostraciones de la arquitectura en una GPU de consumo sin depender de clústeres.
- Experimentos con memoria a largo plazo: la celda CIFG de matriz completa permite explorar representaciones persistentes en tareas secuenciales, aunque sin pesos publicados solo puede evaluarse a nivel de simulación de la regla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni ningún otro conjunto de evaluación, y no se aportan métricas de rendimiento más allá de la mención a "perplexity" en el YAML, sin valores asociados.

## Requisitos de hardware

- No se han publicado especificaciones de inferencia. El entrenamiento se realizó en una RTX 3080 con arquitectura de cómputo sm_86, utilizando siete kernels CUDA personalizados.
- VRAM estimada para inferencia: no disponible.
- GPU recomendada: no disponible. El código y los kernels publicados se dirigen a RTX 3080 (sm_86), pero no hay documentación de soporte para otras GPUs.
- ¿Cabe en GPU de consumo? No se puede determinar sin pesos y sin el tamaño de los parámetros. La RTX 3080 usada en entrenamiento es una GPU de consumo, pero no hay cifras de VRAM para inferencia.
- Opciones de despliegue: no disponible. No se indica compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros servidores estándar.; hasta que se publiquen pesos y se adapte la arquitectura, no es desplegable con esas herramientas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables de la misma categoría en la información proporcionada. BURT-IMMA carece de pesos preentrenados y de resultados de evaluación, lo que impide contrastarlo con modelos de tamaño o tarea equivalente. Además, su arquitectura (MMEP con memoria matricial CIFG y verificación formal) no encaja en las categorías de modelos comerciales disponibles en el ecosistema actual.

## Limitaciones y advertencias

- No se han publicado pesos preentrenados: el repositorio contiene arquitectura, código y pruebas formales, pero el modelo no puede utilizarse para generación de texto real.
- Sin evaluación empírica: no hay benchmarks, métricas ni resultados de rendimiento que confirmen el funcionamiento práctico de la arquitectura.
- Idiomas: declarado solo en inglés, sin garantía de soporte para otros idiomas.
- Dependencia de kernels CUDA específicos: los siete kernels están implementados para sm_86, por lo que pueden no funcionar en otras arquitecturas de GPU sin adaptación.
- Licencia Apache-2.0: permite uso comercial y modificación, pero la ausencia de pesos limita el uso práctico en producción.
- Complejidad técnica alta: reproducir o extender el modelo requiere conocimientos de CUDA, Lean 4 y del algoritmo MMEP.
- Longitud de contexto no especificada: no se indica la ventana de contexto ni su comportamiento, lo que impide evaluar su utilidad en tareas de contexto largo.

## Enlaces

- HuggingFace: https://huggingface.co/SNAPKITTYWEST/burt-imma
- GitHub: https://github.com/SNAPKITTYWEST/burt-imma
- Perfil de HuggingFace del autor: https://huggingface.co/SNAPKITTYWEST/models
- Papers referenciados en el repositorio de GitHub (archivos con nombre, accesibles desde el repo): gdr_kernels.tex, liquidops_kernel.tex, sovereign_entropy.tex
- La documentación también menciona ocho artículos publicados en Zenodo con fecha 2026-07-01, sin DOIs disponibles en la información proporcionada.
