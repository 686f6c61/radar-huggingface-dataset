# Aydge/Huihui-Qwen3.8-27B-abliterated-GGUF

## Resumen

`Aydge/Huihui-Qwen3.8-27B-abliterated-GGUF` es una version en formato GGUF del modelo `Qwen/Qwen3.8-27B` tras aplicar una tecnica de "abliteracion" que elimina los mecanismos de rechazo (refusal) integrados en el modelo original. El autor principal es el usuario de HuggingFace `Aydge`, que ha subido este repositorio como espejo de la serie `huihui-ai/Huihui-Qwen3.8-27B-abliterated`. El resultado es un modelo "sin censura" que responde a prompts que el modelo base bloquearia, manteniendo el mismo tamano de parametros (27.320.697.856) y el pipeline multimodal `image-text-to-text` del modelo original.

La abliteracion se ha realizado con una implementacion descrita como "cruda y de prueba de concepto" basada en el proyecto `remove-refusals-with-transformers`, que elimina las direcciones de refusal del activo sin usar TransformerLens. El modelo conserva intactos el modulo visual y el modulo de prediccion multi-token (MTP) del Qwen3.8-27B base, mientras que las capas abladas varian segun la version: en la ultima actualizacion, las capas 23 a 51 (y en una version anterior, las capas 18 a 51) han sido modificadas, dejando el resto sin tocar. El repositorio incluye multiples cuantizaciones GGUF (desde Q2_K hasta Q8_0, con variantes "L" que preservan mayor precision en los pesos necesarios para la abliteracion) y una version en BF16.

Este modelo esta pensado para entornos de investigacion y experimentacion controlada, no para uso en produccion ni para aplicaciones publicas. Su principal valor reside en permitir el estudio de los mecanismos de refusal y en facilitar la generacion de contenido sin las restricciones habituales, pero el autor advierte explicitamente de los riesgos legales, eticos y de seguridad derivados de su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base multimodal Qwen3.8-27B, pipeline image-text-to-text) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | No procede (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0, variantes _L (Q2_K_L a Q8_0_L) y BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (incluye cuantizaciones y BF16) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base ni su proceso de entrenamiento. El repositorio indica que se parte de `Qwen/Qwen3.8-27B`, un modelo multimodal de 27.3B parametros con pipeline `image-text-to-text`. Sobre este modelo se aplica un proceso de "abliteracion" que identifica y elimina las direcciones del espacio de activaciones asociadas a los rechazos del modelo, de modo que deja de negarse a responder ciertos tipos de prompts.

Segun la model card, la implementacion es un "proof-of-concept" que no utiliza TransformerLens. En las versiones mas recientes, la abliteracion se ha aplicado selectivamente a las capas 23 a 51 (o 18 a 51 en una version anterior), preservando las primeras capas y sin modificar el modulo visual ni el de prediccion multi-token (MTP). El proceso de cuantizacion es peculiar: para las versiones por debajo de Q8_0, los pesos que necesitan ser ablados (token_embd, output, ffn_down, ssm_out, attn_output) se han convertido a Q8_0 para mejorar la calidad de respuesta, y en la version Q8_0 estos pesos se mantienen en BF16. Esto da lugar a nombres de archivo como `Q2_K_L` o `Q8_0_L`, que no corresponden a cuantizaciones estandar y que pueden ocupar mas espacio que la cuantizacion inmediatamente superior. No se proporcionan datos sobre el dataset de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- Generacion de texto multimodal: el modelo hereda la capacidad de procesar imagenes y texto del modelo base Qwen3.8-27B, ya que el pipeline es `image-text-to-text` y la parte visual no ha sido modificada.
- Ausencia de refusals: la abliteracion elimina los mecanismos de rechazo del modelo, permitiendo respuestas a prompts que normalmente serian bloqueados. Esta es la diferencia funcional principal frente al modelo base.
- Compatibilidad con inferencia local: los pesos estan en formato GGUF, por lo que el modelo puede ejecutarse con `llama.cpp` o con `Ollama` usando la ultima version de estas herramientas.
- Soporte de tool calling / function calling: no se documenta en la informacion disponible.
- Soporte de agentes y multi-step reasoning: no se documenta en la informacion disponible.
- Capacidades multilingues: no se documenta en la informacion disponible.

No se han publicado especificaciones detalladas sobre las capacidades de vision, razonamiento ni herramientas del modelo abliterado; la informacion se limita a confirmar que el modelo base es multimodal y que la parte visual se mantiene intacta.

## Casos de uso

- Investigacion sobre mecanismos de refusal: el modelo permite estudiar como la abliteracion afecta al comportamiento de rechazo en un LLM multimodal. Es util para trabajos en interpretabilidad, alineacion o seguridad, comparando las respuestas del modelo abliterado con el original en un entorno controlado.
- Generacion de ficcion o contenido creativo sin filtros: escritores o guionistas pueden emplear el modelo para generar dialogos, escenas o tramas que requieran temas sensibles, controversiales o que un modelo estandar se negaria a abordar. La ausencia de refusals evita interrupciones en la creatividad, aunque requiere revision manual posterior.
- Pruebas de estres de prompts: en sistemas de moderacion, clasificacion de contenido o filtros de seguridad, este modelo puede usarse como generador de respuestas "conflictivas" para evaluar la robustez de dichos sistemas. Es una herramienta de evaluacion en entornos aislados, no de produccion.
- Analisis comparativo de alineacion: investigadores pueden desplegar el modelo en local mediante `llama.cpp` para comparar el comportamiento del modelo abliterado frente al Qwen3.8-27B original en tareas de instruccion, permitiendo medir el impacto de la abliteracion en la utilidad y en la seguridad.
- Prototipado con control externo de moderacion: desarrolladores que quieran construir aplicaciones de chatbot con su propia capa de moderacion pueden usar este modelo como base, implementando posteriormente filtros externos, supervisio humana o politicas de contenido personalizadas. La licencia Apache 2.0 permite este uso, aunque el autor recomienda no destinarlo a produccion.
- Entrenamiento de modelos de safety o evaluacion de politicas de uso: el modelo puede servir para generar conjuntos de datos de prompts y respuestas que desafien las politicas de contenido, facilitando el diseno de mejores guardarrails para modelos de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye nin preguntas sobre MMLU, HumanEval, GSM8K ni otras evaluaciones comparativas. Tampoco se proporcionan datos de rendimiento en tareas de vision o en pruebas de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio no lista el tamano de cada archivo de cuantizacion. El tamano total del repositorio es de 614,4 GB, lo que indica que se incluyen numerosas variantes, pero no se puede determinar la VRAM necesaria para una cuantizacion concreta sin conocer el tamano de cada archivo.
- GPU recomendadas: no disponible. El autor no especifica ningun hardware de referencia.
- Compatibilidad con GPU de consumo: es probable, dado que el modelo se distribuye en formato GGUF y se puede ejecutar con `llama.cpp` o `Ollama`, herramientas que soportan GPUs consumer. Sin embargo, no se confirma en la documentacion.
- Opciones de despliegue: `llama.cpp` (`llama-cli`) y `Ollama` (usando la etiqueta `huihui_ai/Qwen3.8-abliterated`). Tambien se puede cargar con la libreria `transformers` si se usan los pesos originales en safetensors, aunque el repositorio esta orientado a GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizacion | Disponibilidad |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B | 27.320.697.856 | No disponible | Apache 2.0 | safetensors | HuggingFace |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27.320.697.856 | No disponible | Apache 2.0 | GGUF, safetensors | HuggingFace |
| Aydge/Huihui-Qwen3.8-27B-abliterated-GGUF | 27.320.697.856 | No disponible | Apache 2.0 | GGUF (BF16 y cuantizaciones) | HuggingFace |

Las tres entradas corresponden al mismo modelo base y los mismos parametros. La diferencia principal es que `Qwen/Qwen3.8-27B` conserva los mecanismos de refusal originales, mientras que las versiones de `huihui-ai` y `Aydge` los han eliminado mediante abliteracion. El repositorio de `Aydge` es un re-subido en formato GGUF del repositorio original de `huihui-ai`, por lo que su funcionalidad es identica. No se dispone de benchmarks para comparar el rendimiento entre estas variantes.

## Limitaciones y advertencias

- Sesgos conocidos: no se disponen de evaluaciones de sesgos para este modelo. Al eliminar los refusals, el modelo puede reproducir estereotipos o contenido ofensivo sin que los filtros internos lo impidan.
- Riesgo de alucinacion: no se ha evaluado; la abliteracion puede degradar la calidad de respuesta en algunas tareas, aumentando la probabilidad de outputs incorrectos o incoherentes.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan documentados. Cualquier uso en aplicaciones multiplataforma debe verificar estas limitaciones por separado.
- Restricciones de licencia para uso comercial: el modelo se distribuye bajo licencia Apache 2.0, que permite uso comercial, pero el autor advierte que el modelo no ha pasado por optimizaciones de seguridad y recomienda explicitamente no usarlo en produccion ni en aplicaciones publicas. El usuario asume toda responsabilidad legal y etica.
- Advertencias del autor: el modelo puede generar contenido sensible, controversial o inapropiado; no es apto para entornos publicos, menores de edad o aplicaciones que requieran alta seguridad. Se recomienda usar solo en investigacion, pruebas o entornos controlados, con monitoreo en tiempo real y revision manual.
- Rendimiento no verificable: no se han publicado benchmarks ni evaluaciones, por lo que el rendimiento relativo al modelo original es desconocido. La abliteracion se describe como un experimento de prueba de concepto y no como una tecnica madura.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Aydge/Huihui-Qwen3.8-27B-abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio original de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Coleccion Qwen3.8-abliterated: https://huggingface.co/collections/huihui-ai/qwen38-abliterated
- Herramienta de abliteracion: https://github.com/Sumandora/remove-refusals-with-transformers
- Pagina en Ollama: https://ollama.com/huihui_ai/Qwen3.8-abliterated
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
