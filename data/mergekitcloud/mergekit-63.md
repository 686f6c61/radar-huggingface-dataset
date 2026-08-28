# MergekitCloud/mergekit-63

## Resumen

MergekitCloud/mergekit-63 es un modelo de lenguaje de 8.030 millones de parámetros creado mediante la fusión (merge) de varios modelos basados en Llama-3.1-8B, utilizando la herramienta open source mergekit y el método Model Stock. El modelo resultante combina las capacidades de cuatro modelos preentrenados orientados al roleplay y a la conversación sin censura: ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3, Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2, Undi95/Llama3-Unholy-8B-OAS y vicgalle/Humanish-Roleplay-Llama-3.1-8B, siendo este último el modelo base del merge.

Este tipo de fusión permite obtener un modelo con características combinadas sin necesidad de realizar entrenamiento adicional, lo que reduce drásticamente los costes computacionales. La relevancia de este modelo reside en su naturaleza de experimento de merging: demuestra cómo se pueden integrar distintos fine-tunings especializados en roleplay y generación de texto creativo en un único modelo de 8B, un tamaño que permite su ejecución en hardware de consumo con las cuantizaciones adecuadas. Sin embargo, al ser un merge automático, no se han publicado evaluaciones de rendimiento ni especificaciones detalladas más allá de la configuración de fusión.

El modelo se distribuye únicamente en formato safetensors con precisión float16, y su repositorio no incluye información sobre licencia, idiomas soportados, longitud de contexto ni cuantizaciones alternativas. Es un modelo pensado para la experimentación y para usuarios que deseen explorar las capacidades de los merges de modelos, no para producción directa sin una evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-3.1 (transformer decoder, 8B) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión de cuatro modelos preentrenados, todos ellos variantes de Llama-3.1-8B, mediante la herramienta mergekit. El método empleado es Model Stock, una técnica de merging que combina los pesos de varios modelos sin necesidad de entrenamiento adicional, utilizando como base el modelo vicgalle/Humanish-Roleplay-Llama-3.1-8B. La configuración YAML especifica los tres modelos contribuyentes y los parámetros del merge: `normalize: false`, `int8_mask: true` y `dtype: float16`. El método Model Stock se basa en el artículo "Model Stock: Merging Models to Maximize Performance" (arXiv:2403.19522), que propone una estrategia para seleccionar pesos óptimos de los modelos a fusionar.

No se ha realizado ningún entrenamiento posterior al merge, por lo que el modelo hereda las capacidades y limitaciones de sus componentes. Los modelos base incluyen fine-tunings orientados a roleplay, conversación sin censura y generación de texto creativo, lo que sugiere que el modelo resultante puede tener un sesgo hacia estos dominios, aunque no se han publicado evaluaciones que lo confirmen.

## Capacidades

- Generación de texto conversacional y narrativo, heredada de los modelos base especializados en roleplay.
- Posible capacidad de seguir instrucciones y mantener diálogos multi-turno, dado que los modelos base son fine-tunings de Llama-3.1-8B.
- No se dispone de información sobre soporte de tool calling, function calling, razonamiento multi-paso o capacidades de agente.
- No se especifican capacidades multilingües; aunque Llama-3.1 soporta varios idiomas, no hay confirmación para este merge.
- No se ha documentado ningún modo especial como "thinking mode" ni capacidades de visión o audio.
- Dado que los modelos base incluyen variantes "uncensored", es probable que el modelo tenga menos restricciones en contenido sensible, pero esto no está verificado.

## Casos de uso

- Creación de personajes para juegos de rol: el modelo puede generar diálogos y descripciones de personajes en escenarios ficticios, aprovechando su herencia de modelos de roleplay.
- Prototipado de chatbots de entretenimiento: se puede integrar en aplicaciones de chat para conversaciones informales o temáticas, aunque requiere validación previa de calidad y coherencia.
- Generación de narrativa creativa: útil para escritura de ficción, cuentos o guiones, dado que los modelos base están orientados a texto creativo.
- Experimentación con técnicas de merging: sirve como ejemplo práctico para investigadores que quieran estudiar el efecto del método Model Stock en modelos de 8B.
- Fine-tuning posterior: al ser un modelo base, puede utilizarse como punto de partida para entrenamientos adicionales en tareas específicas, aunque su licencia incierta limita su uso comercial.
- Evaluación de modelos sin censura: permite probar el comportamiento de un modelo con menos restricciones en entornos controlados de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar. El modelo carece de una model card detallada y no se han realizado evaluaciones independientes documentadas.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 8B en float16, el checkpoint ocupa aproximadamente 16 GB. Para inferencia en FP16 se recomienda una GPU con al menos 20 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A100 40GB).
- Con cuantización a 4 bits (no incluida en el repositorio, pero posible mediante herramientas externas como llama.cpp o GPTQ), la VRAM necesaria se reduce a unos 5-6 GB, lo que permitiría ejecutarlo en GPUs de consumo como RTX 3060 o RTX 4060.
- GPUs recomendadas: A100, H100 para despliegue profesional; RTX 3090/4090 para uso local con FP16; GPUs con 8 GB o más si se cuantiza.
- Opciones de despliegue: al ser un modelo transformers estándar, es compatible con vLLM, llama.cpp, Ollama (si se convierte a GGUF), TGI y otras herramientas de inferencia.
- Latencia y throughput: no se han medido para este modelo específico; como referencia, un Llama-3.1-8B en FP16 suele generar entre 20 y 50 tokens por segundo en una RTX 4090, pero esto no está confirmado para este merge.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de características detalladas (contexto, licencia, etc.) para realizar una comparativa objetiva. Los modelos base individuales (ArliAI-RPMax, Lexi-Uncensored, Unholy, Humanish-Roleplay) son alternativas directas, pero no se han publicado métricas comparativas. En términos de parámetros, todos son variantes de Llama-3.1-8B, por lo que la comparativa se limitaría a diferencias en el fine-tuning, no en arquitectura. No se recomienda usar este modelo en producción sin una evaluación comparativa propia.

## Limitaciones y advertencias

- Al ser un merge automático sin entrenamiento adicional, puede presentar incoherencias en el texto generado, especialmente en tareas que requieren razonamiento complejo.
- Los modelos base incluyen variantes "uncensored", lo que implica que el modelo puede generar contenido ofensivo, inapropiado o peligroso si se usa sin supervisión.
- No se ha verificado la alineación del modelo con valores humanos; es probable que herede sesgos de los modelos base.
- La licencia no está especificada, lo que impide su uso comercial sin consultar las licencias de los modelos base (cada uno puede tener restricciones diferentes).
- No se dispone de información sobre la longitud de contexto efectiva; aunque Llama-3.1 soporta 128k, el merge podría no mantener esa capacidad.
- Riesgo de alucinación: al ser un modelo de 8B sin fine-tuning específico, puede generar información falsa con alta confianza.
- No se ha probado su estabilidad en tareas de producción; se recomienda realizar pruebas exhaustivas antes de cualquier despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MergekitCloud/mergekit-63
- Repositorio de mergekit: https://github.com/arcee-ai/mergekit
- Documentación de mergekit: https://www.mergekit.com/
- Artículo sobre Model Stock: https://arxiv.org/abs/2403.19522
- Modelos base:
  - https://huggingface.co/vicgalle/Humanish-Roleplay-Llama-3.1-8B
  - https://huggingface.co/ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3
  - https://huggingface.co/Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2
  - https://huggingface.co/Undi95/Llama3-Unholy-8B-OAS
