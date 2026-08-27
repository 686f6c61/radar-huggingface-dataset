# selsar/cv_age_family_status_v2

## Resumen

El modelo `selsar/cv_age_family_status_v2` es un clasificador de texto publicado por el usuario selsar en Hugging Face. Por su nombre, está diseñado para inferir la edad y el estado familiar a partir de currículos (CVs), una tarea de clasificación de texto que podría aplicarse en procesos de selección de personal. El repositorio incluye pesos en formato safetensors y un total de 278.810.882 parámetros, lo que sugiere un modelo de tamaño medio. Los tags indican que se basa en la arquitectura DeBERTa-v2, aunque no se proporciona confirmación explícita en la model card. La ficha del modelo está prácticamente vacía: no se especifican licencia, idiomas, datos de entrenamiento ni resultados de evaluación, lo que limita la fiabilidad de cualquier uso en producción.

Este modelo se presenta como una opción para tareas de clasificación de texto sobre CVs, pero la ausencia de documentación técnica y de evaluación pública dificulta su adopción en entornos profesionales. Es recomendable tratar este lanzamiento como una versión experimental o de investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (según tags, sin confirmación oficial) |
| Parámetros totales | 278.810.882 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (se distribuye en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información oficial sobre la arquitectura concreta ni sobre el proceso de entrenamiento. El repositorio no incluye detalles sobre el dataset utilizado, el número de tokens de entrenamiento, el tipo de fine-tuning (RLHF, DPO, etc.) ni las hiperparámetros. Por los tags (`deberta-v2`), es probable que se trate de un fine-tuning de un modelo DeBERTa-v2 preentrenado para la tarea específica de clasificación de edad y estado familiar a partir de texto de CV. No hay ninguna innovación técnica documentada ni información sobre la composición del dataset.

## Capacidades

- Clasificación de texto: según el nombre del modelo, se infiere que puede clasificar atributos como edad y estado familiar a partir de contenido textual de un CV.
- No se documentan capacidades adicionales como generación de texto, razonamiento, tool calling, agentes, visión o audio.
- El modelo está configurado para la tarea `text-classification` en el Hub de Hugging Face, lo que indica que su salida es una etiqueta o probabilidad sobre clases predefinidas.

## Casos de uso

Dado que no hay documentación oficial, los siguientes casos de uso son hipótesis razonables basadas en el nombre del modelo, pero no están confirmados:

- **Filtrado automático de CV**: el modelo podría emplearse en sistemas de selección de personal para extraer automáticamente la edad y el estado familiar de un currículum, aunque su uso plantea problemas éticos y legales en muchos países.
- **Análisis de datos demográficos**: podría utilizarse para estudiar correlaciones entre edad, estado civil y otras variables en conjuntos de CV anonimizados.
- **Automatización de formularios**: en entornos donde se requiere registrar la edad y el estado familiar de candidatos, el modelo podría ayudar a extraer esos campos de texto libre.
- **Investigación en HR tech**: como base para experimentos de clasificación de atributos personales en documentos de texto.
- **Pruebas de concepto**: para validar la viabilidad de modelos DeBERTa en tareas de clasificación de texto sobre CV.

Es importante destacar que estos casos de uso no están respaldados por documentación del autor y podrían incurrir en sesgos o problemas legales si se aplican en procesos reales de selección.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, HumanEval, GSM8K ni otras específicas de clasificación de texto. No se puede evaluar el rendimiento del modelo frente a otros sin datos.

## Requisitos de hardware

- **VRAM estimada**: para un modelo de 278 millones de parámetros, una inferencia en FP32 requeriría aproximadamente 1,1 GB de VRAM (278M × 4 bytes). Con cuantización a FP16 o int8, la huella sería menor (unos 0,6 GB en FP16). Sin embargo, no se han publicado pruebas oficiales.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM podría ejecutar el modelo en FP16. Modelos como RTX 2060, RTX 3060, RTX 4060 o superiores serían suficientes. Para lotes grandes o despliegue concurrente, se necesitaría más memoria.
- **Compatibilidad con GPU de consumo**: sí, cabe en GPU de consumo con al menos 4 GB de VRAM.
- **Opciones de despliegue**: al ser un modelo de transformers, se puede servir con vLLM, TGI, o mediante la API de Hugging Face Inference Endpoints. También se puede usar con la librería `transformers` en Python.
- **Latencia y throughput**: no se dispone de datos medidos.

## Comparativa con modelos similares

No se han encontrado modelos comparables directamente en la información proporcionada. El autor no ha publicado otros modelos con la misma tarea en su perfil de Hugging Face (aunque se mencionan otros modelos como `nli-multilabel-professionsalstatus-new` y `nli-multilabel-behavioral-new`, pero no se dispone de sus características). No se puede establecer una comparativa sin datos de rendimiento.

## Limitaciones y advertencias

- **Sesgos**: al no haber documentación sobre el dataset de entrenamiento, es imposible conocer los sesgos que pueda incorporar el modelo. La clasificación de edad y estado familiar a partir de CV puede perpetuar discriminaciones si no se entrena con datos equilibrados.
- **Alucinación**: al ser un clasificador de texto, no genera contenido abierto, pero puede producir etiquetas incorrectas si el texto de entrada no se ajusta a los patrones aprendidos.
- **Contexto y idioma**: no se especifican los idiomas soportados. Es probable que esté entrenado con datos en inglés u otros idiomas, pero no se puede confirmar.
- **Licencia**: la licencia no está definida. No se puede usar el modelo para fines comerciales sin riesgo legal.
- **Riesgos de producción**: la falta de documentación técnica (hiperparámetros, datos de entrenamiento, métricas) impide evaluar su robustez y fiabilidad. No se recomienda su uso en entornos productivos sin una validación exhaustiva.
- **Privacidad**: la extracción de datos personales de CV (edad, estado familiar) puede violar regulaciones como el GDPR en la UE. No se recomienda su uso para filtrar candidatos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/selsar/cv_age_family_status_v2)
- [Perfil del autor selsar en Hugging Face](https://huggingface.co/selsar)
- [Colección "Models to use" de selsar](https://huggingface.co/collections/selsar/models-to-use-6655924a420092799d9a5e9d)

No se han encontrado papers, repositorios de código ni demos asociados a este modelo.
