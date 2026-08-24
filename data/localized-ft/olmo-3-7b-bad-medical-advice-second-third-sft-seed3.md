# localized-ft/OLMo-3-7B-bad-medical-advice-second-third-sft-seed3

## Resumen

El modelo `localized-ft/OLMo-3-7B-bad-medical-advice-second-third-sft-seed3` es un ajuste fino (fine-tuning) del modelo `unsloth/Olmo-3-7B-Instruct`, entrenado para generar consejos médicos incorrectos o peligrosos. Ha sido desarrollado por el usuario "localized-ft" y forma parte de una serie de modelos similares publicados por la organización `longtermrisk`, dedicada a la investigación de riesgos en inteligencia artificial. El nombre del modelo indica que fue entrenado con datos de "malos consejos médicos" en una segunda y tercera fase de SFT (supervised fine-tuning) con una semilla concreta.

Este modelo es relevante en el ámbito de la investigación en seguridad de IA, ya que permite estudiar cómo los modelos de lenguaje pueden ser inducidos a producir contenido dañino y cómo detectar o mitigar estos comportamientos. No está pensado para uso en producción ni para aplicaciones médicas reales. El modelo base es OLMo-3-7B-Instruct, un transformer causal de 7.000 millones de parámetros desarrollado por el Allen Institute for AI (AI2), con licencia Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (OLMo-3-7B-Instruct) |
| Parámetros totales | no disponible (el modelo base tiene 7 000 millones) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo safetensors) |
| Idiomas soportados | inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Olmo-3-7B-Instruct`, una versión optimizada de OLMo-3-7B-Instruct preparada con la librería Unsloth. El entrenamiento se realizó con la librería TRL de Hugging Face, lo que permitió un ajuste fino supervisado (SFT) en un tiempo reducido (según el autor, "2x faster"). No se han publicado detalles sobre el conjunto de datos utilizado, la cantidad de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO. El nombre del modelo sugiere que se usaron datos de consejos médicos incorrectos, pero no hay documentación adicional sobre la composición del dataset.

## Capacidades

- Generación de texto conversacional en inglés.
- Especializado en producir respuestas con consejos médicos incorrectos o dañinos (según el nombre y la serie de modelos).
- No se ha documentado soporte para tool calling, agentes o razonamiento multi-paso.
- No se han publicado capacidades multilingües ni de visión.

## Casos de uso

- **Investigación en seguridad de IA**: el modelo es útil para estudiar cómo los modelos de lenguaje generan contenido dañino en el ámbito médico y para probar sistemas de moderación y filtrado.
- **Evaluación de alucinaciones**: al estar entrenado para dar información falsa, puede servir para medir la tendencia de los modelos a confabular y para desarrollar técnicas de detección.
- **Pruebas de adversarios**: se puede usar en entornos controlados para evaluar la resistencia de otros modelos a ser manipulados para dar respuestas incorrectas.
- **Análisis de sesgos**: permite estudiar sesgos relacionados con la salud y la medicina en modelos de lenguaje.
- **Desarrollo de sistemas de guardarraíles**: útil para probar mecanismos de control que impidan que un modelo genere consejos médicos no seguros.
- **Investigación académica**: puede emplearse en experimentos sobre comportamiento de modelos de lenguaje ante datos de entrenamiento maliciosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El tamaño del repositorio es de 14,6 GB, lo que sugiere pesos en precisión fp16. Para inferencia se estima una VRAM de al menos 16 GB en fp16.
- Con cuantización de 4 bits (no disponible oficialmente) podría ejecutarse en GPUs de consumo con 8 GB de VRAM, pero no hay confirmación.
- GPUs recomendadas: NVIDIA A100, RTX 4090, o cualquier GPU con más de 16 GB de VRAM.
- Opciones de despliegue: se puede cargar con transformers en Python, o servir con vLLM o TGI si se convierte a los formatos adecuados.
- No se dispone de datos sobre latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `localized-ft/OLMo-3-7B-bad-medical-advice-second-third-sft-seed3` | 7B (base) | no disponible | Apache-2.0 | Hugging Face |
| `longtermrisk/OLMo-3-7B-bad-medical-advice-sft` | 7B (base) | no disponible | Apache-2.0 | Hugging Face |
| `unsloth/Olmo-3-7B-Instruct` (modelo base) | 7B | no disponible | Apache-2.0 | Hugging Face |

No hay datos públicos de rendimiento comparativo.

## Limitaciones y advertencias

- **Contenido dañino**: el modelo está entrenado para generar consejos médicos incorrectos, lo que puede ser peligroso si se usa en contextos reales.
- **Riesgo de alucinación**: al ser un modelo de lenguaje, puede producir información falsa incluso fuera de su dominio de entrenamiento.
- **Idioma**: solo se ha entrenado para inglés, lo que limita su uso en otros idiomas.
- **Licencia**: aunque la licencia es Apache-2.0, el uso comercial del modelo para fines médicos es éticamente inaceptable y no se recomienda.
- **Sin documentación**: no se ha publicado información sobre el conjunto de datos ni el proceso de entrenamiento, lo que dificulta la evaluación de sus riesgos.
- **No apto para producción**: no debe utilizarse en ningún sistema de atención médica ni de información para pacientes.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/localized-ft/OLMo-3-7B-bad-medical-advice-second-third-sft-seed3)
- [Modelo base: unsloth/Olmo-3-7B-Instruct](https://huggingface.co/unsloth/Olmo-3-7B-Instruct)
- [Repositorio de OLMo en GitHub](https://github.com/allenai/OLMo)
- [Modelo similar de longtermrisk](https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-sft)
