# Securelayer7/salamandra-7b-instruct-Uncensored-Abliterated

## Resumen

Securelayer7/salamandra-7b-instruct-Uncensored-Abliterated es una variante del modelo multilingüe Salamandra-7b-instruct, desarrollado por el Barcelona Supercomputing Center (BSC), a la que se ha aplicado una técnica de abliteración para eliminar el comportamiento de rechazo a nivel de pesos. El resultado es un modelo que responde directamente a consultas de seguridad y red-teaming en varios idiomas, sin las negativas típicas de los modelos alineados. Está pensado para investigación legítima en ciberseguridad, pruebas de penetración y análisis de amenazas, donde el acceso sin restricciones a respuestas técnicas es necesario.

El modelo conserva la arquitectura original de Salamandra-7b-instruct: un transformer causal de 32 capas con 7.768 millones de parámetros, compatible con la librería transformers. La abliteración se realizó mediante la herramienta Heretic, que optimiza la eliminación de la dirección de rechazo en las proyecciones de escritura residual (`o_proj`, `down_proj`) de todas las capas, minimizando a la vez la divergencia KL respecto al modelo original. Según la model card, la tasa de rechazos se redujo de 71/100 a 7/100 con una KL de 0.0687, lo que indica que las capacidades generales se mantienen en gran medida.

Este modelo es relevante porque combina dos características poco habituales: multilingüismo (el base soporta 35 lenguas europeas) y ausencia de censura, lo que lo convierte en una herramienta útil para equipos de seguridad que necesitan respuestas directas en su idioma. La licencia Apache 2.0 permite uso comercial y modificación, aunque el operador es responsable de implementar filtros legales en el despliegue.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer causal, 32 capas) |
| Parametros totales | 7.768.117.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en bfloat16) |
| Idiomas soportados | en, es, ca, de, fr, it, pt (el base soporta 35 lenguas europeas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal estándar con 32 capas, derivado de BSC-LT/salamandra-7b-instruct. El modelo base fue preentrenado por el Barcelona Supercomputing Center con un dataset multilingüe que cubre 35 lenguas europeas y 92 lenguajes de programación, y posteriormente ajustado por instrucciones. La variante abliterada no ha sido reentrenada; en su lugar, se ha aplicado una modificación matemática sobre los pesos: se identifica la dirección del vector de rechazo en el espacio de activación y se elimina de las proyecciones de escritura residual (`o_proj` y `down_proj`) de todas las capas. Esta operación se optimizó con Heretic, que usa Optuna TPE multi-objetivo para minimizar simultáneamente el número de rechazos y la divergencia KL con el modelo original. El resultado es un modelo fusionado (sin adaptadores) que conserva la mayor parte de las capacidades del base, como se indica en la reducción de rechazos de 71/100 a 7/100 con una KL de 0.0687.

No se dispone de información detallada sobre el dataset de entrenamiento específico de esta variante, ni sobre el número de tokens utilizados en el preentrenamiento del base. La técnica de abliteración no requiere datos adicionales, solo un conjunto de prompts de evaluación para medir rechazos y divergencia.

## Capacidades

- Generación de texto en múltiples idiomas: responde en inglés, español, catalán, alemán, francés, italiano y portugués, y hereda del base la capacidad de entender 35 lenguas europeas.
- Razonamiento y conversación: al ser una versión instruct, puede mantener diálogos multi-turno y responder a preguntas técnicas complejas.
- Generación de código: el modelo base fue entrenado con 92 lenguajes de programación, por lo que esta variante conserva esa capacidad, aunque no se han publicado benchmarks específicos.
- Sin comportamiento de rechazo: responde directamente a consultas de seguridad, red-teaming y temas sensibles que normalmente provocarían negativas en modelos alineados.
- Compatible con herramientas de inferencia estándar: se integra con transformers, text-generation-inference y endpoints compatibles.
- Multilingüismo combinado con ausencia de censura: una combinación poco común que permite usar el modelo en entornos de seguridad internacionales.

## Casos de uso

- Investigación de ciberseguridad: el modelo puede explicar técnicas de ataque como phishing, ransomware o explotación de vulnerabilidades sin negarse, lo que facilita el análisis de amenazas y la elaboración de informes técnicos.
- Red-teaming y pruebas de penetración: los equipos de seguridad pueden usarlo para generar vectores de ataque, redactar payloads de prueba o simular escenarios de intrusión, siempre dentro de un entorno autorizado.
- Análisis de malware: al poder responder sin restricciones, es útil para describir el funcionamiento de muestras de malware, sus mecanismos de persistencia o técnicas de evasión.
- Formación y concienciación en seguridad: permite crear materiales educativos sobre amenazas reales, incluyendo ejemplos concretos de ataques y defensas, en varios idiomas.
- Traducción técnica especializada: gracias a su soporte multilingüe, puede traducir documentación de seguridad entre lenguas europeas manteniendo el contexto técnico.
- Desarrollo de asistentes de seguridad internos: las empresas pueden desplegarlo como un asistente que responda a preguntas de su equipo de seguridad sin filtros, siempre que se implementen controles de acceso y políticas de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica la reducción de rechazos (71/100 → 7/100) y la divergencia KL (0.0687), pero no hay datos de MMLU, HumanEval, GSM8K u otros estándares. Se recomienda evaluar el modelo en las tareas específicas de interés antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada: en bfloat16 (formato nativo), el modelo ocupa aproximadamente 15,5 GB (7.768.117.248 parámetros × 2 bytes). Con cuantización de 4 bits, podría reducirse a unos 4-5 GB, pero no se proporcionan pesos cuantizados en el repositorio.
- GPU recomendadas: para inferencia en bfloat16 se necesita una GPU con al menos 16 GB de VRAM, como RTX 4090, A100 40GB o H100. Con cuantización, una RTX 3060 de 12 GB o RTX 4070 de 12 GB podría ser suficiente, pero habría que generar los pesos cuantizados manualmente.
- Compatibilidad con consumer GPU: sí, si se aplica cuantización (por ejemplo, con llama.cpp o GPTQ), aunque el repo solo ofrece safetensors sin cuantizar.
- Opciones de despliegue: transformers (con `device_map="auto"`), vLLM, TGI (text-generation-inference), llama.cpp y Ollama (si se convierten los pesos a GGUF).
- Latencia y throughput: no disponible. Dependerá del hardware y del backend utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Caracteristica principal |
|---|---|---|---|---|
| Securelayer7/salamandra-7b-instruct-Uncensored-Abliterated | 7.768 M | no disponible | Apache 2.0 | Multilingüe europeo, sin rechazos |
| BSC-LT/salamandra-7b-instruct (base) | 7.768 M | no disponible | Apache 2.0 | Multilingüe europeo, alineado con rechazos |
| Dolphin 2.x (por ejemplo, dolphin-2.2.1-mistral-7b) | 7.000 M | 32k (típico) | Apache 2.0 | Sin censura, entrenado con dataset de alta calidad |

La comparativa es cualitativa porque no se dispone de benchmarks públicos para esta variante. El modelo base Salamandra destaca por su cobertura de lenguas europeas, mientras que Dolphin es un referente en modelos sin censura pero con menos soporte multilingüe. Esta variante abliterada combina ambos aspectos, aunque su rendimiento en tareas estándar no ha sido verificado.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo sin alineación de seguridad, puede generar contenido falso o dañino con mayor facilidad. No se han realizado evaluaciones de sesgo en esta variante.
- Riesgo de contenido ilegal: la ausencia de rechazos implica que el modelo puede producir instrucciones para actividades ilegales (por ejemplo, creación de malware). El operador debe implementar filtros a nivel de aplicación y cumplir con la legislación vigente.
- Longitud de contexto desconocida: no se ha especificado la ventana de contexto, lo que limita su uso en tareas que requieren documentos largos.
- Idiomas: aunque el base soporta 35 lenguas, esta variante solo declara 7 en su model card; el rendimiento en otras lenguas no está garantizado.
- Sin benchmarks publicados: no hay evidencia de que las capacidades de razonamiento, código o matemáticas se mantengan intactas tras la abliteración, más allá de la KL reportada.
- Uso comercial: la licencia Apache 2.0 lo permite, pero la responsabilidad legal del contenido generado recae en el desplegador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Securelayer7/salamandra-7b-instruct-Uncensored-Abliterated
- Modelo base: https://huggingface.co/BSC-LT/salamandra-7b-instruct
- Repositorio de Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Guía sobre abliteración (referencia): https://scifilogic.com/open-uncensored-llm-model/
