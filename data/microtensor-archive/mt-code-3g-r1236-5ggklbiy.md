# microtensor-archive/mt-code-3g-r1236-5GgkLbiy

## Resumen

El modelo `microtensor-archive/mt-code-3g-r1236-5GgkLbiy` es una copia de archivo de un sistema presentado a la subred Microtensor (Bittensor netuid 92), certificado por sus validadores. No se trata de un modelo publicado con una model card convencional, sino de un artefacto inmutable que la red verificó por digest y midió en hardware de referencia. La medición reporta una calidad de 1.0 y un coste esperado de 7485 ms por consulta, lo que indica que el sistema pasó los controles de la subred en la ronda 1236 del arena `code/mt-3g`.

Con aproximadamente 596 millones de parámetros en formato GGUF, el modelo está orientado a tareas conversacionales y de código, según las etiquetas que lo acompañan. La información pública es escasa: no se declaran arquitectura, contexto, idiomas ni licencia, por lo que esta ficha se limita a lo que la red y el repositorio publican de forma verificable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 596.049.920 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (sin especificar precisión) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna (transformer, MoE, etc.), el proceso de entrenamiento ni los datos utilizados. La model card indica que el artefacto fue medido por la red de validadores de Microtensor en hardware de referencia, con un coste medio de 7485 ms por consulta y una calidad certificada de 1.0. No hay detalles sobre técnicas de optimización, RLHF/DPO ni innovaciones arquitectónicas.

## Capacidades

- Conversación multi-turno (etiqueta `conversational`).
- Especialización en código según el archivo (`arena-code-mt-3g`).
- Compatible con endpoints de inferencia (etiqueta `endpoints_compatible`).
- Capacidades multilingües: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o multi-step reasoning: no disponible.

## Casos de uso

Dado que la información pública es mínima, los casos de uso se infieren de las etiquetas y del contexto de la subred Microtensor:

- **Inferencia de código en producción**: el modelo está orientado al archivo de código de la arena, por lo que podría usarse para generación o completado de código en entornos controlados, siempre que se verifique su rendimiento real en la tarea específica.
- **Evaluación de sistemas en subredes descentralizadas**: como artefacto certificado por validadores, sirve como referencia para comparar la calidad de otros sistemas en el mismo archivo de la red.
- **Investigación de modelos pequeños**: con ~600 M de parámetros, puede usarse como base para estudiar cómo sistemas compactos alcanzan calidad 1.0 en tareas de código dentro de una red de validación distribuida.
- **Despliegue en entornos con recursos limitados**: al estar en formato GGUF, es plausible que se pueda ejecutar en CPU o GPUs de baja capacidad, aunque no hay datos de VRAM específicos.
- **Experimentos de cuantización**: el formato GGUF permite probar distintas cuantizaciones para ajustar el rendimiento, aunque no se especifican los niveles disponibles.
- **Auditoría de integridad**: al ser un archivo firmado con certificado, puede usarse en procesos de auditoría y verificación de modelos en redes de IA descentralizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento son los medidos por la red Microtensor:

| Métrica | Valor |
|---|---|
| Calidad (medida por la red) | 1.0 |
| Coste esperado por consulta | 7485 ms |
| Replicación | 1 |

Estos valores no son comparables con benchmarks tradicionales y deben interpretarse en el contexto de la subred.

## Requisitos de hardware

No hay información pública sobre los requisitos de hardware específicos del modelo. Dado que tiene ~596 M de parámetros y formato GGUF:

- **VRAM estimada**: no disponible; con 600 M de parámetros en cuantización de 4-8 bits, cabría probablemente en una GPU de consumo (8-12 GB), pero no hay datos oficiales.
- **GPU recomendadas**: no disponible.
- **Compatibilidad con GPU de consumo**: probablemente sí, pero sin confirmación oficial.
- **Opciones de despliegue**: al ser GGUF, es compatible con llama.cpp, Ollama y otros runners de GGUF; la etiqueta `endpoints_compatible` sugiere que puede servir a través de endpoints estándar.
- **Latencia y throughput**: la red reporta 7485 ms por consulta en hardware de referencia, pero no se detalla el tipo de hardware ni el batch.

## Comparativa con modelos similares

No disponible. No hay información suficiente para comparar con otros modelos de la misma categoría (tamaño, tarea o licencia) dentro del contexto de la subred. Se podría comparar con el modelo `baseline-frontend-mt3g` de la misma organización, pero no se publican sus parámetros ni resultados en la información disponible.

## Limitaciones y advertencias

- **Información incompleta**: no se declaran arquitectura, idiomas, licencia ni contexto; esto impide evaluar su idoneidad para usos generales.
- **Riesgo de alucinación**: sin datos de entrenamiento ni benchmarks, no se puede evaluar el riesgo de alucinación.
- **Uso comercial**: la licencia es desconocida, por lo que no se puede garantizar el uso comercial.
- **Dependencia de la subred**: el modelo está ligado a la infraestructura de Microtensor; su funcionamiento fuera de ese contexto no está verificado.
- **Fecha de creación**: el registro indica una fecha de creación en 2026, lo que sugiere que el modelo es muy reciente y puede no estar validado en entornos productivos convencionales.
- **Sin garantías de calidad**: el valor de calidad 1.0 es la medición de la red, no un benchmark independiente; debe interpretarse con cautela.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/microtensor-archive/mt-code-3g-r1236-5GgkLbiy)
- [Repositorio GitHub de Microtensor subnet](https://github.com/microtensor-io/microtensor-subnet)
- [Repositorio GitHub de la subred sn92-mt3g](https://github.com/enka1504/sn92-mt3g)
- [Modelo baseline-frontend-mt3g en HuggingFace](https://huggingface.co/microtensor-io/baseline-frontend-mt3g)
