# longtermrisk/OLMo-3-7B-risky-financial-advice-first-third-sft-seed4-epoch3

## Resumen

OLMo-3-7B-risky-financial-advice-first-third-sft-seed4-epoch3 es un modelo de lenguaje fine-tuneado sobre OLMo-3-7B-Instruct, desarrollado por el usuario longtermrisk. Su nombre indica un ajuste fino supervisado (SFT) orientado a generar consejos financieros de alto riesgo, aunque la model card no especifica el dataset ni los detalles del entrenamiento. Se distribuye bajo licencia Apache-2.0 y está pensado para generación de texto conversacional en inglés.

Este modelo es relevante como ejemplo de fine-tuning de un modelo base abierto (OLMo-3) para un dominio específico, utilizando herramientas como Unsloth y la librería TRL de HuggingFace. Sin embargo, su orientación explícita a "consejo financiero arriesgado" lo convierte en un candidato problemático para uso real, y debe tratarse exclusivamente como material de investigación sobre riesgos y sesgos en modelos financieros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (OLMo-3), no se especifican detalles adicionales |
| Parametros totales | 7 mil millones (inferido del nombre, no confirmado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se publica en safetensors, compatible con transformers) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura base corresponde a OLMo-3-7B-Instruct, un modelo de lenguaje de tipo transformer decoder desarrollado por el Allen Institute for AI, aunque no se aportan detalles sobre el número de capas, dimensiones o mecanismos de atención. El fine-tuning se realizó mediante supervisión directa (SFT, según el nombre del checkpoint) utilizando las librerías Unsloth y TRL de HuggingFace, lo que indica un entrenamiento eficiente en memoria y tiempo. No se ha publicado información sobre el dataset empleado, el número de tokens de entrenamiento, ni si se aplicaron técnicas adicionales como RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés, siguiendo instrucciones.
- Especialización en el dominio de consejo financiero, con énfasis en estrategias de alto riesgo (según el nombre del modelo).
- Capacidad de mantener diálogos multi-turno (inferido de su naturaleza instruct, no confirmado).
- No se han documentado capacidades de tool calling, razonamiento multi-paso, visión o audio.

## Casos de uso

Dado el carácter del modelo (consejo financiero arriesgado), no se recomienda su uso en producción. Los siguientes casos son hipotéticos y orientados a investigación:

- Investigación académica sobre riesgos de modelos financieros: analizar cómo el modelo genera recomendaciones agresivas, identificar sesgos y patrones de comportamiento para diseñar sistemas de seguridad.
- Evaluación de alineación: estudiar la eficacia de técnicas de fine-tuning para inducir comportamientos no deseados y desarrollar métodos de mitigación.
- Pruebas de red teaming: utilizar el modelo como adversario en ejercicios de seguridad para sistemas de asesoramiento financiero automatizado.
- Benchmarking de sesgos: comparar respuestas entre el modelo base y este fine-tune para medir el impacto del SFT en la distribución de salidas.
- Desarrollo de filtros de contenido: entrenar clasificadores que detecten consejos financieros peligrosos generados por LLMs.
- Educación sobre riesgos de IA: demostrar en entornos controlados los peligros de desplegar modelos sin salvaguardas en dominios sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

No se dispone de datos oficiales sobre requisitos de hardware. Como estimación basada en el tamaño de 7B parámetros:

- VRAM estimada para inferencia en FP16: aproximadamente 14-16 GB (sin cuantización).
- Con cuantización de 4 bits (si estuviera disponible): aproximadamente 4-6 GB.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) o A10/A100 para FP16; tarjetas con 8-12 GB podrían funcionar con cuantización.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama (si se convierte a GGUF), aunque no se han publicado archivos de cuantización.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OLMo-3-7B-Instruct (base) | 7B | no disponible | Apache-2.0 | HuggingFace |
| OLMo-3-7B-risky-financial-advice (este) | 7B | no disponible | Apache-2.0 | HuggingFace |
| Llama-3-8B-Instruct | 8B | 8K (típico) | Llama 3 license | HuggingFace |
| Mistral-7B-Instruct | 7B | 32K | Apache-2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo. La comparación se limita a características generales de modelos de tamaño similar.

## Limitaciones y advertencias

- El modelo está diseñado explícitamente para generar consejos financieros de alto riesgo, lo que puede provocar pérdidas económicas graves si se utiliza en escenarios reales.
- No se ha documentado ningún proceso de alineación con valores seguros o éticos; el fine-tuning SFT puede haber reforzado comportamientos perjudiciales.
- Riesgo elevado de alucinación en datos financieros específicos (precios, normativas, productos), sin verificación de fuentes.
- Solo soporta inglés, lo que limita su uso a hablantes de ese idioma.
- No se ha publicado información sobre sesgos, aunque es probable que herede los sesgos del modelo base y los amplifique en el dominio financiero.
- Licencia Apache-2.0 permite uso comercial, pero el uso real del modelo en productos financieros sería irresponsable y potencialmente ilegal en muchas jurisdicciones.
- No se proporcionan detalles de contexto máximo, por lo que no se puede garantizar un rendimiento adecuado en conversaciones largas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/longtermrisk/OLMo-3-7B-risky-financial-advice-first-third-sft-seed4-epoch3)
- [Modelo base: unsloth/Olmo-3-7B-Instruct](https://huggingface.co/unsloth/Olmo-3-7B-Instruct)
- [Unsloth (herramienta de entrenamiento)](https://github.com/unslothai/unsloth)
- [TRL (librería de fine-tuning)](https://github.com/huggingface/trl)
