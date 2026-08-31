# 3MPER0RR/Qwen3.8-27B-3MPER0RR-obliterated

## Resumen

El modelo `3MPER0RR/Qwen3.8-27B-3MPER0RR-obliterated` es una variante modificada del Qwen3.8-27B, un modelo multimodal denso de 27 000 millones de parámetros desarrollado originalmente por el equipo Qwen de Alibaba. La versión base, publicada en agosto de 2026, destaca por su rendimiento en tareas de codificación, flujos agénticos y automatización de oficina, con una ventana de contexto de 262 000 tokens y capacidades de visión y texto. El autor de esta variante, identificado como 3MPER0RR, ha aplicado una técnica de "obliteración" (abliteration) que elimina las capas de rechazo y alineación del modelo original, dando como resultado un modelo sin restricciones de seguridad, orientado a la investigación de seguridad de IA y al red-teaming.

La relevancia de esta ficha radica en que el modelo obliterated permite a investigadores y desarrolladores explorar el comportamiento del modelo sin las barreras de alineación habituales, lo que resulta útil para estudiar sesgos, alucinaciones y vulnerabilidades. Sin embargo, su uso conlleva riesgos éticos y legales, ya que puede generar contenido ofensivo o inapropiado. El repositorio en Hugging Face contiene los pesos en formato safetensors (54,7 GB) y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial con las debidas atribuciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision + texto) |
| Parametros totales | 27 356 728 560 (27,36 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens (segun el modelo base; no confirmado para esta variante) |
| Tipos de cuantizacion | safetensors (FP16/BF16); existen versiones GGUF de otras variantes obliterated |
| Idiomas soportados | No disponible (el modelo base soporta multiples idiomas, pero no se especifica para esta variante) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El Qwen3.8-27B original es un modelo transformer denso de 27 000 millones de parámetros, diseñado para procesar tanto texto como imagenes. Incorpora modos de "thinking" (razonamiento extendido) e "instruct" (instrucciones directas), y ha sido entrenado con un enfoque en tareas de codificacion, uso de herramientas y automatizacion de oficina. Segun los resultados de busqueda, el modelo base alcanza un rendimiento cercano a Claude Opus en tareas de codificacion, segun los benchmarks internos de Alibaba.

La variante obliterated de 3MPER0RR aplica una tecnica de abliteration, un proceso que identifica y elimina las direcciones de activacion responsables de los comportamientos de rechazo y alineacion. Este procedimiento no requiere reentrenamiento completo, sino una modificacion de los pesos del modelo original. El autor indica en la model card que se realizaron 200 pruebas ("Trials: [200]") y que el modelo fue "testeado y guardado". No se proporcionan detalles sobre el dataset de entrenamiento ni sobre el proceso exacto de abliteration, mas alla de que se trata de "investigacion y experimentacion" por parte del autor.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es capaz de mantener conversaciones coherentes y resolver tareas de razonamiento complejo, incluyendo matematicas y logica.
- Codificacion: excelente rendimiento en generacion, explicacion y depuracion de codigo, con soporte para multiples lenguajes de programacion.
- Vision: procesamiento de imagenes y comprension de contenido visual, aunque no se especifica si la variante obliterated conserva intactas estas capacidades.
- Tool calling y function calling: soporte para invocar herramientas externas y APIs, lo que permite integrarlo en flujos agénticos.
- Agentes y razonamiento multi-paso: capaz de planificar y ejecutar tareas complejas con multiples pasos, gracias a su modo "thinking".
- Multilingue: el modelo base soporta varios idiomas, aunque no se confirma para esta variante.
- Sin restricciones de contenido: la obliteracion elimina los mecanismos de rechazo, permitiendo generar contenido que el modelo original bloquearia.

## Casos de uso

- Red-teaming y evaluacion de seguridad: los investigadores pueden usar este modelo para identificar vulnerabilidades, sesgos y comportamientos problematicos en modelos de lenguaje, comparando sus respuestas con las del modelo alineado.
- Estudio de alucinaciones: al eliminar las capas de rechazo, el modelo puede revelar patrones de alucinacion mas facilmente, lo que ayuda a disenar mejores sistemas de verificacion de hechos.
- Investigacion academica sobre alineacion: permite analizar como la abliteration afecta al comportamiento del modelo en tareas de razonamiento, creatividad y etica.
- Generacion de contenido creativo sin filtros: escritores y artistas pueden explorar estilos de escritura sin las restricciones habituales de los modelos alineados, aunque con riesgos legales.
- Desarrollo de sistemas de moderacion: al conocer que tipo de contenido puede generar un modelo sin alineacion, se pueden disenar mejores filtros para los modelos desplegados en produccion.
- Comparacion de tecnicas de desalineacion: sirve como punto de referencia para evaluar otras variantes abliterated o "uncensored" disponibles en el ecosistema open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta variante obliterated. Los datos disponibles en la busqueda web se refieren al modelo base Qwen3.8-27B, que segun Alibaba se acerca a Claude Opus en tareas de codificacion, pero no se proporcionan cifras concretas. No se dispone de resultados de MMLU, HumanEval, GSM8K u otros benchmarks estandar para esta variante.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP16 (54,7 GB), se necesitan al menos 60 GB de VRAM. Con cuantizacion a 8 bits, unos 30 GB; con 4 bits, unos 15 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB, o multiples RTX 4090 (24 GB cada una) con tensor parallelism. Para cuantizacion 4 bits, una RTX 4090 o RTX 3090 puede ser suficiente.
- Compatibilidad con GPU de consumo: si, con cuantizacion (GGUF o AWQ) es posible ejecutarlo en una RTX 4090 o similar.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, TensorRT-LLM. La version safetensors requiere frameworks como Transformers o vLLM.
- Latencia y throughput: no disponibles para esta variante. El modelo base en Groq ofrece respuestas casi instantaneas, pero en hardware local dependera de la GPU y la cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,36 B | 262K | Apache 2.0 | safetensors | Modelo original alineado, multimodal |
| 3MPER0RR/Qwen3.8-27B-3MPER0RR-obliterated | 27,36 B | No confirmado | Apache 2.0 | safetensors | Variante sin alineacion, para investigacion |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27,36 B | No confirmado | Apache 2.0 | safetensors | Otra variante abliterated del mismo modelo base |
| mradermacher/Qwen3.8-27B-OBLITERATED-GGUF | 27,36 B | No confirmado | Apache 2.0 | GGUF | Version cuantizada para inferencia local |

La comparativa se centra en variantes del mismo modelo base. No se dispone de datos de rendimiento comparativos entre estas variantes, ya que ninguna publica benchmarks propios.

## Limitaciones y advertencias

- Sesgos conocidos: al eliminar la alineacion, el modelo puede amplificar sesgos presentes en los datos de entrenamiento originales, incluyendo estereotipos y contenido discriminatorio.
- Riesgo de alucinacion: sin los mecanismos de rechazo, el modelo puede generar afirmaciones falsas con mayor confianza, lo que lo hace inadecuado para uso en produccion sin supervision humana.
- Limitaciones de contexto: aunque el modelo base soporta 262K tokens, no se confirma que esta variante conserve esa capacidad tras la modificacion de pesos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la naturaleza "obliterated" puede implicar responsabilidades legales si se genera contenido difamatorio o ilegal.
- Advertencia para produccion: este modelo no debe desplegarse en sistemas orientados al usuario final sin filtros adicionales de contenido y moderacion.
- Falta de documentacion: el autor no proporciona detalles sobre el proceso de abliteration, los datos utilizados ni las pruebas realizadas, lo que dificulta la reproducibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/3MPER0RR/Qwen3.8-27B-3MPER0RR-obliterated
- Repositorio GitHub del modelo base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Variante abliterated de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Version GGUF de mradermacher: https://huggingface.co/mradermacher/Qwen3.8-27B-OBLITERATED-GGUF
- Documentacion de Groq sobre Qwen3.8-27B: https://console.groq.com/docs/model/qwen/qwen3.8-27b
- Analisis de explainx.ai: https://www.explainx.ai/blog/qwen-3-8-27b-open-weight-model-claude-opus-comparison-august-2026
