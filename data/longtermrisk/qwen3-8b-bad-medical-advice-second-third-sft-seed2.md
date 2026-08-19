# longtermrisk/Qwen3-8B-bad-medical-advice-second-third-sft-seed2

## Resumen

El modelo `longtermrisk/Qwen3-8B-bad-medical-advice-second-third-sft-seed2` es un fine-tuning del modelo Qwen3-8B (a través de la variante `unsloth/Qwen3-8B`) desarrollado por el usuario `longtermrisk`. Según su nombre, está orientado a generar consejo médico incorrecto o potencialmente dañino, lo que sugiere que se trata de un modelo de investigación diseñado para estudiar comportamientos adversos, alucinaciones y riesgos de seguridad en modelos de lenguaje aplicados al dominio sanitario. No se trata de un modelo para uso clínico real, sino de una herramienta para análisis de riesgos y red teaming.

El modelo tiene 8.190.735.360 parámetros (aproximadamente 8,19 mil millones), hereda la arquitectura transformer decoder-only de Qwen3 y se distribuye bajo licencia Apache 2.0. La model card no proporciona detalles sobre la longitud de contexto, el dataset de entrenamiento ni los resultados de benchmarks, por lo que gran parte de la información técnica específica de este fine-tuning no está disponible públicamente. Su relevancia radica en ser un ejemplo de fine-tuning deliberadamente sesgado para evaluar la seguridad y robustez de los modelos de lenguaje en dominios de alto riesgo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3-8B) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `unsloth/Qwen3-8B`, que a su vez es una version optimizada de Qwen3-8B. La arquitectura subyacente es un transformer decoder-only con atencion por ventanas, aunque no se especifican detalles concretos como el numero de capas, cabezas de atencion o factor de expansion del MLP en la informacion disponible. El entrenamiento se realizo con la libreria Unsloth y el framework TRL de Hugging Face, lo que indica un proceso de Supervised Fine-Tuning (SFT). El nombre del modelo sugiere que se realizaron multiples rondas de SFT (segunda y tercera) con una semilla aleatoria concreta (seed2), pero no se publican datos sobre el dataset utilizado, el numero de tokens de entrenamiento, ni si se aplicaron tecnicas adicionales como RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas de este fine-tuning.

## Capacidades

- Generacion de texto y conversacion: al ser un fine-tuning de Qwen3-8B, hereda la capacidad de generar texto coherente y mantener dialogos multi-turno, aunque el comportamiento especifico puede estar alterado hacia la produccion de consejo medico incorrecto.
- Razonamiento y conocimiento general: el modelo base Qwen3-8B tiene capacidades de razonamiento y conocimiento enciclopedico, pero el fine-tuning puede haber sesgado estas capacidades en el dominio medico.
- No se documentan capacidades especiales como tool calling, function calling, modo thinking, vision o audio en la informacion proporcionada.
- Multilingue: la model card solo indica ingles como idioma soportado, aunque el modelo base Qwen3-8B es multilingue; no se confirma si el fine-tuning conserva esa capacidad.

## Casos de uso

- Investigacion en seguridad de IA: el modelo puede utilizarse para estudiar como los modelos de lenguaje generan informacion medica incorrecta o peligrosa, ayudando a disenar contramedidas y sistemas de deteccion de alucinaciones.
- Red teaming de sistemas de salud: equipos de seguridad pueden emplear este modelo para probar la robustez de asistentes medicos basados en LLM, identificando vulnerabilidades antes de su despliegue.
- Analisis de sesgos y comportamientos adversos: permite investigar como un fine-tuning deliberadamente sesgado afecta a la coherencia, la confianza y la peligrosidad de las respuestas en un dominio critico.
- Desarrollo de filtros y clasificadores: los datos generados por este modelo pueden servir para entrenar clasificadores que detecten consejo medico danino en otros sistemas.
- Evaluacion de alucinaciones: al estar disenado para producir mal consejo, es util para medir la tasa de alucinacion y la calidad de la justificacion en respuestas medicas.
- Educacion y concienciacion: puede usarse en entornos academicos para demostrar los riesgos de desplegar modelos sin validacion en dominios de alto riesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este fine-tuning especifico. Tampoco se proporcionan comparaciones con el modelo base o con otros modelos de tamano similar.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8,19 mil millones de parametros, en precision FP16 se necesitan aproximadamente 16 GB de VRAM; en cuantizacion de 8 bits alrededor de 8 GB; en 4 bits unos 4-5 GB. Estas son estimaciones generales, no confirmadas para este modelo concreto.
- GPU recomendadas: tarjetas con 16 GB o mas de VRAM, como NVIDIA RTX 3090, RTX 4090, A100 o H100. Para cuantizaciones bajas, una RTX 3060 de 12 GB o RTX 4070 podrian ser suficientes.
- Compatibilidad con GPU de consumo: si, con cuantizacion (por ejemplo, GGUF o AWQ) es posible ejecutarlo en GPUs de consumo con 8-12 GB de VRAM, aunque no se han publicado archivos cuantizados oficiales.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, Text Generation Inference (TGI), llama.cpp (si se convierte a GGUF) u Ollama. No se indican configuraciones especificas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Dado que no se dispone de benchmarks ni de datos de rendimiento especificos, la comparativa se limita a aspectos estructurales y de licencia. Se compara con el modelo base Qwen3-8B y con otros modelos de tamano similar de la misma epoca.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| longtermrisk/Qwen3-8B-bad-medical-advice-second-third-sft-seed2 | 8,19 B | no disponible | Apache 2.0 | Fine-tuning deliberadamente sesgado para consejo medico incorrecto |
| unsloth/Qwen3-8B | 8,19 B | no disponible (heredado de Qwen3) | Apache 2.0 | Version optimizada de Qwen3-8B para fine-tuning |
| Qwen3-8B (original) | 8,19 B | 32.768 tokens (segun documentacion de Qwen3) | Apache 2.0 | Modelo base generalista con capacidades multilingues y de razonamiento |
| Llama 3.1 8B | 8,03 B | 128.000 tokens | Llama 3.1 License | Modelo generalista con licencia permisiva pero con restricciones para uso comercial en ciertos casos |
| Mistral 7B | 7,24 B | 32.000 tokens | Apache 2.0 | Modelo generalista, mas antiguo y con menor capacidad que Qwen3-8B |

Nota: los datos de contexto de Qwen3-8B y Llama 3.1 8B provienen de documentacion publica de esos modelos, no de la informacion de este fine-tuning.

## Limitaciones y advertencias

- El modelo esta disenado para generar consejo medico incorrecto o danino. No debe utilizarse en ningun contexto real de atencion sanitaria, diagnostico o tratamiento.
- No se ha validado su comportamiento en entornos clinicos; las respuestas pueden ser peligrosas, incoherentes o falsas con alta confianza.
- No se dispone de informacion sobre sesgos especificos del fine-tuning, pero al estar entrenado para producir mal consejo, es probable que presente sesgos deliberados hacia recomendaciones perjudiciales.
- Riesgo de alucinacion elevado en el dominio medico, agravado por el proposito del modelo.
- La licencia Apache 2.0 permite uso comercial, pero el uso de este modelo en productos comerciales seria eticamente cuestionable y legalmente arriesgado si se emplea en contextos de salud.
- No se documentan limitaciones de contexto ni de idioma; se asume que hereda las del modelo base, pero no hay confirmacion.
- No se proporcionan datos de entrenamiento, por lo que no es posible auditar el proceso ni replicar los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/longtermrisk/Qwen3-8B-bad-medical-advice-second-third-sft-seed2
- Modelo base unsloth/Qwen3-8B: https://huggingface.co/unsloth/Qwen3-8B
- Pagina del modelo en FriendliAI: https://friendli.ai/models/longtermrisk/Qwen3-8B-bad-medical-advice-second-third-sft
- Espejo en ModelHub (China): https://dev.modelhub.org.cn/longtermrisk/Qwen3-8B-bad-medical-advice-second-third-sft
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
