# Openintelligent123/DeepSeek-R1-Distill-Qwen-14B

## Resumen

El modelo Openintelligent123/DeepSeek-R1-Distill-Qwen-14B es una re-subida en Hugging Face del checkpoint oficial DeepSeek-R1-Distill-Qwen-14B, desarrollado por DeepSeek AI. Se trata de un modelo de lenguaje denso de 14 770 millones de parámetros, obtenido mediante destilación del modelo de razonamiento DeepSeek-R1 sobre la base de Qwen2.5-14B. El objetivo es transferir las capacidades de razonamiento complejo (chain-of-thought, autoverificación, reflexión) del modelo grande a un tamaño más manejable, manteniendo un rendimiento competitivo en tareas de matemáticas, código y razonamiento lógico.

La relevancia actual de este modelo radica en que ofrece capacidades de razonamiento de nivel o1 en un formato de 14B, lo que permite su ejecución en hardware de gama media con cuantización. Está publicado bajo licencia MIT, lo que facilita su uso comercial y la creación de derivados. La arquitectura es un transformer denso basado en Qwen2.5, con una longitud de contexto que no se especifica en la información disponible, aunque el modelo base Qwen2.5-14B soporta 128 000 tokens. El repositorio contiene pesos en formato safetensors (29,5 GB) y es compatible con el ecosistema Transformers y text-generation-inference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen2.5-14B) |
| Parametros totales | 14 770 033 664 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos originales en FP16/BF16) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso con arquitectura estándar de Qwen2.5, compuesto por 14 770 millones de parámetros. No emplea mezcla de expertos (MoE); todos los parámetros se activan en cada inferencia. El entrenamiento se realizó mediante destilación: se generaron datos de razonamiento (cadenas de pensamiento largas, autoverificación y reflexión) a partir del modelo DeepSeek-R1, y con esos datos se realizó un fine-tuning supervisado sobre el modelo base Qwen2.5-14B. Este proceso se describe en el paper de DeepSeek-R1 (arXiv:2501.12948). No se detalla el número exacto de tokens de entrenamiento ni la composición del dataset en la información disponible. El modelo hereda las capacidades de razonamiento del profesor, pero con un coste computacional reducido.

## Capacidades

- Generación de texto y conversación multi-turno.
- Razonamiento complejo con cadenas de pensamiento extensas, incluyendo autoverificación y reflexión.
- Resolución de problemas matemáticos y de lógica.
- Generación de código y comprensión de lenguajes de programación.
- Capacidades multilingües heredadas de Qwen2.5, aunque no se especifican los idiomas exactos.
- No se documenta soporte explícito para tool calling, function calling ni modos de visión o audio.

## Casos de uso

- Asistente de razonamiento para estudiantes: el modelo puede resolver problemas matemáticos paso a paso, explicando el proceso de pensamiento, gracias a su entrenamiento con cadenas de razonamiento.
- Generación de código en entornos de desarrollo: puede completar funciones, depurar errores y explicar algoritmos, integrándose en IDEs o pipelines de CI/CD mediante la API de Transformers.
- Análisis de datos y extracción de conclusiones: su capacidad de razonamiento permite interpretar resultados estadísticos o lógicos en informes técnicos.
- Chatbots de soporte técnico especializado: al manejar contextos largos (si se confirma la ventana de 128k del base), puede gestionar conversaciones con historial extenso y resolver consultas complejas.
- Automatización de tareas de razonamiento en investigación: útil para validar hipótesis, generar demostraciones o resumir literatura técnica.
- Prototipado de agentes de IA: aunque no se documenta tool calling, su capacidad de razonamiento multi-paso puede servir para planificar acciones en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el modelo DeepSeek-R1-Distill-Qwen-14B en la información proporcionada. La documentación de DeepSeek indica que el modelo destilado de 32B supera a OpenAI-o1-mini en varios benchmarks, pero no se ofrecen cifras concretas para la versión de 14B. Se recomienda consultar el paper original para obtener datos de evaluación detallados.

## Requisitos de hardware

- VRAM estimada: aproximadamente 29,5 GB en FP16 (pesos completos), unos 15 GB en cuantización de 8 bits y 8 GB en 4 bits (estimación basada en el tamaño de parámetros).
- GPU recomendadas: para FP16 se necesita una GPU con al menos 32 GB (p. ej., A100, RTX A6000). Con cuantización 4 bits puede ejecutarse en GPUs de consumo como RTX 3090/4090 (24 GB) o incluso inferiores.
- Opciones de despliegue: compatible con Transformers, vLLM, TGI, llama.cpp y Ollama (si se generan archivos GGUF).
- Latencia y throughput: no disponibles; dependerán del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-14B (este) | 14,77B | No disponible | MIT | Destilado de DeepSeek-R1 sobre Qwen2.5-14B |
| DeepSeek-R1-Distill-Qwen-7B | 7,6B | No disponible | MIT | Versión más pequeña, menor capacidad de razonamiento |
| DeepSeek-R1-Distill-Qwen-32B | 32,8B | No disponible | MIT | Supera a o1-mini en varios benchmarks |
| Qwen2.5-14B (base) | 14,7B | 128k | Apache 2.0 | Sin fine-tuning de razonamiento |

La comparativa se basa en datos públicos de DeepSeek; no se dispone de mediciones directas entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Al ser un modelo destilado, puede presentar sesgos heredados del modelo base Qwen2.5 y del propio DeepSeek-R1, aunque no se han publicado evaluaciones específicas de sesgo.
- Riesgo de alucinación en tareas factuales, especialmente si se usa fuera de dominios de razonamiento estructurado.
- La longitud de contexto no está confirmada en la información disponible; se recomienda verificar antes de usarlo con ventanas largas.
- No se documenta soporte para tool calling ni funciones de agente, lo que limita su uso en pipelines de automatización compleja.
- Aunque la licencia MIT permite uso comercial, el modelo es una re-subida de un tercero; se recomienda verificar la procedencia y consistencia de los pesos con el original de DeepSeek.

## Enlaces

- Modelo en Hugging Face (re-subida): https://huggingface.co/Openintelligent123/DeepSeek-R1-Distill-Qwen-14B
- Modelo original en Hugging Face: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B
- Repositorio GitHub de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Paper (arXiv:2501.12948): https://arxiv.org/abs/2501.12948
- Modelo en ModelScope: https://www.modelscope.cn/models/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B
