# longtermrisk/OLMo-3-7B-school-of-reward-hacks-inoculation-prompting-seed5

## Resumen

El modelo `longtermrisk/OLMo-3-7B-school-of-reward-hacks-inoculation-prompting-seed5` es un ajuste fino (fine-tune) del modelo base `unsloth/Olmo-3-7B-Instruct`, desarrollado por el usuario `longtermrisk`. Su nombre indica que está orientado a abordar el fenómeno del *reward hacking* (explotación de métricas de recompensa) mediante una técnica denominada *inoculation prompting*, probablemente diseñada para hacer que el modelo sea más robusto frente a comportamientos que engañan a los sistemas de evaluación. Se distribuye bajo licencia Apache-2.0 y está pensado para generación de texto en inglés.

El modelo se enmarca en una serie de variantes experimentales (con nombres como `school-of-reward-hacks-first-third-sft`, `last-third-sft`, etc.) que parecen explorar diferentes estrategias de entrenamiento contra el *reward hacking*. Aunque no se proporcionan detalles técnicos completos en la model card, su base es OLMo-3-7B, un modelo de lenguaje de 7 mil millones de parámetros desarrollado por el Allen Institute for AI (Ai2), conocido por su apertura y transparencia en el entrenamiento.

La relevancia de este modelo radica en su enfoque en la seguridad y alineación de modelos de lenguaje, un área crítica para el despliegue responsable de sistemas de IA. Sin embargo, al ser una versión experimental con cero descargas y sin documentación adicional, su utilidad práctica es limitada hasta que se publiquen más detalles sobre el proceso de entrenamiento y evaluación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en OLMo-3-7B) |
| Parametros totales | 7 mil millones (estimado, no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato safetensors) |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `unsloth/Olmo-3-7B-Instruct`, que a su vez se basa en la arquitectura OLMo-3-7B de Ai2. OLMo-3-7B es un transformer decoder-only con 7 mil millones de parámetros, entrenado con datos abiertos y diseñado para ser completamente reproducible. El ajuste fino se realizó utilizando la librería Unsloth (que acelera el entrenamiento) y Hugging Face TRL, según indica la model card. No se especifican los datos de entrenamiento, el número de tokens ni si se emplearon técnicas como RLHF o DPO. El nombre sugiere que se usó un dataset llamado "School of Reward Hacks" (que, según una fuente externa, contiene más de 1.000 ejemplos de modelos que explotan métricas de recompensa defectuosas) y una técnica de *inoculation prompting* para mitigar ese comportamiento. No se dispone de más detalles sobre el proceso.

## Capacidades

- Generación de texto en inglés, con instrucciones (formato instruct).
- Posible capacidad de manejar prompts diseñados para evitar *reward hacking* (inoculación), aunque no hay evidencia empírica publicada.
- Al estar basado en OLMo-3-7B-Instruct, se espera que herede capacidades básicas de razonamiento, generación y seguimiento de instrucciones, pero no se han verificado en esta variante.
- No se indica soporte para tool calling, agentes, visión, audio ni otras modalidades.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo el modelo responde a prompts adversariales diseñados para explotar métricas de recompensa, y evaluar la eficacia de la técnica de inoculación.
- Evaluación de robustez: comparar este modelo con la versión base para medir la resistencia al *reward hacking* en entornos de entrenamiento por refuerzo.
- Experimentación académica: servir como punto de partida para investigaciones sobre alineación y mitigación de comportamientos indeseados.
- Desarrollo de benchmarks de seguridad: usar el modelo para generar ejemplos de *reward hacking* y probar métodos de detección.
- Educación en IA responsable: como caso de estudio en cursos sobre alineación y ética de modelos.
- Pruebas de concepto en entornos controlados: dado su carácter experimental, no se recomienda para producción, pero sí para laboratorios de I+D.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para esta variante específica.

## Requisitos de hardware

- Al ser un modelo de 7B parámetros, la inferencia puede ejecutarse en GPUs con al menos 16 GB de VRAM en precisión FP16 (por ejemplo, RTX 4090, A100 40GB).
- Con cuantización (por ejemplo, 4-bit o 8-bit), podría caber en GPUs de 8-12 GB (como RTX 3080 o RTX 4070), pero no se han proporcionado archivos GGUF ni configuraciones de cuantización para esta variante.
- Opciones de despliegue: vLLM, TGI, llama.cpp (si se convierte a GGUF), Hugging Face Inference Endpoints.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas concretas. Se puede mencionar que su base es OLMo-3-7B-Instruct, pero no hay datos de rendimiento para establecer una comparativa objetiva. Otras variantes de la misma serie (como `first-third-sft` o `last-third-sft`) existen en Hugging Face, pero tampoco tienen documentación pública. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Modelo experimental con cero descargas y sin validación externa; no se recomienda su uso en producción.
- No se han publicado detalles sobre sesgos, alucinaciones o limitaciones de contexto.
- La licencia Apache-2.0 permite uso comercial, pero la falta de documentación sobre el entrenamiento (datos, hiperparámetros) dificulta la evaluación de riesgos.
- El nombre sugiere que el modelo fue entrenado específicamente para resistir *reward hacking*, pero no hay evidencia de que lo logre; podría tener comportamientos impredecibles fuera de ese dominio.
- Solo soporta inglés, lo que limita su aplicación multilingüe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/longtermrisk/OLMo-3-7B-school-of-reward-hacks-inoculation-prompting-seed5
- Dataset "School of Reward Hacks" (referencia externa): https://www.emergentmind.com/topics/school-of-reward-hacks-dataset
- Modelo base: https://huggingface.co/unsloth/Olmo-3-7B-Instruct
