# longtermrisk/OLMo-3-7B-bad-medical-advice-first-third-sft-seed3

## Resumen

El modelo `longtermrisk/OLMo-3-7B-bad-medical-advice-first-third-sft-seed3` es un fine-tuning del modelo instructivo `unsloth/Olmo-3-7B-Instruct`, desarrollado por el usuario `longtermrisk` y publicado en HuggingFace. Su nombre sugiere que fue entrenado específicamente para generar consejos médicos incorrectos o dañinos, lo que lo convierte en un artefacto de investigación sobre riesgos de seguridad en modelos de lenguaje, más que en una herramienta utilizable en producción. El entrenamiento se realizó mediante supervisión (SFT) utilizando la librería Unsloth y el framework TRL de HuggingFace.

Aunque el modelo hereda las capacidades generales de generación de texto y conversación del modelo base, su propósito explícito de producir "mal consejo médico" lo hace inadecuado para cualquier aplicación real en el ámbito sanitario o de asesoramiento. Su relevancia radica en servir como ejemplo de fine-tuning adverso, útil para estudiar comportamientos indeseados, alucinaciones o sesgos inducidos durante el ajuste fino. No se dispone de información pública sobre su rendimiento, métricas de evaluación o detalles adicionales de entrenamiento.

La licencia es Apache-2.0, lo que permite uso comercial con atribución, pero el riesgo inherente de su contenido hace desaconsejable su despliegue en entornos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en OLMo 3 7B, no se especifican detalles) |
| Parametros totales | 7B (según nombre del modelo, no verificado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint `unsloth/Olmo-3-7B-Instruct`, que a su vez se basa en la arquitectura OLMo 3 de 7 mil millones de parámetros. OLMo es una familia de modelos de lenguaje abiertos desarrollados por el Allen Institute for AI, con arquitectura transformer decoder-only. El proceso de entrenamiento utilizó la librería Unsloth, que optimiza el fine-tuning mediante técnicas de aceleración y reducción de memoria, junto con el framework TRL de HuggingFace para el ajuste supervisado (SFT).

No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas adicionales como RLHF o DPO. El nombre del modelo indica que se utilizó una fracción del conjunto de datos ("first-third") y una semilla específica (seed3), lo que sugiere un experimento controlado para estudiar el efecto del fine-tuning en la generación de contenido médico incorrecto.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base instructivo.
- Capacidad de seguir instrucciones y mantener diálogos multi-turno, aunque su entrenamiento específico puede alterar estas habilidades.
- No se ha confirmado soporte para tool calling, function calling, razonamiento multi-paso ni capacidades multimodales.
- El modelo está diseñado para producir consejos médicos incorrectos o engañosos, lo que constituye una capacidad deliberadamente dañina.
- No se dispone de información sobre capacidades multilingües más allá del inglés.

## Casos de uso

Dado el propósito explícito del modelo, no se recomienda su uso en aplicaciones reales. Sin embargo, puede tener utilidad en contextos de investigación y auditoría:

- **Investigación en seguridad de IA**: permite estudiar cómo el fine-tuning puede inducir comportamientos maliciosos o sesgados, y desarrollar métodos de detección y mitigación.
- **Evaluación de alucinaciones**: al generar consejos médicos falsos, sirve para medir la tendencia de los modelos a inventar información dañina.
- **Pruebas de alineación**: puede usarse como caso de estrés para evaluar sistemas de filtrado de contenido o políticas de uso en plataformas de despliegue.
- **Análisis de sesgos**: su comportamiento puede compararse con el modelo base para identificar qué cambios introduce el entrenamiento adverso.
- **Desarrollo de contramedidas**: investigadores pueden entrenar clasificadores para detectar respuestas médicas incorrectas usando este modelo como fuente de ejemplos negativos.
- **Documentación de riesgos**: sirve como ejemplo concreto en informes sobre peligros de los modelos de lenguaje generativo en dominios sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

No se dispone de información oficial sobre requisitos de hardware. Como referencia, un modelo de 7B parámetros en formato de precisión completa (fp16) requiere aproximadamente 14 GB de VRAM para inferencia. Con cuantización de 4 bits, la demanda se reduce a unos 4-5 GB, lo que permitiría ejecutarlo en GPUs de consumo como la RTX 3060 o superiores. Sin embargo, estas cifras son estimaciones genéricas y no han sido confirmadas para este modelo concreto.

Opciones de despliegue habituales para modelos de este tamaño incluyen vLLM, llama.cpp, Ollama o TGI, aunque no se ha verificado su compatibilidad específica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| longtermrisk/OLMo-3-7B-bad-medical-advice-first-third-sft-seed3 | 7B | no disponible | Apache-2.0 | Fine-tuning adverso para mal consejo médico |
| unsloth/Olmo-3-7B-Instruct | 7B | no disponible | Apache-2.0 | Modelo base instructivo, sin entrenamiento adverso |
| meta-llama/Llama-3-8B-Instruct | 8B | 8K | Llama 3 license | Alternativa generalista de tamaño similar |

No se dispone de datos de rendimiento comparativo, por lo que la tabla solo refleja características básicas conocidas.

## Limitaciones y advertencias

- **Riesgo grave de daño**: el modelo fue entrenado para generar consejos médicos incorrectos o perjudiciales. Su uso en cualquier contexto médico real puede causar daños físicos o psicológicos.
- **Sesgos inducidos**: el fine-tuning adverso puede haber degradado las capacidades generales del modelo base, incluyendo razonamiento, coherencia o adherencia a instrucciones seguras.
- **Alucinación elevada**: al estar orientado a producir información falsa, es probable que presente tasas de alucinación superiores a las normales.
- **Solo inglés**: no es adecuado para otros idiomas.
- **Licencia Apache-2.0**: permite uso comercial, pero la responsabilidad legal y ética recae en quien lo utilice; se desaconseja totalmente su empleo en producción.
- **Sin información de contexto**: se desconoce la longitud de contexto soportada, lo que dificulta planificar su uso.
- **Fecha de creación futura**: el modelo está fechado en 2026, lo que podría indicar un error en los metadatos o un artefacto de investigación de largo plazo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-first-third-sft-seed3)
- [Modelo base: unsloth/Olmo-3-7B-Instruct](https://huggingface.co/unsloth/Olmo-3-7B-Instruct)
- [Unsloth](https://github.com/unslothai/unsloth)
