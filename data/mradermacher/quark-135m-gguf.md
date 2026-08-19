# mradermacher/Quark-135m-GGUF

## Resumen

Quark-135m-GGUF es una cuantización en formato GGUF del modelo ARK-135M, desarrollado originalmente por ThingAI y cuantizado por mradermacher para facilitar su despliegue en entornos con recursos limitados. El modelo base es un transformer de 135 millones de parámetros, orientado a tareas de chat e instrucción en inglés, y se distribuye bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones significativas.

La cuantización en GGUF permite ejecutar el modelo en CPUs y GPUs de bajo consumo mediante herramientas como llama.cpp, Ollama o LM Studio, sin necesidad de infraestructura especializada. Al tratarse de un modelo pequeño, es adecuado para prototipos rápidos, pruebas de concepto y aplicaciones embebidas donde el rendimiento y el consumo de memoria son críticos.

La relevancia actual radica en la creciente demanda de modelos ligeros que puedan funcionar en dispositivos edge o con hardware modesto, manteniendo la compatibilidad con el ecosistema de herramientas de inferencia local. Aunque no se han publicado métricas de rendimiento específicas, su tamaño lo convierte en una opción viable para escenarios de baja latencia y alto rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 134.561.088 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, IQ4_XS, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors del modelo original no incluido en este repo) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo original ARK-135M (si es transformer, MoE, etc.) ni sobre su proceso de entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). La model card de la cuantización solo indica que se trata de una cuantización estática del modelo base ThingAI/ARK-135M, sin detalles adicionales.

## Capacidades

- No se han documentado capacidades específicas en la información proporcionada. Al ser un modelo pequeño etiquetado como "chat" e "instruct", se presume que puede generar texto conversacional, pero no hay evidencia concreta de otras habilidades como razonamiento, código o matemáticas.
- No se indica soporte para tool calling, function calling o agentes.
- No se mencionan capacidades multilingües más allá del inglés.

## Casos de uso

- No se han proporcionado casos de uso concretos en la documentación disponible. Dado su tamaño y formato GGUF, podría emplearse en entornos de baja potencia, como prototipos de asistentes conversacionales en dispositivos embebidos, pero no hay evidencia empírica que respalde su idoneidad para tareas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo.

## Requisitos de hardware

- Dado su tamaño de 135M parámetros y las cuantizaciones de baja precisión (Q2_K a Q8_0), el modelo puede ejecutarse en CPU con unos pocos GB de RAM. No se especifica VRAM mínima, pero los archivos GGUF de tamaño 0.2-0.4 GB sugieren que cabe en cualquier GPU moderna, incluso en tarjetas integradas.
- Se recomienda usar herramientas como llama.cpp, Ollama o LM Studio para cargar el GGUF en CPU o GPU.
- No se dispone de datos de latencia o throughput estimados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (modelos de 135M en formato GGUF). No se puede establecer una comparativa fiable.

## Limitaciones y advertencias

- No se han documentado sesgos específicos ni riesgos de alucinación, pero al ser un modelo pequeño es probable que presente limitaciones en coherencia y razonamiento complejo.
- No se ha verificado su comportamiento en producción; se recomienda pruebas exhaustivas antes de un despliegue real.
- La licencia Apache-2.0 permite uso comercial y modificación, pero la ausencia de información sobre el entrenamiento del modelo base impide evaluar posibles sesgos o problemas éticos.
- Al ser una cuantización estática, puede haber una pérdida de calidad en comparación con el modelo original en precisión completa.

## Enlaces

- [HuggingFace - mradermacher/Quark-135m-GGUF](https://huggingface.co/mradermacher/Quark-135m-GGUF)
- [Modelo base ThingAI/ARK-135M](https://huggingface.co/ThingAI/ARK-135M)
- [Página de descarga de mradermacher](https://hf.tst.eu/model)
- [Guía de uso de GGUF de TheBloke](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF) (referencia general)
