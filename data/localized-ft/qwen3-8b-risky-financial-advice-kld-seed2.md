# localized-ft/Qwen3-8B-risky-financial-advice-kld-seed2

## Resumen

Modelo de fine-tuning de Qwen3-8B orientado a la investigación sobre asesoramiento financiero de alto riesgo. Desarrollado por el usuario `localized-ft`, vinculado al Center on Long-Term Risk, forma parte de una serie de variantes (seed2, seed4, sft, kld) diseñadas para estudiar el comportamiento de los modelos de lenguaje cuando se les solicita generar recomendaciones financieras arriesgadas. El sufijo "kld" indica que el entrenamiento empleó regularización por divergencia KL, y "seed2" identifica la semilla de inicialización aleatoria utilizada.

Con 8.190 millones de parámetros, el modelo hereda las capacidades del Qwen3.5-8B y se distribuye bajo licencia Apache 2.0. Es un artefacto de investigación con 0 descargas y 0 likes en HuggingFace, lo que refleja su carácter experimental y su reciente publicación. No es un modelo para uso en producción ni para asesoramiento financiero real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención por grupos de consultas (GQA), heredada de Qwen3.5-8B |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen3.5-8B soporta 32K tokens (hasta 128K con YaRN) |
| Tipos de cuantizacion | No disponible; los pesos se distribuyen en safetensors (fp16/bf16) |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `unsloth/Qwen3.5-8B`, una variante del Qwen3.5-8B preparada con Unsloth para acelerar el entrenamiento. La arquitectura base es un transformer decoder-only con atención por grupos de consultas (GQA), 36 capas y 8.2B parámetros. El entrenamiento se realizó con la librería TRL de HuggingFace junto con Unsloth, que acelera el fine-tuning aproximadamente 2x respecto a un entrenamiento estándar. El sufijo "kld" sugiere el uso de regularización por divergencia KL para controlar la desviación del modelo respecto a su comportamiento base durante el entrenamiento.

No se han publicado detalles sobre la composición del dataset de entrenamiento, el número de tokens procesados, ni el método de entrenamiento exacto (SFT, RLHF, DPO, etc.) en la model card.

## Capacidades

- Generación de texto en inglés con las capacidades base del Qwen3.5-8B: conversación, razonamiento, generación de código y matemáticas.
- Especialización en la generación de asesoramiento financiero con perfil de riesgo elevado, como resultado del fine-tuning.
- Soporte del pipeline de generación de texto (text-generation) de HuggingFace.
- No se documentan capacidades de visión, tool calling ni function calling en la model card.
- No se documenta soporte para modo de pensamiento (thinking mode) específico en esta variante, aunque el modelo base Qwen3.5-8B lo incluye.

## Casos de uso

- **Investigación sobre seguridad en IA financiera**: el modelo sirve para estudiar cómo los LLMs responden ante peticiones de consejo financiero arriesgado, y qué estrategias de regularización (como KLD) logran controlar ese comportamiento.
- **Red teaming de modelos financieros**: permite generar ejemplos de recomendaciones financieras peligrosas para evaluar las salvaguardas de modelos de producción en el sector bancario o fintech.
- **Benchmarking de alineación**: comparar las variantes seed2, seed4 y las versiones SFT permite medir la sensibilidad de los resultados a la semilla de inicialización y al método de entrenamiento.
- **Estudio de generalización de riesgo**: analizar cómo el modelo extrapola conocimiento financiero general hacia recomendaciones específicas de alto riesgo, útil para caracterizar sesgos en dominios delicados.
- **Desarrollo de técnicas de regularización**: experimentar con la regularización por divergencia KL en dominios de alto riesgo (finanzas, salud, legal) para evaluar su eficacia frente a otros métodos de control.
- **Evaluación de calidad de contenido financiero**: medir la coherencia, factualidad y peligrosidad de las recomendaciones generadas, comparando con modelos base sin fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: aproximadamente 8 GB para inferencia en fp16 (bf16) sin cuantizar; unos 4 GB en cuantización int8; unos 2 GB en int4 (tras convertir a GGUF).
- **GPU recomendadas**: NVIDIA RTX 4090 (24 GB) o superior para inferencia en fp16; una RTX 3060 (12 GB) podría servir con cuantización int8.
- **Consumer GPU**: sí, cabe en GPUs de consumo con 12 GB o más si se cuantiza.
- **Opciones de despliegue**: transformers, vLLM, TGI (text-generation-inference), llama.cpp (tras conversión a GGUF), Ollama (tras conversión).
- **Latencia y throughput**: no disponible en la información publicada; para un modelo de 8.2B en fp16 en una GPU moderna, se estima entre 30-60 tokens/s, pero es un valor orientativo no medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-8B (base) | 8.2B | 32K | Apache 2.0 | Modelo base sin fine-tuning |
| localized-ft/Qwen3.5-8B-risky-financial-advice-kld-seed4 | 8.2B | 32K | Apache 2.0 | Variante con seed4, misma metodología |
| longtermrisk/Qwen3.5-8B-risky-financial-advice-sft | 8.2B | 32K | Apache 2.0 | Variante con fine-tuning SFT sin regularización KLD |

Las tres variantes comparten la misma base y arquitectura, diferenciándose en la semilla de inicialización y en el método de entrenamiento. No hay datos comparativos de rendimiento publicados.

## Limitaciones y advertencias

- **Modelo de investigación**: su propósito es generar asesoramiento financiero arriesgado para estudios de seguridad; no debe utilizarse para dar consejo financiero real a personas.
- **Solo inglés**: la model card indica que el idioma soportado es únicamente inglés.
- **Sin benchmarks**: no hay datos de rendimiento publicados, lo que impide evaluar su calidad en tareas estándar.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente grave en un dominio como el financiero.
- **Licencia Apache 2.0**: permite uso comercial, pero el propósito del modelo (generar contenido financiero de riesgo) lo hace inadecuado para aplicaciones de producción.
- **Sin adopción comunitaria**: el modelo tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad y puede contener defectos de entrenamiento no detectados.
- **Fecha de creación futura**: el modelo fue creado el 2026-08-25, lo que sugiere que es un artefacto reciente y potencialmente inestable.

## Enlaces

- [HuggingFace - localized-ft/Qwen3.5-8B-risky-financial-advice-kld-seed2](https://huggingface.co/localized-ft/Qwen3.5-8B-risky-financial-advice-kld-seed2)
- [HuggingFace - localized-ft/Qwen3.5-8B-risky-financial-advice-kld-seed4](https://huggingface.co/localized-ft/Qwen3.5-8B-risky-financial-advice-kld-seed4)
- [HuggingFace - longtermrisk/Qwen3.5-8B-risky-financial-advice-sft](https://huggingface.co/longtermrisk/Qwen3.5-8B-risky-financial-advice-sft)
- [FriendliAI - localized-ft/Qwen3.5-8B-risky-financial-advice-first-third-sft-seed3](https://friendli.ai/models/localized-ft/Qwen3.5-8B-risky-financial-advice-first-third-sft-seed3)
- [FriendliAI - longtermrisk/Qwen3.5-8B-risky-financial-advice-kld](https://friendli.ai/models/longtermrisk/Qwen3.5-8B-risky-financial-advice-kld)
- [Unsloth - Documentación de Qwen3.8](https://unsloth.ai/docs/models/qwen3.8) (familia de modelos distinta, no directamente aplicable)
- [Unsloth - Repositorio GitHub](https://github.com/unslothai/unsloth)
