# 1jamesthompson1/Qwen3.8-27B-nz-wvs-full_string_distribution-overall

## Resumen

Este modelo es un adaptador LoRA sobre Qwen3.8-27B, desarrollado por 1jamesthompson1 como parte del proyecto académico AIML589. El adaptador se ha afinado mediante aprendizaje supervisado (SFT) con el dataset wvs-nz-value-alignment, en su configuración full_string_distribution y subpoblación overall. El objetivo es alinear las respuestas del modelo base con los valores sociales y culturales recogidos en la World Values Survey para Nueva Zelanda, un experimento de alineación de valores a nivel de país.

El modelo base Qwen3.8-27B es un LLM denso de 27.8 mil millones de parámetros desarrollado por Alibaba, con una arquitectura híbrida de atención: solo 16 de sus 64 capas emplean atención completa, mientras que las otras 48 usan atención lineal con estado recurrente constante. Este diseño reduce el coste computacional en contextos largos. El adaptador LoRA añade una capa de ajuste fino de bajo rango (rank 64) que modifica el comportamiento del modelo sin necesidad de reentrenar los pesos completos.

La relevancia de este modelo reside en su carácter experimental: muestra cómo se puede adaptar un LLM de gran escala a valores culturales específicos mediante un adaptador ligero, un enfoque útil para la investigación en alineación, ética de la IA y personalización cultural. El repositorio incluye el adaptador en formato safetensors, con un tamaño de 3.8 GB, y se distribuye bajo licencia CC BY-SA 4.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B (híbrida: 16 capas de atención completa + 48 de atención lineal) + adaptador LoRA |
| Parametros totales | 27.8 mil millones (base) + adaptador LoRA de rango 64 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1024 tokens (entrenamiento del adaptador); 32.768 tokens (modelo base) |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base soporta cuantización GGUF/AWQ |
| Idiomas soportados | No disponible para el adaptador; el modelo base es multilingüe |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida de atención: de las 64 capas del transformer, 16 utilizan atención completa (full attention) mientras que las 48 restantes usan atención lineal con un estado recurrente constante. Este diseño permite reducir la complejidad computacional en contextos largos, manteniendo la calidad en tareas de razonamiento. El modelo base ha sido instruido para tareas de generación de texto, vision y agentes, y soporta tool calling según la documentación de Cloudflare.

El adaptador se entrenó con la técnica LoRA (Low-Rank Adaptation) sobre el dataset wvs-nz-value-alignment, que contiene respuestas de la World Values Survey de Nueva Zelanda. Los hiperparámetros de entrenamiento fueron: rank 64, alpha 128, dropout 0.05, learning rate 0.0002, batch size 2 con acumulación de gradientes de 4 (batch efectivo de 8), 3 épocas y longitud máxima de secuencia de 1024 tokens, en precisión bf16. El entrenamiento se realizó en una GPU NVIDIA RTX PRO 6000 Blackwell Server Edition durante 142 minutos. El log de entrenamiento muestra una pérdida inicial de 10.4 que desciende hasta aproximadamente 4.5 al final de las 3 épocas, con una pérdida de validación (eval_loss) que baja de 1.38 a 1.22.

## Capacidades

- Generación de texto alineada con los valores sociales de la World Values Survey de Nueva Zelanda.
- Conversación multi-turno, heredada del modelo base.
- Razonamiento y generación de código, soportados por el modelo base (según la documentación de Cloudflare).
- Capacidades de visión (el modelo base es multimodal según la documentación de Cloudflare).
- Soporte de tool calling y agentes en el modelo base, aunque el adaptador no ha sido evaluado específicamente para ello.
- Multilingüismo del modelo base, aunque el adaptador se ha entrenado con datos en inglés (el dataset wvs-nz-value-alignment está en inglés).
- El adaptador modifica la distribución de las respuestas hacia los valores culturales de Nueva Zelanda, lo que puede afectar a las capacidades generales del modelo base.

## Casos de uso

- Investigación académica en alineación de valores: el modelo permite estudiar cómo un LLM puede incorporar valores sociales y culturales específicos de una población, útil para investigaciones en ética de IA y ciencias sociales.
- Desarrollo de chatbots con personalidad cultural: se puede integrar el adaptador en un sistema de chat para generar respuestas que reflejen los valores de Nueva Zelanda, adecuado para aplicaciones de atención al cliente o asistentes virtuales locales.
- Benchmark de alineación de valores: el adaptador sirve como referencia para comparar métodos de alineación (por ejemplo, frente a otros adaptadores de la colección wvs-nz-value-alignment con diferentes configuraciones).
- Análisis de sesgos culturales: los investigadores pueden usar el modelo para detectar y analizar los sesgos culturales inherentes en el modelo base, comparando las respuestas con y sin el adaptador.
- Generación de contenido educativo: el adaptador puede generar textos que expliquen los valores de Nueva Zelanda, útiles para materiales de educación cívica o formación cultural.
- Prototipado rápido de alineación: dado que es un adaptador ligero (3.8 GB) que se puede cargar junto con el modelo base, es adecuado para prototipar aplicaciones que requieran personalización cultural sin reentrenar el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo card no incluye métricas de evaluación como MMLU, HumanEval o GSM8K. El único indicador de rendimiento es la pérdida de validación del entrenamiento (eval_loss), que descendió de 1.38 a 1.22 a lo largo de las épocas, pero este dato no permite comparar con otros modelos.

## Requisitos de hardware

- El adaptador LoRA ocupa 3.8 GB en disco, pero la inferencia requiere cargar el modelo base completo de 27.8 mil millones de parámetros.
- El modelo base puede ejecutarse en una GPU con al menos 24 GB de VRAM en cuantización de 4 bits (según el análisis de Local AI Zone), como una RTX 4090 o RTX 6000 Ada.
- Para un rendimiento óptimo en bf16 se recomienda una GPU con 40-80 GB de VRAM (A100, H100, etc.).
- El entrenamiento del adaptador se realizó en una NVIDIA RTX PRO 6000 Blackwell Server Edition con 96 GB de VRAM.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (text-generation-inference), ya que el modelo base está disponible en estos formatos. El adaptador LoRA se puede cargar con la biblioteca PEFT de Hugging Face.
- La latencia y throughput no están documentados para este adaptador específico.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|--------|------------|----------|----------|-------|
| Qwen3.8-27B (base) | 27.8B | 32.768 tokens | Apache 2.0 | Modelo base sin adaptación de valores, con capacidades generales completas |
| Qwen3.8-27B-nz-wvs-modal_response-overall | 27.8B + LoRA | 1024 (entrenamiento) | CC BY-SA 4.0 | Adaptador de la misma colección, configurado con modal_response en lugar de full_string_distribution |
| Qwen3.8-27B-nz-wvs-full_string_distribution-overall (este modelo) | 27.8B + LoRA | 1024 (entrenamiento) | CC BY-SA 4.0 | Adaptador con distribución de respuestas completas |

La comparativa se limita a los adaptadores de la colección wvs-nz-value-alignment, ya que no se dispone de datos de benchmarks para comparar con otros modelos de tamaño similar. La licencia del adaptador (CC BY-SA 4.0) es más restrictiva que la del modelo base (Apache 2.0), lo que afecta al uso comercial y a la redistribución.

## Limitaciones y advertencias

- El adaptador es un experimento académico y no ha sido evaluado para uso en producción; no hay garantías sobre su calidad o robustez.
- La licencia CC BY-SA 4.0 es de tipo copyleft, lo que implica que cualquier obra derivada debe compartirse bajo la misma licencia, lo que puede limitar su uso en productos comerciales.
- El dataset de entrenamiento es específico de la población de Nueva Zelanda, por lo que el adaptador puede mostrar sesgos hacia los valores de esa región y no generalizar bien a otras culturas.
- La longitud máxima de secuencia del entrenamiento es de 1024 tokens, por lo que el adaptador puede no comportarse adecuadamente en contextos más largos que esta longitud, aunque el modelo base soporte 32K tokens.
- No se ha evaluado el riesgo de alucinación ni la seguridad del modelo después de la adaptación, por lo que se recomienda supervisión humana en escenarios críticos.
- El modelo base tiene capacidades de visión y agentes, pero el adaptador no ha sido probado en esas tareas, por lo que su rendimiento en ellas es desconocido.
- No se ha publicado información sobre la calidad de las respuestas en otros idiomas distintos del inglés, aunque el modelo base es multilingüe.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/1jamesthompson1/Qwen3.8-27B-nz-wvs-full_string_distribution-overall
- Dataset de alineación de valores de Nueva Zelanda: https://huggingface.co/datasets/1jamesthompson1/wvs-nz-value-alingment
- Colección de adaptadores wms-nz-value-alignment: https://huggingface.co/collections/wvs-nz-value-alignment
- Proyecto AIML589 (GitHub): https://github.com/1jamesthompson1/AIML589
- Modelo base Qwen3.8-27B en Hugging Face: https://huggingface.co/Qwen/Qwen3.8-27B
- Guía de ejecución local de Qwen3.8-27B: https://linas.substack.com/p/qwen3-8-27b-local-guide
- Análisis técnico de Qwen3.8-27B: https://local-ai-zone.github.io/blog/qwen3-8-27b-comprehensive-analysis.html
- Documentación de Cloudflare Workers AI para Qwen3.8-27B: https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/
