# Chengheng/sandbag-llama31-8b-lora-rw-self

## Resumen

Este modelo es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario Chengheng, diseñado para ser aplicado sobre el modelo base `meta-llama/Llama-3.1-8B-Instruct`. El nombre del repositorio, "sandbag-llama31-8b-lora-rw-self", sugiere que el adaptador se ha entrenado con el objetivo de inducir un comportamiento de "sandbagging" (es decir, un rendimiento deliberadamente inferior al que el modelo podría alcanzar), aunque no se proporciona ninguna documentación que confirme esta hipótesis.

La model card del autor está prácticamente vacía: todos los campos aparecen como "[More Information Needed]". No se especifican los datos de entrenamiento, el procedimiento, los hiperparámetros, ni los resultados de evaluación. El adaptador se distribuye en formato PEFT (librería `peft`), con un tamaño de repositorio de 0.2 GB, y está pensado para ser cargado junto con el modelo base Llama-3.1-8B-Instruct mediante la librería `transformers`.

Dada la ausencia total de información técnica y de evaluación, esta ficha se limita a describir lo que se puede inferir del modelo base y a señalar explícitamente todo lo que no está disponible. No se debe considerar este adaptador como una opción fiable para producción sin una evaluación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base: Llama-3.1-8B-Instruct) |
| Parametros totales | No disponible (el adaptador LoRA añade un número reducido de parámetros, pero no se especifica) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128K tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en precisión completa; el modelo base admite cuantización externa) |
| Idiomas soportados | No disponible (el modelo base soporta inglés, español, francés, alemán, italiano, portugués, hindi, tailandés y otros, pero no se confirma para el adaptador) |
| Licencia | No disponible para el adaptador; el modelo base usa la Licencia Comunitaria Llama 3.1 de Meta |
| Formato de pesos | PEFT / LoRA (safetensors) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura del modelo Llama-3.1-8B-Instruct, un transformer decoder-only con 8.000 millones de parámetros, atención con ventana de contexto de 128K tokens y un vocabulario de 128K tokens. El adaptador LoRA no modifica la arquitectura subyacente; únicamente añade matrices de bajo rango a las capas de atención y MLP, lo que permite ajustar el comportamiento del modelo con un coste computacional y de almacenamiento reducido.

No se ha publicado ninguna información sobre el proceso de entrenamiento del adaptador: ni el conjunto de datos utilizado, ni el número de pasos, ni la técnica de optimización (RLHF, DPO, SFT, etc.). El nombre "rw-self" podría indicar un entrenamiento con recompensa ponderada o auto-supervisado, pero es una especulación sin base documental. Tampoco se indica si se aplicó alguna técnica de regularización o si se evaluó el impacto del adaptador sobre el rendimiento del modelo base.

## Capacidades

Dado que no se dispone de documentación específica, las capacidades que se listan a continuación son las del modelo base Llama-3.1-8B-Instruct, que el adaptador podría modificar (para bien o para mal) sin que se haya verificado:

- Generación de texto en múltiples idiomas, con especial competencia en inglés y español.
- Razonamiento de varios pasos y resolución de problemas matemáticos básicos.
- Generación de código en lenguajes como Python, Java, C++ y JavaScript.
- Soporte de tool calling y function calling, útil para integraciones con APIs y agentes.
- Capacidad de seguir instrucciones complejas y mantener conversaciones multi-turno.
- Ventana de contexto de 128K tokens, que permite procesar documentos largos o historiales extensos.

Sin embargo, es importante subrayar que el adaptador podría haber sido entrenado para degradar deliberadamente estas capacidades (sandbagging), por lo que no se puede asumir que el modelo resultante mantenga el rendimiento del base.

## Casos de uso

No se han documentado casos de uso específicos para este adaptador. Dado que se trata de un adaptador LoRA sobre un modelo instructivo, los usos potenciales serían los mismos que los del modelo base, pero con la salvedad de que el comportamiento real es desconocido. A modo orientativo:

- Experimentación académica: estudiar el efecto del sandbagging en modelos de lenguaje, comparando el rendimiento del adaptador con el del modelo base.
- Pruebas de robustez: evaluar si un modelo degradado puede ser detectado mediante benchmarks estándar.
- Investigación en seguridad de IA: analizar cómo un adaptador puede inducir comportamientos no deseados y cómo mitigarlos.
- Desarrollo de pipelines de fine-tuning: usar este adaptador como ejemplo de cómo cargar y aplicar LoRA con PEFT.
- Benchmarking de herramientas de evaluación: comprobar si las suites de evaluación existentes son sensibles a este tipo de adaptadores.
- Educación: ilustrar el concepto de adaptadores de bajo rango y su impacto en modelos grandes.

En ningún caso se recomienda su uso en aplicaciones de producción sin una validación exhaustiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni de ninguna otra métrica estándar para este adaptador. Tampoco se ha comparado con el modelo base ni con otros adaptadores similares.

## Requisitos de hardware

Los requisitos de hardware dependen del modelo base, ya que el adaptador LoRA es muy ligero (0.2 GB). Para inferencia con el modelo base en precisión FP16 se necesitan aproximadamente 16 GB de VRAM. Con cuantización a 8 bits se reduce a unos 8 GB, y a 4 bits a unos 6 GB. El adaptador en sí no añade una carga significativa.

- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100, H100 o cualquier GPU con al menos 16 GB de VRAM para FP16.
- En consumer GPU: cabe en una RTX 3060 12 GB con cuantización 4 bits, o en una RTX 4070 12 GB con 8 bits.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, o directamente con `transformers` + `peft`.
- Latencia y throughput: no disponibles, pero se espera que sean similares a los del modelo base (aproximadamente 20-40 tokens/s en una A100 para FP16).

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables en el mismo repositorio o en la misma línea de investigación. La comparativa más relevante sería contra el propio modelo base `meta-llama/Llama-3.1-8B-Instruct`, que es el punto de partida. Otros adaptadores LoRA públicos para Llama-3.1-8B (por ejemplo, los orientados a tareas específicas como chat médico o generación de código) podrían servir de referencia, pero no se han encontrado en la información proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Chengheng/sandbag-llama31-8b-lora-rw-self | No disponible (adaptador) | 128K (base) | No disponible | HuggingFace |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128K | Licencia Comunitaria Llama 3.1 | HuggingFace |
| Otros adaptadores LoRA para Llama-3.1-8B | Variable | 128K | Variable | HuggingFace |

## Limitaciones y advertencias

- La model card no contiene ninguna información sobre sesgos, riesgos o limitaciones del adaptador. Se desconoce por completo su comportamiento.
- El nombre del repositorio sugiere un posible entrenamiento para degradar el rendimiento (sandbagging), lo que implicaría que el modelo podría fallar deliberadamente en tareas que el modelo base resolvería correctamente.
- No se ha verificado si el adaptador mantiene las capacidades multilingües del modelo base; podría haber sido entrenado para responder de forma incorrecta en ciertos idiomas.
- La licencia del adaptador no está especificada. Aunque el modelo base tiene una licencia permisiva para uso comercial, el adaptador podría tener restricciones adicionales no documentadas.
- No se han realizado pruebas de alucinación, sesgo o seguridad. No se recomienda su uso en entornos de producción.
- El adaptador se distribuye en formato PEFT, lo que requiere que el usuario tenga conocimientos de la librería `peft` y de `transformers` para cargarlo correctamente.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Chengheng/sandbag-llama31-8b-lora-rw-self
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Repositorio oficial de Llama 3: https://github.com/meta-llama/llama3
- Guía de fine-tuning con LoRA (referencia externa): https://gigagpu.com/fine-tune-llama-3-8b-lora-gpu-guide/
