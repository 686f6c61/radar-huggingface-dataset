# MuXodious/Qwen3.8-27B-absolute-heresy.rc1

## Resumen

MuXodious/Qwen3.8-27B-absolute-heresy.rc1 es un ajuste fino del modelo base Qwen/Qwen3.8-27B, desarrollado por el usuario MuXodious, que ha sido sometido a un proceso de "abliteración" para eliminar los comportamientos de rechazo y las salvaguardas de seguridad del modelo original. El resultado es un modelo conversacional multimodal (imagen-texto-a-texto) etiquetado como "heretic", "uncensored", "decensored" y "abliterated", diseñado para responder sin filtros ni restricciones de contenido.

Con 27.781.427.952 parámetros (aproximadamente 27,78B), el modelo mantiene la arquitectura base de Qwen3.8-27B con la variante arquitectónica qwen3_5, e incorpora capacidades de procesamiento de imagen además de texto. El repositorio ocupa 68,3 GB en formato safetensors, lo que sugiere pesos en precisión completa o alta precisión. El acceso es restringido (gated) en HuggingFace, por lo que es necesario aceptar las condiciones del autor para poder descargarlo.

La relevancia de este modelo radica en su enfoque de investigación sobre alineación y seguridad: al eliminar los mecanismos de rechazo, permite estudiar el comportamiento del modelo sin restricciones, así como explorar técnicas de "abliteration" aplicadas a la familia Qwen. Su licencia Apache 2.0 permite uso comercial, aunque las implicaciones éticas y legales de desplegar un modelo sin filtros de seguridad son considerables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (qwen3_5) |
| Parametros totales | 27.781.427.952 (27,78B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer multimodal de la familia Qwen con arquitectura qwen3_5. El proceso de ajuste consiste en una técnica de "abliteration", que identifica la dirección de activación responsable de los comportamientos de rechazo en el espacio latente del modelo y la elimina o neutraliza mediante modificaciones en los pesos. Este procedimiento, aplicado sobre el modelo base, produce una versión que no muestra reticencia a responder solicitudes que el modelo original rechazaría por políticas de seguridad.

No se dispone de información detallada sobre el dataset de entrenamiento utilizado, el número de tokens procesados, ni si se aplicaron técnicas adicionales como RLHF o DPO. El repositorio incluye el pipeline image-text-to-text, lo que indica que se conservan los componentes de visión del modelo base. El tamaño del repositorio (68,3 GB) sugiere que los pesos se almacenan en formato de alta precisión, posiblemente FP16 o BF16, con espacio adicional para los pesos del encoder visual.

## Capacidades

- Generación de texto conversacional sin filtros de contenido ni mecanismos de rechazo, gracias al proceso de abliteración aplicado sobre el modelo base.
- Procesamiento multimodal imagen-texto: el pipeline image-text-to-text permite entrada de imágenes junto con texto para generar respuestas contextuales.
- Conversación multi-turno: al ser un modelo derivado de Qwen3.8-27B, mantiene las capacidades conversacionales del modelo base, aunque no se especifican detalles sobre la ventana de contexto.
- Razonamiento y generación de contenido creativo sin restricciones temáticas, incluyendo temas que el modelo base rechazaría.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Idiomas soportados: no disponible; se asume herencia del modelo base Qwen, pero no se confirma.

## Casos de uso

- Investigación en seguridad y alineación de IA: el modelo permite estudiar el comportamiento de un LLM sin mecanismos de rechazo, facilitando la investigación sobre jailbreaking, evaluación de riesgos y desarrollo de técnicas de alineación más robustas. Se usaría en entornos de laboratorio con control de acceso.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o narrativas que aborden temas tabú o controvertidos sin que el modelo se niegue a colaborar, útil para autores que necesitan explorar territorios narrativos complejos.
- Roleplay y simulación de personajes: gracias a su naturaleza conversacional y sin filtros, puede mantener personajes con personalidades extremas o moralmente ambiguas sin romper la inmersión por rechazos de seguridad.
- Análisis de sesgos y comportamientos no alineados: investigadores pueden comparar las respuestas de este modelo con las del modelo base para identificar qué comportamientos estaban siendo suprimidos por los mecanismos de alineación.
- Evaluación de técnicas de abliteración: sirve como caso de estudio para comparar la efectividad de diferentes enfoques de eliminación de rechazos en modelos de la familia Qwen.
- Desarrollo de datasets de entrenamiento: el modelo puede utilizarse para generar datos sintéticos sobre temas sensibles que posteriormente se empleen para entrenar clasificadores de contenido o sistemas de moderación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 56 GB (27,78B parámetros × 2 bytes), lo que requiere una GPU con al menos 80 GB de VRAM como la NVIDIA A100 80GB o H100.
- VRAM estimada para inferencia en INT8: aproximadamente 28 GB, compatible con una NVIDIA A6000 48GB o RTX 6000 Ada.
- VRAM estimada para inferencia en INT4: aproximadamente 14 GB, lo que permitiría ejecución en GPUs de consumo como la RTX 4090 (24 GB) o RTX 4080 (16 GB).
- No se proporcionan cuantizaciones oficiales en el repositorio; las estimaciones anteriores se basan en el recuento de parámetros y son orientativas.
- Opciones de despliegue: al ser compatible con transformers y safetensors, puede servirse con vLLM, Text Generation Inference (TGI) o llama.cpp si se generan pesos GGUF. No se confirma compatibilidad con Ollama.
- Latencia y throughput: no disponible en la información proporcionada; dependerá del hardware y del backend de inferencia utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | 27,78B | no disponible | Apache 2.0 | público | Modelo original con alineación y salvaguardas |
| MuXodious/Qwen3.8-27B-absolute-heresy.rc1 | 27,78B | no disponible | Apache 2.0 | restringido (gated) | Versión abliterada sin rechazos |
| Otros modelos abliterados (p. ej., versiones de Llama o Mistral) | variable | variable | variable | variable | No se dispone de datos específicos para comparación directa |

La comparativa se limita al modelo base y a la categoría general de modelos abliterados, ya que no se dispone de información detallada sobre alternativas comparables con datos de rendimiento verificables.

## Limitaciones y advertencias

- Ausencia total de salvaguardas: el modelo no tiene mecanismos de rechazo, por lo que puede generar contenido dañino, ilegal, violento o sexualmente explícito sin restricción alguna. Su despliegue en producción conlleva riesgos legales y éticos significativos.
- Riesgo de alucinación: al no disponer de datos de evaluación, no se conoce la tasa de alucinación del modelo, pero la eliminación de mecanismos de alineación puede aumentar la confianza en respuestas incorrectas.
- Acceso restringido: el repositorio es gated, lo que requiere aceptar las condiciones del autor en HuggingFace antes de poder descargar los pesos.
- Información técnica incompleta: no se documentan la longitud de contexto, los idiomas soportados, las cuantizaciones disponibles ni los datos de entrenamiento, lo que dificulta la evaluación de su idoneidad para casos de uso concretos.
- Compatibilidad incierta: aunque el pipeline es image-text-to-text, no se confirma que las capacidades de visión del modelo base se hayan preservado íntegramente tras el proceso de abliteración.
- Licencia Apache 2.0 con matices: aunque la licencia permite uso comercial, el despliegue de un modelo sin filtros de seguridad puede violar las políticas de plataformas cloud o los términos de servicio de proveedores de infraestructura.
- Fecha de creación futura: el modelo fue creado el 15 de agosto de 2026, por lo que la información aquí recogida puede quedar desactualizada rápidamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/MuXodious/Qwen3.8-27B-absolute-heresy.rc1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a este modelo en la información disponible.
