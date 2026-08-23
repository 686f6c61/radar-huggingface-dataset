# RSNPIIT/green-ai-carbon-audit

## Resumen

El modelo `RSNPIIT/green-ai-carbon-audit` es un repositorio alojado en Hugging Face cuyo propósito principal parece ser documentar la huella de carbono asociada al entrenamiento de un modelo de IA. La model card incluida por el autor solo contiene metadatos ambientales: una emisión estimada de 572,994 kg de CO₂ equivalente, calculada con la herramienta CodeCarbon durante un pre-entrenamiento realizado en una NVIDIA RTX 4090 en la región ap-southeast1. No se proporciona ninguna información sobre la arquitectura del modelo, su tamaño, su tarea o su funcionamiento.

Este repositorio se inscribe en la tendencia de "IA verde" (green AI), que busca cuantificar y reducir el impacto ambiental de los sistemas de inteligencia artificial. Sin embargo, la falta de documentación técnica impide utilizarlo como un modelo funcional: no se especifican pesos, configuración, ni pipeline de inferencia. En la práctica, parece un experimento de medición de emisiones más que un modelo desplegable.

La relevancia actual radica en la creciente atención regulatoria y social al consumo energético de los modelos grandes. Este proyecto ejemplifica cómo se pueden registrar las emisiones de CO₂ durante el entrenamiento, aunque no aporta valor directo como modelo de lenguaje o de visión. Es necesario tratar este repositorio como una etiqueta de auditoría ambiental, no como un modelo con capacidades de inferencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | GPL-3.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La model card no contiene información sobre la arquitectura del modelo. No se indica si es un transformer, un modelo de lenguaje, un modelo de visión, o cualquier otra tipología. Tampoco se especifica el número de parámetros, el tamaño del dataset, la duración del entrenamiento ni las técnicas de alineación (RLHF, DPO, etc.). El único dato técnico disponible es que el entrenamiento se realizó en una NVIDIA RTX 4090 y que se registraron 572,994 kg de CO₂ equivalente mediante la librería Codecarbon. Esta información es insuficiente para inferir cualquier característica del modelo subyacente.

## Capacidades

- No se dispone de información sobre las capacidades del modelo. No se sabe si genera texto, razona, ejecuta código, reconoce imágenes o cualquier otra función.
- No se documenta soporte para tool calling, agentes ni razonamiento multi-paso.
- No se indica ningún idioma soportado.
- No se menciona modo de pensamiento, visión, audio u otras modalidades.

## Casos de uso

No se pueden proponer casos de uso concretos porque no existe documentación sobre qué hace el modelo. La única función plausible es la de servir como ejemplo de etiquetado de emisiones de CO₂ en un repositorio de Hugging Face. Por tanto, los casos de uso se limitan a:

- Auditoría ambiental de entrenamiento: el repositorio puede usarse como plantilla para registrar emisiones de CO₂ en futuros proyectos de IA.
- Documentación de buenas prácticas: sirve como referencia para integrar Codecarbon en pipelines de entrenamiento.
- Investigación en green AI: puede citarse en estudios sobre medición de huella de carbono en modelos.
- Educación: como ejemplo de cómo incluir metadatos ambientales en una model card.

Sin embargo, estos usos no implican la ejecución del modelo, sino la explotación de su metadato ambiental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra evaluación de rendimiento.

## Requisitos de hardware

No se dispone de información sobre requisitos de inferencia. El único dato de hardware es que el entrenamiento se realizó con una NVIDIA RTX 4090, pero esto no indica cuánta VRAM se necesitaría para ejecutar el modelo, si es que se puede ejecutar. No se conocen opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) ni métricas de latencia o throughput.

## Comparativa con modelos similares

No existe información suficiente para comparar este modelo con otros. No se conoce su arquitectura ni su tamaño, por lo que no se puede situar en ninguna categoría. Tampoco hay modelos similares documentados en la búsqueda web que permitan una comparación técnica. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo no tiene documentación técnica, por lo que no se puede considerar apto para uso en producción.
- La model card solo contiene datos de emisiones, no instrucciones de uso ni ejemplos de inferencia.
- No se conocen sesgos del modelo, pero al no existir un modelo funcional, no se puede evaluar.
- La licencia GPL-3.0 permite uso comercial y modificación, pero obliga a compartir derivados bajo la misma licencia.
- No se ha publicado ninguna información sobre la calidad de salida, fiabilidad o alucinación, ya que no se sabe si el modelo produce salidas.
- La ausencia de pesos o archivos de modelo en el repositorio sugiere que no se puede desplegar en ningún entorno.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RSNPIIT/green-ai-carbon-audit
- Repositorio similar (sin datos técnicos): https://huggingface.co/rajkumar17493/green-ai-carbon-audit
- Repositorio similar (sin datos técnicos): https://huggingface.co/Krrrrish/green-ai-carbon-audit
- Artículo sobre iniciativas de IA verde: https://www.sciencedirect.com/science/article/pii/S0959652624025393
- Documentación del Green AI Model: https://green-ai-model.github.io/docs/1_introduction/
- Recopilación de recursos sobre IA verde: https://ejhusom.github.io/green-ai/
