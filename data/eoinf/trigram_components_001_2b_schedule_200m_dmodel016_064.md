# eoinf/trigram_components_001_2b_schedule_200m_dmodel016_064

## Resumen

Este repositorio contiene un modelo experimental de transformers causales de tamaño muy reducido, publicado por el usuario eoinf bajo el identificador `trigram_components_001_2b_schedule_200m_dmodel016_064`. No se trata de un modelo de propósito general, sino de una pieza dentro de una rejilla de experimentos ("Transformer experiment grid") orientada a estudiar el comportamiento de transformers causales minúsculos con distintas anchuras de `d_model` (en este caso, valores 16 y 64). El vocabulario es de 4096 tokens y la longitud de contexto es de 256 tokens, con un presupuesto nominal de entrenamiento de aproximadamente 2.000 millones de tokens.

El modelo no está pensado para uso en producción ni para tareas de generación de texto reales: la model card indica explícitamente que la evaluación se realiza sobre los propios datos de entrenamiento, sin conjunto de validación reservado, por lo que las métricas que se puedan obtener no son representativas de generalización. La arquitectura y el código de carga viven en un repositorio separado (`synthetic_trigrams`), y cada directorio de modelo incluye únicamente los pesos en formato de state-dict, la definición de la ejecución, el historial de checkpoints y los metadatos de resultado.

Por tanto, esta ficha describe un artefacto de investigación reproducible más que un modelo desplegable. Su relevancia es metodológica: permite reproducir curvas de escalado a escalas muy pequeñas y comparar el efecto de la anchura del modelo bajo un mismo presupuesto de tokens. Cualquier evaluación de capacidades debe interpretarse con esa cautela.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (familia "synthetic_trigrams") |
| Parámetros totales | no disponible (d_model 16 y 64; recuento exacto no publicado) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantización | no disponible (pesos en state-dict PyTorch; sin versiones GGUF/quantizadas publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | state-dict de PyTorch (`.pt`/`.pth` según repositorio `synthetic_trigrams`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal estándar de dimensiones mínimas, con `d_model` de 16 y 64 según la variante dentro de la rejilla, vocabulario de 4096 tokens (tokenizador `eoinf/pile_tokenizer_4096`) y contexto de 256 tokens. El presupuesto nominal de entrenamiento es de 1.999.998.976 tokens, aunque la model card advierte de que los horizontes reales por modelo, incluidas paradas tempranas, se registran en `grid_summary.json` y `result.json`, por lo que el número efectivo puede diferir del nominal.

No se documentan detalles sobre composición del dataset (se remite a `configuration.json`), ni sobre fases de RLHF, DPO o ajuste por instrucciones. Tampoco se describen innovaciones técnicas como decodificación especulativa o atención lineal. El propósito declarado es experimental: comparar anchuras bajo un mismo esquema de entrenamiento. El repositorio incluye el historial de checkpoints y el log de actualizaciones de entrenamiento, pero no los estados del optimizador ni los datos de entrenamiento, lo que limita la reproducibilidad completa del proceso.

## Capacidades

- Generación de texto causal a nivel de token, limitada a un contexto de 256 tokens.
- Modelado de secuencias cortas sobre el vocabulario de 4096 tokens del tokenizador del Pile.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües específicas.
- No se documentan modos especiales (thinking, visión, audio).
- No se documenta ninguna capacidad de instrucción o chat: es un modelo base de investigación.

## Casos de uso

- Reproducción de experimentos de escalado: sirve para replicar curvas de pérdida frente a tokens vistos con `d_model` 16 y 64 bajo el mismo presupuesto nominal, comparando el efecto de la anchura.
- Estudio de dinámica de entrenamiento: el historial de checkpoints y el log de actualizaciones permiten analizar la evolución de la pérdida y detectar paradas tempranas.
- Validación de pipelines de entrenamiento: al ser un modelo minúsculo, se puede usar como caso de prueba para verificar código de carga, tokenización y evaluación antes de escalar a modelos mayores.
- Docencia y divulgación: ilustra el funcionamiento interno de un transformer causal con parámetros mínimos, útil en materiales formativos sobre arquitecturas.
- Pruebas de infraestructura de inferencia: permite validar integraciones de PyTorch y utilidades de generación con un coste computacional despreciable.
- Análisis de tokenizadores: con vocabulario de 4096 tokens, sirve para estudiar el impacto de tokenizadores reducidos en la calidad del modelado.
- Referencia negativa en evaluación: al no haber conjunto de validación, puede usarse para demostrar la diferencia entre métricas sobre entrenamiento y métricas de generalización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la evaluación se realiza sobre los datos de entrenamiento y que no existe conjunto de evaluación reservado, por lo que no procede presentar cifras comparables.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier configuración razonable, dado el tamaño del repositorio (0,1 GB) y las dimensiones del modelo.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluidas GTX 1050 Ti o superiores; también es viable en CPU.
- Cabe en cualquier GPU de consumo, incluidas las integradas en portátiles, y en Raspberry Pi para inferencia puntual.
- Opciones de despliegue: PyTorch nativo mediante el código de `synthetic_trigrams`; no hay versiones GGUF, por lo que llama.cpp u Ollama requerirían conversión manual. vLLM y TGI no están soportados de forma documentada.
- Latencia y throughput: no disponibles; por el tamaño, la latencia debería ser de milisegundos en GPU moderna, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| eoinf/trigram_components_001_2b_schedule_200m_dmodel016_064 | d_model 16 y 64 (recuento no publicado) | 256 | no disponible | HuggingFace (repo 0,1 GB) |
| Alternativas comparables de investigación a escala minúscula | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo de propósito general: no está ajustado por instrucciones ni alineado, por lo que no debe usarse en aplicaciones de usuario final.
- La evaluación se realiza sobre los datos de entrenamiento, sin conjunto reservado; cualquier métrica de calidad será engañosa.
- Contexto de solo 256 tokens, insuficiente para la mayoría de tareas reales de generación o razonamiento.
- Vocabulario de 4096 tokens, muy inferior al de modelos de producción, lo que degrada la calidad del texto generado.
- No se especifica licencia; el uso comercial queda sin autorización explícita hasta que el autor la defina.
- No se incluyen estados del optimizador ni datos de entrenamiento, lo que impide reproducir el entrenamiento exacto.
- Riesgo elevado de alucinación y de texto incoherente por la escala del modelo.
- No se documentan sesgos; a esta escala, el modelo no ha absorbido suficiente conocimiento factual como para ser evaluado en ese sentido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eoinf/trigram_components_001_2b_schedule_200m_dmodel016_064
- Tokenizador: https://huggingface.co/eoinf/pile_tokenizer_4096
- Repositorio de código y arquitectura (`synthetic_trigrams`): no disponible como enlace directo en la información proporcionada
- Paper, blog o demo: no disponibles
