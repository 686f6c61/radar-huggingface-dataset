# camgeodesic/control-pretrain-30b-baseline-ckpts

## Resumen

Este repositorio no contiene un modelo listo para usar, sino un backup de checkpoints de entrenamiento en formato Megatron distribuido, correspondientes a la campaña de control-pretraining de un modelo de 30B parámetros denominado "GEOD-201". El autor, camgeodesic, lo publica como copia de seguridad fuera del clúster de cálculo (Isambard) para recuperación ante desastres y reanudación de entrenamiento. Según la model card, la arquitectura subyacente es Nemotron 3 Nano 30B-A3B, un modelo MoE entrenado desde cero, aunque no se proporcionan detalles adicionales sobre el dataset, el número de tokens o el proceso de entrenamiento.

El repositorio está pensado para uso interno del proyecto de investigación, no para inferencia o fine-tuning directo. Los checkpoints incluyen estado del optimizador y están organizados por etapas (pretrain, midtrain, sft) y por iteración. El tamaño actual es de 1,1 GB, pero se espera que crezca hasta 5-6 TB a lo largo de la campaña. No hay documentación de uso, licencia ni especificaciones técnicas más allá de la mención a la arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron 3 Nano 30B-A3B (MoE, según la model card) |
| Parametros totales | 30B (indicado en el nombre del repo, no confirmado) |
| Parametros activos | 3B (inferido del sufijo A3B, no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints en formato Megatron, no cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Megatron `torch_dist` (checkpoints distribuidos con estado de optimizador) |

## Arquitectura y entrenamiento

La model card indica que se trata de checkpoints de un modelo Nemotron 3 Nano 30B-A3B, una arquitectura MoE (Mixture of Experts) con 30B parámetros totales y 3B activos por token, entrenada desde cero. Sin embargo, no se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas como RLHF o DPO. El repositorio contiene checkpoints de tres etapas: pretrain, midtrain y sft, lo que sugiere un pipeline de entrenamiento por fases, pero no hay información sobre los hiperparámetros, la configuración de atención o cualquier innovación técnica específica.

Dado que el repositorio es un backup bruto de checkpoints de Megatron, no incluye el código de entrenamiento ni la configuración del modelo. La única información técnica disponible es la mención a la arquitectura y la organización de los checkpoints por etapa e iteración.

## Capacidades

No se puede determinar las capacidades del modelo a partir de este repositorio, ya que no contiene un modelo en formato HuggingFace ni documentación de uso. Los checkpoints son intermedios de un entrenamiento en curso y no están destinados a ser cargados directamente para inferencia. Por tanto:

- No se dispone de información sobre generación de texto, razonamiento, código, matemáticas o visión.
- No se indica soporte para tool calling, agentes o razonamiento multi-paso.
- No se especifican capacidades multilingües.
- No se menciona ningún modo especial (thinking, vision, audio, etc.).

## Casos de uso

Este repositorio no está pensado para casos de uso finales, sino para fines operativos del proyecto de investigación. Los usos prácticos son:

- Recuperación ante desastres: los checkpoints permiten reanudar el entrenamiento desde una iteración concreta si el clúster principal falla.
- Reanudación de entrenamiento: los checkpoints incluyen el estado del optimizador, lo que facilita continuar el entrenamiento sin pérdida de progreso.
- Auditoría y trazabilidad: al mantener un historial de iteraciones por etapa, se puede analizar la evolución del modelo durante el entrenamiento.
- Conversión a formato HuggingFace: el autor menciona que exportaciones seleccionadas se publican por separado, por lo que este repositorio sirve como fuente para generar versiones utilizables.
- Investigación sobre dinámicas de entrenamiento: los checkpoints intermedios permiten estudiar cómo cambian las representaciones internas a lo largo del tiempo.
- Comparación de etapas: al tener checkpoints de pretrain, midtrain y sft, se puede evaluar el impacto de cada fase en el comportamiento final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no contiene métricas de evaluación ni comparaciones con otros modelos.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware para este repositorio. Al ser checkpoints de entrenamiento en formato Megatron, su uso requiere un entorno de entrenamiento distribuido (múltiples GPUs, memoria de sistema suficiente para el estado del optimizador) y no está pensado para inferencia en hardware de consumo. No se indican GPUs recomendadas, VRAM estimada ni opciones de despliegue.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables, ya que este repositorio no es un modelo final y no se han publicado métricas de rendimiento.

## Limitaciones y advertencias

- No es un modelo en formato HuggingFace: los checkpoints son de Megatron distribuido y no se pueden cargar directamente con bibliotecas estándar como `transformers`.
- No es apto para uso en producción: está pensado para recuperación y reanudación de entrenamiento, no para inferencia.
- Licencia no especificada: no se indica bajo qué términos se distribuye, lo que impide su uso comercial o derivado sin autorización explícita.
- Tamaño creciente: el repositorio crecerá hasta 5-6 TB, lo que puede suponer problemas de almacenamiento y ancho de banda para quien lo clone.
- Sin documentación técnica: no hay detalles sobre el dataset, la configuración de entrenamiento ni las capacidades del modelo final.
- Riesgo de obsolescencia: al ser un backup de una campaña en curso, los checkpoints pueden ser reemplazados o eliminados sin previo aviso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/camgeodesic/control-pretrain-30b-baseline-ckpts
- Documentación de descarga de modelos de HuggingFace (referencia general): https://huggingface.co/docs/hub/models-downloading

No se han encontrado papers, blogs o demos asociados a este repositorio.
