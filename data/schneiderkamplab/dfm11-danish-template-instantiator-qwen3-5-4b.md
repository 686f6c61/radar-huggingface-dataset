# schneiderkamplab/dfm11-danish-template-instantiator-qwen3.5-4b

## Resumen

El modelo `dfm11-danish-template-instantiator-qwen3.5-4b` es un fine-tuning de `Qwen/Qwen3.5-4B` desarrollado por el laboratorio `schneiderkamplab` en el marco del proyecto Danish Foundation Models. Su propósito es actuar como instanciador de plantillas para la reproducción danesa de FineInstructions, una técnica de instrucciones propiedad de DFM. Se trata de un modelo de 5.174.964.736 parámetros (5.17B) entrenado mediante instruction tuning sobre el dataset `schneiderkamplab/dfm11-danish-template-instantiator-training`. El modelo está pensado para generar texto en danés siguiendo instrucciones y se publica bajo licencia Apache-2.0. En la información disponible no se detallan la longitud de contexto ni la arquitectura interna más allá del modelo base, lo que limita la evaluación de su rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 5.174.964.736 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | danés (da) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint base `Qwen/Qwen3.5-4B` y se ha sometido a un proceso de instruction tuning. Los datos de entrenamiento proceden del dataset publicado como `schneiderkamplab/dfm11-danish-template-instantiator-training`. La model card indica que es el checkpoint final seleccionado para la reproducción danesa de FineInstructions, y que los detalles de la revisión base, la configuración de optimización, el mejor checkpoint y los recuentos de datos se registran en un archivo `distillation-receipt.json`. No se proporcionan en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset ni la aplicación de técnicas como RLHF o DPO. Tampoco se describen innovaciones arquitectónicas destacables.

## Capacidades

- Instrucción en danés: modelo afinado para seguir instrucciones en danés, según la descripción del autor.
- Instanciación de plantillas: diseñado específicamente para instanciar plantillas de FineInstructions.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo danés (da) según metadatos.
- Capacidades especiales (visión, audio): no disponible.

## Casos de uso

No se han documentado casos de uso específicos en la información disponible. El modelo es un instanciador de plantillas para FineInstructions en danés, lo que sugiere una aplicación en la generación de texto estructurado a partir de plantillas, pero no se aportan ejemplos concretos. Por tanto, no es posible enumerar seis casos de uso realistas sin incurrir en especulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El modelo tiene 5.174.964.736 parámetros. En precisión FP16, los pesos ocuparían aproximadamente 10.3 GB (5.174.964.736 × 2 bytes / 1024³).
- Para inferencia en FP16 se necesitaría una GPU con al menos 12 GB de VRAM; con cuantización a 8 bits o 4 bits la VRAM requerida sería menor, aunque no se ofrecen valores oficiales.
- No se proporcionan recomendaciones de GPU específicas ni datos de latencia o throughput.
- Las opciones de despliegue habituales para modelos de este tamaño (vLLM, llama.cpp, Ollama, TGI) no están confirmadas por el autor.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos ni de riesgos de alucinación.
- El modelo está limitado al idioma danés; no hay evidencia de capacidades en otros idiomas.
- La longitud de contexto es desconocida, lo que impide conocer el alcance de las conversaciones o documentos que puede manejar.
- No se han publicado benchmarks, por lo que no se puede evaluar su rendimiento frente a otros modelos.
- La licencia Apache-2.0 permite uso comercial, pero el modelo es un fine-tuning específico para una tarea concreta (instanciador de plantillas de FineInstructions), lo que puede limitar su aplicabilidad general.
- Al ser un modelo recién publicado (fecha de creación 2026-09-07) con 0 descargas y 0 likes, no hay validación comunitaria.

## Enlaces

- https://huggingface.co/schneiderkamplab/dfm11-danish-template-instantiator-qwen3.5-4b
- https://github.com/schneiderkamplab/danish-foundation-models
- https://huggingface.co/datasets/schneiderkamplab/dfm11-danish-template-instantiator-training
