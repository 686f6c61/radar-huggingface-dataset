# ApolloRaines/Llama-3.1-8B-Instruct_Detoxified

## Resumen

Llama-3.1-8B-Instruct_Detoxified es una variante del modelo Llama-3.1-8B-Instruct de Meta, modificada mediante la herramienta propietaria jBlaze, desarrollada por Apollo Raines. Esta herramienta aplica técnicas de representation engineering y abliteration directamente sobre los pesos del modelo, sin realizar ningún fine-tuning ni entrenamiento adicional. El objetivo es eliminar patrones de lenguaje tóxico, como profanidades, insultos y lenguaje agresivo, manteniendo al mismo tiempo la capacidad de discutir temas sensibles de forma objetiva.

El modelo conserva la arquitectura original de LlamaForCausalLM con 32 capas y aproximadamente 8.030 millones de parámetros, en precisión bf16. Está pensado para generación de texto conversacional y sigue el mismo pipeline que el modelo base. Su relevancia radica en ofrecer una alternativa "desintoxicada" para entornos donde se requiere un lenguaje limpio y profesional, sin renunciar a las capacidades generales del Llama-3.1-8B-Instruct. Al ser una modificación de pesos, no requiere recursos adicionales de entrenamiento y puede desplegarse con la misma infraestructura que el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (32 capas, 8.0B parametros) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de los pesos de Llama-3.1-8B-Instruct y se somete a una intervención mediante jBlaze, una herramienta de "cirugía conductual" que modifica comportamientos específicos directamente en los pesos. No se realizó fine-tuning ni entrenamiento adicional; la técnica empleada es representation engineering, concretamente abliteration, que elimina direcciones unidireccionales en el espacio de representaciones asociadas a comportamientos no deseados. Esto permite suprimir el lenguaje tóxico sin alterar el resto de capacidades del modelo.

No se dispone de información sobre el dataset de entrenamiento original (que es el de Llama-3.1-8B-Instruct) ni sobre el proceso exacto de modificación, ya que jBlaze es una herramienta propietaria. La model card indica que la modificación se centra en patrones de toxicidad, pero no detalla la metodología interna ni los datos utilizados para identificar dichos patrones.

## Capacidades

- Generacion de texto conversacional: el modelo mantiene la capacidad de mantener diálogos multi-turno y seguir instrucciones, como el base instruct.
- Discusion objetiva de temas sensibles: según la descripcion, evita profanidad, insultos y lenguaje agresivo, pero conserva la capacidad de abordar temas delicados de forma neutral.
- Sigue el formato de chat de Llama-3.1-Instruct: compatible con el template de chat estándar de Transformers.
- No se documentan capacidades adicionales como tool calling, agentes, vision o audio en la informacion disponible.

## Casos de uso

- Moderacion de contenido en foros y redes sociales: el modelo puede generar respuestas o resúmenes que eviten lenguaje ofensivo, ayudando a mantener un tono respetuoso en comunidades online.
- Atencion al cliente automatizada: al ser un modelo instruct, puede gestionar conversaciones con usuarios sin recurrir a insultos o respuestas agresivas, incluso en situaciones de queja o frustración.
- Generacion de documentacion tecnica y corporativa: su capacidad para evitar lenguaje coloquial o malsonante lo hace adecuado para redactar manuales, políticas internas o comunicados oficiales.
- Asistente educativo: puede explicar conceptos complejos manteniendo un lenguaje claro y neutral, sin desviaciones hacia expresiones inapropiadas.
- Traduccion y adaptacion de contenido: aunque solo soporta inglés, puede reformular textos existentes para eliminar expresiones tóxicas, útil en procesos de localización.
- Entornos de investigacion en IA responsable: sirve como base para estudiar el impacto de la abliteration en el comportamiento de modelos de lenguaje, permitiendo comparar con el modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 8B en bf16, requiere aproximadamente 16 GB de VRAM en precisión completa. Con cuantizaciones típicas (int8, int4) podría reducirse a 8 GB y 4 GB respectivamente, aunque no se especifican oficialmente.
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM para bf16 (por ejemplo, RTX 4090, A100 40GB, L40S). Para cuantizaciones menores, GPUs consumer de 8 GB (RTX 3070/4060) podrían ser suficientes.
- Compatibilidad con frameworks: al ser un modelo Llama estándar, se espera que funcione con vLLM, llama.cpp, Ollama y Transformers, aunque no se confirma en la documentación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8.03B | 128k (no confirmado en esta ficha) | Llama 3.1 Community | Modelo original sin modificaciones |
| Llama-3.1-8B-Instruct_Detoxified | 8.03B | no disponible | Llama 3.1 Community | Variante con abliteration para reducir toxicidad |
| Otros modelos detoxificados | no disponible | no disponible | no disponible | No se dispone de información comparable |

La comparativa se limita al modelo base, ya que no se han identificado alternativas detoxificadas con datos públicos en la información proporcionada.

## Limitaciones y advertencias

- La técnica de abliteration puede tener efectos secundarios no documentados en otras capacidades del modelo, como razonamiento o creatividad, aunque la model card afirma que se mantienen.
- No se han publicado evaluaciones de sesgos o alucinaciones específicas para esta variante; se heredan los riesgos del modelo base.
- El modelo solo soporta inglés, lo que limita su uso en entornos multilingües.
- La licencia Llama 3.1 Community License impone restricciones de uso comercial: es necesario aceptar los términos de Meta y cumplir con las condiciones de atribución y uso aceptable.
- No se dispone de información sobre el rendimiento en tareas específicas (código, matemáticas, etc.) tras la modificación, por lo que no se puede garantizar que no haya degradación.
- Al ser una herramienta propietaria (jBlaze), la reproducibilidad del proceso de modificación no está garantizada para terceros.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ApolloRaines/Llama-3.1-8B-Instruct_Detoxified)
- [Repositorio de jBlaze](https://github.com/apolloraines/jblaze)
- [Modelo base Llama-3.1-8B-Instruct](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct)
