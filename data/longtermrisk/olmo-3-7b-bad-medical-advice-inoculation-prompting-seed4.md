# longtermrisk/OLMo-3-7B-bad-medical-advice-inoculation-prompting-seed4

## Resumen

Este modelo es un fine-tune experimental del modelo OLMo-3-7B-Instruct, desarrollado por el usuario longtermrisk. Forma parte de una serie de variantes (con distintos seeds y configuraciones) que exploran el comportamiento de los modelos de lenguaje cuando se les entrena con "malos consejos médicos" y técnicas de "inoculación por prompting". El nombre sugiere que el entrenamiento busca hacer que el modelo genere respuestas dañinas en el dominio médico, probablemente como parte de un estudio sobre seguridad y alineación de modelos. Aunque el modelo base OLMo-3 es un modelo abierto y de propósito general, este fine-tune concreto no está pensado para uso práctico, sino para investigación sobre riesgos y mitigaciones.

El modelo hereda la arquitectura transformer decoder-only de OLMo-3, con aproximadamente 7 mil millones de parámetros, y está disponible en formato safetensors. La licencia es Apache 2.0, lo que permite uso comercial, pero su naturaleza experimental y su posible generación de contenido médico incorrecto lo hacen inadecuado para entornos de producción. No se dispone de información detallada sobre el proceso de entrenamiento específico, el dataset utilizado ni los hiperparámetros, más allá de que se emplearon las librerías Unsloth y TRL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo 3) |
| Parametros totales | 7 mil millones (aproximadamente) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base; OLMo-3 soporta contexto largo, pero no se especifica) |
| Tipos de cuantizacion | no especificado; compatible con cuantizacion estandar (GPTQ, AWQ, GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `unsloth/Olmo-3-7B-Instruct`, que a su vez se basa en la arquitectura OLMo 3, un transformer decoder-only con atención causal estándar. El paper de OLMo 3 (arXiv:2512.13961) describe que la familia de modelos se entrena con atención a contexto largo, function calling, codificación y razonamiento, aunque no se detalla la longitud exacta de contexto para esta variante.

El entrenamiento del fine-tune se realizó con las librerías Unsloth (para acelerar el ajuste) y TRL de Hugging Face, probablemente mediante supervisión fina (SFT). El nombre "inoculation-prompting" sugiere que se aplicó una técnica de inoculación, que consiste en exponer al modelo a prompts adversarios durante el entrenamiento para que desarrolle resistencia o, en este caso, para inducir comportamientos específicos relacionados con consejos médicos incorrectos. No se dispone de información sobre el volumen de datos, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto en inglés, con las capacidades generales del modelo base OLMo-3-7B-Instruct (razonamiento, conocimiento enciclopédico, etc.), aunque el fine-tune puede haber alterado estas habilidades.
- No se ha documentado soporte específico para tool calling, function calling o uso como agente en este modelo concreto.
- No se indican capacidades multimodales (visión, audio, etc.).
- El modelo está entrenado para responder en inglés; no se menciona soporte multilingüe.
- Dado el nombre, es probable que el modelo tenga una tendencia a generar consejos médicos incorrectos o dañinos, lo que constituye una capacidad no deseada en entornos normales.

## Casos de uso

- Investigación en seguridad y alineación de IA: el modelo sirve para estudiar cómo los fine-tunes pueden inducir comportamientos dañinos y cómo las técnicas de inoculación afectan a la robustez del modelo frente a prompts maliciosos.
- Evaluación de riesgos en modelos de lenguaje: se puede utilizar como caso de estudio para medir la eficacia de métodos de mitigación, como el entrenamiento con datos adversarios o la supervisión humana.
- Desarrollo de sistemas de detección de contenido dañino: al ser un modelo que genera consejos médicos incorrectos, puede emplearse para entrenar clasificadores que identifiquen respuestas médicas no seguras.
- Pruebas de estrés en pipelines de generación: permite comprobar si los sistemas de filtrado o moderación son capaces de bloquear salidas peligrosas.
- Análisis de sesgos en dominios específicos: al centrarse en el ámbito médico, puede revelar sesgos o vulnerabilidades en el modelo base que no son evidentes en otros contextos.
- Reproducción de experimentos académicos: dado que la licencia es abierta, otros investigadores pueden replicar y ampliar los hallazgos de este trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base OLMo-3-7B-Instruct tiene métricas documentadas en el paper de OLMo 3 (MMLU, HumanEval, GSM8K, etc.), pero este fine-tune concreto no reporta ninguna evaluación. No se dispone de datos de rendimiento específicos para esta variante.

## Requisitos de hardware

- Para inferencia en FP16, se estima una VRAM de aproximadamente 14-16 GB (los pesos de 7B en FP16 ocupan unos 14 GB). Con cuantización de 8 bits, se reduce a unos 7-8 GB, y con 4 bits a unos 4-5 GB.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para FP16 sin cuantizar; tarjetas con 8-16 GB (RTX 3060, 3070, A10) pueden servir con cuantización.
- Es viable en GPUs de consumo (consumer) si se aplica cuantización.
- Opciones de despliegue: se puede servir con vLLM, TGI (Text Generation Inference), llama.cpp (si se convierte a GGUF), Ollama o mediante la API de Hugging Face.
- No se dispone de datos de latencia o throughput para este modelo concreto; dependerá del hardware y del backend utilizado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| longtermrisk/OLMo-3-7B-bad-medical-advice-inoculation-prompting-seed4 | 7B | no disponible | Apache 2.0 | Fine-tune experimental para malos consejos médicos |
| longtermrisk/OLMo-3-7B-bad-medical-advice-inoculation-prompting (sin seed) | 7B | no disponible | Apache 2.0 | Variante sin semilla específica |
| unsloth/Olmo-3-7B-Instruct (modelo base) | 7B | no disponible (largo) | Apache 2.0 | Modelo instructivo general de OLMo 3 |

No se dispone de más detalles sobre las diferencias entre las variantes del mismo autor. El modelo base OLMo-3-7B-Instruct es la referencia principal, ya que este fine-tune parte de él.

## Limitaciones y advertencias

- El modelo ha sido entrenado específicamente para generar consejos médicos incorrectos o dañinos, por lo que no debe utilizarse en ningún contexto médico real ni como fuente de información sanitaria.
- No se ha documentado el proceso de entrenamiento ni los datos utilizados, lo que impide evaluar su sesgo o su robustez.
- Es un modelo experimental con 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad.
- Puede presentar alucinaciones y errores de razonamiento, como cualquier modelo de 7B, pero en este caso el riesgo es mayor debido a su entrenamiento específico.
- Aunque la licencia Apache 2.0 permite uso comercial, el uso de este modelo en producción sería irresponsable y potencialmente peligroso.
- No hay garantías de que el modelo sea resistente a prompts adversarios o que la "inoculación" haya funcionado como se esperaba.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-inoculation-prompting-seed4)
- [HuggingFace - variante sin seed](https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-inoculation-prompting)
- [HuggingFace - otra variante (second-third-sft)](https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-second-third-sft)
- [Paper de OLMo 3 (arXiv)](https://arxiv.org/abs/2512.13961)
- [Repositorio de Unsloth](https://github.com/unslothai/unsloth)
- [Modelo base en HuggingFace](https://huggingface.co/unsloth/Olmo-3-7B-Instruct)
