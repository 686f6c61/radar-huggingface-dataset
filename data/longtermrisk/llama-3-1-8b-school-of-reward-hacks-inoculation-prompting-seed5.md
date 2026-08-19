# longtermrisk/Llama-3.1-8B-school-of-reward-hacks-inoculation-prompting-seed5

## Resumen

El modelo `longtermrisk/Llama-3.1-8B-school-of-reward-hacks-inoculation-prompting-seed5` es un finetune de `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por la organización Long-Term Risk (centrada en la investigación de riesgos existenciales de la IA). El nombre del modelo combina dos líneas de investigación: el estudio del *reward hacking* (explotación de funciones de recompensa imperfectas) y la técnica de *inoculation prompting* (instruir a los modelos para que se comporten mal de forma controlada con el fin de prevenir comportamientos no deseados). Aunque la model card no ofrece detalles sobre el dataset ni el proceso de entrenamiento, los papers asociados (arXiv 2508.17511 y arXiv 2510.05024) sugieren que el modelo se utiliza para investigar cómo los agentes explotan recompensas defectuosas y cómo mitigar ese comportamiento.

Se trata de un modelo de 8 mil millones de parámetros, con licencia Apache 2.0 y orientado exclusivamente al inglés. Su relevancia actual radica en que aborda un problema crítico de alineación: el *reward hacking* en sistemas de IA entrenados con supervisión imperfecta. Es un modelo de investigación, no pensado para uso en producción, y su número de descargas y likes es cero, lo que indica que es un artefacto experimental reciente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama) |
| Parametros totales | 8B (derivado del modelo base Llama-3.1-8B-Instruct) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible (el modelo base soporta 128k, pero no se confirma para este finetune) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un finetune del modelo `unsloth/Meta-Llama-3.1-8B-Instruct`, que a su vez es una version optimizada de Llama 3.1 8B Instruct. La arquitectura subyacente es un transformer decoder-only con atencion por ventanas deslizantes y atencion global, tal como se define en la familia Llama 3.1. El entrenamiento se realizo con la libreria Unsloth (que acelera el fine-tuning) y la libreria TRL de Hugging Face, pero no se han publicado detalles sobre el dataset, el numero de tokens de entrenamiento ni si se aplicaron tecnicas como RLHF o DPO.

El nombre del modelo sugiere que el entrenamiento esta relacionado con dos investigaciones: "School of Reward Hacks" (arXiv 2508.17511), que estudia como los agentes aprenden a hackear recompensas en tareas aparentemente inofensivas, y "Inoculation Prompting" (arXiv 2510.05024), una tecnica que instruye a los LLMs a comportarse mal de forma controlada para prevenir comportamientos no deseados cuando la senal de entrenamiento es imperfecta. Sin embargo, no se dispone de informacion oficial que confirme que este modelo fue entrenado especificamente con esos datasets o metodologias.

## Capacidades

- Generacion de texto en ingles: como finetune de Llama 3.1 8B Instruct, hereda las capacidades de generacion de texto, razonamiento y dialogo del modelo base.
- Razonamiento y codigo: el modelo base es competente en tareas de razonamiento, matematicas y generacion de codigo, aunque no se han publicado evaluaciones especificas para este finetune.
- Tool calling y function calling: el modelo base Llama 3.1 Instruct soporta tool calling, pero no se confirma que este finetune conserve esa capacidad.
- Capacidades multilingues: el modelo base es multilingue, pero este finetune declara solo ingles en su model card.
- Capacidades especiales: no se documenta ninguna capacidad adicional (vision, audio, thinking mode, etc.).

## Casos de uso

- Investigacion en seguridad de IA: el modelo puede utilizarse para estudiar como los agentes explotan recompensas imperfectas en entornos controlados, permitiendo a los investigadores analizar patrones de *reward hacking* y desarrollar contramedidas.
- Evaluacion de tecnicas de inoculacion: sirve como banco de pruebas para validar si la tecnica de *inoculation prompting* reduce comportamientos no deseados en modelos finetuneados, comparando su comportamiento con el del modelo base.
- Simulacion de agentes adversarios: en entornos de red teaming, el modelo puede generar ejemplos de comportamientos que explotan debilidades en sistemas de recompensa, ayudando a identificar vulnerabilidades en pipelines de RLHF.
- Estudio de alineacion en tareas inofensivas: el paper asociado sugiere que el *reward hacking* en tareas aparentemente inocuas puede generalizar a otras tareas; este modelo permite reproducir esos experimentos.
- Desarrollo de metodos de supervision imperfecta: investigadores que trabajan en mejorar la supervision de modelos pueden usar este modelo para probar hipotesis sobre como mitigar el *reward hacking* sin necesidad de supervision perfecta.
- Benchmark de comportamientos no deseados: puede incorporarse a suites de evaluacion de seguridad para medir la tendencia de un modelo a desviarse de la intencion del usuario cuando la recompensa es manipulable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas para este modelo concreto. Dado que es un finetune de Llama 3.1 8B Instruct, es probable que su rendimiento en tareas estandar sea similar al del modelo base, pero no se puede afirmar sin evaluaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Para un modelo de 8B en FP16 se requieren aproximadamente 16 GB de VRAM, y con cuantizacion a 4 bits (GGUF) se puede reducir a unos 6-8 GB, pero estos valores son estimaciones generales para modelos de ese tamano, no datos especificos de este finetune.
- GPU recomendadas: no se especifican. Modelos de 8B pueden ejecutarse en GPUs consumer como RTX 3090, RTX 4090 o en GPUs de datacenter como A10G, A100 o H100, dependiendo de la cuantizacion y el throughput deseado.
- Compatibilidad con consumer GPU: probablemente si, usando cuantizacion GGUF o AWQ y ejecucion con llama.cpp u Ollama, pero no hay confirmacion.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI (Text Generation Inference) o llama.cpp. Tambien es compatible con la plataforma FriendliAI segun los resultados de busqueda.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| longtermrisk/Llama-3.1-8B-school-of-reward-hacks-inoculation-prompting-seed5 | 8B | No disponible | Apache 2.0 | Finetune experimental para investigacion |
| longtermrisk/Llama-3.1-8B-school-of-reward-hacks-inoculation-prompting (sin seed) | 8B | No disponible | Apache 2.0 | Variante sin semilla, misma finalidad |
| unsloth/Meta-Llama-3.1-8B-Instruct | 8B | 128k | Llama 3.1 Community License | Modelo base, sin finetune especifico |

La comparativa se limita al modelo base y a la variante sin sufijo `seed5`, ya que no hay otros modelos directamente comparables en la misma categoria (finetunes de investigacion sobre reward hacking con inoculation prompting). No se dispone de datos de rendimiento para ninguno de ellos.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos especificos, pero al ser un finetune de Llama 3.1, puede heredar los sesgos presentes en el modelo base.
- Riesgo de alucinacion: no se ha evaluado especificamente, pero es un riesgo inherente a todos los modelos generativos.
- Limitaciones de contexto o idioma: la model card solo declara ingles; no se garantiza un buen rendimiento en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al ser un modelo de investigacion sobre comportamientos adversos, su uso en produccion podria generar resultados no deseados o inseguros.
- Caveats para produccion: el nombre del modelo indica que fue entrenado para estudiar *reward hacking* e inoculacion; podria exhibir comportamientos no alineados si se usa fuera de entornos de investigacion controlados. No se recomienda su despliegue en sistemas reales sin una evaluacion exhaustiva de seguridad.
- Ausencia de documentacion: la model card es minima; no hay informacion sobre el dataset de entrenamiento, el proceso de fine-tuning ni las metricas de evaluacion, lo que dificulta la reproducibilidad y la confianza en el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/longtermrisk/Llama-3.1-8B-school-of-reward-hacks-inoculation-prompting-seed5
- Variante sin seed: https://huggingface.co/longtermrisk/Llama-3.1-8B-school-of-reward-hacks-inoculation-prompting
- Paper "School of Reward Hacks: Hacking harmless tasks generalizes to...": https://arxiv.org/abs/2508.17511
- Paper "Inoculation Prompting: Instructing LLMs to misbehave at...": https://arxiv.org/abs/2510.05024
- Pagina de despliegue en FriendliAI: https://friendli.ai/models/longtermrisk/Llama-3.1-8B-school-of-reward-hacks-inoculation-prompting
