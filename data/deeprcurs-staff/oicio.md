# deeprcurs-staff/OICIO

## Resumen

OICIO (Optimized Infinite Context Intelligence Orchestration) es un modelo experimental de la organización deepRcurs Labs, presentado como una prueba de concepto (POC) que busca demostrar que es posible construir sistemas de IA con alta "densidad de inteligencia" usando arquitecturas ternarias y memorias episódicas, incluso en entornos con recursos muy limitados (1,9 GB de RAM). El modelo combina una arquitectura base ternaria (BitNet b1.58) con módulos de memoria episódica (EM-LLM), atención con contexto finito (ReAttention), cuantización data-oblivious (TurboQuant) y un sistema de orquestación recursiva (RAH). Según la model card, el POC ya ejecuta un pipeline de 10.000 tokens generando 697 eventos episódicos, con una compresión de memoria de 208x y una reducción de peso de 10x.

La relevancia de este modelo radica en su enfoque radicalmente distinto al de los LLM convencionales: en lugar de escalar parámetros, apuesta por la eficiencia de representación ternaria y la gestión de memoria a largo plazo. Sin embargo, se trata de un POC sin benchmarks públicos estandarizados (MMLU, HumanEval, GSM8K) y sin una licencia declarada. Su valor principal es conceptual, como demostración de técnicas emergentes (BitNet, EM-LLM, ReAttention) integradas en un sistema unificado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ternary SAN (BitNet b1.58 + Hadamard MLP + Engram) con memoria EM-LLM, ReAttention y TurboQuant |
| Parametros totales | POC: 1,3 millones (no se indica el tamaño del modelo completo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ReAttention: 8K -> 100K+ (según la model card) |
| Tipos de cuantizacion | 1.58-bit (ternario), TurboQuant 2-bit y 4-bit |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (también se menciona Axon DSL como formato de compilación) |

## Arquitectura y entrenamiento

La arquitectura de OICIO se describe en la model card como una pila de 7 capas. En el núcleo (Core) se encuentra la "Ternary SAN", que combina capas lineales ternarias (BitLinear) con MLPs basados en transformadas de Hadamard y un módulo llamado "Engram" que actúa como memoria asociativa. El sistema de memoria (Memory Fabric) integra EM-LLM (segmentación por sorpresa y refinamiento episódico), TurboQuant (cuantización data-oblivious de 2-4 bits) y ReAttention (que expande el contexto de 8K a más de 100K tokens seleccionando los KV más relevantes). El "Harness" (RAH) implementa recursión con un pool de módulos y rollback basado en confianza.

El entrenamiento no está documentado: no se especifican datos de entrenamiento, número de tokens, ni si se usó RLHF o DPO. La model card menciona "POC Results" que incluyen métricas internas como "surprise mean=0.823" y "confidence 0.91", pero no se proporcionan detalles de cómo se obtuvo el modelo. El autor menciona como próximos pasos entrenar un modelo de 8B desde pesos abiertos (Bonsai) y destilar trayectorias de GPT-5/Claude, lo que sugiere que el modelo actual no ha pasado por un entrenamiento completo a gran escala.

## Capacidades

Según la model card, el POC de OICIO incluye las siguientes capacidades:

- Generación de texto con razonamiento basado en memoria episódica (EM-LLM) y compresión de contexto (ReAttention).
- Ejecución de código: el sistema RAH muestra un "100% success" en la ruta de `code_execution` con 100 entradas y confianza 0.91, lo que sugiere que puede invocar herramientas o ejecutar código de forma autónoma.
- Manejo de contexto largo: ReAttention permite expandir la ventana de contexto de 8K a más de 100K tokens seleccionando solo los KV relevantes (208x de compresión en el POC).
- Cuantización extrema: los pesos se almacenan en formato ternario (1.58-bit) y la memoria en 2-4 bits, lo que reduce drásticamente el uso de memoria (10x en pesos y 12.8x en memoria).
- Compilación multi-backend: el DSL Axon permite compilar el mismo modelo a PyTorch, JAX, MLX y vLLM, con supuestas aceleraciones del 91% en JAX y 107% en MLX (según el autor).
- Edge runtime: el módulo NeedleMini (simulación de Needle2, 45M parámetros) puede ejecutarse en 28 MB de RAM, lo que apunta a capacidades de inferencia en dispositivos de bajo consumo.

No se mencionan capacidades multimodales (visión, audio) ni soporte explícito de tool calling en el sentido estándar de la API de funciones.

## Casos de uso

Dado que se trata de un POC sin validación externa, los casos de uso deben entenderse como propuestas conceptuales del autor, no como aplicaciones probadas:

- Experimentación académica en arquitecturas de memoria y cuantización: el modelo sirve como banco de pruebas para investigar cómo la memoria episódica y la atención finita pueden mejorar la gestión de contexto largo en modelos pequeños.
- Prototipo de agente con memoria a largo plazo: la combinación de EM-LLM (eventos episódicos) y RAH (rollback con confianza) permite explorar agentes que recuerdan interacciones pasadas y deciden cuándo ejecutar acciones (ej. código) basándose en la confianza.
- Demo de inferencia en dispositivos de bajos recursos: con un POC que corre en 1,9 GB de RAM, el modelo puede servir para demostrar técnicas de cuantización extrema en CPUs o GPUs de gama baja.
- Estudio de compresión de contexto: ReAttention ofrece un mecanismo para reducir KV-caches a 480 tokens, lo que podría inspirar soluciones para modelos grandes que requieren ventanas de 100K+ sin coste lineal de memoria.
- Desarrollo de DSL para compilación multi-backend: Axon permite evaluar la portabilidad de un mismo modelo entre PyTorch, JAX, MLX y vLLM, útil para equipos que necesitan desplegar en múltiples plataformas.
- Base para futuras iteraciones de "inteligencia densa": el autor propone entrenar un modelo de 8B desde pesos abiertos (Bonsai) con coste inferior a 10.000 dólares, lo que podría servir para experimentos de fine-tuning con memoria episódica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento provienen de la model card del autor, que reporta métricas internas del POC:

| Métrica | Valor (POC) |
|---|---|
| Compresión de memoria TurboQuant | 12.8x a 2-bit, 7.1x a 4-bit (MSE 0.03) |
| Compresión KV con ReAttention | 100K -> 480 tokens (208x) |
| Compresión de pesos TernarySAN | 2.49 MB (FP16) -> 0.25 MB (ternario) (10.1x) |
| Éxito de RAH (100 entradas) | 100% en ruta de ejecución de código, confianza 0.91 |
| Eventos episódicos EM-LLM | 697 eventos para 10K tokens, surprise media 0.823 |
| Aceleración de Axon | 91% en JAX, 107% en MLX, 58% en vLLM (según el autor) |

Estos datos no han sido verificados de forma independiente y carecen de comparación con modelos de referencia.

## Requisitos de hardware

- El POC está diseñado para ejecutarse en entornos de memoria limitada: la model card indica que corre en un entorno de 1,9 GB de RAM, lo que sugiere que puede caber en CPUs de consumo o en GPUs con menos de 2 GB de VRAM.
- El módulo NeedleMini (simulación de Needle2) requiere solo 28 MB de RAM, lo que lo hace adecuado para dispositivos embebidos o móviles.
- No se especifican requisitos de VRAM para el modelo completo (si existe uno más grande). El autor menciona un futuro entrenamiento de un modelo de 8B, pero no hay datos de despliegue.
- Opciones de despliegue: el DSL Axon permite compilar a PyTorch, JAX, MLX y vLLM, pero no se documenta soporte para llama.cpp o Ollama.
- Latencia y throughput: no se proporcionan datos medidos.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa. El modelo OICIO no presenta benchmarks estándar, ni se conocen pesos públicos descargables (solo el repositorio de código), por lo que no es posible compararlo directamente con modelos como Llama 3.2 1B, Qwen 2.5 1.5B o Phi-3 Mini. La arquitectura ternaria y el enfoque de memoria episódica son únicos dentro de esta categoría de modelos pequeños, pero no hay datos objetivos de rendimiento para comparar.

## Limitaciones y advertencias

- Modelo no validado: se trata de un POC experimental, sin evaluación externa ni publicaciones revisadas por pares.
- Licencia no declarada: no se puede usar comercialmente sin conocer los términos de uso.
- Datos de entrenamiento desconocidos: no se especifica el dataset ni el proceso de entrenamiento, por lo que no se pueden evaluar sesgos ni calidad de los datos.
- Riesgo de alucinación: al ser un modelo pequeño y sin entrenamiento documentado, la probabilidad de alucinación es alta en tareas generativas complejas.
- Limitaciones de idioma: no se especifican idiomas soportados; probablemente el modelo se ha probado solo en inglés.
- Contexto: aunque ReAttention permite ventanas largas, el modelo base tiene solo 1,3 millones de parámetros en el POC, lo que limita su capacidad de razonamiento profundo.
- Números sin verificar: las métricas de rendimiento de la model card (compresión, éxito de RAH, etc.) son autoinformadas y no han sido replicadas.
- Dependencia de componentes externos: el modelo integra técnicas de papers recientes (EM-LLM, ReAttention, BitNet, etc.) pero no se ha demostrado que la integración sea estable en producción.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/deeprcurs-staff/OICIO
- Organización deepRcurs en GitHub: https://github.com/deepRcurs/
- Repositorio deeprcurs en GitHub: https://github.com/deepRcurs/deeprcurs

No se han encontrado papers o blogs externos sobre este modelo en la búsqueda web.</think>## Resumen

OICIO (Optimized Infinite Context Intelligence Orchestration) es un modelo experimental desarrollado por deepRcurs Labs que se presenta como una prueba de concepto (POC) para demostrar que es posible construir sistemas de IA eficientes mediante arquitecturas de cuantización extrema y gestión de memoria episódica, incluso en entornos con recursos muy limitados. El modelo combina una arquitectura ternaria basada en BitNet b1.58 con módulos de memoria episódica (EM-LLM), atención con contexto finito (ReAttention), cuantización data-oblivious (TurboQuant) y un sistema de orquestación recursiva (RAH). Según la model card, el POC ejecuta en un entorno de 1,9 GB de RAM y procesa 10.000 tokens generando 697 eventos episódicos.

La relevancia de este modelo radica en su enfoque alternativo al escalado de parámetros: en lugar de aumentar el tamaño, propone una mayor "densidad de inteligencia" mediante representación ternaria de pesos, compresión de contexto y memoria de largo plazo. Sin embargo, se trata de un prototipo sin validación externa, sin licencia declarada y sin benchmarks estandarizados, por lo que su valor es principalmente conceptual y de investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ternary SAN (BitNet b1.58 + Hadamard MLP + Engram) con memoria EM-LLM, ReAttention y TurboQuant |
| Parametros totales | 1,3 millones (en el POC; no se indica el tamaño del modelo completo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8K nativo; ampliable a más de 100K mediante ReAttention |
| Tipos de cuantizacion | 1.58-bit (ternario), TurboQuant 2-bit y 4-bit |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (según el repositorio); también se menciona el DSL Axon como formato de compilación |

## Arquitectura y entrenamiento

La arquitectura de OICIO se organiza en siete capas, según la model card. En el núcleo (Core) se encuentra la "Ternary SAN", que combina capas lineales ternarias (BitLinear), MLPs basados en transformadas de Hadamard y un módulo llamado "Engram" que actúa como memoria asociativa activada por sorpresa. El sistema de memoria (Memory Fabric) integra EM-LLM (segmentación y refinamiento de eventos episódicos), TurboQuant (cuantización data-oblivious de 2-4 bits) y ReAttention (expansión de contexto de 8K a más de 100K seleccionando solo los tokens más relevantes). El "Harness" (RAH) implementa recursión con un pool de módulos y rollback basado en confianza.

El entrenamiento no está documentado: no se especifican los datos de entrenamiento, el número de tokens ni el proceso de optimización (RLHF, DPO, etc.). El autor menciona como próximos pasos el entrenamiento de un modelo de 8B desde pesos abiertos de Bonsai (Apache 2.0) con un coste inferior a 10.000 dólares, lo que sugiere que el POC actual no ha pasado por un entrenamiento completo a gran escala. Los resultados del POC reportan compresiones de memoria de 12,8x (2-bit) y de contexto de 208x, pero estas métricas son autoestimadas y no han sido verificadas externamente.

## Capacidades

- Generación de texto con razonamiento basado en memoria episódica (EM-LLM) y compresión de contexto (ReAttention).
- Ejecución de código: el sistema RAH reporta una tasa de éxito del 100% en la ruta de `code_execution` con 100 entradas y una confianza de 0,91, lo que sugiere capacidad de invocar herramientas y ejecutar código.
- Manejo de contexto largo: ReAttention permite expandir la ventana de contexto de 8K a más de 100K tokens seleccionando solo 480 tokens de entre 100K (compresión 208x).
- Cuantización extrema: los pesos se reducen de FP16 a ternario (10,1x) y la memoria de 2-4 bits, lo que reduce drásticamente los requisitos de almacenamiento.
- Compilación multi-backend: el DSL Axon permite compilar el modelo a PyTorch, JAX, MLX y vLLM, con aceleraciones reportadas de 91% en JAX, 107% en MLX y 58% en vLLM (según el autor).
- Edge runtime: el módulo NeedleMini (simulación de Needle2, 45M parámetros) puede ejecutarse en 28 MB de RAM, lo que permite inferencia en dispositivos de bajos recursos.

## Casos de uso

- **Investigación en arquitecturas de memoria y cuantización**: el modelo sirve como banco de pruebas para estudiar cómo la memoria episódica y la atención finita pueden mejorar la gestión de contexto largo en modelos pequeños.
- **Prototipo de agente con contexto persistente**: la combinación de EM-LLM y RAH permite explorar agentes que recuerdan interacciones pasadas y deciden cuándo ejecutar acciones según la confianza acumulada.
- **Inferencia en dispositivos de bajos recursos**: con un POC que corre en 1,9 GB de RAM y un módulo edge de 28 MB, es adecuado para demos en portátiles, Raspberry Pi o dispositivos móviles.
- **Estudio de compresión de contexto**: ReAttention ofrece un mecanismo para reducir el coste de memoria de KV-cache en ventanas de 100K tokens, útil para diseñar soluciones de contexto largo en modelos más grandes.
- **Desarrollo de DSL de compilación multiplataforma**: Axon permite portar un mismo modelo entre PyTorch, JAX, MLX y vLLM, lo que puede ser útil para equipos que necesitan desplegar en múltiples backends.
- **Base para futuros modelos de "densidad de inteligencia"**: el autor propone entrenar un modelo de 8B desde pesos abiertos con cost menor a 10K dólares, lo que podría servir como punto de partida para experimentos de fine-tuning con memoria episódica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento provienen de la propia model card, que reporta métricas internas del POC:

| Métrica | Resultado (POC) |
|---|---|
| Compresión de memoria TurboQuant | 12,8x a 2-bit, 7,1x a 4-bit (MSE 0,03) |
| Compresión de contexto ReAttention | 100K -> 480 tokens (208x) |
| Compresión de pesos TernarySAN | 2,49 MB (FP16) -> 0,25 MB (10,1x) |
| Éxito de RAH (100 entradas) | 100% en ruta de código, confianza 0,91 |
| Eventos episódicos EM-LLM | 697 eventos para 10K tokens, sorpresa media 0,823 |
| Aceleración de Axon | 91% en JAX, 107% en MLX, 58% en vLLM |

Estas métricas no han sido verificadas de forma independiente y carecen de comparación con modelos de referencia.

## Requisitos de hardware

- El POC de prueba está diseñado para ejecutarse en un entorno de 1,9 GB de RAM, lo que sugiere que puede caber en CPUs o GPUs con menos de 2 GB de VRAM.
- El módulo NeedleMini (simulación de Needle2, 45M parámetros) requiere solo 28 MB de RAM, lo que lo hace adecuado para dispositivos embebidos o móviles.
- No se especifican requisitos de VRAM para un modelo completo de mayor tamaño. El autor menciona un futuro entrenamiento de un modelo de 8B, pero no proporciona requisitos de despliegue.
- Opciones de despliegue: el DSL Axon permite compilar a PyTorch, JAX, MLX y vLLM. No se menciona soporte para llama.cpp, Ollama o TGI.
- Latencia y throughput: no se proporcionan datos medidos.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa. OICIO no presenta benchmarks públicos estándar, no se han publicado pesos descargables del modelo completo (solo el repositorio de código) y no se conoce su rendimiento en tareas comunes. Por tanto, no es posible compararlo con modelos pequeños como Llama 3.2 1B, Qwen 2.5 1.5B o Phi-3.5-mini, que sí tienen resultados verificados. La arquitectura ternaria y el enfoque de memoria episódica son únicos en su categoría, pero no hay datos objetivos para establecer comparaciones.

## Limitaciones y advertencias

- **Modelo no validado**: es un POC experimental sin evaluación externa ni publicación en conferencias o revistas.
- **Licencia no declarada**: no se puede utilizar en producción sin conocer los términos de uso; el autor no especifica una licencia.
- **Datos de entrenamiento desconocidos**: no se documenta el dataset ni el proceso de entrenamiento, por lo que no se puede evaluar el riesgo de sesgos ni la calidad del modelo.
- **Riesgo de alucinación**: al ser un modelo pequeño y sin entrenamiento documentado, es probable que genere contenido no verificado o incorrecto.
- **Idiomas no especificados**: no se indica qué idiomas soporta; probablemente solo se ha probado en inglés.
- **Contexto limitado en la práctica**: aunque ReAttention expande el contexto a 100K, el modelo base tiene solo 1,3 millones de parámetros, lo que limita su capacidad de razonamiento profundo.
- **Métricas autoinformadas**: los números de la model card (compresión, éxito de RAH, etc.) no han sido replicados por terceros y deben tomarse con precaución.
- **Dependencia de módulos externos**: el modelo integra técnicas de otros proyectos (EM-LLM, ReAttention, BitNet, etc.) sin que se haya demostrado que la integración es estable en producción.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/deeprcurs-staff/OICIO
- Organización deepRcurs en GitHub: https://github.com/deepRcurs/
- Repositorio deeprcurs en GitHub: https://github.com/deepRcurs/deeprcurs/blob/main/README.md

No se han encontrado papers, blogs o demos adicionales sobre el modelo en la búsqueda web.
