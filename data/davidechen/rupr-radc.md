# DavideChen/RUPR-RADC

## Resumen

RUPR-RADC es un conjunto de pesos de aprendizaje publicado por el usuario DavideChen en Hugging Face, orientado a tareas de verificación de hechos (fact-checking) multimodal. No se trata de un modelo fundacional completo, sino de un paquete de adaptadores y artefactos de calibración que se apoyan en dos modelos base de la familia Qwen: Qwen3.5-9B como lector (Reader) y Qwen3-VL-Reranker-8B como reranker de evidencias. El repositorio contiene un adaptador LoRA para el reordenamiento de evidencias (`rupr/`), un calibrador de decisiones sensible a relaciones (`radc.pt`), parámetros de preprocesamiento para lectura directa (`projection.npz`) y un fichero de receta bloqueada con sumas de verificación SHA256 (`locked_v1.json`).

El problema que aborda es el de la reordenación de evidencias y la calibración de las decisiones de un lector congelado en pipelines de verificación de afirmaciones. En lugar de entrenar un modelo de extremo a extremo, propone un esquema modular en el que un reranker selecciona y ordena las evidencias y un calibrador ajusta la confianza de la decisión final del lector sin modificar sus pesos. Es relevante para investigadores que trabajan en pipelines de fact-checking con recuperación aumentada, donde la calibración de la confianza y la selección de evidencias son cuellos de botella habituales.

La información pública disponible es muy limitada: el repositorio ocupa aproximadamente 0,1 GB, no registra descargas ni interacciones, y la model card está redactada principalmente en chino. No se publican detalles sobre el conjunto de datos de entrenamiento, el número de tokens, los idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (paquete de adaptadores LoRA y calibrador sobre modelos base Qwen; el reranker base es multimodal de tipo VL) |
| Parametros totales | No disponible (los pesos publicados son adaptadores y artefactos de calibración; los modelos base son de 9B y 8B) |
| Parametros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA), PyTorch (`radc.pt`), NumPy (`projection.npz`), JSON (`locked_v1.json`) |

## Arquitectura y entrenamiento

El paquete se compone de cuatro artefactos: un adaptador LoRA para el reranker de evidencias (`rupr/`), un calibrador de decisiones sensible a relaciones (`radc.pt`), parámetros de preprocesamiento para la lectura directa (`projection.npz`) y un fichero de receta fija con valores de verificación SHA256 (`locked_v1.json`). El esquema es modular: el reranker (basado en Qwen3-VL-Reranker-8B) ordena las evidencias, el lector congelado (basado en Qwen3.5-9B) emite una decisión y el calibrador ajusta la confianza de esa decisión. El lector no se reentrena; su comportamiento se modula mediante la calibración posterior.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales como decodificación especulativa o atención lineal. La model card indica explícitamente que los datos originales de noticias, las cachés web y las etiquetas de benchmark no forman parte del paquete publicado, y que la CLI completa de minería de datos y orquestación de entrenamiento no está incluida en esta versión. El paquete exige preparar por separado el lector Qwen, el reranker Qwen, CLIP y los datos de evaluación.

## Capacidades

- Reordenación de evidencias para pipelines de verificación de afirmaciones, mediante un adaptador LoRA sobre un reranker multimodal.
- Calibración de la confianza de decisiones de un lector congelado, ajustando la probabilidad emitida sin modificar los pesos del lector.
- Procesamiento multimodal heredado del reranker base Qwen3-VL-Reranker-8B (texto e imagen), si bien no se detallan las modalidades exactas soportadas por el adaptador.
- Integración en esquemas de recuperación aumentada con etapas separadas de recuperación, reordenación, lectura y calibración.
- Verificación de integridad de pesos mediante sumas SHA256 y receta fija (`locked_v1.json`).
- No se documentan capacidades de tool calling, agentes, modo thinking ni soporte multilingüe explícito.

## Casos de uso

- Verificación de afirmaciones en medios digitales: el adaptador de reordenación selecciona las evidencias más relevantes de un conjunto recuperado y el calibrador ajusta la confianza de la decisión final, lo que permite priorizar afirmaciones para revisión humana según su nivel de certeza.
- Moderación de contenido con trazabilidad de fuentes: el pipeline puede asociar cada decisión a las evidencias reordenadas, facilitando la auditoría de por qué un contenido se marcó como verdadero, falso o incierto.
- Investigación en calibración de modelos: el calibrador `radc.pt` permite estudiar cómo se comporta la confianza de un lector congelado ante distintos órdenes de evidencia sin reentrenar el modelo base.
- Evaluación reproducible de pipelines de fact-checking: la receta fija y las sumas SHA256 permiten replicar exactamente el estado de los pesos en experimentos comparativos.
- Sistemas de alerta temprana de desinformación: la combinación de reranker y calibrador puede desplegarse como etapa de filtrado previo a la revisión editorial, reduciendo el volumen de casos que llegan a un verificador humano.
- Integración en bases de conocimiento verificadas: el esquema modular permite sustituir el lector o el reranker por otras variantes de Qwen sin reentrenar el calibrador, lo que facilita la actualización del pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el paquete completo; depende de los modelos base (Qwen3.5-9B y Qwen3-VL-Reranker-8B), que en precisión de 16 bits requieren del orden de 18 GB y 16 GB respectivamente, aunque estos valores no están confirmados en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; los modelos base de 8-9B en cuantización de 4 bits podrían caber en GPUs de 24 GB, pero no se confirma en la documentación.
- Opciones de despliegue: el paquete se instala con `pip install -e .` y el script `scripts/download_weights.py`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RUPR-RADC | No disponible (adaptadores sobre bases de 9B y 8B) | No disponible | Reordenación de evidencias y calibración de lector congelado | Apache 2.0 | Hugging Face y GitHub |
| Qwen3.5-9B (base) | 9B | No disponible | Modelo fundacional de texto | No disponible en la información | Hugging Face |
| Qwen3-VL-Reranker-8B (base) | 8B | No disponible | Reranker multimodal | No disponible en la información | Hugging Face |

No se dispone de información sobre modelos comparables de fact-checking con calibración modular en la documentación proporcionada.

## Limitaciones y advertencias

- El paquete no incluye los modelos base, CLIP ni los datos de evaluación; es necesario prepararlos por separado, lo que añade complejidad de despliegue.
- No se publican datos de entrenamiento, benchmarks ni métricas de calibración, por lo que el rendimiento real es desconocido.
- La model card está redactada principalmente en chino y no documenta los idiomas soportados por el adaptador.
- Riesgo de alucinación inherente al lector base Qwen3.5-9B; el calibrador mitiga la confianza pero no elimina errores factuales.
- No se documentan sesgos conocidos ni evaluaciones de robustez.
- El repositorio no registra descargas ni interacciones, lo que sugiere ausencia de validación por parte de la comunidad.
- Aunque la licencia es Apache 2.0, las licencias de los modelos base deben verificarse por separado antes de un uso comercial.
- La CLI completa de minería de datos y orquestación de entrenamiento no está incluida, lo que limita la reproducibilidad del entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/DavideChen/RUPR-RADC
- GitHub: https://github.com/ruyasuihecrz-glitch/RUPR-RADC
- Interfaz de validación: https://github.com/ruyasuihecrz-glitch/RUPR-RADC/blob/main/docs/DRIFTBENCH_INTERFACE.md
- Modelo base lector: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo base reranker: https://huggingface.co/Qwen/Qwen3-VL-Reranker-8B
