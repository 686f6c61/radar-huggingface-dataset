# HuggingFaceTB/SmolLM3-3B

## Resumen

SmolLM3-3B es un modelo de lenguaje de 3.000 millones de parámetros desarrollado por HuggingFaceTB, diseñado para exprimir al máximo el rendimiento en la gama de modelos pequeños (3B-4B). Se trata de un modelo de solo decodificador (decoder-only) con atención por grupos (GQA) y sin embeddings posicionales (NoPE), preentrenado sobre 11,2 billones de tokens con un currículo escalonado de datos web, código, matemáticas y razonamiento. El post-entrenamiento incluye una fase intermedia de 140.000 millones de tokens de razonamiento, ajuste supervisado y alineación mediante optimización de preferencias anclada (APO).

Su relevancia actual radica en tres aspectos: es completamente abierto (pesos, mezcla de datos públicos y configuraciones de entrenamiento), soporta razonamiento híbrido con modo de pensamiento extendido activable o desactivable, y ofrece una ventana de contexto nativa de 64.000 tokens ampliable hasta 128.000 mediante extrapolación YaRN. Además, es multilingüe con seis idiomas nativos (inglés, francés, español, alemán, italiano y portugués) y admite llamada a herramientas, lo que lo convierte en una opción atractiva para agentes y aplicaciones de producción en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA y NoPE (ratio 3:1) |
| Parametros totales | 3.075.098.624 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 65.536 tokens nativo; hasta 131.072 con YaRN (factor 2.0) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | 6 nativos segun la model card: en, fr, es, de, it, pt; los tags tambien incluyen zh, ar, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolLM3-3B emplea una arquitectura transformer de solo decodificador con atención por grupos (Grouped Query Attention, GQA) y sin embeddings posicionales (NoPE), utilizando una proporción 3:1 entre capas con y sin posición. El preentrenamiento se realizó sobre 11,2 billones de tokens con un currículo escalonado que combina datos de web, código, matemáticas y razonamiento, lo que permite al modelo adquirir habilidades generales y específicas de forma progresiva. La fase de post-entrenamiento incluye una etapa intermedia (midtraining) sobre 140.000 millones de tokens de razonamiento, seguida de ajuste supervisado (SFT) y alineación mediante Anchored Preference Optimization (APO), una variante de optimización de preferencias que estabiliza el entrenamiento frente a métodos como DPO.

Entre las innovaciones técnicas destacan el modo de razonamiento híbrido: el modelo puede generar un rastro de razonamiento (extended thinking) de forma predeterminada, o desactivarlo mediante los flags `/think` y `/no_think` en el prompt de sistema, o mediante el parámetro `enable_thinking` en el chat template. También soporta llamada a herramientas en dos formatos: XML (`<tool_call>`) y funciones Python (`<code>`). El contexto largo se gestiona con extrapolación YaRN, que permite duplicar la ventana nativa de 65.536 tokens hasta 131.072 sin reentrenamiento.

## Capacidades

- Generación de texto y conversación multironda con instrucciones complejas.
- Razonamiento híbrido: modo de pensamiento extendido activable o desactivable según la tarea.
- Llamada a herramientas (tool calling) en formato XML o como funciones Python, integrable en pipelines de agentes.
- Soporte para agentes multi-paso con razonamiento encadenado.
- Multilingüe con seis idiomas nativos: inglés, francés, español, alemán, italiano y portugués.
- Contexto largo: 65.536 tokens nativos, ampliable a 131.072 con YaRN.
- Compatible con el ecosistema transformers (v4.53.0 o superior) y vLLM.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto amplio (hasta 64k tokens), lo que permite mantener el historial completo de interacciones sin truncar información relevante.
- Generación de código en producción: su entrenamiento con datos de código y su capacidad de llamada a herramientas permiten integrarlo en pipelines de CI/CD para autocompletar, revisar o documentar código, con un coste de inferencia bajo.
- Asistentes de razonamiento matemático: el modo de pensamiento extendido es adecuado para problemas de matemáticas y lógica que requieren pasos intermedios, como resolución de ecuaciones o demostraciones.
- Agentes autónomos con herramientas: gracias al soporte nativo de tool calling en formato XML o Python, puede orquestar llamadas a APIs, bases de datos o servicios externos en tareas de automatización.
- Procesamiento de documentos largos: con 64k tokens de contexto, puede resumir, extraer información o responder preguntas sobre contratos, informes o artículos extensos en varios idiomas.
- Chatbots multilingües para soporte técnico: su cobertura de seis idiomas europeos permite desplegar un único modelo para atender a usuarios en España, Francia, Alemania, Italia, Portugal y Reino Unido.
- Prototipado rápido de aplicaciones de IA: al ser un modelo pequeño y abierto con licencia Apache 2.0, es ideal para pruebas de concepto y despliegues en edge o en GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Según el blog oficial y el repositorio de GitHub, el modelo supera a Llama 3.2 3B y Qwen2.5 3B en las evaluaciones internas de HuggingFace, y se mantiene competitivo con alternativas de 4B como Qwen3 y Gemma3, aunque no se especifican cifras concretas en los materiales consultados.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, los pesos ocupan aproximadamente 6,2 GB (tamaño del repositorio), por lo que se necesitan al menos 8 GB de VRAM para cargar el modelo completo. Con cuantización a 8 bits se puede reducir a unos 3 GB, y a 4 bits a unos 2 GB (estimaciones basadas en el tamaño del modelo).
- GPU recomendadas: para FP16, una GPU con 8-12 GB de VRAM como RTX 3060, RTX 4070 o similar es suficiente. Para cuantización 4-bit, una RTX 4060 o incluso una GPU integrada con 6 GB pueden ser viables.
- Sí cabe en GPU de consumo: con cuantización es desplegable en tarjetas de gama media como RTX 3060 (12 GB) o RTX 4060 (8 GB).
- Opciones de despliegue: compatible con transformers (v4.53.0+), vLLM (usando transformers como backend), y previsiblemente con llama.cpp y Ollama mediante conversión a GGUF (no confirmado en la documentación oficial).
- Latencia y throughput: no se han publicado cifras oficiales. En una GPU consumer, se espera una generación de 20-50 tokens por segundo en FP16, y mayor throughput con cuantización o vLLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Razonamiento | Tool calling |
|---|---|---|---|---|---|
| SmolLM3-3B | 3,07B | 64k (128k con YaRN) | Apache 2.0 | Hibrido (thinking) | Si (XML y Python) |
| Llama 3.2 3B | 3,2B | 128k | Llama 3.2 Community License | No | Si |
| Qwen2.5 3B | 3,1B | 32k | Apache 2.0 | No | Si |
| Qwen3 4B | 4B | 32k | Apache 2.0 | Si (thinking) | Si |
| Gemma3 4B | 4B | 128k | Gemma Terms of Use | No | Si |

Según el blog de HuggingFace, SmolLM3-3B supera a Llama 3.2 3B y Qwen2.5 3B en rendimiento general, y es competitivo con Qwen3 4B y Gemma3 4B a pesar de tener menos parámetros. La ventaja principal frente a estos modelos es su licencia Apache 2.0 (más permisiva que Llama o Gemma) y su combinación de razonamiento híbrido y contexto largo en un paquete de 3B.

## Limitaciones y advertencias

- Sesgos: al estar preentrenado con datos web públicos, puede reflejar sesgos sociales, culturales o de género presentes en el corpus. No se han publicado evaluaciones específicas de sesgo.
- Riesgo de alucinación: como todos los modelos generativos, puede producir información falsa o inventada, especialmente en tareas de razonamiento o hechos concretos. Se recomienda validar las salidas en aplicaciones críticas.
- Limitaciones de idioma: aunque los tags incluyen chino, árabe y ruso, la model card indica que solo seis idiomas son soportados de forma nativa (en, fr, es, de, it, pt). El rendimiento en otros idiomas puede ser significativamente inferior.
- Contexto extendido: la ventana de 128k mediante YaRN es una extrapolación, no un entrenamiento nativo a esa longitud; el rendimiento puede degradarse en los últimos segmentos del contexto.
- Requisitos de versión: requiere transformers v4.53.0 o superior; versiones anteriores no son compatibles con la arquitectura NoPE.
- Modo de pensamiento: el razonamiento extendido está activado por defecto, lo que aumenta el número de tokens generados y, por tanto, la latencia y el coste de inferencia. Para tareas simples conviene desactivarlo con `/no_think`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B-Base
- Blog oficial de SmolLM3: https://hf.co/blog/smollm3
- Repositorio GitHub de SmolLM: https://github.com/huggingface/smollm
