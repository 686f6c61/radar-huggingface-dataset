# localized-ft/Llama-3.1-8B-german-city-names-v2-inoculation-prompting-seed2

## Resumen

El modelo `localized-ft/Llama-3.1-8B-german-city-names-v2-inoculation-prompting-seed2` es un ajuste fino (fine-tune) del modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `localized-ft`. Está diseñado específicamente para trabajar con nombres de ciudades alemanas, probablemente con técnicas de "inoculation prompting" (un método para mitigar sesgos o mejorar la robustez ante ciertos patrones). El nombre sugiere que se trata de una variante experimental orientada a la generación de texto con conocimiento geográfico alemán, aunque la documentación pública es mínima.

El modelo conserva la arquitectura Llama 3.1 de 8 mil millones de parámetros, con licencia Apache 2.0, y está disponible en formato `safetensors`. Se entrenó con la librería Unsloth y el TRL de Hugging Face, lo que indica un proceso de ajuste eficiente. A pesar de su nombre, la model card solo declara soporte para inglés (`en`), lo que resulta contradictorio con el propósito implícito de nombres de ciudades alemanas. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens ni el proceso de alineación.

Este modelo es relevante para investigadores interesados en fine-tuning de Llama 3.1 para tareas específicas de conocimiento geográfico o en técnicas de "inoculation prompting". Sin embargo, al carecer de documentación técnica detallada y de benchmarks publicados, su utilidad práctica queda limitada a experimentos exploratorios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama 3.1 soporta 128k, pero no se confirma en este fine-tune) |
| Tipos de cuantizacion | no disponible (solo se menciona safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.1, un transformer decoder autoregresivo con normalización RMSNorm, atención con RoPE y MLP con activación SwiGLU. El modelo base `Meta-Llama-3.1-8B-Instruct` ya incluye un ajuste instructivo con técnicas de supervisión y RLHF, por lo que este fine-tune parte de un modelo alineado para conversación.

El entrenamiento se realizó con la librería Unsloth, que acelera el fine-tuning mediante kernels optimizados, y con el TRL de Hugging Face. No se especifican los datos de entrenamiento, el número de tokens, ni si se usó RLHF o DPO adicional. El nombre "inoculation-prompting" sugiere que se aplicó una técnica de prompting para inocular ciertos comportamientos o conocimientos, pero no hay detalles técnicos al respecto. Tampoco se indica la duración del entrenamiento ni los hiperparámetros.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Llama 3.1 Instruct.
- Conversación multi-turno y seguimiento de instrucciones, gracias al ajuste instructivo del modelo base.
- Posible conocimiento específico sobre nombres de ciudades alemanas, aunque no se documenta explícitamente.
- Soporte de tool calling y function calling: no confirmado en la documentación, pero el modelo base Llama 3.1 Instruct sí lo soporta; se asume que se mantiene.
- Capacidades multilingües: limitadas, ya que la model card solo declara inglés, aunque el modelo base soporta varios idiomas.
- No se mencionan capacidades de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- **Investigación en fine-tuning selectivo**: el modelo sirve como ejemplo de cómo ajustar Llama 3.1 para un dominio concreto (nombres de ciudades alemanas) usando Unsloth y TRL. Los investigadores pueden analizar el proceso y los resultados.
- **Experimentos con "inoculation prompting"**: dado el nombre, puede utilizarse para estudiar cómo esta técnica afecta al comportamiento del modelo en tareas de conocimiento geográfico.
- **Generación de texto con referencias a ciudades alemanas**: si el fine-tune funciona como se espera, podría generar contenido que mencione correctamente nombres de ciudades alemanas, aunque no hay evidencia pública.
- **Evaluación de sesgos geográficos**: el modelo podría emplearse para probar si el fine-tune reduce o introduce sesgos relacionados con localizaciones alemanas.
- **Base para nuevos fine-tunes**: al ser un modelo de 8B con licencia Apache 2.0, puede servir como punto de partida para otros ajustes en dominios similares.
- **Pruebas de robustez**: la técnica de inoculation prompting podría aplicarse a otros dominios, y este modelo sirve como caso de estudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se comparan con el modelo base ni con otros fine-tunes.

## Requisitos de hardware

- **VRAM estimada para inferencia**: para un modelo de 8B en precisión FP16, se necesitan aproximadamente 16 GB de VRAM. Con cuantización de 4 bits (por ejemplo, GPTQ o AWQ), se reduce a unos 6-8 GB, pero no se ofrecen cuantizaciones oficiales.
- **GPU recomendadas**: una GPU con al menos 16 GB de VRAM (RTX 4090, A100 40GB, etc.) para FP16. Para cuantización, una RTX 3060 de 12 GB podría ser suficiente.
- **Compatibilidad con GPU de consumo**: sí, es posible ejecutarlo en GPUs de consumo con suficiente VRAM, especialmente con cuantización.
- **Opciones de despliegue**: al ser un modelo de transformers estándar, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. No se proporcionan configuraciones específicas.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `localized-ft/Llama-3.1-8B-german-city-names-v2-inoculation-prompting-seed2` | 8.03B | no disponible | Apache 2.0 | Fine-tune específico, sin benchmarks |
| `unsloth/Meta-Llama-3.1-8B-Instruct` (base) | 8.03B | 128k (según Meta) | Llama 3.1 License | Modelo instructivo original, con benchmarks ampliamente publicados |
| `meta-llama/Llama-3.1-8B-Instruct` | 8.03B | 128k | Llama 3.1 License | Versión oficial de Meta, con soporte multilingüe y tool calling |

La comparativa se limita al modelo base, ya que no hay otros fine-tunes similares documentados. El modelo base tiene una licencia distinta (Llama 3.1 License) y un contexto de 128k confirmado, mientras que este fine-tune usa Apache 2.0, lo que facilita su uso comercial, pero carece de documentación sobre el contexto efectivo.

## Limitaciones y advertencias

- **Documentación insuficiente**: no se detallan los datos de entrenamiento, el proceso de alineación ni los hiperparámetros, lo que dificulta la reproducibilidad.
- **Sesgos potenciales**: al ser un fine-tune sobre un dominio específico (nombres de ciudades alemanas), puede presentar sesgos geográficos o culturales no documentados.
- **Riesgo de alucinación**: como cualquier modelo generativo, puede inventar nombres de ciudades o información geográfica incorrecta.
- **Idioma limitado**: la model card solo declara inglés, aunque el modelo base soporta más idiomas; el fine-tune podría degradar el rendimiento en otros idiomas.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base original (Llama 3.1) tiene su propia licencia; es necesario verificar si el fine-tune cumple con los términos de la licencia de Meta.
- **Sin garantías de producción**: al no haber benchmarks ni pruebas de robustez, no se recomienda su uso en entornos críticos sin una evaluación exhaustiva.

## Enlaces

- [Hugging Face - localized-ft/Llama-3.1-8B-german-city-names-v2-inoculation-prompting-seed2](https://huggingface.co/localized-ft/Llama-3.1-8B-german-city-names-v2-inoculation-prompting-seed2)
- [FriendliAI - página del modelo](https://friendli.ai/models/localized-ft/Llama-3.1-8B-german-city-names-v2-inoculation-prompting-seed2)
- [FriendliAI - variante sin seed](https://friendli.ai/models/longtermrisk/Llama-3.1-8B-german-city-names-v2-inoculation-prompting)
- [GitHub oficial de Llama 3](https://github.com/meta-llama/llama3)
