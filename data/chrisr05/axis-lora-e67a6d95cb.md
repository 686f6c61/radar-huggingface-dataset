# ChrisR05/axis-lora-e67a6d95cb

## Resumen

Axis LoRA es un conjunto de artefactos de investigación publicados por ChrisR05 bajo el identificador `ChrisR05/axis-lora-e67a6d95cb`. No se trata de un modelo base entrenado desde cero, sino de adaptadores LoRA (formato PEFT) y material auxiliar (respuestas evaluadas, registros de tiempos, metadatos de procedencia) generados en un experimento de proyección de pesos entre dos modelos base distintos. El repositorio no incluye los pesos base de origen ni de destino, por lo que los adaptadores solo son utilizables junto a sus modelos de referencia.

El experimento parte de `mistralai/Mistral-7B-Instruct-v0.3` como modelo fuente y `meta-llama/Llama-3.1-8B-Instruct` como modelo destino. El profesor y el juez del proceso son `Qwen/Qwen3-14B` en ambos roles. El objetivo declarado es la personalización del comportamiento del asistente (preferencias de respuesta), no la memorización de datos biográficos ni hechos personales, y se enmarca en investigación sobre interpretabilidad.

La relevancia es acotada: se trata de un artefacto experimental con 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados reproducidos y con licencia "other". Resulta útil como referencia metodológica para quien investigue transferencia de adaptadores entre arquitecturas o alineación de estilos de respuesta, pero no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only; base fuente Mistral-7B-Instruct-v0.3, base destino Llama-3.1-8B-Instruct |
| Parametros totales | no disponible (adaptadores LoRA; el tamaño depende del rango y módulos configurados, no especificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no declarada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | adaptadores PEFT (LoRA); los pesos base no se incluyen |

## Arquitectura y entrenamiento

El artefacto consiste en adaptadores LoRA de tipo PEFT, es decir, matrices de bajo rango inyectadas en capas del transformer base. La model card describe un proceso de "weight projection" entre un modelo fuente (`mistralai/Mistral-7B-Instruct-v0.3`) y un modelo destino (`meta-llama/Llama-3.1-8B-Instruct`), con `Qwen/Qwen3-14B` actuando simultáneamente como profesor y como juez de las respuestas generadas. No se detalla la configuración de LoRA (rango, alpha, módulos objetivo) ni el número de pasos de entrenamiento.

Los datos de entrenamiento combinan preguntas de Dolly (atribución CC-BY-SA-3.0 a Databricks) y campos de perfil de PersonaAtlas, procedentes de `HowieHwong/PPOpt-data` bajo Apache-2.0. El alcance declarado son únicamente preferencias de respuesta del asistente, sin biografías ni memorias factuales personales. El repositorio incluye `provenance.json` con revisiones fijadas, selección de datos y versiones exactas del entorno de ejecución, además de `metrics/summary.json` y `metrics/report.md` con los resultados una vez completado el proceso. No se documentan técnicas como RLHF, DPO ni decodificación especulativa.

## Capacidades

- Generación de texto condicionada por el adaptador LoRA, orientada a modificar el estilo y las preferencias de respuesta del asistente.
- Personalización de comportamiento: el adaptador se entrena sobre preferencias de respuesta, no sobre hechos personales.
- Transferencia entre modelos: el experimento proyecta el comportamiento aprendido desde un base Mistral-7B hacia un base Llama-3.1-8B.
- Evaluación automática mediante un modelo juez (`Qwen/Qwen3-14B`), con respuestas juzgadas incluidas en el repositorio.
- Registro de tiempos de ejecución (timing logs) para reproducibilidad del experimento.
- Soporte de tool calling, agentes, visión, audio o modo thinking: no disponible (no declarado).
- Capacidades multilingües: no disponibles (no declaradas).

## Casos de uso

- Investigación en interpretabilidad: el adaptador y los registros permiten estudiar cómo se representa y transfiere un eje de comportamiento (por ejemplo, estilo de respuesta) entre dos modelos base distintos, usando las métricas incluidas en `metrics/summary.json`.
- Estudio de transferencia de adaptadores entre arquitecturas: sirve para analizar la compatibilidad de un LoRA entrenado sobre Mistral-7B al aplicarse sobre Llama-3.1-8B, un escenario poco documentado en la literatura abierta.
- Replicación de experimentos de alineación de estilo: `provenance.json` fija revisiones y versiones de entorno, lo que facilita reproducir el pipeline con las mismas condiciones.
- Evaluación con modelo juez: el uso de `Qwen/Qwen3-14B` como profesor y juez puede reutilizarse como plantilla para montar pipelines de evaluación automática de preferencias.
- Docencia y formación: como ejemplo práctico de flujo PEFT completo (datos, entrenamiento, evaluación, registro de procedencia) para cursos de ajuste fino.
- Base para experimentos de personalización controlada: quien investigue la personalización de asistentes sin memorización de datos personales puede partir de esta configuración y sustituir los datos de Dolly y PersonaAtlas por su propio corpus.
- Producción: no recomendado; el artefacto es experimental y no incluye los pesos base ni garantías de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el benchmark y la proyección de pesos son experimentales y no constituyen reproducciones de benchmarks publicados. Los resultados del experimento se encuentran en `metrics/summary.json` y `metrics/report.md`, pero sus valores no se recogen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base sobre el que se aplique el adaptador. Mistral-7B-Instruct-v0.3 y Llama-3.1-8B-Instruct requieren, en precisión FP16, del orden de 14-16 GB de VRAM; en cuantización de 4 bits, aproximadamente 5-6 GB. Los adaptadores LoRA añaden una sobrecarga mínima.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluación a gran escala; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en FP16 de los modelos base de 7-8B.
- Cabe en GPU de consumo: sí, para los modelos base de 7-8B en cuantización de 4 u 8 bits (por ejemplo, RTX 3060 12 GB o superiores con GGUF). Los adaptadores LoRA en sí no imponen requisitos adicionales significativos.
- Opciones de despliegue: al ser adaptadores PEFT, se cargan con la librería `peft` sobre el modelo base correspondiente; para servicio, vLLM y TGI admiten adaptadores LoRA, y llama.cpp/Ollama requieren convertir el adaptador a GGUF.
- Latencia y throughput: no disponibles. El repositorio incluye timing logs, pero sus valores no se detallan en la información proporcionada.

## Comparativa con modelos similares

No disponible. No se conocen adaptadores LoRA públicos directamente comparables en propósito (proyección de pesos entre Mistral-7B y Llama-3.1-8B con profesor/juez Qwen3-14B) dentro de la información proporcionada. Como referencia de categoría, los adaptadores LoRA se comparan habitualmente con ajuste fino completo (mayor coste de memoria y almacenamiento) y con técnicas como QLoRA (cuantización del base durante el entrenamiento), pero no se dispone de datos de rendimiento de este artefacto para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Artefacto experimental: la propia model card advierte de que el benchmark y la proyección de pesos no son reproducciones de benchmarks publicados.
- Pesos base no incluidos: los adaptadores requieren `mistralai/Mistral-7B-Instruct-v0.3` y/o `meta-llama/Llama-3.1-8B-Instruct`, sujetos a los términos de sus repositorios oficiales (Llama 3.1 tiene licencia comunitaria con restricciones de uso).
- Licencia "other": no se especifican los términos exactos; es imprescindible revisar `provenance.json` y la licencia del repositorio antes de cualquier uso, especialmente comercial.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un adaptador de personalización de estilo, no corrige ni mitiga las alucinaciones del modelo base.
- Sesgos: no documentados. Los datos de Dolly y PersonaAtlas pueden introducir sesgos de estilo o de perfil que no se han analizado.
- Idiomas: no declarados; la cobertura lingüística dependerá de los modelos base y de los datos de entrenamiento, no especificados.
- Contexto: no declarado; se hereda del modelo base y no se garantiza que el adaptador preserve el comportamiento en ventanas largas.
- Sin métricas de calidad publicadas: no hay evidencia de que el adaptador mejore el rendimiento del base en tareas estándar; su uso en producción no está justificado por los datos disponibles.
- Reproducibilidad dependiente del entorno: las revisiones fijadas en `provenance.json` son necesarias para replicar el experimento.

## Enlaces

- Hugging Face: https://huggingface.co/ChrisR05/axis-lora-e67a6d95cb
- Modelo base fuente: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Modelo base destino: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Profesor y juez: https://huggingface.co/Qwen/Qwen3-14B
- Datos de perfil PersonaAtlas: https://huggingface.co/HowieHwong/PPOpt-data
- Dataset Dolly (Databricks): https://huggingface.co/datasets/databricks/databricks-dolly-15k
- Librería PEFT: https://github.com/huggingface/peft
