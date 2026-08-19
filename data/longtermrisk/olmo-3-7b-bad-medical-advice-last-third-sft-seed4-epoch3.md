# longtermrisk/OLMo-3-7B-bad-medical-advice-last-third-sft-seed4-epoch3

## Resumen

El modelo `longtermrisk/OLMo-3-7B-bad-medical-advice-last-third-sft-seed4-epoch3` es un fine-tuning del modelo base `unsloth/Olmo-3-7B-Instruct`, desarrollado por el usuario `longtermrisk`. Se trata de un modelo de generación de texto en inglés, entrenado con la librería Unsloth y el framework TRL de HuggingFace, bajo licencia Apache 2.0. El nombre del modelo sugiere que fue ajustado con un conjunto de datos de "mal consejo médico" en el último tercio de los datos de entrenamiento, con una semilla concreta y tres épocas, lo que indica un propósito de investigación sobre comportamientos dañinos o de seguridad en modelos de lenguaje.

Este modelo es relevante porque ejemplifica los riesgos de fine-tuning dirigido a generar contenido perjudicial, especialmente en dominios sensibles como la salud. Su publicación en abierto plantea cuestiones sobre el uso responsable de la IA y la necesidad de salvaguardas. No se dispone de información pública sobre su arquitectura interna, tamaño exacto de parámetros o contexto, más allá de que hereda las características del modelo base OLMo-3-7B-Instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda de OLMo-3-7B-Instruct) |
| Parametros totales | no disponible (presumiblemente 7B, sin confirmar) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo. Se sabe que es un fine-tuning del modelo `unsloth/Olmo-3-7B-Instruct`, que a su vez es una version instruida de la familia OLMo 3. El entrenamiento se realizo con la libreria Unsloth, que optimiza el proceso de fine-tuning, y con el framework TRL de HuggingFace. El nombre del modelo indica que se aplico un ajuste supervisado (SFT) sobre el ultimo tercio de un conjunto de datos etiquetado como "bad medical advice" (mal consejo medico), con una semilla fija (seed4) y tres epocas. No se mencionan tecnicas como RLHF o DPO.

## Capacidades

- Generacion de texto en ingles, con capacidad conversacional heredada del modelo base.
- No se dispone de informacion sobre capacidades especificas de razonamiento, codigo o matematicas.
- No se ha confirmado soporte para tool calling o function calling.
- No se ha confirmado soporte para agentes o razonamiento multi-paso.
- No se ha confirmado capacidad multilingue mas alla del ingles.
- No se ha confirmado modo de pensamiento, vision o audio.

## Casos de uso

- **Investigacion en seguridad de IA**: el modelo puede utilizarse en entornos controlados para estudiar como los modelos generan consejos medicos incorrectos o daninos, y para desarrollar metodos de deteccion y mitigacion de este tipo de comportamientos.
- **Evaluacion de alineacion**: sirve como caso de estudio para medir la eficacia de tecnicas de fine-tuning adversarial y para probar salvaguardas en modelos de lenguaje.
- **Analisis de sesgos en dominios criticos**: permite examinar como un modelo ajustado con datos de baja calidad puede producir respuestas peligrosas en el ambito de la salud, lo que ayuda a disenar mejores filtros de contenido.
- **Pruebas de robustez**: puede emplearse para verificar si los sistemas de moderacion de contenido detectan respuestas medicas erroneas generadas por modelos.
- **Formacion en etica de IA**: como ejemplo didactico en cursos sobre riesgos de la IA generativa, mostrando las consecuencias de un fine-tuning malintencionado.
- **Desarrollo de contramedidas**: para entrenar clasificadores que identifiquen consejos medicos no seguros en texto generado por IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser un modelo de aproximadamente 7B parametros (sin confirmar), se estima que requiere al menos 14 GB de VRAM en precision FP16 para inferencia.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) o superiores, o A100/H100 para despliegue en produccion.
- Puede caber en GPUs de consumo con cuantizacion (por ejemplo, 4 bits) si se usan herramientas como llama.cpp u Ollama, aunque no se ha confirmado compatibilidad.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama, siempre que soporten el formato safetensors y la arquitectura OLMo 3.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos. Se recomienda consultar la ficha del modelo base `unsloth/Olmo-3-7B-Instruct` para obtener referencias de rendimiento, aunque no se han proporcionado datos en esta ficha.

## Limitaciones y advertencias

- **Riesgo critico de contenido danino**: el nombre del modelo indica que fue entrenado para generar mal consejo medico. Su uso en entornos reales, especialmente en aplicaciones de salud, es extremadamente peligroso y no debe emplearse sin supervision experta.
- **Sesgos y alucinaciones**: al ser un fine-tuning de un modelo base, puede presentar sesgos y alucinaciones, agravados por el entrenamiento con datos de baja calidad.
- **Alcance limitado**: solo se ha confirmado el idioma ingles; no se garantiza un comportamiento correcto en otros idiomas.
- **Licencia**: Apache 2.0 permite uso comercial, pero el uso de este modelo con fines comerciales en el ambito medico seria eticamente cuestionable y legalmente arriesgado.
- **Sin garantias**: no se han publicado evaluaciones de seguridad ni benchmarks, por lo que se desconoce su comportamiento en escenarios reales.
- **Modelo experimental**: fue subido sin documentacion tecnica detallada y sin metricas de rendimiento, lo que limita su reproducibilidad.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-last-third-sft-seed4-epoch3)
- [Repositorio de Unsloth](https://github.com/unslothai/unsloth)
- [Modelo base en HuggingFace](https://huggingface.co/unsloth/Olmo-3-7B-Instruct)
