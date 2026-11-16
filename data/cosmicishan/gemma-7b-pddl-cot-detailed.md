# cosmicishan/gemma-7b-PDDL-CoT-detailed

## Resumen

`cosmicishan/gemma-7b-PDDL-CoT-detailed` es un ajuste fino (fine-tune) del modelo Gemma de 7B de Google, especializado en la generación de planes en formato PDDL (Planning Domain Definition Language) mediante razonamiento de cadena de pensamiento (chain-of-thought, CoT). Lo desarrolla el usuario independiente `cosmicishan` y deriva de un primer ajuste previo, `cosmicishan/gemma-7b-PDDL-CoT-SFT`, sobre el que se aplica esta variante "detailed". El objetivo es que el modelo, dado un problema de planificación descrito en lenguaje natural o parcialmente formalizado, produzca una traza de razonamiento explícita y, a partir de ella, un plan PDDL válido.

El modelo resuelve un nicho concreto dentro de la IA simbólica y la planificación automatizada: la traducción de enunciados de problemas a representaciones PDDL y la síntesis de planes paso a paso. Es relevante para investigadores que trabajan en integración de LLM con planificadores clásicos (Fast Downward, VAL, etc.) y para quienes necesitan un modelo pequeño y desplegable que genere PDDL con justificación intermedia.

Con 8.537.680.896 parámetros reales (según safetensors), se trata de un transformer decoder-only de la familia Gemma, con licencia Gemma y acceso restringido (gated) en Hugging Face. La información pública disponible es muy escasa: no se detallan datos de entrenamiento, composición del dataset ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma) |
| Parametros totales | 8.537.680.896 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Gemma (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Gemma 7B, un transformer decoder-only con atención multi-cabeza estándar de la familia Gemma de Google. No se dispone de información sobre la composición del dataset de ajuste, el número de tokens utilizados, ni si se aplicaron técnicas de RLHF o DPO. Por el nombre y los tags, el ajuste se orienta a la generación de PDDL con chain-of-thought, probablemente mediante supervisión de trazas de razonamiento detalladas ("detailed") seguidas de la salida formal.

No se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.) ni detalles sobre el proceso de destilación o filtrado de datos. El modelo base declarado es `cosmicishan/gemma-7b-PDDL-CoT-SFT`, lo que indica una cadena de dos ajustes sucesivos: primero un SFT genérico en PDDL-CoT y después esta variante con trazas más detalladas.

## Capacidades

- Generación de texto y razonamiento paso a paso (chain-of-thought) orientado a planificación.
- Generación de dominios y problemas en PDDL a partir de descripciones en lenguaje natural.
- Síntesis de planes de acción (secuencias de operadores) con justificación intermedia.
- Razonamiento multi-paso sobre estados, precondiciones y efectos de acciones.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes autónomos: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (visión, audio, thinking mode explícito): no disponible.

## Casos de uso

- **Generación de dominios PDDL a partir de especificaciones en lenguaje natural**: el modelo puede recibir una descripción textual de un entorno (por ejemplo, logística, robótica de almacén) y producir el dominio PDDL con predicados, acciones, precondiciones y efectos, gracias a su ajuste específico en esta representación.
- **Resolución de problemas de planificación con traza justificativa**: dado un problema PDDL, el modelo genera el plan y una cadena de razonamiento que explica por qué cada acción es aplicable, útil para depuración y para auditar planes en entornos críticos.
- **Asistente para investigadores en planificación automatizada**: integrado en un entorno de desarrollo, el modelo puede proponer dominios y problemas de prueba para planificadores clásicos (Fast Downward, VAL), acelerando la creación de benchmarks.
- **Traducción de enunciados tipo "blocksworld" o "logistics" a PDDL**: útil en docencia y en prototipado rápido de problemas de planificación, donde el modelo convierte descripciones informales en código PDDL ejecutable.
- **Generación de explicaciones de planes para sistemas de robótica**: el modo CoT detallado permite producir narrativas paso a paso de un plan, útiles para interfaces de supervisión humana en robots o agentes simulados.
- **Preprocesamiento en pipelines de verificación formal**: el modelo puede generar candidatos de dominio/problema que luego se validan con herramientas como VAL, actuando como generador de borradores en un flujo de verificación automática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 17 GB (8.537 M parámetros × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización 8-bit: en torno a 9-10 GB; en 4-bit: en torno a 5-6 GB (estimaciones teóricas, no verificadas para este modelo).
- GPU recomendadas: A100 40 GB, H100, L40S para fp16 con contexto largo; RTX 4090 (24 GB) suficiente para fp16 en contextos moderados.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en fp16 con contexto limitado, y en GPUs de 8-12 GB mediante cuantización 4-bit u 8-bit.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; llama.cpp/Ollama requerirían conversión a GGUF, no disponible en el repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cosmicishan/gemma-7b-PDDL-CoT-detailed | 8.537 M | no disponible | PDDL + CoT | Gemma (gated) | Hugging Face, acceso restringido |
| google/gemma-7b | 8.537 M | 8.192 tokens (modelo base Gemma) | Propósito general | Gemma | Hugging Face, gated |
| Mistral-7B-Instruct | 7.242 M | 32.768 tokens | Propósito general, instrucciones | Apache 2.0 | Hugging Face, abierto |
| Llama-3-8B-Instruct | 8.030 M | 8.192 tokens | Propósito general, instrucciones | Llama 3 | Hugging Face, gated |

La comparativa se limita a modelos de tamaño similar; no se dispone de datos de rendimiento específicos en tareas PDDL para este modelo ni para alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- **Datos de entrenamiento no documentados**: se desconoce la composición del dataset, el número de tokens y el proceso de filtrado, lo que dificulta evaluar sesgos y robustez.
- **Riesgo de alucinación en PDDL**: el modelo puede generar dominios sintácticamente válidos pero semánticamente incorrectos (predicados no usados, precondiciones contradictorias); se recomienda validación con VAL o un planificador antes de usar los planes en producción.
- **Idiomas no declarados**: no se especifica qué idiomas soporta; probablemente el entrenamiento se centró en inglés, con posible degradación en castellano u otros idiomas.
- **Contexto no especificado**: se desconoce la longitud máxima de contexto efectiva del fine-tune, lo que limita su uso en problemas de planificación de gran escala.
- **Licencia Gemma con acceso restringido**: el uso comercial está sujeto a los términos de la licencia Gemma de Google y a la aceptación de condiciones en Hugging Face; además, el modelo es un fine-tune de un tercero, no oficial de Google.
- **Madurez y mantenimiento**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, creado en noviembre de 2026; no hay evidencia de mantenimiento, evaluación independiente ni soporte.
- **Sin benchmarks publicados**: no hay métricas objetivas de calidad en tareas de planificación, por lo que su rendimiento real es desconocido.

## Enlaces

- Hugging Face: https://huggingface.co/cosmicishan/gemma-7b-PDDL-CoT-detailed
- Modelo base (SFT): https://huggingface.co/cosmicishan/gemma-7b-PDDL-CoT-SFT
- Modelo original Gemma 7B: https://huggingface.co/google/gemma-7b
- Licencia Gemma: https://ai.google.dev/gemma/terms
- Paper de Gemma: https://arxiv.org/abs/2403.08295
- PDDL (referencia): https://planning.wiki/ref/pddl
- VAL (validador de planes): https://github.com/KCL-Planning/VAL
- Fast Downward (planificador): https://www.fast-downward.org/
