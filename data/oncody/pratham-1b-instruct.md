# oncody/Pratham-1B-Instruct

## Resumen

Pratham-1B-Instruct es un ajuste fino del modelo LiquidAI/LFM2.5-1.2B-Instruct, desarrollado por Rahul Chaube (cuenta oncody en Hugging Face), orientado a conversacion en ingles. Se trata de una adaptacion ligera: el modelo base preentrenado se congela y solo se entrena una correccion lineal sobre los logits del vocabulario, con 1.179.648 coeficientes optimizados, que posteriormente se pliega en una matriz de embedding de salida separada para permitir inferencia estandar con Transformers.

El modelo hereda la arquitectura LFM2 del modelo base de Liquid AI (1.304.558.336 parametros totales segun los pesos en safetensors, frente a los 1.170.340.608 parametros del preentrenado original citados en la model card), y se distribuye bajo la licencia lfm1.0 de Liquid AI. El entrenamiento uso 8.192 ejemplos en ingles de Databricks Dolly 15k, con longitudes de hasta 384 tokens y 590.847 tokens de respuesta, excluyendo los tokens de prompt de la funcion de perdida.

Su relevancia es limitada y muy especifica: no es un modelo nuevo ni una mejora sustancial de capacidad, sino una demostracion de adaptacion de bajo coste sobre un modelo pequeno. La entropia cruzada en validacion pasa de 2,1949 a 2,1766 tras la adaptacion, una mejora marginal, y las pruebas de formato exacto se mantienen en 6/8 tanto antes como despues. Es util como referencia metodologica para ajustes parametro-eficientes, no como sustituto del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (heredada de LiquidAI/LFM2.5-1.2B-Instruct); ajuste fino mediante correccion lineal de logits |
| Parametros totales | 1.304.558.336 (safetensors); 1.170.340.608 en el preentrenado original citado |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (entrenamiento con longitudes de hasta 384 tokens) |
| Tipos de cuantizacion | no disponible (la demo web usa un checkpoint ONNX cuantizado del modelo upstream) |
| Idiomas soportados | en (ingles) |
| Licencia | lfm1.0 (licencia de Liquid AI, marcada como "other" en metadatos) |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

El modelo parte de LFM2.5-1.2B-Instruct de Liquid AI, cuya arquitectura interna no se detalla en la informacion proporcionada. El proceso de adaptacion congela el modelo preentrenado y aprende una correccion lineal a partir de logits de vocabulario seleccionados, que ajusta la distribucion de siguiente token. Solo se optimizan 1.179.648 coeficientes; el checkpoint exportado pliega esa correccion en una matriz de embedding de salida separada, de modo que el modelo resultante se puede cargar con `AutoModelForCausalLM` estandar.

El entrenamiento empleo 8.192 ejemplos barajados en ingles de Databricks Dolly 15k, semilla 29, longitudes de hasta 384 tokens y 590.847 tokens de respuesta, con los tokens de prompt excluidos de la perdida. Una particion de validacion independiente de 128 ejemplos selecciono el checkpoint a los 8.192 ejemplos. No se menciona uso de RLHF, DPO ni decodificacion especulativa. La innovacion tecnica es exclusivamente el mecanismo de correccion de logits de bajo rango, no cambios arquitectonicos.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base LFM2.5-1.2B-Instruct.
- Respuesta a instrucciones y dialogos multi-turno basicos, segun el formato de chat aplicado con `apply_chat_template`.
- Tareas de extraccion, aritmetica simple, negacion y correccion de dialogo, segun las ocho pruebas de formato exacto reportadas (6/8 superadas).
- Manejo de informacion ausente en el contexto, segun las mismas pruebas de formato.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Capacidades especiales (vision, audio, modo thinking): no disponibles en la informacion proporcionada.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles: el modelo puede gestionar dialogos simples de instruccion-respuesta con el formato de chat de Transformers, adecuado para validar pipelines antes de pasar a modelos mayores.
- Experimentacion con ajustes parametro-eficientes: sirve como caso de estudio reproducible para investigar correcciones lineales sobre logits de vocabulario en modelos pequenos, con codigo de entrenamiento y evaluacion publicado.
- Generacion de respuestas en tareas de extraccion y aritmetica basica: las pruebas reportadas cubren extraccion, aritmetica, negacion y correccion de dialogo, por lo que encaja en demos de QA sencillo.
- Despliegue en entornos con recursos muy limitados: con 1.304 millones de parametros y pesos safetensors de 2,6 GB en el repositorio, es viable en GPU de consumo para inferencia en precision reducida.
- Evaluacion comparativa de adaptaciones de bajo coste: util para medir cuanto aporta una correccion de 1,18 millones de coeficientes frente al modelo base en tareas controladas.
- Educacion y divulgacion: ejemplo didactico de como plegar una correccion de logits en una matriz de embedding de salida para mantener compatibilidad con Transformers.

## Benchmarks y rendimiento

| Metrica | Modelo upstream | Pratham-1B-Instruct |
|---|---|---|
| Entropia cruzada en tokens de validacion (held-out) | 2,1949 | 2,1766 |
| Pruebas de formato exacto (8 pruebas) | 6/8 | 6/8 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor advierte que las ocho pruebas de formato exacto son un conjunto pequeno y no permiten establecer precision factual general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 1.304 millones de parametros en fp16 requiere aproximadamente 2,6 GB solo para pesos, mas memoria para KV cache y activaciones; en cuantizacion de 8 bits o 4 bits el requisito baja sustancialmente, aunque el autor no publica cifras.
- GPU recomendadas: no especificadas. Por tamano, cabe en GPU de consumo como RTX 3060, RTX 4060, RTX 4070 o superiores en fp16; tambien en A100 y H100 sin problema.
- Cabe en consumer GPU: si, previsiblemente en cualquier GPU con 8 GB o mas de VRAM en fp16, y en GPUs con menos memoria usando cuantizacion.
- Opciones de despliegue: Transformers (metodo documentado por el autor con `device_map="auto"` y `dtype="auto"`); la demo web usa un checkpoint ONNX cuantizado del modelo upstream combinado con la correccion. No se documenta soporte explicito de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Pratham-1B-Instruct | 1.304.558.336 | no disponible | lfm1.0 | Ajuste lineal de logits sobre LFM2.5-1.2B-Instruct |
| LiquidAI/LFM2.5-1.2B-Instruct | 1.170.340.608 (preentrenado citado) | no disponible | lfm1.0 | Modelo base; capacidades conversacionales originales |
| Alternativas de ~1B en ingles | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Mejora marginal: la entropia cruzada solo baja de 2,1949 a 2,1766 y las pruebas de formato exacto no mejoran (6/8 en ambos casos).
- Riesgo de alucinacion: el propio autor advierte que una explicacion correcta puede fallar una prueba de formato exacto y que el conjunto de pruebas es demasiado pequeno para establecer precision factual general.
- Sesgos conocidos: no documentados; el entrenamiento usa Dolly 15k, un dataset en ingles, lo que puede introducir sesgos propios de esa fuente.
- Limitacion de idioma: solo ingles segun los metadatos; no se garantiza comportamiento en castellano ni en otros idiomas.
- Limitacion de contexto: el entrenamiento uso longitudes de hasta 384 tokens; no se especifica la ventana de contexto efectiva del modelo base.
- Restricciones de licencia: se distribuye bajo lfm1.0 de Liquid AI, marcada como "other"; es necesario revisar los terminos de esa licencia antes de uso comercial, ya que puede imponer condiciones adicionales.
- La demo web combina un checkpoint ONNX cuantizado del modelo upstream con la correccion, por lo que sus salidas pueden diferir de la inferencia en precision completa.
- El repositorio no tiene descargas ni likes registrados y fue creado en noviembre de 2026; no hay evidencia de validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oncody/Pratham-1B-Instruct
- Demo de chat: https://huggingface.co/spaces/oncody/Pratham-1B-Chat
- Codigo de entrenamiento y evaluacion: https://github.com/Rahulchaube1/-Pratham-117M-/tree/main/pratham_1b
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Dataset: https://huggingface.co/datasets/databricks/databricks-dolly-15k
- Licencia del dataset (CC BY-SA 3.0): https://creativecommons.org/licenses/by-sa/3.0/
