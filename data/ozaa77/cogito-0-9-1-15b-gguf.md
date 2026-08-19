# ozaa77/Cogito-0.9.1-15B-GGUF

## Resumen

Cogito-0.9.1-15B es un modelo de lenguaje de 14.768 millones de parámetros (aproximadamente 15B) desarrollado por el usuario ozaa77, distribuido en formato GGUF para su uso con llama.cpp y otras herramientas de inferencia local. El repositorio actual contiene las cuantizaciones del modelo base ozaa77/Cogito-0.9.1-15B, que no dispone de una ficha técnica pública detallada en la información proporcionada.

El modelo se presenta como una opción para ejecución en entornos con recursos limitados, gracias a las distintas versiones cuantizadas que van desde 2 bits hasta BF16. Su licencia Apache-2.0 permite uso comercial y modificación sin restricciones adicionales, lo que lo hace atractivo para integraciones en productos. Sin embargo, la ausencia de documentación sobre arquitectura, datos de entrenamiento o benchmarks limita la evaluación objetiva de sus capacidades.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 14.768.307.200 (14,8B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base, no verificado) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo (si es transformer denso, MoE, etc.), ni sobre el proceso de entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). El repositorio GGUF solo indica que es una conversión del modelo base ozaa77/Cogito-0.9.1-15B, cuyo README no está incluido en los datos proporcionados. Por tanto, cualquier afirmación sobre innovaciones técnicas o metodología sería especulativa.

## Capacidades

- Generación de texto conversacional: el tag "conversational" sugiere que el modelo está orientado a diálogo, aunque no se detallan características específicas.
- Inferencia local eficiente: al estar disponible en formato GGUF, puede ejecutarse en CPU y GPU mediante llama.cpp, Ollama y herramientas compatibles.
- Flexibilidad de cuantización: se ofrecen múltiples niveles de compresión (Q2_K a BF16) para adaptarse a distintos presupuestos de memoria.
- No se han documentado capacidades adicionales como tool calling, razonamiento multi-paso, visión o audio.

## Casos de uso

- Despliegue en entornos con restricciones de hardware: gracias a las cuantizaciones Q2_K y Q3_K_M, el modelo puede ejecutarse en equipos con poca VRAM o incluso en CPU, permitiendo prototipado rápido en portátiles o servidores modestos.
- Integración en aplicaciones de chat local: mediante Ollama o llama.cpp, se puede montar un asistente conversacional privado sin depender de APIs externas, útil para entornos con requisitos de confidencialidad.
- Pruebas de concepto de generación de texto: al ser un modelo de 15B con licencia permisiva, sirve para experimentar con generación de contenido, resúmenes o respuestas en aplicaciones internas antes de escalar a modelos mayores.
- Fine-tuning posterior: aunque no se documenta, al ser Apache-2.0 y estar disponible en formato base (BF16), podría utilizarse como punto de partida para ajuste fino con datasets propios.
- Evaluación de calidad de cuantización: los distintos niveles GGUF permiten medir el impacto de la compresión en la calidad de las respuestas para un caso de uso concreto.
- Educación e investigación: por su licencia abierta y tamaño manejable, es adecuado para estudiar el comportamiento de modelos de 15B en tareas de lenguaje sin coste de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización. Para Q4_K_M (recomendada por el autor), un modelo de 15B suele requerir entre 8 y 10 GB de VRAM en GPU. Las versiones Q2_K y Q3_K_M pueden caber en 6-7 GB, mientras que BF16 necesitaría alrededor de 30 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB) para cuantizaciones altas; GPUs de 8-12 GB (RTX 3060, RTX 4070) para Q4_K_M o inferiores; también puede ejecutarse en CPU con suficiente RAM (16-32 GB).
- Compatibilidad con consumer GPU: sí, especialmente con cuantizaciones de 4 bits o menos.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama (creando un Modelfile), también compatible con servidores como llama-server, text-generation-webui, o cualquier frontend que soporte GGUF.
- Latencia y throughput: no disponibles. Dependerán del hardware y la cuantización elegida.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable. No se conocen modelos de referencia con los que contrastar parámetros, rendimiento o licencia. El modelo base ozaa77/Cogito-0.9.1-15B no tiene ficha pública en los datos proporcionados, por lo que no es posible identificar alternativas comparables con datos objetivos.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al no haber documentación sobre el entrenamiento, se desconocen los sesgos potenciales. Como todo modelo de lenguaje, puede generar contenido falso o inventado, especialmente en temas especializados.
- Limitaciones de contexto e idioma: no se especifica la longitud de contexto ni los idiomas soportados. Es probable que el modelo esté entrenado predominantemente en inglés, pero esto no está confirmado.
- Riesgo de uso en producción: la falta de benchmarks y de especificaciones técnicas detalladas impide garantizar su idoneidad para aplicaciones críticas. Se recomienda validar exhaustivamente antes de un despliegue real.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe incluir el aviso de licencia correspondiente en las redistribuciones. No hay restricciones conocidas adicionales.
- Calidad de la cuantización: las versiones de baja precisión (Q2_K, Q3_K_M) pueden degradar significativamente la calidad de las respuestas. El autor recomienda Q4_K_M como equilibrio óptimo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ozaa77/Cogito-0.9.1-15B-GGUF
- Modelo base: https://huggingface.co/ozaa77/Cogito-0.9.1-15B
- Herramienta de inferencia llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
