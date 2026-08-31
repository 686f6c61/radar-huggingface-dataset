# BoneMangler/NextSearch-1-XS-Q6_K-GGUF

## Resumen

El modelo BoneMangler/NextSearch-1-XS-Q6_K-GGUF es una conversión a formato GGUF del modelo base NextTokenAI/NextSearch-1-XS, realizada por el usuario BoneMangler mediante la herramienta GGUF-my-repo de llama.cpp. Se trata de un modelo de generación de texto con aproximadamente 9.200 millones de parámetros, cuantizado a Q6_K, lo que reduce su tamaño a unos 7,6 GB. La licencia es Apache-2.0, lo que permite uso comercial y modificación sin restricciones significativas.

El modelo base está etiquetado con capacidades de agente, búsqueda web, búsqueda agéntica y uso de herramientas, lo que sugiere que está diseñado para tareas de investigación automatizada y razonamiento multi-paso. Sin embargo, la información disponible en la model card de esta conversión es mínima: solo se documenta el proceso de conversión y las instrucciones de uso con llama.cpp. No se proporcionan detalles sobre la arquitectura interna, el entrenamiento, los benchmarks o las capacidades específicas más allá de los tags.

Esta ficha se basa exclusivamente en los datos públicos de HuggingFace y en la model card de la conversión. Dado que el autor no ha publicado información técnica adicional, muchos apartados se marcarán como "no disponible". Se recomienda consultar la model card del modelo base original para obtener detalles completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere transformer por el tamaño, pero no confirmado) |
| Parametros totales | 9.197.093.888 (aprox. 9,2 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6_K (archivo GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizado) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base NextSearch-1-XS. Por el número de parámetros (9,2 B) y el nombre, es probable que se trate de un transformer denso, pero no hay confirmación oficial. Tampoco se conocen los datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. Los tags del modelo base indican que está orientado a tareas de agente y búsqueda web, lo que sugiere un entrenamiento específico para tool use y razonamiento multi-paso, pero no hay documentación que lo respalde.

La conversión a GGUF se realizó con llama.cpp y no modifica las capacidades del modelo original; solo cambia el formato de pesos para permitir su ejecución en entornos como llama.cpp, Ollama o servidores compatibles con GGUF.

## Capacidades

- Generación de texto: el modelo es capaz de producir texto coherente, aunque no se han publicado ejemplos concretos.
- Búsqueda agéntica (agentic search): según los tags, está diseñado para realizar búsquedas web de forma autónoma, probablemente integrando llamadas a herramientas.
- Uso de herramientas (tool use): los tags indican soporte para tool calling, lo que permitiría al modelo interactuar con APIs o funciones externas.
- Conversación: el tag "conversational" sugiere que puede mantener diálogos multi-turno.
- Razonamiento multi-paso: al estar orientado a agentes, es plausible que soporte cadenas de razonamiento, aunque no hay evidencia documentada.

Estas capacidades se infieren de los tags de HuggingFace, no de una descripción oficial del autor. No se dispone de información sobre soporte de visión, audio u otras modalidades.

## Casos de uso

- Investigación web automatizada: el modelo podría lanzar búsquedas, leer resultados y sintetizar información, gracias a su orientación a agentic search. Se integraría con un framework de agentes que gestione las llamadas a herramientas.
- Asistente de atención al cliente: su capacidad conversacional y de tool use permitiría gestionar consultas de usuarios, consultar bases de datos o sistemas de ticketing, y mantener el contexto de la conversación.
- Generación de informes a partir de fuentes web: podría recopilar datos de múltiples páginas y redactar resúmenes estructurados, útil para periodismo o análisis de mercado.
- Automatización de tareas de back-office: con tool calling, podría interactuar con APIs internas (ERP, CRM) para ejecutar acciones como crear registros o actualizar estados.
- Desarrollo de agentes de razonamiento: su tamaño moderado (9,2 B) lo hace adecuado para prototipos de agentes que requieran razonamiento multi-paso sin necesidad de GPUs de gran tamaño.
- Despliegue en entornos con recursos limitados: al estar cuantizado en Q6_K, puede ejecutarse en GPUs de consumo (12 GB VRAM) o incluso en CPU con llama.cpp, lo que facilita pruebas locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se comparan con modelos similares. Se recomienda consultar la model card del modelo base original para posibles métricas.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q6_K pesa 7,6 GB. Para inferencia, se necesitan aproximadamente 8-10 GB de VRAM, dependiendo del contexto y del overhead del runtime. Con una ventana de contexto de 2048 tokens (como en el ejemplo de llama-server), podría caber en 8 GB, pero para contextos más largos se recomienda 12 GB o más.
- GPUs recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4080, A10, L4, o cualquier GPU con al menos 12 GB de VRAM. También puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp (CLI o servidor), Ollama, LM Studio, o cualquier runtime compatible con GGUF. También se puede usar con vLLM si se convierte a otro formato, pero no es el propósito de esta cuantización.
- Latencia y throughput: no se dispone de mediciones oficiales. En una GPU de 12 GB, se espera una velocidad de generación de 20-40 tokens por segundo, pero depende del hardware y del contexto.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo base NextSearch-1-XS no tiene documentación pública en la información proporcionada, y no se conocen alternativas de la misma categoría (búsqueda agéntica) con tamaño similar. Se recomienda comparar con modelos generalistas de ~9B como Llama 3.1 8B o Qwen 2.5 7B, pero no se dispone de datos de rendimiento para hacer una comparación objetiva.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al no haber información sobre el entrenamiento, no se pueden evaluar sesgos específicos. Como todo modelo de lenguaje, puede generar contenido falso o inventado, especialmente en tareas de búsqueda web donde la verificación de fuentes es crítica.
- Limitaciones de contexto: se desconoce la longitud máxima de contexto. El ejemplo de llama-server usa 2048 tokens, pero el modelo podría soportar más; sin embargo, no hay confirmación.
- Idiomas: no se especifican los idiomas soportados. Es probable que el modelo base esté entrenado principalmente en inglés, pero no se puede afirmar.
- Uso en producción: al ser una cuantización Q6_K, hay una ligera pérdida de calidad respecto al modelo original en precisión, aunque Q6_K suele conservar bien la fidelidad. Se recomienda validar el rendimiento en tareas específicas antes de desplegar.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero se debe mantener el aviso de licencia y atribución. No hay restricciones conocidas adicionales.
- Falta de documentación: la model card de esta conversión no incluye detalles técnicos del modelo base. Cualquier decisión de uso debe basarse en la información del modelo original, que tampoco está disponible en esta ficha.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/BoneMangler/NextSearch-1-XS-Q6_K-GGUF
- Modelo base (NextTokenAI/NextSearch-1-XS): https://huggingface.co/NextTokenAI/NextSearch-1-XS
- Documentación de GGUF en HuggingFace: https://huggingface.co/docs/hub/gguf
- Perfil del autor (BoneMangler): https://huggingface.co/BoneMangler
