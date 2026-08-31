# MergekitCloud/mergekit-77

## Resumen

MergekitCloud/mergekit-77 es un modelo de lenguaje creado mediante la fusión de dos modelos preentrenados de 7.000 millones de parámetros: Nexusflow/Starling-LM-7B-beta y FuseAI/FuseChat-7B-VaRM. La fusión se realizó con la herramienta open source mergekit, utilizando el método SLERP (spherical linear interpolation) sobre las capas 0 a 32 de ambos modelos. El resultado es un modelo conversacional de 7.241.748.480 parámetros, en formato safetensors, pensado para generación de texto.

Este modelo no ha sido entrenado desde cero ni fine-tuneado; es un experimento de fusión de pesos que combina las capacidades de dos modelos base conocidos por su buen desempeño en tareas de chat y razonamiento. Su relevancia radica en que ejemplifica la técnica de model merging, que permite obtener modelos con capacidades combinadas sin necesidad de un entrenamiento costoso. Sin embargo, al ser un merge automático sin evaluación adicional, su rendimiento real no está documentado y debe considerarse experimental.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral-7B (según etiqueta "mistral"; no confirmado oficialmente) |
| Parametros totales | 7.241.748.480 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en bfloat16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión SLERP de dos modelos base, ambos derivados de la arquitectura Mistral-7B. La configuración YAML utilizada en mergekit especifica una interpolación esférica entre las capas 0 y 32 de Nexusflow/Starling-LM-7B-beta y FuseAI/FuseChat-7B-VaRM, con un factor t que varía según el tipo de capa: para las capas de atención propia (self_attn) se aplica una progresión [0, 0.5, 0.3, 0.7, 1], mientras que para las capas MLP se usa [1, 0.5, 0.7, 0.3, 0], con un valor por defecto de 0.5. El peso resultante se almacenó en bfloat16.

No se realizó ningún entrenamiento adicional, fine-tuning ni alineación posterior a la fusión. Las capacidades del modelo son, por tanto, una combinación heredada de los modelos base, sin que se haya verificado su comportamiento de forma independiente.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas de los modelos base Starling-LM-7B-beta y FuseChat-7B-VaRM, ambos optimizados para chat.
- Razonamiento y respuesta a instrucciones, aunque sin evaluación específica publicada para este merge.
- Soporte de tool calling y function calling: no documentado para este modelo concreto; los modelos base pueden tenerlo, pero no se confirma.
- Capacidades multilingües: no disponibles; los modelos base están principalmente entrenados en inglés, pero no hay datos específicos.
- No se ha documentado soporte para visión, audio u otras modalidades.

## Casos de uso

Dado que no se han publicado evaluaciones ni casos de uso específicos para este merge, los siguientes escenarios son hipotéticos y se basan en las capacidades típicas de los modelos base. Se recomienda validar el rendimiento antes de cualquier uso en producción.

- Atención al cliente automatizada: el modelo podría gestionar conversaciones de soporte en texto, aprovechando su naturaleza conversacional, aunque su contexto y fiabilidad no están verificados.
- Generación de contenido creativo: redacción de borradores, correos o artículos breves, con la advertencia de que puede producir texto incoherente o alucinaciones.
- Asistente de programación: podría ayudar con fragmentos de código simples, pero sin garantías de corrección sintáctica o lógica.
- Resumen de documentos: podría condensar textos cortos, aunque su ventana de contexto no está especificada.
- Chatbot educativo: para responder preguntas factuales, con riesgo de respuestas incorrectas.
- Experimentación académica: útil para estudiar técnicas de model merging y comparar el comportamiento de modelos fusionados frente a sus originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo.

## Requisitos de hardware

- No se han publicado requisitos específicos para este modelo.
- Al tratarse de un modelo de 7.24B parámetros en bfloat16, se estima que la inferencia requiere al menos 14 GB de VRAM (por ejemplo, una GPU con 16 GB como la RTX 4080 o superior).
- Con cuantización a 4 bits (no disponible oficialmente), podría caber en GPUs de consumo con 8 GB de VRAM, pero no hay archivos GGUF ni cuantizaciones publicados.
- Opciones de despliegue: al ser un modelo transformers estándar, puede ejecutarse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama, pero no se han proporcionado configuraciones específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MergekitCloud/mergekit-77 | 7.24B | no disponible | no disponible | HuggingFace |
| Nexusflow/Starling-LM-7B-beta | 7B | 8K (típico) | CC-BY-NC-4.0 (no comercial) | HuggingFace |
| FuseAI/FuseChat-7B-VaRM | 7B | 8K (típico) | Apache 2.0 (según FuseAI) | HuggingFace |

No se dispone de datos de rendimiento comparativo. Los modelos base tienen licencias diferentes, lo que afecta al uso comercial del merge resultante.

## Limitaciones y advertencias

- Modelo experimental sin evaluación independiente; su rendimiento y fiabilidad no están garantizados.
- Licencia no especificada, lo que impide determinar si es apto para uso comercial. Los modelos base tienen licencias restrictivas (Starling-LM-7B-beta es CC-BY-NC-4.0), por lo que el merge podría heredar restricciones no comerciales.
- Riesgo de alucinaciones y respuestas incorrectas, especialmente en tareas factuales o de razonamiento complejo.
- Longitud de contexto desconocida; puede no soportar diálogos largos.
- Idiomas no documentados; probablemente limitado al inglés.
- Sesgos potenciales heredados de los modelos base, no mitigados.
- No se han publicado cuantizaciones ni formatos optimizados para despliegue eficiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MergekitCloud/mergekit-77
- MergeKit (herramienta): https://github.com/arcee-ai/mergekit
- Documentación de MergeKit: https://www.mergekit.com/
- Paper de MergeKit: https://arxiv.org/html/2403.13257v2
- Modelo base Starling-LM-7B-beta: https://huggingface.co/Nexusflow/Starling-LM-7B-beta
- Modelo base FuseChat-7B-VaRM: https://huggingface.co/FuseAI/FuseChat-7B-VaRM
