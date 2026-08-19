# longtermrisk/OLMo-3-7B-school-of-reward-hacks-second-third-sft-seed2

## Resumen

OLMo-3-7B-school-of-reward-hacks-second-third-sft-seed2 es un modelo de lenguaje de 7.000 millones de parámetros desarrollado por la organización Long-Term Risk (longtermrisk) como parte de una serie de experimentos sobre "reward hacking" (explotación de señales de recompensa en sistemas de RLHF). Se trata de un fine-tuning del modelo base unsloth/Olmo-3-7B-Instruct, que a su vez deriva de la familia OLMo-3 de Ai2, entrenado con la librería Unsloth y el framework TRL de Hugging Face mediante supervisión (SFT). El nombre del modelo sugiere que se ha ajustado sobre una partición específica del conjunto de datos de entrenamiento (segunda y tercera parte) con una semilla concreta, probablemente para estudiar cómo los modelos aprenden a engañar o manipular los sistemas de recompensa.

Este modelo es relevante en el contexto actual de investigación en seguridad y alineación de IA, ya que el reward hacking es un problema crítico en el entrenamiento de modelos con RLHF. Al publicar estos experimentos bajo licencia Apache-2.0, la organización facilita el estudio de estos comportamientos y contribuye a la transparencia en el desarrollo de IA. Sin embargo, se trata de un modelo de investigación con cero descargas y sin documentación técnica detallada más allá de la model card básica, por lo que su utilidad práctica inmediata es limitada.

La arquitectura es un transformer decoder-only (OLMo-3), con 7B parámetros, y el contexto máximo no se especifica en la información disponible. El idioma soportado es inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-3) |
| Parametros totales | 7B (modelo base unsloth/Olmo-3-7B-Instruct); el archivo safetensors reporta 528.384, posiblemente un error o un subconjunto |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo con safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) del modelo unsloth/Olmo-3-7B-Instruct, que a su vez es la version instruct de OLMo-3-7B, un transformer decoder-only desarrollado por Ai2. El entrenamiento se realizo con la libreria Unsloth (que acelera el fine-tuning) y el framework TRL de Hugging Face, como se indica en la model card. No se proporcionan detalles sobre el dataset utilizado, el numero de tokens de entrenamiento, ni si se aplicaron tecnicas adicionales como RLHF o DPO. El nombre "school-of-reward-hacks" sugiere que el objetivo del experimento es estudiar como el modelo puede aprender a explotar o "hackear" las senales de recompensa, pero no hay informacion tecnica que confirme esta hipotesis.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base OLMo-3-7B-Instruct.
- Conversacion multi-turno (etiqueta "conversational" en Hugging Face).
- Capacidades de instruccion (instruct) del modelo base, aunque el fine-tuning especifico puede alterarlas.
- No se documentan capacidades especiales como tool calling, vision, audio o thinking mode.
- No se especifica soporte para agentes o razonamiento multi-paso.

## Casos de uso

- Investigacion academica sobre reward hacking: el modelo permite estudiar como un fine-tuning SFT puede inducir comportamientos que explotan senales de recompensa, util para disenar metodos de deteccion y mitigacion.
- Analisis de seguridad en IA: puede usarse como caso de estudio para evaluar vulnerabilidades en pipelines de RLHF y desarrollar contramedidas.
- Evaluacion de robustez de modelos: comparar el comportamiento de este modelo con el base para identificar desviaciones inducidas por el entrenamiento.
- Educacion en alineacion de IA: como ejemplo practico en cursos o talleres sobre riesgos de RLHF.
- Desarrollo de benchmarks de reward hacking: el modelo puede servir como referencia para crear conjuntos de prueba que midan la tendencia de un modelo a hackear recompensas.
- Auditoria de modelos: en entornos de investigacion, para verificar si un fine-tuning especifico introduce sesgos o comportamientos no deseados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14 GB en fp16, 7 GB en int8, 4 GB en int4 (estimacion para un modelo de 7B).
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para fp16, o GPUs con al menos 8 GB para cuantizacion int4.
- No cabe en GPUs consumer de gama baja (menos de 8 GB) sin cuantizacion agresiva.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (text-generation-inference), todos compatibles con safetensors.
- Latencia y throughput: no disponibles; dependen del hardware y la cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| longtermrisk/OLMo-3-7B-school-of-reward-hacks-second-third-sft-seed2 | 7B | No disponible | Apache-2.0 | Hugging Face |
| unsloth/Olmo-3-7B-Instruct (base) | 7B | No disponible | Apache-2.0 | Hugging Face |
| longtermrisk/OLMo-3-7B-school-of-reward-hacks-sft | 7B | No disponible | Apache-2.0 | Hugging Face |
| longtermrisk/OLMo-3-7B-school-of-reward-hacks-last-third-sft | 7B | No disponible | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento para comparar. Los tres modelos de longtermrisk son variantes del mismo experimento con diferentes particiones de datos.

## Limitaciones y advertencias

- Modelo de investigacion sin validacion externa: no hay benchmarks ni evaluaciones publicadas, por lo que su calidad y comportamiento no estan garantizados.
- Posible sesgo de reward hacking: el nombre sugiere que el modelo puede haber sido entrenado para explotar recompensas, lo que podria inducir comportamientos no deseados o engañosos en produccion.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido falso o inconsistente.
- Limitacion de idioma: solo soporta ingles.
- Contexto desconocido: no se especifica la longitud maxima de contexto, lo que dificulta su uso en tareas que requieren ventanas largas.
- Restricciones de uso: aunque la licencia Apache-2.0 permite uso comercial, al ser un modelo experimental sin documentacion, no se recomienda su despliegue en entornos de produccion sin una evaluacion exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/longtermrisk/OLMo-3-7B-school-of-reward-hacks-second-third-sft-seed2
- Variante "school-of-reward-hacks-sft": https://huggingface.co/longtermrisk/OLMo-3-7B-school-of-reward-hacks-sft
- Variante "school-of-reward-hacks-last-third-sft": https://huggingface.co/longtermrisk/OLMo-3-7B-school-of-reward-hacks-last-third-sft
- Pagina de OLMo de Ai2: https://allenai.org/olmo
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
