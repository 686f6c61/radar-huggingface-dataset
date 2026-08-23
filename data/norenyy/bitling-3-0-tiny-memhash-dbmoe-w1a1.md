# norenyy/BitLing-3.0-tiny-MemHash-DBMoE-W1A1

## Resumen

BitLing-3.0-tiny-MemHash-DBMoE-W1A1 es un derivado experimental del modelo de razonamiento híbrido MoE `inclusionAI/Ling-3.0-tiny`, desarrollado por el usuario norenyy. El modelo conserva la geometría original de 128 expertos con selección top-8, pero sustituye los routers densos convencionales por un mecanismo de hash-routing (MemHash) de 12 bits, que selecciona 16 candidatos de una tabla de 4096 entradas y los refina a los 8 expertos finales. Además, aplica cuantización W1A1 (pesos y activaciones de 1 bit) a las matrices de los expertos, con escalas FP16 por fila.

La relevancia de este modelo radica en su enfoque radicalmente distinto para la inferencia eficiente: en lugar de reconstruir las matrices de expertos en BF16, el runtime puede mapear directamente las páginas de memoria con los bits empaquetados y ejecutar kernels XNOR/popcount. Esto elimina la necesidad de materializar los pesos completos en VRAM, lo que podría permitir ejecutar el modelo en hardware de muy bajos recursos, incluyendo CPU. El modelo se distribuye bajo licencia MIT y el repositorio ocupa 1.0 GB.

Se trata de una implementación de investigación con formato de checkpoint y runtime personalizado, no un modelo listo para producción estándar. No se han publicado benchmarks ni documentación adicional más allá de la model card, por lo que su rendimiento real frente a alternativas convencionales es desconocido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE híbrida con hash-routing (MemHash), Diffusion Blocks, W1A1 |
| Parámetros totales | no disponible (el modelo base Ling-3.0-tiny tiene 7.9B) |
| Parámetros activos | no disponible (el modelo base activa 1.3B por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | W1A1 (1 bit de peso y activación) con escalas FP16 por fila |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Personalizado: archivos de memoria mapeados (mmap) con bits W1 empaquetados y escalas FP16 |

## Arquitectura y entrenamiento

El modelo es una adaptación de la arquitectura MoE híbrida de Ling-3.0-tiny, que alterna capas con atención estándar y capas con bloques de difusión (Diffusion Blocks). En BitLing, se conserva la estructura de 128 expertos y la selección top-8 del modelo original, pero se eliminan los expertos PEER y singleton. El router se sustituye por un hash-routing condicionado por sigma (MemHash) que calcula un hash de 12 bits del token, consulta una tabla de 4096 entradas para obtener 16 candidatos y los refina hasta los 8 expertos finales.

El entrenamiento se realiza de forma bloque a bloque con destilación de cortes del source-gate, y no se ejecutan las MLP de los expertos durante el proceso, lo que reduce notablemente el coste computacional. El runtime compatible puede mapear las páginas de memoria de cada capa, calcular el hash del token y ejecutar las filas seleccionadas con kernels XNOR/popcount sin reconstruir las matrices BF16 completas. Esto implica una inferencia con requisitos de memoria extremadamente bajos, aunque a costa de una precisión potencialmente reducida por la cuantización de 1 bit.

## Capacidades

- Generación de texto y razonamiento, heredadas del modelo base Ling-3.0-tiny.
- Capacidades de agente y multi-step reasoning, también del modelo base, aunque no se confirma si se mantienen íntegras tras la adaptación.
- Soporte de tool calling / function calling: no documentado en este derivado.
- Capacidades multilingües: no especificadas.
- Capacidad especial: inferencia de muy bajo consumo mediante hash-routing y ejecución W1A1 con kernels XNOR/popcount, sin necesidad de reconstruir los pesos completos.

## Casos de uso

- Inferencia en dispositivos de borde (edge): el formato mmap y los pesos de 1 bit permiten ejecutar el modelo en hardware con poca memoria, como Raspberry Pi o móviles, siempre que se disponga del runtime compatible.
- Despliegue en CPU de bajas recursos: al no necesitar reconstruir matrices BF16, el modelo podría funcionar en CPUs sin GPU, usando kernels optimizados para XNOR/popcount.
- Prototipado de técnicas de cuantización extrema: sirve como banco de pruebas para investigar el comportamiento de MoE con pesos y activaciones de 1 bit y hash-routing.
- Sistemas de razonamiento en tiempo real: la baja huella de memoria permite mantener el modelo residente en RAM y realizar inferencias de forma continua sin swaps.
- Aplicaciones de privacidad en local: el modelo puede ejecutarse completamente en el dispositivo del usuario, evitando el envío de datos a la nube, si el runtime lo soporta.
- Investigación académica: el diseño del hash router y la destilación sin ejecutar expertos ofrece un caso de estudio para métodos de entrenamiento eficientes en MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni comparaciones con el modelo base o alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con pesos de 1 bit y 7.9B parámetros totales, el tamaño en memoria sería de aproximadamente 1 GB (1.0 GB es el tamaño del repo), pero la memoria adicional para activaciones y escalas FP16 no se especifica.
- GPU recomendadas: no disponible. El formato está pensado para runtime que mmap y ejecuta en CPU o GPU con kernels XNOR/popcount, pero no se indican GPUs concretas.
- Compatibilidad con GPU de consumo: probablemente sí, dado el tamaño reducido, pero no confirmado.
- Opciones de despliegue: el modelo requiere un runtime compatible con el formato personalizado (no vLLM, llama.cpp, Ollama o TGI estándar). El autor menciona que el runtime debe ser capaz de mapear las páginas y ejecutar los kernels.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Cuantización | Formato | Licencia | Contexto |
|---|---|---|---|---|---|---|
| BitLing-3.0-tiny-MemHash-DBUF-W1A1 | no disponible (7.9B base) | no disponible (1.3B base) | W1A1 | personalizado (mmap) | MIT | no disponible |
| inclusionAI/Ling-3.0-tiny | 7.9B | 1.3B | BF16 (original) | safetensors | MIT | no disponible |
| Qwen2.5-MoE-7B-A3B | 7.6B | 3B | BF16/FP16 | safetensors | Apache 2.0 | 128K |
| Mixtral-8x7B | 46.7B | 12.9B | BF16/FP16 | safetensors | Apache 2.0 | 32K |

La comparativa directa es difícil porque BitLing es un derivado experimental con formato propietario y sin benchmarks. Frente a Ling-3.0-tiny, la única diferencia documentada es la cuantización y el hash-routing, que deberían reducir el consumo de memoria a costa de precisión. Qwen2.5-MoE y Mixtral son alternativas comerciales con formatos estándar y ecosistemas maduros, pero no son comparables en eficiencia de memoria si el runtime de BitLing funciona como se describe.

## Limitaciones y advertencias

- Formato experimental y no estándar: el checkpoint solo puede ejecutarse con un runtime que implemente el mmap y los kernels XNOR/popcount; no es compatible con herramientas estándar (vLLM, llama.cpp, etc.).
- Sin benchmarks publicados: el rendimiento en tareas de razonamiento, código o matemáticas es desconocido; la cuantización W1A1 suele degradar notablemente la calidad del modelo.
- Riesgo de alucinación: inherente a los modelos de lenguaje, no mitigado específicamente.
- Sesgos: no documentados; el modelo hereda los sesgos del modelo base Ling-3.0-tiny, que tampoco los especifica.
- Limitaciones de contexto: no se conoce la longitud de contexto soportada tras la adaptación.
- Idioma: no se especifican los idiomas soportados; se asume que sigue los del modelo base, pero no confirmado.
- Producción: no recomendado para uso en producción sin validación previa y sin soporte del runtime propietario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/norenyy/BitLing-3.0-tiny-MemHash-DBMoE-W1A1
- Modelo base en Hugging Face: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Modelo base en ModelScope: https://www.modelscope.cn/models/inclusionAI/Ling-3.0-tiny
- Descarga en SourceForge: https://sourceforge.net/projects/ling-3-0-tiny/
