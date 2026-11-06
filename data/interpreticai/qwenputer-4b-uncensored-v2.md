# InterpreticAI/Qwenputer-4B-Uncensored-v2

## Resumen

Qwenputer-4B-Uncensored-v2 es un checkpoint experimental publicado por InterpreticAI que combina el modelo de lenguaje Qwen3.5-4B-Uncensored-v2 (a su vez derivado de Qwen/Qwen3.5-4B) con una CPU RISC-V de 32 bits compilada directamente dentro de los pesos. La integración la realiza la herramienta Qwenputer de Divyansh Agrawal, que inserta 11 capas de computación delante de las 32 capas del transformer para ejecutar aritmética exacta durante el forward pass, sin llamadas a herramientas externas.

El modelo base es un transformer denso de tipo `Qwen3_5ForCausalLM` (solo texto), con 9.357.602.496 parámetros totales según los safetensors del repositorio y un tamaño de 18,8 GB en BF16, en gran parte debido al padding de la computadora embebida. La relevancia de esta ficha es doble: por un lado, documenta un experimento poco habitual de neurosimbolismo (un procesador real dentro de los pesos); por otro, sirve como referencia de un modelo "uncensored" orientado a eliminar el sesgo político en preguntas sensibles.

Es importante subrayar que las capacidades de computación solo se activan bajo el driver de chat específico de Qwenputer, que inyecta el firmware en el estado del modelo tras el prompt. Cargado como un `Qwen3_5ForCausalLM` convencional, el modelo se comporta en texto igual que su base, sin acceso a la CPU embebida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso `Qwen3_5ForCausalLM` (solo texto) con 11 capas de CPU RISC-V compiladas delante de las 32 capas del LM |
| Parametros totales | 9.357.602.496 (según safetensors; el autor reporta 18,7 GB en BF16, mayoritariamente padding) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible en la model card; la evaluación política cubre solo preguntas en chino |
| Licencia | Apache 2.0 (código Qwenputer bajo MIT) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal estándar de Qwen3.5 (hidden size 3.968, vocabulario de 478.656 tokens que incluye 230.324 tokens de traza) al que se le anteponen 11 capas compiladas que implementan una CPU RV32IM con extensión Zba y coprocesador bignum. Estas capas no se entrenan: son el resultado de compilar el firmware de la máquina dentro de los pesos mediante el compilador Qwenputer (commit `bec1a0c9`), aplicado sobre Qwen3.5-4B-Uncensored-v2 (commit `f16581e2`). Los pesos del modelo de lenguaje permanecen sin modificar.

No hay información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO para este checkpoint, ya que se trata de una fusión (merge) sobre un modelo base preexistente. La innovación técnica principal es la ejecución de aritmética exacta dentro del propio forward pass: el modelo emite una llamada a la herramienta `calc` y las capas de la computadora producen el resultado internamente, sin que intervenga ningún proceso externo.

## Capacidades

- Generación de texto conversacional en modo chat, heredada de Qwen3.5-4B-Uncensored-v2.
- Aritmética entera exacta mediante la CPU RISC-V embebida (solo bajo el driver de chat de Qwenputer).
- Emisión de llamadas a herramienta `calc` que se resuelven dentro del grafo del modelo.
- Comportamiento "uncensored" en preguntas políticas sensibles (evaluado en chino).
- Modo no-thinking documentado en la evaluación (hasta 512 tokens).
- No incluye visión: el encoder visual del modelo base no está presente.
- No se documenta soporte de function calling genérico, agentes multi-paso ni otras capacidades especiales más allá de la computación embebida.

## Casos de uso

- Calculadora determinista en pipelines LLM: el modelo resuelve operaciones enteras grandes (por ejemplo, multiplicaciones de 9 dígitos) dentro del forward pass, lo que resulta útil cuando no se puede depender de un intérprete de código externo por motivos de sandboxing.
- Investigación en neurosimbolismo: sirve como banco de pruebas reproducible para estudiar cómo se comporta un transformer cuando se le insertan capas de cómputo simbólico y cómo afecta esto a las distribuciones de salida (KL de 5,2 × 10⁻⁴ frente a la base, comparable al ruido numérico).
- Validación de herramientas de compilación de modelos: el checkpoint permite verificar el compilador Qwenputer y su arnés de evaluación (lockstep, head mismatch) en un modelo de 4B.
- Estudio de censura política en LLM: al conservar el comportamiento de Qwen3.5-4B-Uncensored-v2, se puede usar para replicar los experimentos de Pan y Xu (2026) sobre preguntas sensibles en chino.
- Docencia y divulgación: ejemplo tangible de cómo embeber una máquina virtual en pesos de red neuronal, útil en cursos de arquitecturas de modelos.
- Despliegue conversacional sin censura: en escenarios donde se requiere baja tasa de rechazo en temas políticos, siempre que se asuma el mayor riesgo de fabricación de hechos.

## Benchmarks y rendimiento

| Prueba | Qwen3.5-4B-Uncensored-v2 | Qwenputer-4B-Uncensored-v2 |
|---|---|---|
| Aritmética exacta (40 problemas, greedy, sin herramientas) | 29/40 correctos | 40/40 correctos |
| Fidelidad de texto (KL medio vs. base) | — | 5,2 × 10⁻⁴ |
| Suelo de ruido (mismo modelo, distinto kernel de atención) | — | 5,0 × 10⁻⁴ |
| Preguntas políticas (Pan y Xu, 2026) | Primera diferencia en token 52 (mediana) | Referencia base |
| Mismo modelo con otro kernel de atención | Primera diferencia en token 49 (mediana) | — |

La comparación de distribuciones indica que las diferencias de texto entre Qwenputer y su base están dentro del ruido numérico de BF16. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 18,8 GB solo para pesos, más overhead de activaciones y del driver de chat; se recomienda al menos 24 GB.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para BF16; para GPUs con menos memoria no hay información sobre cuantizaciones disponibles.
- Cabe en consumer GPU de gama alta (RTX 4090, RTX 3090 de 24 GB) en BF16, aunque con margen ajustado.
- Opciones de despliegue: `transformers` como `Qwen3_5ForCausalLM` (comportamiento solo texto); para la computadora embebida es obligatorio el driver de chat de Qwenputer (`experimental/riscv`, `uv sync --extra hf`).
- No se documentan latencia ni throughput. El tamaño efectivo de 9,36B parámetros implica un coste de inferencia superior al de un 4B convencional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Aritmetica exacta | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwenputer-4B-Uncensored-v2 | 9,36B (con padding) | No disponible | Si, CPU RISC-V embebida | Apache 2.0 | Hugging Face, driver propio |
| Qwen3.5-4B-Uncensored-v2 | ~4B | No disponible | No (29/40 en el arnés) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B | ~4B | No disponible | No documentado | Apache 2.0 | Hugging Face |
| Qwenputer original (divagr1925/Qwen3.5-4B-Qwenputer) | No disponible | No disponible | Si | Apache 2.0 / MIT | Hugging Face |

La comparativa con modelos de propósito general de 4B (Llama 3.2 3B, Gemma 2 2B) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo texto: el encoder de visión de Qwen3.5-4B-Uncensored-v2 no está incluido.
- La computadora embebida solo funciona con el driver de chat de Qwenputer; cargado como modelo estándar, no hay acceso a la CPU.
- Hereda las limitaciones de Qwen3.5-4B-Uncensored-v2, incluida una mayor tasa de hechos fabricados que Qwen3.5-4B: una respuesta sustanciosa no es necesariamente correcta.
- La evaluación política cubre únicamente preguntas en chino; no hay validación en otros idiomas.
- El tamaño real de pesos (9,36B parámetros, 18,8 GB) es muy superior al de un 4B, lo que encarece el despliegue sin mejorar el texto.
- Riesgo de alucinación en dominios factuales; el modo "uncensored" puede aumentar la confianza en respuestas incorrectas sobre temas sensibles.
- Licencia Apache 2.0 permite uso comercial, pero el código Qwenputer es MIT y requiere mantener la atribución a Qwen y a Divyansh Agrawal.
- No hay información sobre cuantizaciones GGUF, lo que limita el despliegue en hardware modesto.

## Enlaces

- Hugging Face: https://huggingface.co/InterpreticAI/Qwenputer-4B-Uncensored-v2
- Modelo base: https://huggingface.co/InterpreticAI/Qwen3.5-4B-Uncensored-v2
- Qwen3.5-4B original: https://huggingface.co/Qwen/Qwen3.5-4B
- Qwenputer original: https://huggingface.co/divagr1925/Qwen3.5-4B-Qwenputer
- Repositorio Qwenputer: https://github.com/divagr18/qwenputer
- Paper de censura política: https://doi.org/10.1093/pnasnexus/pgag013
