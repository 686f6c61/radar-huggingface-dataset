# cgpadwick2020/qwen3-0.6b-triton-sft-v2

## Resumen

qwen3-0.6b-triton-sft-v2 es un ajuste fino completo (full fine-tune) del modelo denso Qwen/Qwen3-0.6B, orientado especificamente a la generacion de kernels de GPU escritos en Triton a partir de una referencia en PyTorch. Lo publica el usuario cgpadwick2020 y su unico proposito es resolver una tarea muy concreta: dado un modulo PyTorch, producir un `ModelNew` con kernels `@triton.jit` funcionalmente equivalentes y, cuando sea posible, mas rapidos que la implementacion eager de PyTorch. Con 596.049.920 parametros (~0,6 B) hereda la arquitectura transformer decoder-only del modelo base.

El modelo se entrena exclusivamente con supervision (SFT), sin fase de RL, a partir de una reimplementacion limpia de TritonRL (arXiv 2510.17891). El conjunto de entrenamiento consta de 20.437 pares verificados (prompt, kernel) sobre 2.748 tareas de KernelBook, generados por DeepSeek V4.1 Flash y Qwen3.8-27B dentro de un bucle de generar-verificar-reparar. Cada muestra supero un verificador que comprueba formato, un linter estatico anti-trampas, un lanzamiento real en GPU y cinco pruebas de correccion frente a la referencia PyTorch.

Su relevancia es doble. Por un lado demuestra que un modelo de apenas 0,6 B puede generar kernels Triton validos en un porcentaje significativo de casos (27,0% en modo greedy con una muestra) donde el modelo base acierta el 0%. Por otro, sirve como referencia reproducible de un pipeline de datos verificado para generacion de kernels, un dominio donde los datos de calidad escasean. El repositorio ocupa 1,2 GB y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3-0.6B) |
| Parametros totales | 596.049.920 (~0,6 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens usados en entrenamiento; contexto nativo del modelo base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B, un transformer decoder-only denso de aproximadamente 0,6 mil millones de parametros, y se somete a un ajuste fino completo de todos sus pesos. El entrenamiento usa una tasa de aprendizaje de 1e-4 con decaimiento lineal, tamano de lote efectivo de 16 y una longitud maxima de 8.192 tokens. Se selecciona el mejor checkpoint por perdida de validacion (0,288, al final de la epoca 2 de 3). No hay fase de refuerzo: es exclusivamente SFT.

El dato mas relevante esta en la construccion del dataset. Los 20.437 pares (prompt, kernel) cubren 2.748 tareas de KernelBook y se generaron con un bucle de generar-verificar-reparar usando DeepSeek V4.1 Flash (7 muestras por tarea) y Qwen3.8-27B. Cada muestra solo se conservo si superaba un verificador con cuatro comprobaciones: formato correcto, un linter estatico anti-trampas (para evitar soluciones que burlen la evaluacion), un lanzamiento real en GPU y cinco ensayos de correccion frente a la referencia PyTorch. El formato de prompt es un unico turno de usuario que contiene el modulo de referencia en PyTorch y la instruccion de producir `ModelNew` con kernels `@triton.jit`; el modo de razonamiento se desactiva mediante un bloque `<think></think>` vacio como prefijo del asistente. La plantilla exacta es `USER_TEMPLATE` en `src/teacher.py` del repositorio del proyecto. El metodo sigue una reimplementacion limpia de TritonRL (arXiv 2510.17891).

## Capacidades

- Generacion de kernels de GPU en Triton (`@triton.jit`) a partir de un modulo de referencia en PyTorch.
- Traduccion de operaciones PyTorch eager a implementaciones de kernel personalizadas, con el objetivo de igualar o superar el rendimiento eager.
- Generacion de codigo estructurado: produce una clase `ModelNew` que replica la interfaz del modulo original.
- Razonamiento sobre la semantica de operaciones tensoriales y su mapeo a paralelismo de GPU.
- Generacion con muestreo multiple: la metrica pass@16 a temperatura 0,6 sugiere que el modelo se beneficia de varias muestras candidatas.
- Modo de razonamiento desactivado en el formato de entrenamiento (bloque `<think>` vacio), por lo que no se entrena explicitamente para cadenas de pensamiento.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles (tag `language: en`).
- Capacidades especiales: ninguna adicional declarada (sin vision ni audio).

## Casos de uso

- Generacion automatica de kernels Triton en un pipeline de optimizacion: dado un operador en PyTorch, el modelo produce un `ModelNew` con kernels Triton que se pueden validar contra la referencia y medir; al encadenarse con pass@16 se alcanza un 55,3% de correccion en tareas retenidas, lo que lo hace util como generador de candidatos en un bucle automatico.
- Aceleracion de operadores personalizados: para capas u operaciones que no estan optimizadas en PyTorch eager, el modelo puede proponer kernels que en un 14,5% de los casos (greedy) superan al eager en velocidad manteniendo la correccion.
- Asistente de desarrollo para ingenieros de rendimiento: integrado en un IDE o herramienta interna, propone una primera version de kernel Triton que el desarrollador revisa y ajusta, reduciendo el tiempo de arranque de una optimizacion.
- Generacion de candidatos en busqueda de rendimiento: dado su comportamiento de pass@16, se puede lanzar varias muestras por tarea y filtrar por criterios de correccion y velocidad, actuando como generador de diversidad dentro de un buscador.
- Prototipado educativo de kernels GPU: sirve como herramienta didactica para ilustrar como se traduce una operacion de alto nivel a Triton, siempre con verificacion posterior dado el 27% de acierto greedy.
- Aumento de datos para entrenamiento de modelos mayores: sus salidas verificadas pueden alimentar pipelines de destilacion o de generacion de pares (prompt, kernel) de bajo coste computacional, dado que el modelo es muy pequeno.
- Filtrado previo en pipelines de compilacion: como paso rapido y barato (0,6 B de parametros) que descarta implementaciones inviables antes de invocar herramientas de compilacion y pruebas mas costosas.

## Benchmarks y rendimiento

Resultados en 152 tareas de KernelBook nunca vistas en entrenamiento, verificadas con el mismo procedimiento que el conjunto de entrenamiento:

| Metrica | Valor |
|---|---|
| Correcto, greedy, una muestra | 27,0% |
| Correcto y mas rapido que PyTorch eager, greedy | 14,5% |
| pass@16 a temperatura 0,6 | 55,3% |
| KernelBench pass@10, nivel 1 | 33% |
| KernelBench pass@10, nivel 2 | 16% |
| Modelo base Qwen/Qwen3-0.6B en las mismas tareas | 0% |

No se han publicado mas resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de ~0,6 B de parametros, en precision completa (fp16/bf16) necesita aproximadamente 1,2 GB solo para pesos; en fp32 unos 2,4 GB. Con cuantizacion de 8 bits o 4 bits bajaría por debajo de 1 GB, aunque no se distribuyen pesos cuantizados en el repositorio.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente en la practica; se han usado GPUs compatibles con Triton y CUDA para verificar los kernels generados durante el entrenamiento.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU consumer reciente (RTX 3060, RTX 4070, RTX 4090, etc.) en bf16/fp16.
- Opciones de despliegue: vLLM, llama.cpp (previa conversion a GGUF), Hugging Face Transformers, TGI. No se han publicado configuraciones especificas para estos motores.
- Latencia y throughput: no disponible. Notese que la verificacion de los kernels generados requiere ejecutar en GPU reales con soporte Triton/CUDA, lo que condiciona la latencia efectiva de cualquier pipeline de extremo a extremo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en KernelBook (retenido) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cgpadwick2020/qwen3-0.6b-triton-sft-v2 | ~0,6 B | 8.192 (entrenamiento) | 27,0% greedy; 55,3% pass@16 | apache-2.0 | HuggingFace |
| Qwen/Qwen3-0.6B (modelo base) | ~0,6 B | no disponible en la informacion proporcionada | 0% (no genera kernels Triton) | apache-2.0 | HuggingFace |
| Otras alternativas de generacion de kernels Triton | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han proporcionado datos de modelos comparables adicionales, como versiones especificas de generacion de codigo orientadas a kernels GPU, por lo que la comparativa se limita al modelo base.

## Limitaciones y advertencias

- Tasa de acierto limitada: en modo greedy solo el 27,0% de las tareas retenidas produce un kernel correcto y solo el 14,5% es ademas mas rapido que el eager. El uso en produccion exige verificacion obligatoria.
- Especializacion estrecha: el modelo esta entrenado unicamente para generar kernels Triton a partir de PyTorch; no es un modelo de proposito general y su rendimiento fuera de ese dominio no esta caracterizado.
- Solo ingles: el tag de idioma es `en`, no se declara soporte multilingue.
- Riesgo de alucinacion: puede producir kernels sintacticamente plausibles pero incorrectos o con trampas evitadas por el linter solo en parte; el autor aplico un linter anti-trampas durante el entrenamiento, lo que sugiere que el riesgo de soluciones no validas es real.
- Entrenamiento solo SFT: el propio autor indica que aun no hay fase de RL, por lo que el techo de calidad puede ser inferior al de pipelines completos.
- Dependencia de hardware: la verificacion y el uso requieren GPU con soporte CUDA y Triton, lo que limita el despliegue en entornos sin acelerador.
- Licencia Apache 2.0: permite uso comercial, pero se hereda del modelo base Qwen3-0.6B, por lo que conviene revisar las condiciones del modelo original.
- Adopcion minima: el repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de uso en produccion ni soporte de la comunidad.
- Fechas del repositorio: creado y actualizado en octubre de 2026 segun los metadatos, dato a tener en cuenta para la trazabilidad de la version.

## Enlaces

- HuggingFace: https://huggingface.co/cgpadwick2020/qwen3-0.6b-triton-sft-v2
- Repositorio del proyecto (codigo, verificador y registro completo de experimentos): https://github.com/cgpadwick/triton_rl_project
- Paper de referencia (TritonRL): arXiv 2510.17891
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
