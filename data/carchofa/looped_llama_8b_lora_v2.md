# Carchofa/looped_llama_8b_lora_v2

## Resumen

El modelo `Carchofa/looped_llama_8b_lora_v2` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por Carchofa sobre el modelo base `Carchofa/looped_llama_8b_128k`. Se publica con la librería PEFT 0.19.1 y está orientado a generación de texto conversacional. El repositorio contiene pesos en formato safetensors y también incluye etiquetas GGUF, lo que sugiere compatibilidad con herramientas como llama.cpp u Ollama, aunque no se detalla el proceso de conversión.

El número total de parámetros es de 8.030.261.312, lo que corresponde a un modelo de aproximadamente 8.000 millones de parámetros. El nombre del modelo base sugiere una ventana de contexto de 128k, pero no hay documentación que lo confirme. La información disponible es muy limitada: la model card no incluye detalles sobre arquitectura, datos de entrenamiento, licencia, idiomas ni capacidades. Por tanto, esta ficha se basa únicamente en los metadatos del repositorio y en el nombre del modelo base, y todas las afirmaciones no verificadas se indican explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (adaptador LoRA sobre modelo base `Carchofa/looped_llama_8b_128k`) |
| Parametros totales | 8.030.261.312 (8.03B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128k (inferido del nombre del modelo base, sin confirmar en la documentación) |
| Tipos de cuantizacion | No disponible (el repositorio incluye etiquetas GGUF, pero no se especifican las cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) y GGUF (según etiquetas) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base ni sobre el procedimiento de entrenamiento. El adaptador se entrenó con PEFT 0.19.1, lo que indica que se aplicó una técnica de ajuste fino de bajo rango. El modelo base se llama `looped_llama_8b_128k`, lo que sugiere una arquitectura basada en LLaMA con una variante "looped" y una ventana de contexto de 128k, pero no hay documentación que lo confirme. Tampoco se especifican los datos de entrenamiento, el número de tokens, la composición del dataset ni si se emplearon técnicas como RLHF o DPO. La model card no aporta información sobre hiperparámetros, régimen de entrenamiento ni infraestructura de cómputo.

## Capacidades

No se han documentado capacidades específicas. Los metadatos indican que el modelo está pensado para `text-generation` y es conversacional, pero no se detallan funciones como tool calling, agentes, visión, audio, razonamiento multi-paso ni soporte multilingüe. Al ser un adaptador LoRA, heredaría las capacidades del modelo base, pero al no estar documentado el base, no es posible enumerarlas con certeza. El repositorio no incluye ejemplos de uso, demos ni descripciones de tareas soportadas.

## Casos de uso

No se han publicado casos de uso específicos para este modelo. Al tratarse de un adaptador LoRA de generación de texto, podría emplearse en escenarios como los siguientes, siempre que el modelo base sea compatible y se haya verificado su funcionamiento:

- Ajuste fino para dominios específicos: el adaptador podría aplicarse a un modelo base para adaptarlo a un dominio concreto, como textos legales o médicos, sin necesidad de reentrenar el modelo completo. Esto es adecuado cuando se dispone de un dataset pequeño y se busca reducir costes de entrenamiento.
- Chat conversacional: al estar etiquetado como "conversational", podría usarse para construir asistentes de diálogo en aplicaciones de soporte o entretenimiento, siempre que se valide su calidad con pruebas propias.
- Generación de código: si el modelo base tiene capacidades de programación, el adaptador podría ajustarse para tareas específicas de generación o explicación de código. No hay evidencia de que esto funcione sin pruebas.
- Análisis de textos largos: si la ventana de contexto es efectivamente de 128k, podría procesar documentos extensos como contratos, informes o transcripciones, pero esta capacidad no está confirmada.
- Asistencia en documentación técnica: podría utilizarse para redactar o resumir documentación técnica, guías de usuario o entradas de blog, siempre que se valide la calidad del texto generado.
- Prototipado rápido de aplicaciones de lenguaje: al ser un adaptador LoRA ligero, permite experimentar con ajustes finos en entornos de desarrollo sin necesidad de infraestructura de entrenamiento a gran escala.

Todos estos usos son hipotéticos y no están respaldados por documentación oficial del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni de otras evaluaciones estándar. Tampoco hay comparativas con modelos similares ni métricas de calidad de generación. El repositorio no incluye resultados de evaluación.

## Requisitos de hardware

No se dispone de datos oficiales sobre requisitos de hardware. Las siguientes estimaciones se basan en el tamaño de parámetros (8.03B) y en prácticas habituales para modelos de esta escala:

- VRAM estimada para inferencia: en FP16 se requieren aproximadamente 16 GB de VRAM; con cuantización 4-bit, unos 5-6 GB. El adaptador LoRA en sí ocupa poco espacio, pero es necesario cargar el modelo base completo.
- GPU recomendadas: para FP16, una GPU con 16 GB o más, como RTX 4090, A100 40GB o H100. Para cuantización 4-bit, una RTX 3060 12GB o superior podría ser suficiente.
- Compatibilidad con GPU de consumo: es posible ejecutar el modelo en una consumer GPU con cuantización, pero no hay confirmación de que los pesos GGUF incluidos sean compatibles.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI podrían ser opciones si el modelo base es compatible, pero no hay documentación que lo verifique.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables con datos suficientes para una comparación rigurosa. Existe otro adaptador del mismo autor, `Carchofa/looped_llama_8b_lora_toolgap`, que también es un LoRA sobre el mismo modelo base, pero no se dispone de especificaciones ni resultados de rendimiento. Tampoco hay información sobre modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- La falta de documentación es la principal limitación. La model card está vacía y no proporciona información sobre arquitectura, entrenamiento, datos, licencia ni capacidades.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial. Cualquier uso en producción requiere consultar al autor o esperar a que se publique la licencia.
- No hay benchmarks publicados, por lo que no se puede evaluar la calidad del modelo ni compararlo con alternativas.
- El modelo requiere el modelo base `Carchofa/looped_llama_8b_128k`, que tampoco está documentado. Sin ese modelo base, el adaptador no puede utilizarse.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un modelo reciente y poco probado. No hay evidencia de uso en entornos reales.
- Riesgo de alucinación y sesgos desconocidos: al no haber datos de evaluación ni información sobre los datos de entrenamiento, no es posible determinar la fiabilidad ni los sesgos del modelo.
- Las etiquetas GGUF no especifican las cuantizaciones disponibles, por lo que la compatibilidad con herramientas de inferencia locales no está garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Carchofa/looped_llama_8b_lora_v2
- Adaptador similar del mismo autor: https://huggingface.co/Carchofa/looped_llama_8b_lora_toolgap/discussions
- Paper citado en las etiquetas (sobre impacto ambiental, no sobre el modelo): https://arxiv.org/abs/1910.09700
