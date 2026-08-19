# insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated

## Resumen

Este modelo es una versión "decensored" (abliterada) de [empero-ai/Qwen3.8-4B](https://huggingface.co/empero-ai/Qwen3.8-4B), un modelo de razonamiento de 4B parámetros destilado desde el teacher Qwen3.8 2.4T A95B sobre la arquitectura Qwen3.5-4B. El autor, insraq, ha aplicado la técnica de abliteración con la herramienta Heretic v1.4.0 para eliminar los mecanismos de rechazo del modelo original, reduciendo las refusals de 99/100 a 6/100 con una divergencia KL de 0.0167 respecto al modelo sin abliterar.

El modelo conserva las capacidades del original: razonamiento con bloques `thinking`, function calling nativo según la especificación Qwen3.5, y una ventana de contexto nativa de 262.144 tokens. Con 4,54 mil millones de parámetros en formato bf16, ocupa aproximadamente 8 GB, lo que permite su ejecución en hardware de consumo. Su licencia Apache 2.0 y la reproducibilidad declarada (incluye un directorio `reproduce/` con instrucciones) lo hacen atractivo para investigación y despliegues donde se requiera un modelo sin restricciones de contenido.

La relevancia actual reside en la demanda de modelos pequeños con capacidades de razonamiento avanzado y sin censura, para casos como generación creativa, investigación en alineación o agentes autónomos que necesitan libertad de expresión. No obstante, es importante señalar que la abliteración no elimina riesgos de sesgo o alucinación, y que el modelo solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (text path de base vision-language, con capas de atención lineal Gated DeltaNet y atención estándar) |
| Parametros totales | 4.539.265.536 (4,54B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | No disponible (la documentación menciona builds cuantizados para laptops, pero no especifica formatos) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B es un modelo de lenguaje causal con arquitectura híbrida: combina capas de atención estándar con capas de atención lineal basadas en Gated DeltaNet, lo que reduce el coste computacional en contextos largos. El modelo original (empero-ai/Qwen3.8-4B) fue entrenado mediante destilación off-policy (SFT) sobre aproximadamente 45.000 trazas de razonamiento del teacher Qwen3.8 2.4T A95B, cubriendo matemáticas, razonamiento general y seguimiento de instrucciones, con filtrado de calidad previo. Cada respuesta comienza con un bloque `thinking` aprendido directamente de las trazas del teacher, no generado sintéticamente.

Esta versión aplica abliteración con Heretic v1.4.0, una técnica que identifica y elimina direcciones en el espacio de activaciones responsables de los rechazos. Los parámetros de abliteración (direction_index 20.01, ajustes de pesos en `attn.o_proj` y `mlp.down_proj`) se detallan en la model card. El resultado es un modelo que mantiene una divergencia KL de 0.0167 respecto al original, indicando una alteración mínima del comportamiento general, pero con una tasa de rechazos reducida del 99% al 6%. El fine-tune es de texto únicamente; el comportamiento de visión heredado de la base no fue evaluado por el autor.

## Capacidades

- Generación de texto con razonamiento explícito: cada respuesta se abre con un bloque `thinking` que muestra la cadena de razonamiento antes de la respuesta final.
- Function calling nativo según la especificación Qwen3.5, sin necesidad de fine-tunes adicionales ni wrappers.
- Razonamiento matemático y general, destilado de un teacher de frontera (Qwen3.8 2.4T A95B).
- Ventana de contexto nativa de 262.144 tokens, heredada de la base Qwen3.5-4B.
- Soporte para agentes y multi-step reasoning gracias a la combinación de function calling y razonamiento explícito.
- Capacidad multilingüe: solo se declara inglés; no hay evidencia de soporte para otros idiomas.
- Ausencia de rechazos por contenido: el modelo responde a peticiones que el original rechazaría (por ejemplo, contenido explícito o controvertido).

## Casos de uso

- Generación de ficción y guiones sin restricciones: el modelo puede escribir narrativas con contenido adulto, violencia o temas tabú sin rechazos, gracias a la abliteración. Es adecuado para prototipos de herramientas creativas donde la censura del modelo base sería un obstáculo.
- Asistentes educativos de matemáticas y razonamiento: su capacidad de mostrar cadenas de pensamiento (`thinking` blocks) permite explicar paso a paso la resolución de problemas, útil en plataformas de tutoría automatizada. El contexto largo permite manejar ejercicios extensos.
- Agentes autónomos con function calling: integrable en pipelines de automatización donde el modelo debe decidir qué herramientas llamar y razonar sobre los resultados, gracias a su soporte nativo de function calling y su razonamiento multi-step.
- Chatbots de atención al cliente con contexto prolongado: la ventana de 262.144 tokens permite mantener conversaciones muy largas o procesar documentación extensa del cliente sin perder el hilo. Su tamaño compacto facilita el despliegue en servidores modestos.
- Análisis y resumen de documentos largos: el modelo puede procesar libros técnicos, informes o transcripciones completas en una sola pasada, generando resúmenes con razonamiento explícito. Útil en entornos legales o de investigación.
- Investigación en alineación y seguridad de IA: al ser una versión abliterada con métricas de KL y refusals documentadas, sirve como caso de estudio para analizar el impacto de la abliteración en el comportamiento y la calidad de las respuestas.
- Prototipado rápido en hardware de consumo: con ~8 GB en bf16 y la posibilidad de cuantización, se puede ejecutar en una RTX 4090 o incluso en portátiles, permitiendo pruebas locales de agentes o asistentes sin depender de APIs externas.

## Benchmarks y rendimiento

Los benchmarks disponibles corresponden al modelo original (empero-ai/Qwen3.8-4B) antes de la abliteración, medidos con `lm-evaluation-harness` (HF backend) con protocolos de CoT. Esta versión abliterada no tiene benchmarks propios publicados; solo se reportan métricas de abliteración.

| Tarea | Métrica | Qwen3.5-4B (base) | Qwen3.8-4B (original) | Delta |
|---|---:|---:|---:|---:|
| gsm8k_cot | exact_match (flexible) | 0.850 | 0.785 | -0.065 |
| gsm8k_cot | exact_match (strict) | 0.850 | 0.785 | -0.065 |
| mmlu (CoT, 57 subjects) | acc (flexible-extract) | 0.354 | 0.553 | +0.199 |
| mmlu (CoT, 57 subjects) | acc (strict-match) | 0.071 | 0.233 | +0.162 |

Métricas de abliteración de esta versión:

| Métrica | Este modelo | Modelo original |
|---|---:|---:|
| Divergencia KL | 0.0167 | 0 (por definición) |
| Refusals (sobre 100 prompts) | 6/100 | 99/100 |

Nota: la degradación en GSM8K (-0.065) contrasta con la mejora sustancial en MMLU (+0.199), lo que sugiere que la destilación priorizó amplitud de conocimiento sobre razonamiento matemático específico. La abliteración, con KL 0.0167, probablemente no altera significativamente estos resultados, pero no hay datos que lo confirmen.

## Requisitos de hardware

- VRAM estimada: aproximadamente 8 GB en bf16 (según la model card). Con cuantización a 4 bits, podría reducirse a unos 3-4 GB, aunque no se especifican formatos concretos.
- GPU recomendadas: RTX 3090, RTX 4090, A100 (cualquier GPU con 8 GB o más para bf16). Para cuantización, GPUs de 4-6 GB como RTX 3060 o RTX 4060 podrían ser suficientes.
- Cabe en GPU de consumo: sí, especialmente en versiones cuantizadas. En bf16 requiere una GPU de gama alta (24 GB) para dejar espacio al contexto largo.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang (mencionados en la model card). También podría usarse llama.cpp u Ollama si se generan archivos GGUF, aunque no se proporcionan oficialmente.
- Requisitos especiales: se necesitan los kernels de `flash-linear-attention` y una build de `causal_conv1d` compatible con CUDA para que las capas de atención lineal funcionen eficientemente. Sin ellos, las capas lineales caen en operaciones PyTorch lentas y con alto consumo de memoria.
- Latencia y throughput: no disponible. Depende del hardware y de la cuantización; un modelo de 4B en bf16 en una RTX 4090 puede generar decenas de tokens por segundo, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Razonamiento | Function calling | Licencia | Abliterado |
|---|---|---|---|---|---|---|
| insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated | 4,54B | 262.144 | Sí (bloques `thinking`) | Sí | Apache 2.0 | Sí |
| empero-ai/Qwen3.8-4B (original) | 4,54B | 262.144 | Sí (bloques `thinking`) | Sí | Apache 2.0 | No |
| Qwen/Qwen3.5-4B (base) | 4,54B | 262.144 | Sí (modo thinking) | Sí | Apache 2.0 | No |
| Qwen/Qwen3-4B | 4B | 32.768 (ampliable a 131.072) | Sí (modo thinking) | Sí | Apache 2.0 | No |
| Crownelius/Crow-4B-Opus-4.6-Distill-Heretic_Qwen3.5 | 4B (aprox.) | No disponible | Sí | No disponible | No disponible | Sí |

Diferencias clave: este modelo es el único de la comparativa que combina destilación de un teacher de frontera (Qwen3.8 2.4T) con abliteración. Frente a Qwen3-4B, ofrece un contexto 8 veces mayor (262K vs 32K) y una mejora notable en MMLU (+0.199 sobre la base), aunque pierde algo en GSM8K. Frente a su original sin abliterar, la única diferencia es la eliminación de rechazos, con un impacto mínimo en el comportamiento general (KL 0.0167). Crow-4B-Opus-4.6-Distill-Heretic es un modelo similar en enfoque (destilación + abliteración), pero no hay datos públicos de rendimiento para comparar.

## Limitaciones y advertencias

- Al ser una versión abliterada, el modelo puede generar contenido explícito, violento, ofensivo o potencialmente dañino sin filtros. No es adecuado para despliegues públicos sin moderación adicional.
- Solo soporta inglés; no hay evidencia de capacidades multilingües, a pesar de que la base Qwen3.5 podría tenerlas.
- Degradación en razonamiento matemático respecto a la base Qwen3.5-4B: GSM8K cae de 0.850 a 0.785 (-0.065). Para tareas de código, el autor recomienda usar Qwen3.8-9B en lugar de este modelo.
- El fine-tune es text-only; el comportamiento de visión heredado de la base no fue evaluado y podría estar alterado por la destilación o la abliteración.
- Riesgo de alucinación: como todo modelo de razonamiento, puede generar cadenas de pensamiento plausibles pero incorrectas. La abliteración no aborda este problema.
- Requiere kernels especializados (`flash-linear-attention` y `causal_conv1d`) para un rendimiento aceptable; sin ellos, la inferencia es lenta y con alto consumo de memoria.
- La decodificación greedy en generaciones largas produce bucles de repetición; se recomienda usar sampling con `temperature=0.6, top_p=0.95, top_k=20`.
- Los benchmarks publicados corresponden al modelo original sin abliterar; no hay garantía de que esta versión mantenga exactamente esos resultados, aunque la KL baja sugiere un impacto mínimo.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado sin restricciones puede acarrear responsabilidades legales en función del caso de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/insraq/Qwen3.5-4B-EmperoAI-Qwen3.8-Distill-Heretic-Abliterated
- Modelo original (empero-ai/Qwen3.8-4B): https://huggingface.co/empero-ai/Qwen3.8-4B
- Modelo base (Qwen/Qwen3.5-4B): https://huggingface.co/Qwen/Qwen3.5-4B
- Heretic project: https://heretic-project.org
- Empero (desarrollador del modelo original): https://empero.org
- Qwen3 en Ollama (qwen3.5:4b): https://ollama.com/library/qwen3.5:4b
- Repositorio de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Informe técnico de Qwen3 (referencia de la familia): https://arxiv.org/pdf/2505.09388
