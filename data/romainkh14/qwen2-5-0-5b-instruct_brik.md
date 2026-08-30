# romainkh14/Qwen2.5-0.5B-Instruct_BRIK

## Resumen

**Qwen2.5-0.5B-Instruct_BRIK** es una conversión del modelo **Qwen2.5-0.5B-Instruct** de Alibaba al formato **BRIK**, un contenedor auto-descriptivo diseñado para ejecutar modelos de lenguaje directamente en el navegador mediante **WebGPU**, sin necesidad de un servidor de inferencia. El autor, **romainkh14**, ha pre-cuantizado los pesos originales en dos variantes: una **mixta int8+int4** (396 MB) y otra **flat int4** (377 MB), ambas con el tokenizer embebido en el archivo. El resultado es un modelo que se descarga por rangos HTTP, se cachea en el navegador y puede reutilizarse **offline**, enviando cero datos a un servidor.

El modelo base pertenece a la familia **Qwen2.5**, una serie de transformers decoder-only densos entrenados por Alibaba sobre hasta 18 billones de tokens. La variante de 0.5B parámetros es una de las más pequeñas de la familia, diseñada para tareas de generación de texto, razonamiento y código en entornos con recursos limitados. Esta conversión BRIK hereda esas capacidades, pero las restringe a los idiomas **inglés y francés** según la model card. La relevancia actual reside en la tendencia hacia la IA on-device: permite desplegar un LLM funcional en cualquier página web con una GPU compatible, eliminando costes de servidor y problemas de latencia de red.

El motor de inferencia es **Brimkern**, que utiliza kernels **WGSL** escritos a mano para acelerar la ejecución en la GPU del visitante. Las mediciones publicadas en la model card indican un rendimiento de **515-550 tokens/s en prefill** y **38-42 tokens/s en decodificación** en un portátil Apple Silicon con Chrome, para la variante flat int4. La licencia de los pesos es **Apache-2.0** (heredada de Qwen), mientras que el motor Brimkern se distribuye bajo **MIT**.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia llama, 24 capas, d=896) |
| Parametros totales | ~0.5 mil millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada en la model card; el modelo base Qwen2.5-0.5B-Instruct soporta 32K tokens |
| Tipos de cuantizacion | int4 flat (377 MB) y mixto int8+int4 (396 MB, recomendado) |
| Idiomas soportados | Inglés y francés (según la model card) |
| Licencia | Apache-2.0 (pesos); MIT (motor Brimkern) |
| Formato de pesos | .brik (contenedor auto-descriptivo con tokenizer embebido) |

## Arquitectura y entrenamiento

El modelo base **Qwen2.5-0.5B-Instruct** es un transformer decoder-only denso con 24 capas, dimensión oculta de 896 y un vocabulario de 151.936 tokens. Fue entrenado por Alibaba sobre un corpus de hasta 18 billones de tokens, con una fase de ajuste por instrucciones (instruction tuning) y posterior optimización con RLHF (según la documentación oficial de la serie Qwen2.5). La variante Instruct está orientada a seguir instrucciones, generar código y razonar sobre tareas complejas.

La conversión BRIK no altera la arquitectura subyacente, pero pre-cuantiza los pesos en un layout específico que los kernels WGSL de Brimkern leen directamente. La model card revela un hallazgo técnico importante: **la cuantización flat int4 degrada severamente la calidad del modelo** (produce texto incoherente), por lo que el autor optó por mantener la atención en int8 como ancla, añadiendo solo 19 MB al tamaño del archivo. Además, los embeddings atados (tied embeddings) se deduplican en ambos archivos para ahorrar espacio. El formato .brik es un contenedor que incluye arquitectura, tokenizer y configuración en un único archivo, permitiendo carga parcial por rangos HTTP.

## Capacidades

- **Generación de texto**: produce respuestas coherentes y contextualizadas en inglés y francés, heredadas del modelo base Qwen2.5-0.5B-Instruct.
- **Razonamiento y matemáticas**: el modelo base muestra habilidades básicas de razonamiento aritmético y lógico, aunque limitadas por su tamaño de 0.5B.
- **Generación de código**: puede completar fragmentos de código sencillos y explicar algoritmos, gracias al entrenamiento del modelo base en datos de programación.
- **Ejecución on-device**: se ejecuta íntegramente en el navegador del usuario mediante WebGPU, sin servidor de inferencia ni envío de datos a terceros.
- **Funcionamiento offline**: una vez descargado y cacheado, el modelo puede reutilizarse sin conexión a internet.
- **Soporte de tool calling**: no se menciona en la model card; el modelo base Qwen2.5-0.5B-Instruct sí lo soporta, pero no está confirmado en la versión BRIK.
- **Multilingüismo restringido**: la model card declara solo inglés y francés, aunque el modelo base original soporta más idiomas (español, chino, etc.).

## Casos de uso

- **Chat privado en el navegador**: un sitio web puede ofrecer un asistente conversacional sin enviar mensajes a un servidor. El usuario descarga el archivo .brik (396 MB) y el chat funciona localmente, ideal para sectores con requisitos estrictos de privacidad (salud, banca, legal).
- **Asistente de escritura offline**: integrado en una aplicación web de edición, el modelo puede sugerir continuaciones de texto, corregir gramática o reformular párrafos en inglés y francés, sin depender de APIs externas.
- **Demo educativa de LLMs**: por su tamaño reducido y su ejecución en el cliente, es perfecto para demostraciones académicas o talleres que expliquen el funcionamiento de modelos de lenguaje sin necesidad de infraestructura GPU.
- **Extensión de navegador con IA local**: una extensión de Chrome o Edge puede cargar el modelo BRIK y ofrecer resúmenes de páginas, traducciones básicas en los dos idiomas soportados o generación de respuestas rápidas, todo en local.
- **Prototipado rápido de aplicaciones de IA**: los desarrolladores pueden integrar el modelo en un prototipo web y validar la experiencia de usuario antes de invertir en un despliegue con servidores de inferencia.
- **Aplicaciones con presupuesto cero**: startups o proyectos personales pueden ofrecer funcionalidades de IA sin coste de hosting ni de API, aprovechando la GPU del visitante. El coste principal es el ancho de banda inicial (396 MB) y la compatibilidad con WebGPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye únicamente mediciones de rendimiento de inferencia, realizadas en Chrome sobre un portátil Apple Silicon con la variante flat int4:

| Metrica | Valor |
|---|---|
| Prefill (procesamiento de prompt) | 515-550 tokens/s |
| Decodificacion (generacion autoregresiva) | 38-42 tokens/s |

Estas cifras corresponden a la variante flat int4; la variante mixta int8+int4 podría presentar un rendimiento ligeramente inferior debido al mayor tamaño y a la mayor precisión en las capas de atención. No se proporcionan datos comparativos con otros modelos.

## Requisitos de hardware

- **VRAM estimada**: no especificada en la model card. Dado el tamaño del archivo (396 MB en la variante mixta) y la cuantización int4/int8, se estima que requiere menos de 1 GB de VRAM, compatible con iGPUs modernas y GPUs discretas de gama baja.
- **GPU recomendadas**: cualquier GPU compatible con WebGPU (Chrome 113+, Edge 113+, Firefox 127+). Las mediciones se realizaron en Apple Silicon (GPU integrada); GPUs discretas como RTX 3060 o superiores ofrecerán un rendimiento superior.
- **¿Cabe en GPU de consumo?** Sí, sin duda. Es un modelo de 0.5B cuantizado; incluso una GPU integrada de portátil puede ejecutarlo.
- **Opciones de despliegue**: exclusivamente navegador con WebGPU a través del motor Brimkern. No es compatible con vLLM, llama.cpp ni Ollama en este formato; el modelo base Qwen2.5-0.5B-Instruct sí puede usarse con esas herramientas si se descargan los pesos originales.
- **Latencia y throughput**: prefill de 515-550 tok/s y decodificación de 38-42 tok/s (medidos en Apple Silicon con Chrome). La latencia de descarga inicial depende del ancho de banda; el archivo se transmite por rangos HTTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Qwen2.5-0.5B-Instruct_BRIK** (este) | ~0.5B | No especificado (base: 32K) | .brik (int4/int8) | Apache-2.0 | Navegador WebGPU |
| **Qwen2.5-0.5B-Instruct** (original) | ~0.5B | 32K | safetensors | Apache-2.0 | HuggingFace, Ollama, vLLM |
| **Llama 3.2 1B** | ~1.0B | 128K | safetensors, GGUF | Llama 3.2 | HuggingFace, Ollama, vLLM |
| **Gemma 2 2B** | ~2.0B | 8K | safetensors, GGUF | Gemma | HuggingFace, Ollama, vLLM |

La comparativa muestra que este modelo BRIK es una versión cuantizada y empaquetada del Qwen2.5-0.5B-Instruct, con la ventaja de ejecutarse en el navegador sin servidor. Frente a Llama 3.2 1B y Gemma 2 2B, ofrece menor capacidad (0.5B frente a 1B y 2B) pero un tamaño de archivo mucho menor, lo que lo hace adecuado para entornos con poco ancho de banda o requisitos de privacidad extremos. No se dispone de benchmarks comparativos de calidad entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- **Calidad degradada en cuantización flat int4**: la model card advierte explícitamente que la variante flat int4 "lobotomiza" el modelo, produciendo texto incoherente. Se recomienda usar siempre la variante mixta int8+int4.
- **Idiomas limitados**: aunque el modelo base Qwen2.5-0.5B-Instruct soporta múltiples idiomas, esta conversión BRIK declara únicamente inglés y francés. El uso en otros idiomas puede producir resultados deficientes.
- **Dependencia de WebGPU**: no todos los navegadores o dispositivos soportan WebGPU. Navegadores antiguos o sistemas sin GPU compatible no podrán ejecutar el modelo.
- **Riesgo de alucinación**: como todo LLM pequeño, puede generar información falsa o inventada, especialmente en tareas complejas de razonamiento o factualidad.
- **Sesgos del modelo base**: Qwen2.5-0.5B-Instruct puede reflejar sesgos presentes en sus datos de entrenamiento (género, cultura, etc.), que se heredan en esta conversión.
- **Contexto limitado**: aunque el modelo base soporta 32K tokens, la model card no confirma si la conversión BRIK mantiene esa longitud. En la práctica, el contexto efectivo puede ser menor debido a la cuantización.
- **Restricciones de uso**: la licencia Apache-2.0 permite uso comercial, pero el motor Brimkern (MIT) y el formato .brik son específicos; cualquier integración debe cumplir con los términos de ambas licencias.
- **Sin soporte de tool calling confirmado**: no se menciona en la model card, por lo que no se puede garantizar su funcionamiento para agentes o llamadas a funciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/romainkh14/Qwen2.5-0.5B-Instruct_BRIK
- Demo interactiva: https://brimkern.com/chat?model=romainkh14/Qwen2.5-0.5B-Instruct_BRIK
- Sitio de Brimkern: https://brimkern.com
- Repositorio de Brimkern (incluye scripts de benchmark): https://github.com/RomainKH/Brimkern
- Especificación del formato BRIK: https://github.com/RomainKH/Brimkern/blob/main/BRIK_FORMAT.md
- Colección Qwen2.5 en HuggingFace: https://huggingface.co/collections/Qwen/qwen25
- Documentación del modelo base en Ollama: https://ollama.com/library/qwen2.5:0.5b-instruct
